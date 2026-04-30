// Magnetic CTA — desktop pointer-fine devices only. Buttons with
// [data-magnetic] subtly translate toward the cursor while hovered.
// Strength is tunable via [data-magnetic-strength="0.4"] (default 0.35).

const SUPPORTED = window.matchMedia('(hover: hover) and (pointer: fine)');
const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

function attach(el) {
  if (el.dataset.magneticBound === 'true') return;
  el.dataset.magneticBound = 'true';

  const strength = parseFloat(el.dataset.magneticStrength || '0.35');

  function onMove(e) {
    if (!SUPPORTED.matches || REDUCE_MOTION.matches) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    el.style.setProperty('--mx', `${dx}px`);
    el.style.setProperty('--my', `${dy}px`);
    el.dataset.magneticActive = 'true';
  }
  function onLeave() {
    el.style.removeProperty('--mx');
    el.style.removeProperty('--my');
    el.dataset.magneticActive = 'false';
  }
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
  el.addEventListener('blur', onLeave);
}

function run() {
  if (!SUPPORTED.matches) return;
  document.querySelectorAll('[data-magnetic]').forEach(attach);
}

document.addEventListener('astro:page-load', run);
