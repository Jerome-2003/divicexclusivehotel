import { useState } from 'react';
import { BRAND, PROPERTY_LIST, PROPERTIES } from '../data/properties';
import { Reveal, SectionHead, SpecList } from '../components/primitives';

const FIELD =
  'w-full border-b border-ink/20 bg-transparent px-0 py-3 text-body text-ink ' +
  'placeholder:text-mute focus:border-[rgb(var(--accent))] focus:outline-none transition-colors duration-400';

/**
 * Stay enquiry — front end only.
 *
 * This is deliberately an ENQUIRY, not a reservation: it collects intent and hands it to
 * the desk. It is not wired to the PMS and does not hold inventory or quote a rate. When
 * the booking contract lands (API.md), this becomes the first step of the real flow —
 * the field names below are chosen to line up with a reservation payload.
 */
function EnquiryForm() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    propertyId: 'exclusive',
    arrival: '',
    departure: '',
    adults: '2',
    roomTypeId: '',
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const property = PROPERTIES[form.propertyId];
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    // No network call by design — the PMS contract is not settled yet.
    setSent(true);
  };

  if (sent) {
    return (
      <div className="border border-ink/10 bg-chalk p-8 lg:p-12">
        <p className="eyebrow">Enquiry received</p>
        <h3 className="mt-4 font-display text-d3">Thank you, {form.name.split(' ')[0] || 'and welcome'}.</h3>
        <p className="prose-body mt-4">
          The desk at {property.name} will reply within the hour, or first thing tomorrow if
          you have written to us overnight. Nothing is held or charged yet — we will confirm
          availability and the exact rate with you directly.
        </p>
        <button type="button" onClick={() => setSent(false)} className="link-quiet mt-8">
          Send another enquiry &rarr;
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="border border-ink/10 bg-chalk p-8 lg:p-12">
      <p className="eyebrow">Enquire</p>
      <h3 className="mt-4 font-display text-d3">Ask about a stay</h3>
      <p className="prose-body mt-3 text-sm">
        We will confirm availability and rate by reply. Nothing is held or charged here.
      </p>

      <div className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-micro uppercase text-mute">Which house</span>
          <select value={form.propertyId} onChange={set('propertyId')} className={FIELD}>
            {PROPERTY_LIST.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.roomCount} rooms
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-micro uppercase text-mute">Arrival</span>
          <input type="date" value={form.arrival} onChange={set('arrival')} required className={FIELD} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-micro uppercase text-mute">Departure</span>
          <input
            type="date"
            value={form.departure}
            onChange={set('departure')}
            min={form.arrival || undefined}
            required
            className={FIELD}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-micro uppercase text-mute">Guests</span>
          <select value={form.adults} onChange={set('adults')} className={FIELD}>
            {['1', '2', '3', '4'].map((n) => (
              <option key={n} value={n}>
                {n} {n === '1' ? 'guest' : 'guests'}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-micro uppercase text-mute">Room type</span>
          <select value={form.roomTypeId} onChange={set('roomTypeId')} className={FIELD}>
            <option value="">No preference</option>
            {property.roomTypes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-micro uppercase text-mute">Your name</span>
          <input type="text" value={form.name} onChange={set('name')} required className={FIELD} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-micro uppercase text-mute">Email</span>
          <input type="email" value={form.email} onChange={set('email')} required className={FIELD} />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-micro uppercase text-mute">Telephone</span>
          <input type="tel" value={form.phone} onChange={set('phone')} className={FIELD} />
        </label>

        <label className="flex flex-col gap-1 sm:col-span-2">
          <span className="text-micro uppercase text-mute">Anything we should know</span>
          <textarea rows={3} value={form.notes} onChange={set('notes')} className={`${FIELD} resize-none`} />
        </label>
      </div>

      <button type="submit" className="btn btn-solid mt-10 w-full sm:w-auto">
        Send enquiry
      </button>
    </form>
  );
}

export default function Contact() {
  return (
    <>
      <section className="shell pb-8 pt-40">
        <SectionHead
          eyebrow="Contact"
          title={
            <>
              Two houses,
              <br />a few minutes apart.
            </>
          }
          lead="Each house keeps its own desk. Write to the one you want to stay at, or to us, and we will point you the right way."
        />
      </section>

      <section className="shell pb-section pt-12">
        <div className="grid gap-14 lg:grid-cols-12">
          {/* directory */}
          <div className="flex flex-col gap-12 lg:col-span-5">
            {PROPERTY_LIST.map((p, i) => {
              const accentVars =
                p.id === 'urban'
                  ? { '--accent': '180 84 58', '--accent-deep': '138 61 40' }
                  : { '--accent': '91 86 56', '--accent-deep': '62 58 36' };
              return (
                <Reveal key={p.id} delay={i * 80}>
                  <div style={accentVars}>
                    <p className="eyebrow">{p.name}</p>
                    <p className="mt-3 font-display text-d3">{p.character}</p>
                    <SpecList
                      className="mt-6"
                      items={[
                        { label: 'Address', value: p.address },
                        { label: 'Telephone', value: p.phone },
                        { label: 'Email', value: p.email },
                        { label: 'Rooms', value: String(p.roomCount) },
                        { label: 'Position', value: p.coords },
                      ]}
                    />
                    <div className="mt-6 flex flex-wrap gap-6">
                      <a href={p.mapUrl} target="_blank" rel="noopener noreferrer" className="link-quiet">
                        Directions &rarr;
                      </a>
                      <a href={p.whatsapp} target="_blank" rel="noopener noreferrer" className="link-quiet">
                        WhatsApp &rarr;
                      </a>
                    </div>
                  </div>
                </Reveal>
              );
            })}

            <div className="border-t border-ink/10 pt-8">
              <p className="text-micro uppercase text-mute">General enquiries</p>
              <a href={`mailto:${BRAND.email}`} className="mt-2 block font-display text-lg hover:underline">
                {BRAND.email}
              </a>
              <a href={`tel:${BRAND.phone.replace(/\s/g, '')}`} className="mt-1 block text-sm text-slate hover:text-ink">
                {BRAND.phone}
              </a>
            </div>
          </div>

          {/* enquiry */}
          <div className="lg:col-span-6 lg:col-start-7">
            <EnquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
