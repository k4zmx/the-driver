// French branded HTML email — chauffeur notification.
// Recipient is always the same French-speaking chauffeur, so the template
// is monolingual (French) regardless of the customer's site locale.
//
// Email-safe HTML rules followed (Round 21 hardening):
//   - Table-only layout, no flex/grid
//   - Inline styles only (no <style> blocks beyond the MSO conditional)
//   - 6-char hex colors only — no rgba, hsl, named colors, CSS vars
//   - Font stack: Georgia for headings, Arial/Helvetica for body
//   - NO border-radius (Outlook strips it)
//   - Padding/margin LONGHAND (Outlook drops shorthand)
//   - HTML entities for accented chars (`&eacute;`, `&middot;`, `&rarr;`, `&euro;`)
//   - Eyebrows pre-uppercased in markup (no text-transform reliance)
//   - mso-line-height-rule:exactly on text cells
//   - bgcolor + style background-color on color bands (Outlook desktop quirk)

// ── Branded constants ────────────────────────────────────────────────────
const LOGO_URL = 'https://thedriver.fr/newlogo.png';
const LOGO_WIDTH = 96;
const LOGO_HEIGHT = 55;
const LOGO_COL_WIDTH = LOGO_WIDTH + 16;

const COLORS = {
  cream: '#F8F5EE',
  paper: '#FFFFFF',
  ink: '#1A1A1A',
  graphite: '#4A4A48',
  accent: '#C94F3A',
  smoke: '#E8E3D8',
  faded: '#A8A39A',
};
const FONT_BODY = "Arial, Helvetica, 'Helvetica Neue', sans-serif";
const FONT_DISPLAY = "Georgia, 'Times New Roman', Times, serif";
const TD_BODY = 'mso-line-height-rule:exactly; line-height:18px;';

// ── French labels (pre-entity-encoded, eyebrows pre-uppercased) ──────────
const L = {
  eyebrow:        'DRIVER SERVICES &middot; NOUVELLE R&Eacute;SERVATION',
  total:          'TOTAL',
  oneWay:         'Aller simple',
  roundTrip:      'Aller-retour',
  passengers:     'passagers',
  client:         'CLIENT',
  phone:          'T&eacute;l&eacute;phone',
  email:          'Email',
  flightInfo:     'INFOS VOL',
  flightNumber:   'Num&eacute;ro de vol',
  trainInfo:      'INFOS GARE',
  station:        'Gare',
  trainNumber:    'Num&eacute;ro de train',
  address:        'ADRESSE',
  pickup:         'D&eacute;part',
  dropoff:        'Arriv&eacute;e',
  childSeats:     'SI&Egrave;GES ENFANTS',
  seatCosy:       'Cosy b&eacute;b&eacute;',
  seatBaby:       'Si&egrave;ge b&eacute;b&eacute;',
  seatBooster:    'R&eacute;hausseur',
  notes:          'NOTES DU CLIENT',
  customerLang:   'LANGUE DU CLIENT',
  receivedVia:    'Re&ccedil;u via',
  notProvided:    'Non renseign&eacute;',
};

const LANGUAGE_LABELS = {
  fr: 'Français',
  en: 'Anglais',
  es: 'Espagnol',
  it: 'Italien',
};

// ── Helpers ──────────────────────────────────────────────────────────────
function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDateLongFR(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = String(dateStr).split('-').map(Number);
  if (!y || !m || !d) return String(dateStr);
  const dt = new Date(Date.UTC(y, m - 1, d));
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(dt);
  } catch {
    return `${d}/${m}/${y}`;
  }
}

function formatSubmittedAtFR() {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 16).replace('T', ' ');
  }
}

