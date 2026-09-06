import { Link } from 'react-router-dom';
import { BRAND, PROPERTY_LIST } from '../data/properties';
import SwanMark from './SwanMark';

/**
 * The footer is the one place both properties always appear together — it is a
 * directory, not a feature surface, so it stays outside the property switch.
 */
export default function Footer() {
  return (
    <footer className="bg-obsidian text-bone">
      <div className="shell py-section">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SwanMark className="h-12 w-11 text-bone" showDisc={false} />
            <p className="mt-5 font-display text-d3">{BRAND.name}</p>
            <p className="mt-2 text-micro uppercase text-bone/50">{BRAND.line}</p>
          </div>

          {PROPERTY_LIST.map((p) => (
            <div key={p.id} className="lg:col-span-3">
              <p className="text-micro uppercase" style={{ color: '#C9A961' }}>
                {p.name}
              </p>
              <p className="mt-3 text-sm text-bone/70">{p.address}</p>
              <p className="mt-1 text-sm text-bone/70">
                <a href={`tel:${p.phone.replace(/\s/g, '')}`} className="hover:text-bone">
                  {p.phone}
                </a>
              </p>
              <p className="mt-1 text-sm text-bone/70">
                <a href={`mailto:${p.email}`} className="hover:text-bone">
                  {p.email}
                </a>
              </p>
              <Link
                to={`/${p.slug}`}
                className="mt-4 inline-flex text-micro uppercase text-bone/60 underline-offset-4 hover:text-bone hover:underline"
              >
                {p.roomCount} rooms &middot; View house
              </Link>
            </div>
          ))}

          <div className="lg:col-span-2">
            <p className="text-micro uppercase" style={{ color: '#C9A961' }}>
              Elsewhere
            </p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-bone/70">
              <a href={BRAND.instagram} className="hover:text-bone">
                Instagram
              </a>
              <Link to="/contact" className="hover:text-bone">
                Contact
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-bone/15 pt-6 text-micro uppercase text-bone/40 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Divic</span>
          <span>Festac, Lagos</span>
        </div>
      </div>
    </footer>
  );
}
