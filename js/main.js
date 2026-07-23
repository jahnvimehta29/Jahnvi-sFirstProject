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
// Demo behavior only: shows a confirmation message client-side.
// For production, wire this to a real service (e.g. Formspree, EmailJS,
// or the restaurant's booking/POS system) so requests actually reach staff.
const reservationForm = document.getElementById('reservationForm');
const formNote = document.getElementById('formNote');
const dateInput = document.getElementById('date');
if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

reservationForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  formNote.textContent = `Thanks ${name || 'there'}! Your request was received — we'll confirm shortly by email or phone.`;
  reservationForm.reset();
});
