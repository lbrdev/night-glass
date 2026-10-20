// Night Glass Charts: dependency-free SVG charts in the system's language:
// thin 2px lines, bars up to 24px with rounded tops, ~10% fill, pale grid, labels in text colors,
// series colors follow the categorical order --chart-1…6 (a single series uses the accent), legend from two series,
// tooltip on hover and from the keyboard, table view. Labels and values are inserted via textContent (data may be untrusted).
//
//   import { lineChart, barChart, donutChart, sparkline, dataTable } from './night-glass-charts.js'
//   lineChart(el, { labels, series: [{ name, values }], format, area })   → { update(data), data }
//   barChart(el, { labels, series: [{ name, values }], format })          → { update(data), data }
//   donutChart(el, { items: [{ name, value }], format, centerLabel, legend: elementForLegend })
//   sparkline(el, values)                                                   for .stat tiles
//   dataTable(el, data, format)                                              the same dataset as a .tbl table
// Container: <div class="chart" style="--h:260px"></div>; legend: <div class="legend"></div> (pass it as opts.legend).
const NS = 'http://www.w3.org/2000/svg';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const svgEl = (tag, attrs = {}, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent?.append(e); return e; };
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const full = new Intl.NumberFormat('en-US');
export const fmt = { compact: v => compact.format(v), full: v => full.format(v), pct: v => full.format(v) + '%' };

function colors(n) {
  if (n === 1) return [css('--acc')];
  return Array.from({ length: n }, (_, i) => css('--chart-' + (i + 1)) || css('--dim'));   // fixed order, no cycling
}
function niceTicks(min, max, count = 4) {
  if (min === max) max = min + 1;
  const raw = (max - min) / count, mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw);
  const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step, out = [];
  for (let v = lo; v <= hi + step / 2; v += step) out.push(+v.toFixed(10));
  return out;
}
// smooth monotone curve (never overshoots the values, more honest than a spline)
function monotone(pts) {
  if (pts.length < 3) return 'M' + pts.map(p => p.join(',')).join('L');
  const n = pts.length, dx = [], m = [], t = [];
  for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; m[i] = (pts[i + 1][1] - pts[i][1]) / dx[i]; }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : 3 * (dx[i - 1] + dx[i]) / ((2 * dx[i] + dx[i - 1]) / m[i - 1] + (dx[i] + 2 * dx[i - 1]) / m[i]);
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += `C${pts[i][0] + h},${pts[i][1] + t[i] * h} ${pts[i + 1][0] - h},${pts[i + 1][1] - t[i + 1] * h} ${pts[i + 1][0]},${pts[i + 1][1]}`;
  }
  return d;
}
function legendInto(el, series, cs, kind) {
  if (!el) return;
  el.replaceChildren();
  if (series.length < 2) return;   // single series: the heading names it
  series.forEach((s, i) => {
    const span = document.createElement('span'), key = document.createElement('i');
    key.style.setProperty('--c', cs[i]); if (kind === 'line') key.className = 'ln';
    span.append(key, document.createTextNode(s.name)); el.append(span);
  });
}
function tipRows(tip, title, rows) {
  tip.replaceChildren();
  const t = document.createElement('div'); t.className = 't'; t.textContent = title; tip.append(t);
  for (const r of rows) {
    const row = document.createElement('div'); row.className = 'r';
    const key = document.createElement('i'); key.style.setProperty('--c', r.c);
    const b = document.createElement('b'); b.textContent = r.v;
    row.append(key, b);
    if (r.name) { const sp = document.createElement('span'); sp.textContent = r.name; row.append(sp); }
    tip.append(row);
  }
}
function placeTip(el, tip, x, y) {
  const w = tip.offsetWidth, h = tip.offsetHeight, W = el.clientWidth;
  let left = x + 14; if (left + w > W) left = x - w - 14; if (left < 0) left = Math.max(0, Math.min(W - w, x - w / 2));
  tip.style.transform = `translate(${left | 0}px,${Math.max(-8, y - h / 2) | 0}px)`;
}
// redraw on resize and on first appearance (animates when the chart enters the viewport)
function mount(el, draw) {
  let raf = 0, shown = reduced;
  const run = () => { raf = 0; draw(shown); };
  new ResizeObserver(() => { if (!raf) raf = requestAnimationFrame(run); }).observe(el);
  if (!shown) new IntersectionObserver((es, io) => { if (es[0].isIntersecting) { shown = true; io.disconnect(); draw(true, true); } }, { threshold: .3 }).observe(el);
  return run;
}

