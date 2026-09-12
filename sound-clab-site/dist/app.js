const toggle = document.querySelector('.menu-toggle');
const themeToggle = document.querySelector('#theme-toggle');
themeToggle.checked = document.documentElement.dataset.theme === 'dark';
themeToggle.addEventListener('change', () => {
  const theme = themeToggle.checked ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem('sound-clab-theme', theme); } catch {}
});
addEventListener('storage', event => {
  if (event.key !== 'sound-clab-theme') return;
  const dark = event.newValue === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeToggle.checked = dark;
});
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu(){ mobileNav.hidden = true; toggle.setAttribute('aria-expanded','false'); toggle.setAttribute('aria-label','Открыть меню'); }
toggle.addEventListener('click', () => { const open=mobileNav.hidden; mobileNav.hidden=!open; toggle.setAttribute('aria-expanded',String(open)); toggle.setAttribute('aria-label',open ? 'Закрыть меню' : 'Открыть меню'); });
mobileNav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown', e=>{if(e.key==='Escape' && !mobileNav.hidden){closeMenu();toggle.focus();}});
document.addEventListener('click', e=>{if(!mobileNav.contains(e.target) && !toggle.contains(e.target))closeMenu();});
matchMedia('(min-width: 601px)').addEventListener('change', closeMenu);
const form = document.querySelector('#project-form');
function updateField(field) { field.closest('label').classList.toggle('filled', Boolean(field.value)); }
form.querySelectorAll('input:not([type=checkbox]),textarea').forEach(field => {
  field.addEventListener('input', () => updateField(field));
  field.addEventListener('change', () => updateField(field));
  updateField(field);
});
document.querySelectorAll('[data-service]').forEach(a=>a.addEventListener('click',()=>{
  const field = form.elements.message;
  if (!field.value.trim()) field.value = a.dataset.service;
  updateField(field);
}));
const dialog = document.querySelector('#request-dialog');
form.addEventListener('submit', e=>{
  e.preventDefault();
  const data = new FormData(form);
  document.querySelector('#request-text').textContent = `Здравствуйте! Хочу обсудить установку.\n\nИмя: ${data.get('name')}\nТелефон: ${data.get('phone')}\nАвтомобиль: ${data.get('car')}\nЗадача: ${data.get('message') || 'Нужна консультация'}`;
  document.querySelector('#copy-status').textContent='';
  dialog.showModal();
});

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const revealTargets = document.querySelectorAll('.rebuild .block-heading, .direction, .solution-list > a, .equipment-layout, .detail-copy, .workflow li, .listening > div, .faq > div, .inquiry-grid > div');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    revealObserver.unobserve(entry.target);
    if (reducedMotion.matches) return;
    const siblings = [...entry.target.parentElement.children];
    const stagger = entry.target.matches('.direction, .workflow li') ? siblings.indexOf(entry.target) % 4 * 65 : 0;
    entry.target.animate(
      [{ opacity: .15, transform: 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 650, delay: stagger, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' }
    );
  });
}, { threshold: .08 });
revealTargets.forEach(target => revealObserver.observe(target));
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) document.getAnimations().forEach(animation => animation.finish());
});

const chapterLinks = document.querySelectorAll('.chapter-links a');
const chapters = [...chapterLinks].map(link => document.querySelector(link.hash));
const progress = document.querySelector('.reading-progress');
let scrollScheduled = false;
function updateReadingPosition() {
  const range = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = 'scaleX(' + (range > 0 ? scrollY / range : 0) + ')';
  let current = null;
  chapters.forEach(chapter => {
    if (chapter.getBoundingClientRect().top <= 160) current = chapter.id;
  });
  chapterLinks.forEach(link => {
    if (link.hash === '#' + current) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollScheduled = false;
}
addEventListener('scroll', () => {
  if (!scrollScheduled) {
    scrollScheduled = true;
    requestAnimationFrame(updateReadingPosition);
  }
}, { passive: true });
addEventListener('resize', updateReadingPosition);
addEventListener('load', updateReadingPosition);
updateReadingPosition();

document.querySelectorAll('.questions details').forEach(details => {
  details.addEventListener('toggle', () => {
    if (details.open && !reducedMotion.matches) {
      details.querySelector('p').animate(
        [{ opacity: 0, transform: 'translateY(-5px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 220, easing: 'ease-out' }
      );
    }
  });
});
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
document.querySelector('#copy-request').addEventListener('click',async()=>{
  const status=document.querySelector('#copy-status');
  try{await navigator.clipboard.writeText(document.querySelector('#request-text').textContent);status.textContent='Запрос скопирован. Его можно отправить студии.';}
  catch{status.textContent='Выделите и скопируйте текст запроса вручную.';const range=document.createRange();range.selectNodeContents(document.querySelector('#request-text'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);}
});
