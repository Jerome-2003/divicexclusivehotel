import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProperty } from '../context/PropertyContext';
import { divic, buildBookingPayload, nights as nightsBetween } from '../lib/divic-api';
import { formatNGN } from '../data/properties';
import { SectionHead } from '../components/primitives';

const FIELD =
  'w-full border-b border-ink/20 bg-transparent px-0 py-3 text-body text-ink ' +
  'placeholder:text-mute focus:border-[rgb(var(--accent))] focus:outline-none transition-colors duration-400';

const today = () => new Date().toISOString().slice(0, 10);

/* ---------- step rail ---------- */
function Steps({ step }) {
  const labels = ['Dates', 'Room', 'Details', 'Confirmation'];
  return (
    <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
      {labels.map((label, i) => {
        const n = i + 1;
        const state = n < step ? 'done' : n === step ? 'current' : 'todo';
        return (
          <li key={label} className="flex items-center gap-3">
            <span
              className={`text-sm ${
                state === 'todo' ? 'text-mute' : state === 'current' ? 'font-semibold' : ''
              }`}
              style={state === 'current' ? { color: 'rgb(var(--accent))' } : undefined}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              {n}. {label}
            </span>
            {i < labels.length - 1 && <span aria-hidden="true" className="h-px w-6 bg-ink/20" />}
          </li>
        );
      })}
    </ol>
  );
}

function Notice({ children, tone = 'info' }) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={`border-l-2 py-2 pl-4 text-sm ${
        tone === 'error' ? 'border-[#B4543A] text-[#8C3A1E]' : 'border-ink/25 text-slate'
      }`}
    >
      {children}
    </p>
  );
}

