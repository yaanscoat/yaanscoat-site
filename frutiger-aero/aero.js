/*
  aero.js - extra stuff for the frutiger aero site only:
  1. the fish bowl: two clownfish swim around and jump out of the water and back in
  2. sparkles that follow your mouse, like every 2008 website had
  both stay still for people who turned on "reduce motion".
*/

const stillPlease = matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("DOMContentLoaded", () => {
  const bowl = document.querySelector(".fishbowl");
  if (bowl) startFishBowl(bowl);
  if (!stillPlease) startSparkles();
});

// ---------------------------------------------------------------------
// the fish bowl
// ---------------------------------------------------------------------

function startFishBowl(box) {
  const NS = "http://www.w3.org/2000/svg";
  const CX = 110; // middle of the bowl
  const CY = 118;
  const R = 72; // size of the bowl
  const WATER = 80; // height of the water surface (smaller = higher)
  const RIM_LEFT = 82; // the opening at the top
  const RIM_RIGHT = 138;

  box.innerHTML = `
    <svg viewBox="0 0 220 200" aria-hidden="true">
      <defs>
        <clipPath id="bowl-inside"><path d="M 80 52 A 72 72 0 1 0 140 52 Z" /></clipPath>
        <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#7fdcff" stop-opacity="0.85" />
          <stop offset="1" stop-color="#1b86d4" stop-opacity="0.9" />
        </linearGradient>
        <radialGradient id="glass" cx="0.35" cy="0.35" r="0.75">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.25" />
          <stop offset="1" stop-color="#bfe9ff" stop-opacity="0.08" />
        </radialGradient>
      </defs>
      <ellipse cx="110" cy="192" rx="56" ry="6" fill="#0a3a5c" opacity="0.25" />
      <g clip-path="url(#bowl-inside)">
        <path class="water" fill="url(#water)" />
        <g fill="#f3e3b5" stroke="#d8c38a" stroke-width="0.6">
          <circle cx="62" cy="180" r="9" /><circle cx="78" cy="186" r="8" /><circle cx="94" cy="183" r="9" />
          <circle cx="110" cy="188" r="8" /><circle cx="126" cy="184" r="9" /><circle cx="142" cy="187" r="8" />
          <circle cx="157" cy="181" r="9" /><circle cx="70" cy="190" r="7" /><circle cx="150" cy="192" r="7" />
        </g>
        <path class="weed" d="M 70 180 C 64 160, 78 150, 70 128 C 66 118, 74 112, 72 104" fill="none" stroke="#3ea52a" stroke-width="5" stroke-linecap="round" />
        <path class="weed" d="M 150 182 C 158 164, 144 154, 152 136" fill="none" stroke="#5cc43a" stroke-width="4" stroke-linecap="round" />
        <g class="bubbles"></g>
      </g>
      <g class="fishes"></g>
      <g class="drops" fill="#9fe0ff" stroke="#ffffff" stroke-width="0.5"></g>
      <path d="M 80 52 A 72 72 0 1 0 140 52" fill="url(#glass)" stroke="#e8f8ff" stroke-width="2.5" />
      <ellipse cx="110" cy="52" rx="30" ry="5" fill="none" stroke="#ffffff" stroke-width="2.5" opacity="0.9" />
      <path d="M 52 96 A 64 64 0 0 1 82 62" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.65" />
      <path d="M 48 120 A 64 64 0 0 1 50 108" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.5" />
    </svg>`;

  const svg = box.querySelector("svg");
  const water = svg.querySelector(".water");
  const fishLayer = svg.querySelector(".fishes");
  const dropLayer = svg.querySelector(".drops");
  const bubbleLayer = svg.querySelector(".bubbles");
  const rand = (a, b) => a + Math.random() * (b - a);

  // a clownfish facing right, drawn around (0, 0)
  function makeFish(scale) {
    const g = document.createElementNS(NS, "g");
    g.innerHTML = `
      <g class="body" transform="scale(${scale})">
        <path class="tail" d="M -10 0 L -18 -7 L -16 0 L -18 7 Z" fill="#ff7a1a" stroke="#222" stroke-width="0.8" />
        <ellipse cx="0" cy="0" rx="12" ry="7" fill="#ff7a1a" stroke="#222" stroke-width="0.8" />
        <path d="M -6 -6.5 Q -3 0 -6 6.5 L -3 6.8 Q 0 0 -3 -6.8 Z" fill="#fff" stroke="#222" stroke-width="0.6" />
        <path d="M 3 -6.6 Q 6 0 3 6.6 L 6 5.8 Q 8.5 0 6 -5.8 Z" fill="#fff" stroke="#222" stroke-width="0.6" />
        <path d="M -2 -7 Q 2 -11 6 -6" fill="#ff7a1a" stroke="#222" stroke-width="0.7" />
        <circle cx="8" cy="-1.5" r="1.6" fill="#111" />
        <circle cx="8.5" cy="-2" r="0.5" fill="#fff" />
      </g>`;
    fishLayer.append(g);
    return g;
  }

  // a random spot inside the water, away from the glass
  function spotInWater() {
    for (;;) {
      const y = rand(WATER + 12, CY + R - 22);
      const half = Math.sqrt(R * R - (y - CY) ** 2) - 18;
      if (half > 10) return { x: rand(CX - half, CX + half), y };
    }
  }

  const fishes = [makeFish(1), makeFish(0.85)].map((el, i) => {
    const start = spotInWater();
    return { el, x: start.x, y: start.y, vx: 0, vy: 0, facing: 1, target: spotInWater(), mode: "swim", nextJump: performance.now() + 2500 + i * 3500, jump: null, wiggle: rand(0, 6) };
  });

  const drops = [];
  const ripples = [];
  const bubbles = [];

  function splash(x) {
    for (let i = 0; i < 9; i++) {
      const el = document.createElementNS(NS, "circle");
      el.setAttribute("r", rand(1, 2.4));
      dropLayer.append(el);
      drops.push({ el, x, y: WATER, vx: rand(-1.4, 1.4), vy: rand(-3.2, -1.4) });
    }
    ripples.push({ x, size: 2, life: 1 });
  }

  function drawWater(t) {
    // the surface wobbles, more where a fish just splashed
    let d = `M 0 200 L 0 ${WATER}`;
    for (let x = 0; x <= 220; x += 6) {
      let y = WATER + Math.sin(x / 14 + t / 500) * 1.4;
      for (const r of ripples) y += Math.sin((x - r.x) / 4 - r.size) * 3 * r.life * Math.max(0, 1 - Math.abs(x - r.x) / (r.size * 4 + 10));
      d += ` L ${x} ${y.toFixed(2)}`;
    }
    water.setAttribute("d", d + " L 220 200 Z");
  }

  function placeFish(f, angle) {
    const flip = f.facing < 0 ? -1 : 1;
    f.el.setAttribute("transform", `translate(${f.x.toFixed(2)} ${f.y.toFixed(2)}) rotate(${angle.toFixed(1)}) scale(${flip} 1)`);
  }

  // with "reduce motion" on, draw everything once and stop
  if (stillPlease) {
    drawWater(0);
    fishes.forEach((f, i) => {
      f.facing = i ? -1 : 1;
      placeFish(f, 0);
    });
    return;
  }

  let last = performance.now();
  function frame(now) {
    if (!box.isConnected) return;
    requestAnimationFrame(frame);
    const step = Math.min(now - last, 50) / 16.67;
    last = now;
    if (document.hidden) return;

    for (const f of fishes) {
      f.wiggle += 0.25 * step;
      const tail = f.el.querySelector(".tail");

      if (f.mode === "swim") {
        // swim towards the target, then pick a new one
        const dx = f.target.x - f.x;
        const dy = f.target.y - f.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 4) f.target = spotInWater();
        f.vx += (dx / (dist || 1)) * 0.05 * step;
        f.vy += (dy / (dist || 1)) * 0.05 * step;
        f.vx *= 0.95;
        f.vy *= 0.95;
        f.x += f.vx * step;
        f.y += f.vy * step;
        if (Math.abs(f.vx) > 0.05) f.facing = Math.sign(f.vx);
        placeFish(f, Math.max(-20, Math.min(20, f.vy * 18)) * f.facing);
        tail.setAttribute("transform", `rotate(${Math.sin(f.wiggle) * 12} -10 0)`);

        // time to jump: swim up under the opening first
        if (now > f.nextJump) {
          f.mode = "rise";
          f.target = { x: rand(RIM_LEFT + 6, RIM_RIGHT - 6), y: WATER + 8 };
        }
      } else if (f.mode === "rise") {
        const dx = f.target.x - f.x;
        const dy = f.target.y - f.y;
        f.x += dx * 0.06 * step;
        f.y += dy * 0.06 * step;
        if (Math.abs(dx) > 0.3) f.facing = Math.sign(dx);
        placeFish(f, -25 * f.facing);
        tail.setAttribute("transform", `rotate(${Math.sin(f.wiggle * 1.8) * 18} -10 0)`);
        if (Math.hypot(dx, dy) < 2) {
          // leap! out of the water, over the rim, and back in somewhere under the opening
          const landX = Math.max(RIM_LEFT + 4, Math.min(RIM_RIGHT - 4, f.x + f.facing * rand(18, 34)));
          f.jump = { x0: f.x, x1: landX, start: now, length: rand(900, 1200), height: rand(56, 72) }; // how high it leaps
          f.facing = Math.sign(landX - f.x) || f.facing;
          f.mode = "jump";
          splash(f.x);
        }
      } else if (f.mode === "jump") {
        const j = f.jump;
        const t = Math.min(1, (now - j.start) / j.length);
        const x = j.x0 + (j.x1 - j.x0) * t;
        const y = WATER + 4 - j.height * 4 * t * (1 - t);
        const angle = (Math.atan2(y - f.y, x - f.x || 0.001) * 180) / Math.PI;
        f.x = x;
        f.y = y;
        placeFish(f, f.facing < 0 ? angle - 180 : angle); // a left-facing fish is drawn flipped, so turn it the other way round
        tail.setAttribute("transform", `rotate(${Math.sin(f.wiggle * 2.5) * 22} -10 0)`);
        if (t >= 1) {
          splash(f.x);
          f.mode = "swim";
          f.vy = 1.5;
          f.target = spotInWater();
          f.nextJump = now + rand(4000, 9000);
        }
      }
    }

    // flying water drops
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];
      d.vy += 0.15 * step;
      d.x += d.vx * step;
      d.y += d.vy * step;
      if (d.y > WATER + 2 && d.vy > 0) {
        d.el.remove();
        drops.splice(i, 1);
        continue;
      }
      d.el.setAttribute("cx", d.x.toFixed(1));
      d.el.setAttribute("cy", d.y.toFixed(1));
    }

    // ripples fade away
    for (let i = ripples.length - 1; i >= 0; i--) {
      ripples[i].size += 0.4 * step;
      ripples[i].life -= 0.015 * step;
      if (ripples[i].life <= 0) ripples.splice(i, 1);
    }

    // little air bubbles from the gravel
    if (Math.random() < 0.03 * step) {
      const el = document.createElementNS(NS, "circle");
      el.setAttribute("r", rand(1, 2.2));
      el.setAttribute("fill", "none");
      el.setAttribute("stroke", "#ffffff");
      el.setAttribute("stroke-width", "0.7");
      bubbleLayer.append(el);
      bubbles.push({ el, x: rand(70, 150), y: 178 });
    }
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.y -= 0.6 * step;
      b.x += Math.sin(b.y / 6) * 0.2;
      if (b.y < WATER + 2) {
        b.el.remove();
        bubbles.splice(i, 1);
        continue;
      }
      b.el.setAttribute("cx", b.x.toFixed(1));
      b.el.setAttribute("cy", b.y.toFixed(1));
    }

    drawWater(now);
  }
  requestAnimationFrame(frame);

  // tapping the glass makes them panic (you were warned)
  box.addEventListener("click", () => {
    for (const f of fishes) {
      if (f.mode !== "swim") continue;
      f.target = spotInWater();
      f.vx += rand(-3, 3);
      f.vy += rand(-2, 2);
    }
  });
}

// ---------------------------------------------------------------------
// sparkles that follow the mouse
// ---------------------------------------------------------------------

function startSparkles() {
  const colors = ["#5cc8ff", "#9be36f", "#ffffff", "#ffd23f", "#ff9ad5"];
  let lastSparkle = 0;
  document.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const now = performance.now();
    if (now - lastSparkle < 40) return;
    lastSparkle = now;
    const s = document.createElement("span");
    s.className = "sparkle";
    s.style.left = `${e.clientX + (Math.random() * 10 - 5)}px`;
    s.style.top = `${e.clientY + (Math.random() * 10 - 5)}px`;
    s.style.setProperty("--c", colors[Math.floor(Math.random() * colors.length)]);
    document.body.append(s);
    s.addEventListener("animationend", () => s.remove());
    setTimeout(() => s.remove(), 1000); // just in case
  });
}
