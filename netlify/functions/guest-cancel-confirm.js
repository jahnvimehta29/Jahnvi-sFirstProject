const { page } = require('./_lib/html');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const params = new URLSearchParams(event.body);
  const token = params.get('token');
  if (!token) {
    return { statusCode: 400, headers: { 'Content-Type': 'text/html' }, body: page('Invalid request', '<h1>Invalid request</h1>') };
  }

  const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY,
    RESEND_FROM,
    RESTAURANT_NAME,
    RESTAURANT_PHONE
  } = process.env;

  const sbHeaders = {
    apikey: SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json'
  };

  const getRes = await fetch(`${SUPABASE_URL}/rest/v1/reservations?cancel_token=eq.${token}`, { headers: sbHeaders });
  const rows = await getRes.json();
  const reservation = rows[0];

  if (!reservation || reservation.status !== 'approved') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: page('Nothing to cancel', '<h1>Nothing to cancel</h1><p>This reservation is no longer active.</p>')
    };
  }

  await fetch(`${SUPABASE_URL}/rest/v1/reservations?cancel_token=eq.${token}`, {
    method: 'PATCH',
    headers: { ...sbHeaders, Prefer: 'return=minimal' },
    body: JSON.stringify({ status: 'cancelled', cancel_token: null })
  });

  const restaurantName = RESTAURANT_NAME || 'Maison Thai';
  const restaurantPhone = RESTAURANT_PHONE || '+33 7 55 41 75 84';

  if (RESEND_API_KEY) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: RESEND_FROM || `${restaurantName} <onboarding@resend.dev>`,
        to: reservation.email,
        subject: `Your reservation has been cancelled — ${restaurantName}`,
        html: `<p>Hi ${reservation.name},</p>
               <p>Your reservation for <strong>${reservation.party_size}</strong> on
               <strong>${reservation.reservation_date}</strong> at <strong>${reservation.reservation_time}</strong>
               has been cancelled as requested.</p>
               <p>Hope to see you another time — call us at ${restaurantPhone} whenever you'd like to book again.</p>`
      })
    });
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    body: page('Cancelled', `<h1>Your reservation is cancelled</h1><p>We've sent a confirmation to your email. Hope to see you another time!</p>`)
  };
};
