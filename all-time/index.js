/*
  index.js - everything the site does lives in this one file.

  how it works:
  1. "settings" at the top holds all my info. change things there!
  2. the bit of the url after # picks the page (#projects, #websites, #blog, #music).
  3. every page has a render function that builds its html.
  4. the discord card + its profile effect are in their own section.
  5. icons are at the very bottom because they're long and boring.
*/

// =====================================================================
// settings (edit me!)
// =====================================================================

const NAME = "yaanscoat";

// the seasonal sites (../winter/ and so on) use this same file. they set SITE_BASE to "../all-time/"
// so pictures, songs and posts are still loaded from this folder. here it's just "".
const BASE = window.SITE_BASE ?? "";
// which folder this site is in on github and on yaanson.top
const SITE_FOLDER = "all-time/";
const GITHUB_USER = "yaanscoat";
const AVATAR = `https://github.com/${GITHUB_USER}.png`;

// discord card. live status only shows up if i'm in the lanyard server:
// https://discord.gg/lanyard (otherwise it still shows my profile, just no status)
const DISCORD_ID = "1557611958688026624";
const DISCORD_FALLBACK = { username: "yaanscoat", global_name: "jolly yaanscoat" };

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

// websites page. to add one, copy a line and change it.
const WEBSITES = [
  { name: "yaanson.top", url: "https://yaanson.top", about: "my website. you're on it right now!" },
  { name: "BlackWaves", url: "https://blackwaves-100.vercel.app", about: "my main project, a sleek, clean and minimal web-proxy." },
  { name: "BlackWaves Movies", url: "https://yaanscoat.github.io/blackwaves-movies/", about: "movies for blackwaves. runs serverless on github pages." },
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
  { src: "assets/buttons/wittyrice.gif", alt: "wittyrice", href: "https://rice.place" },
  { src: "assets/buttons/fuck-facebook.webp", alt: "fuck facebook", href: "https://www.facebook.com" },
  { src: "assets/buttons/got_html.gif", alt: "got html?", href: "https://html.spec.whatwg.org/" },
];

// music page. put the song files in assets/music, then add each file name here.
// name the files like "artist - song.m4a". they're sorted a to z on the page automatically.
const MUSIC_FOLDER = BASE + "assets/music/";
const MUSIC = [
  "berlioz - nytmp.m4a",
  "berlioz - ode to rahsaan.m4a",
  "berlioz - peace.m4a",
  "berlioz - r&r.m4a",
  "berlioz, Ted Jasper - deep in it.m4a",
  "Dominic Fike - 3 Nights.m4a",
  "Dominic Fike - Ant Pile.m4a",
  "Dominic Fike - How Much Is Weed.m4a",
  "Dominic Fike - Mama's Boy.m4a",
  "Dominic Fike - Mona Lisa.m4a",
  "Dominic Fike - Sick.m4a",
  "Dominic Fike - WHITE KEYS.m4a",
  "Eric404 - Wasting Time.m4a",
  "iskey⋆˙⟡ - What's Luv.m4a",
  "KELLAR - KELLAR - Thinking About You.m4a",
];

// blog. put .txt files in assets/blogs, then add each file name here (like "my first post.txt").
// the file name is the post's title, and the text inside can use markdown and html, like a github readme.
const BLOG_FOLDER = BASE + "assets/blogs/";
const BLOG_POSTS = ["site-made!.txt"];
// if a post can't be loaded from this website (like when index.html is opened straight from your files),
// it's loaded from this github repo instead.
const SITE_REPO = "yaanscoat/yaanscoat-site";

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

// reads the bit of the url after # (like #blog/my-post) and works out which page to show
function readRoute() {
  const [section = "", ...rest] = location.hash.slice(1).split("/");
  let slug = rest.join("/");
  try {
    slug = decodeURIComponent(slug);
  } catch {}
  if (section === "projects") return { page: "projects" };
  if (section === "websites") return { page: "websites" };
  if (section === "blog") return slug ? { page: "post", slug } : { page: "blog" };
  if (section === "music") return { page: "music" };
  if (section === "") return { page: "home" };
  return { page: "missing" };
}

