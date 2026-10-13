#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-viewcube.mjs — the shared view cube (assets/apps/modelcraft/dev/viewcube.js, docs/apps/viewcube.md) without a
 * browser: the 26 targets, picking every target from a set of views (faces, edges, corners, odd angles), the
 * direction and up each click gives, face-on steps and quarter turns, compass heading / letters / ring with north
 * turned, keyboard walk, frame interpolation; the module mounted on a stand-in DOM (clicks, hover, keys, drag, ring
 * drag, Home, menu, axis icon); the camera.js and three.js adapters (round trips for all 26 targets, a turned plan
 * view, Y-up mapping); and every app's copy of viewcube.js / viewcube-camera.js / viewcube-three.js is byte-identical
 * to ModelCraft's (the canonical copies).
 *
 *   node bin/test-viewcube.mjs [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APPS = path.join(ROOT, 'public_html/assets/apps');
const CANON = path.join(APPS, 'modelcraft/dev');
const VERBOSE = process.argv.includes('--verbose');
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const section = (s) => console.log('\n== ' + s);
const near = (a, b, tol = 1e-6) => a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) <= tol);
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const nrm = (a) => { const l = Math.hypot(...a); return a.map((x) => x / l); };

const VC = await import(pathToFileURL(path.join(CANON, 'viewcube.js')).href);
const { TARGETS, FACES, keyOf, targetVector, targetLabel, targetKind, basis, project, pickTarget, viewForTarget, faceOn, stepView,
  turnView, orbitView, heading, compassPoints, ringAt, letterAt, viewFromLetter, nearestTarget, keyStep, slerpView, viewAngle, RING,
  letterVisibility, layoutOffset } = VC;

// ---------------------------------------------------------------------------
section('targets');
ok(TARGETS.length === 26, '26 targets', String(TARGETS.length));
ok(new Set(TARGETS).size === 26, 'all different');
ok(TARGETS.filter((k) => targetKind(k) === 'face').length === 6 && TARGETS.filter((k) => targetKind(k) === 'edge').length === 12
  && TARGETS.filter((k) => targetKind(k) === 'corner').length === 8, '6 faces, 12 edges, 8 corners');
ok(TARGETS.every((k) => keyOf(targetVector(k)) === k), 'key ↔ vector round trip');
ok(targetVector('nonsense') === null && targetVector('') === null, 'unknown keys refused');
ok(targetLabel('front') === 'Front' && targetLabel('top-front') === 'Top front edge' && targetLabel('bottom-back-left') === 'Bottom back left corner', 'labels in sentence case',
  [targetLabel('front'), targetLabel('top-front'), targetLabel('bottom-back-left')].join(' | '));
ok(targetLabel('top', { top: 'Plan' }) === 'Plan', 'labels follow the app\'s words');
for (const [name, F] of Object.entries(FACES)) {
  const c = [F.a[1] * F.b[2] - F.a[2] * F.b[1], F.a[2] * F.b[0] - F.a[0] * F.b[2], F.a[0] * F.b[1] - F.a[1] * F.b[0]];
  ok(near(c, F.n.map((x) => -x)), `${name}: face axes read from outside (a × b = −n, text not mirrored)`);
}

// ---------------------------------------------------------------------------
section('picking every visible target from many views');
const VIEWS = {
  front: { dir: [0, 1, 0], up: [0, 0, 1] },
  top: { dir: [0, 0, -1], up: [0, 1, 0] },
  'top turned': { dir: [0, 0, -1], up: [1, 0, 0] },
  iso: { dir: nrm([-1, 1.15, -0.85]), up: [0, 0, 1] },
  'iso back-left below': { dir: nrm([0.7, -0.4, 0.6]), up: [0, 0, 1] },
  odd: { dir: nrm([0.31, 0.83, -0.46]), up: [0, 0, 1] },
  'odd rolled': { dir: nrm([-0.5, -0.2, -0.84]), up: nrm([0.3, -0.9, 0.2]) },
  right: { dir: [-1, 0, 0], up: [0, 0, 1] },
  bottom: { dir: [0, 0, 1], up: [0, -1, 0] },
};
for (const [vn, view] of Object.entries(VIEWS)) {
  const B = basis(view);
  let tried = 0, good = 0;
  const bad = [];
  for (const key of TARGETS) {
    const v = targetVector(key);
    for (const F of Object.values(FACES)) {
      if (dot(v, F.n) !== 1 || -dot(F.n, B.d) < 0.2) continue;     // the target touches this face, and the face shows
      const p = F.n.map((x, i) => x + 0.8 * dot(v, F.a) * F.a[i] + 0.8 * dot(v, F.b) * F.b[i]);
      const [x, y] = project(view, p, B);
      const got = pickTarget(view, x, y);
      tried++;
      if (got === key) good++; else bad.push(key + '→' + got);
    }
  }
  ok(tried > 0 && good === tried, `${vn}: ${good}/${tried} region centres pick their own target`, bad.slice(0, 5).join(', '));
}
{
  const iso = VIEWS.iso;
  ok(pickTarget(iso, 0, 0) !== null, 'iso: the middle of the cube picks something');
  const seen = new Set();
  for (let x = -1.8; x <= 1.8; x += 0.04) for (let y = -1.8; y <= 1.8; y += 0.04) { const k = pickTarget(iso, x, y); if (k) seen.add(k); }
  ok(seen.size === 19, 'iso from above front right: 19 targets can be hit (3 faces, 9 edges, 7 corners)', String(seen.size));
  ok(pickTarget(iso, 3, 3) === null, 'outside the cube: nothing');
  const top = VIEWS.top;
  ok(pickTarget(top, 0, 0) === 'top', 'top view: the middle is Top');
  ok(pickTarget(top, 0, -0.9) === 'top-back', 'top view, north up: the upper band is the top back edge');
  ok(pickTarget(top, 0.9, 0.9) === 'top-front-right', 'top view: lower right corner is top front right');
  ok(pickTarget(VIEWS['top turned'], 0, -0.9) === 'top-right', 'top view turned (east up): the upper band is the top right edge');
}

