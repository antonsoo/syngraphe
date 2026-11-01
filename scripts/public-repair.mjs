// Canonical public worker exercise. Cache faults are injected only in this browser.
import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox } from "playwright";
import { publicTransport } from "./public-transport.mjs";

const base = process.argv[2];
assert(base && new URL(base).protocol === "https:", "Supply the canonical HTTPS lesson base.");
const output = path.resolve(process.argv[3] ?? "test-results/public-repair");
await mkdir(output, { recursive: true });
const results = [];
async function status(page, re) {
  await page.waitForFunction(
    (pattern) =>
      new RegExp(pattern).test(document.querySelector("#offline-status")?.textContent ?? ""),
    re.source,
    { timeout: 35000 },
  );
}
for (const [engine, api] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const transport = await publicTransport(base);
  const browser = await api.launch({ proxy: transport.proxy }),
    context = await browser.newContext({
      viewport: { width: 375, height: 1000 },
      acceptDownloads: true,
    });
  try {
    const page = await context.newPage();
    await page.goto(new URL("seeing.html", base).href);
    await status(page, /^Edition ready offline/);
    await page.locator("#stated-faces").click();
    await page.locator('[data-station="20"]').click();
    const selected = await page.locator("#sightline-status").textContent();
    await page.evaluate(async () => {
      const key = (await caches.keys()).find((k) => k.startsWith("syngraphe-"));
      await (await caches.open(key)).delete(new URL("sources/choisy-040.jpg", location.href));
    });
    await page.locator("#offline-check").click();
    await status(page, /^Offline copy is incomplete/);
    transport.cut();
    const outage = await transport.proveUnavailable(browser);
    await page.locator("#offline-check").click();
    await status(page, /^The offline copy could not be repaired/);
    assert.equal(await page.locator("#sightline-status").textContent(), selected);
    transport.restore();
    await page.waitForFunction(() => !document.querySelector("#offline-check").disabled);
    await page.locator("#offline-check").click();
    await status(page, /^Edition ready offline/);
    assert.equal(await page.locator("#sightline-status").textContent(), selected);
    await page.evaluate(async () => {
      const key = (await caches.keys()).find((k) => k.startsWith("syngraphe-"));
      const other = await caches.match(new URL("sources/choisy-034.jpg", location.href), {
        cacheName: key,
      });
      await (await caches.open(key)).put(new URL("sources/choisy-040.jpg", location.href), other);
    });
    await page.locator("#offline-check").click();
    await status(page, /^Offline copy is incomplete/);
    await page.locator("#offline-check").click();
    await status(page, /^Edition ready offline/);
    await page.evaluate(async () => {
      for (const key of await caches.keys())
        if (key.startsWith("syngraphe-")) await caches.delete(key);
    });
    await page.locator("#offline-check").click();
    await status(page, /^Offline copy is incomplete/);
    assert.deepEqual(await page.evaluate(() => caches.keys()), []);
    await page.locator("#offline-check").click();
    await status(page, /^Edition ready offline/);
    const inventory = await page.evaluate(async () => {
      const key = (await caches.keys()).find((k) => k.startsWith("syngraphe-"));
      return {
        key,
        files: (await (await caches.open(key)).keys()).map((r) => new URL(r.url).pathname).sort(),
      };
    });
    assert.equal(inventory.files.length, 25);
    transport.cut();
    await transport.proveUnavailable(browser);
    await page.reload();
    await status(page, /^Edition ready offline/);
    await page.locator("#stated-faces").click();
    await page.locator('[data-station="20"]').click();
    const downloading = page.waitForEvent("download");
    await page.locator("#save-reading").click();
    const file = path.join(output, `${engine}-repaired.html`),
      download = await downloading;
    await download.saveAs(file);
    assert.equal(await download.failure(), null);
    assert((await readFile(file, "utf8")).includes("data:image/jpeg;base64,"));
    await page.locator("#retain").scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, `${engine}-offline.png`) });
    results.push({
      engine,
      browserVersion: browser.version(),
      currentInventory: inventory,
      outage,
      missingPageDetected: true,
      offlineRepairFailureKeepsSettings: true,
      actualNetworkRepairKeepsSettings: true,
      cachedWrongPageDetectedAndRepaired: true,
      fullEvictionAndRepair: true,
      inspectionDoesNotRecreateCache: true,
      offlineReloadAndPortableDownloadAfterRepair: true,
    });
    console.log(
      `${engine}: canonical network repair, injected missing/wrong/evicted bytes, settings preserved, offline reload/download`,
    );
  } finally {
    await context.close();
    await browser.close();
    await transport.close();
  }
}
await writeFile(
  path.join(output, "repair.json"),
  `${JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      base,
      boundary:
        "Canonical public edition; browser-local Cache Storage faults; real network repair; unchanged TLS CONNECT tunnels closed and new connections refused; independent fresh worker-free navigation fails",
      results,
    },
    null,
    2,
  )}\n`,
);