const PAGES = {
  home: renderHome,
  projects: renderProjects,
  websites: renderWebsites,
  blog: renderBlog,
  post: renderPost,
  music: renderMusic,
  missing: renderMissing,
};

const TITLES = { home: NAME, projects: "projects", websites: "websites", blog: "blog", music: "music", missing: "not found" };

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
  view.dataset.title = route.page === "post" ? route.slug : TITLES[route.page]; // some seasonal layouts show this
  main.replaceChildren(view);
  PAGES[route.page](view, route);

  if (!firstLoad) {
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }
}

// "skip to content" jumps to the page without changing the # in the url
document.querySelector(".skip").addEventListener("click", (e) => {
  e.preventDefault();
  $("#page").focus();
});

window.addEventListener("hashchange", showPage);

function updateNav(section) {
  for (const link of $$(".nav-link")) {
    const on = link.dataset.page === section;
    link.classList.toggle("is-on", on);
    if (on) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
}

function renderMissing(view) {
  view.innerHTML = `
    <header class="page-head">
      <h1>page not found</h1>
      <p class="lede">there's nothing at ${esc(location.hash)}. <a href="#">go to the home page</a>.</p>
    </header>`;
}

// the code people paste into their site to show my button
function myButtonCode() {
  const image = `${SITE_URL}/${SITE_FOLDER}${MY_BUTTON}`;
  const inside = `<style>body{margin:0}</style><a href="${SITE_URL}" target="_blank" rel="noopener"><img src="${image}" width="88" height="31" alt="${NAME}" style="display:block;border:0"></a>`;
  return `<iframe srcdoc="${inside.replace(/"/g, "&quot;")}" width="88" height="31" style="border:0;overflow:hidden" scrolling="no" title="${NAME}"></iframe>`;
}

function renderButtons() {
  const mine = `<a class="my-button" href="${SITE_URL}" target="_blank" rel="noreferrer" title="${esc(NAME)}"><img src="${esc(BASE + MY_BUTTON)}" alt="${esc(NAME)}" width="88" height="31"></a>`;
  $(".buttons").innerHTML =
    mine +
    BUTTONS.map((button) => {
      const img = `<img src="${esc(BASE + button.src)}" alt="${esc(button.alt)}" title="${esc(button.alt)}" width="88" height="31" loading="lazy">`;
      return button.href ? `<a href="${esc(button.href)}" target="_blank" rel="noreferrer">${img}</a>` : img;
    }).join("");

  $(".buttons").insertAdjacentHTML(
    "afterend",
    `<div class="embed">
      <label class="embed-label" for="embed-code">add my button to your site</label>
      <div class="embed-row">
        <textarea id="embed-code" class="embed-code" rows="2" readonly spellcheck="false"></textarea>
        <button class="btn embed-copy" type="button">copy code</button>
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
        button.textContent = "copied";
        setTimeout(() => (button.textContent = "copy code"), 1500);
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

  const greeting = window.SEASON?.greeting;
  view.innerHTML = `
    ${greeting ? `<p class="season-greeting">${esc(greeting)}</p>` : ""}
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
          <p class="dc-since">on discord since ${esc(since)}</p>
          <div class="dc-actions">
            <a class="btn btn-primary" href="https://discord.com/users/${DISCORD_ID}" target="_blank" rel="noreferrer">${brandIcon("Discord")}discord</a>
            <a class="btn" href="https://github.com/${GITHUB_USER}" target="_blank" rel="noreferrer">${brandIcon("GitHub")}github</a>
          </div>
        </div>
      </div>
      <canvas class="dc-effect" aria-hidden="true"></canvas>
    </article>

    <section class="section about">
      <h2>about me</h2>
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
    const discord = await getDiscord();
    if (!card.isConnected) return;
    drawDiscordUser(card, discord.user);
    drawPresence(card, discord.presence);
    drawActivities(card, discord.presence);
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
  const external = !/^https?:/.test(href) ? "" : ` target="_blank" rel="noreferrer"`;
  return href ? `<a class="activity" href="${esc(href)}"${external}>${artHTML}${text}</a>` : `<div class="activity">${artHTML}${text}</div>`;
}

function drawActivities(card, presence) {
  const items = [];
  let music = false;

  for (const a of presence?.activities ?? []) {
    if (a.type === 4) continue; // custom status is shown under my name
    if (a.name === "Spotify" && presence.spotify) {
      const s = presence.spotify;
      music = true;
      items.push(activityHTML({ kind: "listening to spotify", name: s.song, sub: `by ${s.artist}`, sub2: s.album, art: s.album_art_url, href: s.track_id ? `https://open.spotify.com/track/${s.track_id}` : "", fallbackIcon: brandIcon("Spotify") }));
      continue;
    }
    if (a.type === 2) music = true;
    const started = a.timestamps?.start ? `for ${timeAgo(a.timestamps.start).replace(" ago", "")}` : "";
    items.push(activityHTML({ kind: `${ACTIVITY_VERBS[a.type] ?? "Playing"}`, name: a.name, sub: a.details, sub2: a.state || started, art: activityImage(a), href: a.url ?? "", fallbackIcon: icon("game") }));
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
  const COLORS = window.SEASON?.colors ?? ["#ffffff", "#d4d4d4", "#a3a3a3", "#e5e5e5"];
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
    ctx.fillStyle = window.SEASON?.paw ?? "#8a8a8a"; // grey paws on the dark banner
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
  const lang = live?.language ? `<span class="proj-lang" style="--dot:${LANGUAGE_COLORS[live.language] ?? "#777"}">${esc(live.language)}</span>` : "";
  const meta = [
    live?.pushed_at ? `<span>updated ${esc(timeAgo(new Date(live.pushed_at).getTime()))}</span>` : "",
    live?.stargazers_count ? `<span>${live.stargazers_count} ${live.stargazers_count === 1 ? "star" : "stars"}</span>` : "",
  ].join("");

  return `
    <article class="proj ${featured ? "proj-featured" : ""}">
      <div class="proj-top">
        <${heading}><a href="${repoUrl}" target="_blank" rel="noreferrer">${esc(project.name)}</a></${heading}>
        ${lang}
      </div>
      <p class="proj-note">${esc(project.note)}</p>
      ${live?.description ? `<p class="proj-desc">${esc(live.description)}</p>` : ""}
      <div class="proj-meta">
        ${meta}
        <div class="proj-links">
          ${site ? `<a class="btn btn-primary" href="${esc(site)}" target="_blank" rel="noreferrer">${icon("globe")}open site</a>` : ""}
          <a class="btn" href="${repoUrl}" target="_blank" rel="noreferrer">${brandIcon("GitHub")}view code</a>
        </div>
      </div>
    </article>`;
}

function renderProjects(view) {
  function draw(repos = []) {
    const live = (name) => repos.find((r) => r.name === name);
    view.innerHTML = `
      <header class="page-head">
        <h1>projects</h1>
        <p class="lede">Here's some of my projects.</p>
      </header>
      <section class="proj-list">${PROJECTS.map((p, i) => projectHTML(p, live(p.repo), i === 0)).join("")}</section>
      <a class="more-link" href="https://github.com/${GITHUB_USER}?tab=repositories" target="_blank" rel="noreferrer">see all my repos on github</a>`;
  }

  draw(); // show my notes straight away...
  github(`/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`)
    .then((repos) => view.isConnected && draw(repos)) // ...then fill in the live stuff
    .catch(() => {});
}

// =====================================================================
// websites
// =====================================================================

function renderWebsites(view) {
  view.innerHTML = `
    <header class="page-head">
      <h1>websites</h1>
      <p class="lede">websites i've made or help run.</p>
    </header>
    <section class="site-grid">
      ${WEBSITES.map(
        (site) => `
          <a class="site-card" href="${esc(site.url)}" target="_blank" rel="noreferrer">
            <span class="site-head">
              <img class="site-icon" src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(site.url).hostname)}&sz=64" alt="" width="32" height="32" loading="lazy">
              <span>
                <span class="site-name">${esc(site.name)}</span>
                <span class="site-url">${esc(new URL(site.url).host + new URL(site.url).pathname.replace(/\/$/, ""))}</span>
              </span>
            </span>
            ${site.about ? `<span class="site-about">${esc(site.about)}</span>` : ""}
          </a>`,
      ).join("")}
    </section>`;
}

// =====================================================================
// blog (every .txt file in assets/blogs is a post)
// =====================================================================

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
    if (SITE_REPO) places.push(`https://raw.githubusercontent.com/${SITE_REPO}/HEAD/${SITE_FOLDER}assets/blogs/${file}`);

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
    <header class="page-head"><h1>blog</h1></header>
    <section class="post-list">${loadingHTML("loading posts…")}</section>`;
  const list = $(".post-list", view);
  const files = [...BLOG_POSTS].sort((a, b) => a.localeCompare(b));
  if (!view.isConnected) return;

  if (!files.length) {
    list.innerHTML = `
      <p class="empty">
        <strong>no posts yet</strong>
        check back soon, or see what i'm building on <a href="https://github.com/${GITHUB_USER}" target="_blank" rel="noreferrer">GitHub</a> in the meantime.
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
    <a class="back" href="#blog">${icon("back")}all posts</a>
    <article class="post">${loadingHTML("loading post…")}</article>`;
  const article = $(".post", view);
  const text = await fetchPost(route.slug);
  if (!view.isConnected) return;

  if (text === null) {
    const why =
      location.protocol === "file:"
        ? "browsers don't let a page opened straight from your files read other files, and this post isn't on github yet. push it to github, or open the site from a web host."
        : "it may have been renamed or removed.";
    article.innerHTML = `<p class="empty"><strong>couldn't load this post</strong>${why} <a href="#blog">go back to all posts</a>.</p>`;
    return;
  }

  article.innerHTML = `<h1>${esc(route.slug)}</h1><div class="md">${text ? markdown(text) : `<p class="muted">this post is empty right now.</p>`}</div>`;

  for (const link of $$(".md a[href]", article)) {
    if (link.getAttribute("href").startsWith("#")) continue;
    link.target = "_blank";
    link.rel = "noreferrer";
  }
  if (window.hljs) $$(".md pre code", article).forEach((code) => hljs.highlightElement(code));
}

