import { useState } from 'react';
import { divic } from '../lib/divic-api';
import { SectionHead } from '../components/primitives';

const FIELD =
  'w-full border-b border-ink/20 bg-transparent px-0 py-3 text-body text-ink uppercase ' +
  'tracking-[0.12em] placeholder:text-mute placeholder:normal-case placeholder:tracking-normal ' +
  'focus:border-[rgb(var(--accent))] focus:outline-none transition-colors duration-400';

const WORDING = {
  pending: 'The house has your request and has not answered it yet. They will call to confirm.',
  accepted: 'Accepted. A room has been assigned and your booking is made.',
  declined: 'Declined — the house could not take these dates. Please call them to find another.',
  expired: 'This request expired before it was answered. Please send a new one.',
};

/** Guests look up their own request by reference (GET /api/public/booking-requests/:ref). */
export default function BookingStatus() {
  const [reference, setReference] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function lookUp(e) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setBusy(true);
    try {
      setResult(await divic.checkRequest(reference.trim()));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="shell pb-section pt-40">
      <div className="max-w-xl">
        <SectionHead
          eyebrow="Reservations"
          title="Check a request"
          lead="Enter the reference you were given when you sent your request."
        />

        <form onSubmit={lookUp} className="mt-10">
          <label className="flex flex-col gap-1">
            <span className="text-micro uppercase text-mute">Reference</span>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="WEB-2K4F9A"
              required
              className={FIELD}
            />
          </label>
          <button type="submit" disabled={busy} className="btn btn-solid mt-8 disabled:opacity-50">
            {busy ? 'Checking…' : 'Check status'}
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-8 border-l-2 border-[#B4543A] py-2 pl-4 text-sm text-[#8A3D28]">
            {error}
          </p>
        )}

        {result && (
          <div className="mt-10 border border-ink/10 bg-chalk p-8">
            <p className="eyebrow">{result.reference || reference.toUpperCase()}</p>
            <p className="mt-4 font-display text-d3 capitalize">{result.status}</p>
            <p className="prose-body mt-3">{WORDING[result.status] || result.message || ''}</p>
          </div>
        )}
      </div>
    </section>
  );
}
