/* ==========================================================================
   MAGINTEK — dummy 3D warehouse operations dashboard (Three.js)
   Semua data di file ini adalah data dummy. Ubah BRAND / SITES sesuka hati.
   ========================================================================== */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

const BRAND = 'MAGINTEK';

/* ---------------------------------- Palette --------------------------------- */
const C = {
  bg: 0xe9ecfa, ground: 0xe3e6f6, pad: 0xf3f4fb, road: 0xc6cbea, line: 0xffffff,
  blue: 0x3d68ee, blueDark: 0x2a50d8, blueLight: 0x7b98f6, roofBlue: 0x5a80f2,
  white: 0xf7f8fd, wall: 0xeef0f8, grey: 0xd6daea, greyDark: 0x9aa1bf,
  card: 0xdcae73, cardDark: 0xc99657, tape: 0xf1d7a8, pallet: 0xc49a6c,
  teal: 0x25a99c, yellow: 0xf6b73c, yellowDark: 0xe39a1c, dark: 0x30354d,
  glass: 0x9db3ff, warm: 0xffe6b8, tree1: 0x86d39a, tree2: 0x6fc489, trunk: 0xa48f7a,
  skin: 0xf2b48b, vest: 0xf07a3a, crate: 0x3a66ee, crateLid: 0x5d85f5, parking: 0xf2c766,
};

/* ----------------------------------- Data ----------------------------------- */
const SITES = [
  {
    code: 'WH-01', kind: 'DEPOT', name: 'Rungkut Hub', addr: 'Jl. Rungkut Industri II, Surabaya', x: 0,
    stock: 1412, cap: 1800, stockDelta: 15, ontime: 96.6, outbound: 23, putaway: 15,
    inventory: [
      { n: 'Cardboard Box (M)', q: 1906, ic: 'box' },
      { n: 'Plastic Container', q: 297, ic: 'crate' },
      { n: 'Safety Helmet', q: 112, ic: 'helmet', low: 150 },
      { n: 'Packing Tape', q: 4449, ic: 'tape' },
    ],
  },
  {
    code: 'WH-03', kind: 'COLD STORE', name: 'Perak Cold Chain', addr: 'Jl. Perak Barat, Surabaya', x: 100,
    stock: 990, cap: 1400, stockDelta: 20, ontime: 96.0, outbound: 31, putaway: 20,
    inventory: [
      { n: 'Frozen Shrimp 10 kg', q: 334, ic: 'snow' },
      { n: 'Mineral Water 24-pack', q: 364, ic: 'drop' },
      { n: 'Nitrile Gloves', q: 95, ic: 'glove', low: 120 },
      { n: 'Plastic Container', q: 206, ic: 'crate' },
    ],
  },
  {
    code: 'WH-05', kind: 'CROSS-DOCK', name: 'Ngoro Cross-Dock', addr: 'Ngoro Industrial Park, Mojokerto', x: 200,
    stock: 642, cap: 1000, stockDelta: -8, ontime: 94.8, outbound: 44, putaway: 9,
    inventory: [
      { n: 'Electronics Carton', q: 418, ic: 'box' },
      { n: 'Pallet Wrap', q: 61, ic: 'tape', low: 80 },
      { n: 'Spare Parts Kit', q: 152, ic: 'crate' },
      { n: 'Detergent 5 L', q: 730, ic: 'drop' },
    ],
  },
];
const STEPS = ['Order placed', 'Picked', 'Packed', 'Loaded', 'In transit', 'Delivered'];
const DESTS = ['Malang DC', 'Sidoarjo Store #12', 'Gresik Plant', 'Pasuruan DC', 'Kediri Retail', 'Jember Hub'];

/* --------------------------------- Helpers --------------------------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
let seed = 7;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
const rint = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
const fmt = (n) => Math.round(n).toLocaleString('en-US');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/* --------------------------------- Renderer -------------------------------- */
const canvas = $('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
scene.background = new THREE.Color(C.bg);
scene.fog = new THREE.Fog(C.bg, 190, 360);

const camera = new THREE.PerspectiveCamera(30, 1, 1, 1200);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = 1.22;
controls.minPolarAngle = 0.35;
controls.minDistance = 22;
controls.maxDistance = 260;
controls.screenSpacePanning = false;
controls.autoRotateSpeed = 0.6;

const hemi = new THREE.HemisphereLight(0xffffff, 0xb9c1ea, 1.35);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfffaf2, 2.9);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 1, far: 260 });
sun.shadow.bias = -0.0004;
sun.shadow.normalBias = 0.03;
if ('intensity' in sun.shadow) sun.shadow.intensity = 0.42;
scene.add(sun, sun.target);
const SUN_OFFSET = new THREE.Vector3(-14, 70, 52);

/* ---------------------------- Geometry & materials -------------------------- */
const geoCache = new Map();
const matCache = new Map();
function boxGeo(w, h, d, r = 0) {
  const k = `${w}|${h}|${d}|${r}`;
  if (!geoCache.has(k)) geoCache.set(k, r > 0 ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2)) : new THREE.BoxGeometry(w, h, d));
  return geoCache.get(k);
}
function mat(color, o = {}) {
  if (o.map) return new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: o.rough ?? 0.8, metalness: 0, map: o.map, transparent: !!o.transparent });
  const k = `${color}|${o.rough ?? 0.8}|${o.emissive ?? 0}|${o.opacity ?? 1}`;
  if (!matCache.has(k)) {
    matCache.set(k, new THREE.MeshStandardMaterial({
      color, roughness: o.rough ?? 0.8, metalness: o.metal ?? 0,
      emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1,
      transparent: (o.opacity ?? 1) < 1, opacity: o.opacity ?? 1, depthWrite: (o.opacity ?? 1) >= 1,
    }));
  }
  return matCache.get(k);
}
function shade(m, cast = true) { m.castShadow = cast; m.receiveShadow = true; return m; }
/** Box whose bottom sits at y. */
function B(w, h, d, color, x = 0, y = 0, z = 0, o = {}) {
  const m = new THREE.Mesh(boxGeo(w, h, d, o.r || 0), o.material || mat(color, o));
  m.position.set(x, y + h / 2, z);
  return shade(m, o.cast !== false);
}
function cyl(rt, rb, h, color, x = 0, y = 0, z = 0, seg = 20, o = {}) {
  const k = `c${rt}|${rb}|${h}|${seg}`;
  if (!geoCache.has(k)) geoCache.set(k, new THREE.CylinderGeometry(rt, rb, h, seg));
  const m = new THREE.Mesh(geoCache.get(k), o.material || mat(color, o));
  m.position.set(x, y + h / 2, z);
  return shade(m, o.cast !== false);
}
function sphere(r, color, x = 0, y = 0, z = 0, o = {}) {
  const k = `s${r}`;
  if (!geoCache.has(k)) geoCache.set(k, new THREE.SphereGeometry(r, 20, 14));
  const m = new THREE.Mesh(geoCache.get(k), o.material || mat(color, o));
  m.position.set(x, y, z);
  return shade(m, o.cast !== false);
}

/* ------------------------------ Canvas textures ----------------------------- */
function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
const hex = (n) => '#' + n.toString(16).padStart(6, '0');
function ribTex(base, line, rx, ry = 1) {
  return canvasTex(64, 64, (g, w, h) => {
    g.fillStyle = hex(base); g.fillRect(0, 0, w, h);
    g.fillStyle = hex(line); g.fillRect(0, 0, 9, h);
    g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(9, 0, 4, h);
  }, [rx, ry]);
}
function windowTex(rx, ry) {
  return canvasTex(128, 128, (g, w, h) => {
    g.fillStyle = '#f6f7fd'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#c9d5fb';
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) g.fillRect(10 + i * 30, 12 + j * 30, 20, 16);
  }, [rx, ry]);
}
function drawCube(g, x, y, s) {
  g.fillStyle = '#2f5bea';
  g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.87, y - s / 2); g.lineTo(x + s * 0.87, y + s / 2); g.lineTo(x, y + s); g.lineTo(x - s * 0.87, y + s / 2); g.lineTo(x - s * 0.87, y - s / 2); g.closePath(); g.fill();
  g.fillStyle = '#7d9bf8';
  g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.87, y - s / 2); g.lineTo(x, y); g.lineTo(x - s * 0.87, y - s / 2); g.closePath(); g.fill();
}
let logoTexture, roofLogoTexture;
function makeLogoTextures() {
  logoTexture = canvasTex(512, 200, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    drawCube(g, 70, h / 2, 46);
    g.fillStyle = '#2047c4';
    g.font = '800 78px "Plus Jakarta Sans", Arial, sans-serif';
    g.textBaseline = 'middle';
    g.fillText(BRAND, 130, h / 2 + 4);
  });
  roofLogoTexture = canvasTex(256, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(128, 128, 120, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#2f5bea'; g.beginPath(); g.arc(128, 128, 98, 0, Math.PI * 2); g.fill();
    g.save(); g.translate(0, 0);
    g.fillStyle = '#ffffff';
    const s = 56, x = 128, y = 128;
    g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.87, y - s / 2); g.lineTo(x + s * 0.87, y + s / 2); g.lineTo(x, y + s); g.lineTo(x - s * 0.87, y + s / 2); g.lineTo(x - s * 0.87, y - s / 2); g.closePath(); g.fill();
    g.fillStyle = '#c9d6ff';
    g.beginPath(); g.moveTo(x, y - s); g.lineTo(x + s * 0.87, y - s / 2); g.lineTo(x, y); g.lineTo(x - s * 0.87, y - s / 2); g.closePath(); g.fill();
    g.restore();
  });
}
function decal(tex, w, h) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.7, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.receiveShadow = true;
  return m;
}

