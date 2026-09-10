#!/usr/bin/env node
/**
 * CSC 436 — Week 1 — a server that aborts an established connection.
 *
 * It completes the TCP handshake, reads your request, and then RESETS the socket.
 * That is what a crashing server, an expired NAT entry, or a proxy killing an
 * oversized request looks like from the client side.
 *
 *   terminal 1:  node abort-server.mjs
 *   terminal 2:  curl -sS --max-time 8 -v http://127.0.0.1:8472/
 *
 * Expect curl exit code 56, "Recv failure: Connection was reset" — and note that
 * "Request completely sent off" appears FIRST. The connection was established.
 * That is what separates a reset from a refusal.
 *
 * Bound to 127.0.0.1 deliberately: this is a teaching tool, not a service.
 */
import net from "node:net";

const PORT = Number(process.argv[2] || 8472);

net
  .createServer((sock) => {
    sock.on("data", () => {
      // resetAndDestroy() sends RST. Older Node falls back to destroy(), which
      // also resets when there is unread data in the receive buffer.
      try {
        sock.resetAndDestroy();
      } catch {
        sock.destroy();
      }
    });
    sock.on("error", () => {});
  })
  .listen(PORT, "127.0.0.1", () => {
    console.log(`abort server listening on 127.0.0.1:${PORT}`);
    console.log(`try:  curl -sS --max-time 8 -v http://127.0.0.1:${PORT}/`);
    console.log(`expect: curl: (56) Recv failure: Connection was reset`);
  });
