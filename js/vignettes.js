/* Human moments — close-up illustrated vignettes layered into each era scene,
   plus the foreground "poster" figures that close each era.
   Each builder appends groups to the scene <svg> and returns them for the timeline. */
(function () {
  const { el, icon } = SVG;
  const { person, SKIN, rock } = PEOPLE;

  function K() { return window.KIT; }

  function grad(svg, id, stops, vertical) {
    let defs = svg.querySelector("defs") || el("defs", null, svg);
    const lg = el("linearGradient", { id, x1: 0, y1: 0, x2: vertical === false ? 1 : 0, y2: vertical === false ? 0 : 1 }, defs);
    stops.forEach(([o, c]) => el("stop", { offset: o, "stop-color": c }, lg));
    return `url(#${id})`;
  }
  function layer(svg) {
    const v = el("g", { opacity: 0 }, svg);
    const cam = el("g", null, v);
    return { v, cam };
  }
  function steam(g, x, y, n, col, scale) { K().puffs(g, x, y, n, col, scale); }
  function spinWheel(g, cx, cy, r, tire, hub, dur) {
    el("circle", { cx, cy, r, fill: tire }, g);
    const w = el("g", { class: "spin", style: `animation-duration:${dur || 0.6}s` }, g);
    el("circle", { cx, cy, r: r * 0.62, fill: hub }, w);
    for (let i = 0; i < 4; i++) el("line", { x1: cx, y1: cy - r * 0.55, x2: cx, y2: cy + r * 0.55, stroke: tire, "stroke-width": 2, transform: `rotate(${i * 45} ${cx} ${cy})` }, w);
    el("circle", { cx, cy, r: r * 0.18, fill: tire }, w);
    return w;
  }
  function loopX(node, dist, dur) { gsap.fromTo(node, { x: 0 }, { x: -dist, duration: dur, repeat: -1, ease: "none" }); }

  /* ---------- shared props ---------- */
  // a compact family car seen from the side, the family visible through the windows, luggage on the roof
  function familyCar(g, x, y, s, col) {
    const C = K().C;
    const c = el("g", { transform: `translate(${x} ${y}) scale(${s})` }, g);
    el("path", { d: "M-122 -82 L-96 -138 L70 -138 L120 -82 Z", fill: C.b1 }, c);                  // glass
    person(c, { x: 52, y: -8, s: 0.92, pose: "sit", skin: SKIN[0], hairStyle: "bob", hairCol: C.y4, top: C.o1, bottom: C.b5, scarf: C.y3, arms: { R: "wheel", L: "wheel" } });
    person(c, { x: -58, y: -22, s: 0.6, kid: true, pose: "sit", skin: SKIN[1], hairStyle: "curly", hairCol: C.br5, top: C.b3, bottom: C.n4, arms: { R: "wave", L: "down" } });
    person(c, { x: -2, y: -22, s: 0.58, kid: true, pose: "sit", skin: SKIN[1], hairStyle: "long", hairCol: C.br5, top: C.g4, bottom: C.n4, arms: { R: "up" } });
    el("path", { d: "M-206 -30 C-206 -68 -182 -80 -132 -82 L172 -80 C200 -76 212 -62 212 -36 L208 -18 L-202 -18 Z", fill: col }, c);          // body, in front of the family
    el("path", { d: "M-100 -134 L72 -134 L66 -144 L-94 -144 Z", fill: col }, c);                  // roof
    el("path", { d: "M114 -82 L124 -82 L76 -142 L66 -140 Z", fill: col }, c);                     // A-pillar
    el("path", { d: "M-14 -82 L-4 -82 L-4 -138 L-14 -138 Z", fill: col }, c);                    // B-pillar
    el("path", { d: "M-124 -82 L-112 -82 L-88 -140 L-100 -140 Z", fill: col }, c);                // C-pillar
    el("path", { d: "M-196 -50 L206 -48", stroke: C.n5, "stroke-width": 1.2, fill: "none", opacity: 0.5 }, c);
    el("path", { d: "M18 -74 L40 -74", stroke: C.n5, "stroke-width": 3, "stroke-linecap": "round" }, c); // door handle
    el("path", { d: "M-100 -74 L-80 -74", stroke: C.n5, "stroke-width": 3, "stroke-linecap": "round" }, c);
    el("path", { d: "M196 -62 L212 -58 L212 -48 L198 -50 Z", fill: C.y2 }, c);                   // headlight
    el("path", { d: "M-206 -60 L-196 -60 L-196 -46 L-206 -46 Z", fill: C.o3 }, c);               // tail light
    // roof rack + luggage
    el("path", { d: "M-84 -144 L-84 -152 M54 -144 L54 -152 M-96 -152 L66 -152", stroke: C.n5, "stroke-width": 3, fill: "none" }, c);
    el("path", { d: "M-80 -152 L-80 -182 Q-80 -186 -76 -186 L-12 -186 Q-8 -186 -8 -182 L-8 -152 Z", fill: C.br4 }, c);
    el("path", { d: "M0 -152 L0 -174 Q0 -178 4 -178 L44 -178 Q48 -178 48 -174 L48 -152 Z", fill: C.b5 }, c);
    el("path", { d: "M-54 -186 L-54 -152 M24 -178 L24 -152", stroke: C.n5, "stroke-width": 1.2, opacity: 0.6, fill: "none" }, c);
    spinWheel(c, -130, -18, 30, C.n5, C.n2, 0.45);
    spinWheel(c, 136, -18, 30, C.n5, C.n2, 0.45);
    return c;
  }
  function bike(g, x, y, s, col, rider) {
    const C = K().C;
    const b = el("g", null, g);
    const inner = el("g", { transform: `translate(${x} ${y}) scale(${s})` }, b);
    spinWheel(inner, -32, -24, 23, C.n5, C.w, 0.7);
    spinWheel(inner, 34, -24, 23, C.n5, C.w, 0.7);
    el("path", { d: "M-32 -24 L-6 -24 L20 -56 L-14 -56 Z M-6 -24 L-16 -66 M20 -56 L34 -24 M20 -56 L16 -74 L26 -76", stroke: col, "stroke-width": 4.5, fill: "none", "stroke-linejoin": "round", "stroke-linecap": "round" }, inner);
    if (rider) person(inner, Object.assign({ x: -24, y: -22, s: 0.62, pose: "sit", arms: { L: "wheel", R: "wheel" } }, rider));
    return b;
  }
  function stall(g, x, y, w, stripe, goods) {
    const C = K().C;
    const s = el("g", null, g);
    el("rect", { x: x + 6, y: y - 250, width: 6, height: 250, fill: C.br5 }, s);
    el("rect", { x: x + w - 12, y: y - 250, width: 6, height: 250, fill: C.br5 }, s);
    const n = Math.round(w / 30);
    for (let i = 0; i < n; i++) {
      const sx = x + (w / n) * i;
      el("path", { d: `M${sx} ${y - 260} L${sx + w / n} ${y - 260} L${sx + w / n} ${y - 230} Q${sx + w / n / 2} ${y - 218} ${sx} ${y - 230} Z`, fill: i % 2 ? C.w : stripe }, s);
    }
    el("rect", { x: x - 4, y: y - 266, width: w + 8, height: 8, fill: C.br5 }, s);
    return s;
  }
  function counter(g, x, y, w, goods) {
    const C = K().C;
    el("rect", { x, y: y - 80, width: w, height: 80, fill: C.br4 }, g);
    el("rect", { x: x - 6, y: y - 86, width: w + 12, height: 8, fill: C.br5 }, g);
    for (let i = 0; i < w / 60 - 1; i++) el("line", { x1: x + 30 + i * 60, y1: y - 76, x2: x + 30 + i * 60, y2: y, stroke: C.br5, "stroke-width": 2 }, g);
    goods.forEach((gd, i) => {
      const gx = x + 20 + i * (w - 40) / goods.length;
      if (gd === "oranges" || gd === "apples") {
        const col = gd === "oranges" ? C.o1 : C.o4;
        el("rect", { x: gx, y: y - 104, width: 64, height: 18, fill: C.br3 }, g);
        for (let r = 0; r < 3; r++) for (let c = 0; c < 5 - r; c++) el("circle", { cx: gx + 8 + c * 12 + r * 6, cy: y - 108 - r * 10, r: 6.5, fill: col }, g);
      } else if (gd === "cloth") {
        [C.b4, C.g4, C.o5, C.y4].forEach((cc, k) => el("rect", { x: gx + k * 16, y: y - 124, width: 14, height: 38, rx: 6, fill: cc }, g));
      } else if (gd === "crates") {
        el("rect", { x: gx, y: y - 130, width: 44, height: 44, fill: C.y4 }, g);
        el("rect", { x: gx + 48, y: y - 116, width: 34, height: 30, fill: C.br3 }, g);
        el("path", { d: `M${gx} ${y - 130} L${gx + 44} ${y - 86} M${gx + 44} ${y - 130} L${gx} ${y - 86}`, stroke: C.br5, "stroke-width": 2 }, g);
      } else if (gd === "bread") {
        for (let k = 0; k < 4; k++) el("ellipse", { cx: gx + 12 + k * 18, cy: y - 94, rx: 10, ry: 7, fill: C.y4 }, g);
      }
    });
  }

  /* ================= RAILWAYS ================= */
  function rail(svg) {
    const C = K().C;
    const out = {};

    /* V1 — the platform: a daughter comes home */
    {
      const { v, cam } = layer(svg);
      el("rect", { x: 0, y: 0, width: 1600, height: 900, fill: C.br1 }, cam);
      el("rect", { x: 0, y: 0, width: 1600, height: 380, fill: grad(svg, "v-rail1-roof", [[0, C.y1], [1, C.br1]]) }, cam);
      // iron roof: arches and ribs
      const iron = el("g", { stroke: C.n4, fill: "none" }, cam);
      [300, 1000, 1700].forEach((cx) => {
        el("path", { d: `M${cx - 380} 430 A380 380 0 0 1 ${cx + 380} 430`, "stroke-width": 12 }, iron);
        el("path", { d: `M${cx - 340} 430 A340 340 0 0 1 ${cx + 340} 430`, "stroke-width": 3 }, iron);
        for (let i = 1; i < 12; i++) {
          const a = Math.PI + (Math.PI * i) / 12;
          el("line", { x1: cx + Math.cos(a) * 340, y1: 430 + Math.sin(a) * 340, x2: cx + Math.cos(a) * 380, y2: 430 + Math.sin(a) * 380, "stroke-width": 3 }, iron);
        }
      });
      for (let x = 0; x < 1600; x += 80) el("line", { x1: x, y1: 0, x2: x + 40, y2: 380, stroke: C.n2, "stroke-width": 1.5 }, cam);
      // columns
      [660, 1340].forEach((x) => {
        el("rect", { x: x - 11, y: 360, width: 22, height: 420, fill: C.n4 }, cam);
        el("rect", { x: x - 22, y: 350, width: 44, height: 16, fill: C.n4 }, cam);
        el("rect", { x: x - 18, y: 760, width: 36, height: 20, fill: C.n4 }, cam);
      });
      // clock
      const clk = el("g", null, cam);
      el("line", { x1: 1000, y1: 230, x2: 1000, y2: 300, stroke: C.n4, "stroke-width": 4 }, clk);
      el("circle", { cx: 1000, cy: 340, r: 44, fill: C.w, stroke: C.n4, "stroke-width": 7 }, clk);
      for (let i = 0; i < 12; i++) el("line", { x1: 1000, y1: 304, x2: 1000, y2: 311, stroke: C.n4, "stroke-width": 2.5, transform: `rotate(${i * 30} 1000 340)` }, clk);
      const hr = el("line", { x1: 1000, y1: 340, x2: 1000, y2: 316, stroke: C.n5, "stroke-width": 4, "stroke-linecap": "round" }, clk);
      const mn = el("line", { x1: 1000, y1: 340, x2: 1000, y2: 306, stroke: C.n5, "stroke-width": 2.5, "stroke-linecap": "round" }, clk);
      SVG.spinAt(mn, 1000, 340, 30, 60); SVG.spinAt(hr, 1000, 340, 360, 130);
      // board
      el("rect", { x: 1120, y: 420, width: 180, height: 44, fill: C.g5 }, cam);
      el("text", { x: 1210, y: 449, "text-anchor": "middle", fill: C.w, "font-family": "Poppins", "font-weight": 600, "font-size": 17, "letter-spacing": 3, text: "ARRIVALS" }, cam);
      // back wall with doors, far passengers
      el("rect", { x: 0, y: 560, width: 1600, height: 200, fill: C.br2 }, cam);
      for (let x = 760; x < 1600; x += 150) {
        el("path", { d: `M${x} 760 L${x} 620 A40 40 0 0 1 ${x + 80} 620 L${x + 80} 760 Z`, fill: C.br3 }, cam);
      }
      const crowd = el("g", null, cam);
      const tones = [C.n3, C.br3, C.n2, C.br4];
      for (let i = 0; i < 9; i++) {
        const p = person(crowd, { x: 700 + i * 110, y: 762, s: 0.85, skin: C.br3, hairCol: tones[(i + 1) % 4], top: tones[i % 4], bottom: tones[(i + 2) % 4], shoes: C.br4, dress: i % 3 === 0 ? tones[i % 4] : null, hat: i % 3 === 1 ? "hat" : null, hatCol: C.br4, anim: "walk", flip: i % 2 === 0 });
        gsap.to(p.g, { x: i % 2 ? 300 : -300, duration: 18 + i, repeat: -1, yoyo: true, ease: "none" });
      }
      // train carriage on the left
      const tr = el("g", null, cam);
      el("rect", { x: -60, y: 470, width: 640, height: 300, fill: C.o5 }, tr);
      el("rect", { x: -60, y: 460, width: 650, height: 18, fill: C.br5 }, tr);
      for (let i = 0; i < 4; i++) {
        el("rect", { x: -30 + i * 130, y: 510, width: 96, height: 80, fill: C.y1 }, tr);
        el("circle", { cx: 0 + i * 130, cy: 560, r: 13, fill: C.br3 }, tr);
        el("rect", { x: -34 + i * 130, y: 610, width: 104, height: 130, fill: "none", stroke: C.br5, "stroke-width": 3 }, tr);
      }
      el("rect", { x: 500, y: 500, width: 74, height: 270, fill: C.br5 }, tr); // open door
      el("rect", { x: 574, y: 500, width: 14, height: 270, fill: C.o4 }, tr);
      el("rect", { x: -60, y: 770, width: 650, height: 16, fill: C.n5 }, tr);
      steam(cam, 200, 470, 6, C.w, 2.2);
      // platform floor
      el("rect", { x: 0, y: 780, width: 1600, height: 120, fill: C.br2 }, cam);
      el("rect", { x: 0, y: 780, width: 600, height: 12, fill: C.y4 }, cam);
      for (let x = 620; x < 1600; x += 120) el("line", { x1: x, y1: 790, x2: x - 60, y2: 900, stroke: C.br3, "stroke-width": 2 }, cam);
      // the family
      const fam = el("g", null, cam);
      const daughter = person(fam, { x: 680, y: 860, s: 1.5, skin: SKIN[0], hairStyle: "bun", hairCol: C.br5, dress: C.b4, dressLen: "long", shoes: C.br5, arms: { L: "carry", R: "open" }, collar: C.w, mood: "open", lean: 3 });
      const [hx, hy] = daughter.hand("L");
      el("rect", { x: hx - 19, y: hy - 4, width: 38, height: 29, rx: 3, fill: C.br4 }, fam);
      el("rect", { x: hx - 6, y: hy - 9, width: 12, height: 6, rx: 2, fill: "none", stroke: C.br5, "stroke-width": 2.5 }, fam);
      person(fam, { x: 880, y: 868, s: 1.58, skin: SKIN[1], hairStyle: "short", hairCol: C.n2, hat: "hat", hatCol: C.n5, top: C.br5, bottom: C.n4, coat: true, arms: { L: "open", R: "open" }, flip: true, collar: C.w, anim: "breathe", mood: "open", lean: 2 });
      person(fam, { x: 980, y: 866, s: 1.48, skin: SKIN[1], hairStyle: "bun", hairCol: C.br4, dress: C.g5, dressLen: "long", shoes: C.br5, arms: { L: "down", R: "wave" }, flip: true, hat: "bonnet", hatCol: C.y4, mood: "open" });
      person(fam, { x: 790, y: 874, s: 0.98, kid: true, skin: SKIN[1], hairStyle: "cap", hairCol: C.br5, top: C.o4, bottom: C.n4, arms: { L: "up", R: "up" }, anim: "bob", flip: true, mood: "open" });
      // porter
      const porter = person(fam, { x: 1330, y: 862, s: 1.45, skin: SKIN[3], hairStyle: "cap", hairCol: C.n5, top: C.b5, bottom: C.n5, arms: { L: "forward", R: "forward" }, flip: true, anim: "walk" });
      el("rect", { x: 1170, y: 770, width: 90, height: 60, fill: C.br4 }, fam);
      el("rect", { x: 1180, y: 730, width: 70, height: 40, fill: C.o5 }, fam);
      el("circle", { cx: 1185, cy: 850, r: 16, fill: C.n5 }, fam);
      el("line", { x1: 1260, y1: 790, x2: 1290, y2: 770, stroke: C.n5, "stroke-width": 5 }, fam);
      out.v1 = v; out.cam1 = cam;
    }

    /* V2 — market street under the viaduct */
    {
      const { v, cam } = layer(svg);
      el("rect", { x: 0, y: 0, width: 1600, height: 900, fill: grad(svg, "v-rail2-sky", [[0, C.br1], [1, C.y1]]) }, cam);
      // town roofs behind
      const roofs = el("g", null, cam);
      for (let i = 0; i < 16; i++) {
        const x = i * 104, h = 120 + (i * 37) % 90;
        el("rect", { x, y: 520 - h, width: 100, height: h, fill: C.br2 }, roofs);
        el("path", { d: `M${x - 4} ${520 - h} L${x + 50} ${490 - h} L${x + 104} ${520 - h} Z`, fill: C.br3 }, roofs);
        el("rect", { x: x + 70, y: 480 - h, width: 12, height: 30, fill: C.br3 }, roofs);
      }
      // viaduct with train
      const via = el("g", null, cam);
      el("rect", { x: 0, y: 250, width: 1600, height: 40, fill: C.br4 }, via);
      for (let x = 0; x < 1700; x += 160) {
        el("path", { d: `M${x} 290 L${x + 160} 290 L${x + 160} 560 L${x + 140} 560 L${x + 140} 380 A60 60 0 0 0 ${x + 20} 380 L${x + 20} 560 L${x} 560 Z`, fill: C.br4 }, via);
      }
      el("rect", { x: 0, y: 244, width: 1600, height: 8, fill: C.br5 }, via);
      const train = el("g", null, via);
      el("rect", { x: 0, y: 200, width: 120, height: 44, fill: C.br5 }, train);
      el("rect", { x: 20, y: 178, width: 18, height: 24, fill: C.br5 }, train);
      for (let i = 1; i < 6; i++) el("rect", { x: -i * 130, y: 206, width: 120, height: 38, fill: i % 2 ? C.o5 : C.br4 }, train);
      steam(train, 29, 170, 5, C.w, 1.4);
      gsap.fromTo(train, { x: -300 }, { x: 2400, duration: 14, repeat: -1, ease: "none" });
      // street
      el("rect", { x: 0, y: 560, width: 1600, height: 340, fill: C.br2 }, cam);
      for (let y = 600; y < 900; y += 34) for (let x = (y / 34) % 2 * 20; x < 1600; x += 40) el("rect", { x, y, width: 34, height: 28, rx: 6, fill: C.br1, opacity: 0.35 }, cam);
      // stalls (awnings behind, people, counters in front)
      const stalls = [[560, 300, C.o4, ["oranges", "apples", "crates"]], [920, 280, C.g5, ["cloth", "crates"]], [1260, 300, C.b4, ["bread", "oranges"]]];
      stalls.forEach(([x, w, col]) => stall(cam, x, 760, w, col));
      const ppl = el("g", null, cam);
      person(ppl, { x: 700, y: 780, s: 1.2, skin: SKIN[2], hairStyle: "short", hairCol: C.n5, top: C.w, bottom: C.n4, apron: C.br1, arms: { L: "table", R: "hip" } });
      person(ppl, { x: 1050, y: 780, s: 1.2, skin: SKIN[0], hairStyle: "bun", hairCol: C.y4, dress: C.o5, dressLen: "long", arms: { R: "table" }, flip: true, mood: "open" });
      person(ppl, { x: 1400, y: 780, s: 1.2, skin: SKIN[1], hairStyle: "cap", hairCol: C.n5, top: C.br5, bottom: C.n4, apron: C.w, arms: { L: "wave" } });
      stalls.forEach(([x, w, , goods]) => counter(cam, x, 760, w, goods));
      // shoppers in front
      const front = el("g", null, cam);
      person(front, { x: 820, y: 890, s: 1.5, skin: SKIN[1], hairStyle: "long", hairCol: C.br5, dress: C.b5, dressLen: "long", arms: { L: "forward", R: "down" }, hat: "bonnet", hatCol: C.br4, anim: "breathe" });
      person(front, { x: 750, y: 892, s: 0.95, kid: true, skin: SKIN[1], hairStyle: "bob", hairCol: C.br5, dress: C.y4, arms: { R: "up" } });
      const man = person(front, { x: 1180, y: 890, s: 1.52, skin: SKIN[3], hairStyle: "short", hat: "hat", hatCol: C.br5, top: C.n4, bottom: C.n5, coat: true, arms: { L: "forward", R: "forward" }, flip: true });
      const [nx, ny] = man.hand("L");
      el("path", { d: `M${nx - 42} ${ny - 36} L${nx + 14} ${ny - 42} L${nx + 18} ${ny + 4} L${nx - 38} ${ny + 10} Z`, fill: C.w }, front);
      for (let i = 0; i < 4; i++) el("line", { x1: nx - 32, y1: ny - 26 + i * 9, x2: nx + 8, y2: ny - 30 + i * 9, stroke: C.n2, "stroke-width": 2 }, front);
      // child with hoop
      const hoopKid = el("g", null, front);
      person(hoopKid, { x: 1460, y: 892, s: 0.95, kid: true, skin: SKIN[2], hairStyle: "cap", top: C.g5, bottom: C.n4, arms: { R: "forward" }, anim: "walk" });
      el("circle", { cx: 1505, cy: 868, r: 24, fill: "none", stroke: C.br5, "stroke-width": 4 }, hoopKid);
      gsap.fromTo(hoopKid, { x: 200 }, { x: -1100, duration: 16, repeat: -1, ease: "none" });
      out.v2 = v; out.cam2 = cam;
    }

    out.fg = el("g", null, svg); // era closes on the landscape itself
    return out;
  }

  /* ================= HIGHWAYS ================= */
  function road(svg) {
    const C = K().C;
    const out = {};

    /* V1 — the family road trip */
    {
      const { v, cam } = layer(svg);
      el("rect", { x: 0, y: 0, width: 1600, height: 900, fill: grad(svg, "v-road1-sky", [[0, C.b2], [0.7, C.w]]) }, cam);
      [[300, 140], [1100, 90], [1450, 200]].forEach(([x, y]) => {
        const cl = el("g", null, cam);
        el("ellipse", { cx: x, cy: y, rx: 90, ry: 20, fill: C.w }, cl);
        el("ellipse", { cx: x + 30, cy: y - 14, rx: 50, ry: 22, fill: C.w }, cl);
        gsap.to(cl, { x: -120, duration: 40, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });
      el("path", { d: "M0 420 L200 330 L360 400 L560 300 L760 410 L980 320 L1180 420 L1400 330 L1600 400 L1600 470 L0 470 Z", fill: C.b1 }, cam);
      el("rect", { x: 0, y: 460, width: 1600, height: 60, fill: C.b2 }, cam);
      [[400, 480], [1200, 488], [900, 476]].forEach(([x, y], i) => {
        const sb = el("g", null, cam);
        el("path", { d: `M${x} ${y} l0 -34 l22 30 Z M${x - 3} ${y} l0 -26 l-16 24 Z`, fill: C.w }, sb);
        el("path", { d: `M${x - 20} ${y + 2} L${x + 26} ${y + 2} L${x + 20} ${y + 8} L${x - 14} ${y + 8} Z`, fill: C.n4 }, sb);
        gsap.to(sb, { x: 60, duration: 12 + i * 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      });
      // parallax hills + trees (loop)
      const mid = el("g", null, cam);
      for (let k = 0; k < 2; k++) el("path", { d: `M${k * 1600} 560 C${k * 1600 + 300} 500 ${k * 1600 + 600} 540 ${k * 1600 + 900} 510 S${k * 1600 + 1400} 540 ${k * 1600 + 1600} 520 L${k * 1600 + 1600} 700 L${k * 1600} 700 Z`, fill: C.g2 }, mid);
      loopX(mid, 1600, 40);
      const near = el("g", null, cam);
      for (let k = 0; k < 2; k++) for (let i = 0; i < 9; i++) {
        const x = k * 1600 + i * 180 + (i % 3) * 30;
        K().pine(near, x, 690, 1.3 + (i % 2) * 0.4, i % 2 ? C.g5 : C.g4);
      }
      el("rect", { x: 0, y: 680, width: 3200, height: 30, fill: C.g4 }, near);
      loopX(near, 1600, 9);
      // road
      el("rect", { x: 0, y: 700, width: 1600, height: 110, fill: C.n4 }, cam);
      const lane = el("line", { x1: 0, y1: 760, x2: 1700, y2: 760, stroke: C.y3, "stroke-width": 5, "stroke-dasharray": "40 36" }, cam);
      gsap.to(lane, { strokeDashoffset: 76, duration: 0.45, repeat: -1, ease: "none" });
      el("rect", { x: 0, y: 810, width: 1600, height: 90, fill: C.g1 }, cam);
      // posts moving fast
      const posts = el("g", null, cam);
      for (let i = 0; i < 16; i++) { el("rect", { x: i * 200, y: 812, width: 8, height: 44, fill: C.w }, posts); el("rect", { x: i * 200 - 4, y: 816, width: 16, height: 6, fill: C.o4 }, posts); }
      loopX(posts, 1600, 3);
      // car + family
      const carG = el("g", null, cam);
      familyCar(carG, 860, 786, 1.3, C.o4); // wheels sit in the near lane of the road (700–810)
      gsap.to(carG, { y: -3, duration: 0.18, yoyo: true, repeat: -1, ease: "sine.inOut" });
      out.v1 = v; out.cam1 = cam;
    }

    /* V2 — home in the suburbs, evening */
    {
      const { v, cam } = layer(svg);
      el("rect", { x: 0, y: 0, width: 1600, height: 900, fill: grad(svg, "v-road2-sky", [[0, C.b2], [0.55, C.y1], [1, C.o1]]) }, cam);
      el("circle", { cx: 360, cy: 520, r: 60, fill: C.y2 }, cam);
      // neighbouring houses far
      for (let i = 0; i < 5; i++) {
        const x = i * 330 - 60;
        el("rect", { x, y: 500, width: 220, height: 90, fill: C.b1 }, cam);
        el("path", { d: `M${x - 20} 500 L${x + 110} 440 L${x + 240} 500 Z`, fill: C.n3 }, cam);
        el("rect", { x: x + 30, y: 530, width: 40, height: 30, fill: C.y2 }, cam);
        el("rect", { x: x + 140, y: 530, width: 40, height: 30, fill: C.y2 }, cam);
      }
      el("rect", { x: 0, y: 580, width: 1600, height: 320, fill: C.g2 }, cam);
      // the house
      const h = el("g", null, cam);
      el("rect", { x: 880, y: 420, width: 560, height: 280, fill: C.w }, h);
      el("path", { d: "M850 430 L1080 300 L1310 430 Z", fill: C.n4 }, h);
      el("path", { d: "M1180 430 L1320 350 L1470 430 Z", fill: C.n3 }, h);
      el("rect", { x: 1360, y: 330, width: 34, height: 70, fill: C.br4 }, h);
      [[920, 480], [1180, 480], [1300, 480]].forEach(([x, y]) => {
        el("rect", { x, y, width: 100, height: 90, fill: C.y2 }, h);
        el("path", { d: `M${x + 50} ${y} L${x + 50} ${y + 90} M${x} ${y + 45} L${x + 100} ${y + 45}`, stroke: C.w, "stroke-width": 5 }, h);
        el("rect", { x: x - 8, y: y + 90, width: 116, height: 10, fill: C.n3 }, h);
      });
      el("rect", { x: 1060, y: 530, width: 70, height: 170, fill: C.o4 }, h); // door
      el("rect", { x: 1040, y: 520, width: 110, height: 12, fill: C.n4 }, h);
      // garage + car
      el("rect", { x: 1440, y: 500, width: 200, height: 200, fill: C.b1 }, h);
      el("path", { d: "M1430 500 L1540 450 L1650 500 Z", fill: C.n3 }, h);
      // tree
      el("rect", { x: 780, y: 450, width: 20, height: 250, fill: C.br4 }, cam);
      el("circle", { cx: 790, cy: 420, r: 90, fill: C.g4 }, cam);
      el("circle", { cx: 730, cy: 470, r: 60, fill: C.g5 }, cam);
      // path + fence
      el("path", { d: "M1060 700 L1130 700 L1060 900 L880 900 Z", fill: C.br1 }, cam);
      const fence = el("g", null, cam);
      [[0, 860], [1150, 1600]].forEach(([x0, x1]) => {
        let d = `M${x0} 780 L${x0} 740`;
        for (let x = x0; x < x1; x += 40) d += ` Q${x + 20} ${712 + ((x / 40) % 2) * 6} ${Math.min(x + 40, x1)} 740`;
        el("path", { d: d + ` L${x1} 780 Z`, fill: C.g5 }, fence);
      });
      el("rect", { x: 0, y: 780, width: 1600, height: 120, fill: C.g4 }, cam);
      // mum at the door
      person(cam, { x: 1095, y: 700, s: 0.9, skin: SKIN[3], hairStyle: "curly", hairCol: C.n5, dress: C.b4, arms: { R: "wave", L: "down" }, flip: true });
      // dad home from work, kids and dog running to him
      const dad = person(cam, { x: 720, y: 880, s: 1.5, skin: SKIN[3], hairStyle: "short", hairCol: C.n5, top: C.n4, bottom: C.n5, coat: true, collar: C.w, arms: { L: "carry", R: "open" }, anim: "walk", mood: "open" });
      const [bx, by] = dad.hand("L");
      el("rect", { x: bx - 19, y: by - 3, width: 38, height: 26, rx: 3, fill: C.br5 }, cam);
      person(cam, { x: 860, y: 884, s: 0.95, kid: true, skin: SKIN[3], hairStyle: "bob", hairCol: C.n5, dress: C.y3, arms: { L: "up", R: "up" }, flip: true, anim: "bob", mood: "open" });
      person(cam, { x: 950, y: 888, s: 0.9, kid: true, skin: SKIN[3], hairStyle: "curly", hairCol: C.n5, top: C.o3, bottom: C.b5, arms: { L: "open", R: "open" }, flip: true, anim: "walk", mood: "open" });
      const dog = el("g", null, cam);
      const dx = 1040, dy = 884; // a small dog bounding along, facing left towards dad
      [[dx - 20, 1], [dx - 10, -1], [dx + 18, 1], [dx + 26, -1]].forEach(([lx, ph]) => {
        const lg = el("g", null, dog);
        el("path", { d: `M${lx - 3} ${dy - 22} L${lx - 2.5} ${dy - 2} L${lx + 3} ${dy - 2} L${lx + 3.5} ${dy - 22} Z`, fill: C.br4 }, lg);
        rock(lg, lx, dy - 22, -18 * ph, 18 * ph, 0.3);
      });
      el("path", { d: `M${dx - 26} ${dy - 34} C${dx - 20} ${dy - 42} ${dx + 20} ${dy - 42} ${dx + 30} ${dy - 34} C${dx + 34} ${dy - 26} ${dx + 28} ${dy - 18} ${dx + 18} ${dy - 18} L${dx - 18} ${dy - 18} C${dx - 28} ${dy - 20} ${dx - 30} ${dy - 28} ${dx - 26} ${dy - 34} Z`, fill: C.br4 }, dog);
      el("path", { d: `M${dx - 22} ${dy - 36} C${dx - 30} ${dy - 50} ${dx - 42} ${dy - 50} ${dx - 50} ${dy - 44} L${dx - 54} ${dy - 38} C${dx - 50} ${dy - 34} ${dx - 42} ${dy - 34} ${dx - 36} ${dy - 30} Z`, fill: C.br4 }, dog);
      el("path", { d: `M${dx - 34} ${dy - 50} C${dx - 30} ${dy - 58} ${dx - 24} ${dy - 56} ${dx - 26} ${dy - 44} Z`, fill: C.br5 }, dog);
      el("path", { d: `M${dx - 55} ${dy - 40} m-2 0 a2.5 2.5 0 1 0 5 0 a2.5 2.5 0 1 0 -5 0`, fill: C.n5 }, dog);
      const tail = el("path", { d: `M${dx + 28} ${dy - 34} C${dx + 40} ${dy - 40} ${dx + 44} ${dy - 50} ${dx + 42} ${dy - 58} L${dx + 38} ${dy - 56} C${dx + 38} ${dy - 48} ${dx + 34} ${dy - 42} ${dx + 26} ${dy - 38} Z`, fill: C.br4 }, dog);
      rock(tail, dx + 28, dy - 36, -12, 14, 0.18);
      gsap.to(dog, { y: -8, duration: 0.3, yoyo: true, repeat: -1, ease: "sine.out" });
      out.v2 = v; out.cam2 = cam;
    }

    out.fg = el("g", null, svg); // era closes on the landscape itself
    return out;
  }

  /* ================= ELECTRICITY ================= */
  function power(svg) {
    const C = K().C;
    const out = {};

    /* V1 — a warm home on a winter evening */
    {
      const { v, cam } = layer(svg);
      el("rect", { x: 0, y: 0, width: 1600, height: 900, fill: C.y1 }, cam);
      // window view
      const wx = 560, wy = 110, ww = 760, wh = 470;
      el("rect", { x: wx, y: wy, width: ww, height: wh, fill: grad(svg, "v-pow1-dusk", [[0, C.b5], [1, C.b4]]) }, cam);
      const view = el("g", null, cam);
      el("path", { d: `M${wx} ${wy + 330} C${wx + 200} ${wy + 270} ${wx + 460} ${wy + 320} ${wx + ww} ${wy + 280} L${wx + ww} ${wy + wh} L${wx} ${wy + wh} Z`, fill: C.b1 }, view);
      [[wx + 140, wy + 300], [wx + 330, wy + 285], [wx + 560, wy + 290]].forEach(([x, y], i) => {
        SVG.turbine(view, x, y, 150, { dur: 4 + i, blade: 70 });
      });
      // neighbour's house with solar roof, lit
      el("rect", { x: wx + 470, y: wy + 330, width: 200, height: 140, fill: C.w }, view);
      el("path", { d: `M${wx + 466} ${wy + 272} L${wx + 674} ${wy + 272} L${wx + 692} ${wy + 332} L${wx + 448} ${wy + 332} Z`, fill: C.n4 }, view);
      el("path", { d: `M${wx + 460} ${wy + 266} L${wx + 680} ${wy + 266} L${wx + 680} ${wy + 274} L${wx + 460} ${wy + 274} Z`, fill: C.n5 }, view);
      SVG.panelQuad(view, [[wx + 484, wy + 282], [wx + 568, wy + 282], [wx + 570, wy + 322], [wx + 476, wy + 322]], 5, 2);
      SVG.panelQuad(view, [[wx + 578, wy + 282], [wx + 656, wy + 282], [wx + 664, wy + 322], [wx + 580, wy + 322]], 5, 2);
      el("rect", { x: wx + 500, y: wy + 370, width: 50, height: 44, fill: C.y2 }, view);
      el("rect", { x: wx + 590, y: wy + 370, width: 50, height: 44, fill: C.y2 }, view);
      // heat pump outside
      el("rect", { x: wx + 40, y: wy + 380, width: 120, height: 90, fill: C.n1 }, view);
      el("circle", { cx: wx + 90, cy: wy + 425, r: 30, fill: C.n2 }, view);
      const fan = el("g", null, view);
      for (let b = 0; b < 3; b++) el("path", { d: `M${wx + 90} ${wy + 425} C${wx + 80} ${wy + 415} ${wx + 84} ${wy + 402} ${wx + 90} ${wy + 399} C${wx + 96} ${wy + 404} ${wx + 97} ${wy + 415} ${wx + 90} ${wy + 425} Z`, fill: C.n4, transform: `rotate(${b * 120} ${wx + 90} ${wy + 425})` }, fan);
      el("circle", { cx: wx + 90, cy: wy + 425, r: 5, fill: C.n3 }, fan);
      SVG.spinAt(fan, wx + 90, wy + 425, 1.2);
      // snow
      const snow = el("g", null, view);
      for (let i = 0; i < 60; i++) {
        const f = el("circle", { cx: wx + Math.random() * ww, cy: wy, r: 2 + Math.random() * 2.5, fill: C.w, opacity: 0.9 }, snow);
        gsap.fromTo(f, { attr: { cy: wy - 10 } }, { attr: { cy: wy + wh }, duration: 5 + Math.random() * 5, repeat: -1, ease: "none", delay: -Math.random() * 10 });
      }
      const clip = el("clipPath", { id: "v-pow1-clip" }, svg.querySelector("defs"));
      el("rect", { x: wx, y: wy, width: ww, height: wh }, clip);
      view.setAttribute("clip-path", "url(#v-pow1-clip)");
      // window frame
      el("rect", { x: wx, y: wy, width: ww, height: wh, fill: "none", stroke: C.w, "stroke-width": 18 }, cam);
      el("path", { d: `M${wx + ww / 2} ${wy} L${wx + ww / 2} ${wy + wh} M${wx} ${wy + 160} L${wx + ww} ${wy + 160}`, stroke: C.w, "stroke-width": 10 }, cam);
      el("rect", { x: wx - 30, y: wy + wh, width: ww + 60, height: 20, fill: C.w }, cam);
      // curtains
      el("path", { d: `M${wx - 90} 80 L${wx + 30} 80 C${wx + 10} 300 ${wx + 40} 500 ${wx - 10} 700 L${wx - 90} 700 Z`, fill: C.g4 }, cam);
      el("path", { d: `M${wx + ww + 90} 80 L${wx + ww - 30} 80 C${wx + ww - 10} 300 ${wx + ww - 40} 500 ${wx + ww + 10} 700 L${wx + ww + 90} 700 Z`, fill: C.g4 }, cam);
      el("rect", { x: wx - 110, y: 70, width: ww + 220, height: 12, fill: C.br4 }, cam);
      // thermostat
      el("rect", { x: 1440, y: 330, width: 64, height: 84, rx: 10, fill: C.w, stroke: C.n2, "stroke-width": 2 }, cam);
      el("text", { x: 1472, y: 380, "text-anchor": "middle", "font-family": "Poppins", "font-weight": 600, "font-size": 24, fill: C.g4, text: "21°" }, cam);
      // floor + rug
      el("rect", { x: 0, y: 700, width: 1600, height: 200, fill: C.br2 }, cam);
      for (let x = 0; x < 1600; x += 110) el("line", { x1: x, y1: 700, x2: x, y2: 900, stroke: C.br3, "stroke-width": 2 }, cam);
      el("ellipse", { cx: 1000, cy: 820, rx: 420, ry: 50, fill: C.o1 }, cam);
      // lamp
      el("rect", { x: 1510, y: 420, width: 8, height: 300, fill: C.n4 }, cam);
      el("path", { d: "M1470 420 L1558 420 L1540 360 L1488 360 Z", fill: C.y2 }, cam);
      // sofa + grandmother reading
      el("rect", { x: 1060, y: 560, width: 380, height: 110, rx: 30, fill: C.b5 }, cam);
      person(cam, { x: 1250, y: 720, s: 1.7, pose: "sit", flip: true, skin: SKIN[0], hairStyle: "bun", hairCol: C.n1, top: C.o4, bottom: C.n4, arms: { L: "table", R: "table" } });
      el("path", { d: "M1146 604 L1186 596 L1188 632 L1148 640 Z M1188 596 L1226 604 L1224 640 L1188 632 Z", fill: C.w, stroke: C.n2, "stroke-width": 2 }, cam);
      el("rect", { x: 1040, y: 640, width: 420, height: 70, rx: 20, fill: C.b5 }, cam);
      el("rect", { x: 1030, y: 590, width: 50, height: 120, rx: 20, fill: C.b4 }, cam);
      el("rect", { x: 1420, y: 590, width: 50, height: 120, rx: 20, fill: C.b4 }, cam);
      // child at the table with a tablet, cat on the rug
      el("rect", { x: 440, y: 590, width: 300, height: 14, fill: C.br4 }, cam);
      el("rect", { x: 460, y: 604, width: 12, height: 116, fill: C.br4 }, cam);
      el("rect", { x: 708, y: 604, width: 12, height: 116, fill: C.br4 }, cam);
      el("rect", { x: 540, y: 610, width: 70, height: 10, fill: C.br5 }, cam);
      el("rect", { x: 548, y: 620, width: 8, height: 100, fill: C.br5 }, cam);
      person(cam, { x: 560, y: 720, s: 1.45, kid: true, pose: "sit", skin: SKIN[3], hairStyle: "curly", hairCol: C.n5, top: C.y3, bottom: C.b5, arms: { R: "table", L: "table" } });
      el("rect", { x: 640, y: 566, width: 56, height: 24, rx: 3, fill: C.n5 }, cam);
      el("rect", { x: 644, y: 569, width: 48, height: 18, rx: 2, fill: C.b3, class: "twinkle" }, cam);
      el("rect", { x: 480, y: 560, width: 30, height: 30, rx: 4, fill: C.w }, cam); // mug
      const cat = el("g", null, cam);
      el("ellipse", { cx: 880, cy: 800, rx: 50, ry: 20, fill: C.n4 }, cat);
      el("circle", { cx: 840, cy: 790, r: 17, fill: C.n4 }, cat);
      el("path", { d: "M828 778 l2 -14 l10 10 Z M848 776 l6 -12 l4 14 Z", fill: C.n4 }, cat);
      el("path", { d: "M928 806 q30 0 30 -24", stroke: C.n4, "stroke-width": 7, fill: "none", "stroke-linecap": "round" }, cat);
      gsap.to(cat, { scaleY: 1.04, svgOrigin: "880 820", duration: 1.6, yoyo: true, repeat: -1, ease: "sine.inOut" });
      out.v1 = v; out.cam1 = cam;
    }

    /* V2 — the street: school run, rooftop solar, charging, the electric bus */
    {
      const { v, cam } = layer(svg);
      el("rect", { x: 0, y: 0, width: 1600, height: 900, fill: grad(svg, "v-pow2-sky", [[0, C.b1], [1, C.w]]) }, cam);
      // birds
      for (let i = 0; i < 5; i++) {
        const b = el("path", { d: `M${300 + i * 60} ${120 + (i % 2) * 20} q8 -8 16 0 q8 -8 16 0`, stroke: C.n3, "stroke-width": 2.5, fill: "none" }, cam);
        gsap.to(b, { x: 900, y: -40, duration: 26, repeat: -1, ease: "none", delay: -i * 2 });
      }
      // terrace houses with rooftop solar
      const fac = [C.w, C.g1, C.b1, C.y1, C.w, C.g1];
      for (let i = 0; i < 6; i++) {
        const x = i * 280 - 40;
        el("rect", { x, y: 250, width: 280, height: 400, fill: fac[i] }, cam);
        // street-facing roof plane with two rooftop solar panels
        el("path", { d: `M${x + 12} 168 L${x + 268} 168 L${x + 286} 250 L${x - 6} 250 Z`, fill: C.n4 }, cam);
        el("path", { d: `M${x + 6} 162 L${x + 274} 162 L${x + 274} 170 L${x + 6} 170 Z`, fill: C.n5 }, cam);
        SVG.panelQuad(cam, [[x + 34, 180], [x + 132, 180], [x + 134, 238], [x + 24, 238]], 6, 3);
        SVG.panelQuad(cam, [[x + 146, 180], [x + 244, 180], [x + 254, 238], [x + 144, 238]], 6, 3);
        [[x + 40, 320], [x + 160, 320], [x + 40, 470], [x + 160, 470]].forEach(([wx, wy]) => {
          el("rect", { x: wx, y: wy, width: 80, height: 100, fill: C.b2 }, cam);
          el("rect", { x: wx - 6, y: wy + 100, width: 92, height: 10, fill: C.n2 }, cam);
        });
        el("rect", { x: x + 30, y: 440, width: 120, height: 10, fill: C.n3 }, cam); // balcony
        for (let k = 0; k < 4; k++) el("circle", { cx: x + 44 + k * 30, cy: 432, r: 12, fill: k % 2 ? C.g4 : C.g5 }, cam);
      }
      el("rect", { x: 0, y: 650, width: 1600, height: 60, fill: C.n1 }, cam); // pavement
      el("rect", { x: 0, y: 710, width: 1600, height: 190, fill: C.n4 }, cam); // road
      el("rect", { x: 0, y: 706, width: 1600, height: 6, fill: C.n2 }, cam);
      // street trees
      [120, 700, 1300].forEach((x) => {
        el("rect", { x: x - 6, y: 520, width: 12, height: 140, fill: C.br4 }, cam);
        el("circle", { cx: x, cy: 500, r: 60, fill: C.g4 }, cam);
        el("circle", { cx: x + 30, cy: 530, r: 40, fill: C.g5 }, cam);
      });
      // chatting neighbours
      person(cam, { x: 400, y: 682, s: 0.74, skin: SKIN[1], hairStyle: "scarf", scarfCol: C.g5, top: C.b4, bottom: C.n5, arms: { R: "hold", L: "down" }, anim: "breathe" });
      el("rect", { x: 409, y: 632, width: 7, height: 9, rx: 1.5, fill: C.w }, cam);
      person(cam, { x: 440, y: 682, s: 0.76, flip: true, skin: SKIN[3], hairStyle: "short", hairCol: C.n2, top: C.o2, bottom: C.b5, arms: { R: "open", L: "down" }, anim: "breathe" });
      // EV charging at the kerb
      const ev = el("g", null, cam);
      el("rect", { x: 1020, y: 590, width: 30, height: 90, rx: 6, fill: C.g4 }, ev);
      el("rect", { x: 1026, y: 600, width: 18, height: 20, rx: 3, fill: C.w }, ev);
      icon("bolt", 1035, 610, 14, C.g4, ev);
      const cable = el("path", { d: "M1050 640 C1080 670 1110 664 1142 648", stroke: C.n5, "stroke-width": 5, fill: "none", "stroke-linecap": "round" }, ev);
      el("path", { d: "M1100 712 L1480 712 L1480 726 L1100 726 Z", fill: C.n2 }, ev); // charging bay kerb
      const evCar = el("g", { transform: "translate(0 -46)" }, ev); // parked in a charging bay at the kerb, clear of the traffic lane
      el("path", { d: "M1120 740 L1130 690 C1140 668 1170 660 1200 660 L1320 660 C1350 660 1370 672 1390 700 L1440 712 C1456 716 1460 730 1458 744 L1120 744 Z", fill: C.b3 }, evCar);
      el("path", { d: "M1180 700 L1196 672 L1270 672 L1270 700 Z M1284 700 L1284 672 L1340 672 L1370 700 Z", fill: C.b1 }, evCar);
      spinWheel(evCar, 1190, 746, 24, C.n5, C.n2, 99); spinWheel(evCar, 1390, 746, 24, C.n5, C.n2, 99);
      el("path", { d: "M1136 688 L1146 686 L1148 700 L1138 702 Z", fill: C.n5 }, evCar); // charging port
      [0, 0.5].forEach((d) => {
        const pulse = el("circle", { cx: 0, cy: 0, r: 4, fill: C.g3 }, ev);
        gsap.to(pulse, { motionPath: { path: cable, align: cable, alignOrigin: [0.5, 0.5] }, duration: 1.4, repeat: -1, ease: "none", delay: -d * 1.4 });
      });
      person(cam, { x: 985, y: 684, s: 0.76, skin: SKIN[2], hairStyle: "long", hairCol: C.br5, top: C.w, bottom: C.b5, arms: { R: "forward" } });
      // the electric bus in the far lane; the cycle lane and riders pass in front of it
      const bus = el("g", null, cam);
      el("rect", { x: 0, y: -160, width: 520, height: 150, rx: 18, fill: C.g4 }, bus);
      el("rect", { x: 0, y: -60, width: 520, height: 14, fill: C.g5 }, bus);
      for (let i = 0; i < 6; i++) {
        el("rect", { x: 24 + i * 80, y: -140, width: 64, height: 60, rx: 6, fill: C.b1 }, bus);
        if (i % 2 === 0 || i === 3) el("circle", { cx: 56 + i * 80, cy: -104, r: 12, fill: C.br3 }, bus);
      }
      icon("bolt", 480, -24, 22, C.w, bus);
      spinWheel(bus, 100, -6, 30, C.n5, C.n2, 0.5); spinWheel(bus, 420, -6, 30, C.n5, C.n2, 0.5);
      const busIn = el("g", { transform: "translate(0 -20) scale(1.2)" }, bus); [...bus.childNodes].forEach((c) => { if (c !== busIn) busIn.appendChild(c); });
      gsap.fromTo(bus, { x: 1700, y: 792 }, { x: -900, y: 792, duration: 18, repeat: -1, ease: "none" });
      // painted cycle lane along the kerb
      el("path", { d: "M0 806 L1600 806 L1600 852 L0 852 Z", fill: C.g4 }, cam);
      el("path", { d: "M0 806 L1600 806", stroke: C.w, "stroke-width": 3, fill: "none" }, cam);
      el("path", { d: "M0 852 L1600 852", stroke: C.w, "stroke-width": 3, "stroke-dasharray": "26 18", fill: "none" }, cam);
      // kids cycling to school
      const riders = el("g", null, cam);
      bike(riders, 300, 846, 1.0, C.o3, { skin: SKIN[3], hairStyle: "curly", hairCol: C.n5, top: C.y3, bottom: C.b5, kid: true });
      bike(riders, 470, 848, 1.05, C.b5, { skin: SKIN[0], hairStyle: "long", hairCol: C.y4, top: C.o2, bottom: C.n5, kid: true });
      gsap.fromTo(riders, { x: -700 }, { x: 1800, duration: 14, repeat: -1, ease: "none" });
      out.v2 = v; out.cam2 = cam;
    }

    out.fg = el("g", null, svg); // era closes on the landscape itself
    return out;
  }

  /* ================= TODAY: people in the queue ================= */
  function gap(svg) {
    const C = K().C;
    const q = el("g", null, svg);
    const who = [
      { top: C.b4, bottom: C.n5, hairStyle: "bun", hairCol: C.br5, skin: SKIN[0], prop: "heat" },
      { top: C.o2, bottom: C.n4, hairStyle: "cap", hairCol: C.n5, skin: SKIN[2], prop: "solar" },
      { top: C.w, bottom: C.n4, hairStyle: "short", hairCol: C.n5, skin: SKIN[3], apron: C.br1, prop: "none" },
      { top: C.g5, bottom: C.n5, hairStyle: "scarf", scarfCol: C.b5, skin: SKIN[1], prop: "car" },
      { top: C.n3, bottom: C.n5, hairStyle: "short", hairCol: C.n2, skin: SKIN[1], prop: "none", kidWith: true }
    ];
    const people = [];
    who.forEach((w, i) => {
      const x = 930 - i * 140;
      const g = el("g", null, q);
      const p = person(g, Object.assign({ x, y: 860, s: 1.35, arms: { R: w.prop === "solar" ? "hold" : "down", L: "down" }, anim: "breathe" }, w));
      if (w.prop === "heat") { el("rect", { x: x + 28, y: 790, width: 64, height: 70, fill: C.n1, stroke: C.n3, "stroke-width": 2 }, g); el("circle", { cx: x + 60, cy: 825, r: 20, fill: C.n2 }, g); }
      if (w.prop === "solar") el("path", { d: `M${x + 22} 700 L${x + 76} 700 L${x + 76} 830 L${x + 22} 830 Z`, fill: C.b5, stroke: C.b3, "stroke-width": 2 }, g);
      if (w.prop === "car") icon("car-bolt", x + 62, 830, 50, C.n4, g);
      if (w.kidWith) person(g, { x: x - 46, y: 862, s: 1.1, kid: true, skin: SKIN[1], hairStyle: "curly", hairCol: C.n5, top: C.y3, bottom: C.b5 });
      people.push(g);
    });
    return { queue: q, people };
  }

  window.VIGNETTES = { rail, road, power, gap };
})();
