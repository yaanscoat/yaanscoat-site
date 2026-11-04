/*
  index.js - everything the site does lives in this one file.

  how it works:
  1. "settings" at the top holds all my info. change things there!
  2. the bit of the url after # picks the page (#blog, #repos/some-repo, ...).
  3. every page has a render function that builds its html.
  4. icons are at the very bottom because they're long and boring.
*/

// =====================================================================
// settings (edit me!)
// =====================================================================

const NAME = "yaanscoat";
const GITHUB_USER = "yaanscoat";
const AVATAR = `https://github.com/${GITHUB_USER}.png`;

// the clock on the home page. find more time zones here:
// https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
const TIME_ZONE = "Australia/Sydney";
const TIME_LABEL = "aus eastern time";

const ABOUT = "hiya! i'm yaanscoat and i like making cool tools and i also like coffee..";

const WHAT_I_KNOW =
  "i'm learning/somewhat-know html, css and javascript and i would also like to study python, typescript and rust.";
const SKILLS_LEARNING = ["HTML", "CSS", "JavaScript"];
const SKILLS_NEXT = ["Python", "TypeScript", "Rust"];

const ACHIEVEMENTS = ["making cool websites that are open source and benefit students!"];

// each string is its own paragraph
const MORE_ABOUT = [
  "i'm yaanscoat, a 13 year old going into year 9 and i want to study IT when i grow up and do something in software like work at a startup or a tech company.",
  "in my spare time i like to cook, watch movies and read books, comics and manga. my fav colour is blue and i luv u!? <3",
];

// icon can be any name from BRAND_ICONS at the bottom (GitHub, Discord, X, ...)
const CONTACT_LINKS = [
  { label: "github", href: "https://github.com/yaanscoat", icon: "GitHub" },
];
// put an email here and a "click to copy" email button shows up
const EMAIL = "yaanscoat@gmail.com";

// projects page. to add one, copy a project (from { to },) and change it.
// the image is shown in a 16:10 box, so a screenshot works great.
const PROJECTS = [
  {
    slug: "blackwaves", // used in the url: #projects/blackwaves
    name: "blackwaves",
    about: "all-in-one ubg web proxy",
    year: "2026",
    url: "", // put the website link here and a "visit" link shows up
    image: "assets/img/blackwaves.png",
    details: [
      "blackwaves is an all-new, slick ubg web proxy that uses scramjet and wisp, and has a list of over 800 games, movies and ai built in.",
      "this is the perfect all-in-one ubg for you, so please use it!!",
    ],
  },
];

// 88x31 buttons. href is optional: buttons with one link somewhere when clicked.
// MY_BUTTON is my own button image: clicking it copies html so friends can add it to their site.
const MY_BUTTON = ""; // e.g. "assets/buttons/yaanscoat.gif"
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

// "listening to" on the home page (from last.fm). leave empty to hide it.
// get a free api key at https://www.last.fm/api/account/create
const LASTFM_USER = "";
const LASTFM_API_KEY = "";

// every .txt file in this folder becomes a blog post. the file name is the post's title,
// and the text inside can use markdown and html, just like a github readme.
const BLOG_FOLDER = "assets/blogs/";
// the github repo this site is in. it's the backup way to find posts when there's no
// post list from vercel and the web server can't list the blog folder (github pages, or
// opening index.html straight from your files). on github pages it's worked out from the url.
const SITE_REPO = "yaanscoat/yaanscoat-site";

// optional cover pictures for the repos page, like { "my-repo": "assets/images/my-repo.png" }
const REPO_COVERS = {};

