// Night Glass — dependency-free behavior. Include with: <script type="module" src="night-glass.js"></script>
//   • the liquid-glass highlight follows the cursor (.btn, .glass, .arr → --mx/--my)
//   • button parallax (.btn, .arr): the body leans toward the cursor and tilts, the .btn-l label floats further;
//     turn it off on a single button with data-parallax="off"
//   • .rv elements appear on scroll (IntersectionObserver, threshold .15), once
//   • .nav header: burger (.burger → .nav.open), .nav.wait fades in after the hero (or after 40px of scroll)
//   • setGlow('r,g,b') — smoothly moves the background glow (--glow) to the content color
//   • toast('text', { type, action }) — a stack of glass toasts at the bottom
//   • openDialog / closeDialog / confirmDialog — <dialog>-based windows, data-open / data-close
//   • menu on a [data-menu] button, tabs, dropdowns, data-tip tooltips, swatches — see below
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.documentElement.classList.remove('no-js');

// stable screen height (--vh-stable) for the hero. In-app browsers (Telegram, Instagram) resize the web view itself
// while you scroll, so a 100svh hero would grow and shrink under the finger and shove the page. On touch screens the
// height is taken once and refreshed only when the width changes (rotation); with a mouse it follows the window.
{
  const root = document.documentElement, coarse = matchMedia('(pointer: coarse)').matches;
  let w = 0;
  const pin = () => { if (coarse && innerWidth === w) return; w = innerWidth; root.style.setProperty('--vh-stable', innerHeight + 'px'); };
  pin(); addEventListener('resize', pin);
}

// glass highlight + button parallax.
// A button (.btn, .arr) is pulled ~3px toward the cursor and tilts up to ~4.5°; the label (.btn-l) floats above the glass
// and shifts further, while the highlight follows the cursor. The rect is measured once on enter (otherwise a shifted
// button "runs away" from under the cursor), and the amplitude scales with size. Mouse only; not on touch screens,
// not under reduced motion, not on :disabled and not on data-parallax="off".
const canParallax = !reduced && matchMedia('(hover: hover)').matches;
const PX = ['--px', '--py', '--rx', '--ry'], LX = ['--lx', '--ly'];
let cur = null, rect = null, label = null;   // rect is in document coordinates: scrolling doesn't break it
function labelOf(el) {
  let l = el.querySelector(':scope > .btn-l');
  if (!l) {   // wrapped on first hover: buttons created by script via textContent get the layer too
    l = document.createElement('span'); l.className = 'btn-l';
    l.append(...el.childNodes); el.append(l);
  }
  return l;
}
function begin(el) {
  const r = el.getBoundingClientRect();
  cur = el; rect = { left: r.left + scrollX, top: r.top + scrollY, width: r.width, height: r.height }; label = labelOf(el);
  el.classList.add('px-on');
}
function end() {
  if (!cur) return;
  cur.classList.remove('px-on');
  PX.forEach(p => cur.style.removeProperty(p));
  LX.forEach(p => label?.style.removeProperty(p));
  cur = rect = label = null;
}
addEventListener('pointermove', e => {
  const t = e.target.closest?.('.btn, .glass, .arr');
  if (!t) return end();
  const want = canParallax && e.pointerType !== 'touch' && t.matches('.btn, .arr') && !t.disabled && t.dataset.parallax !== 'off';
  if (want && t !== cur) { end(); begin(t); }
  if (!want && cur) end();
  const r = t === cur ? { left: rect.left - scrollX, top: rect.top - scrollY, width: rect.width, height: rect.height } : t.getBoundingClientRect();
  const fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
  t.style.setProperty('--mx', (fx * 100).toFixed(1) + '%');
  t.style.setProperty('--my', (fy * 100).toFixed(1) + '%');
  if (t !== cur) return;
  const nx = Math.max(-1, Math.min(1, fx * 2 - 1)), ny = Math.max(-1, Math.min(1, fy * 2 - 1));
  const k = Math.max(0.6, Math.min(1, r.height / 52));     // small header buttons sway less
  const kw = Math.min(1, 200 / r.width);                    // wide ones tilt less horizontally
  const s = cur.style, ls = label.style;
  s.setProperty('--px', (nx * 3 * k).toFixed(2) + 'px');
  s.setProperty('--py', (ny * 2 * k).toFixed(2) + 'px');
  s.setProperty('--ry', (nx * 4.5 * k * kw).toFixed(2) + 'deg');
  s.setProperty('--rx', (-ny * 4.5 * k).toFixed(2) + 'deg');
  ls.setProperty('--lx', (nx * 2.5 * k).toFixed(2) + 'px');   // on top of the body shift: ~5.5px total
  ls.setProperty('--ly', (ny * 1.5 * k).toFixed(2) + 'px');
}, { passive: true });
addEventListener('pointerout', e => { if (cur && !cur.contains(e.relatedTarget)) end(); }, { passive: true });
addEventListener('pointercancel', end);
addEventListener('blur', end);

// reveal on scroll (the hero animates itself, in CSS)
const io = new IntersectionObserver(es => {
  for (const e of es) if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}, { threshold: 0.15 });
for (const el of document.querySelectorAll('.rv')) if (!el.closest('.hero')) io.observe(el);

