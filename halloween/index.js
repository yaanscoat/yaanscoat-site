/*
  index.js - everything the site does lives in this one file.

  how it works:
  1. "settings" at the top holds all my info. change things there!
  2. the bit of the url after # picks the page (#projects, #blog, #music).
  3. every page has a render function that builds its html.
  4. the discord card + its profile effect are in their own section.
  5. icons are at the very bottom because they're long and boring.
*/

// =====================================================================
// settings (edit me!)
// =====================================================================

const NAME = "yaanscoat";
const GITHUB_USER = "yaanscoat";
const AVATAR = `https://github.com/${GITHUB_USER}.png`;

// discord card. live status only shows up if i'm in the lanyard server:
// https://discord.gg/lanyard (otherwise it still shows my profile, just no status)
const DISCORD_ID = "1557611958688026624";
const DISCORD_FALLBACK = { username: "yaanscoat", global_name: "jolly yaanscoat" };

// last.fm. these keys are only able to read public stuff, so it's fine for them
// to be in the code - it's just scrambled so it isn't sitting there in plain text.
const LASTFM_USER = "yaanscoat";
const LASTFM_KEY = atob("ZTVkNGY5ZDM3YjQ4NTcxZDJiZjBmMGM0NjYzMDgwNzI=").split("").reverse().join("");

const SHORT_DESC = "Frontend | UBG | Vibe Coder | Proxies | Bypassing Internet C*ncorship";

// each string is its own paragraph
const ABOUT = [
  "Hi, i'm yaanscoat a developer making tools and cool games. I mainly work on making proxies, working with organisations like DP Unblocked, Unblocked Hub, AxisNet.work and so much more!",
  "I am fluent in English, HTML, and Ai Caramba.. I'm also learning JavaScript and CSS, but I hope to lean more into frontend side. I also want to learn Python, Rust, TypeScript, React, Tailwind and some other cool stuff.",
];

// projects page. "repo" is the name on github. the first one is shown big.
// the description, language and website link get filled in live from github.
const PROJECTS = [
  { repo: "blackwaves", name: "BlackWaves", note: 'My main project and my first "baby".' },
  { repo: "blackwaves-movies", name: "BlackWaves Movies", note: "BlackWaves Movies service. Runs serverless on GitHub Pages." },
  { repo: "yaanscoat-site", name: "yaanscoat-site", note: "This very website." },
  { repo: "astria.", name: "Astria", note: "I don't wanna talk about it.." },
];

// my own 88x31 button. it's shown first, and other people can copy an iframe
// to put it on their site. the picture is loaded from my live site, so if i
// change the gif, everyone's copy updates too.
const SITE_URL = "https://yaanson.top";
const MY_BUTTON = "assets/buttons/yaanscoat.gif";

// 88x31 buttons at the bottom of every page. href is optional.
const BUTTONS = [
  { src: "assets/buttons/github.png", alt: "github", href: "https://github.com/yaanscoat" },
  { src: "assets/buttons/vscode.png", alt: "visual studio code", href: "https://code.visualstudio.com" },
  { src: "assets/buttons/react.png", alt: "react", href: "https://react.dev" },
  { src: "assets/buttons/linux.png", alt: "linux powered" },
  { src: "assets/buttons/notepad.gif", alt: "notepad" },
  { src: "assets/buttons/moz.gif", alt: "mozilla", href: "https://www.mozilla.org" },
  { src: "assets/buttons/helium.png", alt: "helium", href: "https://helium.computer" },
  { src: "assets/buttons/ublock.png", alt: "ublock origin", href: "https://ublockorigin.com" },
  { src: "assets/buttons/discord.png", alt: "discord", href: "https://discord.com" },
  { src: "assets/buttons/twitter.gif", alt: "twitter", href: "https://x.com" },
  { src: "assets/buttons/spotify.png", alt: "spotify", href: "https://open.spotify.com" },
  { src: "assets/buttons/steam.png", alt: "steam", href: "https://store.steampowered.com" },
  { src: "assets/buttons/minecraft.png", alt: "minecraft", href: "https://www.minecraft.net" },
  { src: "assets/buttons/gd.png", alt: "geometry dash", href: "https://www.robtopgames.com" },
  { src: "assets/buttons/hollowknight.png", alt: "hollow knight", href: "https://www.hollowknight.com" },
  { src: "assets/buttons/ng.gif", alt: "newgrounds", href: "https://www.newgrounds.com" },
];

// the blog posts live in the all-time site (../all-time/assets/blogs), and the list of them is
// BLOG_POSTS in ../all-time/index.js, so every season shares the same posts.
const BLOG_FOLDER = "../all-time/assets/blogs/";
// if a post can't be loaded from this website, it's loaded from this github repo instead.
const SITE_REPO = "yaanscoat/yaanscoat-site";
const SITE_REPO_BLOG_FOLDER = "all-time/assets/blogs/";

