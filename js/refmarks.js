/* TEMPORARY review markers — remove this file and its <script> tag when cleaning up.
   Every section gets a letter (A, B, C…), every scroll step a number (C1, C2…).
   A small pill in the bottom-left corner always shows where you are. */
(function () {
  const css = `
  .refmark { position: absolute; top: 6px; right: 6px; z-index: 5; font: 600 11px/1 "Poppins", sans-serif; letter-spacing: .04em;
    color: #626E88; background: #FFFFFF; border: 1px dashed #B0B7C6; border-radius: 3px; padding: 3px 5px; pointer-events: none; }
  .refpin { position: sticky; top: calc(var(--topbar, 64px) + 10px); height: 0; z-index: 30; pointer-events: none; }
  .refmark--section { position: absolute; top: 0; left: 10px; right: auto; font-size: 14px; color: #FFFFFF; background: #192238; border: 0; padding: 5px 9px; }
  .refmark--step { position: relative; top: auto; right: auto; display: inline-block; margin-bottom: 6px; }
  .refmark--float { position: absolute; top: auto; bottom: 12vh; left: clamp(16px, 5vw, 80px); right: auto; }
  .refpill { position: fixed; left: 12px; bottom: 12px; z-index: 60; font: 600 13px/1 "Poppins", sans-serif; color: #FFFFFF;
    background: #3E4860; border-radius: 3px; padding: 7px 10px; opacity: .85; pointer-events: none; }
  .card, .gcard, .headline, .eralabel { position: relative; }`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const sections = [...document.querySelectorAll("main > section, main > .kl > section")];   // K and L sit inside .kl (their shared pinned picture)
  const marks = [];
  let li = 0;
  sections.forEach((sec, i) => {
    const L = sec.dataset.refname || letters[li++] || "Z" + i;   // a provisional section can name itself (data-refname="GX") without shifting the letters after it
    sec.dataset.ref = L;
    if (getComputedStyle(sec).position === "static") sec.style.position = "relative";
    // the section letter stays pinned top-left for as long as the section is on screen
    const pin = document.createElement("div"); pin.className = "refpin";
    const sb = document.createElement("span"); sb.className = "refmark refmark--section"; sb.textContent = L;
    pin.appendChild(sb); sec.insertBefore(pin, sec.firstChild);
    const pl = parseFloat(getComputedStyle(sec).paddingLeft) || 0; if (pl) pin.style.marginLeft = -pl + "px";   // hug the screen edge, clear of headings
    marks.push([sec, L]);
    const steps = sec.querySelectorAll(".step, .gstep");
    steps.forEach((step, k) => {
      const tag = `${L}${k + 1}`;
      step.dataset.ref = tag;
      const box = step.querySelector(".card, .gcard, .headline, .eralabel");
      const b = document.createElement("span");
      b.textContent = tag;
      if (box) { b.className = "refmark refmark--step"; box.insertBefore(b, box.firstChild); }
      else { b.className = "refmark refmark--float"; step.style.position = "relative"; step.appendChild(b); }
      marks.push([step, tag]);
    });
  });

  // live "you are here" pill
  const pill = document.createElement("div"); pill.className = "refpill"; document.body.appendChild(pill);
  function update() {
    const mid = window.innerHeight * 0.5;
    let cur = "A";
    for (const [node, tag] of marks) {
      const r = node.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) cur = tag; // steps come after their section, so the finest match wins
    }
    pill.textContent = cur;
  }
  window.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update); update();
  window.addEventListener("load", () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); update(); });
})();
