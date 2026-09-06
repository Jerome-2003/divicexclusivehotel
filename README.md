# Divic

Website for **Divic Exclusive** (15 rooms) and **Divic Urban** (21 rooms), two
separately-operated properties in Festac, Lagos, under one Divic brand.

Design direction, tokens and component rules: [`DESIGN-BRIEF.md`](./DESIGN-BRIEF.md).

## Running it

```bash
npm install
npm run dev        # development server
npm run build      # production build to dist/
npm run preview    # serve the production build
```

## Stack

React 19 + React Router, Vite, Tailwind. Fonts (Fraunces, Karla) are self-hosted through
`@fontsource-variable/*` — no CDN request and no external dependency at runtime.

Node/Express and MongoDB are not here yet: nothing on the site talks to a server, so
there is no server to write. They arrive with the booking flow.

## Layout

```
src/
  data/properties.js       all property content, in one module
  context/PropertyContext  which property is active; sets <html data-property>
  components/              SwanMark, Header, Footer, primitives (Plate, Reveal, …)
  pages/                   Home, Property, Contact
  styles/index.css         design tokens and component classes
legacy/                    the previous static site, kept for reference
```

**Routes:** `/` split chooser · `/exclusive` and `/urban` (one template, both houses) ·
`/contact`.

## Two properties, one brand

The active property is held in `PropertyContext` and written to `<html data-property>`.
Every accent resolves from CSS custom properties, so **no component knows which property
it is rendering** — adding a third property is a data change, not a code change.

The property is remembered for the session and reflected in a `?property=` parameter, so
a link to one house opens on that house.

## Not built yet

**The booking flow.** It is deferred until the PMS contract (`API.md`) is available, so
the reservation payload matches the real backend rather than a guess. In its place the
contact page carries a stay **enquiry**: it collects intent and hands it to the desk,
holds no inventory and quotes no rate. Its field names (`propertyId`, `arrival`,
`departure`, `adults`, `roomTypeId`) are chosen to line up with a reservation payload.

`booking-widget.js` is to be adapted rather than rebuilt, once supplied.

## Content is placeholder

Everything in `src/data/properties.js` — room names, descriptions, rates, amenities,
imagery — is written to be plausible, not accurate. Replace it before launch. The only
facts taken as given are the room counts: 15 at Exclusive, 21 at Urban, and each room-type
inventory adds up to its property's total.

Room types are shaped the way a PMS returns them (stable `id`, display name, inventory
`count`, `maxOccupancy`, `baseRateNGN`) so swapping this module for live API responses is
mechanical. Availability, rate plans and reservation fields are deliberately absent —
those belong to the real booking contract.
