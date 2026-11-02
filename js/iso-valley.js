/* index2.html, section B: one valley by the sea through the ages (scene "valley", used with data-scene="valley").
   A clean re-layout of js/iso-journey.js for index2 only (index.html keeps "journey").
   Layout (gx runs to the lower right, gy to the lower left; the viewer looks from the front corner):
     gy 0-4.8   the back: a harbour (gx 21-30) with a quay; fields, later a city block on the left and a park in the middle
     gy 5-8.8   town band A: a factory, the square, the station, a second factory, a warehouse
     gy 9.7-11  the railway, with the telephone line along it
     gy 11.4-17.6 town band B: two rows of terraces with a street between; modern blocks and a green on the right
     gy 17.85   the electricity distribution line (poles, the grid beat)
     gy 18.1-21.8 the canal, later the highway
     gy 22.2-24.4 roadside businesses
     gy 24.6-30 the front: the farm (left), homes (middle), the grid's yard (right); a pylon line along the front edge
   Beats (scene time; the page runs one card later, data-remap "0:0 1:0 18.1:17.1"): b(k) = k - 0.45
     1 canals, 2 railways and the town, 3 telephone lines, 4 highways and the fuel terminal, 5 internet cables and modern
     buildings, 6 new ways of living, 7 the grid, 8 the choice (hold); 10+ Act 2 (E1-E3); 13+ electrostates (GA1-GA5). */
