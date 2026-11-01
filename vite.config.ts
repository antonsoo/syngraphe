import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { defineConfig } from "vite";

const base = "/syngraphe/";

async function filesIn(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? filesIn(path.join(directory, entry.name))
        : Promise.resolve([path.join(directory, entry.name)]),
    ),
  );
  return nested.flat();
}

export default defineConfig(async ({ command }) => {
  const inputFiles = [
    ...(await filesIn("src")),
    ...(await filesIn("public")),
    "index.html",
    "seeing.html",
    "LICENSE",
    "vite.config.ts",
    "tsconfig.json",
    "package.json",
    "package-lock.json",
  ].sort();
  const inputHash = createHash("sha256");
  for (const file of inputFiles) {
    inputHash.update(file);
    inputHash.update(await readFile(file));
  }
  const edition = command === "build" ? inputHash.digest("hex") : "development";
  const studyFiles: Record<string, { bytes: number; sha256: string }> = {};
  const sourceManifest = JSON.parse(await readFile("public/sources/manifest.json", "utf8"));
  for (const page of sourceManifest.pages) {
    const file = `sources/${page.file}`;
    const bytes = await readFile(`public/${file}`);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    if (bytes.length !== page.bytes || sha256 !== page.sha256)
      throw new Error(
        `Source manifest does not match ${file}. Review the source identity before building.`,
      );
    studyFiles[file] = { bytes: bytes.length, sha256 };
  }
  for (const file of ["fonts/NotoSerif-Regular.ttf", "fonts/OFL.txt", "LICENSE.txt"]) {
    const bytes = await readFile(`public/${file}`);
    studyFiles[file] = {
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
  }
  return {
    base,
    build: { rollupOptions: { input: { index: "index.html", seeing: "seeing.html" } } },
    define: {
      __EDITION__: JSON.stringify(edition),
      __SOURCE_FILES__: JSON.stringify(studyFiles),
      __SOURCE_MANIFEST__: JSON.stringify(sourceManifest),
    },
    plugins: [
      {
        name: "offline-book",
        apply: "build",
        async closeBundle() {
          const files = (await filesIn("dist")).filter((f) => !f.endsWith("sw.js")).sort();
          const urls = files.map(
            (file) => base + path.relative("dist", file).split(path.sep).join("/"),
          );
          const integrity = Object.fromEntries(
            await Promise.all(
              files.map(async (file, index) => [
                urls[index],
                `sha256-${createHash("sha256")
                  .update(await readFile(file))
                  .digest("base64")}`,
              ]),
            ),
          );
          await writeFile(
            "dist/sw.js",
            `/* Offline edition ${edition}. Generated from the complete build. */
const CACHE = "syngraphe-${edition}";
const EDITION = ${JSON.stringify(edition)};
const BASE = ${JSON.stringify(base)};
const FILES = ${JSON.stringify(urls)};
const INTEGRITY = ${JSON.stringify(integrity)};
let repair;
async function complete() {
  // Presence alone cannot establish that a retained scan belongs to this edition.
  return (await Promise.all(FILES.map(async file => {
    const saved = await caches.match(file, { cacheName: CACHE });
    if (!saved?.ok) return false;
    const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", await saved.arrayBuffer()));
    return "sha256-" + btoa(String.fromCharCode(...digest)) === INTEGRITY[file];
  }))).every(Boolean);
}
async function save() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  try {
    const cache = await caches.open(CACHE);
    const requests = FILES.map(url => new Request(url, { cache: "reload", integrity: INTEGRITY[url], signal: controller.signal }));
    // addAll commits the complete batch only when every response passes integrity.
    await cache.addAll(requests);
  } finally { clearTimeout(timeout); }
}
self.addEventListener("install", event => {
  // HTTP success does not establish edition identity. A stale entry page or
  // substituted scan must fail the complete install before this worker activates.
  event.waitUntil(save().then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("syngraphe-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("message", event => {
  if (event.data?.type === "SYNGRAPHE_CLAIM_EDITION" && event.data.edition === EDITION) {
    event.waitUntil(self.clients.claim());
    return;
  }
  const type = event.data?.type;
  if (!["SYNGRAPHE_INSPECT_EDITION", "SYNGRAPHE_REPAIR_EDITION"].includes(type) || !event.ports[0]) return;
  const reply = () => complete().then(saved => event.ports[0].postMessage({ type: "SYNGRAPHE_EDITION", edition: EDITION, complete: saved }));
  // Repairs coalesce across tabs and never silently repair a different page edition.
  if (type === "SYNGRAPHE_REPAIR_EDITION" && event.data.edition === EDITION) {
    if (!repair) repair = save().catch(() => {}).finally(() => { repair = null; });
    event.waitUntil(repair.then(reply).catch(() => event.ports[0].postMessage({ type: "SYNGRAPHE_EDITION", edition: EDITION, complete: false })));
  } else {
    // Inspection must not recreate a deleted or retired edition cache.
    event.waitUntil(reply().catch(() => event.ports[0].postMessage({ type: "SYNGRAPHE_EDITION", edition: EDITION, complete: false })));
  }
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  if (event.request.mode === "navigate") {
    const page = url.pathname === BASE ? BASE + "index.html" : url.pathname;
    event.respondWith(fetch(event.request).then(async response => {
      // A reachable host can still fail. Keep a retained room readable during
      // an HTTP error, as well as when the connection itself is unavailable.
      return response.ok ? response : (await caches.match(page, { cacheName: CACHE })) || response;
    }).catch(() => caches.match(page, { cacheName: CACHE }).then(saved => saved || Response.error())));
  } else if (FILES.includes(url.pathname)) {
    event.respondWith(caches.match(url.pathname, { cacheName: CACHE }).then(cached => cached || fetch(event.request)));
  }
});
`,
          );
        },
      },
    ],
  };
});
