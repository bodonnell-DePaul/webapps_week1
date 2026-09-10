#!/usr/bin/env node
/**
 * CSC 436 — Week 1 lab fallback capture generator.
 *
 * WHAT THIS IS
 * ------------
 * Some students cannot run Wireshark: no admin rights on a managed laptop, a locked-down
 * campus VM, a corporate MDM profile that blocks Npcap, or a VPN that hides the traffic.
 * They still have to be able to do the lab. This script produces the fallback capture,
 * `week01-fallback-capture.pcap`, which they open in Wireshark instead of capturing live.
 *
 * WHAT IS REAL AND WHAT IS SYNTHESIZED  --  read this before you teach from it
 * ---------------------------------------------------------------------------
 * REAL, byte for byte, recorded from an actual exchange on the wire:
 *   - the DNS query and the DNS response (real question, real answer, real TTL)
 *   - the TLS ClientHello, ServerHello, certificate, and the rest of the handshake
 *   - the encrypted application-data records
 *   - the HTTP/1.1 request bytes and the HTTP response bytes on the cleartext run
 *   - the relative timestamps between all of the above
 *
 * SYNTHESIZED, because a userspace program never sees these:
 *   - Ethernet headers (MACs are locally administered 02:00:00:00:00:0x — deliberately fake)
 *   - IPv4 headers (addresses are real; IP IDs and checksums are computed here)
 *   - TCP headers: the three-way handshake, ACKs, and the FIN teardown are reconstructed.
 *     Sequence numbers are derived from the real byte counts, so the stream reassembles
 *     correctly, but no retransmission, reordering, or window dynamics are represented.
 *
 * So: the *payloads and the protocol semantics* are genuine and worth reading. The
 * *transport dynamics* are a clean-room reconstruction. Say that to students. It is a
 * teaching artifact, not evidence, and HW1 requires their own capture, not this one.
 *
 * USAGE
 *   node make-fallback-capture.mjs [--out week01-fallback-capture.pcap]
 *                                  [--host example.com] [--resolver 1.1.1.1]
 */

import dgram from "node:dgram";
import net from "node:net";
import tls from "node:tls";
import { Duplex } from "node:stream";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

const argv = process.argv.slice(2);
const arg = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};

const HOST = arg("host", "example.com");
const RESOLVER = arg("resolver", "1.1.1.1");
const OUT = path.resolve(HERE, arg("out", "week01-fallback-capture.pcap"));

// Synthetic layer-2 / layer-3 identities. Locally administered MACs (02:…) so nobody
// mistakes them for a real NIC. Client address is RFC 1918; that part is realistic.
const CLIENT_MAC = Buffer.from([0x02, 0x00, 0x00, 0x00, 0x00, 0x01]);
const ROUTER_MAC = Buffer.from([0x02, 0x00, 0x00, 0x00, 0x00, 0x02]);
const CLIENT_IP = "10.0.20.252";

// ---------------------------------------------------------------------------
// pcap writing
// ---------------------------------------------------------------------------

const packets = []; // { tsMs, bytes }
let ipId = 0x4000;

function ip4ToBuf(s) {
  return Buffer.from(s.split(".").map((n) => Number(n) & 0xff));
}

function checksum16(buf) {
  let sum = 0;
  for (let i = 0; i + 1 < buf.length; i += 2) sum += buf.readUInt16BE(i);
  if (buf.length % 2) sum += buf[buf.length - 1] << 8;
  while (sum >> 16) sum = (sum & 0xffff) + (sum >> 16);
  return (~sum) & 0xffff;
}

function ipv4Header(srcIp, dstIp, proto, payloadLen) {
  const h = Buffer.alloc(20);
  h[0] = 0x45;
  h[1] = 0x00;
  h.writeUInt16BE(20 + payloadLen, 2);
  h.writeUInt16BE(ipId++ & 0xffff, 4);
  h.writeUInt16BE(0x4000, 6); // don't fragment
  h[8] = 64;
  h[9] = proto;
  h.writeUInt16BE(0, 10);
  ip4ToBuf(srcIp).copy(h, 12);
  ip4ToBuf(dstIp).copy(h, 16);
  h.writeUInt16BE(checksum16(h), 10);
  return h;
}

