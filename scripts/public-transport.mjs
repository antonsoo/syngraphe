import assert from "node:assert/strict";
import { createServer } from "node:http";
import { connect } from "node:net";

/** Forward unchanged TLS bytes, then make the real origin unreachable to all
 * browser traffic, including workers that bypass page-level offline emulation. */
export async function publicTransport(base) {
  const host = new URL(base).hostname;
  const sockets = new Set();
  let unavailable = false,
    refused = 0;
  const server = createServer((_req, res) => res.writeHead(502).end());
  server.on("connect", (request, client, head) => {
    if (unavailable) {
      refused++;
      client.end("HTTP/1.1 503 Offline review\r\n\r\n");
      return;
    }
    if (request.url !== `${host}:443`) {
      client.end("HTTP/1.1 403 Forbidden\r\n\r\n");
      return;
    }
    const upstream = connect(443, host);
    for (const socket of [client, upstream]) {
      sockets.add(socket);
      socket.on("close", () => sockets.delete(socket));
    }
    client.on("error", () => upstream.destroy());
    upstream.on("error", () => client.destroy());
    client.on("close", () => upstream.destroy());
    upstream.on("close", () => client.destroy());
    upstream.on("connect", () => {
      if (unavailable) {
        client.destroy();
        upstream.destroy();
        return;
      }
      client.write("HTTP/1.1 200 Connection Established\r\n\r\n");
      if (head.length) upstream.write(head);
      client.pipe(upstream);
      upstream.pipe(client);
    });
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  return {
    proxy: { server: `http://127.0.0.1:${server.address().port}` },
    cut() {
      unavailable = true;
      for (const socket of sockets) socket.destroy();
    },
    restore() {
      unavailable = false;
    },
    async proveUnavailable(browser) {
      assert(unavailable);
      const before = refused;
      const context = await browser.newContext({ serviceWorkers: "block" });
      try {
        const page = await context.newPage();
        await assert.rejects(() =>
          page.goto(base, { timeout: 7000, waitUntil: "domcontentloaded" }),
        );
        assert(refused > before, "The transport must actually refuse a fresh connection.");
        return { workerFreeFreshNavigationFailed: true, refusedConnections: refused - before };
      } finally {
        await context.close();
      }
    },
    async close() {
      for (const socket of sockets) socket.destroy();
      server.closeAllConnections();
      await new Promise((done) => server.close(done));
    },
  };
}
