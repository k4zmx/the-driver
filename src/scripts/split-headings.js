// Split section H2 headings into per-word spans so they can reveal with
// a dramatic stagger when their `[data-reveal]` ancestor enters view.
//
// Skips:
//   - the hero H1 (already handled via `.kinetic-h1`)
//   - any H2 that contains structured HTML (existing children)
//
// Idempotent — sets `data-split="true"` on each processed element so a
// re-run after Astro ClientRouter navigation doesn't double-wrap.

function split(el) {
  if (el.dataset.split === 'true') return;
  if (el.children.length > 0) return;
  const text = (el.textContent || '').trim();
  if (!text) return;
  el.dataset.split = 'true';
  const words = text.split(/\s+/);
  el.innerHTML = words
    .map((w, i) => `<span class="rw-word" style="--ri:${i}">${w}</span>`)
    .join(' ');
}

function run() {
  document
    .querySelectorAll('h2.h2:not([data-split="true"])')
    .forEach((el) => split(el));
}

document.addEventListener('astro:page-load', run);
