/* index2.html (the round of edits after the v6 feedback; forked from js/iso-onecity6.js, which index.html keeps using).
   index.html (revision after the version 4 feedback): ONE CITY for Acts 1-3 (scene "onecity6"); forked from js/iso-onecity.js.
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
  const b = (k) => (k >= 2 ? k - 1 : k) - 0.45;   // index.html: B1 and B2 share one card, so every beat after it comes one step sooner
  const GREEN = "#13CE74", ORANGE = "#EE7309";
  const W0 = "grayscale(0) contrast(1) brightness(1)", WASH = "grayscale(1) contrast(0.12) brightness(1.72)", WASH2 = "grayscale(1) contrast(0.14) brightness(1.68)";
  // the "highlight" look (index5): every beat brings out what it is about and mutes the rest of the city
  const MUTE = "grayscale(1) contrast(0.12) brightness(1.82)", MUTEG = "grayscale(1) contrast(0.16) brightness(1.68)";   // near-white mute, about 20% grey (was 0.2/1.68 and 0.28/1.5)
  const DULLF = "saturate(0.5) brightness(1.03)";
  // index2: muting without CSS filters. A CSS filter on hundreds of SVG groups makes the browser redraw each of them
  // off-screen on every frame of a pan or zoom, and the city blinks. Instead each muted piece has its colours rewritten:
  // the same greyscale, contrast and brightness the filter applied, worked out once per colour and blended in by a tween.
  // A piece's colours are read the first time it is muted (after the line pass in js/v7.js) and written back exactly.
  const RECOL = (() => {
    const KIND = { item: [0.12, 1.82], ground: [0.16, 1.68] }, cache = new Map();
    const rgb = (c) => { const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((c || "").trim()); if (!m) return null; let h = m[1]; if (h.length === 3) h = h.replace(/./g, "$&$&");
      const v = parseInt(h, 16); return [v >> 16, (v >> 8) & 255, v & 255]; };
    const muted = (c, kind) => { const key = kind + c; if (cache.has(key)) return cache.get(key); const [k, br] = KIND[kind];
      const l = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2], v = Math.max(0, Math.min(255, ((l / 255 - 0.5) * k + 0.5) * br * 255)); const out = [v, v, v]; cache.set(key, out); return out; };
    const ATTRS = ["fill", "stroke", "stop-color"];
    // a <use> (the traffic on the gy roads) is muted through the drawing it shows; each element keeps its first-seen colours
    // (e.__rc), so pieces that share a drawing never take each other's half-muted colours for the originals
    const capture = (n, kind) => { const list = [], els = [n, ...n.querySelectorAll("*")];
      n.querySelectorAll("use").forEach((u) => { const r = u.ownerSVGElement && u.ownerSVGElement.getElementById((u.getAttribute("href") || "").replace(/^#/, "")); if (r) els.push(r, ...r.querySelectorAll("*")); });
      els.forEach((e) => { if (e !== n && e.closest("defs, clipPath, mask")) return; const rc = e.__rc || (e.__rc = {});
        ATTRS.forEach((a) => { if (!(a in rc)) rc[a] = e.getAttribute(a); const o = rc[a], c = rgb(o); if (c) list.push([e, a, o, c, muted(c, kind)]); }); }); return list; };
    const hex = (r, g, b) => "#" + ((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).slice(1);
    const all = new Set();
    // a handle on one piece: h.m (0 colour, 1 muted) and h.apply()
    const handle = (n, kind) => { if (n.__recol) return n.__recol; const h = { m: 0, list: null, shown: 0, kind,
        apply() { const m = h.m; if (m === h.shown) return; if (!h.list) { if (m === 0) { h.shown = 0; return; } h.list = capture(n, kind); }
          if (m === 0) h.list.forEach(([e, a, o]) => e.setAttribute(a, o));
          else h.list.forEach(([e, a, , c, q]) => e.setAttribute(a, hex(c[0] + (q[0] - c[0]) * m, c[1] + (q[1] - c[1]) * m, c[2] + (q[2] - c[2]) * m)));
          h.shown = m; } };
      n.__recol = h; all.add(h); return h; };
    // hold() before the line pass rewrites the drawing (it swaps some lines for new shapes), resume() after it
    const hold = () => { all.forEach((h) => { if (h.list) { const m = h.m; h.m = 0; h.apply(); h.m = m; h.list.forEach(([e]) => { delete e.__rc; }); h.list = null; h.shown = 0; } }); };
    const resume = () => all.forEach((h) => { const m = h.m; h.shown = 0; h.apply(); });
    return { handle, hold, resume };
  })();

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
  // a gabled building: body, a pitched roof with its ridge along gx and a small overhang, the gable on the +gx end
  const gabled = (g, x, y, w, d, h, hr, col, roof) => { const b0 = bx(g, x, y, 0, w, d, h, col), ry = y + d / 2, zr = h + hr, e = 0.12;
    K.quad(g, [[x - e, y - e, h - 0.05], [x + w + e, y - e, h - 0.05], [x + w + e, ry, zr], [x - e, ry, zr]], shade(roof), { "stroke-width": 0.7 });
    K.quad(g, [[x + w, y, h], [x + w, y + d, h], [x + w, ry, zr]], shade(col), { "stroke-width": 0.7 });
    K.quad(g, [[x - e, y + d + e, h - 0.05], [x + w + e, y + d + e, h - 0.05], [x + w + e, ry, zr], [x - e, ry, zr]], roof, { "stroke-width": 0.7 }); return b0; };
  // trees: a matt, clustered canopy (a few overlapping lobes read as one crown, shaded on the far side), a tapering trunk;
  // four kinds (broadleaf, tall, conifer, small) and a size, shape and green that vary with the spot
  const LEAF = ["#6F9A5C", "#7C9F63", "#5F8D57", "#86A86C", "#6A925F"], PINE = ["#4F7C59", "#577F5A", "#4A7452"];
  const TK = { round: "oak", dark: undefined, pine: "pine" };   // the old kinds: "round" a broadleaf, "pine" a conifer, the rest vary
  const tree6 = (g, x, y, kind) => {
    const rnd = (k) => { const v = Math.sin(x * 12.9898 + y * 78.233 + k * 37.719) * 43758.5453; return v - Math.floor(v); };
    if (!kind) kind = ["oak", "oak", "tall", "small"][Math.floor(rnd(1) * 4)];
    const sz = 0.85 + rnd(2) * 0.35, lean = (rnd(3) - 0.5) * 2.4;
    const b = P(x, y, 0), trunkH = { oak: 0.75, tall: 0.6, small: 0.45, pine: 0.3 }[kind] * sz, t = P(x, y, trunkH);
    el("path", { d: `M${(b[0] - 1.9 * sz).toFixed(1)} ${b[1].toFixed(1)} L${(t[0] - 1.0 * sz + lean * 0.3).toFixed(1)} ${t[1].toFixed(1)} L${(t[0] + 1.0 * sz + lean * 0.3).toFixed(1)} ${t[1].toFixed(1)} L${(b[0] + 1.9 * sz).toFixed(1)} ${b[1].toFixed(1)} Z`, fill: "#6E5646" }, g);
    const crown = (lobes, col) => { const dark = ISO.mixHex(col, "#000000", 0.2), lite = ISO.mixHex(col, "#FFFFFF", 0.1);
      const C = (cx, cy, rx, ry) => `M${(cx - rx).toFixed(1)} ${cy.toFixed(1)}a${rx.toFixed(1)} ${ry.toFixed(1)} 0 1 0 ${(2 * rx).toFixed(1)} 0a${rx.toFixed(1)} ${ry.toFixed(1)} 0 1 0 ${(-2 * rx).toFixed(1)} 0Z`;
      const all = lobes.map(([cx, cy, rx, ry]) => C(cx, cy, rx, ry)).join("");
      el("path", { d: all, fill: col, stroke: "#000", "stroke-width": 1, "data-keepstroke": "", "data-crown": "", "vector-effect": "non-scaling-stroke" }, g);   // the outline of the whole crown (its inner half is covered next)
      el("path", { d: all, fill: col, "data-nostroke": "", stroke: "none" }, g);   // covers the lobes' inner edges
      lobes.forEach(([cx, cy, rx, ry], i) => { if (i % 2) el("path", { d: C(cx + rx * 0.22, cy + ry * 0.25, rx * 0.62, ry * 0.58), fill: dark, "data-nostroke": "", stroke: "none", opacity: 0.55 }, g); });
      const top = lobes.reduce((a, l) => (l[1] - l[3] < a[1] - a[3] ? l : a)); el("path", { d: C(top[0] - top[2] * 0.25, top[1] - top[3] * 0.25, top[2] * 0.45, top[3] * 0.4), fill: lite, "data-nostroke": "", stroke: "none", opacity: 0.6 }, g); };
    const col = (kind === "pine" ? PINE : LEAF)[Math.floor(rnd(4) * (kind === "pine" ? PINE.length : LEAF.length))];
    if (kind === "pine") {   // a conifer: three soft tiers narrowing to a point
      const c = P(x, y, trunkH), H = 46 * sz, W = 11 * sz;
      const tier = (y0, w, h) => `M${c[0] + lean * 0.4} ${(y0 - h).toFixed(1)} Q${(c[0] + w * 0.55).toFixed(1)} ${(y0 - h * 0.45).toFixed(1)} ${(c[0] + w).toFixed(1)} ${y0.toFixed(1)} Q${c[0]} ${(y0 + 3).toFixed(1)} ${(c[0] - w).toFixed(1)} ${y0.toFixed(1)} Q${(c[0] - w * 0.55).toFixed(1)} ${(y0 - h * 0.45).toFixed(1)} ${c[0] + lean * 0.4} ${(y0 - h).toFixed(1)}Z`;
      [[c[1] + 2, W, H * 0.5], [c[1] - H * 0.25, W * 0.78, H * 0.45], [c[1] - H * 0.5, W * 0.55, H * 0.42]].forEach(([y0, w, h]) => { el("path", { d: tier(y0, w, h), fill: col }, g);
        el("path", { d: `M${c[0] + lean * 0.4} ${(y0 - h).toFixed(1)} Q${(c[0] + w * 0.55).toFixed(1)} ${(y0 - h * 0.45).toFixed(1)} ${(c[0] + w).toFixed(1)} ${y0.toFixed(1)} Q${(c[0] + w * 0.4).toFixed(1)} ${(y0 + 2).toFixed(1)} ${c[0] + 1} ${(y0 + 1.5).toFixed(1)}Z`, fill: ISO.mixHex(col, "#000000", 0.2), "data-nostroke": "", stroke: "none", opacity: 0.6 }, g); });
      return; }
    const c = P(x, y, trunkH), r = { oak: 11.5, tall: 8.2, small: 8 }[kind] * sz, j = (k) => (rnd(10 + k) - 0.5) * r * 0.3;
    const L = kind === "tall"
      ? [[c[0] + j(1), c[1] - r * 0.7, r * 0.95, r * 1.0], [c[0] + j(2) + lean, c[1] - r * 1.7, r * 0.85, r * 0.95], [c[0] + j(3) + lean, c[1] - r * 2.55, r * 0.62, r * 0.75], [c[0] - r * 0.5, c[1] - r * 1.2, r * 0.6, r * 0.65]]
      : kind === "small"
      ? [[c[0] - r * 0.45 + j(1), c[1] - r * 0.55, r * 0.75, r * 0.65], [c[0] + r * 0.5 + j(2), c[1] - r * 0.5, r * 0.72, r * 0.62], [c[0] + j(3), c[1] - r * 1.1, r * 0.8, r * 0.7]]
      : [[c[0] - r * 0.62 + j(1), c[1] - r * 0.6, r * 0.7, r * 0.62], [c[0] + r * 0.6 + j(2), c[1] - r * 0.55, r * 0.72, r * 0.64], [c[0] + j(3) + lean, c[1] - r * 1.25, r * 0.82, r * 0.72],
         [c[0] - r * 0.35 + j(4), c[1] - r * 1.65, r * 0.6, r * 0.55], [c[0] + r * 0.45 + j(5) + lean, c[1] - r * 1.55, r * 0.58, r * 0.52], [c[0] + j(6), c[1] - r * 0.3, r * 0.75, r * 0.5]];
    crown(L, col);
  };
  const rise = (tl, gs, t, o) => { o = o || {}; (gs || []).forEach((g, i) => { gsap.set(g, { opacity: 0, y: -16 });
    tl.to(g, { opacity: 1, y: 0, duration: o.dur || 0.3, ease: "power2.out" }, t + i * (o.stagger == null ? 0.02 : o.stagger)); }); };
  const sink = (tl, gs, t, o) => { o = o || {}; (gs || []).forEach((g, i) => tl.to(g, { opacity: 0, y: -10, duration: o.dur || 0.22, ease: "power1.in" }, t + i * (o.stagger == null ? 0.01 : o.stagger))); };

  function onecity(svg) {
    const HL = true;   // index.html always uses the highlight look
    const tl = gsap.timeline({ paused: true });
    live(svg);
    const skies = [["oc-sky1", [["0", "#FBF4E2"], ["0.7", "#EFE6CF"], ["1", "#E2DAC4"]]], ["oc-sky2", [["0", "#F2F8FD"], ["0.7", "#DCEBF7"], ["1", "#CFE2F2"]]]]
      .map(([id, st], i) => { const r = sky(svg, id, st); if (i) r.setAttribute("opacity", 0);
        // a sky that reaches every edge of a tall (phone) or wide screen: the gradient keeps its place, its end colours run on
        const lg = svg.querySelector("#" + id); if (lg) { lg.setAttribute("gradientUnits", "userSpaceOnUse"); lg.setAttribute("y1", -400); lg.setAttribute("y2", 1300); lg.setAttribute("x2", 0); }
        r.setAttribute("x", -4000); r.setAttribute("y", -4000); r.setAttribute("width", 10000); r.setAttribute("height", 10000); return r; });
    const N = 46.5, S = stage(svg, { N, M: N, s: 0.4, tx: 680, ty: 90, ground: "#DCE4D3" }), G = S.ground;
    const RD = [[10.5, 12], [22.5, 24], [34.5, 36]];
    const DULL = new Set(["old", "oldshops", "city", "terr", "ind", "station", "homes", "shops", "flats", "towers", "cc", "village", "farm", "depot", "ind2"]);
    const dullHex = (h) => { const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((h || "").trim()); if (!m) return null; let v = m[1]; if (v.length === 3) v = v.split("").map((c) => c + c).join("");
      const r = parseInt(v.slice(0, 2), 16), g2 = parseInt(v.slice(2, 4), 16), b2 = parseInt(v.slice(4, 6), 16), sa = 0.5, br = 1.03;
      const R = ((0.213 + 0.787 * sa) * r + (0.715 - 0.715 * sa) * g2 + (0.072 - 0.072 * sa) * b2) * br, Gc = ((0.213 - 0.213 * sa) * r + (0.715 + 0.285 * sa) * g2 + (0.072 - 0.072 * sa) * b2) * br, B = ((0.213 - 0.213 * sa) * r + (0.715 - 0.715 * sa) * g2 + (0.072 + 0.928 * sa) * b2) * br;
      return "#" + [R, Gc, B].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join(""); };
    const dullBake = (w) => [w, ...w.querySelectorAll("*")].forEach((n) => ["fill", "stroke", "stop-color"].forEach((a) => { const c = dullHex(n.getAttribute(a)); if (c) n.setAttribute(a, c); }));
    const add = (x, y, set, fn) => S.add(x, y, (g) => { const w = el("g", null, g); fn(w); if (DULL.has(set)) dullBake(w); }, set);

    // ================= the ground =================
    const farm = el("g", { "data-role": "tile" }, G);
    const fl = (x0, y0, x1, y1, c, ln) => field(farm, x0, y0, x1, y1, c, ln);
    // one ground cover per tile, the full block inside the pavements (B(i, j) = [x0, y0, x1, y1])
    const B = (i, j) => [i * 12 + 0.25, j * 12 + 0.25, i * 12 + 10.25, j * 12 + 10.25];
    const fb = (i, j, c, ln) => { const [a, b2, c2, d] = B(i, j); fl(a, b2, c2, d, c, ln); };
    fb(0, 0, "#DCE4D3"); fb(1, 0, "#DCE4D3"); fb(2, 0, "#DCE4D3"); fb(3, 0, "#DCE4D3");
    fb(2, 1, "#DCE4D3"); fb(0, 2, "#DCE4D3"); fb(2, 2, "#DCE4D3"); fb(3, 2, "#DCE4D3");
    fb(0, 3, "#DCE4D3"); fb(2, 3, "#DCE4D3"); fb(3, 3, "#DCE4D3");
    // tile 8: the sea along the right-hand edge, with a sandy shore (a quay comes with the port)
    K.rect(G, 40.9, 12.25, N, 22.25, "#8FC6E4", 1);
    for (let y = 13.2; y < 21.6; y += 2.2) { const x = 43.0 + (y % 1.9), a = P(x, y), c = P(x, y + 0.8); el("path", { d: `M${a[0]} ${a[1]} L${c[0]} ${c[1]}`, stroke: "#B9DDF0", "stroke-width": 1.2 }, G); }
    // the old land on the blocks the town has not reached yet: crop fields (stripes) and pasture (hedged paddocks). Some stay
    // (the wind farm's and the renewables zone's blocks are still farmland), the rest give way as each block is developed
    const crop = (i, j) => { const [a, b2, c2, d] = B(i, j), g = el("g", null, G); K.rect(g, a, b2, c2, d, "#E7E0B8", 0.8);
      for (let y = b2 + 0.5; y < d; y += 0.55) K.lineGX(g, y, a + 0.2, c2 - 0.2, 0, "#D8CE9C", 1); return g; };
    const pasture = (i, j) => { const [a, b2, c2, d] = B(i, j), g = el("g", null, G); K.rect(g, a, b2, c2, d, "#D2E3C0", 0.8);
      return g; };   // plain pasture (the hedge cross was too busy)
    const land = { p1: pasture(0, 0), c2: crop(1, 0), c4: crop(3, 0), p7: pasture(2, 1), c11: crop(2, 2), c13: crop(0, 3) };
    // the common in block (1,2): grass and a pond, through every age
    [K.rect(G, 12.25, 24.25, 22.25, 34.25, "#DCE4D3", 0.8), K.rect(G, 18.4, 30.2, 21.6, 33.4, C.water, 1)].forEach((n) => n && n.setAttribute("data-role", "tile"));
    // dirt lanes on the old town's grid (the canal and the railway take two of them)
    const lanes = el("g", null, G), laneR1 = el("g", null, G), laneR2 = el("g", null, G);
    RD.forEach(([a, c], k) => K.rect(k === 1 ? laneR1 : k === 2 ? laneR2 : lanes, 0, a + 0.35, N, c - 0.35, "#E3D6B0", 0.8));
    RD.forEach(([a, c]) => K.rect(lanes, a + 0.35, 0, c - 0.35, N, "#E3D6B0", 0.8));
    // paved plots that come with the town
    const pad = (x0, y0, x1, y1, col) => { const g = el("g", { opacity: 0, "data-role": "tile" }, G); K.rect(g, x0, y0, x1, y1, col || "#E3DDD0", 0.8); return g; };
    const pb = (i, j, c) => { const [a, b2, c2, d] = B(i, j); return pad(a, b2, c2, d, c); };
    const padPS = pb(2, 0, "#DCE4D3"), padSub = pb(2, 1, "#DCE4D3"), padTerr = pb(2, 2, "#DCE4D3"),
      padInd = pb(3, 2, "#DCE4D3"), padDown = pb(3, 0, "#DCE4D3"), padShops = pb(1, 1, "#DCE4D3"), padFlats = pb(0, 2, "#DCE4D3"),
      padDC = pb(3, 3, "#DCE4D3"), padDepot = pad(36.25, 12.25, 40.9, 22.25, "#DCE4D3");
    // the canal along road 2 (Act 1), paved over by the highway
    const canal = el("g", { opacity: 0 }, G); { const a = RD[2][0] - 0.1, c = RD[2][1] + 0.1; K.rect(canal, 0, a, N, c, "#C9BFA6", 0); K.rect(canal, 0, a + 0.2, N, c - 0.2, "#8FC6E4", 0);
      K.lineGX(canal, a + 0.2, 0, N, 0, "#6E8FA8", 1); K.lineGX(canal, c - 0.2, 0, N, 0, "#6E8FA8", 1); }
    // the railway along road 1
    const RY = RD[1][0], bed = el("g", { opacity: 0 }, G); K.rect(bed, 0, RY + 0.05, N, RY + 1.45, "#CFC8BE", 1);
    const sleepers = []; { const g = el("g", null, G); for (let x = 0.2; x < N; x += 0.5) { const a = P(x, RY + 0.3), c = P(x, RY + 1.2); sleepers.push(el("path", { d: `M${a[0]} ${a[1]} L${c[0]} ${c[1]}`, stroke: "#8F7A6E", "stroke-width": 1.4, opacity: 0 }, g)); } }
    const rails = [RY + 0.45, RY + 1.05].map((y) => K.lineGX(G, y, 0, N, 0, "#3E4860", 1.4));
    // the roads, paved with the highways: gx roads 0 and 2, all three gy roads (level crossings over the railway)
    const roads = el("g", { opacity: 0, "data-role": "roads" }, G);
    { const PV = 0.25;   // a narrow pavement
      [0, 2].forEach((k) => { const [a, c] = RD[k]; K.rect(roads, 0, a - PV, N, c + PV, "#E9EBEE", 0); });
      RD.forEach(([a, c]) => K.rect(roads, a - PV, 0, c + PV, N, "#E9EBEE", 0));
      [0, 2].forEach((k) => { const [a, c] = RD[k]; K.rect(roads, 0, a, N, c, "#B4BAC4", 0); });
      RD.forEach(([a, c]) => K.rect(roads, a, 0, c, N, "#B4BAC4", 0));
      // edges: along each road between the junctions only, so the roads meet as one surface
      const runs = (cuts) => { const out = []; let lo = 0; cuts.forEach(([p, q]) => { out.push([lo, p]); lo = q; }); out.push([lo, N]); return out; };
      const gxCuts = RD, gyCuts = [RD[0], RD[2]];
      [0, 2].forEach((k) => { const [a, c] = RD[k]; runs(gxCuts).forEach(([x0, x1]) => [a, c].forEach((y) => K.lineGX(roads, y, x0, x1, 0, "#9AA1AD", 0.9))); });
      RD.forEach(([a, c]) => runs(gyCuts).forEach(([y0, y1]) => [a, c].forEach((x) => K.seg(roads, [x, y0, 0], [x, y1, 0], "#9AA1AD", 0.9)))); }
    { let d = ""; [0, 2].forEach((k) => { const m = (RD[k][0] + RD[k][1]) / 2; for (let x = 0.5; x < N; x += 1.4) { if (RD.some(([p, q]) => x > p - 1 && x < q + 0.3)) continue; const a = P(x, m), c = P(x + 0.7, m); d += `M${a[0]} ${a[1]} L${c[0]} ${c[1]} `; } });
      RD.forEach(([a0, c0]) => { const m = (a0 + c0) / 2; for (let y = 0.5; y < N; y += 1.4) { if (RD.some(([p, q], k) => k !== 1 && y > p - 1 && y < q + 0.3) || (y > RY - 0.6 && y < RY + 1.8)) continue; const a = P(m, y), c = P(m, y + 0.7); d += `M${a[0]} ${a[1]} L${c[0]} ${c[1]} `; } });
      el("path", { d, stroke: "#FFFFFF", "stroke-width": 1.5, fill: "none" }, roads); }
    { const g = el("g", null, roads); [RY + 0.45, RY + 1.05].forEach((y) => RD.forEach(([a, c]) => K.lineGX(g, y, a, c, 0.02, "#3E4860", 1.4))); }   // rails across the crossings

    // ================= the old town (there from the start) =================
    // (0,1) cottages, (3,1) an old high street, (1,3) a village with a church, (2,3) a farm, a windmill on (1,0)
    [[1.0, 13.4, "#8F7A6E"], [5.8, 13.4, "#B77464"], [1.0, 18.2, "#C9A15A"], [5.8, 18.2, "#9C6457"]].forEach(([x, y, r]) => add(x + 1, y + 0.7, "old", (g) => cottage(g, x, y, r)));
    [[12.8, "#B7795E"], [15.1, "#A9876A"], [17.4, "#C9A988"], [19.7, "#B7795E"]].forEach(([x, c], i) => add(x + 1.1, 14.2, "oldshops", (g) => { const s = gabled(g, x, 13.2, 2.2, 2.0, 1.7 + (i % 2) * 0.25, 0.75, c, ["#6E6A72", "#7E6A62"][i % 2]);
      F.face(g, F.L, s, 0.2, 0.12, 2.0, 0.8, "#F3E2C6", { "stroke-width": 0.5 }); F.face(g, F.L, s, 0.4, 1.05, 0.9, 1.45, "#FFE6A3", { "stroke-width": 0.5 }); F.face(g, F.L, s, 1.3, 1.05, 1.8, 1.45, "#FFE6A3", { "stroke-width": 0.5 }); }));
    [[13.0, 37.8, "#B77464"], [16.4, 37.6, "#8F7A6E"]].forEach(([x, y, r]) => add(x + 1, y + 0.7, "village", (g) => cottage(g, x, y, r)));
    // index2: no church (too Euro-centric). With the highways (freight), a logistics depot takes the village's place: a hall
    // with rooftop units and heat pumps, electric trucks at their chargers (the earlier town's drawing), and a wind turbine
    add(16.4, 41.3, "logi", (g) => ISO.draw("factory", g, [16.4, 41.3], 1.15));
    { const TX = 20.8, TY = 40.5;   // index2: the depot's turbine, close by the building and clear of the line along its front
      add(TX, TY, "wind", (g) => { F.box(g, TX - 0.6, TY - 0.6, 0, 1.2, 1.2, 0.12, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" }); ISO.turbine(g, F, TX, TY, 5.2); }); }
    add(27.4, 38.0, "farm", (g) => { const bn = bx(g, 25.8, 37.0, 0, 3.2, 1.8, 1.4, "#B5302E", "#6D5A56"); F.face(g, F.L, bn, 1.1, 0, 2.1, 1.0, "#F1F2F4", { "stroke-width": 0.6 }); });
    add(31.2, 37.8, "farm", (g) => cottage(g, 30.2, 37.2, "#8F7A6E"));
    add(17.0, 5.0, "mill", (g) => K.mill(g, 17.0, 5.0));
    // trees where people live and gather: garden trees between the homes, street trees on the high street, trees round the
    // flats, the park, screening by the substation, the village green and the farmyard (never on a road, a line or a building)
    [[4.2, 14.4, "round"], [9.2, 13.2], [4.2, 19.0], [9.0, 19.6, "round"],              // homes
      [13.0, 29.0, "round"], [16.2, 28.6], [13.2, 31.8, "dark"], [21.4, 26.4, "round"],   // park
      [25.4, 14.0, "round"], [27.6, 13.2],                                                // substation screen
      [20.9, 37.6, "round"],                                       // by the depot
      [33.8, 37.4, "dark"], [32.2, 41.4, "round"]]                                        // farm
      .forEach(([x, y, k]) => add(x, y, "trees", (g) => tree6(g, x, y, TK[k]) ));
    // trees that come with the new high street and the flats (B4)
    [[12.9, 16.0, "round"], [21.4, 20.6, "round"], [4.4, 28.4], [9.3, 26.0, "round"], [4.4, 32.8, "dark"]].forEach(([x, y, k]) => add(x, y, "trees2", (g) => tree6(g, x, y, TK[k])));

    // woods on blocks 3, 12 and 16, an orchard on block 9: they are cleared as the town grows
    const wood = (i, j, set, n, seed) => { const [a, b2] = B(i, j); let k = 0;
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) { const u = Math.sin((r * 7 + c * 13 + seed) * 12.9898) * 43758.5453, v = u - Math.floor(u), w = Math.sin((r * 11 + c * 5 + seed) * 78.233) * 43758.5453, z = w - Math.floor(w);
        if (v < 0.18) continue; const x = a + 1.1 + (c + 0.5) * (8.0 / n) + (v - 0.5) * 1.3, y = b2 + 1.1 + (r + 0.5) * (8.0 / n) + (z - 0.5) * 1.3, kind = z < 0.45 ? "pine" : z < 0.8 ? "oak" : "tall";
        add(x, y, set, (g) => tree6(g, x, y, kind)); k++; } };
    wood(2, 0, "wood3", 4, 1); wood(3, 2, "wood12", 4, 2); wood(3, 3, "wood16", 4, 3);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const x = 1.6 + c * 2.4, y = 25.8 + r * 2.9; add(x, y, "orch9", (g) => tree6(g, x, y, "small")); }

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
    const TELX = 10.2, TELY = [13.2, 19.4, 25.6, 31.8];
    TELY.forEach((y) => S.add(TELX + 0.01, y + 0.01, (g) => { const h = 2.8; K.quad(g, [[TELX - 0.06, y, 0], [TELX + 0.06, y, 0], [TELX + 0.06, y, h], [TELX - 0.06, y, h]], "#8F6B4E", { "stroke-width": 0.8 });
      [h - 0.12, h - 0.5].forEach((z) => K.seg(g, [TELX - 0.42, y, z], [TELX + 0.42, y, z], "#6D5A4A", 2.0)); }, "tel"));
    for (let i = 1; i < TELY.length; i++) { const y0 = TELY[i - 1], y1 = TELY[i];
      S.add(TELX + 0.02, y1 + 0.02, (g) => [[-0.34, 2.68], [0.34, 2.68], [-0.34, 2.3], [0.34, 2.3]].forEach(([o, z]) => { const a = P(TELX + o, y0, z), c = P(TELX + o, y1, z);
        el("path", { d: `M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${((a[0] + c[0]) / 2).toFixed(1)} ${((a[1] + c[1]) / 2 + 6).toFixed(1)} ${c[0].toFixed(1)} ${c[1].toFixed(1)}`, stroke: "#262C3A", "stroke-width": 1.0, fill: "none" }, g); }), "tel"); }

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
      .oc-pk path { fill: none; stroke-linecap: round; stroke-dasharray: 0.1 191.9; animation: oc-flow 2.6s linear infinite; }
      .oc-pk.rev path { animation-direction: reverse; }
      .oc-pk .core { stroke-width: 7.5; transition: stroke-width .3s ease; }
      svg[data-flow="big"] .oc-pk .core { stroke-width: 7.5; }
      .oc-pk .halo { display: none; }
      .oc-pk.dense path { stroke-dasharray: 0.1 47.9; }
      .oc-pk.alt path { animation-delay: -1.3s; }
      .oc-pk.alt.dense path { animation-delay: -0.325s; }
      [data-still="1"], [data-still="1"] * { animation-play-state: paused !important; }
      .oc-fan { transform-box: fill-box; transform-origin: center; animation: oc-spin 0.9s linear infinite; }
      @keyframes oc-spin { to { transform: rotate(360deg); } }
      @keyframes oc-flow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -192; } }
` }, svg);
    const pulse = (g, d, col, rev, alt) => { const p = el("g", { class: "oc-pk" + (rev ? " rev" : "") + (alt ? " alt" : ""), opacity: 0, "data-keepstroke": "", "data-noink": "" }, g);
      el("path", { d, class: "halo", stroke: col }, p); el("path", { d, class: "core", stroke: col }, p); pulseAll.push(p); return p; };
    // a span from support A to support B, for line id; transmission spans carry four conductors, distribution three
    // the ground point of the drawing that carries a support (for the spread-out export: a wire's ends move with them)
    const OWN = { "9.6,8.9": [8.4, 8.4], "20.6,8.9": [21.0, 8.4], "30.6,9.6": [30.62, 9.62], "30.6,13.8": [31.0, 17.0], "9.4,45.1": [8.6, 45.0], "37.2,45.1": [38.6, 45.2], "9.4,43.3": [8.6, 45.0], "37.2,43.3": [38.6, 45.2],
      "33.3,8.45": [33.2, 8.4], "30.1,17.65": [31.0, 17.0], "31.7,17.65": [31.0, 17.0] };
    const owner = (s) => (OWN[`${s.x},${s.y}`] || [s.x, s.y]).join(",");
    function span(id, set, A, B, o) {
      o = o || {}; const L = lineOf(id), tr = A.k !== "pole" && B.k !== "pole", sag = tr ? 10 : 7;
      const front = (A.x + A.y > B.x + B.y) ? A : B;
      S.add(front.x + 0.02, front.y + 0.02, (g) => { L.groups.push(g);
        const conds = tr ? [[-1, 0], [1, 0]] : [[-0.3, 0], [0.3, 0]];   // distribution: two wires
        conds.forEach(([oo, lvl]) => { const a = att(A, oo, lvl), c = att(B, oo, lvl); L.cond.push(el("path", { d: sagPath(a, c, sag), stroke: "#262C3A", "stroke-width": tr ? 1.1 : 1.0, fill: "none", "data-wire": "", "data-oa": owner(A), "data-ob": owner(B) }, g)); });
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
    S.add(30.62, 14.6, (g) => { g.dataset.own = "31,17"; [[29.6, 15.2, -0.85], [31.2, 15.2, 0.85]].forEach(([x, y, o]) => K.seg(g, [30.6 + o, 13.8, 2.1], [x + 0.5, y + 0.45, 1.1], "#3E4860", 0.8)); }, "sub");
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
    chain("d2", "dist", [pole(22.25, 17.0, "y"), pole(22.25, 21.2, "y"), pole(22.25, 26.0, "y"), pole(22.25, 30.0, "y"), pole(22.25, 34.0, "y")], "y");   // D2 runs from the high street to the park's corner (where D3 branches), no further
    chain("d3w", "dist3", [pole(22.25, 34.0, "x"), pole(17.0, 34.1, "x"), pole(13.0, 34.1, "x"), pole(9.9, 34.1, "x"), pole(5.2, 34.1, "x"), pole(0.6, 34.1, "x")], "x");
    chain("d3e", "dist3", [pole(22.25, 34.0, "x"), pole(26.0, 34.1, "x"), pole(30.0, 34.1, "x"), pole(33.2, 34.1, "x"), pole(37.6, 34.1, "x"), pole(42.0, 34.1, "x"), pole(46.2, 34.1, "x")], "x");

    // ================= highways (k=5): new homes and shops, cars, the fuel depot (imports) =================
    const HOMES = [[0.8, 13.6, "#B07466", "#E0785A"], [5.6, 13.6, "#A3695D", "#4AB4D6"], [0.8, 18.2, "#B9806F", "#FFCD00"], [5.6, 18.2, "#9C6457", "#A6D84A"]];
    HOMES.forEach(([x, y, roof, car]) => { add(x + 1, y + 1, "homes", (g) => ISO.house(g, F, x, y, 2.2, 1.6, 1.1, 0.8, roof)); add(x + 0.9, y + 2.3, "homecars", (g) => K.oldCar(g, x + 0.2, y + 2.0, car)); });
    [[12.6, 13.2, 2.0, 2.2, 2.6, "#E3DDD3", "#47B970"], [14.7, 13.2, 1.8, 2.2, 3.2, "#EDE6DA", "#E0785A"], [16.6, 13.2, 2.0, 2.2, 2.4, "#DCE3EA", "#4AB4D6"], [18.7, 13.2, 1.8, 2.2, 3.0, "#E8E0D2", "#FFCD00"], [20.6, 13.2, 1.6, 2.2, 2.6, "#E3DDD3", "#E0785A"]]
      .forEach(([x, y, w, d, h, c, aw], i) => add(x + w / 2, y + d / 2, "shops", (g) => K.shop(g, x, y, w, d, h, c, aw, { win: C.water, sign: ["#2F6F4E", "#B5302E", "#204C8A", "#8F6B4E", "#3E4860"][i] })));
    // the LNG import terminal (highways), tile 8: storage tanks on the quay, a jetty to the berth, a gas pipe to the power
    // plant (up the pavement of gy road 2 and across it), a carrier at the berth
    [[38.6, 13.4], [38.6, 16.0], [38.6, 18.6]].forEach(([x, y]) => add(x, y + 0.6, "depot", (g) => F.cyl(g, [x, y + 0.6, 0], "z", 0.95, 1.5, { side: "#E9EBEE", cap: "#C9CED6" })));
    add(41.4, 17.0, "depot", (g) => { [14.0, 16.6, 19.2].forEach((y) => K.seg(g, [39.5, y, 0.15], [42.0, y, 0.15], "#626E88", 2)); K.seg(g, [42.0, 13.6, 0.15], [42.0, 19.8, 0.15], "#626E88", 2.2); });
    add(37.4, 21.2, "depot", (g) => bx(g, 36.8, 20.5, 0, 1.2, 0.9, 0.8, "#F1F2F4", "#626E88"));
    add(43.2, 20.4, "ship", (g) => {   // an LNG carrier along gy: dark hull, red waterline, four spherical tanks under domes, the bridge at the stern
      const x0 = 42.6, y0 = 13.0, h = bx(g, x0, y0, -0.1, 1.1, 6.2, 0.62, "#2F3A4E", "#C9CED6"); F.face(g, F.R, h, 0, 0, 6.2, 0.14, "#B5302E", { "stroke-width": 0.5 });
      K.quad(g, [[x0, y0 + 6.2, 0.52], [x0 + 0.55, y0 + 6.8, 0.52], [x0 + 1.1, y0 + 6.2, 0.52]], "#C9CED6", { "stroke-width": 0.7 }); K.quad(g, [[x0 + 1.1, y0 + 6.2, -0.1], [x0 + 0.55, y0 + 6.8, -0.1], [x0 + 0.55, y0 + 6.8, 0.52], [x0 + 1.1, y0 + 6.2, 0.52]], "#262C3A", { "stroke-width": 0.7 });
      bx(g, x0 + 0.1, y0 + 0.1, 0.52, 0.9, 1.0, 1.0, "#F1F2F4", "#FFFFFF"); bx(g, x0 + 0.35, y0 + 0.3, 1.52, 0.3, 0.3, 0.4, "#B5302E", "#3E4860");
      [y0 + 1.75, y0 + 2.95, y0 + 4.15, y0 + 5.35].forEach((y) => { const c = P(x0 + 0.55, y, 0.5), r = 15;
        el("path", { d: `M${c[0] - r} ${c[1]} A${r} ${r * 1.02} 0 0 1 ${c[0] + r} ${c[1]} Z`, fill: "#F3F4F6", stroke: "#000", "stroke-width": 0.8 }, g);
        el("path", { d: `M${c[0] - r} ${c[1]} Q${c[0]} ${c[1] + 5} ${c[0] + r} ${c[1]}`, fill: "#D8DBE6", stroke: "#000", "stroke-width": 0.6 }, g); }); });
    [[44.8, 13.4, "#4AB4D6"], [44.6, 20.4, "#E0785A"]].forEach(([x, y, c]) => add(x + 0.5, y + 0.2, "boats", (g) => VK.boatSmall(g, x, y, c)));

    // ================= internet (k=6): fibre in the ground, downtown towers, flats, masts =================
    const fibre = el("g", { opacity: 0, "data-role": "fibre" }, G);
    { const FC = "#2E6FB3", runs = [[[0, RD[0][1] + 0.12], [N, RD[0][1] + 0.12]], [[RD[2][1] + 0.12, 0], [RD[2][1] + 0.12, N]], [[RD[1][0] - 0.12, 0], [RD[1][0] - 0.12, 36.0]], [[RD[0][0] - 0.12, 12.0], [RD[0][0] - 0.12, 36.0]]];
      runs.forEach(([[x0, y0], [x1, y1]]) => { const a = P(x0, y0), c = P(x1, y1); el("path", { d: `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${c[0].toFixed(1)} ${c[1].toFixed(1)}`, stroke: FC, "stroke-width": 2.6, fill: "none", "stroke-linecap": "round", "data-nostroke": "" }, fibre);
        const L = Math.hypot(x1 - x0, y1 - y0); for (let u = 3; u < L; u += 6) { const x = x0 + (x1 - x0) * u / L, y = y0 + (y1 - y0) * u / L; K.rect(fibre, x - 0.28, y - 0.28, x + 0.28, y + 0.28, "#F1F2F4", 0.8); K.rect(fibre, x - 0.14, y - 0.14, x + 0.14, y + 0.14, FC, 0); } }); }
    [[36.8, 0.6, 2.4, 2.4, 8.8, "#DCE3EA", "plant"], [40.0, 0.6, 2.4, 2.4, 10.4, "#C9D2DC", "none"], [43.4, 0.8, 2.2, 2.0, 7.0, "#EDE6DA", "garden"]].forEach(([x, y, w, d, h, c, r]) => add(x + w / 2, y + d / 2, "towers", (g) => K.tower(g, x, y, w, d, h, c, C.water, r)));
    [[1.0, 25.4, 2.6, 2.4, 3.6, "#E3DDD3", "none"], [5.2, 25.6, 2.4, 2.4, 3.2, "#F1F2F4", "garden"], [1.4, 29.4, 2.4, 2.2, 3.0, "#DCE3EA", "garden"], [7.4, 29.2, 2.4, 2.2, 3.4, "#EDE6DA", "none"]]
      .forEach(([x, y, w, d, h, c, r]) => add(x + w / 2, y + d / 2, "flats", (g) => K.tower(g, x, y, w, d, h, c, C.water, r, { noShop: true })));
    add(26.8, 20.8, "cc", (g) => K.office(g, 24.9, 19.6, 3.8, 2.4, 2.2, 2, "#C9D6E3"));
    [[0.8, 21.6, 3.2], [44.2, 29.6, 3.4]].forEach(([x, y, h]) => add(x, y, "masts", (g) => VK.mast(g, x, y, h)));

    // ================= new ways of living (k=7): the park, cafés, people =================
    add(15.2, 30.0, "life", (g) => K.fountain(g, 15.2, 30.0, 0.8));
    [[13.4, 18.6, "#E0785A"], [17.2, 18.6, "#47B970"], [20.8, 18.6, "#FFCD00"]].forEach(([x, y, c]) => add(x, y, "life", (g) => K.table(g, x, y, c)));
    [[13.9, 18.9, { top: "#4AB4D6" }], [17.7, 19.0, { dress: true, top: "#E0785A" }], [21.2, 18.9, { top: "#8C6F9E", phone: true }], [15.4, 15.9, {}], [19.0, 16.0, { dress: true, top: "#47B970" }],
      [16.6, 30.8, { top: "#E0785A" }], [16.9, 31.0, { dress: true, top: "#47B970" }], [14.0, 28.8, { kid: true, top: "#FFCD00" }], [13.6, 21.9, { top: "#3E4860" }], [15.4, 22.0, { dress: true, top: "#E0785A", phone: true }],
      [2.6, 16.2, { top: "#4AB4D6" }], [27.0, 27.5, { kid: true, top: "#47B970" }], [30.2, 30.6, { dress: true, top: "#8C6F9E" }], [40.2, 21.2, { top: "#E0785A", hat: true }], [15.0, 40.6, { top: "#B5302E", hat: true }], [33.4, 40.2, { top: "#3E4860", hat: true }]]
      .forEach(() => {});   // index.html: no people for now (positions kept for later)

    // ================= the choice (B6): a meeting on the common =================
    { const MX = 16.6, MY = 32.7, ring = [["#3E4860"], ["#E0785A", 1], ["#47B970"], ["#8C6F9E", 1], ["#4AB4D6"], ["#B5302E", 1], ["#FFCD00"], ["#3E4860", 1]];
      add(MX, MY, "meet", (g) => { F.cyl(g, [MX, MY, 0], "z", 0.5, 0.3, { side: "#B79A7A", cap: "#E3D6C0" }); });
      ring.forEach(([c, dress], i) => { const a = (i / ring.length) * Math.PI * 2, x = MX + Math.cos(a) * 0.95, y = MY + Math.sin(a) * 0.95;
        void x; void y; void c; void dress; });
      add(MX + 2.0, MY + 2.0, "meet", (g) => [[MX - 0.6, MY + 0.2, 1.35, 1], [MX + 0.5, MY - 0.6, 1.45, -1]].forEach(([x, y, z, d]) => { const q = P(x, y, z), w = 26, h = 16;
        el("path", { d: `M${q[0] + 4 * d} ${q[1] - 1} L${q[0] + 1 * d} ${q[1] + 6} L${q[0] - 2 * d} ${q[1] - 1} Z`, fill: "#FFFFFF", stroke: "#192238", "stroke-width": 1.1, "stroke-linejoin": "round" }, g);
        el("rect", { x: q[0] - w / 2, y: q[1] - h, width: w, height: h, rx: 5, fill: "#FFFFFF", stroke: "#192238", "stroke-width": 1.1 }, g);
        [-6, 0, 6].forEach((u) => el("circle", { cx: q[0] + u, cy: q[1] - h / 2, r: 1.6, fill: "#192238" }, g)); })); }

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
    HOMES.forEach(([x, y]) => add(x + 1.9, y + 2.2, "chg", (g) => { K.charger(g, x + 1.9, y + 2.2); const h = bx(g, x + 2.25, y + 0.3, 0, 0.42, 0.3, 0.4, "#F1F2F4", "#FFFFFF"); const c = P(x + 2.46, y + 0.6, 0.2); el("circle", { cx: c[0], cy: c[1], r: 2.8, fill: "#C9CED6", stroke: "#000", "stroke-width": 0.6 }, g);
      const fan = el("g", { class: "oc-fan" }, g); [0, 90].forEach((r) => el("path", { d: `M${c[0] - 2.3} ${c[1]} L${c[0] + 2.3} ${c[1]}`, stroke: "#3E4860", "stroke-width": 1.1, transform: `rotate(${r} ${c[0]} ${c[1]})` }, fan)); }));
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
    // index2: the sensors sit on the wires themselves (placed after the lines are drawn, below)
    add(28.9, 22.2, "sense", (g) => { F.cyl(g, [25.6, 20.3, 2.2], "z", 0.06, 0.55, { side: "#9AA3B5", cap: "#626E88" }); const q = P(25.6, 20.3, 2.8);
      el("ellipse", { cx: q[0], cy: q[1], rx: 7, ry: 4.5, fill: "#F1F2F4", stroke: "#000", "stroke-width": 0.7, transform: `rotate(-25 ${q[0]} ${q[1]})` }, g); });
    // connect: a new renewables zone in the fields (tile 13) and a new line along the front edge, past the village and the
    // farm, to a new substation for the data centres (tile 16)
    [[1.6, 37.4], [5.0, 37.0], [8.4, 37.6], [2.0, 41.2], [5.6, 41.0], [3.4, 44.6]].forEach(([x, y]) => add(x, y, "zone", (g) => ISO.turbine(g, F, x, y, 4.6)));
    add(8.6, 45.0, "zone", (g) => { F.box(g, 6.8, 44.2, 0, 3.2, 1.7, 0.06, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" }); K.xfmr(g, 7.1, 44.5); K.gantry(g, 9.4, 45.1, "y"); });
    const NL = [{ k: "pylon", x: 16.8, y: 45.1 }, { k: "pylon", x: 28.8, y: 45.1 }];
    NL.forEach((s) => pyl(s.x, s.y, "newline"));
    span("tNew", "newline", { k: "gantry", x: 9.4, y: 45.1 }, NL[0]); span("tNew", "newline", NL[0], NL[1]); span("tNew", "newline", NL[1], { k: "gantry", x: 37.2, y: 45.1 });
    S.add(38.6, 45.2, (g) => { F.box(g, 36.8, 43.8, 0, 3.6, 2.4, 0.06, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" }); K.gantry(g, 37.2, 45.1, "y"); K.xfmr(g, 38.4, 44.2); K.xfmr(g, 38.4, 45.3); }, "nsub");

    // ================= movers =================
    let train, fast, boat, boatG, cars0, cars2; const UIDY = Math.random().toString(36).slice(2, 7);
    // a car drives the length of its road, always forwards (+gx, the bonnet first), fading in at the start and out at the end;
    // its loop runs on its own clock (not the scroll), so it never reverses, and it pauses when its road is muted
    // index2: more traffic. A vehicle's kind: car (default), bus, truck or tram; dir -1 drives along -gx (the other lane)
    // index2: rev (a vehicle driving towards -gx or -gy) is drawn the other way round, cab and bonnet leading
    const vehicle = (g, kind, x, y, col, axis, rev) => {
      const ax = axis === "y", box = (dx, dy, z, w, d, h, c, top) => (ax ? bx(g, x + dy, y + dx, z, d, w, h, c, top) : bx(g, x + dx, y + dy, z, w, d, h, c, top));
      if (kind === "bus" && rev) { col = col || "#47B970"; const L = 2.8, W = 0.62;
        const b = ax ? F.box(g, x, y, 0.12, W, L, 0.8, { left: shade(col), right: col, top: "#F1F2F4" }) : F.box(g, x, y, 0.12, L, W, 0.8, { left: col, right: shade(col), top: "#F1F2F4" });
        [0.5, 2.35].forEach((u) => K.wheel(g, ax ? x + W : x + u, ax ? y + u : y + W, 0.15, 0.15, ax ? "x" : "y"));
        for (let k = 0; k < 6; k++) F.face(g, ax ? F.R : F.L, b, 0.2 + k * 0.42, 0.42, 0.52 + k * 0.42, 0.7, C.water, { "stroke-width": 0.6 });
        const end = ax ? F.L : F.R;   // the end that faces the viewer is the back: a small window and two red lamps
        F.face(g, end, b, 0.14, 0.5, 0.48, 0.7, C.water, { "stroke-width": 0.6 }); [[0.05, 0.13], [0.49, 0.57]].forEach(([u0, u1]) => F.face(g, end, b, u0, 0.2, u1, 0.3, "#E0393E", { "stroke-width": 0.4 }));
        return b; }
      if (kind === "bus") return K.bus(g, x, y, col || "#47B970", ax ? "y" : "x");
      if (kind === "truck") { const cab = rev ? 0 : 1.65, cargo = rev ? 0.6 : 0;
        // the part further back (lower gx or gy) is drawn first, so the nearer one sits in front of it
        const body = () => box(cargo, 0, 0.12, 1.6, 0.6, 0.8, col || "#F1F2F4", "#FFFFFF"), front = () => box(cab, 0.02, 0.12, 0.55, 0.56, 0.6, "#3E4860", "#5B6478");
        if (rev) { front(); body(); } else { body(); front(); }
        (rev ? [0.3, 0.9, 1.9] : [0.3, 1.3, 1.9]).forEach((u) => K.wheel(g, ax ? x + 0.6 : x + u, ax ? y + u : y + 0.6, 0.14, 0.14, ax ? "x" : "y")); return; }
      if (kind !== "tram" && rev && !ax) { bx(g, x, y, 0.12, 1.4, 0.58, 0.28, col); [0.28, 1.12].forEach((u) => K.wheel(g, x + u, y + 0.58, 0.14, 0.14, "y"));
        bx(g, x + 0.45, y + 0.07, 0.4, 0.6, 0.44, 0.22, "#F1F2F4", lite(col)); return; }
      if (kind === "tram") { [0, 1.65].forEach((u) => { const b0 = box(u, 0, 0.12, 1.6, 0.62, 0.78, col || "#47B970", "#F1F2F4");
          for (let k = 0; k < 3; k++) F.face(g, ax ? F.R : F.L, b0, 0.18 + k * 0.48, 0.38, 0.5 + k * 0.48, 0.66, C.water, { "stroke-width": 0.6 });
          [0.32, 1.28].forEach((v) => K.wheel(g, ax ? x + 0.62 : x + u + v, ax ? y + u + v : y + 0.62, 0.15, 0.15, ax ? "x" : "y")); });   // index2: wheels
        const p0 = ax ? P(x + 0.31, y + 1.4, 0.9) : P(x + 1.4, y + 0.31, 0.9), p1 = ax ? P(x + 0.31, y + 1.9, 1.35) : P(x + 1.9, y + 0.31, 1.35);
        el("path", { d: `M${p0[0].toFixed(1)} ${p0[1].toFixed(1)} L${p1[0].toFixed(1)} ${p1[1].toFixed(1)}`, stroke: "#3E4860", "stroke-width": 1.4, fill: "none" }, g); return; }
      if (ax) return K.car(g, x, y, col, "y");
      return K.oldCar(g, x, y, col); };
    // a vehicle drives the length of its road on its own clock (not the scroll), always forwards, fading in at the start and
    // out at the end; it pauses when its road is muted
    // index2: every vehicle runs on one shared clock at one speed, so none overtakes another, and their start points (phases)
    // are chosen so that no two vehicles are ever in the same junction at once. A vehicle on a muted road holds still, and
    // picks up its place on the shared clock when its road comes back
    // All the traffic stops and starts together: while every road with vehicles is held still (muted), the shared clock
    // pauses and every vehicle stops where it is; as soon as any of them is in focus, all of them drive again. (Stopping
    // only some would let moving vehicles drive through stopped ones at the junctions.)
    const TRAFFIC = { t: 0 }, TRAFFIC_S = 26, trafficTw = gsap.to(TRAFFIC, { t: 1, duration: TRAFFIC_S, repeat: -1, ease: "none" });
    setInterval(() => { const ns = (lanesX || []).concat(S.set("carsY")); if (!ns.length) return;
      const live = ns.some((n) => !n.closest('[data-still="1"]')); if (live && trafficTw.paused()) trafficTw.play(); else if (!live && !trafficTw.paused()) trafficTw.pause(); }, 250);
    const drive = (lane, y, list, dir) => list.forEach(([col, phase, kind]) => { const c = el("g", null, lane); vehicle(c, kind, 0, y, col, "x", dir < 0); const o = { p: 0 }, L = N + 5;
      const tw = gsap.to(o, { p: 1, duration: TRAFFIC_S, repeat: -1, ease: "none", data: c, onUpdate: () => { const q = (phase + TRAFFIC.t) % 1, d = along(null, dir < 0 ? N + 2 - q * L : -3 + q * L);
        c.setAttribute("transform", `translate(${d.x.toFixed(1)} ${d.y.toFixed(1)})`); c.setAttribute("opacity", Math.max(0, Math.min(1, q * 14, (1 - q) * 14)).toFixed(2)); } }); });
    S.lane(RY + 0.45, (g) => { train = convoy(g, N, VK.steamTrain(RY + 0.45, 3)); fast = el("g", { opacity: 0 }, g); K.train(fast, 0, RY + 0.42, 3, { stripe: GREEN }); });
    S.lane(RD[2][0] + 0.45, (g0) => { boatG = el("g", { opacity: 0 }, g0); boat = convoy(boatG, N, [[0, (g) => { const y = RD[2][0] + 0.45;
      F.box(g, -1.5, y, 0, 3.0, 0.55, 0.28, { left: "#2F5E4E", right: shade("#2F5E4E"), top: "#4E7F6C" }); const cab = F.box(g, -0.9, y + 0.07, 0.28, 1.8, 0.42, 0.34, { left: "#B5302E", right: shade("#B5302E"), top: "#E3D6C0" });
      for (let u = 0.2; u < 1.6; u += 0.45) F.face(g, F.L, cab, u, 0.1, u + 0.22, 0.26, "#FFE6A3", { "stroke-width": 0.5 }); }]]); });
    // two lanes on each gx road: road 0 (with a tram) and road 2, the highway (with freight)
    const lanesX = [];
    [[RD[0][0] + 0.1, 1, [["#E0785A", 0.134], ["#47B970", 0.743, "tram"]]], [RD[0][0] + 0.82, -1, [["#F1F2F4", 0.367], ["#4AB4D6", 0.255, "bus"]]],
     [RD[2][0] + 0.1, 1, [["#4AB4D6", 0.927], ["#F1F2F4", 0.231, "truck"], ["#FFCD00", 0.414]]], [RD[2][0] + 0.82, -1, [["#E0785A", 0.789, "truck"], ["#A6D84A", 0.922]]]]
      .forEach(([y, dir, list]) => S.lane(y, (g) => { const ln = el("g", { opacity: 0 }, g); lanesX.push(ln); drive(ln, y, list, dir); }));
    cars0 = lanesX; cars2 = [];
    // traffic on the gy roads (north-east to south-west): each vehicle is drawn once, hidden, and shown through clipped
    // copies (<use>) placed down its road in depth order, so it passes behind what stands in front of it
    const protoHome = el("g", { opacity: 0, "data-role": "protos" }, S.root), protosY = [];   // hidden itself; its copies (<use>) show the vehicles
    const GYL = [[RD[0], [[1, "#E0785A", 0.028], [-1, "#4AB4D6", 0.836, "bus"]]], [RD[1], [[1, "#FFCD00", 0.802], [-1, "#F1F2F4", 0.762]]], [RD[2], [[1, "#F1F2F4", 0.035, "truck"], [-1, "#A6D84A", 0.381]]]];
    GYL.forEach(([[a, c], list], ri) => list.forEach(([dir, col, phase, kind], vi) => { const id = `oc-vy-${UIDY}-${ri}-${vi}`, x = dir > 0 ? a + 0.12 : c - 0.74;
      const g = el("g", { id }, protoHome); vehicle(g, kind, x, 0, col, "y", dir < 0); protosY.push([ri, id]); const o = { p: 0 }, L = N + 5;
      const tw = gsap.to(o, { p: 1, duration: TRAFFIC_S, repeat: -1, ease: "none", data: g, onUpdate: () => { const q = (phase + TRAFFIC.t) % 1, d = dir > 0 ? -3 + q * L : N + 2 - q * L, u = P(0, d), z = P(0, 0);
        g.setAttribute("transform", `translate(${(u[0] - z[0]).toFixed(1)} ${(u[1] - z[1]).toFixed(1)})`); g.setAttribute("opacity", Math.max(0, Math.min(1, q * 14, (1 - q) * 14)).toFixed(2)); } }); }));
    // used only by the interventions story (index4, js/story4.js): an HVDC converter station on the quay and its subsea
    // interconnector cable out across the sea to a neighbouring country beyond the tile's edge
    S.add(38.7, 21.3, (g) => { const h = bx(g, 37.0, 20.5, 0, 3.4, 1.5, 1.5, "#DCE3EA", "#EEF1F5"); for (let u = 0.4; u < 3.2; u += 0.7) F.face(g, F.L, h, u, 0.35, u + 0.4, 1.1, "#9FB2C6", { "stroke-width": 0.5 });
      [[40.6, 20.9], [40.6, 21.6]].forEach(([x, y]) => K.seg(g, [x, y, 0], [x, y, 1.0], "#626E88", 1.4)); }, "hvdc");
    S.add(44.0, 21.3, (g) => { const a = P(40.6, 21.25, 0), c = P(N, 21.25, 0); el("path", { d: `M${a[0]} ${a[1]} L${c[0]} ${c[1]}`, stroke: "#203772", "stroke-width": 3, "stroke-dasharray": "8 5", fill: "none" }, g); }, "hvdc");
    S.flush();
    { const kids = [...S.items.children], laneIdx = kids.map((c, i) => (c.hasAttribute("clip-path") ? i : -1)).filter((i) => i >= 0);
      const cuts = [RY + 0.45, RD[2][0] + 0.45, RD[0][0] + 0.1, RD[0][0] + 0.82, RD[2][0] + 0.1, RD[2][0] + 0.82].sort((p, q) => p - q);
      const SEG = 2.0;
      GYL.forEach(([[a, c]], ri) => { for (let y0 = 0; y0 < N; y0 += SEG) { const y1 = Math.min(N, y0 + SEG), ym = (y0 + y1) / 2, key = P((a + c) / 2, ym)[1];
        const band = cuts.filter((v) => v <= ym).length, start = band === 0 ? 0 : laneIdx[band - 1] + 1, end = band < laneIdx.length ? laneIdx[band] : kids.length;
        let before = kids[end] || null; for (let i = start; i < end; i++) { if (+kids[i].dataset.oy > key) { before = kids[i]; break; } }
        const cid = `oc-cy-${UIDY}-${ri}-${y0}`, cp = el("clipPath", { id: cid }, S.defs);
        el("polygon", { points: ISO.pts(ISO.hull([[a - 0.1, y0], [c + 0.1, y0], [c + 0.1, y1], [a - 0.1, y1]].flatMap(([x, y]) => [P(x, y, 0), P(x, y, 1.6)]))) }, cp);
        const g = el("g", { "clip-path": `url(#${cid})` }); S.items.insertBefore(g, before); S.set("carsY").push(g);
        protosY.filter(([r]) => r === ri).forEach(([, id]) => el("use", { href: "#" + id }, g)); } }); }
    // sensors clamped on the wires themselves: line ratings on the generation lines, two on each circuit of the new line
    const clampOn = (set, id, k, f) => { const L = LINES[id], w = L && L.cond[k * 2], grp = L && L.groups[k]; if (!w || !grp) return;
      const q = w.getPointAtLength(w.getTotalLength() * f), g = el("g", { "data-noink": "" }, grp);
      el("rect", { x: q.x - 4, y: q.y - 2, width: 8, height: 6, fill: "#2E6FB3" }, g); el("rect", { x: q.x - 1.6, y: q.y, width: 3.2, height: 2, fill: "#FFFFFF" }, g); S.set(set).push(g); };
    [["tW", 0, 0.55], ["tW2", 0, 0.5], ["tE", 0, 0.5], ["tE2", 0, 0.5]].forEach(([id, k, f]) => clampOn("dlr", id, k, f));
    [["d1w", 2, 0.5], ["d1w", 4, 0.5], ["d1w", 6, 0.5], ["d1e2", 1, 0.5], ["d2", 1, 0.5], ["d2", 3, 0.5], ["d3w", 2, 0.5], ["d3e", 3, 0.5]].forEach(([id, k, f]) => clampOn("sense", id, k, f));
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
      "hub", "chg", "sol3", "farmpv", "dc", "ind2", "sense", "dlr", "zone", "newline", "nsub", "meet", "nlsense", "trees2", "logi", "homecars", "carsY");
    gsap.set(later, { opacity: 0 });
    // flows: a state per line (f orange, c green, cb green back); only changes are written to the timeline
    const cur = {}; Object.keys(LINES).forEach((id) => (cur[id] = { f: 0, c: 0, cb: 0 }));
    const flows = (t, spec) => { if (spec.d1e && !spec.d1e2) spec = Object.assign({}, spec, { d1e2: spec.d1e }); Object.keys(LINES).forEach((id) => { const want = Object.assign({ f: 0, c: 0, cb: 0 }, spec[id] || {});
      ["f", "c", "cb"].forEach((k) => { if (cur[id][k] !== want[k]) { tl.to(LINES[id][k], { opacity: want[k], duration: 0.25 }, t); cur[id][k] = want[k]; } }); }); };
    const allLines = (v) => { const o = {}; Object.keys(LINES).forEach((id) => (o[id] = v)); return o; };
    // focus: everything not in the given sets is muted; only changes are written. index.html adds:
    //  - glows: { o: [sets], g: [sets] } ring the named pieces in orange (new demand) or green (switching to clean power)
    //  - pulses on a muted line stop showing, so only the lines in focus carry moving power
    const items = [...S.items.children], fcur = new Map(items.map((n) => [n, W0])); gsap.set(items.concat([S.ground]), { filter: "none" });
    // a node's top-level piece: an item (the train's lane, the cars' lanes) or a ground layer (the canal, the roads, a pad)
    const top = (n) => { while (n && n.parentNode !== S.items && n.parentNode !== G) n = n.parentNode; return n; };
    // the ground is muted layer by layer, so the canal, the railway or the roads can stay in colour
    const gkids = [...G.children], gkcur = new Map(gkids.map((n) => [n, W0])); gsap.set(gkids, { filter: "none" });
    const PADS = { ps: padPS, sub: padSub, terr: padTerr, ind: padInd, towers: padDown, shops: padShops, flats: padFlats, dc: padDC, depot: padDepot };
    // highlight colours: the piece is recoloured in shades of green (switching to clean power) or orange (new demand):
    // its luminance mapped onto dark - brand colour - pale (an SVG duotone filter, so design reads as one colour)
    const defs = svg.querySelector("defs") || el("defs", null, svg);
    const DUO = { g: ["0.14 0.40 0.88", "0.26 0.62 0.93", "0.20 0.50 0.90"], o: ["0.30 0.76 0.96", "0.18 0.55 0.92", "0.10 0.40 0.88"] };   // muted: dark, mid, pale   // per channel: dark, brand, pale
    Object.entries(DUO).forEach(([k, [r, g2, bb]]) => { if (svg.querySelector("#oc-duo-" + k)) return;
      const f = el("filter", { id: "oc-duo-" + k, "color-interpolation-filters": "sRGB" }, defs);
      el("feColorMatrix", { type: "matrix", values: "0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0" }, f);
      const ct = el("feComponentTransfer", null, f); [["feFuncR", r], ["feFuncG", g2], ["feFuncB", bb]].forEach(([n, v]) => el(n, { type: "table", tableValues: v }, ct)); });
    const TINT = { o: "url(#oc-duo-o)", g: "url(#oc-duo-g)" };
    // index2: a piece in colour has no filter at all ("none"); it is given the identity filter only for the fade to grey
    // index2: the mute is a colour rewrite (RECOL), not a CSS filter
    const ftw = (n, was, want, t) => { const h = RECOL.handle(n, want === MUTEG || was === MUTEG ? "ground" : "item");
      tl.to(h, { m: want === W0 ? 0 : 1, duration: 0.35, ease: "none", onUpdate: h.apply, onComplete: h.apply, onReverseComplete: h.apply }, t); };
    const fto = (n, want, t) => { const was = fcur.get(n); if (was === want) return; fcur.set(n, want); ftw(n, was, want, t); };
    // the pulses of each span, by the span's item
    const spanPulses = new Map(); Object.values(LINES).forEach((L) => L.groups.forEach((g) => spanPulses.set(top(g), [...g.querySelectorAll(".oc-pk")])));
    const FACTORY = new Set(T("ps", "psx", "ind", "chim", "ind2"));
    const stillNow = new Map(items.map((n) => [n, "0"])); items.forEach((n) => n.setAttribute("data-still", "0"));
    const pvis = new Map([...spanPulses.keys()].map((g) => [g, true]));
    // the tile each tree stands on, and the sets that own that tile: when an owner is in focus, so are its trees
    const p00 = P(0, 0), pX = P(1, 0), pY = P(0, 1), det = (pX[0] - p00[0]) * (pY[1] - p00[1]) - (pY[0] - p00[0]) * (pX[1] - p00[1]);
    const gridOf = (n) => { const sx = +n.dataset.ox - p00[0], sy = +n.dataset.oy - p00[1]; return [(sx * (pY[1] - p00[1]) - sy * (pY[0] - p00[0])) / det, ((pX[0] - p00[0]) * sy - (pX[1] - p00[1]) * sx) / det]; };
    const OWNERS = { "0,1": ["homes", "chg"], "1,1": ["shops", "station"], "0,2": ["flats"], "1,2": ["hub", "life"], "2,1": ["sub", "cc"], "1,3": ["logi"], "2,3": ["farm", "farmpv"], "2,2": ["terr"] };
    const TREES = T("trees", "trees2").map((n) => { const [x, y] = gridOf(n); return [n, OWNERS[`${Math.floor(x / 12)},${Math.floor(y / 12)}`] || []]; });
    const focus = (t, sets, glow) => {
      const names = sets ? sets.filter((x) => typeof x === "string") : [], nodes = sets ? sets.filter((x) => typeof x !== "string").flat().map(top) : [];
      const keep = new Set(sets ? T(...names).concat(nodes) : items), gl = new Map();
      if (sets) TREES.forEach(([n, owners]) => { if (owners.some((o) => names.includes(o))) keep.add(n); });   // index2: whole squares, trees included
      Object.entries(glow || {}).forEach(([c, ss]) => ss.forEach((x) => (typeof x === "string" ? T(x) : [top(x)]).forEach((n) => gl.set(n, c))));
      items.forEach((n) => { const g = gl.get(n); fto(n, keep.has(n) || g ? W0 : MUTE, t);   // highlighted pieces keep their own colours (no recolour)
        // only what the text is about moves: everything else holds still (CSS animations and the turbines' spin pause)
        const still = (sets ? !keep.has(n) && !g : false) ? "1" : "0"; /* index2: in the full views the factories move too */ if (stillNow.get(n) !== still) { tl.set(n, { attr: { "data-still": still } }, t); stillNow.set(n, still); } });
      const gk = new Set(nodes.concat(names.map((k) => PADS[k]).filter(Boolean)));
      gkids.forEach((n) => { const want = !sets || gk.has(n) ? W0 : MUTEG; if (gkcur.get(n) !== want) { ftw(n, gkcur.get(n), want, t); gkcur.set(n, want); } });
      spanPulses.forEach((ps, g) => { const v = !sets || keep.has(g); if (pvis.get(g) !== v) { tl.set(ps, { visibility: v ? "visible" : "hidden" }, t); pvis.set(g, v); } }); };
    // the camera: a point of the land brought to the right half of the screen, at a zoom
    const cam = { tx: 680, ty: 90, s: 0.4 }; const setCam = () => S.root.setAttribute("transform", `translate(${cam.tx.toFixed(1)} ${cam.ty.toFixed(1)}) scale(${cam.s.toFixed(4)})`);
    // phones (a tall screen): the svg is cropped to a narrow middle strip, so the camera aims at its middle and lower down,
    // under the story card, and a little closer in
    const PH = svg.getBoundingClientRect().width > 0 && svg.getBoundingClientRect().width < 700;
    const camAt = (x, y, s) => { const q = P(x, y); s = PH ? s * 0.92 : s; return { tx: (PH ? 800 : 1010) - s * q[0], ty: (PH ? 600 : 470) - s * q[1], s }; };
    const HOME = (() => { const h = camAt(23.25, 23.25, PH ? 0.4 : 0.5); if (!PH) { h.tx -= 70; h.ty += 45; } return h; })(); Object.assign(cam, HOME); setCam();   // the default view: closer than the whole tile (its far corners crop)
    let camCur = "home";
    const look = (t, x, y, s) => { const key = x == null ? "home" : `${x},${y},${s}`; if (key === camCur) return; camCur = key; tl.to(cam, Object.assign({}, x == null ? HOME : camAt(x, y, s), { duration: 0.6, ease: "power2.inOut", onUpdate: setCam }), t); };
    // a beat: what is in colour, where the camera is, what glows
    const hl = (t, sets, view, glow) => { focus(t, sets, glow); view ? look(t, ...view) : look(t); };
    // a chapter card (the titles of Acts 2 and 3): the whole city recedes, muted, further away and paler
    let dimmed = false;
    const chapter = (t, on) => { if (on === dimmed) return; dimmed = on; tl.to(S.root, { opacity: on ? 0.45 : 1, duration: 0.4 }, t); if (on) { focus(t, []); look(t, 23.25, 26.0, 0.4); } };
    const MIX = { f: 1, c: 1 };
    const NOW = { tGas: { f: 1 }, tTrunk: MIX, tW: { c: 1 }, tW2: { c: 1 }, tE: { c: 1 }, tE2: { c: 1 }, d1w: MIX, d1e: MIX, d2: MIX, d3w: MIX, d3e: MIX };
    const OLD = { tGas: { f: 1 }, tTrunk: { f: 1 }, d1w: { f: 1 }, d1e: { f: 1 }, d2: { f: 1 }, d3w: { f: 1 }, d3e: { f: 1 } };
    const GREENALL = { tW: { c: 1 }, tW2: { c: 1 }, tE: { c: 1 }, tE2: { c: 1 }, tTrunk: { c: 1 }, d1w: { c: 1 }, d1e: { c: 1 }, d2: { c: 1 }, d3w: { c: 1 }, d3e: { c: 1 } };
    const NEWG = { tNew: { c: 1 } };
    // the sensors show only on the beats about them (and in the full views of the modern grid)
    const sensors = (t, v) => tl.to(T("sense"), { opacity: v ? 1 : 0, duration: 0.25 }, t);
    const lineSensors = (t, v) => tl.to(T("dlr"), { opacity: v ? 1 : 0, duration: 0.25 }, t);

    // ================= Act 1: Daring to build =================
    // B1-B2: the old town, in colour
    // B3 (k=2-6) the eras, one at a time, each framed by the camera
    // k=2 canals
    tl.to(laneR2, { opacity: 0, duration: 0.2 }, b(2)); tl.to(canal, { opacity: 1, duration: 0.3 }, b(2));
    tl.set(boatG, { opacity: 1 }, b(2) + 0.2); boat.at(-4); boat.to(tl, 18, { duration: 0.8, ease: "power1.out" }, b(2) + 0.2);
    hl(b(2), [boatG, canal], [18, 23.5, 0.6]);
    // the land gives way: woods and fields are cleared as each block is built on
    tl.to(land.c4, { opacity: 0, duration: 0.3 }, b(3) + 0.35); tl.to(land.c11, { opacity: 0, duration: 0.3 }, b(3) + 0.4); sink(tl, T("wood3", "wood12"), b(3) + 0.3, { stagger: 0.008 });
    tl.to(land.p7, { opacity: 0, duration: 0.3 }, b(7) + 0.2); sink(tl, T("orch9"), b(7), { stagger: 0.01 });
    tl.to(land.c2, { opacity: 0, duration: 0.3 }, b(8)); sink(tl, T("wood16"), b(13), { stagger: 0.008 });
    // k=3 railways: the line, the station, the power station, factories, row houses, the brick city
    tl.to(laneR1, { opacity: 0, duration: 0.2 }, b(3)); tl.to(bed, { opacity: 1, duration: 0.15 }, b(3));
    rails.forEach((r) => drawOn(tl, r, b(3), 0.45)); tl.to(sleepers, { opacity: 1, duration: 0.04, stagger: 0.45 / sleepers.length, ease: "none" }, b(3));
    rise(tl, T("station"), b(3) + 0.2); train.at(-8); train.to(tl, 16, { duration: 0.45, ease: "power1.out" }, b(3) + 0.25);
    sink(tl, T("mill"), b(3) + 0.4); tl.to([padPS, padInd, padTerr, padDown], { opacity: 1, duration: 0.2 }, b(3) + 0.45);
    rise(tl, T("ps", "psx", "ind", "chim"), b(3) + 0.5, { stagger: 0.05 }); rise(tl, T("terr"), b(3) + 0.6, { stagger: 0.05 }); rise(tl, T("city"), b(3) + 0.55, { stagger: 0.04 });
    train.to(tl, 66, { duration: 0.6, ease: "power1.in" }, b(3) + 0.8);   // the steam train leaves the map for good
    hl(b(3), ["station", "ps", "psx", "ind", "chim", "terr", "city", fast, bed, rails, sleepers], [24, 14, 0.52]);
    // k=4 telephone lines: poles and wires up gy road 0, beside the cottages (no power on them)
    tl.to(skies[1], { opacity: 1, duration: 0.4 }, b(4) - 0.1);
    rise(tl, T("tel"), b(4), { stagger: 0.04 }); tl.to(T("tel"), { opacity: 0, duration: 0.3 }, b(7));
    hl(b(4), ["tel", "old"], [9, 22, 0.95]);
    // k=5 highways: the canal is paved over; roads, cars, homes with their cars, the fuel depot and the gas imports
    tl.to(boatG, { opacity: 0, duration: 0.15 }, b(5) - 0.05);
    tl.to(roads, { opacity: 1, duration: 0.35 }, b(5)); tl.to([lanes, canal], { opacity: 0, duration: 0.3 }, b(5) + 0.1);
    tl.to(cars0.concat(T("carsY")), { opacity: 1, duration: 0.25 }, b(5) + 0.35);
    sink(tl, T("old"), b(5) + 0.3); tl.to(padDepot, { opacity: 1, duration: 0.2 }, b(5) + 0.35);
    rise(tl, T("homes", "homecars"), b(5) + 0.45, { stagger: 0.04 }); sink(tl, T("village"), b(5) + 0.3); rise(tl, T("logi"), b(5) + 0.5); gsap.set(T("depot"), { opacity: 0 }); tl.to(T("depot"), { opacity: 1, duration: 0.3 }, b(5) + 0.4);
    tl.to(T("boats"), { opacity: 0, duration: 0.2 }, b(5) + 0.3);
    tl.fromTo(T("ship"), { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, b(5) + 0.4);
    hl(b(5), ["homecars", "logi", "carsY", cars0, roads]);   // index2: the roads and what moves on them (cars, buses, freight), not the houses
    // k=6 internet cables: the office towers, the control centre, masts
    rise(tl, T("towers", "cc"), b(6) + 0.1, { stagger: 0.05, dur: 0.35 }); rise(tl, T("masts"), b(6) + 0.3, { stagger: 0.1 });
    tl.to(fibre, { opacity: 1, duration: 0.3 }, b(6)); tl.to(fibre, { opacity: 0, duration: 0.3 }, b(7) - 0.3);
    hl(b(6), ["towers", "masts", "tel", fibre], [30, 16, 0.5]);   // index2: the cables in the ground, not the control centre
    // B4 (k=7) new ways of living, new kinds of growth: the town grows (flats, shops, the city's life) and is wired up:
    // the power station's line, the substation, the poles; fossil power flows (the camera pulls back to watch it grow)
    const B3T = b(7) - 0.35;   // index2: the new town is complete before its card reaches the middle of the screen
    sink(tl, T("oldshops"), B3T); tl.to(padShops, { opacity: 1, duration: 0.2 }, B3T + 0.05);
    tl.to(padFlats, { opacity: 1, duration: 0.2 }, B3T + 0.05); rise(tl, T("shops"), B3T + 0.1, { stagger: 0.04 }); rise(tl, T("flats"), B3T + 0.15, { stagger: 0.05, dur: 0.35 }); rise(tl, T("trees2"), B3T + 0.3, { stagger: 0.04 });
    tl.to(padSub, { opacity: 1, duration: 0.2 }, B3T + 0.25); rise(tl, T("sub", "transG"), B3T + 0.3, { stagger: 0.04 }); rise(tl, T("dist", "dist3"), B3T + 0.4, { stagger: 0.008 });
    rise(tl, T("life"), B3T + 0.5, { stagger: 0.01, dur: 0.2 });
    hl(B3T, null, [23.25, 25, 0.44]);
    flows(B3T + 0.7, OLD);
    // B5 (k=8) the next age runs on electricity: wind, solar, batteries, their lines; solar on the row houses
    rise(tl, T("wind", "solar", "batt"), b(8), { stagger: 0.015 }); rise(tl, T("transW", "transE"), b(8) + 0.25, { stagger: 0.04 }); rise(tl, T("terrpv"), b(8) + 0.35, { stagger: 0.04 });
    flows(b(8) + 0.6, NOW);
    hl(b(8), ["wind", "solar", "batt", "transW", "transE", "terrpv", "homecars"], [13, 6, 0.72], { g: ["wind", "solar", "batt"] });
    // B6 (k=9) "that choice is being made now": people meet on the common
    // a big question mark over the whole city (fixed to the screen, above the camera), as in the earlier versions
    // index2: B5 stays on the B4 picture

    // ================= Act 2: The world moved on, the grid did not =================
    chapter(b(10), true);
    // B8 (k=11) how we work, travel and communicate has changed: a modern train, cars, towers, flats, people
    chapter(b(11), false);
    tl.fromTo(fast, Object.assign({ opacity: 0 }, along(fast, 2)), Object.assign(along(fast, 52), { duration: 0.8, ease: "power1.inOut", immediateRender: false }), b(11) + 0.1); tl.to(fast, { opacity: 1, duration: 0.06 }, b(11) + 0.1);
    tl.to(fast, { opacity: 0, duration: 0.08 }, b(11) + 0.85);
    // B7 the world moved on: the whole city in colour except its grid (lines, pylons, poles, substations)
    const WIRES = new Set(["transG", "transW", "transE", "sub", "dist", "dist3", "psx", "newline", "nsub", "sense", "dlr", "nlsense", "tel"]);
    hl(b(11), Object.keys(st).filter((k) => !WIRES.has(k) && !["ship", "depot", "boats", "hvdc"].includes(k)).concat([cars0, fast, roads, bed, rails, sleepers]), null);
    // B9 (k=12) the grid has stayed the same
    // B8 the grid stayed the same: only the grid, from generation to distribution (plants, wind, solar, batteries, lines, substation, poles)
    const GRID = ["ps", "psx", "wind", "solar", "batt", "transG", "transW", "transE", "sub", "dist", "dist3"];
    hl(b(12), GRID);
    // B10 (k=13) hungrier for power: the users, the new demand ringed in orange (data centres arrive, the office towers
    // and the control centre fill with computers)
    const USERS = ["homes", "homecars", "shops", "terr", "terrpv", "ind", "chim", "city", "towers", "flats", "cc", "station", "logi", "farm", "depot", "dc"];
    tl.to(padDC, { opacity: 1, duration: 0.2 }, b(13)); rise(tl, T("dc").slice(0, 2), b(13) + 0.1, { stagger: 0.12, dur: 0.35 });
    hl(b(13), USERS, null, { o: USERS }); flows(b(13), {});
    // B11 (k=14) electrostates: the electricity system in colour
    hl(b(14), ["wind", "solar", "batt", "transW", "transE", "transG", "sub", "dist", "dist3", "terrpv"], [24, 21, 0.44]);   /* index2: pulled back a little so the turbines stay in frame */ flows(b(14), NOW);
    // B12 (k=15) cars, trains, kitchens, heating and factories switch to electricity (ringed in green): the EV hub and its
    // solar car park, chargers and heat pumps at the homes, an electric train, the factory's chimney comes down
    rise(tl, T("hub", "chg"), b(15) + 0.1, { stagger: 0.04 }); sink(tl, T("chim"), b(15) + 0.3);
    tl.fromTo(fast, Object.assign({ opacity: 0 }, along(fast, 2)), Object.assign(along(fast, 52), { duration: 0.8, ease: "power1.inOut", immediateRender: false }), b(15) + 0.1); tl.to(fast, { opacity: 1, duration: 0.06 }, b(15) + 0.1);
    tl.to(fast, { opacity: 0, duration: 0.08 }, b(15) + 0.85);
    hl(b(15), ["hub", "chg", "homes", "homecars", "logi", "ind", "terr", "terrpv", fast], [24, 24, 0.5], { g: ["hub", "chg", "homes", "ind", "terr", "terrpv", fast] });
    // B13 (k=16) domestic wind and solar replace imports: the carrier sails, the tanks come down, solar on the quay, wind offshore
    tl.to(T("ship"), { opacity: 0, duration: 0.4 }, b(16)); /* index2: fades where it is */ sink(tl, T("depot"), b(16) + 0.25); rise(tl, T("sol3", "farmpv"), b(16) + 0.3, { stagger: 0.03 });
    hl(b(16), ["sol3", "ship", "depot"], [39, 16.5, 0.78], { g: ["sol3", "ship", "depot"] });
    // B14 (k=17) data centres expanding, drawing power around the clock
    rise(tl, T("dc").slice(2), b(17) + 0.1, { stagger: 0.12, dur: 0.35 });
    hl(b(17), ["dc", "dist3"], [40, 40, 0.78], { o: ["dc", "dist3"] }); flows(b(17), Object.assign({}, NOW, { d3e: { c: 1, f: 1 } }));
    // B15 (k=18) where AI, industry and investment go: the new factory, the data centres
    rise(tl, T("ind2"), b(18) + 0.1, { dur: 0.35 });
    hl(b(18), ["ind2", "ind", "dc", "hub", "logi"].concat(GRID), [33, 26, 0.5]);   // index2: the grid too

    // ================= Act 3: A new type of grid =================
    chapter(b(19), true);
    const ALLG = ["wind", "solar", "batt", "transG", "transW", "transE", "sub", "dist", "dist3", "sol3", "farmpv", "terrpv", "hub"];
    const A3 = (k) => b(20 + k);
    // B17 the old grid: one way, from the big power station (ringed in orange) to everyone else
    chapter(A3(0), false);
    svg.setAttribute("data-flow", ""); tl.set(svg, { attr: { "data-flow": "big" } }, A3(0)); tl.set(svg, { attr: { "data-flow": "" } }, A3(3));   // B17-B19: the flows are the story
    hl(A3(0), ["ps", "psx", "transG", "sub", "dist", "dist3"], null, { o: ["ps"] });   // index2: the power station and the grid only
    flows(A3(0), OLD);
    // B18 generation spread across the country: every wind turbine and solar panel in colour
    hl(A3(1), ALLG.concat(["ps", "psx"]), null, { g: ["wind", "solar", "sol3", "farmpv", "terrpv", "hub"] }); flows(A3(1), Object.assign({}, GREENALL, { tGas: { f: 1 }, tTrunk: MIX }));
    // B19 power flows both ways: the row houses and homes draw power and send it back (the only two-way flows)
    hl(A3(2), ["terr", "terrpv", "homes", "homecars", "chg", "dist", "dist3"], [28.0, 29.0, 0.75]);
    flows(A3(2), Object.assign({}, GREENALL, { d3w: { c: 1, cb: 1 }, d3e: { c: 1, cb: 1 }, d1w: { c: 1, cb: 1 }, d2: { c: 1, cb: 1 } }));
    // B20 no longer dependent on a few big plants: the whole system, generation and use, with the power station stood down
    hl(A3(3), ALLG.concat(["homes", "homecars", "logi", "shops", "terr", "flats", "towers", "city", "cc", "ind", "ind2", "dc", "chg", "station"]), [23.25, 24, 0.44]);
    flows(A3(3), GREENALL);
    // B21 smart devices and digitalisation: the sensors and the control centre
    rise(tl, T("sense"), A3(4) + 0.1, { stagger: 0.03 });
    hl(A3(4), ["cc", "sense", "sub", "dist", "dist3", "transG", "transW", "transE"], [28.0, 18.0, 0.72]);
    // B22 EVs charge and heat pumps run when power is cheap: close on the homes (the fans spin) and the EV hub
    sensors(A3(5), false);
    hl(A3(5), ["hub", "chg", "homes", "homecars", "terrpv", "dist"].concat(LINES.d1w.groups, LINES.d2.groups), [9.5, 21.5, 0.95], { g: ["chg", "hub"] });   // index2: with the poles
    // B23 batteries store the surplus and release it: the wind and solar farms, the batteries, the line from them
    hl(A3(6), ["batt", "solar", "wind", "transW", "transE", "transG"], [16, 7, 0.7], { g: ["batt"] });
    flows(A3(6), GREENALL);
    // B24 the system runs better: everything, in colour
    hl(A3(7), null); sensors(A3(7), true);
    // B25 lines fitted with sensors carry more when the weather allows
    rise(tl, T("dlr"), A3(8) + 0.15, { stagger: 0.05 }); sensors(A3(8), false);
    hl(A3(8), ["transW", "transE", "transG", "dlr", "wind", "solar"], [20.0, 8.5, 0.72]);
    // B26 advanced cables carry much more on the same towers: the conductors are restrung, more power runs on them
    const TR = ["tW", "tW2", "tE", "tE2", "tTrunk"];
    TR.forEach((id) => { tl.to(LINES[id].cond, { attr: { "stroke-width": 1.7 }, duration: 0.3 }, A3(9) + 0.1); LINES[id].c.forEach((g) => { tl.call(() => g.classList.add("dense"), null, A3(8) + 0.2); tl.call(() => g.classList.remove("dense"), null, A3(8) + 0.19); }); });   // index2: from B24
    lineSensors(A3(9), false);
    hl(A3(9), ["transW", "transE", "transG", "wind", "solar"], [20.0, 9.0, 0.6]);
    // B27 the modern grid: everything, in colour
    hl(A3(10), null); sensors(A3(10), true); lineSensors(A3(10), true);
    // B28 new lines built with today's technology: two circuits along one route, with line sensors, power on them;
    // the new wind zone and the data centres still muted
    sensors(A3(11), false); lineSensors(A3(11), false);
    rise(tl, T("zone"), A3(11) + 0.05, { stagger: 0.03 }); rise(tl, T("newline"), A3(11) + 0.2, { stagger: 0.04 }); rise(tl, T("nsub"), A3(11) + 0.35, { stagger: 0.05 }); rise(tl, T("nlsense"), A3(11) + 0.5, { stagger: 0.04 });
    hl(A3(11), ["newline", "nsub", "nlsense"], [22.0, 42.0, 0.62]);
    flows(A3(11) + 0.4, Object.assign({}, GREENALL, NEWG));
    // B29 the queues clear: pull back; the new wind zone, the data centres and the renewables light up, power to the data centres
    hl(A3(12), ["zone", "newline", "nsub", "nlsense", "dc", "wind", "solar", "sol3", "farmpv", "terrpv", "hub", "transW", "transE"], [24, 32, 0.5], { g: ["zone"] });
    flows(A3(12) + 0.15, Object.assign({}, GREENALL, NEWG));
    // B30 the modern grid
    hl(A3(13), null); sensors(A3(13), true); lineSensors(A3(13), true);
    ISO.tweens.forEach((t) => t.play && t.play());
    hold(tl, 32);
    // a handle for js/story4.js, which drives a second copy of this city through the interventions
    svg.__oc = { RECOL, gkids, FACTORY, S, T, P, cam, setCam, camAt, HOME, items, W0, WASH: MUTE, WASH2, GWASH: MUTEG, LINES, top, GREEN };
    return tl;
  }

  Object.assign(window.SCENES, { onecity6: onecity });
})();
