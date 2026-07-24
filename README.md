# Maison Thai — Website Concept

A demo restaurant website built to show Maison Thai what an upgrade from their
current TheFork listing page could look like. Pure HTML/CSS/JS, no build step,
no backend required.

## What's included

- **Hero, About, Menu, Gallery, Reviews, Reservation, Contact** sections
- **Real reservation backend** — guest requests are stored in a database;
  staff approve, reject, or counter-offer a different time from a
  password-protected dashboard (`/admin.html`); the guest is emailed
  automatically based on that decision. See "Reservation backend" below.
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
| Email | `index.html`, `js/chatbot.js` | `contact@maisonthai-paris.fr` |
| Menu items & prices | `index.html` (`#menu`) | sample dishes |
| Opening hours | `index.html` (`#reservation`, `#contact`), `js/chatbot.js` | sample hours |
| Photos | all `picsum.photos` images | real restaurant/food photos |
| Reviews | `index.html` (`#reviews`) | sample testimonials — pull real ones from TheFork/Google with permission |
| Social links | `index.html` (`#contact`) | real Instagram/Facebook URLs |

## Reservation backend (real system, not a demo)

**Stack:** Supabase (free Postgres database) + Netlify Functions (free
serverless backend, already included with this host) + Resend (free
transactional email, 100/day).

**How it works:**
1. A guest submits the form → `netlify/functions/create-reservation.js`
   stores it in Supabase with `status = 'pending'`.
2. Staff open `/admin.html` (password-protected, not linked from the public
   site) and see all requests. After checking real table availability, they
   click **Approve**, **Reject**, or **Propose different time**.
3. Approve/Reject → the guest is emailed immediately (`admin-decide.js`).
4. Propose a different time → the guest gets an email with the new date/time
   and **Accept** / **Decline** buttons. Clicking either opens a short
   confirmation page (`guest-respond.js`) — only clicking the button *there*
   actually finalizes it (`guest-confirm.js`). This two-step design stops
   email link-scanners/prefetchers from silently accepting or declining on
   the guest's behalf.
5. Every confirmed reservation's email includes a **"Cancel this reservation"**
   link for the guest. It works the same two-step way (`guest-cancel.js` →
   confirm page → `guest-cancel-confirm.js`), marks the reservation
   `cancelled`, and emails the guest an acknowledgment. Staff cannot cancel a
   reservation from the dashboard — cancellation is guest-initiated only;
   staff see the `cancelled` status update automatically once it happens.

**One-time setup (you'll create two free accounts — never send me the keys,
paste them straight into Netlify's own environment variables):**

1. **Supabase**: create a free project at supabase.com → SQL Editor → paste
   and run `supabase/schema.sql` from this repo → copy your Project URL and
   `service_role` key (Project Settings → API).
2. **Resend**: create a free account at resend.com → API Keys → create one.
   You can send from their shared test address (`onboarding@resend.dev`)
   right away; verify the restaurant's own domain later for a professional
   "from" address.
3. In **Netlify** → Site configuration → Environment variables, add:
   | Variable | Value |
   |---|---|
   | `SUPABASE_URL` | your Supabase Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | your Supabase `service_role` key (secret) |
   | `RESEND_API_KEY` | your Resend API key (secret) |
   | `RESEND_FROM` | e.g. `Maison Thai <onboarding@resend.dev>` |
   | `RESTAURANT_NAME` | `Maison Thai` |
   | `RESTAURANT_PHONE` | the real restaurant phone number |
   | `SITE_URL` | your live site URL, e.g. `https://maison-thai-paris.netlify.app` |
   | `ADMIN_PASSWORD` | a password you choose, for staff to log into `/admin.html` |
4. Redeploy (Netlify → Deploys → Trigger deploy) so the functions pick up the
   new environment variables.

**Note on `/admin.html`:** it's a single shared password, not individual staff
logins — proportionate for one small team, but worth upgrading to real
per-person accounts if the restaurant wants an audit trail of who approved
what.

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
