# Divic — Brand & UI Guidelines

**Direction:** Limestone
**Applies to:** Divic Exclusive (15 rooms) and Divic Urban (21 rooms), Festac, Lagos
**Status:** Front end built, booking flow wired to the PMS public API.

---

## 1. The problem this solves

Two hotels a few minutes apart on the same streets cannot differentiate on place. They
differentiate on **character and audience**:

| | Divic Exclusive | Divic Urban |
|---|---|---|
| Rooms | 15 | 21 |
| Register | Residential, discreet, low-lit | Open, social, daylit |
| Guest | Stays three nights or longer, wants privacy | Stays one or two nights, wants the city |
| Pace | Slow, evening | Quick, morning |

The governing rule: **the chassis is fixed, one accent varies.** Type, spacing, grid,
motion and every component's anatomy are identical across both. Only the accent colour,
the imagery tone and the content itself change. Switch property and it reads as a change
of light, never a different website.

---

## 2. Colour

Light ground, ink type, the champagne from the swan mark reserved for the mark and dark
surfaces. Accents are exposed as CSS custom properties on `<html data-property>`, so no
component ever hard-codes a property.

### Shared (never varies)

| Token | Value | Role |
|---|---|---|
| `limestone` | `#EFEBE4` | Primary ground |
| `chalk` | `#F7F4EF` | Raised ground, alternating sections |
| `sand` | `#E4DED3` | Media plate base |
| `obsidian` | `#0B0A08` | Deliberate dark: hero scrim, footer, closing sections |
| `espresso` | `#191410` | Dark panel step |
| `ink` | `#16130F` | Body text on light |
| `slate` | `#6B635A` | Secondary text |
| `mute` | `#948B80` | Labels, tertiary |
| `bone` | `#F2EDE3` | Text on dark |
| `champagne` | `#C9A961` | The mark, and eyebrows on dark grounds only |

### Per property

| | Divic Exclusive | Divic Urban |
|---|---|---|
| `--accent` | `91 86 56` — deep olive-bronze | `180 84 58` — Lagos clay |
| `--accent-deep` | `62 58 36` | `138 61 40` |
| Reads as | Older, quieter, residential | Hotter, younger, street-facing |

**Usage discipline.** The accent is line, letter and state — never a large fill, with the
single exception of one solid button per view. Body copy is never accent-coloured.
Contrast: ink on limestone ≈ 14:1; slate on limestone ≈ 6.4:1; both accents clear 4.5:1
on limestone at body size.

---

## 3. Typography

| Face | Role | Notes |
|---|---|---|
| **Fraunces Variable** | Display, room names, rates | Set light. Real character without reading as stock-elegant |
| **Karla Variable** | Body, navigation, labels, data | Humanist geometry, excellent at small sizes |

Both are self-hosted through `@fontsource-variable/*` — no CDN request, no external
dependency, no layout shift.

| Step | Size | Use |
|---|---|---|
| `d1` | `clamp(2.75rem, 6vw, 5rem)` | Hero, property names |
| `d2` | `clamp(2rem, 4vw, 3.25rem)` | Section openers |
| `d3` | `clamp(1.5rem, 2.4vw, 2rem)` | Room names, card titles |
| `lead` | `1.125rem / 1.65` | Lead paragraphs, capped at `64ch` |
| `body` | `1rem / 1.7` | Standard copy |
| `label` | `0.75rem`, `0.14em` tracking | Buttons, navigation |
| `micro` | `0.6875rem`, `0.18em` tracking | Eyebrows, spec keys, coordinates |

Display is set **light**, never bold. Labels are the only uppercase text. Headings carry
`text-wrap: balance`. Measure caps at `64ch`.

---

## 4. Layout

- Shell `1360px`, gutters `clamp(1.25rem, 5vw, 5rem)`, section rhythm `clamp(5rem, 11vh, 9rem)`.
- Twelve columns, asymmetric by default: `1–7 / 9–12`, `1–6 / 9–12`, `1–4 / 6–12`.
  Never the symmetric `1–6 / 7–12`.
