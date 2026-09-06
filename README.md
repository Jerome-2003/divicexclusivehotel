# Divic

Website for **Divic Exclusive** (15 rooms) and **Divic Urban** (21 rooms), two
separately-operated properties in Festac, Lagos, under one Divic brand.

Design direction, tokens and component rules: [`DESIGN-BRIEF.md`](./DESIGN-BRIEF.md).
Backend contract: [`API.md`](./API.md).

## Running it

```bash
npm install
cp .env.example .env      # then set VITE_DIVIC_API_URL
npm run dev
npm run build
npm run preview
```

## Stack

React 19 + React Router, Vite, Tailwind. Fonts (Fraunces, Karla) are self-hosted through
`@fontsource-variable/*` — no CDN request and no external runtime dependency.

There is no Express/Mongo layer in this repo: the site is a static front end that talks
to the PMS's three public endpoints. The PMS owns the database.

## Layout

```
src/
  data/properties.js       PROPERTY_SEED (mirrors the API) + editorial CONTENT
  lib/divic-api.js         API client, adapted from the supplied booking-widget.js
  lib/useProperties.js     live properties, falling back to the seed
  context/PropertyContext  which property is active; sets <html data-property>
  components/              SwanMark, Header, Footer, primitives (Plate, Reveal, …)
  pages/                   Home, Property, Contact, Book, BookingStatus
  styles/index.css         design tokens and component classes
scripts/prepare-images.mjs crops and optimises the supplied photography
DIVIC URBAN/               source photography (originals, never modified)
public/images/urban/       generated web assets
legacy/                    the previous static site, kept for reference
```

**Routes:** `/` split chooser · `/exclusive` and `/urban` (one template, both houses) ·
`/book` · `/booking-status` · `/contact`.

## Backend integration

Set `VITE_DIVIC_API_URL` to the PMS origin. The site uses all four public endpoints:

| Endpoint | Used by |
|---|---|
| `GET /api/public/properties` | Rates, room counts, addresses, phones, everywhere |
| `GET /api/public/availability` | Step 2 of the booking flow |
| `POST /api/public/booking-requests` | Step 3 |
| `GET /api/public/booking-requests/:ref` | `/booking-status` |

`src/lib/divic-api.js` is the supplied `booking-widget.js`, adapted: the `DivicBooking`
class and its four methods keep their contracts, and gained ES module export, a base URL
from the environment, `AbortSignal` support, and errors that carry the HTTP status so the
UI can tell a `429` from a `400`. The original file is kept at the repo root for reference.

What the site never does, per the contract: it never sends a `total` (the server
recalculates and does not trust the browser), never requests room numbers, and never
implies a confirmed booking — the confirmation screen leads with **"No room is held
yet"** and shows the server's `message` word for word.

**Rates are never hardcoded.** `PROPERTY_SEED` mirrors the `/properties` response and
exists only so the site renders before the API is reachable. When the fetch succeeds,
live values win; when it does not, the booking flow says plainly that it could not check
availability rather than implying the numbers are current.

Set `WEBSITE_ORIGIN` on the backend to this site's exact origin, or CORS will refuse it.

## Photography

Source images live in `DIVIC URBAN/` and are never modified. Run:

```bash
node scripts/prepare-images.mjs
```

to regenerate `public/images/urban/`. The four room images arrive as 1200×628 marketing
flyers — inset thumbnails down the left, a contact and price bar along the bottom, a logo
watermark top right — so the script crops to the photograph alone. Prices especially must
not be burnt into a JPEG when the PMS is the source of truth.

**Divic Exclusive has no photography yet.** Rather than fill it with stock, its media
wells render the designed plate. Drop Exclusive images in and point `CONTENT.exclusive`
at them.

## Known discrepancies

- The Classic Room flyer reads **₦60,000**; `API.md` says **₦50,000**. The site follows
  the API. Worth reconciling with whoever maintains the flyers.
- The flyers carry a *Divic Exclusive Hotel* logo on Urban rooms, and quote 3rd Avenue —
  the Urban address. Cropped out, but the artwork itself may need fixing at source.
- Editorial copy (room descriptions, character lines, amenity notes) is written to be
  plausible and should be reviewed by the hotel. Every hard fact — rates, counts, floors,
  addresses, phones — comes from `API.md`.
