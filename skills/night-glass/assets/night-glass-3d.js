// Night Glass 3D: a “living” object in the hero, built on three.js. It rises on a spring, breathes, turns toward the cursor,
// spins with a finger and inertia then settles back, hops on tap, and its screen “powers on” with a brightness overshoot.
// The light beneath it and the rim light are tinted with --glow. One object is the page's hero, not decoration.
//
// Setup (importmap + module):
//   <script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js",
//     "three/addons/":"https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"}}</script>
//   import { mountHero } from './night-glass-3d.js'
//   const hero = await mountHero(canvas, { model: 'puck', screen: myCanvas, onTap, onSpin, onPowered })
//   model: 'puck' | 'slab' | your own builder function | 'path/to/model.glb' | { url, screen: 'ScreenMeshName', spin, tilt }
//   hero.dispose(): release WebGL
//   onSpin(delta): rotation in radians. On 'puck' the rim turns (like a real dial); on 'slab' and custom models the whole object turns
//   hero.setGlow('255,159,90'); hero.screenChanged(); hero.hop()
// If WebGL is unavailable it throws: catch it and show a flat image (class .no-gl on the parent).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = x => Math.max(0, Math.min(1, x));
const ease = x => { x = clamp01(x); return 1 - Math.pow(1 - x, 3); };
// spring: stiffness k, damping c, which give weight and character
const spring = (x, v, to, k, c, dt) => { v += ((to - x) * k - v * c) * dt; return [x + v * dt, v]; };

export function radialTexture(inner = 'rgba(255,255,255,1)', outer = 'rgba(255,255,255,0)') {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, inner); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------------------------------------------------------------- models
// puck: a round disc with a dark anodized body, a knurled ring, a round glass screen and a light ring underneath
function buildPuck(tex) {
  const g = new THREE.Group();
  const R = 0.78, H = 0.36, r = 0.07;
  const pts = [new THREE.Vector2(0, -H / 2)];
  for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + i / 8 * Math.PI / 2; pts.push(new THREE.Vector2(R - r + Math.cos(a) * r, -H / 2 + r + Math.sin(a) * r)); }
  for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI / 2; pts.push(new THREE.Vector2(R - r + Math.cos(a) * r, H / 2 - r + Math.sin(a) * r)); }
  pts.push(new THREE.Vector2(0, H / 2));
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 96), new THREE.MeshPhysicalMaterial({ color: 0x1d1d22, metalness: 0.65, roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: 1.1 }));
  const spinner = new THREE.Group(); g.add(spinner);   // only the knurled body spins, so the screen stays readable
  spinner.add(body);
  // knurled rim
  const knurl = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.004, R + 0.004, H * 0.42, 160, 1, true), new THREE.MeshStandardMaterial({ color: 0x3a3a42, metalness: 0.9, roughness: 0.45, envMapIntensity: 1.2 }));
  knurl.position.y = 0.02;
  const nb = document.createElement('canvas'); nb.width = 512; nb.height = 8;
  const nx = nb.getContext('2d'); for (let i = 0; i < 512; i += 4) { nx.fillStyle = i % 8 ? '#777' : '#fff'; nx.fillRect(i, 0, 2, 8); }
  knurl.material.bumpMap = new THREE.CanvasTexture(nb); knurl.material.bumpMap.wrapS = THREE.RepeatWrapping; knurl.material.bumpMap.repeat.set(4, 1); knurl.material.bumpScale = 0.6;
  spinner.add(knurl);
  // screen
  const display = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0, roughness: 0.2 });
  const screen = new THREE.Mesh(new THREE.CircleGeometry(R * 0.78, 96), display);
  screen.rotation.x = -Math.PI / 2; screen.position.y = H / 2 + 0.002;
  g.add(screen);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(R * 0.82, 96), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.08, roughness: 0.05, clearcoat: 1, envMapIntensity: 1.6 }));
  glass.rotation.x = -Math.PI / 2; glass.position.y = H / 2 + 0.006;
  g.add(glass);
  // light ring at the base
  const led = new THREE.Mesh(new THREE.TorusGeometry(R * 0.92, 0.012, 12, 128), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  led.rotation.x = Math.PI / 2; led.position.y = -H / 2 + 0.01;
  g.add(led);
  g.rotation.x = 0.95;   // screen faces the viewer, slightly from above
  return { group: g, spinner, screen, display, led, size: { w: 1.7, h: 1.45 } };
}
// slab: a rounded tile with a screen (phone, tablet, remote, card)
function buildSlab(tex) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new RoundedBoxGeometry(1.1, 1.5, 0.12, 6, 0.1), new THREE.MeshPhysicalMaterial({ color: 0xe9e8e4, roughness: 0.45, sheen: 0.4, clearcoat: 0.15, envMapIntensity: 0.6 }));
  g.add(body);
  const display = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0, roughness: 0.2 });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 1.36), display);
  screen.position.z = 0.061;
  g.add(screen);
  return { group: g, spinner: null, screen, display, led: null, size: { w: 1.4, h: 1.7 } };
}
const MODELS = { puck: buildPuck, slab: buildSlab };

