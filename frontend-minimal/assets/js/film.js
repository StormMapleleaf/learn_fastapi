import { api } from './api.js';
import { showAlert, createModal } from './ui.js';

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
        // 添加点击事件以显示详情
        tr.style.cursor = 'pointer';
        tr.addEventListener('click', () => showFilmDetail(film.film_id));
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

  // 添加显示电影详情的函数
  async function showFilmDetail(filmId) {
    try {
      const film = await api.get(`/film/${filmId}`);
      
      const specialFeatures = film.special_features && film.special_features.length 
        ? film.special_features.join(', ') 
        : '无';
        
      const content = `
        <div style="display: grid; gap: 12px;">
          <div>
            <label style="color: var(--muted); margin: 0 0 4px 0;">电影名</label>
            <div>${film.title}</div>
          </div>
          <div>
            <label style="color: var(--muted); margin: 0 0 4px 0;">描述</label>
            <div>${film.description || '无'}</div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="color: var(--muted); margin: 0 0 4px 0;">发行年份</label>
              <div>${film.release_year}</div>
            </div>
            <div>
              <label style="color: var(--muted); margin: 0 0 4px 0;">语言</label>
              <div>${film.language}</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="color: var(--muted); margin: 0 0 4px 0;">租赁时长</label>
              <div>${film.rental_duration} 天</div>
            </div>
            <div>
              <label style="color: var(--muted); margin: 0 0 4px 0;">租赁价格</label>
              <div>$${film.rental_rate}</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="color: var(--muted); margin: 0 0 4px 0;">时长</label>
              <div>${film.length} 分钟</div>
            </div>
            <div>
              <label style="color: var(--muted); margin: 0 0 4px 0;">替换成本</label>
              <div>$${film.replacement_cost}</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="color: var(--muted); margin: 0 0 4px 0;">评级</label>
              <div>${film.rating}</div>
            </div>
            <div>
              <label style="color: var(--muted); margin: 0 0 4px 0;">特殊功能</label>
              <div>${specialFeatures}</div>
            </div>
          </div>
        </div>
      `;
      
      createModal(`电影详情: ${film.title}`, content);
    } catch (err) {
      const content = `<div class="alert error">加载详情失败: ${err.message}</div>`;
      createModal('错误', content);
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