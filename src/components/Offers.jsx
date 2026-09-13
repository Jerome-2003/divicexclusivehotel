import { Link } from 'react-router-dom';
import { SectionHead } from './primitives';
import { formatNGN } from '../data/properties';

/**
 * What is currently taken off the price at this property.
 *
 * Offers get a section of their own rather than a smaller number beside each
 * rate, because those are two different things to read. A rate is what a room
 * costs; an offer is a reason to book now, and a reason nobody acts on unless
 * it is stated plainly enough to remember. Folding it into the rate card turns
 * it into a footnote.
 *
 * Nothing here does any arithmetic. The saving is worked out by the hotel's own
 * system when a stay is quoted and again when it is booked, which is what makes
 * it impossible for this page to advertise something the booking does not
 * honour.
 */
export default function Offers({ property }) {
  const offers = property.discounts || [];
  if (offers.length === 0) return null;

  return (
    <section className="section bg-alabaster">
      <div className="shell">
        <SectionHead
          label="On now"
          title={offers.length === 1 ? 'An offer at ' + property.displayName : 'Offers at ' + property.displayName}
          lead="Taken off your total automatically when you request a stay — there is no code to enter and nothing to ask for."
        />

        <div className="mt-14 grid gap-px border border-ink/12 bg-ink/12 sm:grid-cols-2 lg:grid-cols-3">
          {offers.map((o) => (
            <article key={o.id} className="flex flex-col gap-5 bg-alabaster p-8">
              <span
                className="font-display text-[clamp(1.8rem,3vw,2.4rem)] font-light leading-none"
                style={{ color: 'rgb(var(--accent))' }}
              >
                {o.kind === 'percent' ? o.value + '% off' : formatNGN(o.value) + ' off'}
              </span>
              <div>
                <h3 className="font-display text-xl font-light text-ink">{o.name}</h3>
                {o.blurb && <p className="prose-body mt-3">{o.blurb}</p>}
              </div>
              <Terms offer={o} property={property} />
            </article>
          ))}
        </div>

        {offers.length > 1 && (
          <p className="mt-8 text-sm text-mute">
            A stay that qualifies for more than one of these gets all of them.
          </p>
        )}

        <div className="mt-12">
          <Link to="/book" className="btn btn-solid">
            Request a stay
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * The conditions, in the order a guest would ask about them: which rooms, how
 * long, and by when. Silence means no condition — an offer with no terms shows
 * nothing here rather than three lines saying "any", which reads as fine print
 * where there is none.
 */
function Terms({ offer, property }) {
  const named = (offer.roomTypes || [])
    .map((t) => property.roomTypes.find((rt) => rt.type === t)?.name || t)
    .join(', ');

  const lines = [
    named && named,
    offer.minNights > 1 && `Stays of ${offer.minNights} nights or more`,
    offer.startsOn && offer.endsOn
      ? `Arrivals ${prettyDate(offer.startsOn)} to ${prettyDate(offer.endsOn)}`
      : offer.endsOn
        ? `Arrivals until ${prettyDate(offer.endsOn)}`
        : offer.startsOn
          ? `Arrivals from ${prettyDate(offer.startsOn)}`
          : null,
  ].filter(Boolean);

  if (lines.length === 0) return null;

  return (
    <ul className="mt-auto flex flex-col gap-2 border-t border-ink/12 pt-5 text-sm text-mute">
      {lines.map((l) => (
        <li key={l}>{l}</li>
      ))}
    </ul>
  );
}

function prettyDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}
