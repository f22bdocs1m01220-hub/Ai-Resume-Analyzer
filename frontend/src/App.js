import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AboutUs from './pages/AboutUs';
import Analyze from './pages/Analyze';
import Profile from './pages/Profile';
import AnalysisView from './pages/AnalysisView';
import './styles/global.css';
import { getUser, setAuth, clearAuth } from './utils/auth';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const u = getUser();
    if (u) setUser(u);
  }, []);

  const handleLogin = (token, userData) => {
    setAuth(token, userData);
    setUser(userData);
    setShowLogin(false);
  };

  const handleSignup = (token, userData) => {
    setAuth(token, userData);
    setUser(userData);
    setShowSignup(false);
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
  };

  return (
    <Router>
      <div className="app">
        <Navigation 
          user={user}
          onOpenLogin={() => setShowLogin(true)}
          onOpenSignup={() => setShowSignup(true)}
          onLogout={handleLogout}
        />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/analysis/:id" element={<AnalysisView />} />
            <Route path="/profile" element={<Profile onUpdateUser={(u) => setUser(u)} />} />
          </Routes>
        </AnimatePresence>
        <Footer />
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />}
        {showSignup && <SignupModal onClose={() => setShowSignup(false)} onSignup={handleSignup} />}
      </div>
    </Router>
  );
}

export default App;
