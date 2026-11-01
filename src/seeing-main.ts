import "./style.css";
import "./seeing.css";
import { visibilityReadings } from "./content/visibility";
import {
  clauseMatches,
  importVisibility,
  MODEL_SCOPE,
  OPENINGS,
  type Opening,
  openingNames,
  readVisibilityURL,
  reason,
  route,
  sightlines,
  visibilityCSV,
  visibilityPages,
  visibilityRecord,
  visibilityURL,
} from "./core/visibility";
import { esc } from "./escape";
import { download } from "./export";
import { prepareOffline } from "./offline";
import { sourceViewer } from "./source-view";
import { routeStrip, visibilitySVG } from "./visibility-drawing";
import { visibilityReading } from "./visibility-export";

const parsed = readVisibilityURL(location.href);
let state = { ...parsed.state },
  word = 0,
  saveRevision = 0;
function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing ${id}`);
  return node as T;
}
const options = OPENINGS.map((o) => `<option value="${o}">${openingNames[o]}</option>`).join("");
el("app").innerHTML =
  `<a class="skip" href="#sightline">Skip to the sightline study</a><header><a class="brand" href="./">Syngraphe<span lang="grc">ΣΥΓΓΡΑΦΗ</span></a><nav aria-label="Workshop"><a href="./">Measurements</a><a href="#sightline" aria-current="page">Seeing</a><a href="#passages">Greek</a><a href="#sources">Printed pages</a><a href="#retain">Keep a copy</a></nav></header>
