try {
  document.documentElement.dataset.theme = localStorage.getItem('sound-clab-theme') === 'dark' ? 'dark' : 'light';
} catch {
  document.documentElement.dataset.theme = 'light';
}
