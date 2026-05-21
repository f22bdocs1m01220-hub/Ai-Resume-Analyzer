import React from 'react';
import { motion } from 'framer-motion';
import './Footer.css';

function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.footer 
      className="footer"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      <div className="footer-container">
        <motion.div className="footer-section" variants={itemVariants}>
          <h4>About</h4>
          <p>AI Resume Analyzer helps you optimize your resume with advanced AI technology and industry insights.</p>
        </motion.div>
        
        <motion.div className="footer-section" variants={itemVariants}>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/analyze">Analyze Resume</a></li>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/about">About Us</a></li>
          </ul>
        </motion.div>
        
        <motion.div className="footer-section" variants={itemVariants}>
          <h4>Contact</h4>
          <p>Email: support@airesume.com</p>
          <p>Phone: +1 (555) 123-4567</p>
        </motion.div>
        
        <motion.div className="footer-section" variants={itemVariants}>
          <h4>Follow Us</h4>
          <div className="social-links">
            <a href="#">Facebook</a>
            <a href="#">Twitter</a>
            <a href="#">LinkedIn</a>
          </div>
        </motion.div>
      </div>
      
      <motion.div 
        className="footer-bottom"
        variants={itemVariants}
      >
        <p>&copy; 2026 AI Resume Analyzer. All rights reserved.</p>
      </motion.div>
    </motion.footer>
  );
}

export default Footer;