<main><section class="seeing-intro"><h1>See the stores.<br>As you pass.</h1><div><p class="seeing-lead">By the wall, open the front.<br>By the pillars, open both sides.</p><p>A naval storehouse programme from 347/6 BCE makes visibility part of its instructions. Test the two openings, move through a modern sightline study, then read the Greek that distinguishes them.</p><p class="small">New English and word notes. No prior Greek needed. The drawing studies two sample points; it does not reconstruct the building.</p></div></section><p class="notice" id="notice" role="status">${esc(parsed.warning)}</p>
<section id="sightline" class="seeing-desk" aria-labelledby="sightline-title"><div class="desk-title"><h2 id="sightline-title" tabindex="-1">Which face opens?</h2><p>Start with both fronts open. Move past the support, then try the stated faces. Does seeing a sample mean the instruction is satisfied?</p></div>
<div class="seeing-workspace"><div class="seeing-plan"><div id="drawing-frame" tabindex="0" role="region" aria-label="Top-down sightline drawing; arrow keys pan when enlarged"><div id="sightline-plate"></div></div><button type="button" id="drawing-enlarge" aria-pressed="false">Enlarge drawing</button><div class="seeing-legend"><span><i class="key-open"></i>Open face</span><span><i class="key-closed"></i>Closed face</span><span><i class="key-seen"></i>Visible sample</span><span><i class="key-blocked"></i>Stopped ray</span></div><div class="walk-controls"><label for="station">Viewer's position along the passage <output id="station-output" for="station"></output></label><input type="range" id="station" min="-20" max="20" step="1"><div class="walk-buttons"><button type="button" id="walk-back">Step left</button><button type="button" data-station="-20">Left end</button><button type="button" data-station="0">Opposite pillar</button><button type="button" data-station="20">Right end</button><button type="button" id="walk-forward">Step right</button></div><p class="small">The blue path and its forty-one one-foot stations are chosen for this experiment.</p></div></div>
<aside class="seeing-controls" aria-label="Chest openings and results"><label for="wall-opening">A / chest by the wall<select id="wall-opening">${options}</select></label><label for="pillar-opening">B / chest by the pillar<select id="pillar-opening">${options}</select></label><div class="actions"><button type="button" id="stated-faces" class="primary">Use the stated faces</button><button type="button" id="fronts">Try both fronts</button></div>
<div id="sightline-status" role="status" aria-atomic="true"></div><div id="clause-status"></div><div class="actions"><button type="button" data-reading="2">Read “the front”</button><button type="button" data-reading="3">Read “both sides”</button></div>
<div class="route-summary"><h3>Across the chosen path</h3><div id="route-strip"></div><p id="route-description"></p><p class="small">Green cells: sample visible at that station. The outlined cell is your position. This compares stations; it does not track your walk.</p><details><summary>Inspect every station</summary><div class="station-table" tabindex="0" role="region" aria-label="All 41 station observations"><table><thead><tr><th>Position</th><th>A</th><th>B</th></tr></thead><tbody id="station-rows"></tbody></table></div></details></div></aside></div>
<div class="seeing-boundary"><h3>Two visible points are a weaker claim.</h3><p id="model-lesson"></p><details><summary>What this drawing assumes</summary><p>${esc(MODEL_SCOPE)}</p><p>The twenty-foot passage, 2¾-foot support breadth and 2½-foot upper wall body come from the previous room's simplified cross-width account. The square footprint, four-foot chests, their positions, centre sample points and viewer path are modern choices. The source mentions a supplied pattern; it does not give these chest dimensions.</p><p>Closed faces are opaque lines. Open faces are removed; hinge swing is omitted. Rays lie in one plane and stop at closed corners. Neighbouring supports, grilles, doors, stored objects, heights, lighting and people are omitted. A hidden point at one station does not contradict the source's purpose of seeing while passing.</p><p>The actual programme names 134 chests. This diagram neither arranges all of them nor simulates an ancient inspection procedure.</p></details><button type="button" data-reading="4">Read “those passing through”</button></div></section>
<section id="passages" class="sheet" aria-labelledby="passages-title"><div class="section-title"><h2 id="passages-title" tabindex="-1">Read the difference.</h2><p>The μὲν … δὲ construction separates two groups. Select an underlined Greek phrase for its meaning and its job in the drawing.</p></div><label for="reading-select">Reading<select id="reading-select">${visibilityReadings.map((r, i) => `<option value="${i}">${i + 1}. ${esc(r.title)}</option>`).join("")}</select></label><article class="reading"><p id="reading-lines" class="small"></p><h3 id="reading-title"></h3><p id="reading-greek" lang="grc" class="greek"></p><p id="reading-english" class="translation"></p><div id="word-definition" class="definition" role="status"></div><p id="reading-note"></p><div id="reading-pages" class="actions"></div></article><div class="reading-nav"><button type="button" id="reading-prev">Previous reading</button><span id="reading-count"></span><button type="button" id="reading-next">Next reading</button></div><p class="small">Transcribed against Choisy's printed pages. Initial case and excerpt punctuation normalized. Printed spellings remain visible. New English and word notes have not received independent philological review.</p></section>
<section id="sources" class="sheet" aria-labelledby="source-title"><div class="section-title"><h2 id="source-title" tabindex="-1">Keep the printed<br>evidence in view.</h2><p>These whole pages retain the Greek, Choisy's French, notes and margins. The supplied pattern is mentioned; our two square chests are not a recovered copy of it.</p></div><div class="source-workspace"><div class="source-controls"><label for="source-page">Whole printed page<select id="source-page">${visibilityPages
    .map((n) => {
      const p = __SOURCE_MANIFEST__.pages.find((p) => p.pdfPage === n);
      if (!p) throw new Error(`Missing source page ${n}.`);
      return `<option value="${n}">${esc(p.label)}</option>`;
    })
    .join(
      "",
    )}</select></label><div class="actions"><button type="button" id="source-enlarge" aria-pressed="false">Enlarge page</button><button type="button" id="source-retry">Retry source</button></div><p id="source-status" role="status"></p><p class="small">Enlarge the page, focus it, and use arrow keys to pan.</p><p><a id="source-full" target="_blank" rel="noreferrer" hidden>Open verified whole image</a></p><p><a id="source-pdf" target="_blank" rel="noreferrer">Original public-domain PDF</a></p><p><a href="https://inscriptions.packhum.org/text/3893" target="_blank" rel="noreferrer">Modern IG transcript for comparison</a></p></div><figure><div id="source-frame" class="source-frame" tabindex="0" role="region" aria-label="Whole source page; arrow keys pan when enlarged"><img id="source-image" alt="" hidden></div><figcaption id="source-caption"></figcaption></figure></div></section>
