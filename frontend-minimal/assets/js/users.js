import { api } from './api.js';
import { showAlert } from './ui.js';

function q(sel) { return document.querySelector(sel); }

export function bindUserCrud() {
  // Create
  q('#form-create').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const msg = q('#create-msg');
    try {
      const data = await api.post('/users/register', { email });
      msg.className = 'alert success';
      msg.textContent = '创建成功：ID ' + data.id;
    } catch (err) {
      msg.className = 'alert error';
      msg.textContent = '创建失败：' + err.message;
    }
  });

  // Get by ID
  q('#form-get').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = e.target.id.value;
    const pre = q('#get-result');
    try {
      const data = await api.get('/users/' + id);
      pre.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      pre.textContent = '查询失败：' + err.message;
    }
  });

  // Update
  q('#form-update').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = e.target.id.value;
    const email = e.target.email.value.trim();
    const msg = q('#update-msg');
    try {
      const data = await api.post('/users/update/' + id, { email });
      msg.className = 'alert success';
      msg.textContent = '更新成功：' + JSON.stringify(data);
    } catch (err) {
      if (err.status === 404 || err.status === 405) {
        msg.className = 'alert error';
        msg.innerHTML = showAlert('后端尚未实现 PATCH /users/{id}，请按 README 中的示例补上。', 'error');
      } else {
        msg.className = 'alert error';
        msg.textContent = '更新失败：' + err.message;
      }
    }
  });

  // Delete
  q('#form-delete').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = e.target.id.value;
    const msg = q('#delete-msg');
    try {
      await api.post('/users/delete/' + id);
      msg.className = 'alert success';
      msg.textContent = '删除成功';
    } catch (err) {
      if (err.status === 404 || err.status === 405) {
        msg.className = 'alert error';
        msg.innerHTML = showAlert('后端尚未实现 DELETE /users/{id}，请按 README 中的示例补上。', 'error');
      } else {
        msg.className = 'alert error';
        msg.textContent = '删除失败：' + err.message;
      }
    }
  });

  // List
  q('#btn-load').addEventListener('click', async () => {
    const tbody = q('#users-table tbody');
    const msg = q('#list-msg');
    tbody.innerHTML = '';
    msg.className = 'alert none';
    try {
      const list = await api.get('/users?limit=50');
      if (!Array.isArray(list)) throw new Error('响应不是数组');
      for (const u of list) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${u.id}</td><td>${u.email}</td><td>${u.created_at ?? ''}</td>`;
        tbody.appendChild(tr);
      }
      if (list.length === 0) {
        msg.className = 'alert info';
        msg.textContent = '暂无数据。你可以先创建一些用户。';
      }
    } catch (err) {
      msg.className = 'alert error';
      msg.innerHTML = showAlert('加载失败：可能后端未实现 GET /users。你可以先使用“创建用户 + 按 ID 查询”完成原型验证。', 'error');
    }
  });
}
