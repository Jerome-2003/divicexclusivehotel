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

## Deploying

The site is published as a GitHub Pages **project site**: Pages is set to the `docs/`
folder on `main`, so `docs/` is build output that is committed, and it is served from
`https://jerome-2003.github.io/divicexclusivehotel/`.

```bash
npm run build     # writes docs/ — commit the result
```

**Rebuild and commit `docs/` whenever `src/` or `public/` changes**, or the live site
keeps serving the previous bundle. The build copies `public/images/` into `docs/images/`;
a deploy missing that directory is what produces `404 (Not Found)` on every photograph.

Nothing in the app hardcodes the sub-path. Asset URLs go through `src/lib/asset.js`,
which resolves against `import.meta.env.BASE_URL`, and the router takes the same value as
its `basename`, so one flag moves the whole site:

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

Source images live in `DIVIC URBAN/` and `divic exclusive/` and are never modified. Run:

```bash
node scripts/prepare-images.mjs
```

to regenerate `public/images/<property>/`. The room images arrive as marketing flyers and
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

## The splash animation, and Remotion's licence

The entry animation is a Remotion composition (`src/remotion/DivicSplash.jsx`) played by
`@remotion/player`, code-split so it never sits in the critical path.

**Remotion is not MIT-licensed.** Its licence is free for individuals and for companies
below a size threshold, and requires a paid company licence above it — see
<https://remotion.dev/license>. `src/components/SplashPlayer.jsx` passes
`acknowledgeRemotionLicense`, which only silences the console notice; it does not grant
anything. Confirm Divic falls under the free terms, or buy the licence. If neither suits,
the splash is one lazy import to remove and the rest of the site is unaffected.

The player is `initiallyMuted` because the composition has no audio track. Without it the
browser blocks autoplay on an unmuted player, opens an `AudioContext` it will not start,
and Remotion mutes the player itself and warns.

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
- Editorial copy (room descriptions, character lines, amenity notes) is written to be
  plausible and should be reviewed by the hotel. Every hard fact — rates, counts, floors,
  addresses, phones — comes from `API.md`.
