import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, extname, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const releaseRoot = dirname(fileURLToPath(import.meta.url));
const portArgumentIndex = process.argv.indexOf("--port");
const port = Number(portArgumentIndex >= 0 ? process.argv[portArgumentIndex + 1] : process.env.PORT || 8000);
const host = "127.0.0.1";

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

function resolveRequestPath(urlValue) {
  const pathname = decodeURIComponent(new URL(urlValue, `http://${host}:${port}`).pathname);
  const relativePath = pathname === "/" ? "index.html" : normalize(pathname).replace(/^[/\\]+/, "");
  const candidate = resolve(releaseRoot, relativePath);
  return candidate === releaseRoot || candidate.startsWith(`${releaseRoot}${sep}`) ? candidate : null;
}

const server = createServer((request, response) => {
  const filePath = resolveRequestPath(request.url || "/");
  if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "content-type": contentTypes[extname(filePath)] || "application/octet-stream",
    "cache-control": filePath.endsWith("index.html") ? "no-cache" : "public, max-age=3600",
  });
  createReadStream(filePath).pipe(response);
});

server.listen(port, host, () => {
  console.log(`RobotOps portable release: http://${host}:${port}/`);
  console.log("Press Ctrl+C to stop.");
});
