function page(title, bodyHtml) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
  body{font-family:sans-serif;background:#fdf8f2;color:#241512;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;}
  .card{background:#fff;padding:40px;border-radius:14px;box-shadow:0 10px 30px rgba(36,21,18,.12);max-width:420px;text-align:center;}
  h1{color:#7a1f2b;font-size:1.4rem;margin-top:0;}
</style></head><body><div class="card">${bodyHtml}</div></body></html>`;
}

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
    RESTAURANT_PHONE
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
    await fetch(`${SUPABASE_URL}/rest/v1/reservations?guest_token=eq.${token}`, {
      method: 'PATCH',
      headers: { ...sbHeaders, Prefer: 'return=minimal' },
      body: JSON.stringify({
        status: 'approved',
        reservation_date: reservation.proposed_date,
        reservation_time: reservation.proposed_time,
        guest_token: null
      })
    });
    await sendEmail(
      `Your table is confirmed — ${restaurantName}`,
      `<p>Hi ${reservation.name},</p>
       <p>Your table for <strong>${reservation.party_size}</strong> on
       <strong>${reservation.proposed_date}</strong> at <strong>${reservation.proposed_time}</strong> is confirmed.</p>
       <p>See you soon! Questions? Call us at ${restaurantPhone}.</p>`
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
