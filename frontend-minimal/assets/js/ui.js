export function showAlert(text, type='info') {
  return `<div class="alert ${type}">${escapeHtml(text)}</div>`;
}
export function escapeHtml(s='') {
  return s.replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[c]));
}