function pseudoHeader(srcIp, dstIp, proto, len) {
  const p = Buffer.alloc(12);
  ip4ToBuf(srcIp).copy(p, 0);
  ip4ToBuf(dstIp).copy(p, 4);
  p[8] = 0;
  p[9] = proto;
  p.writeUInt16BE(len, 10);
  return p;
}

function ethFrame(fromClient, l3) {
  const eth = Buffer.alloc(14);
  (fromClient ? ROUTER_MAC : CLIENT_MAC).copy(eth, 0);
  (fromClient ? CLIENT_MAC : ROUTER_MAC).copy(eth, 6);
  eth.writeUInt16BE(0x0800, 12);
  return Buffer.concat([eth, l3]);
}

function emit(tsMs, fromClient, l3) {
  packets.push({ tsMs, bytes: ethFrame(fromClient, l3) });
}

function udpDatagram(tsMs, fromClient, srcIp, srcPort, dstIp, dstPort, payload) {
  const udp = Buffer.alloc(8);
  udp.writeUInt16BE(srcPort, 0);
  udp.writeUInt16BE(dstPort, 2);
  udp.writeUInt16BE(8 + payload.length, 4);
  const body = Buffer.concat([udp, payload]);
  const ck = checksum16(
    Buffer.concat([pseudoHeader(srcIp, dstIp, 17, body.length), body])
  );
  body.writeUInt16BE(ck === 0 ? 0xffff : ck, 6);
  emit(tsMs, fromClient, Buffer.concat([ipv4Header(srcIp, dstIp, 17, body.length), body]));
}

const TCP_FIN = 0x01, TCP_SYN = 0x02, TCP_ACK = 0x10, TCP_PSH = 0x08;

function tcpSegment(tsMs, fromClient, conn, flags, payload = Buffer.alloc(0)) {
  const srcIp = fromClient ? conn.clientIp : conn.serverIp;
  const dstIp = fromClient ? conn.serverIp : conn.clientIp;
  const srcPort = fromClient ? conn.clientPort : conn.serverPort;
  const dstPort = fromClient ? conn.serverPort : conn.clientPort;
  const seq = fromClient ? conn.cSeq : conn.sSeq;
  const ack = fromClient ? conn.sSeq : conn.cSeq;

  const tcp = Buffer.alloc(20);
  tcp.writeUInt16BE(srcPort, 0);
  tcp.writeUInt16BE(dstPort, 2);
  tcp.writeUInt32BE(seq >>> 0, 4);
  tcp.writeUInt32BE((flags & TCP_ACK ? ack : 0) >>> 0, 8);
  tcp[12] = 0x50; // data offset 5 words, no options
  tcp[13] = flags;
  tcp.writeUInt16BE(64240, 14);
  const body = Buffer.concat([tcp, payload]);
  const ck = checksum16(
    Buffer.concat([pseudoHeader(srcIp, dstIp, 6, body.length), body])
  );
  body.writeUInt16BE(ck, 16);
  emit(tsMs, fromClient, Buffer.concat([ipv4Header(srcIp, dstIp, 6, body.length), body]));

  const consumed = payload.length + (flags & (TCP_SYN | TCP_FIN) ? 1 : 0);
  if (fromClient) conn.cSeq = (conn.cSeq + consumed) >>> 0;
  else conn.sSeq = (conn.sSeq + consumed) >>> 0;
}

const MSS = 1460;

function tcpData(tsMs, fromClient, conn, payload) {
  for (let off = 0; off < payload.length; off += MSS) {
    const slice = payload.subarray(off, Math.min(off + MSS, payload.length));
    const last = off + MSS >= payload.length;
    tcpSegment(tsMs, fromClient, conn, last ? TCP_PSH | TCP_ACK : TCP_ACK, slice);
  }
  tcpSegment(tsMs + 1, !fromClient, conn, TCP_ACK); // the bare ACK back
}

function writePcap(file) {
  packets.sort((a, b) => a.tsMs - b.tsMs);
  const gh = Buffer.alloc(24);
  gh.writeUInt32LE(0xa1b2c3d4, 0); // magic, microsecond resolution
  gh.writeUInt16LE(2, 4);
  gh.writeUInt16LE(4, 6);
  gh.writeInt32LE(0, 8);
  gh.writeUInt32LE(0, 12);
  gh.writeUInt32LE(262144, 16);
  gh.writeUInt32LE(1, 20); // LINKTYPE_ETHERNET
  const chunks = [gh];
  const base = Math.floor(Date.now() / 1000);
  for (const p of packets) {
    const rh = Buffer.alloc(16);
    rh.writeUInt32LE(base + Math.floor(p.tsMs / 1000), 0);
    rh.writeUInt32LE(Math.round((p.tsMs % 1000) * 1000), 4);
    rh.writeUInt32LE(p.bytes.length, 8);
    rh.writeUInt32LE(p.bytes.length, 12);
    chunks.push(rh, p.bytes);
  }
  fs.writeFileSync(file, Buffer.concat(chunks));
}

