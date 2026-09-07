# Divic Exclusive Hotels

Website for **Divic Exclusive Hotels** and its two separately-operated branches in
Festac, Lagos: **Divic Exclusive 1 Hotel** (15 rooms) and **Divic Urban** (21 rooms).

The PMS calls the first branch `Divic Exclusive`, and that name is left alone — it is
what booking payloads key on. `displayName` in `src/data/properties.js` is what guests
read.

**Brand contacts:** WhatsApp `09169845310` and Instagram `@divicexclusivehotel` belong to
the brand and reach either branch. Each branch keeps its own landline, which comes from
the PMS.

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

## Deploying

The site is published as a GitHub Pages **project site**: Pages is set to the `docs/`
folder on `main`, so `docs/` is build output that is committed, and it is served from
`https://jerome-2003.github.io/divicexclusivehotel/`.

```bash
npm run build     # writes docs/ — commit the result
```

**Rebuild and commit `docs/` whenever `src/` changes**, or the live site keeps serving
the previous bundle. This is the one remaining way the site can go wrong, and it has
already happened once: `docs/` was committed, the source was then fixed, and the stale
bundle kept serving the old paths.

Nothing in the app hardcodes the sub-path. The photography is *imported* rather than
referenced by URL (see below), and the router takes `import.meta.env.BASE_URL` as its
`basename`, so one flag moves the whole site:

| Served from | Build with |
|---|---|
| `…github.io/divicexclusivehotel/` (today) | `npm run build` |
| the origin root, e.g. a user site | `VITE_BASE=/ npm run build` |
| somewhere else | `VITE_BASE=/path/ VITE_OUT_DIR=dist npm run build` |

Every build also writes `404.html` beside `index.html`. Pages has no server-side rewrite,
so without it a guest who opens `/urban` directly, or reloads it, gets Pages' own 404
instead of the site. Pages serves `404.html` for unknown paths, which hands the URL back
to the router. It is generated on every build rather than copied by hand, so it cannot
drift out of step with `index.html`.

## Stack

React 19 + React Router, Vite, Tailwind. Fonts (Fraunces, Karla) are self-hosted through
`@fontsource-variable/*` — no CDN request and no external runtime dependency.

There is no Express/Mongo layer in this repo: the site is a static front end that talks
to the PMS's three public endpoints. The PMS owns the database.

## Layout

```
src/
  assets/images/           the photography, imported (not served from public/)
  data/properties.js       PROPERTY_SEED (mirrors the API) + editorial CONTENT
  lib/images.js            photo() — bundler-resolved image URLs
  lib/divic-api.js         API client, adapted from the supplied booking-widget.js
  lib/useProperties.js     live properties, falling back to the seed
  context/PropertyContext  which property is active; sets <html data-property>
  components/              SwanMark, Header, Footer, primitives (Plate, Reveal, …)
  pages/                   Home, Property, Contact, Book, BookingStatus
  styles/index.css         design tokens and component classes
scripts/prepare-images.mjs crops and optimises the supplied photography
scripts/check-images.mjs   fails the build when a name and a file disagree
DIVIC URBAN/               source photography (originals, never modified)
src/assets/images/         generated web assets, imported by the app
legacy/                    the previous static site, kept for reference
```

**Routes:** `/` destination chooser · `/exclusive` and `/urban` (one template, both
houses) · `/book` · `/booking-status` · `/contact`.

The whole site sits on one near-black ground (`obsidian`), the same one the homepage and
the swan mark use. Each house is told apart by a single accent held in CSS custom
properties on `<html data-property>`: olive-bronze for Exclusive, Lagos clay for Urban.
See [`DESIGN-BRIEF.md`](./DESIGN-BRIEF.md) §3 for the tokens and §14 for what changed.

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

**The photographs are imported, not served as static files.** They live in
`src/assets/images/<property>/` and are reached through `photo(property, name)` in
`src/lib/images.js`, which builds its map with `import.meta.glob`.

They used to sit in `public/` and be written as literal URLs — `/images/urban/bar.jpg`.
That failed twice over: a literal URL has to know where the site is deployed, so it
broke under the Pages project path; and nothing checked it, so a wrong name was a 404 in
somebody's browser rather than an error. Importing removes both. Vite resolves each file
at build time, emits it with a content hash and writes the URL with the deployment base
already applied, so the base cannot be wrong and a stale cached file cannot be served.

`npm run build` runs `scripts/check-images.mjs` first, which fails the build if a
referenced name has no file — and lists any file the site never uses.

Source images live in `DIVIC URBAN/` and `divic exclusive/` and are never modified. Run:

```bash
node scripts/prepare-images.mjs
```

to regenerate `src/assets/images/<property>/`. The room images arrive as marketing flyers and
the script crops each to the photograph alone — prices especially must not be burnt into a
JPEG when the PMS is the source of truth. The two properties' flyers are laid out
differently, so each has its own geometry in the script:

