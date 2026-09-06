# Divic — Brand & UI Guidelines

**Direction:** Limestone
**Applies to:** Divic Exclusive (15 rooms) and Divic Urban (21 rooms), Festac, Lagos
**Status:** Front end built. Booking flow pending the PMS contract.

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

## 9. Still to do

- **Booking flow.** Deferred until `API.md` lands. The contact page carries a stay
  *enquiry* — it collects intent and hands it to the desk; it holds no inventory and
  quotes no rate. Its field names are chosen to line up with a reservation payload.
- **`booking-widget.js`.** To be adapted rather than rebuilt, once supplied.
- **Content and photography.** Everything in `src/data/properties.js` is placeholder,
  written to be plausible rather than accurate. Room counts (15 and 21) are the only
  facts taken as given, and the room-type inventory adds up to them.
