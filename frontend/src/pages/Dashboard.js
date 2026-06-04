import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { getToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
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

  const [dashboardStats, setDashboardStats] = useState([ ]);
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
  const [pollIntervalMs] = useState(5000);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  // helper to format timestamps (seconds or ms) and date strings
  const formatDate = (v) => {
    if (!v) return '—';
    // if it's already a human-readable string (contains letters or colons), return it
    if (typeof v === 'string' && /[a-zA-Z,:]/.test(v)) return v;
    let n = Number(v);
    if (Number.isNaN(n)) return String(v);
    // detect seconds vs milliseconds
    if (n < 1e12) n = n * 1000;
    try {
      const d = new Date(n);
      return d.toLocaleString();
    } catch (e) {
      return String(v);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/dashboard');
        if (!mounted) return;
        if (res.data) {
          setDashboardStats([
            { label: 'Total Resumes Analyzed', value: res.data.total_resumes || 0, icon: '📊', color: '#6366f1' },
            { label: 'Average Score', value: res.data.avg_score || 0, icon: '⭐', color: '#ec4899' },
            { label: 'Recent Analyses', value: (res.data.recent || []).length, icon: '📈', color: '#f59e0b' },
            { label: 'Top Skills', value: (res.data.top_skills || []).slice(0,3).map(s=>s.skill).join(', '), icon: '💼', color: '#10b981' }
          ]);
          setRecentAnalyses(res.data.recent || []);
          setSkillsData((res.data.top_skills || []).map(s => ({ skill: s.skill, level: Math.min(95, 50 + s.count * 10) })));
        }
      } catch (e) {
        console.error('Failed to load dashboard', e);
      }
    };

    // initial load
    fetchData();
    // listen for explicit refresh events
    window.addEventListener('dashboardRefresh', fetchData);
    // poll for updates
    const id = setInterval(fetchData, pollIntervalMs);
    return () => {
      mounted = false;
      clearInterval(id);
      window.removeEventListener('dashboardRefresh', fetchData);
    };
  }, [pollIntervalMs]);

  // scroll to the analysis panel when selectedAnalysis changes
  useEffect(() => {
    if (selectedAnalysis) {
      // wait for the DOM to render the panel, retry until present (max ~1s)
      let tries = 0;
      const tryScroll = () => {
        const el = document.getElementById('analysis-panel');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        tries += 1;
        if (tries < 8) {
          setTimeout(tryScroll, 120);
        }
      };
      tryScroll();
    }
  }, [selectedAnalysis]);

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
                        <td><span className="doc-icon">📄</span> {analysis.pdf_name || analysis.pdf}</td>
                        <td>{formatDate(analysis.timestamp || analysis.date)}</td>
                        <td>
                          <motion.div 
                            className="score-badge"
                            whileHover={{ scale: 1.1 }}
                          >
                            {analysis.score}
                          </motion.div>
                        </td>
                        <td><span className="status-badge completed">Completed</span></td>
                        <td>
                          <motion.button 
                            className="action-btn"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={async () => {
                                // robust id handling and improved error reporting in modal
                                const aid = analysis.id ?? analysis.ID ?? analysis.Id;
                                console.debug('View clicked, analysis id:', aid);
                                // ensure analyses tab active so table remains visible
                                setActiveTab('analyses');
                                if (!aid) {
                                  setSelectedAnalysis({ error: 'Missing analysis id' });
                                  setModalOpen(true);
                                  return;
                                }
                                // navigate to the dedicated analysis page for a cleaner view
                                if (aid) {
                                  navigate(`/analysis/${aid}`);
                                } else {
                                  setSelectedAnalysis({ error: 'Missing analysis id' });
                                  setModalOpen(true);
                                }
                              }}
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

      {/* Simple Modal for analysis details */}
      {modalOpen && selectedAnalysis && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Analysis Details</h3>
              <button className="close-btn" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <div className="modal-body">
              {selectedAnalysis.error ? (
                <div>
                  <p style={{ color: '#fecaca' }}><strong>Error:</strong> {selectedAnalysis.error}</p>
                  {selectedAnalysis.trace && (
                    <pre style={{ whiteSpace: 'pre-wrap', color: '#f3f4f6', fontSize: '0.8rem' }}>{selectedAnalysis.trace}</pre>
                  )}

                      {/* Bottom inline Analysis Panel (visible when an analysis is selected) */}
                      {selectedAnalysis && (
                        <section id="analysis-panel" className="analysis-panel">
                          <div className="container">
                            <div className="analysis-panel-inner">
                              <div className="analysis-panel-header">
                                <h2>Analysis Details</h2>
                                <button className="close-btn" onClick={() => setSelectedAnalysis(null)}>✕</button>
                              </div>
                              {selectedAnalysis.error ? (
                                <div className="analysis-error">{selectedAnalysis.error}
                                  {selectedAnalysis.trace && <pre className="analysis-trace">{selectedAnalysis.trace}</pre>}
                                </div>
                              ) : (
                                <div className="analysis-card">
                                  <div className="analysis-row-top">
                                    <div className="analysis-file"><strong>File:</strong> {selectedAnalysis.pdf_name || selectedAnalysis.pdf || '—'}</div>
                                    <div className="analysis-score"><strong>Score:</strong> <span className="score-badge-inline">{selectedAnalysis.score ?? '—'}</span></div>
                                  </div>
                                  <div className="analysis-meta"><strong>Date:</strong> {formatDate(selectedAnalysis.timestamp || selectedAnalysis.date)}</div>
                                  <div className="analysis-skills"><strong>Skills:</strong>
                                    <div className="skill-badges">
                                      {((selectedAnalysis.skills || selectedAnalysis.Actual_skills || '') + '')
                                        .split(',')
                                        .map(s => s.trim())
                                        .filter(Boolean)
                                        .map((s, i) => (
                                          <span className="skill-badge" key={i}>{s}</span>
                                        ))}
                                      {(!selectedAnalysis.skills && !selectedAnalysis.Actual_skills) && (<span className="skill-none">No skills detected</span>)}
                                    </div>
                                  </div>
                                  <div className="analysis-recommended"><strong>Recommended:</strong>
                                    <ul>
                                      {( (selectedAnalysis.recommended || selectedAnalysis.Recommended_skills || '') + '' )
                                        .split(',')
                                        .map(r => r.trim())
                                        .filter(Boolean)
                                        .map((r, i) => <li key={i}>{r}</li>)}
                                      {(!(selectedAnalysis.recommended || selectedAnalysis.Recommended_skills)) && <li>None</li>}
                                    </ul>
                                  </div>
                                  <div className="analysis-courses"><strong>Courses:</strong> {selectedAnalysis.courses || selectedAnalysis.Recommended_courses || '—'}</div>
                                  <div className="analysis-raw"><strong>Raw data:</strong>
                                    <pre style={{ color: '#c7d2fe', background: 'transparent', padding: '0.5rem 0' }}>{JSON.stringify(selectedAnalysis, null, 2)}</pre>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </section>
                      )}
                </div>
              ) : (
                <div>
                  <p><strong>File:</strong> {selectedAnalysis.pdf_name}</p>
                  <p><strong>Score:</strong> {selectedAnalysis.score}</p>
                  <p><strong>Skills:</strong> {selectedAnalysis.skills}</p>
                  <p><strong>Recommended:</strong> {selectedAnalysis.recommended || ''}</p>
                  <p><strong>Courses:</strong> {selectedAnalysis.courses || ''}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
