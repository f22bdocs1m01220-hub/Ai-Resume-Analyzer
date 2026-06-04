import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { getToken, getUser, setUser } from '../utils/auth';
import './Profile.css';

function Profile({ onUpdateUser }) {
  const [loading, setLoading] = useState(false);
  const [user, setLocalUser] = useState(getUser() || { name: '', email: '' });
  const [password, setPassword] = useState('');

  useEffect(() => {
    // fetch latest profile from backend if token present
    const token = getToken();
    if (!token) return;
    setLoading(true);
    axios.get('http://localhost:8000/api/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (res.data && res.data.user) {
          setLocalUser(res.data.user);
          setUser(res.data.user);
          if (onUpdateUser) onUpdateUser(res.data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    const token = getToken();
    if (!token) return alert('Not authenticated');
    setLoading(true);
    try {
      const res = await axios.put('http://localhost:8000/api/profile', { name: user.name, email: user.email, password: password || undefined }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data && res.data.user) {
        setLocalUser(res.data.user);
        setUser(res.data.user);
        if (onUpdateUser) onUpdateUser(res.data.user);
        alert('Profile updated');
        setPassword('');
      }
    } catch (e) {
      alert('Update failed: ' + (e.response?.data?.error || e.message));
    } finally {
      setLoading(false);
    }
  };

  const container = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

  return (
    <motion.div className="profile-page" initial="hidden" animate="visible" variants={container}>
      <div className="container">
        <div className="profile-card">
          <h2>My Profile</h2>
          <p className="muted">View and edit your account information</p>

          <div className="profile-form">
            <label>Name</label>
            <input value={user.name} onChange={e => setLocalUser({ ...user, name: e.target.value })} />

            <label>Email</label>
            <input value={user.email} onChange={e => setLocalUser({ ...user, email: e.target.value })} />

            <label>Password <span className="muted">(leave blank to keep current)</span></label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} />

            <div className="form-actions">
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default Profile;
