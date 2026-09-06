/**
 * Line marks for the house facilities.
 *
 * Drawn here rather than pulled from an icon set: the stroke weight is matched to the
 * hairlines the rest of the page is built from, and nothing on this site should depend
 * on a CDN reaching the guest's browser.
 *
 * Matched on the words the hotel actually uses for its amenities, so a new amenity with
 * a familiar word gets its mark without anyone editing this file.
 */
const MARKS = {
  bar: (
    <>
      <path d="M5 5h14l-7 7.5V19" />
      <path d="M8.5 19h7" />
    </>
  ),
  pool: (
    <>
      <path d="M3 15.5c1.6 0 1.6 1.2 3.2 1.2s1.6-1.2 3.2-1.2 1.6 1.2 3.2 1.2 1.6-1.2 3.2-1.2 1.6 1.2 3.2 1.2" />
      <path d="M3 19c1.6 0 1.6 1.2 3.2 1.2S7.8 19 9.4 19s1.6 1.2 3.2 1.2S14.2 19 15.8 19s1.6 1.2 3.2 1.2" />
      <path d="M8 15V6a2 2 0 0 1 4 0v8" />
      <path d="M14 14V6a2 2 0 0 1 4 0v8" />
      <path d="M8 10h6" />
    </>
  ),
  gym: (
    <>
      <path d="M4 9v6M7 7v10M17 7v10M20 9v6" />
      <path d="M7 12h10" />
    </>
  ),
  restaurant: (
    <>
      <path d="M7 3v8a2 2 0 0 0 4 0V3" />
      <path d="M9 11v10" />
      <path d="M17 3c-1.6 1.4-2.4 3.1-2.4 5.2 0 1.6.8 2.5 2.4 2.8V21" />
    </>
  ),
  security: (
    <>
      <path d="M12 3 5 6v6c0 4.2 2.8 7.4 7 9 4.2-1.6 7-4.8 7-9V6l-7-3Z" strokeLinejoin="round" />
      <path d="m9.2 12 2 2.1 3.6-4" />
    </>
  ),
  reception: (
    <>
      <path d="M4 17h16" />
      <path d="M5.5 17a6.5 6.5 0 0 1 13 0" />
      <path d="M12 7.5V5" />
      <path d="M9.5 21h5" />
    </>
  ),
  laundry: (
    <>
      <path d="M12 3.5 12 7" />
      <path d="M12 7 4.5 13.5h15L12 7Z" strokeLinejoin="round" />
      <path d="M4.5 13.5h15V20h-15z" strokeLinejoin="round" />
    </>
  ),
  parking: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M10 16V8h2.6a2.6 2.6 0 0 1 0 5.2H10" />
    </>
  ),
  default: (
    <>
      <path d="M12 4 20 12 12 20 4 12Z" strokeLinejoin="round" />
    </>
  ),
};

/** The first word that matches wins, so 'Indoor bar' and 'The bar' land on the same mark. */
const RULES = [
  [/pool|swim/, 'pool'],
  [/gym|fitness/, 'gym'],
  [/restaurant|breakfast|dining|kitchen/, 'restaurant'],
  [/bar|lounge/, 'bar'],
  [/security|guard/, 'security'],
  [/reception|front desk|concierge|desk/, 'reception'],
  [/laundry|pressing|dry clean/, 'laundry'],
  [/parking|car/, 'parking'],
];

export default function AmenityIcon({ label = '', className = '' }) {
  const l = label.toLowerCase();
  const key = RULES.find(([re]) => re.test(l))?.[1] || 'default';
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {MARKS[key]}
    </svg>
  );
}
