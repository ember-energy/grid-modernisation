/* Part 1 — the vision. Four illustrated scenes, each returning a paused GSAP timeline
   whose beats line up with the text steps (one beat per step). */
(function () {
  const { el, icon } = SVG;
  const C = {
    n5: "#192238", n4: "#3E4860", n3: "#626E88", n2: "#B0B7C6", n1: "#D8DBE6",
    g5: "#0B6638", g4: "#109553", g3: "#13CE74", g2: "#A3D9A5", g1: "#D3EADF",
    b5: "#203772", b4: "#1E609C", b3: "#37A6E6", b2: "#97CCED", b1: "#C4D9E9",
    // Browns and oranges/reds are each shifted one tone lighter (still Ember palette values) for a softer, pastel feel.
    o5: "#BF3100", o4: "#E04B00", o3: "#EE7309", o2: "#FCA311", o1: "#FCA311",
    br5: "#6D5A56", br4: "#857572", br3: "#B6B0AF", br2: "#D8D5D4", br1: "#D8D5D4",
    y5: "#B77A00", y4: "#CC9900", y3: "#FFC400", y2: "#FFDA44", y1: "#FFF4A3", w: "#FFFFFF"
  };
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // beat i starts a little before its text card is centred
  const beat = (i) => Math.max(0, i - 0.45);

  function sky(svg, id, top, bottom) {
    const defs = el("defs", null, svg);
    const lg = el("linearGradient", { id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el("stop", { offset: "0", "stop-color": top }, lg);
    el("stop", { offset: "1", "stop-color": bottom }, lg);
    el("rect", { x: 0, y: 0, width: 1600, height: 900, fill: `url(#${id})` }, svg);
    return defs;
  }
  function drawOn(tl, path, t, dur) {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    tl.to(path, { strokeDashoffset: 0, duration: dur, ease: "none" }, t);
  }
  function tree(g, x, y, s, col) {
    el("rect", { x: x - 3 * s, y: y - 18 * s, width: 6 * s, height: 18 * s, fill: C.br4 }, g);
    el("circle", { cx: x, cy: y - 30 * s, r: 18 * s, fill: col || C.g4 }, g);
  }
  function pine(g, x, y, s, col) {
    el("path", { d: `M${x} ${y - 70 * s} L${x + 20 * s} ${y - 8 * s} L${x - 20 * s} ${y - 8 * s} Z`, fill: col || C.g5 }, g);
    el("rect", { x: x - 3 * s, y: y - 10 * s, width: 6 * s, height: 10 * s, fill: C.br4 }, g);
  }
  function house(g, x, y, w, h, body, roof, win) {
    const hg = el("g", null, g);
    el("rect", { x, y: y - h, width: w, height: h, fill: body }, hg);
    el("path", { d: `M${x - 6} ${y - h} L${x + w / 2} ${y - h - w * 0.45} L${x + w + 6} ${y - h} Z`, fill: roof }, hg);
    const wins = [];
    const ww = Math.max(8, w * 0.18);
    for (let i = 0; i < 2; i++) {
      wins.push(el("rect", { x: x + w * (0.18 + i * 0.46), y: y - h * 0.7, width: ww, height: ww * 1.1, fill: win }, hg));
    }
    return { g: hg, wins };
  }
  function puffs(g, x, y, n, col, scale) {
    for (let i = 0; i < n; i++) {
      el("circle", { cx: x, cy: y, r: 14 * (scale || 1), fill: col, class: "puff", style: `animation-delay:${-(i * 3.2) / n}s` }, g);
    }
  }
  function wheel(g, cx, cy, r, col) {
    const wg = el("g", { class: "spin" }, g);
    el("circle", { cx, cy, r, fill: col }, wg);
    el("circle", { cx, cy, r: r * 0.62, fill: "none", stroke: C.br1, "stroke-width": 2 }, wg);
    el("line", { x1: cx - r * 0.62, y1: cy, x2: cx + r * 0.62, y2: cy, stroke: C.br1, "stroke-width": 2 }, wg);
    el("line", { x1: cx, y1: cy - r * 0.62, x2: cx, y2: cy + r * 0.62, stroke: C.br1, "stroke-width": 2 }, wg);
    return wg;
  }

  window.KIT = { C, sky, tree, pine, house, puffs, wheel, drawOn, beat };

  /* ================= RAILWAYS ================= */
  function rail(svg) {
    seed = 11;
    const tl = gsap.timeline({ paused: true });
    sky(svg, "sky-rail", C.br1, C.y1);
    const sun = el("circle", { cx: 1260, cy: 250, r: 42, fill: C.y2 }, svg);
    [[380, 150], [1000, 110]].forEach(([x, y]) => { el("ellipse", { cx: x, cy: y, rx: 120, ry: 14, fill: C.w, opacity: 0.6 }, svg); el("ellipse", { cx: x + 60, cy: y + 16, rx: 80, ry: 10, fill: C.w, opacity: 0.45 }, svg); });

    // distant city skyline (grows in beat 3)
    const skyline = el("g", null, svg);
    let sx = 220;
    while (sx < 1500) {
      const w = 40 + rnd() * 60, h = 70 + rnd() * 190;
      el("rect", { x: sx, y: 560 - h, width: w, height: h, fill: C.br2 }, skyline);
      if (rnd() > 0.6) el("rect", { x: sx + w * 0.3, y: 560 - h - 40, width: 10, height: 40, fill: C.br2 }, skyline);
      sx += w + 6 + rnd() * 16;
    }
    el("path", { d: "M0 520 C300 470 600 505 900 470 C1200 440 1400 480 1600 455 L1600 900 L0 900 Z", fill: C.br2, opacity: 0.45 }, svg);
    el("path", { d: "M0 560 C260 500 520 540 820 505 C1100 470 1380 530 1600 500 L1600 900 L0 900 Z", fill: C.br2 }, svg);
    el("path", { d: "M0 640 C380 590 860 650 1600 600 L1600 900 L0 900 Z", fill: C.g2 }, svg);

    // pre-industrial cottages + trees
    const rural = el("g", null, svg);
    house(rural, 260, 650, 60, 40, C.br1, C.br4, C.br4);
    house(rural, 980, 640, 54, 36, C.br1, C.br4, C.br4);
    house(rural, 1330, 625, 60, 40, C.br1, C.br4, C.br4);
    [120, 420, 700, 820, 1180, 1480].forEach((x, i) => tree(rural, x, 640 - (i % 2) * 10, 1.1, C.g4));

    // factories (beat 3) — sit behind the track
    const industry = el("g", null, svg);
    const factories = [];
    [[120, 250, 150], [430, 300, 190], [800, 240, 140], [1110, 320, 210], [1420, 220, 150]].forEach(([x, w, h], i) => {
      const f = el("g", null, industry);
      // chimney
      const cx = x + w * 0.7;
      el("rect", { x: cx, y: 735 - h - 150, width: 26, height: 150 + h, fill: C.br5 }, f);
      el("rect", { x: cx - 4, y: 735 - h - 158, width: 34, height: 12, fill: C.br5 }, f);
      puffs(f, cx + 13, 735 - h - 170, 4, C.n1, 1.3);
      // sawtooth body
      el("rect", { x, y: 735 - h, width: w, height: h, fill: i % 2 ? C.br4 : C.br3 }, f);
      el("rect", { x: x + w * 0.72, y: 735 - h, width: w * 0.28, height: h, fill: C.n5, opacity: 0.12 }, f);
      let d = `M${x} ${735 - h}`;
      const teeth = Math.round(w / 50);
      for (let t = 0; t < teeth; t++) {
        const tx = x + (w / teeth) * t;
        d += ` L${tx} ${735 - h - 34} L${tx + w / teeth} ${735 - h}`;
      }
      el("path", { d: d + " Z", fill: C.br5 }, f);
      for (let r = 0; r < Math.floor(w / 40); r++) {
        el("rect", { x: x + 14 + r * 40, y: 735 - h + 30, width: 20, height: 26, fill: C.y2 }, f);
        el("rect", { x: x + 14 + r * 40, y: 735 - h + 80, width: 20, height: 26, fill: C.y2 }, f);
      }
      factories.push(f);
    });
    // terraced houses
    const terraces = [];
    for (let i = 0; i < 12; i++) {
      const hx = 30 + i * 132 + (i % 3) * 8;
      const t = house(industry, hx, 752, 40, 34, i % 2 ? C.br3 : C.br4, C.br5, C.y2);
      terraces.push(t.g);
    }

    // the track
    const track = el("g", null, svg);
    el("rect", { x: 0, y: 772, width: 1600, height: 22, fill: C.br2 }, track);
    const sleepers = [];
    for (let x = 6; x < 1600; x += 34) sleepers.push(el("rect", { x, y: 766, width: 16, height: 12, fill: C.br5 }, track));
    const railLine = el("path", { d: "M0 764 L1600 764", stroke: C.n5, "stroke-width": 7, fill: "none" }, track);
    const poles = el("g", { opacity: 0 }, svg);
    let wire = "M0 690";
    for (let x = 100; x < 1650; x += 240) {
      el("line", { x1: x, y1: 684, x2: x, y2: 772, stroke: C.br5, "stroke-width": 4 }, poles);
      el("line", { x1: x - 14, y1: 690, x2: x + 14, y2: 690, stroke: C.br5, "stroke-width": 3 }, poles);
      wire += ` Q${x - 120} 704 ${x} 690`;
    }
    el("path", { d: wire, stroke: C.br5, "stroke-width": 1.2, fill: "none" }, poles);
    el("rect", { x: 0, y: 794, width: 1600, height: 106, fill: C.g1 }, svg);

    // horse & cart (beat 0) — a loaded farm cart, the fastest freight of its day
    const cart = el("g", null, svg);
    const gy = 872;
    // load: sacks, a barrel and hay
    el("path", { d: `M48 ${gy - 60} Q52 ${gy - 84} 72 ${gy - 86} Q90 ${gy - 88} 94 ${gy - 60} Z`, fill: C.br1 }, cart);
    el("path", { d: `M84 ${gy - 60} Q88 ${gy - 90} 110 ${gy - 92} Q130 ${gy - 90} 132 ${gy - 60} Z`, fill: C.y1 }, cart);
    el("path", { d: `M60 ${gy - 80} Q66 ${gy - 96} 84 ${gy - 94} Q98 ${gy - 92} 98 ${gy - 80} Z`, fill: C.br2 }, cart);
    el("path", { d: `M72 ${gy - 88} l6 -6 M112 ${gy - 90} l5 -7`, stroke: C.br5, "stroke-width": 2, fill: "none" }, cart);
    el("rect", { x: 134, y: gy - 88, width: 30, height: 30, rx: 4, fill: C.br3 }, cart);
    el("path", { d: `M134 ${gy - 80} L164 ${gy - 80} M134 ${gy - 66} L164 ${gy - 66}`, stroke: C.br5, "stroke-width": 2.5 }, cart);
    // bed and sides
    el("path", { d: `M40 ${gy - 60} L172 ${gy - 60} L168 ${gy - 38} L44 ${gy - 38} Z`, fill: C.br4 }, cart);
    el("path", { d: `M44 ${gy - 49} L169 ${gy - 49}`, stroke: C.br5, "stroke-width": 1.5 }, cart);
    [58, 104, 150].forEach((x) => el("rect", { x, y: gy - 64, width: 5, height: 28, fill: C.br5 }, cart));
    // shafts to the horse's collar
    el("path", { d: `M168 ${gy - 46} L262 ${gy - 58}`, stroke: C.br5, "stroke-width": 4, "stroke-linecap": "round" }, cart);
    wheel(cart, 70, gy - 22, 22, C.br5); wheel(cart, 138, gy - 22, 22, C.br5);
    // the horse
    const H = el("g", null, cart);
    const ox = 196, oy = gy;
    const hoof = (x) => el("path", { d: `M${x - 4.5} ${oy - 5} L${x + 5} ${oy - 5} L${x + 6} ${oy} L${x - 5} ${oy} Z`, fill: C.n5 }, H);
    const legG = [];
    // legs start well inside the body (drawn first, so the body covers the joint) and swing from the shoulder / hip
    [[24, 1], [35, -1], [80, -1], [90, 1]].forEach(([lx, ph], k) => {
      const lg = el("g", null, H);
      const top = oy - 52;
      el("path", { d: `M${ox + lx - 7} ${top} C${ox + lx - 7} ${oy - 30} ${ox + lx - 3.5} ${oy - 20} ${ox + lx - 3} ${oy - 5} L${ox + lx + 3} ${oy - 5} C${ox + lx + 3.5} ${oy - 20} ${ox + lx + 6} ${oy - 30} ${ox + lx + 7} ${top} Z`, fill: k === 1 || k === 2 ? C.br5 : C.br4 }, lg);
      const hx = ox + lx; const hf = el("g", null, lg); el("path", { d: `M${hx - 4.5} ${oy - 5} L${hx + 4.5} ${oy - 5} L${hx + 5.5} ${oy} L${hx - 5} ${oy} Z`, fill: C.n5 }, hf);
      legG.push([lg, ox + lx, top, ph]);
    });
    el("path", { d: `M${ox + 10} ${oy - 58} C${ox + 2} ${oy - 50} ${ox - 6} ${oy - 36} ${ox - 4} ${oy - 18} C${ox + 2} ${oy - 30} ${ox + 8} ${oy - 42} ${ox + 14} ${oy - 50} Z`, fill: C.br5 }, H); // tail
    el("path", { d: `M${ox + 12} ${oy - 60} C${ox + 30} ${oy - 68} ${ox + 60} ${oy - 64} ${ox + 80} ${oy - 66} C${ox + 88} ${oy - 76} ${ox + 96} ${oy - 90} ${ox + 106} ${oy - 96} L${ox + 112} ${oy - 94} C${ox + 118} ${oy - 84} ${ox + 124} ${oy - 76} ${ox + 128} ${oy - 70} C${ox + 129} ${oy - 65} ${ox + 124} ${oy - 63} ${ox + 120} ${oy - 65} C${ox + 114} ${oy - 70} ${ox + 110} ${oy - 72} ${ox + 106} ${oy - 70} C${ox + 102} ${oy - 60} ${ox + 100} ${oy - 50} ${ox + 96} ${oy - 42} C${ox + 80} ${oy - 34} ${ox + 50} ${oy - 36} ${ox + 26} ${oy - 38} C${ox + 14} ${oy - 40} ${ox + 6} ${oy - 50} ${ox + 12} ${oy - 60} Z`, fill: C.br4 }, H); // body, neck, head
    el("path", { d: `M${ox + 80} ${oy - 66} C${ox + 88} ${oy - 78} ${ox + 96} ${oy - 90} ${ox + 106} ${oy - 96} L${ox + 102} ${oy - 86} C${ox + 96} ${oy - 78} ${ox + 90} ${oy - 70} ${ox + 86} ${oy - 62} Z`, fill: C.br5 }, H); // mane
    el("path", { d: `M${ox + 106} ${oy - 96} L${ox + 108} ${oy - 104} L${ox + 112} ${oy - 95} Z`, fill: C.br4 }, H); // ear
    el("path", { d: `M${ox + 84} ${oy - 70} C${ox + 92} ${oy - 70} ${ox + 98} ${oy - 58} ${ox + 96} ${oy - 46} L${ox + 90} ${oy - 46} C${ox + 91} ${oy - 56} ${ox + 88} ${oy - 64} ${ox + 82} ${oy - 64} Z`, fill: C.o5 }, H); // collar
    el("path", { d: `M${ox + 106} ${oy - 76} L${ox + 124} ${oy - 70} M${ox + 110} ${oy - 72} L${ox + 60} ${oy - 58}`, stroke: C.br5, "stroke-width": 1.6, fill: "none" }, H); // bridle and rein
    legG.forEach(([lg, lx, top, ph]) => PEOPLE.rock(lg, lx, top, -14 * ph, 14 * ph, 0.55));
    // the driver
    PEOPLE.person(cart, { x: 150, y: gy - 60, s: 0.34, pose: "sit", skin: PEOPLE.SKIN[2], hairStyle: "short", hat: "cap", hatCol: C.br5, top: C.o5, bottom: C.br5, arms: { R: "forward", L: "forward" } });
    gsap.set(cart, { x: 100 });

    // train
    const train = el("g", null, svg);
    const loco = el("g", { transform: "translate(220,0) scale(-1,1)" }, train);
    el("rect", { x: 0, y: -96, width: 150, height: 58, fill: C.br5 }, loco);       // boiler
    el("rect", { x: 150, y: -134, width: 70, height: 96, fill: C.o5 }, loco);       // cab
    el("rect", { x: 144, y: -142, width: 82, height: 12, fill: C.br5 }, loco);
    el("rect", { x: 164, y: -122, width: 40, height: 30, fill: C.y2 }, loco);
    el("rect", { x: 26, y: -140, width: 26, height: 46, fill: C.br5 }, loco);       // funnel
    el("rect", { x: 20, y: -148, width: 38, height: 12, fill: C.br5 }, loco);
    el("rect", { x: 86, y: -112, width: 30, height: 18, fill: C.br4 }, loco);       // dome
    el("path", { d: "M-8 -38 L-26 -8 L10 -8 Z", fill: C.n5 }, loco);               // cow catcher
    el("rect", { x: -6, y: -40, width: 232, height: 10, fill: C.n5 }, loco);
    wheel(loco, 30, -22, 20, C.n5); wheel(loco, 90, -22, 20, C.n5); wheel(loco, 180, -18, 16, C.n5);
    puffs(train, 181, -160, 6, C.w, 1.4);
    const wagCols = [C.br4, C.o4, C.br4, C.o4];
    wagCols.forEach((col, i) => {
      const wx = -190 - i * 180;
      el("rect", { x: wx, y: -90, width: 170, height: 58, fill: col }, train);
      el("rect", { x: wx - 10, y: -34, width: 190, height: 6, fill: C.n5 }, train);
      if (i % 2) { el("rect", { x: wx + 14, y: -118, width: 60, height: 28, fill: C.y4 }, train); el("rect", { x: wx + 86, y: -110, width: 66, height: 20, fill: C.br3 }, train); }
      else el("path", { d: `M${wx + 10} -90 Q${wx + 85} -140 ${wx + 160} -90 Z`, fill: C.n5 }, train);
      wheel(train, wx + 32, -18, 16, C.n5); wheel(train, wx + 138, -18, 16, C.n5);
    });
    gsap.set(train, { x: -300, y: 764 });

    // ---- timeline ----
    gsap.set([skyline], { opacity: 0, scaleY: 0.3, transformOrigin: "50% 100%" });
    gsap.set(factories, { scaleY: 0, transformOrigin: "50% 100%" });
    gsap.set(terraces, { scale: 0, transformOrigin: "50% 100%" });
    gsap.set(sleepers, { opacity: 0 });
    gsap.set(train, { x: -1000 });
    // beat 0: the slow world
    tl.to(cart, { x: 700, duration: 1.2, ease: "none" }, 0);
    tl.to(sun, { cy: 210, duration: 4, ease: "none" }, 0);
    // beat 1: railway laid
    drawOn(tl, railLine, beat(1), 0.8);
    tl.to(sleepers, { opacity: 1, duration: 0.05, stagger: 0.8 / sleepers.length, ease: "none" }, beat(1));
    tl.to(cart, { opacity: 0, x: 900, duration: 0.4 }, beat(1));
    tl.to(poles, { opacity: 1, duration: 0.4 }, beat(1) + 0.4);
    // beat 2: the train arrives
    tl.to(train, { x: 700, duration: 0.9, ease: "power1.out" }, beat(2));
    // beat 3: industry grows
    // the cottages and trees make way first, so the mills never rise on top of them
    tl.to(rural.children, { scale: 0, transformOrigin: "50% 100%", duration: 0.25, stagger: 0.02, ease: "power2.in" }, beat(3) - 0.1);
    tl.to(factories, { scaleY: 1, duration: 0.5, stagger: 0.08, ease: "back.out(1.4)" }, beat(3) + 0.12);
    tl.to(terraces, { scale: 1, duration: 0.3, stagger: 0.03, ease: "back.out(2)" }, beat(3) + 0.2);
    tl.to(skyline, { opacity: 1, scaleY: 1, duration: 0.7, ease: "power2.out" }, beat(3) + 0.1);
    tl.to(train, { x: 1900, duration: 1.4, ease: "power1.in" }, beat(3) + 0.1);
    tl.to({}, { duration: 0.001 }, 3.1);
    return tl;
  }

  /* ================= HIGHWAYS ================= */
  function road(svg) {
    seed = 23;
    const tl = gsap.timeline({ paused: true });
    sky(svg, "sky-road", C.b2, C.w);
    el("circle", { cx: 300, cy: 200, r: 40, fill: C.y2 }, svg);
    // clouds
    [[1100, 170], [700, 120], [1400, 260]].forEach(([x, y]) => {
      const c = el("g", { class: "cloud" }, svg);
      el("ellipse", { cx: x, cy: y, rx: 80, ry: 24, fill: C.w }, c);
      el("ellipse", { cx: x + 30, cy: y - 16, rx: 44, ry: 24, fill: C.w }, c);
    });
    // mountains + distant city
    el("path", { d: "M0 470 L180 330 L330 430 L520 280 L720 440 L900 330 L1080 450 L1260 300 L1450 420 L1600 360 L1600 520 L0 520 Z", fill: C.b1 }, svg);
    const city = el("g", null, svg);
    let cx = 1020;
    while (cx < 1480) {
      const w = 26 + rnd() * 40, h = 40 + rnd() * 150;
      el("rect", { x: cx, y: 500 - h, width: w, height: h, fill: C.b4 }, city);
      cx += w + 4;
    }
    const lake = el("path", { d: "M0 520 L1600 520 L1600 560 C1200 580 700 540 0 580 Z", fill: C.b2 }, svg);
    el("path", { d: "M0 540 C400 520 900 560 1600 530 L1600 900 L0 900 Z", fill: C.g2 }, svg);
    // old railway in the distance (continuity)
    const oldRail = el("g", { opacity: 0.8 }, svg);
    el("path", { d: "M0 570 C500 555 1000 575 1600 548", stroke: C.br4, "stroke-width": 4, fill: "none" }, oldRail);
    const mini = el("g", null, oldRail);
    el("rect", { x: 0, y: -14, width: 90, height: 12, fill: C.br5 }, mini);
    gsap.set(mini, { x: -120, y: 566 });
    gsap.to(mini, { x: 1700, duration: 28, repeat: -1, ease: "none" });

    el("path", { d: "M0 700 C500 650 1000 720 1600 660 L1600 900 L0 900 Z", fill: C.g1 }, svg);

    // roadside — towns of many kinds, a café, a fruit stand, a small hotel (beat 3)
    const town = el("g", null, svg);
    const pops = [];
    const houseCols = [C.w, C.y1, C.b1, C.w, C.br1, C.g1];
    for (let i = 0; i < 7; i++) {   // the last two plots sat where the highway climbs the hill, so they are left empty
      const hx = 110 + i * 150 + (i % 2) * 30, hy = 610 + (i % 2) * 14;
      if (i % 3 === 2) { // flat-roofed two-storey house with a rooftop parapet and awning
        const b = el("g", null, town);
        el("rect", { x: hx - 4, y: hy - 70, width: 66, height: 70, fill: houseCols[(i + 2) % 6] }, b);
        el("rect", { x: hx - 8, y: hy - 76, width: 74, height: 8, fill: C.n3 }, b);
        [[hx + 6, hy - 60], [hx + 36, hy - 60], [hx + 6, hy - 30]].forEach(([x, y]) => el("rect", { x, y, width: 16, height: 16, fill: C.b4 }, b));
        el("rect", { x: hx + 36, y: hy - 30, width: 16, height: 30, fill: C.br4 }, b);
        el("path", { d: `M${hx + 30} ${hy - 36} L${hx + 58} ${hy - 36} L${hx + 62} ${hy - 30} L${hx + 26} ${hy - 30} Z`, fill: C.o2 }, b);
        pops.push(b);
      } else {
        const h = house(town, hx, hy, 58, 38, houseCols[i % 6], i % 2 ? C.n4 : C.o5, C.b4);
        pops.push(h.g);
      }
    }
    // small hotel
    const hotel = el("g", null, town);
    el("rect", { x: 1440, y: 650, width: 120, height: 170, fill: C.b1 }, hotel);
    el("rect", { x: 1434, y: 642, width: 132, height: 10, fill: C.n4 }, hotel);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) el("rect", { x: 1454 + c * 34, y: 664 + r * 36, width: 22, height: 22, fill: C.y2 }, hotel);
    el("rect", { x: 1470, y: 614, width: 60, height: 24, fill: C.g5 }, hotel);
    el("text", { x: 1500, y: 631, "text-anchor": "middle", fill: C.w, "font-family": "Poppins", "font-weight": 600, "font-size": 13, "letter-spacing": 2, text: "HOTEL" }, hotel);
    pops.push(hotel);
    // café with awning, tables and umbrellas
    const cafe = el("g", null, town);
    el("rect", { x: 1040, y: 790, width: 200, height: 100, fill: C.w }, cafe);
    el("rect", { x: 1034, y: 780, width: 212, height: 12, fill: C.n4 }, cafe);
    for (let k = 0; k < 8; k++) el("path", { d: `M${1040 + k * 25} 800 L${1065 + k * 25} 800 L${1065 + k * 25} 822 Q${1052 + k * 25} 830 ${1040 + k * 25} 822 Z`, fill: k % 2 ? C.w : C.g4 }, cafe);
    el("rect", { x: 1060, y: 836, width: 70, height: 44, fill: C.b2 }, cafe);
    el("rect", { x: 1150, y: 836, width: 40, height: 54, fill: C.br4 }, cafe);
    [[1000, C.o2], [1275, C.y3]].forEach(([x, col]) => {
      el("path", { d: `M${x - 26} 836 Q${x} 812 ${x + 26} 836 Z`, fill: col }, cafe);
      el("rect", { x: x - 1.5, y: 836, width: 3, height: 40, fill: C.n4 }, cafe);
      el("rect", { x: x - 16, y: 862, width: 32, height: 4, fill: C.n4 }, cafe);
    });
    el("text", { x: 1140, y: 776, "text-anchor": "middle", fill: C.n4, "font-family": "Poppins", "font-weight": 600, "font-size": 14, "letter-spacing": 3, text: "CAFÉ" }, cafe);
    pops.push(cafe);
    // roadside fruit stand
    const fruit = el("g", null, town);
    el("rect", { x: 1316, y: 820, width: 4, height: 60, fill: C.br5 }, fruit);
    el("rect", { x: 1404, y: 820, width: 4, height: 60, fill: C.br5 }, fruit);
    el("path", { d: "M1300 822 L1424 822 L1414 800 L1310 800 Z", fill: C.o4 }, fruit);
    el("rect", { x: 1314, y: 854, width: 96, height: 30, fill: C.br3 }, fruit);
    [[C.o1, 1326], [C.g4, 1352], [C.y3, 1378]].forEach(([col, x]) => { for (let k = 0; k < 3; k++) el("circle", { cx: x + k * 7, cy: 850 - (k % 2) * 4, r: 5, fill: col }, fruit); });
    pops.push(fruit);
    // trees
    const trees = el("g", null, svg);
    [60, 330, 560, 880, 1500, 1560].forEach((x, i) => pine(trees, x, 890 - (i % 2) * 20, 1.4));

    // highway
    const roadD = "M-120 880 C250 860 420 740 700 720 S1050 700 1200 640 S1500 560 1720 560";
    const roadBed = el("path", { d: roadD, stroke: C.n4, "stroke-width": 70, fill: "none", "stroke-linecap": "butt" }, svg);
    const roadEdge = el("path", { d: roadD, stroke: C.w, "stroke-width": 2, fill: "none", "stroke-dasharray": "0 0", opacity: 0 }, svg);
    const centre = el("path", { d: roadD, stroke: C.y3, "stroke-width": 4, fill: "none", "stroke-dasharray": "22 18", opacity: 0 }, svg);

    // traffic: every vehicle keeps to its own side of the centre line; even spacing means no collisions
    const carCols = [C.o3, C.b3, C.y3, C.g4, C.o4, C.b5, C.w, C.o2];
    const kinds = ["car", "moto", "car", "truck", "car", "bus", "moto", "car"];
    const cars = [];
    const LANE = 15;
    function vehicle(kind, col) {
      const car = el("g", { opacity: 0 }, svg);
      const b = el("g", { transform: `translate(0,${LANE})` }, car); // +y is the right-hand side of the direction of travel
      if (kind === "car") {
        el("rect", { x: -22, y: -9, width: 44, height: 18, rx: 7, fill: col }, b);
        el("rect", { x: 4, y: -7, width: 9, height: 14, rx: 2, fill: C.n4 }, b);
        el("rect", { x: -16, y: -7, width: 8, height: 14, rx: 2, fill: C.n4 }, b);
      } else if (kind === "truck") {
        el("rect", { x: -40, y: -10, width: 58, height: 20, rx: 2, fill: C.w }, b);
        el("rect", { x: 20, y: -9, width: 18, height: 18, rx: 4, fill: col }, b);
        el("rect", { x: 30, y: -7, width: 6, height: 14, rx: 1, fill: C.n4 }, b);
      } else if (kind === "bus") {
        el("rect", { x: -42, y: -10, width: 84, height: 20, rx: 5, fill: C.g4 }, b);
        el("rect", { x: 34, y: -8, width: 6, height: 16, rx: 1, fill: C.n4 }, b);
      } else { // motorbike and rider
        el("rect", { x: -11, y: -3.5, width: 22, height: 7, rx: 3.5, fill: C.n4 }, b);
        el("circle", { cx: -1, cy: 0, r: 5.5, fill: col }, b);
      }
      return car;
    }
    const traffic = [];
    [[1, 7, 15], [-1, 7, 17]].forEach(([dir, n, dur], d) => {
      for (let k = 0; k < n; k++) {
        const kind = kinds[(k + d * 3) % kinds.length];
        const car = vehicle(kind, carCols[(k * 3 + d) % carCols.length]);
        cars.push(car);
        traffic.push({ car, dir, dur, t: k / n });
      }
    });
    svg.appendChild(trees);   // the pines stand in the foreground, in front of the road and the traffic, never under it
    // drive along the road: position on the centre line, face the direction of travel, then step into the lane
    const roadLen = roadBed.getTotalLength();
    let lastT = performance.now();
    gsap.ticker.add(() => {
      const now = performance.now(), dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
      traffic.forEach((v) => {
        v.t = (v.t + dt / v.dur) % 1;
        const u = v.dir > 0 ? v.t : 1 - v.t;
        const L = u * roadLen, p = roadBed.getPointAtLength(L), q = roadBed.getPointAtLength(Math.min(roadLen, Math.max(0, L + v.dir * 2)));
        const ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
        v.car.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
      });
    });

    // ---- timeline ----
    gsap.set(pops, { scale: 0, transformOrigin: "50% 100%" });
    gsap.set(city, { scaleY: 0.2, opacity: 0.4, transformOrigin: "50% 100%" });
    // 3 beats: highway drawn (0), traffic (1), roadside economies (2)
    drawOn(tl, roadBed, 0, 0.6);
    tl.to([centre, roadEdge], { opacity: 1, duration: 0.2 }, 0.55);
    tl.to(oldRail, { opacity: 0.35, duration: 0.5 }, 0);
    tl.to(cars.filter((c, i) => i % 2 === 0), { opacity: 1, duration: 0.1, stagger: 0.1 }, beat(1));
    tl.to(cars.filter((c, i) => i % 2 === 1), { opacity: 1, duration: 0.1, stagger: 0.08 }, beat(1) + 0.3);
    tl.to(pops, { scale: 1, duration: 0.3, stagger: 0.05, ease: "back.out(2)" }, beat(2));
    tl.to(city, { scaleY: 1, opacity: 1, duration: 0.8, ease: "power2.out" }, beat(2));
    tl.to({}, { duration: 0.001 }, 2.1);
    return tl;
  }

  /* ================= ELECTRICITY ================= */
  function power(svg) {
    seed = 5;
    const tl = gsap.timeline({ paused: true });
    sky(svg, "sky-power", C.b1, C.w);
    el("circle", { cx: 1320, cy: 190, r: 42, fill: C.y2 }, svg);

    // hills with wind turbines
    el("path", { d: "M0 520 C220 420 420 470 640 430 C900 380 1100 470 1320 420 C1450 390 1540 420 1600 410 L1600 900 L0 900 Z", fill: C.g2 }, svg);
    const turbines = el("g", null, svg);
    const turbineList = [];
    [[180, 470], [330, 450], [980, 430], [1130, 450], [1480, 415]].forEach(([x, y], i) => {
      const t = SVG.turbine(turbines, x, y, 150, { dur: 4 + i * 0.6 });
      turbineList.push(t);
    });

    el("path", { d: "M0 640 C500 600 1000 660 1600 610 L1600 900 L0 900 Z", fill: C.g1 }, svg);

    // solar farm (beat 2)
    const solar = el("g", null, svg);
    for (let r = 0; r < 3; r++) SVG.solarRow(solar, 40 + r * 18, 630 + r * 26, 5, 46, 13, { skew: -8, leg: 9, gap: 5 });

    // pylons + cables (beat 1)
    const pylX = [120, 460, 800, 1140, 1480];
    const baseY = 640, topY = 380;
    const pylons = [];
    pylX.forEach((x) => {
      const p = el("g", null, svg);
      const st = { stroke: C.n4, "stroke-width": 4, fill: "none", "stroke-linejoin": "round" };
      el("path", { d: `M${x - 34} ${baseY} L${x - 8} ${topY} L${x + 8} ${topY} L${x + 34} ${baseY}`, ...st }, p);
      el("path", { d: `M${x - 30} ${baseY - 40} L${x + 26} ${baseY - 110} M${x + 30} ${baseY - 40} L${x - 26} ${baseY - 110} M${x - 22} ${baseY - 120} L${x + 17} ${baseY - 190} M${x + 22} ${baseY - 120} L${x - 17} ${baseY - 190}`, ...st, "stroke-width": 2.5 }, p);
      el("path", { d: `M${x - 58} ${topY + 30} L${x + 58} ${topY + 30} M${x - 44} ${topY + 80} L${x + 44} ${topY + 80}`, ...st }, p);
      pylons.push(p);
    });
    const cables = [];
    [[-58, 30], [58, 30], [-44, 80], [44, 80]].forEach(([dx, dy]) => {
      let d = `M-40 ${topY + dy + 30}`;
      d += ` Q${(pylX[0] + dx - 40) / 2} ${topY + dy + 60} ${pylX[0] + dx} ${topY + dy}`;
      for (let i = 1; i < pylX.length; i++) {
        const x0 = pylX[i - 1] + dx, x1 = pylX[i] + dx;
        d += ` Q${(x0 + x1) / 2} ${topY + dy + 55} ${x1} ${topY + dy}`;
      }
      d += ` Q${(pylX[4] + dx + 1640) / 2} ${topY + dy + 55} 1640 ${topY + dy + 30}`;
      cables.push(el("path", { d, stroke: C.n3, "stroke-width": 2, fill: "none" }, svg));
    });
    // energy pulses along cables
    const pulses = el("g", { opacity: 0 }, svg);
    cables.forEach((cab, ci) => {
      for (let k = 0; k < 7; k++) {
        const dot = el("circle", { r: 5, fill: ci % 2 ? C.g3 : C.b3 }, pulses);
        gsap.to(dot, { motionPath: { path: cab, align: cab, alignOrigin: [0.5, 0.5] }, duration: 6, repeat: -1, ease: "none", delay: -k * (6 / 7) - ci * 0.4 });
      }
    });

    // the town (beat 3)
    const town = el("g", null, svg);
    const wins = [];
    const pops = [];
    const bodies = [C.w, C.g1, C.b1, C.w, C.y1];
    for (let i = 0; i < 8; i++) {
      const hx = 360 + i * 120 + (i % 2) * 14, hy = 790 - (i % 2) * 10;
      const h = house(town, hx, hy, 70, 52, bodies[i % 5], C.n4, C.n2);
      // solar roof
      const roof = el("g", { opacity: 0 }, h.g);
      SVG.panelQuad(roof, [[hx + 4, hy - 57], [hx + 30, hy - 78], [hx + 44, hy - 70], [hx + 18, hy - 49]], 4, 2);
      // heat pump
      const hp = el("g", { opacity: 0 }, h.g);
      el("rect", { x: hx + 72, y: hy - 22, width: 22, height: 22, fill: C.n1 }, hp);
      el("circle", { cx: hx + 83, cy: hy - 11, r: 7.5, fill: C.n2 }, hp);
      const fan = el("g", null, hp);
      for (let k = 0; k < 3; k++) el("path", { d: `M${hx + 83} ${hy - 11} l-2.2 -6 l4.4 0 Z`, fill: C.n4, transform: `rotate(${k * 120} ${hx + 83} ${hy - 11})` }, fan);
      SVG.spinAt(fan, hx + 83, hy - 11, 1.2);
      wins.push(...h.wins);
      pops.push(roof, hp);
    }
    // electric factory with solar roof, no smoke
    const factory = el("g", null, town);
    el("rect", { x: 1340, y: 660, width: 230, height: 140, fill: C.g4 }, factory);
    let d = "M1340 660";
    for (let t = 0; t < 5; t++) d += ` L${1340 + t * 46} 626 L${1340 + (t + 1) * 46} 660`;
    el("path", { d: d + " Z", fill: C.b5 }, factory);
    for (let r = 0; r < 5; r++) wins.push(el("rect", { x: 1356 + r * 44, y: 700, width: 26, height: 34, fill: C.n2 }, factory));
    // data centre
    const dc = el("g", null, town);
    el("rect", { x: 1360, y: 820, width: 200, height: 60, fill: C.n4 }, dc);
    for (let r = 0; r < 12; r++) el("rect", { x: 1374 + r * 15, y: 836, width: 6, height: 6, fill: C.g3, class: "twinkle", style: `animation-delay:${-r * 0.37}s` }, dc);
    pops.push(factory, dc);
    // street, EV charger and bus
    el("rect", { x: 0, y: 872, width: 1600, height: 28, fill: C.n4 }, svg);
    const charger = el("g", { opacity: 0 }, svg);
    el("rect", { x: 250, y: 800, width: 18, height: 50, fill: C.g3 }, charger);
    el("rect", { x: 270, y: 822, width: 70, height: 26, fill: C.b3 }, charger);
    el("rect", { x: 284, y: 808, width: 40, height: 16, fill: C.b3 }, charger);
    icon("bolt", 259, 816, 14, C.w, charger);
    pops.push(charger);
    const bus = el("g", { opacity: 0 }, svg);
    el("rect", { x: 0, y: -52, width: 200, height: 48, fill: C.g4 }, bus);
    for (let i = 0; i < 6; i++) el("rect", { x: 12 + i * 31, y: -44, width: 22, height: 18, fill: C.b1 }, bus);
    el("circle", { cx: 40, cy: -4, r: 10, fill: C.n5 }, bus);
    el("circle", { cx: 160, cy: -4, r: 10, fill: C.n5 }, bus);
    gsap.set(bus, { x: -260, y: 884 });
    gsap.to(bus, { x: 1700, duration: 16, repeat: -1, ease: "none" });
    // trees
    const trees = el("g", null, svg);
    [40, 180, 330, 1310].forEach((x, i) => tree(trees, x, 860 - (i % 2) * 8, 1.4, i % 2 ? C.g4 : C.g5));

    // ---- timeline ----
    gsap.set(pylons, { scaleY: 0, transformOrigin: "50% 100%" });
    gsap.set(turbineList, { opacity: 0 });
    gsap.set(solar, { opacity: 0 });
    gsap.set(pops.filter((p) => p !== charger), { opacity: 0 });
    gsap.set([factory, dc], { opacity: 0, scale: 0.6, transformOrigin: "50% 100%" });
    // beat 1: pylons and cables
    tl.to(pylons, { scaleY: 1, duration: 0.35, stagger: 0.1, ease: "back.out(1.5)" }, beat(1));
    cables.forEach((c, i) => drawOn(tl, c, beat(1) + 0.3 + i * 0.05, 0.6));
    // beat 4: domestic wind and solar
    tl.to(pulses, { opacity: 1, duration: 0.3 }, beat(4));
    tl.to(turbineList, { opacity: 1, duration: 0.3, stagger: 0.08 }, beat(4));
    tl.to(solar, { opacity: 1, duration: 0.4 }, beat(4) + 0.2);
    // beat 5: the town comes alive, data centre humming
    tl.to(wins, { fill: C.y2, duration: 0.05, stagger: 0.02 }, beat(5));
    tl.to(pops, { opacity: 1, duration: 0.2, stagger: 0.03 }, beat(5));
    tl.to([factory, dc], { scale: 1, duration: 0.4, ease: "back.out(1.6)" }, beat(5) + 0.1);
    tl.to(bus, { opacity: 1, duration: 0.2 }, beat(5) + 0.2);
    // beats 4-6: human moments, then the poster frame
    const vg = VIGNETTES.power(svg);
    [[vg.v1, vg.cam1, 2], [vg.v2, vg.cam2, 3]].forEach(([v, cam, b]) => {
      tl.to(v, { opacity: 1, duration: 0.25 }, beat(b));
      tl.fromTo(cam, { scale: 1.07, svgOrigin: "800 450" }, { scale: 1, duration: 1.1, ease: "none", svgOrigin: "800 450" }, beat(b));
      tl.to(v, { opacity: 0, duration: 0.25 }, beat(b + 1));
    });
    tl.to({}, { duration: 0.001 }, 6.1);
    return tl;
  }

  /* ================= THE GAP ================= */
  function gap(svg) {
    const tl = gsap.timeline({ paused: true });
    const icons = ["solar-panel", "heat", "car-bolt", "industry", "server", "wind-turbine", "house-chimney-blank", "plug-circle-bolt"];
    const ring = [C.g3, C.o2, C.b3, C.g5, C.b5, C.g4, C.y3, C.o3];
    // the line / road
    el("rect", { x: 0, y: 400, width: 1600, height: 20, fill: C.n1 }, svg);
    const lit = el("rect", { x: 1010, y: 400, width: 590, height: 20, fill: C.g3, opacity: 0 }, svg);
    // city on the right
    const city = el("g", null, svg);
    const cityWins = [];
    [[1240, 150], [1300, 230], [1380, 180], [1450, 260], [1530, 140]].forEach(([x, h]) => {
      el("rect", { x, y: 390 - h, width: 56, height: h, fill: C.n4 }, city);
      for (let r = 0; r < Math.floor(h / 36); r++) for (let c2 = 0; c2 < 2; c2++)
        cityWins.push(el("rect", { x: x + 10 + c2 * 22, y: 390 - h + 14 + r * 36, width: 12, height: 16, fill: C.n3 }, city));
    });
    // barrier
    const barrier = el("g", null, svg);
    el("rect", { x: 985, y: 290, width: 18, height: 140, fill: C.n5 }, barrier);
    const arm = el("g", null, barrier);
    for (let i = 0; i < 8; i++) el("rect", { x: 994 - (i + 1) * 30, y: 320, width: 30, height: 16, fill: i % 2 ? C.w : C.o3, stroke: C.n5, "stroke-width": 1.5 }, arm);
    const label = el("text", { x: 640, y: 150, "text-anchor": "middle", "font-family": "Poppins", "font-weight": 600, "font-size": 30, fill: C.n5, text: "Waiting to connect", opacity: 0 }, svg);

    // tokens
    const tokens = [];
    const N = 40, rows = 5;
    for (let i = 0; i < N; i++) {
      const col = Math.floor(i / rows), row = i % rows;
      const x = 940 - col * 66 - (row % 2) * 12, y = 282 + row * 60 - 40;
      const t = el("g", null, svg);
      el("circle", { cx: 0, cy: 0, r: 26, fill: C.w, stroke: ring[i % ring.length], "stroke-width": 4 }, t);
      icon(icons[i % icons.length], 0, 0, 26, C.n5, t);
      gsap.set(t, { x: -200 - (i % 7) * 80, y: y + (rnd() - 0.5) * 300, opacity: 0 });
      t.dataset.x = x; t.dataset.y = y;
      tokens.push(t);
    }
    const first = tokens.slice(0, 14), rest = tokens.slice(14);
    tl.to(first, { x: (i, t) => +t.dataset.x, y: (i, t) => +t.dataset.y, opacity: 1, duration: 0.5, stagger: 0.04, ease: "power2.out" }, 0);
    tl.to(label, { opacity: 1, duration: 0.2 }, 0.4);
    tl.to(rest, { x: (i, t) => +t.dataset.x, y: (i, t) => +t.dataset.y, opacity: 1, duration: 0.45, stagger: 0.02, ease: "power2.out" }, beat(1));
    tl.to(arm, { rotation: 80, svgOrigin: "994 328", duration: 0.35, ease: "power2.inOut" }, beat(2));
    tl.to(label, { opacity: 0, duration: 0.15 }, beat(2));
    tl.to(lit, { opacity: 1, duration: 0.2 }, beat(2) + 0.1);
    tl.to(tokens, { x: 1200 + 0, opacity: 0, duration: 0.45, stagger: { each: 0.008, from: "start" }, ease: "power1.in" }, beat(2) + 0.15);
    tl.to(cityWins, { fill: C.y2, duration: 0.05, stagger: 0.01 }, beat(2) + 0.35);
    // the people behind the queue (today)
    const q = VIGNETTES.gap(svg);
    gsap.set(q.people, { x: -900, opacity: 0 });
    tl.to(q.people, { x: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power2.out" }, 0.1);
    tl.to(q.people, { x: 900, opacity: 0, duration: 0.6, stagger: { each: 0.05, from: "end" }, ease: "power1.in" }, beat(2) + 0.2);
    tl.to({}, { duration: 0.001 }, 2.2);
    return tl;
  }


  /* ================= HERO: the future the grid makes possible ================= */
  // People and street life lead; wind, solar and the grid sit quietly in the background.
  function hero(svg) {
    const P = PEOPLE, S = SKIN_OF();
    const defs = svg.querySelector("defs") || el("defs", null, svg);
    const sk = el("linearGradient", { id: "hero-sky", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el("stop", { offset: "0", "stop-color": C.w }, sk); el("stop", { offset: "0.55", "stop-color": C.w }, sk); el("stop", { offset: "1", "stop-color": C.b1 }, sk);
    el("rect", { x: -200, y: 0, width: 2000, height: 900, fill: "url(#hero-sky)" }, svg);

    // a few soft clouds and birds
    [[1180, 150], [1420, 240], [860, 110]].forEach(([x, y], i) => {
      const c = el("g", null, svg);
      el("path", { d: `M${x - 70} ${y} Q${x - 60} ${y - 22} ${x - 30} ${y - 18} Q${x - 10} ${y - 44} ${x + 22} ${y - 30} Q${x + 50} ${y - 34} ${x + 60} ${y - 10} Q${x + 80} ${y - 6} ${x + 76} ${y} Z`, fill: C.w }, c);
      gsap.to(c, { x: -60, duration: 30 + i * 8, repeat: -1, yoyo: true, ease: "sine.inOut" });
    });
    for (let i = 0; i < 4; i++) { const b = el("path", { d: `M${1000 + i * 34} ${210 + (i % 2) * 14} q7 -7 14 0 q7 -7 14 0`, stroke: C.n3, "stroke-width": 2, fill: "none" }, svg); gsap.to(b, { x: 180, y: -30, duration: 20, repeat: -1, yoyo: true, ease: "sine.inOut", delay: -i }); }

    // the grid on the horizon: a line of pylons running the full width of the view, behind the turbines
    const ridge = el("path", { d: "M-100 572 C300 548 700 562 1000 540 C1250 522 1450 532 1700 514 L1700 700 L-100 700 Z", fill: C.g1 }, svg);
    const ridgeTop = el("path", { d: "M-100 572 C300 548 700 562 1000 540 C1250 522 1450 532 1700 514", fill: "none" }, svg);
    const rl = ridgeTop.getTotalLength();
    const yAt = (x) => { let lo = 0, hi = rl; for (let k = 0; k < 24; k++) { const m = (lo + hi) / 2; if (ridgeTop.getPointAtLength(m).x < x) lo = m; else hi = m; } return ridgeTop.getPointAtLength(lo).y; };
    const ph = 52, towers = [];
    for (let x = -60; x <= 1720; x += 190) {
      const base = yAt(x) + 4, top = base - ph;
      const st = { stroke: C.n3, "stroke-width": 1.4, fill: "none", "stroke-linejoin": "round" };
      // same simple lattice as the "age of power" era scene, scaled down
      const k = ph / 260;
      el("path", { d: `M${x - 34 * k} ${base} L${x - 8 * k} ${top} L${x + 8 * k} ${top} L${x + 34 * k} ${base}`, ...st }, svg);
      el("path", { d: `M${x - 30 * k} ${base - 40 * k} L${x + 26 * k} ${base - 110 * k} M${x + 30 * k} ${base - 40 * k} L${x - 26 * k} ${base - 110 * k} M${x - 22 * k} ${base - 120 * k} L${x + 17 * k} ${base - 190 * k} M${x + 22 * k} ${base - 120 * k} L${x - 17 * k} ${base - 190 * k}`, ...st, "stroke-width": 1 }, svg);
      el("path", { d: `M${x - 58 * k} ${top + 30 * k} L${x + 58 * k} ${top + 30 * k} M${x - 44 * k} ${top + 80 * k} L${x + 44 * k} ${top + 80 * k}`, ...st }, svg);
      towers.push([x, top, k]);
    }
    [[-58, 30], [58, 30], [-44, 80], [44, 80]].forEach(([dx, dy], ci) => {
      let d = "";
      towers.forEach(([x, top, k], i) => {
        const px = x + dx * k, py = top + dy * k;
        if (!i) d = `M${px} ${py}`;
        else { const [x0, t0, k0] = towers[i - 1]; const qx = x0 + dx * k0, qy = t0 + dy * k0; d += ` Q${(qx + px) / 2} ${(qy + py) / 2 + 9} ${px} ${py}`; }
      });
      const cable = el("path", { d, stroke: C.n3, "stroke-width": 0.9, fill: "none" }, svg);
      if (ci === 0 || ci === 3) for (let n = 0; n < 6; n++) {
        const dot = el("circle", { r: 2.2, fill: ci ? C.b3 : C.g3 }, svg);
        gsap.to(dot, { motionPath: { path: cable, align: cable, alignOrigin: [0.5, 0.5] }, duration: 24, repeat: -1, ease: "none", delay: -n * 4 - ci });
      }
    });

    // nearer hills with turbines
    el("path", { d: "M-100 600 C150 560 360 590 560 560 C760 532 940 566 1120 540 C1300 516 1460 540 1700 520 L1700 700 L-100 700 Z", fill: C.g2 }, svg);
    [[790, 574, 118], [890, 564, 132], [990, 558, 120], [1100, 550, 138], [1205, 546, 124]].forEach(([x, y, h], i) => SVG.turbine(svg, x, y, h, { dur: 4.5 + i * 0.6 }));
    // meadow, hedgerow and a small community solar field (no water)
    el("path", { d: "M-100 646 C300 630 700 640 1000 624 L1700 610 L1700 900 L-100 900 Z", fill: C.g1 }, svg);
    let hedge = "M-100 668";
    for (let x = -100; x < 1000; x += 34) hedge += ` Q${x + 17} ${652 + ((x / 34) % 2) * 5} ${x + 34} 668`;
    el("path", { d: hedge + " L1000 676 L-100 676 Z", fill: C.g4 }, svg);
    for (let r = 0; r < 2; r++) SVG.solarRow(svg, 40 + r * 10, 684 + r * 20, 6, 36, 10, { skew: -5, leg: 6, gap: 4 });
    [[20, 690], [340, 694], [980, 680]].forEach(([x, y], i) => tree(svg, x, y, 1.0, i % 2 ? C.g5 : C.g4));

    // modern low-rise homes with rooftop solar, balconies and planting
    function block(x, base, w, floors, col, roofCol) {
      const g = el("g", null, svg), fh = 62, top = base - floors * fh;
      el("rect", { x, y: top, width: w, height: floors * fh, fill: col }, g);
      el("rect", { x: x - 6, y: top - 8, width: w + 12, height: 10, fill: roofCol }, g);
      const n = Math.max(2, Math.floor((w - 20) / 44));
      for (let k = 0; k < n; k++) {
        const px = x + 10 + k * ((w - 20) / n);
        el("path", { d: `M${px + 4} ${top - 8} L${px + 6} ${top - 20}`, stroke: C.n3, "stroke-width": 2, fill: "none" }, g);
        SVG.panelQuad(g, [[px, top - 30], [px + (w - 20) / n - 6, top - 30], [px + (w - 20) / n - 2, top - 14], [px + 4, top - 14]], 4, 2);
      }
      for (let f = 0; f < floors; f++) {
        const fy = top + f * fh;
        const cols = Math.max(2, Math.floor(w / 58));
        for (let c = 0; c < cols; c++) {
          const wx = x + 14 + c * ((w - 28) / cols);
          el("rect", { x: wx, y: fy + 14, width: (w - 28) / cols - 14, height: 32, fill: (f + c) % 3 ? C.b2 : C.y2 }, g);
        }
        if (f > 0) {
          el("rect", { x: x + 8, y: fy + 46, width: w - 16, height: 6, fill: C.w }, g);
          el("path", { d: `M${x + 8} ${fy + 38} L${x + w - 8} ${fy + 38}`, stroke: C.n3, "stroke-width": 1.5, fill: "none" }, g);
          for (let k = 0; k < Math.floor(w / 36); k++) el("circle", { cx: x + 20 + k * 36, cy: fy + 43, r: 5, fill: k % 2 ? C.g4 : C.g2 }, g);
        }
      }
      return g;
    }
    block(1010, 720, 150, 4, C.w, C.n4);
    block(1170, 724, 190, 5, C.y1, C.n4);
    block(1370, 720, 170, 4, C.g1, C.n4);
    block(1550, 724, 160, 5, C.w, C.n4);
    // street trees
    [[990, 740], [1180, 744], [1360, 740], [1545, 744]].forEach(([x, y], i) => {
      el("rect", { x: x - 5, y: y - 90, width: 10, height: 90, fill: C.br4 }, svg);
      el("circle", { cx: x, cy: y - 110, r: 42, fill: i % 2 ? C.g4 : C.g5 }, svg);
      el("circle", { cx: x + 26, cy: y - 90, r: 26, fill: i % 2 ? C.g5 : C.g4 }, svg);
    });

    // the street: road, electric bus, a cyclist
    const roadTop = el("path", { d: "M-100 742 L1700 742 L1700 800 L-100 800 Z", fill: C.n4 }, svg);
    el("path", { d: "M-100 771 L1700 771", stroke: C.w, "stroke-width": 2.5, "stroke-dasharray": "26 20", fill: "none" }, svg);
    const bus = el("g", null, svg);
    const bi = el("g", { transform: "scale(0.62)" }, bus);
    el("rect", { x: 0, y: -150, width: 480, height: 136, rx: 18, fill: C.g4 }, bi);
    el("rect", { x: 0, y: -58, width: 480, height: 12, fill: C.g5 }, bi);
    for (let k = 0; k < 6; k++) { el("rect", { x: 22 + k * 74, y: -132, width: 58, height: 54, rx: 6, fill: C.b1 }, bi); if (k % 2 === 0) el("circle", { cx: 51 + k * 74, cy: -100, r: 11, fill: C.br3 }, bi); }
    el("circle", { cx: 96, cy: -12, r: 26, fill: C.n5 }, bi); el("circle", { cx: 384, cy: -12, r: 26, fill: C.n5 }, bi);
    el("circle", { cx: 96, cy: -12, r: 11, fill: C.n2 }, bi); el("circle", { cx: 384, cy: -12, r: 11, fill: C.n2 }, bi);
    icon("bolt", 444, -26, 18, C.w, bi);
    gsap.fromTo(bus, { x: 1750, y: 772 }, { x: -450, y: 772, duration: 22, repeat: -1, ease: "none" });

    // pavement and a cycle lane in the foreground
    el("path", { d: "M-100 800 L1700 800 L1700 900 L-100 900 Z", fill: C.n1 }, svg);
    el("path", { d: "M-100 800 L1700 800 L1700 826 L-100 826 Z", fill: C.g4 }, svg);
    const rider = el("g", null, svg);
    const ri = el("g", { transform: "translate(0 824) scale(0.62)" }, rider);
    [[-32, -24], [34, -24]].forEach(([cx, cy]) => { el("circle", { cx, cy, r: 22, fill: C.n5 }, ri); el("circle", { cx, cy, r: 13, fill: C.w }, ri); });
    el("path", { d: "M-32 -24 L-6 -24 L20 -56 L-14 -56 Z M-6 -24 L-16 -66 M20 -56 L34 -24 M20 -56 L16 -74 L26 -76", stroke: C.o3, "stroke-width": 4.5, fill: "none", "stroke-linejoin": "round" }, ri);
    P.person(ri, { x: -24, y: -22, s: 0.9, pose: "sit", skin: S[2], hairStyle: "bun", hairCol: C.n5, top: C.b4, bottom: C.n5, arms: { L: "wheel", R: "wheel" } });
    gsap.fromTo(rider, { x: -200 }, { x: 1800, duration: 16, repeat: -1, ease: "none" });

    // a solar carport beside the road: EVs charging under a roof of panels, well off the carriageway
    function evSide(g, x, base, len, col) {
      const k = len / 100, c = el("g", { transform: `translate(${x} ${base}) scale(${k})` }, g);
      el("path", { d: "M-50 -10 C-50 -22 -44 -26 -34 -27 L-24 -40 L20 -40 L34 -27 C46 -26 50 -20 50 -12 L48 -6 L-48 -6 Z", fill: col }, c);
      el("path", { d: "M-21 -37 L-2 -37 L-2 -28 L-30 -28 Z M2 -37 L18 -37 L28 -28 L2 -28 Z", fill: C.b1 }, c);
      el("circle", { cx: -28, cy: -6, r: 8, fill: C.n5 }, c); el("circle", { cx: 30, cy: -6, r: 8, fill: C.n5 }, c);
      el("circle", { cx: -28, cy: -6, r: 3.5, fill: C.n2 }, c); el("circle", { cx: 30, cy: -6, r: 3.5, fill: C.n2 }, c);
      return c;
    }
    const port = el("g", null, svg);
    [300, 520, 740].forEach((x) => el("rect", { x, y: 662, width: 6, height: 76, fill: C.n3 }, port));
    SVG.panelQuad(port, [[282, 648], [770, 648], [778, 666], [274, 666]], 18, 2);
    [[330, C.b3], [480, C.w], [630, C.o3]].forEach(([x, col], i) => {
      evSide(port, x, 740, 104, col);
      const cx = x + 58;
      el("rect", { x: cx, y: 700, width: 12, height: 38, rx: 3, fill: C.g4 }, port);
      el("rect", { x: cx + 2, y: 704, width: 8, height: 7, rx: 1.5, fill: C.w, class: "twinkle", style: `animation-delay:${-i * 0.7}s` }, port);
      const lead = el("path", { d: `M${cx} ${716} C${cx - 10} ${726} ${cx - 14} ${722} ${cx - 16} ${716}`, stroke: C.n5, "stroke-width": 2, fill: "none" }, port);
      const dot = el("circle", { r: 2.2, fill: C.g3 }, port);
      gsap.to(dot, { motionPath: { path: lead, align: lead, alignOrigin: [0.5, 0.5] }, duration: 1.1, repeat: -1, ease: "none", delay: -i * 0.3 });
    });
    svg.insertBefore(port, roadTop);   // the carport stands back from the kerb: the bus passes in front of it, never through the parked cars

    // more EVs on the road: two in the near lane heading right, one following the bus in the far lane
    [[0, C.y3], [0.5, C.b4]].forEach(([off, col]) => {
      const car = el("g", null, svg);
      evSide(car, 0, 0, 96, col);
      gsap.fromTo(car, { x: -150, y: 800 }, { x: 1750, y: 800, duration: 14, repeat: -1, ease: "none", delay: -off * 14 });
    });
    const far = el("g", null, svg);
    const farIn = el("g", { transform: "scale(-1 1)" }, far);
    evSide(farIn, 0, 0, 92, C.g4);
    gsap.fromTo(far, { x: 1750, y: 770 }, { x: -450, y: 770, duration: 22, repeat: -1, ease: "none", delay: -11 });
    svg.appendChild(rider);   // the cycle lane is nearer than the road, so the cyclist passes in front of the cars

    // people on the pavement: a parent and child walking, friends meeting
    const walkers = el("g", null, svg);
    P.person(walkers, { x: 0, y: 890, s: 0.62, skin: S[0], hairStyle: "bob", hairCol: C.br5, dress: C.b4, arms: { R: "down", L: "down" }, anim: "walk", flip: true });
    P.person(walkers, { x: -36, y: 892, s: 0.4, kid: true, skin: S[0], hairStyle: "curly", hairCol: C.br5, dress: C.o4, arms: { R: "up" }, anim: "walk", flip: true });
    gsap.fromTo(walkers, { x: 980 }, { x: 150, duration: 40, repeat: -1, ease: "none" });
    P.person(svg, { x: 700, y: 892, s: 0.64, skin: S[3], hairStyle: "short", hairCol: C.n5, top: C.o2, bottom: C.b5, arms: { R: "open" }, gesture: "R", anim: "breathe" });
    P.person(svg, { x: 740, y: 892, s: 0.62, flip: true, skin: S[1], hairStyle: "scarf", scarfCol: C.g5, top: C.w, bottom: C.n5, arms: { R: "hold", L: "hip" }, anim: "breathe" });
    // a morning run along the pavement
    // a jogger seen side-on: a proper running stride (thigh, knee, shin), bent arms swinging opposite the legs
    const runner = el("g", null, svg);
    svg.insertBefore(runner, walkers);   // she runs along the back of the pavement, passing behind the people, not through them
    const rb = el("g", { transform: "translate(0 868) scale(0.58)" }, runner);
    const cap = (a, b2, w0, w1) => {
      const dx = b2[0] - a[0], dy = b2[1] - a[1], L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
      const f = (p, n, w) => `${(p[0] + nx * n * w / 2).toFixed(1)} ${(p[1] + ny * n * w / 2).toFixed(1)}`;
      return `M${f(a, 1, w0)} L${f(b2, 1, w1)} Q${(b2[0] + ux * w1).toFixed(1)} ${(b2[1] + uy * w1).toFixed(1)} ${f(b2, -1, w1)} L${f(a, -1, w0)} Q${(a[0] - ux * w0).toFixed(1)} ${(a[1] - uy * w0).toFixed(1)} ${f(a, 1, w0)} Z`;
    };
    const skinR = S[2], ink = { stroke: C.n5, "stroke-opacity": 0.55, "stroke-width": 1.9, "stroke-linejoin": "round" };
    const farLeg = [el("path", { fill: C.n4, ...ink }, rb), el("path", { fill: C.n4, ...ink }, rb), el("path", { fill: C.n5, ...ink }, rb)];
    const farArm = [el("path", { fill: C.g4, ...ink }, rb), el("path", { fill: skinR, ...ink }, rb)];
    const torso = el("path", { fill: C.g3, ...ink }, rb);
    const pony = el("path", { fill: C.n5, ...ink }, rb);
    const head = el("path", { fill: skinR, ...ink }, rb);
    const hairTop = el("path", { fill: C.n5, ...ink }, rb);
    const nearLeg = [el("path", { fill: C.n5, ...ink }, rb), el("path", { fill: C.n5, ...ink }, rb), el("path", { fill: C.n5, ...ink }, rb)];
    const nearArm = [el("path", { fill: C.g3, ...ink }, rb), el("path", { fill: skinR, ...ink }, rb)];
    [...farLeg, ...farArm, torso, pony, head, hairTop, ...nearLeg, ...nearArm].forEach((n) => n.setAttribute("data-noink", ""));
    const R = (deg) => deg * Math.PI / 180;
    const pt = (o, ang, len) => [o[0] + Math.sin(R(ang)) * len, o[1] + Math.cos(R(ang)) * len];
    function leg(parts, ph, bob) {
      const hip = [0, -90 + bob], thigh = 30 * Math.sin(ph), knee = pt(hip, thigh, 46);
      const bend = 12 + 50 * Math.max(0, Math.sin(ph - 1.2)) + 18 * Math.max(0, -Math.sin(ph));
      const ankle = pt(knee, thigh - bend, 44);
      parts[0].setAttribute("d", cap(hip, knee, 15, 11));
      parts[1].setAttribute("d", cap(knee, ankle, 11, 7));
      parts[2].setAttribute("d", `M${ankle[0] - 5} ${ankle[1] - 3} L${ankle[0] + 14} ${ankle[1] - 1} Q${ankle[0] + 17} ${ankle[1] + 4} ${ankle[0] + 12} ${ankle[1] + 5} L${ankle[0] - 5} ${ankle[1] + 5} Z`);
    }
    function arm(parts, ph, bob) {
      const sh = [6, -144 + bob], up = -34 * Math.sin(ph), el2 = pt(sh, up, 28), hand = pt(el2, up + 95, 22);   // forearm bent forward and up, as runners hold it
      parts[0].setAttribute("d", cap(sh, el2, 11, 9));
      parts[1].setAttribute("d", cap(el2, hand, 8.5, 7));
    }
    let jph = 0, lastR = performance.now();
    gsap.ticker.add(() => {
      const now = performance.now(), dt = Math.min(0.05, (now - lastR) / 1000); lastR = now;
      jph += dt * 10.5;
      const bob = -3 * Math.abs(Math.sin(jph));
      leg(farLeg, jph + Math.PI, bob); leg(nearLeg, jph, bob);
      arm(farArm, jph, bob); arm(nearArm, jph + Math.PI, bob);
      torso.setAttribute("d", `M-14 ${-92 + bob} C-16 ${-120 + bob} -10 ${-150 + bob} 4 ${-152 + bob} C18 ${-153 + bob} 22 ${-138 + bob} 18 ${-118 + bob} L14 ${-92 + bob} Z`);
      head.setAttribute("d", `M10 ${-181 + bob} C22 ${-181 + bob} 23 ${-165 + bob} 18 ${-158 + bob} Q12 ${-152 + bob} 6 ${-156 + bob} C-1 ${-160 + bob} -1 ${-181 + bob} 10 ${-181 + bob} Z`);
      hairTop.setAttribute("d", `M-1 ${-166 + bob} C-2 ${-184 + bob} 20 ${-188 + bob} 22 ${-171 + bob} C14 ${-176 + bob} 6 ${-174 + bob} -1 ${-166 + bob} Z`);
      const sw = 6 * Math.sin(jph * 2);
      pony.setAttribute("d", `M0 ${-176 + bob} C-12 ${-178 + bob} -20 ${-170 + bob + sw} -24 ${-160 + bob + sw} C-16 ${-164 + bob + sw} -8 ${-166 + bob} 1 ${-168 + bob} Z`);
    });
    gsap.fromTo(runner, { x: -120 }, { x: 1250, duration: 11, repeat: -1, ease: "none", delay: -4 });

    // a café on the near side of the street, its terrace out on the pavement
    const cafe = el("g", null, svg);
    el("rect", { x: 1250, y: 612, width: 420, height: 288, fill: C.w }, cafe);
    el("rect", { x: 1280, y: 690, width: 150, height: 120, fill: C.y2 }, cafe);
    el("path", { d: "M1355 690 L1355 810 M1280 750 L1430 750", stroke: C.w, "stroke-width": 5, fill: "none" }, cafe);
    el("rect", { x: 1460, y: 700, width: 64, height: 200, fill: C.br4 }, cafe);
    el("rect", { x: 1244, y: 602, width: 432, height: 12, fill: C.n4 }, cafe);
    for (let k = 0; k < 11; k++) el("path", { d: `M${1250 + k * 40} 614 L${1290 + k * 40} 614 L${1290 + k * 40} 652 Q${1270 + k * 40} 666 ${1250 + k * 40} 652 Z`, fill: k % 2 ? C.w : C.o3 }, cafe);
    el("text", { x: 1355, y: 684, "text-anchor": "middle", "font-family": "Poppins", "font-weight": 600, "font-size": 14, "letter-spacing": 3, fill: C.n4, text: "CAFÉ" }, cafe);
    [[1110, 0], [1360, 1]].forEach(([tx, t]) => {
      el("path", { d: `M${tx - 44} 846 L${tx + 44} 846 L${tx + 44} 852 L${tx - 44} 852 Z`, fill: C.w }, cafe);
      el("rect", { x: tx - 3, y: 852, width: 6, height: 40, fill: C.n4 }, cafe);
      if (!t) {
        // working on laptops
        P.person(cafe, { x: tx - 64, y: 894, s: 0.62, pose: "sit", skin: S[3], hairStyle: "short", hairCol: C.n5, top: C.b4, bottom: C.n5, arms: { R: "table", L: "table" }, type: true });
        P.person(cafe, { x: tx + 64, y: 894, s: 0.62, pose: "sit", flip: true, skin: S[0], hairStyle: "bun", hairCol: C.n5, top: C.o2, bottom: C.n4, arms: { R: "table", L: "table" }, type: true });
        [[-26, 1], [26, -1]].forEach(([dx, dir]) => {
          el("path", { d: `M${tx + dx - 12} 846 L${tx + dx + 12} 846 L${tx + dx + 10} 843 L${tx + dx - 10} 843 Z`, fill: C.n3 }, cafe);
          el("path", { d: `M${tx + dx + dir * 10} 843 L${tx + dx + dir * 10} 843 L${tx + dx + dir * 14} 826 L${tx + dx - dir * 6} 826 L${tx + dx - dir * 10} 843 Z`, fill: C.n4 }, cafe);
          el("path", { d: `M${tx + dx + dir * 8} 841 L${tx + dx + dir * 11} 828 L${tx + dx - dir * 4} 828 L${tx + dx - dir * 8} 841 Z`, fill: C.b3, class: "twinkle" }, cafe);
        });
        el("rect", { x: tx - 4, y: 834, width: 8, height: 12, rx: 2, fill: C.w }, cafe);
      } else {
        // friends catching up over coffee
        P.person(cafe, { x: tx - 64, y: 894, s: 0.62, pose: "sit", skin: S[1], hairStyle: "long", hairCol: C.y4, top: C.y3, bottom: C.n5, arms: { R: "table", L: "down" }, gesture: "R", anim: "breathe" });
        P.person(cafe, { x: tx + 64, y: 894, s: 0.62, pose: "sit", flip: true, skin: S[2], hairStyle: "curly", hairCol: C.n5, top: C.g4, bottom: C.n4, arms: { R: "table", L: "open" }, gesture: "L", anim: "breathe" });
        el("rect", { x: tx - 14, y: 834, width: 9, height: 12, rx: 2, fill: C.w }, cafe);
        el("rect", { x: tx + 6, y: 834, width: 9, height: 12, rx: 2, fill: C.w }, cafe);
        el("path", { d: `M${tx - 10} 830 q-3 -6 0 -12 M${tx + 10} 830 q3 -6 0 -12`, stroke: C.n2, "stroke-width": 1.5, fill: "none", class: "twinkle" }, cafe);
      }
    });
    // planters along the kerb
    [[120, 860], [420, 866], [1000, 862]].forEach(([x, y]) => {
      el("path", { d: `M${x - 30} ${y} L${x + 30} ${y} L${x + 24} ${y + 30} L${x - 24} ${y + 30} Z`, fill: C.br3 }, svg);
      [[-16, -8], [0, -18], [16, -8]].forEach(([dx, dy]) => el("circle", { cx: x + dx, cy: y + dy, r: 16, fill: C.g4 }, svg));
    });
    return gsap.timeline({ paused: true });
  }
  function SKIN_OF() { return PEOPLE.SKIN; }

  window.SCENES = { rail, road, power, gap, hero };
})();
