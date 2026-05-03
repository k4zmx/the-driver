// Favicon generator — turns /public/favicon.svg into the full set of
// derivative icons that browsers, iOS home screens, and PWA installers
// expect. Run via `npm run generate-favicons` (manual; not on every build).
//
// Outputs (all written to /public/):
//   favicon.svg            — already-authored master, copied as-is
//   favicon.ico            — 16/32/48 multi-resolution ICO
//   apple-touch-icon.png   — 180×180 (iOS home screen)
//   icon-192.png           — 192×192 (Android Chrome / PWA)
//   icon-512.png           — 512×512 (PWA install / splash)
//
// Dependencies:
//   sharp — already a devDependency. PNG rasterization from SVG.
//   ICO encoding is inlined below (no extra package needed) — the format
//   is a 6-byte header + N×16-byte directory entries + concatenated PNG
//   payloads, easy to assemble by hand from sharp's PNG output.

import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, '..', 'public');
const SOURCE_SVG = resolve(PUBLIC_DIR, 'favicon.svg');

// Sizes for the .ico file's internal PNG variants.
const ICO_SIZES = [16, 32, 48];
// Sizes for standalone PNG outputs.
const PNG_OUTPUTS = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

/**
 * Build a multi-resolution ICO file from an array of PNG buffers.
 * Each PNG is embedded as-is — the ICO directory header points at its
 * offset and length within the final file.
 *
 * Layout:
 *   [6 bytes header] [16 bytes per image directory] × N [PNG data...] × N
 */
function buildIco(pngBuffers, sizes) {
  if (pngBuffers.length !== sizes.length) {
    throw new Error('buildIco: png/size length mismatch');
  }

  const ICONDIR_SIZE = 6;
  const ICONDIRENTRY_SIZE = 16;
  const headerLen = ICONDIR_SIZE + ICONDIRENTRY_SIZE * pngBuffers.length;

  // ICONDIR header — reserved (0), type (1=ICO), count
  const header = Buffer.alloc(ICONDIR_SIZE);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: 1=ICO (2=CUR)
  header.writeUInt16LE(pngBuffers.length, 4);

  // Each ICONDIRENTRY — references one PNG payload by offset+size
  const entries = pngBuffers.map((png, i) => {
    const entry = Buffer.alloc(ICONDIRENTRY_SIZE);
    const sz = sizes[i];
    // Width/height: 0 means 256, otherwise the size byte
    entry.writeUInt8(sz >= 256 ? 0 : sz, 0);
    entry.writeUInt8(sz >= 256 ? 0 : sz, 1);
    entry.writeUInt8(0, 2); // palette colors (0 for non-palette)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8); // PNG payload size
    // Offset is computed below once we know all entries' sizes
    return entry;
  });

  // Walk through and patch each entry's offset field
  let runningOffset = headerLen;
  for (let i = 0; i < entries.length; i++) {
    entries[i].writeUInt32LE(runningOffset, 12);
    runningOffset += pngBuffers[i].length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers]);
}

async function main() {
  console.log(`Reading master: ${SOURCE_SVG}`);
  const svgBuffer = await readFile(SOURCE_SVG);

  // ---- Standalone PNGs -------------------------------------------------
  for (const { name, size } of PNG_OUTPUTS) {
    const out = resolve(PUBLIC_DIR, name);
    await sharp(svgBuffer, { density: 384 })
      .resize(size, size)
      .png({ compressionLevel: 9, palette: false })
      .toFile(out);
    console.log(`  wrote ${name} (${size}×${size})`);
  }

  // ---- Multi-res ICO ---------------------------------------------------
  const icoPngs = await Promise.all(
    ICO_SIZES.map((size) =>
      sharp(svgBuffer, { density: 384 })
        .resize(size, size)
        .png({ compressionLevel: 9, palette: false })
        .toBuffer(),
    ),
  );
  const ico = buildIco(icoPngs, ICO_SIZES);
  const icoPath = resolve(PUBLIC_DIR, 'favicon.ico');
  await writeFile(icoPath, ico);
  console.log(`  wrote favicon.ico (${ICO_SIZES.join('+')} px, ${ico.length} bytes)`);

  console.log('Favicon set generated.');
}

main().catch((err) => {
  console.error('Favicon generation failed:', err);
  process.exit(1);
});
