/* Offline edition 8cced834afa81c29f1162208a0995b5f8a518ffa71f97fbd82172731f2fed45b. Generated from the complete build. */
const CACHE = "syngraphe-8cced834afa81c29f1162208a0995b5f8a518ffa71f97fbd82172731f2fed45b";
const EDITION = "8cced834afa81c29f1162208a0995b5f8a518ffa71f97fbd82172731f2fed45b";
const BASE = "/syngraphe/";
const FILES = ["/syngraphe/LICENSE.txt","/syngraphe/assets/index-Brd7SAOb.css","/syngraphe/assets/index-C8byUmw5.js","/syngraphe/fonts/NotoSerif-Regular.ttf","/syngraphe/fonts/OFL.txt","/syngraphe/icon.svg","/syngraphe/index.html","/syngraphe/manifest.webmanifest","/syngraphe/sources/choisy-015.jpg","/syngraphe/sources/choisy-033.jpg","/syngraphe/sources/choisy-034.jpg","/syngraphe/sources/choisy-035.jpg","/syngraphe/sources/choisy-036.jpg","/syngraphe/sources/choisy-037.jpg","/syngraphe/sources/choisy-046.jpg","/syngraphe/sources/choisy-047.jpg","/syngraphe/sources/choisy-073.jpg","/syngraphe/sources/choisy-075.jpg","/syngraphe/sources/manifest.json"];
const INTEGRITY = {"/syngraphe/LICENSE.txt":"sha256-4mFEvoZz1pwXUSatjc2e14QxRk8LlxILeZ3HXsfttkc=","/syngraphe/assets/index-Brd7SAOb.css":"sha256-O6KIPA1IbSFWkAZeIwzLwqSvotxb1T6Li5emPuvFuYs=","/syngraphe/assets/index-C8byUmw5.js":"sha256-bcCWeuou+t5WmFWpNT52wnzsPNBX1T+VhBfKiWPXDu0=","/syngraphe/fonts/NotoSerif-Regular.ttf":"sha256-VHPS5DvdAY7hJKSt26gJH9CimJSxIcu3QQI69lSWYrY=","/syngraphe/fonts/OFL.txt":"sha256-zumJL58MyP6ILJ6VN+5qiWIdhu586vcLAuKyscJcBho=","/syngraphe/icon.svg":"sha256-wMIH1bH3wTR1hIECDlL3ATTXgFDq9JbeJnDKax6lHfg=","/syngraphe/index.html":"sha256-ZBSBR60/gzLykbBq+7HdQkfg8H1j5KHSJPRwQiYlrAM=","/syngraphe/manifest.webmanifest":"sha256-uKURYd7OPfqLG7rh4H2o2rvasNn+tJh0OK/K3sj0SVc=","/syngraphe/sources/choisy-015.jpg":"sha256-6+9I+kTaDBXLjq6ABogoH2C+vv9BI9RsjStZIOYmJxc=","/syngraphe/sources/choisy-033.jpg":"sha256-6YX5SAaXYvTvILkJLFXbUGKAYNKlu5r/FIpuczlNAFk=","/syngraphe/sources/choisy-034.jpg":"sha256-ox5uFTF5CvX5grNbrjvINiB4IpAPXi6AjiCC3Jx3W8E=","/syngraphe/sources/choisy-035.jpg":"sha256-FslZIiDspmo9gzXsV7Meru3hfOrZIeXOV8y8QzY237I=","/syngraphe/sources/choisy-036.jpg":"sha256-zP8D3PXj/gQXVWktvH36QJMl42BdWmzWrQxWTJvBoAE=","/syngraphe/sources/choisy-037.jpg":"sha256-CKP1fehOfVA6ccVcSxjmbLL+WbrKqOHsJ9fvEqRS4R8=","/syngraphe/sources/choisy-046.jpg":"sha256-Qz1MjLG87xDtmFMUf892fpGdnwKZIIySgxceTCNaqmA=","/syngraphe/sources/choisy-047.jpg":"sha256-/p7wlhrb7lwHVDput46dd6zKivoWF4k6L5jd5aFc6E4=","/syngraphe/sources/choisy-073.jpg":"sha256-yfJlWeX7pm/6ez3Cej3fUgzHM5g9ySXKly5Dckppcog=","/syngraphe/sources/choisy-075.jpg":"sha256-6qOmFFO88Av3fZIdQdnQb10T/oqts9pmCw2SCaxh2O4=","/syngraphe/sources/manifest.json":"sha256-yX0UAr6I39ElFPejfjkeahKN+w0xDV/CCEQj+MHT0V0="};
self.addEventListener("install", event => {
  // HTTP success does not establish edition identity. A stale entry page or
  // substituted scan must fail the complete install before this worker activates.
  const requests = FILES.map(url => new Request(url, { cache: "reload", integrity: INTEGRITY[url] }));
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(requests)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("syngraphe-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("message", event => {
  if (event.data?.type === "SYNGRAPHE_CLAIM_EDITION" && event.data.edition === EDITION) {
    event.waitUntil(self.clients.claim());
    return;
  }
  if (event.data?.type !== "SYNGRAPHE_INSPECT_EDITION" || !event.ports[0]) return;
  // Inspection must not recreate a deleted or retired edition cache.
  event.waitUntil(Promise.all(FILES.map(file => caches.match(file, { cacheName: CACHE }))).then(saved => {
    event.ports[0].postMessage({ type: "SYNGRAPHE_EDITION", edition: EDITION, complete: saved.every(Boolean) });
  }).catch(() => event.ports[0].postMessage({ type: "SYNGRAPHE_EDITION", edition: EDITION, complete: false })));
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  if (event.request.mode === "navigate") {
    const page = url.pathname === BASE ? BASE + "index.html" : url.pathname;
    event.respondWith(fetch(event.request).catch(() => caches.open(CACHE).then(async cache => (await cache.match(page)) || Response.error())));
  } else if (FILES.includes(url.pathname)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(url.pathname)).then(cached => cached || fetch(event.request)));
  }
});
