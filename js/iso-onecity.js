/* index4.html: ONE CITY for Acts 1-3 (scene "onecity").
   The 4 x 4 city of the modern-grid section (blocks 10.5 wide, roads 1.5, land 46.5 across), told as one evolving
   place, with the grid drawn literally: pylons, poles, wires and substations, no glass tubes. Power on the wires is
   shown by short pulses running along them: green from renewables, orange from fossil.
   Layout (block i along gx, j along gy):
     tiles 1-4   wind farm | solar and batteries | the fossil power plant | downtown towers
     tiles 5-8   homes | high street, with the station | main substation and control centre | the LNG port (sea along the right edge)
     tiles 9-12  flats | park, later the EV hub | row houses | industry
     tiles 13-16 fields, later a new renewables zone | village | farm | data centres
   The gx roads: road 0 a road from the start, road 1 the railway, road 2 a canal paved into a highway.
   Lines: the transmission line along the front of the generation row into the main substation; distribution lines on
   poles along road 0 (D1), down the pavement of gy road 1 (D2) and along road 2 (D3); a telephone line down gy road 2.
   One beat per card; scene time = card index (the Act 1 list card holds for five). b(k) = k - 0.45. */
(function () {
  if (!window.CLEAN || !window.ISOSCENES || !window.ISOSTAGE || !window.VALLEYKIT) return;
  const { el } = SVG;
  const { C } = ISO;
  const { K, sky } = ISOSCENES;
  const { stage, drawOn, along, convoy, field, cottage, live } = ISOSTAGE;
  const VK = window.VALLEYKIT;
  const P = (x, y, z) => ISO.P(x, y, z || 0);
  const F = ISO.frame([0, 0], 1);
  const shade = (h) => ISO.mixHex(h, "#000000", 0.16), lite = (h) => ISO.mixHex(h, "#FFFFFF", 0.35);
  const bx = (g, x, y, z, w, d, h, col, top) => F.box(g, x, y, z, w, d, h, { left: col, right: shade(col), top: top || lite(col) });
  const hold = (tl, n) => tl.to({}, { duration: 0.001 }, n + 0.1);
  const b = (k) => k - 0.45;
  const GREEN = "#13CE74", ORANGE = "#EE7309";
  const W0 = "grayscale(0) contrast(1) brightness(1)", WASH = "grayscale(1) contrast(0.12) brightness(1.72)", WASH2 = "grayscale(1) contrast(0.14) brightness(1.68)";
  // the "highlight" look (index5): every beat brings out what it is about and mutes the rest of the city
  const MUTE = "grayscale(1) contrast(0.3) brightness(1.5)", MUTEG = "grayscale(1) contrast(0.4) brightness(1.32)";
  const DULLF = "saturate(0.5) brightness(1.03)";

  // simplified buildings, to keep the city calm: a terrace as one block with a pitched roof and a window per house;
  // a factory as a box with a sawtooth roof and one band of windows
  const terrace = (g, x, y, n, h, col) => { const W = n * 0.95, b0 = bx(g, x, y, 0, W, 1.2, h, col);
    for (let k = 0; k < n; k++) F.face(g, F.L, b0, k * 0.95 + 0.32, h * 0.45, k * 0.95 + 0.62, h * 0.75, "#C9D6E3", { "stroke-width": 0.5 });
    K.quad(g, [[x, y, h], [x + W, y, h], [x + W, y + 0.6, h + 0.45], [x, y + 0.6, h + 0.45]], "#5A5660", { "stroke-width": 0.7 });
    K.quad(g, [[x, y + 1.2, h], [x + W, y + 1.2, h], [x + W, y + 0.6, h + 0.45], [x, y + 0.6, h + 0.45]], "#6E6A72", { "stroke-width": 0.7 });
    K.quad(g, [[x + W, y, h], [x + W, y + 1.2, h], [x + W, y + 0.6, h + 0.45]], shade(col), { "stroke-width": 0.7 }); };
  const factory = (g, x, y, w, d, h, col) => { const b0 = bx(g, x, y, 0, w, d, h, col); F.face(g, F.L, b0, 0.3, h * 0.55, w - 0.3, h * 0.75, "#C9D6E3", { "stroke-width": 0.5 });
    const t = w / 3; for (let i = 0; i < 3; i++) { const x0 = x + i * t, x1 = x0 + t;
      K.quad(g, [[x0, y, h], [x0, y + d, h], [x1, y + d, h + 0.55], [x1, y, h + 0.55]], lite(col), { "stroke-width": 0.7 });
      K.quad(g, [[x1, y, h], [x1, y + d, h], [x1, y + d, h + 0.55], [x1, y, h + 0.55]], "#9FC3DD", { "stroke-width": 0.7 });
      K.quad(g, [[x0, y + d, h], [x1, y + d, h], [x1, y + d, h + 0.55]], col, { "stroke-width": 0.7 }); } };
  const rise = (tl, gs, t, o) => { o = o || {}; (gs || []).forEach((g, i) => { gsap.set(g, { opacity: 0, y: -16 });
    tl.to(g, { opacity: 1, y: 0, duration: o.dur || 0.3, ease: "power2.out" }, t + i * (o.stagger == null ? 0.02 : o.stagger)); }); };
  const sink = (tl, gs, t, o) => { o = o || {}; (gs || []).forEach((g, i) => tl.to(g, { opacity: 0, y: -10, duration: o.dur || 0.22, ease: "power1.in" }, t + i * (o.stagger == null ? 0.01 : o.stagger))); };

  function onecity(svg) {
    const HL = svg.dataset.look === "highlight";
    const tl = gsap.timeline({ paused: true });
    live(svg);
    const skies = [["oc-sky1", [["0", "#FBF4E2"], ["0.7", "#EFE6CF"], ["1", "#E2DAC4"]]], ["oc-sky2", [["0", "#F2F8FD"], ["0.7", "#DCEBF7"], ["1", "#CFE2F2"]]]]
      .map(([id, st], i) => { const r = sky(svg, id, st); if (i) r.setAttribute("opacity", 0); return r; });
    const N = 46.5, S = stage(svg, { N, M: N, s: 0.4, tx: 680, ty: 90, ground: "#DCEBC9" }), G = S.ground;
    const RD = [[10.5, 12], [22.5, 24], [34.5, 36]];
    const DULL = new Set(["old", "oldshops", "city", "terr", "ind", "station", "homes", "shops", "flats", "towers", "cc", "village", "farm", "depot", "ind2"]);
    const add = (x, y, set, fn) => S.add(x, y, (g) => { const w = el("g", null, g); if (DULL.has(set)) w.style.filter = DULLF; fn(w); }, set);

    // ================= the ground =================
    const farm = el("g", null, G);
    const fl = (x0, y0, x1, y1, c, ln) => field(farm, x0, y0, x1, y1, c, ln);
    // one ground cover per tile, the full block inside the pavements (B(i, j) = [x0, y0, x1, y1])
    const B = (i, j) => [i * 12 + 0.25, j * 12 + 0.25, i * 12 + 10.25, j * 12 + 10.25];
    const fb = (i, j, c, ln) => { const [a, b2, c2, d] = B(i, j); fl(a, b2, c2, d, c, ln); };
    fb(0, 0, "#E8E0B8", "#D6CB98"); fb(1, 0, "#CFE3B8"); fb(2, 0, "#E8E0B8", "#D6CB98"); fb(3, 0, "#D7E8C0");
    fb(2, 1, "#CFE3B8"); fb(0, 2, "#D7E8C0"); fb(2, 2, "#E8E0B8", "#D6CB98"); fb(3, 2, "#CFE3B8");
    fb(0, 3, "#E8E0B8", "#D6CB98"); fb(2, 3, "#CFE3B8"); fb(3, 3, "#D7E8C0");
    // tile 8: the sea along the right-hand edge, with a sandy shore (a quay comes with the port)
    K.rect(G, 40.9, 12.25, N, 22.25, "#8FC6E4", 1);
    for (let y = 13.2; y < 21.6; y += 2.2) { const x = 43.0 + (y % 1.9), a = P(x, y), c = P(x, y + 0.8); el("path", { d: `M${a[0]} ${a[1]} L${c[0]} ${c[1]}`, stroke: "#B9DDF0", "stroke-width": 1.2 }, G); }
    // the common in block (1,2): grass and a pond, through every age
    K.rect(G, 12.25, 24.25, 22.25, 34.25, "#C7E2B0", 0.8); K.rect(G, 18.4, 30.2, 21.6, 33.4, C.water, 1);
    // dirt lanes on the old town's grid (the canal and the railway take two of them)
    const lanes = el("g", null, G), laneR1 = el("g", null, G), laneR2 = el("g", null, G);
    RD.forEach(([a, c], k) => K.rect(k === 1 ? laneR1 : k === 2 ? laneR2 : lanes, 0, a + 0.35, N, c - 0.35, "#E3D6B0", 0.8));
    RD.forEach(([a, c]) => K.rect(lanes, a + 0.35, 0, c - 0.35, N, "#E3D6B0", 0.8));
    // paved plots that come with the town
    const pad = (x0, y0, x1, y1, col) => { const g = el("g", { opacity: 0 }, G); K.rect(g, x0, y0, x1, y1, col || "#E3DDD0", 0.8); return g; };
    const pb = (i, j, c) => { const [a, b2, c2, d] = B(i, j); return pad(a, b2, c2, d, c); };
    const padPS = pb(2, 0, "#DCD6CA"), padSub = pb(2, 1, "#E3E6EB"), padTerr = pb(2, 2, "#E3DDD0"),
      padInd = pb(3, 2, "#DCD6CA"), padDown = pb(3, 0, "#E3E6EB"), padShops = pb(1, 1, "#E3E6EB"), padFlats = pb(0, 2, "#E3E6EB"),
      padDC = pb(3, 3, "#E3E6EB"), padDepot = pad(36.25, 12.25, 40.9, 22.25, "#C9C0AC");
    // the canal along road 2 (Act 1), paved over by the highway
    const canal = el("g", { opacity: 0 }, G); { const a = RD[2][0] - 0.1, c = RD[2][1] + 0.1; K.rect(canal, 0, a, N, c, "#C9BFA6", 0); K.rect(canal, 0, a + 0.2, N, c - 0.2, "#8FC6E4", 0);
      K.lineGX(canal, a + 0.2, 0, N, 0, "#6E8FA8", 1); K.lineGX(canal, c - 0.2, 0, N, 0, "#6E8FA8", 1); }
    // the railway along road 1
    const RY = RD[1][0], bed = el("g", { opacity: 0 }, G); K.rect(bed, 0, RY + 0.05, N, RY + 1.45, "#CFC8BE", 1);
    const sleepers = []; { const g = el("g", null, G); for (let x = 0.2; x < N; x += 0.5) { const a = P(x, RY + 0.3), c = P(x, RY + 1.2); sleepers.push(el("path", { d: `M${a[0]} ${a[1]} L${c[0]} ${c[1]}`, stroke: "#8F7A6E", "stroke-width": 1.4, opacity: 0 }, g)); } }
    const rails = [RY + 0.45, RY + 1.05].map((y) => K.lineGX(G, y, 0, N, 0, "#3E4860", 1.4));
    // the roads, paved with the highways: gx roads 0 and 2, all three gy roads (level crossings over the railway)
    const roads = el("g", { opacity: 0 }, G);
    { const PV = 0.25;   // a narrow pavement
      [0, 2].forEach((k) => { const [a, c] = RD[k]; K.rect(roads, 0, a - PV, N, c + PV, "#E9EBEE", 0); });
      RD.forEach(([a, c]) => K.rect(roads, a - PV, 0, c + PV, N, "#E9EBEE", 0));
      [0, 2].forEach((k) => { const [a, c] = RD[k]; K.rect(roads, 0, a, N, c, "#5B6478", 0); });
      RD.forEach(([a, c]) => K.rect(roads, a, 0, c, N, "#5B6478", 0));
      // edges: along each road between the junctions only, so the roads meet as one surface
      const runs = (cuts) => { const out = []; let lo = 0; cuts.forEach(([p, q]) => { out.push([lo, p]); lo = q; }); out.push([lo, N]); return out; };
      const gxCuts = RD, gyCuts = [RD[0], RD[2]];
      [0, 2].forEach((k) => { const [a, c] = RD[k]; runs(gxCuts).forEach(([x0, x1]) => [a, c].forEach((y) => K.lineGX(roads, y, x0, x1, 0, "#3E4860", 0.9))); });
      RD.forEach(([a, c]) => runs(gyCuts).forEach(([y0, y1]) => [a, c].forEach((x) => K.seg(roads, [x, y0, 0], [x, y1, 0], "#3E4860", 0.9)))); }
    { let d = ""; [0, 2].forEach((k) => { const m = (RD[k][0] + RD[k][1]) / 2; for (let x = 0.5; x < N; x += 1.4) { if (RD.some(([p, q]) => x > p - 1 && x < q + 0.3)) continue; const a = P(x, m), c = P(x + 0.7, m); d += `M${a[0]} ${a[1]} L${c[0]} ${c[1]} `; } });
      RD.forEach(([a0, c0]) => { const m = (a0 + c0) / 2; for (let y = 0.5; y < N; y += 1.4) { if (RD.some(([p, q], k) => k !== 1 && y > p - 1 && y < q + 0.3) || (y > RY - 0.6 && y < RY + 1.8)) continue; const a = P(m, y), c = P(m, y + 0.7); d += `M${a[0]} ${a[1]} L${c[0]} ${c[1]} `; } });
      el("path", { d, stroke: "#FFFFFF", "stroke-width": 1.5, fill: "none" }, roads); }
    { const g = el("g", null, roads); [RY + 0.45, RY + 1.05].forEach((y) => RD.forEach(([a, c]) => K.lineGX(g, y, a, c, 0.02, "#3E4860", 1.4))); }   // rails across the crossings

    // ================= the old town (there from the start) =================
    // (0,1) cottages, (3,1) an old high street, (1,3) a village with a church, (2,3) a farm, a windmill on (1,0)
    [[1.0, 13.4, "#8F7A6E"], [5.8, 13.4, "#B77464"], [1.0, 18.2, "#C9A15A"], [5.8, 18.2, "#9C6457"]].forEach(([x, y, r]) => add(x + 1, y + 0.7, "old", (g) => cottage(g, x, y, r)));
    [[12.8, "#B7795E"], [15.1, "#A9876A"], [17.4, "#C9A988"], [19.7, "#B7795E"]].forEach(([x, c], i) => add(x + 1.1, 14.2, "oldshops", (g) => { const s = bx(g, x, 13.2, 0, 2.2, 2.0, 1.8 + (i % 2) * 0.3, c, "#6E6A72");
      F.face(g, F.L, s, 0.2, 0.15, 2.0, 0.85, "#F3E2C6", { "stroke-width": 0.5 }); F.face(g, F.L, s, 0.4, 1.1, 0.9, 1.5, "#FFE6A3", { "stroke-width": 0.5 }); F.face(g, F.L, s, 1.3, 1.1, 1.8, 1.5, "#FFE6A3", { "stroke-width": 0.5 }); }));
    [[13.0, 37.8, "#B77464"], [16.4, 37.6, "#8F7A6E"]].forEach(([x, y, r]) => add(x + 1, y + 0.7, "village", (g) => cottage(g, x, y, r)));
    add(20.2, 41.0, "village", (g) => { const c = bx(g, 18.8, 40.0, 0, 2.6, 1.6, 1.6, "#D8D2C4", "#8F8784"); F.face(g, F.L, c, 0.4, 0.4, 0.8, 1.2, "#5B6478", { "stroke-width": 0.5 });
      bx(g, 18.9, 40.1, 1.6, 0.8, 0.8, 1.4, "#D8D2C4", "#6E6A72"); K.quad(g, [[18.9, 40.1, 3.0], [19.7, 40.1, 3.0], [19.3, 40.5, 4.0]], "#6E6A72", { "stroke-width": 0.6 }); K.quad(g, [[19.7, 40.1, 3.0], [19.7, 40.9, 3.0], [19.3, 40.5, 4.0]], "#4A546A", { "stroke-width": 0.6 }); });
    add(27.4, 38.0, "farm", (g) => { const bn = bx(g, 25.8, 37.0, 0, 3.2, 1.8, 1.4, "#B5302E", "#6D5A56"); F.face(g, F.L, bn, 1.1, 0, 2.1, 1.0, "#F1F2F4", { "stroke-width": 0.6 }); });
    add(31.2, 37.8, "farm", (g) => cottage(g, 30.2, 37.2, "#8F7A6E"));
    [[29.6, 41.0, 1], [31.6, 42.2, -1], [26.6, 43.6, 1]].forEach(([x, y, d]) => add(x, y, "farmlife", (g) => VK.cow(g, x, y, d)));
    [[25.0, 41.4], [33.0, 41.2]].forEach(([x, y]) => add(x, y, "farmlife", (g) => K.hay(g, x, y)));
    [[1.0, 45.6, 1], [6.8, 45.2, -1], [7.2, 43.0, 1]].forEach(([x, y, d]) => add(x, y, "sheep", (g) => VK.sheep(g, x, y, d)));
    add(17.0, 5.0, "mill", (g) => K.mill(g, 17.0, 5.0));
    [[2.0, 9.0, "pine"], [9.4, 22.0], [13.0, 29.0, "round"], [16.2, 28.6], [13.2, 31.8, "dark"], [21.4, 26.4, "round"], [13.0, 44.4], [21.6, 43.8, "pine"], [33.4, 44.0, "dark"],
      [33.6, 21.6], [25.4, 14.0, "round"], [27.6, 13.2], [0.8, 33.4]].forEach(([x, y, k]) => add(x, y, "trees", (g) => K.tree(g, x, y, 1, k)));

    // ================= railways (k=3): the station, the power station, industry, terraces, the brick city =================
    add(14.4, 21.4, "station", (g) => { const s = bx(g, 12.7, 20.3, 0, 3.4, 1.3, 1.4, "#C9A988", "#E3D6C0"); for (let u = 0.3; u < 3.2; u += 0.55) F.face(g, F.L, s, u, 0.4, u + 0.3, 1.0, "#FFE6A3", { "stroke-width": 0.5 });
      K.quad(g, [[12.6, 20.2, 1.4], [16.2, 20.2, 1.4], [16.2, 20.95, 1.95], [12.6, 20.95, 1.95]], "#6E6A72", { "stroke-width": 0.8 }); K.quad(g, [[12.6, 21.7, 1.4], [16.2, 21.7, 1.4], [16.2, 20.95, 1.95], [12.6, 20.95, 1.95]], "#8F8784", { "stroke-width": 0.8 });
      K.rect(g, 12.4, 21.75, 17.2, 22.45, "#C9C0AC", 0.8); });
    add(29.0, 4.8, "ps", (g) => ISO.draw("fossil", g, [29.0, 4.6], 1.1));
    add(33.2, 8.4, "psx", (g) => { F.box(g, 32.0, 7.6, 0, 2.4, 2.2, 0.06, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" }); K.xfmr(g, 32.8, 8.0); });
    add(39.2, 26.6, "ind", (g) => K.factory(g, 37.0, 25.2, 4.4, 2.8, 2.4, "#B7795E"));
    add(42.2, 25.6, "chim", (g) => K.chimney(g, 42.2, 25.6, 5.0));
    add(44.2, 27.0, "ind", (g) => { const w = bx(g, 42.8, 26.2, 0, 2.8, 1.6, 1.5, "#A9876A", "#C9A988"); for (let u = 0.3; u < 2.6; u += 0.6) F.face(g, F.L, w, u, 0.4, u + 0.3, 0.9, "#FFE6A3", { "stroke-width": 0.5 }); });
    const TER = [[24.6, 24.9, 10, "#B7795E"], [24.6, 28.0, 10, "#C9A988"], [24.6, 31.1, 10, "#A9876A"]];
    TER.forEach(([x, y, n, c]) => add(x + n * 0.47, y + 0.6, "terr", (g) => K.terrace(g, x, y, n, 1.4, c)));
    [[36.8, 3.4], [39.4, 4.6], [42.0, 3.8], [44.4, 4.2]].forEach(([x, h], k) => add(x + 0.9, 6.9, "city", (g) => K.tower(g, x, 6.2, 1.8, 1.4, h, ["#C9B8A8", "#BFAE9E", "#D3C4B6"][k % 3], "#E9DFC9", "none", { punched: true, noShop: true, floor: 0.8 })));

    // ================= telephone lines (k=4): the telephone line, and the grid: the line from the power station, the
    // main substation, distribution lines on poles =================
    const TELX = 10.25, TELY = [0.6, 6.0, 15.6, 20.6, 27.5, 32.4, 40.5, 43.6];

    // ---- lines: each span is drawn in depth order on its own, with its conductors and its pulse paths ----
    const LINES = {}, pulseAll = [];
    const lineOf = (id) => (LINES[id] = LINES[id] || { f: [], c: [], cb: [], cond: [], groups: [] });
    // a support: where each conductor attaches. kind: pylon (line along gx: arms along gy), pylonX (line along gy), gantry,
    // pole (distribution, three conductors on insulators), xf (a transformer's terminal), tel
    const att = (s, o, lvl) => {
      const hw = 3.2 * 0.8;
      if (s.k === "pylon") { const z = lvl ? hw * 0.95 : hw * 0.7, w = lvl ? 0.7 : 0.95, q = P(s.x, s.y + w * Math.sign(o || 1), z); return [q[0], q[1] + 6]; }
      if (s.k === "pylonX") { const z = lvl ? hw * 0.95 : hw * 0.7, w = lvl ? 0.7 : 0.95, q = P(s.x + w * Math.sign(o || 1), s.y, z); return [q[0], q[1] + 6]; }
      if (s.k === "gantry") { const q = s.ax === "x" ? P(s.x + o * 0.85, s.y, 2.15) : P(s.x, s.y + o * 0.85, 2.15); return q; }
      if (s.k === "pole") { const q = s.ax === "x" ? P(s.x, s.y + o, 2.48) : P(s.x + o, s.y, 2.48); return [q[0], q[1] - 5]; }
      if (s.k === "xf") { const q = P(s.x, s.y, 1.1); return q; }
      return P(s.x, s.y, 2);
    };
    const sagPath = (a, c, sag) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${((a[0] + c[0]) / 2).toFixed(1)} ${((a[1] + c[1]) / 2 + sag).toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
    // a pulse: bright packets of power travelling along the wire, each with a soft halo, both breathing as they go
    // (CSS animations, so hundreds of them stay cheap)
    if (!svg.querySelector("style.oc-pulse")) el("style", { class: "oc-pulse", text: `
      .oc-pk path { fill: none; stroke-linecap: round; stroke-dasharray: 11 181; animation: oc-flow 2.6s linear infinite; }
      .oc-pk.rev path { animation-direction: reverse; }
      .oc-pk .core { stroke-width: 8; animation: oc-flow 2.6s linear infinite, oc-core 0.65s ease-in-out infinite alternate; }
      .oc-pk.rev .core { animation-direction: reverse, alternate; }
      .oc-pk .halo { stroke-width: 24; opacity: 0.3; animation: oc-flow 2.6s linear infinite, oc-halo 0.65s ease-in-out infinite alternate; }
      .oc-pk.rev .halo { animation-direction: reverse, alternate; }
      .oc-pk.dense path { stroke-dasharray: 11 85; }
      .oc-pk.alt path { animation-delay: -1.3s; }
      .oc-pk.alt.dense path { animation-delay: -0.65s; }
      @keyframes oc-flow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -192; } }
      @keyframes oc-core { from { stroke-width: 7; } to { stroke-width: 12; } }
      @keyframes oc-halo { from { stroke-width: 18; opacity: 0.15; } to { stroke-width: 32; opacity: 0.4; } }` }, svg);
    const pulse = (g, d, col, rev, alt) => { const p = el("g", { class: "oc-pk" + (rev ? " rev" : "") + (alt ? " alt" : ""), opacity: 0, "data-keepstroke": "", "data-noink": "" }, g);
      el("path", { d, class: "halo", stroke: col }, p); el("path", { d, class: "core", stroke: col }, p); pulseAll.push(p); return p; };
    // a span from support A to support B, for line id; transmission spans carry four conductors, distribution three
    function span(id, set, A, B, o) {
      o = o || {}; const L = lineOf(id), tr = A.k !== "pole" && B.k !== "pole", sag = tr ? 10 : 7;
      const front = (A.x + A.y > B.x + B.y) ? A : B;
      S.add(front.x + 0.02, front.y + 0.02, (g) => { L.groups.push(g);
        const conds = tr ? [[-1, 0], [1, 0]] : [[-0.3, 0], [0.3, 0]];   // distribution: two wires
        conds.forEach(([oo, lvl]) => { const a = att(A, oo, lvl), c = att(B, oo, lvl); L.cond.push(el("path", { d: sagPath(a, c, sag), stroke: "#262C3A", "stroke-width": tr ? 1.1 : 1.0, fill: "none" }, g)); });
        // pulses on both wires, evenly spaced and alternating: the second wire's run half a gap behind the first's
        conds.forEach(([oo, lvl], w) => { const d = sagPath(att(A, oo, lvl), att(B, oo, lvl), sag);
          L.f.push(pulse(g, d, ORANGE, false, w)); L.c.push(pulse(g, d, GREEN, false, w)); L.cb.push(pulse(g, d, GREEN, true, w)); }); }, set);
    }
    const pyl = (x, y, set, ax) => add(x, y, set, (g) => (ax === "x" ? K.pylon(g, x, y, 3.2, "x") : ISO.pylon(g, F, x, y, 3.2)));
    // a distribution pole: a wooden pole, a cross-arm, two insulators (the wires end on them)
    const poleAt = (x, y, ax, set) => S.add(x, y, (g) => { const h = 2.6, z = h - 0.12;
      K.quad(g, [[x - 0.04, y, 0], [x + 0.04, y, 0], [x + 0.04, y, h], [x - 0.04, y, h]], "#7E6247", { "stroke-width": 0.7 });
      K.seg(g, ax === "x" ? [x, y - 0.42, z] : [x - 0.42, y, z], ax === "x" ? [x, y + 0.42, z] : [x + 0.42, y, z], "#6D5A4A", 2.2);
      [-0.3, 0.3].forEach((o) => { const q = ax === "x" ? P(x, y + o, z) : P(x + o, y, z); el("rect", { x: q[0] - 1.6, y: q[1] - 5, width: 3.2, height: 5, fill: "#9AA3B5", stroke: "#262C3A", "stroke-width": 0.6 }, g); }); }, set);
    const chain = (id, set, sups, polesAx) => { sups.forEach((s) => { if (s.k === "pole") poleAt(s.x, s.y, polesAx, set); });
      for (let i = 1; i < sups.length; i++) span(id, set, sups[i - 1], sups[i]); };

    // the main substation in block (1,1): pad, fence, gantry facing the incoming line, transformers
    const SUBX = [[29.6, 15.2], [31.2, 15.2], [29.6, 17.2], [31.2, 17.2]];
    S.add(31.0, 17.0, (g) => { F.box(g, 29.2, 13.4, 0, 3.6, 6.0, 0.06, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" });
      K.fence(g, 29.2, 13.4, 32.8, 13.4, "#9AA3B5"); K.fence(g, 29.2, 13.4, 29.2, 19.4, "#9AA3B5"); K.gantry(g, 30.6, 13.8, "x"); SUBX.forEach(([x, y]) => K.xfmr(g, x, y));
      K.fence(g, 29.2, 19.4, 32.8, 19.4, "#9AA3B5"); K.fence(g, 32.8, 13.4, 32.8, 19.4, "#9AA3B5"); }, "sub");
    S.add(30.62, 14.6, (g) => { [[29.6, 15.2, -0.85], [31.2, 15.2, 0.85]].forEach(([x, y, o]) => K.seg(g, [30.6 + o, 13.8, 2.1], [x + 0.5, y + 0.45, 1.1], "#3E4860", 0.8)); }, "sub");
    // the transmission yard on the generation side of road 0: one gantry (its beam along gx) facing the substation's gantry
    // across the road; the power station feeds it now, the wind and solar lines join it later
    const GAN = { k: "gantry", x: 30.6, y: 13.8, ax: "x" }, YARD = { k: "gantry", x: 30.6, y: 9.6, ax: "x" };
    S.add(30.62, 9.62, (g) => { F.box(g, 29.4, 8.6, 0, 2.4, 1.6, 0.06, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" }); K.gantry(g, 30.6, 9.6, "x"); K.fence(g, 29.4, 10.2, 31.8, 10.2, "#9AA3B5"); }, "transG");
    span("tGas", "transG", { k: "xf", x: 33.3, y: 8.45 }, YARD);
    span("tTrunk", "transG", YARD, GAN);
    // distribution, clear of road 0: D1 west to the homes and D1 east to the high street run between the blocks' rows
    // (gy 17); D2 down gy road 1's west pavement; D3 along road 2's back pavement
    const pole = (x, y, ax) => ({ k: "pole", x, y, ax });
    const XF1 = { k: "xf", x: 30.1, y: 17.65 }, XF2 = { k: "xf", x: 31.7, y: 17.65 };
    chain("d1w", "dist", [XF1, pole(28.4, 17.0, "x"), pole(24.6, 17.0, "x"), pole(22.25, 17.0, "x"), pole(17.6, 17.0, "x"), pole(12.2, 17.0, "x"), pole(8.0, 17.0, "x"), pole(4.0, 17.0, "x"), pole(0.6, 17.0, "x")], "x");
    chain("d1e", "dist", [XF2, pole(34.1, 17.4, "y"), pole(34.1, 13.0, "y"), pole(34.1, 10.1, "y")], "y");
    chain("d1e2", "dist", [pole(34.1, 10.1, "x"), pole(38.0, 10.1, "x"), pole(42.0, 10.1, "x"), pole(46.2, 10.1, "x")], "x");
    chain("d2", "dist", [pole(22.25, 17.0, "y"), pole(22.25, 21.2, "y"), pole(22.25, 26.0, "y"), pole(22.25, 30.0, "y"), pole(22.25, 34.0, "y"), pole(22.25, 39.0, "y"), pole(22.25, 43.0, "y"), pole(22.25, 46.2, "y")], "y");
    chain("d3w", "dist3", [pole(22.25, 34.0, "x"), pole(17.0, 34.1, "x"), pole(13.0, 34.1, "x"), pole(9.9, 34.1, "x"), pole(5.2, 34.1, "x"), pole(0.6, 34.1, "x")], "x");
    chain("d3e", "dist3", [pole(22.25, 34.0, "x"), pole(26.0, 34.1, "x"), pole(30.0, 34.1, "x"), pole(33.2, 34.1, "x"), pole(37.6, 34.1, "x"), pole(42.0, 34.1, "x"), pole(46.2, 34.1, "x")], "x");

    // ================= highways (k=5): new homes and shops, cars, the fuel depot (imports) =================
    const HOMES = [[0.8, 13.6, "#B07466", "#E0785A"], [5.6, 13.6, "#A3695D", "#4AB4D6"], [0.8, 18.2, "#B9806F", "#FFCD00"], [5.6, 18.2, "#9C6457", "#A6D84A"]];
    HOMES.forEach(([x, y, roof, car]) => add(x + 1, y + 1, "homes", (g) => { ISO.house(g, F, x, y, 2.2, 1.6, 1.1, 0.8, roof); K.oldCar(g, x + 0.2, y + 2.0, car); }));
    [[12.6, 13.2, 2.0, 2.2, 2.6, "#E3DDD3", "#47B970"], [14.7, 13.2, 1.8, 2.2, 3.2, "#EDE6DA", "#E0785A"], [16.6, 13.2, 2.0, 2.2, 2.4, "#DCE3EA", "#4AB4D6"], [18.7, 13.2, 1.8, 2.2, 3.0, "#E8E0D2", "#FFCD00"], [20.6, 13.2, 1.6, 2.2, 2.6, "#E3DDD3", "#E0785A"]]
      .forEach(([x, y, w, d, h, c, aw], i) => add(x + w / 2, y + d / 2, "shops", (g) => K.shop(g, x, y, w, d, h, c, aw, { win: C.water, sign: ["#2F6F4E", "#B5302E", "#204C8A", "#8F6B4E", "#3E4860"][i] })));
    // the LNG import terminal (highways), tile 8: storage tanks on the quay, a jetty to the berth, a gas pipe to the power
    // plant (up the pavement of gy road 2 and across it), a carrier at the berth
    [[38.6, 13.4], [38.6, 16.0], [38.6, 18.6]].forEach(([x, y]) => add(x, y + 0.6, "depot", (g) => F.cyl(g, [x, y + 0.6, 0], "z", 0.95, 1.5, { side: "#E9EBEE", cap: "#C9CED6" })));
    add(41.4, 17.0, "depot", (g) => { [14.0, 16.6, 19.2].forEach((y) => K.seg(g, [39.5, y, 0.15], [42.0, y, 0.15], "#626E88", 2)); K.seg(g, [42.0, 13.6, 0.15], [42.0, 19.8, 0.15], "#626E88", 2.2); });
    add(37.4, 21.2, "depot", (g) => bx(g, 36.8, 20.5, 0, 1.2, 0.9, 0.8, "#F1F2F4", "#626E88"));
    add(36.3, 12.0, "depot", (g) => { K.seg(g, [37.6, 13.4, 0.2], [36.3, 13.4, 0.2], "#626E88", 2.2); K.seg(g, [36.3, 13.4, 0.2], [36.3, 9.0, 0.2], "#626E88", 2.2); K.seg(g, [36.3, 9.0, 0.2], [34.2, 9.0, 0.2], "#626E88", 2.2); });
    add(43.2, 20.4, "ship", (g) => {   // an LNG carrier along gy: dark hull, red waterline, four spherical tanks under domes, the bridge at the stern
      const x0 = 42.6, y0 = 13.0, h = bx(g, x0, y0, -0.1, 1.1, 6.2, 0.62, "#2F3A4E", "#C9CED6"); F.face(g, F.R, h, 0, 0, 6.2, 0.14, "#B5302E", { "stroke-width": 0.5 });
      K.quad(g, [[x0, y0 + 6.2, 0.52], [x0 + 0.55, y0 + 6.8, 0.52], [x0 + 1.1, y0 + 6.2, 0.52]], "#C9CED6", { "stroke-width": 0.7 }); K.quad(g, [[x0 + 1.1, y0 + 6.2, -0.1], [x0 + 0.55, y0 + 6.8, -0.1], [x0 + 0.55, y0 + 6.8, 0.52], [x0 + 1.1, y0 + 6.2, 0.52]], "#262C3A", { "stroke-width": 0.7 });
      bx(g, x0 + 0.1, y0 + 0.1, 0.52, 0.9, 1.0, 1.0, "#F1F2F4", "#FFFFFF"); bx(g, x0 + 0.35, y0 + 0.3, 1.52, 0.3, 0.3, 0.4, "#B5302E", "#3E4860");
      [y0 + 1.75, y0 + 2.95, y0 + 4.15, y0 + 5.35].forEach((y) => { const c = P(x0 + 0.55, y, 0.5), r = 15;
        el("path", { d: `M${c[0] - r} ${c[1]} A${r} ${r * 1.02} 0 0 1 ${c[0] + r} ${c[1]} Z`, fill: "#F3F4F6", stroke: "#000", "stroke-width": 0.8 }, g);
        el("path", { d: `M${c[0] - r} ${c[1]} Q${c[0]} ${c[1] + 5} ${c[0] + r} ${c[1]}`, fill: "#D8DBE6", stroke: "#000", "stroke-width": 0.6 }, g); }); });
    [[44.8, 13.4, "#4AB4D6"], [44.6, 20.4, "#E0785A"]].forEach(([x, y, c]) => add(x + 0.5, y + 0.2, "boats", (g) => VK.boatSmall(g, x, y, c)));

    // ================= internet (k=6): downtown towers, flats, the control centre, masts =================
    [[36.8, 0.6, 2.4, 2.4, 8.8, "#DCE3EA", "plant"], [40.0, 0.6, 2.4, 2.4, 10.4, "#C9D2DC", "pv"], [43.4, 0.8, 2.2, 2.0, 7.0, "#EDE6DA", "garden"]].forEach(([x, y, w, d, h, c, r]) => add(x + w / 2, y + d / 2, "towers", (g) => K.tower(g, x, y, w, d, h, c, C.water, r)));
    [[1.0, 25.4, 2.6, 2.4, 3.6, "#E3DDD3", "pv"], [5.2, 25.6, 2.4, 2.4, 3.2, "#F1F2F4", "pv"], [1.4, 29.4, 2.4, 2.2, 3.0, "#DCE3EA", "garden"], [7.4, 29.2, 2.4, 2.2, 3.4, "#EDE6DA", "pv"]]
      .forEach(([x, y, w, d, h, c, r]) => add(x + w / 2, y + d / 2, "flats", (g) => K.tower(g, x, y, w, d, h, c, C.water, r, { noShop: true })));
    add(26.8, 20.8, "cc", (g) => K.office(g, 24.9, 19.6, 3.8, 2.4, 2.2, 2, "#C9D6E3"));
    [[0.8, 21.6, 3.2], [45.8, 33.4, 3.4]].forEach(([x, y, h]) => add(x, y, "masts", (g) => VK.mast(g, x, y, h)));

    // ================= new ways of living (k=7): the park, cafés, people =================
    add(15.2, 30.0, "life", (g) => K.fountain(g, 15.2, 30.0, 0.8));
    [[13.4, 18.6, "#E0785A"], [17.2, 18.6, "#47B970"], [20.8, 18.6, "#FFCD00"]].forEach(([x, y, c]) => add(x, y, "life", (g) => K.table(g, x, y, c)));
    [[13.9, 18.9, { top: "#4AB4D6" }], [17.7, 19.0, { dress: true, top: "#E0785A" }], [21.2, 18.9, { top: "#8C6F9E", phone: true }], [15.4, 15.9, {}], [19.0, 16.0, { dress: true, top: "#47B970" }],
      [16.6, 30.8, { top: "#E0785A" }], [16.9, 31.0, { dress: true, top: "#47B970" }], [14.0, 28.8, { kid: true, top: "#FFCD00" }], [13.6, 21.9, { top: "#3E4860" }], [15.4, 22.0, { dress: true, top: "#E0785A", phone: true }],
      [2.6, 16.2, { top: "#4AB4D6" }], [27.0, 27.5, { kid: true, top: "#47B970" }], [30.2, 30.6, { dress: true, top: "#8C6F9E" }], [40.2, 21.2, { top: "#E0785A", hat: true }], [15.0, 40.6, { top: "#B5302E", hat: true }], [28.6, 39.6, { top: "#3E4860", hat: true }]]
      .forEach(([x, y, op]) => add(x, y, "life", (g) => K.person(g, x, y, Object.assign({ idle: true }, op))));

    // ================= the next age (k=8): wind farm, solar and batteries, their lines; solar on the row houses =================
    [[1.6, 1.2], [5.0, 0.8], [8.6, 1.6], [2.8, 4.6], [6.6, 4.4]].forEach(([x, y]) => add(x, y, "wind", (g) => ISO.turbine(g, F, x, y, 4.8)));
    add(8.4, 8.4, "wind", (g) => { F.box(g, 6.2, 7.6, 0, 3.8, 2.2, 0.06, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" }); K.xfmr(g, 6.5, 8.0); K.xfmr(g, 7.9, 8.0); K.gantry(g, 9.6, 8.9, "y"); });
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { const x = 12.6 + c * 2.4, y = 0.8 + r * 1.5; add(x, y, "solar", (g) => ISO.panel(g, F, x, y, 1.9, 0.95)); }
    [[20.0, 1.0], [20.0, 2.6], [20.0, 4.2], [20.0, 5.8]].forEach(([x, y]) => add(x + 0.9, y + 0.35, "batt", (g) => { const bb = bx(g, x, y, 0, 1.9, 0.7, 0.8, "#F1F2F4", "#FFFFFF"); for (let u = 0.2; u < 1.75; u += 0.35) F.face(g, F.L, bb, u, 0.12, u + 0.14, 0.62, "#C9CED6", { "stroke-width": 0.5 }); }));
    add(21.0, 8.4, "solar", (g) => { F.box(g, 19.6, 7.6, 0, 2.6, 2.2, 0.06, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" }); K.gantry(g, 20.6, 8.9, "y"); K.xfmr(g, 20.8, 7.7); });
    pyl(15.9, 8.9, "transW"); pyl(25.6, 8.9, "transE");
    const PW = { k: "pylon", x: 15.9, y: 8.9 }, PE = { k: "pylon", x: 25.6, y: 8.9 }, SG = { k: "gantry", x: 20.6, y: 8.9 };
    span("tW", "transW", { k: "gantry", x: 9.6, y: 8.9 }, PW); span("tW2", "transW", PW, SG);
    span("tE", "transE", SG, PE); span("tE2", "transE", PE, YARD);
    TER.forEach(([x, y, n]) => add(x + n * 0.47 + 0.01, y + 0.61, "terrpv", (g) => VK.terraceSolar(g, x, y, n, 1.4, 0, 2)));
    // rooftop solar on the homes too: two panels on each house's front roof slope (in the "terrpv" set, so it arrives,
    // lights up and mutes with the row houses' panels)
    HOMES.forEach(([x, y]) => add(x + 1.02, y + 1.02, "terrpv", (g) => { const ry = y + 0.8, ye = y + 1.76, z = (yy) => 1.9 + (1.04 - 1.9) * (yy - ry) / (ye - ry), y0 = y + 0.98, y1 = y + 1.58;
      [[x + 0.22, x + 1.02], [x + 1.18, x + 1.98]].forEach(([x0, x1]) => K.pvQuad(g, [x0, y1, z(y1)], [x1, y1, z(y1)], [x1, y0, z(y0)], [x0, y0, z(y0)], 3, 2)); }));

    // ================= electrostates (Act 2) =================
    // GA2: the EV charging hub in the park's front, chargers at the homes, heat pumps by the row houses; the chimney comes down
    add(16.4, 26.0, "hub", (g) => { const post = (x, y) => F.box(g, x, y, 0, 0.1, 0.1, 1.15, { left: C.g1, right: C.g2, top: C.w1 });
      [[13.4, 24.8], [18.4, 24.8]].forEach(([x, y]) => post(x, y));                              // the back posts
      [[13.7, 26.25, C.car], [15.25, 26.25, "#E0785A"], [16.8, 26.25, "#A6D84A"]].forEach(([x, y, c]) => { K.charger(g, x + 1.25, y - 0.3); K.car(g, x, y, c, "x"); });
      F.box(g, 13.3, 24.7, 1.15, 5.3, 2.3, 0.08, { left: C.w2, right: C.w3, top: C.pv }); for (let u = 13.8; u < 18.5; u += 0.55) K.seg(g, [u, 24.7, 1.23], [u, 27.0, 1.23], C.pvl, 0.6);
      [[13.4, 26.8], [18.4, 26.8]].forEach(([x, y]) => post(x, y)); });                          // the front posts, in front of everything
    HOMES.forEach(([x, y]) => add(x + 1.9, y + 2.2, "chg", (g) => { K.charger(g, x + 1.9, y + 2.2); const h = bx(g, x + 2.25, y + 0.3, 0, 0.42, 0.3, 0.4, "#F1F2F4", "#FFFFFF"); const c = P(x + 2.46, y + 0.6, 0.2); el("circle", { cx: c[0], cy: c[1], r: 2.8, fill: "#C9CED6", stroke: "#000", "stroke-width": 0.6 }, g); }));
    // GA3: the fuel depot goes; solar and wind on its site; solar on the farm
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = 36.8 + (c % 2) * 2.0, y = 12.8 + r * 1.3 + Math.floor(c / 2) * 3.9; add(x, y, "sol3", (g) => ISO.panel(g, F, x, y, 1.9, 0.9)); }
    [[44.4, 14.4], [45.0, 19.0]].forEach(([x, y]) => add(x, y, "sol3", (g) => ISO.turbine(g, F, x, y, 4.2)));   // offshore
    for (let c = 0; c < 3; c++) { const x = 25.0 + c * 2.4; add(x, 39.5, "farmpv", (g) => ISO.panel(g, F, x, 39.5, 1.9, 0.9)); }
    // GA4: data centres; GA5: a new electrified factory with solar on its roof
    [[36.8, 36.8], [41.6, 36.8], [36.8, 40.4], [41.6, 40.4]].forEach(([x, y]) => add(x + 2.1, y + 1.3, "dc", (g) => K.dataHall(g, x, y, 4.2, 2.6)));
    add(39.2, 31.4, "ind2", (g) => { K.factory(g, 37.0, 30.0, 4.4, 2.6, 2.0, "#9FB2C6"); });

    // ================= Act 3 additions =================
    // sensors and controls: small blue units on the poles and the substation; the control centre's dish
    const sense = [];
    [[12.2, 17.0], [4.0, 17.0], [38.0, 10.1], [42.0, 10.1], [22.25, 26.0], [22.25, 39.0], [13.0, 34.1], [37.6, 34.1], [32.6, 13.6]].forEach(([x, y]) => S.add(x + 0.01, y + 0.01, (g) => { sense.push(g); const q = P(x, y, 1.6);
      el("rect", { x: q[0] - 3.5, y: q[1] - 3.5, width: 7, height: 7, rx: 1.5, fill: "#2E6FB3", stroke: "#FFFFFF", "stroke-width": 1 }, g); }, "sense"));
    add(24.5, 19.4, "sense", (g) => { F.cyl(g, [24.5, 19.4, 0], "z", 0.07, 3.4, { side: "#9AA3B5", cap: "#626E88" }); const q = P(24.5, 19.4, 3.4); el("ellipse", { cx: q[0], cy: q[1], rx: 7, ry: 4, fill: "#F1F2F4", stroke: "#000", "stroke-width": 0.6 }, g); });
    // dynamic line rating: sensors clamped on the transmission conductors
    const dlr = [];
    [[12.6, 8.9, 1.5], [18.4, 8.9, 1.6], [23.2, 8.9, 1.6], [28.2, 9.2, 1.5]].forEach(([x, y, z]) => S.add(x + 0.2, y + 0.4, (g) => { dlr.push(g); const q = P(x, y, z + 0.6);
      el("rect", { x: q[0] - 4, y: q[1] - 2, width: 8, height: 6, rx: 2, fill: "#2E6FB3", stroke: "#FFFFFF", "stroke-width": 1 }, g); }, "dlr"));
    // connect: a new renewables zone in the fields (tile 13) and a new line along the front edge, past the village and the
    // farm, to a new substation for the data centres (tile 16)
    [[1.6, 37.4], [5.0, 37.0], [8.4, 37.6], [2.0, 41.2], [5.6, 41.0], [3.4, 44.6]].forEach(([x, y]) => add(x, y, "zone", (g) => ISO.turbine(g, F, x, y, 4.6)));
    add(8.6, 45.0, "zone", (g) => { F.box(g, 6.8, 44.2, 0, 3.2, 1.7, 0.06, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" }); K.xfmr(g, 7.1, 44.5); K.gantry(g, 9.4, 45.1, "y"); });
    const NL = [{ k: "pylon", x: 16.8, y: 45.1 }, { k: "pylon", x: 28.8, y: 45.1 }];
    NL.forEach((s) => pyl(s.x, s.y, "newline"));
    span("tNew", "newline", { k: "gantry", x: 9.4, y: 45.1 }, NL[0]); span("tNew", "newline", NL[0], NL[1]); span("tNew", "newline", NL[1], { k: "gantry", x: 37.2, y: 45.1 });
    S.add(38.6, 45.2, (g) => { F.box(g, 36.8, 43.8, 0, 3.6, 2.4, 0.06, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" }); K.gantry(g, 37.2, 45.1, "y"); K.xfmr(g, 38.4, 44.2); K.xfmr(g, 38.4, 45.3); }, "nsub");

    // ================= movers =================
    let train, fast, boat, boatG, cars0, cars2;
    S.lane(RY + 0.45, (g) => { train = convoy(g, N, VK.steamTrain(RY + 0.45, 3)); fast = el("g", { opacity: 0 }, g); K.train(fast, 0, RY + 0.42, 3, { stripe: GREEN }); });
    S.lane(RD[2][0] + 0.45, (g0) => { boatG = el("g", { opacity: 0 }, g0); boat = convoy(boatG, N, [[0, (g) => { const y = RD[2][0] + 0.45;
      F.box(g, -1.5, y, 0, 3.0, 0.55, 0.28, { left: "#2F5E4E", right: shade("#2F5E4E"), top: "#4E7F6C" }); const cab = F.box(g, -0.9, y + 0.07, 0.28, 1.8, 0.42, 0.34, { left: "#B5302E", right: shade("#B5302E"), top: "#E3D6C0" });
      for (let u = 0.2; u < 1.6; u += 0.45) F.face(g, F.L, cab, u, 0.1, u + 0.22, 0.26, "#FFE6A3", { "stroke-width": 0.5 }); }]]);
      cars2 = el("g", { opacity: 0 }, g0); [[4.0, "#E0785A"], [16.8, "#4AB4D6"], [29.0, "#FFCD00"]].forEach(([x, c]) => K.oldCar(cars2, x, RD[2][0] + 0.1, c)); [[10.4, "#A6D84A"], [38.6, "#8C6F9E"]].forEach(([x, c]) => K.oldCar(cars2, x, RD[2][0] + 0.85, c)); });
    S.lane(RD[0][0] + 0.1, (g) => { cars0 = el("g", { opacity: 0 }, g); [[6.0, "#E5C189"], [25.0, "#F1F2F4"]].forEach(([x, c]) => K.oldCar(cars0, x, RD[0][0] + 0.1, c)); [[15.6, "#E0785A"], [40.0, "#4AB4D6"]].forEach(([x, c]) => K.oldCar(cars0, x, RD[0][0] + 0.85, c)); });
    // used only by the interventions story (index4, js/story4.js): an HVDC converter station on the quay and its subsea
    // interconnector cable out across the sea to a neighbouring country beyond the tile's edge
    S.add(38.7, 21.3, (g) => { const h = bx(g, 37.0, 20.5, 0, 3.4, 1.5, 1.5, "#DCE3EA", "#EEF1F5"); for (let u = 0.4; u < 3.2; u += 0.7) F.face(g, F.L, h, u, 0.35, u + 0.4, 1.1, "#9FB2C6", { "stroke-width": 0.5 });
      [[40.6, 20.9], [40.6, 21.6]].forEach(([x, y]) => K.seg(g, [x, y, 0], [x, y, 1.0], "#626E88", 1.4)); }, "hvdc");
    S.add(44.0, 21.3, (g) => { const a = P(40.6, 21.25, 0), c = P(N, 21.25, 0); el("path", { d: `M${a[0]} ${a[1]} L${c[0]} ${c[1]}`, stroke: "#203772", "stroke-width": 3, "stroke-dasharray": "8 5", fill: "none" }, g); }, "hvdc");
    S.flush();
    // TEMP review markers: a numbered blue circle on each tile (1-16, row by row from the back corner), above everything and
    // never washed out. Set TILE_REFS to false (or delete this block) to remove them.
    const TILE_REFS = false;
    if (TILE_REFS) { const refs = el("g", { class: "tile-refs", "data-noink": "" }, S.root);
      for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const q = P(i * 12 + 5.25, j * 12 + 5.25, 0.2), n = j * 4 + i + 1;
        el("circle", { cx: q[0], cy: q[1], r: 30, fill: "#2E6FB3", stroke: "#FFFFFF", "stroke-width": 5 }, refs);
        el("text", { x: q[0], y: q[1] + 11, "text-anchor": "middle", "font-family": "Poppins", "font-weight": 600, "font-size": 32, fill: "#FFFFFF", text: String(n) }, refs); } }
    const st = S.sets, T = (...ns) => [].concat(...ns.map((n) => st[n] || []));
    // heavier strokes on the grid so it reads as a structure
    T("transG", "transW", "transE", "dist", "dist3", "sub", "newline", "nsub").forEach((g) => g.querySelectorAll("path, polyline, polygon, line").forEach((n) => { if (n.getAttribute("stroke-dasharray")) return; const w = parseFloat(n.getAttribute("stroke-width")) || 1; n.setAttribute("stroke-width", (w * 1.5).toFixed(2)); }));

    // ================= the timeline =================
    // things that are not there at the start
    const later = T("hvdc", "ship", "station", "ps", "psx", "ind", "chim", "terr", "city", "tel", "transG", "sub", "dist", "dist3", "homes", "shops", "depot", "towers", "flats", "cc", "masts", "life", "wind", "solar", "batt", "transW", "transE", "terrpv",
      "hub", "chg", "sol3", "farmpv", "dc", "ind2", "sense", "dlr", "zone", "newline", "nsub");
    gsap.set(later, { opacity: 0 });
    // flows: a state per line (f orange, c green, cb green back); only changes are written to the timeline
    const cur = {}; Object.keys(LINES).forEach((id) => (cur[id] = { f: 0, c: 0, cb: 0 }));
    const flows = (t, spec) => { if (spec.d1e && !spec.d1e2) spec = Object.assign({}, spec, { d1e2: spec.d1e }); Object.keys(LINES).forEach((id) => { const want = Object.assign({ f: 0, c: 0, cb: 0 }, spec[id] || {});
      ["f", "c", "cb"].forEach((k) => { if (cur[id][k] !== want[k]) { tl.to(LINES[id][k], { opacity: want[k], duration: 0.25 }, t); cur[id][k] = want[k]; } }); }); };
    const allLines = (v) => { const o = {}; Object.keys(LINES).forEach((id) => (o[id] = v)); return o; };
    // focus: everything not in the given sets is washed out; only changes are written
    const items = [...S.items.children], fcur = new Map(items.map((n) => [n, W0])); gsap.set(items.concat([S.ground]), { filter: W0 });
    let gcur = W0;
    // a node's top-level piece: an item (the train's lane, the cars' lanes) or a ground layer (the canal, the roads, a pad)
    const top = (n) => { while (n && n.parentNode !== S.items && n.parentNode !== G) n = n.parentNode; return n; };
    // the highlight look mutes the ground layer by layer, so the canal, the railway or the roads can stay in colour
    const gkids = HL ? [...G.children] : [], gkcur = new Map(gkids.map((n) => [n, W0]));
    if (HL) gsap.set(gkids, { filter: W0 });
    const PADS = { ps: padPS, sub: padSub, terr: padTerr, ind: padInd, towers: padDown, shops: padShops, flats: padFlats, dc: padDC, depot: padDepot };
    const focus = (t, sets, wash, ground) => {
      const names = sets ? sets.filter((x) => typeof x === "string") : [], nodes = sets ? sets.filter((x) => typeof x !== "string").flat().map(top) : [];
      const keep = new Set(sets ? T(...names).concat(nodes) : items); wash = HL ? MUTE : (wash || WASH);
      items.forEach((n) => { const want = keep.has(n) ? W0 : wash; if (fcur.get(n) !== want) { tl.to(n, { filter: want, duration: 0.35 }, t); fcur.set(n, want); } });
      if (HL) { const gk = new Set(nodes.concat(names.map((k) => PADS[k]).filter(Boolean)));
        gkids.forEach((n) => { const want = !sets || gk.has(n) ? W0 : MUTEG; if (gkcur.get(n) !== want) { tl.to(n, { filter: want, duration: 0.35 }, t); gkcur.set(n, want); } }); return; }
      const gw = sets ? (ground || wash) : W0; if (gw !== gcur) { tl.to(S.ground, { filter: gw, duration: 0.35 }, t); gcur = gw; } };
    // the camera: a point of the land brought to the right half of the screen, at a zoom
    const cam = { tx: 680, ty: 90, s: 0.4 }; const setCam = () => S.root.setAttribute("transform", `translate(${cam.tx.toFixed(1)} ${cam.ty.toFixed(1)}) scale(${cam.s.toFixed(4)})`);
    const camAt = (x, y, s) => { const q = P(x, y); return { tx: 1010 - s * q[0], ty: 470 - s * q[1], s }; };
    const HOME = (() => { const h = camAt(23.25, 23.25, 0.5); h.tx -= 70; h.ty += 45; return h; })(); Object.assign(cam, HOME); setCam();   // the default view: closer than the whole tile (its far corners crop)
    let camCur = "home";
    const look = (t, x, y, s) => { const key = x == null ? "home" : `${x},${y},${s}`; if (key === camCur) return; camCur = key; tl.to(cam, Object.assign({}, x == null ? HOME : camAt(x, y, s), { duration: 0.6, ease: "power2.inOut", onUpdate: setCam }), t); };

    // ---- Act 1 ----
    const hl = (t, sets, view) => { if (!HL) return; focus(t, sets); view ? look(t, ...view) : look(t); };   // the highlight look also moves the camera to the beat
    // k=2 canals
    tl.to(laneR2, { opacity: 0, duration: 0.2 }, b(2)); tl.to(canal, { opacity: 1, duration: 0.3 }, b(2));
    tl.set(boatG, { opacity: 1 }, b(2) + 0.2); boat.at(-4); boat.to(tl, 18, { duration: 0.8, ease: "power1.out" }, b(2) + 0.2);
    hl(b(2), [boatG, canal], [18, 23.5, 0.6]);
    // k=3 railways
    tl.to(laneR1, { opacity: 0, duration: 0.2 }, b(3)); tl.to(bed, { opacity: 1, duration: 0.15 }, b(3));
    rails.forEach((r) => drawOn(tl, r, b(3), 0.45)); tl.to(sleepers, { opacity: 1, duration: 0.04, stagger: 0.45 / sleepers.length, ease: "none" }, b(3));
    rise(tl, T("station"), b(3) + 0.2); train.at(-8); train.to(tl, 16, { duration: 0.45, ease: "power1.out" }, b(3) + 0.25);
    sink(tl, T("mill"), b(3) + 0.4); tl.to([padPS, padInd, padTerr, padDown], { opacity: 1, duration: 0.2 }, b(3) + 0.45);
    rise(tl, T("ps", "psx", "ind", "chim"), b(3) + 0.5, { stagger: 0.05 }); rise(tl, T("terr"), b(3) + 0.6, { stagger: 0.05 }); rise(tl, T("city"), b(3) + 0.55, { stagger: 0.04 });
    train.to(tl, 52, { duration: 0.6, ease: "power1.in" }, b(3) + 0.8);
    hl(b(3), ["station", "ps", "psx", "ind", "chim", "terr", "city", fast, bed, rails, sleepers]);
    // k=4 telephone lines, and the grid of the age: the power station's line, the substation, distribution poles
    tl.to(skies[1], { opacity: 1, duration: 0.4 }, b(4) - 0.1);
    rise(tl, T("tel"), b(4)); tl.to(padSub, { opacity: 1, duration: 0.2 }, b(4) + 0.1);
    rise(tl, T("sub", "transG"), b(4) + 0.15, { stagger: 0.04 }); rise(tl, T("dist"), b(4) + 0.3, { stagger: 0.012 });
    flows(b(4) + 0.7, { tGas: { f: 1 }, tTrunk: { f: 1 }, d1w: { f: 1 }, d1e: { f: 1 }, d2: { f: 1 } });
    hl(b(4), ["ps", "psx", "sub", "transG", "dist"], [27, 12, 0.66]);
    // k=5 highways: the canal is paved over; new homes and shops; cars; the fuel depot; D3
    tl.to(boatG, { opacity: 0, duration: 0.15 }, b(5) - 0.05);
    tl.to(roads, { opacity: 1, duration: 0.35 }, b(5)); tl.to([lanes, canal], { opacity: 0, duration: 0.3 }, b(5) + 0.1);
    tl.to([cars0, cars2], { opacity: 1, duration: 0.25 }, b(5) + 0.35);
    sink(tl, T("old", "oldshops"), b(5) + 0.3); tl.to([padShops, padDepot], { opacity: 1, duration: 0.2 }, b(5) + 0.35);
    rise(tl, T("homes", "shops"), b(5) + 0.45, { stagger: 0.04 }); rise(tl, T("depot"), b(5) + 0.55, { stagger: 0.04 });
    tl.to(T("boats"), { opacity: 0, duration: 0.2 }, b(5) + 0.3);
    tl.fromTo(T("ship"), Object.assign({ opacity: 0 }, along(null, 6)), Object.assign(along(null, 0), { opacity: 1, duration: 0.45, ease: "power2.out" }), b(5) + 0.5); rise(tl, T("dist3"), b(5) + 0.5, { stagger: 0.012 });
    flows(b(5) + 0.85, { tGas: { f: 1 }, tTrunk: { f: 1 }, d1w: { f: 1 }, d1e: { f: 1 }, d2: { f: 1 }, d3w: { f: 1 }, d3e: { f: 1 } });
    hl(b(5), ["homes", "shops", "depot", "ship", "dist3", cars0, cars2, roads]);
    // k=6 internet cables: towers, flats, the control centre, masts
    tl.to(padFlats, { opacity: 1, duration: 0.2 }, b(6)); rise(tl, T("towers", "flats", "cc"), b(6) + 0.1, { stagger: 0.05, dur: 0.35 }); rise(tl, T("masts"), b(6) + 0.3, { stagger: 0.1 });
    hl(b(6), ["towers", "flats", "cc", "masts"]);
    // k=7 new ways of living
    hl(b(7), ["life", cars0, cars2, fast, roads]);
    rise(tl, T("life"), b(7), { stagger: 0.01, dur: 0.2 });
    tl.fromTo(fast, Object.assign({ opacity: 0 }, along(fast, -2)), Object.assign(along(fast, 50), { opacity: 1, duration: 0.9, ease: "power1.inOut" }), b(7) + 0.1); tl.to(fast, { opacity: 0, duration: 0.1 }, b(7) + 0.9);
    tl.to([cars0, cars2], Object.assign(along(null, 3), { duration: 0.8, ease: "power1.inOut" }), b(7) + 0.1);
    hl(b(8), ["wind", "solar", "batt", "transW", "transE", "terrpv"], [13, 6, 0.72]);
    // k=8 the next age runs on electricity: wind, solar, batteries, their lines, solar on the row houses
    rise(tl, T("wind", "solar", "batt"), b(8), { stagger: 0.015 }); rise(tl, T("transW", "transE"), b(8) + 0.25, { stagger: 0.04 }); rise(tl, T("terrpv"), b(8) + 0.35, { stagger: 0.04 });
    const MIX = { f: 1, c: 1 };
    flows(b(8) + 0.6, { tGas: { f: 1 }, tTrunk: MIX, tW: { c: 1 }, tW2: { c: 1 }, tE: { c: 1 }, tE2: { c: 1 }, d1w: MIX, d1e: MIX, d2: MIX, d3w: MIX, d3e: MIX });
    const NOW = { tGas: { f: 1 }, tTrunk: MIX, tW: { c: 1 }, tW2: { c: 1 }, tE: { c: 1 }, tE2: { c: 1 }, d1w: MIX, d1e: MIX, d2: MIX, d3w: MIX, d3e: MIX };

    hl(b(9), null);
    // ---- Act 2 ----
    hl(b(11), ["life", "towers", "flats", "cc", "masts", cars0, cars2, fast, roads]);
    tl.fromTo(fast, Object.assign({ opacity: 0 }, along(fast, -2)), Object.assign(along(fast, 50), { opacity: 1, duration: 0.8, ease: "power1.inOut", immediateRender: false }), b(11) + 0.1);
    tl.to(fast, { opacity: 0, duration: 0.08 }, b(11) + 0.85);
    tl.to([cars0, cars2], Object.assign(along(null, 7), { duration: 0.7, ease: "power1.inOut" }), b(11) + 0.1);
    const GRID = ["transG", "transW", "transE", "sub", "dist", "dist3", "batt"];
    const USERS = ["homes", "shops", "terr", "terrpv", "ind", "chim", "city", "towers", "flats", "cc", "station", "village", "farm", "depot"];
    focus(b(12), GRID, WASH2);                                                       // E2 the grid stayed the same
    focus(b(13), USERS, WASH2); flows(b(13), {});                                     // E3 hungrier for power: the users
    focus(b(14) + 0.3, null); flows(b(14) + 0.3, NOW);                                // GA1 electrostates
    hl(b(15), ["hub", "chg", "homes", "terr", "ind", "station", fast], [18, 24, 0.6]);
    rise(tl, T("hub", "chg"), b(15) + 0.1, { stagger: 0.04 }); sink(tl, T("chim"), b(15) + 0.3);   // GA2
    tl.fromTo(fast, Object.assign({ opacity: 0 }, along(fast, -2)), Object.assign(along(fast, 50), { opacity: 1, duration: 0.8, ease: "power1.inOut", immediateRender: false }), b(15) + 0.1);
    tl.to(fast, { opacity: 0, duration: 0.08 }, b(15) + 0.85);
    tl.to(T("ship"), Object.assign(along(null, 7), { opacity: 0, duration: 0.45, ease: "power1.in" }), b(16) - 0.05); sink(tl, T("depot"), b(16) + 0.25); rise(tl, T("sol3", "farmpv"), b(16) + 0.3, { stagger: 0.03 });   // GA3
    hl(b(16), ["sol3", "farmpv", "wind", "solar", "ship", "depot"], [39, 16.5, 0.7]);
    tl.to(padDC, { opacity: 1, duration: 0.2 }, b(17)); rise(tl, T("dc"), b(17) + 0.1, { stagger: 0.12, dur: 0.35 });   // GA4
    hl(b(17), ["dc"], [40, 40, 0.78]);
    rise(tl, T("ind2"), b(18) + 0.1, { dur: 0.35 });                                  // GA5
    hl(b(18), ["ind2", "ind", "dc", "hub"], [38, 30, 0.7]); hl(b(19), null);

    // ---- Act 3: one state per card ----
    const ALLG = ["ps", "psx", "wind", "solar", "batt", "transG", "transW", "transE", "sub", "dist", "dist3", "sol3", "farmpv", "terrpv"];
    const GREENALL = { tW: { c: 1 }, tW2: { c: 1 }, tE: { c: 1 }, tE2: { c: 1 }, tTrunk: { c: 1 }, d1w: { c: 1 }, d1e: { c: 1 }, d2: { c: 1 }, d3w: { c: 1 }, d3e: { c: 1 } };
    const A3 = (k) => b(20 + k);
    // 1 the old grid: one way, from a few big power stations
    focus(A3(0), ["ps", "psx", "transG", "transW", "transE", "sub", "dist", "dist3"]);
    flows(A3(0), { tGas: { f: 1 }, tTrunk: { f: 1 }, d1w: { f: 1 }, d1e: { f: 1 }, d2: { f: 1 }, d3w: { f: 1 }, d3e: { f: 1 } });
    // 2 generation spread across the country
    focus(A3(1), ALLG); flows(A3(1), Object.assign({}, GREENALL, { tGas: { f: 1 }, tTrunk: MIX }));
    // 3 power flows both ways: the row houses and homes draw power and send it back
    focus(A3(2), ["terr", "terrpv", "homes", "chg", "dist", "dist3"]); look(A3(2), 28.0, 29.0, 0.75);
    flows(A3(2), Object.assign({}, GREENALL, { d3w: { c: 1, cb: 1 }, d3e: { c: 1, cb: 1 }, d1w: { c: 1, cb: 1 }, d2: { c: 1, cb: 1 } }));
    // 4 no longer dependent on a few big plants: the power station stands down
    focus(A3(3), ["wind", "solar", "batt", "transW", "transE", "sub", "dist", "dist3", "sol3", "farmpv", "terrpv", "transG"]); look(A3(3));
    flows(A3(3), Object.assign({}, GREENALL, { d3w: { c: 1, cb: 1 }, d3e: { c: 1, cb: 1 }, d1w: { c: 1, cb: 1 } }));
    // 5 smart devices and digitalisation: see and control the grid
    rise(tl, T("sense"), A3(4) + 0.1, { stagger: 0.03 }); focus(A3(4), ["cc", "sense", "sub", "dist", "dist3", "transG", "transW", "transE"]); look(A3(4), 28.0, 18.0, 0.72);
    // 6 EVs charge and heating turns on when power is plentiful and cheap
    focus(A3(5), ["hub", "chg", "homes", "dist", "sense"]); look(A3(5), 12.0, 22.0, 0.7);
    // 7 batteries store surplus and release it when generation falls
    focus(A3(6), ["batt", "solar", "transE", "sense"]); look(A3(6), 18.0, 4.5, 0.8);
    flows(A3(6), Object.assign({}, GREENALL, { tE: { c: 1, cb: 1 }, d3w: { c: 1, cb: 1 }, d3e: { c: 1, cb: 1 }, d1w: { c: 1, cb: 1 } }));
    // 8 bills fall, the system runs better, more with the existing grid
    focus(A3(7), null); look(A3(7)); flows(A3(7), Object.assign({}, GREENALL, { d3w: { c: 1, cb: 1 }, d3e: { c: 1, cb: 1 }, d1w: { c: 1, cb: 1 } }));
    // 9 lines fitted with sensors carry more when the weather allows
    rise(tl, T("dlr"), A3(8) + 0.15, { stagger: 0.05 }); focus(A3(8), ["transW", "transE", "transG", "dlr", "sub", "wind", "solar"]); look(A3(8), 20.0, 8.5, 0.72);
    // 10 advanced cables carry much more on the same towers: the conductors are restrung, more power runs on them
    const TR = ["tW", "tW2", "tE", "tE2", "tTrunk"];
    TR.forEach((id) => { tl.to(LINES[id].cond, { attr: { stroke: "#2E6FB3", "stroke-width": 2.4 }, duration: 0.3 }, A3(9) + 0.1); LINES[id].c.forEach((g) => { tl.call(() => g.classList.add("dense"), null, A3(9) + 0.2); tl.call(() => g.classList.remove("dense"), null, A3(9) + 0.19); }); });
    look(A3(9), 20.0, 9.0, 0.6);
    // 11 the modern grid: digital, flexible, smarter about how it grows
    focus(A3(10), null); look(A3(10));
    // 12 new lines planned and built with today's technology: a new zone, a new line, a new substation for the data centres
    rise(tl, T("zone"), A3(11) + 0.05, { stagger: 0.03 }); rise(tl, T("newline"), A3(11) + 0.25, { stagger: 0.05 }); rise(tl, T("nsub"), A3(11) + 0.35, { stagger: 0.05 });
    focus(A3(11), ["zone", "newline", "nsub", "dc"]); look(A3(11), 22.0, 39.0, 0.5);
    // 13 the queues clear: the new zone and the data centres come online
    flows(A3(12) + 0.15, Object.assign({}, GREENALL, { tNew: { c: 1 }, dcL: { c: 1 }, d3w: { c: 1, cb: 1 }, d3e: { c: 1, cb: 1 }, d1w: { c: 1, cb: 1 } }));
    // 14 the modern grid
    focus(A3(13), null); look(A3(13));
    ISO.tweens.forEach((t) => t.play && t.play());
    hold(tl, 33);
    // a handle for js/story4.js, which drives a second copy of this city through the interventions
    svg.__oc = { S, T, P, cam, setCam, camAt, HOME, items, W0, WASH: HL ? MUTE : WASH, WASH2, GWASH: HL ? MUTEG : null };
    return tl;
  }

  Object.assign(window.SCENES, { onecity });
})();
