import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

/** One shared budget across every response, rather than per-connection speed. */
export async function slowServer(directory = "dist") {
  const queue = [];
  let unlimited = false,
    sent = 0;
  const send = (task, size) => {
    if (task.res.destroyed) return;
    const end = Math.min(task.at + size, task.bytes.length);
    task.res.write(task.bytes.subarray(task.at, end));
    sent += end - task.at;
    task.at = end;
    if (end === task.bytes.length) task.res.end();
    else queue.push(task);
  };
  const timer = setInterval(() => {
    const task = queue.shift();
    if (task) send(task, 8192);
  }, 64);
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://local");
    if (!url.pathname.startsWith("/syngraphe/") || url.pathname.includes(".."))
      return res.writeHead(404).end();
    const file = url.pathname.slice("/syngraphe/".length) || "index.html";
    try {
      const bytes = await readFile(path.join(directory, file));
      res.writeHead(200, {
        "Cache-Control": "no-store",
        "Content-Type":
          {
            ".html": "text/html",
            ".js": "text/javascript",
            ".css": "text/css",
            ".jpg": "image/jpeg",
            ".ttf": "font/ttf",
            ".json": "application/json",
            ".txt": "text/plain",
          }[path.extname(file)] ?? "application/octet-stream",
      });
      const task = { res, bytes, at: 0 };
      if (unlimited) send(task, bytes.length);
      else queue.push(task);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  return {
    base: `http://127.0.0.1:${server.address().port}/syngraphe/`,
    bytesPerSecond: 128000,
    sent: () => sent,
    fast() {
      unlimited = true;
      for (const task of queue.splice(0)) send(task, task.bytes.length);
    },
    async stop() {
      clearInterval(timer);
      server.closeAllConnections();
      await new Promise((done) => server.close(done));
    },
  };
}
