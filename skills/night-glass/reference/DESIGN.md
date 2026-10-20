---
name: Night Glass
description: A dark product showcase with a near-black background, a single accent, liquid glass, a live 3D object in the hero and spring motion.
colors:
  bg: "#050506"
  fg: "#f5f5f7"
  fg2: "#d6d6db"
  dim: "#86868b"
  mute: "#7a7a81"
  faint: "#4a4a50"
  line: "#1c1c20"
  line2: "#26262b"
  dim-glow: "#9d9da3"
  card: "#0c0c0f"
  card2: "#111115"
  field: "#000000"
  accent: "#a98bff"
  accent-ember: "#ff9f5a"
  accent-mint: "#5fe3b4"
  accent-sky: "#6cc4ff"
  accent-rose: "#ff7aa8"
  accent-lime: "#c6f36b"
  on-accent: "#140c2a"
  good: "#5bd68a"
  warn: "#ffb547"
  bad: "#ff6b5e"
  bad-text: "#ffd6d1"
typography:
  display:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "clamp(40px, 7.2vw, 96px)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "clamp(34px, 5vw, 64px)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  h3:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  lead:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(17px, 1.6vw, 20px)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.5
  eyebrow:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    letterSpacing: "0.01em"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "13.5px"
    fontWeight: 500
  mono:
    fontFamily: "ui-monospace, SF Mono, JetBrains Mono, Consolas, monospace"
    fontSize: "13px"
    fontWeight: 500
  price:
    fontFamily: "Inter Tight, Inter, system-ui, sans-serif"
    fontSize: "clamp(46px, 7vw, 80px)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.03em"
rounded:
  tail: "5px"
  xs: "10px"
  sm: "14px"
  note: "16px"
  shot: "18px"
  bar: "20px"
  md: "22px"
  step: "26px"
  lg: "28px"
  xl: "36px"
  pill: "999px"
spacing:
  page: "max(16px, 4vw)"
  section: "clamp(110px, 14vw, 180px)"
  head-gap: "clamp(48px, 6vw, 72px)"
  grid-gap: "20px"
  max: "1120px"
  max-text: "760px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.fg}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 20px"
  button-primary-lg:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.fg}"
    rounded: "{rounded.pill}"
    height: "52px"
    padding: "0 26px"
  button-glass:
    backgroundColor: "rgba(255,255,255,.07)"
    textColor: "{colors.fg}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 20px"
  nav:
    backgroundColor: "rgba(10,10,13,.38)"
    textColor: "{colors.dim}"
    rounded: "{rounded.bar}"
    height: "52px"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.md}"
    padding: "clamp(18px, 2.4vw, 26px)"
  step:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.step}"
    padding: "34px 30px 36px"
  tier:
    backgroundColor: "rgba(255,255,255,.02)"
    rounded: "{rounded.lg}"
    padding: "30px 28px 28px"
  offer:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.xl}"
    padding: "clamp(48px, 7vw, 80px) clamp(16px, 4vw, 56px)"
  input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.fg}"
    rounded: "{rounded.sm}"
    height: "48px"
    padding: "0 16px"
  pill:
    backgroundColor: "rgba(255,255,255,.055)"
    textColor: "{colors.dim}"
    rounded: "{rounded.pill}"
    height: "24px"
    padding: "0 10px"
---

# Night Glass

A design system for a dark product showcase where **the product itself is a living character** and the interface around it is quiet glass. Code: `night-glass.css` (tokens and components), `night-glass.js` (behavior), `night-glass-3d.js` (the three.js 3D hero). A live example is `demo/index.html` (the fictional Orbi dial).

## Overview

**Character:** "an Apple keynote in a dark room". A near-black background, one colored accent, large dense Inter Tight headlines, gray secondary text, lots of air. Everything you can touch (buttons, header, menus, chips) is made of liquid glass: it blurs the background, catches light on its edge, and a highlight crawls after the cursor. Container surfaces (cards, steps, plans) are matte and almost invisible: `#0c0c0f` with a `#1c1c20` line.

**The main technique is the object as a character.** The hero holds not a picture but a 3D object that floats up on a spring, breathes, looks at the cursor, spins under a finger with inertia, hops on a tap and "speaks" in short lines. Its screen glows, and that light tints the page background (`--glow`), the rim light and the pool of light beneath it. The color of the content is the color of the room.