/* --------------------------------- Models ---------------------------------- */
function makePallet(w = 2, d = 2) {
  const g = new THREE.Group();
  g.add(B(w, 0.08, d, C.pallet, 0, 0.16, 0, { r: 0.02 }));
  for (const z of [-d / 2 + 0.12, 0, d / 2 - 0.12]) g.add(B(w, 0.16, 0.22, C.pallet, 0, 0, z));
  return g;
}
function makeStack(layers = 2, size = 2) {
  const g = makePallet(size, size);
  const n = 2, bs = (size / n) * 0.95, bh = bs * 0.78;
  let y = 0.24;
  for (let l = 0; l < layers; l++) {
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      if (l === layers - 1 && l > 0 && rnd() < 0.3) continue;
      const x = (i - 0.5) * (size / n), z = (j - 0.5) * (size / n);
      g.add(B(bs, bh, bs, rnd() < 0.5 ? C.card : C.cardDark, x, y, z, { r: 0.05 }));
      g.add(B(bs * 0.2, 0.012, bs * 1.004, C.tape, x, y + bh, z, { cast: false }));
    }
    y += bh;
  }
  return g;
}
function makeCrates(layers = 1, size = 2) {
  const g = makePallet(size, size);
  const bs = size / 2 * 0.95, bh = bs * 0.85;
  let y = 0.24;
  for (let l = 0; l < layers; l++) {
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
      const x = (i - 0.5) * size / 2, z = (j - 0.5) * size / 2;
      g.add(B(bs, bh, bs, C.crate, x, y, z, { r: 0.08 }));
      g.add(B(bs * 1.02, 0.1, bs * 1.02, C.crateLid, x, y + bh - 0.1, z, { r: 0.04 }));
    }
    y += bh;
  }
  return g;
}
function makeTree(s = 1) {
  const g = new THREE.Group();
  g.add(cyl(0.12 * s, 0.16 * s, 1.1 * s, C.trunk));
  const f = sphere(0.9 * s, rnd() < 0.5 ? C.tree1 : C.tree2, 0, 1.1 * s + 0.95 * s, 0);
  f.scale.set(1, 1.35, 1);
  g.add(f);
  return g;
}
function makePin(color = C.blue) {
  const g = new THREE.Group();
  const head = new THREE.Group();
  head.add(sphere(0.55, color, 0, 0, 0));
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.85, 20), mat(color));
  tip.rotation.x = Math.PI; tip.position.y = -0.55; shade(tip);
  head.add(tip);
  // white dot visible from the camera side
  const ring = new THREE.Mesh(new THREE.CircleGeometry(0.24, 24), mat(0xffffff));
  ring.position.set(0, 0.05, 0.56);
  head.add(ring);
  const ring2 = ring.clone(); ring2.position.set(0.56, 0.05, 0); ring2.rotation.y = Math.PI / 2; head.add(ring2);
  g.add(head);
  const sh = new THREE.Mesh(new THREE.CircleGeometry(0.45, 24), new THREE.MeshBasicMaterial({ color: 0x1e2a6a, transparent: true, opacity: 0.12, depthWrite: false }));
  sh.rotation.x = -Math.PI / 2;
  g.add(sh);
  g.userData.head = head;
  return g;
}

function makeForklift() {
  const g = new THREE.Group();
  g.add(B(1.7, 0.72, 1.15, C.yellow, -0.05, 0.28, 0, { r: 0.12 }));
  g.add(B(0.55, 0.95, 1.15, C.yellowDark, -0.85, 0.28, 0, { r: 0.12 }));
  // driver
  g.add(B(0.38, 0.55, 0.46, C.vest, -0.3, 1.0, 0, { r: 0.12 }));
  g.add(sphere(0.21, C.skin, -0.28, 1.78, 0));
  g.add(sphere(0.22, C.yellow, -0.3, 1.86, 0)).scale.set(1, 0.6, 1);
  // cage
  for (const [x, z] of [[0.25, 0.5], [0.25, -0.5], [-0.75, 0.5], [-0.75, -0.5]]) g.add(B(0.07, 1.25, 0.07, C.dark, x, 1.0, z));
  g.add(B(1.12, 0.07, 1.12, C.dark, -0.25, 2.24, 0, { r: 0.03 }));
  // wheels
  for (const [x, z] of [[0.48, 0.58], [0.48, -0.58], [-0.65, 0.58], [-0.65, -0.58]]) {
    const w = cyl(0.3, 0.3, 0.26, 0x2a2e3f, 0, 0, 0, 16);
    w.rotation.x = Math.PI / 2; w.position.set(x, 0.3, z);
    g.add(w);
  }
  // mast
  g.add(B(0.09, 2.4, 0.09, C.dark, 0.88, 0.1, 0.36));
  g.add(B(0.09, 2.4, 0.09, C.dark, 0.88, 0.1, -0.36));
  g.add(B(0.09, 0.09, 0.8, C.dark, 0.88, 2.42, 0));
  const carriage = new THREE.Group();
  carriage.add(B(0.08, 0.6, 0.9, 0x454b66, 0, 0, 0));
  carriage.add(B(1.05, 0.06, 0.13, 0x454b66, 0.55, 0, 0.26));
  carriage.add(B(1.05, 0.06, 0.13, 0x454b66, 0.55, 0, -0.26));
  const load = makeStack(1, 1.05);
  load.position.set(0.6, 0.06, 0);
  carriage.add(load);
  carriage.position.set(0.97, 0.14, 0);
  g.add(carriage);
  g.userData.carriage = carriage;
  g.userData.load = load;
  return g;
}

function makeTruck(cab = C.blue, { logo = true, trailer = 0xffffff, short = false } = {}) {
  const g = new THREE.Group();
  const L = short ? 3.4 : 5.0; // trailer length
  const tx = short ? -0.2 : -0.85;
  g.add(B(short ? 5.2 : 6.8, 0.35, 1.9, C.dark, short ? 0.6 : 0, 0.45, 0));
  // cab
  const cx = short ? 2.15 : 2.45;
  g.add(B(1.7, 1.95, 2.25, cab, cx, 0.62, 0, { r: 0.18 }));
  g.add(B(0.06, 0.75, 1.85, C.glass, cx + 0.85, 1.6, 0, { r: 0.02, rough: 0.2 }));
  g.add(B(0.7, 0.6, 2.28, 0x9fb3f5, cx + 0.2, 1.65, 0, { r: 0.04, rough: 0.3 }));
  g.add(B(0.12, 0.3, 2.0, 0xe9edff, cx + 0.88, 0.85, 0, { r: 0.04 }));
  // trailer
  g.add(B(L, 2.65, 2.4, trailer, tx, 0.66, 0, { r: 0.08 }));
  g.add(B(L + 0.02, 0.32, 2.42, cab, tx, 0.82, 0, { r: 0.02 }));
  if (logo && logoTexture) {
    for (const s of [1, -1]) {
      const d = decal(logoTexture, short ? 2.4 : 3.2, short ? 0.94 : 1.25);
      d.position.set(tx, 2.0, s * 1.215);
      if (s < 0) d.rotation.y = Math.PI;
      g.add(d);
    }
  }
  const wx = short ? [2.3, -1.1] : [2.5, -1.6, -2.6];
  for (const x of wx) for (const z of [1.0, -1.0]) {
    const w = cyl(0.46, 0.46, 0.34, 0x262a3a, 0, 0, 0, 18);
    w.rotation.x = Math.PI / 2; w.position.set(x, 0.46, z);
    g.add(w);
    const hub = cyl(0.2, 0.2, 0.36, 0xbcc3dd, 0, 0, 0, 12, { cast: false });
    hub.rotation.x = Math.PI / 2; hub.position.set(x, 0.46, z);
    g.add(hub);
  }
  return g;
}

function gableTriangle(d, rise, color) {
  const s = new THREE.Shape();
  s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(0, rise); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false });
  const m = new THREE.Mesh(geo, mat(color));
  m.rotation.y = Math.PI / 2;
  return shade(m);
}

