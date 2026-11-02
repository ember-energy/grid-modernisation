/* New scenes for the analysts' narrative (GridMod3).
   Each returns a paused GSAP timeline, one beat per text step, like the era scenes. */
(function () {
  const { el, icon } = SVG;
  const { C, sky, tree, pine, house, puffs, drawOn, beat } = KIT;
  const P = PEOPLE, S = PEOPLE.SKIN;
  const hold = (tl, n) => tl.to({}, { duration: 0.001 }, n + 0.1);
  const label = (g, x, y, t, o) => el("text", Object.assign({ x, y, "text-anchor": "middle", "font-family": "Poppins", "font-weight": 600, "font-size": 15, "letter-spacing": 2, fill: C.n4, text: t }, o || {}), g);
  const pulseAlong = (g, path, n, col, dur, r) => {
    const dots = [];
    for (let k = 0; k < n; k++) {
      const d = el("circle", { r: r || 4, fill: col }, g);
      gsap.to(d, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5] }, duration: dur, repeat: -1, ease: "none", delay: -k * (dur / n) });
      dots.push(d);
    }
    return dots;
  };
  function pylon(g, x, base, h, col) {
    const k = h / 260, st = { stroke: col || C.n4, "stroke-width": Math.max(1.4, 4 * k), fill: "none", "stroke-linejoin": "round" };
    const t = el("g", null, g);
    el("path", { d: `M${x - 34 * k} ${base} L${x - 8 * k} ${base - h} L${x + 8 * k} ${base - h} L${x + 34 * k} ${base}`, ...st }, t);
    el("path", { d: `M${x - 30 * k} ${base - 40 * k} L${x + 26 * k} ${base - 110 * k} M${x + 30 * k} ${base - 40 * k} L${x - 26 * k} ${base - 110 * k} M${x - 22 * k} ${base - 120 * k} L${x + 17 * k} ${base - 190 * k} M${x + 22 * k} ${base - 120 * k} L${x - 17 * k} ${base - 190 * k}`, ...st, "stroke-width": Math.max(1, 2.5 * k) }, t);
    el("path", { d: `M${x - 58 * k} ${base - h + 30 * k} L${x + 58 * k} ${base - h + 30 * k} M${x - 44 * k} ${base - h + 80 * k} L${x + 44 * k} ${base - h + 80 * k}`, ...st }, t);
    return { g: t, arm: (side, lower) => [x + side * (lower ? 44 : 58) * k, base - h + (lower ? 80 : 30) * k] };
  }
  function token(g, x, y, name, ring, r) {
    const t = el("g", null, g);
    el("circle", { cx: x, cy: y, r: r || 24, fill: C.w, stroke: ring, "stroke-width": 3.5 }, t);
    icon(name, x, y, (r || 24) * 1.05, C.n5, t);
    return t;
  }

  /* ============ 1. DARING TO BUILD — six tall strips, six ages ============ */
  // the six ages, drawn as tall strips, plus a full-width 'now' scene that can wipe in (shared by C and G)
  function buildAges(svg, pf, nowTitle, nowSub, oneScene) {
    el("rect", { x: 0, y: 0, width: 1600, height: 900, fill: C.w }, svg);
    const defs = svg.querySelector("defs") || el("defs", null, svg);
    const X0 = 80, W = 240, TOP = 64;
    const strips = [];
    const ages = [
      { name: "CANALS", date: "1760s", sky: [C.y1, C.br1] },
      { name: "RAILWAYS", date: "1830s", sky: [C.br1, C.y1] },
      { name: "TELEPHONE LINES", date: "1880s", sky: [C.b1, C.br1] },
      { name: "HIGHWAYS", date: "1950s", sky: [C.b2, C.w] },
      { name: "THE INTERNET", date: "1990s", sky: [C.n1, C.b1] },
      { name: "ELECTRICITY GRIDS", date: "NOW", sky: [C.b1, C.g1] }
    ];
    ages.forEach((a, i) => {
      const x0 = X0 + i * W, cx = x0 + W / 2;
      const cp = el("clipPath", { id: `${pf}strip-${i}` }, defs); el("rect", { x: x0, y: 0, width: W, height: 900 }, cp);
      const outer = el("g", null, svg);
      const g = el("g", { "clip-path": `url(#${pf}strip-${i})` }, outer);
      const lg = el("linearGradient", { id: `${pf}strip-sky-${i}`, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
      el("stop", { offset: "0", "stop-color": a.sky[0] }, lg); el("stop", { offset: "1", "stop-color": a.sky[1] }, lg);
      const sky = el("rect", { x: x0, y: 0, width: W, height: 900, fill: `url(#${pf}strip-sky-${i})` }, g);
      strips.push({ outer, g, x0, cx, a, sky });
    });
    const person = (g, o) => P.person(g, Object.assign({ s: 0.4 }, o));

    // 1 — CANALS: a water mill, a narrowboat towed by a horse along the towpath
    (() => { const { g, x0, cx } = strips[0];
      el("path", { d: `M${x0} 470 Q${x0 + 80} 420 ${x0 + 150} 450 T${x0 + 240} 440 L${x0 + 240} 900 L${x0} 900 Z`, fill: C.g2 }, g);
      pine(g, x0 + 190, 470, 0.8, C.g5); tree(g, x0 + 30, 480, 0.9, C.g4);
      // a village church on the hill, clouds and birds fill the sky
      el("rect", { x: x0 + 150, y: 380, width: 60, height: 80, fill: C.br1 }, g);
      el("rect", { x: x0 + 190, y: 250, width: 22, height: 130, fill: C.br1 }, g);
      el("path", { d: `M${x0 + 188} 250 L${x0 + 201} 170 L${x0 + 214} 250 Z`, fill: C.br3 }, g);
      el("path", { d: `M${x0 + 146} 380 L${x0 + 180} 350 L${x0 + 214} 380 Z`, fill: C.br3 }, g);
      el("path", { d: `M${x0 + 20} 220 Q${x0 + 40} 196 ${x0 + 70} 206 Q${x0 + 96} 190 ${x0 + 116} 214 Q${x0 + 132} 216 ${x0 + 128} 226 L${x0 + 20} 226 Z`, fill: C.w }, g);
      for (let k = 0; k < 3; k++) el("path", { d: `M${x0 + 40 + k * 22} ${300 + (k % 2) * 10} q6 -6 12 0 q6 -6 12 0`, stroke: C.n3, "stroke-width": 1.6, fill: "none" }, g);
      el("rect", { x: x0 + 20, y: 470, width: 90, height: 110, fill: C.br2 }, g);
      el("path", { d: `M${x0 + 12} 470 L${x0 + 65} 430 L${x0 + 118} 470 Z`, fill: C.br4 }, g);
      [[x0 + 36, 500], [x0 + 76, 500], [x0 + 36, 540]].forEach(([x, y]) => el("rect", { x, y, width: 16, height: 20, fill: C.y2 }, g));
      const wh = el("g", null, g);
      el("circle", { cx: x0 + 120, cy: 572, r: 30, fill: C.br3 }, wh); el("circle", { cx: x0 + 120, cy: 572, r: 20, fill: C.br1 }, wh);
      for (let k = 0; k < 8; k++) el("rect", { x: x0 + 117.5, y: 540, width: 5, height: 64, fill: C.br4, transform: `rotate(${k * 22.5} ${x0 + 120} 572)` }, wh);
      SVG.spinAt(wh, x0 + 120, 572, 8);
      el("path", { d: `M${x0} 620 L${x0 + 240} 620 L${x0 + 240} 650 L${x0} 650 Z`, fill: C.br2 }, g); // towpath
      el("path", { d: `M${x0} 650 L${x0 + 240} 650 L${x0 + 240} 720 L${x0} 720 Z`, fill: C.b2 }, g);  // canal
      el("path", { d: `M${x0} 720 L${x0 + 240} 720 L${x0 + 240} 900 L${x0} 900 Z`, fill: C.g1 }, g);
      const tow = el("g", null, g);
      // the narrowboat on the water
      el("path", { d: `M${cx - 76} 678 L${cx + 22} 678 Q${cx + 36} 680 ${cx + 40} 690 L${cx - 72} 690 Z`, fill: C.g4 }, tow);
      el("path", { d: `M${cx - 64} 666 L${cx + 4} 666 L${cx + 4} 678 L${cx - 64} 678 Z`, fill: C.o4 }, tow);
      [cx - 56, cx - 40, cx - 24, cx - 8].forEach((x) => el("rect", { x, y: 669, width: 8, height: 6, fill: C.y1 }, tow));
      el("rect", { x: cx + 14, y: 664, width: 3, height: 14, fill: C.br5 }, tow);   // towing post
      // the horse on the towpath, walking right, hooves on the path
      const hx = cx + 92, hb = 642, hk = 0.62;
      const horse = el("g", { transform: `translate(${hx} ${hb}) scale(${hk})` }, tow);
      el("path", { d: "M-34 -48 C-34 -58 -20 -62 0 -62 L14 -62 L30 -86 L42 -84 L46 -74 L38 -70 L26 -52 C24 -44 18 -40 10 -40 L-24 -40 C-30 -40 -34 -44 -34 -48 Z", fill: C.br4 }, horse);
      el("path", { d: "M-34 -56 C-42 -52 -44 -42 -40 -34", stroke: C.n5, "stroke-width": 3, fill: "none" }, horse);
      [-28, -20, 6, 14].forEach((lx) => el("rect", { x: lx, y: -42, width: 5, height: 42, fill: C.br4 }, horse));
      el("path", { d: "M8 -62 L12 -42", stroke: C.n5, "stroke-width": 3 }, horse);   // collar
      // the tow rope: from the boat's post to the horse's collar
      el("path", { d: `M${cx + 15} 666 Q${(cx + 15 + hx + 6) / 2} ${hb - 18} ${hx + 6} ${hb - 34}`, stroke: C.br5, "stroke-width": 1.4, fill: "none" }, tow);
      gsap.fromTo(tow, { x: -36 }, { x: 14, duration: 10, repeat: -1, yoyo: true, ease: "sine.inOut" });   // the horse keeps clear of the mill wheel
      person(g, { x: cx + 60, y: 800, hairStyle: "bun", hairCol: C.br5, dress: C.b4, dressLen: "long", hat: "bonnet", hatCol: C.y4, arms: { R: "hold" } });
      person(g, { x: cx - 50, y: 804, hairStyle: "short", hat: "cap", hatCol: C.br5, top: C.br4, bottom: C.n4, arms: { L: "carry" }, anim: "walk" });
    })();

    // 2 — RAILWAYS: mills and chimneys, a viaduct and steam train, a busy platform
    (() => { const { g, x0, cx } = strips[1];
      [x0 + 60, x0 + 200].forEach((x, k) => { el("rect", { x, y: 260 + k * 30, width: 16, height: 220, fill: C.br4 }, g); el("rect", { x: x - 2, y: 256 + k * 30, width: 20, height: 6, fill: C.br5 }, g); puffs(g, x + 8, 250 + k * 30, 4, C.n1, 1.2); });   // chimneys rise from behind the mills
      [[x0 + 10, 90, 150], [x0 + 110, 120, 130]].forEach(([x, w, h]) => {
        el("rect", { x, y: 520 - h, width: w, height: h, fill: C.br3 }, g);
        let d = `M${x} ${520 - h}`; for (let k = 0; k < 3; k++) d += ` L${x + k * w / 3} ${500 - h} L${x + (k + 1) * w / 3} ${520 - h}`; el("path", { d: d + " Z", fill: C.br4 }, g);
        for (let r = 0; r < Math.floor(h / 36); r++) for (let c = 0; c < Math.floor(w / 26); c++) el("rect", { x: x + 8 + c * 26, y: 540 - h + r * 36, width: 12, height: 16, fill: C.y2 }, g);
      });
      el("path", { d: `M${x0} 520 L${x0 + 240} 520 L${x0 + 240} 900 L${x0} 900 Z`, fill: C.g2 }, g);
      el("path", { d: `M${x0} 560 L${x0 + 240} 560 L${x0 + 240} 576 L${x0} 576 Z`, fill: C.br4 }, g);
      for (let x = x0; x < x0 + 240; x += 60) el("path", { d: `M${x} 576 L${x + 60} 576 L${x + 60} 660 L${x + 54} 660 L${x + 54} 610 A24 24 0 0 0 ${x + 6} 610 L${x + 6} 660 L${x} 660 Z`, fill: C.br4 }, g);
      const tr = el("g", null, g);
      const wheel = (x, r) => { el("circle", { cx: x, cy: -r, r, fill: C.n5 }, tr); el("circle", { cx: x, cy: -r, r: r * 0.45, fill: C.br3 }, tr); };
      // carriages, then the tender, then the engine facing right
      for (let k = 1; k <= 3; k++) {
        const c0 = -34 - k * 62;
        el("path", { d: `M${c0} -14 L${c0} -36 Q${c0} -42 ${c0 + 6} -42 L${c0 + 52} -42 Q${c0 + 58} -42 ${c0 + 58} -36 L${c0 + 58} -14 Z`, fill: C.br4 }, tr);
        el("path", { d: `M${c0 - 1} -42 Q${c0 + 29} -50 ${c0 + 59} -42 Z`, fill: C.n4 }, tr);
        for (let w = 0; w < 4; w++) el("rect", { x: c0 + 5 + w * 13, y: -36, width: 9, height: 9, rx: 1.5, fill: C.y1 }, tr);
        el("rect", { x: c0, y: -20, width: 58, height: 3, fill: C.y4 }, tr);
        wheel(c0 + 11, 6); wheel(c0 + 47, 6);
      }
      el("path", { d: "M-32 -14 L-32 -30 L-4 -30 L-4 -14 Z", fill: C.g5 }, tr); el("path", { d: "M-30 -30 Q-18 -38 -6 -30 Z", fill: C.n5 }, tr); wheel(-24, 6); wheel(-12, 6);
      el("rect", { x: -2, y: -18, width: 84, height: 5, fill: C.n5 }, tr);                    // frame
      el("path", { d: "M22 -18 L22 -34 Q22 -38 26 -38 L70 -38 L70 -18 Z", fill: C.g5 }, tr);  // boiler
      el("rect", { x: 66, y: -40, width: 10, height: 22, rx: 2, fill: C.n5 }, tr);           // smokebox
      el("path", { d: "M66 -40 L66 -52 L64 -54 L74 -54 L72 -52 L72 -40 Z", fill: C.n5 }, tr); // chimney
      el("path", { d: "M42 -38 Q46 -46 50 -38 Z", fill: C.y4 }, tr);                          // dome
      el("path", { d: "M0 -18 L0 -46 L-2 -46 L-2 -50 L26 -50 L26 -46 L24 -46 L24 -18 Z", fill: C.g5 }, tr); // cab
      el("rect", { x: 6, y: -44, width: 12, height: 10, rx: 1.5, fill: C.y1 }, tr);
      el("rect", { x: 22, y: -26, width: 48, height: 2.5, fill: C.y4 }, tr);
      el("path", { d: "M80 -18 L88 -4 L80 -4 Z", fill: C.n4 }, tr);                           // cowcatcher
      wheel(14, 7); [34, 54].forEach((x) => wheel(x, 9)); wheel(72, 6);
      el("path", { d: "M34 -9 L54 -9", stroke: C.br3, "stroke-width": 2.5 }, tr);             // coupling rod
      puffs(tr, 70, -62, 4, C.w, 0.8);
      gsap.fromTo(tr, { x: x0 - 80, y: 558 }, { x: x0 + 420, y: 558, duration: 7, repeat: -1, ease: "none" });
      el("path", { d: `M${x0} 760 L${x0 + 240} 760 L${x0 + 240} 780 L${x0} 780 Z`, fill: C.br2 }, g);
      el("rect", { x: x0 + 200, y: 640, width: 5, height: 120, fill: C.n4 }, g); el("rect", { x: x0 + 192, y: 630, width: 20, height: 14, fill: C.y2 }, g);
      person(g, { x: cx - 50, y: 760, hairStyle: "short", hat: "hat", hatCol: C.n5, top: C.br5, bottom: C.n4, coat: true, arms: { L: "carry" } });
      person(g, { x: cx, y: 760, hairStyle: "bun", hairCol: C.br5, dress: C.o4, dressLen: "long", hat: "bonnet", hatCol: C.y4, arms: { R: "wave" } });
      person(g, { x: cx + 50, y: 762, s: 0.28, kid: true, hairStyle: "cap", top: C.b4, bottom: C.n4, arms: { R: "up" }, anim: "bob" });
    })();

    // 3 — TELEPHONE LINES: a city street under a web of wires, a penny-farthing rolls by
    (() => { const { g, x0, cx } = strips[2];
      [[x0, 170, C.br3], [x0 + 80, 220, C.br2], [x0 + 160, 190, C.br3]].forEach(([x, h, col]) => {
        el("rect", { x, y: 640 - h * 1.6, width: 80, height: h * 1.6, fill: col }, g);
        for (let r = 0; r < Math.floor(h * 1.6 / 50); r++) [x + 14, x + 46].forEach((wx) => el("rect", { x: wx, y: 660 - h * 1.6 + r * 50, width: 18, height: 28, fill: C.y1 }, g));
      });
      const pole = el("g", null, g);
      el("rect", { x: cx - 5, y: 250, width: 10, height: 460, fill: C.br4 }, pole);
      for (let k = 0; k < 6; k++) el("rect", { x: cx - 50, y: 262 + k * 22, width: 100, height: 5, fill: C.br4 }, pole);
      for (let k = 0; k < 6; k++) for (let j = -2; j <= 2; j++) {
        const y = 262 + k * 22, x = cx + j * 22;
        el("path", { d: `M${x} ${y} Q${x - 80 - j * 20} ${y + 40} ${x0 - 20} ${y + 10 + k * 8}`, stroke: C.n4, "stroke-width": 0.9, fill: "none" }, pole);
        el("path", { d: `M${x} ${y} Q${x + 80 + j * 20} ${y + 40} ${x0 + 260} ${y + 20 + k * 6}`, stroke: C.n4, "stroke-width": 0.9, fill: "none" }, pole);
      }
      el("path", { d: `M${x0} 640 L${x0 + 240} 640 L${x0 + 240} 720 L${x0} 720 Z`, fill: C.n1 }, g);
      el("path", { d: `M${x0} 720 L${x0 + 240} 720 L${x0 + 240} 900 L${x0} 900 Z`, fill: C.br1 }, g);
      el("rect", { x: x0 + 30, y: 560, width: 5, height: 100, fill: C.n4 }, g); el("rect", { x: x0 + 22, y: 550, width: 21, height: 16, fill: C.y2 }, g);
      const pf = el("g", null, g);
      const wheelBig = (x, y, r) => { el("circle", { cx: x, cy: y, r, fill: "none", stroke: C.n5, "stroke-width": 3 }, pf); const sp = el("g", null, pf); for (let k = 0; k < 6; k++) el("path", { d: `M${x} ${y - r} L${x} ${y + r}`, stroke: C.n4, "stroke-width": 1, transform: `rotate(${k * 30} ${x} ${y})` }, sp); SVG.spinAt(sp, x, y, 1.2); };
      wheelBig(0, -40, 40); wheelBig(-46, -10, 10);
      el("path", { d: "M-46 -10 C-40 -50 -20 -80 0 -80 L0 -40", stroke: C.n5, "stroke-width": 3, fill: "none" }, pf);
      P.person(pf, { x: -6, y: -74, s: 0.34, pose: "sit", hairStyle: "short", hat: "hat", hatCol: C.n5, top: C.b5, bottom: C.n4, arms: { R: "wheel", L: "wheel" } });
      gsap.fromTo(pf, { x: x0 - 60, y: 820 }, { x: x0 + 320, y: 820, duration: 9, repeat: -1, ease: "none" });
      person(g, { x: cx + 70, y: 712, hairStyle: "bun", hairCol: C.br5, dress: C.g4, dressLen: "long", arms: { R: "hold" } });
    })();

    // 4 — HIGHWAYS: a road running to the horizon, cars, a new suburb
    (() => { const { g, x0, cx } = strips[3];
      el("path", { d: `M${x0} 440 L${x0 + 60} 380 L${x0 + 130} 430 L${x0 + 200} 370 L${x0 + 240} 400 L${x0 + 240} 460 L${x0} 460 Z`, fill: C.b1 }, g);
      el("path", { d: `M${x0} 450 L${x0 + 240} 450 L${x0 + 240} 900 L${x0} 900 Z`, fill: C.g2 }, g);
      const road = `M${cx - 6} 450 L${cx + 6} 450 L${x0 + 250} 900 L${x0 - 10} 900 Z`;
      el("path", { d: road, fill: C.n4 }, g);
      el("path", { d: `M${cx} 452 L${cx + 10} 900`, stroke: C.y3, "stroke-width": 3, "stroke-dasharray": "18 16", fill: "none" }, g);
      [[x0 + 18, 560, 60, C.w], [x0 + 176, 540, 52, C.y1]].forEach(([x, y, w, col]) => house(g, x, y, w, w * 0.6, col, C.o5, C.b4));
      [[x0 + 12, 620], [x0 + 226, 600]].forEach(([x, y]) => tree(g, x, y, 0.8, C.g4));
      // the jet age overhead, a roadside billboard
      el("path", { d: `M${x0 + 20} 210 Q${x0 + 44} 188 ${x0 + 74} 200 Q${x0 + 100} 186 ${x0 + 120} 208 L${x0 + 20} 212 Z`, fill: C.w }, g);
      const jet = el("g", null, g);
      el("path", { d: "M-30 0 L24 -4 Q34 -2 34 0 Q34 2 24 4 Z M-4 -2 L-14 -18 L-6 -18 L8 -2 Z M-4 2 L-14 18 L-6 18 L8 2 Z M-28 -1 L-34 -10 L-28 -10 L-22 -1 Z", fill: C.n2 }, jet);
      gsap.fromTo(jet, { x: x0 - 60, y: 260 }, { x: x0 + 320, y: 230, duration: 10, repeat: -1, ease: "none" });
      el("rect", { x: x0 + 160, y: 380, width: 5, height: 70, fill: C.n4 }, g); el("rect", { x: x0 + 200, y: 380, width: 5, height: 70, fill: C.n4 }, g);
      el("rect", { x: x0 + 140, y: 320, width: 86, height: 60, fill: C.w }, g);
      el("circle", { cx: x0 + 166, cy: 350, r: 14, fill: C.y3 }, g); el("path", { d: `M${x0 + 186} 344 L${x0 + 216} 344 M${x0 + 186} 356 L${x0 + 210} 356`, stroke: C.o3, "stroke-width": 4 }, g);
      const lanes = [[-1, C.o3, 0], [1, C.b3, 0.5], [-1, C.y3, 0.5], [1, C.g4, 0]];
      lanes.forEach(([dir, col, off]) => {
        const car = el("g", null, g);
        el("rect", { x: -22, y: -14, width: 44, height: 18, rx: 5, fill: col }, car); el("path", { d: "M-14 -14 L-10 -26 L10 -26 L14 -14 Z", fill: C.b1 }, car);
        el("rect", { x: -20, y: 2, width: 10, height: 6, fill: C.n5 }, car); el("rect", { x: 10, y: 2, width: 10, height: 6, fill: C.n5 }, car);
        const o = { t: off };
        gsap.to(o, { t: off + 1, duration: 5, repeat: -1, ease: "none", onUpdate: () => {
          const u = (dir > 0 ? o.t : 1 - (o.t % 1)) % 1, y = 460 + 440 * u * u, sc = 0.15 + 1.1 * u * u;
          const lane = dir > 0 ? 0.28 : -0.28, x = cx + lane * (y - 450) * 0.55;
          car.setAttribute("transform", `translate(${x} ${y}) scale(${sc})`);
        } });
      });
    })();

    // 5 — THE INTERNET: an office tower with a dish, a desktop computer, fibre in the ground
    (() => { const { g, x0, cx } = strips[4];
      el("rect", { x: x0 + 40, y: 230, width: 150, height: 430, fill: C.n2 }, g);
      for (let r = 0; r < 9; r++) for (let c = 0; c < 4; c++) el("rect", { x: x0 + 52 + c * 34, y: 250 + r * 44, width: 24, height: 26, fill: (r + c) % 3 ? C.b2 : C.b3, class: (r + c) % 4 ? null : "twinkle" }, g);
      el("path", { d: `M${x0 + 150} 230 L${x0 + 150} 200`, stroke: C.n4, "stroke-width": 3 }, g);
      el("path", { d: `M${x0 + 124} 186 Q${x0 + 150} 222 ${x0 + 176} 196 Z`, fill: C.w }, g);
      el("path", { d: `M${x0} 660 L${x0 + 240} 660 L${x0 + 240} 900 L${x0} 900 Z`, fill: C.n1 }, g);
      el("path", { d: `M${x0} 760 L${x0 + 240} 760 L${x0 + 240} 900 L${x0} 900 Z`, fill: C.br2 }, g);
      const fib = el("path", { d: `M${x0 - 10} 830 L${x0 + 250} 830`, stroke: C.n5, "stroke-width": 7, fill: "none" }, g);
      pulseAlong(g, fib, 5, C.b3, 1.5, 3);
      // desk and CRT monitor with a person
      el("rect", { x: cx - 16, y: 728, width: 66, height: 4, fill: C.br4 }, g); [cx - 13, cx + 44].forEach((x) => el("rect", { x, y: 732, width: 3, height: 28, fill: C.br4 }, g));
      el("rect", { x: cx + 6, y: 706, width: 26, height: 20, rx: 2, fill: C.n1 }, g); el("rect", { x: cx + 9, y: 709, width: 20, height: 14, fill: C.b3, class: "twinkle" }, g);
      el("path", { d: `M${cx + 14} 726 L${cx + 24} 726 L${cx + 26} 728 L${cx + 12} 728 Z`, fill: C.n2 }, g);
      el("rect", { x: cx - 6, y: 726, width: 14, height: 2, fill: C.n3 }, g);   // keyboard
      person(g, { x: cx - 24, y: 760, s: 0.42, pose: "sit", hairStyle: "curly", hairCol: C.n5, top: C.o2, bottom: C.b5, arms: { R: "table", L: "table" }, type: true });
    })();

    // 6 — ELECTRICITY GRIDS (now): wind, rooftop solar, EVs charging, heat pumps, a data centre
    const now = strips[5], nowItems = [];
    now.bg = [now.sky];
    (() => { const { g, x0, cx } = now;
      now.bg.push(el("path", { d: `M${x0} 470 Q${x0 + 90} 430 ${x0 + 240} 450 L${x0 + 240} 900 L${x0} 900 Z`, fill: C.g2 }, g));
      [[x0 + 92, 460, 170], [x0 + 172, 452, 200]].forEach(([x, b, h], k) => nowItems.push(SVG.turbine(g, x, b, h, { dur: 4 + k })));
      const pyl = pylon(g, x0 + 215, 520, 90, C.n4); nowItems.push(pyl.g); now.bg.push(pyl.g);
      const apt = el("g", null, g);
      el("rect", { x: x0 + 20, y: 520, width: 130, height: 170, fill: C.w }, apt);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) el("rect", { x: x0 + 32 + c * 40, y: 536 + r * 46, width: 26, height: 28, fill: C.y2 }, apt);
      SVG.panelQuad(apt, [[x0 + 24, 500], [x0 + 146, 500], [x0 + 150, 516], [x0 + 20, 516]], 8, 2);
      el("rect", { x: x0 + 150, y: 650, width: 26, height: 26, fill: C.n1 }, apt);
      const fan = el("g", null, apt); for (let k = 0; k < 3; k++) el("path", { d: `M${x0 + 163} 663 l-2 -8 l4 0 Z`, fill: C.n4, transform: `rotate(${k * 120} ${x0 + 163} 663)` }, fan); SVG.spinAt(fan, x0 + 163, 663, 1);
      nowItems.push(apt);
      const dc = el("g", null, g);
      el("rect", { x: x0 + 160, y: 620, width: 80, height: 60, fill: C.n4 }, dc);
      for (let k = 0; k < 8; k++) el("rect", { x: x0 + 168 + (k % 4) * 18, y: 632 + Math.floor(k / 4) * 20, width: 8, height: 8, fill: C.g3, class: "twinkle", style: `animation-delay:${-k * 0.3}s` }, dc);
      nowItems.push(dc);
      now.bg.push(el("path", { d: `M${x0} 680 L${x0 + 240} 680 L${x0 + 240} 900 L${x0} 900 Z`, fill: C.n1 }, g));
      const ev = el("g", null, g);
      el("rect", { x: x0 + 196, y: 690, width: 12, height: 50, rx: 3, fill: C.g4 }, ev);
      el("path", { d: `M${x0 + 90} 740 C${x0 + 92} 720 ${x0 + 104} 716 ${x0 + 120} 714 L${x0 + 132} 698 L${x0 + 170} 698 L${x0 + 184} 714 C${x0 + 196} 716 ${x0 + 198} 726 ${x0 + 196} 740 Z`, fill: C.b3 }, ev);
      el("circle", { cx: x0 + 116, cy: 742, r: 10, fill: C.n5 }, ev); el("circle", { cx: x0 + 172, cy: 742, r: 10, fill: C.n5 }, ev);
      el("path", { d: `M${x0 + 196} 712 C${x0 + 190} 722 ${x0 + 188} 720 ${x0 + 186} 720`, stroke: C.n5, "stroke-width": 2, fill: "none" }, ev);
      nowItems.push(ev);
      const rider = el("g", null, g);
      [[-16, -14], [18, -14]].forEach(([dx, dy]) => el("circle", { cx: dx, cy: dy, r: 12, fill: "none", stroke: C.n5, "stroke-width": 3 }, rider));
      el("path", { d: "M-16 -14 L0 -14 L12 -30 L-8 -30 Z M0 -14 L-6 -36 M12 -30 L18 -14", stroke: C.o3, "stroke-width": 3, fill: "none" }, rider);
      P.person(rider, { x: -12, y: -12, s: 0.3, pose: "sit", hairStyle: "bun", hairCol: C.n5, top: C.g3, bottom: C.n5, arms: { L: "wheel", R: "wheel" } });
      gsap.fromTo(rider, { x: x0 - 40, y: 800 }, { x: x0 + 290, y: 800, duration: 6, repeat: -1, ease: "none" });
      nowItems.push(rider);
      person(g, { x: x0 + 40, y: 756, hairStyle: "long", hairCol: C.n5, top: C.y3, bottom: C.b5, arms: { R: "hold" } });
    })();

    // labels at the top of each strip, and fine dividers
    strips.forEach((s, i) => { const { outer, x0, cx, a } = s;
      const lab = s.lab = el("g", null, outer);
      el("rect", { x: cx - 100, y: TOP + 22, width: 200, height: 52, rx: 4, fill: C.w }, lab);
      label(lab, cx, TOP + 44, a.name, { "font-size": 13, fill: i === 5 ? C.g5 : C.n4 });
      label(lab, cx, TOP + 64, a.date, { "font-size": 12, "font-weight": 500, fill: C.n3, "letter-spacing": 1 });
      if (i) s.div = el("path", { d: `M${x0} ${TOP} L${x0} 900`, stroke: C.w, "stroke-width": 4 }, outer);
    });

    // C2: the age of power fills the whole page — a full-width scene wipes in from the right
    const cpw = el("clipPath", { id: pf + "now-wipe" }, defs);
    const wipeRect = el("rect", { x: 1600, y: 0, width: 1600, height: 900 }, cpw);
    const wide = el("g", { "clip-path": `url(#${pf}now-wipe)` }, svg);
    (() => { const g = wide;
      const lg = el("linearGradient", { id: pf + "now-sky", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
      el("stop", { offset: "0", "stop-color": C.b1 }, lg); el("stop", { offset: "1", "stop-color": C.w }, lg);
      el("rect", { x: 0, y: 0, width: 1600, height: 900, fill: `url(#${pf}now-sky)` }, g);
      [[300, 190], [1150, 160]].forEach(([x, y]) => el("path", { d: `M${x - 70} ${y} Q${x - 50} ${y - 26} ${x - 16} ${y - 18} Q${x + 10} ${y - 40} ${x + 40} ${y - 22} Q${x + 70} ${y - 22} ${x + 72} ${y} Z`, fill: C.w }, g));
      // horizon: pylons running the width, turbines on the hills
      el("path", { d: "M-20 470 C300 430 700 450 1000 420 C1250 400 1450 420 1620 400 L1620 900 L-20 900 Z", fill: C.g2 }, g);
      const tw = [];
      for (let x = 60; x <= 1560; x += 250) tw.push(pylon(g, x, 470 - (x / 1600) * 50, 110, C.n3));
      [[-1, 0], [1, 0], [-1, 1], [1, 1]].forEach(([sd, lo], i) => {
        const pts = [[-40, 0], ...tw.map((t) => t.arm(sd, lo)), [1640, 0]];
        pts[0][1] = pts[1][1] + 2; pts[pts.length - 1][1] = pts[pts.length - 2][1] - 2;
        let d = `M${pts[0][0]} ${pts[0][1]}`;
        for (let k = 1; k < pts.length; k++) { const [x0, y0] = pts[k - 1], [x1, y1] = pts[k]; d += ` Q${(x0 + x1) / 2} ${(y0 + y1) / 2 + 16} ${x1} ${y1}`; }   // the same sag in every span
        const c = el("path", { d, stroke: C.n3, "stroke-width": 1.1, fill: "none" }, g);
        if (lo === 0) pulseAlong(g, c, 6, sd > 0 ? C.g3 : C.b3, 8, 2.6);
      });
      (oneScene ? [[700, 446, 180], [935, 428, 210], [1185, 418, 200]] : [[980, 430, 190], [1080, 422, 220], [1190, 416, 200], [1300, 410, 230], [1420, 406, 200]]).forEach(([x, b, h], k) => SVG.turbine(g, x, b, h, { dur: 4 + k * 0.5 }));
      for (let r = 0; r < 3; r++) SVG.solarRow(g, 120 + r * 16, 500 + r * 26, 7, 42, 12, { skew: -7, leg: 8, gap: 5 });
      // an electric tram on its line
      el("path", { d: "M-20 600 L1620 600", stroke: C.n4, "stroke-width": 1.5, fill: "none" }, g);
      const tram = el("g", null, g);
      el("rect", { x: 0, y: -46, width: 220, height: 46, rx: 12, fill: C.g4 }, tram);
      for (let k = 0; k < 6; k++) el("rect", { x: 14 + k * 34, y: -38, width: 24, height: 20, rx: 3, fill: C.b1 }, tram);
      el("path", { d: "M100 -46 L116 -70 L130 -46 M110 -70 L126 -70", stroke: C.n4, "stroke-width": 2.5, fill: "none" }, tram);
      gsap.fromTo(tram, { x: -260, y: 672 }, { x: 1700, y: 672, duration: 14, repeat: -1, ease: "none" });
      // the town: flats with rooftop solar and heat pumps, a data centre, a factory
      const block = (x, w, h, col) => {
        const b = el("g", null, g), top = 690 - h;
        el("rect", { x, y: top, width: w, height: h, fill: col }, b);
        SVG.panelQuad(b, [[x + 8, top - 18], [x + w - 8, top - 18], [x + w - 4, top - 4], [x + 4, top - 4]], Math.max(4, Math.round(w / 20)), 2);
        for (let r = 0; r < Math.floor((h - 20) / 44); r++) for (let c = 0; c < Math.floor((w - 16) / 34); c++) el("rect", { x: x + 12 + c * 34, y: top + 14 + r * 44, width: 22, height: 26, fill: (r + c) % 3 ? C.y2 : C.b2 }, b);
        el("rect", { x: x + w - 30, y: 664, width: 24, height: 24, fill: C.n1 }, b);
        const fan = el("g", null, b); for (let k = 0; k < 3; k++) el("path", { d: `M${x + w - 18} 676 l-2 -8 l4 0 Z`, fill: C.n4, transform: `rotate(${k * 120} ${x + w - 18} 676)` }, fan); SVG.spinAt(fan, x + w - 18, 676, 1);
      };
      block(520, 150, 230, C.w); block(680, 130, 300, C.y1); block(820, 160, 250, C.g1); block(990, 120, 200, C.w);
      const dc = el("g", null, g);
      const dx0 = oneScene ? 1124 : 1130, dn = oneScene ? 6 : 8;
      el("rect", { x: dx0, y: 590, width: dn * 22 + 24, height: 100, fill: C.n4 }, dc);
      for (let k = 0; k < dn * 2; k++) el("rect", { x: dx0 + 16 + (k % dn) * 22, y: 610 + Math.floor(k / dn) * 30, width: 10, height: 10, fill: C.g3, class: "twinkle", style: `animation-delay:${-k * 0.25}s` }, dc);
      const fac = el("g", null, g);
      const fx = oneScene ? 320 : 1350;
      el("rect", { x: fx, y: 610, width: 180, height: 80, fill: C.n2 }, fac);
      let d = `M${fx} 610`; for (let k = 0; k < 4; k++) d += ` L${fx + k * 45} 586 L${fx + 45 + k * 45} 610`; el("path", { d: d + " Z", fill: C.n3 }, fac);
      for (let k = 0; k < 4; k++) SVG.panelQuad(fac, [[fx + 2 + k * 45, 606], [fx + 20 + k * 45, 590], [fx + 42 + k * 45, 606], [fx + 24 + k * 45, 609]], 2, 1);
      // the street: EVs charging, cyclists, people
      el("path", { d: "M-20 690 L1620 690 L1620 900 L-20 900 Z", fill: C.n1 }, g);
      el("path", { d: "M-20 760 L1620 760 L1620 900 L-20 900 Z", fill: C.n4 }, g);
      el("path", { d: "M-20 830 L1620 830", stroke: C.w, "stroke-width": 3, "stroke-dasharray": "36 30", fill: "none" }, g);
      el("path", { d: "M-20 896 L1620 896", stroke: C.n2, "stroke-width": 6, fill: "none" }, g);
      const van = el("g", null, g);   // traffic on the near lane
      el("path", { d: "M0 -8 L0 -40 Q0 -46 8 -46 L74 -46 L92 -24 L96 -8 Z", fill: C.w }, van); el("path", { d: "M76 -42 L90 -25 L76 -25 Z", fill: C.b1 }, van);
      el("rect", { x: 8, y: -38, width: 56, height: 4, fill: C.g4 }, van); el("circle", { cx: 20, cy: -6, r: 9, fill: C.n5 }, van); el("circle", { cx: 76, cy: -6, r: 9, fill: C.n5 }, van);
      gsap.fromTo(van, { x: -140, y: 818 }, { x: 1720, y: 818, duration: 13, repeat: -1, ease: "none", delay: -5 });
      const car2 = el("g", null, g);
      el("path", { d: "M0 -8 C0 -22 6 -26 22 -28 L38 -42 L86 -42 L104 -28 C118 -26 124 -20 122 -8 Z", fill: C.o3 }, car2); el("path", { d: "M44 -38 L62 -38 L62 -29 L32 -29 Z M66 -38 L84 -38 L98 -29 L66 -29 Z", fill: C.b1 }, car2);
      el("circle", { cx: 24, cy: -6, r: 9, fill: C.n5 }, car2); el("circle", { cx: 98, cy: -6, r: 9, fill: C.n5 }, car2);
      gsap.fromTo(car2, { x: 1720, y: 878, scaleX: -1, svgOrigin: "61 0" }, { x: -140, y: 878, duration: 11, repeat: -1, ease: "none" });
      [[160, C.b3], [300, C.w], [440, C.o3]].forEach(([x, col], k) => {
        el("rect", { x: x + 62, y: 688, width: 12, height: 48, rx: 3, fill: C.g4 }, g);
        el("path", { d: `M${x - 50} 740 C${x - 50} 724 ${x - 42} 720 ${x - 28} 718 L${x - 16} 702 L${x + 24} 702 L${x + 38} 718 C${x + 50} 720 ${x + 54} 728 ${x + 52} 740 Z`, fill: col }, g);
        el("path", { d: `M${x - 12} 706 L${x + 2} 706 L${x + 2} 716 L${x - 22} 716 Z M${x + 6} 706 L${x + 20} 706 L${x + 30} 716 L${x + 6} 716 Z`, fill: C.b1 }, g);
        el("circle", { cx: x - 30, cy: 742, r: 10, fill: C.n5 }, g); el("circle", { cx: x + 32, cy: 742, r: 10, fill: C.n5 }, g);
        const lead = el("path", { d: `M${x + 62} 704 C${x + 56} 714 ${x + 54} 716 ${x + 50} 718`, stroke: C.n5, "stroke-width": 2, fill: "none" }, g);
        pulseAlong(g, lead, 1, C.g3, 1, 2);
      });
      const cyc = el("g", null, g);
      [[-16, -14], [18, -14]].forEach(([dx, dy]) => el("circle", { cx: dx, cy: dy, r: 13, fill: "none", stroke: C.n5, "stroke-width": 3 }, cyc));
      el("path", { d: "M-16 -14 L0 -14 L12 -30 L-8 -30 Z M0 -14 L-6 -36 M12 -30 L18 -14", stroke: C.o3, "stroke-width": 3, fill: "none" }, cyc);
      P.person(cyc, { x: -12, y: -12, s: 0.32, pose: "sit", hairStyle: "bun", hairCol: C.n5, top: C.g3, bottom: C.n5, arms: { L: "wheel", R: "wheel" } });
      gsap.fromTo(cyc, { x: -140, y: 806 }, { x: 1720, y: 806, duration: 13, repeat: -1, ease: "none", delay: -11.5 });   // in the road at the van's own pace, half a lap ahead, so it is never run down
      const ped = el("g", { "data-people": "" }, g);   // pedestrians: kept in front of parked cars and chargers
      const walkers = el("g", null, ped);
      P.person(walkers, { x: 0, y: 752, s: 0.4, hairStyle: "bob", hairCol: C.br5, dress: C.b4, anim: "walk", flip: true });
      P.person(walkers, { x: -24, y: 754, s: 0.26, kid: true, hairStyle: "curly", hairCol: C.br5, dress: C.o2, arms: { R: "up" }, anim: "walk", flip: true });
      gsap.fromTo(walkers, { x: 1560 }, { x: 560, duration: 30, repeat: -1, ease: "none" });
      P.person(ped, { x: oneScene ? 1150 : 1400, y: 752, s: 0.4, hairStyle: "short", hairCol: C.n5, top: C.o2, bottom: C.b5, arms: { R: "open" }, gesture: "R" });
      P.person(ped, { x: oneScene ? 1180 : 1430, y: 752, s: 0.4, flip: true, hairStyle: "scarf", scarfCol: C.g5, top: C.w, bottom: C.n5, arms: { R: "hold" } });
      el("rect", { x: 620, y: 20, width: 360, height: 1, fill: "none" }, g);
    })();
    const wideLbl = el("g", { opacity: 0 }, svg);
    el("rect", { x: 660, y: TOP + 22, width: 280, height: 52, rx: 4, fill: C.w }, wideLbl);
    label(wideLbl, 800, TOP + 44, nowTitle, { "font-size": 13, fill: C.g5 });
    label(wideLbl, 800, TOP + 64, nowSub, { "font-size": 12, "font-weight": 500, fill: C.n3, "letter-spacing": 1 });

    // one picture: the electricity strip is simply a window onto the wide scene — its drawing moves into that scene, same place
    if (oneScene) {
      [...now.g.childNodes].filter((n) => !now.bg.includes(n)).forEach((n) => wide.appendChild(n));
      wide.appendChild(wide.querySelector("[data-people]"));   // pedestrians stay in front of the strip's cars
      now.g.style.display = "none";
      svg.insertBefore(now.outer, wideLbl);       // the strip's label and divider sit above the picture
      wipeRect.setAttribute("x", now.x0); wipeRect.setAttribute("width", W);
    }
    return { strips, now, nowItems, wide, wipeRect, wideLbl, TOP, X0, W, defs };
  }

  function timeline(svg) {
    const tl = gsap.timeline({ paused: true });
    const { strips, now, nowItems, wide, wipeRect, wideLbl } = buildAges(svg, "c-", "ELECTRICITY GRIDS", "NOW", true);
    // C3: one big question
    const veil = el("rect", { x: 0, y: 0, width: 1600, height: 900, fill: C.w, opacity: 0 }, svg);
    const q = el("text", { x: 800, y: 640, "text-anchor": "middle", "font-family": "Poppins", "font-weight": 600, "font-size": 560, fill: C.n5, opacity: 0, text: "?" }, svg);

    // --- timeline ---
    const ageG = strips.slice(0, 5).map((s) => s.outer);
    gsap.set(ageG, { opacity: 0 });
    gsap.set([wide, now.outer], { opacity: 0 });
    gsap.set(nowItems, { opacity: 0 });
    tl.to(ageG, { opacity: 1, duration: 0.2, stagger: 0.14 }, 0);
    // C2: the sixth strip lights up, then wipes across to fill the page
    tl.to([wide, now.outer], { opacity: 1, duration: 0.1 }, beat(1));
    tl.to(nowItems, { opacity: 1, duration: 0.08, stagger: 0.02 }, beat(1));
    // the rest of the same picture is uncovered to the left; what was in the strip stays exactly where it is
    tl.to(wipeRect, { attr: { x: 0, width: 1600 }, duration: 0.6, ease: "power2.inOut" }, beat(1) + 0.15);
    tl.to(now.div, { opacity: 0, duration: 0.1 }, beat(1) + 0.15);
    tl.to(now.lab, { x: 800 - now.cx, duration: 0.6, ease: "power2.inOut" }, beat(1) + 0.15);
    tl.set(now.lab, { opacity: 0 }, beat(1) + 0.75);
    tl.set(wideLbl, { opacity: 1 }, beat(1) + 0.75);
    // C3: the question
    tl.to(veil, { opacity: 0.55, duration: 0.3 }, beat(2));
    tl.fromTo(q, { opacity: 0, scale: 0.8, svgOrigin: "800 450" }, { opacity: 0.9, scale: 1, svgOrigin: "800 450", duration: 0.4, ease: "back.out(1.6)" }, beat(2) + 0.1);
    hold(tl, 2);
    return tl;
  }

  /* ============ 2c. TELECOMS — New York to London: a wide ocean, cables, lines and masts ============ */
  function telecom(svg) {
    const tl = gsap.timeline({ paused: true });
    sky(svg, "sky-tel", C.b1, C.w);
    const G = 600, L1 = 350, R0 = 1250; // ground/sea level; coastlines
    // the Atlantic in cross-section, wide between two narrow coasts
    el("path", { d: `M${L1} ${G} L${R0} ${G} L${R0} 900 L${L1} 900 Z`, fill: C.b2 }, svg);
    const bed = `M${L1} 700 C${L1 + 200} 850 700 870 800 866 C900 870 ${R0 - 200} 850 ${R0} 700`;
    el("path", { d: bed + ` L${R0} 900 L${L1} 900 Z`, fill: C.b4 }, svg);
    for (let i = 0; i < 7; i++) { const w = el("path", { d: `M${400 + i * 120} ${G + 18} q18 -8 36 0 q18 8 36 0`, stroke: C.w, "stroke-width": 2, fill: "none" }, svg); gsap.to(w, { x: 26, duration: 3 + i * 0.3, repeat: -1, yoyo: true, ease: "sine.inOut" }); }
    // coasts: pavement right at the foot of the buildings, a road, then the ground in section
    [[-100, L1], [R0, 1700]].forEach(([a, b]) => {
      el("path", { d: `M${a} ${G} L${b} ${G} L${b} ${G + 22} L${a} ${G + 22} Z`, fill: C.n1 }, svg);
      el("path", { d: `M${a} ${G + 22} L${b} ${G + 22} L${b} ${G + 56} L${a} ${G + 56} Z`, fill: C.n4 }, svg);
      el("path", { d: `M${a} ${G + 56} L${b} ${G + 56} L${b} 900 L${a} 900 Z`, fill: C.br1 }, svg);
    });
    label(svg, 215, 880, "NEW YORK", { "font-size": 13, fill: C.n3 });
    label(svg, 1385, 880, "LONDON", { "font-size": 13, fill: C.n3 });
    const wins = [], grow = [];
    const winGrid = (g, x, y, w, h, cw, ch, gx, gy) => { for (let r = 0; r < Math.floor((h - 10) / gy); r++) for (let c = 0; c < Math.floor((w - 4) / gx); c++) wins.push(el("rect", { x: x + 5 + c * gx, y: y + 8 + r * gy, width: cw, height: ch, fill: C.n2 }, g)); };
    // F4 towers (behind the skylines), raised later
    [[112, 330, C.b1], [250, 360, C.b2]].forEach(([x, h, col]) => { const t = el("g", null, svg); el("path", { d: `M${x} ${G} L${x} ${G - h + 30} L${x + 40} ${G - h} L${x + 40} ${G} Z`, fill: col }, t); for (let r = 0; r < Math.floor((h - 40) / 18); r++) el("rect", { x: x + 5, y: G - h + 40 + r * 18, width: 30, height: 3, fill: C.w }, t); grow.push(t); });
    [[1330, 320, C.b1], [1470, 350, C.b2]].forEach(([x, h, col]) => { const t = el("g", null, svg); el("path", { d: `M${x} ${G} C${x - 3} ${G - h * 0.6} ${x + 10} ${G - h} ${x + 20} ${G - h} C${x + 30} ${G - h} ${x + 43} ${G - h * 0.6} ${x + 40} ${G} Z`, fill: col }, t); for (let r = 0; r < 12; r++) el("path", { d: `M${x + 5} ${G - 20 - r * (h / 14)} L${x + 35} ${G - 20 - r * (h / 14)}`, stroke: C.w, "stroke-width": 2 }, t); grow.push(t); });
    // NEW YORK skyline
    const ny = el("g", null, svg);
    [[86, 140], [124, 200], [204, 170], [242, 230], [282, 150]].forEach(([x, h], i) => {
      el("rect", { x, y: G - h, width: 36, height: h, fill: i % 2 ? C.n2 : C.br2 }, ny);
      winGrid(ny, x, G - h, 36, h, 7, 9, 10, 16);
      if (i === 0 || i === 4) { el("rect", { x: x + 11, y: G - h - 18, width: 14, height: 14, fill: C.br4 }, ny); el("path", { d: `M${x + 9} ${G - h - 18} L${x + 18} ${G - h - 26} L${x + 27} ${G - h - 18} Z`, fill: C.br5 }, ny); }
    });
    const sx = 182;
    el("rect", { x: sx - 22, y: G - 280, width: 44, height: 280, fill: C.n1 }, ny);
    el("rect", { x: sx - 15, y: G - 330, width: 30, height: 50, fill: C.n1 }, ny);
    el("path", { d: `M${sx - 15} ${G - 330} Q${sx} ${G - 380} ${sx + 15} ${G - 330} Z`, fill: C.n2 }, ny);
    el("path", { d: `M${sx} ${G - 380} L${sx} ${G - 420}`, stroke: C.n3, "stroke-width": 3 }, ny);
    winGrid(ny, sx - 22, G - 280, 44, 280, 7, 9, 10, 16);
    // LONDON skyline
    const ld = el("g", null, svg);
    const ctx = 1285;
    el("rect", { x: ctx - 14, y: G - 230, width: 28, height: 230, fill: C.br1 }, ld);
    el("rect", { x: ctx - 18, y: G - 266, width: 36, height: 38, fill: C.br1 }, ld);
    el("circle", { cx: ctx, cy: G - 247, r: 12, fill: C.w }, ld);
    const hands = el("path", { d: `M${ctx} ${G - 247} L${ctx} ${G - 256} M${ctx} ${G - 247} L${ctx + 6} ${G - 247}`, stroke: C.n5, "stroke-width": 2 }, ld);
    SVG.spinAt(hands, ctx, G - 247, 60);
    el("path", { d: `M${ctx - 18} ${G - 266} L${ctx} ${G - 316} L${ctx + 18} ${G - 266} Z`, fill: C.br3 }, ld);
    for (let r = 0; r < 8; r++) el("rect", { x: ctx - 7, y: G - 216 + r * 26, width: 14, height: 10, fill: C.br2 }, ld);
    el("rect", { x: 1316, y: G - 100, width: 110, height: 100, fill: C.n1 }, ld);
    el("rect", { x: 1346, y: G - 136, width: 50, height: 36, fill: C.n1 }, ld);
    el("path", { d: `M1342 ${G - 136} Q1371 ${G - 196} 1400 ${G - 136} Z`, fill: C.n2 }, ld);
    el("rect", { x: 1366, y: G - 200, width: 10, height: 18, fill: C.n1 }, ld);
    winGrid(ld, 1316, G - 100, 110, 100, 8, 12, 16, 26);
    [1432, 1476].forEach((x, i) => { house(ld, x, G, 42, 64 + i * 8, i ? C.br2 : C.o1, C.n4, C.n2); el("rect", { x: x + 30, y: G - 100 - i * 8, width: 8, height: 18, fill: C.br4 }, ld); });
    winGrid(ld, 1432, G - 64, 86, 60, 9, 12, 21, 28);
    el("rect", { x: 1508, y: G - 44, width: 16, height: 44, rx: 2, fill: C.o4 }, ld); el("rect", { x: 1511, y: G - 38, width: 10, height: 24, fill: C.b1 }, ld);
    // telephone lines: poles along the kerb, wires strung into the buildings
    const lines = el("g", null, svg);
    const poleRow = (xs, into) => {
      xs.forEach((x) => { el("rect", { x: x - 2, y: G - 64, width: 4, height: 64 + 22, fill: C.br4 }, lines); el("rect", { x: x - 10, y: G - 62, width: 20, height: 3, fill: C.br4 }, lines); });
      for (let k = 1; k < xs.length; k++) [-8, 8].forEach((o) => el("path", { d: `M${xs[k - 1] + o} ${G - 61} Q${(xs[k - 1] + xs[k]) / 2 + o} ${G - 50} ${xs[k] + o} ${G - 61}`, stroke: C.n4, "stroke-width": 1.1, fill: "none" }, lines));
      into.forEach(([px, bx, by]) => el("path", { d: `M${px} ${G - 61} Q${(px + bx) / 2} ${G - 52} ${bx} ${by}`, stroke: C.n4, "stroke-width": 1, fill: "none" }, lines));
    };
    poleRow([100, 170, 240, 310], [[100, 86, G - 100], [240, 242, G - 110]]);
    poleRow([1290, 1360, 1430, 1500], [[1360, 1340, G - 60], [1430, 1450, G - 40]]);
    // masts on the rooftops
    const masts = [[262, G - 230], [1446, G - 100]].map(([x, b]) => {
      const m = el("g", null, svg);
      el("path", { d: `M${x - 9} ${b} L${x} ${b - 80} L${x + 9} ${b} M${x - 6} ${b - 26} L${x + 6} ${b - 26} M${x - 4} ${b - 52} L${x + 4} ${b - 52}`, stroke: C.n4, "stroke-width": 2.5, fill: "none" }, m);
      const arcs = [1, 2, 3].map((k) => el("path", { d: `M${x - 8 - k * 10} ${b - 84 - k * 8} Q${x} ${b - 94 - k * 12} ${x + 8 + k * 10} ${b - 84 - k * 8}`, stroke: C.b3, "stroke-width": 2.5, fill: "none", opacity: 0 }, m));
      return { m, arcs };
    });
    // cable landing stations and the transatlantic cable, underground and along the seabed
    [[L1 - 46, G], [R0 + 10, G]].forEach(([x, b]) => { el("rect", { x, y: b - 26, width: 36, height: 26, fill: C.n2 }, svg); el("rect", { x: x + 12, y: b - 14, width: 12, height: 14, fill: C.n4 }, svg); });
    const cable = el("path", { d: `M${L1 - 28} ${G + 56} L${L1 - 28} 684 Q${L1 - 28} 700 ${L1} 700 ` + bed.slice(bed.indexOf("C")) + ` Q${R0 + 28} 700 ${R0 + 28} 684 L${R0 + 28} ${G + 56}`, stroke: C.n5, "stroke-width": 5, fill: "none", "stroke-linejoin": "round" }, svg);
    // traffic
    const cab = el("g", null, svg);
    el("rect", { x: -20, y: -13, width: 40, height: 13, rx: 4, fill: C.y3 }, cab); el("path", { d: "M-11 -13 L-6 -22 L10 -22 L14 -13 Z", fill: C.b1 }, cab);
    el("circle", { cx: -11, cy: 0, r: 5, fill: C.n5 }, cab); el("circle", { cx: 11, cy: 0, r: 5, fill: C.n5 }, cab);
    gsap.fromTo(cab, { x: -40, y: G + 48 }, { x: L1 - 60, y: G + 48, duration: 5, repeat: -1, ease: "none" });
    const dd = el("g", null, svg);
    el("rect", { x: -44, y: -56, width: 88, height: 56, rx: 6, fill: C.o4 }, dd);
    [-34, -12, 10].forEach((x) => { el("rect", { x, y: -50, width: 18, height: 12, rx: 2, fill: C.b1 }, dd); el("rect", { x, y: -30, width: 18, height: 12, rx: 2, fill: C.b1 }, dd); });
    el("circle", { cx: -26, cy: 0, r: 7, fill: C.n5 }, dd); el("circle", { cx: 26, cy: 0, r: 7, fill: C.n5 }, dd);
    gsap.fromTo(dd, { x: 1720, y: G + 50 }, { x: R0 + 50, y: G + 50, duration: 7, repeat: -1, ease: "none" });
    // the ship that lays the cable
    const ship = el("g", null, svg);
    el("path", { d: "M-60 -16 L60 -16 L48 8 L-52 8 Z", fill: C.n4 }, ship);
    el("path", { d: "M-34 -36 L18 -36 L18 -16 L-34 -16 Z", fill: C.w }, ship);
    el("path", { d: "M26 -54 L30 -54 L30 -16 L26 -16 Z M30 -52 L52 -28", stroke: C.n4, "stroke-width": 3, fill: "none" }, ship);
    el("path", { d: "M52 -28 L52 250", stroke: C.n5, "stroke-width": 2, "stroke-dasharray": "4 4", fill: "none" }, ship);
    gsap.set(ship, { x: L1 + 40, y: G });
    const dataG = el("g", null, svg);
    // people on the pavement, right at the foot of the buildings
    const ppl = el("g", null, svg);
    const phone = (p, side) => { const [hx, hy] = p.hand(side); el("rect", { x: hx - 3, y: hy - 10, width: 6, height: 11, rx: 1.5, fill: C.n5 }, ppl); el("rect", { x: hx - 2, y: hy - 8.5, width: 4, height: 7, fill: C.b3, class: "twinkle" }, ppl); };
    const lap = (x, y) => { el("path", { d: `M${x - 11} ${y} L${x + 11} ${y} L${x + 9} ${y - 3} L${x - 9} ${y - 3} Z M${x - 8} ${y - 3} L${x - 6} ${y - 17} L${x + 8} ${y - 17} L${x + 8} ${y - 3} Z`, fill: C.n4 }, ppl); el("path", { d: `M${x - 5} ${y - 5} L${x - 4} ${y - 15} L${x + 6} ${y - 15} L${x + 6} ${y - 5} Z`, fill: C.b3, class: "twinkle" }, ppl); };
    phone(P.person(ppl, { x: 130, y: G + 18, s: 0.4, hairStyle: "bun", hairCol: C.n5, top: C.g4, bottom: C.n4, arms: { R: "hold" } }), "R");
    phone(P.person(ppl, { x: 290, y: G + 18, s: 0.4, flip: true, hairStyle: "short", hairCol: C.n5, top: C.o2, bottom: C.b5, arms: { R: "hold" } }), "R");
    const kid = P.person(ppl, { x: 210, y: G + 18, s: 0.3, kid: true, hairStyle: "curly", hairCol: C.n5, top: C.b3, bottom: C.n4, arms: { R: "forward", L: "forward" } }); { const [hx, hy] = kid.hand("R"); lap(hx + 2, hy + 2); }
    phone(P.person(ppl, { x: 1340, y: G + 18, s: 0.4, hairStyle: "curly", hairCol: C.n5, top: C.y3, bottom: C.n4, arms: { R: "hold" } }), "R");
    phone(P.person(ppl, { x: 1405, y: G + 18, s: 0.3, kid: true, hairStyle: "bob", hairCol: C.br5, dress: C.o2, arms: { R: "hold" } }), "R");
    const wk = P.person(ppl, { x: 1480, y: G + 18, s: 0.4, flip: true, hairStyle: "short", hairCol: C.n5, top: C.g3, bottom: C.b5, arms: { R: "forward", L: "forward" } }); { const [hx, hy] = wk.hand("R"); lap(hx - 2, hy + 2); }
    const link = el("path", { d: "M215 340 C500 250 1100 250 1385 340", stroke: C.b3, "stroke-width": 2.5, "stroke-dasharray": "6 8", fill: "none", opacity: 0 }, svg);
    const bubbles = [[470, 340], [1130, 340]].map(([x, y]) => { const b = el("g", { opacity: 0 }, svg); el("rect", { x: x - 42, y: y - 22, width: 84, height: 40, rx: 8, fill: C.w }, b); [x - 16, x, x + 16].forEach((cx) => el("circle", { cx, cy: y - 2, r: 4, fill: C.n3 }, b)); return b; });

    gsap.set([lines, ...masts.map((m) => m.m)], { opacity: 0 });
    gsap.set(ppl, { opacity: 0 });
    gsap.set(grow, { scaleY: 0, transformOrigin: "50% 100%" });
    tl.to([lines, ...masts.map((m) => m.m)], { opacity: 1, duration: 0.3, stagger: 0.1 }, 0.1);
    // F2: laid across the ocean
    drawOn(tl, cable, beat(1), 0.9);
    tl.to(ship, { x: R0 - 70, duration: 0.9, ease: "none" }, beat(1));
    tl.to(ship, { opacity: 0, duration: 0.15 }, beat(1) + 0.9);
    // F3: information moving instantly
    tl.add(() => { if (!dataG.childNodes.length) pulseAlong(dataG, cable, 12, C.b3, 2.4, 4); }, beat(2));
    tl.fromTo(dataG, { opacity: 0 }, { opacity: 1, duration: 0.2 }, beat(2));
    masts.forEach((m) => tl.to(m.arcs, { opacity: 1, duration: 0.15, stagger: 0.08 }, beat(2) + 0.1));
    tl.to(link, { opacity: 1, duration: 0.3 }, beat(2) + 0.2);
    gsap.to(link, { strokeDashoffset: -28, duration: 1, repeat: -1, ease: "none" });
    // F4: societies transformed within a generation
    tl.to(grow, { scaleY: 1, duration: 0.4, stagger: 0.08, ease: "power2.out" }, beat(3));
    tl.to(wins, { fill: C.y2, duration: 0.05, stagger: 0.004 }, beat(3));
    tl.to(ppl, { opacity: 1, duration: 0.3 }, beat(3) + 0.2);
    tl.to(bubbles, { opacity: 1, duration: 0.2, stagger: 0.2 }, beat(3) + 0.3);
    hold(tl, 3);
    return tl;
  }

  /* ============ G. feats → modern grids: the six ages evolve — more movement, then growth — then modern grids ============ */
  function feats(svg) {
    const tl = gsap.timeline({ paused: true });
    const A = buildAges(svg, "g-", "MODERN GRIDS", "THE CURRENT AGE", true);
    const { strips, now, wide, wipeRect, wideLbl } = A;
    const W1 = [], W2 = [];               // G1: speed & momentum (more traffic, more motion) · G2: growth & new ways of living
    const add = (arr, g) => { const n = el("g", null, g); arr.push(n); return n; };
    const behind = (g) => { const b = el("g", null, g); g.insertBefore(b, g.childNodes[1]); return b; };
    const rise = (arr, g, x, base, w, h, col, win) => {
      const b = add(arr, g);
      el("rect", { x, y: base - h, width: w, height: h, fill: col }, b);
      for (let r = 0; r < Math.floor((h - 10) / 28); r++) for (let c = 0; c < Math.floor((w - 6) / 16); c++) el("rect", { x: x + 5 + c * 16, y: base - h + 10 + r * 28, width: 7, height: 11, fill: win || C.y2 }, b);
      b.dataset.rise = 1; return b;
    };
    const ppl = (arr, g, list) => { const n = add(arr, g); list.forEach((o) => P.person(n, Object.assign({ s: 0.38 }, o))); return n; };
    const boat = (g, y, col, dur, off) => { const b = el("g", null, g); el("path", { d: "M-40 0 L28 0 L36 12 L-46 12 Z", fill: C.g4 }, b); el("path", { d: "M-30 -12 L10 -12 L10 0 L-30 0 Z", fill: col }, b); gsap.fromTo(b, { x: 0 }, { x: 0, duration: 0.01 }); return [b, dur, off, y]; };

    // 1 CANALS: more boats and cargo on the water (G1); warehouses and a canal town (G2)
    (() => { const { g, x0, cx } = strips[0];
      const w1 = add(W1, g);
      [[664, C.b4, 7, 0], [690, C.y4, 9, 0.5]].forEach(([y, col, dur, off]) => { const b = el("g", null, w1); el("path", { d: "M-40 0 L28 0 L36 12 L-46 12 Z", fill: C.g5 }, b); el("path", { d: "M-30 -12 L10 -12 L10 0 L-30 0 Z", fill: col }, b); gsap.fromTo(b, { x: x0 - 60, y }, { x: x0 + 300, y, duration: dur, repeat: -1, ease: "none", delay: -off * dur }); });
      [[x0 + 20, 606], [x0 + 44, 606], [x0 + 32, 592]].forEach(([x, y]) => el("rect", { x, y, width: 22, height: 14, fill: C.br3 }, w1));
      rise(W2, g, x0 + 168, 620, 70, 140, C.br3); rise(W2, behind(g), x0 + 10, 470, 70, 170, C.br2); rise(W2, behind(g), x0 + 100, 470, 60, 120, C.br1);
      ppl(W2, g, [{ x: x0 + 110, y: 802, hairStyle: "short", hat: "cap", hatCol: C.br5, top: C.o4, bottom: C.n4, arms: { R: "carry" }, anim: "walk" }, { x: x0 + 150, y: 804, hairStyle: "bun", hairCol: C.br5, dress: C.g4, dressLen: "long", arms: { R: "hold" } }]);
    })();
    // 2 RAILWAYS: a second, faster train and a busier platform (G1); the mill town spreads (G2)
    (() => { const { g, x0, cx } = strips[1];
      const w1 = add(W1, g);
      el("path", { d: `M${x0} 740 L${x0 + 240} 740`, stroke: C.n5, "stroke-width": 3 }, w1);
      const tr = el("g", null, w1);
      el("path", { d: "M-68 -30 L-18 -30 L-18 0 L-68 0 Z", fill: C.b5 }, tr); el("path", { d: "M-18 -22 L40 -22 L40 0 L-18 0 Z", fill: C.g5 }, tr); el("path", { d: "M44 -22 L100 -22 L100 0 L44 0 Z", fill: C.g5 }, tr);
      puffs(tr, -58, -38, 3, C.w, 0.7);
      gsap.fromTo(tr, { x: x0 + 340, y: 740 }, { x: x0 - 160, y: 740, duration: 3.5, repeat: -1, ease: "none" });
      ppl(W1, g, [{ x: cx - 90, y: 760, hairStyle: "bob", hairCol: C.br5, dress: C.b4, dressLen: "long" }, { x: cx + 90, y: 760, hairStyle: "short", hat: "hat", hatCol: C.n5, top: C.n4, bottom: C.n5, coat: true, anim: "walk" }]);
      rise(W2, behind(g), x0 + 10, 520, 80, 250, C.br2); rise(W2, behind(g), x0 + 150, 520, 80, 210, C.br1); rise(W2, g, x0 + 170, 520, 60, 110, C.br3);
      const ch = add(W2, behind(g)); [x0 + 30, x0 + 120].forEach((x) => { el("rect", { x, y: 180, width: 14, height: 340, fill: C.br4 }, ch); puffs(ch, x + 7, 170, 3, C.n1, 1); });
    })();
    // 3 TELEPHONE LINES: an electric tram and more lines (G1); taller city blocks, busy pavements (G2)
    (() => { const { g, x0, cx } = strips[2];
      const w1 = add(W1, g);
      el("path", { d: `M${x0} 690 L${x0 + 240} 690`, stroke: C.n4, "stroke-width": 1.5 }, w1);
      const tram = el("g", null, w1);
      el("rect", { x: -60, y: -40, width: 120, height: 40, rx: 8, fill: C.o4 }, tram);
      for (let k = 0; k < 4; k++) el("rect", { x: -52 + k * 28, y: -34, width: 20, height: 16, rx: 2, fill: C.y1 }, tram);
      el("path", { d: "M0 -40 L12 -58 L22 -40", stroke: C.n4, "stroke-width": 2, fill: "none" }, tram);
      gsap.fromTo(tram, { x: x0 - 80, y: 748 }, { x: x0 + 330, y: 748, duration: 5, repeat: -1, ease: "none" });
      [x0 + 20, x0 + 220].forEach((x) => { el("rect", { x: x - 3, y: 330, width: 6, height: 330, fill: C.br4 }, w1); for (let k = 0; k < 3; k++) el("rect", { x: x - 26, y: 340 + k * 20, width: 52, height: 4, fill: C.br4 }, w1); });
      rise(W2, behind(g), x0 + 4, 640, 70, 470, C.br1); rise(W2, behind(g), x0 + 166, 640, 70, 430, C.n1);
      ppl(W2, g, [{ x: x0 + 40, y: 712, hairStyle: "short", hat: "hat", hatCol: C.n5, top: C.n4, bottom: C.n5, coat: true, anim: "walk" }, { x: x0 + 190, y: 712, hairStyle: "bun", hairCol: C.br5, dress: C.o2, dressLen: "long", arms: { R: "hold" } }]);
      g.appendChild(w1);   // the tram runs in front of the people on the far pavement, never through them
    })();
    // 4 HIGHWAYS: a cross-town highway full of traffic (G1); the suburb spreads, a shopping parade (G2)
    (() => { const { g, x0, cx } = strips[3];
      const w1 = add(W1, g);
      el("path", { d: `M${x0} 620 L${x0 + 240} 600 L${x0 + 240} 630 L${x0} 650 Z`, fill: C.n3 }, w1);
      el("path", { d: `M${x0} 635 L${x0 + 240} 615`, stroke: C.w, "stroke-width": 1.5, "stroke-dasharray": "10 8", fill: "none" }, w1);
      [[C.o3, 3, 0], [C.b4, 3.6, 0.4], [C.w, 4.2, 0.7], [C.g4, 3.2, 0.2]].forEach(([col, dur, off], k) => {
        const c = el("g", null, w1); el("rect", { x: -14, y: -9, width: 28, height: 10, rx: 3, fill: col }, c); el("rect", { x: -6, y: -15, width: 14, height: 7, rx: 2, fill: C.b1 }, c);
        const dir = k % 2 ? -1 : 1;
        gsap.fromTo(c, { x: dir > 0 ? x0 - 30 : x0 + 270, y: (dir > 0 ? 644 : 628) }, { x: dir > 0 ? x0 + 270 : x0 - 30, y: (dir > 0 ? 624 : 648), duration: dur, repeat: -1, ease: "none", delay: -off * dur });
      });
      const sub = add(W2, g);
      [[x0 + 8, 700, 50, C.b1], [x0 + 186, 690, 46, C.w], [x0 + 16, 780, 56, C.y1], [x0 + 176, 770, 54, C.br1]].forEach(([x, y, w, col]) => house(sub, x, y, w, w * 0.6, col, C.o5, C.b4));
      const shop = add(W2, g); el("rect", { x: x0 + 150, y: 500, width: 90, height: 60, fill: C.w }, shop); el("rect", { x: x0 + 150, y: 492, width: 90, height: 10, fill: C.o3 }, shop);
      for (let k = 0; k < 3; k++) el("rect", { x: x0 + 158 + k * 27, y: 516, width: 20, height: 30, fill: C.b2 }, shop);
    })();
    // 5 THE INTERNET: signals and data speed up, a phone mast (G1); a second tower, people online everywhere (G2)
    (() => { const { g, x0, cx } = strips[4];
      const w1 = add(W1, g);
      [1, 2, 3].forEach((k) => el("path", { d: `M${x0 + 150 - k * 14} ${190 - k * 10} Q${x0 + 150} ${176 - k * 16} ${x0 + 150 + k * 14} ${190 - k * 10}`, stroke: C.b3, "stroke-width": 2.5, fill: "none", class: "twinkle", style: `animation-delay:${-k * 0.3}s` }, w1));
      const mx = x0 + 215;
      el("path", { d: `M${mx - 10} 660 L${mx} 520 L${mx + 10} 660 M${mx - 7} 610 L${mx + 7} 610 M${mx - 4} 565 L${mx + 4} 565`, stroke: C.n4, "stroke-width": 2.5, fill: "none" }, w1);
      [1, 2].forEach((k) => el("path", { d: `M${mx - 8 - k * 8} ${516 - k * 6} Q${mx} ${506 - k * 10} ${mx + 8 + k * 8} ${516 - k * 6}`, stroke: C.b3, "stroke-width": 2, fill: "none", class: "twinkle" }, w1));
      const fib = el("path", { d: `M${x0 - 10} 850 L${x0 + 250} 850`, stroke: C.n5, "stroke-width": 7, fill: "none" }, w1); pulseAlong(w1, fib, 8, C.g3, 0.8, 3);
      const t2 = add(W2, behind(g)); el("path", { d: `M${x0 + 4} 660 L${x0 + 4} 330 L${x0 + 44} 300 L${x0 + 44} 660 Z`, fill: C.b1 }, t2); for (let r = 0; r < 16; r++) el("rect", { x: x0 + 9, y: 330 + r * 20, width: 30, height: 4, fill: C.w }, t2);
      const pp = add(W2, g);
      [[x0 + 30, C.g4, "bun"], [x0 + 200, C.o2, "short"]].forEach(([x, col, hs]) => { const p = P.person(pp, { x, y: 758, s: 0.38, hairStyle: hs, hairCol: C.n5, top: col, bottom: C.n4, arms: { R: "hold" } }); const [hx, hy] = p.hand("R"); el("rect", { x: hx - 3, y: hy - 9, width: 6, height: 10, rx: 1.5, fill: C.n5 }, pp); });
    })();
    // 6 ELECTRICITY GRIDS: more turbines turning and EVs on the move (G1); solar on every roof, new homes (G2)
    (() => { const { x0, cx } = strips[5], g = wide;   // drawn straight into the one wide picture the strip is a window onto
      const w1 = add(W1, g);
      [[x0 + 130, 462, 140], [x0 + 228, 456, 130]].forEach(([x, b, h], k) => SVG.turbine(w1, x, b, h, { dur: 2.6 + k * 0.3 }));
      const ev = el("g", null, w1); el("path", { d: "M-24 0 C-24 -8 -20 -10 -12 -11 L-6 -20 L12 -20 L18 -11 C24 -10 26 -6 25 0 Z", fill: C.g4 }, ev); el("circle", { cx: -12, cy: 1, r: 5, fill: C.n5 }, ev); el("circle", { cx: 14, cy: 1, r: 5, fill: C.n5 }, ev);
      gsap.fromTo(ev, { x: x0 - 40, y: 770 }, { x: x0 + 290, y: 770, duration: 3, repeat: -1, ease: "none" });
      const w2 = add(W2, g);
      [[x0 + 150, 700, 80, 120, C.g1]].forEach(([x, base, w, h, col]) => {
        el("rect", { x, y: base - h, width: w, height: h, fill: col }, w2);
        SVG.panelQuad(w2, [[x + 4, base - h - 14], [x + w - 4, base - h - 14], [x + w - 2, base - h - 2], [x + 2, base - h - 2]], 4, 2);
        for (let r = 0; r < Math.floor(h / 34); r++) for (let c = 0; c < Math.floor(w / 26); c++) el("rect", { x: x + 8 + c * 26, y: base - h + 10 + r * 34, width: 14, height: 18, fill: C.y2 }, w2);
      });
      for (let r = 0; r < 2; r++) SVG.solarRow(w2, x0 + 150 + r * 8, 470 + r * 18, 3, 26, 8, { skew: -4, leg: 5, gap: 3 });
      ppl(W2, g, [{ x: x0 + 120, y: 756, hairStyle: "curly", hairCol: C.n5, top: C.g3, bottom: C.b5, arms: { R: "open" }, gesture: "R" }, { x: x0 + 180, y: 758, s: 0.28, kid: true, hairStyle: "bob", hairCol: C.br5, dress: C.o2, arms: { R: "up" }, anim: "bob" }]);
    })();

    // reveal states
    gsap.set(W1, { opacity: 0 });
    W2.forEach((n) => gsap.set(n, n.dataset.rise ? { scaleY: 0, transformOrigin: "50% 100%" } : { opacity: 0 }));
    // G1: speed and momentum — each age fills with movement, left to right
    tl.to(W1, { opacity: 1, duration: 0.15, stagger: 0.12 }, 0.05);
    // G2: in their wake, new ways of living and growth — each age builds out
    W2.forEach((n, k) => tl.to(n, n.dataset.rise ? { scaleY: 1, duration: 0.3, ease: "power2.out" } : { opacity: 1, duration: 0.2 }, beat(1) + (k / W2.length) * 0.7));
    // G3: modern grids take the whole page
    // the rest of the electricity picture opens to the left; what is in the strip stays exactly where it is
    tl.to(wipeRect, { attr: { x: 0, width: 1600 }, duration: 0.6, ease: "power2.inOut" }, beat(2) + 0.1);
    tl.to(now.div, { opacity: 0, duration: 0.1 }, beat(2) + 0.1);
    tl.to(now.lab, { x: 800 - now.cx, duration: 0.6, ease: "power2.inOut" }, beat(2) + 0.1);
    tl.to(now.lab, { opacity: 0, duration: 0.12 }, beat(2) + 0.62);
    tl.to(wideLbl, { opacity: 1, duration: 0.12 }, beat(2) + 0.62);
    hold(tl, 2);
    return tl;
  }

  /* ============ 6. A WORLD REMADE — everything changes except the grid ============ */
  // I: one town street — I1–I3 move it from 1900 to today while the grid stays the same; I4–I6 look at that grid
  function town(svg, mode) {
    const tl = gsap.timeline({ paused: true });
    sky(svg, "sky-" + mode, C.b1, C.w);
    // THE GRID — set back from the street and high in the frame, so it uses the sky:
    //   a power station on the distant hills → a transmission line across them → a substation at the edge of town →
    //   wooden distribution poles along the street → a service wire into each building.
    // It is drawn once and never changes between eras; that is the point of section I.
    const HILL = [[-100, 384], [300, 356], [700, 338], [1000, 322], [1300, 314], [1700, 304]];
    const hillY = (x) => { for (let k = 1; k < HILL.length; k++) { const [x0, y0] = HILL[k - 1], [x1, y1] = HILL[k]; if (x <= x1) return y0 + (y1 - y0) * (x - x0) / (x1 - x0); } return 304; };
    const gridG = el("g", null, svg);
    // a further ridge, high on the left and running down to meet the pylon hills — wind and solar go on it in I5, clear of the pylons
    const RIDGE = [[-100, 156], [300, 198], [960, 334]];
    const ridgeY = (x) => { for (let k = 1; k < RIDGE.length; k++) { const [x0, y0] = RIDGE[k - 1], [x1, y1] = RIDGE[k]; if (x <= x1) return y0 + (y1 - y0) * (x - x0) / (x1 - x0); } return 334; };
    el("path", { d: "M-100 156 L300 198 C520 240 760 292 960 334 L960 440 L-100 440 Z", fill: C.g1, opacity: 0.7 }, gridG);
    const ridgeAdds = el("g", { opacity: 0 }, gridG);
    el("path", { d: "M" + HILL.map(([x, y]) => `${x} ${y}`).join(" L") + " L1700 900 L-100 900 Z", fill: C.g1 }, gridG);
    el("path", { d: "M-100 540 C300 520 800 536 1700 510 L1700 900 L-100 900 Z", fill: C.g2 }, gridG);
    const PX = 1090, PB = hillY(PX) + 2;
    const ps = el("g", null, gridG);
    el("path", { d: `M${PX - 40} ${PB} C${PX - 44} ${PB - 30} ${PX - 32} ${PB - 52} ${PX - 36} ${PB - 76} L${PX} ${PB - 76} C${PX - 4} ${PB - 52} ${PX + 8} ${PB - 30} ${PX + 4} ${PB} Z`, fill: C.n1 }, ps);
    el("rect", { x: PX + 52, y: PB - 112, width: 9, height: 112, fill: C.n3 }, ps);
    el("rect", { x: PX + 12, y: PB - 34, width: 80, height: 34, fill: C.n2 }, ps);
    puffs(ps, PX + 56, PB - 118, 4, C.n1, 0.8); puffs(ps, PX - 18, PB - 82, 4, C.w, 1.1);
    const tow = (x, h) => pylon(gridG, x, hillY(x) + 4, h || 100, C.n4);
    const TL = [890, 700, 510, 320, 130, -60].map((x) => tow(x)), TR = [1250, 1420, 1590].map((x) => tow(x));
    const span = (p, q, sag) => ` Q${(p[0] + q[0]) / 2} ${Math.max(p[1], q[1]) + sag} ${q[0]} ${q[1]}`;
    const lines = [];   // transmission: starts at the power station, runs out both ways
    const wire = (from, list, endX) => [-1, 1].forEach((sd) => {
      let p = from, d = `M${p[0]} ${p[1]}`;
      list.forEach((t) => { const q = t.arm(sd, 0); d += span(p, q, 12); p = q; });
      d += span(p, [endX, p[1] + 4], 12);
      lines.push(el("path", { d, stroke: C.n3, "stroke-width": 1.2, fill: "none" }, gridG));
    });
    wire([PX + 14, PB - 28], TL, -260); wire([PX + 90, PB - 28], TR, 1800);
    // a terminal tower and a substation where the line comes down to the town
    const TT = pylon(gridG, 1316, 488, 100, C.n4);
    const sub = el("g", null, gridG);
    el("rect", { x: 1360, y: 454, width: 132, height: 32, fill: C.n1 }, sub);
    [1372, 1412, 1452].forEach((x) => { el("rect", { x, y: 460, width: 24, height: 22, fill: C.n3 }, sub); el("rect", { x: x + 3, y: 453, width: 4, height: 8, fill: C.n4 }, sub); el("rect", { x: x + 17, y: 453, width: 4, height: 8, fill: C.n4 }, sub); });
    el("path", { d: "M1366 486 L1366 432 L1486 432 L1486 486 M1366 441 L1486 441", stroke: C.n4, "stroke-width": 2, fill: "none" }, sub);
    const branch = [-1, 1].map((sd) => { const a = TR[0].arm(sd, 0), b = TT.arm(sd, 0), c = [1426 + sd * 56, 432]; return el("path", { d: `M${a[0]} ${a[1]}` + span(a, b, 10) + span(b, c, 4), stroke: C.n3, "stroke-width": 1.2, fill: "none" }, gridG); });



    // the town in front, from the first grids (1900) to today, drawn to one scale per depth so people, desks, cars and buildings stay in proportion
    //   midground (buildings, base y 690): 1px ≈ 4cm, people s 0.25 · road (y 702–796): 1px ≈ 3cm · front pavement (feet y 868): 1px ≈ 2.4cm, people s 0.42
    const ERAS = [1900, 1950, 1975, 2025];
    let life = el("g", null, svg); const lifeBack = life;   // buildings; the poles and the road go in front
    const sets = [];
    // each part of the street: a base drawing that never changes, then one layer per era on top
    const named = {};
    const part = (name) => { const b = el("g", null, life); const st = ERAS.map(() => el("g", null, life)); sets.push(st); if (name) named[name] = [b, st[st.length - 1]]; return [b, ...st]; };
    const fan = (g, x, y, r) => { el("rect", { x: x - r - 2, y: y - r - 2, width: 2 * r + 4, height: 2 * r + 4, fill: C.n1 }, g); const f = el("g", null, g); for (let k = 0; k < 3; k++) el("path", { d: `M${x} ${y} l-1.6 ${-r + 1} l3.2 0 Z`, fill: C.n4, transform: `rotate(${k * 120} ${x} ${y})` }, f); SVG.spinAt(f, x, y, 1); };
    const mid = (g, o) => P.person(g, Object.assign({ s: 0.25, y: 698 }, o));
    const front = (g, o) => P.person(g, Object.assign({ s: 0.42, y: 868 }, o));
    const cyclist = (g, x, y, k, frame, top, extra) => {   // a bike and rider, drawn at the rider's scale k (1 = s 0.32)
      const c = el("g", { transform: `translate(${x} ${y}) scale(${k})` }, g);
      [[-16, -14], [18, -14]].forEach(([dx, dy]) => el("circle", { cx: dx, cy: dy, r: 13, fill: "none", stroke: C.n5, "stroke-width": 3 }, c));
      el("path", { d: "M-16 -14 L0 -14 L12 -30 L-8 -30 Z M0 -14 L-6 -36 M12 -30 L18 -14", stroke: frame, "stroke-width": 3, fill: "none" }, c);
      P.person(c, Object.assign({ x: -12, y: -12, s: 0.32, pose: "sit", hairStyle: "bun", hairCol: C.n5, top, bottom: C.n5, arms: { L: "wheel", R: "wheel" } }, extra || {}));
      return c;
    };
    const horse = (g, x, y, k, col) => {   // a horse facing right, hooves at y; k = scale (1 ≈ 1px per 3cm)
      const h = el("g", { transform: `translate(${x} ${y}) scale(${k})` }, g);
      el("path", { d: "M-34 -48 C-34 -58 -20 -62 0 -62 L14 -62 L30 -86 L42 -84 L46 -74 L38 -70 L26 -52 C24 -44 18 -40 10 -40 L-24 -40 C-30 -40 -34 -44 -34 -48 Z", fill: col }, h);
      el("path", { d: "M-34 -56 C-42 -52 -44 -42 -40 -34", stroke: C.n5, "stroke-width": 3, fill: "none" }, h);
      [-28, -20, 6, 14].forEach((lx) => el("rect", { x: lx, y: -42, width: 5, height: 42, fill: col }, h));
      return h;
    };

    // ground: grass behind, the near pavement, the road, the front pavement
    el("path", { d: "M-100 688 L1700 688 L1700 702 L-100 702 Z", fill: C.n1 }, life);
    el("path", { d: "M-100 702 L1700 702 L1700 796 L-100 796 Z", fill: C.n4 }, life);
    for (let x = -60; x < 1660; x += 70) el("rect", { x, y: 748, width: 36, height: 3, fill: C.w }, life);
    el("path", { d: "M-100 796 L1700 796 L1700 802 L-100 802 Z", fill: C.n2 }, life);
    el("path", { d: "M-100 802 L1700 802 L1700 900 L-100 900 Z", fill: C.n1 }, life);
    // 1900: a cobbled street with tram rails, no road markings
    { const [b, e0] = part();
      el("path", { d: "M-100 702 L1700 702 L1700 796 L-100 796 Z", fill: C.br3 }, e0);
      for (let r = 0; r < 4; r++) for (let x = -80 + (r % 2) * 18; x < 1660; x += 36) el("rect", { x, y: 712 + r * 22, width: 22, height: 3, fill: C.br4, opacity: 0.5 }, e0);
      el("path", { d: "M-100 760 L1700 760 M-100 772 L1700 772", stroke: C.n3, "stroke-width": 2 }, e0); }

    // --- MIDGROUND ---
    // a row of terraced houses (left)
    { const [base, e0, e1, e2, e3] = part("homes");
      [[90, C.br3, C.b4], [172, C.br2, C.g4], [254, C.br3, C.o3]].forEach(([hx, body, door]) => {
        const w = 80;
        el("rect", { x: hx + w - 6, y: 494, width: 12, height: 24, fill: C.br4 }, base);
        el("rect", { x: hx, y: 540, width: w, height: 150, fill: body }, base);
        el("path", { d: `M${hx - 3} 541 L${hx + 9} 514 L${hx + w - 9} 514 L${hx + w + 3} 541 Z`, fill: C.n4 }, base);
        [[hx + 12, 558], [hx + 50, 558]].forEach(([x, y]) => el("rect", { x, y, width: 18, height: 24, fill: C.b1 }, base));
        el("rect", { x: hx + 10, y: 616, width: 30, height: 28, fill: C.b1 }, base);
        el("rect", { x: hx + 52, y: 640, width: 18, height: 50, fill: door }, base);
        // coal fires until the 1970s; TV aerials from the 1950s; solar and heat pumps today
        [e0, e1, e2].forEach((g) => puffs(g, hx + w, 488, 3, C.n2, 0.7));
        const aerial = (g) => el("path", { d: `M${hx + w - 2} 494 L${hx + w - 2} 470 M${hx + w - 12} 474 L${hx + w + 8} 474 M${hx + w - 10} 480 L${hx + w + 6} 480 M${hx + w - 8} 486 L${hx + w + 4} 486`, stroke: C.n5, "stroke-width": 1.6, fill: "none" }, g);
        if (hx !== 172) aerial(e1); aerial(e2);
        SVG.panelQuad(e3, [[hx + 11, 516], [hx + w - 11, 516], [hx + w - 2, 538], [hx + 2, 538]], 4, 2);
        fan(e3, hx + 30, 678, 7);
      });
      // 1900: the coalman with a sack, a woman in a long dress
      mid(e0, { x: 150, hairStyle: "short", hat: "cap", hatCol: C.n5, top: C.n4, bottom: C.n5, arms: { L: "carry" } });
      el("path", { d: "M126 664 Q124 646 136 648 L146 650 Q150 664 140 670 Z", fill: C.n5 }, e0);
      mid(e0, { x: 300, hairStyle: "bun", hairCol: C.br5, dress: C.n3, dressLen: "long", hat: "bonnet", hatCol: C.br4, flip: true });
      // 1950: children playing, a mother with a pram
      mid(e1, { x: 140, s: 0.18, kid: true, hairStyle: "short", hairCol: C.br5, top: C.b3, bottom: C.n4, arms: { R: "up" }, anim: "bob" });
      mid(e1, { x: 164, s: 0.18, kid: true, hairStyle: "bob", hairCol: C.br5, dress: C.o2, arms: { L: "up" }, anim: "bob" });
      const pram = (g, col) => { el("path", { d: "M262 690 L262 676 L282 676 L286 668 M262 682 L284 682", stroke: C.n5, "stroke-width": 2, fill: "none" }, g); el("circle", { cx: 266, cy: 692, r: 4, fill: C.n5 }, g); el("circle", { cx: 280, cy: 692, r: 4, fill: C.n5 }, g); el("path", { d: "M260 676 Q262 662 276 664 L282 676 Z", fill: col }, g); };
      mid(e1, { x: 300, hairStyle: "bob", hairCol: C.br5, dress: C.g4, arms: { R: "hold" }, flip: true }); pram(e1, C.n4);
      // 1975: the milkman, a mum with a pram
      mid(e2, { x: 150, hairStyle: "short", hat: "cap", hatCol: C.n4, top: C.w, bottom: C.n4, arms: { L: "carry" } });
      el("rect", { x: 140, y: 676, width: 10, height: 8, fill: C.w }, e2);
      mid(e2, { x: 300, hairStyle: "bun", hairCol: C.br5, dress: C.o2, dressLen: "long", arms: { R: "hold" }, flip: true }); pram(e2, C.b4);
      // today: on the phone, out for a run
      mid(e3, { x: 150, hairStyle: "long", hairCol: C.n5, top: C.g3, bottom: C.b5, arms: { R: "hold" } });
      el("rect", { x: 156.5, y: 660, width: 3, height: 5, fill: C.n5 }, e3);
      mid(e3, { x: 300, hairStyle: "short", hairCol: C.br5, top: C.o2, bottom: C.n4, anim: "run", flip: true }); }

    // a corner shop: grocer → baker → record shop → coffee shop
    { const [base, e0, e1, e2, e3] = part();
      el("rect", { x: 346, y: 540, width: 220, height: 150, fill: C.y1 }, base);
      el("rect", { x: 340, y: 532, width: 232, height: 10, fill: C.br4 }, base);
      [366, 438, 510].forEach((x) => el("rect", { x, y: 556, width: 36, height: 34, fill: C.b1 }, base));
      el("rect", { x: 356, y: 634, width: 150, height: 56, fill: C.b1 }, base);
      el("rect", { x: 520, y: 634, width: 34, height: 56, fill: C.n3 }, base);
      const fascia = (g, col, t, tc) => { el("rect", { x: 346, y: 606, width: 220, height: 22, fill: col }, g); label(g, 456, 622, t, { "font-size": 13, fill: tc || C.w }); };
      fascia(e0, C.br4, "GROCER");
      [[372, 0], [402, 1], [432, 0], [462, 1]].forEach(([x, k]) => { el("rect", { x, y: 664, width: 24, height: 26, rx: k ? 10 : 2, fill: k ? C.br4 : C.y4 }, e0); });
      mid(e0, { x: 488, y: 690, hairStyle: "short", hairCol: C.br5, top: C.w, bottom: C.n4, arms: { R: "hip" } });
      fascia(e1, C.y4, "BAKERY");
      [[376, 672], [404, 668], [432, 672], [460, 668]].forEach(([x, y]) => el("ellipse", { cx: x, cy: y, rx: 12, ry: 7, fill: C.o2 }, e1));
      el("rect", { x: 360, y: 678, width: 120, height: 4, fill: C.w }, e1);
      mid(e1, { x: 488, y: 690, hairStyle: "bun", hairCol: C.br5, dress: C.w, arms: { R: "forward" } });
      fascia(e2, C.o3, "RECORDS");
      [[376, 662], [404, 656], [432, 664], [460, 658]].forEach(([x, y]) => { el("circle", { cx: x, cy: y, r: 10, fill: C.n5 }, e2); el("circle", { cx: x, cy: y, r: 3, fill: C.o2 }, e2); });
      mid(e2, { x: 488, y: 690, hairStyle: "long", hairCol: C.br5, top: C.o2, bottom: C.b4, arms: { R: "forward" } });
      fascia(e3, C.g4, "COFFEE");
      [[380, 0], [440, 1]].forEach(([x, k]) => {
        el("rect", { x: x + 6, y: 670, width: 30, height: 3, fill: C.br4 }, e3); el("rect", { x: x + 19, y: 673, width: 3, height: 17, fill: C.br4 }, e3);
        el("path", { d: `M${x + 14} 670 L${x + 26} 670 L${x + 24} 660 L${x + 13} 660 Z`, fill: C.n4 }, e3);
        mid(e3, { x, y: 690, pose: "sit", hairStyle: k ? "bob" : "curly", hairCol: C.n5, top: k ? C.b3 : C.y3, bottom: C.n4, arms: { R: "table", L: "table" }, type: true });
      }); }
    tree(life, 610, 690, 2.4, C.g4);

    // an office: clerks with ledgers → telephones → typewriters → laptops, with solar on the roof today
    { const [base, e0, e1, e2, e3] = part();
      el("rect", { x: 660, y: 420, width: 220, height: 270, fill: C.n2 }, base);
      el("rect", { x: 654, y: 412, width: 232, height: 10, fill: C.n3 }, base);
      [510, 600, 690].forEach((f) => el("rect", { x: 660, y: f - 4, width: 220, height: 6, fill: C.n3 }, base));
      [672, 742, 812].forEach((wx) => [510, 600].forEach((f) => el("rect", { x: wx, y: f - 74, width: 58, height: 70, fill: C.b1 }, base)));
      el("rect", { x: 742, y: 630, width: 58, height: 60, fill: C.b2 }, base); el("path", { d: "M771 630 L771 690", stroke: C.n3, "stroke-width": 2 }, base);
      [672, 812].forEach((wx) => el("rect", { x: wx, y: 630, width: 58, height: 50, fill: C.b1 }, base));
      [672, 742, 812].forEach((wx, i) => [510, 600].forEach((f, j) => {
        const fl = f - 4, v = (i + j) % 3;
        el("rect", { x: wx + 22, y: fl - 19, width: 24, height: 3, fill: C.br4 }, base); el("rect", { x: wx + 43, y: fl - 16, width: 2, height: 16, fill: C.br4 }, base);
        // 1900: a clerk with a ledger, a lamp
        mid(e0, { x: wx + 16, y: fl, pose: "sit", hairStyle: "short", hairCol: C.br5, top: C.w, bottom: C.n5, arms: { R: "table", L: "table" } });
        el("rect", { x: wx + 26, y: fl - 22, width: 12, height: 3, fill: C.w }, e0); el("path", { d: `M${wx + 40} ${fl - 19} L${wx + 40} ${fl - 28} M${wx + 37} ${fl - 30} L${wx + 43} ${fl - 30}`, stroke: C.n4, "stroke-width": 1.5 }, e0); el("circle", { cx: wx + 40, cy: fl - 32, r: 3, fill: C.y2 }, e0);
        // 1950: a desk telephone and paper files
        mid(e1, { x: wx + 16, y: fl, pose: "sit", hairStyle: v ? "bob" : "short", hairCol: C.br5, top: [C.w, C.b4, C.br3][v], bottom: C.n4, arms: { R: "table", L: "table" } });
        el("path", { d: `M${wx + 28} ${fl - 19} L${wx + 36} ${fl - 19} L${wx + 35} ${fl - 23} L${wx + 29} ${fl - 23} Z M${wx + 27} ${fl - 25} L${wx + 37} ${fl - 25}`, stroke: C.n5, "stroke-width": 1.5, fill: C.n5 }, e1);
        el("rect", { x: wx + 48, y: fl - 30, width: 9, height: 30, fill: C.br4 }, e1);
        // 1975: a typist, a typewriter, a filing cabinet
        mid(e2, { x: wx + 16, y: fl, pose: "sit", hairStyle: v % 2 ? "bob" : "short", hairCol: C.br5, top: [C.o2, C.br4, C.w][v], bottom: C.n4, arms: { R: "table", L: "table" }, type: true });
        el("path", { d: `M${wx + 26} ${fl - 19} L${wx + 38} ${fl - 19} L${wx + 36} ${fl - 25} L${wx + 28} ${fl - 25} Z`, fill: C.n4 }, e2); el("rect", { x: wx + 29, y: fl - 30, width: 7, height: 5, fill: C.w }, e2);
        el("rect", { x: wx + 48, y: fl - 33, width: 9, height: 33, fill: C.n3 }, e2);
        // today: a laptop, a plant
        mid(e3, { x: wx + 16, y: fl, pose: "sit", hairStyle: v % 2 ? "curly" : "long", hairCol: C.n5, top: [C.g3, C.b3, C.y3][v], bottom: C.b5, arms: { R: "table", L: "table" }, type: true });
        el("path", { d: `M${wx + 28} ${fl - 19} L${wx + 30} ${fl - 30} L${wx + 41} ${fl - 30} L${wx + 39} ${fl - 19} Z`, fill: C.n4 }, e3); el("rect", { x: wx + 31, y: fl - 28, width: 8, height: 7, fill: C.b3, class: "twinkle" }, e3);
        el("rect", { x: wx + 49, y: fl - 8, width: 7, height: 8, fill: C.br4 }, e3); el("circle", { cx: wx + 52, cy: fl - 13, r: 6, fill: C.g4 }, e3);
      }));
      SVG.solarRow(e3, 668, 392, 4, 44, 10, { skew: -5, leg: 6, gap: 8 });
      mid(e0, { x: 720, hairStyle: "short", hat: "hat", hatCol: C.n5, top: C.n5, bottom: C.n5, coat: true, arms: { R: "hold" }, anim: "walk" });
      mid(e1, { x: 720, hairStyle: "short", hat: "hat", hatCol: C.br5, top: C.n3, bottom: C.n4, coat: true, arms: { L: "carry" }, anim: "walk" });
      mid(e2, { x: 720, hairStyle: "short", hat: "hat", hatCol: C.n5, top: C.br4, bottom: C.br5, coat: true, arms: { L: "carry" }, anim: "walk" });
      mid(e3, { x: 720, hairStyle: "bob", hairCol: C.br5, top: C.w, bottom: C.n5, arms: { R: "hold" }, anim: "walk" }); }

    // a forge and stables → a garage → a petrol station → an EV charging hub
    { const [base, e0, e1, e2, e3] = part("charging");
      // 1900: the smithy, a horse waiting to be shod
      el("rect", { x: 910, y: 610, width: 150, height: 80, fill: C.br3 }, e0); el("path", { d: "M902 612 L985 576 L1068 612 Z", fill: C.br5 }, e0);
      el("rect", { x: 930, y: 640, width: 46, height: 50, fill: C.n5 }, e0); el("circle", { cx: 953, cy: 668, r: 8, fill: C.o3, class: "twinkle" }, e0);
      label(e0, 1018, 632, "FORGE", { "font-size": 11, fill: C.w });
      el("rect", { x: 1036, y: 600, width: 12, height: 14, fill: C.br4 }, e0); puffs(e0, 1042, 596, 3, C.n2, 0.6);
      horse(e0, 1070, 690, 0.75, C.br4);
      mid(e0, { x: 1000, hairStyle: "short", hairCol: C.br5, top: C.w, bottom: C.br5, arms: { R: "forward" } });
      // canopy for the later eras
      const canopy = (g, stripe, text, tc) => {
        el("rect", { x: 918, y: 596, width: 7, height: 94, fill: C.n3 }, g); el("rect", { x: 1068, y: 596, width: 7, height: 94, fill: C.n3 }, g);
        el("rect", { x: 900, y: 578, width: 194, height: 20, fill: C.w }, g); el("rect", { x: 900, y: 592, width: 194, height: 6, fill: stripe }, g); label(g, 997, 590, text, { "font-size": 11, fill: tc });
      };
      // 1950: a garage with round-topped pumps and a rounded car
      canopy(e1, C.b4, "GARAGE", C.b4);
      [950, 1010].forEach((x) => { el("rect", { x, y: 652, width: 16, height: 38, fill: C.b4 }, e1); el("circle", { cx: x + 8, cy: 648, r: 9, fill: C.w }, e1); });
      mid(e1, { x: 990, hairStyle: "short", hat: "cap", hatCol: C.b4, top: C.w, bottom: C.b4, arms: { R: "forward" } });
      // 1975: petrol, an attendant, a price sign
      canopy(e2, C.o3, "PETROL", C.o4);
      [950, 1010].forEach((x) => { el("rect", { x, y: 646, width: 18, height: 44, fill: C.o3 }, e2); el("rect", { x: x + 3, y: 652, width: 12, height: 8, fill: C.w }, e2); el("path", { d: `M${x + 18} 664 C${x + 26} 664 ${x + 26} 676 ${x + 22} 682`, stroke: C.n5, "stroke-width": 2, fill: "none" }, e2); });
      mid(e2, { x: 990, hairStyle: "short", hat: "cap", hatCol: C.o4, top: C.o2, bottom: C.n4, arms: { R: "forward" } });
      el("rect", { x: 878, y: 600, width: 4, height: 90, fill: C.n4 }, e2); el("rect", { x: 864, y: 584, width: 32, height: 22, fill: C.w }, e2); label(e2, 880, 600, "72p", { "font-size": 11, fill: C.n5, "letter-spacing": 0 });
      // today: EV charging under a solar canopy
      canopy(e3, C.g4, "EV CHARGING", C.g5);
      SVG.panelQuad(e3, [[904, 566], [1090, 566], [1094, 578], [900, 578]], 10, 1);
      [940, 1050].forEach((x) => { el("rect", { x, y: 648, width: 12, height: 42, rx: 2, fill: C.g4 }, e3); el("rect", { x: x + 2, y: 654, width: 8, height: 6, fill: C.g1 }, e3); });
      el("path", { d: "M962 688 C962 674 968 672 980 670 L990 658 L1028 658 L1038 670 C1050 672 1056 678 1054 688 Z", fill: C.b3 }, e3);
      el("circle", { cx: 976, cy: 689, r: 7, fill: C.n5 }, e3); el("circle", { cx: 1040, cy: 689, r: 7, fill: C.n5 }, e3);
      el("path", { d: "M952 664 C958 670 960 672 964 676", stroke: C.n5, "stroke-width": 2, fill: "none" }, e3); }

    // a shop: tailor → radio shop → TV and radio → phones
    { const [base, e0, e1, e2, e3] = part("shop");
      el("rect", { x: 1120, y: 540, width: 160, height: 150, fill: C.g1 }, base);
      el("path", { d: "M1116 541 L1128 516 L1272 516 L1284 541 Z", fill: C.n4 }, base);
      [1140, 1220].forEach((x) => el("rect", { x, y: 556, width: 30, height: 34, fill: C.b1 }, base));
      el("rect", { x: 1128, y: 634, width: 110, height: 56, fill: C.b1 }, base); el("rect", { x: 1246, y: 634, width: 26, height: 56, fill: C.n3 }, base);
      const fascia = (g, col, t) => { el("rect", { x: 1120, y: 606, width: 160, height: 22, fill: col }, g); label(g, 1200, 622, t, { "font-size": 12, fill: C.w }); };
      fascia(e0, C.br5, "TAILOR");
      [1150, 1196].forEach((x, k) => { el("path", { d: `M${x - 9} 648 L${x + 9} 648 L${x + 6} 664 L${x + 11} 678 L${x - 11} 678 L${x - 6} 664 Z`, fill: k ? C.b4 : C.n4 }, e0); el("rect", { x: x - 1, y: 678, width: 2, height: 12, fill: C.br5 }, e0); el("circle", { cx: x, cy: 645, r: 3, fill: C.br4 }, e0); });
      fascia(e1, C.br4, "RADIO");
      [1140, 1176, 1212].forEach((x) => { el("path", { d: `M${x} 690 L${x} 664 Q${x} 652 ${x + 13} 652 Q${x + 26} 652 ${x + 26} 664 L${x + 26} 690 Z`, fill: C.br4 }, e1); el("circle", { cx: x + 13, cy: 668, r: 6, fill: C.y1 }, e1); });
      fascia(e2, C.b4, "TV & RADIO");
      [1136, 1172, 1208].forEach((x, k) => { el("rect", { x, y: 650, width: 26, height: 22, rx: 4, fill: C.br4 }, e2); el("rect", { x: x + 3, y: 653, width: 16, height: 16, rx: 3, fill: k === 1 ? C.b2 : C.n2 }, e2); el("rect", { x: x + 4, y: 672, width: 3, height: 18, fill: C.br5 }, e2); el("rect", { x: x + 19, y: 672, width: 3, height: 18, fill: C.br5 }, e2); });
      fascia(e3, C.n5, "PHONES");
      for (let k = 0; k < 6; k++) { el("rect", { x: 1140 + k * 15, y: 662, width: 8, height: 14, rx: 2, fill: C.n5 }, e3); el("rect", { x: 1141.5 + k * 15, y: 664, width: 5, height: 9, fill: C.b3 }, e3); }
      el("rect", { x: 1134, y: 676, width: 98, height: 4, fill: C.w }, e3); }

    // a tram stop → bus stops (right)
    { const [base, e0, e1, e2, e3] = part();
      el("rect", { x: 1418, y: 620, width: 3, height: 70, fill: C.n4 }, base);
      el("rect", { x: 1421, y: 620, width: 22, height: 10, fill: C.g4 }, e0); label(e0, 1432, 628, "TRAM", { "font-size": 6, fill: C.w, "letter-spacing": 0.3 });
      mid(e0, { x: 1350, hairStyle: "short", hat: "hat", hatCol: C.n5, top: C.n4, bottom: C.n5, coat: true, arms: { R: "hold" } });
      mid(e0, { x: 1376, hairStyle: "bun", hairCol: C.br5, dress: C.br4, dressLen: "long", hat: "bonnet", hatCol: C.y4, arms: { R: "carry" } });
      const shelter = (g) => { el("path", { d: "M1330 690 L1330 630 L1400 630 L1400 690", stroke: C.n4, "stroke-width": 3, fill: "none" }, g); el("rect", { x: 1326, y: 624, width: 78, height: 8, fill: C.n4 }, g); };
      [e1, e2, e3].forEach(shelter);
      el("rect", { x: 1421, y: 620, width: 14, height: 10, fill: C.o4 }, e1);
      mid(e1, { x: 1350, hairStyle: "short", hat: "hat", hatCol: C.br5, top: C.n3, bottom: C.n4, coat: true, arms: { L: "pocket" } });
      mid(e1, { x: 1374, hairStyle: "bob", hairCol: C.br5, dress: C.o2, arms: { R: "carry" } });
      el("rect", { x: 1421, y: 620, width: 14, height: 10, fill: C.o4 }, e2);
      mid(e2, { x: 1350, hairStyle: "short", hat: "hat", hatCol: C.br5, top: C.br4, bottom: C.n4, coat: true, arms: { L: "pocket" } });
      mid(e2, { x: 1374, hairStyle: "bun", hairCol: C.br5, dress: C.b4, dressLen: "long", arms: { R: "carry" } });
      el("rect", { x: 1421, y: 620, width: 14, height: 10, fill: C.g4 }, e3);
      el("rect", { x: 1336, y: 638, width: 26, height: 18, fill: C.n5 }, e3); el("rect", { x: 1338, y: 640, width: 22, height: 6, fill: C.g3, class: "twinkle" }, e3);
      mid(e3, { x: 1380, hairStyle: "long", hairCol: C.n5, top: C.y3, bottom: C.n4, arms: { R: "hold" } });
      el("path", { d: "M1440 690 L1446 662 L1452 662 M1436 690 L1452 690", stroke: C.g4, "stroke-width": 2.4, fill: "none" }, e3);
      el("circle", { cx: 1438, cy: 692, r: 3, fill: C.n5 }, e3); el("circle", { cx: 1452, cy: 692, r: 3, fill: C.n5 }, e3); }

    // street lamps: gas → warm electric → sodium orange → white LED
    { const [base, e0, e1, e2, e3] = part();
      [580, 1312].forEach((x) => {
        el("rect", { x: x - 1.5, y: 610, width: 3, height: 80, fill: C.n5 }, e0); el("path", { d: `M${x - 6} 610 L${x + 6} 610 L${x + 4} 596 L${x - 4} 596 Z`, fill: C.y2 }, e0); el("path", { d: `M${x - 7} 596 L${x + 7} 596 L${x} 588 Z`, fill: C.n5 }, e0);
        [[e1, C.y2], [e2, C.o2], [e3, C.w]].forEach(([g, col]) => {
          el("rect", { x: x - 1.5, y: 548, width: 3, height: 142, fill: C.n4 }, g); el("path", { d: `M${x} 550 Q${x} 540 ${x + 14} 540`, stroke: C.n4, "stroke-width": 3, fill: "none" }, g);
          el("rect", { x: x + 10, y: 538, width: 14, height: 5, rx: 2, fill: col }, g);
        });
      }); }


    // distribution: wooden poles along the near pavement, wires between them, a service wire into each building
    const distG = el("g", null, svg);
    const POLES = [24, 338, 642, 893, 1108, 1505], WY = 484;
    const dist = [], drops = [];
    POLES.forEach((x, k) => {
      el("rect", { x: x - 3, y: WY - 8, width: 6, height: 690 - WY + 8, fill: C.br4 }, distG);
      el("rect", { x: x - 22, y: WY, width: 44, height: 4, fill: C.br5 }, distG);
      [-18, 0, 18].forEach((dx) => el("rect", { x: x + dx - 1.5, y: WY - 5, width: 3, height: 5, fill: C.w }, distG));
      if (k === 1 || k === 4) { el("rect", { x: x + 4, y: WY + 16, width: 14, height: 22, rx: 3, fill: C.n2 }, distG); }   // a pole transformer
    });
    // the wires run out from the substation along the street, both ways
    const chain = (start, poles, endX) => [-18, 18].forEach((dx) => {
      let p = start, d = `M${p[0]} ${p[1]}`;
      poles.forEach((x) => { const q = [x + dx, WY]; d += span(p, q, 10); p = q; });
      d += span(p, [endX, WY + 2], 10);
      dist.push(el("path", { d, stroke: C.n4, "stroke-width": 1.1, fill: "none" }, distG));
    });
    chain([1366, 441], [1108, 893, 642, 338, 24], -200); chain([1486, 441], [1505], 1800);
    [[24, 18, 96, 548], [338, -18, 178, 548], [338, -18, 260, 548], [338, 18, 352, 548], [642, 18, 666, 470], [893, 18, 908, 582], [1108, 18, 1126, 548]].forEach(([px, dx, x, y]) => {
      const p = [px + dx, WY + 2];
      drops.push(el("path", { d: `M${p[0]} ${p[1]} Q${(p[0] + x) / 2} ${Math.max(p[1], y) + 6} ${x} ${y}`, stroke: C.n4, "stroke-width": 1, fill: "none" }, distG));
    });
    life = el("g", null, svg); const lifeFront = life;   // the road and the front pavement sit in front of the poles

    // --- THE ROAD (1px ≈ 3cm) ---
    { const [base, e0, e1, e2, e3] = part();
      const loop = (n, from, to, y, dur) => gsap.fromTo(n, { x: from, y }, { x: to, y, duration: dur, repeat: -1, ease: "none" });
      // 1900: an electric tram under its wire, a horse and cart
      el("path", { d: "M-100 582 L1700 582", stroke: C.n3, "stroke-width": 0.8 }, e0);
      const tram = el("g", null, e0);
      el("rect", { x: 0, y: -96, width: 230, height: 84, rx: 6, fill: C.o4 }, tram); el("rect", { x: -6, y: -104, width: 242, height: 10, rx: 4, fill: C.br5 }, tram);
      for (let k = 0; k < 6; k++) el("rect", { x: 12 + k * 36, y: -86, width: 28, height: 30, rx: 3, fill: C.y1 }, tram);
      el("rect", { x: 0, y: -48, width: 230, height: 6, fill: C.y3 }, tram);
      el("path", { d: "M120 -104 L176 -186", stroke: C.n5, "stroke-width": 2.5 }, tram);
      [40, 190].forEach((x) => el("circle", { cx: x, cy: -9, r: 10, fill: C.n5 }, tram));
      loop(tram, 1800, -360, 768, 18);
      const cart = el("g", null, e0);
      el("rect", { x: -110, y: -44, width: 80, height: 22, fill: C.br4 }, cart); el("circle", { cx: -88, cy: -14, r: 15, fill: "none", stroke: C.br5, "stroke-width": 4 }, cart); el("circle", { cx: -50, cy: -14, r: 15, fill: "none", stroke: C.br5, "stroke-width": 4 }, cart);
      el("path", { d: "M-30 -36 L10 -50", stroke: C.br5, "stroke-width": 3 }, cart);
      [-104, -88, -72].forEach((x) => el("rect", { x, y: -58, width: 14, height: 14, fill: C.y4 }, cart));
      horse(cart, 30, 0, 1, C.br4);
      P.person(cart, { x: -40, y: -40, s: 0.33, pose: "sit", hairStyle: "short", hat: "cap", hatCol: C.n5, top: C.br4, bottom: C.n5, arms: { R: "forward", L: "forward" } });
      loop(cart, -160, 1800, 792, 22);
      // 1950: a rounded car, a motorbike
      const car50 = el("g", null, e1);
      el("path", { d: "M0 -8 C0 -24 6 -30 24 -32 C34 -48 44 -50 70 -50 C96 -50 106 -48 116 -32 C134 -30 140 -24 140 -8 Z", fill: C.b4 }, car50);
      el("path", { d: "M40 -44 C46 -46 62 -46 66 -46 L66 -33 L30 -33 Z M72 -46 C82 -46 96 -46 104 -36 L106 -33 L72 -33 Z", fill: C.b1 }, car50);
      el("circle", { cx: 30, cy: -6, r: 10, fill: C.n5 }, car50); el("circle", { cx: 110, cy: -6, r: 10, fill: C.n5 }, car50);
      puffs(car50, -6, -10, 3, C.n2, 0.55);
      loop(car50, -220, 1820, 790, 11);
      const moto = cyclist(e1, 0, 0, 1.05, C.n5, C.br4, { hat: "cap", hatCol: C.n5, hairStyle: "short" });
      el("rect", { x: -6, y: -26, width: 18, height: 10, rx: 3, fill: C.o4 }, moto);
      loop(moto, 1780, -100, 746, 9);
      // 1975: a boxy saloon, a Mini
      const car = el("g", null, e2);
      el("path", { d: "M0 -8 L0 -26 L22 -28 L42 -46 L98 -46 L116 -28 L140 -26 L140 -8 Z", fill: C.o3 }, car);
      el("path", { d: "M46 -42 L68 -42 L68 -29 L32 -29 Z M73 -42 L95 -42 L110 -29 L73 -29 Z", fill: C.b1 }, car);
      el("rect", { x: -2, y: -14, width: 144, height: 4, fill: C.n2 }, car);
      el("circle", { cx: 28, cy: -6, r: 10, fill: C.n5 }, car); el("circle", { cx: 112, cy: -6, r: 10, fill: C.n5 }, car);
      puffs(car, -6, -10, 3, C.n2, 0.55);
      loop(car, -220, 1820, 790, 10);
      const mini = el("g", null, e2);
      el("path", { d: "M0 -6 L0 -22 Q2 -26 14 -27 L24 -42 L76 -42 L84 -27 Q98 -26 100 -20 L100 -6 Z", fill: C.y3 }, mini);
      el("path", { d: "M28 -38 L48 -38 L48 -28 L22 -28 Z M53 -38 L73 -38 L79 -28 L53 -28 Z", fill: C.b1 }, mini);
      el("circle", { cx: 20, cy: -5, r: 7, fill: C.n5 }, mini); el("circle", { cx: 80, cy: -5, r: 7, fill: C.n5 }, mini);
      puffs(mini, 104, -8, 3, C.n2, 0.45);
      loop(mini, 1800, -200, 744, 12);
      // today: an EV, an electric bus, a cyclist
      const ev = el("g", null, e3);
      el("path", { d: "M0 -8 C0 -24 8 -28 26 -30 L44 -46 L100 -46 L120 -30 C136 -28 142 -22 140 -8 Z", fill: C.b3 }, ev);
      el("path", { d: "M50 -42 L70 -42 L70 -31 L36 -31 Z M75 -42 L97 -42 L112 -31 L75 -31 Z", fill: C.b1 }, ev);
      el("circle", { cx: 28, cy: -6, r: 10, fill: C.n5 }, ev); el("circle", { cx: 112, cy: -6, r: 10, fill: C.n5 }, ev);
      loop(ev, -220, 1820, 790, 10);
      const bus = el("g", null, e3);
      el("rect", { x: 0, y: -100, width: 380, height: 92, rx: 10, fill: C.g4 }, bus);
      for (let k = 0; k < 8; k++) el("rect", { x: 14 + k * 44, y: -88, width: 36, height: 30, rx: 3, fill: C.b1 }, bus);
      el("rect", { x: 0, y: -50, width: 380, height: 6, fill: C.g5 }, bus);
      label(bus, 190, -24, "ELECTRIC", { "font-size": 16, fill: C.w });
      [50, 320].forEach((x) => el("circle", { cx: x, cy: -7, r: 13, fill: C.n5 }, bus));
      loop(bus, 1800, -480, 746, 16);
      { const cy = cyclist(e3, 0, 0, 1.05, C.o3, C.g3); gsap.fromTo(cy, { x: -220, y: 794 }, { x: 1820, y: 794, duration: 10, repeat: -1, ease: "none", delay: -5 }); } }   // the cyclist keeps the EV's pace, half a lap apart, so they never meet

    // --- FRONT PAVEMENT (1px ≈ 2.4cm): work, travel, speak, create ---
    // passers-by on the front pavement, dressed for each era, so the four scenes sit among ordinary street life
    { const [base, e0, e1, e2, e3] = part();
      const walker = (g, o, from, to, dur, y) => { const w = el("g", null, g); front(w, Object.assign({ x: 0, y: y || 872, anim: "walk", flip: to < from }, o)); gsap.fromTo(w, { x: from }, { x: to, duration: dur, repeat: -1, ease: "none" }); };
      walker(e0, { hairStyle: "short", hat: "hat", hatCol: C.n5, top: C.n4, bottom: C.n5, coat: true }, 1700, -100, 40, 876);
      walker(e0, { hairStyle: "bun", hairCol: C.br5, dress: C.br4, dressLen: "long", hat: "bonnet", hatCol: C.y4 }, -100, 1700, 46, 864);
      walker(e1, { hairStyle: "short", hat: "hat", hatCol: C.br5, top: C.n3, bottom: C.n4, coat: true, arms: { L: "carry" } }, 1700, -100, 38, 876);
      walker(e1, { hairStyle: "bob", hairCol: C.br5, dress: C.o2, arms: { R: "carry" } }, -100, 1700, 44, 864);
      walker(e2, { hairStyle: "long", hairCol: C.br5, top: C.o2, bottom: C.b4 }, 1700, -100, 36, 876);
      walker(e2, { hairStyle: "curly", hairCol: C.br5, top: C.br4, bottom: C.br5, arms: { L: "carry" } }, -100, 1700, 42, 864);
      walker(e3, { hairStyle: "short", hairCol: C.n5, top: C.b3, bottom: C.n4, arms: { R: "hold" } }, 1700, -100, 36, 876);
      walker(e3, { hairStyle: "bob", hairCol: C.br5, top: C.g3, bottom: C.b5, arms: { L: "carry" } }, -100, 1700, 42, 864); }
    // the four everyday scenes stand at irregular spots along the pavement, not in a labelled row
    const place = (gs, dx, dy) => gs.forEach((g) => g.setAttribute("transform", `translate(${dx} ${dy})`));
    // WORK — a newsboy → a postman → the commute with a briefcase → a laptop at a café table
    { const x = 700; const [base, e0, e1, e2, e3] = part(); place([base, e0, e1, e2, e3], -150, -8);
      front(e0, { x: x - 30, s: 0.32, kid: true, hairStyle: "short", hat: "cap", hatCol: C.br5, top: C.br3, bottom: C.br5, arms: { R: "up" } });
      { const pp = el("rect", { x: x - 24, y: 790, width: 16, height: 12, fill: C.w }, e0); }
      front(e0, { x: x + 30, hairStyle: "short", hat: "hat", hatCol: C.n5, top: C.n5, bottom: C.n4, coat: true, arms: { R: "hold" }, flip: true });
      el("rect", { x: x + 2, y: 810, width: 18, height: 14, fill: C.w }, e0);
      const post = front(e1, { x: x - 10, hairStyle: "short", hat: "cap", hatCol: C.n5, top: C.n4, bottom: C.n5, coat: true, arms: { R: "hold" }, anim: "walk" });
      el("path", { d: `M${x - 26} 800 L${x + 6} 832`, stroke: C.br5, "stroke-width": 2.5 }, e1); el("rect", { x: x - 2, y: 826, width: 22, height: 18, rx: 3, fill: C.br4 }, e1);
      { const [px, py] = post.hand("R"); el("rect", { x: px - 2, y: py - 6, width: 12, height: 8, fill: C.w }, e1); }
      const man = front(e2, { x: x - 30, hairStyle: "short", hat: "hat", hatCol: C.n5, top: C.br4, bottom: C.br5, coat: true, arms: { R: "carry" }, anim: "walk" });
      { const [bx, by] = man.hand("R"); el("rect", { x: bx - 9, y: by, width: 18, height: 13, rx: 2, fill: C.br5 }, e2); }
      el("rect", { x: x + 34, y: 818, width: 28, height: 50, fill: C.br4 }, e2); el("rect", { x: x + 30, y: 812, width: 36, height: 8, fill: C.o4 }, e2);
      label(e2, x + 48, 818, "NEWS", { "font-size": 6, fill: C.w, "letter-spacing": 0.5 });
      [0, 1, 2].forEach((k) => el("rect", { x: x + 37 + k * 8, y: 826 + k * 4, width: 7, height: 10, fill: C.w }, e2));
      el("rect", { x: x + 4, y: 836, width: 44, height: 4, fill: C.br4 }, e3); el("rect", { x: x + 24, y: 840, width: 4, height: 26, fill: C.br4 }, e3); el("rect", { x: x + 16, y: 865, width: 20, height: 3, fill: C.br4 }, e3);
      front(e3, { x: x - 26, pose: "sit", hairStyle: "curly", hairCol: C.n5, top: C.g3, bottom: C.b5, arms: { R: "table", L: "table" }, type: true });
      el("path", { d: `M${x + 10} 836 L${x + 28} 836 L${x + 31} 818 L${x + 15} 818 Z`, fill: C.n4 }, e3); el("path", { d: `M${x + 17} 833 L${x + 28} 833 L${x + 30} 821 L${x + 18} 821 Z`, fill: C.b3, class: "twinkle" }, e3);
      el("rect", { x: x + 36, y: 828, width: 7, height: 8, fill: C.w }, e3);
    }
    // TRAVEL — walking out with a parasol → a bicycle → waiting for the bus → an e-bike
    { const x = 930; const [base, e0, e1, e2, e3] = part(); place([base, e0, e1, e2, e3], -60, 12);
      const lady = front(e0, { x: x - 10, hairStyle: "bun", hairCol: C.br5, dress: C.b4, dressLen: "long", hat: "bonnet", hatCol: C.w, arms: { R: "up" }, anim: "walk" });
      { const [px, py] = lady.hand("R"); el("path", { d: `M${px - 26} ${py - 4} Q${px} ${py - 30} ${px + 26} ${py - 4} Z`, fill: C.o2 }, e0); el("path", { d: `M${px} ${py - 18} L${px} ${py + 4}`, stroke: C.n5, "stroke-width": 1.5 }, e0); }
      front(e0, { x: x + 34, hairStyle: "short", hat: "hat", hatCol: C.n5, top: C.br4, bottom: C.n4, coat: true, arms: { R: "forward" } });
      cyclist(e1, x, 866, 1.3, C.n5, C.br3, { hat: "hat", hatCol: C.br5, hairStyle: "short" });
      el("rect", { x: x + 34, y: 762, width: 3, height: 106, fill: C.n4 }, e2); el("rect", { x: x + 37, y: 762, width: 26, height: 18, fill: C.o4 }, e2); label(e2, x + 50, 775, "BUS", { "font-size": 9, fill: C.w, "letter-spacing": 0.5 });
      front(e2, { x: x - 10, hairStyle: "bob", hairCol: C.br5, dress: C.o2, coat: true, top: C.br4, arms: { R: "carry" } });
      front(e2, { x: x - 40, s: 0.3, kid: true, hairStyle: "short", hairCol: C.br5, top: C.y3, bottom: C.br5, arms: { R: "up" } });
      const eb = cyclist(e3, x, 866, 1.3, C.g4, C.o2);
      el("rect", { x: -6, y: -30, width: 10, height: 6, rx: 1, fill: C.g5 }, eb);
      gsap.to(eb, { y: "-=2", duration: 0.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
    }
    // SPEAK — posting a letter → the phone box → a queue for the phone box → a video call
    { const x = 1150; const [base, e0, e1, e2, e3] = part(); place([base, e0, e1, e2, e3], -90, -2);
      el("path", { d: `M${x - 12} 868 L${x - 12} 812 Q${x - 12} 800 ${x} 800 Q${x + 12} 800 ${x + 12} 812 L${x + 12} 868 Z`, fill: C.o4 }, e0); el("rect", { x: x - 14, y: 806, width: 28, height: 5, fill: C.o5 }, e0); el("rect", { x: x - 6, y: 820, width: 12, height: 3, fill: C.n5 }, e0);
      front(e0, { x: x + 34, hairStyle: "bun", hairCol: C.br5, dress: C.g4, dressLen: "long", arms: { R: "forward" }, flip: true });
      el("rect", { x: x + 10, y: 814, width: 12, height: 8, fill: C.w }, e0);
      const box = (g) => { el("rect", { x: x - 22, y: 762, width: 44, height: 106, rx: 3, fill: C.o4 }, g); el("rect", { x: x - 16, y: 776, width: 32, height: 84, fill: C.b1 }, g); };
      const mull = (g) => { el("path", { d: `M${x - 16} 804 L${x + 16} 804 M${x - 16} 832 L${x + 16} 832 M${x} 776 L${x} 860`, stroke: C.o4, "stroke-width": 2.5 }, g); el("rect", { x: x - 18, y: 766, width: 36, height: 7, fill: C.w }, g); };
      box(e1); front(e1, { x, y: 864, s: 0.4, hairStyle: "short", hairCol: C.br5, top: C.n3, bottom: C.n4, arms: { R: "up" } }); mull(e1);
      box(e2); front(e2, { x, y: 864, s: 0.4, hairStyle: "long", hairCol: C.br5, top: C.y3, bottom: C.br5, arms: { R: "up" } }); mull(e2);
      front(e2, { x: x + 42, hairStyle: "short", hairCol: C.br5, top: C.n4, bottom: C.n5, coat: true, arms: { L: "pocket" }, flip: true });
      const me = front(e3, { x: x - 6, hairStyle: "long", hairCol: C.n5, top: C.o2, bottom: C.b5, arms: { R: "hold", L: "down" } });
      const [hx, hy] = me.hand("R"); el("rect", { x: hx - 3, y: hy - 11, width: 6, height: 11, rx: 1.5, fill: C.n5 }, e3); el("rect", { x: hx - 2, y: hy - 9.5, width: 4, height: 7, fill: C.b3, class: "twinkle" }, e3);
      el("path", { d: `M${hx - 30} ${hy - 44} L${hx + 4} ${hy - 44} Q${hx + 10} ${hy - 44} ${hx + 10} ${hy - 38} L${hx + 10} ${hy - 28} Q${hx + 10} ${hy - 22} ${hx + 4} ${hy - 22} L${hx - 2} ${hy - 22} L${hx - 2} ${hy - 14} L${hx - 10} ${hy - 22} L${hx - 30} ${hy - 22} Q${hx - 36} ${hy - 22} ${hx - 36} ${hy - 28} L${hx - 36} ${hy - 38} Q${hx - 36} ${hy - 44} ${hx - 30} ${hy - 44} Z`, fill: C.w }, e3);
      [0, 1, 2].forEach((k) => el("circle", { cx: hx - 20 + k * 8, cy: hy - 33, r: 2, fill: C.n3 }, e3));
      front(e3, { x: x + 42, hairStyle: "bob", hairCol: C.br5, top: C.b3, bottom: C.n4, arms: { R: "hold" }, flip: true });
    }
    // CREATE — painting at an easel → a camera on a tripod → busking with a guitar → filming for an audience online
    { const x = 1370; const [base, e0, e1, e2, e3] = part(); place([base, e0, e1, e2, e3], 50, 10);
      el("path", { d: `M${x + 18} 868 L${x + 32} 800 L${x + 46} 868 M${x + 32} 800 L${x + 32} 868`, stroke: C.br4, "stroke-width": 3, fill: "none" }, e0);
      el("rect", { x: x + 14, y: 804, width: 36, height: 30, fill: C.w }, e0); el("path", { d: `M${x + 18} 828 L${x + 26} 816 L${x + 33} 824 L${x + 46} 810`, stroke: C.g4, "stroke-width": 2.5, fill: "none" }, e0); el("circle", { cx: x + 40, cy: 813, r: 3, fill: C.y3 }, e0);
      front(e0, { x: x - 18, hairStyle: "bun", hairCol: C.br5, dress: C.g4, dressLen: "long", arms: { R: "forward" } });
      el("path", { d: `M${x + 6} 868 L${x + 14} 820 L${x + 22} 868 M${x + 14} 820 L${x + 14} 868`, stroke: C.br5, "stroke-width": 2.5, fill: "none" }, e1);
      el("rect", { x: x + 2, y: 802, width: 24, height: 20, fill: C.n5 }, e1); el("circle", { cx: x + 26, cy: 812, r: 6, fill: C.n4 }, e1);
      front(e1, { x: x - 18, hairStyle: "short", hat: "hat", hatCol: C.br5, top: C.br4, bottom: C.n4, arms: { R: "forward" } });
      const busk = front(e2, { x: x - 6, hairStyle: "long", hairCol: C.br5, top: C.o2, bottom: C.b4, arms: { R: "forward", L: "forward" } });
      el("path", { d: `M${x - 20} 826 C${x - 30} 818 ${x - 26} 806 ${x - 14} 810 L${x + 2} 814 C${x + 10} 816 ${x + 8} 830 ${x - 2} 830 Z`, fill: C.br4 }, e2); el("path", { d: `M${x} 818 L${x + 30} 806`, stroke: C.br5, "stroke-width": 3 }, e2);
      el("path", { d: `M${x + 24} 868 L${x + 56} 868 L${x + 52} 858 L${x + 28} 858 Z`, fill: C.n4 }, e2);
      el("path", { d: `M${x + 36} 868 L${x + 28} 822 M${x + 36} 868 L${x + 44} 822 M${x + 36} 868 L${x + 36} 818`, stroke: C.n4, "stroke-width": 2.5, fill: "none" }, e3);
      el("rect", { x: x + 31, y: 806, width: 10, height: 14, rx: 2, fill: C.n5 }, e3); el("circle", { cx: x + 36, cy: 813, r: 11, fill: "none", stroke: C.y2, "stroke-width": 3 }, e3);
      front(e3, { x: x - 18, hairStyle: "short", hairCol: C.n5, top: C.y3, bottom: C.n4, arms: { R: "open", L: "hip" }, gesture: "R" });
    }

    // a year counter: 1900 → today
    const yr = el("text", { x: 1400, y: 150, "text-anchor": "end", "font-family": "Poppins", "font-weight": 600, "font-size": 64, fill: C.n4, text: "1900" }, svg);
    const yObj = { v: 1900 };

    sets.forEach((st) => st.forEach((g, k) => k && gsap.set(g, { opacity: 0 })));
    // beat 1: the street moves through the decades — 1950, 1975, today — while the year counts up
    const T = [beat(1), beat(1) + 0.32, beat(1) + 0.64];
    T.forEach((t0, k) => {
      sets.forEach((st, i) => {
        const t = t0 + (i / sets.length) * 0.12;
        tl.to(st[k], { opacity: 0, duration: 0.12 }, t);
        tl.to(st[k + 1], { opacity: 1, duration: 0.12 }, t + 0.04);
      });
      tl.to(yObj, { v: ERAS[k + 1], duration: 0.26, ease: "none", onUpdate: () => { yr.textContent = Math.round(yObj.v); } }, t0);
    });
    // beat 2: and yet, the grid stayed the same
    tl.to([lifeBack, lifeFront], { opacity: 0.35, duration: 0.3 }, beat(2));
    // ---------- I4–I6: the same street, now about the grid itself ----------
    {
      const tag = (x, y, t, w, dark) => { const g = el("g", { opacity: 0 }, svg); el("rect", { x: x - w / 2, y: y - 15, width: w, height: 28, rx: 4, fill: dark ? C.n5 : C.w }, g); label(g, x, y + 4, t, { "font-size": 11, fill: dark ? C.w : C.n4 }); return g; };

      // I4: power runs from the power station along the line and down into homes, shops and offices
      const feed = el("g", { opacity: 0 }, svg);
      lines.forEach((ln) => pulseAlong(feed, ln, 5, C.y3, 8, 3));
      branch.forEach((ln) => pulseAlong(feed, ln, 2, C.y3, 2.4, 3));
      const dropFlow = el("g", { opacity: 0 }, svg);
      dist.forEach((ln) => pulseAlong(dropFlow, ln, 4, C.y3, 6, 3));
      drops.forEach((p) => pulseAlong(dropFlow, p, 1, C.y3, 1.2, 2.6));
      const glow = el("g", { opacity: 0 }, svg);
      [90, 172, 254].forEach((hx) => { [[hx + 12, 558, 18, 24], [hx + 50, 558, 18, 24], [hx + 10, 616, 30, 28]].forEach(([x, y, w, h]) => el("rect", { x, y, width: w, height: h, fill: C.y2, opacity: 0.6 }, glow)); });
      [366, 438, 510].forEach((x) => el("rect", { x, y: 556, width: 36, height: 34, fill: C.y2, opacity: 0.6 }, glow));
      [1140, 1220].forEach((x) => el("rect", { x, y: 556, width: 30, height: 34, fill: C.y2, opacity: 0.6 }, glow));
      [672, 812].forEach((x) => el("rect", { x, y: 630, width: 58, height: 50, fill: C.y2, opacity: 0.45 }, glow));
      // I5: wind and solar join the same line; meters go digital — the line itself stays as it was
      const adds = el("g", { opacity: 0 }, svg);
      gridG.parentNode.insertBefore(adds, gridG.nextSibling);   // on the hills, behind the street
      [[10, 72], [100, 78], [190, 70], [280, 66]].forEach(([x, h], i) => SVG.turbine(ridgeAdds, x, ridgeY(x) + 2, h, { dur: 4 + i * 0.5 }));
      // a solar farm laid along the contours of the slope: level rows of tilted modules, each row stepping down the hill
      [206, 218, 230, 242].forEach((y) => {
        const xEnd = 300 + (y - 198) / ((334 - 198) / 660) - 10, x0 = xEnd - 108;
        [[x0, x0 + 52], [x0 + 56, xEnd]].forEach(([a0, a1]) => {
          SVG.panelQuad(ridgeAdds, [[a0, y], [a1, y], [a1 + 2, y + 7], [a0 + 2, y + 7]], 7, 2);
          [a0 + 6, a1 - 6].forEach((lx) => el("rect", { x: lx, y: y + 7, width: 1.6, height: 3, fill: C.n4 }, ridgeAdds));
        });
      });
      const greens = [el("path", { d: `M280 ${ridgeY(280) + 2} L580 ${ridgeY(580) + 2} Q650 300 700 ${hillY(700) - 60}`, stroke: C.g4, "stroke-width": 2, fill: "none" }, adds)];
      const meters = el("g", { opacity: 0 }, svg);
      [90, 172, 254].forEach((hx) => { el("rect", { x: hx + 44, y: 618, width: 12, height: 14, rx: 2, fill: C.n5 }, meters); el("rect", { x: hx + 46, y: 620, width: 8, height: 5, fill: C.g3, class: "twinkle" }, meters); });
      const tSame = tag(800, 110, "PLANNED, BUILT AND RUN THE SAME WAY", 340, true);
      // I6: a world faster and hungrier for power — everything greys out except what is waiting to connect
      // new demand, in the landscape where it stands: a data centre on the hill, more EV chargers, heat-pump homes, an electrified factory
      const waitNew = el("g", { opacity: 0 }, svg);
      gridG.parentNode.insertBefore(waitNew, gridG.nextSibling);   // the new buildings sit on the far hill, behind the street
      const dcx = 560, dcb = hillY(560) + 2;
      el("rect", { x: dcx - 70, y: dcb - 40, width: 140, height: 40, fill: C.n4 }, waitNew);
      for (let k = 0; k < 12; k++) el("rect", { x: dcx - 60 + (k % 6) * 22, y: dcb - 32 + Math.floor(k / 6) * 16, width: 8, height: 6, fill: C.n2 }, waitNew);   // dark: not yet powered
      const fx = 1210, fb = hillY(1210) + 2;
      el("rect", { x: fx - 34, y: fb - 26, width: 68, height: 26, fill: C.n2 }, waitNew);
      let fd = `M${fx - 34} ${fb - 26}`; for (let k = 0; k < 4; k++) fd += ` L${fx - 34 + k * 17} ${fb - 38} L${fx - 17 + k * 17} ${fb - 26}`; el("path", { d: fd + " Z", fill: C.n3 }, waitNew);
      const waitFront = el("g", { opacity: 0 }, svg);   // extra chargers and cars queuing at the hub
      [1000, 1024].forEach((x) => { el("rect", { x, y: 650, width: 10, height: 40, rx: 2, fill: C.n2 }, waitFront); el("rect", { x: x + 2, y: 656, width: 6, height: 5, fill: C.n3 }, waitFront); });
      // an orange tint filter: keeps each shape's light and shade, recoloured in the Ember orange
      const defs = svg.querySelector("defs") || el("defs", null, svg);
      const ft = el("filter", { id: "tint-" + mode, "color-interpolation-filters": "sRGB" }, defs);
      const o = [0.93, 0.45, 0.035], L = [0.3, 0.59, 0.11];
      el("feColorMatrix", { type: "matrix", values: o.map((c) => [...L.map((w) => (c * 0.55 + (1 - c) * 0.35) * w), 0, c * 0.45 + 0.08].map((v) => v.toFixed(3)).join(" ")).join(" ") + " 0 0 0 1 0" }, ft);
      // the waiting things: copies of the homes, the charging hub and the shop laid over the originals, plus the new data centre and factory
      const tintFar = el("g", { opacity: 0, filter: `url(#tint-${mode})` }, svg); gridG.parentNode.insertBefore(tintFar, waitNew); tintFar.appendChild(waitNew); gsap.set(waitNew, { opacity: 1 });
      const tintMid = el("g", { opacity: 0, filter: `url(#tint-${mode})` }, svg); svg.insertBefore(tintMid, distG);
      ["homes", "charging", "shop"].forEach((n) => named[n].forEach((g) => { const c = g.cloneNode(true); c.style.opacity = 1; c.removeAttribute("opacity"); tintMid.appendChild(c); }));
      tintMid.appendChild(waitFront); gsap.set(waitFront, { opacity: 1 });

      // --- timeline ---
      tl.to(yr, { opacity: 0, duration: 0.15 }, beat(3) + 0.02);
      tl.to([lifeBack, lifeFront], { opacity: 1, duration: 0.25 }, beat(3) + 0.05);
      tl.to(feed, { opacity: 1, duration: 0.2 }, beat(3) + 0.15);
      tl.to(dropFlow, { opacity: 1, duration: 0.2 }, beat(3) + 0.45);
      tl.to(glow, { opacity: 1, duration: 0.3 }, beat(3) + 0.45);
      // I5
      tl.to([adds, ridgeAdds], { opacity: 1, duration: 0.25 }, beat(4) + 0.05);
      greens.forEach((p) => drawOn(tl, p, beat(4) + 0.15, 0.3));
      tl.to(meters, { opacity: 1, duration: 0.2 }, beat(4) + 0.3);
      tl.to(tSame, { opacity: 1, duration: 0.2 }, beat(4) + 0.55);
      // I6
      tl.to(tSame, { opacity: 0, duration: 0.12 }, beat(5));
      const grey = [...svg.children].filter((n) => n.tagName !== "defs" && n !== tintFar && n !== tintMid);
      gsap.set(grey, { filter: "grayscale(0)" });
      tl.to(grey, { filter: "grayscale(1)", duration: 0.3 }, beat(5) + 0.05);
      tl.to([tintFar, tintMid], { opacity: 1, duration: 0.3 }, beat(5) + 0.15);
      tl.to([feed, dropFlow], { opacity: 0, duration: 0.25 }, beat(5) + 0.1);
    }
    // smoke in this scene is distant or small-scale: short drift so it stays near its chimney
    svg.querySelectorAll(".puff").forEach((c) => c.classList.add("puff--sm"));
    hold(tl, 5);
    return tl;
  }

  /* ============ 7. THE FIRST GRIDS — built out from central stations; out of step today ============ */
  const remade = (svg) => town(svg, "remade");


  /* ============ K. ELECTROSTATES — a world map (land only, Robinson), with small landscapes rising where the story goes ============ */
  function electro(svg) {
    const tl = gsap.timeline({ paused: true });
    // step 1 of this section is the Act 3 title, so the map's beats start one step later. The 13 cards are spread evenly over the
    // whole timeline (DUR), so each beat is pinned to its own card: it starts just before that card reaches the middle of the screen.
    const DUR = 13.2, SP = (DUR - 0.05) / 12;
    const B = (i) => Math.max(0, (i + 1) * SP - 0.55);
    el("rect", { x: 0, y: 0, width: 1600, height: 900, fill: C.w }, svg);
    const defs = svg.querySelector("defs") || el("defs", null, svg);
    // the land: one outline, no borders, kept out of the hand-drawn wobble so the coastlines stay true
    el("path", { d: window.WORLD_LAND, fill: C.g1, stroke: C.n2, "stroke-width": 0.8, "stroke-dasharray": "none", "stroke-linejoin": "round" }, svg);

    // projected positions (same Robinson projection as the land)
    const PT = {"brussels":[780,242],"northsea":[778,223],"northsea2":[786,226],"baltic":[824,221],"denmark":[795,218],"germanyN":[798,231],"spainS":[744,302],"spainC":[749,292],"portugal":[732,294],"franceS":[768,273],"italyS":[819,290],"greece":[846,294],"germanyS":[804,253],"poland":[832,237],"ireland":[737,233],"scotland":[753,216],"romania":[855,267],"sweden":[816,194],"beijing":[1203,292],"shanghai":[1238,333],"innermong":[1180,285],"gansu":[1133,292],"xinjiang":[1087,278],"qinghai":[1132,310],"guangdong":[1215,370],"sichuan":[1170,336],"wuhan":[1211,336],"hebei":[1200,301],"shandong":[1216,308],"fujianSea":[1243,357],"jiangsuSea":[1236,322],"ningxia":[1168,304],"yunnan":[1164,362],"dc":[469,297],"texasW":[365,329],"texasC":[377,334],"iowa":[412,283],"kansas":[388,299],"california":[300,310],"nevada":[319,299],"arizona":[326,322],"oklahoma":[384,313],"pennsylvania":[468,287],"wyoming":[364,278],"gulfcoast":[390,338],"ndakota":[397,258],"westvirginia":[453,299],"newmexico":[350,317],"illinois":[426,290],"massOff":[498,288],"georgia":[434,327],"colorado":[360,297],"jakarta":[1197,507],"vietnamS":[1203,424],"vietnamN":[1186,380],"thailand":[1170,408],"philippines":[1251,406],"mindanao":[1271,443],"malaysia":[1178,459],"sumatra":[1174,480],"java":[1212,512],"borneo":[1228,473],"sulawesi":[1252,487],"myanmar":[1147,380],"cambodia":[1188,420],"laos":[1176,390],"singapore":[1186,472],"qatar":[966,360],"hormuz":[985,356],"arabsea":[1010,385],"india_s":[1070,441],"srilanka":[1093,450],"malacca":[1168,459],"scs":[1206,441],"vietSea":[1205,413],"oregon":[319,266],"dallas":[382,325],"iowaDC":[411,285],"virginiaDC":[467,297],"phoenix":[324,323],"quebec":[504,261],"queretaro":[355,382],"saopaulo":[573,587],"santiago":[486,633],"dublin":[743,231],"frankfurt":[795,246],"amsterdam":[782,235],"stockholm":[826,205],"paris":[772,251],"madrid":[748,290],"milan":[797,267],"london":[764,239],"beijingDC":[1203,292],"shanghaiDC":[1238,333],"guizhou":[1185,354],"shenzhen":[1218,373],"tokyo":[1301,312],"seoul":[1249,304],"singaporeDC":[1186,472],"johor":[1185,469],"jakartaDC":[1197,507],"mumbai":[1054,390],"chennai":[1087,417],"sydney":[1350,636],"melbourne":[1317,654],"johannesburg":[872,600],"lagos":[773,448],"nairobi":[910,484],"uae":[978,364],"riyadh":[947,363],"cairo":[884,338],"istanbul":[872,287],"bangkok":[1169,414],"manila":[1252,410],"hcmc":[1195,428],"delhi":[1066,345]};
    const dotsAt = [[797, 196], [760, 235], [800, 242], [798, 220], [747, 292], [737, 329], [895, 297], [880, 352], [919, 436], [913, 476], [855, 613], [1074, 376], [1038, 343],
      [1190, 404], [1207, 338], [1254, 309], [1295, 308], [1223, 487], [1296, 594], [389, 297], [358, 371], [455, 459], [574, 576], [481, 590], [542, 632]];

    // K1: electrostates light up across the map
    const dots = el("g", null, svg);
    const dotList = dotsAt.map(([x, y], i) => { const d = el("g", null, dots); el("circle", { cx: x, cy: y, r: 4.5, fill: C.g4 }, d); const ring = el("circle", { cx: x, cy: y, r: 5, fill: "none", stroke: C.g3, "stroke-width": 1.5 }, d); gsap.fromTo(ring, { attr: { r: 5 }, opacity: 0.9 }, { attr: { r: 16 }, opacity: 0, duration: 2.2, repeat: -1, delay: (i % 7) * 0.3, ease: "power1.out" }); return d; });

    // ---------- a small kit drawn at map scale (the camera zooms ×3 onto it) ----------
    const pop = (g, x, y) => { gsap.set(g, { scale: 0, svgOrigin: `${x} ${y}` }); return g; };
    const item = (parent, [x, y], draw, k) => { const g = el("g", null, parent); const inner = k ? el("g", { transform: `translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})` }, g) : g; draw(inner, x, y); return pop(g, x, y); };
    const turbine = (p, h) => (g, x, y) => SVG.turbine(g, x, y, (h || 9) * 1.6, { dur: 2.4 + ((x * 7) % 10) / 10 });
    const windFarm = (h) => (g, x, y) => [[-5.5, 0.8], [0, -0.8], [5.5, 1]].forEach(([dx, dy]) => SVG.turbine(g, x + dx, y + dy, (h || 8) * 1.6, { dur: 2.4 + ((x + dx) % 3) / 3 }));
    const solarField = (w) => (g, x, y) => { w = (w || 9) * 1.5; for (let r = 0; r < 3; r++) { const yy = y - 5 + r * 2.4, xx = x - w / 2 + r * 0.6; SVG.panelQuad(g, [[xx, yy], [xx + w, yy], [xx + w + 0.8, yy + 1.8], [xx + 0.8, yy + 1.8]], 6, 1); } };
    const car = (col) => (g, x, y) => { el("path", { d: `M${x - 2.4} ${y} C${x - 2.4} ${y - 0.9} ${x - 2} ${y - 1.1} ${x - 1.3} ${y - 1.2} L${x - 0.7} ${y - 2} L${x + 1} ${y - 2} L${x + 1.6} ${y - 1.2} C${x + 2.3} ${y - 1.1} ${x + 2.5} ${y - 0.6} ${x + 2.5} ${y} Z`, fill: col }, g); el("circle", { cx: x - 1.3, cy: y, r: 0.45, fill: C.n5 }, g); el("circle", { cx: x + 1.4, cy: y, r: 0.45, fill: C.n5 }, g); };
    const charger = (g, x, y) => el("rect", { x: x - 0.35, y: y - 2.2, width: 0.8, height: 2.2, fill: C.g4 }, g);
    const evBay = (cols) => (g, x, y) => { charger(g, x - 3.4, y); cols.forEach((c, i) => car(c)(g, x + i * 5.2, y)); };
    const puffsMini = (g, x, y) => { for (let k = 0; k < 3; k++) { const c = el("circle", { cx: x, cy: y, r: 0.8, fill: C.n2 }, g); gsap.fromTo(c, { attr: { cy: y, r: 0.7 }, opacity: 0.9 }, { attr: { cy: y - 5, r: 1.8 }, opacity: 0, duration: 2.4, repeat: -1, ease: "none", delay: -k * 0.8 }); } };
    const coalPlant = (g, x, y) => { el("rect", { x: x - 3, y: y - 3, width: 5, height: 3, fill: C.n3 }, g); el("rect", { x: x + 1.2, y: y - 7.5, width: 1.1, height: 4.5, fill: C.n4 }, g); el("path", { d: `M${x - 5.5} ${y} C${x - 5.8} ${y - 2} ${x - 5} ${y - 3} ${x - 5.2} ${y - 4.5} L${x - 3.4} ${y - 4.5} C${x - 3.6} ${y - 3} ${x - 2.8} ${y - 2} ${x - 3.1} ${y} Z`, fill: C.n1 }, g); puffsMini(g, x + 1.7, y - 8); };
    const pumpjack = (g, x, y) => { el("path", { d: `M${x - 2} ${y} L${x} ${y - 3} L${x + 2} ${y}`, stroke: C.n4, "stroke-width": 0.5, fill: "none" }, g); const beam = el("g", null, g); el("rect", { x: x - 3, y: y - 3.4, width: 6, height: 0.8, fill: C.n4 }, beam); el("path", { d: `M${x - 3.6} ${y - 4} L${x - 2.6} ${y - 4} L${x - 2.6} ${y - 2} L${x - 3.6} ${y - 2} Z`, fill: C.n4 }, beam); gsap.fromTo(beam, { rotation: -10, svgOrigin: `${x} ${y - 3}` }, { rotation: 10, svgOrigin: `${x} ${y - 3}`, duration: 1.2, repeat: -1, yoyo: true, ease: "sine.inOut" }); el("rect", { x: x - 3.4, y: y - 2, width: 0.5, height: 2, fill: C.n3 }, g); };
    const refinery = (g, x, y) => { [[-3, 2.4], [0, 3], [3, 2]].forEach(([dx, r]) => el("rect", { x: x + dx - r / 2, y: y - r * 1.4, width: r, height: r * 1.4, rx: 0.4, fill: C.n2 }, g)); el("rect", { x: x + 4.6, y: y - 6, width: 0.8, height: 6, fill: C.n4 }, g); puffsMini(g, x + 5, y - 6.5); };
    const dcMini = (g, x, y) => { el("rect", { x: x - 3.4, y: y - 3.2, width: 6.8, height: 3.2, fill: C.n4 }, g); for (let k = 0; k < 4; k++) el("rect", { x: x - 2.7 + k * 1.6, y: y - 2.2, width: 0.7, height: 0.7, fill: C.g3, class: "twinkle", style: `animation-delay:${-k * 0.3}s` }, g); el("rect", { x: x - 3, y: y - 4, width: 2, height: 0.8, fill: C.n2 }, g); el("rect", { x: x + 0.4, y: y - 4, width: 2, height: 0.8, fill: C.n2 }, g); const ring = el("circle", { cx: x, cy: y - 1.6, r: 3, fill: "none", stroke: C.g3, "stroke-width": 0.6 }, g); gsap.fromTo(ring, { attr: { r: 3 }, opacity: 0.8 }, { attr: { r: 9 }, opacity: 0, duration: 2, repeat: -1, ease: "power1.out", delay: -((x + y) % 20) / 10 }); };

    // ---------- flags: the design is drawn once, then cut into thin vertical strips that ride a travelling wave, with light and shade on each fold ----------
    let fid = 0;
    const star = (g, cx, cy, r, fill, rot) => { let d = ""; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + (rot || 0) + k * Math.PI / 5, rr = k % 2 ? r * 0.382 : r; d += (k ? " L" : "M") + (cx + Math.cos(a) * rr).toFixed(2) + " " + (cy + Math.sin(a) * rr).toFixed(2); } el("path", { d: d + " Z", fill }, g); };
    const flag = ([x, y], draw, k, aspect) => {
      const H = 40, W = H * (aspect || 1.5), N = 24;           // design units
      const sc = 0.5 * (k || 1) * 0.42;                       // design units → map units (cloth ~ 12 × 8 map units at k = 1)
      const poleH = 46 * (k || 1) * 0.42 * 1.0 + 8;
      const outer = el("g", { "data-noink": "" }, svg);
      const g = el("g", null, outer);
      // the pole: a slim mast with a highlight, a gilt finial and a small stone base
      const pw = 0.9;
      el("path", { d: `M${x - 2.2} ${y + 0.6} L${x + 2.2} ${y + 0.6} L${x + 1.6} ${y - 1.2} L${x - 1.6} ${y - 1.2} Z`, fill: C.n2 }, g);
      el("rect", { x: x - pw / 2, y: y - poleH, width: pw, height: poleH - 1, fill: C.n4 }, g);
      el("rect", { x: x - pw / 2 + 0.15, y: y - poleH, width: 0.25, height: poleH - 1, fill: C.n2 }, g);
      el("circle", { cx: x, cy: y - poleH - 0.6, r: 0.8, fill: "#CC9900" }, g);
      // the design, kept in defs and reused by every strip
      const id = "fl" + (++fid);
      const design = el("g", { id: id + "d" }, defs); draw(design, W, H);
      const cloth = el("g", { transform: `translate(${x + pw / 2} ${y - poleH + 0.4}) scale(${sc})` }, g);
      const strips = [];
      for (let i = 0; i < N; i++) {
        const x0 = (i * W) / N, x1 = ((i + 1) * W) / N + 0.6;
        const cp = el("clipPath", { id: `${id}c${i}` }, defs); el("rect", { x: x0, y: -2, width: x1 - x0, height: H + 4 }, cp);
        const sg = el("g", { "clip-path": `url(#${id}c${i})` }, cloth);
        el("use", { href: `#${id}d` }, sg);
        const sh = el("rect", { x: x0, y: 0, width: x1 - x0, height: H, fill: C.n5, opacity: 0 }, sg);
        strips.push({ sg, sh, u: (i + 0.5) / N });
      }
      let t = fid * 1.9;
      const amp = H * 0.09;
      const wave = (u) => Math.sin(u * 7 - t) * amp * Math.pow(u, 0.8) + u * H * 0.04;   // free end hangs a touch lower
      gsap.ticker.add(() => {
        t += 0.06;
        strips.forEach(({ sg, sh, u }) => {
          sg.setAttribute("transform", `translate(0 ${wave(u).toFixed(2)})`);
          const slope = Math.cos(u * 7 - t) * Math.pow(u, 0.8);
          sh.setAttribute("fill", slope > 0 ? "#192238" : "#FFFFFF");
          sh.setAttribute("opacity", (Math.abs(slope) * 0.22).toFixed(3));
        });
      });
      gsap.set(g, { scaleY: 0, svgOrigin: `${x} ${y}` });
      return g;
    };
    const flagEU = (g, w, h) => {
      el("rect", { x: 0, y: 0, width: w, height: h, fill: "#003399" }, g);
      for (let k = 0; k < 12; k++) { const a = -Math.PI / 2 + k * Math.PI / 6; star(g, w / 2 + Math.cos(a) * h / 3, h / 2 + Math.sin(a) * h / 3, h / 18, "#FFCC00"); }
    };
    const flagCN = (g, w, h) => {
      const u = w / 30;
      el("rect", { x: 0, y: 0, width: w, height: h, fill: "#EE1C25" }, g);
      star(g, 5 * u, 5 * u, 3 * u, "#FFFF00");
      [[10, 2], [12, 4], [12, 7], [10, 9]].forEach(([cx, cy]) => star(g, cx * u, cy * u, u, "#FFFF00", Math.atan2(5 - cy, 5 - cx) + Math.PI / 2));   // each small star points at the large one
    };
    const flagUS = (g, w, h) => {
      for (let i = 0; i < 13; i++) el("rect", { x: 0, y: (i * h) / 13, width: w, height: h / 13 + 0.05, fill: i % 2 ? "#FFFFFF" : "#B22234" }, g);
      const cw = w * 0.4, ch = (h * 7) / 13;
      el("rect", { x: 0, y: 0, width: cw, height: ch, fill: "#3C3B6E" }, g);
      for (let r = 0; r < 9; r++) { const n = r % 2 ? 5 : 6; for (let c = 0; c < n; c++) star(g, (cw / 12) * (1 + 2 * c + (r % 2)), (ch / 10) * (1 + r), h * 0.0308, "#FFFFFF"); }
    };
    const flagASEAN = (g, w, h) => {
      el("rect", { x: 0, y: 0, width: w, height: h, fill: "#0D3A9B" }, g);
      const cx = w / 2, cy = h / 2, R = h * 0.36;
      el("circle", { cx, cy, r: R, fill: "#FFFFFF" }, g); el("circle", { cx, cy, r: R * 0.93, fill: "#EF3340" }, g);
      // the emblem: ten upright stalks of paddy in a sheaf, straight at the top, pinched at the waist where they are tied, flaring again at the base
      const Y = "#FFCD00", top = cy - R * 0.55, shoulder = cy - R * 0.1, waist = cy + R * 0.18, foot = cy + R * 0.64, sw = R * 0.058;
      for (let k = 0; k < 10; k++) {
        const f = (k - 4.5) / 4.5, xt = cx + f * R * 0.39, xw = cx + f * R * 0.2, xb = cx + f * R * 0.4;
        const m1 = (shoulder + waist) / 2, m2 = (waist + foot) / 2;   // vertical tangents at every join give the hourglass
        el("path", { d: `M${xt.toFixed(2)} ${top.toFixed(2)} L${xt.toFixed(2)} ${shoulder.toFixed(2)} C${xt.toFixed(2)} ${m1.toFixed(2)} ${xw.toFixed(2)} ${m1.toFixed(2)} ${xw.toFixed(2)} ${waist.toFixed(2)} C${xw.toFixed(2)} ${m2.toFixed(2)} ${xb.toFixed(2)} ${m2.toFixed(2)} ${xb.toFixed(2)} ${foot.toFixed(2)}`, stroke: Y, "stroke-width": sw, fill: "none" }, g);
      }
    };

    // ---------- each region is a tableau: a little landscape standing on an ellipse of ground, as in the earlier map ----------
    // drawn in local units around (0,0) = the middle of the ground; k scales the whole tableau onto the map
    const S5 = { br5: "#6D5A56", br4: "#857572", br2: "#D8D5D4", o3: "#EE7309", y1: "#FFF4A3" };
    const tableau = (parent, [x, y], k, ground) => {
      const wrap = el("g", null, parent);
      const g = el("g", { transform: `translate(${x} ${y}) scale(${k})` }, wrap);
      el("ellipse", { cx: 0, cy: 3, rx: 72, ry: 13, fill: ground || C.g2 }, g);
      const base = el("g", null, g), fossil = el("g", null, g), green = el("g", null, g), front = el("g", null, g);
      gsap.set(wrap, { scale: 0, svgOrigin: `${x} ${y}` });
      return { wrap, g, base, fossil, green, front, x, y, k };
    };
    const T = {   // local drawing kit (ground line at y = 0)
      house: (g, x, w, h, body, roof, solar) => { el("rect", { x: x - w / 2, y: -h, width: w, height: h, fill: body }, g); el("path", { d: `M${x - w / 2 - 2} ${-h} L${x} ${-h - w * 0.45} L${x + w / 2 + 2} ${-h} Z`, fill: roof }, g); el("rect", { x: x - w / 4 - 1, y: -h * 0.65, width: w / 4, height: h * 0.32, fill: C.y2 }, g); if (solar) SVG.panelQuad(g, [[x + 1, -h - w * 0.4], [x + w / 2 - 1, -h - 2], [x + w / 2 - 5, -h - 1], [x - 2, -h - w * 0.32]], 2, 1); },
      block: (g, x, w, h, col) => { el("rect", { x, y: -h, width: w, height: h, fill: col }, g); for (let r = 0; r < Math.floor((h - 6) / 8); r++) for (let c = 0; c < Math.floor((w - 3) / 6); c++) el("rect", { x: x + 3 + c * 6, y: -h + 4 + r * 8, width: 3, height: 4, fill: C.y2 }, g); },
      turbine: (g, x, h, d) => SVG.turbine(g, x, 0, h, { dur: d || 3 }),
      solar: (g, x, w, rows) => { for (let r = 0; r < (rows || 2); r++) { const yy = -9 + r * 5, xx = x + r * 2; SVG.panelQuad(g, [[xx, yy], [xx + w, yy], [xx + w + 2, yy + 3.5], [xx + 2, yy + 3.5]], Math.round(w / 4), 1); el("rect", { x: xx + 3, y: yy + 3.5, width: 1, height: 2.5, fill: C.n4 }, g); el("rect", { x: xx + w - 3, y: yy + 3.5, width: 1, height: 2.5, fill: C.n4 }, g); } },
      ev: (g, x, col) => { el("path", { d: `M${x - 9} -1 C${x - 9} -5 ${x - 7} -6 ${x - 4} -6 L${x - 2} -9.5 L${x + 5} -9.5 L${x + 8} -6 C${x + 10} -6 ${x + 10} -3 ${x + 10} -1 Z`, fill: col }, g); el("circle", { cx: x - 5, cy: -1, r: 2, fill: C.n5 }, g); el("circle", { cx: x + 6, cy: -1, r: 2, fill: C.n5 }, g); },
      charger: (g, x) => { el("rect", { x: x - 1.5, y: -11, width: 3.5, height: 11, rx: 1, fill: C.g4 }, g); el("rect", { x: x - 0.5, y: -9, width: 1.5, height: 2, fill: C.g1 }, g); },
      hpump: (g, x) => { el("rect", { x: x - 3.5, y: -6, width: 7, height: 6, fill: C.n1 }, g); el("circle", { cx: x, cy: -3, r: 2, fill: C.n3 }, g); },
      smoke: (g, x, y) => { for (let k = 0; k < 3; k++) { const c = el("circle", { cx: x, cy: y, r: 3, fill: C.n2 }, g); gsap.fromTo(c, { attr: { cy: y, r: 2.5 }, opacity: 0.9 }, { attr: { cy: y - 18, r: 6 }, opacity: 0, duration: 2.6, repeat: -1, ease: "none", delay: -k * 0.85 }); } },
      chimneyPlant: (g, x) => { el("path", { d: `M${x - 26} 0 C${x - 28} -10 ${x - 23} -16 ${x - 25} -24 L${x - 12} -24 C${x - 14} -16 ${x - 9} -10 ${x - 11} 0 Z`, fill: C.n1 }, g); el("rect", { x: x - 8, y: -14, width: 22, height: 14, fill: C.n2 }, g); el("rect", { x: x + 6, y: -40, width: 5, height: 26, fill: C.n3 }, g); T.smoke(g, x + 8.5, -43); T.smoke(g, x - 18, -27); },
      pumpjack: (g, x) => { el("rect", { x: x - 14, y: -1.5, width: 26, height: 1.5, fill: C.n3 }, g); el("path", { d: `M${x - 4} -1.5 L${x} -14 L${x + 4} -1.5`, stroke: C.n4, "stroke-width": 1.6, fill: "none", "stroke-linejoin": "round" }, g); el("rect", { x: x + 6, y: -6, width: 4, height: 4.5, fill: C.n4 }, g); const beam = el("g", null, g); el("rect", { x: x - 9, y: -15.2, width: 17, height: 2.2, rx: 0.6, fill: C.n4 }, beam); el("path", { d: `M${x - 9} -17 Q${x - 13} -14 ${x - 9} -11 Z`, fill: C.n4 }, beam); el("path", { d: `M${x - 11.5} -11 L${x - 11.5} -1.5`, stroke: C.n5, "stroke-width": 0.5 }, beam); gsap.fromTo(beam, { rotation: -8, svgOrigin: `${x} -14` }, { rotation: 8, svgOrigin: `${x} -14`, duration: 1.4, repeat: -1, yoyo: true, ease: "sine.inOut" }); },
      tanks: (g, x) => { [[0, 9], [20, 9]].forEach(([dx, r]) => { el("rect", { x: x + dx - r, y: -r * 1.1, width: r * 2, height: r * 1.1, fill: C.w }, g); el("ellipse", { cx: x + dx, cy: -r * 1.1, rx: r, ry: r * 0.35, fill: C.n1 }, g); }); el("rect", { x: x - 12, y: -4, width: 44, height: 2, fill: C.n3 }, g); },
      dc: (g, x, w) => { el("rect", { x: x - w / 2, y: -15, width: w, height: 15, fill: C.n4 }, g); for (let k = 0; k < Math.floor(w / 7); k++) el("rect", { x: x - w / 2 + 3 + k * 7, y: -10, width: 3, height: 3, fill: C.g3, class: "twinkle", style: `animation-delay:${-k * 0.3}s` }, g); for (let k = 0; k < Math.floor(w / 13); k++) el("rect", { x: x - w / 2 + 3 + k * 13, y: -19, width: 9, height: 4, fill: C.n2 }, g); },
      tree: (g, x, s) => { s = s || 1; el("rect", { x: x - 1.2 * s, y: -8 * s, width: 2.4 * s, height: 8 * s, fill: S5.br4 }, g); el("circle", { cx: x, cy: -13 * s, r: 6 * s, fill: C.g4 }, g); }
    };

    // ---------- regional details ----------
    // Ground: an ellipse (cx 0, cy 3, rx 72, ry 13). Three rows stand on it — back (y −5), middle (y +1), front (y +8) —
    // each with its own base / fossil / green layers, drawn back to front so nothing overlaps the wrong way.
    // Safe half-widths: back ±55, middle ±66, front ±60. Scale: a person ≈ 7, a car 16 × 6, a house 18–24, a tower 35–58, a turbine 44–56.
    const starN = (g, cx, cy, r, n, fill, inner) => { let d = ""; for (let k = 0; k < n * 2; k++) { const a = -Math.PI / 2 + (k * Math.PI) / n, rr = k % 2 ? r * (inner || 0.42) : r; d += (k ? " L" : "M") + (cx + Math.cos(a) * rr).toFixed(2) + " " + (cy + Math.sin(a) * rr).toFixed(2); } el("path", { d: d + " Z", fill }, g); };
    let tid = 0;
    const tableau2 = (parent, [x, y], ground) => {
      if (window.ISOJ) { const t = ISOJ.tableau(parent, [x, y], ground, defs); t.gcol = ground; return t; }   // isometric slab instead
      const wrap = el("g", null, parent);
      const g = el("g", { transform: `translate(${x} ${y})` }, wrap);
      const id = "tab" + (++tid), cp = el("clipPath", { id }, defs); el("ellipse", { cx: 0, cy: 3, rx: 72, ry: 13 }, cp);
      el("ellipse", { cx: 0, cy: 3, rx: 72, ry: 13, fill: ground || C.g2 }, g);
      const groundG = el("g", { "clip-path": `url(#${id})` }, g);   // water, fields and paths stay inside the ellipse
      const mk = (dy) => { const r = el("g", { transform: `translate(0 ${dy})` }, g); return { base: el("g", null, r), fossil: el("g", null, r), green: el("g", null, r) }; };
      const back = mk(-5), mid = mk(1), front = mk(8);
      gsap.set(wrap, { scale: 0, svgOrigin: `${x} ${y}` });
      return { wrap, g, ground: groundG, back, mid, front, x, y, fossil: [back.fossil, mid.fossil, front.fossil], green: [back.green, mid.green, front.green] };
    };
    const PAL = { brick: "#C96F4A", cream: "#F3E6CC", sage: "#BFD3B4", stone: "#D8D5D4", sand: "#E9D9B4", red: "#C8102E", wood: "#9C7B5B", thatch: "#C9A15A", gum: "#7FA88A" };
    const R = {
      person: (g, x, o) => P.person(g, Object.assign({ x, y: 0, s: 0.04, hairStyle: "short", hairCol: C.n5, top: C.b3, bottom: C.n4 }, o || {})),
      car: (g, x, col, flip) => { const c = el("g", { transform: `translate(${x} 0) scale(${flip ? -1 : 1} 1)` }, g); el("path", { d: "M-8 -1.2 C-8 -3.6 -7 -4 -5 -4.2 L-3 -6.4 L3.4 -6.4 L5.6 -4.2 C7.4 -4 8 -3.4 8 -1.2 Z", fill: col }, c); el("path", { d: "M-2.6 -6 L-0.2 -6 L-0.2 -4.4 L-4.2 -4.4 Z M0.4 -6 L3 -6 L4.6 -4.4 L0.4 -4.4 Z", fill: C.b1 }, c); [-4.6, 4.6].forEach((wx) => { el("circle", { cx: wx, cy: -1.2, r: 1.5, fill: C.n5 }, c); el("circle", { cx: wx, cy: -1.2, r: 0.6, fill: C.n2 }, c); }); return c; },
      charger: (g, x) => { el("rect", { x: x - 1.3, y: -8, width: 2.6, height: 8, rx: 0.6, fill: C.g4 }, g); el("rect", { x: x - 0.8, y: -6.8, width: 1.6, height: 1.6, fill: C.g1 }, g); el("path", { d: `M${x + 1.3} -4 Q${x + 3} -3 ${x + 3.4} -1.6`, stroke: C.n5, "stroke-width": 0.4, fill: "none" }, g); },
      hpump: (g, x) => { el("rect", { x: x - 2.6, y: -4.2, width: 5.2, height: 4.2, rx: 0.4, fill: C.n1 }, g); el("circle", { cx: x - 0.5, cy: -2.1, r: 1.4, fill: C.n3 }, g); el("circle", { cx: x - 0.5, cy: -2.1, r: 0.5, fill: C.n1 }, g); },
      tree: (g, x, s, col) => { s = s || 1; el("rect", { x: x - 0.8 * s, y: -6 * s, width: 1.6 * s, height: 6 * s, fill: PAL.wood }, g); el("circle", { cx: x - 1.6 * s, cy: -8.5 * s, r: 3.6 * s, fill: col || C.g4 }, g); el("circle", { cx: x + 1.8 * s, cy: -8.8 * s, r: 3.4 * s, fill: col || C.g4 }, g); el("circle", { cx: x, cy: -11.6 * s, r: 3.8 * s, fill: col || C.g4 }, g); },
      poplar: (g, x, s) => { s = s || 1; el("rect", { x: x - 0.6 * s, y: -4 * s, width: 1.2 * s, height: 4 * s, fill: PAL.wood }, g); el("ellipse", { cx: x, cy: -11 * s, rx: 2.6 * s, ry: 8 * s, fill: C.g5 }, g); },
      turbine: (g, x, h, d) => { el("ellipse", { cx: x, cy: 0, rx: 2, ry: 0.6, fill: C.n2 }, g); SVG.turbine(g, x, 0, h, { dur: d || 3 }); },
      solar: (g, x, w, rows) => { for (let r = 0; r < rows; r++) { const yy = -r * 3.2, xx = x + r * 1.2; [xx + 2, xx + w - 2].forEach((lx) => el("rect", { x: lx, y: yy - 1.8, width: 0.6, height: 1.8, fill: C.n4 }, g)); SVG.panelQuad(g, [[xx + 0.8, yy - 4.4], [xx + w + 0.8, yy - 4.4], [xx + w, yy - 1.8], [xx, yy - 1.8]], Math.max(3, Math.round(w / 3)), 1); } },
      roofPV: (g, x0, y0, x1, y1, n) => SVG.panelQuad(g, [[x0, y0], [x1, y1], [x1, y1 + 1.6], [x0, y0 + 1.6]], n || 3, 1),
      smoke: (g, x, y, big) => { for (let k = 0; k < 3; k++) { const c = el("circle", { cx: x, cy: y, r: 2, fill: C.n2 }, g); gsap.fromTo(c, { attr: { cy: y, r: 1.8 }, opacity: 0.9 }, { attr: { cy: y - (big ? 18 : 11), r: big ? 5.5 : 3.6 }, opacity: 0, duration: 2.8, repeat: -1, ease: "none", delay: -k * 0.93 }); } },
      battery: (g, x, n) => { for (let i = 0; i < n; i++) { el("rect", { x: x + i * 8.6, y: -6, width: 8, height: 6, fill: C.w }, g); el("rect", { x: x + i * 8.6, y: -6, width: 8, height: 1.2, fill: C.g4 }, g); [1.6, 3.6, 5.6].forEach((dx) => el("rect", { x: x + i * 8.6 + dx, y: -4, width: 0.5, height: 3.4, fill: C.n2 }, g)); } },
      road: (g, x0, x1) => { el("rect", { x: x0, y: -0.2, width: x1 - x0, height: 2.8, rx: 1.4, fill: C.n3 }, g); el("path", { d: `M${x0 + 3} 1.2 L${x1 - 3} 1.2`, stroke: C.w, "stroke-width": 0.4, "stroke-dasharray": "2.5 2" }, g); },
      palm: (g, x, s) => {
        s = s || 1; const tx = x + 1.5 * s, ty = -20 * s;
        el("path", { d: `M${x - 0.9 * s} 0 Q${x + 1.6 * s} ${-10 * s} ${tx - 0.6 * s} ${ty} L${tx + 0.6 * s} ${ty} Q${x + 2.6 * s} ${-10 * s} ${x + 0.9 * s} 0 Z`, fill: PAL.wood }, g);
        [[-1, 0.2], [-1, -0.6], [1, 0.2], [1, -0.6], [0.15, -1]].forEach(([dx, dy]) => { const ex = tx + dx * 9 * s, ey = ty + (dy + 1.2) * 4 * s; el("path", { d: `M${tx} ${ty} Q${tx + dx * 5 * s} ${ty + dy * 5 * s - 2 * s} ${ex} ${ey} Q${tx + dx * 4 * s} ${ty + dy * 3 * s + 1 * s} ${tx} ${ty + 0.8 * s} Z`, fill: dx < 0 ? C.g4 : C.g5 }, g); });
      },
      house: (g, x, w, h, body, roof, pv) => { el("rect", { x: x - w / 2, y: -h, width: w, height: h, fill: body }, g); el("path", { d: `M${x - w / 2 - 1.5} ${-h} L${x} ${-h - w * 0.42} L${x + w / 2 + 1.5} ${-h} Z`, fill: roof }, g); el("rect", { x: x - w / 2 + 2, y: -h + 3, width: w * 0.24, height: h * 0.3, fill: C.b1 }, g); el("rect", { x: x + w * 0.08, y: -h * 0.6, width: w * 0.22, height: h * 0.6, fill: PAL.wood }, g); if (pv) R.roofPV(g, x + 1, -h - w * 0.36, x + w / 2 - 1, -h - 1.4, 2); },
      bike: (g, col, rider) => { const b = el("g", null, g); [-2.4, 2.4].forEach((wx) => el("circle", { cx: wx, cy: -1.3, r: 1.3, fill: "none", stroke: C.n5, "stroke-width": 0.5 }, b)); el("path", { d: "M-2.4 -1.3 L-0.6 -1.3 L0.8 -3.4 L-1.4 -3.4 Z M0.8 -3.4 L2.4 -1.3 M-1.4 -3.4 L-1.8 -4.4 M0.8 -3.4 L0.6 -4.6 L1.6 -4.6", stroke: col, "stroke-width": 0.6, fill: "none" }, b); P.person(b, Object.assign({ x: -1, y: -1.6, s: 0.03, pose: "sit", hairStyle: "short", top: C.g3, arms: { L: "wheel", R: "wheel" } }, rider || {})); return b; },
      moto: (g, col, rider) => { const b = el("g", null, g); [-2.8, 2.8].forEach((wx) => { el("circle", { cx: wx, cy: -1.4, r: 1.4, fill: C.n5 }, b); el("circle", { cx: wx, cy: -1.4, r: 0.5, fill: C.n2 }, b); }); el("path", { d: "M-3 -2.6 L-0.4 -2.6 L1 -3.8 L3.2 -2.6 L1.6 -1.6 L-1.8 -1.6 Z", fill: col }, b); el("path", { d: "M2.2 -3.4 L2.8 -5.2", stroke: C.n5, "stroke-width": 0.5 }, b); P.person(b, Object.assign({ x: -0.8, y: -2.4, s: 0.03, pose: "sit", hairStyle: "short", top: C.b3, arms: { L: "wheel", R: "wheel" } }, rider || {})); return b; },
      tower: (g, x, w, h, col, glass) => { el("rect", { x, y: -h, width: w, height: h, fill: col }, g); for (let r = 0; r < Math.floor((h - 4) / 4); r++) el("rect", { x: x + 1.2, y: -h + 2 + r * 4, width: w - 2.4, height: 1.6, fill: glass }, g); el("rect", { x: x + 0.4, y: -h - 0.8, width: w - 0.8, height: 0.8, fill: C.n4 }, g); R.roofPV(g, x + 0.8, -h - 2.4, x + w - 0.8, -h - 2.4, 3); }
    };
    // an LNG carrier, side-on: a long dark hull with a red waterline band, four spherical tanks, a raised bow, the bridge and funnel at the stern
    const lngShip = (g, x, k, flip) => {
      const s = el("g", { transform: `translate(${x} 0) scale(${(flip ? -1 : 1) * k} ${k})` }, g);
      el("path", { d: "M-30 -6 L26 -6 Q30 -6 32 -3.5 L29 1.4 L-28 1.4 L-30 -1 Z", fill: C.n5 }, s);
      el("path", { d: "M-29.4 -0.6 L30 -0.6 L29 1.4 L-28 1.4 Z", fill: "#B5302E" }, s);
      el("path", { d: "M24 -6 L30 -6 Q31 -6 32 -4.5 L24 -4.5 Z", fill: C.n4 }, s);
      [-16, -6, 4, 14].forEach((tx) => { el("path", { d: `M${tx - 4.6} -6 A4.6 4.6 0 0 1 ${tx + 4.6} -6 Z`, fill: C.w }, s); el("rect", { x: tx - 0.6, y: -11.2, width: 1.2, height: 0.9, fill: C.n2 }, s); });
      el("path", { d: "M-20.6 -6.6 L18.6 -6.6", stroke: C.n2, "stroke-width": 0.5 }, s);
      el("rect", { x: -29, y: -13, width: 7.4, height: 7, fill: C.w }, s);
      el("rect", { x: -29.6, y: -13.8, width: 8.6, height: 1, fill: C.w }, s);
      for (let i = 0; i < 3; i++) el("rect", { x: -28.2 + i * 2.3, y: -12.2, width: 1.5, height: 1, fill: C.b4 }, s);
      el("rect", { x: -26.6, y: -17, width: 2.6, height: 4, fill: S5.o3 }, s); el("rect", { x: -26.6, y: -17, width: 2.6, height: 0.9, fill: C.n5 }, s);
      return s;
    };
    const FX = -46;   // every flag stands on the left of its ground, clear of the edge
    const placeFlag = (t, draw, aspect) => flag([t.x + (t.fx != null ? t.fx : FX), t.y + (t.fy != null ? t.fy : 1)], draw, 1.6, aspect);

    // ---------- J3 Europe ----------
    const EU = el("g", { "data-nowobble": "" }, svg);
    const eu = tableau2(EU, [792, 252]);
    if (window.ISOJ) ISOJ.fill("eu", eu); else { const { back, mid, front } = eu;
      el("path", { d: "M26 -2 Q40 -9 76 -10 L76 -2 Z", fill: C.b2 }, eu.ground);                                  // the North Sea, along the back
      R.solar(back.green, -40, 14, 2);                                                                          // solar on the hillside, under the flag
      // a church: nave, tower and spire
      el("rect", { x: 8, y: -11, width: 10, height: 11, fill: PAL.stone }, back.base); el("path", { d: "M7 -11 L13 -16 L19 -11 Z", fill: C.n3 }, back.base);
      el("rect", { x: 17, y: -24, width: 7, height: 24, fill: PAL.stone }, back.base); el("path", { d: "M16.6 -24 L20.5 -42 L24.4 -24 Z", fill: C.g5 }, back.base); el("circle", { cx: 20.5, cy: -19, r: 1.5, fill: C.w }, back.base); el("path", { d: "M19.5 -2 Q20.5 -5 21.5 -2 Z", fill: S5.br5 }, back.base);
      [[36, 46, 2.5], [48, 52, 2.9]].forEach(([x, h, d]) => R.turbine(back.green, x, h, d));                     // offshore wind
      // a street of canal houses with stepped gables
      const th = (x, w, h, body, pv) => { const g = mid.base; el("path", { d: `M${x - w / 2} 0 L${x - w / 2} ${-h} L${x - w / 2 + 1.4} ${-h} L${x - w / 2 + 1.4} ${-h - 2.6} L${x - w / 4} ${-h - 2.6} L${x - w / 4} ${-h - 5} L${x + w / 4} ${-h - 5} L${x + w / 4} ${-h - 2.6} L${x + w / 2 - 1.4} ${-h - 2.6} L${x + w / 2 - 1.4} ${-h} L${x + w / 2} ${-h} L${x + w / 2} 0 Z`, fill: body }, g); for (let r = 0; r < Math.floor((h - 6) / 5.5); r++) [x - w / 4 - 0.9, x + w / 4 - 1.4].forEach((wx) => el("rect", { x: wx, y: -h + 2.5 + r * 5.5, width: 2.3, height: 3.2, fill: C.w }, g)); el("rect", { x: x - 1.3, y: -4.5, width: 2.6, height: 4.5, fill: S5.br5 }, g); if (pv) R.roofPV(mid.green, x - w / 4, -h - 4.6, x + w / 4, -h - 4.6, 2); };
      [[-22, 9, 21, PAL.brick, true], [-13, 9, 24, PAL.cream, false], [-4, 9, 22, PAL.sage, true], [5, 9, 19, PAL.brick, true]].forEach(([x, w, h, c, pv]) => th(x, w, h, c, pv));
      R.hpump(mid.base, 12); R.poplar(mid.base, 30, 0.9); R.tree(mid.base, 42, 0.8); R.tree(mid.base, -58, 0.75);
      // the tram line, a tram, a cyclist, people and an EV
      el("rect", { x: -58, y: 0.4, width: 116, height: 0.8, fill: C.n3 }, front.base);
      const tram = el("g", null, front.base); [-10, 10].forEach((bx) => { el("rect", { x: bx - 4, y: -1.6, width: 8, height: 1.2, fill: C.n4 }, tram); [bx - 2.2, bx + 2.2].forEach((wx) => el("circle", { cx: wx, cy: -0.4, r: 0.9, fill: C.n5 }, tram)); }); el("rect", { x: -16, y: -8.4, width: 32, height: 7, rx: 2, fill: C.y3 }, tram); el("rect", { x: -16, y: -3.4, width: 32, height: 1, fill: C.n4 }, tram); for (let k = 0; k < 6; k++) el("rect", { x: -14 + k * 5, y: -7.4, width: 3.6, height: 3, rx: 0.5, fill: C.b1 }, tram); el("path", { d: "M-1 -8.4 L1.4 -10.6 L-0.4 -12.4 M-2.6 -12.4 L1.8 -12.4", stroke: C.n4, "stroke-width": 0.5, fill: "none" }, tram);
      gsap.fromTo(tram, { x: -26 }, { x: 10, duration: 7, repeat: -1, yoyo: true, ease: "sine.inOut" });
      R.charger(front.green, 30); R.car(front.green, 39, C.b3);
      R.person(front.base, 52, { top: S5.o3, hairStyle: "bun", hairCol: S5.br5 }); R.person(front.base, 56, { top: C.b4, bottom: C.n5 }); }
    const euFlag = placeFlag(eu, flagEU);

    // ---------- J4 China ----------
    const CN = el("g", { "data-nowobble": "" }, svg);
    const cn = tableau2(CN, [1192, 322]);
    if (window.ISOJ) ISOJ.fill("cn", cn); else { const { back, mid, front } = cn;
      [[44, 50, 2.4], [53, 44, 2.9]].forEach(([x, h, d]) => R.turbine(back.green, x, h, d));
      [[-4, 9, 40, C.n2, C.b2], [6, 10, 56, C.b4, C.b1], [17, 9, 46, C.w, C.b2], [27, 10, 52, C.n3, C.b1]].forEach(([x, w, h, c, gl]) => R.tower(back.base, x, w, h, c, gl));
      R.solar(back.green, -42, 14, 2);
      // a temple gate
      const tg = mid.base; el("rect", { x: -27, y: -10, width: 14, height: 10, fill: PAL.red }, tg); [-26, -15.6].forEach((px) => el("rect", { x: px, y: -10, width: 1.6, height: 10, fill: "#9E0B22" }, tg)); el("path", { d: "M-31 -10 Q-26 -11.5 -25 -14.5 L-15 -14.5 Q-14 -11.5 -9 -10 Z", fill: C.n4 }, tg); el("rect", { x: -25, y: -19, width: 10, height: 4.5, fill: PAL.red }, tg); el("path", { d: "M-29 -19 Q-24.5 -20.5 -23.5 -23 L-16.5 -23 Q-15.5 -20.5 -11 -19 Z", fill: C.n4 }, tg); el("rect", { x: -22, y: -7, width: 4, height: 7, fill: S5.br5 }, tg);
      R.tree(mid.base, -58, 0.75); R.tree(mid.base, -36, 0.65, C.g5);
      // a charging plaza in front of the towers
      [-2, 14, 30].forEach((x, i) => { R.charger(mid.green, x); R.car(mid.green, x + 7, [C.b3, C.w, C.g4][i]); });
      R.person(mid.base, 50, { top: C.y3, hairStyle: "bob" }); R.person(mid.base, 54, { top: C.n4, hairStyle: "short" });
      // an elevated line and a high-speed train
      el("rect", { x: -58, y: 0, width: 116, height: 1.6, fill: C.n3 }, front.base); [-44, -14, 16, 44].forEach((px) => el("rect", { x: px, y: 1.6, width: 1.6, height: 3, fill: C.n3 }, front.base));
      const tr = el("g", null, front.base);
      el("path", { d: "M-34 0 L14 0 Q20 0 23 -2.6 Q21 -6 14 -6 L-34 -6 Z", fill: C.w }, tr); el("rect", { x: -34, y: -2.4, width: 54, height: 0.9, fill: PAL.red }, tr);
      for (let k = 0; k < 8; k++) el("rect", { x: -32 + k * 5.8, y: -5, width: 3.8, height: 1.8, rx: 0.4, fill: C.b1 }, tr); [-18, 0].forEach((sx) => el("rect", { x: sx, y: -6, width: 0.4, height: 6, fill: C.n2 }, tr));
      gsap.fromTo(tr, { x: -24 }, { x: 34, duration: 3.6, repeat: -1, ease: "none" }); }
    const cnFlag = placeFlag(cn, flagCN);

    // ---------- J4 Australia ----------
    const AU = el("g", { "data-nowobble": "" }, svg);
    const au = tableau2(AU, [1300, 600], "#EBCBA9");
    if (window.ISOJ) ISOJ.fill("au", au); else { const { back, mid, front } = au;
      R.solar(back.green, -40, 14, 2); R.solar(back.green, -22, 14, 2);
      [[38, 48, 2.6], [50, 44, 3]].forEach(([x, h, d]) => R.turbine(back.green, x, h, d));
      const gum = (g, x, s) => { el("path", { d: `M${x - 0.8 * s} 0 L${x - 0.5 * s} ${-12 * s} L${x + 0.5 * s} ${-12 * s} L${x + 0.8 * s} 0 Z M${x} ${-8 * s} L${x + 3 * s} ${-13 * s} L${x + 3.6 * s} ${-12.6 * s} L${x + 0.6 * s} ${-7 * s} Z`, fill: "#EDE6DC" }, g); [[-3, -15, 4.4], [3, -14.4, 4.2], [0, -18.6, 3.8]].forEach(([dx, dy, r]) => el("ellipse", { cx: x + dx * s, cy: dy * s, rx: r * s, ry: r * 0.66 * s, fill: PAL.gum }, g)); };
      gum(mid.base, -32, 0.9); gum(mid.base, 26, 1.05); gum(mid.base, 58, 0.8);
      // a Queenslander: raised on stumps, verandah with balustrade, a corrugated roof covered in solar, a home battery
      const q = mid.base;
      [-12, -4, 4, 12].forEach((px) => el("rect", { x: px - 0.5, y: -4, width: 1, height: 4, fill: S5.br5 }, q));
      el("path", { d: "M-3 0 L1 -4 L3 -4 L-1 0 Z", fill: PAL.wood }, q);
      el("rect", { x: -15, y: -14, width: 30, height: 10, fill: C.w }, q); el("rect", { x: -15, y: -7.5, width: 30, height: 0.7, fill: C.n3 }, q); for (let k = 0; k < 11; k++) el("rect", { x: -14.4 + k * 2.8, y: -7.5, width: 0.4, height: 3.5, fill: C.n3 }, q);
      [-11, 6].forEach((wx) => el("rect", { x: wx, y: -13, width: 4, height: 4, fill: C.b1 }, q));
      el("path", { d: "M-18 -14 L0 -22 L18 -14 Z", fill: C.n2 }, q); R.roofPV(mid.green, 1, -21.4, 15, -15.2, 4);
      el("rect", { x: 15.6, y: -6, width: 2.8, height: 6, rx: 0.5, fill: C.w }, mid.green); el("rect", { x: 15.6, y: -6, width: 2.8, height: 1, fill: C.g4 }, mid.green);
      // kangaroos, a ute, a person
      const roo = (g, x, s) => { const r = el("g", { transform: `translate(${x} 0) scale(${s})` }, g), f = "#B07A4E";
        el("path", { d: "M-0.6 -2.2 Q-5 -1.6 -9.4 0 L-9 0.5 Q-4.6 -0.2 0 -0.6 Z", fill: f }, r);                                   // tail along the ground
        el("path", { d: "M-0.6 0 L4.2 0 Q4.4 -0.9 3.4 -1 L1.4 -1.2 Z", fill: S5.br5 }, r);                                       // long hind foot
        el("ellipse", { cx: 0.2, cy: -3.4, rx: 2.8, ry: 3.4, fill: f }, r);                                                       // haunch
        el("ellipse", { cx: 1.3, cy: -7, rx: 1.7, ry: 3.4, fill: f, transform: "rotate(14 1.3 -7)" }, r);                        // upright chest
        el("path", { d: "M2 -8 Q3.4 -7.4 3.6 -5.8", stroke: f, "stroke-width": 0.7, fill: "none", "stroke-linecap": "round" }, r); // short arms
        el("ellipse", { cx: 2.4, cy: -10.6, rx: 1.4, ry: 1.1, fill: f }, r); el("ellipse", { cx: 3.7, cy: -10.3, rx: 1.2, ry: 0.65, fill: f }, r);   // head and snout
        el("path", { d: "M1.6 -11.2 L1.2 -13.6 L2.4 -11.5 Z M2.4 -11.4 L2.5 -13.6 L3 -11.3 Z", fill: f }, r);                     // ears
        el("circle", { cx: 2.8, cy: -10.8, r: 0.25, fill: C.n5 }, r); };
      roo(front.base, -34, 0.55); roo(front.base, -27, 0.4);
      const ute = el("g", null, front.base); el("path", { d: "M-10 -1.2 L-10 -5 L-1 -5 L1 -8.4 L6.4 -8.4 L8.8 -5 L10 -5 L10 -1.2 Z", fill: C.w }, ute); el("rect", { x: 2, y: -7.6, width: 4, height: 2.2, fill: C.b1 }, ute); [-5.4, 6].forEach((wx) => el("circle", { cx: wx, cy: -1.2, r: 1.7, fill: C.n5 }, ute)); ute.setAttribute("transform", "translate(8 0)");
      R.person(front.base, 28, { top: C.g3, hairStyle: "long", hairCol: S5.br5 }); }
    const auFlag = placeFlag(au, (g, w, h) => {
      el("rect", { x: 0, y: 0, width: w, height: h, fill: "#012169" }, g);
      const cw = w / 2, ch = h / 2;
      el("path", { d: `M0 0 L${cw} ${ch} M${cw} 0 L0 ${ch}`, stroke: C.w, "stroke-width": ch * 0.2 }, g);
      el("path", { d: `M0 0 L${cw} ${ch} M${cw} 0 L0 ${ch}`, stroke: "#C8102E", "stroke-width": ch * 0.07 }, g);
      el("path", { d: `M${cw / 2} 0 L${cw / 2} ${ch} M0 ${ch / 2} L${cw} ${ch / 2}`, stroke: C.w, "stroke-width": ch * 0.33 }, g);
      el("path", { d: `M${cw / 2} 0 L${cw / 2} ${ch} M0 ${ch / 2} L${cw} ${ch / 2}`, stroke: "#C8102E", "stroke-width": ch * 0.2 }, g);
      starN(g, cw / 2, h * 0.75, h * 0.15, 7, C.w, 0.45);
      [[0.75, 0.83], [0.625, 0.4], [0.75, 0.15], [0.87, 0.35]].forEach(([u, v]) => starN(g, w * u, h * v, h * 0.07, 7, C.w, 0.45));
      starN(g, w * 0.8, h * 0.52, h * 0.04, 5, C.w);
    }, 2);

    // ---------- J5 United States ----------
    const US = el("g", { "data-nowobble": "" }, svg);
    const us = tableau2(US, [396, 304], "#E8E3C8");
    if (window.ISOJ) ISOJ.fill("us", us); else { const { back, mid, front } = us;
      el("path", { d: "M-80 -4 Q-20 -9.5 80 -7 L80 -2 Q0 -4.6 -80 -1 Z", fill: "#D9CF9E" }, us.ground);   // wheat fields behind
      // fossil: a coal plant (cooling tower and stack), pumpjacks
      const cp = back.fossil; el("path", { d: "M30 0 C29 -7 32.6 -12 31 -19 L41 -19 C39.4 -12 43 -7 42 0 Z", fill: C.n1 }, cp); el("path", { d: "M31.2 -19 Q36 -20.6 40.8 -19", stroke: C.n2, "stroke-width": 0.6, fill: "none" }, cp); el("rect", { x: 43, y: -9, width: 10, height: 9, fill: C.n2 }, cp); el("rect", { x: 49, y: -30, width: 3, height: 21, fill: C.n3 }, cp); el("rect", { x: 48.6, y: -30, width: 3.8, height: 1.2, fill: C.n4 }, cp); R.smoke(cp, 50.5, -32, true); R.smoke(cp, 36, -20, true);
      const pj = (g, x) => { el("rect", { x: x - 9, y: -1, width: 17, height: 1, fill: C.n3 }, g); el("path", { d: `M${x - 3} -1 L${x} -10 L${x + 3} -1`, stroke: C.n4, "stroke-width": 1.1, fill: "none" }, g); el("rect", { x: x + 4, y: -4, width: 3, height: 3, fill: C.n4 }, g); const b = el("g", null, g); el("rect", { x: x - 7, y: -11, width: 13, height: 1.6, rx: 0.4, fill: C.n4 }, b); el("path", { d: `M${x - 7} -12.4 Q${x - 10} -10 ${x - 7} -8 Z`, fill: C.n4 }, b); el("path", { d: `M${x - 8.8} -8 L${x - 8.8} -1`, stroke: C.n5, "stroke-width": 0.4 }, b); gsap.fromTo(b, { rotation: -8, svgOrigin: `${x} -10` }, { rotation: 8, svgOrigin: `${x} -10`, duration: 1.4, repeat: -1, yoyo: true, ease: "sine.inOut" }); };
      pj(mid.fossil, 40); pj(mid.fossil, 58);
      // green: wind on the plains and a solar field
      [[30, 46, 2.5], [41, 52, 2.9], [52, 46, 3.2]].forEach(([x, h, d]) => R.turbine(back.green, x, h, d));
      R.solar(mid.green, 34, 24, 2);
      // the farm: a red barn and silo behind, a ranch house with rooftop solar, a paddock with cows
      const fb = back.base; el("rect", { x: -26, y: -12, width: 18, height: 12, fill: "#B5302E" }, fb); el("path", { d: "M-27.4 -12 L-23 -18 L-11 -18 L-6.6 -12 Z", fill: C.n4 }, fb); el("path", { d: "M-20 0 L-20 -7 L-14 -7 L-14 0 M-20 -7 L-14 0 M-14 -7 L-20 0", stroke: C.w, "stroke-width": 0.6, fill: "none" }, fb); el("rect", { x: -18.6, y: -11, width: 3.2, height: 2.6, fill: C.w }, fb);
      el("rect", { x: -5, y: -24, width: 7, height: 24, fill: C.n1 }, fb); el("path", { d: "M-5 -24 Q-1.5 -29 2 -24 Z", fill: C.n3 }, fb); [-18, -12, -6].forEach((yy) => el("rect", { x: -5, y: yy, width: 7, height: 0.5, fill: C.n2 }, fb));
      const rh = mid.base; el("rect", { x: 6, y: -8, width: 22, height: 8, fill: PAL.cream }, rh); el("path", { d: "M4 -8 L10 -12.4 L24 -12.4 L30 -8 Z", fill: S5.br4 }, rh); el("rect", { x: 9, y: -6, width: 4, height: 3, fill: C.b1 }, rh); el("rect", { x: 21, y: -6, width: 4, height: 3, fill: C.b1 }, rh); el("rect", { x: 15.6, y: -5, width: 2.6, height: 5, fill: S5.br5 }, rh);
      R.roofPV(mid.green, 11, -12, 23, -12, 4);
      const fence = mid.base; el("path", { d: "M-64 -2 L-52 -2 M-64 -4 L-52 -4", stroke: PAL.wood, "stroke-width": 0.5 }, fence); for (let k = 0; k < 5; k++) el("rect", { x: -64 + k * 3, y: -5, width: 0.6, height: 5, fill: PAL.wood }, fence);
      const cow = (g, x) => { el("path", { d: `M${x - 4} -2 L${x - 4} -4.4 Q${x - 4} -5 ${x - 3.4} -5 L${x + 3} -5 L${x + 4.4} -6.2 L${x + 5.6} -6 L${x + 5.6} -4.6 L${x + 4} -3.6 L${x + 4} -2 Z`, fill: C.w }, g); el("circle", { cx: x - 1.4, cy: -3.8, r: 0.9, fill: C.n5 }, g); el("circle", { cx: x + 1.6, cy: -4.2, r: 0.6, fill: C.n5 }, g); [x - 3.4, x - 2.2, x + 2.2, x + 3.4].forEach((lx) => el("rect", { x: lx, y: -2, width: 0.6, height: 2, fill: C.n5 }, g)); };
      cow(mid.base, -58);
      // a country road with an electric pickup
      R.road(front.base, -56, 56);
      const pk = el("g", null, front.base); el("path", { d: "M-10 -1.2 L-10 -5 L-1 -5 L1 -8.4 L6.4 -8.4 L8.8 -5 L10 -5 L10 -1.2 Z", fill: C.b4 }, pk); el("rect", { x: 2, y: -7.6, width: 4, height: 2.2, fill: C.b1 }, pk); [-5.4, 6].forEach((wx) => el("circle", { cx: wx, cy: -1.2, r: 1.7, fill: C.n5 }, pk));
      gsap.fromTo(pk, { x: -40 }, { x: 40, duration: 6, repeat: -1, ease: "none" }); }
    const usFlag = placeFlag(us, flagUS, 1.9);

    // ---------- J5 Brazil ----------
    const BR = el("g", { "data-nowobble": "" }, svg);
    const br = tableau2(BR, [600, 548]);
    if (window.ISOJ) ISOJ.fill("br", br); else { const { back, mid, front } = br;
      el("path", { d: "M20 -2 Q46 -10 80 -8 L80 -2 Z", fill: C.b2 }, br.ground);   // Guanabara Bay behind
      // Sugarloaf and Urca, with the cable car
      el("path", { d: "M0 0 C0 -14 5 -27 12 -27 C18 -27 21 -16 22 -9 C24 -15 27 -18 31 -18 C35 -18 38 -9 38 0 Z", fill: "#7FA88A" }, back.base);
      el("path", { d: "M12 -27 L31 -18", stroke: C.n4, "stroke-width": 0.4 }, back.base); el("rect", { x: 20.8, y: -23.8, width: 2.4, height: 1.8, fill: S5.o3 }, back.base);
      [[46, 44, 2.6], [55, 38, 3]].forEach(([x, h, d]) => R.turbine(back.green, x, h, d));
      R.solar(back.green, -42, 14, 2);
      // a hillside of colourful homes with rooftop solar
      el("path", { d: "M-34 0 Q-26 -24 -12 -25 Q-2 -24 4 0 Z", fill: "#9BBF8A" }, mid.base);
      [[-27, 0, "#F2B134"], [-19.5, 0, "#3FA7D6"], [-12, 0, "#EE6C4D"], [-4.5, 0, "#F7F7F7"], [-24, -6.5, "#9BC53D"], [-16.5, -6.5, "#F26DA6"], [-9, -6.5, "#F2B134"], [-20, -13, "#3FA7D6"], [-12.5, -13, "#F7F7F7"], [-16, -19.5, "#EE6C4D"]].forEach(([x, y, c], i) => { el("rect", { x, y: y - 6, width: 7, height: 6, fill: c }, mid.base); el("rect", { x: x + 1.4, y: y - 4.4, width: 1.8, height: 1.8, fill: C.n4 }, mid.base); el("rect", { x: x + 4.2, y: y - 4, width: 1.6, height: 4, fill: S5.br5 }, mid.base); if (i % 3 === 0) R.roofPV(mid.green, x + 0.6, y - 7.4, x + 6.4, y - 7.4, 2); });
      R.palm(mid.base, -58, 0.8); R.palm(mid.base, 10, 1); R.palm(mid.base, 42, 0.85);
      // a bus corridor with an electric BRT bus and a stop
      R.road(front.base, -56, 56);
      el("rect", { x: 26, y: -9, width: 12, height: 0.9, fill: C.g4 }, front.base); [26.6, 36.6].forEach((px) => el("rect", { x: px, y: -8.4, width: 0.6, height: 8.4, fill: C.n4 }, front.base));
      R.person(front.base, 30, { top: "#F2B134", bottom: C.b5, hairStyle: "curly" }); R.person(front.base, 34, { top: C.g3, hairStyle: "long", hairCol: S5.br5 });
      const bus = el("g", null, front.base); el("rect", { x: -16, y: -8, width: 32, height: 7, rx: 1.6, fill: C.g4 }, bus); el("rect", { x: -16, y: -3, width: 32, height: 0.8, fill: C.y3 }, bus); for (let k = 0; k < 6; k++) el("rect", { x: -14 + k * 5, y: -7, width: 3.6, height: 2.6, rx: 0.4, fill: C.b1 }, bus); [-10, 10].forEach((wx) => el("circle", { cx: wx, cy: -1, r: 1.5, fill: C.n5 }, bus));
      gsap.fromTo(bus, { x: -36 }, { x: 4, duration: 6, repeat: -1, yoyo: true, ease: "sine.inOut" }); }
    const brFlag = placeFlag(br, (g, w, h) => {
      el("rect", { x: 0, y: 0, width: w, height: h, fill: "#009C3B" }, g);
      el("path", { d: `M${w * 0.085} ${h / 2} L${w / 2} ${h * 0.12} L${w * 0.915} ${h / 2} L${w / 2} ${h * 0.88} Z`, fill: "#FFDF00" }, g);
      el("circle", { cx: w / 2, cy: h / 2, r: h * 0.25, fill: "#002776" }, g);
      el("path", { d: `M${w / 2 - h * 0.25} ${h * 0.47} Q${w / 2} ${h * 0.38} ${w / 2 + h * 0.25} ${h * 0.53} L${w / 2 + h * 0.24} ${h * 0.58} Q${w / 2} ${h * 0.44} ${w / 2 - h * 0.245} ${h * 0.53} Z`, fill: C.w }, g);
      [[0.46, 0.6], [0.52, 0.64], [0.55, 0.58], [0.49, 0.68], [0.43, 0.56]].forEach(([u, v]) => el("circle", { cx: w * u, cy: h * v, r: h * 0.012, fill: C.w }, g));
    }, 1.43);

    // ---------- J6 ASEAN ----------
    // An LNG carrier sails in from the Gulf and berths at a terminal on the left of the ground; a busy city of towers, shophouses and palms fills the rest.
    // Then the gas goes: the ship and the terminal fade, and solar on the old tank farm, floating solar in the berth and wind on the right take over.
    const AS = el("g", { "data-nowobble": "" }, svg);
    const lngRoute = el("path", { d: `M${PT.qatar[0]} ${PT.qatar[1]} L${PT.hormuz[0]} ${PT.hormuz[1]} Q1000 372 ${PT.arabsea[0]} ${PT.arabsea[1]} Q1050 430 ${PT.india_s[0]} ${PT.india_s[1] + 8} Q1084 462 1104 462 L1140 462`, stroke: C.n3, "stroke-width": 0.6, "stroke-dasharray": "2 2", fill: "none" }, AS);
    const as = tableau2(AS, [1178, 452]);
    if (window.ISOJ) ISOJ.fill("as", as); else { const { back, mid, front } = as;
      // the harbour: open water along the front-left, a concrete quay edge behind it
      el("path", { d: "M-80 30 L-80 4.2 L-20 4.2 Q-15 6 -14 12 L-12 30 Z", fill: C.b2 }, as.ground);
      el("rect", { x: -80, y: 3, width: 61, height: 1.4, fill: C.n2 }, as.ground);
      [-66, -54, -42, -30].forEach((bx) => el("rect", { x: bx, y: 3.4, width: 1.6, height: 1, fill: C.n4 }, as.ground));   // bollards
      // fossil: the import terminal — two LNG tanks, a pipe down to the berth, loading arms on the quay
      [[-43, 6], [-29.5, 6]].forEach(([x, r]) => { el("rect", { x: x - r, y: -r * 1.25, width: r * 2, height: r * 1.25, fill: C.w }, back.fossil); el("path", { d: `M${x - r} ${-r * 1.25} Q${x} ${-r * 1.25 - r * 0.6} ${x + r} ${-r * 1.25} Z`, fill: C.n1 }, back.fossil); el("rect", { x: x - r, y: -r * 0.55, width: r * 2, height: 0.6, fill: C.n2 }, back.fossil); });
      el("path", { d: "M-46 -0.6 L-24 -0.6", stroke: C.n3, "stroke-width": 0.9 }, mid.fossil);   // the gas line along the quay
      [-40, -32].forEach((x) => { el("rect", { x: x - 1.4, y: -1.2, width: 2.8, height: 1.2, fill: C.n3 }, mid.fossil); el("rect", { x: x - 0.5, y: -7, width: 1, height: 6, fill: C.n2 }, mid.fossil);
        el("path", { d: `M${x} -6.6 L${x + 3} -9.2 L${x + 4.4} 5`, stroke: S5.o3, "stroke-width": 0.8, fill: "none", "stroke-linejoin": "round", "stroke-linecap": "round" }, mid.fossil); });   // loading arms reaching down to the ship
      // green: solar where the tanks stood, floating solar in the empty berth, wind on the right
      R.solar(back.green, -52, 13, 2); R.solar(back.green, -37, 13, 2);
      for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) { const x = -62 + k * 12 + r * 2.4, y = 7.4 + r * 3; SVG.panelQuad(front.green, [[x, y - 1.8 - 8], [x + 10, y - 1.8 - 8], [x + 10.8, y - 8], [x + 0.8, y - 8]], 3, 1); }
      [[40, 46, 2.6], [50, 50, 3]].forEach(([x, h, d]) => R.turbine(back.green, x, h, d));
      // the skyline: glass towers, one with a stepped crown and a spire
      [[-16, 9, 34, C.n2, C.b1], [5, 10, 42, C.w, C.b2], [17, 9, 48, C.b4, C.b1], [28, 8, 30, "#7FC8A9", C.w]].forEach(([x, w, h, c, gl]) => R.tower(back.base, x, w, h, c, gl));
      { const g = back.base, x = -4, w = 8; el("rect", { x: x - w / 2, y: -46, width: w, height: 46, fill: C.n1 }, g); for (let r = 0; r < 10; r++) el("rect", { x: x - w / 2 + 1, y: -44 + r * 4, width: w - 2, height: 1.6, fill: C.b1 }, g);
        el("rect", { x: x - 3, y: -51, width: 6, height: 5, fill: C.n1 }, g); el("rect", { x: x - 2, y: -55, width: 4, height: 4, fill: C.n1 }, g); el("rect", { x: x - 1, y: -58, width: 2, height: 3, fill: C.n1 }, g); el("path", { d: `M${x} -58 L${x} -66`, stroke: C.n3, "stroke-width": 0.6 }, g);
        [-50, -54].forEach((yy) => el("rect", { x: x - 2.4, y: yy, width: 4.8, height: 0.6, fill: C.b1 }, g)); }
      R.roofPV(back.green, -15.2, -36.4, -7.8, -36.4, 3); R.roofPV(back.green, 5.8, -44.4, 14.2, -44.4, 3);
      // a row of shophouses with arcades along the street, palms between
      [[-8, "#F2B134"], [-0.5, "#F6A5A5"], [7, "#9CC5E8"], [14.5, "#F3E6CC"], [22, "#7FC8A9"]].forEach(([x, c], i) => { const g = mid.base, w = 7.4, h = 12;
        el("rect", { x: x - w / 2, y: -h, width: w, height: h, fill: c }, g); el("rect", { x: x - w / 2 - 0.4, y: -h - 1.2, width: w + 0.8, height: 1.2, fill: i % 2 ? PAL.brick : C.n3 }, g);
        [x - 2, x + 0.6].forEach((wx) => el("path", { d: `M${wx} -6.6 L${wx} -9 Q${wx + 0.7} -10 ${wx + 1.4} -9 L${wx + 1.4} -6.6 Z`, fill: C.w }, g));
        el("rect", { x: x - w / 2, y: -5, width: w, height: 0.7, fill: C.w }, g); el("path", { d: `M${x - 2.8} 0 L${x - 2.8} -2.6 Q${x} -4.6 ${x + 2.8} -2.6 L${x + 2.8} 0 Z`, fill: S5.br5 }, g);
        if (i % 2 === 0) R.roofPV(mid.green, x - 2.6, -h - 2.6, x + 2.6, -h - 2.6, 2); });
      R.palm(mid.base, -14, 0.95); R.palm(mid.base, 30, 1.05); R.palm(mid.base, 44, 0.85); R.palm(mid.base, 60, 0.75);
      // the street: a scooter, a tuk-tuk, a food cart and people
      R.road(front.base, -12, 58);
      { const fc = front.base; el("rect", { x: 34, y: -4.4, width: 7, height: 3, fill: PAL.wood }, fc); el("rect", { x: 34, y: -4.4, width: 7, height: 0.6, fill: C.n3 }, fc); [34.4, 40.2].forEach((px) => el("rect", { x: px, y: -9, width: 0.5, height: 4.6, fill: C.n4 }, fc)); for (let k = 0; k < 4; k++) el("path", { d: `M${33.4 + k * 2} -9.6 L${35.4 + k * 2} -9.6 L${35.4 + k * 2} -8.2 Q${34.4 + k * 2} -7.4 ${33.4 + k * 2} -8.2 Z`, fill: k % 2 ? C.w : PAL.red }, fc); [35.4, 39.6].forEach((wx) => el("circle", { cx: wx, cy: -0.9, r: 0.9, fill: C.n5 }, fc)); }   // a street-food stall
      R.person(front.base, 43, { top: C.y3, hairStyle: "bun", hairCol: C.n5 }); R.person(front.base, 47, { top: C.b3, hairStyle: "short" });
      const tuk = el("g", null, front.base);   // a tuk-tuk: canopy on posts, open sides, low body, one wheel at the front
      el("path", { d: "M-5.2 -1.6 L-5.2 -4.2 L1.6 -4.2 L3.4 -3 L5 -3 L5 -1.6 Z", fill: C.g4 }, tuk);
      [-4.8, 1.4, 3.6].forEach((px) => el("rect", { x: px, y: -8.2, width: 0.5, height: 4, fill: C.n4 }, tuk));
      el("path", { d: "M-5.6 -8.2 Q-1 -9.6 4.4 -8.2 L4.4 -7.4 L-5.6 -7.4 Z", fill: C.y3 }, tuk);
      el("rect", { x: -4.4, y: -5.6, width: 4.6, height: 1.4, rx: 0.4, fill: PAL.red }, tuk);
      [-3.2, 4.2].forEach((wx) => { el("circle", { cx: wx, cy: -1.2, r: 1.2, fill: C.n5 }, tuk); el("circle", { cx: wx, cy: -1.2, r: 0.45, fill: C.n2 }, tuk); });
      gsap.fromTo(tuk, { x: -6 }, { x: 22, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut" }); }   // the tuk-tuk turns short of the food stall and the people beside it
    // the carrier: sails the route and berths at the quay, in front of the ground
    const ship = el("g", null, AS); if (window.ISOJ) ISOJ.lngShip(ship); else lngShip(ship, 0, 0.5, false);
    gsap.set([lngRoute, ship], { opacity: 0 });
    const routeLen = lngRoute.getTotalLength(), sail = { p: 0 };
    const placeShip = () => { const q = lngRoute.getPointAtLength(sail.p * routeLen); gsap.set(ship, { x: q.x, y: q.y }); }; placeShip();
    const asFlag = placeFlag(as, flagASEAN);

    // ---------- J6 Africa ----------
    const AF = el("g", { "data-nowobble": "" }, svg);
    const af = tableau2(AF, [902, 474], "#EFE3B8");
    if (window.ISOJ) ISOJ.fill("af", af); else { const { back, mid, front } = af;
      // a snow-capped mountain behind
      el("path", { d: "M2 0 L22 -24 Q26 -27 30 -24 L54 0 Z", fill: "#B8A88C" }, back.base); el("path", { d: "M18 -19.2 L22 -24 Q26 -27 30 -24 L34 -19.2 Q30 -20.4 26 -18.6 Q22 -20.4 18 -19.2 Z", fill: C.w }, back.base);
      // a new distribution line on wooden poles, running behind the village to the power plant
      { const poles = [-50, -34, -18, -2], top = -15, g = back.base; let d = "";
        poles.forEach((px, i) => { el("rect", { x: px - 0.5, y: top, width: 1, height: -top, fill: PAL.wood }, g); el("rect", { x: px - 2.6, y: top + 0.6, width: 5.2, height: 0.7, fill: PAL.wood }, g); if (i) [-2.2, 2.2].forEach((o) => { d += `M${poles[i - 1] + o} ${top + 0.6} Q${(poles[i - 1] + px) / 2 + o} ${top + 3} ${px + o} ${top + 0.6} `; }); });
        [-2.2, 2.2].forEach((o) => { d += `M${-2 + o} ${top + 0.6} Q${4 + o} ${top + 4} ${8 + o} -7 `; });
        el("path", { d, stroke: C.n4, "stroke-width": 0.35, fill: "none" }, g); }
      // green: wind on the ridge, a geothermal plant with steam
      [[44, 42, 2.8], [53, 38, 3.2]].forEach(([x, h, d]) => R.turbine(back.green, x, h, d));
      const geo = back.green; el("rect", { x: 4, y: -7, width: 12, height: 7, fill: C.n1 }, geo); el("rect", { x: 12, y: -11, width: 3, height: 4, fill: C.n2 }, geo); el("path", { d: "M-4 -3 L4 -3 M16 -3 L24 -3", stroke: C.n3, "stroke-width": 1 }, geo);
      for (let k = 0; k < 3; k++) { const c = el("circle", { cx: 13.5, cy: -12, r: 2.6, fill: C.w, opacity: 0.9 }, geo); gsap.fromTo(c, { attr: { cy: -12, r: 2.2 }, opacity: 0.95 }, { attr: { cy: -28, r: 6 }, opacity: 0, duration: 3, repeat: -1, ease: "none", delay: -k }); }
      // acacias, round houses with solar home kits
      const acacia = (g, x, s) => { el("path", { d: `M${x - 0.6 * s} 0 L${x - 0.4 * s} ${-7 * s} L${x - 4 * s} ${-11 * s} L${x - 3.4 * s} ${-11.4 * s} L${x} ${-8 * s} L${x + 3.4 * s} ${-11.4 * s} L${x + 4 * s} ${-11 * s} L${x + 0.4 * s} ${-7 * s} L${x + 0.6 * s} 0 Z`, fill: S5.br5 }, g); el("path", { d: `M${x - 11 * s} ${-11 * s} Q${x - 6 * s} ${-16 * s} ${x} ${-15.6 * s} Q${x + 6 * s} ${-16 * s} ${x + 11 * s} ${-11 * s} Q${x} ${-12.4 * s} ${x - 11 * s} ${-11 * s} Z`, fill: C.g4 }, g); };
      acacia(mid.base, -58, 0.8); acacia(mid.base, 60, 0.9);
      const hut = (x, s) => { const g = mid.base; el("rect", { x: x - 6 * s, y: -7 * s, width: 12 * s, height: 7 * s, fill: PAL.stone }, g); el("path", { d: `M${x - 8.4 * s} ${-6.6 * s} Q${x - 4 * s} ${-12 * s} ${x} ${-15 * s} Q${x + 4 * s} ${-12 * s} ${x + 8.4 * s} ${-6.6 * s} Z`, fill: PAL.thatch }, g); el("rect", { x: x - 1.4 * s, y: -5 * s, width: 2.8 * s, height: 5 * s, fill: S5.br5 }, g); };
      hut(-32, 0.9); hut(-19, 1); hut(-6, 0.85);
      [-25.5, -12.5].forEach((x) => { el("rect", { x: x - 0.3, y: -9, width: 0.6, height: 9, fill: C.n4 }, mid.green); SVG.panelQuad(mid.green, [[x - 3.4, -11], [x + 3.4, -11], [x + 4.2, -9], [x - 2.6, -9]], 2, 1); });
      // fossil: a diesel generator; green: a solar mini-grid with a battery container
      el("rect", { x: 14, y: -6, width: 12, height: 6, rx: 0.8, fill: C.n3 }, mid.fossil); el("rect", { x: 15.4, y: -4.6, width: 6, height: 2.4, fill: C.n4 }, mid.fossil); el("rect", { x: 22, y: -10, width: 1.6, height: 4, fill: C.n4 }, mid.fossil); R.smoke(mid.fossil, 22.8, -11);
      R.solar(mid.green, 8, 22, 2); R.battery(mid.green, 36, 1);
      // a woman with a water jar, a child, a motorbike taxi
      const w = R.person(front.base, -20, { dress: S5.o3, hairStyle: "scarf", scarfCol: C.g4, arms: { R: "up" } }); const [hx, hy] = w.hand("R"); el("ellipse", { cx: hx, cy: hy - 1.2, rx: 1.4, ry: 1.2, fill: "#C96F4A" }, front.base);
      R.person(front.base, -13, { kid: true, s: 0.028, top: C.y3 });
      const boda = R.moto(front.base, PAL.red); gsap.fromTo(boda, { x: 2 }, { x: 52, duration: 5, repeat: -1, ease: "none" }); }
    const afFlag = placeFlag(af, (g, w, h) => {
      el("rect", { x: 0, y: 0, width: w, height: h, fill: "#078930" }, g);
      el("circle", { cx: w / 2, cy: h / 2, r: h * 0.32, fill: C.w }, g);
      for (let k = 0; k < 22; k++) { const a = (k * Math.PI * 2) / 22; starN(g, w / 2 + Math.cos(a) * h * 0.38, h / 2 + Math.sin(a) * h * 0.38, h * 0.035, 5, "#FCDD09"); }
      el("path", { d: `M${w * 0.44} ${h * 0.27} L${w * 0.56} ${h * 0.26} L${w * 0.6} ${h * 0.4} L${w * 0.62} ${h * 0.45} L${w * 0.56} ${h * 0.6} L${w * 0.53} ${h * 0.74} L${w * 0.49} ${h * 0.74} L${w * 0.47} ${h * 0.56} L${w * 0.4} ${h * 0.48} L${w * 0.38} ${h * 0.38} Z`, fill: "#078930" }, g);
    }, 1.5);
    gsap.set([...us.green, ...as.green, ...af.green], { opacity: 0 });

    // ---------- small node tableaux: a patch of ground with one thing on it, drawn in local units and scaled onto the map ----------
    const node = (parent, [x, y], kind, k) => {
      const wrap = el("g", { "data-nowobble": "" }, parent), g = el("g", { transform: `translate(${x} ${y}) scale(${k || 0.4})` }, wrap);
      if (window.ISOJ) { ISOJ.node(g, kind); return wrap; }   // isometric patch instead
      el("ellipse", { cx: 0, cy: 1.5, rx: 30, ry: 6, fill: kind === "solar" ? "#E8E3C8" : C.g2 }, g);
      const slim = (tx, h, dur) => {   // a slender turbine: thin tapered tower, small nacelle, long narrow blades
        el("ellipse", { cx: tx, cy: 0, rx: 1.6, ry: 0.5, fill: C.n2 }, g);
        el("path", { d: `M${tx - 0.9} 0 L${tx - 0.4} ${-h} L${tx + 0.4} ${-h} L${tx + 0.9} 0 Z`, fill: C.w }, g);
        el("rect", { x: tx - 0.9, y: -h - 0.9, width: 3.2, height: 1.8, rx: 0.6, fill: C.w }, g);
        const rot = el("g", null, g), L = h * 0.44;
        for (let b = 0; b < 3; b++) el("path", { d: `M${tx} ${-h} C${tx - 1.2} ${-h - L * 0.3} ${tx - 0.6} ${-h - L * 0.85} ${tx} ${-h - L} C${tx + 0.4} ${-h - L * 0.6} ${tx + 0.8} ${-h - L * 0.25} ${tx} ${-h} Z`, fill: C.w, transform: `rotate(${b * 120} ${tx} ${-h})` }, rot);
        el("circle", { cx: tx, cy: -h, r: 0.9, fill: C.n2 }, rot);
        SVG.spinAt(rot, tx, -h, dur, Math.random() * 120);
      };
      const panels = (x0, x1, y0, n) => { const w = (x1 - x0) / n; for (let i = 0; i < n; i++) { const a = x0 + i * w + 0.5, b = a + w - 1; [a + 1.5, b - 1.5].forEach((lx) => el("rect", { x: lx, y: y0 - 1.6, width: 0.6, height: 1.6, fill: C.n4 }, g)); SVG.panelQuad(g, [[a + 2.4, y0 - 6.2], [b + 2.4, y0 - 6.2], [b, y0 - 1.6], [a, y0 - 1.6]], 3, 1); } };
      if (kind === "wind") { slim(-14, 25, 2.6); slim(1, 31, 3.1); slim(16, 23, 2.8); }
      if (kind === "solar") { panels(-24, 22, -5, 3); panels(-26, 20, 0.6, 3); }
      if (kind === "dc") {   // a data centre: a long low hall, chillers on the roof, racks of blinking servers behind a glass front
        el("rect", { x: -21, y: -12, width: 42, height: 12, fill: C.n1 }, g);
        el("rect", { x: -22, y: -13.6, width: 44, height: 1.8, fill: C.n3 }, g);
        [-15, -3, 9].forEach((fx) => { el("rect", { x: fx - 1, y: -17.4, width: 8, height: 3.8, fill: C.n2 }, g); el("circle", { cx: fx + 3, cy: -15.5, r: 1.3, fill: C.n4 }, g); });
        el("rect", { x: -18, y: -9.4, width: 36, height: 6.6, fill: C.n5 }, g);
        for (let r = 0; r < 6; r++) { el("rect", { x: -17 + r * 6, y: -8.6, width: 4.4, height: 5, fill: C.n4 }, g); [0, 1, 2].forEach((j) => el("rect", { x: -16.2 + r * 6 + (j % 2) * 2, y: -7.8 + j * 1.6, width: 0.9, height: 0.7, fill: C.g3, class: "twinkle", style: `animation-delay:${-(r * 3 + j) * 0.23}s` }, g)); }
        el("rect", { x: -3, y: -2.6, width: 6, height: 2.6, fill: C.n3 }, g);
        el("rect", { x: 23, y: -5, width: 5, height: 5, fill: C.g4 }, g); el("path", { d: "M25.9 -4.2 L24.6 -2.4 L26 -2.4 L25 -0.8", stroke: C.y3, "stroke-width": 0.5, fill: "none" }, g);   // its own substation
      }
      if (kind === "town") { [[-15, PAL.cream, C.n3, 9, 7], [-3, PAL.brick, S5.br4, 10, 8], [9, PAL.sage, C.n4, 9, 6.5]].forEach(([hx, body, roof, w, h]) => { el("rect", { x: hx - w / 2, y: -h, width: w, height: h, fill: body }, g); el("path", { d: `M${hx - w / 2 - 1} ${-h} L${hx} ${-h - w * 0.45} L${hx + w / 2 + 1} ${-h} Z`, fill: roof }, g); el("rect", { x: hx - 1, y: -3.4, width: 2, height: 3.4, fill: S5.br5 }, g); R.roofPV(g, hx + 0.6, -h - w * 0.38, hx + w / 2 - 0.4, -h - 1.2, 2); }); R.tree(g, 21, 0.9); }
      if (kind === "store") { [-22, -11, 0].forEach((bx) => { el("rect", { x: bx, y: -7, width: 10, height: 7, fill: C.w }, g); el("rect", { x: bx, y: -7, width: 10, height: 1.4, fill: C.g4 }, g); [2, 4.4, 6.8].forEach((vx) => el("rect", { x: bx + vx, y: -4.6, width: 0.7, height: 3.6, fill: C.n2 }, g)); }); el("rect", { x: 13, y: -5, width: 5, height: 5, fill: C.n2 }, g); slim(23, 22, 2.9); }
      if (kind === "village") { el("rect", { x: -24, y: -7, width: 11, height: 7, fill: PAL.stone }, g); el("path", { d: "M-26 -7 L-18.5 -13 L-11 -7 Z", fill: PAL.thatch }, g); el("rect", { x: -20, y: -4, width: 3, height: 4, fill: S5.br5 }, g); el("path", { d: "M-13 -4 Q-9 -6 -6 -4", stroke: C.n4, "stroke-width": 0.5, fill: "none" }, g);
        panels(-6, 26, -4.6, 2); panels(-8, 24, 1, 2); }
      if (kind === "geo") { el("rect", { x: -16, y: -8, width: 18, height: 8, fill: C.n1 }, g); el("rect", { x: -2, y: -14, width: 4, height: 6, fill: C.n2 }, g); el("path", { d: "M2 -3 L22 -3", stroke: C.n3, "stroke-width": 1.2 }, g); el("rect", { x: 16, y: -6, width: 6, height: 6, fill: C.n2 }, g);
        for (let q = 0; q < 2; q++) { const c = el("circle", { cx: 0, cy: -15, r: 2.4, fill: C.w, opacity: 0.9 }, g); gsap.fromTo(c, { attr: { cy: -15, r: 2 }, opacity: 0.9 }, { attr: { cy: -28, r: 5 }, opacity: 0, duration: 2.6, repeat: -1, ease: "none", delay: -q * 1.3 }); } }
      return wrap;
    };

    // ---------- J7 the world again: AI data centres rise everywhere, each on its own patch of ground ----------
    const DCg = el("g", { "data-nowobble": "" }, svg);
    const dcKeys = ["oregon", "phoenix", "dallas", "iowaDC", "virginiaDC", "quebec", "queretaro", "saopaulo", "santiago", "dublin", "london", "amsterdam", "frankfurt", "paris", "madrid", "milan", "stockholm",
      "istanbul", "cairo", "riyadh", "uae", "lagos", "nairobi", "johannesburg", "delhi", "mumbai", "chennai", "beijingDC", "shanghaiDC", "guizhou", "shenzhen", "seoul", "tokyo", "bangkok", "hcmc", "singaporeDC", "jakartaDC", "manila", "sydney", "melbourne"];
    // data centres that would land on a tableau are left out (the tableau stands in for them), and the rest sit behind the tableaux
    const TABS = [eu, cn, au, us, br, as, af];
    const underTab = (k) => TABS.some((t) => Math.abs(PT[k][0] - t.x) < 80 && PT[k][1] - t.y > -62 && PT[k][1] - t.y < 22);
    const hiddenDC = new Set(dcKeys.filter(underTab));
    for (let i = dcKeys.length - 1; i >= 0; i--) if (hiddenDC.has(dcKeys[i])) dcKeys.splice(i, 1);
    svg.insertBefore(DCg, EU);
    const dcs = dcKeys.slice().sort((a, b) => PT[a][1] - PT[b][1]).map((k) => {
      const [x, y] = PT[k], wrap = node(DCg, [x, y + 3], "dc", 0.34), g = wrap.firstChild; wrap.dataset.key = k;
      const ring = el("circle", { cx: 0, cy: -8, r: 10, fill: "none", stroke: C.g3, "stroke-width": 1.2 }, g); gsap.fromTo(ring, { attr: { r: 10 }, opacity: 0.8 }, { attr: { r: 34 }, opacity: 0, duration: 2.2, repeat: -1, ease: "power1.out", delay: -((x + y) % 22) / 10 });
      gsap.set(wrap, { scale: 0, svgOrigin: `${x} ${y + 3}` });
      return wrap;
    });

    // ---------- J8 each region grows its own grid, linking its tableau, its cities and its data centres ----------
    PT.euT = [eu.x, eu.y]; PT.cnT = [cn.x, cn.y]; PT.usT = [us.x, us.y]; PT.asT = [as.x, as.y]; PT.auT = [au.x, au.y]; PT.brT = [br.x, br.y]; PT.afT = [af.x, af.y];
    const REGIONS = [
      ["oregon", "phoenix", "dallas", "iowaDC", "virginiaDC", "quebec", "queretaro", "usT"],
      ["saopaulo", "santiago", "brT"],
      ["dublin", "london", "amsterdam", "paris", "madrid", "frankfurt", "milan", "stockholm", "istanbul", "euT"],
      ["cairo", "riyadh", "uae"], ["nairobi", "afT", "johannesburg", "lagos"],
      ["delhi", "mumbai", "chennai"],
      ["beijingDC", "shanghaiDC", "guizhou", "shenzhen", "seoul", "tokyo", "cnT"],
      ["bangkok", "hcmc", "singaporeDC", "jakartaDC", "manila", "asT"],
      ["sydney", "melbourne", "auT"]
    ];
    REGIONS.forEach((r, i) => { REGIONS[i] = r.filter((k) => !hiddenDC.has(k)); });
    const links = el("g", { class: "drawn" }, svg), linkPaths = []; svg.insertBefore(links, DCg);   // lines run behind the data centres and into the tableaux
    const dist = (a, b) => Math.hypot(PT[a][0] - PT[b][0], PT[a][1] - PT[b][1]);
    REGIONS.forEach((keys) => {
      if (keys.length < 2) return;
      // a minimum spanning tree: each region's grid branches out from its hubs
      const inT = new Set([keys[0]]), edges = [];
      while (inT.size < keys.length) {
        let best = null;
        keys.forEach((a) => { if (!inT.has(a)) return; keys.forEach((b) => { if (inT.has(b)) return; const d = dist(a, b); if (!best || d < best[2]) best = [a, b, d]; }); });
        edges.push(best); inT.add(best[1]);
      }
      const spare = [];
      keys.forEach((a, i) => keys.slice(i + 1).forEach((b) => { if (!edges.some((e) => (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a))) spare.push([a, b, dist(a, b)]); }));
      // no extra loops: each region's grid is a branching tree
      edges.forEach(([a, b]) => { const [x1, y1] = PT[a], [x2, y2] = PT[b]; linkPaths.push(el("path", { d: `M${x1} ${y1} Q${(x1 + x2) / 2 + (y2 - y1) * 0.12} ${(y1 + y2) / 2 - (x2 - x1) * 0.12} ${x2} ${y2}`, stroke: C.g4, "stroke-width": 1.3, fill: "none", "stroke-linecap": "round" }, links)); });
    });
    const flow = el("g", { opacity: 0 }, svg); linkPaths.forEach((p) => pulseAlong(flow, p, 1, C.g3, 2.4, 1.6));
    // the network sits under the places it connects
    [links, flow].forEach((n) => svg.insertBefore(n, DCg));

    // ---------- the camera ----------
    const bgRect = svg.firstElementChild;
    const cam = el("g", null, svg);
    [...svg.children].filter((n) => n !== bgRect && n !== cam && n.tagName !== "defs").forEach((n) => cam.appendChild(n));
    gsap.set(cam, { x: 0, y: 0, scale: 1, svgOrigin: "0 0" });
    const camTo = (px, py, s, t, d) => tl.to(cam, { x: 860 - s * px, y: 420 - s * py, scale: s, duration: d || 0.7, ease: "power2.inOut" }, t);
    const raise = (f, t) => tl.to(f, { scaleY: 1, duration: 0.3, ease: "back.out(1.8)" }, t);
    const grow = (list, t, span) => list.forEach((g, i) => tl.to(g, { scale: 1, duration: 0.22, ease: "back.out(2)" }, t + (i / Math.max(1, list.length - 1)) * (span || 0.4)));

    // --- timeline ---
    gsap.set(dotList, { scale: 0, transformOrigin: "50% 50%" });
    tl.to(dotList, { scale: 1, duration: 0.2, stagger: 0.02, ease: "back.out(2)" }, B(0) + 0.05);                 // K1: electrostates light up
    const showT = (t, at) => tl.to(t.wrap, { scale: 1, duration: 0.35, ease: "back.out(1.6)" }, at);
    // J3 Europe
    camTo(eu.x, eu.y - 26, 3.4, B(1) - 0.15, 0.5); tl.to(dots, { opacity: 0, duration: 0.25 }, B(1) - 0.15);
    showT(eu, B(1) + 0.15); raise(euFlag, B(1) + 0.3);
    // J4 China, then on to Australia
    camTo(cn.x, cn.y - 26, 3.4, B(2) - 0.15, 0.42);
    showT(cn, B(2) + 0.0); raise(cnFlag, B(2) + 0.1);
    camTo(au.x, au.y - 26, 3.4, B(2) + 0.42, 0.38);
    showT(au, B(2) + 0.5); raise(auFlag, B(2) + 0.58);
    // J5 United States (fossil, then the switch), then on to Brazil
    camTo(us.x, us.y - 26, 3.4, B(3) - 0.1, 0.36);
    showT(us, B(3) - 0.07); raise(usFlag, B(3) + 0.02);
    tl.to(us.fossil, { opacity: 0, duration: 0.12 }, B(3) + 0.22); tl.to(us.green, { opacity: 1, duration: 0.18 }, B(3) + 0.25);
    camTo(br.x, br.y - 26, 3.4, B(3) + 0.46, 0.34);
    showT(br, B(3) + 0.5); raise(brFlag, B(3) + 0.58);
    // J6 ASEAN: the camera arrives, the carrier sails in from the Gulf and berths, then the gas gives way; then on to Africa (diesel, then a solar mini-grid)
    camTo(as.x - 6, as.y - 26, 3.2, B(4) + 0.05, 0.3);
    showT(as, B(4) + 0.08); raise(asFlag, B(4) + 0.16);
    tl.to([lngRoute, ship], { opacity: 1, duration: 0.05 }, B(4) + 0.18);
    tl.to(sail, { p: 1, duration: 0.26, ease: "power2.out", onUpdate: placeShip }, B(4) + 0.2);
    tl.to([lngRoute, ship, ...as.fossil], { opacity: 0, duration: 0.1 }, B(4) + 0.53); tl.to(as.green, { opacity: 1, duration: 0.18 }, B(4) + 0.56);
    camTo(af.x, af.y - 26, 3.4, B(4) + 0.76, 0.32);
    showT(af, B(4) + 0.8); raise(afFlag, B(4) + 0.88);
    tl.to(af.fossil, { opacity: 0, duration: 0.1 }, B(4) + 1.02); tl.to(af.green, { opacity: 1, duration: 0.16 }, B(4) + 1.05);
    // K6 the whole world: AI data centres everywhere
    camTo(860, 420, 1, B(5) + 0.34, 0.4);
    grow(dcs, B(5) + 0.55, 0.25);
    // K7 each region's grid grows
    linkPaths.forEach((p, i) => drawOn(tl, p, B(6) + (i / linkPaths.length) * 0.35, 0.2));
    tl.to(flow, { opacity: 1, duration: 0.3 }, B(6) + 0.45);
    // the world map's own elements, for the steps that follow
    const vigsAll = [EU, CN, US, AS, AU, BR, AF, DCg, ...[euFlag, cnFlag, usFlag, asFlag, auFlag, brFlag, afFlag].map((f) => f.parentNode)];
    // keep line weights steady while zoomed (applied after the hand-drawn pass has added its ink)
    requestAnimationFrame(() => cam.querySelectorAll("[stroke]").forEach((n) => { if (n.closest(".drawn")) return; n.setAttribute("vector-effect", "non-scaling-stroke"); if (n.getAttribute("stroke-opacity") === "0.55") n.setAttribute("stroke-width", "0.9"); }));   // ink is a constant fine pen line on screen, however small the object (no more chubby outlines on scaled-down pieces)   // lines that draw on keep normal strokes, so their dash trick still works
    const allVigs = vigsAll;
    const growing = [AS, AF];
    const devDots = dotList.filter((d, i) => [6, 7, 8, 9, 10, 11, 12, 13, 17, 21].includes(i));

    // K9: undersea cables between Indonesia's islands
    const Lg = el("g", null, cam);
    const isl = { sumatraN: [1164, 464], sumatraS: [1188, 499], java: [1210, 512], bali: [1235, 518], borneoS: [1229, 492], borneoW: [1211, 478], sulawesi: [1252, 494], sulawesiN: [1272, 471], papua: [1328, 497], maluku: [1285, 493], timor: [1269, 521], singapore: [1186, 472], flores: [1255, 518] };
    const cableG = el("g", { class: "drawn" }, Lg);
    const cables = [["sumatraN", "singapore"], ["singapore", "borneoW"], ["sumatraS", "java"], ["java", "borneoS"], ["borneoS", "sulawesi"], ["java", "bali"], ["bali", "flores"], ["flores", "timor"], ["sulawesi", "maluku"], ["maluku", "papua"], ["sulawesi", "sulawesiN"], ["borneoW", "borneoS"]]
      .map(([a, b]) => { const [x1, y1] = isl[a], [x2, y2] = isl[b]; return el("path", { d: `M${x1} ${y1} Q${(x1 + x2) / 2 + (y2 - y1) * 0.25} ${(y1 + y2) / 2 + 3} ${x2} ${y2}`, stroke: C.b4, "stroke-width": 0.8, fill: "none" }, cableG); });
    const cableFlow = el("g", { opacity: 0 }, Lg); cables.forEach((p) => pulseAlong(cableFlow, p, 1, C.y3, 2.2, 1.1));
    const towns = el("g", { opacity: 0 }, Lg); Object.values(isl).forEach(([x, y]) => el("circle", { cx: x, cy: y, r: 1.4, fill: C.y3 }, towns));

    // K10: solar villages across Africa and South Asia
    const villageAt = [[792, 431], [722, 450], [903, 508], [836, 514], [948, 566], [1122, 367], [1090, 380], [1094, 348]];
    const villages = villageAt.map(([x, y]) => {
      const v = node(Lg, [x, y], "village", 0.36);
      gsap.set(v, { scale: 0, svgOrigin: `${x} ${y}` });
      return v;
    });

    // a dendritic grid: trunks leave a tableau from the edge of its ground, split at junctions, and branch out to the places they serve — no rings
    const rim = (t, side, x) => side === "L" ? [t.x - 68, t.y + 4] : side === "R" ? [t.x + 68, t.y + 4] : [x, t.y + 3 + 13 * Math.sqrt(1 - ((x - t.x) / 72) ** 2) - 1.5];
    const dendrite = (g, dots, P, edges, col, wt) => edges.map(([a, b, lvl], i) => {
      const [x1, y1] = P[a], [x2, y2] = P[b], dx = x2 - x1, dy = y2 - y1, bend = (i % 2 ? 1 : -1) * 0.1;
      const p = el("path", { d: `M${x1} ${y1} Q${(x1 + x2) / 2 - dy * bend} ${(y1 + y2) / 2 + dx * bend} ${x2} ${y2}`, stroke: col, "stroke-width": wt[lvl], fill: "none", "stroke-linecap": "round" }, g);
      p.dataset.lvl = lvl; p.dataset.w = [1.9, 1.3, 0.9][lvl];
      return p; }).concat(Object.keys(P).filter((k) => /^j/.test(k)).map((k) => { el("circle", { cx: P[k][0], cy: P[k][1], r: 1.5, fill: col }, dots); return null; })).filter(Boolean);

    // K11: Africa builds straight for this age — a new grid of curved cables linking the tableau, the solar villages, new wind and geothermal, and the data centres
    const afNodes = el("g", null, Lg);
    const AFN = { cairo: PT.cairo, lagos: PT.lagos, johannesburg: PT.johannesburg, v0: villageAt[0], v2: villageAt[1], v4: villageAt[2], v6: villageAt[3], v8: villageAt[4],
      wW: [743, 415], wE: [996, 446], sZ: [873, 543], sM: [906, 556], afWind: [962, 538], afGeo: [930, 526], afSolar: [812, 402], wCape: [850, 632], sNam: [832, 588], sEg: [930, 395],
      aL: rim(af, "L"), aR: rim(af, "R"), aF1: rim(af, "F", 870), aF2: rim(af, "F", 912), jW: [812, 470], jSW: [862, 508], jS: [920, 532] };
    const afEdges = [["aL", "jW", 0], ["jW", "v0", 1], ["v0", "afSolar", 2], ["v0", "wW", 2], ["jW", "v2", 1], ["v2", "lagos", 2],
      ["aF1", "jSW", 0], ["jSW", "v6", 1], ["jSW", "sZ", 1], ["sZ", "sNam", 2], ["aF2", "v4", 0], ["v4", "jS", 1], ["jS", "sM", 1], ["sM", "johannesburg", 2], ["johannesburg", "wCape", 2], ["jS", "afGeo", 1], ["afGeo", "afWind", 2], ["afGeo", "v8", 2],
      ["aR", "wE", 0], ["wE", "sEg", 1], ["sEg", "cairo", 2]];
    const afLineG = el("g", { class: "drawn" }, Lg), afDots = el("g", null, Lg);
    const afLines = dendrite(afLineG, afDots, AFN, afEdges, C.g4, [1.4, 1.0, 0.7]);
    const afFlow = el("g", { opacity: 0 }, Lg); afLines.forEach((p) => pulseAlong(afFlow, p, 1, C.y3, 2.2, 1.2));
    const afNew = [["wW", "wind"], ["wE", "wind"], ["afWind", "wind"], ["wCape", "wind"], ["sZ", "solar"], ["sM", "solar"], ["afSolar", "solar"], ["sNam", "solar"], ["sEg", "solar"], ["afGeo", "geo"]].map(([k, kind]) => node(afNodes, AFN[k], kind, 0.44));
    afNew.forEach((n) => { const [x, y] = [+n.firstChild.transform.baseVal[0].matrix.e, +n.firstChild.transform.baseVal[0].matrix.f]; gsap.set(n, { scale: 0, svgOrigin: `${x} ${y}` }); });
    // all of it under the tableaux: lines first, then the villages and the new nodes
    [afLineG, afDots, afFlow, cableG, cableFlow].forEach((n) => cam.insertBefore(n, DCg)); gsap.set(afDots, { opacity: 0 });
    villages.forEach((v) => cam.insertBefore(v, EU)); [afNodes, towns].forEach((n) => cam.insertBefore(n, EU));

    // K12: older grids — grey networks in North America and Europe, upgraded in place
    const oldG = el("g", { class: "drawn" }, Lg);
    // the network: curved cables like Indonesia's, running from each tableau out to the data centres and to small patches of new generation
    const N = { quebec: PT.quebec, queretaro: PT.queretaro, usNW: [298, 256], usCA: [288, 318], usTX: [398, 348], usSE: [470, 342], usNE: [498, 300], usMW: [440, 214], usMt: [350, 222],
      uL: rim(us, "L"), uR: rim(us, "R"), uF: rim(us, "F", 404), jUW: [306, 298], jUS: [400, 334], jUE: [484, 312],
      madrid: PT.madrid, istanbul: PT.istanbul, euIE: [694, 238], euPT: [718, 302], euIT: [814, 300], euNS: [758, 158], euNO: [838, 150], euPL: [892, 238],
      eL: rim(eu, "L"), eR: rim(eu, "R"), eF: rim(eu, "F", 800), jES: [800, 284], jEE: [878, 262] };
    const oldEdges = [["uL", "jUW", 0], ["jUW", "usCA", 1], ["jUW", "usNW", 1], ["usNW", "usMt", 2], ["usMt", "usMW", 2], ["uF", "jUS", 0], ["jUS", "usTX", 1], ["usTX", "queretaro", 2], ["uR", "jUE", 0], ["jUE", "usSE", 1], ["jUE", "usNE", 1], ["usNE", "quebec", 2],
      ["eL", "euIE", 0], ["euIE", "euNS", 1], ["euNS", "euNO", 2], ["eF", "jES", 0], ["jES", "madrid", 1], ["madrid", "euPT", 2], ["jES", "euIT", 1], ["eR", "jEE", 0], ["jEE", "euPL", 1], ["jEE", "istanbul", 1]];
    const oldDots = el("g", null, oldG);
    const oldLines = dendrite(oldG, oldDots, N, oldEdges, C.n3, [1.2, 0.9, 0.7]);
    const oldFlow = el("g", { opacity: 0 }, Lg); oldLines.forEach((p) => pulseAlong(oldFlow, p, 1, C.y3, 2.2, 1.4));
    // each node is a little tableau of its own: wind, solar, a town, storage
    const oldNodes = el("g", { "data-nowobble": "" }, Lg);
    const mini = (pt, kind) => node(oldNodes, pt, kind, 0.52);
    [["usNW", "wind"], ["usCA", "solar"], ["usTX", "wind"], ["usSE", "solar"], ["usNE", "town"], ["usMW", "wind"], ["usMt", "store"],
     ["euIE", "wind"], ["euPT", "solar"], ["euIT", "solar"], ["euNS", "wind"], ["euNO", "store"], ["euPL", "town"]].forEach(([k, kind]) => mini(N[k], kind));
    // the whole network sits behind the tableaux (lines, then pulses, then the little nodes)
    [oldG, oldFlow].forEach((n) => cam.insertBefore(n, DCg)); cam.insertBefore(oldNodes, EU);

    gsap.set([oldG, oldNodes, towns], { opacity: 0 });
    // K8: for nations still building — the camera moves to Africa and Asia
    tl.to([links, flow], { opacity: 0, duration: 0.3 }, B(7));
    tl.to(allVigs.filter((g) => !growing.includes(g)), { opacity: 0.3, duration: 0.3 }, B(7));
    tl.to(devDots, { scale: 1.8, duration: 0.3 }, B(7) + 0.1);
    camTo(1010, 440, 1.5, B(7));
    // K9: Indonesia's islands, linked by undersea cable
    camTo(1245, 492, 3.4, B(8));
    tl.to(allVigs, { opacity: 0.08, duration: 0.25 }, B(8));
    tl.to(devDots, { scale: 0.6, duration: 0.25 }, B(8));
    tl.to(towns, { opacity: 1, duration: 0.2 }, B(8) + 0.3);
    cables.forEach((p, i) => drawOn(tl, p, B(8) + 0.35 + i * 0.03, 0.3));
    tl.to(cableFlow, { opacity: 1, duration: 0.2 }, B(8) + 0.7);
    // K10: solar villages across Africa and South Asia
    camTo(960, 450, 2.1, B(9));
    tl.to(allVigs.filter((g) => !growing.includes(g)), { opacity: 0.3, duration: 0.25 }, B(9));
    tl.to(growing, { opacity: 1, duration: 0.25 }, B(9));
    tl.to(devDots, { scale: 1, duration: 0.25 }, B(9));
    tl.to(villages, { scale: 1, duration: 0.25, stagger: 0.04, ease: "back.out(2)" }, B(9) + 0.3);
    // K11: Africa builds straight for this age — its own new grid grows out from the tableau; the camera frames the whole continent and everything else steps away
    const AFRICA_DC = ["lagos", "johannesburg", "cairo"];
    const notAfrica = [...allVigs.filter((g) => g !== AF && g !== DCg && g !== afFlag.parentNode), ...dcs.filter((d) => !AFRICA_DC.includes(d.dataset.key)), ...villages.slice(5), cableG, cableFlow, towns];
    camTo(760, 471, 2.35, B(10));
    tl.to(notAfrica, { opacity: 0, duration: 0.2 }, B(10));
    tl.to([AF, afFlag.parentNode, DCg], { opacity: 1, duration: 0.2 }, B(10));
    tl.to(devDots, { scale: 0, duration: 0.2 }, B(10));
    tl.to(afNew, { scale: 1, duration: 0.25, stagger: 0.06, ease: "back.out(2)" }, B(10) + 0.15);
    afLines.forEach((p, i) => drawOn(tl, p, B(10) + 0.28 + +p.dataset.lvl * 0.13 + (i % 4) * 0.015, 0.16));   // trunks first, then branches, then twigs
    tl.to(afDots, { opacity: 1, duration: 0.1 }, B(10) + 0.4);
    tl.to(afFlow, { opacity: 1, duration: 0.2 }, B(10) + 0.7);
    // K12: older grids are transformed, not started over (all of it lands by the time the last card is centred)
    camTo(600, 262, 1.75, B(11), 0.5);
    tl.to([cableFlow, cableG, afFlow, afLineG, afDots, afNodes], { opacity: 0.35, duration: 0.2 }, B(11));
    tl.to(dcs, { opacity: 1, duration: 0.2 }, B(11));
    tl.to(allVigs, { opacity: 1, duration: 0.25 }, B(11) + 0.1);
    tl.to(devDots, { scale: 1, duration: 0.2 }, B(11));
    tl.to(villages, { opacity: 1, duration: 0.2 }, B(11));
    tl.to([oldG, oldNodes], { opacity: 1, duration: 0.2 }, B(11) + 0.05);
    oldLines.forEach((p, i) => tl.to(p, { attr: { stroke: C.g4, "stroke-width": p.dataset.w }, duration: 0.22 }, B(11) + 0.15 + +p.dataset.lvl * 0.05 + i * 0.002));
    tl.to(oldDots.children, { attr: { fill: C.g4 }, duration: 0.22 }, B(11) + 0.15);
    tl.to(oldFlow, { opacity: 1, duration: 0.15 }, B(11) + 0.35);
    hold(tl, DUR - 0.1);
    return tl;
  }

  /* ============ 14. TWO PATHS — leapfrog, or transform ============ */
  function paths(svg) {
    const tl = gsap.timeline({ paused: true });
    el("rect", { x: 0, y: 0, width: 1600, height: 900, fill: C.w }, svg);
    const A = { x: 560, y: 90, w: 500, h: 760 }, B = { x: 1080, y: 90, w: 500, h: 760 };
    const panel = (p, t, bg) => {
      const g = el("g", null, svg);
      el("rect", { x: p.x, y: p.y, width: p.w, height: p.h, rx: 8, fill: bg }, g);
      label(g, p.x + p.w / 2, p.y + 40, t, { "font-size": 14 });
      return g;
    };
    const pa = panel(A, "NATIONS STILL BUILDING", C.b1), pb = panel(B, "NATIONS WITH OLDER GRIDS", C.n1);
    // A: islands linked by an undersea cable
    const ay = A.y + 250;
    el("path", { d: `M${A.x} ${ay - 30} L${A.x + A.w} ${ay - 30} L${A.x + A.w} ${ay + 110} L${A.x} ${ay + 110} Z`, fill: C.b2 }, pa);
    const isl = [[A.x + 90, 70], [A.x + 250, 90], [A.x + 410, 70]].map(([x, w], i) => {
      const g = el("g", null, pa);
      el("path", { d: `M${x - w / 2} ${ay} Q${x} ${ay - 60} ${x + w / 2} ${ay} Z`, fill: C.g2 }, g);
      pine(g, x - 8, ay - 10, 0.5, C.g5); pine(g, x + 12, ay - 6, 0.4, C.g4);
      const lamps = [el("rect", { x: x - 18, y: ay - 16, width: 10, height: 10, fill: C.n2 }, g), el("rect", { x: x + 4, y: ay - 18, width: 10, height: 12, fill: C.n2 }, g)];
      return lamps;
    }).flat();
    const seaCab = el("path", { d: `M${A.x + 90} ${ay + 6} C${A.x + 150} ${ay + 90} ${A.x + 200} ${ay + 90} ${A.x + 250} ${ay + 6} C${A.x + 300} ${ay + 90} ${A.x + 360} ${ay + 90} ${A.x + 410} ${ay + 6}`, stroke: C.n5, "stroke-width": 4, fill: "none" }, pa);
    const seaDots = el("g", { opacity: 0 }, pa);
    label(pa, A.x + A.w / 2, ay + 140, "Undersea cables link islands", { "font-size": 12, "font-weight": 500, "letter-spacing": 0, fill: C.n3 });
    // A: a village with low-cost solar and a mobile mast (no landlines)
    const vy = A.y + 620;
    el("path", { d: `M${A.x} ${vy - 60} L${A.x + A.w} ${vy - 60} L${A.x + A.w} ${A.y + A.h} L${A.x} ${A.y + A.h} Z`, fill: C.y1 }, pa);
    const huts = [A.x + 90, A.x + 190, A.x + 290].map((x) => {
      const g = el("g", null, pa);
      el("rect", { x: x - 34, y: vy - 44, width: 68, height: 44, fill: C.br1 }, g);
      el("path", { d: `M${x - 42} ${vy - 44} L${x} ${vy - 76} L${x + 42} ${vy - 44} Z`, fill: C.br3 }, g);
      const pv = el("g", null, g); SVG.panelQuad(pv, [[x - 6, vy - 68], [x + 20, vy - 56], [x + 30, vy - 48], [x + 2, vy - 60]], 3, 2);
      const win = el("rect", { x: x - 10, y: vy - 32, width: 18, height: 16, fill: C.n2 }, g);
      return { pv, win };
    });
    const oldPoles = el("g", null, pa);
    [A.x + 60, A.x + 160, A.x + 260].forEach((x) => { el("rect", { x: x - 2, y: vy - 150, width: 4, height: 70, fill: C.br2 }, oldPoles); });
    el("path", { d: `M${A.x + 60} ${vy - 144} Q${A.x + 110} ${vy - 130} ${A.x + 160} ${vy - 144} Q${A.x + 210} ${vy - 130} ${A.x + 260} ${vy - 144}`, stroke: C.br2, "stroke-width": 1.5, "stroke-dasharray": "4 4", fill: "none" }, oldPoles);
    const mast = el("g", null, pa); const mx = A.x + 420;
    el("path", { d: `M${mx - 14} ${vy} L${mx} ${vy - 170} L${mx + 14} ${vy} M${mx - 9} ${vy - 50} L${mx + 9} ${vy - 50} M${mx - 6} ${vy - 100} L${mx + 6} ${vy - 100}`, stroke: C.n4, "stroke-width": 3, fill: "none" }, mast);
    [1, 2, 3].forEach((k) => el("path", { d: `M${mx - 8 - k * 10} ${vy - 172 - k * 8} Q${mx} ${vy - 182 - k * 12} ${mx + 8 + k * 10} ${vy - 172 - k * 8}`, stroke: C.b3, "stroke-width": 2.5, fill: "none", class: "twinkle", style: `animation-delay:${-k * 0.3}s` }, mast));
    const caller = P.person(mast, { x: mx - 70, y: vy + 4, s: 0.5, hairStyle: "scarf", scarfCol: C.o2, top: C.g4, bottom: C.n5, arms: { R: "hold" } });
    const [ch, cy] = caller.hand("R"); el("rect", { x: ch - 3.5, y: cy - 12, width: 7, height: 12, rx: 2, fill: C.n5 }, mast);
    label(pa, A.x + A.w / 2, A.y + A.h - 20, "Solar villages, mobile first", { "font-size": 12, "font-weight": 500, "letter-spacing": 0, fill: C.n3 });
    // B: an older grid, transformed rather than started over
    const by = B.y + 560;
    el("path", { d: `M${B.x} ${by - 80} L${B.x + B.w} ${by - 80} L${B.x + B.w} ${B.y + B.h} L${B.x} ${B.y + B.h} Z`, fill: C.g1 }, pb);
    const bst = el("g", null, pb);
    el("path", { d: `M${B.x + 40} ${by} C${B.x + 34} ${by - 60} ${B.x + 50} ${by - 90} ${B.x + 46} ${by - 130} L${B.x + 100} ${by - 130} C${B.x + 96} ${by - 90} ${B.x + 112} ${by - 60} ${B.x + 106} ${by} Z`, fill: C.n2 }, bst);
    const btw = [B.x + 190, B.x + 310, B.x + 430].map((x) => pylon(pb, x, by, 170, C.n3));
    const bline = []; [[-1, 0], [1, 0]].forEach(([sd, lo]) => { let d = `M${B.x + 100} ${by - 110}`; btw.forEach((t) => { const [x, y] = t.arm(sd, lo); d += ` Q${x - 60} ${y + 16} ${x} ${y}`; }); bline.push(el("path", { d, stroke: C.n3, "stroke-width": 2, fill: "none" }, pb)); });
    const ups = el("g", null, pb);
    const bat = el("g", null, ups); for (let k = 0; k < 3; k++) { el("rect", { x: B.x + 60 + k * 26, y: by + 40, width: 20, height: 46, rx: 3, fill: C.w }, bat); el("rect", { x: B.x + 60 + k * 26, y: by + 56, width: 20, height: 10, fill: C.y3 }, bat); }
    SVG.solarRow(ups, B.x + 180, by + 50, 4, 40, 12, { skew: -6, leg: 8, gap: 6 });
    SVG.turbine(ups, B.x + 450, by - 170, 120, { dur: 4 });
    const sensors = btw.map((t) => { const [x, y] = t.arm(1, 1); return token(ups, x + 18, y + 26, "gauge-high", C.b3, 12); });
    label(pb, B.x + B.w / 2, B.y + B.h - 20, "Transform, don't start over", { "font-size": 12, "font-weight": 500, "letter-spacing": 0, fill: C.n3 });

    gsap.set(pb, { opacity: 0.35 }); gsap.set(ups, { opacity: 0 }); gsap.set(huts.map((h) => h.pv), { opacity: 0 }); gsap.set(mast, { opacity: 0 });
    drawOn(tl, seaCab, beat(1), 0.5);
    tl.to(isl, { fill: C.y2, duration: 0.05, stagger: 0.04 }, beat(1) + 0.45);
    tl.add(() => { if (!seaDots.childNodes.length) pulseAlong(seaDots, seaCab, 4, C.g3, 2, 3.5); }, beat(1) + 0.4);
    tl.to(seaDots, { opacity: 1, duration: 0.2 }, beat(1) + 0.45);
    tl.to(huts.map((h) => h.pv), { opacity: 1, duration: 0.2, stagger: 0.1 }, beat(2));
    tl.to(huts.map((h) => h.win), { fill: C.y2, duration: 0.1, stagger: 0.1 }, beat(2) + 0.3);
    tl.to(oldPoles, { opacity: 0.25, duration: 0.3 }, beat(3));
    tl.to(mast, { opacity: 1, duration: 0.3 }, beat(3) + 0.1);
    tl.to(pa, { opacity: 0.45, duration: 0.3 }, beat(4));
    tl.to(pb, { opacity: 1, duration: 0.3 }, beat(4));
    tl.to(bline, { stroke: C.g4, "stroke-width": 3.5, duration: 0.3 }, beat(4) + 0.2);
    tl.to(ups, { opacity: 1, duration: 0.3 }, beat(4) + 0.3);
    hold(tl, 4);
    return tl;
  }

  Object.assign(window.SCENES, { timeline, telecom, feats, remade, electro, paths });
})();
