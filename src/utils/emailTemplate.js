// Custom branded HTML email template — booking submissions to the.driver@hotmail.com
// via Web3Forms' `template` hidden field.
//
// OUTLOOK-FIRST: this template is written defensively so it renders correctly
// in Outlook 2016/2019/2021 desktop, Outlook.com web, Hotmail, and Office 365
// — all known to be inconsistent with modern HTML email. Apple Mail and Gmail
// (more forgiving) keep working as a side-effect.
//
// Hard rules followed throughout:
//   1. Table-based layout only (no flex/grid/positioning)
//   2. ALL styles inline (no <style> blocks beyond the MSO conditional reset)
//   3. Hex colors only — 6-character (no rgba, hsl, named colors, CSS vars)
//   4. Email-safe font stack: Georgia for headings, Arial/Helvetica for body
//   5. NO border-radius (Outlook strips it; corners are square everywhere)
//   6. Padding/margin/border are LONGHAND (Outlook drops shorthand sometimes)
//   7. HTML entities for all French/Spanish/Italian/Sym chars in OUR strings
//      (user-supplied content is UTF-8 + meta charset; modern clients decode)
//   8. Eyebrows pre-uppercased in markup (don't rely on text-transform — Outlook
//      sometimes ignores it). Letter-spacing dropped (Outlook strips it).
//   9. Absolute pixel widths, never em/rem/vw/vh.
//  10. Subject lines are ASCII-only (no →, no accented chars, under 60 chars)
//
// Web3Forms field names: `template` (HTML body), `subject`, `from_name`, `replyto`
// AUTO-REPLY: dashboard-only feature on Web3Forms paid plan; not implemented here.

// ── Per-locale section labels (PRE-ENTITY-ENCODED, eyebrows pre-uppercased) ──
const LABELS = {
  fr: {
    eyebrow:      'DRIVER SERVICES &middot; NOUVELLE R&Eacute;SERVATION',
    total:        'TOTAL',
    oneWay:       'Aller simple',
    roundTrip:    'Aller-retour',
    passengers:   'passagers',
    client:       'CLIENT',
    phone:        'T&eacute;l&eacute;phone',
    email:        'Email',
    flightInfo:   'INFOS VOL',
    flightNumber: 'Num&eacute;ro de vol',
    trainInfo:    'INFOS GARE',
    station:      'Gare',
    trainNumber:  'Num&eacute;ro de train',
    address:      'ADRESSE',
    pickup:       'D&eacute;part',
    dropoff:      'Arriv&eacute;e',
    childSeats:   'SI&Egrave;GES ENFANTS',
    seatCosy:     'Cosy b&eacute;b&eacute;',
    seatBaby:     'Si&egrave;ge b&eacute;b&eacute;',
    seatBooster:  'R&eacute;hausseur',
    extraStop:    'ARR&Ecirc;T SUPPL&Eacute;MENTAIRE',
    returnTrip:   'RETOUR',
    notes:        'NOTES DU CLIENT',
    receivedVia:  'Re&ccedil;u via',
    notProvided:  'Non renseign&eacute;',
  },
  en: {
    eyebrow:      'DRIVER SERVICES &middot; NEW RESERVATION',
    total:        'TOTAL',
    oneWay:       'One-way',
    roundTrip:    'Round-trip',
    passengers:   'passengers',
    client:       'CUSTOMER',
    phone:        'Phone',
    email:        'Email',
    flightInfo:   'FLIGHT INFO',
    flightNumber: 'Flight number',
    trainInfo:    'STATION INFO',
    station:      'Station',
    trainNumber:  'Train number',
    address:      'ADDRESS',
    pickup:       'Pickup',
    dropoff:      'Dropoff',
    childSeats:   'CHILD SEATS',
    seatCosy:     'Infant carrier',
    seatBaby:     'Toddler seat',
    seatBooster:  'Booster seat',
    extraStop:    'EXTRA STOP',
    returnTrip:   'RETURN',
    notes:        'CUSTOMER NOTES',
    receivedVia:  'Received via',
    notProvided:  'Not provided',
  },
  es: {
    eyebrow:      'DRIVER SERVICES &middot; NUEVA RESERVA',
    total:        'TOTAL',
    oneWay:       'Solo ida',
    roundTrip:    'Ida y vuelta',
    passengers:   'pasajeros',
    client:       'CLIENTE',
    phone:        'Tel&eacute;fono',
    email:        'Email',
    flightInfo:   'INFO VUELO',
    flightNumber: 'N&uacute;mero de vuelo',
    trainInfo:    'INFO ESTACI&Oacute;N',
    station:      'Estaci&oacute;n',
    trainNumber:  'N&uacute;mero de tren',
    address:      'DIRECCI&Oacute;N',
    pickup:       'Recogida',
    dropoff:      'Destino',
    childSeats:   'ASIENTOS NI&Ntilde;OS',
    seatCosy:     'Capazo beb&eacute;',
    seatBaby:     'Silla beb&eacute;',
    seatBooster:  'Asiento elevador',
    extraStop:    'PARADA EXTRA',
    returnTrip:   'VUELTA',
    notes:        'NOTAS DEL CLIENTE',
    receivedVia:  'Recibido v&iacute;a',
    notProvided:  'No indicado',
  },
  it: {
    eyebrow:      'DRIVER SERVICES &middot; NUOVA PRENOTAZIONE',
    total:        'TOTALE',
    oneWay:       'Solo andata',
    roundTrip:    'Andata e ritorno',
    passengers:   'passeggeri',
    client:       'CLIENTE',
    phone:        'Telefono',
    email:        'Email',
    flightInfo:   'INFO VOLO',
    flightNumber: 'Numero di volo',
    trainInfo:    'INFO STAZIONE',
    station:      'Stazione',
    trainNumber:  'Numero di treno',
    address:      'INDIRIZZO',
    pickup:       'Partenza',
    dropoff:      'Arrivo',
    childSeats:   'SEGGIOLINI',
    seatCosy:     'Ovetto neonato',
    seatBaby:     'Seggiolino bambino',
    seatBooster:  'Rialzo',
    extraStop:    'TAPPA EXTRA',
    returnTrip:   'RITORNO',
    notes:        'NOTE DEL CLIENTE',
    receivedVia:  'Ricevuto tramite',
    notProvided:  'Non indicato',
  },
};

