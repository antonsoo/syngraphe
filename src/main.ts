import "./style.css";
import { modelNotice, readings, sourceNotice } from "./content/readings";
import {
  feet,
  fromURL,
  grid,
  heightAccount,
  importPlan,
  initial,
  ledgerCSV,
  type PlanState,
  planRecord,
  stateURL,
  validState,
  widthAccount,
} from "./core/model";
import { bayPlate, completeSVG, gridPlate, stackPlate, widthPlate } from "./drawing";
import { esc } from "./escape";
import { download, illustratedReading } from "./export";
import { prepareOffline } from "./offline";
import { sourceViewer } from "./source-view";

const parsed = fromURL(location.href);
let state = { ...parsed.state },
  wordIndex = 0;
function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing ${id}`);
  return node as T;
}
el("app").innerHTML =
  `<a class="skip" href="#width">Skip to the experiment</a><header><a class="brand" href="./">Syngraphe<span lang="grc">ΣΥΓΓΡΑΦΗ</span></a><nav aria-label="Workshop"><a href="#width">Width</a><a href="#height">Stack</a><a href="#grid">Two plans</a><a href="#greek">Greek</a><a href="#retain">Keep a copy</a></nav></header>
<main><section class="intro"><div><p class="kicker">PIRAEUS / A WRITTEN BUILDING PROGRAMME / 347–346 BCE</p><h1>A building<br>in the words.</h1></div><div class="lead"><p>Fifteen feet. <em>Including</em> the pillar.</p><p>One Greek preposition changes how a whole building fits together. Read a naval storehouse specification, make the measurements agree, then ask how much of a plan those words really determine.</p><p class="small">New English beside the Greek and whole printed pages. No prior Greek needed.</p></div></section><p id="notice" role="status" class="notice">${esc(parsed.warning)}</p>
<section id="width" class="sheet" aria-labelledby="width-title"><div class="section-title"><p class="kicker">01 / COUNT WHAT THE WORDS INCLUDE</p><h2 id="width-title" tabindex="-1">Where do the<br>fifteen feet end?</h2><p>The outer width is fifty-five feet, including the walls. A side allowance is fifteen. A support is two feet and three palms wide. Try the two readings.</p></div><div class="workspace"><div class="plate"><div id="width-frame" class="drawing-frame" tabindex="0" role="region" aria-label="Width drawing; arrow keys pan when enlarged"><div id="width-plate"></div></div><button type="button" id="width-enlarge" aria-pressed="false">Enlarge drawing</button><p class="plate-caption">A plan slice, seen from above. Square markers show breadth; they do not assert a historical pillar shape.</p><div class="legend"><span><i class="wall-key"></i>Wall</span><span><i class="floor-key"></i>Clear side floor</span><span><i class="support-key"></i>Support</span><span><i class="passage-key"></i>Public passage</span></div></div><div class="controls"><fieldset><legend>Read “fifteen feet” as…</legend><label class="choice"><input type="radio" name="side" id="side-clear" value="clear"><span>Fifteen clear feet.<small>Add the pillar beyond the fifteen.</small></span></label><label class="choice"><input type="radio" name="side" id="side-inclusive" value="inclusive"><span>Fifteen including the pillar.<small>The clear floor must be shorter.</small></span></label></fieldset><p id="width-result" class="verdict" role="status"></p><p id="width-equation" class="equation"></p><p id="clear-result"></p><button type="button" class="source-link" data-reading="1">Read the Greek that decides this</button><details><summary>Which wall profile is being used?</summary><p>The upper wall body is five half-feet wide: 2½ feet. We combine that width with the support’s prescribed base breadth of 2¾ feet. The base and orthostat are wider than the upper wall body; the drawing omits those changing profiles and any pillar taper. This is a schematic account, not a measured floor plan.</p><button type="button" data-reading="4">Read the wall clause</button></details></div></div></section>
<section id="height" class="sheet" aria-labelledby="height-title"><div class="section-title"><p class="kicker">02 / A CORRECT TOTAL CAN HIDE A WRONG READING</p><h2 id="height-title" tabindex="-1">Seven segments.<br>One exception.</h2><p>The total pillar length is thirty feet <em>including</em> its capital. Seven segments form the shaft. All four feet long? Read the exception before trusting a matching sum.</p></div><div class="stack-workspace"><div class="plate stack"><div id="stack-plate"></div></div><div class="controls"><fieldset><legend>Length of the first segment</legend><label class="choice"><input type="radio" name="first" id="first-four" value="4"><span>Four feet, like the other six.</span></label><label class="choice"><input type="radio" name="first" id="first-five" value="5"><span>Five feet. The other six stay four.</span></label></fieldset><label for="capital">Choose a capital height, in fingers <input type="number" id="capital" min="0" max="64" step="1" required></label><p id="capital-unit" class="small"></p><button type="button" id="fit-total">Make the total thirty</button><p id="height-result" class="verdict" role="status"></p><p id="height-equation" class="equation"></p><p id="capital-inference"></p><button type="button" class="source-link" data-reading="7">Read “but the first”</button><p class="small">No capital profile is supplied here. The residual height is an arithmetic inference under the additive stack account.</p></div></div></section>
<section id="grid" class="sheet" aria-labelledby="grid-title"><div class="section-title"><p class="kicker">03 / SATISFYING SOME CLAUSES DOES NOT FINISH A BUILDING</p><h2 id="grid-title" tabindex="-1">Thirty-five pillars.<br>More than one plan.</h2><p>Keep two rows of thirty-five, four plethra long. Add a modern assumption: equal centre spacing and the same end gap at both ends. Change that gap. Can both drawings keep the selected measurements?</p></div><div class="grid-controls"><label for="end-gap">End gap, in fingers<input type="number" id="end-gap" min="64" max="192" step="1" required></label><div><button type="button" data-gap="80">Try five feet</button><button type="button" data-gap="112">Try seven feet</button></div><p id="gap-unit"></p></div><div class="plan-scroll" tabindex="0" role="region" aria-label="Longitudinal plan; arrow keys pan horizontally"><div id="grid-plate"></div></div><p id="grid-description" class="verdict"></p><p class="small">Filled markers use your chosen gap; red outlines show the alternate grid. This sheet uses the corrected width independently of the first experiment. End gaps are measured from the inner end-wall face to the nearest support edge. At narrow widths, focus the plan and use arrow keys to pan.</p><div class="bay-workspace"><div><label for="pillar">Inspect support number<input type="range" id="pillar" min="1" max="35" step="1"></label><p id="pillar-position"></p><p id="grid-equation" class="equation"></p><p id="grid-limit">Both grids satisfy the selected length, support count and schematic width. They are not two verified reconstructions of the full inscription. Roof members, masonry courses, doors, storage and archaeology can add constraints that this exercise does not test.</p><button type="button" data-reading="2">Read what the count actually says</button></div><div class="plate" id="bay-plate"></div></div></section>
<section id="greek" class="sheet" aria-labelledby="greek-title"><div class="section-title"><p class="kicker">04 / READ THE INSTRUCTIONS</p><h2 id="greek-title" tabindex="-1">A word can be<br>a dimension line.</h2><p>Read a short clause. Select a Greek phrase for its meaning and its job in the drawing. Square brackets disclose letters restored by the editor.</p></div><label for="reading-select">Reading<select id="reading-select">${readings.map((p, i) => `<option value="${i}">${i + 1}. ${esc(p.title)}</option>`).join("")}</select></label><article class="reading"><p id="reading-lines" class="kicker"></p><h3 id="reading-title"></h3><p id="reading-greek" lang="grc" class="greek"></p><p id="reading-english" class="translation"></p><div id="word-definition" class="definition" role="status"></div><p id="reading-note"></p><div id="reading-pages" class="actions"></div></article><div class="reading-nav"><button type="button" id="reading-prev">Previous reading</button><span id="reading-count"></span><button type="button" id="reading-next">Next reading</button></div><details><summary>What has been transcribed or translated?</summary><p>${esc(sourceNotice)}</p><p>Choisy’s original page uses an iota adscript (τῶι) and prints restorations that can differ from later editions. The new English and language notes are instructional; they have not received independent philological review.</p></details></section>
<section id="sources" class="sheet" aria-labelledby="source-title"><div class="section-title"><p class="kicker">05 / KEEP THE EDITOR IN THE PICTURE</p><h2 id="source-title" tabindex="-1">The text.<br>Then a reconstruction.</h2><p>Choisy printed the Greek with French translation and drew a complete building in 1884. His square pillars and finished roof are interpretive choices. Read his reasoning and compare the plates with the selected instructions.</p></div><div class="source-workspace"><div class="source-controls"><label for="source-page">Whole printed page<select id="source-page">${__SOURCE_MANIFEST__.pages.map((p) => `<option value="${p.pdfPage}">${esc(p.label)}</option>`).join("")}</select></label><div class="actions"><button type="button" id="source-enlarge" aria-pressed="false">Enlarge page</button><button type="button" id="source-retry">Retry source</button></div><p id="source-status" role="status"></p><p class="small">At enlarged size, focus the page and use arrow keys to pan. Full images retain margins, original French, Greek and notes.</p><p><a id="source-pdf">Open this page in the original PDF</a></p><p><a id="source-full" target="_blank" rel="noopener" hidden>Open full local image</a></p><p><a href="./sources/manifest.json">Source and file identities</a></p><p class="small">Auguste Choisy, <cite>Études épigraphiques sur l’architecture grecque</cite>, Paris, 1884. Getty Research Institute copy, digitized by Internet Archive. Public-domain publication.</p></div><figure><div id="source-frame" class="source-frame" tabindex="0" role="region" aria-label="Source page; arrow keys pan when enlarged"><img id="source-image" hidden alt=""></div><figcaption id="source-caption"></figcaption></figure></div><details><summary>Why a finished old drawing is still an interpretation</summary><p>On pp.18–19, Choisy argues for square pillars from his reading of technical language and construction. Plates I–II turn his interpretation into a detailed architectural image. This workshop shows those claims as nineteenth-century scholarship, not as features proved by the selected numerical clauses.</p><p>Roland Martin’s later <a href="https://www.persee.fr/doc/efr_0000-0000_1987_ant_99_1_2743">study of the roof vocabulary (1987, pp.401–410)</a> illustrates how technical terms can produce competing reconstructions. We do not model that roof or claim to resolve its interpretation.</p><p><a href="https://inscriptions.packhum.org/text/3893">Compare the modern IG II² 1668 transcript at PHI</a> · <a href="${__SOURCE_MANIFEST__.catalogue}">Original volume catalogue</a></p></details></section>
<section id="retain" class="sheet retain" aria-labelledby="retain-title"><div class="section-title"><p class="kicker">06 / TAKE THE EVIDENCE WITH YOU</p><h2 id="retain-title" tabindex="-1">Keep the drawing.<br>Keep its limits.</h2><p>The illustrated reading includes your experiment, all eight Greek readings and word notes, ten whole printed pages, drawings, native records and licenses. It opens without scripts or a connection and can be printed to PDF.</p></div><div class="actions"><button type="button" id="save-reading" class="primary">Save illustrated reading</button><button type="button" id="save-json">Save editable plan</button><button type="button" id="save-csv">Save measurement CSV</button><button type="button" id="save-svg">Save drawing SVG</button></div><p id="save-status" role="status"></p><div class="records"><div><label for="import-plan">Reopen a plan JSON<input type="file" accept=".json,application/json" id="import-plan"></label><p id="import-status" role="status"></p></div><div><button type="button" id="share">Copy experiment link</button><label for="share-link" id="share-label" hidden>Experiment link<textarea id="share-link" readonly rows="3"></textarea></label><p id="share-status" role="status"></p></div></div><p id="offline" class="offline" role="status"></p><button type="button" id="reload-edition" hidden>Reload the saved edition</button><details><summary>Exactly what this model does</summary><p>${esc(modelNotice)}</p><p>Drawn positions use approximate screen coordinates. Width and height use whole fingers; centre positions and spacings are exact fractions. The chosen end gap is limited to four through twelve feet, in whole-finger steps. Capital height is limited to zero through four feet. These are workshop limits, not historical bounds.</p><p>New code, English and diagrams are MIT licensed. Original printed pages are public domain. Noto Serif uses SIL OFL 1.1. <a href="./LICENSE.txt">MIT license</a> · <a href="./fonts/OFL.txt">Font license</a>.</p></details><button type="button" id="reset">Reset the two opening misreadings</button></section></main><footer><p>Syngraphe · Written specifications, working drawings.</p><a href="https://github.com/antonsoo/syngraphe">Source &amp; methods</a><span>Zero tracking · Greek-capable local font</span></footer>`;
const setStatus = (id: string, t: string) => {
  el(id).textContent = t;
};
const showPage = sourceViewer((page) => {
  state = { ...state, page };
});
function renderWord() {
  const r = readings[state.reading],
    w = r?.words[wordIndex];
  if (!w) return;
  el("word-definition").innerHTML =
    `<p><strong>${esc(w.meaning)}</strong><br>Dictionary form: <span lang="grc">${esc(w.lemma)}</span></p><p>${esc(w.work)}</p>`;
  for (const b of el("reading-greek").querySelectorAll<HTMLButtonElement>("button"))
    b.setAttribute("aria-pressed", String(Number(b.dataset.word) === wordIndex));
}
function renderReading() {
  const r = readings[state.reading];
  if (!r) throw new Error("Missing reading.");
  el<HTMLSelectElement>("reading-select").value = String(state.reading);
  setStatus("reading-lines", `IG II² 1668 · lines ${r.lines} · Choisy, 1884`);
  setStatus("reading-title", r.title);
  let pos = 0,
    html = "";
  while (pos < r.greek.length) {
    const next = r.words
      .map((w, i) => ({ i, form: w.form, pos: r.greek.indexOf(w.form, pos) }))
      .filter((w) => w.pos >= 0)
      .sort((a, b) => a.pos - b.pos || b.form.length - a.form.length)[0];
    if (!next) {
      html += esc(r.greek.slice(pos));
      break;
    }
    html +=
      esc(r.greek.slice(pos, next.pos)) +
      `<button type="button" data-word="${next.i}" aria-pressed="false">${esc(next.form)}</button>`;
    pos = next.pos + next.form.length;
  }
  el("reading-greek").innerHTML = html;
  setStatus("reading-english", r.english);
  setStatus("reading-note", r.note);
  el("reading-pages").innerHTML = r.pages
    .map(
      (p, i) =>
        `<button type="button" data-page="${p}">${i ? "Show continuation" : "Show whole source page"} · PDF ${p}</button>`,
    )
    .join("");
  setStatus("reading-count", `${state.reading + 1} of ${readings.length}`);
  el<HTMLButtonElement>("reading-prev").disabled = state.reading === 0;
  el<HTMLButtonElement>("reading-next").disabled = state.reading === readings.length - 1;
  renderWord();
}
function render() {
  const w = widthAccount(state),
    h = heightAccount(state),
    g = grid(state.endGap),
    c = g.centers[state.pillar - 1];
  if (!c) throw new Error("Missing support.");
  el<HTMLInputElement>(`side-${state.side}`).checked = true;
  el<HTMLInputElement>(state.first === 4 ? "first-four" : "first-five").checked = true;
  for (const [id, value] of [
    ["capital", state.capital],
    ["end-gap", state.endGap],
    ["pillar", state.pillar],
  ] as const)
    el<HTMLInputElement>(id).value = String(value);
  el("width-plate").innerHTML = widthPlate(state);
  el("stack-plate").innerHTML = stackPlate(state);
  el("grid-plate").innerHTML = gridPlate(state, true);
  el("bay-plate").innerHTML = bayPlate(state);
  setStatus(
    "width-result",
    w.matches
      ? "55 feet. The width account closes."
      : `${feet(w.total)} feet. ${feet(w.excess)} feet too wide.`,
  );
  el("width-result").dataset.pass = String(w.matches);
  setStatus(
    "width-equation",
    `2 × 2½ walls + 2 × ${feet(w.clear)} clear floor + 2 × 2¾ supports + 20 passage = ${feet(w.total)} ft`,
  );
  setStatus(
    "clear-result",
    `Clear side floor: ${feet(w.clear)} feet. The inclusive reading gives 15 − 2¾ = 12¼ feet under this schematic profile.`,
  );
  setStatus(
    "capital-unit",
    `${state.capital} fingers = ${feet(state.capital)} ${state.capital === 16 ? "foot" : "feet"}. One foot = 4 palms = 16 fingers.`,
  );
  setStatus(
    "height-result",
    h.matches
      ? h.firstMatches
        ? "30 feet, and the first-segment exception is observed."
        : "30 feet fits. But the first segment still contradicts the clause."
      : `${feet(h.total)} feet. The prescribed total is 30, including the capital.`,
  );
  el("height-result").dataset.pass = String(h.matches && h.firstMatches);
  setStatus(
    "height-equation",
    `${state.first} + 6 × 4 + ${feet(state.capital)} = ${feet(h.total)} ft`,
  );
  setStatus(
    "capital-inference",
    `This shaft leaves ${feet(h.inferredCapital)} ${h.inferredCapital === 16 ? "foot" : "feet"} for a capital. Only the five-foot first segment yields the source-compatible 29-foot shaft and one-foot residual. That residual is derived.`,
  );
  setStatus("gap-unit", `${state.endGap} fingers = ${feet(state.endGap)} feet at each end.`);
  setStatus(
    "grid-description",
    `Same count. Different positions. Your gap: ${feet(state.endGap)} ft; outlined alternative: ${state.endGap === 112 ? "5" : "7"} ft. Both keep 35 supports per row.`,
  );
  setStatus(
    "pillar-position",
    `Support ${state.pillar} of 35. Centre ${feet(c)} feet from the outer end. Centre spacing: ${feet(g.spacing)} feet; clear bay: ${feet(g.clearBay)} feet.`,
  );
  setStatus(
    "grid-equation",
    `Spacing = (400 − 2 × 2½ − 2 × ${feet(state.endGap)} − 2¾) ÷ 34 = ${feet(g.spacing)} ft`,
  );
  renderReading();
}
function apply(next: PlanState) {
  if (!validState(next)) {
    setStatus(
      "notice",
      "That value is outside the workshop limits. The drawing keeps the last valid settings.",
    );
    return false;
  }
  state = { ...next };
  setStatus("notice", "");
  render();
  return true;
}
for (const name of ["side", "first"])
  for (const input of document.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`))
    input.addEventListener("change", () =>
      apply({ ...state, [name]: name === "first" ? Number(input.value) : input.value }),
    );