**Principles:**
1. One accent per product. It works as light, not as paint: it tints the main glass, checkmarks, the eyebrow, the glow. More than one colored spot on screen is allowed only when it is content (modes, dials).
2. Hierarchy comes from the size and brightness of text, not from color or borders. Three text brightnesses: `fg` for the main, `dim` for explanations, `mute` for utility text.
3. Motion with weight. Springs with overshoot for what you touch; a soft exit (`.2,.7,.2,1`) for entrances; nothing appears from `scale(0)`.
4. Each section answers one question: what is it, what can it do, what does it look like, why is it better, how to set it up, how much does it cost, what else.
5. Nothing decorative without a reason. The glow is the screen's light, the knurling is the dial's texture, the highlight is the glass.

**Impeccable mode:** Persuade (a product showcase). For dashboards and admin panels use the same tokens at app scale (`h1` 48px, `.card`, forms), which is Operate mode.

## Colors

Neutrals are graphite, warm-cool, with no blue cast:

| Token | Value | Role |
|---|---|---|
| `--bg` | `#050506` | page background, always; not pure `#000` |
| `--card` / `--card2` | `#0c0c0f` / `#111115` | matte containers |
| `--field` | `#000` | input fields: darker than the background, a "well" |
| `--line` / `--line2` | `#1c1c20` / `#26262b` | hairlines: cards, FAQ, tables |
| `--fg` | `#f5f5f7` | headlines, the key point in a lead (`<b>`) |
| `--fg2` | `#d6d6db` | plan lists, article text |
| `--dim` | `#86868b` | leads, descriptions, header links (5.6:1 on the background) |
| `--dim-glow` | `#9d9da3` | gray text on a highlighted background (offer, Pro plan) |
| `--mute` | `#7a7a81` | footer, footnotes (4.7:1) |
| `--faint` | `#4a4a50` | "·" separators, list markers: not for text |

The **accent** is set by the pair `--acc` + `--acc-rgb` (for `rgba()`), plus `--on-acc`, the dark text on an accent fill. Presets: `data-accent="iris | ember | mint | sky | rose | lime"` on `<html>`. The accent is light and pastel (L≈75–85%), otherwise tinted glass turns muddy.

The **glow** `--glow` (r,g,b) equals the accent by default, but it can follow the content: `setGlow('255,159,90')` smoothly recolors the hero background, the pricing block and the 3D light. Glow opacities: 0.22 in the hero and offer background, 0.18 in the Pro plan, 0.32 under the winner in before/after.

**Statuses:** `--good #5bd68a`, `--warn #ffb547`, `--bad #ff6b5e` (text on red glass `--bad-text #ffd6d1`); a status pill's background is the same color at 10%.

**There is no light theme, and there shouldn't be.** The style rests on darkness: glow, glass and depth only work on near-black. If a product needs a light site, that is a different design system.

## Typography

Two open typefaces from Google Fonts (both with Cyrillic):