// ---------------------------------------------------------------- lines
export function lineChart(el, data) {
  const st = { data, idx: -1 };
  const tip = Object.assign(document.createElement('div'), { className: 'chart-tip' });
  function draw(shown, animate) {
    const { labels, series, format = fmt.compact, area = series.length === 1, legend } = st.data;
    const W = el.clientWidth, H = el.clientHeight; if (!W || !H) return;
    const cs = series.map((s, i) => s.color || colors(series.length)[i]);
    legendInto(legend, series, cs, 'line');
    const all = series.flatMap(s => s.values), ticks = niceTicks(Math.min(0, ...all), Math.max(...all));
    const tickTxt = ticks.map(v => format(v));
    const ml = 8 + Math.max(...tickTxt.map(t => t.length)) * 7, mr = series.length === 1 ? 56 : 14, mt = 10, mb = 28;
    const iw = W - ml - mr, ih = H - mt - mb, y0 = ticks[0], y1 = ticks.at(-1);
    const X = i => ml + (labels.length === 1 ? iw / 2 : i / (labels.length - 1) * iw), Y = v => mt + ih - (v - y0) / (y1 - y0) * ih;
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', tabindex: 0, 'aria-label': st.data.title || 'Chart' });
    const g = svgEl('g', { class: 'grid' }, svg), ax = svgEl('g', { class: 'ax' }, svg);
    ticks.forEach((v, i) => {
      svgEl('line', { x1: ml, x2: W - mr, y1: Y(v), y2: Y(v) }, g);
      const t = svgEl('text', { x: ml - 10, y: Y(v) + 4, 'text-anchor': 'end' }, ax); t.textContent = tickTxt[i];
    });
    const every = Math.ceil(labels.length / Math.max(2, Math.floor(iw / 72)));
    labels.forEach((l, i) => {
      const last = labels.length - 1;
      if (i !== last && (i % every || last - i < every)) return;   // the last label always shows; drop a regular one that would crowd it
      const t = svgEl('text', { x: X(i), y: H - 8, 'text-anchor': i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle' }, ax); t.textContent = l;
    });
    const defs = svgEl('defs', {}, svg);
    series.forEach((s, si) => {
      const pts = s.values.map((v, i) => [X(i), Y(v)]), d = monotone(pts);
      if (area) {
        const gid = 'ng' + Math.random().toString(36).slice(2, 8), gr = svgEl('linearGradient', { id: gid, x1: 0, x2: 0, y1: 0, y2: 1 }, defs);
        svgEl('stop', { offset: 0, 'stop-color': cs[si], 'stop-opacity': .14 }, gr); svgEl('stop', { offset: 1, 'stop-color': cs[si], 'stop-opacity': 0 }, gr);
        const a = svgEl('path', { d: `${d}L${pts.at(-1)[0]},${Y(y0)}L${pts[0][0]},${Y(y0)}Z`, fill: `url(#${gid})` }, svg);
        if (animate) { a.style.opacity = 0; requestAnimationFrame(() => { a.style.transition = 'opacity 1s .4s'; a.style.opacity = 1; }); } else if (!shown) a.style.opacity = 0;
      }
      const p = svgEl('path', { d, fill: 'none', stroke: cs[si], 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round', pathLength: 1 }, svg);
      if (animate || !shown) { p.style.strokeDasharray = 1; p.style.strokeDashoffset = 1; }
      if (animate) requestAnimationFrame(() => { p.style.transition = `stroke-dashoffset 1.1s cubic-bezier(.2,.7,.2,1) ${si * .12}s`; p.style.strokeDashoffset = 0; });
      // end point with a ring in the surface color; a single series gets a value label at the end
      const end = pts.at(-1);
      svgEl('circle', { cx: end[0], cy: end[1], r: 4, fill: cs[si], stroke: css('--card'), 'stroke-width': 2 }, svg);
      if (series.length === 1) { const t = svgEl('text', { class: 'lbl', x: end[0] + 10, y: end[1] + 4 }, svg); t.textContent = format(s.values.at(-1)); }
    });
    // crosshair
    const xh = svgEl('line', { class: 'xh', y1: mt, y2: mt + ih, opacity: 0 }, svg), dots = series.map((s, si) => svgEl('circle', { r: 4, fill: cs[si], stroke: css('--card'), 'stroke-width': 2, opacity: 0 }, svg));
    const hit = svgEl('rect', { x: ml, y: 0, width: iw, height: H, fill: 'transparent' }, svg);
    const show = i => {
      st.idx = i; xh.setAttribute('x1', X(i)); xh.setAttribute('x2', X(i)); xh.setAttribute('opacity', 1);
      dots.forEach((d, si) => { d.setAttribute('cx', X(i)); d.setAttribute('cy', Y(series[si].values[i])); d.setAttribute('opacity', 1); });
      tipRows(tip, labels[i], series.map((s, si) => ({ c: cs[si], v: (st.data.tipFormat || fmt.full)(s.values[i]), name: series.length > 1 ? s.name : '' })));
      tip.classList.add('on'); placeTip(el, tip, X(i), Y(Math.max(...series.map(s => s.values[i]))));
    };
    const hide = () => { xh.setAttribute('opacity', 0); dots.forEach(d => d.setAttribute('opacity', 0)); tip.classList.remove('on'); };
    hit.addEventListener('pointermove', e => { const r = svg.getBoundingClientRect(); show(Math.max(0, Math.min(labels.length - 1, Math.round((e.clientX - r.left - ml) / iw * (labels.length - 1))))); });
    hit.addEventListener('pointerleave', hide);
    svg.addEventListener('keydown', e => {
      const j = { ArrowRight: st.idx + 1, ArrowLeft: st.idx - 1, Home: 0, End: labels.length - 1 }[e.key];
      if (e.key === 'Escape') return hide();
      if (j === undefined) return; e.preventDefault(); show(Math.max(0, Math.min(labels.length - 1, j < 0 ? labels.length - 1 : j)));
    });
    svg.addEventListener('focus', () => show(st.idx < 0 ? labels.length - 1 : st.idx));
    svg.addEventListener('blur', hide);
    el.replaceChildren(svg, tip);
  }
  const redraw = mount(el, draw);
  return { update(d) { st.data = { ...st.data, ...d }; redraw(); }, get data() { return st.data; } };
}

// ---------------------------------------------------------------- bars (one series or a group of up to three)
export function barChart(el, data) {
  const st = { data };
  const tip = Object.assign(document.createElement('div'), { className: 'chart-tip' });
  function draw(shown, animate) {
    const { labels, series, format = fmt.compact, legend } = st.data;
    const W = el.clientWidth, H = el.clientHeight; if (!W || !H) return;
    const cs = series.map((s, i) => s.color || colors(series.length)[i]);
    legendInto(legend, series, cs, 'bar');
    const all = series.flatMap(s => s.values), ticks = niceTicks(0, Math.max(...all)), tickTxt = ticks.map(v => format(v));
    const ml = 8 + Math.max(...tickTxt.map(t => t.length)) * 7, mr = 8, mt = 18, mb = 28, iw = W - ml - mr, ih = H - mt - mb;
    const band = iw / labels.length, n = series.length, bw = Math.min(24, (band * .62 - (n - 1) * 2) / n), grp = n * bw + (n - 1) * 2;
    const Y = v => mt + ih - v / ticks.at(-1) * ih, base = Y(0);
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': st.data.title || 'Bar chart' });
    const g = svgEl('g', { class: 'grid' }, svg), ax = svgEl('g', { class: 'ax' }, svg);
    ticks.forEach((v, i) => { svgEl('line', { x1: ml, x2: W - mr, y1: Y(v), y2: Y(v) }, g); const t = svgEl('text', { x: ml - 10, y: Y(v) + 4, 'text-anchor': 'end' }, ax); t.textContent = tickTxt[i]; });
    const every = Math.ceil(labels.length / Math.max(2, Math.floor(iw / 56)));
    labels.forEach((l, i) => { if (i % every) return; const t = svgEl('text', { x: ml + band * (i + .5), y: H - 8, 'text-anchor': 'middle' }, ax); t.textContent = l; });
    const bars = svgEl('g', { class: 'bars' }, svg);
    let maxI = 0, maxS = 0; series.forEach((s, si) => s.values.forEach((v, i) => { if (v > series[maxS].values[maxI]) { maxI = i; maxS = si; } }));
    labels.forEach((l, i) => {
      const x0 = ml + band * (i + .5) - grp / 2;
      const col = svgEl('g', { class: 'bar', tabindex: 0, role: 'img', 'aria-label': `${l}: ` + series.map(s => `${s.name} ${fmt.full(s.values[i])}`).join(', ') }, bars);
      svgEl('rect', { x: ml + band * i, y: mt, width: band, height: ih, fill: 'transparent' }, col);   // hover target is the whole band
      series.forEach((s, si) => {
        const v = s.values[i], x = x0 + si * (bw + 2), y = Y(v), h = base - y, r = Math.min(4, bw / 2, h);
        // rounded only at the top, straight at the baseline
        const d = `M${x},${base}V${y + r}Q${x},${y} ${x + r},${y}H${x + bw - r}Q${x + bw},${y} ${x + bw},${y + r}V${base}Z`;
        const p = svgEl('path', { d, fill: cs[si] }, col);
        p.style.transformBox = 'fill-box'; p.style.transformOrigin = '50% 100%';
        if (animate || !shown) p.style.transform = 'scaleY(0)';
        if (animate) requestAnimationFrame(() => { p.style.transition = `transform .7s cubic-bezier(.2,.7,.2,1) ${i * .03}s`; p.style.transform = ''; });
        if (i === maxI && si === maxS) { const t = svgEl('text', { class: 'lbl', x: x + bw / 2, y: y - 6, 'text-anchor': 'middle' }, col); t.textContent = format(v); }
      });
      const show = () => {
        tipRows(tip, l, series.map((s, si) => ({ c: cs[si], v: (st.data.tipFormat || fmt.full)(s.values[i]), name: n > 1 ? s.name : '' })));
        tip.classList.add('on'); placeTip(el, tip, ml + band * (i + .5), Y(Math.max(...series.map(s => s.values[i]))));
      };
      col.addEventListener('pointerenter', show); col.addEventListener('focus', show);
      col.addEventListener('pointerleave', () => tip.classList.remove('on')); col.addEventListener('blur', () => tip.classList.remove('on'));
    });
    svgEl('line', { x1: ml, x2: W - mr, y1: base, y2: base, stroke: css('--line2') }, svg);
    el.replaceChildren(svg, tip);
  }
  const redraw = mount(el, draw);
  return { update(d) { st.data = { ...st.data, ...d }; redraw(); }, get data() { return st.data; } };
}

// ---------------------------------------------------------------- donut (parts of a whole, up to 6 parts; fold the rest into “Other”)
export function donutChart(el, data) {
  const st = { data };
  const tip = Object.assign(document.createElement('div'), { className: 'chart-tip' });
  function draw(shown, animate) {
    const { items, format = fmt.full, centerLabel = 'total', legend } = st.data;
    const S = Math.min(el.clientWidth, el.clientHeight); if (!S) return;
    const cs = colors(Math.max(2, items.length)), total = items.reduce((a, b) => a + b.value, 0);
    const R = S / 2 - 12, sw = Math.max(14, S * .1), C = 2 * Math.PI * R, gap = 2;   // 2px gap in the surface color between segments
    const svg = svgEl('svg', { viewBox: `0 0 ${S} ${S}`, role: 'img', 'aria-label': st.data.title || 'Donut chart' });
    const g = svgEl('g', { transform: `rotate(-90 ${S / 2} ${S / 2})` }, svg);
    let acc = 0;
    items.forEach((it, i) => {
      const len = it.value / total * C, seg = Math.max(0, len - gap);
      const c = svgEl('circle', { cx: S / 2, cy: S / 2, r: R, fill: 'none', stroke: cs[i], 'stroke-width': sw, tabindex: 0, role: 'img',
        'aria-label': `${it.name}: ${format(it.value)}`, 'stroke-dashoffset': -acc, 'stroke-dasharray': `${seg} ${C}` }, g);
      c.style.transition = 'stroke-width .25s cubic-bezier(.2,.7,.2,1)';
      if (animate || !shown) c.setAttribute('stroke-dasharray', `0 ${C}`);
      if (animate) requestAnimationFrame(() => requestAnimationFrame(() => { c.style.transition += `,stroke-dasharray .9s cubic-bezier(.2,.7,.2,1) ${i * .08}s`; c.setAttribute('stroke-dasharray', `${seg} ${C}`); }));
      const show = () => {
        c.setAttribute('stroke-width', sw + 6);
        tipRows(tip, it.name, [{ c: cs[i], v: format(it.value), name: Math.round(it.value / total * 100) + '%' }]);
        tip.classList.add('on'); placeTip(el, tip, el.clientWidth / 2, 20);
      };
      const hide = () => { c.setAttribute('stroke-width', sw); tip.classList.remove('on'); };
      c.addEventListener('pointerenter', show); c.addEventListener('focus', show); c.addEventListener('pointerleave', hide); c.addEventListener('blur', hide);
      acc += len;
    });
    const v = svgEl('text', { x: S / 2, y: S / 2 + 4, 'text-anchor': 'middle', fill: css('--fg'), style: `font:600 ${Math.round(S * .14)}px var(--font-display);letter-spacing:-.02em` }, svg);
    v.textContent = (st.data.centerFormat || fmt.compact)(total);
    const l = svgEl('text', { x: S / 2, y: S / 2 + 4 + S * .1, 'text-anchor': 'middle', fill: css('--dim'), style: 'font:13px var(--font)' }, svg); l.textContent = centerLabel;
    el.replaceChildren(svg, tip);
    if (legend) {
      legend.replaceChildren();
      items.forEach((it, i) => {
        const span = document.createElement('span'), key = document.createElement('i'), b = document.createElement('b');
        key.style.setProperty('--c', cs[i]); b.textContent = `${format(it.value)} · ${Math.round(it.value / total * 100)}%`;
        span.append(key, document.createTextNode(it.name), b); legend.append(span);
      });
    }
  }
  const redraw = mount(el, draw);
  return { update(d) { st.data = { ...st.data, ...d }; redraw(); } };
}

// ---------------------------------------------------------------- sparkline: muted trend, current point in the accent
export function sparkline(el, values) {
  const draw = () => {
    const W = el.clientWidth, H = el.clientHeight; if (!W || !H) return;
    const mn = Math.min(...values), mx = Math.max(...values), X = i => 2 + i / (values.length - 1) * (W - 8), Y = v => 3 + (H - 6) * (1 - (v - mn) / (mx - mn || 1));
    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, 'aria-hidden': 'true' });
    svgEl('path', { d: monotone(values.map((v, i) => [X(i), Y(v)])), fill: 'none', stroke: css('--chart-axis'), 'stroke-width': 1.5, 'stroke-linecap': 'round' }, svg);
    svgEl('circle', { cx: X(values.length - 1), cy: Y(values.at(-1)), r: 3.5, fill: css('--acc'), stroke: css('--card'), 'stroke-width': 2 }, svg);
    el.replaceChildren(svg);
  };
  new ResizeObserver(draw).observe(el);
}

// ---------------------------------------------------------------- table view of the same data (accessibility: values without hovering)
export function dataTable(el, data, format = fmt.full) {
  const t = document.createElement('table'); t.className = 'tbl';
  const head = t.createTHead().insertRow(), body = t.createTBody();
  const th = (txt, num) => { const c = document.createElement('th'); c.textContent = txt; if (num) c.className = 'num'; head.append(c); };
  if (data.items) {
    th('Category'); th('Value', true);
    data.items.forEach(it => { const r = body.insertRow(); r.insertCell().textContent = it.name; const c = r.insertCell(); c.className = 'num'; c.textContent = format(it.value); });
  } else {
    th(''); data.series.forEach(s => th(s.name, true));
    data.labels.forEach((l, i) => { const r = body.insertRow(); r.insertCell().textContent = l; data.series.forEach(s => { const c = r.insertCell(); c.className = 'num'; c.textContent = format(s.values[i]); }); });
  }
  const wrap = document.createElement('div'); wrap.className = 'tbl-wrap'; wrap.append(t);
  el.replaceChildren(wrap);
}
