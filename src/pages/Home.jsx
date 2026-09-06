import { Link } from 'react-router-dom';
import { useProperty } from '../context/PropertyContext';
import { PROPERTY_LIST } from '../data/properties';
import { Plate, Reveal, SectionHead } from '../components/primitives';

/* One half of the split hero. Each carries its own accent, so the two read as
   different places while sharing every other rule. */
function PropertyPanel({ property, index }) {
  const { choose } = useProperty();
  const accentVars =
    property.id === 'urban'
      ? { '--accent': '180 84 58', '--accent-deep': '138 61 40' }
      : { '--accent': '91 86 56', '--accent-deep': '62 58 36' };

  return (
    <article
      style={accentVars}
      className="group relative flex min-h-[62vh] flex-col justify-end overflow-hidden lg:min-h-0"
    >
      <Plate
        src={property.heroImage}
        alt={`${property.name}, Festac`}
        priority={index === 0}
        className="absolute inset-0"
        imgClassName="transition-transform duration-1100 ease-quiet group-hover:scale-[1.03]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-20 bg-gradient-to-b from-obsidian/50 via-obsidian/15 to-obsidian/88"
      />

      <div className="relative z-30 flex flex-col gap-4 p-gutter pb-12">
        <p className="text-micro uppercase" style={{ color: '#E8D9AE' }}>
          {property.roomCount} rooms &middot; {property.character}
        </p>
        <h2 className="max-w-[12ch] font-display text-d1 font-light text-bone">{property.name}</h2>
        <p className="max-w-[38ch] text-bone/75">{property.tagline}</p>
        <Link
          to={`/${property.slug}`}
          onClick={() => choose(property.id)}
          className="btn btn-onDark mt-2 self-start"
        >
          Enter this house
        </Link>
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <>
      {/* ---------- split hero: the choice comes first ---------- */}
      <section aria-label="Choose a house" className="relative">
        <div className="grid min-h-[92svh] grid-cols-1 lg:grid-cols-2">
          {PROPERTY_LIST.map((p, i) => (
            <PropertyPanel key={p.id} property={p} index={i} />
          ))}
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-28 z-40 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex"
        >
          <span className="text-micro uppercase text-bone/70">Two houses, one street</span>
        </div>
      </section>

      {/* ---------- the brand ---------- */}
      <section className="section shell">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHead
              eyebrow="Divic"
              title={
                <>
                  One standard,
                  <br />
                  two ways to stay.
                </>
              }
              lead="Divic runs two houses a few minutes apart in Festac. They share a kitchen brigade, a linen supplier and a way of doing things — and almost nothing else. One is for disappearing. The other is for being out."
            />
          </div>
          <div className="flex flex-col justify-end gap-6 lg:col-span-4 lg:col-start-9">
            <p className="prose-body">
              Both houses are independently run, with their own front desk, their own rates and
              their own inventory. Booking one tells you nothing about the other — which is the
              point.
            </p>
            <Link to="/contact" className="link-quiet self-start">
              Talk to us &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- how they differ ---------- */}
      <section className="section bg-chalk">
        <div className="shell">
          <SectionHead
            eyebrow="Choosing"
            title="Which house is yours"
            align="center"
            className="mx-auto max-w-2xl"
          />

          <div className="mt-16 grid gap-px overflow-hidden bg-ink/10 md:grid-cols-2">
            {PROPERTY_LIST.map((p, i) => {
              const accentVars =
                p.id === 'urban'
                  ? { '--accent': '180 84 58', '--accent-deep': '138 61 40' }
                  : { '--accent': '91 86 56', '--accent-deep': '62 58 36' };
              return (
                <Reveal key={p.id} delay={i * 90}>
                  <div style={accentVars} className="flex h-full flex-col gap-6 bg-chalk p-8 lg:p-12">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="font-display text-d3">{p.name}</h3>
                      <span className="text-micro uppercase text-mute">{p.roomCount} rooms</span>
                    </div>
                    <hr className="rule-short" />
                    <p className="prose-body flex-grow">{p.intro}</p>
                    <p className="text-sm italic text-slate">{p.stayPitch}</p>
                    <Link to={`/${p.slug}`} className="link-quiet self-start">
                      Rooms &amp; rates &rarr;
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- what never changes ---------- */}
      <section className="section bg-obsidian text-bone">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="text-micro uppercase" style={{ color: '#C9A961' }}>
              The Divic standard
            </p>
            <h2 className="mt-4 font-display text-d2 font-light">
              What does not change between them
            </h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <dl className="flex flex-col">
              {[
                ['One brigade', 'The same kitchen team, trained together and rotated between houses.'],
                ['One standard of room', 'Same linen, same beds, same water pressure, whichever door you walk through.'],
                ['One front desk culture', 'Answered in person, day or night. No hold music.'],
                ['One key', 'A Divic guest at either house is known at both.'],
              ].map(([term, detail]) => (
                <div key={term} className="border-t border-bone/15 py-6">
                  <dt className="font-display text-lg">{term}</dt>
                  <dd className="mt-1.5 max-w-measure text-sm text-bone/60">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
