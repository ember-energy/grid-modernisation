/* Composite icons for the 17 interventions: each one combines a few shared parts (pylon, turbine, sun, house, battery,
   transformer...) drawn on one 512 grid with one line weight, so the parts stay in proportion. White on the shields.
   Adds window.ICONS["i7-<num>"]. */
(function () {
  const W = "#FFFFFF", SW = 24;
  const st = (d, w) => `<path d="${d}" fill="none" stroke="${W}" stroke-width="${w || SW}" stroke-linecap="square" stroke-linejoin="miter" stroke-miterlimit="4"/>`;
  const fl = (d, ev) => `<path d="${d}" fill="${W}"${ev ? ' fill-rule="evenodd"' : ""}/>`;
  const C = (cx, cy, r) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  const R = (x, y, w, h) => `M${x} ${y}h${w}v${h}h${-w}Z`;
  const RR = (x, y, w, h, r) => `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}Z`;
  const pts = (a) => a.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  // ---- parts ----
  const pylon = (cx, by, h, w) => { const b = 0.27 * h, m = 0.07 * h, ym = by - 0.72 * h, yt = by - h, yb = by - 0.36 * h, bm = (b + m) / 2;
    return st(pts([[cx - b, by], [cx - m, ym], [cx, yt], [cx + m, ym], [cx + b, by]]), w) +
      st(pts([[cx - b, by], [cx + bm, yb], [cx - bm, yb], [cx + m, ym], [cx - m, ym], [cx + bm, yb]]), (w || SW) * 0.7) +
      st(`M${cx - 0.36 * h} ${ym}H${cx + 0.36 * h}M${cx - 0.24 * h} ${by - 0.88 * h}H${cx + 0.24 * h}`, w) +
      st(`M${cx - 0.36 * h} ${ym}v${0.07 * h}M${cx + 0.36 * h} ${ym}v${0.07 * h}`, (w || SW) * 0.8); };
  const turbine = (cx, by, h) => { const hy = by - h, L = 0.46 * h; let d = "";
    [-60, 60, 180].forEach((a) => { const r = (a * Math.PI) / 180, n = r + Math.PI / 2, tx = cx + Math.cos(r) * L, ty = hy + Math.sin(r) * L, w = 0.055 * h;
      d += pts([[cx + Math.cos(n) * w, hy + Math.sin(n) * w], [tx, ty], [cx - Math.cos(n) * w, hy - Math.sin(n) * w]]) + "Z"; });
    return st(`M${cx} ${by}V${hy}`, SW * 0.9) + fl(d + C(cx, hy, 0.07 * h)); };
  const sun = (cx, cy, r) => { let d = ""; for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; d += `M${cx + Math.cos(a) * r * 1.45} ${cy + Math.sin(a) * r * 1.45}L${cx + Math.cos(a) * r * 1.85} ${cy + Math.sin(a) * r * 1.85}`; }
    return fl(C(cx, cy, r)) + st(d, SW * 0.8); };
  const cloud = (cx, cy, s) => fl(C(cx - 0.5 * s, cy, 0.32 * s)) + fl(C(cx, cy - 0.18 * s, 0.44 * s)) + fl(C(cx + 0.5 * s, cy + 0.02 * s, 0.3 * s)) + fl(R(cx - 0.5 * s, cy, s, 0.32 * s));
  const house = (cx, by, w, cut) => { const h = w * 0.95, x0 = cx - w / 2, x1 = cx + w / 2, ew = w * 0.86;
    const out = pts([[cx, by - h], [cx + ew / 2 + w * 0.08, by - h * 0.52], [x1 - w * 0.08, by - h * 0.52], [x1 - w * 0.08, by], [x0 + w * 0.08, by], [x0 + w * 0.08, by - h * 0.52], [cx - ew / 2 - w * 0.08, by - h * 0.52]]) + "Z";
    return fl(out + (cut || R(cx - w * 0.1, by - h * 0.32, w * 0.2, h * 0.32)), true); };
  const bolt = (cx, cy, s) => pts([[0.1, -0.5], [-0.32, 0.08], [-0.03, 0.08], [-0.12, 0.5], [0.32, -0.1], [0.03, -0.1]].map(([x, y]) => [cx + x * s, cy + y * s])) + "Z";
  const battery = (x, y, w, h) => st(RR(x, y, w, h, h * 0.16)) + fl(R(x + w + 6, y + h * 0.3, h * 0.14, h * 0.4)) + fl(bolt(x + w / 2, y + h / 2, h * 0.68));
  const head = (x, y, a, k) => fl(pts([[x + Math.cos(a) * k * 0.15, y + Math.sin(a) * k * 0.15], [x - Math.cos(a - 0.62) * k, y - Math.sin(a - 0.62) * k], [x - Math.cos(a + 0.62) * k, y - Math.sin(a + 0.62) * k]]) + "Z");
  const arrow = (x1, y1, x2, y2, hd, w) => { const a = Math.atan2(y2 - y1, x2 - x1), k = hd || 50;
    return `<path d="M${x1} ${y1}L${x2 - Math.cos(a) * k * 0.6} ${y2 - Math.sin(a) * k * 0.6}" fill="none" stroke="${W}" stroke-width="${w || SW}" stroke-linecap="butt"/>` + head(x2, y2, a, k); };
  const xfmr = (cx, by, w) => { const h = w * 0.62, x = cx - w / 2, y = by - h; let fins = ""; for (let k = 1; k < 5; k++) fins += R(x + (w * k) / 5 - w * 0.03, y + h * 0.2, w * 0.06, h * 0.6);
    return fl(R(x, y, w, h) + fins, true) + st(`M${x + w * 0.25} ${y}v${-h * 0.32}M${cx} ${y}v${-h * 0.32}M${x + w * 0.75} ${y}v${-h * 0.32}`); };
  const magnifier = (cx, cy, r) => st(C(cx, cy, r)) + st(`M${cx + r * 0.72} ${cy + r * 0.72}L${cx + r * 1.45} ${cy + r * 1.45}`, SW * 1.6);
  const monitor = (x, y, w, h) => st(RR(x, y, w, h, 14)) + st(`M${x + w / 2} ${y + h}v40M${x + w / 2 - 70} ${y + h + 40}h140`);
  const lockG = (cx, cy, s) => st(`M${cx - 0.3 * s} ${cy}v${-0.25 * s}a${0.3 * s} ${0.3 * s} 0 0 1 ${0.6 * s} 0v${0.25 * s}`, SW) + fl(RR(cx - 0.45 * s, cy, 0.9 * s, 0.7 * s, 14) + C(cx, cy + 0.3 * s, 0.09 * s) + R(cx - 0.04 * s, cy + 0.32 * s, 0.08 * s, 0.2 * s), true);
  const car = (cx, by, w) => { const h = w * 0.42, x = cx - w / 2, y = by - h;
    return fl(pts([[x, by - h * 0.2], [x, y + h * 0.42], [x + w * 0.16, y + h * 0.36], [x + w * 0.3, y], [x + w * 0.7, y], [x + w * 0.84, y + h * 0.36], [x + w, y + h * 0.42], [x + w, by - h * 0.2]]) + "Z" +
      R(x + w * 0.34, y + h * 0.12, w * 0.14, h * 0.24) + R(x + w * 0.52, y + h * 0.12, w * 0.14, h * 0.24), true) + fl(C(x + w * 0.24, by - h * 0.12, w * 0.11) + C(x + w * 0.76, by - h * 0.12, w * 0.11)); };
  const clock = (cx, cy, r) => st(C(cx, cy, r)) + st(`M${cx} ${cy - r * 0.55}V${cy}L${cx + r * 0.42} ${cy + r * 0.3}`);
  const circArrow = (cx, cy, r, a0, a1) => { const p = (a) => [cx + Math.cos((a * Math.PI) / 180) * r, cy + Math.sin((a * Math.PI) / 180) * r], [x0, y0] = p(a0), [x1, y1] = p(a1), large = Math.abs(a1 - a0) > 180 ? 1 : 0;
    const t = ((a1 + 90) * Math.PI) / 180; return `<path d="M${x0} ${y0}A${r} ${r} 0 ${large} 1 ${x1} ${y1}" fill="none" stroke="${W}" stroke-width="${SW}" stroke-linecap="butt"/>` + head(x1 + Math.cos(t) * 18, y1 + Math.sin(t) * 18, t, 54); };
  const plusBadge = (cx, cy, r) => fl(C(cx, cy, r) + R(cx - r * 0.12, cy - r * 0.56, r * 0.24, r * 1.12) + R(cx - r * 0.56, cy - r * 0.12, r * 1.12, r * 0.24), true);
  const signal = (cx, cy, r) => st(`M${cx - r} ${cy - r * 0.3}a${r * 1.2} ${r * 1.2} 0 0 1 ${2 * r} 0M${cx - r * 0.55} ${cy}a${r * 0.7} ${r * 0.7} 0 0 1 ${r * 1.1} 0`, SW * 0.85) + fl(C(cx, cy + r * 0.3, SW * 0.6));
  const panelRoof = (x, y, w, h) => { let c = ""; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) c += R(x + (w * i) / 3 + 6, y + (h * j) / 2 + 6, w / 3 - 12, h / 2 - 12); return fl(R(x, y, w, h) + c, true); };
  const roofPanel = (cx, by, w) => { const h = w * 0.95, ew = w * 0.86, A = [cx - ew / 2 - w * 0.08, by - h * 0.52], B = [cx, by - h], t = 0.2, u = 0.85, off = w * 0.1;
    const lerp = (k) => [A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k], n = [-(B[1] - A[1]), B[0] - A[0]], nl = Math.hypot(...n), N = [n[0] / nl * off * -1, n[1] / nl * off * -1];
    const p0 = lerp(t), p1 = lerp(u), q0 = [p0[0] + N[0] * 2.4, p0[1] + N[1] * 2.4], q1 = [p1[0] + N[0] * 2.4, p1[1] + N[1] * 2.4], r0 = [p0[0] + N[0] * 0.6, p0[1] + N[1] * 0.6], r1 = [p1[0] + N[0] * 0.6, p1[1] + N[1] * 0.6];
    const m0 = lerp((t + u) / 2), m = [m0[0] + N[0] * 0.6, m0[1] + N[1] * 0.6], mq = [m0[0] + N[0] * 2.4, m0[1] + N[1] * 2.4];
    return fl(pts([r0, r1, q1, q0]) + "Z") + st(`M${m[0]} ${m[1]}L${mq[0]} ${mq[1]}`, 6).replace('stroke="#FFFFFF"', 'stroke="#000" stroke-opacity="0.35"'); };
  const roofCells = (cx, by, w) => { const h = w * 0.95, ew = w * 0.86, A = [cx - ew / 2 - w * 0.08, by - h * 0.52], B = [cx, by - h], L = (k) => [A[0] + (B[0] - A[0]) * k, A[1] + (B[1] - A[1]) * k];
    let d = ""; [[0.12, 0.34], [0.4, 0.62], [0.68, 0.9]].forEach(([a, b]) => { const p = L(a), q = L(b); d += pts([[p[0], p[1] + w * 0.05], [q[0], q[1] + w * 0.05], [q[0], q[1] + w * 0.24], [p[0], p[1] + w * 0.24]]) + "Z"; }); return d; };
  const noEntry = (cx, cy, r) => fl(C(cx, cy, r) + `M${cx - r * 0.6} ${cy - r * 0.16}h${r * 1.2}v${r * 0.32}h${-r * 1.2}Z`, true);
  const pole = (cx, by, h) => st(`M${cx} ${by}V${by - h}M${cx - h * 0.3} ${by - h * 0.86}H${cx + h * 0.3}`);
  const factory = (x, by, w, h) => fl(pts([[x, by], [x, by - h * 0.55], [x + w * 0.33, by - h * 0.8], [x + w * 0.33, by - h * 0.55], [x + w * 0.66, by - h * 0.8], [x + w * 0.66, by - h * 0.55], [x + w, by - h * 0.8], [x + w, by]]) + "Z" +
    R(x + w * 0.12, by - h * 0.36, w * 0.16, h * 0.16) + R(x + w * 0.42, by - h * 0.36, w * 0.16, h * 0.16) + R(x + w * 0.72, by - h * 0.36, w * 0.16, h * 0.16), true);
  const tower = (x, by, w, h) => fl(pts([[x, by], [x + w * 0.12, by - h], [x + w * 0.88, by - h], [x + w, by]]) + "Z");
  const pin = (cx, cy, r) => fl(`M${cx} ${cy + r * 1.9}C${cx - r * 0.6} ${cy + r * 1.1} ${cx - r} ${cy + r * 0.6} ${cx - r} ${cy}a${r} ${r} 0 1 1 ${2 * r} 0C${cx + r} ${cy + r * 0.6} ${cx + r * 0.6} ${cy + r * 1.1} ${cx} ${cy + r * 1.9}Z` + C(cx, cy, r * 0.42), true);
  const waves = (x0, x1, y, a) => { let d = `M${x0} ${y}`; for (let x = x0; x < x1; x += 80) d += `q20 ${-a} 40 0t40 0`; return st(d, SW * 0.85); };
  const flag = (x, by, h) => st(`M${x} ${by}V${by - h}`, SW * 0.8) + fl(`M${x} ${by - h}h${h * 0.62}l-${h * 0.12} ${h * 0.18}l${h * 0.12} ${h * 0.18}h-${h * 0.62}Z`);
  const sine = (x0, x1, y, a) => { let d = `M${x0} ${y}`; const n = 2, L = (x1 - x0) / n; for (let k = 0; k < n; k++) d += `c${L * 0.18} ${-a * 1.3} ${L * 0.32} ${-a * 1.3} ${L / 2} 0s${L * 0.32} ${a * 1.3} ${L / 2} 0`; return st(d); };
  const barrier = (cx, cy, w) => fl(RR(cx - w / 2, cy - w * 0.22, w, w * 0.44, 10) + pts([[cx - w * 0.3, cy - w * 0.22], [cx - w * 0.1, cy - w * 0.22], [cx - w * 0.3, cy + w * 0.22], [cx - w * 0.5, cy + w * 0.22]]) + "Z" + pts([[cx + w * 0.1, cy - w * 0.22], [cx + w * 0.3, cy - w * 0.22], [cx + w * 0.1, cy + w * 0.22], [cx - w * 0.1, cy + w * 0.22]]) + "Z", true) + st(`M${cx - w * 0.36} ${cy + w * 0.22}v${w * 0.3}M${cx + w * 0.36} ${cy + w * 0.22}v${w * 0.3}`);
  const coolTower = (x, by, w, h) => fl(`M${x} ${by}C${x + w * 0.22} ${by - h * 0.5} ${x + w * 0.22} ${by - h * 0.7} ${x + w * 0.1} ${by - h}H${x + w * 0.9}C${x + w * 0.78} ${by - h * 0.7} ${x + w * 0.78} ${by - h * 0.5} ${x + w} ${by}Z`);

  const dataHall = (x, by, w, h) => fl(R(x, by - h, w, h) + R(x + w * 0.14, by - h * 0.8, w * 0.72, h * 0.12) + R(x + w * 0.14, by - h * 0.56, w * 0.72, h * 0.12) + R(x + w * 0.14, by - h * 0.32, w * 0.72, h * 0.12), true);
  const I = {
    // OPTIMISE
    1: pylon(170, 470, 400) + st("M314 182Q400 222 470 210") + fl(R(366, 186, 70, 50)) + signal(401, 128, 48),
    2: st("M40 390H186M326 390H400", SW * 1.3) + arrow(380, 390, 480, 390, 54, SW * 1.3) + noEntry(256, 390, 66) + `<path d="M116 380C126 150 386 150 396 330" fill="none" stroke="${W}" stroke-width="${SW}"/>` + head(397, 352, Math.PI / 2, 54),
    3: xfmr(170, 470, 240) + magnifier(330, 200, 108) + st("M272 236l38-46 34 26 44-62"),
    4: sun(170, 120, 52) + cloud(300, 170, 190) + st("M70 290V460H460") + st("M110 420L190 380L260 400") + st("M300 370L340 340M380 312L420 284"),
    5: sun(150, 150, 50) + turbine(350, 300, 230) + battery(110, 330, 280, 140),
    6: house(160, 470, 250) + car(372, 470, 190) + clock(330, 180, 86),
    7: coolTower(40, 470, 150, 250) + factory(170, 470, 170, 200) + arrow(430, 300, 430, 120, 54) + arrow(430, 300, 430, 480, 54),
    8: house(180, 470, 290, R(151, 380, 58, 90) + roofCells(180, 470, 290)) + sun(400, 120, 46) + arrow(334, 400, 396, 400, 44) + pole(446, 470, 220),
    9: monitor(40, 80, 432, 290) + st("M80 230h70l34-70 50 130 40-90 26 30h132") + fl(C(424, 126, 16)),
    // REINFORCE
    10: pylon(160, 470, 400) + st("M304 182Q370 214 430 204", SW * 1.6) + st(C(380, 380, 100)) + fl(C(380, 380, 30) + C(380, 322, 24) + C(380, 438, 24) + C(330, 351, 24) + C(430, 351, 24) + C(330, 409, 24) + C(430, 409, 24)),
    11: xfmr(120, 470, 150) + xfmr(330, 470, 220) + arrow(226, 250, 226, 60, 54),
    12: sine(40, 472, 120, 70) + circArrow(150, 360, 96, 200, 480) + battery(280, 300, 170, 120),
    13: circArrow(256, 290, 200, 205, 500) + house(256, 400, 220, bolt(256, 330, 110)),
    14: st("M256 40L410 90V230C410 340 340 410 256 450C172 410 102 340 102 230V90Z") + lockG(256, 230, 140) + st("M102 160H40M410 160H472M102 330H40M410 330H472") + fl(C(40, 160, 22) + C(472, 160, 22) + C(40, 330, 22) + C(472, 330, 22)),
    // EXPAND
    15: xfmr(150, 470, 210) + dataHall(300, 470, 170, 230) + plusBadge(150, 150, 76),
    16: pylon(100, 470, 240) + pylon(300, 470, 240) + st("M186 297Q290 325 400 300", SW * 0.9) + pin(450, 200, 58),
    17: flag(70, 270, 170) + fl(R(30, 270, 130, 110)) + flag(400, 270, 170) + fl(R(352, 270, 130, 110)) + st("M160 330H352", SW) + st("M206 330h20M286 330h20", SW * 2.2) + waves(176, 340, 440, 22)
  };
  // frame each icon on its own drawing: a square view box round what is drawn, so every icon sits centred and fills its badge
  const fit = (body) => { try { const NS = "http://www.w3.org/2000/svg", sv = document.createElementNS(NS, "svg"); sv.setAttribute("style", "position:absolute;left:-9999px;width:512px;height:512px"); sv.innerHTML = body; document.documentElement.appendChild(sv);
    const b = sv.getBBox(); sv.remove(); const pad = SW * 0.8, side = Math.max(b.width, b.height) + 2 * pad, cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    return `${(cx - side / 2).toFixed(1)} ${(cy - side / 2).toFixed(1)} ${side.toFixed(1)} ${side.toFixed(1)}`; } catch (e) { return "0 0 512 512"; } };
  window.ICONS = window.ICONS || {};
  Object.entries(I).forEach(([n, body]) => (window.ICONS["i7-" + n] = { vb: fit(body), body }));
})();
// The turned, outlined plates of the shield sheet (exports/intervention-shields-iso.svg), for the page:
// PLATE6.g(cat, icon, cx, cy, size, parent) draws one into an svg group; PLATE6.svg(cat, icon) returns a standalone <svg>.
// The composite item icons ("i7-n") are drawn larger in their plate than the single technology icons.
window.PLATE6 = (function () {
  const NS = "http://www.w3.org/2000/svg", el = (t, a, p) => { const n = document.createElementNS(NS, t); Object.entries(a || {}).forEach(([k, v]) => n.setAttribute(k, v)); if (p) p.appendChild(n); return n; };
  const DARK = { optimize: "#0A6438", reinforce: "#1F74A6", expand6: "#B38900", expand: "#B38900" };
  const CORNERS = { optimize: [[50, 2], [93, 26], [93, 74]], reinforce: [[50, 2], [94, 14], [94, 46]], expand6: [[50, 1], [99, 50]], expand: [[50, 1], [99, 50]] };
  const BIG = { optimize: [50, 64], reinforce: [46, 60], expand6: [50, 50], expand: [50, 50] };
  function g(cat, icon, cx, cy, size, parent) {
    const sh = SVG.SHAPES[cat], INK = { stroke: "#000", "stroke-width": 0.9, "stroke-linejoin": "miter" };
    const plate = el("g", { transform: `translate(${cx} ${cy}) matrix(0.9 0.2 0 1 0 0) translate(${-size / 2} ${-size / 2}) scale(${size / 100})` }, parent);
    for (let k = 7; k >= 1; k--) el("path", Object.assign({ d: sh.outer, fill: DARK[cat], transform: `translate(${k * 0.9} ${-k * 0.55})` }, k === 7 ? INK : {}), plate);
    CORNERS[cat].forEach(([x, y]) => el("path", Object.assign({ d: `M${x} ${y}l6.3 -3.85`, fill: "none" }, INK), plate));
    el("path", Object.assign({ d: sh.outer, fill: sh.fill }, INK), plate);
    el("path", { d: sh.inner, fill: "none", stroke: sh.line, "stroke-width": 2.5 }, plate);
    if (icon) { const big = /^i7-/.test(icon), [iy, is] = big ? BIG[cat] : [sh.iconY, sh.iconS]; const ic = SVG.icon(icon, 50, iy, is, sh.ink, plate); if (ic && big) ic.innerHTML = ic.innerHTML.replace(/#FFFFFF/gi, sh.ink); }   // the composite icons take the plate's ink (dark on the yellow)
    return plate;
  }
  function svg(cat, icon) { const s = el("svg", { viewBox: "-6 -12 116 118", "aria-hidden": "true", class: "plate6" }); g(cat, icon, 50, 50, 100, s); return s; }
  return { g, svg };
})();
