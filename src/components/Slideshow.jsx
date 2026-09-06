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
 */
export default function Slideshow({ images, alt = '', className = '', interval = 4500 }) {
  const [paused, setPaused] = useState(false);
  const [index, setIndex] = useCarousel({ length: images.length, interval, paused });
  const go = useCallback((i) => setIndex(i), [setIndex]);

  if (!images?.length) return null;
  if (images.length === 1) {
    return <Plate src={images[0]} alt={alt} className={className} />;
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
          key={src}
          src={src}
          alt={i === index ? alt : ''}
          priority={i === 0}
          className={`absolute inset-0 transition-opacity duration-700 ease-quiet ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-2">
        {images.map((src, i) => (
          <button
            key={src}
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
