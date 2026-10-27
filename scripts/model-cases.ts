import { grid, heightAccount, initial, widthAccount } from "../src/core/model";

const widths = (["clear", "inclusive"] as const).map((side) => ({
  side,
  account: widthAccount({ ...initial, side }),
}));
const heights = [];
for (const first of [4, 5] as const)
  for (let capital = 0; capital <= 64; capital++)
    heights.push({ first, capital, account: heightAccount({ ...initial, first, capital }) });
const grids = [];
for (let gap = 64; gap <= 192; gap++) grids.push({ gap, account: grid(gap) });
process.stdout.write(JSON.stringify({ widths, heights, grids }));
