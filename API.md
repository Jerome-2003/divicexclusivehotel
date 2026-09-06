# Public API — for the Divic website

Three endpoints, no authentication. This is everything the marketing site can
reach. It cannot create a booking, read a guest record, see room numbers, or
touch anything else.

Base URL: `https://your-api.onrender.com`

---

## 1. Property and room information

```
GET /api/public/properties
```

Response:

```json
[
  {
    "id": "exclusive",
    "name": "Divic Exclusive",
    "address": "Plot 55, 1st Avenue, E Close, Festac, Lagos",
    "phone": "09169845311",
    "totalRooms": 15,
    "currency": "NGN",
    "roomTypes": [
      { "type": "standard", "rate": 40000, "roomCount": 6, "floors": [0] },
      { "type": "deluxe",   "rate": 45000, "roomCount": 5, "floors": [1] },
      { "type": "superior", "rate": 50000, "roomCount": 4, "floors": [1] }
    ]
  },
  {
    "id": "urban",
    "name": "Divic Urban",
    "address": "Plot 340, 3rd Avenue, A1 Close, Festac, Lagos",
    "phone": "09169845314",
    "totalRooms": 21,
    "currency": "NGN",
    "roomTypes": [
      { "type": "classic",  "rate": 50000, "roomCount": 5, "floors": [0, 1] },
      { "type": "deluxe",   "rate": 55000, "roomCount": 6, "floors": [0, 1, 2] },
      { "type": "superior", "rate": 60000, "roomCount": 4, "floors": [0, 1, 2] },
      { "type": "crown",    "rate": 65000, "roomCount": 6, "floors": [1, 2] }
    ]
  }
]
```

Rates come from the live database, so when the manager changes a price in the
PMS the website updates on its own. Do not hardcode prices on the site.

---

## 2. Availability for a date range

```
GET /api/public/availability?location=urban&checkIn=2026-09-20&checkOut=2026-09-23
```

Response:

```json
{
  "location": "urban",
  "checkIn": "2026-09-20",
  "checkOut": "2026-09-23",
  "nights": 3,
  "currency": "NGN",
  "roomTypes": [
    { "type": "classic",  "available": 2, "rate": 50000, "total": 150000 },
    { "type": "deluxe",   "available": 0, "rate": 55000, "total": 165000 },
    { "type": "superior", "available": 3, "rate": 60000, "total": 180000 },
    { "type": "crown",    "available": 1, "rate": 65000, "total": 195000 }
  ]
}
```

Counts only — never room numbers. Publishing "room 204 is empty on the 20th"
to the open web tells a stranger exactly which room is unoccupied.

---

## 3. Lodge a booking request

```
POST /api/public/booking-requests
Content-Type: application/json
```

Request body:

| Field | Type | Required | Notes |
|---|---|---|---|
| `location` | string | yes | `"exclusive"` or `"urban"` |
| `roomType` | string | yes | must exist at that property |
| `checkIn` | string | yes | `YYYY-MM-DD`, not in the past |
| `checkOut` | string | yes | after `checkIn`, max 60 nights |
| `adults` | number | no | 1–6, defaults to 1 |
| `children` | number | no | 0–6, defaults to 0 |
| `guestName` | string | yes | 2–120 characters |
| `guestPhone` | string | yes | 7–20 characters |
| `guestEmail` | string | no | |
| `specialRequests` | string | no | max 500 characters |
| `paystackReference` | string | no | only if you take a deposit online |

Note there is no `total` field. **The price is recalculated server-side.** A
total sent from a browser is never trusted — otherwise anyone could book a
crown suite for one naira by editing the request in dev tools.

Success — `201`:

```json
{
  "reference": "WEB-2K4F9A",
  "status": "pending",
  "location": "Divic Urban",
  "roomType": "crown",
  "checkIn": "2026-09-20",
  "checkOut": "2026-09-23",
  "nights": 3,
  "quotedRate": 65000,
  "quotedTotal": 195000,
  "currency": "NGN",
  "likelyAvailable": true,
  "message": "Your request has been received. The hotel will call you to confirm and hold your room.",
  "hotelPhone": "09169845314"
}
```

Show `message` to the guest word for word. **No room is held yet.** A request
that silently implied a confirmed booking would be the fastest way to have an
angry guest arrive at midnight to a full hotel.

Errors:

| Code | Meaning |
|---|---|
| `400` | Bad dates, missing name or phone, unknown room type |
| `402` | A `paystackReference` was sent but Paystack would not confirm it |
| `429` | More than 10 requests an hour from one connection |

---

## 4. Guest checks their own request

```
GET /api/public/booking-requests/WEB-2K4F9A
```

Returns status only — `pending`, `accepted`, `declined` or `expired`. Useful
for a "check my booking" page.

---

## What happens next

The request lands on the **Website requests** screen in the PMS. A receptionist
sees it, sees whether a room of that type is actually free, and accepts or
declines. Accepting assigns a real room and creates the booking.

That gap is deliberate. If the website wrote straight into the room inventory,
a stranger and a walk-in at the desk could take the same room seconds apart.

---

## CORS

Set `WEBSITE_ORIGIN` in the backend environment to your website's exact origin
(for example `https://divicexclusive.com`). Requests from anywhere else are
refused.