/** Blue gable warehouse with dock doors on +z face. */
function makeWarehouse({ w, d, h, doors = [], color = C.blue, roof = C.roofBlue, roofLine = 0x4a72ea, logo = true }) {
  const g = new THREE.Group();
  const wallTex = ribTex(color, 0x3159dc, w / 1.1, 1);
  g.add(B(w, h, d, color, 0, 0, 0, { material: mat(color, { map: wallTex }) }));
  g.add(B(w + 0.1, 0.5, d + 0.1, C.blueDark, 0, 0, 0));
  const a = 0.24, rise = (d / 2) * Math.tan(a);
  for (const s of [1, -1]) {
    const Lr = d / 2 / Math.cos(a) + 0.55;
    const r = new THREE.Mesh(boxGeo(w + 0.7, 0.26, Lr), mat(roof, { map: ribTex(roof, roofLine, (w + 0.7) / 0.9, 1) }));
    r.position.set(0, h + rise / 2 + 0.05, s * (d / 4 + 0.08));
    r.rotation.x = s * a;
    g.add(shade(r));
  }
  g.add(B(w + 0.75, 0.18, 0.5, C.blueDark, 0, h + rise - 0.02, 0));
  for (const s of [1, -1]) {
    const t = gableTriangle(d, rise, color);
    t.position.set(s > 0 ? w / 2 - 0.12 : -w / 2, h, 0);
    g.add(t);
  }
  if (logo) {
    const lg = decal(roofLogoTexture, 3.2, 3.2);
    lg.position.set(0, h + rise / 2 + 0.05 + Math.cos(a) * 0.16, d / 4 + 0.08 + Math.sin(a) * 0.16);
    lg.rotation.x = -Math.PI / 2 + a;
    g.add(lg);
  }
  for (const x of doors) addDoor(g, x, d / 2, Math.min(3.6, h - 1.2));
  return g;
}
function addDoor(g, x, z, h = 3.6, w = 2.8, dir = 1) {
  g.add(B(w + 0.4, h + 0.25, 0.22, 0xf4f6ff, x, 0, z + dir * 0.06));
  g.add(B(w, h, 0.24, C.warm, x, 0, z + dir * 0.09, { emissive: 0xffc777, ei: 0.25 }));
  // a few boxes visible inside
  g.add(B(0.8, 0.7, 0.05, C.card, x - 0.55, 0, z + dir * 0.22, { cast: false }));
  g.add(B(0.8, 0.7, 0.05, C.cardDark, x + 0.35, 0, z + dir * 0.22, { cast: false }));
  g.add(B(0.8, 0.7, 0.05, C.card, x - 0.1, 0.7, z + dir * 0.22, { cast: false }));
  // canopy
  g.add(B(w + 0.8, 0.12, 0.9, 0xffffff, x, h + 0.35, z + dir * 0.45));
}
function makeColdStore({ w, d, h, doors }) {
  const g = new THREE.Group();
  g.add(B(w, h, d, 0xf4f5fb, 0, 0, 0, { material: mat(0xffffff, { map: ribTex(0xf5f6fc, 0xe2e5f2, w / 1.4, 1) }) }));
  // blue trims
  for (const [x, z] of [[w / 2, d / 2], [-w / 2, d / 2], [w / 2, -d / 2], [-w / 2, -d / 2]]) g.add(B(0.35, h + 0.1, 0.35, C.blueDark, x, 0, z));
  g.add(B(w + 0.4, 0.35, 0.35, C.blueDark, 0, h - 0.2, d / 2));
  g.add(B(w + 0.4, 0.35, 0.35, C.blueDark, 0, h - 0.2, -d / 2));
  g.add(B(0.35, 0.35, d + 0.4, C.blueDark, w / 2, h - 0.2, 0));
  g.add(B(0.35, 0.35, d + 0.4, C.blueDark, -w / 2, h - 0.2, 0));
  g.add(B(w - 0.2, 0.08, d - 0.2, 0xeceef8, 0, h, 0, { cast: false }));
  // AC units
  for (const z of [-d / 4, d / 4 - 1]) for (let x = -w / 2 + 4; x < w / 2 - 2; x += 5.5) {
    g.add(B(2.2, 0.7, 1.6, 0xe1e4f0, x, h + 0.08, z, { r: 0.08 }));
    for (const dx of [-0.5, 0.5]) {
      const f = cyl(0.38, 0.38, 0.06, 0x7c84a8, x + dx, h + 0.78, z, 16, { cast: false });
      g.add(f);
    }
  }
  const lg = decal(roofLogoTexture, 2.2, 2.2);
  lg.position.set(0, h + 0.13, 0); lg.rotation.x = -Math.PI / 2;
  g.add(lg);
  // dock platform
  g.add(B(w + 0.4, 1.0, 3.2, 0xe5e8f4, 0, 0, d / 2 + 1.6));
  g.add(B(w + 0.4, 0.14, 0.2, C.yellow, 0, 0.88, d / 2 + 3.15, { cast: false }));
  for (const x of doors) {
    g.add(B(3.1, 4.3, 0.2, 0xf9faff, x, 1.0, d / 2 + 0.05));
    g.add(B(2.7, 3.8, 0.22, C.warm, x, 1.0, d / 2 + 0.08, { emissive: 0xffc777, ei: 0.25 }));
    g.add(B(2.8, 0.25, 0.15, 0x2a2e3f, x, 1.0, d / 2 + 3.2));
  }
  return g;
}
function makeRack(len = 8, depth = 1.6, levels = 3, lh = 1.3) {
  const g = new THREE.Group();
  for (let x = -len / 2; x <= len / 2 + 0.01; x += len / 3) for (const z of [-depth / 2, depth / 2]) g.add(B(0.12, levels * lh + 0.3, 0.12, C.blue, x, 0, z));
  for (let l = 1; l <= levels; l++) {
    for (const z of [-depth / 2, depth / 2]) g.add(B(len + 0.12, 0.12, 0.1, 0xf08a3c, 0, l * lh - 0.12, z));
    for (let i = 0; i < 3; i++) {
      if (rnd() < 0.2) continue;
      const x = -len / 2 + len / 6 + i * len / 3;
      const s = makeStack(1, 1.3);
      s.position.set(x, (l - 1) * lh, 0);
      g.add(s);
    }
  }
  return g;
}
function makeContainer(color = C.teal) {
  const g = new THREE.Group();
  g.add(B(6.4, 2.7, 2.6, color, 0, 0, 0, { material: mat(color, { map: ribTex(color, 0x1c8f84, 14, 1) }) }));
  g.add(B(6.5, 0.12, 2.7, 0x1c8f84, 0, 2.7, 0));
  return g;
}
function makeSilo(r = 2, h = 8) {
  const g = new THREE.Group();
  g.add(cyl(r, r, h, 0xf3f4fa, 0, 0, 0, 28));
  const top = new THREE.Mesh(new THREE.SphereGeometry(r, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xf3f4fa));
  top.position.y = h; top.scale.y = 0.5;
  g.add(shade(top));
  for (const y of [h * 0.3, h * 0.65]) g.add(cyl(r + 0.05, r + 0.05, 0.2, 0xd8dcee, 0, y, 0, 28, { cast: false }));
  return g;
}
function makeBuilding(w, h, d, base = 0xf7f8fd) {
  const g = new THREE.Group();
  const tex = windowTex(w / 4, h / 4);
  g.add(B(w, h, d, base, 0, 0, 0, { material: mat(0xffffff, { map: tex }) }));
  g.add(B(w + 0.3, 0.3, d + 0.3, 0xe5e8f5, 0, h, 0));
  return g;
}
function makeGuardHouse() {
  const g = new THREE.Group();
  g.add(B(3, 2.6, 3, 0xf7f8fd, 0, 0, 0, { r: 0.08 }));
  g.add(B(3.6, 0.3, 3.6, C.blue, 0, 2.6, 0, { r: 0.06 }));
  g.add(B(1.6, 0.9, 0.05, C.glass, 0, 1.2, 1.52, { rough: 0.2 }));
  return g;
}
function fenceLine(parent, x1, z1, x2, z2, hedge = false) {
  const len = Math.hypot(x2 - x1, z2 - z1), ang = Math.atan2(-(z2 - z1), x2 - x1);
  const g = new THREE.Group();
  g.position.set(x1, 0, z1); g.rotation.y = ang;
  const n = Math.max(1, Math.round(len / 2.5));
  for (let i = 0; i <= n; i++) g.add(B(0.1, 1.6, 0.1, 0xb9bfdc, (i / n) * len, 0, 0));
  g.add(B(len, 1.3, 0.04, 0xcfd6f7, len / 2, 0.15, 0, { opacity: 0.45, cast: false }));
  g.add(B(len, 0.06, 0.08, 0xb9bfdc, len / 2, 1.55, 0, { cast: false }));
  if (hedge) g.add(B(len, 0.9, 1.1, C.tree1, len / 2, 0, 1.2, { r: 0.4 }));
  parent.add(g);
  return g;
}
function slot(parent, x, z, w, d, color = C.parking) {
  const t = 0.16;
  parent.add(B(w, 0.02, t, color, x, 0, z - d / 2, { cast: false }));
  parent.add(B(w, 0.02, t, color, x, 0, z + d / 2, { cast: false }));
  parent.add(B(t, 0.02, d, color, x - w / 2, 0, z, { cast: false }));
  parent.add(B(t, 0.02, d, color, x + w / 2, 0, z, { cast: false }));
}

/* ------------------------------- World state -------------------------------- */
const state = { site: 0, selected: null, fleetTab: 'docks', overview: false };
const siteGroups = [];
const entities = [];         // forklifts & trucks
const movers = [];
const pins = [];
const traffic = [];
const pickRoots = [];
const docks = SITES.map(() => []);
const labels = [];

