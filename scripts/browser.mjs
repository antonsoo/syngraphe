import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import AxeBuilder from "@axe-core/playwright";
import { chromium, firefox } from "playwright";

const out = path.resolve(process.argv[2] ?? "/tmp/syngraphe-browser"),
  publicBase = process.argv[3];
await mkdir(out, { recursive: true });
const manifest = JSON.parse(await readFile("public/sources/manifest.json", "utf8"));
// Read complete content through the app; the runner does not require a TS loader.
const digest = (b) => createHash("sha256").update(b).digest("hex");
async function files(dir) {
  return (
    await Promise.all(
      (
        await readdir(dir, { withFileTypes: true })
      ).map((e) => (e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)])),
    )
  ).flat();
}
const expectedFiles = (await files("dist"))
  .filter((f) => !f.endsWith("sw.js"))
  .map((f) => "/syngraphe/" + path.relative("dist", f));
async function serve() {
  if (publicBase) return { base: publicBase, stop: async () => {} };
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://local");
    const file = url.pathname.slice("/syngraphe/".length) || "index.html";
    if (!url.pathname.startsWith("/syngraphe/") || file.includes(".."))
      return res.writeHead(404).end();
    try {
      const bytes = await readFile(path.join("dist", file));
      res
        .writeHead(200, {
          "Content-Type":
            {
              ".html": "text/html",
              ".js": "text/javascript",
              ".css": "text/css",
              ".json": "application/json",
              ".svg": "image/svg+xml",
              ".jpg": "image/jpeg",
              ".ttf": "font/ttf",
              ".txt": "text/plain",
            }[path.extname(file)] ?? "application/octet-stream",
          "Cache-Control": "no-store",
        })
        .end(bytes);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return {
    base: `http://127.0.0.1:${server.address().port}/syngraphe/`,
    stop: () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  };
}
async function key(page, selector, key = "Enter") {
  await page.locator(selector).focus();
  await page.keyboard.press(key);
}
async function until(fn) {
  const deadline = Date.now() + 25000;
  let last;
  while (Date.now() < deadline) {
    try {
      const r = await fn();
      if (r) return r;
    } catch (e) {
      last = e;
    }
    await new Promise((r) => setTimeout(r, 80));
  }
  throw last ?? new Error("Timed out waiting for workshop state.");
}
async function contains(page, id, text) {
  await until(async () => assert.match(await page.locator(id).textContent(), text) || true);
}
async function save(page, selector, file) {
  const pending = page.waitForEvent("download");
  await page.locator(selector).click();
  const d = await pending;
  await d.saveAs(file);
  assert.equal(await d.failure(), null);
  return {
    suggested: d.suggestedFilename(),
    bytes: (await readFile(file)).length,
    sha256: digest(await readFile(file)),
  };
}
async function verifiedSource(page, p) {
  await page.locator("#source-page").selectOption(String(p.pdfPage));
  await contains(page, "#source-status", /^Verified whole/);
  const actual = await page.locator("#source-image").evaluate(async (im) => {
    await im.decode();
    const bytes = await (await fetch(im.src)).arrayBuffer();
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");
    return {
      bytes: bytes.byteLength,
      sha256: hash,
      width: im.naturalWidth,
      height: im.naturalHeight,
    };
  });
  assert.equal(actual.bytes, p.bytes);
  assert.equal(actual.sha256, p.sha256);
  assert(actual.width > 1500 && actual.height === 2500);
  return { page: p.pdfPage, ...actual };
}
const report = {
  checkedAt: new Date().toISOString(),
  scope: publicBase
    ? "Public HTTPS operation and browser-network-disabled reload. Remote origin was not stopped."
    : "Production build, actual native downloads, retained files and offline replay with the local origin refusing connections.",
  configurations: [],
};
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  if (process.env.REVIEW_ENGINE && process.env.REVIEW_ENGINE !== name) continue;
  const browser = await engine.launch();
  try {
    for (const width of [1440, 375]) {
      if (process.env.REVIEW_WIDTH && Number(process.env.REVIEW_WIDTH) !== width) continue;
      console.log(name, width);
      const folder = path.join(out, `${name}-${width}`);
      await mkdir(folder, { recursive: true });
      const server = await serve();
      let stopped = false;
      const context = await browser.newContext({
        viewport: { width, height: 1000 },
        acceptDownloads: true,
      });
      const page = await context.newPage();
      const errors = [],
        consoleErrors = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      page.on("console", (m) => {
        if (m.type() === "error") consoleErrors.push(m.text());
      });
      try {
        await page.goto(server.base);
        await contains(page, "#width-result", /60½ feet/);
        await page.evaluate(async () => {
          await document.fonts.ready;
          await new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          );
        });
        await page.screenshot({ path: path.join(folder, "opening.png") });
        const initialURL = page.url();
        await key(page, "#side-inclusive", "Space");
        await contains(page, "#width-result", /^55 feet/);
        await contains(page, "#clear-result", /12¼/);
        assert.equal(page.url(), initialURL);
        await key(page, "#fit-total");
        await contains(page, "#height-result", /30 feet fits.*contradicts/);
        await key(page, "#first-five", "Space");
        await contains(page, "#height-result", /^31 feet/);
        await key(page, "#fit-total");
        await contains(page, "#height-result", /30 feet, and.*observed/);
        assert.equal(await page.locator("#capital").inputValue(), "16");
        await page.locator("#width").scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(folder, "width.png") });
        await key(page, "#width-enlarge");
        await page.keyboard.press("ArrowRight");
        await until(() => page.locator("#width-frame").evaluate((e) => e.scrollLeft > 0));
        await key(page, "#width-enlarge");
        await page.locator("#height").scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(folder, "stack.png") });
        await key(page, '[data-gap="112"]');
        await contains(page, "#pillar-position", /11⅛/);
        await key(page, "#pillar", "End");
        assert.equal(await page.locator("#pillar").inputValue(), "35");
        await contains(page, "#pillar-position", /389⅛/);
        await page.locator("#end-gap").fill("83");
        await page.locator("#end-gap").press("Tab");
        await contains(page, "#gap-unit", /5 3\/16/);
        await contains(page, "#pillar-position", /390 15\/16/);
        if (width === 375) {
          await page.locator(".plan-scroll").focus();
          await page.keyboard.press("ArrowRight");
          await until(() => page.locator(".plan-scroll").evaluate((e) => e.scrollLeft > 0));
        }
        await page.locator("#grid").scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(folder, "grid.png") });
        const units = [];
        for (let i = 0; i < 8; i++) {
          await page.locator("#reading-select").selectOption(String(i));
          const buttons = page.locator("#reading-greek button");
          const count = await buttons.count();
          assert(count > 0);
          for (let j = 0; j < count; j++) {
            await buttons.nth(j).focus();
            await page.keyboard.press("Enter");
            assert.equal(await buttons.nth(j).getAttribute("aria-pressed"), "true");
            assert(
              (await page.locator("#word-definition").textContent()).includes("Dictionary form"),
            );
          }
          units.push({
            reading: i + 1,
            title: await page.locator("#reading-title").textContent(),
            greek: await page.locator("#reading-greek").textContent(),
            english: await page.locator("#reading-english").textContent(),
            wordNotes: count,
          });
        }
        assert.equal(
          units.reduce((n, u) => n + u.wordNotes, 0),
          22,
        );
        await page.locator("#greek").scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(folder, "greek.png") });
        await key(page, "#reading-pages button");
        await until(() =>
          page.locator("#source-title").evaluate((e) => e === document.activeElement),
        );
        const sources = [];
        for (const p of manifest.pages) sources.push(await verifiedSource(page, p));
        await key(page, "#source-enlarge");
        await page.keyboard.press("ArrowRight");
        await until(() => page.locator("#source-frame").evaluate((e) => e.scrollLeft > 0));
        await key(page, "#source-enlarge");
        await verifiedSource(
          page,
          manifest.pages.find((p) => p.pdfPage === 37),
        );
        const before = await page.locator("#width-result").textContent();
        await page.locator("#capital").fill("1.5");
        await page.locator("#capital").press("Tab");
        await contains(page, "#notice", /last valid settings/);
        assert.equal(await page.locator("#width-result").textContent(), before);
        await page.locator("#capital").fill("16");
        await page.locator("#capital").press("Tab");
        const native = {};
        native.json = await save(page, "#save-json", path.join(folder, "plan.json"));
        native.csv = await save(page, "#save-csv", path.join(folder, "measurements.csv"));
        native.svg = await save(page, "#save-svg", path.join(folder, "study.svg"));
        native.html = await save(page, "#save-reading", path.join(folder, "reading.html"));
        await contains(page, "#save-status", /saved with the settings/);
        const plan = JSON.parse(await readFile(path.join(folder, "plan.json"), "utf8"));
        assert.equal(plan.state.side, "inclusive");
        assert.equal(plan.state.first, 5);
        assert.equal(plan.state.endGap, 83);
        await page.locator("#import-plan").setInputFiles({
          name: "bad.json",
          mimeType: "application/json",
          buffer: Buffer.from(JSON.stringify({ ...plan, state: { ...plan.state, extra: 1 } })),
        });
        await contains(page, "#import-status", /not a valid/);
        assert.equal(await page.locator("#end-gap").inputValue(), "83");
        await page.locator("#side-clear").check();
        await page.locator("#import-plan").setInputFiles(path.join(folder, "plan.json"));
        await contains(page, "#import-status", /Plan reopened/);
        await contains(page, "#width-result", /^55 feet/);
        await key(page, "#share");
        const link = await page.locator("#share-link").inputValue();
        assert.equal(new URL(link).searchParams.get("endGap"), "83");
        const restored = await context.newPage();
        await restored.goto(link);
        await contains(restored, "#height-result", /observed/);
        assert.equal(await restored.locator("#pillar").inputValue(), "35");
        assert.equal(await restored.locator("#source-page").inputValue(), "37");
        await restored.close();
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        const axe = (
          await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()
        ).violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }));
        assert.deepEqual(axe, []);
        assert.deepEqual(errors, []);
        assert.deepEqual(consoleErrors, []);
        await contains(page, "#offline", /^Edition ready offline/);
        const cache = await page.evaluate(async () => {
          const names = (await caches.keys()).filter((n) => n.startsWith("syngraphe-"));
          if (names.length !== 1) throw new Error("Expected one current edition cache");
          const requests = await (await caches.open(names[0])).keys();
          return {
            name: names[0],
            files: requests.map((r) => new URL(r.url).pathname).sort(),
            controller: navigator.serviceWorker.controller?.scriptURL,
          };
        });
        assert.deepEqual(cache.files, [...expectedFiles].sort());
        assert(cache.controller?.endsWith("/syngraphe/sw.js"));
        if (!publicBase) {
          await server.stop();
          stopped = true;
          await assert.rejects(() => fetch(server.base));
        }
        await context.setOffline(true);
        await page.reload();
        await contains(page, "#width-result", /60½ feet/);
        await contains(page, "#offline", /^Edition ready offline/);
        await page.locator("#side-inclusive").check();
        await page.locator("#first-five").check();
        await page.locator("#capital").fill("16");
        await page.locator("#capital").press("Tab");
        await page.locator("#end-gap").fill("97");
        await page.locator("#end-gap").press("Tab");
        await contains(page, "#gap-unit", /6 1\/16/);
        await verifiedSource(
          page,
          manifest.pages.find((p) => p.pdfPage === 73),
        );
        native.offlineJson = await save(page, "#save-json", path.join(folder, "offline-plan.json"));
        native.offlineCsv = await save(
          page,
          "#save-csv",
          path.join(folder, "offline-measurements.csv"),
        );
        native.offlineHtml = await save(
          page,
          "#save-reading",
          path.join(folder, "offline-reading.html"),
        );
        await context.setOffline(false);
        const local = await browser.newContext({
            javaScriptEnabled: false,
            acceptDownloads: true,
            viewport: { width, height: 1000 },
          }),
          retained = await local.newPage();
        const requests = [];
        retained.on("request", (r) => {
          if (/^https?:/.test(r.url())) requests.push(r.url());
        });
        await retained.goto(pathToFileURL(path.join(folder, "reading.html")).href);
        await until(() =>
          retained.evaluate(() =>
            [...document.fonts].some((f) => f.family === "Reading" && f.status === "loaded"),
          ),
        );
        assert.equal(await retained.locator("script").count(), 0);
        assert.equal(await retained.locator(".reading").count(), 8);
        assert.equal(await retained.locator(".source img").count(), 10);
        assert(
          await retained
            .locator(".source img")
            .evaluateAll((ims) => ims.every((i) => i.complete && i.naturalWidth > 0)),
        );
        assert.deepEqual(requests, []);
        await retained.locator(".reading").first().scrollIntoViewIfNeeded();
        await retained.screenshot({ path: path.join(folder, "retained.png") });
        native.embeddedJson = await save(
          retained,
          'a[download="syngraphe-plan.json"]',
          path.join(folder, "embedded-plan.json"),
        );
        native.embeddedCsv = await save(
          retained,
          'a[download="syngraphe-measurements.csv"]',
          path.join(folder, "embedded-measurements.csv"),
        );
        native.embeddedSvg = await save(
          retained,
          'a[download="syngraphe-study.svg"]',
          path.join(folder, "embedded-study.svg"),
        );
        assert.equal(native.embeddedJson.sha256, native.json.sha256);
        assert.equal(native.embeddedCsv.sha256, native.csv.sha256);
        assert.equal(native.embeddedSvg.sha256, native.svg.sha256);
        if (name === "chromium" && width === 1440) {
          await retained.pdf({
            path: path.join(folder, "reading.pdf"),
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
          });
        }
        await retained.goto(pathToFileURL(path.join(folder, "study.svg")).href);
        await retained.screenshot({ path: path.join(folder, "svg.png") });
        await local.close();
        report.configurations.push({
          engine: name,
          version: browser.version(),
          width,
          sourceReadings: units,
          sources,
          native,
          shareLink: link,
          axeViolations: axe,
          cache,
          originStopped: !publicBase,
          offlineNewEndGapFingers: 97,
          applicationErrors: errors,
        });
        await writeFile(
          path.join(out, "progress.json"),
          JSON.stringify({ ...report, partial: true }, null, 2) + "\n",
        );
      } catch (e) {
        await page.screenshot({ path: path.join(folder, "failure.png") }).catch(() => {});
        console.error({ url: page.url(), errors, consoleErrors });
        throw e;
      } finally {
        await context.close();
        if (!stopped) await server.stop();
      }
    }
  } finally {
    await browser.close();
  }
}
await writeFile(path.join(out, "review.json"), JSON.stringify(report, null, 2) + "\n");
console.log(`Verified ${report.configurations.length} complete workshop configurations`);
