const dialog = document.querySelector('#site-dialog');
const content = document.querySelector('#dialog-content');
const cards = [...document.querySelectorAll('.work-card')];
const form = document.querySelector('#booking-form');
form.querySelector('[type=submit]').disabled = false;
let opener;
let galleryIndex = 0;
function showDialog(trigger, lightbox = false) {
  if (!dialog.open) opener = trigger;
  dialog.classList.toggle('lightbox', lightbox);
  if (!dialog.open) dialog.showModal();
  dialog.querySelector('.dialog-close').focus({ preventScroll: true });
}
function openDialog(name, trigger) {
  const template = document.querySelector(`template[id="${name}"]`);
  if (!template) return;
  content.replaceChildren(template.content.cloneNode(true));
  showDialog(trigger);
}
function visibleWorks() { return cards.filter(card => !card.hidden); }
function showWork(card, trigger) {
  const visible = visibleWorks();
  galleryIndex = visible.indexOf(card);
  content.replaceChildren(document.querySelector('#work-dialog').content.cloneNode(true));
  const original = card.querySelector('img');
  const photo = content.querySelector('.lightbox-image');
  photo.src = original.src;
  photo.alt = original.alt;
  content.querySelector('#dialog-title').textContent = card.querySelector('figcaption>span').textContent;
  content.querySelector('#work-position').textContent = `${galleryIndex + 1} / ${visible.length}`;
  content.querySelectorAll('[data-gallery-step]').forEach(button => { button.disabled = visible.length < 2; });
  showDialog(trigger, true);
}
function stepWork(step) {
  const visible = visibleWorks();
  const focusedStep = document.activeElement?.dataset.galleryStep;
  showWork(visible[(galleryIndex + step + visible.length) % visible.length], opener);
  if (focusedStep) content.querySelector(`[data-gallery-step="${focusedStep}"]`)?.focus();
}
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-dialog]');
  if (trigger) openDialog(trigger.dataset.dialog, trigger);
  if (event.target.closest('.dialog-close, [data-close]')) dialog.close();
  const work = event.target.closest('[data-work]');
  if (work) showWork(work.closest('.work-card'), work);
  const step = event.target.closest('[data-gallery-step]');
  if (step) stepWork(Number(step.dataset.galleryStep));
  const service = event.target.closest('[data-service]');
  if (service) [...form.elements.service].forEach(input => { input.checked = input.value === service.dataset.service; });
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => opener?.focus({ preventScroll: true }));
dialog.addEventListener('keydown', event => {
  if (!dialog.classList.contains('lightbox')) return;
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    stepWork(event.key === 'ArrowRight' ? 1 : -1);
  }
});
let currentFilter = 'all';
let expandedWorks = false;
const moreWorks = document.querySelector('#more-works');
function updatePortfolio() {
  const matches = cards.filter(card => currentFilter === 'all' || card.dataset.category === currentFilter);
  cards.forEach(card => { card.hidden = !matches.includes(card) || (currentFilter === 'all' && !expandedWorks && matches.indexOf(card) >= 3); });
  document.querySelector('.portfolio-grid').classList.toggle('is-filtered', currentFilter !== 'all');
  document.querySelectorAll('[data-filter]').forEach(button => {
    const selected = button.dataset.filter === currentFilter;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  const count = visibleWorks().length;
  document.querySelector('#portfolio-status').textContent = currentFilter === 'all' ? `${count} из ${cards.length} работ` : `${count} ${count === 1 ? 'работа' : count < 5 ? 'работы' : 'работ'}`;
  moreWorks.hidden = currentFilter !== 'all';
  moreWorks.setAttribute('aria-expanded', String(expandedWorks));
  moreWorks.querySelector('.more-label').textContent = expandedWorks ? 'Свернуть галерею' : 'Ещё 3 работы';
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  currentFilter = button.dataset.filter;
  updatePortfolio();
}));
moreWorks.addEventListener('click', () => {
  expandedWorks = !expandedWorks;
  updatePortfolio();
});
updatePortfolio();
const idea = form.elements.idea;
idea.addEventListener('input', () => {
  idea.setCustomValidity('');
  document.querySelector('#idea-counter').textContent = `${idea.value.length} / 1500`;
});
form.addEventListener('submit', event => {
  event.preventDefault();
  if (idea.value.trim().length < 10) {
    idea.setCustomValidity('Расскажите чуть подробнее: минимум 10 символов без пробелов по краям.');
    idea.reportValidity();
    return;
  }
  if (!form.reportValidity()) return;
  const lines = ['Здравствуйте! Хочу обсудить запись в Fionin Tattoo.'];
  if (form.elements.name.value.trim()) lines.push(`Меня зовут ${form.elements.name.value.trim()}.`);
  lines.push(`Услуга: ${form.elements.service.value}.`);
  lines.push( '', idea.value.trim(), '', 'Подскажите, пожалуйста, стоимость и свободное время.');
  openDialog('message-dialog', event.submitter);
  content.querySelector('#booking-message').value = lines.join('\n');
  content.querySelector('#copy-message').addEventListener('click', async () => {
    const output = content.querySelector('#booking-message');
    const status = content.querySelector('.message-status');
    try {
      await navigator.clipboard.writeText(output.value);
      status.textContent = 'Текст скопирован. Откройте VK и вставьте его в сообщение студии.';
    } catch {
      output.focus();
      output.select();
      status.textContent = 'Текст выделен. Скопируйте его вручную и вставьте в сообщение студии.';
    }
  });
});
document.querySelector('#year').textContent = new Date().getFullYear();
if ('IntersectionObserver' in window) {
  const visible = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
    document.querySelector('.mobile-booking').classList.toggle('is-hidden', visible.size > 0);
  });
  observer.observe(document.querySelector('#booking'));
  observer.observe(document.querySelector('.full-footer'));
}

