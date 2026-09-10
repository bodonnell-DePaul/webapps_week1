# Week 1 — sample artifacts

**CSC 436 — Web Application Systems: From URL to Operable Product**

Every capture in this folder was produced by running the command against a real machine and
a real network on **2026-08-15**, then sanitised. Nothing here was written by hand to look
plausible. Where something is reconstructed rather than captured, it says so in the file.

That is not a boast — it is the standard [HW1](../homework.md) holds you to.

---

## What is in here

Maintainer regression command (Node 24, from course content root):
`node --test weeks/week01/samples/samples.test.mjs`.
Restore the Week 3 `incident-feed` dependencies with `npm ci` first. These
tests check the runnable Weeks 1–5 fixtures and **expect** the documented HTTP/
cache faults; passing tests do not mean a deliberately faulty exercise was fixed.
They are distinct from `incident-feed`'s intentionally failing `check` script
and its passing `check:fixed` reference validation.

| File | What it is | Used by |
| --- | --- | --- |
| [`curl-verbose.txt`](curl-verbose.txt) | Annotated `curl -v` transcript — resolution, TLS, wire protocol | Block A demo fallback |
| [`network-config.txt`](network-config.txt) | Real `ipconfig /all` + `route print` with a full annotation pass | Block B, lab step 1 |
| [`sockets-and-ports.txt`](sockets-and-ports.txt) | Listening sockets, ephemeral ports, the bind-address failure and its fix | Block B, lab step 2 |
| [`path-and-nat.txt`](path-and-nat.txt) | `nslookup`, `ping`, `tracert`, and hard evidence of NAT rewriting a source address **and** a source port | Block B, lab step 3 |
| [`refused-vs-timeout.txt`](refused-vs-timeout.txt) | The two failure shapes side by side, with wall-clock timings | Block C, lab step 6 |
| [`week01-fallback-capture.pcap`](week01-fallback-capture.pcap) | A 32-packet capture: DNS, TCP handshake, TLS ClientHello, HTTP request/response | Lab step 5 **fallback** |
| [`make-fallback-capture.mjs`](make-fallback-capture.mjs) | The generator for that pcap. Re-runnable; documents exactly what is real | Instructor |
| [`capture-walkthrough.md`](capture-walkthrough.md) | **A fully worked annotated capture.** This is the depth HW1 expects | HW1 worked example |
| [`injected-failures/`](injected-failures) | The two failures HW1 asks you to diagnose | HW1 task 7 |

---

## The fallback capture: what is real, what is not

`week01-fallback-capture.pcap` exists for students who cannot run a live capture — no admin
rights on a managed laptop, an MDM profile that blocks Npcap, a locked-down lab VM, or a
full-tunnel VPN that hides the interesting traffic. **You are never blocked on the lab.**

Read this before you use it, because it models the disclosure discipline this course grades:

**Real, byte for byte, from an actual exchange:**

- the DNS query and response (real question, real answer, real TTL)
- the TLS ClientHello, ServerHello, certificate chain, and the rest of the handshake
- the encrypted application-data records
- the cleartext HTTP/1.1 request and response
- the relative timing between all of the above

**Synthesised, because a userspace program never sees these:**

- Ethernet headers — the MACs are locally administered (`02:00:00:00:00:0x`) and deliberately fake
- IPv4 headers — the addresses are real; IP IDs and checksums are computed by the generator
- the TCP three-way handshake, the bare ACKs, and the FIN teardown are reconstructed from
  the real byte counts, so the stream reassembles correctly, but there is no retransmission,
  reordering, or window behaviour in it

So the **payloads and protocol semantics are genuine and worth reading**; the **transport
dynamics are a clean-room reconstruction**. It is a teaching artifact, not evidence.

> **HW1 requires *your* capture — but the no-capture path is worth full marks.** Submitting
> this file *as though it were your own capture* earns nothing for that artifact and is a
> fabrication issue. **Declaring that you could not capture and using the documented
> alternative path in the homework earns full credit**, and it is exactly what this file
> exists for. Say which of the two you did, in one sentence, in your submission.

Regenerate it any time:

```bash
node weeks/week01/samples/make-fallback-capture.mjs
```

---

## Redaction key

Every capture here was sanitised with the same rules HW1 requires of you. **Replace, do not
crop** — the shape of a redacted value is usually part of the evidence.

| Original | Published as | Why |
| --- | --- | --- |
| Machine host name | `CPC-REDACTED` | Identifies a person |
| MAC addresses | `00-0D-3A-XX-XX-XX` | Vendor OUI kept on purpose — it is a hardware fact, not a personal one. Interface identifier removed. |
| DHCPv6 DUID | partially masked | It embeds the MAC |
| IPv6 link-local interface IDs | `fe80::[iid-redacted]%26` | Derived per-interface identifier |
| Public egress address `70.37.26.x` | `203.0.113.181` / `203.0.113.183` | Real public address tied to a person. Replaced with [RFC 5737](https://www.rfc-editor.org/rfc/rfc5737.html) TEST-NET-3, **preserving the fact that two consecutive requests left from two different addresses** |
| Wi-Fi SSID | not captured | Never publish it |

**Deliberately *not* redacted**, because they carry the lesson and identify nobody:

- RFC 1918 private addresses (`10.0.20.252`, `10.0.0.1`, `172.24.192.1`) — the whole point
- `168.63.129.16` — Azure's [documented public virtual IP](https://learn.microsoft.com/en-us/azure/virtual-network/what-is-ip-address-168-63-129-16) for platform DHCP/DNS. A published constant.
- Ephemeral port numbers — they are gone the moment the socket closes
- The destination addresses of public web servers

---

## The machine these were captured on

A **cloud-hosted Windows desktop**, not a laptop on home Wi-Fi. That turns out to be a
feature, because it separates three roles a home router deliberately merges:

| Role | On this machine | On a typical home network |
| --- | --- | --- |
| Default gateway | `10.0.0.1` | `192.168.1.1` |
| DHCP server | `168.63.129.16` | `192.168.1.1` |
| DNS resolver | `10.0.254.4` | `192.168.1.1` |

Three jobs, three different servers. Your home router runs all three, which is why students
routinely believe they are one thing. They are not.

**ICMP is filtered on this network**, so `ping` and `tracert` fail while HTTPS to the same
host succeeds. That is also captured here, on purpose — see `path-and-nat.txt`. Your own
output will differ. Read *yours*.