// =====================================================================
// music (my own songs from assets/music)
// =====================================================================

// my song files don't have album covers inside them, so look each one up online.
// answers are saved, so each song is only looked up once.
const coverCache = new Map();

async function fillCover(track) {
  if (track.cover) return;
  const key = `cover2:${track.artist}|${track.name}`;
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
  // squash names down so "What's Luv?" matches "What's Luv" and "iskey⋆˙⟡" matches "iskey"
  const plain = (text) => text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const mainArtist = artist.split(/,|&| feat\.? | ft\.? | x /i)[0].trim();

  // 1. apple music (itunes) usually has the right single/album cover.
  // the artist has to match, so we never show some other song's cover.
  try {
    const term = encodeURIComponent(`${mainArtist.replace(/[^\p{L}\p{N}\s&']/gu, "")} ${name}`);
    const data = await getJSON(`https://itunes.apple.com/search?term=${term}&entity=song&limit=10`);
    const sameArtist = (r) => plain(r.artistName).includes(plain(mainArtist)) || plain(mainArtist).includes(plain(r.artistName));
    const results = (data.results ?? []).filter((r) => plain(mainArtist) && sameArtist(r));
    const hit = results.find((r) => plain(r.trackName) === plain(name)) ?? results.find((r) => plain(r.trackName).includes(plain(name)));
    if (hit?.artworkUrl100) {
      return { cover: hit.artworkUrl100.replace(/\d+x\d+bb/, "600x600bb"), album: hit.collectionName?.replace(/ - (Single|EP)$/, "") ?? "" };
    }
  } catch {}
  return { cover: "", album: "" };
}

