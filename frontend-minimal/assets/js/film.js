import { api } from './api.js';
import { showAlert } from './ui.js';

function q(sel) { return document.querySelector(sel); }

export function bindFilmList() {
  let page = 1;
  let search = '';
  const tableBody = q('#film-table tbody');
  const msg = q('#film-msg');
  const pageInfo = q('#page-info');
  const prevBtn = q('#prev-page');
  const nextBtn = q('#next-page');
  const loadBtn = q('#btn-load');
  const searchInput = q('#film-search');
  const searchBtn = q('#btn-search');

  async function loadFilms() {
    tableBody.innerHTML = '';
    msg.className = 'alert none';
    pageInfo.textContent = `第 ${page} 页`;
    try {
      const params = new URLSearchParams({ page });
      if (search) params.append('title', search);
      const list = await api.get(`/film/list?${params.toString()}`);
      if (!Array.isArray(list)) throw new Error('响应不是数组');
      if (list.length === 0 && page > 1) {
        page -= 1;
        return loadFilms();
      }
      for (const film of list) {
        const actors = film.actors && film.actors.length
          ? film.actors.join(', ')
          : '暂无演员';
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${film.title}</td><td>${film.description ?? ''}</td><td>${actors}</td>`;
        tableBody.appendChild(tr);
      }
      if (list.length === 0) {
        msg.className = 'alert info';
        msg.textContent = '暂无数据。';
      }
    } catch (err) {
      msg.className = 'alert error';
      msg.innerHTML = showAlert('加载失败：' + err.message, 'error');
    }
  }

  prevBtn.addEventListener('click', () => {
    if (page > 1) {
      page -= 1;
      loadFilms();
    }
  });
  nextBtn.addEventListener('click', () => {
    page += 1;
    loadFilms();
  });
  loadBtn.addEventListener('click', () => {
    search = '';
    if (searchInput) searchInput.value = '';
    page = 1;
    loadFilms();
  });
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      search = searchInput.value.trim();
      page = 1;
      loadFilms();
    });
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        search = searchInput.value.trim();
        page = 1;
        loadFilms();
      }
    });
  }

  // 默认自动加载第一页
  loadFilms();
}
