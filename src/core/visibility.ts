/** A modern, height-free sightline experiment. All coordinates are eighth-feet.
 * Source dimensions and illustrative choices are documented in docs/visibility.md. */
export const OPENINGS = ["closed", "front", "left", "right", "sides"] as const;
export type Opening = (typeof OPENINGS)[number];
export type Face = "front" | "back" | "left" | "right";
export type ChestId = "wall" | "pillar";
export interface VisibilityState {
  station: number;
  wall: Opening;
  pillar: Opening;
  reading: number;
  page: number;
}
export interface Point {
  x: number;
  y: number;
}
export interface Fraction {
  n: number;
  d: number;
}
export interface Edge {
  a: Point;
  b: Point;
  object: ChestId | "support";
  face: Face;
}
export interface Hit {
  t: Fraction;
  edge: Edge;
}
export interface Sightline {
  id: ChestId;
  target: Point;
  visible: boolean;
  hit: Hit | null;
}

export const visibilityPages = [15, 34, 40, 41] as const;
export const visibilityInitial: VisibilityState = {
  station: 0,
  wall: "front",
  pillar: "front",
  reading: 0,
  page: 41,
};
export const openingNames: Record<Opening, string> = {
  closed: "No opening faces",
  front: "Front only",
  left: "Left side only",
  right: "Right side only",
  sides: "Both sides",
};
export const MODEL_SCOPE =
  "Modern two-dimensional sightline study: one isolated support, two illustrative chests and one sample point per chest. Selected opening faces are held open for this test; the ancient clause concerns which faces can be opened. Seeing the samples does not establish visibility of all equipment or reconstruct the building.";

export const CHESTS = {
  wall: { x: 40, y: 248, w: 32, h: 32, target: { x: 56, y: 264 } },
  pillar: { x: -16, y: 182, w: 32, h: 32, target: { x: 0, y: 198 } },
} as const;
export const SUPPORT = { x: -11, y: 160, w: 22, h: 22 } as const;
export const stations = Array.from({ length: 41 }, (_, i) => i - 20);

function ratio(n: number, d: number): Fraction {
  if (d < 0) {
    n = -n;
    d = -d;
  }
  return { n, d };
}
function before(a: Fraction, b: Fraction): boolean {
  return a.n * b.d < b.n * a.d;
}

export function faces(opening: Opening): readonly Face[] {
  return opening === "sides" ? ["left", "right"] : opening === "closed" ? [] : [opening];
}
function edges(
  rect: { x: number; y: number; w: number; h: number },
  object: Edge["object"],
): Edge[] {
  const { x, y, w, h } = rect;
  return [
    { a: { x, y }, b: { x: x + w, y }, object, face: "front" },
    { a: { x, y: y + h }, b: { x: x + w, y: y + h }, object, face: "back" },
    { a: { x, y }, b: { x, y: y + h }, object, face: "left" },
    { a: { x: x + w, y }, b: { x: x + w, y: y + h }, object, face: "right" },
  ];
}

/** Exact segment/axis-aligned edge intersection. Closed endpoints block too.
 * Collinear rays count their first contact; no floating-point epsilon decides visibility. */
export function intersection(a: Point, b: Point, edge: Edge): Fraction | null {
  const vertical = edge.a.x === edge.b.x;
  const axis = vertical ? "x" : "y",
    other = vertical ? "y" : "x";
  const delta = b[axis] - a[axis];
  const low = Math.min(edge.a[other], edge.b[other]);
  const high = Math.max(edge.a[other], edge.b[other]);
  if (!delta) {
    if (a[axis] !== edge.a[axis]) return null;
    const change = b[other] - a[other];
    if (!change) return a[other] >= low && a[other] <= high ? { n: 0, d: 1 } : null;
    const first = ratio((change > 0 ? low : high) - a[other], change);
    const last = ratio((change > 0 ? high : low) - a[other], change);
    if (last.n < 0 || first.n > first.d) return null;
    return first.n < 0 ? { n: 0, d: 1 } : first;
  }
  const t = ratio(edge.a[axis] - a[axis], delta);
  if (t.n < 0 || t.n > t.d) return null;
  const cross = a[other] * t.d + (b[other] - a[other]) * t.n;
  return cross >= low * t.d && cross <= high * t.d ? t : null;
}