- Ground alternates limestone → chalk → obsidian to give a long page its cadence.
- Galleries are asymmetric with deliberate offsets, never a grid of equal tiles.

---

## 5. Components

**Header.** Fixed. Over a hero it inverts to bone with no border; past 24px of scroll it
takes a limestone ground at 85% with backdrop blur and an ink hairline. The switcher and
wordmark invert with it.

**Property switcher.** The persistent pivot — present at every scroll position and every
breakpoint, never folded into the menu. `role="tablist"`, `aria-selected` maintained, a
sliding indicator, and it *navigates* to that property rather than filtering in place.

**Plate.** Every media well is a designed surface — layered gradients carrying the
property's accent at real strength — with the photograph layered over it. If an image is
slow, blocked or missing, the composition still reads, and the two properties stay
tellable apart at thumbnail size even before photography exists.

**Room row.** Image and copy trade sides down the page. The image is the card: no border,
no shadow. Specs sit in a hairline list; the rate sets its numeral in the display face
with the qualifier in micro type.

**Reveal.** Fires once at 15% visibility, never replays, and collapses to a plain fade
under `prefers-reduced-motion`.

---

## 6. Motion

One curve, `cubic-bezier(.16, 1, .3, 1)`. Durations: `400ms` micro-states, `700ms`
property switch and indicator travel, `1100ms` reveals and image fade-in. Every animation
is gated behind `prefers-reduced-motion`.

---

## 7. Accessibility

One `h1` per view, sequential headings, landmark regions, and a skip link. A 2px accent
focus ring at 3px offset on every interactive element, distinct from hover and never
removed. The active property is signalled by indicator position *and* weight, not colour
alone. Verified at 1440 / 820 / 390 with no horizontal overflow and no console errors.

---

## 8. Art direction

Photography is wide, quiet and architectural, with human presence implied rather than
modelled. **Exclusive** is graded warm and low: lamplight, texture, stillness, no people.
**Urban** is graded bright and cool-neutral: daylight, hard shadow, geometry, people in
motion. The two grades must be identifiable side by side at thumbnail size.

---

## 9. Booking

The reservation flow is four steps against the PMS's public endpoints, styled to the same
system as everything else.

| Step | What happens |
|---|---|
| 1. Dates | House, arrival, departure, adults, children. Validated client-side for the contract's rules — not in the past, after arrival, 60 nights maximum |
| 2. Room | `GET /availability` returns free counts and totals. Sold-out types are shown and disabled rather than hidden, so the guest can see what they missed |
| 3. Details | Name and telephone required, email and requests optional. Empty optional fields are omitted rather than sent blank |
| 4. Confirmation | Leads with **"No room is held yet"**, shows the server's `message` word for word, then reference, quoted rate and total, and a button to call the house |

A running summary sits alongside every step, and `/booking-status` lets a guest look up a
reference.

Three rules the UI follows because the contract requires them:

- **No `total` is ever sent.** The server recalculates; a figure from a browser is never
  trusted. The estimate on screen is labelled as such.
- **A request is not a booking.** Nothing on the confirmation screen may imply a held
  room — that would put a guest at a full hotel at midnight.
- **Rates are never hardcoded.** They come from `/properties`; the local seed exists only
  so the site renders before the API is reachable, and the UI says when it could not check.

Errors are surfaced in the guest's language: `400` asks them to check dates and details,
`429` asks them to wait a few minutes, anything else offers the telephone.

---

## 10. Photography

Wide, quiet, architectural, with human presence implied rather than modelled.
**Exclusive** is graded warm and low: lamplight, texture, stillness. **Urban** is graded
bright and cool-neutral: daylight, hard shadow, geometry. The two grades should be
identifiable side by side at thumbnail size.

Supplied Urban imagery arrives as marketing flyers with overlaid text, price and logo;
`scripts/prepare-images.mjs` crops to the photograph alone. No price is ever burnt into
an image — the PMS owns prices.

Exclusive has no photography yet, and renders its designed plate rather than stock.

---

## 11. Still to do

- **Photography for Divic Exclusive.** The only reason that house looks quieter than
  Urban right now.
