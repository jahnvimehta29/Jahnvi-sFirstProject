# Maison Thai — Website Concept

A demo restaurant website built to show Maison Thai what an upgrade from their
current TheFork listing page could look like. Pure HTML/CSS/JS, no build step,
no backend required.

## What's included

- **Hero, About, Menu, Gallery, Reviews, Reservation, Contact** sections
- **Reservation form** (date/time/party size) — currently client-side only,
  see "Making the reservation form real" below
- **Live chatbot** (`js/chatbot.js`) — rule-based FAQ bot for cuisine, veg/vegan
  options, hours, price, location, booking help; anything it doesn't recognize
  falls back to a "Call the restaurant" / "Email us" prompt instead of guessing
- **Google Maps embed**, click-to-call, click-to-email, social links
- Fully responsive (mobile nav, responsive grids)

## ⚠️ Placeholder content to replace before showing the client

This was built from what's publicly visible on the TheFork listing (name,
address, cuisine type, average price, rating). Everything below is a
placeholder and must be swapped for real information:

| Item | Location | Placeholder |
|---|---|---|
| Phone number | `index.html`, `js/chatbot.js` | `+33 1 00 00 00 00` |
| Email | `index.html`, `js/chatbot.js` | `contact@maisonthai-paris.fr` |
| Menu items & prices | `index.html` (`#menu`) | sample dishes |
| Opening hours | `index.html` (`#reservation`, `#contact`), `js/chatbot.js` | sample hours |
| Photos | all `picsum.photos` images | real restaurant/food photos |
| Reviews | `index.html` (`#reviews`) | sample testimonials — pull real ones from TheFork/Google with permission |
| Social links | `index.html` (`#contact`) | real Instagram/Facebook URLs |

## Making the reservation form real

Right now, submitting the form just shows an on-page confirmation message —
nothing is sent anywhere. For production, pick one:

1. **Formspree** (free tier, ~50 submissions/month) — no backend needed.
   Sign up, get a form endpoint, and point the form's `action` at it.
2. **EmailJS** — sends form data straight to an inbox via JS, free tier available.
3. A real booking system (e.g. TheFork itself, Zenchef, or a custom backend)
   if they want live availability instead of a "request" model.

## Hosting — free options

All of these are genuinely free for a static site like this one, and all
support a **custom domain** later if the client buys one:

| Host | Free tier | Notes |
|---|---|---|
| **Netlify** | Yes | Drag-and-drop deploy or Git-connected; free `*.netlify.app` subdomain; easiest for non-technical handoff |
| **Vercel** | Yes | Similar to Netlify; free `*.vercel.app` subdomain |
| **Cloudflare Pages** | Yes | Free `*.pages.dev` subdomain, fast global CDN |
| **GitHub Pages** | Yes | Free `*.github.io` subdomain; deploys straight from this repo |

**Recommendation:** Netlify or Cloudflare Pages — connect this GitHub repo,
every push auto-deploys, zero cost, and adding a real domain later is a
5-minute DNS change.

## Domains — free vs. paid

Be careful pitching "free domain" to a client — it can undercut credibility:

- **Free subdomains** (`maison-thai.netlify.app`, `maison-thai.pages.dev`,
  etc.) are fine for **this demo/preview**, but look unprofessional for a
  live client-facing site.
- **"Free" TLD registrars** (e.g. Freenom-style `.tk`/`.ml`/`.ga` domains)
  have become unreliable — many were discontinued or reclaimed in 2025, and
  they're often flagged as spammy by browsers/email filters. Not recommended
  for a paying client.
- **A real domain is cheap**, not free: e.g. `maisonthai.paris`,
  `maisonthai.fr`, or `.com`/`.restaurant` typically run **€8–20/year**
  from registrars like Namecheap, OVH (French, good for `.fr`), or Google
  Domains successor Squarespace Domains. This is worth including as a small
  line item in the upgrade offer rather than promising "free."

## Next steps for the pitch

1. Swap in the real phone/email/hours/menu/photos (table above).
2. Get 3–5 real customer quotes to replace the sample reviews.
3. Deploy to Netlify/Cloudflare Pages for a shareable preview link.
4. Present alongside the current TheFork page as a before/after.
5. If they want to move forward, register a real domain and connect it to
   the chosen host — DNS changes only, no code changes needed.
