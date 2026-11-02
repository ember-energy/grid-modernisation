/* Part 2 — the grid map ("highway" metaphor): lines are lanes, electricity is traffic,
   interventions are road signs placed where they act. */
(function () {
  const { el, icon, signGroup } = SVG;
  const C = {
    n5: "#192238", n4: "#3E4860", n3: "#626E88", n2: "#B0B7C6", n1: "#D8DBE6",
    g5: "#0B6638", g4: "#109553", g3: "#13CE74", g2: "#A3D9A5", g1: "#D3EADF",
    b5: "#203772", b4: "#1E609C", b3: "#37A6E6", b2: "#97CCED", b1: "#C4D9E9",
    o4: "#BF3100", o2: "#EE7309", o1: "#FCA311", y3: "#FFC400", y2: "#FFDA44", y1: "#FFF4A3", w: "#FFFFFF", tint: "#EDEFF6"
  };
  const CAT_COL = { optimize: C.g5, reinforce: C.b5, expand: C.o1 };
  const FULL = [20, 40, 1540, 960];   // the overview: framed on the landscape, a little tighter than the whole drawing

  const N = {
    W: [200, 230], L: [360, 330], S1: [500, 380], S2: [430, 620], S3: [780, 260], S4: [820, 480],
    S5: [1180, 330], S6: [1080, 700], solar: [250, 560], hydro: [620, 165], storage: [930, 300],
    ind: [1380, 440], city: [1260, 820], homes: [290, 790], village: [130, 905], old: [1270, 140],
    control: [690, 620], NEW: [850, 880], zone: [420, 95], nb: [1545, 560]
  };
  const LINES = [
    { id: "w-l", a: "W", b: "L", kind: "clean", bend: 0.1 },
    { id: "l-s1", a: "L", b: "S1", kind: "high", bend: -0.1 },
    { id: "s1-s3", a: "S1", b: "S3", kind: "clean", bend: 0.12 },
    { id: "s1-s4", a: "S1", b: "S4", kind: "clean", bend: -0.08 },
    { id: "solar-s2", a: "solar", b: "S2", kind: "clean", bend: 0.1 },
    { id: "s2-s4", a: "S2", b: "S4", kind: "clean", bend: 0.1 },
    { id: "hydro-s3", a: "hydro", b: "S3", kind: "clean", bend: -0.1 },
    { id: "s3-s5", a: "S3", b: "S5", kind: "high", bend: -0.08 },
    { id: "s4-s5", a: "S4", b: "S5", kind: "clean", bend: 0.1 },
    { id: "s4-storage", a: "S4", b: "storage", kind: "flex", bend: 0.15 },
    { id: "s4-s6", a: "S4", b: "S6", kind: "clean", bend: -0.1 },
    { id: "s5-ind", a: "S5", b: "ind", kind: "clean", bend: 0.1 },
    { id: "old-s5", a: "old", b: "S5", kind: "flex", bend: 0.1 },
    { id: "s6-city", a: "S6", b: "city", kind: "high", bend: 0.1 },
    { id: "s2-homes", a: "S2", b: "homes", kind: "clean", bend: -0.1 },
    { id: "homes-village", a: "homes", b: "village", kind: "clean", bend: 0.1 },
    // built by Expand
    { id: "line-new-sub", a: "S6", b: "NEW", kind: "clean", bend: 0.1, hidden: true },
    { id: "line-newzone", a: "zone", b: "S3", kind: "clean", bend: 0.1, hidden: true },
    { id: "line-hvdc", a: "L", b: "ind", kind: "high", custom: "M360 330 C520 20 1150 -10 1380 440", hidden: true },
    { id: "line-inter", a: "ind", b: "nb", kind: "flex", bend: -0.15, hidden: true }
  ];
  const DOT = { clean: C.g3, high: C.b3, flex: C.o2, storage: C.y3 };

  let svg, root, pinsLayer, ring, lines = {}, feats = {}, pins = [];
  let state = { boost: null, storage: false, flex: null, island: false };

  function pathFor(l) {
    if (l.custom) return l.custom;
    const [x1, y1] = N[l.a], [x2, y2] = N[l.b];
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1;
    return `M${x1} ${y1} Q${mx - dy * l.bend} ${my + dx * l.bend} ${x2} ${y2}`;
  }

  function feature(id, draw) {
    const g = el("g", { id: "f-" + id, class: "gm-dim" }, root);
    draw(g);
    feats[id] = g;
    return g;
  }
  /* ---------- drawing vocabulary shared with the story scenes: calm land, a few well-made side-view objects, ink outlines ---------- */
  const S = { br5: "#6D5A56", br4: "#857572", br3: "#B6B0AF", br2: "#D8D5D4", o3: "#EE7309", y1: "#FFF4A3" };
  // labels live in their own layer on top of the landscape, lines and substations (only the road signs sit above them),
  // and follow their place's state: faded when another place is in focus, hidden until a new place is built
  let labelLayer = null; const pending = [], labelsFor = {};
  function label(g, x, y, txt) { pending.push({ id: g.id.replace(/^f-/, ""), x, y, txt }); }
  function drawLabels() {
    labelLayer = el("g", { "data-noink": "" }, root);
    pending.forEach(({ id, x, y, txt }) => { const t = el("text", { x, y, class: "gm-label", text: txt }, labelLayer); (labelsFor[id] = labelsFor[id] || []).push(t); });
    ["node-new", "newzone", "neighbour"].forEach((id) => (labelsFor[id] || []).forEach((t) => gsap.set(t, { opacity: 0 })));
  }
  function tree(g, x, y, s, col) {
    s = s || 1;
    el("rect", { x: x - 2 * s, y: y - 12 * s, width: 4 * s, height: 12 * s, fill: S.br4 }, g);
    el("circle", { cx: x, cy: y - 20 * s, r: 10 * s, fill: col || C.g4 }, g);
  }
  function copse(g, x, y, n) {   // a small wood: trees packed back to front
    const pts = [];
    for (let i = 0; i < n; i++) pts.push([x + ((i * 37) % 60) - 30, y + ((i * 23) % 26) - 13]);
    pts.sort((a, b) => a[1] - b[1]).forEach(([tx, ty], i) => tree(g, tx, ty, 0.9 + (i % 3) * 0.12, i % 3 ? C.g4 : C.g5));
  }
  function house(g, x, b, w, h, body, roof, solar) {
    const rh = w * 0.42;
    el("rect", { x: x - w / 2, y: b - h, width: w, height: h, fill: body }, g);
    el("path", { d: `M${x - w / 2 - 3} ${b - h} L${x} ${b - h - rh} L${x + w / 2 + 3} ${b - h} Z`, fill: roof }, g);
    if (solar) el("path", { d: `M${x + 3} ${b - h - rh + 5} L${x + w / 2 - 2} ${b - h - 3} L${x + w / 2 - 7} ${b - h - 3} L${x - 1} ${b - h - rh + 8} Z`, fill: C.b5 }, g);
    el("rect", { x: x - w / 2 + 4, y: b - h + 5, width: w * 0.28, height: h * 0.32, fill: C.y2 }, g);
    el("rect", { x: x + w * 0.1, y: b - h * 0.6, width: w * 0.24, height: h * 0.6, fill: S.br4 }, g);
  }
  function smoke(g, x, y) { for (let k = 0; k < 3; k++) { const c = el("circle", { cx: x, cy: y, r: 5, fill: C.n1, opacity: 0.85 }, g); gsap.fromTo(c, { attr: { cy: y, r: 4 }, opacity: 0.85 }, { attr: { cy: y - 30, r: 10 }, opacity: 0, duration: 3, repeat: -1, ease: "none", delay: -k }); } }

  function drawBase() {
    el("rect", { x: -700, y: -500, width: 3000, height: 2000, fill: C.g1 }, root);
    // the sea, with a shallow edge
    const seaD = ["M-700 -500 L340 -500 L340 0 C310 110 380 200 330 300 C290 390 220 440 150 520 C100 580 50 640 0 690 C-200 760 -500 800 -700 820 Z",
      "M2300 600 L1600 640 C1500 660 1440 720 1420 800 C1400 880 1440 950 1470 1000 C1500 1100 1520 1300 1540 1500 L2300 1500 Z"];
    seaD.forEach((d) => { el("path", { d, fill: "none", stroke: C.b1, "stroke-width": 24, "stroke-linejoin": "round", "data-noink": "" }, root); el("path", { d, fill: C.b2 }, root); });
    [[70, 400], [1560, 860]].forEach(([x, y]) => el("path", { d: `M${x} ${y} q8 -6 16 0 q8 -6 16 0`, stroke: C.w, "stroke-width": 2, fill: "none" }, root));
    // the river
    const rv = "M650 180 C700 300 600 400 640 500 C680 600 900 620 1000 760 C1080 870 1300 900 1440 960";
    el("path", { d: rv, stroke: C.b2, "stroke-width": 9, fill: "none", "stroke-linecap": "round" }, root);
    // one calm mountain range along the north: pale peaks behind, a green foothill in front
    const mt = el("g", null, root);
    const peak = (x, base, h, col) => {
      const w = h * 0.9;
      el("path", { d: `M${x - w} ${base} L${x - 8} ${base - h + 6} Q${x} ${base - h - 3} ${x + 8} ${base - h + 6} L${x + w} ${base} Z`, fill: col }, mt);
      el("path", { d: `M${x - h * 0.3} ${base - h * 0.66} L${x - 8} ${base - h + 6} Q${x} ${base - h - 3} ${x + 8} ${base - h + 6} L${x + h * 0.3} ${base - h * 0.66} Q${x + h * 0.15} ${base - h * 0.6} ${x} ${base - h * 0.68} Q${x - h * 0.15} ${base - h * 0.6} ${x - h * 0.3} ${base - h * 0.66} Z`, fill: C.w }, mt);
    };
    [[520, 150, 120], [800, 140, 140], [1080, 150, 120], [1450, 120, 120]].forEach(([x, b, h]) => peak(x, b, h, C.n1));
    [[660, 160, 100], [940, 165, 96], [1300, 140, 96]].forEach(([x, b, h]) => peak(x, b, h, C.b1));
    // neighbour region (revealed by an Expand intervention)
    feature("neighbour", (g) => {
      el("path", { d: "M1470 380 L2300 360 L2300 640 L1600 640 C1560 650 1500 660 1470 700 Z", fill: C.n1, opacity: 0.6 }, g);
      el("path", { d: "M1470 380 L1470 700", stroke: C.n3, "stroke-width": 2, "stroke-dasharray": "8 6" }, g);
      house(g, 1530, 560, 26, 18, C.w, C.n4); house(g, 1572, 600, 26, 18, S.y1, C.n4);
      label(g, 1550, 470, "NEIGHBOURING GRID");
    });
    // a handful of woods, placed clear of lines and places
    const woods = el("g", null, root);
    [[470, 470, 5], [1060, 470, 6], [560, 880, 5], [1440, 300, 4], [180, 680, 4], [1000, 980, 4]].forEach(([x, y, n]) => copse(woods, x, y, n));
  }

  function drawFeatures() {
    feature("wind", (g) => {
      [[220, 180, 66], [150, 210, 72], [282, 214, 66], [130, 282, 74], [214, 290, 76]].sort((a, b) => a[1] - b[1]).forEach(([x, b, h], i) => {
        el("rect", { x: x - 3, y: b - 2, width: 6, height: 5, fill: C.n2 }, g);
        SVG.turbine(g, x, b, h, { dur: 3 + (i % 3) * 0.6 });
      });
      label(g, 205, 326, "OFFSHORE WIND");
    });
    feature("landing", (g) => {
      el("rect", { x: 344, y: 322, width: 34, height: 22, fill: C.n1 }, g); el("path", { d: "M340 322 L361 310 L382 322 Z", fill: C.n4 }, g);
      label(g, 361, 366, "LANDING STATION");
    });
    feature("solar", (g) => {
      for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) {
        const x = 186 + k * 48 + r * 6, y = 536 + r * 26;
        SVG.panelQuad(g, [[x, y], [x + 42, y], [x + 46, y + 12], [x + 4, y + 12]], 6, 2);
        el("rect", { x: x + 8, y: y + 12, width: 2, height: 5, fill: C.n4 }, g); el("rect", { x: x + 36, y: y + 12, width: 2, height: 5, fill: C.n4 }, g);
      }
      label(g, 262, 640, "SOLAR FARM");
    });
    feature("hydro", (g) => {
      el("path", { d: "M548 150 C548 124 600 110 640 116 C668 121 672 140 660 154 Z", fill: C.b2 }, g);
      el("path", { d: "M604 154 L664 150 L668 176 L608 180 Z", fill: C.n1 }, g);
      el("rect", { x: 652, y: 176, width: 22, height: 14, fill: C.n2 }, g);
      label(g, 610, 214, "HYDROPOWER");
    });
    feature("storage", (g) => {
      for (let i = 0; i < 4; i++) {
        el("rect", { x: 896 + i * 22, y: 292, width: 19, height: 26, fill: C.w }, g);
        el("rect", { x: 896 + i * 22, y: 298, width: 19, height: 4, fill: C.g4 }, g);
      }
      label(g, 872, 344, "BATTERY STORAGE");
    });
    feature("control", (g) => {
      el("rect", { x: 652, y: 600, width: 76, height: 38, fill: C.w }, g);
      el("rect", { x: 648, y: 594, width: 84, height: 7, fill: C.n4 }, g);
      for (let i = 0; i < 4; i++) el("rect", { x: 660 + i * 17, y: 608, width: 11, height: 11, fill: C.b2 }, g);
      label(g, 700, 694, "CONTROL CENTRE");
      el("path", { d: "M730 610 L820 480 M650 615 L430 620", stroke: C.b4, "stroke-width": 1.5, "stroke-dasharray": "3 5", fill: "none" }, g);
    });
    feature("homes", (g) => {
      const hs = [[236, 744, C.w, C.n4], [272, 740, S.y1, S.o3], [308, 746, C.b1, C.n4], [250, 800, S.br2, S.br4], [286, 796, C.w, S.o3], [322, 802, S.y1, C.n4], [360, 798, C.b1, S.br4]];
      hs.sort((a, b) => a[1] - b[1]).forEach(([x, b, body, roof], i) => house(g, x, b, 30, 20, body, roof, i % 2 === 0));
      el("rect", { x: 404, y: 778, width: 4, height: 18, rx: 1, fill: C.g4 }, g);
      el("path", { d: "M412 796 C412 790 414 789 418 789 L421 784 L431 784 L435 789 C438 789 439 792 439 796 Z", fill: C.b3 }, g);
      el("circle", { cx: 418, cy: 796, r: 2.4, fill: C.n5 }, g); el("circle", { cx: 433, cy: 796, r: 2.4, fill: C.n5 }, g);
      label(g, 300, 836, "HOMES & EV CHARGING");
    });
    feature("village", (g) => {
      [[100, 924, S.y1], [134, 930, S.br2], [168, 922, S.y1]].sort((a, b) => a[1] - b[1]).forEach(([x, b, c]) => house(g, x, b, 24, 15, c, S.br4));
      el("path", { d: "M58 918 L80 918 L83 926 L61 926 Z", fill: C.b5 }, g); el("rect", { x: 69, y: 926, width: 2, height: 9, fill: C.n4 }, g);
      label(g, 120, 962, "VILLAGE MICROGRID");
    });
    feature("industry", (g) => {
      el("rect", { x: 1404, y: 380, width: 9, height: 40, fill: C.n4 }, g);
      el("rect", { x: 1328, y: 420, width: 96, height: 36, fill: C.n2 }, g);
      let d = "M1328 420"; for (let k = 0; k < 4; k++) d += ` L${1328 + k * 24} 406 L${1352 + k * 24} 420`; el("path", { d: d + " Z", fill: C.n3 }, g);
      for (let k = 0; k < 4; k++) el("rect", { x: 1334 + k * 24, y: 430, width: 12, height: 8, fill: C.y2 }, g);
      el("path", { d: "M1444 456 L1444 394 L1480 394 M1444 406 L1472 394 M1476 394 L1476 414", stroke: S.o3, "stroke-width": 3, fill: "none" }, g);
      label(g, 1384, 482, "INDUSTRY & PORT");
    });
    feature("oldplant", (g) => {
      el("rect", { x: 1310, y: 76, width: 9, height: 56, fill: C.n3 }, g);
      el("path", { d: "M1236 158 C1232 130 1244 112 1240 92 L1272 92 C1268 112 1280 130 1276 158 Z", fill: C.n1 }, g);
      el("rect", { x: 1282, y: 128, width: 46, height: 30, fill: C.n2 }, g);
      smoke(g, 1314, 72);
      label(g, 1290, 226, "EXISTING POWER PLANT");
    });
    feature("city", (g) => {
      // back row then front row, so the blocks overlap cleanly
      [[1196, 150, 30, C.n2], [1262, 176, 34, C.b1], [1326, 140, 30, C.n2]].forEach(([x, h, w, col]) => block(g, x, 884, w, h, col));
      [[1170, 96, 32, C.w], [1228, 120, 34, S.y1], [1292, 104, 32, C.w], [1350, 84, 30, C.b1]].forEach(([x, h, w, col]) => block(g, x, 900, w, h, col));
      label(g, 1276, 926, "CITY");
    });
    function block(g, x, base, w, h, col) {
      el("rect", { x, y: base - h, width: w, height: h, fill: col }, g);
      for (let r = 0; r < Math.floor((h - 10) / 16); r++) for (let c = 0; c < Math.floor((w - 6) / 10); c++) el("rect", { x: x + 5 + c * 10, y: base - h + 8 + r * 16, width: 5, height: 7, fill: C.y2 }, g);
    }
    feature("newzone", (g) => {
      [[388, 92, 54], [430, 76, 58], [472, 96, 52]].sort((a, b) => a[1] - b[1]).forEach(([x, b, h], i) => SVG.turbine(g, x, b, h, { dur: 3 + i * 0.4 }));
      label(g, 432, 120, "NEW RENEWABLE ZONE");
    });
    feature("node-new", (g) => {
      [[732, 908], [766, 914]].forEach(([x, b], i) => house(g, x, b, 28, 18, i ? C.w : S.y1, C.n4, true));
      el("rect", { x: 806, y: 892, width: 60, height: 24, fill: C.n2 }, g);
      let d = "M806 892"; for (let k = 0; k < 3; k++) d += ` L${806 + k * 20} 882 L${826 + k * 20} 892`; el("path", { d: d + " Z", fill: C.n3 }, g);
      label(g, 800, 956, "NEW TOWN & INDUSTRIAL PARK");
    });
  }

  function drawLines() {
    const layer = el("g", { "data-noink": "" }, root);
    const dotLayer = el("g", { "data-noink": "" }, root);
    LINES.forEach((l) => {
      const d = pathFor(l);
      const g = el("g", { id: "line-" + l.id }, layer);
      // a single clean line with a soft halo: the grid reads as one network, not as clutter
      const outer = el("path", { d, stroke: C.w, "stroke-opacity": 0.6, "stroke-width": 9, fill: "none", "stroke-linecap": "round" }, g);
      const inner = el("path", { d, stroke: l.kind === "high" ? C.b4 : C.n3, "stroke-width": l.kind === "high" ? 3.2 : 2.4, fill: "none", "stroke-linecap": "round" }, g);
      const len = inner.getTotalLength();
      const towers = el("g", null, g);
      const n = Math.max(3, Math.round(len / 60));
      const dots = [];
      const dg = el("g", null, dotLayer);
      for (let i = 0; i < n * 2; i++) {
        const c = el("circle", { r: 3.6, fill: DOT[l.kind] }, dg);
        dots.push({ c, t: (i % n) / n + (i >= n ? 0.5 / n : 0), extra: i >= n, rev: l.kind === "flex" && i % 2 === 1 });
      }
      lines[l.id] = { def: l, g, outer, inner, towers, len, dots, dg, speed: 60, thick: false, visible: !l.hidden };
      if (l.hidden) { gsap.set([g, dg], { opacity: 0 }); }
    });
  }

  function drawNodes() {
    ["S1", "S2", "S3", "S4", "S5", "S6", "NEW"].forEach((k) => {
      const [x, y] = N[k];
      const g = el("g", { id: "f-node-" + k.toLowerCase(), class: "gm-dim" }, root);
      // a substation: a pale yard with two transformers
      el("rect", { x: x - 18, y: y - 11, width: 36, height: 22, rx: 3, fill: C.w }, g);
      [x - 12, x + 2].forEach((tx) => el("rect", { x: tx, y: y - 6, width: 10, height: 12, rx: 1.5, fill: C.n3 }, g));
      feats["node-" + k.toLowerCase()] = g;
    });
    gsap.set(feats["node-new"], { opacity: 0, scale: 0, transformOrigin: "50% 50%" });
    ["newzone"].forEach((k) => gsap.set(feats[k], { opacity: 0 }));
    gsap.set(feats["neighbour"], { opacity: 0 });
  }

  function drawPins() {
    pinsLayer = el("g", { "data-noink": "" }, root);
    ring = el("circle", { r: 46, fill: "none", stroke: C.n5, "stroke-width": 3, opacity: 0 }, root);
    INTERVENTIONS.forEach((iv, i) => {
      const [x, y] = iv.at;
      const g = el("g", { class: "gm-pin" }, pinsLayer);
      el("line", { x1: x, y1: y + 10, x2: x, y2: y + 34, stroke: C.n4, "stroke-width": 3 }, g);
      signGroup(iv.cat, iv.icon, x, y - 6, 44, g);
      el("title", { text: iv.tech }, g);
      gsap.set(g, { scale: 0, svgOrigin: `${x} ${y + 34}` });
      g.addEventListener("click", () => {
        const step = document.querySelector(`[data-iv="${iv.id}"]`);
        if (step) step.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      pins.push(g);
    });
  }

  // particle loop
  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    for (const id in lines) {
      const L = lines[id];
      if (!L.visible) continue;
      const boosted = state.boost && state.boost.includes(id);
      const speed = (boosted ? 150 : 55) / L.len;
      const isStorage = state.storage && (id === "s4-storage" || id === "s4-s5");
      const isFlex = state.flex === id;
      const cut = state.island && id === "homes-village";
      for (const d of L.dots) {
        const show = !cut && (!d.extra || boosted || L.thick);
        if (!show) { d.c.setAttribute("opacity", 0); continue; }
        d.c.setAttribute("opacity", 1);
        const rev = d.rev || (isFlex && d.extra);
        d.t = (d.t + speed * dt) % 1;
        const p = L.inner.getPointAtLength((rev ? 1 - d.t : d.t) * L.len);
        d.c.setAttribute("cx", p.x); d.c.setAttribute("cy", p.y);
        d.c.setAttribute("r", L.thick ? 5 : 3.6);
        let col = DOT[L.def.kind];
        if (isStorage && d.extra) col = DOT.storage;
        if (isFlex) col = d.extra ? DOT.flex : DOT[L.def.kind];
        d.c.setAttribute("fill", col);
      }
    }
    requestAnimationFrame(tick);
  }

  function camera(cx, cy, w, dur) {
    let vb;
    if (!w) vb = FULL.slice();
    else {
      const h = w * 0.625;
      const x = Math.min(Math.max(cx - w / 2, 0), 1600 - w);
      const y = Math.min(Math.max(cy - h / 2, 0), 1000 - h);
      vb = [x, y, w, h];
    }
    gsap.to(svg, { attr: { viewBox: vb.join(" ") }, duration: dur == null ? 1.1 : dur, ease: "power2.inOut", overwrite: "auto" });
  }

  /* apply the map state for "k interventions revealed, current = cur (index or -1)" */
  function apply(k, cur) {
    const built = new Set(), thick = new Set();
    INTERVENTIONS.forEach((iv, i) => {
      if (i > k) return;
      (iv.fx.build || []).forEach((b) => built.add(b));
      if (iv.fx.thicken) thick.add(iv.fx.thicken);
    });
    // pins
    pins.forEach((p, i) => {
      const on = i <= k;
      gsap.to(p, { scale: on ? (i === cur ? 1.25 : 0.85) : 0, opacity: on ? (cur === -1 || i === cur ? 1 : 0.7) : 0, duration: 0.45, ease: on ? "back.out(2)" : "power2.in", overwrite: "auto" });
    });
    // built features & lines
    const toggle = (target, on) => gsap.to(target, { opacity: on ? 1 : 0, scale: 1, duration: 0.6, overwrite: "auto" });
    ["node-new", "newzone", "neighbour"].forEach((f) => { toggle(feats[f], built.has(f)); (labelsFor[f] || []).forEach((t) => gsap.to(t, { opacity: built.has(f) ? 1 : 0, duration: 0.6, overwrite: "auto" })); });
    ["line-new-sub", "line-newzone", "line-hvdc", "line-inter"].forEach((id) => {
      const L = lines[id], on = built.has(id);
      if (on && !L.visible) {
        gsap.set([L.g, L.dg], { opacity: 1 });
        gsap.fromTo(L.towers, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.6 });
        [L.outer, L.inner].forEach((p) => {
          gsap.fromTo(p, { strokeDasharray: L.len, strokeDashoffset: L.len }, { strokeDashoffset: 0, duration: 1.2, delay: 0.3, ease: "power2.out" });
        });
        gsap.fromTo(L.dg, { opacity: 0 }, { opacity: 1, delay: 1.2, duration: 0.4 });
      } else if (!on && L.visible) gsap.to([L.g, L.dg], { opacity: 0, duration: 0.3 });
      L.visible = on;
    });
    // thickness
    for (const id in lines) {
      const L = lines[id], on = thick.has(id);
      if (on !== L.thick) {
        gsap.to(L.outer, { attr: { "stroke-width": on ? 18 : 9 }, stroke: on ? C.b1 : C.w, duration: 0.6 });
        gsap.to(L.inner, { attr: { "stroke-width": on ? 5.5 : (L.def.kind === "high" ? 3.2 : 2.4) }, stroke: on ? C.b4 : (L.def.kind === "high" ? C.b4 : C.n3), duration: 0.6 });
        L.thick = on;
      }
    }
    // current effects
    const iv = cur >= 0 ? INTERVENTIONS[cur] : null;
    state = {
      boost: iv && iv.fx.boost ? [iv.fx.boost] : null,
      storage: !!(iv && iv.fx.storage),
      flex: iv && iv.fx.flex ? iv.fx.flex : null,
      island: !!(iv && iv.fx.island)
    };
    // focus & lit
    Object.values(feats).forEach((f) => f.classList.remove("is-lit"));
    Object.values(labelsFor).flat().forEach((t) => t.classList.remove("is-lit"));
    if (iv) {
      svg.classList.add("is-focus");
      (iv.fx.lit || []).concat(iv.fx.build || []).forEach((id) => { if (feats[id]) feats[id].classList.add("is-lit"); (labelsFor[id] || []).forEach((t) => t.classList.add("is-lit")); });
      const [x, y] = iv.at;
      gsap.set(ring, { attr: { cx: x, cy: y - 6 }, stroke: CAT_COL[iv.cat] === C.o1 ? C.o4 : CAT_COL[iv.cat] });
      gsap.fromTo(ring, { opacity: 0.9, scale: 0.6, svgOrigin: `${x} ${y - 6}` }, { opacity: 0, scale: 1.6, duration: 1.4, repeat: -1, ease: "power1.out", overwrite: true });
      camera(x, y, iv.zoom);
    } else {
      svg.classList.remove("is-focus");
      gsap.killTweensOf(ring); gsap.set(ring, { opacity: 0 });
      camera(0, 0, 0);
    }
    const tally = document.querySelector(".tally__n");
    if (tally) tally.textContent = Math.max(0, k + 1);
  }

  function build(svgEl) {
    svg = svgEl;
    root = el("g", null, svg);
    drawBase();
    drawLines();
    drawFeatures();
    drawNodes();
    drawLabels();
    drawPins();
    requestAnimationFrame(tick);
  }

  window.GRIDMAP = { build, apply };
})();