// ---------------------------------------------------------------------------
section('the view each target gives');
for (const key of TARGETS) {
  const v = viewForTarget(key, VIEWS.iso);
  const want = nrm(targetVector(key).map((x) => -x));
  const B = basis(v);
  ok(near(B.d, want, 1e-9) && Math.abs(dot(B.u, B.d)) < 1e-9 && near([Math.hypot(...B.u)], [1], 1e-9), `${key}: looks along −vector, up square to it`);
  if (Math.abs(B.d[2]) < 0.999) ok(B.u[2] > 0, `${key}: Z is up on the screen`);
}
ok(near(viewForTarget('top', VIEWS.front).up, [0, 1, 0]), 'Top from the front view: north (+Y) up');
ok(near(viewForTarget('bottom', VIEWS.front).up, [0, -1, 0]), 'Bottom from the front view: front at the top of the screen');
ok(near(viewForTarget('top', VIEWS.right).up, [-1, 0, 0]), 'Top from the right view: −X (what was ahead) up');
ok(near(viewForTarget('top', VIEWS['top turned']).up, [1, 0, 0]), 'Top again from a turned top view: the turn is kept');
ok(near(viewForTarget('top', VIEWS.iso).up, [0, 1, 0]), 'Top from iso (looking north-west): north up');
ok(viewForTarget('nope', VIEWS.iso) === null, 'unknown target: no view');

// ---------------------------------------------------------------------------
section('face-on views, steps and quarter turns');
for (const key of ['top', 'bottom', 'front', 'back', 'left', 'right']) ok(faceOn(viewForTarget(key, VIEWS.iso)) === key, `${key} view is face-on`);
ok(faceOn(VIEWS.iso) === null && faceOn(viewForTarget('top-front', VIEWS.iso)) === null, 'iso and edge views are not face-on');
ok(faceOn({ dir: [0, 1, 0], up: nrm([0.2, 0, 1]) }) === null, 'a rolled front view is not face-on');
{
  const F = VIEWS.front;
  const up = stepView(F, 'up'), dn = stepView(F, 'down'), r = stepView(F, 'right'), l = stepView(F, 'left');
  ok(faceOn(up) === 'top' && near(up.up, [0, 1, 0]), 'front ▲ → top, north up');
  ok(faceOn(dn) === 'bottom' && near(dn.up, [0, -1, 0]), 'front ▼ → bottom');
  ok(faceOn(r) === 'right' && near(r.up, [0, 0, 1]), 'front ▶ → right');
  ok(faceOn(l) === 'left', 'front ◀ → left');
  const T = VIEWS.top;
  const cw = stepView(T, 'cw'), ccw = stepView(T, 'ccw');
  ok(faceOn(cw) === 'top' && near(cw.up, [-1, 0, 0]), 'top ↻ clockwise: west up (the plan turns clockwise)');
  ok(faceOn(ccw) === 'top' && near(ccw.up, [1, 0, 0]), 'top ↺ counter-clockwise: east up');
  ok(near(stepView(stepView(T, 'cw'), 'ccw').up, T.up), 'clockwise then counter-clockwise: back where it was');
  ok(faceOn(stepView(T, 'down')) === 'front', 'top ▼ → front');
  let v = T; for (let i = 0; i < 4; i++) v = stepView(v, 'cw');
  ok(near(v.up, T.up) && near(v.dir, T.dir), 'four quarter turns: full circle');
}

