/* PROVISIONAL section GX: the Electrotech story of section G on a different picture, to compare the two.
   One "world tile": an ocean with six islands of no particular geography. The islands' towns rise and light up, a
   town shows its electric cars, train, heat pumps and factory, a coal plant and a gas terminal give way to wind and solar
   (a gas carrier sails in first), data centres rise, and cables join the islands. Scene: SCENES.worldA. */
(function () {
  if (!window.CLEAN || !window.ISOSCENES || !window.ISOJ || !window.SCENES) return;
  const { el } = SVG;
  const { C } = ISO;
  const { K } = ISOSCENES;
  const P = (x, y, z) => ISO.P(x, y, z || 0);
  const F = ISO.frame([0, 0], 1);
  const shade = (h, t) => ISO.mixHex(h, "#000000", t == null ? 0.16 : t), lite = (h) => ISO.mixHex(h, "#FFFFFF", 0.35);
  const bx = (g, x, y, z, w, d, h, col, top) => F.box(g, x, y, z, w, d, h, { left: col, right: shade(col), top: top || lite(col) });
  const pts = (a) => a.map((q) => q.map((v) => v.toFixed(1)).join(",")).join(" ");
  const W = 34, H = 0.4, ZP = H * 34.64;   // the ocean's size; the islands stand H above the sea

  // the land: four masses that run off the corners of the tile (their coasts curve in from the edges) and two islands
  // in the open sea; centre, radius, a seed for the coastline's wobble, the ground, and the point the camera looks at
  const ISL = {   // centre, radius, seed, ground, the camera's look point, the coast's wobble (three harmonics), and a stretch along gx and gy
    old: [1, 1, 11.5, 0.4, "#DCEBC9", [5.0, 4.6], [0.04, 0.12, 0.05], [1.15, 0.9]],      // the back corner: an older industrial coast
    city: [33, 1, 11, 1.7, "#E3E6EB", [27.6, 4.6], [0.1, 0.04, 0.07], [0.9, 1.2]],       // the right corner: a city of towers
    home: [17, 17, 7, 2.9, "#DCEBC9", [17.2, 16.8], [0.16, 0.06, 0.05], [1.12, 0.88]],    // an island in the middle: homes, a rail line, a factory
    port: [1, 33, 11, 4.1, "#E8E3C8", [5.6, 27.6], [0.05, 0.1, 0.1], [0.85, 1.15]],      // the left corner: a port that imports gas
    rural: [33, 33, 11, 5.3, "#E8E0B8", [28.2, 28.0], [0.12, 0.08, 0.04], [1.1, 1.0]],   // the front corner: villages and farms
    small: [4.0, 16.4, 2.1, 6.6, "#DCEBC9", [4.0, 16.4], [0.12, 0.14, 0.04], [1.25, 0.9]]   // a small island
  };
  const clampW = (v) => Math.max(0, Math.min(W, v));
  const radius = ([, , r, s, , , A], a) => r * (1 + A[0] * Math.sin(2 * a + s) + A[1] * Math.sin(3 * a + 2 * s) + A[2] * Math.sin(5 * a + 3 * s));
  const shape = (def, k) => Array.from({ length: 96 }, (_, i) => { const a = (i / 96) * Math.PI * 2, rr = radius(def, a) * (k || 1); return [clampW(def[0] + Math.cos(a) * rr * def[7][0]), clampW(def[1] + Math.sin(a) * rr * def[7][1])]; })
    .filter((q, i, A) => i === 0 || Math.hypot(q[0] - A[i - 1][0], q[1] - A[i - 1][1]) > 1e-6);
  const inside = (poly, x, y) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
  // how far the coast is from a mass's centre in a given direction (for keeping the ship at sea)
  const coastR = (def, a) => { const poly = shape(def); let d = 0; while (d < 30 && inside(poly, def[0] + Math.cos(a) * d, def[1] + Math.sin(a) * d)) d += 0.1; return d; };

  // a short glass pipe at sea level from a to b, drawn on by the timeline, with a moving dashed core
  function tube(parent, a, b) {
    const p = P(a[0], a[1], 0.06), q = P(b[0], b[1], 0.06), d = `M${p[0].toFixed(1)} ${p[1].toFixed(1)} L${q[0].toFixed(1)} ${q[1].toFixed(1)}`, L = Math.hypot(q[0] - p[0], q[1] - p[1]);
    const g = el("g", { "data-keepstroke": "" }, parent);
    const outer = el("path", { d, stroke: "#3E8ED9", "stroke-width": 10, fill: "none" }, g), inner = el("path", { d, stroke: "#EAF4FC", "stroke-width": 7, fill: "none" }, g);
    const core = el("path", { d, stroke: "#13CE74", "stroke-width": 2.8, "stroke-dasharray": "5 9", "stroke-linecap": "round", fill: "none", opacity: 0 }, g);
    [outer, inner].forEach((n) => { n.setAttribute("stroke-dasharray", `${L} ${L}`); n.setAttribute("stroke-dashoffset", L); });
    gsap.to(core, { attr: { "stroke-dashoffset": -28 }, duration: 0.9, repeat: -1, ease: "none" });
    return { outer, inner, core, L };
  }
  const tank = (g, x, y, r) => { F.cyl(g, [x, y, 0], "z", r, r * 1.1, { side: "#F1F2F4", cap: "#E3E6EB" }); ISO.poly(g, ISO.hull(F.circle([x, y, r * 1.1], "z", r, 24).concat([P(x, y, r * 1.1 + 0.2)])), "#E3E6EB", { "stroke-width": 0.8 }); };

  function worldA(svg) {
    const tl = gsap.timeline({ paused: true }), D = window.ISOJ.parts;
    el("rect", { x: -400, y: -400, width: 2400, height: 1700, fill: "#F4F8FB" }, svg);
    const cam = el("g", null, svg);
    // the ocean: one square slab of water
    const sea = el("g", { "data-noink": "", "data-nowobble": "" }, cam);
    K.quad(sea, [[0, W, 0], [W, W, 0], [W, W, -1.0], [0, W, -1.0]], "#7FB3D6"); K.quad(sea, [[W, 0, 0], [W, W, 0], [W, W, -1.0], [W, 0, -1.0]], "#6A9FC4");
    K.rect(sea, 0, 0, W, W, "#BFDDF0", 1.3);
    { let d = ""; for (let k = 0; k < 90; k++) { const x = ((k * 7.31) % (W - 1)) + 0.4, y = ((k * 4.57) % (W - 1)) + 0.4, a = P(x, y), b = P(x + 0.5, y); d += `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)} `; }
      el("path", { d, stroke: "#FFFFFF", "stroke-width": 1.6, "stroke-linecap": "round", opacity: 0.7 }, sea); }
    const linkL = el("g", { "data-noink": "", "data-nowobble": "" }, cam), islL = el("g", null, cam), shipL = el("g", { "data-noink": "" }, cam);

    // the islands, back to front: a sandy shore, cliffs on the sides we see, the land on top; then their contents
    const I = {};
    Object.entries(ISL).sort((a, b) => a[1][0] + a[1][1] - b[1][0] - b[1][1]).forEach(([name, def]) => {
      const [cx, cy, r, , ground, look] = def, poly = shape(def), g = el("g", { "data-nowobble": "" }, islL), t = I[name] = { name, g, cx, cy, r, sets: {} };
      const shore = shape(def, 1.07);
      el("polygon", { points: pts(shore.map(([x, y]) => P(x, y, 0.02))), fill: "#EFE3BC", stroke: "#000", "stroke-width": 0.9 }, g);
      for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length], nx = b[1] - a[1], ny = -(b[0] - a[0]);   // outward normal (the outline runs anticlockwise on screen)
        if (nx + ny <= 0) continue; const f = nx / (Math.abs(nx) + Math.abs(ny));
        const edge = (Math.abs(a[0] - W) < 1e-6 && Math.abs(b[0] - W) < 1e-6) || (Math.abs(a[1] - W) < 1e-6 && Math.abs(b[1] - W) < 1e-6), z0 = edge ? -1.0 : 0;   // where the land meets the tile's edge, its side runs down to the bottom of the tile
        el("polygon", { points: pts([P(a[0], a[1], H), P(b[0], b[1], H), P(b[0], b[1], z0), P(a[0], a[1], z0)]), fill: edge ? shade("#B9A27A", 0.06 + 0.16 * f) : shade("#C9B48A", 0.05 + 0.18 * f), stroke: edge ? "none" : "#000", "stroke-width": 0.6 }, g); }
      { const ed = el("path", { d: "", fill: "none", stroke: "#000", "stroke-width": 1 }, g); let d = ""; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length];
          [[0, W], [1, W]].forEach(([k, v]) => { if (Math.abs(a[k] - v) < 1e-6 && Math.abs(b[k] - v) < 1e-6) { const q1 = P(a[0], a[1], -1.0), q2 = P(b[0], b[1], -1.0); d += `M${q1[0].toFixed(1)} ${q1[1].toFixed(1)} L${q2[0].toFixed(1)} ${q2[1].toFixed(1)} `; } }); } ed.setAttribute("d", d); }
      el("polygon", { points: pts(poly.map(([x, y]) => P(x, y, H))), fill: ground, stroke: "#000", "stroke-width": 1.2 }, g);
      t.items = el("g", { transform: `translate(0 ${-ZP})` }, g);   // everything on the island stands on its top
      t.c = P(look[0], look[1], H); t.poly = poly;
    });
    // each island's contents, drawn back to front; set names: base (from the start), town (rises at 1), life (3), fossil, green (4–5), dc (6)
    const Q = {};
    // add(island, x, y, draw, set, footprint): the footprint [x0, y0, x1, y1] is checked against the coast (a warning in the console if it overhangs)
    const add = (isl, x, y, fn, set, fp) => (Q[isl] = Q[isl] || []).push([x, y, fn, set || "base", fp || [x - 0.5, y - 0.5, x + 0.5, y + 0.5]]);
    const house = (isl, x, y, r, set, pv) => add(isl, x + 0.6, y + 0.45, (g) => { ISO.house(g, F, x, y, 1.2, 0.9, 0.6, 0.45, r); if (pv) K.pvQuad(g, [x + 0.1, y + 0.93, 0.66], [x + 1.1, y + 0.93, 0.66], [x + 1.1, y + 0.5, 0.95], [x + 0.1, y + 0.5, 0.95], 3, 2); }, set || "town", [x, y, x + 1.2, y + 0.9]);
    const tree = (isl, x, y, k, sc) => add(isl, x, y, (g) => K.tree(g, x, y, sc || 0.85, k), "base", [x - 0.3, y - 0.3, x + 0.3, y + 0.3]);
    const field = (isl, x0, y0, x1, y1, col, line) => add(isl, (x0 + x1) / 2 - 2, (y0 + y1) / 2 - 2, (g) => { K.rect(g, x0, y0, x1, y1, col, 0.6); for (let y = y0 + 0.3; y < y1 - 0.1; y += 0.3) K.lineGX(g, y, x0, x1, 0, line, 1); }, "base", [x0, y0, x1, y1]);
    const road = (isl, x0, y0, x1, y1) => add(isl, -50, -50, (g) => K.rect(g, x0, y0, x1, y1, "#C9C0AC", 0.6), "base", [x0, y0, x1, y1]);
    const poles = (isl, y, xs) => add(isl, xs[xs.length - 1], y, (g) => { let zs = []; xs.forEach((x) => { zs = K.pole(g, x, y, 1.6, 1); }); K.wires(g, xs, y, zs, [-0.3, 0.3], "#3E4860", 5); }, "power", [xs[0] - 0.2, y - 0.5, xs[xs.length - 1] + 0.2, y + 0.5]);
    const subst = (isl, x, y) => add(isl, x + 0.9, y + 0.6, (g) => { K.rect(g, x, y, x + 1.8, y + 1.2, "#C9CED6", 0.6); K.xfmr(g, x + 0.2, y + 0.15); K.xfmr(g, x + 0.9, y + 0.2); }, "power", [x, y, x + 1.8, y + 1.2]);

    // the old coast: a town and a coal plant that gives way to wind and solar; woods and a wheat field
    road("old", 0.4, 5.3, 6.0, 5.8);
    house("old", 2.4, 2.4, "#B77464"); house("old", 4.2, 1.8, "#8F7A6E"); house("old", 2.2, 4.0, "#C9A15A"); house("old", 4.0, 3.6, "#B77464");
    add("old", 7.4, 3.8, (g) => { K.factory(g, 6.4, 3.0, 2.2, 1.4, 1.4, "#A9876A"); K.chimney(g, 8.8, 3.4, 3.0); const p = P(8.8, 3.4, 3.1); K.smoke(g, p[0], p[1] - 3, true); }, "fossil", [6.4, 3.0, 9.0, 4.4]);
    [[9.8, 2.0], [9.6, 5.4]].forEach(([x, y]) => add("old", x, y, (g) => ISO.turbine(g, F, x, y, 3.4), "green", [x - 0.4, y - 0.4, x + 0.4, y + 0.4]));
    add("old", 7.4, 4.0, (g) => D.panels(g, 6.4, 3.0, 8.6, 4.6), "green", [6.4, 3.0, 8.6, 4.6]);
    field("old", 3.4, 6.4, 6.4, 7.8, "#E9D27A", "#D6BC5E");
    [[1.2, 6.4, "dark"], [1.6, 7.4], [2.6, 7.2, "pine"], [7.2, 6.6, "round"], [8.0, 7.4, "dark"], [10.6, 0.8, "pine"]].forEach(([x, y, k]) => tree("old", x, y, k));
    subst("old", 6.6, 5.4); poles("old", 5.0, [1.6, 3.4, 5.2, 6.8]);
    // the city: towers and a park; a data centre later
    [[25.4, 2.0, 1.3, 1.3, 5.0, "#C9D2DC"], [27.4, 1.4, 1.4, 1.4, 6.4, "#9FB2C6"], [29.6, 2.6, 1.2, 1.2, 4.2, "#E3DDD3"], [27.2, 4.2, 1.2, 1.2, 3.4, "#DCE3EA"], [30.2, 5.0, 1.2, 1.2, 2.8, "#EDE6DA"]].forEach(([x, y, w, d, h, c]) => add("city", x + w / 2, y + d / 2, (g) => K.tower(g, x, y, w, d, h, c, C.water, "pv", { noShop: true, floor: 0.5 }), "town", [x, y, x + w, y + d]));
    add("city", 29.0, 8.2, (g) => K.dataHall(g, 28.0, 7.6, 2.0, 1.2), "dc", [28.0, 7.6, 30.0, 8.8]);
    add("city", 26.0, 5.0, (g) => K.rect(g, 25.2, 4.0, 27.0, 6.0, "#B9DDA8", 0.6), "base", [25.2, 4.0, 27.0, 6.0]);
    [[25.6, 4.5, "round"], [26.5, 5.6], [25.7, 5.7, "dark"], [31.8, 8.0]].forEach(([x, y, k]) => tree("city", x, y, k));
    subst("city", 30.4, 7.2); poles("city", 7.2, [27.4, 29.0]);
    // the home island: houses and a lane; then electric cars, a train, heat pumps, a factory with solar
    road("home", 12.4, 15.6, 21.8, 16.0);
    house("home", 13.8, 14.0, "#B77464", "town", true); house("home", 15.6, 13.6, "#8F7A6E", "town", true); house("home", 13.6, 16.4, "#C9A15A", "town", true);
    [[15.2, 14.6], [17.0, 14.2], [15.0, 17.0]].forEach(([x, y]) => add("home", x, y, (g) => bx(g, x - 0.15, y - 0.12, 0, 0.3, 0.25, 0.28, "#F1F2F4"), "life", [x - 0.2, y - 0.2, x + 0.2, y + 0.2]));
    add("home", 17.6, 16.9, (g) => { K.charger(g, 18.0, 16.6); K.car(g, 16.9, 16.8, "#4AB4D6", "x"); }, "life", [16.9, 16.6, 18.2, 17.4]);
    add("home", 19.6, 14.4, (g) => { K.factory(g, 18.8, 13.4, 2.0, 1.3, 1.2, "#C9A988"); K.pvRoof(g, 18.9, 13.5, 1.25, 1.8, 1.1); }, "life", [18.8, 13.4, 20.8, 14.7]);
    add("home", 17.0, 18.9, (g) => { K.lineGX(g, 18.6, 12.6, 21.4, 0, "#3E4860", 1.4); K.lineGX(g, 19.1, 12.6, 21.4, 0, "#3E4860", 1.4); K.train(g, 19.6, 18.5, 2, { stripe: "#13CE74" }); }, "life", [12.6, 18.5, 21.4, 19.2]);
    [[12.6, 17.2, "dark"], [21.6, 16.8], [22.4, 17.6, "round"], [11.6, 16.4, "pine"], [17.6, 12.6]].forEach(([x, y, k]) => tree("home", x, y, k));
    field("home", 15.2, 19.6, 18.6, 20.6, "#CFE3B8", "#B7D29A");
    subst("home", 20.4, 15.0); poles("home", 17.4, [13.0, 14.8, 16.6]);
    // the port: gas tanks by the water, then wind and solar; a small town, palms
    house("port", 4.4, 24.8, "#B77464"); house("port", 6.0, 24.4, "#C9A15A"); house("port", 3.2, 26.4, "#8F7A6E");
    [[6.6, 28.2, 0.55], [8.1, 28.8, 0.55]].forEach(([x, y, r]) => add("port", x, y, (g) => tank(g, x, y, r), "fossil", [x - r, y - r, x + r, y + r]));
    add("port", 7.0, 28.7, (g) => D.panels(g, 5.6, 27.8, 8.4, 29.6), "green", [5.6, 27.8, 8.4, 29.6]);
    add("port", 2.6, 29.4, (g) => ISO.turbine(g, F, 2.6, 29.4, 3.2), "green", [2.2, 29.0, 3.0, 29.8]);
    [[2.4, 25.0, 0.9], [4.8, 31.0, 0.8], [6.8, 31.2, 0.9]].forEach(([x, y, s2]) => add("port", x, y, (g) => D.palm(g, x, y, s2), "base", [x - 0.3, y - 0.3, x + 0.3, y + 0.3]));
    field("port", 2.0, 30.0, 4.0, 32.4, "#D7E8C0", "#BFD8A4");
    subst("port", 4.6, 26.4); poles("port", 26.0, [6.6, 7.8]);
    // the rural coast: a village, fields and trees; a data centre later
    [[26.6, 27.4, 0.95], [27.8, 26.6, 1], [26.4, 28.8, 0.9]].forEach(([x, y, s2]) => add("rural", x, y, (g) => D.hut(g, x, y, s2), "town", [x - 0.5, y - 0.5, x + 0.5, y + 0.5]));
    field("rural", 28.4, 28.6, 31.4, 30.6, "#D8C77E", "#BFAE62"); field("rural", 29.6, 31.0, 32.6, 32.8, "#CFE3B8", "#B7D29A");
    add("rural", 29.4, 26.2, (g) => K.dataHall(g, 28.4, 25.6, 2.0, 1.2), "dc", [28.4, 25.6, 30.4, 26.8]);
    [[25.8, 30.4, 0.9], [31.6, 27.2, 0.8], [24.8, 32.4, 0.85]].forEach(([x, y, s2]) => add("rural", x, y, (g) => D.acacia(g, x, y, s2), "base", [x - 0.4, y - 0.3, x + 0.4, y + 0.3]));
    add("rural", 26.9, 31.2, (g) => D.panels(g, 26.0, 30.6, 27.8, 31.8), "town", [26.0, 30.6, 27.8, 31.8]);
    [[25.2, 29.0, 1], [26.4, 33.0, -1]].forEach(([x, y, dir]) => add("rural", x, y, (g) => K.cow(g, x, y, { dir, col: "#8F6B4E" }), "base", [x - 0.4, y - 0.3, x + 0.4, y + 0.3]));
    subst("rural", 31.2, 24.4); poles("rural", 25.6, [26.4, 28.0]);
    // the small island
    add("small", 3.4, 16.0, (g) => D.palm(g, 3.4, 16.0, 0.9), "base", [3.1, 15.7, 3.7, 16.3]); add("small", 4.8, 16.8, (g) => ISO.turbine(g, F, 4.8, 16.8, 2.6), "green", [4.4, 16.4, 5.2, 17.2]);
    tree("small", 3.2, 17.2, "round", 0.7);
    // check every footprint against its coast
    { Object.entries(Q).forEach(([isl, list]) => { const poly = shape(ISL[isl], 0.94); list.forEach(([x, y, , , fp]) => { [[fp[0], fp[1]], [fp[2], fp[1]], [fp[0], fp[3]], [fp[2], fp[3]]].forEach(([px, py]) => { if (!inside(poly, px, py)) console.warn("GX: over the coast", isl, px.toFixed(1), py.toFixed(1)); }); }); });
      const names = Object.keys(ISL); names.forEach((a, i) => names.slice(i + 1).forEach((b) => { const pb = shape(ISL[b], 1.07); if (shape(ISL[a], 1.07).some(([x, y]) => inside(pb, x, y))) console.warn("GX: coasts touch", a, b); })); }
    Object.entries(Q).forEach(([isl, list]) => list.sort((a, b) => a[0] + a[1] - b[0] - b[1]).forEach(([, , fn, set]) => { const n = el("g", null, I[isl].items); fn(n); (I[isl].sets[set] = I[isl].sets[set] || []).push(n); }));

    // the cables between the islands, from under one to under the next
    const LINKS = [["old", "city"], ["old", "home"], ["city", "home"], ["home", "port"], ["home", "rural"], ["old", "port"], ["old", "small"], ["small", "port"], ["city", "rural"], ["port", "rural"]];
    const links = LINKS.map(([a, b]) => { const A = ISL[a][5], B = ISL[b][5]; return tube(linkL, A, B); });

    // a gas carrier, sailing in to the port from the open sea
    const ship = el("g", null, shipL), pd = ISL.port, ang = Math.atan2(28.0 - pd[1], 13.0 - pd[0]), off = coastR(pd, ang) + 1.0, s1 = [pd[0] + Math.cos(ang) * off, pd[1] + Math.sin(ang) * off], s0 = [17.0, 33.0];
    bx(ship, -1.5, -0.35, -0.15, 3.0, 0.7, 0.32, "#B5302E", "#C9CED6");
    [-0.8, 0, 0.8].forEach((x) => { const c = P(x, 0, 0.2); el("path", { d: `M${c[0] - 10} ${c[1]} A10 8 0 0 1 ${c[0] + 10} ${c[1]} Z`, fill: "#F1F2F4", stroke: "#192238", "stroke-width": 0.9 }, ship); });
    bx(ship, 1.0, -0.3, 0.17, 0.45, 0.6, 0.45, "#FFFFFF", "#F1F2F4");
    const O = P(0, 0), sail = { u: 0 }, shipAt = () => { const x = s0[0] + (s1[0] - s0[0]) * sail.u, y = s0[1] + (s1[1] - s0[1]) * sail.u, q = P(x, y); ship.setAttribute("transform", `translate(${(q[0] - O[0]).toFixed(1)} ${(q[1] - O[1]).toFixed(1)})`); };
    shipAt(); gsap.set(ship, { opacity: 0 });

    // the camera
    const mid = P(W / 2, W / 2), S0 = 0.6, AX = 990, AY = 490;
    gsap.set(cam, { x: AX - S0 * mid[0], y: AY - S0 * (mid[1] - 40), scale: S0, svgOrigin: "0 0" });
    const camTo = (x, y, s, t, d) => tl.to(cam, { x: AX - s * x, y: AY - s * y, scale: s, duration: d || 0.5, ease: "power2.inOut" }, t);
    const look = (names, s, t, d) => { const ps = names.map((n) => I[n].c); camTo(ps.reduce((a, p) => a + p[0], 0) / ps.length, ps.reduce((a, p) => a + p[1], 0) / ps.length - 50, s, t, d); };
    const set = (n, k) => I[n].sets[k] || [];
    const pop = (gs, t, stg) => gs.forEach((g, i) => { const b = g.getBBox(); gsap.set(g, { scaleY: 0, svgOrigin: `${(b.x + b.width / 2).toFixed(1)} ${(b.y + b.height).toFixed(1)}` }); tl.to(g, { scaleY: 1, duration: 0.3, ease: "back.out(1.5)" }, t + i * (stg || 0.04)); });
    // starting state
    Object.keys(I).forEach((n) => ["town", "life", "green", "dc", "power"].forEach((k) => set(n, k).forEach((g) => gsap.set(g, { opacity: k === "green" ? 0 : 1 }))));
    // ---------- timeline: one beat per card, each as its card comes into view (cards are 1 apart; the last ends at 7.05) ----------
    const BT = (k) => k - 0.2, DUR = 7.05;
    // 1 electrostates: the islands' towns and cities rise
    pop(Object.keys(I).flatMap((n) => set(n, "town")), BT(1), 0.03);
    // 2 from the ground up: substations and lines of poles go up on every coast
    pop(Object.keys(I).flatMap((n) => set(n, "power")), BT(2), 0.03);
    // 3 cars, trains, kitchens, heating, factories: in close on the home island
    look(["home"], 1.4, BT(3) - 0.15, 0.35);
    pop(set("home", "life"), BT(3) + 0.1, 0.04);
    // 4 fossil to clean: the coal plant gives way to wind and solar
    look(["old"], 1.5, BT(4) - 0.1, 0.4);
    tl.to(set("old", "fossil"), { opacity: 0, duration: 0.15 }, BT(4) + 0.3); tl.to(set("old", "green"), { opacity: 1, duration: 0.2 }, BT(4) + 0.35);
    // 5 imported energy: a gas carrier sails in to the port, then the tanks give way to home-grown wind and solar
    look(["port"], 1.5, BT(5) - 0.1, 0.4);
    tl.to(ship, { opacity: 1, duration: 0.05 }, BT(5) + 0.1);
    tl.to(sail, { u: 1, duration: 0.35, ease: "power2.out", onUpdate: shipAt }, BT(5) + 0.1);
    tl.to([ship, ...set("port", "fossil")], { opacity: 0, duration: 0.12 }, BT(5) + 0.55); tl.to(set("port", "green").concat(set("small", "green")), { opacity: 1, duration: 0.2 }, BT(5) + 0.6);
    // 6 AI: back to the whole ocean; data centres rise
    camTo(mid[0], mid[1] - 40, S0, BT(6) - 0.1, 0.45);
    pop(set("city", "dc").concat(set("rural", "dc")), BT(6) + 0.3, 0.1);
    // 7 the nations that build a grid: cables join the islands
    links.forEach((L, k) => { const t = BT(7) + k * 0.012; tl.to([L.outer, L.inner], { attr: { "stroke-dashoffset": 0 }, duration: 0.12, ease: "none" }, t); tl.to(L.core, { opacity: 1, duration: 0.1 }, t + 0.12); });
    tl.to({}, { duration: 0.001 }, DUR - 0.001);
    return tl;
  }

  Object.assign(window.SCENES, { worldA });
})();
