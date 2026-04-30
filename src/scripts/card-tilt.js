// 3D card tilt — desktop pointer-fine devices only. Cards with
// [data-tilt] rotate slightly toward the cursor while hovered.
// Maximum rotation is tunable via [data-tilt-max="6"] (default 6deg).

const SUPPORTED = window.matchMedia('(hover: hover) and (pointer: fine)');
const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)');

function attach(el) {
  if (el.dataset.tiltBound === 'true') return;
  el.dataset.tiltBound = 'true';

  const max = parseFloat(el.dataset.tiltMax || '6');

  function onMove(e) {
    if (!SUPPORTED.matches || REDUCE_MOTION.matches) return;
    const r = el.getBoundingClientRect();
    // Normalize cursor to [-0.5, 0.5] in both axes
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    // ry follows X (left/right tilt), rx inverts Y (cursor up = card tilts up)
    const ry = nx * max * 2;
    const rx = -ny * max * 2;
    el.style.setProperty('--rx', `${rx.toFixed(2)}deg`);
    el.style.setProperty('--ry', `${ry.toFixed(2)}deg`);
    el.dataset.tiltActive = 'true';
  }
  function onLeave() {
    el.style.removeProperty('--rx');
    el.style.removeProperty('--ry');
    el.dataset.tiltActive = 'false';
  }
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
}

function run() {
  if (!SUPPORTED.matches) return;
  document.querySelectorAll('[data-tilt]').forEach(attach);
}

document.addEventListener('astro:page-load', run);
