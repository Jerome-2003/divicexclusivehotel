/**
 * Divic public API client.
 *
 * Adapted from the supplied `booking-widget.js` — the DivicBooking class, its four
 * methods and their contracts are kept as they were. What changed:
 *
 *   · ES module instead of a global + CommonJS export
 *   · base URL from VITE_DIVIC_API_URL, so the deployed origin is configuration
 *   · AbortSignal support, so React can cancel in-flight requests on unmount
 *   · errors carry the HTTP status, so the UI can tell 429 from 400 (see API.md)
 *   · handleBookingForm's payload assembly kept as buildBookingPayload
 *
 * Everything the backend owns stays the backend's: no total is ever sent (the server
 * recalculates and does not trust a browser), no room numbers are ever requested, and a
 * successful request is a REQUEST — no room is held until the hotel confirms.
 */

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/** Turns a failed response into a message the guest can act on. */
function messageForStatus(status, fromServer) {
  if (fromServer) return fromServer;
  switch (status) {
    case 400:
      return 'Please check the dates, your name and your phone number, then try again.';
    case 402:
      return 'That payment reference could not be confirmed. Please try again or call the hotel.';
    case 429:
      return 'That is a lot of requests from this connection. Please wait a few minutes and try again.';
    default:
      return 'Something went wrong at our end. Please try again, or call the hotel directly.';
  }
}

export class DivicBooking {
  constructor({ apiUrl, defaultLocation = 'exclusive' } = {}) {
    this.apiUrl = String(apiUrl || '').replace(/\/$/, '');
    this.location = defaultLocation;
    this.properties = [];
  }

  get configured() {
    return Boolean(this.apiUrl);
  }

  async #json(url, init = {}) {
    if (!this.configured) throw new ApiError('The booking service is not configured.', 0);
    let res;
    try {
      res = await fetch(url, init);
    } catch {
      throw new ApiError('We could not reach the booking service. Please check your connection.', 0);
    }
    let data = null;
    try {
      data = await res.json();
    } catch {
      /* an empty or non-JSON body is handled below */
    }
    if (!res.ok) throw new ApiError(messageForStatus(res.status, data?.error), res.status);
    return data;
  }

  async loadProperties({ signal } = {}) {
    this.properties = await this.#json(this.apiUrl + '/api/public/properties', { signal });
    return this.properties;
  }

  /** Free-room counts and prices for a date range. Counts, never room numbers. */
  async checkAvailability({ location, checkIn, checkOut, signal } = {}) {
    const url = new URL(this.apiUrl + '/api/public/availability');
    url.searchParams.set('location', location || this.location);
    url.searchParams.set('checkIn', checkIn);
    url.searchParams.set('checkOut', checkOut);
    return this.#json(url, { signal });
  }

  /**
   * Lodges a booking request. No room is held — the hotel calls to confirm.
   * The confirmation screen must say so plainly.
   */
  async submitRequest(payload, { signal } = {}) {
    return this.#json(this.apiUrl + '/api/public/booking-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal,
    });
  }

  /**
   * What the guest will actually pay: room total, card fee and grand total, as
   * three separate numbers.
   *
   * The fee is never calculated here. A price the browser works out is a price
   * the browser can edit, and the server recomputes it at checkout regardless —
   * so a local guess could only ever disagree with the real charge.
   */
  async quote({ location, roomType, checkIn, checkOut, signal } = {}) {
    const url = new URL(this.apiUrl + '/api/public/quote');
    url.searchParams.set('location', location || this.location);
    url.searchParams.set('roomType', roomType);
    url.searchParams.set('checkIn', checkIn);
    url.searchParams.set('checkOut', checkOut);
    return this.#json(url, { signal });
  }

  /**
   * Starts Paystack checkout for a request that already exists.
   *
   * Note what is not sent: an amount. The server recomputes it from the stored
   * request, so there is nothing here for anyone to tamper with.
   */
  async startPayment(reference, { signal } = {}) {
    return this.#json(
      this.apiUrl + '/api/public/booking-requests/' + encodeURIComponent(reference) + '/pay',
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, signal },
    );
  }

  /**
   * Where the payment stands. Called after the guest returns from Paystack —
   * landing back on the site proves nothing about whether money moved, so the
   * server re-verifies with Paystack before answering.
   */
  async paymentStatus(reference, { signal } = {}) {
    return this.#json(
      this.apiUrl + '/api/public/booking-requests/' + encodeURIComponent(reference) + '/payment-status',
      { signal },
    );
  }

  /** Promos and popups the hotel publishes from its own software. */
  async content({ location, signal } = {}) {
    const url = new URL(this.apiUrl + '/api/public/content');
    if (location) url.searchParams.set('location', location);
    return this.#json(url, { signal });
  }

  /** The curated FAQ. Answers most questions with no assistant call at all. */
  async faq({ location, signal } = {}) {
    const url = new URL(this.apiUrl + '/api/public/faq');
    if (location) url.searchParams.set('location', location);
    return this.#json(url, { signal });
  }

  /** The assistant, for questions the curated list does not cover. */
  async askFaq({ question, location, signal } = {}) {
    return this.#json(this.apiUrl + '/api/public/faq/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, location }),
      signal,
    });
  }

  /** Lets a guest look up their own request by reference. */
  async checkRequest(reference, { signal } = {}) {
    return this.#json(
      this.apiUrl + '/api/public/booking-requests/' + encodeURIComponent(reference),
      { signal },
    );
  }
}

