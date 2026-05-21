# AI Resume Analyzer - React Frontend

A modern, animated React-based frontend for the AI Resume Analyzer application with Framer Motion animations and beautiful UI.

## Features

✨ **Modern Design** - Beautiful gradient themes and smooth animations
🎨 **Framer Motion** - Smooth page transitions and interactive elements
📱 **Responsive** - Works perfectly on desktop, tablet, and mobile
🚀 **Fast** - Optimized performance and loading times
🎯 **User-Friendly** - Intuitive navigation and clear CTAs

## Tech Stack

- **React 18** - UI framework
- **React Router** - Navigation
- **Framer Motion** - Animations
- **Axios** - API calls
- **CSS3** - Styling with modern features

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open in your browser at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navigation.js
│   │   ├── Navigation.css
│   │   ├── Footer.js
│   │   └── Footer.css
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Home.css
│   │   ├── Analyze.js
│   │   ├── Analyze.css
│   │   ├── Dashboard.js
│   │   ├── Dashboard.css
│   │   ├── AboutUs.js
│   │   └── AboutUs.css
│   ├── styles/
│   │   └── global.css
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## Pages

### Home
Landing page with hero section, features showcase, and call-to-action buttons.

### Analyze
Resume upload and analysis page with drag-and-drop functionality and real-time results.

### Dashboard
User dashboard showing analysis history, skills, and progress tracking.

### About Us
Information about the platform, team, values, and company journey.

## API Integration

To connect with the backend API, update the API endpoints in the components:

```javascript
const API_URL = 'http://localhost:8000/api';
```

## Customization

### Colors
Edit the CSS variables in `src/styles/global.css`:

```css
:root {
  --primary: #6366f1;
  --secondary: #ec4899;
  --accent: #f59e0b;
  --dark: #1f2937;
  --light: #f9fafb;
}
```

### Animations
Modify animation durations and effects in component files using Framer Motion props.

## Performance Optimization

- Code splitting with React.lazy
- Image optimization
- CSS animations with GPU acceleration
- Lazy loading of components

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this project for personal and commercial purposes.

## Support

For issues and questions, please contact: support@airesume.com
