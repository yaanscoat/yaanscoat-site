/*
  seasons.js - the calendar for all my seasonal websites.

  the landing page (index.html next to this file) uses it to pick the site for today,
  and every seasonal site uses it for its colours, greeting and falling-stuff effect.

  to change when something shows up, edit SEASONS below.
  festive times are checked first (top to bottom), then the four seasons.
*/

// i'm in australia, so summer is in december. change to "north" to flip the seasons.
const HEMISPHERE = "south";

// when it isn't a festive time: true = show the season's site, false = show the all-time site
const USE_SEASONS = true;

const SEASONS = [
  // ---------- festive times ----------
  {
    id: "new-year",
    name: "new year",
    kind: "festive",
    when: "27 dec – 5 jan",
    inRange: (d) => (d.month === 12 && d.day >= 27) || (d.month === 1 && d.day <= 5),
    greeting: "happy new year!",
    about: "a giant brutalist poster with a countdown to next year.",
    colors: ["#ffd166", "#ff6fae", "#7ae7ff", "#ffffff"],
    paw: "#8f88c9",
    effect: "confetti",
  },
  {
    id: "christmas",
    name: "christmas",
    kind: "festive",
    when: "1 – 26 dec",
    inRange: (d) => d.month === 12 && d.day <= 26,
    greeting: "merry christmas!",
    about: "an old teletext tv page, with snow (even though it's summer here).",
    colors: ["#ffffff", "#f2d27a", "#e5484d", "#9fd8b0"],
    paw: "#7fa58e",
    effect: "snow",
  },
  {
    id: "valentines",
    name: "valentine's day",
    kind: "festive",
    when: "7 – 14 feb",
    inRange: (d) => d.month === 2 && d.day >= 7 && d.day <= 14,
    greeting: "happy valentine's day <3",
    about: "the whole site is a texting app on a phone.",
    colors: ["#ff5c8a", "#ff9ab8", "#ffd1de", "#ffffff"],
    paw: "#c07a92",
    effect: "hearts",
  },
  {
    // not really a holiday, but it's my favourite look. valentine's (above) still wins on 7 - 14 feb
    id: "frutiger-aero",
    name: "frutiger aero",
    kind: "festive",
    when: "30 jan – end of feb",
    inRange: (d) => (d.month === 1 && d.day >= 30) || d.month === 2,
    greeting: "welcome to the future! (it's 2008)",
    about: "a 2008 indie site with blinkies, a fish bowl and a sparkly cursor.",
    colors: ["#ffffff", "#bfe9ff", "#5cc8ff", "#9be36f"],
    paw: "#ffffff",
    effect: "bubbles",
  },
  {
    id: "easter",
    name: "easter",
    kind: "festive",
    when: "the week before easter, to easter monday",
    inRange: (d) => {
      const sunday = easterSunday(d.year);
      const start = addDays(sunday, -9); // the friday a week before good friday
      const end = addDays(sunday, 1); // easter monday
      return d.date >= start && d.date <= end;
    },
    greeting: "happy easter!",
    about: "a 1998 geocities homepage, under construction forever.",
    colors: ["#b8a1ff", "#ffd6a5", "#a0e7c8", "#ffb3c7"],
    paw: "#9a92b8",
    effect: "eggs",
  },
  {
    id: "halloween",
    name: "halloween",
    kind: "festive",
    when: "1 – 31 oct",
    inRange: (d) => d.month === 10,
    greeting: "happy halloween!",
    about: "the spooky one.",
    colors: ["#f2a65e", "#ffd6a8", "#f7eadc"],
    effect: "none",
  },

  // ---------- seasons (months flip if HEMISPHERE is "north") ----------
  {
    id: "summer",
    name: "summer",
    kind: "season",
    months: [12, 1, 2],
    greeting: "happy summer!",
    about: "an 8-bit beach video game.",
    colors: ["#ffcf6b", "#ffb347", "#fff1c1", "#7fe0d4"],
    paw: "#5f8f8a",
    effect: "fireflies",
  },
  {
    id: "autumn",
    name: "autumn",
    kind: "season",
    months: [3, 4, 5],
    greeting: "happy autumn!",
    about: "an old newspaper, the yaanscoat gazette.",
    colors: ["#e07b39", "#c9472b", "#f2b44f", "#a8582a"],
    paw: "#8f6a4c",
    effect: "leaves",
  },
  {
    id: "winter",
    name: "winter",
    kind: "season",
    months: [6, 7, 8],
    greeting: "stay warm!",
    about: "a computer terminal on a cold server.",
    colors: ["#ffffff", "#cfe8ff", "#9fd3ff", "#e8f0fa"],
    paw: "#7a8ea8",
    effect: "snow",
  },
  {
    id: "spring",
    name: "spring",
    kind: "season",
    months: [9, 10, 11],
    greeting: "happy spring!",
    about: "a scrapbook with sticky notes and polaroids.",
    colors: ["#f6a6c1", "#ffd1e0", "#ffffff", "#b7e3a1"],
    paw: "#8aa07c",
    effect: "petals",
  },

  // ---------- the normal one ----------
  {
    id: "all-time",
    name: "all-time",
    kind: "always",
    when: "any day",
    greeting: "",
    about: "the normal black and grey site.",
    colors: ["#ffffff", "#d4d4d4", "#a3a3a3", "#e5e5e5"],
    effect: "none",
  },
];

