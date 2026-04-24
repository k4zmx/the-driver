// Reveal-on-scroll. Runs on first load AND after Astro ClientRouter navigations.
// Adds .is-visible to any [data-reveal] once ~10% is in view, then unobserves.
// Respects prefers-reduced-motion — snaps everything in immediately.

function run() {
  const els = document.querySelectorAll('[data-reveal], [data-reveal-words], [data-reveal-clip]');
  if (!els.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  );

  els.forEach((el) => io.observe(el));
}

// Fires on first DOMContentLoaded AND after every Astro view-transition navigation.
document.addEventListener('astro:page-load', run);
