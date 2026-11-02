/* Act 3 in the isometric style of the towns: instead of a world map, nine places stand on tiles of land on one board, 3 × 3,
   in a shallow sea. Back row: American farmland, New York, Rio de Janeiro; middle: a village in Africa, Amsterdam, Australia;
   front: Beijing, India, Bangkok. Two scenes share the board: tilesA (Electrotech) and tilesB (Two
   paths). Small parts (turbines, panels, palms, huts) come from js/iso-j.js. */
(function () {
  if (!window.CLEAN || !window.ISOSCENES || !window.ISOJ || !window.SCENES) return;
  const { el } = SVG;
  const { C } = ISO;
  const { K } = ISOSCENES;
  const P = (x, y, z) => ISO.P(x, y, z || 0);

  // ---------- the nine places ----------
  const F = ISO.frame([0, 0], 1), shade = (h) => ISO.mixHex(h, "#000000", 0.16), lite = (h) => ISO.mixHex(h, "#FFFFFF", 0.35);
  const bx = (g, x, y, z, w, d, h, col, top) => F.box(g, x, y, z, w, d, h, { left: col, right: shade(col), top: top || lite(col) });
  const wins = (g, b, col, rows, cols, o) => { o = o || {}; const W = b.w, H = b.h, z0 = o.z0 || 0.25, dz = (H - z0 - 0.15) / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) { const u0 = 0.12 + (c * (W - 0.24)) / cols, u1 = u0 + ((W - 0.24) / cols) * 0.6, v0 = z0 + r * dz, v1 = v0 + dz * 0.6; F.face(g, F.L, b, u0, v0, u1, v1, col, { "stroke-width": 0.5 }); } };
  const cone = (g, x, y, z, r, h, col) => ISO.poly(g, ISO.hull(F.circle([x, y, z], "z", r, 28).concat([P(x, y, z + h)])), col, { "stroke-width": 0.9 });
  const disc = (g, x, y, z, r, h, col, cap) => F.cyl(g, [x, y, z], "z", r, h, { side: col, cap: cap || lite(col) });
  const onion = (g, x, y, z, r, h, col) => { const c = P(x, y, z), rx = r * 42.4, H = h * 34.64;
    el("path", { d: `M${c[0] - rx} ${c[1]} C${c[0] - rx * 1.4} ${c[1] - H * 0.55} ${c[0] - rx * 0.25} ${c[1] - H * 0.75} ${c[0]} ${c[1] - H} C${c[0] + rx * 0.25} ${c[1] - H * 0.75} ${c[0] + rx * 1.4} ${c[1] - H * 0.55} ${c[0] + rx} ${c[1]} Z`, fill: col, stroke: "#000", "stroke-width": 0.9 }, g);
    el("line", { x1: c[0], y1: c[1] - H, x2: c[0], y2: c[1] - H - 9, stroke: "#C9A15A", "stroke-width": 1.4 }, g); };
  const gable = (g, x, y, w, d, h, col, roof) => {   // a narrow canal house: a pitched roof along gy, its gable to the front
    const b = bx(g, x, y, 0, w, d, h, col), r = h + w * 0.55;
    K.quad(g, [[x, y, h], [x, y + d, h], [x + w / 2, y + d, r], [x + w / 2, y, r]], roof || "#5B4A42");
    K.quad(g, [[x + w, y, h], [x + w, y + d, h], [x + w / 2, y + d, r], [x + w / 2, y, r]], shade(roof || "#5B4A42"));
    K.quad(g, [[x, y + d, h], [x + w, y + d, h], [x + w / 2, y + d, r]], col);
    for (let z = 0.3; z < h - 0.2; z += 0.42) [0.14, 0.48].forEach((u) => F.face(g, F.L, b, u * w / 0.8, z, u * w / 0.8 + 0.18, z + 0.24, "#F3EDE0", { "stroke-width": 0.5 }));
    return b; };
  const prang = (g, x, y, z, r, h) => {   // a Khmer-style temple tower: a tapering, rounded "corn cob" in bands, with a gilt spike
    const c = P(x, y, z), rx = r * 42.4, H = h * 34.64, w = (f) => rx * (1 - Math.pow(f, 1.7) * 0.92);
    el("path", { d: `M${c[0] - rx} ${c[1]} C${c[0] - rx * 1.05} ${c[1] - H * 0.45} ${c[0] - rx * 0.5} ${c[1] - H * 0.8} ${c[0]} ${c[1] - H} C${c[0] + rx * 0.5} ${c[1] - H * 0.8} ${c[0] + rx * 1.05} ${c[1] - H * 0.45} ${c[0] + rx} ${c[1]} Z`, fill: "#EDE3CF", stroke: "#000", "stroke-width": 0.9 }, g);
    el("path", { d: `M${c[0]} ${c[1] - H * 0.02} C${c[0] + rx * 0.6} ${c[1] - H * 0.4} ${c[0] + rx * 0.35} ${c[1] - H * 0.8} ${c[0]} ${c[1] - H} C${c[0] + rx * 0.5} ${c[1] - H * 0.8} ${c[0] + rx * 1.05} ${c[1] - H * 0.45} ${c[0] + rx} ${c[1]} Z`, fill: "#D9CBAE", "data-nostroke": "" }, g);
    let d = ""; [0.18, 0.34, 0.5, 0.64, 0.76, 0.86].forEach((f) => { const yy = c[1] - H * f, ww = w(f) * 0.98; d += `M${c[0] - ww} ${yy} Q${c[0]} ${yy + ww * 0.35} ${c[0] + ww} ${yy} `; });
    el("path", { d, stroke: "#B8873A", "stroke-width": 1.4, fill: "none" }, g);
    el("line", { x1: c[0], y1: c[1] - H, x2: c[0], y2: c[1] - H - H * 0.14, stroke: "#E8B03A", "stroke-width": 2 }, g); };
  const road = (S, y0, y1, x0, x1) => { K.rect(S.gnd, x0 || 0, y0, x1 || NT, y1, "#5B6478", 0.8); for (let x = (x0 || 0) + 0.3; x < (x1 || NT) - 0.4; x += 1.1) K.lineGX(S.gnd, (y0 + y1) / 2, x, x + 0.5, 0, "#FFFFFF", 1.2); };
  const stripes = (S, x0, y0, x1, y1, col, line, step) => { K.rect(S.gnd, x0, y0, x1, y1, col, 0.6); for (let y = y0 + (step || 0.35); y < y1 - 0.1; y += step || 0.35) K.lineGX(S.gnd, y, x0, x1, 0, line, 1); };
  const dcHall = (S, t, x, y, w, d) => S.add(x + w / 2, y + d / 2, (n) => { (t.extra.dc = t.extra.dc || []).push(n); K.dataHall(n, x, y, w, d); });

  const FILL9 = {
    farm(S, t, D) {   // the American farm belt: wheat, a red barn and silos; an oil pumpjack and a coal stack give way to wind and solar
      stripes(S, 0.2, 0.2, 3.4, 3.1, "#E9D27A", "#D6BC5E"); stripes(S, 0.2, 3.4, 3.4, 5.6, "#B9D98C", "#A3C873"); road(S, 6.0, 6.7);
      [[0.9, 0.8], [2.4, 0.5], [1.5, 2.3]].forEach(([x, y]) => S.add(x, y, (g) => D.turbine(g, x, y, 3.0), "green"));
      S.add(2.6, 1.8, (g) => { bx(g, 2.3, 1.6, 0, 0.6, 0.35, 0.25, "#626E88"); K.seg(g, [2.4, 1.78, 0.25], [2.6, 1.78, 0.8], "#3E4860", 1.6); K.seg(g, [2.8, 1.78, 0.25], [2.6, 1.78, 0.8], "#3E4860", 1.6); K.seg(g, [2.1, 1.78, 0.75], [3.1, 1.78, 0.9], "#262C3A", 3); }, "fossil");
      S.add(4.7, 0.9, (g) => { const b = bx(g, 3.9, 0.4, 0, 1.6, 1.1, 0.9, "#B5302E"); K.quad(g, [[3.85, 0.35, 0.9], [5.55, 0.35, 0.9], [5.55, 0.95, 1.45], [3.85, 0.95, 1.45]], "#6E6A72"); K.quad(g, [[3.85, 1.55, 0.9], [5.55, 1.55, 0.9], [5.55, 0.95, 1.45], [3.85, 0.95, 1.45]], "#8A8590");
        K.quad(g, [[3.85, 1.55, 0.9], [3.85, 0.35, 0.9], [3.85, 0.95, 1.45]], "#B5302E"); F.face(g, F.L, b, 0.5, 0, 1.1, 0.65, "#FFFFFF", { "stroke-width": 0.6 }); F.face(g, F.L, b, 0.56, 0.05, 1.04, 0.6, "#B5302E", { "stroke-width": 0.5 }); });
      [[6.1, 0.8, 0.4, 2.0]].forEach(([x, y, r, h]) => S.add(x, y, (g) => { disc(g, x, y, 0, r, h, "#C9CED6"); cone(g, x, y, h, r, 0.3, "#AEB5C0"); }));
      S.add(6.3, 3.0, (g) => { bx(g, 5.7, 2.6, 0, 0.9, 0.7, 0.6, "#8A93A6"); K.chimney(g, 6.4, 2.9, 1.9); D.smokeAt(g, 6.45, 2.95, 1.95, true); }, "fossil");
      S.add(5.4, 4.4, (g) => D.panels(g, 3.8, 3.8, 7.0, 5.2), "green");
      S.add(1.6, 4.6, (g) => { K.fence(g, 0.4, 3.7, 3.2, 3.7); K.cow(g, 1.2, 4.4, { dir: 1 }); K.cow(g, 2.3, 4.9, { dir: -1, col: "#C9A988" }); });
      S.lane(6.05, (g) => { const tr = el("g", null, g); D.truck(tr, 0, 6.1, "#4AB4D6", 1.5); D.loop(tr, -0.6, 5.8, 6, false); });
          },
    nyc(S, t, D) {   // New York: the Hudson, a stepped Art Deco tower among the high-rises, yellow cabs, Central Park, the Statue of Liberty
      K.rect(S.gnd, 0, 0, 1.4, NT, C.water, 0.8); K.rect(S.gnd, 4.6, 4.4, 7.0, 7.0, "#9CCB86", 0.8); K.lineGX(S.gnd, 5.7, 4.6, 7.0, 0, "#E8DDC2", 3);
      road(S, 3.4, 4.0, 1.4, NT); K.rect(S.gnd, 0.15, 5.0, 1.25, 6.5, "#B9D98C", 0.6);
      S.add(0.7, 5.75, (g) => { bx(g, 0.35, 5.4, 0, 0.7, 0.7, 0.18, "#C9C0AC"); bx(g, 0.5, 5.55, 0.18, 0.4, 0.4, 0.55, "#D8CDB4"); const c = P(0.7, 5.75, 0.73); g = el("g", { transform: `translate(${c[0]} ${c[1]}) scale(1.7) translate(${-c[0]} ${-c[1]})` }, g);   // the statue: robe, raised arm and torch, crown
        el("path", { d: `M${c[0] - 5} ${c[1]} L${c[0] - 3} ${c[1] - 24} L${c[0] + 3} ${c[1] - 24} L${c[0] + 5} ${c[1]} Z M${c[0] + 2} ${c[1] - 22} L${c[0] + 5} ${c[1] - 34} L${c[0] + 7} ${c[1] - 33} L${c[0] + 4} ${c[1] - 21} Z`, fill: "#7FBFA5", stroke: "#000", "stroke-width": 0.8 }, g);
        el("circle", { cx: c[0], cy: c[1] - 27, r: 3.2, fill: "#7FBFA5", stroke: "#000", "stroke-width": 0.8 }, g); el("path", { d: `M${c[0] + 6} ${c[1] - 34} L${c[0] + 4.5} ${c[1] - 39} L${c[0] + 8} ${c[1] - 36} Z`, fill: "#FFC400", stroke: "#000", "stroke-width": 0.6 }, g); });
      [[1.8, 0.5, 0.9, 0.9, 3.6, "#C9D2DC"], [4.8, 0.4, 1.0, 1.0, 5.0, "#9FB2C6"], [5.6, 1.9, 0.9, 1.0, 3.4, "#E3DDD3"]]
        .forEach(([x, y, w, d, h, c]) => S.add(x + w / 2, y + d / 2, (g) => K.tower(g, x, y, w, d, h, c, C.water, "pv", { noShop: true, floor: 0.5 })));
      S.add(3.4, 1.2, (g) => { let z = 0; [[1.3, 3.6, "#D8CDB4"], [1.0, 1.6, "#E3DACB"], [0.7, 1.1, "#ECE5D8"], [0.4, 0.8, "#F3EDE0"]].forEach(([w, h, c]) => { const b = bx(g, 3.4 - w / 2, 1.2 - w / 2, z, w, w, h, c); wins(g, b, "#9FB2C6", Math.max(1, Math.round(h * 2)), Math.max(2, Math.round(w * 3))); z += h; });
        const tp = P(3.4, 1.2, z), sp = P(3.4, 1.2, z + 1.3); el("line", { x1: tp[0], y1: tp[1], x2: sp[0], y2: sp[1], stroke: "#626E88", "stroke-width": 2 }, g); });
      S.lane(3.45, (g) => { const c = el("g", null, g); K.car(c, 1.4, 3.5, "#FFC400", "x"); D.loop(c, 0, 4.6, 4.5, false, 0.5); });
      [[5.1, 5.0], [6.5, 5.2], [5.8, 6.5, "round"]].forEach(([x, y, k]) => S.add(x, y, (g) => K.tree(g, x, y, 0.85, k || "dark")));
      dcHall(S, t, 1.8, 4.6, 1.4, 0.9);
      S.add(2.5, 6.5, (g) => { K.charger(g, 3.3, 6.2); K.car(g, 2.0, 6.4, "#47B970", "x"); }, "green");
    },
    rio(S, t, D) {   // Rio de Janeiro: Corcovado with the statue, Sugarloaf in the bay, the beach and its promenade, hillside homes
      K.rect(S.gnd, 4.8, 0, NT, NT, C.water, 0.8); K.rect(S.gnd, 4.0, 0, 4.8, NT, "#F2E2B0", 0.6);
      { let d = ""; for (let y = 0.1; y < NT - 0.2; y += 0.3) { const a = P(3.9, y), b = P(3.75, y + 0.15), c2 = P(3.9, y + 0.3); d += `M${a[0]} ${a[1]} L${b[0]} ${b[1]} L${c2[0]} ${c2[1]} `; } el("path", { d, stroke: "#262C3A", "stroke-width": 1.4, fill: "none" }, S.gnd); }
      S.add(1.3, 1.1, (g) => { K.mountain(g, 1.3, 1.1, 1.3, 3.2, { col: "#6FA078", dome: true, snow: 2 }); const c = P(1.3, 1.1, 3.2); g = el("g", { transform: `translate(${c[0]} ${c[1]}) scale(1.5) translate(${-c[0]} ${-c[1]})` }, g); bx(g, 1.2, 1.0, 3.12, 0.2, 0.2, 0.12, "#E3DDD3");   // the statue on its plinth, arms open
        el("path", { d: `M${c[0] - 2} ${c[1]} L${c[0] - 2} ${c[1] - 17} L${c[0] - 11} ${c[1] - 17} L${c[0] - 11} ${c[1] - 20} L${c[0] + 11} ${c[1] - 20} L${c[0] + 11} ${c[1] - 17} L${c[0] + 2} ${c[1] - 17} L${c[0] + 2} ${c[1]} Z`, fill: "#F3EDE0", stroke: "#000", "stroke-width": 0.8 }, g);
        el("circle", { cx: c[0], cy: c[1] - 23, r: 2.6, fill: "#F3EDE0", stroke: "#000", "stroke-width": 0.8 }, g); });
      S.add(6.1, 1.2, (g) => { K.mountain(g, 6.1, 1.2, 0.8, 2.0, { col: "#6F9A7C", dome: true, snow: 2 }); K.mountain(g, 6.6, 2.5, 0.55, 1.1, { col: "#7FA88A", dome: true, snow: 2 }); K.seg(g, [6.1, 1.2, 2.0], [6.6, 2.5, 1.1], "#3E4860", 0.6); });
      const COLS = ["#F2B134", "#3FA7D6", "#EE6C4D", "#F7F7F7", "#9BC53D", "#F26DA6"];
      [[0.4, 2.7, 0.3], [1.1, 2.8, 0.3], [1.8, 2.7, 0.3], [0.7, 3.5, 0], [1.5, 3.5, 0], [2.3, 3.4, 0]].forEach(([x, y, z], i) => {
        S.add(x + 0.25, y + 0.25 + z * 0.01, (g) => { if (z) bx(g, x, y, 0, 0.55, 0.5, z, "#9BBF8A"); const b = bx(g, x, y, z, 0.55, 0.5, 0.42, COLS[i % 6]); F.face(g, F.L, b, 0.12, 0.12, 0.28, 0.3, "#3E4860", { "stroke-width": 0.4 }); });
        if (i % 3 === 1) S.add(x + 0.26, y + 0.26 + z * 0.01, (g) => F.face(g, F.T, { x, y, z, w: 0.55, d: 0.5, h: 0.42 }, 0.07, 0.07, 0.48, 0.43, C.pv, { "stroke-width": 0.5 }), "green"); });
      [[3.0, 4.3, 2.6], [3.0, 5.5, 3.0]].forEach(([x, y, h]) => S.add(x + 0.35, y + 0.35, (g) => K.tower(g, x, y, 0.75, 0.75, h, "#F1F2F4", C.water, "pv", { noShop: true, floor: 0.4 })));
      [[4.3, 1.0, 0.9], [4.4, 3.4, 1], [4.4, 6.2, 0.95]].forEach(([x, y, s]) => S.add(x, y, (g) => D.palm(g, x, y, s)));
      S.add(1.4, 5.3, (g) => D.panels(g, 0.3, 4.4, 1.8, 6.4), "green");
      S.lane(6.6, (g) => { K.rect(g, 0, 6.55, 3.8, 7.15, "#5B6478", 0.8); const b = el("g", null, g); K.bus(b, 0, 6.6, "#47B970"); D.loop(b, -0.3, 1.2, 6, true); }, "green");
    },
    afv(S, t, D) {   // a village in Africa (as before, with a baobab and cattle); later, home solar by the huts and Kenya's mobile mast
      D.FILL.af(S);
      t.extra.pv = []; [[1.2, 4.5], [2.4, 4.5]].forEach(([x, y]) => S.add(x, y, (g) => { t.extra.pv.push(g); ISO.panel(g, F, x - 0.5, y - 0.3, 1.0, 0.5); }));
      S.add(4.6, 6.4, (g) => { t.extra.mast = g; mast(g, 4.6, 6.4); });
      S.add(6.3, 4.4, (g) => { disc(g, 6.3, 4.4, 0, 0.32, 1.0, "#9C8670"); [[-0.6, -0.3], [-0.2, -0.6], [0.3, -0.5], [0.6, -0.2]].forEach(([dx, dy]) => K.seg(g, [6.3, 4.4, 1.0], [6.3 + dx * 0.6, 4.4 + dy * 0.3, 1.4], "#7E6247", 2.2)); el("ellipse", Object.assign({ fill: "#7DBF7E", stroke: "#000", "stroke-width": 0.8 }, (() => { const c = P(6.3, 4.4, 1.5); return { cx: c[0], cy: c[1], rx: 26, ry: 9 }; })()), g); });
      [[5.4, 6.7, 1]].forEach(([x, y, dir]) => S.add(x, y, (g) => K.cow(g, x, y, { dir, col: "#8F6B4E" })));
      stripes(S, 2.4, 5.5, 4.2, 7.0, "#D8C77E", "#BFAE62", 0.3);   // a maize plot
      [[0.8, 5.4, 0.95], [1.8, 6.1, 0.9]].forEach(([x, y, s2]) => S.add(x, y, (g) => D.hut(g, x, y, s2)));
      [[4.6, 5.2, 0.8]].forEach(([x, y, s2]) => S.add(x, y, (g) => D.acacia(g, x, y, s2)));
    },
    ams(S, t, D) {   // Amsterdam: a canal lined with tall gabled houses, a bridge, a windmill, tulip fields, bikes
      K.rect(S.gnd, 0, 3.0, NT, 3.9, C.water, 0.8); K.lineGX(S.gnd, 3.0, 0, NT, 0, "#626E88", 1.6); K.lineGX(S.gnd, 3.9, 0, NT, 0, "#626E88", 1.6);
      [["#E04B4B", 5.0], ["#FFCD00", 5.35], ["#F28CB1", 5.7], ["#E04B4B", 6.05], ["#FFCD00", 6.4], ["#F2F2F2", 6.75]].forEach(([c, y]) => K.rect(S.gnd, 4.6, y, 7.0, y + 0.3, c, 0.4));
      road(S, 6.4, 7.0, 0, 4.4);
      const HC = ["#8C4B3A", "#3E4860", "#C96F4A", "#E9D9B4", "#5B6478", "#A3695D", "#2F6F4E"];
      [0.5, 1.3, 2.1, 2.9].forEach((x, i) => { const h = [1.9, 1.6, 2.1, 1.7][i]; S.add(x + 0.38, 1.9, (g) => gable(g, x, 1.4, 0.75, 1.2, h, HC[i], "#5B4A42")); if (i % 2) S.add(x + 0.39, 1.91, (g) => K.pvQuad(g, [x + 0.42, 1.45, h + 0.05], [x + 0.42, 2.55, h + 0.05], [x + 0.72, 2.55, h - 0.12], [x + 0.72, 1.45, h - 0.12], 2, 3), "green"); });
      [0.4, 1.15, 1.9].forEach((x, i) => S.add(x + 0.35, 4.6, (g) => gable(g, x, 4.1, 0.7, 1.0, [1.4, 1.6, 1.3, 1.5][i], HC[(i + 3) % 7], "#6E5048")));
      S.add(5.2, 3.45, (g) => { bx(g, 4.8, 2.85, 0.25, 0.8, 1.2, 0.12, "#B9A58A"); el("path", { d: (() => { const a = P(5.2, 3.0, 0.02), b = P(5.2, 3.45, 0.25), c = P(5.2, 3.9, 0.02); return `M${a[0]} ${a[1]} Q${b[0]} ${b[1] - 8} ${c[0]} ${c[1]}`; })(), stroke: "#7E6247", "stroke-width": 1.6, fill: "none" }, g); K.bike(g, 5.0, 3.3, "#262C3A", { top: "#EE7309" }); });
      S.add(5.0, 1.2, (g) => K.mill(g, 5.0, 1.2));
      S.add(6.7, 4.5, (g) => D.turbine(g, 6.7, 4.5, 2.6), "green");
      S.lane(3.3, (g) => { const b = el("g", null, g); bx(b, 0, 3.25, 0, 1.4, 0.4, 0.2, "#1F4E79"); bx(b, 0.3, 3.3, 0.2, 0.7, 0.3, 0.22, "#F1F2F4"); D.loop(b, -0.4, 5.8, 9, false); });
      S.lane(6.45, (g) => { const tm = el("g", null, g); bx(tm, 0, 6.5, 0.08, 2.4, 0.5, 0.6, "#FFCD00", "#F1F2F4"); for (let u = 0.2; u < 2.2; u += 0.4) F.face(tm, F.L, { x: 0, y: 6.5, z: 0.08, w: 2.4, d: 0.5, h: 0.6 }, u, 0.25, u + 0.28, 0.5, "#9FB2C6", { "stroke-width": 0.4 }); D.loop(tm, -0.4, 2.4, 7, true); });
      [[4.0, 4.4, "round"], [3.4, 5.8]].forEach(([x, y, k]) => S.add(x, y, (g) => K.tree(g, x, y, 0.75, k)));
      S.add(1.8, 5.9, (g) => { K.bike(g, 1.6, 5.9, "#B5302E", { top: "#4AB4D6" }); });
    },
    aus(S, t, D) {   // Australia: Sydney's harbour with its bridge and the Opera House; the red outback with a solar farm, a big battery, kangaroos
      K.rect(S.gnd, 3.4, 0, NT, 3.2, C.water, 0.8); K.rect(S.gnd, 0, 4.0, 4.0, NT, "#D99A6C", 0.6);
      S.add(5.4, 0.4, (g) => { const y = 0.5, x0 = 3.3, x1 = NT; bx(g, x0, y - 0.2, 0, 0.35, 0.4, 0.9, "#C9C0AC"); bx(g, x1 - 0.4, y - 0.2, 0, 0.35, 0.4, 0.9, "#C9C0AC");
        K.seg(g, [x0, y, 0.55], [x1, y, 0.55], "#3E4860", 2.4); let d = ""; for (let k = 0; k <= 24; k++) { const u = k / 24, q = P(x0 + 0.2 + (x1 - x0 - 0.4) * u, y, 0.55 + 1.5 * Math.sin(Math.PI * u)); d += (k ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1); }
        el("path", { d, stroke: "#626E88", "stroke-width": 3, fill: "none" }, g); for (let k = 2; k < 23; k += 2) { const u = k / 24, x = x0 + 0.2 + (x1 - x0 - 0.4) * u; K.seg(g, [x, y, 0.55], [x, y, 0.55 + 1.5 * Math.sin(Math.PI * u)], "#8A93A6", 0.8); } });
      S.add(5.4, 2.6, (g) => { bx(g, 3.8, 1.9, 0, 3.0, 1.2, 0.3, "#E3DDD3"); [[4.15, 1.3], [4.85, 1.7], [5.6, 1.45], [6.25, 1.0]].forEach(([x, h]) => { const a = P(x - 0.35, 2.2, 0.3), b = P(x + 0.45, 2.2, 0.3), c2 = P(x - 0.05, 2.3, 0.3 + h), m = P(x + 0.15, 3.0, 0.3);
        el("path", { d: `M${a[0]} ${a[1]} Q${c2[0] - 4} ${c2[1] + 6} ${c2[0]} ${c2[1]} Q${b[0]} ${(b[1] + c2[1]) / 2} ${b[0]} ${b[1]} Z`, fill: "#F7F7F2", stroke: "#000", "stroke-width": 0.9 }, g); el("path", { d: `M${c2[0]} ${c2[1]} Q${m[0]} ${(m[1] + c2[1]) / 2} ${m[0]} ${m[1]} L${b[0]} ${b[1]} Z`, fill: "#E3E6EB", stroke: "#000", "stroke-width": 0.9 }, g); }); });
      [[0.8, 0.8, "#F3E6CC"]].forEach(([x, y, c]) => { S.add(x + 0.6, y + 0.45, (g) => { const b = ISO.house(g, F, x, y, 1.2, 0.9, 0.55, 0.4, "#9DA6B5"); F.face(g, F.L, b, 0.05, 0, 1.15, 0.55, c, { "stroke-width": 0.8 }); }); S.add(x + 0.61, y + 0.46, (g) => D.pvOnHouse(g, x, y, 1.2, 0.9, 0.55), "green"); });
      [[2.6, 1.8, 0.9]].forEach(([x, y, s]) => S.add(x, y, (g) => D.gum(g, x, y, s)));
      S.lane(3.4, (g) => { K.rect(g, 0, 3.35, 3.4, 3.95, "#5B6478", 0.8); const u = el("g", null, g); D.truck(u, 0, 3.4, "#FFFFFF", 1.3); D.loop(u, -0.4, 2.0, 5, true); });
      S.add(1.8, 5.2, (g) => D.panels(g, 0.3, 4.3, 3.6, 5.8), "green");
      S.add(1.4, 6.6, (g) => [0.3, 1.4].forEach((x) => K.batt(g, x, 6.3, 1.0)), "green");
      S.add(6.2, 5.0, (g) => D.turbine(g, 6.2, 5.0, 3.0), "green");
      S.add(3.4, 6.6, (g) => { D.roo(g, 3.0, 6.4, 1, 1); D.roo(g, 3.7, 6.8, -1, 0.8); });
      S.add(5.6, 6.6, (g) => D.gum(g, 5.6, 6.6, 0.8));
    },
    bj(S, t, D) {   // Beijing: the Temple of Heaven, a red palace gate, new towers, a high-speed train on its viaduct, EVs, solar
      S.add(1.6, 1.6, (g) => { [[1.35, 0.14], [1.15, 0.14], [0.95, 0.14]].reduce((z, [r, h]) => { disc(g, 1.6, 1.6, z, r, h, "#F1F2F4", "#F7F7F2"); return z + h; }, 0);
        disc(g, 1.6, 1.6, 0.42, 0.62, 0.42, "#B5302E"); cone(g, 1.6, 1.6, 0.84, 0.82, 0.22, "#2E5FA8"); disc(g, 1.6, 1.6, 1.0, 0.5, 0.26, "#B5302E"); cone(g, 1.6, 1.6, 1.26, 0.68, 0.22, "#2E5FA8");
        disc(g, 1.6, 1.6, 1.42, 0.4, 0.24, "#B5302E"); cone(g, 1.6, 1.6, 1.66, 0.55, 0.5, "#2E5FA8"); const tp = P(1.6, 1.6, 2.16); el("circle", { cx: tp[0], cy: tp[1] - 2, r: 3, fill: "#E8B03A", stroke: "#000", "stroke-width": 0.7 }, g); });
      S.add(4.5, 2.9, (g) => { const b = bx(g, 3.2, 2.6, 0, 2.6, 0.6, 0.85, "#B5302E"); [0.5, 1.15, 1.8].forEach((u) => F.face(g, F.L, b, u, 0, u + 0.35, 0.55, "#7A1F1F", { "stroke-width": 0.5 }));
        K.quad(g, [[3.05, 2.45, 0.85], [5.95, 2.45, 0.85], [5.7, 2.9, 1.3], [3.3, 2.9, 1.3]], "#E8B03A"); K.quad(g, [[3.05, 3.35, 0.85], [5.95, 3.35, 0.85], [5.7, 2.9, 1.3], [3.3, 2.9, 1.3]], "#F2C55C"); K.quad(g, [[5.95, 2.45, 0.85], [5.95, 3.35, 0.85], [5.7, 2.9, 1.3]], "#C99528"); });
      [[0.6, 5.3, 1.0, 1.0, 4.2, "#C9D2DC"]].forEach(([x, y, w, d, h, c]) => S.add(x + w / 2, y + d / 2, (g) => K.tower(g, x, y, w, d, h, c, C.water, "pv", { noShop: true, floor: 0.5 })));
      S.lane(4.3, (g) => { F.box(g, 0, 4.3, 0.5, NT, 0.7, 0.12, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" }); [0.8, 3.3, 5.8].forEach((x) => F.box(g, x, 4.5, 0, 0.18, 0.18, 0.5, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" }));
        const w = el("g", { transform: `translate(0 ${-0.62 * 34.64})` }, g), tr = el("g", null, w); K.train(tr, 0, 4.34, 1, { stripe: "#C8102E" }); D.loop(tr, -1.6, 4.6, 3.2, false); }, "green");
      [[2.6, 5.8, "#4AB4D6"]].forEach(([x, y, c]) => S.add(x + 0.6, y + 0.3, (g) => { K.charger(g, x + 1.25, y - 0.15); K.car(g, x, y, c, "x"); }, "green"));
      S.add(5.4, 6.0, (g) => D.panels(g, 3.8, 5.3, 7.0, 6.8), "green");
      [[0.4, 6.8], [6.8, 3.2, "round"]].forEach(([x, y, k]) => S.add(x, y, (g) => K.tree(g, x, y, 0.8, k)));
      dcHall(S, t, 0.3, 3.3, 1.2, 0.7);
    },
    ind(S, t, D) {   // India: the Taj Mahal and its long pool between cypresses, a solar park, a town with auto-rickshaws and a cow in the road
      S.add(3.3, 1.6, (g) => { bx(g, 1.6, 0.4, 0, 3.4, 2.3, 0.22, "#E9DCC6");
        [[1.75, 0.55], [4.85, 0.55], [1.75, 2.55], [4.85, 2.55]].forEach(([x, y]) => { disc(g, x, y, 0.22, 0.09, 1.7, "#F7F3EA"); onion(g, x, y, 1.92, 0.12, 0.3, "#F7F3EA"); });
        const b = bx(g, 2.5, 0.9, 0.22, 1.6, 1.3, 0.95, "#F7F3EA"); F.face(g, F.L, b, 0.55, 0.05, 1.05, 0.75, "#E3DACB", { "stroke-width": 0.6 }); [0.12, 1.23].forEach((u) => { F.face(g, F.L, b, u, 0.1, u + 0.25, 0.4, "#E3DACB", { "stroke-width": 0.5 }); F.face(g, F.L, b, u, 0.5, u + 0.25, 0.8, "#E3DACB", { "stroke-width": 0.5 }); });
        [[2.7, 1.1], [3.9, 1.1], [2.7, 2.0], [3.9, 2.0]].forEach(([x, y]) => onion(g, x, y, 1.17, 0.14, 0.35, "#F7F3EA")); disc(g, 3.3, 1.55, 1.17, 0.42, 0.2, "#F7F3EA"); onion(g, 3.3, 1.55, 1.37, 0.55, 1.25, "#F7F3EA"); });
      K.rect(S.gnd, 3.05, 2.9, 3.55, 5.0, C.water, 0.6); K.rect(S.gnd, 2.8, 2.9, 3.05, 5.0, "#E9DCC6", 0.4); K.rect(S.gnd, 3.55, 2.9, 3.8, 5.0, "#E9DCC6", 0.4);
      [3.3, 4.4].forEach((y) => [[2.6, y], [4.0, y]].forEach(([x, yy]) => S.add(x, yy, (g) => K.tree(g, x, yy, 0.7, "pine"))));
      S.add(1.3, 4.1, (g) => D.panels(g, 0.2, 3.1, 2.4, 5.0), "green");
      const HC = ["#F2B134", "#9CC5E8", "#F6A5A5", "#7FC8A9", "#E9D9B4", "#C9A0DC"];
      t.extra.pv = [];
      [[4.7, 3.4], [5.9, 3.3], [5.0, 4.4], [6.3, 4.4]].forEach(([x, y], i) => { const h = 0.5 + (i % 3) * 0.2;
        S.add(x + 0.35, y + 0.3, (g) => { const b = bx(g, x, y, 0, 0.7, 0.6, h, HC[i]); F.face(g, F.L, b, 0.15, 0.1, 0.35, 0.35, "#3E4860", { "stroke-width": 0.4 }); disc(g, x + 0.5, y + 0.2, h, 0.1, 0.18, "#262C3A"); });
        S.add(x + 0.36, y + 0.31, (g) => { t.extra.pv.push(g); F.face(g, F.T, { x, y, z: 0, w: 0.7, d: 0.6, h }, 0.06, 0.3, 0.42, 0.55, C.pv, { "stroke-width": 0.5 }); }); });
      S.lane(5.5, (g) => { K.rect(g, 0, 5.45, NT, 6.1, "#8A8075", 0.8); [0].forEach((o) => { const r = el("g", null, g); bx(r, 0, 5.55, 0.08, 0.6, 0.38, 0.22, "#2F8A52"); bx(r, 0.05, 5.58, 0.3, 0.5, 0.32, 0.22, "#FFC400", "#262C3A"); [0.1, 0.5].forEach((u) => K.wheel(r, u, 5.93, 0.07, 0.07, "y")); D.loop(r, -0.4, 6.8, 6, false, o / 6); }); }, "green");
      S.add(2.2, 6.6, (g) => K.cow(g, 2.2, 6.6, { dir: 1, col: "#F1F2F4" }));
      [[0.5, 6.7, "round"], [6.6, 6.6, "dark"]].forEach(([x, y, k]) => S.add(x, y, (g) => K.tree(g, x, y, 0.85, k)));
      dcHall(S, t, 5.5, 0.6, 1.3, 0.8);
    },
    bkk(S, t, D) {   // Bangkok: the river with long-tail boats, a temple's spired prang and tiered roofs, towers, tuk-tuks; a gas terminal gives way to floating solar
      K.rect(S.gnd, 0, 4.4, NT, 5.6, C.water, 0.8); road(S, 3.3, 3.95);
      S.add(1.4, 1.4, (g) => { bx(g, 0.3, 0.3, 0, 2.2, 2.2, 0.22, "#E3DACB"); bx(g, 0.6, 0.6, 0.22, 1.6, 1.6, 0.25, "#ECE5D8");
        [[0.75, 0.75], [2.05, 0.75], [0.75, 2.05], [2.05, 2.05]].forEach(([x, y]) => prang(g, x, y, 0.22, 0.2, 1.1));
        prang(g, 1.4, 1.4, 0.47, 0.42, 2.9); });
      S.add(3.4, 1.0, (g) => { bx(g, 2.6, 0.5, 0, 1.6, 1.0, 0.6, "#F3EDE0"); [[0.6, "#C8102E"], [0.85, "#EE7309"], [1.1, "#C8102E"]].forEach(([z, c], k) => { const i = k * 0.15; K.quad(g, [[2.5 + i, 0.4 + i, z], [4.3 - i, 0.4 + i, z], [4.3 - i, 1.0, z + 0.3], [2.5 + i, 1.0, z + 0.3]], c); K.quad(g, [[2.5 + i, 1.6 - i, z], [4.3 - i, 1.6 - i, z], [4.3 - i, 1.0, z + 0.3], [2.5 + i, 1.0, z + 0.3]], shade(c)); });
        [2.55, 4.25].forEach((x) => { const q = P(x, 1.0, 1.4); el("path", { d: `M${q[0]} ${q[1]} q-2 -8 3 -10`, stroke: "#E8B03A", "stroke-width": 1.8, fill: "none" }, g); }); });
      [[0.5, 5.9, 0.9, 0.9, 3.2, "#C9D2DC"], [1.8, 6.1, 0.8, 0.8, 2.4, "#9FB2C6"]].forEach(([x, y, w, d, h, c]) => S.add(x + w / 2, y + d / 2, (g) => K.tower(g, x, y, w, d, h, c, C.water, "pv", { noShop: true, floor: 0.5 })));
      [[4.6, 2.7, 0.9]].forEach(([x, y, s]) => S.add(x, y, (g) => D.palm(g, x, y, s)));
      S.lane(3.4, (g) => { [0].forEach((o) => { const r = el("g", null, g); bx(r, 0, 3.45, 0.08, 0.6, 0.38, 0.22, "#1F6FB3"); bx(r, 0.05, 3.48, 0.3, 0.5, 0.32, 0.2, "#FFC400", "#262C3A"); [0.1, 0.5].forEach((u) => K.wheel(r, u, 3.83, 0.07, 0.07, "y")); D.loop(r, -0.4, 6.8, 5, false, o / 5); }); }, "green");
      S.add(1.6, 4.9, (g) => { for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { const x = 0.3 + c * 1.0, y = 4.55 + r * 0.5; F.box(g, x, y, 0, 0.85, 0.4, 0.04, { left: "#9DA6B5", right: "#7A8296", top: C.pv }); } }, "green");
      S.lane(5.1, (g) => { const b = el("g", null, g); bx(b, 0, 5.05, 0, 1.3, 0.3, 0.14, "#8F6B4E"); K.person(b, 1.0, 5.2, { sit: true, top: "#EE7309" }); D.loop(b, 3.4, 7.0, 7, true); });
      [[5.0, 6.4, 0.45], [6.3, 6.5, 0.45]].forEach(([x, y, r]) => S.add(x, y, (g) => { disc(g, x, y, 0, r, r * 1.2, "#F1F2F4", "#E3E6EB"); cone(g, x, y, r * 1.2, r, 0.18, "#E3E6EB"); }, "fossil"));
      [[5.2, 0.6, "#F2B134"], [6.2, 0.9, "#9CC5E8"], [5.5, 1.9, "#F6A5A5"]].forEach(([x, y, c]) => S.add(x + 0.35, y + 0.3, (g) => { bx(g, x, y, 0, 0.7, 0.6, 0.55, c); K.quad(g, [[x - 0.05, y - 0.05, 0.55], [x + 0.75, y - 0.05, 0.55], [x + 0.75, y + 0.3, 0.8], [x - 0.05, y + 0.3, 0.8]], "#C8102E"); K.quad(g, [[x - 0.05, y + 0.65, 0.55], [x + 0.75, y + 0.65, 0.55], [x + 0.75, y + 0.3, 0.8], [x - 0.05, y + 0.3, 0.8]], "#9E0B22"); }));
      [[3.4, 6.6, 0.85]].forEach(([x, y, s]) => S.add(x, y, (g) => D.palm(g, x, y, s)));
    }
  };

  // ---------- the board: nine places on tiles of land in a shallow sea, 3 × 3, in the same isometric plane as the towns ----------
  const NT = 7.2, GAP = 1.25, MG = 1.0, TB = 2 * MG + 3 * NT + 2 * GAP, TBX = TB, SEA = 0.45;
  const at = (i, j) => [MG + i * (NT + GAP), MG + j * (NT + GAP)];
  const LAYOUT = { farm: [0, 0], nyc: [1, 0], rio: [2, 0], afv: [0, 1], ams: [1, 1], aus: [2, 1], bj: [0, 2], ind: [1, 2], bkk: [2, 2] };
  const GROUND = { farm: "#E8E3C8", nyc: "#D8DDE3", rio: "#DCEBD3", afv: "#F0DCC0", ams: "#DCEBD3", aus: "#EFE3B8", bj: "#E3DDD3", ind: "#EADFC3", bkk: "#DCEBD3" };
  const OLDER = ["farm", "nyc", "ams", "aus"], BUILDING = ["afv", "ind", "bkk"];
  const LINKS = [["farm", "nyc"], ["nyc", "rio"], ["afv", "ams"], ["ams", "aus"], ["bj", "ind"], ["farm", "afv"], ["afv", "bj"], ["nyc", "ams"], ["ams", "ind"], ["rio", "aus"]];
  const UNDERSEA = [["ind", "bkk"], ["aus", "bkk"]];   // laid at "undersea cables" (Two paths)

  function board(svg) {
    const D = window.ISOJ.parts, { slab } = D;
    D.still(true);   // a calm board: cars, trains, boats and bikes stand still
    el("rect", { x: -400, y: -400, width: 2400, height: 1700, fill: "#F4F8FB" }, svg);
    const cam = el("g", null, svg);
    const sea = el("g", { transform: `translate(0 ${(SEA * 34.64).toFixed(2)})`, "data-noink": "", "data-nowobble": "" }, cam);
    K.quad(sea, [[0, TB, 0], [TBX, TB, 0], [TBX, TB, -0.8], [0, TB, -0.8]], "#7FB3D6");
    K.quad(sea, [[TBX, 0, 0], [TBX, TB, 0], [TBX, TB, -0.8], [TBX, 0, -0.8]], "#6A9FC4");
    K.rect(sea, 0, 0, TBX, TB, "#BFDDF0", 1.3);
    { let d = ""; for (let k = 0; k < 80; k++) { const x = ((k * 7.31) % (TBX - 1)) + 0.4, y = ((k * 4.57) % (TB - 1)) + 0.4, a = P(x, y), b = P(x + 0.5, y); d += `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)} `; }
      el("path", { d, stroke: "#FFFFFF", "stroke-width": 1.6, "stroke-linecap": "round", opacity: 0.7 }, sea); }
    const linkL = el("g", { "data-noink": "", "data-nowobble": "" }, cam), tileL = el("g", null, cam), shipL = el("g", { "data-noink": "" }, cam), topL = el("g", { "data-noink": "" }, cam);

    const T = {};
    Object.entries(LAYOUT).sort((a, b) => a[1][0] + a[1][1] - b[1][0] - b[1][1]).forEach(([name, [i, j]]) => {
      const [ox, oy] = at(i, j), outer = el("g", { "data-tile": name }, tileL), t = T[name] = { name, ox, oy, g: outer, fossil: [], green: [], extra: {} };
      t.c = P(ox + NT / 2, oy + NT / 2, 0);
      const S = slab(outer, ox, oy, NT, NT, GROUND[name], { raw: true, T: SEA });
      FILL9[name](S, t, D);
      const o = S.flush(); t.fossil.push(...o.fossil); t.green.push(...o.green);
      t.glow = el("polygon", { points: [P(0.08, 0.08), P(NT - 0.08, 0.08), P(NT - 0.08, NT - 0.08), P(0.08, NT - 0.08)].map((q) => q.map((v) => v.toFixed(1)).join(",")).join(" "), fill: "none", stroke: "#13CE74", "stroke-width": 5, opacity: 0, "data-keepstroke": "" }, S.gnd);
    });
    // the links between neighbouring tiles: short glass pipes across the channels, from under one tile to under the next
    const link = ([a, b]) => { const A = T[a], B = T[b], ver = A.oy !== B.oy, m = ver ? A.ox + NT / 2 : A.oy + NT / 2;
      const [p, q] = ver ? [[m, A.oy + NT - 0.4], [m, B.oy + 0.4]] : [[A.ox + NT - 0.4, m], [B.ox + 0.4, m]];
      return Object.assign(tube(linkL, p, q, "#13CE74", 1), { a, b }); };
    const links = LINKS.map(link), undersea = UNDERSEA.map(link);

    // an LNG carrier, sailing in along the front of the board to Bangkok's gas terminal
    const ship = el("g", null, shipL), sy = T.bkk.oy + NT + 0.5, sx0 = TBX - 1.7, sx1 = T.bkk.ox + 5.6;
    F.box(ship, -1.6, sy - 0.4, -SEA - 0.15, 3.2, 0.8, 0.35, { left: "#B5302E", right: "#262C3A", top: "#C9CED6" });
    [-0.9, 0, 0.9].forEach((x) => { const c = P(x, sy, -SEA + 0.2); el("path", { d: `M${c[0] - 11} ${c[1]} A11 9 0 0 1 ${c[0] + 11} ${c[1]} Z`, fill: "#F1F2F4", stroke: "#192238", "stroke-width": 0.9 }, ship); });
    F.box(ship, 1.0, sy - 0.3, -SEA + 0.2, 0.5, 0.6, 0.5, { left: "#FFFFFF", right: "#C9CED6", top: "#F1F2F4" });
    const shipAt = (x) => ship.setAttribute("transform", `translate(${(30 * x).toFixed(1)} ${(17.32 * x).toFixed(1)})`);
    const sail = { x: sx0 }; shipAt(sx0); gsap.set(ship, { opacity: 0 });

    // suns over the villages
    const sun = (t) => { const c = P(t.ox + NT / 2, t.oy + NT / 2, 5.2), g = el("g", { opacity: 0 }, topL), r = el("g", null, g);
      for (let k = 0; k < 12; k++) { const a = (k * Math.PI) / 6; el("line", { x1: c[0] + Math.cos(a) * 26, y1: c[1] + Math.sin(a) * 26, x2: c[0] + Math.cos(a) * 36, y2: c[1] + Math.sin(a) * 36, stroke: "#FFC400", "stroke-width": 3.5, "stroke-linecap": "round" }, r); }
      el("circle", { cx: c[0], cy: c[1], r: 19, fill: "#FFD84D", stroke: "#E8A800", "stroke-width": 1.5 }, g);
      gsap.to(r, { rotation: 360, svgOrigin: `${c[0]} ${c[1]}`, duration: 24, repeat: -1, ease: "none" }); return g; };
    const suns = [sun(T.afv), sun(T.ind)];
    D.still(false);
    const mid = P(TBX / 2, TB / 2, 0), S0 = 0.78, AX = 920, AY = 500;
    gsap.set(cam, { x: AX - S0 * mid[0], y: AY - S0 * (mid[1] - 40), scale: S0, svgOrigin: "0 0" });
    return { cam, T, links, undersea, ship, shipAt, sail, sx1, suns, mid, S0, AX, AY };
  }

  // a short glass pipe at sea level from a to b (iso units), with a moving dashed core; drawn on with its own tween
  function tube(parent, a, b, col, w) {
    const z = -SEA + 0.12, p = P(a[0], a[1], z), q = P(b[0], b[1], z), d = `M${p[0].toFixed(1)} ${p[1].toFixed(1)} L${q[0].toFixed(1)} ${q[1].toFixed(1)}`, L = Math.hypot(q[0] - p[0], q[1] - p[1]);
    const g = el("g", { "data-keepstroke": "" }, parent), s = w || 1;
    const outer = el("path", { d, stroke: "#3E8ED9", "stroke-width": 11 * s, "stroke-linecap": "butt", fill: "none" }, g);
    const inner = el("path", { d, stroke: "#EAF4FC", "stroke-width": 8 * s, "stroke-linecap": "butt", fill: "none" }, g);
    const core = el("path", { d, stroke: col, "stroke-width": 3 * s, "stroke-dasharray": "5 9", "stroke-linecap": "round", fill: "none", opacity: 0 }, g);
    [outer, inner].forEach((n) => { n.setAttribute("stroke-dasharray", `${L} ${L}`); n.setAttribute("stroke-dashoffset", L); });
    const flow = gsap.to(core, { attr: { "stroke-dashoffset": -28 }, duration: 0.9, repeat: -1, ease: "none" });
    return { g, outer, inner, core, L, flow, w: s };
  }
  // a mobile mast: a lattice tower with three panels and its signal
  function mast(g, x, y) {
    const b = P(x, y, 0), t = P(x, y, 3.0), h = b[1] - t[1];
    el("path", { d: `M${b[0] - 9} ${b[1]} L${t[0] - 1.5} ${t[1]} M${b[0] + 9} ${b[1]} L${t[0] + 1.5} ${t[1]}` + [0.2, 0.4, 0.6, 0.8].map((u) => { const y0 = b[1] - h * u, w0 = 9 - 7.5 * u, y1 = b[1] - h * (u + 0.2), w1 = 9 - 7.5 * (u + 0.2); return ` M${b[0] - w0} ${y0} L${b[0] + w1} ${y1} M${b[0] + w0} ${y0} L${b[0] - w1} ${y1}`; }).join(""), stroke: "#626E88", "stroke-width": 1.6, fill: "none" }, g);
    [-6, 0, 6].forEach((dx) => el("rect", { x: t[0] + dx - 2, y: t[1] + 6, width: 4, height: 11, fill: "#F1F2F4", stroke: "#192238", "stroke-width": 0.9 }, g));
    el("circle", { cx: t[0], cy: t[1] - 2, r: 2.6, fill: "#E04B00" }, g);
    [10, 17, 24].forEach((r, i) => { const arc = (sx) => `M${t[0] + sx * r * 0.5} ${t[1] + 4 - r * 0.87} A${r} ${r} 0 0 ${sx > 0 ? 1 : 0} ${t[0] + sx * r * 0.5} ${t[1] + 4 + r * 0.87}`;
      const a = el("path", { d: arc(1) + " " + arc(-1), fill: "none", stroke: "#2E6FB3", "stroke-width": 2, "stroke-linecap": "round" }, g);
      gsap.fromTo(a, { opacity: 0.15 }, { opacity: 1, duration: 0.7, delay: i * 0.25, repeat: -1, yoyo: true }); });
  }

  // ---------- the two sections ----------
  const camTo = (tl, B, x, y, s, t, d) => tl.to(B.cam, { x: B.AX - s * x, y: B.AY - s * y, scale: s, duration: d || 0.6, ease: "power2.inOut" }, t);
  const drawLink = (tl, L, t, d) => { tl.to([L.outer, L.inner], { attr: { "stroke-dashoffset": 0 }, duration: d || 0.3, ease: "power1.inOut" }, t); tl.to(L.core, { opacity: 1, duration: 0.15 }, t + (d || 0.3)); };
  const ctr = (B, names) => { const ps = names.map((n) => B.T[n].c); return [ps.reduce((a, p) => a + p[0], 0) / ps.length, ps.reduce((a, p) => a + p[1], 0) / ps.length - 40]; };
  const hideExtras = (T) => Object.values(T).forEach((t) => { ["pv", "dc"].forEach((k) => t.extra[k] && gsap.set(t.extra[k], { opacity: 0 })); if (t.extra.mast) gsap.set(t.extra.mast, { opacity: 0 }); });
  const DCS = ["nyc", "bj", "ind"];

  // Electrotech: the places rise one by one, are electrified from the ground up, fossil gives way to clean power, imported gas
  // to home-grown wind and solar, data centres go up, and the places' grids join up
  function tilesA(svg) {
    const tl = gsap.timeline({ paused: true }), B = board(svg), T = B.T, BT = (k) => k - 0.2, DUR = 7.05;
    const order = ["farm", "nyc", "rio", "afv", "ams", "aus", "bj", "ind", "bkk"];
    order.forEach((n) => gsap.set(T[n].g, { y: -60, opacity: 0 }));
    ["farm", "afv", "bkk"].forEach((n) => gsap.set(T[n].green, { opacity: 0 }));
    hideExtras(T); B.undersea.forEach((c) => gsap.set(c.g, { opacity: 0 }));
    // 1: electrostates rise
    order.forEach((n, k) => tl.to(T[n].g, { y: 0, opacity: 1, duration: 0.3, ease: "back.out(1.4)" }, BT(1) + k * 0.07));
    // 2: from the ground up: each place is outlined in green
    order.forEach((n, k) => T[n].glow && tl.to(T[n].glow, { opacity: 0.85, duration: 0.2 }, BT(2) + k * 0.05));
    // 3: cars, trains, kitchens, heating, factories: in close on New York and Amsterdam
    camTo(tl, B, ...ctr(B, ["nyc", "ams"]), 1.3, BT(3), 0.6);
    // 4: fossil to clean: the American farm belt, then the village in Africa
    camTo(tl, B, ...ctr(B, ["farm"]), 1.5, BT(4) - 0.1, 0.4);
    tl.to(T.farm.fossil, { opacity: 0, duration: 0.15 }, BT(4) + 0.3); tl.to(T.farm.green, { opacity: 1, duration: 0.2 }, BT(4) + 0.35);
    camTo(tl, B, ...ctr(B, ["afv"]), 1.5, BT(4) + 0.55, 0.35);
    tl.to(T.afv.fossil, { opacity: 0, duration: 0.15 }, BT(4) + 0.85); tl.to(T.afv.green, { opacity: 1, duration: 0.2 }, BT(4) + 0.9);
    // 5: imported energy: a gas carrier sails in to Bangkok, then the gas terminal gives way to floating solar
    camTo(tl, B, ...ctr(B, ["bkk"]), 1.45, BT(5) - 0.1, 0.4);
    tl.to(B.ship, { opacity: 1, duration: 0.05 }, BT(5) + 0.15);
    tl.to(B.sail, { x: B.sx1, duration: 0.35, ease: "power2.out", onUpdate: () => B.shipAt(B.sail.x) }, BT(5) + 0.15);
    tl.to([B.ship, ...T.bkk.fossil], { opacity: 0, duration: 0.12 }, BT(5) + 0.6); tl.to(T.bkk.green, { opacity: 1, duration: 0.2 }, BT(5) + 0.65);
    // 6: AI: back to the whole board; data centres go up in New York, Beijing and India
    camTo(tl, B, B.mid[0], B.mid[1] - 40, B.S0, BT(6) - 0.1, 0.5);
    DCS.forEach((n, k) => (T[n].extra.dc || []).forEach((g) => { gsap.set(g, { y: -40 }); tl.to(g, { y: 0, opacity: 1, duration: 0.25, ease: "back.out(1.6)" }, BT(6) + 0.35 + k * 0.08); }));
    // 7: the nations that build a grid: the places' grids join up
    B.links.forEach((L, k) => drawLink(tl, L, BT(7) + k * 0.012, 0.12));
    tl.to({}, { duration: 0.001 }, DUR - 0.001);
    return tl;
  }

  // Two paths: the same board, finished; first the places still building (the village in Africa, India, Bangkok and its
  // the sea), then the older grids (the American farm belt, New York, Amsterdam, Australia)
  function tilesB(svg) {
    const tl = gsap.timeline({ paused: true }), B = board(svg), T = B.T, BT = (k) => k - 0.2, DUR = 4.05;
    Object.values(T).forEach((t) => { gsap.set(t.fossil, { opacity: 0 }); if (t.glow) gsap.set(t.glow, { opacity: 0.85 }); });
    hideExtras(T); DCS.forEach((n) => T[n].extra.dc && gsap.set(T[n].extra.dc, { opacity: 1 }));
    B.undersea.forEach((c) => [c.outer, c.inner].forEach((n) => n.setAttribute("stroke-dashoffset", c.L)));
    B.links.forEach((L) => { [L.outer, L.inner].forEach((n) => n.setAttribute("stroke-dashoffset", 0)); gsap.set(L.core, { opacity: 1 }); });
    const others = Object.keys(T).filter((n) => !BUILDING.includes(n)).map((n) => T[n].g);
    // 1: the places still building
    tl.to(others, { opacity: 0.28, duration: 0.3 }, 0.05);
    camTo(tl, B, ...ctr(B, ["afv", "ind", "bkk"]), 1.0, 0.05, 0.5);
    // 2: undersea cables are laid from Bangkok across the sea to its neighbours
    camTo(tl, B, ...ctr(B, ["bkk"]), 1.35, BT(1), 0.45);
    B.undersea.forEach((c, k) => drawLink(tl, c, BT(1) + 0.4 + k * 0.12, 0.3));
    // 3: solar villages in Africa and South Asia
    camTo(tl, B, ...ctr(B, ["afv", "ind"]), 1.2, BT(2), 0.45);
    B.suns.forEach((s, k) => tl.to(s, { opacity: 1, duration: 0.2 }, BT(2) + 0.35 + k * 0.1));
    [...T.afv.extra.pv, ...T.ind.extra.pv].forEach((n, k) => tl.to(n, { opacity: 1, duration: 0.12 }, BT(2) + 0.45 + k * 0.05));
    // 4: Kenya's mobile mast
    camTo(tl, B, ...ctr(B, ["afv"]), 1.7, BT(3), 0.45);
    tl.to(B.suns, { opacity: 0, duration: 0.2 }, BT(3));
    tl.to(T.afv.extra.mast, { opacity: 1, duration: 0.25 }, BT(3) + 0.4);
    // 5: older grids transformed: back into colour, and the links between them are upgraded
    const older = OLDER.map((n) => T[n].g), rest = Object.keys(T).filter((n) => !OLDER.includes(n)).map((n) => T[n].g);
    tl.to(older, { opacity: 1, duration: 0.2 }, BT(4) - 0.1); tl.to(rest, { opacity: 0.32, duration: 0.2 }, BT(4) - 0.1);
    camTo(tl, B, ...ctr(B, OLDER), 1.0, BT(4) - 0.1, 0.3);
    B.links.filter((L) => OLDER.includes(L.a) && OLDER.includes(L.b)).forEach((L, k) => { const t = BT(4) + 0.1 + k * 0.03;   // the last card: all within its short window
      tl.to(L.outer, { attr: { "stroke-width": 17 }, duration: 0.15 }, t); tl.to(L.inner, { attr: { "stroke-width": 13 }, duration: 0.15 }, t);
      tl.to(L.core, { attr: { stroke: "#37A6E6", "stroke-width": 5.5 }, duration: 0.15 }, t); });
    tl.to({}, { duration: 0.001 }, DUR - 0.001);
    return tl;
  }

  Object.assign(window.SCENES, { tilesA, tilesB });
})();
