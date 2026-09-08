import { useEffect, useState } from 'react';
import { divic } from '../lib/divic-api';
import { useProperty } from '../context/PropertyContext';

/**
 * Promos and popups published from the hotel's own software.
 *
 * Two rules hold this together:
 *
 *  · Nothing here is ever rendered as HTML. The fields are plain text by design,
 *    because they are written by receptionists and shown to the public — an HTML
 *    field would be a stored-XSS hole with a friendly name.
 *  · If the endpoint fails, the site renders exactly as it would have. A promo
 *    must never be able to break the page it sits on.
 */

const DISMISSED_KEY = 'divic.dismissedNotices';

function readDismissed() {
  try {
    return JSON.parse(sessionStorage.getItem(DISMISSED_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Relative paths and https only. A `javascript:` href is the same problem in a hat. */
function safeHref(href) {
  if (!href) return null;
  const v = String(href).trim();
  if (v.startsWith('/') && !v.startsWith('//')) return v;
  if (/^https:\/\/[^\s]+$/i.test(v)) return v;
  return null;
}

export default function SiteNotices({ suppress = false }) {
  const { propertyId } = useProperty();
  const [items, setItems] = useState([]);
  const [dismissed, setDismissed] = useState(readDismissed);

  useEffect(() => {
    if (!divic.configured) return;
    const ac = new AbortController();
    divic
      .content({ location: propertyId, signal: ac.signal })
      .then((rows) => setItems(Array.isArray(rows) ? rows : []))
      .catch(() => setItems([]));
    return () => ac.abort();
  }, [propertyId]);

  const dismiss = (key) => {
    const next = [...new Set([...dismissed, key])];
    setDismissed(next);
    try { sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(next)); } catch { /* private mode */ }
  };

  if (suppress) return null;

  const live = items.filter((i) => !dismissed.includes(i.key));
  const banners = live.filter((i) => i.type === 'banner' || i.type === 'announcement');
  // One popup at a time, highest priority. Two at once is an ambush.
  const popup = live.find((i) => i.type === 'popup');

  return (
    <>
      {banners.map((b) => {
        const href = safeHref(b.ctaHref);
        return (
          <div key={b.key} className="border-b border-ink/10 bg-ink/[0.04]">
            <div className="shell flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
              <p className="text-sm">
                <span className="font-semibold">{b.title}</span>
                {b.body && <span className="text-slate"> — {b.body}</span>}
              </p>
              {href && b.ctaLabel && (
                <a href={href} className="link-quiet text-sm">{b.ctaLabel}</a>
              )}
              <button
                type="button"
                onClick={() => dismiss(b.key)}
                aria-label="Dismiss this notice"
                className="ml-auto text-sm text-mute hover:text-ink"
              >
                Dismiss
              </button>
            </div>
          </div>
        );
      })}

      {popup && <Popup item={popup} onDismiss={() => dismiss(popup.key)} />}
    </>
  );
}

function Popup({ item, onDismiss }) {
  const [shown, setShown] = useState(false);
  const href = safeHref(item.ctaHref);

  // A short delay so it never lands before the page is usable.
  useEffect(() => {
    const t = setTimeout(() => setShown(true), 1200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!shown) return;
    const esc = (e) => e.key === 'Escape' && onDismiss();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [shown, onDismiss]);

  if (!shown) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-5"
      onMouseDown={(e) => e.target === e.currentTarget && onDismiss()}
    >
      <div role="dialog" aria-modal="true" aria-label={item.title} className="w-full max-w-md bg-shell p-8">
        {item.imageUrl && (
          <img src={item.imageUrl} alt="" className="mb-6 h-40 w-full object-cover" />
        )}
        <h2 className="font-display text-d3">{item.title}</h2>
        {item.body && <p className="prose-body mt-3 text-sm">{item.body}</p>}
        <div className="mt-7 flex flex-wrap gap-4">
          {href && item.ctaLabel && (
            <a href={href} onClick={onDismiss} className="btn btn-solid">{item.ctaLabel}</a>
          )}
          <button type="button" onClick={onDismiss} className="btn btn-outline">
            No thank you
          </button>
        </div>
      </div>
    </div>
  );
}
