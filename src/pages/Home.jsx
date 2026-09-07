import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProperty } from '../context/PropertyContext';
import { Plate } from '../components/primitives';
import { useCarousel } from '../lib/useCarousel';
import { photo } from '../lib/images';
import HomeNav from '../components/HomeNav';
import Logo from '../components/Logo';
import { BRAND } from '../data/properties';

/* Ambient establishing shots, alternating houses so the rotation itself says there are
   two of them. */
const HERO_SHOTS = [
  { src: photo('exclusive', 'pool'), alt: 'The pool at Divic Exclusive, after dark' },
  { src: photo('urban', 'bar'), alt: 'The bar at Divic Urban' },
  { src: photo('urban', 'pool'), alt: 'The pool at Divic Urban' },
  { src: photo('exclusive', 'indoorbar'), alt: 'The indoor bar at Divic Exclusive' },
];

/* The two branches, kept inside the gold family: Exclusive the cooler olive side of it,
   Urban the warmer bronze. Both are the accent values from index.css, so a card matches
   the branch page it opens. */
const CARD_ACCENT = { exclusive: '#776427', urban: '#8F5A28' };

function PinIcon({ className = '', style }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none"
         stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <path d="M12 21s7-5.686 7-11a7 7 0 1 0-14 0c0 5.314 7 11 7 11Z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

function DestinationCard({ property }) {
  const { choose } = useProperty();
  const accent = CARD_ACCENT[property.id];
  return (
    <Link
      to={`/${property.id}`}
      onClick={() => choose(property.id)}
      className="group flex flex-1 flex-col items-center gap-2 border bg-alabaster/95 px-7 py-6
                 text-center backdrop-blur-sm transition-colors duration-400 ease-quiet
                 hover:bg-alabaster sm:px-10 sm:py-8"
      style={{ borderColor: `${accent}59` }}
    >
      <PinIcon
        className="h-5 w-5 transition-transform duration-400 ease-quiet group-hover:-translate-y-0.5"
        style={{ color: accent }}
      />
      <span className="font-display text-[clamp(1.2rem,2.4vw,1.7rem)] font-light leading-tight text-ink">
        {property.displayName}
      </span>

      {/* The guest is choosing where to go, so the card says where it is and how to
          reach it — not just the name. */}
      <span className="mt-1 max-w-[26ch] text-[0.8rem] leading-relaxed text-slate">
        {property.address}
      </span>
      <a
        href={`tel:${(property.phone || '').replace(/\s/g, '')}`}
        onClick={(e) => e.stopPropagation()}
        className="text-[0.8rem] text-slate underline-offset-4 hover:text-ink hover:underline"
      >
        {property.phone}
      </a>

      <span
        aria-hidden="true"
        className="mt-3 block h-px w-8 transition-all duration-700 ease-quiet group-hover:w-16"
        style={{ background: accent }}
      />
      <span className="mt-3 text-[0.72rem] tracking-[0.2em] text-mute">
        {property.totalRooms} ROOMS
      </span>
    </Link>
  );
}

export default function Home() {
  const { properties } = useProperty();
  const [paused, setPaused] = useState(false);
  const [shot, setShot] = useCarousel({ length: HERO_SHOTS.length, interval: 6000, paused });
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <HomeNav onOpenMenu={() => setMenuOpen(true)} />

      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-center gap-3 bg-alabaster px-gutter">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="absolute right-gutter top-6 text-sm text-accent"
          >
            Close
          </button>
          {properties.map((p) => (
            <Link key={p.id} to={`/${p.id}`} className="py-2 font-display text-d3 text-ink">
              {p.displayName}
            </Link>
          ))}
          <Link to="/contact" className="py-2 font-display text-d3 text-ink">Contact</Link>
          <Link to="/book" className="py-2 font-display text-d3 text-ink">Request a stay</Link>
          <Link to="/booking-status" className="py-2 font-display text-d3 text-ink">
            Check a request
          </Link>
          <a
            href={BRAND.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="link-quiet mt-4 self-start"
          >
            WhatsApp {BRAND.whatsapp}
          </a>
        </div>
      )}

      {/* ---------- hero: select your destination ---------- */}
      <section
        aria-label="Select your destination"
        className="relative flex min-h-[100svh] flex-col items-center justify-center
                   overflow-hidden bg-alabaster pb-16 pt-28"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {HERO_SHOTS.map((image, i) => (
          <Plate
            key={image.src}
            src={image.src}
            alt={i === shot ? image.alt : ''}
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
            /* Off-white over the photograph rather than near-black: the room stays
               readable underneath as a pale ground, and the type on top is ink. */
            background:
              'linear-gradient(to bottom, rgba(250,247,241,.80) 0%, rgba(250,247,241,.60) 34%, ' +
              'rgba(250,247,241,.70) 70%, rgba(250,247,241,.90) 100%)',
          }}
        />

        <div className="relative z-30 flex w-full max-w-4xl flex-col items-center px-gutter text-center">
          <Logo variant="mark" priority plate className="h-16 w-auto sm:h-20" />

          <p className="mt-6 text-[0.72rem] tracking-[0.34em] text-gold-deep">
            WELCOME TO DIVIC EXCLUSIVE HOTELS
          </p>

          <h1 className="mt-4 font-display text-[clamp(2.25rem,5.4vw,4rem)] font-light leading-[1.05] text-ink">
            Select Your Destination
          </h1>

          <hr className="mt-5 h-px w-16 border-0 bg-accent" />

          <p className="mt-5 max-w-[46ch] text-slate">
            Two branches in Festac, one promise of Nigerian hospitality. Choose where your
            next stay begins.
          </p>

          <div className="mt-10 flex w-full flex-col items-stretch gap-5 sm:flex-row sm:justify-center">
            {properties.map((p) => (
              <DestinationCard key={p.id} property={p} />
            ))}
          </div>

          <div className="mt-10 flex items-center gap-3">
            {HERO_SHOTS.map((image, i) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setShot(i)}
                aria-label={`Show background ${i + 1} of ${HERO_SHOTS.length}`}
                aria-current={i === shot}
                className={`h-px transition-all duration-700 ease-quiet ${
                  i === shot ? 'w-10 bg-accent' : 'w-6 bg-ink/25 hover:bg-ink/50'
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
