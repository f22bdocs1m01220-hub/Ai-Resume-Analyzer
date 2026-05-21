import axios from 'axios';

const TOKEN_KEY = 'airesume_token';
const USER_KEY = 'airesume_user';

export function setAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export async function verifyToken() {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await axios.get('http://localhost:8000/api/verify', { headers: { Authorization: `Bearer ${token}` } });
    return res.data;
  } catch (e) {
    return null;
  }
}
