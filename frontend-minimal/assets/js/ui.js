export function showAlert(text, type='info') {
  return `<div class="alert ${type}">${escapeHtml(text)}</div>`;
}
export function escapeHtml(s='') {
  return s.replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));
}
export async function loadHtml(selector, url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`无法加载 ${url}`);
  document.querySelector(selector).innerHTML = await res.text();
}
export async function loadMenus(topbarSelector, sidebarSelector, menuJsonPath) {
  const res = await fetch(menuJsonPath);
  if (!res.ok) throw new Error(`无法加载菜单 JSON 文件：${menuJsonPath}`);
  const menus = await res.json();

  // Render topbar
  const topbar = document.querySelector(topbarSelector);
  topbar.innerHTML = `
    <div class="topbar" style="display:flex;align-items:center;justify-content:space-between;">
      <div class="brand">${menus.topbar.brand}</div>
      <nav class="top-actions" style="display:flex;align-items:center;gap:12px;">
        ${menus.topbar.actions.map(action => {
          if (action.type === 'text') {
            return `<span id="${action.id}"></span>`;
          } else if (action.type === 'button') {
            return `<button id="${action.id}" class="btn">${action.text}</button>`;
          }
        }).join('')}
      </nav>
    </div>
  `;

  // Render sidebar
  const sidebar = document.querySelector(sidebarSelector);
  // 获取当前页面文件名
  const currentPage = location.pathname.split('/').pop();
  sidebar.innerHTML = menus.sidebar.map(item => `
    <div>
      <a class="nav-item${item.href === currentPage ? ' active' : ''}" href="${item.href}">${item.text}</a>
      ${item.children ? `
        <div class="submenu">
          <ul>
            ${item.children.map(subItem => `
              <li><a class="nav-item${subItem.href === currentPage ? ' active' : ''}" href="${subItem.href}">${subItem.text}</a></li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `).join('');
}

// 添加创建模态框的函数
export function createModal(title, content) {
  // 如果已存在模态框，先移除
  const existingModal = document.getElementById('detail-modal');
  if (existingModal) existingModal.remove();

  const modal = document.createElement('div');
  modal.id = 'detail-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;

  modal.innerHTML = `
    <div class="modal-content" style="
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="margin: 0;">${title}</h3>
        <button class="btn" id="close-modal" style="min-width: auto; padding: 4px 10px;">×</button>
      </div>
      <div>${content}</div>
    </div>
  `;

  document.body.appendChild(modal);

  // 绑定关闭事件
  modal.querySelector('#close-modal').addEventListener('click', () => {
    modal.remove();
  });

  // 点击模态框外部关闭
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  return modal;
}