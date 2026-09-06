import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useProperty } from '../context/PropertyContext';
import SwanMark from './SwanMark';

const NAV = [
  { to: '/exclusive', label: 'Exclusive' },
  { to: '/urban', label: 'Urban' },
  { to: '/contact', label: 'Contact' },
];

/**
 * The switcher is the brand's persistent pivot: present at every scroll position, on
 * every breakpoint, never folded into the menu. Switching re-themes the document and
 * navigates to that property — it is a change of place, not a filter.
 */
function PropertySwitcher({ compact = false }) {
  const { propertyId, choose, properties } = useProperty();
  return (
    <div
      role="tablist"
      aria-label="Choose property"
      className="relative inline-flex rounded-full border border-bone/25 p-[3px]"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-[3px] left-[3px] w-[calc(50%-3px)] rounded-full transition-transform duration-700 ease-quiet"
        style={{
          background: 'rgb(var(--accent) / 0.22)',
          border: '1px solid rgb(var(--accent) / 0.55)',
          transform: propertyId === 'urban' ? 'translateX(100%)' : 'translateX(0)',
        }}
      />
      {properties.map((p) => {
        const active = propertyId === p.id;
        return (
          <Link
            key={p.id}
            to={`/${p.id}`}
            role="tab"
            aria-selected={active}
            onClick={() => choose(p.id)}
            className={`relative z-10 whitespace-nowrap rounded-full transition-opacity duration-400 ${
              compact ? 'px-3 py-1.5 text-[0.78rem]' : 'px-4 py-2 text-sm'
            } text-bone ${
              active ? 'font-semibold opacity-100' : 'font-medium opacity-55 hover:opacity-80'
            }`}
          >
            {p.shortName}
          </Link>
        );
      })}
    </div>
  );
}

export default function Header() {
  const [stuck, setStuck] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  // The whole site sits on the same near-black ground now, so the header no longer
  // has to invert on its way past a hero — it only gains a ground of its own on scroll.
  // On the chooser itself the page asks the question; the header does not ask it again.
  const isChooser = pathname === '/';
  const nav = isChooser ? NAV.filter((i) => !/^\/(exclusive|urban)$/.test(i.to)) : NAV;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <a href="#main" className="sr-only-focusable btn btn-solid absolute left-4 top-4 z-[200]">
        Skip to content
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-400 ease-quiet ${
          stuck
            ? 'border-bone/10 bg-obsidian/85 backdrop-blur-xl backdrop-saturate-150'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="shell flex h-[72px] items-center justify-between gap-6 md:h-20">
          <Link to="/" className="flex items-center gap-3" aria-label="Divic, home">
            <SwanMark
              className="h-9 w-8 text-champagne"
              showDisc={false}
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-lg font-normal uppercase tracking-[0.14em] text-champagne">
                Divic
              </span>
              <span className="mt-1 text-[0.72rem] text-bone/55">Festac, Lagos</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative py-1 text-sm font-medium transition-colors duration-400 ${
                    isActive ? 'text-bone' : 'text-bone/60 hover:text-bone'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {!isChooser && (
              <>
                <div className="hidden sm:block">
                  <PropertySwitcher />
                </div>
                <div className="sm:hidden">
                  <PropertySwitcher compact />
                </div>
              </>
            )}

            {/* the one action that follows the guest everywhere, chooser included */}
            <Link
              to="/book"
              className="hidden whitespace-nowrap bg-accent px-5 py-2.5 text-[0.9375rem] font-medium
                         text-obsidian transition-colors duration-400 ease-quiet
                         hover:bg-accent-lift sm:inline-flex"
            >
              Request a stay
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="flex h-11 w-11 items-center justify-center lg:hidden"
            >
              <span className="relative block h-px w-6 bg-champagne before:absolute before:-top-2 before:block before:h-px before:w-6 before:bg-champagne before:content-[''] after:absolute after:top-2 after:block after:h-px after:w-6 after:bg-champagne after:content-['']" />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-center gap-2 bg-obsidian px-gutter lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="absolute right-gutter top-6 text-sm"
            style={{ color: 'rgb(var(--accent))' }}
          >
            Close
          </button>
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} className="py-2 font-display text-d3">
              {item.label}
            </NavLink>
          ))}
          <Link to="/book" className="btn btn-solid mt-6 self-start">
            Request a stay
          </Link>
        </div>
      )}
    </>
  );
}