// ---------------------------------------------------------------------------
section('compass: heading, letters, ring, north');
const deg = (r) => (r * 180) / Math.PI;
ok(Math.abs(deg(heading(VIEWS.front))) < 1e-6, 'front view looks north: heading 0°');
ok(Math.abs(deg(heading(VIEWS.right)) - 270) < 1e-6, 'right view looks west: 270°');
ok(Math.abs(deg(heading({ dir: [1, 0, 0], up: [0, 0, 1] })) - 90) < 1e-6, 'looking +X: east, 90°');
ok(Math.abs(deg(heading(VIEWS.top))) < 1e-6, 'top view, north up: 0°');
ok(Math.abs(deg(heading(VIEWS['top turned'])) - 90) < 1e-6, 'top view, east up: 90°');
ok(Math.abs(deg(heading(VIEWS.iso)) - 319) < 1, 'iso from front right: about 319° (north-west)', deg(heading(VIEWS.iso)).toFixed(1));
ok(Math.abs(deg(heading({ dir: [-1, 0, 0], up: [0, 0, 1] }, Math.PI / 2))) < 1e-6, 'north turned to −X: looking −X is 0°');
{
  const P = compassPoints(VIEWS.top);
  ok(near(P.n, [0, -RING.letter], 1e-9) && near(P.e, [RING.letter, 0], 1e-9) && near(P.s, [0, RING.letter], 1e-9) && near(P.w, [-RING.letter, 0], 1e-9), 'top view: N above, E right, S below, W left');
  const P2 = compassPoints(VIEWS.top, Math.PI / 2);
  ok(near(P2.n, [-RING.letter, 0], 1e-9), 'north turned 90° counter-clockwise: N on the left');
  ok(letterAt(VIEWS.top, ...P.n) === 'n' && letterAt(VIEWS.top, ...P.e) === 'e' && letterAt(VIEWS.top, 0, 0) === null, 'letters are hit where drawn');
  const PI = compassPoints(VIEWS.iso);
  ok(letterAt(VIEWS.iso, ...PI.s) === 's', 'iso: S hit where drawn');
  const r = ringAt(VIEWS.top, 0, -RING.r);
  ok(r && Math.abs(r.angle - Math.PI / 2) < 1e-9, 'top view: ring hit at north = 90° world angle');
  ok(ringAt(VIEWS.top, 0, 0) === null && ringAt(VIEWS.top, 0, -(RING.r + 1)) === null, 'inside or far outside the ring: no hit');
  ok(ringAt(VIEWS.iso, ...project(VIEWS.iso, [RING.r, 0, RING.z]).slice(0, 2)) !== null, 'iso: the ring is hit where it is drawn');
  ok(ringAt(VIEWS.front, 0.5, project(VIEWS.front, [0, 0, RING.z])[1])?.edgeOn === true, 'side view: the ring is edge-on and still grabbable');
  const t = turnView(VIEWS.front, Math.PI / 2);
  ok(near(t.dir, [-1, 0, 0], 1e-9) && near(t.up, [0, 0, 1], 1e-9), 'turn 90° about Z: front view now looks west');
  const fl = viewFromLetter('e', VIEWS.iso);
  ok(Math.abs(deg(heading(fl)) - 270) < 1e-6 && Math.abs(fl.dir[2] - VIEWS.iso.dir[2]) < 1e-9, 'E letter: look from the east (heading west), tilt kept');
  const ft = viewFromLetter('s', VIEWS.top);
  ok(near(ft.dir, [0, 0, -1]) && near(ft.up, [0, 1, 0]), 'S letter in a top view: south at the bottom (north up)');
  const fw = viewFromLetter('w', VIEWS.top);
  ok(near(fw.up, [1, 0, 0]), 'W letter in a top view: west at the bottom (east up)');
}

// ---------------------------------------------------------------------------
section('compass letters in side views, layout centring');
{
  const fr = letterVisibility(VIEWS.front);
  ok(fr.n === 0 && fr.s === 0 && fr.e === 1 && fr.w === 1, 'front (camera level): N and S hidden, E and W shown', JSON.stringify(fr));
  const rt = letterVisibility(VIEWS.right);
  ok(rt.e === 0 && rt.w === 0 && rt.n === 1 && rt.s === 1, 'right view: E and W hidden, N and S shown', JSON.stringify(rt));
  const tp = letterVisibility(VIEWS.top);
  ok(Object.values(tp).every((v) => v === 1), 'top view: all four letters shown');
  const diag = letterVisibility({ dir: nrm([1, 1, 0]), up: [0, 0, 1] });
  ok(diag.n === 0 && diag.w === 1 && diag.e === 0 && diag.s === 1, 'level view along a diagonal: the two far letters give way to the near ones', JSON.stringify(diag));
  const iso = letterVisibility(VIEWS.iso);
  ok(Object.values(iso).every((v) => v === 1), 'iso (looking down ~31°): all four letters shown', JSON.stringify(iso));
  // any view: two letters that both show never sit on top of each other
  let worst = Infinity;
  for (let el = -89; el <= 89; el += 2) for (let az = 0; az < 360; az += 15) {
    const e = (el * Math.PI) / 180, a = (az * Math.PI) / 180;
    const dir = [Math.cos(e) * Math.cos(a), Math.cos(e) * Math.sin(a), Math.sin(e)];
    const v = { dir, up: [0, 0, 1] }, P = compassPoints(v), vis = letterVisibility(v);
    const shown = ['n', 'e', 's', 'w'].filter((k) => vis[k] >= 0.5);
    for (let i = 0; i < shown.length; i++) for (let j = i + 1; j < shown.length; j++) worst = Math.min(worst, Math.hypot(P[shown[i]][0] - P[shown[j]][0], P[shown[i]][1] - P[shown[j]][1]));
  }
  ok(worst * 32 > 14, 'every view from 89° down to 89° up: letters that show are at least 14 units apart (no overlap)', (worst * 32).toFixed(1));
  const nS = compassPoints(VIEWS.front).n;
  ok(letterAt(VIEWS.front, ...nS) === null, 'front view: a hidden letter is not clickable');
  ok(layoutOffset(VIEWS.top) === 0 && layoutOffset(VIEWS.bottom) === 0, 'straight down/up: no layout shift');
  const off = layoutOffset(VIEWS.iso), ringC = project(VIEWS.iso, [0, 0, RING.z])[1];
  ok(off < 0 && Math.abs(off + ringC / 2) < 1e-12, 'iso: cube and ring move up by half the ring\'s drop (centred pair)', off.toFixed(3));
  ok(Math.abs(layoutOffset(VIEWS.front) + 0.5) < 1e-9, 'front: shift is half the cube (the ring sits at its foot)');
}

