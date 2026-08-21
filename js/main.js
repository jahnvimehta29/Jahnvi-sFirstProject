// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ===== Scroll-reveal animations =====
const revealSelectors = '.story-medallion, .story-text, .menu-card, .review-card, .reservation-info, .reservation-form, .contact-details, .contact-map';
const revealEls = document.querySelectorAll(revealSelectors);
revealEls.forEach((el) => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

revealEls.forEach((el) => revealObserver.observe(el));

// ===== Sticky "Book a Table" bar =====
// Shows once the hero is scrolled past, hides while the reservation
// section itself is in view (no need to nag someone already booking).
const stickyBar = document.getElementById('stickyBar');
const heroSection = document.getElementById('home');
const reservationSection = document.getElementById('reservation');
const chatbotWidget = document.getElementById('chatbot');

function updateStickyBar() {
  const heroBottom = heroSection.getBoundingClientRect().bottom;
  const resRect = reservationSection.getBoundingClientRect();
  const resInView = resRect.top < window.innerHeight && resRect.bottom > 0;
  const show = heroBottom < 0 && !resInView;
  stickyBar.classList.toggle('visible', show);
  chatbotWidget.classList.toggle('bar-visible', show);
}
window.addEventListener('scroll', updateStickyBar, { passive: true });
updateStickyBar();

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
