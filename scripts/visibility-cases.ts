import { OPENINGS, route, visibilityInitial } from "../src/core/visibility";

for (const wall of OPENINGS)
  for (const pillar of OPENINGS) {
    for (const step of route({ ...visibilityInitial, wall, pillar })) {
      process.stdout.write(`${JSON.stringify({ wall, pillar, ...step })}\n`);
    }
  }
