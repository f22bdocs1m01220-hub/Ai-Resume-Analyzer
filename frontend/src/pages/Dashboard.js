import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Dashboard.css';

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const dashboardStats = [
    { label: 'Total Resumes Analyzed', value: '12', icon: '📊', color: '#6366f1' },
    { label: 'Average Score', value: '76.5', icon: '⭐', color: '#ec4899' },
    { label: 'Improvements Made', value: '48', icon: '📈', color: '#f59e0b' },
    { label: 'Jobs Applied', value: '23', icon: '💼', color: '#10b981' }
  ];

  const recentAnalyses = [
    { name: 'Resume_v1.pdf', date: '2026-05-20', score: 78, status: 'Completed' },
    { name: 'Resume_v2.pdf', date: '2026-05-19', score: 82, status: 'Completed' },
    { name: 'Resume_v3.pdf', date: '2026-05-18', score: 75, status: 'Completed' },
    { name: 'Resume_v4.pdf', date: '2026-05-17', score: 80, status: 'Completed' }
  ];

  const skillsData = [
    { skill: 'Python', level: 90 },
    { skill: 'JavaScript', level: 85 },
    { skill: 'React', level: 80 },
    { skill: 'Communication', level: 88 },
    { skill: 'Leadership', level: 75 },
    { skill: 'Problem Solving', level: 92 }
  ];

  return (
    <div className="dashboard-page">
      <motion.section 
        className="dashboard-hero"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container">
          <motion.h1 variants={itemVariants}>
            Your Career Dashboard
          </motion.h1>
          <motion.p variants={itemVariants}>
            Track your progress and manage your resume analysis history
          </motion.p>
        </div>
      </motion.section>

      {/* Stats Grid */}
      <section className="stats-grid-section">
        <div className="container">
          <motion.div 
            className="stats-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {dashboardStats.map((stat, index) => (
              <motion.div
                key={index}
                className="stat-widget"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                <div className="stat-header">
                  <span className="stat-icon">{stat.icon}</span>
                  <p className="stat-label">{stat.label}</p>
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-bar" style={{ backgroundColor: stat.color }} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="dashboard-content">
        <div className="container">
          <motion.div 
            className="tab-buttons"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              📈 Overview
            </button>
            <button
              className={`tab-btn ${activeTab === 'analyses' ? 'active' : ''}`}
              onClick={() => setActiveTab('analyses')}
            >
              📄 Recent Analyses
            </button>
            <button
              className={`tab-btn ${activeTab === 'skills' ? 'active' : ''}`}
              onClick={() => setActiveTab('skills')}
            >
              🎯 Skills
            </button>
          </motion.div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="tab-content"
            >
              <div className="overview-grid">
                <motion.div 
                  className="overview-card"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <h3>🎯 Career Goals</h3>
                  <p>Set and track your career objectives with personalized recommendations</p>
                  <ul className="goal-list">
                    <li>✓ Improve resume ATS score</li>
                    <li>✓ Increase interview callbacks</li>
                    <li>✓ Build in-demand skills</li>
                    <li>✓ Network with professionals</li>
                  </ul>
                </motion.div>

                <motion.div 
                  className="overview-card"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <h3>💡 Quick Tips</h3>
                  <p>Get actionable advice to improve your career prospects</p>
                  <div className="tips-list">
                    <div className="tip-item">
                      <span className="tip-number">1</span>
                      <p>Use action verbs in job descriptions</p>
                    </div>
                    <div className="tip-item">
                      <span className="tip-number">2</span>
                      <p>Quantify your achievements</p>
                    </div>
                    <div className="tip-item">
                      <span className="tip-number">3</span>
                      <p>Tailor resume for each application</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  className="overview-card full-width"
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                >
                  <h3>📊 Performance Trend</h3>
                  <div className="trend-chart">
                    <div className="trend-bars">
                      {[65, 72, 78, 82, 76, 80].map((value, index) => (
                        <motion.div
                          key={index}
                          className="trend-bar"
                          style={{ height: `${value}%` }}
                          initial={{ height: 0 }}
                          whileInView={{ height: `${value}%` }}
                          transition={{ delay: index * 0.1 }}
                          viewport={{ once: true }}
                        />
                      ))}
                    </div>
                    <p className="trend-note">Your resume score improvement over time</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Analyses Tab */}
          {activeTab === 'analyses' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="tab-content"
            >
              <div className="analyses-table">
                <table>
                  <thead>
                    <tr>
                      <th>Resume</th>
                      <th>Date</th>
                      <th>Score</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentAnalyses.map((analysis, index) => (
                      <motion.tr
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="analysis-row"
                      >
                        <td><span className="doc-icon">📄</span> {analysis.name}</td>
                        <td>{analysis.date}</td>
                        <td>
                          <motion.div 
                            className="score-badge"
                            whileHover={{ scale: 1.1 }}
                          >
                            {analysis.score}
                          </motion.div>
                        </td>
                        <td><span className="status-badge completed">{analysis.status}</span></td>
                        <td>
                          <motion.button 
                            className="action-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            View
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Skills Tab */}
          {activeTab === 'skills' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="tab-content"
            >
              <div className="skills-grid">
                {skillsData.map((skill, index) => (
                  <motion.div
                    key={index}
                    className="skill-card"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="skill-header">
                      <h4>{skill.skill}</h4>
                      <span className="skill-percentage">{skill.level}%</span>
                    </div>
                    <div className="skill-bar">
                      <motion.div
                        className="skill-fill"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        viewport={{ once: true }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="dashboard-cta">
        <div className="container">
          <motion.div 
            className="cta-box"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h3>Ready to Improve Your Resume?</h3>
            <p>Analyze a new version and track your progress</p>
            <motion.a 
              href="/analyze" 
              className="btn btn-primary"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Start New Analysis
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