// header
const nav = document.querySelector('.nav');
if (nav) {
  const burger = nav.querySelector('.burger');
  burger?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  nav.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));
  if (nav.classList.contains('wait')) {
    const show = () => nav.classList.add('on');
    setTimeout(show, reduced ? 0 : +(nav.dataset.wait || 1400));
    addEventListener('scroll', () => scrollY > 40 && show(), { passive: true });
  }
  // active section in the links
  const links = [...nav.querySelectorAll('.nav-links a[href^="#"]')];
  const secs = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(es => {
    for (const e of es) if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }, { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach(s => spy.observe(s));
  const top = document.querySelector('.hero[id]'); if (top) spy.observe(top);   // nothing is highlighted in the hero
}

// glow: smooth transition of --glow to a color (an 'r,g,b' string)
let glow = getComputedStyle(document.documentElement).getPropertyValue('--acc-rgb').split(',').map(Number), glowTo = glow, glowRaf = 0;
export function setGlow(rgb) {
  glowTo = String(rgb).split(',').map(Number);
  if (reduced) { glow = glowTo; return apply(); }
  if (!glowRaf) glowRaf = requestAnimationFrame(step);
}
function step() {
  glow = glow.map((v, i) => v + (glowTo[i] - v) * 0.06);
  apply();
  glowRaf = glow.some((v, i) => Math.abs(v - glowTo[i]) > 0.5) ? requestAnimationFrame(step) : 0;
}
function apply() { document.documentElement.style.setProperty('--glow', glow.map(v => v | 0).join(',')); }

// toasts: a stack at the bottom, up to three at once. toast('text') | toast('text', { type: 'good'|'warn'|'bad', action: { label, onClick }, ms })
// Hovering with the mouse pauses the timer. Returns { close }.
const T_ICON = {
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  good: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  warn: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
  bad: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6M15 9l-6 6"/>',
};
let toastBox;
export function toast(text, opts = {}) {
  if (typeof opts === 'number') opts = { ms: opts };
  const { type = 'info', action, ms = action ? 5000 : 2600 } = opts;
  if (!toastBox) {
    toastBox = Object.assign(document.createElement('div'), { className: 'toasts' });
    toastBox.setAttribute('role', 'status'); toastBox.setAttribute('aria-live', 'polite'); document.body.append(toastBox);
  }
  const el = document.createElement('div'); el.className = 'toast ' + type;
  el.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${T_ICON[type] || T_ICON.info}</svg>`;
  el.append(Object.assign(document.createElement('span'), { textContent: text }));
  if (action) {
    const b = Object.assign(document.createElement('button'), { className: 't-act', type: 'button', textContent: action.label });
    b.addEventListener('click', () => { action.onClick?.(); close(); }); el.append(b);
  }
  toastBox.append(el);
  while (toastBox.children.length > 3) toastBox.firstElementChild.remove();
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
  let t, left = ms, started = Date.now();
  const run = () => { started = Date.now(); t = setTimeout(close, left); };
  el.addEventListener('pointerenter', () => { clearTimeout(t); left -= Date.now() - started; });
  el.addEventListener('pointerleave', run);
  function close() {
    clearTimeout(t); if (!el.isConnected) return;
    el.classList.add('out'); setTimeout(() => el.remove(), reduced ? 0 : 220);
  }
  run();
  return { close };
}

// <dialog class="sheet|drawer"> windows: openDialog(id|el) → Promise with the close value,
// closeDialog(el, value) — with the exit animation. data-open="id" opens, data-close="value" inside closes.
// Focus inside, Esc and the inert backdrop come from the browser (showModal); a click on the backdrop closes.
function wireDialog(d) {
  if (d._ng) return; d._ng = true;
  d.addEventListener('cancel', e => { e.preventDefault(); closeDialog(d, ''); });   // Esc also animates
  d.addEventListener('click', e => {
    if (e.target !== d) return;
    const r = d.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDialog(d, '');
  });
  d.addEventListener('close', () => { d._res?.(d.returnValue); d._res = null; });
}
export function openDialog(d) {
  d = typeof d === 'string' ? document.getElementById(d) : d;
  wireDialog(d);
  if (!d.open) { d.returnValue = ''; d.showModal(); }
  return new Promise(res => { d._res = res; });
}
export function closeDialog(d, value = '') {
  if (!d?.open || d.classList.contains('closing')) return;
  if (reduced) return d.close(value);
  d.classList.add('closing');
  setTimeout(() => { d.classList.remove('closing'); d.close(value); }, 230);
}
// confirmation: await confirmDialog({ title, text, ok, cancel, danger }) → true/false
export function confirmDialog({ title = 'Are you sure?', text = '', ok = 'Confirm', cancel = 'Cancel', danger = false } = {}) {
  const d = document.createElement('dialog'); d.className = 'sheet'; d.setAttribute('aria-labelledby', 'ng-cf-t');
  const h = Object.assign(document.createElement('h2'), { id: 'ng-cf-t', textContent: title });
  const p = Object.assign(document.createElement('p'), { textContent: text });
  const row = Object.assign(document.createElement('div'), { className: 'actions' });
  const no = Object.assign(document.createElement('button'), { className: 'ghost', type: 'button', textContent: cancel });
  const yes = Object.assign(document.createElement('button'), { className: 'btn ' + (danger ? 'danger' : 'pri'), type: 'button', textContent: ok });
  no.dataset.close = ''; yes.dataset.close = 'ok';
  row.append(no, yes); d.append(h, ...(text ? [p] : []), row); document.body.append(d);
  const done = openDialog(d).then(v => { setTimeout(() => d.remove(), 50); return v === 'ok'; });
  (danger ? no : yes).focus();   // a dangerous action isn't confirmed by an accidental Enter
  return done;
}
addEventListener('click', e => {
  const o = e.target.closest?.('[data-open]');
  if (o) { e.preventDefault(); openDialog(o.dataset.open); return; }
  const c = e.target.closest?.('dialog [data-close]');
  if (c) { e.preventDefault(); closeDialog(c.closest('dialog'), c.dataset.close); }
});

// menu on a button: <div class="menu-host"><button data-menu aria-controls="m1">…</button><div class="menu" id="m1" role="menu" hidden>
// [role=menuitem] items. Arrows ↑/↓, Home/End, Esc returns focus to the button, a click outside and Tab close it.
let menuOpen = null;
function menuItems(m) { return [...m.querySelectorAll(':is([role=menuitem],[role=menuitemradio],[role=menuitemcheckbox]):not([aria-disabled=true])')]; }
export function closeMenu(focusBtn) {
  if (!menuOpen) return; const { btn, m } = menuOpen; menuOpen = null;
  m.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (focusBtn) btn.focus();
}
function openMenu(btn) {
  const m = document.getElementById(btn.getAttribute('aria-controls')); if (!m) return;
  closeMenu(); m.hidden = false; btn.setAttribute('aria-expanded', 'true'); menuOpen = { btn, m };
  menuItems(m)[0]?.focus();
}
addEventListener('click', e => {
  const btn = e.target.closest?.('[data-menu]');
  if (btn) { e.preventDefault(); return menuOpen?.btn === btn ? closeMenu() : openMenu(btn); }
  if (menuOpen && e.target.closest?.('[role=menuitem],[role=menuitemradio]') && menuOpen.m.contains(e.target)) closeMenu(true);
});
addEventListener('pointerdown', e => { if (menuOpen && !menuOpen.m.contains(e.target) && !menuOpen.btn.contains(e.target)) closeMenu(); });
addEventListener('keydown', e => {
  const btn = e.target.closest?.('[data-menu]');
  if (btn && (e.key === 'ArrowDown' || e.key === 'ArrowUp') && !menuOpen) { e.preventDefault(); openMenu(btn); if (e.key === 'ArrowUp') menuItems(menuOpen.m).at(-1)?.focus(); return; }
  if (!menuOpen || !menuOpen.m.contains(e.target)) return;
  if (e.key === 'Escape') { e.preventDefault(); return closeMenu(true); }
  if (e.target.matches('input, textarea, select')) return;   // fields inside the menu (dates, search) keep their own arrows and Home/End
  const items = menuItems(menuOpen.m), i = items.indexOf(document.activeElement);
  const j = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: items.length - 1 }[e.key];
  if (j !== undefined) { e.preventDefault(); items[(j + items.length) % items.length]?.focus(); }
});
// the menu closes when focus leaves it (Tab inside a menu with fields is fine)
addEventListener('focusout', e => {
  if (!menuOpen || !menuOpen.m.contains(e.target)) return;
  const to = e.relatedTarget;
  if (to && (menuOpen.m.contains(to) || menuOpen.btn.contains(to))) return;
  if (!to) return;   // focus went nowhere (system calendar, a click on empty space): a click outside will close it
  closeMenu();
});

// swatches: <div class="swatches" role="group"> with <button style="--c:#hex" aria-label> — the pressed one gets aria-pressed
addEventListener('click', e => {
  const b = e.target.closest?.('.swatches button'); if (!b) return;
  b.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b));
});

// tabs: <div class="tabs" role="tablist"> with [role=tab][aria-controls]; the .tabs-ind capsule slides under the active tab,
// arrows ←/→, Home/End switch (WAI-ARIA tabs). initTabs(root) — for markup added later.
export function initTabs(root = document) {
  for (const list of root.querySelectorAll('.tabs[role=tablist]')) {
    if (list._ng) continue; list._ng = true;
    const tabs = [...list.querySelectorAll('[role=tab]')];
    const ind = list.querySelector('.tabs-ind') || list.appendChild(Object.assign(document.createElement('span'), { className: 'tabs-ind' }));
    const place = t => { list.style.setProperty('--x', t.offsetLeft + 'px'); list.style.setProperty('--w', t.offsetWidth + 'px'); list.style.setProperty('--sw', list.scrollWidth + 'px'); };
    const select = (t, focus) => {
      tabs.forEach(x => {
        const on = x === t; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
        const p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.hidden = !on;
      });
      place(t); if (focus) t.focus();
      list.dispatchEvent(new CustomEvent('tabchange', { detail: { tab: t } }));
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', e => {
        const j = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (j === undefined) return; e.preventDefault(); select(tabs[(j + tabs.length) % tabs.length], true);
      });
    });
    const cur = tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0];
    ind.style.transition = 'none'; select(cur); requestAnimationFrame(() => ind.style.transition = '');
    new ResizeObserver(() => place(tabs.find(t => t.getAttribute('aria-selected') === 'true'))).observe(list);
  }
}

// tab bar: the pressed item becomes current (for single-page apps; with plain links set aria-current in the markup)
addEventListener('click', e => {
  const a = e.target.closest?.('.tabbar :is(a,button)');
  if (!a) return;
  a.parentElement.querySelectorAll('[aria-current]').forEach(x => x.removeAttribute('aria-current'));
  a.setAttribute('aria-current', 'page');
});

// .range slider: fill up to the thumb (--p)
const rangeFill = r => r.style.setProperty('--p', ((r.value - (r.min || 0)) / ((r.max || 100) - (r.min || 0)) * 100) + '%');
addEventListener('input', e => { if (e.target.matches?.('.range')) rangeFill(e.target); });
document.querySelectorAll('.range').forEach(rangeFill);

// tooltip: any element with data-tip="text"; on mouse — on hover, from the keyboard — on focus
let tipEl, tipFor;
function showTip(el) {
  if (!tipEl) { tipEl = Object.assign(document.createElement('div'), { className: 'tooltip', role: 'tooltip', id: 'ng-tip' }); document.body.append(tipEl); }
  tipFor = el; tipEl.textContent = el.dataset.tip; el.setAttribute('aria-describedby', 'ng-tip');
  const r = el.getBoundingClientRect(), w = tipEl.offsetWidth, h = tipEl.offsetHeight;
  let x = r.left + r.width / 2 - w / 2, y = r.top - h - 8;
  if (y < 8) y = r.bottom + 8;
  x = Math.max(8, Math.min(x, innerWidth - w - 8));
  tipEl.style.transform = `translate(${x | 0}px,${y | 0}px)`;
  tipEl.classList.add('on');
}
function hideTip() { tipEl?.classList.remove('on'); tipFor?.removeAttribute('aria-describedby'); tipFor = null; }
addEventListener('pointerover', e => { const el = e.target.closest?.('[data-tip]'); if (el && e.pointerType !== 'touch') showTip(el); });
addEventListener('pointerout', e => { if (tipFor && !tipFor.contains(e.relatedTarget)) hideTip(); });
addEventListener('focusin', e => { const el = e.target.closest?.('[data-tip]'); if (el) showTip(el); });
addEventListener('focusout', hideTip);
addEventListener('scroll', hideTip, { passive: true });

// dropdown: select.input → glass panel (WAI-ARIA combobox + listbox). Mouse only: on touch screens
// the system picker wheel is more convenient. The real <select> stays inside — value, forms and the change event are unchanged.
// Turn it off for one list with data-native. initSelects(root) — for markup added later.
const CHEV = '<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M3.5 5.5 7 9l3.5-3.5"/></svg>';
const TICK = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7"/></svg>';
let openSel = null, selN = 0;
export function initSelects(root = document) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  for (const sel of root.querySelectorAll('select.input:not([multiple]):not([data-native])')) {
    if (sel._ng) continue; sel._ng = true;
    const id = 'ngs' + ++selN, wrap = document.createElement('div');
    wrap.className = 'ng-select' + (sel.style.width === 'auto' ? ' inline' : '');
    sel.before(wrap); wrap.append(sel);
    sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'input ng-trigger'; btn.style.cssText = sel.style.cssText; btn.style.width = sel.style.width === 'auto' ? 'auto' : '';
    btn.setAttribute('role', 'combobox'); btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', id);
    const lbl = sel.getAttribute('aria-label') || sel.closest('label')?.querySelector('span')?.textContent;
    if (lbl) btn.setAttribute('aria-label', lbl);
    btn.innerHTML = '<span></span>' + CHEV; wrap.append(btn);
    const text = btn.firstChild, opts = () => [...sel.options];
    const sync = () => { text.textContent = sel.selectedOptions[0]?.textContent ?? ''; };
    sync(); sel.addEventListener('change', sync);
    sel.closest('label')?.addEventListener('click', e => { if (e.target !== btn && !btn.contains(e.target)) { e.preventDefault(); btn.focus(); } });
    let list = null, act = -1;
    const enabled = i => !opts()[i]?.disabled;
    const move = (from, step) => { const n = opts().length; for (let k = 1; k <= n; k++) { const j = from + step * k; if (j < 0 || j >= n) break; if (enabled(j)) return j; } return from; };
    const mark = i => {
      act = i; if (!list) return;
      list.querySelectorAll('[role=option]').forEach(li => li.classList.toggle('act', +li.dataset.i === i));
      const li = list.querySelector(`[data-i="${i}"]`); if (li) { btn.setAttribute('aria-activedescendant', li.id); li.scrollIntoView({ block: 'nearest' }); }
    };
    function open() {
      if (list) return; openSel?.close(); openSel = api;
      list = document.createElement('ul'); list.id = id; list.className = 'ng-list'; list.setAttribute('role', 'listbox'); if (lbl) list.setAttribute('aria-label', lbl);
      let lastGroup = null;
      opts().forEach((o, i) => {
        const g = o.parentElement.tagName === 'OPTGROUP' ? o.parentElement : null;
        if (g && g !== lastGroup) { const h = document.createElement('li'); h.className = 'grp'; h.setAttribute('role', 'presentation'); h.textContent = g.label; list.append(h); lastGroup = g; }
        const li = document.createElement('li'); li.id = `${id}-${i}`; li.dataset.i = i; li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', o.selected); if (o.disabled) li.setAttribute('aria-disabled', 'true');
        li.append(document.createTextNode(o.textContent)); li.insertAdjacentHTML('beforeend', TICK);
        li.addEventListener('pointermove', () => enabled(i) && act !== i && mark(i));
        li.addEventListener('click', () => enabled(i) && choose(i));
        list.append(li);
      });
      wrap.append(list);
      const r = btn.getBoundingClientRect(), h = list.offsetHeight;   // not enough room below: open upward
      wrap.classList.toggle('up', innerHeight - r.bottom < h + 12 && r.top > innerHeight - r.bottom);
      wrap.classList.add('open'); btn.setAttribute('aria-expanded', 'true');
      mark(sel.selectedIndex);
    }
    function close() {
      if (!list) return; list.remove(); list = null; openSel = null;
      wrap.classList.remove('open', 'up'); btn.setAttribute('aria-expanded', 'false'); btn.removeAttribute('aria-activedescendant');
    }
    function choose(i) {
      const changed = sel.selectedIndex !== i; sel.selectedIndex = i; sync(); close(); btn.focus();
      if (changed) { sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); }
    }
    const api = { close };
    btn.addEventListener('click', () => list ? close() : open());
    let typed = '', typedT = 0;
    btn.addEventListener('keydown', e => {
      const n = opts().length;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (!list) return open(); mark(move(act, e.key === 'ArrowDown' ? 1 : -1)); }
      else if (e.key === 'Home' || e.key === 'End') { if (!list) return; e.preventDefault(); mark(e.key === 'Home' ? move(-1, 1) : move(n, -1)); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (!list) open(); else if (act >= 0) choose(act); }
      else if (e.key === 'Escape') { if (list) { e.preventDefault(); close(); } }
      else if (e.key === 'Tab') close();
      else if (e.key.length === 1 && /\S/.test(e.key)) {   // type-ahead by first letters
        clearTimeout(typedT); typed += e.key.toLowerCase(); typedT = setTimeout(() => typed = '', 600);
        const j = opts().findIndex((o, i) => !o.disabled && o.textContent.trim().toLowerCase().startsWith(typed));
        if (j >= 0) list ? mark(j) : choose(j);
      }
    });
  }
}
addEventListener('pointerdown', e => { if (openSel && !e.target.closest?.('.ng-select.open')) openSel.close(); });

// ---------------------------------------------------------------- sites: email code, consent, video, gallery, carousel

// email code: <div class="otp" data-otp> with one <input> per digit. Forward on input, Backspace goes back, pasting a whole code.
// When all cells are filled — an 'otpcomplete' event with detail.code. otpError(el) — shake and clear.
export function initOtp(root = document) {
  for (const box of root.querySelectorAll('.otp[data-otp]')) {
    if (box._ng) continue; box._ng = true;
    const cells = [...box.querySelectorAll('input')];
    cells.forEach((c, i) => {
      c.maxLength = 1; c.inputMode = c.inputMode || 'numeric'; c.autocomplete = i ? 'off' : 'one-time-code';
      c.setAttribute('aria-label', `Digit ${i + 1} of ${cells.length}`);
      c.addEventListener('input', () => {
        const v = c.value.replace(/\s/g, '');
        if (v.length > 1) return fill(v, i);   // autofill from SMS/email puts the whole code into the first cell
        c.value = v; c.classList.toggle('full', !!v); box.classList.remove('err');
        if (v && cells[i + 1]) cells[i + 1].focus();
        check();
      });
      c.addEventListener('keydown', e => {
        if (e.key === 'Backspace' && !c.value && cells[i - 1]) { cells[i - 1].focus(); cells[i - 1].value = ''; cells[i - 1].classList.remove('full'); e.preventDefault(); }
        if (e.key === 'ArrowLeft' && cells[i - 1]) cells[i - 1].focus();
        if (e.key === 'ArrowRight' && cells[i + 1]) cells[i + 1].focus();
      });
      c.addEventListener('paste', e => { e.preventDefault(); fill(e.clipboardData.getData('text'), i); });
      c.addEventListener('focus', () => c.select());
    });
    function fill(text, from) {
      const chars = text.replace(/\s/g, '').split('');
      box.classList.remove('err');
      cells.slice(from).forEach((c, k) => { if (chars[k] !== undefined) { c.value = chars[k]; c.classList.add('full'); } });
      cells[Math.min(cells.length - 1, from + chars.length)].focus(); check();
    }
    function check() { const code = cells.map(c => c.value).join(''); if (code.length === cells.length) box.dispatchEvent(new CustomEvent('otpcomplete', { detail: { code } })); }
  }
}
export function otpError(box) {
  box.classList.add('err', 'shake');
  setTimeout(() => { box.classList.remove('shake'); box.querySelectorAll('input').forEach(c => { c.value = ''; c.classList.remove('full'); }); box.querySelector('input').focus(); }, 420);
}

// cookie consent: <div class="consent" data-consent="key" hidden> with data-consent-choice="all|necessary" buttons.
// The choice is stored in localStorage; without storage (private mode) the banner simply shows again.
export function initConsent(root = document) {
  for (const box of root.querySelectorAll('[data-consent]')) {
    const key = 'ng-consent:' + box.dataset.consent;
    let saved = null; try { saved = localStorage.getItem(key); } catch {}
    if (saved) { box.dispatchEvent(new CustomEvent('consent', { detail: { choice: saved } })); continue; }
    box.hidden = false;
    box.addEventListener('click', e => {
      const b = e.target.closest('[data-consent-choice]'); if (!b) return;
      try { localStorage.setItem(key, b.dataset.consentChoice); } catch {}
      box.hidden = true; box.dispatchEvent(new CustomEvent('consent', { detail: { choice: b.dataset.consentChoice } }));
    });
  }
}

// video with a poster: <button class="video" data-src="file.mp4"> or data-yt="ID" — the player loads only on click
addEventListener('click', e => {
  const v = e.target.closest?.('.video[data-src], .video[data-yt]'); if (!v || v.querySelector('video,iframe')) return;
  let m;
  if (v.dataset.src) { m = Object.assign(document.createElement('video'), { src: v.dataset.src, controls: true, autoplay: true, playsInline: true }); }
  else { m = Object.assign(document.createElement('iframe'), { src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.dataset.yt)}?autoplay=1&rel=0`, allow: 'autoplay; encrypted-media; picture-in-picture', allowFullscreen: true, title: v.getAttribute('aria-label') || 'Video' }); }
  v.querySelector('.play')?.remove(); v.querySelector('.cap')?.remove(); v.append(m); v.style.cursor = 'default';
});

