import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProperty } from '../context/PropertyContext';
import { Plate } from '../components/primitives';
import { useCarousel } from '../lib/useCarousel';
import HomeNav from '../components/HomeNav';
import SwanMark from '../components/SwanMark';


const BASE = import.meta.env.BASE_URL;
/* Ambient establishing shots, alternating houses so the rotation itself says there are
   two of them. */
const HERO_SHOTS = [
  { src: `${BASE}images/exclusive/pool.jpg`, alt: 'The pool at Divic Exclusive, after dark' },
  { src: `${BASE}images/urban/bar.jpg`, alt: 'The bar at Divic Urban' },
  { src: `${BASE}images/urban/pool.jpg`, alt: 'The pool at Divic Urban' },
  { src: `${BASE}images/exclusive/indoorbar.jpg`, alt: 'The indoor bar at Divic Exclusive' },
];

/* On black the property accents are lifted so they still read. Same two hues as the rest
   of the system, adjusted for the ground they sit on. */
const CARD_ACCENT = { exclusive: '#8A8258', urban: '#C9704E' };

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
      className="group flex flex-1 flex-col items-center gap-2 border px-8 py-7 text-center
                 backdrop-blur-[2px] transition-colors duration-400 ease-quiet sm:px-14 sm:py-10"
      style={{ borderColor: `${accent}66`, backgroundColor: 'rgba(11,10,8,.34)' }}
    >
      <PinIcon
        className="h-5 w-5 transition-transform duration-400 ease-quiet group-hover:-translate-y-0.5"
        style={{ color: accent }}
      />
      <span className="whitespace-nowrap font-display text-[clamp(1.35rem,2.6vw,1.9rem)] font-light text-bone">
        {property.name}
      </span>
      <span className="text-[0.72rem] tracking-[0.22em] text-bone/55">
        FESTAC &middot; {property.totalRooms} ROOMS
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
        <div className="fixed inset-0 z-[60] flex flex-col justify-center gap-3 bg-obsidian px-gutter">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="absolute right-gutter top-6 text-sm text-champagne"
          >
            Close
          </button>
          {properties.map((p) => (
            <Link key={p.id} to={`/${p.id}`} className="py-2 font-display text-d3 text-bone">
              {p.name}
            </Link>
          ))}
          <Link to="/contact" className="py-2 font-display text-d3 text-bone">Contact</Link>
          <Link to="/book" className="py-2 font-display text-d3 text-bone">Request a stay</Link>
          <Link to="/booking-status" className="py-2 font-display text-d3 text-bone">
            Check a request
          </Link>
        </div>
      )}

      {/* ---------- hero: select your destination ---------- */}
      <section
        aria-label="Select your destination"
        className="relative flex min-h-[100svh] flex-col items-center justify-center
                   overflow-hidden bg-obsidian pb-16 pt-28"
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
            background:
              'linear-gradient(to bottom, rgba(11,10,8,.84) 0%, rgba(11,10,8,.6) 38%, ' +
              'rgba(11,10,8,.72) 72%, rgba(11,10,8,.9) 100%)',
          }}
        />

        <div className="relative z-30 flex w-full max-w-4xl flex-col items-center px-gutter text-center">
          <SwanMark className="h-12 w-11 text-champagne" showDisc={false} />
          <span className="mt-3 font-display text-lg uppercase tracking-[0.3em] text-champagne">
            Divic
          </span>

          <p className="mt-8 text-[0.72rem] tracking-[0.34em] text-champagne/85">
            WELCOME TO DIVIC HOTELS
          </p>

          <h1 className="mt-4 font-display text-[clamp(2.25rem,5.4vw,4rem)] font-light leading-[1.05] text-bone">
            Select Your Destination
          </h1>

          <hr className="mt-5 h-px w-16 border-0 bg-champagne/70" />

          <p className="mt-5 max-w-[46ch] text-bone/70">
            Two houses in Festac, one promise of Nigerian hospitality. Choose where your next
            stay begins.
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
                  i === shot ? 'w-10 bg-champagne' : 'w-6 bg-bone/30 hover:bg-bone/60'
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
