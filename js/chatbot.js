// ===== Maison Thai Assistant =====
// Simple rule-based chatbot for common restaurant FAQs.
// Anything it can't confidently answer falls back to "call/email the restaurant"
// instead of guessing — replace RESTAURANT_PHONE/EMAIL with real details.

const RESTAURANT_PHONE = '+33100000000';
const RESTAURANT_PHONE_DISPLAY = '+33 1 00 00 00 00';
const RESTAURANT_EMAIL = 'contact@maisonthai-paris.fr';

const FAQ = [
  {
    keywords: ['cuisine', 'food', 'type of food', 'thai', 'dish', 'menu'],
    answer: `We serve authentic Thai cuisine — think Tom Yum soup, Pad Thai, green curry and mango sticky rice. You can see sample dishes in our <a href="#menu">Menu section</a> above.`
  },
  {
    keywords: ['veg', 'vegan', 'vegetarian', 'gluten', 'allerg'],
    answer: `Yes — we offer vegetarian and vegan options, and can adjust most dishes on request. For specific allergies, please mention them when booking or ask our staff on arrival.`
  },
  {
    keywords: ['reservation', 'book', 'table', 'reserve', 'booking'],
    answer: `You can book a table using the <a href="#reservation">Reservation form</a> above — just pick your date, time and party size. Prefer to talk to someone? Use the "Call the Restaurant" button.`
  },
  {
    keywords: ['hour', 'open', 'close', 'time'],
    answer: `We're open Monday–Saturday, 12:00–14:30 for lunch and 19:00–22:30 for dinner. Closed Sundays.`
  },
  {
    keywords: ['price', 'cost', 'expensive', 'budget', 'menu price'],
    answer: `Average price is around €22 per person. Exact prices vary by dish — see the Menu section for examples.`
  },
  {
    keywords: ['location', 'address', 'where', 'directions', 'parking'],
    answer: `We're located at 19 Rue de Castellane, 75008 Paris. You'll find a map in the Contact section below.`
  },
  {
    keywords: ['delivery', 'takeaway', 'take away', 'uber', 'deliveroo'],
    answer: `Please contact us directly to check current delivery/takeaway options — availability can change.`
  },
  {
    keywords: ['contact', 'email', 'phone', 'call', 'number'],
    answer: `You can reach us by phone at ${RESTAURANT_PHONE_DISPLAY} or by email at ${RESTAURANT_EMAIL}.`
  },
  {
    keywords: ['hello', 'hi', 'hey', 'bonjour'],
    answer: `Hello! 👋 Welcome to Maison Thai. Ask me about our cuisine, vegetarian options, opening hours, or how to book a table.`
  }
];

const QUICK_REPLIES = ['Cuisine type', 'Vegetarian options', 'Book a table', 'Opening hours'];

const chatbotToggle = document.getElementById('chatbotToggle');
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotMessages = document.getElementById('chatbotMessages');
const chatbotForm = document.getElementById('chatbotForm');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotQuick = document.getElementById('chatbotQuick');

function addMessage(text, sender) {
  const msg = document.createElement('div');
  msg.className = `msg ${sender}`;
  msg.innerHTML = text;
  chatbotMessages.appendChild(msg);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function fallbackMessage() {
  addMessage(
    `I'm not 100% sure about that one — let's connect you directly with the team:<br>
     <a href="tel:${RESTAURANT_PHONE}">📞 Call ${RESTAURANT_PHONE_DISPLAY}</a><br>
     <a href="mailto:${RESTAURANT_EMAIL}">✉️ Email us</a>`,
    'bot'
  );
}

function respond(rawText) {
  const text = rawText.toLowerCase();
  const match = FAQ.find(entry => entry.keywords.some(k => text.includes(k)));
  if (match) {
    addMessage(match.answer, 'bot');
  } else {
    fallbackMessage();
  }
}

function renderQuickReplies() {
  chatbotQuick.innerHTML = '';
  QUICK_REPLIES.forEach(label => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'chip';
    chip.textContent = label;
    chip.addEventListener('click', () => {
      addMessage(label, 'user');
      respond(label);
    });
    chatbotQuick.appendChild(chip);
  });
}

chatbotToggle.addEventListener('click', () => {
  chatbotWindow.classList.toggle('active');
  if (chatbotMessages.children.length === 0) {
    addMessage(`Hi! 👋 I'm the Maison Thai assistant. Ask me about our cuisine, vegetarian options, hours, or reservations — anything else, I'll connect you straight to the restaurant.`, 'bot');
    renderQuickReplies();
  }
});
chatbotClose.addEventListener('click', () => chatbotWindow.classList.remove('active'));

chatbotForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = chatbotInput.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  respond(text);
  chatbotInput.value = '';
});
