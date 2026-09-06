# DIVICEXCLUSIVE — Dual-House UI/UX Design Brief

**Document:** Visual identity, interaction architecture & front-end design system
**Deliverable:** `dual-location-concept.html` (working visual layout concept)
**Version:** 1.0

---

## 0. Assumption on naming

The request specified two contrasting properties by example (*Coastal Villa, Amalfi* /
*Mountain Retreat, Swiss Alps*). This brief applies that structure to the brand that
actually exists in this repository, so the concept reads as a real portfolio rather than
a template:

| | House I | House II |
|---|---|---|
| **Name** | DiviceXclusive Lagos — *The Lagoon House* | DiviceXclusive Obudu — *The Plateau House* |
| **Place** | 1st Avenue, E Close, Festac, Lagos | Obudu Mountain, Cross River |
| **Geography** | Atlantic coastal city, 4 m | Highland plateau, 1,576 m |
| **Climate** | Warm, humid, hard light | Cool, misted, soft light |
| **Material key** | Teak, aged brass, linen, water | Basalt, wool, oak, cloud |
| **Tempo** | Nocturnal, social, low-lit | Slow, solitary, early-rising |

Both house names, coordinates, copy and imagery live in a **single `HOUSES` object** at the
top of the concept's script. Re-pointing the brand to Amalfi and the Swiss Alps — or to any
other pair — is one edit to that object; no markup or CSS changes are required. Everything
downstream binds through `data-bind` attributes.

---

## 1. Positioning & design intent

> **Two houses. One code of hospitality.**

The design problem in a two-property brand is not navigation — it is **identity without
fragmentation**. Guests must feel they are choosing between two genuinely different
*places*, while never leaving one coherent *house*.

The resolution used throughout: **the brand chassis is fixed, the atmosphere is variable.**
Typography, spacing, rules, motion curves and component anatomy never change between
properties. Only three things shift — ground tone, accent metal, and imagery. The
switch is felt as a change of light, not a change of website.

**Three principles**

1. **Editorial, not brochure.** Layouts are built on an asymmetric magazine grid with
   deliberate emptiness. Nothing is centred by default; nothing fills its container simply
   because the container exists.
2. **Restraint reads as expensive.** One accent metal, one display face, one motion curve.
   Luxury is signalled by what has been removed.
3. **Place before product.** Weather, altitude, coordinates and material palette are given
   equal billing to room rates. The guest is buying a place, not a bed.

**Anti-patterns, explicitly excluded:** hero carousels with dots, drop-shadowed cards on a
grey grid, four equal feature tiles with circle icons, gradient CTAs, stock "Book Now"
badges, testimonial sliders, counters that animate to a number.

---

## 2. Colour system

Deep grounded darks, warm neutral lights, a single metallic. Every token is a CSS custom
property; property theming is a swap of five variables on `<html data-property>`.

### 2.1 Brand constants (never change)

| Token | Value | Role |
|---|---|---|
| `--creme` | `#FAF6EF` | Lightest ground, editorial pages |
| `--parchment` | `#F1EADE` | Primary warm neutral ground |
| `--parchment-2` | `#E7DECE` | Ground step, inset panels |
| `--obsidian` | `#0B0A08` | Deepest ground, portal + footer |
| `--ink` | `#14100C` | Body text on light grounds |
| `--ink-soft` | `#5A5046` | Secondary text on light |

### 2.2 Property themes

| Token | House I — Lagos | House II — Obudu | Role |
|---|---|---|---|
| `--deep` | `#1A130D` espresso | `#0F1713` deep forest | Dark section ground |
| `--deep-2` | `#241A12` | `#16211B` | Lifted panel / hairline fills |
| `--accent` | `#B8905A` brushed brass | `#C9B489` champagne bronze | Rules, eyebrows, CTA borders |
| `--accent-soft` | `#E4CDA5` | `#E3DAC3` | Hover states, large-format numerals |
| `--ground` | `#F4EDE1` warm | `#EFEDE4` cool | Light section ground |

