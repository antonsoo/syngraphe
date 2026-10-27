import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { chromium, firefox } from "playwright";

const out = path.resolve(process.argv[2] ?? "/tmp/syngraphe-faults");
await mkdir(out, { recursive: true });
async function until(fn) {
  const end = Date.now() + 20000;
  let error;
  while (Date.now() < end) {
    try {
      if (await fn()) return;
    } catch (e) {
      error = e;
    }
    await new Promise((r) => setTimeout(r, 60));
  }
  throw error ?? new Error("Timed out");
}
async function text(page, id, re) {
  await until(async () => re.test(await page.locator(id).textContent()));
}
const report = {
  checkedAt: new Date().toISOString(),
  scope:
    "Local production source-response failures, export refusal, source selection race and retained snapshot",
  configurations: [],
};
for (const [name, engine] of [
  ["chromium", chromium],
  ["firefox", firefox],
]) {
  console.log(name);
  const browser = await engine.launch();
  let corrupt = false,
    heldFile = "",
    held = [];
  const send = async (res, file) => {
    try {
      const actual = corrupt && file === "sources/choisy-037.jpg" ? "sources/choisy-035.jpg" : file;
      const bytes = await readFile(path.join("dist", actual));
      res
        .writeHead(200, {
          "Content-Type":
            {
              ".html": "text/html",
              ".js": "text/javascript",
              ".css": "text/css",
              ".jpg": "image/jpeg",
              ".svg": "image/svg+xml",
              ".ttf": "font/ttf",
            }[path.extname(actual)] ?? "text/plain",
          "Cache-Control": "no-store",
        })
        .end(bytes);
    } catch {
      res.writeHead(404).end();
    }
  };
  const server = createServer((req, res) => {
    const file =
      new URL(req.url, "http://local").pathname.slice("/syngraphe/".length) || "index.html";
    if (file.includes("..")) return res.writeHead(404).end();
    if (file === heldFile) {
      held.push({ res, file });
      return;
    }
    void send(res, file);
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const base = `http://127.0.0.1:${server.address().port}/syngraphe/`;
  const release = async () => {
    heldFile = "";
    await Promise.all(held.splice(0).map(({ res, file }) => send(res, file)));
  };
  try {
    const c = await browser.newContext({ serviceWorkers: "block", acceptDownloads: true }),
      p = await c.newPage();
    await p.goto(base);
    await text(p, "#source-status", /^Verified/);
    heldFile = "sources/choisy-033.jpg";
    await p.locator("#source-page").selectOption("33");
    await until(() => held.length === 1);
    await p.locator("#source-page").selectOption("35");
    await text(p, "#source-status", /^Verified/);
    const selected = await p.locator("#source-image").getAttribute("src");
    await release();
    await p.waitForTimeout(150);
    assert.equal(await p.locator("#source-image").getAttribute("src"), selected);
    assert.equal(await p.locator("#source-page").inputValue(), "35");
    assert.match(await p.locator("#source-caption").textContent(), /p.7/);
    await c.close();
    const snap = await browser.newContext({ serviceWorkers: "block", acceptDownloads: true }),
      sp = await snap.newPage();
    await sp.goto(base);
    await text(sp, "#source-status", /^Verified/);
    heldFile = "sources/choisy-015.jpg";
    const pending = sp.waitForEvent("download");
    await sp.locator("#save-reading").click();
    await until(() => held.length === 1);
    await sp.locator("#side-inclusive").check();
    await sp.locator("#first-five").check();
    await text(sp, "#width-result", /^55 feet/);
    await text(sp, "#height-result", /observed/);
    await release();
    const d = await pending;
    const file = path.join(out, `${name}-snapshot.html`);
    await d.saveAs(file);
    const html = await readFile(file, "utf8");
    const match = html.match(
      /download="syngraphe-plan.json" href="data:application\/json;charset=utf-8,([^"]+)"/,
    );
    assert(match);
    const saved = JSON.parse(decodeURIComponent(match[1]));
    assert.equal(saved.state.side, "clear");
    assert.equal(saved.state.first, 4);
    assert.equal(saved.state.capital, 16);
    assert(html.includes("Model width 60½ ft"));
    await snap.close();
    corrupt = true;
    const bad = await browser.newContext({ acceptDownloads: true }),
      bp = await bad.newPage();
    let downloads = 0;
    bp.on("download", () => downloads++);
    await bp.goto(base);
    await bp.locator("#source-page").selectOption("37");
    await text(bp, "#source-status", /does not match this edition/);
    assert.equal(await bp.locator("#source-image").isVisible(), false);
    await bp.locator("#save-reading").click();
    await text(bp, "#save-status", /does not match this edition/);
    assert.equal(downloads, 0);
    await text(bp, "#offline", /could not be saved|not saved offline/);
    assert.doesNotMatch(await bp.locator("#offline").textContent(), /^Edition ready/);
    corrupt = false;
    await bp.locator("#source-retry").click();
    await text(bp, "#source-status", /^Verified/);
    await bp.evaluate(() => window.dispatchEvent(new Event("online")));
    await text(bp, "#offline", /^Edition ready offline/);
    const good = bp.waitForEvent("download");
    await bp.locator("#save-reading").click();
    await (await good).saveAs(path.join(out, `${name}-recovered.html`));
    await bad.close();
    report.configurations.push({
      engine: name,
      version: browser.version(),
      latePageCannotReplaceSelection: true,
      exportCapturesInitialSettings: true,
      http200WrongPageRefused: true,
      corruptExportDownloads: 0,
      corruptEditionCannotClaimReadiness: true,
      recoveryWithValidPage: true,
    });
  } finally {
    await release();
    await browser.close();
    await new Promise((r) => {
      server.closeAllConnections();
      server.close(r);
    });
  }
}
await writeFile(path.join(out, "review.json"), JSON.stringify(report, null, 2) + "\n");
