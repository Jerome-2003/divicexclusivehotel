import { useCallback, useEffect, useRef, useState } from 'react';
import Logo from './Logo';
import { BRAND } from '../data/properties';

/**
 * The entry sequence: the logo settles first, then the words come into focus under it.
 *
 * This replaced a Remotion composition. Remotion is a video toolchain — it shipped a
 * ~93 kB gzipped player and a licence obligation to draw two elements for four seconds.
 * Two CSS keyframes do the same job with nothing to download and nothing to license.
 *
 * It plays on every full page load. It used to be gated to once per browser session,
 * which meant that after the first visit it never appeared again — including for the
 * people who most wanted to see it. Moving between pages inside the site does not remount
 * this, so the sequence is the entrance to the site rather than something between rooms.
 *
 * Anyone who has asked for reduced motion gets the finished frame, held briefly, so
 * nothing flashes past.
 */
const RUN_MS = 3200;
const HOLD_MS = 700;

export default function SplashScreen() {
  const reduced = useRef(false);
  const [state, setState] = useState('running');

  const dismiss = useCallback(() => setState('leaving'), []);

  useEffect(() => {
    if (state === 'gone') return undefined;
    reduced.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // the page underneath is already mounted and interactive; this only covers it
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(dismiss, reduced.current ? HOLD_MS : RUN_MS);
    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [state, dismiss]);

  useEffect(() => {
    if (state !== 'leaving') return undefined;
    const timer = setTimeout(() => setState('gone'), 600);
    return () => clearTimeout(timer);
  }, [state]);

  if (state === 'gone') return null;

  const still = reduced.current;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-alabaster
                  transition-opacity duration-[600ms] ease-quiet ${
                    state === 'leaving' ? 'pointer-events-none opacity-0' : 'opacity-100'
                  }`}
      role="status"
      aria-live="polite"
      aria-label={`${BRAND.name}, loading`}
    >
      <Logo
        variant="mark"
        priority
        plate
        plateClassName={still ? '' : 'splash-mark'}
        className="h-[clamp(6rem,18vw,8.5rem)] w-auto"
      />

      <div className={`mt-7 text-center ${still ? '' : 'splash-words'}`}>
        <p className="font-display text-[clamp(1.4rem,4.6vw,2.1rem)] font-light leading-tight text-ink">
          Divic Exclusive Hotels
        </p>
        <p className="mt-2 text-sm text-mute">{BRAND.line}</p>
      </div>

      {/* One hairline that fills as the sequence runs — it says "wait", which is what a
          loading screen is for, without a spinner borrowed from an app. */}
      {!still && (
        <span aria-hidden="true" className="mt-9 block h-px w-24 overflow-hidden bg-ink/10">
          <span className="splash-rule block h-px w-full bg-accent" />
        </span>
      )}
    </div>
  );
}
