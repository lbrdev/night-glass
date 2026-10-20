// Night Glass for Tailwind CSS v3: tailwind.config.js -> presets: [require('./night-glass/tailwind.preset.js')]
// Variables and components come from night-glass.css: include it in the global CSS.
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)', fg: 'var(--fg)', fg2: 'var(--fg2)', dim: 'var(--dim)', mute: 'var(--mute)', faint: 'var(--faint)',
        line: 'var(--line)', line2: 'var(--line2)', card: 'var(--card)', card2: 'var(--card2)', field: 'var(--field)',
        acc: 'rgb(var(--acc-rgb) / <alpha-value>)', 'on-acc': 'var(--on-acc)',
        good: 'var(--good)', warn: 'var(--warn)', bad: 'var(--bad)',
      },
      fontFamily: { sans: ['var(--font)'], display: ['var(--font-display)'], mono: ['var(--font-mono)'] },
      borderRadius: { xs: 'var(--r-xs)', sm: 'var(--r-sm)', card: 'var(--r)', lg: 'var(--r-lg)', xl: 'var(--r-xl)' },
      letterSpacing: { display: '-0.035em', title: '-0.03em', tight: '-0.025em' },
      transitionTimingFunction: { spring: 'var(--ease-spring)', pop: 'var(--ease-pop)', 'out-soft': 'var(--ease-out)', calm: 'var(--ease-calm)' },
      spacing: { page: 'var(--pad)', section: 'var(--section)' },
      maxWidth: { page: 'var(--maxw)', text: 'var(--maxw-text)' },
    },
  },
};
