import { useEffect, useRef, useState } from 'react';
import { divic } from '../lib/divic-api';
import { formatNGN } from '../data/properties';

/**
 * Payment, offered once a request exists.
 *
 * Two paths on purpose. Plenty of guests here would rather transfer or pay at
 * the desk than put a card into a website, and forcing card-only would lose
 * those bookings outright. Paying online is the faster path, not the only one.
 *
 * Every figure comes from the server's quote. Nothing about the price is worked
 * out in this file.
 */
export default function PayPanel({ reference, quote, hotelPhone, bankTransfer, onSettled }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const [polling, setPolling] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await divic.startPayment(reference);
      // A new tab, so the guest keeps this page and its reference. Popup
      // blockers can refuse it, so fall back to navigating in place.
      const win = window.open(res.authorizationUrl, '_blank', 'noopener');
      if (!win) window.location.href = res.authorizationUrl;
      setPolling(true);
      poll(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  /**
   * Polls until payment settles. Backs off, and gives up after a few minutes
   * rather than hammering the API — the guest may simply have abandoned the
   * Paystack page, which is not an error.
   */
  const poll = (attempt) => {
    if (attempt > 40) {
      setPolling(false);
      return;
    }
    const wait = attempt < 6 ? 3000 : attempt < 20 ? 6000 : 12000;
    timer.current = setTimeout(async () => {
      try {
        const s = await divic.paymentStatus(reference);
        setStatus(s);
        if (s.paid) {
          setPolling(false);
          onSettled?.(s);
          return;
        }
      } catch {
        /* a failed poll is not a failed payment; keep waiting */
      }
      poll(attempt + 1);
    }, wait);
  };

  if (status?.paid) {
    return (
      <div className="mt-8 border-t border-ink/15 pt-6">
        {status.awaitingRoom ? (
          <>
            {/* Payment succeeded but every room of that type went during
                checkout. Saying "confirmed" here would put a guest on the road
                at midnight expecting a room that does not exist. */}
            <h3 className="font-display text-d3">Payment received</h3>
            <p className="prose-body mt-3">
              Your payment has gone through and your booking is made. Every{' '}
              room of that type was taken while you were paying, so the house is{' '}
              arranging your room now and will call you shortly to confirm it.
            </p>
          </>
        ) : (
          <>
            <h3 className="font-display text-d3">Paid and confirmed</h3>
            <p className="prose-body mt-3">
              Your payment has gone through and your room is held. Booking{' '}
              reference {status.bookingRef || reference}. We look forward to having you.
            </p>
          </>
        )}
        {hotelPhone && (
          <a href={`tel:${hotelPhone}`} className="btn btn-solid mt-6">
            Call {hotelPhone}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="mt-8 border-t border-ink/15 pt-6">
      <h3 className="font-display text-d3">Pay now, or pay at the house</h3>
      <p className="prose-body mt-3 text-sm">
        Paying now holds your room straight away. If you would rather transfer or
        pay at the desk, leave this — the house will call you to confirm.
      </p>

      {quote && (
        <dl className="mt-6 flex flex-col">
          <div className="flex items-baseline justify-between gap-6 border-t border-ink/10 py-3">
            <dt className="text-sm text-mute">Room</dt>
            <dd className="text-right text-sm">{formatNGN(quote.roomTotal)}</dd>
          </div>
          {quote.paystackFee > 0 && (
            <div className="flex items-baseline justify-between gap-6 border-t border-ink/10 py-3">
              <dt className="text-sm text-mute">
                Card processing fee
                <span className="mt-1 block text-sm text-mute">{quote.feeNote}</span>
              </dt>
              <dd className="text-right text-sm">{formatNGN(quote.paystackFee)}</dd>
            </div>
          )}
          <div className="flex items-baseline justify-between gap-6 border-t border-ink/15 py-4">
            <dt className="text-sm">Total to pay</dt>
            <dd className="text-right font-display text-xl" style={{ color: 'rgb(var(--accent))' }}>
              {formatNGN(quote.totalPayable)}
            </dd>
          </div>
        </dl>
      )}

      {error && (
        <p role="alert" className="mt-5 border-l-2 border-[#B4543A] py-2 pl-4 text-sm text-[#8C3A1E]">
          {error}
          {hotelPhone && <> You can also call the house on <a href={`tel:${hotelPhone}`} className="underline underline-offset-4">{hotelPhone}</a>.</>}
        </p>
      )}

      {polling ? (
        <div className="mt-6">
          <p className="text-sm text-slate">
            Waiting for your payment to clear. Finish paying in the other tab and this
            page will update on its own — you can leave it open.
          </p>
          <button type="button" onClick={pay} className="btn btn-outline mt-4">
            Open the payment page again
          </button>
        </div>
      ) : (
        <button type="button" onClick={pay} disabled={busy} className="btn btn-solid mt-6 disabled:opacity-50">
          {busy ? 'Opening payment…' : `Pay ${quote ? formatNGN(quote.totalPayable) : 'now'} by card`}
        </button>
      )}

      {bankTransfer && (
        <div className="mt-8 border-t border-ink/15 pt-6">
          <h3 className="font-display text-d3">Or pay by bank transfer</h3>
          <p className="prose-body mt-3 text-sm">
            {/* The card fee above only applies when paying by card — a transfer has
                nothing added to it. */}
            No card fee applies to a transfer{quote ? `, so it is ${formatNGN(quote.roomTotal)} — the room total only` : ''}.
            Put your request number, <strong className="text-ink">{reference}</strong>, in the
            transfer narration so the house can match your payment to your request.
          </p>
          <dl className="mt-5 flex flex-col">
            <div className="flex items-baseline justify-between gap-6 border-t border-ink/10 py-3">
              <dt className="text-sm text-mute">Bank</dt>
              <dd className="text-right text-sm">{bankTransfer.bank}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-t border-ink/10 py-3">
              <dt className="text-sm text-mute">Account number</dt>
              <dd className="text-right text-sm">{bankTransfer.accountNumber}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 border-t border-ink/10 py-3">
              <dt className="text-sm text-mute">Account name</dt>
              <dd className="text-right text-sm">{bankTransfer.accountName}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
