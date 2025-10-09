import { API_BASE_URL, TOKEN_KEY } from './config.js';

function headers(extra = {}) {
  const h = { 'content-type': 'application/json', ...extra };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function handle(res) {
  if (res.status === 204) return null;
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error((data && (data.detail || data.message)) || res.statusText);
    err.status = res.status; err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => fetch(API_BASE_URL + path, { method: 'GET', headers: headers() }).then(handle),
  post: (path, body) => fetch(API_BASE_URL + path, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  // 添加put方法以支持PUT请求
  put: (path, body) => fetch(API_BASE_URL + path, { method: 'PUT', headers: headers(), body: JSON.stringify(body) }).then(handle),
  patch: (path, body) => fetch(API_BASE_URL + path, { method: 'PATCH', headers: headers(), body: JSON.stringify(body) }).then(handle),
  del: (path) => fetch(API_BASE_URL + path, { method: 'DELETE', headers: headers() }).then(handle),
};