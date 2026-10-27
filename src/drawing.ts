import {
  DIM,
  feet,
  grid,
  heightAccount,
  numeric,
  type PlanState,
  widthAccount,
} from "./core/model";
import { esc } from "./escape";

const line = (x1: number, y1: number, x2: number, y2: number, cls = "") =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`;
const text = (x: number, y: number, t: string, cls = "") =>
  `<text x="${x}" y="${y}" text-anchor="middle" class="${cls}">${esc(t)}</text>`;
function dimension(x1: number, x2: number, y: number, label: string, cls = "") {
  return `<g class="dimension ${cls}">${line(x1, y, x2, y)}${line(x1, y - 5, x1, y + 5)}${line(x2, y - 5, x2, y + 5)}${text((x1 + x2) / 2, y - 10, label)}</g>`;
}
const svg = (viewBox: string, title: string, body: string, cls = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="${esc(title)}" class="drawing ${cls}"><title>${esc(title)}</title>${body}</svg>`;
export function widthPlate(s: PlanState): string {
  const w = widthAccount(s),
    scale = 800 / (61 * 16),
    x0 = 44,
    y = 146,
    h = 120;
  const parts = [
    { n: DIM.wall, kind: "wall", label: "wall" },
    { n: w.clear, kind: "floor", label: "side floor" },
    { n: DIM.pillar, kind: "support", label: "pillar" },
    { n: DIM.passage, kind: "passage", label: "public passage" },
    { n: DIM.pillar, kind: "support", label: "pillar" },
    { n: w.clear, kind: "floor", label: "side floor" },
    { n: DIM.wall, kind: "wall", label: "wall" },
  ];
  let x = x0;
  const bands = parts
    .map((p) => {
      const start = x;
      x += p.n * scale;
      return `<rect x="${start}" y="${y}" width="${p.n * scale}" height="${h}" class="${p.kind}"/>${p.kind === "floor" || p.kind === "passage" ? text((start + x) / 2, y + h / 2 + 5, p.label) : ""}`;
    })
    .join("");
  const wall = DIM.wall * scale,
    side = w.side * scale,
    passage = DIM.passage * scale;
  return svg(
    "0 0 920 375",
    `Width account: ${feet(w.total)} feet; prescribed fifty-five. Each clear side is ${feet(w.clear)} feet.`,
    `${dimension(x0, x0 + DIM.width * scale, 63, "55 feet prescribed", "target")}${dimension(x0, x, 105, `${feet(w.total)} feet in this reading`, w.matches ? "good" : "bad")}${bands}${dimension(x0 + wall, x0 + wall + side, 305, `${feet(w.side)} ft incl. support`)}${dimension(x0 + wall + side, x0 + wall + side + passage, 305, "20 ft clear")}${dimension(x0 + wall + side + passage, x0 + wall + 2 * side + passage, 305, `${feet(w.side)} ft incl. support`)}${text(460, 355, "Plan slice • upper wall body + base support breadth • profiles omitted", "fine")}`,
  );
}
export function stackPlate(s: PlanState): string {
  const a = heightAccount(s),
    scale = 12,
    y0 = 440,
    x = 162,
    width = 75;
  let y = y0;
  const blocks = Array.from({ length: DIM.segments }, (_, i) => {
    const height = i === 0 ? s.first : 4;
    y -= height * scale;
    return `<rect x="${x}" y="${y}" width="${width}" height="${height * scale}" class="${i === 0 ? "first" : "segment"}"/>${text(x + width / 2, y + (height * scale) / 2 + 6, `${i + 1}`)}${text(300, y + (height * scale) / 2 + 6, `${height} ft`)}`;
  }).join("");
  const cap = (s.capital / 16) * scale;
  y -= cap;
  const targetY = y0 - 30 * scale;
  const capital = `<rect x="${x - 10}" y="${y}" width="${width + 20}" height="${cap}" class="capital"/>${text(300, y - 8, `${feet(s.capital)} ft capital`)}`;
  return svg(
    "0 0 440 495",
    `Pillar stack: first segment ${s.first} feet, six more of four feet, capital ${feet(s.capital)} feet; total ${feet(a.total)} feet.`,
    `${line(115, targetY, 350, targetY, "target")}${text(195, 25, "30 ft including capital • prescribed", "fine")}${blocks}${capital}${line(120, y, 120, y0, a.matches ? "good" : "bad")}${line(115, y, 125, y)}${line(115, y0, 125, y0)}<text transform="translate(96 ${(y + y0) / 2}) rotate(-90)" text-anchor="middle">${feet(a.total)} ft total</text>${line(135, y0, 265, y0)}${text(215, 466, "Segment numbers run from the bottom.", "fine")}${text(215, 486, "Widths and capital profile are schematic.", "fine")}`,
  );
}
function planBody(s: PlanState, endGap: number, compare = false) {
  const w = widthAccount({ ...s, side: "inclusive" }),
    g = grid(endGap),
    scale = 2.65 / 16,
    x = 55,
    y = 96;
  const W = DIM.width * scale,
    L = DIM.length * scale,
    wall = DIM.wall * scale,
    d = DIM.pillar * scale;
  const row1 = y + wall + w.clear * scale,
    row2 = row1 + d + DIM.passage * scale;
  const color = compare ? "alternate" : "support";
  const supports = g.centers
    .map((c, i) => {
      const cx = x + numeric(c) * scale;
      return [row1, row2]
        .map(
          (cy) =>
            `<rect x="${cx - d / 2}" y="${cy}" width="${d}" height="${d}" class="${color} ${!compare && i + 1 === s.pillar ? "selected" : ""}"/>`,
        )
        .join("");
    })
    .join("");
  if (compare) return supports;
  return `<rect x="${x}" y="${y}" width="${L}" height="${W}" class="wall"/><rect x="${x + wall}" y="${y + wall}" width="${L - 2 * wall}" height="${W - 2 * wall}" class="floor"/><rect x="${x + wall}" y="${row1 + d}" width="${L - 2 * wall}" height="${DIM.passage * scale}" class="passage"/>${supports}${dimension(x, x + L, 58, "400 feet • four plethra")}${text(x + L / 2, y + W + 40, "35 in each row • 70 supports • two equally spaced layouts can satisfy these selected counts", "fine")}`;
}
export function gridPlate(s: PlanState, alternate: boolean): string {
  return svg(
    "0 0 1180 320",
    `Two rows of thirty-five supports in a four-hundred-foot schematic plan, symmetric end gaps ${feet(s.endGap)} feet${alternate ? ", with an alternative seven-foot end gap outlined" : ""}.`,
    planBody(s, s.endGap) + (alternate ? planBody(s, s.endGap === 112 ? 80 : 112, true) : ""),
    "long-plan",
  );
}
export function bayPlate(s: PlanState): string {
  const g = grid(s.endGap),
    i = s.pillar - 1,
    c = g.centers[i];
  if (!c) throw new Error("Missing selected support.");
  const next = g.centers[i + 1] ?? g.centers[i - 1];
  if (!next) throw new Error("Missing adjacent support.");
  const spacing = numeric(g.spacing) / 16,
    scale = 460 / (spacing + 6),
    x = 90,
    y = 100,
    d = (DIM.pillar / 16) * scale;
  const second = x + spacing * scale;
  return svg(
    "0 0 690 300",
    `Local detail: support ${s.pillar} and ${i < 34 ? s.pillar + 1 : s.pillar - 1}; centre spacing ${feet(g.spacing)} feet; clear bay ${feet(g.clearBay)} feet.`,
    `<rect x="${x}" y="${y}" width="${d}" height="80" class="support"/><rect x="${second}" y="${y}" width="${d}" height="80" class="support"/>${dimension(x + d / 2, second + d / 2, 65, `${feet(g.spacing)} ft centre to centre`)}${dimension(x + d, second, 224, `${feet(g.clearBay)} ft clear`)}${text(x + d / 2, 145, String(s.pillar))}${text(second + d / 2, 145, String(i < 34 ? s.pillar + 1 : s.pillar - 1))}${text(340, 273, `Selected centre is ${feet(c)} ft from the outer end.`, "fine")}${text(340, 295, i === 34 ? "Last-bay detail is reflected for legibility." : "The grid is a modern construction, not an inscribed spacing.", "fine")}`,
  );
}
export function completeSVG(s: PlanState): string {
  const styles = `.wall{fill:#62594b}.floor{fill:#f3ecdd;stroke:#a89b85}.support,.segment{fill:#d7cdb7;stroke:#534b3f}.passage{fill:#dbe2c5;stroke:#626a40}.first,.capital{fill:#e1bca7;stroke:#862e24}.dimension line,line{stroke:#514739;stroke-width:1}.dimension text,text{font:15px Georgia,serif;fill:#302a22}.target line,line.target{stroke:#746c5c;stroke-dasharray:5 4}.good line,line.good{stroke:#4d5d30}.good text{fill:#4d5d30}.bad line,line.bad{stroke:#862e24}.bad text{fill:#862e24}.fine{font-size:12px}.selected{fill:#862e24}.alternate{fill:none;stroke:#862e24;stroke-dasharray:2 1}`;
  const w = widthPlate(s).replace(/<svg[^>]*>|<\/svg>/g, ""),
    h = stackPlate(s).replace(/<svg[^>]*>|<\/svg>/g, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1000" viewBox="0 0 1200 1000"><title>Syngraphe selected-clause study</title><desc>Modern diagram of selected IG II² 1668 measurements, not a complete reconstruction. Dimensions in Greek feet. Uniform grid and profiles are modern choices.</desc><style>${styles}</style><rect width="1200" height="1000" fill="#eee7d8"/><text x="50" y="40" style="font-size:25px">A building in the words · IG II² 1668</text><g transform="translate(20 55)">${w}</g><g transform="translate(30 420)">${h}</g><g transform="translate(490 460) scale(.56)">${gridPlate(s, true).replace(/<svg[^>]*>|<\/svg>/g, "")}</g><text x="520" y="700">Width reading: ${esc(s.side)}; first segment: ${s.first} ft</text><text x="520" y="730">Capital: ${feet(s.capital)} ft; end gap: ${feet(s.endGap)} ft</text><text x="520" y="770">Modern uniform spacing; square breadth markers.</text><text x="520" y="800">Source: Choisy, 1884, pp.5–9; IG II² 1668.</text><text x="520" y="830">Source clauses, derived values and choices remain separate.</text><text x="50" y="970">Syngraphe · MIT · Anton Soloviev · https://antonsoo.github.io/syngraphe/</text></svg>`;
}
