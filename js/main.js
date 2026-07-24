// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ===== Gallery lightbox =====
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
document.getElementById('galleryGrid').addEventListener('click', (e) => {
  if (e.target.tagName === 'IMG') {
    lightboxImg.src = e.target.src;
    lightboxImg.alt = e.target.alt;
    lightbox.classList.add('active');
  }
});
document.getElementById('lightboxClose').addEventListener('click', () => lightbox.classList.remove('active'));
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.classList.remove('active'); });

// ===== Reservation form =====
// Submits to the Netlify Function (create-reservation), which stores the
// request in Supabase as "pending". Staff approve/reject/counter-offer from
// /admin.html, and the guest is emailed automatically based on that decision.
const reservationForm = document.getElementById('reservationForm');
const formNote = document.getElementById('formNote');
const dateInput = document.getElementById('date');
if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

reservationForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = reservationForm.querySelector('button[type="submit"]');
  const payload = {
    name: document.getElementById('name').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    guests: document.getElementById('guests').value,
    date: document.getElementById('date').value,
    time: document.getElementById('time').value,
    notes: document.getElementById('notes').value.trim()
  };

  submitBtn.disabled = true;
  formNote.textContent = 'Sending your request...';

  try {
    const res = await fetch('/.netlify/functions/create-reservation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Request failed');
    formNote.textContent = `Thanks ${payload.name}! Your request has been sent to the restaurant — you'll get an email once it's confirmed.`;
    reservationForm.reset();
  } catch (err) {
    formNote.textContent = 'Sorry, something went wrong sending your request. Please call us at +33 7 55 41 75 84 instead.';
  } finally {
    submitBtn.disabled = false;
  }
});
