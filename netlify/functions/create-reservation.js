exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { name, email, phone, guests, date, time, notes } = body;
  if (!name || !email || !phone || !guests || !date || !time) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured' }) };
  }

  const res = await fetch(`${SUPABASE_URL}/rest/v1/reservations`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal'
    },
    body: JSON.stringify([{
      name,
      email,
      phone,
      party_size: guests,
      reservation_date: date,
      reservation_time: time,
      notes: notes || '',
      status: 'pending'
    }])
  });

  if (!res.ok) {
    const detail = await res.text();
    return { statusCode: 502, body: JSON.stringify({ error: 'Could not save reservation', detail }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};
