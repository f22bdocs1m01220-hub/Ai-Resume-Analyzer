import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './Navigation.css';

function Navigation({ user, onOpenLogin, onOpenSignup, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const linkVariants = {
    hover: { scale: 1.05, color: '#ec4899' }
  };

  return (
    <motion.nav 
      className="navbar"
      variants={navVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="nav-container">
        <Link to="/" className="logo">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="logo-text"
          >
            🚀 AI Resume Analyzer
          </motion.div>
        </Link>
        
        <div className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
          <motion.div variants={linkVariants} whileHover="hover">
            <Link to="/">Home</Link>
          </motion.div>
          <motion.div variants={linkVariants} whileHover="hover">
            <Link to="/analyze">Analyze</Link>
          </motion.div>
          <motion.div variants={linkVariants} whileHover="hover">
            <Link to="/dashboard">Dashboard</Link>
          </motion.div>
          <motion.div variants={linkVariants} whileHover="hover">
            <Link to="/about">About Us</Link>
          </motion.div>
        </div>
        <div className="nav-actions">
          {user ? (
            <div className="user-info">
              <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
              <div className="user-name">{user.name}</div>
              <button className="btn btn-ghost" onClick={onLogout}>Logout</button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn btn-ghost" onClick={onOpenLogin}>Login</button>
              <button className="btn btn-primary" onClick={onOpenSignup}>Sign Up</button>
            </div>
          )}

          <motion.button
            className="hamburger"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            ☰
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navigation;
