import { useEffect, useRef, useState } from 'react';

/**
 * A media well that is designed rather than empty: the plate underneath is part of the
 * composition, so a slow, blocked or missing photograph never leaves a broken box.
 */
export function Plate({ src, alt = '', className = '', imgClassName = '', priority = false }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <figure className={`plate ${className}`}>
      {src && !failed && (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchpriority={priority ? 'high' : undefined}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={`${imgClassName} ${loaded ? 'is-loaded' : ''}`}
        />
      )}
    </figure>
  );
}

/** Reveals once, on entry, and never replays. */
export function Reveal({ children, delay = 0, as: Tag = 'div', className = '' }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return undefined;
    if (!('IntersectionObserver' in window)) {
      setSeen(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setSeen(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen]);

  return (
    <Tag
      ref={ref}
      className={`reveal ${seen ? 'is-in' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/** Section opener: eyebrow, heading, rule, optional lead. One shape, used everywhere. */
export function SectionHead({ eyebrow, title, lead, align = 'left', className = '' }) {
  const centered = align === 'center';
  return (
    <Reveal className={`${centered ? 'text-center' : ''} ${className}`}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h2 className="text-d2">{title}</h2>
      <hr className={`rule-short mt-6 ${centered ? 'mx-auto' : ''}`} />
      {lead && <p className={`lead mt-6 ${centered ? 'mx-auto' : ''}`}>{lead}</p>}
    </Reveal>
  );
}

/** A hairline-separated key/value list — used for room specs and location details. */
export function SpecList({ items, className = '', onDark = false }) {
  return (
    <dl className={`flex flex-col ${className}`}>
      {items.map((item) => (
        <div
          key={item.label}
          className={`flex items-baseline justify-between gap-6 border-t py-3 ${
            onDark ? 'border-bone/15' : 'border-ink/10'
          }`}
        >
          <dt className={`text-micro uppercase ${onDark ? 'text-bone/55' : 'text-mute'}`}>
            {item.label}
          </dt>
          <dd className={`text-right text-sm ${onDark ? 'text-bone' : 'text-ink'}`}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