// ---------------------------------------------------------------------------
// 1. A real DNS query over UDP/53
// ---------------------------------------------------------------------------

function buildDnsQuery(name, id) {
  const labels = name.split(".").filter(Boolean);
  const qlen = labels.reduce((n, l) => n + 1 + Buffer.byteLength(l), 0) + 1;
  const b = Buffer.alloc(12 + qlen + 4);
  b.writeUInt16BE(id, 0);
  b.writeUInt16BE(0x0100, 2); // standard query, recursion desired
  b.writeUInt16BE(1, 4);      // one question
  let o = 12;
  for (const l of labels) {
    b[o++] = Buffer.byteLength(l);
    o += b.write(l, o);
  }
  b[o++] = 0;
  b.writeUInt16BE(1, o); o += 2; // QTYPE A
  b.writeUInt16BE(1, o);          // QCLASS IN
  return b;
}

function realDnsExchange(name, resolver) {
  return new Promise((resolve, reject) => {
    const sock = dgram.createSocket("udp4");
    const id = (Math.random() * 0xffff) & 0xffff;
    const query = buildDnsQuery(name, id);
    const timer = setTimeout(() => {
      sock.close();
      reject(new Error(`DNS timeout talking to ${resolver}`));
    }, 6000);
    sock.on("message", (msg) => {
      clearTimeout(timer);
      const srcPort = sock.address().port;
      sock.close();
      resolve({ query, response: msg, srcPort });
    });
    sock.on("error", (e) => { clearTimeout(timer); reject(e); });
    sock.send(query, 53, resolver);
  });
}

function firstAFromDns(msg) {
  let o = 12;
  while (msg[o] !== 0) o += msg[o] + 1;
  o += 5; // terminating zero + QTYPE + QCLASS
  const anCount = msg.readUInt16BE(6);
  for (let i = 0; i < anCount; i++) {
    if ((msg[o] & 0xc0) === 0xc0) o += 2;
    else { while (msg[o] !== 0) o += msg[o] + 1; o += 1; }
    const type = msg.readUInt16BE(o);
    const rdlen = msg.readUInt16BE(o + 8);
    const rdata = msg.subarray(o + 10, o + 10 + rdlen);
    o += 10 + rdlen;
    if (type === 1 && rdlen === 4) return rdata.join(".");
  }
  return null;
}

// ---------------------------------------------------------------------------
// 2. A real TLS exchange, recorded chunk by chunk at the socket boundary
// ---------------------------------------------------------------------------

function realTlsExchange(host, ip, t0) {
  return new Promise((resolve, reject) => {
    const events = [];
    const raw = net.connect({ host: ip, port: 443 });
    raw.setNoDelay(true);

    // `tls.connect({ socket })` drives the underlying stream through internal machinery,
    // so monkey-patching `socket.write` misses every byte. Interpose a real duplex tap
    // instead: TLS talks to `tap`, `tap` talks to the socket, and we see both directions.
    const tap = new Duplex({
      read() {},
      write(chunk, _enc, cb) {
        events.push({ t: Date.now() - t0, dir: "c", data: Buffer.from(chunk) });
        raw.write(chunk, cb);
      },
      final(cb) { raw.end(); cb(); },
    });
    raw.on("data", (d) => {
      events.push({ t: Date.now() - t0, dir: "s", data: Buffer.from(d) });
      tap.push(d);
    });
    raw.on("end", () => tap.push(null));
    raw.on("error", (e) => tap.destroy(e));

    let settled = false;
    let localPort = 0;
    raw.on("connect", () => { localPort = raw.localPort || 0; });
    const done = () => {
      if (settled) return;
      settled = true;
      raw.destroy();
      events.length ? resolve({ events, localPort: localPort || 49876 }) : reject(new Error("no TLS bytes recorded"));
    };

    const sock = tls.connect(
      { socket: tap, servername: host, ALPNProtocols: ["http/1.1"] },
      () => {
        sock.write(
          `GET / HTTP/1.1\r\nHost: ${host}\r\n` +
          `User-Agent: csc436-week01-fallback/1.0\r\nAccept: */*\r\nConnection: close\r\n\r\n`
        );
      }
    );
    sock.resume();
    sock.on("close", done);
    sock.on("end", done);
    sock.on("error", done);
    raw.on("close", done);
    setTimeout(done, 15000);
  });
}

