# A worked annotated capture

**CSC 436 — Week 1.** This is the depth [HW1](../homework.md) expects for the *annotated
packet capture* artifact. It is not a description of a good annotation. It is one.

Everything quoted below was read out of
[`week01-fallback-capture.pcap`](week01-fallback-capture.pcap), which is in this folder.
Open it in Wireshark and follow along.

> **What "annotated" means here.** Not "I labelled the packets." For each stage: *what the
> bytes say*, *what that proves*, *what it does not prove*, and *which command you would run
> to check it independently*. The last two are where the marks are, and where an AI that
> cannot see your capture has nothing to contribute.

---

## Capture summary

| | |
| --- | --- |
| File | `week01-fallback-capture.pcap` |
| Packets | 32 |
| Bytes | 11,602 |
| Client | `10.0.20.252` (RFC 1918 — this machine is behind NAT) |
| Target | `example.com` |
| Streams | 1 DNS exchange over UDP, 1 TLS/HTTPS connection, 1 cleartext HTTP connection |

**Redaction:** none was needed. No cookies, no `Authorization` header, no credentials, no
public client address. The client address is private and the destination is a public
documentation host. *Saying this explicitly is part 8 of the evidence standard — do it even
when the answer is "nothing to redact."*

---

## Stage 1 — DNS. A name becomes an address

**Display filter:** `dns`

```text
1   10.0.20.252:54988 -> 1.1.1.1:53      Standard query    A example.com
2   1.1.1.1:53 -> 10.0.20.252:54988      Standard response A 104.20.23.154
                                                           A 172.66.147.243
```

Bytes worth reading, from packet 2:

```text
transaction id  0x7138       matches the query. this is how the stub resolver
                             knows the answer belongs to its question
flags           0x8180       QR=1 (response), RD=1, RA=1, RCODE=0 (NOERROR)
answers         2
answer 1        type A   ttl 224   rdata 104.20.23.154
answer 2        type A   ttl 224   rdata 172.66.147.243
```

**What this proves.** The name resolved, and it resolved to **two** addresses with **224
seconds** left on the TTL. That TTL is not the record's configured value — it is the
*remainder* of a countdown already in progress at the resolver. Somebody else asked for
`example.com` about 76 seconds ago, assuming a 300-second record.

**What it does not prove.** Nothing about whether either address is reachable, whether the
service is up, or whether this is the answer anyone else would get. Two addresses came back;
the client will try one, and which one is a client decision no application code participates
in. A different resolver, or the same resolver 225 seconds later, may answer differently.

**How I would check independently.**

```bash
dig +noall +answer example.com A          # ask again, watch the TTL count down
dig @8.8.8.8 +noall +answer example.com A # a second, independent resolver
```

**What surprised me.** The query is UDP and it is 29 bytes. The single most consequential
lookup in the whole page load — get it wrong and nothing else happens — travels in one
unacknowledged, unencrypted datagram. Week 2 is about who is allowed to answer it.

---

## Stage 2 — TCP. Three packets before a single byte of anything useful

**Display filter:** `tcp.flags.syn == 1`

```text
3   10.0.20.252:61039 -> 104.20.23.154:443   [SYN]      Seq=0
4   104.20.23.154:443 -> 10.0.20.252:61039   [SYN, ACK] Seq=0 Ack=1
5   10.0.20.252:61039 -> 104.20.23.154:443   [ACK]      Seq=1 Ack=1
```

**What this proves.** A bidirectional path exists and both ends agreed to start a
conversation. Each side sent its initial sequence number and acknowledged the other's; from
here, either side can detect a gap or a duplicate. The connection is now identified by the
four-tuple `10.0.20.252:61039 <-> 104.20.23.154:443`, and the client port `61039` is
ephemeral — inside the 49152–65535 range on this platform, chosen by the kernel, gone
forever when the socket closes.

**What it does not prove.** Nothing about the service. A TCP handshake completes against any
process that called `listen()`, including one that is wedged, misconfigured, or about to
return 500 to everything. "The port is open" is a statement about the kernel, not the app.

**How I would check independently.**

```bash
curl -sS -v https://example.com/ -o /dev/null 2>&1 | grep -E "Trying|Established"
```

An `* Established connection to ...` line means these three packets happened. `* Trying …`
with nothing after it means the SYN went out and nothing came back — which is exactly how
[`injected-failures/failure-02`](injected-failures/failure-02-timeout-from-outside) is
diagnosed.

> I checked whether `-w "%{time_connect}"` could serve as the tell instead, and it cannot:
> on curl 8.21 (Windows, Schannel) a *timed-out* connect reported a small non-zero value
> while a *refused* connect reported `0.000000` — the opposite of the intuition. Verify a
> discriminator before you rely on it; that is the whole habit this course is teaching.