// ---------- my own songs (every audio file in assets/music) ----------

const AUDIO_TYPES = /\.(m4a|mp3|ogg|opus|wav|flac|aac|webm)$/i;
// "Dominic Fike - Mona Lisa.m4a" -> { artist: "Dominic Fike", name: "Mona Lisa" }
function songFromFile(file) {
  const base = file.replace(AUDIO_TYPES, "");
  const parts = base.split(" - ").map((p) => p.trim());
  if (parts.length < 2) return { file, artist: "", name: base, cover: "", album: "" };
  const artist = parts[0];
  // "KELLAR - KELLAR - Thinking About You" has the artist twice, so drop the repeat
  const rest = parts.slice(1).filter((p) => p.toLowerCase() !== artist.toLowerCase());
  return { file, artist, name: (rest.length ? rest : parts.slice(1)).join(" - "), cover: "", album: "" };
}

// the songs, sorted a to z by song name (ignoring capitals and symbols at the start)
function getLibrary() {
  const key = (song) => song.name.replace(/^[^\p{L}\p{N}]+/u, "");
  return MUSIC.map(songFromFile).sort((a, b) => key(a).localeCompare(key(b), "en", { sensitivity: "base", numeric: true }));
}

function songArt(song) {
  return `${icon("note")}${song.cover ? `<img src="${esc(song.cover)}" alt="" loading="lazy">` : ""}`;
}

