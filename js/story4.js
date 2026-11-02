/* index4.html, "Modernising the grid": the seventeen interventions on the one city (a second copy of js/iso-onecity.js,
   in its finished, modern state). A sticky text box per category, with an icon bar of its items and the current item's
   header and description; on the city the camera moves to the item, the parts it acts on stay in colour, and its
   technologies appear as callouts, each with a shield. Then the time and cost matrix. Data: js/data4.js. */
(function () {
  const sec = document.getElementById("how4"), svg = document.getElementById("scene-city4");
  if (!sec || !svg || !window.SCENES || !SCENES.onecity || !window.INTERVENTIONS4) return;
  const { el } = SVG;
  const NS = "http://www.w3.org/2000/svg";

  // ---------- the city, finished ----------
  const tl = SCENES.onecity(svg); tl.progress(1);
  const OC = svg.__oc, { S, T, P, cam, setCam, camAt, HOME, items, W0, WASH } = OC;
  const callG = el("g", { class: "oc-callouts", "data-noink": "" }, svg);

  const toScreen = (x, y, z) => { const q = P(x, y, z || 0); return [cam.tx + cam.s * q[0], cam.ty + cam.s * q[1]]; };
  const CATCOL = { optimise: "#0B6638", reinforce: "#203772", expand: "#BF3100" };
  const wrap = (t, n) => { const out = []; let line = ""; t.split(" ").forEach((w) => { if ((line + " " + w).trim().length > n) { out.push(line.trim()); line = w; } else line += " " + w; }); if (line.trim()) out.push(line.trim()); return out; };

  // a callout: a dot on the city, a short leader, and a small square card: the technology's shield above its name, centred
  const SH = 50, CW = 148, LH = 16;
  let calls = [];
  function drawCallouts(iv) {
    calls = [];
    while (callG.firstChild) callG.removeChild(callG.firstChild);
    if (!iv) return;
    const col = CATCOL[iv.cat];
    iv.tech.forEach((t, i) => {
      const g = el("g", { class: "oc-call", opacity: 0 }, callG);
      const line = el("path", { fill: "none", stroke: col, "stroke-width": 1.5 }, g);
      const dot = el("circle", { r: 4.5, fill: "#FFFFFF", stroke: col, "stroke-width": 2.2 }, g);
      const lab = el("g", null, g), lines = wrap(t.name, t.name.length > 64 ? 28 : 19), H = 12 + SH + 8 + lines.length * LH + 8;
      const rect = el("rect", { x: 0, y: 0, width: CW, height: H, fill: "#FFFFFF", stroke: "#000000", "stroke-width": 1.2 }, lab);
      const txt = lines.map((l, k) => el("text", { x: CW / 2, y: 12 + SH + 8 + k * LH + 12, "text-anchor": "middle", "font-family": "Poppins", "font-size": 12.5, "font-weight": 500, fill: "#192238", text: l }, lab));
      const tw = txt.map((n) => { try { return n.getComputedTextLength(); } catch (e) { return 0; } });
      const W = Math.max(CW, Math.ceil(Math.max(...tw) + 24));
      rect.setAttribute("width", W); txt.forEach((n) => n.setAttribute("x", W / 2));
      SVG.signGroup(SIGNCAT4[iv.cat], t.icon, W / 2, 12 + SH / 2, SH, lab);
      calls.push({ t, g, line, dot, lab, W, H, ox: 0, oy: 0, ex: 0, ey: 0 });
      gsap.to(g, { opacity: 1, duration: 0.35, delay: 0.5 + i * 0.1 });
    });
  }

  // ---------- where the cards go ----------
  // Worked out once per item, for the camera's end position: each card tries a ring of spots around its point and takes
  // the cheapest one: on screen, off the text box, off the other cards, points and leaders, off the parts in colour, close by,
  // and facing away from the item's other points. The card then rides with its point while the camera moves.
  const svgBox = (r) => { const m = svg.getScreenCTM(); if (!m) return null; const i = m.inverse(), pt = svg.createSVGPoint();
    pt.x = r.left; pt.y = r.top; const a = pt.matrixTransform(i); pt.x = r.right; pt.y = r.bottom; const b = pt.matrixTransform(i);
    return { x0: a.x, y0: a.y, x1: b.x, y1: b.y }; };
  const ovl = (a, b) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
  const inR = (p, r, m) => p[0] > r.x0 - m && p[0] < r.x1 + m && p[1] > r.y0 - m && p[1] < r.y1 + m;
  const cross = (p, q, r, s) => { const d = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    return d(p, q, r) * d(p, q, s) < 0 && d(r, s, p) * d(r, s, q) < 0; };
  const segHitsRect = (p, q, r) => { for (let k = 1; k < 10; k++) { const t = k / 10; if (inR([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t], r, 0)) return true; } return false; };
  const anchorOf = (r, x, y) => [Math.max(r.x0, Math.min(r.x1, x)), Math.max(r.y0, Math.min(r.y1, y))];   // the nearest point of the card's edge
  let activeCard = null;
  function layout(iv, to) {
    if (!iv) return;
    const scr = (x, y, z) => { const q = P(x, y, z || 0); return [to.tx + to.s * q[0], to.ty + to.s * q[1]]; };
    const vw = svgBox({ left: 0, top: 80, right: innerWidth, bottom: innerHeight - 46 });
    const cr = activeCard && innerWidth > 900 ? activeCard.getBoundingClientRect() : null;
    const card = cr && cr.width ? svgBox({ left: cr.left - 16, top: Math.max(cr.top, 70) - 16, right: cr.right + 22, bottom: cr.bottom + 16 }) : null;
    // the parts in colour, at the end position (their boxes in the camera-free frame, then through the end camera)
    const rootInv = S.root.getCTM() ? S.root.getCTM().inverse() : null, pt = svg.createSVGPoint();
    const keep = iv.focus ? T(...iv.focus) : [];
    const objs = []; keep.forEach((n) => { try { const bb = n.getBBox(); if (!bb.width || !rootInv) return; const m = rootInv.multiply(n.getCTM());
      const cs = [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]].map(([x, y]) => { pt.x = x; pt.y = y; const q = pt.matrixTransform(m); return [to.tx + to.s * q.x, to.ty + to.s * q.y]; });
      objs.push({ x0: Math.min(...cs.map((c) => c[0])), y0: Math.min(...cs.map((c) => c[1])), x1: Math.max(...cs.map((c) => c[0])), y1: Math.max(...cs.map((c) => c[1])) }); } catch (e) {} });
    const pts = calls.map((c) => scr(...c.t.at)), cx = pts.reduce((a, p) => a + p[0], 0) / pts.length, cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
    const placed = [], leaders = [];
    // the most hemmed-in points first: those nearest the middle of the group
    const order = calls.map((c, i) => i).sort((i, j) => Math.hypot(pts[i][0] - cx, pts[i][1] - cy) - Math.hypot(pts[j][0] - cx, pts[j][1] - cy));
    order.forEach((i) => { const c = calls[i], [x, y] = pts[i]; let best = null;
      const away = Math.hypot(x - cx, y - cy) > 20 ? [(x - cx) / Math.hypot(x - cx, y - cy), (y - cy) / Math.hypot(x - cx, y - cy)] : null;
      // the leader leaves the point at 30 to 60 degrees and ends on the card's nearest corner
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const deg of [30, 38, 45, 52, 60]) for (const d of [50, 80, 115, 160, 210]) {
        const ux = sx * Math.cos(deg * Math.PI / 180), uy = sy * Math.sin(deg * Math.PI / 180), ex = x + ux * d, ey = y + uy * d;
        const r = { x0: sx > 0 ? ex : ex - c.W, y0: sy > 0 ? ey : ey - c.H }; r.x1 = r.x0 + c.W; r.y1 = r.y0 + c.H;
        let cost = d * 1.6 + Math.abs(deg - 45) * 1.5;
        if (vw) cost += (r.x0 < vw.x0 + 12 || r.x1 > vw.x1 - 12 || r.y0 < vw.y0 || r.y1 > vw.y1) ? 1e6 : 0;
        if (card) cost += ovl(r, card) > 0 ? 1e6 : 0;
        placed.forEach((q) => { if (ovl({ x0: r.x0 - 12, y0: r.y0 - 12, x1: r.x1 + 12, y1: r.y1 + 12 }, q) > 0) cost += 2e5; });
        pts.forEach((p, k) => { if (k !== i && inR(p, r, 14)) cost += 6e4; });
        const an = [ex, ey];
        leaders.forEach(([p, q]) => { if (cross([x, y], an, p, q)) cost += 3e4; if (segHitsRect(p, q, r)) cost += 3e4; });
        placed.forEach((q) => { if (segHitsRect([x, y], an, q)) cost += 3e4; });
        objs.forEach((o) => { cost += ovl(r, o) * 0.12; });
        if (away) cost -= (ux * away[0] + uy * away[1]) * 90;
        if (!best || cost < best.cost) best = { cost, r, an };
      }
      placed.push(best.r); leaders.push([[x, y], best.an]);
      c.ox = best.r.x0 - x; c.oy = best.r.y0 - y; c.ex = best.an[0] - x; c.ey = best.an[1] - y; });
  }
  function placeCallouts() {
    calls.forEach((c) => { const [x, y] = toScreen(...c.t.at), r = { x0: x + c.ox, y0: y + c.oy }, ax = x + c.ex, ay = y + c.ey;
      c.dot.setAttribute("cx", x.toFixed(1)); c.dot.setAttribute("cy", y.toFixed(1));
      c.line.setAttribute("d", `M${x.toFixed(1)} ${y.toFixed(1)} L${ax.toFixed(1)} ${ay.toFixed(1)}`);
      c.lab.setAttribute("transform", `translate(${r.x0.toFixed(1)} ${r.y0.toFixed(1)})`); });
  }
  addEventListener("resize", () => { if (current) { layout(current, cam); placeCallouts(); } });

  // ---------- states: the camera, what stays in colour, the callouts ----------
  const fnow = new Map(items.map((n) => [n, W0])); let gnow = W0, current;
  const hidden = T("hvdc");
  function show(iv) {
    if (iv === current) return; current = iv;
    // the camera
    const to = iv ? camAt(iv.view[0], iv.view[1], iv.view[2]) : HOME;
    drawCallouts(iv); layout(iv, to);
    gsap.to(cam, Object.assign({}, to, { duration: 0.9, ease: "power2.inOut", overwrite: true, onUpdate: () => { setCam(); placeCallouts(); } }));
    // what stays in colour
    const keep = new Set(iv && iv.focus ? T(...iv.focus).concat(T(...(iv.show || []))) : items);
    items.forEach((n) => { const want = keep.has(n) ? W0 : WASH; if (fnow.get(n) !== want) { gsap.to(n, { filter: want, duration: 0.45, overwrite: "auto" }); fnow.set(n, want); } });
    const gw = iv && iv.focus ? (OC.GWASH || WASH) : W0; if (gw !== gnow) { gsap.to(S.ground, { filter: gw, duration: 0.45 }); gnow = gw; }
    // the HVDC link only when an item calls for it
    gsap.to(hidden, { opacity: iv && (iv.show || []).includes("hvdc") ? 1 : 0, duration: 0.4 });
    placeCallouts();
  }

  // ---------- the text boxes ----------
  const steps = document.getElementById("story4-steps");
  const icon = (name) => { const ic = ICONS[name]; return ic ? `<svg viewBox="${ic.vb}" aria-hidden="true">${ic.body}</svg>` : ""; };
  const beats = [];
  CAT4_ORDER.forEach((cat, ci) => {
    const C = CATEGORIES4[cat], list = INTERVENTIONS4.filter((i) => i.cat === cat);
    const blk = document.createElement("div"); blk.className = "gblock s4block" + (ci === CAT4_ORDER.length - 1 ? " gblock--last" : ""); blk.dataset.cat = cat;
    const hold = document.createElement("div"); hold.className = "gblock__hold";
    const card = document.createElement("div"); card.className = "gcard gtabcard s4card"; card.dataset.cat = cat;
    card.innerHTML = `<p class="s4card__cat">${C.name}</p>
      <div class="s4tabs" role="tablist" aria-label="${C.name}">${list.map((iv) => `<button class="s4tab" type="button" role="tab" data-num="${iv.num}" title="${iv.num}. ${iv.title}" aria-label="${iv.num}. ${iv.title}">${icon(iv.icon)}</button>`).join("")}</div>
      ${list.map((iv) => `<div class="s4panel" role="tabpanel" data-num="${iv.num}"><p class="s4panel__num">${iv.num}</p><h3 class="s4panel__title">${iv.title}</h3><div class="s4panel__body">${iv.body}</div></div>`).join("")}`;
    hold.appendChild(card); blk.appendChild(hold);
    list.forEach((iv) => { const b = document.createElement("div"); b.className = "gbeat s4beat"; b.dataset.num = iv.num; blk.appendChild(b); beats.push({ b, iv, card }); });
    card.querySelectorAll(".s4tab").forEach((t) => t.addEventListener("click", () => { const b = blk.querySelector(`.s4beat[data-num="${t.dataset.num}"]`);
      if (b) window.scrollTo({ top: b.getBoundingClientRect().top + scrollY - innerHeight * 0.45, behavior: "smooth" }); }));
    steps.appendChild(blk);
  });
  const open = (card, num) => { card.querySelectorAll(".s4tab").forEach((t) => t.classList.toggle("is-on", +t.dataset.num === num));
    card.querySelectorAll(".s4panel").forEach((p) => p.classList.toggle("is-on", +p.dataset.num === num)); };
  beats.forEach(({ b, iv, card }) => ScrollTrigger.create({ trigger: b, start: "top 55%", end: "bottom 55%", onToggle: (s) => { if (s.isActive) { activeCard = card; open(card, iv.num); show(iv); } } }));
  ScrollTrigger.create({ trigger: sec.querySelector(".s4intro"), start: "top 55%", end: "bottom 55%", onToggle: (s) => { if (s.isActive) show(null); } });
  ScrollTrigger.create({ trigger: sec, start: "top bottom", end: "bottom top", onLeaveBack: () => show(null) });

  // ---------- the matrix ----------
  (function matrix() {
    const grid = document.getElementById("matrix4-grid"); if (!grid) return;
    const costs = ["low", "medium", "high"], times = ["fast", "medium", "slow"];
    const costL = { low: "Low cost", medium: "Medium cost", high: "High cost" }, timeL = { fast: "Fast", medium: "Medium", slow: "Slow" };
    grid.appendChild(document.createElement("div"));
    costs.forEach((c) => { const d = document.createElement("div"); d.className = "mx-axis mx-axis--col"; d.textContent = costL[c]; grid.appendChild(d); });
    const tiles = [];
    times.forEach((t) => { const a = document.createElement("div"); a.className = "mx-axis"; a.textContent = timeL[t]; grid.appendChild(a);
      costs.forEach((c) => { const cell = document.createElement("div"); cell.className = "mx-cell"; grid.appendChild(cell);
        (MATRIX4.cells[t + "-" + c] || []).forEach((n) => { const iv = INTERVENTIONS4.find((i) => i.num === n);
          const tile = document.createElement("div"); tile.className = "mx-tile"; tile.title = iv.title;
          tile.innerHTML = `<div class="sign-wrap"></div><span><b>${n}</b> ${MATRIX4.short[n]}</span>`;
          tile.querySelector(".sign-wrap").appendChild(SVG.signSVG(SIGNCAT4[iv.cat], iv.icon)); cell.appendChild(tile); tiles.push(tile); }); }); });
    const mtl = gsap.timeline({ paused: true });
    mtl.from(tiles, { opacity: 0, y: 24, duration: 0.5, stagger: 0.04, ease: "power2.out" }, 0); mtl.to({}, { duration: 0.01 }, 1.4);
    ScrollTrigger.create({ trigger: "#matrix", start: "top top", end: "bottom bottom", scrub: 0.5, animation: mtl });
  })();
})();
