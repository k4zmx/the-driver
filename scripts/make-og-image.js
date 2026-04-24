#!/usr/bin/env node
/**
 * One-shot OG image builder. Produces public/images/og-default.jpg at
 * 1200×630 (Twitter summary_large_image / OG minimum spec).
 *
 * Composition: tourparis.jpg as base (darkened + desaturated), warm cream
 * overlay on the left 55%, headline text baked in as SVG layer.
 *
 * Run: npm run make-og
 * Do NOT run on every build. Regenerate only when base photo or tagline
 * changes. Output is committed alongside sources under public/images/.
 */
import { join } from 'node:path';
import { writeFileSync, existsSync } from 'node:fs';
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('[og] sharp not installed. Run: npm install --save-dev sharp');
  process.exit(1);
}

const SRC = join(process.cwd(), 'public/images/routes/tourparis.jpg');
const OUT = join(process.cwd(), 'public/images/og-default.jpg');

if (!existsSync(SRC)) {
  console.error(`[og] missing base photo: ${SRC}`);
  process.exit(1);
}

const W = 1200;
const H = 630;

const overlay = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="sheet" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"  stop-color="#F8F5EE" stop-opacity="0.96"/>
      <stop offset="55%" stop-color="#F8F5EE" stop-opacity="0.78"/>
      <stop offset="100%" stop-color="#F8F5EE" stop-opacity="0.22"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sheet)"/>
  <g font-family="Fraunces, Georgia, serif" fill="#1A1A1A">
    <text x="72" y="230" font-size="78" font-weight="500" letter-spacing="-1.5">Driver Services</text>
    <text x="72" y="316" font-size="44" font-weight="500" fill="#4A4A48" letter-spacing="-0.5">Private chauffeur in Paris.</text>
  </g>
  <g font-family="Inter, sans-serif" fill="#4A4A48">
    <text x="72" y="410" font-size="22" font-weight="500" letter-spacing="2">FLAT RATES · 24/7 · FREE CHILD SEATS</text>
  </g>
  <g font-family="Inter, sans-serif" fill="#C94F3A">
    <circle cx="82" cy="498" r="6"/>
    <text x="102" y="505" font-size="22" font-weight="500">★ 5,0 — Google Reviews</text>
  </g>
</svg>`;

await sharp(SRC)
  .resize({ width: W, height: H, fit: 'cover', position: 'center' })
  .modulate({ saturation: 0.6, brightness: 0.95 })
  .composite([{ input: Buffer.from(overlay), top: 0, left: 0 }])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(OUT);

console.log(`[og] wrote ${OUT}`);
