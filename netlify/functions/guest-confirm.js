const crypto = require('crypto');
const { page } = require('./_lib/html');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const params = new URLSearchParams(event.body);
  const token = params.get('token');
  const decision = params.get('decision');
  if (!token || !['accept', 'decline'].includes(decision)) {
    return { statusCode: 400, headers: { 'Content-Type': 'text/html' }, body: page('Invalid request', '<h1>Invalid request</h1>') };
  }

  const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY,
    RESEND_FROM,
    RESTAURANT_NAME,
    RESTAURANT_PHONE,
    SITE_URL
  } = process.env;

  const sbHeaders = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  };

  const getRes = await fetch(`${SUPABASE_URL}/rest/v1/reservations?guest_token=eq.${token}`, { headers: sbHeaders });
  const rows = await getRes.json();
  const reservation = rows[0];

  if (!reservation || reservation.status !== 'countered') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: page('Already handled', '<h1>This request was already handled.</h1>')
    };
  }

  const restaurantName = RESTAURANT_NAME || 'Maison Thai';
  const restaurantPhone = RESTAURANT_PHONE || '+33 7 55 41 75 84';
  const base = (SITE_URL || '').replace(/\/$/, '');

  async function sendEmail(subject, html) {
    if (!RESEND_API_KEY) return;
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: RESEND_FROM || `${restaurantName} <onboarding@resend.dev>`,
        to: reservation.email,
        subject,
        html
      })
    });
  }

  if (decision === 'accept') {
    const cancelToken = crypto.randomBytes(24).toString('hex');
    await fetch(`${SUPABASE_URL}/rest/v1/reservations?guest_token=eq.${token}`, {
      method: 'PATCH',
      headers: { ...sbHeaders, Prefer: 'return=minimal' },
      body: JSON.stringify({
        status: 'approved',
        reservation_date: reservation.proposed_date,
        reservation_time: reservation.proposed_time,
        guest_token: null,
        cancel_token: cancelToken
      })
    });
    const cancelUrl = `${base}/.netlify/functions/guest-cancel?token=${cancelToken}`;
    await sendEmail(
      `Your table is confirmed — ${restaurantName}`,
      `<p>Hi ${reservation.name},</p>
       <p>Your table for <strong>${reservation.party_size}</strong> on
       <strong>${reservation.proposed_date}</strong> at <strong>${reservation.proposed_time}</strong> is confirmed.</p>
       <p>See you soon! Questions? Call us at ${restaurantPhone}.</p>
       <p style="margin-top:20px;font-size:.9em;">Need to cancel? <a href="${cancelUrl}">Cancel this reservation</a>.</p>`
    );
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: page('Confirmed', `<h1>You're all set!</h1><p>Your table on ${reservation.proposed_date} at ${reservation.proposed_time} is confirmed. A confirmation email is on its way.</p>`)
    };
  }

  // decline
  await fetch(`${SUPABASE_URL}/rest/v1/reservations?guest_token=eq.${token}`, {
    method: 'PATCH',
    headers: { ...sbHeaders, Prefer: 'return=minimal' },
    body: JSON.stringify({ status: 'rejected', guest_token: null })
  });
  await sendEmail(
    `About your reservation — ${restaurantName}`,
    `<p>Hi ${reservation.name},</p>
     <p>No problem — we've noted that the proposed time doesn't work for you.
     Please call us at ${restaurantPhone} or submit a new request whenever you'd like.</p>`
  );
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: page('No problem', `<h1>Got it</h1><p>We've cancelled that proposed time. Feel free to call us at ${restaurantPhone} or submit a new request.</p>`)
  };
};