**Usage discipline**
- Accent is **line and letter, never fill** — except one solid CTA per viewport, maximum.
- Body copy never uses the accent. Eyebrows, rules, numerals, active states and links only.
- Contrast floor: `--parchment` on `--deep` ≈ 14:1; `--accent` on `--deep` ≈ 5.6:1 (used at
  ≥14 px/500 weight or as non-text ornament); `--ink-soft` on `--ground` ≈ 6.9:1.
- The theme swap is animated: all colour tokens transition over 700 ms so the switch reads
  as a change of daylight rather than a repaint.

---

## 3. Typography

A high-contrast display serif against a geometric sans, held to a strict scale.

| Face | Use | Settings |
|---|---|---|
| **Cormorant Garamond** (300/400 + italic) | Display, house names, pull quotes, numerals | tracking `-0.02em`, leading `0.92–1.06` |
| **Jost** (300/400/500) | Body, navigation, labels, data, UI | tracking `0.01em` body / `0.34em` labels |

### 3.1 Scale (fluid, `clamp()`)

| Step | Size | Application |
|---|---|---|
| `display-xl` | `clamp(3.4rem, 9vw, 8.75rem)` | Portal house names, hero |
| `display-l` | `clamp(2.4rem, 5.2vw, 4.75rem)` | Section openers |
| `display-m` | `clamp(1.8rem, 3vw, 2.9rem)` | Card and room titles |
| `quote` | `clamp(1.5rem, 2.6vw, 2.5rem)` italic | Pull quotes |
| `body-l` | `1.0625rem / 1.75` | Lead paragraphs, max `64ch` |
| `body` | `0.9375rem / 1.75` | Standard copy, max `62ch` |
| `label` | `0.68rem`, `0.34em` tracking, uppercase | Eyebrows, nav, data keys |
| `micro` | `0.6rem`, `0.28em` tracking | Coordinates, legal, index numerals |

### 3.2 Rules
- Display serif is set **light (300)**, never bold. Weight is the enemy of elegance at size.
- Headlines may break to a second line with an **italic clause** — the brand's one flourish.
- Measure is capped at 62–64 characters everywhere. No full-bleed paragraphs.
- Labels are the only uppercase text. Headlines are sentence case, always.
- Numerals in indices and data use serif oldstyle-feeling italics for texture.

---

## 4. Layout & grid

- **Container:** `1440px` max, gutters `clamp(1.25rem, 5vw, 6rem)`.
- **Grid:** 12 columns, `clamp(1rem, 2vw, 2rem)` gap.
- **Asymmetry is mandated.** Canonical spans: `1–5 / 7–12`, `1–7 / 9–12`, `2–6 / 8–12`.
  Nothing is `1–6 / 7–12`; the symmetric split is the template look being avoided.
- **Vertical rhythm:** section padding `clamp(6rem, 12vh, 11rem)`; a section opener is
  separated from its content by a full rhythm step, not a heading margin.
- **Negative space is a component.** A minimum of one empty grid column beside any text
  block above `md`. Editorial captions sit in that column, small and offset — never
  underneath the image, centred.
- **Ground alternation** creates the page's cadence:
  `portal (obsidian) → destinations (ground) → rooms (deep) → dining (ground) → experiences (deep) → story (creme) → footer (obsidian)`.

---

## 5. Motion

| Token | Value | Use |
|---|---|---|
| `--ease` | `cubic-bezier(.16, 1, .3, 1)` | Everything. One curve is a brand asset. |
| `--d-1` | `320 ms` | Hover, focus, micro-states |
| `--d-2` | `600 ms` | Panel expansion, content swap |
| `--d-3` | `1100 ms` | Reveals, theme transitions, Ken Burns entry |

- **Reveal:** `opacity 0 → 1`, `translateY(28px) → 0`, staggered `70 ms` per sibling,
  fired once by `IntersectionObserver` at 18 % visibility. Never re-plays on scroll-up.
- **Ken Burns:** hero imagery scales `1.06 → 1.0` over 12 s, `ease-out`, one direction only.
- **House switch:** outgoing content lifts `-10px` and fades over 260 ms, content is swapped,
  incoming settles over 600 ms. A hairline accent sweep crosses the viewport during the
  exchange — the only "loud" moment in the design.
- **`prefers-reduced-motion: reduce`** removes Ken Burns, parallax, cursor-follow and all
  transforms; opacity transitions are retained at 1/3 duration. Nothing becomes unreachable.

