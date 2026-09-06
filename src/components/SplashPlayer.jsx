import { useEffect, useRef } from 'react';
import { Player } from '@remotion/player';
import { DivicSplash, SPLASH_DURATION_IN_FRAMES, SPLASH_FPS } from '../remotion/DivicSplash';

/**
 * Everything that pulls in @remotion/player lives here, so it lands in its own chunk.
 *
 * The composition is square. The Player scales it to fit whatever viewport it is given
 * and letterboxes the remainder; because the composition's own background is the same
 * near-black as the overlay, the letterbox is invisible. One layout serves a phone in
 * portrait and a desktop in landscape.
 */
export default function SplashPlayer({ reduced, onEnded, onReady }) {
  const ref = useRef(null);

  useEffect(() => {
    const player = ref.current;
    if (!player) return undefined;

    onReady?.();
    if (reduced) return undefined;

    const handleEnded = () => onEnded?.();
    player.addEventListener('ended', handleEnded);
    return () => player.removeEventListener('ended', handleEnded);
  }, [reduced, onEnded, onReady]);

  return (
    <Player
      ref={ref}
      component={DivicSplash}
      durationInFrames={SPLASH_DURATION_IN_FRAMES}
      fps={SPLASH_FPS}
      compositionWidth={1080}
      compositionHeight={1080}
      initialFrame={reduced ? SPLASH_DURATION_IN_FRAMES - 1 : 0}
      autoPlay={!reduced}
      /* The composition has no audio track. Without this the browser blocks autoplay on
         an unmuted player, opens an AudioContext it will not start, and Remotion mutes
         the player itself and warns — three console warnings for a silent animation.
         The Player's prop is `initiallyMuted`, not `muted`. */
      initiallyMuted
      /* Silences Remotion's licence notice in the console. It asserts that this use is
         licensed; see the note in README.md — Remotion is not MIT, and a company over
         Remotion's size threshold needs a paid licence. */
      acknowledgeRemotionLicense
      loop={false}
      controls={false}
      clickToPlay={false}
      doubleClickToFullscreen={false}
      spaceKeyToPlayOrPause={false}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
