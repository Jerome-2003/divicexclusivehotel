import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProperty } from '../context/PropertyContext';
import Logo from './Logo';
import { BRAND } from '../data/properties';

/**
 * The homepage's own navigation: wordmark, the two houses as tabs, and an inline search.
 *
 * The tabs ARE the search's location control — the reference this follows carries both
 * tabs and a separate location dropdown, which is two controls for one job. Here the tab
 * you pick is the property you search.
 *
 * Search is not decoration: it collects exactly what GET /api/public/availability needs
 * and hands it to the booking flow, which opens on the room step with live availability
 * rather than making the guest type it all again.
 */

const today = () => new Date().toISOString().slice(0, 10);

const FIELD =
  'w-full bg-transparent text-[0.9375rem] text-ink placeholder:text-mute ' +
  'focus:outline-none [color-scheme:light]';

function HouseTabs({ properties, propertyId, choose, className = '' }) {
  return (
    <div role="tablist" aria-label="Choose a house" className={`items-center gap-2 ${className}`}>
      {properties.map((p) => {
        const active = propertyId === p.id;
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => choose(p.id)}
            className={`flex-1 whitespace-nowrap border px-4 py-2 text-[0.78rem] tracking-[0.16em] transition-colors duration-400 ease-quiet sm:flex-none ${
              active
                ? 'border-accent/60 bg-gold/35 text-ink'
                : 'border-ink/20 text-slate hover:border-ink/40 hover:text-ink'
            }`}
          >
            {p.shortName}
          </button>
        );
      })}
    </div>
  );
}

export default function HomeNav({ onOpenMenu }) {
  const navigate = useNavigate();
  const { properties, propertyId, choose } = useProperty();
  const [stuck, setStuck] = useState(false);
  // Below xl the search will not fit on one row, and a wrapping fixed bar swallows the
  // hero. There it collapses behind a button and opens as a panel.
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState({
    checkIn: '',
    checkOut: '',
    adults: '2',
    children: '0',
  });

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const set = (key) => (e) => setSearch((s) => ({ ...s, [key]: e.target.value }));

  const onSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams({
      location: propertyId || 'exclusive',
      adults: search.adults,
      children: search.children,
    });
    if (search.checkIn) params.set('checkIn', search.checkIn);
    if (search.checkOut) params.set('checkOut', search.checkOut);
    navigate(`/book?${params.toString()}`);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-400 ease-quiet ${
        stuck
          ? 'border-ink/10 bg-alabaster/92 backdrop-blur-xl'
          : 'border-transparent bg-alabaster/70 backdrop-blur-sm'
      }`}
    >
      <div className="relative mx-auto flex max-w-[1600px] flex-nowrap items-center gap-x-4 px-gutter py-3">
        {/* wordmark */}
        <Link
          to="/"
          className="flex shrink-0 items-center gap-2.5"
          aria-label={`${BRAND.name}, home`}
        >
          <Logo variant="mark" priority plate className="h-8 w-auto" />
          <span className="hidden font-display text-lg uppercase tracking-[0.22em] text-ink sm:block">
            Divic
          </span>
        </Link>

        {/* the two houses — also the search's location. Below sm the row cannot hold
            them alongside the search and menu controls, so they move into the panel. */}
        <HouseTabs
          properties={properties}
          propertyId={propertyId}
          choose={choose}
          className="hidden shrink-0 sm:flex"
        />

        {/* inline search — full width from xl, a panel below it */}
        <form
          onSubmit={onSearch}
          className={`min-w-0 flex-1 items-stretch gap-2 ${
            searchOpen
              ? 'absolute inset-x-0 top-full flex flex-col border-b border-ink/10 bg-alabaster p-gutter xl:static xl:flex-row xl:border-0 xl:p-0'
              : 'hidden xl:flex'
          }`}
        >
          <HouseTabs
            properties={properties}
            propertyId={propertyId}
            choose={choose}
            className="flex sm:hidden"
          />

          <label className="flex min-w-[8.5rem] flex-1 flex-col justify-center border border-ink/20 px-3 py-1.5">
            <span className="text-[0.62rem] text-mute">Check in</span>
            <input
              type="date"
              min={today()}
              value={search.checkIn}
              onChange={set('checkIn')}
              className={FIELD}
              aria-label="Check-in date"
            />
          </label>

          <label className="flex min-w-[8.5rem] flex-1 flex-col justify-center border border-ink/20 px-3 py-1.5">
            <span className="text-[0.62rem] text-mute">Check out</span>
            <input
              type="date"
              min={search.checkIn || today()}
              value={search.checkOut}
              onChange={set('checkOut')}
              className={FIELD}
              aria-label="Check-out date"
            />
          </label>

          <label className="flex flex-col justify-center border border-ink/20 px-3 py-1.5">
            <span className="text-[0.62rem] text-mute">Adults</span>
            <select value={search.adults} onChange={set('adults')} className={FIELD} aria-label="Adults">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n} className="bg-alabaster">
                  {n}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col justify-center border border-ink/20 px-3 py-1.5">
            <span className="text-[0.62rem] text-mute">Children</span>
            <select value={search.children} onChange={set('children')} className={FIELD} aria-label="Children">
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n} className="bg-alabaster">
                  {n}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            /* The logo's own gold, carrying ink at 10:1 — the one place the light gold
               is a fill rather than a line. */
            className="shrink-0 bg-gold px-7 text-[0.9375rem] font-medium text-ink
                       transition-colors duration-400 ease-quiet hover:bg-[#EBD8AF]"
          >
            Search
          </button>
        </form>

        {/* below xl, this opens the search panel */}
        <button
          type="button"
          onClick={() => setSearchOpen((v) => !v)}
          aria-expanded={searchOpen}
          aria-label={searchOpen ? 'Close search' : 'Open search'}
          className="ml-auto shrink-0 bg-gold px-5 py-2.5 text-[0.875rem] font-medium
                     text-ink transition-colors duration-400 ease-quiet hover:bg-[#EBD8AF] xl:hidden"
        >
          {searchOpen ? 'Close' : 'Search'}
        </button>

        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="flex h-11 w-11 shrink-0 items-center justify-center xl:ml-0"
        >
          <span className="relative block h-px w-6 bg-ink before:absolute before:-top-2 before:block before:h-px before:w-6 before:bg-ink before:content-[''] after:absolute after:top-2 after:block after:h-px after:w-6 after:bg-ink after:content-['']" />
        </button>
      </div>
    </header>
  );
}
