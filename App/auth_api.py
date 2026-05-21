from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
import os
import jwt
import datetime
from passlib.context import CryptContext
from pyresparser import ResumeParser
import tempfile
import json
import time

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.environ.get('AUTH_SECRET', 'change_this_secret')

DB_CONFIG = dict(host='localhost', user='root', password='', db='cv', cursorclass=pymysql.cursors.DictCursor)


def get_connection():
    return pymysql.connect(**DB_CONFIG)


def ensure_users_table():
    sql = """
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    """
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()
    finally:
        conn.close()


@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json(force=True)
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    if not name or not email or not password:
        return jsonify({'error': 'Missing fields'}), 400

    hashed = pwd_context.hash(password)
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            try:
                cur.execute('INSERT INTO users (name, email, password) VALUES (%s, %s, %s)', (name, email, hashed))
                conn.commit()
                user_id = cur.lastrowid
            except pymysql.err.IntegrityError:
                return jsonify({'error': 'User with this email already exists'}), 409
    finally:
        conn.close()

    token = jwt.encode({'user_id': user_id, 'name': name, 'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)}, SECRET_KEY, algorithm='HS256')
    return jsonify({'token': token, 'user': {'id': user_id, 'name': name, 'email': email}})


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json(force=True)
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Missing fields'}), 400

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('SELECT id, name, email, password FROM users WHERE email=%s', (email,))
            user = cur.fetchone()
            if not user:
                return jsonify({'error': 'Invalid credentials'}), 401
            if not pwd_context.verify(password, user['password']):
                return jsonify({'error': 'Invalid credentials'}), 401
    finally:
        conn.close()

    token = jwt.encode({'user_id': user['id'], 'name': user['name'], 'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)}, SECRET_KEY, algorithm='HS256')
    return jsonify({'token': token, 'user': {'id': user['id'], 'name': user['name'], 'email': user['email']}})


@app.route('/api/verify', methods=['GET'])
def verify():
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return jsonify({'error': 'Missing token'}), 401
    token = auth.split(' ', 1)[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired'}), 401
    except Exception:
        return jsonify({'error': 'Invalid token'}), 401

    return jsonify({'user_id': payload.get('user_id'), 'name': payload.get('name')})


@app.route('/api/analyze', methods=['POST'])
def analyze():
    # Accept file upload and optional Authorization header
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400

    # save file to temp
    uploads_dir = os.path.join(os.path.dirname(__file__), 'Uploaded_Resumes')
    os.makedirs(uploads_dir, exist_ok=True)
    filename = f"{int(time.time())}_{file.filename}"
    save_path = os.path.join(uploads_dir, filename)
    file.save(save_path)

    # parse resume using pyresparser ResumeParser
    try:
        resume_data = ResumeParser(save_path).get_extracted_data()
    except Exception as e:
        return jsonify({'error': 'Failed to parse resume', 'details': str(e)}), 500

    # build simple analysis
    skills = resume_data.get('skills') or []
    no_of_pages = resume_data.get('no_of_pages') or 1
    # basic scoring heuristics
    score = min(95, 50 + len(skills) * 3)
    ats = 80 if resume_data.get('email') and resume_data.get('name') else 60

    resume_strength = {
        'Formatting': 80 + min(15, max(0, (no_of_pages - 1) * 5)),
        'Content': min(95, 60 + len(skills) * 2),
        'Experience': 70 if no_of_pages >= 2 else 60,
        'Skills': min(95, 50 + len(skills) * 4),
        'ATS Readiness': ats
    }

    # derive job suggestions from skills (simple mapping)
    job_suggestions = []
    if any('react' in s.lower() for s in skills):
        job_suggestions.append({'title': 'Frontend Engineer', 'company': 'Innovatech Labs', 'match': 92, 'badge': 'High Match'})
    if any(k in ' '.join(skills).lower() for k in ['data', 'analytics', 'machine']):
        job_suggestions.append({'title': 'Data Analyst', 'company': 'Bright Metrics', 'match': 88, 'badge': 'Great Fit'})
    if not job_suggestions:
        job_suggestions.append({'title': 'Product Specialist', 'company': 'CareerFlow', 'match': 78, 'badge': 'Recommended'})

    videos = [
        {'title': 'How to Write an ATS-Friendly Resume', 'channel': 'CareerXP', 'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'},
        {'title': 'Top Resume Tips for 2026', 'channel': 'ResumeMastery', 'url': 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ'}
    ]

    recommendations = []
    if len(skills) < 5:
        recommendations.append('Expand your skills section with measurable tools and frameworks')
    recommendations.extend(['Use action verbs', 'Add metrics to achievements', 'Use clear job titles and dates'])

    result = {
        'score': score,
        'atsCompatibility': ats,
        'keywords': len(skills),
        'resumeStrength': resume_strength,
        'skills': [{'name': s, 'level': 70 + min(30, len(s))} for s in skills],
        'jobSuggestions': job_suggestions,
        'videos': videos,
        'recommendations': recommendations,
    }

    # store to database (minimal fields)
    try:
        conn = get_connection()
        with conn.cursor() as cur:
            insert_sql = ("INSERT INTO user_data (sec_token, ip_add, host_name, dev_user, os_name_ver, latlong, city, state, country, "
                          "act_name, act_mail, act_mob, Name, Email_ID, resume_score, Timestamp, Page_no, Predicted_Field, User_level, Actual_skills, Recommended_skills, Recommended_courses, pdf_name) "
                          "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)")
            # minimal placeholders and default values
            vals = ('', '', '', '', '', '', '', '', '', resume_data.get('name') or '', resume_data.get('email') or '', '', resume_data.get('name') or '', resume_data.get('email') or '', str(score), str(int(time.time())), str(no_of_pages), '', '', ','.join(skills), ','.join(recommendations), ','.join([c['title'] for c in job_suggestions]), filename)
            cur.execute(insert_sql, vals)
            conn.commit()
    except Exception as e:
        # ignore DB errors but include warning
        result['db_error'] = str(e)
    finally:
        try:
            conn.close()
        except:
            pass

    return jsonify(result)


if __name__ == '__main__':
    ensure_users_table()
    app.run(host='0.0.0.0', port=8000, debug=True)
