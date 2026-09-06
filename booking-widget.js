/**
 * Drop-in booking widget for the public Divic website.
 *
 * This is the only code your marketing site needs. It talks to three public
 * endpoints and never sees a token, a room number, or a guest record.
 *
 *   const widget = new DivicBooking({ apiUrl: "https://api.divic.ng" });
 *   widget.mount(document.getElementById("booking"));
 */

class DivicBooking {
  constructor({ apiUrl, defaultLocation = "exclusive" }) {
    this.apiUrl = apiUrl.replace(/\/$/, "");
    this.location = defaultLocation;
    this.properties = [];
  }

  async loadProperties() {
    const res = await fetch(this.apiUrl + "/api/public/properties");
    if (!res.ok) throw new Error("Could not load room information.");
    this.properties = await res.json();
    return this.properties;
  }

  /** Free-room counts and prices for a date range. Returns counts, never room numbers. */
  async checkAvailability({ location, checkIn, checkOut }) {
    const url = new URL(this.apiUrl + "/api/public/availability");
    url.searchParams.set("location", location || this.location);
    url.searchParams.set("checkIn", checkIn);
    url.searchParams.set("checkOut", checkOut);

    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Could not check availability.");
    return data;
  }

  /**
   * Lodges a booking request. No room is held — the hotel calls to confirm.
   * Say that clearly on the confirmation screen so the guest is not surprised.
   */
  async submitRequest(payload) {
    const res = await fetch(this.apiUrl + "/api/public/booking-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "We could not send your request.");
    return data;
  }

  /** Lets a guest look up their own request by reference. */
  async checkRequest(reference) {
    const res = await fetch(this.apiUrl + "/api/public/booking-requests/" + encodeURIComponent(reference));
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "No request found with that reference.");
    return data;
  }
}

// Example wiring, assuming a form with these field names.
async function handleBookingForm(form, widget) {
  const f = new FormData(form);
  const payload = {
    location: f.get("location"),
    roomType: f.get("roomType"),
    checkIn: f.get("checkIn"),
    checkOut: f.get("checkOut"),
    adults: Number(f.get("adults") || 1),
    children: Number(f.get("children") || 0),
    guestName: f.get("guestName"),
    guestPhone: f.get("guestPhone"),
    guestEmail: f.get("guestEmail"),
    specialRequests: f.get("specialRequests"),
    // Only include this if you take a deposit online. The server verifies it
    // with Paystack and rejects the request if it does not check out.
    // paystackReference: f.get("paystackReference"),
  };

  try {
    const result = await widget.submitRequest(payload);
    return {
      ok: true,
      message: result.message,
      reference: result.reference,
      total: result.quotedTotal,
      phone: result.hotelPhone,
    };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

if (typeof module !== "undefined") module.exports = { DivicBooking, handleBookingForm };