// =====================================================================
// little helpers
// =====================================================================

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// makes text safe to put inside html (so a "<" in a repo description can't break the page)
function esc(text) {
  return String(text ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const EASE_SMOOTH = "cubic-bezier(0.22, 1, 0.36, 1)";
const EASE_ROLL = "cubic-bezier(0.3, 0, 0.2, 1)";

// plays an animation on an element. people who turned on "reduce motion"
// still get the fades, just without the moving.
function animate(el, frames, { duration, delay = 0, easing = "ease-out" }) {
  if (reduceMotion) frames = frames.map(({ transform, ...rest }) => rest);
  return el.animate(frames, { duration, delay, easing, fill: "both" });
}

const fadeUp = (distance) => [
  { opacity: 0, transform: `translateY(${distance}px)` },
  { opacity: 1, transform: "none" },
];

// shows some text for 1.5 seconds, then puts the old text back
function flashText(el, text) {
  el.dataset.original ??= el.textContent;
  el.textContent = text;
  clearTimeout(el.flashTimer);
  el.flashTimer = setTimeout(() => (el.textContent = el.dataset.original), 1500);
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDate(value) {
  const date = new Date(value ?? "");
  if (!value || Number.isNaN(date.getTime())) return "date unavailable";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const countRepos = (count) => (count === 1 ? "1 repository" : `${count} repositories`);

function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function loadingHTML() {
  return `<div class="repo-loading" role="status"><span class="repo-spinner"></span>loading…</div>`;
}

// turns markdown text into safe html
function markdown(text) {
  if (!window.marked) return `<p>${esc(text)}</p>`;
  const html = marked.parse(text);
  return window.DOMPurify ? DOMPurify.sanitize(html) : html;
}

// =====================================================================
// pages + the top menu
// =====================================================================

// reads the url after the # and works out which page to show
function readRoute() {
  const [path, query = ""] = location.hash.slice(1).split("?");
  const [section, rawSlug = ""] = path.split("/");
  let slug = rawSlug;
  try {
    slug = decodeURIComponent(rawSlug);
  } catch {}
  const params = new URLSearchParams(query);

  if (section === "projects") return slug ? { page: "project", slug } : { page: "projects" };
  if (section === "blog") return slug ? { page: "post", slug } : { page: "blog" };
  if (section === "repos") {
    if (!slug) return { page: "repos" };
    const tab = params.get("tab");
    return {
      page: "repo",
      slug,
      tab: tab === "releases" || tab === "deployments" ? tab : "code",
      path: params.get("path") ?? "",
    };
  }
  return { page: "home" };
}

const PAGES = {
  home: renderHome,
  projects: renderProjects,
  project: renderProject,
  blog: renderBlog,
  post: renderPost,
  repos: renderRepos,
  repo: renderRepo,
};

let currentKey = null;
let navigation = 0;

async function showPage() {
  const route = readRoute();
  const key = `${route.page}/${route.slug ?? ""}`;
  updateNav(route.page);

  // same page, just a different tab or folder inside a repo: no page animation
  if (key === currentKey) {
    if (route.page === "repo") drawRepo();
    return;
  }
  const firstLoad = currentKey === null;
  currentKey = key;
  const thisNavigation = ++navigation;

  // fade the old page out first...
  const oldPages = $$(".page");
  if (!firstLoad) {
    await Promise.all(
      oldPages.map((el) => animate(el, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-3px)" }], { duration: 160 }).finished.catch(() => {})),
    );
  }
  oldPages.forEach((el) => el.remove());
  if (thisNavigation !== navigation) return; // someone clicked another link meanwhile

  // ...then fade the new one in
  const page = document.createElement("main");
  page.className = "page";
  page.tabIndex = -1;
  document.body.append(page);
  if (!firstLoad) animate(page, fadeUp(5), { duration: 160 });
  PAGES[route.page](page, route);
}

// highlights the current menu link and slides the blue line under it
let navLineReady = false;

function updateNav(page) {
  const section = { post: "blog", project: "projects", repo: "repos" }[page] ?? page;
  for (const link of $$(".nav-links a")) {
    const on = link.dataset.page === section;
    link.classList.toggle("on", on);
    if (on) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
  moveNavLine();
}

function moveNavLine() {
  const line = $(".nav-line");
  const link = $(".nav-links a.on");
  if (!link) return (line.style.opacity = 0);
  const springy = "cubic-bezier(0.25, 1, 0.35, 1)";
  line.style.transition = navLineReady && !reduceMotion ? `transform .35s ${springy}, width .35s ${springy}` : "none";
  line.style.transform = `translate(${link.offsetLeft}px, ${link.offsetTop + link.offsetHeight - 1}px)`;
  line.style.width = `${link.offsetWidth}px`;
  line.style.opacity = 1;
  navLineReady = true;
}

window.addEventListener("resize", () => {
  navLineReady = false; // jump straight to the new spot instead of sliding
  moveNavLine();
});

// =====================================================================
// home page
// =====================================================================

let homeAnimated = false; // the fade-in only plays the first time
let homeScroll = null; // remembers how far down you scrolled

function renderHome(page) {
  page.innerHTML = `
    <div class="wrap">
      <header class="intro">
        <div class="pfp"><img src="${AVATAR}" alt="${esc(NAME)}" draggable="false"></div>
        <div>
          <h1>${esc(NAME)}</h1>
          <p class="muted"><time class="time"></time> ${esc(TIME_LABEL)}</p>
        </div>
      </header>

      <section id="about">
        <p>${esc(ABOUT)}</p>
      </section>

      <section id="skills">
        <h2>what i know</h2>
        <p>${esc(WHAT_I_KNOW)}</p>
        ${skillRow("learning", SKILLS_LEARNING)}
        ${skillRow("next up", SKILLS_NEXT)}
      </section>

      <section id="achievements">
        <h2>achievements</h2>
        ${ACHIEVEMENTS.map((text) => `<p>${esc(text)}</p>`).join("")}
      </section>

      <section id="more">
        <h2>more about me</h2>
        ${MORE_ABOUT.map((text) => `<p>${esc(text)}</p>`).join("")}
      </section>

      <div class="listening-slot"></div>

      <section id="contact">
        <h2>contact</h2>
        <p class="row">
          ${CONTACT_LINKS.map((link) => `<a href="${esc(link.href)}" target="_blank" rel="noreferrer" class="with-icon">${brandIcon(link.icon)}${esc(link.label)}</a>`).join("")}
          ${EMAIL ? `<button type="button" class="link with-icon" title="click to copy" onclick="copyEmail(this)">${icon("mail")}<span>${esc(EMAIL)}</span></button>` : ""}
        </p>
      </section>

      ${buttonsSection()}
    </div>`;

  const wrap = page.firstElementChild;
  if (!homeAnimated) {
    [...wrap.children].forEach((el, i) => animate(el, fadeUp(6), { duration: 250, delay: i * 40, easing: EASE_SMOOTH }));
    homeAnimated = true;
  }

  startClock($(".time", page));
  startListening($(".listening-slot", page));

  // go back to where you were, or jump to a section like #contact
  if (homeScroll === null) {
    const id = location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView();
  } else {
    page.scrollTop = homeScroll;
  }
  page.addEventListener("scroll", () => (homeScroll = page.scrollTop), { passive: true });
}

function skillRow(label, languages) {
  if (!languages.length) return "";
  const items = languages
    .map((name) => `<span class="with-icon"><span style="color:${languageColor(name)};display:flex">${languageIcon(name)}</span>${esc(name.toLowerCase())}</span>`)
    .join("");
  return `<p class="row skills small"><span class="muted">${esc(label)}</span>${items}</p>`;
}

function buttonsSection() {
  if (!MY_BUTTON && !BUTTONS.length) return "";
  const mine = MY_BUTTON
    ? `<button type="button" onclick="copyMyButton()"><img src="${esc(MY_BUTTON)}" alt="${esc(NAME)}" width="88" height="31"></button>`
    : "";
  const others = BUTTONS.map((button) => {
    const img = `<img src="${esc(button.src)}" alt="${esc(button.alt)}" title="${esc(button.alt)}" width="88" height="31" loading="lazy">`;
    return button.href ? `<a href="${esc(button.href)}" target="_blank" rel="noreferrer" title="${esc(button.alt)}">${img}</a>` : img;
  }).join("");
  return `
    <section id="buttons">
      <h2>${MY_BUTTON ? "add my button !!" : "buttons"}</h2>
      <div class="buttons">${mine}${others}</div>
    </section>`;
}

function copyEmail(button) {
  navigator.clipboard.writeText(EMAIL).then(
    () => flashText(button.querySelector("span"), "copied!"),
    () => (location.href = `mailto:${EMAIL}`),
  );
}

function copyMyButton() {
  const site = location.href.split("#")[0];
  const image = new URL(MY_BUTTON, site).href;
  const html = `<a href="${site}" target="_blank"><img src="${image}" width="88" height="31" alt="${NAME}"></a>`;
  navigator.clipboard.writeText(html).then(() => flashText($("#buttons h2"), "copied!"), () => {});
}

// ---------- the clock with rolling numbers ----------

const clockFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

function startClock(el) {
  let shown = "";
  function tick() {
    if (!el.isConnected) return; // stop once we leave the home page
    const now = clockFormat.format(new Date()).toLowerCase();
    el.setAttribute("aria-label", now);

    if (now.length !== shown.length) {
      // first time: build one box per character
      el.innerHTML = [...now].map((c) => (/\d/.test(c) ? `<span class="digit"><span>${c}</span></span>` : `<span>${c}</span>`)).join("");
    } else {
      // after that: only roll the digits that changed
      [...now].forEach((c, i) => {
        if (c !== shown[i] && /\d/.test(c)) rollDigit(el.children[i], c);
      });
    }
    shown = now;
    setTimeout(tick, 1000 - (Date.now() % 1000));
  }
  tick();
}

// the old number slides up and out while the new one slides up from below
function rollDigit(box, value) {
  const old = box.lastElementChild;
  const next = document.createElement("span");
  next.textContent = value;
  box.append(next);
  if (!old) return;
  if (reduceMotion) return old.remove();
  old.classList.add("leaving");
  const timing = { duration: 350, easing: EASE_ROLL };
  animate(old, [{ transform: "translateY(0)" }, { transform: "translateY(-100%)" }], timing).finished.then(() => old.remove());
  animate(next, [{ transform: "translateY(100%)" }, { transform: "translateY(0)" }], timing);
}

// ---------- "listening to" from last.fm ----------

function startListening(slot) {
  if (!LASTFM_USER || !LASTFM_API_KEY) return;
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&format=json&limit=1&user=${encodeURIComponent(LASTFM_USER)}&api_key=${encodeURIComponent(LASTFM_API_KEY)}`;
  let shown = "";

  async function update() {
    if (!slot.isConnected) return clearInterval(timer);
    try {
      const data = await (await fetch(url)).json();
      const track = data?.recenttracks?.track?.[0];
      if (!track) return;
      let cover = (track.image ?? []).find((img) => img.size === "extralarge")?.["#text"] ?? "";
      if (cover.includes("2a96cbd8b46e442fc41c2b86b821562f")) cover = ""; // last.fm's blank star picture
      const live = track["@attr"]?.nowplaying === "true";
      const artist = track.artist?.["#text"] ?? "";

      const html = `
        <section id="listening">
          <h2>${live ? "listening to" : "last listened to"}</h2>
          <a class="song" href="${esc(track.url)}" target="_blank" rel="noreferrer">
            <span class="song-cover">${cover ? `<img src="${esc(cover)}" alt="">` : ""}</span>
            <span class="song-text">
              <span class="song-name">${esc(track.name)}</span>
              <span class="song-sub">${esc(artist)}</span>
            </span>
          </a>
        </section>`;
      if (html !== shown) slot.innerHTML = shown = html; // only redraw when the song changes
    } catch {}
  }

  update();
  const timer = setInterval(() => document.visibilityState === "visible" && update(), 30000);
}

// =====================================================================
// projects
// =====================================================================

function renderProjects(page) {
  const cards = PROJECTS.map(
    (project) => `
      <a class="project-entry" href="#projects/${esc(project.slug)}">
        <img src="${esc(project.image)}" alt="">
        <span class="project-entry-name">${esc(project.name)}</span>
        <span class="project-entry-about">${esc(project.about)}</span>
      </a>`,
  ).join("");

  page.innerHTML = `
    <div class="wrap">
      <h1>projects</h1>
      ${PROJECTS.length ? `<div class="cards">${cards}</div>` : `<p class="muted">nothing here yet, check out my <a href="#repos">repos</a> for now!</p>`}
    </div>`;
}

function renderProject(page, route) {
  const project = PROJECTS.find((p) => p.slug === route.slug);
  page.innerHTML = `
    <div class="wrap">
      <a href="#projects" class="back">← projects</a>
      ${
        project
          ? `
        <div class="hero"><img src="${esc(project.image)}" alt=""></div>
        <div class="detail-head">
          <h1>${esc(project.name)}</h1>
          <span class="muted small">${esc(project.year)}</span>
        </div>
        <p class="muted">${esc(project.about)}</p>
        <div class="detail-body">${project.details.map((text) => `<p>${esc(text)}</p>`).join("")}</div>
        ${project.url ? `<a class="visit" href="${esc(project.url)}" target="_blank" rel="noreferrer">${esc(hostOf(project.url))} ↗</a>` : ""}`
          : `<p class="muted">couldn't find that project.</p>`
      }
    </div>`;
}

// =====================================================================
// blog (every .txt file in assets/blogs is a post)
// =====================================================================

let blogFiles = null;

function getBlogFiles() {
  blogFiles ??= findBlogFiles().then((files) => files.sort((a, b) => a.localeCompare(b)));
  return blogFiles;
}

async function findBlogFiles() {
  // 1. on vercel, the "buildCommand" in vercel.json writes the list of posts to this file on every deploy
  try {
    const res = await fetch("assets/blog-posts.txt", { cache: "no-cache" });
    if (res.ok && !res.headers.get("content-type")?.includes("text/html")) {
      const names = (await res.text()).split("\n").map((name) => name.trim()).filter((name) => name.toLowerCase().endsWith(".txt"));
      if (names.length) return names;
    }
  } catch {}

  // 2. most other web servers (like vs code's live server) show a list of files for a folder
  try {
    const res = await fetch(BLOG_FOLDER, { cache: "no-cache" });
    if (res.ok) {
      const doc = new DOMParser().parseFromString(await res.text(), "text/html");
      const names = $$("a[href]", doc)
        .map((a) => decodeURIComponent(a.getAttribute("href").split(/[?#]/)[0].split("/").pop()))
        .filter((name) => name.toLowerCase().endsWith(".txt"));
      if (names.length) return [...new Set(names)];
    }
  } catch {}

  // 3. github pages (and opening index.html as a file) can't do either, so ask github instead
  const repo = siteRepo();
  if (!repo) return [];
  try {
    const files = await github(`/repos/${repo}/contents/${BLOG_FOLDER.replace(/\/$/, "")}`);
    return files.filter((f) => f.type === "file" && f.name.toLowerCase().endsWith(".txt")).map((f) => f.name);
  } catch {
    return [];
  }
}

// works out which github repo the site is in.
// yaanscoat.github.io/yaanscoat-site/ -> "yaanscoat/yaanscoat-site"
// yaanscoat.github.io/                -> "yaanscoat/yaanscoat.github.io"
function siteRepo() {
  const host = location.hostname;
  if (!host.endsWith(".github.io")) return SITE_REPO;
  const owner = host.split(".")[0];
  const folder = location.pathname.split("/")[1];
  return folder && !folder.includes(".") ? `${owner}/${folder}` : `${owner}/${host}`;
}

// "my first post.txt" -> "my first post" (that's the title, and it goes in the url too)
const postSlug = (file) => file.replace(/\.txt$/i, "");

// the first paragraph of a post, cut down to 140 letters
function postExcerpt(text) {
  const doc = new DOMParser().parseFromString(markdown(text), "text/html");
  const first = $$("p", doc).map((p) => p.textContent.trim()).find(Boolean) ?? "";
  return first.length > 140 ? first.slice(0, 140).replace(/\s+\S*$/, "") + "…" : first;
}

const postCache = new Map();

// gets a post's text, or null if it can't be loaded.
// tries this website first, then the copy on github.
function fetchPost(slug) {
  if (!postCache.has(slug)) {
    const file = encodeURIComponent(`${slug}.txt`);
    const places = [BLOG_FOLDER + file];
    if (siteRepo()) places.push(`https://raw.githubusercontent.com/${siteRepo()}/HEAD/${BLOG_FOLDER}${file}`);

    const request = (async () => {
      for (const url of places) {
        try {
          const res = await fetch(url, { cache: "no-cache" });
          if (res.ok && !res.headers.get("content-type")?.includes("text/html")) return (await res.text()).trim();
        } catch {}
      }
      postCache.delete(slug); // so it tries again next time
      return null;
    })();
    postCache.set(slug, request);
  }
  return postCache.get(slug);
}

async function renderBlog(page) {
  page.innerHTML = `<div class="wrap"><h1>blog</h1><div class="post-list"></div></div>`;
  const list = $(".post-list", page);
  const files = await getBlogFiles();

  if (!files.length) {
    blogFiles = null; // look again next time the blog is opened
    list.outerHTML =
      location.protocol === "file:"
        ? `<p class="muted">couldn't find any posts. a page opened straight from your files isn't allowed to read other files, so open the site with a local server (like vs code's live server) or push it to github.</p>`
        : `<p class="muted">no posts yet.</p>`;
    return;
  }

  list.innerHTML = files
    .map((file) => {
      const slug = postSlug(file);
      return `
        <a href="#blog/${esc(encodeURIComponent(slug))}" class="card post-card" data-slug="${esc(slug)}">
          <span class="card-title">${esc(slug)}</span>
          <span class="card-text">&nbsp;</span>
        </a>`;
    })
    .join("");

  // fill in the first few lines of each post once they load
  for (const card of $$(".post-card", list)) {
    fetchPost(card.dataset.slug).then((text) => {
      if (text) $(".card-text", card).textContent = postExcerpt(text) || " ";
    });
  }
}

async function renderPost(page, route) {
  page.innerHTML = `<div class="wrap"><a href="#blog" class="back">← blog</a></div>`;
  page.focus({ preventScroll: true });
  const wrap = page.firstElementChild;
  const text = await fetchPost(route.slug);

  if (text === null) {
    wrap.insertAdjacentHTML("beforeend", `<p class="muted">couldn't load this post.</p>`);
    return;
  }

  const title = document.createElement("h1");
  title.textContent = route.slug;

  // the text is shown like a github readme: markdown and html both work
  const article = document.createElement("article");
  article.className = "md post-body";
  article.innerHTML = text ? markdown(text) : `<p class="muted">this post is empty right now.</p>`;
  for (const link of $$("a[href]", article)) {
    if (link.getAttribute("href").startsWith("#")) continue;
    link.target = "_blank";
    link.rel = "noreferrer";
  }
  // code blocks get colours, like on github
  for (const pre of $$("pre", article)) {
    const code = $("code", pre);
    if (!code) continue;
    const language = code.className.match(/language-([\w+-]+)/)?.[1] ?? "";
    pre.replaceWith(codeViewer({ code: code.textContent, language, numbered: false }));
  }

  wrap.append(title, article);
  for (const el of [title, article]) animate(el, fadeUp(8), { duration: 400, easing: EASE_SMOOTH });
}

// =====================================================================
// repos (loaded live from github)
// =====================================================================

// asks the github api for something. answers are saved for this visit,
// because github only allows 60 questions an hour without logging in.
async function github(path) {
  const url = `https://api.github.com${path}`;
  try {
    const saved = sessionStorage.getItem(url);
    if (saved) return JSON.parse(saved);
  } catch {}

  const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) {
    const error = new Error(`github said ${res.status}`);
    error.status = res.status;
    throw error;
  }
  const data = await res.json();
  try {
    sessionStorage.setItem(url, JSON.stringify(data));
  } catch {} // too big to save, that's fine
  return data;
}

// the websites a repo is published at (its homepage and/or github pages)
function repoDeployments(r) {
  const sites = [];
  if (r.homepage) sites.push({ name: "homepage", url: /^https?:\/\//i.test(r.homepage) ? r.homepage : `https://${r.homepage}` });
  if (r.has_pages) {
    const user = GITHUB_USER.toLowerCase();
    const isUserSite = r.name.toLowerCase() === `${user}.github.io`;
    sites.push({ name: "github pages", url: `https://${user}.github.io/${isUserSite ? "" : r.name + "/"}` });
  }
  return sites.filter((site, i) => hostOf(site.url) !== site.url && sites.findIndex((s) => s.url === site.url) === i);
}

// turns github's answer into the simpler shape this site uses
function simpleRepo(r) {
  return {
    slug: r.name,
    name: r.name,
    description: r.description ?? "",
    topics: r.topics ?? [],
    archived: r.archived,
    language: r.language,
    size: r.size * 1024,
    updated: r.pushed_at,
    cover: REPO_COVERS[r.name] ?? "",
    deployments: repoDeployments(r),
  };
}

async function getRepoList() {
  const repos = await github(`/users/${GITHUB_USER}/repos?per_page=100&sort=pushed`);
  return repos.map(simpleRepo);
}

function errorHTML() {
  return `
    <div class="repo-empty" role="alert">
      <h2>couldn't load repos.</h2>
      <button class="repo-button retry">try again</button>
    </div>`;
}

// ---------- the list of repos ----------

async function renderRepos(page) {
  page.innerHTML = `
    <div class="wrap repos-wrap">
      <header class="repos-heading"><h1>repos</h1></header>
      <div class="repos-body">${loadingHTML()}</div>
    </div>`;
  const body = $(".repos-body", page);

  let repos;
  try {
    repos = await getRepoList();
  } catch {
    body.innerHTML = errorHTML();
    $(".retry", body).onclick = () => renderRepos(page);
    return;
  }

  $(".repos-heading", page).insertAdjacentHTML("beforeend", `<span class="repo-count">${countRepos(repos.length)}</span>`);
  if (!repos.length) {
    body.innerHTML = `<div class="repo-empty repo-setup"><h2>no repos yet.</h2></div>`;
    return;
  }

  const languages = [...new Set(repos.map((r) => r.language).filter(Boolean))].sort();
  body.innerHTML = `
    <div class="repo-tools">
      <label class="repo-search">
        ${icon("search")}
        <input type="search" placeholder="search repos" aria-label="Find a repository">
      </label>
      <div class="repo-filters">
        <label>
          <span class="sr-only">Filter by language</span>
          <select class="language-filter" aria-label="Filter by language">
            <option value="all">all languages</option>
            ${languages.map((l) => `<option>${esc(l)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span class="sr-only">Sort repositories</span>
          <select class="sort" aria-label="Sort repositories">
            <option value="updated">updated</option>
            <option value="name">name</option>
            <option value="size">size</option>
          </select>
        </label>
      </div>
    </div>
    <div class="repo-results" aria-live="polite"></div>
    <div class="repo-list"></div>
    <div class="repo-empty no-matches"><h2>no matches.</h2><button class="repo-button">clear filters</button></div>`;

  const search = $("input", body);
  const languageFilter = $(".language-filter", body);
  const sort = $(".sort", body);

  function draw() {
    const query = search.value.toLowerCase().trim();
    const language = languageFilter.value;
    const shown = repos
      .filter((r) => `${r.name} ${r.description} ${r.topics.join(" ")}`.toLowerCase().includes(query))
      .filter((r) => language === "all" || r.language === language)
      .sort((a, b) => {
        if (sort.value === "name") return a.name.localeCompare(b.name);
        if (sort.value === "size") return b.size - a.size;
        return (b.updated ?? "").localeCompare(a.updated ?? "");
      });

    const results = $(".repo-results", body);
    const filtered = query || language !== "all";
    results.hidden = !filtered;
    results.textContent = `${countRepos(shown.length)}${query ? ` matching “${search.value.trim()}”` : ""}`;
    $(".repo-list", body).innerHTML = shown.map(repoCard).join("");
    $(".no-matches", body).hidden = shown.length > 0;
  }

  search.oninput = draw;
  languageFilter.onchange = draw;
  sort.onchange = draw;
  $(".no-matches button", body).onclick = () => {
    search.value = "";
    languageFilter.value = "all";
    draw();
  };
  // clicking a #topic searches for it
  $(".repo-list", body).onclick = (event) => {
    const topic = event.target.closest(".repo-topics button");
    if (!topic) return;
    search.value = topic.textContent;
    draw();
  };
  draw();
}

function repoCard(repo) {
  const href = repoHref(repo.slug);
  const site = repo.deployments[0];
  return `
    <article class="repo-card">
      ${repo.cover ? `<a class="repo-card-cover" href="${href}" aria-label="Open ${esc(repo.name)}"><img src="${esc(repo.cover)}" alt="${esc(repo.name)} cover" width="1920" height="1080"></a>` : ""}
      <div class="repo-card-title">
        <a href="${href}">${esc(repo.name)}</a>
        ${repo.archived ? `<span class="repo-badge">archived</span>` : ""}
      </div>
      ${repo.description ? `<p class="repo-description">${esc(repo.description)}</p>` : ""}
      ${repo.topics.length ? `<div class="repo-topics">${repo.topics.map((t) => `<button>${esc(t)}</button>`).join("")}</div>` : ""}
      <div class="repo-card-meta">
        ${repo.language ? `<span class="with-icon"><span style="color:${languageColor(repo.language)}">${languageIcon(repo.language)}</span>${esc(repo.language)}</span>` : ""}
        <span>${formatSize(repo.size)}</span>
        ${repo.updated ? `<span title="Last pushed to">${formatDate(repo.updated)}</span>` : ""}
      </div>
      ${
        site
          ? `<div class="repo-card-links">
              <a class="with-icon" href="${esc(site.url)}" target="_blank" rel="noreferrer">${icon("globe")}${esc(hostOf(site.url))}${icon("arrow")}</a>
            </div>`
          : ""
      }
    </article>`;
}

// ---------- one repo ----------

// builds a link to a repo page, like #repos/my-repo?tab=releases
function repoHref(slug, tab = "code", path = "") {
  const params = new URLSearchParams();
  if (tab !== "code") params.set("tab", tab);
  if (path) params.set("path", path);
  const query = params.toString();
  return `#repos/${encodeURIComponent(slug)}${query ? `?${query}` : ""}`;
}

// repos that have finished loading, by lowercase name
const loadedRepos = new Map();

async function getRepo(name) {
  const base = `/repos/${GITHUB_USER}/${encodeURIComponent(name)}`;
  const info = await github(base);
  const branch = info.default_branch;
  const [tree, languageBytes, releases] = await Promise.all([
    github(`${base}/git/trees/${encodeURIComponent(branch)}?recursive=1`).catch(() => ({ tree: [] })), // empty repos have no tree
    github(`${base}/languages`).catch(() => ({})),
    github(`${base}/releases?per_page=30`).catch(() => []),
  ]);

  const files = tree.tree.filter((item) => item.type === "blob").map((item) => ({ path: item.path, size: item.size ?? 0 }));
  const total = Object.values(languageBytes).reduce((sum, bytes) => sum + bytes, 0);

  return {
    ...simpleRepo(info),
    branch,
    license: info.license ? (info.license.spdx_id === "NOASSERTION" ? info.license.name : info.license.spdx_id) : "",
    files,
    directories: tree.tree.filter((item) => item.type === "tree").map((item) => item.path),
    fileCount: files.length,
    size: files.reduce((sum, f) => sum + f.size, 0),
    languages: Object.entries(languageBytes).map(([name, bytes]) => ({ name, percent: (bytes / total) * 100 })),
    releases: releases.map((r) => ({ name: r.name || r.tag_name, tag: r.tag_name, date: r.published_at, body: r.body ?? "" })),
    workflows: files.map((f) => f.path).filter((p) => /^\.github\/workflows\/[^/]+\.ya?ml$/i.test(p)),
    archive: `https://github.com/${GITHUB_USER}/${encodeURIComponent(info.name)}/archive/refs/heads/${branch}.zip`,
  };
}

async function renderRepo(page, route) {
  page.innerHTML = `
    <div class="wrap repos-wrap">
      <a class="back with-icon" href="#repos">← repos</a>
      <div class="repo-body">${loadingHTML()}</div>
    </div>`;
  const body = $(".repo-body", page);

  try {
    loadedRepos.set(route.slug.toLowerCase(), await getRepo(route.slug));
  } catch (error) {
    if (error.status === 404) {
      body.innerHTML = `<div class="repo-empty"><h1>repository not found</h1><a href="#repos">browse repositories</a></div>`;
    } else {
      body.innerHTML = errorHTML();
      $(".retry", body).onclick = () => renderRepo(page, route);
    }
    return;
  }
  drawRepo();
}

// draws the repo page for whatever tab / folder the url points at
function drawRepo() {
  const body = $(".page .repo-body");
  const route = readRoute();
  const repo = loadedRepos.get(route.slug?.toLowerCase());
  if (!body || !repo) return;

  const tabs = [
    { tab: "code", label: "code", count: 0 },
    { tab: "releases", label: "releases", count: repo.releases.length },
    { tab: "deployments", label: "deploys", count: repo.deployments.length },
  ];

  body.innerHTML = `
    <header class="repo-heading">
      <div class="repo-heading-title">
        <h1>${esc(repo.name)}</h1>
        ${repo.archived ? `<span class="repo-badge">archived</span>` : ""}
      </div>
      ${repo.description ? `<p class="muted">${esc(repo.description)}</p>` : ""}
      ${repo.topics.length ? `<div class="repo-topics">${repo.topics.map((t) => `<span>${esc(t)}</span>`).join("")}</div>` : ""}
      <div class="repo-overview">
        ${repo.updated ? `<span title="Last pushed to">updated ${formatDate(repo.updated)}</span>` : ""}
        ${repo.license ? `<span>${esc(repo.license)} license</span>` : ""}
      </div>
    </header>
    <div class="repo-toolbar">
      <div class="repo-tabs" role="navigation" aria-label="Repository sections">
        ${tabs
          .map((t) => {
            const on = route.tab === t.tab;
            return `<a href="${repoHref(repo.slug, t.tab)}" class="${on ? "on" : ""}" ${on ? `aria-current="page"` : ""}>${t.label}${t.count ? `<span>${t.count}</span>` : ""}</a>`;
          })
          .join("")}
      </div>
      <a class="repo-download" href="${esc(repo.archive)}" download="${esc(repo.slug)}.zip" title="Download source as ZIP">${icon("download")}download .zip</a>
    </div>
    <div class="repo-tab"></div>`;

  const tab = $(".repo-tab", body);
  if (route.tab === "code") drawCodeTab(tab, repo, route.path);
  if (route.tab === "releases") drawReleases(tab, repo);
  if (route.tab === "deployments") drawDeployments(tab, repo);
}

// ---------- code tab: folders, files, readme ----------

function drawCodeTab(tab, repo, currentPath) {
  const file = repo.files.find((f) => f.path === currentPath);
  const folder = file ? currentPath.split("/").slice(0, -1).join("/") : currentPath;
  const prefix = folder ? `${folder}/` : "";

  // work out what's directly inside this folder
  const entries = new Map();
  for (const dir of repo.directories) {
    if (!dir.startsWith(prefix)) continue;
    const name = dir.slice(prefix.length).split("/")[0];
    if (name) entries.set(name, { name, path: prefix + name, directory: true, size: 0 });
  }
  for (const f of repo.files) {
    if (!f.path.startsWith(prefix)) continue;
    const rest = f.path.slice(prefix.length);
    const name = rest.split("/")[0];
    if (!entries.has(name)) entries.set(name, { name, path: prefix + name, directory: rest.includes("/"), size: f.size });
  }
  const items = [...entries.values()].sort((a, b) => Number(b.directory) - Number(a.directory) || a.name.localeCompare(b.name));

  const parts = currentPath.split("/").filter(Boolean);
  const readme = repo.files.find((f) => f.path.startsWith(prefix) && /^readme(?:\.md|\.markdown|\.txt)?$/i.test(f.path.slice(prefix.length)));
  const missing = currentPath && !file && !repo.directories.includes(currentPath);

  tab.innerHTML = `
    <div class="repo-browser-heading">
      <span class="repo-branch with-icon">${icon("branch")}${esc(repo.branch)}</span>
      <span class="muted small">${repo.fileCount} files${repo.directories.length ? `, ${repo.directories.length} folders` : ""}, ${formatSize(repo.size)}</span>
    </div>
    <nav class="repo-breadcrumb" aria-label="Repository path">
      <a href="${repoHref(repo.slug)}">${esc(repo.name)}</a>
      ${parts
        .map((part, i) => {
          const label = i === parts.length - 1 ? `<strong>${esc(part)}</strong>` : `<a href="${repoHref(repo.slug, "code", parts.slice(0, i + 1).join("/"))}">${esc(part)}</a>`;
          return `<span><span class="muted">/</span>${label}</span>`;
        })
        .join("")}
    </nav>
    <div class="repo-code"></div>
    ${
      repo.languages.length
        ? `<div class="repo-language-section"><h2>languages</h2>${languageBar(repo.languages)}</div>`
        : ""
    }
    ${
      repo.workflows.length
        ? `<details class="repo-workflows">
            <summary>workflows (${repo.workflows.length})</summary>
            ${repo.workflows.map((w) => `<a class="with-icon" href="${repoHref(repo.slug, "code", w)}">${icon("file")}${esc(w.split("/").pop())}</a>`).join("")}
          </details>`
        : ""
    }`;

  const code = $(".repo-code", tab);

  if (missing) {
    code.innerHTML = `
      <div class="repo-empty">
        ${icon("file")}
        <h2>this path isn't in the repository</h2>
        <a href="${repoHref(repo.slug)}">back to files</a>
      </div>`;
    return;
  }

  if (file) {
    code.append(filePanel(repo, file));
    return;
  }

  code.innerHTML = `
    <div class="repo-file-list">
      <div class="repo-tree-head"><span>name</span><span>size</span></div>
      ${
        folder
          ? `<a class="repo-tree-row" href="${repoHref(repo.slug, "code", folder.split("/").slice(0, -1).join("/"))}"><span class="with-icon">${icon("folder")}..</span></a>`
          : ""
      }
      ${items
        .map(
          (item) => `
        <a class="repo-tree-row" href="${repoHref(repo.slug, "code", item.path)}">
          <span class="with-icon ${item.directory ? "repo-directory" : ""}">${icon(item.directory ? "folder" : "file")}<span>${esc(item.name)}</span></span>
          <span class="muted tabular">${item.directory ? icon("chevron") : formatSize(item.size)}</span>
        </a>`,
        )
        .join("")}
      ${items.length ? "" : `<p class="repo-tree-empty muted">${folder ? "this folder is empty." : "no files in this repository."}</p>`}
    </div>`;

  if (readme) {
    loadFile(repo, readme).then((result) => {
      if (!result.content || !code.isConnected) return;
      const box = document.createElement("div");
      box.className = "repo-readme";
      box.innerHTML = `<div class="repo-panel-label with-icon">${icon("file")}${esc(readme.path)}</div>`;
      box.append(repoMarkdown(result.content, repo, readme.path));
      code.append(box);
    });
  }
}

// ---------- looking at one file ----------

const IMAGE_FILES = ["png", "jpg", "jpeg", "gif", "webp", "avif", "bmp", "ico"];
const VIDEO_FILES = ["mp4", "webm", "mov", "m4v", "ogv"];
const BINARY_FILES = ["zip", "gz", "tar", "7z", "rar", "exe", "dll", "so", "dylib", "bin", "jar", "class", "pdf", "woff", "woff2", "ttf", "otf", "eot", "mp3", "wav", "ogg", "flac", "psd", "wasm", "pyc"];

const extensionOf = (path) => (path.includes(".") ? path.split(".").pop().toLowerCase() : "");

function rawUrl(repo, path) {
  const branch = repo.branch.split("/").map(encodeURIComponent).join("/");
  const file = path.split("/").map(encodeURIComponent).join("/");
  return `https://raw.githubusercontent.com/${GITHUB_USER}/${encodeURIComponent(repo.name)}/${branch}/${file}`;
}

const fileCache = new Map();

// gets a file's text (or says why it can't be shown)
function loadFile(repo, file) {
  const key = `${repo.name}/${file.path}`;
  if (fileCache.has(key)) return fileCache.get(key);

  const ext = extensionOf(file.path);
  let request;
  if (IMAGE_FILES.includes(ext)) request = Promise.resolve({ media: { kind: "image", url: rawUrl(repo, file.path) } });
  else if (VIDEO_FILES.includes(ext)) request = Promise.resolve({ media: { kind: "video", url: rawUrl(repo, file.path) } });
  else if (BINARY_FILES.includes(ext)) request = Promise.resolve({ content: null, unavailable: "this file can't be shown here." });
  else if (file.size > 1000000) request = Promise.resolve({ content: null, unavailable: "this file is too big to show here." });
  else {
    request = fetch(rawUrl(repo, file.path))
      .then((res) => {
        if (!res.ok) throw new Error("missing");
        return res.text();
      })
      .then((text) => (text.includes("\u0000") ? { content: null, unavailable: "this file can't be shown here." } : { content: text }))
      .catch(() => {
        fileCache.delete(key);
        return { content: null, unavailable: "couldn't load this file." };
      });
  }
  fileCache.set(key, request);
  return request;
}

function filePanel(repo, file) {
  const panel = document.createElement("div");
  panel.className = "repo-file-panel";
  panel.innerHTML = loadingHTML();

  const isMarkdown = /\.(md|mdx)$/i.test(file.path);
  let mode = isMarkdown ? "preview" : "source";
  let wrap = true;
  const language = fileLanguage(file.path);
  let result = null;

  function draw() {
    const lineCount = result.content == null ? 0 : splitLines(result.content).length;
    const hasText = result.content != null;

    panel.innerHTML = `
      <div class="repo-file-toolbar">
        <div class="repo-file-meta">
          <span class="repo-source-language"><span style="color:${languageColor(language)}">${languageIcon(language)}</span>${esc(language)}</span>
          <span class="muted">${hasText ? `${lineCount} lines, ` : ""}${formatSize(file.size)}</span>
        </div>
        <div class="repo-file-actions">
          ${
            isMarkdown && hasText
              ? `<div class="repo-toggle">
                  <button data-mode="preview" aria-pressed="${mode === "preview"}">preview</button>
                  <button data-mode="source" aria-pressed="${mode === "source"}">source</button>
                </div>`
              : ""
          }
          ${hasText && (!isMarkdown || mode === "source") ? `<button class="repo-wrap-toggle" aria-pressed="${wrap}" title="Wrap long lines">${icon("wrap")}wrap</button>` : ""}
          ${
            hasText
              ? `<button class="repo-icon-button copy" title="Copy source" aria-label="Copy source">${icon("copy")}</button>
                 <button class="repo-icon-button download" title="Download file" aria-label="Download file">${icon("download")}</button>`
              : ""
          }
        </div>
      </div>
      <div class="repo-copy-status" role="status" hidden></div>`;

    if (result.media) {
      const box = document.createElement("div");
      box.className = "repo-media-preview";
      const name = file.path.split("/").pop();
      box.innerHTML =
        (result.media.kind === "image"
          ? `<img src="${esc(result.media.url)}" alt="${esc(file.path)}">`
          : `<video controls preload="metadata" src="${esc(result.media.url)}">Your browser cannot play this video.</video>`) +
        `<a href="${esc(result.media.url)}" download="${esc(name)}">download file</a>`;
      panel.append(box);
    } else if (!hasText) {
      panel.insertAdjacentHTML("beforeend", `<div class="repo-empty">${icon("file")}<p>${esc(result.unavailable)}</p></div>`);
    } else if (isMarkdown && mode === "preview") {
      panel.append(repoMarkdown(result.content, repo, file.path));
    } else {
      panel.append(codeViewer({ code: result.content, path: file.path, wrap }));
    }

    // buttons
    for (const button of $$("[data-mode]", panel)) button.onclick = () => ((mode = button.dataset.mode), draw());
    const wrapButton = $(".repo-wrap-toggle", panel);
    if (wrapButton) wrapButton.onclick = () => ((wrap = !wrap), draw());
    const copyButton = $(".copy", panel);
    if (copyButton) copyButton.onclick = () => copySource(copyButton);
    const downloadButton = $(".download", panel);
    if (downloadButton) downloadButton.onclick = downloadSource;
  }

  function copySource(button) {
    const status = $(".repo-copy-status", panel);
    const show = (text, copied) => {
      status.hidden = false;
      status.textContent = text;
      if (copied) button.innerHTML = icon("check");
      clearTimeout(panel.copyTimer);
      panel.copyTimer = setTimeout(() => {
        status.hidden = true;
        button.innerHTML = icon("copy");
      }, 2000);
    };
    navigator.clipboard.writeText(result.content).then(
      () => show("copied", true),
      () => show("copy unavailable", false),
    );
  }

  function downloadSource() {
    const url = URL.createObjectURL(new Blob([result.content], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = file.path.split("/").pop() || "source.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  loadFile(repo, file).then((loaded) => {
    result = loaded;
    draw();
  });
  return panel;
}

// ---------- code with line numbers + colours ----------

function splitLines(code) {
  return code.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n");
}

// highlight.js gives back one long string of html. this cuts it into lines,
// closing any coloured <span> at the end of a line and reopening it on the next.
function splitHighlighted(html) {
  const lines = [];
  const open = [];
  let line = "";
  for (const part of html.split(/(<span[^>]*>|<\/span>|\n)/)) {
    if (part === "\n") {
      lines.push(line + "</span>".repeat(open.length));
      line = open.join("");
    } else if (part.startsWith("<span")) {
      open.push(part);
      line += part;
    } else if (part === "</span>") {
      open.pop();
      line += part;
    } else {
      line += part;
    }
  }
  lines.push(line + "</span>".repeat(open.length));
  return lines;
}

function codeViewer({ code, path = "", language = "", wrap = true, numbered = true }) {
  const text = splitLines(code).join("\n");
  let html = esc(text);
  const highlightAs = highlightLanguage(path, language);
  if (highlightAs) {
    try {
      html = hljs.highlight(text, { language: highlightAs, ignoreIllegals: true }).value;
    } catch {}
  }
  const lines = splitHighlighted(html);

  const box = document.createElement("div");
  box.className = `repo-source${wrap ? " is-wrapped" : ""}${numbered ? "" : " is-compact"}`;
  box.tabIndex = 0;
  box.setAttribute("role", "region");
  box.setAttribute("aria-label", path ? `Source code for ${path}` : "Code block");
  box.style.setProperty("--source-gutter", `${Math.max(3, String(lines.length).length + 1)}ch`);
  box.innerHTML = `<pre><code>${lines
    .map((line, i) => `<span class="repo-source-line">${numbered ? `<span class="repo-source-number" aria-hidden="true">${i + 1}</span>` : ""}<span class="repo-source-text">${line}</span></span>`)
    .join("")}</code></pre>`;
  return box;
}

// which highlight.js language to colour a file with (or "" for none)
function highlightLanguage(path, language) {
  if (!window.hljs) return "";
  const name = path.split("/").pop().toLowerCase();
  const guesses = [language, name === "dockerfile" ? "dockerfile" : "", extensionOf(path), ["vue", "svelte", "astro"].includes(extensionOf(path)) ? "xml" : ""];
  return guesses.find((guess) => guess && hljs.getLanguage(guess)) ?? "";
}

// ---------- markdown inside repos (readmes, releases) ----------

function repoMarkdown(text, repo, base = "") {
  const box = document.createElement("div");
  box.className = "md repo-markdown";
  box.innerHTML = markdown(text);

  // finds a file in the repo from a link like "docs/setup.md" or "../logo.png"
  const findFile = (href) => {
    try {
      const path = decodeURIComponent(new URL(href, `https://source.local/${base}`).pathname.slice(1));
      return repo.files.find((f) => f.path === path);
    } catch {}
  };
  const replaceWithText = (el, text, className = "") => {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = text;
    el.replaceWith(span);
  };

  for (const link of $$("a", box)) {
    const href = link.getAttribute("href");
    if (!href) replaceWithText(link, link.textContent);
    else if (/^https?:\/\//i.test(href)) {
      link.target = "_blank";
      link.rel = "noreferrer";
    } else if (!/^mailto:/i.test(href)) {
      const file = findFile(href);
      if (file) link.href = repoHref(repo.slug, "code", file.path);
      else replaceWithText(link, link.textContent);
    }
  }

  for (const img of $$("img", box)) {
    const src = img.getAttribute("src") ?? "";
    if (/^https:\/\//i.test(src)) continue;
    const file = src ? findFile(src) : null;
    if (file && IMAGE_FILES.concat("svg").includes(extensionOf(file.path))) img.src = rawUrl(repo, file.path);
    else replaceWithText(img, img.alt || "image", "muted");
    img.loading = "lazy";
  }

  // code blocks get the same colourful viewer as files (without line numbers)
  for (const pre of $$("pre", box)) {
    const code = $("code", pre);
    if (!code) continue;
    const language = code.className.match(/language-([\w+-]+)/)?.[1] ?? "";
    pre.replaceWith(codeViewer({ code: code.textContent, language, numbered: false }));
  }
  return box;
}

// ---------- releases + deploys tabs ----------

function drawReleases(tab, repo) {
  if (!repo.releases.length) {
    tab.innerHTML = `<div class="repo-empty"><h2>no releases yet.</h2></div>`;
    return;
  }
  tab.innerHTML = `<div class="repo-releases"></div>`;
  repo.releases.forEach((release, i) => {
    const article = document.createElement("article");
    article.className = "repo-release";
    article.innerHTML = `
      <div class="repo-release-heading">
        <h2>${esc(release.name)}</h2>
        ${i === 0 ? `<span class="repo-badge repo-latest">latest</span>` : ""}
      </div>
      <div class="repo-release-meta">
        <span class="with-icon">${icon("tag")}${esc(release.tag)}</span>
        ${release.date ? `<time datetime="${esc(release.date)}">${formatDate(release.date)}</time>` : ""}
      </div>`;
    if (release.body) article.append(repoMarkdown(release.body, repo));
    tab.firstElementChild.append(article);
  });
}

function drawDeployments(tab, repo) {
  if (!repo.deployments.length) {
    tab.innerHTML = `<div class="repo-empty"><h2>no deployments yet.</h2></div>`;
    return;
  }
  tab.innerHTML = `
    <div class="repo-deployments">
      ${repo.deployments
        .map((site) => {
          const url = new URL(site.url);
          return `
            <a href="${esc(site.url)}" class="repo-deployment" target="_blank" rel="noreferrer">
              <span class="repo-deployment-icon">${icon("globe")}</span>
              <span class="repo-deployment-text">
                <strong>${esc(site.name)}</strong>
                <span>${esc(url.host + (url.pathname === "/" ? "" : url.pathname))}</span>
              </span>
              ${icon("arrow")}
            </a>`;
        })
        .join("")}
    </div>`;
}

// ---------- language colours, bar + icons ----------

const LANGUAGE_COLORS = {
  JavaScript: "#f1e05a", TypeScript: "#6ba6ed", HTML: "#e98364", CSS: "#b197ed", SCSS: "#cf92b9",
  Python: "#73a8d3", Rust: "#dea584", Go: "#56c6d9", Java: "#dfaa79", Kotlin: "#b99aff",
  C: "#a8b9cc", "C++": "#f18eb1", "C#": "#9bd17e", Ruby: "#df7777", PHP: "#9fa8dd",
  Swift: "#f5a277", Vue: "#75cfa6", Svelte: "#ff916f", Astro: "#ce97fa", Shell: "#a4ce80",
  PowerShell: "#7eb7ed", Lua: "#989ce9", Dart: "#67c9df", Elixir: "#b69ad0", Zig: "#edbf79",
  GDScript: "#83b5dc", SQL: "#e3bc75",
};
const languageColor = (name) => LANGUAGE_COLORS[name] ?? "#93a6bd";

// which brand icon each language uses (anything else gets a </> icon)
const LANGUAGE_ICONS = {
  JavaScript: "JavaScript", TypeScript: "TypeScript", HTML: "HTML5", CSS: "CSS", SCSS: "Sass", Sass: "Sass",
  Python: "Python", Rust: "Rust", Go: "Go", Kotlin: "Kotlin", C: "C", "C++": "C++", Ruby: "Ruby", PHP: "PHP",
  Swift: "Swift", Vue: "Vue.js", Svelte: "Svelte", Astro: "Astro", Lua: "Lua", Dart: "Dart", Elixir: "Elixir",
  Dockerfile: "Docker",
};
const languageIcon = (name) => (LANGUAGE_ICONS[name] ? brandIcon(LANGUAGE_ICONS[name]) : icon("code"));

// guesses a file's language from its name, for the bar above the code
const FILE_LANGUAGES = {
  js: "JavaScript", mjs: "JavaScript", cjs: "JavaScript", jsx: "JavaScript", ts: "TypeScript", tsx: "TypeScript",
  html: "HTML", htm: "HTML", css: "CSS", scss: "SCSS", sass: "Sass", py: "Python", rs: "Rust", go: "Go",
  java: "Java", kt: "Kotlin", c: "C", h: "C", cpp: "C++", cc: "C++", hpp: "C++", cs: "C#", rb: "Ruby",
  php: "PHP", swift: "Swift", vue: "Vue", svelte: "Svelte", astro: "Astro", sh: "Shell", bash: "Shell",
  ps1: "PowerShell", lua: "Lua", dart: "Dart", ex: "Elixir", exs: "Elixir", zig: "Zig", gd: "GDScript",
  sql: "SQL", md: "Markdown", json: "JSON", yml: "YAML", yaml: "YAML", txt: "Text",
};
function fileLanguage(path) {
  if (path.split("/").pop().toLowerCase() === "dockerfile") return "Dockerfile";
  const ext = extensionOf(path);
  return FILE_LANGUAGES[ext] ?? (ext ? ext.toUpperCase() : "Text");
}

function languageBar(languages) {
  const label = (l) => `${l.name} ${l.percent.toFixed(1)}%`;
  return `
    <div class="repo-languages">
      <div class="language-bar" role="img" aria-label="${esc(languages.map(label).join(", "))}">
        ${languages.map((l) => `<span style="width:${l.percent}%;background:${languageColor(l.name)}" title="${esc(label(l))}"></span>`).join("")}
      </div>
      <ul class="language-legend">
        ${languages
          .map(
            (l) => `
          <li>
            <span style="color:${languageColor(l.name)}">${languageIcon(l.name)}</span>
            ${esc(l.name)}
            <span class="muted tabular">${l.percent < 0.1 ? "<0.1" : l.percent.toFixed(1)}%</span>
          </li>`,
          )
          .join("")}
      </ul>
    </div>`;
}

// =====================================================================
// icons
// =====================================================================

// simple line icons used around the site
const ICONS = {
  repo: `<path d="M5 3h14v18H7a2 2 0 0 1-2-2V3Z"/><path d="M5 17h14M9 6v5"/>`,
  folder: `<path d="M3 7V5h6l2 2h10v13H3V7Z"/>`,
  file: `<path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v5h4"/>`,
  search: `<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>`,
  branch: `<circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M6 7v10m12-10c0 6-12 3-12 8"/>`,
  tag: `<path d="M3 3h8l10 10-8 8L3 11V3Z"/><circle cx="7.5" cy="7.5" r=".75"/>`,
  globe: `<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>`,
  arrow: `<path d="M6 18 18 6M6 6h12v12"/>`,
  copy: `<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V3H3v13h5"/>`,
  download: `<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>`,
  code: `<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>`,
  wrap: `<path d="M3 5h18M3 10h13a4 4 0 0 1 0 8h-5m3-3-3 3 3 3M3 15h3"/>`,
  check: `<path d="m5 12 4 4L19 6"/>`,
  chevron: `<path d="m9 5 7 7-7 7"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
  mail: `<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4 7 8 6 8-6"/>`,
};

function icon(name) {
  const width = name === "mail" ? 2 : 1.6;
  return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

function brandIcon(name) {
  if (!BRAND_ICONS[name]) return icon("code");
  return `<svg class="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="${BRAND_ICONS[name]}"/></svg>`;
}

// logos from simple-icons.org
const BRAND_ICONS = {
  "Astro": "M8.358 20.162c-1.186-1.07-1.532-3.316-1.038-4.944.856 1.026 2.043 1.352 3.272 1.535 1.897.283 3.76.177 5.522-.678.202-.098.388-.229.608-.36.166.473.209.95.151 1.437-.14 1.185-.738 2.1-1.688 2.794-.38.277-.782.525-1.175.787-1.205.804-1.531 1.747-1.078 3.119l.044.148a3.158 3.158 0 0 1-1.407-1.188 3.31 3.31 0 0 1-.544-1.815c-.004-.32-.004-.642-.048-.958-.106-.769-.472-1.113-1.161-1.133-.707-.02-1.267.411-1.415 1.09-.012.053-.028.104-.045.165h.002zm-5.961-4.445s3.24-1.575 6.49-1.575l2.451-7.565c.092-.366.36-.614.662-.614.302 0 .57.248.662.614l2.45 7.565c3.85 0 6.491 1.575 6.491 1.575L16.088.727C15.93.285 15.663 0 15.303 0H8.697c-.36 0-.615.285-.784.727l-5.516 14.99z",
  "C": "M16.5921 9.1962s-.354-3.298-3.627-3.39c-3.2741-.09-4.9552 2.474-4.9552 6.14 0 3.6651 1.858 6.5972 5.0451 6.5972 3.184 0 3.5381-3.665 3.5381-3.665l6.1041.365s.36 3.31-2.196 5.836c-2.552 2.5241-5.6901 2.9371-7.8762 2.9201-2.19-.017-5.2261.034-8.1602-2.97-2.938-3.0101-3.436-5.9302-3.436-8.8002 0-2.8701.556-6.6702 4.047-9.5502C7.444.72 9.849 0 12.254 0c10.0422 0 10.7172 9.2602 10.7172 9.2602z",
  "C++": "M22.394 6c-.167-.29-.398-.543-.652-.69L12.926.22c-.509-.294-1.34-.294-1.848 0L2.26 5.31c-.508.293-.923 1.013-.923 1.6v10.18c0 .294.104.62.271.91.167.29.398.543.652.69l8.816 5.09c.508.293 1.34.293 1.848 0l8.816-5.09c.254-.147.485-.4.652-.69.167-.29.27-.616.27-.91V6.91c.003-.294-.1-.62-.268-.91zM12 19.11c-3.92 0-7.109-3.19-7.109-7.11 0-3.92 3.19-7.11 7.11-7.11a7.133 7.133 0 016.156 3.553l-3.076 1.78a3.567 3.567 0 00-3.08-1.78A3.56 3.56 0 008.444 12 3.56 3.56 0 0012 15.555a3.57 3.57 0 003.08-1.778l3.078 1.78A7.135 7.135 0 0112 19.11zm7.11-6.715h-.79v.79h-.79v-.79h-.79v-.79h.79v-.79h.79v.79h.79zm2.962 0h-.79v.79h-.79v-.79h-.79v-.79h.79v-.79h.79v.79h.79z",
  "CSS": "M0 0v20.16A3.84 3.84 0 0 0 3.84 24h16.32A3.84 3.84 0 0 0 24 20.16V3.84A3.84 3.84 0 0 0 20.16 0Zm14.256 13.08c1.56 0 2.28 1.08 2.304 2.64h-1.608c.024-.288-.048-.6-.144-.84-.096-.192-.288-.264-.552-.264-.456 0-.696.264-.696.84-.024.576.288.888.768 1.08.72.288 1.608.744 1.92 1.296q.432.648.432 1.656c0 1.608-.912 2.592-2.496 2.592-1.656 0-2.4-1.032-2.424-2.688h1.68c0 .792.264 1.176.792 1.176.264 0 .456-.072.552-.24.192-.312.24-1.176-.048-1.512-.312-.408-.912-.6-1.32-.816q-.828-.396-1.224-.936c-.24-.36-.36-.888-.36-1.536 0-1.44.936-2.472 2.424-2.448m5.4 0c1.584 0 2.304 1.08 2.328 2.64h-1.608c0-.288-.048-.6-.168-.84-.096-.192-.264-.264-.528-.264-.48 0-.72.264-.72.84s.288.888.792 1.08c.696.288 1.608.744 1.92 1.296.264.432.408.984.408 1.656.024 1.608-.888 2.592-2.472 2.592-1.68 0-2.424-1.056-2.448-2.688h1.68c0 .744.264 1.176.792 1.176.264 0 .456-.072.552-.24.216-.312.264-1.176-.048-1.512-.288-.408-.888-.6-1.32-.816-.552-.264-.96-.576-1.2-.936s-.36-.888-.36-1.536c-.024-1.44.912-2.472 2.4-2.448m-11.031.018c.711-.006 1.419.198 1.839.63.432.432.672 1.128.648 1.992H9.336c.024-.456-.096-.792-.432-.96-.312-.144-.768-.048-.888.24-.12.264-.192.576-.168.864v3.504c0 .744.264 1.128.768 1.128a.65.65 0 0 0 .552-.264c.168-.24.192-.552.168-.84h1.776c.096 1.632-.984 2.712-2.568 2.688-1.536 0-2.496-.864-2.472-2.472v-4.032c0-.816.24-1.44.696-1.848.432-.408 1.146-.624 1.857-.63",
  "Dart": "M4.105 4.105S9.158 1.58 11.684.316a3.079 3.079 0 0 1 1.481-.315c.766.047 1.677.788 1.677.788L24 9.948v9.789h-4.263V24H9.789l-9-9C.303 14.5 0 13.795 0 13.105c0-.319.18-.818.316-1.105l3.789-7.895zm.679.679v11.787c.002.543.021 1.024.498 1.508L10.204 23h8.533v-4.263L4.784 4.784zm12.055-.678c-.899-.896-1.809-1.78-2.74-2.643-.302-.267-.567-.468-1.07-.462-.37.014-.87.195-.87.195L6.341 4.105l10.498.001z",
  "Discord": "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z",
  "Docker": "M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z",
  "Elixir": "M19.793 16.575c0 3.752-2.927 7.426-7.743 7.426-5.249 0-7.843-3.71-7.843-8.29 0-5.21 3.892-12.952 8-15.647a.397.397 0 0 1 .61.371 9.716 9.716 0 0 0 1.694 6.518c.522.795 1.092 1.478 1.763 2.352.94 1.227 1.637 1.906 2.644 3.842l.015.028a7.107 7.107 0 0 1 .86 3.4z",
  "GitHub": "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  "Go": "M1.811 10.231c-.047 0-.058-.023-.035-.059l.246-.315c.023-.035.081-.058.128-.058h4.172c.046 0 .058.035.035.07l-.199.303c-.023.036-.082.07-.117.07zM.047 11.306c-.047 0-.059-.023-.035-.058l.245-.316c.023-.035.082-.058.129-.058h5.328c.047 0 .07.035.058.07l-.093.28c-.012.047-.058.07-.105.07zm2.828 1.075c-.047 0-.059-.035-.035-.07l.163-.292c.023-.035.07-.07.117-.07h2.337c.047 0 .07.035.07.082l-.023.28c0 .047-.047.082-.082.082zm12.129-2.36c-.736.187-1.239.327-1.963.514-.176.046-.187.058-.34-.117-.174-.199-.303-.327-.548-.444-.737-.362-1.45-.257-2.115.175-.795.514-1.204 1.274-1.192 2.22.011.935.654 1.706 1.577 1.835.795.105 1.46-.175 1.987-.77.105-.13.198-.27.315-.434H10.47c-.245 0-.304-.152-.222-.35.152-.362.432-.97.596-1.274a.315.315 0 01.292-.187h4.253c-.023.316-.023.631-.07.947a4.983 4.983 0 01-.958 2.29c-.841 1.11-1.94 1.8-3.33 1.986-1.145.152-2.209-.07-3.143-.77-.865-.655-1.356-1.52-1.484-2.595-.152-1.274.222-2.419.993-3.424.83-1.086 1.928-1.776 3.272-2.02 1.098-.2 2.15-.07 3.096.571.62.41 1.063.97 1.356 1.648.07.105.023.164-.117.2m3.868 6.461c-1.064-.024-2.034-.328-2.852-1.029a3.665 3.665 0 01-1.262-2.255c-.21-1.32.152-2.489.947-3.529.853-1.122 1.881-1.706 3.272-1.95 1.192-.21 2.314-.095 3.33.595.923.63 1.496 1.484 1.648 2.605.198 1.578-.257 2.863-1.344 3.962-.771.783-1.718 1.273-2.805 1.495-.315.06-.63.07-.934.106zm2.78-4.72c-.011-.153-.011-.27-.034-.387-.21-1.157-1.274-1.81-2.384-1.554-1.087.245-1.788.935-2.045 2.033-.21.912.234 1.835 1.075 2.21.643.28 1.285.244 1.905-.07.923-.48 1.425-1.228 1.484-2.233z",
  "HTML5": "M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z",
  "JavaScript": "M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z",
  "Kotlin": "M24 24H0V0h24L12 12Z",
  "Lua": "M.38 10.377l-.272-.037c-.048.344-.082.695-.101 1.041l.275.016c.018-.34.051-.682.098-1.02zM4.136 3.289l-.184-.205c-.258.232-.509.48-.746.734l.202.188c.231-.248.476-.49.728-.717zM5.769 2.059l-.146-.235c-.296.186-.586.385-.863.594l.166.219c.27-.203.554-.399.843-.578zM1.824 18.369c.185.297.384.586.593.863l.22-.164c-.205-.271-.399-.555-.58-.844l-.233.145zM1.127 16.402l-.255.104c.129.318.274.635.431.943l.005.01.245-.125-.005-.01c-.153-.301-.295-.611-.421-.922zM.298 9.309l.269.063c.076-.332.168-.664.272-.986l-.261-.087c-.108.332-.202.672-.28 1.01zM.274 12.42l-.275.01c.012.348.04.699.083 1.043l.273-.033c-.042-.336-.069-.68-.081-1.02zM.256 14.506c.073.34.162.682.264 1.014l.263-.08c-.1-.326-.187-.658-.258-.99l-.269.056zM11.573.275L11.563 0c-.348.012-.699.039-1.044.082l.034.273c.338-.041.68-.068 1.02-.08zM23.221 8.566c.1.326.186.66.256.992l.27-.059c-.072-.34-.16-.682-.262-1.014l-.264.081zM17.621 1.389c-.309-.164-.627-.314-.947-.449l-.107.252c.314.133.625.281.926.439l.128-.242zM15.693.572c-.332-.105-.67-.199-1.01-.277l-.063.268c.332.076.664.168.988.273l.085-.264zM6.674 1.545c.298-.15.606-.291.916-.418L7.486.873c-.317.127-.632.272-.937.428l-.015.008.125.244.015-.008zM23.727 11.588l.275-.01a11.797 11.797 0 0 0-.082-1.045l-.273.033c.041.338.068.682.08 1.022zM13.654.105c-.346-.047-.696-.08-1.043-.098l-.014.273c.339.018.683.051 1.019.098l.038-.273zM9.544.527l-.058-.27c-.34.072-.681.16-1.014.264l.081.262c.325-.099.659-.185.991-.256zM1.921 5.469l.231.15c.185-.285.384-.566.592-.834l-.217-.17c-.213.276-.417.563-.606.854zM.943 7.318l.253.107c.132-.313.28-.625.439-.924l-.243-.128c-.163.307-.314.625-.449.945zM18.223 21.943l.145.234c.295-.186.586-.385.863-.594l-.164-.219c-.272.204-.557.4-.844.579zM21.248 19.219l.217.17c.215-.273.418-.561.607-.854l-.23-.148c-.186.285-.385.564-.594.832zM19.855 20.715l.184.203c.258-.23.51-.479.746-.732l-.201-.188c-.23.248-.477.488-.729.717zM22.359 17.504l.244.129c.162-.307.314-.625.449-.945l-.254-.107a11.27 11.27 0 0 1-.439.923zM23.617 13.629l.273.039c.049-.346.082-.695.102-1.043l-.275-.014c-.018.338-.051.682-.1 1.018zM23.156 15.621l.264.086c.107-.332.201-.67.279-1.01l-.268-.063c-.077.333-.169.665-.275.987zM22.453 6.672c.154.303.297.617.424.932l.256-.104c-.131-.322-.277-.643-.436-.953l-.244.125zM8.296 23.418c.331.107.67.201 1.009.279l.062-.268c-.331-.076-.663-.168-.986-.273l-.085.262zM10.335 23.889c.345.049.696.082 1.043.102l.014-.275c-.339-.018-.682-.051-1.019-.098l-.038.271zM17.326 22.449c-.303.154-.613.297-.926.424l.104.256c.318-.131.639-.275.947-.434l.004-.002-.123-.246-.006.002zM4.613 21.467c.274.213.562.418.854.605l.149-.23c-.285-.184-.565-.385-.833-.592l-.17.217zM12.417 23.725l.009.275c.348-.014.699-.041 1.045-.084l-.035-.271c-.336.041-.68.068-1.019.08zM6.37 22.604c.307.162.625.314.946.449l.107-.254c-.313-.133-.624-.279-.924-.439l-.129.244zM3.083 20.041c.233.258.48.51.734.746l.188-.201c-.249-.23-.49-.477-.717-.729l-.205.184zM14.445 23.475l.059.27c.34-.074.68-.162 1.014-.266l-.082-.262c-.325.099-.659.185-.991.258zM21.18.129A2.689 2.689 0 1 0 21.18 5.507 2.689 2.689 0 1 0 21.18.129zM15.324 15.447c0 .471.314.66.852.66.67 0 1.297-.396 1.297-1.016v-.645c-.23.107-.379.141-1.107.24-.735.109-1.042.306-1.042.761zM12 2.818c-5.07 0-9.18 4.109-9.18 9.18 0 5.068 4.11 9.18 9.18 9.18 5.07 0 9.18-4.111 9.18-9.18 0-5.07-4.11-9.18-9.18-9.18zm-2.487 13.77H5.771v-6.023h.769v5.346h2.974v.677zm4.13 0h-.619v-.67c-.405.57-.811.793-1.446.793-.843 0-1.38-.463-1.38-1.182v-3.271h.686v3c0 .52.347.85.893.85.719 0 1.181-.578 1.181-1.461v-2.389h.686v4.33zm-.53-8.393c0-1.484 1.205-2.689 2.689-2.689s2.688 1.205 2.688 2.689-1.203 2.688-2.688 2.688-2.689-1.203-2.689-2.688zm5.567 7.856v.52c-.223.059-.33.074-.471.074-.34 0-.637-.238-.711-.57-.381.406-.918.637-1.471.637-.877 0-1.422-.463-1.422-1.248 0-.527.256-.916.76-1.123.266-.107.414-.141 1.389-.264.545-.066.719-.191.719-.48v-.182c0-.412-.348-.645-.967-.645-.645 0-.957.24-1.016.77h-.693c.041-1 .686-1.404 1.734-1.404 1.066 0 1.627.412 1.627 1.182v2.412c0 .215.133.338.373.338.041-.002.074-.002.149-.017z",
  "PHP": "M7.01 10.207h-.944l-.515 2.648h.838c.556 0 .97-.105 1.242-.314.272-.21.455-.559.55-1.049.092-.47.05-.802-.124-.995-.175-.193-.523-.29-1.047-.29zM12 5.688C5.373 5.688 0 8.514 0 12s5.373 6.313 12 6.313S24 15.486 24 12c0-3.486-5.373-6.312-12-6.312zm-3.26 7.451c-.261.25-.575.438-.917.551-.336.108-.765.164-1.285.164H5.357l-.327 1.681H3.652l1.23-6.326h2.65c.797 0 1.378.209 1.744.628.366.418.476 1.002.33 1.752a2.836 2.836 0 0 1-.305.847c-.143.255-.33.49-.561.703zm4.024.715l.543-2.799c.063-.318.039-.536-.068-.651-.107-.116-.336-.174-.687-.174H11.46l-.704 3.625H9.388l1.23-6.327h1.367l-.327 1.682h1.218c.767 0 1.295.134 1.586.401s.378.7.263 1.299l-.572 2.944h-1.389zm7.597-2.265a2.782 2.782 0 0 1-.305.847c-.143.255-.33.49-.561.703a2.44 2.44 0 0 1-.917.551c-.336.108-.765.164-1.286.164h-1.18l-.327 1.682h-1.378l1.23-6.326h2.649c.797 0 1.378.209 1.744.628.366.417.477 1.001.331 1.751zM17.766 10.207h-.943l-.516 2.648h.838c.557 0 .971-.105 1.242-.314.272-.21.455-.559.551-1.049.092-.47.049-.802-.125-.995s-.524-.29-1.047-.29z",
  "Python": "M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z",
  "Ruby": "M20.156.083c3.033.525 3.893 2.598 3.829 4.77L24 4.822 22.635 22.71 4.89 23.926h.016C3.433 23.864.15 23.729 0 19.139l1.645-3 2.819 6.586.503 1.172 2.805-9.144-.03.007.016-.03 9.255 2.956-1.396-5.431-.99-3.9 8.82-.569-.615-.51L16.5 2.114 20.159.073l-.003.01zM0 19.089zM5.13 5.073c3.561-3.533 8.157-5.621 9.922-3.84 1.762 1.777-.105 6.105-3.673 9.636-3.563 3.532-8.103 5.734-9.864 3.957-1.766-1.777.045-6.217 3.612-9.75l.003-.003z",
  "Rust": "M23.8346 11.7033l-1.0073-.6236a13.7268 13.7268 0 00-.0283-.2936l.8656-.8069a.3483.3483 0 00-.1154-.578l-1.1066-.414a8.4958 8.4958 0 00-.087-.2856l.6904-.9587a.3462.3462 0 00-.2257-.5446l-1.1663-.1894a9.3574 9.3574 0 00-.1407-.2622l.49-1.0761a.3437.3437 0 00-.0274-.3361.3486.3486 0 00-.3006-.154l-1.1845.0416a6.7444 6.7444 0 00-.1873-.2268l.2723-1.153a.3472.3472 0 00-.417-.4172l-1.1532.2724a14.0183 14.0183 0 00-.2278-.1873l.0415-1.1845a.3442.3442 0 00-.49-.328l-1.076.491c-.0872-.0476-.1742-.0952-.2623-.1407l-.1903-1.1673A.3483.3483 0 0016.256.955l-.9597.6905a8.4867 8.4867 0 00-.2855-.086l-.414-1.1066a.3483.3483 0 00-.5781-.1154l-.8069.8666a9.2936 9.2936 0 00-.2936-.0284L12.2946.1683a.3462.3462 0 00-.5892 0l-.6236 1.0073a13.7383 13.7383 0 00-.2936.0284L9.9803.3374a.3462.3462 0 00-.578.1154l-.4141 1.1065c-.0962.0274-.1903.0567-.2855.086L7.744.955a.3483.3483 0 00-.5447.2258L7.009 2.348a9.3574 9.3574 0 00-.2622.1407l-1.0762-.491a.3462.3462 0 00-.49.328l.0416 1.1845a7.9826 7.9826 0 00-.2278.1873L3.8413 3.425a.3472.3472 0 00-.4171.4171l.2713 1.1531c-.0628.075-.1255.1509-.1863.2268l-1.1845-.0415a.3462.3462 0 00-.328.49l.491 1.0761a9.167 9.167 0 00-.1407.2622l-1.1662.1894a.3483.3483 0 00-.2258.5446l.6904.9587a13.303 13.303 0 00-.087.2855l-1.1065.414a.3483.3483 0 00-.1155.5781l.8656.807a9.2936 9.2936 0 00-.0283.2935l-1.0073.6236a.3442.3442 0 000 .5892l1.0073.6236c.008.0982.0182.1964.0283.2936l-.8656.8079a.3462.3462 0 00.1155.578l1.1065.4141c.0273.0962.0567.1914.087.2855l-.6904.9587a.3452.3452 0 00.2268.5447l1.1662.1893c.0456.088.0922.1751.1408.2622l-.491 1.0762a.3462.3462 0 00.328.49l1.1834-.0415c.0618.0769.1235.1528.1873.2277l-.2713 1.1541a.3462.3462 0 00.4171.4161l1.153-.2713c.075.0638.151.1255.2279.1863l-.0415 1.1845a.3442.3442 0 00.49.327l1.0761-.49c.087.0486.1741.0951.2622.1407l.1903 1.1662a.3483.3483 0 00.5447.2268l.9587-.6904a9.299 9.299 0 00.2855.087l.414 1.1066a.3452.3452 0 00.5781.1154l.8079-.8656c.0972.0111.1954.0203.2936.0294l.6236 1.0073a.3472.3472 0 00.5892 0l.6236-1.0073c.0982-.0091.1964-.0183.2936-.0294l.8069.8656a.3483.3483 0 00.578-.1154l.4141-1.1066a8.4626 8.4626 0 00.2855-.087l.9587.6904a.3452.3452 0 00.5447-.2268l.1903-1.1662c.088-.0456.1751-.0931.2622-.1407l1.0762.49a.3472.3472 0 00.49-.327l-.0415-1.1845a6.7267 6.7267 0 00.2267-.1863l1.1531.2713a.3472.3472 0 00.4171-.416l-.2713-1.1542c.0628-.0749.1255-.1508.1863-.2278l1.1845.0415a.3442.3442 0 00.328-.49l-.49-1.076c.0475-.0872.0951-.1742.1407-.2623l1.1662-.1893a.3483.3483 0 00.2258-.5447l-.6904-.9587.087-.2855 1.1066-.414a.3462.3462 0 00.1154-.5781l-.8656-.8079c.0101-.0972.0202-.1954.0283-.2936l1.0073-.6236a.3442.3442 0 000-.5892zm-6.7413 8.3551a.7138.7138 0 01.2986-1.396.714.714 0 11-.2997 1.396zm-.3422-2.3142a.649.649 0 00-.7715.5l-.3573 1.6685c-1.1035.501-2.3285.7795-3.6193.7795a8.7368 8.7368 0 01-3.6951-.814l-.3574-1.6684a.648.648 0 00-.7714-.499l-1.473.3158a8.7216 8.7216 0 01-.7613-.898h7.1676c.081 0 .1356-.0141.1356-.088v-2.536c0-.074-.0536-.0881-.1356-.0881h-2.0966v-1.6077h2.2677c.2065 0 1.1065.0587 1.394 1.2088.0901.3533.2875 1.5044.4232 1.8729.1346.413.6833 1.2381 1.2685 1.2381h3.5716a.7492.7492 0 00.1296-.0131 8.7874 8.7874 0 01-.8119.9526zM6.8369 20.024a.714.714 0 11-.2997-1.396.714.714 0 01.2997 1.396zM4.1177 8.9972a.7137.7137 0 11-1.304.5791.7137.7137 0 011.304-.579zm-.8352 1.9813l1.5347-.6824a.65.65 0 00.33-.8585l-.3158-.7147h1.2432v5.6025H3.5669a8.7753 8.7753 0 01-.2834-3.348zm6.7343-.5437V8.7836h2.9601c.153 0 1.0792.1772 1.0792.8697 0 .575-.7107.7815-1.2948.7815zm10.7574 1.4862c0 .2187-.008.4363-.0243.651h-.9c-.09 0-.1265.0586-.1265.1477v.413c0 .973-.5487 1.1846-1.0296 1.2382-.4576.0517-.9648-.1913-1.0275-.4717-.2704-1.5186-.7198-1.8436-1.4305-2.4034.8817-.5599 1.799-1.386 1.799-2.4915 0-1.1936-.819-1.9458-1.3769-2.3153-.7825-.5163-1.6491-.6195-1.883-.6195H5.4682a8.7651 8.7651 0 014.907-2.7699l1.0974 1.151a.648.648 0 00.9182.0213l1.227-1.1743a8.7753 8.7753 0 016.0044 4.2762l-.8403 1.8982a.652.652 0 00.33.8585l1.6178.7188c.0283.2875.0425.577.0425.8717zm-9.3006-9.5993a.7128.7128 0 11.984 1.0316.7137.7137 0 01-.984-1.0316zm8.3389 6.71a.7107.7107 0 01.9395-.3625.7137.7137 0 11-.9405.3635z",
  "Sass": "M12 0c6.627 0 12 5.373 12 12s-5.373 12-12 12S0 18.627 0 12 5.373 0 12 0zM9.615 15.998c.175.645.156 1.248-.024 1.792l-.065.18c-.024.061-.052.12-.078.176-.14.29-.326.56-.555.81-.698.759-1.672 1.047-2.09.805-.45-.262-.226-1.335.584-2.19.871-.918 2.12-1.509 2.12-1.509v-.003l.108-.061zm9.911-10.861c-.542-2.133-4.077-2.834-7.422-1.645-1.989.707-4.144 1.818-5.693 3.267C4.568 8.48 4.275 9.98 4.396 10.607c.427 2.211 3.457 3.657 4.703 4.73v.006c-.367.18-3.056 1.529-3.686 2.925-.675 1.47.105 2.521.615 2.655 1.575.436 3.195-.36 4.065-1.649.84-1.261.766-2.881.404-3.676.496-.135 1.08-.195 1.83-.104 2.101.24 2.521 1.56 2.43 2.1-.09.539-.523.854-.674.944-.15.091-.195.12-.181.181.015.09.091.09.21.075.165-.03 1.096-.45 1.141-1.471.045-1.29-1.186-2.729-3.375-2.7-.9.016-1.471.091-1.875.256-.03-.045-.061-.075-.105-.105-1.35-1.455-3.855-2.475-3.75-4.41.03-.705.285-2.564 4.8-4.814 3.705-1.846 6.661-1.335 7.171-.21.733 1.604-1.576 4.59-5.431 5.024-1.47.165-2.235-.404-2.431-.615-.209-.225-.239-.24-.314-.194-.12.06-.045.255 0 .375.12.3.585.825 1.396 1.095.704.225 2.43.359 4.5-.45 2.324-.899 4.139-3.405 3.614-5.505l.073.067z",
  "Svelte": "M10.354 21.125a4.44 4.44 0 0 1-4.765-1.767 4.109 4.109 0 0 1-.703-3.107 3.898 3.898 0 0 1 .134-.522l.105-.321.287.21a7.21 7.21 0 0 0 2.186 1.092l.208.063-.02.208a1.253 1.253 0 0 0 .226.83 1.337 1.337 0 0 0 1.435.533 1.231 1.231 0 0 0 .343-.15l5.59-3.562a1.164 1.164 0 0 0 .524-.778 1.242 1.242 0 0 0-.211-.937 1.338 1.338 0 0 0-1.435-.533 1.23 1.23 0 0 0-.343.15l-2.133 1.36a4.078 4.078 0 0 1-1.135.499 4.44 4.44 0 0 1-4.765-1.766 4.108 4.108 0 0 1-.702-3.108 3.855 3.855 0 0 1 1.742-2.582l5.589-3.563a4.072 4.072 0 0 1 1.135-.499 4.44 4.44 0 0 1 4.765 1.767 4.109 4.109 0 0 1 .703 3.107 3.943 3.943 0 0 1-.134.522l-.105.321-.286-.21a7.204 7.204 0 0 0-2.187-1.093l-.208-.063.02-.207a1.255 1.255 0 0 0-.226-.831 1.337 1.337 0 0 0-1.435-.532 1.231 1.231 0 0 0-.343.15L8.62 9.368a1.162 1.162 0 0 0-.524.778 1.24 1.24 0 0 0 .211.937 1.338 1.338 0 0 0 1.435.533 1.235 1.235 0 0 0 .344-.151l2.132-1.36a4.067 4.067 0 0 1 1.135-.498 4.44 4.44 0 0 1 4.765 1.766 4.108 4.108 0 0 1 .702 3.108 3.857 3.857 0 0 1-1.742 2.583l-5.589 3.562a4.072 4.072 0 0 1-1.135.499m10.358-17.95C18.484-.015 14.082-.96 10.9 1.068L5.31 4.63a6.412 6.412 0 0 0-2.896 4.295 6.753 6.753 0 0 0 .666 4.336 6.43 6.43 0 0 0-.96 2.396 6.833 6.833 0 0 0 1.168 5.167c2.229 3.19 6.63 4.135 9.812 2.108l5.59-3.562a6.41 6.41 0 0 0 2.896-4.295 6.756 6.756 0 0 0-.665-4.336 6.429 6.429 0 0 0 .958-2.396 6.831 6.831 0 0 0-1.167-5.168Z",
  "Swift": "M7.508 0c-.287 0-.573 0-.86.002-.241.002-.483.003-.724.01-.132.003-.263.009-.395.015A9.154 9.154 0 0 0 4.348.15 5.492 5.492 0 0 0 2.85.645 5.04 5.04 0 0 0 .645 2.848c-.245.48-.4.972-.495 1.5-.093.52-.122 1.05-.136 1.576a35.2 35.2 0 0 0-.012.724C0 6.935 0 7.221 0 7.508v8.984c0 .287 0 .575.002.862.002.24.005.481.012.722.014.526.043 1.057.136 1.576.095.528.25 1.02.495 1.5a5.03 5.03 0 0 0 2.205 2.203c.48.244.97.4 1.498.495.52.093 1.05.124 1.576.138.241.007.483.009.724.01.287.002.573.002.86.002h8.984c.287 0 .573 0 .86-.002.241-.001.483-.003.724-.01a10.523 10.523 0 0 0 1.578-.138 5.322 5.322 0 0 0 1.498-.495 5.035 5.035 0 0 0 2.203-2.203c.245-.48.4-.972.495-1.5.093-.52.124-1.05.138-1.576.007-.241.009-.481.01-.722.002-.287.002-.575.002-.862V7.508c0-.287 0-.573-.002-.86a33.662 33.662 0 0 0-.01-.724 10.5 10.5 0 0 0-.138-1.576 5.328 5.328 0 0 0-.495-1.5A5.039 5.039 0 0 0 21.152.645 5.32 5.32 0 0 0 19.654.15a10.493 10.493 0 0 0-1.578-.138 34.98 34.98 0 0 0-.722-.01C17.067 0 16.779 0 16.492 0H7.508zm6.035 3.41c4.114 2.47 6.545 7.162 5.549 11.131-.024.093-.05.181-.076.272l.002.001c2.062 2.538 1.5 5.258 1.236 4.745-1.072-2.086-3.066-1.568-4.088-1.043a6.803 6.803 0 0 1-.281.158l-.02.012-.002.002c-2.115 1.123-4.957 1.205-7.812-.022a12.568 12.568 0 0 1-5.64-4.838c.649.48 1.35.902 2.097 1.252 3.019 1.414 6.051 1.311 8.197-.002C9.651 12.73 7.101 9.67 5.146 7.191a10.628 10.628 0 0 1-1.005-1.384c2.34 2.142 6.038 4.83 7.365 5.576C8.69 8.408 6.208 4.743 6.324 4.86c4.436 4.47 8.528 6.996 8.528 6.996.154.085.27.154.36.213.085-.215.16-.437.224-.668.708-2.588-.09-5.548-1.893-7.992z",
  "TypeScript": "M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z",
  "Vue.js": "M24,1.61H14.06L12,5.16,9.94,1.61H0L12,22.39ZM12,14.08,5.16,2.23H9.59L12,6.41l2.41-4.18h4.43Z",
  "X": "M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z",
};

// =====================================================================
// start the site
// =====================================================================

window.addEventListener("hashchange", showPage);
showPage();
