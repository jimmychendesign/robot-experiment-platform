import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the RobotOps application shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>RobotOps · 实验运营控制台<\/title>/i);
  assert.match(html, /实验管理员控制台/);
  assert.match(html, /实验需求方控制台/);
  assert.match(html, /实验员控制台/);
  assert.match(html, /跳到主要内容/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("keeps the local design-system palette centralized and token-driven", async () => {
  const [layout, adapter, tokens, platform, globals] = await Promise.all([
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/design-system/index.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/design-system/axis.css", import.meta.url), "utf8"),
    readFile(new URL("../app/design-system/platform.css", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);
  assert.match(layout, /design-system\/axis\.css/);
  assert.match(layout, /design-system\/platform\.css/);
  assert.match(adapter, /export function (Button|Badge|Tabs|MetricCard|DrawerFrame)/);
  assert.match(tokens, /--background-primary:var\(--axis-gray-0\)/);
  assert.match(tokens, /--color-brand-600:#1570ef/);
  assert.match(tokens, /--color-error-600:#d92d20/);
  assert.match(tokens, /--color-warning-500:#f79009/);
  assert.match(tokens, /--color-success-500:#66c61c/);
  assert.match(tokens, /--color-violet-600:#7839ee/);
  assert.match(tokens, /\[data-theme="dark"\]/);
  assert.match(platform, /--workspace-content-max/);
  assert.doesNotMatch(`${platform}\n${globals}`, /#[0-9a-f]{3,8}\b|rgba?\(/i);
  assert.match(tokens, /prefers-reduced-motion/);
});
