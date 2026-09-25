const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  navigation.classList.remove('menu-open');
  document.body.classList.remove('menu-is-open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  navigation.classList.toggle('menu-open', open);
  document.body.classList.toggle('menu-is-open', open);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 1101px)').addEventListener('change', closeMenu);

const hero = document.querySelector('.hero');
const header = document.querySelector('header');
function updateHeaderBackground() {
  document.body.classList.toggle('on-hero', window.scrollY < 40 && menuButton.getAttribute('aria-expanded') !== 'true');
}
updateHeaderBackground();
window.addEventListener('scroll', updateHeaderBackground, { passive: true });
window.addEventListener('resize', updateHeaderBackground);

const works = [...document.querySelectorAll('.work')];
const lightbox = document.querySelector('.lightbox');
const enlargedImage = lightbox.querySelector('img');
let activeWork = 0;
function showWork(index) {
  activeWork = (index + works.length) % works.length;
  const work = works[activeWork];
  enlargedImage.src = work.href;
  enlargedImage.alt = work.querySelector('img').alt;
  lightbox.querySelector('figcaption').textContent = work.dataset.title;
  lightbox.querySelector('.lightbox-count').textContent = `${activeWork + 1} / ${works.length}`;
}
works.forEach((work, index) => work.addEventListener('click', event => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  showWork(index);
  lightbox.showModal();
  document.body.classList.add('modal-open');
}));
lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.querySelector('.lightbox-prev').addEventListener('click', () => showWork(activeWork - 1));
lightbox.querySelector('.lightbox-next').addEventListener('click', () => showWork(activeWork + 1));
lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
lightbox.addEventListener('close', () => document.body.classList.remove('modal-open'));
lightbox.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showWork(activeWork + (event.key === 'ArrowLeft' ? -1 : 1));
  }
});

const heroVideo = document.querySelector('#hero-background-video');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function syncHeroVideo() {
  if (!heroVideo) return;
  heroVideo.muted = true;
  if (document.hidden || reduceMotion.matches) {
    heroVideo.pause();
    return;
  }
  if (!heroVideo.ended) heroVideo.play().catch(() => {});
}

if (heroVideo) {
  syncHeroVideo();
  document.addEventListener('visibilitychange', syncHeroVideo);
  reduceMotion.addEventListener('change', syncHeroVideo);
  window.addEventListener('pageshow', syncHeroVideo);
}

const processVideos = [...document.querySelectorAll('.process-film video')];
function syncProcessVideos() {
  processVideos.forEach(video => {
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    const figure = video.closest('figure');
    if (document.hidden || reduceMotion.matches || (figure && getComputedStyle(figure).display === 'none')) {
      video.pause();
      return;
    }
    video.play().catch(() => {});
  });
}

if (processVideos.length) {
  syncProcessVideos();
  document.addEventListener('visibilitychange', syncProcessVideos);
  reduceMotion.addEventListener('change', syncProcessVideos);
  window.addEventListener('pageshow', syncProcessVideos);
  window.addEventListener('resize', syncProcessVideos);
  document.addEventListener('touchstart', syncProcessVideos, { once: true, passive: true });
}

const revealItems = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  revealItems.forEach(item => revealObserver.observe(item));
} else {
  revealItems.forEach(item => item.classList.add('is-visible'));
}

const pricePanels = document.querySelector('[data-price-panels]');
if (pricePanels) {
  const panels = [...pricePanels.querySelectorAll('[data-price-panel]')];
  const activate = selected => {
    panels.forEach(panel => {
      const active = panel === selected;
      panel.classList.toggle('is-active', active);
      panel.setAttribute('aria-selected', String(active));
    });
  };

  panels.forEach(panel => {
    panel.addEventListener('click', event => {
      if (event.target.closest('a')) return;
      activate(panel);
    });
    panel.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      activate(panel);
    });
  });
}

const reviewTrack = document.querySelector('.reviews-v3 .voices-v2-cards');
const reviewSlides = reviewTrack ? [...reviewTrack.querySelectorAll('.review-card-link')] : [];
const reviewDots = [...document.querySelectorAll('.reviews-slider-dots button')];

if (reviewTrack && reviewSlides.length && reviewDots.length) {
  const setActiveReview = index => {
    reviewDots.forEach((dot, dotIndex) => {
      const active = dotIndex === index;
      dot.classList.toggle('is-active', active);
      if (active) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  reviewDots.forEach((dot, index) => dot.addEventListener('click', () => {
    reviewSlides[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    setActiveReview(index);
  }));

  let reviewScrollFrame = 0;
  reviewTrack.addEventListener('scroll', () => {
    cancelAnimationFrame(reviewScrollFrame);
    reviewScrollFrame = requestAnimationFrame(() => {
      const trackLeft = reviewTrack.getBoundingClientRect().left;
      const nearest = reviewSlides.reduce((best, slide, index) => {
        const distance = Math.abs(slide.getBoundingClientRect().left - trackLeft);
        return distance < best.distance ? { index, distance } : best;
      }, { index: 0, distance: Infinity });
      setActiveReview(nearest.index);
    });
  }, { passive: true });
}
