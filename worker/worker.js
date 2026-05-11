// Cloudflare Worker — receives booking submissions from the static site,
// sends two emails via Resend (chauffeur notification + customer confirmation).
//
// Architecture:
//   - Static site (Astro, on Vercel/Pages) submits JSON to this Worker URL.
//   - Worker validates, builds two HTML emails, calls Resend API.
//   - Returns { success: true } on chauffeur-email success.
//   - Customer email failure does NOT block the response — the chauffeur
//     getting the booking is the critical path; the customer auto-reply
//     is nice-to-have.
//
// Env / secrets (set via `wrangler secret put RESEND_API_KEY`):
//   - RESEND_API_KEY — server-side only, never exposed to the browser.

import { buildClientEmailHtml } from './templates/clientEmail.js';
import { buildCustomerEmailHtml } from './templates/customerEmail.js';

// CORS — allow any origin while the static site potentially moves between
// hosts (Vercel → Cloudflare Pages → custom domain). Tighten the allowed
// origin list later if scraping/abuse becomes a concern.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

// Where the chauffeur receives bookings. Hard-coded because the destination
// is fixed for this business.
const CLIENT_TO = 'the.driver@hotmail.com';

// Sender address. Domain `driverparis.pro` is verified in Resend, so the
// Worker can deliver to any recipient (chauffeur Hotmail + arbitrary
// customer addresses). Both emails use this single constant.
const FROM_ADDRESS = 'Driver Services <noreply@driverparis.pro>';

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
    }

    if (!env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY missing — set with: wrangler secret put RESEND_API_KEY');
      return jsonResponse({ success: false, error: 'Server misconfigured' }, 500);
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return jsonResponse({ success: false, error: 'Invalid JSON' }, 400);
    }

    // Honeypot — silently accept (don't tell the bot it failed) but skip emails.
    if (data.botcheck) {
      return jsonResponse({ success: true });
    }

    // Required-field check. Loose — the form already validates client-side,
    // this is a sanity gate so bad shapes don't reach Resend.
    const missing = ['firstName', 'email', 'pickup', 'dropoff', 'date', 'time']
      .filter((k) => !data[k] || String(data[k]).trim() === '');
    if (missing.length) {
      return jsonResponse(
        { success: false, error: `Missing required fields: ${missing.join(', ')}` },
        400,
      );
    }

    // ── Send chauffeur notification (REQUIRED — the critical path) ──
    const clientHtml = buildClientEmailHtml(data);
    const clientSubject = buildClientSubject(data);
    const clientResult = await sendEmail(env.RESEND_API_KEY, {
      from: FROM_ADDRESS,
      to: CLIENT_TO,
      replyTo: data.email,
      subject: clientSubject,
      html: clientHtml,
    });

    if (!clientResult.success) {
      console.error('Chauffeur email failed:', clientResult.error);
      return jsonResponse(
        { success: false, error: 'Failed to send notification' },
        502,
      );
    }

    // ── Send customer auto-confirmation (BEST-EFFORT) ──
    // If this fails (Resend free tier restricts recipients to verified
    // addresses until a domain is set up), still return success — the
    // chauffeur got the booking, that's what matters.
    const customerHtml = buildCustomerEmailHtml(data);
    const customerResult = await sendEmail(env.RESEND_API_KEY, {
      from: FROM_ADDRESS,
      to: data.email,
      replyTo: CLIENT_TO,
      subject: 'Booking confirmation — Driver Services',
      html: customerHtml,
    });

    if (!customerResult.success) {
      console.warn('Customer auto-confirmation failed:', customerResult.error);
    }

    return jsonResponse({
      success: true,
      message: 'Booking submitted successfully',
      customerEmailSent: customerResult.success,
    });
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function sendEmail(apiKey, { from, to, replyTo, subject, html }) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: replyTo,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      return { success: false, error: errorBody };
    }

    const out = await response.json();
    return { success: true, id: out.id };
  } catch (error) {
    return { success: false, error: error?.message || String(error) };
  }
}

// ── Subject line — ASCII-safe French, ≤60 chars ──────────────────────────
//
// Inbox-list previews truncate non-ASCII inconsistently across clients,
// so we strip diacritics + drop the → arrow. The full route + accented
// place names live in the email body (HTML, charset=UTF-8).
function buildClientSubject(data) {
  const p = asciiFold(data.pickup);
  const d = asciiFold(data.dropoff);
  const ds = formatDateShort(data.date);
  const t = data.time ? ' ' + data.time : '';
  return `Reservation: ${p} / ${d} (${ds}${t})`;
}

function asciiFold(s) {
  return String(s == null ? '' : s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7e]/g, '');
}

function formatDateShort(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = String(dateStr).split('-').map(Number);
  if (!y || !m || !d) return String(dateStr);
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}