// gallery: <div class="gallery"> with <button data-full="large.jpg" data-caption="…"><img></button> → fullscreen viewer,
// ←/→ and swipe flip through, Esc closes
let lb;
function lightbox(items, start) {
  if (!lb) {
    lb = document.createElement('dialog'); lb.className = 'lightbox'; lb.setAttribute('aria-label', 'Viewer');
    lb.innerHTML = `<figure><figcaption></figcaption></figure>
      <button class="btn icon-only x" data-close aria-label="Close">✕</button>
      <button class="arr glass prev" aria-label="Previous">‹</button><button class="arr glass next" aria-label="Next">›</button>`;
    document.body.append(lb);
    let x0 = null;
    lb.addEventListener('pointerdown', e => { x0 = e.clientX; });
    lb.addEventListener('pointerup', e => { if (x0 !== null && Math.abs(e.clientX - x0) > 50) lb._go(e.clientX < x0 ? 1 : -1); x0 = null; });
    lb.addEventListener('keydown', e => { if (e.key === 'ArrowRight') lb._go(1); if (e.key === 'ArrowLeft') lb._go(-1); });
    lb.querySelector('.prev').onclick = () => lb._go(-1);
    lb.querySelector('.next').onclick = () => lb._go(1);
  }
  let i = start;
  const show = () => {
    const it = items[i], fig = lb.querySelector('figure');
    const img = Object.assign(document.createElement('img'), { src: it.dataset.full || it.querySelector('img')?.src, alt: it.querySelector('img')?.alt || '' });
    fig.querySelector('img')?.remove(); fig.prepend(img);
    fig.querySelector('figcaption').textContent = it.dataset.caption || img.alt;
    lb.querySelector('.prev').disabled = items.length < 2; lb.querySelector('.next').disabled = items.length < 2;
  };
  lb._go = d => { i = (i + d + items.length) % items.length; show(); };
  show(); openDialog(lb);
}
addEventListener('click', e => {
  const b = e.target.closest?.('.gallery button'); if (!b) return;
  const items = [...b.closest('.gallery').querySelectorAll('button')];
  lightbox(items, items.indexOf(b));
});

