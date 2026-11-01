import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox } from "playwright";
import { serve } from "./seeing-server.mjs";

const output = path.resolve(process.argv[2] ?? "test-results/seeing-faults");
const baseline = process.argv[3];
await mkdir(output, { recursive: true });
async function until(fn) {
  const deadline = Date.now() + 25000;
  let last;
  while (Date.now() < deadline) {
    try {
      if (await fn()) return;
    } catch (error) {
      last = error;
    }
    await new Promise((r) => setTimeout(r, 80));
  }
  throw last ?? new Error("Recovery did not settle.");
}
async function contains(page, selector, re) {
  await until(async () => assert.match(await page.locator(selector).textContent(), re) || true);
}
const results = [];
for (const [engine, api] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await api.launch(),
    server = await serve();
  const row = { engine };
  try {
    // A successful HTTP response carrying a different authentic page is rejected.
    const c = await browser.newContext({ serviceWorkers: "block", acceptDownloads: true });
    const p = await c.newPage(),
      downloads = [];
    p.on("download", (d) => downloads.push(d));
    await c.route("**/sources/choisy-041.jpg", async (r) =>
      r.fulfill({
        contentType: "image/jpeg",
        body: await readFile("public/sources/choisy-034.jpg"),
      }),
    );
    await p.goto(server.base + "seeing.html");
    await contains(p, "#source-status", /does not match this edition/);
    assert(await p.locator("#source-image").isHidden());
    await p.locator("#save-reading").click();
    await contains(p, "#save-status", /does not match this edition/);
    assert.equal(downloads.length, 0);
    await c.unroute("**/sources/choisy-041.jpg");
    await p.locator("#source-retry").click();
    await contains(p, "#source-status", /^Verified whole/);
    row.substitutedSourceRefusedAndRetryRecovered = true;
    await c.close();

    // Freeze an actual pending page fetch, alter the controls, then finish saving.
    const snap = await browser.newContext({ serviceWorkers: "block", acceptDownloads: true });
    let release,
      arrived = false;
    const gate = new Promise((r) => {
      release = r;
    });
    await snap.route("**/sources/choisy-040.jpg", async (r) => {
      arrived = true;
      await gate;
      await r.continue();
    });
    const sp = await snap.newPage();
    await sp.goto(server.base + "seeing.html");
    await sp.locator("#stated-faces").click();
    await sp.locator('[data-station="20"]').click();
    const waiting = sp.waitForEvent("download", { timeout: 25000 });
    await sp.locator("#save-reading").click();
    await until(() => arrived);
    await sp.locator("#fronts").click();
    await sp.locator('[data-station="-20"]').click();
    release();
    const d = await waiting;
    const file = path.join(output, `${engine}-snapshot.html`);
    await d.saveAs(file);
    const text = await readFile(file, "utf8");
    assert(text.includes("Pillar chest: Both sides. Viewer at 20 feet"));
    assert(!text.includes("Pillar chest: Front only. Viewer at -20 feet"));
    row.savingCapturesStartState = true;
    await snap.close();

    const cancel = await browser.newContext({ serviceWorkers: "block", acceptDownloads: true });
    let cancelRelease,
      cancelArrived = false,
      settled = false;
    const cancelGate = new Promise((r) => {
      cancelRelease = r;
    });
    await cancel.route("**/sources/choisy-040.jpg", async (r) => {
      cancelArrived = true;
      await cancelGate;
      await r.continue();
      settled = true;
    });
    const cp = await cancel.newPage(),
      cancelledDownloads = [];
    cp.on("download", (d) => cancelledDownloads.push(d));
    await cp.goto(server.base + "seeing.html");
    await cp.locator("#save-reading").click();
    await until(() => cancelArrived);
    await cp.locator("#cancel-save").click();
    cancelRelease();
    await until(() => settled);
    await contains(cp, "#save-status", /Saving cancelled/);
    await cp.locator("#save-reading").click();
    await until(() => cancelledDownloads.length === 1);
    await contains(cp, "#save-status", /^Saved the study/);
    assert.equal(cancelledDownloads.length, 1);
    row.cancelledSaveEmitsNoLateDownloadAndNextSaveWorks = true;
    await cancel.close();

    // Cold installation from the new room includes the older room too.
    const cold = await browser.newContext();
    const coldPage = await cold.newPage();
    await coldPage.goto(server.base + "seeing.html");
    await contains(coldPage, "#offline-status", /^Edition ready offline/);
    await server.stop();
    await coldPage.reload();
    await contains(coldPage, "#source-status", /^Verified whole/);
    await coldPage.getByRole("link", { name: "Measurements", exact: true }).click();
    await contains(coldPage, "#offline", /^Edition ready offline/);
    await coldPage.locator("#side-inclusive").check();
    await contains(coldPage, "#width-result", /55 feet/);
    row.coldNewRoomInstallsBothRoomsForOriginStoppedReplay = true;
    // Eviction is reported on fresh inspection; missing evidence cannot be exported.
    await coldPage.evaluate(async () => {
      const key = (await caches.keys()).find((k) => k.startsWith("syngraphe-"));
      await (await caches.open(key)).delete(new URL("sources/choisy-040.jpg", location.href).href);
    });
    await coldPage.getByRole("link", { name: "Seeing while passing", exact: true }).click();
    await contains(coldPage, "#offline-status", /^Offline copy is incomplete/);
    await coldPage.locator("#save-reading").click();
    await contains(coldPage, "#save-status", /fetch|Network|Could not|Failed/i);
    row.evictionDoesNotClaimReadyOrExportMissingEvidence = true;
    await cold.close();

    if (baseline) {
      const upgradeServer = await serve(baseline),
        uc = await browser.newContext();
      try {
        const old = await uc.newPage();
        await old.goto(upgradeServer.base);
        await contains(old, "#offline", /^Edition ready offline/);
        await old.locator("#end-gap").fill("83");
        await old.locator("#end-gap").press("Tab");
        const before = await old.locator("#grid-description").textContent();
        const oldCache = await old.evaluate(() => caches.keys());
        upgradeServer.use("dist");
        const next = await uc.newPage();
        await next.goto(upgradeServer.base + "seeing.html");
        await contains(next, "#offline-status", /^Edition ready offline/);
        await contains(old, "#offline", /different edition is now saved offline/);
        assert.equal(await old.locator("#end-gap").inputValue(), "83");
        assert.equal(await old.locator("#grid-description").textContent(), before);
        assert(!(await old.locator("#reload-edition").isHidden()));
        await until(async () => (await next.evaluate(() => caches.keys())).length === 1);
        const current = await next.evaluate(() => caches.keys());
        assert.equal(current.length, 1);
        assert.notDeepEqual(current, oldCache);
        await upgradeServer.stop();
        await next.reload();
        await contains(next, "#source-status", /^Verified whole/);
        await contains(next, "#offline-status", /^Edition ready offline/);
        row.previousEditionHandoverPreservesEditedMeasurementTab = true;
      } finally {
        await uc.close();
        await upgradeServer.stop();
      }
    }
    results.push(row);
    console.log(
      `${engine}: source substitution, snapshot, cancellation, cold two-room offline edition, eviction${baseline ? ", old-edition handover" : ""}`,
    );
  } finally {
    await browser.close();
    await server.stop();
  }
}
await writeFile(
  path.join(output, "faults.json"),
  JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      boundary: "Local production edition; real origin shutdown; optional prior-edition fixture",
      results,
    },
    null,
    2,
  ) + "\n",
);
