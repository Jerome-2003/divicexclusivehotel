import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useProperty } from '../context/PropertyContext';
import { BRAND } from '../data/properties';
import Logo from './Logo';

/**
 * The branch switcher is the brand's persistent pivot: present at every scroll position,
 * on every breakpoint, never folded into the menu. Switching re-themes the document and
 * navigates to that branch — it is a change of place, not a filter.
 */
function BranchSwitcher({ compact = false, onDark = false }) {
  const { propertyId, choose, properties } = useProperty();
  return (
    <div
      role="tablist"
      aria-label="Choose a branch"
      className={`relative inline-flex rounded-full border p-[3px] transition-colors duration-400 ${
        onDark ? 'border-bone/40' : 'border-ink/15'
      }`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-[3px] left-[3px] w-[calc(50%-3px)] rounded-full transition-transform duration-700 ease-quiet"
        style={{
          background: onDark ? 'rgb(251 248 242 / 0.22)' : 'rgb(var(--accent) / 0.14)',
          border: `1px solid ${onDark ? 'rgb(251 248 242 / 0.45)' : 'rgb(var(--accent) / 0.45)'}`,
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
            } ${onDark ? 'text-bone' : 'text-ink'} ${
              active ? 'font-semibold opacity-100' : 'font-medium opacity-60 hover:opacity-85'
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
  const { properties } = useProperty();

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  /* The branch pages open on a full-bleed photograph; contact and booking start on the
     page's own ground. Over a photograph the header inverts to near-white, and returns
     to ink once it has a ground of its own. */
  const overPhotograph = /^\/(exclusive|urban)$/.test(pathname);
  const onDark = overPhotograph && !stuck;

  const nav = [
    ...properties.map((p) => ({ to: `/${p.id}`, label: p.shortName })),
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <a href="#main" className="sr-only-focusable btn btn-solid absolute left-4 top-4 z-[200]">
        Skip to content
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-400 ease-quiet ${
          stuck
            ? 'border-ink/10 bg-alabaster/90 backdrop-blur-xl backdrop-saturate-150'
            : 'border-transparent bg-transparent'
        }`}
      >
        <div className="shell flex h-[72px] items-center justify-between gap-6 md:h-20">
          <Link to="/" className="flex items-center gap-3" aria-label={`${BRAND.name}, home`}>
            <Logo variant="mark" priority plate className="h-9 w-auto" />
            <span className="flex flex-col leading-none">
              <span
                className={`font-display text-lg font-normal uppercase tracking-[0.14em] transition-colors duration-400 ${
                  onDark ? 'text-bone' : 'text-ink'
                }`}
              >
                Divic
              </span>
              <span
                className={`mt-1 text-[0.72rem] transition-colors duration-400 ${
                  onDark ? 'text-bone/70' : 'text-mute'
                }`}
              >
                Exclusive Hotels
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-9 lg:flex" aria-label="Primary">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `relative py-1 text-sm font-medium transition-colors duration-400 ${
                    onDark
                      ? isActive ? 'text-bone' : 'text-bone/70 hover:text-bone'
                      : isActive ? 'text-ink' : 'text-slate hover:text-ink'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <BranchSwitcher onDark={onDark} />
            </div>
            <div className="sm:hidden">
              <BranchSwitcher compact onDark={onDark} />
            </div>

            {/* the one action that follows the guest everywhere */}
            <Link
              to="/book"
              className={`hidden whitespace-nowrap px-5 py-2.5 text-[0.9375rem] font-medium
                          transition-colors duration-400 ease-quiet sm:inline-flex ${
                            onDark
                              ? 'border border-bone/50 text-bone hover:bg-bone hover:text-ink'
                              : 'text-alabaster'
                          }`}
              style={onDark ? undefined : { background: 'rgb(var(--accent))' }}
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
        <div className="fixed inset-0 z-[60] flex flex-col justify-center gap-2 bg-alabaster px-gutter lg:hidden">
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
    </>
  );
}
