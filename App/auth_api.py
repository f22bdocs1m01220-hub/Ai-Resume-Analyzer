from flask import Flask, request, jsonify
from flask_cors import CORS
import pymysql
import os
import jwt
import datetime
from passlib.context import CryptContext
import tempfile
import json
import time
import sqlite3

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
SECRET_KEY = os.environ.get('AUTH_SECRET', 'change_this_secret')

DB_CONFIG = dict(host='localhost', user='root', password='', db='cv', cursorclass=pymysql.cursors.DictCursor)

# If MySQL is not available, fall back to a local SQLite DB for user auth
USE_SQLITE = False
SQLITE_DB_PATH = os.path.join(os.path.dirname(__file__), 'users_fallback.db')


def get_connection():
    # Try MySQL first
    try:
        return pymysql.connect(**DB_CONFIG)
    except Exception:
        # Fall back to sqlite connection
        conn = sqlite3.connect(SQLITE_DB_PATH, timeout=10)
        conn.row_factory = sqlite3.Row
        return conn


def ensure_users_table():
    global USE_SQLITE
    conn = None
    try:
        conn = get_connection()
        # If this is a sqlite3 connection, create sqlite table
        if isinstance(conn, sqlite3.Connection):
            USE_SQLITE = True
            with conn:
                conn.execute(
                    """
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        name TEXT NOT NULL,
                        email TEXT NOT NULL UNIQUE,
                        password TEXT NOT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                    """
                )
        else:
            # assume pymysql connection
            sql = """
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
            with conn.cursor() as cur:
                cur.execute(sql)
            conn.commit()
    finally:
        try:
            if conn:
                conn.close()
        except Exception:
            pass


def create_user_record(name, email, hashed):
    conn = get_connection()
    try:
        if isinstance(conn, sqlite3.Connection):
            cur = conn.cursor()
            cur.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', (name, email, hashed))
            conn.commit()
            return cur.lastrowid
        else:
            with conn.cursor() as cur:
                cur.execute('INSERT INTO users (name, email, password) VALUES (%s, %s, %s)', (name, email, hashed))
                conn.commit()
                return cur.lastrowid
    finally:
        conn.close()


def get_user_by_email(email):
    conn = get_connection()
    try:
        if isinstance(conn, sqlite3.Connection):
            cur = conn.cursor()
            cur.execute('SELECT id, name, email, password FROM users WHERE email=?', (email,))
            row = cur.fetchone()
            if not row:
                return None
            return {'id': row['id'], 'name': row['name'], 'email': row['email'], 'password': row['password']}
        else:
            with conn.cursor() as cur:
                cur.execute('SELECT id, name, email, password FROM users WHERE email=%s', (email,))
                row = cur.fetchone()
                return row
    finally:
        conn.close()


def get_user_by_id(user_id):
    conn = get_connection()
    try:
        if isinstance(conn, sqlite3.Connection):
            cur = conn.cursor()
            cur.execute('SELECT id, name, email FROM users WHERE id=?', (user_id,))
            row = cur.fetchone()
            if not row:
                return None
            return {'id': row['id'], 'name': row['name'], 'email': row['email']}
        else:
            with conn.cursor() as cur:
                cur.execute('SELECT id, name, email FROM users WHERE id=%s', (user_id,))
                row = cur.fetchone()
                return row
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
    try:
        user_id = create_user_record(name, email, hashed)
    except Exception as e:
        # Likely unique constraint violation
        return jsonify({'error': 'User with this email already exists'}), 409

    token = jwt.encode({'user_id': user_id, 'name': name, 'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)}, SECRET_KEY, algorithm='HS256')
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    return jsonify({'token': token, 'user': {'id': user_id, 'name': name, 'email': email}})


@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json(force=True)
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'error': 'Missing fields'}), 400

    user = get_user_by_email(email)
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401
    if not pwd_context.verify(password, user['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    token = jwt.encode({'user_id': user['id'], 'name': user['name'], 'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)}, SECRET_KEY, algorithm='HS256')
    if isinstance(token, bytes):
        token = token.decode('utf-8')
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


@app.route('/api/profile', methods=['GET','PUT'])
def profile():
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

    user_id = payload.get('user_id')
    if request.method == 'GET':
        user = get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        return jsonify({'user': {'id': user['id'], 'name': user['name'], 'email': user['email']}})

    # PUT -> update profile fields
    data = request.get_json(force=True)
    new_name = data.get('name')
    new_email = data.get('email')
    new_password = data.get('password')

    try:
        conn = get_connection()
        if isinstance(conn, sqlite3.Connection):
            cur = conn.cursor()
            if new_password:
                hashed = pwd_context.hash(new_password)
                cur.execute('UPDATE users SET name=?, email=?, password=? WHERE id=?', (new_name, new_email, hashed, user_id))
            else:
                cur.execute('UPDATE users SET name=?, email=? WHERE id=?', (new_name, new_email, user_id))
            conn.commit()
        else:
            with conn.cursor() as cur:
                if new_password:
                    hashed = pwd_context.hash(new_password)
                    cur.execute('UPDATE users SET name=%s, email=%s, password=%s WHERE id=%s', (new_name, new_email, hashed, user_id))
                else:
                    cur.execute('UPDATE users SET name=%s, email=%s WHERE id=%s', (new_name, new_email, user_id))
                conn.commit()
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print(tb)
        return jsonify({'error': tb}), 500
    finally:
        try:
            conn.close()
        except:
            pass

    # return updated info and advise client to update local storage
    return jsonify({'user': {'id': user_id, 'name': new_name, 'email': new_email}})


@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    # return summary stats and recent analyses
    try:
        conn = get_connection()
        rows = []

        if isinstance(conn, sqlite3.Connection):
            cur = conn.cursor()
            cur.execute('SELECT ID, pdf_name, Timestamp, resume_score, Actual_skills FROM user_data ORDER BY ID DESC LIMIT 50')
            raw = cur.fetchall()
            for r in raw:
                rid = r[0]
                pname = r[1]
                ts = r[2]
                rscore = r[3]
                rskills = r[4]
                if isinstance(pname, (bytes, bytearray)):
                    pname = pname.decode(errors='ignore')
                if isinstance(ts, (bytes, bytearray)):
                    ts = ts.decode(errors='ignore')
                if isinstance(rskills, (bytes, bytearray)):
                    rskills = rskills.decode(errors='ignore')
                rows.append({'id': rid, 'pdf_name': pname, 'timestamp': ts, 'score': int(rscore) if rscore and str(rscore).isdigit() else None, 'skills': rskills or ''})
            cur.execute('SELECT COUNT(*) FROM user_data')
            total = cur.fetchone()[0] or 0
        else:
            with conn.cursor() as cur:
                cur.execute('SELECT ID, pdf_name, Timestamp, resume_score, Actual_skills FROM user_data ORDER BY ID DESC LIMIT 50')
                raw = cur.fetchall()
                for r in raw:
                    if isinstance(r, dict):
                        lower = {k.lower(): v for k, v in r.items()}
                        rid = lower.get('id')
                        pname = lower.get('pdf_name') or lower.get('pdfname')
                        ts = lower.get('timestamp') or lower.get('time_stamp')
                        rscore = lower.get('resume_score')
                        rskills = lower.get('actual_skills') or lower.get('actualskills')
                    else:
                        rid = r[0]
                        pname = r[1]
                        ts = r[2]
                        rscore = r[3]
                        rskills = r[4]
                    if isinstance(pname, (bytes, bytearray)):
                        pname = pname.decode(errors='ignore')
                    if isinstance(ts, (bytes, bytearray)):
                        ts = ts.decode(errors='ignore')
                    if isinstance(rskills, (bytes, bytearray)):
                        rskills = rskills.decode(errors='ignore')
                    rows.append({'id': rid, 'pdf_name': pname, 'timestamp': ts, 'score': int(rscore) if rscore and str(rscore).isdigit() else None, 'skills': rskills or ''})
                cur.execute('SELECT COUNT(*) FROM user_data')
                stat = cur.fetchone()
                if isinstance(stat, dict):
                    total = next(iter(stat.values())) or 0
                else:
                    total = stat[0] or 0

        # compute average score from rows
        scores = [r['score'] for r in rows if isinstance(r.get('score'), int)]
        avg = int(sum(scores) / len(scores)) if scores else 0

        # aggregate top skills from recent rows
        skill_counts = {}
        for r in rows:
            sk = (r.get('skills') or '')
            for s in str(sk).split(','):
                s = s.strip().lower()
                if not s:
                    continue
                skill_counts[s] = skill_counts.get(s, 0) + 1

        top_skills = sorted([{'skill': k, 'count': v} for k, v in skill_counts.items()], key=lambda x: x['count'], reverse=True)[:10]

        return jsonify({'total_resumes': total, 'avg_score': avg, 'recent': rows, 'top_skills': top_skills})
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        print('dashboard error:', tb)
        return jsonify({'error': str(e), 'trace': tb}), 500
    finally:
        try:
            conn.close()
        except:
            pass


@app.route('/api/analysis/<int:row_id>', methods=['GET'])
def get_analysis(row_id):
    try:
        conn = get_connection()
        if isinstance(conn, sqlite3.Connection):
            cur = conn.cursor()
            cur.execute('SELECT ID, pdf_name, Timestamp, resume_score, Actual_skills, Recommended_skills, Recommended_courses FROM user_data WHERE ID=?', (row_id,))
            r = cur.fetchone()
            if not r:
                return jsonify({'error': 'Not found'}), 404
            # sqlite row: indexable
            rid = r[0]
            pdf_name = r[1]
            timestamp = r[2]
            score = r[3]
            skills = r[4]
            recommended = r[5]
            courses = r[6]
            # coerce bytes if needed
            if isinstance(pdf_name, (bytes, bytearray)):
                pdf_name = pdf_name.decode(errors='ignore')
            return jsonify({'id': rid, 'pdf_name': pdf_name, 'timestamp': timestamp, 'score': score, 'skills': skills, 'recommended': recommended, 'courses': courses})
        else:
            with conn.cursor() as cur:
                cur.execute('SELECT ID, pdf_name, Timestamp, resume_score, Actual_skills, Recommended_skills, Recommended_courses FROM user_data WHERE ID=%s', (row_id,))
                r = cur.fetchone()
                if not r:
                    return jsonify({'error': 'Not found'}), 404
                # pymysql DictCursor returns dict; handle both dict and sequence
                if isinstance(r, dict):
                    lower = {k.lower(): v for k, v in r.items()}
                    rid = lower.get('id')
                    pdf_name = lower.get('pdf_name') or lower.get('pdfname')
                    timestamp = lower.get('timestamp')
                    score = lower.get('resume_score')
                    skills = lower.get('actual_skills') or lower.get('actualskills')
                    recommended = lower.get('recommended_skills') or lower.get('recommendedskills')
                    courses = lower.get('recommended_courses') or lower.get('recommendedcourses')
                else:
                    rid = r[0]
                    pdf_name = r[1]
                    timestamp = r[2]
                    score = r[3]
                    skills = r[4]
                    recommended = r[5]
                    courses = r[6]
                # coerce bytes to str for JSON
                def _coerce(v):
                    if isinstance(v, (bytes, bytearray)):
                        try:
                            return v.decode()
                        except Exception:
                            return v.decode(errors='ignore')
                    return v

                pdf_name = _coerce(pdf_name)
                timestamp = _coerce(timestamp)
                score = _coerce(score)
                skills = _coerce(skills)
                recommended = _coerce(recommended)
                courses = _coerce(courses)
                return jsonify({'id': rid, 'pdf_name': pdf_name, 'timestamp': timestamp, 'score': score, 'skills': skills, 'recommended': recommended, 'courses': courses})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        try:
            conn.close()
        except:
            pass


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

    # Extract text from PDF and perform simple keyword-based skill extraction
    resume_text = ""
    try:
        from pdfminer.high_level import extract_text
        resume_text = extract_text(save_path) or ""
    except Exception:
        try:
            # fallback: read file as text
            with open(save_path, 'rb') as f:
                resume_text = f.read().decode(errors='ignore')
        except Exception:
            resume_text = ""

    # Define a comprehensive skill keyword list (merge common skills)
    skill_keywords = [
        'python','java','c++','c#','javascript','react','reactjs','angular','vue','node','nodejs','django','flask',
        'sql','mysql','postgresql','mongodb','git','docker','kubernetes','aws','azure','gcp','tensorflow','keras','pytorch',
        'pandas','numpy','scikit-learn','machine learning','deep learning','data science','spark','hadoop','html','css',
        'typescript','php','laravel','swift','kotlin','android','ios','flutter','figma','ux','ui','photoshop','illustrator',
        'docker','linux','bash','shell','rest','graphql','aws','azure','gcp','excel','powerpoint','communication',
        # marketing and digital skills
        'marketing','digital marketing','email marketing','content marketing','social media','seo','sem','ppc','paid search','google ads','facebook ads','google analytics','analytics','marketing automation','hubspot','mailchimp'
    ]

    # maintain skills as objects with origin so frontend can show badges
    found_skills = []
    def add_skill(name, origin):
        n = name.strip().lower()
        for s in found_skills:
            if s['name'] == n:
                # prefer section-origin over others
                if origin == 'section' and s.get('origin') != 'section':
                    s['origin'] = origin
                return
        found_skills.append({'name': n, 'origin': origin})

    lower_text = resume_text.lower()
    for kw in skill_keywords:
        # match whole words roughly
        if kw in lower_text:
            add_skill(kw, 'keyword')

    # Try to enhance extraction using spaCy (ner, noun chunks)
    try:
        import spacy
        nlp = spacy.load('en_core_web_sm')
        doc = nlp(resume_text)
        # extract candidate skill phrases from noun chunks and entities
        candidates = set()
        for chunk in doc.noun_chunks:
            candidates.add(chunk.text.lower())
        for ent in doc.ents:
            candidates.add(ent.text.lower())
        # match candidates against skill keywords
        for cand in candidates:
            for kw in skill_keywords:
                if kw in cand:
                    add_skill(kw, 'nlp')
    except Exception:
        # spaCy not available or failed — ignore
        pass

    # Parse explicit "Skills" section if present (handles bullet lists and inline separators)
    try:
        import re
        skills_section = []
        m = re.search(r'\bskills\b[:\s\n-]*', resume_text, re.IGNORECASE)
        if m:
            start = m.end()
            tail = resume_text[start:start+2000]  # inspect following content
            # stop at next section header (all-caps word with newline) or double newline
            stop = re.search(r'\n\s*\n|\n[A-Z\s]{3,}\n', tail)
            snippet = tail if not stop else tail[:stop.start()]
            # split by common separators used in skill lists
            parts = re.split(r'[\n,\|•·\t;–\u2022\u2013\u2014/]', snippet)
            for p in parts:
                tok = p.strip().lower()
                if len(tok) > 1 and len(tok) < 60:
                    skills_section.append(tok)
        # merge skills_section with found_skills using fuzzy matching
        if skills_section:
            from difflib import get_close_matches
            for tok in skills_section:
                # try exact substring match first
                matched = False
                for kw in skill_keywords:
                    if kw in tok or tok in kw:
                        add_skill(kw, 'section')
                        matched = True
                        break
                if matched:
                    continue
                # fuzzy match against keywords
                close = get_close_matches(tok, skill_keywords, n=1, cutoff=0.7)
                if close:
                    add_skill(close[0], 'section')
                else:
                    # if it's a meaningful token (like 'employee relations'), keep it as-is
                    add_skill(tok, 'section')
    except Exception:
        pass

    # try to extract name and email with simple heuristics
    name = ''
    email = ''
    import re
    m = re.search(r'([\w\.-]+@[\w\.-]+)', resume_text)
    if m:
        email = m.group(1)

    m = re.search(r'Name\s*[:\-]\s*([A-Za-z \,\.]+)', resume_text, re.IGNORECASE)
    if m:
        name = m.group(1).strip()

    resume_data = {'skills': found_skills, 'no_of_pages': 1, 'name': name, 'email': email}

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

    # derive job suggestions from skills using profile matching (score and top 3)
    job_profiles = {
        'Frontend Engineer': ['react','reactjs','javascript','html','css','typescript','angular','vue'],
        'Data Scientist': ['python','pandas','numpy','scikit-learn','tensorflow','pytorch','machine learning','deep learning'],
        'Backend Engineer': ['python','django','flask','node','nodejs','java','sql','postgresql','mysql','rest','api','graphql'],
        'DevOps Engineer': ['docker','kubernetes','aws','azure','gcp','ci','cd','linux'],
        'Mobile Developer': ['android','kotlin','swift','ios','flutter','react native'],
        'UI/UX Designer': ['figma','ux','ui','photoshop','illustrator']
    }

    job_suggestions = []
    skill_set = set(s['name'] for s in skills)
    for title, reqs in job_profiles.items():
        req_set = set(reqs)
        matches = skill_set.intersection(req_set)
        if not reqs:
            continue
        job_score = int((len(matches) / len(req_set)) * 100)
        if job_score > 0:
            badge = 'Recommended'
            if job_score >= 80:
                badge = 'High Match'
            elif job_score >= 60:
                badge = 'Great Fit'
            job_suggestions.append({'title': title, 'company': 'Acme Corp', 'match': job_score, 'badge': badge, 'matched_skills': list(matches)})

    # pick top 3 suggestions sorted by match
    job_suggestions = sorted(job_suggestions, key=lambda x: x['match'], reverse=True)[:3]
    if not job_suggestions:
        job_suggestions = [{'title': 'Product Specialist', 'company': 'CareerFlow', 'match': 50, 'badge': 'Recommended'}]

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
        'skills': [
            {
                'name': s['name'],
                'level': 70 + min(30, len(s['name'])),
                'origin': s.get('origin', 'unknown')
            } for s in skills
        ],
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
            vals = ('', '', '', '', '', '', '', '', '', resume_data.get('name') or '', resume_data.get('email') or '', '', resume_data.get('name') or '', resume_data.get('email') or '', str(score), str(int(time.time())), str(no_of_pages), '', '', ','.join([s['name'] for s in skills]), ','.join(recommendations), ','.join([c['title'] for c in job_suggestions]), filename)
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
    # run on port 8000 to match frontend expectations
    app.run(host='0.0.0.0', port=8000, debug=True)
