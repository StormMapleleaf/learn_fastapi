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
