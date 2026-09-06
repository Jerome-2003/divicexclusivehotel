import { Composition } from 'remotion';
import { DivicSplash, SPLASH_DURATION_IN_FRAMES, SPLASH_FPS } from './DivicSplash';

/**
 * Registers the splash so it can be opened in Remotion Studio and rendered to video:
 *
 *   npx remotion studio src/remotion/index.js
 *   npx remotion render src/remotion/index.js DivicSplash out/splash.mp4
 *
 * The site itself does not use this file — it mounts the same component through
 * @remotion/player in src/components/SplashScreen.jsx.
 */
export const RemotionRoot = () => (
  <Composition
    id="DivicSplash"
    component={DivicSplash}
    durationInFrames={SPLASH_DURATION_IN_FRAMES}
    fps={SPLASH_FPS}
    width={1080}
    height={1080}
  />
);

export default RemotionRoot;