| | Urban | Exclusive |
|---|---|---|
| Source | 1200×628 | 1080×565 |
| Thumbnail panel | left | left |
| Logo watermark | top right | top centre |
| Extra inset | — | right |
| Crop | `228,0 852×560` | `205,100 670×408` |

**Galleries group related shots.** Where a place was photographed more than once — three
angles on the Urban bar, the indoor and outdoor bars at Exclusive — the group renders as
one crossfading slideshow rather than as separate items pretending to be different rooms.
It pauses on hover and focus, and does not auto-advance under `prefers-reduced-motion`.

The property hero uses the same photography: the frontview opens, then one shot from each
gallery group, so a guest choosing a house sees what that house actually has.

## The logo

`public/divicexlusive.jpg` is the supplied logo. `scripts/prepare-logo.mjs` cuts it into
the two shapes the site uses and writes them to `src/assets/brand/`:

| Output | What it is | Used by |
|---|---|---|
| `logo-mark.png` | swan and oval, 172x187 | header, homepage nav, hero, splash, favicon |
| `logo-full.png` | mark and wordmark, 262x273 | footer |

Both have the white field lifted off them by flooding inward from the border rather than
by keying every white pixel — the swan itself is near-white, and a naive key erases it.

**The logo is rendered on a white plate** (`<Logo plate />`). The swan is near-white and
the page ground is off-white, so without one the bird all but disappears and only the gold
oval reads. The plate is the logo's own presentation, not decoration.

**Resolution is the ceiling here.** The source is 503x496 and the mark inside it is only
about 172x187, so nothing is ever enlarged and the site is sized to suit. A higher
resolution original — better still, the vector it was drawn from — would let the splash
and the footer run larger.

## The entry sequence

`src/components/SplashScreen.jsx`: the logo settles, then the words come into focus under
it, with a hairline filling underneath. Two CSS keyframes, once per browser session, and
skipped for anyone who has asked for reduced motion.

This replaced a Remotion composition. Remotion is a video toolchain — it shipped roughly
93 kB gzipped of player, plus a licence obligation, to draw two elements for under three
seconds. The dependency is gone.

## Known discrepancies

- The Classic Room flyer reads **₦60,000**; `API.md` says **₦50,000**. The site follows
  the API. Worth reconciling with whoever maintains the flyers.
- **Urban Superior**: `API.md` says **₦60,000** and the seed follows it, but it has also
  been quoted as ₦50,000. That would put Superior below Deluxe and level with Classic,
  which breaks the ladder, so the contract's figure is used until the PMS says otherwise.
  Since rates are served live, whatever the PMS returns is what guests actually see.
- The flyers carry a *Divic Exclusive Hotel* logo on Urban rooms, and quote 3rd Avenue —
  the Urban address. Cropped out, but the artwork itself may need fixing at source.
- **Urban Classic and Urban Superior are the same photograph.** The two source flyers
  differ only in their text and price bars; the room photograph inside them is identical,
  so once the flyer furniture is cropped away the two files are byte-for-byte the same.
  A guest paying ₦60,000 for a Superior currently sees the ₦50,000 Classic room. This
  needs a real Superior photograph from the hotel — it cannot be fixed in code.
- **Exclusive room photographs are small.** The Exclusive flyers are 1080×565, so the
  cropped photograph is only 670×408. On the full-width room spread that is upscaled
  roughly 1.3×, which is soft on a large screen. Original-resolution room photographs
  would fix it.
- **Private booking rates are held in the site, not the PMS.** Urban's indoor pool
  (₦200,000), VIP bar (₦200,000) and outdoor bar (₦100,000) are whole-space hire, which
  `GET /api/public/properties` does not carry. They are the one place the site quotes a
  price the hotel system does not own, so they must be changed here when they change.
- **The booking form's ID number travels in `specialRequests`.** API.md's request body has
  no field for it and sending an unlisted one risks a 400, so it goes in as a labelled
  first line where the receptionist will see it. Add a `guestId` field to the PMS and it
  should move there.
- **House rules and private bookings are set on Urban only**, as supplied. They read like
  brand-wide policy; if they apply to Exclusive 1 too, copy the two blocks across in
  `src/data/properties.js`.
- **The logo artwork reads "Divic Exclusive Hotel"** while the brand is "Divic Exclusive
  Hotels". Worth correcting at source.
- **The Exclusive photography is low-resolution at source** — some frames are 500x333.
  `scripts/prepare-images.mjs` sharpens and encodes at quality 90 to get the most out of
  them, but it cannot add detail. Higher-resolution originals are the real fix.
- Editorial copy (room descriptions, character lines, amenity notes) is written to be
  plausible and should be reviewed by the hotel. Every hard fact — rates, counts, floors,
  addresses, phones — comes from `API.md`.
