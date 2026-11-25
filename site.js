// tabs on the card (home / music / buttons) and the little music player.
// the fish in the background are in fish.js.

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// ---------- tabs ----------
// the bit of the url after # picks the tab, so #music links straight to it

function showTab() {
  const wanted = location.hash.slice(1);
  const tab = $$(".view").some((view) => view.dataset.view === wanted) ? wanted : "home";
  for (const view of $$(".view")) view.hidden = view.dataset.view !== tab;
  for (const link of $$(".tabs a")) {
    if (link.dataset.tab === tab) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  }
}

showTab();
addEventListener("hashchange", showTab);

// ---------- music ----------
// put the song files in assets/music and add each file name here.
// name them like "artist - song.m4a".

const MUSIC_FOLDER = "assets/music/";
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

// "Dominic Fike - Mona Lisa.m4a" -> { artist: "Dominic Fike", title: "Mona Lisa" }
function songFromFile(file) {
  const parts = file.replace(/\.[^.]+$/, "").split(" - ");
  const title = parts.pop();
  const artist = [...new Set(parts)].join(" - ") || "unknown artist";
  return { file, artist, title };
}

const songs = MUSIC.map(songFromFile);
const music = $(".music");
const audio = $(".audio", music);
const seek = $(".seek", music);
const playButton = $(".ctrl-play", music);
let current = -1;

const clock = (seconds) => (Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}` : "0:00");

$(".tracks", music).append(
  ...songs.map((song, i) => {
    const li = document.createElement("li");
    const button = document.createElement("button");
    button.className = "track";
    button.type = "button";
    button.innerHTML = `<span class="track-num">${String(i + 1).padStart(2, "0")}</span><span></span>`;
    button.lastChild.textContent = `${song.title} - ${song.artist}`;
    button.addEventListener("click", () => (i === current ? toggle() : play(i)));
    li.append(button);
    return li;
  }),
);

function play(i) {
  current = (i + songs.length) % songs.length;
  const song = songs[current];
  audio.src = MUSIC_FOLDER + encodeURIComponent(song.file);
  audio.play().catch(() => {});
  $(".music-title", music).textContent = song.title;
  $(".music-artist", music).textContent = song.artist;
  $$(".track", music).forEach((button, n) => button.setAttribute("aria-current", n === current));
}

function toggle() {
  if (current === -1) return play(0);
  if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
}

function updatePlaying() {
  const playing = !audio.paused;
  music.dataset.playing = playing;
  playButton.textContent = playing ? "pause" : "play";
  playButton.setAttribute("aria-label", playing ? "pause" : "play");
  $(".music-status", music).textContent = playing ? "playing rn!!" : current === -1 ? "pick a song" : "paused";
}

function updateTime() {
  const done = audio.duration ? audio.currentTime / audio.duration : 0;
  if (document.activeElement !== seek) seek.value = Math.round(done * 1000);
  seek.style.setProperty("--fill", `${(seek.value / 10).toFixed(1)}%`);
  $(".time-now", music).textContent = clock(audio.currentTime);
  $(".time-total", music).textContent = clock(audio.duration);
}

music.addEventListener("click", (e) => {
  const action = e.target.closest("[data-action]")?.dataset.action;
  if (action === "play") toggle();
  if (action === "prev") play(audio.currentTime > 3 ? current : current - 1);
  if (action === "next") play(current + 1);
});

seek.addEventListener("input", () => {
  if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
  updateTime();
});

audio.addEventListener("play", updatePlaying);
audio.addEventListener("pause", updatePlaying);
audio.addEventListener("ended", () => play(current + 1));
audio.addEventListener("timeupdate", updateTime);
audio.addEventListener("loadedmetadata", updateTime);
