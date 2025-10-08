import { api } from './api.js';
import { API_BASE_URL, AUTH_MODE, TOKEN_KEY, USER_KEY } from './config.js';
import { showAlert } from './ui.js';

export function currentUser() {
  const str = localStorage.getItem(USER_KEY);
  return str ? JSON.parse(str) : null;
}

export function requireAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = 'login.html';
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  location.href = 'login.html';
}

export function initLoginPage() {
  // 填默认值
  const form = document.getElementById('login-form');
  form.apiBaseUrl.value = localStorage.getItem('API_BASE_URL') || 'http://127.0.0.1:8000';
  form.authMode.value = localStorage.getItem('AUTH_MODE') || 'demo';
  form.email.value = currentUser()?.email || 'demo@example.com';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const apiBaseUrl = form.apiBaseUrl.value.trim();
    const authMode = form.authMode.value;
    const email = form.email.value.trim();
    const password = form.password.value;

    localStorage.setItem('API_BASE_URL', apiBaseUrl);
    localStorage.setItem('AUTH_MODE', authMode);

    const msg = document.getElementById('login-msg');
    msg.className = 'alert info';
    msg.textContent = '登录中…';

    try {
      if (authMode === 'demo') {
        localStorage.setItem(TOKEN_KEY, 'demo-token');
        localStorage.setItem(USER_KEY, JSON.stringify({ email }));
      } else {
        // 期待后端返回: { access_token, token_type }
        const data = await fetch(apiBaseUrl + '/auth/login', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }).then(async (res) => {
          const text = await res.text();
          const json = text ? JSON.parse(text) : null;
          if (!res.ok) {
            throw new Error((json && (json.detail || json.message)) || res.statusText);
          }
          return json;
        });
        const token = data.access_token;
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify({ email }));
      }
      msg.className = 'alert success';
      msg.textContent = '登录成功，正在跳转…';
      setTimeout(() => (location.href = 'index.html'), 400);
    } catch (err) {
      msg.className = 'alert error';
      msg.innerHTML = showAlert('登录失败：' + err.message, 'error');
    }
  });
}
