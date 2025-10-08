// 可在登录页动态写入 localStorage 来覆盖
export const API_BASE_URL = localStorage.getItem('API_BASE_URL') || 'http://127.0.0.1:8000';
export const AUTH_MODE = localStorage.getItem('AUTH_MODE') || 'demo'; // 'demo' or 'jwt'
export const TOKEN_KEY = 'ACCESS_TOKEN';
export const USER_KEY = 'CURRENT_USER'; // 存 { email }
