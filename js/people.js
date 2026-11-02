/* People — flat editorial figures with a hand-inked finish.
   Faceless by design; anatomy built from tapered limbs, shaped hands and feet,
   clothing seams and hair strands. Ember palette only.
   person(parent, opts) → { g (wrapper, safe to animate with GSAP x/y), hand(side) } */
(function () {
  const { el } = SVG;
  const P = {
    n5: "#192238", n4: "#3E4860", n3: "#626E88", n2: "#B0B7C6", n1: "#D8DBE6",
    br5: "#553E39", br4: "#6D5A56", br3: "#857572", br2: "#B6B0AF", br1: "#D8D5D4", w: "#FFFFFF"
  };
  // skin tones come from the Brown ("Fossil fuels") family — the only warm neutrals in the palette
  // one uniform skin tone for every figure: the lightest brown in the palette (Brown 1)
  const SKIN = [P.br1, P.br1, P.br1, P.br1];
  const INK = P.n5;

  // elbow and hand offsets from the shoulder (right side; mirrored for left)
  const ARMS = {
    down: [[3, 26], [5, 52]],
    hip: [[15, 20], [6, 40]],
    wave: [[17, -10], [22, -40]],
    up: [[7, -26], [10, -54]],
    open: [[22, 10], [42, -4]],
    forward: [[10, 25], [34, 30]],
    hold: [[6, 27], [17, 42]],
    carry: [[4, 27], [6, 53]],
    point: [[18, -6], [46, -24]],
    table: [[12, 25], [37, 22]],
    wheel: [[16, 18], [38, 8]],
    back: [[-4, 25], [-10, 47]],
    pocket: [[8, 26], [3, 46]],
    jog: [[3, 24], [17, 14]]
  };

  function rock(node, cx, cy, a0, a1, dur, delay) {
    const o = { a: a0 };
    gsap.to(o, { a: a1, duration: dur, yoyo: true, repeat: -1, ease: "sine.inOut", delay: delay || 0,
      onUpdate: () => node.setAttribute("transform", `rotate(${o.a} ${cx} ${cy})`) });
  }
  // limb: a tapered, round-ended filled shape (so it carries an ink outline like every other shape)
  function limb(g, a, b, w0, w1, col) {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    const P = (p, n, w) => `${(p[0] + nx * n * w / 2).toFixed(2)} ${(p[1] + ny * n * w / 2).toFixed(2)}`;
    const d = `M${P(a, 1, w0)} L${P(b, 1, w1)} Q${(b[0] + ux * w1).toFixed(2)} ${(b[1] + uy * w1).toFixed(2)} ${P(b, -1, w1)} L${P(a, -1, w0)} Q${(a[0] - ux * w0).toFixed(2)} ${(a[1] - uy * w0).toFixed(2)} ${P(a, 1, w0)} Z`;
    return el("path", { d, fill: col }, g);
  }
  function detail(g, d, op) { el("path", { d, stroke: INK, "stroke-width": 1.1, fill: "none", "stroke-linecap": "round", opacity: op || 0.45, "vector-effect": "non-scaling-stroke" }, g); }

  function hairFront(g, style, col, hx, hy, rx, ry, back) {
    switch (style) {
      case "none": return;
      case "short": {
        if (back) { el("path", { d: `M${-rx - 0.5} ${hy + 3} C${-rx - 1.5} ${hy - ry * 1.3} ${rx + 1.5} ${hy - ry * 1.3} ${rx + 0.5} ${hy + 3} C${rx * 0.6} ${hy + ry * 0.6} ${-rx * 0.6} ${hy + ry * 0.6} ${-rx - 0.5} ${hy + 3} Z`, fill: col }, g); return; }
        el("path", { d: `M${-rx - 0.6} ${hy + 1} C${-rx - 2} ${hy - ry * 1.35} ${rx + 2.5} ${hy - ry * 1.4} ${rx + 0.8} ${hy + 1} C${rx - 0.5} ${hy - ry * 0.3} ${rx * 0.4} ${hy - ry * 0.62} ${-rx * 0.35} ${hy - ry * 0.5} C${-rx * 0.8} ${hy - ry * 0.35} ${-rx + 1} ${hy - 1} ${-rx - 0.6} ${hy + 1} Z`, fill: col }, g);
        detail(g, `M${-rx * 0.35} ${hy - ry * 0.52} C${-rx * 0.1} ${hy - ry * 0.9} ${rx * 0.4} ${hy - ry * 1.05} ${rx * 0.75} ${hy - ry * 0.75}`, 0.35);
        return;
      }
      case "long": case "bob": case "bun": case "curly": {
        if (style === "curly") {
          for (let i = 0; i < 9; i++) {
            const a = Math.PI * (0.95 + i / 8 * 1.1);
            el("circle", { cx: Math.cos(a) * (rx + 1.5), cy: hy + Math.sin(a) * (ry + 1) + 1, r: rx * 0.46, fill: col }, g);
          }
          if (back) el("ellipse", { cx: 0, cy: hy, rx: rx + 1, ry: ry + 1, fill: col }, g);
          return;
        }
        if (back) {
          el("ellipse", { cx: 0, cy: hy, rx: rx + 0.8, ry: ry + 0.8, fill: col }, g);
          if (style === "bun") el("circle", { cx: 0, cy: hy - ry * 0.4, r: rx * 0.55, fill: col }, g);
          detail(g, `M0 ${hy - ry} C${-rx * 0.3} ${hy} ${-rx * 0.4} ${hy + ry * 0.4} ${-rx * 0.5} ${hy + ry * 0.8}`, 0.35);
          return;
        }
        // centre-parted fringe
        el("path", { d: `M${-rx - 1} ${hy + 3} C${-rx - 2} ${hy - ry * 1.4} ${rx + 2} ${hy - ry * 1.4} ${rx + 1} ${hy + 3} C${rx - 1} ${hy - ry * 0.2} ${rx * 0.3} ${hy - ry * 0.65} 0 ${hy - ry * 0.8} C${-rx * 0.3} ${hy - ry * 0.65} ${-rx + 1} ${hy - ry * 0.2} ${-rx - 1} ${hy + 3} Z`, fill: col }, g);
        if (style === "bun") { el("circle", { cx: 0, cy: hy - ry * 1.15, r: rx * 0.52, fill: col }, g); }
        return;
      }
    }
  }
  function hairBack(g, style, col, hy, rx, ry, back) {
    if (style === "long") {
      el("path", { d: `M${-rx - 1.5} ${hy - 2} C${-rx - 4} ${hy + ry * 1.2} ${-rx - 2} ${hy + ry * 2.4} ${-rx + 1} ${hy + ry * 2.9} L${rx - 1} ${hy + ry * 2.9} C${rx + 2} ${hy + ry * 2.4} ${rx + 4} ${hy + ry * 1.2} ${rx + 1.5} ${hy - 2} Z`, fill: col }, g);
      detail(g, `M${-rx * 0.4} ${hy + ry} L${-rx * 0.5} ${hy + ry * 2.6} M${rx * 0.3} ${hy + ry * 1.2} L${rx * 0.35} ${hy + ry * 2.7}`, 0.3);
    }
    if (style === "bob") el("path", { d: `M${-rx - 2} ${hy - 3} C${-rx - 3.5} ${hy + ry * 0.6} ${-rx - 2} ${hy + ry * 1.05} ${-rx + 2} ${hy + ry * 1.15} L${rx - 2} ${hy + ry * 1.15} C${rx + 2} ${hy + ry * 1.05} ${rx + 3.5} ${hy + ry * 0.6} ${rx + 2} ${hy - 3} Z`, fill: col }, g);
  }
  function hat(g, kind, col, hy, rx, ry) {
    if (kind === "hat") {
      el("path", { d: `M${-rx + 1} ${hy - ry * 0.6} L${-rx + 2} ${hy - ry * 1.75} Q0 ${hy - ry * 2.05} ${rx - 2} ${hy - ry * 1.75} L${rx - 1} ${hy - ry * 0.6} Z`, fill: col }, g);
      el("path", { d: `M${-rx - 8} ${hy - ry * 0.55} Q0 ${hy - ry * 0.85} ${rx + 8} ${hy - ry * 0.55} Q0 ${hy - ry * 0.3} ${-rx - 8} ${hy - ry * 0.55} Z`, fill: col }, g);
      detail(g, `M${-rx + 1.5} ${hy - ry * 0.85} L${rx - 1.5} ${hy - ry * 0.85}`, 0.6);
    }
    if (kind === "cap") {
      el("path", { d: `M${-rx - 0.5} ${hy - 1} C${-rx - 1} ${hy - ry * 1.45} ${rx + 1} ${hy - ry * 1.45} ${rx + 0.5} ${hy - ry * 0.3} L${rx + 9} ${hy - ry * 0.2} Q${rx + 4} ${hy + 1} ${rx - 1} ${hy} Z`, fill: col }, g);
    }
    if (kind === "bonnet") {
      el("path", { d: `M${-rx - 3} ${hy + ry * 0.55} C${-rx - 6} ${hy - ry * 1.7} ${rx + 6} ${hy - ry * 1.7} ${rx + 3} ${hy + ry * 0.55} C${rx - 1} ${hy - ry * 0.5} ${-rx + 1} ${hy - ry * 0.5} ${-rx - 3} ${hy + ry * 0.55} Z`, fill: col }, g);
      detail(g, `M${-rx + 1} ${hy - ry * 0.35} C${-rx * 0.4} ${hy - ry * 0.75} ${rx * 0.4} ${hy - ry * 0.75} ${rx - 1} ${hy - ry * 0.35}`, 0.5);
    }
  }

  function person(parent, o) {
    o = Object.assign({ x: 0, y: 0, s: 1, skin: SKIN[1], hairCol: P.n5, hairStyle: "short", top: P.n3, bottom: P.n4,
      shoes: P.n5, pose: "stand", arms: {}, back: false, kid: false, flip: false, dress: null, coat: false, anim: null }, o);
    o.skin = SKIN[0];
    const wrap = el("g", null, parent);
    const g0 = el("g", { transform: `translate(${o.x} ${o.y}) scale(${o.s * (o.flip ? -1 : 1)} ${o.s})` }, wrap);
    const g = el("g", { transform: o.lean ? `rotate(${o.lean} 0 0)` : null }, g0);
    const sit = o.pose === "sit";
    const hipY = sit ? -50 : -90, up = hipY + 90;
    const rx = o.kid ? 12 : 10, ry = o.kid ? 13.5 : 11.8;
    const hy = -165 + up + (o.kid ? 4 : 0);
    const scarfHead = o.hairStyle === "scarf";
    const tcol = o.dress && !o.coat ? o.dress : o.top;
    const sleeve = o.sleeve || tcol;

    // --- behind the body ---
    if (scarfHead) el("path", { d: `M0 ${hy - ry - 4} C${rx + 9} ${hy - ry - 4} ${rx + 7} ${hy + 12} ${rx + 12} ${hy + 30} L${-rx - 12} ${hy + 30} C${-rx - 7} ${hy + 12} ${-rx - 9} ${hy - ry - 4} 0 ${hy - ry - 4} Z`, fill: o.scarfCol || o.hairCol }, g);
    else hairBack(g, o.hairStyle, o.hairCol, hy, rx, ry, o.back);

    // --- a chair under anyone seated at a table (riders and drivers bring their own seat) ---
    const atTable = sit && (o.arms.R === "table" || o.arms.L === "table");
    if (o.chair !== false && (o.chair || atTable)) {
      const cc = o.chairCol || P.n3;
      el("path", { d: `M-27 ${hipY - 54} L-21 ${hipY - 54} L-21 ${hipY + 7} L-27 ${hipY + 7} Z`, fill: cc }, g);      // backrest
      el("path", { d: `M-27 ${hipY + 5} L18 ${hipY + 5} L18 ${hipY + 11} L-27 ${hipY + 11} Z`, fill: cc }, g);         // seat
      el("path", { d: `M-25 ${hipY + 11} L-20 ${hipY + 11} L-20 0 L-25 0 Z M11 ${hipY + 11} L16 ${hipY + 11} L16 0 L11 0 Z`, fill: cc }, g);   // legs
    }

    // --- legs ---
    const legs = [];
    if (!o.noLegs) [-1, 1].forEach((side) => {
      const lg = el("g", null, g);
      if (sit) {
        const k = side * 3;
        el("path", { d: `M-14 ${hipY - 8} L${29 + k} ${hipY - 8} Q${37 + k} ${hipY - 8} ${37 + k} ${hipY + 1} L${35 + k} -6 L${25.5 + k} -6 L${25.5 + k} ${hipY + 7} L-14 ${hipY + 7} Z`, fill: o.dress && !o.coat ? o.dress : o.bottom }, lg);
        el("path", { d: `M${24 + k} -7 L${38 + k} -7 Q${45 + k} -6 ${44 + k} 0 L${23 + k} 0 Z`, fill: o.shoes }, lg);
      } else {
        const legCol = o.dress ? o.skin : o.bottom;
        if (o.dress) el("path", { d: `M${side * 3} ${hipY} L${side * 10.5} ${hipY} C${side * 11} ${-40} ${side * 9} ${-22} ${side * 8.2} -6 L${side * 4.2} -6 C${side * 4} ${-22} ${side * 2.5} ${-40} ${side * 3} ${hipY} Z`, fill: legCol }, lg);
        else {
          el("path", { d: `M${side * 15.5} ${hipY - 2} C${side * 16.5} ${hipY + 26} ${side * 13.5} ${-44} ${side * 12.4} -6 L${side * 3.4} -6 C${side * 3} ${-40} ${side * 1.2} ${hipY + 30} ${side * 0.4} ${hipY - 2} Z`, fill: legCol }, lg);
          detail(lg, `M${side * 8} ${hipY + 22} L${side * 7.8} -10`, 0.25);
        }
        const fx = o.back ? side * 7.5 : side * 7.5 + 2;
        el("path", { d: `M${fx - 7} -7 L${fx + 6} -7 Q${fx + 12} -6 ${fx + 11} 0 L${fx - 8} 0 Q${fx - 9} -4 ${fx - 7} -7 Z`, fill: o.shoes }, lg);
      }
      legs.push({ node: lg, hx: side * 7.5 });
    });
    if (!sit && !o.noLegs && !o.dress) el("path", { d: `M-15.5 ${hipY - 5} L15.5 ${hipY - 5} L15 ${hipY + 8} L-15 ${hipY + 8} Z`, fill: o.bottom }, g);

    // --- skirt / dress ---
    const longDress = o.dressLen === "long";
    if (o.dress && !sit) {
      const hem = longDress ? -9 : -36;
      el("path", { d: `M-14.5 ${-98 + up} C-17 ${-72} ${longDress ? -27 : -23} ${hem - 18} ${longDress ? -30 : -26} ${hem} Q0 ${hem + 6} ${longDress ? 30 : 26} ${hem} C${longDress ? 27 : 23} ${hem - 18} 17 ${-72} 14.5 ${-98 + up} Z`, fill: o.dress }, g);
      detail(g, `M-6 ${-80 + up} C-8 ${hem + 30} -9 ${hem + 10} -10 ${hem + 2} M7 ${-78 + up} C8 ${hem + 30} 10 ${hem + 10} 11 ${hem + 2}`, 0.28);
    }

    // --- torso ---
    const low = (o.coat ? -50 : -88) + up;
    const wid = o.coat ? 19 : 15;
    el("path", { d: `M-6 ${-153 + up} C-14 ${-153 + up} -20 ${-150 + up} -21 ${-142 + up} C-21 ${-128 + up} -17 ${-110 + up} ${-wid} ${low} L${wid} ${low} C17 ${-110 + up} 21 ${-128 + up} 21 ${-142 + up} C20 ${-150 + up} 14 ${-153 + up} 6 ${-153 + up} Q0 ${-150 + up} -6 ${-153 + up} Z`, fill: tcol }, g);
    el("path", { d: `M5 ${-153 + up} C14 ${-152 + up} 20 ${-149 + up} 21 ${-142 + up} C21 ${-128 + up} 17 ${-110 + up} ${wid} ${low} L9 ${low} C11 ${-110 + up} 10 ${-132 + up} 5 ${-153 + up} Z`, fill: INK, opacity: 0.09 }, g);
    if (!o.back) {
      if (o.coat) {
        detail(g, `M-6 ${-152 + up} L0 ${-124 + up} L6 ${-152 + up} M0 ${-124 + up} L0 ${low}`, 0.55);
        [0, 1, 2].forEach((i) => el("circle", { cx: 2.5, cy: -118 + up + i * 16, r: 1.4, fill: INK, opacity: 0.6, "data-noink": "" }, g));
        detail(g, `M-15 ${-92 + up} L-6 ${-92 + up} M6 ${-92 + up} L15 ${-92 + up}`, 0.4);
      } else if (!o.dress || o.coat) {
        detail(g, `M-5 ${-152 + up} Q0 ${-145 + up} 5 ${-152 + up} M0 ${-146 + up} L0 ${low + 2}`, 0.4);
      } else {
        detail(g, `M-6 ${-152 + up} Q0 ${-144 + up} 6 ${-152 + up} M-13 ${-98 + up} Q0 ${-95 + up} 13 ${-98 + up}`, 0.4);
      }
    } else detail(g, `M0 ${-148 + up} L0 ${low + 4}`, 0.2);
    if (o.apron) { el("path", { d: `M-11 ${-126 + up} L11 ${-126 + up} L14 ${-66 + up} L-14 ${-66 + up} Z`, fill: o.apron }, g); detail(g, `M-11 ${-126 + up} L-17 ${-150 + up} M11 ${-126 + up} L17 ${-150 + up}`, 0.5); }
    if (o.collar && !o.back) el("path", { d: `M-7 ${-153 + up} L-1 ${-140 + up} L-4 ${-153 + up} Z M7 ${-153 + up} L1 ${-140 + up} L4 ${-153 + up} Z`, fill: o.collar }, g);

    // --- neck, ears, head ---
    el("path", { d: `M-4.3 ${hy + ry - 3} L-5 ${-150 + up} Q0 ${-146 + up} 5 ${-150 + up} L4.3 ${hy + ry - 3} Z`, fill: o.skin }, g);
    if (scarfHead) {
      el("ellipse", { cx: 0, cy: hy, rx: rx + 4, ry: ry + 3.5, fill: o.scarfCol || o.hairCol }, g);
      if (!o.back) el("ellipse", { cx: 0, cy: hy + 1.5, rx: rx - 2, ry: ry - 1.5, fill: o.skin }, g);
      detail(g, `M${-rx - 3} ${hy + 6} C${-rx} ${hy + 18} ${rx} ${hy + 18} ${rx + 3} ${hy + 6}`, 0.4);
    } else {
      if (!o.back) { el("ellipse", { cx: -rx + 0.3, cy: hy + 1.5, rx: 2.6, ry: 3.8, fill: o.skin }, g); el("ellipse", { cx: rx - 0.3, cy: hy + 1.5, rx: 2.6, ry: 3.8, fill: o.skin }, g); }
      el("path", { d: `M0 ${hy - ry} C${rx * 1.08} ${hy - ry} ${rx * 1.12} ${hy + ry * 0.3} ${rx * 0.62} ${hy + ry * 0.82} Q0 ${hy + ry * 1.12} ${-rx * 0.62} ${hy + ry * 0.82} C${-rx * 1.12} ${hy + ry * 0.3} ${-rx * 1.08} ${hy - ry} 0 ${hy - ry} Z`, fill: o.skin }, g);
      hairFront(g, o.hairStyle, o.hairCol, 0, hy, rx, ry, o.back);
    }
    if (o.hat) hat(g, o.hat, o.hatCol || P.n5, hy, rx, ry);
    if (o.scarf) {
      const sc = el("g", null, g);
      el("path", { d: `M-8 ${-153 + up} Q0 ${-147 + up} 8 ${-153 + up} L10 ${-148 + up} Q0 ${-140 + up} -10 ${-148 + up} Z`, fill: o.scarf }, sc);
      const tail = el("path", { d: `M-8 ${-148 + up} Q-30 ${-150 + up} -46 ${-140 + up} L-42 ${-133 + up} Q-26 ${-142 + up} -6 ${-143 + up} Z`, fill: o.scarf }, sc);
      rock(tail, -8, -148 + up, -8, 10, 0.5);
    }

    // --- arms (tapered, inked) with shaped hands ---
    const hands = {};
    [["L", -1], ["R", 1]].forEach(([k, side]) => {
      const pose = ARMS[o.arms[k] || "down"];
      const sx = side * 16, sy = -143 + up;
      const ex = sx + side * pose[0][0], ey = sy + pose[0][1];
      const hx = sx + side * pose[1][0], hyy = sy + pose[1][1];
      const ag = el("g", null, g);
      limb(ag, [sx, sy], [ex, ey], 11.5, 9.5, sleeve);
      const fore = el("g", null, ag);
      const fi = el("g", null, fore);
      const short = o.shortSleeve;
      limb(fi, [ex, ey], [hx, hyy], 9.5, 7.2, short ? o.skin : sleeve);
      if (short) limb(fi, [ex, ey], [ex + (hx - ex) * 0.12, ey + (hyy - ey) * 0.12], 10.5, 10, sleeve);
      const ang = Math.atan2(hyy - ey, hx - ex) * 180 / Math.PI;
      const hg = el("g", { transform: `rotate(${ang - 90} ${hx} ${hyy})` }, fi);
      el("path", { d: `M${hx - 4.2} ${hyy - 3} Q${hx - 5} ${hyy + 6} ${hx} ${hyy + 7.5} Q${hx + 5} ${hyy + 6} ${hx + 4.2} ${hyy - 3} Z`, fill: o.skin }, hg);
      el("path", { d: `M${hx + side * 3.5} ${hyy} q${side * 3} 1 ${side * 3} 4`, stroke: INK, "stroke-width": 1, fill: "none", opacity: 0.5, "vector-effect": "non-scaling-stroke" }, hg);
      if (o.arms[k] === "wave") rock(fi, ex, ey, -18 * side, 16 * side, 0.45 + Math.random() * 0.1);
      if (o.gesture === k) rock(fi, ex, ey, -14 * side, 10 * side, 0.7 + Math.random() * 0.4);            // talking with one hand
      if (o.type) rock(fi, ex, ey, -3, 3, 0.16 + Math.random() * 0.05, Math.random());                   // typing
      if (o.anim === "run") rock(ag, sx, sy, k === "L" ? 18 : -18, k === "L" ? -18 : 18, 0.3);           // bent arms swing opposite the legs
      hands[k] = [o.x + o.s * (o.flip ? -1 : 1) * hx, o.y + o.s * (hyy + 4)];
    });

    // --- idle motion ---
    if (o.anim === "walk") legs.forEach((l, i) => rock(l.node, l.hx, hipY - 2, i ? -12 : 12, i ? 12 : -12, 0.38));
    if (o.anim === "run") legs.forEach((l, i) => rock(l.node, l.hx, hipY - 2, i ? -20 : 20, i ? 20 : -20, 0.3));
    const T = (dy, sc) => `translate(${o.x} ${o.y + dy}) scale(${o.s * (o.flip ? -1 : 1) * (sc || 1)} ${o.s * (sc || 1)})`;
    if (o.anim === "run") gsap.to(g0, { attr: { transform: T(-3) }, duration: 0.15, yoyo: true, repeat: -1, ease: "sine.inOut" });
    if (o.anim === "bob") gsap.to(g0, { attr: { transform: T(-6) }, duration: 0.35, yoyo: true, repeat: -1, ease: "sine.inOut" });
    if (o.anim === "breathe") gsap.to(g0, { attr: { transform: T(-1.2, 1.006) }, duration: 1.8 + Math.random(), yoyo: true, repeat: -1, ease: "sine.inOut" });

    return { g: wrap, hand: (k) => hands[k] };
  }

  window.PEOPLE = { person, SKIN, rock };
})();