// carousel: <div class="carousel"><div class="rail">slides</div><div class="dots"></div></div> — dots per slide,
// the current one stretches into a capsule; a click scrolls to it
export function initCarousels(root = document) {
  for (const c of root.querySelectorAll('.carousel')) {
    if (c._ng) continue;
    const rail = c.querySelector('.rail'), dots = c.querySelector('.dots'), slides = [...(rail?.children || [])];
    if (!dots || !slides.length) continue;   // slides may appear later: call initCarousels() again then
    c._ng = true;
    dots.replaceChildren(...slides.map((s, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', `Slide ${i + 1} of ${slides.length}`); b.onclick = () => s.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest', inline: 'center' }); return b; }));
    const mark = i => [...dots.children].forEach((d, k) => d.toggleAttribute('aria-current', k === i));
    // the current one is the slide whose center is closest to the rail's center (several can be in view)
    let raf = 0;
    const pick = () => { raf = 0; const mid = rail.getBoundingClientRect().left + rail.clientWidth / 2;
      let best = 0, d = Infinity; slides.forEach((s, i) => { const r = s.getBoundingClientRect(), dd = Math.abs(r.left + r.width / 2 - mid); if (dd < d) { d = dd; best = i; } }); mark(best); };
    rail.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(pick); }, { passive: true });
    pick();
  }
}

