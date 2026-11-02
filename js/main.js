/* Wiring: scroll triggers, generated content, hero illustration */
(function () {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const CAT_ORDER = ["optimize", "reinforce", "expand"];

  /* ---------- top progress bar ---------- */
  gsap.to(".topbar__progress span", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.2 } });

  /* ---------- nav: mark the act being read ---------- */
  { const links = [...document.querySelectorAll(".topbar__nav a")];
    links.forEach((a, i) => { const sec = document.querySelector(a.getAttribute("href")); if (!sec) return;
      const next = links[i + 1] && document.querySelector(links[i + 1].getAttribute("href"));
      ScrollTrigger.create({ trigger: sec, start: "top 50%", endTrigger: next || "main", end: next ? "top 50%" : "bottom bottom",
        onToggle: (self) => a.classList.toggle("is-on", self.isActive) }); }); }

  /* ---------- hero: one landscape, three networks (rail, road, grid) ---------- */
  (function hero() {
    const svg = document.getElementById("scene-hero");
    if (svg.dataset.own) return;   // a page that draws its own hero (index.html: js/v6.js) skips the old illustration
    SCENES.hero(svg);
    HAND.install(svg, { ink: "#192238" });
  })();

  /* ---------- ladder signs ---------- */
  const isoSign = window.ISOGRID ? ISOGRID.signSVG : SVG.signSVG;   // signs in perspective, like those in the town (any [data-sign])
  document.querySelectorAll("[data-sign]").forEach((n) => n.appendChild(isoSign(n.dataset.sign, n.dataset.icon)));
  if (document.querySelector(".ladder")) gsap.from(".ladder__rung", { y: 40, opacity: 0, duration: 0.7, stagger: 0.15, ease: "power2.out",
    scrollTrigger: { trigger: ".ladder", start: "top 80%" } });

  /* ---------- part 1 scenes ---------- */
  const sceneMap = [["#scene-time", "timeline"], ["#scene-journey", "journey"], ["#scene-valley2", "journey"], ["#scene-ga", "journey"], ["#scene-onecity", "onecity"],
    ["#scene-remade", "remade"], ["#scene-power", "tilesA"], ["#scene-world", "worldA"], ["#scene-power2", "tilesB"]];
  // Act 3's board of country tiles (js/iso-tiles.js) is shown twice, either side of the modern-grid city: tilesA for
  // Electrotech, tilesB for Two paths. A scene can be limited to part of its timeline with RANGE (none are now).
  const RANGE = {};
  // index2/index3: an svg can name another scene (data-scene) and re-time it to its own cards with data-remap,
  // "page:src page:src ...": a piecewise-linear map from this section's scroll time to the scene's own timeline
  const remap = (src, spec) => { const keys = spec.trim().split(/\s+/).map((k) => k.split(":").map(Number));
    const out = gsap.timeline({ paused: true }); src.time(keys[0][1]);
    for (let i = 1; i < keys.length; i++) { const [p0, s0] = keys[i - 1], [p1, s1] = keys[i];
      out.add(src.tweenFromTo(s0, s1, { duration: Math.max(0.001, p1 - p0), ease: "none", immediateRender: false }), p0); }
    return out; };
  sceneMap.forEach(([sel, fn0]) => {
    const svg = document.querySelector(sel);
    if (!svg) return;
    const fn = svg.dataset.scene || fn0;
    let tl = SCENES[fn](svg);
    if (svg.dataset.remap) tl = remap(tl, svg.dataset.remap);
    HAND.install(svg, { ink: fn === "rail" ? "#6D5A56" : "#192238" });
    const section = svg.closest("section");
    const cover = section.querySelector(".era__cover");   // section break: the scene appears on the second step
    if (cover) { const shift = section.dataset.coverShift !== "0"; if (shift) tl.shiftChildren(0.5); tl.to(cover, { opacity: 0, duration: 0.4, ease: "none" }, shift ? 0.35 : 0.2); }
    const rg = RANGE[svg.id];
    if (reduce) { if (cover) cover.style.display = "none"; rg ? tl.time(rg[1]) : tl.progress(1); return; }
    let anim = tl;
    if (rg) { tl.time(rg[0]); anim = tl.tweenFromTo(rg[0], rg[1], { paused: true, ease: "none" }); }
    ScrollTrigger.create({ trigger: section, start: "top top", end: "bottom bottom", scrub: 0.6, animation: anim });
  });
  // phones: show a square window onto each scene (sitting at the bottom), text cards above it
  const FOCUS = { "scene-time": 800, "scene-journey": 1000, "scene-valley2": 1000, "scene-ga": 1000, "scene-onecity": 1010, "scene-remade": 990, "scene-power": 900, "scene-world": 900, "scene-power2": 900 };
  function fitScenes() {
    const narrow = window.innerWidth < 700;
    Object.keys(FOCUS).forEach((id) => {
      const svg = document.getElementById(id);
      if (!svg) return;
      if (narrow) { svg.setAttribute("viewBox", `${FOCUS[id] - 450} 0 900 900`); svg.setAttribute("preserveAspectRatio", "xMidYMax meet"); }
      else { svg.setAttribute("viewBox", "0 0 1600 900"); svg.setAttribute("preserveAspectRatio", "xMidYMid slice"); }
    });
  }
  fitScenes(); window.addEventListener("resize", fitScenes);

  // a card held over several steps (.step--hold, index2/index3): its terms (.hl) light up one per step as the scene shows each
  document.querySelectorAll(".step--hold").forEach((st) => {
    const hl = [...st.querySelectorAll(".hl")], n = +st.dataset.span || 1;
    if (!hl.length) return;
    const set = (i) => hl.forEach((h, k) => { h.classList.toggle("is-on", k === i); h.classList.toggle("is-past", k < i); });
    set(0);
    ScrollTrigger.create({ trigger: st, start: "top 50%", end: () => "+=" + n * window.innerHeight,
      onUpdate: (self) => set(Math.min(n - 1, Math.max(0, Math.floor(self.progress * n)))) });
  });

  // headline cards rise in
  gsap.utils.toArray(".headline").forEach((h) => {
    gsap.from(h.children, { y: 30, opacity: 0, duration: 0.8, stagger: 0.12, ease: "power2.out",
      scrollTrigger: { trigger: h, start: "top 85%", toggleActions: "play none none reverse" } });
  });

  /* ---------- part 2: a card per category, its technologies as tabs whose markers are their signs ----------
     Each category is a block: its card stays in view (sticky) while the scroll "beats" behind it pass, one for the category
     and one per technology. As each beat passes the middle of the screen its tab is selected and the map follows; clicking
     a sign scrolls to its beat. The beats carry data-iv, so the signs on the map still link here. */
  const stepsEl = document.getElementById("grid-steps");
  if (stepsEl) {   // (index4 has its own interventions story, js/story4.js)
  const stepDefs = []; // {node, k, cur, card, id}
  let ivIndex = -1;
  // one paragraph per technology (js/data.js, BLURBS), its impact in bold; without one, the action and the impact
  const blurb = (iv) => (window.BLURBS && BLURBS[iv.id] ? BLURBS[iv.id] : `${iv.action} **${iv.impact}.**`).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  const shield = (c, i) => SVG.signSVG(c, i);   // the cards' signs: flat, facing forward
  const go = (b) => { if (b) window.scrollTo({ top: b.getBoundingClientRect().top + scrollY - innerHeight * 0.45, behavior: "smooth" }); };
  CAT_ORDER.forEach((cat, ci) => {
    const C = CATEGORIES[cat], items = INTERVENTIONS.filter((i) => i.cat === cat);
    const blk = document.createElement("div"); blk.className = "gblock" + (ci === 0 ? " gblock--first" : "") + (ci === CAT_ORDER.length - 1 ? " gblock--last" : ""); blk.dataset.cat = cat;
    const hold = document.createElement("div"); hold.className = "gblock__hold";
    const card = document.createElement("div"); card.className = "gcard gtabcard gcatcard"; card.dataset.cat = cat;
    card.innerHTML = `<h3 class="gcat__title">${C.name}</h3><p class="gcat__tag">${C.tagline}</p>
        <div class="gtabs" role="tablist" aria-label="${C.name}" style="--n:${items.length}">${items.map((iv) => `<button class="gtab" type="button" role="tab" aria-selected="false" data-item="${iv.id}" title="${iv.title}"><span class="gtab__sign"></span></button>`).join("")}</div>
        <p class="gcat__lead">${C.lead}</p>
        ${items.map((iv, n) => `<div class="gpanel" role="tabpanel" data-panel="${iv.id}"><p class="gpanel__num">${n + 1} of ${items.length}</p><h4 class="gpanel__title">${iv.title}</h4><p class="gacc__text">${blurb(iv)}</p></div>`).join("")}`;
    items.forEach((iv) => card.querySelector(`.gtab[data-item="${iv.id}"] .gtab__sign`).appendChild(shield(cat, iv.icon)));
    hold.appendChild(card); blk.appendChild(hold);
    const beat = (k, cur, id) => { const b = document.createElement("div"); b.className = "gstep gbeat" + (id ? "" : " gbeat--intro"); if (id) b.dataset.iv = id; blk.appendChild(b); stepDefs.push({ node: b, k, cur, card, id }); };
    beat(ivIndex, -1, null);
    items.forEach((iv) => { ivIndex = INTERVENTIONS.indexOf(iv); beat(ivIndex, ivIndex, iv.id); });
    card.querySelectorAll(".gtab").forEach((t) => t.addEventListener("click", () => go(blk.querySelector(`[data-iv="${t.dataset.item}"]`))));
    stepsEl.appendChild(blk);
  });
  // in a category's card: one technology's tab and text, or (id null) the category's introduction
  const openItem = (card, id) => {
    if (!card) return;
    card.classList.toggle("has-item", !!id);
    card.querySelectorAll(".gtab").forEach((t) => { const sel = t.dataset.item === id; t.classList.toggle("is-on", sel); t.setAttribute("aria-selected", sel); });
    card.querySelectorAll(".gpanel").forEach((p) => p.classList.toggle("is-on", p.dataset.panel === id));
  };

  GRIDMAP.build(document.getElementById("gridmap"));
  { const gm = document.getElementById("gridmap"); HAND.install(gm, { ink: "#192238", inkWidth: 0.8, wobble: 0.35 });   // small objects: a fine pen line and only a whisper of hand-cut edge, so shapes stay crisp
    gm.querySelectorAll("[stroke-opacity='0.55']").forEach((n) => n.setAttribute("vector-effect", "non-scaling-stroke")); }   // same ink finish as the story scenes; outlines stay fine when the camera zooms
  GRIDMAP.apply(-1, -1);

  /* ---------- the modern grid: the same city, stepped from the old one-way grid to the modern grid, a state per card ---------- */
  { const mg = document.getElementById("scene-modern");
    if (mg && window.GRIDMODERN) {
      GRIDMODERN.build(mg);
      HAND.install(mg, { ink: "#192238", inkWidth: 0.8, wobble: 0.35 });
      GRIDMODERN.step("intro", 0);
      document.querySelectorAll("#modern .step").forEach((st) => ScrollTrigger.create({ trigger: st, start: "top 55%", end: "bottom 55%",
        onToggle: (self) => { if (self.isActive) GRIDMODERN.step(st.dataset.m || "intro"); } }));
    } }
  stepDefs.forEach((d, i) => {
    ScrollTrigger.create({
      trigger: d.node, start: "top 55%", end: "bottom 55%",
      onToggle: (self) => { if (self.isActive) { GRIDMAP.apply(d.k, d.cur); openItem(d.card, d.id); } }
    });
  });
  // leaving the section upward resets the map
  // K and L share the picture: in K the whole city sits offset to the right (like the town in A), without legend or tally;
  // entering L the camera moves into the first view; going back up to K it returns
  const klStage = document.querySelector(".kl__stage");
  GRIDMAP.kview && GRIDMAP.kview(0);
  ScrollTrigger.create({ trigger: ".kl .grid-story", start: "top 55%",
    onEnter: () => klStage && klStage.classList.remove("is-k"),
    onLeaveBack: () => { GRIDMAP.apply(-1, -1); GRIDMAP.kview && GRIDMAP.kview(); klStage && klStage.classList.add("is-k"); } });

  }

  /* ---------- matrix ---------- */
  (function matrix() {
    const grid = document.getElementById("matrix-grid");
    if (!grid) return;
    const costs = ["low", "medium", "high"], times = ["fast", "medium", "slow"];
    const costL = { low: "Low cost", medium: "Medium cost", high: "High cost" };
    const timeL = { fast: "Fast", medium: "Medium time", slow: "Slow" };
    grid.appendChild(document.createElement("div"));
    times.forEach((t) => { const d = document.createElement("div"); d.className = "mx-axis mx-axis--col"; d.textContent = timeL[t]; grid.appendChild(d); });
    const cells = {};
    costs.forEach((c) => {
      const a = document.createElement("div"); a.className = "mx-axis"; a.textContent = costL[c]; grid.appendChild(a);
      times.forEach((t) => {
        const cell = document.createElement("div");
        cell.className = "mx-cell" + (costs.indexOf(c) === times.indexOf(t) ? " diag" : "");
        grid.appendChild(cell); cells[c + "-" + t] = cell;
      });
    });
    const SHORT = { dlr: "Dynamic line ratings", gets: "Grid-enhancing tech", predictive: "Predictive maintenance", forecast: "Forecasting",
      dispatch: "Real-time dispatch", vpp: "Demand response & VPPs", battery: "Battery storage", flexplant: "Flexible old plants",
      conductors: "Advanced conductors", twins: "Digital twins", cyber: "Cybersecurity", meters: "Smart meters", condensers: "Sync. condensers & SVCs",
      fault: "Auto fault restoration", adms: "Distribution management", island: "Intentional islanding", gfm: "Grid-forming inverters",
      supercon: "Superconducting cable", hvdcbreaker: "HVDC breakers", substations: "New substations", lines: "New lines & corridors",
      hvdc: "HVDC transmission", interconnect: "New interconnectors" };
    const tiles = [];
    CAT_ORDER.forEach((cat) => INTERVENTIONS.filter((i) => i.cat === cat).forEach((iv) => {
      const tile = document.createElement("div");
      tile.className = "mx-tile" + (iv.sourced ? "" : " is-est");
      tile.title = iv.tech;
      tile.innerHTML = `<div class="sign-wrap"></div><span>${SHORT[iv.id] || iv.tech}</span>`;
      tile.querySelector(".sign-wrap").appendChild(SVG.signSVG(iv.cat, iv.icon));
      cells[iv.cost + "-" + iv.time].appendChild(tile);
      tile.dataset.id = iv.id;
      tiles.push(tile);
    }));
    const diag = grid.querySelectorAll(".mx-cell.diag");
    const callouts = tiles.filter((t) => t.dataset.id === "battery" || t.dataset.id === "vpp");
    const others = tiles.filter((t) => !callouts.includes(t));
    const tl = gsap.timeline({ paused: true });
    tl.from(tiles, { opacity: 0, y: () => gsap.utils.random(-200, 200), x: () => gsap.utils.random(-300, 300), rotation: () => gsap.utils.random(-30, 30), scale: 0.4,
      duration: 0.6, stagger: 0.02, ease: "power3.out" }, 0);
    tl.to(diag, { backgroundColor: "#D3EADF", duration: 0.3 }, 0.8);
    tl.to(others, { opacity: 0.35, duration: 0.3 }, 1.6);
    tl.add(() => callouts.forEach((c) => c.classList.toggle("is-callout", tl.progress() > 0.8)), 1.6);
    tl.fromTo(callouts, { scale: 1 }, { scale: 1.08, duration: 0.15, yoyo: true, repeat: 1 }, 1.65);
    tl.to({}, { duration: 0.01 }, 2.1);
    if (reduce) { tl.progress(1); return; }
    ScrollTrigger.create({ trigger: "#matrix", start: "top top", end: "bottom bottom", scrub: 0.5, animation: tl,
      onUpdate: (s) => callouts.forEach((c) => c.classList.toggle("is-callout", s.progress > 0.75)) });
  })();

  /* ---------- close ---------- */
  gsap.from(".close__inner > *", { y: 40, opacity: 0, duration: 0.8, stagger: 0.15, ease: "power2.out",
    scrollTrigger: { trigger: ".close", start: "top 60%" } });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
