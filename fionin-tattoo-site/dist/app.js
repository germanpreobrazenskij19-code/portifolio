const dialog = document.querySelector('#site-dialog');
const content = document.querySelector('#dialog-content');
let opener;
function openDialog(name, trigger) {
  const template = document.getElementById(name);
  if (!(template instanceof HTMLTemplateElement)) return;
  if (!dialog.open) opener = trigger;
  content.replaceChildren(template.content.cloneNode(true));
  if (!dialog.open) dialog.showModal();
  dialog.querySelector('.dialog-close').focus();
}
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-dialog]');
  if (trigger) openDialog(trigger.dataset.dialog, trigger);
  if (event.target.closest('.dialog-close, [data-close]')) dialog.close();
});
dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => opener?.focus());
