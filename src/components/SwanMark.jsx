/**
 * The Divic swan, drawn as vector so every part can be animated or recoloured.
 * `tone` controls the disc behind the bird: 'gold' for the mark as supplied,
 * 'accent' to let it take the active property's colour.
 */
export default function SwanMark({ className = '', tone = 'gold', showDisc = true, title }) {
  const disc = tone === 'accent' ? 'rgb(var(--accent) / 0.9)' : '#C9A961';
  return (
    <svg
      viewBox="-20 0 600 620"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : 'true'}
    >
      {showDisc && <ellipse cx="350" cy="252" rx="210" ry="252" fill={disc} />}
      {/* neck and head: the tall open S, with the disc showing through the sliver */}
      <path
        d="M350 445 C334 378 298 348 296 282 C294 214 306 166 344 156 C384 146 408 182 398 226"
        fill="none"
        stroke="currentColor"
        strokeWidth="54"
        strokeLinecap="round"
      />
      <circle cx="398" cy="226" r="31" fill="currentColor" />
      <path d="M414 206 L474 232 L412 252 Z" fill="currentColor" />
      {/* body, tail point at the left */}
      <path
        d="M0 300 C24 330 30 356 22 380
           C8 470 96 598 250 598
           C400 598 490 520 490 430
           C490 340 410 290 300 290
           C200 290 110 306 60 306
           C34 306 12 304 0 300 Z"
        fill="currentColor"
      />
    </svg>
  );
}