// ---------------------------------------------------------------------------
// 3. A real cleartext HTTP exchange, so `http.request` actually matches
// ---------------------------------------------------------------------------

function realHttpExchange(host, t0) {
  return new Promise((resolve, reject) => {
    const events = [];
    const sock = net.connect({ host, port: 80 });
    sock.setNoDelay(true);
    let serverIp = null;
    let localPort = 0;
    sock.on("connect", () => {
      serverIp = sock.remoteAddress?.replace(/^::ffff:/, "") ?? null;
      localPort = sock.localPort || 0;
      const req =
        `GET / HTTP/1.1\r\nHost: ${host}\r\n` +
        `User-Agent: csc436-week01-fallback/1.0\r\nAccept: */*\r\nConnection: close\r\n\r\n`;
      events.push({ t: Date.now() - t0, dir: "c", data: Buffer.from(req, "ascii") });
      sock.write(req);
    });
    sock.on("data", (d) => events.push({ t: Date.now() - t0, dir: "s", data: Buffer.from(d) }));
    const done = () => resolve({ events, localPort: localPort || 49877, serverIp });
    sock.on("close", done);
    sock.on("error", (e) => (events.length ? done() : reject(e)));
    setTimeout(done, 15000);
  });
}

// ---------------------------------------------------------------------------

function replayTcp(evts, conn, startMs) {
  tcpSegment(startMs, true, conn, TCP_SYN);
  tcpSegment(startMs + 1, false, conn, TCP_SYN | TCP_ACK);
  tcpSegment(startMs + 2, true, conn, TCP_ACK);
  let last = startMs + 2;
  for (const e of evts) {
    last = Math.max(last + 1, startMs + e.t);
    tcpData(last, e.dir === "c", conn, e.data);
    last += 2;
  }
  tcpSegment(last + 5, true, conn, TCP_FIN | TCP_ACK);
  tcpSegment(last + 6, false, conn, TCP_FIN | TCP_ACK);
  tcpSegment(last + 7, true, conn, TCP_ACK);
}

async function main() {
  const t0 = Date.now();
  console.log(`[1/3] DNS  A ${HOST} @ ${RESOLVER} over UDP/53 …`);
  const dns = await realDnsExchange(HOST, RESOLVER);
  const answer = firstAFromDns(dns.response);
  console.log(`      real answer: ${answer}`);

  udpDatagram(0, true, CLIENT_IP, dns.srcPort, RESOLVER, 53, dns.query);
  udpDatagram(12, false, RESOLVER, 53, CLIENT_IP, dns.srcPort, dns.response);

  console.log(`[2/3] TLS + HTTPS to ${answer}:443 (SNI ${HOST}) …`);
  const https = await realTlsExchange(HOST, answer, t0);
  replayTcp(https.events, {
    clientIp: CLIENT_IP, clientPort: https.localPort,
    serverIp: answer, serverPort: 443,
    cSeq: 0x1a2b0000, sSeq: 0x77c40000,
  }, 40);

  console.log(`[3/3] cleartext HTTP to ${HOST}:80 …`);
  const http = await realHttpExchange(HOST, t0);
  replayTcp(http.events, {
    clientIp: CLIENT_IP, clientPort: http.localPort,
    serverIp: http.serverIp || answer, serverPort: 80,
    cSeq: 0x2c3d0000, sSeq: 0x99e10000,
  }, 900);

  writePcap(OUT);
  console.log(`\nwrote ${OUT}`);
  console.log(`      ${packets.length} packets, ${fs.statSync(OUT).size} bytes`);
  console.log(`      try these filters: dns · tcp.flags.syn==1 && tcp.flags.ack==0 · tls.handshake.type==1 · http.request`);
}

main().catch((e) => { console.error("failed:", e.message); process.exit(1); });
