// Top-of-viewport scroll progress bar. Sets --scroll-progress (0–1) on the
// progress element so a transform: scaleX(...) handles the visual update —
// no width animation, no layout work, GPU-friendly.

let bar = null;
let ticking = false;

function update() {
  ticking = false;
  if (!bar) return;
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - window.innerHeight;
  const progress = scrollable > 0
    ? Math.max(0, Math.min(1, window.scrollY / scrollable))
    : 0;
  bar.style.setProperty('--scroll-progress', String(progress));
}

function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(update);
}

function run() {
  bar = document.querySelector('.scroll-progress');
  if (!bar) return;
  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', update);
}

document.addEventListener('astro:page-load', run);
