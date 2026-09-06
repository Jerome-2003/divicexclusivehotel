import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { PROPERTIES, formatNGN } from '../data/properties';
import { useProperty } from '../context/PropertyContext';
import { Plate, Reveal, SectionHead, SpecList } from '../components/primitives';

/* One row per room type: image and copy trade sides down the page. The image is the
   card — no borders, no shadow. */
function RoomRow({ room, index }) {
  const flipped = index % 2 === 1;
  return (
    <Reveal>
      <article className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <Plate
          src={room.image}
          alt={room.name}
          className={`aspect-[16/11] lg:col-span-7 ${flipped ? 'lg:order-2 lg:col-start-6' : ''}`}
        />
        <div className={`flex flex-col gap-5 lg:col-span-4 ${flipped ? 'lg:order-1 lg:col-start-1' : 'lg:col-start-9'}`}>
          <p className="font-display text-lg italic" style={{ color: 'rgb(var(--accent))' }}>
            {String(index + 1).padStart(2, '0')}
          </p>
          <h3 className="font-display text-d3">{room.name}</h3>
          <p className="prose-body">{room.description}</p>

          <SpecList
            className="mt-1"
            items={[
              { label: 'Size', value: `${room.sizeSqm} m²` },
              { label: 'Sleeps', value: `${room.maxOccupancy} guests` },
              { label: 'Bed', value: room.bed },
              { label: 'In this house', value: `${room.count} rooms` },
            ]}
          />

          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-3xl" style={{ color: 'rgb(var(--accent))' }}>
              {formatNGN(room.baseRateNGN)}
            </span>
            <span className="text-micro uppercase text-mute">per night, from</span>
          </div>

          <Link to="/contact" className="link-quiet self-start">
            Enquire about this room &rarr;
          </Link>
        </div>
      </article>
    </Reveal>
  );
}

export default function Property() {
  const { slug } = useParams();
  const property = PROPERTIES[slug];
  const { choose, propertyId } = useProperty();

  // arriving directly at a property URL is itself a choice
  useEffect(() => {
    if (property && propertyId !== property.id) choose(property.id);
  }, [property, propertyId, choose]);

  useEffect(() => {
    if (property) document.title = `${property.name} — Festac, Lagos`;
  }, [property]);

  if (!property) return <Navigate to="/" replace />;

  const totalFrom = Math.min(...property.roomTypes.map((r) => r.baseRateNGN));

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="relative flex min-h-[78svh] items-end overflow-hidden">
        <Plate
          src={property.heroImage}
          alt={`${property.name}, Festac, Lagos`}
          priority
          className="absolute inset-0"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 z-20 bg-gradient-to-b from-obsidian/55 via-obsidian/20 to-obsidian/88"
        />
        <div className="shell relative z-30 pb-16 pt-32">
          <p className="text-micro uppercase" style={{ color: '#E8D9AE' }}>
            {property.character} &middot; {property.roomCount} rooms
          </p>
          <h1 className="mt-4 max-w-[14ch] font-display text-d1 font-light text-bone">
            {property.name}
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg text-bone/75">{property.tagline}</p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/contact" className="btn btn-onDark">
              Enquire about a stay
            </Link>
            <span className="text-micro uppercase text-bone/50">
              From {formatNGN(totalFrom)} per night
            </span>
          </div>
        </div>
      </section>

      {/* ---------- introduction ---------- */}
      <section className="section shell">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHead eyebrow="The house" title={property.intro} />
          </div>
          <div className="flex flex-col justify-end gap-6 lg:col-span-4 lg:col-start-9">
            <p className="prose-body">{property.stayPitch}</p>
            <SpecList
              items={[
                { label: 'Rooms', value: String(property.roomCount) },
                { label: 'Address', value: property.address },
                { label: 'Position', value: property.coords },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ---------- rooms ---------- */}
      <section className="section bg-chalk">
        <div className="shell">
          <SectionHead
            eyebrow="Rooms & rates"
            title={`Every room at ${property.name}`}
            lead={`${property.roomTypes.length} room types, ${property.roomCount} rooms in total. Rates shown are nightly, from — final pricing depends on dates and length of stay.`}
          />
          <div className="mt-16 flex flex-col gap-20 lg:gap-28">
            {property.roomTypes.map((room, i) => (
              <RoomRow key={room.id} room={room} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- amenities ---------- */}
      <section className="section shell">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHead eyebrow="Included" title="What comes with the room" />
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <dl className="grid gap-x-10 sm:grid-cols-2">
              {property.amenities.map((a) => (
                <div key={a.label} className="border-t border-ink/10 py-5">
                  <dt className="font-display text-lg">{a.label}</dt>
                  <dd className="mt-1 text-sm text-slate">{a.note}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ---------- gallery: asymmetric, not a grid of equal tiles ---------- */}
      <section className="section bg-chalk">
        <div className="shell">
          <SectionHead eyebrow="The place" title="A look around" />
          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
            <Reveal className="md:col-span-7">
              <Plate src={property.galleryImages[0]} alt="" className="aspect-[4/3]" />
            </Reveal>
            <Reveal delay={80} className="md:col-span-4 md:col-start-9 md:mt-16">
              <Plate src={property.galleryImages[1]} alt="" className="aspect-[3/4]" />
            </Reveal>
            <Reveal delay={40} className="md:col-span-4 md:col-start-2">
              <Plate src={property.galleryImages[2]} alt="" className="aspect-square" />
            </Reveal>
            <Reveal delay={120} className="md:col-span-6 md:col-start-7 md:-mt-12">
              <Plate src={property.galleryImages[3]} alt="" className="aspect-[16/10]" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------- closing ---------- */}
      <section className="section bg-obsidian text-bone">
        <div className="shell flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-micro uppercase" style={{ color: '#C9A961' }}>
              {property.name}
            </p>
            <h2 className="mt-4 max-w-[18ch] font-display text-d2 font-light">
              Come and see the room first.
            </h2>
          </div>
          <div className="flex flex-col gap-4">
            <Link to="/contact" className="btn btn-onDark">
              Enquire about a stay
            </Link>
            <a
              href={property.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-micro uppercase text-bone/50 underline-offset-4 hover:text-bone hover:underline"
            >
              {property.address}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