function renderMusic(view) {
  view.innerHTML = `
    <header class="page-head">
      <h1>music</h1>
      <p class="lede">songs i like. click one to play it.</p>
    </header>

    <section class="section">
      <div class="section-head"><h2>my music</h2><span class="count songs-count"></span></div>
      <div class="library-box">${loadingHTML("loading songs…")}</div>
    </section>`;

  drawLibrary(view);
}

async function drawLibrary(view) {
  const box = $(".library-box", view);
  const songs = getLibrary();

  if (!songs.length) {
    box.innerHTML = `<p class="empty"><strong>no songs yet</strong>put audio files in ${esc(MUSIC_FOLDER)} and add their names to MUSIC in index.js.</p>`;
    return;
  }
  $(".songs-count", view).textContent = `${songs.length} ${songs.length === 1 ? "song" : "songs"}, a to z`;

  box.innerHTML = `
    <ul class="library">
      ${songs
        .map(
          (song, i) => `
          <li>
            <button class="song" type="button" data-index="${i}">
              <span class="song-art">${songArt(song)}</span>
              <span class="song-title">${esc(song.name)}</span>
              <span class="song-artist">${esc(song.artist || "unknown artist")}</span>
            </button>
          </li>`,
        )
        .join("")}
    </ul>`;

  for (const button of $$(".song", box)) {
    button.addEventListener("click", () => player.toggle(songs, Number(button.dataset.index)));
  }
  player.markPlaying();

  // album covers load in one by one
  songs.forEach((song, i) => {
    if (song.cover) return;
    fillCover(song).then(() => {
      const art = $(`.song[data-index="${i}"] .song-art`, box);
      if (art && song.cover) art.innerHTML = songArt(song);
      if (player.current() === song) player.showSong();
    });
  });
}

// ---------- the player bar at the bottom ----------