// ---------------------------------------------------------------------------
section('drag orbit, keyboard walk, smooth turns');
{
  const o = orbitView(VIEWS.front, 100, 0);
  ok(Math.abs(o.dir[2]) < 1e-9 && o.dir[0] > 0, 'drag right: the model turns right (the camera swings left, turntable)');
  const o2 = orbitView(VIEWS.front, 0, 60);
  ok(o2.dir[2] < 0 && o2.up[2] > 0, 'drag down: look down on it, Z still up');
  const o3 = orbitView(VIEWS.front, 0, 1e5);
  ok(Math.abs(o3.dir[2]) < 1, 'a huge drag never flips over the pole');
  ok(nearestTarget(VIEWS.iso) === 'top-front-right', 'nearest target of iso is the top front right corner', nearestTarget(VIEWS.iso));
  ok(nearestTarget(VIEWS.top) === 'top' && nearestTarget(VIEWS.front) === 'front', 'nearest target of face views');
  let k = 'front';
  const seen = [k];
  for (let i = 0; i < 8; i++) { k = keyStep(k, 'right'); seen.push(k); }
  ok(seen.join(',') === 'front,front-right,right,back-right,back,back-left,left,front-left,front', 'Right walks round the middle in 45° steps', seen.join(','));
  ok(keyStep('front', 'up') === 'top-front' && keyStep('top-front', 'up') === 'top' && keyStep('top', 'up') === 'top', 'Up climbs to the top face');
  ok(keyStep('front', 'down') === 'bottom-front' && keyStep('bottom-front', 'down') === 'bottom', 'Down goes to the bottom face');
  ok(keyStep('top', 'down', VIEWS.front) === 'top-front', 'Down from the top face: the upper ring on the side you look from');
  ok(keyStep('top', 'left') === 'top', 'Left/Right on the top face stay');
  const reach = new Set(['front']);
  let frontier = ['front'];
  while (frontier.length) { const nx = []; for (const a of frontier) for (const w of ['left', 'right', 'up', 'down']) { const b = keyStep(a, w, VIEWS.iso); if (!reach.has(b)) { reach.add(b); nx.push(b); } } frontier = nx; }
  ok(reach.size === 26, 'the arrow keys reach all 26 targets', String(reach.size));
  const a = VIEWS.front, b = viewForTarget('top', a);
  ok(near(slerpView(a, b, 0).dir, a.dir, 1e-9) && near(slerpView(a, b, 1).dir, b.dir, 1e-9) && near(slerpView(a, b, 1).up, b.up, 1e-9), 'smooth turn starts and ends exactly');
  const m = slerpView(a, b, 0.5);
  ok(Math.abs(dot(m.dir, m.up)) < 1e-9 && Math.abs(Math.hypot(...m.dir) - 1) < 1e-9, 'half way: still a proper camera frame');
  ok(Math.abs(deg(viewAngle(a, b)) - 90) < 1e-6, 'front → top is a 90° turn');
  const back = viewForTarget('back', a), mb = slerpView(a, back, 0.5);
  ok(Math.abs(dot(mb.dir, mb.up)) < 1e-9 && Number.isFinite(mb.dir[0]), 'front → back (180°): no division by zero');
}