// ---------------------------------------------------------------- apps

// command palette: const pal = commandPalette({ items: [{ group, label, hint, kbd, icon, run }], placeholder })
// Ctrl/⌘+K opens it (hotkey: false — don't bind), letters match in any word order, ↑/↓, Enter, Esc.
export function commandPalette({ items, placeholder = 'Type a command or search…', hotkey = true } = {}) {
  const d = document.createElement('dialog'); d.className = 'cmdk'; d.setAttribute('aria-label', 'Command palette');
  d.innerHTML = `<div class="q"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    <input role="combobox" aria-expanded="true" aria-controls="ng-cmdk-l" aria-autocomplete="list"></div><ul id="ng-cmdk-l" role="listbox"></ul>
    <div class="foot-keys"><span><kbd>↑</kbd><kbd>↓</kbd> select</span><span><kbd>Enter</kbd> run</span><span><kbd>Esc</kbd> close</span></div>`;
  document.body.append(d);
  const q = d.querySelector('input'), ul = d.querySelector('ul'); q.placeholder = placeholder; q.setAttribute('aria-label', placeholder);
  let shown = [], act = 0;
  // match: the query letters appear in order within the label; returns positions for highlighting
  const match = (text, query) => { const t = text.toLowerCase(), pos = []; let k = 0; for (const ch of query.toLowerCase()) { if (ch === ' ') continue; k = t.indexOf(ch, k); if (k < 0) return null; pos.push(k++); } return pos; };
  function render() {
    const query = q.value.trim(); ul.replaceChildren(); shown = [];
    let group = null;
    for (const it of items) {
      const pos = query ? match(it.label, query) : [];
      if (!pos) continue;
      if (it.group && it.group !== group) { group = it.group; ul.append(Object.assign(document.createElement('li'), { className: 'grp', role: 'presentation', textContent: group })); }
      const li = document.createElement('li'); li.setAttribute('role', 'option'); li.id = 'ng-cmd-' + shown.length;
      if (it.icon) li.insertAdjacentHTML('beforeend', it.icon);
      const lab = document.createElement('span');
      [...it.label].forEach((ch, i) => lab.append(pos.includes(i) ? Object.assign(document.createElement('mark'), { textContent: ch }) : document.createTextNode(ch)));
      li.append(lab);
      if (it.hint) li.append(Object.assign(document.createElement('span'), { className: 'h', textContent: it.hint }));
      if (it.kbd) li.append(Object.assign(document.createElement('kbd'), { textContent: it.kbd }));
      const n = shown.length;
      li.addEventListener('pointermove', () => n !== act && mark(n));
      li.addEventListener('click', () => runAt(n));
      ul.append(li); shown.push({ it, li });
    }
    if (!shown.length) ul.append(Object.assign(document.createElement('li'), { className: 'none', textContent: 'Nothing found' }));
    mark(0);
  }
  function mark(i) {
    act = i; shown.forEach((s, k) => { s.li.classList.toggle('act', k === i); s.li.setAttribute('aria-selected', k === i); });
    if (shown[i]) { q.setAttribute('aria-activedescendant', shown[i].li.id); shown[i].li.scrollIntoView({ block: 'nearest' }); } else q.removeAttribute('aria-activedescendant');
  }
  function runAt(i) { const s = shown[i]; if (!s) return; closeDialog(d); setTimeout(() => s.it.run?.(), 0); }
  q.addEventListener('input', render);
  q.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); if (shown.length) mark((act + (e.key === 'ArrowDown' ? 1 : -1) + shown.length) % shown.length); }
    else if (e.key === 'Enter') { e.preventDefault(); runAt(act); }
  });
  const api = { open() { q.value = ''; render(); openDialog(d); q.focus(); }, close() { closeDialog(d); }, el: d };
  if (hotkey) addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k' || (e.ctrlKey || e.metaKey) && e.code === 'KeyK') { e.preventDefault(); d.open ? api.close() : api.open(); } });
  return api;
}

