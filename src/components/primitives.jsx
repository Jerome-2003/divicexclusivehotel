import { useState } from 'react';

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

/**
 * Section opener.
 *
 * `label` is optional and deliberately rare: it appears only where it carries something
 * the heading does not. A label that restates the heading is decoration, so most
 * sections here have none.
 */
export function SectionHead({ label, title, lead, align = 'left', className = '' }) {
  const centered = align === 'center';
  return (
    <div className={`${centered ? 'text-center' : ''} ${className}`}>
      {label && <p className="eyebrow mb-3">{label}</p>}
      <h2 className="text-d2">{title}</h2>
      <hr className={`rule-short mt-6 ${centered ? 'mx-auto' : ''}`} />
      {lead && <p className={`lead mt-6 ${centered ? 'mx-auto' : ''}`}>{lead}</p>}
    </div>
  );
}

/**
 * A hairline-separated key/value list for room specs and location details.
 * Keys are set in sentence case: they are data, not signage.
 */
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
          <dt className={`text-sm ${onDark ? 'text-bone/55' : 'text-mute'}`}>{item.label}</dt>
          <dd className={`text-right text-sm ${onDark ? 'text-bone' : 'text-ink'}`}>
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