// =====================================================================
// little helpers
// =====================================================================

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// makes text safe to put inside html
function esc(text) {
  return String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

const reduceMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

// "3 hours ago", "yesterday", ...
const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function timeAgo(ms) {
  const seconds = (ms - Date.now()) / 1000;
  const units = [["year", 31536000], ["month", 2592000], ["week", 604800], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

function loadingHTML(text = "Loading…") {
  return `<div class="loading" role="status"><span class="spinner"></span>${esc(text)}</div>`;
}

// turns markdown text into safe html
function markdown(text) {
  if (!window.marked) return `<p>${esc(text)}</p>`;
  const html = marked.parse(text);
  return window.DOMPurify ? DOMPurify.sanitize(html) : html;
}

// fetch json, saving the answer for this visit so we don't ask too often
async function getJSON(url, { save = false } = {}) {
  if (save) {
    try {
      const saved = sessionStorage.getItem(url);
      if (saved) return JSON.parse(saved);
    } catch {}
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} from ${url}`);
  const data = await res.json();
  if (save) {
    try {
      sessionStorage.setItem(url, JSON.stringify(data));
    } catch {}
  }
  return data;
}

// github only allows 60 questions an hour without logging in, so answers are saved
const github = (path) => getJSON(`https://api.github.com${path}`, { save: true });

// =====================================================================
// pages + the top bar
// =====================================================================

function readRoute() {
  const [section, ...rest] = location.hash.slice(1).split("/");
  let slug = rest.join("/");
  try {
    slug = decodeURIComponent(slug);
  } catch {}
  if (section === "projects") return { page: "projects" };
  if (section === "blog") return slug ? { page: "post", slug } : { page: "blog" };
  if (section === "music") return { page: "music" };
  return { page: "home" };
}

const PAGES = {
  home: renderHome,
  projects: renderProjects,
  blog: renderBlog,
  post: renderPost,
  music: renderMusic,
};

const TITLES = { home: NAME, projects: "Projects", blog: "Blog", music: "Music" };

let currentKey = null;

function showPage() {
  const route = readRoute();
  const key = `${route.page}/${route.slug ?? ""}`;
  updateNav(route.page === "post" ? "blog" : route.page);
  if (key === currentKey) return;
  const firstLoad = currentKey === null;
  currentKey = key;

  document.title = route.page === "home" ? NAME : `${route.page === "post" ? route.slug : TITLES[route.page]} - ${NAME}`;

  // each page draws into its own box. when you leave, the box is removed,
  // and anything still loading for it just stops (they check box.isConnected)
  const main = $("#page");
  const view = document.createElement("div");
  view.className = `view view-${route.page}`;
  main.replaceChildren(view);
  PAGES[route.page](view, route);

  if (!firstLoad) {
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
    if (!reduceMotion()) {
      view.animate([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" });
    }
  }
}

// highlights the current link and slides the bubble behind it
let pillReady = false;

function updateNav(section) {
  for (const link of $$(".nav-link")) {
    const on = link.dataset.page === section;
    link.classList.toggle("is-on", on);
    if (on) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  movePill();
}

function movePill() {
  const pill = $(".nav-pill");
  const link = $(".nav-link.is-on");
  if (!link) return (pill.style.opacity = 0);
  pill.style.transition = pillReady ? "" : "none";
  pill.style.width = `${link.offsetWidth}px`;
  pill.style.transform = `translateX(${link.offsetLeft}px)`;
  pill.style.opacity = 1;
  pillReady = true;
}

window.addEventListener("resize", () => {
  pillReady = false; // jump straight there instead of sliding
  movePill();
});
document.fonts?.ready.then(() => {
  pillReady = false;
  movePill();
});

// the code people paste into their site to show my button
function myButtonCode() {
  const image = `${SITE_URL}/${MY_BUTTON}`;
  const inside = `<style>body{margin:0}</style><a href="${SITE_URL}" target="_blank" rel="noopener"><img src="${image}" width="88" height="31" alt="${NAME}" style="display:block;border:0"></a>`;
  return `<iframe srcdoc="${inside.replace(/"/g, "&quot;")}" width="88" height="31" style="border:0;overflow:hidden" scrolling="no" title="${NAME}"></iframe>`;
}

function renderButtons() {
  const mine = `<a class="my-button" href="${SITE_URL}" target="_blank" rel="noreferrer" title="${esc(NAME)}"><img src="${esc(MY_BUTTON)}" alt="${esc(NAME)}" width="88" height="31"></a>`;
  $(".buttons").innerHTML =
    mine +
    BUTTONS.map((button) => {
      const img = `<img src="${esc(button.src)}" alt="${esc(button.alt)}" title="${esc(button.alt)}" width="88" height="31" loading="lazy">`;
      return button.href ? `<a href="${esc(button.href)}" target="_blank" rel="noreferrer">${img}</a>` : img;
    }).join("");

  $(".buttons").insertAdjacentHTML(
    "afterend",
    `<div class="embed">
      <label class="embed-label" for="embed-code">Add my button to your site</label>
      <div class="embed-row">
        <textarea id="embed-code" class="embed-code" rows="2" readonly spellcheck="false"></textarea>
        <button class="btn embed-copy" type="button">Copy code</button>
      </div>
    </div>`,
  );
  const code = $(".embed-code");
  code.value = myButtonCode();
  code.addEventListener("focus", () => code.select());
  $(".embed-copy").addEventListener("click", (e) => {
    const button = e.currentTarget;
    navigator.clipboard.writeText(code.value).then(
      () => {
        button.textContent = "Copied";
        setTimeout(() => (button.textContent = "Copy code"), 1500);
      },
      () => code.select(), // clipboard blocked: select it so they can copy by hand
    );
  });
}

// =====================================================================
// home page
// =====================================================================

function renderHome(view) {
  const since = formatDate(discordJoinDate(DISCORD_ID));
  const tagline = esc(SHORT_DESC).replace(/\s*\|\s*/g, '<span class="dc-sep" aria-hidden="true">|</span><span class="sr-sep">, </span>');

  view.innerHTML = `
    <article class="dc" aria-label="Discord profile">
      <div class="dc-banner"></div>
      <div class="dc-body">
        <div class="dc-avatar" title="Click me">
          <img class="dc-avatar-img" src="${AVATAR}" alt="${esc(NAME)}'s avatar" width="100" height="100">
          <img class="dc-deco" alt="" hidden>
          <span class="dc-status" role="img" hidden></span>
        </div>
        <h1 class="dc-name">${esc(DISCORD_FALLBACK.global_name)}</h1>
        <p class="dc-handle">
          <span class="dc-username">${esc(DISCORD_FALLBACK.username)}</span>
          <span class="dc-tag" hidden></span>
        </p>
        <p class="dc-custom" hidden></p>
        <p class="dc-tagline">${tagline}</p>
        <div class="dc-activity" hidden></div>
        <div class="dc-foot">
          <p class="dc-since">On Discord since ${esc(since)}</p>
          <div class="dc-actions">
            <a class="btn btn-primary" href="https://discord.com/users/${DISCORD_ID}" target="_blank" rel="noreferrer">${brandIcon("Discord")}Open Discord profile</a>
            <a class="btn" href="https://github.com/${GITHUB_USER}" target="_blank" rel="noreferrer">${brandIcon("GitHub")}GitHub</a>
          </div>
        </div>
      </div>
      <canvas class="dc-effect" aria-hidden="true"></canvas>
    </article>

    <section class="sheet about">
      <h2>About me</h2>
      ${ABOUT.map((text) => `<p>${esc(text)}</p>`).join("")}
    </section>`;

  const card = $(".dc", view);
  startProfileEffect(card);
  startDiscordCard(card);
}

// =====================================================================
// discord card (live from lanyard, or japi.rest if lanyard isn't watching me)
// =====================================================================

// every discord id has the date the account was made hidden inside it
function discordJoinDate(id) {
  return Number((BigInt(id) >> 22n) + 1420070400000n);
}

let lanyardWorks = true;

async function getDiscord() {
  if (lanyardWorks) {
    try {
      const json = await (await fetch(`https://api.lanyard.rest/v1/users/${DISCORD_ID}`)).json();
      if (json.success) return { user: json.data.discord_user, presence: json.data };
      lanyardWorks = false; // not in the lanyard server, stop asking
    } catch {}
  }
  try {
    const json = await getJSON(`https://japi.rest/discord/v1/user/${DISCORD_ID}`, { save: true });
    if (json.data?.id) return { user: json.data, presence: null };
  } catch {}
  return { user: null, presence: null };
}

async function startDiscordCard(card) {
  async function update() {
    const [discord, track] = await Promise.all([getDiscord(), getNowPlaying().catch(() => null)]);
    if (!card.isConnected) return;
    drawDiscordUser(card, discord.user);
    drawPresence(card, discord.presence);
    drawActivities(card, discord.presence, track);
  }
  await update();
  const timer = setInterval(() => {
    if (!card.isConnected) return clearInterval(timer);
    if (document.visibilityState === "visible") update();
  }, 30000);
}

// only changes a picture if it's actually different (so it doesn't flicker)
function setSrc(img, url) {
  if (img.getAttribute("src") !== url) img.src = url;
  img.hidden = false;
}

function drawDiscordUser(card, user) {
  if (!user) return;
  $(".dc-name", card).textContent = user.global_name || user.display_name || user.username;
  $(".dc-username", card).textContent = user.username;

  if (user.avatar) {
    const animated = user.avatar.startsWith("a_") && !reduceMotion();
    setSrc($(".dc-avatar-img", card), `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${animated ? "gif" : "webp"}?size=256`);
  }

  // avatar decoration (passthrough=true keeps it animated)
  const deco = user.avatar_decoration_data?.asset;
  const decoImg = $(".dc-deco", card);
  if (deco) setSrc(decoImg, `https://cdn.discordapp.com/avatar-decoration-presets/${deco}.png?size=240&passthrough=${!reduceMotion()}`);
  else decoImg.hidden = true;

  // server tag
  const guild = user.primary_guild ?? user.clan;
  const tag = $(".dc-tag", card);
  if (guild?.tag && guild.identity_enabled !== false) {
    const badge = guild.badge ? `<img src="https://cdn.discordapp.com/clan-badges/${guild.identity_guild_id}/${guild.badge}.png?size=32" alt="">` : "";
    tag.innerHTML = `${badge}${esc(guild.tag)}`;
    tag.hidden = false;
  }

  // my real discord banner, if i ever set one
  if (user.banner) {
    const banner = $(".dc-banner", card);
    const ext = user.banner.startsWith("a_") ? "gif" : "webp";
    if (!banner.firstElementChild) banner.innerHTML = `<img alt="">`;
    setSrc(banner.firstElementChild, `https://cdn.discordapp.com/banners/${user.id}/${user.banner}.${ext}?size=600`);
  }
}

const STATUS_NAMES = { online: "Online", idle: "Idle", dnd: "Do not disturb", offline: "Offline" };

function drawPresence(card, presence) {
  const dot = $(".dc-status", card);
  const custom = $(".dc-custom", card);
  if (!presence) {
    dot.hidden = true;
    custom.hidden = true;
    return;
  }
  const status = presence.discord_status ?? "offline";
  dot.dataset.status = status;
  dot.setAttribute("aria-label", STATUS_NAMES[status] ?? status);
  dot.title = STATUS_NAMES[status] ?? status;
  dot.hidden = false;

  const mine = presence.activities?.find((a) => a.type === 4);
  if (mine && (mine.state || mine.emoji)) {
    const emoji = mine.emoji?.id
      ? `<img src="https://cdn.discordapp.com/emojis/${mine.emoji.id}.${mine.emoji.animated ? "gif" : "png"}?size=48" alt="${esc(mine.emoji.name)}">`
      : esc(mine.emoji?.name ?? "");
    custom.innerHTML = `${emoji}<span>${esc(mine.state ?? "")}</span>`;
    custom.hidden = false;
  } else {
    custom.hidden = true;
  }
}

const ACTIVITY_VERBS = { 0: "Playing", 1: "Streaming", 2: "Listening to", 3: "Watching", 5: "Competing in" };

function activityImage(a) {
  const img = a.assets?.large_image;
  if (!img) return "";
  if (img.startsWith("mp:")) return `https://media.discordapp.net/${img.slice(3)}`;
  if (img.startsWith("spotify:")) return `https://i.scdn.co/image/${img.slice(8)}`;
  return a.application_id ? `https://cdn.discordapp.com/app-assets/${a.application_id}/${img}.png` : "";
}

function activityHTML({ kind, name, sub, sub2, art, href, fallbackIcon }) {
  const artHTML = art ? `<img class="activity-art" src="${esc(art)}" alt="">` : `<span class="activity-art">${fallbackIcon}</span>`;
  const text = `
    <span class="activity-text">
      <span class="activity-kind">${esc(kind)}</span>
      <span class="activity-name">${esc(name)}</span>
      ${sub ? `<span class="activity-sub">${esc(sub)}</span>` : ""}
      ${sub2 ? `<span class="activity-sub">${esc(sub2)}</span>` : ""}
    </span>`;
  const external = href.startsWith("#") ? "" : ` target="_blank" rel="noreferrer"`;
  return href ? `<a class="activity" href="${esc(href)}"${external}>${artHTML}${text}</a>` : `<div class="activity">${artHTML}${text}</div>`;
}

function drawActivities(card, presence, track) {
  const items = [];
  let music = false;

  for (const a of presence?.activities ?? []) {
    if (a.type === 4) continue; // custom status is shown under my name
    if (a.name === "Spotify" && presence.spotify) {
      const s = presence.spotify;
      music = true;
      items.push(activityHTML({ kind: "Listening to Spotify", name: s.song, sub: `by ${s.artist}`, sub2: s.album, art: s.album_art_url, href: s.track_id ? `https://open.spotify.com/track/${s.track_id}` : "", fallbackIcon: brandIcon("Spotify") }));
      continue;
    }
    if (a.type === 2) music = true;
    const started = a.timestamps?.start ? `for ${timeAgo(a.timestamps.start).replace(" ago", "")}` : "";
    items.push(activityHTML({ kind: `${ACTIVITY_VERBS[a.type] ?? "Playing"}`, name: a.name, sub: a.details, sub2: a.state || started, art: activityImage(a), href: a.url ?? "", fallbackIcon: icon("game") }));
  }

  // nothing from discord? show what last.fm says i'm listening to
  if (!music && track?.live) {
    items.push(activityHTML({ kind: "Listening on Last.fm", name: track.name, sub: `by ${track.artist}`, sub2: track.album, art: track.cover, href: "#music", fallbackIcon: icon("note") }));
  }

  const box = $(".dc-activity", card);
  const html = items.join("");
  if (box.dataset.html !== html) {
    box.dataset.html = html;
    box.innerHTML = html;
  }
  box.hidden = !items.length;
}

// =====================================================================
// profile effect: sparkles + little cat paws walking across the banner
// =====================================================================

function startProfileEffect(card) {
  const canvas = $(".dc-effect", card);
  const ctx = canvas.getContext("2d");
  const COLORS = ["#f2a65e", "#ffd6a8", "#f7eadc", "#f3b9c6"];
  const pick = (list) => list[Math.floor(Math.random() * list.length)];
  const rand = (a, b) => a + Math.random() * (b - a);
  let w = 0;
  let h = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = card.clientWidth;
    h = card.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  new ResizeObserver(resize).observe(card);
  resize();

  // the middle of my avatar, measured from the card's corner
  function avatarCenter() {
    const a = $(".dc-avatar", card).getBoundingClientRect();
    const c = card.getBoundingClientRect();
    return { x: a.left - c.left + a.width / 2, y: a.top - c.top + a.height / 2 };
  }

  // a 4-pointed twinkle
  function sparkle(x, y, r, rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      const b = a + Math.PI / 4;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      ctx.lineTo(Math.cos(b) * r * 0.28, Math.sin(b) * r * 0.28);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // a paw print, toes pointing the way it's walking
  function paw(x, y, angle, size) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle + Math.PI / 2);
    ctx.scale(size, size);
    ctx.beginPath();
    ctx.ellipse(0, 2.2, 4.4, 3.7, 0, 0, Math.PI * 2);
    for (const [tx, ty] of [[-4.8, -3.2], [-1.7, -5.9], [1.7, -5.9], [4.8, -3.2]]) {
      ctx.moveTo(tx + 1.7, ty);
      ctx.ellipse(tx, ty, 1.7, 2.1, 0, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.restore();
  }

  // people who turned on "reduce motion" get a still version
  if (reduceMotion()) {
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = pick(COLORS);
      ctx.globalAlpha = rand(0.35, 0.8);
      sparkle(rand(0, w), rand(10, 130), rand(2, 5), rand(0, Math.PI));
    }
    return;
  }

  const sparks = [];
  const paws = [];
  let lastBurst = 0;

  function burst() {
    const now = performance.now();
    if (now - lastBurst < 1200) return;
    lastBurst = now;
    const o = avatarCenter();
    for (let i = 0; i < 30; i++) {
      const angle = rand(0, Math.PI * 2);
      const speed = rand(1.4, 4.2);
      sparks.push({ x: o.x, y: o.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 0.6, age: 0, life: rand(700, 1300), size: rand(2.5, 6), spin: rand(-0.08, 0.08), rot: rand(0, Math.PI), color: pick(COLORS), drag: 0.94 });
    }
  }

  function addFloater() {
    sparks.push({ x: rand(0, w), y: h + 8, vx: 0, vy: -rand(0.25, 0.6), age: 0, life: rand(5000, 9000), size: rand(1.2, 3), spin: rand(-0.02, 0.02), rot: rand(0, Math.PI), color: pick(COLORS), drag: 1, sway: rand(0, Math.PI * 2), floater: true });
  }

  // a cat walks across the banner, one step at a time
  function pawWalk() {
    const leftToRight = Math.random() < 0.5;
    const y = rand(40, 100);
    const steps = Math.ceil(w / 34) + 2;
    const start = performance.now();
    for (let i = 0; i < steps; i++) {
      const x = leftToRight ? -10 + i * 34 : w + 10 - i * 34;
      const side = i % 2 ? 6 : -6;
      const wave = Math.sin(i / 2.2) * 8;
      paws.push({ x, y: y + wave + side, angle: leftToRight ? 0 : Math.PI, at: start + i * 210, life: 2400 });
    }
  }

  card.addEventListener("pointerenter", burst);
  $(".dc-avatar", card).addEventListener("click", burst);
  setTimeout(burst, 350);
  setTimeout(pawWalk, 2600);
  let nextWalk = performance.now() + rand(14000, 20000);

  let last = performance.now();
  function frame(now) {
    if (!card.isConnected) return; // left the home page
    requestAnimationFrame(frame);
    const dt = Math.min(now - last, 50);
    const step = dt / 16.67;
    last = now;
    if (document.hidden) return;

    if (now > nextWalk) {
      pawWalk();
      nextWalk = now + rand(14000, 22000);
    }
    if (sparks.filter((s) => s.floater).length < 14 && Math.random() < 0.05 * step) addFloater();

    ctx.clearRect(0, 0, w, h);

    // paws
    ctx.fillStyle = "#5a3d2a"; // dark brown so the paws show up on the snowy banner
    for (let i = paws.length - 1; i >= 0; i--) {
      const p = paws[i];
      const age = now - p.at;
      if (age < 0) continue;
      if (age > p.life) {
        paws.splice(i, 1);
        continue;
      }
      const fadeIn = Math.min(age / 150, 1);
      ctx.globalAlpha = 0.55 * fadeIn * (1 - age / p.life);
      paw(p.x, p.y, p.angle, 1.15);
    }

    // sparkles
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.age += dt;
      if (s.age > s.life || s.y < -10) {
        sparks.splice(i, 1);
        continue;
      }
      s.vx *= s.drag ** step;
      s.vy = s.floater ? s.vy : s.vy * s.drag ** step + 0.03 * step;
      s.x += (s.vx + (s.floater ? Math.sin(s.age / 700 + s.sway) * 0.25 : 0)) * step;
      s.y += s.vy * step;
      s.rot += s.spin * step;
      const t = s.age / s.life;
      const twinkle = s.floater ? 0.55 + 0.45 * Math.sin(s.age / 260 + s.sway) : 1;
      ctx.globalAlpha = Math.max(0, (s.floater ? 0.6 : 1) * twinkle * Math.min(t * 8, 1) * (1 - t));
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 8;
      sparkle(s.x, s.y, s.size, s.rot);
      ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
  }
  requestAnimationFrame(frame);
}

// =====================================================================
// projects (my notes + live info from github)
// =====================================================================

const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#6ba6ed", HTML: "#e98364", CSS: "#b197ed", SCSS: "#cf92b9",
  Python: "#73a8d3", Rust: "#dea584", Go: "#56c6d9", Java: "#dfaa79", Kotlin: "#b99aff",
  C: "#a8b9cc", "C++": "#f18eb1", "C#": "#9bd17e", Ruby: "#df7777", PHP: "#9fa8dd",
  Swift: "#f5a277", Vue: "#75cfa6", Svelte: "#ff916f", Astro: "#ce97fa", Shell: "#a4ce80", Lua: "#989ce9",
};

// where a repo is published (its homepage and/or github pages)
function repoSite(r) {
  if (r.homepage) return /^https?:\/\//i.test(r.homepage) ? r.homepage : `https://${r.homepage}`;
  if (r.has_pages) {
    const user = GITHUB_USER.toLowerCase();
    return r.name.toLowerCase() === `${user}.github.io` ? `https://${user}.github.io/` : `https://${user}.github.io/${r.name}/`;
  }
  return "";
}

function projectHTML(project, live, featured) {
  const repoUrl = `https://github.com/${GITHUB_USER}/${encodeURIComponent(project.repo)}`;
  const site = live ? repoSite(live) : "";
  const heading = featured ? "h2" : "h3";
  const lang = live?.language ? `<span class="proj-lang" style="--dot:${LANGUAGE_COLORS[live.language] ?? "var(--coat)"}">${esc(live.language)}</span>` : "";
  const links = `
    <div class="proj-links">
      ${site ? `<a class="btn btn-primary" href="${esc(site)}" target="_blank" rel="noreferrer">${icon("globe")}Open site</a>` : ""}
      <a class="btn" href="${repoUrl}" target="_blank" rel="noreferrer">${brandIcon("GitHub")}View code</a>
    </div>`;
  const meta = [live?.pushed_at ? `<span>Updated ${esc(timeAgo(new Date(live.pushed_at).getTime()))}</span>` : "", live?.stargazers_count ? `<span>${live.stargazers_count} ${live.stargazers_count === 1 ? "star" : "stars"}</span>` : ""].join("");

  return `
    <${featured ? "article" : "div"} class="proj ${featured ? "proj-featured sheet" : "proj-row"}">
      <div class="proj-top">
        <${heading}><a href="${repoUrl}" target="_blank" rel="noreferrer">${esc(project.name)}</a></${heading}>
        ${lang}
      </div>
      <p class="proj-note">${esc(project.note)}</p>
      ${live?.description ? `<p class="proj-desc">${esc(live.description)}</p>` : ""}
      ${featured ? `${meta ? `<div class="proj-meta">${meta}</div>` : ""}${links}` : `<div class="proj-meta">${meta}${links}</div>`}
    </${featured ? "article" : "div"}>`;
}

function renderProjects(view) {
  function draw(repos = []) {
    const live = (name) => repos.find((r) => r.name === name);
    const [first, ...rest] = PROJECTS;
    view.innerHTML = `
      <header class="page-head">
        <h1>Projects</h1>
        <p class="lede">Here's some of my projects.</p>
      </header>
      ${first ? projectHTML(first, live(first.repo), true) : ""}
      ${rest.length ? `<section class="sheet proj-list" aria-label="More projects">${rest.map((p) => projectHTML(p, live(p.repo), false)).join("")}</section>` : ""}
      <a class="more-link" href="https://github.com/${GITHUB_USER}?tab=repositories" target="_blank" rel="noreferrer">See all my repos on GitHub</a>`;
  }

  draw(); // show my notes straight away...
  github(`/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`)
    .then((repos) => view.isConnected && draw(repos)) // ...then fill in the live stuff
    .catch(() => {});
}

// =====================================================================
// blog (every .txt file in assets/blogs is a post)
// =====================================================================

let blogFiles = null;

function getBlogFiles() {
  blogFiles ??= findBlogFiles().then((files) => files.sort((a, b) => a.localeCompare(b)));
  return blogFiles;
}

// reads the BLOG_POSTS list from the all-time site, so there's only one list to keep up to date.
// (vercel can't show a list of the files in a folder, so the list has to be written down somewhere)
async function findBlogFiles() {
  try {
    const code = await (await fetch("../all-time/index.js", { cache: "no-cache" })).text();
    const list = code.match(/const BLOG_POSTS = \[([^\]]*)\]/);
    if (list) return [...list[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  } catch {}
  return [];
}

const postSlug = (file) => file.replace(/\.txt$/i, "");

// the first paragraph of a post, cut down to 160 letters
function postExcerpt(text) {
  const doc = new DOMParser().parseFromString(markdown(text), "text/html");
  const first = $$("p", doc).map((p) => p.textContent.trim()).find(Boolean) ?? "";
  return first.length > 160 ? first.slice(0, 160).replace(/\s+\S*$/, "") + "…" : first;
}

const postCache = new Map();

// gets a post's text (from this website first, then from github), or null
function fetchPost(slug) {
  if (!postCache.has(slug)) {
    const file = encodeURIComponent(`${slug}.txt`);
    const places = [BLOG_FOLDER + file];
    if (SITE_REPO) places.push(`https://raw.githubusercontent.com/${SITE_REPO}/HEAD/${SITE_REPO_BLOG_FOLDER}${file}`);

    const request = (async () => {
      for (const url of places) {
        try {
          const res = await fetch(url, { cache: "no-cache" });
          if (res.ok && !res.headers.get("content-type")?.includes("text/html")) return (await res.text()).trim();
        } catch {}
      }
      postCache.delete(slug); // try again next time
      return null;
    })();
    postCache.set(slug, request);
  }
  return postCache.get(slug);
}

async function renderBlog(view) {
  view.innerHTML = `
    <header class="page-head"><h1>Blog</h1></header>
    <section class="sheet post-list">${loadingHTML("Loading posts…")}</section>`;
  const list = $(".post-list", view);
  const files = await getBlogFiles();
  if (!view.isConnected) return;

  if (!files.length) {
    blogFiles = null; // look again next time
    list.innerHTML = `
      <p class="empty">
        <strong>No posts yet</strong>
        Check back soon, or see what I'm building on <a href="https://github.com/${GITHUB_USER}" target="_blank" rel="noreferrer">GitHub</a> in the meantime.
      </p>`;
    return;
  }

  list.innerHTML = files
    .map((file) => {
      const slug = postSlug(file);
      return `
        <a class="post-row" href="#blog/${esc(encodeURIComponent(slug))}" data-slug="${esc(slug)}">
          <span class="post-row-title">${esc(slug)}</span>
          <span class="post-row-text"></span>
        </a>`;
    })
    .join("");

  for (const row of $$(".post-row", list)) {
    fetchPost(row.dataset.slug).then((text) => {
      if (text) $(".post-row-text", row).textContent = postExcerpt(text);
    });
  }
}

async function renderPost(view, route) {
  view.innerHTML = `
    <a class="back" href="#blog">${icon("back")}All posts</a>
    <article class="sheet post">${loadingHTML("Loading post…")}</article>`;
  const article = $(".post", view);
  const text = await fetchPost(route.slug);
  if (!view.isConnected) return;

  if (text === null) {
    article.innerHTML = `<p class="empty"><strong>Couldn't load this post</strong>It may have been renamed or removed. <a href="#blog">Go back to all posts</a>.</p>`;
    return;
  }

  article.innerHTML = `<h1>${esc(route.slug)}</h1><div class="md">${text ? markdown(text) : `<p class="muted">This post is empty right now.</p>`}</div>`;

  for (const link of $$(".md a[href]", article)) {
    if (link.getAttribute("href").startsWith("#")) continue;
    link.target = "_blank";
    link.rel = "noreferrer";
  }
  if (window.hljs) $$(".md pre code", article).forEach((code) => hljs.highlightElement(code));
}

// =====================================================================
// music (from last.fm)
// =====================================================================

async function lastfm(method, extra = "") {
  const url = `https://ws.audioscrobbler.com/2.0/?method=${method}&user=${encodeURIComponent(LASTFM_USER)}&api_key=${LASTFM_KEY}&format=json${extra}`;
  const data = await (await fetch(url)).json();
  if (data.error) throw new Error(data.message);
  return data;
}

function simpleTrack(t) {
  let cover = t.image?.find((img) => img.size === "extralarge")?.["#text"] || t.image?.at(-1)?.["#text"] || "";
  if (cover.includes("2a96cbd8b46e442fc41c2b86b821562f")) cover = ""; // last.fm's blank star picture
  return {
    name: t.name,
    artist: t.artist?.["#text"] ?? t.artist?.name ?? "",
    album: t.album?.["#text"] ?? "",
    cover,
    url: t.url,
    live: t["@attr"]?.nowplaying === "true",
    when: t.date?.uts ? Number(t.date.uts) * 1000 : null,
  };
}

async function recentTracks(limit) {
  const data = await lastfm("user.getrecenttracks", `&limit=${limit}`);
  let list = data.recenttracks?.track ?? [];
  if (!Array.isArray(list)) list = [list];
  const tracks = list.map(simpleTrack).slice(0, limit + 1);
  await Promise.all(tracks.map(fillCover));
  return { tracks, total: Number(data.recenttracks?.["@attr"]?.total ?? 0) };
}

// last.fm often has no cover for a song, so look it up somewhere else.
// answers are saved, so each song is only looked up once.
const coverCache = new Map();

async function fillCover(track) {
  if (track.cover) return;
  const key = `cover:${track.artist}|${track.name}`;
  if (!coverCache.has(key)) {
    let saved = null;
    try {
      saved = JSON.parse(sessionStorage.getItem(key));
    } catch {}
    coverCache.set(key, saved ? Promise.resolve(saved) : lookUpCover(track));
  }
  const found = await coverCache.get(key);
  try {
    sessionStorage.setItem(key, JSON.stringify(found));
  } catch {}
  track.cover = found.cover;
  track.album ||= found.album;
}

async function lookUpCover({ artist, name }) {
  // 1. apple music (itunes) usually has the right single/album cover
  try {
    const term = encodeURIComponent(`${artist} ${name}`);
    const data = await getJSON(`https://itunes.apple.com/search?term=${term}&entity=song&limit=5`);
    const same = (a, b) => a.toLowerCase().trim() === b.toLowerCase().trim();
    const hit = data.results?.find((r) => same(r.artistName, artist) && same(r.trackName, name)) ?? data.results?.find((r) => same(r.artistName, artist)) ?? data.results?.[0];
    if (hit?.artworkUrl100) {
      return { cover: hit.artworkUrl100.replace(/\d+x\d+bb/, "600x600bb"), album: hit.collectionName?.replace(/ - (Single|EP)$/, "") ?? "" };
    }
  } catch {}
  // 2. otherwise ask last.fm about the song itself
  try {
    const data = await getJSON(`https://ws.audioscrobbler.com/2.0/?method=track.getInfo&format=json&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(name)}&api_key=${LASTFM_KEY}`);
    const cover = data.track?.album?.image?.find((img) => img.size === "extralarge")?.["#text"] ?? "";
    if (cover && !cover.includes("2a96cbd8b46e442fc41c2b86b821562f")) return { cover, album: data.track.album.title ?? "" };
  } catch {}
  return { cover: "", album: "" };
}

// the song playing right now (or the last one played)
async function getNowPlaying() {
  const { tracks } = await recentTracks(1);
  return tracks[0] ?? null;
}

const EQ = `<span class="eq" aria-hidden="true"><span></span><span></span><span></span></span>`;

function renderMusic(view) {
  const profile = `https://www.last.fm/user/${encodeURIComponent(LASTFM_USER)}`;
  view.innerHTML = `
    <header class="page-head">
      <h1>Music</h1>
      <p class="lede">What I'm listening to, straight from <a href="${profile}" target="_blank" rel="noreferrer">Last.fm</a>.</p>
    </header>
    <section class="sheet np-box" aria-live="polite">${loadingHTML("Checking Last.fm…")}</section>
    <section class="sheet recent" hidden><h2>Recently played</h2><ol class="tracks"></ol></section>
    <p class="muted small scrobbles" hidden></p>`;

  const npBox = $(".np-box", view);
  const recent = $(".recent", view);
  let shown = "";

  async function update() {
    let result;
    try {
      result = await recentTracks(12);
    } catch {
      if (!view.isConnected || shown) return; // keep the old songs if a refresh fails
      npBox.innerHTML = `<p class="empty"><strong>Couldn't reach Last.fm</strong>It might be down for a moment. <button class="link retry" type="button">Try again</button></p>`;
      $(".retry", npBox).onclick = () => {
        npBox.innerHTML = loadingHTML("Checking Last.fm…");
        update();
      };
      return;
    }
    if (!view.isConnected) return;

    const { tracks, total } = result;
    const key = JSON.stringify(tracks.map((t) => [t.url, t.live, t.when]));
    if (key === shown) return; // nothing changed
    shown = key;

    const [top, ...rest] = tracks;
    if (!top) {
      npBox.innerHTML = `
        <div class="np">
          <div class="np-cover">${icon("note")}</div>
          <div class="np-info">
            <p class="empty"><strong>Nothing played yet</strong>Songs show up here as soon as Last.fm scrobbles them.</p>
            <a class="btn" href="${profile}" target="_blank" rel="noreferrer">${brandIcon("Lastfm")}Open Last.fm profile</a>
          </div>
        </div>`;
      recent.hidden = true;
      return;
    }

    npBox.innerHTML = `
      <div class="np">
        <div class="np-cover">${icon("note")}${top.cover ? `<img src="${esc(top.cover)}" alt="">` : ""}</div>
        <div class="np-info">
          <p class="np-state ${top.live ? "is-live" : ""}">${top.live ? `${EQ}Listening now` : `Last played ${esc(timeAgo(top.when))}`}</p>
          <h2 class="np-title"><a href="${esc(top.url)}" target="_blank" rel="noreferrer">${esc(top.name)}</a></h2>
          <p class="np-artist">${esc(top.artist)}</p>
          ${top.album ? `<p class="np-album">${esc(top.album)}</p>` : ""}
          <a class="btn" href="${profile}" target="_blank" rel="noreferrer">${brandIcon("Lastfm")}Open Last.fm profile</a>
        </div>
      </div>`;

    $(".tracks", recent).innerHTML = rest
      .slice(0, 11)
      .map(
        (t) => `
        <li>
          <a href="${esc(t.url)}" target="_blank" rel="noreferrer">
            ${t.cover ? `<img class="track-art" src="${esc(t.cover)}" alt="" loading="lazy">` : `<span class="track-art"></span>`}
            <span class="track-text">
              <span class="track-name">${esc(t.name)}</span>
              <span class="track-artist">${esc(t.artist)}</span>
            </span>
            <span class="track-when">${t.when ? esc(timeAgo(t.when)) : ""}</span>
          </a>
        </li>`,
      )
      .join("");
    recent.hidden = !rest.length;

    const scrobbles = $(".scrobbles", view);
    scrobbles.textContent = `${total.toLocaleString("en-AU")} ${total === 1 ? "scrobble" : "scrobbles"} on Last.fm so far.`;
    scrobbles.hidden = !total;
  }

  update();
  const timer = setInterval(() => {
    if (!view.isConnected) return clearInterval(timer);
    if (document.visibilityState === "visible") update();
  }, 30000);
}

// =====================================================================
// icons
// =====================================================================

const ICONS = {
  globe: `<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>`,
  back: `<path d="m15 5-7 7 7 7"/>`,
  note: `<path d="M9 18V5.5l11-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/>`,
  game: `<rect x="2.5" y="7" width="19" height="11" rx="4"/><path d="M7 10.5v4M5 12.5h4"/><circle cx="16" cy="11.5" r=".8"/><circle cx="18" cy="13.5" r=".8"/>`,
};

function icon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

function brandIcon(name) {
  return `<svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${BRAND_ICONS[name]}"/></svg>`;
}

// logos from simple-icons.org
const BRAND_ICONS = {
  Discord: "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z",
  GitHub: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  Lastfm: "M10.584 17.21l-.88-2.392s-1.43 1.594-3.573 1.594c-1.897 0-3.244-1.649-3.244-4.288 0-3.382 1.704-4.591 3.381-4.591 2.42 0 3.189 1.567 3.849 3.574l.88 2.749c.88 2.666 2.529 4.81 7.285 4.81 3.409 0 5.718-1.044 5.718-3.793 0-2.227-1.265-3.381-3.63-3.931l-1.758-.385c-1.21-.275-1.567-.77-1.567-1.595 0-.934.742-1.484 1.952-1.484 1.32 0 2.034.495 2.144 1.677l2.749-.33c-.22-2.474-1.924-3.492-4.729-3.492-2.474 0-4.893.935-4.893 3.932 0 1.87.907 3.051 3.189 3.601l1.87.44c1.402.33 1.869.907 1.869 1.704 0 1.017-.99 1.43-2.86 1.43-2.776 0-3.93-1.457-4.59-3.464l-.907-2.75c-1.155-3.573-2.997-4.893-6.653-4.893C2.144 5.333 0 7.89 0 12.233c0 4.18 2.144 6.434 5.993 6.434 3.106 0 4.591-1.457 4.591-1.457z",
  Spotify: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
};

// =====================================================================
// start the site
// =====================================================================

renderButtons();
window.addEventListener("hashchange", showPage);
showPage();
