---
name: night-glass
description: "The Night Glass design system: a dark product showcase with a near-black background, a single accent, Inter Tight/Inter, \"liquid glass\" buttons with a highlight that follows the cursor, a floating glass header, a live three.js 3D object in the hero (springs, turns toward the cursor, inertial spin, screen light on the background) and spring motion. Use when asked for \"a site/landing/page in the Night Glass style\", \"a dark glassy Apple-like landing\", \"a dark product showcase with a 3D hero\", or to restyle an existing page in this style. Provides tokens (CSS variables, Tailwind v3/v4, shadcn theme), components, behavior, a 3D hero and a starter template."
---

# Night Glass

A dark showcase where the product is a living character and the interface around it is quiet glass. Fonts are open (Google Fonts).

Skill files (`<skill>` = the folder with this SKILL.md):
- `reference/DESIGN.md` — the full description: principles, tokens, typography, layout, depth, shapes, components, do's and don'ts. **Read it before you start.**
- `assets/night-glass.css` — tokens + all components (`.nav .hero .btn .glass .card .tiles .split .vs .facts .steps .cards .rail .offer .tiers .faq .foot .sheet .toast .bubble .input .seg .sw .rv`).
- `assets/night-glass.js` — glass highlight that follows the cursor, `.rv` reveal, burger and section highlight in the header, `setGlow('r,g,b')`, `toast()`.
- `assets/night-glass-3d.js` — `mountHero(canvas, {model:'puck'|'slab'|builder, screen, anchor, onTap, onSpin, onPowered})` → `{setGlow, hop, screenChanged, project}`. Put the canvas under the whole hero (`<canvas class="hero-canvas">` as the first child of `.hero`) and pass the `.hero-stage` row as `anchor`: the object is framed in that row but can hop up behind the headline, text on top.
- `assets/night-glass-charts.js` — dependency-free SVG charts: `lineChart`, `barChart`, `donutChart`, `sparkline`, `dataTable` (tooltips, keyboard, entrance animation, table view). Series colors are `--chart-1…6`; a single series uses the accent.
- `assets/tailwind.css` (v4 `@theme`), `assets/tailwind.preset.js` (v3), `assets/shadcn-theme.css` (shadcn/ui variables).
- `templates/landing.html` — a showcase skeleton with placeholders (put the assets next to the page).
- `demo/index.html` — a complete live example (the fictional Orbi dial: 3D, modes, scenes, pricing, FAQ); it loads `../assets/`.
- `demo/kit.html` — a test page for all functionality: accent and glow switches, the token palette, typography, every button and glass, surfaces, forms, menu/sheet/toast/bubble, both 3D objects with events, the reveal cascade, all showcase sections, pricing and FAQ. Open it first to see the whole system: run `python -m http.server` from the skill folder and open `http://localhost:8000/demo/kit.html` (modules and importmap don't work over `file://`).
- `demo/kit-2.html` — the second test page (blocks 11–21): meters and charts with filters, tabs, tab bar, side menu, a sortable table, checkboxes/radios/slider/search, progress and skeletons, tooltips/avatars/counters, breadcrumbs/pagination/steps, banner/notifications/empty state, activity feed and code.
- `demo/kit-3.html` — the third test page (blocks 22 onward): dialogs, menus, toasts, accessibility, swatches and smooth FAQ; then site sections and app elements.

## How to work

1. **Context.** If the project has Impeccable, run `impeccable context` (see the impeccable skill); put a `DESIGN.md` in the project root (copy `reference/DESIGN.md`, change `name`, the accent and the description for the product) so that impeccable and its detector treat Night Glass as the project's law. Surface mode: showcase = Persuade, dashboard = Operate (same tokens, app scale).
2. **Foundation.**
   - Static site / no bundler: copy `assets/night-glass.css`, `night-glass.js` (and `night-glass-3d.js`) next to the page and start from `templates/landing.html`.
   - React/Next + Tailwind v4: import `night-glass.css` and `tailwind.css` in the global CSS; for v3 use the `tailwind.preset.js` preset. Component classes (`btn pri`, `nav`, `offer`) work in JSX too; utilities: `bg-card text-dim border-line rounded-card font-display tracking-display ease-spring`.
   - shadcn/ui and Flexnative blocks (`@flx`): first look for a ready block (`shadcn search @flx -q "pricing"` and so on), then include `shadcn-theme.css` after `night-glass.css` and put `class="dark"` on `<html>`; add `btn`/`btn pri` to the block's buttons, give containers 22/28 radii, and remove the blocks' shadows and extra borders.
3. **Accent.** One per product: `data-accent="iris|ember|mint|sky|rose|lime"` on `<html>`, or your own `--acc`/`--acc-rgb`/`--on-acc` (a light pastel, L≈75–85%).
4. **Hero.** Come up with the product's object (a device, a card, an app on a phone, a box) and make it a character:
   - Your own product model: `mountHero(canvas, { model: { url: 'model.glb', screen: 'ScreenMeshName' } })` — it centers and scales itself, and a live picture is laid onto the screen mesh (UV layout per the glTF standard; otherwise `flipY: true`). Call `hero.dispose()` before swapping the model.
   - 3D: `mountHero` with `'puck'` (a round dial/sensor: the rim follows the finger 1:1 around its face, clockwise = up; return `false` from `onSpin` for an end stop), `'slab'` (a phone/tablet/remote/card) or your own builder `(tex) => ({group, spinner?, screen, display, led?, size:{w,h}})`; the screen is a 2D canvas that you draw yourself (call `screenChanged()` after redrawing).
   - Tie actions to meaning: turning changes the value, a tap switches the mode, the mode changes the page's and the hero's `setGlow`. Short lines in `.bubble` (2–5 words, not over the headline and not over the main number).
   - Without WebGL, or for simple pages, use a CSS object (the `.dial` example in `demo/index.html`) + a `.flat` fallback look.
5. **Sections** in this order: hero → features (`.tiles` + `.facts`) → demo (`.split` / scenes) → before/after (`.vs`) → setup (`.steps`) → pricing (`.offer` + `.tiers`) → questions (`.faq`) → a one-line footer. Drop what you don't need, but don't add sections for their own sake (client logos, counters, testimonial carousels only if they're real).
6. **Copy** in the site's language, short. The hero headline is a two-line promise; the lead is gray with one phrase in `<b>`; the price goes on the main button ("Buy from $79"); the note under the buttons removes the main doubt. Go easy on dashes: the impeccable detector catches "AI cadence".
7. **Checks** (one pass, not a loop): desktop 1440 and phone 390 — screenshots, a clean console, no horizontal scroll, the hero assembles, the 3D spins, the burger opens. If Playwright is installed (`~/.claude/tools/playwright`, the `playwright` MCP), capture frame-by-frame animation series (0–3.6 s in 300–400 ms steps) and hovers: a plain screenshot can't verify motion. Then `impeccable detect <file>`.

## Data and apps (kit-2)

- **Charts** — `night-glass-charts.js`. Form first: a single number is a `.stat` tile (label, value, a signed change colored good/bad, a sparkline), a trend is a line, a comparison is bars, shares of a whole (up to 6) are a donut. One Y axis, never two scales. Color follows the series (`--chart-1…6` in a fixed order, the palette checked on a dark background with the dataviz validator); labels and values use text colors, not the series color. A legend from two series up, with one standout item labeled (the end of a line, the maximum), the rest in the tooltip and the table view (`dataTable`). Filters sit in one row above all the charts (`.filters`: a `.seg` period + `select.input`); while reloading, the charts hold their frame semi-transparent (`.chart.busy`).
- **Tabs** `.tabs[role=tablist]` (capsule) and `.tabs.line` (underline): `[role=tab][aria-controls]` + `[role=tabpanel]`; behavior and keyboard come from `initTabs()` in night-glass.js (it runs by itself; call it again for markup added later).
- **Tab bar** `.tabbar` — phones only (it hides itself above 900px); put the `.has-tabbar` class on `<body>` so the bottom of the page doesn't slide under the bar. 4–5 items, the current one with `aria-current="page"`, a `.count` counter.
- **Dashboard**: `.sidenav` (groups `h3`), `.tbl` in `.tbl-wrap` (numbers `.num`, sorting via `aria-sort`), `.pager`, `.crumbs`, `.stepper`, forms `.check` `.radio` `.range` `select.input` (turns itself into a glass dropdown on mouse devices; `data-native` keeps the native one) `.search`, `.progress`, `.sk`, `.spin`, `.ava`, `.count`, tooltips `data-tip="…"`, `.note.good|warn|bad` with an icon, `.banner`, `.empty`, `.timeline`, `.code`, `kbd`.

## Dialogs, menus, toasts, accessibility (kit-3)

- **Dialogs** — only the native `<dialog class="sheet">` (centered, at the bottom on phones) or `<dialog class="drawer">` (full-height on the right). Open with `data-open="id"` or `openDialog(id)` (→ a Promise with the close value); close with `data-close="value"` inside or `closeDialog(el, value)`. Focus inside, Esc, click on the backdrop, an inert background and focus return all come from the browser and the core. Confirmation: `await confirmDialog({ title, text, ok, danger: true })` → true/false; with `danger`, focus lands on "Cancel". Hand-made `div.scrim` is no longer needed.
- **Menus** — `<div class="menu-host"><button data-menu aria-controls="m1">…</button><div class="menu" id="m1" role="menu" hidden>` with `[role=menuitem]` items (icon, text, `<kbd>`, `.danger`, `.sep`, `.lbl`); `.menu.start` aligns to the left edge. Keyboard and closing are in the core.
- **Toasts** — `toast('text', { type: 'good'|'warn'|'bad', action: { label: 'Undo', onClick } })`: a stack of up to three, an icon on each, paused under the cursor; on pages with a tab bar the stack lifts above it.
- **Accessibility** — put `<a class="skip" href="#main">Skip to content</a>` as the first line of `<body>` and `<main id="main" tabindex="-1">`. Windows high-contrast mode and print are handled in the core; print gives a white page without the header, tab bar and 3D.

## Site sections (kit-3, blocks 27–37)

- **Articles** — `<article class="art">`: `.crumbs`, `.art-head` (eyebrow, h1, `.lead`, `.art-meta`), `.toc`, `.prose` (h2/h3, lists, `<blockquote>` with a large quote mark, `code`/`pre`, `hr`, `figure`), `.callout` with an icon. Width 760px, type size 17.5/1.72.
- **Trust** — `.quotes` (`figure.quote` cards), one large `.pull`, a `.logos` row (muted, brighten on hover), big `.numbers`.
- **Action** — a `.cta-band` strip before the footer, a `.subscribe` form (field and button in one capsule), a `.contact` form (`.form-row`, a `.hint` and an `.error` under the field, `aria-invalid`).
- **Sign in** — `.auth` in a card: email → code `<div class="otp" data-otp>` (cells advance by themselves, understand paste and autofill from the email, fire the `otpcomplete` event; `otpError(box)` shakes and clears).
- **404** — `.notfound` with an outlined number `.nf-num`, one phrase and two buttons.
- **Cookie** — `<div class="consent" data-consent="key" hidden>` with `data-consent-choice="necessary|all"` buttons: a card in the corner, two equal choices, the choice is remembered (the `consent` event).
- **Media** — `.video` with `data-src` (file) or `data-yt` (cookie-free YouTube) loads the player only on press; a `.gallery` of buttons with `data-full`/`data-caption` opens a fullscreen viewer (←/→, swipe, Esc); `.carousel` = `.rail` + `.dots` (if slides are added by script, call `initCarousels()` afterward).
- **Comparison** — `table.compare` under the plans: the `.pro` column is tinted with the accent, `.yes`/`.no`, `.grp` groups.

## App elements (kit-3, blocks 38–44)

- **Command palette** — `const pal = commandPalette({ items: [{ group, label, hint, kbd, icon, run }] })`: Ctrl/⌘+K, search by the letters of the label with highlighting, groups, ↑/↓, Enter, Esc; `pal.open()` for a button.
- **Date range** — `.menu-host.daterange`: a `[data-menu]` button with a `<span>` label, `[role=menuitemradio]` items in the menu with `data-days` or `data-range="month"`, and at the bottom a `.custom` row with two `input[type=date]`; the `rangechange` event { from, to, label }. Preset ranges are rows, the calendar is only for a custom range.
- **Files** — `<label class="dropzone" data-list="id"><input type="file" multiple>…` + `<ul class="files" id>`; the `files` event with `items[]` (`progress(p)`, `done()`); the app does the upload itself.
- **Tags** — `<div class="tags" data-tags data-sug="id" data-value="a,b"><input></div>` + `.tags-sug` with buttons; the `tagschange` event.
- **Number field** — `.num-input`: `button[data-step=-1]`, an `input` with min/max/step, `.unit`, `button[data-step=1]`; holding accelerates, ↑/↓ (Shift ×10), the buttons dim at the limits.
- **Text** — `textarea.input.auto` grows with its text (`field-sizing`), `.count-chars` in the field's caption counts characters up to `maxlength`.
- **Table** — `table.tbl[data-select]` with `.check` checkboxes in the first column (the header is "all" and supports "partial"), a `.bulkbar[data-bulk-for]` pops up from the bottom with `<b data-count>`; states: `.sk-row` rows with skeletons and a `.tbl-state` "nothing found".
- **Meter** — `.meter[data-level=ok|warn|bad]` with `--v` (value) and `--t` (threshold, the `<s>` mark), captions above and below in text colors.
- Status modifiers on components go through `data-level` or dedicated classes, not the utility `.good`/`.bad`: those color all the text.

## Motion (numbers)

| What | How |
|---|---|
| Buttons/glass | hover `translateY(-1px) scale(1.02)`, 0.45 s `cubic-bezier(.2,.9,.25,1.35)`; active `scale(.965,.95)` in 0.12 s |
| Button parallax | the body moves toward the cursor up to 3×2px and tilts up to 4.5° (`perspective(520px)`), the `.btn-l` label another +2.5×1.5px; follow 0.14 s ease-out, return is a 0.45 s spring; less on small/wide ones; mouse only, not under reduced motion, `data-parallax="off"` turns it off |
| Popovers, burger, FAQ "+" | 0.2 s `cubic-bezier(.2,.9,.3,1.2)`, from `translateY(-6px) scale(.97)` |
| `.rv` reveal | 26px up + fade in, 1 s `cubic-bezier(.2,.7,.2,1)`, 15% threshold, once; cascade in 0.06–0.08 s steps via `--d` |
| Hero cascade | eyebrow 0.05 → lines 0.17 / 0.29 → the object floats up from 0.25 → the screen flashes at 0.9 (brightness 0 → 1.4 → 1.05 over 0.9 s) → modes 1.35 → lead 1.5 → buttons 1.65 → note 1.8; the header comes after 1.4 s or 40px of scroll |
| 3D springs | float-up k=16 c=5.5; scale .82 → 1 k=60 c=9; "breathing" ±0.6% over 8 s; drift ±0.06 over 10.7 s; gaze follows the cursor k=38 c=7.5; after 6 s without a cursor it slowly looks around on its own |
| Spin | speed from the gesture, decay `0.04^dt`; after 2.2 s it returns to face the viewer along the nearest full turn; a tap is a hop (vy +2.6) and a squash |
| Glow | `--glow` eases (0.04–0.06 per frame) to the content's color; the hero/offer background has `transition: background 1.2s` |
| Tiles | hovering one: the others get `brightness(.38) scale(.96)`, text 45%, 0.5 s |
| Reduced motion | `prefers-reduced-motion: reduce` — no drift, float-up, reveal or cascade; state changes stay |

## Combining with the rest of the stack

- **Impeccable** — a `DESIGN.md` in the project root makes Night Glass the "law" for its commands (`critique`, `polish`, `typeset`, `layout`). The detector will complain about `overused-font` (Inter) and `dark-glow` (screen light, the Pro plan glow); these are **deliberate** traits of the style: suppress them one at a time with `impeccable hooks ignore-value <rule> "<value>" --file <path> --reason "Night Glass: …"`, not by turning off the whole rule. Fix everything else (contrast, clipping, tight padding).
- **Flexnative / shadcn `@flx`** — take ready blocks (FAQ, pricing, auth, settings) instead of hand-building; the theme is `shadcn-theme.css`.
- **Emil Kowalski's skills** — `animate` / `review-animations` for new animations (the rules match: springs for what you touch, ease-out for entrances, never from `scale(0)`, interruptibility); `apple-design` for gestures and materials; `emil-design-eng` for polishing details.
- **Morphicons** — for icons that change state (menu↔close, play↔pause, arrow↔check) in React; in plain HTML the burger is already animated by a CSS rotation of its lines.

## Pitfalls

- All button states write to a single `transform` through variables (`--px --py --rx --ry --lift --sx --sy`). Add your own effect as a variable, not as a new `transform`, or it will overwrite the parallax and the press.
- Don't put `all:unset` on an element with `.btn`/`.glass` (for example in `.chips`): `position` is reset, and the glass edge `::after` stretches across the whole screen as soon as the `.rv` parent loses its `transform`.
- `backdrop-filter` needs the `-webkit-` prefix for Safari (already in the CSS).
- Gray text on a highlighted background (the Pro plan, `.offer`) should be lighter: inside `.offer` there is already `--dim: #9d9da3`.
- Draw the screen's canvas text after `await document.fonts.ready`, otherwise a system font is used.
- 3D: one `mountHero` per page; for many small objects use one offscreen renderer that copies frames into 2D canvases (as the original does), not a dozen WebGL contexts.
- A 3D scene can sit anywhere on the page: the scroll offset is computed from the top of the scene itself, not the top of the page.
- Grid cells stretch to the width of their content: tabs, code and tables inside `display:grid` will widen the page on a phone. Give the children of a grid container `min-width:0`.
- Don't animate `width`: progress and the tab capsule move through `clip-path`, with no layout recalculation.
- The style has no light theme. Don't make one "while you're at it".
