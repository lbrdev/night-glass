# Night Glass

A design system for Claude Code: a dark product showcase where the product is a living character and the interface around it is quiet glass.

- near-black background, a single accent, Inter Tight / Inter (Google Fonts, Cyrillic included);
- "liquid glass" buttons: a highlight and parallax that follow the cursor, a springy press;
- charts, meters, tabs, a tab bar, tables and forms for dashboards in the same style;
- a floating glass header, generous spacing, cascading reveal of blocks;
- a live 3D object in the hero on three.js: it floats up, looks at the cursor, spins with inertia and lights the page with its screen;
- tokens as CSS variables, Tailwind v3/v4 presets, a shadcn/ui theme.

**Live demos:** https://lbrdev.github.io/night-glass/ — the Orbi showcase and three pages with every component (blocks 01–45).

## Install in Claude Code

In Claude Code (terminal or app), run two commands:

```
/plugin marketplace add lbrdev/night-glass
/plugin install night-glass@night-glass
```

The same from a regular shell:

```bash
claude plugin marketplace add lbrdev/night-glass
```

```bash
claude plugin install night-glass@night-glass
```

After Claude Code restarts, the skill loads on its own. Just ask: "make a landing page in the Night Glass style".

To update to a new version:

```bash
claude plugin update night-glass@night-glass
```

### Without the plugin

You can also install the skill by simply copying the folder:

```bash
git clone https://github.com/lbrdev/night-glass && cp -r night-glass/skills/night-glass ~/.claude/skills/
```

## What's inside

```
skills/night-glass/
  SKILL.md                 how Claude works with the system
  reference/DESIGN.md      principles, tokens, components, do's and don'ts
  assets/night-glass.css   tokens + all components
  assets/night-glass.js    button highlight and parallax, reveal, header, setGlow, toast
  assets/night-glass-3d.js 3D hero: mountHero(canvas, { model: 'puck' | 'slab' | your own })
  assets/night-glass-charts.js charts: lines, bars, donut, sparkline, table view
  assets/tailwind.css      Tailwind v4 (@theme)
  assets/tailwind.preset.js  Tailwind v3
  assets/shadcn-theme.css  shadcn/ui variables (Flexnative @flx blocks fit)
  templates/landing.html   showcase skeleton with placeholders
  demo/index.html          demo on the fictional Orbi product
  demo/kit.html            test page: tokens, buttons, forms, 3D, showcase sections
  demo/kit-2.html          test page 2: charts, tabs, tab bar, table, dashboard
  demo/kit-3.html          test page 3: dialogs, menus, toasts, site sections, app elements, 3D from .glb
```

## Try the demos

Modules and importmap don't work over `file://`, so you need any local server:

```bash
cd skills/night-glass && python -m http.server 8000
```

Then open `http://localhost:8000/demo/kit.html` and `http://localhost:8000/demo/kit-2.html` (all components) and `http://localhost:8000/demo/index.html` (the Orbi showcase).

## Tests

The repository has automated tests for the demo pages, built on Playwright Test:

```bash
npm i
```

```bash
npx playwright install chromium
```

```bash
npm run test:smoke
```

The smoke tests check that pages open without errors or horizontal scroll, and that dialogs, date menus, the dropdown and code sign-in work. The visual tests compare pages with a reference screenshot. The reference depends on fonts and the OS, so you create it once on your own machine:

```bash
npm run test:update
```

After that, `npm test` shows what changed on the pages. Live parts (3D, running bars, time) are masked.

## Your own 3D models

```js
const hero = await mountHero(canvas, { model: { url: 'product.glb', screen: 'Screen' } });
```

The model is centered and scaled automatically; if you give the name of the screen mesh, a live picture from the `screen` canvas is mapped onto it. For an example that loads your own file, see block 45 on `demo/kit-3.html`.

## License

MIT.
