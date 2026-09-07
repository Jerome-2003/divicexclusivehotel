import { useCallback, useState } from 'react';
import { Plate } from './primitives';
import { useCarousel } from '../lib/useCarousel';

/**
 * Several shots of the same place — three angles on the bar, two on the gym — belong in
 * one frame rather than spread across the page as if they were different rooms.
 *
 * Crossfade, auto-advancing, pausing whenever someone is looking at it deliberately
 * (hover or keyboard focus) so it never moves out from under them. Under
 * `prefers-reduced-motion` it does not advance on its own at all; the dots still work.
 *
 * `overlay` is drawn above the photographs and below the dots, which is where a caption
 * that sits *on* the image goes. When a caption occupies the bottom of the frame, move
 * the dots out of its way with `dotsClassName` rather than stacking the two.
 */
const DOTS_DEFAULT = 'bottom-4 left-1/2 -translate-x-1/2';

/* An image is a descriptor now, not a URL, so React needs telling what makes it unique. */
const keyOf = (src, i) => (typeof src === 'string' ? src : src?.src) || i;

export default function Slideshow({
  images,
  alt = '',
  className = '',
  interval = 4500,
  overlay = null,
  dotsClassName = DOTS_DEFAULT,
  zoom = false,
  priority = false,
  sizes = '100vw',
}) {
  const [paused, setPaused] = useState(false);
  const [index, setIndex, armed] = useCarousel({ length: images?.length || 0, interval, paused });
  const go = useCallback((i) => setIndex(i), [setIndex]);

  if (!images?.length) return null;

  const plate = `${className} ${zoom ? 'plate-zoom' : ''}`;

  if (images.length === 1) {
    return (
      <div className="relative">
        <Plate src={images[0]} alt={alt} priority={priority} sizes={sizes} className={plate} />
        {overlay}
      </div>
    );
  }

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {images.map((src, i) => (
        <Plate
          key={keyOf(src, i)}
          src={armed.has(i) ? src : null}
          sizes={sizes}
          alt={i === index ? alt : ''}
          priority={priority && i === 0}
          className={`absolute inset-0 transition-opacity duration-700 ease-quiet ${
            zoom ? 'plate-zoom' : ''
          } ${i === index ? 'opacity-100' : 'opacity-0'}`}
        />
      ))}
      {overlay}
      <div className={`absolute z-30 flex gap-2 ${dotsClassName}`}>
        {images.map((src, i) => (
          <button
            key={keyOf(src, i)}
            type="button"
            onClick={() => go(i)}
            aria-label={`Show photograph ${i + 1} of ${images.length}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all duration-400 ease-quiet ${
              i === index ? 'w-6 bg-bone' : 'w-1.5 bg-bone/50 hover:bg-bone/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
