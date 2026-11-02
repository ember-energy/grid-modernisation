/* Hand-drawn finish for the flat scenes.
   1. Organic edges: a static noise map displaces every shape slightly, so edges read as cut/drawn by hand.
   2. Ink contours: filled shapes get a fine pen line in the scene's darkest tone.
   3. Print texture: a subtle risograph-style grain over the illustration (applied in CSS).
   None of these are shadows, glows or bevels — the image stays flat. */
(function () {
  const NS = "http://www.w3.org/2000/svg";
  let grainURL = null;

  function grain() {
    const n = 180, cv = document.createElement("canvas"); cv.width = cv.height = n;
    const ctx = cv.getContext("2d"), img = ctx.createImageData(n, n);
    for (let i = 0; i < n * n; i++) {
      const v = Math.random();
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = 25;
      img.data[i * 4 + 3] = v > 0.6 ? Math.round((v - 0.6) * 55) : 0;
    }
    ctx.putImageData(img, 0, 0);
    return cv.toDataURL("image/png");
  }

  // coordinate-based value noise: shared edges between neighbouring shapes wobble identically
  function makeNoise(seed) {
    let s = seed || 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const sm = (t) => t * t * (3 - 2 * t);
    const tables = [0, 1, 2, 3].map(() => Float32Array.from({ length: 4096 }, rnd));
    const hash = (x, y) => (((x * 73856093) ^ (y * 19349663)) >>> 0) & 4095;
    function vn(t, x, y) {
      const x0 = Math.floor(x), y0 = Math.floor(y), fx = sm(x - x0), fy = sm(y - y0);
      const a = t[hash(x0, y0)], b = t[hash(x0 + 1, y0)], c = t[hash(x0, y0 + 1)], d = t[hash(x0 + 1, y0 + 1)];
      return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy - 0.5;
    }
    return (x, y) => [
      vn(tables[0], x / 90, y / 90) * 0.72 + vn(tables[1], x / 22, y / 22) * 0.28,
      vn(tables[2], x / 90, y / 90) * 0.72 + vn(tables[3], x / 22, y / 22) * 0.28
    ];
  }
  const noise = makeNoise(11);
  const tmpPath = () => document.createElementNS(NS, "path");

  function subpaths(n) {
    const tag = n.tagName;
    if (tag === "path") {
      const d = n.getAttribute("d") || "";
      return d.split(/(?=M)/).filter((x) => x.trim()).map((x) => ({ d: x, closed: /[Zz]\s*$/.test(x.trim()) }));
    }
    if (tag === "rect") {
      const x = +n.getAttribute("x") || 0, y = +n.getAttribute("y") || 0, w = +n.getAttribute("width"), h = +n.getAttribute("height");
      const r = Math.min(+n.getAttribute("rx") || 0, w / 2, h / 2);
      if (r > 0) return [{ d: `M${x + r} ${y} L${x + w - r} ${y} A${r} ${r} 0 0 1 ${x + w} ${y + r} L${x + w} ${y + h - r} A${r} ${r} 0 0 1 ${x + w - r} ${y + h} L${x + r} ${y + h} A${r} ${r} 0 0 1 ${x} ${y + h - r} L${x} ${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} Z`, closed: true }];
      return [{ d: `M${x} ${y} L${x + w} ${y} L${x + w} ${y + h} L${x} ${y + h} Z`, closed: true }];
    }
    if (tag === "circle" || tag === "ellipse") {
      const cx = +n.getAttribute("cx") || 0, cy = +n.getAttribute("cy") || 0;
      const rx = tag === "circle" ? +n.getAttribute("r") : +n.getAttribute("rx"), ry = tag === "circle" ? rx : +n.getAttribute("ry");
      return [{ d: `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`, closed: true }];
    }
    return null;
  }

  // resample a shape's outline and nudge every point by the noise field (in scene coordinates)
  function roughen(svg, n, amp) {
    const parts = subpaths(n);
    if (!parts) return false;
    let toScene, back;
    try {
      toScene = svg.getCTM().inverse().multiply(n.getCTM());
      back = toScene.inverse();
      if (!isFinite(back.a) || Math.abs(toScene.a * toScene.d - toScene.b * toScene.c) < 1e-6) throw 0;
    } catch (e) { toScene = new DOMMatrix(); back = new DOMMatrix(); } // collapsed (scale 0) before its reveal: use local space
    let out = "";
    for (const sp of parts) {
      const t = tmpPath(); t.setAttribute("d", sp.d); svg.appendChild(t);
      const len = t.getTotalLength();
      if (!len) { svg.removeChild(t); continue; }
      const scale = Math.hypot(toScene.a, toScene.b) || 1;
      const step = Math.max(5 / scale, len / 160);
      const N = Math.max(4, Math.ceil(len / step));
      let d = "";
      for (let i = 0; i <= (sp.closed ? N - 1 : N); i++) {
        const p = t.getPointAtLength((i / N) * len);
        const g = new DOMPoint(p.x, p.y).matrixTransform(toScene);
        const [nx, ny] = noise(g.x, g.y);
        const q = new DOMPoint(g.x + nx * amp * 2, g.y + ny * amp * 2).matrixTransform(back);
        d += (i ? " L" : "M") + q.x.toFixed(1) + " " + q.y.toFixed(1);
      }
      out += d + (sp.closed ? " Z " : " ");
      svg.removeChild(t);
    }
    return out.trim();
  }

  function install(svg, opts) {
    opts = Object.assign({ ink: "#192238", wobble: 1.8, inkWidth: 1.2 }, opts);
    if (!grainURL) { grainURL = grain(); document.documentElement.style.setProperty("--grain", `url(${grainURL})`); }

    const shapes = [...svg.querySelectorAll("path, rect, circle, ellipse")].filter((n) => !n.closest("defs, clipPath, pattern, text, [data-noink]"));
    shapes.forEach((n) => {
      // ink contour on filled shapes (skip gradients, tiny marks, full-frame backgrounds, translucent tints, figures)
      const fill = n.getAttribute("fill");
      let bb; try { bb = n.getBBox(); } catch (e) { return; }
      const size = Math.max(bb.width, bb.height);
      // every filled shape is outlined; only gradients (skies), full-frame backgrounds and translucent tone overlays are left bare
      const inkable = fill && fill !== "none" && !fill.startsWith("url(") && !n.hasAttribute("stroke") && !n.hasAttribute("opacity") &&
        size >= 2 && !(bb.width >= 1590 && bb.height >= 880);
      if (inkable) {
        n.setAttribute("stroke", opts.ink);
        n.setAttribute("stroke-opacity", 0.55);
        let k = 1; try { const m = svg.getCTM().inverse().multiply(n.getCTM()); k = Math.hypot(m.a, m.b) || 1; } catch (e) {}
        n.setAttribute("stroke-width", (opts.inkWidth / (k > 0.05 ? k : 1)).toFixed(2)); // constant on-screen line weight, without the costly non-scaling-stroke
        n.setAttribute("stroke-linejoin", "round");
      }
      // hand-drawn edges, baked into the geometry once
      if (size < 12 || n.closest("[data-nowobble]") || n.classList.contains("puff") || n.style.strokeDasharray || n.hasAttribute("stroke-dasharray")) return;
      const d = roughen(svg, n, opts.wobble);
      if (!d) return;
      if (n.tagName === "path") { n.setAttribute("d", d); return; }
      if (n._gsap) return; // animated shapes keep their identity
      const p = document.createElementNS(NS, "path");
      [...n.attributes].forEach((a) => { if (!["x", "y", "width", "height", "rx", "ry", "cx", "cy", "r"].includes(a.name)) p.setAttribute(a.name, a.value); });
      p.setAttribute("d", d);
      n.replaceWith(p);
    });
  }

  window.HAND = { install };
})();
