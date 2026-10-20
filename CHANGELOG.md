# Changelog

## 1.7.3 — 2026-10-20
- Hero 3D canvas now lies under the whole hero (`canvas.hero-canvas` as a direct child of `.hero`), so the object can hop up behind the headline instead of being clipped by its row; the text stays on top. The camera still frames the object in the free `.hero-stage` row.

## 1.7.2 — 2026-10-20
- 3D dial follows the finger 1:1: the cursor is cast onto the plane of the dial face, so the rim turns by exactly the angle you moved, even on a tilted, foreshortened dial. No inertia after release; the dial stops following the pointer while you hold it. `onSpin` may return `false` to act as an end stop (the rim then holds).

## 1.7.1 — 2026-10-20
- 3D dial (`puck`): circling around its face turns it like a real knob, clockwise = up, with inertia. Right at the centre, where the angle is unstable, a horizontal drag still works.

## 1.7.0 — 2026-10-20
- English only: code comments, UI strings, demos, docs, tests and the Pages site. Demos use the en-US locale and US dollar prices (Orbi $79, Orbi Pro $129).
- Charts: the last x-axis label no longer collides with its neighbor; the donut legend wraps a long value instead of clipping it.
- Live demos on GitHub Pages: https://lbrdev.github.io/night-glass/

## 1.6.0 — 2026-10-20
- 3D hero from your own model: `mountHero(canvas, { model: { url: 'model.glb', screen: 'Screen' } })` — centering, scaling, a live picture on the screen mesh, `flipY`; `hero.dispose()`.
- Demo block 45: the sample model is built and exported to `.glb` right in the browser, and you can drop your own file onto the page.
- Playwright Test automated tests: smoke (console errors, horizontal scroll, dialogs, dates, dropdown, code sign-in) and visual (page comparison against a local reference).

## 1.5.0 — 2026-10-20
- App elements: ⌘K command palette, date range, file upload, tags, number field, auto-growing text field with a counter, table row selection with an action bar, table states, meter indicators.
- Fixed: arrow keys in fields inside a menu are no longer intercepted, Tab between fields doesn't close the menu, range dates use local time, the utility `.good`/`.bad` no longer color meter and toast text, `.btn` inside a menu isn't reset.

## 1.4.0 — 2026-10-20
- Sections for sites: articles, testimonials and a quote, logos, big numbers, a call-to-action strip, subscribe, a contact form, sign-in with an email code, 404, cookie consent, video with a lazy player, fullscreen gallery, carousel with dots, plan comparison table.

## 1.3.0 — 2026-10-20
- Dialogs on native `<dialog>` (sheet, side panel, confirmation), a menu on a button with keyboard support, a toast stack with kinds and an action, a "Skip to content" link, high-contrast mode, print styles, swatches, smooth FAQ.

## 1.2.0 — 2026-10-20
- A custom dropdown in place of the native one (on devices with a mouse).

## 1.1.0 — 2026-10-20
- Charts (`night-glass-charts.js`): lines, bars, donut, sparkline, table view; the palette is checked on a dark background.
- Tabs, tab bar, side menu, table, checkboxes, radios, slider, search, progress, skeletons, tooltips, avatars, counters, breadcrumbs, pagination, steps, banner, notifications, empty state, activity feed, code.

## 1.0.0 — 2026-10-20
- First release: tokens, liquid glass with highlight and parallax, header, hero with a 3D object, showcase sections, Tailwind v3/v4, shadcn theme, template and the Orbi demo.