export default function Book() {
  const { properties, byId, propertyId, choose } = useProperty();
  const [params] = useSearchParams();

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  /* The homepage search hands over location, dates and guests. Arriving with a complete
     set means the guest has already answered step one, so we open on the room step. */
  const [form, setForm] = useState({
    location: params.get('location') || propertyId || 'exclusive',
    roomType: params.get('roomType') || '',
    checkIn: params.get('checkIn') || '',
    checkOut: params.get('checkOut') || '',
    adults: params.get('adults') || '2',
    children: params.get('children') || '0',
    guestName: '',
    guestPhone: '',
    guestEmail: '',
    guestId: '',
    specialRequests: '',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const property = byId[form.location];
  const stayNights = nightsBetween(form.checkIn, form.checkOut);

  useEffect(() => {
    document.title = 'Request a stay — Divic';
  }, []);

  /* Arriving from the homepage search with dates already chosen: skip straight to the
     room step and fetch availability, rather than showing a form that is already filled. */
  const [handedOver] = useState(
    () => Boolean(params.get('checkIn') && params.get('checkOut')),
  );
  useEffect(() => {
    if (!handedOver) return;
    setStep(2);
    if (!divic.configured) return;
    setBusy(true);
    divic
      .checkAvailability({
        location: params.get('location') || 'exclusive',
        checkIn: params.get('checkIn'),
        checkOut: params.get('checkOut'),
      })
      .then(setAvailability)
      .catch((err) => setError(err.message))
      .finally(() => setBusy(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handedOver]);

  // keep the page's accent in step with the house being booked
  useEffect(() => {
    if (form.location !== propertyId) choose(form.location);
  }, [form.location, propertyId, choose]);

  /* Availability rows, live where the API answered. Without a configured API we show
     the property's own room types and say plainly that we could not check. */
  const rows = useMemo(() => {
    if (availability?.roomTypes?.length) {
      return availability.roomTypes.map((row) => ({
        ...row,
        ...(property?.roomTypes.find((rt) => rt.type === row.type) || {}),
        ...row,
        name: property?.roomTypes.find((rt) => rt.type === row.type)?.name || row.type,
      }));
    }
    return (property?.roomTypes || []).map((rt) => ({
      type: rt.type,
      name: rt.name,
      rate: rt.rate,
      available: null,
      total: stayNights ? rt.rate * stayNights : null,
    }));
  }, [availability, property, stayNights]);

  async function goToRooms(e) {
    e.preventDefault();
    setError(null);
    if (stayNights < 1) {
      setError('Please choose a departure date after your arrival date.');
      return;
    }
    if (stayNights > 60) {
      setError('Stays are limited to 60 nights. Please call the hotel for anything longer.');
      return;
    }
    setStep(2);
    if (!divic.configured) return;
    setBusy(true);
    try {
      const data = await divic.checkAvailability({
        location: form.location,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
      });
      setAvailability(data);
    } catch (err) {
      setAvailability(null);
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await divic.submitRequest(buildBookingPayload(form));
      setConfirmation(result);
      setStep(4);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const chosenRow = rows.find((r) => r.type === form.roomType);

  return (
    <>
      <section className="shell pb-10 pt-40">
        <SectionHead
          title="Request a stay"
          lead="Choose your dates and room, and the house will call you to confirm and hold it. Nothing is charged here."
        />
        <div className="mt-10">
          <Steps step={step} />
        </div>
      </section>

      <section className="shell pb-section">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {/* ---------- 1. dates ---------- */}
            {step === 1 && (
              <form onSubmit={goToRooms} className="border border-ink/10 bg-shell p-8 lg:p-10">
                <h2 className="font-display text-d3">When, and which branch</h2>
                <div className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 sm:col-span-2">
                    <span className="text-sm text-mute">Branch</span>
                    <select value={form.location} onChange={set('location')} className={FIELD}>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.displayName} — {p.totalRooms} rooms
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-mute">Arrival</span>
                    <input type="date" min={today()} value={form.checkIn} onChange={set('checkIn')} required className={FIELD} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-mute">Departure</span>
                    <input type="date" min={form.checkIn || today()} value={form.checkOut} onChange={set('checkOut')} required className={FIELD} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-mute">Adults</span>
                    <select value={form.adults} onChange={set('adults')} className={FIELD}>
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-mute">Children</span>
                    <select value={form.children} onChange={set('children')} className={FIELD}>
                      {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                </div>
                {error && <div className="mt-6"><Notice tone="error">{error}</Notice></div>}
                <button type="submit" className="btn btn-solid mt-9 w-full sm:w-auto">
                  See rooms
                </button>
              </form>
            )}

            {/* ---------- 2. room ---------- */}
            {step === 2 && (
              <div className="border border-ink/10 bg-shell p-8 lg:p-10">
                <h2 className="font-display text-d3">Choose a room</h2>
                <p className="prose-body mt-2 text-sm">
                  {stayNights} {stayNights === 1 ? 'night' : 'nights'} at {property?.displayName}.
                </p>

                {busy && <p className="mt-6 text-sm text-slate">Checking availability…</p>}
                {!busy && !divic.configured && (
                  <div className="mt-6">
                    <Notice>
                      We could not check live availability, so these are published rates. The
                      house will confirm what is free when they call.
                    </Notice>
                  </div>
                )}
                {!busy && error && <div className="mt-6"><Notice tone="error">{error}</Notice></div>}

                <div className="mt-8 flex flex-col">
                  {rows.map((row) => {
                    const soldOut = row.available === 0;
                    const selected = form.roomType === row.type;
                    return (
                      <button
                        key={row.type}
                        type="button"
                        disabled={soldOut}
                        onClick={() => setForm((f) => ({ ...f, roomType: row.type }))}
                        aria-pressed={selected}
                        className={`flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-ink/10 py-5 text-left transition-colors duration-400 ${
                          soldOut ? 'cursor-not-allowed opacity-40' : 'hover:bg-ink/[0.05]'
                        }`}
                        style={selected ? { borderTopColor: 'rgb(var(--accent))' } : undefined}
                      >
                        <span className="flex flex-col gap-1">
                          <span className="font-display text-lg" style={selected ? { color: 'rgb(var(--accent))' } : undefined}>
                            {row.name}
                          </span>
                          <span className="text-sm text-mute">
                            {row.available === null
                              ? 'Availability confirmed by the house'
                              : soldOut
                                ? 'None free on these dates'
                                : `${row.available} free on these dates`}
                          </span>
                        </span>
                        <span className="flex flex-col items-end gap-1">
                          <span className="font-display text-xl">{formatNGN(row.total || row.rate * stayNights)}</span>
                          <span className="text-sm text-mute">
                            {formatNGN(row.rate)} × {stayNights}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-9 flex flex-wrap gap-4">
                  <button type="button" onClick={() => setStep(1)} className="btn btn-outline">
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!form.roomType}
                    onClick={() => { setError(null); setStep(3); }}
                    className="btn btn-solid disabled:opacity-40"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* ---------- 3. details ---------- */}
            {step === 3 && (
              <form onSubmit={submit} className="border border-ink/10 bg-shell p-8 lg:p-10">
                <h2 className="font-display text-d3">Your details</h2>
                <p className="prose-body mt-2 text-sm">
                  The house calls to confirm, so a phone number that reaches you matters most.
                </p>
                <div className="mt-8 grid gap-x-8 gap-y-7 sm:grid-cols-2">
                  <label className="flex flex-col gap-1 sm:col-span-2">
                    <span className="text-sm text-mute">Full name</span>
                    <input type="text" minLength={2} maxLength={120} value={form.guestName} onChange={set('guestName')} required className={FIELD} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-mute">Telephone</span>
                    <input type="tel" minLength={7} maxLength={20} value={form.guestPhone} onChange={set('guestPhone')} required className={FIELD} />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-sm text-mute">Email (optional)</span>
                    <input type="email" value={form.guestEmail} onChange={set('guestEmail')} className={FIELD} />
                  </label>
                  <label className="flex flex-col gap-1 sm:col-span-2">
                    <span className="text-sm text-mute">ID number (optional)</span>
                    <input
                      type="text"
                      maxLength={40}
                      value={form.guestId}
                      onChange={set('guestId')}
                      className={FIELD}
                      aria-describedby="id-help"
                    />
                    <span id="id-help" className="mt-1 text-sm text-mute">
                      Passport, driver&rsquo;s licence or NIN. Giving it now saves time at the
                      desk; you can leave it blank and bring the ID with you.
                    </span>
                  </label>
                  <label className="flex flex-col gap-1 sm:col-span-2">
                    <span className="text-sm text-mute">
                      Anything we should know (optional)
                    </span>
                    <textarea rows={3} maxLength={500} value={form.specialRequests} onChange={set('specialRequests')} className={`${FIELD} resize-none`} />
                  </label>
                </div>
                {error && <div className="mt-6"><Notice tone="error">{error}</Notice></div>}
                <div className="mt-9 flex flex-wrap gap-4">
                  <button type="button" onClick={() => setStep(2)} className="btn btn-outline">
                    Back
                  </button>
                  <button type="submit" disabled={busy} className="btn btn-solid disabled:opacity-50">
                    {busy ? 'Sending…' : 'Send request'}
                  </button>
                </div>
              </form>
            )}

            {/* ---------- 4. confirmation ---------- */}
            {step === 4 && confirmation && (
                <div className="border border-ink/10 bg-shell p-8 lg:p-10">
                  <p className="eyebrow">Request {confirmation.reference}</p>
                  <h2 className="mt-4 font-display text-d3">No room is held yet</h2>

                  {/* API.md: show `message` to the guest word for word. */}
                  <p className="prose-body mt-4">{confirmation.message}</p>

                  <dl className="mt-8 flex flex-col">
                    {[
                      ['House', confirmation.location],
                      ['Room', confirmation.roomType],
                      ['Arrival', confirmation.checkIn],
                      ['Departure', confirmation.checkOut],
                      ['Nights', String(confirmation.nights)],
                      ['Quoted rate', formatNGN(confirmation.quotedRate)],
                      ['Quoted total', formatNGN(confirmation.quotedTotal)],
                      ['Status', confirmation.status],
                    ].map(([k, v]) => (
                      <div key={k} className="flex items-baseline justify-between gap-6 border-t border-ink/10 py-3">
                        <dt className="text-sm text-mute">{k}</dt>
                        <dd className="text-right text-sm">{v}</dd>
                      </div>
                    ))}
                  </dl>

                  {confirmation.hotelPhone && (
                    <a href={`tel:${confirmation.hotelPhone}`} className="btn btn-solid mt-8">
                      Call {confirmation.hotelPhone}
                    </a>
                  )}
                </div>
            )}
          </div>

          {/* ---------- running summary ---------- */}
          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="sticky top-28 border-t border-ink/15 pt-6">
              <p className="eyebrow">Your request</p>
              <dl className="mt-5 flex flex-col">
                {[
                  ['Branch', property?.displayName || '—'],
                  ['Arrival', form.checkIn || '—'],
                  ['Departure', form.checkOut || '—'],
                  ['Nights', stayNights ? String(stayNights) : '—'],
                  ['Guests', `${form.adults} adult${form.adults === '1' ? '' : 's'}${Number(form.children) ? `, ${form.children} children` : ''}`],
                  ['Room', chosenRow?.name || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-6 border-t border-ink/10 py-3">
                    <dt className="text-sm text-mute">{k}</dt>
                    <dd className="text-right text-sm">{v}</dd>
                  </div>
                ))}
              </dl>

              {chosenRow && stayNights > 0 && (
                <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-ink/15 pt-5">
                  <span className="text-sm text-mute">Estimate</span>
                  <span className="font-display text-2xl" style={{ color: 'rgb(var(--accent))' }}>
                    {formatNGN(chosenRow.total || chosenRow.rate * stayNights)}
                  </span>
                </div>
              )}

              <p className="mt-6 text-sm text-slate">
                The final price is calculated by the hotel, not in your browser. You will not
                be charged on this site.
              </p>
              {property?.phone && (
                <p className="mt-4 text-sm text-slate">
                  Prefer to speak to someone?{' '}
                  <a href={`tel:${property.phone}`} className="underline underline-offset-4">
                    {property.phone}
                  </a>
                </p>
              )}
              <Link to="/booking-status" className="link-quiet mt-6">
                Check an existing request
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