class Mover {
  constructor(obj, pts, { speed = 4, pauseA = 2, pauseB = 2, start = 0 } = {}) {
    this.obj = obj;
    this.curve = new THREE.CatmullRomCurve3(pts.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'catmullrom', 0.3);
    this.len = this.curve.getLength();
    this.speed = speed; this.pauseA = pauseA; this.pauseB = pauseB;
    this.u = start; this.dir = 1; this.wait = start === 0 ? pauseA * Math.random() : 0;
    this.place();
  }
  get atA() { return this.wait > 0 && this.u <= 0; }
  get atB() { return this.wait > 0 && this.u >= 1; }
  update(dt) {
    if (this.wait > 0) { this.wait -= dt; return; }
    // slow near the ends for a smoother feel
    const edge = Math.min(this.u, 1 - this.u) * this.len;
    const v = this.speed * clamp(0.25 + edge / 4, 0.25, 1);
    this.u += (this.dir * v * dt) / this.len;
    if (this.u >= 1) { this.u = 1; this.dir = -1; this.wait = this.pauseB; this.onB?.(); }
    else if (this.u <= 0) { this.u = 0; this.dir = 1; this.wait = this.pauseA; this.onA?.(); }
    this.place();
  }
  place() {
    const p = this.curve.getPointAt(this.u), t = this.curve.getTangentAt(this.u);
    this.obj.position.x = p.x; this.obj.position.z = p.z;
    this.obj.rotation.y = Math.atan2(-t.z, t.x);
  }
}

function addEntity(e, parent) {
  e.obj.userData.entity = e;
  parent.add(e.obj);
  pickRoots.push(e.obj);
  entities.push(e);
  const el = document.createElement('div');
  el.className = 'tag3d';
  el.innerHTML = `<i></i><span>${e.id}</span>`;
  $('#labels').appendChild(el);
  labels.push({ el, obj: e.obj, y: e.type === 'truck' ? 3.9 : 3.0, entity: e });
  return e;
}
function parkedTruck(parent, site, id, x, z, faceZ, opts = {}) {
  const t = makeTruck(opts.cab ?? C.blue, opts);
  t.position.set(x, 0, z);
  t.rotation.y = faceZ > 0 ? -Math.PI / 2 : Math.PI / 2;
  return addEntity({ id, type: 'truck', site, obj: t, status: opts.status ?? 'Loading', bay: opts.bay ?? null, done: rint(1, 5), total: 6, carrier: opts.carrier ?? BRAND }, parent);
}
function moverTruck(parent, site, id, pts, bay, opts = {}) {
  const t = makeTruck(opts.cab ?? C.blue, opts);
  parent.add(t);
  const m = new Mover(t, pts, { speed: 5, pauseA: 9, pauseB: 3 });
  const e = addEntity({ id, type: 'truck', site, obj: t, status: 'Loading', bay, done: 2, total: 6, carrier: BRAND, mover: m }, parent);
  m.onA = () => { e.done = 0; };
  movers.push(m);
  return e;
}
function forklift(parent, site, id, pts, task) {
  const f = makeForklift();
  parent.add(f);
  const m = new Mover(f, pts, { speed: 3.2, pauseA: 1.6, pauseB: 1.6 });
  m.onA = () => { f.userData.load.visible = true; };
  m.onB = () => { f.userData.load.visible = false; e.pct = clamp(e.pct + rint(6, 14), 0, 100); };
  f.userData.load.visible = rnd() > 0.5;
  movers.push(m);
  const e = addEntity({ id, type: 'forklift', site, obj: f, status: 'Working', task, pct: rint(20, 80), mover: m }, parent);
  return e;
}
function addPin(parent, x, z, y = 3.2, color = C.blue) {
  const p = makePin(color);
  p.position.set(x, 0, z);
  p.userData.base = y; p.userData.phase = rnd() * 6;
  p.userData.head.position.y = y;
  p.userData.head.scale.setScalar(1.35);
  parent.add(p);
  pins.push(p);
}
function place(parent, obj, x, z, ry = 0) { obj.position.set(x, 0, z); obj.rotation.y = ry; parent.add(obj); return obj; }
function treesAlong(parent, x1, z1, x2, z2, step = 6, s = 1) {
  const len = Math.hypot(x2 - x1, z2 - z1), n = Math.floor(len / step);
  for (let i = 0; i <= n; i++) {
    if (rnd() < 0.15) continue;
    const t = n ? i / n : 0;
    place(parent, makeTree(s * (0.85 + rnd() * 0.35)), x1 + (x2 - x1) * t + (rnd() - 0.5), z1 + (z2 - z1) * t + (rnd() - 0.5));
  }
}

/* ------------------------------- Build world -------------------------------- */
const ROAD_Z = 42, BACK_Z = -46;
function buildGround() {
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1400, 900), mat(C.ground));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground);
  const roads = new THREE.Group();
  const xMin = -260, xMax = 460, W = xMax - xMin, cx = (xMin + xMax) / 2;
  roads.add(B(W, 0.04, 12, C.road, cx, 0, ROAD_Z, { cast: false }));
  roads.add(B(W, 0.04, 10, C.road, cx, 0, BACK_Z, { cast: false }));
  for (let x = xMin; x < xMax; x += 6) roads.add(B(3, 0.05, 0.25, C.line, x, 0, ROAD_Z, { cast: false }));
  for (let x = xMin; x < xMax; x += 6) roads.add(B(3, 0.05, 0.22, C.line, x, 0, BACK_Z, { cast: false }));
  for (const vx of [-50, 50, 150, 250]) {
    roads.add(B(10, 0.045, ROAD_Z - BACK_Z, C.road, vx, 0, (ROAD_Z + BACK_Z) / 2, { cast: false }));
    for (let z = BACK_Z + 8; z < ROAD_Z - 8; z += 6) roads.add(B(0.22, 0.055, 3, C.line, vx, 0, z, { cast: false }));
    // crosswalks
    for (let i = -3; i <= 3; i++) {
      roads.add(B(0.8, 0.055, 3, C.line, vx + i * 1.35, 0, ROAD_Z - 10.5, { cast: false }));
      roads.add(B(0.8, 0.055, 3, C.line, vx + i * 1.35, 0, BACK_Z + 8.5, { cast: false }));
    }
  }
  // sidewalks
  roads.add(B(W, 0.08, 1.6, 0xf7f8fd, cx, 0, ROAD_Z - 6.8, { cast: false }));
  roads.add(B(W, 0.08, 1.6, 0xf7f8fd, cx, 0, ROAD_Z + 6.8, { cast: false }));
  scene.add(roads);
  // city blocks behind the main road and the back road
  const city = new THREE.Group();
  for (let x = -240; x < 450; x += 0) {
    const w = 10 + rnd() * 12, h = 6 + rnd() * 16, d = 10 + rnd() * 10;
    if (rnd() < 0.8) place(city, makeBuilding(w, h, d), x + w / 2, ROAD_Z + 12 + d / 2 + rnd() * 4);
    if (rnd() < 0.5) place(city, makeTree(1.1), x + w + 1.5, ROAD_Z + 9.5);
    x += w + 4 + rnd() * 6;
  }
  for (let x = -240; x < 450; x += 0) {
    const w = 10 + rnd() * 14, h = 5 + rnd() * 12, d = 10 + rnd() * 12;
    if (rnd() < 0.75) place(city, makeBuilding(w, h, d), x + w / 2, BACK_Z - 9 - d / 2 - rnd() * 4);
    x += w + 4 + rnd() * 6;
  }
  for (let i = 0; i < 28; i++) place(city, makeTree(1 + rnd() * 0.4), -240 + rnd() * 690, ROAD_Z + 30 + rnd() * 30);
  scene.add(city);
}

function sitePad(g) {
  g.add(B(89, 0.06, 76, C.pad, 0, -0.06, -2.5, { cast: false }));
  // inner curb line
  g.add(B(89, 0.03, 0.25, 0xdde1f2, 0, 0, 35.3, { cast: false }));
}

function buildRungkut(g, si) {
  sitePad(g);
  const A = makeWarehouse({ w: 22, d: 14, h: 6, doors: [-7, 0, 7] });
  place(g, A, -4, -10);
  const Bw = makeWarehouse({ w: 12, d: 12, h: 7.5, doors: [0], logo: false });
  place(g, Bw, -20, -16);
  for (const b of [A, Bw]) { b.userData.siteIndex = si; pickRoots.push(b); }
  docks[si] = [
    { id: 'Bay 1', x: -11 }, { id: 'Bay 2', x: -4 }, { id: 'Bay 3', x: 3 }, { id: 'Bay 4', x: -20 },
  ];
  parkedTruck(g, si, 'TRK-2201', -4, 0.45, 1, { bay: 'Bay 2', status: 'Loading' });
  moverTruck(g, si, 'TRK-2205', [[3, 0.45], [3, 10], [8, 20], [16, 27], [25, 30]], 'Bay 3');
  parkedTruck(g, si, 'TRK-2210', 32, 22, -1, { status: 'Waiting', cab: 0x3b4bb8, carrier: 'JNE Cargo', logo: false, trailer: 0xf4f5fb });
  for (const x of [20, 26, 32]) slot(g, x, 22, 4.6, 9.5);
  forklift(g, si, 'FL-01', [[-24, 9], [-17, 5], [-11, -0.8]], 'Loading TRK-2201 at Bay 2');
  forklift(g, si, 'FL-02', [[20, -11], [15, -4], [8.5, 1]], 'Put-away aisle R2 → Bay 3');
  place(g, makeContainer(), -35, 4, Math.PI / 2);
  place(g, makeRack(8, 1.6, 3), 20, -16);
  place(g, makeRack(8, 1.6, 3), 20, -21);
  for (const [x, z, l] of [[-27, 13, 2], [-24, 16, 1], [-30, 16, 2], [-9, 11, 2], [-13, 15, 1], [12, 12, 2], [-2, 18, 1]]) place(g, makeStack(l), x, z, rnd() * 0.3);
  for (const [x, z, l] of [[31, -8, 2], [33.6, -8, 1], [31, -5.4, 1], [-6, -28, 2], [-3.4, -28, 1], [8, -28, 1]]) place(g, makeCrates(l), x, z);
  addPin(g, 12, 12, 4.4);
  addPin(g, 31, -8, 4.6);
  addPin(g, -2, 18, 3.6);
  treesAlong(g, -40, -36, 40, -36, 6.5);
  treesAlong(g, 41, -30, 41, 28, 8);
  treesAlong(g, -42, -30, -42, -10, 7);
}

