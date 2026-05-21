# AI Resume Analyzer - Setup Guide

A complete guide to setting up and running both the backend and frontend of the AI Resume Analyzer application.

## Prerequisites

- Node.js (v14 or higher)
- Python 3.7+
- MySQL/XAMPP (for database)
- Git

## Project Structure

```
AI-Resume-Analyzer/
├── App/                 # Python Streamlit backend
│   ├── App.py
│   ├── Courses.py
│   ├── requirements.txt
│   └── ...
├── frontend/            # React frontend (NEW)
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
└── pyresparser/
```

## Backend Setup (Streamlit + Python)

### 1. Install Python Dependencies

```bash
cd App
pip install -r requirements.txt
```

### 2. Configure MySQL Connection

Edit `App.py` and update the MySQL connection string:

```python
connection = pymysql.connect(
    host='localhost',
    user='root',
    password='',  # Your MySQL password
    db='cv'
)
```

### 3. Start Streamlit Backend

```bash
streamlit run App.py
```

The backend will run on `http://localhost:8501`

### 3b. Start Auth API (new)

An auth API is provided at `App/auth_api.py` to handle signup/login using JWT and MySQL.

Install updated backend requirements and run the auth API in a separate terminal:

```bash
cd App
pip install -r requirements.txt
python auth_api.py
```

The auth API will run on `http://localhost:8000` and exposes:
- `POST /api/signup` - create account (body: `name`, `email`, `password`)
- `POST /api/login` - sign in (body: `email`, `password`)
- `GET /api/verify` - verify token (Authorization: `Bearer <token>`)

## Frontend Setup (React)

### 1. Install Node Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm start
```

The frontend will open automatically at `http://localhost:3000`

## Running Both Simultaneously

You can run the backend and frontend in separate terminals:

**Terminal 1 - Backend:**
```bash
cd App
streamlit run App.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## Features

### Home Page
- Hero section with call-to-action
- Feature showcase with animations
- Stats section showing platform metrics
- How-it-works guide
- Benefits section
- Trust indicators

### Analyze Page
- Drag-and-drop resume upload
- File validation
- Real-time analysis results
- Score visualization
- Recommendations display

### Dashboard
- Resume analysis history
- Performance metrics
- Skills tracking
- Career statistics
- Trend visualization
- Analysis table

### About Us Page
- Mission statement
- Core values
- Team bios
- Technology stack
- Company timeline
- Call-to-action

## Animations & Interactions

- Page load animations with Framer Motion
- Hover effects on cards
- Smooth page transitions
- Scroll animations
- Interactive elements
- Loading states

## Color Scheme

```
Primary: #6366f1 (Indigo)
Secondary: #ec4899 (Pink)
Accent: #f59e0b (Amber)
Dark: #1f2937 (Dark Gray)
Light: #f9fafb (Off White)
Success: #10b981 (Green)
```

## Database Setup

### Create Database
```sql
CREATE DATABASE cv;
USE cv;
```

### Create Tables
Ensure all required tables are created in your MySQL database. You can find the schema in the backend documentation.

## Deployment

### Frontend Build
```bash
cd frontend
npm run build
```

This creates an optimized production build in the `build` folder.

### Environment Variables

Create a `.env` file in the frontend folder:

```
REACT_APP_API_URL=http://localhost:8501
REACT_APP_ENV=development
```

## Troubleshooting

### Port Already in Use
If port 3000 or 8501 is already in use:

```bash
# Kill process on port 3000
npm start -- --port 3001

# For Streamlit, edit ~/.streamlit/config.toml
# Set: server.port = 8502
```

### MySQL Connection Error
- Ensure MySQL/XAMPP is running
- Check credentials in App.py
- Verify database `cv` exists

### Package Installation Issues
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Performance Tips

- Use React DevTools extension for optimization
- Enable CSS animations selectively
- Lazy load images and components
- Monitor bundle size: `npm run build -- --analyze`

## Security

- Keep dependencies updated: `npm audit fix`
- Use environment variables for sensitive data
- Validate all user inputs
- Implement CORS properly

## Support & Resources

- React Documentation: https://react.dev
- Framer Motion: https://www.framer.com/motion/
- Streamlit: https://streamlit.io/docs

## License

MIT License - 2026 AI Resume Analyzer

## Contact

For issues or questions:
- Email: support@airesume.com
- GitHub Issues: [Your repo link]
