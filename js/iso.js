/* Isometric drawing kit: projection, primitives, tiles and the nine tool assets.
   Ground units: +gx runs down-right on screen, +gy runs down-left, gz is up.
   Style follows the infographic: flat fills, fine black ink outline, no shadows. */
(function () {
  const { el } = SVG;
  const INK = "#000", SW = 1.3;
  const K = { A: 30, B: 17.32, U: 34.64, OX: 800, OY: 70 };
  function ground(X, Y) { const d = (X - K.OX) / K.A, t = (Y - K.OY) / K.B; return [(t + d) / 2, (t - d) / 2]; }
  function P(gx, gy, gz) { return [K.OX + (gx - gy) * K.A, K.OY + (gx + gy) * K.B - (gz || 0) * K.U]; }
  const f = (n) => Math.round(n * 10) / 10;
  const pts = (a) => a.map((p) => f(p[0]) + "," + f(p[1])).join(" ");
  const dPath = (a, close) => "M" + a.map((p) => f(p[0]) + " " + f(p[1])).join(" L") + (close ? " Z" : "");

  // palette for the illustrations
  const C = {
    w1: "#FFFFFF", w2: "#F1F2F4", w3: "#D3D7DE",
    g1: "#E9EAEC", g2: "#CACDD3", g3: "#A6ABB4",
    t1: "#9ED9CF", t2: "#62BFB2", t3: "#3E9488",
    roof: "#A95B5B", roof2: "#8C4747",
    water: "#86C5EE", water2: "#4E9FD6",
    pv: "#3E4860", pvl: "#8C96AB", frame: "#D8DBE6",
    car: "#4AB4D6", truck: "#A6D84A", yellow: "#FFCD00", tank: "#C9D6D3", tankTop: "#E3ECEA",
    brick: "#B7B1AE", brick2: "#8F8784"
  };

  function poly(g, a, fill, extra) {
    return el("polygon", Object.assign({ points: pts(a), fill, stroke: INK, "stroke-width": SW, "stroke-linejoin": "round" }, extra || {}), g);
  }
  function line(g, a, extra) {
    return el("polyline", Object.assign({ points: pts(a), fill: "none", stroke: INK, "stroke-width": SW, "stroke-linecap": "round", "stroke-linejoin": "round" }, extra || {}), g);
  }

  // local frame at ground origin o
  function frame(o, sc) {
    sc = sc || 1;
    const p = (x, y, z) => P(o[0] + x * sc, o[1] + y * sc, (z || 0) * sc);
    const K2 = {
      p, s: sc,
      box(g, x, y, z, w, d, h, c) {
        c = c || {};
        const b = { x, y, z, w, d, h };
        const left = [p(x, y + d, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x, y + d, z + h)];
        const right = [p(x + w, y, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x + w, y, z + h)];
        const top = [p(x, y, z + h), p(x + w, y, z + h), p(x + w, y + d, z + h), p(x, y + d, z + h)];
        poly(g, left, c.left || C.w2); poly(g, right, c.right || C.w3); poly(g, top, c.top || C.w1);
        return b;
      },
      // points on the visible faces of a box: L = front-left face (u along gx), R = front-right face (u along gy), T = top
      L: (b, u, v) => p(b.x + u, b.y + b.d, b.z + v),
      R: (b, u, v) => p(b.x + b.w, b.y + u, b.z + v),
      T: (b, u, v) => p(b.x + u, b.y + v, b.z + b.h),
      face(g, fn, b, u0, v0, u1, v1, fill, extra) { return poly(g, [fn(b, u0, v0), fn(b, u1, v0), fn(b, u1, v1), fn(b, u0, v1)], fill, extra); },
      circle(c, axis, r, n) {
        n = n || 40; const out = [];
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2, cs = Math.cos(a) * r, sn = Math.sin(a) * r;
          if (axis === "z") out.push(p(c[0] + cs, c[1] + sn, c[2]));
          else if (axis === "x") out.push(p(c[0], c[1] + cs, c[2] + sn));
          else out.push(p(c[0] + cs, c[1], c[2] + sn));
        }
        return out;
      },
      cyl(g, c, axis, r, len, fills) {
        fills = fills || {};
        const c1 = c.slice(); c1[{ x: 0, y: 1, z: 2 }[axis]] += len;
        const a = K2.circle(c, axis, r), b = K2.circle(c1, axis, r);
        poly(g, hull(a.concat(b)), fills.side || C.w2);
        poly(g, b, fills.cap || C.w1);
        return c1;
      }
    };
    return K2;
  }

  function hull(points) {
    const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cross(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    up.pop(); lo.pop();
    return lo.concat(up);
  }

  /* ---------------- jigsaw geometry ---------------- */
  const CELL = 8, GRID = 3;
  // knob contour in edge-local units (u along the edge 0..1, v perpendicular)
  const KNOB = (() => {
    // a small, low knob so the seams read as a hint rather than a pattern
    const out = [[0, 0], [0.42, 0], [0.446, 0.018], [0.452, 0.045]];
    const cx = 0.5, cy = 0.1, r = 0.068;
    for (let a = 225; a >= -45; a -= 15) { const t = (a * Math.PI) / 180; out.push([cx + r * Math.cos(t), cy + r * Math.sin(t)]); }
    out.push([0.548, 0.045], [0.554, 0.018], [0.58, 0], [1, 0]);
    return out;
  })();
  // seam signs (which side each knob bulges), fixed so the puzzle looks hand-cut
  const HS = [[1, -1, 1], [-1, 1, -1], [1, 1, -1], [-1, -1, 1]]; // horizontal seams: HS[j][i], j = 1..2 used
  const VS = [[1, -1, 1], [-1, 1, 1], [1, -1, -1], [-1, 1, -1]]; // vertical seams:   VS[i][j], i = 1..2 used
  function seam(ax, ay, bx, by, nx, ny) {
    const L = Math.hypot(bx - ax, by - ay);
    return KNOB.map(([u, v]) => [ax + (bx - ax) * u + nx * v * L, ay + (by - ay) * u + ny * v * L]);
  }
  // ground outline of piece (i,j), clockwise on screen
  // a simple square tile per tool, with a small gap between neighbours
  const TILE_GAP = 0.22;
  function pieceOutline(i, j) {
    const g = TILE_GAP, x0 = i * CELL + g, y0 = j * CELL + g, x1 = (i + 1) * CELL - g, y1 = (j + 1) * CELL - g;
    return [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  }
  // extruded piece: sides (stacked copies) + top surface. Returns {g, top}
  function piece(parent, i, j, fill, opts) {
    opts = Object.assign({ thick: 9, side: "#B9C4D0", z: 0, dash: false, stroke: INK }, opts);
    const g = el("g", { class: "piece" }, parent);
    const outline = pieceOutline(i, j).map(([x, y]) => P(x, y, opts.z));
    const shift = (dy) => outline.map(([x, y]) => [x, y + dy]);
    el("path", { d: dPath(shift(opts.thick), true), fill: opts.side, stroke: opts.stroke, "stroke-width": SW, "stroke-linejoin": "round" }, g);
    for (let k = opts.thick - 1; k > 0; k -= 1.5) el("path", { d: dPath(shift(k), true), fill: opts.side }, g);
    const top = el("path", { d: dPath(outline, true), fill, stroke: opts.stroke, "stroke-width": SW, "stroke-linejoin": "round" }, g);
    return { g, top, outline };
  }
  function slot(parent, i, j) {
    const outline = pieceOutline(i, j).map(([x, y]) => P(x, y, 0));
    return el("path", { d: dPath(outline.map(([x, y]) => [x, y + 9]), true), fill: "none", stroke: "#8C96AB", "stroke-width": 1.2, "stroke-dasharray": "4 5", class: "slot" }, parent);
  }

  // the whole board as one slab (outer outline, single extrusion)
  function boardSlab(parent, opts) {
    opts = Object.assign({ thick: 12, top: "#F6F9FB", side: "#CBD6E0", stroke: "#8594A8" }, opts);
    const n = GRID * CELL;
    const o = [P(0, 0), P(n, 0), P(n, n), P(0, n)];
    const g = el("g", { class: "slab" }, parent);
    // visible sides: the two front faces
    poly(g, [o[1], o[2], [o[2][0], o[2][1] + opts.thick], [o[1][0], o[1][1] + opts.thick]], opts.side, { stroke: opts.stroke, "stroke-width": 1 });
    poly(g, [o[2], o[3], [o[3][0], o[3][1] + opts.thick], [o[2][0], o[2][1] + opts.thick]], mixHex(opts.side, "#FFFFFF", 0.3), { stroke: opts.stroke, "stroke-width": 1 });
    poly(g, o, opts.top, { stroke: opts.stroke, "stroke-width": 1 });
    return g;
  }
  // internal jigsaw seams as one path (for hairlines and the draw-on animation)
  function seamsPath() { return "M0 0"; } // tiles have no seams (kept so older calls still work)
  function mixHex(a, b, t) {
    const pa = [1, 3, 5].map((i) => parseInt(a.substr(i, 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.substr(i, 2), 16));
    return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }

  /* ---------------- building blocks ----------------
     Every tile is drawn in its own local frame: ground units 0..8 from the tile's back corner.
     Objects are drawn strictly back to front (smaller x + y first), so nothing overlaps wrongly. */
  const tweens = []; // rotor tweens (wind speed control)
  const THIN = 1;
  const INKL = "#3E4860"; // lighter ink for fine details (vents, window bars)

  function shade(hex) { return mix(hex, "#000000", 0.16); }
  function tint(hex) { return mix(hex, "#FFFFFF", 0.35); }
  function mix(a, b, t) {
    const pa = [1, 3, 5].map((i) => parseInt(a.substr(i, 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.substr(i, 2), 16));
    return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("");
  }
  const facePoly = (g, F, fn, b, u0, v0, u1, v1, fill, extra) => F.face(g, fn, b, u0, v0, u1, v1, fill, Object.assign({ "stroke-width": THIN }, extra || {}));
  // a circle lying on a vertical face or on the ground
  const disc = (g, F, c, axis, r, fill, extra) => poly(g, F.circle(c, axis, r, 28), fill, Object.assign({ "stroke-width": THIN }, extra || {}));
  // a straight line segment drawn in ground units
  const seg = (g, F, a, b, extra) => line(g, [F.p(...a), F.p(...b)], Object.assign({ "stroke-width": THIN }, extra || {}));

  /* ---------- subtle "in focus" motion ----------
     Overlay elements carry class "fx" (removed from the pencil-outline copy). CSS animations on ".anim" only run while the
     site is in colour (network.js adds "is-live"); gsap loops made here (fans) are collected per drawing in R.fx and
     played or paused by network.js the same way. */
  let FXT = [], UID = 0;
  const fxAttr = (anim, delay, extra) => Object.assign({ class: "fx anim " + anim, style: `animation-delay:${f(delay || 0)}s` }, extra || {});
  // a small fan spinning in a face's plane: plane "L" (front-left wall) or "T" (roof)
  function fan(g, F, c, plane, r, dur) {
    const q = F.p(...c), sc = F.s, A_ = K.A * sc, B_ = K.B * sc, U_ = K.U * sc;
    const m = plane === "T" ? [A_, B_, -A_, B_] : [A_, B_, 0, -U_];
    const outer = el("g", { class: "fx", transform: `matrix(${m.map(f).join(" ")} ${f(q[0])} ${f(q[1])})` }, g);
    const inner = el("g", null, outer);
    for (let b = 0; b < 3; b++) { const a = b * 2.094; el("line", { x1: 0, y1: 0, x2: f(Math.cos(a) * r * 100) / 100, y2: f(Math.sin(a) * r * 100) / 100, stroke: INK, "stroke-width": 1.4, "stroke-linecap": "round", "vector-effect": "non-scaling-stroke" }, inner); }
    const o = { a: Math.random() * 120 };
    FXT.push(gsap.to(o, { a: "+=360", duration: dur || 1.6, repeat: -1, ease: "none", paused: true, onUpdate: () => inner.setAttribute("transform", `rotate(${o.a.toFixed(1)})`) }));
  }

  function turbine(g, F, x, y, h) {
    const base = F.p(x, y, 0), top = F.p(x, y, h);
    poly(g, [[base[0] - 2.8, base[1]], [top[0] - 1.2, top[1]], [top[0] + 1.2, top[1]], [base[0] + 2.8, base[1]]], C.w1);
    // nacelle, pointing towards the viewer
    F.box(g, x - 0.3, y - 0.12, h - 0.08, 0.44, 0.24, 0.24, { top: C.w1, left: C.w2, right: C.w3 });
    const hub = F.p(x + 0.16, y, h + 0.04);   // centred on the nacelle's front face
    // a rotor facing the viewer projects almost to a circle in this view
    const wrap = el("g", { transform: `translate(${f(hub[0])} ${f(hub[1])}) scale(1.1 1)` }, g);
    const rotor = el("g", null, wrap);
    const Lb = 1.5 * K.U * F.s;
    for (let b = 0; b < 3; b++) {
      el("path", { d: `M-1.8 0 C-3 ${f(-Lb * 0.3)} -1.6 ${f(-Lb * 0.82)} 0 ${f(-Lb)} C1 ${f(-Lb * 0.8)} 2.4 ${f(-Lb * 0.34)} 1.8 0 Z`,
        fill: C.w1, stroke: INK, "stroke-width": THIN, "stroke-linejoin": "round", transform: `rotate(${b * 120})` }, rotor);
    }
    el("circle", { r: 3.2, fill: C.g1, stroke: INK, "stroke-width": THIN }, rotor);
    const o = { a: Math.random() * 120 };
    tweens.push(gsap.to(o, { a: "+=360", duration: 3.4 + Math.random(), repeat: -1, ease: "none", data: rotor, onUpdate: () => rotor.setAttribute("transform", `rotate(${o.a.toFixed(1)})`) }));
  }

  // tilted solar panel facing the viewer: back edge high, front edge low
  function panel(g, F, x, y, w, d, cells) {
    const zb = 0.9, zf = 0.28;
    [[x + 0.25, y], [x + w - 0.25, y]].forEach(([a, b]) => seg(g, F, [a, b, 0], [a, b, zb], { stroke: C.g3, "stroke-width": 1.6 }));
    [[x + 0.25, y + d], [x + w - 0.25, y + d]].forEach(([a, b]) => seg(g, F, [a, b, 0], [a, b, zf], { stroke: C.g3, "stroke-width": 1.6 }));
    const q = [F.p(x, y, zb), F.p(x + w, y, zb), F.p(x + w, y + d, zf), F.p(x, y + d, zf)];
    poly(g, q, C.frame);
    const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const at = (u, v) => lerp(lerp(q[0], q[1], u), lerp(q[3], q[2], u), v);
    const i = 0.05;
    const cell = poly(g, [at(i, i * 2), at(1 - i, i * 2), at(1 - i, 1 - i * 2), at(i, 1 - i * 2)], C.pv, { "stroke-width": 0.8, class: "pv" });
    let dd = "";
    for (let c = 1; c < 5; c++) { const u = i + (1 - 2 * i) * c / 5, a = at(u, i * 2), b = at(u, 1 - i * 2); dd += `M${f(a[0])} ${f(a[1])} L${f(b[0])} ${f(b[1])} `; }
    { const a = at(i, 0.5), b = at(1 - i, 0.5); dd += `M${f(a[0])} ${f(a[1])} L${f(b[0])} ${f(b[1])}`; }
    el("path", { d: dd, stroke: C.pvl, "stroke-width": 0.8, fill: "none" }, g);
    if (cells) cells.push(cell);
    // glint: a soft band of sunlight sweeping across the panel, clipped to it
    const id = "pvclip" + (++UID), wrap = el("g", { class: "fx", "clip-path": `url(#${id})` }, g);
    const cp = el("clipPath", { id }, wrap);
    el("polygon", { points: pts([at(i, i * 2), at(1 - i, i * 2), at(1 - i, 1 - i * 2), at(i, 1 - i * 2)]) }, cp);
    const tv = [(q[1][0] - q[0][0]) * 1.5, (q[1][1] - q[0][1]) * 1.5];
    el("polygon", Object.assign(fxAttr("glint", (x * 0.35 + y * 0.6) % 5), { points: pts([at(-0.35, 0), at(-0.15, 0), at(-0.3, 1), at(-0.5, 1)]), fill: "#FFFFFF", "fill-opacity": 0.55, stroke: "none" }), wrap)
      .style.cssText += `;--tx:${f(tv[0])}px;--ty:${f(tv[1])}px`;
  }

  // lattice pylon with two cross-arms
  function pylon(g, F, x, y, h) {
    const hw = h * 0.8, b0 = 0.4, b1 = 0.1;
    const k = (z) => b0 + (b1 - b0) * (z / hw);
    const at = (sx, sy, z) => F.p(x + sx * k(z), y + sy * k(z), z);
    const legs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
    legs.forEach(([sx, sy]) => line(g, [at(sx, sy, 0), at(sx, sy, hw)], { "stroke-width": 1.2 }));
    const lv = [0, hw * 0.34, hw * 0.62, hw];
    let d = "";
    [[[-1, 1], [1, 1]], [[1, -1], [1, 1]]].forEach(([a, b]) => {
      for (let n = 0; n < 3; n++) {
        const p1 = at(a[0], a[1], lv[n]), p2 = at(b[0], b[1], lv[n + 1]), p3 = at(b[0], b[1], lv[n]), p4 = at(a[0], a[1], lv[n + 1]);
        d += `M${f(p1[0])} ${f(p1[1])} L${f(p2[0])} ${f(p2[1])} M${f(p3[0])} ${f(p3[1])} L${f(p4[0])} ${f(p4[1])} `;
      }
    });
    el("path", { d, stroke: INK, "stroke-width": 0.75, fill: "none" }, g);
    const apex = F.p(x, y, h);
    legs.forEach(([sx, sy]) => line(g, [at(sx, sy, hw), apex], { "stroke-width": 1 }));
    el("circle", fxAttr("beacon", Math.random() * 2, { cx: f(apex[0]), cy: f(apex[1] - 1.5), r: 2.4, fill: "#E04B00", stroke: "none" }), g);
    [[hw * 0.7, 0.95], [hw * 0.95, 0.7]].forEach(([z, w]) => {
      const a = F.p(x, y - w, z), b = F.p(x, y + w, z);
      line(g, [a, b], { "stroke-width": 1.5 });
      [a, b].forEach((q) => line(g, [q, [q[0], q[1] + 6]], { "stroke-width": 1.2 }));
    });
  }
  function pole(g, F, x, y, h) {
    const b = F.p(x, y, 0), t = F.p(x, y, h);
    poly(g, [[b[0] - 2, b[1]], [t[0] - 1.5, t[1]], [t[0] + 1.5, t[1]], [b[0] + 2, b[1]]], "#D8C9A8", { "stroke-width": THIN });
    const a1 = F.p(x, y - 0.5, h - 0.12), a2 = F.p(x, y + 0.5, h - 0.12);
    line(g, [a1, a2], { "stroke-width": 2.6, stroke: "#8C7B62" });
  }

  // house with a gable roof whose ridge runs along x
  function house(g, F, x, y, w, d, h, hr, roof) {
    const b = F.box(g, x, y, 0, w, d, h, { left: C.w2, right: C.w3, top: C.w1 });
    facePoly(g, F, F.L, b, 0.3, 0, 0.72, 0.72, "#C9B79C");                           // door
    facePoly(g, F, F.L, b, w - 0.95, 0.38, w - 0.3, 0.8, C.water);                     // window
    facePoly(g, F, F.L, b, w - 0.95, 0.38, w - 0.3, 0.8, "#FFE6A3", fxAttr("glow", Math.random() * 6, { stroke: "none" }));
    facePoly(g, F, F.R, b, d / 2 - 0.3, 0.38, d / 2 + 0.3, 0.78, C.water);             // gable window
    const e = 0.16, ry = y + d / 2, zr = h + hr, ze = h - 0.06;
    poly(g, [F.p(x - 0.08, y - e, ze), F.p(x + w, y, h), F.p(x + w, ry, zr), F.p(x - 0.08, ry, zr)], mix(roof, "#000000", 0.2));   // the back slope meets the gable along its edge (no sliver past it)
    poly(g, [F.p(x + w, y, h), F.p(x + w, y + d, h), F.p(x + w, ry, zr)], C.w3);
    poly(g, [F.p(x - 0.08, y + d + e, ze), F.p(x + w + 0.08, y + d + e, ze), F.p(x + w + 0.08, ry, zr), F.p(x - 0.08, ry, zr)], roof);
    return b;
  }
  function car(g, F, x, y, col) {
    F.box(g, x, y, 0.12, 1.35, 0.62, 0.32, { left: col, right: shade(col), top: tint(col) });
    F.box(g, x + 0.3, y + 0.05, 0.44, 0.72, 0.52, 0.26, { left: C.water, right: shade(C.water), top: tint(col) });
    [x + 0.3, x + 1.05].forEach((cx) => disc(g, F, [cx, y + 0.62, 0.14], "y", 0.14, C.pv));
  }
  function truck(g, F, x, y) {
    F.box(g, x, y, 0.12, 1.7, 0.72, 0.85, { left: C.truck, right: shade(C.truck), top: tint(C.truck) });
    const cab = F.box(g, x + 1.75, y + 0.03, 0.12, 0.58, 0.66, 0.72, { left: C.w2, right: C.w3, top: C.w1 });
    facePoly(g, F, F.R, cab, 0.12, 0.38, 0.54, 0.64, C.water);
    [x + 0.3, x + 1.2, x + 2.05].forEach((cx) => disc(g, F, [cx, y + 0.72, 0.14], "y", 0.14, C.pv));
  }
  function charger(g, F, x, y) {
    const b = F.box(g, x, y, 0, 0.22, 0.3, 0.75, { left: C.w2, right: C.w3, top: C.w1 });
    facePoly(g, F, F.L, b, 0.05, 0.42, 0.17, 0.62, "#47B970");
    facePoly(g, F, F.L, b, 0.05, 0.42, 0.17, 0.62, "#B8F5CC", fxAttr("blink", Math.random() * 1.6, { stroke: "none" }));
  }
  function heatpump(g, F, x, y) {
    const b = F.box(g, x, y, 0, 0.62, 0.34, 0.5, { left: C.w2, right: C.w3, top: C.w1 });
    disc(g, F, [x + 0.31, y + 0.34, 0.25], "y", 0.17, C.g2);
    fan(g, F, [x + 0.31, y + 0.34, 0.25], "L", 0.14, 1.2 + Math.random() * 0.5);
    return b;
  }
  function tree(g, F, x, y, s) {
    s = s || 1;
    seg(g, F, [x, y, 0], [x, y, 0.6 * s], { "stroke-width": 2.4, stroke: "#6D5A56" });
    const c = F.p(x, y, 0.95 * s);
    el("circle", { cx: c[0], cy: c[1], r: 11 * s, fill: "#8CCB8E", stroke: INK, "stroke-width": THIN }, g);
  }
  function smoke(g, x, y, tone, sc) {
    const s = el("g", { class: "smoke" }, g);
    for (let k = 0; k < 4; k++) el("circle", { cx: x, cy: y, r: 5 * (sc || 1), fill: tone || "#C9C6C4", stroke: "#8F8784", "stroke-width": 0.8, class: "puff", style: `animation-delay:${-k * 0.8}s` }, s);
    return s;
  }
  // hyperboloid cooling tower with a true waist
  function coolingTower(g, F, cx, cy, r0, h) {
    const r = (t) => r0 * (0.64 + 0.36 * Math.pow((t - 0.74) / 0.74, 2));
    const RX = Math.SQRT2 * K.A, RY = Math.SQRT2 * K.B;
    const left = [], right = [];
    for (let k = 0; k <= 16; k++) { const t = k / 16, c = F.p(cx, cy, t * h), rr = r(t); left.push([c[0] - rr * RX, c[1]]); right.push([c[0] + rr * RX, c[1]]); }
    const b = F.p(cx, cy, 0), front = [];
    for (let k = 0; k <= 20; k++) { const a = Math.PI * (k / 20); front.push([b[0] + Math.cos(a) * r0 * RX, b[1] + Math.sin(a) * r0 * RY]); }
    poly(g, front.concat(left.slice(1), right.slice().reverse().slice(0, -1)), C.g1);
    const t = F.p(cx, cy, h), rt = r(1);
    el("ellipse", { cx: t[0], cy: t[1], rx: rt * RX, ry: rt * RY, fill: C.w1, stroke: INK, "stroke-width": SW }, g);
    el("ellipse", { cx: t[0], cy: t[1] + 1.5, rx: rt * RX * 0.8, ry: rt * RY * 0.72, fill: C.g3, stroke: INK, "stroke-width": THIN }, g);
    return t;
  }

  /* ---------------- the nine tiles ---------------- */
  const A = {};

  // Smarter wind and solar (supply): three turbines at the back, a solar array in front
  A.windsolar = (g, o, R) => {
    const F = frame(o, R.s || 1); R.cells = [];
    [[1.5, 2.2], [3.3, 0.9], [5.3, 1.5]].sort((a, b) => a[0] + a[1] - b[0] - b[1]).forEach(([x, y]) => turbine(g, F, x, y, 3.7));
    [3.9, 5.4].forEach((y) => [1.0, 2.75, 4.5].forEach((x) => panel(g, F, x, y, 1.55, 0.95, R.cells)));
    const inv = F.box(g, 6.45, 4.3, 0, 0.6, 0.5, 0.55, { left: C.w2, right: C.w3, top: C.w1 });
    facePoly(g, F, F.L, inv, 0.12, 0.2, 0.48, 0.4, C.g2);
    return R;
  };

  // Batteries (store): two containers and a transformer
  A.battery = (g, o, R) => {
    const F = frame(o, R.s || 1);
    [1.2, 2.95].forEach((y) => {
      const b = F.box(g, 1.0, y, 0, 3.8, 1.3, 1.35, { left: C.w2, right: C.w3, top: C.w1 });
      facePoly(g, F, F.L, b, 0.25, 0.18, 0.95, 1.12, C.t1);
      const c = F.L(b, 0.6, 0.65);
      el("path", { d: "M1 -8 L-3.5 1 L0 1 L-1 8 L3.5 -1 L0 -1 Z", transform: `translate(${f(c[0])} ${f(c[1])})`, fill: C.w1, stroke: INK, "stroke-width": 0.8 }, g);
      // a column of charge lights that fill from the bottom
      facePoly(g, F, F.L, b, 0.25, 0.18, 0.95, 1.12, "#E4FBF6", fxAttr("glow", y > 2 ? 2.5 : 0, { stroke: "none" }));
      [0, 1, 2, 3].forEach((k) => facePoly(g, F, F.L, b, 1.02, 0.2 + k * 0.23, 1.3, 0.38 + k * 0.23, "#47B970", fxAttr("led", k * 0.35 + (y > 2 ? 0.2 : 0), { "stroke-width": 0.7 })));
      let d = "";
      for (let k = 0; k < 8; k++) { const a = F.L(b, 1.35 + k * 0.3, 0.22), e = F.L(b, 1.35 + k * 0.3, 1.1); d += `M${f(a[0])} ${f(a[1])} L${f(e[0])} ${f(e[1])} `; }
      el("path", { d, stroke: INKL, "stroke-width": 0.9, fill: "none" }, g);
      [0.35, 0.95].forEach((u) => seg(g, F, [4.8, y + u, 0.1], [4.8, y + u, 1.2], { stroke: INKL }));
    });
    const t = F.box(g, 5.5, 2.3, 0, 0.95, 1.3, 0.85, { left: C.g1, right: C.g2, top: C.w1 });
    let d = "";
    for (let k = 0; k < 5; k++) { const a = F.L(t, 0.12 + k * 0.17, 0.12), e = F.L(t, 0.12 + k * 0.17, 0.72); d += `M${f(a[0])} ${f(a[1])} L${f(e[0])} ${f(e[1])} `; }
    el("path", { d, stroke: INKL, "stroke-width": 0.9, fill: "none" }, g);
    [0.35, 0.65, 0.95].forEach((v) => seg(g, F, [5.97, 2.3 + v, 0.85], [5.97, 2.3 + v, 1.15], { "stroke-width": 1.6 }));
    return R;
  };

  // Green hydrogen (store): electrolyser building and a horizontal hydrogen tank on saddles
  A.h2 = (g, o, R) => {
    const F = frame(o, R.s || 1);
    const b = F.box(g, 0.9, 1.4, 0, 2.3, 2.0, 1.7, { left: C.w2, right: C.w3, top: C.w1 });
    facePoly(g, F, F.L, b, 0.2, 0.25, 0.45, 1.45, "#A3D9A5");
    [0.75, 1.25, 1.75].forEach((u) => facePoly(g, F, F.L, b, u, 0.55, u + 0.32, 1.1, C.water));
    facePoly(g, F, F.R, b, 0.7, 0, 1.3, 1.05, C.g2);
    F.box(g, 1.3, 1.8, 1.7, 0.8, 0.7, 0.32, { left: C.g1, right: C.g2, top: C.w1 });
    { const v = F.p(1.7, 2.15, 2.05); [0, 1, 2].forEach((k) => el("circle", fxAttr("h2b", k * 0.9, { cx: f(v[0] + (k - 1) * 6), cy: f(v[1]), r: 4.6, fill: "#BFE8C1", stroke: C.t3, "stroke-width": 1.1 }), g)); }
    seg(g, F, [3.2, 2.5, 0.9], [4.1, 2.5, 0.9], { "stroke-width": 4 });
    [4.5, 6.3].forEach((x) => F.box(g, x, 1.95, 0, 0.32, 1.2, 0.4, { left: C.g2, right: C.g3, top: C.g1 }));
    const cap = F.cyl(g, [4.1, 2.55, 0.95], "x", 0.75, 2.8, { side: C.w2, cap: C.w1 });
    const cp = F.p(cap[0], cap[1], cap[2]);
    el("text", { x: cp[0], y: cp[1] + 5, "text-anchor": "middle", style: "font:600 15px Poppins,sans-serif", fill: C.t3, text: "H₂" }, g);
    return R;
  };

  // Pumped hydro (store): upper reservoir held by a dam, penstock, powerhouse, lower pond
  A.hydro = (g, o, R) => {
    const F = frame(o, R.s || 1);
    poly(g, [F.p(4.4, 3.4), F.p(7.3, 3.4), F.p(7.3, 6.9), F.p(4.4, 6.9)], C.water);
    [[5.0, 4.6], [5.8, 5.6]].forEach(([x, y], k) => seg(g, F, [x, y, 0], [x + 0.7, y, 0], fxAttr("ripple", k * 1.1, { stroke: C.water2, "stroke-width": 1.2 })));
    const hill = F.box(g, 0.7, 0.8, 0, 3.3, 3.2, 1.9, { left: "#DDE7D6", right: "#E7EAEE", top: C.water });
    facePoly(g, F, F.T, hill, 0.2, 0.2, 3.1, 3.0, "#B7DCF4");
    [[0.6, 1.4], [2.1, 0.7], [2.3, 2.3], [1.2, 2.7]].forEach(([u, v], k) => { const a = F.T(hill, u, v), e = F.T(hill, u + 0.35, v); line(g, [a, e], fxAttr("sparkle", k * 0.8, { stroke: "#FFFFFF", "stroke-width": 2.2 })); });
    [[0.8, 0.9], [1.5, 1.7], [0.9, 2.4]].forEach(([u, v], k) => { const a = F.T(hill, u, v), e = F.T(hill, u + 0.7, v); line(g, [a, e], fxAttr("ripple", k * 0.9 + 0.4, { stroke: C.water2, "stroke-width": 1.1 })); });
    [0.35, 1.05, 2.35].forEach((u) => facePoly(g, F, F.R, hill, u, 0, u + 0.22, 1.9, C.w1));   // dam buttresses
    const a1 = F.R(hill, 1.7, 1.9), a2 = F.R(hill, 1.7, 0.45), a3 = F.p(4.45, 2.5, 0.45);
    el("polyline", { points: pts([a1, a2, a3]), fill: "none", stroke: INK, "stroke-width": 7.6, "stroke-linejoin": "round" }, g);
    el("polyline", { points: pts([a1, a2, a3]), fill: "none", stroke: "#8CCBF2", "stroke-width": 5.4, "stroke-linejoin": "round" }, g);
    R.pipe = el("polyline", { points: pts([a1, a2, a3]), fill: "none", stroke: "#1E609C", "stroke-width": 2, "stroke-dasharray": "3 7", "stroke-linecap": "round", opacity: 0 }, g);
    const ph = F.box(g, 4.45, 1.2, 0, 1.5, 1.3, 0.95, { left: C.w2, right: C.w3, top: C.g1 });
    [0.25, 0.75].forEach((u) => facePoly(g, F, F.L, ph, u, 0.35, u + 0.35, 0.7, C.water));
    facePoly(g, F, F.R, ph, 0.45, 0, 0.9, 0.65, C.g2);
    return R;
  };

  // Long-duration storage, compressed air (store): pressure tank and plant building
  A.ldes = (g, o, R) => {
    const F = frame(o, R.s || 1);
    F.cyl(g, [2.3, 2.5, 0], "z", 1.3, 2.3, { side: C.tank, cap: C.tankTop });
    poly(g, F.circle([2.3, 2.5, 2.3], "z", 1.02, 36), mix(C.tankTop, "#FFFFFF", 0.4), { "stroke-width": THIN });
    // pressure gauge on the front of the tank, its needle rising and falling
    { const gc = F.p(2.3 + 0.9, 2.5 + 0.9, 1.35), gr = 11 * F.s / 0.8;
      el("circle", { cx: f(gc[0]), cy: f(gc[1]), r: f(gr), fill: "#FFFFFF", stroke: INK, "stroke-width": THIN }, g);
      el("path", { d: `M${f(gc[0] - gr * 0.7)} ${f(gc[1] + gr * 0.2)} A${f(gr * 0.72)} ${f(gr * 0.72)} 0 0 1 ${f(gc[0] + gr * 0.7)} ${f(gc[1] + gr * 0.2)}`, fill: "none", stroke: "#47B970", "stroke-width": 1.6 }, g);
      el("line", fxAttr("needle", 0, { x1: f(gc[0]), y1: f(gc[1]), x2: f(gc[0]), y2: f(gc[1] - gr * 0.72), stroke: "#E04B00", "stroke-width": 1.6, "stroke-linecap": "round", style: `transform-origin:${f(gc[0])}px ${f(gc[1])}px` }), g);
      el("circle", { cx: f(gc[0]), cy: f(gc[1]), r: 1.6, fill: INK }, g); }
    seg(g, F, [3.5, 3.5, 0.6], [4.15, 3.5, 0.6], { "stroke-width": 4.5 });
    seg(g, F, [3.5, 3.5, 0.6], [4.15, 3.5, 0.6], fxAttr("flowdash", 0, { stroke: "#FFFFFF", "stroke-width": 1.6, "stroke-dasharray": "2 5", "stroke-linecap": "round" }));
    const b = F.box(g, 4.15, 2.9, 0, 2.0, 1.8, 1.45, { left: C.t2, right: C.t3, top: C.t1 });
    [0.35, 0.8, 1.25].forEach((u) => facePoly(g, F, F.L, b, u, 0.2, u + 0.28, 1.1, C.t1));
    [0.35, 0.8, 1.25].forEach((u, k) => facePoly(g, F, F.L, b, u, 0.2, u + 0.28, 1.1, "#E9FFFA", fxAttr("glow", k * 1.6, { stroke: "none" })));
    facePoly(g, F, F.R, b, 0.55, 0, 1.15, 0.95, mix(C.t3, "#000000", 0.15));
    return R;
  };

  // Homes (shift): two houses, a heat pump, an EV on its drive, a tree
  A.homes = (g, o, R) => {
    const F = frame(o, R.s || 1);
    poly(g, [F.p(0.9, 3.25), F.p(3.2, 3.25), F.p(3.2, 4.5), F.p(0.9, 4.5)], "#E3E6EB", { "stroke-width": THIN });
    house(g, F, 1.0, 1.3, 2.2, 1.7, 1.15, 0.8, C.roof);
    house(g, F, 3.9, 0.9, 2.0, 1.6, 1.05, 0.75, "#B77464");
    heatpump(g, F, 4.6, 2.7);
    charger(g, F, 0.95, 3.45);
    car(g, F, 1.4, 3.55, C.car);
    tree(g, F, 6.5, 3.6, 1);
    tree(g, F, 5.7, 5.0, 0.8);
    const bp = F.p(2.1, 2.0, 3.2);
    const bub = el("g", { class: "bubble" }, g);
    el("circle", { cx: bp[0], cy: bp[1], r: 19, fill: "#fff", stroke: INK, "stroke-width": SW }, bub);
    el("ellipse", { cx: bp[0], cy: bp[1], rx: 11, ry: 8.5, fill: "#47B970", stroke: INK, "stroke-width": 1 }, bub);
    el("path", { d: `M${bp[0] - 6} ${bp[1] + 5} l-3 6 l7 -3.5 Z`, fill: "#47B970", stroke: INK, "stroke-width": 1 }, bub);
    el("circle", { cx: bp[0] + 12, cy: bp[1] - 12, r: 4.5, fill: "#E04B00", stroke: INK, "stroke-width": 1 }, bub);
    R.bubble = bub;
    return R;
  };

  // Factory (shift): hall with rooftop units, heat pumps, electric trucks at chargers
  A.factory = (g, o, R) => {
    const F = frame(o, R.s || 1);
    const b = F.box(g, 1.0, 1.4, 0, 3.6, 2.6, 1.9, { left: C.w2, right: C.w3, top: C.g1 });
    facePoly(g, F, F.T, b, 0.15, 0.15, 3.45, 2.45, C.w1);
    for (let k = 0; k < 5; k++) facePoly(g, F, F.L, b, 0.3 + k * 0.65, 1.05, 0.72 + k * 0.65, 1.5, C.water);
    facePoly(g, F, F.R, b, 0.8, 0, 1.8, 1.3, C.g2);
    [[1.5, 1.9], [2.6, 1.9]].forEach(([x, y]) => {
      const u = F.box(g, x, y, 1.9, 0.8, 0.8, 0.32, { left: C.g1, right: C.g2, top: C.w1 });
      disc(g, F, [x + 0.4, y + 0.4, 2.22], "z", 0.26, C.g2);
      fan(g, F, [x + 0.4, y + 0.4, 2.23], "T", 0.22, 1.4 + Math.random() * 0.6);
    });
    F.cyl(g, [3.9, 2.0, 1.9], "z", 0.13, 0.55, { side: C.g2, cap: C.g3 });
    [1.7, 2.5].forEach((y) => heatpump(g, F, 4.85, y));
    [5.0, 6.2].forEach((y) => { truck(g, F, 1.2, y); charger(g, F, 3.95, y + 0.2); });
    return R;
  };

  // Flexible fossil plant (supply): cooling tower, chimneys, boiler house
  A.fossil = (g, o, R) => {
    const F = frame(o, R.s || 1);
    const top = coolingTower(g, F, 2.0, 2.7, 1.35, 2.9);
    const c1 = F.cyl(g, [4.6, 1.3, 0], "z", 0.2, 3.1, { side: C.g1, cap: C.g3 });
    const c2 = F.cyl(g, [5.5, 1.3, 0], "z", 0.2, 2.7, { side: C.g1, cap: C.g3 });
    [[4.6, 2.55], [5.5, 2.15]].forEach(([x, z]) => F.cyl(g, [x, 1.3, z], "z", 0.205, 0.18, { side: "#E0785A", cap: "#E0785A" }));
    const b = F.box(g, 3.9, 2.0, 0, 2.7, 2.1, 1.45, { left: C.brick, right: C.brick2, top: C.g1 });
    for (let k = 0; k < 4; k++) for (let r = 0; r < 2; r++) facePoly(g, F, F.L, b, 0.2 + k * 0.62, 0.2 + r * 0.55, 0.62 + k * 0.62, 0.58 + r * 0.55, C.g3);
    facePoly(g, F, F.R, b, 0.6, 0, 1.3, 0.9, C.g3);
    const s1 = F.p(c1[0], c1[1], c1[2]), s2 = F.p(c2[0], c2[1], c2[2]);
    R.smoke = [smoke(g, s1[0], s1[1] - 3, "#9F9794"), smoke(g, s2[0], s2[1] - 3, "#9F9794"), smoke(g, top[0], top[1] - 4, "#F4F5F7", 1.3)];
    return R;
  };

  // The grid (share): substation platform, pylon, two transformers, control building
  A.hub = (g, o, R) => {
    const F = frame(o, R.s || 1);
    pylon(g, F, 2.6, 2.6, 3.0);   // incoming transmission line
    const tr = (x, y, w, d) => {
      const t = F.box(g, x, y, 0, w, d, 0.8, { left: C.g1, right: C.g2, top: C.w1 });
      let dd = "";
      for (let k = 0; k < 5; k++) { const a = F.L(t, 0.12 + k * (w - 0.24) / 4, 0.12), e = F.L(t, 0.12 + k * (w - 0.24) / 4, 0.68); dd += `M${f(a[0])} ${f(a[1])} L${f(e[0])} ${f(e[1])} `; }
      el("path", { d: dd, stroke: INKL, "stroke-width": 0.9, fill: "none" }, g);
      [0.3, 0.5, 0.7].forEach((v) => seg(g, F, [x + w / 2, y + d * v, 0.8], [x + w / 2, y + d * v, 1.13], { "stroke-width": 1.6 }));
    };
    tr(4.3, 1.8, 1.3, 1.0);
    tr(1.8, 4.3, 1.0, 1.3);
    const c = F.box(g, 4.4, 4.4, 0, 1.7, 1.4, 1.0, { left: C.w2, right: C.w3, top: C.w1 });
    facePoly(g, F, F.L, c, 0.3, 0, 0.7, 0.7, C.g2);
    facePoly(g, F, F.L, c, 1.0, 0.4, 1.45, 0.75, C.water);
    facePoly(g, F, F.R, c, 0.4, 0.4, 1.0, 0.75, C.water);
    return R;
  };

  // fluttering flags: each strip rides a travelling wave that grows away from the pole
  const FLAGS = [];
  if (window.gsap) gsap.ticker.add(() => {
    const tm = gsap.ticker.time;
    FLAGS.forEach((fl) => {
      if (!fl.outline.isConnected) return;
      const ys = [];
      for (let k = 0; k <= fl.N; k++) { const u = k / fl.N; ys.push(2.8 * u * Math.sin(tm * 5.2 - k * 0.75 + fl.ph)); }
      fl.strips.forEach((sg, k) => sg.setAttribute("transform", `translate(0 ${f((ys[k] + ys[k + 1]) / 2)})`));
      let d = "M0 " + f(ys[0]);
      for (let k = 1; k <= fl.N; k++) d += " L" + f(k * fl.W / fl.N) + " " + f(ys[k]);
      d += " L" + f(fl.W) + " " + f(ys[fl.N] + fl.H);
      for (let k = fl.N - 1; k >= 0; k--) d += " L" + f(k * fl.W / fl.N) + " " + f(ys[k] + fl.H);
      fl.outline.setAttribute("d", d + " Z");
    });
  });
  // Cross-border interconnector: the ellipse is split by a national border. On our side, the incoming line lands on a
  // converter station; across the border sits the neighbour's converter station and its wind farm. An interconnector
  // cable joins the two stations across the border, and carries its own pulses (R.cable, animated in network.js).
  A.neighbour = (g, o, R) => {
    const F = frame(o, R.s || 1);
    const cx = 2.0, cy = 3.6, rd = 3.3, by = 3.6;           // disc centre and radius (local units), border line y
    // the neighbour's half of the disc, a touch paler, so it reads as another country
    const far = [];
    const a0 = Math.asin((by - cy) / rd), a1 = Math.PI - a0;
    for (let i = 0; i <= 24; i++) { const a = a0 + (a1 - a0) * i / 24; far.push(F.p(cx + Math.cos(a) * rd, cy + Math.sin(a) * rd, 0)); }
    poly(g, far, "#FFFFFF", { stroke: "none", "fill-opacity": 0.5, class: "nb-far" });
    // the border: a dashed line with a post at each end
    const hx = Math.sqrt(rd * rd - (by - cy) * (by - cy)) - 0.45;
    seg(g, F, [cx - hx, by, 0], [cx + hx, by, 0], { stroke: "#3E4860", "stroke-width": 1.9, "stroke-dasharray": "6 4", "stroke-linecap": "butt" });
    [cx - hx, cx + hx].forEach((x) => { seg(g, F, [x, by, 0], [x, by, 0.55], { "stroke-width": 2.6, stroke: "#3E4860" }); });
    // the interconnector cable, on the ground, crossing the border
    // it runs on the same straight axis as the line coming in from the substation, so the flow reads as one line
    const kx = cx, yA = 4.5, yB = 2.45;
    // drawn in the same dotted style and weight as every other connector on the board
    const LINE = { stroke: "#1E609C", "stroke-width": 3, "stroke-dasharray": "0.1 7", "stroke-linecap": "round" };
    seg(g, F, [kx, cy - rd, 0], [kx, 1.5, 0], LINE);
    seg(g, F, [kx, yA, 0], [kx, yB, 0], LINE);
    R.cable = [F.p(kx, yA, 0), F.p(kx, yB, 0)];              // from their station to ours
    // a converter station: a hall with a row of bushings on the roof
    const conv = (x, y, w, d, far) => {
      const b = F.box(g, x, y, 0, w, d, 0.95, far ? { left: C.g1, right: C.g2, top: C.w1 } : { left: C.w2, right: C.w3, top: C.w1 });
      [0.25, 0.5, 0.75].forEach((u) => facePoly(g, F, F.L, b, u * w - 0.12, 0.12, u * w + 0.12, 0.7, far ? C.g2 : C.g3));
      [0.3, 0.7].forEach((u) => { seg(g, F, [x + u * w, y + d * 0.5, 0.95], [x + u * w, y + d * 0.5, 1.35], { "stroke-width": 1.8 }); });
      return b;
    };
    // a flag on a pole, standing on a converter station's roof (z = roof height). The cloth is cut into thin vertical
    // strips that ripple in a wave (see the flag ticker below), so the flag flutters. Designs are invented, not national flags.
    const flag = (x, y, z, design) => {
      seg(g, F, [x, y, z], [x, y, z + 2.1], { "stroke-width": 2.4, stroke: "#3E4860" });
      const t = F.p(x, y, z + 2.1);
      const gF = el("g", { transform: `translate(${f(t[0] + 1)} ${f(t[1] - 1)})` }, g);
      const N = 12, W = 34, H = 23, strips = [];
      for (let k = 0; k < N; k++) {
        const sg = el("g", null, gF), x0 = k * W / N, u = (k + 0.5) / N;
        if (design.hoist && u < design.hoist[0]) el("rect", { x: f(x0), y: 0, width: f(W / N + 0.6), height: H, fill: design.hoist[1] }, sg);
        else design.bands.forEach(([v0, v1, col]) => el("rect", { x: f(x0), y: f(v0 * H), width: f(W / N + 0.6), height: f((v1 - v0) * H + 0.3), fill: col }, sg));
        strips.push(sg);
      }
      const outline = el("path", { fill: "none", stroke: INK, "stroke-width": THIN, "stroke-linejoin": "round" }, gF);
      FLAGS.push({ strips, outline, N, W, H, ph: Math.random() * 6 });
    };
    const OURS = { bands: [[0, 0.46, "#3B82C4"], [0.46, 0.56, "#FFFFFF"], [0.56, 1, "#9ED9CF"]] };
    const THEIRS = { hoist: [0.3, "#F2C46B"], bands: [[0, 0.42, "#D05A5A"], [0.42, 0.58, "#FFFFFF"], [0.58, 1, "#D05A5A"]] };
    pylon(g, F, cx, 0.8, 2.4);                                 // the line lands on a pylon behind our station
    conv(1.3, 1.5, 1.4, 0.95, false);                          // our converter station, on the line
    flag(1.45, 2.25, 0.95, OURS);                              // our flag, on the front of our station's roof, clear of the pylon
    turbine(g, F, 0.45, 5.35, 1.7);                            // the neighbour's wind
    conv(1.35, 4.5, 1.3, 0.9, true);                           // their converter station, on the same line
    flag(1.55, 4.75, 0.95, THEIRS);                            // their flag, on their station
    return R;
  };


  // Wind farm (supply): three turbines, centred on the local origin
  A.wind = (g, o, R) => {
    const F = frame(o, R.s || 1);
    [[-1.6, 0.4], [0.1, -1.1], [1.5, 0.9]].sort((a, b) => a[0] + a[1] - b[0] - b[1]).forEach(([x, y]) => turbine(g, F, x, y, 3.8));
    return R;
  };
  // Solar farm (supply): two rows of panels and an inverter
  A.solar = (g, o, R) => {
    const F = frame(o, R.s || 1); R.cells = [];
    [-1.3, 0.2].forEach((y) => [-2.5, -0.75, 1.0].forEach((x) => panel(g, F, x, y, 1.55, 0.95, R.cells)));
    const inv = F.box(g, 2.8, -0.6, 0, 0.6, 0.5, 0.55, { left: C.w2, right: C.w3, top: C.w1 });
    facePoly(g, F, F.L, inv, 0.12, 0.2, 0.48, 0.4, C.g2);
    return R;
  };
  // Distribution substation: small pad, transformer, busbar gantry
  A.dsub = (g, o, R) => {
    const F = frame(o, R.s || 1);
    pylon(g, F, -0.1, -1.4, 2.8);   // the line comes in on a pylon at the back
    // two transformers side by side with bushings
    [[-1.3, -0.5], [0.2, -0.5]].forEach(([x, y]) => {
      const t = F.box(g, x, y, 0, 1.1, 0.9, 0.75, { left: C.g1, right: C.g2, top: C.w1 });
      let dd = "";
      for (let k = 0; k < 4; k++) { const a = F.L(t, 0.15 + k * 0.27, 0.1), e = F.L(t, 0.15 + k * 0.27, 0.62); dd += `M${f(a[0])} ${f(a[1])} L${f(e[0])} ${f(e[1])} `; }
      el("path", { d: dd, stroke: INKL, "stroke-width": 0.9, fill: "none" }, g);
      [0.3, 0.6].forEach((v) => seg(g, F, [x + 0.55, y + v * 0.9, 0.75], [x + 0.55, y + v * 0.9, 1.05], { "stroke-width": 1.6 }));
    });
    return R;
  };
  // Commercial district: office tower, shops, EV charging canopy
  A.commercial = (g, o, R) => {
    const F = frame(o, R.s || 1);
    const tw = F.box(g, -2.0, -2.0, 0, 1.6, 1.6, 3.6, { left: C.w2, right: C.w3, top: C.w1 });
    for (let r = 0; r < 6; r++) {
      facePoly(g, F, F.L, tw, 0.18, 0.4 + r * 0.52, 1.42, 0.7 + r * 0.52, C.water);
      facePoly(g, F, F.L, tw, 0.18, 0.4 + r * 0.52, 1.42, 0.7 + r * 0.52, "#FFE6A3", fxAttr("glow", (r * 1.3) % 5.5, { stroke: "none" }));
      facePoly(g, F, F.R, tw, 0.18, 0.4 + r * 0.52, 1.42, 0.7 + r * 0.52, mix(C.water, "#000000", 0.08));
    }
    const sh = F.box(g, 0.1, -1.7, 0, 2.2, 1.5, 1.1, { left: C.w2, right: C.w3, top: C.g1 });
    facePoly(g, F, F.L, sh, 0.2, 0, 2.0, 0.55, C.water);
    facePoly(g, F, F.L, sh, 0.1, 0.72, 2.1, 0.95, "#E5C189");
    // EV charging canopy with two cars parked in front of it
    [0.3, 1.9].forEach((x) => seg(g, F, [x, 0.35, 0], [x, 0.35, 1.0], { "stroke-width": 1.8, stroke: C.g3 }));
    poly(g, [F.p(-0.2, 0.15, 1.02), F.p(2.4, 0.15, 1.02), F.p(2.4, 0.85, 1.02), F.p(-0.2, 0.85, 1.02)], C.w1);
    car(g, F, -0.1, 1.05, C.car);
    car(g, F, 1.35, 1.05, "#E5C189");
    const cz = F.p(1.1, 0.5, 1.03);
    el("path", { d: "M1 -5 L-2.5 0.8 L0 0.8 L-1 5 L2.5 -0.8 L0 -0.8 Z", transform: `translate(${f(cz[0])} ${f(cz[1])})`, fill: "#47B970", stroke: INK, "stroke-width": 0.8 }, g);
    el("path", fxAttr("blink", 0.4, { d: "M1 -5 L-2.5 0.8 L0 0.8 L-1 5 L2.5 -0.8 L0 -0.8 Z", transform: `translate(${f(cz[0])} ${f(cz[1])})`, fill: "#B8F5CC", stroke: "none" }), g);
    return R;
  };
  // A second residential street: three houses
  A.suburb = (g, o, R) => {
    const F = frame(o, R.s || 1);
    house(g, F, -2.4, -1.2, 1.6, 1.4, 1.0, 0.7, "#B77464");
    house(g, F, -0.3, -1.5, 1.6, 1.4, 1.0, 0.7, C.roof);
    house(g, F, 1.8, -1.2, 1.6, 1.4, 1.0, 0.7, "#8C6F9E");
    tree(g, F, -1.2, 1.2, 0.8); tree(g, F, 1.2, 1.4, 0.8);
    return R;
  };

  // local centre (ground units) and footprint radius of each drawing, used to stand it on its ellipse
  const LC = {
    wind: [0, 0, 2.6], solar: [0.3, 0, 3.1], battery: [3.7, 2.7, 3.2], h2: [3.9, 2.5, 3.3], hydro: [4.0, 3.8, 3.9],
    ldes: [3.6, 3.0, 3.0], homes: [3.7, 3.0, 3.4], factory: [3.3, 4.1, 3.6], fossil: [3.6, 2.6, 3.4], hub: [4.1, 4.1, 2.6],
    neighbour: [2.0, 3.6, 2.8], dsub: [-0.05, -0.3, 2.0], commercial: [0.2, 0, 3.0], suburb: [0, 0, 3.0]
  };
  // draw asset `name` so its footprint centre stands on ground point c, at scale s
  function draw(name, g, c, s) {
    s = s || 1;
    const lc = LC[name] || [0, 0];
    FXT = [];
    const R = A[name](g, [c[0] - lc[0] * s, c[1] - lc[1] * s], { s });
    R.fx = FXT; FXT = [];
    return R;
  }

  window.ISO = { draw, LC, ground, boardSlab, seamsPath, mixHex, K, P, C, frame, hull, poly, line, pts, dPath, piece, slot, pieceOutline, CELL, A, tweens, house, pylon, pole, turbine, panel };
})();