// custom model from .glb/.gltf: { url, screen: 'ScreenMeshName', spin: 'SpinningPartName', tilt: 0.3, flipY: false }
// The model is centered and scaled to the scene; a canvas texture goes on the screen mesh (if a screen canvas is passed).
async function buildGltf(spec, tex) {
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const gltf = await new GLTFLoader().loadAsync(spec.url);
  const root = gltf.scene, g = new THREE.Group(), inner = new THREE.Group();
  inner.add(root); g.add(inner);
  const box = new THREE.Box3().setFromObject(root), size = box.getSize(new THREE.Vector3()), center = box.getCenter(new THREE.Vector3());
  const k = 1.5 / Math.max(size.x, size.y, size.z || 1);   // longest side ≈ 1.5 units
  root.position.sub(center); inner.scale.setScalar(k);
  let screen = null, display = null, spinner = null;
  root.traverse(o => {
    if (!o.isMesh) return;
    [].concat(o.material || []).forEach(m => { if ("envMapIntensity" in m) m.envMapIntensity ??= 1; });
    if (spec.screen && o.name === spec.screen) {
      screen = o;
      display = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0, roughness: 0.2 });
      if (tex) { tex.flipY = spec.flipY ?? false; o.material = display; }   // glTF UVs run top to bottom by spec; flipY: true is for non-standard models
    }
    if (spec.spin && o.name === spec.spin) spinner = o;
  });
  if (!display) display = new THREE.MeshStandardMaterial();   // no screen: “power on” simply affects nothing
  g.rotation.x = spec.tilt ?? 0;
  return { group: g, spinner, screen: screen || root, display, led: null, size: { w: size.x * k * 1.15, h: size.y * k * 1.15 } };
}