// date range: <div class="menu-host daterange"> with a [data-menu] button (label in a <span>), in the menu
// [role=menuitemradio] items with data-days (0 — today) or data-range="month"; a .custom block with two input[type=date] and a button.
// 'rangechange' event on .daterange: detail { from, to, label } (ISO dates).
const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;   // local date, not UTC
export function initDateRanges(root = document) {
  for (const host of root.querySelectorAll('.daterange')) {
    if (host._ng) continue; host._ng = true;
    const btn = host.querySelector('[data-menu]'), label = btn.querySelector('span') || btn;
    const emit = (from, to, text, item) => {
      host.querySelectorAll('[role=menuitemradio]').forEach(x => x.setAttribute('aria-checked', x === item));
      label.textContent = text; host.dispatchEvent(new CustomEvent('rangechange', { detail: { from, to, label: text } }));
    };
    host.querySelectorAll('[role=menuitemradio]').forEach(it => {
      if (!it.querySelector('svg')) it.insertAdjacentHTML('beforeend', TICK);
      it.addEventListener('click', () => {
        const to = new Date(), from = new Date();
        if (it.dataset.range === 'month') from.setDate(1); else from.setDate(to.getDate() - (+it.dataset.days || 0));
        emit(iso(from), iso(to), it.textContent.trim(), it);
      });
    });
    const custom = host.querySelector('.custom');
    custom?.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); custom.querySelector('.btn').click(); } });
    custom?.querySelector('.btn')?.addEventListener('click', () => {
      const [a, b] = custom.querySelectorAll('input[type=date]');
      if (!a.value || !b.value || a.value > b.value) { a.classList.toggle('err', !a.value || a.value > b.value); b.classList.toggle('err', !b.value); return; }
      a.classList.remove('err'); b.classList.remove('err');
      const f = s => { const [y, m, d] = s.split('-'); return new Date(y, m - 1, d).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }); };
      emit(a.value, b.value, `${f(a.value)} – ${f(b.value)}`, null); closeMenu(true);
    });
  }
}

