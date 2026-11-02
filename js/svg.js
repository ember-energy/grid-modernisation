/* Small SVG helpers + the Grid Highway Code sign renderer */
(function () {
  const NS = "http://www.w3.org/2000/svg";

  function el(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) {
      if (k === "text") n.textContent = attrs[k];
      else if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(n);
    return n;
  }

  // Icon as a nested <svg> positioned in the parent's coordinate space
  function icon(name, x, y, size, fill, parent) {
    const ic = window.ICONS[name];
    if (!ic) { console.warn("missing icon", name); return null; }
    const s = el("svg", { x: x - size / 2, y: y - size / 2, width: size, height: size, viewBox: ic.vb, fill }, parent);
    s.innerHTML = ic.body;
    return s;
  }

  const SHAPES = {
    optimize: { // hexagon
      outer: "M50 2 L93 26 L93 74 L50 98 L7 74 L7 26 Z",
      inner: "M50 9 L87 30 L87 70 L50 91 L13 70 L13 30 Z",
      fill: "#0B6638", line: "#FFFFFF", ink: "#FFFFFF", iconY: 50, iconS: 42
    },
    reinforce: { // shield
      outer: "M50 2 L94 14 L94 46 C94 74 74 90 50 98 C26 90 6 74 6 46 L6 14 Z",
      inner: "M50 9 L88 19 L88 46 C88 70 70 84 50 91 C30 84 12 70 12 46 L12 19 Z",
      fill: "#203772", line: "#FFFFFF", ink: "#FFFFFF", iconY: 47, iconS: 40
    },
    expand: { // diamond warning sign
      outer: "M50 1 L99 50 L50 99 L1 50 Z",
      inner: "M50 9 L91 50 L50 91 L9 50 Z",
      fill: "#FCA311", line: "#192238", ink: "#192238", iconY: 50, iconS: 36
    }
  };

  // Build a sign group (100x100 units) inside parent, centred at cx,cy with size px
  function signGroup(cat, iconName, cx, cy, size, parent) {
    const sh = SHAPES[cat];
    const g = el("g", { transform: `translate(${cx - size / 2},${cy - size / 2}) scale(${size / 100})` }, parent);
    el("path", { d: sh.outer, fill: sh.fill }, g);
    el("path", { d: sh.inner, fill: "none", stroke: sh.line, "stroke-width": 2.5 }, g);
    icon(iconName, 50, sh.iconY, sh.iconS, sh.ink, g);
    return g;
  }

  // Standalone <svg> sign element for HTML
  function signSVG(cat, iconName) {
    const s = el("svg", { viewBox: "0 0 100 100", class: "sign", "aria-hidden": "true" });
    signGroup(cat, iconName, 50, 50, 100, s);
    return s;
  }


  // continuous clockwise rotation about a fixed point (local coordinates) — hubs, fans, clock hands
  function spinAt(node, cx, cy, dur, from) {
    const o = { a: from || 0 };
    const set = () => node.setAttribute("transform", `rotate(${o.a} ${cx} ${cy})`);
    set();
    gsap.to(o, { a: (from || 0) + 360, duration: dur, repeat: -1, ease: "none", onUpdate: set });
    return node;
  }

  // wind turbine: tapered tower, nacelle and hub fixed at the top, three curved blades turning about the hub
  function turbine(g, x, baseY, h, opts) {
    opts = Object.assign({ col: "#FFFFFF", hubCol: "#B0B7C6", dur: 5, blade: h * 0.46 }, opts);
    const t = el("g", null, g);
    const hy = baseY - h, w0 = Math.max(2.5, h * 0.035), w1 = Math.max(1.2, h * 0.016);
    el("path", { d: `M${x - w0} ${baseY} L${x - w1} ${hy} L${x + w1} ${hy} L${x + w0} ${baseY} Z`, fill: opts.col }, t);
    el("path", { d: `M${x - w1 * 1.6} ${hy - w1 * 1.4} L${x + w1 * 5} ${hy - w1 * 1.2} Q${x + w1 * 6.2} ${hy} ${x + w1 * 5} ${hy + w1 * 1.2} L${x - w1 * 1.6} ${hy + w1 * 1.4} Z`, fill: opts.col }, t);
    const rotor = el("g", null, t);
    const L = opts.blade, bw = Math.max(1.6, L * 0.07);
    for (let b = 0; b < 3; b++) {
      el("path", { d: `M${x} ${hy} C${x - bw} ${hy - L * 0.25} ${x - bw * 0.8} ${hy - L * 0.8} ${x} ${hy - L} C${x + bw * 0.4} ${hy - L * 0.7} ${x + bw * 1.1} ${hy - L * 0.3} ${x} ${hy} Z`, fill: opts.col, transform: `rotate(${b * 120} ${x} ${hy})` }, rotor);
    }
    el("circle", { cx: x, cy: hy, r: Math.max(1.8, bw * 0.9), fill: opts.hubCol }, rotor);
    spinAt(rotor, x, hy, opts.dur, Math.random() * 120);
    return t;
  }

  // solar panel on any quadrilateral (tl, tr, br, bl): aluminium frame, blue cells, grid of cell lines
  function panelQuad(g, q, cols, rows, opts) {
    opts = Object.assign({ frame: "#D8DBE6", cell: "#203772", line: "#37A6E6" }, opts);
    const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const at = (u, v) => lerp(lerp(q[0], q[1], u), lerp(q[3], q[2], u), v);
    const P = (p) => p[0].toFixed(1) + " " + p[1].toFixed(1);
    const pg = el("g", null, g);
    el("path", { d: `M${P(q[0])} L${P(q[1])} L${P(q[2])} L${P(q[3])} Z`, fill: opts.frame }, pg);
    const i = 0.05;
    el("path", { d: `M${P(at(i, i * 1.6))} L${P(at(1 - i, i * 1.6))} L${P(at(1 - i, 1 - i * 1.6))} L${P(at(i, 1 - i * 1.6))} Z`, fill: opts.cell }, pg);
    let d = "";
    for (let c = 1; c < cols; c++) { const u = i + (1 - 2 * i) * c / cols; d += `M${P(at(u, i * 1.6))} L${P(at(u, 1 - i * 1.6))} `; }
    for (let r = 1; r < rows; r++) { const v = i * 1.6 + (1 - 3.2 * i) * r / rows; d += `M${P(at(i, v))} L${P(at(1 - i, v))} `; }
    el("path", { d, stroke: opts.line, "stroke-width": 0.8, fill: "none", "vector-effect": "non-scaling-stroke" }, pg);
    return pg;
  }
  // ground-mounted array row: tilted panels on legs
  function solarRow(g, x, y, n, w, h, opts) {
    opts = Object.assign({ gap: 6, skew: h * 0.45, leg: h * 0.9, legCol: "#626E88" }, opts);
    const row = el("g", null, g);
    for (let k = 0; k < n; k++) {
      const x0 = x + k * (w + opts.gap);
      el("path", { d: `M${x0 + w * 0.2 + opts.skew} ${y + h} L${x0 + w * 0.2 + opts.skew} ${y + h + opts.leg} M${x0 + w * 0.8 + opts.skew} ${y + h} L${x0 + w * 0.8 + opts.skew} ${y + h + opts.leg}`, stroke: opts.legCol, "stroke-width": Math.max(1.5, w * 0.04), fill: "none" }, row);
      panelQuad(row, [[x0, y], [x0 + w, y], [x0 + w + opts.skew, y + h], [x0 + opts.skew, y + h]], 6, 3);
    }
    return row;
  }
  window.SVG = { NS, el, icon, signGroup, signSVG, SHAPES, spinAt, turbine, panelQuad, solarRow };
})();
