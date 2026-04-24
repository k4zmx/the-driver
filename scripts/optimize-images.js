#!/usr/bin/env node
/**
 * One-shot image optimizer.
 *
 * Walks `public/images/fleet/` and `public/images/routes/`, and for every
 * raster source (.jpg / .jpeg / .png / .avif / .webp) it generates the
 * missing sibling formats so browsers can pick the best format via
 * `<picture><source>`:
 *
 *   - .jpg   (always; used as universal fallback, max 1600px wide, q85, stripped)
 *   - .webp  (generated if missing)
 *   - .avif  (generated if missing — smaller, for modern browsers)
 *
 * Resize caps (longest side):
 *   - fleet:  1200px
 *   - routes: 800px
 *
 * Skips any sibling that already exists AND is newer than the source.
 *
 * Requires `sharp`. Install once:
 *   npm install --save-dev sharp
 *
 * Then run:
 *   npm run optimize-images
 *
 * Do NOT run this on every build — it's slow. Ship the generated files as
 * part of the repo under public/images/.
 */

import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.error('[optimize-images] `sharp` is not installed. Run: npm install --save-dev sharp');
  process.exit(1);
}

const FOLDERS = [
  { dir: 'public/images/fleet', maxWidth: 1200 },
  { dir: 'public/images/routes', maxWidth: 800 },
];

const RASTER_EXT = new Set(['.jpg', '.jpeg', '.png', '.avif', '.webp']);

function needsUpdate(srcPath, outPath) {
  if (!existsSync(outPath)) return true;
  try {
    const srcMtime = statSync(srcPath).mtimeMs;
    const outMtime = statSync(outPath).mtimeMs;
    return outMtime < srcMtime;
  } catch {
    return true;
  }
}

async function processFile(srcPath, maxWidth) {
  const ext = extname(srcPath).toLowerCase();
  const base = basename(srcPath, ext);
  const dir = srcPath.slice(0, srcPath.length - base.length - ext.length);
  const outJpg = join(dir, `${base}.jpg`);
  const outWebp = join(dir, `${base}.webp`);
  const outAvif = join(dir, `${base}.avif`);

  // Read source once into a Buffer so we can overwrite in place if the
  // source itself is the .jpg (resize it down + strip metadata).
  const { readFile, writeFile } = await import('node:fs/promises');
  const srcBuf = await readFile(srcPath);

  const pipe = () =>
    sharp(srcBuf)
      .rotate() // honor EXIF orientation before stripping
      .resize({ width: maxWidth, withoutEnlargement: true });

  const toRun = [];

  // JPG — always generate. If the source IS a jpg we resize/recompress and
  // overwrite it via a temp swap (sharp cannot write to the file it reads).
  if (needsUpdate(srcPath, outJpg) || srcPath === outJpg) {
    const jpgBuf = await pipe().jpeg({ quality: 85, mozjpeg: true, progressive: true }).toBuffer();
    if (srcPath === outJpg) {
      await writeFile(outJpg, jpgBuf);
    } else {
      await writeFile(outJpg, jpgBuf);
    }
    toRun.push('jpg');
  }

  if (srcPath !== outWebp && needsUpdate(srcPath, outWebp)) {
    toRun.push('webp');
    await pipe().webp({ quality: 80, effort: 4 }).toFile(outWebp);
  }
  if (srcPath !== outAvif && needsUpdate(srcPath, outAvif)) {
    toRun.push('avif');
    await pipe().avif({ quality: 55, effort: 4 }).toFile(outAvif);
  }

  if (toRun.length === 0) return { srcPath, skipped: true };
  return { srcPath, written: toRun.length, formats: toRun.join('+') };
}

let totalProcessed = 0;
let totalSkipped = 0;

for (const { dir, maxWidth } of FOLDERS) {
  if (!existsSync(dir)) {
    console.log(`[optimize-images] skip missing folder: ${dir}`);
    continue;
  }
  const files = readdirSync(dir)
    .filter((f) => RASTER_EXT.has(extname(f).toLowerCase()))
    .sort();

  console.log(`[optimize-images] ${dir} — ${files.length} source file(s), max width ${maxWidth}px`);

  for (const f of files) {
    const srcPath = join(dir, f);
    try {
      const res = await processFile(srcPath, maxWidth);
      if (res.skipped) {
        totalSkipped++;
        console.log(`  · up-to-date: ${f}`);
      } else {
        totalProcessed++;
        console.log(`  ✓ generated ${res.written} variant(s) for: ${f}`);
      }
    } catch (err) {
      console.error(`  ✗ failed on ${f}:`, err.message);
    }
  }
}

console.log(`[optimize-images] done. Processed: ${totalProcessed}, up-to-date: ${totalSkipped}.`);
