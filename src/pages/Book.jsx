import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useProperty } from '../context/PropertyContext';
import { useNavGuard } from '../context/NavGuardContext';
import { divic, buildBookingPayload, nights as nightsBetween } from '../lib/divic-api';
import { formatNGN } from '../data/properties';
import { SectionHead } from '../components/primitives';
import PayPanel from '../components/PayPanel';

const FIELD =
  'w-full border-b border-ink/20 bg-transparent px-0 py-3 text-body text-ink ' +
  'placeholder:text-mute focus:border-[rgb(var(--accent))] focus:outline-none transition-colors duration-400';

const today = () => new Date().toISOString().slice(0, 10);

/* Two branches, so "the other one" is always well defined. */
const OTHER_BRANCH = { exclusive: 'urban', urban: 'exclusive' };

/** Room types the branch can actually take on these dates. */
const freeTypes = (availability) =>
  (availability?.roomTypes || []).filter((r) => (r.available ?? 0) > 0).map((r) => r.type);

/** null means "we could not check", which is not the same as "full". */
const isSoldOut = (row) => row?.available === 0;

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
  /* The other branch's availability for the same dates, fetched only once something
     here is full. `null` means we have not looked; a value means we have. */
  const [alt, setAlt] = useState(null);
  const [recheck, setRecheck] = useState(false);
  const [quote, setQuote] = useState(null);

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

  /* Once the guest has picked a room or started typing their details, leaving
     costs them real work. Step 1 is just a search and step 4 is already sent,
     so only steps 2 and 3 are worth warning about. */
  useNavGuard(step === 2 || step === 3, {
    title: 'Leave this booking request?',
    body: "You haven't sent your request yet. If you leave now, the room and details you've chosen will be lost.",
    confirmLabel: 'Leave this page',
    cancelLabel: 'Stay and finish',
  });

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

    /* Check the room is still free before sending anything.
     *
     * The backend does NOT refuse a request for a full room type — it takes it, sets
     * `likelyAvailable: false` and tells the guest the hotel will call with
     * alternatives. That is a reasonable thing for a hotel to do and a poor thing for a
     * website to do silently: the guest has just filled in a form for a room that is
     * gone. Availability was last read on the room step, which may have been several
     * minutes and several form fields ago, so it is read again here. */
    if (divic.configured) {
      setRecheck(true);
      try {
        const fresh = await divic.checkAvailability({
          location: form.location,
          checkIn: form.checkIn,
          checkOut: form.checkOut,
        });
        setAvailability(fresh);
        const row = fresh.roomTypes?.find((r) => r.type === form.roomType);
        if (isSoldOut(row)) {
          setRecheck(false);
          setStep(2);   // back to the rooms, where the recommendation appears
          setError(
            'That room was taken while you were filling this in. Nothing has been sent — ' +
              'here is what is still free for your dates.',
          );
          return;
        }
      } catch {
        /* If the check itself fails, do not strand the guest on a form they have
           filled: let the request through. The hotel confirms by telephone anyway. */
      } finally {
        setRecheck(false);
      }
    }

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

  /* The fee has to be on screen before the guest reaches Paystack. A total that
     grows at the last step reads as a trick even when it is small and disclosed,
     and it is the most common reason a booking is abandoned. */
  useEffect(() => {
    if (!form.roomType || !form.checkIn || !form.checkOut || !divic.configured) {
      setQuote(null);
      return;
    }
    const ac = new AbortController();
    divic
      .quote({
        location: form.location,
        roomType: form.roomType,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        signal: ac.signal,
      })
      .then(setQuote)
      .catch(() => setQuote(null));   // the estimate below still stands
    return () => ac.abort();
  }, [form.location, form.roomType, form.checkIn, form.checkOut]);

  const chosenRow = rows.find((r) => r.type === form.roomType);
  /* A recommendation only earns its place when this branch cannot help: either the room
     the guest actually wants is gone, or the whole branch is. "Some other type is full"
     is not a reason to send them across Festac while two rooms are free right here. */
  const allSoldOut = rows.length > 0 && rows.every(isSoldOut);
  const needsAlternative = allSoldOut || isSoldOut(chosenRow);

  /* If anything at this branch is full for these dates, ask the other branch the same
     question. Two branches a few minutes apart is the one advantage this hotel has over
     a single house, and a guest should not have to discover it by going back and
     re-searching. Only fires when there is something to recommend around. */
  useEffect(() => {
    const otherId = OTHER_BRANCH[form.location];
    if (!divic.configured || !needsAlternative || !otherId || stayNights < 1) {
      setAlt(null);
      return undefined;
    }
    const ac = new AbortController();
    divic
      .checkAvailability({
        location: otherId,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        signal: ac.signal,
      })
      .then((data) => setAlt({ location: otherId, availability: data }))
      .catch(() => setAlt(null));   // no recommendation is better than a wrong one
    return () => ac.abort();
  }, [needsAlternative, form.location, form.checkIn, form.checkOut, stayNights]);

  /* What the other branch could offer: the same room type where it has one free,
     otherwise whatever it does have. */
  const recommendation = useMemo(() => {
    if (!alt?.availability) return null;
    const free = freeTypes(alt.availability);
    if (free.length === 0) return null;
    const otherProperty = byId[alt.location];
    const nameFor = (type) =>
      otherProperty?.roomTypes.find((rt) => rt.type === type)?.name || type;
    const sameType = free.includes(form.roomType) ? form.roomType : null;
    return {
      location: alt.location,
      branchName: otherProperty?.displayName || alt.location,
      sameType,
      sameTypeName: sameType ? nameFor(sameType) : null,
      freeNames: free.map(nameFor),
      moveTo: sameType || free[0],
    };
  }, [alt, byId, form.roomType]);

  /* Moving branch keeps the dates and the guests, and lands on a room that is actually
     free — the point of the recommendation is that it saves the guest the search. */
  function moveToOtherBranch() {
    if (!recommendation) return;
    setError(null);
    setAvailability(alt.availability);
    setAlt(null);
    setForm((f) => ({ ...f, location: recommendation.location, roomType: recommendation.moveTo }));
  }

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
                          {p.displayName}
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
                            {/* How many rooms are free is the hotel's business, not the
                                guest's — they only need to know whether they can ask
                                for this one. */}
                            {row.available === null
                              ? 'Availability confirmed by the branch'
                              : soldOut
                                ? 'Not available on these dates'
                                : 'Available on these dates'}
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

                {recommendation && (
                  <div className="mt-8 border-l-2 py-4 pl-5" style={{ borderColor: 'rgb(var(--accent))' }}>
                    <p className="font-display text-lg">
                      {recommendation.sameTypeName
                        ? `${recommendation.branchName} has a ${recommendation.sameTypeName} free`
                        : `${recommendation.branchName} has rooms free`}
                    </p>
                    <p className="prose-body mt-2 text-sm">
                      {recommendation.sameTypeName
                        ? 'Same dates, same room, a few minutes away in Festac.'
                        : `Same dates, a few minutes away in Festac — ${recommendation.freeNames.join(', ')}.`}
                    </p>
                    <button type="button" onClick={moveToOtherBranch} className="btn btn-solid mt-5">
                      See {recommendation.branchName}
                    </button>
                  </div>
                )}

                <div className="mt-9 flex flex-wrap gap-4">
                  <button type="button" onClick={() => setStep(1)} className="btn btn-outline">
                    Back
                  </button>
                  <button
                    type="button"
                    /* A room type can arrive pre-selected from a property page link
                       (`/book?roomType=crown`), which never consulted availability — so
                       the sold-out state is checked here, not just on the row. */
                    disabled={!form.roomType || isSoldOut(chosenRow)}
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
                    <span className="text-sm text-mute">Email</span>
                    <input
                      type="email"
                      value={form.guestEmail}
                      onChange={set('guestEmail')}
                      required
                      className={FIELD}
                    />
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
                  <button
                    type="submit"
                    disabled={busy || recheck}
                    className="btn btn-solid disabled:opacity-50"
                  >
                    {recheck ? 'Checking the room…' : busy ? 'Sending…' : 'Send request'}
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

                  <PayPanel
                    reference={confirmation.reference}
                    quote={quote}
                    hotelPhone={confirmation.hotelPhone}
                    bankTransfer={property?.bankTransfer}
                  />

                  {confirmation.hotelPhone && (
                    <a href={`tel:${confirmation.hotelPhone}`} className="btn btn-outline mt-6">
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
                <div className="mt-5 border-t border-ink/15 pt-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm text-mute">Room</span>
                    <span className="text-sm">
                      {formatNGN(quote ? quote.roomTotal : chosenRow.total || chosenRow.rate * stayNights)}
                    </span>
                  </div>
                  {quote && quote.paystackFee > 0 && (
                    <div className="mt-3 flex items-baseline justify-between gap-4">
                      <span className="text-sm text-mute">Card fee, if you pay online</span>
                      <span className="text-sm">{formatNGN(quote.paystackFee)}</span>
                    </div>
                  )}
                  <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-ink/10 pt-4">
                    <span className="text-sm text-mute">{quote ? 'Total by card' : 'Estimate'}</span>
                    <span className="font-display text-2xl" style={{ color: 'rgb(var(--accent))' }}>
                      {formatNGN(quote ? quote.totalPayable : chosenRow.total || chosenRow.rate * stayNights)}
                    </span>
                  </div>
                </div>
              )}

              <p className="mt-6 text-sm text-slate">
                Prices come from the hotel, not from your browser. Paying at the desk by
                cash or transfer carries no card fee.
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
