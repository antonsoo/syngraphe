import { studyDataUrl, studyText } from "./assets";
import { visibilityReadings } from "./content/visibility";
import {
  clauseMatches,
  MODEL_SCOPE,
  openingNames,
  reason,
  route,
  sightlines,
  type VisibilityState,
  visibilityCSV,
  visibilityPages,
  visibilityRecord,
} from "./core/visibility";
import { esc } from "./escape";
import { visibilitySVG } from "./visibility-drawing";

export async function visibilityReading(state: VisibilityState): Promise<string> {
  const s = { ...state },
    matches = clauseMatches(s),
    rays = sightlines(s);
  const [font, ofl, mit, images] = await Promise.all([
    studyDataUrl("fonts/NotoSerif-Regular.ttf", "font/ttf"),
    studyText("fonts/OFL.txt"),
    studyText("LICENSE.txt"),
    Promise.all(
      visibilityPages.map(async (n) => {
        const p = __SOURCE_MANIFEST__.pages.find((p) => p.pdfPage === n);
        if (!p) throw new Error(`Missing source page ${n}.`);
        return { p, data: await studyDataUrl(`sources/${p.file}`, "image/jpeg") };
      }),
    ),
  ]);
  const link = (name: string, type: string, content: string, text: string) =>
    `<a download="${name}" href="data:${type};charset=utf-8,${encodeURIComponent(content)}">${text}</a>`;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Syngraphe · seeing while passing</title><style>
@font-face{font-family:Study;src:url('${font}') format('truetype');font-display:block}*{box-sizing:border-box}body{overflow-wrap:anywhere;font:16px/1.7 Study,Georgia,serif;color:#302a22;background:#f6f0e4;max-width:960px;margin:auto;padding:32px}h1,h2,h3{font-weight:400;line-height:1.2}h1{font-size:42px}h2{font-size:28px}a{color:#862e24}svg,img{width:100%;height:auto;display:block}figure{margin:24px 0}figcaption{font-size:13px}.greek{font-size:22px;line-height:1.9;overflow-wrap:anywhere}.reading,.plate,.source{border-top:1px solid #b8aa91;padding-top:24px;margin-top:32px}.scope{border-left:3px solid #244b75;padding-left:20px}dt{font-weight:bold;margin-top:15px}dd{margin-left:0}table{width:100%;border-collapse:collapse;font-size:13px}td,th{text-align:left;border-bottom:1px solid #b8aa91;padding:7px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px}.table-wrap{overflow:auto}@media(max-width:600px){body{padding:18px}h1{font-size:34px}}@media print{@page{size:A4;margin:17mm}body{background:white;padding:0;font-size:10pt}h1{font-size:26pt}h2{font-size:18pt}.greek{font-size:13pt}.reading,.plate,.source{break-before:page}.source img{max-height:235mm;object-fit:contain}.source{break-inside:avoid}.plate svg{max-height:190mm}table{font-size:8pt}tr{break-inside:avoid}thead{display:table-header-group}pre{font-size:6pt}a{color:inherit}}
</style></head><body><h1>Seeing while passing</h1><p>Syngraphe / IG II² 1668, selected clauses from lines 12–14 and 85–91. New English and diagrams: Anthony Mercer, 2026. Printed evidence: Auguste Choisy, 1884.</p><p class="scope">${esc(MODEL_SCOPE)}</p><p>Wall chest: ${openingNames[s.wall]}. Pillar chest: ${openingNames[s.pillar]}. Viewer at ${s.station} feet relative to the isolated support.</p><p>Stated opening faces: wall chest ${matches.wall ? "agrees" : "differs"}; pillar chest ${matches.pillar ? "agrees" : "differs"}. This comparison concerns the selected faces only, not all the building's requirements.</p><p>A: ${esc(reason(rays[0]))} B: ${esc(reason(rays[1]))}</p>
<p>${link("syngraphe-sightline.json", "application/json", visibilityRecord(s), "Save editable JSON")} · ${link("syngraphe-stations.csv", "text/csv", visibilityCSV(s), "Save all stations as CSV")} · ${link("syngraphe-sightline.svg", "image/svg+xml", visibilitySVG(s, true), "Save current SVG")}</p>
${[s.station, ...[-20, 0, 20].filter((n) => n !== s.station)]
  .map(
    (station, i) =>
      `<section class="plate"><h2>${i === 0 ? "Your selected position" : "Another position"}: ${station} ft</h2>${visibilitySVG({ ...s, station })}<p>${sightlines(
        { ...s, station },
      )
        .map((r) => `${r.id === "wall" ? "A" : "B"}: ${esc(reason(r))}`)
        .join(" ")}</p></section>`,
  )
  .join("")}
<section class="reading"><h2>All 41 stations</h2><p>These are independent observations at one-foot intervals from −20 to +20 feet. No cumulative visit history is asserted. A visible sample is not a visible whole chest.</p><div class="table-wrap"><table><thead><tr><th>Station (ft)</th><th>A / wall sample</th><th>B / pillar sample</th></tr></thead><tbody>${route(
    s,
  )
    .map(
      (row) =>
        `<tr><td>${row.station}</td>${row.rays.map((ray) => `<td>${esc(reason(ray))}</td>`).join("")}</tr>`,
    )
    .join("")}</tbody></table></div></section>
${visibilityReadings.map((r) => `<article class="reading"><p>IG II² 1668, lines ${esc(r.lines)}</p><h2>${esc(r.title)}</h2><p class="greek" lang="grc">${esc(r.greek)}</p><p>${esc(r.english)}</p><p>${esc(r.note)}</p><dl>${r.words.map((w) => `<dt lang="grc">${esc(w.form)}</dt><dd>${esc(w.meaning)}. Dictionary form: <span lang="grc">${esc(w.lemma)}</span>. ${esc(w.work)}</dd>`).join("")}</dl><p>Whole printed evidence: ${r.pages.map((n) => `<a href="#page-${n}">PDF p.${n}</a>`).join(", ")}.</p></article>`).join("")}
<section class="reading"><h2>What the diagram chooses</h2><p>The earlier room's schematic account combines a 2½-foot upper wall body, a 2¾-foot support base, fifteen feet including that support and a twenty-foot passage. The support has a square footprint here; the source's breadth does not prescribe that shape.</p><p>The wall chest occupies x = 5…9 and y = 31…35 feet; the pillar chest x = −2…2 and y = 22¾…26¾. Their centre samples are (7,33) and (0,24¾). The support occupies x = −1⅜…1⅜ and y = 20…22¾. The viewer moves at y = 10. The coordinates, four-foot chest sizes and isolated-support setup are modern choices. Front is toward the passage (lower y); left/right are the long direction (lower/higher x).</p><p>Closed faces are opaque zero-thickness lines; open faces are removed, without simulating a hinged panel. Straight two-dimensional segments stop at the first closed face or support, including corner contact. Neighbouring supports, grilles, doors, vertical obstructions, stored objects, illumination and people are omitted.</p><p>Front openings on both chests can expose both samples somewhere along this path while failing the pillar wording. Conversely, the stated openings can leave a sample hidden at a particular station. Neither result refutes the inscription: these samples and this geometry are ours. No reconstruction of all 134 chests, inspection procedure or actual historical use is asserted. The translations and word notes have not received independent philological review.</p></section>
${images.map(({ p, data }) => `<figure class="source" id="page-${p.pdfPage}"><img src="${data}" alt="Whole printed page: ${esc(p.label)}"><figcaption>${esc(p.label)} / PDF p.${p.pdfPage}. Choisy, ${esc(__SOURCE_MANIFEST__.title)}, 1884. ${esc(__SOURCE_MANIFEST__.copy)}. Whole margins, Greek, French and notes retained.</figcaption></figure>`).join("")}
<section class="reading"><h2>Sources and rights</h2><p>Source PDF SHA-256: ${__SOURCE_MANIFEST__.pdfSha256}. All four page images and the local font are embedded and were checked against this edition's byte lengths and SHA-256 values before saving. This reading uses no scripts or remote image/font requests. Its native JSON, CSV and SVG downloads work without scripts.</p><p><a href="${__SOURCE_MANIFEST__.catalogue}">Choisy's 1884 volume</a> / <a href="https://inscriptions.packhum.org/text/3893">Modern IG transcript for comparison</a>. Initial case and excerpt punctuation are normalized; the retained printed spellings, restorations and excerpt boundaries are disclosed in the notes.</p><p>Historical publication: public domain in the United States; Choisy died in 1909. New code, English and diagrams: MIT, Copyright (c) 2026 Anthony Mercer. Font: Noto Serif, SIL OFL 1.1.</p><details><summary>Complete font license</summary><pre>${esc(ofl)}</pre></details><details><summary>Complete MIT license</summary><pre>${esc(mit)}</pre></details></section></body></html>`;
}
