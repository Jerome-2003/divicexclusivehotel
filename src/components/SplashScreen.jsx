import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { SPLASH_COLORS } from '../lib/swan-paths';

/**
 * The splash, as an actual loading screen.
 *
 * @remotion/player is a sizeable dependency for something that plays once, so it is code
 * split: this module ships only the overlay, and the player chunk is fetched just before
 * the splash runs. A returning visitor in the same session never downloads it at all.
 *
 * The site mounts underneath rather than waiting on this, so the splash covers a page that
 * is already interactive.
 *
 * Timing is driven by the player's own `ended` event, not a wall-clock timer started at
 * mount — otherwise the chunk download eats into the five seconds and the sequence gets
 * cut off before the wordmark forms.
 */

const PlayerHost = lazy(() => import('./SplashPlayer'));

const SESSION_KEY = 'divic:splash-seen';
const FADE_MS = 450;
const SAFETY_MS = 12000; // if the player never reports back, do not trap the guest

function seenThisSession() {
  try {
    return sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export default function SplashScreen({ onFinish }) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [show, setShow] = useState(() => !seenThisSession());
  const [leaving, setLeaving] = useState(false);
  const timers = useRef([]);
  const done = useRef(false);

  const dismiss = useCallback(() => {
    if (done.current) return;
    done.current = true;
    setLeaving(true);
    try {
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      /* private browsing */
    }
    timers.current.push(
      setTimeout(() => {
        setShow(false);
        onFinish?.();
      }, FADE_MS),
    );
  }, [onFinish]);

  useEffect(() => {
    if (!show) {
      onFinish?.();
      return undefined;
    }

    timers.current.push(setTimeout(dismiss, SAFETY_MS));

    const onKey = (e) => {
      if (['Escape', 'Enter', ' '].includes(e.key)) dismiss();
    };
    window.addEventListener('keydown', onKey);

    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [show, dismiss, onFinish]);

  // reduced motion: hold the finished logo briefly instead of performing it
  const handleReady = useCallback(() => {
    if (!reduced) return;
    timers.current.push(setTimeout(dismiss, 900));
  }, [reduced, dismiss]);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-label="Divic Exclusive Hotel"
      onClick={dismiss}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        background: SPLASH_COLORS.background,
        display: 'grid',
        placeItems: 'center',
        opacity: leaving ? 0 : 1,
        transition: `opacity ${FADE_MS}ms cubic-bezier(.16,1,.3,1)`,
        cursor: 'pointer',
      }}
    >
      <Suspense fallback={null}>
        <PlayerHost reduced={reduced} onEnded={dismiss} onReady={handleReady} />
      </Suspense>

      <button
        type="button"
        onClick={dismiss}
        style={{
          position: 'absolute',
          bottom: '6vh',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'none',
          border: 0,
          color: 'rgba(240,240,240,.45)',
          font: 'inherit',
          fontSize: '0.8125rem',
          cursor: 'pointer',
        }}
      >
        Skip
      </button>
    </div>
  );
}
