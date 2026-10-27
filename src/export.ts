import { studyDataUrl, studyText } from "./assets";
import { modelNotice, readings, sourceNotice } from "./content/readings";
import {
  feet,
  grid,
  heightAccount,
  ledgerCSV,
  type PlanState,
  planRecord,
  widthAccount,
} from "./core/model";
import { bayPlate, completeSVG, gridPlate, stackPlate, widthPlate } from "./drawing";
import { esc } from "./escape";
export function download(name: string, type: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
function encodedLink(name: string, type: string, content: string, label: string) {
  return `<a download="${name}" href="data:${type};charset=utf-8,${encodeURIComponent(content)}">${label}</a>`;
}
export async function illustratedReading(state: PlanState): Promise<string> {
  const snapshot = { ...state },
    w = widthAccount(snapshot),
    h = heightAccount(snapshot),
    g = grid(snapshot.endGap);
  const [font, license, images] = await Promise.all([
    studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    studyText("fonts/OFL.txt"),
    Promise.all(
      __SOURCE_MANIFEST__.pages.map(async (p) => ({
        page: p,
        data: await studyDataUrl(`sources/${p.file}`, "image/jpeg"),
      })),
    ),
  ]);
  const clauses = readings
    .map(
      (p, i) =>
        `<article class="reading"><p class="kicker">READING ${i + 1} · IG II² 1668, ${p.lines}</p><h2>${esc(p.title)}</h2><p lang="grc" class="greek">${esc(p.greek)}</p><p>${esc(p.english)}</p><p>${esc(p.note)}</p><dl>${p.words.map((n) => `<dt lang="grc">${esc(n.form)}</dt><dd><strong>${esc(n.meaning)}</strong> · dictionary form <span lang="grc">${esc(n.lemma)}</span>. ${esc(n.work)}</dd>`).join("")}</dl><p>Whole source: ${p.pages.map((n) => `<a href="#page-${n}">PDF p.${n}</a>`).join(", ")}.</p></article>`,
    )
    .join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Syngraphe · retained architectural reading</title><style>
@font-face{font-family:Reading;src:url('${font}') format('truetype');font-display:block}*{box-sizing:border-box}body{font:16px/1.65 Reading,Georgia,serif;background:#f6f0e4;color:#302a22;max-width:960px;margin:auto;padding:36px}a{color:#792b22}h1,h2,h3{font-weight:400;line-height:1.2}h1{font-size:42px}h2{margin-top:2em;font-size:29px}.kicker{font-size:12px;letter-spacing:.08em}.greek{font-size:22px;line-height:1.8}article{border-top:1px solid #a89b85;margin-top:40px;padding-top:12px}dt{margin-top:12px;font-weight:bold}dd{margin-left:0}figure{margin:30px 0}img{width:100%;height:auto}figcaption{font-size:13px}svg{width:100%;height:auto}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:10px}table{border-collapse:collapse;width:100%;margin:25px 0}td,th{text-align:left;border-bottom:1px solid #a89b85;padding:10px}.wall{fill:#62594b}.floor{fill:#f3ecdd;stroke:#a89b85}.support,.segment{fill:#d7cdb7;stroke:#534b3f}.passage{fill:#dbe2c5;stroke:#626a40}.first,.capital{fill:#e1bca7;stroke:#862e24}line{stroke:#514739;stroke-width:1}.drawing text{font:15px Reading,serif;fill:#302a22}.drawing .fine{font-size:12px}.target line,line.target{stroke:#746c5c;stroke-dasharray:5 4}.good line,line.good{stroke:#4d5d30}.good text{fill:#4d5d30}.bad line,line.bad{stroke:#862e24}.bad text{fill:#862e24}.selected{fill:#862e24}.alternate{fill:none;stroke:#862e24;stroke-dasharray:2 1}.light{fill:#f6f0e4}.source figure{break-inside:avoid}.license{font-size:11px}@media(max-width:600px){body{padding:20px}.greek{font-size:20px}h1{font-size:32px}}@media print{@page{size:A4;margin:17mm}body{background:white;padding:0;max-width:none;font-size:10pt}h1{font-size:26pt}h2{font-size:18pt}.greek{font-size:13pt}.reading{break-before:page}.reading h2{margin-top:12px}.source figure{break-before:page;break-inside:avoid}.source img{max-height:240mm;object-fit:contain}a{color:inherit}pre{font-size:6pt}.drawings svg{max-height:215mm}.drawing-study{break-before:page;break-inside:avoid}.drawing-study h2{margin-top:0}.source figcaption{font-size:9pt}}
</style></head><body><p class="kicker">SYNGRAPHE / SELECTED-CLAUSE STUDY / IG II² 1668</p><h1>A building in the words.</h1><p>Greek building specification for the naval equipment storehouse at Zea, Piraeus; dated 347/6 BCE in the modern inscription catalogue. The text names Euthydomos and Philon. Printed evidence: Auguste Choisy, 1884. New English, word notes and diagrams: Anton Soloviev, 2026.</p><p>${esc(modelNotice)}</p>
<h2>Your measured reading</h2><table><tr><th>Item</th><th>This experiment</th><th>What it establishes</th></tr><tr><td>Fifteen-foot reading</td><td>${snapshot.side === "inclusive" ? "Including the pillar" : "Clear floor plus pillar"}</td><td>Model width ${feet(w.total)} ft; prescribed 55 ft. ${w.matches ? "Width account closes." : "Width account does not close."}</td></tr><tr><td>First segment</td><td>${snapshot.first} ft; six others 4 ft</td><td>Shaft ${feet(h.shaft)} ft. Source exception ${h.firstMatches ? "observed" : "not observed"}.</td></tr><tr><td>Chosen capital</td><td>${feet(snapshot.capital)} ft</td><td>Total ${feet(h.total)} ft; prescribed 30 ft including capital. Inferred residual ${feet(h.inferredCapital)} ft.</td></tr><tr><td>Chosen symmetric end gap</td><td>${feet(snapshot.endGap)} ft</td><td>Uniform centre spacing ${feet(g.spacing)} ft. Modern assumption.</td></tr></table>
<p>One foot = four palms = sixteen fingers. No metre conversion is assumed. Exact record values use fingers. The word “derived” never means separately inscribed.</p>
<p>${encodedLink("syngraphe-plan.json", "application/json", planRecord(snapshot), "Save editable plan JSON")} · ${encodedLink("syngraphe-measurements.csv", "text/csv", ledgerCSV(snapshot), "Save measurement CSV")} · ${encodedLink("syngraphe-study.svg", "image/svg+xml", completeSVG(snapshot), "Save drawn study SVG")}</p>
<section class="drawings"><section class="drawing-study"><h2>The width account</h2>${widthPlate(snapshot)}<p>The side floor is ${feet(w.clear)} feet. Using the upper wall body and base pillar breadth: two walls + two side floors + two supports + public passage = ${feet(w.total)} feet.</p></section><section class="drawing-study"><h2>The stack account</h2>${stackPlate(snapshot)}<p>${snapshot.first} + 6 × 4 + ${feet(snapshot.capital)} = ${feet(h.total)} feet. A matched total alone cannot rescue the wrong first-segment reading.</p></section><section class="drawing-study"><h2>Two possible grids under selected constraints</h2>${gridPlate(snapshot, true)}${bayPlate(snapshot)}<p>Solid support markers use your chosen gap; outlines use ${snapshot.endGap === 112 ? "five" : "seven"} feet. Both grids keep 35 supports in each row and the nominal length. They demonstrate underdetermination by the selected clauses, not two validated reconstructions of the entire inscription.</p></section></section>
<h2>Read the Greek</h2><p>${esc(sourceNotice)}</p>${clauses}
<section class="source"><h2>Whole printed evidence</h2><p>${esc(__SOURCE_MANIFEST__.title)}. ${esc(__SOURCE_MANIFEST__.author)}, 1884, Paris. ${esc(__SOURCE_MANIFEST__.copy)}. ${esc(__SOURCE_MANIFEST__.rights)}</p><p>Pages 18–19 and plates I–II are Choisy’s commentary and reconstruction. Their apparent completeness is an interpretation. They do not make every drawn feature an explicit instruction on the stone.</p>${images.map(({ page: p, data }) => `<figure id="page-${p.pdfPage}"><img src="${data}" alt="Whole page: ${esc(p.label)}"><figcaption>${esc(p.label)} · PDF p.${p.pdfPage} · ${p.kind === "text" ? "Greek with Choisy’s French and notes" : p.kind === "title" ? "Edition identity" : "Nineteenth-century interpretation"}.</figcaption></figure>`).join("")}</section>
<h2>Provenance and limits</h2><p>${esc(modelNotice)}</p><p>Source PDF SHA-256: ${__SOURCE_MANIFEST__.pdfSha256}. This file embeds the ten complete source pages and the local Greek-capable font. It contains no JavaScript or remote font/image request. External links need a connection; the retained reading, drawings and native downloads do not.</p><p>Comparison references: <a href="https://inscriptions.packhum.org/text/3893">PHI / IG II² 1668</a>; <a href="${__SOURCE_MANIFEST__.catalogue}">Choisy, 1884, catalogue</a>; <a href="https://www.persee.fr/doc/efr_0000-0000_1987_ant_99_1_2743">Roland Martin, note on the disputed roof vocabulary, 1987</a>. New English and notes have not received independent philological review. No physical print dimensions are asserted.</p><p>New code, English and diagrams: MIT, Copyright (c) 2026 Anton Soloviev. Source publication: public domain. Font: Noto Serif, SIL Open Font License 1.1.</p><details class="license"><summary>Complete font license</summary><pre>${esc(license)}</pre></details><details class="license"><summary>Complete MIT license</summary><pre>${esc(await studyText("LICENSE.txt"))}</pre></details></body></html>`;
}
