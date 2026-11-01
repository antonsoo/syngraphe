import {
  CHESTS,
  faces,
  hitPoint,
  observer,
  reason,
  route,
  SUPPORT,
  sightlines,
  type VisibilityState,
} from "./core/visibility";
import { esc } from "./escape";

const X = (x: number) => 64 + (x / 8 + 22) * 16;
const Y = (y: number) => 54 + (37.5 - y / 8) * 16;
const point = (p: { x: number; y: number }) => `${X(p.x).toFixed(3)} ${Y(p.y).toFixed(3)}`;

export function visibilitySVG(state: VisibilityState, standalone = false): string {
  const eye = observer(state.station),
    rays = sightlines(state);
  const label = `Modern sightline study at station ${state.station} feet. Wall chest: ${reason(rays[0])} Pillar chest: ${reason(rays[1])}`;
  const chest = (id: "wall" | "pillar") => {
    const r = CHESTS[id],
      open = faces(state[id]);
    const paths = [
      ["front", { x: r.x, y: r.y }, { x: r.x + r.w, y: r.y }],
      ["back", { x: r.x, y: r.y + r.h }, { x: r.x + r.w, y: r.y + r.h }],
      ["left", { x: r.x, y: r.y }, { x: r.x, y: r.y + r.h }],
      ["right", { x: r.x + r.w, y: r.y }, { x: r.x + r.w, y: r.y + r.h }],
    ] as const;
    return `<rect x="${X(r.x)}" y="${Y(r.y + r.h)}" width="${r.w * 2}" height="${r.h * 2}" fill="#f6f0e4"/>${paths.map(([face, a, b]) => `<path class="${open.includes(face) ? "opening" : "panel"}" d="M${point(a)} L${point(b)}"/>`).join("")}`;
  };
  return `<svg ${standalone ? 'xmlns="http://www.w3.org/2000/svg"' : ""} viewBox="0 0 850 740" role="img" aria-label="${esc(label)}"><title>Seeing while passing: a modern sightline study</title><desc>${esc(label)}. Two four-foot square chests and the sample points are illustrative. Chosen opening faces are held open in this test. The clause specifies which faces can open, not that panels stay open permanently. Closed corner contact blocks. Neighbouring bays and vertical geometry are omitted. Based on selected IG II² 1668 opening-face clauses, Choisy 1884 p.13; this geometry is modern.</desc><metadata>Syngraphe. New diagram: Anthony Mercer, 2026. MIT. Historical text: public domain.</metadata><style>
text{font-family:Georgia,serif;fill:#302a22;font-size:19px}.v-small{font-size:15px}.v-note{font-size:17px}.panel{stroke:#302a22;stroke-width:4;fill:none}.opening{stroke:#4d5d30;stroke-width:3;stroke-dasharray:5 5;fill:none}.v-ray{stroke-width:3;fill:none}.v-guide{stroke:#862e24;stroke-width:1.5;stroke-dasharray:4 6;fill:none}.v-view{fill:#244b75}.v-route{stroke:#244b75;stroke-width:2}.v-good{stroke:#4d5d30;fill:#4d5d30}.v-bad{stroke:#862e24;fill:#862e24}
</style><rect width="850" height="740" fill="#f6f0e4"/>
<text x="32" y="29" class="v-small">Local study from above / chest sizes and positions chosen</text>
<rect x="64" y="54" width="704" height="40" fill="#62594b"/><text x="82" y="80" fill="#f6f0e4" style="fill:#f6f0e4" class="v-small">Wall / upper-body width 2½ ft</text>
<rect x="64" y="94" width="704" height="240" fill="#e8dfca"/>
<rect x="64" y="334" width="704" height="320" fill="#dbe2c5"/>
<path d="M64 334 H768" stroke="#8d7e65" stroke-dasharray="4 5"/>
<text x="84" y="374">Passage</text><text x="84" y="399" class="v-small">20 ft clear across</text>
${chest("wall")}${chest("pillar")}
<rect x="${X(SUPPORT.x)}" y="${Y(SUPPORT.y + SUPPORT.h)}" width="44" height="44" fill="#62594b" stroke="#302a22" stroke-width="2"/>
<path d="M${X(-11)} ${Y(160)} L${X(11)} ${Y(182)} M${X(-11)} ${Y(182)} L${X(11)} ${Y(160)}" stroke="#b8aa91"/>
<text x="${X(9 * 8) + 17}" y="${Y(33 * 8) - 6}">A / wall chest</text><text x="${X(9 * 8) + 17}" y="${Y(33 * 8) + 19}" class="v-small">Front faces the passage</text>
<text x="84" y="${Y(24.75 * 8) - 8}">B / pillar chest</text>
<text x="84" y="${Y(24.75 * 8) + 16}" class="v-small">Sides face left and right</text>
<text x="84" y="${Y(171) + 5}" class="v-small">Isolated support / 2¾ ft</text>
${rays
  .map((ray) => {
    const stop = hitPoint(eye, ray.target, ray.hit),
      cls = ray.visible ? "v-good" : "v-bad";
    return `${ray.hit ? `<path class="v-guide" d="M${point(eye)} L${point(ray.target)}"/>` : ""}<path class="v-ray ${cls}" d="M${point(eye)} L${point(stop)}"/>${ray.hit ? `<circle cx="${X(stop.x)}" cy="${Y(stop.y)}" r="6" class="v-bad"/>` : ""}<circle cx="${X(ray.target.x)}" cy="${Y(ray.target.y)}" r="10" fill="#f6f0e4" stroke="${ray.visible ? "#4d5d30" : "#862e24"}" stroke-width="2"/><text x="${X(ray.target.x)}" y="${Y(ray.target.y) + 5}" text-anchor="middle" class="v-small">${ray.id === "wall" ? "A" : "B"}</text>`;
  })
  .join("")}
<path class="v-route" d="M${X(-160)} ${Y(80)} H${X(160)}"/>
${[-20, -10, 0, 10, 20].map((n) => `<path d="M${X(n * 8)} ${Y(80) - 5} v10" stroke="#244b75"/><text x="${X(n * 8)}" y="${Y(80) + 32}" text-anchor="middle" class="v-small">${n} ft</text>`).join("")}
<circle cx="${X(eye.x)}" cy="${Y(eye.y)}" r="11" class="v-view"/><circle cx="${X(eye.x)}" cy="${Y(eye.y)}" r="4" fill="#f6f0e4"/>
<text x="416" y="${Y(80) + 69}" text-anchor="middle" style="fill:#244b75">Viewer / ${state.station === 0 ? "opposite the support" : `${Math.abs(state.station)} ft ${state.station < 0 ? "left" : "right"} of the support`}</text>
<text x="32" y="696" class="v-note">Solid ray: visible path or first obstruction. Dots: blocked continuation.</text>
<text x="32" y="721" class="v-small">Two sample points are not all the equipment. No height or lighting is modelled.</text></svg>`;
}

export function routeStrip(state: VisibilityState): string {
  const rows = route(state);
  return (["wall", "pillar"] as const)
    .map(
      (id, i) =>
        `<div class="route-row"><span>${id === "wall" ? "A" : "B"}</span><div class="route-cells" aria-hidden="true">${rows.map((row) => `<i class="${row.rays[i]?.visible ? "seen" : "unseen"}${row.station === state.station ? " here" : ""}"></i>`).join("")}</div><span>${rows.filter((row) => row.rays[i]?.visible).length}/41</span></div>`,
    )
    .join("");
}
