/**
 * Divic Exclusive Hotels — off-white and gold.
 *
 * The ground is the off-white the logo itself sits on, and the gold is sampled from the
 * logo's own oval (#DFC896). That gold is far too light to carry type, so it is used for
 * fills and large marks only; a deeper gold does the reading work.
 *
 * The brand chassis is fixed; only the property accent varies. Accent colours are
 * exposed as CSS custom properties (set per property on <html data-property>) so no
 * component ever needs to know which property it is rendering.
 */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // grounds, lightest to deepest — the page, a raised panel, an inset well
        alabaster: '#FAF7F1',
        shell: '#F4EFE6',
        sand: '#E6DCC9',
        // type, strongest to quietest
        ink: '#221D16',
        slate: '#5B5348',
        mute: '#726A5A',
        // text over photography, where the ground is a dark scrim rather than the page
        bone: '#FBF8F2',
        // the brand metal: the logo's own gold, and a deeper one that can carry type
        gold: '#DFC896',
        'gold-deep': '#8A6B28',
        // per-property accents, resolved at runtime
        accent: 'rgb(var(--accent) / <alpha-value>)',
        'accent-lift': 'rgb(var(--accent-lift) / <alpha-value>)',
        'accent-deep': 'rgb(var(--accent-deep) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Fraunces Variable', 'Fraunces', 'Georgia', 'serif'],
        sans: ['Karla Variable', 'Karla', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // one scale, used everywhere
        micro: ['0.6875rem', { lineHeight: '1.5', letterSpacing: '0.18em' }],
        label: ['0.75rem', { lineHeight: '1.5', letterSpacing: '0.14em' }],
        body: ['1rem', { lineHeight: '1.7' }],
        lead: ['1.125rem', { lineHeight: '1.65' }],
        d1: ['clamp(2.75rem, 6vw, 5rem)', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        d2: ['clamp(2rem, 4vw, 3.25rem)', { lineHeight: '1.08', letterSpacing: '-0.018em' }],
        d3: ['clamp(1.5rem, 2.4vw, 2rem)', { lineHeight: '1.15', letterSpacing: '-0.012em' }],
      },
      maxWidth: { measure: '64ch', shell: '1360px' },
      spacing: { section: 'clamp(5rem, 11vh, 9rem)', gutter: 'clamp(1.25rem, 5vw, 5rem)' },
      transitionTimingFunction: { quiet: 'cubic-bezier(.16, 1, .3, 1)' },
      transitionDuration: { 400: '400ms', 700: '700ms', 1100: '1100ms' },
    },
  },
  plugins: [],
};
