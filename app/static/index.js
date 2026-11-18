/*
 * The rack is a one-point-perspective row of records standing in an aisle.
 *
 * Every record is a fixed slot at a depth (0 = front, 5 = far). CSS handles the
 * projection: the crate owns the perspective, and each record's translateZ is
 * derived from its depth. Records never move or slide when browsing — only the
 * episode shown on each slot rotates, so the front sleeve cycles toward the
 * back and the loop is seamless in both directions.
 */

const SLOT_COUNT = 6;
const HUES = [26, 172, 292];
const TRACK_COUNT = 5;
const STEP_COOLDOWN_MS = 280;
const SWAP_OUT_MS = 110;
const WHEEL_THRESHOLD = 28;
const DRAG_START_PX = 8;
const DRAG_STEP_PX = 42;

const rack = document.getElementById("rack");
const crate = document.getElementById("crate");
const source = document.getElementById("episode-source");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const counter = document.getElementById("counter");
const total = document.getElementById("total");

const panel = document.getElementById("panel");
const scrim = document.getElementById("scrim");
const panelClose = document.getElementById("panelClose");
const panelKicker = document.getElementById("panelKicker");
const panelTitle = document.getElementById("panelTitle");
const panelLabel = document.getElementById("panelLabel");
const panelTracks = document.getElementById("panelTracks");
const panelPlayer = document.getElementById("panelPlayer");
const tracksList = document.getElementById("tracks");

const episodes = Array.from(source ? source.querySelectorAll(".episode") : []).map(
  (element) => ({
    id: element.dataset.spotifyId ?? "",
    title: (element.textContent ?? "").trim(),
    label: element.dataset.label ?? "Spotify",
  }),
);

const state = {
  front: 0,
  slots: [],
  lastStep: 0,
  swapping: false,
  swapTimer: null,
  wheel: 0,
  pointerId: null,
  pointerStartY: 0,
  dragged: false,
  returnFocus: null,
};

function mod(value, size) {
  return ((value % size) + size) % size;
}

function hueFor(index) {
  return HUES[index % HUES.length];
}

function renderSlot(slot, index) {
  const episode = episodes[index];
  if (!episode) {
    return;
  }

  slot.index = index;
  slot.element.dataset.index = String(index);
  slot.element.style.setProperty("--hue", String(hueFor(index)));
  slot.element.querySelector(".record-kicker").textContent = String(index + 1).padStart(2, "0");
  slot.element.querySelector(".record-title").textContent = episode.title;
  slot.element.querySelector(".record-label").textContent = episode.label;
  slot.element.setAttribute("aria-label", `${episode.title}. Open crate.`);
  slot.element.title = episode.title;
}

function renderRack() {
  for (const slot of state.slots) {
    renderSlot(slot, mod(state.front + slot.depth, episodes.length));

    const isFront = slot.depth === 0;
    slot.element.classList.toggle("is-front", isFront);
    slot.element.setAttribute("aria-current", isFront ? "true" : "false");
    slot.element.style.opacity = Math.max(0.32, 1 - slot.depth * 0.12).toFixed(2);
    slot.element.style.zIndex = String(60 - slot.depth);
  }

  if (counter) {
    counter.textContent = String(state.front + 1);
  }
}

function step(delta) {
  if (episodes.length === 0) {
    return false;
  }

  const now = performance.now();
  if (state.swapping || now - state.lastStep < STEP_COOLDOWN_MS) {
    return false;
  }

  state.lastStep = now;
  state.swapping = true;
  state.front = mod(state.front + delta, episodes.length);

  if (counter) {
    counter.textContent = String(state.front + 1);
  }

  rack.classList.add("is-swapping");
  window.clearTimeout(state.swapTimer);
  state.swapTimer = window.setTimeout(() => {
    renderRack();
    rack.classList.remove("is-swapping");
    state.swapping = false;
    state.swapTimer = null;
  }, SWAP_OUT_MS);

  return true;
}

/* ---------- Slide-out crate panel ---------- */

function renderTracks() {
  if (!tracksList) {
    return;
  }

  tracksList.replaceChildren();

  for (let number = 1; number <= TRACK_COUNT; number += 1) {
    const item = document.createElement("li");
    item.className = "track";
    item.setAttribute("aria-disabled", "true");
    item.innerHTML =
      `<span class="track-index">${String(number).padStart(2, "0")}</span>` +
      '<span class="track-body">' +
      `<span class="track-title">Untitled track ${String(number).padStart(2, "0")}</span>` +
      '<span class="track-sub">Placeholder · preview unavailable</span>' +
      "</span>" +
      '<span class="track-time">--:--</span>';
    tracksList.append(item);
  }
}

function spotifyEmbedUrl(uri) {
  const id = uri.split(":").pop();
  return `https://open.spotify.com/embed/episode/${id}?utm_source=generator&theme=0`;
}

