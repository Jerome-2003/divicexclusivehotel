import { useEffect, useRef, useState } from 'react';

/**
 * Auto-advancing index, shared by the hero backgrounds and the gallery slideshows.
 *
 * Pauses whenever someone is looking at it deliberately, and does not advance at all
 * under `prefers-reduced-motion` — the dots still work, so nothing becomes unreachable.
 */
export function useCarousel({ length, interval = 5000, paused = false }) {
  const [index, setIndex] = useState(0);
  /* Which slides may fetch their photograph. A carousel is in the viewport from the
     start, so `loading="lazy"` does not hold any of them back — four hero shots meant
     four full-size downloads competing with first paint. Only the first is armed
     initially; the next is armed alongside whichever is showing, and nothing already
     seen is ever disarmed. */
  const [armed, setArmed] = useState(() => new Set([0]));
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  useEffect(() => {
    if (paused || reduced.current || length < 2) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % length), interval);
    return () => clearInterval(id);
  }, [paused, length, interval]);

  useEffect(() => {
    if (index >= length) setIndex(0);
  }, [index, length]);

  useEffect(() => {
    setArmed((prev) => {
      const next = (index + 1) % length;
      if (prev.has(index) && prev.has(next)) return prev;
      const grown = new Set(prev);
      grown.add(index);
      grown.add(next);
      return grown;
    });
  }, [index, length]);

  return [index, setIndex, armed];
}