// ---------------------------------------------------------------------------
section('mounted on a stand-in DOM');
{
  const doc = makeDoc();
  globalThis.matchMedia = () => ({ matches: true });       // reduced motion: clicks ask for no animation
  const host = doc.createElement('div');
  let view = { dir: nrm([-1, 1.15, -0.85]), up: [0, 0, 1] }, calls = [], homes = 0, menuV = null, drags = [];
  const cube = VC.mountViewCube(host, {
    getView: () => view, setView: (v, o) => { calls.push({ v, o }); view = { dir: basis(v).d, up: basis(v).u }; },
    home: () => { homes++; }, labels: { top: 'Top' },
    menu: { label: 'Coordinate system', items: [{ label: 'WCS', value: 'wcs' }, { label: 'Site', value: 'site' }], value: 'wcs', onChange: (x) => { menuV = x; } },
    onDrag: (dx, dy) => drags.push([dx, dy]),
  });
  const root = host.children[0];
  ok(root && root.dataset.viewcube === '' && root.className.includes('at-top-right'), 'mounts a .cc-vc in the top right corner');
  ok(doc.getElementById('cc-viewcube-style') !== null, 'styles injected once');
  const svg = root.find((e) => e.tag === 'svg');
  const cells = root.findAll((e) => e.attrs.class === 'vc-cell' || (e.attrs.class || '').startsWith('vc-cell'));
  ok(cells.length === 54, '6 faces × 9 regions', String(cells.length));
  const shown = root.findAll((e) => e.attrs.class === 'vc-face' && e.attrs.display !== 'none');
  ok(shown.length === 3, 'iso: three faces drawn', String(shown.length));
  const texts = root.findAll((e) => e.tag === 'text').map((e) => e.textContent);
  ok(['Top', 'Front', 'Right', 'N', 'E', 'S', 'W'].every((t) => texts.includes(t)) && !texts.some((t) => /^[A-Z]{3,}$/.test(t)), 'face words in sentence case, compass letters', texts.join(' '));
  ok(svg.attrs.tabindex === '0' && /View cube, looking from/.test(svg.attrs['aria-label']), 'focusable, labelled for screen readers', svg.attrs['aria-label']);
  const at = (x, y) => ({ clientX: x * 32 + 100, clientY: (y + layoutOffset(view)) * 32 + 100, button: 0, pointerId: 1, target: svg, preventDefault() {}, stopPropagation() {} });
  // hover the front face centre → highlight
  const B = basis(view), pf = project(view, [0, -1, 0], B);
  svg.fire('pointermove', at(pf[0], pf[1]));
  ok(root.dataset.vcHot === 'front' && cells.filter((c) => c.classList.contains('is-hot')).length === 1, 'hover over Front highlights its region', root.dataset.vcHot);
  const pe = project(view, [0.85, -1, 0], B);
  svg.fire('pointermove', at(pe[0], pe[1]));
  ok(root.dataset.vcHot === 'front-right' && cells.filter((c) => c.classList.contains('is-hot')).length === 2, 'hover over an edge highlights it on both faces', root.dataset.vcHot);
  // click Front
  svg.fire('pointerdown', at(pf[0], pf[1])); svg.fire('pointerup', at(pf[0], pf[1]));
  ok(calls.length === 1 && near(calls[0].v.dir, [0, 1, 0]) && calls[0].o.animate === false, 'click Front → setView looking +Y (no animation: reduced motion)', JSON.stringify(calls[0]?.v));
  cube.update();
  ok(root.findAll((e) => e.attrs.class === 'vc-face' && e.attrs.display !== 'none').length === 1, 'face-on: one face drawn');
  const letterEl = (t) => root.findAll((e) => e.tag === 'text' && e.textContent === t)[0];
  ok(Number(letterEl('N').attrs.opacity) === 0 && Number(letterEl('S').attrs.opacity) === 0 && Number(letterEl('E').attrs.opacity) === 1, 'front view mounted: N and S faded out, E shown');
  ok(root.find((e) => e.attrs.class === 'vc-letter-hit' && e.attrs['data-vc-letter'] === 'n').attrs.display === 'none', 'front view mounted: the hidden N cannot be clicked');
  ok(/translate\(0 -16\)/.test(root.find((e) => e.attrs.class === 'vc-stage').attrs.transform), 'front view mounted: the stage is shifted up 16 units', root.find((e) => e.attrs.class === 'vc-stage').attrs.transform);
  const stepsG = root.find((e) => e.attrs.class === 'vc-steps');
  ok(stepsG && !('hidden' in stepsG.attrs), 'face-on: the step arrows show');
  // a corner
  const pc = project(view, [0.85, -1, 0.85], basis(view));
  svg.fire('pointerdown', at(pc[0], pc[1])); svg.fire('pointerup', at(pc[0], pc[1]));
  ok(near(calls.at(-1).v.dir, nrm([-1, 1, -1]), 1e-9), 'click the top right corner of Front → looking from top front right', JSON.stringify(calls.at(-1).v.dir));
  cube.update();
  ok('hidden' in stepsG.attrs, 'corner view: no step arrows');
  // drag the cube → onDrag
  const p0 = project(view, [0, -1, 0], basis(view));
  svg.fire('pointerdown', at(p0[0], p0[1]));
  svg.fire('pointermove', { ...at(p0[0], p0[1]), clientX: at(p0[0], p0[1]).clientX + 20 });
  svg.fire('pointermove', { ...at(p0[0], p0[1]), clientX: at(p0[0], p0[1]).clientX + 30 });
  const before = calls.length;
  svg.fire('pointerup', { ...at(p0[0], p0[1]), clientX: at(p0[0], p0[1]).clientX + 30 });
  ok(drags.length === 2 && drags[0][0] === 20 && drags[1][0] === 10 && calls.length === before, 'dragging the cube orbits through onDrag, no click', JSON.stringify(drags));
  // ring drag in a top view
  view = { dir: [0, 0, -1], up: [0, 1, 0] }; cube.update();
  const rx = 0, ry = -RING.r;
  svg.fire('pointerdown', at(rx, ry));
  const a2 = Math.PI / 2 + 0.3;
  svg.fire('pointermove', at(RING.r * Math.cos(a2), -RING.r * Math.sin(a2)));
  svg.fire('pointerup', at(RING.r * Math.cos(a2), -RING.r * Math.sin(a2)));
  ok(Math.abs(deg(heading(view)) - deg(0.3)) < 0.5, 'dragging the ring 0.3 rad counter-clockwise turns the plan with it', deg(heading(view)).toFixed(2));
  // letter click
  view = { dir: [0, 0, -1], up: [0, 1, 0] }; cube.update();
  const PE = compassPoints(view).e;
  svg.fire('pointerdown', at(PE[0], PE[1])); svg.fire('pointerup', at(PE[0], PE[1]));
  ok(near(view.up, [-1, 0, 0]), 'click E in a top view: east at the bottom', JSON.stringify(view.up));
  // keyboard
  view = { dir: [0, 1, 0], up: [0, 0, 1] }; cube.update();
  const key = (k, shift = false) => { let stopped = false; svg.fire('keydown', { key: k, shiftKey: shift, preventDefault() {}, stopPropagation() { stopped = true; } }); return stopped; };
  svg.fire('blur', {}); svg.fire('focus', {});
  ok(key('ArrowRight') && /Chosen: Front right edge/.test(svg.attrs['aria-label']), 'Right arrow chooses the front right edge (and the key stops at the cube)', svg.attrs['aria-label']);
  key('ArrowUp'); key('Enter');
  ok(near(calls.at(-1).v.dir, nrm([-1, 1, -1]), 1e-9), 'Up then Enter → top front right corner view');
  const live = root.findAll((e) => e.attrs['aria-live'] === 'polite')[0];
  ok(live && live.textContent === 'Top front right corner', 'the choice is announced', live?.textContent);
  view = { dir: [0, 1, 0], up: [0, 0, 1] };
  key('ArrowLeft', true);
  ok(near(view.dir, [1, 0, 0], 1e-9), 'Shift+Left: a quarter turn about Z');
  key('Home');
  ok(homes === 1, 'Home key → home()');
  root.find((e) => e.attrs.class === 'vc-home' || e.className === 'vc-home').fire('click', {});
  ok(homes === 2, 'Home button → home()');
  const sel = root.find((e) => e.tag === 'select');
  ok(sel && sel.attrs['aria-label'] === 'Coordinate system' && sel.children.length === 2, 'menu under the cube with its items');
  sel.value = 'site'; sel.fire('change', {});
  ok(menuV === 'site', 'menu change → onChange');
  view = { dir: [0, 0, -1], up: [0, 1, 0] };
  cube.setNorth(Math.PI / 2); cube.update();
  const N = root.findAll((e) => e.tag === 'text' && e.textContent === 'N')[0];
  ok(Number(N.attrs.x) < -50, 'setNorth turns the letters (N on the left)', N.attrs.x);
  cube.setVisible(false); ok(root.hidden === true, 'setVisible(false) hides it');
  cube.destroy(); ok(!host.children.includes(root), 'destroy removes it');
  // without onDrag: the cube turns the view itself
  const host2 = doc.createElement('div');
  let v2 = { dir: [0, 1, 0], up: [0, 0, 1] };
  const c2 = VC.mountViewCube(host2, { getView: () => v2, setView: (v) => { v2 = v; } });
  const svg2 = host2.children[0].find((e) => e.tag === 'svg');
  ok(!host2.children[0].find((e) => e.className === 'vc-home') && !host2.children[0].find((e) => e.tag === 'select'), 'no home() / menu → no Home button, no menu');
  svg2.fire('pointerdown', at(0, 0)); svg2.fire('pointermove', { ...at(0, 0), clientX: 140 }); svg2.fire('pointerup', { ...at(0, 0), clientX: 140 });
  ok(v2.dir[0] > 0.1, 'drag without onDrag: the cube orbits the view itself', JSON.stringify(v2.dir));
  c2.destroy();
  // axis icon
  const host3 = doc.createElement('div');
  let v3 = { dir: [0, 0, -1], up: [0, 1, 0] };
  const ax = VC.mountAxisIcon(host3, { getView: () => v3 });
  const lines = host3.children[0].findAll((e) => e.tag === 'line');
  const lx = lines.find((l) => l.attrs.class === 'ax-x'), ly = lines.find((l) => l.attrs.class === 'ax-y');
  ok(Number(lx.attrs.x2) > 20 && Math.abs(Number(lx.attrs.y2)) < 1e-6 && Number(ly.attrs.y2) < -20, 'axis icon in a top view: X right, Y up');
  v3 = { dir: [0, 1, 0], up: [0, 0, 1] }; ax.update();
  const lz = host3.children[0].findAll((e) => e.tag === 'line').find((l) => l.attrs.class === 'ax-z');
  ok(Number(lz.attrs.y2) < -20, 'front view: Z up');
  ok(host3.children[0].className.includes('at-bottom-left'), 'axis icon sits bottom left by default');
}