---

## 6. Component specifications

### 6.1 Header — sticky, glass
- **Anatomy:** wordmark + house line (left) · primary links (centre) · house switcher +
  `Check Availability` (right). Height `84px` desktop / `64px` mobile.
- **States:** over the portal it is fully transparent with no border. Past `72px` of scroll
  it becomes `backdrop-filter: blur(18px)` over an 82 %-opacity ground with a 1 px accent
  hairline at 18 % opacity. Transition `320 ms`.
- **Links:** `label` type, accent underline that grows from left on hover (`transform:
  scaleX()` on a 1 px pseudo-element), never a colour-only change.
- **CTA:** 1 px accent border, transparent fill, letter-spaced label; inverts to solid
  accent on hover. It is the only bordered element in the header.

### 6.1a Entry sequence — the swan, then the choice

The site opens with a single narrative built from the brand mark itself, then hands the
guest a decision. Two screens, in order, once per session.

**The loading sequence** (~6 s, skippable, `index.html`). The mark is drawn as inline SVG
so each part animates independently — no video, no image, no library.

| Beat | Timing | What happens |
|---|---|---|
| Approach | 0.1–2.2 s | The swan enters from a distance at 14 % scale, drifting across the water toward the golden sun, which warms from 18 % to full as it nears |
| Settle | 2.1–3.0 s | It arrives on the sun and rocks once as its weight lands |
| Wingbeat | 2.05–3.75 s | Two beats; the wing lifts clear of the back line, breaking the silhouette, then folds flush |
| Ripples | 2.5–5.3 s | Three rings spread from the waterline, staggered 350 ms apart |
| The words | 3.35–4.7 s | Both lines of the wordmark rise out of the ripple line, blurred to sharp, staggered |
| The logo | 4.5–5.5 s | The lock-up settles to its final position and holds |
| Open | 6.0 s | Fades to the branch gate |

Skippable by click, `Esc`, `Enter` or `Space`, with a Skip control from 1.6 s. Under
`prefers-reduced-motion` the finished logo is held for 1.8 s instead of animated. It runs
once per session, so navigating the site is never punished by a six-second wait.

**The branch gate.** The split portal then takes the full viewport with the header covered
and scrolling locked: the guest chooses a house before the site opens. The choice is
remembered for the session, and a deep link is held and restored afterwards — arrive at
`#book`, choose Obudu, and you land on the booking page for Obudu. The back office is
never gated. "View both houses" hands the choice back.

### 6.2 House switcher — the persistent pivot
The brand's signature control. Present in the header on every page and every scroll position.

- **Anatomy:** a pill with a 1 px accent hairline containing two labels (`LAGOS` /
  `OBUDU`) and a sliding indicator that travels beneath the active label over `600 ms`.
- **Behaviour:** switching re-themes the document (`data-property`), crossfades every bound
  string and image, updates the booking widget's house field, and writes the house to the URL —
  it never navigates or reloads.
- **Semantics:** `role="tablist"` with two `role="tab"` buttons, `aria-selected` maintained,
  arrow-key traversal, visible focus ring. Announced via a polite live region:
  *"Now viewing The Plateau House, Obudu."*
- **Mobile:** the pill persists at reduced scale, keeping both place names legible, with the
  full house name in `aria-label`. It is never buried in the hamburger menu.

### 6.3 Split hero portal
- **Default:** two full-height halves divided by a 1 px accent rule, each with its own
  imagery, house name in `display-xl`, one line of place-setting copy, and an `Enter` action.
  A centred brand mark and *"Choose your journey"* sit on the divider.
- **Hover (pointer, ≥`lg`):** the hovered half expands `50% → 62%`, the other dims to 45 %
  brightness and its type recedes. `600 ms`, one curve.
- **Resolve:** on `Enter`, the chosen half expands to full bleed, the other collapses, and
  the hero settles into a single-property statement with a `View both houses` ghost return.
  The document theme is applied at the same moment.
- **Keyboard:** each half's `Enter` action is a real button in tab order; `←`/`→` move
  between halves. **Touch/`sm`:** halves stack vertically at `50vh` each; no hover
  dependency, no expansion — the action is the tap target.

