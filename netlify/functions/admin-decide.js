const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const authHeader = event.headers['authorization'] || event.headers['Authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!process.env.ADMIN_PASSWORD || token !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { id, action, proposedDate, proposedTime } = body;
  if (!id || !['approve', 'reject', 'counter'].includes(action)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing or invalid id/action' }) };
  }
  if (action === 'counter' && (!proposedDate || !proposedTime)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'proposedDate and proposedTime are required to counter-offer' }) };
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

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured' }) };
  }

  const sbHeaders = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  };

  const getRes = await fetch(`${SUPABASE_URL}/rest/v1/reservations?id=eq.${id}`, { headers: sbHeaders });
  const rows = await getRes.json();
  const reservation = rows[0];
  if (!reservation) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Reservation not found' }) };
  }

  const restaurantName = RESTAURANT_NAME || 'Maison Thai';
  const restaurantPhone = RESTAURANT_PHONE || '+33 7 55 41 75 84';

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

  if (action === 'approve') {
    const cancelToken = crypto.randomBytes(24).toString('hex');
    await fetch(`${SUPABASE_URL}/rest/v1/reservations?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...sbHeaders, Prefer: 'return=minimal' },
      body: JSON.stringify({ status: 'approved', cancel_token: cancelToken })
    });
    const base = (SITE_URL || '').replace(/\/$/, '');
    const cancelUrl = `${base}/.netlify/functions/guest-cancel?token=${cancelToken}`;
    await sendEmail(
      `Your table is confirmed — ${restaurantName}`,
      `<p>Hi ${reservation.name},</p>
       <p>Your table for <strong>${reservation.party_size}</strong> on
       <strong>${reservation.reservation_date}</strong> at <strong>${reservation.reservation_time}</strong> is confirmed.</p>
       <p>See you soon! Questions? Call us at ${restaurantPhone}.</p>
       <p style="margin-top:20px;font-size:.9em;">Need to cancel? <a href="${cancelUrl}">Cancel this reservation</a>.</p>`
    );
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  if (action === 'reject') {
    await fetch(`${SUPABASE_URL}/rest/v1/reservations?id=eq.${id}`, {
      method: 'PATCH',
      headers: { ...sbHeaders, Prefer: 'return=minimal' },
      body: JSON.stringify({ status: 'rejected' })
    });
    await sendEmail(
      `About your reservation request — ${restaurantName}`,
      `<p>Hi ${reservation.name},</p>
       <p>Thank you for your interest — unfortunately we can't accommodate
       <strong>${reservation.party_size}</strong> guest(s) on <strong>${reservation.reservation_date}</strong>
       at <strong>${reservation.reservation_time}</strong>.</p>
       <p>Please call us at ${restaurantPhone} to find another time, or submit a new request on our site.</p>`
    );
    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  }

  // action === 'counter': propose an alternative time, guest decides via emailed link
  const guestToken = crypto.randomBytes(24).toString('hex');
  await fetch(`${SUPABASE_URL}/rest/v1/reservations?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...sbHeaders, Prefer: 'return=minimal' },
    body: JSON.stringify({
      status: 'countered',
      proposed_date: proposedDate,
      proposed_time: proposedTime,
      guest_token: guestToken
    })
  });

  const base = (SITE_URL || '').replace(/\/$/, '');
  const acceptUrl = `${base}/.netlify/functions/guest-respond?token=${guestToken}&decision=accept`;
  const declineUrl = `${base}/.netlify/functions/guest-respond?token=${guestToken}&decision=decline`;

  await sendEmail(
    `A different time for your table? — ${restaurantName}`,
    `<p>Hi ${reservation.name},</p>
     <p>We can't seat <strong>${reservation.party_size}</strong> guest(s) on
     <strong>${reservation.reservation_date}</strong> at <strong>${reservation.reservation_time}</strong>,
     but we could offer instead:</p>
     <p style="font-size:1.1em"><strong>${proposedDate} at ${proposedTime}</strong></p>
     <p>
       <a href="${acceptUrl}" style="background:#7a1f2b;color:#fff;padding:10px 20px;border-radius:20px;text-decoration:none;margin-right:10px;">Accept this time</a>
       <a href="${declineUrl}" style="border:1px solid #7a1f2b;color:#7a1f2b;padding:10px 20px;border-radius:20px;text-decoration:none;">Decline</a>
     </p>
     <p>Or call us at ${restaurantPhone} to arrange something else.</p>`
  );

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