// ---------------------------------------------------------------------------
section('language keys (0.4 W2.1): words from the app\'s catalog, English otherwise');
{
  const { VC_STRINGS, vcTranslator } = VC;
  const en = vcTranslator(null);
  ok(en('viewcube.edge', { a: 'Top', b: 'front' }) === 'Top front edge' && en('viewcube.home') === 'Home view', 'no catalog: English');
  const cat = { 'viewcube.face.front': 'Frente', 'viewcube.face.top': 'Superior', 'viewcube.edge': 'Arista {a} {b}', 'viewcube.hint': 'Pista', 'viewcube.looking': 'Cubo, mirando desde {view}', 'viewcube.axes': 'Ejes', 'viewcube.home': 'Inicio', 'viewcube.letter.w': 'O' };
  const asked = [];
  const i18n = { has: (k) => Object.prototype.hasOwnProperty.call(cat, k), t: (k, f) => { asked.push(k); return String(cat[k]).replace(/\{(\w+)\}/g, (m, n) => (f && f[n] != null ? f[n] : m)); } };
  const tr = vcTranslator(i18n);
  ok(tr('viewcube.face.front') === 'Frente' && tr('viewcube.step.cw') === VC_STRINGS['viewcube.step.cw'], 'a key the catalog has is translated; one it lacks stays English');
  ok(asked.every((k) => k in cat), 'the app\'s t() is only asked for keys it has (no "missing key" entries)', asked.join(','));
  ok(targetLabel('top-front', {}, tr) === 'Arista Top front' && targetLabel('top-front-right', {}, tr, true) === 'Top front right', 'edge/corner wording from the catalog; plain form for "looking from"');
  const doc = makeDoc();
  const host = doc.createElement('div');
  let view = { dir: nrm([-1, 1.15, -0.85]), up: [0, 0, 1] };
  VC.mountViewCube(host, { getView: () => view, setView: () => {}, home: () => {}, i18n });
  const root = host.children[0];
  const texts = root.findAll((e) => e.tag === 'text').map((e) => e.textContent);
  const svg = root.find((e) => e.tag === 'svg');
  const hint = root.findAll((e) => e.tag === 'span').map((e) => e.textContent);
  const home = root.find((e) => e.dataset && 'vcHome' in e.dataset);
  ok(texts.includes('Frente') && texts.includes('Superior') && texts.includes('Right') && texts.includes('O'), 'mounted: face words and compass letters from the catalog', texts.join(' '));
  ok(hint.includes('Pista') && /^Cubo, mirando desde /.test(svg.attrs['aria-label']) && home && home.attrs['aria-label'] === 'Inicio', 'mounted: hint, screen-reader label and Home button from the catalog', svg.attrs['aria-label']);
  const ah = doc.createElement('div');
  VC.mountAxisIcon(ah, { getView: () => view, i18n });
  ok(ah.children[0].find((e) => e.tag === 'svg').attrs['aria-label'] === 'Ejes', 'axis icon label from the catalog');
  ok(asked.every((k) => k in cat), 'still no key asked that the catalog lacks');
  const keys = Object.keys(VC_STRINGS);
  ok(keys.length === 27 && keys.every((k) => /^viewcube\.[a-z0-9.-]+$/.test(k)), `${keys.length} keys, all under viewcube.`);
}