// Animate each block once as it enters the viewport. Content stays available
// without animation support, and keyboard focus never waits for a reveal.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!motionPreference.matches && 'IntersectionObserver' in window && Element.prototype.animate) {
  const activeReveals = new Map();
  const compactMotion = window.matchMedia('(max-width: 760px)');
  function trackReveal(element, animation) {
    if (!activeReveals.has(element)) activeReveals.set(element, new Set());
    activeReveals.get(element).add(animation);
    animation.onfinish = animation.oncancel = () => {
      const animations = activeReveals.get(element);
      animations?.delete(animation);
      if (!animations?.size) activeReveals.delete(element);
    };
  }
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      revealObserver.unobserve(element);
      if (element.contains(document.activeElement)) return;
      const siblings = [...element.parentElement.children].filter(child => child.classList.contains('motion-target') && !child.hidden);
      const delay = Math.min(Math.max(siblings.indexOf(element), 0), 3) * 110;
      const distance = compactMotion.matches ? 32 : 64;
      const animation = element.animate([
        { opacity: 0, transform: `translateY(${distance}px)` },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 1000, delay, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'backwards' });
      trackReveal(element, animation);
      const photo = element.querySelector('.work-image');
      if (photo) {
        trackReveal(element, photo.querySelector("img").animate([
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)' }
        ], { duration: 1150, delay, easing: 'cubic-bezier(.76, 0, .24, 1)', fill: 'backwards' }));
        trackReveal(element, photo.querySelector('img').animate([
          { scale: '1.18' }, { scale: '1' }
        ], { duration: 1450, delay, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'backwards' }));
      }
      const heading = element.querySelector('h2');
      if (heading) trackReveal(element, heading.animate([
        { clipPath: 'inset(0 0 100% 0)', translate: '0 25px' },
        { clipPath: 'inset(0 0 0% 0)', translate: '0 0' }
      ], { duration: 1000, delay: delay + 80, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'backwards' }));
    });
  }, { threshold: 0.06 });

  document.querySelectorAll('.section-header, .work-card, .service-intro, .service-row, .faq-layout > div:first-child, .faq-list details, .booking-intro, .contacts-section .section-label, .contacts-heading, .contact-grid > div').forEach(element => {
    element.classList.add('motion-target');
    revealObserver.observe(element);
  });
  document.addEventListener('focusin', event => {
    const element = event.target.closest('.motion-target');
    if (!element) return;
    revealObserver.unobserve(element);
    activeReveals.get(element)?.forEach(animation => animation.cancel());
  });
  motionPreference.addEventListener('change', event => {
    if (!event.matches) return;
    revealObserver.disconnect();
    activeReveals.forEach(animations => animations.forEach(animation => animation.cancel()));
    activeReveals.clear();
  });
}