### 6.4 Destination picker — cross-property showcase
- Full-bleed horizontal rail, `scroll-snap-type: x mandatory`, cards at `min(78vw, 560px)`.
- **Card anatomy:** tall image plate · index numeral · house name · a **data strip**
  (temperature, altitude, coordinates, signature amenity) set as a hairline-separated
  definition list · a text link, never a button.
- Drag-to-scroll with pointer capture, native wheel/trackpad scroll, arrow buttons, and a
  hairline progress rule that fills with scroll position. Cards are keyboard-reachable and
  focus scrolls them into view.

### 6.5 Unified booking widget
- **Placement:** fixed bottom-centre, `max-width 1080px`, `24px` from the viewport edge.
  Suppressed while the portal is unresolved — the guest chooses a place before a date.
- **Surface:** `blur(20px)` glass over the deep ground at 88 % opacity, 1 px accent
  hairline, no shadow (shadows read as consumer software; a hairline reads as print).
- **Fields:** House · Arrive · Depart · Guests · `Check availability`. Fields are separated
  by 1 px vertical rules, labelled above in `micro` type, values in `body`.
- **Collapse:** on downward scroll it contracts to a single pill showing house + dates and
  expands on hover, focus, upward scroll, or the header CTA.
- **Sync:** always reflects the active house; changing the house field switches the whole
  document theme, and vice versa. One source of truth.

### 6.6 Rooms & suites
Alternating asymmetric rows — image `1–7` / copy `9–12`, then mirrored. Copy block carries
an index numeral, title, 2-line description, a hairline spec list (size · view · bed), and
a rate line where the numeral is serif and the currency is `micro`. No card borders; the
image *is* the card.

### 6.7 Dining & experiences gallery
- **Dining:** a three-plate asymmetric composition — one tall plate, one wide plate offset
  below and to the right, one small square overlapping the gutter — with the caption set in
  the empty column at `micro` size.
- **Experiences:** an editorial index. Rows of `index · name · duration`, separated by
  hairlines, with the row's title translating `12px` right on hover while a cursor-following
  image preview fades in at 0.9 opacity. Touch and reduced-motion users get a static
  thumbnail per row instead. The list is the design — no tiles.

### 6.8 Footer
Two columns of house data (address, telephone, coordinates, altitude) beneath the
wordmark, a single-field newsletter subscribe with an underline input and an arrow submit,
and text-only social links. One hairline, no icon row, no back-to-top rocket.

---

## 7. Responsive behaviour

| Breakpoint | Layout |
|---|---|
| `< 640` | Single column. Portal halves stack `50vh`. Booking widget opens as a full-width compact bar and expands to the full field set on tap. Header centre links move to an overlay menu; the switcher stays visible. |
| `640 – 1023` | Two-column asymmetry where it survives; rooms alternate at `1–5 / 6–12`. Rail cards at `72vw`. |
| `1024 – 1439` | Full 12-column asymmetric grid. Portal hover expansion active. |
| `≥ 1440` | Container caps at `1440px`; gutters absorb the remainder. Type does not keep growing — the scale tops out so the page stays a page, not a billboard. |

Touch targets `≥ 44px`. No hover-only path to any content or action.

---

## 8. Accessibility

- **Contrast:** all body and label text meets WCAG AA against its ground; the accent is
  restricted to sizes/weights where it clears 4.5:1, or to non-text ornament.
- **Focus:** a 1 px accent outline with a 3 px offset on every interactive element, never
  removed. Focus styling is distinct from hover styling.
- **Structure:** one `h1` per view, sequential heading order, landmark regions, skip link.
- **The switcher and portal** are the two components that must not fail: both are native
  buttons with `aria` state, keyboard traversal, and a polite live region announcing the
  active house after every change.
- **Imagery:** decorative plates are `aria-hidden`; content images carry descriptive alt
  text naming the house.
- **Motion:** every animation is gated behind `prefers-reduced-motion`.
- **Colour independence:** the active house is indicated by an indicator position *and* a
  text-weight change, not by colour alone.

---

## 9. Art direction

- **Photography:** wide, quiet, architectural. Human presence implied (an unmade bed, a
  poured glass) rather than modelled. No smiling staff, no thumbs-up guests.