**What surprised me.** Nothing is encrypted yet and nothing has been requested yet. Three
round trips of pure setup are spent before the client is allowed to say what it wants. That
cost is exactly what QUIC was designed to delete, and it is why Block C previews it.

---

## Stage 3 — TLS ClientHello. The one part of HTTPS that is not private

**Display filter:** `tls.handshake.type == 1`

```text
6   10.0.20.252:61039 -> 104.20.23.154:443   Client Hello   (segment 1/2, 1460 bytes)
7   10.0.20.252:61039 -> 104.20.23.154:443   Client Hello   (segment 2/2, 143 bytes)
```

The record, decoded:

```text
record type          22 (handshake)
record version       0x0301   <- a frozen compatibility value, not "TLS 1.0"
handshake type       1 (ClientHello), length 1594
legacy_version       0x0303   <- also compatibility machinery
cipher suites        52 offered, beginning:
                       0x1302 TLS_AES_256_GCM_SHA384
                       0x1303 TLS_CHACHA20_POLY1305_SHA256
                       0x1301 TLS_AES_128_GCM_SHA256
                       0xc02f ECDHE_RSA_WITH_AES_128_GCM_SHA256
extensions           65281, 0, 11, 10, 35, 16, 22, 23, 13, 43, 45, 51
  ext 0  server_name (SNI)      "example.com"          <-- IN CLEARTEXT
  ext 16 ALPN                   h2, http/1.1           <-- how HTTP/2 gets chosen
  ext 43 supported_versions     TLS 1.3 offered        <-- the server selects
  ext 51 key_share
```

**What this proves.** Three things a reader of the application source could never learn:

1. **The hostname travelled in the clear.** `example.com` is plainly visible in packet 6,
   before any key exchange. Anyone on the path — the coffee shop, the ISP, a corporate
   middlebox — sees *which site* you are visiting, though not what you did there.
   **Caveat, and state it in your own write-up if it applies:** this is true *because ECH
   was not in use here*. Encrypted Client Hello moves the real SNI inside an encrypted
   inner ClientHello. If your capture shows no `server_name`, ECH is the likely reason and
   "SNI absent, ECH in use" is a correct and complete observation.
2. **The version fields are compatibility values, not the truth.** The record layer carries
   `0x0301` and the ClientHello body carries `legacy_version 0x0303`, both frozen for the
   benefit of middleboxes deployed a decade ago that drop handshakes they do not recognise.
   The versions actually on offer are in extension 43, `supported_versions`, and **the
   server picks one and announces it in the ServerHello** — the client only proposes. This
   is what protocol ossification looks like in a hex dump.
3. **The client, not the server, opens the menu.** 52 cipher suites and a set of protocols
   were offered. The server selects one according to its own policy — not necessarily the
   first mutual match. Nothing in the application chose any of it.

**What it does not prove.** That the connection is secure. The ClientHello is an *offer*.
Whether the server presents a valid chain, whether this client trusts it, and which suite
was actually selected are all in the ServerHello and the certificate that follow — and this
capture cannot show the certificate contents once the handshake moves to encrypted records.

**How I would check independently.**

```bash
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>&1 | head -30
curl -sS -o /dev/null -w "%{ssl_verify_result} %{http_version}\n" https://example.com/
```

**What surprised me.** SNI is cleartext, and it is cleartext *by design* — the server needs
to know which certificate to present before it has a key to encrypt with. HTTPS hides the
contents of the conversation, not the fact that you had it. That distinction becomes a
threat-model line in Week 9.

---

## Stage 4 — the encrypted body, and why the capture goes quiet

**Display filter:** `tls.record.content_type == 23`

```text
14  10.0.20.252:61039 -> 104.20.23.154:443   Application Data, 211 bytes
16  104.20.23.154:443 -> 10.0.20.252:61039   Application Data, 1394 bytes
18  104.20.23.154:443 -> 10.0.20.252:61039   Application Data, 24 bytes
```

Packet 14 is the HTTP request. Wireshark cannot tell you that, and neither can anyone on the
path. It is 211 bytes of ciphertext.

**What this proves.** TLS is working. The request and the response are unreadable to a
passive observer.

**What it does not prove.** Anything at all about the HTTP exchange inside — status code,
headers, cache behaviour, or whether it succeeded. **This is the moment a capture stops being
the right tool** and DevTools or `curl -v` takes over, because both sit *above* the
encryption. Knowing which tool answers which question is the actual skill here.

**What surprised me.** The sizes leak. 211 bytes out, 1394 back: even without decryption, an
observer learns the shape of the exchange. Traffic analysis does not require breaking
anything.

---

## Stage 5 — HTTP in the clear, so the bytes are visible at least once

**Display filter:** `http.request || http.response`

