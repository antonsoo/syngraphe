import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clauseMatches,
  importVisibility,
  intersection,
  readVisibilityURL,
  route,
  sightlines,
  visibilityCSV,
  visibilityInitial,
  visibilityRecord,
  visibilityURL,
} from "../src/core/visibility";

test("a visible sample does not establish agreement with the source faces", () => {
  const steps = route(visibilityInitial);
  assert.deepEqual(
    [0, 1].map((i) => steps.filter((s) => s.rays[i]?.visible).length),
    [23, 8],
  );
  assert.deepEqual(clauseMatches(visibilityInitial), { wall: true, pillar: false });
  const prescribed = { ...visibilityInitial, pillar: "sides" as const };
  assert.deepEqual(clauseMatches(prescribed), { wall: true, pillar: true });
  assert.equal(sightlines(prescribed)[1].hit?.edge.object, "support");
  assert.equal(sightlines({ ...prescribed, station: -20 })[1].visible, true);
  assert.equal(sightlines({ ...prescribed, station: 20 })[1].visible, true);
  assert.equal(sightlines({ ...prescribed, pillar: "left", station: 20 })[1].visible, false);
  assert.equal(sightlines({ ...prescribed, pillar: "right", station: -20 })[1].visible, false);
});

test("closed corners, parallel misses and collinear contacts have explicit outcomes", () => {
  const edge = {
    a: { x: 2, y: 0 },
    b: { x: 2, y: 4 },
    object: "wall" as const,
    face: "left" as const,
  };
  assert.deepEqual(intersection({ x: 0, y: 0 }, { x: 4, y: 8 }, edge), { n: 2, d: 4 });
  assert.equal(intersection({ x: 0, y: 0 }, { x: 1, y: 4 }, edge), null);
  assert.equal(intersection({ x: 1, y: 0 }, { x: 1, y: 4 }, edge), null);
  assert.deepEqual(intersection({ x: 2, y: -2 }, { x: 2, y: 6 }, edge), { n: 2, d: 8 });
  assert.deepEqual(intersection({ x: 2, y: 2 }, { x: 2, y: 6 }, edge), { n: 0, d: 1 });
});

test("records and shared URLs retain the experiment and reject unrelated or malformed settings", () => {
  const s = { ...visibilityInitial, station: -19, pillar: "right" as const, reading: 4, page: 40 };
  assert.deepEqual(importVisibility(visibilityRecord(s)), s);
  assert.deepEqual(
    readVisibilityURL(visibilityURL(s, "https://example.org/syngraphe/seeing.html")).state,
    s,
  );
  for (const text of [
    "null",
    "[]",
    "{}",
    "{bad",
    visibilityRecord(s).replace('"station": -19', '"station": -19.5'),
    visibilityRecord(s).replace('"version": 1', '"version": 2'),
  ])
    assert.throws(() => importVisibility(text));
  for (const query of [
    "station=21",
    "station=1&station=2",
    "station=2e0",
    "wall=side",
    "page=37",
    "other=front",
  ]) {
    const p = readVisibilityURL(`https://example.org/seeing.html?${query}`);
    assert(p.warning);
    assert.deepEqual(p.state, visibilityInitial);
  }
  const rows = visibilityCSV(s).trim().split("\r\n");
  assert.equal(rows.length, 83);
  assert(rows[1]?.includes('"-20","wall"'));
  assert(rows[82]?.includes('"20","pillar"'));
});
