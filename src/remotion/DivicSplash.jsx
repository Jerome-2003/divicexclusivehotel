import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  BEAK,
  BODY,
  DISC,
  HEAD,
  NECK,
  SPLASH_COLORS,
  WATERLINE,
  WING,
  WING_PIVOT,
} from '../lib/swan-paths';

/* ============================================================
   DIVIC — SPLASH
   150 frames at 30fps. Square composition: the Player scales it to fit any
   viewport and letterboxes against black, and since the background *is* black
   the letterbox is invisible. One layout serves phone and desktop.

   0–8      black
   9–74     the swan travels in from off-canvas, wings beating
   45–72    the gold sun rises behind the landing point, finishing just before it arrives
   75–98    arrival: ease-out into a spring settle, flap decaying to nothing
   99–125   ripples spread, and the wordmark forms in their wake
   126–143  hold
   144–150  fade out to the site
   ============================================================ */

export const SPLASH_DURATION_IN_FRAMES = 150;
export const SPLASH_FPS = 30;
const SIZE = 1080;

/* Places the mark's own coordinate space inside the square composition.
   Scaled to leave the reference lockup's breathing room around the mark rather than
   filling the frame — the logo is generous with margin and the splash should be too. */
const MARK_SCALE = 0.72;
const MARK_DX = 338;
const MARK_DY = 150;
const CENTRE = { x: 540, y: 373 };

/* Ripple origin: the waterline, mapped into composition space. */
const ORIGIN = {
  x: MARK_DX + MARK_SCALE * WATERLINE.x,
  y: MARK_DY + MARK_SCALE * WATERLINE.y,
};

const REVEAL_RADIUS = 400;

export const DivicSplash = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  /* ---------- 1. travel (frames 9–75) ---------- */
  const travel = interpolate(frame, [9, 75], [0, 1], {
    easing: Easing.bezier(0.33, 0.0, 0.2, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* ---------- 2. settle: a spring overshoot once it lands ---------- */
  const settle = spring({
    frame: frame - 75,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 120 },
  });

  const dx = interpolate(travel, [0, 1], [-430, 0]);
  // a shallow arc rather than a ruler-straight line
  const arc = Math.sin(travel * Math.PI) * -46;
  const dy = interpolate(travel, [0, 1], [300, 0]) + arc;
  const scale = interpolate(travel, [0, 1], [0.12, 1]) + (settle - 1) * 0.035;
  const bank = interpolate(travel, [0, 1], [-6, 0]);

  /* ---------- 3. wingbeat: amplitude decays as it settles ---------- */
  const flapAmp = interpolate(frame, [9, 68, 88], [18, 15, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const flapFreq = interpolate(frame, [9, 95], [0.42, 0.2], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const wingAngle = Math.sin(frame * flapFreq) * flapAmp;
  // the body answers the wing, a beat behind
  const bodyBob = Math.sin(frame * flapFreq - 0.9) * (flapAmp * 0.22);
  // and dips once as the weight lands
  const landingDip = interpolate(frame, [75, 84, 98], [0, 14, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* ---------- 4. the sun, rising behind the landing point ---------- */
  const sun = interpolate(frame, [45, 72], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const sunScale = interpolate(sun, [0, 1], [0.82, 1]);
  const sunRise = interpolate(sun, [0, 1], [26, 0]);

  /* ---------- 5. ripples, and the wordmark forming in their wake ---------- */
  const ripple = (delay) => {
    const t = interpolate(frame, [99 + delay, 126 + delay], [0, 1], {
      easing: Easing.out(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return {
      rx: 16 + t * 450,
      opacity: t === 0 ? 0 : interpolate(t, [0, 0.18, 1], [0, 0.55, 0]),
    };
  };

  // the mask trails just behind the leading crest, so the text forms in the wave's wake
  const revealRadius = interpolate(frame, [102, 128], [0, REVEAL_RADIUS], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  /* ---------- 6. exit ---------- */
  const exit = interpolate(frame, [144, 150], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const rings = [ripple(0), ripple(7), ripple(14)];

  return (
    <AbsoluteFill style={{ backgroundColor: SPLASH_COLORS.background }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ opacity: exit }}
        aria-hidden="true"
      >
        <defs>
          {/* the wordmark is revealed by an expanding disc, not a fade */}
          <mask id="divic-reveal">
            <circle cx={ORIGIN.x} cy={ORIGIN.y} r={revealRadius} fill="#fff" />
          </mask>
        </defs>

        {/* ripples on the waterline */}
        <g fill="none" stroke={SPLASH_COLORS.gold} strokeWidth={2.5}>
          {rings.map((r, i) => (
            <ellipse
              key={i}
              cx={ORIGIN.x}
              cy={ORIGIN.y}
              rx={r.rx}
              ry={r.rx * 0.16}
              opacity={r.opacity}
            />
          ))}
        </g>

        {/* the mark, in its own coordinate space */}
        <g transform={`translate(${MARK_DX} ${MARK_DY}) scale(${MARK_SCALE})`}>
          {/* the sun stays put and rises; only the swan travels */}
          <ellipse
            cx={DISC.cx}
            cy={DISC.cy + sunRise}
            rx={DISC.rx * sunScale}
            ry={DISC.ry * sunScale}
            fill={SPLASH_COLORS.gold}
            opacity={sun}
          />
        </g>

        <g
          transform={
            `translate(${dx} ${dy + landingDip}) ` +
            `translate(${CENTRE.x} ${CENTRE.y}) scale(${scale}) rotate(${bank}) ` +
            `translate(${-CENTRE.x} ${-CENTRE.y})`
          }
          opacity={frame < 9 ? 0 : 1}
        >
          <g transform={`translate(${MARK_DX} ${MARK_DY}) scale(${MARK_SCALE})`}>
            <g transform={`translate(0 ${bodyBob})`} fill={SPLASH_COLORS.offWhite}>
              <path
                d={NECK.d}
                fill="none"
                stroke={SPLASH_COLORS.offWhite}
                strokeWidth={NECK.strokeWidth}
                strokeLinecap="round"
              />
              <circle cx={HEAD.cx} cy={HEAD.cy} r={HEAD.r} />
              <path d={BEAK} />
              <path d={BODY} />
              {/* flush with the body at rest; lifts clear of the back on the beat */}
              <path d={WING} transform={`rotate(${wingAngle} ${WING_PIVOT.x} ${WING_PIVOT.y})`} />
            </g>
          </g>
        </g>

        {/* the wordmark, from the reference lockup */}
        <g mask="url(#divic-reveal)" fill={SPLASH_COLORS.offWhite} textAnchor="middle">
          <text
            x={SIZE / 2}
            y={700}
            fontFamily="'Fraunces Variable', Fraunces, Georgia, serif"
            fontSize={68}
            fontWeight={400}
          >
            Divic Exclusive
          </text>
          <text
            x={SIZE / 2}
            y={790}
            fontFamily="'Fraunces Variable', Fraunces, Georgia, serif"
            fontSize={78}
            fontWeight={400}
          >
            Hotel
          </text>
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export default DivicSplash;
