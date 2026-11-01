import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";
import { serve } from "./seeing-server.mjs";

const output = path.resolve(process.argv[2] ?? "test-results/seeing");
const publicBase = process.argv[3];
const manifest = JSON.parse(await readFile("public/sources/manifest.json", "utf8"));
const sha = (b) => createHash("sha256").update(b).digest("hex");
async function until(fn) {
  const end = Date.now() + 25000;
  let last;
  while (Date.now() < end) {
    try {
      if (await fn()) return;
    } catch (e) {
      last = e;
    }
    await new Promise((r) => setTimeout(r, 80));
  }
  throw last ?? new Error("Study did not reach the expected state.");
}
async function contains(page, selector, pattern) {
  await until(
    async () => assert.match(await page.locator(selector).textContent(), pattern) || true,
  );
}
async function save(page, selector, file) {
  const waiting = page.waitForEvent("download", { timeout: 25000 });
  await page.locator(selector).click();
  const download = await waiting;
  assert.equal(await download.failure(), null);
  await download.saveAs(file);
  const bytes = await readFile(file);
  return { bytes: bytes.length, sha256: sha(bytes) };
}
async function allFiles(dir) {
  return (
    await Promise.all(
      (
        await readdir(dir, { withFileTypes: true })
      ).map((e) => (e.isDirectory() ? allFiles(path.join(dir, e.name)) : [path.join(dir, e.name)])),
    )
  ).flat();
}
const expected = (await allFiles("dist"))
  .filter((f) => !f.endsWith("sw.js"))
  .map((f) => "/syngraphe/" + path.relative("dist", f))
  .sort();