for (const [id, key] of [
  ["capital", "capital"],
  ["end-gap", "endGap"],
  ["pillar", "pillar"],
] as const)
  el<HTMLInputElement>(id).addEventListener(key === "pillar" ? "input" : "change", (e) =>
    apply({ ...state, [key]: (e.currentTarget as HTMLInputElement).valueAsNumber }),
  );
el("fit-total").addEventListener("click", () =>
  apply({ ...state, capital: heightAccount(state).inferredCapital }),
);
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-gap]"))
  button.addEventListener("click", () => apply({ ...state, endGap: Number(button.dataset.gap) }));
for (const button of document.querySelectorAll<HTMLButtonElement>("[data-reading]"))
  button.addEventListener("click", () => {
    wordIndex = 0;
    apply({ ...state, reading: Number(button.dataset.reading) });
    el("greek-title").focus();
    el("greek").scrollIntoView();
  });
el<HTMLSelectElement>("reading-select").addEventListener("change", (e) => {
  wordIndex = 0;
  apply({ ...state, reading: Number((e.currentTarget as HTMLSelectElement).value) });
});
for (const [id, offset] of [
  ["reading-prev", -1],
  ["reading-next", 1],
] as const)
  el(id).addEventListener("click", () => {
    wordIndex = 0;
    apply({ ...state, reading: state.reading + offset });
  });
