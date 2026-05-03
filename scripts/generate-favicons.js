// Favicon generator — derives the full favicon set from /public/newlogo.png
// (the same file the navbar uses), cropped to just the car silhouette and
// recolored black on a cream circular background.
//
// Run: `npm run generate-favicons` (manual; not on every build).
//
// Outputs (all written to /public/):
//   favicon.svg            — raster-embedded SVG wrapper (modern browsers)
//   favicon.ico            — 16/32/48 multi-resolution ICO (legacy)
//   apple-touch-icon.png   — 180×180 (iOS home screen)
//   icon-192.png           — 192×192 (Android Chrome / PWA)
//   icon-512.png           — 512×512 (PWA install / splash)
//
// How the recolor works: newlogo.png ships as white-on-transparent. Sharp's
// `.negate({ alpha: false })` flips RGB only — white pixels become black,
// alpha is preserved, so the transparent area stays transparent and the
// cream circle shines through after composite. No mask trickery needed.

import { writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, '..', 'public');
const SOURCE_LOGO = resolve(PUBLIC_DIR, 'newlogo.png');

const ICO_SIZES = [16, 32, 48];
const PNG_OUTPUTS = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

// Cream brand background (matches site's --color-cream token).
const CREAM = '#F8F5EE';

// Region of newlogo.png (1688×964) that contains the car silhouette only —
// crops out the "tD" monogram on the right (which begins around x=720).
// Tweak if the source logo changes; values are in source pixels.
const CAR_CROP = { left: 0, top: 0, width: 700, height: 964 };

// What share of the icon's diameter the car should occupy. The remaining
// space is cream margin around the car.
const CAR_OCCUPANCY = 0.78;

/** Cream circle PNG buffer at the given size. */
async function buildCircleBg(size) {
  const half = size / 2;
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
      <circle cx="${half}" cy="${half}" r="${half}" fill="${CREAM}"/>
    </svg>`,
  );
  return sharp(svg).png().toBuffer();
}

// Crop+trim cached at module load — same input every call, so we only do
// the heavy work once and reuse the buffer for every output size.
let _trimmedCarPromise = null;
function getTrimmedCar() {
  if (_trimmedCarPromise) return _trimmedCarPromise;
  _trimmedCarPromise = (async () => {
    // Step 1: crop to the car region. Sharp can't reliably chain extract
    // → trim in a single pipeline (throws "bad extract area"), so we
    // materialise the cropped buffer first.
    const cropped = await sharp(SOURCE_LOGO).extract(CAR_CROP).png().toBuffer();
    // Step 2: trim transparent edges, then negate (white -> black).
    // Negating after trim works because alpha is preserved; the
    // transparent borders we just removed don't get re-added.
    return sharp(cropped)
      .trim({ threshold: 10 })
      .negate({ alpha: false })
      .png()
      .toBuffer();
  })();
  return _trimmedCarPromise;
}

/** Cropped + recolored car silhouette (black on transparent) sized for the icon. */
async function buildCarMark(size) {
  const carBox = Math.round(size * CAR_OCCUPANCY);
  const trimmed = await getTrimmedCar();
  return sharp(trimmed)
    // `fit: inside` preserves aspect ratio. The car is wider than tall
    // after the trim, so this centers it within the carBox.
    .resize({
      width: carBox,
      height: carBox,
      fit: 'inside',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();
}

/** Cream circle + centered car silhouette, rendered to PNG buffer. */
async function buildIcon(size) {
  const [bg, car] = await Promise.all([buildCircleBg(size), buildCarMark(size)]);
  return sharp(bg)
    .composite([{ input: car, gravity: 'center' }])
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
}

/**
 * Build a multi-resolution ICO file from an array of PNG buffers.
 * Each PNG is embedded as-is — the ICO directory header points at its
 * offset and length within the final file.
 *
 * Layout:
 *   [6 bytes ICONDIR] [16 bytes ICONDIRENTRY] × N [PNG payload] × N
 */
function buildIco(pngBuffers, sizes) {
  if (pngBuffers.length !== sizes.length) {
    throw new Error('buildIco: png/size length mismatch');
  }
  const ICONDIR_SIZE = 6;
  const ICONDIRENTRY_SIZE = 16;
  const headerLen = ICONDIR_SIZE + ICONDIRENTRY_SIZE * pngBuffers.length;

  const header = Buffer.alloc(ICONDIR_SIZE);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = ICO
  header.writeUInt16LE(pngBuffers.length, 4);

  const entries = pngBuffers.map((png, i) => {
    const entry = Buffer.alloc(ICONDIRENTRY_SIZE);
    const sz = sizes[i];
    entry.writeUInt8(sz >= 256 ? 0 : sz, 0); // width  (0 = 256)
    entry.writeUInt8(sz >= 256 ? 0 : sz, 1); // height
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8); // payload size
    return entry;
  });

  let runningOffset = headerLen;
  for (let i = 0; i < entries.length; i++) {
    entries[i].writeUInt32LE(runningOffset, 12);
    runningOffset += pngBuffers[i].length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers]);
}

async function main() {
  console.log(`Reading source: ${SOURCE_LOGO}`);

  // ---- Standalone PNGs -------------------------------------------------
  for (const { name, size } of PNG_OUTPUTS) {
    const png = await buildIcon(size);
    await writeFile(resolve(PUBLIC_DIR, name), png);
    console.log(`  wrote ${name} (${size}×${size}, ${png.length} bytes)`);
  }

  // ---- Multi-res ICO ---------------------------------------------------
  const icoPngs = await Promise.all(ICO_SIZES.map(buildIcon));
  const ico = buildIco(icoPngs, ICO_SIZES);
  await writeFile(resolve(PUBLIC_DIR, 'favicon.ico'), ico);
  console.log(`  wrote favicon.ico (${ICO_SIZES.join('+')} px, ${ico.length} bytes)`);

  // ---- SVG wrapper with embedded raster -------------------------------
  // Modern browsers prefer the SVG favicon. Since our source is already a
  // raster, the SVG wraps the high-res 512px PNG so the rendering result
  // is identical to the PNG variants — but browsers that ask for the SVG
  // get one valid SVG response instead of falling all the way back to
  // .ico. Trade-off: the SVG file is bigger than a hand-authored vector,
  // but visually matches the navbar logo exactly.
  const masterPng = await buildIcon(512);
  const masterB64 = masterPng.toString('base64');
  const svgContent =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="The Driver">\n` +
    `  <image width="512" height="512" href="data:image/png;base64,${masterB64}"/>\n` +
    `</svg>\n`;
  await writeFile(resolve(PUBLIC_DIR, 'favicon.svg'), svgContent);
  console.log(`  wrote favicon.svg (raster-embedded, ${svgContent.length} bytes)`);

  console.log('Favicon set generated.');
}

main().catch((err) => {
  console.error('Favicon generation failed:', err);
  process.exit(1);
});