const report = {
  checkedAt: new Date().toISOString(),
  boundary: publicBase
    ? "Hosted browser operation; offline network emulation only"
    : "Local production edition; local origin stopped before offline replay",
  configurations: [],
};
for (const [engine, api] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  const browser = await api.launch();
  try {
    for (const width of [1440, 375]) {
      const server = publicBase ? { base: publicBase, stop: async () => {} } : await serve();
      const folder = path.join(output, `${engine}-${width}`);
      await mkdir(folder, { recursive: true });
      const context = await browser.newContext({
        viewport: { width, height: 1050 },
        acceptDownloads: true,
      });
      const page = await context.newPage(),
        errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      try {
        await page.goto(server.base);
        await page.getByRole("link", { name: "Seeing while passing", exact: true }).focus();
        await page.keyboard.press("Enter");
        await page.waitForURL("**/seeing.html");
        assert.equal(new URL(page.url()).pathname, "/syngraphe/seeing.html");
        await contains(page, "#source-status", /^Verified whole/);
        await contains(page, "#route-description", /23 of 41.*8/);
        await contains(page, "#model-lesson", /Both samples can be seen.*differ/);
        await page.locator("#stated-faces").focus();
        await page.keyboard.press("Enter");
        await contains(page, "#clause-status", /Both sides — agrees/);
        await contains(page, "#sightline-status", /B \/ pillar: Sightline stopped by the support/);
        await page.locator('[data-station="20"]').click();
        await contains(page, "#sightline-status", /B \/ pillar: Sample point visible/);
        await page.locator("#station").focus();
        await page.keyboard.press("ArrowLeft");
        assert.equal(await page.locator("#station").inputValue(), "19");
        await page.locator("#pillar-opening").selectOption("left");
        await contains(page, "#sightline-status", /pillar chest's right face/);
        await page.locator('[data-station="-20"]').click();
        await contains(page, "#sightline-status", /B \/ pillar: Sample point visible/);
        await page.locator("#pillar-opening").selectOption("closed");
        await contains(page, "#route-description", /B at 0/);
        await page.locator("#stated-faces").click();
        await page.locator('[data-station="20"]').click();
        await page.locator("#sightline").evaluate((el) => el.scrollIntoView({ block: "start" }));
        await page.screenshot({ path: path.join(folder, "study.png") });
        await page.locator("#drawing-enlarge").click();
        assert.equal(await page.locator("#drawing-enlarge").getAttribute("aria-pressed"), "true");
        await page.locator("#drawing-frame").focus();
        await page.keyboard.press("ArrowRight");
        await page.locator("#drawing-enlarge").click();
        const readings = [];
        for (let n = 0; n < 5; n++) {
          await page.locator("#reading-select").selectOption(String(n));
          const words = page.locator("#reading-greek [data-word]");
          for (let i = 0; i < (await words.count()); i++) {
            await words.nth(i).focus();
            await page.keyboard.press("Enter");
            assert.equal(await words.nth(i).getAttribute("aria-pressed"), "true");
            assert(await words.nth(i).evaluate((b) => b === document.activeElement));
            await contains(page, "#word-definition", /Dictionary form/);
          }
          readings.push({
            greek: await page.locator("#reading-greek").textContent(),
            english: await page.locator("#reading-english").textContent(),
            words: await words.count(),
          });
        }
        assert.equal(
          readings.reduce((n, r) => n + r.words, 0),
          15,
        );
        await page.locator("#reading-pages button").click();
        await contains(page, "#source-caption", /p.13/);
        const sources = [];
        for (const n of [15, 34, 40, 41]) {
          await page.locator("#source-page").selectOption(String(n));
          await contains(page, "#source-status", /^Verified whole/);
          const im = await page.locator("#source-image").evaluate(async (im) => {
            await im.decode();
            const data = await (await fetch(im.src)).arrayBuffer();
            return {
              bytes: data.byteLength,
              sha256: Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", data)), (b) =>
                b.toString(16).padStart(2, "0"),
              ).join(""),
              width: im.naturalWidth,
              height: im.naturalHeight,
            };
          });
          const expected = manifest.pages.find((p) => p.pdfPage === n);
          assert.equal(im.sha256, expected.sha256);
          assert.equal(im.bytes, expected.bytes);
          assert.equal(im.height, 2500);
          sources.push({ page: n, ...im });
        }
        await page.locator("#copy-link").click();
        const link = await page.locator("#study-link").inputValue();
        assert.equal(new URL(link).searchParams.get("station"), "20");
        assert.equal(new URL(link).searchParams.get("pillar"), "sides");
        const restored = await context.newPage();
        await restored.goto(link);
        await contains(restored, "#clause-status", /Both sides — agrees/);
        assert.equal(await restored.locator("#station").inputValue(), "20");
        await restored.close();
        const downloads = {};
        for (const [selector, name] of [
          ["#save-json", "study.json"],
          ["#save-csv", "stations.csv"],
          ["#save-svg", "study.svg"],
          ["#save-reading", "reading.html"],
        ])
          downloads[name] = await save(page, selector, path.join(folder, name));
        await page.locator("#import-file").setInputFiles({
          name: "bad.json",
          mimeType: "application/json",
          buffer: Buffer.from('{"format":"syngraphe-plan"}'),
        });
        await contains(page, "#import-status", /No settings were changed/);
        assert.equal(await page.locator("#station").inputValue(), "20");
        await page.locator("#fronts").click();
        await page.locator("#import-file").setInputFiles(path.join(folder, "study.json"));
        await contains(page, "#import-status", /settings reopened/);
        await contains(page, "#clause-status", /Both sides — agrees/);
        const axe = await new AxeBuilder({ page }).analyze();
        assert.deepEqual(
          axe.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })),
          [],
        );
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await contains(page, "#offline-status", /^Edition ready offline/);
        const cache = await page.evaluate(async () => {
          const keys = (await caches.keys()).filter((k) => k.startsWith("syngraphe-"));
          return {
            keys,
            files: (await (await caches.open(keys[0])).keys())
              .map((r) => new URL(r.url).pathname)
              .sort(),
            controlled: !!navigator.serviceWorker.controller,
          };
        });
        assert(cache.controlled);
        assert.equal(cache.keys.length, 1);
        assert.deepEqual(cache.files, expected);
        await server.stop();
        if (publicBase) await context.setOffline(true);
        await page.reload();
        await contains(page, "#offline-status", /^Edition ready offline/);
        await page.locator("#stated-faces").click();
        await page.locator('[data-station="-20"]').click();
        await contains(page, "#sightline-status", /B \/ pillar: Sample point visible/);
        downloads["offline-reading.html"] = await save(
          page,
          "#save-reading",
          path.join(folder, "offline-reading.html"),
        );
        const portableContext = await browser.newContext({
          viewport: { width, height: 1000 },
          javaScriptEnabled: false,
          acceptDownloads: true,
        });
        const portable = await portableContext.newPage(),
          requests = [];
        portable.on("request", (r) => {
          if (/^https?:/.test(r.url())) requests.push(r.url());
        });
        await portable.goto(pathToFileURL(path.join(folder, "reading.html")).href);
        await until(() =>
          portable.evaluate(() =>
            [...document.fonts].some((f) => f.family === "Study" && f.status === "loaded"),
          ),
        );
        assert.equal(await portable.locator(".reading .greek").count(), 5);
        assert.equal(await portable.locator("figure.source img").count(), 4);
        assert(await portable.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        for (const [download, file] of [
          ["syngraphe-sightline.json", "study.json"],
          ["syngraphe-stations.csv", "stations.csv"],
          ["syngraphe-sightline.svg", "study.svg"],
        ]) {
          await save(portable, `a[download="${download}"]`, path.join(folder, `embedded-${file}`));
          assert.deepEqual(
            await readFile(path.join(folder, `embedded-${file}`)),
            await readFile(path.join(folder, file)),
          );
        }
        if (engine === "chromium" && width === 1440)
          await portable.pdf({
            path: path.join(folder, "reading.pdf"),
            printBackground: true,
            preferCSSPageSize: true,
          });
        assert.deepEqual(requests, []);
        assert.deepEqual(errors, []);
        await portableContext.close();
        report.configurations.push({
          engine,
          width,
          readings,
          sources,
          downloads,
          sharedLinkRestored: true,
          malformedImportAtomic: true,
          keyboardWordFocusRetained: true,
          axeViolations: axe.violations.length,
          inventoryFiles: cache.files.length,
          offlineOriginStopped: !publicBase,
          portableJavaScriptDisabled: true,
          nativeEmbeddedDownloadsIdentical: true,
          portableRemoteRequests: requests,
          errors,
        });
        console.log(
          `${engine} ${width}: measurement room -> sightline controls -> Greek -> verified sources -> native artifacts -> offline replay`,
        );
      } finally {
        await context.close();
        if (!publicBase) await server.stop();
      }
    }
  } finally {
    await browser.close();
  }
}
await mkdir(output, { recursive: true });
await writeFile(path.join(output, "review.json"), JSON.stringify(report, null, 2) + "\n");
