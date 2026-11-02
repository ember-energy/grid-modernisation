/* Act 1, "Transformative infrastructure" (section D): one landscape that evolves, in the manner of section I.
   A quiet valley by the sea. A railway is laid and a train arrives; mills, terraces and a brick city rise along the line.
   A highway replaces the country lane, and roadside businesses open along it. Telephone lines and masts go up, wireless
   signals rise from the buildings, information flows, and modern buildings rise. Then a fast electric train,
   a town square full of life, and a modern grid: wind on the farm, pylons up the valley, a substation, solar on the roofs. Built with the stage kit of
   js/iso-scenes2.js (window.ISOSTAGE); one beat per text card. */
(function () {
  if (!window.CLEAN || !window.ISOSCENES || !window.ISOSTAGE) return;
  const { el } = SVG;
  const { C } = ISO;
  const { K, sky } = ISOSCENES;
  const { stage, sprout, shrink, drawOn, along, convoy, steamParts, field, cottage, people, live } = ISOSTAGE;
  const beat = KIT.beat, hold = (tl, n) => tl.to({}, { duration: 0.001 }, n + 0.1);
  const P = (x, y, z) => ISO.P(x, y, z || 0);
  const F = ISO.frame([0, 0], 1);
  const shade = (h) => ISO.mixHex(h, "#000000", 0.16), lite = (h) => ISO.mixHex(h, "#FFFFFF", 0.35);
  const bx = (g, x, y, z, w, d, h, col, top) => F.box(g, x, y, z, w, d, h, { left: col, right: shade(col), top: top || lite(col) });

  // solar panels on the front slope of a terrace's roofs (houses k0, k0 + step, ...); the slope runs from the ridge at y + 0.6
  // (height h + 0.45) down to the eaves at y + 1.2 (height h)
  const terraceSolar = (g, x, y, n, h, k0, step) => { const z = (yy) => h + 0.45 - 0.75 * (yy - y - 0.6) + 0.03;
    for (let k = k0; k < n; k += step) { const x0 = x + k * 0.95, y0 = y + 0.72, y1 = y + 1.1;
      K.pvQuad(g, [x0 + 0.14, y1, z(y1)], [x0 + 0.81, y1, z(y1)], [x0 + 0.81, y0, z(y0)], [x0 + 0.14, y0, z(y0)], 3, 2); } };

  function journey(svg) {
    const tl = gsap.timeline({ paused: true });
    let greyed = [];   // what section E greys out (GA brings it back)
    // index2/index3 (data-variant="v2"): the new script's order, a canal first, telephone lines before highways, and a
    // last beat of power along the new line. One beat per card of index2: k=1 canals, 2 railways, 3 telephone lines,
    // 4 highways, 5 internet cables (the five terms of one held card), 6 new ways of living, 7 electricity, 8 the choice.
    // index3 re-times this same timeline to its three cards with data-remap (js/main.js).
    // data-variant="v2e" (index2, section E): the same valley, starting where section C ends, for Act 2's three cards.
    // data-variant="v2all" (index2): one section for both: section C's cards, then Act 2's on the same picture.
    // data-variant="v2ga" (index2, section GA): the same valley as it stands at the end of B, then the electrostate cards on it.
    const GA = svg.dataset.variant === "v2ga", ALL = svg.dataset.variant === "v2all" || GA, V2E = svg.dataset.variant === "v2e", V2 = svg.dataset.variant === "v2" || V2E || ALL, GL = V2 ? "gridLine" : "grid";
    live(svg);
    // the sky changes with the age: warm for the railways, clear blue for the highways, cool for the telecoms
    const skies = [["iso-sky-j1", [["0", "#FBF4E2"], ["0.7", "#EFE6CF"], ["1", "#E2DAC4"]]], ["iso-sky-j2", [["0", "#F2F8FD"], ["0.7", "#DCEBF7"], ["1", "#CFE2F2"]]], ["iso-sky-j3", [["0", "#EEF4FA"], ["0.7", "#DCE8F3"], ["1", "#CCDDEE"]]]]
      .map(([id, st], i) => { const r = sky(svg, id + (svg.id || ""), st); if (i) r.setAttribute("opacity", 0); return r; });
    const N = 30, M = 30, S = stage(svg, { N, M, s: 0.64, tx: 470, ty: 160, ground: "#DCEBC9" }), G = S.ground;
    const RY = 9.8, HY = 18.4, BAYX = 21.5, BAYY = 22.6;

    // ---------- the ground ----------
    const farm = el("g", null, G), town = el("g", { opacity: 0 }, G);
    field(farm, 0.4, 0.4, 7.4, 4.2, "#E8E0B8", "#D6CB98"); field(farm, 8.0, 0.4, 15.6, 4.0, "#CFE3B8"); field(farm, 16.2, 0.4, 23.4, 4.4, "#E8E0B8", "#D6CB98"); field(farm, 24.0, 0.4, 29.6, 5.2, "#CFE3B8");
    field(farm, 0.6, 11.6, 7.0, 16.6, "#D7E8C0"); field(farm, 19.6, 11.6, 29.4, 16.8, "#E8E0B8", "#D6CB98");
    K.rect(farm, 0, HY + 0.9, N, HY + 1.9, "#E3D6B0", 0.8);   // the country lane, where the highway will run
    field(G, 0.4, 23.0, 8.6, 29.6, "#E8E0B8", "#D6CB98"); field(G, 9.2, 25.6, 20.6, 29.6, "#CFE3B8");
    { const R = (a, b, c, d, col, sw) => K.rect(town, a, b, c, d, col, sw == null ? 0.8 : sw);
      R(0.4, 4.4, 29.6, 8.8, "#D8D2C4"); R(0.4, 11.4, 29.6, 17.4, "#E3DDD0"); [[13.8, 14.4]].forEach(([a, b]) => R(0.4, a, 29.6, b, "#C9C0AC")); }
    // the bay at the front right, with its beach
    if (!V2) { K.rect(G, BAYX - 0.5, BAYY - 0.5, N, BAYY, "#EFE3BC", 0.6); K.rect(G, BAYX - 0.5, BAYY, BAYX, M, "#EFE3BC", 0.6); K.rect(G, BAYX, BAYY, N, M, C.water, 1); }
    else field(farm, BAYX, 23.0, 29.6, 29.6, "#E8E0B8", "#D6CB98");   // index2: no bay; a field, later the grid's yard
    // the harbour (index2): a basin in the back corner with a stone quay; the fuel import terminal comes with the highways
    if (V2) { K.rect(G, 19.0, 0, N, 2.75, "#C9C0AC", 0.8); K.rect(G, 19.0, 0, N, 2.45, "#8FC6E4", 1); K.lineGX(G, 2.45, 19.0, N, 0, "#6E8FA8", 1.2); }
    // the canal (index2/index3 only): where the country lane runs, later paved over by the highway
    const canalSegs = [], canalG = el("g", null, G);
    if (V2) { const C0 = HY + 0.85, C1 = HY + 2.0;
      for (let x = 0; x < N; x += 1) { const g = el("g", { opacity: 0 }, canalG); K.rect(g, x, C0, x + 1, C1, "#C9BFA6", 0); K.rect(g, x, C0 + 0.18, x + 1, C1 - 0.18, "#8FC6E4", 0);
        K.lineGX(g, C0 + 0.18, x, x + 1, 0, "#6E8FA8", 1); K.lineGX(g, C1 - 0.18, x, x + 1, 0, "#6E8FA8", 1);
        if (x === 8 || x === 9) { const a = P(x + 0.5, C0 + 0.18), b = P(x + 0.5, C1 - 0.18); el("path", { d: `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`, stroke: "#5B4A42", "stroke-width": 2.4 }, g); }   // a lock
        canalSegs.push(g); } }
    // the railway (laid in D2)
    const bed = el("g", { opacity: 0 }, G); K.rect(bed, 0, RY - 0.1, N, RY + 1.2, "#CFC8BE", 1);
    const slp = el("g", null, G), sleepers = [];
    for (let x = 0.2; x < N; x += 0.42) { const a = P(x, RY + 0.12), b = P(x, RY + 0.95); sleepers.push(el("path", { d: `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`, stroke: "#8F7A6E", "stroke-width": 1.6, opacity: 0 }, slp)); }
    const rails = [RY + 0.2, RY + 0.8].map((y) => K.lineGX(G, y, 0, N, 0, "#3E4860", 1.5));
    // the highway (laid in E1): two carriageways and a grass median, section by section from the left
    const segs = [];
    for (let x = 0; x < N; x += 1) { const g = el("g", { opacity: 0 }, G); K.rect(g, x, HY - 0.3, x + 1, HY + 3.4, "#E9EBEE", 0); K.rect(g, x, HY, x + 1, HY + 1.3, "#5B6478", 0); K.rect(g, x, HY + 1.8, x + 1, HY + 3.1, "#5B6478", 0); K.rect(g, x, HY + 1.3, x + 1, HY + 1.8, "#A9D69B", 0);
      [HY + 0.65, HY + 2.45].forEach((y) => K.lineGX(g, y, x + 0.15, x + 0.65, 0, "#FFFFFF", 1.5)); segs.push(g); }
    const edges = el("g", { opacity: 0 }, G); [HY, HY + 1.3, HY + 1.8, HY + 3.1].forEach((y) => K.lineGX(edges, y, 0, N, 0, "#3E4860", 1));

    // ---------- D2: the quiet valley ----------
    [[3.2, 12.2, "#8F7A6E"], [10.0, 13.0, "#B77464"], [16.0, 12.0, "#C9A15A"]].forEach(([x, y, r]) => S.add(x + 1, y + 0.7, (g) => cottage(g, x, y, r), "rural"));
    S.add(12.0, 2.6, (g) => K.mill(g, 12.0, 2.6), "rural");
    [[3.0, 2.4], [18.4, 2.2]].forEach(([x, y]) => S.add(x, y, (g) => K.hay(g, x, y), "rural"));
    [[6.6, 6.8], [15.0, 6.2, "dark"], [24.2, 7.4, "pine"], [27.8, 3.6], [22.0, 13.6, "dark"], [8.0, 15.8]].forEach(([x, y, k]) => S.add(x, y, (g) => K.tree(g, x, y, 1, k), "rural"));
    [[20.2, 4.6, 1], [21.8, 5.6, -1]].forEach(([x, y, d], i) => S.add(x, y, (g) => K.sheep(g, x, y, { dir: d, graze: i === 0 }), "rural"));
    [[24.6, 14.4, 1], [26.6, 15.4, -1]].forEach(([x, y, d]) => S.add(x, y, (g) => K.cow(g, x, y, { dir: d }), "rural"));
    // the farm at the front stays through every age
    S.add(4.4, 25.4, (g) => cottage(g, 3.4, 24.6, "#B77464"));
    [[1.6, 28.6, "dark"], [9.6, 28.0], [15.6, 29.0, "pine"], [7.2, 23.4, "round"]].forEach(([x, y, k]) => S.add(x, y, (g) => K.tree(g, x, y, 1, k)));
    S.add(6.6, 27.4, (g) => K.cow(g, 6.6, 27.4, { dir: 1 }));
    // the railway's own buildings (D2): a station and a signal
    S.add(14.6, 8.6, (g) => { const s = bx(g, 13.0, 7.8, 0, 3.2, 1.5, 1.4, "#C9A988", "#E3D6C0"); for (let u = 0.3; u < 3; u += 0.55) F.face(g, F.L, s, u, 0.4, u + 0.3, 1.0, "#FFE6A3", { "stroke-width": 0.5 });
      K.quad(g, [[12.9, 7.7, 1.4], [16.3, 7.7, 1.4], [16.3, 8.55, 2.0], [12.9, 8.55, 2.0]], "#6E6A72", { "stroke-width": 0.8 }); K.quad(g, [[12.9, 9.4, 1.4], [16.3, 9.4, 1.4], [16.3, 8.55, 2.0], [12.9, 8.55, 2.0]], "#8F8784", { "stroke-width": 0.8 }); }, "laid");
    S.add(9.0, 9.4, (g) => { K.quad(g, [[9.0, 9.4, 0], [9.06, 9.4, 0], [9.06, 9.4, 2.0], [9.0, 9.4, 2.0]], "#3E4860", { "stroke-width": 0.5 }); K.quad(g, [[9.06, 9.4, 1.75], [9.6, 9.4, 1.6], [9.6, 9.4, 1.72], [9.06, 9.4, 1.88]], "#B5302E", { "stroke-width": 0.6 }); }, "laid");

    // ---------- D4: mills, terraces and a brick city along the line ----------
    [[1.6, 4.8, 3.4, 2.4, 2.2, "#B7795E"], [19.2, 4.6, 3.4, 2.6, 2.4, "#A9876A"]].forEach(([x, y, w, d, h, c]) => S.add(x + w / 2, y + d / 2, (g) => K.factory(g, x, y, w, d, h, c), "mills"));
    [[5.4, 5.0, 4.8], [23.0, 4.8, 5.2]].forEach(([x, y, h]) => S.add(x, y, (g) => K.chimney(g, x, y, h), V2 ? "chim" : "mills"));
    S.add(26.4, 7.8, (g) => { const w = bx(g, 24.8, 7.0, 0, 3.4, 1.5, 1.6, "#B7795E", "#C9A988"); for (let u = 0.3; u < 3.2; u += 0.6) F.face(g, F.L, w, u, 0.4, u + 0.3, 0.9, "#FFE6A3", { "stroke-width": 0.5 }); }, "mills");
    // the brick city: spread along the back (index.html), or grouped into one block behind the square (index2)
    const CITYX = V2 ? [8.4, 10.3, 12.2, 14.1, 16.0] : [1.0, 6.4, 11.8, 17.2, 22.6];
    CITYX.forEach((x, k) => { const h = (V2 ? [3.2, 4.4, 3.6, 5.0, 3.0][k] : 2.6 + ((x * 13) % 5) * 0.6), c = ["#C9B8A8", "#BFAE9E", "#D3C4B6"][Math.round(x) % 3]; S.add(x + 0.9, 0.9, (g) => K.tower(g, x, 0.2, 1.8, 1.4, h, c, "#E9DFC9", "none", { punched: true, noShop: true, floor: 0.8 }), "city"); });
    [[1.4, 11.8, 8, "#B7795E"], [12.6, 11.8, 7, "#C9A988"], [3.4, 15.0, 9, "#A9876A"], [15.0, 15.0, 6, "#B7795E"]].concat(V2 ? [[9.4, 11.8, 3, "#A9876A"], [0.4, 15.0, 3, "#C9A988"], [12.1, 15.0, 3, "#C9A988"]] : []).forEach(([x, y, n, c]) => S.add(x + n * 0.47, y + 0.6, (g) => K.terrace(g, x, y, n, 1.4, c), "terr"));
    people(S, [[9.8, 14.2, { cap: "#5B4A42", top: "#4AB4D6" }], [10.2, 14.3, { dress: true, top: "#E5C189", long: true }], [20.4, 14.2, { hat: true, top: "#3E4860" }]], "terr");

    // ---------- E2: roadside businesses, and homes with cars ----------
    S.add(4.4, 23.4, (g) => { [[3.4, 22.8], [5.4, 22.8], [3.4, 24.0], [5.4, 24.0]].forEach(([x, y]) => bx(g, x, y, 0, 0.12, 0.12, 1.1, "#D8DBE6")); K.quad(g, [[3.2, 22.6, 1.1], [5.8, 22.6, 1.1], [5.8, 24.4, 1.1], [3.2, 24.4, 1.1]], "#E0785A");
      [[4.0, 23.4], [4.8, 23.4]].forEach(([x, y]) => bx(g, x, y, 0, 0.3, 0.3, 0.7, "#E0785A", "#F1F2F4")); }, "pops");
    S.add(10.4, 23.2, (g) => { const d = bx(g, 9.0, 22.6, 0, 2.8, 1.3, 1.0, "#F1F2F4", "#E0785A"); F.face(g, F.L, d, 0.2, 0.3, 2.6, 0.75, "#9ED9CF", { "stroke-width": 0.6 }); F.face(g, F.L, d, 0.1, 0.8, 2.7, 0.95, "#E0785A", { "stroke-width": 0.5 }); }, "pops");
    S.add(16.2, 23.3, (g) => { const m = bx(g, 14.2, 22.6, 0, 4.0, 1.3, 0.95, "#F3E2C6", "#E8A98D"); for (let u = 0.3; u < 3.8; u += 0.75) { F.face(g, F.L, m, u, 0, u + 0.3, 0.62, "#4AB4D6", { "stroke-width": 0.5 }); F.face(g, F.L, m, u + 0.4, 0.3, u + 0.65, 0.58, "#FFE6A3", { "stroke-width": 0.5 }); }
      const s = P(18.6, 22.4, 0); el("path", { d: `M${s[0]} ${s[1]} L${s[0]} ${s[1] - 40}`, stroke: "#3E4860", "stroke-width": 1.4 }, g); el("rect", { x: s[0] - 16, y: s[1] - 54, width: 32, height: 14, fill: "#FFCD00", stroke: "#000", "stroke-width": 0.8 }, g); }, "pops");
    [[10.6, 26.4, "#6E6A72", "#FFCD00"], [13.4, 26.8, "#B77464", "#A6D84A"]].forEach(([x, y, r, car]) => S.add(x + 1.1, y + 0.8, (g) => { ISO.house(g, F, x, y, 2.0, 1.5, 0.85, 0.65, r); K.oldCar(g, x + 0.4, y + 1.8, car); }, "pops"));

    // ---------- F1: telegraph poles and wires along the railway and the highway; masts ----------
    let park = null;
    const lines = [], masts = [], arcs = [];
    [[RY - 0.6, 0.8, 29.2], [HY - 0.5, 0.8, 20.4]].forEach(([y, a, b]) => S.add(15, y, (g) => { const n = el("g", { opacity: 0 }, g); lines.push(n); const xs = []; for (let x = a; x <= b + 0.01; x += (b - a) / 5) xs.push(x); let zs = []; xs.forEach((x) => { zs = K.pole(n, x, y, 2.2, 2); }); n.wire = K.wires(n, xs, y, zs, [-0.3, 0.3], "#3E4860", 7); n.xs = xs; n.zs = zs; n.y = y; }));
    [[8.4, 21.4, 3.2], V2 ? [0.9, 4.3, 3.8] : [24.4, 3.2, 3.8]].forEach(([x, y, h]) => S.add(x, y, (g) => { const m = el("g", { opacity: 0 }, g); masts.push(m); const b = P(x, y, 0), t = P(x, y, h), H = b[1] - t[1];
      let d = `M${b[0] - 8} ${b[1]} L${t[0] - 1.2} ${t[1]} M${b[0] + 8} ${b[1]} L${t[0] + 1.2} ${t[1]}`; [0.2, 0.4, 0.6, 0.8].forEach((u) => { const y0 = b[1] - H * u, w0 = 8 - 6.8 * u, y1 = b[1] - H * (u + 0.2), w1 = 8 - 6.8 * (u + 0.2); d += ` M${b[0] - w0} ${y0} L${b[0] + w1} ${y1} M${b[0] + w0} ${y0} L${b[0] - w1} ${y1}`; });
      el("path", { d, stroke: "#626E88", "stroke-width": 1.4, fill: "none" }, m); [-5, 5].forEach((dx) => el("rect", { x: t[0] + dx - 2, y: t[1] + 5, width: 4, height: 10, fill: "#F1F2F4", stroke: "#192238", "stroke-width": 0.8 }, m)); el("circle", { cx: t[0], cy: t[1] - 2, r: 2.4, fill: "#E04B00" }, m);
      [10, 17, 24].forEach((r) => { const arc = (sx) => `M${t[0] + sx * r * 0.5} ${t[1] + 3 - r * 0.87} A${r} ${r} 0 0 ${sx > 0 ? 1 : 0} ${t[0] + sx * r * 0.5} ${t[1] + 3 + r * 0.87}`; arcs.push(el("path", { d: arc(1) + " " + arc(-1), fill: "none", stroke: "#2E6FB3", "stroke-width": 2, "stroke-linecap": "round", opacity: 0 }, m)); }); }));

    // ---------- F4: glass towers over the old city, modern blocks where the meadow was; people with phones ----------
    [[20.2, 12.0, 1.9, 1.7, 5.0, "#E3E6EB", "pv"], [23.4, 12.2, 2.2, 1.6, 3.4, "#9FB2C6", "garden"], [26.6, 12.0, 1.6, 1.6, 6.2, "#C9D6E3", "pv"]].forEach(([x, y, w, d, h, c, r]) => S.add(x + w / 2, y + d / 2, (g) => K.tower(g, x, y, w, d, h, c, C.water, r, { floor: 0.6 }), "glass"));
    const BACKG = V2 ? [[7.0, 2.0, 1.4, 1.4, 5.6, "#9ED9CF"], [9.2, 2.0, 1.4, 1.4, 6.8, "#C9D6E3"], [12.6, 2.0, 1.5, 1.5, 8.0, "#9ED9CF"], [15.0, 2.1, 1.3, 1.3, 6.2, "#C9D6E3"], [17.0, 1.9, 1.2, 1.2, 4.8, "#9ED9CF"]]
      : [[4.4, 2.0, 1.4, 1.4, 6.4, "#9ED9CF"], [12.8, 2.0, 1.5, 1.5, 8.0, "#C9D6E3"], [20.6, 2.0, 1.4, 1.4, 6.8, "#9ED9CF"], [26.8, 2.2, 1.2, 1.2, 5.4, "#C9D6E3"]];
    BACKG.forEach(([x, y, w, d, h, c]) => S.add(x + w / 2, y + d / 2, (g) => K.tower(g, x, y, w, d, h, c, C.water, "plant"), "glass"));
    const ppl = [], bubbles = [];
    [[11.0, 24.4], [12.4, 24.6], [17.0, 24.4]].forEach(([x, y], i) => S.add(x, y, (g) => { const p = el("g", null, g); K.person(p, x, y, { idle: true, phone: true, dress: i === 1, top: ["#47B970", "#4AB4D6", "#E0785A"][i] }); ppl.push(p);
      if (i !== 1) { const q = P(x, y, 0.95), b = el("g", { opacity: 0 }, g); el("path", { d: `M${q[0] + 2} ${q[1] - 14} h14 v8 h-9 l-3 3 v-3 h-2 Z`, fill: "#FFFFFF", stroke: "#000", "stroke-width": 0.7 }, b); [0, 1, 2].forEach((k) => el("circle", { cx: q[0] + 5.5 + k * 3.5, cy: q[1] - 10, r: 0.9, fill: "#3E4860" }, b)); bubbles.push(b); } }));

    // ---------- E2: new ways of living: a square with cafés, a fountain and people where the mill yard was ----------
    S.add(9.6, 6.6, (g) => K.fountain(g, 9.6, 6.6, 0.7), "life");
    [[7.4, 5.4, "#E0785A"], [8.2, 7.8, "#47B970"], [11.4, 5.6, "#4AB4D6"], [11.6, 7.9, "#FFCD00"]].forEach(([x, y, c]) => S.add(x, y, (g) => K.table(g, x, y, c), "life"));
    [[7.0, 6.6, 0.9, "round"], [12.4, 6.8, 0.9]].forEach(([x, y, sc, k]) => S.add(x, y, (g) => K.tree(g, x, y, sc, k), "life"));
    people(S, [[8.8, 6.0, { top: "#8C6F9E", phone: true }], [10.4, 7.4, { dress: true, top: "#E0785A" }], [10.8, 5.8, { top: "#47B970" }], [8.6, 7.2, { kid: true, top: "#FFCD00" }]], "life");
    S.add(9.8, 8.4, (g) => K.bike(g, 9.8, 8.4, "#B5302E", { top: "#4AB4D6" }), "life");
    if (V2) {   // index2: people all around the valley
      people(S, [
        [13.6, 9.5, { top: "#3E4860" }], [14.4, 9.6, { dress: true, top: "#E0785A" }], [15.6, 9.5, { top: "#47B970", phone: true }],   // the station platform
        [9.0, 3.9, { top: "#4AB4D6" }], [11.6, 4.0, { dress: true, top: "#FFCD00" }], [14.0, 3.9, { top: "#8C6F9E", phone: true }], [17.2, 4.1, { kid: true, top: "#E0785A" }],   // the city
        [6.4, 14.1, { top: "#E0785A" }], [7.0, 14.2, { kid: true, top: "#47B970" }], [14.2, 14.1, { dress: true, top: "#4AB4D6" }], [18.8, 14.2, { top: "#FFCD00", phone: true }],   // between the terraces
        [2.2, 17.6, { top: "#8C6F9E" }], [11.4, 17.6, { dress: true, top: "#47B970" }],   // along the poles
        [6.8, 22.6, { top: "#3E4860" }], [12.6, 22.6, { dress: true, top: "#E0785A", phone: true }], [13.2, 22.7, { kid: true, top: "#4AB4D6" }],   // the roadside
        [2.6, 26.6, { top: "#B5302E", hat: true }], [8.4, 26.6, { dress: true, top: "#FFCD00" }],   // the farm
        [16.6, 25.6, { top: "#47B970" }], [26.0, 8.4, { top: "#4AB4D6" }], [27.4, 8.5, { top: "#E0785A", phone: true }]], "life");
      [[16.2, 26.6, "#4AB4D6"], [3.0, 18.0, "#47B970"]].forEach(([x, y, c]) => S.add(x, y, (g) => K.bike(g, x, y, c, { top: "#E0785A" }), "life"));
      [[20.6, 8.6], [21.4, 8.6]].forEach(([x, y]) => S.add(x, y, (g) => K.bench(g, x, y), "life"));

      // the port in the back corner (replaces the park): dockers on the quay
      people(S, [[20.2, 2.95, { top: "#E0785A", hat: true }], [21.2, 3.05, { top: "#FFCD00", hat: true }], [28.4, 3.1, { top: "#3E4860" }]], "life");
    }
    // ---------- E3: the modern grid: wind on the farm, a line of pylons up the valley to a substation, solar on the terraces ----------
    [[1.6, 26.4], [5.4, 27.8], [7.6, 24.2]].forEach(([x, y]) => S.add(x, y, (g) => ISO.turbine(g, F, x, y, 4.0), "grid"));
    const PX = 18.2, pyl = [[PX, 26.2], [PX, 16.9], [PX, 11.6], [PX, 3.6]];
    pyl.forEach(([x, y]) => S.add(x, y, (g) => K.pylon(g, x, y, 3.0, "x"), GL));
    for (let k = 1; k < pyl.length; k++) { const a = pyl[k - 1], b = pyl[k]; S.add(b[0] + 0.01, b[1] + 0.01, (g) => K.spans(g, [a, b], 3.0, "x"), GL); }
    if (!V2) S.add(19.8, 27.4, (g) => { K.rect(g, 18.9, 26.8, 20.9, 28.4, "#C9CED6", 0.8); K.xfmr(g, 19.1, 27.1); K.xfmr(g, 20.0, 27.3); K.fence(g, 18.9, 28.4, 20.9, 28.4, "#9AA3B5"); }, GL);
    else {   // index2: where the bay was, the grid's yard: a substation fed by the pylon line, batteries, and a solar field
      S.add(20.4, 25.6, (g) => { K.rect(g, 19.2, 24.0, 23.6, 27.2, "#C9CED6", 0.8); [[19.6, 24.4], [20.9, 24.4], [19.6, 25.8], [20.9, 25.8]].forEach(([x, y]) => K.xfmr(g, x, y)); [[22.4, 24.6], [22.4, 26.0]].forEach(([x, y]) => bx(g, x, y, 0, 0.9, 0.9, 1.0, "#D8DBE6", "#F1F2F4"));
        K.fence(g, 19.2, 27.2, 23.6, 27.2, "#9AA3B5"); K.fence(g, 23.6, 24.0, 23.6, 27.2, "#9AA3B5"); }, GL);
      [[24.4, 24.2], [24.4, 25.3], [26.8, 24.2], [26.8, 25.3]].forEach(([x, y]) => S.add(x + 1.0, y + 0.35, (g) => K.batt(g, x, y, 2.0), GL));
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = 21.6 + c * 2.0, y = 27.0 + r * 0.95; S.add(x + 0.8, y + 0.4, (g) => ISO.panel(g, F, x, y, 1.6, 0.7), "grid"); } }
    // section E's new demand: data centres behind the glass towers
    let shipG = null;
    if (V2) {   // the fuel import terminal: a tanker at the quay and storage tanks (they arrive with the highways; GA3 sees them go)
      S.add(23.0, 1.6, (g) => { shipG = el("g", null, g);
        bx(shipG, 20.0, 1.0, -0.1, 6.0, 1.0, 0.6, "#B5302E", "#5B6478");
        K.lineGX(shipG, 1.5, 21.4, 25.6, 0.52, "#C9CED6", 2);
        bx(shipG, 20.2, 1.15, 0.5, 1.1, 0.7, 0.85, "#F1F2F4", "#FFFFFF"); bx(shipG, 20.45, 1.35, 1.35, 0.3, 0.3, 0.45, "#3E4860", "#262C3A"); }, "ship");
      [[24.0, 3.45], [25.6, 3.45], [27.2, 3.45]].forEach(([x, y]) => S.add(x, y, (g) => F.cyl(g, [x, y, 0], "z", 0.62, 0.95, { side: "#E9EBEE", cap: "#C9CED6" }), "tanks"));
      S.add(25.6, 2.85, (g) => K.lineGX(g, 2.85, 23.2, 27.8, 0.12, "#626E88", 2), "tanks");
    }
    if (ALL) {   // section GA's additions, each with its card
      // GA2 cars, kitchens, heating, factories: the filling station becomes a charging hub, chargers and heat pumps at the homes
      S.add(4.42, 23.42, (g) => { [[3.4, 22.8], [5.4, 22.8], [3.4, 24.0], [5.4, 24.0]].forEach(([x, y]) => bx(g, x, y, 0, 0.12, 0.12, 1.1, "#D8DBE6")); K.quad(g, [[3.2, 22.6, 1.1], [5.8, 22.6, 1.1], [5.8, 24.4, 1.1], [3.2, 24.4, 1.1]], "#47B970");
        [[3.9, 23.3], [4.7, 23.3]].forEach(([x, y]) => bx(g, x, y, 0, 0.3, 0.3, 0.7, "#F1F2F4", "#47B970")); K.car(g, 3.6, 23.9, "#4AB4D6", "x"); }, "ga2");
      [[12.75, 26.5], [15.55, 27.0], [5.55, 25.0]].forEach(([x, y]) => S.add(x + 0.2, y + 0.15, (g) => { const b0 = bx(g, x, y, 0, 0.45, 0.3, 0.42, "#F1F2F4", "#FFFFFF"); const c = P(x + 0.22, y, 0.21); el("circle", { cx: c[0], cy: c[1], r: 3.2, fill: "#C9CED6", stroke: "#000", "stroke-width": 0.6 }, g); }, "ga2"));
      [[12.4, 28.3], [15.1, 28.7]].forEach(([x, y]) => S.add(x, y, (g) => K.charger(g, x, y), "ga2"));
      // GA3 domestic wind and solar: solar on every terrace, two turbines in the back corner
      [[1.4, 11.8, 8, 1], [12.6, 11.8, 7, 1], [3.4, 15.0, 9, 1], [15.0, 15.0, 6, 0], [9.4, 11.8, 3, 0], [0.4, 15.0, 3, 0], [12.1, 15.0, 3, 0]].forEach(([x, y, n, k0]) => S.add(x + n * 0.47 + 0.02, y + 0.62, (g) => terraceSolar(g, x, y, n, 1.4, k0, k0 ? 2 : 1), "ga3"));
      [[26.4, 0.8], [28.8, 1.6]].forEach(([x, y]) => S.add(x, y, (g) => ISO.turbine(g, F, x, y, 4.0), "ga3"));   // offshore, in the harbour
      // GA4 data centres: a campus in the back corner on the left
      [[0.6, 0.6], [0.6, 2.4]].forEach(([x, y]) => S.add(x + 1.6, y + 0.7, (g) => K.dataHall(g, x, y, 3.2, 1.4), "ga4"));
      // GA5 industry and investment: a new factory beside them, solar on its roof
      S.add(5.6, 2.1, (g) => { K.factory(g, 4.4, 0.8, 2.4, 2.6, 2.0, "#9FB2C6"); }, "ga5");
    }
    if (V2E || ALL) [[20.6, 14.9], [25.0, 14.9]].forEach(([x, y]) => S.add(x + 1.8, y + 0.8, (g) => K.dataHall(g, x, y, 3.6, 1.6), "demand"));
    [[1.4, 11.8, 8], [12.6, 11.8, 7], [3.4, 15.0, 9]].forEach(([x, y, n]) => S.add(x + n * 0.47 + 0.01, y + 0.61, (g) => { if (V2) terraceSolar(g, x, y, n, 1.4, 0, 2); else for (let k = 0; k < n; k += 2) K.pvRoof(g, x + k * 0.95 + 0.1, y + 0.2, 1.42, 0.75, 0.8); }, "grid"));

    // ---------- the movers, all scrubbed with the story: the train, a few vehicles on the highway ----------
    let train, cars;
    let fast;
    S.lane(RY + 0.2, (g) => { train = convoy(g, N, steamParts(RY + 0.2, 3)); fast = el("g", { opacity: 0 }, g); K.train(fast, 0, RY + 0.18, 3, { stripe: "#13CE74" }); });
    S.lane(HY + 0.1, (g) => { cars = el("g", { opacity: 0 }, g); [[3.0, "#E0785A"], [11.6, "#4AB4D6"], [22.4, "#FFCD00"]].forEach(([x, c]) => K.oldCar(cars, x, HY + 0.1, c));
      bx(cars, 15.4, HY + 0.1, 0.12, 1.7, 0.6, 0.85, "#F1F2F4", "#FFFFFF"); bx(cars, 17.15, HY + 0.13, 0.12, 0.55, 0.55, 0.7, "#B5302E", "#E0785A");
      [[7.6, "#A6D84A"], [25.6, "#8C6F9E"]].forEach(([x, c]) => K.oldCar(cars, x, HY + 1.95, c)); });
    if (false) for (let k = 1; k < pyl.length; k++) { const A = pyl[k - 1], B = pyl[k];   // (power dots on the conductors: removed at review)
      S.add(B[0] + 0.02, B[1] + 0.02, (g) => { [-0.7, 0.7].forEach((o2) => { const a = P(A[0] + o2, A[1], 2.28), c = P(B[0] + o2, B[1], 2.28);
        const d = `M${a[0]} ${a[1] + 6} Q${(a[0] + c[0]) / 2} ${(a[1] + c[1]) / 2 + 20} ${c[0]} ${c[1] + 6}`, path = el("path", { d, fill: "none", stroke: "#13CE74", "stroke-width": 2.2, opacity: 0.55 }, g), L = path.getTotalLength();
        const n = Math.max(2, Math.round(L / 60));
        for (let i = 0; i < n; i++) { const dot = el("circle", { r: 4, fill: "#13CE74", stroke: "#FFFFFF", "stroke-width": 0.8 }, g), o = { u: i / n };
          const set = () => { const q = path.getPointAtLength(o.u * L); dot.setAttribute("cx", q.x.toFixed(1)); dot.setAttribute("cy", q.y.toFixed(1)); }; set();
          gsap.to(o, { u: "+=1", duration: L / 40, repeat: -1, ease: "none", modifiers: { u: (v) => +v % 1 }, onUpdate: set }); } }); }, "flow"); }
    let boat = null, boatG = null;
    if (V2) S.lane(HY + 1.2, (g0) => { const g = boatG = el("g", null, g0); boat = convoy(g, N, [[0, (b) => { const y = HY + 1.2;
      F.box(b, -1.5, y, 0, 3.0, 0.55, 0.28, { left: "#2F5E4E", right: shade("#2F5E4E"), top: "#4E7F6C" });
      const cab = F.box(b, -0.9, y + 0.07, 0.28, 1.8, 0.42, 0.34, { left: "#B5302E", right: shade("#B5302E"), top: "#E3D6C0" });
      for (let u = 0.2; u < 1.6; u += 0.45) F.face(b, F.L, cab, u, 0.1, u + 0.22, 0.26, "#FFE6A3", { "stroke-width": 0.5 }); }]]); });
    S.flush();

    // wireless signals from the buildings: a fan of arcs over each roof, pulsing outwards (F2 on; the modern blocks' at F4)
    const fan = (parent, x, y, z) => { const t = P(x, y, z), g = el("g", null, parent);
      [11, 19, 27].forEach((r, k) => { const a = el("path", { d: `M${t[0] - r * 0.78} ${t[1] - r * 0.62} A${r} ${r} 0 0 1 ${t[0] + r * 0.78} ${t[1] - r * 0.62}`, fill: "none", stroke: "#2E6FB3", "stroke-width": 3, "stroke-linecap": "round" }, g);
        gsap.fromTo(a, { opacity: 0.15 }, { opacity: 1, duration: 0.7, delay: k * 0.22 + ((x * 0.37) % 0.6), repeat: -1, yoyo: true, ease: "sine.inOut" }); });
      el("circle", { cx: t[0], cy: t[1], r: 3.2, fill: "#2E6FB3" }, g); return g; };
    const wifi = el("g", { opacity: 0 }, S.items), wifi2 = el("g", { opacity: 0 }, S.items);
    [[5.2, 12.4, 2.0], [15.8, 12.4, 2.0], [7.6, 15.6, 2.0], [16.4, 15.6, 2.0], [10.4, 23.2, 1.4], [16.2, 23.3, 1.3], [11.6, 27.2, 1.5], [14.4, 27.6, 1.5], [4.4, 25.3, 1.9], [26.4, 7.8, 2.0]].forEach(([x, y, z]) => fan(wifi, x, y, z));
    [[21.15, 12.85, 5.3], [24.5, 13.0, 3.7], [27.4, 12.8, 6.5]].concat(V2 ? [[9.9, 2.7, 7.1], [13.35, 2.75, 8.3]] : [[5.1, 2.7, 6.7], [13.55, 2.75, 8.3]]).forEach(([x, y, z]) => fan(wifi2, x, y, z));
    // the information on the wires: dots running along the telephone lines (F3)
    const wireDots = el("g", { opacity: 0 }, S.items);
    lines.forEach((n) => { const path = n.wire, L = path.getTotalLength(); for (let i = 0; i < 4; i++) { const dot = el("circle", { r: 4.5, fill: "#4AB4D6", stroke: "#FFFFFF", "stroke-width": 0.8 }, wireDots), o = { u: i / 4 };
      const set = () => { const q = path.getPointAtLength(o.u * L * 0.24); dot.setAttribute("cx", q.x.toFixed(1)); dot.setAttribute("cy", q.y.toFixed(1)); }; set();
      gsap.to(o, { u: "+=1", duration: 2, repeat: -1, ease: "none", modifiers: { u: (v) => +v % 1 }, onUpdate: set }); } });

    if (V2E) return timelineE();
    if (GA) return timelineGA();
    if (ALL) { timelineV2(); timelineE(10.0); timelineGA(13.0); ISO.tweens.forEach((t) => t.play && t.play()); return tl; }
    if (V2) { timelineV2(); ISO.tweens.forEach((t) => t.play && t.play()); return tl; }
    // ---------- timeline: one beat per card (step 0 is the section's title) ----------
    const st = S.sets;
    // D2 railways: the line is laid across the valley
    tl.to(bed, { opacity: 1, duration: 0.2 }, beat(1));
    rails.forEach((r) => drawOn(tl, r, beat(1), 0.8));
    tl.to(sleepers, { opacity: 1, duration: 0.05, stagger: 0.8 / sleepers.length, ease: "none" }, beat(1));
    sprout(tl, st.laid, beat(1) + 0.4, { stagger: 0.05 });
    // D3 across plains and continents: the train runs through
    train.at(-8); train.to(tl, 16, { duration: 0.9, ease: "power1.out" }, beat(2));
    // D4 towns and factories rise along the rails
    shrink(tl, st.rural, beat(3) - 0.1);
    tl.to(farm, { opacity: 0, duration: 0.25 }, beat(3)); tl.to(town, { opacity: 1, duration: 0.25 }, beat(3));
    sprout(tl, st.mills, beat(3) + 0.12, { y: true, dur: 0.45, stagger: 0.06, ease: "back.out(1.4)" });
    sprout(tl, st.terr, beat(3) + 0.25, { y: true, dur: 0.3, stagger: 0.05 });
    sprout(tl, st.city, beat(3) + 0.1, { y: true, dur: 0.5, stagger: 0.03, ease: "power2.out" });
    train.to(tl, 40, { duration: 0.9, ease: "power1.in" }, beat(3) + 0.2);
    // E1 highways: the lane becomes a highway; traffic appears
    tl.to(skies[1], { opacity: 1, duration: 0.4 }, beat(4) - 0.1);
    tl.to(segs, { opacity: 1, duration: 0.04, stagger: 0.5 / segs.length, ease: "none" }, beat(4));
    tl.to(edges, { opacity: 1, duration: 0.2 }, beat(4) + 0.45);
    tl.to(cars, { opacity: 1, duration: 0.25 }, beat(4) + 0.55);
    // E2 roadside economies
    sprout(tl, st.pops, beat(5) + 0.05, { stagger: 0.06 });
    // F1 cables and masts: telephone lines along the railway and the highway, masts on the land
    tl.to(skies[2], { opacity: 1, duration: 0.4 }, beat(6) - 0.1);
    tl.to(lines.concat(masts), { opacity: 1, duration: 0.3, stagger: 0.1 }, beat(6));
    // F2 telecoms and the internet: the masts signal, and wireless signals rise from the homes, shops and terraces
    tl.to(arcs, { opacity: 1, duration: 0.15, stagger: 0.05 }, beat(7));
    tl.to(wifi, { opacity: 1, duration: 0.3 }, beat(7) + 0.2);
    // F3 information moves instantly along the lines
    tl.to(wireDots, { opacity: 1, duration: 0.2 }, beat(8));
    // F4 societies transformed within a generation: modern buildings, connected too
    sprout(tl, st.glass, beat(9), { y: true, dur: 0.4, stagger: 0.08, ease: "power2.out" });
    tl.to(wifi2, { opacity: 1, duration: 0.3 }, beat(9) + 0.45);
    gsap.set(ppl, { opacity: 0 }); tl.to(ppl, { opacity: 1, duration: 0.3 }, beat(9) + 0.2);
    tl.to(bubbles, { opacity: 1, duration: 0.2, stagger: 0.2 }, beat(9) + 0.35);
    // E1 built with speed and conviction: a fast electric train runs the line; the traffic moves on
    tl.set(fast, { opacity: 1 }, beat(10)); tl.fromTo(fast, along(fast, -9), Object.assign(along(fast, 40), { duration: 0.9, ease: "power1.inOut" }), beat(10));
    tl.set(fast, { opacity: 0 }, beat(10) + 0.95);
    tl.to(cars, Object.assign(along(cars, 2.5), { duration: 0.8, ease: "power1.inOut" }), beat(10));
    // E2 new ways of living and kinds of growth: the square
    sprout(tl, st.life, beat(11), { stagger: 0.04 });
    // E3 the build-out of the current age: modern grids
    sprout(tl, st.grid, beat(12), { y: true, dur: 0.4, stagger: 0.06, ease: "back.out(1.4)" });
    ISO.tweens.forEach((t) => t.play && t.play());
    hold(tl, 12);
    return tl;

    // ---------- index2/index3: the new script's order ----------
    function timelineV2() {
      const st = S.sets, b = (k) => k - 0.45;
      // the power on the new line (k=8): dots running along the conductors (drawn in depth order with the spans, before S.flush)
      const flow = st.flow || [];
      // k=1 canals: the canal is cut along the valley floor and a narrowboat comes along it
      tl.to(canalSegs, { opacity: 1, duration: 0.04, stagger: 0.4 / canalSegs.length, ease: "none" }, b(1));
      boat.at(-4); boat.to(tl, 11, { duration: 0.75, ease: "power1.out" }, b(1) + 0.25);
      // k=2 railways: the line is laid, the train runs in, and mills, terraces and a brick city rise along it
      tl.to(bed, { opacity: 1, duration: 0.15 }, b(2));
      rails.forEach((r) => drawOn(tl, r, b(2), 0.45));
      tl.to(sleepers, { opacity: 1, duration: 0.04, stagger: 0.45 / sleepers.length, ease: "none" }, b(2));
      sprout(tl, st.laid, b(2) + 0.25, { stagger: 0.05 });
      train.at(-8); train.to(tl, 16, { duration: 0.45, ease: "power1.out" }, b(2) + 0.25);
      shrink(tl, st.rural, b(2) + 0.45);
      tl.to(farm, { opacity: 0, duration: 0.2 }, b(2) + 0.5); tl.to(town, { opacity: 1, duration: 0.2 }, b(2) + 0.5);
      sprout(tl, st.mills.concat(st.chim || []), b(2) + 0.55, { y: true, dur: 0.3, stagger: 0.04, ease: "back.out(1.4)" });
      sprout(tl, st.terr, b(2) + 0.62, { y: true, dur: 0.22, stagger: 0.03 });
      sprout(tl, st.city, b(2) + 0.52, { y: true, dur: 0.35, stagger: 0.025, ease: "power2.out" });
      train.to(tl, 40, { duration: 0.6, ease: "power1.in" }, b(2) + 0.75);
      // k=3 telephone lines: poles and wires along the railway and the lane, masts; calls run along the wires
      tl.to(skies[1], { opacity: 1, duration: 0.4 }, b(3) - 0.1);
      tl.to(lines.concat(masts), { opacity: 1, duration: 0.3, stagger: 0.1 }, b(3));
      tl.to(wireDots, { opacity: 1, duration: 0.2 }, b(3) + 0.45);
      // k=4 highways: the canal is paved over by a highway; traffic, then roadside businesses and homes with cars
      tl.to(boatG, { opacity: 0, duration: 0.15 }, b(4) - 0.05); tl.to(canalG, { opacity: 0, duration: 0.15 }, b(4) + 0.25);
      tl.to(segs, { opacity: 1, duration: 0.04, stagger: 0.4 / segs.length, ease: "none" }, b(4));
      tl.to(edges, { opacity: 1, duration: 0.2 }, b(4) + 0.4);
      tl.to(cars, { opacity: 1, duration: 0.25 }, b(4) + 0.45);
      sprout(tl, st.pops, b(4) + 0.55, { stagger: 0.06 });
      sprout(tl, st.tanks, b(4) + 0.6, { y: true, dur: 0.25, stagger: 0.05 });
      tl.fromTo(st.ship, Object.assign({ opacity: 0 }, along(null, 8)), Object.assign(along(null, 0), { opacity: 1, duration: 0.45, ease: "power2.out" }), b(4) + 0.5);
      // k=5 internet cables: the masts signal, wireless rises from the buildings, modern buildings and people with phones
      tl.to(skies[2], { opacity: 1, duration: 0.4 }, b(5) - 0.1);
      tl.to(arcs, { opacity: 1, duration: 0.12, stagger: 0.04 }, b(5));
      tl.to(wifi, { opacity: 1, duration: 0.3 }, b(5) + 0.15);
      sprout(tl, st.glass, b(5) + 0.3, { y: true, dur: 0.35, stagger: 0.07, ease: "power2.out" });
      tl.to(wifi2, { opacity: 1, duration: 0.3 }, b(5) + 0.7);
      gsap.set(ppl, { opacity: 0 }); tl.to(ppl, { opacity: 1, duration: 0.3 }, b(5) + 0.5);
      tl.to(bubbles, { opacity: 1, duration: 0.2, stagger: 0.15 }, b(5) + 0.6);
      // k=6 new ways of living and kinds of growth: the square, a fast electric train, the traffic moves on
      sprout(tl, st.life, b(6), { stagger: 0.04 });
      tl.fromTo(fast, Object.assign({ opacity: 0 }, along(fast, -2)), Object.assign(along(fast, 34), { duration: 0.9, ease: "power1.inOut" }), b(6) + 0.1);
      tl.to(fast, { opacity: 1, duration: 0.1 }, b(6) + 0.1); tl.to(fast, { opacity: 0, duration: 0.1 }, b(6) + 0.9);
      tl.to(cars, Object.assign(along(cars, 2.5), { duration: 0.8, ease: "power1.inOut" }), b(6) + 0.1);
      // k=7 the next age runs on electricity: wind on the farm, pylons up the valley, a substation, solar on the terraces
      sprout(tl, st.grid.concat(st.gridLine), b(7) - 0.05, { y: true, dur: 0.3, stagger: 0.03, ease: "back.out(1.4)" });
      // k=8 the infrastructure it runs on: power moves along the new line
      // k=8: the picture holds
      hold(tl, 8);
    }

    // ---------- index2, section E: Act 2 on the same valley, as section C left it ----------
    // E1 how we work, travel and communicate has changed: the fast train runs, the traffic moves, the phones are out.
    // E2 but the grid has stayed the same: everything else fades back and the grid (pylons, conductors, substation, the
    // power on the line) stays in full colour. E3 a world hungrier for power: data centres rise behind the towers, in colour,
    // while the grid stays as it is.
    // With O (v2all) the beats are added after section C's own, at O + their time, on the same timeline.
    function timelineE(O) {
      const st = S.sets, own = O == null; O = O || 0;
      gsap.set(st.demand, { opacity: 0 });
      if (own) { timelineV2(); tl.progress(1); tl.clear();       // draw the valley in its final state, then start a fresh timeline
        ISO.tweens.forEach((t) => t.play && t.play()); gsap.set(fast, { opacity: 0 }); }
      const keep = new Set(st.gridLine.concat(st.flow || [], st.demand));
      const rest = [...S.items.children].filter((n) => !keep.has(n) && n !== fast.parentNode && (!own || +gsap.getProperty(n, "opacity") > 0.01));
      const W0 = "grayscale(0) contrast(1) brightness(1)";
      gsap.set(rest.concat([S.ground]), { filter: W0 }); greyed = rest.concat([S.ground]);
      tl.fromTo(fast, Object.assign({ opacity: 0 }, along(fast, -2)), Object.assign(along(fast, 34), { opacity: 1, duration: 0.75, ease: "power1.inOut", immediateRender: own }), O + 0.05);
      tl.to(fast, { opacity: 0, duration: 0.08 }, O + 0.72);
      tl.to(cars, Object.assign(along(cars, 6), { duration: 0.7, ease: "power1.inOut" }), O + 0.05);
      tl.to(rest.concat([S.ground]), { filter: "grayscale(1) contrast(0.45) brightness(1.32)", duration: 0.35 }, O + 0.6);   // E2: washed out, not see-through
      tl.to(rest, { filter: "grayscale(1) contrast(0.6) brightness(1.22)", duration: 0.3 }, O + 1.55);                     // E3
      st.demand.forEach((n) => gsap.set(n, { opacity: 1 }));
      sprout(tl, st.demand, O + 1.6, { y: true, dur: 0.35, stagger: 0.15, ease: "back.out(1.3)" });
      hold(tl, O + 2);
      return tl;
    }
    return tl;

    // ---------- index2, section GA: the electrostate cards on the same valley, as section B leaves it ----------
    // GA1 electrostates: colour comes back. GA2 cars, trains, kitchens, heating, factories: a charging hub where the filling
    // station was, chargers and heat pumps at the homes, the chimneys come down, an electric train passes. GA3 domestic
    // wind and solar: solar on every terrace, two turbines. GA4 data centres: a campus in the back corner. GA5 (the label):
    // a new factory beside it.
    // With O (v2all) the beats follow section B's on the same timeline, O + their time.
    function timelineGA(O) {
      const st = S.sets, own = O == null; O = O || 0;
      let grey;
      if (own) { gsap.set(st.demand, { opacity: 0 }); timelineV2(); timelineE(10.0); tl.progress(1); tl.clear();
        ISO.tweens.forEach((t) => t.play && t.play()); gsap.set(fast, { opacity: 0 });
        grey = [...S.items.children].concat([S.ground]).filter((n) => /grayscale\(1\)/.test(String(gsap.getProperty(n, "filter")))); }
      else grey = greyed;
      tl.to(grey, { filter: "grayscale(0) contrast(1) brightness(1)", duration: 0.35 }, O - 0.1);                   // GA1
      sprout(tl, st.ga2, O + 0.62, { y: true, dur: 0.25, stagger: 0.06, ease: "back.out(1.4)" });                   // GA2
      tl.to(st.chim, { opacity: 0, duration: 0.25 }, O + 0.75);
      tl.fromTo(fast, Object.assign({ opacity: 0 }, along(fast, -2)), Object.assign(along(fast, 34), { opacity: 1, duration: 0.75, ease: "power1.inOut", immediateRender: own }), O + 0.62);
      tl.to(fast, { opacity: 0, duration: 0.08 }, O + 1.3);
      tl.to(cars, Object.assign(along(cars, 9.5), { duration: 0.7, ease: "power1.inOut" }), O + 0.62);
      // GA3 domestic wind and solar replace fuel imports: the tanker sails out, the tanks come down, turbines rise offshore
      tl.to(st.ship, Object.assign(along(null, 9), { opacity: 0, duration: 0.5, ease: "power1.in" }), O + 1.55);
      shrink(tl, st.tanks, O + 1.75);
      sprout(tl, st.ga3, O + 1.8, { y: true, dur: 0.3, stagger: 0.05, ease: "back.out(1.4)" });
      sprout(tl, st.ga4, O + 2.62, { y: true, dur: 0.35, stagger: 0.15, ease: "back.out(1.3)" });                  // GA4
      sprout(tl, st.ga5, O + 3.55, { y: true, dur: 0.3, ease: "back.out(1.3)" });                                  // GA5
      hold(tl, O + 4);
      return tl;
    }
  }

  Object.assign(window.SCENES, { journey });
})();
