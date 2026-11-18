// Throwaway: three frontend MVP layouts on /?variant=A|B|C; no backend requests.
const cover = (hash) => `https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e02${hash}`;
const albums = [
  { id: "2noRn2Aes5aoNVsU6iWThc", title: "Discovery", artist: "Daft Punk", year: "2001", genre: "Electronic", image_url: cover("1e81bff9807a9e629fce5ade") },
  { id: "1weenld61qoidwYuZ1GESA", title: "Kind of Blue", artist: "Miles Davis", year: "1959", genre: "Jazz", image_url: cover("387a29c90de3b2398c29c34f") },
  { id: "4LH4d3cOWNNsVw41Gqt2kv", title: "The Dark Side of the Moon", artist: "Pink Floyd", year: "1973", genre: "Rock", image_url: cover("db216ca805faf5fe35df4ee6") },
  { id: "1bt6q2SruMsBtcerNVtpZB", title: "Rumours", artist: "Fleetwood Mac", year: "1977", genre: "Rock", image_url: cover("57df7ce0eac715cf70e519a7") },
  { id: "6dVIqQ8qmQ5GBnJ9shOYGE", title: "OK Computer", artist: "Radiohead", year: "1997", genre: "Alternative", image_url: cover("c8b444df094279e70d0ed856") },
  { id: "7aJuG4TFXa2hmE4z1yxc3n", title: "HIT ME HARD AND SOFT", artist: "Billie Eilish", year: "2024", genre: "Alternative", image_url: cover("71d62ea7ea8a5be92d3c1f62") },
].map((album) => ({ ...album, type: "album" }));
const tracks = [
  { ...albums[0], id: "0DiWol3AO6WpXZgp0goxAV", title: "One More Time", type: "track" },
  { id: "69kOkLUCkxIZYexIgSG8rq", title: "Get Lucky", artist: "Daft Punk feat. Pharrell Williams & Nile Rodgers", type: "track", genre: "Electronic", year: "2013", image_url: cover("9b9b36b0e22870b9f542d937") },
  { id: "7w87IxuO7BDcJ3YUqCyMTT", title: "Pumped Up Kicks", artist: "Foster the People", type: "track", genre: "Indie", year: "2010", image_url: cover("121d5f92cf90576907dfb1e5") },
];
const catalog = [...albums, ...tracks];
const crates = [
  { id: "after-hours", name: "After hours", description: "For the last light on and nowhere to be.", tag: "THE NIGHT SHIFT", color: "purple", albums: [1, 4, 5] },
  { id: "sunday-slow", name: "Sunday, slowly", description: "Coffee on. Phone off. Let the whole side play.", tag: "TAKE YOUR TIME", color: "orange", albums: [3, 1, 2] },
  { id: "dance-floor", name: "A little more volume", description: "Living-room dance floors count, too.", tag: "TURN IT UP", color: "green", albums: [0, 5, 3] },
];
const layouts = { A: "The neighborhood shop", B: "The listening desk", C: "The weekly journal" };
const storageKey = "vrs-prototype-saved";
let storageMessage = "";
let saved = [];
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (!Array.isArray(stored) || stored.some((id) => typeof id !== "string")) throw new Error();
  saved = [...new Set(stored)].filter((id) => albums.some((album) => album.id === id));
} catch {
  storageMessage = "Saved albums couldn't be read. You can still browse and save for this visit.";
}
const state = { variant: readVariant(), view: "crates", crate: null, selected: null, query: "", type: "track" };
const root = document.querySelector("#prototype");
const player = document.querySelector("#player");
const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
function readVariant() {
  const value = new URLSearchParams(location.search).get("variant");
  return Object.hasOwn(layouts, value) ? value : "A";
}
function artwork(item, extra = "") {
  return `<img class="${extra}" src="${esc(item.image_url)}" alt="" loading="lazy" onerror="this.hidden=true">`;
}
function recordCard(item, index) {
  return `<button class="record ${state.selected?.id === item.id ? "selected" : ""}" data-record="${item.id}" aria-label="Listen to ${esc(item.title)} by ${esc(item.artist)}">
    <span class="sleeve">${artwork(item)}<span class="play-mark" aria-hidden="true">↗</span></span>
    <span class="record-copy"><span class="record-number">${String(index + 1).padStart(2, "0")}</span><strong>${esc(item.title)}</strong><span>${esc(item.artist)}</span><small>${esc(item.year)} · ${esc(item.genre)} · ${item.type}</small></span>
    ${saved.includes(item.id) ? '<span class="saved-mark" aria-label="Saved">♥</span>' : ""}
  </button>`;
}
function crateCard(crate, index) {
  return `<button class="crate ${crate.color}" data-crate="${crate.id}">
    <span class="crate-top"><span>${crate.tag}</span><span>0${index + 1} ↗</span></span>
    <span class="crate-covers">${crate.albums.map((i) => artwork(albums[i])).join("")}</span>
    <span class="crate-copy"><strong>${crate.name}</strong><span>${crate.description}</span><small>${crate.albums.length} records · handpicked, not generated</small></span>
  </button>`;
}
function results() {
  const source = state.type === "album" ? albums : tracks;
  const query = state.query.toLowerCase().trim();
  return source.filter((item) => `${item.title} ${item.artist}`.toLowerCase().includes(query));
}
function render() {
  const previousFocus = root.contains(document.activeElement) ? document.activeElement : null;
  const focusSelector = previousFocus?.id ? `#${previousFocus.id}` : ["record", "crate", "view"].find((key) => previousFocus?.dataset[key]);
  const focusValue = focusSelector && !focusSelector.startsWith("#") ? previousFocus.dataset[focusSelector] : null;
  document.body.dataset.variant = state.variant;
  const activeCrate = crates.find((crate) => crate.id === state.crate);
  let items = albums;
  let title = "A good record finds you.";
  let subtitle = "Skip the algorithm. Follow your ears.";
  if (state.view === "saved") {
    items = albums.filter((item) => saved.includes(item.id));
    title = "Your little collection.";
    subtitle = "Saved on this device. No account, no cloud sync.";
  } else if (state.view === "search") {
    items = results();
    title = state.query.trim() ? `Digging for “${state.query.trim()}”` : "What are you looking for?";
    subtitle = `${items.length} ${state.type}${items.length === 1 ? "" : "s"} in the demo catalog. This isn't live Spotify search.`;
  } else if (activeCrate) {
    items = activeCrate.albums.map((i) => albums[i]);
    title = activeCrate.name;
    subtitle = activeCrate.description;
  }
  const home = state.view === "crates" && !activeCrate;
  root.innerHTML = `
    <header class="site-header"><a href="/" class="brand" data-home><span class="brand-disc" aria-hidden="true">●</span> SIDE B<span class="brand-sub">a virtual record store</span></a>
      <nav aria-label="Main"><button data-view="crates" aria-current="${state.view === "crates" ? "page" : "false"}">The crates</button><button data-view="saved" aria-current="${state.view === "saved" ? "page" : "false"}">Saved <span class="count">${saved.length}</span></button></nav>
      <span class="open-sign"><span></span> Always open</span>
    </header>
    <div class="shop-layout">
      <aside class="desk-sidebar"><span class="eyebrow">YOUR LISTENING DESK</span><h2>Less scrolling.<br>More listening.</h2><p>Pull up a chair. There's something here for you.</p>${crates.map((crate) => `<button data-crate="${crate.id}" class="${state.crate === crate.id ? "active" : ""}">${crate.name} <span>↗</span></button>`).join("")}<span class="sidebar-note">Small catalog.<br>Wide-open ears.<br>Est. 2026</span></aside>
      <main id="main">
        <section class="intro ${home ? "home-intro" : ""}">
          <div><span class="eyebrow">${home ? "INDEPENDENT SPIRIT. INTERNET ADDRESS." : state.view === "saved" ? "KEEP THE GOOD ONES CLOSE" : state.view === "search" ? "A LITTLE CRATE DIGGING" : "A CRATE WORTH YOUR TIME"}</span><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div>
          <div class="shop-stamp" aria-hidden="true"><span>GOOD MUSIC</span><b>33⅓</b><span>NO GATEKEEPING</span></div>
        </section>
        <form id="search-form" class="search-form" role="search">
          <label for="query" class="sr-only">Search the demo catalog</label><span class="search-icon" aria-hidden="true">⌕</span><input id="query" name="q" type="search" placeholder="An artist, an album, that song…" value="${esc(state.query)}">
          <label for="search-type" class="sr-only">Search type</label><select id="search-type" name="type"><option value="track" ${state.type === "track" ? "selected" : ""}>Tracks</option><option value="album" ${state.type === "album" ? "selected" : ""}>Albums</option></select><button type="submit">Find a record <span aria-hidden="true">↗</span></button>
        </form>
        ${home ? `<section class="crates-section"><div class="section-heading"><div><span class="eyebrow">FILED BY FEELING</span><h2>Pick a crate. Stay a while.</h2></div><span class="section-note">03 crates / no wrong turns</span></div><div class="crates">${crates.map(crateCard).join("")}</div></section>` : `<button class="back-link" data-view="crates">← Back to all crates</button>`}
        ${home && state.variant === "C" ? `<section class="editorial-feature"><div>${artwork(albums[1])}</div><div><span class="eyebrow">THE LONG LISTEN / NO. 001</span><h2>Some records don't need a skip button.</h2><p>Miles Davis. Five tracks. A whole different pace. Our invitation to listen to an album, not just a song.</p><button data-record="${albums[1].id}">Put on Kind of Blue ↗</button></div></section>` : ""}
        <section class="records-section"><div class="section-heading"><h2>${home ? "On the counter" : state.view === "saved" ? "Saved albums" : state.view === "search" ? "What we found" : "Inside this crate"}</h2><span class="section-note">${items.length} ${state.view === "search" && state.type === "track" ? "tracks" : "albums"} · select to listen</span></div>
          <div class="records">${items.map(recordCard).join("")}</div>
          ${!items.length ? `<div class="empty"><span aria-hidden="true">◎</span><h3>${state.view === "saved" ? "Your shelf is waiting." : "Nothing in this little catalog."}</h3><p>${state.view === "saved" ? "Open an album and choose Save album to keep it here." : "Try Daft Punk, Miles Davis, or switch between Tracks and Albums."}</p><button data-view="crates">Browse the crates ↗</button></div>` : ""}
        </section>
        <footer><span>SIDE B — Good records. No velvet rope.</span><span>Frontend prototype · demo catalog · Spotify playback rules apply</span></footer>
      </main>
    </div>`;
  document.querySelector("#variant-label").textContent = `${state.variant} — ${layouts[state.variant]}`;
  if (previousFocus) {
    const target = focusSelector ? root.querySelector(focusValue ? `[data-${focusSelector}="${focusValue}"]` : focusSelector) : null;
    const nextFocus = target && target.checkVisibility() ? target : root.querySelector("h1");
    if (nextFocus.tagName === "H1") nextFocus.tabIndex = -1;
    nextFocus.focus({ preventScroll: true });
  }
  renderState();
}
function renderPlayer() {
  const item = state.selected;
  player.hidden = !item;
  if (!item) return;
  const isSaved = saved.includes(item.id);
  player.innerHTML = `<div class="player-heading"><span class="eyebrow">ON THE TURNTABLE</span><button data-close aria-label="Close selected record">✕</button></div>
    <div class="player-record"><div class="player-cover">${artwork(item)}</div><div><small>${item.type.toUpperCase()} · ${esc(item.year)}</small><h2>${esc(item.title)}</h2><p>${esc(item.artist)}</p></div></div>
    <iframe title="Spotify player for ${esc(item.title)}" src="https://open.spotify.com/embed/${item.type}/${item.id}?utm_source=generator&theme=0" height="152" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
    <div class="player-actions">${item.type === "album" ? `<button data-save aria-pressed="${isSaved}">${isSaved ? "♥ Saved · remove" : "♡ Save album"}</button>` : "<span>Track selection</span>"}<a href="https://open.spotify.com/${item.type}/${item.id}" target="_blank" rel="noopener noreferrer">Open in Spotify ↗</a></div>
    <p class="player-note">Playback is provided by Spotify and may be limited. The link always works independently of the embed.</p>`;
  document.body.classList.add("has-player");
}
function renderState() {
  document.querySelector("#prototype-state").textContent = JSON.stringify({ ...state, selected: state.selected?.id ?? null, saved, storageMessage }, null, 2);
  document.querySelector("#notice").textContent = storageMessage;
}
function cycle(direction) {
  const keys = Object.keys(layouts);
  state.variant = keys[(keys.indexOf(state.variant) + direction + keys.length) % keys.length];
  const url = new URL(location.href);
  url.searchParams.set("variant", state.variant);
  history.replaceState(null, "", url);
  render();
}
document.addEventListener("click", (event) => {
  const button = event.target.closest("button, [data-home]");
  if (!button) return;
  if (button.hasAttribute("data-home")) {
    event.preventDefault();
    Object.assign(state, { view: "crates", crate: null, query: "" });
    render();
  } else if (button.dataset.view) {
    state.view = button.dataset.view;
    state.crate = null;
    render();
  } else if (button.dataset.crate) {
    Object.assign(state, { view: "crates", crate: button.dataset.crate });
    render();
  } else if (button.dataset.record) {
    state.selected = catalog.find((item) => item.id === button.dataset.record);
    renderPlayer();
    render();
  } else if (button.hasAttribute("data-save")) {
    const id = state.selected.id;
    saved = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id];
    try {
      localStorage.setItem(storageKey, JSON.stringify(saved));
      storageMessage = "";
    } catch {
      storageMessage = "Couldn't save on this device. Your collection will last only for this visit.";
    }
    // Keep the iframe mounted so saving doesn't interrupt playback.
    button.textContent = saved.includes(id) ? "♥ Saved · remove" : "♡ Save album";
    button.setAttribute("aria-pressed", saved.includes(id));
    render();
  } else if (button.hasAttribute("data-close")) {
    state.selected = null;
    player.replaceChildren();
    player.hidden = true;
    document.body.classList.remove("has-player");
    render();
  } else if (button.dataset.cycle) cycle(Number(button.dataset.cycle));
});
document.addEventListener("submit", (event) => {
  if (event.target.id !== "search-form") return;
  event.preventDefault();
  state.query = document.querySelector("#query").value;
  state.type = document.querySelector("#search-type").value;
  state.view = "search";
  state.crate = null;
  render();
});
document.addEventListener("keydown", (event) => {
  if (event.target.closest("input, textarea, select, [contenteditable]") || event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    cycle(event.key === "ArrowLeft" ? -1 : 1);
  }
});
window.addEventListener("popstate", () => { state.variant = readVariant(); render(); });
render();