<section id="retain" class="sheet" aria-labelledby="retain-title"><div class="section-title"><h2 id="retain-title" tabindex="-1">Take your<br>reading with you.</h2><p>Keep the chosen openings and position, all station observations, five Greek readings and four whole printed pages. The illustrated reading opens without scripts or a connection.</p></div><div class="actions"><button type="button" id="save-json">Save editable JSON</button><button type="button" id="save-csv">Save station CSV</button><button type="button" id="save-svg">Save current SVG</button><button type="button" id="save-reading" class="primary">Save illustrated reading</button><button type="button" id="cancel-save" hidden>Cancel saving</button></div><p id="save-status" role="status"></p><div class="records"><div><label for="import-file">Reopen sightline JSON<input type="file" id="import-file" accept=".json,application/json"></label><p id="import-status" role="status"></p></div><div><button type="button" id="copy-link">Copy this study link</button><label id="link-fallback" hidden for="study-link">Study link<input id="study-link" readonly></label><p id="link-status" role="status"></p></div></div><div class="offline"><p id="offline-status" role="status"></p><button type="button" id="offline-reload" hidden>Reload saved edition</button></div></section></main><footer><p>Anthony Mercer / <a href="https://github.com/antonsoo/syngraphe">Source and documentation</a></p><p><a href="./">Return to the measurement workshop</a></p></footer>`;

const updateLink = () => {
  el<HTMLInputElement>("study-link").value = visibilityURL(state, location.href);
};
const showSource = sourceViewer((page) => {
  state.page = page;
  updateLink();
});

function renderModel() {
  el("sightline-plate").innerHTML = visibilitySVG(state);
  el<HTMLInputElement>("station").value = String(state.station);
  el<HTMLOutputElement>("station-output").value = `${state.station} ft`;
  el<HTMLSelectElement>("wall-opening").value = state.wall;
  el<HTMLSelectElement>("pillar-opening").value = state.pillar;
  el<HTMLButtonElement>("walk-back").disabled = state.station === -20;
  el<HTMLButtonElement>("walk-forward").disabled = state.station === 20;
  const rays = sightlines(state),
    matches = clauseMatches(state),
    steps = route(state);
  el("sightline-status").innerHTML =
    `<h3>At ${state.station} ft</h3>${rays.map((r) => `<p data-visible="${r.visible}"><strong>${r.id === "wall" ? "A / wall" : "B / pillar"}:</strong> ${esc(reason(r))}</p>`).join("")}`;
  el("clause-status").innerHTML =
    `<h3>The stated opening faces</h3><p data-match="${matches.wall}">A: ${matches.wall ? "Front — agrees." : "Differs: the wall clause names the front."}</p><p data-match="${matches.pillar}">B: ${matches.pillar ? "Both sides — agrees." : "Differs: the pillar clause names both sides."}</p>`;
  el("route-strip").innerHTML = routeStrip(state);
  const counts = [0, 1].map((i) => steps.filter((r) => r.rays[i]?.visible).length);
  el("route-description").textContent =
    `A is visible at ${counts[0]} of 41 stations; B at ${counts[1]}.`;
  el("station-rows").innerHTML = steps
    .map(
      (r) =>
        `<tr${r.station === state.station ? ' class="current"' : ""}><th scope="row">${r.station} ft</th>${r.rays.map((ray) => `<td>${ray.visible ? "Visible" : ray.hit?.edge.object === "support" ? "Support blocks" : `${ray.hit?.edge.face} face blocks`}</td>`).join("")}</tr>`,
    )
    .join("");
  el("model-lesson").textContent =
    matches.wall && matches.pillar
      ? "These openings agree with the two face clauses. A sample can still be hidden at your current station. The purpose concerns people passing through; this two-point experiment cannot establish visibility of all the equipment."
      : counts.every((n) => n > 0)
        ? "Both samples can be seen somewhere along this chosen path, yet the opening faces still differ from the instruction. A successful two-point test cannot replace the Greek wording."
        : "At least one sample stays hidden along the chosen path. Try a different face and move the viewer. Whether a face agrees with the Greek remains a separate question.";
  updateLink();
}
function renderReading() {
  const r = visibilityReadings[state.reading];
  if (!r) throw new Error("Unknown reading.");
  word = Math.min(word, r.words.length - 1);
  el<HTMLSelectElement>("reading-select").value = String(state.reading);
  el("reading-lines").textContent = `IG II² 1668, lines ${r.lines}`;
  el("reading-title").textContent = r.title;
  let greek = esc(r.greek);
  for (const [i, note] of r.words.entries())
    greek = greek.replace(
      esc(note.form),
      `<button type="button" data-word="${i}" aria-pressed="${i === word}">${esc(note.form)}</button>`,
    );
  el("reading-greek").innerHTML = greek;
  el("reading-english").textContent = r.english;
  el("reading-note").textContent = r.note;
  el("reading-count").textContent = `${state.reading + 1} of ${visibilityReadings.length}`;
  el<HTMLButtonElement>("reading-prev").disabled = state.reading === 0;
  el<HTMLButtonElement>("reading-next").disabled = state.reading === visibilityReadings.length - 1;
  const note = r.words[word];
  if (!note) throw new Error("Unknown word.");
  el("word-definition").innerHTML =
    `<p><strong>${esc(note.meaning)}</strong><br>Dictionary form: <span lang="grc">${esc(note.lemma)}</span></p><p>${esc(note.work)}</p>`;
  el("reading-pages").innerHTML = r.pages
    .map((n) => `<button type="button" data-page="${n}">Open whole printed p.${n - 28}</button>`)
    .join("");
  updateLink();
}
function chooseReading(n: number, focus = false) {
  state.reading = n;
  word = 0;
  renderReading();
  if (focus) {
    el("passages-title").focus();
    el("passages").scrollIntoView();
  }
}
document.addEventListener("click", (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>("button");
  if (!button) return;
  if (button.dataset.station !== undefined) {
    state.station = Number(button.dataset.station);
    renderModel();
  }
  if (button.dataset.reading !== undefined) chooseReading(Number(button.dataset.reading), true);
  if (button.dataset.word !== undefined) {
    word = Number(button.dataset.word);
    // Keep the activated word mounted so keyboard focus stays in the Greek.
    const n = visibilityReadings[state.reading]?.words[word];
    if (!n) return;
    document.querySelectorAll<HTMLButtonElement>("[data-word]").forEach((b) => {
      b.setAttribute("aria-pressed", String(Number(b.dataset.word) === word));
    });
    el("word-definition").innerHTML =
      `<p><strong>${esc(n.meaning)}</strong><br>Dictionary form: <span lang="grc">${esc(n.lemma)}</span></p><p>${esc(n.work)}</p>`;
  }
  if (button.dataset.page !== undefined) {
    void showSource(Number(button.dataset.page));
    el("source-title").focus();
    el("sources").scrollIntoView();
  }
});
el("station").addEventListener("input", () => {
  state.station = Number(el<HTMLInputElement>("station").value);
  renderModel();
});
for (const id of ["wall", "pillar"] as const)
  el(`${id}-opening`).addEventListener("change", () => {
    state[id] = el<HTMLSelectElement>(`${id}-opening`).value as Opening;
    renderModel();
  });
el("stated-faces").addEventListener("click", () => {
  state.wall = "front";
  state.pillar = "sides";
  renderModel();
});
el("fronts").addEventListener("click", () => {
  state.wall = "front";
  state.pillar = "front";
  renderModel();
});
el("walk-back").addEventListener("click", () => {
  state.station = Math.max(-20, state.station - 1);
  renderModel();
});
el("walk-forward").addEventListener("click", () => {
  state.station = Math.min(20, state.station + 1);
  renderModel();
});
el("reading-select").addEventListener("change", () =>
  chooseReading(Number(el<HTMLSelectElement>("reading-select").value)),
);
el("reading-prev").addEventListener("click", () => chooseReading(state.reading - 1));
el("reading-next").addEventListener("click", () => chooseReading(state.reading + 1));
el("drawing-enlarge").addEventListener("click", () => {
  const large = el("drawing-frame").classList.toggle("enlarged");
  el("drawing-enlarge").setAttribute("aria-pressed", String(large));
  el("drawing-enlarge").textContent = large ? "Fit drawing to width" : "Enlarge drawing";
  el("drawing-frame").focus();
});
el("save-json").addEventListener("click", () =>
  download("syngraphe-sightline.json", "application/json", visibilityRecord(state)),
);
el("save-csv").addEventListener("click", () =>
  download("syngraphe-stations.csv", "text/csv", visibilityCSV(state)),
);
el("save-svg").addEventListener("click", () =>
  download("syngraphe-sightline.svg", "image/svg+xml", visibilitySVG(state, true)),
);
const finishSave = () => {
  el<HTMLButtonElement>("save-reading").disabled = false;
  el("cancel-save").hidden = true;
};
el("save-reading").addEventListener("click", async () => {
  const revision = ++saveRevision,
    snapshot = { ...state };
  el<HTMLButtonElement>("save-reading").disabled = true;
  el("cancel-save").hidden = false;
  el("save-status").textContent =
    "Checking source pages, font and licenses for the selected study…";
  try {
    const html = await visibilityReading(snapshot);
    if (revision !== saveRevision) return;
    download("syngraphe-seeing.html", "text/html", html);
    el("save-status").textContent =
      `Saved the study at ${snapshot.station} ft with its four whole source pages. Open the HTML directly or print it to PDF.`;
  } catch (error) {
    if (revision !== saveRevision) return;
    el("save-status").textContent =
      error instanceof Error
        ? error.message
        : "Could not save the reading. Reconnect and try again.";
  } finally {
    if (revision === saveRevision) finishSave();
  }
});
el("cancel-save").addEventListener("click", () => {
  saveRevision++;
  finishSave();
  el("save-status").textContent = "Saving cancelled. No reading was downloaded.";
});
el("import-file").addEventListener("change", async () => {
  const input = el<HTMLInputElement>("import-file"),
    file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > 65536)
      throw new Error(
        "Choose a sightline JSON file smaller than 64 KiB. No settings were changed.",
      );
    state = importVisibility(await file.text());
    word = 0;
    renderModel();
    renderReading();
    void showSource(state.page);
    el("import-status").textContent =
      "Sightline settings reopened. The drawing and reading now show that record.";
  } catch (error) {
    el("import-status").textContent =
      error instanceof Error
        ? error.message
        : "Could not read this file. No settings were changed.";
  }
  input.value = "";
});
el("copy-link").addEventListener("click", async () => {
  const link = visibilityURL(state, location.href);
  updateLink();
  try {
    await navigator.clipboard.writeText(link);
    el("link-status").textContent = "Study link copied, including openings, position and reading.";
  } catch {
    el("link-fallback").hidden = false;
    el<HTMLInputElement>("study-link").focus();
    el<HTMLInputElement>("study-link").select();
    el("link-status").textContent = "Copy the selected study link.";
  }
});
renderModel();
renderReading();
void showSource(state.page);
prepareOffline(el("offline-status"), el<HTMLButtonElement>("offline-reload"));