- **Editorial copy review.** Room descriptions, character lines and amenity notes are
  written to be plausible; every hard fact comes from `API.md`.
- **Deposits.** The contract supports an optional `paystackReference`; the flow does not
  take payment, and the client is ready for it when you are.

---

## 12. Design pass — what the review changed

Run against the repo's `frontend-design` skill, which calibrates a design against the
traits that currently mark work as machine-generated. Several were present and have been
removed. None of them belonged to the Limestone direction; they were default habits
layered on top of it.

| Removed | Why |
|---|---|
| Tracked-out ALL-CAPS eyebrow above nearly every heading | A label that restates its heading is decoration. Labels now appear only where they carry something the heading does not, in sentence case |
| `01 / 02 / 03` numerals on room types | Numbering encodes sequence. Rooms are a set, not a sequence — the room count already says what the numeral pretended to |
| `→` appended to every link and button | Template chrome. The link is carried by colour, underline and hover |
| Middle-dot meta strings (`21 rooms · Open, social, daylit`) | Now written as sentences, because they are sentences |
| Fade-and-slide-up reveal on every section | Scattered scroll effects are the generated default. Everything is visible at rest; motion is spent where it answers an action |
| All-caps buttons, navigation, switcher and spec keys | Signage where data and plain controls belong |

**One finding stands open.** The skill names as its first calibration trait: *"a warm cream
background (near #F4F1EA) with a high-contrast serif display and a terracotta or warm-clay
accent"*. That is a fair description of Limestone — cream `#EFEBE4`, Fraunces, clay
`#B4543A`. The direction was chosen deliberately from three options and the brief's own
choice wins over the calibration list, so it stands. But it is worth knowing that the
palette sits on the most crowded square of the board, and the differentiation now rests on
the photography, the asymmetric layout and the two-house accent system rather than on the
palette itself.

If that is not acceptable, **Modernist Lagos** — off-white against ink-green, Bodoni Moda
display, oxblood against signal green — moves decisively off the cluster and was the
strongest of the three on distinctiveness. It needs commissioned photography to carry it.

---

## 13. The homepage — select your destination

The homepage is a **dark portal** that opens into the light Limestone property pages. That
is deliberate rather than a second system: the logo, the splash and the hero photography
are all dark, so the entry is dark and the reading surfaces are light.

**Shell.** A sticky bar carries the wordmark, the two houses as tabs, an inline search
(check-in, check-out, adults, children) and a Search button, with a hamburger for
secondary navigation. It is the homepage's own navigation — every other page keeps the
site header, so nothing that has already been designed changes underneath it.

**One control, one job.** The pattern this follows carries both location tabs *and* a
separate location dropdown. Here the tabs are the search's location, and the dropdown is
gone. Two controls for one decision is the thing this brief has removed twice already.

**Search is not decoration.** It collects exactly what `GET /api/public/availability`
needs and hands it to `/book` as query parameters; the booking flow opens on the room step
with availability already fetched rather than asking for the same four answers again.

**Hero.** Four ambient establishing shots crossfade behind a centred overlay — swan,
wordmark, eyebrow, headline, rule, one line of description, the two destination cards, and
dots. The rotation alternates houses so the carousel itself says there are two. It pauses
on hover and does not advance under `prefers-reduced-motion`.

**Colour on this shell.** Champagne `#C9A961` is the *brand* accent — Search, active tab,
dots, wordmark. The property accents stay the *property* signal, lifted to read on black:
Exclusive `#8A8258`, Urban `#C9704E`. Same two hues as the rest of the system, adjusted
for their ground. Nothing here borrows the reference site's orange.

**Below `xl`** the search cannot share a row with the wordmark, tabs and menu, so it
collapses behind a Search button and opens as a panel — and below `sm` the tabs move into
that panel, where they are the location control anyway. Measured to fit from 360 px up.

**Two notes against the design calibration.** A centred hero and an all-caps eyebrow are
both on `frontend-design`'s list of generated-design tells. They were specified, and they
are genuine luxury-hospitality convention, so they stand — but they are the two places
this page follows a pattern rather than making an argument.
