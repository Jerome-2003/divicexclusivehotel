import { Link } from 'react-router-dom';
import { BRAND } from '../data/properties';
import { useProperty } from '../context/PropertyContext';
import Logo from './Logo';

/**
 * The footer is the one place both branches always appear together — it is a directory,
 * not a feature surface, so it stays outside the branch switch.
 *
 * The brand's WhatsApp reaches either branch; the landlines are branch-specific and come
 * from the PMS, so each is listed against its own house.
 */
export default function Footer() {
  const { properties } = useProperty();
  return (
    <footer className="border-t border-ink/10 bg-shell text-ink">
      <div className="shell py-section">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo variant="full" alt={BRAND.name} plate className="h-24 w-auto" />
            <p className="mt-5 text-sm text-mute">{BRAND.line}</p>
          </div>

          {properties.map((p) => (
            <div key={p.id} className="lg:col-span-3">
              <p className="font-display text-lg">{p.displayName}</p>
              <p className="mt-3 text-sm text-slate">{p.address}</p>
              <p className="mt-1 text-sm text-slate">
                <a href={`tel:${p.phone.replace(/\s/g, '')}`} className="hover:text-ink">
                  {p.phone}
                </a>
              </p>
              <Link
                to={`/${p.id}`}
                className="mt-4 inline-flex text-sm text-mute underline-offset-4 hover:text-ink hover:underline"
              >
                View this branch
              </Link>
            </div>
          ))}

          <div className="lg:col-span-2">
            <p className="font-display text-lg">Reach us</p>
            <div className="mt-3 flex flex-col gap-2 text-sm text-slate">
              <a
                href={BRAND.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink"
              >
                WhatsApp {BRAND.whatsapp}
              </a>
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink"
              >
                @{BRAND.instagramHandle}
              </a>
              <Link to="/contact" className="hover:text-ink">
                Contact
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-ink/10 pt-6 text-sm text-mute sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} {BRAND.name}</span>
          <span>Festac, Lagos</span>
        </div>
      </div>
    </footer>
  );
}