function buildPerak(g, si) {
  sitePad(g);
  const doors = [-13.5, -4.5, 4.5, 13.5];
  const cs = makeColdStore({ w: 36, d: 20, h: 9, doors });
  place(g, cs, -2, -12);
  cs.userData.siteIndex = si; pickRoots.push(cs);
  docks[si] = doors.map((x, i) => ({ id: `Bay ${i + 1}`, x: x - 2 }));
  parkedTruck(g, si, 'TRK-3101', -15.5, 4.6, 1, { bay: 'Bay 1', status: 'Unloading', trailer: 0xf4f6ff });
  parkedTruck(g, si, 'TRK-3104', 2.5, 4.6, 1, { bay: 'Bay 3', status: 'Loading', trailer: 0xf4f6ff });
  moverTruck(g, si, 'TRK-3107', [[-6.5, 4.6], [-6.5, 14], [-2, 22], [6, 28], [14, 30]], 'Bay 2', { trailer: 0xf4f6ff });
  forklift(g, si, 'FL-03', [[-29, 15], [-23, 9], [-19.5, 3.2]], 'Unloading TRK-3101 at Bay 1');
  forklift(g, si, 'FL-04', [[25, 14], [18, 8], [14.5, 3.4]], 'Staging Bay 4 · frozen goods');
  for (const [x, z] of [[-31, -6], [-31, -12.5], [-31, -19]]) place(g, makeSilo(2.4, 9), x, z);
  g.add(B(9, 0.5, 0.6, 0xd5d9ec, -24.5, 7.2, -12.5));
  fenceLine(g, -44, 33, -12, 33, true);
  fenceLine(g, 20, 33, 44, 33, true);
  fenceLine(g, -44, -38, -44, 33);
  place(g, makeGuardHouse(), 22.5, 29);
  for (const [x, z, l] of [[6, 15, 2], [0, 17, 1], [-14, 17, 2], [28, -4, 1], [28, -8, 2]]) place(g, makeStack(l), x, z);
  for (const [x, z, l] of [[24, -24, 2], [26.6, -24, 1], [24, -27, 1]]) place(g, makeCrates(l), x, z);
  addPin(g, 6, 15, 4.2);
  addPin(g, 11.5, 2.6, 5.5);
  addPin(g, -14, 17, 4.2);
  treesAlong(g, -40, -36, 40, -36, 6.5);
  treesAlong(g, 41, -30, 41, 26, 8);
}

function buildNgoro(g, si) {
  sitePad(g);
  const xs = [-20, -12, -4, 4, 12, 20];
  const cd = makeWarehouse({ w: 48, d: 12, h: 7, doors: [], color: 0xf4f5fb, roof: 0xeceef9, roofLine: 0xd9ddee, logo: true });
  // repaint walls: use a white ribbed wall with blue base
  cd.children[0].material = mat(0xffffff, { map: ribTex(0xf5f6fc, 0xdfe3f2, 48 / 1.2, 1) });
  place(g, cd, 0, -8);
  for (const x of xs) { addDoor(cd, x, 6, 3.6); addDoor(cd, x, -6, 3.6, 2.8, -1); }
  cd.userData.siteIndex = si; pickRoots.push(cd);
  docks[si] = xs.map((x, i) => ({ id: `Door F${i + 1}`, x }));
  parkedTruck(g, si, 'TRK-5101', -20, 1.45, 1, { bay: 'Door F1', status: 'Unloading' });
  parkedTruck(g, si, 'TRK-5103', 4, 1.45, 1, { bay: 'Door F4', status: 'Loading', cab: 0x2b9a8f });
  parkedTruck(g, si, 'TRK-5106', 20, 1.45, 1, { bay: 'Door F6', status: 'Loading' });
  parkedTruck(g, si, 'TRK-5112', -12, -17.45, -1, { bay: 'Door B2', status: 'Unloading', cab: 0x3b4bb8, logo: false, trailer: 0xf4f5fb, carrier: 'SiCepat' });
  parkedTruck(g, si, 'TRK-5115', 12, -17.45, -1, { bay: 'Door B5', status: 'Loading' });
  moverTruck(g, si, 'TRK-5108', [[-4, 1.45], [-4, 12], [0, 22], [8, 28], [16, 30]], 'Door F3');
  forklift(g, si, 'FL-05', [[-31, 11], [-24, 6], [-12, 0.6]], 'Cross-dock F2 → TRK-5101');
  forklift(g, si, 'FL-06', [[27, 14], [18, 8], [12, 0.6]], 'Staging Door F5');
  forklift(g, si, 'FL-07', [[-31, -28], [-8, -26], [-4, -15.4]], 'Unloading TRK-5112 · Door B3');
  place(g, makeBuilding(12, 8, 8), 31, -27);
  for (const [x, z, l] of [[-31, 15, 2], [-34, 19, 1], [28, 18, 2], [31, 22, 1], [-35, -32, 2], [0, -29, 1], [3, -29, 2]]) place(g, makeStack(l), x, z);
  for (const [x, z, l] of [[-31, -20, 2], [34, -10, 1], [34, -12.6, 2]]) place(g, makeCrates(l), x, z);
  addPin(g, 0, -29, 4.4);
  addPin(g, -31, 15, 4.4);
  addPin(g, 28, 18, 4.4, 0x22a59a);
  treesAlong(g, -40, -36, 22, -36, 6.5);
  treesAlong(g, -42, -26, -42, 26, 8);
  treesAlong(g, 41, -16, 41, 26, 8);
}

function buildTraffic() {
  const kinds = [
    () => makeTruck(C.blue), () => makeTruck(0x3b4bb8, { logo: false, trailer: 0xf4f5fb }),
    () => makeTruck(0xe0574f, { short: true, logo: false, trailer: 0xffffff }), () => makeTruck(0x2b9a8f, { short: true, logo: false }),
    () => makeTruck(C.blue, { short: true }),
  ];
  const lanes = [[ROAD_Z - 2.8, 1], [ROAD_Z + 2.8, -1], [BACK_Z - 2.4, 1], [BACK_Z + 2.4, -1]];
  lanes.forEach(([z, dir], li) => {
    const n = li < 2 ? 5 : 3;
    for (let i = 0; i < n; i++) {
      const v = kinds[(i + li) % kinds.length]();
      v.position.set(-240 + (i / n) * 680 + rnd() * 40, 0, z);
      v.rotation.y = dir > 0 ? 0 : Math.PI;
      scene.add(v);
      traffic.push({ obj: v, dir, speed: 7 + rnd() * 5 });
    }
  });
}

function buildWorld() {
  buildGround();
  const builders = [buildRungkut, buildPerak, buildNgoro];
  SITES.forEach((s, i) => {
    const g = new THREE.Group();
    g.position.set(s.x, 0.06, 0);
    builders[i](g, i);
    scene.add(g);
    siteGroups.push(g);
    const el = document.createElement('div');
    el.className = 'tag3d site';
    el.innerHTML = `<span>${s.code}</span>${s.name}`;
    $('#labels').appendChild(el);
    const anchor = new THREE.Object3D(); anchor.position.set(0, 0, -10); g.add(anchor);
    labels.push({ el, obj: anchor, y: 16, site: i });
  });
  buildTraffic();
  // selection ring
  selRing.rotation.x = -Math.PI / 2;
  selRing.visible = false;
  scene.add(selRing);
}
const selRing = new THREE.Mesh(new THREE.RingGeometry(3.0, 3.5, 48), new THREE.MeshBasicMaterial({ color: C.blue, transparent: true, opacity: 0.85, depthWrite: false }));

/* --------------------------------- Camera ---------------------------------- */
let tween = null;
const tmpV = new THREE.Vector3();
function defaultOffset() {
  const a = camera.aspect;
  const k = a < 0.8 ? 1.9 : a < 1.2 ? 1.4 : 1;
  return new THREE.Vector3(48, 56, 66).multiplyScalar(k);
}
function siteCenter(i) {
  // nudge the focus right on desktop so the scene sits in the space left of the side panel
  const nudge = camera.aspect > 1.2 ? 9 : 0;
  return new THREE.Vector3(SITES[i].x + nudge, 0, -3);
}
function flyTo(target, offset, dur = 1.4) {
  const off = offset ?? camera.position.clone().sub(controls.target);
  tween = { t: 0, dur, fromT: controls.target.clone(), fromP: camera.position.clone(), toT: target.clone(), toP: target.clone().add(off) };
}
function stepTween(dt) {
  if (!tween) return;
  tween.t += dt;
  const k = ease(clamp(tween.t / tween.dur, 0, 1));
  controls.target.lerpVectors(tween.fromT, tween.toT, k);
  camera.position.lerpVectors(tween.fromP, tween.toP, k);
  if (k >= 1) tween = null;
}
function zoomBy(f) {
  const off = camera.position.clone().sub(controls.target).multiplyScalar(f);
  const len = clamp(off.length(), controls.minDistance, controls.maxDistance);
  off.setLength(len);
  flyTo(controls.target.clone(), off, 0.45);
}

