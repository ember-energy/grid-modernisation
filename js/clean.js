/* the clean, straight-edged finish (CleanFlex style).
   Loaded after handdrawn.js and before main.js. Scenes drawn isometrically carry data-noink: every filled shape in them gets
   the same fine outline, a 1px black line on screen whatever the zoom. The rest keep their drawings but lose the hand-cut
   wobble and paper grain, and take a fine solid black outline. */
(function () {
  if (!window.CLEAN || !window.HAND) return;
  const SHAPES = "path, polygon, polyline, rect, circle, ellipse", W = "0.5";
  // one outline for every filled shape: black, 0.5px on screen (lines and strokes-only marks keep their own colour and weight)
  // data-ink-scale on the svg (sections K and L, whose camera zooms): plain strokes of that many times the width instead of
  // non-scaling ones. Recomputing thousands of non-scaling strokes on every frame of a zoom made the picture flicker.
  function outline(root) {
    const sc = +(root.getAttribute && root.getAttribute("data-ink-scale")) || 0, ls = sc ? localScale(root) : null;
    const fix = (n) => { if (sc) { n.setAttribute("stroke-width", (+W * sc / ls(n)).toFixed(3)); n.removeAttribute("vector-effect"); } else { n.setAttribute("stroke-width", W); n.setAttribute("vector-effect", "non-scaling-stroke"); } };
    root.querySelectorAll(SHAPES).forEach((n) => {
      if (n.closest("defs, clipPath, mask, pattern, text, [data-keepstroke]") || n.hasAttribute("data-nostroke")) return;
      const sk = (n.getAttribute("stroke") || "").toLowerCase();
      if ((sk === "#000" || sk === "#000000") && (n.getAttribute("fill") || "none") === "none") { fix(n); return; }   // black linework (pylon lattices, mast legs, outlines drawn as lines) at the same weight
      if (n.getAttribute("stroke-width") === "0" || n.getAttribute("stroke") === "none") return;   // drawn deliberately without an edge (road sections, stripes, glows)
      const f = (n.getAttribute("fill") || "").trim();
      if (!f || f === "none" || f === "transparent" || f.startsWith("url(") || f.startsWith("rgba")) return;
      if (n.tagName === "rect" && +n.getAttribute("width") >= 1500) return;   // a full-page background
      n.setAttribute("stroke", "#000");
      n.setAttribute("stroke-linejoin", "round");
      fix(n);
    });
  }
  // how much a shape is scaled relative to the svg's own user space (people, animals and smoke are drawn in small scaled
  // groups): a plain stroke is divided by it, so every outline ends up the same width
  function localScale(root) {
    const top = root.querySelector(":scope > g"), m0 = top && top.getCTM(), d0 = m0 ? Math.sqrt(Math.abs(m0.a * m0.d - m0.b * m0.c)) : 1;
    return (n) => { const m = n.getCTM && n.getCTM(); if (!m || !d0) return 1; const d = Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) / d0; return d > 1e-4 ? d : 1; };
  }
  window.ISO_OUTLINE = outline; window.ISO_LS = localScale;
  const orig = HAND.install;
  HAND.install = function (svg, opts) {
    if (svg.hasAttribute("data-noink")) { outline(svg); return; }
    svg.setAttribute("data-nowobble", "");   // straight edges: no hand-cut wobble anywhere
    orig(svg, Object.assign({}, opts, { ink: "#000000", wobble: 0, inkWidth: 0.5 }));   // the outline is made solid in css/clean.css
    svg.querySelectorAll(".isoslab").forEach(outline);   // the isometric slabs on the world map (section J)
  };
})();