// ---------------------------------------------------------------- hero
export async function mountHero(cv, opts = {}) {
  const { model = 'puck', screen: scr = null, glow = getComputedStyle(document.documentElement).getPropertyValue('--glow').trim() || '169,139,255',
    onTap = () => {}, onSpin = () => {}, onPowered = () => {}, anchor = null } = opts;
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 60);

  // lights: warm key; rim and bottom in the glow color; hemisphere fill; a point light that follows the cursor
  const key = new THREE.DirectionalLight(0xfff4ea, 0); key.position.set(-2.2, 3.4, 2.6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0); rim.position.set(1.8, 1.4, -2.8); scene.add(rim);
  const under = new THREE.DirectionalLight(0xffffff, 0); under.position.set(0, -3, 1.5); scene.add(under);
  const fill = new THREE.HemisphereLight(0xffffff, 0x1a1a22, 0); scene.add(fill);
  const spot = new THREE.PointLight(0xffffff, 0, 6, 1.8); scene.add(spot);

  const FLOOR = -1.25;
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), new THREE.MeshBasicMaterial({ map: radialTexture('rgba(0,0,0,.7)'), transparent: true, depthWrite: false, opacity: 0 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.set(0, FLOOR, -0.1); scene.add(shadow);
  const spill = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2), new THREE.MeshBasicMaterial({ map: radialTexture(), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  spill.rotation.x = -Math.PI / 2; spill.position.set(0, FLOOR + 0.01, 0.5); scene.add(spill);

  let tex;
  if (scr) { tex = new THREE.CanvasTexture(scr); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = renderer.capabilities.getMaxAnisotropy(); }
  else { tex = radialTexture('rgba(40,40,48,1)', 'rgba(0,0,0,1)'); }
  const spec = typeof model === 'string' && /\.(glb|gltf)(\?|$)/i.test(model) ? { url: model } : model;
  const M = spec && spec.url ? await buildGltf(spec, scr ? tex : null) : (MODELS[spec] || spec)(tex);
  const rig = new THREE.Group(); rig.add(M.group); scene.add(rig);

  // camera: the object fills the free row of the hero (anchor) and sits at its center
  let halfW = 2;
  function resize() {
    const w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    const c = cv.getBoundingClientRect(), s = (anchor || cv).getBoundingClientRect();
    const slotH = Math.max(180, s.height), slotCy = s.top - c.top + s.height / 2;
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const d = Math.max(M.size.h / (2 * tan * 0.86 * slotH / h), M.size.w / (2 * tan * camera.aspect * 0.8));
    camera.position.set(0, d * 0.12, d); camera.lookAt(0, 0, 0);
    camera.setViewOffset(w, h, 0, h / 2 - slotCy, w, h); camera.updateProjectionMatrix();
    halfW = d * tan * camera.aspect;
  }
  resize(); addEventListener('resize', resize); new ResizeObserver(resize).observe(anchor || cv);

  const b = { y: reduced ? 0 : -1.4, vy: 0, sq: 1, vsq: 0, wob: 0, s: reduced ? 1 : 0.82, vs: 0 };
  const spin = { y: reduced ? 0 : -2.6, x: reduced ? 0 : 0.5, vy: 0, vx: 0, at: 0 };
  const look = { y: 0, x: 0, vy: 0, vx: 0 };
  const ptr = { x: 0, y: 0, tx: 0, ty: 0, moved: performance.now() };
  addEventListener('pointermove', e => { ptr.tx = e.clientX / innerWidth * 2 - 1; ptr.ty = e.clientY / innerHeight * 2 - 1; ptr.moved = performance.now(); }, { passive: true });

  // grab, spin, tap
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const drag = { on: false, x: 0, y: 0, t: 0, moved: 0, hit: false };
  const hits = e => { const r = cv.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); return ray.intersectObject(rig, true).length > 0; };
  cv.addEventListener('pointerdown', e => {
    const hit = hits(e); Object.assign(drag, { on: true, x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, hit });
    if (!hit) return; spin.vy = spin.vx = 0; b.vsq += 2; cv.setPointerCapture(e.pointerId);   // “oops!” squash on grab
  });
  cv.addEventListener('pointermove', e => {
    if (!drag.on) { cv.style.cursor = hits(e) ? 'grab' : 'default'; return; }
    if (!drag.hit) return;
    const now = performance.now(), dx = e.clientX - drag.x, dy = e.clientY - drag.y, dts = Math.max(0.008, (now - drag.t) / 1000);
    drag.x = e.clientX; drag.y = e.clientY; drag.t = now; drag.moved += Math.abs(dx) + Math.abs(dy);
    if (e.pointerType === 'touch' && drag.moved < 12 && Math.abs(dy) > Math.abs(dx)) return;   // this is page scrolling
    if (M.spinner) {   // dial: horizontal movement spins the rim around its axis, with inertia
      knob.v = -dx * 0.011 / dts; turn(-dx * 0.011);
    } else {
      spin.y += dx * 0.011; spin.x = Math.max(-1.1, Math.min(1.1, spin.x + dy * 0.009));
      spin.vy = dx * 0.011 / dts; spin.vx = dy * 0.009 / dts; onSpin(dx * 0.011);
    }
    spin.at = now; cv.style.cursor = 'grabbing';
  });
  const release = () => {
    if (!drag.on) return; drag.on = false; spin.at = performance.now(); cv.style.cursor = 'grab';
    if (drag.hit && drag.moved < 6) { knob.v = 0; hop(); onTap(); }
  };
  cv.addEventListener('pointerup', release); cv.addEventListener('pointercancel', release);
  function hop() { b.vy += 2.6; b.vsq -= 2.6; }
  const knob = { v: 0 };
  function turn(d) { M.spinner.rotation.y += d; onSpin(-d); }

  // glow
  const g0 = glow.split(',').map(Number), glowC = { r: g0[0], g: g0[1], b: g0[2] }, glowTo = { ...glowC };
  const _c = new THREE.Color(), WHITE = new THREE.Color(1, 1, 1);
  function setGlow(rgb) { const [r, g, bl] = String(rgb).split(',').map(Number); Object.assign(glowTo, { r, g, b: bl }); }

  let visible = true;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(cv);
  const t0 = performance.now(); let last = t0, poweredAt = 0, power = 0, screenDirty = true;

  let alive = true;
  function frame(now) {
    if (!alive) return;
    requestAnimationFrame(frame);
    if (!visible || document.hidden) { last = now; return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const t = now - t0;
    // the light fades in together with the object
    const kl = reduced ? 1 : ease(t / 1200);
    key.intensity = 2.2 * kl; rim.intensity = 2.4 * kl; fill.intensity = 0.35 * kl; spot.intensity = 1.4 * kl;
    // body: rises, floats, breathes
    const float = reduced ? 0 : Math.sin(now / 1700) * 0.06;
    [b.y, b.vy] = spring(b.y, b.vy, float, t < 250 ? 0 : 16, 5.5, dt);
    [b.s, b.vs] = spring(b.s, b.vs, 1, t < 250 ? 0 : 60, 9, dt);
    [b.sq, b.vsq] = spring(b.sq, b.vsq, 1 + (reduced ? 0 : Math.sin(now / 1300) * 0.006), 420, 13, dt);
    // free spin with inertia, then back toward the viewer via the nearest full turn
    if (M.spinner && !drag.on && Math.abs(knob.v) > 0.01) { turn(knob.v * dt); knob.v *= Math.pow(0.06, dt); }
    if (!drag.on) {
      spin.y += spin.vy * dt; spin.x += spin.vx * dt;
      spin.vy *= Math.pow(0.04, dt); spin.vx *= Math.pow(0.02, dt);
      spin.x = Math.max(-1.1, Math.min(1.1, spin.x));
      if (t > 400 && (now - spin.at > 2200 || t < 3000)) {
        const home = Math.round(spin.y / (Math.PI * 2)) * Math.PI * 2;
        spin.y = lerp(spin.y, home, 1 - Math.pow(t < 3000 ? 0.12 : 0.3, dt));
        spin.x = lerp(spin.x, 0, 1 - Math.pow(t < 3000 ? 0.1 : 0.25, dt));
      }
    }
    // gaze follows the cursor; with no cursor for 6 s it slowly looks around on its own
    const idle = now - ptr.moved > 6000;
    ptr.x = lerp(ptr.x, idle ? Math.sin(now / 2900) * 0.6 : ptr.tx, 0.06);
    ptr.y = lerp(ptr.y, idle ? Math.sin(now / 4100) * 0.3 : ptr.ty, 0.06);
    [look.y, look.vy] = spring(look.y, look.vy, ptr.x * 0.5, 38, 7.5, dt);
    [look.x, look.vx] = spring(look.x, look.vx, ptr.y * 0.12, 50, 9, dt);
    const sy = Math.max(0, -cv.getBoundingClientRect().top / innerHeight);   // how far the scene itself is scrolled (for the hero this equals page scroll)
    rig.position.y = b.y + sy * 0.25;
    rig.rotation.set(look.x + spin.x + sy * 0.3, look.y + spin.y, 0);
    rig.scale.set(b.s / Math.sqrt(b.sq), b.s * b.sq, b.s / Math.sqrt(b.sq));
    const lift = clamp01((b.y + 0.3) / 0.6);
    shadow.scale.setScalar(1.05 - lift * 0.2); shadow.material.opacity = (0.75 - lift * 0.25) * kl;
    // the screen wakes once the object is in place: flash 1.4 → 1.05
    if (!poweredAt && t > (reduced ? 0 : 900)) { poweredAt = now; setTimeout(onPowered, 650); }
    if (poweredAt) { const p = (now - poweredAt) / 900; power = reduced ? 1.05 : p < 0.25 ? p / 0.25 * 1.4 : lerp(1.4, 1.05, ease((p - 0.25) / 0.75)); }
    M.display.emissiveIntensity = power;
    // glow: rim light, bottom light, the pool of light below, the light ring
    glowC.r = lerp(glowC.r, glowTo.r, 0.04); glowC.g = lerp(glowC.g, glowTo.g, 0.04); glowC.b = lerp(glowC.b, glowTo.b, 0.04);
    _c.setRGB(glowC.r / 255, glowC.g / 255, glowC.b / 255, THREE.SRGBColorSpace);
    rim.color.copy(_c).lerp(WHITE, 0.25); under.color.copy(_c); under.intensity = 0.9 * Math.min(1, power);
    spill.material.color.copy(_c); spill.material.opacity = 0.24 * Math.min(1, power);
    if (M.led) M.led.material.color.copy(_c).multiplyScalar(0.4 + Math.min(1, power) * 1.2);
    spot.position.set(ptr.x * 2.2, 1.6 - ptr.y * 0.8, 2.4);
    if (screenDirty && scr) { tex.needsUpdate = true; screenDirty = false; }
    renderer.render(scene, camera);
  }
  requestAnimationFrame(frame);

  return {
    setGlow, hop,
    screenChanged() { screenDirty = true; },
    project(x = 0.5, y = 0.5, z = 0.2) {   // a point on the object → canvas pixels (for a speech bubble)
      const v = new THREE.Vector3(x, y, z).applyMatrix4(M.group.matrixWorld).project(camera);
      const r = cv.getBoundingClientRect(); return { x: (v.x + 1) / 2 * r.width, y: (1 - v.y) / 2 * r.height };
    },
    get halfWidth() { return halfW; },
    dispose() {   // stop and release WebGL (before swapping the model or leaving the page)
      alive = false; renderer.dispose(); pmrem.dispose();
      scene.traverse(o => { o.geometry?.dispose(); [].concat(o.material || []).forEach(m => { Object.values(m).forEach(v => v?.isTexture && v.dispose()); m.dispose?.(); }); });
    },
  };
}