The same site over port 80, included in this capture specifically so the HTTP layer is
readable exactly once.

```text
26  10.0.20.252:61040 -> 172.66.147.243:80   GET / HTTP/1.1
28  172.66.147.243:80 -> 10.0.20.252:61040   HTTP/1.1 200 OK
```

Request, verbatim, all 109 bytes:

```http
GET / HTTP/1.1
Host: example.com
User-Agent: csc436-week01-fallback/1.0
Accept: */*
Connection: close
```

Response headers, verbatim:

```http
HTTP/1.1 200 OK
Age: 9547
Allow: GET, HEAD
Cf-Cache-Status: HIT
Cf-Ray: a2bac40338dfaa54-SEA
Content-Type: text/html
Date: Sat, 15 Aug 2026 19:56:58 GMT
Last-Modified: Wed, 12 Aug 2026 20:15:57 GMT
Server: cloudflare
Connection: close
Transfer-Encoding: chunked
```

**What this proves.** Four things, and only one of them is about the origin server:

- `Host: example.com` is how one address serves many sites. Take that header away and the
  server cannot know which site you meant. It is the reason virtual hosting works.
- `Cf-Cache-Status: HIT` with `Age: 9547` — **this response did not come from the origin.**
  A Cloudflare edge node answered from cache, and the object had been sitting there for 2
  hours 39 minutes. The origin server may not have been involved for hours.
- `Cf-Ray: ...-SEA` names the edge location: Seattle. The answer came from a machine near
  the client, not near the site owner.
- `Transfer-Encoding: chunked` — the body arrived in framed chunks (`22f` then `0`), so the
  server did not know the length when it began sending.

**What it does not prove.** That the origin is healthy. A cached `200` is a statement about
an edge node's memory. If the origin fell over an hour ago, this response would look
identical. That is a feature — and it is why Week 5 grades a MISS → HIT → 304 sequence
rather than a single successful request.

**How I would check independently.**

```bash
curl -sSI https://example.com/ | grep -iE 'cf-cache-status|age|cf-ray'
curl -sSI https://example.com/ | grep -iE 'cf-cache-status|age'   # run twice, compare Age
```

**What surprised me.** I asked for `example.com` and a cache in Seattle answered. Between
"the browser" and "the server" in the diagram everyone draws, there was another computer,
in another city, that was not mentioned in the URL and is not visible in the source. It is
the machine that actually served the page.

---

## What this capture, taken as a whole, establishes

1. **Four different protocols cooperated** — DNS over UDP, TCP, TLS, HTTP — and any one of
   them can fail independently, with a different symptom and a different fix.
2. **The connection was to `104.20.23.154`**, an address chosen by a resolver 224 seconds
   into a TTL countdown, from two candidates, by a selection process no application
   participated in.
3. **The hostname was public, the payload was not.**
4. **The origin server may never have been contacted.** `Cf-Cache-Status: HIT` says an edge
   node answered.

And the honest limits, stated because leaving them out is how a dossier loses marks:

- I cannot see the certificate chain in this capture; the handshake is largely encrypted in
  TLS 1.3. `openssl s_client` answers that question, not Wireshark.
- I cannot see the HTTPS request or response bodies. DevTools or `curl -v` answers that.
- I captured one page load once, from one network. Nothing here generalises to another
  client on another network at another time — as
  [`path-and-nat.txt`](path-and-nat.txt) demonstrates, where the same name gave three
  different answers within minutes.

---

## What earns marks, and what does not

| Loses marks | Earns marks |
| --- | --- |
| "Packet 6 is the TLS ClientHello." | "Packet 6 carries `server_name: example.com` in cleartext, so the hostname is visible on-path even though the payload is not." |
| "The handshake completed successfully." | "The handshake proves a listener accepted the connection; it says nothing about whether the service is healthy — a wedged process still completes a handshake." |
| A screenshot of the Wireshark window | The display filter you used, the packet numbers it matched, and the field values you read |
| "DNS resolved example.com." | "TTL 224 of an assumed 300 means this answer was already cached; my capture reflects a resolver's memory, not the zone." |
| Silence about what the capture cannot show | "Bodies are encrypted from packet 14 on; I used `curl -v` for the HTTP layer, and here it is." |

**The pattern:** every claim names the artifact, the field, and the limit. Do that for each
of the four stages and the artifact is complete.

---

## Reproducing this against your own site

Once you have bought your domain and stood up CampusPulse, run the same four filters against
your own page load. The interesting version of this assignment is not `example.com` — it is
the moment you find a stage that behaves differently from what you assumed you had deployed.

```bash
# Wireshark capture filter, so you record only what you need:
host <your-domain> or port 53

# then, in the display filter bar, one stage at a time:
dns
tcp.flags.syn == 1
tls.handshake.type == 1
http.request || http.response
```