const LOCALE_BCP47 = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', it: 'it-IT' };

// ── HTML escape for user-supplied text (XSS-safe). UTF-8 in the body +
// <meta charset="UTF-8"> makes accented chars render correctly in modern
// clients including all current Outlook versions; we don't entity-encode
// every Unicode char in user content (would need a 200-char map). ────────
function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ── Date helpers ────────────────────────────────────────────────────────
export function formatDateLong(dateStr, locale = 'fr') {
  if (!dateStr) return '';
  const tag = LOCALE_BCP47[locale] || LOCALE_BCP47.fr;
  const [y, m, d] = String(dateStr).split('-').map(Number);
  if (!y || !m || !d) return String(dateStr);
  const dt = new Date(Date.UTC(y, m - 1, d));
  try {
    return new Intl.DateTimeFormat(tag, {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(dt);
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

function formatSubmittedAt(locale = 'fr') {
  const tag = LOCALE_BCP47[locale] || LOCALE_BCP47.fr;
  try {
    return new Intl.DateTimeFormat(tag, {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 16).replace('T', ' ');
  }
}

// ── Section / row helpers (longhand CSS, table-only, mso-line-height-rule) ──
//
// Common <td> style fragment for body text — repeats a lot, so a helper
// keeps the verbose longhand readable. Outlook's `mso-line-height-rule:
// exactly` fixes its wonky line-height inheritance.
const TD_BODY = 'mso-line-height-rule:exactly; line-height:18px;';
const COLOR_INK = '#1A1A1A';
const COLOR_GRAPHITE = '#4A4A48';
const COLOR_ACCENT = '#C94F3A';
const COLOR_CREAM = '#F8F5EE';
const COLOR_PAPER = '#FFFFFF';
const COLOR_NIGHT = '#1A1A1A';
const COLOR_SMOKE = '#E8E3D8';
const COLOR_FADED = '#A8A39A';
const FONT_BODY = "Arial, Helvetica, 'Helvetica Neue', sans-serif";
const FONT_DISPLAY = "Georgia, 'Times New Roman', Times, serif";

function row(label, value) {
  return `<tr>
    <td valign="top" width="120" style="width:120px; padding-top:5px; padding-right:0; padding-bottom:5px; padding-left:0; color:${COLOR_GRAPHITE}; font-family:${FONT_BODY}; font-size:13px; ${TD_BODY}">${label}</td>
    <td valign="top" style="padding-top:5px; padding-right:0; padding-bottom:5px; padding-left:0; color:${COLOR_INK}; font-family:${FONT_BODY}; font-size:13px; font-weight:bold; ${TD_BODY}">${value}</td>
  </tr>`;
}

function linkRow(label, value, href) {
  return `<tr>
    <td valign="top" width="120" style="width:120px; padding-top:5px; padding-right:0; padding-bottom:5px; padding-left:0; color:${COLOR_GRAPHITE}; font-family:${FONT_BODY}; font-size:13px; ${TD_BODY}">${label}</td>
    <td valign="top" style="padding-top:5px; padding-right:0; padding-bottom:5px; padding-left:0; font-family:${FONT_BODY}; font-size:13px; ${TD_BODY}"><a href="${esc(href)}" style="color:${COLOR_ACCENT}; text-decoration:none; font-weight:bold;">${esc(value)}</a></td>
  </tr>`;
}

function sectionHead(title) {
  // Pre-uppercased + bold — no text-transform, no letter-spacing reliance.
  return `<p style="margin-top:0; margin-right:0; margin-bottom:10px; margin-left:0; color:${COLOR_GRAPHITE}; font-family:${FONT_BODY}; font-size:11px; font-weight:bold; ${TD_BODY}">${title}</p>`;
}

function section(title, innerRows) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; margin-top:24px; border-top-width:1px; border-top-style:solid; border-top-color:${COLOR_SMOKE};">
    <tr><td style="padding-top:20px; padding-right:0; padding-bottom:0; padding-left:0;">
      ${sectionHead(title)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">${innerRows}</table>
    </td></tr>
  </table>`;
}

// ── Subject line helpers (ASCII-only, ≤60 chars) ────────────────────────
//
// `→` arrow + accented chars get stripped from email subjects in some old
// clients. We force ASCII: "Reservation: CDG / Paris (28/03 14:30)".
const SUBJECT_PREFIX = {
  fr: 'Reservation', en: 'Booking', es: 'Reserva', it: 'Prenotazione',
};

function asciiFold(s) {
  // Strip diacritics so accented place names survive in the subject line.
  // E.g. "Aeroport" stays as-is, an "é" becomes "e", anything still non-
  // ASCII (CJK, emoji) is dropped.
  return String(s == null ? '' : s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7e]/g, '');
}

export function buildSubject(data, locale = 'fr') {
  const prefix = SUBJECT_PREFIX[locale] || SUBJECT_PREFIX.fr;
  const pickup = asciiFold(data.pickup || '');
  const dropoff = asciiFold(data.dropoff || '');
  const date = formatDateShort(data.date);
  const time = data.time ? ' ' + data.time : '';
  return `${prefix}: ${pickup} / ${dropoff} (${date}${time})`;
}

// ── Main builder ────────────────────────────────────────────────────────
export function buildBookingEmailHtml(data, locale = 'fr') {
  const L = LABELS[locale] || LABELS.fr;

  const pickupLabel = data.pickupStation
    ? `${esc(data.pickup)} (${esc(data.pickupStation)})`
    : esc(data.pickup || '—');
  const dropoffLabel = data.dropoffStation
    ? `${esc(data.dropoff)} (${esc(data.dropoffStation)})`
    : esc(data.dropoff || '—');

  const tripTypeLabel = data.tripType === 'round-trip' ? L.roundTrip : L.oneWay;
  const dateLong = formatDateLong(data.date, locale);
  const totalText = data.totalPrice ? `${esc(data.totalPrice)} &euro;` : '&mdash;';
  const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || L.notProvided;
  const phoneFull = [data.countryCode, data.phone].filter(Boolean).join(' ');
  const phoneClean = phoneFull.replace(/[^+\d]/g, '');

  // ── Body sections ────────────────────────────────────────────────────
  let body = '';

  // CLIENT (always)
  body += `<p style="margin-top:0; margin-right:0; margin-bottom:6px; margin-left:0; color:${COLOR_GRAPHITE}; font-family:${FONT_BODY}; font-size:11px; font-weight:bold; ${TD_BODY}">${L.client}</p>
  <h2 style="margin-top:0; margin-right:0; margin-bottom:14px; margin-left:0; font-family:${FONT_DISPLAY}; font-size:19px; font-weight:bold; color:${COLOR_INK}; line-height:24px; mso-line-height-rule:exactly;">${esc(fullName)}</h2>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">
    ${phoneFull ? linkRow(L.phone, phoneFull, `tel:${phoneClean}`) : ''}
    ${data.email ? linkRow(L.email, data.email, `mailto:${data.email}`) : ''}
  </table>`;

  if (data.flightNumber) {
    body += section(L.flightInfo, row(L.flightNumber, esc(data.flightNumber)));
  }

  if (data.pickupStation || data.dropoffStation || data.trainNumber) {
    const stationName = data.pickupStation || data.dropoffStation;
    let inner = '';
    if (stationName) inner += row(L.station, esc(stationName));
    if (data.trainNumber) inner += row(L.trainNumber, esc(data.trainNumber));
    body += section(L.trainInfo, inner);
  }

  if (data.pickupAddress || data.dropoffAddress) {
    let inner = '';
    if (data.pickupAddress) inner += row(L.pickup, esc(data.pickupAddress));
    if (data.dropoffAddress) inner += row(L.dropoff, esc(data.dropoffAddress));
    body += section(L.address, inner);
  }

  const cosy = Number(data.seatCosy) || 0;
  const baby = Number(data.seatBaby) || 0;
  const booster = Number(data.seatBooster) || 0;
  if (cosy + baby + booster > 0) {
    let inner = '';
    if (cosy > 0) inner += row(L.seatCosy, String(cosy));
    if (baby > 0) inner += row(L.seatBaby, String(baby));
    if (booster > 0) inner += row(L.seatBooster, String(booster));
    body += section(L.childSeats, inner);
  }

  if (data.extraStop) {
    const detailsHtml = data.extraStopDetails
      ? esc(data.extraStopDetails)
      : `<span style="color:${COLOR_GRAPHITE}; font-style:italic;">${L.notProvided}</span>`;
    body += section(L.extraStop, row('&mdash;', detailsHtml));
  }

  if (data.tripType === 'round-trip' && (data.returnDate || data.returnTime)) {
    const returnDateLong = formatDateLong(data.returnDate, locale);
    const composed = [returnDateLong, data.returnTime].filter(Boolean).join(' &middot; ');
    if (composed) body += section(L.returnTrip, row('&mdash;', composed));
  }

  if (data.notes) {
    // Notes block: solid cream background (no border-radius — Outlook strips
    // it), longhand padding/border, line-height set explicitly.
    body += `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; margin-top:24px; border-top-width:1px; border-top-style:solid; border-top-color:${COLOR_SMOKE};">
      <tr><td style="padding-top:20px; padding-right:0; padding-bottom:0; padding-left:0;">
        ${sectionHead(L.notes)}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; background-color:${COLOR_CREAM};">
          <tr><td style="padding-top:14px; padding-right:16px; padding-bottom:14px; padding-left:16px; font-family:${FONT_BODY}; font-size:13px; color:${COLOR_INK}; font-style:italic; line-height:20px; mso-line-height-rule:exactly;">${esc(data.notes).replace(/\n/g, '<br />')}</td></tr>
        </table>
      </td></tr>
    </table>`;
  }

  const submittedAt = formatSubmittedAt(locale);
  const vehicleSummary = data.vehicleSummary || '&mdash;';
  const passengerLine = `${tripTypeLabel} &middot; ${esc(String(data.passengers || 1))} ${L.passengers}`;

  // ── Top-level skeleton ──────────────────────────────────────────────
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
<body style="margin-top:0; margin-right:0; margin-bottom:0; margin-left:0; padding-top:0; padding-right:0; padding-bottom:0; padding-left:0; background-color:${COLOR_CREAM}; font-family:${FONT_BODY}; color:${COLOR_INK}; line-height:20px; mso-line-height-rule:exactly;">

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; background-color:${COLOR_CREAM};">
  <tr><td align="center" style="padding-top:32px; padding-right:16px; padding-bottom:32px; padding-left:16px;">

    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px; max-width:600px; border-collapse:collapse; background-color:${COLOR_PAPER};">

      <!-- HEADER BAND (terracotta) -->
      <tr><td style="background-color:${COLOR_ACCENT}; padding-top:28px; padding-right:32px; padding-bottom:28px; padding-left:32px;">
        <p style="margin-top:0; margin-right:0; margin-bottom:8px; margin-left:0; color:${COLOR_CREAM}; font-family:${FONT_BODY}; font-size:11px; font-weight:bold; line-height:14px; mso-line-height-rule:exactly;">${L.eyebrow}</p>
        <h1 style="margin-top:0; margin-right:0; margin-bottom:0; margin-left:0; color:${COLOR_PAPER}; font-family:${FONT_DISPLAY}; font-size:26px; font-weight:bold; line-height:32px; mso-line-height-rule:exactly;">${pickupLabel} &rarr; ${dropoffLabel}</h1>
        ${dateLong || data.time ? `<p style="margin-top:8px; margin-right:0; margin-bottom:0; margin-left:0; color:${COLOR_CREAM}; font-family:${FONT_BODY}; font-size:14px; line-height:18px; mso-line-height-rule:exactly;">${esc(dateLong)}${data.time ? ' &middot; ' + esc(data.time) : ''}</p>` : ''}
      </td></tr>

      <!-- TOTAL BAND (ink) -->
      <tr><td style="background-color:${COLOR_NIGHT}; padding-top:18px; padding-right:32px; padding-bottom:18px; padding-left:32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">
          <tr>
            <td valign="middle" style="color:${COLOR_FADED}; font-family:${FONT_BODY}; font-size:11px; font-weight:bold; line-height:14px; mso-line-height-rule:exactly;">${L.total}</td>
            <td valign="middle" align="right" style="color:${COLOR_PAPER}; font-family:${FONT_DISPLAY}; font-size:22px; font-weight:bold; line-height:24px; mso-line-height-rule:exactly;">${totalText}</td>
          </tr>
          <tr>
            <td valign="middle" style="padding-top:6px; color:${COLOR_FADED}; font-family:${FONT_BODY}; font-size:12px; line-height:16px; mso-line-height-rule:exactly;">${passengerLine}</td>
            <td valign="middle" align="right" style="padding-top:6px; color:${COLOR_FADED}; font-family:${FONT_BODY}; font-size:12px; line-height:16px; mso-line-height-rule:exactly;">${esc(vehicleSummary)}</td>
          </tr>
        </table>
      </td></tr>

      <!-- BODY -->
      <tr><td style="padding-top:28px; padding-right:32px; padding-bottom:28px; padding-left:32px;">${body}</td></tr>

      <!-- FOOTER -->
      <tr><td align="center" style="background-color:${COLOR_CREAM}; padding-top:16px; padding-right:32px; padding-bottom:16px; padding-left:32px; border-top-width:1px; border-top-style:solid; border-top-color:${COLOR_SMOKE};">
        <p style="margin-top:0; margin-right:0; margin-bottom:0; margin-left:0; color:${COLOR_GRAPHITE}; font-family:${FONT_BODY}; font-size:11px; line-height:14px; mso-line-height-rule:exactly;">${L.receivedVia} <span style="color:${COLOR_ACCENT}; font-weight:bold;">Driver Services</span> &middot; ${esc(submittedAt)}</p>
      </td></tr>

    </table>

  </td></tr>
</table>

</body>
</html>`;
}