section('camera.js adapter (ModelCraft, CadCraft 3D, CivilCraft, TakeoffCraft)');
{
  const { Camera } = await import(pathToFileURL(path.join(CANON, 'camera.js')).href);
  const A = await import(pathToFileURL(path.join(CANON, 'viewcube-camera.js')).href);
  const cam = new Camera();
  let inval = 0, homed = 0;
  const o = A.cameraCubeOptions(cam, { invalidate: () => inval++, home: () => { homed++; } });
  const d0 = cam.distance, t0 = cam.target.slice();
  let bad = [];
  for (const key of TARGETS) {
    const want = viewForTarget(key, o.getView());
    o.setView(want, { animate: false });
    const got = o.getView();
    if (!(near(got.dir, basis(want).d, 1e-3) && near(got.up, basis(want).u, 1e-3))) bad.push(key);
  }
  ok(bad.length === 0, 'all 26 targets: the camera looks exactly where the cube said', bad.join(', '));
  ok(Math.abs(cam.distance - d0) < 1e-6 && near(cam.target, t0), 'target and distance kept');
  ok(inval >= 26, 'each change asks for a redraw');
  o.setView({ dir: [0, 0, -1], up: [1, 0, 0] }, { animate: false });
  ok(near(o.getView().up, [1, 0, 0], 1e-3) && faceOn(o.getView()) === 'top', 'a turned plan view (east up) is kept by camera.js');
  o.setView(stepView(o.getView(), 'cw'), { animate: false });
  ok(near(o.getView().up, [0, 1, 0], 1e-3), 'quarter turn clockwise from east-up: north up');
  const before = cam.eye.slice();
  o.onDrag(30, 0);
  ok(!near(cam.eye, before), 'dragging the cube orbits camera.js');
  o.home();
  ok(homed === 1, 'Home calls the app');
  const pv = A.cameraView(cam);
  ok(typeof pv.persp === 'boolean', 'persp reported');
}

// ---------------------------------------------------------------------------
section('three.js adapter (PartCraft, DetailCraft, BimCraft)');
{
  const THREE = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/three/current/three.module.js')).href);
  const A = await import(pathToFileURL(path.join(CANON, 'viewcube-three.js')).href);
  for (const yUp of [false, true]) {
    for (const kind of ['persp', 'ortho']) {
      const cam = kind === 'persp' ? new THREE.PerspectiveCamera(45, 1.5, 0.1, 1000) : new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 1000);
      cam.up.set(...(yUp ? [0, 1, 0] : [0, 0, 1]));
      cam.position.set(30, 40, 50);
      const controls = { target: new THREE.Vector3(1, 2, 3), update() { cam.lookAt(this.target); } };
      controls.update();
      let renders = 0;
      const o = A.threeCubeOptions({ camera: () => cam, controls: () => controls, render: () => renders++, yUp });
      const bad = [];
      for (const key of TARGETS) {
        const want = viewForTarget(key, o.getView());
        o.setView(want, { animate: false });
        controls.update();           // OrbitControls does this on every change: the view must survive it
        const got = o.getView();
        if (!(near(got.dir, basis(want).d, 1e-3) && near(got.up, basis(want).u, 1e-3))) bad.push(key);
      }
      ok(bad.length === 0, `${yUp ? 'Y-up' : 'Z-up'} ${kind}: all 26 targets survive OrbitControls.update()`, bad.join(', '));
      ok(near(cam.up.toArray(), yUp ? [0, 1, 0] : [0, 0, 1]), `${yUp ? 'Y-up' : 'Z-up'} ${kind}: camera.up stays the world's up`);
      o.setView({ dir: [0, 0, -1], up: [1, 0, 0] }, { animate: false }); controls.update();
      ok(near(o.getView().up, [1, 0, 0], 1e-3), `${yUp ? 'Y-up' : 'Z-up'} ${kind}: a turned plan view survives`);
      ok(renders > 0, 'renders asked for');
    }
  }
  const { toApp, toCube } = A;
  ok(near(toApp([0, 0, 1], true), [0, 1, 0]) && near(toApp([0, -1, 0], true), [0, 0, 1]) && near(toApp([1, 0, 0], true), [1, 0, 0]), 'Y-up mapping: cube Top = +Y, Front looks from +Z, Right = +X');
  ok(near(toCube(toApp([0.3, -0.2, 0.9], true), true), [0.3, -0.2, 0.9]), 'Y-up mapping round trip');
}

