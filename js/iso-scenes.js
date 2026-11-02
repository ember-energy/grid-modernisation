/* isometric, straight-edged scenes in the CleanFlex component style.
   Built on js/iso.js (the CleanFlex isometric kit: flat fills, fine black outline). One continuous landscape per scene,
   no ellipses or dotted links. Scenes not converted yet keep their side-on drawings with a clean finish (js/clean.js). */
(function () {
  if (!window.CLEAN) return;
  const { el } = SVG;
  const { C } = ISO;
  const beat = KIT.beat, hold = (tl, n) => tl.to({}, { duration: 0.001 }, n + 0.1);
  const SKY = [["0", "#FDFEFF"], ["0.6", "#E2EDF7"], ["1", "#CCDEEE"]];
  function sky(svg, id, stops, box) {
    const defs = svg.ownerSVGElement ? svg.ownerSVGElement.querySelector("defs") : (svg.querySelector("defs") || el("defs", null, svg));
    const lg = el("linearGradient", { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    (stops || SKY).forEach(([o, c]) => el("stop", { offset: o, "stop-color": c }, lg));
    box = box || [-400, -400, 2400, 1700];
    return el("rect", { x: box[0], y: box[1], width: box[2], height: box[3], fill: `url(#${id})` }, svg);
  }
  const shade = (h) => ISO.mixHex(h, "#000000", 0.16), lite = (h) => ISO.mixHex(h, "#FFFFFF", 0.35);
  const P = (x, y, z) => ISO.P(x, y, z);
  const F = ISO.frame([0, 0], 1);
  let UID = 0;

  /* ======================= the drawing kit (all in the iso kit's ground units) ======================= */
  const K = {
    quad: (g, pts, fill, extra) => ISO.poly(g, pts.map(([x, y, z]) => P(x, y, z || 0)), fill, extra),
    rect: (g, x0, y0, x1, y1, fill, sw) => K.quad(g, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], fill, { "stroke-width": sw == null ? 0.8 : sw }),
    seg: (g, a, b, col, w, extra) => { const p = P(...a), q = P(...b); return el("path", Object.assign({ d: `M${p[0]} ${p[1]} L${q[0]} ${q[1]}`, stroke: col, "stroke-width": w || 1, fill: "none" }, extra || {}), g); },
    lineGX: (g, y, x0, x1, z, col, w) => K.seg(g, [x0, y, z || 0], [x1, y, z || 0], col, w),
    lineGY: (g, x, y0, y1, z, col, w) => K.seg(g, [x, y0, z || 0], [x, y1, z || 0], col, w),
    // a tree: a short tapering trunk under an irregular, layered canopy (kind: "dark", "pine", "round"; col overrides the leaf colour)
    tree(g, x, y, s, kind, col) {
      s = s || 1; const seed = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
      const b = P(x, y, 0), t = P(x, y, (kind === "pine" ? 0.35 : 0.6) * s);
      el("path", { d: `M${(b[0] - 2.2 * s).toFixed(1)} ${b[1].toFixed(1)} L${(t[0] - 1.1 * s).toFixed(1)} ${t[1].toFixed(1)} L${(t[0] + 1.1 * s).toFixed(1)} ${t[1].toFixed(1)} L${(b[0] + 2.2 * s).toFixed(1)} ${b[1].toFixed(1)} Z`, fill: "#7E6150" }, g);
      if (kind === "pine") {
        const c1 = col || "#4E9A63", c2 = ISO.mixHex(c1, "#000000", 0.18);
        [[0.3, 13, 1.3], [0.85, 10.5, 1.1], [1.35, 7.5, 0.9]].forEach(([z, w, h], i) => { const c = P(x, y, z * s), top = c[1] - h * 20 * s, wv = (k) => (k % 2 ? 1.5 : 0) * s;
          let d = `M${c[0]} ${top.toFixed(1)} L${(c[0] + w * s).toFixed(1)} ${(c[1] + 3 * s).toFixed(1)}`; for (let k = 1; k < 6; k++) d += ` L${(c[0] + w * s - (2 * w * s * k) / 6).toFixed(1)} ${(c[1] + 3 * s + wv(k)).toFixed(1)}`; d += ` L${(c[0] - w * s).toFixed(1)} ${(c[1] + 3 * s).toFixed(1)} Z`;
          el("path", { d, fill: c1 }, g); el("path", { d: `M${c[0]} ${top.toFixed(1)} L${(c[0] + w * s).toFixed(1)} ${(c[1] + 3 * s).toFixed(1)} L${c[0] + 1} ${(c[1] + 3 * s).toFixed(1)} Z`, fill: c2, "data-nostroke": "" }, g); });
        return;
      }
      const c1 = col || (kind === "dark" ? "#5FA36A" : "#7DBB7E"), c2 = ISO.mixHex(c1, "#000000", 0.17), c3 = ISO.mixHex(c1, "#FFFFFF", 0.22);
      const c = P(x, y, 1.0 * s), R = (kind === "round" ? 12 : 13.5) * s, ry = 1.08;
      const blob = (cx, cy, r, n, amp, ph) => { const pts = []; for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2, rr = r * (1 + amp * Math.sin(a * 5 + ph) + amp * 0.5 * Math.sin(a * 3 + ph * 2)); pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * ry]); }
        let d = ""; pts.forEach((p, k) => { const q = pts[(k + 1) % n], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2]; d += (k ? " Q" : `M${((pts[n - 1][0] + p[0]) / 2).toFixed(1)} ${((pts[n - 1][1] + p[1]) / 2).toFixed(1)} Q`) + `${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`; }); return d + " Z"; };
      el("path", { d: blob(c[0], c[1], R, 14, 0.09, seed * 6), fill: c1 }, g);
      el("path", { d: blob(c[0] + R * 0.28, c[1] + R * 0.3, R * 0.62, 10, 0.1, seed * 9), fill: c2, "data-nostroke": "" }, g);
      el("path", { d: blob(c[0] - R * 0.3, c[1] - R * 0.32, R * 0.42, 9, 0.12, seed * 4), fill: c3, "data-nostroke": "" }, g);
      [[-0.15, 0.1], [0.3, -0.25], [0.05, 0.45]].forEach(([dx, dy]) => el("path", { d: `M${(c[0] + dx * R - 3 * s).toFixed(1)} ${(c[1] + dy * R).toFixed(1)} q${3 * s} ${-3 * s} ${6 * s} 0`, stroke: c2, "stroke-width": 1, fill: "none" }, g));
    },
    // a block with rows of windows; roof: pv | garden | plant | none
    tower(g, x, y, w, d, h, body, glass, roof, o) {
      o = o || {};
      const b = F.box(g, x, y, 0, w, d, h, { left: body, right: shade(body), top: lite(body) });
      if (!o.noShop) F.face(g, F.L, b, 0.1, 0, w - 0.1, 0.42, shade(glass), { "stroke-width": 0.8 });
      const fl = o.floor || 0.62;
      for (let z = o.noShop ? 0.3 : 0.75; z < h - 0.3; z += fl) {
        if (o.punched) {
          for (let u = 0.25; u < w - 0.3; u += 0.55) F.face(g, F.L, b, u, z, u + 0.3, z + 0.34, glass, { "stroke-width": 0.6 });
          for (let u = 0.25; u < d - 0.3; u += 0.55) F.face(g, F.R, b, u, z, u + 0.3, z + 0.34, shade(glass), { "stroke-width": 0.6 });
        } else {
          F.face(g, F.L, b, 0.18, z, w - 0.18, z + 0.32, glass, { "stroke-width": 0.6 });
          F.face(g, F.R, b, 0.18, z, d - 0.18, z + 0.32, shade(glass), { "stroke-width": 0.6 });
        }
      }
      if (roof === "pv") K.pvRoof(g, x, y, h, w, d);
      if (roof === "garden") F.face(g, F.T, b, 0.2, 0.2, w - 0.2, d - 0.2, "#A9D69B", { "stroke-width": 0.8 });
      if (roof === "plant") { F.box(g, x + 0.4, y + 0.4, h, w * 0.4, d * 0.35, 0.35, { left: C.w2, right: C.w3, top: C.w1 }); F.box(g, x + w * 0.55, y + d * 0.5, h, 0.4, 0.4, 0.5, { left: C.w2, right: C.w3, top: C.w1 }); }
      return b;
    },
    // a solar module on any flat or sloping quad (corners a, b, c, d in ground units, a→b along the rows):
    // a pale aluminium frame, dark blue cells with a fine silver grid, and a soft sky reflection across one corner
    pvQuad(g, a, b, c, d, nu, nv) {
      const L = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
      const at = (u, v) => L(L(a, b, u), L(d, c, u), v);
      K.quad(g, [a, b, c, d], "#C9D1DA", { "stroke-width": 0.6 });
      const m = 0.06, A = at(m, m), B = at(1 - m, m), Cc = at(1 - m, 1 - m), D = at(m, 1 - m), at2 = (u, v) => L(L(A, B, u), L(D, Cc, u), v);
      K.quad(g, [A, B, Cc, D], "#22345A", { "stroke-width": 0.4 });
      let dd = ""; const seg = (p, q) => { const P1 = P(...p), P2 = P(...q); dd += `M${P1[0].toFixed(1)} ${P1[1].toFixed(1)} L${P2[0].toFixed(1)} ${P2[1].toFixed(1)} `; };
      for (let i = 1; i < nu; i++) seg(at2(i / nu, 0), at2(i / nu, 1));
      for (let j = 1; j < nv; j++) seg(at2(0, j / nv), at2(1, j / nv));
      el("path", { d: dd, stroke: "#5A78A8", "stroke-width": 0.5, fill: "none", "data-keepstroke": "" }, g);
      K.quad(g, [at2(0.62, 0), at2(1, 0), at2(1, 0.45)], "#9FC3E8", { "fill-opacity": 0.22, stroke: "none", "data-nostroke": "" });
    },
    // a flat roof covered with rows of modules, tilted up towards the sun, with gaps for maintenance
    pvRoof(g, x, y, z, w, d) {
      const mw = 0.9, md = 0.5, gx = 0.08, gy = 0.16, tilt = 0.12;
      for (let yy = y + 0.2; yy + md <= y + d - 0.15; yy += md + gy)
        for (let xx = x + 0.2; xx + mw <= x + w - 0.15; xx += mw + gx)
          K.pvQuad(g, [xx, yy + md, z + 0.04], [xx + mw, yy + md, z + 0.04], [xx + mw, yy, z + 0.04 + tilt], [xx, yy, z + 0.04 + tilt], 4, 2);
    },
    // a wheel on a vehicle's visible side: a dark tyre and a light hub
    wheel(g, x, y, z, r, axis) { ISO.poly(g, F.circle([x, y, z], axis || "y", r, 16), "#262C3A", { "stroke-width": 1 }); ISO.poly(g, F.circle([x, y, z], axis || "y", r * 0.45, 10), "#B9C1CC", { "stroke-width": 0.6 }); },
    car(g, x, y, col, dir, len) {
      len = len || 1.2; const W = 0.58, r = 0.13;
      if (dir === "y") { F.box(g, x, y, 0.1, W, len, 0.3, { left: col, right: shade(col), top: lite(col) }); [0.25, len - 0.25].forEach((v) => K.wheel(g, x + W, y + v, r, r, "x")); F.box(g, x + 0.05, y + len * 0.25, 0.4, W - 0.1, len * 0.5, 0.24, { left: C.water, right: shade(C.water), top: lite(col) }); }
      else { F.box(g, x, y, 0.1, len, W, 0.3, { left: col, right: shade(col), top: lite(col) }); [0.25, len - 0.25].forEach((u) => K.wheel(g, x + u, y + W, r, r, "y")); F.box(g, x + len * 0.25, y + 0.05, 0.4, len * 0.5, W - 0.1, 0.24, { left: C.water, right: shade(C.water), top: lite(col) }); }
    },
    oldCar(g, x, y, col) {
      F.box(g, x, y, 0.12, 1.4, 0.58, 0.28, { left: col, right: shade(col), top: lite(col) });
      [0.28, 1.12].forEach((u) => K.wheel(g, x + u, y + 0.58, 0.14, 0.14, "y"));
      F.box(g, x + 0.35, y + 0.07, 0.4, 0.6, 0.44, 0.22, { left: "#F1F2F4", right: C.w3, top: lite(col) });
    },
    bus(g, x, y, col, axis) {   // an electric bus, 2.8 long, along gx (or gy)
      col = col || "#47B970";
      if (axis === "y") {
        const b = F.box(g, x, y, 0.12, 0.62, 2.8, 0.8, { left: shade(col), right: col, top: "#F1F2F4" }); [0.45, 2.3].forEach((v) => K.wheel(g, x + 0.62, y + v, 0.15, 0.15, "x"));
        for (let k = 0; k < 6; k++) F.face(g, F.R, b, 0.2 + k * 0.42, 0.42, 0.52 + k * 0.42, 0.7, C.water, { "stroke-width": 0.6 });
        F.face(g, F.L, b, 0.08, 0.38, 0.54, 0.72, C.water, { "stroke-width": 0.6 });
        return b;
      }
      const b = F.box(g, x, y, 0.12, 2.8, 0.62, 0.8, { left: col, right: shade(col), top: "#F1F2F4" }); [0.45, 2.3].forEach((u) => K.wheel(g, x + u, y + 0.62, 0.15, 0.15, "y"));
      for (let k = 0; k < 6; k++) F.face(g, F.L, b, 0.2 + k * 0.42, 0.42, 0.52 + k * 0.42, 0.7, C.water, { "stroke-width": 0.6 });
      F.face(g, F.R, b, 0.08, 0.38, 0.54, 0.72, C.water, { "stroke-width": 0.6 });
      return b;
    },
    charger(g, x, y) {
      const b = F.box(g, x, y, 0, 0.2, 0.26, 0.7, { left: C.w2, right: C.w3, top: C.w1 });
      F.face(g, F.L, b, 0.04, 0.38, 0.16, 0.58, "#47B970", { "stroke-width": 0.5 });
      F.face(g, F.L, b, 0.04, 0.38, 0.16, 0.58, "#B8F5CC", { stroke: "none", class: "fx anim blink", style: `animation-delay:${(Math.random() * 1.6).toFixed(2)}s` });
    },
    // a mountain: an irregular, faceted cone — a ring of base points, a ring of shoulders, a peak — each face shaded by the light, with snow near the top
    mountain(g, cx, cy, r, h, o) {
      o = o || {}; const col = o.col || "#9DB0C2", n = 9, seed = (cx * 7.3 + cy * 3.1) % 1, rnd = (k) => { const v = Math.sin((k + 1) * 12.9898 + seed * 78.233) * 43758.5453; return v - Math.floor(v); };
      const ring = (rad, z, jit) => Array.from({ length: n }, (_, k) => { const a = (k / n) * Math.PI * 2 + seed; const rr = rad * (1 - jit + 2 * jit * rnd(k + z * 10)); return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, z * (1 - 0.18 * rnd(k + 40))]; });
      const base = ring(r, 0, 0.18), mid = ring(r * (o.dome ? 0.72 : 0.5), h * (o.dome ? 0.68 : 0.5), 0.25), top = [cx + (rnd(77) - 0.5) * r * 0.3, cy + (rnd(78) - 0.5) * r * 0.3, h];
      const faces = [];
      for (let k = 0; k < n; k++) { const k2 = (k + 1) % n; faces.push([base[k], base[k2], mid[k2]], [base[k], mid[k2], mid[k]], [mid[k], mid[k2], top]); }
      const L = [0.25, 0.75, 0.9], ln = Math.hypot(...L), sn = o.snow == null ? 0.72 : o.snow;
      faces.forEach((f) => {
        const u = [f[1][0] - f[0][0], f[1][1] - f[0][1], f[1][2] - f[0][2]], v = [f[2][0] - f[0][0], f[2][1] - f[0][1], f[2][2] - f[0][2]];
        let nx = u[1] * v[2] - u[2] * v[1], ny = u[2] * v[0] - u[0] * v[2], nz = u[0] * v[1] - u[1] * v[0]; const nl = Math.hypot(nx, ny, nz) || 1; nx /= nl; ny /= nl; nz /= nl;
        const fc = [(f[0][0] + f[1][0] + f[2][0]) / 3 - cx, (f[0][1] + f[1][1] + f[2][1]) / 3 - cy, (f[0][2] + f[1][2] + f[2][2]) / 3 - h * 0.25];
        if (nx * fc[0] + ny * fc[1] + nz * fc[2] < 0) { nx = -nx; ny = -ny; nz = -nz; }   // point the normal outwards
        if (nx + ny + nz <= 0.02) return;   // facing away
        const lit = Math.max(0, (nx * L[0] + ny * L[1] + nz * L[2]) / ln), zc = (f[0][2] + f[1][2] + f[2][2]) / 3;
        const snow = sn < 1 && zc > h * sn, c = snow ? ISO.mixHex("#FFFFFF", "#B9C7D6", 1 - lit) : ISO.mixHex(col, "#000000", 0.38 * (1 - lit));
        K.quad(g, f, c, { stroke: c, "stroke-width": 0.6, "data-nostroke": "" });
      });
      const pts = base.concat(mid, [top]).map((q) => P(q[0], q[1], q[2]));
      el("polygon", { points: ISO.pts(ISO.hull(pts)), fill: "none", stroke: "#000", "stroke-width": 1, "vector-effect": "non-scaling-stroke" }, g);
    },
    // a person, about 1.75 m tall: shoes, legs, a torso with arms, a neck, a head and hair (o: top, dress, hat, cap, phone, bag, walk, idle, sit)
    person(g, x, y, o) {
      o = o || {}; const k = UID++;
      const TOPS = ["#47B970", "#4AB4D6", "#E5C189", "#E0785A", "#8C6F9E", "#FFCD00", "#3E4860", "#F1F2F4", "#B5302E"], SKIN = ["#F2C9A8", "#D9A57E", "#B07A55", "#7A5238"],
        HAIR = ["#3E2A22", "#1E1A18", "#C99A5B", "#7A4A2A", "#B9B4AE"], TROU = ["#3E4860", "#2B3550", "#5B4A42", "#626E88"];
      const top = o.top || TOPS[k % TOPS.length], skin = o.skin || SKIN[(k * 7) % 4], hair = HAIR[(k * 3) % 5], trou = o.trou || TROU[k % 4];
      const f = P(x, y, 0), sit = o.sit, ln = { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" };
      const pg = el("g", { transform: `translate(${f[0].toFixed(1)} ${f[1].toFixed(1)})` }, g);
      const body = el("g", null, pg);
      const limbs = [];
      if (o.seat) {   // sitting on a chair: thighs forward, shins straight down, feet on the floor
        [-1.0, 1.0].forEach((dx) => el("path", Object.assign({ d: `M${dx} -4.6 L${dx + 0.4} -2.6 L${dx + 0.4} 0`, stroke: trou, "stroke-width": 2.0 }, ln), body));
      } else if (sit) {   // a cyclist: thighs forward, shins down to the pedals
        el("path", Object.assign({ d: "M-0.4 -7.2 L2.4 -6.4 L2.0 -2.6", stroke: trou, "stroke-width": 2.2 }, ln), body);
        el("path", Object.assign({ d: "M1.4 -2.4 L3.2 -2.4", stroke: "#22262E", "stroke-width": 1.5 }, ln), body);
      } else {
        const hipY = o.dress ? -5.0 : -7.4;
        [-1.05, 1.05].forEach((dx) => {
          const lg = el("g", null, body);
          el("path", Object.assign({ d: `M${dx} ${hipY} L${dx} -0.9`, stroke: o.dress ? skin : trou, "stroke-width": o.dress ? 1.3 : 2.1 }, ln), lg);
          el("path", Object.assign({ d: `M${dx - 0.5} -0.6 L${dx + 1.0} -0.6`, stroke: "#22262E", "stroke-width": 1.5 }, ln), lg);
          lg.setAttribute("transform-origin", `${dx} ${hipY}`); limbs.push(lg);
        });
      }
      const sy = o.seat ? -10.6 : sit ? -13.0 : -13.6, hy = o.seat ? -4.6 : sit ? -6.9 : -7.2;   // shoulders, hips
      const tilt = sit && !o.seat ? 14 : 0, tor = el("g", { transform: tilt ? `rotate(${tilt} 0 ${hy})` : null }, body);
      const arms = [];
      [-1, 1].forEach((s) => {   // the far arm is drawn behind the torso
        const ag = el("g", null, s < 0 ? tor : null);
        const hand = o.seat ? [s * 1.6, sy + 4.4] : sit ? [3.6, -10.4] : [s * 2.9, -8.4];
        el("path", Object.assign({ d: `M${s * 2.1} ${sy + 0.5} L${hand[0]} ${hand[1]}`, stroke: top, "stroke-width": 1.8 }, ln), ag);
        el("circle", { cx: hand[0], cy: hand[1] + 0.3, r: 0.85, fill: skin }, ag);
        ag.setAttribute("transform-origin", `${s * 2.1} ${sy + 0.5}`); arms.push(ag);
      });
      const tp = o.dress ? `M-2.4 ${sy} Q0 ${sy - 0.9} 2.4 ${sy} L3.5 -4.4 Q0 -3.8 -3.5 -4.4 Z` : `M-2.4 ${sy} Q0 ${sy - 0.9} 2.4 ${sy} L2.2 ${hy} L-2.2 ${hy} Z`;
      el("path", { d: tp, fill: top, stroke: "#000", "stroke-width": 0.55, "stroke-linejoin": "round" }, tor);
      if (o.bag) el("rect", { x: -3.9, y: sy + 3, width: 1.8, height: 2.6, fill: "#8F6B4E", stroke: "#000", "stroke-width": 0.4 }, tor);
      tor.appendChild(arms[1]);
      el("rect", { x: -0.7, y: sy - 1.5, width: 1.4, height: 1.8, fill: skin }, tor);
      const hc = sy - 3.5;
      if (o.dress || o.long) el("path", { d: `M-2.5 ${hc} L-2.7 ${hc + 3.4} L2.7 ${hc + 3.4} L2.5 ${hc} Z`, fill: hair }, tor);
      el("circle", { cx: 0, cy: hc, r: 2.35, fill: skin, stroke: "#000", "stroke-width": 0.55 }, tor);
      el("path", { d: `M-2.45 ${hc + 0.2} A2.45 2.45 0 1 1 2.45 ${hc + 0.2} Q1.4 ${hc - 1.2} -2.45 ${hc + 0.2} Z`, fill: hair }, tor);
      if (o.hat) el("path", { d: `M-3.6 ${hc - 1.6} L3.6 ${hc - 1.6} M-2.1 ${hc - 1.6} L-2.0 ${hc - 4.6} L2.0 ${hc - 4.6} L2.1 ${hc - 1.6} Z`, fill: "#262C3A", stroke: "#000", "stroke-width": 0.9 }, tor);
      if (o.bonnet) el("path", { d: `M-2.9 ${hc + 1} Q-3 ${hc - 3.2} 0 ${hc - 3} Q3 ${hc - 3.2} 2.9 ${hc + 1} Z`, fill: "#F1F2F4", stroke: "#000", "stroke-width": 0.5 }, tor);
      if (o.cap) el("path", { d: `M-2.5 ${hc - 0.6} Q0 ${hc - 3.6} 2.5 ${hc - 0.6} L3.8 ${hc - 0.4} Z`, fill: o.cap, stroke: "#000", "stroke-width": 0.5 }, tor);
      if (o.phone) el("rect", { x: -0.2, y: sy + 1.6, width: 1.7, height: 2.6, fill: "#1E2433", stroke: "#4AB4D6", "stroke-width": 0.4 }, tor);
      // every swing turns about its own joint (hip or shoulder), written straight into the transform, so limbs stay attached
      const swing = (n, cx, cy, a0, a1, dur, delay) => { const pv = { a: a0 }; const set = () => n.setAttribute("transform", `rotate(${pv.a.toFixed(1)} ${cx} ${cy})`); set(); gsap.to(pv, { a: a1, duration: dur, repeat: -1, yoyo: true, ease: "sine.inOut", delay: delay || 0, onUpdate: set }); };
      const bob = (n, h, dur) => { const pv = { y: 0 }; gsap.to(pv, { y: -h, duration: dur, repeat: -1, yoyo: true, ease: "sine.inOut", onUpdate: () => n.setAttribute("transform", `translate(0 ${pv.y.toFixed(2)})`) }); };
      if (o.walk) {
        const d = 0.38 + (k % 3) * 0.04, hipY = o.dress ? -5.0 : -7.4;
        limbs.forEach((l, i) => { l.removeAttribute("transform-origin"); swing(l, i ? 1.05 : -1.05, hipY, i ? 22 : -22, i ? -22 : 22, d); });
        if (!o.phone) arms.forEach((a, i) => { a.removeAttribute("transform-origin"); swing(a, i ? 2.1 : -2.1, sy + 0.5, i ? -16 : 16, i ? 16 : -16, d); });
        bob(body, 0.6, d / 2);
      } else { limbs.forEach((l) => l.removeAttribute("transform-origin")); arms.forEach((a) => a.removeAttribute("transform-origin")); }
      if (o.idle) { const a = arms[k % 2]; swing(a, k % 2 ? 2.1 : -2.1, sy + 0.5, 0, k % 2 ? -10 : 10, 1.4 + (k % 5) * 0.25, (k % 7) * 0.3); }
      if (sit && !o.seat) bob(body, 0.5, 0.3);
      return pg;
    },
    bike(g, x, y, col, rider) {   // a bicycle (rider.old: a penny-farthing) travelling along gx; its front wheel is at +gx
      const big = rider && rider.old;
      [F.circle([x, y, big ? 0.1 : 0.16], "y", big ? 0.1 : 0.16, 18), F.circle([x + 0.55, y, big ? 0.34 : 0.16], "y", big ? 0.34 : 0.16, 22)].forEach((w) => ISO.poly(g, w, "none", { "stroke-width": 1.4 }));
      if (!big) { const a = P(x, y, 0.16), b = P(x + 0.6, y, 0.16), s = P(x + 0.22, y, 0.42), h = P(x + 0.52, y, 0.48), pd = P(x + 0.28, y, 0.16);
        el("path", { d: `M${a[0]} ${a[1]} L${pd[0]} ${pd[1]} L${s[0]} ${s[1]} Z M${pd[0]} ${pd[1]} L${h[0]} ${h[1]} L${b[0]} ${b[1]} M${s[0]} ${s[1]} L${h[0]} ${h[1]}`, stroke: col, "stroke-width": 1.6, fill: "none", "stroke-linejoin": "round" }, g); }
      const r = K.person(g, x + (big ? 0.48 : 0.2), y, Object.assign({ sit: true }, rider || {})); r.setAttribute("transform", r.getAttribute("transform") + ` translate(0 ${big ? -17 : -7})`);
    },
    // a group drawn flat in a vertical plane along an axis: local u runs along the axis (dir ±1), v is height, both in ground units
    plane(g, x, y, axis, dir) {
      const p = P(x, y, 0), u = axis === "y" ? K.UY : K.UX, s = dir || 1;
      return el("g", { transform: `matrix(${u[0] * s} ${u[1] * s} 0 -34.64 ${p[0].toFixed(1)} ${p[1].toFixed(1)})` }, g);
    },
    horse(g, x, y, o) {   // a horse in profile; o: { axis, dir, col, walk }
      o = o || {}; const q = K.plane(g, x, y, o.axis || "x", o.dir || 1), col = o.col || "#8F5E3E", dk = ISO.mixHex(col, "#000000", 0.45), ns = { "vector-effect": "non-scaling-stroke" };
      const legA = "M0.12 0.28 L0.1 0.02 M0.18 0.28 L0.21 0.02 M0.5 0.28 L0.53 0.02 M0.56 0.28 L0.54 0.02", legB = "M0.12 0.28 L0.15 0.02 M0.18 0.28 L0.16 0.02 M0.5 0.28 L0.48 0.02 M0.56 0.28 L0.59 0.02";
      const far = el("path", Object.assign({ d: legA, stroke: dk, "stroke-width": 2.1, "stroke-linecap": "round", fill: "none" }, ns), q);
      el("path", Object.assign({ d: "M0.08 0.43 Q-0.02 0.36 0.02 0.18", stroke: dk, "stroke-width": 2.4, fill: "none", "stroke-linecap": "round" }, ns), q);
      el("path", Object.assign({ d: "M0.07 0.3 C0.05 0.42 0.12 0.47 0.22 0.46 L0.47 0.47 C0.56 0.47 0.6 0.42 0.6 0.33 C0.6 0.27 0.55 0.25 0.5 0.26 L0.16 0.26 C0.1 0.26 0.07 0.27 0.07 0.3 Z M0.47 0.45 L0.6 0.66 L0.64 0.7 L0.65 0.66 L0.78 0.53 L0.77 0.49 L0.72 0.48 L0.64 0.55 L0.58 0.36 Z", fill: col, stroke: "#000", "stroke-width": 0.8, "stroke-linejoin": "round" }, ns), q);
      el("path", Object.assign({ d: "M0.48 0.46 L0.6 0.66", stroke: dk, "stroke-width": 2, fill: "none", "stroke-linecap": "round" }, ns), q);
      if (o.walk) gsap.fromTo(far, { attr: { d: legA } }, { attr: { d: legB }, duration: 0.45, repeat: -1, yoyo: true, ease: "sine.inOut" });
      return q;
    },
    sheep(g, x, y, o) {   // a sheep in profile, grazing or looking up
      o = o || {}; const q = K.plane(g, x, y, o.axis || "x", o.dir || 1), ns = { "vector-effect": "non-scaling-stroke" };
      el("path", Object.assign({ d: "M0.07 0.11 L0.07 0.01 M0.11 0.11 L0.11 0.01 M0.23 0.11 L0.23 0.01 M0.27 0.11 L0.27 0.01", stroke: "#262C3A", "stroke-width": 1.4, fill: "none" }, ns), q);
      el("path", Object.assign({ d: "M0.03 0.13 Q0 0.21 0.06 0.23 Q0.1 0.27 0.16 0.24 Q0.22 0.27 0.27 0.23 Q0.33 0.21 0.3 0.13 Q0.28 0.08 0.22 0.1 Q0.16 0.07 0.1 0.1 Q0.04 0.08 0.03 0.13 Z", fill: "#F7F5EF", stroke: "#000", "stroke-width": 0.8 }, ns), q);
      el("path", Object.assign({ d: o.graze ? "M0.28 0.17 L0.35 0.08 L0.37 0.03 L0.33 0.02 L0.27 0.12 Z" : "M0.27 0.2 L0.35 0.22 L0.38 0.17 L0.34 0.13 L0.28 0.15 Z", fill: "#3E4860", stroke: "#000", "stroke-width": 0.6 }, ns), q);
      return q;
    },
    cow(g, x, y, o) {   // a cow in profile
      o = o || {}; const q = K.plane(g, x, y, o.axis || "x", o.dir || 1), ns = { "vector-effect": "non-scaling-stroke" };
      el("path", Object.assign({ d: "M0.1 0.24 L0.1 0.01 M0.16 0.24 L0.16 0.01 M0.46 0.24 L0.46 0.01 M0.52 0.24 L0.52 0.01", stroke: "#3E3632", "stroke-width": 2, fill: "none", "stroke-linecap": "round" }, ns), q);
      el("path", Object.assign({ d: "M0.06 0.26 L0.06 0.42 L0.52 0.43 L0.56 0.4 L0.56 0.24 Z M0.54 0.4 L0.68 0.38 L0.7 0.28 L0.64 0.25 L0.55 0.3 Z", fill: o.col || "#F7F5EF", stroke: "#000", "stroke-width": 0.8, "stroke-linejoin": "round" }, ns), q);
      el("path", Object.assign({ d: "M0.18 0.42 L0.3 0.42 L0.27 0.32 L0.17 0.33 Z M0.38 0.36 L0.46 0.36 L0.45 0.27 L0.39 0.28 Z", fill: "#3E3632" }, ns), q);
      return q;
    },
    cart(g, x, y, o) {   // a horse and cart along gx, the horse at +gx
      o = o || {};
      const c = o.col || "#A9876A", b = F.box(g, x, y, 0.32, 1.0, 0.56, 0.3, { left: c, right: shade(c), top: shade(c) });
      if (o.hay) F.box(g, x + 0.05, y + 0.05, 0.62, 0.9, 0.46, 0.22, { left: "#E8CF7A", right: "#D6B85E", top: "#F3E2A0" });
      if (o.coach) { const k2 = F.box(g, x + 0.05, y + 0.02, 0.62, 0.8, 0.52, 0.42, { left: "#262C3A", right: "#1E2433", top: "#3E4860" }); F.face(g, F.L, k2, 0.2, 0.12, 0.6, 0.34, "#FFE6A3", { "stroke-width": 0.5 }); }
      ISO.poly(g, F.circle([x + 0.5, y + 0.6, 0.3], "y", 0.3, 20), "none", { "stroke-width": 1.6 });
      K.horse(g, x + 1.1, y + 0.3, { walk: o.walk, col: o.horse });
      if (o.driver !== false) { const r = K.person(g, x + 0.9, y + 0.3, { sit: true, hat: !!o.coach, cap: o.coach ? null : "#8F7A6E", top: o.top }); r.setAttribute("transform", r.getAttribute("transform") + " translate(0 -10)"); }
      return b;
    },
    fence(g, x0, y0, x1, y1, col) {   // a post-and-rail fence from (x0,y0) to (x1,y1)
      col = col || "#9C7B5B"; const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(L / 0.8)); let d = "";
      for (let i = 0; i <= n; i++) { const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n, a = P(x, y, 0), b = P(x, y, 0.32); d += `M${a[0]} ${a[1]} L${b[0]} ${b[1]} `; }
      [0.14, 0.28].forEach((z) => { const a = P(x0, y0, z), b = P(x1, y1, z); d += `M${a[0]} ${a[1]} L${b[0]} ${b[1]} `; });
      return el("path", { d, stroke: col, "stroke-width": 1.3, fill: "none" }, g);
    },
    hedge(g, x0, y0, x1, y1) {   // a low clipped hedge along gx or gy
      const ax = Math.abs(x1 - x0) > Math.abs(y1 - y0);
      return F.box(g, Math.min(x0, x1), Math.min(y0, y1), 0, ax ? Math.abs(x1 - x0) : 0.3, ax ? 0.3 : Math.abs(y1 - y0), 0.32, { left: "#7DBF7E", right: "#5FA061", top: "#9ED39C" });
    },
    hay(g, x, y) { F.cyl(g, [x, y, 0], "z", 0.3, 0.42, { side: "#E8CF7A", cap: "#F3E2A0" }); },
    crate(g, x, y, z, c) { c = c || "#C9A988"; F.box(g, x, y, z || 0, 0.4, 0.4, 0.34, { left: c, right: shade(c), top: lite(c) }); },
    bench(g, x, y) { F.box(g, x, y, 0.18, 0.8, 0.22, 0.06, { left: "#9C7B5B", right: "#7E6247", top: "#B5967A" }); [x + 0.05, x + 0.7].forEach((u) => F.box(g, u, y + 0.05, 0, 0.06, 0.12, 0.18, { left: "#3E4860", right: "#262C3A", top: "#3E4860" })); },
    shop(g, x, y, w, d, h, col, awn, o) {   // a shop with a big window, a fascia and a striped awning over the front (gy + d side)
      o = o || {};
      const b = F.box(g, x, y, 0, w, d, h, { left: col, right: shade(col), top: lite(col) });
      F.face(g, F.L, b, 0.15, 0.05, w - 0.15, 0.62, o.glass || "#FFE6A3", { "stroke-width": 0.7 });
      F.face(g, F.L, b, 0.15, 0.05, w * 0.32, 0.62, "#5B4A42", { "stroke-width": 0.6 });
      for (let z = 1.15; z < h - 0.3; z += 0.62) for (let u = 0.25; u < w - 0.3; u += 0.55) F.face(g, F.L, b, u, z, u + 0.28, z + 0.34, o.win || C.water, { "stroke-width": 0.6 });
      for (let z = 1.15; z < h - 0.3; z += 0.62) F.face(g, F.R, b, 0.25, z, d - 0.25, z + 0.34, shade(o.win || C.water), { "stroke-width": 0.6 });
      if (awn) { const n = Math.max(2, Math.round(w / 0.3)); for (let i = 0; i < n; i++) { const u0 = x + w * i / n, u1 = x + w * (i + 1) / n; K.quad(g, [[u0, y + d, 0.92], [u1, y + d, 0.92], [u1, y + d + 0.45, 0.72], [u0, y + d + 0.45, 0.72]], i % 2 ? "#FFFFFF" : awn, { "stroke-width": 0.6 }); } }
      if (o.sign) F.face(g, F.L, b, 0.2, 0.98, w - 0.2, 1.12, o.sign, { "stroke-width": 0.5 });
      if (o.roof === "pv") K.pvRoof(g, x, y, h, w, d);
      return b;
    },
    mill(g, x, y) {   // a brick windmill tower with turning sails, facing gy+
      F.cyl(g, [x, y, 0], "z", 0.5, 1.9, { side: "#C9A988", cap: "#8F7A6E" });
      const t = P(x, y, 2.0); el("path", { d: `M${t[0] - 15} ${t[1] + 4} L${t[0]} ${t[1] - 14} L${t[0] + 15} ${t[1] + 4} Z`, fill: "#8F7A6E", stroke: "#000", "stroke-width": 1 }, g);
      const d0 = P(x + 0.0, y + 0.5, 0); el("path", { d: `M${d0[0] - 3} ${d0[1]} L${d0[0] - 3} ${d0[1] - 12} L${d0[0] + 3} ${d0[1] - 12} L${d0[0] + 3} ${d0[1]} Z`, fill: "#5B4A42", stroke: "#000", "stroke-width": 0.6 }, g);
      const c = P(x, y + 0.55, 1.75), sp = el("g", null, g);
      for (let a = 0; a < 4; a++) { const r = el("g", { transform: `rotate(${a * 90})` }, sp); el("path", { d: "M0 -2 L0 -40", stroke: "#5B4A42", "stroke-width": 1.6 }, r); el("path", { d: "M1 -10 L9 -12 L9 -40 L1 -40 Z", fill: "#F3EDE0", stroke: "#000", "stroke-width": 0.7 }, r); }
      const o = { a: Math.random() * 90 }, set = () => sp.setAttribute("transform", `translate(${c[0]} ${c[1]}) skewY(30) scale(0.9 1) rotate(${o.a})`); set();
      gsap.to(o, { a: "+=360", duration: 14, repeat: -1, ease: "none", onUpdate: set });
    },
    // a lattice pylon; arms along gy (axis "y", for a line running along gx) or along gx (axis "x")
    pylon(g, x, y, h, axis) {
      if (axis !== "x") return ISO.pylon(g, F, x, y, h);
      const hw = h * 0.8, k = (z) => 0.4 + (0.1 - 0.4) * (z / hw), at = (sx, sy, z) => P(x + sx * k(z), y + sy * k(z), z);
      const legs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
      legs.forEach(([sx, sy]) => ISO.line(g, [at(sx, sy, 0), at(sx, sy, hw)], { "stroke-width": 1.2 }));
      const lv = [0, hw * 0.34, hw * 0.62, hw]; let d = "";
      [[[-1, 1], [1, 1]], [[1, -1], [1, 1]]].forEach(([a, b]) => { for (let n = 0; n < 3; n++) { const p1 = at(a[0], a[1], lv[n]), p2 = at(b[0], b[1], lv[n + 1]), p3 = at(b[0], b[1], lv[n]), p4 = at(a[0], a[1], lv[n + 1]); d += `M${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} M${p3[0]} ${p3[1]} L${p4[0]} ${p4[1]} `; } });
      el("path", { d, stroke: "#000", "stroke-width": 0.75, fill: "none" }, g);
      const apex = P(x, y, h); legs.forEach(([sx, sy]) => ISO.line(g, [at(sx, sy, hw), apex], { "stroke-width": 1 }));
      el("circle", { cx: apex[0], cy: apex[1] - 1.5, r: 2.4, fill: "#E04B00", class: "fx anim beacon", style: `animation-delay:${(Math.random() * 2).toFixed(2)}s` }, g);
      [[hw * 0.7, 0.95], [hw * 0.95, 0.7]].forEach(([z, w]) => { const a = P(x - w, y, z), b = P(x + w, y, z); ISO.line(g, [a, b], { "stroke-width": 1.5 }); [a, b].forEach((q) => ISO.line(g, [q, [q[0], q[1] + 6]], { "stroke-width": 1.2 })); });
    },
    // the conductors between pylons: pts are [x, y] tower positions, axis is each tower's arm direction, end is a gantry [x, y, z, axis]
    spans(g, pts, h, axis, end) {
      const hw = h * 0.8; let d = "";
      [[hw * 0.7, 0.95], [hw * 0.95, 0.7]].forEach(([z, w]) => [-w, w].forEach((o2) => {
        const gp = (e) => e[3] === "x" ? P(e[0] + o2 * 0.8, e[1], e[2]) : P(e[0], e[1] + o2 * 0.8, e[2]);
        const q = pts.map((t) => { if (t.length > 2) return gp(t); const r = axis === "x" ? P(t[0] + o2, t[1], z) : P(t[0], t[1] + o2, z); return [r[0], r[1] + 6]; });
        if (end) q.push(gp(end));
        for (let i = 1; i < q.length; i++) { const a = q[i - 1], b = q[i]; d += `M${a[0].toFixed(1)} ${a[1].toFixed(1)} Q${((a[0] + b[0]) / 2).toFixed(1)} ${((a[1] + b[1]) / 2 + 14).toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)} `; }
      }));
      return el("path", { d, stroke: "#3E4860", "stroke-width": 0.9, fill: "none" }, g);
    },
    gantry(g, x, y, axis) {   // a substation gantry; its beam runs across the incoming line
      const ax = axis === "x";
      [-0.8, 0.8].forEach((o2) => F.box(g, x + (ax ? o2 : 0) - 0.06, y + (ax ? 0 : o2) - 0.06, 0, 0.12, 0.12, 2.2, { left: C.g1, right: C.g2, top: C.w1 }));
      F.box(g, x - (ax ? 0.86 : 0.06), y - (ax ? 0.06 : 0.86), 2.1, ax ? 1.72 : 0.12, ax ? 0.12 : 1.72, 0.12, { left: C.g1, right: C.g2, top: C.w1 });
    },
    batt(g, x, y, w) { const b = F.box(g, x, y, 0, w, 0.7, 0.8, { left: "#F1F2F4", right: C.w3, top: "#47B970" }); for (let u = 0.2; u < w - 0.15; u += 0.35) F.face(g, F.L, b, u, 0.12, u + 0.14, 0.62, "#C9CED6", { "stroke-width": 0.5 }); F.face(g, F.L, b, w - 0.35, 0.45, w - 0.15, 0.62, "#47B970", { stroke: "none", class: "fx anim blink" }); return b; },
    dataHall(g, x, y, w, d) { const b = F.box(g, x, y, 0, w, d, 1.2, { left: "#3E4860", right: "#262C3A", top: "#626E88" }); for (let u = 0.3; u < w - 0.2; u += 0.45) { F.face(g, F.L, b, u, 0.3, u + 0.26, 0.9, "#1E2433", { "stroke-width": 0.5 }); F.face(g, F.L, b, u + 0.07, 0.5, u + 0.17, 0.58, "#47B970", { stroke: "none", class: "fx anim blink", style: `animation-delay:${(u * 0.37).toFixed(2)}s` }); } for (let u = 0.3; u < w - 0.7; u += 1.1) F.box(g, x + u, y + 0.4, 1.2, 0.8, 0.8, 0.28, { left: C.g1, right: C.g2, top: C.w1 }); return b; },
    table(g, x, y, col) {   // a café table with two chairs and a parasol
      F.box(g, x - 0.18, y - 0.18, 0.35, 0.36, 0.36, 0.04, { left: "#F1F2F4", right: C.w3, top: "#FFFFFF" }); F.box(g, x - 0.03, y - 0.03, 0, 0.06, 0.06, 0.35, { left: "#3E4860", right: "#262C3A", top: "#3E4860" });
      [[-0.42, 0], [0.32, 0]].forEach(([dx]) => F.box(g, x + dx, y - 0.1, 0, 0.1, 0.2, 0.25, { left: "#8F6B4E", right: "#6D5A4A", top: "#A9876A" }));
      K.seg(g, [x, y, 0.39], [x, y, 1.1], "#3E4860", 1); const t = P(x, y, 1.15), r = 15; el("path", { d: `M${t[0] - r} ${t[1] + 6} Q${t[0]} ${t[1] - 7} ${t[0] + r} ${t[1] + 6} Q${t[0]} ${t[1] + 3} ${t[0] - r} ${t[1] + 6} Z`, fill: col }, g);
    },
    stall(g, x, y, col) {   // a market stall with a striped canopy and boxes of produce
      F.box(g, x, y, 0, 1.4, 0.7, 0.45, { left: "#C9A988", right: "#A9876A", top: "#E3D6C0" });
      [["#E0785A", 0.1], ["#A6D84A", 0.5], ["#FFCD00", 0.9]].forEach(([c, u]) => F.box(g, x + u, y + 0.15, 0.45, 0.35, 0.35, 0.12, { left: c, right: shade(c), top: lite(c) }));
      [x + 0.05, x + 1.3].forEach((u) => K.seg(g, [u, y + 0.65, 0], [u, y + 0.65, 1.0], "#3E4860", 1));
      for (let k = 0; k < 6; k++) { const u0 = x - 0.05 + k * 0.25, u1 = u0 + 0.25; K.quad(g, [[u0, y - 0.05, 1.15], [u1, y - 0.05, 1.15], [u1, y + 0.85, 0.95], [u0, y + 0.85, 0.95]], k % 2 ? "#FFFFFF" : col, { "stroke-width": 0.6 }); }
    },
    fountain(g, x, y, r) {   // a round basin with a spout and falling water
      F.cyl(g, [x, y, 0], "z", r, 0.22, { side: "#D8D2C4", cap: "#8CC8EE" });
      F.cyl(g, [x, y, 0.22], "z", r * 0.25, 0.35, { side: "#D8D2C4", cap: "#B6DDF5" });
      const t = P(x, y, 0.62); for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2, e = P(x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7, 0.24);
        const p = el("path", { d: `M${t[0]} ${t[1]} Q${(t[0] + e[0]) / 2} ${t[1] - 12} ${e[0]} ${e[1]}`, stroke: "#4AB4D6", "stroke-width": 1.4, fill: "none", "stroke-dasharray": "3 3", "data-keepstroke": "" }, g); gsap.to(p, { attr: { "stroke-dashoffset": -12 }, duration: 0.8, repeat: -1, ease: "none" }); }
      const j = P(x, y, 1.0); el("path", { d: `M${t[0]} ${t[1]} L${j[0]} ${j[1]}`, stroke: "#4AB4D6", "stroke-width": 2, "data-keepstroke": "" }, g);
    },
    bandstand(g, x, y) {   // an octagonal bandstand with musicians
      F.cyl(g, [x, y, 0], "z", 1.0, 0.25, { side: "#D8D2C4", cap: "#EDE6DA" });
      for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2; if (Math.sin(a) < -0.3) continue; K.seg(g, [x + Math.cos(a) * 0.9, y + Math.sin(a) * 0.9, 0.25], [x + Math.cos(a) * 0.9, y + Math.sin(a) * 0.9, 1.3], "#3E4860", 1.4); }
      [[-0.3, 0, "#B5302E"], [0.3, 0.1, "#204C8A"]].forEach(([dx, dy, c]) => K.personAt(g, x + dx, y + dy, 0.25, { idle: true, top: c, hat: true }));
      const t = P(x, y, 1.9); const rim = F.circle([x, y, 1.3], "z", 1.1, 16); ISO.poly(g, ISO.hull(rim.concat([t])), "#47B970", { "stroke-width": 1 }); ISO.poly(g, rim, "#2F8A52", { "stroke-width": 0.6, "fill-opacity": 0 });
    },
    playground(g, x, y) {   // a slide, a swing set and a sandpit
      K.rect(g, x, y, x + 2.4, y + 1.6, "#F3E2A0", 0.8);
      F.box(g, x + 0.3, y + 0.3, 0, 0.5, 0.5, 0.7, { left: "#E0785A", right: "#B5302E", top: "#FFCD00" }); K.quad(g, [[x + 0.8, y + 0.35, 0.7], [x + 1.6, y + 0.35, 0.05], [x + 1.6, y + 0.75, 0.05], [x + 0.8, y + 0.75, 0.7]], "#4AB4D6");
      [x + 1.0, x + 2.2].forEach((u) => { K.seg(g, [u - 0.15, y + 1.3, 0], [u, y + 1.3, 1.0], "#3E4860", 1.4); K.seg(g, [u + 0.15, y + 1.3, 0], [u, y + 1.3, 1.0], "#3E4860", 1.4); }); K.seg(g, [x + 1.0, y + 1.3, 1.0], [x + 2.2, y + 1.3, 1.0], "#3E4860", 1.4);
      const sw = el("g", null, g); K.seg(sw, [x + 1.6, y + 1.3, 1.0], [x + 1.6, y + 1.3, 0.35], "#3E4860", 0.8); F.box(sw, x + 1.45, y + 1.2, 0.3, 0.3, 0.2, 0.05, { left: "#47B970", right: "#2F8A52", top: "#47B970" }); K.personAt(sw, x + 1.6, y + 1.32, 0.2, { top: "#FFCD00", idle: false });
      const o = P(x + 1.6, y + 1.3, 1.0); gsap.fromTo(sw, { rotation: -14, svgOrigin: `${o[0]} ${o[1]}` }, { rotation: 14, svgOrigin: `${o[0]} ${o[1]}`, duration: 1.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
      [[x + 0.4, y + 1.0], [x + 2.6, y + 0.4]].forEach(([u, v], i) => K.person(g, u, v, { idle: true, top: ["#E0785A", "#4AB4D6"][i], dress: i === 1 }));
    },
    icecream(g, x, y) { F.box(g, x, y, 0.12, 0.8, 0.45, 0.45, { left: "#F2A7B8", right: "#D98A9C", top: "#FFFFFF" }); K.wheel(g, x + 0.2, y + 0.45, 0.12, 0.11, "y"); K.wheel(g, x + 0.6, y + 0.45, 0.12, 0.11, "y"); K.seg(g, [x + 0.4, y + 0.22, 0.57], [x + 0.4, y + 0.22, 1.2], "#3E4860", 1); const t = P(x + 0.4, y + 0.22, 1.25); el("path", { d: `M${t[0] - 13} ${t[1] + 5} Q${t[0]} ${t[1] - 6} ${t[0] + 13} ${t[1] + 5} Z`, fill: "#FFFFFF" }, g); K.person(g, x + 1.0, y + 0.3, { idle: true, top: "#F1F2F4", cap: "#F2A7B8" }); K.person(g, x + 0.2, y + 0.9, { idle: true, top: "#47B970" }); },
    xfmr(g, x, y) { F.box(g, x, y, 0, 1.0, 0.9, 0.8, { left: C.g1, right: C.g2, top: C.w1 }); [0.25, 0.5, 0.75].forEach((v) => ISO.line(g, [P(x + 0.5, y + v * 0.9, 0.8), P(x + 0.5, y + v * 0.9, 1.1)], { "stroke-width": 1.4 })); },
    // a modern electric train of n cars running along gx, front at x + 2.6: a sloped nose, a window band, a livery stripe, bogies and a pantograph
    train(g, x, y, n, o) {
      o = o || {}; const L = 2.6, gap = 0.08, W = 0.62, stripe = o.stripe || "#47B970", body = o.body || "#F1F2F4";
      for (let k = n - 1; k >= 0; k--) {
        const x0r = x - k * (L + gap), nose = k === 0 ? 0.55 : 0, tail = k === n - 1 && n > 1 ? 0.55 : 0, x0 = x0r + tail;   // a cab at each end
        [0.35, L - 0.35].forEach((u) => { F.box(g, x0 + u - 0.25, y + 0.05, 0.06, 0.5, W - 0.1, 0.14, { left: "#3E4860", right: "#262C3A", top: "#3E4860" }); [-0.14, 0.14].forEach((d) => K.wheel(g, x0 + u + d, y + W - 0.05, 0.1, 0.09, "y")); });
        if (tail) { const z0 = 0.2, z1 = 0.98; K.quad(g, [[x0r, y, 0.5], [x0, y, z1], [x0, y + W, z1], [x0r, y + W, 0.5]], "#FFFFFF", { "stroke-width": 1 }); K.quad(g, [[x0r, y + W, z0], [x0, y + W, z0], [x0, y + W, z1], [x0r, y + W, 0.5]], body, { "stroke-width": 1 }); K.quad(g, [[x0, y + W, z1 - 0.08], [x0r + 0.12, y + W, 0.56], [x0, y + W, z1 - 0.36]], "#3E4860", { "stroke-width": 0.6 }); }
        const b = F.box(g, x0, y, 0.2, L - nose - tail, W, 0.78, { left: body, right: ISO.mixHex(body, "#000000", 0.12), top: "#FFFFFF" });
        const BL = L - nose - tail;
        F.face(g, F.L, b, 0.05, 0.16, BL - 0.05, 0.24, stripe, { "stroke-width": 0.6 });
        F.face(g, F.L, b, 0.08, 0.4, BL - 0.08, 0.62, "#3E4860", { "stroke-width": 0.6 });
        [0.3, BL - 0.45].forEach((u) => F.face(g, F.L, b, u, 0.05, u + 0.18, 0.66, ISO.mixHex(body, "#000000", 0.06), { "stroke-width": 0.6 }));
        if (k === 0) {   // the nose: the roof and the sides slope down to a low front with a wide windscreen
          const xe = x0 + L - nose, xf = x0 + L, z0 = 0.2, z1 = 0.98;
          K.quad(g, [[xe, y + W, z0], [xf, y + W, z0], [xf, y + W, 0.5], [xe, y + W, z1]], body, { "stroke-width": 1 });
          K.quad(g, [[xe, y + W, z1 - 0.36], [xf - 0.12, y + W, 0.56], [xe, y + W, z1 - 0.08]], "#3E4860", { "stroke-width": 0.6 });
          K.quad(g, [[xe, y, z1], [xe, y + W, z1], [xf, y + W, 0.5], [xf, y, 0.5]], "#FFFFFF", { "stroke-width": 1 });
          K.quad(g, [[xf, y, z0], [xf, y + W, z0], [xf, y + W, 0.5], [xf, y, 0.5]], ISO.mixHex(body, "#000000", 0.12), { "stroke-width": 1 });
          K.quad(g, [[xe + 0.06, y + 0.08, z1 - 0.06], [xe + 0.06, y + W - 0.08, z1 - 0.06], [xf - 0.18, y + W - 0.08, 0.6], [xf - 0.18, y + 0.08, 0.6]], "#3E4860", { "stroke-width": 0.6 });
          K.quad(g, [[xe, y + W, 0.26], [xf, y + W, 0.26], [xf, y + W, 0.32], [xe, y + W, 0.32]], stripe, { "stroke-width": 0.4 });
        }
        if (o.wire) { const p0 = P(x0 + 1.3, y + W / 2, 0.98), p1 = P(x0 + 1.0, y + W / 2, o.wire), p2 = P(x0 + 1.6, y + W / 2, o.wire); el("path", { d: `M${p0[0]} ${p0[1]} L${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} Z`, stroke: "#3E4860", "stroke-width": 1, fill: "none" }, g); }
      }
    },
    // a steam locomotive (front at x + 2.2) with its tender and n carriages behind; returns the top of the chimney
    loco(g, x, y, col, rev) {   // rev: facing -gx (the chimney end at x)
      col = col || "#2F6F4E"; const W = 0.6, dk = shade(col), X = (u, len) => (rev ? x + 2.2 - u - (len || 0) : x + u);
      F.box(g, x, y + 0.05, 0.28, 2.2, W - 0.1, 0.1, { left: "#262C3A", right: "#1E2433", top: "#3E4860" });
      F.box(g, X(2.12, 0.1), y, 0.22, 0.1, W, 0.18, { left: "#B5302E", right: shade("#B5302E"), top: "#B5302E" });
      if (!rev) { F.cyl(g, [x + 0.7, y + W / 2, 0.66], "x", 0.27, 1.25, { side: col, cap: "#262C3A" }); F.cyl(g, [x + 1.95, y + W / 2, 0.66], "x", 0.29, 0.18, { side: "#262C3A", cap: "#3E4860" }); }
      else { F.cyl(g, [x + 0.07, y + W / 2, 0.66], "x", 0.29, 0.18, { side: "#262C3A", cap: "#262C3A" }); F.cyl(g, [x + 0.25, y + W / 2, 0.66], "x", 0.27, 1.25, { side: col, cap: col }); }
      F.cyl(g, [X(1.75), y + W / 2, 0.9], "z", 0.08, 0.32, { side: "#262C3A", cap: "#1E2433" });
      F.cyl(g, [X(1.2), y + W / 2, 0.9], "z", 0.1, 0.12, { side: "#C99A5B", cap: "#E5C189" });
      const cab = F.box(g, X(0, 0.72), y, 0.38, 0.72, W, 0.72, { left: col, right: dk, top: "#262C3A" });
      F.face(g, F.L, cab, 0.18, 0.32, 0.52, 0.6, "#FFE6A3", { "stroke-width": 0.6 });
      F.box(g, X(-0.04, 0.8), y - 0.04, 1.1, 0.8, W + 0.08, 0.06, { left: "#262C3A", right: "#1E2433", top: "#3E4860" });
      [0.45, 0.95, 1.45].forEach((u) => { ISO.poly(g, F.circle([X(u), y + W, 0.24], "y", 0.24, 18), "#B5302E", { "stroke-width": 1 }); ISO.poly(g, F.circle([X(u), y + W, 0.24], "y", 0.08, 8), "#262C3A", { "stroke-width": 0.6 }); });
      K.wheel(g, X(1.95), y + W, 0.13, 0.12, "y");
      K.seg(g, [X(0.45), y + W + 0.01, 0.18], [X(1.45), y + W + 0.01, 0.18], "#9DA6B5", 2);
      return P(X(1.75), y + W / 2, 1.25);
    },
    tender(g, x, y) { const W = 0.6; [0.25, 0.8].forEach((u) => K.wheel(g, x + u, y + W, 0.13, 0.12, "y")); F.box(g, x, y, 0.22, 1.05, W, 0.55, { left: "#2F6F4E", right: shade("#2F6F4E"), top: "#262C3A" }); const c = P(x + 0.52, y + W / 2, 0.86); el("path", { d: `M${c[0] - 12} ${c[1] + 3} Q${c[0]} ${c[1] - 7} ${c[0] + 12} ${c[1] + 3} Z`, fill: "#262C3A" }, g); },
    carriage(g, x, y, col) {
      col = col || "#7A2E2E"; const W = 0.6, L = 2.0;
      [0.3, L - 0.3].forEach((u) => [-0.12, 0.12].forEach((d) => K.wheel(g, x + u + d, y + W, 0.11, 0.1, "y")));
      const b = F.box(g, x, y, 0.22, L, W, 0.68, { left: col, right: shade(col), top: "#5B6478" });
      F.face(g, F.L, b, 0.05, 0.36, L - 0.05, 0.62, "#F3E6CC", { "stroke-width": 0.5 });
      for (let u = 0.18; u < L - 0.2; u += 0.34) F.face(g, F.L, b, u, 0.4, u + 0.22, 0.58, "#FFE6A3", { "stroke-width": 0.5 });
      K.quad(g, [[x - 0.03, y - 0.03, 0.9], [x + L + 0.03, y - 0.03, 0.9], [x + L + 0.03, y + W / 2, 0.98], [x - 0.03, y + W / 2, 0.98]], "#3E4860", { "stroke-width": 0.8 });
      K.quad(g, [[x - 0.03, y + W + 0.03, 0.9], [x + L + 0.03, y + W + 0.03, 0.9], [x + L + 0.03, y + W / 2, 0.98], [x - 0.03, y + W / 2, 0.98]], "#5B6478", { "stroke-width": 0.8 });
    },
    // the whole train, front at x + 2.2 (or, reversed, front at x running towards -gx); returns the top of the chimney
    steamTrain(g, x, y, n, rev) {
      n = n || 2;
      if (rev) { const f = K.loco(g, x, y, "#204C8A", true); K.tender(g, x + 2.25, y); for (let k = 1; k <= n; k++) K.carriage(g, x + 1.27 + k * 2.08, y, k % 2 ? "#3E5A3E" : "#7A2E2E"); return f; }
      for (let k = n; k >= 1; k--) K.carriage(g, x - 1.15 - k * 2.08, y, k % 2 ? "#7A2E2E" : "#3E5A3E");
      K.tender(g, x - 1.12, y);
      return K.loco(g, x, y);
    },
    // a building cut open along its front (the gy + d side) to show what happens inside, floor by floor: inner(g, floor, z)
    // a glass building you can see into: back walls, see-through floors, glass on both visible sides, a light roof frame;
    // inner(g, floor, z) draws what is on each floor, before the floor above it
    cutaway(g, x, y, w, d, h, floors, body, inner, solidSide) {
      const fh = h / floors, wall = ISO.mixHex(body, "#FFFFFF", 0.6), gl = { "stroke-width": 1, "fill-opacity": 0.16 };
      K.quad(g, [[x, y, 0], [x + w, y, 0], [x + w, y, h], [x, y, h]], wall, { "stroke-width": 1 });
      K.quad(g, [[x, y, 0], [x, y + d, 0], [x, y + d, h], [x, y, h]], ISO.mixHex(wall, "#000000", 0.06), { "stroke-width": 1 });
      for (let f = 0; f < floors; f++) {
        const z = f * fh;
        K.quad(g, [[x, y, z], [x + w, y, z], [x + w, y + d, z], [x, y + d, z]], "#E3DCCF", f ? { "stroke-width": 1, "fill-opacity": 0.42 } : { "stroke-width": 1 });
        if (f) { K.quad(g, [[x, y + d, z - 0.07], [x + w, y + d, z - 0.07], [x + w, y + d, z], [x, y + d, z]], shade(body), { "stroke-width": 0.6 }); K.quad(g, [[x + w, y, z - 0.07], [x + w, y + d, z - 0.07], [x + w, y + d, z], [x + w, y, z]], shade(body), { "stroke-width": 0.6 }); }
        inner(g, f, z);
      }
      K.quad(g, [[x, y + d, 0], [x + w, y + d, 0], [x + w, y + d, h], [x, y + d, h]], "#BFE3F2", gl);
      if (solidSide) { const sb = { x, y, z: 0, w, d, h }; F.face(g, F.R, sb, 0, 0, d, h, shade(body), { "stroke-width": 1 }); for (let f = 0; f < floors; f++) F.face(g, F.R, sb, 0.15, f * fh + 0.25, d - 0.15, f * fh + fh * 0.7, shade(C.water), { "stroke-width": 0.6 }); }
      else K.quad(g, [[x + w, y, 0], [x + w, y + d, 0], [x + w, y + d, h], [x + w, y, h]], "#9FCBE3", gl);
      for (let u = w / 4; u < w - 0.05; u += w / 4) K.seg(g, [x + u, y + d, 0], [x + u, y + d, h], "#5B6478", 0.8);
      if (!solidSide) for (let u = d / 3; u < d - 0.05; u += d / 3) K.seg(g, [x + w, y + u, 0], [x + w, y + u, h], "#5B6478", 0.8);
      K.quad(g, [[x, y, h], [x + w, y, h], [x + w, y + d, h], [x, y + d, h]], lite(body), { "stroke-width": 1, "fill-opacity": 0.3 });
      return { x, y, z: 0, w, d, h };
    },
    // an open-plan office in a glass building: on every floor, people at desks with screens near the glass
    office(g, x, y, w, d, h, floors, body, roof) {
      const TOPS = ["#4AB4D6", "#F1F2F4", "#E0785A", "#47B970", "#8C6F9E", "#FFCD00", "#3E4860"];
      const b = K.cutaway(g, x, y, w, d, h, floors, body, (q, f, z) => {
        for (let u = 0.3, i = 0; u < w - 0.7; u += 0.8, i++) { if ((i + f) % 4 === 3) continue;
          const cx = x + u + 0.4, cy = y + d - 1.0;
          F.box(q, cx - 0.14, cy - 0.32, z, 0.28, 0.1, 0.42, { left: "#3E4860", right: "#262C3A", top: "#5B6478" });   // the chair back
          K.personAt(q, cx, cy - 0.1, z, { seat: true, top: TOPS[(i * 3 + f) % 7], long: (i + f) % 3 === 1 });
          K.desk(q, x + u, cy + 0.1, z, true); }
      }, true);
      if (roof === "plant") { F.box(g, x + 0.3, y + 0.3, h, w * 0.35, d * 0.3, 0.3, { left: C.w2, right: C.w3, top: C.w1 }); }
      if (roof === "pv") K.pvRoof(g, x, y, h, w, d);
      return b;
    },
    // a desk with a screen facing the person in front of it (rot: the desk runs along gy)
    desk(g, x, y, z, screen, rot) {
      const W = rot ? 0.34 : 0.6, D = rot ? 0.6 : 0.34;
      F.box(g, x, y, z, W, D, 0.22, { left: "#C9A988", right: "#A9876A", top: "#E3D6C0" });
      if (screen) { const m = rot ? F.box(g, x + 0.04, y + 0.15, z + 0.22, 0.06, 0.3, 0.22, { left: "#262C3A", right: "#4AB4D6", top: "#262C3A" }) : F.box(g, x + 0.04, y + 0.06, z + 0.22, 0.2, 0.05, 0.16, { left: "#3E4860", right: "#262C3A", top: "#262C3A" }); }
    },
    // a person standing inside a building, z units above the ground
    personAt(g, x, y, z, o) { const w = el("g", { transform: `translate(0 ${(-z * 34.64).toFixed(1)})` }, g); K.person(w, x, y, o); return w; },
    smoke(g, x, y, big) {
      const s = el("g", null, g);
      for (let k = 0; k < 4; k++) el("circle", { cx: x, cy: y, r: big ? 6 : 4.5, fill: "#E3E6EB", stroke: "#8F8784", "stroke-width": 0.8, class: "puff", style: `animation-delay:${-k * 0.8}s` }, s);
      return s;
    },
    chimney(g, x, y, h) { const c = F.cyl(g, [x, y, 0], "z", 0.22, h, { side: "#B7795E", cap: "#3E4860" }); const p = P(c[0], c[1], c[2]); K.smoke(g, p[0], p[1] - 4, true); },
    factory(g, x, y, w, d, h, col) {   // a brick mill with a sawtooth roof
      col = col || "#B7795E";
      const b = F.box(g, x, y, 0, w, d, h, { left: col, right: shade(col), top: lite(col) });
      for (let u = 0.25; u < w - 0.3; u += 0.5) { F.face(g, F.L, b, u, 0.3, u + 0.28, 0.75, "#FFE6A3", { "stroke-width": 0.6 }); if (h > 1.4) F.face(g, F.L, b, u, 1.0, u + 0.28, 1.4, "#FFE6A3", { "stroke-width": 0.6 }); }
      for (let k = 0; k < Math.floor(d / 0.7); k++) { const y0 = y + k * 0.7; K.quad(g, [[x, y0, h], [x + w, y0, h], [x + w, y0 + 0.7, h + 0.45], [x, y0 + 0.7, h + 0.45]], k % 2 ? "#8F8784" : "#A79E9A", { "stroke-width": 0.7 }); K.quad(g, [[x, y0 + 0.7, h], [x + w, y0 + 0.7, h], [x + w, y0 + 0.7, h + 0.45], [x, y0 + 0.7, h + 0.45]], C.water, { "stroke-width": 0.7 }); }
      return b;
    },
    terrace(g, x, y, n, h, col) {   // attached houses in a row along gx
      for (let k = 0; k < n; k++) {
        const x0 = x + k * 0.95, b = F.box(g, x0, y, 0, 0.95, 1.2, h, { left: col, right: shade(col), top: lite(col) });
        F.face(g, F.L, b, 0.15, 0, 0.38, 0.55, "#5B4A42", { "stroke-width": 0.6 });
        F.face(g, F.L, b, 0.5, 0.3, 0.8, 0.6, C.water, { "stroke-width": 0.6 });
        F.face(g, F.L, b, 0.3, h - 0.5, 0.65, h - 0.2, C.water, { "stroke-width": 0.6 });
        K.quad(g, [[x0, y, h], [x0 + 0.95, y, h], [x0 + 0.95, y + 0.6, h + 0.45], [x0, y + 0.6, h + 0.45]], "#5A5660", { "stroke-width": 0.7 });
        K.quad(g, [[x0, y + 1.2, h], [x0 + 0.95, y + 1.2, h], [x0 + 0.95, y + 0.6, h + 0.45], [x0, y + 0.6, h + 0.45]], "#6E6A72", { "stroke-width": 0.7 });
        if (k % 2 === 0) F.box(g, x0 + 0.4, y + 0.5, h + 0.3, 0.18, 0.18, 0.35, { left: "#B7795E", right: shade("#B7795E"), top: "#3E4860" });
      }
    },
    pole(g, x, y, h, arms) {   // a wooden telegraph pole; its cross-arms run along gy
      K.quad(g, [[x - 0.04, y, 0], [x + 0.04, y, 0], [x + 0.04, y, h], [x - 0.04, y, h]], "#9C7B5B", { "stroke-width": 0.7 });
      const out = [];
      for (let a = 0; a < (arms || 1); a++) { const z = h - 0.12 - a * 0.22; K.seg(g, [x, y - 0.45, z], [x, y + 0.45, z], "#6D5A4A", 2); out.push(z); }
      return out;
    },
    wires(g, xs, y, zs, offs, col, sag) {
      let d = "";
      zs.forEach((z) => offs.forEach((o) => { for (let i = 1; i < xs.length; i++) { const a = P(xs[i - 1], y + o, z), b = P(xs[i], y + o, z); d += `M${a[0]} ${a[1]} Q${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 + (sag || 9)} ${b[0]} ${b[1]} `; } }));
      return el("path", { d, stroke: col || "#3E4860", "stroke-width": 0.8, fill: "none" }, g);
    },
    lamp(g, x, y) { K.quad(g, [[x - 0.03, y, 0], [x + 0.03, y, 0], [x + 0.03, y, 1.1], [x - 0.03, y, 1.1]], "#3E4860", { "stroke-width": 0.5 }); const c = P(x, y, 1.18); el("circle", { cx: c[0], cy: c[1], r: 3, fill: "#FFE6A3", stroke: "#000", "stroke-width": 0.7 }, g); },
    run(n, u, from, to, dur, off) { return gsap.fromTo(n, { x: u[0] * from, y: u[1] * from }, { x: u[0] * to, y: u[1] * to, duration: dur, repeat: -1, ease: "none", delay: -(off || 0) * dur }); },
    UX: (() => { const o = ISO.P(0, 0), a = ISO.P(1, 0); return [a[0] - o[0], a[1] - o[1]]; })(),
    UY: (() => { const o = ISO.P(0, 0), a = ISO.P(0, 1); return [a[0] - o[0], a[1] - o[1]]; })()
  };

  /* ======================= THE MODERN TOWN: 3 × 3 blocks, two roads, a railway, a distributed grid ======================= */
  // Corridors along gx: a road (gy 11.5..13) and a railway (gy 23.5..25). Along gy: two roads (gx 11.5..13 and 23.5..25).
  // Layering, row by row: each block back to front; after each block the along-gy traffic for that row (clipped to the
  // row's band, so a car slips behind the block to its right and in front of the block to its left); then the corridor.
  // o.calm: a quieter town (sections K and L): a third of the trees, a few cars, one walker per pavement, one train
  function town(root, defs, o) {
    o = o || {}; const calm = !!o.calm; let TC = 0;
    const N = 36, CR = [[11.5, 13], [23.5, 25]], id = "tw" + (++UID);
    const R = K.rect, base = el("g", null, root), T = 0.8;
    K.quad(base, [[0, N, 0], [N, N, 0], [N, N, -T], [0, N, -T]], "#C9CED6");
    K.quad(base, [[N, 0, 0], [N, N, 0], [N, N, -T], [N, 0, -T]], "#AEB5C0");
    R(base, 0, 0, N, N, "#DCEBD3", 1.3);
    R(base, 0.4, 0.4, 11.1, 6.6, "#CFE3B8"); for (let k = 1; k < 6; k++) K.lineGX(base, 0.4 + k * 1.03, 0.4, 11.1, 0, "#B7D29A", 1);
    R(base, 13.4, 0.4, 23.1, 11.1, "#E3E6EB");
    R(base, 30.2, 7.6, 35.6, 11.1, "#E8E0B8"); for (let k = 1; k < 4; k++) K.lineGX(base, 7.6 + k * 0.9, 30.2, 35.6, 0, "#D6CB98", 1); R(base, 25.6, 7.8, 29.6, 10.8, "#E3E6EB", 0.8);
    R(base, 7.0, 7.4, 11.1, 11.1, "#E3E6EB");
    R(base, 13.4, 13.4, 19.4, 16.6, "#E3E6EB");
    R(base, 25.4, 13.4, 35.6, 23.1, "#E3E6EB");
    // the park: paths crossing at a round fountain, lawns, flower beds
    R(base, 13.4, 29.9, 23.1, 30.7, "#EDE3CF", 0.8); R(base, 17.9, 25.4, 18.7, 36, "#EDE3CF", 0.8);
    ISO.poly(base, F.circle([18.3, 30.3, 0], "z", 1.6, 36), "#EDE3CF", { "stroke-width": 0.8 });
    R(base, 19.6, 31.6, 22.6, 35.4, C.water, 1);
    [[14.0, 26.0, 16.8, 26.6, "#F2A7B8"], [19.6, 26.0, 22.6, 26.6, "#FFCD00"], [14.0, 31.4, 15.0, 33.0, "#E0785A"], [16.0, 28.6, 17.4, 29.3, "#B48BD1"], [19.4, 28.6, 20.8, 29.3, "#F2A7B8"]].forEach(([a, b, c, d, col]) => { R(base, a, b, c, d, "#8CC07A", 0.8); for (let x = a + 0.15; x < c - 0.05; x += 0.3) for (let y = b + 0.15; y < d - 0.05; y += 0.3) { const q = P(x, y, 0.05); el("circle", { cx: q[0].toFixed(1), cy: q[1].toFixed(1), r: 1.6, fill: col, "data-nostroke": "" }, base); } });
    // the high street: a paved pedestrian street with shops along it, and a square in front
    R(base, 0.2, 28.4, 11.0, 31.0, "#E3DCCF", 0.8); for (let x = 0.6; x < 11; x += 0.8) K.lineGX(base, 29.7, x, x + 0.4, 0, "#CFC5B3", 1);
    R(base, 0.2, 31.0, 11.0, 35.8, "#EDE6DA", 0.8); R(base, 3.4, 32.2, 7.6, 34.8, "#B9DDA8", 0.8);
    R(base, 25.8, 25.8, 30.4, 35.2, "#E3E6EB", 1);
    R(base, 0, CR[0][0] - 0.45, N, CR[0][1] + 0.45, "#E9EBEE");
    [0, 1].forEach((i) => R(base, CR[i][0] - 0.45, 0, CR[i][1] + 0.45, N, "#E9EBEE"));
    R(base, 0, CR[1][0], N, CR[1][1], "#CFC8BE", 1);
    R(base, 0, CR[0][0], N, CR[0][1], "#5B6478", 1);
    [0, 1].forEach((i) => R(base, CR[i][0], 0, CR[i][1], N, "#5B6478", 1));
    const RT = [CR[1][0] + 0.12, CR[1][0] + 0.8];   // the two tracks (near side of each car)
    { let d = ""; for (let x = 0.2; x < N; x += 0.32) { if (CR.some(([a, b]) => x > a && x < b)) continue; RT.forEach((y) => { const a = P(x, y - 0.04), b = P(x, y + 0.7); d += `M${a[0]} ${a[1]} L${b[0]} ${b[1]} `; }); } el("path", { d, stroke: "#8F7A6E", "stroke-width": 1.2 }, base); }
    RT.forEach((y) => [0.04, 0.62].forEach((dy) => K.lineGX(base, y + dy, 0, N, 0, "#3E4860", 1.3)));
    { let d = ""; const m = (CR[0][0] + CR[0][1]) / 2, inX = (v) => CR.some(([a, b]) => v > a - 1 && v < b + 0.3);
      for (let k = 0.5; k < N; k += 1.4) {
        if (!inX(k)) { const a = P(k, m), b = P(k + 0.7, m); d += `M${a[0]} ${a[1]} L${b[0]} ${b[1]} `; }
        if (!inX(k)) [0, 1].forEach((i) => { const mm = (CR[i][0] + CR[i][1]) / 2, c = P(mm, k), e = P(mm, k + 0.7); d += `M${c[0]} ${c[1]} L${e[0]} ${e[1]} `; });
      }
      el("path", { d, stroke: "#FFFFFF", "stroke-width": 1.6, fill: "none" }, base);
      [0, 1].forEach((i) => { for (let k = 0; k < 5; k++) { const u = CR[i][0] + 0.15 + k * 0.3; R(base, u, CR[0][0] - 0.4, u + 0.15, CR[0][0] - 0.05, "#FFFFFF", 0); } });
    }

    const L = {}; for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) L[i + "" + j] = [];
    const put = (i, j, x, y, fn) => L[i + "" + j].push([x + y, fn]);
    const tree = (i, j, x, y, s, k) => { if (calm && (TC++ % 3)) return; put(i, j, x, y, (g) => K.tree(g, x, y, s, k)); };
    const ppl = (i, j, x, y, opt) => put(i, j, x, y, (g) => K.person(g, x, y, Object.assign({ idle: true }, opt)));
    const ev = (i, j, x, y, col) => { put(i, j, x, y, (g) => K.car(g, x, y, col, "x")); put(i, j, x + 1.35, y + 0.15, (g) => K.charger(g, x + 1.35, y + 0.15)); };

    // (0,0) wind on the back field; the line from it lands on a substation with a grid battery
    [[1.6, 1.4], [4.8, 0.9], [8.2, 1.6], [2.6, 4.6], [6.4, 4.2], [10.0, 4.8]].forEach(([x, y]) => put(0, 0, x, y, (g) => ISO.turbine(g, F, x, y, 4.8)));
    const PY = [[0.9, 9.2], [4.3, 9.2]], GAN = [7.6, 9.2];
    PY.forEach(([x, y]) => put(0, 0, x, y, (g) => K.pylon(g, x, y, 3.0)));
    put(0, 0, 7.6, 7.8, (g) => { K.gantry(g, GAN[0], GAN[1], "y"); K.xfmr(g, 8.4, 7.8); K.xfmr(g, 8.4, 9.4); });
    put(0, 0, 10.4, 8.4, (g) => F.box(g, 9.8, 7.9, 0, 1.0, 1.2, 0.9, { left: C.w2, right: C.w3, top: C.w1 }));
    // the grid spreads out: a line south through the homes to a second substation by the flats, and a line from the solar farm to the factory
    const L3 = [[35.2, 7.4]], G3 = [34.9, 14.4, 2.15, "x"];
    L3.forEach(([x, y]) => put(2, 0, x, y, (g) => K.pylon(g, x, y, 3.0, "x")));
    put(2, 1, 34.9, 14.4, (g) => K.gantry(g, G3[0], G3[1], "x"));
    // the conductors, one span at a time, drawn in the block where each span ends: behind what stands in front of it
    const blk = (v) => (v < 12.25 ? 0 : v < 24.25 ? 1 : 2);
    [[PY.concat([[GAN[0], GAN[1], 2.15, "y"]]), "y"], [L3.concat([G3]), "x"]].forEach(([pts, ax]) => pts.slice(1).forEach((b, i) => {
      const a = pts[i]; put(blk(b[0]), blk(b[1]), b[0], b[1] - 0.05, (g) => K.spans(g, [a, b], 3.0, ax)); }));
    put(0, 0, 9.6, 10.6, (g) => K.batt(g, 8.4, 10.3, 2.4));
    [[0.7, 7.4], [2.2, 7.8], [5.8, 7.6], [11.6, 5.6], [0.8, 11.0, 0.9, "pine"], [3.0, 11.0], [5.4, 11.0, 0.9, "pine"]].forEach(([x, y, s, k]) => tree(0, 0, x, y, s || 0.9, k));
    // (1,0) downtown: towers with rooftop solar and gardens, chargers along the kerb
    [[13.8, 1.0, 2.4, 2.4, 8.8, "#DCE3EA", C.water, "plant"], [17.0, 0.8, 2.4, 2.4, 10.4, "#C9D2DC", C.water, "pv"], [20.4, 1.2, 2.2, 2.0, 7.0, "#EDE6DA", "#BFD3E6", "garden"],
     [13.8, 4.8, 2.4, 2.2, 5.6, "#E3DDD3", "#BFD3E6", "pv"], [17.2, 4.8, 2.6, 2.2, 4.4, "#F1F2F4", C.water, "garden"], [20.6, 4.6, 2.2, 2.2, 6.0, "#D8DEE6", C.water, "pv"]]
      .forEach(([x, y, w, d, h, b, gl, r]) => put(1, 0, x + w / 2, y + d / 2, (g) => K.tower(g, x, y, w, d, h, b, gl, r)));
    [[13.9, 9.6, C.car], [16.5, 9.6, "#E5C189"], [19.1, 9.6, "#A6D84A"]].forEach(([x, y, c]) => ev(1, 0, x, y, c));
    [[13.6, 11.0], [15.8, 11.0], [18.4, 11.0], [21.0, 11.0], [22.8, 8.6]].forEach(([x, y]) => tree(1, 0, x, y, 0.85));
    [[15.4, 8.4], [15.7, 8.5], [21.6, 9.8], [18.4, 8.2]].forEach(([x, y]) => ppl(1, 0, x, y, { phone: true }));
    // (2,0) a solar farm on the edge of town
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const x = 25.8 + c * 2.4, y = 0.8 + r * 1.55; put(2, 0, x, y, (g) => ISO.panel(g, F, x, y, 1.9, 0.95)); }
    put(2, 0, 35.0, 3.2, (g) => F.box(g, 35.0, 3.0, 0, 0.6, 0.8, 0.7, { left: C.w2, right: C.w3, top: C.w1 }));
    [[26.4, 8.2, 1], [28.2, 8.6, -1], [30.6, 8.0, 1], [32.4, 9.4, -1]].forEach(([x, y, d], i) => put(2, 0, x, y, (g) => K.sheep(g, x, y, { dir: d, graze: i % 2 === 0 })));
    [[25.8, 8.0], [25.8, 9.4], [27.7, 8.0], [27.7, 9.4]].forEach(([x, y]) => put(2, 0, x + 0.9, y + 0.35, (g) => K.batt(g, x, y, 1.8)));
    [[31.2, 10.8], [34.0, 10.8]].forEach(([x, y]) => tree(2, 0, x, y, 0.9, "dark"));
    // (0,1) homes with rooftop solar, heat pumps and EVs charging on the drives
    const roofs = ["#B07466", "#A3695D", "#B9806F", "#9C6457"];
    [[1.2, 14.0], [6.4, 14.0], [1.6, 18.8], [6.8, 18.8]].forEach(([x, y], i) => {
      put(0, 1, x + 1, y + 1, (g) => {
        ISO.house(g, F, x, y, 2.2, 1.6, 1.1, 0.8, roofs[i]);
        [[0.25, 0.97], [1.03, 1.75]].forEach(([u0, u1]) => K.pvQuad(g, [x + u0, y + 1.66, 1.16], [x + u1, y + 1.66, 1.16], [x + u1, y + 1.02, 1.67], [x + u0, y + 1.02, 1.67], 4, 3));
        F.box(g, x + 2.25, y + 0.5, 0, 0.45, 0.3, 0.42, { left: C.w2, right: C.w3, top: C.w1 });
      });
      ev(0, 1, x + 0.2, y + 2.0, [C.car, "#E5C189", "#F1F2F4", "#4AB4D6"][i]);
      put(0, 1, x + 1.5, y - 0.3, (g) => { K.hedge(g, x - 0.4, y - 0.35, x + 3.6, y - 0.35); });
    });
    [[4.6, 15.2], [9.8, 15.0, 1, "dark"], [10.4, 20.0], [0.6, 22.8], [4.4, 22.6, 1, "pine"], [5.2, 19.6, 0.9], [9.4, 22.8, 1, "dark"]].forEach(([x, y, s, k]) => tree(0, 1, x, y, s || 0.95, k));
    [[3.9, 21.9, { bag: true }], [4.3, 22.0, { dress: true }], [9.0, 17.4, {}], [5.4, 17.4, { cap: "#E0785A" }]].forEach(([x, y, o]) => ppl(0, 1, x, y, o));
    // (1,1) a solar-roofed charging hub, offices and a community battery
    put(1, 1, 16.4, 15.0, (g) => {
      [[13.9, 14.0], [18.9, 14.0], [13.9, 16.2], [18.9, 16.2]].forEach(([x, y]) => F.box(g, x, y, 0, 0.1, 0.1, 1.15, { left: C.g1, right: C.g2, top: C.w1 }));
      F.box(g, 13.8, 13.9, 1.15, 5.3, 2.5, 0.08, { left: C.w2, right: C.w3, top: C.pv });
      for (let u = 14.3; u < 19; u += 0.55) K.seg(g, [u, 13.9, 1.23], [u, 16.4, 1.23], C.pvl, 0.6);
    });
    [[14.1, 14.4, C.car], [15.6, 14.4, "#E0785A"], [17.1, 14.4, "#A6D84A"], [14.1, 15.5, "#F1F2F4"], [17.1, 15.5, "#4AB4D6"]].forEach(([x, y, c]) => put(1, 1, x, y, (g) => { K.charger(g, x + 1.25, y - 0.25); K.car(g, x, y, c, "x"); }));
    put(1, 1, 21.2, 15.0, (g) => K.tower(g, 20.0, 13.8, 2.6, 2.4, 4.6, "#F1F2F4", C.water, "pv"));
    put(1, 1, 21.4, 18.6, (g) => K.tower(g, 20.2, 17.6, 2.4, 2.2, 3.4, "#E3DDD3", "#BFD3E6", "garden"));
    put(1, 1, 15.6, 19.0, (g) => { const b = F.box(g, 14.2, 18.6, 0, 2.6, 0.9, 0.95, { left: "#62BFB2", right: "#3E9488", top: "#9ED9CF" }); for (let u = 0.25; u < 2.4; u += 0.45) F.face(g, F.L, b, u, 0.15, u + 0.2, 0.75, "#9ED9CF", { "stroke-width": 0.6 }); });
    [[13.6, 22.8], [15.6, 22.8], [17.6, 22.8], [19.6, 22.8], [22.6, 21.6], [18.6, 18.0, 1, "dark"]].forEach(([x, y, s, k]) => tree(1, 1, x, y, s || 0.95, k));
    [[17.6, 20.4], [17.9, 20.5], [19.0, 17.0], [16.0, 17.2]].forEach(([x, y]) => ppl(1, 1, x, y));
    // (2,1) a factory with electric trucks, and its own substation
    put(2, 1, 29.0, 16.8, (g) => ISO.draw("factory", g, [29.6, 17.6], 1.15));
    put(2, 1, 33.0, 14.6, (g) => { F.box(g, 32.4, 14.0, 0, 1.0, 0.9, 0.8, { left: C.g1, right: C.g2, top: C.w1 }); [0.3, 0.6].forEach((v) => ISO.line(g, [P(32.9, 14 + v * 0.9, 0.8), P(32.9, 14 + v * 0.9, 1.1)], { "stroke-width": 1.4 })); });
    put(2, 1, 34.0, 21.4, (g) => { F.box(g, 33.4, 20.8, 0, 1.2, 1.2, 0.12, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" }); ISO.turbine(g, F, 34.0, 21.4, 5.2); });
    [[25.6, 22.8], [28.0, 22.8], [30.4, 22.8], [35.2, 18.6, 1, "dark"]].forEach(([x, y, s, k]) => tree(2, 1, x, y, s || 0.95, k));
    // (0,2) the high street: shops and cafés along a pedestrian street, a square with a market, music and people out and about
    [[0.4, 25.6, 2.0, 2.4, 2.6, "#E3DDD3", "#47B970"], [2.5, 25.6, 1.8, 2.4, 3.2, "#EDE6DA", "#E0785A"], [4.4, 25.6, 2.0, 2.4, 2.4, "#DCE3EA", "#4AB4D6"], [6.5, 25.6, 1.8, 2.4, 3.0, "#E8E0D2", "#FFCD00"], [8.4, 25.6, 2.2, 2.4, 2.6, "#E3DDD3", "#B5302E"]].forEach(([x, y, w, d, h, c, aw], i) => put(0, 2, x + w / 2, y + d / 2, (g) => K.shop(g, x, y, w, d, h, c, aw, { win: C.water, sign: ["#2F6F4E", "#B5302E", "#204C8A", "#8F6B4E", "#3E4860"][i], roof: i % 2 ? "pv" : null })));
    // café terraces: little tables with parasols, people sitting and chatting
    [[1.0, 28.9], [2.2, 29.0], [6.9, 28.9], [8.1, 29.0], [9.3, 28.9]].forEach(([x, y], i) => put(0, 2, x, y, (g) => K.table(g, x, y, ["#E0785A", "#47B970", "#FFCD00", "#4AB4D6", "#E0785A"][i])));
    [[1.5, 29.3, { top: "#4AB4D6" }], [2.7, 29.4, { dress: true, top: "#E0785A" }], [7.4, 29.3, { top: "#FFCD00", long: true }], [8.6, 29.4, { cap: "#3E4860", top: "#47B970" }], [9.8, 29.3, { top: "#8C6F9E", phone: true }]].forEach(([x, y, o]) => ppl(0, 2, x, y, o));
    // planters with small trees along the street, string lights between them
    [[0.6, 30.7], [3.4, 30.7], [6.2, 30.7], [9.0, 30.7]].forEach(([x, y]) => put(0, 2, x, y, (g) => { F.box(g, x - 0.3, y - 0.3, 0, 0.6, 0.6, 0.3, { left: "#C9A988", right: "#A9876A", top: "#7DBB7E" }); K.tree(g, x, y, 0.7, "round"); }));
    put(0, 2, 5.6, 30.6, (g) => { const pts = [0.6, 3.4, 6.2, 9.0]; let d = ""; for (let k = 1; k < pts.length; k++) { const a = P(pts[k - 1], 30.7, 1.3), b = P(pts[k], 30.7, 1.3); d += `M${a[0]} ${a[1]} Q${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 + 8} ${b[0]} ${b[1]} `; for (let u = 0.15; u < 1; u += 0.15) { const x = a[0] + (b[0] - a[0]) * u, y = a[1] + (b[1] - a[1]) * u + 8 * 4 * u * (1 - u) / 2; el("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: 1.5, fill: "#FFE680", class: "fx anim blink", style: `animation-delay:${(u * 3).toFixed(1)}s`, "data-nostroke": "" }, g); } } el("path", { d, stroke: "#3E4860", "stroke-width": 0.6, fill: "none" }, g); });
    // the square: a market with striped stalls, a busker, a fountain, benches, trees
    [[0.6, 31.6, "#47B970"], [0.6, 33.0, "#E0785A"], [0.6, 34.4, "#4AB4D6"]].forEach(([x, y, c]) => put(0, 2, x + 0.8, y + 0.4, (g) => K.stall(g, x, y, c)));
    [[2.6, 32.2, { top: "#FFCD00", bag: true }], [2.9, 33.6, { dress: true, top: "#47B970" }], [2.5, 35.0, { top: "#E0785A" }], [8.8, 32.0, { cap: "#E0785A", top: "#F1F2F4" }], [9.6, 34.2, { top: "#4AB4D6", long: true }], [10.2, 33.0, { top: "#8C6F9E" }]].forEach(([x, y, o]) => ppl(0, 2, x, y, o));
    put(0, 2, 5.5, 33.5, (g) => K.fountain(g, 5.5, 33.5, 0.8));
    put(0, 2, 8.6, 33.4, (g) => { K.person(g, 8.6, 33.4, { idle: true, cap: "#262C3A", top: "#B5302E" }); const q = P(8.75, 33.5, 0.3); el("path", { d: `M${q[0] - 3} ${q[1] - 2} l7 -3 l1 2 l-7 3 Z`, fill: "#C99A5B" }, g); });
    [[4.0, 35.3], [7.0, 35.3]].forEach(([x, y]) => put(0, 2, x + 0.4, y + 0.1, (g) => K.bench(g, x, y)));
    [[3.7, 32.4, 0.9], [7.4, 32.4, 0.9, "dark"], [10.6, 35.4, 1], [0.4, 35.6, 0.9, "dark"]].forEach(([x, y, s, k]) => tree(0, 2, x, y, s, k));
    { const w = (y, dir, dur, off, o) => put(0, 2, 5.5, y, (g) => { const n = el("g", null, g); K.person(n, 0, y, Object.assign({ walk: true }, o)); dir > 0 ? K.run(n, K.UX, 0.6, 10.6, dur, off) : K.run(n, K.UX, 10.6, 0.6, dur, off); gsap.to(n, { opacity: 1 }); });
      w(29.9, 1, 26, 0.1, { top: "#E0785A", bag: true }); w(30.1, 1, 30, 0.6, { dress: true, top: "#4AB4D6" }); w(30.3, -1, 28, 0.3, { cap: "#47B970", top: "#F1F2F4" }); w(30.0, -1, 24, 0.8, { top: "#FFCD00", phone: true }); }
    // (1,2) the park: a fountain where the paths meet, a bandstand, a playground, a lake with a café terrace, picnics and flowers
    put(1, 2, 18.3, 30.3, (g) => K.fountain(g, 18.3, 30.3, 1.1));
    put(1, 2, 15.4, 27.6, (g) => K.bandstand(g, 15.4, 27.6));
    put(1, 2, 21.2, 27.8, (g) => K.playground(g, 20.0, 27.2));
    put(1, 2, 15.4, 34.4, (g) => { const b = F.box(g, 14.0, 33.8, 0, 2.6, 1.4, 1.1, { left: "#F1F2F4", right: C.w3, top: "#47B970" }); F.face(g, F.L, b, 0.2, 0, 2.4, 0.7, C.water, { "stroke-width": 0.7 }); for (let k = 0; k < 6; k++) ISO.poly(g, [F.p(14.0 + k * 0.43, 35.2, 0.95), F.p(14.43 + k * 0.43, 35.2, 0.95), F.p(14.43 + k * 0.43, 35.6, 0.75), F.p(14.0 + k * 0.43, 35.6, 0.75)], k % 2 ? "#FFFFFF" : "#47B970", { "stroke-width": 0.6 }); });
    [[17.0, 34.6, "#E0785A"], [17.0, 35.6, "#4AB4D6"]].forEach(([x, y, c]) => put(1, 2, x, y, (g) => K.table(g, x, y, c)));
    [[17.5, 34.9, { top: "#FFCD00" }], [17.5, 35.9, { dress: true, top: "#8C6F9E" }]].forEach(([x, y, o]) => ppl(1, 2, x, y, o));
    [[20.0, 33.0], [21.6, 34.0]].forEach(([x, y], i) => put(1, 2, x, y, (g) => { const q = el("g", null, g); F.box(q, x, y, 0, 0.7, 0.3, 0.12, { left: ["#FFFFFF", "#F2B134"][i], right: "#C9CED6", top: ["#FFFFFF", "#F2B134"][i] }); F.box(q, x + 0.15, y + 0.05, 0.12, 0.25, 0.2, 0.18, { left: "#E0785A", right: "#B5302E", top: "#F4A88A" }); gsap.to(q, { y: 2, duration: 1.6 + i * 0.4, repeat: -1, yoyo: true, ease: "sine.inOut" }); }));
    [[14.2, 29.0, "#E0785A"], [16.5, 31.9, "#47B970"]].forEach(([x, y, c]) => put(1, 2, x, y, (g) => { K.quad(g, [[x - 0.5, y - 0.4, 0.01], [x + 0.5, y - 0.4, 0.01], [x + 0.5, y + 0.4, 0.01], [x - 0.5, y + 0.4, 0.01]], c); K.quad(g, [[x - 0.1, y - 0.1, 0.01], [x + 0.2, y - 0.1, 0.01], [x + 0.2, y + 0.15, 0.01], [x - 0.1, y + 0.15, 0.01]], "#C99A5B"); }));
    [[14.4, 29.5, { top: "#4AB4D6" }], [14.8, 29.4, { dress: true, top: "#FFCD00" }], [16.9, 32.3, { top: "#E0785A" }], [16.2, 32.4, { long: true, top: "#F1F2F4" }], [19.6, 30.9, { top: "#47B970", phone: true }], [17.0, 30.0, { dress: true, top: "#8C6F9E" }]].forEach(([x, y, o]) => ppl(1, 2, x, y, o));
    [[16.6, 29.6], [19.6, 29.6]].forEach(([x, y]) => put(1, 2, x + 0.4, y + 0.1, (g) => K.bench(g, x, y)));
    put(1, 2, 13.8, 31.2, (g) => K.icecream(g, 13.8, 31.2));
    [[17.2, 26.0], [22.8, 26.4, 1, "dark"], [16.8, 32.6], [22.6, 29.6], [22.6, 31.0, 1, "dark"], [19.2, 25.8, 0.9, "round"], [13.8, 25.9, 0.9, "pine"], [13.9, 33.0, 1, "dark"], [23.0, 35.6, 1], [19.0, 35.8, 0.9, "round"]].forEach(([x, y, s, k]) => tree(1, 2, x, y, s || 1, k));
    { const w = (y, dir, dur, off, o) => put(1, 2, 18.3, y, (g) => { const n = el("g", null, g); K.person(n, 0, y, Object.assign({ walk: true }, o)); dir > 0 ? K.run(n, K.UX, 13.6, 23.0, dur, off) : K.run(n, K.UX, 23.0, 13.6, dur, off); });
      w(30.2, 1, 30, 0.2, { top: "#E0785A" }); w(30.45, -1, 26, 0.6, { dress: true, top: "#47B970" }); }
    // (2,2) data centres with their own solar field, a substation and batteries
    [[26.2, 26.2], [26.2, 29.6]].forEach(([x, y]) => put(2, 2, x + 1.9, y + 1.3, (g) => K.dataHall(g, x, y, 3.8, 2.6)));
    put(2, 2, 26.9, 33.9, (g) => K.xfmr(g, 26.4, 33.4));
    [[27.9, 33.2], [27.9, 34.2]].forEach(([x, y]) => put(2, 2, x + 0.9, y + 0.35, (g) => K.batt(g, x, y, 1.8)));
    for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) { const x = 30.9 + c * 2.3, y = 26.2 + r * 1.5; put(2, 2, x, y, (g) => ISO.panel(g, F, x, y, 1.9, 0.95)); }
    [[25.6, 25.6, 0.9, "dark"], [35.4, 25.6, 0.9, "pine"]].forEach(([x, y, s, k]) => tree(2, 2, x, y, s, k));
    [[29.6, 32.6], [29.9, 32.7]].forEach(([x, y]) => ppl(2, 2, x, y, { top: "#3E4860" }));

    // extra items from outside (the road signs of section L), each drawn in its block in depth order; then a layer just
    // above the ground and below everything standing on it (the glass tubes of K and L)
    (o.extra || []).forEach(([x, y, fn]) => { const bk = (v) => (v < 12.25 ? 0 : v < 24.25 ? 1 : 2); put(bk(x), bk(y), x, y, fn); });
    if (o.under) o.under(el("g", null, root));
    // assemble
    // (the calm town has no clip-paths at all: no side-road traffic to slip behind blocks, and no clip at the land's edge,
    // where vehicles fade out anyway. Large clips repainted every frame under a moving camera made the picture flicker.)
    const clip = (name, pts) => { if (calm) return null; const cp = el("clipPath", { id: id + name }, defs); el("polygon", { points: ISO.pts(pts) }, cp); return `url(#${id + name})`; };
    const CP = (c) => (c ? { "clip-path": c } : null);
    const up = (q) => [q[0], q[1] - 600], dn = (q) => [q[0], q[1] + 600];
    const slab = clip("slab", [up(P(0, 0)), up(P(N, 0)), dn(P(N, N)), dn(P(0, N))]);
    const band = (j) => { const g0 = j === 0 ? -400 : (CR[j - 1][0] + CR[j - 1][1]) / 2, g1 = j === 2 ? 400 : (CR[j][0] + CR[j][1]) / 2; return clip("row" + j, [P(-400, g0), P(400, g0), P(400, g1), P(-400, g1)]); };
    const GY = { 0: [], 1: [] }, AX = [], JX = [];
    for (let j = 0; j < 3; j++) {
      const bandC = band(j);
      for (let i = 0; i < 3; i++) {
        const g = el("g", null, root);
        L[i + "" + j].sort((a, b) => a[0] - b[0]).forEach(([, fn]) => fn(el("g", null, g)));
        if (i < 2 && !calm) { const s = el("g", CP(slab), root); GY[i].push(el("g", CP(bandC), s)); }
      }
      if (j < 2) AX.push(el("g", CP(slab), root));
      if (j === 0 && !calm) {   // a car crossing the main road is drawn once more above it, clipped to the junction, so it never slips under a waiting car
        const sl = el("g", { "clip-path": slab }, root), [q0, q1] = [CR[0][0] - 0.45, CR[0][1] + 0.45];
        [0, 1].forEach((i) => { const [p0, p1] = [CR[i][0] - 0.45, CR[i][1] + 0.45], U = (q) => [q[0], q[1] - 300];
          JX.push(el("g", { "clip-path": clip("jx" + i, [P(p0, q1), U(P(p0, q1)), U(P(p0, q0)), U(P(p1, q0)), P(p1, q0), P(p1, q1)]) }, sl)); });
      }
    }
    // the traffic: one small simulation per town. Every vehicle keeps a safe gap to the one ahead in its lane, waits at red
    // lights (a 16 s cycle per junction) and at the level crossing while a train is near, and fades out near the edge of the land.
    const V = [], a0 = CR[0][0], a1 = CR[0][1], WZ = 1.55;
    const add = (layers, axis, at, dir, len, vmax, draw, kind) => {
      const nodes = layers.map((Ly) => { const n = el("g", null, Ly); draw(n); return n; });
      V.push({ nodes, axis, at, dir, len, vmax, v: vmax, s: 0, kind: kind || "car", lane: axis + at.toFixed(2) + dir });
    };
    const CARS = [C.car, "#E5C189", "#A6D84A", "#F1F2F4", "#E0785A", "#4AB4D6", "#8C6F9E", "#3E4860", "#FFCD00"];
    let ci = 0; const nextCol = () => CARS[(ci++) % CARS.length];
    // along gx: cars and buses on the main road, bikes at its edge, people on both pavements
    { const A = [AX[0]];
      for (let k = 0; k < 2; k++) [-1, 1].forEach((dir) => { const y = a0 - 0.32 + (dir > 0 ? 0 : 0.16) + k * (a1 - a0 + 0.62); const t = { top: null };
        (calm ? [0] : [0, 1, 2]).forEach(() => add(A, "x", y, dir, 0.3, 0.45 + Math.random() * 0.15, (n) => K.person(n, 0, y, { walk: true, bag: Math.random() < 0.3, dress: Math.random() < 0.3 }), "walk")); });
      (calm ? [] : [0, 1]).forEach(() => add(A, "x", a0 + 0.02, 1, 0.75, 1.3, (n) => K.bike(n, -0.65, a0 - 0.08, ["#E0785A", "#4AB4D6", "#47B970"][ci++ % 3]), "bike"));
      [[a0 + 0.12, 1], [a0 + 0.85, -1]].forEach(([y, dir]) => (calm ? (dir > 0 ? ["car", "bus"] : ["car"]) : ["car", "car", "bus", "car", "car"]).forEach((t) => {
        const len = t === "bus" ? 2.8 : 1.2, x0 = dir > 0 ? -len : 0, col = nextCol();
        add(A, "x", y, dir, len, t === "bus" ? 2.0 : 2.7, (n) => (t === "bus" ? K.bus(n, x0, y) : K.car(n, x0, y, col, "x")), t);
      }));
    }
    // along gy: two roads, one each way per side
    if (!calm) [0, 1].forEach((i) => { const c0 = CR[i][0];
      [[c0 + 0.14, 1], [c0 + 0.86, -1]].forEach(([x, dir]) => (calm ? ["car"] : ["car", "car", i ? "bus" : "car", "car"]).forEach((t) => {
        const len = t === "bus" ? 2.8 : 1.2, y0 = dir > 0 ? -len : 0, col = nextCol();
        add(GY[i].concat([JX[i]]), "y", x, dir, len, t === "bus" ? 2.0 : 2.7, (n) => (t === "bus" ? K.bus(n, x - 0.05, y0, "#4AB4D6", "y") : K.car(n, x, y0, col, "y")), t);
      }));
    });
    // the railway: overhead masts, a train on each track, the contact wires
    { const A = AX[1], y0 = CR[1][0];
      for (let x = 1; x < N; x += 3.2) { const g = el("g", null, A); K.quad(g, [[x - 0.04, y0 + 0.02, 0], [x + 0.04, y0 + 0.02, 0], [x + 0.04, y0 + 0.02, 1.7], [x - 0.04, y0 + 0.02, 1.7]], "#B0B7C6", { "stroke-width": 0.6 }); K.seg(g, [x, y0 + 0.02, 1.62], [x, y0 + 1.4, 1.62], "#626E88", 1.6); }
      (calm ? [[RT[0], 1, "#47B970"]] : [[RT[0], 1, "#47B970"], [RT[1], -1, "#4AB4D6"]]).forEach(([y, dir, st]) => add([A], "x", y, dir, 8.0, 4.2, (n) => K.train(n, dir > 0 ? -2.6 : 5.4, y, 3, { stripe: st, wire: WZ }), "train"));
      const W = el("g", null, A); RT.forEach((y) => K.lineGX(W, y + 0.33, 0, N, WZ, "#3E4860", 0.9));
    }
    // signals: a traffic light at each junction (for each road), and flashing lights at both level crossings
    const LAMPS = [];
    { const A = AX[0];
      [0, 1].forEach((i) => { const [c0, c1] = CR[i];
        [[c0 - 0.3, a1 + 0.3, "x"], [c1 + 0.3, a0 - 0.3, "y"], [c1 + 0.3, a1 + 0.3, "x"], [c0 - 0.3, a0 - 0.3, "y"]].forEach(([x, y, ax]) => {
          const g = el("g", null, A); K.quad(g, [[x - 0.03, y, 0], [x + 0.03, y, 0], [x + 0.03, y, 1.0], [x - 0.03, y, 1.0]], "#3E4860", { "stroke-width": 0.5 });
          const b = F.box(g, x - 0.08, y - 0.08, 1.0, 0.16, 0.16, 0.42, { left: "#262C3A", right: "#1E2433", top: "#3E4860" });
          const r = P(x, y + 0.08, 1.31), gr = P(x, y + 0.08, 1.12);
          LAMPS.push({ i, ax, r: el("circle", { cx: r[0], cy: r[1], r: 1.9, fill: "#E04B00" }, g), g: el("circle", { cx: gr[0], cy: gr[1], r: 1.9, fill: "#47B970" }, g) });
        });
      });
    }
    const XING = [];
    { const A = AX[1], [r0, r1] = CR[1];
      [0, 1].forEach((i) => { const [c0, c1] = CR[i];
        [[c0 - 0.3, r0 - 0.25], [c1 + 0.3, r1 + 0.25]].forEach(([x, y]) => {
          const g = el("g", null, A); K.quad(g, [[x - 0.03, y, 0], [x + 0.03, y, 0], [x + 0.03, y, 0.9], [x - 0.03, y, 0.9]], "#F1F2F4", { "stroke-width": 0.5 });
          const c = P(x, y, 0.95); el("path", { d: `M${c[0] - 6} ${c[1] - 3} L${c[0] + 6} ${c[1] + 3} M${c[0] - 6} ${c[1] + 3} L${c[0] + 6} ${c[1] - 3}`, stroke: "#B5302E", "stroke-width": 2 }, g);
          const l1 = P(x - 0.12, y, 0.72), l2 = P(x + 0.12, y, 0.72);
          XING.push({ i, a: el("circle", { cx: l1[0], cy: l1[1], r: 2, fill: "#E04B00", opacity: 0 }, g), b: el("circle", { cx: l2[0], cy: l2[1], r: 2, fill: "#E04B00", opacity: 0 }, g) });
        });
      });
    }

    const CYC = 16, phase = (t, i) => { const u = (t + i * 5) % CYC; return u < 7 ? "x" : (u >= 8 && u < 15 ? "y" : "-"); };
    const left = (t, i, ax) => { const u = (t + i * 5) % CYC; return ax === "x" ? 7 - u : 15 - u; };
    const XJ = CR.map(([a, b]) => [a - 0.45, b + 0.45]), YJ = [a0 - 0.45, a1 + 0.45], RJ = [CR[1][0] - 0.3, CR[1][1] + 0.3];
    const entry = (v, [lo, hi]) => (v.dir > 0 ? lo : N - hi);
    const front = (v) => (v.dir > 0 ? v.s : N - v.s);
    const closed = [false, false];
    let t = 0;
    const lanes = {}; V.forEach((v) => (lanes[v.lane] = lanes[v.lane] || []).push(v));
    Object.values(lanes).forEach((ls) => { let s = N + 1; ls.forEach((v) => { v.s = s; s -= v.len + (v.kind === "walk" ? 3 + Math.random() * 6 : v.kind === "train" ? 30 : 2.5 + Math.random() * 5); }); });
    function step(dt) {
      t += dt;
      // a level crossing closes while a train is on it or within 7 units of it
      [0, 1].forEach((i) => { const [lo, hi] = [CR[i][0] - 0.5, CR[i][1] + 0.5]; closed[i] = V.some((v) => { if (v.kind !== "train") return false; const f = front(v), a = v.dir > 0 ? f - v.len : f - 12, b = v.dir > 0 ? f + 12 : f + v.len; return b > lo && a < hi; }); });
      Object.values(lanes).forEach((ls) => {
        ls.sort((p, q) => q.s - p.s);
        ls.forEach((v, k) => {
          let room = Infinity;
          if (k > 0) room = ls[k - 1].s - ls[k - 1].len - v.s - (v.kind === "walk" ? 0.5 : 0.45);
          if (v.kind !== "train") {
            const stopAt = (iv, red) => { const e = entry(v, iv); if (red && v.s < e - 0.02) room = Math.min(room, e - 0.12 - v.s); };
            const clear = (iv) => (iv[1] - iv[0] + v.len + 0.3) / v.vmax;   // time needed to get right across
            if (v.axis === "x") XJ.forEach((iv, i) => stopAt(iv, phase(t, i) !== "x" || left(t, i, "x") < clear(iv)));
            else { const i = v.at < 18 ? 0 : 1; stopAt(YJ, phase(t, i) !== "y" || left(t, i, "y") < clear(YJ)); stopAt(RJ, closed[i]); }
          }
          const want = Math.max(0, Math.min(v.vmax, room / 0.7));
          v.v = Math.min(want, v.v + v.vmax * 0.9 * dt);
          v.s += Math.min(v.v * dt, Math.max(0, room));
        });
        // off the far edge: rejoin behind the last one in the lane
        ls.forEach((v) => { if (v.s - v.len > N + 1) { const last = ls.reduce((m, q) => (q !== v && q.s < m.s ? q : m), { s: 1e9, len: 0 });
          const gap = v.kind === "train" ? 25 + Math.random() * 25 : v.kind === "walk" ? 2 + Math.random() * 8 : 1.5 + Math.random() * 6;
          v.s = Math.min(-0.5, (last.s < 1e9 ? last.s - last.len : 0) - gap); v.v = v.vmax * 0.8; } });
      });
    }
    const clamp = (u) => Math.max(0, Math.min(1, u));
    function draw() {
      V.forEach((v) => {
        const f = front(v), c = f - v.dir * v.len / 2, u = v.axis === "x" ? K.UX : K.UY;
        const op = clamp((c - 0.3) / 2.2) * clamp((N - 0.3 - c) / 2.2);
        const tr = `translate(${(u[0] * f).toFixed(1)} ${(u[1] * f).toFixed(1)})`;
        const inJ = v.axis === "y" && (v.dir > 0 ? f > YJ[0] && f - v.len < YJ[1] : f < YJ[1] && f + v.len > YJ[0]);
        v.nodes.forEach((n, k) => { n.setAttribute("transform", tr); const o2 = op.toFixed(2); if (n.__o !== o2) { n.__o = o2; n.setAttribute("opacity", o2); } const dsp = op < 0.01 || (v.axis === "y" && k === 3 && !inJ) ? "none" : ""; if (n.__d !== dsp) { n.__d = dsp; n.style.display = dsp; } });
      });
      LAMPS.forEach((l) => { const go = phase(t, l.i) === l.ax; l.r.setAttribute("opacity", go ? 0.15 : 1); l.g.setAttribute("opacity", go ? 1 : 0.15); });
      const blink = Math.floor(t * 2.5) % 2;
      XING.forEach((x) => { x.a.setAttribute("opacity", closed[x.i] ? blink : 0); x.b.setAttribute("opacity", closed[x.i] ? 1 - blink : 0); });
    }
    for (let k = 0; k < 600; k++) step(0.05);   // warm up, so queues and gaps look natural from the first frame
    draw();
    let last = null; const host = root.ownerSVGElement || root;   // only simulate while the scene is on screen
    const tick = (time) => { if (last === null) last = time; const dt = Math.min(0.1, time - last); last = time; if (!root.isConnected || document.hidden || dt <= 0) return; const r = host.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; step(dt); draw(); };
    gsap.ticker.add(tick);
  }

  /* ======================= HERO ======================= */
  function hero(svg) {
    svg.classList.add("iso", "is-live");
    svg.setAttribute("data-noink", "");
    const defs = svg.querySelector("defs") || el("defs", null, svg);
    sky(svg, "iso-sky-hero");
    const root = el("g", { transform: "translate(521 156) scale(0.65)" }, svg);
    town(root, defs);
    ISO.tweens.forEach((t) => t.play && t.play());
    return gsap.timeline({ paused: true });
  }

  /* ======================= THE SIX AGES (sections C and G): isometric strips ======================= */
  // Each strip is a tall window onto a small isometric landscape of its age, zoomed in. The main line of each age
  // (canal, railway, street, highway) crosses the strip diagonally; landmarks sit at the back, homes and people in front.
  // In G, extra motion (W1) and growth (W2) are added. The sixth strip is a window onto the modern town, which wipes open.
  const X0 = 80, SW = 240, TOP = 64, ZS = 0.95;
  const AGES = [
    { name: "CANALS", date: "1760s", sky: [["0", "#FBF4E2"], ["1", "#EFE6CF"]] },
    { name: "RAILWAYS", date: "1830s", sky: [["0", "#F1ECE6"], ["1", "#E2DAD0"]] },
    { name: "TELEPHONE LINES", date: "1880s", sky: [["0", "#EEF2F6"], ["1", "#DCE3EA"]] },
    { name: "HIGHWAYS", date: "1950s", sky: [["0", "#F2F8FD"], ["1", "#D6E8F6"]] },
    { name: "THE INTERNET", date: "1990s", sky: [["0", "#F2F4F8"], ["1", "#DDE2EC"]] },
    { name: "ELECTRICITY GRIDS", date: "NOW", sky: SKY }
  ];
  function era(k, g, X) {
    // Only a diagonal band of each strip shows (|gx - gy| < ~4.4), so everything is placed along it, from the back (top) to the front (bottom).
    const groundCol = ["#DCEBC9", "#E2E2D0", "#E3E6EB", "#DCEBD3", "#E3E6EB"][k], N = 22, R = K.rect;
    K.quad(g, [[0, N, 0], [N, N, 0], [N, N, -0.8], [0, N, -0.8]], "#C9CED6");
    K.quad(g, [[N, 0, 0], [N, N, 0], [N, N, -0.8], [N, 0, -0.8]], "#AEB5C0");
    R(g, 0, 0, N, N, groundCol, 1.3);
    const gnd = el("g", null, g), back = el("g", null, g), w2b = el("g", null, g), mov = el("g", null, g), mid = el("g", null, g), front = el("g", null, g), w2f = el("g", null, g);
    // items behind and in front of the main line are drawn back to front (by gx + gy); a lane of movers splits its side into
    // what lies behind it and what lies in front of it, so walkers and carts pass in front of and behind the right things
    const BQ = [], FQ = [], BL = [], FL = [], b = (x, y, fn) => BQ.push([x, y, fn]), f = (x, y, fn) => FQ.push([x, y, fn]);
    const CY = 9;
    const rise = (fn, x, y, fr) => { const n = el("g", null, fr ? w2f : w2b); fn(n); const o = P(x, y, 0); n.dataset.ox = o[0].toFixed(1); n.dataset.oy = o[1].toFixed(1); X.W2.push(n); return n; };
    const extra = () => { const n = el("g", null, mov); X.W1.push(n); return n; };
    const tree = (q, x, y, s, kk) => q(x, y, (n) => K.tree(n, x, y, s || 1, kk));
    const man = (q, x, y, o) => q(x, y, (n) => K.person(n, x, y, Object.assign({ idle: true }, o)));
    // a moving lane: every mover in a lane shares one speed, so nothing catches up with anything else
    const lane = (parent, dir, dur, items, y) => {
      if (parent === "front" || parent === "back") { (parent === "front" ? FL : BL).push([y, (n) => lane(n, dir, dur, items)]); return; }
      items.forEach(([off, draw]) => { const c = el("g", null, typeof parent === "function" ? parent() : parent); draw(c); dir > 0 ? K.run(c, K.UX, -4, N + 3, dur, off) : K.run(c, K.UX, N + 3, -4, dur, off); });
    };
    const walkers = (y, dir, dur, n, o) => lane(y > CY + 2.4 ? "front" : y < CY - 0.2 ? "back" : mov, dir, dur, Array.from({ length: n }, (_, i) => [i / n + Math.random() * 0.1, (c) => K.person(c, 0, y, Object.assign({ walk: true }, typeof o === "function" ? o(i) : o))]), y);
    const church = (n, x, y) => {
      F.box(n, x, y, 0, 2.4, 1.4, 1.4, { left: "#E3DCCB", right: "#C9C0AC", top: "#F3EDE0" });
      K.quad(n, [[x, y, 1.4], [x + 2.4, y, 1.4], [x + 2.4, y + 0.7, 2.1], [x, y + 0.7, 2.1]], "#8F8784", { "stroke-width": 0.8 }); K.quad(n, [[x, y + 1.4, 1.4], [x + 2.4, y + 1.4, 1.4], [x + 2.4, y + 0.7, 2.1], [x, y + 0.7, 2.1]], "#A79E9A", { "stroke-width": 0.8 });
      const t = F.box(n, x + 2.4, y + 0.2, 0, 1.0, 1.0, 3.0, { left: "#E3DCCB", right: "#C9C0AC", top: "#F3EDE0" }); F.face(n, F.L, t, 0.3, 2.2, 0.7, 2.7, "#5B4A42", { "stroke-width": 0.6 }); F.face(n, F.L, t, 0.32, 0, 0.68, 0.7, "#5B4A42", { "stroke-width": 0.6 });
      K.quad(n, [[x + 2.4, y + 1.2, 3.0], [x + 3.4, y + 1.2, 3.0], [x + 2.9, y + 0.7, 4.6]], "#8F8784"); K.quad(n, [[x + 3.4, y + 0.2, 3.0], [x + 3.4, y + 1.2, 3.0], [x + 2.9, y + 0.7, 4.6]], "#6E6A72");
      for (let u = 0.3; u < 2.2; u += 0.55) F.face(n, F.L, { x, y, z: 0, w: 2.4, d: 1.4, h: 1.4 }, u, 0.5, u + 0.22, 1.1, "#9ED9CF", { "stroke-width": 0.5 });
    };
    const cottage = (n, x, y, roof, wall) => { const h = ISO.house(n, F, x, y, 1.9, 1.4, 0.95, 0.8, roof); if (wall) F.face(n, F.R, h, 0, 0, 1.4, 0.95, wall, { "stroke-width": 0.8, "fill-opacity": 0.6 }); F.box(n, x + 0.3, y + 0.55, 1.5, 0.2, 0.2, 0.45, { left: "#B7795E", right: shade("#B7795E"), top: "#3E4860" }); };

    // The main line of each age runs along gx at gy CY. Nothing tall stands in front of it: in front, an item of height h
    // keeps its back edge at least h + 0.4 beyond the line's front edge, so the canal, the railway, the street and the highway stay in clear view.
    const desk = (n, x, y, z, screen) => { F.box(n, x, y, z, 0.7, 0.34, 0.22, { left: "#C9A988", right: "#A9876A", top: "#E3D6C0" }); if (screen) { const m = F.box(n, x + 0.42, y + 0.04, z + 0.22, 0.26, 0.22, 0.22, { left: "#E3DDD3", right: "#C9C0AC", top: "#EDE6DA" }); F.face(n, F.R, m, 0.03, 0.04, 0.21, 0.2, "#4AB4D6", { "stroke-width": 0.5 }); } };
    const FINE = !!window.ERAS_FINE, nudge = (n, dx, dy) => { const a = P(0, 0, 0), q = P(dx, dy, 0); n.setAttribute("transform", `translate(${(q[0] - a[0]).toFixed(1)} ${(q[1] - a[1]).toFixed(1)})`); return n; };
    if (k === 0) {   // CANALS, 1760s
      R(gnd, 0.3, 0.3, 6.4, 4.2, "#E8E0B8", 0.8); for (let y = 0.8; y < 4.2; y += 0.5) K.lineGX(gnd, y, 0.3, 6.4, 0, "#D6CB98", 1);
      R(gnd, 4.6, 4.6, 8.6, 8.4, "#CFE3B8", 0.8); R(gnd, 6.6, 0.3, 10.2, 4.2, "#CFE3B8", 0.8); R(gnd, 9.2, 6.4, 13.6, 8.7, "#D8D2C4", 0.8);
      R(gnd, 0, CY - 0.25, N, CY, "#B9AE95", 0.6); R(gnd, 0, CY, N, CY + 1.4, C.water, 1); R(gnd, 0, CY + 1.4, N, CY + 2.0, "#E3D6B0", 0.8);
      R(gnd, 0, 14.0, N, 14.8, "#E3D6B0", 0.8); R(gnd, 10.0, 11.6, 15.0, 13.6, "#CFE3B8", 0.8);
      R(gnd, 17.6, 17.2, 21.8, 21.8, "#CFE3B8", 0.8); R(gnd, 11.8, 18.6, 16.4, 21.8, "#E8E0B8", 0.8); for (let y = 19.0; y < 21.8; y += 0.5) K.lineGX(gnd, y, 11.8, 16.4, 0, "#D6CB98", 1);
      { let d = ""; for (let x = 0.4; x < N; x += 0.9) { const a = P(x, CY + 0.5), c2 = P(x + 0.35, CY + 0.5); d += `M${a[0]} ${a[1]} L${c2[0]} ${c2[1]} `; } el("path", { d, stroke: "#B6DDF5", "stroke-width": 1.4 }, gnd); }
      // behind the canal: a church and a windmill, wheat and hay, a sheep pasture, the lock-keeper's cottage and a small wharf
      if (FINE) b(1.0, 2.3, (n) => church(n, 0.1, 2.1)); else b(1.5, 1.8, (n) => church(n, 0.6, 1.6)); b(4.6, 1.6, (n) => K.mill(n, 4.6, 1.6));
      if (!FINE) [[2.6, 3.4], [3.4, 3.0], [5.8, 3.6]].forEach(([x, y]) => b(x, y, (n) => K.hay(n, x, y)));
      b(4.6, 4.6, (n) => { K.hedge(n, 4.6, 4.5, 8.6, 4.5); K.hedge(n, 4.5, 4.6, 4.5, 8.4); });
      [[5.6, 5.8, 1, 1], [6.6, 5.4, -1, 0], [7.4, 6.6, 1, 1], [5.4, 7.0, -1, 0], [6.6, 7.6, 1, 1]].forEach(([x, y, d, gz]) => b(x, y, (n) => K.sheep(n, x, y, { dir: d, graze: !!gz })));
      b(7.6, 5.6, (n) => K.horse(n, 7.6, 5.4, { axis: "y", dir: 1, col: "#A9876A" }));
      b(1.6, 6.0, (n) => cottage(n, 1.0, 5.4, "#8F7A6E"));
      b(11.4, 7.4, (n) => { const w = F.box(n, 10.0, 6.6, 0, 2.6, 1.6, 1.6, { left: "#B7795E", right: shade("#B7795E"), top: "#C9A988" }); for (let u = 0.3; u < 2.4; u += 0.6) F.face(n, F.L, w, u, 0.4, u + 0.3, 0.8, "#FFE6A3", { "stroke-width": 0.5 }); F.face(n, F.L, w, 1.0, 0, 1.6, 1.0, "#5B4A42", { "stroke-width": 0.6 }); });
      [[10.4, 8.4], [10.9, 8.5], [12.8, 8.3]].forEach(([x, y]) => b(x, y, (n) => K.crate(n, x, y, 0, "#C9A988")));
      man(b, 11.8, 8.6, { cap: "#5B4A42", top: "#E5C189" }); man(b, 3.0, 7.9, { cap: "#8F7A6E", top: "#C9A988" }); man(b, 3.3, 8.1, { dress: true, bonnet: true, top: "#8C6F9E" });
      tree(b, 0.6, 4.6, 1, "pine"); tree(b, 3.8, 5.2, 0.9); tree(b, 6.8, 3.2, 1.1, "dark"); tree(b, 8.6, 2.4, 1); tree(b, 9.6, 4.6, 1, "dark"); tree(b, 2.4, 0.6, 0.9);
      if (!FINE) [11.4, 13.8].forEach((x) => b(x, CY, (n) => F.box(n, x, CY - 0.05, 0, 0.12, 1.5, 0.36, { left: "#6D5A4A", right: "#5B4A42", top: "#8F7A6E" })));
      // on the canal: the narrowboat drawn by a horse along the towpath, a barge the other way (W1)
      { const boat = el("g", null, mov); F.box(boat, -3.0, CY + 0.25, 0, 3.0, 0.6, 0.3, { left: "#2F6F4E", right: shade("#2F6F4E"), top: "#5E8F75" }); const cab = F.box(boat, -2.6, CY + 0.32, 0.3, 1.8, 0.46, 0.32, { left: "#B5302E", right: shade("#B5302E"), top: "#E3D6C0" }); for (let u = 0.2; u < 1.6; u += 0.4) F.face(boat, F.L, cab, u, 0.08, u + 0.2, 0.22, "#FFE6A3", { "stroke-width": 0.5 });
        F.box(boat, -1.0, CY + 0.3, 0.3, 0.8, 0.5, 0.25, { left: "#C9A988", right: "#A9876A", top: "#E3D6C0" });
        const tl = K.person(boat, -2.8, CY + 0.6, { cap: "#3E4860" }); tl.setAttribute("transform", tl.getAttribute("transform") + " translate(0 -9)");
        K.run(boat, K.UX, 0, 30, 34, 0);
        const xb = extra(); F.box(xb, 0, CY + 0.85, 0, 2.8, 0.5, 0.28, { left: "#204C8A", right: shade("#204C8A"), top: "#5B79A8" }); F.box(xb, 0.3, CY + 0.9, 0.28, 1.6, 0.4, 0.3, { left: "#E5C189", right: shade("#E5C189"), top: "#F3E2C6" }); [0.5, 0.95, 1.4].forEach((u) => K.crate(xb, u, CY + 0.95, 0.58, "#C9A988")); K.run(xb, K.UX, 26, -4, 30, 0.5);
        const hg = el("g", null, mov), hx = 3.4, hy = CY + 1.75; K.horse(hg, hx, hy, { walk: true }); K.person(hg, hx + 1.0, hy + 0.15, { walk: true, hat: true, top: "#8F7A6E" });
        const a = P(0, CY + 0.55, 0.5), b2 = P(hx + 0.5, hy, 0.4); el("path", { d: `M${a[0]} ${a[1]} Q${(a[0] + b2[0]) / 2} ${(a[1] + b2[1]) / 2 + 6} ${b2[0]} ${b2[1]}`, stroke: "#5B4A42", "stroke-width": 1, fill: "none" }, hg);
        K.run(hg, K.UX, 0, 30, 34, 0); }
      { // a stone hump bridge: one arch over the water, the towpath running through under the near end
        const x0 = 7.4, w = 1.3, y0 = CY - 0.45, y1 = CY + 2.35, st = "#C9B79C", top = 0.9, dk = shade(st);
        const deck = (u) => 0.3 + (top - 0.3) * Math.sin(Math.PI * (u - y0) / (y1 - y0));   // the deck rises to the middle
        const ys = []; for (let k = 0; k <= 16; k++) ys.push(y0 + (y1 - y0) * k / 16);
        const archC = CY + 0.95, archR = 1.05, archH = 0.55, under = (u) => (Math.abs(u - archC) < archR ? archH * Math.sqrt(1 - ((u - archC) / archR) ** 2) : 0);
        // the visible side wall (x + w): from the ground (or the arch) up to the deck
        const side = ys.map((u) => [x0 + w, u, deck(u)]).concat(ys.slice().reverse().map((u) => [x0 + w, u, under(u)]));
        K.quad(mid, side, dk, { "stroke-width": 1 });
        // under the arch: the water and the far side of the arch in shadow
        const ap = []; for (let k = 0; k <= 16; k++) { const u = archC - archR + (2 * archR * k) / 16; ap.push([x0 + w, u, under(u)]); }
        K.quad(mid, ap, "#3E6E96", { "stroke-width": 1 });
        // the road over it, and its parapets
        ys.slice(1).forEach((u, k) => { const a = ys[k]; K.quad(mid, [[x0, a, deck(a)], [x0 + w, a, deck(a)], [x0 + w, u, deck(u)], [x0, u, deck(u)]], "#D8C9A8", { stroke: "#D8C9A8", "stroke-width": 0.5, "data-nostroke": "" }); });
        K.quad(mid, ys.map((u) => [x0, u, deck(u)]).concat(ys.slice().reverse().map((u) => [x0 + w, u, deck(u)])), "none", { "stroke-width": 1 });
        [x0, x0 + w - 0.12].forEach((px) => { K.quad(mid, ys.map((u) => [px + 0.12, u, deck(u) + 0.18]).concat(ys.slice().reverse().map((u) => [px + 0.12, u, deck(u)])), st, { "stroke-width": 0.8 }); });
        K.quad(mid, [[x0, y1, 0.3], [x0 + w, y1, 0.3], [x0 + w, y1, 0], [x0, y1, 0]], st, { "stroke-width": 1 }); }
      // in front: a meadow by the towpath, a lane with carts, two cottages, an orchard, wheat and cows
      man(f, 11.4, 11.4, { cap: "#5B4A42", top: "#4AB4D6" }); if (!FINE) f(11.6, 11.5, (n) => { const p = P(11.6, 11.3, 0.4), q = P(11.2, 10.4, 0.9); el("path", { d: `M${p[0]} ${p[1]} L${q[0]} ${q[1]}`, stroke: "#5B4A42", "stroke-width": 1 }, n); });
      f(13.0, 12.0, (n) => K.bench(n, 12.6, 11.9)); man(f, 13.0, 12.2, { dress: true, bonnet: true, top: "#E0785A" }); man(f, 13.3, 12.25, { hat: true, top: "#3E4860" });
      [[10.6, 12.8, 1], [14.2, 13.0, -1]].forEach(([x, y, d]) => f(x, y, (n) => K.sheep(n, x, y, { dir: d, graze: d > 0 })));
      f(14.8, 13.7, (n) => K.hedge(n, 9.8, 13.7, 17.4, 13.7));
      lane("front", 1, 26, [[0.1, (c) => K.cart(c, -2.2, 14.15, { hay: true, walk: true })], [0.6, (c) => K.cart(c, -2.2, 14.15, { walk: true, col: "#8F6B4E" })]], 14.15);
      walkers(14.6, -1, 60, 2, (i) => ({ dress: i === 0, bonnet: i === 0, hat: i !== 0, top: ["#8C6F9E", "#3E4860"][i] }));
      [[14.4, 15.6, "#8F7A6E"], [18.0, 15.8, "#B77464"]].forEach(([x, y, r]) => f(x + 1, y + 0.7, (n) => cottage(n, x, y, r)));
      f(16.4, 17.4, (n) => K.fence(n, 13.8, 17.4, 20.6, 17.4, "#E3DCCB"));
      [[12.6, 16.2, 1], [13.2, 17.6, 0.9, "dark"], [17.0, 18.6, 1], [20.4, 15.2, 0.9], [11.0, 17.0, 1, "pine"], [21.0, 21.0, 1, "dark"]].forEach(([x, y, s2, kk]) => tree(f, x, y, s2, kk));
      [[18.6, 19.0, 1], [20.4, 19.8, -1], [19.2, 20.9, 1]].forEach(([x, y, d], i) => f(x, y, (n) => K.cow(n, x, y, { dir: d, col: i === 1 ? "#C9A988" : null })));
      [[13.0, 20.0], [14.2, 19.4]].forEach(([x, y]) => f(x, y, (n) => K.hay(n, x, y)));
      man(f, 15.8, 17.0, { dress: true, bonnet: true, top: "#4AB4D6" }); man(f, 16.1, 17.1, { cap: "#5B4A42" });
      rise((n) => { K.factory(n, 8.0, 3.2, 2.6, 2.0, 1.8, "#C9A988"); K.chimney(n, 9.4, 2.8, 3.6); }, 8.0, 5.2); rise((n) => K.factory(n, 2.2, 3.6, 2.2, 1.6, 1.4, "#B7795E"), 2.2, 5.2);
      rise((n) => cottage(n, 15.6, 20.0, "#B77464"), 15.6, 21.4, true);
    }
    if (k === 1) {   // RAILWAYS, 1830s
      const T1 = CY + 0.25, T2 = CY + 1.35;
      R(gnd, 0, CY - 0.1, N, CY + 2.3, "#CFC8BE", 1);
      { let d = ""; for (let x = 0.2; x < N; x += 0.32) [T1, T2].forEach((y) => { const a = P(x, y - 0.05), c2 = P(x, y + 0.68); d += `M${a[0]} ${a[1]} L${c2[0]} ${c2[1]} `; }); el("path", { d, stroke: "#8F7A6E", "stroke-width": 1.4 }, gnd); }
      [T1, T2].forEach((y) => [0.05, 0.58].forEach((dy) => K.lineGX(gnd, y + dy, 0, N, 0, "#3E4860", 1.4)));
      R(gnd, 0.4, 0.4, 7.0, 6.0, "#D6D0C6", 0.8); R(gnd, 10.0, 12.4, 16.6, 14.6, "#CFE3B8", 0.8); R(gnd, 0, 16.4, N, 17.2, "#B9B2A8", 0.8); R(gnd, 16.4, 19.6, 21.8, 21.8, "#CFE3B8", 0.8);
      for (let y = 12.7; y < 14.5; y += 0.45) K.lineGX(gnd, y, 10.2, 13.2, 0, "#7DBF7E", 1.6);
      // behind the line: two mills and their chimneys, a gasholder, the station with its platform and canopy
      b(2.6, 2.6, (n) => K.factory(n, 1.0, 1.6, 3.0, 2.4, 2.2));
      b(5.6, 4.0, (n) => K.factory(n, 4.4, 3.0, 2.4, 2.0, 1.8, "#C9A988"));
      b(0.8, 0.6, (n) => K.chimney(n, 0.8, 0.6, 4.8)); b(7.4, 4.4, (n) => K.chimney(n, 7.4, 4.4, 3.6));
      b(1.6, 5.4, (n) => { F.cyl(n, [1.6, 5.4, 0], "z", 0.9, 1.3, { side: "#9DA6B5", cap: "#B9C1CC" }); });
      b(7.4, 6.4, (n) => { const s2 = F.box(n, 5.8, 5.6, 0, 3.0, 1.6, 1.5, { left: "#C9A988", right: "#A9876A", top: "#E3D6C0" }); for (let u = 0.3; u < 2.8; u += 0.55) F.face(n, F.L, s2, u, 0.4, u + 0.3, 1.05, "#FFE6A3", { "stroke-width": 0.5 });
        K.quad(n, [[5.7, 5.5, 1.5], [8.9, 5.5, 1.5], [8.9, 6.4, 2.1], [5.7, 6.4, 2.1]], "#6E6A72", { "stroke-width": 0.8 }); K.quad(n, [[5.7, 7.3, 1.5], [8.9, 7.3, 1.5], [8.9, 6.4, 2.1], [5.7, 6.4, 2.1]], "#8F8784", { "stroke-width": 0.8 });
        const c = P(7.3, 7.2, 1.85); el("circle", { cx: c[0], cy: c[1], r: 5, fill: "#FFFFFF" }, n); el("path", { d: `M${c[0]} ${c[1]} L${c[0]} ${c[1] - 3.5} M${c[0]} ${c[1]} L${c[0] + 2.5} ${c[1]}`, stroke: "#000", "stroke-width": 0.8 }, n); });
      b(8.6, 8.2, (n) => { F.box(n, 4.6, 7.6, 0, 8.0, 1.2, 0.25, { left: "#C9C0AC", right: "#A79E9A", top: "#E3DCCB" }); [5.0, 7.2, 9.4, 11.6].forEach((x) => K.quad(n, [[x, 7.7, 0.25], [x + 0.06, 7.7, 0.25], [x + 0.06, 7.7, 1.4], [x, 7.7, 1.4]], "#3E4860", { "stroke-width": 0.5 }));
        K.quad(n, [[4.5, 7.5, 1.4], [12.7, 7.5, 1.4], [12.7, 8.6, 1.25], [4.5, 8.6, 1.25]], "#B5302E", { "stroke-width": 0.8 }); });
      [[5.8, 8.3, { hat: true, top: "#3E4860" }], [6.6, 8.4, { dress: true, bonnet: true, top: "#8C6F9E" }], [9.0, 8.3, { hat: true, top: "#5B4A42", bag: true }], [10.6, 8.4, { dress: true, top: "#B5302E" }]].forEach(([x, y, o]) => b(x, y, (n) => K.personAt(n, x, y, 0.25, Object.assign({ idle: true }, o))));
      b(13.4, 8.4, (n) => { K.quad(n, [[13.4, 8.4, 0], [13.46, 8.4, 0], [13.46, 8.4, 2.0], [13.4, 8.4, 2.0]], "#3E4860", { "stroke-width": 0.5 }); K.quad(n, [[13.46, 8.4, 1.75], [14.0, 8.4, 1.6], [14.0, 8.4, 1.72], [13.46, 8.4, 1.88]], "#B5302E", { "stroke-width": 0.6 }); });
      tree(b, 9.6, 5.0, 1, "dark"); tree(b, 3.6, 6.6, 0.9, "pine"); tree(b, 11.0, 6.4, 1);
      // the trains: one each way, one track each
      { const tr = el("g", null, mov); const fp = K.steamTrain(tr, -2.2, T1, 3); K.smoke(tr, fp[0], fp[1], true); K.run(tr, K.UX, -2, 34, 10, 0); }
      { const n = extra(); const fp = K.steamTrain(n, 0, T2, 2, true); K.smoke(n, fp[0], fp[1]); K.run(n, K.UX, 24, -12, 8, 0.4); }
      // in front: a fenced embankment where people watch the trains, allotments, terraced streets and a green
      f(11.0, 11.5, (n) => K.fence(n, 6.6, 11.5, 16.4, 11.5, "#8F7A6E"));
      [[9.4, 11.9, { cap: "#5B4A42", top: "#4AB4D6" }], [9.8, 12.0, { top: "#E5C189" }], [12.6, 11.9, { dress: true, bonnet: true, top: "#E0785A" }]].forEach(([x, y, o]) => man(f, x, y, o));
      f(14.6, 12.8, (n) => { const s2 = F.box(n, 14.2, 12.6, 0, 0.8, 0.6, 0.6, { left: "#8F6B4E", right: "#6D5A4A", top: "#5B4A42" }); F.face(n, F.L, s2, 0.25, 0, 0.5, 0.45, "#3E2A22", { "stroke-width": 0.5 }); });
      man(f, 11.8, 13.6, { cap: "#3E4860", top: "#47B970" });
      f(14.8, 15.6, (n) => K.terrace(n, 11.0, 15.0, 8, 1.4, "#B7795E"));
      lane("front", 1, 30, [[0.2, (c) => K.cart(c, -2.2, 16.6, { coach: true, walk: true, col: "#262C3A", horse: "#3E3632" })], [0.75, (c) => K.cart(c, -2.2, 16.6, { hay: true, walk: true })]], 16.6);
      walkers(17.1, -1, 50, 3, (i) => ({ cap: i === 1 ? null : "#5B4A42", dress: i === 1, top: ["#4AB4D6", "#8C6F9E", "#E5C189"][i] }));
      f(17.0, 18.0, (n) => K.terrace(n, 14.6, 17.8, 5, 1.4, "#C9A988"));
      [[19.0, 15.6, 1, "dark"], [10.4, 18.6, 1], [17.6, 20.4, 1.1], [20.8, 20.0, 1, "dark"], [21.2, 17.4, 0.9]].forEach(([x, y, s2, kk]) => tree(f, x, y, s2, kk));
      f(18.6, 20.6, (n) => K.bench(n, 18.2, 20.5)); man(f, 18.8, 20.8, { hat: true, top: "#3E4860" }); man(f, 19.2, 20.9, { dress: true, top: "#FFCD00", long: true });
      rise((n) => K.factory(n, 7.8, 1.4, 2.6, 2.0, 2.4), 7.8, 3.4); rise((n) => K.chimney(n, 5.6, 1.6, 5.4), 5.6, 1.6); rise((n) => K.terrace(n, 17.6, 20.2, 4, 1.4, "#B7795E"), 17.6, 21.4, true);
    }
    if (k === 2) {   // TELEPHONE LINES, 1880s
      R(gnd, 0, CY - 0.6, N, CY + 2.6, "#E9EBEE"); R(gnd, 0, CY, N, CY + 2.0, "#A79E9A", 1);
      { let d = ""; for (let x = 0.3; x < N; x += 0.4) for (let y = CY + 0.2; y < CY + 2; y += 0.4) { const a = P(x, y), c2 = P(x + 0.2, y); d += `M${a[0]} ${a[1]} L${c2[0]} ${c2[1]} `; } el("path", { d, stroke: "#8F8784", "stroke-width": 0.8 }, gnd); }
      [CY + 0.35, CY + 0.85].forEach((y) => K.lineGX(gnd, y, 0, N, 0, "#3E4860", 1.1));
      R(gnd, 9.8, 11.8, 16.6, 14.6, "#CFE3B8", 0.8); R(gnd, 0, 17.2, N, 17.8, "#E9EBEE", 0.6); R(gnd, 15.6, 18.4, 21.6, 21.6, "#CFE3B8", 0.8);
      // behind the street: brick blocks and the telephone exchange, cut open to show the switchboard and its operators
      [[0.4, 0.6, 2.4, 2.4, 5.6, "#A9977C"], [3.0, 2.0, 2.4, 2.4, 4.6, "#B7795E"]].forEach(([x, y, w, d, h, c]) => b(x + w / 2, y + d / 2, (n) => K.tower(n, x, y, w, d, h, c, "#FFE6A3", "none", { punched: true, floor: 0.8 })));
      b(2.2, 7.0, (n) => K.shop(n, 1.0, 5.8, 2.4, 2.4, 3.4, "#B7795E", null, { win: "#FFE6A3", glass: "#FFE6A3" }));
      b(10.8, 7.2, (n) => K.shop(n, 9.6, 6.0, 2.4, 2.4, 3.0, "#C9A988", null, { win: "#FFE6A3", glass: "#FFE6A3" }));
      b(6.4, 7.1, (n) => { K.cutaway(n, 4.4, 5.8, 3.6, 2.4, 3.0, 2, "#E3DCCB", (q, fl, z) => {
          F.box(q, 4.6, 5.95, z, 3.2, 0.3, 1.0, { left: "#6D4C3A", right: "#5B3E30", top: "#8F6B4E" });
          for (let u = 0.15; u < 3.1; u += 0.22) for (let v = 0.45; v < 0.95; v += 0.2) { const p = P(4.6 + u, 6.25, z + v); el("circle", { cx: p[0], cy: p[1], r: 0.9, fill: "#FFE6A3", "data-nostroke": "" }, q); }
          [4.9, 5.7, 6.5, 7.3].forEach((x, i) => K.personAt(q, x, 6.55, z, { idle: true, dress: true, long: true, top: ["#3E4860", "#8C6F9E", "#5B6478", "#2F6F4E"][(i + fl) % 4] }));
          if (fl === 0) K.personAt(q, 7.6, 7.6, z, { idle: true, hat: true, top: "#262C3A" }); });
        const t = F.box(n, 5.6, 6.4, 3.0, 1.2, 0.9, 0.7, { left: "#C9C0AC", right: "#A79E9A", top: "#E3DCCB" }); [5.7, 6.2, 6.7].forEach((x) => K.seg(n, [x, 6.4, 3.7], [x, 7.3, 3.7], "#6D5A4A", 2)); K.seg(n, [6.2, 6.85, 3.7], [6.2, 6.85, 4.1], "#6D5A4A", 2); });
      const xs = [0.6, 3.6, 6.6, 9.6, 12.6, 15.6, 18.6, 21.6], py = CY - 0.3;
      tree(b, 12.6, 7.4, 1, "dark"); tree(b, 0.4, 4.2, 0.9);
      walkers(CY - 0.45, 1, 70, 3, (i) => ({ hat: i !== 1, dress: i === 1, bonnet: i === 1, top: ["#3E4860", "#B5302E", "#5B4A42"][i] }));
      // the street: an electric tram, hansom cabs, penny-farthings (W1)
      lane(mov, 1, 16, [[0, (c) => { const bx = F.box(c, -2.6, CY + 0.2, 0.14, 2.6, 0.7, 0.95, { left: "#E0785A", right: shade("#E0785A"), top: "#F3E2C6" }); [-2.2, -0.4].forEach((u) => K.wheel(c, u, CY + 0.9, 0.12, 0.11, "y")); for (let u = 0.25; u < 2.4; u += 0.45) F.face(c, F.L, bx, u, 0.42, u + 0.3, 0.75, "#FFE6A3", { "stroke-width": 0.6 }); K.seg(c, [-1.3, CY + 0.55, 1.09], [-2.0, CY + 0.55, 1.95], "#3E4860", 1.2); }]]);
      lane(mov, 1, 22, [[0.1, (c) => K.cart(c, -2.2, CY + 1.1, { coach: true, walk: true, col: "#262C3A", horse: "#3E3632" })], [0.6, (c) => K.cart(c, -2.2, CY + 1.1, { coach: true, walk: true, col: "#2F6F4E" })]]);
      lane(extra, 1, 26, [[0.3, (c) => K.bike(c, -0.6, CY + 1.85, "#3E4860", { old: true, hat: true })], [0.8, (c) => K.bike(c, -0.6, CY + 1.85, "#3E4860", { old: true, cap: "#5B4A42" })]]);
      K.lineGX(mid, CY + 0.55, 0, N, 1.95, "#3E4860", 0.9);
      { const pg = el("g", null, mid); let zs = []; xs.forEach((x) => { zs = K.pole(pg, x, py, 2.8, 4); }); K.wires(pg, xs, py, zs, [-0.4, -0.15, 0.15, 0.4], "#3E4860", 7);
        let d = ""; [-0.4, -0.15, 0.15, 0.4].forEach((o, i) => { const a = P(6.6, py + o, zs[i % 4]), c2 = P(6.2, 6.85, 4.1); d += `M${a[0]} ${a[1]} Q${(a[0] + c2[0]) / 2} ${(a[1] + c2[1]) / 2 + 4} ${c2[0]} ${c2[1]} `; }); el("path", { d, stroke: "#3E4860", "stroke-width": 0.7, fill: "none" }, pg); }
      // in front: a square with lamps, benches and a public telephone; shops beyond it, a park at the end of the street
      [[8.4, CY + 2.4], [12.4, CY + 2.4], [16.4, CY + 2.4]].forEach(([x, y]) => f(x, y, (n) => K.lamp(n, x, y)));
      [[10.6, 12.2, { hat: true, top: "#3E4860" }], [11.0, 12.3, { dress: true, bonnet: true, top: "#8C6F9E" }], [15.2, 12.4, { cap: "#5B4A42", top: "#E5C189", bag: true }]].forEach(([x, y, o]) => man(f, x, y, o));
      f(12.6, 12.9, (n) => K.bench(n, 12.2, 12.8));
      f(14.2, 13.9, (n) => K.cutaway(n, 13.8, 13.4, 0.8, 0.8, 1.5, 1, "#2F6F4E", (q, fl, z) => { F.box(q, 14.1, 13.45, 0.85, 0.22, 0.08, 0.3, { left: "#6D4C3A", right: "#5B3E30", top: "#8F6B4E" }); K.personAt(q, 14.2, 13.85, 0, { idle: true, hat: true, phone: true, top: "#262C3A" }); }));
      [[10.4, 14.2, 1, "dark"], [16.0, 14.0, 1]].forEach(([x, y, s2, kk]) => tree(f, x, y, s2, kk));
      walkers(15.0, -1, 64, 3, (i) => ({ hat: i === 0, dress: i === 1, bonnet: i === 1, cap: i === 2 ? "#3E4860" : null, top: ["#2F6F4E", "#E0785A", "#C9A988"][i] }));
      [[12.0, 15.6, 2.4, 2.2, "#B7795E", "#B5302E"], [14.6, 15.6, 2.4, 2.6, "#C9A988", "#2F6F4E"]].forEach(([x, y, w, h, c, aw]) => f(x + w / 2, y + 0.8, (n) => K.shop(n, x, y, w, 1.6, h, c, aw, { win: "#FFE6A3", sign: "#262C3A" })));
      f(18.6, 18.4, (n) => K.fence(n, 15.6, 18.4, 21.6, 18.4, "#3E4860"));
      [[16.2, 19.4, 1, "dark"], [19.6, 18.9, 1.1], [18.4, 20.8, 1], [21.0, 20.6, 0.9, "dark"]].forEach(([x, y, s2, kk]) => tree(f, x, y, s2, kk));
      f(17.4, 19.6, (n) => K.bench(n, 17.0, 19.6)); man(f, 17.6, 19.9, { hat: true, top: "#3E4860" }); man(f, 20.0, 20.0, { dress: true, bonnet: true, top: "#FFCD00" });
      rise((n) => K.tower(n, 6.6, 1.0, 2.6, 2.6, 7.0, "#C9A988", "#FFE6A3", "none", { punched: true, floor: 0.8 }), 6.6, 3.6); rise((n) => K.tower(n, 9.6, 2.6, 2.4, 2.4, 5.6, "#A9977C", "#FFE6A3", "none", { punched: true, floor: 0.8 }), 9.6, 5.0);
      rise((n) => K.shop(n, 17.6, 15.6, 2.4, 1.6, 2.8, "#A9977C", "#204C8A", { win: "#FFE6A3", sign: "#262C3A" }), 17.6, 17.2, true);
    }
    if (k === 3) {   // HIGHWAYS, 1950s
      const Y0 = CY - 0.2;
      R(gnd, 0, Y0 - 0.4, N, Y0 + 3.4, "#E9EBEE"); R(gnd, 0, Y0, N, Y0 + 1.4, "#5B6478", 1); R(gnd, 0, Y0 + 1.6, N, Y0 + 3.0, "#5B6478", 1); R(gnd, 0, Y0 + 1.4, N, Y0 + 1.6, "#A9D69B", 0.6);
      { let d = ""; for (let x = 0.5; x < N; x += 1.4) [Y0 + 0.7, Y0 + 2.3].forEach((y) => { const a = P(x, y), c2 = P(x + 0.7, y); d += `M${a[0]} ${a[1]} L${c2[0]} ${c2[1]} `; }); el("path", { d, stroke: "#FFFFFF", "stroke-width": 1.5 }, gnd); }
      R(gnd, 0.3, 0.3, 5.4, 3.6, "#CFE3B8"); R(gnd, 3.6, 4.0, 9.6, 8.2, "#E9EBEE"); R(gnd, 10.0, 18.4, 14.2, 21.6, "#CFE3B8", 0.8);
      for (let x = 10.6; x < 22; x += 2.8) R(gnd, x + 0.9, 12.2, x + 1.6, 15.8, "#C9CED6", 0.5);
      // behind: a pylon line, a diner, a filling station, a billboard
      const PL = [[1.2, 1.2], [5.6, 1.2]];
      PL.forEach(([x, y]) => b(x, y, (n) => K.pylon(n, x, y, 3.2)));
      b(1e3, 0, (n) => { const hw = 3.2 * 0.8; let d = ""; [[hw * 0.7, 0.95], [hw * 0.95, 0.7]].forEach(([z, w]) => [-w, w].forEach((o2) => { const pts = [[-2, 1.2], ...PL, [12, 1.2]].map(([x, y]) => { const q = P(x, y + o2, z); return [q[0], q[1] + 6]; }); for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], c2 = pts[i]; d += `M${a[0]} ${a[1]} Q${(a[0] + c2[0]) / 2} ${(a[1] + c2[1]) / 2 + 14} ${c2[0]} ${c2[1]} `; } })); el("path", { d, stroke: "#3E4860", "stroke-width": 0.9, fill: "none" }, n); });
      b(2.4, 4.6, (n) => { const d0 = F.box(n, 0.8, 4.0, 0, 3.0, 1.6, 1.1, { left: "#F1F2F4", right: C.w3, top: "#E0785A" }); F.face(n, F.L, d0, 0.2, 0.3, 2.8, 0.8, "#9ED9CF", { "stroke-width": 0.6 }); F.face(n, F.L, d0, 0.1, 0.85, 2.9, 1.05, "#E0785A", { "stroke-width": 0.5 }); K.quad(n, [[3.9, 4.6, 1.1], [3.9, 4.6, 1.9], [3.9, 5.4, 1.9], [3.9, 5.4, 1.1]], "#FFCD00", { "stroke-width": 0.8 }); });
      b(6.8, 6.3, (n) => { const post = ([x, y]) => F.box(n, x, y, 0, 0.12, 0.12, 1.2, { left: C.g1, right: C.g2, top: C.w1 }), pumps = () => [[6.4, 6.1], [7.4, 6.1]].forEach(([x, y]) => { const bb = F.box(n, x, y, 0, 0.3, 0.3, 0.7, { left: "#E0785A", right: shade("#E0785A"), top: "#F1F2F4" }); F.face(n, F.L, bb, 0.05, 0.4, 0.25, 0.6, "#FFFFFF", { "stroke-width": 0.5 }); });
        if (FINE) { [[5.4, 5.4], [8.2, 5.4]].forEach(post); pumps(); K.oldCar(n, 6.0, 6.75, "#4AB4D6"); [[5.4, 7.2], [8.2, 7.2]].forEach(post); }
        else { [[5.4, 5.4], [8.2, 5.4], [5.4, 7.2], [8.2, 7.2]].forEach(post); pumps(); K.oldCar(n, 6.2, 6.6, "#4AB4D6"); }
        F.box(n, 5.2, 5.2, 1.2, 3.2, 2.2, 0.2, { left: "#E0785A", right: shade("#E0785A"), top: "#FFFFFF" }); });
      if (!FINE) b(10.6, 7.4, (n0) => { const n = FINE ? nudge(el("g", null, n0), 1.0, 0) : n0; [10.2, 11.4].forEach((x) => K.quad(n, [[x, 7.4, 0], [x + 0.06, 7.4, 0], [x + 0.06, 7.4, 1.4], [x, 7.4, 1.4]], "#3E4860", { "stroke-width": 0.5 })); K.quad(n, [[9.4, 7.4, 1.3], [12.2, 7.4, 1.3], [12.2, 7.4, 2.6], [9.4, 7.4, 2.6]], "#FFCD00", { "stroke-width": 1 }); K.quad(n, [[9.7, 7.4, 1.55], [11.0, 7.4, 1.55], [11.0, 7.4, 2.35], [9.7, 7.4, 2.35]], "#FFFFFF", { "stroke-width": 0.6 }); K.quad(n, [[11.2, 7.4, 1.6], [11.9, 7.4, 1.6], [11.9, 7.4, 2.3], [11.2, 7.4, 2.3]], "#E0785A", { "stroke-width": 0.6 }); });
      man(b, 4.8, 7.4, { cap: "#E0785A", top: "#F1F2F4" }); man(b, 2.8, 6.0, { dress: true, top: "#4AB4D6" }); man(b, 3.1, 6.1, { top: "#FFCD00" });
      [[2.6, 2.6, 1, "pine"], [7.6, 3.6, 1], [8.6, 2.2, 1, "pine"], [0.6, 7.6, 1, "dark"], [10.6, 5.2, 1]].filter((t, i) => !(FINE && i === 0)).forEach(([x, y, s2, kk]) => tree(b, x, y, s2, kk));
      const OLD = ["#E0785A", "#4AB4D6", "#FFCD00", "#A6D84A", "#F1F2F4", "#8C6F9E", "#B5302E"];
      [[Y0 + 0.06, 1, 7], [Y0 + 0.76, 1, 9], [Y0 + 1.66, -1, 7.5], [Y0 + 2.36, -1, 9.5]].forEach(([y, dir, dur], li) => {
        lane(mov, dir, dur, [[0, (c) => K.oldCar(c, dir > 0 ? -1.4 : 0, y, OLD[li])], [0.5, (c) => K.oldCar(c, dir > 0 ? -1.4 : 0, y, OLD[li + 2])]]);
        lane(extra, dir, dur, [[0.25, (c) => K.oldCar(c, dir > 0 ? -1.4 : 0, y, OLD[li + 1])], [0.75, (c) => (li === 1 ? K.bus(c, dir > 0 ? -2.8 : 0, y - 0.02, "#E0785A") : K.oldCar(c, dir > 0 ? -1.4 : 0, y, OLD[li + 3]))]]);
      });
      // in front: a verge, a row of houses with drives and lawns, a playground and a few more homes
      walkers(Y0 + 3.2, 1, 70, 2, (i) => ({ top: ["#E0785A", "#3E4860"][i], dress: i === 0 }));
      [[10.0, 14.6], [12.8, 14.6], [15.6, 14.6], [18.4, 14.6]].forEach(([x, y], i) => {
        f(x + 1.1, y + 0.8, (n) => { ISO.house(n, F, x, y, 2.2, 1.6, 0.9, 0.7, ["#B77464", "#6E6A72", "#8F8784", "#B77464"][i]); F.box(n, x + 2.25, y + 0.3, 0, 0.6, 1.1, 0.7, { left: "#F1F2F4", right: C.w3, top: C.w1 }); });
        f(x + 1.5, y - 1.6, (n) => K.oldCar(n, x + 0.9, y - 1.5, ["#FFCD00", "#E0785A", "#4AB4D6", "#A6D84A"][i]));
        f(x + 1.1, y + 2.2, (n) => K.fence(n, x - 0.1, y + 2.2, x + 2.8, y + 2.2, "#F1F2F4"));
      });
      if (!FINE) [[11.6, 13.4, 0.8], [17.2, 13.4, 0.8, "dark"]].forEach(([x, y, s2, kk]) => tree(f, x, y, s2, kk));
      man(f, 14.4, 13.4, { top: "#4AB4D6" }); man(f, 14.8, 13.5, { dress: true, top: "#E0785A" });
      f(12.0, 19.8, (n) => { [[10.8, 19.4], [12.4, 19.4]].forEach(([x, y]) => { K.seg(n, [x, y, 0], [x + 0.4, y, 0.9], "#B5302E", 1.6); K.seg(n, [x + 0.8, y, 0], [x + 0.4, y, 0.9], "#B5302E", 1.6); }); K.seg(n, [11.2, 19.4, 0.9], [12.8, 19.4, 0.9], "#B5302E", 1.6); [11.4, 12.2].forEach((x) => { K.seg(n, [x, 19.4, 0.9], [x, 19.4, 0.35], "#3E4860", 0.8); F.box(n, x - 0.12, 19.3, 0.3, 0.24, 0.2, 0.05, { left: "#FFCD00", right: "#E0B000", top: "#FFE680" }); }); });
      man(f, 11.0, 20.4, { top: "#FFCD00" }); man(f, 13.0, 20.6, { cap: "#B5302E", top: "#4AB4D6" });
      [[15.6, 18.6, "#6E6A72"], [18.4, 18.8, "#B77464"]].forEach(([x, y, r]) => f(x + 1.1, y + 0.8, (n) => { ISO.house(n, F, x, y, 2.2, 1.6, 0.9, 0.7, r); }));
      [[20.8, 17.0, 1], [14.6, 21.2, 1, "dark"], [21.0, 21.2, 1]].forEach(([x, y, s2, kk]) => tree(f, x, y, s2, kk));
      f(17.4, 21.0, (n) => K.bike(n, 17.0, 21.0, "#B5302E", { cap: "#4AB4D6", top: "#FFCD00" }));
      rise((n) => K.tower(n, 6.6, 0.6, 2.6, 2.4, 3.6, "#F1F2F4", C.water, "none"), 6.6, 3.0); rise((n) => ISO.house(n, F, 1.2, 0.2 + 7.6, 2.2, 1.6, 0.9, 0.7, "#8C6F9E"), 1.2, 9.4);
    }
    if (k === 4) {   // THE INTERNET, 1990s
      R(gnd, 0, CY - 0.5, N, CY + 2.5, "#E9EBEE"); R(gnd, 0, CY, N, CY + 2.0, "#5B6478", 1);
      { let d = ""; for (let x = 0.5; x < N; x += 1.4) { const a = P(x, CY + 1), c2 = P(x + 0.7, CY + 1); d += `M${a[0]} ${a[1]} L${c2[0]} ${c2[1]} `; } el("path", { d, stroke: "#FFFFFF", "stroke-width": 1.5 }, gnd); }
      { const a = P(0, CY + 2.75), c2 = P(N, CY + 2.75); el("path", { d: `M${a[0]} ${a[1]} L${c2[0]} ${c2[1]}`, stroke: "#3E4860", "stroke-width": 3 }, gnd); const fib = el("path", { d: `M${a[0]} ${a[1]} L${c2[0]} ${c2[1]}`, stroke: "#47B970", "stroke-width": 2, "stroke-dasharray": "6 30", fill: "none" }, gnd); gsap.to(fib, { attr: { "stroke-dashoffset": -72 }, duration: 0.8, repeat: -1, ease: "none" }); }
      R(gnd, 0, CY + 2.5, N, CY + 3.0, "#E9EBEE", 0); R(gnd, 9.6, 12.0, 15.4, 14.8, "#CFE3B8", 0.8); R(gnd, 15.4, 18.0, 21.6, 21.6, "#CFE3B8", 0.8);
      // behind: glass towers, a data centre, a phone mast, and an office cut open to show people working at their computers
      [[0.4, 0.4, 2.6, 2.6, 8.0, "#C9D6E3", "plant"], [3.4, 1.8, 2.4, 2.4, 6.0, "#DCE3EA", "plant"], [6.2, 3.0, 2.4, 2.2, 4.0, "#E3E6EB", "pv"]].forEach(([x, y, w, d, h, c, r]) => b(x + w / 2, y + d / 2, (n) => K.office(n, x, y, w, d, h, Math.round(h / 1.0), c, r)));
      b(3.0, 0.2, (n) => { const c = P(1.7, 1.7, 8.4); el("ellipse", { cx: c[0] + 10, cy: c[1] - 10, rx: 10, ry: 6, fill: "#F1F2F4", transform: `rotate(-25 ${c[0] + 10} ${c[1] - 10})` }, n); });
      b(2.3, 5.5, (n) => K.dataHall(n, 0.6, 4.4, 3.4, 2.2));
      b(9.6, 6.6, (n) => { const mx = 9.6, my = 6.6, h = 5.2; [[-0.25, -0.25], [0.25, -0.25], [0.25, 0.25], [-0.25, 0.25]].forEach(([dx, dy]) => ISO.line(n, [P(mx + dx, my + dy, 0), P(mx + dx * 0.3, my + dy * 0.3, h)], { "stroke-width": 1 }));
        for (let z = 0.6; z < h; z += 0.7) { const s1 = 0.25 * (1 - 0.7 * z / h), s2 = 0.25 * (1 - 0.7 * (z + 0.35) / h); ISO.line(n, [P(mx - s1, my + s1, z), P(mx + s2, my + s2, z + 0.35)], { "stroke-width": 0.6 }); }
        [4.2, 4.8].forEach((z) => F.box(n, mx + 0.1, my - 0.1, z, 0.1, 0.2, 0.4, { left: "#F1F2F4", right: C.w3, top: C.w1 }));
        const t = P(mx, my, h); [1, 2, 3].forEach((r) => el("path", { d: `M${t[0] - 6 - r * 7} ${t[1] - r * 4} Q${t[0]} ${t[1] - 10 - r * 9} ${t[0] + 6 + r * 7} ${t[1] - r * 4}`, stroke: "#4AB4D6", "stroke-width": 2, fill: "none", class: "fx anim blink", style: `animation-delay:${r * 0.3}s` }, n)); });
      b(6.4, 7.2, (n) => K.office(n, 4.4, 6.0, 4.0, 2.4, 2.2, 2, "#C9D6E3"));
      [[12.4, 7.4, 1, "dark"], [3.6, 8.4, 0.9]].forEach(([x, y, s2, kk]) => tree(b, x, y, s2, kk));
      walkers(CY - 0.3, 1, 60, 3, (i) => ({ phone: i !== 1, top: ["#4AB4D6", "#3E4860", "#E0785A"][i], bag: i === 1 }));
      const CC = ["#F1F2F4", "#E0785A", "#4AB4D6", "#A6D84A", "#FFCD00", "#3E4860", "#8C6F9E"];
      lane(mov, 1, 8, [[0, (c) => K.car(c, -1.2, CY + 0.12, CC[0], "x")], [0.5, (c) => K.car(c, -1.2, CY + 0.12, CC[1], "x")]]);
      lane(extra, 1, 8, [[0.25, (c) => K.car(c, -1.2, CY + 0.12, CC[3], "x")], [0.75, (c) => K.bus(c, -2.8, CY + 0.1, "#4AB4D6")]]);
      lane(mov, -1, 8.5, [[0.2, (c) => K.car(c, 0, CY + 1.25, CC[2], "x")], [0.7, (c) => K.car(c, 0, CY + 1.25, CC[4], "x")]]);
      lane(extra, -1, 8.5, [[0.45, (c) => K.car(c, 0, CY + 1.25, CC[5], "x")], [0.95, (c) => K.car(c, 0, CY + 1.25, CC[6], "x")]]);
      // in front: a small square with a café terrace and people on their phones, shops beyond it, flats with dishes, a park
      [[10.4, 12.6], [11.4, 12.9], [12.4, 12.6]].forEach(([x, y], i) => f(x, y, (n) => { F.box(n, x - 0.25, y - 0.25, 0.42, 0.5, 0.5, 0.04, { left: "#F1F2F4", right: C.w3, top: "#FFFFFF" }); F.box(n, x - 0.03, y - 0.03, 0, 0.06, 0.06, 0.42, { left: "#3E4860", right: "#262C3A", top: "#3E4860" }); K.person(n, x + 0.35, y + 0.2, { idle: true, phone: i !== 1, top: ["#47B970", "#E0785A", "#4AB4D6"][i] }); }));
      [[14.6, 12.4, { phone: true, top: "#FFCD00" }], [9.0, 12.0, { top: "#8C6F9E", long: true, phone: true }]].forEach(([x, y, o]) => man(f, x, y, o));
      [[13.8, 14.2, 1, "dark"], [10.0, 14.4, 0.9]].forEach(([x, y, s2, kk]) => tree(f, x, y, s2, kk));
      walkers(15.0, -1, 56, 3, (i) => ({ phone: i === 0, top: ["#F1F2F4", "#3E4860", "#47B970"][i], dress: i === 2 }));
      [[11.4, 15.6, 2.4, 2.4, "#F3E2C6", "#47B970", "#47B970"], [14.0, 15.6, 2.4, 2.6, "#DCE3EA", "#4AB4D6", "#4AB4D6"]].forEach(([x, y, w, h, c, aw, sg]) => f(x + w / 2, y + 0.8, (n) => K.shop(n, x, y, w, 1.6, h, c, aw, { glass: C.water, sign: sg })));
      f(17.8, 19.4, (n) => { const x = 16.6, y = 18.6, w = 2.6, h = 3.4; K.tower(n, x, y, w, 2.0, h, "#EDE6DA", "#BFD3E6", "none", { punched: true, noShop: true }); if (!FINE) [0.6, 1.8].forEach((u) => { const p = F.L({ x, y, z: 0, w, d: 2.0, h }, u, h - 0.8); el("circle", { cx: p[0], cy: p[1], r: 3, fill: "#F1F2F4" }, n); }); });
      [[20.6, 17.6, 1], [20.4, 20.6, 1.1, "dark"], [15.8, 20.6, 1]].forEach(([x, y, s2, kk]) => tree(f, x, y, s2, kk));
      f(19.6, 21.0, (n) => K.bench(n, 19.2, 21.0)); man(f, 19.9, 21.3, { phone: true, top: "#E0785A" });
      rise((n) => K.office(n, 9.0, 1.4, 2.6, 2.6, 9.0, 9, "#9ED9CF", "plant"), 9.0, 4.0); rise((n) => K.tower(n, 18.8, 15.2, 2.4, 2.2, 4.0, "#C9D6E3", C.water, "plant", { noShop: true }), 18.8, 17.4, true);
    }
    // a full square tile (X.full): the strips only ever showed the diagonal band, so the two far corners are filled with
    // scenery of the same age, on a grid of plots that keeps clear of the main line, the lanes and what is already there
    if (X.full) {
      const AV = [[CY - 1.4, CY + 3.6]].concat([[[13.3, 15.0]], [[16.1, 17.7]], [[14.5, 15.5], [17.1, 17.9]], [[12.0, 12.8]], [[14.5, 15.5]]][k]);
      const rnd = ((sd) => () => { sd = (sd * 16807) % 2147483647; return (sd - 1) / 2147483646; })(101 + k * 7);
      const S = 2.6, plots = [];
      for (let y = 0.2; y + S <= N - 0.1; y += 0.35) for (let x = 0.2; x + S <= N - 0.1; x += 0.35) {   // greedy: take each free plot, never overlapping another
        const cx = x + S / 2, cy = y + S / 2;
        if (Math.abs(cx - cy) < 7.0) continue;
        if (AV.some(([a, b2]) => y < b2 && y + S > a)) continue;
        if (plots.some(([px, py]) => x < px + S + 0.2 && px < x + S + 0.2 && y < py + S + 0.2 && py < y + S + 0.2)) continue;
        plots.push([x, y]);
      }
      const q = (x, y, fn) => (y + S / 2 < CY ? b : f)(x + S / 2, y + S / 2, fn);
      const crops = (x, y, col, line) => { R(gnd, x, y, x + S, y + S, col, 0.8); if (line) for (let v = y + 0.4; v < y + S; v += 0.45) K.lineGX(gnd, v, x, x + S, 0, line, 1); };
      const TREES = (x, y, n, kk) => { for (let i = 0; i < n; i++) { const tx = x + 0.4 + rnd() * (S - 0.8), ty = y + 0.4 + rnd() * (S - 0.8); tree(q === null ? b : (ty < CY ? b : f), tx, ty, 0.8 + rnd() * 0.35, kk || ["dark", null, "pine", null][Math.floor(rnd() * 4)]); } };
      const folk = (x, y, o) => man(y < CY ? b : f, x + S * (0.3 + rnd() * 0.4), y + S * 0.85, o);
      const ROOF = ["#B77464", "#8F7A6E", "#C9A15A", "#9C6457"], BRICK = ["#B7795E", "#C9A988", "#A9977C"];
      const kinds = [
        // canals: farmland, cottages, a windmill, pasture, orchards
        [(x, y) => crops(x, y, "#E8E0B8", "#D6CB98"), (x, y) => { q(x, y, (n) => cottage(n, x + 0.3, y + 0.5, ROOF[Math.floor(rnd() * 4)])); TREES(x, y + 1.8, 1); },
         (x, y) => { crops(x, y, "#CFE3B8"); q(x, y, (n) => { K.hedge(n, x, y, x + S, y); [[0.7, 0.9, 1], [1.6, 1.4, -1], [1.0, 2.0, 1]].forEach(([u, v, d]) => K.sheep(n, x + u, y + v, { dir: d, graze: d > 0 })); }); },
         (x, y) => TREES(x, y, 4, "round"), (x, y) => { crops(x, y, "#E8E0B8", "#D6CB98"); q(x, y, (n) => [[0.8, 0.9], [1.7, 1.6]].forEach(([u, v]) => K.hay(n, x + u, y + v))); }, (x, y) => q(x, y, (n) => K.mill(n, x + 1.3, y + 1.2))],
        // railways: terraces, mills and chimneys, allotments
        [(x, y) => q(x, y, (n) => K.terrace(n, x + 0.1, y + 0.6, 2, 1.4, BRICK[Math.floor(rnd() * 3)])), (x, y) => q(x, y, (n) => { K.factory(n, x + 0.2, y + 0.3, 2.2, 1.8, 1.6, BRICK[Math.floor(rnd() * 3)]); K.chimney(n, x + 2.3, y + 0.4, 3.2); }),
         (x, y) => { crops(x, y, "#CFE3B8", "#7DBF7E"); folk(x, y, { cap: "#5B4A42", top: "#4AB4D6" }); }, (x, y) => q(x, y, (n) => K.terrace(n, x + 0.1, y + 0.6, 2, 1.4, BRICK[Math.floor(rnd() * 3)])), (x, y) => TREES(x, y, 3)],
        // telephone lines: brick blocks, shops, a small square with trees
        [(x, y) => q(x, y, (n) => K.tower(n, x + 0.2, y + 0.2, 2.2, 2.2, 3 + rnd() * 2.6, BRICK[Math.floor(rnd() * 3)], "#FFE6A3", "none", { punched: true, floor: 0.8 })),
         (x, y) => q(x, y, (n) => K.shop(n, x + 0.2, y + 0.4, 2.2, 1.6, 2.4 + rnd(), BRICK[Math.floor(rnd() * 3)], ["#B5302E", "#2F6F4E", "#204C8A"][Math.floor(rnd() * 3)], { win: "#FFE6A3", sign: "#262C3A" })),
         (x, y) => { R(gnd, x, y, x + S, y + S, "#CFE3B8", 0.8); TREES(x, y, 3); q(x, y, (n) => K.bench(n, x + 1.0, y + 1.2)); folk(x, y, { hat: true, top: "#3E4860" }); }],
        // highways: suburban houses with a car on the drive, fields, trees
        [(x, y) => q(x, y, (n) => { ISO.house(n, F, x + 0.2, y + 0.3, 2.0, 1.5, 0.9, 0.7, ROOF[Math.floor(rnd() * 4)]); K.oldCar(n, x + 0.6, y + 1.95, ["#E0785A", "#4AB4D6", "#FFCD00", "#A6D84A"][Math.floor(rnd() * 4)]); }),
         (x, y) => crops(x, y, "#E8E0B8", "#D6CB98"), (x, y) => TREES(x, y, 3), (x, y) => q(x, y, (n) => ISO.house(n, F, x + 0.2, y + 0.3, 2.0, 1.5, 0.9, 0.7, ROOF[Math.floor(rnd() * 4)]))],
        // the internet: glass offices, flats, parks
        [(x, y) => q(x, y, (n) => K.tower(n, x + 0.2, y + 0.2, 2.2, 2.2, 3.5 + rnd() * 4, ["#C9D6E3", "#DCE3EA", "#E3E6EB"][Math.floor(rnd() * 3)], C.water, rnd() < 0.5 ? "pv" : "plant")),
         (x, y) => q(x, y, (n) => K.tower(n, x + 0.2, y + 0.3, 2.2, 1.8, 2.6 + rnd(), "#EDE6DA", "#BFD3E6", "none", { punched: true, noShop: true })),
         (x, y) => { R(gnd, x, y, x + S, y + S, "#CFE3B8", 0.8); TREES(x, y, 3, "round"); folk(x, y, { phone: true, top: "#47B970" }); }]
      ][k];
      plots.forEach(([x, y], i) => kinds[Math.floor(rnd() * kinds.length)](x, y));
    }
    const emit = (Q, Ls, layer) => {
      Ls.sort((p, q) => p[0] - q[0]);
      const cuts = Ls.map((l) => l[0]).concat([Infinity]); let lo = -Infinity;
      cuts.forEach((yc, i) => {
        Q.filter(([, y]) => y >= lo && y < yc).sort((p, q) => p[0] + p[1] - q[0] - q[1]).forEach(([, , fn]) => fn(el("g", null, layer)));
        if (Ls[i]) Ls[i][1](el("g", null, layer));
        lo = yc;
      });
    };
    emit(BQ, BL, back); emit(FQ, FL, front);
  }

  function buildAges(svg, pf, nowTitle, nowSub) {
    svg.classList.add("iso", "is-live");
    svg.setAttribute("data-noink", "");
    const defs = svg.querySelector("defs") || el("defs", null, svg);
    el("rect", { x: 0, y: 0, width: 1600, height: 900, fill: "#FFFFFF" }, svg);
    const X = { W1: [], W2: [] }, strips = [];
    const plate = (g, cx, a) => { const p = el("g", null, g); el("rect", { x: cx - 100, y: TOP + 22, width: 200, height: 52, fill: "#FFFFFF", stroke: "#000", "stroke-width": 1 }, p); el("text", { x: cx, y: TOP + 45, "text-anchor": "middle", "font-family": "Poppins", "font-weight": 600, "font-size": 13, "letter-spacing": 1.6, fill: /ELEC|MODERN/.test(a.name) ? "#13824B" : "#192238", text: a.name }, p); el("text", { x: cx, y: TOP + 64, "text-anchor": "middle", "font-family": "Poppins", "font-weight": 500, "font-size": 12, "letter-spacing": 1, fill: "#626E88", text: a.date }, p); return p; };
    AGES.slice(0, 5).forEach((a, i) => {
      const x0 = X0 + i * SW, cx = x0 + SW / 2;
      const cp = el("clipPath", { id: `${pf}is-${i}` }, defs); el("rect", { x: x0, y: 0, width: SW, height: 900 }, cp);
      const outer = el("g", null, svg), g = el("g", { "clip-path": `url(#${pf}is-${i})` }, outer);
      sky(g, `${pf}isky-${i}`, a.sky, [x0, 0, SW, 900]);
      // the diagonal gx = gy (screen x of the slab's top corner) is the strip's centre line
      const world = el("g", { transform: `translate(${cx - 800 * ZS} ${250 - 70 * ZS}) scale(${ZS})` }, g);
      era(i, world, X);
      const pl = plate(outer, cx, a);
      strips.push({ outer, g, x0, cx, a, pl });
    });
    const x5 = X0 + 5 * SW, cx5 = x5 + SW / 2;
    const wcp = el("clipPath", { id: `${pf}iswide` }, defs), wipeRect = el("rect", { x: x5, y: 0, width: SW, height: 900 }, wcp);
    const wide = el("g", { "clip-path": `url(#${pf}iswide)` }, svg);
    sky(wide, `${pf}isky-now`, SKY, [0, 0, 1600, 900]);
    const pan = el("g", null, wide); town(el("g", { transform: "translate(230 120) scale(0.74)" }, pan), defs);
    const PAN = cx5 - (230 + 0.74 * 800);   // the strip looks down the middle of the town; the camera pans as it wipes open
    const lab = plate(el("g", null, svg), cx5, AGES[5]);
    const div = el("g", null, svg);
    for (let i = 1; i < 6; i++) el("rect", { x: X0 + i * SW - 1.5, y: 0, width: 3, height: 900, fill: "#FFFFFF", "data-nostroke": "" }, div);
    const wideG = el("g", { opacity: 0 }, svg); plate(wideG, 800, { name: nowTitle, date: nowSub });
    ISO.tweens.forEach((t) => t.play && t.play());
    // the wipe: one number drives the clip, the camera pan and the label together, each snapped to whole screen pixels,
    // so the fine outlines never shimmer between pixels while the town slides into view
    const W = { t: 0 }, x0 = x5;
    const px = () => { const m = svg.getScreenCTM(); return (m ? m.a : 1) * (window.devicePixelRatio || 1); };
    const snap = (v, k) => Math.round(v * k) / k;
    const setW = () => { const k = px(), t = W.t, cx = snap(x0 * (1 - t), k), w = snap(SW + (1600 - SW) * t, k);
      wipeRect.setAttribute("x", cx); wipeRect.setAttribute("width", w);
      pan.setAttribute("transform", `translate(${snap(PAN * (1 - t), k)} 0)`);
      lab.setAttribute("transform", `translate(${snap((800 - cx5) * t, k)} 0)`);
      // once the town fills the frame, drop the clip and stop drawing the strips underneath: the browser then repaints one
      // plain layer while the traffic moves, instead of re-clipping the whole town over five animated strips every frame
      const full = t >= 0.999;
      if (full) wide.removeAttribute("clip-path"); else wide.setAttribute("clip-path", `url(#${pf}iswide)`);
      strips.forEach((st) => { st.outer.style.display = full ? "none" : ""; }); div.style.display = full ? "none" : ""; };
    gsap.set(pan, { clearProps: "transform" }); setW();
    const wipe = (tl, at) => tl.to(W, { t: 1, duration: 0.6, ease: "power2.inOut", onUpdate: setW }, at);
    return { strips, X, wide, wipeRect, lab, div, wideG, cx5, pan, wipe };
  }

  function timeline(svg) {
    const tl = gsap.timeline({ paused: true });
    const A = buildAges(svg, "ci-", "ELECTRICITY GRIDS", "NOW");
    gsap.set(A.X.W1.concat(A.X.W2), { opacity: 0 });
    const veil = el("rect", { x: 0, y: 0, width: 1600, height: 900, fill: "#FFFFFF", opacity: 0 }, svg);
    const q = el("text", { x: 800, y: 640, "text-anchor": "middle", "font-family": "Poppins", "font-weight": 600, "font-size": 560, fill: "#192238", opacity: 0, text: "?" }, svg);
    const ageG = A.strips.map((s) => s.outer);
    gsap.set(ageG, { opacity: 0 }); gsap.set([A.wide, A.lab], { opacity: 0 });
    tl.to(ageG, { opacity: 1, duration: 0.2, stagger: 0.14 }, 0);
    tl.to([A.wide, A.lab], { opacity: 1, duration: 0.12 }, beat(1));
    A.wipe(tl, beat(1) + 0.15);
    tl.to(A.div, { opacity: 0, duration: 0.1 }, beat(1) + 0.15);
    tl.set(A.lab, { opacity: 0 }, beat(1) + 0.75); tl.set(A.wideG, { opacity: 1 }, beat(1) + 0.75);
    tl.to(veil, { opacity: 0.55, duration: 0.3 }, beat(2));
    tl.fromTo(q, { opacity: 0, scale: 0.8, svgOrigin: "800 450" }, { opacity: 0.9, scale: 1, svgOrigin: "800 450", duration: 0.4, ease: "back.out(1.6)" }, beat(2) + 0.1);
    hold(tl, 2);
    return tl;
  }

  // index3: Act 1 opens on the five past ages only, centred (the electricity strip is left for the valley that follows).
  // Card 1: the strips appear; card 2: their names come up one by one as the text lists them.
  function timeline2(svg) {
    const tl = gsap.timeline({ paused: true });
    const A = buildAges(svg, "cj-", "ELECTRICITY GRIDS", "NOW");
    gsap.set(A.X.W1.concat(A.X.W2), { opacity: 0 });
    A.wide.style.display = "none"; A.lab.style.display = "none";
    A.strips.forEach((st) => st.outer.setAttribute("transform", `translate(${SW / 2} 0)`)); A.div.setAttribute("transform", `translate(${SW / 2} 0)`);
    const ageG = A.strips.map((s) => s.outer), plates = A.strips.map((s) => s.pl);
    gsap.set(ageG, { opacity: 0 }); gsap.set(plates, { opacity: 0 });
    tl.to(ageG, { opacity: 1, duration: 0.2, stagger: 0.12 }, 0);
    plates.forEach((p, k) => tl.fromTo(p, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.12, ease: "power2.out" }, beat(1) + 0.05 + k * 0.13));
    hold(tl, 2);
    return tl;
  }

  function feats(svg) {
    const tl = gsap.timeline({ paused: true });
    const A = buildAges(svg, "gi-", "MODERN GRIDS", "THE CURRENT AGE");
    gsap.set(A.X.W1, { opacity: 0 });
    A.X.W2.forEach((n) => gsap.set(n, { scaleY: 0, svgOrigin: `${n.dataset.ox} ${n.dataset.oy}` }));
    tl.to(A.X.W1, { opacity: 1, duration: 0.15, stagger: 0.12 }, 0.05);                                                    // G1: more motion
    A.X.W2.forEach((n, k) => tl.to(n, { scaleY: 1, duration: 0.3, ease: "power2.out" }, beat(1) + (k / A.X.W2.length) * 0.7));   // G2: growth
    A.wipe(tl, beat(2) + 0.1);                                                                                              // G3: modern grids
    tl.to(A.div, { opacity: 0, duration: 0.1 }, beat(2) + 0.1);
    tl.to(A.lab, { opacity: 0, duration: 0.12 }, beat(2) + 0.62);
    tl.to(A.wideG, { opacity: 1, duration: 0.12 }, beat(2) + 0.62);
    hold(tl, 2);
    return tl;
  }

  // ERAS_FINE is set only by the export of the six ages as one SVG (section C2 of archive/index1.html): a cleaner drawing
  // with no people, and animals drawn as small solid figures instead of flat profiles
  if (window.ERAS_FINE) {
    K.person = (g) => el("g", { transform: "translate(0 0)" }, g);
    K.bike = () => {};
    const bx = (g, x, y, z, w, d, h, c, t) => F.box(g, x, y, z, w, d, h, { left: c, right: shade(c), top: t || lite(c) });
    K.cow = (g, x, y, o) => {   // a cow, about 2.4 m long, facing +gx (dir 1) or -gx
      o = o || {}; const col = o.col || "#F7F5EF", s = (o.dir || 1) < 0 ? -1 : 1, k = 0.62, x0 = x - 0.45 * k, y0 = y - 0.17 * k;
      [[0.08, 0.04], [0.08, 0.26], [0.78, 0.04], [0.78, 0.26]].forEach(([u, v]) => bx(g, x0 + u * k, y0 + v * k, 0, 0.07 * k, 0.06 * k, 0.3 * k, "#3E3632"));
      const body = bx(g, x0, y0, 0.28 * k, 0.9 * k, 0.36 * k, 0.34 * k, col, "#FFFFFF");
      if (!o.col) { F.face(g, F.L, body, 0.16 * k, 0.06 * k, 0.4 * k, 0.28 * k, "#3E3632", { "stroke-width": 0.4 }); F.face(g, F.L, body, 0.56 * k, 0.12 * k, 0.74 * k, 0.3 * k, "#3E3632", { "stroke-width": 0.4 }); }
      const hx = s > 0 ? x0 + 0.86 * k : x0 - 0.24 * k, head = bx(g, hx, y0 + 0.06 * k, 0.44 * k, 0.28 * k, 0.24 * k, 0.24 * k, col, "#FFFFFF");
      F.face(g, F.L, head, s > 0 ? 0.16 * k : 0, 0, s > 0 ? 0.28 * k : 0.12 * k, 0.1 * k, "#E8B4A8", { "stroke-width": 0.4 });
      return body;
    };
    K.sheep = (g, x, y, o) => {   // a sheep, about 1.2 m long, facing +gx (dir 1) or -gx
      o = o || {}; const s = (o.dir || 1) < 0 ? -1 : 1, k = 0.62, x0 = x - 0.25 * k, y0 = y - 0.12 * k;
      [[0.06, 0.04], [0.06, 0.2], [0.4, 0.04], [0.4, 0.2]].forEach(([u, v]) => bx(g, x0 + u * k, y0 + v * k, 0, 0.05 * k, 0.05 * k, 0.18 * k, "#262C3A"));
      const body = bx(g, x0, y0, 0.16 * k, 0.52 * k, 0.3 * k, 0.26 * k, "#F7F5EF", "#FFFFFF");
      bx(g, s > 0 ? x0 + 0.48 * k : x0 - 0.12 * k, y0 + 0.05 * k, (o.graze ? 0.1 : 0.26) * k, 0.16 * k, 0.2 * k, 0.18 * k, "#3E4860", "#262C3A");
      return body;
    };
  }
  window.ISOSCENES = { sky, town, K, era };
  Object.assign(window.SCENES, { hero, timeline, timeline2, feats });
})();
