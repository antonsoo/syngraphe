import assert from "node:assert/strict";
import { test } from "node:test";
import {
  feet,
  fromURL,
  grid,
  heightAccount,
  importPlan,
  initial,
  ledgerCSV,
  planRecord,
  stateURL,
  validState,
  widthAccount,
} from "../src/core/model";

test("inclusive phrase, not the clear span, closes the width account", () => {
  assert.deepEqual(widthAccount(initial), {
    clear: 240,
    side: 284,
    total: 968,
    excess: 88,
    matches: false,
  });
  assert.deepEqual(widthAccount({ ...initial, side: "inclusive" }), {
    clear: 196,
    side: 240,
    total: 880,
    excess: 0,
    matches: true,
  });
});
test("a matching total can contradict the exceptional segment", () => {
  const wrong = heightAccount({ ...initial, capital: 32 });
  assert(wrong.matches);
  assert(!wrong.firstMatches);
  const good = heightAccount({ ...initial, first: 5, capital: 16 });
  assert(good.matches && good.firstMatches);
  assert.equal(good.shaft, 464);
  assert.equal(good.inferredCapital, 16);
});
test("different modern grids meet selected count and endpoint constraints", () => {
  const a = grid(80),
    b = grid(112);
  assert.notDeepEqual(a.centers, b.centers);
  assert.equal(a.centers.length, 35);
  assert.equal(b.centers.length, 35);
  assert.equal(feet(a.spacing), "11 33/136");
  assert.equal(feet(b.spacing), "11⅛");
  for (const n of [63, 193, 80.1, NaN, Infinity]) assert.throws(() => grid(n));
});
test("native settings roundtrip and malformed records fail atomically", () => {
  const s = {
    ...initial,
    side: "inclusive" as const,
    first: 5 as const,
    endGap: 97,
    page: 75,
    pillar: 35,
  };
  assert.deepEqual(importPlan(planRecord(s)), s);
  for (const changes of [
    { side: "other" },
    { first: 7 },
    { capital: -1 },
    { capital: 0.5 },
    { endGap: 193 },
    { pillar: 36 },
    { reading: 8 },
    { page: 32 },
    { unknown: 1 },
  ]) {
    assert.throws(() =>
      importPlan(
        JSON.stringify({
          format: "syngraphe-plan",
          version: 1,
          scope: "selected-clauses",
          state: { ...initial, ...changes },
        }),
      ),
    );
  }
  for (const value of [null, [], {}, "bad"]) assert(!validState(value));
  assert.throws(() => importPlan('{"format":"other"}'));
});
test("URL state is exact, duplicate and unknown parameters do not partly apply", () => {
  const s = { ...initial, endGap: 83, capital: 1, pillar: 35 };
  assert.deepEqual(fromURL(stateURL(s, "https://example.test/syngraphe/")).state, s);
  for (const q of [
    "side=inclusive&first=4&first=5",
    "capital=1.5",
    "endGap=2e2",
    "unknown=1",
    "__proto__=1",
    "pillar=0",
  ]) {
    const result = fromURL(`https://example.test/?${q}`);
    assert.deepEqual(result.state, initial);
    assert(result.warning);
  }
});
test("CSV includes state and exact dimensional meaning on every row", () => {
  const csv = ledgerCSV({ ...initial, endGap: 83 });
  assert(csv.includes('"selected-clauses","clear","4","16","83"'));
  assert(csv.includes('"uniform_grid_spacing"'));
  assert(csv.includes('"support_35_center_from_outer_end"'));
  assert.equal(csv.trim().split("\r\n").length, 45);
});
test("mixed feet remain exact with singular and negative values", () => {
  assert.equal(feet(196), "12¼");
  assert.equal(feet(-88), "−5½");
  assert.equal(feet({ n: 9, d: 17 }), "9/272");
});
