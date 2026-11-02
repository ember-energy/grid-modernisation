/* section J (the age of power) in the isometric style. The map, the camera, the flags and the beats stay as they
   are in js/acts.js; what changes is what stands on the map. Each region's tableau is a small isometric slab of land instead of an
   ellipse with side-on drawings, and the small nodes (wind, solar, data centres, towns, storage, villages, geothermal) are small slabs too.
   acts.js calls these hooks only when window.ISOJ exists, so the archived old/index-old.html is untouched. */
(function () {
  if (!window.CLEAN || !window.ISOSCENES) return;
  const { el } = SVG;
  const { C } = ISO;
  const { K } = ISOSCENES;
  const P = (x, y, z) => ISO.P(x, y, z);
  const F = ISO.frame([0, 0], 1);
  const shade = (h) => ISO.mixHex(h, "#000000", 0.16), lite = (h) => ISO.mixHex(h, "#FFFFFF", 0.35);
  const KS = 1 / 3;   // iso units → map units: a slab 10 × 4.4 units is 144 map units wide, like the old ellipse

  // ---------- a slab of land standing in for a tableau or a node ----------
  // Items are drawn back to front (by gx + gy); movers sit in lanes along gx, between what lies behind and in front of them.
  function slab(parent, cx, cy, N, M, ground, opts) {
    opts = opts || {};
    const c = P(N / 2, M / 2), tr = opts.raw ? `translate(${(30 * (cx - cy)).toFixed(2)} ${(17.32 * (cx + cy)).toFixed(2)})`   // raw: at (cx, cy) in iso units, unscaled
      : `translate(${(cx - c[0] * KS).toFixed(2)} ${(cy - c[1] * KS).toFixed(2)}) scale(${KS})`;
    const g = el("g", { transform: tr, "data-noink": "", "data-nowobble": "", class: "isoslab" }, parent);
    const T = opts.T || 0.45;
    K.quad(g, [[0, M, 0], [N, M, 0], [N, M, -T], [0, M, -T]], "#C9CED6");
    K.quad(g, [[N, 0, 0], [N, M, 0], [N, M, -T], [N, 0, -T]], "#AEB5C0");
    K.rect(g, 0, 0, N, M, ground || "#DCEBD3", 1.3);
    const gnd = el("g", null, g), items = el("g", null, g);
    const Q = [], LN = [], out = { fossil: [], green: [], base: [] };
    return {
      g, gnd, N, M, out,
      add: (x, y, fn, cat) => Q.push([x, y, fn, cat || "base"]),
      lane: (y, fn, cat) => LN.push([y, fn, cat || "base"]),
      flush() {
        LN.sort((a, b) => a[0] - b[0]);
        const cuts = LN.map((l) => l[0]).concat([Infinity]); let lo = -Infinity;
        cuts.forEach((yc, i) => {
          Q.filter(([, y]) => y >= lo && y < yc).sort((a, b) => a[0] + a[1] - b[0] - b[1]).forEach(([, , fn, cat]) => { const n = el("g", null, items); fn(n); out[cat].push(n); });
          if (LN[i]) { const n = el("g", null, items); LN[i][1](n); out[LN[i][2]].push(n); }
          lo = yc;
        });
        return out;
      }
    };
  }
  // a mover looping along gx inside a slab (from x0 to x1), back and forth or round
  let STILL = false;   // when set (the tile board), movers are parked where they stand instead of looping
  const loop = (g, x0, x1, dur, yoyo, off) => {
    if (STILL) { const p = x0 + (x1 - x0) * (0.3 + 0.4 * ((off || 0) % 1)); g.setAttribute("transform", `translate(${(K.UX[0] * p).toFixed(1)} ${(K.UX[1] * p).toFixed(1)})`); return null; }
    if (yoyo) return gsap.fromTo(g, { x: K.UX[0] * x0, y: K.UX[1] * x0 }, { x: K.UX[0] * x1, y: K.UX[1] * x1, duration: dur, repeat: -1, yoyo: true, ease: "sine.inOut", delay: -(off || 0) * dur });
    const o = { p: x0 }, cl = (v) => Math.max(0, Math.min(1, v));   // one way round: fades in at the start and out at the end, so nothing hangs off the slab
    const set = () => { g.setAttribute("transform", `translate(${(K.UX[0] * o.p).toFixed(1)} ${(K.UX[1] * o.p).toFixed(1)})`); g.setAttribute("opacity", (cl((o.p - x0) / 0.9) * cl((x1 - o.p) / 0.9)).toFixed(2)); };
    return gsap.fromTo(o, { p: x0 }, { p: x1, duration: dur, repeat: -1, ease: "none", delay: -(off || 0) * dur, onUpdate: set });
  };

  // ---------- small parts ----------
  const turbine = (g, x, y, h) => ISO.turbine(g, F, x, y, h || 3.2);
  const panels = (g, x0, y0, x1, y1) => { for (let y = y0; y < y1 - 0.5; y += 0.95) for (let x = x0; x < x1 - 0.8; x += 1.9) ISO.panel(g, F, x, y, Math.min(1.7, x1 - x - 0.1), 0.7); };
  const roofPV = (g, x, y, w, d, z) => K.pvRoof(g, x, y, z, w, d);
  const palm = (g, x, y, s) => { s = s || 1; const b = P(x, y, 0), t = P(x + 0.1, y, 1.5 * s); el("path", { d: `M${b[0] - 2} ${b[1]} Q${b[0] + 4} ${(b[1] + t[1]) / 2} ${t[0]} ${t[1]} Q${b[0] + 6} ${(b[1] + t[1]) / 2} ${b[0] + 2} ${b[1]} Z`, fill: "#9C7B5B", stroke: "#000", "stroke-width": 0.8 }, g);
    [[-1, 0.3], [-1, -0.5], [1, 0.3], [1, -0.5], [0.2, -1]].forEach(([dx, dy]) => { const ex = t[0] + dx * 15 * s, ey = t[1] + (dy + 1.2) * 7 * s; el("path", { d: `M${t[0]} ${t[1]} Q${t[0] + dx * 8 * s} ${t[1] + dy * 8 * s - 3} ${ex} ${ey} Q${t[0] + dx * 6 * s} ${t[1] + dy * 5 * s + 2} ${t[0]} ${t[1] + 1.4} Z`, fill: dx < 0 ? "#6FB884" : "#5FAE76", stroke: "#000", "stroke-width": 0.7 }, g); }); };
  const acacia = (g, x, y, s) => { s = s || 1; const b = P(x, y, 0), t = P(x, y, 1.0 * s); el("path", { d: `M${b[0] - 1.5} ${b[1]} L${t[0] - 1} ${t[1]} L${t[0] - 7 * s} ${t[1] - 6 * s} M${t[0] + 1} ${t[1]} L${t[0] + 7 * s} ${t[1] - 6 * s} M${t[0] + 1} ${t[1]} L${b[0] + 1.5} ${b[1]}`, stroke: "#5B4A42", "stroke-width": 2, fill: "none" }, g);
    el("path", { d: `M${t[0] - 18 * s} ${t[1] - 6 * s} Q${t[0]} ${t[1] - 16 * s} ${t[0] + 18 * s} ${t[1] - 6 * s} Q${t[0]} ${t[1] - 2 * s} ${t[0] - 18 * s} ${t[1] - 6 * s} Z`, fill: "#7DBF7E", stroke: "#000", "stroke-width": 0.9 }, g); };
  const gum = (g, x, y, s) => K.tree(g, x, y, (s || 1) * 1.1, null, "#9DBFA3");
  const hut = (g, x, y, s) => { s = s || 1; F.cyl(g, [x, y, 0], "z", 0.42 * s, 0.42 * s, { side: "#D8D2C4", cap: "#C9A15A" }); const a = P(x - 0.62 * s, y + 0.0, 0.4 * s), b = P(x + 0.62 * s, y, 0.4 * s), c = P(x, y + 0.62 * s, 0.4 * s), d = P(x, y - 0.62 * s, 0.4 * s), t = P(x, y, 1.15 * s);
    el("path", { d: `M${a[0]} ${a[1]} Q${c[0]} ${c[1] + 4} ${b[0]} ${b[1]} L${t[0]} ${t[1]} Z`, fill: "#C9A15A", stroke: "#000", "stroke-width": 0.9 }, g); const dr = P(x, y + 0.42 * s, 0.25 * s); el("path", { d: `M${dr[0] - 2} ${dr[1] + 6} L${dr[0] - 2} ${dr[1]} L${dr[0] + 2} ${dr[1] - 1} L${dr[0] + 2} ${dr[1] + 5} Z`, fill: "#5B4A42", stroke: "#000", "stroke-width": 0.5 }, g); };
  const roo = (g, x, y, dir, s) => { const q = K.plane(g, x, y, "x", dir || 1), ns = { "vector-effect": "non-scaling-stroke" }, sc = s || 1, f = "#B07A4E";
    el("path", Object.assign({ d: `M${-0.02 * sc} ${0.1 * sc} Q${-0.25 * sc} ${0.06 * sc} ${-0.4 * sc} 0 L${-0.38 * sc} ${-0.01 * sc} Q${-0.2 * sc} ${0.02 * sc} 0 ${0.04 * sc} Z M0 0.02 L${0.16 * sc} 0.02 L${0.16 * sc} 0 Z M${-0.08 * sc} ${0.05 * sc} C${-0.12 * sc} ${0.2 * sc} ${-0.02 * sc} ${0.3 * sc} ${0.06 * sc} ${0.36 * sc} L${0.1 * sc} ${0.44 * sc} L${0.16 * sc} ${0.43 * sc} L${0.14 * sc} ${0.36 * sc} C${0.12 * sc} ${0.24 * sc} ${0.1 * sc} ${0.12 * sc} ${0.06 * sc} ${0.04 * sc} Z`, fill: f, stroke: "#000", "stroke-width": 0.7 }, ns), q);
    el("path", Object.assign({ d: `M${0.1 * sc} ${0.44 * sc} L${0.08 * sc} ${0.52 * sc} L${0.12 * sc} ${0.45 * sc} Z`, fill: f, stroke: "#000", "stroke-width": 0.5 }, ns), q); };
  const truck = (g, x, y, col, len) => { len = len || 1.4; F.box(g, x, y, 0.1, len * 0.55, 0.58, 0.28, { left: col, right: shade(col), top: lite(col) }); F.box(g, x + len * 0.55, y + 0.02, 0.1, len * 0.45, 0.54, 0.5, { left: col, right: shade(col), top: lite(col) }); F.box(g, x + len * 0.62, y + 0.06, 0.38, len * 0.3, 0.46, 0.18, { left: C.water, right: shade(C.water), top: lite(col) }); };
  const smokeAt = (g, x, y, z, big) => { const p = P(x, y, z); K.smoke(g, p[0], p[1] - 3, big); };
  const lngTank = (g, x, y, r) => { F.cyl(g, [x, y, 0], "z", r, r * 1.2, { side: "#F1F2F4", cap: "#E3E6EB" }); const t = P(x, y, r * 1.2); el("path", { d: `M${t[0] - r * 52} ${t[1]} Q${t[0]} ${t[1] - r * 40} ${t[0] + r * 52} ${t[1]} Z`, fill: "#E3E6EB", stroke: "#000", "stroke-width": 0.9 }, g); };
  const dataHall = (g, x, y, w, d) => { const b = F.box(g, x, y, 0, w, d, 0.9, { left: "#3E4860", right: "#262C3A", top: "#626E88" }); for (let u = 0.25; u < w - 0.2; u += 0.4) { F.face(g, F.L, b, u, 0.25, u + 0.24, 0.65, "#1E2433", { "stroke-width": 0.4 }); F.face(g, F.L, b, u + 0.06, 0.4, u + 0.14, 0.47, "#47B970", { stroke: "none", class: "fx anim blink", style: `animation-delay:${(u * 0.37).toFixed(2)}s` }); } for (let u = 0.3; u < w - 0.6; u += 0.9) F.box(g, x + u, y + 0.25, 0.9, 0.6, 0.6, 0.22, { left: C.g1, right: C.g2, top: C.w1 }); return b; };
  const townhouse = (g, x, y, w, d, h, col, pv) => { const b = ISO.house(g, F, x, y, w, d, h, 0.55, "#6E6A72"); F.face(g, F.L, b, 0.05, 0, w - 0.05, h, col, { "stroke-width": 0.8 }); for (let z = 0.45; z < h - 0.3; z += 0.55) F.face(g, F.L, b, w * 0.25, z, w * 0.75, z + 0.3, "#FFFFFF", { "stroke-width": 0.5 }); F.face(g, F.L, b, w * 0.35, 0, w * 0.65, 0.4, "#5B4A42", { "stroke-width": 0.5 }); return b; };
  const pvOnHouse = (g, x, y, w, d, h) => K.pvQuad(g, [x + 0.1, y + d + 0.03, h + 0.06], [x + w - 0.1, y + d + 0.03, h + 0.06], [x + w - 0.1, y + d / 2 + 0.15, h + 0.4], [x + 0.1, y + d / 2 + 0.15, h + 0.4], Math.max(3, Math.round(w * 4)), 2);

  // ---------- the regions ----------
  const FILL = {   // each region on a square slab, 7.2 × 7.2 units: the back rows first, the front rows last
    eu(S) {
      K.rect(S.gnd, 4.3, 0, 7.2, 1.7, C.water, 1);
      [[5.0, 0.6], [6.3, 0.5], [6.6, 1.3]].forEach(([x, y]) => S.add(x, y, (g) => turbine(g, x, y, 2.8), "green"));
      S.add(1.2, 0.9, (g) => panels(g, 0.3, 0.3, 2.3, 1.5), "green");
      S.add(3.4, 0.9, (g) => { F.box(g, 2.5, 0.5, 0, 1.2, 0.8, 0.8, { left: "#E3DCCB", right: "#C9C0AC", top: "#F3EDE0" }); K.quad(g, [[2.5, 0.5, 0.8], [3.7, 0.5, 0.8], [3.7, 0.9, 1.15], [2.5, 0.9, 1.15]], "#8F8784"); K.quad(g, [[2.5, 1.3, 0.8], [3.7, 1.3, 0.8], [3.7, 0.9, 1.15], [2.5, 0.9, 1.15]], "#A79E9A");
        F.box(g, 3.7, 0.6, 0, 0.5, 0.5, 1.7, { left: "#E3DCCB", right: "#C9C0AC", top: "#F3EDE0" }); K.quad(g, [[3.7, 1.1, 1.7], [4.2, 1.1, 1.7], [3.95, 0.85, 2.7]], "#5FAE76"); K.quad(g, [[4.2, 0.6, 1.7], [4.2, 1.1, 1.7], [3.95, 0.85, 2.7]], "#47965F"); });
      [[0.5, 2.4, "#C96F4A", 1.9, true], [1.4, 2.4, "#F3E6CC", 2.2, false], [2.3, 2.4, "#BFD3B4", 2.0, true], [3.2, 2.4, "#C96F4A", 1.8, true], [4.1, 2.4, "#E9D9B4", 2.1, false]].forEach(([x, y, c, h, pv]) => { S.add(x + 0.42, y + 0.5, (g) => townhouse(g, x, y, 0.85, 1.0, h, c)); if (pv) S.add(x + 0.43, y + 0.51, (g) => pvOnHouse(g, x, y, 0.85, 1.0, h), "green"); });
      S.add(5.4, 3.0, (g) => F.box(g, 5.2, 3.0, 0, 0.4, 0.3, 0.35, { left: C.w2, right: C.w3, top: C.w1 }));
      [[6.0, 2.6, "pine"], [6.8, 3.4], [0.4, 6.4, "dark"], [2.0, 6.7]].forEach(([x, y, k]) => S.add(x, y, (g) => K.tree(g, x, y, 0.8, k)));
      S.lane(4.4, (g) => { K.lineGX(g, 4.45, 0, 7.2, 0, "#3E4860", 1.2); K.lineGX(g, 4.95, 0, 7.2, 0, "#3E4860", 1.2); const t = el("g", null, g); [0.3, 1.9].forEach((u) => K.wheel(t, u, 5.0, 0.1, 0.09, "y")); const b = F.box(t, 0, 4.4, 0.12, 2.2, 0.6, 0.75, { left: "#FFCD00", right: shade("#FFCD00"), top: "#F1F2F4" }); for (let u = 0.25; u < 2.0; u += 0.45) F.face(t, F.L, b, u, 0.32, u + 0.3, 0.6, C.water, { "stroke-width": 0.5 }); K.seg(t, [1.1, 4.7, 0.87], [0.8, 4.7, 1.3], "#3E4860", 1); loop(t, -0.2, 4.8, 7, true); });
      S.add(5.4, 5.9, (g) => { K.charger(g, 6.1, 5.7); K.car(g, 4.8, 5.8, "#4AB4D6", "x"); }, "green");
      S.add(3.0, 6.0, (g) => K.bench(g, 2.8, 5.9));
      S.add(6.2, 6.6, (g) => { K.person(g, 6.0, 6.5, { idle: true, top: "#EE7309", dress: true }); K.person(g, 6.4, 6.6, { idle: true, top: "#4AB4D6" }); });
    },
    cn(S) {
      S.add(1.2, 0.9, (g) => panels(g, 0.3, 0.3, 2.4, 1.6), "green");
      [[2.6, 0.4, 0.9, 0.9, 4.0, "#E3E6EB"], [3.7, 0.3, 1.0, 1.0, 5.2, "#9FB2C6"], [4.9, 0.5, 0.9, 0.9, 4.4, "#F1F2F4"]].forEach(([x, y, w, d, h, c]) => S.add(x + w / 2, y + d / 2, (g) => K.tower(g, x, y, w, d, h, c, C.water, "pv", { noShop: true, floor: 0.5 })));
      [[6.3, 0.6], [6.6, 1.9]].forEach(([x, y]) => S.add(x, y, (g) => turbine(g, x, y, 3.0), "green"));
      S.add(1.4, 2.9, (g) => { [0.7, 2.0].forEach((x) => F.box(g, x, 2.8, 0, 0.18, 0.18, 0.9, { left: "#C8102E", right: "#9E0B22", top: "#C8102E" })); F.box(g, 0.55, 2.75, 0.9, 1.8, 0.3, 0.12, { left: "#3E4860", right: "#262C3A", top: "#5B6478" }); F.box(g, 0.8, 2.8, 1.02, 1.3, 0.2, 0.22, { left: "#C8102E", right: "#9E0B22", top: "#C8102E" }); F.box(g, 0.65, 2.73, 1.24, 1.6, 0.34, 0.1, { left: "#3E4860", right: "#262C3A", top: "#5B6478" }); });
      [[3.0, 2.6, "#4AB4D6"], [4.6, 2.6, "#F1F2F4"]].forEach(([x, y, c]) => S.add(x + 0.6, y + 0.3, (g) => { K.charger(g, x + 1.25, y - 0.15); K.car(g, x, y, c, "x"); }, "green"));
      S.add(6.4, 3.2, (g) => K.tree(g, 6.4, 3.2, 0.8, "dark"));
      S.lane(4.3, (g) => { F.box(g, 0, 4.3, 0.5, 7.2, 0.7, 0.12, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" }); [0.8, 3.3, 5.8].forEach((x) => F.box(g, x, 4.5, 0, 0.18, 0.18, 0.5, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" }));
        const w = el("g", { transform: `translate(0 ${-0.62 * 34.64})` }, g), t = el("g", null, w); K.train(t, 0, 4.34, 1, { stripe: "#C8102E" }); loop(t, -1.6, 4.6, 3.2, false); });
      [[1.0, 6.0, "dark"], [2.4, 6.6]].forEach(([x, y, k]) => S.add(x, y, (g) => K.tree(g, x, y, 0.8, k)));
      S.add(5.4, 6.2, (g) => { K.person(g, 5.2, 6.1, { idle: true, top: "#FFCD00" }); K.person(g, 5.6, 6.3, { idle: true, top: "#3E4860" }); F.box(g, 3.4, 5.8, 0, 1.0, 0.6, 0.6, { left: "#F1F2F4", right: C.w3, top: "#C8102E" }); });
    },
    au(S) {
      S.add(1.8, 1.0, (g) => panels(g, 0.3, 0.3, 3.6, 1.9), "green");
      [[5.4, 0.6], [6.6, 1.2]].forEach(([x, y]) => S.add(x, y, (g) => turbine(g, x, y, 3.0), "green"));
      [[0.6, 3.2, 0.9], [4.8, 2.8, 1.1], [6.6, 3.8, 0.8]].forEach(([x, y, s]) => S.add(x, y, (g) => gum(g, x, y, s)));
      S.add(2.6, 3.2, (g) => { [[1.6, 2.6], [3.6, 2.6], [1.6, 3.6], [3.6, 3.6]].forEach(([x, y]) => F.box(g, x, y, 0, 0.1, 0.1, 0.4, { left: "#6D5A56", right: "#5B4A42", top: "#6D5A56" })); const b = F.box(g, 1.5, 2.5, 0, 2.3, 1.3, 0.4 + 0.7, { left: "#FFFFFF", right: C.w3, top: C.w1 }); F.face(g, F.L, b, 0, 0, 2.3, 0.4, "#E9E2D6", { "stroke-width": 0.6 }); F.face(g, F.L, b, 0.2, 0.6, 0.6, 0.9, C.water, { "stroke-width": 0.5 }); F.face(g, F.L, b, 1.6, 0.6, 2.0, 0.9, C.water, { "stroke-width": 0.5 }); K.fence(g, 1.5, 3.9, 3.8, 3.9, "#626E88");
        K.quad(g, [[1.4, 2.4, 1.1], [3.9, 2.4, 1.1], [3.9, 3.15, 1.55], [1.4, 3.15, 1.55]], "#B9C1CC"); K.quad(g, [[1.4, 3.9, 1.1], [3.9, 3.9, 1.1], [3.9, 3.15, 1.55], [1.4, 3.15, 1.55]], "#C9CED6"); });
      S.add(2.61, 3.21, (g) => { ISO.poly(g, [F.p(1.7, 3.85, 1.14), F.p(3.7, 3.85, 1.14), F.p(3.7, 3.25, 1.5), F.p(1.7, 3.25, 1.5)], C.pv, { "stroke-width": 0.7 }); F.box(g, 4.0, 3.4, 0, 0.3, 0.3, 0.6, { left: "#FFFFFF", right: C.w3, top: "#47B970" }); }, "green");
      S.add(2.4, 5.6, (g) => { roo(g, 2.0, 5.2, 1, 1); roo(g, 2.7, 5.9, -1, 0.8); });
      S.add(4.2, 5.6, (g) => truck(g, 3.6, 5.4, "#FFFFFF", 1.5));
      S.add(5.8, 6.2, (g) => { K.charger(g, 6.5, 5.9); K.car(g, 5.2, 6.0, "#E0785A", "x"); }, "green");
      S.add(6.6, 6.8, (g) => K.person(g, 6.6, 6.8, { idle: true, top: "#47B970", long: true }));
    },
    us(S) {
      K.rect(S.gnd, 0.2, 0.2, 3.6, 2.2, "#D9CF9E", 0.6); for (let y = 0.5; y < 2.2; y += 0.4) K.lineGX(S.gnd, y, 0.2, 3.6, 0, "#C9BE88", 1);
      S.add(1.4, 0.9, (g) => { const b = F.box(g, 0.5, 0.4, 0, 1.5, 1.0, 0.8, { left: "#B5302E", right: shade("#B5302E"), top: "#B5302E" }); F.face(g, F.L, b, 0.45, 0, 1.05, 0.6, "#FFFFFF", { "stroke-width": 0.6 }); K.quad(g, [[0.45, 0.35, 0.8], [2.05, 0.35, 0.8], [2.05, 0.9, 1.25], [0.45, 0.9, 1.25]], "#3E4860"); K.quad(g, [[0.45, 1.45, 0.8], [2.05, 1.45, 0.8], [2.05, 0.9, 1.25], [0.45, 0.9, 1.25]], "#5B6478"); F.cyl(g, [2.6, 0.9, 0], "z", 0.3, 1.6, { side: "#E3E6EB", cap: "#9DA6B5" }); });
      S.add(5.2, 0.9, (g) => { F.cyl(g, [4.4, 0.8, 0], "z", 0.55, 1.5, { side: "#D3D8DF", cap: "#B9C1CC" }); smokeAt(g, 4.4, 0.8, 1.6, true); F.box(g, 5.0, 0.4, 0, 1.1, 0.9, 0.7, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" }); K.chimney(g, 6.6, 0.6, 2.8); }, "fossil");
      [[4.2, 0.6], [5.6, 0.4], [6.8, 1.4]].forEach(([x, y]) => S.add(x, y + 0.05, (g) => turbine(g, x, y, 3.0), "green"));
      [[4.6, 3.1], [6.3, 3.3]].forEach(([x, y]) => S.add(x, y, (g) => { F.box(g, x - 0.6, y, 0, 1.2, 0.12, 0.06, { left: "#626E88", right: "#3E4860", top: "#626E88" }); K.seg(g, [x - 0.2, y + 0.06, 0], [x, y + 0.06, 0.5], "#3E4860", 1.4); K.seg(g, [x + 0.2, y + 0.06, 0], [x, y + 0.06, 0.5], "#3E4860", 1.4); const bm = el("g", null, g); const a = P(x - 0.55, y + 0.06, 0.55), b = P(x + 0.45, y + 0.06, 0.55), o = P(x, y + 0.06, 0.5); el("path", { d: `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`, stroke: "#262C3A", "stroke-width": 3 }, bm); el("circle", { cx: a[0], cy: a[1] + 2, r: 3, fill: "#262C3A" }, bm); gsap.fromTo(bm, { rotation: -10, svgOrigin: `${o[0]} ${o[1]}` }, { rotation: 10, svgOrigin: `${o[0]} ${o[1]}`, duration: 1.4, repeat: -1, yoyo: true, ease: "sine.inOut" }); }, "fossil"));
      S.add(5.4, 3.2, (g) => panels(g, 3.8, 2.6, 7.0, 3.8), "green");
      S.add(1.6, 3.3, (g) => ISO.house(g, F, 0.6, 2.8, 2.0, 1.0, 0.6, 0.4, "#857572"));
      S.add(1.61, 3.31, (g) => pvOnHouse(g, 0.6, 2.8, 2.0, 1.0, 0.6), "green");
      S.lane(4.6, (g) => { K.rect(g, 0, 4.5, 7.2, 5.3, "#5B6478", 0.8); for (let x = 0.3; x < 7.2; x += 1.2) K.lineGX(g, 4.9, x, x + 0.6, 0, "#FFFFFF", 1.2); const t = el("g", null, g); truck(t, 0, 4.6, "#4AB4D6", 1.5); loop(t, -0.6, 5.7, 5, false); });
      S.add(1.6, 6.4, (g) => { K.fence(g, 0.3, 5.8, 3.4, 5.8); K.fence(g, 0.3, 7.0, 3.4, 7.0); K.cow(g, 1.0, 6.3, { dir: 1 }); K.cow(g, 2.4, 6.6, { dir: -1, col: "#C9A988" }); });
      [[4.6, 6.4], [6.4, 6.0, "dark"]].forEach(([x, y, k]) => S.add(x, y, (g) => K.tree(g, x, y, 0.9, k)));
    },
    br(S) {
      K.rect(S.gnd, 3.8, 0, 7.2, 2.2, C.water, 1);
      S.add(5.2, 1.0, (g) => { K.mountain(g, 4.8, 0.9, 0.75, 2.2, { col: "#6F9A7C", dome: true, snow: 2 }); K.mountain(g, 6.1, 1.1, 0.55, 1.4, { col: "#7FA88A", dome: true, snow: 2 }); K.seg(g, [4.8, 0.9, 2.2], [6.1, 1.1, 1.4], "#3E4860", 0.6); });
      [[6.6, 2.8], [6.9, 3.8]].forEach(([x, y]) => S.add(x, y, (g) => turbine(g, x, y, 2.6), "green"));
      S.add(1.0, 0.6, (g) => panels(g, 0.2, 0.2, 2.2, 1.2), "green");
      const COLS = ["#F2B134", "#3FA7D6", "#EE6C4D", "#F7F7F7", "#9BC53D", "#F26DA6"];
      S.add(1.8, 2.4, (g) => { F.box(g, 0.3, 1.6, 0, 3.2, 0.9, 0.5, { left: "#9BBF8A", right: "#7FA070", top: "#9BBF8A" }); F.box(g, 0.6, 1.6, 0.5, 2.4, 0.5, 0.45, { left: "#9BBF8A", right: "#7FA070", top: "#9BBF8A" }); });
      [[0.7, 1.65, 0.95], [1.4, 1.65, 0.95], [2.1, 1.7, 0.95], [0.4, 2.05, 0.5], [1.1, 2.1, 0.5], [1.8, 2.05, 0.5], [2.5, 2.1, 0.5], [0.5, 2.7, 0], [1.3, 2.75, 0], [2.1, 2.7, 0], [2.9, 2.8, 0]].forEach(([x, y, z], i) => {
        S.add(x + 0.3, y + 0.3 + z * 0.01, (g) => { const b = F.box(g, x, y, z, 0.6, 0.5, 0.45, { left: COLS[i % 6], right: shade(COLS[i % 6]), top: lite(COLS[i % 6]) }); F.face(g, F.L, b, 0.12, 0.12, 0.3, 0.3, "#3E4860", { "stroke-width": 0.4 }); });
        if (i % 3 === 0) S.add(x + 0.31, y + 0.31 + z * 0.01, (g) => F.face(g, F.T, { x, y, z, w: 0.6, d: 0.5, h: 0.45 }, 0.08, 0.08, 0.52, 0.42, C.pv, { "stroke-width": 0.5 }), "green"); });
      [[3.8, 3.2, 0.9], [5.2, 3.6, 1], [1.0, 6.6, 0.85]].forEach(([x, y, s]) => S.add(x, y, (g) => palm(g, x, y, s)));
      S.lane(4.5, (g) => { K.rect(g, 0, 4.45, 7.2, 5.3, "#5B6478", 0.8); const t = el("g", null, g); K.bus(t, 0, 4.55, "#47B970"); loop(t, -0.4, 4.0, 6, true); });
      S.add(5.6, 5.9, (g) => { [5.0, 5.9].forEach((x) => F.box(g, x, 5.6, 0, 0.06, 0.06, 0.8, { left: "#3E4860", right: "#262C3A", top: "#3E4860" })); F.box(g, 4.9, 5.55, 0.8, 1.2, 0.3, 0.06, { left: "#47B970", right: "#2F8A52", top: "#47B970" }); K.person(g, 5.3, 5.85, { idle: true, top: "#F2B134" }); K.person(g, 5.6, 5.9, { idle: true, top: "#47B970", long: true }); });
      S.add(3.0, 6.4, (g) => K.tree(g, 3.0, 6.4, 0.9, "dark"));
    },
    as(S) {
      K.rect(S.gnd, 0, 3.6, 2.6, 7.2, C.water, 1); K.rect(S.gnd, 2.6, 3.6, 2.8, 7.2, "#C9CED6", 0.6);
      [[0.8, 0.9, 0.5], [2.0, 0.8, 0.5]].forEach(([x, y, r]) => S.add(x, y, (g) => lngTank(g, x, y, r), "fossil"));
      S.add(1.4, 3.4, (g) => { K.lineGX(g, 3.3, 0.3, 2.6, 0.08, "#626E88", 2); [0.8, 1.9].forEach((x) => { F.box(g, x - 0.1, 3.2, 0, 0.2, 0.2, 0.6, { left: "#9DA6B5", right: "#7A8296", top: "#C9CED6" }); K.seg(g, [x, 3.3, 0.6], [x + 0.2, 3.5, 0.9], "#EE7309", 1.6); K.seg(g, [x + 0.2, 3.5, 0.9], [x + 0.3, 4.0, 0.2], "#EE7309", 1.6); }); }, "fossil");
      S.add(1.4, 1.0, (g) => panels(g, 0.2, 0.3, 2.9, 1.8), "green");
      S.add(1.3, 5.4, (g) => { for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { const x = 0.25 + c * 1.15, y = 4.0 + r * 0.95; F.box(g, x, y, 0, 0.95, 0.6, 0.05, { left: "#9DA6B5", right: "#7A8296", top: C.pv }); } }, "green");
      [[6.6, 0.7], [6.9, 1.8]].forEach(([x, y]) => S.add(x, y, (g) => turbine(g, x, y, 2.8), "green"));
      [[3.1, 0.4, 0.9, 0.9, 3.0, "#E3E6EB"], [5.4, 0.4, 0.9, 0.9, 3.6, "#9FB2C6"]].forEach(([x, y, w, d, h, c]) => S.add(x + w / 2, y + d / 2, (g) => K.tower(g, x, y, w, d, h, c, C.water, "pv", { noShop: true, floor: 0.5 })));
      S.add(4.6, 0.9, (g) => { F.box(g, 4.2, 0.5, 0, 0.8, 0.8, 4.8, { left: "#E3E6EB", right: "#C9CED6", top: "#F1F2F4" }); for (let z = 0.3; z < 4.6; z += 0.4) F.face(g, F.L, { x: 4.2, y: 0.5, z: 0, w: 0.8, d: 0.8, h: 4.8 }, 0.1, z, 0.7, z + 0.2, C.water, { "stroke-width": 0.4 }); F.box(g, 4.3, 0.6, 4.8, 0.6, 0.6, 0.5, { left: "#E3E6EB", right: "#C9CED6", top: "#F1F2F4" }); F.box(g, 4.42, 0.72, 5.3, 0.36, 0.36, 0.4, { left: "#E3E6EB", right: "#C9CED6", top: "#F1F2F4" }); K.seg(g, [4.6, 0.9, 5.7], [4.6, 0.9, 6.4], "#3E4860", 1); });
      [["#F2B134", 3.0], ["#F6A5A5", 3.85], ["#9CC5E8", 4.7], ["#F3E6CC", 5.55], ["#7FC8A9", 6.4]].forEach(([c, x], i) => { S.add(x + 0.4, 2.8, (g) => { const b = F.box(g, x, 2.4, 0, 0.8, 0.8, 1.1, { left: c, right: shade(c), top: i % 2 ? "#C96F4A" : "#9DA6B5" }); F.face(g, F.L, b, 0.08, 0, 0.72, 0.42, "#5B4A42", { "stroke-width": 0.5 }); F.face(g, F.L, b, 0.15, 0.6, 0.35, 0.9, "#FFFFFF", { "stroke-width": 0.4 }); F.face(g, F.L, b, 0.45, 0.6, 0.65, 0.9, "#FFFFFF", { "stroke-width": 0.4 }); }); if (i % 2 === 0) S.add(x + 0.41, 2.81, (g) => F.face(g, F.T, { x, y: 2.4, z: 0, w: 0.8, d: 0.8, h: 1.1 }, 0.1, 0.1, 0.7, 0.7, C.pv, { "stroke-width": 0.5 }), "green"); });
      [[2.9, 3.6, 0.8], [6.8, 6.6, 0.85]].forEach(([x, y, s]) => S.add(x, y, (g) => palm(g, x, y, s)));
      S.lane(4.3, (g) => { K.rect(g, 2.8, 4.2, 7.2, 5.0, "#5B6478", 0.8); const t = el("g", null, g); F.box(t, 0, 4.3, 0.12, 0.8, 0.45, 0.28, { left: "#47B970", right: "#2F8A52", top: "#47B970" }); [0.15, 0.65].forEach((u) => K.wheel(t, u, 4.75, 0.1, 0.09, "y")); [0.05, 0.75].forEach((u) => F.box(t, u, 4.32, 0.4, 0.04, 0.04, 0.38, { left: "#3E4860", right: "#262C3A", top: "#3E4860" })); F.box(t, -0.02, 4.28, 0.78, 0.84, 0.5, 0.06, { left: "#FFCD00", right: shade("#FFCD00"), top: "#FFE680" }); loop(t, 3.0, 6.0, 4, true); });
      S.add(4.2, 5.9, (g) => { F.box(g, 3.8, 5.7, 0.15, 0.7, 0.35, 0.25, { left: "#9C7B5B", right: "#7E6247", top: "#B5967A" }); for (let k = 0; k < 4; k++) K.quad(g, [[3.8 + k * 0.175, 5.65, 0.7], [3.975 + k * 0.175, 5.65, 0.7], [3.975 + k * 0.175, 6.1, 0.6], [3.8 + k * 0.175, 6.1, 0.6]], k % 2 ? "#FFFFFF" : "#C8102E", { "stroke-width": 0.5 }); K.person(g, 4.8, 5.9, { idle: true, top: "#FFCD00" }); K.person(g, 5.1, 5.95, { idle: true, top: "#4AB4D6" }); });
      S.add(5.8, 6.6, (g) => K.tree(g, 5.8, 6.6, 0.8, "dark"));
    },
    af(S) {
      S.add(5.6, 1.0, (g) => K.mountain(g, 5.6, 1.1, 1.0, 1.9, { col: "#B8A88C", snow: 0.7 }));
      S.add(2.4, 1.8, (g) => { const xs = [0.5, 1.8, 3.1, 4.3]; let zs = []; xs.forEach((x) => { zs = K.pole(g, x, 1.8, 1.3, 1); }); K.wires(g, xs, 1.8, zs, [-0.3, 0.3], "#3E4860", 5); });
      [[6.6, 2.6], [6.9, 3.6]].forEach(([x, y]) => S.add(x, y, (g) => turbine(g, x, y, 2.6), "green"));
      S.add(2.6, 0.8, (g) => { F.box(g, 2.0, 0.4, 0, 1.2, 0.8, 0.6, { left: "#E3E6EB", right: "#C9CED6", top: "#F1F2F4" }); F.cyl(g, [3.5, 0.7, 0], "z", 0.25, 0.9, { side: "#D3D8DF", cap: "#B9C1CC" }); const p = P(3.5, 0.7, 1.0); for (let k = 0; k < 3; k++) { const c = el("circle", { cx: p[0], cy: p[1], r: 5, fill: "#FFFFFF" }, g); gsap.fromTo(c, { attr: { cy: p[1], r: 4 }, opacity: 0.95 }, { attr: { cy: p[1] - 30, r: 10 }, opacity: 0, duration: 3, repeat: -1, ease: "none", delay: -k }); } }, "green");
      [[0.4, 4.4, 0.8], [6.4, 6.0, 0.9]].forEach(([x, y, s]) => S.add(x, y, (g) => acacia(g, x, y, s)));
      [[0.9, 2.9, 0.9], [2.0, 2.7, 1], [3.1, 3.0, 0.85]].forEach(([x, y, s]) => S.add(x, y, (g) => hut(g, x, y, s)));
      [[1.5, 3.6], [2.6, 3.6]].forEach(([x, y]) => S.add(x, y, (g) => { F.box(g, x, y, 0, 0.05, 0.05, 0.5, { left: "#3E4860", right: "#262C3A", top: "#3E4860" }); K.quad(g, [[x - 0.25, y - 0.15, 0.5], [x + 0.25, y - 0.15, 0.5], [x + 0.25, y + 0.15, 0.62], [x - 0.25, y + 0.15, 0.62]], C.pv, { "stroke-width": 0.6 }); }, "green"));
      S.add(4.2, 3.0, (g) => { F.box(g, 3.8, 2.8, 0, 0.9, 0.5, 0.45, { left: "#626E88", right: "#3E4860", top: "#7A8296" }); F.box(g, 4.4, 2.9, 0.45, 0.1, 0.1, 0.35, { left: "#3E4860", right: "#262C3A", top: "#262C3A" }); smokeAt(g, 4.45, 2.95, 0.85); }, "fossil");
      S.add(5.2, 3.6, (g) => { panels(g, 3.8, 3.0, 6.2, 4.0); F.box(g, 4.0, 4.2, 0, 0.9, 0.45, 0.45, { left: "#FFFFFF", right: C.w3, top: "#47B970" }); }, "green");
      S.lane(5.0, (g) => { const t = el("g", null, g); K.bike(t, 0, 5.0, "#C8102E", { top: "#4AB4D6", cap: "#262C3A" }); loop(t, 0.6, 6.4, 5, false); });
      S.add(2.4, 6.0, (g) => { K.person(g, 2.4, 6.0, { idle: true, dress: true, top: "#EE7309" }); const q = P(2.4, 6.0, 0); el("ellipse", { cx: q[0], cy: q[1] - 22, rx: 3, ry: 2.4, fill: "#C96F4A" }, g); const c = K.person(g, 2.8, 6.1, { idle: true, top: "#FFCD00" }); c.setAttribute("transform", c.getAttribute("transform") + " scale(0.72)"); });
    }
  };

  // ---------- the hooks called from js/acts.js ----------
  window.ISOJ = {
    parts: { still: (v) => { STILL = !!v; }, slab, FILL, turbine, panels, palm, hut, acacia, gum, roo, dataHall, loop, truck, pvOnHouse, smokeAt },   // for the tile board (js/iso-tiles.js)
    // a region's tableau: same shape as tableau2's result, but fossil and green are lists of groups filled by fill()
    tableau(parent, [x, y], ground, defs) {
      const wrap = el("g", null, parent);
      const g = el("g", { transform: `translate(${x} ${y})` }, wrap);
      const t = { wrap, g, x, y, ground: el("g", null, g), fossil: [], green: [], back: {}, mid: {}, front: {}, iso: true };
      gsap.set(wrap, { scale: 0, svgOrigin: `${x} ${y}` });
      return t;
    },
    fill(name, t) {
      const GC = { "#EBCBA9": "#F0DCC0", "#E8E3C8": "#E8E3C8", "#EFE3B8": "#EFE3B8" };
      const S = slab(t.g, 0, 3, 7.2, 7.2, GC[t.gcol] || "#DCEBD3");
      FILL[name](S);
      const FLAG = { as: [3.0, 3.7] };   // where a region's flag stands, if not at the usual spot (1.1, 5.7)
      if (FLAG[name]) { const [gx, gy] = FLAG[name]; t.fx = 30 * (gx - gy) * KS; t.fy = 3 + 17.32 * (gx + gy - 7.2) * KS; }
      const out = S.flush();
      t.fossil.push(...out.fossil); t.green.push(...out.green);
    },
    // a small iso LNG carrier sailing along the route
    lngShip(g) {
      const s = el("g", { transform: `scale(0.17) translate(${-P(0, 0)[0]} ${-P(0, 0)[1]})`, "data-noink": "" }, g);
      F.box(s, -3, -0.35, -0.2, 6, 0.7, 0.45, { left: "#262C3A", right: "#1E2433", top: "#C9CED6" });
      K.quad(s, [[-3, 0.35, -0.2], [3, 0.35, -0.2], [3, 0.35, -0.05], [-3, 0.35, -0.05]], "#B5302E");
      [-1.8, -0.6, 0.6, 1.8].forEach((x) => { const t = P(x, 0, 0.25); el("path", { d: `M${t[0] - 15} ${t[1]} A15 15 0 0 1 ${t[0] + 15} ${t[1]} Z`, fill: "#F1F2F4", stroke: "#000", "stroke-width": 1 }, s); });
      F.box(s, -2.9, -0.3, 0.25, 0.6, 0.6, 0.6, { left: "#FFFFFF", right: C.w3, top: "#F1F2F4" }); F.box(s, -2.75, -0.1, 0.85, 0.2, 0.2, 0.35, { left: "#EE7309", right: shade("#EE7309"), top: "#262C3A" });
      return s;
    },
    // the small nodes: a 3 × 3 slab with one thing on it
    node(g, kind) {
      const gr = kind === "solar" || kind === "village" || kind === "geo" ? "#EDE6CF" : "#DCEBD3";
      const S = slab(g, 0, 1.5, 3, 3, gr, { T: 0.3 });
      if (kind === "wind") [[0.8, 0.8], [2.2, 1.0], [1.4, 2.2]].forEach(([x, y]) => S.add(x, y, (n) => turbine(n, x, y, 2.6)));
      if (kind === "solar") S.add(1.5, 1.5, (n) => { for (let y = 0.3; y < 2.7; y += 0.8) ISO.panel(n, F, 0.3, y, 2.4, 0.6); });
      if (kind === "dc") { S.add(1.4, 1.2, (n) => dataHall(n, 0.3, 0.5, 2.0, 1.4)); S.add(2.6, 2.4, (n) => K.xfmr(n, 2.2, 2.2)); }
      if (kind === "town") [[0.3, 0.4, "#F3E6CC"], [1.6, 0.6, "#C96F4A"], [0.6, 1.8, "#BFD3B4"]].forEach(([x, y, c]) => { S.add(x + 0.5, y + 0.4, (n) => { const b = ISO.house(n, F, x, y, 1.1, 0.8, 0.55, 0.4, "#857572"); F.face(n, F.L, b, 0.05, 0, 1.05, 0.55, c, { "stroke-width": 0.7 }); pvOnHouse(n, x, y, 1.1, 0.8, 0.55); }); });
      if (kind === "town") S.add(2.4, 2.4, (n) => K.tree(n, 2.4, 2.4, 0.8));
      if (kind === "store") { [[0.3, 0.4], [0.3, 1.2], [0.3, 2.0]].forEach(([x, y]) => S.add(x + 0.7, y + 0.3, (n) => { const b = F.box(n, x, y, 0, 1.4, 0.55, 0.5, { left: "#FFFFFF", right: C.w3, top: "#47B970" }); for (let u = 0.2; u < 1.3; u += 0.3) F.face(n, F.L, b, u, 0.1, u + 0.12, 0.4, "#C9CED6", { "stroke-width": 0.4 }); })); S.add(2.4, 1.0, (n) => turbine(n, 2.4, 1.0, 2.4)); S.add(2.3, 2.3, (n) => K.xfmr(n, 1.9, 2.0)); }
      if (kind === "village") { S.add(0.9, 1.0, (n) => hut(n, 0.9, 1.0, 1)); S.add(0.8, 2.2, (n) => hut(n, 0.8, 2.2, 0.85)); S.add(2.1, 1.6, (n) => { ISO.panel(n, F, 1.6, 0.6, 1.2, 0.6); ISO.panel(n, F, 1.6, 1.5, 1.2, 0.6); }); }
      if (kind === "geo") S.add(1.4, 1.4, (n) => { F.box(n, 0.4, 0.8, 0, 1.4, 1.0, 0.6, { left: "#E3E6EB", right: "#C9CED6", top: "#F1F2F4" }); F.cyl(n, [2.2, 1.2, 0], "z", 0.25, 0.9, { side: "#D3D8DF", cap: "#B9C1CC" }); K.lineGX(n, 2.3, 0.3, 2.8, 0.15, "#626E88", 2); const p = P(2.2, 1.2, 1.0); for (let q = 0; q < 2; q++) { const c = el("circle", { cx: p[0], cy: p[1], r: 4, fill: "#FFFFFF", stroke: "#9DA6B5", "stroke-width": 0.8 }, n); gsap.fromTo(c, { attr: { cy: p[1], r: 4 }, opacity: 0.9 }, { attr: { cy: p[1] - 26, r: 9 }, opacity: 0, duration: 2.6, repeat: -1, ease: "none", delay: -q * 1.3 }); } });
      S.flush();
    }
  };
})();
