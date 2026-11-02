/* index.html: small page behaviours for the revision. */
// One line weight for the whole drawing: every outline and line is black and 0.5px on screen at any zoom, except the grid's
// wires (and the moving power on them). Thick straight strokes that stand for solid things (cross-arms, pipes, quay edges)
// become thin filled bars with the same outline; light markings (road dashes, solar cell lines) keep their colour.
window.UNIFORM_INK = function (svg) {
  const NS = "http://www.w3.org/2000/svg", W = 0.4,   /* 0.4 (was 0.5, then 0.3) */ lum = (c) => { const m = /^#?([0-9a-f]{6})$/i.exec((c || "").trim()); if (!m) return c === "white" ? 1 : 0; const v = parseInt(m[1], 16); return (0.299 * (v >> 16) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255)) / 255; };
  const thin = (n, col) => { n.setAttribute("stroke", col || "#000"); n.setAttribute("stroke-width", W); n.setAttribute("vector-effect", "non-scaling-stroke"); n.setAttribute("stroke-linejoin", "miter"); n.setAttribute("stroke-linecap", "butt"); };
  svg.querySelectorAll("path, polygon, polyline, rect, circle, ellipse, line").forEach((n) => {
    if (n.closest("defs, clipPath, mask, pattern, text, .oc-pk, .oc-callouts, [data-wire]") || n.hasAttribute("data-wire")) return;
    if (n.hasAttribute("data-crown")) { n.setAttribute("stroke-width", W * 2); return; }   // half of it shows: 0.5
    if (n.hasAttribute("data-nostroke")) return;
    const f = (n.getAttribute("fill") || "").trim(), sk = (n.getAttribute("stroke") || "").trim(), sw = parseFloat(n.getAttribute("stroke-width") || "1");
    if (f.startsWith("url(") || (n.tagName === "rect" && +n.getAttribute("width") >= 1500)) return;   // skies and backgrounds
    const filled = f && f !== "none" && f !== "transparent";
    if (filled) { if (sk === "none" || n.getAttribute("stroke-width") === "0" || f.startsWith("rgba")) return; thin(n); return; }
    if (!sk || sk === "none") return;
    if (n.getAttribute("stroke-dasharray") || n.style.strokeDasharray) { n.setAttribute("stroke", lum(sk) >= 0.75 ? sk : "#000"); n.setAttribute("stroke-width", 1); return; }   // drawn on by length: keep scaling strokes
    // a line: a straight thick one becomes a bar, a light one keeps its colour, the rest go black
    const d = n.tagName === "path" ? n.getAttribute("d") || "" : "", m = /^\s*M\s*(-?[\d.]+)[ ,](-?[\d.]+)\s*L\s*(-?[\d.]+)[ ,](-?[\d.]+)\s*$/.exec(d);
    const seg = m ? m.slice(1).map(Number) : n.tagName === "line" ? ["x1", "y1", "x2", "y2"].map((k) => +n.getAttribute(k)) : null;
    if (seg && sw >= 1.6 && lum(sk) < 0.75) { const [x1, y1, x2, y2] = seg, L = Math.hypot(x2 - x1, y2 - y1) || 1, ox = -(y2 - y1) / L * sw / 2, oy = (x2 - x1) / L * sw / 2;
      const bar = document.createElementNS(NS, "polygon"); bar.setAttribute("points", [[x1 + ox, y1 + oy], [x2 + ox, y2 + oy], [x2 - ox, y2 - oy], [x1 - ox, y1 - oy]].map((q) => q.map((v) => v.toFixed(2)).join(",")).join(" "));
      bar.setAttribute("fill", sk); thin(bar); [...n.attributes].forEach((a) => { if (/^(class|style|opacity|transform)$/.test(a.name)) bar.setAttribute(a.name, a.value); }); n.replaceWith(bar); return; }
    thin(n, lum(sk) >= 0.75 ? sk : "#000");
  });
};
(function () {
  // the hero shows the same city as the story, finished, instead of the older illustration
  const hero = document.getElementById("scene-hero");
  if (hero && window.SCENES && SCENES.onecity6) {
    while (hero.firstChild) hero.removeChild(hero.firstChild);
    hero.setAttribute("preserveAspectRatio", "xMidYMid slice");
    const tl = SCENES.onecity6(hero); tl.progress(1);
    const oc = hero.__oc;
    // fit the city into the space the text leaves: to its right on wide screens, below it on narrow ones, never under it
    // fit the city as large as it can be without touching the text: the city's outline (its ground diamond, raised by its
    // tallest things) is tested against the text block at a range of sizes and places; the biggest that fits wins
    const fit = () => {
      Object.assign(oc.cam, oc.camAt(23.25, 23.25, 0.4)); oc.setCam();
      const m0 = hero.getScreenCTM(); if (!m0) return; const px = m0.a;
      const txt = [".hero h1", ".hero .standfirst", ".hero__cue", ".hero .tbar"].map((q) => document.querySelector(q)).filter(Boolean).map((n) => n.getBoundingClientRect());
      const T = { l: Math.min(...txt.map((r) => r.left)) - 24, r: Math.max(...txt.map((r) => r.right)) + 32, t: Math.min(...txt.map((r) => r.top)) - 24, b: Math.max(...txt.map((r) => r.bottom)) + 32 };
      const rb = oc.S.root.getBoundingClientRect(), toS = (gx, gy) => { const q = oc.P(gx, gy, 0); return [m0.e + px * (oc.cam.tx + oc.cam.s * q[0]), m0.f + px * (oc.cam.ty + oc.cam.s * q[1])]; };
      const N = 46.5, D = [toS(0, 0), toS(N, 0), toS(N, N), toS(0, N)], rise = Math.max(0, Math.min(...D.map((d) => d[1])) - rb.top);
      const hull0 = D.concat(D.map(([x, y]) => [x, y - rise])), cx0 = (rb.left + rb.right) / 2, cy0 = (rb.top + rb.bottom) / 2;
      const inside = (pt, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c; } return c; };
      const hullOf = (ps) => { ps = ps.slice().sort((a, c) => a[0] - c[0] || a[1] - c[1]); const cr = (o, a, c) => (a[0] - o[0]) * (c[1] - o[1]) - (a[1] - o[1]) * (c[0] - o[0]); const lo = [], up = [];
        ps.forEach((q) => { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }); ps.slice().reverse().forEach((q) => { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }); return lo.slice(0, -1).concat(up.slice(0, -1)); };
      const H0 = hullOf(hull0), W = innerWidth, Hh = innerHeight, top = 70, wide = W >= 700;
      let best = null;
      for (let k = 3; k >= 0.3; k -= 0.02) { const w = (rb.width) * k, h = (rb.height) * k;
        for (let fx = 0; fx <= 1; fx += 0.05) for (let fy = 0; fy <= 1; fy += 0.1) {
          const sx = W - 20 - w + 0.3 * w, sy = Hh - 10 - top - h + 0.26 * h; if (sx < 0 || sy < 0) continue; const cx = 10 + w / 2 + fx * sx, cy = top + h / 2 + fy * sy;   // the city may run a little off the right and bottom edges
          const poly = H0.map(([x, y]) => [cx + (x - cx0) * k, cy + (y - cy0) * k]);
          const corners = [[T.l, T.t], [T.r, T.t], [T.r, T.b], [T.l, T.b]];
          if (corners.some((c) => inside(c, poly)) || poly.some(([x, y]) => x > T.l && x < T.r && y > T.t && y < T.b)) continue;
          // edges crossing the text box
          let hit = false; for (let i = 0; i < poly.length && !hit; i++) { const a = poly[i], c = poly[(i + 1) % poly.length]; for (let t = 0; t <= 1; t += 0.05) { const x = a[0] + (c[0] - a[0]) * t, y = a[1] + (c[1] - a[1]) * t; if (x > T.l && x < T.r && y > T.t && y < T.b) { hit = true; break; } } }
          if (hit) continue; best = { k, cx, cy }; break; }
        if (best) break; }
      if (!wide || !best) { const k = Math.min((W - 24) / rb.width, (Hh - Math.max(T.b, top) - 20) / rb.height); best = { k, cx: W / 2, cy: Math.max(T.b, top) + 10 + rb.height * k / 2 }; }
      if (wide) { best.cx -= Math.min(90, W * 0.06); best.cy -= Math.min(70, Hh * 0.08); }   // nudged left and up (the city's far corners may slip under the text's empty margin)
      oc.cam.s *= best.k; oc.cam.tx = oc.cam.tx * best.k + (best.cx - m0.e) / px - (cx0 - m0.e) / px * best.k; oc.cam.ty = oc.cam.ty * best.k + (best.cy - m0.f) / px - (cy0 - m0.f) / px * best.k; oc.setCam(); };
    fit(); addEventListener("resize", fit); if (document.fonts) document.fonts.ready.then(fit);
    Object.values(oc.LINES).forEach((L) => L.cond.forEach((w) => { w.setAttribute("stroke", "#262C3A"); w.setAttribute("stroke-width", 1.1); }));   // every wire black
    HAND.install(hero, { ink: "#192238" }); UNIFORM_INK(hero);
  }

  // the renewable and fossil key shows only on the steps about the grid's flows (the old grid onwards, B17-B30)
  const sec = document.querySelector(".era--onecity:not(.era--story4)"), key = sec && sec.querySelector(".legend--onecity");
  if (key) { const steps = sec.querySelectorAll(".era__steps > .step"), first = steps[15], last = steps[17];   // the three flow steps (old grid, spread out, two ways)
    if (first && last) ScrollTrigger.create({ trigger: first, endTrigger: last, start: "top 70%", end: "bottom 30%", onToggle: (s) => key.classList.toggle("is-on", s.isActive) }); }
  // the turbines spin with GSAP, not CSS: pause each one while its drawing is held still
  setInterval(() => (window.ISO && ISO.tweens || []).forEach((tw) => { const n = tw.vars && tw.vars.data; if (!n || !n.closest) return;
    const still = !!n.closest('[data-still="1"]'); if (still && !tw.paused()) tw.pause(); else if (!still && tw.paused()) tw.play(); }), 250);
  // B to C: one city. Section C's stage sits under the end of B (css/v6.css) but stays invisible until it reaches the top
  // of the screen, at the very moment B's identical, finished city starts to scroll away underneath it
  const c4 = document.querySelector(".era--story4");
  if (c4) ScrollTrigger.create({ trigger: c4, start: "top top", end: "bottom top", onEnter: () => c4.classList.add("is-live"), onLeaveBack: () => c4.classList.remove("is-live") });
  ["scene-onecity", "scene-city4"].forEach((id) => { const s = document.getElementById(id); if (s) UNIFORM_INK(s); });
})();
