const { escapeHtml, page } = require('./_lib/html');

exports.handler = async (event) => {
  const { token } = event.queryStringParameters || {};
  if (!token) {
    return { statusCode: 400, headers: { 'Content-Type': 'text/html' }, body: page('Invalid link', '<h1>Invalid link</h1><p>This link is missing information.</p>') };
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESTAURANT_PHONE } = process.env;
  const phone = RESTAURANT_PHONE || '+33 7 55 41 75 84';

  const res = await fetch(`${SUPABASE_URL}/rest/v1/reservations?cancel_token=eq.${token}`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  const rows = await res.json();
  const reservation = rows[0];

  if (!reservation || reservation.status !== 'approved') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: page('Nothing to cancel', `<h1>Nothing to cancel</h1><p>This reservation is no longer active. If you need help, call us at ${escapeHtml(phone)}.</p>`)
    };
  }

  const body = `
    <h1>Cancel your reservation?</h1>
    <p>You're about to cancel your table for <strong>${escapeHtml(reservation.party_size)}</strong> on
    <strong>${escapeHtml(reservation.reservation_date)} at ${escapeHtml(reservation.reservation_time)}</strong>.</p>
    <form method="POST" action="/.netlify/functions/guest-cancel-confirm">
      <input type="hidden" name="token" value="${escapeHtml(token)}">
      <button type="submit" class="decline">Yes, cancel my reservation</button>
    </form>`;

  return { statusCode: 200, headers: { 'Content-Type': 'text/html' }, body: page('Cancel reservation', body) };
};
