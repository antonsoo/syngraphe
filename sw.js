/* Offline edition 3040f82790c94bbb4d681243d5fa0aa27111ed04772d9e5e5d8b173a0dea15ba. Generated from the complete build. */
const CACHE = "syngraphe-3040f82790c94bbb4d681243d5fa0aa27111ed04772d9e5e5d8b173a0dea15ba";
const EDITION = "3040f82790c94bbb4d681243d5fa0aa27111ed04772d9e5e5d8b173a0dea15ba";
const BASE = "/syngraphe/";
const FILES = ["/syngraphe/LICENSE.txt","/syngraphe/assets/index-CpGdod8o.js","/syngraphe/assets/seeing-DM7ktX5e.js","/syngraphe/assets/seeing-xll1RZI1.css","/syngraphe/assets/source-view-CXC0zelf.js","/syngraphe/assets/source-view-Cy7XrlA8.css","/syngraphe/fonts/NotoSerif-Regular.ttf","/syngraphe/fonts/OFL.txt","/syngraphe/icon.svg","/syngraphe/index.html","/syngraphe/manifest.webmanifest","/syngraphe/seeing.html","/syngraphe/sources/choisy-015.jpg","/syngraphe/sources/choisy-033.jpg","/syngraphe/sources/choisy-034.jpg","/syngraphe/sources/choisy-035.jpg","/syngraphe/sources/choisy-036.jpg","/syngraphe/sources/choisy-037.jpg","/syngraphe/sources/choisy-040.jpg","/syngraphe/sources/choisy-041.jpg","/syngraphe/sources/choisy-046.jpg","/syngraphe/sources/choisy-047.jpg","/syngraphe/sources/choisy-073.jpg","/syngraphe/sources/choisy-075.jpg","/syngraphe/sources/manifest.json"];
const INTEGRITY = {"/syngraphe/LICENSE.txt":"sha256-9M7EZANRTiYB87kXrTa/yM2abZc1msL5u1VNIGKiUes=","/syngraphe/assets/index-CpGdod8o.js":"sha256-3tZpRGcsnzMxxf8y7tXNh+NcJsDoxKWIeleSmUuiKA4=","/syngraphe/assets/seeing-DM7ktX5e.js":"sha256-NRHr84rPF/o3SWKJqb6wKw4wRjZF4cISbEyvbvW/mWc=","/syngraphe/assets/seeing-xll1RZI1.css":"sha256-Gf0L0xDcYO4s5VKt3XqwRI8EYwHXoA8csPUJXhLa2w8=","/syngraphe/assets/source-view-CXC0zelf.js":"sha256-oSS9qjXWdyQKPR67GG3snAnUSx9phsPpCmdvtnO9068=","/syngraphe/assets/source-view-Cy7XrlA8.css":"sha256-pv+r4WyAxJTTeo9nBiDYwqFlBhi6Ie9tu4rT/fghVmk=","/syngraphe/fonts/NotoSerif-Regular.ttf":"sha256-VHPS5DvdAY7hJKSt26gJH9CimJSxIcu3QQI69lSWYrY=","/syngraphe/fonts/OFL.txt":"sha256-zumJL58MyP6ILJ6VN+5qiWIdhu586vcLAuKyscJcBho=","/syngraphe/icon.svg":"sha256-wMIH1bH3wTR1hIECDlL3ATTXgFDq9JbeJnDKax6lHfg=","/syngraphe/index.html":"sha256-+69IwCeHGCuUY1lyNxxkafAnx3QrRCT0kLr2DZL4vqo=","/syngraphe/manifest.webmanifest":"sha256-uKURYd7OPfqLG7rh4H2o2rvasNn+tJh0OK/K3sj0SVc=","/syngraphe/seeing.html":"sha256-S3j+VFrxExGprF8hkhj+6laNE65T/4Th1n0zNiGGpls=","/syngraphe/sources/choisy-015.jpg":"sha256-6+9I+kTaDBXLjq6ABogoH2C+vv9BI9RsjStZIOYmJxc=","/syngraphe/sources/choisy-033.jpg":"sha256-6YX5SAaXYvTvILkJLFXbUGKAYNKlu5r/FIpuczlNAFk=","/syngraphe/sources/choisy-034.jpg":"sha256-ox5uFTF5CvX5grNbrjvINiB4IpAPXi6AjiCC3Jx3W8E=","/syngraphe/sources/choisy-035.jpg":"sha256-FslZIiDspmo9gzXsV7Meru3hfOrZIeXOV8y8QzY237I=","/syngraphe/sources/choisy-036.jpg":"sha256-zP8D3PXj/gQXVWktvH36QJMl42BdWmzWrQxWTJvBoAE=","/syngraphe/sources/choisy-037.jpg":"sha256-CKP1fehOfVA6ccVcSxjmbLL+WbrKqOHsJ9fvEqRS4R8=","/syngraphe/sources/choisy-040.jpg":"sha256-1Y/wxOk49cq3oZ6lFXmYC0FVNpBgnFxAseQ6PQV9RTg=","/syngraphe/sources/choisy-041.jpg":"sha256-WSyPTyRuDXfjfPrtuVSECoYXheM2DbdvmsvNPEaKnE8=","/syngraphe/sources/choisy-046.jpg":"sha256-Qz1MjLG87xDtmFMUf892fpGdnwKZIIySgxceTCNaqmA=","/syngraphe/sources/choisy-047.jpg":"sha256-/p7wlhrb7lwHVDput46dd6zKivoWF4k6L5jd5aFc6E4=","/syngraphe/sources/choisy-073.jpg":"sha256-yfJlWeX7pm/6ez3Cej3fUgzHM5g9ySXKly5Dckppcog=","/syngraphe/sources/choisy-075.jpg":"sha256-6qOmFFO88Av3fZIdQdnQb10T/oqts9pmCw2SCaxh2O4=","/syngraphe/sources/manifest.json":"sha256-TVLVxi3PrPEf4+WTfGWAgMxQ+fzajhXcZvAxr5ErUgQ="};
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