// file upload: <label class="dropzone"><input type="file" multiple>…</label> (+ data-list="id" of a .files list).
// 'files' event on .dropzone: detail.items = [{ file, el, progress(0..100), done() }] — the app does the actual sending.
const fmtSize = b => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(0) + ' KB' : (b / 1048576).toFixed(1) + ' MB';
export function initDropzones(root = document) {
  for (const z of root.querySelectorAll('.dropzone')) {
    if (z._ng) continue; z._ng = true;
    const input = z.querySelector('input[type=file]'), list = z.dataset.list && document.getElementById(z.dataset.list);
    const take = files => {
      const items = [...files].map(file => {
        let el = null, bar = null;
        if (list) {
          el = document.createElement('li');
          const ext = (file.name.split('.').pop() || '').slice(0, 4);
          el.innerHTML = '<span class="fi"></span><span class="nm"></span><span class="sz"></span><div class="progress"><i></i></div>';
          el.querySelector('.fi').textContent = ext; el.querySelector('.nm').textContent = file.name; el.querySelector('.sz').textContent = fmtSize(file.size);
          bar = el.querySelector('.progress'); list.append(el);
        }
        return { file, el, progress(p) { bar?.style.setProperty('--p', p + '%'); }, done() { el?.classList.add('done'); } };
      });
      z.dispatchEvent(new CustomEvent('files', { detail: { items } }));
    };
    ['dragenter', 'dragover'].forEach(t => z.addEventListener(t, e => { e.preventDefault(); z.classList.add('over'); }));
    ['dragleave', 'drop'].forEach(t => z.addEventListener(t, () => z.classList.remove('over')));
    z.addEventListener('drop', e => { e.preventDefault(); take(e.dataTransfer.files); });
    input.addEventListener('change', () => { take(input.files); input.value = ''; });
  }
}

