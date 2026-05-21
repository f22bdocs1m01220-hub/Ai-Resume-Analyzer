import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { getToken } from '../utils/auth';
import './Analyze.css';

function Analyze() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setAnalyzing(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const headers = { 'Content-Type': 'multipart/form-data' };
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await axios.post('http://localhost:8000/api/analyze', form, { headers });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert('Analysis failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setAnalyzing(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
  };

  return (
    <div className="analyze-page">
      <motion.section 
        className="analyze-hero"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="container">
          <motion.div className="analyze-header" variants={itemVariants}>
            <h1>Analyze Your Resume</h1>
            <p>Upload your resume and get instant AI-powered analysis with actionable insights</p>
          </motion.div>

          <motion.div 
            className="upload-container"
            variants={itemVariants}
          >
            <div
              className={`drag-drop-area ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-input"
                onChange={handleChange}
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
              />
              {file ? (
                <motion.div 
                  className="file-selected"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <span className="file-icon">📄</span>
                  <p>{file.name}</p>
                  <p className="file-size">{(file.size / 1024).toFixed(2)} KB</p>
                </motion.div>
              ) : (
                <label htmlFor="file-input" className="upload-label">
                  <span className="upload-icon">📤</span>
                  <p>Drag and drop your resume here</p>
                  <p className="upload-hint">or click to browse</p>
                  <p className="file-formats">Supported: PDF, DOC, DOCX</p>
                </label>
              )}
            </div>

            {file && (
              <motion.button
                className="btn btn-primary btn-analyze"
                onClick={handleAnalyze}
                disabled={analyzing}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {analyzing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ⚙️
                  </motion.div>
                ) : (
                  'Analyze Resume'
                )}
              </motion.button>
            )}
          </motion.div>
        </div>
      </motion.section>

      {/* Results Section */}
      {result && (
        <motion.section 
          className="results-section"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Analysis Results
            </motion.h2>

            <motion.div 
              className="results-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.2 }}
            >
              <motion.div 
                className="result-card score-card"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <div className="score-circle">
                  <div className="score-value">{result.score}</div>
                  <p>Overall Score</p>
                </div>
              </motion.div>

              <motion.div 
                className="result-card"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h3>ATS Compatibility</h3>
                <div className="progress-bar">
                  <motion.div 
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </div>
                <p className="score-text">{result.atsCompatibility}%</p>
              </motion.div>

              <motion.div 
                className="result-card"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <h3>Keywords Found</h3>
                <div className="keyword-badge">{result.keywords}</div>
                <p>Relevant keywords optimized</p>
              </motion.div>
            </motion.div>

            <motion.div 
              className="recommendations"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3>📋 Recommendations</h3>
              <motion.div className="recommendations-list">
                {result.recommendations.map((rec, index) => (
                  <motion.div 
                    key={index}
                    className="recommendation-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <span className="rec-icon">✓</span>
                    <p>{rec}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              className="analysis-detail-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="analysis-detail-grid">
                <div className="detail-card">
                  <h3>📈 Resume Strength by Section</h3>
                  <div className="metric-list">
                    {Object.entries(result.resumeStrength).map(([label, value], index) => (
                      <div key={label} className="metric-row">
                        <div className="metric-label">
                          <span>{label}</span>
                          <strong>{value}%</strong>
                        </div>
                        <div className="metric-bar">
                          <motion.div
                            className="metric-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 1.1, delay: 0.2 + index * 0.1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-card">
                  <h3>🧠 Skills Extracted from Your Resume</h3>
                  <div className="skill-tags">
                    {result.skills.map((skill) => (
                      <div key={skill.name} className="skill-tag">
                        <span>{skill.name}</span>
                        <strong>{skill.level}%</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-card">
                  <h3>💼 Job Suggestions Aligned to Your Resume</h3>
                  <div className="jobs-grid">
                    {result.jobSuggestions.map((job, index) => (
                      <div key={job.title} className="job-card">
                        <div className="job-top">
                          <h4>{job.title}</h4>
                          <span className="job-badge">{job.badge}</span>
                        </div>
                        <p>{job.company}</p>
                        <div className="job-match">
                          <div className="job-match-bar">
                            <motion.div
                              className="job-match-fill"
                              initial={{ width: 0 }}
                              animate={{ width: `${job.match}%` }}
                              transition={{ duration: 1.2, delay: 0.2 + index * 0.1 }}
                            />
                          </div>
                          <span>{job.match}% match</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-card">
                  <h3>🎥 YouTube Improvement Recommendations</h3>
                  <div className="video-grid">
                    {result.videos.map((video) => (
                      <a
                        key={video.title}
                        className="video-card"
                        href={video.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <div>
                          <h4>{video.title}</h4>
                          <p>{video.channel}</p>
                        </div>
                        <span>▶</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Info Section */}
      <section className="info-section">
        <div className="container">
          <h2>What We Analyze</h2>
          <div className="info-grid">
            {[
              { title: 'Formatting', desc: 'Check resume structure and visual appeal' },
              { title: 'Keywords', desc: 'Identify job-relevant keywords' },
              { title: 'ATS Score', desc: 'Ensure ATS parser compatibility' },
              { title: 'Content', desc: 'Evaluate writing quality and clarity' },
              { title: 'Skills', desc: 'Assess technical and soft skills' },
              { title: 'Experience', desc: 'Review work history presentation' }
            ].map((item, index) => (
              <motion.div 
                key={index}
                className="info-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h4>{item.title}</h4>
                <p>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Analyze;
