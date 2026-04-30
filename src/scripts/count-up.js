// Count-up — animates a number into view when its container intersects.
// Reads target value from [data-count-to] and an optional decimals count
// from [data-count-decimals]. Uses the page's locale for formatting so
// "5.0" renders as "5,0" on FR/ES/IT and "5.0" on EN.
//
// Markup contract:
//   <span data-count-up data-count-to="5" data-count-decimals="1"
//         data-count-suffix="">…</span>

const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

function format(value, decimals, locale) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: false,
  }).format(value);
}

function animate(el) {
  if (el.dataset.countDone === 'true') return;
  el.dataset.countDone = 'true';

  const target = parseFloat(el.dataset.countTo || '0');
  const decimals = parseInt(el.dataset.countDecimals || '0', 10);
  const suffix = el.dataset.countSuffix || '';
  const locale = document.documentElement.lang || 'fr';

  if (REDUCE_MOTION.matches) {
    el.textContent = format(target, decimals, locale) + suffix;
    return;
  }

  const duration = 700;
  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
    const v = target * eased;
    el.textContent = format(v, decimals, locale) + suffix;
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = format(target, decimals, locale) + suffix;
  }
  requestAnimationFrame(step);
}

function run() {
  const els = document.querySelectorAll('[data-count-up]');
  if (!els.length || !('IntersectionObserver' in window)) {
    els.forEach((el) => animate(el));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.4 },
  );
  els.forEach((el) => io.observe(el));
}

document.addEventListener('astro:page-load', run);