/* ------------------------------- UI rendering ------------------------------- */
const ICONS = {
  box: ['#fbeedd', '<rect x="4" y="6" width="16" height="13" rx="2" fill="#dcae73"/><path d="M4 10h16M12 6v4" stroke="#b98a52" stroke-width="1.5"/>'],
  crate: ['#e8eeff', '<rect x="4" y="5" width="16" height="14" rx="3" fill="#3a66ee"/><rect x="3.5" y="5" width="17" height="3" rx="1.5" fill="#6a8cf6"/>'],
  helmet: ['#fff4dc', '<path d="M4 16a8 8 0 0 1 16 0z" fill="#f6b73c"/><rect x="3" y="15.5" width="18" height="2.5" rx="1.2" fill="#e39a1c"/>'],
  tape: ['#fbeedd', '<circle cx="12" cy="12" r="7.5" fill="#dcae73"/><circle cx="12" cy="12" r="3.2" fill="#fbeedd"/>'],
  snow: ['#e6f3ff', '<path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" stroke="#3b8be8" stroke-width="2" stroke-linecap="round"/>'],
  drop: ['#e6f3ff', '<path d="M12 3c3 4.5 6 7.6 6 11a6 6 0 0 1-12 0c0-3.4 3-6.5 6-11z" fill="#4c9cf0"/>'],
  glove: ['#efe9ff', '<path d="M8 21v-8l-2-3 1.5-1 2.5 2V4.5a1.2 1.2 0 0 1 2.4 0V10V3.5a1.2 1.2 0 0 1 2.4 0V10V5a1.2 1.2 0 0 1 2.4 0v11a5 5 0 0 1-5 5z" fill="#8a6cf0"/>'],
};
const svgIcon = (k, s = 16) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}">${ICONS[k][1]}</svg>`;
const statusPill = (s) => {
  const map = { Loading: 'green', Unloading: 'blue', Working: 'green', Idle: 'gray', Waiting: 'amber', Arriving: 'amber', Departing: 'blue', 'At gate': 'amber', Charging: 'amber', 'In Stock': 'green', 'Low Stock': 'amber' };
  return `<span class="pill ${map[s] ?? 'gray'}">${s}</span>`;
};
const siteEntities = (i, type) => entities.filter((e) => e.site === i && (!type || e.type === type));
const trucksOnSite = (i) => siteEntities(i, 'truck').length;
function dockedTrucks(i) { return siteEntities(i, 'truck').filter((t) => t.bay && (t.mover ? t.mover.u < 0.02 : true)); }
function siteFill(s) { return Math.round((s.stock / s.cap) * 100); }

function renderHeader() {
  const s = SITES[state.site];
  $('#siteCode').textContent = s.code;
  $('#siteName').textContent = s.name;
  $('#siteSub').textContent = `${siteFill(s)}% full · ${dockedTrucks(state.site).length}/${docks[state.site].length} docked`;
  $('#siteMenu').innerHTML = SITES.map((x, i) => `
    <button data-site="${i}" class="${i === state.site ? 'active' : ''}">
      <span class="site-code">${x.code}</span>
      <span class="mt"><b>${x.name}</b><br><small>${x.kind} · ${siteFill(x)}% full</small>
        <div class="bar"><i style="width:${siteFill(x)}%"></i></div></span>
    </button>`).join('');
}

let lastKpi = {};
function renderKPIs() {
  const s = SITES[state.site];
  const t = trucksOnSite(state.site);
  const vals = { stock: fmt(s.stock), trucks: t, ontime: s.ontime.toFixed(1) + '%' };
  const card = (key, ico, lbl, val, delta, sub, down) => `
    <div class="kpi"><div class="ico">${ico}</div><div>
      <div class="lbl">${lbl}</div>
      <div class="val"><span class="${lastKpi[key] !== undefined && lastKpi[key] !== val ? 'flash' : ''}">${val}</span><span class="delta ${down ? 'down' : ''}">${delta}</span></div>
      <div class="sub">${sub}</div></div></div>`;
  $('#kpis').innerHTML =
    card('stock', svgIcon('crate', 18), 'Stock on hand', vals.stock, `${s.stockDelta >= 0 ? '↑' : '↓'} ${Math.abs(s.stockDelta)}`, `pallets · ${s.code}`, s.stockDelta < 0) +
    card('trucks', '<svg viewBox="0 0 24 24" width="18" height="18"><rect x="2" y="7" width="12" height="9" rx="1.5" fill="#2f5bea"/><path d="M14 10h4l3 3v3h-7z" fill="#6a8cf6"/><circle cx="7" cy="17.5" r="2" fill="#19203d"/><circle cx="17" cy="17.5" r="2" fill="#19203d"/></svg>', 'Trucks on site', vals.trucks, `↑ ${siteEntities(state.site, 'truck').filter((x) => x.status === 'Arriving' || x.status === 'Waiting').length}`, `${dockedTrucks(state.site).length} docked · ${s.code}`) +
    card('ontime', '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="12" cy="12" r="9" fill="#2f5bea"/><path d="M12 7v5l3 2" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>', 'On-time delivery', vals.ontime, '↑ 0.4%', 'last 30 days');
  lastKpi = vals;
}

function renderPanel() {
  const i = state.site, s = SITES[i];
  const docked = dockedTrucks(i).length, nd = docks[i].length;
  const arriving = siteEntities(i, 'truck').filter((t) => ['Arriving', 'Waiting', 'At gate'].includes(t.status)).length;
  const fls = siteEntities(i, 'forklift');
  $('#sitePanel').innerHTML = `
    <div class="ph">
      <div class="thumb"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M3 10 12 5l9 5v9H3z" fill="#fff" opacity=".95"/><rect x="7" y="13" width="4" height="6" fill="#2f5bea"/><rect x="13" y="13" width="4" height="6" fill="#2f5bea"/></svg></div>
      <div><div class="kind">${s.kind} · ${s.code}</div><h3>${s.name}</h3><div class="addr">${s.addr}</div></div>
      <button class="pin" title="Fokus ke site" data-focus-site="${i}"><svg viewBox="0 0 24 24" width="14" height="14"><path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="9" r="2.5" fill="currentColor"/></svg></button>
    </div>
    <div class="status-row">${statusPill('Operational').replace('gray', 'green')}<span>${docked} docked · ${arriving} arriving · ${Math.max(0, 3 - arriving)} staged</span></div>
    <div class="stats">
      <div class="stat"><div class="l">Stock on hand</div><div class="v">${fmt(s.stock)} <small>/ ${fmt(s.cap)}</small></div><div class="meter"><i style="width:${siteFill(s)}%"></i></div></div>
      <div class="stat"><div class="l">Truck bays</div><div class="v">${docked} <small>/ ${nd} busy</small></div><div class="meter green"><i style="width:${(docked / nd) * 100}%"></i></div></div>
      <div class="stat"><div class="l">Outbound today</div><div class="v">${s.outbound} <small>trucks</small></div></div>
      <div class="stat"><div class="l">Put-aways today</div><div class="v">${s.putaway} <small>pallets</small></div></div>
    </div>
    <div class="sec-title">Inventory <small>units</small></div>
    ${s.inventory.map((it) => {
      const low = it.low && it.q < it.low;
      return `<div class="inv"><span class="ii" style="background:${ICONS[it.ic][0]}">${svgIcon(it.ic)}</span><span class="nm">${it.n}</span><span class="qty">${fmt(it.q)}</span>${statusPill(low ? 'Low Stock' : 'In Stock')}</div>`;
    }).join('')}
    <div class="sec-title">Forklift fleet <small>${fls.filter((f) => f.status === 'Working').length}/${fls.length} working</small></div>
    ${fls.map((f) => `<div class="fl" data-entity="${f.id}"><b>${f.id}</b><span class="task">${f.task}</span><span class="mini"><i style="width:${f.pct}%"></i></span><span class="pct">${f.pct}%</span></div>`).join('')}
  `;
}