const player = (() => {
  const bar = $(".player");
  const audio = $(".player-audio");
  const seek = $(".player-bar");
  let queue = [];
  let index = -1;

  const time = (s) => (Number.isFinite(s) ? `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}` : "0:00");
  const current = () => queue[index] ?? null;

  function showSong() {
    const song = current();
    if (!song) return;
    bar.hidden = false;
    bar.classList.remove("has-error");
    document.body.classList.add("has-player");
    $(".player-title", bar).textContent = song.name;
    $(".player-artist", bar).textContent = song.artist || "unknown artist";
    const art = $(".player-art", bar);
    if (song.cover) art.src = song.cover;
    else art.removeAttribute("src");
    if ("mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: song.name, artist: song.artist, album: song.album, artwork: song.cover ? [{ src: song.cover, sizes: "600x600" }] : [] });
    }
  }

  // underlines the song that's playing on the music page
  function markPlaying() {
    for (const button of $$(".song")) {
      const on = queue[Number(button.dataset.index)] === current() && current() !== null;
      button.classList.toggle("is-playing", on);
      button.classList.toggle("is-paused", on && audio.paused);
      button.setAttribute("aria-pressed", on && !audio.paused ? "true" : "false");
    }
  }

  function play(list, i) {
    queue = list;
    index = (i + list.length) % list.length;
    audio.src = MUSIC_FOLDER + encodeURIComponent(current().file);
    audio.play().catch(() => {});
    showSong();
    markPlaying();
  }

  // clicking the song that's already playing pauses it
  function toggle(list, i) {
    if (list[i] === current()) {
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
    } else {
      play(list, i);
    }
  }

  bar.addEventListener("click", (e) => {
    const action = e.target.closest("[data-action]")?.dataset.action;
    if (!action || !current()) return;
    if (action === "play") {
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
    }
    if (action === "next") play(queue, index + 1);
    if (action === "prev") {
      if (audio.currentTime > 3) audio.currentTime = 0; // first press goes back to the start
      else play(queue, index - 1);
    }
  });

  function updateTime() {
    const progress = audio.duration ? audio.currentTime / audio.duration : 0;
    if (!seek.matches(":active")) seek.value = Math.round(progress * 1000);
    seek.style.setProperty("--progress", `${progress * 100}%`);
    $(".player-time", bar).textContent = time(audio.currentTime);
    $(".player-length", bar).textContent = time(audio.duration);
  }

  seek.addEventListener("input", () => {
    if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
  });
  // ---------- volume ----------
  // your volume is remembered for next time (if the browser lets us save it)
  const volume = $(".player-vol", bar);
  const mute = $(".player-mute", bar);
  let lastVolume = 0.8; // what unmuting goes back to

  function showVolume() {
    const level = audio.muted ? 0 : audio.volume;
    volume.value = Math.round(level * 100);
    volume.style.setProperty("--progress", `${level * 100}%`);
    volume.setAttribute("aria-valuetext", `${Math.round(level * 100)}%`);
    bar.classList.toggle("is-muted", level === 0);
    bar.classList.toggle("is-quiet", level > 0 && level < 0.5);
    mute.setAttribute("aria-label", level === 0 ? "unmute" : "mute");
    try {
      localStorage.setItem("volume", String(audio.volume));
      localStorage.setItem("muted", audio.muted ? "1" : "");
    } catch {}
  }

  volume.addEventListener("input", () => {
    audio.volume = volume.value / 100;
    audio.muted = audio.volume === 0;
    if (audio.volume > 0) lastVolume = audio.volume;
  });

  mute.addEventListener("click", () => {
    if (audio.muted || audio.volume === 0) {
      audio.muted = false;
      if (audio.volume === 0) audio.volume = lastVolume;
    } else {
      lastVolume = audio.volume;
      audio.muted = true;
    }
  });

  audio.addEventListener("volumechange", showVolume);

  try {
    const saved = parseFloat(localStorage.getItem("volume"));
    audio.volume = saved >= 0 && saved <= 1 ? saved : 0.8;
    if (audio.volume > 0) lastVolume = audio.volume;
    audio.muted = localStorage.getItem("muted") === "1";
  } catch {
    audio.volume = 0.8;
  }
  showVolume();

  audio.addEventListener("timeupdate", updateTime);
  audio.addEventListener("loadedmetadata", updateTime);
  audio.addEventListener("ended", () => play(queue, index + 1)); // keep going through the list

  // a song couldn't load or play: say why in the player instead of doing nothing
  audio.addEventListener("error", () => {
    const song = current();
    if (!song) return;
    const type = song.file.toLowerCase().endsWith(".m4a") ? "audio/mp4; codecs=mp4a.40.2" : `audio/${song.file.split(".").pop().toLowerCase()}`;
    $(".player-artist", bar).textContent = audio.canPlayType(type)
      ? `couldn't load ${song.file}. is it uploaded to the site?`
      : `this browser can't play .${song.file.split(".").pop()} files. try chrome, edge or firefox.`;
    bar.classList.add("has-error");
  });
  for (const type of ["play", "pause"]) {
    audio.addEventListener(type, () => {
      bar.classList.toggle("is-playing", !audio.paused);
      $(".player-play", bar).setAttribute("aria-label", audio.paused ? "play" : "pause");
      markPlaying();
    });
  }

  // media keys on the keyboard / lock screen
  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("nexttrack", () => current() && play(queue, index + 1));
    navigator.mediaSession.setActionHandler("previoustrack", () => current() && play(queue, index - 1));
  }

  return { toggle, markPlaying, showSong, current };
})();

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
  Spotify: "M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z",
};

// =====================================================================
// start the site
// =====================================================================

renderButtons();
showPage();
