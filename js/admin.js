const API_BASE = '/.netlify/functions';
let adminToken = sessionStorage.getItem('maisonthai_admin_token') || '';

const loginView = document.getElementById('loginView');
const dashView = document.getElementById('dashView');
const passwordInput = document.getElementById('adminPassword');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const listEl = document.getElementById('reservationList');
const refreshBtn = document.getElementById('refreshBtn');
const logoutBtn = document.getElementById('logoutBtn');

function escapeHtml(str = '') {
  return String(str).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function showDashboard() {
  loginView.style.display = 'none';
  dashView.style.display = 'block';
  loadReservations();
}

async function loadReservations() {
  listEl.innerHTML = '<p>Loading...</p>';
  const res = await fetch(`${API_BASE}/admin-list`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  if (res.status === 401) {
    sessionStorage.removeItem('maisonthai_admin_token');
    loginView.style.display = 'block';
    dashView.style.display = 'none';
    loginError.textContent = 'Session expired, please log in again.';
    return;
  }
  const data = await res.json();
  renderList(data);
}

function renderList(reservations) {
  if (!reservations.length) {
    listEl.innerHTML = '<p>No reservations yet.</p>';
    return;
  }

  listEl.innerHTML = reservations.map((r) => {
    const actions = r.status === 'pending' ? `
      <div class="res-actions">
        <button class="btn-approve" data-action="approve" data-id="${r.id}">Approve</button>
        <button class="btn-reject" data-action="reject" data-id="${r.id}">Reject</button>
        <button class="btn-counter" data-action="show-counter" data-id="${r.id}">Propose different time</button>
      </div>
      <div class="counter-form" id="counter-${r.id}">
        <div>
          <label for="date-${r.id}">New date</label>
          <input type="date" id="date-${r.id}">
        </div>
        <div>
          <label for="time-${r.id}">New time</label>
          <input type="time" id="time-${r.id}">
        </div>
        <button type="button" data-action="send-counter" data-id="${r.id}">Send offer to guest</button>
      </div>` : '';

    const proposed = r.status === 'countered'
      ? `<div class="res-proposed">Proposed: ${escapeHtml(r.proposed_date)} at ${escapeHtml(r.proposed_time)} — waiting on guest</div>`
      : '';

    return `
      <div class="res-card status-${r.status}">
        <div class="res-top">
          <div>
            <strong>${escapeHtml(r.name)}</strong> — ${escapeHtml(r.party_size)} guest(s)
            <div>${escapeHtml(r.reservation_date)} at ${escapeHtml(r.reservation_time)}</div>
            <div class="res-contact">${escapeHtml(r.email)} · ${escapeHtml(r.phone)}</div>
            ${r.notes ? `<div class="res-notes">"${escapeHtml(r.notes)}"</div>` : ''}
            ${proposed}
            <span class="res-status">${escapeHtml(r.status)}</span>
          </div>
        </div>
        ${actions}
      </div>`;
  }).join('');
}

listEl.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const { action, id } = btn.dataset;
  if (!action || !id) return;

  if (action === 'show-counter') {
    document.getElementById(`counter-${id}`).classList.toggle('open');
    return;
  }

  if (action === 'send-counter') {
    const date = document.getElementById(`date-${id}`).value;
    const time = document.getElementById(`time-${id}`).value;
    if (!date || !time) {
      alert('Please pick a date and time to propose.');
      return;
    }
    await decide(id, 'counter', { proposedDate: date, proposedTime: time });
    return;
  }

  if (action === 'approve' || action === 'reject') {
    if (action === 'reject' && !confirm('Reject this reservation with no alternative time offered?')) return;
    await decide(id, action);
  }
});

async function decide(id, action, extra = {}) {
  const res = await fetch(`${API_BASE}/admin-decide`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id, action, ...extra })
  });
  if (res.ok) {
    loadReservations();
  } else {
    alert('Something went wrong, please try again.');
  }
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const candidate = passwordInput.value;
  const res = await fetch(`${API_BASE}/admin-list`, {
    headers: { Authorization: `Bearer ${candidate}` }
  });
  if (res.ok) {
    adminToken = candidate;
    sessionStorage.setItem('maisonthai_admin_token', adminToken);
    loginError.textContent = '';
    showDashboard();
  } else {
    loginError.textContent = 'Incorrect password.';
  }
});

refreshBtn.addEventListener('click', loadReservations);
logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('maisonthai_admin_token');
  adminToken = '';
  location.reload();
});

if (adminToken) {
  showDashboard();
}
