import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import './AnalysisView.css';

function fmtTimestamp(ts) {
  if (!ts) return '—';
  // try numeric seconds
  const n = Number(ts);
  if (!isNaN(n) && n > 1000000000) {
    try {
      return new Date(n * 1000).toLocaleString();
    } catch (e) {}
  }
  // try ISO
  try {
    return new Date(ts).toLocaleString();
  } catch (e) {
    return String(ts);
  }
}

export default function AnalysisView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRaw, setShowRaw] = useState(false);
  const rawRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:8000/api/analysis/${id}`);
        if (!mounted) return;
        setAnalysis(res.data);
      } catch (e) {
        setError(e.response?.data?.error || e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  const copyRaw = async () => {
    try {
      const txt = JSON.stringify(analysis || {}, null, 2);
      await navigator.clipboard.writeText(txt);
      // tiny visual feedback
      if (rawRef.current) {
        rawRef.current.classList.add('copied');
        setTimeout(() => rawRef.current && rawRef.current.classList.remove('copied'), 900);
      }
    } catch (e) {
      console.warn('copy failed', e);
    }
  };

  return (
    <motion.section className="analysis-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="container">
        <div className="analysis-top">
          <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
          <h1>Resume Analysis</h1>
        </div>

        {loading && <div className="loader">Loading...</div>}

        {error && <div className="analysis-error">{error}</div>}

        {analysis && !error && (
          <motion.div className="analysis-main" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
            <div className="analysis-header">
              <div className="file-name">{analysis.pdf_name || 'Untitled'}</div>
              <div className="score-wrap">
                <div className="score-label">Score</div>
                <div className="score-pill">{analysis.score}</div>
              </div>
            </div>

            <div className="analysis-meta-grid">
              <div className="meta-item"><strong>Date</strong><div className="meta-value">{fmtTimestamp(analysis.timestamp)}</div></div>
              <div className="meta-item"><strong>File</strong><div className="meta-value">{analysis.pdf_name || '—'}</div></div>
              <div className="meta-item"><strong>Score</strong><div className="meta-value">{analysis.score || '—'}</div></div>
              <div className="meta-item"><strong>Courses</strong><div className="meta-value">{(analysis.courses || '—').replace(/,/g, ', ')}</div></div>
            </div>

            <div className="analysis-section">
              <h3>Skills</h3>
              <div className="badges">
                {(analysis.skills || '').split(',').filter(Boolean).map((s, i) => (
                  <motion.span
                    className="badge"
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.28 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {s.trim()}
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="analysis-section">
              <h3>Recommended Improvements</h3>
              <ul className="recommended-list">
                {(analysis.recommended || '').split(',').filter(Boolean).map((r, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 * i }}>{r.trim()}</motion.li>
                ))}
              </ul>
            </div>

            <div className="analysis-raw-toggle">
              <button className="btn-toggle" onClick={() => setShowRaw(s => !s)}>{showRaw ? 'Hide Raw Data' : 'Show Raw Data'}</button>
              <button className="btn-copy" onClick={copyRaw}>Copy JSON</button>
            </div>

            {showRaw && (
              <div className="analysis-raw" ref={rawRef}>
                <pre>{JSON.stringify(analysis, null, 2)}</pre>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.section>
  );
}
