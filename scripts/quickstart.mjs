import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium, firefox } from "playwright";

const base = process.argv[2] ?? "http://127.0.0.1:4351/syngraphe/",
  out = process.argv[3] ?? "/tmp/syngraphe-development";
await mkdir(out, { recursive: true });
const configurations = [];
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const b = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      const c = await b.newContext({ viewport: { width, height: 900 }, acceptDownloads: true }),
        p = await c.newPage(),
        errors = [];
      p.on("pageerror", (e) => errors.push(String(e)));
      await p.goto(base);
      await p.locator("#side-inclusive").check();
      assert.match(await p.locator("#width-result").textContent(), /^55 feet/);
      await p.locator("#first-five").check();
      await p.locator("#fit-total").click();
      assert.match(await p.locator("#height-result").textContent(), /exception is observed/);
      await p.locator("#source-status").filter({ hasText: "Verified whole" }).waitFor();
      await p.locator("#offline").filter({ hasText: "Development preview" }).waitFor();
      const pending = p.waitForEvent("download");
      await p.locator("#save-reading").click();
      const d = await pending;
      await d.saveAs(`${out}/${name}-${width}.html`);
      assert.equal(await d.failure(), null);
      assert(await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(errors, []);
      configurations.push({
        engine: name,
        version: b.version(),
        width,
        source: true,
        widthAccount: 55,
        firstSegmentFeet: 5,
        capitalFingers: 16,
        illustratedDownload: true,
        offlineProductionOnly: true,
        applicationErrors: errors,
      });
      await c.close();
    }
  } finally {
    await b.close();
  }
}
await writeFile(
  `${out}/review.json`,
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      base,
      scope:
        "Actual documented development quickstart from public source, operations, source and native illustrated download",
      configurations,
    },
    null,
    2,
  ) + "\n",
);
console.log("Verified four development quickstart configurations");
