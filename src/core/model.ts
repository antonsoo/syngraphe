/** All source dimensions are integer fingers: 16 fingers = 4 palms = 1 foot. */
export const DIM = Object.freeze({
  foot: 16,
  palm: 4,
  halfFoot: 8,
  width: 55 * 16,
  length: 400 * 16,
  wall: 5 * 8,
  sideInclusive: 15 * 16,
  pillar: 2 * 16 + 3 * 4,
  passage: 20 * 16,
  count: 35,
  height: 30 * 16,
  segments: 7,
  ordinarySegment: 4 * 16,
  firstSegment: 5 * 16,
});
export interface Fraction {
  n: number;
  d: number;
}
function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}
export function fraction(n: number, d = 1): Fraction {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d) || d === 0)
    throw new Error("Fraction requires safe whole numbers and a nonzero denominator.");
  if (d < 0) return fraction(-n, -d);
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}
export function plus(a: Fraction, b: Fraction): Fraction {
  return fraction(a.n * b.d + b.n * a.d, a.d * b.d);
}
export function times(a: Fraction, k: number): Fraction {
  return fraction(a.n * k, a.d);
}
export function numeric(a: Fraction): number {
  return a.n / a.d;
}
export function ratioText(a: Fraction): string {
  return a.d === 1 ? String(a.n) : `${a.n}/${a.d}`;
}
export function feet(digits: Fraction | number): string {
  const f = typeof digits === "number" ? fraction(digits, 16) : fraction(digits.n, digits.d * 16);
  const sign = f.n < 0 ? "−" : "",
    n = Math.abs(f.n),
    whole = Math.floor(n / f.d),
    remainder = n % f.d;
  if (!remainder) return sign + whole;
  const r = fraction(remainder, f.d);
  const small: Record<string, string> = {
    "1/2": "½",
    "1/4": "¼",
    "3/4": "¾",
    "1/8": "⅛",
    "3/8": "⅜",
    "5/8": "⅝",
    "7/8": "⅞",
  };
  const text = small[ratioText(r)] ?? ratioText(r);
  return sign + (whole ? `${whole}${small[ratioText(r)] ? "" : " "}` : "") + text;
}
export interface PlanState {
  side: "clear" | "inclusive";
  first: 4 | 5;
  capital: number;
  endGap: number;
  pillar: number;
  reading: number;
  page: number;
}
export const initial: PlanState = {
  side: "clear",
  first: 4,
  capital: 16,
  endGap: 80,
  pillar: 1,
  reading: 1,
  page: 34,
};
export function validState(v: unknown): v is PlanState {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const s = v as Record<string, unknown>;
  const keys = ["side", "first", "capital", "endGap", "pillar", "reading", "page"];
  if (Object.keys(s).length !== keys.length || !keys.every((k) => Object.hasOwn(s, k)))
    return false;
  const integer = (key: string, min: number, max: number) =>
    typeof s[key] === "number" &&
    Number.isInteger(s[key]) &&
    Number(s[key]) >= min &&
    Number(s[key]) <= max;
  return (
    (s.side === "clear" || s.side === "inclusive") &&
    (s.first === 4 || s.first === 5) &&
    integer("capital", 0, 64) &&
    integer("endGap", 64, 192) &&
    integer("pillar", 1, 35) &&
    integer("reading", 0, 7) &&
    typeof s.page === "number" &&
    [15, 33, 34, 35, 36, 37, 46, 47, 73, 75].includes(s.page)
  );
}
export function widthAccount(state: PlanState) {
  const clear = state.side === "inclusive" ? DIM.sideInclusive - DIM.pillar : DIM.sideInclusive;
  const side = clear + DIM.pillar;
  const total = 2 * DIM.wall + 2 * side + DIM.passage;
  return { clear, side, total, excess: total - DIM.width, matches: total === DIM.width };
}
export function heightAccount(state: PlanState) {
  const shaft = state.first * 16 + (DIM.segments - 1) * DIM.ordinarySegment;
  const total = shaft + state.capital;
  const inferredCapital = DIM.height - shaft;
  return {
    shaft,
    total,
    inferredCapital,
    excess: total - DIM.height,
    matches: total === DIM.height,
    firstMatches: state.first * 16 === DIM.firstSegment,
  };
}
export function grid(endGap: number) {
  if (!Number.isInteger(endGap) || endGap < 64 || endGap > 192)
    throw new Error("End gap must be 64–192 whole fingers.");
  const span = DIM.length - 2 * DIM.wall - 2 * endGap - DIM.pillar;
  const spacing = fraction(span, DIM.count - 1);
  const first = fraction(2 * (DIM.wall + endGap) + DIM.pillar, 2);
  const centers = Array.from({ length: DIM.count }, (_, i) => plus(first, times(spacing, i)));
  const clearBay = plus(spacing, fraction(-DIM.pillar));
  const last = centers.at(-1);
  if (!last) throw new Error("Missing last support.");
  return { spacing, clearBay, first, last, centers };
}
export function importPlan(text: string): PlanState {
  const input: unknown = JSON.parse(text);
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("A Syngraphe plan record is required.");
  const o = input as Record<string, unknown>;
  if (
    Object.keys(o).sort().join(",") !== "format,scope,state,version" ||
    o.format !== "syngraphe-plan" ||
    o.version !== 1 ||
    o.scope !== "selected-clauses" ||
    !validState(o.state)
  )
    throw new Error(
      "This is not a valid version 1 selected-clause plan. No settings were changed.",
    );
  return { ...o.state };
}
export function planRecord(state: PlanState): string {
  if (!validState(state)) throw new Error("Invalid plan settings.");
  return (
    JSON.stringify(
      { format: "syngraphe-plan", version: 1, scope: "selected-clauses", state },
      null,
      2,
    ) + "\n"
  );
}
export function stateURL(state: PlanState, url: string): string {
  const u = new URL(url);
  u.search = "";
  for (const [key, value] of Object.entries(state)) u.searchParams.set(key, String(value));
  return u.href;
}
export function fromURL(url: string): { state: PlanState; warning: string } {
  const u = new URL(url),
    q = u.searchParams;
  if (![...q.keys()].length) return { state: { ...initial }, warning: "" };
  const state: Record<string, unknown> = { ...initial };
  for (const [key, value] of q) {
    if (
      !Object.hasOwn(initial, key) ||
      q.getAll(key).length !== 1 ||
      (key !== "side" && !/^\d+$/.test(value))
    )
      return {
        state: { ...initial },
        warning: "This link has invalid or duplicate settings. The opening experiment is shown.",
      };
    state[key] = key === "side" ? value : Number(value);
  }
  return validState(state)
    ? { state, warning: "" }
    : {
        state: { ...initial },
        warning: "This link is outside the workshop limits. The opening experiment is shown.",
      };
}
export function ledgerCSV(state: PlanState): string {
  const w = widthAccount(state),
    h = heightAccount(state),
    g = grid(state.endGap);
  const rows: (string | number)[][] = [
    [
      "scope",
      "side_reading",
      "first_segment_ft",
      "capital_fingers",
      "end_gap_fingers",
      "item",
      "value_fingers_numerator",
      "value_fingers_denominator",
      "evidence",
    ],
  ];
  const row = (item: string, value: Fraction | number, evidence: string) => {
    const f = typeof value === "number" ? fraction(value) : value;
    rows.push([
      "selected-clauses",
      state.side,
      state.first,
      state.capital,
      state.endGap,
      item,
      f.n,
      f.d,
      evidence,
    ]);
  };
  row("outer_width_model", w.total, "derived from selected reading and schematic profile");
  row("outer_width_prescribed", DIM.width, "IG II² 1668 lines 6–7");
  row("side_clear_model", w.clear, "derived; upper wall body and base support breadth");
  row("shaft_height_model", h.shaft, "derived from segment choice");
  row("total_height_model", h.total, "derived including chosen capital");
  row("total_height_prescribed", DIM.height, "IG II² 1668 lines 42–44");
  row("capital_height_inferred", h.inferredCapital, "derived, not separately prescribed");
  row("uniform_grid_spacing", g.spacing, "modern uniform-grid assumption");
  row("uniform_grid_clear_bay", g.clearBay, "modern uniform-grid assumption");
  for (const [i, c] of g.centers.entries()) {
    row(
      `support_${i + 1}_center_from_outer_end`,
      c,
      "modern uniform-grid assumption; 35 supports per row",
    );
  }
  const quote = (v: string | number) => `"${String(v).replaceAll('"', '""')}"`;
  return rows.map((r) => r.map(quote).join(",")).join("\r\n") + "\r\n";
}
