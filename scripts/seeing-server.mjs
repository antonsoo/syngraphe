import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";

export async function serve(directory = "dist") {
  let root = directory;
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://local");
    const file = url.pathname.slice("/syngraphe/".length) || "index.html";
    if (!url.pathname.startsWith("/syngraphe/") || file.includes(".."))
      return res.writeHead(404).end();
    try {
      const bytes = await readFile(path.join(root, file));
      res
        .writeHead(200, {
          "Content-Type":
            {
              ".html": "text/html",
              ".js": "text/javascript",
              ".css": "text/css",
              ".json": "application/json",
              ".jpg": "image/jpeg",
              ".svg": "image/svg+xml",
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
    use: (directory) => {
      root = directory;
    },
    stop: () =>
      new Promise((resolve) => {
        server.closeAllConnections();
        server.close(resolve);
      }),
  };
}
