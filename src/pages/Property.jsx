import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { BRAND, formatNGN } from '../data/properties';
import { useProperty } from '../context/PropertyContext';
import { Plate, SectionHead, SpecList } from '../components/primitives';
import Slideshow from '../components/Slideshow';
import AmenityIcon from '../components/AmenityIcon';
import { useCarousel } from '../lib/useCarousel';

/* ------------------------------------------------------------------ *
 * Hero
 *
 * The house first, then what is inside it. Arriving at a property should not be one
 * still photograph of a facade — the guest is choosing between two houses and wants to
 * know what each actually has. So the frontview opens, and the tour continues through
 * the bar, the pool, the gym: one shot per place, named, and reachable directly.
 * ------------------------------------------------------------------ */
function HeroTour({ property }) {
  const shots = useMemo(() => {
    const seen = new Set();
    const out = [];
    /* Descriptors, not URLs, so dedupe on the fallback file they carry. */
    const add = (src, label) => {
      const id = src?.src;
      if (id && !seen.has(id)) {
        seen.add(id);
        out.push({ src, label });
      }
    };
    add(property.heroImage, 'The house');
    (property.gallery || []).forEach((group) => add(group.images[0], group.label));
    return out;
  }, [property]);

  const [paused, setPaused] = useState(false);
  const [shot, setShot, armed] = useCarousel({ length: shots.length, interval: 5500, paused });
  const totalFrom = Math.min(...property.roomTypes.map((r) => r.rate));

  return (
    <section
      className="relative flex min-h-[86svh] items-end overflow-hidden bg-[#1C1711]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {shots.map((image, i) => (
        <Plate
          key={image.label}
          src={armed.has(i) ? image.src : null}
          sizes="100vw"
          alt={i === shot ? `${image.label}, ${property.displayName}` : ''}
          priority={i === 0}
          className={`absolute inset-0 transition-opacity duration-1100 ease-quiet ${
            i === shot ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      <div
        aria-hidden="true"
        className="absolute inset-0 z-20"
        style={{
          background:
            'linear-gradient(to bottom, rgba(28,23,17,.60) 0%, rgba(28,23,17,.14) 30%, ' +
            'rgba(28,23,17,.72) 70%, rgba(28,23,17,.95) 100%)',
        }}
      />

      <div className="shell relative z-30 pb-12 pt-32">
        <p className="text-sm text-gold">
           {property.character}.
        </p>
        <h1 className="mt-4 max-w-[16ch] font-display text-d1 font-light text-bone">
          {property.displayName}
        </h1>
        <p className="mt-5 max-w-[46ch] text-lg text-bone/75">{property.tagline}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link to="/book" className="btn btn-onDark">
            Request a stay
          </Link>
          <span className="text-sm text-bone/75">From {formatNGN(totalFrom)} per night</span>
        </div>

        {/* The tour index. It doubles as the carousel control, so the guest can go
            straight to the pool instead of waiting for it to come round. */}
        {shots.length > 1 && (
          <div className="mt-12 flex flex-wrap gap-x-7 gap-y-4 border-t border-bone/25 pt-5">
            {shots.map((image, i) => {
              const active = i === shot;
              return (
                <button
                  key={image.label}
                  type="button"
                  onClick={() => setShot(i)}
                  aria-current={active}
                  className="group/tab flex flex-col gap-2 text-left"
                >
                  <span
                    aria-hidden="true"
                    className={`h-px transition-all duration-700 ease-quiet ${
                      active ? 'w-full bg-gold' : 'w-5 bg-bone/35 group-hover/tab:bg-bone/70'
                    }`}
                  />
                  <span
                    className={`text-[0.82rem] transition-colors duration-400 ${
                      active ? 'text-bone' : 'text-bone/60 group-hover/tab:text-bone/85'
                    }`}
                  >
                    {image.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * A look around
 *
 * One lead frame, then an uneven tile — the shapes differ because the places differ.
 * Names sit on the photographs rather than beneath them, so a caption never reads as an
 * afterthought and the eye stays inside the picture.
 * ------------------------------------------------------------------ */
const GALLERY_SLOTS = [
  { span: 'md:col-span-12', ratio: 'aspect-[16/9] lg:aspect-[21/9]' },
  { span: 'md:col-span-5', ratio: 'aspect-[4/5]' },
  { span: 'md:col-span-7', ratio: 'aspect-[4/3]' },
  { span: 'md:col-span-7', ratio: 'aspect-[16/10]' },
  { span: 'md:col-span-5', ratio: 'aspect-[4/5]' },
  { span: 'md:col-span-6', ratio: 'aspect-[3/2]' },
];

function GalleryFrame({ group, property, slot, lead }) {
  return (
    <figure className={`group relative ${slot.span}`}>
      <Slideshow
        images={group.images}
        alt={`${group.label}, ${property.name}`}
        className={slot.ratio}
        zoom
        dotsClassName="right-5 top-5"
        overlay={
          <>
            <span aria-hidden="true" className="scrim-b pointer-events-none absolute inset-0 z-20" />
            <figcaption className="absolute inset-x-0 bottom-0 z-20 p-6 lg:p-8">
              <span
                aria-hidden="true"
                className="block h-px w-8 bg-gold transition-all duration-700 ease-quiet group-hover:w-20"
              />
              <span
                className={`mt-4 block font-display font-light text-bone ${
                  lead ? 'text-d2' : 'text-d3'
                }`}
              >
                {group.label}
              </span>
            </figcaption>
          </>
        }
      />
    </figure>
  );
}

/* ------------------------------------------------------------------ *
 * Rooms
 *
 * A room is sold by the photograph, so the photograph is the full width of the spread
 * and the words sit on top of its edge rather than in a column beside it. Sides swap
 * down the page; the rate is the largest thing in the panel because it is the thing
 * being decided.
 * ------------------------------------------------------------------ */
function RoomSpread({ room, index }) {
  const flipped = index % 2 === 1;
  const floors = (room.floors || []).map((f) => (f === 0 ? 'Ground' : `Floor ${f}`)).join(' · ');

  return (
    <article className="group relative grid items-center lg:grid-cols-12">
      <Plate
        src={room.image}
        alt={room.name}
        sizes="(min-width: 1024px) 62vw, 100vw"
        className={`plate-zoom aspect-[4/3] sm:aspect-[16/10] lg:col-span-8 lg:row-start-1 ${
          flipped ? 'lg:col-start-5' : 'lg:col-start-1'
        }`}
      />

      <div
        /* Solid, not translucent: this panel oversets the photograph at its left edge
           (mx-4/mx-8 below lg), and a backdrop-blur there used to let the image show
           through right where the text sits, exactly at that seam — legible in some
           places and not in others depending what was behind it. A flat bg-alabaster
           reads the same everywhere. */
        className={`relative z-20 -mt-14 mx-4 border border-ink/12 bg-alabaster p-7
                    sm:-mt-20 sm:mx-8 lg:mx-0 lg:mt-0 lg:row-start-1 lg:col-span-5 lg:p-10 ${
                      flipped ? 'lg:col-start-1' : 'lg:col-start-8'
                    }`}
      >
        <h3 className="font-display text-d3 text-ink">{room.name}</h3>
        <span aria-hidden="true" className="mt-4 block h-px w-10 bg-accent" />
        <p className="prose-body mt-5">{room.description}</p>

        {floors && <p className="mt-6 text-sm text-mute">{floors}</p>}

        <div className="mt-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-5 border-t border-ink/12 pt-6">
          <span className="flex flex-col">
            <span
              className="font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-light leading-none"
              style={{ color: 'rgb(var(--accent))' }}
            >
              {formatNGN(room.rate)}
            </span>
            <span className="mt-2 text-sm text-mute">per night, from</span>
          </span>
          <Link to={`/book?roomType=${room.type}`} className="btn btn-solid">
            Request this room
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ *
 * Whole-space hire
 *
 * Not a room, so it does not belong in the room ladder: a guest booking the pool for an
 * evening is doing something different from a guest booking a bed. These rates are held
 * in the site's content rather than the PMS, which is the one place the site quotes a
 * price the hotel system does not own — flagged in the README.
 * ------------------------------------------------------------------ */
function PrivateBookings({ property }) {
  return (
    <section className="section bg-alabaster">
      <div className="shell">
        <SectionHead
          title="Private bookings"
          lead="The pool and either bar can be taken for an evening and closed to other guests. The rate is for the space, not per head, and the branch confirms the date by telephone."
        />
        <div className="mt-14 grid gap-px border border-ink/12 bg-ink/12 md:grid-cols-3">
          {property.privateBookings.map((item) => (
            <div key={item.label} className="flex flex-col gap-4 bg-alabaster p-8 lg:p-10">
              <h3 className="font-display text-d3 text-ink">{item.label}</h3>
              <span aria-hidden="true" className="block h-px w-10 bg-accent" />
              <p className="text-sm text-slate">{item.note}</p>
              <p className="mt-auto pt-4">
                <span
                  className="font-display text-[clamp(1.6rem,3vw,2.1rem)] font-light leading-none"
                  style={{ color: 'rgb(var(--accent))' }}
                >
                  {formatNGN(item.rate)}
                </span>
                <span className="mt-2 block text-sm text-mute">for the space</span>
              </p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href={`tel:${(property.phone || '').replace(/\s/g, '')}`}
            className="btn btn-solid"
          >
            Call {property.phone}
          </a>
          <a
            href={BRAND.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            Ask on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

/* House rules are the sort of thing a guest wants to find without asking, so they are
   set plainly rather than buried in a paragraph of terms. */
function HouseRules({ property }) {
  return (
    <section className="section bg-shell">
      <div className="shell grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHead title="Before you arrive" />
        </div>
        <dl className="lg:col-span-7 lg:col-start-6">
          {property.houseRules.map((rule) => (
            <div
              key={rule.label}
              className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 border-t border-ink/12 py-5"
            >
              <dt className="font-display text-lg text-ink">{rule.label}</dt>
              <dd className="text-slate">{rule.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default function Property() {
  const { slug } = useParams();
  const { choose, propertyId, byId, ratesAreLive } = useProperty();
  const property = byId[slug];

  // arriving directly at a property URL is itself a choice
  useEffect(() => {
    if (property && propertyId !== property.id) choose(property.id);
  }, [property, propertyId, choose]);

  useEffect(() => {
    if (property) document.title = `${property.displayName} — Festac, Lagos`;
  }, [property]);

  if (!property) return <Navigate to="/" replace />;

  const gallery = property.gallery || [];

  return (
    <>
      <HeroTour property={property} />

      {/* ---------- introduction ---------- */}
      <section className="section shell">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHead title={property.intro} />
          </div>
          <div className="flex flex-col justify-end gap-6 lg:col-span-4 lg:col-start-9">
            <p className="prose-body">{property.stayPitch}</p>
            <SpecList
              items={[
                { label: 'Address', value: property.address },
                { label: 'Position', value: property.coords },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ---------- a look around ---------- */}
      {gallery.length > 0 && (
        <section className="section bg-shell">
          <div className="shell">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHead
                title="A look around"
                lead="Where the evening actually happens, photographed as it stands."
              />
              <Link to="/book" className="link-quiet mb-1">
                Request a stay
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-1 items-start gap-5 md:grid-cols-12 md:gap-6">
              {gallery.map((group, i) => (
                <GalleryFrame
                  key={group.label}
                  group={group}
                  property={property}
                  slot={GALLERY_SLOTS[i % GALLERY_SLOTS.length]}
                  lead={i === 0}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- amenities ---------- */}
      <section className="section shell">
        <SectionHead
          title="What comes with the room"
          lead={`Everything below is on site at ${property.displayName} and included for house guests.`}
        />
        {/* A hairline mesh: the gaps between the tiles are the rules, so the grid
            draws its own structure and nothing needs a border of its own. */}
        <div className="mt-14 grid gap-px border border-ink/12 bg-ink/12 sm:grid-cols-2 lg:grid-cols-3">
          {property.amenities.map((a) => (
            <div
              key={a.label}
              className="group flex flex-col gap-6 bg-alabaster p-8 transition-colors duration-400 ease-quiet hover:bg-sand/45 lg:p-10"
            >
              <AmenityIcon
                label={a.label}
                className="h-10 w-10 text-accent transition-colors duration-400 group-hover:text-accent-lift"
              />
              <span className="flex flex-col">
                <span className="font-display text-xl font-light text-ink">{a.label}</span>
                <span className="mt-2 text-sm text-slate">{a.note}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- rooms ---------- */}
      <section className="section bg-shell">
        <div className="shell">
          <SectionHead
            title={`Every room at ${property.displayName}`}
            lead={`Rates are nightly and ${
              ratesAreLive ? 'come live from the hotel system' : 'are the published rates'
            } — the total for your dates is calculated when you request a stay.`}
          />
          <div className="mt-16 flex flex-col gap-16 lg:gap-24">
            {property.roomTypes.map((room, i) => (
              <RoomSpread key={room.type} room={room} index={i} />
            ))}
          </div>
        </div>
      </section>

      {property.privateBookings?.length > 0 && <PrivateBookings property={property} />}

      {property.houseRules?.length > 0 && <HouseRules property={property} />}

      {/* ---------- closing ---------- */}
      <section className="section bg-alabaster">
        <div className="shell flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="max-w-[18ch] font-display text-d2 font-light">
              Request the room, and we will call you.
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            <Link to="/book" className="btn btn-solid">
              Request a stay
            </Link>
            <a
              href={property.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-mute underline-offset-4 hover:text-ink hover:underline"
            >
              {property.address}
            </a>
            <a
              href={BRAND.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-mute underline-offset-4 hover:text-ink hover:underline"
            >
              Or message us on WhatsApp — {BRAND.whatsapp}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
