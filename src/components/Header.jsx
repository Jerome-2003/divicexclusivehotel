import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useProperty } from '../context/PropertyContext';
import SwanMark from './SwanMark';

const NAV = [
  { to: '/exclusive', label: 'Exclusive' },
  { to: '/urban', label: 'Urban' },
  { to: '/contact', label: 'Contact' },
  { to: '/book', label: 'Book' },
];

/**
 * The switcher is the brand's persistent pivot: present at every scroll position, on
 * every breakpoint, never folded into the menu. Switching re-themes the document and
 * navigates to that property — it is a change of place, not a filter.
 */
function PropertySwitcher({ compact = false, onDark = false }) {
  const { propertyId, choose, properties } = useProperty();
  return (
    <div
      role="tablist"
      aria-label="Choose property"
      className={`relative inline-flex rounded-full border p-[3px] transition-colors duration-400 ${
        onDark ? 'border-bone/30' : 'border-ink/15'
      }`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-[3px] left-[3px] w-[calc(50%-3px)] rounded-full transition-transform duration-700 ease-quiet"
        style={{
          background: onDark ? 'rgb(255 255 255 / 0.16)' : 'rgb(var(--accent) / 0.12)',
          border: onDark ? '1px solid rgb(255 255 255 / 0.3)' : '1px solid rgb(var(--accent) / 0.3)',
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
            className={`relative z-10 whitespace-nowrap rounded-full uppercase transition-opacity duration-400 ${
              compact ? 'px-3 py-1.5 text-[0.62rem] tracking-[0.14em]' : 'px-4 py-2 text-micro'
            } ${onDark ? 'text-bone' : 'text-ink'} ${
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

  // Home and the property pages open on a full-bleed dark hero; contact does not.
  // Over a hero the header inverts to bone, and returns to ink once it gains its ground.
  const hasHero = pathname === '/' || /^\/(exclusive|urban)$/.test(pathname);
  const onDark = hasHero && !stuck;

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
            ? 'border-ink/10 bg-limestone/85 backdrop-blur-xl backdrop-saturate-150'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="shell flex h-[72px] items-center justify-between gap-6 md:h-20">
          <Link to="/" className="flex items-center gap-3" aria-label="Divic, home">
            <SwanMark
              className={`h-9 w-8 transition-colors duration-400 ${onDark ? 'text-bone' : 'text-ink'}`}
              showDisc={false}
            />
            <span className="flex flex-col leading-none">
              <span
                className={`font-display text-lg font-normal uppercase tracking-[0.14em] transition-colors duration-400 ${
                  onDark ? 'text-bone' : 'text-ink'
                }`}
              >
                Divic
              </span>
              <span
                className={`mt-1 text-[0.56rem] uppercase tracking-[0.3em] transition-colors duration-400 ${
                  onDark ? 'text-bone/60' : 'text-mute'
                }`}
              >
                Festac, Lagos
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative py-1 text-micro uppercase font-medium transition-colors duration-400 ${
                    onDark
                      ? isActive
                        ? 'text-bone'
                        : 'text-bone/65 hover:text-bone'
                      : isActive
                        ? 'text-ink'
                        : 'text-slate hover:text-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <PropertySwitcher onDark={onDark} />
            </div>
            <div className="sm:hidden">
              <PropertySwitcher compact onDark={onDark} />
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="flex h-11 w-11 items-center justify-center lg:hidden"
            >
              <span
                className={`relative block h-px w-6 before:absolute before:-top-2 before:block before:h-px before:w-6 before:content-[''] after:absolute after:top-2 after:block after:h-px after:w-6 after:content-[''] ${
                  onDark
                    ? 'bg-bone before:bg-bone after:bg-bone'
                    : 'bg-ink before:bg-ink after:bg-ink'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-center gap-2 bg-limestone px-gutter lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="absolute right-gutter top-6 text-micro uppercase"
            style={{ color: 'rgb(var(--accent))' }}
          >
            Close
          </button>
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className="py-2 font-display text-d3">
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </>
  );
}
