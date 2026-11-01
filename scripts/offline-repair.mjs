// Exercise retained bytes and real worker repair, without intercepting fetch in the page.
import assert from "node:assert/strict";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox } from "playwright";
import { serve } from "./seeing-server.mjs";

const output = path.resolve(process.argv[2] ?? "test-results/offline-repair");
await mkdir(output, { recursive: true });
const wrong = path.join(output, "substituted-build");
await cp("dist", wrong, { recursive: true });
await cp("public/sources/choisy-034.jpg", path.join(wrong, "sources/choisy-040.jpg"));
const empty = path.join(output, "empty");
await mkdir(empty, { recursive: true });
const results = [];
async function contains(page, id, re) {
  await page.waitForFunction(
    ({ id, pattern }) => new RegExp(pattern).test(document.querySelector(id)?.textContent ?? ""),
    { id, pattern: re.source },
    { timeout: 35000 },
  );
}
async function cache(page, operation) {
  return page.evaluate(async (operation) => {
    const key = (await caches.keys()).find((k) => k.startsWith("syngraphe-"));
    const file = new URL("sources/choisy-040.jpg", location.href);
    if (operation === "delete") await (await caches.open(key)).delete(file);
    if (operation === "poison") {
      const other = await caches.match(new URL("sources/choisy-034.jpg", location.href), {
        cacheName: key,
      });
      await (await caches.open(key)).put(file, other);
    }
    if (operation === "delete-all") await caches.delete(key);
    return { key, present: Boolean(await caches.match(file, { cacheName: key })) };
  }, operation);
}
for (const [engine, api] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await api.launch(),
    server = await serve();
  const context = await browser.newContext({
    viewport: { width: 375, height: 900 },
    acceptDownloads: true,
  });
  try {
    const page = await context.newPage();
    await page.goto(server.base + "seeing.html");
    await contains(page, "#offline-status", /^Edition ready offline/);
    await page.locator("#stated-faces").click();
    await page.locator('[data-station="20"]').click();
    const before = await page.locator("#sightline-status").textContent();
    await cache(page, "delete");
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));
    await contains(page, "#offline-status", /^Offline copy is incomplete/);
    assert.equal(await page.locator("#offline-check").textContent(), "Save offline copy again");
    server.use(empty);
    await page.locator("#offline-check").click();
    await contains(page, "#offline-status", /^The offline copy could not be repaired/);
    assert.equal((await cache(page)).present, false);
    server.use(wrong);
    await page.locator("#offline-check").click();
    await contains(page, "#offline-status", /^The offline copy could not be repaired/);
    assert.equal((await cache(page)).present, false);
    server.use("dist");
    await page.locator("#offline-check").click();
    await contains(page, "#offline-status", /^Edition ready offline/);
    assert.equal(await page.locator("#sightline-status").textContent(), before);
    assert.equal(await page.locator("#station").inputValue(), "20");
    // Presence with authentic bytes from the wrong page must not establish readiness.
    await cache(page, "poison");
    await page.locator("#offline-check").click();
    await contains(page, "#offline-status", /^Offline copy is incomplete/);
    await page.locator("#offline-check").click();
    await contains(page, "#offline-status", /^Edition ready offline/);
    // Cache Storage can evict the entire named cache; checking must not recreate it.
    await cache(page, "delete-all");
    await page.locator("#offline-check").click();
    await contains(page, "#offline-status", /^Offline copy is incomplete/);
    assert.deepEqual(await page.evaluate(() => caches.keys()), []);
    await page.locator("#offline-check").click();
    await contains(page, "#offline-status", /^Edition ready offline/);
    const measurement = await context.newPage();
    await measurement.goto(server.base);
    await contains(measurement, "#offline", /^Edition ready offline/);
    await measurement.locator("#end-gap").fill("83");
    await measurement.locator("#end-gap").press("Tab");
    const measured = await measurement.locator("#grid-description").textContent();
    await cache(page, "delete");
    await Promise.all(
      [page, measurement].map(async (p) => {
        await p.evaluate(() => window.dispatchEvent(new Event("focus")));
        await contains(
          p,
          p === page ? "#offline-status" : "#offline",
          /^Offline copy is incomplete/,
        );
      }),
    );
    await Promise.all([page, measurement].map((p) => p.locator("#offline-check").click()));
    await contains(page, "#offline-status", /^Edition ready offline/);
    await contains(measurement, "#offline", /^Edition ready offline/);
    assert.equal(await measurement.locator("#grid-description").textContent(), measured);
    assert.equal(await measurement.locator("#end-gap").inputValue(), "83");
    await page.locator("#retain").scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(output, engine + "-repair.png") });
    server.use(empty);
    const fallback = await page.reload();
    assert.equal(fallback.status(), 200);
    await contains(page, "#offline-status", /^Edition ready offline/);
    await contains(page, "#source-status", /^Verified whole/);
    const unknown = await context.newPage();
    assert.equal(
      (await unknown.goto(`${server.base}not-a-room.html`, { waitUntil: "commit" })).status(),
      404,
    );
    await unknown.close();
    await server.stop();
    await page.reload();
    await contains(page, "#offline-status", /^Edition ready offline/);
    await contains(page, "#source-status", /^Verified whole/);
    const downloading = page.waitForEvent("download");
    await page.locator("#save-reading").click();
    const file = path.join(output, engine + "-repaired-reading.html");
    await (await downloading).saveAs(file);
    assert((await readFile(file, "utf8")).includes("data:image/jpeg;base64,"));
    await measurement.reload();
    await contains(measurement, "#offline", /^Edition ready offline/);
    results.push({
      engine,
      browserVersion: browser.version(),
      missingFileRecheckedOnFocus: true,
      failedRepairPreservesIncompleteState: true,
      http200SubstitutionRefusedDuringRepair: true,
      repairPreservesSightlineSettings: true,
      wrongCachedBytesCannotClaimReadiness: true,
      wholeCacheEvictionAndRepair: true,
      inspectionDoesNotRecreateDeletedCache: true,
      twoRoomConcurrentRepairPreservesSettings: true,
      repairedBothRoomsReloadWithOriginStopped: true,
      actualPortableDownloadAfterShutdown: true,
      httpErrorUsesRetainedRoom: true,
      unknownRouteKeepsHttpError: true,
    });
    console.log(
      engine +
        ": missing/poisoned/evicted cache, failed/successful/concurrent repair, origin-stopped replay",
    );
  } finally {
    await context.close();
    await browser.close();
    await server.stop();
  }
}
await writeFile(
  path.join(output, "repair.json"),
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      boundary:
        "Local production edition; actual Cache Storage mutation and server failure/substitution/shutdown",
      results,
    },
    null,
    2,
  ) + "\n",
);