// ---------------------------------------------------------------------------
section('copies are byte-identical to ModelCraft\'s');
{
  const FILES = ['viewcube.js', 'viewcube-camera.js', 'viewcube-three.js'];
  const canon = Object.fromEntries(FILES.map((f) => [f, fs.readFileSync(path.join(CANON, f))]));
  let copies = 0;
  for (const app of fs.readdirSync(APPS)) {
    if (app === 'modelcraft') continue;
    const dev = path.join(APPS, app, 'dev');
    if (!fs.existsSync(dev)) continue;
    const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? (e.name === 'help' || e.name === 'node_modules' ? [] : walk(path.join(dir, e.name))) : [path.join(dir, e.name)]));
    for (const f of walk(dev)) {
      const b = path.basename(f);
      if (!FILES.includes(b)) continue;
      copies++;
      ok(fs.readFileSync(f).equals(canon[b]), `${path.relative(APPS, f)} is byte-identical`);
    }
  }
  console.log(`  (${copies} copies found)`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

// ---------------------------------------------------------------------------
/** A small stand-in DOM: elements with attributes, children, classList, dataset, listeners; enough for the cube. */
function makeDoc() {
  const byId = new Map();
  class El {
    constructor(tag) {
      this.tag = tag; this.attrs = {}; this.children = []; this.parent = null; this.listeners = {}; this.dataset = {}; this._text = ''; this.hidden = false; this.value = '';
      const self = this;
      this.style = {};
      this.classList = {
        add: (...c) => { const s = new Set((self.attrs.class || '').split(/\s+/).filter(Boolean)); c.forEach((x) => s.add(x)); self.attrs.class = [...s].join(' '); },
        remove: (...c) => { const s = new Set((self.attrs.class || '').split(/\s+/).filter(Boolean)); c.forEach((x) => s.delete(x)); self.attrs.class = [...s].join(' '); },
        toggle: (c, on) => { const has = self.classList.contains(c); const want = on === undefined ? !has : !!on; if (want) self.classList.add(c); else self.classList.remove(c); return want; },
        contains: (c) => (self.attrs.class || '').split(/\s+/).includes(c),
      };
    }
    get className() { return this.attrs.class || ''; }
    set className(v) { this.attrs.class = v; }
    get id() { return this.attrs.id || ''; }
    set id(v) { this.attrs.id = v; byId.set(v, this); }
    get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
    set textContent(v) { this._text = String(v); this.children = []; }
    get title() { return this.attrs.title || ''; }
    set title(v) { this.attrs.title = v; }
    set type(v) { this.attrs.type = v; }
    get ownerDocument() { return doc; }
    setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'id') byId.set(String(v), this); if (k.startsWith('data-')) this.dataset[k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = String(v); }
    getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
    removeAttribute(k) { delete this.attrs[k]; }
    hasAttribute(k) { return k in this.attrs; }
    appendChild(c) { if (c.parent) c.parent.children = c.parent.children.filter((x) => x !== c); c.parent = this; this.children.push(c); return c; }
    append(...cs) { cs.forEach((c) => this.appendChild(c)); }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter((x) => x !== this); this.parent = null; }
    addEventListener(t, f) { (this.listeners[t] ||= []).push(f); }
    fire(t, ev) { for (const f of this.listeners[t] || []) f(ev); }
    closest(sel) { let e = this; const m = sel.match(/^\[([\w-]+)\]$/); while (e) { if (m && m[1] in e.attrs) return e; e = e.parent; } return null; }
    getBoundingClientRect() { return { left: 0, top: 0, width: 200, height: 200 }; }
    focus() { this.fire('focus', {}); }
    blur() { this.fire('blur', {}); }
    setPointerCapture() {} releasePointerCapture() {}
    find(p) { for (const c of this.children) { if (p(c)) return c; const r = c.find(p); if (r) return r; } return null; }
    findAll(p, out = []) { for (const c of this.children) { if (p(c)) out.push(c); c.findAll(p, out); } return out; }
  }
  const doc = {
    head: new El('head'), documentElement: new El('html'),
    createElement: (t) => new El(t), createElementNS: (ns, t) => new El(t),
    getElementById: (id) => byId.get(id) || null,
  };
  return doc;
}