// tags: <div class="tags" data-tags><input placeholder="…"></div> (+ data-sug="id" of a .tags-sug block with buttons).
// Enter or comma adds, Backspace in an empty field removes the last one, × on a tag deletes it. 'tagschange' event { tags }.
export function initTagInputs(root = document) {
  for (const box of root.querySelectorAll('.tags[data-tags]')) {
    if (box._ng) continue; box._ng = true;
    const input = box.querySelector('input'), tags = [];
    const emit = () => box.dispatchEvent(new CustomEvent('tagschange', { detail: { tags: [...tags] } }));
    const add = raw => {
      const t = raw.trim().replace(/,$/, ''); if (!t || tags.some(x => x.toLowerCase() === t.toLowerCase())) return;
      tags.push(t);
      const chip = Object.assign(document.createElement('span'), { className: 'tag' }); chip.append(document.createTextNode(t));
      const x = Object.assign(document.createElement('button'), { type: 'button', textContent: '✕' }); x.setAttribute('aria-label', 'Remove ' + t);
      x.onclick = () => { tags.splice(tags.indexOf(t), 1); chip.remove(); input.focus(); emit(); };
      chip.append(x); input.before(chip); emit();
    };
    input.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) { e.preventDefault(); add(input.value); input.value = ''; }
      else if (e.key === 'Backspace' && !input.value && tags.length) { box.querySelectorAll('.tag')[tags.length - 1]?.querySelector('button').click(); }
    });
    input.addEventListener('blur', () => { if (input.value.trim()) { add(input.value); input.value = ''; } });
    box.addEventListener('click', e => { if (e.target === box) input.focus(); });
    const sug = box.dataset.sug && document.getElementById(box.dataset.sug);
    sug?.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { add(b.textContent); input.focus(); } });
    [...(box.dataset.value || '').split(',').filter(Boolean)].forEach(add);
  }
}

// number field: <div class="num-input"><button data-step="-1">−</button><input value min max step><button data-step="1">+</button></div>
// holding a button accelerates, ↑/↓ arrows in the field, the value is clamped to min…max. 'change' event on input.
export function initNumInputs(root = document) {
  for (const box of root.querySelectorAll('.num-input')) {
    if (box._ng) continue; box._ng = true;
    const input = box.querySelector('input'), min = +(input.min || -Infinity), max = +(input.max || Infinity), step = +(input.step || 1);
    const dec = (String(step).split('.')[1] || '').length;
    const set = v => {
      v = Math.min(max, Math.max(min, Math.round(v / step) * step)); const s = v.toFixed(dec);
      if (input.value !== s) { input.value = s; input.dispatchEvent(new Event('change', { bubbles: true })); }
      box.querySelector('[data-step="-1"]').disabled = v <= min; box.querySelector('[data-step="1"]').disabled = v >= max;
    };
    const val = () => parseFloat(input.value.replace(',', '.')) || 0;
    set(val());
    box.querySelectorAll('[data-step]').forEach(b => {
      let t;
      const stop = () => clearTimeout(t);
      b.addEventListener('pointerdown', e => {
        e.preventDefault(); let delay = 380;
        const tick = () => { set(val() + step * +b.dataset.step); t = setTimeout(tick, delay = Math.max(40, delay * .8)); };
        tick();
      });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, stop));
      b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(val() + step * +b.dataset.step); } });
    });
    input.addEventListener('keydown', e => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); set(val() + step * (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 10 : 1)); } });
    input.addEventListener('blur', () => set(val()));
  }
}

// character counter: <span class="count-chars"></span> inside a .field with a textarea/input[maxlength]
addEventListener('input', e => {
  const f = e.target.closest?.('.field'), c = f?.querySelector('.count-chars'); if (!c || !e.target.maxLength || e.target.maxLength < 0) return;
  const n = e.target.value.length; c.textContent = `${n} / ${e.target.maxLength}`; c.classList.toggle('over', n >= e.target.maxLength);
});

// row selection: <table class="tbl" data-select id="t1"> — a <input type="checkbox"> in the first cell of the header and rows;
// a <div class="bulkbar" data-bulk-for="t1" hidden> panel with <b data-count>. 'selectionchange' event { rows }.
addEventListener('change', e => {
  const cb = e.target; if (!cb.matches?.('table[data-select] input[type=checkbox]')) return;
  const t = cb.closest('table'), rows = [...t.tBodies[0].rows], all = t.tHead.querySelector('input[type=checkbox]');
  if (cb === all) rows.forEach(r => { const c = r.querySelector('input[type=checkbox]'); if (c) c.checked = all.checked; });
  rows.forEach(r => r.setAttribute('aria-selected', !!r.querySelector('input[type=checkbox]')?.checked));
  const sel = rows.filter(r => r.getAttribute('aria-selected') === 'true');
  all.checked = sel.length === rows.length && rows.length > 0; all.indeterminate = sel.length > 0 && sel.length < rows.length;
  const bar = document.querySelector(`.bulkbar[data-bulk-for="${t.id}"]`);
  if (bar) { bar.hidden = !sel.length; const c = bar.querySelector('[data-count]'); if (c) c.textContent = sel.length; }
  t.dispatchEvent(new CustomEvent('selectionchange', { detail: { rows: sel } }));
});

initTabs();
initSelects();
initOtp();
initConsent();
initCarousels();
initDateRanges();
initDropzones();
initTagInputs();
initNumInputs();
window.NightGlass = { setGlow, toast, initTabs, initSelects, openDialog, closeDialog, confirmDialog, closeMenu, initOtp, otpError, initConsent, initCarousels, commandPalette, initDateRanges, initDropzones, initTagInputs, initNumInputs };
