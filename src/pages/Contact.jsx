import { Link } from 'react-router-dom';
import { BRAND } from '../data/properties';
import { useProperty } from '../context/PropertyContext';
import { SectionHead, SpecList } from '../components/primitives';

export default function Contact() {
  const { properties } = useProperty();
  return (
    <>
      <section className="shell pb-8 pt-40">
        <SectionHead
          title={
            <>
              Two houses,
              <br />a few minutes apart.
            </>
          }
          lead="Each branch keeps its own desk. Call the one you want to stay at, or message the brand on WhatsApp, and we will point you the right way."
        />
      </section>

      <section className="shell pb-section pt-12">
        <div className="grid gap-14 lg:grid-cols-12">
          {/* directory */}
          <div className="flex flex-col gap-12 lg:col-span-5">
            {properties.map((p) => {
              /* Both houses appear on this page at once, so each block carries its own
                 accent rather than inheriting the document's. Values match the tokens
                 in index.css. */
              const accentVars =
                p.id === 'urban'
                  ? { '--accent': '143 90 40', '--accent-lift': '176 113 58' }
                  : { '--accent': '119 100 39', '--accent-lift': '156 132 56' };
              return (
                <div key={p.id} style={accentVars}>
                    <p className="eyebrow">{p.displayName}</p>
                    <p className="mt-3 font-display text-d3">{p.character}</p>
                    <SpecList
                      className="mt-6"
                      items={[
                        { label: 'Address', value: p.address },
                        { label: 'Telephone', value: p.phone },
                        { label: 'Position', value: p.coords },
                      ]}
                    />
                    <div className="mt-6 flex flex-wrap gap-6">
                      <a href={p.mapUrl} target="_blank" rel="noopener noreferrer" className="link-quiet">
                        Directions
                      </a>
                      <a href={`tel:${p.phone}`} className="link-quiet">
                        Call this branch
                      </a>
                    </div>
                </div>
              );
            })}


          </div>

          {/* the reservation flow lives on its own page; this points at it */}
          <div className="lg:col-span-6 lg:col-start-7">
            <div className="border border-ink/10 bg-shell p-8 lg:p-12">
              <p className="eyebrow">Reservations</p>
              <h3 className="mt-4 font-display text-d3">Request a stay</h3>
              <p className="prose-body mt-4">
                Choose your dates and room and send a request. The house calls you back to
                confirm and hold it — nothing is charged on this site, and no room is held
                until they have spoken to you.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="/book" className="btn btn-solid">
                  Request a stay
                </Link>
                <Link to="/booking-status" className="btn btn-outline">
                  Check a request
                </Link>
              </div>
            </div>

            {/* WhatsApp is the brand's, not a branch's — it reaches whoever is on the
                other end for either house. */}
            <div className="mt-10 border-t border-ink/10 pt-8">
              <p className="text-sm text-mute">Message us</p>
              <a
                href={BRAND.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block font-display text-lg hover:underline"
              >
                WhatsApp {BRAND.whatsapp}
              </a>
              <p className="mt-6 text-sm text-mute">Follow</p>
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block font-display text-lg hover:underline"
              >
                @{BRAND.instagramHandle}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
