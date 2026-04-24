import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Folder scan is filesystem-relative to /public so the returned paths are
// ready to use as browser URLs (e.g. "/images/fleet/tesla.jpg").
const PUBLIC_DIR = join(process.cwd(), 'public');

function listFolder(relFolder) {
  const abs = join(PUBLIC_DIR, relFolder);
  if (!existsSync(abs)) return [];
  try {
    return readdirSync(abs).filter((f) => !f.startsWith('.'));
  } catch {
    return [];
  }
}

/**
 * Scan `public/{folder}` for a file whose lowercased name contains any of
 * `keywords`. If multiple files match, pick the first alphabetically.
 *
 * Returns `{ avif, webp, jpg }` with public URL paths — any format that
 * exists on disk (for the same basename) is returned; missing formats are
 * `null`. If nothing matched, everything is `null` and `missing: true`.
 */
export function findImageByKeywords(folder, keywords) {
  const files = listFolder(folder).slice().sort((a, b) => a.localeCompare(b));
  const lowerKeywords = keywords.map((k) => k.toLowerCase());
  // Priority: walk keywords IN ORDER, returning the first alphabetical file
  // that contains that keyword. So "hotel" beats "paris" even if both match.
  let match;
  for (const kw of lowerKeywords) {
    const found = files.find((f) => f.toLowerCase().includes(kw));
    if (found) { match = found; break; }
  }

  if (!match) {
    return { avif: null, webp: null, jpg: null, missing: true, base: null };
  }

  // Strip extension — look for sibling files with other formats
  const dot = match.lastIndexOf('.');
  const base = dot >= 0 ? match.slice(0, dot) : match;
  const ext = dot >= 0 ? match.slice(dot + 1).toLowerCase() : '';
  const urlPrefix = `/${folder.replace(/\\/g, '/').replace(/\/+$/, '')}/${base}`;

  const candidates = {
    avif: `${urlPrefix}.avif`,
    webp: `${urlPrefix}.webp`,
    jpg: `${urlPrefix}.jpg`,
    jpeg: `${urlPrefix}.jpeg`,
    png: `${urlPrefix}.png`,
  };

  const presentBases = new Set(files.map((f) => f.toLowerCase()));
  const has = (fullName) => presentBases.has(fullName.toLowerCase());

  const result = {
    avif: has(`${base}.avif`) ? candidates.avif : null,
    webp: has(`${base}.webp`) ? candidates.webp : null,
    jpg: null,
    missing: false,
    base,
  };

  // JPG fallback — prefer .jpg, then .jpeg, then the matched file itself
  // (only relevant if the matched file is png, in which case we set jpg to the png path)
  if (has(`${base}.jpg`)) result.jpg = candidates.jpg;
  else if (has(`${base}.jpeg`)) result.jpg = candidates.jpeg;
  else if (ext === 'png') result.jpg = candidates.png;
  else if (ext === 'avif' && !result.jpg) result.jpg = null; // no raster fallback yet
  else if (ext === 'webp' && !result.jpg) result.jpg = null;

  return result;
}

/**
 * Log helper — prints what matched (and what didn't) so the build output is
 * useful as a debugging trail when new photos are added.
 */
export function logImageMatch(sectionLabel, destinationLabel, result, keywords) {
  if (result.missing) {
    console.warn(
      `[images] No photo found for: ${sectionLabel} · ${destinationLabel} ` +
        `(searched keywords: ${keywords.join(', ')})`,
    );
  } else {
    const formats = [result.avif && 'avif', result.webp && 'webp', result.jpg && 'jpg']
      .filter(Boolean)
      .join('+');
    console.log(
      `[images] ${sectionLabel} · ${destinationLabel} → ${result.base} (${formats})`,
    );
  }
}