// ---------------------------------------------------------------------
// working out what today is
// ---------------------------------------------------------------------

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

// the date of easter sunday in any year (the "anonymous gregorian" method)
function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

// the months a season covers, after flipping for the northern hemisphere
function seasonMonths(season) {
  if (HEMISPHERE === "south") return season.months;
  return season.months.map((m) => ((m + 5) % 12) + 1);
}

function seasonWhen(season) {
  if (season.when) return season.when;
  const names = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const months = seasonMonths(season);
  return `${names[months[0] - 1]} – ${names[months[2] - 1]}`;
}

function isActive(season, date) {
  const d = { date: new Date(date.getFullYear(), date.getMonth(), date.getDate()), year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  if (season.kind === "festive") return season.inRange(d);
  if (season.kind === "season") return seasonMonths(season).includes(d.month);
  return false;
}

// the site to show on a date
function seasonFor(date = new Date()) {
  const festive = SEASONS.find((s) => s.kind === "festive" && isActive(s, date));
  if (festive) return festive;
  if (USE_SEASONS) return SEASONS.find((s) => s.kind === "season" && isActive(s, date));
  return SEASONS.find((s) => s.id === "all-time");
}

// ---------------------------------------------------------------------
// inside a seasonal site: set up its season, and the falling-stuff effect
// ---------------------------------------------------------------------

if (window.SEASON_ID) {
  window.SEASON = SEASONS.find((s) => s.id === window.SEASON_ID);
  document.addEventListener("DOMContentLoaded", () => {
    startSeasonEffect(window.SEASON);
    fillExtras();
  });
}

// little extras some site styles use. put the attribute on an element and it gets filled in:
//   data-visits        how many times you've opened this site (only counted in your own browser)
//   data-today         today's date, written out
//   data-clock         a ticking clock
//   data-webring="prev" / "next"   links to the season before / after this one
//   data-countdown     time left until new year
function fillExtras() {
  const pad = (n, size = 2) => String(n).padStart(size, "0");

  for (const el of document.querySelectorAll("[data-visits]")) {
    let visits = 1;
    try {
      visits = Number(localStorage.getItem(`visits-${window.SEASON_ID}`) || 0) + 1;
      localStorage.setItem(`visits-${window.SEASON_ID}`, visits);
    } catch {}
    el.textContent = pad(visits, Number(el.dataset.visits) || 1);
  }

  for (const el of document.querySelectorAll("[data-today]")) {
    el.textContent = new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  }

  const clocks = document.querySelectorAll("[data-clock]");
  if (clocks.length) {
    const tick = () => {
      const now = new Date();
      for (const el of clocks) el.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}${el.dataset.clock === "seconds" ? ":" + pad(now.getSeconds()) : ""}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  // the webring goes through every seasonal site in calendar order
  const ring = SEASONS.filter((s) => s.id !== "all-time");
  const here = ring.findIndex((s) => s.id === window.SEASON_ID);
  const file = location.protocol === "file:" ? "index.html" : "";
  for (const el of document.querySelectorAll("[data-webring]")) {
    const other = ring[(here + (el.dataset.webring === "next" ? 1 : -1) + ring.length) % ring.length];
    el.href = `../${other.id}/${file}`;
    el.textContent = el.dataset.webring === "next" ? `${other.name} »` : `« ${other.name}`;
  }

  const countdowns = document.querySelectorAll("[data-countdown]");
  if (countdowns.length) {
    const tick = () => {
      const now = new Date();
      const newYear = new Date(now.getFullYear() + 1, 0, 1);
      // in the first days of january, celebrate instead of counting
      if (now.getMonth() === 0 && now.getDate() <= 5) {
        for (const el of countdowns) el.textContent = `it's ${now.getFullYear()}!`;
        return;
      }
      let left = Math.max(0, Math.floor((newYear - now) / 1000));
      const days = Math.floor(left / 86400);
      left %= 86400;
      for (const el of countdowns) el.textContent = `${days}d ${pad(Math.floor(left / 3600))}h ${pad(Math.floor((left % 3600) / 60))}m ${pad(left % 60)}s`;
    };
    tick();
    setInterval(tick, 1000);
  }
}

function startSeasonEffect(season) {
  if (!season || season.effect === "none") return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const canvas = document.createElement("canvas");
  canvas.className = "season-effect";
  canvas.setAttribute("aria-hidden", "true");
  document.body.append(canvas);
  const ctx = canvas.getContext("2d");
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  let w = 0;
  let h = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  // how each kind of thing moves and looks
  const KINDS = {
    snow: { count: 70, make: () => ({ size: rand(1, 3.2), vy: rand(0.3, 1), vx: rand(-0.2, 0.2), alpha: rand(0.35, 0.9) }), fall: 1 },
    leaves: { count: 22, make: () => ({ size: rand(6, 11), vy: rand(0.5, 1.2), vx: rand(-0.4, 0.4), spin: rand(-0.03, 0.03), alpha: rand(0.6, 0.95) }), fall: 1 },
    petals: { count: 30, make: () => ({ size: rand(4, 7), vy: rand(0.35, 0.9), vx: rand(0.1, 0.6), spin: rand(-0.04, 0.04), alpha: rand(0.55, 0.95) }), fall: 1 },
    hearts: { count: 22, make: () => ({ size: rand(5, 10), vy: -rand(0.3, 0.8), vx: rand(-0.15, 0.15), alpha: rand(0.35, 0.8) }), fall: -1 },
    fireflies: { count: 28, make: () => ({ size: rand(1.2, 2.6), vy: -rand(0.08, 0.3), vx: rand(-0.2, 0.2), alpha: rand(0.4, 1) }), fall: -1, everywhere: true },
    eggs: { count: 18, make: () => ({ size: rand(5, 8), vy: rand(0.3, 0.7), vx: rand(-0.2, 0.2), spin: rand(-0.02, 0.02), alpha: rand(0.55, 0.9) }), fall: 1 },
    bubbles: { count: 26, make: () => ({ size: rand(5, 18), vy: -rand(0.25, 0.7), vx: rand(-0.15, 0.15), alpha: rand(0.45, 0.85) }), fall: -1 },
    confetti: { count: 45, make: () => ({ size: rand(3, 6), vy: rand(0.6, 1.4), vx: rand(-0.4, 0.4), spin: rand(-0.12, 0.12), alpha: rand(0.6, 1) }), fall: 1 },
  };
  const kind = KINDS[season.effect];
  if (!kind) return;

  function spawn(anywhere) {
    const p = kind.make();
    p.x = rand(0, w);
    p.y = anywhere ? rand(0, h) : kind.fall > 0 ? -12 : h + 12;
    p.rot = rand(0, Math.PI * 2);
    p.sway = rand(0, Math.PI * 2);
    p.color = pick(season.colors);
    return p;
  }

  const count = Math.round(kind.count * Math.min(1, w / 1200) + kind.count * 0.3);
  const things = Array.from({ length: count }, () => spawn(true));
  const bursts = []; // new year fireworks

  function heart(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.35);
    ctx.bezierCurveTo(x - s, y - s * 0.4, x - s * 0.45, y - s, x, y - s * 0.45);
    ctx.bezierCurveTo(x + s * 0.45, y - s, x + s, y - s * 0.4, x, y + s * 0.35);
    ctx.fill();
  }

  function draw(p, t) {
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    switch (season.effect) {
      case "snow":
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "fireflies":
        ctx.globalAlpha = p.alpha * (0.35 + 0.65 * Math.abs(Math.sin(t / 900 + p.sway)));
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        break;
      case "hearts":
        heart(p.x, p.y, p.size);
        break;
      case "bubbles": {
        // a see-through bubble with a shiny spot, very 2008
        const glow = ctx.createRadialGradient(p.x - p.size * 0.35, p.y - p.size * 0.35, p.size * 0.1, p.x, p.y, p.size);
        glow.addColorStop(0, "rgba(255,255,255,0.9)");
        glow.addColorStop(0.35, "rgba(255,255,255,0.15)");
        glow.addColorStop(1, "rgba(120,200,255,0.35)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.8)";
        ctx.lineWidth = 1;
        ctx.stroke();
        break;
      }
      default:
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.beginPath();
        if (season.effect === "leaves") {
          // a pointy leaf with a vein down the middle
          ctx.moveTo(0, -p.size);
          ctx.quadraticCurveTo(p.size * 0.8, 0, 0, p.size);
          ctx.quadraticCurveTo(-p.size * 0.8, 0, 0, -p.size);
          ctx.fill();
          ctx.globalAlpha = p.alpha * 0.4;
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(0, -p.size * 0.8);
          ctx.lineTo(0, p.size * 0.8);
          ctx.stroke();
        } else if (season.effect === "petals") {
          ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (season.effect === "eggs") {
          ctx.ellipse(0, 0, p.size * 0.75, p.size, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2); // confetti
        }
        ctx.restore();
    }
  }

  function firework() {
    const x = rand(w * 0.15, w * 0.85);
    const y = rand(h * 0.12, h * 0.45);
    const color = pick(season.colors);
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const speed = rand(1.5, 3.2);
      bursts.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, age: 0, life: rand(900, 1400), color });
    }
  }
  let nextFirework = performance.now() + 1500;

  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const step = Math.min(now - last, 50) / 16.67;
    last = now;
    if (document.hidden) return;
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < things.length; i++) {
      const p = things[i];
      p.x += (p.vx + Math.sin(now / 1400 + p.sway) * 0.35) * step;
      p.y += p.vy * step;
      if (p.spin) p.rot += p.spin * step;
      const gone = kind.fall > 0 ? p.y > h + 14 : p.y < -14;
      if (gone || p.x < -20 || p.x > w + 20) things[i] = spawn(false);
      draw(p, now);
    }

    if (season.effect === "confetti") {
      if (now > nextFirework) {
        firework();
        nextFirework = now + rand(2500, 5000);
      }
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.age += step * 16.67;
        if (b.age > b.life) {
          bursts.splice(i, 1);
          continue;
        }
        b.vx *= 0.97;
        b.vy = b.vy * 0.97 + 0.03;
        b.x += b.vx * step;
        b.y += b.vy * step;
        ctx.globalAlpha = 1 - b.age / b.life;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(b.x, b.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }
  requestAnimationFrame(frame);
}
