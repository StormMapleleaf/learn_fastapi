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
