import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { get } from "node:http";
import { fileURLToPath } from "node:url";

const file = (path) => fileURLToPath(new URL(path, import.meta.url));
function requestWithHost(url, host) {
  return new Promise((resolve, reject) => {
    get(url, { headers: { Host: host } }, (response) => {
      response.resume();
      resolve({ status: response.statusCode, headers: response.headers });
    }).on("error", reject);
  });
}
async function freePort() {
  const server = createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = server.address().port;
  await new Promise((r) => server.close(r));
  return port;
}
async function run(t, path, args = [], env = {}) {
  const child = spawn(process.execPath, [file(path), ...args], {
    env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  child.stdout.on("data", (b) => { output += b; });
  child.stderr.on("data", (b) => { output += b; });
  const done = once(child, "close");
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) child.kill();
    await done;
  });
  return { child, done, output: () => output };
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function childFailure(proc, message) {
  return new Error(`${message}; child exit=${proc.child.exitCode} signal=${proc.child.signalCode}\n${proc.output()}`);
}
async function assertRunning(proc, message) {
  if (proc.child.exitCode !== null || proc.child.signalCode !== null) {
    await proc.done; // close follows drained stdout/stderr.
    throw childFailure(proc, message);
  }
}
async function waitForOutput(proc, pattern) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    await assertRunning(proc, `Process exited before reporting ${pattern}`);
    const match = proc.output().match(pattern);
    if (match) return match;
    await sleep(25);
  }
  throw childFailure(proc, `Process did not report ${pattern}`);
}
async function ready(proc, url) {
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    await assertRunning(proc, `Listener unavailable: ${url}`);
    try {
      const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(300) });
      await assertRunning(proc, `Listener process exited: ${url}`);
      return response;
    } catch {
      await assertRunning(proc, `Listener unavailable: ${url}`);
      await sleep(50);
    }
  }
  throw childFailure(proc, `Listener never became ready: ${url}`);
}
test("Week 1 loopback stub and deliberate TCP reset are distinct", async (t) => {
  const port = await freePort();
  const stub = await run(t, "./campuspulse-stub.mjs", ["127.0.0.1", String(port)]);
  assert.equal((await ready(stub, `http://127.0.0.1:${port}/healthz`)).status, 200);
  const resetPort = await freePort();
  const reset = await run(t, "./abort-server.mjs", [String(resetPort)]);
  await waitForOutput(reset, /listening/);
  await assert.rejects(fetch(`http://127.0.0.1:${resetPort}/`, { signal: AbortSignal.timeout(2000) }));
});
test("Week 2 fault fixtures preserve Host, redirect and forwarded-protocol defects", async (t) => {
  const fixtures = await Promise.all([0, 1].map(() =>
    run(t, "../../week02/samples/http-faults/fault-server.mjs", ["--port", "0"])));
  const mappings = await Promise.all(fixtures.map(async (proc) =>
    JSON.parse((await waitForOutput(proc, /^PORTS (.+)$/m))[1])));
  const allocated = mappings.flatMap((mapping) => Object.values(mapping));
  assert.equal(new Set(allocated).size, 8);
  assert.ok(allocated.every((port) => Number.isInteger(port) && port > 0 && port <= 65535));
  const ports = mappings[0];
  const url = `http://127.0.0.1:${ports.fault1}`;
  assert.equal((await ready(fixtures[0], url)).status, 404);
  assert.equal((await requestWithHost(url, "status.campuspulse.example")).status, 200);
  const redirect = await fetch(`http://127.0.0.1:${ports.fault2}/legacy`, { redirect: "manual" });
  assert.equal(redirect.status, 302);
  assert.equal(new URL(redirect.headers.get("location")).port, String(ports.fault2));
  const loop = await requestWithHost(`http://127.0.0.1:${ports.fault2}/`, "campuspulse.example");
  assert.equal(loop.status, 301);
  assert.equal(loop.headers.location, `http://www.campuspulse.example:${ports.fault2}/`);
  assert.equal((await fetch(`http://127.0.0.1:${ports.fault2}/legacy`, { method: "POST", body: "synthetic" })).status, 405);
  assert.equal((await fetch(`http://127.0.0.1:${ports.fault3}/`, { headers: { "X-Forwarded-Proto": "https" } })).status, 200);
  const proxy = await fetch(`http://127.0.0.1:${ports.proxy}/`, { redirect: "manual" });
  assert.equal(proxy.status, 301);
  assert.equal(proxy.headers.get("x-app-saw-xfp"), "(absent)");
  assert.equal(new URL(proxy.headers.get("location")).port, String(ports.proxy));
  assert.equal((await ready(fixtures[1], `http://127.0.0.1:${mappings[1].proxy}/`)).status, 301);
});
test("Week 2 invalid port ranges fail with captured startup diagnostics", async (t) => {
  for (const value of ["65533", "65535", "-1", "1.5", "invalid"]) {
    const proc = await run(t, "../../week02/samples/http-faults/fault-server.mjs", ["--port", value]);
    await assert.rejects(waitForOutput(proc, /^PORTS (.+)$/m), /child exit=1[\s\S]*--port must be 0/);
  }
});
test("Readiness surfaces an owned listener collision without stopping its owner", async (t) => {
  const blocker = createServer();
  blocker.listen(0, "127.0.0.1");
  await once(blocker, "listening");
  t.after(() => new Promise((resolve) => blocker.close(resolve)));
  const port = blocker.address().port;
  const proc = await run(t, "./campuspulse-stub.mjs", ["127.0.0.1", String(port)]);
  await proc.done;
  await assert.rejects(ready(proc, `http://127.0.0.1:${port}/healthz`), /child exit=1[\s\S]*EADDRINUSE/);
  assert.equal(blocker.listening, true);
});
test("Week 3 reference API and lifecycle teaching page run on loopback", async (t) => {
  const port = await freePort();
  const api = await run(t, "../../week03/samples/campuspulse-api/src/server.ts", [], { PORT: String(port) });
  const base = `http://127.0.0.1:${port}`;
  assert.equal((await ready(api, base + "/healthz")).status, 200);
  const page = await (await fetch(base + "/api/incidents?service=print-queue")).json();
  assert.equal(page.incidents.length, 1);
  assert.equal(page.incidents[0].service, "print-queue");
  assert.equal((await fetch(base + "/api/incidents", { method: "POST" })).status, 405);
  assert.equal((await fetch(base + "/missing")).status, 404);
  const demoPort = await freePort();
  const lifecycle = await run(t, "../../week03/samples/incident-feed/lifecycle-demo.mjs", [String(demoPort)]);
  const demo = `http://127.0.0.1:${demoPort}`;
  assert.equal((await ready(lifecycle, demo)).status, 200);
  assert.equal((await fetch(demo + "/react.js")).status, 200);
  assert.equal((await fetch(demo + "/react-dom.js")).status, 200);
  assert.equal((await (await fetch(demo + "/api/incidents")).json()).incidents.length, 1);
});
test("Week 4 live health gate passes, waits for rolling release, and fails after rollback", async (t) => {
  for (const args of [[], ["--rolling"], ["--broken"]]) {
    const port = await freePort();
    const proc = await run(t, "../../week04/samples/deploy-sim.mjs", [...args, "--port", String(port)]);
    const [code] = await proc.done;
    assert.equal(code, args.includes("--broken") ? 1 : 0);
    assert.match(proc.output(), /SIMULATED build\/test gate/);
    if (args.includes("--rolling")) assert.match(proc.output(), /WAIT old release answering/);
    if (args.includes("--broken")) assert.match(proc.output(), /service is serving again/);
  }
});
test("Week 5 validators, cache hits and unsafe-method forwarding work", async (t) => {
  const originPort = await freePort();
  const edgePort = await freePort();
  const originProcess = await run(t, "../../week05/samples/origin.mjs", [], { PORT: String(originPort), LEAK: "0" });
  const origin = `http://127.0.0.1:${originPort}`;
  await ready(originProcess, origin + "/healthz");
  const edgeProcess = await run(t, "../../week05/samples/edge.mjs", [], { PORT: String(edgePort), ORIGIN_PORT: String(originPort), CACHE_KEY: "conservative" });
  const edge = `http://127.0.0.1:${edgePort}`;
  await ready(edgeProcess, edge + "/healthz");
  const first = await fetch(edge + "/api/status");
  assert.equal(first.headers.get("x-cache-status"), "MISS");
  assert.equal((await fetch(edge + "/api/status")).headers.get("x-cache-status"), "HIT");
  const conditional = await fetch(origin + "/api/status", { headers: { "If-None-Match": first.headers.get("etag") } });
  assert.equal(conditional.status, 304);
  assert.equal(await conditional.text(), "");
  assert.equal((await fetch(origin + "/api/status", { headers: { "If-None-Match": "*" } })).status, 304);
  const bump = await fetch(edge + "/admin/bump", { method: "POST", body: "practice body" });
  assert.equal(bump.headers.get("x-cache-status"), "BYPASS");
  assert.equal(bump.status, 200);
  const secondBump = await fetch(edge + "/admin/bump", { method: "POST", body: "practice body" });
  assert.equal((await secondBump.json()).revision, 3);
  const dateOnly = await fetch(origin + "/api/status", { headers: { "If-Modified-Since": first.headers.get("last-modified") } });
  assert.equal(dateOnly.status, 200);
  for (const sid of ["sid-alice", "sid-bob"]) {
    const account = await fetch(edge + "/account", { headers: { Cookie: `sid=${sid}` } });
    assert.equal(account.headers.get("x-cache-status"), "BYPASS");
    assert.match(await account.text(), sid === "sid-alice" ? /Alice/ : /Bob/);
  }
  await fetch(edge + "/api/feed");
  await new Promise((r) => setTimeout(r, 11_050));
  originProcess.child.kill();
  await originProcess.done;
  assert.equal((await fetch(edge + "/api/feed")).headers.get("x-cache-status"), "STALE");
  assert.equal((await fetch(edge + "/api/status")).status, 504);
});
test("Week 5 deliberate leak still reproduces only in explicitly faulty mode", async (t) => {
  const originPort = await freePort();
  const edgePort = await freePort();
  const originProcess = await run(t, "../../week05/samples/origin.mjs", [], { PORT: String(originPort), LEAK: "1" });
  await ready(originProcess, `http://127.0.0.1:${originPort}/healthz`);
  const edgeProcess = await run(t, "../../week05/samples/edge.mjs", [], { PORT: String(edgePort), ORIGIN_PORT: String(originPort), CACHE_KEY: "vary-only" });
  const edge = `http://127.0.0.1:${edgePort}`;
  await ready(edgeProcess, edge + "/healthz");
  await fetch(edge + "/account", { headers: { Cookie: "sid=sid-alice" } });
  const leaked = await fetch(edge + "/account", { headers: { Cookie: "sid=sid-bob" } });
  assert.equal(leaked.headers.get("x-cache-status"), "HIT");
  assert.match(await leaked.text(), /Alice/);
  assert.equal((await fetch(edge + "/account", { method: "PURGE" })).status, 200);
  assert.match(await (await fetch(edge + "/account", { headers: { Cookie: "sid=sid-bob" } })).text(), /Bob/);
});
test("Week 5 RUM pilot validates metrics and deduplicates updates", async (t) => {
  const port = await freePort();
  const collector = await run(t, "../../week05/samples/rum-collector.mjs", ["--port", String(port)]);
  const base = `http://127.0.0.1:${port}`;
  await ready(collector, base + "/results");
  const send = (row) => fetch(base + "/api/vitals", { method: "POST",
    headers: { "Content-Type": "application/json" }, body: JSON.stringify(row) });
  const row = { name: "LCP", id: "metric-1", pageViewId: "page-1", value: 1200, url: "/?secret=not-collected" };
  assert.equal((await send(row)).status, 202);
  assert.equal((await send({ ...row, value: 1500 })).status, 202);
  assert.equal((await send({ ...row, value: -1 })).status, 400);
  const data = await (await fetch(base + "/results")).json();
  assert.equal(data.summary.LCP.n, 1);
  assert.equal(data.summary.LCP.p75, 1500);
  assert.equal("url" in data.rows[0], false);
});