function openPanel(index, trigger) {
  const episode = episodes[index];
  if (!episode) {
    return;
  }

  state.returnFocus = trigger || document.activeElement;

  panel.style.setProperty("--hue", String(hueFor(index)));
  panelKicker.textContent = `Record ${String(index + 1).padStart(2, "0")} · Side A`;
  panelTitle.textContent = episode.title;
  panelLabel.textContent = episode.label;
  panelTracks.textContent = `${TRACK_COUNT} tracks`;
  renderTracks();

  if (panelPlayer) {
    const id = spotifyEmbedUrl(episode.id);
    panelPlayer.innerHTML =
      `<iframe src="${id}" width="100%" height="152" frameborder="0" ` +
      'allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" ' +
      `allowfullscreen loading="lazy" title="Spotify player — ${episode.title.replace(/"/g, "&quot;")}"></iframe>`;
  }

  panel.inert = false;
  panel.setAttribute("aria-hidden", "false");
  panel.classList.add("is-open");
  scrim.classList.add("is-open");
  document.body.classList.add("panel-is-open");

  window.requestAnimationFrame(() => panelClose?.focus());
}

function closePanel() {
  if (!panel.classList.contains("is-open")) {
    return;
  }

  panel.classList.remove("is-open");
  scrim.classList.remove("is-open");
  panel.setAttribute("aria-hidden", "true");
  panel.inert = true;
  document.body.classList.remove("panel-is-open");

  // Drop the iframe so closing the crate also stops playback.
  if (panelPlayer) {
    panelPlayer.replaceChildren();
  }

  const target = state.returnFocus;
  state.returnFocus = null;
  if (target && typeof target.focus === "function") {
    target.focus({ preventScroll: true });
  }
}

/* ---------- Input ---------- */

function onRecordClick(slot) {
  if (state.dragged) {
    state.dragged = false;
    return;
  }

  if (state.swapping) {
    return;
  }

  openPanel(slot.index, slot.element);
}

function onWheel(event) {
  event.preventDefault();

  state.wheel = Math.max(-180, Math.min(180, state.wheel + event.deltaY));
  if (Math.abs(state.wheel) < WHEEL_THRESHOLD) {
    return;
  }

  if (step(state.wheel > 0 ? 1 : -1)) {
    state.wheel = 0;
  }
}

function onKeyDown(event) {
  if (event.key === "ArrowDown" || event.key === "PageDown") {
    event.preventDefault();
    step(1);
  } else if (event.key === "ArrowUp" || event.key === "PageUp") {
    event.preventDefault();
    step(-1);
  }
}

function onPointerDown(event) {
  if (event.pointerType === "mouse" && event.button !== 0) {
    return;
  }

  state.pointerId = event.pointerId;
  state.pointerStartY = event.clientY;
  state.dragged = false;
}

function onPointerMove(event) {
  if (state.pointerId !== event.pointerId) {
    return;
  }

  if (Math.abs(event.clientY - state.pointerStartY) > DRAG_START_PX) {
    state.dragged = true;
  }
}

function onPointerUp(event) {
  if (state.pointerId !== event.pointerId) {
    return;
  }

  const distance = event.clientY - state.pointerStartY;
  state.pointerId = null;

  if (Math.abs(distance) > DRAG_STEP_PX) {
    state.dragged = true;
    step(distance < 0 ? 1 : -1);
  }
}

/* ---------- Init ---------- */

function createSlot(depth) {
  const element = document.createElement("button");
  element.type = "button";
  element.className = "record";
  element.style.setProperty("--depth", String(depth));
  element.innerHTML =
    '<span class="record-vinyl" aria-hidden="true"></span>' +
    '<span class="record-face">' +
    '<span class="record-kicker"></span>' +
    '<span class="record-copy">' +
    '<span class="record-title"></span>' +
    '<span class="record-label"></span>' +
    "</span>" +
    "</span>";

  const slot = { element, depth, index: 0 };
  element.addEventListener("click", () => onRecordClick(slot));

  rack.append(element);
  return slot;
}

function init() {
  if (!rack || !crate || episodes.length === 0) {
    return;
  }

  if (total) {
    total.textContent = String(episodes.length);
  }

  for (let depth = 0; depth < SLOT_COUNT; depth += 1) {
    state.slots.push(createSlot(depth));
  }

  renderRack();

  prevButton?.addEventListener("click", () => step(-1));
  nextButton?.addEventListener("click", () => step(1));

  crate.addEventListener("wheel", onWheel, { passive: false });
  crate.addEventListener("keydown", onKeyDown);
  crate.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  panelClose?.addEventListener("click", closePanel);
  scrim?.addEventListener("click", closePanel);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.classList.contains("is-open")) {
      event.preventDefault();
      closePanel();
    }
  });

  if (panel) {
    panel.inert = true;
  }
}

init();