function dockRows(i) {
  return docks[i].map((d) => {
    const t = siteEntities(i, 'truck').find((x) => x.bay === d.id && (!x.mover || x.mover.u < 0.02));
    if (!t) return { key: d.id, id: d.id, sub: 'Dock', loc: 'Available', status: 'Idle', done: 0, total: 6, dot: '#a5abc7' };
    return { key: t.id, id: d.id, sub: 'Dock', loc: `${t.id} · ${t.carrier}`, status: t.status, done: t.done, total: t.total };
  });
}
function renderFleet() {
  const i = state.site;
  const tabs = {
    docks: dockRows(i),
    forklifts: siteEntities(i, 'forklift').map((f) => ({ key: f.id, id: f.id, sub: 'Forklift', loc: f.task, status: f.status, done: Math.round(f.pct / 100 * 6), total: 6 })),
    trucks: siteEntities(i, 'truck').map((t) => ({ key: t.id, id: t.id, sub: t.carrier, loc: `${SITES[i].code} · ${t.bay ?? 'Parking'}`, status: t.status, done: t.done, total: t.total })),
  };
  const counts = { docks: `${dockedTrucks(i).length}/${docks[i].length}`, forklifts: `${tabs.forklifts.length}/${tabs.forklifts.length}`, trucks: `${tabs.trucks.length}` };
  $$('#fleetTabs button').forEach((b) => { b.classList.toggle('active', b.dataset.tab === state.fleetTab); b.querySelector('small').textContent = counts[b.dataset.tab]; });
  $('#fleetSite').textContent = SITES[i].name;
  const sel = state.selected?.id;
  $('#fleetList').innerHTML = tabs[state.fleetTab].map((r) => `
    <div class="frow ${sel === r.key ? 'sel' : ''}" data-entity="${r.key}">
      <div class="id"><b>${r.id}</b><small>${r.sub}</small></div>
      <div class="loc"><i style="${r.dot ? `background:${r.dot}` : ''}"></i>${r.loc}</div>
      ${statusPill(r.status)}
      <div class="prog"><div class="meter green"><i style="width:${(r.done / r.total) * 100}%"></i></div>${r.done}/${r.total}</div>
      <svg class="chev" viewBox="0 0 24 24" width="14" height="14"><path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    </div>`).join('');
}

/* Shipment tracking (cycles through steps) */
const ship = { n: 78450, step: 3, truck: null, dest: DESTS[0], times: [] };
function newShipment() {
  ship.n += rint(1, 9);
  ship.step = 0;
  const trucks = siteEntities(state.site, 'truck');
  ship.truck = trucks[rint(0, trucks.length - 1)]?.id ?? 'TRK-2201';
  ship.dest = DESTS[rint(0, DESTS.length - 1)];
  const now = new Date();
  ship.times = STEPS.map((_, k) => { const d = new Date(now.getTime() + (k - 0) * 37 * 60000); return d.toTimeString().slice(0, 5); });
}
function renderShipment() {
  const s = SITES[state.site];
  if (!ship.truck) { newShipment(); ship.step = 3; }
  const eta = ship.times[5];
  $('#shipment').innerHTML = `
    <div class="left">
      <div class="sh-head"><svg viewBox="0 0 24 24" width="18" height="18"><rect x="2" y="7" width="12" height="9" rx="1.5" fill="#2f5bea"/><path d="M14 10h4l3 3v3h-7z" fill="#6a8cf6"/><circle cx="7" cy="17.5" r="2" fill="#19203d"/><circle cx="17" cy="17.5" r="2" fill="#19203d"/></svg>
        Shipment Tracking <span class="meta">${ship.truck} · ${BRAND}</span></div>
      <div class="steps">${STEPS.map((st, k) => `
        <div class="step ${k < ship.step ? 'done' : k === ship.step ? 'active' : ''}">
          <span class="c">${k < ship.step ? '<svg viewBox="0 0 24 24" width="12" height="12"><path d="m5 12 4 4 10-10" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/></svg>' : ''}</span>
          ${st}<span class="t">${k <= ship.step ? ship.times[k] : '—'}</span></div>`).join('')}
      </div>
    </div>
    <div class="sh-card">
      <div class="id">#SHP-${ship.n}</div>
      <div class="row"><span>From</span><b>${s.name}</b></div>
      <div class="row"><span>To</span><b>${ship.dest}</b></div>
      <div class="row"><span>ETA</span><b>${eta}</b></div>
      <div class="row"><span>Status</span>${statusPill(ship.step >= 5 ? 'Loading' : STEPS[ship.step] === 'In transit' ? 'Departing' : 'Loading').replace(/>(.*)</, `>${STEPS[ship.step]}<`)}</div>
    </div>`;
}

function renderNotifs() {
  const list = [
    ['#f0a719', `<b>Low stock</b> · ${SITES[1].inventory[2].n} di ${SITES[1].name}`],
    ['#2f5bea', `<b>TRK-3107</b> tiba di gate ${SITES[1].code}`],
    ['#1f9d55', `<b>#SHP-${ship.n - 3}</b> terkirim ke ${DESTS[2]}`],
    ['#f0a719', `<b>Pallet Wrap</b> menipis di ${SITES[2].name}`],
  ];
  $('#notifPanel').innerHTML = `<h4>Notifikasi</h4>` + list.map(([c, t]) => `<div class="n"><i style="background:${c}"></i><div>${t}<br><small>baru saja</small></div></div>`).join('');
}

function renderAll() { renderHeader(); renderKPIs(); renderPanel(); renderFleet(); renderShipment(); }

/* --------------------------------- Actions ---------------------------------- */
function selectSite(i, fly = true) {
  const changed = i !== state.site;
  state.site = i; state.overview = false;
  if (changed) newShipment(), (ship.step = rint(1, 4));
  if (fly) flyTo(siteCenter(i), defaultOffset());
  renderAll();
}
function selectEntity(e, fly = true) {
  if (!e) return;
  if (e.site !== state.site) selectSite(e.site, false);
  state.selected = e;
  state.fleetTab = e.type === 'forklift' ? 'forklifts' : 'trucks';
  if (fly) {
    const p = e.obj.getWorldPosition(new THREE.Vector3());
    const off = camera.position.clone().sub(controls.target);
    off.setLength(clamp(off.length(), 40, 70));
    flyTo(p, off, 1.2);
  }
  toast(e.type === 'forklift' ? `${e.id} — ${e.task} (${e.pct}%)` : `${e.id} — ${e.status}${e.bay ? ' · ' + e.bay : ''} · ${e.carrier}`);
  renderAll();
}
function clearSelection() { state.selected = null; renderFleet(); }

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* --------------------------------- Picking ---------------------------------- */
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
function pick(ev) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(pickRoots, true);
  for (const h of hits) {
    let o = h.object;
    while (o) {
      if (o.userData.entity) return { entity: o.userData.entity };
      if (o.userData.siteIndex !== undefined) return { site: o.userData.siteIndex };
      o = o.parent;
    }
  }
  return null;
}
let down = null;
canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; tween = null; });
canvas.addEventListener('pointerup', (e) => {
  if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
  const p = pick(e);
  if (p?.entity) selectEntity(p.entity);
  else if (p?.site !== undefined) { if (p.site !== state.site) selectSite(p.site); else toast(`${SITES[p.site].name} — ${siteFill(SITES[p.site])}% kapasitas`); }
  else clearSelection();
});
let hoverT = 0;
canvas.addEventListener('pointermove', (e) => {
  if (e.buttons || performance.now() - hoverT < 60) return;
  hoverT = performance.now();
  canvas.classList.toggle('pointer', !!pick(e));
});