el("reading-greek").addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-word]");
  if (b) {
    wordIndex = Number(b.dataset.word);
    renderWord();
  }
});
el("reading-pages").addEventListener("click", (e) => {
  const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-page]");
  if (b) {
    void showPage(Number(b.dataset.page));
    el("source-title").focus();
    el("sources").scrollIntoView();
  }
});
el("save-json").addEventListener("click", () =>
  download("syngraphe-plan.json", "application/json", planRecord(state)),
);
el("save-csv").addEventListener("click", () =>
  download("syngraphe-measurements.csv", "text/csv", ledgerCSV(state)),
);
el("save-svg").addEventListener("click", () =>
  download("syngraphe-study.svg", "image/svg+xml", completeSVG(state)),
);
el<HTMLButtonElement>("save-reading").addEventListener("click", async () => {
  const button = el<HTMLButtonElement>("save-reading"),
    snapshot = { ...state };
  button.disabled = true;
  setStatus("save-status", "Verifying ten complete pages, font and licenses for this reading…");
  try {
    const html = await illustratedReading(snapshot);
    download("syngraphe-reading.html", "text/html", html);
    setStatus(
      "save-status",
      "Illustrated reading saved with the settings selected when saving began. Open it to read or print to PDF.",
    );
  } catch (e) {
    setStatus(
      "save-status",
      e instanceof Error ? e.message : "Could not save the complete reading. Reconnect and retry.",
    );
  } finally {
    button.disabled = false;
  }
});
el<HTMLInputElement>("import-plan").addEventListener("change", async (e) => {
  const input = e.currentTarget as HTMLInputElement,
    file = input.files?.[0];
  if (!file) return;
  try {
    if (file.size > 20000) throw new Error("Plan files must be smaller than 20 KB.");
    const next = importPlan(await file.text());
    wordIndex = 0;
    apply(next);
    void showPage(state.page);
    setStatus("import-status", "Plan reopened. The source page is being verified separately.");
  } catch (e) {
    setStatus(
      "import-status",
      e instanceof Error ? e.message : "Could not read this plan. No settings were changed.",
    );
  } finally {
    input.value = "";
  }
});
el("share").addEventListener("click", async () => {
  const link = stateURL(state, location.href);
  el<HTMLTextAreaElement>("share-link").value = link;
  el("share-label").hidden = false;
  try {
    await navigator.clipboard.writeText(link);
    setStatus(
      "share-status",
      "Experiment link copied. It includes the selected reading and source page.",
    );
  } catch {
    setStatus("share-status", "Select and copy the experiment link below.");
    el<HTMLTextAreaElement>("share-link").select();
  }
});
el("reset").addEventListener("click", () => {
  wordIndex = 0;
  apply({ ...initial });
  void showPage(state.page);
});
window.addEventListener("popstate", () => {
  const next = fromURL(location.href);
  wordIndex = 0;
  apply(next.state);
  setStatus("notice", next.warning);
  void showPage(state.page);
});
el("width-enlarge").addEventListener("click", () => {
  const large = el("width-frame").classList.toggle("enlarged");
  el("width-enlarge").setAttribute("aria-pressed", String(large));
  el("width-enlarge").textContent = large ? "Fit drawing to width" : "Enlarge drawing";
  el("width-frame").focus();
});
render();
void showPage(state.page);
prepareOffline(el("offline"), el<HTMLButtonElement>("reload-edition"));
