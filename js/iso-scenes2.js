/* isometric versions of sections D (railways), E (highways), F (telecoms) and I (a world remade),
   built with the same kit as the hero and the strips (js/iso-scenes.js). Each scene keeps the beats of its side-on original. */
(function () {
  if (!window.CLEAN || !window.ISOSCENES) return;
  const { el } = SVG;
  const { C } = ISO;
  const { K, sky } = ISOSCENES;
  const beat = KIT.beat, hold = (tl, n) => tl.to({}, { duration: 0.001 }, n + 0.1);
  const P = (x, y, z) => ISO.P(x, y, z);
  const F = ISO.frame([0, 0], 1);
  const shade = (h) => ISO.mixHex(h, "#000000", 0.16), lite = (h) => ISO.mixHex(h, "#FFFFFF", 0.35);
  let UID = 0;

  // ---------- a stage: an isometric slab of land, drawn back to front ----------
  // add(x, y, fn, set): an item whose footprint centre is (x, y); fn draws it into its own group, which joins the named set.
  // lane(y, fn): a band of movers along gx at depth y; items behind it are drawn first, items in front of it after.
  function stage(svg, o) {
    const id = "st" + (++UID), defs = svg.querySelector("defs") || el("defs", null, svg);
    const root = el("g", { transform: `translate(${o.tx} ${o.ty}) scale(${o.mirror ? -o.s : o.s} ${o.s})` }, svg);
    const N = o.N, M = o.M, T = o.T || 0.9, Y0 = o.Y0 || 0;   // the land runs from gy Y0 (the back) to M (the front)
    const Q = [], LN = [], sets = {};
    const S = {
      root, N, M, defs,
      ground: el("g", null, root), items: null,
      add: (x, y, fn, set) => Q.push([x, y, fn, set]),
      lane: (y, fn) => LN.push([y, fn]),
      set: (name) => (sets[name] = sets[name] || []),
      clip() { const up = (q) => [q[0], q[1] - 900]; const cp = el("clipPath", { id: id + "c" }, defs); el("polygon", { points: ISO.pts([up(P(0, Y0)), up(P(N, Y0)), P(N, Y0), P(N, M), [P(N, M)[0], P(N, M)[1] + 60], [P(0, M)[0], P(0, M)[1] + 60], P(0, M), up(P(0, M))]) }, cp); return `url(#${id}c)`; },
      flush() {
        LN.sort((a, b) => a[0] - b[0]);
        const cuts = LN.map((l) => l[0]).concat([Infinity]); let lo = -Infinity;
        cuts.forEach((yc, i) => {
          Q.filter(([, y]) => y >= lo && y < yc).sort((a, b) => a[0] + a[1] - b[0] - b[1]).forEach(([x, y, fn, set]) => { const g = el("g", null, S.items); fn(g); if (set) S.set(set).push(g); g.dataset.ox = P(x, y)[0].toFixed(1); g.dataset.oy = P(x, y)[1].toFixed(1); });
          if (LN[i]) LN[i][1](el("g", { "clip-path": S.clip() }, S.items));
          lo = yc;
        });
      },
      sets
    };
    if (!o.noSlab) {
      K.quad(S.ground, [[0, M, 0], [N, M, 0], [N, M, -T], [0, M, -T]], "#C9CED6");
      K.quad(S.ground, [[N, Y0, 0], [N, M, 0], [N, M, -T], [N, Y0, -T]], "#AEB5C0");
      K.rect(S.ground, 0, Y0, N, M, o.ground || "#DCEBD3", 1.3);
    }
    S.items = el("g", null, root);
    return S;
  }
  // grow from the ground: scale 0 → 1 about each group's footprint
  const sprout = (tl, gs, t, o) => { o = o || {}; gs.forEach((g, i) => { gsap.set(g, o.y ? { scaleY: 0, svgOrigin: `${g.dataset.ox} ${g.dataset.oy}` } : { scale: 0, svgOrigin: `${g.dataset.ox} ${g.dataset.oy}` }); tl.to(g, Object.assign(o.y ? { scaleY: 1 } : { scale: 1 }, { duration: o.dur || 0.3, ease: o.ease || "back.out(1.6)" }), t + i * (o.stagger == null ? 0.03 : o.stagger)); }); };
  const shrink = (tl, gs, t) => gs.forEach((g, i) => tl.to(g, { scale: 0, svgOrigin: `${g.dataset.ox} ${g.dataset.oy}`, duration: 0.22, ease: "power2.in" }, t + i * 0.015));
  const drawOn = (tl, path, t, dur) => { const len = path.getTotalLength(); gsap.set(path, { strokeDasharray: len, strokeDashoffset: len }); tl.to(path, { strokeDashoffset: 0, duration: dur, ease: "none" }, t); };
  const along = (g, d) => ({ x: K.UX[0] * d, y: K.UX[1] * d });   // a translation of d units along gx
  // a convoy: parts drawn at local offsets along gx, moved together by one number; each part fades near the ends of the land
  function convoy(parent, N, parts) {
    const gs = parts.map(([u, draw]) => { const g = el("g", null, parent); draw(g); return [u, g]; });
    const o = { p: 0 }, cl = (v) => Math.max(0, Math.min(1, v));
    const set = () => gs.forEach(([u, g]) => { const x = o.p + u; g.setAttribute("transform", `translate(${(K.UX[0] * o.p).toFixed(1)} ${(K.UX[1] * o.p).toFixed(1)})`); g.setAttribute("opacity", (cl((x - 0.3) / 1.4) * cl((N - 0.3 - x) / 1.4)).toFixed(2)); });
    return { o, set, to: (tl, p, vars, t) => tl.to(o, Object.assign({ p, onUpdate: set }, vars), t), at: (p) => { o.p = p; set(); } };
  }
  const steamParts = (y, n) => {   // a locomotive (front at gx 0) and n wagons behind it
    const parts = [[-0.8, (g) => { F.box(g, -1.6, y, 0.18, 1.6, 0.6, 0.62, { left: "#2F6F4E", right: shade("#2F6F4E"), top: "#5E8F75" }); F.cyl(g, [-0.3, y + 0.3, 0.8], "z", 0.11, 0.5, { side: "#3E4860", cap: "#262C3A" }); F.box(g, -1.7, y, 0.18, 0.55, 0.6, 0.95, { left: "#B5302E", right: shade("#B5302E"), top: "#3E4860" }); const f = P(-0.3, y + 0.3, 1.35); K.smoke(g, f[0], f[1], true); }]];
    for (let k = 1; k <= n; k++) parts.push([-1.8 - k * 1.5 + 0.7, (g) => { const x0 = -1.8 - k * 1.5, c = k % 2 ? "#8F7A6E" : "#C9B79C"; F.box(g, x0, y, 0.18, 1.35, 0.6, 0.5, { left: c, right: shade(c), top: k % 3 ? "#3E4860" : "#262C3A" }); }]);
    return parts;
  };

  // a looping lane of traffic along gx: every vehicle shares one speed (so none catches another) and fades near the ends of the land
  function loopLane(parent, N, dir, speed, items) {
    const L = N + 8, cl = (v) => Math.max(0, Math.min(1, v));
    const vs = items.map(([off, len, draw]) => { const g = el("g", null, parent); draw(g, dir > 0 ? -len : 0); return { g, off, len }; });
    const upd = () => { const t = gsap.ticker.time; vs.forEach((v) => { const s = ((t * speed + v.off * L) % L) - 4, f = dir > 0 ? s : N - s, c = f - dir * v.len / 2;
      v.g.setAttribute("transform", `translate(${(K.UX[0] * f).toFixed(1)} ${(K.UX[1] * f).toFixed(1)})`); const op = cl((c - 0.3) / 1.8) * cl((N - 0.3 - c) / 1.8); v.g.setAttribute("opacity", op.toFixed(2)); v.g.style.display = op < 0.01 ? "none" : ""; }); };
    upd(); gsap.ticker.add(() => { if (parent.isConnected && !document.hidden) upd(); });
    return vs.map((v) => v.g);
  }
  // a mountain: a square-based pyramid with a snow cap
  function mountain(g, cx, cy, r, h, col) {
    col = col || "#9DB0C2"; const A = [cx, cy, h], q = (x, y) => [x, y, 0];
    K.quad(g, [q(cx - r, cy + r), q(cx + r, cy + r), A], col, { "stroke-width": 1 });
    K.quad(g, [q(cx + r, cy - r), q(cx + r, cy + r), A], shade(col), { "stroke-width": 1 });
    const f = 0.3, s2 = (a, b) => [a[0] + (A[0] - a[0]) * (1 - f), a[1] + (A[1] - a[1]) * (1 - f), h * (1 - f)];
    K.quad(g, [s2(q(cx - r, cy + r)), s2(q(cx + r, cy + r)), A], "#F7F9FB", { "stroke-width": 0.8 });
    K.quad(g, [s2(q(cx + r, cy - r)), s2(q(cx + r, cy + r)), A], "#DCE3EA", { "stroke-width": 0.8 });
  }
  const live = (svg) => { svg.classList.add("iso", "is-live"); svg.setAttribute("data-noink", ""); return svg.querySelector("defs") || el("defs", null, svg); };
  const cottage = (g, x, y, roof) => { ISO.house(g, F, x, y, 1.9, 1.4, 0.95, 0.8, roof); F.box(g, x + 0.3, y + 0.55, 1.5, 0.2, 0.2, 0.45, { left: "#B7795E", right: shade("#B7795E"), top: "#3E4860" }); };
  const field = (g, x0, y0, x1, y1, col, line) => { K.rect(g, x0, y0, x1, y1, col, 0.8); if (line) for (let y = y0 + 0.45; y < y1; y += 0.5) K.lineGX(g, y, x0, x1, 0, line, 1); };
  const people = (S, pts, set, base) => pts.forEach(([x, y, o]) => S.add(x, y, (g) => K.person(g, x, y, Object.assign({ idle: true }, base || {}, o || {})), set));

  /* ======================= D: RAILWAYS ======================= */
  // A quiet valley; a railway is laid across it; a steam train arrives; mills, terraces and a city rise along the line.
  function rail(svg) {
    const tl = gsap.timeline({ paused: true });
    live(svg);
    sky(svg, "iso-sky-rail", [["0", "#FBF4E2"], ["0.7", "#EFE6CF"], ["1", "#E2DAC4"]]);
    const S = stage(svg, { N: 30, M: 30, s: 0.62, tx: 500, ty: 187, ground: "#DCEBC9" }), G = S.ground, RY = 10.6;
    // ground: fields, a dirt lane in front, the track bed (laid in beat 1)
    // the farmland fades away in D4, and the town's own ground (yards, streets, a park) takes its place
    const farm = el("g", null, G), town = el("g", { opacity: 0 }, G);
    { const G = farm;
    field(G, 0.4, 0.4, 7.6, 5.0, "#E8E0B8", "#D6CB98"); field(G, 8.2, 0.4, 15.4, 4.6, "#CFE3B8"); field(G, 16.0, 0.4, 23.0, 5.2, "#E8E0B8", "#D6CB98"); field(G, 23.6, 0.4, 29.6, 6.0, "#CFE3B8");
    field(G, 0.4, 5.6, 6.0, 9.8, "#D7E8C0"); field(G, 18.6, 6.0, 24.6, 9.8, "#D7E8C0"); field(G, 1.0, 17.6, 7.4, 21.6, "#CFE3B8"); field(G, 20.6, 17.4, 29.6, 21.6, "#E8E0B8", "#D6CB98");
    field(G, 1.0, 23.0, 9.0, 29.4, "#E8E0B8", "#D6CB98"); field(G, 10.0, 23.6, 17.0, 29.4, "#CFE3B8"); field(G, 18.0, 22.6, 29.4, 29.4, "#D7E8C0"); }
    { const G = town, Rr = (a, b, c, d, col, sw) => K.rect(G, a, b, c, d, col, sw == null ? 0.8 : sw);
      Rr(0.4, 0.4, 29.6, 9.6, "#D8D2C4"); for (let x = 1.2; x < 29.6; x += 3.2) Rr(x, 9.6, x + 0.5, 10.4, "#D8D2C4", 0.6);   // mill yards behind the line
      Rr(23.6, 6.4, 29.6, 9.6, "#CFE3B8");                                                                                    // a scrap of green by the warehouse
      [[17.0, 18.6], [20.1, 21.2], [24.7, 26.4], [27.9, 28.6]].forEach(([a, b]) => Rr(0.4, a, 29.6, b, "#C9C0AC"));          // cobbled streets between the terraces
      Rr(9.6, 21.2, 17.8, 29.6, "#B9DDA8"); Rr(13.4, 21.2, 14.0, 29.6, "#EDE3CF", 0.6); Rr(9.6, 24.9, 17.8, 25.5, "#EDE3CF", 0.6);   // the park, with crossing paths
      Rr(14.6, 26.4, 17.0, 28.6, C.water); ISO.poly(G, F.circle([13.7, 25.2, 0], "z", 0.7, 24), "#EDE3CF", { "stroke-width": 0.8 }); }
    K.rect(G, 0, 14.0, 30, 14.9, "#E3D6B0", 0.8);
    const bed = el("g", { opacity: 0 }, G); K.rect(bed, 0, RY - 0.1, 30, RY + 1.2, "#CFC8BE", 1);
    const slp = el("g", null, G), sleepers = [];
    for (let x = 0.2; x < 30; x += 0.36) { const a = P(x, RY + 0.12), b = P(x, RY + 0.95); sleepers.push(el("path", { d: `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`, stroke: "#8F7A6E", "stroke-width": 1.6, opacity: 0 }, slp)); }
    const rails = [RY + 0.2, RY + 0.8].map((y) => K.lineGX(G, y, 0, 30, 0, "#3E4860", 1.5));
    // the slow world: cottages, trees, haystacks, a windmill and animals (they make way for industry in beat 3)
    [[3.2, 6.6, "#8F7A6E"], [9.2, 7.6, "#B77464"], [13.2, 6.0, "#C9A15A"], [16.6, 8.0, "#8F7A6E"], [21.0, 2.6, "#B77464"], [26.2, 7.4, "#C9A15A"]].forEach(([x, y, r]) => S.add(x + 1, y + 0.7, (g) => cottage(g, x, y, r), "rural"));
    S.add(11.6, 2.4, (g) => K.mill(g, 11.6, 2.4), "rural");
    [[2.4, 2.4], [3.4, 1.8], [18.4, 2.6], [19.4, 3.4]].forEach(([x, y]) => S.add(x, y, (g) => K.hay(g, x, y), "rural"));
    [[6.4, 8.8], [8.0, 4.0, "pine"], [14.8, 3.4], [16.2, 6.2, "dark"], [23.8, 8.6], [25.4, 4.6, "pine"], [28.4, 8.8, "dark"], [1.0, 4.6]].forEach(([x, y, k]) => S.add(x, y, (g) => K.tree(g, x, y, 1, k), "rural"));
    [[19.4, 7.2, 1], [21.0, 8.0, -1], [22.4, 7.0, 1], [20.4, 9.0, -1]].forEach(([x, y, d], i) => S.add(x, y, (g) => K.sheep(g, x, y, { dir: d, graze: i % 2 === 0 }), "rural"));
    [[2.6, 19.2, 1], [4.6, 20.4, -1]].forEach(([x, y, d]) => S.add(x, y, (g) => K.cow(g, x, y, { dir: d }), "rural"));
    [[9.4, 16.2, "#B77464"], [13.6, 17.4, "#C9A15A"], [17.4, 16.0, "#8F7A6E"], [12.0, 20.4, "#B77464"], [24.6, 15.6, "#C9A15A"]].forEach(([x, y, r]) => S.add(x + 1, y + 0.7, (g) => cottage(g, x, y, r), "rural"));
    [[8.0, 17.6], [16.0, 19.6, "dark"], [19.6, 18.4], [11.0, 18.8, "pine"], [27.6, 16.4], [6.6, 16.0, "dark"]].forEach(([x, y, k]) => S.add(x, y, (g) => K.tree(g, x, y, 1, k), "rural"));
    people(S, [[10.6, 15.6, { hat: true, top: "#3E4860" }], [11.0, 15.7, { dress: true, bonnet: true, top: "#8C6F9E" }], [18.8, 17.6, { cap: "#5B4A42", top: "#C9A988" }]], "rural");
    // the railway's own buildings (beat 1): a station, a water tower, a signal, telegraph poles along the line
    S.add(14.6, 9.4, (g) => { const s = F.box(g, 13.0, 8.6, 0, 3.2, 1.5, 1.5, { left: "#C9A988", right: "#A9876A", top: "#E3D6C0" }); for (let u = 0.3; u < 3; u += 0.55) F.face(g, F.L, s, u, 0.4, u + 0.3, 1.05, "#FFE6A3", { "stroke-width": 0.5 });
      K.quad(g, [[12.9, 8.5, 1.5], [16.3, 8.5, 1.5], [16.3, 9.35, 2.1], [12.9, 9.35, 2.1]], "#6E6A72", { "stroke-width": 0.8 }); K.quad(g, [[12.9, 10.2, 1.5], [16.3, 10.2, 1.5], [16.3, 9.35, 2.1], [12.9, 9.35, 2.1]], "#8F8784", { "stroke-width": 0.8 });
      const c = P(14.6, 10.1, 1.8); el("circle", { cx: c[0], cy: c[1], r: 5, fill: "#FFFFFF", stroke: "#000", "stroke-width": 0.8 }, g); }, "laid");
    S.add(18.0, 9.6, (g) => { [[-0.4, -0.4], [0.4, -0.4], [0.4, 0.4], [-0.4, 0.4]].forEach(([dx, dy]) => K.quad(g, [[18 + dx - 0.04, 9.4 + dy, 0], [18 + dx + 0.04, 9.4 + dy, 0], [18 + dx + 0.04, 9.4 + dy, 1.4], [18 + dx - 0.04, 9.4 + dy, 1.4]], "#6D5A4A", { "stroke-width": 0.5 })); F.box(g, 17.5, 8.9, 1.4, 1.0, 1.0, 0.7, { left: "#5B6478", right: "#3E4860", top: "#7A8296" }); }, "laid");
    S.add(9.0, 10.2, (g) => { K.quad(g, [[9.0, 10.2, 0], [9.06, 10.2, 0], [9.06, 10.2, 2.0], [9.0, 10.2, 2.0]], "#3E4860", { "stroke-width": 0.5 }); K.quad(g, [[9.06, 10.2, 1.75], [9.6, 10.2, 1.6], [9.6, 10.2, 1.72], [9.06, 10.2, 1.88]], "#B5302E", { "stroke-width": 0.6 }); }, "laid");
    people(S, [[13.6, 10.3, { hat: true, top: "#3E4860" }], [15.2, 10.35, { dress: true, top: "#B5302E", bonnet: true }]], "laid");
    S.add(15, 10.25, (g) => { const xs = []; for (let x = 0.8; x < 30; x += 3.4) xs.push(x); let zs = []; xs.forEach((x) => { zs = K.pole(g, x, 10.25, 2.2, 2); }); K.wires(g, xs, 10.25, zs, [-0.3, 0.3], "#3E4860", 6); }, "laid");
    // industry (beat 3): mills, chimneys, a gasholder, a warehouse by the line, a city in the distance
    [[2.0, 2.6, 3.4, 2.6, 2.4, "#B7795E"], [8.6, 5.6, 3.0, 2.4, 1.9, "#C9A988"], [16.6, 2.4, 3.6, 2.8, 2.6, "#B7795E"], [21.4, 6.4, 3.0, 2.4, 2.0, "#A9876A"], [25.6, 2.6, 2.8, 2.4, 2.2, "#B7795E"]].forEach(([x, y, w, d, h, c]) => S.add(x + w / 2, y + d / 2, (g) => K.factory(g, x, y, w, d, h, c), "mills"));
    [[5.6, 2.2, 5.2], [11.8, 5.2, 4.2], [20.4, 2.0, 5.6], [24.6, 6.0, 4.4], [28.6, 2.2, 4.8]].forEach(([x, y, h]) => S.add(x, y, (g) => K.chimney(g, x, y, h), "mills"));
    S.add(5.0, 7.8, (g) => { F.cyl(g, [5.0, 7.8, 0], "z", 1.0, 1.5, { side: "#9DA6B5", cap: "#B9C1CC" }); }, "mills");
    S.add(26.4, 9.2, (g) => { const w = F.box(g, 24.6, 8.5, 0, 3.6, 1.5, 1.7, { left: "#B7795E", right: shade("#B7795E"), top: "#C9A988" }); for (let u = 0.3; u < 3.4; u += 0.6) F.face(g, F.L, w, u, 0.4, u + 0.3, 0.9, "#FFE6A3", { "stroke-width": 0.5 }); F.face(g, F.L, w, 1.4, 0, 2.2, 1.1, "#5B4A42", { "stroke-width": 0.6 }); }, "mills");
    for (let x = 1.2; x < 29; x += 2.2 + ((x * 7) % 3) * 0.4) { const h = 3 + ((x * 13) % 5) * 0.9, c = ["#C9B8A8", "#BFAE9E", "#D3C4B6"][Math.round(x) % 3], w = 1.6 + ((x * 3) % 2) * 0.6; S.add(x + w / 2, 0.9, (g) => K.tower(g, x, 0.2, w, 1.4, h, c, "#E9DFC9", "none", { punched: true, noShop: true, floor: 0.8 }), "city"); }
    // terraced streets (beat 3) where the cottages stood, with people
    [[3.0, 15.6, 9], [12.6, 15.6, 7], [21.4, 15.6, 8], [6.6, 18.8, 10], [17.4, 18.8, 9]].forEach(([x, y, n], i) => S.add(x + n * 0.47, y + 0.6, (g) => K.terrace(g, x, y, n, 1.4, ["#B7795E", "#C9A988", "#A9876A"][i % 3]), "terr"));
    people(S, [[6.0, 17.4, { cap: "#5B4A42", top: "#4AB4D6" }], [6.3, 17.5, { dress: true, top: "#E5C189", long: true }], [14.6, 17.5, { hat: true, top: "#3E4860" }], [24.0, 17.4, { cap: "#3E4860", top: "#E0785A" }], [10.0, 20.6, { dress: true, bonnet: true, top: "#8C6F9E" }], [20.6, 20.6, { top: "#47B970" }]], "terr");
    // the front of the valley: a farm among fields and an orchard, later a second terraced quarter and a green
    [[12.0, 24.6, "#B77464"], [14.6, 25.4, "#8F7A6E"]].forEach(([x, y, r]) => S.add(x + 1, y + 0.7, (g) => cottage(g, x, y, r), "rural"));
    [[3.0, 25.0], [4.4, 26.6], [6.2, 24.6]].forEach(([x, y]) => S.add(x, y, (g) => K.hay(g, x, y), "rural"));
    [[11.6, 27.6, 1], [13.6, 28.4, -1], [15.4, 27.4, 1]].forEach(([x, y, d]) => S.add(x, y, (g) => K.cow(g, x, y, { dir: d }), "rural"));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = 19.4 + c * 2.4, y = 23.6 + r * 2.0; S.add(x, y, (g) => K.tree(g, x, y, 0.8, "round", "#8CC07A"), "rural"); }
    [[1.6, 29.0, "dark"], [9.4, 22.6], [17.4, 29.0, "pine"]].forEach(([x, y, k]) => S.add(x, y, (g) => K.tree(g, x, y, 1, k)));
    [[1.0, 23.4, 8], [1.0, 26.6, 8], [18.6, 23.4, 10], [18.6, 26.6, 10]].forEach(([x, y, n], i) => S.add(x + n * 0.47, y + 0.6, (g) => K.terrace(g, x, y, n, 1.4, ["#C9A988", "#B7795E", "#A9876A", "#B7795E"][i]), "terr"));
    // the park (D4): trees, a bandstand, benches and people out for a stroll
    [[10.4, 22.0, 1, "dark"], [12.4, 22.4, 1.1], [16.6, 22.0, 1, "dark"], [10.6, 28.6, 1.1], [12.6, 28.0, 0.9, "round"], [17.4, 29.2, 1], [15.6, 23.8, 0.9, "round"]].forEach(([x, y, s, k]) => S.add(x, y, (g) => K.tree(g, x, y, s, k), "terr"));
    S.add(11.4, 25.8, (g) => { F.cyl(g, [11.4, 26.2, 0], "z", 0.7, 0.18, { side: "#D8D2C4", cap: "#EDE6DA" }); for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; if (Math.sin(a) < -0.3) continue; K.seg(g, [11.4 + Math.cos(a) * 0.62, 26.2 + Math.sin(a) * 0.62, 0.18], [11.4 + Math.cos(a) * 0.62, 26.2 + Math.sin(a) * 0.62, 0.95], "#3E4860", 1.2); } const rim = F.circle([11.4, 26.2, 0.95], "z", 0.8, 16); ISO.poly(g, ISO.hull(rim.concat([P(11.4, 26.2, 1.45)])), "#2F6F4E", { "stroke-width": 1 }); }, "terr");
    [[14.6, 23.6], [10.2, 24.6]].forEach(([x, y]) => S.add(x + 0.4, y + 0.1, (g) => K.bench(g, x, y), "terr"));
    people(S, [[13.0, 26.4, { dress: true, top: "#E0785A", bonnet: true }], [13.3, 26.5, { hat: true, top: "#3E4860" }], [15.2, 24.2, { cap: "#5B4A42", top: "#4AB4D6" }], [16.4, 29.0, { dress: true, top: "#8C6F9E", long: true }], [8.6, 25.4, { hat: true, top: "#3E4860" }], [22.6, 25.6, { cap: "#3E4860", top: "#E5C189" }]], "terr");
    // the movers: a horse and cart on the lane (beat 0), the train (beats 2–3)
    let cart, train;
    S.lane(14.4, (g) => { cart = el("g", null, g); K.cart(cart, 0, 14.1, { hay: true, walk: true }); });
    S.lane(RY + 0.2, (g) => { train = convoy(g, 30, steamParts(RY + 0.2, 4)); });
    S.flush();
    // ---- timeline ----
    const st = S.sets;
    sprout(tl, st.laid, beat(1) + 0.4, { stagger: 0.05 });
    gsap.set(cart, along(cart, 2)); train.at(-8);
    tl.to(cart, Object.assign(along(cart, 10), { duration: 1.2, ease: "none" }), 0);                          // D1: the slow world
    tl.to(bed, { opacity: 1, duration: 0.2 }, beat(1));                                                          // D2: the railway is laid
    rails.forEach((r) => drawOn(tl, r, beat(1), 0.8));
    tl.to(sleepers, { opacity: 1, duration: 0.05, stagger: 0.8 / sleepers.length, ease: "none" }, beat(1));
    tl.to(cart, Object.assign(along(cart, 34), { opacity: 0, duration: 0.4 }), beat(1));
    train.to(tl, 15.6, { duration: 0.9, ease: "power1.out" }, beat(2));            // D3: the train arrives
    shrink(tl, st.rural, beat(3) - 0.1);
    tl.to(farm, { opacity: 0, duration: 0.25 }, beat(3)); tl.to(town, { opacity: 1, duration: 0.25 }, beat(3));                                                                         // D4: industry grows
    sprout(tl, st.mills, beat(3) + 0.12, { y: true, dur: 0.45, stagger: 0.06, ease: "back.out(1.4)" });
    sprout(tl, st.terr, beat(3) + 0.25, { y: true, dur: 0.3, stagger: 0.05 });
    sprout(tl, st.city, beat(3) + 0.1, { y: true, dur: 0.5, stagger: 0.02, ease: "power2.out" });
    train.to(tl, 40, { duration: 1.4, ease: "power1.in" }, beat(3) + 0.1);
    ISO.tweens.forEach((t) => t.play && t.play());
    hold(tl, 3);
    return tl;
  }


  /* ======================= E: HIGHWAYS ======================= */
  // A highway is laid across open country below the mountains; traffic flows; roadside economies and towns grow along it.
  function road(svg) {
    const tl = gsap.timeline({ paused: true });
    live(svg);
    sky(svg, "iso-sky-road", [["0", "#F2F8FD"], ["0.7", "#DCEBF7"], ["1", "#CFE2F2"]]);
    const N = 32, S = stage(svg, { N, M: 22, s: 0.66, tx: 420, ty: 215, ground: "#DCEBD3" }), G = S.ground, HY = 9.0;
    field(G, 0.4, 13.0, 5.6, 17.0, "#E8E0B8", "#D6CB98"); field(G, 24.0, 16.6, 31.6, 21.6, "#CFE3B8"); field(G, 0.4, 18.2, 9.0, 21.6, "#D7E8C0");
    K.rect(G, 21.4, 4.6, 29.6, 7.8, C.water, 1);
    // the highway: two carriageways and a grass median, laid section by section from the left (beat 0)
    const segs = [];
    for (let x = 0; x < N; x += 1) { const g = el("g", { opacity: 0 }, G); K.rect(g, x, HY - 0.3, x + 1, HY + 3.7, "#E9EBEE", 0); K.rect(g, x, HY, x + 1, HY + 1.5, "#5B6478", 0); K.rect(g, x, HY + 1.9, x + 1, HY + 3.4, "#5B6478", 0); K.rect(g, x, HY + 1.5, x + 1, HY + 1.9, "#A9D69B", 0);
      [HY + 0.75, HY + 2.65].forEach((y) => K.lineGX(g, y, x + 0.15, x + 0.65, 0, "#FFFFFF", 1.5)); segs.push(g); }
    const edges = el("g", { opacity: 0 }, G); [HY, HY + 1.5, HY + 1.9, HY + 3.4].forEach((y) => K.lineGX(edges, y, 0, N, 0, "#3E4860", 1));
    const side = el("g", { opacity: 0 }, G); K.rect(side, 15.0, HY + 3.7, 16.4, 22, "#5B6478", 1);
    // the landscape: mountains, a lake, pine woods
    [[2.6, 2.6, 2.6, 2.4, "#A9BBCB", 0.8], [6.4, 2.2, 3.2, 3.2, "#9DB0C2", 0.7], [10.8, 2.4, 3.6, 4.2, "#93A7BA", 0.6], [15.0, 2.0, 2.8, 2.9, "#A9BBCB", 0.72], [18.8, 2.8, 2.6, 2.2, "#B3C3D2", 0.85]].forEach(([x, y, r, h, c, sn]) => S.add(x, y, (g) => K.mountain(g, x, y, r, h, { col: c, snow: sn })));
    [[1.0, 6.6], [2.4, 7.8], [7.4, 7.2], [8.8, 6.0], [13.6, 7.4], [19.6, 6.6], [20.2, 8.4], [30.4, 8.6], [27.8, 3.4], [29.4, 2.0], [12.0, 5.8]].forEach(([x, y], i) => S.add(x, y, (g) => K.tree(g, x, y, 1.1, i % 3 ? "pine" : "dark")));
    [[2.0, 14.0], [6.6, 20.2], [12.4, 21.0], [28.8, 15.0], [30.4, 19.4], [21.0, 21.2], [3.4, 20.6]].forEach(([x, y], i) => S.add(x, y, (g) => K.tree(g, x, y, 1.1, i % 2 ? "pine" : "dark")));
    // roadside economies (beat 2): a filling station, a diner, a motel, a fruit stand, a billboard, a truck stop, towns along the side road, a city on the plain
    const pop = (x, y, fn) => S.add(x, y, fn, "pops");
    pop(7.6, 14.2, (g) => { [[6.4, 13.6], [8.8, 13.6], [6.4, 15.0], [8.8, 15.0]].forEach(([x, y]) => F.box(g, x, y, 0, 0.12, 0.12, 1.2, { left: C.g1, right: C.g2, top: C.w1 })); [[7.2, 14.2], [8.2, 14.2]].forEach(([x, y]) => { const b = F.box(g, x, y, 0, 0.3, 0.3, 0.7, { left: "#E0785A", right: shade("#E0785A"), top: "#F1F2F4" }); F.face(g, F.L, b, 0.05, 0.4, 0.25, 0.6, "#FFFFFF", { "stroke-width": 0.5 }); }); F.box(g, 6.2, 13.4, 1.2, 3.0, 1.9, 0.2, { left: "#E0785A", right: shade("#E0785A"), top: "#FFFFFF" }); F.box(g, 4.6, 13.2, 0, 1.4, 1.4, 1.0, { left: "#F1F2F4", right: C.w3, top: C.w1 }); K.oldCar(g, 7.0, 14.8, "#4AB4D6"); });
    pop(11.6, 13.9, (g) => { const d = F.box(g, 10.2, 13.2, 0, 3.0, 1.5, 1.1, { left: "#F1F2F4", right: C.w3, top: "#E0785A" }); F.face(g, F.L, d, 0.2, 0.3, 2.8, 0.8, "#9ED9CF", { "stroke-width": 0.6 }); F.face(g, F.L, d, 0.1, 0.85, 2.9, 1.05, "#E0785A", { "stroke-width": 0.5 }); K.quad(g, [[13.5, 13.4, 0], [13.56, 13.4, 0], [13.56, 13.4, 2.0], [13.5, 13.4, 2.0]], "#3E4860", { "stroke-width": 0.5 }); K.quad(g, [[13.2, 13.4, 1.9], [13.9, 13.4, 1.9], [13.9, 13.4, 2.6], [13.2, 13.4, 2.6]], "#FFCD00", { "stroke-width": 0.8 }); [[10.6, 14.9], [11.6, 15.0]].forEach(([x, y], i) => K.oldCar(g, x, y + 0.1, ["#B5302E", "#A6D84A"][i])); });
    pop(20.0, 14.2, (g) => { const m = F.box(g, 17.6, 13.4, 0, 4.6, 1.4, 1.0, { left: "#F3E2C6", right: "#DCC9A9", top: "#E8A98D" }); for (let u = 0.3; u < 4.4; u += 0.75) { F.face(g, F.L, m, u, 0, u + 0.3, 0.65, "#4AB4D6", { "stroke-width": 0.5 }); F.face(g, F.L, m, u + 0.4, 0.3, u + 0.65, 0.6, "#FFE6A3", { "stroke-width": 0.5 }); } K.quad(g, [[22.4, 13.6, 0], [22.46, 13.6, 0], [22.46, 13.6, 2.2], [22.4, 13.6, 2.2]], "#3E4860", { "stroke-width": 0.5 }); K.quad(g, [[22.1, 13.6, 1.8], [23.0, 13.6, 1.8], [23.0, 13.6, 2.5], [22.1, 13.6, 2.5]], "#47B970", { "stroke-width": 0.8 }); });
    pop(25.6, 13.8, (g) => { F.box(g, 24.8, 13.4, 0, 1.4, 0.8, 0.5, { left: "#C9A988", right: "#A9876A", top: "#E3D6C0" }); K.quad(g, [[24.7, 13.3, 1.0], [26.3, 13.3, 1.0], [26.3, 14.3, 0.8], [24.7, 14.3, 0.8]], "#E0785A", { "stroke-width": 0.6 }); [24.9, 25.3, 25.7].forEach((x, i) => F.box(g, x, 14.0, 0.5, 0.3, 0.2, 0.12, { left: ["#E0785A", "#FFCD00", "#A6D84A"][i], right: "#B5302E", top: ["#F4A88A", "#FFE680", "#C9EE8A"][i] })); K.person(g, 25.4, 14.6, { cap: "#E0785A", top: "#F1F2F4" }); });
    pop(6.6, 8.4, (g) => { [5.6, 7.2].forEach((x) => K.quad(g, [[x, 8.4, 0], [x + 0.06, 8.4, 0], [x + 0.06, 8.4, 1.4], [x, 8.4, 1.4]], "#3E4860", { "stroke-width": 0.5 })); K.quad(g, [[4.8, 8.4, 1.3], [8.0, 8.4, 1.3], [8.0, 8.4, 2.6], [4.8, 8.4, 2.6]], "#FFCD00", { "stroke-width": 1 }); K.quad(g, [[5.1, 8.4, 1.55], [6.6, 8.4, 1.55], [6.6, 8.4, 2.35], [5.1, 8.4, 2.35]], "#FFFFFF", { "stroke-width": 0.6 }); K.quad(g, [[6.8, 8.4, 1.6], [7.7, 8.4, 1.6], [7.7, 8.4, 2.3], [6.8, 8.4, 2.3]], "#E0785A", { "stroke-width": 0.6 }); });
    pop(24.4, 3.2, (g) => { K.rect(g, 21.4, 1.0, 26.6, 4.2, "#C9CED6", 0.8); [[21.8, 1.4], [21.8, 2.6]].forEach(([x, y]) => ISO.draw ? K.bus(g, x, y, "#B5302E") : 0); const b = F.box(g, 25.0, 1.2, 0, 1.4, 1.6, 0.9, { left: "#F1F2F4", right: C.w3, top: "#47B970" }); F.face(g, F.L, b, 0.2, 0.3, 1.2, 0.7, "#9ED9CF", { "stroke-width": 0.5 }); });
    [[12.6, 16.8, "#B77464"], [12.6, 19.6, "#6E6A72"], [17.2, 16.4, "#8F8784"], [17.2, 19.2, "#B77464"], [20.0, 17.4, "#6E6A72"], [9.8, 17.6, "#8F8784"]].forEach(([x, y, r]) => pop(x + 1.1, y + 0.8, (g) => { ISO.house(g, F, x, y, 2.2, 1.6, 0.9, 0.7, r); K.oldCar(g, x + 0.6, y + 1.9, ["#FFCD00", "#A6D84A", "#F1F2F4"][Math.round(x) % 3]); }));
    [[14.6, 18.4, { top: "#E0785A" }], [16.8, 21.0, { dress: true, top: "#4AB4D6" }], [12.4, 15.6, { cap: "#3E4860", top: "#FFCD00" }], [19.2, 15.6, { top: "#8C6F9E" }]].forEach(([x, y, o]) => pop(x, y, (g) => K.person(g, x, y, Object.assign({ idle: true }, o))));
    for (let x = 23.2; x < 31.6; x += 1.9) { const h = 2.6 + ((x * 7) % 5) * 0.9, c = ["#C9D6E3", "#9ED9CF", "#F1F2F4"][Math.round(x) % 3]; S.add(x + 0.8, 0.9, (g) => K.tower(g, x, 0.2, 1.6, 1.4, h, c, C.water, "none"), "city"); }
    // traffic (beat 1): one speed per lane
    const OLD = ["#E0785A", "#4AB4D6", "#FFCD00", "#A6D84A", "#F1F2F4", "#8C6F9E", "#B5302E", "#47B970"], cars = [];
    const veh = (y, k) => (k === "truck" ? [2.4, (g, x0) => { F.box(g, x0, y, 0.12, 1.7, 0.6, 0.85, { left: "#F1F2F4", right: C.w3, top: "#FFFFFF" }); F.box(g, x0 + 1.75, y + 0.03, 0.12, 0.55, 0.55, 0.7, { left: "#B5302E", right: shade("#B5302E"), top: "#E0785A" }); }] : [1.4, (g, x0) => K.oldCar(g, x0, y, OLD[k % OLD.length])]);
    [[HY + 0.06, 1, 2.2, ["c0", "truck", "c2", "c4"]], [HY + 0.8, 1, 3.0, ["c1", "c3", "c5"]], [HY + 1.96, -1, 2.4, ["c6", "truck", "c7", "c0"]], [HY + 2.7, -1, 3.2, ["c2", "c5", "c3"]]].forEach(([y, dir, sp, list]) => {
      S.lane(y, (g) => { const lg = el("g", null, g); cars.push(lg); loopLane(lg, N, dir, sp, list.map((k, i) => { const [len, draw] = veh(y, k === "truck" ? "truck" : +k.slice(1)); return [i / list.length, len, draw]; })); });
    });
    S.flush();
    // ---- timeline: E1 the highway is laid, E2 traffic flows, E3 roadside economies ----
    tl.to(segs, { opacity: 1, duration: 0.04, stagger: 0.6 / segs.length, ease: "none" }, 0);
    tl.to(edges, { opacity: 1, duration: 0.2 }, 0.55);
    gsap.set(cars, { opacity: 0 });
    tl.to(cars, { opacity: 1, duration: 0.15, stagger: 0.12 }, beat(1));
    tl.to(side, { opacity: 1, duration: 0.2 }, beat(2));
    sprout(tl, S.sets.pops, beat(2) + 0.05, { stagger: 0.04 });
    sprout(tl, S.sets.city, beat(2), { y: true, dur: 0.6, stagger: 0.04, ease: "power2.out" });
    ISO.tweens.forEach((t) => t.play && t.play());
    hold(tl, 2);
    return tl;
  }

  /* ======================= F: TELECOMS ======================= */
  // New York and London on either side of the ocean: lines and masts, a cable laid by ship, information flowing, cities transformed.
  function telecom(svg) {
    const tl = gsap.timeline({ paused: true });
    live(svg);
    sky(svg, "iso-sky-tel", [["0", "#EEF4FA"], ["0.7", "#DCE8F3"], ["1", "#CCDDEE"]]);
    // The scene is mirrored (gx runs down-left), so London sits on gx 0–10 at the top right and New York on gx 30–40 at the bottom left.
    const N = 40, M = 10, S = stage(svg, { N, M, s: 0.72, tx: 1700, ty: 150, noSlab: true, mirror: true }), G = S.ground, L1 = 10, R0 = 30, CYL = 4.6;
    const ny = (x) => x + 30, ld = (x) => x - 30;
    // the land on each coast and the ocean between (the water sits a little lower)
    [[0, L1, "#E3E6EB"], [R0, N, "#E3E6EB"]].forEach(([a, b, c]) => { K.quad(G, [[a, M, 0], [b, M, 0], [b, M, -0.9], [a, M, -0.9]], "#C9CED6"); K.rect(G, a, 0, b, M, c, 1.3); });
    K.quad(G, [[N, 0, 0], [N, M, 0], [N, M, -0.9], [N, 0, -0.9]], "#AEB5C0");
    K.quad(G, [[L1, M, -0.35], [R0, M, -0.35], [R0, M, -0.9], [L1, M, -0.9]], "#5FA8D8"); K.quad(G, [[L1, 0, -0.35], [R0, 0, -0.35], [R0, M, -0.35], [L1, M, -0.35]], "#8CC8EE", { "stroke-width": 1.3 });
    K.quad(G, [[L1, 0, 0], [L1, M, 0], [L1, M, -0.35], [L1, 0, -0.35]], "#C9CED6");
    { const wv = el("g", null, G); for (let i = 0; i < 26; i++) { const x = L1 + 0.6 + ((i * 7.3) % 18.6), y = 0.6 + ((i * 3.7) % 8.8), a = P(x, y, -0.35), b = P(x + 0.5, y, -0.35); const w = el("path", { d: `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`, stroke: "#FFFFFF", "stroke-width": 1.4, opacity: 0.8 }, wv); gsap.to(w, { x: 8, duration: 2.6 + (i % 5) * 0.4, repeat: -1, yoyo: true, ease: "sine.inOut" }); } }
    // streets along each coast
    [[0, L1 - 0.6], [R0 + 0.6, N]].forEach(([a, b]) => { K.rect(G, a, 6.4, b, 7.9, "#5B6478", 1); K.rect(G, a, 6.0, b, 6.4, "#E9EBEE", 0.6); K.rect(G, a, 7.9, b, 8.3, "#E9EBEE", 0.6); for (let x = a + 0.4; x < b - 0.6; x += 1.4) K.lineGX(G, 7.15, x, x + 0.7, 0, "#FFFFFF", 1.4); });
    // NEW YORK: towers behind the street, lower blocks in front; LONDON: brick terraces, a clock tower, a dome
    const glow = [], grow = [];
    const tower = (x, y, w, d, h, col, set, roof) => S.add(x + w / 2, y + d / 2, (g) => { K.tower(g, x, y, w, d, h, col, "#C9D3DE", roof || "none", { punched: true, floor: 0.7 }); const o = el("g", { opacity: 0 }, g); K.tower(o, x, y, w, d, h, col, "#FFE6A3", roof || "none", { punched: true, floor: 0.7 }); glow.push(o); }, set);
    [[0.6, 0.6, 2.0, 2.0, 6.6, "#C9B8A8"], [5.4, 0.8, 1.8, 1.8, 5.4, "#D3C4B6"], [7.6, 1.4, 1.8, 2.0, 7.2, "#BFAE9E"], [1.2, 3.6, 2.0, 2.0, 4.6, "#B7795E"], [5.0, 3.4, 2.2, 2.2, 3.8, "#C9B8A8"]].forEach(([x, y, w, d, h, c]) => tower(ny(x), y, w, d, h, c));
    [[0.6, 8.4, 2.4, 1.4, 2.2, "#B7795E"], [3.4, 8.4, 2.0, 1.4, 2.8, "#C9A988"], [5.8, 8.4, 2.6, 1.4, 2.0, "#A9977C"]].map(([x, ...r]) => [ny(x), ...r]).forEach(([x, y, w, d, h, c]) => S.add(x + w / 2, y + 0.7, (g) => K.shop(g, x, y, w, d, h, c, null, { win: "#C9D3DE", sign: "#262C3A" })));
    [[31.0, 1.0, 2.6, 1.8, 3.0, "#B7795E"], [34.0, 1.2, 2.4, 1.8, 3.4, "#C9A988"], [36.8, 0.8, 2.6, 2.0, 2.8, "#A9977C"], [31.4, 3.6, 2.4, 2.0, 2.4, "#C9A988"], [36.4, 3.6, 2.6, 2.0, 2.6, "#B7795E"]].forEach(([x, y, w, d, h, c]) => tower(ld(x), y, w, d, h, c));
    // LONDON's clock tower: a slender stone shaft, a clock face on each side, a belfry and a steep dark spire
    S.add(4.6, 4.4, (g) => { const st = { left: "#E3D6B0", right: "#C9BC96", top: "#F3E9C8" }; const t = F.box(g, 4.2, 4.0, 0, 0.8, 0.8, 4.6, st); for (let z = 0.4; z < 3.6; z += 0.5) { F.face(g, F.L, t, 0.15, z, 0.3, z + 0.3, "#C9BC96", { "stroke-width": 0.5 }); F.face(g, F.L, t, 0.5, z, 0.65, z + 0.3, "#C9BC96", { "stroke-width": 0.5 }); }
      F.box(g, 4.1, 3.9, 3.7, 1.0, 1.0, 0.9, st); [[4.6, 4.9, F.L], [5.1, 4.4, F.R]].forEach(([x, y]) => { const c = P(x, y, 4.15); el("circle", { cx: c[0], cy: c[1], r: 8, fill: "#F3E9C8" }, g); el("circle", { cx: c[0], cy: c[1], r: 6, fill: "#FFFFFF" }, g); el("path", { d: `M${c[0]} ${c[1]} L${c[0]} ${c[1] - 4.5} M${c[0]} ${c[1]} L${c[0] + 3} ${c[1] + 1}`, stroke: "#000", "stroke-width": 1 }, g); });
      F.box(g, 4.2, 4.0, 4.6, 0.8, 0.8, 0.5, { left: "#C9BC96", right: "#B3A67E", top: "#5B6478" }); K.quad(g, [[4.2, 4.8, 5.1], [5.0, 4.8, 5.1], [4.6, 4.4, 6.6]], "#5B6478"); K.quad(g, [[5.0, 4.0, 5.1], [5.0, 4.8, 5.1], [4.6, 4.4, 6.6]], "#3E4860"); K.seg(g, [4.6, 4.4, 6.6], [4.6, 4.4, 7.0], "#C99A5B", 1.5); });
    // LONDON's big wheel by the river
    S.add(10.4, 2.4, (g) => { const cx = 10.45, cy = 2.4, cz = 1.95, R = 1.75; F.box(g, 9.9, cy - 1.1, -0.35, 1.0, 2.2, 0.45, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" }); K.seg(g, [cx - 0.9, cy + 0.4, 0], [cx, cy, cz], "#C9CED6", 2.4); K.seg(g, [cx + 0.6, cy - 0.4, 0], [cx, cy, cz], "#C9CED6", 2.4);
      ISO.poly(g, F.circle([cx, cy, cz], "x", R, 40), "none", { stroke: "#3E4860", "stroke-width": 3, "data-keepstroke": "" }); ISO.poly(g, F.circle([cx, cy, cz], "x", R * 0.95, 40), "none", { stroke: "#9DA6B5", "stroke-width": 1.4 });
      for (let k = 0; k < 16; k++) { const a = (k / 16) * Math.PI * 2, y = cy + Math.cos(a) * R, z = cz + Math.sin(a) * R; K.seg(g, [cx, cy, cz], [cx, y, z], "#9DA6B5", 0.7); const p = P(cx, y, z); el("ellipse", { cx: p[0], cy: p[1] + 1.5, rx: 3, ry: 2.2, fill: "#FFFFFF" }, g); }
      const h = P(cx, cy, cz); el("circle", { cx: h[0], cy: h[1], r: 2.6, fill: "#9DA6B5" }, g); });
    // NEW YORK: an art-deco skyscraper with setbacks and a spire, and the statue in the harbour
    S.add(34.0, 2.2, (g) => { const c = "#C9C3B8", st = { left: c, right: shade(c), top: lite(c) };
      const lv = [[33.0, 1.2, 2.0, 2.0, 0, 3.6], [33.3, 1.5, 1.4, 1.4, 3.6, 3.8], [33.55, 1.75, 0.9, 0.9, 7.4, 2.0], [33.75, 1.95, 0.5, 0.5, 9.4, 0.8]];
      lv.forEach(([x, y, w, d, z, h]) => { const b = F.box(g, x, y, z, w, d, h, st); for (let u = 0.12; u < w - 0.1; u += 0.22) F.face(g, F.L, b, u, 0.15, u + 0.08, h - 0.15, "#8F9AAA", { "stroke-width": 0 }); for (let u = 0.12; u < d - 0.1; u += 0.22) F.face(g, F.R, b, u, 0.15, u + 0.08, h - 0.15, "#7A8496", { "stroke-width": 0 }); });
      K.seg(g, [34.0, 2.2, 10.2], [34.0, 2.2, 11.6], "#626E88", 2); });
    S.add(27.6, 7.8, (g) => { const x = 27.6, y = 7.8; F.box(g, x - 0.7, y - 0.7, -0.35, 1.4, 1.4, 0.35, { left: "#C9BC96", right: "#B3A67E", top: "#9BC27E" });
      F.box(g, x - 0.35, y - 0.35, 0, 0.7, 0.7, 0.75, { left: "#D8CFB8", right: "#BFB59C", top: "#E3DCCB" }); F.box(g, x - 0.25, y - 0.25, 0.75, 0.5, 0.5, 0.35, { left: "#D8CFB8", right: "#BFB59C", top: "#E3DCCB" });
      const b = P(x, y, 1.1), G1 = "#7FB8A0", G2 = "#5E9C84", k = 34.64 / 1.6;
      el("path", { d: `M${b[0] - 8} ${b[1]} L${b[0] - 5} ${b[1] - 1.2 * k} L${b[0] - 3} ${b[1] - 1.5 * k} L${b[0] + 3} ${b[1] - 1.5 * k} L${b[0] + 5} ${b[1] - 1.1 * k} L${b[0] + 8} ${b[1]} Z`, fill: G1 }, g);
      el("path", { d: `M${b[0] + 1} ${b[1]} L${b[0] + 3} ${b[1] - 1.5 * k} L${b[0] + 5} ${b[1] - 1.1 * k} L${b[0] + 8} ${b[1]} Z`, fill: G2, "data-nostroke": "" }, g);
      const hd = [b[0], b[1] - 1.5 * k - 6]; el("circle", { cx: hd[0], cy: hd[1], r: 4.2, fill: G1 }, g);
      for (let q = 0; q < 7; q++) { const a = -Math.PI * 0.9 + q * Math.PI * 0.8 / 6; el("path", { d: `M${hd[0] + Math.cos(a) * 3.5} ${hd[1] + Math.sin(a) * 3.5} L${hd[0] + Math.cos(a) * 8} ${hd[1] + Math.sin(a) * 8}`, stroke: G2, "stroke-width": 1.6 }, g); }
      el("path", { d: `M${b[0] + 3} ${b[1] - 1.45 * k} L${b[0] + 6} ${b[1] - 2.1 * k} L${b[0] + 8.5} ${b[1] - 2.05 * k} L${b[0] + 5.5} ${b[1] - 1.4 * k} Z`, fill: G1 }, g);
      el("path", { d: `M${b[0] + 6.4} ${b[1] - 2.1 * k} l-1.5 -4 l4 -1 Z`, fill: G2 }, g); el("path", { d: `M${b[0] + 7.4} ${b[1] - 2.3 * k - 4} q-3 -5 0 -9 q3 4 0 9 Z`, fill: "#F2B134" }, g);
      el("path", { d: `M${b[0] - 5} ${b[1] - 0.9 * k} l-3 1 l1 4 l3 -1 Z`, fill: G2 }, g); });

    [[31.2, 8.4, 2.2, 1.4, 2.6, "#B7795E", "#B5302E"], [33.8, 8.4, 2.4, 1.4, 2.2, "#C9A988", "#2F6F4E"], [36.6, 8.4, 2.4, 1.4, 2.8, "#A9977C", "#204C8A"]].map(([x, ...r]) => [ld(x), ...r]).forEach(([x, y, w, d, h, c, aw]) => S.add(x + w / 2, y + 0.7, (g) => K.shop(g, x, y, w, d, h, c, aw, { win: "#C9D3DE", sign: "#262C3A" })));
    // F4: new towers rise in both cities
    [[38.2, 4.0, 1.6, 1.6, 9.6, "#9ED9CF"], [32.8, 4.0, 1.4, 1.4, 7.6, "#C9D6E3"], [8.0, 4.4, 1.4, 1.4, 6.8, "#C9D6E3"], [2.6, 4.4, 1.4, 1.2, 5.2, "#9ED9CF"]].forEach(([x, y, w, d, h, c]) => S.add(x + w / 2, y + d / 2, (g) => K.tower(g, x, y, w, d, h, c, C.water, "plant"), "grow"));
    // cable landing stations at each shore
    [[8.4, 4.0], [30.4, 4.0]].forEach(([x, y]) => S.add(x + 0.6, y + 0.6, (g) => { const b = F.box(g, x, y, 0, 1.2, 1.2, 0.8, { left: "#F1F2F4", right: C.w3, top: C.w1 }); F.face(g, F.L, b, 0.3, 0, 0.8, 0.5, "#3E4860", { "stroke-width": 0.5 }); }));
    // telephone lines: poles along the back pavement, wires strung along the street and into the buildings
    const lines = el("g", { opacity: 0 }, null); S.add(5, 6.2, (g) => { g.appendChild(lines); [[0.8, L1 - 1.2], [R0 + 1.2, N - 0.8]].forEach(([a, b]) => { const xs = []; for (let x = a; x <= b + 0.01; x += (b - a) / 3) xs.push(x); let zs = []; xs.forEach((x) => { zs = K.pole(lines, x, 6.2, 2.4, 2); }); K.wires(lines, xs, 6.2, zs, [-0.3, 0.3], "#3E4860", 6);
      xs.forEach((x, i) => { const a = P(x, 5.9, zs[0]), c = P(x + 0.4, 4.2, 2.2); el("path", { d: `M${a[0]} ${a[1]} Q${(a[0] + c[0]) / 2} ${(a[1] + c[1]) / 2 + 4} ${c[0]} ${c[1]}`, stroke: "#3E4860", "stroke-width": 0.7, fill: "none" }, lines); }); }); });
    // masts on the rooftops (their signals show in beat 2)
    const masts = [], arcs = [];
    [[34.0, 2.2, 8.6], [8.1, 1.8, 2.8], [38.5, 2.4, 7.2]].forEach(([x, y, z]) => S.add(x, y + 0.01, (g) => { const m = el("g", { opacity: 0 }, g); masts.push(m); [[-0.12, -0.12], [0.12, -0.12], [0.12, 0.12], [-0.12, 0.12]].forEach(([dx, dy]) => ISO.line(m, [P(x + dx, y + dy, z), P(x, y, z + 1.6)], { "stroke-width": 0.9 })); const t = P(x, y, z + 1.6);
      [1, 2, 3].forEach((r) => arcs.push(el("path", { d: `M${t[0] - 5 - r * 6} ${t[1] - r * 3} Q${t[0]} ${t[1] - 8 - r * 8} ${t[0] + 5 + r * 6} ${t[1] - r * 3}`, stroke: "#4AB4D6", "stroke-width": 2, fill: "none", opacity: 0, class: "fx anim blink", style: `animation-delay:${r * 0.3}s` }, m))); }));
    // the cable: from shore to shore along the sea, laid behind the ship (beat 1), then carrying pulses both ways (beat 2)
    let cable, ship, dots;
    S.lane(CYL - 0.3, (g) => { const a = P(L1 - 1.0, CYL + 0.3, 0), b = P(L1, CYL + 0.3, -0.35), c = P(R0, CYL + 0.3, -0.35), d = P(R0 + 1.0, CYL + 0.3, 0);
      cable = el("path", { d: `M${d[0]} ${d[1]} L${c[0]} ${c[1]} L${b[0]} ${b[1]} L${a[0]} ${a[1]}`, stroke: "#262C3A", "stroke-width": 2.6, fill: "none", "stroke-linecap": "round" }, g);
      dots = el("g", { opacity: 0 }, g);
      for (let i = 0; i < 10; i++) { const dot = el("circle", { r: 5, fill: i % 2 ? "#47B970" : "#4AB4D6", stroke: "#FFFFFF", "stroke-width": 1 }, dots); const fw = i % 2 === 0, o = { u: (i / 10) };
        const set = () => { const u = fw ? o.u : 1 - o.u, q = P(L1 + (R0 - L1) * u, CYL + 0.3, -0.35); dot.setAttribute("cx", q[0].toFixed(1)); dot.setAttribute("cy", q[1].toFixed(1)); }; set();
        gsap.to(o, { u: "+=1", duration: 2.2, repeat: -1, ease: "none", modifiers: { u: (v) => +v % 1 }, onUpdate: set }); }
      ship = el("g", null, g); const y = CYL - 0.1, z = -0.35;
      F.box(ship, -1.0, y, z, 2.6, 0.8, 0.45, { left: "#262C3A", right: "#1E2433", top: "#C9CED6" }); F.box(ship, 0.5, y + 0.1, z + 0.45, 0.9, 0.6, 0.55, { left: "#F1F2F4", right: C.w3, top: "#FFFFFF" }); F.box(ship, 0.85, y + 0.25, z + 1.0, 0.25, 0.25, 0.35, { left: "#B5302E", right: shade("#B5302E"), top: "#262C3A" });
      K.seg(ship, [-0.8, y + 0.4, z + 0.45], [-1.1, y + 0.4, z + 1.4], "#E0785A", 2); F.cyl(ship, [-0.2, y + 0.4, z + 0.45], "z", 0.25, 0.2, { side: "#626E88", cap: "#3E4860" });
      gsap.set(ship, along(ship, R0 - 1.2));
    });
    // street life: yellow cabs in New York, red buses in London, people (beat 4), speech bubbles
    S.lane(6.5, (g) => { const a = el("g", null, g); loopLane(a, L1 - 0.6, 1, 1.6, [[0.2, 2.8, (h, x0) => K.bus(h, x0, 6.5, "#B5302E")]]); const b = el("g", { transform: `translate(${(K.UX[0] * (R0 + 0.6)).toFixed(1)} ${(K.UX[1] * (R0 + 0.6)).toFixed(1)})` }, g); loopLane(b, N - R0 - 0.6, 1, 1.8, [[0, 1.2, (h, x0) => K.car(h, x0, 6.5, "#FFCD00", "x")], [0.5, 1.2, (h, x0) => K.car(h, x0, 6.5, "#F1F2F4", "x")]]); });
    S.lane(7.2, (g) => { const a = el("g", null, g); loopLane(a, L1 - 0.6, -1, 1.9, [[0.1, 1.2, (h, x0) => K.car(h, x0, 7.25, "#3E4860", "x")], [0.6, 1.2, (h, x0) => K.car(h, x0, 7.25, "#E0785A", "x")]]); const b = el("g", { transform: `translate(${(K.UX[0] * (R0 + 0.6)).toFixed(1)} ${(K.UX[1] * (R0 + 0.6)).toFixed(1)})` }, g); loopLane(b, N - R0 - 0.6, -1, 2.0, [[0.3, 1.2, (h, x0) => K.car(h, x0, 7.25, "#FFCD00", "x")], [0.8, 1.2, (h, x0) => K.car(h, x0, 7.25, "#4AB4D6", "x")]]); });
    const ppl = [], bubbles = [];
    [[31.6, 8.15], [32.0, 8.2], [34.6, 8.1], [36.8, 8.2], [38.6, 6.1], [2.4, 8.15], [3.0, 8.2], [5.6, 8.1], [8.2, 8.15], [1.6, 6.1], [7.0, 6.15]].forEach(([x, y], i) => S.add(x, y, (g) => { const p = el("g", null, g); K.person(p, x, y, { idle: true, phone: i % 3 !== 1, dress: i % 4 === 1, top: ["#47B970", "#4AB4D6", "#E0785A", "#FFCD00", "#8C6F9E", "#3E4860"][i % 6] }); ppl.push(p);
      if (i % 3 === 0) { const q = P(x, y, 0.95); const b = el("g", { opacity: 0 }, g); el("path", { d: `M${q[0] + 2} ${q[1] - 14} h14 v8 h-9 l-3 3 v-3 h-2 Z`, fill: "#FFFFFF", stroke: "#000", "stroke-width": 0.7 }, b); [0, 1, 2].forEach((k) => el("circle", { cx: q[0] + 5.5 + k * 3.5, cy: q[1] - 10, r: 0.9, fill: "#3E4860" }, b)); bubbles.push(b); } }));
    S.flush();
    // ---- timeline ----
    gsap.set(ppl, { opacity: 0 });
    tl.to([lines].concat(masts), { opacity: 1, duration: 0.3, stagger: 0.1 }, 0.1);                         // F1
    drawOn(tl, cable, beat(1), 0.9);                                                                              // F2: the ship lays the cable
    tl.fromTo(ship, along(ship, R0 - 1.2), Object.assign(along(ship, L1 - 0.4), { duration: 0.9, ease: "none" }), beat(1));
    tl.to(ship, { opacity: 0, duration: 0.15 }, beat(1) + 0.9);
    tl.to(dots, { opacity: 1, duration: 0.2 }, beat(2));                                                          // F3: information moves instantly
    tl.to(arcs, { opacity: 1, duration: 0.15, stagger: 0.06 }, beat(2) + 0.1);
    sprout(tl, S.sets.grow, beat(3), { y: true, dur: 0.4, stagger: 0.08, ease: "power2.out" });                  // F4: societies transformed
    tl.to(glow, { opacity: 1, duration: 0.2, stagger: 0.04 }, beat(3));
    tl.to(ppl, { opacity: 1, duration: 0.3 }, beat(3) + 0.2);
    tl.to(bubbles, { opacity: 1, duration: 0.2, stagger: 0.2 }, beat(3) + 0.3);
    ISO.tweens.forEach((t) => t.play && t.play());
    hold(tl, 3);
    return tl;
  }

  /* ======================= I: A WORLD REMADE ======================= */
  // One street from 1900 to today. Everything on it changes, era by era; the grid behind and along it (a power station, a
  // transmission line, a substation, wooden poles and service wires) is drawn once and never changes. Then the grid itself:
  // power flowing (I4), wind and solar joining the same line (I5), and new demand waiting to connect while the rest greys out (I6).
  function remade(svg) {
    const tl = gsap.timeline({ paused: true });
    const defs = live(svg);
    sky(svg, "iso-sky-remade");
    // a square tile: the street and the grid at the front stay where they were; 16 rows of open land are added at the back,
    // where the wind, the solar and the new demand of I5 and I6 arrive, clear of the transmission line
    const N = 34, M = 18, B0 = -16, S = stage(svg, { N, M, Y0: B0, s: 0.58, tx: 158, ty: 278, ground: "#DCEBD3" }), G = S.ground;
    [[0.4, -15.6, 11.4, -9.4, "#E8E0B8", "#D6CB98"], [0.4, -8.8, 11.4, -0.6, "#CFE3B8"], [12.0, -15.6, 20.6, -6.6, "#D7E8C0"], [12.0, -6.0, 20.6, -0.6, "#E8E0B8", "#D6CB98"], [21.2, -15.6, 33.6, -5.2, "#CFE3B8"], [21.2, -4.6, 33.6, -0.6, "#E8E0B8", "#D6CB98"]].forEach(([a, b2, c, d, col, ln]) => field(G, a, b2, c, d, col, ln));
    const BY = 8.6, FY = 11.6, PY = 12.2, R0 = 12.6, R1 = 15.4, FP = 16.4;   // buildings, their fronts, the poles, the road, the front pavement
    const ERA = (k) => "e" + k, both = (x, y, fn, k) => S.add(x, y, fn, k == null ? "life" : ERA(k));
    // ground: fields at the back, the pavements, the road in each era
    field(G, 0.4, 5.2, 10.6, 8.2, "#CFE3B8"); field(G, 11.2, 0.4, 24.0, 2.4, "#D7E8C0"); field(G, 24.6, 0.4, 33.6, 2.6, "#E8E0B8", "#D6CB98");
    K.rect(G, 0, FY, N, R0, "#E9EBEE", 0.8); K.rect(G, 0, R1, N, FP, "#E9EBEE", 0.8); K.rect(G, 0, FP, N, M, "#D7E8C0", 0.6);
    const roads = [0, 1, 2, 3].map((k) => { const g = el("g", { opacity: k ? 0 : 1 }, G);
      if (k === 0) { K.rect(g, 0, R0, N, R1, "#B9AE95", 1); let d = ""; for (let x = 0.2; x < N; x += 0.35) for (let y = R0 + 0.15; y < R1 - 0.1; y += 0.35) { const a = P(x, y), b = P(x + 0.18, y); d += `M${a[0]} ${a[1]} L${b[0]} ${b[1]} `; } el("path", { d, stroke: "#A39780", "stroke-width": 0.8 }, g); [R0 + 0.35, R0 + 0.95].forEach((y) => K.lineGX(g, y, 0, N, 0, "#5B4A42", 1.2)); }
      else { K.rect(g, 0, R0, N, R1, k === 1 ? "#6E7586" : "#5B6478", 1); if (k >= 2) for (let x = 0.4; x < N; x += 1.4) K.lineGX(g, (R0 + R1) / 2, x, x + 0.7, 0, k === 2 ? "#FFE680" : "#FFFFFF", 1.4); if (k === 3) K.rect(g, 0, R1 - 0.45, N, R1, "#47B970", 0.6); }
      return g; });
    // ---------- THE GRID (never changes) ----------
    S.add(5.6, 2.6, (g) => { F.cyl(g, [4.4, 2.4, 0], "z", 1.1, 2.8, { side: "#D3D8DF", cap: "#B9C1CC" }); const c = P(4.4, 2.4, 2.9); K.smoke(g, c[0], c[1] - 4, true); }, "grid");
    S.add(7.6, 3.2, (g) => { const b = F.box(g, 6.2, 2.4, 0, 2.8, 1.8, 1.5, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" }); for (let u = 0.3; u < 2.6; u += 0.5) F.face(g, F.L, b, u, 0.5, u + 0.25, 1.2, "#9FB2C6", { "stroke-width": 0.5 }); K.chimney(g, 8.4, 1.6, 4.4); }, "grid");
    const PYL = [[12.0, 3.0], [16.5, 3.0], [21.0, 3.0], [25.5, 3.0]], GA = [10.0, 3.0, 2.15, "y"], GB = [30.4, 3.0, 2.15, "y"];
    S.add(10.0, 3.0, (g) => K.gantry(g, 10.0, 3.0, "y"), "grid");
    PYL.forEach(([x, y]) => S.add(x, y, (g) => K.pylon(g, x, y, 3.2), "grid"));
    S.add(30.4, 3.0, (g) => K.gantry(g, 30.4, 3.0, "y"), "grid");
    S.add(31.6, 5.4, (g) => { K.xfmr(g, 30.6, 4.4); K.xfmr(g, 32.0, 4.4); const b = F.box(g, 30.8, 6.0, 0, 2.4, 1.4, 1.0, { left: "#E3E6EB", right: "#C9CED6", top: "#F1F2F4" }); F.face(g, F.L, b, 0.3, 0, 0.8, 0.7, "#5B6478", { "stroke-width": 0.5 }); K.fence(g, 30.2, 7.7, 33.8, 7.7, "#8F8784"); }, "grid");
    S.add(20, 3.1, (g) => K.spans(g, [GA].concat(PYL), 3.2, "y", GB), "grid");
    // wooden poles along the near pavement, wires between them, a service wire into each building
    const PX = [1.4, 4.6, 7.8, 11.0, 14.2, 17.4, 20.6, 23.8, 27.0, 30.2, 33.2], PZ = 2.5;
    const drops = [], distPts = [];
    S.add(16, PY, (g) => {
      let zs = []; PX.forEach((x, i) => { zs = K.pole(g, x, PY, PZ, 2); if (i === 2 || i === 7) F.cyl(g, [x + 0.1, PY - 0.2, PZ - 0.9], "z", 0.16, 0.4, { side: "#9DA6B5", cap: "#B9C1CC" }); });
      K.wires(g, PX, PY, zs, [-0.3, 0.3], "#3E4860", 5);
      const a = P(32.2, 7.6, 1.0), b = P(33.2, PY - 0.3, zs[0]); el("path", { d: `M${a[0]} ${a[1]} Q${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 + 6} ${b[0]} ${b[1]}`, stroke: "#3E4860", "stroke-width": 0.9, fill: "none" }, g);
      PX.forEach((x) => distPts.push(P(x, PY - 0.3, zs[0])));
      [[3.0, 1.2], [7.5, 1.6], [12.0, 2.6], [17.6, 1.2], [22.6, 1.6], [28.6, 1.0]].forEach(([x, z]) => { const p = P(PX.reduce((m, v) => (Math.abs(v - x) < Math.abs(m - x) ? v : m)), PY - 0.3, zs[0]), q = P(x, FY, z);
        drops.push(el("path", { d: `M${p[0]} ${p[1]} Q${(p[0] + q[0]) / 2} ${(p[1] + q[1]) / 2 + 5} ${q[0]} ${q[1]}`, stroke: "#3E4860", "stroke-width": 0.8, fill: "none" }, g)); });
    }, "grid");
    // ---------- THE STREET (era by era) ----------
    const glows = [], meters = [], wait = [];
    const glowFace = (g, b, fn, u0, v0, u1, v1) => glows.push(F.face(g, fn, b, u0, v0, u1, v1, "#FFE680", { stroke: "none", opacity: 0 }));
    // A: a terrace of houses — coal fires, then TV aerials, then solar and heat pumps
    S.add(3.0, 10.8, (g) => { K.terrace(g, 0.6, 10.2, 5, 1.6, "#B7795E"); for (let k = 0; k < 5; k++) glowFace(g, { x: 0.6 + k * 0.95, y: 10.2, z: 0, w: 0.95, d: 1.2, h: 1.6 }, F.L, 0.5, 0.3, 0.8, 0.6); }, "homes");
    [0, 1, 2].forEach((k) => S.add(3.0, 10.81, (g) => { for (let i = 0; i < 5; i += 2) { const x = 1.0 + i * 0.95, p = P(x, 10.7, 2.3); if (k < 2 || i === 0) K.smoke(g, p[0], p[1] - 6, false); if (k) K.seg(g, [x + 0.2, 10.6, 2.1], [x + 0.2, 10.6, 2.7], "#3E4860", 1), K.seg(g, [x - 0.1, 10.6, 2.6], [x + 0.5, 10.6, 2.6], "#3E4860", 1); } }, ERA(k)));
    S.add(3.0, 10.82, (g) => { for (let i = 0; i < 5; i++) { const x0 = 0.6 + i * 0.95; K.quad(g, [[x0 + 0.12, 11.35, 1.62], [x0 + 0.83, 11.35, 1.62], [x0 + 0.83, 10.95, 1.9], [x0 + 0.12, 10.95, 1.9]], C.pv, { "stroke-width": 0.6 }); } }, ERA(3));
    S.add(3.0, 11.9, (g) => { for (let i = 0; i < 5; i += 2) F.box(g, 0.9 + i * 0.95, 11.45, 0, 0.4, 0.25, 0.36, { left: C.w2, right: C.w3, top: C.w1 }); }, "homesE3");
    // B: the corner shop — grocer, baker, record shop, coffee shop
    S.add(7.5, 10.6, (g) => { const b = K.shop(g, 6.0, 9.6, 3.0, 2.0, 2.6, "#C9A988", null, { win: "#C9D3DE", glass: "#E3E6EB" }); glowFace(g, b, F.L, 0.2, 0.08, 2.8, 0.6); }, "life");
    [["#47B970", "#2F6F4E"], ["#E5C189", "#8F6B4E"], ["#E0785A", "#8C6F9E"], ["#262C3A", "#47B970"]].forEach(([aw, sg], k) => S.add(7.5, 10.61, (g) => {
      for (let i = 0; i < 10; i++) { const u0 = 6.0 + 0.3 * i, u1 = u0 + 0.3; K.quad(g, [[u0, 11.6, 0.92], [u1, 11.6, 0.92], [u1, 12.05, 0.72], [u0, 12.05, 0.72]], i % 2 ? "#FFFFFF" : aw, { "stroke-width": 0.6 }); }
      F.face(g, F.L, { x: 6.0, y: 9.6, z: 0, w: 3.0, d: 2.0, h: 2.6 }, 0.2, 0.98, 2.8, 1.14, sg, { "stroke-width": 0.5 });
      if (k === 0) [6.3, 6.8].forEach((x) => K.crate(g, x, 11.75, 0, ["#A6D84A", "#E0785A"][x > 6.5 ? 1 : 0]));
      if (k === 3) { F.box(g, 8.2, 11.8, 0.3, 0.5, 0.4, 0.05, { left: "#F1F2F4", right: C.w3, top: "#FFFFFF" }); K.quad(g, [[8.43, 12.0, 0], [8.47, 12.0, 0], [8.47, 12.0, 0.3], [8.43, 12.0, 0.3]], "#3E4860"); K.person(g, 8.1, 12.0, { phone: true, top: "#4AB4D6" }); }
    }, ERA(k)));
    // C: an office — warm lamps, then fluorescent tubes, then tinted glass, then glass with solar on the roof
    [["#B7795E", "#FFE6A3"], ["#C9B8A8", "#E8F0F7"], ["#A9977C", "#C9A988"], ["#E3E6EB", "#9ED9CF"]].forEach(([body, gl], k) => S.add(12.0, 10.2, (g) => { const b = K.tower(g, 9.8, 8.8, 4.2, 2.8, 3.6, body, gl, k === 3 ? "pv" : "none", { noShop: true, floor: 0.9 }); F.face(g, F.L, b, 1.7, 0, 2.5, 0.75, "#5B4A42", { "stroke-width": 0.6 }); if (k === 3) for (let z = 0.3; z < 3.2; z += 0.9) glowFace(g, b, F.L, 0.18, z, 4.0, z + 0.32); }, k === 3 ? "office3" : ERA(k)));
    // D: a forge, then a garage, then a petrol station, then an EV charging hub under a solar canopy
    S.add(17.8, 10.2, (g) => { const b = F.box(g, 15.4, 9.4, 0, 2.4, 1.8, 1.3, { left: "#8F7A6E", right: "#6D5A4A", top: "#5B4A42" }); F.face(g, F.L, b, 0.5, 0, 1.4, 0.9, "#3E2A22", { "stroke-width": 0.6 }); F.face(g, F.L, b, 0.7, 0.1, 1.2, 0.5, "#FF9A3C", { "stroke-width": 0 }); K.chimney(g, 17.2, 9.8, 2.0); K.horse(g, 18.6, 11.2, { col: "#8F5E3E" }); K.person(g, 18.2, 11.4, { cap: "#5B4A42", top: "#8F7A6E" }); }, ERA(0));
    S.add(17.8, 10.2, (g) => { const b = F.box(g, 15.4, 9.2, 0, 3.0, 2.0, 1.6, { left: "#F1F2F4", right: C.w3, top: "#E3E6EB" }); F.face(g, F.L, b, 0.3, 0, 1.6, 1.1, "#5B6478", { "stroke-width": 0.6 }); F.face(g, F.L, b, 0.2, 1.25, 2.8, 1.45, "#B5302E", { "stroke-width": 0.5 }); [19.0, 19.6].forEach((x) => { F.cyl(g, [x, 11.0, 0], "z", 0.14, 0.7, { side: "#B5302E", cap: "#F1F2F4" }); }); K.oldCar(g, 15.8, 11.0, "#4AB4D6"); }, ERA(1));
    S.add(17.8, 10.2, (g) => { [[15.6, 9.8], [19.8, 9.8], [15.6, 11.4], [19.8, 11.4]].forEach(([x, y]) => F.box(g, x, y, 0, 0.12, 0.12, 1.3, { left: C.g1, right: C.g2, top: C.w1 })); [[16.8, 10.6], [18.4, 10.6]].forEach(([x, y]) => { const p = F.box(g, x, y, 0, 0.3, 0.3, 0.7, { left: "#FFCD00", right: shade("#FFCD00"), top: "#F1F2F4" }); F.face(g, F.L, p, 0.05, 0.4, 0.25, 0.6, "#FFFFFF", { "stroke-width": 0.5 }); }); F.box(g, 15.4, 9.6, 1.3, 4.6, 2.0, 0.2, { left: "#FFCD00", right: shade("#FFCD00"), top: "#FFFFFF" }); K.car(g, 15.8, 11.1, "#A9877A", "x"); K.person(g, 18.0, 11.2, { cap: "#E0785A", top: "#E0785A" }); }, ERA(2));
    S.add(17.8, 10.2, (g) => { [[15.6, 9.8], [19.8, 9.8], [15.6, 11.4], [19.8, 11.4]].forEach(([x, y]) => F.box(g, x, y, 0, 0.1, 0.1, 1.2, { left: C.g1, right: C.g2, top: C.w1 })); [[16.2, 9.9, "#E5C189"], [17.7, 9.9, "#4AB4D6"], [16.2, 10.9, "#F1F2F4"]].forEach(([x, y, c]) => { K.charger(g, x + 1.25, y - 0.2); K.car(g, x, y, c, "x"); }); F.box(g, 15.4, 9.6, 1.2, 4.6, 2.0, 0.08, { left: C.w2, right: C.w3, top: C.pv }); for (let u = 15.8; u < 20; u += 0.5) K.seg(g, [u, 9.6, 1.28], [u, 11.6, 1.28], C.pvl, 0.6); }, "charging");
    // E: a shop — tailor, radio shop, TV and radio, phones
    [["#8C6F9E", "#3E4860"], ["#E5C189", "#8F6B4E"], ["#E0785A", "#3E4860"], ["#4AB4D6", "#262C3A"]].forEach(([aw, sg], k) => S.add(22.6, 10.6, (g) => { const b = K.shop(g, 21.2, 9.6, 3.0, 2.0, 2.4, ["#B7795E", "#C9A988", "#E8A98D", "#F1F2F4"][k], aw, { win: "#C9D3DE", sign: sg, glass: k === 3 ? C.water : "#FFE6A3" }); if (k === 3) glowFace(g, b, F.L, 0.15, 0.05, 2.85, 0.62); }, k === 3 ? "shop" : ERA(k)));
    // F: a tram stop, then bus stops
    S.add(25.6, PY + 0.1, (g) => { K.quad(g, [[25.6, PY + 0.1, 0], [25.64, PY + 0.1, 0], [25.64, PY + 0.1, 1.5], [25.6, PY + 0.1, 1.5]], "#3E4860"); K.quad(g, [[25.3, PY + 0.1, 1.3], [25.9, PY + 0.1, 1.3], [25.9, PY + 0.1, 1.6], [25.3, PY + 0.1, 1.6]], "#2F6F4E", { "stroke-width": 0.6 }); }, ERA(0));
    [1, 2, 3].forEach((k) => S.add(25.6, PY, (g) => { const c = ["", "#B5302E", "#E0785A", "#47B970"][k]; F.box(g, 24.8, PY - 0.3, 0, 1.6, 0.06, 1.1, { left: "#C9E6F5", right: "#9FC8DE", top: c }); F.box(g, 24.8, PY - 0.35, 1.1, 1.6, 0.5, 0.06, { left: c, right: shade(c), top: c }); if (k === 3) F.box(g, 26.3, PY - 0.1, 0, 0.12, 0.12, 1.3, { left: "#262C3A", right: "#1E2433", top: "#47B970" }); }, ERA(k)));
    // G: two houses — later with solar, a heat pump and a charger
    [[27.4, 9.4, "#B77464"], [30.0, 9.4, "#8C6F9E"]].forEach(([x, y, r]) => { S.add(x + 1.1, y + 0.8, (g) => { const b = ISO.house(g, F, x, y, 2.2, 1.7, 1.2, 0.8, r); glowFace(g, b, F.L, 1.25, 0.38, 1.9, 0.8); }, "homes"); S.add(x + 1.1, y + 0.81, (g) => { ISO.poly(g, [F.p(x + 0.3, y + 1.73, 1.26), F.p(x + 1.9, y + 1.73, 1.26), F.p(x + 1.9, y + 1.1, 1.76), F.p(x + 0.3, y + 1.1, 1.76)], C.pv, { "stroke-width": 0.8 }); F.box(g, x + 2.25, y + 0.5, 0, 0.45, 0.3, 0.42, { left: C.w2, right: C.w3, top: C.w1 }); }, "homesE3"); });
    // smart meters (I5) on the homes and the shop
    [[1.1, 11.42], [3.0, 11.42], [6.4, 11.62], [28.0, 11.12], [30.6, 11.12]].forEach(([x, y]) => S.add(x, y + 0.01, (g) => { const m = el("g", { opacity: 0 }, g); const b = F.box(m, x, y, 0.5, 0.18, 0.06, 0.24, { left: "#262C3A", right: "#1E2433", top: "#3E4860" }); F.face(m, F.L, b, 0.03, 0.12, 0.15, 0.2, "#47B970", { stroke: "none", class: "fx anim blink" }); meters.push(m); }));
    // street lamps: gas, warm electric, sodium orange, white LED
    [3.2, 9.6, 16.0, 22.4, 28.8].forEach((x) => [0, 1, 2, 3].forEach((k) => S.add(x, R1 + 0.3, (g) => { const h = [1.1, 1.3, 1.6, 1.5][k]; K.quad(g, [[x - 0.03, R1 + 0.3, 0], [x + 0.03, R1 + 0.3, 0], [x + 0.03, R1 + 0.3, h], [x - 0.03, R1 + 0.3, h]], ["#262C3A", "#3E4860", "#9DA6B5", "#C9CED6"][k], { "stroke-width": 0.5 }); if (k >= 2) K.seg(g, [x, R1 + 0.3, h], [x, R1 - 0.1, h], "#9DA6B5", 1.2); const c = P(x, k >= 2 ? R1 - 0.1 : R1 + 0.3, h + 0.05); el("circle", { cx: c[0], cy: c[1], r: k ? 2.6 : 3.2, fill: ["#FFE6A3", "#FFF4C2", "#FFA94D", "#FFFFFF"][k], stroke: "#000", "stroke-width": 0.7 }, g); }, ERA(k))));
    // the front verge: trees, a bench, a post box
    [[1.6, 17.4, "dark"], [6.8, 17.6], [12.6, 17.4, "dark"], [18.4, 17.6], [25.0, 17.4], [31.4, 17.6, "dark"]].forEach(([x, y, k]) => S.add(x, y, (g) => K.tree(g, x, y, 1, k), "life"));
    [10.6, 23.6].forEach((x) => S.add(x, 17.0, (g) => K.bench(g, x, 16.9), "life"));
    [[11.7, -15.2, "pine"], [11.7, -12.0], [11.7, -8.6, "dark"], [20.9, -14.6, "dark"], [20.9, -10.8], [20.9, -7.2, "pine"], [33.4, -15.2], [0.8, -15.2, "dark"], [33.2, -9.6, "pine"], [5.6, -0.2], [27.0, -0.2, "dark"]].forEach(([x, y, k]) => S.add(x, y, (g) => K.tree(g, x, y, 1, k), "life"));
    [[1.2, 6.0, "pine"], [2.6, 7.4], [11.0, 6.8, "dark"], [18.0, 7.4], [24.6, 7.0, "dark"], [26.6, 5.2], [9.6, 0.8, "pine"], [23.6, 1.0]].forEach(([x, y, k]) => S.add(x, y, (g) => K.tree(g, x, y, 1, k), "life"));
    S.add(14.6, FP - 0.2, (g) => F.cyl(g, [14.6, FP - 0.2, 0], "z", 0.16, 0.6, { side: "#B5302E", cap: "#262C3A" }), "life");
    // people, dressed for each era: work, travel, speak, create
    const DRESS = [(i) => ({ hat: i % 2 === 0, dress: i % 2 === 1, bonnet: i % 2 === 1, top: ["#3E4860", "#8C6F9E", "#5B4A42", "#2F6F4E"][i % 4] }), (i) => ({ hat: i === 0, cap: i === 2 ? "#3E4860" : null, dress: i % 2 === 1, top: ["#5B6478", "#E5C189", "#B5302E", "#4AB4D6"][i % 4] }), (i) => ({ long: i % 2 === 1, top: ["#E0785A", "#FFCD00", "#8C6F9E", "#A6D84A"][i % 4] }), (i) => ({ phone: i % 2 === 0, cap: i === 3 ? "#47B970" : null, top: ["#4AB4D6", "#47B970", "#F1F2F4", "#E0785A"][i % 4] })];
    [0, 1, 2, 3].forEach((k) => {
      S.lane(FP - 0.5, (g) => { const lg = el("g", null, g); lg.dataset.era = k; eraLanes.push([k, lg]); loopLane(lg, N, 1, 0.5, [0, 1, 2].map((i) => [i / 3 + 0.05 * k, 0.3, (h) => K.person(h, 0, FP - 0.5, Object.assign({ walk: true }, DRESS[k](i)))])); });
      S.lane(FP - 0.2, (g) => { const lg = el("g", null, g); lg.dataset.era = k; eraLanes.push([k, lg]); loopLane(lg, N, -1, 0.45, [0, 1].map((i) => [i / 2 + 0.2, 0.3, (h) => K.person(h, 0, FP - 0.2, Object.assign({ walk: true }, DRESS[k](i + 2)))])); });
    });
    const scenes = [
      [(g) => { K.person(g, 14.2, FP - 0.1, Object.assign({ idle: true }, DRESS[0](0))); K.person(g, 5.6, FP - 0.15, { cap: "#5B4A42", top: "#C9A988", idle: true }); F.box(g, 5.75, FP - 0.25, 0.42, 0.25, 0.08, 0.18, { left: "#F1F2F4", right: C.w3, top: "#FFFFFF" }); F.box(g, 20.4, 17.4, 0, 0.06, 0.06, 0.9, { left: "#8F6B4E", right: "#6D5A4A", top: "#8F6B4E" }); F.box(g, 20.2, 17.36, 0.6, 0.5, 0.06, 0.4, { left: "#F1F2F4", right: C.w3, top: "#FFFFFF" }); K.person(g, 20.9, 17.6, Object.assign({ idle: true }, DRESS[0](1))); }],
      [(g) => { const b = F.box(g, 13.8, FP - 0.6, 0, 0.6, 0.6, 1.4, { left: "#B5302E", right: shade("#B5302E"), top: "#B5302E" }); F.face(g, F.L, b, 0.08, 0.2, 0.52, 1.1, "#C9E6F5", { "stroke-width": 0.5 }); K.person(g, 5.6, FP - 0.15, { hat: true, top: "#5B6478", idle: true, bag: true }); F.box(g, 20.6, 17.4, 0, 0.04, 0.04, 0.7, { left: "#3E4860", right: "#262C3A", top: "#3E4860" }); F.box(g, 20.5, 17.35, 0.7, 0.24, 0.14, 0.14, { left: "#262C3A", right: "#1E2433", top: "#3E4860" }); K.person(g, 21.0, 17.6, Object.assign({ idle: true }, DRESS[1](0))); }],
      [(g) => { const b = F.box(g, 13.8, FP - 0.6, 0, 0.6, 0.6, 1.4, { left: "#B5302E", right: shade("#B5302E"), top: "#B5302E" }); F.face(g, F.L, b, 0.08, 0.2, 0.52, 1.1, "#C9E6F5", { "stroke-width": 0.5 }); [14.6, 15.0, 15.4].forEach((x, i) => K.person(g, x, FP - 0.1, Object.assign({ idle: true }, DRESS[2](i)))); K.person(g, 5.6, FP - 0.15, { top: "#A6D84A", idle: true, bag: true }); K.person(g, 20.8, 17.6, { idle: true, top: "#E0785A", long: true }); F.box(g, 21.05, 17.65, 0.25, 0.35, 0.06, 0.15, { left: "#C99A5B", right: "#A97A3B", top: "#C99A5B" }); }],
      [(g) => { K.person(g, 14.2, FP - 0.1, { idle: true, phone: true, top: "#47B970" }); F.box(g, 5.2, FP - 0.4, 0.3, 0.5, 0.4, 0.05, { left: "#F1F2F4", right: C.w3, top: "#FFFFFF" }); F.box(g, 5.3, FP - 0.35, 0.35, 0.25, 0.18, 0.12, { left: "#3E4860", right: "#262C3A", top: "#9ED9CF" }); K.person(g, 5.6, FP - 0.05, { idle: true, top: "#4AB4D6" }); F.box(g, 20.5, 17.4, 0, 0.04, 0.04, 0.8, { left: "#3E4860", right: "#262C3A", top: "#3E4860" }); F.box(g, 20.45, 17.38, 0.8, 0.14, 0.04, 0.24, { left: "#1E2433", right: "#1E2433", top: "#1E2433" }); K.person(g, 21.0, 17.6, { idle: true, top: "#FFCD00", cap: "#E0785A" }); }]
    ];
    scenes.forEach(([fn], k) => S.add(14, FP + 0.2, fn, ERA(k)));
    // the road: a tram and a horse and cart; rounded cars and a motorbike; boxy saloons and a Mini; EVs, an e-bus and a cyclist
    const eraLanes = [];
    const lanes = [
      [[R0 + 0.35, -1, 1.4, [[0, 2.6, (h, x0) => { const b = F.box(h, x0, R0 + 0.3, 0.14, 2.6, 0.7, 0.95, { left: "#E0785A", right: shade("#E0785A"), top: "#F3E2C6" }); for (let u = 0.25; u < 2.4; u += 0.45) F.face(h, F.L, b, u, 0.42, u + 0.3, 0.75, "#FFE6A3", { "stroke-width": 0.6 }); K.seg(h, [x0 + 1.3, R0 + 0.65, 1.09], [x0 + 2.0, R0 + 0.65, 1.95], "#3E4860", 1.2); }]]],
        [R1 - 1.1, 1, 0.9, [[0.3, 2.3, (h, x0) => K.cart(h, x0, R1 - 1.1, { walk: true, hay: true })]]]],
      [[R0 + 0.25, -1, 2.0, [[0, 1.4, (h, x0) => K.oldCar(h, x0, R0 + 0.25, "#4AB4D6")], [0.5, 1.4, (h, x0) => K.oldCar(h, x0, R0 + 0.25, "#E5C189")]]], [R1 - 1.0, 1, 2.0, [[0.2, 0.75, (h) => K.bike(h, -0.7, R1 - 0.9, "#3E4860", { cap: "#262C3A", top: "#5B4A42" })], [0.7, 1.4, (h, x0) => K.oldCar(h, x0, R1 - 1.0, "#B5302E")]]]],
      [[R0 + 0.25, -1, 2.4, [[0, 1.3, (h, x0) => K.car(h, x0, R0 + 0.25, "#A9877A", "x", 1.3)], [0.55, 0.9, (h, x0) => K.car(h, x0, R0 + 0.25, "#E0785A", "x", 0.9)]]], [R1 - 1.0, 1, 2.4, [[0.25, 1.3, (h, x0) => K.car(h, x0, R1 - 1.0, "#FFCD00", "x", 1.3)], [0.75, 0.9, (h, x0) => K.car(h, x0, R1 - 1.0, "#47B970", "x", 0.9)]]]],
      [[R0 + 0.25, -1, 2.2, [[0, 1.2, (h, x0) => K.car(h, x0, R0 + 0.25, "#F1F2F4", "x")], [0.4, 2.8, (h, x0) => K.bus(h, x0, R0 + 0.2, "#47B970")], [0.75, 1.2, (h, x0) => K.car(h, x0, R0 + 0.25, "#4AB4D6", "x")]]], [R1 - 1.1, 1, 2.3, [[0.2, 1.2, (h, x0) => K.car(h, x0, R1 - 1.1, "#A6D84A", "x")], [0.7, 1.2, (h, x0) => K.car(h, x0, R1 - 1.1, "#E5C189", "x")]]], [R1 - 0.3, 1, 1.2, [[0.1, 0.75, (h) => K.bike(h, -0.7, R1 - 0.3, "#47B970", { cap: "#E0785A", top: "#4AB4D6" })], [0.6, 0.75, (h) => K.bike(h, -0.7, R1 - 0.3, "#E0785A", { top: "#FFCD00" })]]]]
    ];
    lanes.forEach((ls, k) => ls.forEach(([y, dir, sp, items]) => S.lane(y, (g) => { const lg = el("g", null, g); eraLanes.push([k, lg]); loopLane(lg, N, dir, sp, items); })));
    S.lane(R0 + 0.36, (g) => { const w = el("g", null, g); eraLanes.push([0, w]); K.lineGX(w, R0 + 0.65, 0, N, 1.95, "#3E4860", 0.9); });
    // I6: new demand waiting to connect — a data centre and an electrified factory behind the street, more chargers and cars queuing
    S.add(16.3, -12.6, (g) => K.dataHall(g, 13.0, -14.6, 6.4, 3.4), "waitNew");
    S.add(16.3, -4.6, (g) => K.factory(g, 13.2, -6.2, 5.6, 2.8, 1.6, "#C9CED6"), "waitNew");
    S.add(19.0, PY + 0.4, (g) => { [[18.0, PY - 0.2], [19.4, PY - 0.2]].forEach(([x, y]) => K.charger(g, x, y)); }, "waitFront");
    S.flush();
    const st = S.sets;
    const yr = el("text", { x: 1480, y: 170, "text-anchor": "end", "font-family": "Poppins", "font-weight": 600, "font-size": 64, fill: "#3E4860", text: "1900" }, svg);
    const tSame = el("g", { opacity: 0 }, svg); el("rect", { x: 1440 - 380, y: 110, width: 380, height: 30, fill: "#192238" }, tSame); el("text", { x: 1440 - 190, y: 130, "text-anchor": "middle", "font-family": "Poppins", "font-weight": 600, "font-size": 12, "letter-spacing": 1.2, fill: "#FFFFFF", text: "PLANNED, BUILT AND RUN THE SAME WAY" }, tSame);
    // the flows (I4): along the transmission line, then the street wires and the service drops
    const feed = el("g", { opacity: 0 }, S.items), dropFlow = el("g", { opacity: 0 }, S.items);
    const tPath = el("path", { d: "M" + [P(GA[0], GA[1] - 0.95, 2.15)].concat(PYL.map(([x, y]) => P(x, y - 0.95, 3.2 * 0.8 * 0.7)), [P(GB[0], GB[1] - 0.95, 2.15)]).map((q) => q[0].toFixed(1) + " " + (q[1] + 6).toFixed(1)).join(" L"), fill: "none", stroke: "none" }, feed);
    const dPath = el("path", { d: "M" + distPts.slice().reverse().map((q) => q[0].toFixed(1) + " " + q[1].toFixed(1)).join(" L"), fill: "none", stroke: "none" }, dropFlow);
    const pulse = (g, path, n, dur, r, col) => { for (let k = 0; k < n; k++) { const d = el("circle", { r, fill: col || "#FFCD00", stroke: "#B5802A", "stroke-width": 0.6 }, g); gsap.to(d, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: dur, repeat: -1, ease: "none", delay: -k * (dur / n) }); } };
    pulse(feed, tPath, 8, 4, 5.5); pulse(dropFlow, dPath, 9, 5, 4.6); drops.forEach((p) => pulse(dropFlow, p, 2, 1.4, 3.6));
    // the additions (I5): wind on the back field, solar beside the substation, linked to the same line
    const adds = [], greens = [];
    const WIND = [[2.4, -13.6], [6.4, -14.4], [10.0, -13.0], [3.6, -9.4], [7.6, -10.2], [5.2, -5.0], [9.4, -6.0]].sort((a, b) => b[0] + b[1] - a[0] - a[1]);   // front first: each is slipped in behind the last
    WIND.forEach(([x, y]) => { const g = el("g", null, S.items); S.items.insertBefore(g, S.items.firstChild); ISO.turbine(g, F, x, y, 4.2); adds.push(g); g.dataset.ox = P(x, y)[0]; g.dataset.oy = P(x, y)[1]; });
    { const g = el("g", null, S.items); S.items.insertBefore(g, S.items.firstChild); for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) ISO.panel(g, F, 21.8 + c * 2.9, -15.0 + r * 1.55, 2.4, 0.95);
      [[22.0, -4.6], [24.4, -4.6]].forEach(([x, y]) => K.batt(g, x, y, 2.0)); K.xfmr(g, 27.4, -4.6); adds.push(g); g.dataset.ox = P(27, -6)[0]; g.dataset.oy = P(27, -6)[1]; }
    { const g = el("g", null, S.items); S.items.insertBefore(g, S.items.firstChild); K.xfmr(g, 8.6, -2.6); adds.push(g); g.dataset.ox = P(9, -2)[0]; g.dataset.oy = P(9, -2)[1]; }
    { const g = el("g", null, S.items); S.items.insertBefore(g, S.items.firstChild); [[[3.6, -9.4], [9.1, -2.2]], [[9.4, -6.0], [9.1, -2.2]], [[6.4, -14.4], [9.1, -2.2]], [[9.1, -2.2], [12.0, 3.0]], [[27.9, -4.2], [25.5, 3.0]]].forEach(([[x0, y0], [x1, y1]]) => { const a = P(x0, y0, 0.05), b = P(x1, y1, 0.05); greens.push(el("path", { d: `M${a[0]} ${a[1]} L${b[0]} ${b[1]}`, stroke: "#47B970", "stroke-width": 2.2, fill: "none" }, g)); }); }
    // ---- timeline ----
    const lifeAll = () => st.life.concat(st.homes, st.homesE3 || [], st.charging, st.shop, st.office3, st.e3);
    [0, 1, 2].forEach((k) => gsap.set(st[ERA(k)], { opacity: k ? 0 : 1 }));
    gsap.set(st.homesE3.concat(st.charging, st.shop, st.office3, st.e3), { opacity: 0 });
    eraLanes.forEach(([k, g]) => gsap.set(g, { opacity: k ? 0 : 1 }));
    gsap.set(st.waitNew.concat(st.waitFront), { opacity: 0 });
    const eraNodes = (k) => (k === 3 ? st.e3.concat(st.homesE3, st.charging, st.shop, st.office3) : st[ERA(k)]).concat(eraLanes.filter(([e]) => e === k).map(([, g]) => g)).concat([roads[k]]);
    const yObj = { v: 1900 }, YRS = [1900, 1950, 1975, 2025];
    if (svg.dataset.variant === "v2") return remadeV2();
    [beat(1), beat(1) + 0.32, beat(1) + 0.64].forEach((t0, k) => {                                              // I2: the decades pass
      tl.to(eraNodes(k), { opacity: 0, duration: 0.12 }, t0); tl.to(eraNodes(k + 1), { opacity: 1, duration: 0.12 }, t0 + 0.04);
      tl.to(yObj, { v: YRS[k + 1], duration: 0.26, ease: "none", onUpdate: () => { yr.textContent = Math.round(yObj.v); } }, t0);
    });
    const live3 = () => lifeAll().concat(eraLanes.filter(([e]) => e === 3).map(([, g]) => g));
    tl.to(live3(), { opacity: 0.35, duration: 0.3 }, beat(2));                                                    // I3: the grid stayed the same
    tl.to(yr, { opacity: 0, duration: 0.15 }, beat(3) + 0.02);                                                    // I4: power flows to the town
    tl.to(live3(), { opacity: 1, duration: 0.25 }, beat(3) + 0.05);
    tl.to(feed, { opacity: 1, duration: 0.2 }, beat(3) + 0.15);
    tl.to(dropFlow, { opacity: 1, duration: 0.2 }, beat(3) + 0.45);
    tl.to(glows, { opacity: 0.75, duration: 0.3 }, beat(3) + 0.45);
    sprout(tl, adds, beat(4) + 0.05, { y: true, dur: 0.3, stagger: 0.06 });                                      // I5: wind and solar join the same line
    greens.forEach((p) => drawOn(tl, p, beat(4) + 0.25, 0.3));
    tl.to(meters, { opacity: 1, duration: 0.2 }, beat(4) + 0.3);
    tl.to(tSame, { opacity: 1, duration: 0.2 }, beat(4) + 0.55);
    // I6: the world is hungrier for power — everything greys out except what is waiting to connect, tinted orange
    const ft = el("filter", { id: "iso-tint", "color-interpolation-filters": "sRGB" }, defs);
    const o = [0.93, 0.45, 0.035], Lw = [0.3, 0.59, 0.11];
    el("feColorMatrix", { type: "matrix", values: o.map((c) => [...Lw.map((w) => (c * 0.55 + (1 - c) * 0.35) * w), 0, c * 0.45 + 0.08].map((v) => v.toFixed(3)).join(" ")).join(" ") + " 0 0 0 1 0" }, ft);
    const waiting = st.homes.concat(st.homesE3, st.charging, st.waitNew, st.waitFront);
    const others = [...S.items.children].filter((n) => !waiting.includes(n)).concat([S.ground]);
    tl.to(tSame, { opacity: 0, duration: 0.12 }, beat(5));
    gsap.set(others, { filter: "grayscale(0)" });
    tl.to(others, { filter: "grayscale(1)", duration: 0.3 }, beat(5) + 0.05);
    tl.to(st.waitNew.concat(st.waitFront), { opacity: 1, duration: 0.25 }, beat(5) + 0.1);
    gsap.set(waiting, { attr: { filter: "none" } });   // a starting value, so scrolling back up above I6 takes the tint off again
    tl.set(waiting, { attr: { filter: "url(#iso-tint)" } }, beat(5) + 0.15);
    tl.to([feed, dropFlow], { opacity: 0, duration: 0.25 }, beat(5) + 0.1);
    ISO.tweens.forEach((t) => t.play && t.play());
    hold(tl, 5);
    return tl;

    // index2/index3 (data-variant="v2"), three cards: the last fifty years (1975 to today); the grid stayed the same;
    // out of step with a world hungrier for power (the I6 queue). No power-flow or wind-and-solar beats.
    function remadeV2() {
      [0, 1, 2].forEach((k) => gsap.set(eraNodes(k), { opacity: k === 2 ? 1 : 0 }));
      yObj.v = 1975; yr.textContent = "1975";
      gsap.set(adds.concat(greens, meters), { opacity: 0 });                                                       // no wind and solar beat here
      const t0 = 0.12;                                                                                             // card 1: 1975 becomes today
      tl.to(eraNodes(2), { opacity: 0, duration: 0.2 }, t0); tl.to(eraNodes(3), { opacity: 1, duration: 0.2 }, t0 + 0.06);
      tl.to(yObj, { v: 2025, duration: 0.4, ease: "none", onUpdate: () => { yr.textContent = Math.round(yObj.v); } }, t0);
      const live3 = () => lifeAll().concat(eraLanes.filter(([e]) => e === 3).map(([, g]) => g));
      tl.to(live3(), { opacity: 0.35, duration: 0.3 }, beat(1));                                                 // card 2: the grid stayed the same
      tl.to(yr, { opacity: 0, duration: 0.15 }, beat(1));
      tl.to(tSame, { opacity: 1, duration: 0.2 }, beat(1) + 0.2);
      const ft = el("filter", { id: "iso-tint", "color-interpolation-filters": "sRGB" }, defs);                   // card 3: hungrier for power
      const o = [0.93, 0.45, 0.035], Lw = [0.3, 0.59, 0.11];
      el("feColorMatrix", { type: "matrix", values: o.map((c) => [...Lw.map((w) => (c * 0.55 + (1 - c) * 0.35) * w), 0, c * 0.45 + 0.08].map((v) => v.toFixed(3)).join(" ")).join(" ") + " 0 0 0 1 0" }, ft);
      const waiting = st.homes.concat(st.homesE3, st.charging, st.waitNew, st.waitFront);
      const others = [...S.items.children].filter((n) => !waiting.includes(n)).concat([S.ground]);
      tl.to(tSame, { opacity: 0, duration: 0.12 }, beat(2));
      tl.to(live3(), { opacity: 1, duration: 0.25 }, beat(2) + 0.02);
      gsap.set(others, { filter: "grayscale(0)" });
      tl.to(others, { filter: "grayscale(1)", duration: 0.3 }, beat(2) + 0.05);
      tl.to(st.waitNew.concat(st.waitFront), { opacity: 1, duration: 0.25 }, beat(2) + 0.1);
      gsap.set(waiting, { attr: { filter: "none" } });
      tl.set(waiting, { attr: { filter: "url(#iso-tint)" } }, beat(2) + 0.15);
      ISO.tweens.forEach((t) => t.play && t.play());
      hold(tl, 2);
      return tl;
    }
  }

  Object.assign(window.SCENES, { rail, road, telecom, remade });
  window.ISOSTAGE = { stage, sprout, shrink, drawOn, along, convoy, steamParts, field, cottage, people, live, mountain, loopLane };   // for js/iso-journey.js
})();
