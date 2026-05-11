// English branded HTML email — customer auto-confirmation.
// Same visual language as the chauffeur notification, but with a friendlier
// tone, English copy, and conditional advice blocks based on the booking
// type (airport pickup / hotel pickup / round-trip).
//
// Self-contained — duplicates color and font constants from clientEmail.js
// rather than importing, so each template is independently readable.

const LOGO_URL = 'https://driverparis.pro/newlogo.png';
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

// Pickup-type categories (used to decide which advice block to render).
const AIRPORTS = ['CDG', 'Orly', 'Beauvais'];
const CITIES = ['Paris', 'Disneyland', 'Versailles'];

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

function formatDateLongEN(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = String(dateStr).split('-').map(Number);
  if (!y || !m || !d) return String(dateStr);
  const dt = new Date(Date.UTC(y, m - 1, d));
  try {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(dt);
  } catch {
    return `${d}/${m}/${y}`;
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

// Coloured-tile advice block — tinted bg + heading + body paragraph.
// Used for the conditional "what to expect" sections (airport, hotel, round-trip).
function adviceBlock({ icon, title, paragraphs, bg }) {
  const bgColor = bg || COLORS.cream;
  const lines = paragraphs.map((p) =>
    `<p style="margin-top:0; margin-right:0; margin-bottom:8px; margin-left:0; font-family:${FONT_BODY}; font-size:13px; color:${COLORS.ink}; line-height:20px; mso-line-height-rule:exactly;">${p}</p>`
  ).join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; margin-top:20px;">
    <tr><td bgcolor="${bgColor}" style="background-color:${bgColor}; padding-top:16px; padding-right:18px; padding-bottom:16px; padding-left:18px;">
      <p style="margin-top:0; margin-right:0; margin-bottom:10px; margin-left:0; color:${COLORS.accent}; font-family:${FONT_BODY}; font-size:11px; font-weight:bold; line-height:14px; mso-line-height-rule:exactly;">${icon} ${title}</p>
      ${lines}
    </td></tr>
  </table>`;
}

// ── Main builder ─────────────────────────────────────────────────────────
//
// `data` shape is the same object the static site sends to the Worker —
// see clientEmail.js for the field list.
export function buildCustomerEmailHtml(data) {
  const firstName = String(data.firstName || '').trim();
  const greeting = firstName ? `Thank you, ${esc(firstName)}!` : 'Thank you for booking!';

  const pickupLabel = data.pickupStation
    ? `${esc(data.pickup)} (${esc(data.pickupStation)})`
    : esc(data.pickup || '—');
  const dropoffLabel = data.dropoffStation
    ? `${esc(data.dropoff)} (${esc(data.dropoffStation)})`
    : esc(data.dropoff || '—');

  const tripTypeLabel = data.tripType === 'round-trip' ? 'Round-trip' : 'One-way';
  const dateLong = formatDateLongEN(data.date);
  const totalText = data.totalPrice ? `${esc(data.totalPrice)} &euro;` : '&mdash;';
  const vehicleSummary = data.vehicleSummary || '&mdash;';
  const passengerLine = `${tripTypeLabel} &middot; ${esc(String(data.pax || data.passengers || 1))} passengers`;

  // ── Conditional advice blocks ────────────────────────────────────
  const isAirport = AIRPORTS.includes(data.pickup);
  const isCity = CITIES.includes(data.pickup);
  const isRoundTrip = data.tripType === 'round-trip';

  let adviceBlocks = '';

  if (isAirport) {
    adviceBlocks += adviceBlock({
      icon: '&#9992;&#65039;',
      title: 'AIRPORT PICKUP',
      paragraphs: [
        'With your flight number, our driver can track if your flight arrives early or late.',
        'The driver will be at the arrivals area with a sign showing your name, 20 minutes after landing.',
        'The driver will wait up to 1 hour after landing &mdash; beyond this, a supplement applies.',
        "Don't hesitate to contact us if you need additional waiting time.",
      ],
    });
  }

  if (isCity) {
    adviceBlocks += adviceBlock({
      icon: '&#128205;',
      title: 'HOTEL / APARTMENT PICKUP',
      paragraphs: [
        'The driver will arrive at the time indicated.',
        'If you are 15+ minutes late, a supplement applies.',
        'Please be ready to depart at the scheduled time.',
      ],
    });
  }

  if (isRoundTrip) {
    adviceBlocks += adviceBlock({
      icon: '&#128260;',
      title: 'ROUND-TRIP DISCOUNT APPLIED',
      paragraphs: [
        "You've benefited from a 5% discount on your return trip with us. Thank you!",
      ],
    });
  }

  // ── Body ────────────────────────────────────────────────────────────
  let body = '';

  // RECAP
  body += `<p style="margin-top:0; margin-right:0; margin-bottom:6px; margin-left:0; color:${COLORS.graphite}; font-family:${FONT_BODY}; font-size:11px; font-weight:bold; ${TD_BODY}">YOUR BOOKING</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">
    ${row('Route', `${pickupLabel} &rarr; ${dropoffLabel}`)}
    ${dateLong ? row('Date &amp; time', `${esc(dateLong)}${data.time ? ' &middot; ' + esc(data.time) : ''}`) : ''}
    ${row('Passengers', `${esc(String(data.pax || data.passengers || 1))} (${tripTypeLabel})`)}
    ${data.vehicleSummary ? row('Vehicle', esc(data.vehicleSummary)) : ''}
    ${data.totalPrice ? row('Total', `${esc(data.totalPrice)} &euro;`) : ''}
  </table>`;

  // CONDITIONAL ADVICE BLOCKS (airport / hotel / round-trip)
  body += adviceBlocks;

  // CONTACT
  body += `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse; margin-top:28px; border-top-width:1px; border-top-style:solid; border-top-color:${COLORS.smoke};">
    <tr><td style="padding-top:20px; padding-right:0; padding-bottom:0; padding-left:0;">
      ${sectionHead('NEED TO REACH US?')}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">
        ${linkRow('Phone', '+33 6 34 30 12 92', 'tel:+33634301292')}
        ${linkRow('Email', 'the.driver@hotmail.com', 'mailto:the.driver@hotmail.com')}
        ${linkRow('WhatsApp', '+33 6 34 30 12 92', 'https://wa.me/33634301292')}
      </table>
      <p style="margin-top:14px; margin-right:0; margin-bottom:0; margin-left:0; font-family:${FONT_BODY}; font-size:12px; color:${COLORS.graphite}; line-height:16px; mso-line-height-rule:exactly;">Available 24/7</p>
    </td></tr>
  </table>`;

  // ── Top-level skeleton ─────────────────────────────────────────────
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Booking confirmation &mdash; Driver Services</title>
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

      <!-- HEADER BAND (terracotta) -->
      <tr><td bgcolor="${COLORS.accent}" style="background-color:${COLORS.accent}; padding-top:24px; padding-right:32px; padding-bottom:24px; padding-left:32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%; border-collapse:collapse;">
          <tr>
            <td valign="top" style="padding-top:0; padding-right:16px; padding-bottom:0; padding-left:0;">
              <p style="margin-top:0; margin-right:0; margin-bottom:8px; margin-left:0; color:${COLORS.cream}; font-family:${FONT_BODY}; font-size:11px; font-weight:bold; line-height:14px; mso-line-height-rule:exactly;">DRIVER SERVICES &middot; BOOKING CONFIRMATION</p>
              <h1 style="margin-top:0; margin-right:0; margin-bottom:0; margin-left:0; color:${COLORS.paper}; font-family:${FONT_DISPLAY}; font-size:26px; font-weight:bold; line-height:32px; mso-line-height-rule:exactly;">${greeting}</h1>
              <p style="margin-top:6px; margin-right:0; margin-bottom:0; margin-left:0; color:${COLORS.cream}; font-family:${FONT_BODY}; font-size:14px; line-height:20px; mso-line-height-rule:exactly;">Your booking request has been received.</p>
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
            <td valign="middle" style="color:${COLORS.faded}; font-family:${FONT_BODY}; font-size:11px; font-weight:bold; line-height:14px; mso-line-height-rule:exactly;">BOOKING TOTAL</td>
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
      <tr><td align="center" bgcolor="${COLORS.cream}" style="background-color:${COLORS.cream}; padding-top:18px; padding-right:32px; padding-bottom:18px; padding-left:32px; border-top-width:1px; border-top-style:solid; border-top-color:${COLORS.smoke};">
        <p style="margin-top:0; margin-right:0; margin-bottom:0; margin-left:0; color:${COLORS.graphite}; font-family:${FONT_BODY}; font-size:11px; line-height:16px; mso-line-height-rule:exactly;"><span style="color:${COLORS.accent}; font-weight:bold;">Driver Services</span> &middot; Private chauffeur in Paris since 2012</p>
      </td></tr>

    </table>

  </td></tr>
</table>

</body>
</html>`;
}
