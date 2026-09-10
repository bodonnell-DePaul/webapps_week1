#!/usr/bin/env node
/**
 * CSC 436 — Week 1 lab — the smallest possible CampusPulse.
 *
 * Five lines of behaviour, so that when something does not work, the application
 * can never be the explanation. The ONLY variable is the address it binds to.
 *
 *   node campuspulse-stub.mjs 127.0.0.1 8471     # loopback only  -> the bug
 *   node campuspulse-stub.mjs 0.0.0.0   8471     # every interface -> the fix
 *
 * Then, from the SAME machine:
 *
 *   curl -sS http://127.0.0.1:8471/healthz       # works either way
 *   curl -sS http://<your-lan-ip>:8471/healthz   # only works when bound 0.0.0.0
 *
 * Find <your-lan-ip> with `ipconfig` (Windows) or `ip -4 addr` / `ifconfig`
 * (Linux/macOS). It is the address on your active adapter, not 127.0.0.1.
 */
import http from "node:http";

const host = process.argv[2] ?? "127.0.0.1";
const port = Number(process.argv[3] ?? 8471);

const server = http.createServer((req, res) => {
  const body = JSON.stringify({
    status: "ok",
    service: "campuspulse",
    boundTo: `${host}:${port}`,
    // The address the CLIENT used to reach us. Compare it with boundTo.
    servedOn: `${req.socket.localAddress}:${req.socket.localPort}`,
    // The client's four-tuple, as this machine sees it. On a LAN request this is
    // the peer's real address; from behind NAT the far end sees something else.
    peer: `${req.socket.remoteAddress}:${req.socket.remotePort}`,
    path: req.url,
    at: new Date().toISOString(),
  }, null, 2);
  res.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" });
  res.end(body + "\n");
});

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`\nEADDRINUSE: something else already owns ${host}:${port}.`);
    console.error(`Find the owner before you change the port:`);
    console.error(`  Windows  netstat -ano | findstr :${port}`);
    console.error(`  Linux    ss -ltnp | grep :${port}`);
    console.error(`  macOS    lsof -nP -iTCP:${port} -sTCP:LISTEN\n`);
    process.exit(1);
  }
  if (err.code === "EADDRNOTAVAIL") {
    console.error(`\nEADDRNOTAVAIL: ${host} is not an address on this machine.`);
    console.error(`Check your own addresses first, then try again.\n`);
    process.exit(1);
  }
  throw err;
});

server.listen(port, host, () => {
  console.log(`campuspulse listening on ${host}:${port}`);
  console.log(`this log line proves the process started. it proves NOTHING about reachability.`);
  console.log(`verify with the socket table, not with this message.`);
});
