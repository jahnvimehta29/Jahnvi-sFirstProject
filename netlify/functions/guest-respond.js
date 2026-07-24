const { escapeHtml, page } = require('./_lib/html');

exports.handler = async (event) => {
  const { token, decision } = event.queryStringParameters || {};
  if (!token || !['accept', 'decline'].includes(decision)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/html' },
      body: page('Invalid link', '<h1>Invalid link</h1><p>This link is missing information.</p>')
    };
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESTAURANT_PHONE } = process.env;
  const phone = RESTAURANT_PHONE || '+33 7 55 41 75 84';

  const res = await fetch(`${SUPABASE_URL}/rest/v1/reservations?guest_token=eq.${token}`, {
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
    }
  });
  const rows = await res.json();
  const reservation = rows[0];

  if (!reservation || reservation.status !== 'countered') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/html' },
      body: page('Already handled', `<h1>This request was already handled</h1><p>If you need help, call us at ${escapeHtml(phone)}.</p>`)
    };
  }

  const label = decision === 'accept' ? 'Confirm this new time' : 'Confirm you want to decline';
  const detail = decision === 'accept'
    ? `<p>We proposed <strong>${escapeHtml(reservation.proposed_date)} at ${escapeHtml(reservation.proposed_time)}</strong> for your table.</p>`
    : `<p>You're about to decline the proposed time of <strong>${escapeHtml(reservation.proposed_date)} at ${escapeHtml(reservation.proposed_time)}</strong>.</p>`;

  const body = `
    <h1>${decision === 'accept' ? 'Confirm your new reservation time' : 'Decline proposed time'}</h1>
    ${detail}
    <form method="POST" action="/.netlify/functions/guest-confirm">
      <input type="hidden" name="token" value="${escapeHtml(token)}">
      <input type="hidden" name="decision" value="${escapeHtml(decision)}">
      <button type="submit" class="${decision === 'decline' ? 'decline' : ''}">${label}</button>
    </form>`;

  return { statusCode: 200, headers: { 'Content-Type': 'text/html' }, body: page('Confirm your reservation', body) };
};