export function observer(station: number): Point {
  return { x: station * 8, y: 80 };
}
export function blockers(state: Pick<VisibilityState, "wall" | "pillar">): Edge[] {
  return [
    ...edges(SUPPORT, "support"),
    ...(["wall", "pillar"] as const).flatMap((id) =>
      edges(CHESTS[id], id).filter((edge) => !faces(state[id]).includes(edge.face)),
    ),
  ];
}
export function sightlines(
  state: Pick<VisibilityState, "station" | "wall" | "pillar">,
): readonly [Sightline, Sightline] {
  const eye = observer(state.station),
    opaque = blockers(state);
  const trace = (id: ChestId): Sightline => {
    const target = CHESTS[id].target;
    let hit: Hit | null = null;
    for (const edge of opaque) {
      const t = intersection(eye, target, edge);
      if (t && (!hit || before(t, hit.t))) hit = { t, edge };
    }
    return { id, target, visible: hit === null, hit };
  };
  return [trace("wall"), trace("pillar")] as const;
}
export function hitPoint(eye: Point, target: Point, hit: Hit | null): Point {
  const t = hit ? hit.t.n / hit.t.d : 1;
  return { x: eye.x + (target.x - eye.x) * t, y: eye.y + (target.y - eye.y) * t };
}
export function route(state: Pick<VisibilityState, "wall" | "pillar">) {
  return stations.map((station) => ({ station, rays: sightlines({ ...state, station }) }));
}
export function clauseMatches(state: Pick<VisibilityState, "wall" | "pillar">) {
  return { wall: state.wall === "front", pillar: state.pillar === "sides" };
}
export function reason(ray: Sightline): string {
  if (!ray.hit) return "Sample point visible through an open face.";
  const object =
    ray.hit.edge.object === "support"
      ? "the support"
      : `${ray.hit.edge.object === "wall" ? "the wall chest" : "the pillar chest"}'s ${ray.hit.edge.face} face`;
  return `Sightline stopped by ${object}.`;
}
export function validVisibility(value: unknown): value is VisibilityState {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const s = value as VisibilityState;
  return (
    Object.keys(s).sort().join(",") === "page,pillar,reading,station,wall" &&
    Number.isInteger(s.station) &&
    s.station >= -20 &&
    s.station <= 20 &&
    OPENINGS.includes(s.wall) &&
    OPENINGS.includes(s.pillar) &&
    Number.isInteger(s.reading) &&
    s.reading >= 0 &&
    s.reading < 5 &&
    visibilityPages.includes(s.page as (typeof visibilityPages)[number])
  );
}
export function visibilityRecord(state: VisibilityState): string {
  if (!validVisibility(state)) throw new Error("Invalid sightline settings.");
  return (
    JSON.stringify(
      { format: "syngraphe-sightline", version: 1, scope: "illustrative-sightlines", state },
      null,
      2,
    ) + "\n"
  );
}
export function importVisibility(text: string): VisibilityState {
  let record: Record<string, unknown>;
  try {
    record = JSON.parse(text);
  } catch {
    throw new Error("This file is not JSON. No settings were changed.");
  }
  if (
    !record ||
    typeof record !== "object" ||
    Array.isArray(record) ||
    Object.keys(record).sort().join(",") !== "format,scope,state,version" ||
    record.format !== "syngraphe-sightline" ||
    record.version !== 1 ||
    record.scope !== "illustrative-sightlines" ||
    !validVisibility(record.state)
  )
    throw new Error("Choose a version 1 Syngraphe sightline record. No settings were changed.");
  return { ...record.state };
}
export function visibilityURL(state: VisibilityState, base: string): string {
  if (!validVisibility(state)) throw new Error("Invalid sightline settings.");
  const url = new URL(base);
  url.search = "";
  url.hash = "sightline";
  for (const [key, value] of Object.entries(state)) url.searchParams.set(key, String(value));
  return url.href;
}
export function readVisibilityURL(base: string): { state: VisibilityState; warning: string } {
  const q = new URL(base).searchParams;
  const state: Record<string, unknown> = { ...visibilityInitial };
  for (const [key, value] of q) {
    if (
      !Object.hasOwn(visibilityInitial, key) ||
      q.getAll(key).length !== 1 ||
      (!["wall", "pillar"].includes(key) && !/^-?\d+$/.test(value))
    )
      return {
        state: { ...visibilityInitial },
        warning: "This link has invalid or duplicate settings. The opening experiment is shown.",
      };
    state[key] = ["wall", "pillar"].includes(key) ? value : Number(value);
  }
  return validVisibility(state)
    ? { state, warning: "" }
    : {
        state: { ...visibilityInitial },
        warning:
          "This link is outside the sightline study's limits. The opening experiment is shown.",
      };
}
export function visibilityCSV(state: VisibilityState): string {
  if (!validVisibility(state)) throw new Error("Invalid sightline settings.");
  const quote = (v: unknown) => `"${String(v).replaceAll('"', '""')}"`;
  const rows: unknown[][] = [
    [
      "scope",
      "wall_opening",
      "pillar_opening",
      "station_ft",
      "sample",
      "visible",
      "first_obstruction",
      "closed_face",
      "wall_clause_matches",
      "pillar_clause_matches",
    ],
  ];
  const matches = clauseMatches(state);
  for (const step of route(state))
    for (const ray of step.rays)
      rows.push([
        "illustrative-sightlines",
        state.wall,
        state.pillar,
        step.station,
        ray.id,
        ray.visible,
        ray.hit?.edge.object ?? "",
        ray.hit?.edge.face ?? "",
        matches.wall,
        matches.pillar,
      ]);
  return rows.map((row) => row.map(quote).join(",")).join("\r\n") + "\r\n";
}
