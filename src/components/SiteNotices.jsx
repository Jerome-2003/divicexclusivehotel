import { useEffect, useState } from 'react';
import { divic, resolveMediaUrl } from '../lib/divic-api';
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
  /* 'section' is one of the four types the PMS editor offers ("Section — a block of
     content"), and its own preview renders one exactly like a banner — there is no
     separate placement built for it anywhere, on either side. Left out here, a
     published section is marked "Live on the site" in the PMS and never appears on it. */
  const banners = live.filter((i) => i.type === 'banner' || i.type === 'announcement' || i.type === 'section');
  // One popup at a time, highest priority. Two at once is an ambush.
  const popup = live.find((i) => i.type === 'popup');

  return (
    <>
      {banners.length > 0 && (
        /* Both Header and HomeNav are `position: fixed; top: 0`, so they take no space
           in normal flow — anything that simply comes first in the DOM, as this used to,
           renders at the very top of the document and sits exactly where the nav already
           claims the pixels. The nav paints over it and it is 100% invisible on every
           route at every width, which is indistinguishable from "never appeared" to
           anyone who did not open dev tools. 85px clears the taller of the two navs
           (measured 73–83px across breakpoints) with a small margin; the page's own
           content keeps whatever top padding it already had, so a banner adds height
           rather than overlapping anything. */
        <div className="pt-[85px]">
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
        </div>
      )}

      {popup && <Popup item={popup} onDismiss={() => dismiss(popup.key)} />}
    </>
  );
}

/* A YouTube/Vimeo link needs an <iframe> to embed; a direct file link plays in
   a plain <video> tag. Detected from the URL, matching how the PMS editor
   decides the same thing, so a promo looks the same wherever it renders. */
function isEmbedVideo(url) {
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url || '');
}
function toEmbedUrl(url) {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([\w-]+)/);
  if (yt) return 'https://www.youtube.com/embed/' + yt[1];
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return 'https://player.vimeo.com/video/' + vm[1];
  return url;
}

function Popup({ item, onDismiss }) {
  const [shown, setShown] = useState(false);
  const href = safeHref(item.ctaHref);
  // Only render a mediaUrl that actually passes the same link-safety check as
  // any other href here — a stray javascript: or data: URL is the same
  // problem in this attribute as it is in ctaHref. safeHref runs first, on the
  // raw stored value, so the /-prefixed-or-https check is unaffected by what
  // resolveMediaUrl does next: stitching the API's own origin onto a path
  // that is relative to it, not to this site — otherwise the browser looks
  // for the file on this site's own origin and never finds it.
  const mediaUrl = item.mediaType && item.mediaType !== 'none'
    ? resolveMediaUrl(safeHref(item.mediaUrl))
    : null;

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
        {mediaUrl && (
          <div className="mb-6">
            {item.mediaType === 'image' && (
              <img src={mediaUrl} alt={item.caption || ''} className="h-40 w-full object-cover" />
            )}
            {item.mediaType === 'video' && (
              isEmbedVideo(mediaUrl)
                ? <iframe
                    src={toEmbedUrl(mediaUrl)}
                    title={item.caption || item.title}
                    allowFullScreen
                    className="aspect-video w-full border-0"
                  />
                : <video src={mediaUrl} controls className="w-full" />
            )}
            {item.caption && <p className="mt-2 text-sm text-mute">{item.caption}</p>}
          </div>
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
