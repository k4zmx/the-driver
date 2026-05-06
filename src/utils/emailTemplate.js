// Email-formatting helpers for booking submissions to Web3Forms.
//
// IMPORTANT: Web3Forms' free tier does NOT support custom HTML email bodies
// via the `template` field — that's a Pro-only feature. Round 19's HTML
// builder approach was abandoned because the chauffeur saw raw HTML code
// in his Hotmail inbox.
//
// Strategy now: build a clean structured FormData with French emoji-prefixed
// labels. Web3Forms renders each key/value pair as "Label: Value" in the
// email body — that's the entirety of the email format. Customer-typed
// values come through as-is in whatever language they typed; LABELS are
// always French because the recipient is a French-speaking chauffeur.

// ── Date helpers ──────────────────────────────────────────────────────────
//
// Always French — the date is for the chauffeur's reference, not the
// customer. No locale parameter; no surprises in the inbox.

const FR_LONG_OPTS = {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
};

export function formatDateLong(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = String(dateStr).split('-').map(Number);
  if (!y || !m || !d) return String(dateStr);
  // Anchor at UTC noon to dodge timezone drift around DST boundaries.
  const dt = new Date(Date.UTC(y, m - 1, d));
  try {
    return new Intl.DateTimeFormat('fr-FR', FR_LONG_OPTS).format(dt);
  } catch {
    return `${d}/${m}/${y}`;
  }
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = String(dateStr).split('-').map(Number);
  if (!y || !m || !d) return String(dateStr);
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

// ── Subject line — always French, ASCII-only, under 60 chars ──────────────
//
// Some old email clients strip non-ASCII chars from subject lines. We force
// pure ASCII (no accents, no →) so the inbox preview stays readable
// everywhere. The full route + accented place names live in the body.

function asciiFold(s) {
  return String(s == null ? '' : s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7e]/g, '');
}

export function buildSubject({ pickup, dropoff, date, time }) {
  const p = asciiFold(pickup);
  const d = asciiFold(dropoff);
  const ds = formatDateShort(date);
  const t = time ? ' ' + time : '';
  return `Reservation: ${p} / ${d} (${ds}${t})`;
}

// ── Customer locale → French label ────────────────────────────────────────
//
// Lets the chauffeur see at a glance what language the customer typed in,
// so he can phrase his reply (or phone call-back) in that language.

const LANGUAGE_LABELS = {
  fr: 'Français',
  en: 'Anglais',
  es: 'Espagnol',
  it: 'Italien',
};

export function getCustomerLanguageLabel(locale) {
  return LANGUAGE_LABELS[locale] || String(locale || '');
}