(function () {
  if (!window.CLEAN || !window.ISOSCENES || !window.ISOSTAGE) return;
  const { el } = SVG;
  const { C } = ISO;
  const { K, sky } = ISOSCENES;
  const { stage, drawOn, along, convoy, field, cottage, live } = ISOSTAGE;
  const hold = (tl, n) => tl.to({}, { duration: 0.001 }, n + 0.1);
  const P = (x, y, z) => ISO.P(x, y, z || 0);
  const F = ISO.frame([0, 0], 1);
  const shade = (h) => ISO.mixHex(h, "#000000", 0.16), lite = (h) => ISO.mixHex(h, "#FFFFFF", 0.35);
  const bx = (g, x, y, z, w, d, h, col, top) => F.box(g, x, y, z, w, d, h, { left: col, right: shade(col), top: top || lite(col) });
  const b = (k) => k - 0.45;

  // buildings rise out of the ground (no spin, no overshoot); things sink back into it
  // things settle into place: each fades in while dropping the last few pixels onto its spot (no squash, no spin, no
  // overshoot); things that go fade out while lifting slightly away
  const rise = (tl, gs, t, o) => { o = o || {}; (gs || []).forEach((g, i) => {
    gsap.set(g, { opacity: 0, y: -16 });
    tl.to(g, { opacity: 1, y: 0, duration: o.dur || 0.3, ease: "power2.out" }, t + i * (o.stagger == null ? 0.03 : o.stagger)); }); };
  const sink = (tl, gs, t, o) => { o = o || {}; (gs || []).forEach((g, i) => tl.to(g, { opacity: 0, y: -10, duration: o.dur || 0.22, ease: "power1.in" }, t + i * (o.stagger == null ? 0.015 : o.stagger))); };
  const fadeIn = (tl, n, t, d) => { gsap.set(n, { opacity: 0 }); tl.to(n, { opacity: 1, duration: d || 0.25 }, t); };

  // ---------- small parts drawn for this scene ----------
  // a cow with a body, legs, a head and patches (dir 1: facing +gx)
  function cow(g, x, y, dir, col) {
    col = col || "#F7F5EF"; const s = dir < 0 ? -1 : 1, x0 = x - 0.45;
    [[0.08, 0.04], [0.08, 0.28], [0.8, 0.04], [0.8, 0.28]].forEach(([u, v]) => bx(g, x0 + u, y - 0.17 + v, 0, 0.07, 0.06, 0.28, "#3E3632"));
    const body = bx(g, x0, y - 0.17, 0.26, 0.9, 0.36, 0.34, col, "#FFFFFF");
    F.face(g, F.L, body, 0.18, 0.06, 0.42, 0.28, "#3E3632", { "stroke-width": 0.5 }); F.face(g, F.L, body, 0.58, 0.14, 0.74, 0.3, "#3E3632", { "stroke-width": 0.5 });
    K.quad(g, [[x0 + 0.5, y - 0.17, 0.6], [x0 + 0.72, y - 0.17, 0.6], [x0 + 0.72, y + 0.05, 0.6], [x0 + 0.5, y + 0.05, 0.6]], "#3E3632", { "stroke-width": 0.4 });
    const hx = s > 0 ? x0 + 0.88 : x0 - 0.26;
    const head = bx(g, hx, y - 0.11, 0.42, 0.28, 0.24, 0.26, col, "#FFFFFF");
    F.face(g, s > 0 ? F.R : F.L, head, 0.02, 0.0, s > 0 ? 0.22 : 0.26, 0.1, "#E8B4A8", { "stroke-width": 0.4 });
    [[0.04], [0.2]].forEach(([v]) => K.seg(g, [hx + 0.14, y - 0.11 + v, 0.68], [hx + 0.14, y - 0.11 + v + (v < 0.1 ? -0.08 : 0.08), 0.76], "#E3D6C0", 1.4));
  }
  // a sheep: a woolly body, a dark face and legs
  function sheep(g, x, y, dir) {
    const s = dir < 0 ? -1 : 1, x0 = x - 0.25;
    [[0.06, 0.04], [0.06, 0.2], [0.4, 0.04], [0.4, 0.2]].forEach(([u, v]) => bx(g, x0 + u, y - 0.12 + v, 0, 0.05, 0.05, 0.18, "#262C3A"));
    bx(g, x0, y - 0.12, 0.16, 0.52, 0.3, 0.26, "#F7F5EF", "#FFFFFF");
    bx(g, s > 0 ? x0 + 0.48 : x0 - 0.12, y - 0.07, 0.26, 0.16, 0.2, 0.18, "#3E4860", "#262C3A");
  }
  // a steam train: a locomotive with a boiler, chimney, dome, cab and driving wheels, a tender, and n carriages (front at gx 0)
  function steamTrain(y, n) {
    const W = (g, x, r) => K.wheel(g, x, y + 0.58, r + 0.02, r, "y");
    const parts = [[-1.1, (g) => {
      bx(g, -2.2, y + 0.02, 0.22, 2.25, 0.56, 0.1, "#262C3A");
      const cab = bx(g, -2.25, y + 0.02, 0.32, 0.7, 0.56, 0.74, "#2F6F4E", "#3E4860"); F.face(g, F.L, cab, 0.12, 0.34, 0.5, 0.62, "#FFE6A3", { "stroke-width": 0.5 });
      bx(g, -2.32, y - 0.03, 1.06, 0.84, 0.66, 0.06, "#262C3A");
      F.cyl(g, [-1.55, y + 0.29, 0.62], "x", 0.28, 1.5, { side: "#2F6F4E", cap: "#262C3A" });
      [[-1.2], [-0.75]].forEach(([u]) => K.seg(g, [u, y + 0.57, 0.38], [u, y + 0.57, 0.88], "#C9A15A", 1.2));   // boiler bands
      F.cyl(g, [-0.95, y + 0.29, 0.86], "z", 0.11, 0.14, { side: "#C9A15A", cap: "#E3C27A" });
      F.cyl(g, [-0.3, y + 0.29, 0.86], "z", 0.08, 0.34, { side: "#262C3A", cap: "#1E2433" });
      bx(g, -0.06, y + 0.02, 0.26, 0.08, 0.56, 0.14, "#B5302E");
      [-1.75, -1.2, -0.65].forEach((u) => W(g, u, 0.22)); W(g, -0.18, 0.13);
      K.seg(g, [-1.75, y + 0.6, 0.24], [-0.65, y + 0.6, 0.24], "#8F8784", 1.6);   // coupling rod
      const f = P(-0.3, y + 0.29, 1.25); K.smoke(g, f[0], f[1], true); }],
    [-2.95, (g) => { const t = bx(g, -3.55, y + 0.04, 0.24, 1.2, 0.52, 0.52, "#2F6F4E", "#262C3A"); F.face(g, F.L, t, 0.1, 0.28, 1.1, 0.34, "#C9A15A", { "stroke-width": 0.4 }); [-3.3, -2.65].forEach((u) => W(g, u, 0.14)); }]];
    for (let k = 0; k < n; k++) { const x0 = -3.75 - (k + 1) * 2.15;
      parts.push([x0 + 1.0, (g) => { const c = bx(g, x0, y + 0.02, 0.26, 2.0, 0.56, 0.6, "#8C3A2E", "#3E4860");
        for (let u = 0.18; u < 1.85; u += 0.34) F.face(g, F.L, c, u, 0.3, u + 0.22, 0.5, "#F3E2C6", { "stroke-width": 0.4 });
        F.face(g, F.L, c, 0.02, 0.1, 1.98, 0.16, "#C9A15A", { "stroke-width": 0.3 });
        K.quad(g, [[x0 - 0.04, y + 0.0, 0.86], [x0 + 2.04, y + 0.0, 0.86], [x0 + 2.04, y + 0.29, 0.94], [x0 - 0.04, y + 0.29, 0.94]], "#3E4860", { "stroke-width": 0.6 });
        K.quad(g, [[x0 - 0.04, y + 0.29, 0.94], [x0 + 2.04, y + 0.29, 0.94], [x0 + 2.04, y + 0.6, 0.86], [x0 - 0.04, y + 0.6, 0.86]], "#5B6478", { "stroke-width": 0.6 });
        [0.3, 0.56, 1.44, 1.7].forEach((u) => W(g, x0 + u, 0.12)); }]); }
    return parts;
  }
  // a wooden pole; its cross-arm runs across the line (axis: the direction the line runs)
  function pole(g, x, y, h, axis, power) {
    K.quad(g, [[x - 0.04, y, 0], [x + 0.04, y, 0], [x + 0.04, y, h], [x - 0.04, y, h]], power ? "#7E6247" : "#9C7B5B", { "stroke-width": 0.7 });
    const z = h - 0.12, a = axis === "x" ? [[x, y - 0.5, z], [x, y + 0.5, z]] : [[x - 0.5, y, z], [x + 0.5, y, z]];
    K.seg(g, a[0], a[1], "#6D5A4A", 2.2);
    if (power) { [-0.42, 0, 0.42].forEach((o) => { const q = axis === "x" ? P(x, y + o, z) : P(x + o, y, z); el("rect", { x: q[0] - 1.6, y: q[1] - 5, width: 3.2, height: 5, fill: "#9AA3B5", stroke: "#262C3A", "stroke-width": 0.6 }, g); }); }
    return z;
  }
  // wires between poles at points pts [[x,y],...] at height z; offsets across the line
  function wires(g, pts, z, axis, offs, col, lift) { lift = lift == null ? 5 : lift;   // lift: the insulators' height in px (0 on telephone poles)
    let d = ""; offs.forEach((o) => { for (let i = 1; i < pts.length; i++) {
      const A = pts[i - 1], B = pts[i], a = axis === "x" ? P(A[0], A[1] + o, z) : P(A[0] + o, A[1], z), c = axis === "x" ? P(B[0], B[1] + o, z) : P(B[0] + o, B[1], z);
      d += `M${a[0].toFixed(1)} ${(a[1] - lift).toFixed(1)} Q${((a[0] + c[0]) / 2).toFixed(1)} ${((a[1] + c[1]) / 2 + 9 - lift).toFixed(1)} ${c[0].toFixed(1)} ${(c[1] - lift).toFixed(1)} `; } });
    return el("path", { d, stroke: col || "#3E4860", "stroke-width": 0.8, fill: "none" }, g);
  }
  // a lattice mast with two dishes (no signal rings)
  function mast(g, x, y, h) {
    const b0 = P(x, y, 0), t = P(x, y, h), H = b0[1] - t[1];
    let d = `M${b0[0] - 8} ${b0[1]} L${t[0] - 1.2} ${t[1]} M${b0[0] + 8} ${b0[1]} L${t[0] + 1.2} ${t[1]}`;
    [0.2, 0.4, 0.6, 0.8].forEach((u) => { const y0 = b0[1] - H * u, w0 = 8 - 6.8 * u, y1 = b0[1] - H * (u + 0.2), w1 = 8 - 6.8 * (u + 0.2); d += ` M${b0[0] - w0} ${y0} L${b0[0] + w1} ${y1} M${b0[0] + w0} ${y0} L${b0[0] - w1} ${y1}`; });
    el("path", { d, stroke: "#626E88", "stroke-width": 1.4, fill: "none" }, g);
    [-5, 5].forEach((dx) => el("rect", { x: t[0] + dx - 2, y: t[1] + 5, width: 4, height: 10, fill: "#F1F2F4", stroke: "#192238", "stroke-width": 0.8 }, g));
    el("circle", { cx: t[0], cy: t[1] - 2, r: 2.4, fill: "#E04B00" }, g);
  }
  const terraceSolar = (g, x, y, n, h, k0, step) => { const z = (yy) => h + 0.45 - 0.75 * (yy - y - 0.6) + 0.03;
    for (let k = k0; k < n; k += step) { const x0 = x + k * 0.95, y0 = y + 0.72, y1 = y + 1.1;
      K.pvQuad(g, [x0 + 0.14, y1, z(y1)], [x0 + 0.81, y1, z(y1)], [x0 + 0.81, y0, z(y0)], [x0 + 0.14, y0, z(y0)], 3, 2); } };
  const boatSmall = (g, x, y, col) => { bx(g, x, y, -0.05, 1.1, 0.42, 0.22, col, "#C9A988"); K.seg(g, [x + 0.55, y + 0.21, 0.2], [x + 0.55, y + 0.21, 1.1], "#5B4A42", 1.2);
    K.quad(g, [[x + 0.55, y + 0.21, 1.05], [x + 0.55, y + 0.21, 0.3], [x + 1.05, y + 0.21, 0.32]], "#F3EDE0", { "stroke-width": 0.6 }); };

  function valley(svg) {
    const tl = gsap.timeline({ paused: true });
    live(svg);
    const skies = [["iso-sky-v1", [["0", "#FBF4E2"], ["0.7", "#EFE6CF"], ["1", "#E2DAC4"]]], ["iso-sky-v2", [["0", "#F2F8FD"], ["0.7", "#DCEBF7"], ["1", "#CFE2F2"]]], ["iso-sky-v3", [["0", "#EEF4FA"], ["0.7", "#DCE8F3"], ["1", "#CCDDEE"]]]]
      .map(([id, st], i) => { const r = sky(svg, id + (svg.id || ""), st); if (i) r.setAttribute("opacity", 0); return r; });
    const N = 30, M = 30, S = stage(svg, { N, M, s: 0.64, tx: 470, ty: 160, ground: "#DCEBC9" }), G = S.ground;
    const RY = 9.8, HY = 18.4, HX = 21.0, QY = 3.0;   // railway, highway, the harbour's inner edge (gx) and its quay (gy)
    // everything stands at 85% of its drawn size, scaled about its own spot (or about c), for breathing room; lines,
    // poles, pylons and the substation (whose spans meet at fixed heights) are drawn at full size (c === false)
    const SC = 0.85;
    // the town's buildings are toned down so they don't pull the eye (row houses, brick and timber buildings, glass towers)
    const DULL = new Set(["terr", "mills", "city", "glass", "pops", "laid", "ga5", "chim"]), DULLF = "saturate(0.45) brightness(1.04)";
    const add = (x, y, set, fn, c) => S.add(x, y, c === false ? fn : (g) => { const q = P(c ? c[0] : x, c ? c[1] : y);
      const w = el("g", { transform: `translate(${q[0].toFixed(1)} ${q[1].toFixed(1)}) scale(${SC}) translate(${(-q[0]).toFixed(1)} ${(-q[1]).toFixed(1)})` }, g);
      if (DULL.has(set)) w.style.filter = DULLF;
      fn(w); }, set);

    // ---------- the ground ----------
    const farm = el("g", null, G), town = el("g", { opacity: 0 }, G), yardField = el("g", null, G);
    field(farm, 0.4, 0.4, 9.8, 4.4, "#E8E0B8", "#D6CB98"); field(farm, 10.4, 0.4, 20.0, 4.4, "#CFE3B8");
    field(farm, 0.4, 5.2, 12.0, 8.6, "#D7E8C0"); field(farm, 12.6, 5.2, 20.0, 8.6, "#E8E0B8", "#D6CB98"); field(farm, 21.4, 5.2, 29.6, 8.6, "#CFE3B8");
    field(farm, 0.4, 11.6, 9.6, 17.2, "#CFE3B8"); field(farm, 10.2, 11.6, 29.6, 17.2, "#E8E0B8", "#D6CB98");
    K.rect(farm, 0, HY + 0.9, N, HY + 1.9, "#E3D6B0", 0.8);   // the country lane (the canal, then the highway, take its place)
    field(yardField, 19.8, 22.6, 29.6, 29.6, "#E8E0B8", "#D6CB98");   // ploughed until the grid's yard comes
    field(G, 0.4, 24.2, 8.6, 29.6, "#E8E0B8", "#D6CB98"); field(G, 9.2, 24.0, 18.8, 27.2, "#CFE3B8");
    // the harbour: water at the back right with a sandy shore; a stone quay later
    K.rect(G, HX - 0.4, 0, N, QY + 0.4, "#EFE3BC", 0.6); K.rect(G, HX, 0, N, QY, "#8FC6E4", 1);
    for (let x = HX + 1; x < N; x += 2.2) K.lineGX(G, 1.2 + (x % 1.4), x, x + 0.8, 0, "#B9DDF0", 1.2);   // ripples
    const quay = el("g", { opacity: 0 }, G); K.rect(quay, HX - 0.4, QY - 0.05, N, 4.8, "#C9C0AC", 0.8); K.lineGX(quay, QY, HX, N, 0, "#6E8FA8", 1.4);
    // the town's ground: paved bands right to the edges, a street between the terraces, lawns on the right
    { const R = (a, c, d, e, col) => K.rect(town, a, c, d, e, col, 0.8);
      R(0, 5.0, N, 8.8, "#D8D2C4"); R(0, 0.2, 9.4, 4.7, "#D8D2C4");   // the city block has its own paved plot R(0, 11.4, N, 17.6, "#E3DDD0"); R(0, 14.0, N, 15.1, "#C9C0AC");
      R(19.3, 12.4, 25.0, 14.8, "#A9CF95"); R(10.2, 0.4, 20.4, 4.6, "#BFDDA9"); }
    // the canal, under the lane
    const canalSegs = [], canalG = el("g", null, G);
    { const C0 = HY + 0.85, C1 = HY + 2.0;
      for (let x = 0; x < N; x += 1) { const g = el("g", { opacity: 0 }, canalG); K.rect(g, x, C0, x + 1, C1, "#C9BFA6", 0); K.rect(g, x, C0 + 0.18, x + 1, C1 - 0.18, "#8FC6E4", 0);
        K.lineGX(g, C0 + 0.18, x, x + 1, 0, "#6E8FA8", 1); K.lineGX(g, C1 - 0.18, x, x + 1, 0, "#6E8FA8", 1);
        if (x === 8 || x === 9) { const a = P(x + 0.5, C0 + 0.18), c = P(x + 0.5, C1 - 0.18); el("path", { d: `M${a[0]} ${a[1]} L${c[0]} ${c[1]}`, stroke: "#5B4A42", "stroke-width": 2.4 }, g); }
        canalSegs.push(g); } }
    // the railway
    const bed = el("g", { opacity: 0 }, G); K.rect(bed, 0, RY - 0.1, N, RY + 1.2, "#CFC8BE", 1);
    const slp = el("g", null, G), sleepers = [];
    for (let x = 0.2; x < N; x += 0.42) { const a = P(x, RY + 0.12), c = P(x, RY + 0.95); sleepers.push(el("path", { d: `M${a[0]} ${a[1]} L${c[0]} ${c[1]}`, stroke: "#8F7A6E", "stroke-width": 1.6, opacity: 0 }, slp)); }
    const rails = [RY + 0.2, RY + 0.8].map((y) => K.lineGX(G, y, 0, N, 0, "#3E4860", 1.5));
    const platform = el("g", { opacity: 0 }, G); K.rect(platform, 12.4, 8.8, 17.4, RY - 0.15, "#C9C0AC", 0.8);
    // the highway
    const segs = [];
    for (let x = 0; x < N; x += 1) { const g = el("g", { opacity: 0 }, G); K.rect(g, x, HY - 0.3, x + 1, HY + 3.4, "#E9EBEE", 0); K.rect(g, x, HY, x + 1, HY + 1.3, "#5B6478", 0); K.rect(g, x, HY + 1.8, x + 1, HY + 3.1, "#5B6478", 0); K.rect(g, x, HY + 1.3, x + 1, HY + 1.8, "#A9D69B", 0);
      [HY + 0.65, HY + 2.45].forEach((y) => K.lineGX(g, y, x + 0.15, x + 0.65, 0, "#FFFFFF", 1.5)); segs.push(g); }
    const edges = el("g", { opacity: 0 }, G); [HY, HY + 1.3, HY + 1.8, HY + 3.1].forEach((y) => K.lineGX(edges, y, 0, N, 0, "#3E4860", 1));
    // internet cables (k=5): a subsea cable across the harbour to a landing hut, then fibre along the town's streets
    const fibre = [];
    { const g = el("g", null, G); const pts = [[27.2, 0.1], [27.2, 3.5]]; const sea = pts.map((q) => P(q[0], q[1], 0));
      fibre.push(el("path", { d: `M${sea[0][0]} ${sea[0][1]} L${sea[1][0]} ${sea[1][1]}`, stroke: "#3E4860", "stroke-width": 1.8, "stroke-dasharray": "5 3", fill: "none" }, g));
    }

    // ---------- the quiet valley (B1-B2): fields, a windmill, a farm, a fishing jetty ----------
    [[3.2, 12.2, "#8F7A6E"], [14.6, 12.0, "#C9A15A"]].forEach(([x, y, r]) => add(x + 1, y + 0.7, "rural", (g) => cottage(g, x, y, r)));
    add(15.0, 2.4, "rural", (g) => K.mill(g, 15.0, 2.4));
    [[3.0, 2.4], [6.8, 1.4], [18.2, 1.8]].forEach(([x, y]) => add(x, y, "rural", (g) => K.hay(g, x, y)));
    [[6.6, 6.8], [15.6, 6.2, "dark"], [24.2, 7.4, "pine"], [8.0, 15.8], [22.0, 13.4, "dark"], [26.4, 6.2, "round"]].forEach(([x, y, k]) => add(x, y, "rural", (g) => K.tree(g, x, y, 1, k)));
    [[11.6, 6.4, 1], [13.0, 7.2, -1], [11.2, 7.6, 1]].forEach(([x, y, d]) => add(x, y, "rural", (g) => sheep(g, x, y, d)));
    [[24.2, 14.4, 1], [26.6, 15.6, -1]].forEach(([x, y, d]) => add(x, y, "rural", (g) => cow(g, x, y, d)));
    // the shore: a jetty and two fishing boats, trees along the sand
    add(28.6, 2.2, null, (g) => { K.rect(g, 28.3, 1.2, 28.9, QY + 0.2, "#B7956E", 0.8); for (let yy = 1.4; yy < QY; yy += 0.4) { const a = P(28.3, yy, 0.02), c = P(28.9, yy, 0.02); el("path", { d: `M${a[0]} ${a[1]} L${c[0]} ${c[1]}`, stroke: "#8F7A6E", "stroke-width": 0.6 }, g); } }, false);
    [[26.6, 1.0, "#4AB4D6"], [29.0, 0.4, "#E0785A"]].forEach(([x, y, c]) => add(x + 0.5, y + 0.2, "boats", (g) => boatSmall(g, x, y, c)));
    [[20.2, 0.6, "pine"], [20.3, 2.2], [20.2, 4.2, "round"]].forEach(([x, y, k]) => add(x, y, null, (g) => K.tree(g, x, y, 0.9, k)));
    // the farm at the front, through every age
    add(3.2, 25.1, "farmB", (g) => cottage(g, 2.2, 24.4, "#B77464"));
    add(6.4, 24.9, "farmB", (g) => { const bn = bx(g, 5.4, 24.4, 0, 2.0, 1.2, 1.0, "#B5302E", "#8C3A2E"); F.face(g, F.L, bn, 0.7, 0, 1.3, 0.75, "#F3EDE0", { "stroke-width": 0.5 }); });
    [[5.0, 26.6, 1], [6.4, 26.9, -1]].forEach(([x, y, d]) => add(x, y, null, (g) => cow(g, x, y, d)));
    [[8.2, 25.0], [9.4, 28.2, "round"], [19.0, 28.6, "pine"], [4.4, 29.0, "round"]].forEach(([x, y, k]) => add(x, y, null, (g) => K.tree(g, x, y, 1, k)));

    // ---------- railways (k=2): the station on its platform, a signal; the town rises along the line ----------
    add(14.6, 7.5, "laid", (g) => { const s = bx(g, 13.0, 6.6, 0, 3.2, 1.4, 1.4, "#C9A988", "#E3D6C0"); for (let u = 0.3; u < 3; u += 0.55) F.face(g, F.L, s, u, 0.4, u + 0.3, 1.0, "#FFE6A3", { "stroke-width": 0.5 });
      K.quad(g, [[12.9, 6.5, 1.4], [16.3, 6.5, 1.4], [16.3, 7.3, 2.0], [12.9, 7.3, 2.0]], "#6E6A72", { "stroke-width": 0.8 }); K.quad(g, [[12.9, 8.1, 1.4], [16.3, 8.1, 1.4], [16.3, 7.3, 2.0], [12.9, 7.3, 2.0]], "#8F8784", { "stroke-width": 0.8 });
      [12.9, 14.9, 16.9].forEach((u) => K.seg(g, [u, 9.3, 0], [u, 9.3, 1.1], "#3E4860", 1.4));   // the platform canopy
      K.quad(g, [[12.7, 8.4, 1.15], [17.1, 8.4, 1.15], [17.1, 9.5, 1.0], [12.7, 9.5, 1.0]], "#5B6478", { "stroke-width": 0.7 }); });
    add(10.6, 9.45, "laid", (g) => { K.quad(g, [[10.6, 9.45, 0], [10.66, 9.45, 0], [10.66, 9.45, 2.0], [10.6, 9.45, 2.0]], "#3E4860", { "stroke-width": 0.5 }); K.quad(g, [[10.66, 9.45, 1.75], [11.2, 9.45, 1.6], [11.2, 9.45, 1.72], [10.66, 9.45, 1.88]], "#B5302E", { "stroke-width": 0.6 }); });
    // town band A
    add(2.5, 6.7, "mills", (g) => K.factory(g, 0.8, 5.6, 3.4, 2.2, 2.2, "#B7795E"));
    add(19.9, 6.8, "mills", (g) => K.factory(g, 18.2, 5.6, 3.4, 2.4, 2.4, "#A9876A"));
    [[4.8, 5.8, 4.8], [22.2, 5.8, 5.2]].forEach(([x, y, h]) => add(x, y, "chim", (g) => K.chimney(g, x, y, h)));
    add(25.3, 7.2, "mills", (g) => { const w = bx(g, 23.4, 6.4, 0, 3.8, 1.6, 1.6, "#B7795E", "#C9A988"); for (let u = 0.3; u < 3.6; u += 0.6) F.face(g, F.L, w, u, 0.4, u + 0.3, 0.9, "#FFE6A3", { "stroke-width": 0.5 }); });
    // the brick city, grouped at the back on the left
    [[0.7, 3.4], [2.9, 4.6], [5.1, 3.8], [7.3, 5.0]].forEach(([x, h], k) => add(x + 0.9, 1.1, "city", (g) => K.tower(g, x, 0.4, 1.8, 1.4, h, ["#C9B8A8", "#BFAE9E", "#D3C4B6"][k % 3], "#E9DFC9", "none", { punched: true, noShop: true, floor: 0.8 })));
    // the terraces, two rows with a street between (row 1 gy 11.8, row 2 gy 14.8)
    const TER = [[0.6, 12.6, 10, "#B7795E"], [11.0, 12.6, 8, "#C9A988"], [0.6, 15.5, 9, "#A9876A"], [9.9, 15.5, 9, "#B7795E"]];
    TER.forEach(([x, y, n, c]) => add(x + n * 0.47, y + 0.6, "terr", (g) => K.terrace(g, x, y, n, 1.4, c)));
    // street trees and green gaps (they come with the town)
    [[10.55, 13.2], [9.55, 16.1], [18.9, 13.2, "round"], [18.9, 16.1, "round"], [2.6, 17.3], [7.4, 17.3, "round"], [12.2, 17.3], [16.8, 17.3, "round"], [5.8, 8.5, "round"], [11.6, 8.5], [17.8, 8.5, "round"], [22.8, 8.5], [28.4, 8.4, "round"],
      [24.9, 16.9, "round"], [29.3, 16.9], [10.0, 4.2], [20.0, 4.4, "dark"], [19.4, 1.2, "round"], [19.5, 3.0]].forEach(([x, y, k]) => add(x, y, "trees", (g) => K.tree(g, x, y, 0.9, k)));

    // ---------- telephone lines (k=3): poles and wires along the railway; masts ----------
    const telG = []; { const xs = [0.8, 6.48, 12.16, 17.84, 23.52, 29.2], y = RY - 0.45;
      add(15, y, "tel", (g) => { let z; xs.forEach((x) => { z = pole(g, x, y, 2.2, "x"); }); wires(g, xs.map((x) => [x, y]), z, "x", [-0.42, -0.14, 0.14, 0.42], null, 0); }, false); }
    [[9.85, 4.9, 3.8], [0.9, 25.4, 3.2]].forEach(([x, y, h]) => add(x, y, "masts", (g) => mast(g, x, y, h)));

    // ---------- highways (k=4): roadside businesses, homes with cars; the fuel import terminal at the harbour ----------
    add(4.1, 23, "pops", (g) => { [[3.0, 22.3], [5.0, 22.3], [3.0, 23.5], [5.0, 23.5]].forEach(([x, y]) => bx(g, x, y, 0, 0.12, 0.12, 1.1, "#D8DBE6")); K.quad(g, [[2.8, 22.1, 1.1], [5.4, 22.1, 1.1], [5.4, 23.9, 1.1], [2.8, 23.9, 1.1]], "#E0785A");
      [[3.6, 22.9], [4.4, 22.9]].forEach(([x, y]) => bx(g, x, y, 0, 0.3, 0.3, 0.7, "#E0785A", "#F1F2F4")); });
    add(9.8, 22.7, "pops", (g) => { const d = bx(g, 8.4, 22.1, 0, 2.8, 1.3, 1.0, "#F1F2F4", "#E0785A"); F.face(g, F.L, d, 0.2, 0.3, 2.6, 0.75, "#9ED9CF", { "stroke-width": 0.6 }); F.face(g, F.L, d, 0.1, 0.8, 2.7, 0.95, "#E0785A", { "stroke-width": 0.5 }); });
    add(16.2, 22.8, "pops", (g) => { const m = bx(g, 14.2, 22.1, 0, 4.0, 1.3, 0.95, "#F3E2C6", "#E8A98D"); for (let u = 0.3; u < 3.8; u += 0.75) { F.face(g, F.L, m, u, 0, u + 0.3, 0.62, "#4AB4D6", { "stroke-width": 0.5 }); F.face(g, F.L, m, u + 0.4, 0.3, u + 0.65, 0.58, "#FFE6A3", { "stroke-width": 0.5 }); } });
    const HOMES = [[9.6, 24.3, "#6E6A72", "#FFCD00"], [13.1, 24.5, "#B77464", "#A6D84A"], [16.6, 24.3, "#8F7A6E", "#4AB4D6"]];
    HOMES.forEach(([x, y, r, car]) => add(x + 1.1, y + 0.8, "pops", (g) => { ISO.house(g, F, x, y, 2.0, 1.5, 0.85, 0.65, r); K.oldCar(g, x + 0.3, y + 1.8, car); }));
    let shipG = null;
    add(24.4, 1.5, "ship", (g) => { shipG = g;   // an LNG carrier: a dark hull with a red waterline, four spherical tanks under domes, the bridge at the stern
      const h = bx(g, 21.2, 0.95, -0.1, 6.4, 1.1, 0.62, "#2F3A4E", "#C9CED6"); F.face(g, F.L, h, 0, 0, 6.4, 0.14, "#B5302E", { "stroke-width": 0.5 });
      K.quad(g, [[27.6, 0.95, 0.52], [28.2, 1.5, 0.52], [27.6, 2.05, 0.52]], "#C9CED6", { "stroke-width": 0.7 }); K.quad(g, [[27.6, 2.05, -0.1], [28.2, 1.5, -0.1], [28.2, 1.5, 0.52], [27.6, 2.05, 0.52]], "#262C3A", { "stroke-width": 0.7 });
      bx(g, 21.4, 1.05, 0.52, 1.0, 0.9, 1.0, "#F1F2F4", "#FFFFFF"); bx(g, 21.6, 1.3, 1.52, 0.3, 0.3, 0.4, "#B5302E", "#3E4860");
      [22.95, 24.15, 25.35, 26.55].forEach((x) => { const c = P(x, 1.5, 0.5), r = 23;
        el("path", { d: `M${c[0] - r} ${c[1]} A${r} ${r * 1.02} 0 0 1 ${c[0] + r} ${c[1]} Z`, fill: "#F3F4F6", stroke: "#000", "stroke-width": 0.9 }, g);
        el("path", { d: `M${c[0] - r} ${c[1]} Q${c[0]} ${c[1] + 7} ${c[0] + r} ${c[1]}`, fill: "#D8DBE6", stroke: "#000", "stroke-width": 0.7 }, g);
        el("path", { d: `M${c[0] - r * 0.55} ${c[1] - r * 0.55} A${r * 0.8} ${r * 0.8} 0 0 1 ${c[0] + r * 0.1} ${c[1] - r * 0.85}`, fill: "none", stroke: "#FFFFFF", "stroke-width": 1.6 }, g); }); });
    [[22.6, 4.0], [24.2, 4.0], [25.8, 4.0]].forEach(([x, y]) => add(x, y, "tanks", (g) => F.cyl(g, [x, y, 0], "z", 0.62, 0.95, { side: "#E9EBEE", cap: "#C9CED6" })));
    add(24.2, 3.3, "tanks", (g) => K.lineGX(g, 3.3, 21.6, 26.4, 0.12, "#626E88", 2), false);

    // ---------- internet cables (k=5): a landing hut; modern blocks; people with phones ----------
    add(27.2, 3.9, "net", (g) => bx(g, 26.8, 3.5, 0, 0.8, 0.8, 0.6, "#F1F2F4", "#626E88"));
    // a woodland beside the substation in the middle row (no buildings under the line)
    [[19.7, 12.8, 1.0, "dark"], [20.6, 13.7, 0.9], [21.3, 12.7, 1.0, "pine"], [22.1, 13.6, 0.9, "round"], [22.9, 12.8, 1.0, "dark"], [23.7, 13.7, 0.9, "pine"], [24.4, 12.9, 0.85, "round"], [20.2, 14.3, 0.8, "pine"], [23.1, 14.4, 0.8, "dark"]].forEach(([x, y, sc, k]) => add(x, y, "trees", (g) => K.tree(g, x, y, sc, k)));
    [[1.0, 2.6, 1.5, 1.4, 6.2, "#9ED9CF"], [3.2, 2.6, 1.4, 1.4, 7.6, "#C9D6E3"], [5.4, 2.6, 1.5, 1.4, 8.6, "#9ED9CF"], [7.6, 2.6, 1.3, 1.3, 6.0, "#C9D6E3"]].forEach(([x, y, w, d, h, c]) => add(x + w / 2, y + d / 2, "glass", (g) => K.tower(g, x, y, w, d, h, c, C.water, "plant")));
    const bubbles = [];
    [[11.6, 23.6, "#47B970"], [12.3, 23.7, "#4AB4D6"], [6.8, 23.2, "#E0785A"]].forEach(([x, y, c], i) => add(x, y, "phones", (g) => { K.person(g, x, y, { idle: true, phone: true, dress: i === 1, top: c });
      if (i !== 1) { const q = P(x, y, 0.95), bb = el("g", null, g); el("path", { d: `M${q[0] + 2} ${q[1] - 14} h14 v8 h-9 l-3 3 v-3 h-2 Z`, fill: "#FFFFFF", stroke: "#000", "stroke-width": 0.7 }, bb); [0, 1, 2].forEach((k) => el("circle", { cx: q[0] + 5.5 + k * 3.5, cy: q[1] - 10, r: 0.9, fill: "#3E4860" }, bb)); bubbles.push(bb); } }));

    // ---------- new ways of living (k=6): the square, a park, people all around ----------
    add(9.1, 6.9, "life", (g) => K.fountain(g, 9.1, 6.9, 0.7));
    [[7.2, 5.8, "#E0785A"], [7.6, 8.0, "#47B970"], [10.8, 5.8, "#4AB4D6"], [11.0, 8.0, "#FFCD00"]].forEach(([x, y, c]) => add(x, y, "life", (g) => K.table(g, x, y, c)));
    [[6.8, 6.9, 0.9, "round"], [11.6, 7.0, 0.9]].forEach(([x, y, sc, k]) => add(x, y, "life", (g) => K.tree(g, x, y, sc, k)));
    // a second industrial site on the right of the terraces' rows (replaces the playground): a factory and a works shed
    add(22.2, 16.3, "mills", (g) => K.factory(g, 20.0, 15.4, 4.4, 1.8, 2.0, "#9C8A78"));
    add(27.2, 16.4, "mills", (g) => { const w = bx(g, 25.4, 15.6, 0, 3.6, 1.6, 1.5, "#A9B4C2", "#C9D1DA"); for (let u = 0.3; u < 3.4; u += 0.7) F.face(g, F.L, w, u, 0.3, u + 0.45, 1.1, "#5B6478", { "stroke-width": 0.5 }); });
    const PPL = [
      [8.4, 6.2, { top: "#8C6F9E", phone: true }], [9.9, 7.6, { dress: true, top: "#E0785A" }], [10.2, 6.0, { top: "#47B970" }], [8.2, 7.4, { kid: true, top: "#FFCD00" }],   // the square
      [13.6, 9.1, { top: "#3E4860" }], [14.4, 9.2, { dress: true, top: "#E0785A" }], [15.8, 9.1, { top: "#47B970", phone: true }],   // the platform
      [24.9, 15.3, { top: "#3E4860", hat: true }], [24.6, 17.3, { top: "#E0785A" }],   // the works
      [2.2, 4.8, { top: "#4AB4D6" }], [6.0, 4.9, { dress: true, top: "#8C6F9E" }],   // the city
      [6.4, 14.5, { top: "#E0785A" }], [7.0, 14.6, { kid: true, top: "#47B970" }], [14.2, 14.5, { dress: true, top: "#4AB4D6" }], [21.6, 14.0, { top: "#FFCD00", phone: true }],   // the street
      [4.0, 17.35, { top: "#8C6F9E" }], [14.6, 17.4, { dress: true, top: "#47B970" }],   // the front pavement
      [7.8, 23.95, { top: "#3E4860" }], [13.4, 23.95, { dress: true, top: "#E0785A", phone: true }],   // the roadside
      [1.8, 26.8, { top: "#B5302E", hat: true }], [15.6, 26.6, { top: "#47B970" }],   // farm and homes
      [26.2, 8.6, { top: "#4AB4D6" }], [22.0, 4.4, { top: "#E0785A", hat: true }], [27.4, 4.4, { top: "#FFCD00", hat: true }]];   // warehouse and quay
    PPL.forEach(([x, y, o]) => add(x, y, "life", (g) => K.person(g, x, y, Object.assign({ idle: true }, o))));
    [[12.0, 17.35, "#4AB4D6"], [6.2, 23.7, "#47B970"], [16.0, 9.0, "#B5302E"]].forEach(([x, y, c]) => add(x, y, "life", (g) => K.bike(g, x, y, c, { top: "#E0785A" })));
    [[20.6, 8.5], [27.0, 8.5]].forEach(([x, y]) => add(x, y, "life", (g) => K.bench(g, x, y)));

    // ---------- the grid (k=7): wind on the farm, pylons along the front edge to a substation, batteries, a solar
    // field, and distribution poles into the town; solar on alternate terrace roofs ----------
    [[2.0, 28.4], [6.6, 28.6]].forEach(([x, y]) => add(x, y, "grid", (g) => ISO.turbine(g, F, x, y, 4.0)));
    // the transmission line runs along the front verge of the highway, between the roadside businesses, to the substation
    // a substation: a pad, a gantry the line ends on (its beam carries the four conductors from K.spans), insulators down to
    // two busbars, the transformers under them, a fence on the visible sides
    const substation = (g, x0, y0, x1, y1, ly, gx, xs) => { K.rect(g, x0, y0, x1, y1, "#C9CED6", 0.8);
      const ZB = 1.9, ZS = 1.25, steel = "#4A546A", post = (x, y, z) => bx(g, x - 0.06, y - 0.06, 0, 0.12, 0.12, z, steel, "#626E88");
      // the gantry the line ends on: two lattice posts and a beam
      post(gx, ly - 0.95, ZB); bx(g, gx - 0.05, ly - 0.95, ZB - 0.1, 0.1, 1.9, 0.12, steel, "#626E88"); post(gx, ly + 0.95, ZB);
      // insulators from the beam down to two busbars on posts, and the transformers fed from them
      [-0.56, 0.56].forEach((o) => { const yb = ly + o;
        K.seg(g, [gx, ly + (o < 0 ? -0.76 : 0.76), ZB - 0.1], [gx + 0.3, yb, ZS], "#262C3A", 1); K.seg(g, [gx, yb, ZB - 0.1], [gx + 0.3, yb, ZS], "#262C3A", 1);
        [gx + 0.3, xs[xs.length - 1] + 1.2].forEach((x) => K.seg(g, [x, yb, 0], [x, yb, ZS], steel, 1.2));
        K.seg(g, [gx + 0.3, yb, ZS], [xs[xs.length - 1] + 1.2, yb, ZS], "#262C3A", 1.6);
        xs.forEach((x) => { K.xfmr(g, x, yb - 0.45); K.seg(g, [x + 0.5, yb, ZS], [x + 0.5, yb, 1.1], "#262C3A", 1); }); });
      K.fence(g, x0, y1, x1, y1, "#9AA3B5"); K.fence(g, x1, y0, x1, y1, "#9AA3B5"); };
    // line 1: along the front verge of the highway, between the roadside businesses, to the substation by the highway
    const LY = 23.3, PYL = [[1.0, LY], [6.9, LY], [12.9, LY]], GX1 = 20.2;
    PYL.forEach(([x, y]) => add(x, y, "gridLine", (g) => K.pylon(g, x, y, 3.0, "y"), false));
    for (let k = 1; k < PYL.length; k++) { const a = PYL[k - 1], c = PYL[k]; add(c[0] + 0.01, c[1] + 0.01, "gridLine", (g) => K.spans(g, [a, c], 3.0, "y"), false); }
    add(GX1, LY + 0.01, "gridLine", (g) => K.spans(g, [PYL[2]], 3.0, "y", [GX1, LY, 1.9, "y"]), false);
    add(22.0, 24.0, "gridLine", (g) => substation(g, 19.8, 22.2, 24.4, 25.7, LY, GX1, [21.0, 22.5]), false);
    // line 2: between the industry and the buildings (along the railway), to a substation at the right end of the row
    const LY2 = 12.2, PYL2 = [[1.0, LY2], [7.0, LY2], [13.0, LY2], [19.0, LY2]], GX2 = 25.8;
    PYL2.forEach(([x, y]) => add(x, y, "gridLine", (g) => K.pylon(g, x, y, 3.0, "y"), false));
    for (let k = 1; k < PYL2.length; k++) { const a = PYL2[k - 1], c = PYL2[k]; add(c[0] + 0.01, c[1] + 0.01, "gridLine", (g) => K.spans(g, [a, c], 3.0, "y"), false); }
    add(GX2, LY2 + 0.01, "gridLine", (g) => K.spans(g, [PYL2[3]], 3.0, "y", [GX2, LY2, 1.9, "y"]), false);
    add(27.6, 12.6, "gridLine", (g) => substation(g, 25.5, 11.15, 29.9, 14.0, LY2, GX2, [26.6, 28.1]), false);
    [[25.0, 22.8], [27.4, 22.8], [25.0, 24.4], [27.4, 24.4]].forEach(([x, y]) => add(x + 1.0, y + 0.35, "batt", (g) => { const bb = bx(g, x, y, 0, 2.0, 0.7, 0.8, "#F1F2F4", "#FFFFFF"); for (let u = 0.2; u < 1.85; u += 0.35) F.face(g, F.L, bb, u, 0.12, u + 0.14, 0.62, "#C9CED6", { "stroke-width": 0.5 }); }));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = 20.0 + c * 2.4, y = 26.5 + r * 1.1; add(x + 0.8, y + 0.4, "grid", (g) => ISO.panel(g, F, x, y, 1.7, 0.7)); }
    { const xs = [0.8, 6.48, 12.16, 17.84, 24.7, 29.6], y = 17.85;
      add(15, y, "gridLine", (g) => { let z; xs.forEach((x) => { z = pole(g, x, y, 2.6, "x", true); }); wires(g, xs.map((x) => [x, y]), z, "x", [-0.42, 0, 0.42], "#262C3A"); }, false);
      const ys = [17.85, 21.95]; add(24.7, 20.0, "gridLine", (g) => { let z; ys.forEach((yy) => { z = pole(g, 24.7, yy, 2.6, "y", true); }); wires(g, ys.map((yy) => [24.7, yy]), z, "y", [-0.42, 0, 0.42], "#262C3A"); { const a = P(24.7, 21.95, z), c = P(23.7, 22.74, 1.25); el("path", { d: `M${a[0].toFixed(1)} ${(a[1] - 5).toFixed(1)} Q${((a[0] + c[0]) / 2).toFixed(1)} ${((a[1] + c[1]) / 2 + 2).toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`, stroke: "#262C3A", "stroke-width": 0.8, fill: "none" }, g); }   // the feeder out of the substation
        F.cyl(g, [24.85, 17.85, 1.6], "z", 0.16, 0.36, { side: "#9AA3B5", cap: "#C9CED6" }); }, false); }
    TER.forEach(([x, y, n]) => add(x + n * 0.47 + 0.01, y + 0.61, "grid", (g) => terraceSolar(g, x, y, n, 1.4, 0, 2), [x + n * 0.47, y + 0.6]));

    // ---------- Act 2 (E3) and the electrostates (GA2-GA5) ----------
    [[10.8, 0.7], [10.8, 2.9]].forEach(([x, y]) => add(x + 1.7, y + 0.7, "demand", (g) => K.dataHall(g, x, y, 3.4, 1.4)));
    add(4.12, 23.02, "ga2", (g) => { [[3.0, 22.3], [5.0, 22.3], [3.0, 23.5], [5.0, 23.5]].forEach(([x, y]) => bx(g, x, y, 0, 0.12, 0.12, 1.1, "#D8DBE6")); K.quad(g, [[2.8, 22.1, 1.1], [5.4, 22.1, 1.1], [5.4, 23.9, 1.1], [2.8, 23.9, 1.1]], "#47B970");
      [[3.5, 22.8], [4.3, 22.8]].forEach(([x, y]) => bx(g, x, y, 0, 0.3, 0.3, 0.7, "#F1F2F4", "#47B970")); K.car(g, 3.2, 23.4, "#4AB4D6", "x"); }, [4.1, 23]);
    HOMES.forEach(([x, y]) => { add(x + 2.25, y + 0.3, "ga2", (g) => { bx(g, x + 2.05, y + 0.2, 0, 0.45, 0.3, 0.42, "#F1F2F4", "#FFFFFF"); const c = P(x + 2.27, y + 0.5, 0.21); el("circle", { cx: c[0], cy: c[1], r: 3.2, fill: "#C9CED6", stroke: "#000", "stroke-width": 0.6 }, g); }, [x + 1.1, y + 0.8]);
      add(x + 1.6, y + 2.3, "ga2", (g) => K.charger(g, x + 1.6, y + 2.3), [x + 1.1, y + 0.8]); });
    TER.forEach(([x, y, n]) => add(x + n * 0.47 + 0.02, y + 0.62, "ga3", (g) => terraceSolar(g, x, y, n, 1.4, 1, 2), [x + n * 0.47, y + 0.6]));
    [[23.0, 1.2], [26.4, 0.8]].forEach(([x, y]) => add(x, y, "ga3", (g) => ISO.turbine(g, F, x, y, 4.0)));   // offshore, in the harbour
    [[15.5, 0.7], [15.5, 2.9]].forEach(([x, y]) => add(x + 1.7, y + 0.7, "ga4", (g) => K.dataHall(g, x, y, 3.4, 1.4)));
    add(23.8, 4.1, "ga5", (g) => K.factory(g, 21.8, 3.4, 4.0, 1.4, 2.0, "#9FB2C6"));   // where the fuel tanks stood

    // ---------- the movers: the trains, the narrowboat, the traffic ----------
    let train, fast, cars, boat, boatG;
    S.lane(RY + 0.2, (g) => { train = convoy(g, N, steamTrain(RY + 0.2, 3)); fast = el("g", { opacity: 0 }, g); K.train(fast, 0, RY + 0.18, 3, { stripe: "#13CE74" }); });
    S.lane(HY + 1.2, (g0) => { boatG = el("g", null, g0); boat = convoy(boatG, N, [[0, (g) => { const y = HY + 1.2;
      F.box(g, -1.5, y, 0, 3.0, 0.55, 0.28, { left: "#2F5E4E", right: shade("#2F5E4E"), top: "#4E7F6C" });
      const cab = F.box(g, -0.9, y + 0.07, 0.28, 1.8, 0.42, 0.34, { left: "#B5302E", right: shade("#B5302E"), top: "#E3D6C0" });
      for (let u = 0.2; u < 1.6; u += 0.45) F.face(g, F.L, cab, u, 0.1, u + 0.22, 0.26, "#FFE6A3", { "stroke-width": 0.5 }); }]]); });
    S.lane(HY + 0.1, (g) => { cars = el("g", { opacity: 0 }, g); [[3.0, "#E0785A"], [11.6, "#4AB4D6"], [22.4, "#FFCD00"]].forEach(([x, c]) => K.oldCar(cars, x, HY + 0.1, c));
      bx(cars, 15.4, HY + 0.1, 0.12, 1.7, 0.6, 0.85, "#F1F2F4", "#FFFFFF"); bx(cars, 17.15, HY + 0.13, 0.12, 0.55, 0.55, 0.7, "#B5302E", "#E0785A");
      [[7.6, "#A6D84A"], [25.6, "#8C6F9E"]].forEach(([x, c]) => K.oldCar(cars, x, HY + 1.95, c)); });
    S.flush();
    // the grid reads as a structure, not hairlines: heavier strokes on the pylons, poles, conductors and substations
    (S.sets.gridLine || []).forEach((g) => g.querySelectorAll("path, polyline, polygon, line").forEach((n) => { const w = parseFloat(n.getAttribute("stroke-width")) || 1; n.setAttribute("stroke-width", (w * 1.6).toFixed(2)); }));
    const st = S.sets, T = (n) => st[n] || [];

    // ---------- timeline ----------
    // k=1 canals
    tl.to(canalSegs, { opacity: 1, duration: 0.04, stagger: 0.4 / canalSegs.length, ease: "none" }, b(1));
    boat.at(-4); boat.to(tl, 11, { duration: 0.75, ease: "power1.out" }, b(1) + 0.25);
    // k=2 railways: the line, the station, the train; then the town rises
    tl.to(bed, { opacity: 1, duration: 0.15 }, b(2));
    rails.forEach((r) => drawOn(tl, r, b(2), 0.45));
    tl.to(sleepers, { opacity: 1, duration: 0.04, stagger: 0.45 / sleepers.length, ease: "none" }, b(2));
    tl.to(platform, { opacity: 1, duration: 0.15 }, b(2) + 0.2);
    rise(tl, T("laid"), b(2) + 0.25, { stagger: 0.05 });
    train.at(-8); train.to(tl, 17, { duration: 0.45, ease: "power1.out" }, b(2) + 0.25);
    sink(tl, T("rural"), b(2) + 0.45);
    tl.to(farm, { opacity: 0, duration: 0.2 }, b(2) + 0.5); tl.to(town, { opacity: 1, duration: 0.2 }, b(2) + 0.5);
    rise(tl, T("mills").concat(T("chim")), b(2) + 0.55, { stagger: 0.04, dur: 0.3 });
    rise(tl, T("terr"), b(2) + 0.62, { stagger: 0.03, dur: 0.25 });
    rise(tl, T("city"), b(2) + 0.55, { stagger: 0.03, dur: 0.35 });
    rise(tl, T("trees"), b(2) + 0.7, { stagger: 0.01, dur: 0.2 });
    train.to(tl, 44, { duration: 0.6, ease: "power1.in" }, b(2) + 0.75);
    // k=3 telephone lines
    tl.to(skies[1], { opacity: 1, duration: 0.4 }, b(3) - 0.1);
    rise(tl, T("tel"), b(3), { dur: 0.3 }); rise(tl, T("masts"), b(3) + 0.2, { stagger: 0.1 });
    rise(tl, T("gridLine"), b(3) + 0.25, { stagger: 0.04, dur: 0.3 });   // the transmission line, substation and distribution poles come early too
    // k=4 highways: the canal is paved over; traffic; roadside businesses and homes; the fuel terminal
    tl.to(boatG, { opacity: 0, duration: 0.15 }, b(4) - 0.05); tl.to(canalG, { opacity: 0, duration: 0.15 }, b(4) + 0.25);
    tl.to(segs, { opacity: 1, duration: 0.04, stagger: 0.4 / segs.length, ease: "none" }, b(4));
    tl.to(edges, { opacity: 1, duration: 0.2 }, b(4) + 0.4);
    tl.to(cars, { opacity: 1, duration: 0.25 }, b(4) + 0.45);
    rise(tl, T("pops"), b(4) + 0.5, { stagger: 0.05 });
    tl.to(quay, { opacity: 1, duration: 0.2 }, b(4) + 0.45);
    rise(tl, T("tanks"), b(4) + 0.6, { stagger: 0.05, dur: 0.25 });
    tl.to(T("boats"), { opacity: 0, duration: 0.2 }, b(4) + 0.3);
    tl.fromTo(T("ship"), Object.assign({ opacity: 0 }, along(null, 8)), Object.assign(along(null, 0), { opacity: 1, duration: 0.45, ease: "power2.out" }), b(4) + 0.5);
    // k=5 internet cables: the subsea cable lands, fibre runs through the streets; modern blocks; phones
    tl.to(skies[2], { opacity: 1, duration: 0.4 }, b(5) - 0.1);
    rise(tl, T("net"), b(5), {});
    drawOn(tl, fibre[0], b(5), 0.3);
    rise(tl, T("glass"), b(5) + 0.3, { stagger: 0.06, dur: 0.35 });
    rise(tl, T("phones"), b(5) + 0.5, { stagger: 0.05 });
    gsap.set(bubbles, { opacity: 0 }); tl.to(bubbles, { opacity: 1, duration: 0.2, stagger: 0.12 }, b(5) + 0.65);
    // k=6 new ways of living: the square, the park, people; a fast electric train, the traffic moves on
    rise(tl, T("life"), b(6), { stagger: 0.01, dur: 0.2 }); rise(tl, T("park"), b(6) + 0.1, { stagger: 0.03, dur: 0.25 });
    tl.fromTo(fast, Object.assign({ opacity: 0 }, along(fast, -2)), Object.assign(along(fast, 34), { duration: 0.9, ease: "power1.inOut" }), b(6) + 0.1);
    tl.to(fast, { opacity: 1, duration: 0.1 }, b(6) + 0.1); tl.to(fast, { opacity: 0, duration: 0.1 }, b(6) + 0.9);
    tl.to(cars, Object.assign(along(cars, 2.5), { duration: 0.8, ease: "power1.inOut" }), b(6) + 0.1);
    // k=7 the grid
    tl.to(yardField, { opacity: 0, duration: 0.2 }, b(7) - 0.05);
    rise(tl, T("batt").concat(T("grid")), b(7) - 0.05, { stagger: 0.025, dur: 0.3 });
    // k=8 holds

    // ---------- Act 2 (O = 10): E1 the train and traffic; E2 everything but the grid washes out; E3 data centres ----------
    const O = 10, keep = new Set(T("gridLine").concat(T("batt"), T("demand")));
    const rest = [...S.items.children].filter((n) => !keep.has(n) && n !== fast.parentNode), greyed = rest.concat([S.ground]);
    const W0 = "grayscale(0) contrast(1) brightness(1)"; gsap.set(greyed, { filter: W0 });
    tl.fromTo(fast, Object.assign({ opacity: 0 }, along(fast, -2)), Object.assign(along(fast, 34), { opacity: 1, duration: 0.75, ease: "power1.inOut", immediateRender: false }), O + 0.05);
    tl.to(fast, { opacity: 0, duration: 0.08 }, O + 0.72);
    tl.to(cars, Object.assign(along(cars, 6), { duration: 0.7, ease: "power1.inOut" }), O + 0.05);
    tl.to(greyed, { filter: "grayscale(1) contrast(0.14) brightness(1.68)", duration: 0.35 }, O + 0.6);   // E2: everything but the grid all but fades to white
    // E3 a world hungrier for power: the users of electricity come back into colour (homes, industry, shops and offices)
    const users = T("terr").concat(T("pops"), T("mills"), T("glass"), T("city"), T("laid"), T("farmB"));
    const gridAll = T("gridLine").concat(T("batt")); gsap.set(gridAll, { filter: W0 });
    tl.to(users, { filter: W0, duration: 0.35 }, O + 1.55);
    tl.to(gridAll, { filter: "grayscale(1) contrast(0.14) brightness(1.68)", duration: 0.35 }, O + 1.55);   // the grid steps back; the users lead

    // ---------- electrostates (O = 13) ----------
    const Q = 13;
    tl.to(greyed.concat(gridAll), { filter: W0, duration: 0.35 }, Q - 0.1);                                                         // GA1
    rise(tl, T("ga2"), Q + 0.62, { dur: 0.25, stagger: 0.05 });                                                     // GA2
    sink(tl, T("chim"), Q + 0.75, { dur: 0.3 });
    tl.fromTo(fast, Object.assign({ opacity: 0 }, along(fast, -2)), Object.assign(along(fast, 34), { opacity: 1, duration: 0.75, ease: "power1.inOut", immediateRender: false }), Q + 0.62);
    tl.to(fast, { opacity: 0, duration: 0.08 }, Q + 1.3);
    tl.to(cars, Object.assign(along(cars, 9.5), { duration: 0.7, ease: "power1.inOut" }), Q + 0.62);
    tl.to(T("ship"), Object.assign(along(null, 9), { opacity: 0, duration: 0.5, ease: "power1.in" }), Q + 1.55);   // GA3
    sink(tl, T("tanks"), Q + 1.75);
    rise(tl, T("ga3"), Q + 1.85, { dur: 0.3, stagger: 0.04 });
    rise(tl, T("demand").concat(T("ga4")), Q + 2.62, { dur: 0.35, stagger: 0.12 });   // GA4: data centres                                                     // GA4
    rise(tl, T("ga5"), Q + 3.55, { dur: 0.3 });                                                                     // GA5
    ISO.tweens.forEach((t) => t.play && t.play());
    hold(tl, Q + 4);
    return tl;
  }

  window.VALLEYKIT = { cow, sheep, steamTrain, pole, wires, mast, terraceSolar, boatSmall };   // shared with js/iso-onecity.js (index4)
  Object.assign(window.SCENES, { valley });
})();