function row(label, value) {
  return `<tr>
    <td valign="top" width="120" style="width:120px; padding-top:5px; padding-right:0; padding-bottom:5px; padding-left:0; color:${COLORS.graphite}; font-family:${FONT_BODY}; font-size:13px; ${TD_BODY}">${label}</td>
    <td valign="top" style="padding-top:5px; padding-right:0; padding-bottom:5px; padding-left:0; color:${COLORS.ink}; font-family:${FONT_BODY}; font-size:13px; font-weight:bold; ${TD_BODY}">${value}</td>
  </tr>`;
}

function linkRow(label, value, href) {
  return `<tr>
    <td valign="top" width="120" style="width:120px; padding-top:5px; padding-right:0; padding-bottom:5px; padding-left:0; color:${COLORS.graphite}; font-family:${FONT_BODY}; font-size:13px; ${TD_BODY}">${label}</td>
    <td valign="top" style="padding-top:5px; padding-right:0; padding-bottom:5px; padding-left:0; font-family:${FONT_BODY}; font-size:13px; ${TD_BODY}"><a href="${esc(href)}" style="color:${COLORS.accent}; text-decoration:none; font-weight:bold;">${esc(value)}</a></td>
  </tr>`;
}

function sectionHead(title) {
  return `<p style="margin-top:0; margin-right:0; margin-bottom:10px; margin-left:0; color:${COLORS.graphite}; font-family:${FONT_BODY}; font-size:11px; font-weight:bold; ${TD_BODY}">${title}</p>`;
}