/* ------------------------------ UI event wiring ----------------------------- */
$('#siteBtn').addEventListener('click', (e) => { e.stopPropagation(); $('#siteMenu').classList.toggle('open'); $('#notifPanel').classList.remove('open'); });
$('#siteMenu').addEventListener('click', (e) => {
  const b = e.target.closest('[data-site]'); if (!b) return;
  selectSite(+b.dataset.site); $('#siteMenu').classList.remove('open');
});
$('#bellBtn').addEventListener('click', (e) => { e.stopPropagation(); renderNotifs(); $('#notifPanel').classList.toggle('open'); $('#siteMenu').classList.remove('open'); $('#bellBadge').classList.add('hidden'); });
document.addEventListener('click', (e) => {
  if (!e.target.closest('.site-switch')) $('#siteMenu').classList.remove('open');
  if (!e.target.closest('.notif, #bellBtn')) $('#notifPanel').classList.remove('open');
  if (!e.target.closest('.search')) $('#searchResults').classList.remove('open');
});
$('.map-tools').addEventListener('click', (e) => {
  const b = e.target.closest('[data-tool]'); if (!b) return;
  const t = b.dataset.tool;
  if (t === 'in') zoomBy(0.75);
  if (t === 'out') zoomBy(1.33);
  if (t === 'rotate') { controls.autoRotate = !controls.autoRotate; b.classList.toggle('on', controls.autoRotate); }
  if (t === 'reset') { state.selected = null; flyTo(siteCenter(state.site), defaultOffset()); renderFleet(); }
  if (t === 'home') { state.overview = true; state.selected = null; flyTo(new THREE.Vector3(100, 0, -4), new THREE.Vector3(70, 120, 150).multiplyScalar(camera.aspect < 1 ? 1.6 : 1), 1.8); renderFleet(); }
});
$('#fleetTabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (!b) return; state.fleetTab = b.dataset.tab; renderFleet(); });
function entityFromRow(key) { return entities.find((x) => x.id === key); }
$('#fleetList').addEventListener('click', (e) => {
  const r = e.target.closest('[data-entity]'); if (!r) return;
  const ent = entityFromRow(r.dataset.entity);
  if (ent) selectEntity(ent);
  else { const d = docks[state.site].find((x) => x.id === r.dataset.entity); if (d) { flyTo(new THREE.Vector3(SITES[state.site].x + d.x, 0, 0), null, 1); toast(`${d.id} — tersedia`); } }
});
$('#sitePanel').addEventListener('click', (e) => {
  const f = e.target.closest('[data-entity]'); if (f) return selectEntity(entityFromRow(f.dataset.entity));
  if (e.target.closest('[data-focus-site]')) flyTo(siteCenter(state.site), defaultOffset());
});
$('#panelToggle').addEventListener('click', () => {
  const p = $('#sitePanel'); p.classList.toggle('open');
  $('#panelToggle').textContent = p.classList.contains('open') ? 'Tutup' : 'Detail site';
});

/* Search */
const searchInput = $('#searchInput'), searchResults = $('#searchResults');
let searchIdx = 0, searchItems = [];
function runSearch() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) { searchResults.classList.remove('open'); return; }
  const items = [
    ...SITES.map((s, i) => ({ tag: 'Site', label: `${s.code} · ${s.name}`, go: () => selectSite(i) })),
    ...entities.map((e) => ({ tag: e.type === 'truck' ? 'Truck' : 'Forklift', label: `${e.id} · ${SITES[e.site].name}`, go: () => selectEntity(e) })),
    ...SITES.flatMap((s, i) => s.inventory.map((it) => ({ tag: 'Stock', label: `${it.n} · ${s.name}`, go: () => { selectSite(i); toast(`${it.n}: ${fmt(it.q)} unit di ${s.name}`); } }))),
    { tag: 'Shipment', label: `#SHP-${ship.n} · ${ship.dest}`, go: () => toast(`#SHP-${ship.n} — ${STEPS[ship.step]}`) },
  ];
  searchItems = items.filter((x) => x.label.toLowerCase().includes(q) || x.tag.toLowerCase().includes(q)).slice(0, 8);
  searchIdx = 0;
  searchResults.innerHTML = searchItems.length
    ? searchItems.map((x, k) => `<button data-k="${k}" class="${k === 0 ? 'active' : ''}"><span class="tag">${x.tag}</span>${x.label}</button>`).join('')
    : '<div class="empty">Tidak ada hasil</div>';
  searchResults.classList.add('open');
}
function chooseSearch(k) { const it = searchItems[k]; if (!it) return; it.go(); searchInput.value = ''; searchResults.classList.remove('open'); searchInput.blur(); }
searchInput.addEventListener('input', runSearch);
searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    searchIdx = clamp(searchIdx + (e.key === 'ArrowDown' ? 1 : -1), 0, searchItems.length - 1);
    $$('button', searchResults).forEach((b, k) => b.classList.toggle('active', k === searchIdx));
  }
  if (e.key === 'Enter') chooseSearch(searchIdx);
  if (e.key === 'Escape') { searchInput.value = ''; searchResults.classList.remove('open'); searchInput.blur(); }
});
searchResults.addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) chooseSearch(+b.dataset.k); });
window.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) { e.preventDefault(); searchInput.focus(); }
});

/* ------------------------------ Live simulation ----------------------------- */
function tickClock() {
  const d = new Date();
  $('#clock').textContent = d.toTimeString().slice(0, 5);
}
function simulate() {
  SITES.forEach((s) => {
    const dv = rint(-6, 9);
    s.stock = clamp(s.stock + dv, s.cap * 0.3, s.cap * 0.97);
    s.stockDelta = clamp(s.stockDelta + Math.sign(dv), -40, 40);
    if (Math.random() < 0.25) s.outbound++;
    if (Math.random() < 0.3) s.putaway++;
    s.inventory.forEach((it) => { it.q = Math.max(0, it.q + rint(-3, 3)); });
  });
  entities.forEach((e) => {
    if (e.type === 'truck' && e.bay && (!e.mover || e.mover.u < 0.02) && Math.random() < 0.35) {
      e.done = (e.done + 1) % (e.total + 1);
    }
    if (e.type === 'forklift' && e.pct >= 100) {
      e.pct = 0;
      const trucks = siteEntities(e.site, 'truck').filter((t) => t.bay);
      const t = trucks[rint(0, trucks.length - 1)];
      e.task = t ? `${t.status === 'Unloading' ? 'Unloading' : 'Loading'} ${t.id} at ${t.bay}` : 'Put-away · aisle R1';
    }
  });
  if (Math.random() < 0.6) {
    ship.step++;
    if (ship.step > 5) newShipment();
  }
  renderAll();
}
function updateMoverStatuses() {
  let changed = false;
  for (const e of entities) {
    if (e.type !== 'truck' || !e.mover) continue;
    const m = e.mover;
    let st;
    if (m.u <= 0.02) st = e.done >= e.total ? 'Departing' : 'Loading';
    else if (m.atB) st = 'At gate';
    else st = m.dir > 0 ? 'Departing' : 'Arriving';
    if (st !== e.status) { e.status = st; changed = true; }
  }
  return changed;
}

/* --------------------------------- Labels ---------------------------------- */
const lv = new THREE.Vector3();
function updateLabels() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const dist = camera.position.distanceTo(controls.target);
  const far = dist > 150;
  for (const L of labels) {
    L.obj.getWorldPosition(lv);
    const near = lv.distanceTo(controls.target) < 60;
    let show;
    if (L.site !== undefined) show = far || !near && dist > 95;
    else show = !far && near;
    if (show) {
      lv.y += L.y;
      lv.project(camera);
      show = lv.z < 1 && Math.abs(lv.x) < 1.1 && Math.abs(lv.y) < 1.1;
    }
    if (!show) { if (L.el.style.display !== 'none') L.el.style.display = 'none'; continue; }
    if (L.el.style.display === 'none') L.el.style.display = '';
    const x = (lv.x * 0.5 + 0.5) * w, y = (-lv.y * 0.5 + 0.5) * h;
    L.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
    if (L.entity) {
      const st = L.entity.status;
      const cls = 'tag3d' + (state.selected === L.entity ? ' sel' : '') + (['Waiting', 'Arriving', 'At gate'].includes(st) ? ' amber' : st === 'Idle' ? ' gray' : '');
      if (L.el.className !== cls) L.el.className = cls;
      const txt = `${L.entity.id} · ${L.entity.type === 'forklift' ? L.entity.pct + '%' : st}`;
      const span = L.el.lastChild;
      if (span.textContent !== txt) span.textContent = txt;
    }
  }
}

/* ---------------------------------- Loop ----------------------------------- */
const clockT = new THREE.Clock();
let elapsed = 0, statusTimer = 0;
function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

function frame() {
  const rawDt = clockT.getDelta();
  const dt = Math.min(rawDt, 0.05);
  elapsed += dt;
  for (const m of movers) m.update(dt);
  for (const e of entities) {
    if (e.type !== 'forklift') continue;
    const c = e.obj.userData.carriage, loaded = e.obj.userData.load.visible, m = e.mover;
    const target = m.wait > 0 ? 0.14 : loaded ? 0.55 : 0.2;
    c.position.y += (target - c.position.y) * Math.min(1, dt * 4);
  }
  for (const t of traffic) {
    t.obj.position.x += t.dir * t.speed * dt;
    if (t.obj.position.x > 470) t.obj.position.x = -270;
    if (t.obj.position.x < -270) t.obj.position.x = 470;
  }
  for (const p of pins) {
    const h = p.userData.head;
    h.position.y = p.userData.base + Math.sin(elapsed * 2.2 + p.userData.phase) * 0.28;
    h.rotation.y += dt * 0.8;
  }
  statusTimer += dt;
  if (statusTimer > 0.5) { statusTimer = 0; if (updateMoverStatuses()) { renderFleet(); renderHeader(); } }

  stepTween(Math.min(rawDt, 0.1));
  controls.update();

  sun.position.copy(controls.target).add(SUN_OFFSET);
  sun.target.position.copy(controls.target);
  sun.target.updateMatrixWorld();
  const zoomOut = camera.position.distanceTo(controls.target) / 90;
  const sc = clamp(70 * zoomOut, 60, 170);
  if (Math.abs(sun.shadow.camera.right - sc) > 2) {
    Object.assign(sun.shadow.camera, { left: -sc, right: sc, top: sc, bottom: -sc });
    sun.shadow.camera.updateProjectionMatrix();
  }

  if (state.selected) {
    state.selected.obj.getWorldPosition(selRing.position);
    selRing.position.y = 0.12;
    selRing.visible = true;
    const s = 1 + Math.sin(elapsed * 4) * 0.08;
    selRing.scale.set(s, s, s);
  } else selRing.visible = false;

  renderer.render(scene, camera);
  updateLabels();
}

/* ---------------------------------- Boot ----------------------------------- */
async function boot() {
  $('#brandName').textContent = BRAND;
  await Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]);
  makeLogoTextures();
  buildWorld();
  resize();
  const c = siteCenter(0);
  controls.target.copy(c);
  camera.position.copy(c).add(defaultOffset().multiplyScalar(1.6));
  flyTo(c, defaultOffset(), 2.2);
  newShipment(); ship.step = 3;
  updateMoverStatuses();
  renderAll();
  renderNotifs();
  tickClock();
  setInterval(tickClock, 1000);
  setInterval(simulate, 3000);
  renderer.setAnimationLoop(frame);
  setTimeout(() => $('#loader').classList.add('hide'), 250);
  window.__magintek = { scene, camera, controls, entities, selectSite, selectEntity };
}
boot();