/**
 * Assembles the POST body. Kept from the widget's handleBookingForm.
 *
 * Note what is absent: `total`. The server recalculates the price and never trusts a
 * figure from the browser. Optional fields are omitted rather than sent empty.
 */
export function buildBookingPayload(form) {
  const payload = {
    location: form.location,
    roomType: form.roomType,
    checkIn: form.checkIn,
    checkOut: form.checkOut,
    adults: Number(form.adults || 1),
    children: Number(form.children || 0),
    guestName: (form.guestName || '').trim(),
    guestPhone: (form.guestPhone || '').trim(),
  };
  const email = (form.guestEmail || '').trim();
  if (email) payload.guestEmail = email;

  /* The ID number rides in with the notes.
     API.md's request body has no field for it, and sending one it does not list risks a
     400 from a strict validator — so it goes in as a labelled first line of
     `specialRequests`, where the receptionist reading the request will see it. If a
     `guestId` field is ever added to the PMS, move it there and delete this. */
  const id = (form.guestId || '').trim();
  const notes = (form.specialRequests || '').trim();
  const combined = [id && `ID: ${id}`, notes].filter(Boolean).join('\n');
  if (combined) payload.specialRequests = combined.slice(0, 500);
  // paystackReference is only included when a deposit is taken online; the server
  // verifies it with Paystack and rejects the request if it does not check out.
  if (form.paystackReference) payload.paystackReference = form.paystackReference;
  return payload;
}

/** The single client the app uses. Origin comes from the environment. */
export const divic = new DivicBooking({
  apiUrl: import.meta.env?.VITE_DIVIC_API_URL || '',
});

/**
 * A `mediaUrl` published from the PMS is one of two shapes: a full `https://`
 * link someone pasted in, or a `/uploads/...` path from a file the receptionist
 * uploaded from their device — a path on the *API's* origin, not this site's.
 * Rendered as-is, that path resolves against whatever origin this site is
 * deployed on instead and 404s — a broken-image icon where the promo photo
 * should be. Only the second case needs the API origin stitched back on; a
 * pasted https:// URL is already absolute and passes through unchanged.
 */
export function resolveMediaUrl(url) {
  if (!url) return url;
  if (/^https:\/\//i.test(url)) return url;
  return divic.apiUrl + (url.startsWith('/') ? url : '/' + url);
}

export const nights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut) - new Date(checkIn);
  return ms > 0 ? Math.round(ms / 86400000) : 0;
};