function section(title, innerRows) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; margin-top:24px; border-top-width:1px; border-top-style:solid; border-top-color:${COLORS.smoke};">
    <tr><td style="padding-top:20px; padding-right:0; padding-bottom:0; padding-left:0;">
      ${sectionHead(title)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">${innerRows}</table>
    </td></tr>
  </table>`;
}

// ── Main builder ─────────────────────────────────────────────────────────
//
// Expected `data` shape (sent from the static site):
//   firstName, lastName, email, countryCode, phone
//   pickup, dropoff, date, time, pax, tripType ('one-way' | 'round-trip')
//   totalPrice, vehicleSummary, locale ('fr'|'en'|'es'|'it')
//   pickupStation, dropoffStation, trainNumber           (conditional)
//   pickupAddress, dropoffAddress                         (conditional)
//   flightNumber                                          (conditional)
//   cosyCount, siegeCount, rehausseurCount  (numbers, default 0)
//   notes                                                 (conditional)
export function buildClientEmailHtml(data) {
  // Header route — fold station name into pickup/dropoff label when relevant.
  const pickupLabel = data.pickupStation
    ? `${esc(data.pickup)} (${esc(data.pickupStation)})`
    : esc(data.pickup || '—');
  const dropoffLabel = data.dropoffStation
    ? `${esc(data.dropoff)} (${esc(data.dropoffStation)})`
    : esc(data.dropoff || '—');

  const tripTypeLabel = data.tripType === 'round-trip' ? L.roundTrip : L.oneWay;
  const dateLong = formatDateLongFR(data.date);
  const totalText = data.totalPrice ? `${esc(data.totalPrice)} &euro;` : '&mdash;';
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || L.notProvided;
  const phoneFull = [data.countryCode, data.phone].filter(Boolean).join(' ');
  const phoneClean = phoneFull.replace(/[^+\d]/g, '');

  // ── Body sections (conditional) ────────────────────────────────────
  let body = '';

  // CLIENT (always)
  body += `<p style="margin-top:0; margin-right:0; margin-bottom:6px; margin-left:0; color:${COLORS.graphite}; font-family:${FONT_BODY}; font-size:11px; font-weight:bold; ${TD_BODY}">${L.client}</p>
  <h2 style="margin-top:0; margin-right:0; margin-bottom:14px; margin-left:0; font-family:${FONT_DISPLAY}; font-size:19px; font-weight:bold; color:${COLORS.ink}; line-height:24px; mso-line-height-rule:exactly;">${esc(fullName)}</h2>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">
    ${phoneFull ? linkRow(L.phone, phoneFull, `tel:${phoneClean}`) : ''}
    ${data.email ? linkRow(L.email, data.email, `mailto:${data.email}`) : ''}
  </table>`;

  // FLIGHT INFO
  if (data.flightNumber) {
    body += section(L.flightInfo, row(L.flightNumber, esc(data.flightNumber)));
  }

  // STATION INFO
  if (data.pickupStation || data.dropoffStation || data.trainNumber) {
    const stationName = data.pickupStation || data.dropoffStation;
    let inner = '';
    if (stationName) inner += row(L.station, esc(stationName));
    if (data.trainNumber) inner += row(L.trainNumber, esc(data.trainNumber));
    body += section(L.trainInfo, inner);
  }

  // ADDRESSES
  if (data.pickupAddress || data.dropoffAddress) {
    let inner = '';
    if (data.pickupAddress) inner += row(L.pickup, esc(data.pickupAddress));
    if (data.dropoffAddress) inner += row(L.dropoff, esc(data.dropoffAddress));
    body += section(L.address, inner);
  }

  // CHILD SEATS
  const cosy = Number(data.cosyCount || data.seatCosy) || 0;
  const baby = Number(data.siegeCount || data.seatBaby) || 0;
  const booster = Number(data.rehausseurCount || data.seatBooster) || 0;
  if (cosy + baby + booster > 0) {
    let inner = '';
    if (cosy > 0) inner += row(L.seatCosy, String(cosy));
    if (baby > 0) inner += row(L.seatBaby, String(baby));
    if (booster > 0) inner += row(L.seatBooster, String(booster));
    body += section(L.childSeats, inner);
  }

  // CUSTOMER LANGUAGE — always shown so the chauffeur knows which language
  // to reply in.
  body += section(
    L.customerLang,
    row('&mdash;', esc(LANGUAGE_LABELS[data.locale] || data.locale || 'Inconnu')),
  );

  // NOTES
  if (data.notes && String(data.notes).trim()) {
    body += `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; margin-top:24px; border-top-width:1px; border-top-style:solid; border-top-color:${COLORS.smoke};">
      <tr><td style="padding-top:20px; padding-right:0; padding-bottom:0; padding-left:0;">
        ${sectionHead(L.notes)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; background-color:${COLORS.cream};">
          <tr><td style="padding-top:14px; padding-right:16px; padding-bottom:14px; padding-left:16px; font-family:${FONT_BODY}; font-size:13px; color:${COLORS.ink}; font-style:italic; line-height:20px; mso-line-height-rule:exactly;">${esc(String(data.notes).trim()).replace(/\n/g, '<br />')}</td></tr>
        </table>
      </td></tr>
    </table>`;
  }

  const submittedAt = formatSubmittedAtFR();
  const vehicleSummary = data.vehicleSummary || '&mdash;';
  const passengerLine = `${tripTypeLabel} &middot; ${esc(String(data.pax || data.passengers || 1))} ${L.passengers}`;

  // ── Top-level skeleton ─────────────────────────────────────────────
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${L.eyebrow}</title>
<!--[if mso]>
<style type="text/css">
  table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
  td { mso-line-height-rule: exactly; }
  body, table, td, p, a { font-family: Arial, sans-serif !important; }
</style>
<![endif]-->
</head>
<body style="margin-top:0; margin-right:0; margin-bottom:0; margin-left:0; padding-top:0; padding-right:0; padding-bottom:0; padding-left:0; background-color:${COLORS.cream}; font-family:${FONT_BODY}; color:${COLORS.ink}; line-height:20px; mso-line-height-rule:exactly;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; background-color:${COLORS.cream};">
  <tr><td align="center" style="padding-top:32px; padding-right:16px; padding-bottom:32px; padding-left:16px;">

    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; border-collapse:collapse; background-color:${COLORS.paper};">

      <!-- HEADER BAND (terracotta) — 2-column nested table: text left, logo right. -->
      <tr><td bgcolor="${COLORS.accent}" style="background-color:${COLORS.accent}; padding-top:24px; padding-right:32px; padding-bottom:24px; padding-left:32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">
          <tr>
            <td valign="top" style="padding-top:0; padding-right:16px; padding-bottom:0; padding-left:0;">
              <p style="margin-top:0; margin-right:0; margin-bottom:8px; margin-left:0; color:${COLORS.cream}; font-family:${FONT_BODY}; font-size:11px; font-weight:bold; line-height:14px; mso-line-height-rule:exactly;">${L.eyebrow}</p>
              <h1 style="margin-top:0; margin-right:0; margin-bottom:0; margin-left:0; color:${COLORS.paper}; font-family:${FONT_DISPLAY}; font-size:26px; font-weight:bold; line-height:32px; mso-line-height-rule:exactly;">${pickupLabel} &rarr; ${dropoffLabel}</h1>
              ${dateLong || data.time ? `<p style="margin-top:6px; margin-right:0; margin-bottom:0; margin-left:0; color:${COLORS.cream}; font-family:${FONT_BODY}; font-size:14px; line-height:20px; mso-line-height-rule:exactly;">${esc(dateLong)}${data.time ? ' &middot; ' + esc(data.time) : ''}</p>` : ''}
            </td>
            <td valign="top" align="right" width="${LOGO_COL_WIDTH}" style="width:${LOGO_COL_WIDTH}px; padding-top:0; padding-right:0; padding-bottom:0; padding-left:0;">
              <img src="${LOGO_URL}" alt="Driver Services" width="${LOGO_WIDTH}" height="${LOGO_HEIGHT}" border="0" style="display:block; width:${LOGO_WIDTH}px; height:${LOGO_HEIGHT}px; max-width:${LOGO_WIDTH}px; border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic;" />
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- TOTAL BAND (ink) -->
      <tr><td bgcolor="${COLORS.ink}" style="background-color:${COLORS.ink}; padding-top:18px; padding-right:32px; padding-bottom:18px; padding-left:32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">
          <tr>
            <td valign="middle" style="color:${COLORS.faded}; font-family:${FONT_BODY}; font-size:11px; font-weight:bold; line-height:14px; mso-line-height-rule:exactly;">${L.total}</td>
            <td valign="middle" align="right" style="color:${COLORS.paper}; font-family:${FONT_DISPLAY}; font-size:22px; font-weight:bold; line-height:24px; mso-line-height-rule:exactly;">${totalText}</td>
          </tr>
          <tr>
            <td valign="middle" style="padding-top:6px; color:${COLORS.faded}; font-family:${FONT_BODY}; font-size:12px; line-height:16px; mso-line-height-rule:exactly;">${passengerLine}</td>
            <td valign="middle" align="right" style="padding-top:6px; color:${COLORS.faded}; font-family:${FONT_BODY}; font-size:12px; line-height:16px; mso-line-height-rule:exactly;">${esc(vehicleSummary)}</td>
          </tr>
        </table>
      </td></tr>

      <!-- BODY -->
      <tr><td style="padding-top:28px; padding-right:32px; padding-bottom:28px; padding-left:32px;">${body}</td></tr>

      <!-- FOOTER -->
      <tr><td align="center" bgcolor="${COLORS.cream}" style="background-color:${COLORS.cream}; padding-top:16px; padding-right:32px; padding-bottom:16px; padding-left:32px; border-top-width:1px; border-top-style:solid; border-top-color:${COLORS.smoke};">
        <p style="margin-top:0; margin-right:0; margin-bottom:0; margin-left:0; color:${COLORS.graphite}; font-family:${FONT_BODY}; font-size:11px; line-height:14px; mso-line-height-rule:exactly;">${L.receivedVia} <span style="color:${COLORS.accent}; font-weight:bold;">Driver Services</span> &middot; ${esc(submittedAt)}</p>
      </td></tr>

    </table>

  </td></tr>
</table>

</body>
</html>`;
}