```html
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

- **Inter Tight 700**: all headlines, prices, FAQ questions. Negative tracking grows with size: −0.01em (18px) → −0.025em (h2/h3) → −0.03em (sections) → −0.035em (hero). Line height 1.02–1.05 for large sizes.
- **Inter 400/500/600**: body text, buttons (600), header links (500), eyebrow (600, accent color).
- **Mono**: the system one (`ui-monospace, SF Mono, Consolas`), only for code and values.

Showcase scale: hero `clamp(40px,7.2vw,96px)` → section title `clamp(34px,5vw,64px)` → tile/step h3 22px → lead `clamp(17px,1.6vw,20px)` → body 17px → descriptions 15–15.5px → captions 13.5–14px → pills 12.5px. The hero headline is always two lines via `<span>` (each is its own step of the reveal cascade). The lead is gray, but its key thought is picked out with a white `<b>` at weight 500.

Alternatives if you need a different voice at the same proportions: Geist + Geist (drier), Manrope 700 for headlines (softer), Onest (with good Cyrillic). Change `--font` and `--font-display`, keep the tracking.

## Layout

- **Page margins** `--pad: max(16px, 4vw)` grow with the window. Content is `max-width: 1120px`, text and FAQ 760px, leads 560–600px.
- **Section rhythm** `padding-top: clamp(110px, 14vw, 180px)`: there is emptiness between sections, not lines. The section header is centered: eyebrow → title → gray paragraph, then `clamp(48px,6vw,72px)` to the content.
- **Hero** fills the screen (`--vh-stable`, minimum 640px; on touch screens the height is pinned at load and refreshed only on rotation, because in-app browsers like Telegram resize the web view while you scroll and a `100svh` hero would shove the page), a grid of three rows: the headline on top, the scene with the object in the middle (it takes the free space), lead + buttons + note at the bottom. The header appears only after the hero has assembled.
- **Grids:** tiles 3 → 2 (≤860px) → 1 (≤520px); steps 3 → 1; plans 2 → 1 (≤760px); facts 4 → 2 → 1; split 1fr 1fr → 1 centered column; before/after `.78fr 1.22fr`, the asymmetry is deliberate.
- **Gallery:** a horizontal strip with snap that bleeds past the page margins (`margin: 0 calc(-1 * var(--pad))`), no scrollbar; round glass arrows on desktop, none on phones.
- **Mobile:** the header is a logo, the main button and a burger (links drop down as a glass list, items 16px with 13px padding); CTA buttons stretch to 340px; everything is centered. No horizontal scroll at any width.

## Elevation & Depth

Depth comes from light and blur, not card shadows.

1. **Plane**: the `#050506` background.
2. **Matte containers**: `--card` + a 1px line. No shadows.
3. **Glass** (header, buttons, chips, menus): `backdrop-filter: blur(16–22px) saturate(180–190%)`, a vertical white gradient of 4–14%, an inner light edge on top (`inset 0 1px .5px rgba(255,255,255,.38–.6)`), a 1px gradient outline via a mask (brighter at the top left), a soft dark downward shadow `0 10px 30px -8px rgba(0,0,0,.55)`. The highlight is a 140×70px radial gradient at the cursor.
4. **Floating** (menu, sheet, toast): more opaque: `--pop` (#1e1e24 → #121216) or `rgba(22,22,26,.92)` + a large shadow `0 30px 70px -20px #000`.
5. **Light**: radial spots `rgba(var(--glow), .18–.32)`: behind the object in the hero, on top of the pricing block, behind the winner. It is always "light from the screen", standing behind the object, not around buttons.

Focus: `outline: 2px solid rgba(acc, .85)` with a 2px offset is the only bright outline in the system. Focused inputs: an accent border + a ring `0 0 0 4px rgba(acc,.16)`.

## Shapes

Radii: 5 (bubble tail) · 10 (menu items, small buttons) · 14 (fields, icons) · 16 (notes) · 18 (menus, previews) · 20 (header) · 22 (cards) · 26–28 (steps, plans, sheets) · 36 (pricing block) · 999 (all buttons, pills, chips, toasts). Buttons and chips are always capsules. A circle is an avatar, a step number (38px, `#ffffff10`), a checkmark (20px, accent), gallery arrows (50px glass). Icons are thin line icons (Lucide, 1.8px), 14–20px; icon state changes use Morphicons, not a hard swap.

## Components

- **Header `.nav`**: one floating glass panel, 52px tall, 10px from the edges, up to 1120px wide, radius 20. On the left a wordmark (one letter/syllable picked out in the accent), then a product-switcher chip, anchor links (gray, white on `#ffffff0d` on hover, the active one `#ffffff1a`), and on the right "Sign in" (glass) and "Buy" (glass with the accent), both 34px. `.nav.wait` is hidden until the hero assembles.
- **Hero**: accent eyebrow → two-line display → a scene with the 3D object (or a CSS object) → a mode switcher → lead → two `lg` buttons (the main one with the price, "Buy from $79", the second one "see how it works") → a 13px note. Reveal cascade: 0.05 → 0.17 → 0.29 s (headline), the object floats up from 0.25 s, the screen flashes at 0.9 s, then 1.35–1.8 s for modes, lead, buttons, note.
- **Buttons `.btn`**: 44px capsules (sm 34, lg 52), weight 600. Variants: clear glass (default), `.pri` glass tinted 50% with the accent, `.solid` white glass with black text (a selected chip), `.danger`. Hover: a 1px lift and `scale(1.02)` on a 0.45 s spring; press: `scale(.965,.95)` in 0.12 s, squashing like rubber. **Cursor parallax** (`.btn`, `.arr`): the body is pulled toward the cursor up to 3×2px and tilts up to 4.5° (`perspective(520px)`), the `.btn-l` label floats above the glass and shifts another 2.5×1.5px; the amplitude is smaller on small and wide buttons. While the cursor is inside it follows in 0.14 s, and after it leaves the button springs back with overshoot. Mouse only; off on touch screens, under reduced motion, on `:disabled` and with `data-parallax="off"`.
- **Tiles `.tiles`**: a picture/object, an h3 at 22px, gray text up to 300px. Hovering one sends the others into darkness (`brightness(.38)`, `scale(.96)`, text 45%).
- **Split**: text on the left, a live demo on the right; on phones a single centered column.
- **Scenes / look picker**: a large object + a panel: round 34px swatches (the selected one has a double ring, background/white), glass chips (the selected one is white).
- **Facts `.facts`**: 4 columns: a bold 17px line + a gray explanation.
- **Before / after `.vs`**: the loser is smaller and desaturated (`saturate(.55) brightness(.8)`) with gray bullets; the winner is large, with a glow behind it and accent "✓" bullets.
- **Steps `.steps`**: a numbered list: radius-26 cards with a number in a circle, an h3 at 22px, gray text; below them a quiet gray "and if you change your mind" line.
- **Gallery**: a snap strip or a 3D carousel (the central object faces the viewer, the side ones are turned and sink into a fog the color of the background); a glass category label above the title; previews are black squares with radius 18, a thin outline and a 3px lift.
- **Pricing `.offer`**: a large radius-36 block with a glow on top, a heading, a gray line ("pay once…"), two plan columns. Pro has a border and a corner glow in the `--glow` color, an uppercase label pill and a `.pri` button; the base plan has a clear button. The price is Inter Tight 700, 44–80px, tabular figures. Lists with round accent checkmarks.
- **FAQ**: `<details>` with lines above and below, the question in Inter Tight 600 at 19px, a "+" on the right that rotates into "×" on a spring; the answer in gray 16px fades in with a 4px shift.
- **Footer `.foot`**: one quiet row of links and a centered footnote, `--mute`, 13.5px, links brighten on hover. No "Company / Product / Resources" columns.
- **Layers:** the `.sheet` (slides up from the bottom on phones, radius 28 on top), a toast capsule at the bottom center, the object's speech bubble (tail at the bottom left, glass, never over the headline or the main number).
- **Forms** (for dashboards): a 48px field on `#000`, a 13.5px gray label above the field, an iOS-style segmented control, a 46×28 switch (on is green).

### Dialogs, menus, toasts

- **Sheet**: a glass card with radius 28 in the center, the background dimmed and blurred; on phones it slides up from the bottom at full width. **Side panel**: on the right at full height, up to 520px wide, slides in over 0.38 s. Leaving takes 0.2 s with a shift down (sheet) or right (panel).
- **Menu**: an opaque "popover" `--pop`, items 9px × 12px with an 18px icon, the key on the right, a dangerous item in red, separators and uppercase group labels.
- **Toasts**: glass capsules, an icon by kind (info is the accent, done is green, warning is amber, error is red), an action in the accent on the right; a stack of up to three, new ones at the bottom.

### Site sections

- **Article**: a 760px column, an Inter Tight 34–54px heading, a gray lead, an author row with an avatar, a table of contents in a card, 17.5px text at 1.72 line height; a quote with a large gray quotation mark instead of a colored bar; links in the accent with a semi-transparent underline.
- **Testimonials**: matte cards with `--fg2` text and a "avatar + name + city" caption; the main quote is large, Inter Tight 24–40px, centered.
- **Logos**: wordmarks in gray `--mute` that whiten on hover; numbers are Inter Tight 40–60px with a gray caption.
- **Call to action**: a wide radius-36 card with a glow from the corner, the heading on the left, buttons on the right.
- **Sign in**: a 420px card, code cells 54×64 with large digits, an error is a red border and a shake.
- **404**: a huge outlined number with no fill, a phrase and a way back.
- **Cookie**: a glass card in the bottom left corner, not a full-screen wall; buttons of equal weight.
- **Media**: a 16:9 video cover with a glass play button; a gallery of radius-18 squares, the viewer has a dark blurred background and glass arrows; carousel dots are 8px, the current one stretches into a 24px capsule.

### App elements

- **Command palette**: a 620px glass panel at 12% from the top, a 58px search field, uppercase groups, matched letters in bold white, a key hint at the bottom.
- **Date range**: a menu with preset ranges and a checkmark on the selected one; a custom range is two date fields in the menu footer.
- **Upload**: a dashed radius-22 border that lights up in the accent and grows slightly on drag; files are cards with a type, name, size and a progress bar.
- **Tags**: accent-tinted capsules with a cross inside the field; suggestions are gray capsules under the field.
- **Numbers**: a 48px field with "−"/"+" buttons on the edges and a unit; the text field grows up to 320px.
- **Row selection**: the selected row is highlighted in an accent tone; the action bar is a glass capsule at the bottom center that springs in.
- **Meters**: a 10px bar: the fill is the level color, the track is the same color at 18%, the threshold is a light tick.

### Data and apps

- **Stats `.stat`**: a 13.5px gray label, the value in Inter Tight 600 at 30px, a change with an arrow and a sign ("↑ +12.4% vs last period"; green when it is good, the opposite for refunds), a sparkline in muted gray with the current point in the accent.
- **Charts** (`night-glass-charts.js`): on a matte `.chart-card`; lines are 2px with a smooth monotone curve, a 14 → 0% gradient fill for one series only, bars are ≤ 24px with 4px rounding on top and a square bottom, the donut has 2px gaps and a total in the center; grid `#1c1c20` 1px, axis labels `#7a7a81`. The categorical order is `--chart-1…6`: `#7c5bcb #d3772e #0e9d75 #b03165 #419bd4 #6c8f01` (checked: OKLCH lightness 0.48–0.67, color-blind distinguishability ΔE ≥ 8.6, normal vision ≥ 22). A single series uses the accent. The tooltip is a glass card: the value in bold, the series name in gray, the key a short line in the series color; a crosshair on lines, the whole band is the hover target on bars; the arrow keys walk the points. Entrance: the line draws over 1.1 s, the bars grow from the base in a 30 ms cascade, the donut fills by share.
- **Tabs**: a glass capsule in a `#ffffff0a` track glides under the selected tab on a spring; the 2px underline variant is for documents. **Tab bar**: a floating 64px glass panel, radius 24, 12px from the bottom; the current item gets a `#ffffff12` backing and an accent icon.
- **Table**: in a card frame, a 12.5px gray sticky header, 13px row padding, a `#ffffff06` row highlight, numbers right-aligned in tabular figures, statuses as pills.
- **Forms**: 22px checkboxes with a `--faint` border fill with the accent when checked and the checkmark "pops in" on a spring; the slider is a 6px track filled with the accent up to a white 24px thumb; the dropdown is a 48px field with an arrow that opens as a glass panel like a menu (radius 16, 10px item padding, the selected item with an accent checkmark, opens upward near the bottom edge); on touch screens it is the native picker.
- **Utility**: progress is 6px (statuses in state colors), skeletons with a running highlight, the `data-tip` tooltip is a small glass plate; an avatar is an accent tone with accent letters; notifications always carry an icon (color is never the only cue); the empty state is a dashed border, a round icon, one phrase and one button.

## Do's and Don'ts

**Do**
- One hero object with character (3D via `night-glass-3d.js` or at least a CSS drawing) and its light on the page.
- A short two-line promise headline in the hero; the price right on the main button.
- Gray leads with one white phrase inside.
- Huge gaps between sections instead of dividers.
- Spring motion for what you touch; a smooth `.rv` reveal for the rest; `prefers-reduced-motion` turns off everything except state changes.
- Check contrast: gray text on a highlighted background (the Pro plan, offer) should be lighter (`--dim: #9d9da3` inside `.offer`).
- Cyrillic: Inter and Inter Tight include it. Use the same sizes, but don't tighten the tracking beyond −0.035em.

**Don't**
- Don't copy the brand source: none of its logo, names, copy, illustrations or 3D models.
- Don't paint the background with gradients "for beauty": the glow goes only behind the object and the price.
- Don't put colored halos around buttons, cards and icons; don't use gradient text.
- Don't use more than one accent in the interface (content colors such as modes and previews don't count).
- Don't add shadows to cards, borders to sections, or icons in circles to every item.
- Don't make a light theme "while you're at it".
- Don't apply `all:unset` to an element with the `.btn`/`.glass` class: `position` is reset and the glass edge stretches across the whole screen.
- Don't build a footer from four columns of links and social networks.