- **Grade:** House I warm — amber shadows, hard sun, brass reflection. House II cool —
  desaturated greens, mist, diffuse light. The two grades must be identifiable side by side
  in thumbnail.
- **Crops:** portrait `4:5` for plates, `21:9` for full-bleed. Faces are never centred.
- **Texture:** a 3 %-opacity generated grain overlays dark grounds — it removes the flatness
  of pure CSS colour and reads as printed stock.
- **Resilience:** every media well in the concept is composed of a CSS *art plate*
  (layered gradients, vignette, grain, per-house grade) with the photograph layered on top.
  If an image is slow, blocked or missing, the composition still reads as designed — this
  is a deliberate architectural choice, not a placeholder.

---

## 10. Implementation notes

- **Content model:** one `HOUSES` object; all copy, data and imagery bind through
  `data-bind="path"` / `data-bind-img="path"` / `data-bind-alt`. Swapping brands, adding a
  third house, or moving to a CMS/API is a change of data source only.
- **Theming:** CSS custom properties on `<html data-property="a|b">`. No component knows
  which house it is rendering.
- **State:** house selection is written to a `?house=` query parameter via `replaceState`, so a
  house-specific link is shareable without filling the back stack with theme changes.
- **Performance budget:** two font families / five weights, `font-display: swap`, hero image
  eager with `fetchpriority="high"`, everything else lazy. No animation library — the whole
  interaction layer is `IntersectionObserver` plus CSS transitions.
- **Progressive enhancement:** with JavaScript disabled the portal renders as a static split
  hero with two working anchors, and all content for the default house is present in markup.

---

## 11. Deliverables

**`dual-location-concept.html`** — the design concept: a single self-contained file
implementing this brief at full strength. Sticky glass header with the persistent house
switcher, split portal hero, cross-property rail, floating booking widget, asymmetric
rooms/dining/experiences sections, the brand-story spread and the footer.

**`index.html`** — the live site, with the dual-house pattern folded in:

| Folded in | Where |
|---|---|
| House theming | Five custom properties swap on `<html data-property>`; espresso/brass becomes deep forest/champagne bronze over 1.1 s |
| Persistent switcher | Header, desktop and mobile, `role="tablist"` with arrow traversal and a polite live region |
| Split portal hero | Replaces the single home hero; hover expansion, resolve-to-full-bleed, stacked below 768 px |
| Cross-property section | Both houses side by side with weather, altitude, coordinates and signature amenity |
| House-bound details | Utility bar, contact page and footer carry each house's address, telephone and position |
| Entry sequence | The swan loading animation, then a full-screen branch gate (§6.1a) |
| Per-house rooms | Each house owns the same three room slots under its own names, rates, inventory, copy and imagery |
| Nothing shared | Venues, room cards, rates, amenities, guest reviews, telephone, email, WhatsApp, booking imagery, page title and meta description all belong to one house. The home page previews that house's **real** rooms and venues, rendered from its own records, so what is advertised is what can be booked |
| Booking | A House field synced with the switcher in both directions; the request records which house it belongs to |
| Back office | A **Managing** selector scopes requests, calendar, pricing, content and analytics to one house |

**Migration.** The admin store moves from `dx_hotel_admin_store_v1` to `_v2` on first load.
Existing rooms, experiences, rates, inventory, closed dates, discounts, complaints and
bookings become House I; House II is seeded from defaults. Nothing already saved is lost,
and the v1 record is left in place.

**Deliberately shared, because they are brand-level rather than house-level:** the branch
gate and the "two houses" comparison section show both houses by definition, and the footer
and contact page list both addresses as a directory. Everything a guest would call a
*feature* of a hotel belongs to exactly one house.

**Still single-house, by design, for a later pass:** closed dates and discount packages
apply across both houses, and the reservation desk is one inbox. Splitting those needs a
booking-rules decision from the operator, not a design one.

**One open question — the brand name.** The supplied logo reads **Divic Exclusive Hotel**
(three words). The site's wordmark and email domain read **DiviceXclusive**. The loading
sequence reproduces the logo exactly, so both spellings currently appear. Whichever is
correct, it should be the only one — say which and it becomes a one-line change.
