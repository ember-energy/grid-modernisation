/* Sections K and L, in the isometric style: the modern town of section A, with its electricity shown as glass tubes.
   The tubes carry the flows of the legend (clean electricity, from storage, high-capacity, flexible). Around the town sit a
   few small tiles: an old power plant and a village from the start; a new renewables zone and a neighbouring country,
   which only appear when Expand builds them.
   L: replaces the flat grid map. Same API as js/gridmap.js (GRIDMAP.build / GRIDMAP.apply), so the 23 steps and their
   cards are unchanged; each intervention stands where it acts in the town (positions and map effects in MAP below).
   K: a preview of the same tile beside the title, cycling Optimize → Reinforce → Expand with the ladder. */
(function () {
  if (!window.CLEAN || !window.ISOSCENES || !window.GRIDMAP) return;
  const { el, signGroup } = SVG;
  const { K, town } = ISOSCENES;
  const { C } = ISO;
  const P = (x, y, z) => ISO.P(x, y, z || 0);
  const F = ISO.frame([0, 0], 1);
  const COL = { clean: "#13CE74", high: "#37A6E6", flex: "#EE7309", storage: "#FFC400", fossil: "#4A546A" };
  const CAT = { optimize: "#0B6638", reinforce: "#203772", expand: "#BF3100" };
  const Z = 0.45, W = 15, WT = 26;   // tube height above the ground, tube width, thickened width (in the town's units)
  let UID = 0;

  // ---------- the tube network, in ground units (gx, gy); power flows from the first point to the last ----------
  const TUBES = [
    { id: "wind", kind: "clean", pts: [[8.9, 8.2], [8.9, 11.0], [11.2, 11.0]] },                       // wind farm substation → the spine
    { id: "main", kind: "high", pts: [[11.2, 11.0], [25.3, 11.0]] },                                  // the spine, along the main road
    { id: "solar", kind: "clean", pts: [[27.6, 10.2], [27.6, 11.0], [25.3, 11.0]] },                   // solar farm and batteries
    { id: "fact", kind: "clean", pts: [[27.6, 11.0], [33.0, 11.0], [33.0, 13.8]] },                    // to the factory's substation
    { id: "feeder", kind: "clean", pts: [[13.25, 11.0], [13.25, 23.2]] },                               // south through town
    { id: "homes", kind: "clean", pts: [[11.2, 11.0], [11.2, 16.4], [9.6, 16.4]] },                     // the homes
    { id: "city", kind: "high", pts: [[13.25, 23.2], [25.3, 23.2], [25.3, 33.6], [26.5, 33.6]] },       // to the data centres
    { id: "street", kind: "clean", pts: [[13.25, 23.2], [11.2, 23.2], [11.2, 27.2], [10.4, 27.2]] },    // the high street
    { id: "nsub", kind: "clean", pts: [[13.25, 20.8], [14.6, 20.8]], hidden: true },                    // Expand: a new substation
    { id: "hvdc", kind: "high", arc: [[1.6, 8.6], [33.6, 27.6], 12], hidden: true },                     // Expand: a long-distance link, overhead
    { id: "inter", kind: "flex", pts: [[33.0, 15.0], [33.0, 17.8], [38.8, 17.8]], hidden: true }        // Expand: across the border, off the edge
  ];

  // ---------- where each intervention stands, what it lights up (rings: [gx, gy, radius]) and what it does to the tubes ----------
  const CTRL = [21.3, 14.9], WS = [8.4, 8.6], HOMES = [5.2, 17.4], SOLAR = [29.4, 5.0];
  const MAP = {
    dlr: { s: [17.6, 11.3, "L"], flow: ["main"], at: [18.0, 11.0], zoom: 813, boost: "main" },
    gets: { s: [11.3, 19.0, "R"], flow: ["feeder"], at: [13.25, 17.6], zoom: 813, boost: "feeder" },
    predictive: { s: [10.2, 11.3, "L"], flow: ["wind"], at: WS, zoom: 736, lit: [[WS[0], WS[1], 2.4]] },
    forecast: { s: [23.0, 11.3, "L"], flow: ["wind", "solar"], at: [17.4, 4.6], zoom: 1317, lit: [[5.6, 3.0, 5.0], [SOLAR[0], 3.6, 4.6]] },
    dispatch: { s: [19.4, 13.3, "L"], at: CTRL, zoom: 736, lit: [[CTRL[0], CTRL[1], 2.0]] },
    vpp: { s: [1.8, 13.3, "L"], flow: ["homes"], at: HOMES, zoom: 813, lit: [[HOMES[0], HOMES[1], 5.4]], flex: "homes" },
    battery: { s: [26.6, 11.3, "L"], flow: ["solar", "main"], at: [27.6, 9.2], zoom: 736, lit: [[27.6, 9.2, 2.6]], storage: true },
    flexplant: { s: [-5.2, 9.8, "L"], flow: ["old"], at: [-7.6, 6.4], zoom: 852, lit: [[-7.6, 6.4, 3.8]], flex: "old" },
    conductors: { s: [14.8, 11.3, "L"], flow: ["main"], at: [20.4, 11.0], zoom: 813, thicken: "main", boost: "main" },
    twins: { s: [21.2, 13.3, "L"], at: CTRL, zoom: 736, lit: [[CTRL[0], CTRL[1], 2.0]] },
    cyber: { s: [23.0, 13.3, "L"], at: CTRL, zoom: 736, lit: [[CTRL[0], CTRL[1], 2.0]] },
    meters: { s: [4.6, 13.3, "L"], flow: ["homes"], at: HOMES, zoom: 775, lit: [[HOMES[0], HOMES[1], 5.4]] },
    condensers: { s: [6.6, 11.3, "L"], flow: ["wind"], at: WS, zoom: 736, lit: [[WS[0], WS[1], 2.4]] },
    fault: { s: [23.3, 32.0, "R"], flow: ["city"], at: [26.6, 33.4], zoom: 775, lit: [[26.6, 33.6, 2.2]] },
    adms: { s: [7.4, 13.3, "L"], flow: ["homes", "street", "feeder"], at: [11.2, 20.2], zoom: 968, lit: [[HOMES[0], HOMES[1], 5.4], [5.6, 28.6, 5.2]] },
    island: { s: [28.2, 42.4, "R"], flow: ["village"], at: [24.0, 42.6], zoom: 891, lit: [[24.0, 42.6, 4.4]], island: true },
    gfm: { s: [30.0, 11.3, "L"], flow: ["solar"], at: [27.6, 6.4], zoom: 852, lit: [[SOLAR[0], 3.6, 4.6], [27.6, 9.2, 2.6]] },
    supercon: { s: [19.0, 23.0, "L"], flow: ["city"], at: [19.2, 23.2], zoom: 852, thicken: "city", boost: "city" },
    hvdcbreaker: { s: [3.2, 11.3, "L"], flow: ["wind", "main"], at: [4.6, 9.6], zoom: 852, lit: [[5.6, 3.0, 5.0]] },
    substations: { s: [17.8, 21.0, "L"], flow: ["nsub"], at: [15.8, 20.8], zoom: 736, build: ["nsub"] },
    lines: { s: [12.6, -4.0, "L"], flow: ["zone"], at: [8.4, -7.2], zoom: 1162, build: ["zone"] },
    hvdc: { s: [6.0, -3.9, "L"], flow: ["hvdc"], at: [17.7, 11.5], zoom: 1500, build: ["hvdc"] },
    interconnect: { s: [41.0, 28.8, "L"], flow: ["inter"], at: [43.2, 25.0], zoom: 1162, build: ["nb", "inter"] }
  };

  // ---------- small tiles around the town ----------
  function slab(g, x0, y0, x1, y1, top) {
    const T = 0.8;
    K.quad(g, [[x0, y1, 0], [x1, y1, 0], [x1, y1, -T], [x0, y1, -T]], "#C9CED6");
    K.quad(g, [[x1, y0, 0], [x1, y1, 0], [x1, y1, -T], [x1, y0, -T]], "#AEB5C0");
    K.rect(g, x0, y0, x1, y1, top || "#DCEBD3", 1.3);
  }
  const SAT = {
    old(g) {   // an existing gas power plant, with its own substation
      slab(g, -11.2, 2.8, -3.8, 10.4, "#E3E6EB");
      ISO.draw("fossil", g, [-7.8, 6.0], 0.95);
      K.xfmr(g, -4.9, 8.6);
      [[-10.6, 9.8], [-9.0, 9.9, 0.9, "dark"]].forEach(([x, y, s, k]) => K.tree(g, x, y, s || 0.9, k));
    },
    zone(g) {   // a new renewables zone: wind and solar
      slab(g, 3.6, -11.4, 13.4, -3.4);
      [[5.0, -10.2], [8.2, -10.8], [11.6, -10.0]].forEach(([x, y]) => ISO.turbine(g, F, x, y, 4.6));
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) ISO.panel(g, F, 4.4 + c * 2.4, -7.6 + r * 1.3, 1.9, 0.9);
      K.xfmr(g, 11.6, -5.0);
      K.tree(g, 12.8, -4.0, 0.9, "pine");
    },
    nb(g) {   // a neighbouring country: its own town and wind
      slab(g, 39.8, 20.6, 47.4, 29.4, "#E4EDD5");
      ISO.draw("neighbour", g, [43.4, 24.2], 1.0);
      [[46.2, 21.6], [46.4, 27.8]].forEach(([x, y]) => ISO.turbine(g, F, x, y, 4.0));
      K.xfmr(g, 40.6, 25.6);
    },
    village(g) {   // a village at the end of the line, with its own solar and battery (a microgrid when islanded)
      slab(g, 19.8, 39.6, 28.6, 46.2);
      [[20.6, 42.6, "#B07466"], [23.0, 43.4, "#A3695D"], [25.4, 42.6, "#B9806F"]].forEach(([x, y, r]) => {
        ISO.house(g, F, x, y, 2.0, 1.5, 1.0, 0.75, r);
        K.pvQuad(g, [x + 0.25, y + 1.56, 1.06], [x + 1.75, y + 1.56, 1.06], [x + 1.75, y + 0.95, 1.52], [x + 0.25, y + 0.95, 1.52], 4, 3);
      });
      for (let c = 0; c < 3; c++) ISO.panel(g, F, 20.6 + c * 2.2, 40.0, 1.8, 0.85);
      K.batt(g, 26.6, 40.2, 1.6);
      [[27.8, 45.4], [21.0, 45.6, 0.9, "dark"], [24.6, 45.8, 0.9, "pine"]].forEach(([x, y, s, k]) => K.tree(g, x, y, s || 0.9, k));
    },
    nsub(g) {   // a new substation in town
      F.box(g, 14.6, 20.1, 0, 2.4, 1.5, 0.08, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" });
      K.xfmr(g, 15.0, 20.4); K.xfmr(g, 16.2, 20.4);
    }
  };

  // ======================= SECTION L ONLY: a larger 4 × 4 city, laid out the way the power flows =======================
  // Back row: generation (wind, an existing gas plant, solar with batteries, farmland that becomes a new renewables zone).
  // Second row: the grid's core (homes, the main substation with the grid control centre, downtown, industry).
  // Third row: demand (homes, the high street, a data-centre campus, flats). Front row: the edge (a village, a park,
  // farmland, and across a border the neighbouring country). Blocks are 10.5 wide, roads 1.5, so the land is 46.5 across.
  const B4 = 10.5, PIT = 12, N4 = 46.5, RD = [0, 1, 2].map((k) => [B4 + PIT * k, PIT * (k + 1)]);
  const VB = (k) => RD[k][0] - 0.25, VF = (k) => RD[k][1] + 0.25;   // the back and front pavements of road k
  // Back row: wind, the existing gas plant, solar with batteries, and downtown's towers in the right-hand corner (where
  // they stand in front of nothing). Then homes, the control centre and main substation, data centres, the high street;
  // industry, an EV charging hub with a park, homes run as a virtual power plant, flats; and at the front, farmland that
  // becomes a new renewables zone, the village at the end of the line, a farm, and the converter station at the border.
  // Every pipe plugs into something at both ends (a transformer, a substation, a building, or a junction box on another
  // pipe), so no end is left in the open; branches leave from junction boxes rather than running along each other.
  const JBOX = [[20.4, 10.1, 1.7, 0.8], [26.0, VB(1), 1.1, 0.6], [37.2, VF(0), 1.1, 0.6], [10.25, 25.6, 0.6, 1.1], [12.4, VF(2), 0.8, 0.6], [10.25, VB(2), 0.6, 1.1], [14.6, 19.8, 1.0, 1.0]];   // junction boxes: [x, y, w, d]
  // the footprints the pipes plug into (transformers, junction boxes, the converter hall): a pipe's end sits inside one,
  // and a flange is drawn where the pipe meets its face
  const FOOT = [[7.0, 8.0], [8.4, 8.0], [20.4, 8.0], [32.6, 8.0], [17.6, 15.2], [19.2, 15.2], [17.6, 17.2], [19.2, 17.2], [18.4, 19.0], [25.2, 15.8], [26.6, 15.8],
    [7.2, 25.1], [8.6, 25.1], [40.6, 32.6], [7.9, 37.6], [43.0, 41.6]].map(([x, y]) => [x, y, x + 1.0, y + 0.9])
    .concat(JBOX.map(([x, y, w, d]) => [x - w / 2, y - d / 2, x + w / 2, y + d / 2]), [[39.2, 39.0, 42.8, 41.2]]);
  const inFoot = (q) => FOOT.find((r) => q[0] >= r[0] && q[0] <= r[2] && q[1] >= r[1] && q[1] <= r[3]);
  // how far (in ground units) from an end of a pipe it leaves the footprint it plugs into, or null
  const exitAt = (pts) => { const r = inFoot(pts[0]); if (!r) return null; let acc = 0;
    for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]);
      for (let t = 0; t <= l; t += 0.02) { const q = [a[0] + ((b[0] - a[0]) * t) / l, a[1] + ((b[1] - a[1]) * t) / l]; if (!(q[0] >= r[0] && q[0] <= r[2] && q[1] >= r[1] && q[1] <= r[3])) return acc + t; } acc += l; } return null; };
  const TUBES_L = [
    { id: "wind", kind: "clean", pts: [[8.9, 8.45], [8.9, VB(0)], [20.2, VB(0)]] },                    // wind farm transformer → the junction by the gas plant
    { id: "solar", kind: "clean", pts: [[33.1, 8.45], [33.1, VB(0)], [20.6, VB(0)]] },                 // solar farm transformer → the same junction
    { id: "old", kind: "flex", pts: [[20.9, 8.45], [20.9, 10.0]] },                                    // the gas plant's transformer → the junction
    { id: "trunk", kind: "high", pts: [[19.9, 10.2], [19.9, 15.65]] },                                 // the junction → the main substation
    { id: "city", kind: "high", pts: [[19.7, 15.65], [21.8, 15.65], [21.8, VF(0)], [38.6, VF(0)], [38.6, 6.0]] },   // under the main road into downtown's tower
    { id: "street", kind: "clean", pts: [[37.2, VF(0)], [37.2, 14.3]] },                               // a branch into the high street's first shop
    { id: "homesA", kind: "clean", pts: [[18.1, 15.65], [7.0, 15.65], [7.0, 14.4]] },                 // the substation → a home
    { id: "ind", kind: "clean", pts: [[18.1, 17.65], [18.1, 19.8], [VB(0), 19.8], [VB(0), 25.6], [9.1, 25.6]] },    // the substation → industry's transformer
    { id: "village", kind: "clean", pts: [[VB(0), 25.6], [VB(0), VF(2)], [12.4, VF(2)], [12.4, 41.4], [13.6, 41.4]] },   // on from the corner box to a village home
    { id: "farm", kind: "clean", pts: [[12.4, VF(2)], [27.4, VF(2)], [27.4, 39.7]] },                  // a branch into the barn
    { id: "hub", kind: "clean", pts: [[18.9, 19.45], [18.9, 26.4]] },                                  // the substation → the charging hub
    { id: "homesB", kind: "clean", pts: [[18.9, 19.45], [20.9, 19.45], [20.9, VB(1)], [26.0, VB(1)], [26.0, 26.0]] },   // the substation → the homes of the VPP
    { id: "flats", kind: "clean", pts: [[26.0, VB(1)], [40.9, VB(1)], [40.9, 33.0]] },                 // a branch on to the flats' transformer
    { id: "fork", kind: "clean", pts: [[14.6, 19.8], [14.6, 21.0], [12.25, 21.0], [12.25, 25.6], [10.6, 25.6]], hidden: true },   // Optimize: a second path that leaves one box and rejoins at the next
    { id: "nsub", kind: "clean", pts: [[19.7, 17.65], [23.4, 17.65], [23.4, 16.25], [25.7, 16.25]], hidden: true },    // Expand: an on-ramp for the data centres
    { id: "zone", kind: "clean", pts: [[8.4, 38.0], [8.4, VB(2)], [VB(0), VB(2)]], hidden: true },     // Expand: the new zone's transformer → a box on the village line
    { id: "hvdc", kind: "high", arc: [[8.4, 38.0], [38.6, 5.9], 20], hidden: true },                   // Expand: from the new zone, overhead, to downtown
    { id: "inter", kind: "flex", pts: [[49.6, 40.4], [41.6, 40.4]], hidden: true, open0: true },                    // Expand: across the border into the converter station
    { id: "inter2", kind: "flex", pts: [[40.9, 40.0], [40.9, 33.4]], hidden: true }                    // and from the converter to the flats' transformer
  ];
  const MAP_L = {
    dlr: { s: [7.0, 12.3, "L"], flow: ["wind", "solar", "trunk"], at: [13.0, 9.6], zoom: 1050, boost: ["wind", "solar"] },
    gets: { s: [16.0, 22.3, "L"], flow: ["ind", "fork"], at: [12.4, 22.0], zoom: 1000, boost: ["ind", "fork"], build: ["fork"], lit: ["ctl-gets"] },
    predictive: { s: [22.3, 18.2, "R"], flow: ["trunk"], at: [19.0, 17.0], zoom: 850, lit: ["s1"] },
    forecast: { s: [22.3, 5.0, "R"], flow: ["wind", "solar"], at: [18.0, 4.6], zoom: 1700, lit: ["wind", "solar"] },
    dispatch: { s: [13.2, 12.3, "L"], at: [14.8, 14.0], zoom: 800, lit: ["cc"] },
    vpp: { s: [24.3, 27.0, "R"], flow: ["homesB"], flex: "homesB", at: [28.6, 28.4], zoom: 950, lit: ["homesB"] },
    battery: { s: [24.3, 8.4, "R"], flow: ["solar"], storage: true, at: [27.8, 8.2], zoom: 850, lit: ["batt"] },
    flexplant: { s: [12.3, 5.0, "R"], flow: ["old"], flex: "old", at: [17.2, 5.0], zoom: 1000, lit: ["gas"] },
    conductors: { s: [3.4, 12.3, "L"], flow: ["wind", "solar", "trunk"], at: [11.0, 9.6], zoom: 1050, thicken: ["wind", "solar", "trunk"], boost: ["wind", "solar"] },
    twins: { s: [14.8, 12.3, "L"], at: [14.8, 14.0], zoom: 800, lit: ["cc"] },
    cyber: { s: [16.4, 12.3, "L"], at: [14.8, 14.0], zoom: 800, lit: ["cc"] },
    meters: { s: [24.3, 30.4, "R"], flow: ["homesA", "homesB", "flats"], at: [24.0, 24.0], zoom: 1600, lit: ["homesA", "homesB", "flats"] },
    condensers: { s: [12.3, 17.4, "R"], flow: ["trunk"], at: [15.0, 17.6], zoom: 800, lit: ["condenser"] },
    fault: { s: [36.3, 17.6, "R"], flow: ["street"], at: [40.6, 15.0], zoom: 950, lit: ["shops"] },
    adms: { s: [14.2, 22.3, "L"], flow: ["homesA", "homesB", "flats", "hub"], at: [22.0, 24.0], zoom: 1600, lit: ["homesA", "homesB", "flats", "hub"] },
    island: { s: [12.3, 40.0, "R"], island: true, flow: [], at: [16.4, 41.0], zoom: 950, lit: ["village"] },
    gfm: { s: [24.3, 5.0, "R"], flow: ["solar"], at: [28.0, 5.6], zoom: 1050, lit: ["solar", "batt"] },
    supercon: { s: [36.3, 6.0, "R"], flow: ["city"], at: [38.6, 9.0], zoom: 1050, thicken: ["city"], boost: ["city"], lit: ["downtown"] },
    hvdcbreaker: { s: [10.25, 4.0, "R"], flow: ["wind"], at: [5.2, 4.6], zoom: 1050, lit: ["wind"] },
    substations: { s: [24.3, 19.4, "R"], flow: ["nsub"], at: [27.4, 16.6], zoom: 900, build: ["nsub"], lit: ["nsub", "dc"] },
    lines: { s: [4.0, 36.3, "L"], flow: ["zone"], at: [5.2, 39.6], zoom: 1100, build: ["zone"], lit: ["zone"] },
    hvdc: { s: [7.4, 36.3, "L"], flow: ["hvdc"], at: [23.0, 22.0], zoom: 2800, build: ["hvdc", "zone"], lit: ["zone", "downtown"] },
    interconnect: { s: [44.0, 36.3, "L"], flow: ["inter", "inter2"], at: [42.6, 39.0], zoom: 1050, build: ["inter", "inter2"], lit: ["conv", "flags"] }
  };

  // ---------- the fittings on the pipes, as in the infographic: each technology adds what it needs ----------
  // [type, tube, position along it (0–1)]; sleeves: [tube, from, to] (an "express lane" around a stretch of pipe)
  const FIT = {
    dlr: [["antenna", "wind", 0.62], ["antenna", "solar", 0.55]],
    gets: [["box", "fork", 0.08]],
    predictive: [["gauge", "trunk", 0.55]],
    forecast: [["monitor", "wind", 0.12], ["monitor", "solar", 0.1]],
    dispatch: [["lights", "wind", 0.3], ["lights", "solar", 0.3]],
    vpp: [["antenna", "homesB", 0.9]],
    flexplant: [["valve", "old", 0.45]],
    twins: [["monitor", "city", 0.06]],
    meters: [["gauge", "homesA", 0.55], ["gauge", "flats", 0.55]],
    fault: [["valve", "street", 0.5]],
    adms: [["lights", "ind", 0.62], ["lights", "homesB", 0.62]],
    island: [["valve", "village", 0.3]],
    gfm: [["gauge", "solar", 0.82]],
    hvdcbreaker: [["valve", "wind", 0.08]]
  };
  const SLEEVE = { conductors: [["wind", 0.3, 0.97], ["solar", 0.25, 0.97]], supercon: [["city", 0.12, 0.96]], hvdc: [["hvdc", 0.12, 0.88]] };
  // a point and the direction of a pipe, a share of the way along it (in ground units)
  const along = (pts, f) => { const seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1])), tot = seg.reduce((a, b) => a + b, 0); let want = tot * f;
    for (let i = 0; i < seg.length; i++) { if (want <= seg[i] || i === seg.length - 1) { const u = Math.min(1, want / seg[i]), a = pts[i], b = pts[i + 1]; return { x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u, dx: (b[0] - a[0]) / seg[i], dy: (b[1] - a[1]) / seg[i] }; } want -= seg[i]; } };
  const along2 = (pts, f) => { const seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1])), tot = seg.reduce((a, b) => a + b, 0), m = 1.0;
    let want = tot * f, i = 0; for (; i < seg.length - 1 && want > seg[i]; i++) want -= seg[i];
    if (seg[i] < 2 * m + 0.2) { i = seg.indexOf(Math.max(...seg)); want = seg[i] / 2; } else want = Math.max(m, Math.min(seg[i] - m, want));
    const a = pts[i], b = pts[i + 1], u = want / seg[i]; return { x: a[0] + (b[0] - a[0]) * u, y: a[1] + (b[1] - a[1]) * u, dx: (b[0] - a[0]) / seg[i], dy: (b[1] - a[1]) / seg[i] }; };
  const THICKABLE = ["wind", "solar", "trunk", "city"];
  // a gasket: a ring clamped round the pipe, seen at an angle, with the pipe coming out of its front face (as in the
  // infographic). Drawn on screen from a centre c, the pipe's screen direction u and the pipe's width w.
  const GK = { ring: "#6FB3F2", face: "#D6E9F8", line: "#3E8ED9", pipe: "#EEF6FD" };
  let GKN = 0;
  function gasket(parent, col) { const g = el("g", { "data-keepstroke": "" }, parent), sw = { stroke: GK.line, "stroke-width": 1.5, "stroke-linejoin": "round" };
    const G = { g, col, back: el("path", Object.assign({ fill: GK.ring }, sw), g), band: el("path", { fill: GK.ring }, g), sides: el("path", Object.assign({ fill: "none" }, sw), g),
      face: el("path", Object.assign({ fill: GK.face }, sw), g), grad: (() => { const id = "gk" + (++GKN), lg = el("linearGradient", { id, gradientUnits: "userSpaceOnUse" }, g);
        el("stop", { offset: 0, "stop-color": GK.pipe, "stop-opacity": 0.9 }, lg); el("stop", { offset: 1, "stop-color": GK.pipe, "stop-opacity": 0 }, lg); return lg; })(), pipe: null, core: el("path", { fill: "none", stroke: col, "stroke-opacity": 0.4, "stroke-linecap": "butt" }, g),
      edge: el("path", Object.assign({ fill: "none", "stroke-linecap": "round" }, sw), g) };
    G.pipe = el("path", { fill: `url(#${G.grad.id})` }); g.insertBefore(G.pipe, G.edge); G.g.removeChild(G.core); return G; }
  function gasketAt(G, c, gx, gy, w) {
    // true isometric geometry: the pipe runs along the ground direction (gx, gy); its round section stands across it,
    // spanned by the level direction square to it and the vertical, so every ring is an isometric circle
    const gl = Math.hypot(gx, gy) || 1; gx /= gl; gy /= gl; if (gx + gy < 0) { gx = -gx; gy = -gy; }   // the face towards us
    const O = P(0, 0, 0), sv = (x, y, z) => { const q = P(x, y, z); return [q[0] - O[0], q[1] - O[1]]; };
    const U = sv(gx, gy, 0), H = sv(-gy, gx, 0), V = sv(0, 0, 1), ul = Math.hypot(U[0], U[1]), un = [U[0] / ul, U[1] / ul], n = [-un[1], un[0]];
    const A = n[0] * H[0] + n[1] * H[1], B = n[0] * V[0] + n[1] * V[1], half1 = Math.hypot(A, B), ts = Math.atan2(B, A);   // a unit circle's half-width across the pipe on screen
    const a = w / 2, r = a / half1, R = (a + 3.4) / half1, L = 0.03 + (w / half1) * 0.12, f = (v) => v.toFixed(1), M = (q) => f(q[0]) + " " + f(q[1]);
    const pt = (o, rr, t) => [c[0] + U[0] * o + rr * (H[0] * Math.cos(t) + V[0] * Math.sin(t)), c[1] + U[1] * o + rr * (H[1] * Math.cos(t) + V[1] * Math.sin(t))];
    const ell = (o, rr) => { let d = ""; for (let i = 0; i <= 32; i++) d += (i ? "L" : "M") + M(pt(o, rr, (i / 32) * Math.PI * 2)); return d + "Z"; };
    G.back.setAttribute("d", ell(-L, R));
    G.band.setAttribute("d", `M${M(pt(-L, R, ts))} L${M(pt(L, R, ts))} L${M(pt(L, R, ts + Math.PI))} L${M(pt(-L, R, ts + Math.PI))}Z`);
    G.sides.setAttribute("d", `M${M(pt(-L, R, ts))} L${M(pt(L, R, ts))} M${M(pt(-L, R, ts + Math.PI))} L${M(pt(L, R, ts + Math.PI))}`);
    G.face.setAttribute("d", ell(L, R));
    // the pipe coming out of the face: only the far half of the seam shows (the pipe hides the near half)
    const mid = pt(L, r, ts + Math.PI / 2), far = (mid[0] - c[0]) * un[0] + (mid[1] - c[1]) * un[1] < 0 ? 1 : -1;   // which way round is away from us
    let arc = ""; for (let i = 0; i <= 16; i++) arc += " L" + M(pt(L, r, ts + far * Math.PI * (i / 16)));
    const E = 0.32, s1 = pt(L + E, r, ts), s2 = pt(L + E, r, ts + far * Math.PI);
    G.pipe.setAttribute("d", `M${M(s1)}${arc} L${M(s2)}Z`);
    G.edge.setAttribute("d", `M${M(s1)}${arc} L${M(s2)}`);
    const c0 = pt(L, 0, 0), c1 = pt(L + E, 0, 0); ["x1", "y1", "x2", "y2"].forEach((k2, i) => G.grad.setAttribute(k2, f([c0[0], c0[1], c1[0], c1[1]][i])));
  }

  function fitting(g, type, at, gk) {
    const { x, y, dx, dy } = at, p = P(x, y, Z), q = P(x + dx, y + dy, Z), l = Math.hypot(q[0] - p[0], q[1] - p[1]), ux = (q[0] - p[0]) / l, uy = (q[1] - p[1]) / l, nx = -uy, ny = ux;
    // the collar: a blue band round the pipe with a rim at its front
    gk.push(el("g", null, g));
    const top = P(x, y, Z + 0.32), up = (z) => P(x, y, Z + z), pole = (z) => { const a = up(0.3), b = up(z); el("line", { x1: a[0], y1: a[1], x2: b[0], y2: b[1], stroke: "#8A93A6", "stroke-width": 1.8 }, g); return b; };
    if (type === "valve") {   // a red hand-wheel on a stem
      const b = up(0.85); el("line", { x1: top[0], y1: top[1], x2: b[0], y2: b[1], stroke: "#626E88", "stroke-width": 2 }, g);
      el("ellipse", { cx: b[0], cy: b[1], rx: 8, ry: 4.4, fill: "none", stroke: "#D63A3A", "stroke-width": 3 }, g);
      el("path", { d: `M${b[0] - 7} ${b[1]} L${b[0] + 7} ${b[1]} M${b[0]} ${b[1] - 3.8} L${b[0]} ${b[1] + 3.8}`, stroke: "#D63A3A", "stroke-width": 1.8 }, g); el("circle", { cx: b[0], cy: b[1], r: 2, fill: "#8F1E22" }, g);
    } else if (type === "gauge") {   // a pressure gauge on a short post
      const b = pole(1.45); el("circle", { cx: b[0], cy: b[1] - 6, r: 7.5, fill: "#FFFFFF", stroke: "#3E4860", "stroke-width": 1.6 }, g);
      for (let k = 0; k < 7; k++) { const a = Math.PI * (0.8 + (1.4 * k) / 6); el("line", { x1: b[0] + Math.cos(a) * 5, y1: b[1] - 6 + Math.sin(a) * 5, x2: b[0] + Math.cos(a) * 6.4, y2: b[1] - 6 + Math.sin(a) * 6.4, stroke: "#626E88", "stroke-width": 0.9 }, g); }
      const nd = el("line", { x1: b[0], y1: b[1] - 6, x2: b[0] + 4.6, y2: b[1] - 8.4, stroke: "#D63A3A", "stroke-width": 1.4, "stroke-linecap": "round" }, g);
      gsap.to(nd, { rotation: -60, svgOrigin: `${b[0]} ${b[1] - 6}`, duration: 1.8 + Math.random(), repeat: -1, yoyo: true, ease: "sine.inOut" });
    } else if (type === "lights") {   // a pair of signal lights on a post
      const b = pole(1.6); el("rect", { x: b[0] - 10, y: b[1] - 7, width: 20, height: 9, rx: 4.5, fill: "#262C3A" }, g);
      const gl = el("circle", { cx: b[0] - 4.6, cy: b[1] - 2.5, r: 3, fill: "#47B970" }, g), rl = el("circle", { cx: b[0] + 4.6, cy: b[1] - 2.5, r: 3, fill: "#E04B00", opacity: 0.35 }, g);
      gsap.timeline({ repeat: -1 }).to(gl, { opacity: 0.35, duration: 0.2, delay: 2.4 }).to(rl, { opacity: 1, duration: 0.2 }, "<").to(rl, { opacity: 0.35, duration: 0.2, delay: 1.2 }).to(gl, { opacity: 1, duration: 0.2 }, "<");
    } else if (type === "antenna") {   // a sensor on the pipe, sending its readings
      const b = pole(1.0); el("circle", { cx: b[0], cy: b[1], r: 2.4, fill: "#2E6FB3" }, g);
      [5, 9].forEach((r, i) => { const arc = (sx) => `M${b[0] + sx * r * 0.5} ${b[1] - r * 0.87} A${r} ${r} 0 0 ${sx > 0 ? 1 : 0} ${b[0] + sx * r * 0.5} ${b[1] + r * 0.87}`;
        const a = el("path", { d: arc(1) + " " + arc(-1), fill: "none", stroke: "#2E6FB3", "stroke-width": 1.6, "stroke-linecap": "round" }, g);
        gsap.fromTo(a, { opacity: 0.2 }, { opacity: 1, duration: 0.6, delay: i * 0.3, repeat: -1, yoyo: true }); });
    } else if (type === "monitor") {   // a small screen showing the line's readings
      const b = pole(1.5); el("rect", { x: b[0] - 11, y: b[1] - 15, width: 22, height: 15, rx: 2, fill: "#262C3A", stroke: "#626E88", "stroke-width": 1 }, g);
      el("polyline", { points: [[-8, -4], [-4, -8], [0, -6], [4, -11], [8, -9]].map(([u, v]) => `${b[0] + u},${b[1] + v}`).join(" "), fill: "none", stroke: "#5CC4F2", "stroke-width": 1.4 }, g);
    } else if (type === "box") {   // a power-flow controller clamped onto the pipe
      F.box(g, x - 0.35, y - 0.3, Z + 0.15, 0.7, 0.6, 0.55, { left: "#13CE74", right: "#109553", top: "#A3D9A5" });
    }
  }

  function city4(root, defs, o) {
    const R = K.rect, base = el("g", { class: "ig-ground" }, root), T = 0.8, N = N4;
    K.quad(base, [[0, N, 0], [N, N, 0], [N, N, -T], [0, N, -T]], "#C9CED6");
    K.quad(base, [[N, 0, 0], [N, N, 0], [N, N, -T], [N, 0, -T]], "#AEB5C0");
    R(base, 0, 0, N, N, "#DCEBD3", 1.3);
    const blk = (i, j) => [i * PIT, j * PIT, i * PIT + B4, j * PIT + B4];
    const fields = (x0, y0, x1, y1, col, line) => { R(base, x0, y0, x1, y1, col, 0.8); for (let y = y0 + 1.0; y < y1 - 0.2; y += 1.0) K.lineGX(base, y, x0, x1, 0, line, 1); };
    const paved = (i, j, c) => { const [a, b, c2, d] = blk(i, j); R(base, a + 0.3, b + 0.3, c2 - 0.3, d - 0.3, c || "#E3E6EB", 0.8); };
    // ground
    fields(0.4, 0.4, 10.1, 6.4, "#CFE3B8", "#B7D29A"); paved(1, 0); paved(2, 0, "#E8EDE4"); paved(3, 0);
    paved(1, 1); paved(2, 1); { const [a, b, c] = blk(3, 1); R(base, a + 0.2, b + 3.6, c - 0.2, b + 6.0, "#E3DCCF", 0.8); }
    paved(0, 2); { const [a, b, c, d] = blk(1, 2); R(base, a + 0.3, b + 0.3, c - 0.3, b + 4.6, "#E3E6EB", 0.8); R(base, a + 6.4, b + 6.2, a + 9.6, d - 0.8, C.water, 1); R(base, a + 0.4, b + 7.0, a + 6.0, b + 7.6, "#EDE3CF", 0.8); }
    { const [a, b, c, d] = blk(3, 2); R(base, a + 0.4, d - 1.4, c - 0.4, d - 0.8, "#EDE3CF", 0.8); }
    fields(0.4, 36.4, 10.1, 46.1, "#E8E0B8", "#D6CB98"); fields(24.4, 41.6, 34.1, 46.1, "#CFE3B8", "#B7D29A");
    R(base, 38.8, 38.6, 44.6, 43.2, "#E3E6EB", 0.8);   // the converter station's yard
    { let d = ""; for (let y = 36.4; y < N - 0.2; y += 0.9) { const p = P(N - 0.35, y), q = P(N - 0.35, y + 0.45); d += `M${p[0]} ${p[1]} L${q[0]} ${q[1]} `; } el("path", { d, stroke: "#8C6F9E", "stroke-width": 2, fill: "none" }, base); }   // the border, dashed along the edge
    // roads
    RD.forEach(([a, b]) => R(base, 0, a - 0.45, N, b + 0.45, "#E9EBEE"));
    RD.forEach(([a, b]) => R(base, a - 0.45, 0, b + 0.45, N, "#E9EBEE"));
    RD.forEach(([a, b]) => R(base, 0, a, N, b, "#5B6478", 1));
    RD.forEach(([a, b]) => R(base, a, 0, b, N, "#5B6478", 1));
    { let d = ""; RD.forEach(([a, b]) => { const m = (a + b) / 2; for (let k = 0.5; k < N; k += 1.4) { if (RD.some(([p, q]) => k > p - 1 && k < q + 0.3)) continue; const p1 = P(k, m), p2 = P(k + 0.7, m), p3 = P(m, k), p4 = P(m, k + 0.7); d += `M${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} M${p3[0]} ${p3[1]} L${p4[0]} ${p4[1]} `; } });
      el("path", { d, stroke: "#FFFFFF", "stroke-width": 1.6, fill: "none" }, base); }
    const padG = el("g", null, base);

    // the blocks' contents, each drawn back to front; key: what a step can bring into focus
    const L = {}; for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) L[i + "" + j] = [];
    const bk = (v) => Math.max(0, Math.min(3, Math.floor(v / PIT)));
    const put = (x, y, fn, key) => L[bk(x) + "" + bk(y)].push([x + y, fn, key]);
    const tree = (x, y, s, k) => put(x, y, (g) => K.tree(g, x, y, s || 0.9, k));
    // concrete pads are part of the ground, so the pipes run over them and plug into the transformers
    const pad = (g, x, y, w, d, own) => F.box(own || padG, x, y, 0, w, d, 0.06, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" });
    const house = (x, y, roof, ev, key) => { put(x + 1, y + 1, (g) => { ISO.house(g, F, x, y, 2.2, 1.6, 1.1, 0.8, roof); [[0.25, 0.97], [1.03, 1.75]].forEach(([u0, u1]) => K.pvQuad(g, [x + u0, y + 1.66, 1.16], [x + u1, y + 1.66, 1.16], [x + u1, y + 1.02, 1.67], [x + u0, y + 1.02, 1.67], 4, 3)); F.box(g, x + 2.25, y + 0.5, 0, 0.45, 0.3, 0.42, { left: C.w2, right: C.w3, top: C.w1 }); }, key);
      if (ev) { put(x + 0.2, y + 2.0, (g) => K.car(g, x + 0.2, y + 2.0, ev, "x"), key); put(x + 1.55, y + 2.15, (g) => K.charger(g, x + 1.55, y + 2.15), key); } };
    const ROOF = ["#B07466", "#A3695D", "#B9806F", "#9C6457"];
    // (0,0) wind farm and its collector substation
    [[1.6, 1.2], [5.0, 0.8], [8.6, 1.6], [2.8, 4.6], [6.6, 4.4]].forEach(([x, y]) => put(x, y, (g) => ISO.turbine(g, F, x, y, 4.8), "wind"));
    put(8.4, 8.4, (g) => { pad(g, 6.6, 7.6, 3.4, 2.2); K.xfmr(g, 7.0, 8.0); K.xfmr(g, 8.4, 8.0); }, "wind");
    tree(1.0, 8.6, 0.9, "pine"); tree(3.2, 9.0);
    // (1,0) the existing gas power plant
    put(17.2, 4.8, (g) => ISO.draw("fossil", g, [17.0, 4.6], 1.1), "gas");
    put(20.8, 8.4, (g) => { pad(g, 19.6, 7.6, 2.6, 2.2); K.xfmr(g, 20.4, 8.0); }, "gas");
    tree(13.0, 9.6, 0.9, "dark");
    // (2,0) solar farm and grid batteries
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const x = 24.6 + c * 2.4, y = 0.8 + r * 1.5; put(x, y, (g) => ISO.panel(g, F, x, y, 1.9, 0.95), "solar"); }
    [[24.6, 7.8], [26.8, 7.8], [29.0, 7.8]].forEach(([x, y]) => put(x + 0.9, y + 0.35, (g) => K.batt(g, x, y, 1.9), "batt"));
    put(33.0, 8.4, (g) => { pad(g, 31.8, 7.6, 2.4, 2.2); K.xfmr(g, 32.6, 8.0); }, "solar");
    // (3,0) downtown: towers in the right-hand corner, where they hide nothing behind them
    [[36.8, 0.6, 2.4, 2.4, 8.8, "#DCE3EA", C.water, "plant"], [40.0, 0.4, 2.4, 2.4, 10.4, "#C9D2DC", C.water, "pv"], [43.4, 0.8, 2.2, 2.0, 7.0, "#EDE6DA", "#BFD3E6", "garden"],
     [37.4, 4.8, 2.4, 2.2, 5.6, "#E3DDD3", "#BFD3E6", "pv"], [41.6, 4.6, 2.2, 2.2, 6.4, "#F1F2F4", C.water, "garden"], [44.0, 4.4, 2.0, 2.2, 6.0, "#D8DEE6", C.water, "pv"]]
      .forEach(([x, y, w, d, h, b, gl, r]) => put(x + w / 2, y + d / 2, (g) => K.tower(g, x, y, w, d, h, b, gl, r), "downtown"));
    [[37.0, 8.8], [44.8, 9.2, 0.9, "dark"]].forEach(([x, y, sc, k]) => tree(x, y, sc || 0.9, k));
    // (0,1) homes
    [[0.8, 13.4], [5.6, 13.4], [0.8, 18.2], [5.6, 18.2]].forEach(([x, y], i) => house(x, y, ROOF[i], i % 2 ? null : [C.car, "#E5C189"][i / 2], "homesA"));
    // (1,1) the grid control centre at the back, the main substation's switchyard beside it, a synchronous condenser
    put(14.8, 14.1, (g) => K.office(g, 12.9, 12.9, 3.8, 2.4, 2.2, 2, "#C9D6E3"), "cc");
    put(12.8, 13.4, (g) => { F.cyl(g, [12.6, 13.0, 0], "z", 0.08, 3.6, { side: "#9AA3B5", cap: "#626E88" }); const q = P(12.6, 13.0, 3.6); el("ellipse", { cx: q[0], cy: q[1], rx: 7, ry: 4, fill: "#F1F2F4" }, g); }, "cc");
    put(19.0, 17.0, (g) => {
      pad(g, 17.2, 13.4, 3.6, 7.2);
      K.fence(g, 17.2, 13.4, 20.8, 13.4, "#9AA3B5"); K.fence(g, 17.2, 13.4, 17.2, 20.6, "#9AA3B5");
      K.gantry(g, 18.6, 13.8, "y");
      [[17.6, 15.2], [19.2, 15.2], [17.6, 17.2], [19.2, 17.2], [18.4, 19.0]].forEach(([x, y]) => K.xfmr(g, x, y));
      K.fence(g, 17.2, 20.6, 20.8, 20.6, "#9AA3B5"); K.fence(g, 20.8, 13.4, 20.8, 20.6, "#9AA3B5");
    }, "s1");
    put(14.8, 17.4, (g) => { pad(g, 12.8, 16.2, 3.8, 2.4); F.cyl(g, [13.4, 17.4, 0.4], "x", 0.4, 2.2, { side: "#4AB4D6", cap: "#9ED9CF" }); F.box(g, 13.5, 17.1, 0, 0.2, 0.6, 0.4, { left: "#626E88", right: "#3E4860", top: "#8A93A6" }); F.box(g, 15.2, 17.1, 0, 0.2, 0.6, 0.4, { left: "#626E88", right: "#3E4860", top: "#8A93A6" }); }, "condenser");
    tree(13.4, 21.4, 0.95); tree(15.8, 21.8, 0.9, "dark");
    // (2,1) the data-centre campus, new demand; its new substation is built at Expand
    [[28.6, 12.8], [28.6, 16.8]].forEach(([x, y]) => put(x + 2.2, y + 1.3, (g) => K.dataHall(g, x, y, 4.4, 2.6), "dc"));
    const nsub = [el("g", null, base)]; pad(null, 24.8, 15.4, 3.2, 1.8, nsub[0]); put(26.4, 16.4, (g) => { nsub.push(g); K.xfmr(g, 25.2, 15.8); K.xfmr(g, 26.6, 15.8); }, "nsub");
    [[25.6, 19.8], [27.8, 19.8]].forEach(([x, y]) => put(x + 0.9, y + 0.35, (g) => K.batt(g, x, y, 1.8), "dc"));
    tree(33.8, 21.6, 0.9, "dark");
    // (3,1) the high street: shops with cafés and people out
    [[36.6, 13.2, 2.0, 2.2, 2.6, "#E3DDD3", "#47B970"], [38.7, 13.2, 1.8, 2.2, 3.2, "#EDE6DA", "#E0785A"], [40.6, 13.2, 2.0, 2.2, 2.4, "#DCE3EA", "#4AB4D6"], [42.7, 13.2, 1.8, 2.2, 3.0, "#E8E0D2", "#FFCD00"], [44.6, 13.2, 1.8, 2.2, 2.6, "#E3DDD3", "#B5302E"]]
      .forEach(([x, y, w, d, h, c, aw], i) => put(x + w / 2, y + d / 2, (g) => K.shop(g, x, y, w, d, h, c, aw, { win: C.water, sign: ["#2F6F4E", "#B5302E", "#204C8A", "#8F6B4E", "#3E4860"][i], roof: i % 2 ? "pv" : null }), "shops"));
    [[37.4, 16.4, "#E0785A"], [41.2, 16.4, "#47B970"], [44.8, 16.4, "#FFCD00"]].forEach(([x, y, c]) => put(x, y, (g) => K.table(g, x, y, c)));
    [[37.9, 16.7, { top: "#4AB4D6" }], [41.7, 16.8, { dress: true, top: "#E0785A" }], [45.2, 16.7, { top: "#8C6F9E", phone: true }], [39.4, 18.6, {}], [43.0, 19.4, { dress: true, top: "#47B970" }]].forEach(([x, y, op]) => put(x, y, (g) => K.person(g, x, y, Object.assign({ idle: true }, op))));
    tree(37.0, 21.2, 1); tree(42.0, 21.6, 0.95, "round"); tree(45.8, 20.8, 0.9, "dark");
    // (0,2) industry and its own substation
    put(4.6, 29.6, (g) => ISO.draw("factory", g, [4.4, 30.0], 1.1), "ind");
    put(8.4, 25.6, (g) => { pad(g, 6.8, 24.8, 3.2, 1.6); K.xfmr(g, 7.2, 25.1); K.xfmr(g, 8.6, 25.1); }, "ind");
    // (1,2) an EV charging hub under a solar canopy, and a small park behind it
    put(16.4, 26.6, (g) => {
      [[13.9, 25.4], [18.9, 25.4], [13.9, 27.6], [18.9, 27.6]].forEach(([x, y]) => F.box(g, x, y, 0, 0.1, 0.1, 1.15, { left: C.g1, right: C.g2, top: C.w1 }));
      F.box(g, 13.8, 25.3, 1.15, 5.3, 2.5, 0.08, { left: C.w2, right: C.w3, top: C.pv });
      for (let u = 14.3; u < 19; u += 0.55) K.seg(g, [u, 25.3, 1.23], [u, 27.8, 1.23], C.pvl, 0.6);
    }, "hub");
    [[14.1, 25.8, C.car], [15.6, 25.8, "#E0785A"], [17.1, 25.8, "#A6D84A"], [14.1, 26.9, "#F1F2F4"], [17.1, 26.9, "#4AB4D6"]].forEach(([x, y, c]) => put(x, y, (g) => { K.charger(g, x + 1.25, y - 0.25); K.car(g, x, y, c, "x"); }, "hub"));
    put(18.9, 26.6, (g) => { F.box(g, 18.4, 26.1, 0, 1.0, 0.9, 0.9, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" }); F.box(g, 18.55, 26.2, 0.9, 0.7, 0.6, 0.08, { left: "#13CE74", right: "#109553", top: "#A3D9A5" }); }, "hub");   // the hub's switch cabinet, where its pipe plugs in
    put(15.2, 31.6, (g) => K.fountain(g, 15.2, 31.6, 0.8)); tree(13.2, 33.6, 1); tree(21.6, 31.0, 0.95, "dark"); tree(20.6, 33.8, 0.9, "round");
    [[16.6, 32.4, { top: "#E0785A" }], [16.9, 32.5, { dress: true, top: "#47B970" }]].forEach(([x, y, op]) => put(x, y, (g) => K.person(g, x, y, Object.assign({ idle: true }, op))));
    // (2,2) homes with rooftop solar, heat pumps and EVs, run together as a virtual power plant
    [[24.8, 25.2], [29.6, 25.2], [24.8, 30.0], [29.6, 30.0]].forEach(([x, y], i) => house(x, y, ROOF[(i + 2) % 4], ["#4AB4D6", "#F1F2F4", "#A6D84A", "#E0785A"][i], "homesB"));
    // (3,2) low-rise flats with rooftop solar, and their substation
    [[37.0, 25.4, 2.6, 2.4, 3.6, "#E3DDD3", "#BFD3E6", "pv"], [41.2, 25.6, 2.4, 2.4, 3.2, "#F1F2F4", C.water, "pv"], [37.4, 29.4, 2.4, 2.2, 3.0, "#DCE3EA", C.water, "garden"], [43.6, 29.2, 2.4, 2.2, 3.4, "#EDE6DA", "#BFD3E6", "pv"]]
      .forEach(([x, y, w, d, h, b, gl, r]) => put(x + w / 2, y + d / 2, (g) => K.tower(g, x, y, w, d, h, b, gl, r, { noShop: true }), "flats"));
    put(41.0, 33.0, (g) => { pad(g, 40.2, 32.4, 1.8, 1.4); K.xfmr(g, 40.6, 32.6); }, "flats");
    tree(45.8, 33.4, 0.9); tree(36.8, 33.6, 0.9, "dark");
    // (0,3) a new wind and solar zone among the fields: built, but waiting for a line to connect it (Expand)
    [[3.0, 45.2, 1], [8.6, 44.6, -1]].forEach(([x, y, d], i) => put(x, y, (g) => K.sheep(g, x, y, { dir: d, graze: i % 2 === 0 })));
    const zone = []; const zput = (x, y, fn) => put(x, y, (g) => { zone.push(g); fn(g); }, "zone");
    [[1.4, 37.0], [4.6, 36.8], [1.6, 40.6], [1.8, 44.0]].forEach(([x, y]) => zput(x, y, (g) => ISO.turbine(g, F, x, y, 4.6)));
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { const x = 4.6 + c * 2.4, y = 40.4 + r * 1.5; zput(x, y, (g) => ISO.panel(g, F, x, y, 1.9, 0.95)); }
    [[4.6, 43.6], [6.6, 43.6]].forEach(([x, y]) => zput(x + 0.8, y + 0.35, (g) => K.batt(g, x, y, 1.7)));
    zput(8.4, 37.8, (g) => { pad(g, 7.4, 37.2, 2.4, 1.6); K.xfmr(g, 7.9, 37.6); });
    // (1,3) the village at the end of the line, with its own solar and battery (a microgrid when islanded)
    [[13.2, 40.8], [16.8, 41.6], [13.6, 43.8], [18.8, 44.0]].forEach(([x, y], i) => put(x + 1, y + 1, (g) => { ISO.house(g, F, x, y, 2.0, 1.5, 1.0, 0.75, ROOF[i]); K.pvQuad(g, [x + 0.25, y + 1.56, 1.06], [x + 1.75, y + 1.56, 1.06], [x + 1.75, y + 0.95, 1.52], [x + 0.25, y + 0.95, 1.52], 4, 3); }, "village"));
    for (let c = 0; c < 2; c++) { const x = 12.8 + c * 2.2; put(x, 38.6, (g) => ISO.panel(g, F, x, 38.6, 1.8, 0.85), "village"); }
    put(20.0, 38.8, (g) => K.batt(g, 19.2, 38.4, 1.6), "village"); tree(21.8, 41.6, 0.9, "pine"); tree(21.6, 46.0, 0.9);
    // (2,3) a farm: a barn with rooftop solar, cows and hay
    put(27.0, 39.8, (g) => { const b = F.box(g, 25.6, 38.8, 0, 3.4, 2.0, 1.4, { left: "#B5302E", right: "#8F2A28", top: "#6D5A56" }); F.face(g, F.L, b, 1.2, 0, 2.2, 1.0, "#F1F2F4", { "stroke-width": 0.6 }); K.pvQuad(g, [25.8, 38.9, 1.42], [28.8, 38.9, 1.42], [28.8, 40.6, 1.42], [25.8, 40.6, 1.42], 6, 3); }, "farm");
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { const x = 25.4 + c * 2.4, y = 42.2 + r * 1.5; put(x, y, (g) => ISO.panel(g, F, x, y, 1.9, 0.95), "farm"); }   // solar on the farm's back field
    [[30.4, 38.6], [30.4, 39.8]].forEach(([x, y]) => put(x + 0.9, y + 0.35, (g) => K.batt(g, x, y, 1.8), "farm"));
    [[33.0, 39.4]].forEach(([x, y]) => put(x, y, (g) => K.hay(g, x, y)));
    [[32.4, 44.2, -1]].forEach(([x, y, d]) => put(x, y, (g) => K.cow(g, x, y, { dir: d })));
    tree(33.8, 37.4, 0.9, "dark");
    // (3,3) the converter station at the border, and two flags where the interconnector crosses it
    put(41.2, 40.6, (g) => { const b = F.box(g, 39.2, 39.0, 0, 3.6, 2.2, 1.6, { left: "#DCE3EA", right: "#B9C3CF", top: "#EEF1F5" }); for (let u = 0.4; u < 3.4; u += 0.7) F.face(g, F.L, b, u, 0.3, u + 0.4, 1.2, "#9FB2C6", { "stroke-width": 0.5 }); K.xfmr(g, 43.0, 41.6); }, "conv");
    [[46.0, 39.6, "#13A06A", "#FFFFFF"], [46.0, 42.6, "#EE7309", "#203772"]].forEach(([x, y, c1, c2]) => put(x, y, (g) => flag(g, x, y, c1, c2), "flags"));
    tree(38.0, 44.8, 0.95); tree(42.6, 45.8, 0.9, "dark"); tree(37.4, 37.6, 0.9, "round");
    // the transmission line: pylons along the front of the generation row, the conductors landing on the main
    // substation's gantry (the glass tubes run beneath, along the pavement)
    const GAN = [18.6, 13.8, 2.15, "y"];
    [[5.0, 9.6], [13.4, 9.6], [26.4, 9.6], [31.4, 9.6]].forEach(([x, y]) => put(x, y, (g) => K.pylon(g, x, y, 3.2), "grid"));
    put(13.4, 9.55, (g) => K.spans(g, [[5.0, 9.6], [13.4, 9.6]], 3.2, "y", GAN), "grid");
    put(26.4, 9.55, (g) => K.spans(g, [[31.4, 9.6], [26.4, 9.6]], 3.2, "y", GAN), "grid");
    // the local lines: wooden poles and wires along the homes, the data centres and flats, and out to the village and farm
    const poles = (y, xs) => { xs.forEach((x) => put(x, y, (g) => K.pole(g, x, y, 1.9, 2), "grid")); put(xs[xs.length - 1], y - 0.05, (g) => K.wires(g, xs, y, [1.78, 1.56], [-0.4, 0.4], "#3E4860", 7), "grid"); };
    poles(16.7, [0.6, 4.6, 9.4]); poles(21.9, [25.4, 30.6, 37.4, 42.6]); poles(36.8, [13.6, 17.8, 21.6, 26.4]);

    // junction boxes where pipes meet: a grey box with insulators on top, as in the infographic
    JBOX.forEach(([x, y, w, d]) => { w = w || 1.0; d = d || 1.0; put(x, y, (g) => { F.box(g, x - w / 2, y - d / 2, 0, w, d, 0.95, { left: "#C9CED6", right: "#AEB5C0", top: "#E3E6EB" }); [-0.25, 0.25].forEach((o2) => F.cyl(g, [x + o2 * w, y, 0.95], "z", 0.07, 0.28, { side: "#626E88", cap: "#8A93A6" })); }, "jbox"); });
    // the fittings on the pipes, each in depth order with the rest of its block, keyed by its technology
    const fits = {}, gasks = [];
    Object.entries(FIT).forEach(([id, list]) => list.forEach(([type, tube, f]) => { const t = TUBES_L.find((u) => u.id === tube); if (!t || !t.pts) return; const at = along2(t.pts, f);
      put(at.x, at.y, (g) => { (fits[id] = fits[id] || []).push(g); const gk = []; fitting(g, type, at, gk); gasks.push({ id: tube, at, g: gk[0] }); }, "ctl-" + id); }));
    const socks = [];
    TUBES_L.forEach((t) => { if (!t.pts) return; [0, 1].forEach((e) => { const gp = e ? t.pts.slice().reverse() : t.pts, d = exitAt(gp); if (d == null) return;
      const dx = gp[1][0] - gp[0][0], dy = gp[1][1] - gp[0][1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l; if (ux + uy < 0.5) return;   // only faces that face us
      const X = [gp[0][0] + ux * d, gp[0][1] + uy * d]; let len = Math.min(0.9, l - d - 0.05);
      for (let k = 0.1; k <= len; k += 0.02) if (inFoot([X[0] + ux * k, X[1] + uy * k])) { len = k - 0.12; break; }   // stop short of the next box
      if (len < 0.2) return;
      put(X[0] + ux * len, X[1] + uy * len, (g) => socks.push({ id: t.id, e, g, X, u: [ux, uy], len }), "sock"); }); });
    (o.extra || []).forEach(([x, y, fn]) => put(x, y, fn));
    if (o.under) o.under(el("g", null, root));
    const lanes = [];
    for (let j = 0; j < 4; j++) {
      for (let i = 0; i < 4; i++) { const g = el("g", null, root); L[i + "" + j].sort((a, b) => a[0] - b[0]).forEach(([, fn, key]) => fn(el("g", Object.assign({ class: key === "jbox" || key === "sock" ? "ig-keep" : "ig-item" }, key ? { "data-k": key } : {}), g))); }
      if (j < 3) lanes.push(el("g", { class: "ig-item" }, root));
    }
    // a few cars on the three roads along gx
    const V = [], CAR = [C.car, "#E5C189", "#A6D84A", "#F1F2F4", "#E0785A", "#4AB4D6", "#8C6F9E"]; let ci = 0;
    [[0, [["car", 1], ["truck", -1]]], [1, [["car", 1], ["bus", 1], ["car", -1]]], [2, [["car", 1], ["car", -1]]]].forEach(([k, list]) => {
      const a = RD[k][0]; list.forEach(([t, dir], n) => {
        const y = dir > 0 ? a + 0.12 : a + 0.85, len = t === "bus" ? 2.8 : 1.2, x0 = dir > 0 ? -len : 0, g = el("g", null, lanes[k]), col = CAR[ci++ % CAR.length];
        t === "bus" ? K.bus(g, x0, y) : K.car(g, x0, y, t === "truck" ? "#F1F2F4" : col, "x");
        V.push({ g, dir, len, v: t === "bus" ? 1.8 : 2.3, s: (n * 17.3 + k * 9) % (N + len) });
      }); });
    let last = null; const host = root.ownerSVGElement;
    const tick = (time) => { if (last === null) last = time; const dt = Math.min(0.1, time - last); last = time; if (!root.isConnected || document.hidden) return; const r = host.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      V.forEach((c) => { c.s = (c.s + c.v * dt) % (N + c.len); const f = c.dir > 0 ? c.s : N - c.s, mid = f - c.dir * c.len / 2; const op = Math.max(0, Math.min(1, (mid - 0.3) / 2.2, (N - 0.3 - mid) / 2.2));
        c.g.setAttribute("transform", `translate(${(K.UX[0] * f).toFixed(1)} ${(K.UX[1] * f).toFixed(1)})`); const o2 = op.toFixed(2); if (c.o !== o2) { c.o = o2; c.g.setAttribute("opacity", o2); } }); };
    gsap.ticker.add(tick); tick(0); tick(0.016);
    return { zone, nsub, fits, socks, gasks };
  }
  // a flag on a pole, its cloth facing along gx and fluttering
  function flag(g, x, y, c1, c2) {
    F.cyl(g, [x, y, 0], "z", 0.05, 3.2, { side: "#9AA3B5", cap: "#626E88" });
    const top = P(x, y, 3.1), w = 1.3, h = 0.75, U = K.UX.map((v) => v * w), Hh = 34.64 * h;
    const cloth = el("g", null, g);
    const d = (k) => { const m = 4 * k; return `M${top[0]} ${top[1]} C${top[0] + U[0] * 0.35} ${top[1] + U[1] * 0.35 - m} ${top[0] + U[0] * 0.65} ${top[1] + U[1] * 0.65 + m} ${top[0] + U[0]} ${top[1] + U[1]} L${top[0] + U[0]} ${top[1] + U[1] + Hh} C${top[0] + U[0] * 0.65} ${top[1] + U[1] * 0.65 + Hh + m} ${top[0] + U[0] * 0.35} ${top[1] + U[1] * 0.35 + Hh - m} ${top[0]} ${top[1] + Hh} Z`; };
    const f1 = el("path", { d: d(1), fill: c1 }, cloth);
    const st = (k) => { const m = 4 * k, a = 0.5, y0 = top[1] + Hh * a; return `M${top[0]} ${y0 - Hh * 0.17} C${top[0] + U[0] * 0.35} ${y0 - Hh * 0.17 + U[1] * 0.35 - m} ${top[0] + U[0] * 0.65} ${y0 - Hh * 0.17 + U[1] * 0.65 + m} ${top[0] + U[0]} ${y0 - Hh * 0.17 + U[1]} L${top[0] + U[0]} ${y0 + Hh * 0.17 + U[1]} C${top[0] + U[0] * 0.65} ${y0 + Hh * 0.17 + U[1] * 0.65 + m} ${top[0] + U[0] * 0.35} ${y0 + Hh * 0.17 + U[1] * 0.35 - m} ${top[0]} ${y0 + Hh * 0.17} Z`; };
    const f2 = el("path", { d: st(1), fill: c2, "data-nostroke": "" }, cloth);
    const o = { k: 1 }; gsap.to(o, { k: -1, duration: 0.9 + Math.random() * 0.3, repeat: -1, yoyo: true, ease: "sine.inOut", onUpdate: () => { f1.setAttribute("d", d(o.k)); f2.setAttribute("d", st(o.k)); } });
  }

  // ---------- build one tile: the town, the small tiles, the tubes ----------
  function make(svg, opts) {
    opts = opts || {};
    const id = "ig" + (++UID);
    svg.classList.add("iso");
    svg.setAttribute("data-noink", "");
    svg.setAttribute("data-ink-scale", opts.ink || 1.2);   // plain, zoomable outlines (see js/clean.js)
    const defs = svg.querySelector("defs") || el("defs", null, svg);
    const root = el("g", null, svg);
    const sats = {};
    const SX = opts.satExtra || {};
    const satAt = (name, parent) => { const g = el("g", { class: "ig-sat" }, parent); SAT[name](g); (SX[name] || []).forEach((fn) => fn(el("g", null, g))); sats[name] = g; return g; };
    // the small tiles first: none of them overlaps the town on screen, and the tubes (drawn just above the town's ground)
    // then pass over their land; the new substation and the road signs stand in the town in depth order
    let under = null;
    if (opts.city4) {   // section L: the larger city, everything on one board
      const r = city4(el("g", null, root), defs, { extra: opts.extra, under: (g) => (under = g) });
      sats.zone = r.zone; sats.nsub = r.nsub; sats.fits = r.fits; var socks = r.socks, gasks = r.gasks;
      gsap.set(sats.nsub, { opacity: 0 }); Object.values(r.fits).forEach((gs) => gsap.set(gs, { opacity: 0 }));
    } else {
      // section K: the town alone, no tiles around it; Expand builds a new substation, an HVDC link and a link across
      // the border, which leaves over the edge of the land between two flags
      sats.flags = [];
      const extra = (opts.extra || []).concat([[15.8, 20.8, (g) => { SAT.nsub(g); sats.nsub = g; }]],
        [[35.4, 16.8, "#13A06A", "#FFFFFF"], [35.4, 18.9, "#EE7309", "#203772"]].map(([x, y, c1, c2]) => [x, y, (g) => { flag(g, x, y, c1, c2); sats.flags.push(g); }]));
      town(el("g", null, root), defs, { calm: true, extra, under: (g) => (under = g) });
      ["nsub", "flags"].forEach((n) => gsap.set(sats[n], { opacity: 0 }));
    }

    // the tubes: each one a closed glass outline (no masks: a mask over a moving camera made the page flicker), a coloured
    // core, a highlight along the top, a faint shadow on the ground, and the flow as glowing beads inside
    const ring = el("g", { class: "ig-rings", "data-keepstroke": "" }, under);
    const layer = el("g", { class: "ig-tubes", "data-keepstroke": "" }, under), over = el("g", { class: "ig-tubes", "data-keepstroke": "" }, root);   // the HVDC arc runs overhead
    const tubes = {};
    // every corner becomes a smooth elbow (a curve sampled into short steps), so the pipes bend instead of kinking
    const smooth = (pts, R) => {
      if (pts.length < 3) return pts;
      const out = [pts[0]];
      for (let i = 1; i < pts.length - 1; i++) {
        const p = pts[i], a = pts[i - 1], b = pts[i + 1], la = Math.hypot(p[0] - a[0], p[1] - a[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
        const r = Math.min(R, la * 0.45, lb * 0.45), s0 = [p[0] + ((a[0] - p[0]) * r) / la, p[1] + ((a[1] - p[1]) * r) / la], s1 = [p[0] + ((b[0] - p[0]) * r) / lb, p[1] + ((b[1] - p[1]) * r) / lb];
        for (let k = 0; k <= 8; k++) { const u = k / 8, v = 1 - u; out.push([v * v * s0[0] + 2 * v * u * p[0] + u * u * s1[0], v * v * s0[1] + 2 * v * u * p[1] + u * u * s1[1]]); }
      }
      out.push(pts[pts.length - 1]); return out;
    };
    const scr = (t, z) => {
      if (t.arc) { const [a, b, h] = t.arc, out = []; for (let i = 0; i <= 48; i++) { const u = i / 48; out.push(P(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, z + (z ? h * 4 * u * (1 - u) : 0))); } return out; }
      return smooth(t.pts.map((q) => P(q[0], q[1], z)), 26);
    };
    const partial = (pts, f) => {
      if (f >= 1) return pts;
      let tot = 0; for (let i = 1; i < pts.length; i++) tot += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      let want = tot * Math.max(0.001, f); const out = [pts[0]];
      for (let i = 1; i < pts.length; i++) { const L = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (L >= want) { const u = want / L; out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u]); return out; } want -= L; out.push(pts[i]); }
      return out;
    };
    const lineD = (pts) => "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L");
    const outlineD = (pts, w) => {
      const h = w / 2, n = pts.length, L = [], R = [];
      const nrm = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };
      for (let i = 0; i < n; i++) {
        const n1 = i > 0 ? nrm(pts[i - 1], pts[i]) : nrm(pts[0], pts[1]), n2 = i < n - 1 ? nrm(pts[i], pts[i + 1]) : n1;
        let mx = n1[0] + n2[0], my = n1[1] + n2[1]; const ml = Math.hypot(mx, my) || 1; mx /= ml; my /= ml;
        const k = Math.min(h * 3, h / Math.max(0.2, mx * n1[0] + my * n1[1]));
        L.push([pts[i][0] + mx * k, pts[i][1] + my * k]); R.push([pts[i][0] - mx * k, pts[i][1] - my * k]);
      }
      const f = (p) => p[0].toFixed(1) + " " + p[1].toFixed(1);
      return "M" + L.map(f).join(" L") + " L" + R.slice().reverse().map(f).join(" L") + " Z";
    };
    // the open end of a pipe: an ellipse standing across it (the pipe's round mouth seen at an angle)
    const rimD = (p, q, w) => { const dx = p[0] - q[0], dy = p[1] - q[1], l = Math.hypot(dx, dy) || 1, ux = dx / l, uy = dy / l, nx = -uy, ny = ux, a = w / 2, b = w * 0.24; let d = "";
      for (let i = 0; i <= 24; i++) { const t = (i / 24) * Math.PI * 2, x = p[0] + nx * a * Math.cos(t) + ux * b * Math.sin(t), y = p[1] + ny * a * Math.cos(t) + uy * b * Math.sin(t); d += (i ? "L" : "M") + x.toFixed(1) + " " + y.toFixed(1); } return d + "Z"; };
    // a flange: a darker band round the pipe where it enters a transformer or a junction box
    const ptAt = (pts, s) => { for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]); if (s <= l || i === pts.length - 1) { const u = Math.min(1, s / (l || 1)); return [[a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u], [(b[0] - a[0]) / (l || 1), (b[1] - a[1]) / (l || 1)]]; } s -= l; } };
    const flangeD = (pts, s, w) => { const [c, [ux, uy]] = ptAt(pts, s), nx = -uy, ny = ux, h = w / 2 + 2.4, L = 3.2;
      return "M" + [[-L, -h], [L, -h], [L, h], [-L, h]].map(([u, v]) => (c[0] + ux * u + nx * v).toFixed(1) + " " + (c[1] + uy * u + ny * v).toFixed(1)).join(" L") + "Z"; };
    const draw = (T, f) => {
      const pts = partial(T.pts, f), sh = partial(T.flat, f);
      T.body.setAttribute("d", outlineD(pts, T.w));
      const n = pts.length; if (n > 1) {
        T.rim0.setAttribute("d", "");
        const wall = (G, list, e) => { if (!G) return; G.g.style.display = e != null && (list !== 1 || f >= 1) ? "" : "none"; if (e == null) return; const q = list === 1 ? pts.slice().reverse() : pts, gp = list === 1 ? T.def.pts.slice().reverse() : T.def.pts, [c] = ptAt(q, e + 3); gasketAt(G, c, gp[1][0] - gp[0][0], gp[1][1] - gp[0][1], T.w); };
        wall(T.gk0, 0, T.e0); wall(T.gk1, 1, T.e1);
        (T.gaskets || []).forEach((G) => { gasketAt(G, P(G.at.x, G.at.y, Z), G.at.dx, G.at.dy, T.w); }); }
      T.core.setAttribute("d", lineD(pts)); T.hi.setAttribute("d", lineD(pts)); T.shadow.setAttribute("d", lineD(sh));
      (T.stubs || []).forEach((S) => { const a = P(S.X[0], S.X[1], Z), b = P(S.X[0] + S.u[0] * S.len, S.X[1] + S.u[1] * S.len, Z), two = [a, b], on = S.e ? f >= 1 : f > 0;
        S.g.style.display = on ? "" : "none"; S.body.setAttribute("d", outlineD(two, T.w)); { const ux = (b[0] - a[0]) / Math.hypot(b[0] - a[0], b[1] - a[1]), uy = (b[1] - a[1]) / Math.hypot(b[0] - a[0], b[1] - a[1]), h = T.w / 2; S.sd.setAttribute("d", `M${(a[0] - uy * h).toFixed(1)} ${(a[1] + ux * h).toFixed(1)} L${(b[0] - uy * h).toFixed(1)} ${(b[1] + ux * h).toFixed(1)} M${(a[0] + uy * h).toFixed(1)} ${(a[1] - ux * h).toFixed(1)} L${(b[0] + uy * h).toFixed(1)} ${(b[1] - ux * h).toFixed(1)}`); } S.core.setAttribute("d", lineD(two)); S.hi.setAttribute("d", lineD(two)); gasketAt(S.gk, P(S.X[0] + S.u[0] * 0.12, S.X[1] + S.u[1] * 0.12, Z), S.u[0], S.u[1], T.w);;
        S.core.setAttribute("stroke-width", (T.w * 0.34).toFixed(2)); S.hi.setAttribute("transform", `translate(0 ${(-T.w * 0.24).toFixed(2)})`); });
      T.core.setAttribute("stroke-width", (T.w * 0.34).toFixed(2)); T.hi.setAttribute("transform", `translate(0 ${(-T.w * 0.24).toFixed(2)})`); T.shadow.setAttribute("stroke-width", (T.w * 0.8).toFixed(2));
    };
    (opts.tubes || TUBES).forEach((t) => {
      const g = el("g", { class: "ig-tube" }, t.arc && !opts.city4 ? over : layer), col = COL[t.kind], pts = scr(t, Z);
      const rnd = { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" };
      const shadow = el("path", Object.assign({ stroke: "#1E2433", "stroke-opacity": 0.1 }, rnd), g);
      const body = el("path", { fill: "#EAF4FC", "fill-opacity": 0.72, stroke: "#3E8ED9", "stroke-width": 1.5, "stroke-linejoin": "round" }, g);   // pale glass with a fine blue edge, as in the infographic
      const core = el("path", Object.assign({ stroke: col, "stroke-opacity": 0.4 }, rnd), g);
      const hi = el("path", Object.assign({ stroke: "#FFFFFF", "stroke-opacity": 0.95, "stroke-width": 2.4 }, rnd), g);
      const cl = el("path", { d: lineD(pts), fill: "none", stroke: "none" }, g);
      const fl = (open) => el("path", { fill: open ? "#D6E9F8" : "#7DB9EE", stroke: open ? "#3E8ED9" : "#2E6FB3", "stroke-width": 1.3, "stroke-linejoin": "round" }, g), rim0 = fl(t.open0), rim1 = fl(false);
      // where each end leaves the footprint it plugs into, in screen units from that end
      const ex = (gp) => { const d = exitAt(gp); if (d == null) return null; const a = P(gp[0][0], gp[0][1], Z), dx = gp[1][0] - gp[0][0], dy = gp[1][1] - gp[0][1], l = Math.hypot(dx, dy) || 1, b = P(gp[0][0] + (dx / l) * d, gp[0][1] + (dy / l) * d, Z); return Math.hypot(b[0] - a[0], b[1] - a[1]); };
      const e0 = t.pts ? ex(t.pts) : null, e1 = t.pts ? ex(t.pts.slice().reverse()) : null;
      const dg = el("g", null, g), len = cl.getTotalLength();
      const dots = []; const n = Math.max(2, Math.round(len / 85));
      for (let k = 0; k < n * 2; k++) {
        const c = el("g", null, dg);
        const halo = el("circle", { r: W * 0.55, fill: col, opacity: 0.3, "data-nostroke": "" }, c);
        const dot = el("circle", { r: W * 0.27, fill: col, "data-nostroke": "" }, c);
        dots.push({ c, halo, dot, t: (k % n) / n + (k >= n ? 0.5 / n : 0), extra: k >= n });
      }
      const T = tubes[t.id] = { def: t, g, len, body, core, hi, shadow, cl, dots, pts, flat: scr(t, 0), visible: !t.hidden, thick: false, w: W, f: 1, rim0, rim1, e0, e1 };
      if (opts.city4) T.stubs = (socks || []).filter((S) => S.id === t.id).map((S) => { const sg = el("g", { "data-keepstroke": "" }, S.g);
        if (S.e) T.e1 = null; else T.e0 = null;
        return Object.assign(S, { g: sg, body: el("path", { fill: "#EAF4FC", "fill-opacity": 0.72 }, sg), sd: el("path", { fill: "none", stroke: "#3E8ED9", "stroke-width": 1.5 }, sg),
          core: el("path", Object.assign({ stroke: col, "stroke-opacity": 0.4 }, rnd), sg), hi: el("path", Object.assign({ stroke: "#FFFFFF", "stroke-opacity": 0.95, "stroke-width": 2.4 }, rnd), sg),
          gk: gasket(sg, col) }); });
      if (opts.city4) T.gaskets = (gasks || []).filter((G) => G.id === t.id).map((G) => Object.assign(gasket(G.g, col), { at: G.at }));
      if (t.open0) T.e0 = 0;
      if (opts.city4) { if (T.e0 != null) T.gk0 = gasket(g, col); if (T.e1 != null) T.gk1 = gasket(g, col); }
      draw(T, 1);
      if (t.hidden) gsap.set(g, { opacity: 0 });
    });

    // express lanes: a grey half-pipe with yellow chevrons round a stretch of pipe (the infographic's "fast lane")
    const sleeves = {};
    const slice = (pts, f0, f1) => { const seg = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1])), tot = seg.reduce((a, b) => a + b, 0), out = [];
      let acc = 0; const a0 = tot * f0, a1 = tot * f1, at = (i, d) => { const u = (d - acc) / seg[i]; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u]; };
      for (let i = 0; i < seg.length; i++) { const e = acc + seg[i]; if (e >= a0 && acc <= a1) { if (!out.length) out.push(at(i, Math.max(a0, acc))); out.push(at(i, Math.min(a1, e))); } acc = e; } return out; };
    Object.entries(opts.sleeves || {}).forEach(([id, list]) => list.forEach(([tid, f0, f1]) => {
      const T = tubes[tid]; if (!T) return; const sub = slice(T.pts, f0, f1), d = lineD(sub), wide = (opts.thickTubes || []).includes(tid) ? WT : W;
      const back = el("g", { opacity: 0 }); T.g.insertBefore(back, T.body);
      el("path", { d, fill: "none", stroke: "#8A93A6", "stroke-width": wide + 13, "stroke-linejoin": "round" }, back);
      el("path", { d, fill: "none", stroke: "#5B6478", "stroke-width": wide + 7, "stroke-linejoin": "round", opacity: 0.55 }, back);
      const ch = el("g", { opacity: 0 }); T.g.insertBefore(ch, T.cl);
      let dd = "", acc = 0; for (let i = 1; i < sub.length; i++) { const a = sub[i - 1], b = sub[i], l = Math.hypot(b[0] - a[0], b[1] - a[1]), ux = (b[0] - a[0]) / l, uy = (b[1] - a[1]) / l, nx = -uy, ny = ux;
        for (let t = (18 - (acc % 18)) % 18; t < l; t += 18) { const c = [a[0] + ux * t, a[1] + uy * t], h = wide * 0.32; dd += `M${(c[0] - ux * 4 + nx * h).toFixed(1)} ${(c[1] - uy * 4 + ny * h).toFixed(1)} L${(c[0] + ux * 3).toFixed(1)} ${(c[1] + uy * 3).toFixed(1)} L${(c[0] - ux * 4 - nx * h).toFixed(1)} ${(c[1] - uy * 4 - ny * h).toFixed(1)} `; } acc += l; }
      el("path", { d: dd, fill: "none", stroke: "#FFC400", "stroke-width": 2.6, "stroke-linecap": "round", "stroke-linejoin": "round" }, ch);
      (sleeves[id] = sleeves[id] || []).push(back, ch);
    }));

    // tube state and the flow: slow and sparse at rest; when a step is about some tubes, only those flow
    let state = { boost: null, storage: false, flex: null, island: false, all: false, only: null };
    const setW = (T, w, dur) => gsap.to(T, { w, duration: dur, overwrite: "auto", onUpdate: () => draw(T, T.f) });
    let last = null;
    function tick(time) {
      if (last === null) last = time; const dt = Math.min(0.1, time - last); last = time;
      if (!svg.isConnected || document.hidden) return;
      const r = svg.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
      for (const k in tubes) {
        const T = tubes[k]; if (T.stubs && T.stubs.length) { const op = T.g.style.opacity; T.stubs.forEach((S) => { if (S.op !== op) { S.op = op; S.g.style.opacity = op; } }); }
        if (!T.visible) continue;
        const boosted = state.all || (state.boost && state.boost.includes(k));
        const sp = (boosted ? 120 : 32) / T.len;
        const isSt = state.storage && (k === "solar" || k === "main" || k === "trunk" || (state.storeSet && state.storeSet.has(k)));
        const isFlex = state.flex === k || !!(state.flexSet && state.flexSet.has(k)), cut = state.island && k === "village";
        const still = state.only && !state.only.has(k);
        T.dots.forEach((d) => {
          const show = !cut && !still && T.f >= 1 && (!d.extra || boosted || T.thick || isFlex || isSt);
          d.c.style.display = show ? "" : "none"; if (!show) return;
          const rev = isFlex && d.extra;
          d.t = (d.t + sp * dt) % 1;
          const u = rev ? 1 - d.t : d.t, p = T.cl.getPointAtLength(u * T.len);
          d.c.setAttribute("transform", `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
          let col = COL[T.def.kind];
          if (isSt && d.extra) col = COL.storage;
          if (isFlex) col = d.extra ? COL.flex : COL[T.def.kind];
          if (d.col !== col) { d.col = col; d.dot.setAttribute("fill", col); d.halo.setAttribute("fill", col); }
          const s = T.w / W; if (d.s !== s) { d.s = s; d.dot.setAttribute("r", (W * 0.27 * s).toFixed(2)); d.halo.setAttribute("r", (W * 0.55 * s).toFixed(2)); }
        });
      }
    }
    gsap.ticker.add(tick);

    const show = (name, on, dur) => { const g = sats[name] || (tubes[name] && tubes[name].g); if (!g) return; gsap.to(g, { opacity: on ? 1 : 0, duration: dur == null ? 0.6 : dur, overwrite: "auto" }); };
    const build = (name, on) => {
      const T = tubes[name];
      if (!T) { show(name, on); return; }
      if (on && !T.visible) { gsap.set(T.g, { opacity: 1 }); T.f = 0; draw(T, 0); gsap.to(T, { f: 1, duration: 1.4, delay: 0.2, ease: "power2.out", onUpdate: () => draw(T, T.f) }); }
      else if (!on && T.visible) { gsap.killTweensOf(T); T.f = 1; gsap.to(T.g, { opacity: 0, duration: 0.3 }); }
      T.visible = on;
    };
    const thicken = (set) => { for (const k in tubes) { const T = tubes[k], on = set.has(k); if (on !== T.thick) { T.thick = on; setW(T, on ? WT : W, 0.6); gsap.to(T.core, { attr: { "stroke-opacity": on ? 0.55 : 0.4 }, duration: 0.6 }); } } };
    const focusTubes = (only) => { for (const k in tubes) if (tubes[k].visible) gsap.to(tubes[k].body, { attr: { "fill-opacity": only && !only.has(k) ? 0.35 : 0.55 }, duration: 0.4 }); };

    { const ls = window.ISO_LS ? ISO_LS(svg) : () => 1, k = (opts.ink || 1.2) * 0.8;   // no non-scaling strokes under the camera: the same weight, as plain strokes
      svg.querySelectorAll("[vector-effect]").forEach((n) => { const sw = +(n.getAttribute("stroke-width") || 1); n.setAttribute("stroke-width", (sw * k / ls(n)).toFixed(3)); n.removeAttribute("vector-effect"); }); }
    // the bounds of everything, for the camera
    const bb = root.getBBox(), pad = 30;
    const FULL = [bb.x - pad, bb.y - pad, bb.width + pad * 2, bb.height + pad * 2];
    svg.setAttribute("viewBox", FULL.map((v) => v.toFixed(0)).join(" "));
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    const spot = el("g", { class: "ig-spot" }, root), fx = el("g", { class: "ig-fx", "data-keepstroke": "" }, root);
    let moved = [];
    const lift = (n) => { if (!n || !n.parentNode || n.parentNode === spot) return; moved.push([n, n.parentNode, n.nextSibling]); spot.appendChild(n); };
    // focus: everything the step is not about turns to pale grey silhouettes where it stands (css: .ig-dim), so the
    // pipes keep their place in depth (behind what stands in front of them) and the step's own parts keep their colour
    const focus = (keys, tids, nodes) => {
      const ground = root.querySelector(".ig-ground");
      root.querySelectorAll(".ig-item").forEach((n) => { const lit = keys && (keys.includes(n.getAttribute("data-k")) || (nodes || []).some((x) => x && n.contains(x))); n.classList.toggle("ig-dim", !!keys && !lit); });
      if (ground) ground.classList.toggle("ig-dim", !!keys);
    };

    return { svg, root, defs, tubes, sats, sleeves, ring, FULL, build, thicken, show, focus, fx, set: (s) => { state = Object.assign({ boost: null, storage: false, flex: null, island: false, all: false, only: null }, s); focusTubes(state.only); } };
  }

  // ---------- L: the grid map ----------
  let M = null, pins = [];
  let CAMVB = null;   // where the camera is heading (the dashboards place themselves inside it)
  // The map runs the full width, under the sidebar card; the camera centres what is in focus in the open area to the
  // right of the card (SIDE: the share of the width the card covers)
  const SIDE = () => (innerWidth > 900 ? 0.34 : 0);
  function camera(at, w, dur, inst) {
    const I = inst || M, [fx, fy, fw, fh] = I.FULL, sd = SIDE();
    const r = I.svg.getBoundingClientRect(), asp = r.width > 0 ? r.height / r.width : 0.6;
    let vb;
    if (!w) {   // the whole city, fitted into the open area
      let vw = Math.max(fw / (1 - sd), fh / asp), vh = vw * asp;
      vb = [fx - sd * vw - ((vw * (1 - sd)) - fw) / 2, fy - (vh - fh) / 2, vw, vh];
    } else {
      w = Math.min(w, fw) / (1 - sd); const h = w * asp, p = P(at[0], at[1], 1.5);
      vb = [p[0] - sd * w - (w * (1 - sd)) / 2, Math.min(Math.max(p[1] - h / 2, fy - h * 0.1), fy + fh - h * 0.9), w, h];
    }
    if (I === M) CAMVB = vb;
    gsap.to(I.svg, { attr: { viewBox: vb.map((v) => v.toFixed(1)).join(" ") }, duration: dur == null ? 1.1 : dur, ease: "power2.inOut", overwrite: "auto" });
  }
  function buildL(svgEl) {
    while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);
    const extra = [];
    INTERVENTIONS.forEach((iv, i) => {
      const m = MAP_L[iv.id] || { at: [18, 18] }, [x, y, face] = m.s || [m.at[0], m.at[1], "L"];
      extra.push([x, y, (g) => { g.setAttribute("data-keepstroke", ""); pins[i] = roadSign(g, iv, x, y, face); }]);
    });
    const thickTubes = [].concat(...Object.values(MAP_L).map((m) => [].concat(m.thicken || [])));
    M = make(svgEl, { city4: true, tubes: TUBES_L, extra, sleeves: SLEEVE, thickTubes });
    const gr = el("linearGradient", { id: "ig-beam", x1: 0, y1: 1, x2: 0, y2: 0 }, M.defs);   // the hologram's beam of light
    el("stop", { offset: 0, "stop-color": "#7FD3F7", "stop-opacity": 0.05 }, gr); el("stop", { offset: 1, "stop-color": "#7FD3F7", "stop-opacity": 0.45 }, gr);
  }
  // a road sign standing in the town: a post on the pavement and the sign itself in perspective, facing along gx ("L")
  // or along gy ("R") like the walls of the buildings, with a darker back plate and a small shadow on the ground
  function roadSign(parent, iv, x, y, face) {
    const g = el("g", { class: "gm-pin", style: "cursor:pointer" }, parent);
    const SW = 1.5, H = 2.35, k = SW / 100, R = face === "R";
    const nx = R ? -1 : 0, ny = R ? 0 : -1;   // towards the back of the sign
    el("polygon", { points: ISO.pts(F.circle([x + nx * 0.05, y + ny * 0.05, 0.02], "z", 0.42, 24)), fill: "#1E2433", "fill-opacity": 0.2, "data-nostroke": "" }, g);
    F.box(g, x + nx * 0.1 - 0.05, y + ny * 0.1 - 0.05, 0, 0.1, 0.1, H, { left: "#9AA3B5", right: "#737D92", top: "#C3C9D4" });
    const M3 = R ? [30 * k, -17.32 * k, 0, 34.64 * k] : [30 * k, 17.32 * k, 0, 34.64 * k];
    const at = (p) => `matrix(${M3.map((v) => v.toFixed(4)).join(" ")} ${p[0].toFixed(1)} ${p[1].toFixed(1)})`;
    const back = el("g", { transform: at(P(x + nx * 0.07, y + ny * 0.07, H)) }, g);
    signGroup(iv.cat, iv.icon, 0, 0, 100, back);
    back.querySelectorAll("*").forEach((n) => { ["fill", "stroke"].forEach((a) => { const v = n.getAttribute(a); if (v && v !== "none") n.setAttribute(a, "#4A546A"); }); });
    const front = el("g", { transform: at(P(x, y, H)) }, g);
    signGroup(iv.cat, iv.icon, 0, 0, 100, front);
    el("title", { text: iv.tech }, g);
    const g0 = P(x, y, 0);
    gsap.set(g, { scale: 0, svgOrigin: `${g0[0]} ${g0[1]}` });
    g.addEventListener("click", () => { const st = document.querySelector(`[data-iv="${iv.id}"]`); if (st) st.scrollIntoView({ behavior: "smooth", block: "center" }); });
    return g;
  }
  function apply(k, cur) {
    if (!M) return;
    const built = new Set(), thick = new Set();
    INTERVENTIONS.forEach((iv, i) => { if (i > k) return; const m = MAP_L[iv.id] || {}; (m.build || []).forEach((b) => built.add(b)); [].concat(m.thicken || []).forEach((t) => thick.add(t)); });
    pins.forEach((p, i) => { const on = i <= k; gsap.to(p, { scale: on ? (i === cur ? 1.12 : 1) : 0, opacity: on ? (cur === -1 || i === cur ? 1 : 0.8) : 0, duration: 0.45, ease: on ? "back.out(2)" : "power2.in", overwrite: "auto" }); });
    M.show("nsub", built.has("nsub"));
    ["nsub", "zone", "hvdc", "inter", "inter2", "fork"].forEach((t) => M.build(t, built.has(t)));
    // the fittings and express lanes of every technology reached so far
    INTERVENTIONS.forEach((v, i) => { const on = i <= k; [(M.sats.fits || {})[v.id], M.sleeves[v.id]].forEach((gs) => gs && gsap.to(gs, { opacity: on ? 1 : 0, duration: 0.5, overwrite: "auto" })); });
    M.thicken(thick);
    const iv = cur >= 0 ? INTERVENTIONS[cur] : null, m = iv ? MAP_L[iv.id] || {} : {};
    M.set({ boost: m.boost ? [].concat(m.boost) : null, storage: !!m.storage, flex: m.flex || null, island: !!m.island, only: iv && m.flow ? new Set(m.flow) : null });
    // focus: what the step is about in colour, everything else greyed out under a pale veil
    if (iv) { M.focus((m.lit || []).concat("ctl-" + iv.id), null, [pins[cur]]); camera(m.at, m.zoom); }
    else { M.focus(null); camera(null, 0); }
    runFx(iv);
    const tally = document.querySelector(".tally__n"); if (tally) tally.textContent = Math.max(0, k + 1);
  }
  // ---------- what each technology does, shown in the town while its step is active ----------
  // Plaques stand in the same perspective as the signs; data links are dotted arcs with travelling dots; sparks flash on a
  // line where a fault happens; waves settle from jagged to smooth; a crew drives in. All of it sits above the grey veil.
  let FXT = [];
  const fxClear = () => { FXT.forEach((t) => t && t.kill && t.kill()); FXT = []; if (M) while (M.fx.firstChild) M.fx.removeChild(M.fx.firstChild); };
  const tw = (t) => (FXT.push(t), t);
  function ripple(x, y, col, r) {   // rings spreading on the ground
    for (let i = 0; i < 3; i++) {
      const q = P(x, y, 0.05), c = el("polygon", { points: ISO.pts(F.circle([x, y, 0.05], "z", r || 1.2, 40)), fill: "none", stroke: col, "stroke-width": 2.4 }, M.fx);
      tw(gsap.fromTo(c, { scale: 0.3, opacity: 0.9, svgOrigin: `${q[0]} ${q[1]}` }, { scale: 2.2, opacity: 0, duration: 2.4, delay: i * 0.8, repeat: -1, ease: "power1.out" }));
    }
  }
  function spark(x, y, z) {   // a fault: a flash on the line
    const p = P(x, y, z), burst = el("g", { transform: `translate(${p[0]} ${p[1]})` }, M.fx);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; el("line", { x1: Math.cos(a) * 6, y1: Math.sin(a) * 6, x2: Math.cos(a) * 15, y2: Math.sin(a) * 15, stroke: "#E04B00", "stroke-width": 2.6, "stroke-linecap": "round" }, burst); }
    SVG.icon("bolt-lightning", 0, 0, 16, "#FFC400", burst);
    tw(gsap.timeline({ repeat: -1, repeatDelay: 1.6 }).fromTo(burst, { opacity: 0, scale: 0.4, svgOrigin: `${p[0]} ${p[1]}` }, { opacity: 1, scale: 1.2, duration: 0.18 }).to(burst, { opacity: 0.2, duration: 0.12 }).to(burst, { opacity: 1, duration: 0.12 }).to(burst, { opacity: 0, duration: 0.5, delay: 0.9 }));
  }
  function ink(fn) {   // kit drawings made after the page's outline pass get the same outline here
    const c = el("g", { "data-ink-scale": 1.2 }, M.fx), w = el("g", null, c); fn(w); if (window.ISO_OUTLINE) ISO_OUTLINE(c); return w;
  }

  // ---------- the dashboard: a flat panel in a speech bubble, pointing at the component a step is about ----------
  // It names the technology (the analysts' own words) and shows a small, labelled chart of what it does. The numbers are
  // illustrative (each panel says so), shaped to match the impact the analysts give, e.g. up to 50% more line capacity.
  const DB = { bg: "#FFFFFF", edge: "#B0B7C6", grid: "#E3E6EB", axis: "#B0B7C6", text: "#192238", sub: "#626E88", G: "#109553", B: "#1E609C", O: "#EE7309", Y: "#D99A00", R: "#BF3100", N: "#8A93A6", soft: "#F3F5F8" };
  const T = (g, x, y, txt, o) => el("text", Object.assign({ x, y, "font-family": "Poppins", "font-size": 8, fill: DB.sub, text: txt }, o || {}), g);
  // Laid out like an Ember chart: the title (the technology), the subtitle (what is measured, and its unit) just under it,
  // the legend, the chart, and the note that the figures are illustrative as the source line; 10 units of margin all round.
  function bubble(iv, at, zoom, draw, o) {
    o = o || {};
    const W = 300, PAD = 10, s = Math.max(0.85, (zoom || 900) / 900) * (o.scale || 1), a = P(...at), meta = draw.meta || {};
    const g = el("g", { class: "ig-dash" }, M.fx), pos = el("g", null, g), box = el("g", null, pos), body = el("g", null, box);
    // the text and the chart first, to know how tall the panel is
    const wrap = (t, n) => { const lines = [""]; t.split(" ").forEach((wd) => { const L = lines[lines.length - 1]; if ((L + " " + wd).trim().length > n && L) lines.push(wd); else lines[lines.length - 1] = (L + " " + wd).trim(); }); return lines; };
    let lines = wrap(iv.tech, 38); if (lines.length > 2) { const m2 = iv.tech.match(/^(.*?)\s*\(([^)]*)\)\s*$/); if (m2) lines = wrap(m2[2].length <= 6 ? `${m2[1]} (${m2[2]})` : m2[1], 38); }
    let y = PAD;
    lines.slice(0, 2).forEach((L) => { T(body, PAD, y + 11, L, { "font-size": 12.5, "font-weight": 600, fill: DB.text }); y += 15; });
    if (meta.unit) wrap(meta.unit, 52).forEach((L) => { T(body, PAD, y + 10, L, { "font-size": 9.5, fill: DB.sub }); y += 12; });
    if (meta.legend && meta.legend.length) {
      y += 4; let lx = PAD;
      meta.legend.forEach(([name, col, dash]) => { const w = 16 + name.length * 4.9 + 12; if (lx + w > W - PAD && lx > PAD) { lx = PAD; y += 13; }
        el("line", { x1: lx, y1: y + 6, x2: lx + 12, y2: y + 6, stroke: col, "stroke-width": 2.4, "stroke-dasharray": dash ? "3 2" : null }, body); T(body, lx + 16, y + 9.5, name, { "font-size": 9, fill: DB.text }); lx += w; });
      y += 13;
    }
    y += 8;
    const CH = draw.h || 118;
    draw(el("g", { transform: `translate(${PAD} ${y})` }, body), W - PAD * 2, CH);
    y += CH + 8;
    T(body, PAD, y + 7, "Illustrative figures", { "font-size": 7.5, fill: DB.N }); y += 9;
    const H = y + PAD;
    // placed above the component, inside the view the camera is moving to; with no room above, beside it
    const V = CAMVB || M.FULL, sd = SIDE(), vx = V[0] + V[2] * sd, vy = V[1], vw = V[2] * (1 - sd), vh = V[3], mg = 10 * s, cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));   // the open area, right of the card
    let left = cl(a[0] + (o.dx || 0) * s - (W * s) / 2, vx + mg, vx + vw - mg - W * s), top = a[1] - (o.lift || 34) * s - H * s;
    if (top < vy + mg) { top = cl(a[1] - (H * s) / 2, vy + mg, vy + vh - mg - H * s); left = a[0] + 46 * s + W * s < vx + vw - mg ? a[0] + 46 * s : a[0] - 46 * s - W * s; }
    pos.setAttribute("transform", `translate(${left.toFixed(1)} ${top.toFixed(1)}) scale(${s.toFixed(3)})`);
    // the bubble: one square-cornered outline with its tail, from the edge nearest the component to the component
    const tip = [(a[0] - left) / s, (a[1] - top) / s], f = (q) => q.map((v) => v.toFixed(1)).join(",");
    let pts;
    if (tip[1] > H) { const bx = cl(tip[0], 30, W - 30); pts = [[0, 0], [W, 0], [W, H], [bx + 12, H], tip, [bx - 12, H], [0, H]]; }
    else if (tip[0] > W) { const by = cl(tip[1], 30, H - 30); pts = [[0, 0], [W, 0], [W, by - 12], tip, [W, by + 12], [W, H], [0, H]]; }
    else { const by = cl(tip[1], 30, H - 30); pts = [[0, 0], [W, 0], [W, H], [0, H], [0, by + 12], tip, [0, by - 12]]; }
    const sh = el("polygon", { points: pts.map((q) => f([q[0] + 3, q[1] + 4])).join(" "), fill: "#192238", opacity: 0.08 }), bg = el("polygon", { points: pts.map(f).join(" "), fill: DB.bg, stroke: DB.edge, "stroke-width": 1, "stroke-linejoin": "miter" });
    box.insertBefore(bg, body); box.insertBefore(sh, bg);
    tw(gsap.fromTo(box, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.45, delay: 0.7, ease: "power2.out" }));
    return g;
  }
  // a line chart: axes with ticks, series that draw themselves (again and again); the subtitle and legend go in the header
  const lineChart = (cfg) => { const fn = (g, W, H) => {
    const L = 34, R = W - 4, Tp = 6, B = H - 14, [y0, y1] = cfg.y, X = (i, n) => L + ((R - L) * i) / (n - 1), Y = (v) => B - ((v - y0) / (y1 - y0)) * (B - Tp);
    cfg.ticks.forEach((v) => { el("line", { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: DB.grid, "stroke-width": 0.8 }, g); T(g, L - 5, Y(v) + 3, String(v), { "font-size": 8.5, "text-anchor": "end" }); });
    cfg.x.forEach((lab, i) => lab !== "" && T(g, X(i, cfg.x.length), B + 11, lab, { "font-size": 8.5, "text-anchor": i === 0 ? "start" : i === cfg.x.length - 1 ? "end" : "middle" }));
    el("line", { x1: L, y1: B, x2: R, y2: B, stroke: DB.axis, "stroke-width": 1 }, g);
    if (cfg.band) el("rect", { x: L, y: Y(cfg.band[1]), width: R - L, height: Y(cfg.band[0]) - Y(cfg.band[1]), fill: DB.G, opacity: 0.1 }, g);
    (cfg.hlines || []).forEach(([v, col, lab]) => { el("line", { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: col, "stroke-width": 1.2, "stroke-dasharray": "4 3" }, g); if (lab) T(g, L + 3, Y(v) - 3, lab, { "font-size": 8, fill: col }); });
    cfg.series.forEach((sr, si) => {
      const n = sr.v.length, pts = sr.v.map((v, i) => [X(i, cfg.n || n), Y(v)]);
      if (sr.fill) el("polygon", { points: [[pts[0][0], B]].concat(pts, [[pts[pts.length - 1][0], B]]).map((q) => q.map((u) => u.toFixed(1)).join(",")).join(" "), fill: sr.col, opacity: 0.16 }, g);
      const pl = el("polyline", { points: pts.map((q) => q.map((u) => u.toFixed(1)).join(",")).join(" "), fill: "none", stroke: sr.col, "stroke-width": sr.w || 2.2, "stroke-dasharray": sr.dash ? "4 3" : null, "stroke-linejoin": "round", "stroke-linecap": "round" }, g);
      if (!sr.dash) { const len = pts.reduce((acc, q, i) => acc + (i ? Math.hypot(q[0] - pts[i - 1][0], q[1] - pts[i - 1][1]) : 0), 0);
        tw(gsap.fromTo(pl, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 2.0, delay: 1.0 + si * 0.25, ease: "power1.inOut", repeat: -1, repeatDelay: 2.0 })); }
    });
    (cfg.marks || []).forEach(([i, v, col, lab]) => { const q = [X(i, cfg.n || cfg.x.length), Y(v)]; const c = el("circle", { cx: q[0], cy: q[1], r: 4, fill: "none", stroke: col, "stroke-width": 1.6 }, g); if (lab) T(g, q[0] - 6, q[1] - 7, lab, { "font-size": 8, fill: col, "text-anchor": "end" }); tw(gsap.fromTo(c, { scale: 0.5, svgOrigin: `${q[0]} ${q[1]}` }, { scale: 1.4, duration: 0.7, repeat: -1, yoyo: true })); });
  }; fn.meta = { unit: cfg.unit, legend: cfg.series.map((sr) => [sr.name, sr.col, sr.dash]) }; return fn; };
  // a bar chart: labelled bars with their values, growing in (again and again)
  const barChart = (cfg) => { const fn = (g, W, H) => {
    const L = 34, R = W - 4, Tp = 14, B = H - 14, y1 = cfg.max, Y = (v) => B - (v / y1) * (B - Tp);
    cfg.ticks.forEach((v) => { el("line", { x1: L, y1: Y(v), x2: R, y2: Y(v), stroke: DB.grid, "stroke-width": 0.8 }, g); T(g, L - 5, Y(v) + 3, cfg.fmt ? cfg.fmt(v) : String(v), { "font-size": 8.5, "text-anchor": "end" }); });
    el("line", { x1: L, y1: B, x2: R, y2: B, stroke: DB.axis, "stroke-width": 1 }, g);
    const n = cfg.bars.length, slot = (R - L) / n, bw = Math.min(38, slot * 0.55);
    cfg.bars.forEach(([lab, v, col, vt], i) => {
      const x = L + slot * i + (slot - bw) / 2, r = el("rect", { x, width: bw, y: B, height: 0, fill: col }, g);
      T(g, x + bw / 2, B + 11, lab, { "font-size": 8.5, "text-anchor": "middle", fill: DB.text });
      const val = T(g, x + bw / 2, Y(v) - 4, vt || String(v), { "font-size": 9.5, "font-weight": 600, "text-anchor": "middle", fill: col, opacity: 0 });
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.4, delay: 1.0 + i * 0.25 });
      tl.fromTo(r, { attr: { y: B, height: 0 } }, { attr: { y: Y(v), height: B - Y(v) }, duration: 1.0, ease: "power2.out" }).to(val, { opacity: 1, duration: 0.3 }).to({}, { duration: 2.0 }).to([r, val], { opacity: 0.0, duration: 0.3 }).set([r, val], { opacity: 1 }).set(val, { opacity: 0 });
      tw(tl);
    });
  }; fn.meta = { unit: cfg.unit }; return fn; };
  // a log of events, each row appearing in turn
  const logList = (rows) => { const fn = (g, W, H) => {
    rows.forEach(([time, txt, col], i) => { const y = 11 + i * 24, r = el("g", { opacity: 0 }, g);
      el("rect", { x: 0, y: y - 10, width: W, height: 20, fill: DB.soft }, r); el("circle", { cx: 9, cy: y, r: 3.6, fill: col }, r);
      T(r, 19, y + 3.2, time, { "font-size": 8.5, fill: DB.N }); T(r, 50, y + 3.2, txt, { "font-size": 9, fill: DB.text });
      tw(gsap.to(r, { opacity: 1, duration: 0.3, delay: 1.0 + i * 0.7, repeat: -1, repeatDelay: rows.length * 0.7 + 2.0, yoyo: true })); });
  }; fn.h = rows.length * 24 - 2; fn.meta = { unit: "Control-room event log, overnight" }; return fn; };
  // meters on a street, each reporting a reading
  const meterGrid = (vals) => { const fn = (g, W, H) => {
    vals.forEach((v, i) => { const cw = (W - 18) / 4, c = i % 4, r = Math.floor(i / 4), x = c * (cw + 6), y = r * 48, b = el("g", null, g);
      el("rect", { x, y, width: cw, height: 42, fill: DB.soft, stroke: DB.grid }, b);
      T(b, x + cw / 2, y + 14, `Home ${i + 1}`, { "font-size": 8, fill: DB.N, "text-anchor": "middle" });
      T(b, x + cw / 2, y + 33, v.toFixed(1), { "font-size": 13, "font-weight": 600, "text-anchor": "middle", fill: v > 3 ? DB.O : DB.B });
      tw(gsap.fromTo(b, { opacity: 0.35 }, { opacity: 1, duration: 0.25, delay: 0.9 + ((i * 5) % vals.length) * 0.18, repeat: -1, repeatDelay: 2.6, yoyo: true })); });
  }; fn.h = 90; fn.meta = { unit: "Smart-meter readings this half-hour, kW (orange: above 3 kW)" }; return fn; };
  const HRS = ["00", "", "", "06", "", "", "12", "", "", "18", "", "", "24"];
  const IV = (id) => INTERVENTIONS.find((v) => v.id === id);
  const DASH = (id, at, draw, o) => bubble(IV(id), at, (MAP_L[id] || {}).zoom, draw, o);
  const CC = [14.8, 14.1];
  const FXS = {
    dlr: () => DASH("dlr", [13.4, 9.6, 3.6], lineChart({ unit: "Line rating, MW", y: [300, 650], ticks: [400, 500, 600], x: HRS, series: [{ v: [400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400, 400], col: DB.N, dash: true, name: "Fixed rating" }, { v: [470, 455, 450, 480, 520, 560, 590, 600, 585, 540, 500, 480, 470], col: DB.G, name: "Dynamic rating" }] }), { dx: -60 }),
    gets: () => DASH("gets", [12.25, 21.6, 0.8], barChart({ unit: "Loading of the busiest line, % of its limit", max: 110, ticks: [50, 100], bars: [["Before", 98, DB.N, "98%"], ["Main path after", 64, DB.G, "64%"], ["New second path", 58, DB.G, "58%"]] }), { dx: 70 }),
    predictive: () => { DASH("predictive", [18.4, 19.0, 1.2], lineChart({ unit: "Transformer hot-spot temperature, °C", y: [70, 120], ticks: [80, 100, 120], x: ["Day 1", "", "", "", "", "", "", "Day 30"], series: [{ v: [84, 85, 86, 88, 92, 97, 103, 108], col: DB.O, name: "Measured" }], hlines: [[110, DB.R, "Alarm"]], marks: [[7, 108, DB.R, "Crew sent"]] }), { dx: 70 });
      ripple(18.9, 19.4, "#EE7309", 1.0);
      const w = ink((gg) => { K.car(gg, -1.3, 22.62, "#F1F2F4", "x", 1.3); }); tw(gsap.fromTo(w, { x: 0, y: 0 }, { x: K.UX[0] * 17.6, y: K.UX[1] * 17.6, duration: 3.2, ease: "power2.out" }));
      const p = ink((gg) => K.person(gg, 19.2, 22.2, { idle: true, cap: "#EE7309", top: "#EE7309" })); tw(gsap.fromTo(p, { opacity: 0 }, { opacity: 1, delay: 3.2, duration: 0.4 })); },
    forecast: () => DASH("forecast", [17.0, 4.6, 4.0], lineChart({ unit: "Tomorrow's output, MW", y: [0, 200], ticks: [50, 100, 150], x: HRS, series: [{ v: [0, 0, 0, 5, 40, 95, 140, 160, 130, 70, 15, 0, 0], col: DB.Y, name: "Solar forecast" }, { v: [120, 135, 140, 110, 90, 70, 60, 75, 95, 120, 150, 160, 150], col: DB.G, name: "Wind forecast" }], marks: [[7, 160, DB.Y, ""]] }), { scale: 1.1 }),
    dispatch: () => DASH("dispatch", [CC[0], CC[1], 2.6], barChart({ unit: "Clean power wasted (curtailed), GWh a month", max: 14, ticks: [5, 10], bars: [["Hourly schedule", 12, DB.N, "12"], ["5-minute dispatch", 5, DB.G, "5"]] }), { dx: -50 }),
    vpp: () => DASH("vpp", [27.2, 27.6, 1.8], lineChart({ unit: "Local demand, MW", y: [400, 1050], ticks: [500, 750, 1000], x: ["12", "", "15", "", "18", "", "21", "", "24"], series: [{ v: [620, 640, 680, 760, 900, 1000, 940, 800, 650], col: DB.N, dash: true, name: "Without VPP" }, { v: [640, 670, 720, 790, 860, 900, 880, 790, 660], col: DB.O, name: "With VPP: peak 10% lower" }] }), { dx: 60, lift: 90 }),
    battery: () => DASH("battery", [27.8, 8.2, 1.0], lineChart({ unit: "Battery charge, %", y: [0, 100], ticks: [25, 50, 75, 100], x: HRS, series: [{ v: [30, 25, 20, 18, 30, 55, 80, 95, 95, 70, 40, 25, 20], col: DB.Y, fill: true, name: "Charge: fills at midday, empties at the evening peak" }] }), { dx: 30 }),
    flexplant: () => DASH("flexplant", [17.0, 4.6, 5.0], lineChart({ unit: "Output, MW", y: [0, 500], ticks: [100, 300, 500], x: HRS, series: [{ v: [300, 320, 280, 200, 120, 60, 40, 50, 120, 260, 380, 360, 320], col: DB.O, name: "Gas plant" }, { v: [150, 140, 160, 220, 320, 420, 460, 440, 330, 180, 90, 110, 140], col: DB.G, name: "Wind + solar" }] }), { dx: -30 }),
    conductors: () => DASH("conductors", [13.4, 9.6, 3.6], barChart({ unit: "Line capacity, MW", max: 1100, ticks: [500, 1000], bars: [["Existing wire", 500, DB.N, "500"], ["Advanced conductor", 1000, DB.B, "1,000"]] }), { dx: -60 }),
    twins: () => { DASH("twins", [CC[0], CC[1], 2.6], lineChart({ unit: "Feeder 12 loading, % of limit", y: [40, 120], ticks: [60, 80, 100], x: ["−6h", "", "", "Now", "", "", "+6h"], series: [{ v: [62, 66, 71, 78], col: DB.B, name: "Measured" }, { v: [78, 86, 97, 108, 104, 92, 80], col: DB.O, dash: true, name: "Model forecast" }], n: 7, hlines: [[100, DB.R, "Limit"]] }), { dx: -110 });
      const src = M.root.querySelector('[data-k="s1"]'); if (src) { const c = src.cloneNode(true), a = P(19.0, 17.0, 0), b = P(19.6, 13.0, 5.2), h = el("g", { transform: `translate(${(b[0] - a[0]).toFixed(1)} ${(b[1] - a[1]).toFixed(1)}) translate(${a[0]} ${a[1]}) scale(0.5) translate(${-a[0]} ${-a[1]})`, opacity: 0.9 }, M.fx);
        c.querySelectorAll("*").forEach((n) => { if (n.getAttribute("fill") && n.getAttribute("fill") !== "none") n.setAttribute("fill", "rgba(55,166,230,0.16)"); n.setAttribute("stroke", "#37A6E6"); }); h.appendChild(c);
        tw(gsap.fromTo(h, { opacity: 0 }, { opacity: 0.95, duration: 0.6, delay: 0.5 })); tw(gsap.to(c, { y: -5, duration: 1.6, repeat: -1, yoyo: true, ease: "sine.inOut" })); } },
    cyber: () => { DASH("cyber", [CC[0], CC[1], 3.0], logList([["03:12", "Login from unknown device: blocked", DB.R], ["03:14", "Unsigned command to substation: rejected", DB.R], ["03:15", "Operators alerted, keys rotated", DB.Y], ["03:20", "All control systems normal", DB.G]]), { dx: -90 });
      el("polygon", { points: ISO.pts(F.circle([14.6, 14.0, 0.05], "z", 3.0, 48)), fill: "rgba(32,55,114,0.08)", stroke: "#1E609C", "stroke-width": 2.4, "stroke-dasharray": "8 5" }, M.fx);
      el("path", { d: (() => { let d = ""; for (let i = 0; i <= 24; i++) { const an = Math.PI * i / 24, pp = P(14.6 + Math.cos(an) * 3.0 * 0.707, 14.0 - Math.cos(an) * 3.0 * 0.707, Math.sin(an) * 3.0); d += (i ? "L" : "M") + pp[0].toFixed(1) + " " + pp[1].toFixed(1); } return d; })(), fill: "rgba(32,55,114,0.06)", stroke: "#1E609C", "stroke-width": 1.6, opacity: 0.8 }, M.fx);
      for (let i = 0; i < 5; i++) { const ang = i * 1.3 + 0.6, s0 = P(14.6 + Math.cos(ang) * 8, 14.0 + Math.sin(ang) * 8, 3.4), s1 = P(14.6 + Math.cos(ang) * 3.2, 14.0 + Math.sin(ang) * 3.2, 2.0);
        const pk = el("rect", { x: -3.5, y: -3.5, width: 7, height: 7, fill: "#E04B00", transform: `translate(${s0[0]} ${s0[1]})` }, M.fx);
        tw(gsap.fromTo(pk, { attr: { transform: `translate(${s0[0]} ${s0[1]})` }, opacity: 1 }, { attr: { transform: `translate(${s1[0]} ${s1[1]})` }, duration: 1.4, delay: i * 0.5, repeat: -1, repeatDelay: 1.0, ease: "power1.in" }));
        tw(gsap.to(pk, { opacity: 0, duration: 0.3, delay: i * 0.5 + 1.25, repeat: -1, repeatDelay: 2.1 })); } },
    meters: () => DASH("meters", [27.2, 27.6, 1.8], meterGrid([0.8, 1.4, 3.6, 0.6, 2.2, 4.1, 1.1, 0.9]), { dx: 60, lift: 90 }),
    condensers: () => DASH("condensers", [14.4, 17.4, 0.9], lineChart({ unit: "Voltage after a fault, % of normal", y: [80, 105], ticks: [85, 90, 95, 100], x: ["0 s", "", "", "", "", "", "", "", "2 s"], series: [{ v: [100, 84, 88, 92, 94, 95, 96, 96, 97], col: DB.N, dash: true, name: "Without" }, { v: [100, 93, 97, 99, 100, 100, 100, 100, 100], col: DB.B, name: "With synchronous condenser" }] }), { dx: -60 }),
    fault: () => { DASH("fault", [37.2, 12.25, 0.8], lineChart({ unit: "Customers without power", y: [0, 1300], ticks: [400, 800, 1200], x: ["0", "", "10", "", "20", "", "30", "", "40", "", "50", "", "60 min"], series: [{ v: [1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 1200, 0], col: DB.N, dash: true, name: "Manual: ~1 hour" }, { v: [1200, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150, 150], col: DB.G, name: "Automatic: under 5 min" }] }), { dx: 0 }); spark(37.2, 12.25, 0.6); },
    adms: () => DASH("adms", [17.2, 21.6, 1.8], lineChart({ unit: "Voltage along the feeder, % of normal", y: [90, 110], ticks: [95, 100, 105], x: ["Substation", "", "", "", "", "", "End of line"], band: [95, 105], series: [{ v: [103, 104, 105, 106.5, 104, 99, 93.5], col: DB.N, dash: true, name: "Unmanaged" }, { v: [102, 102, 102.5, 103, 101.5, 99.5, 97.5], col: DB.B, name: "With ADMS" }] }), { dx: 40 }),
    island: () => { DASH("island", [16.6, 41.6, 1.6], lineChart({ unit: "Village supply, kW", y: [0, 300], ticks: [100, 200, 300], x: ["12", "", "14 outage", "", "16", "", "18", "", "20"], series: [{ v: [220, 220, 0, 0, 0, 0, 0, 0, 0], col: DB.N, name: "Grid" }, { v: [0, 0, 160, 150, 140, 90, 40, 10, 0], col: DB.G, name: "Solar" }, { v: [0, 0, 60, 70, 80, 130, 180, 200, 210], col: DB.Y, name: "Battery" }], marks: [[2, 0, DB.R, ""]] }), { dx: 120, lift: 120 });
      el("polygon", { points: ISO.pts(F.circle([16.6, 41.8, 0.05], "z", 5.4, 64)), fill: "rgba(19,206,116,0.1)", stroke: "#13CE74", "stroke-width": 3 }, M.fx); ripple(19.6, 38.8, "#E0A800", 0.8); },
    gfm: () => DASH("gfm", [27.8, 8.2, 1.0], lineChart({ unit: "Grid frequency after losing a plant, Hz", y: [49.2, 50.1], ticks: [49.4, 49.6, 49.8, 50], x: ["0 s", "", "", "", "", "", "", "", "10 s"], series: [{ v: [50, 49.55, 49.45, 49.5, 49.6, 49.7, 49.75, 49.8, 49.82], col: DB.N, dash: true, name: "Grid-following" }, { v: [50, 49.85, 49.82, 49.86, 49.9, 49.93, 49.95, 49.96, 49.97], col: DB.B, name: "Grid-forming" }] }), { dx: 30 }),
    supercon: () => { DASH("supercon", [30.0, 12.25, 0.8], barChart({ unit: "Power through one corridor, MW", max: 5500, ticks: [2500, 5000], fmt: (v) => v.toLocaleString("en-GB"), bars: [["Copper cable", 500, DB.N, "500"], ["Superconducting", 5000, DB.B, "5,000"]] }), { dx: -20 });
      const Tc = M.tubes.city, d = "M" + Tc.pts.map((q) => q[0].toFixed(1) + " " + q[1].toFixed(1)).join(" L");
      const h = el("path", { d, fill: "none", stroke: "#97CCED", "stroke-width": 34, "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0.25 }, M.fx); M.fx.insertBefore(h, M.fx.firstChild);
      tw(gsap.to(h, { opacity: 0.45, duration: 1.2, repeat: -1, yoyo: true, ease: "sine.inOut" })); },
    hvdcbreaker: () => { DASH("hvdcbreaker", [8.6, 10.25, 0.8], barChart({ unit: "Wind power lost after one fault, MW", max: 2200, ticks: [1000, 2000], fmt: (v) => v.toLocaleString("en-GB"), bars: [["No DC breaker", 2000, DB.N, "2,000"], ["With DC breaker", 300, DB.B, "300"]] }), { dx: -50 }); spark(8.6, 10.25, 0.6); },
    substations: () => { DASH("substations", [26.4, 16.4, 1.0], barChart({ unit: "Spare capacity to connect, MW", max: 260, ticks: [100, 200], bars: [["Before", 20, DB.N, "20"], ["New substation", 220, DB.O, "220"]] }), { dx: 50 }); ripple(26.4, 16.4, "#EE7309", 1.2); },
    lines: () => DASH("lines", [5.0, 39.8, 4.0], lineChart({ unit: "Power delivered from the new zone, MW", y: [0, 900], ticks: [300, 600, 900], x: ["Yr 1", "", "Yr 3", "", "Yr 5", "", "Yr 7"], series: [{ v: [0, 0, 0, 150, 450, 700, 800], col: DB.O, name: "New line in service from year 4" }] }), { dx: 60 }),
    hvdc: () => DASH("hvdc", [22.6, 22.8, 20.6], barChart({ unit: "Losses over 1,000 km, % of power sent", max: 12, ticks: [5, 10], bars: [["AC line", 10, DB.N, "10%"], ["HVDC", 6.5, DB.B, "6.5%"]] }), { scale: 1.2 }),
    interconnect: () => DASH("interconnect", [41.0, 40.2, 1.8], lineChart({ unit: "Flow across the border, MW (+ export, − import)", y: [-400, 400], ticks: [-300, 0, 300], x: HRS, series: [{ v: [-250, -280, -260, -150, 50, 220, 320, 300, 180, -20, -180, -240, -260], col: DB.O, fill: false, name: "Exports at midday sun, imports at night" }] }), { dx: -40 })
  };
  const GRN = "#109553", BLU = "#1E609C", ORG = "#EE7309", YEL = "#E0A800", RED = "#E04B00";
  function runFx(iv) { fxClear(); if (iv && FXS[iv.id]) FXS[iv.id](); }

  // section K: the whole city, offset to the right and down like the town in section A, under K's text on the left
  function kview(dur) {
    if (!M) return; fxClear(); M.focus(null); M.set({});
    pins.forEach((p) => gsap.to(p, { scale: 0, opacity: 0, duration: 0.3, overwrite: "auto" }));
    const [fx, fy, fw, fh] = M.FULL, r = M.svg.getBoundingClientRect(), asp = r.width > 0 ? r.height / r.width : 0.6;
    const w = fw / 0.74, h = w * asp, cx = fx + fw / 2, cy = fy + fh / 2;
    const vb = [cx - 0.71 * w, cy - 0.57 * h, w, h]; CAMVB = vb;
    gsap.to(M.svg, { attr: { viewBox: vb.map((v) => v.toFixed(1)).join(" ") }, duration: dur == null ? 1.1 : dur, ease: "power2.inOut", overwrite: "auto" });
  }
  window.GRIDMAP = { build: buildL, apply, kview };

  // ---------- the modern grid (Act 3): the same city as its own picture, stepped from the old grid to the modern one ----------
  // Each step is a whole state (so scrolling either way lands on the same picture): which pipes run and what they carry,
  // which fittings are on them, what is in colour, and where the camera looks.
  let MM = null;
  const DIST = ["trunk", "city", "street", "homesA", "ind", "village", "farm", "hub", "homesB", "flats"];   // the pipes out to everyone
  const SENSE = ["predictive", "forecast", "dispatch", "meters", "twins", "adms", "fault", "vpp", "gfm"];   // sensors and controls on the pipes
  const FLEX = ["homesA", "homesB", "ind", "farm", "flats"];
  const MODERN = {
    intro: { old: true },
    old: { old: true, lit: ["gas", "s1"], boost: ["old", "trunk", "city"] },
    everywhere: { lit: ["wind", "solar", "homesA", "homesB", "farm", "ind", "shops", "batt"], boost: ["wind", "solar"] },
    both: { flexSet: FLEX, lit: FLEX, at: [20, 26], zoom: 2100 },
    smart: { flexSet: FLEX, lit: ["hub", "homesB", "homesA"], boost: ["hub", "homesB"], at: [19, 23], zoom: 1500 },
    batteries: { flexSet: ["homesB", "farm"], store: ["solar", "trunk", "farm", "hub", "homesB"], lit: ["batt", "dc", "farm", "zone", "hub", "homesB"] },
    sensors: { sense: true, lit: ["cc", "s1"].concat(SENSE.map((v) => "ctl-" + v)), at: [21, 17], zoom: 2300 },
    wires: { sense: true, wires: true, lit: ["grid", "wind", "solar", "s1", "ctl-dlr"], boost: ["wind", "solar", "trunk"], at: [19, 9], zoom: 1900 },
    more: { sense: true, wires: true, more: true, all: true },
    connect: { sense: true, wires: true, more: true, connect: true, lit: ["zone", "nsub", "dc", "wind", "solar", "homesB", "ind", "shops", "flats"], boost: ["zone", "nsub"] },
    queues: { sense: true, wires: true, more: true, connect: true, all: true },
    modern: { sense: true, wires: true, more: true, connect: true, flexSet: ["homesB"] }
  };
  // index2/index3: extra states for the new script's cards (index.html does not use them)
  Object.assign(MODERN, {
    resilient: { flexSet: FLEX, lit: ["wind", "solar", "homesA", "homesB", "farm", "ind", "shops", "flats", "batt", "hub", "village", "dc"] },
    smart2: Object.assign({}, MODERN.smart, { sense: true }),
    batteries2: Object.assign({}, MODERN.batteries, { sense: true }),
    better: { sense: true, all: true, flexSet: FLEX },
    dlr: { sense: true, dlr: true, lit: ["grid", "wind", "solar", "s1", "ctl-dlr"], at: [19, 9], zoom: 1900 }
  });
  function buildModern(svgEl) {
    while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);
    const tubes = TUBES_L.map((t) => Object.assign({}, t));   // its own copies: a pipe's kind changes with the step here
    MM = make(svgEl, { city4: true, tubes, sleeves: SLEEVE, thickTubes: ["wind", "solar", "trunk", "city"] });
  }
  const kindOf = (T) => T.def.kind0 || (T.def.kind0 = T.def.kind);
  function setKind(T, kind) { if (!T || T.def.kind === kind) return; T.def.kind = kind;
    gsap.to(T.core, { attr: { stroke: COL[kind] }, duration: 0.5, overwrite: "auto" }); (T.stubs || []).forEach((S) => gsap.to(S.core, { attr: { stroke: COL[kind] }, duration: 0.5, overwrite: "auto" })); }
  function modernStep(name, dur) {
    if (!MM) return; const s = MODERN[name] || MODERN.modern, T = MM.tubes;
    Object.values(T).forEach(kindOf);
    // the old grid: one gas plant, fossil power out along every pipe; the modern grid: clean power from everywhere
    ["wind", "solar"].forEach((t) => MM.build(t, !s.old));
    ["old"].concat(DIST).forEach((t) => T[t] && setKind(T[t], s.old ? "fossil" : kindOf(T[t])));
    MM.build("zone", !!s.connect); MM.build("nsub", !!s.connect); MM.show("nsub", !!s.connect);
    // sensors and controls, smarter wires
    Object.entries(MM.sats.fits || {}).forEach(([id, gs]) => { const on = (s.sense && SENSE.includes(id)) || ((s.wires || s.dlr) && id === "dlr"); gsap.to(gs, { opacity: on ? 1 : 0, duration: 0.5, overwrite: "auto" }); });
    Object.entries(MM.sleeves).forEach(([id, gs]) => { const on = (s.wires && id === "conductors") || (s.more && id === "supercon"); gsap.to(gs, { opacity: on ? 1 : 0, duration: 0.5, overwrite: "auto" }); });
    MM.thicken(new Set(s.wires ? (s.more ? ["wind", "solar", "trunk", "city"] : ["wind", "solar", "trunk"]) : []));
    MM.set({ boost: s.boost || null, all: !!s.all, flexSet: s.flexSet ? new Set(s.flexSet) : null, storage: !!s.store, storeSet: s.store ? new Set(s.store) : null });
    MM.focus(s.lit || null);
    camera(s.at || null, s.zoom || 0, dur, MM);
  }
  window.GRIDMODERN = { build: buildModern, step: modernStep };


  // ---------- the signs on the cards of K and L, in the same perspective as the signs in the town ----------
  function isoSignSVG(cat, iconName, o) {
    // the face fills most of the box: a short post below it and a soft shadow, as if the sign stands just in front of you
    // (o.post === false: the sign alone, for the cards of section L)
    const post = !(o && o.post === false);
    const s = el("svg", { viewBox: post ? "4 2 86 138" : "6 2 84 128", class: "sign sign--iso" + (post ? "" : " sign--bare"), "aria-hidden": "true" });
    const m = 0.82, cx = 44, cy = 66, c = Math.cos(Math.PI / 6), sn = 0.5;
    if (post) {
      el("ellipse", { cx: cx + 5, cy: 134, rx: 14, ry: 4.5, fill: "#1E2433", opacity: 0.16 }, s);
      el("path", { d: `M${cx + 3} ${cy + 40} L${cx + 7} ${cy + 38} L${cx + 7} 134 L${cx + 3} 136 Z`, fill: "#737D92" }, s);   // the post: two faces
      el("path", { d: `M${cx - 1} ${cy + 38} L${cx + 3} ${cy + 40} L${cx + 3} 136 L${cx - 1} 134 Z`, fill: "#9AA3B5" }, s);
    }
    const mx = (dx, dy) => `matrix(${(c * m).toFixed(3)} ${(sn * m).toFixed(3)} 0 ${m} ${cx + dx} ${cy + dy})`;
    const back = el("g", { transform: mx(3.4, -2.0) }, s); signGroup(cat, iconName, 0, 0, 100, back);
    back.querySelectorAll("*").forEach((n) => { ["fill", "stroke"].forEach((a) => { const v = n.getAttribute(a); if (v && v !== "none") n.setAttribute(a, "#4A546A"); }); });
    const front = el("g", { transform: mx(0, 0) }, s); signGroup(cat, iconName, 0, 0, 100, front);
    return s;
  }

  // ---------- K: the preview beside the title, cycling with the ladder ----------
  function buildK() {
    const svgK = document.getElementById("kgrid"); if (!svgK) return;
    const G = make(svgK, { ink: 1.6 });
    if (window.ISO_OUTLINE) ISO_OUTLINE(svgK);
    const rungs = [...document.querySelectorAll(".ladder__rung")], ladder = document.querySelector(".ladder");
    const STATES = [
      () => { G.thicken(new Set()); ["nsub", "flags"].forEach((s) => G.show(s, false)); ["nsub", "inter", "hvdc"].forEach((t) => G.build(t, false)); G.set({ all: true }); },
      () => { G.thicken(new Set(["main", "city", "feeder"])); ["nsub", "flags"].forEach((s) => G.show(s, false)); ["nsub", "inter", "hvdc"].forEach((t) => G.build(t, false)); G.set({}); },
      () => { G.thicken(new Set(["main", "city", "feeder"])); ["nsub", "flags"].forEach((s) => G.show(s, true)); ["nsub", "inter", "hvdc"].forEach((t) => G.build(t, true)); G.set({}); }
    ];
    let i = -1, timer = null, held = false;
    const go = (n) => { i = n; rungs.forEach((r, k) => r.classList.toggle("is-on", k === n)); if (ladder) ladder.classList.add("is-cycling"); STATES[n](); };
    const cycle = () => { if (!held) go((i + 1) % 3); };
    rungs.forEach((r, k) => { r.addEventListener("mouseenter", () => { held = true; go(k); }); r.addEventListener("mouseleave", () => { held = false; }); });
    ScrollTrigger.create({ trigger: svgK, start: "top 85%", end: "bottom top",
      onToggle: (self) => { clearInterval(timer); if (self.isActive) { go(0); timer = setInterval(cycle, 3600); } } });
  }
  buildK();
  window.ISOGRID = { make, MAP, TUBES, MAP_L, TUBES_L, signSVG: isoSignSVG };
})();
