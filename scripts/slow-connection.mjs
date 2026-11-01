import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium, firefox } from "playwright";
import { slowServer } from "./slow-server.mjs";

const output = path.resolve(process.argv[2] ?? "test-results/slow-connection");
await mkdir(output, { recursive: true });
const results = await Promise.all(
  [
    ["chromium", chromium],
    ["firefox", firefox],
  ].map(async ([engine, api]) => {
    const browser = await api.launch(),
      server = await slowServer();
    try {
      const context = await browser.newContext({ acceptDownloads: true });
      const page = await context.newPage();
      const start = Date.now();
      await page.goto(`${server.base}seeing.html`, { waitUntil: "domcontentloaded" });
      await page.locator("#stated-faces").click();
      await page.locator('[data-station="20"]').click();
      const chosen = await page.locator("#sightline-status").textContent();
      await page.waitForFunction(
        () =>
          document.querySelector("#offline-status").textContent.startsWith("Edition ready offline"),
        {},
        { timeout: 150000 },
      );
      const installedMs = Date.now() - start;
      assert(installedMs > 25000, "The transfer must exceed the old installation deadline.");
      assert.equal(await page.locator("#sightline-status").textContent(), chosen);
      await server.stop();
      await page.reload();
      await page.waitForFunction(() =>
        document.querySelector("#source-status").textContent.startsWith("Verified"),
      );
      const pending = page.waitForEvent("download");
      await page.locator("#save-reading").click();
      const file = path.join(output, `${engine}-offline-seeing.html`);
      await (await pending).saveAs(file);
      assert((await readFile(file, "utf8")).includes("data:image/jpeg;base64,"));
      await context.close();
      // Independently test the twelve-page reading with no worker or offline cache.
      const readingServer = await slowServer();
      const readingContext = await browser.newContext({
        serviceWorkers: "block",
        acceptDownloads: true,
      });
      try {
        const reading = await readingContext.newPage();
        await reading.goto(readingServer.base, { waitUntil: "domcontentloaded" });
        await reading.waitForFunction(
          () => document.querySelector("#source-status").textContent.startsWith("Verified"),
          {},
          { timeout: 60000 },
        );
        const began = Date.now(),
          saved = reading.waitForEvent("download", { timeout: 150000 });
        await reading.locator("#save-reading").click();
        await reading.locator("#end-gap").fill("83");
        await reading.locator("#end-gap").press("Tab");
        const native = path.join(output, `${engine}-slow-measurements.html`);
        await (await saved).saveAs(native);
        const elapsed = Date.now() - began;
        assert(elapsed > 15000, "The transfer must exceed the old asset deadline.");
        const html = await readFile(native, "utf8");
        assert.equal((html.match(/<img /g) ?? []).length, 12);
        const embedded =
          /download="syngraphe-plan.json" href="data:application\/json;charset=utf-8,([^"]+)"/.exec(
            html,
          );
        assert(embedded);
        assert.equal(JSON.parse(decodeURIComponent(embedded[1])).state.endGap, 80);
        assert.equal(await reading.locator("#end-gap").inputValue(), "83");
        console.log(
          `${engine}: complete offline install ${installedMs} ms, twelve-page reading ${elapsed} ms at a shared 128000 bytes/s`,
        );
        return {
          engine,
          browserVersion: browser.version(),
          sharedBytesPerSecond: 128000,
          installedMs,
          installedAfterOldDeadline: true,
          installPreservesSettings: true,
          originStoppedOfflineReloadAndDownload: true,
          readingMs: elapsed,
          readingBeyondOldAssetDeadline: true,
          wholeReadingImages: 12,
          readingCapturesStartingSettings: true,
        };
      } finally {
        await readingContext.close();
        await readingServer.stop();
      }
    } finally {
      await browser.close();
      await server.stop();
    }
  }),
);
await writeFile(
  path.join(output, "slow.json"),
  `${JSON.stringify(
    {
      checkedAt: new Date().toISOString(),
      boundary:
        "Local production edition; one shared HTTP response budget across all concurrent requests, real source bytes, no worker in reading test, actual origin shutdown in offline test",
      results,
    },
    null,
    2,
  )}\n`,
);
