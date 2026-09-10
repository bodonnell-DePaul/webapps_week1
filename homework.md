# HW1 — Packet-to-Pixel Evidence Dossier

**CSC 436 — Web Application Systems: From URL to Operable Product**
Assigned: Week 1 · **Due: start of Week 2 class** · 100 points · **Individual**

> **The point of this assignment, in one sentence.** Prove that you can watch a single page
> load happen — from the DHCP lease that gave your laptop an address to the pixel on the
> screen — and read the evidence rather than guess at it.

This is the first assignment of the quarter, so it also does a second job: it establishes
the standard everything else is graded against. **Read it twice.** The
[worked example](#8-a-worked-example--the-depth-we-expect) shows the depth expected, and it
is the most useful thing in this handout.

---

## 1. Where this fits

| | |
| --- | --- |
| **Milestone it feeds** | **Week 1 charter — ungraded formative checkpoint.** Arrange a domain or assigned subdomain in task 8; graded Gate 1 is Week 3. |
| **What it sets up** | Week 2 assumes you already own a domain and can delegate its nameservers. Week 4 assumes you can read a TLS handshake. Week 5 assumes you can read cache headers. |
| **The chain link it covers** | Links 1–6 of the URL chain, plus a first look at 7. |

You will not do this work twice. Task 8's registrar becomes your project's registrar; task 5's
`curl` habits become how you check every deploy for the rest of the quarter.

---

## 2. Prerequisites

Have these **before** you start, not while you are stuck at 23:00:

- [ ] A terminal you can run `curl` in (built into Windows 10+, macOS, and Linux)
- [ ] **Wireshark** installed — [wireshark.org/download.html](https://www.wireshark.org/download.html). See §6 if you cannot install or run it; there is a full-credit path.
- [ ] A browser with DevTools (Chrome, Edge, or Firefox)
- [ ] **Node.js** — only to run the two helper scripts in `weeks/week01/samples/`
- [ ] A payment method for the domain (~$10–15), **or** the hardship path in §5 — which needs no explanation and costs no points
- [ ] Your individual project scope and ownership plan; no team formation is required or permitted

---

## 3. The nine tasks

Each task produces a numbered artifact. Every artifact goes in your dossier with your own
written interpretation. Missing interpretation loses the relevant evidence marks;
it does not automatically erase independently demonstrated domain understanding.
As in the syllabus, each rubric row is evaluated 60% domain content and 40%
evidence. Safety/integrity rules remain separate.

---

### Task 1 — Your own network identity (10 pts)

Capture your machine's answer to *"where am I on the network?"* and read it.

```bash
# Windows
ipconfig /all
route print -4
arp -a

# macOS
ifconfig
netstat -rn -f inet
arp -a

# Linux
ip addr
ip route
ip neigh
```

**Then write, in your own words:**

1. Your IPv4 address, subnet mask, and the mask **converted to CIDR notation, showing the
   binary**. State how many usable addresses the subnet holds.
2. Your default gateway, DHCP server, and DNS resolver. **Are they the same machine?** If
   they are, say what three separate jobs that one box is doing.
3. Your DHCP lease obtained/expiry times, and what a lease expiring in 12 hours versus one
   expiring in 2162 tells you about who manages your address.
4. One entry in your route table that is **not** the default route and not your own subnet,
   and what it is for.
5. Whether your address is private (RFC 1918) or public, and how you can tell without
   looking anything up.

> **If a field genuinely does not exist on your machine, write `N/A — not present` and show
> the command output that proves it.** A statically configured host has no DHCP lease; a
> minimal route table may have nothing beyond the default and the local subnet; some
> platforms do not report the DHCP server at all. **Documenting an absence with evidence is a
> complete answer and earns full marks.** Inventing a plausible value is not.

**Artifact:** `01-network-config.txt` — the raw command output, sanitised, with your written
answers below it.

> **Redact before you submit:** host name, MAC addresses (keep the vendor OUI, mask the rest),
> IPv6 interface identifiers, and any Wi-Fi SSID. **Leave private addresses intact** — they
> identify nobody and they are the evidence. See
> [`samples/network-config.txt`](samples/network-config.txt) for exactly how.

---

### Task 2 — Your socket and port map (10 pts)

```bash
# Windows
netstat -ano
Get-NetTCPConnection -State Listen | Format-Table LocalAddress,LocalPort,OwningProcess

# macOS
lsof -nP -iTCP -sTCP:LISTEN

# Linux
ss -ltnp
```

**Then:**

1. List **two listeners you can account for** plus **every listener bound to a wildcard
   address** (`0.0.0.0`, `*`, or `[::]`). You do not need to explain all forty things a modern
   OS listens on — but the wildcard ones are the ones reachable from elsewhere, so name them.
2. Identify at least one listener bound to `127.0.0.1` and at least one bound to `0.0.0.0`.
   **Explain the operational difference in one sentence each.** If your machine genuinely has
   no loopback-only listener, say so and start the lab's stub server to create one.
3. Find one **connected** socket and write out its full four-tuple. Say which end chose the
   client port and where that number came from.
4. Report your platform's ephemeral port range and the command that told you.

**Artifact:** `02-socket-map.txt`

> **If you find something listening on `0.0.0.0` that you did not intend to expose, say so.**
> Noticing it is worth more than a tidy answer.

---

### Task 3 — The three failure shapes (10 pts)

Reproduce all three, verbatim, and record the exit codes.

```bash
# refused — expect exit 7
curl -sS --max-time 8 -v http://127.0.0.1:9/

# timed out — expect exit 28
curl -sS --max-time 8 -v http://192.0.2.1/

# reset — expect exit 56  (two terminals)
node weeks/week01/samples/abort-server.mjs
curl -sS --max-time 8 -v http://127.0.0.1:8472/
```

**Then write, for each:** what happened on the wire in packets; what the symptom **rules
out**; and the first command you would run next to narrow it further.

> **If a command does not behave as described, that is a finding, not a failure — write it
> up.** These reproductions rely on your environment:
>
> - **Port 9 (discard)** is normally closed on a desktop, but some systems enable it and
>   some host firewalls filter it, which would give you a timeout instead of a refusal. If
>   port 9 misbehaves, use any other port with nothing on it and say which you used.
> - **`192.0.2.1`** is [RFC 5737](https://www.rfc-editor.org/rfc/rfc5737.html) TEST-NET-1 and
>   is normally routed nowhere, so the SYN is discarded silently. Some networks return an
>   ICMP unreachable instead, which produces a **fast** failure rather than a timeout — a
>   genuinely interesting result, and worth two sentences if it happens to you.
> - **The reset case** uses `socket.resetAndDestroy()`, which needs **Node 18.3 or newer**.
>   Check with `node --version`. On older Node the script falls back to `destroy()`, which
>   usually but not always produces a RST.
>
> Documenting *why* your result differed, with evidence, earns the same marks as the
> expected result. Inventing the expected output does not.

**Artifact:** `03-failure-shapes.txt`

---

### Task 4 — A packet capture of a real page load (20 pts)

**This is the largest single artifact. Budget accordingly.**

> ### ⚠ DNS over HTTPS will make filter 1 match nothing
>
> Chrome and Edge ship "Secure DNS" in automatic mode and Firefox enables DoH by default in
> some regions. When it is active your DNS query is encrypted inside TLS, there is no UDP/53
> traffic, and `dns` matches zero packets — which looks exactly like a broken capture.
>
> Try `curl` to simplify the capture, but do not assume it emits UDP/53:
> cached answers and OS/app encrypted DNS can suppress it. Record an absent
> exchange and use the supplied DNS fixture for that part. Do not change
> managed security settings; the full-credit fallback applies to partial captures too.

1. Start a Wireshark capture on your active interface with the capture filter:
   `host <a site you choose> or port 53`
2. Generate the traffic. Either `curl -sS https://<site>/ -o /dev/null` (reliable), or load
   the page in a browser with a **cleared cache** (DevTools → Network → Disable cache, or a
   private window) and Secure DNS disabled.
3. Stop the capture. Save as `04-capture.pcapng`.
4. Apply each display filter below in turn and screenshot or export the matching packets:

   | Link | Filter |
   | --- | --- |
   | DNS | `dns` |
   | TCP handshake | `tcp.flags.syn == 1` |
   | TLS ClientHello | `tls.handshake.type == 1` |
   | HTTP | `http.request` |

5. **Annotate all four**, in the structure demonstrated in
   [`samples/capture-walkthrough.md`](samples/capture-walkthrough.md). For each stage:
   *what the bytes say · what it proves · what it does not prove · how you would check
   independently.*

**Artifacts:** `04-capture.pcapng` and `04-capture-annotated.md`

> **`http.request` will match nothing on an HTTPS page.** That is not a broken filter — it is
> TLS working, and saying so is part of the answer. If you want to see the HTTP layer in the
> clear, capture one plaintext request to a site you control or to `http://example.com/`.

> **Cannot capture?** See §6. The alternative path is worth full marks.

---

### Task 5 — A `curl -v` trace and a timing breakdown (10 pts)

```bash
curl -sS -v https://<your chosen site>/ -o /dev/null      # NUL on Windows

curl -sS -o /dev/null -w "dns=%{time_namelookup} tcp=%{time_connect} \
tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total}\n" \
https://<your chosen site>/
```

**Then:** identify in the verbose output the line proving name resolution, the line proving
the TLS version and cipher, the certificate subject and issuer, and the negotiated HTTP
version. From the timing numbers, compute the **gap** for each phase and name the single
most expensive one.

**Artifact:** `05-curl-trace.txt`

---

### Task 6 — DevTools HAR and waterfall (10 pts)

1. Open DevTools → Network, disable cache, reload, and **export the HAR**.
2. Screenshot the waterfall.
3. Pick the **single slowest request** and break its timing into queueing, DNS, connect,
   TLS, request sent, waiting (TTFB), and download.
4. Answer: how many requests, how many bytes, how many distinct hosts? Which requests
   blocked rendering?
5. Answer: which of the URL chain's twelve links does a HAR show, and which does it not?

**Artifacts:** `06-network.har` and `06-waterfall.md`

> **A HAR can contain cookies, `Authorization` headers, and full request bodies.** Open it in
> a text editor and check before you submit. Replace values with `[REDACTED:cookie]` — do not
> delete the field, because the presence of the field is itself evidence. This is graded.

---

### Task 7 — Diagnose the two instructor-injected failures (12 pts)

The bundles are in
[`samples/injected-failures/`](samples/injected-failures). Read that folder's README first;
it defines the five-part format your write-up must use.

- [Failure 01 — refused from the LAN](samples/injected-failures/failure-01-refused-from-lan)
- [Failure 02 — timeout from outside](samples/injected-failures/failure-02-timeout-from-outside)

200–350 words each. **The answer to the first is not the answer to the second.**

> **A wrong diagnosis with correct reasoning from the evidence earns most of the credit. A
> right diagnosis with no reasoning earns very little.** Naming a cause you ruled out, and
> the specific file that ruled it out, is worth as much as naming the right one.

**Artifact:** `07-failure-diagnoses.md`

---

### Task 8 — Arrange a domain or course subdomain, and prove control (8 pts)

Choose the **no-cost course subdomain** or register a personal domain. Both earn
the same points. For a course subdomain, submit the redacted assignment/control
record, the parent-zone ownership explanation and the TXT proof below instead
of a purchase dashboard and WHOIS output. Personal registration is typically
$10–15 for year one; check renewal pricing and taxes before agreeing.

Suggested registrars — all support the delegation and DNSSEC work Week 2 needs, and none
require an upsell:

| Registrar | Typical `.com` first year | Note |
| --- | --- | --- |
| [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) | ~$10, at-cost | No markup, but you must use Cloudflare DNS |
| [Namecheap](https://www.namecheap.com/) | ~$10–15 | Free WHOIS privacy |
| [Porkbun](https://porkbun.com/) | ~$10–12 | Free WHOIS privacy, good API |
| [Google Domains → Squarespace](https://domains.squarespace.com/) | ~$20 | Fine, slightly pricier |

Cheaper TLDs (`.xyz`, `.dev`, `.app`) are fine. **`.dev` and `.app` are HSTS-preloaded, so
they require HTTPS from the first request** — that is a Week 4 constraint, not a Week 1 one,
and it is a perfectly good choice if you want it.

**Prove control** with all three:

1. A screenshot of your registrar dashboard showing the domain and its expiry — **redact
   your account email, name, and address.**
2. Registrar/RDAP registration data (or `whois` if supported) showing registrar and
   creation date; no extra WHOIS tool installation is required (redact registrant
   contact details; WHOIS privacy will usually have done this already).
3. **Proof you can change something.** The instructor will issue you a **random verification
   nonce** in D2L (it looks like `csc436-7f3a91c2`). Add it as a TXT record on your domain,
   then show it resolving:
   ```bash
   dig +short TXT <yourdomain>          # Linux/macOS
   nslookup -type=TXT <yourdomain>      # Windows
   ```
   **Delete the TXT record once your grade is posted.** DNS is a globally readable public
   database — do not put your campus ID, your name, your email, or anything else identifying
   into it. If you have not received a nonce, email the instructor rather than inventing one.

**Artifact:** `08-domain-proof.md`

> **Arrange your name in the first 48 hours.** Registrar verification emails, ICANN verification, and
> nameserver propagation are a third party's clock, not yours, and Week 2's lab assumes you
> already own one. This is the single most common reason a student falls behind in this course.

> **WHOIS is public too.** Use your registrar's free WHOIS privacy if it offers one (Namecheap
> and Porkbun both do, at no cost). Without it, your name, postal address, and phone number
> are published. That is a real-world operational lesson and it is also just good hygiene.

---

### Task 9 — Reject one AI claim, with evidence (10 pts)

Ask an AI assistant a **consequential** question about your own network evidence. Something
like:

- "Why is my service refusing connections from a second device I own?"
- "My `ping` fails but the website loads — is my network broken?"
- "What does `TIME_WAIT` on hundreds of sockets mean, and how do I fix it?"

Then **check its answer against an artifact you captured** and document a claim that is
wrong, incomplete, or wrong-for-your-situation.

Your write-up must contain:

1. The exact prompt you used and the model/tool.
2. The claim you are rejecting, quoted.
3. **The artifact that rejects it**, with the specific line quoted.
4. What the model would have needed in order to answer correctly — and whether you could
   have given it that.

**Artifact:** `09-challenged-claim.md`

> **This does not count:** style nitpicks; asking a second model whether the first was wrong
> (models are not evidence about each other); or a claim with no connection to your own
> artifacts. **Not using AI at all?** Use the
> [HW1 course-supplied capture-interpretation draft](../../docs/non-ai-review-artifacts.md#hw1---capture-interpretation-draft)
> for the same marks. Cite that source instead of inventing a personal prompt.
> The [public reference](reference.md) supplies vocabulary and evidence boundaries.

---

## 4. The eight-part evidence standard

Every submission in this course carries all eight. Full text:
[`docs/evidence-standard.md`](../../docs/evidence-standard.md).

| # | Part | What it looks like in HW1 |
| --- | --- | --- |
| 1 | Commit SHA or tag | Your dossier repo, tagged `hw1-submission` |
| 2 | Reproduction commands + config | Every literal command line you ran |
| 3 | Raw sanitised evidence | The pcapng, the HAR, the traces |
| 4 | Annotated interpretation | Your words, per artifact |
| 5 | A deliberate failure + diagnosis | Task 3, plus task 7 |
| 6 | AI-use log | What you generated, accepted, rejected, and how you verified |
| 7 | One challenged claim | Task 9 |
| 8 | Redaction attestation | See below — **it is graded** |

**Your redaction attestation** goes in `README.md` and must be specific:

> I have reviewed every artifact in this dossier. I redacted: my host name (01), MAC address
> interface identifiers (01), my public IP (05), and session cookies in the HAR (06). I
> confirm no live secrets, tokens, cookies, or authorization codes remain. Private RFC 1918
> addresses were deliberately left intact as evidence.

"I redacted everything sensitive" is **not** an attestation. Name what you removed.

---

## 5. The domain, and the hardship path

Operating a domain **or assigned course subdomain** is required; buying one is
not. Both exercise real DNS, ownership boundaries and TTLs. Follow
[getting started](../../docs/getting-started.md#5-domains-choose-the-no-cost-route-or-your-own-registration)
for registrar/registry/DNS-host roles, no-cost access, renewal and record verification.

**If the cost is a problem, a course-managed subdomain is available.** Email the instructor
the single line *"I'd like the course subdomain for HW1."*

- **No explanation is required, and none will be asked for.**
- The request is private. It is not visible to your classmates, your section, or the grader.
- **There is no grade difference.** Use the instructor-issued opaque hostname.
  If it is a record in the course zone rather than an independently delegated
  child zone, document the parent owner's delegation and your record-change
  rights instead of claiming you changed registrar nameservers.
- Ask any time, including in Week 4 if circumstances change.

Some students also have a domain already, or get one free through a student developer pack
(GitHub Student, Namecheap education). Those count. Use them.

---

## 6. If you cannot run Wireshark

This is common and it is not your fault: managed laptops, MDM profiles that block Npcap,
locked-down lab machines, no admin rights, or a full-tunnel VPN that hides the traffic.

**You are never blocked, and the alternative path is worth full marks.** Do all three:

1. **Use the provided capture.** Open
   [`samples/week01-fallback-capture.pcap`](samples/week01-fallback-capture.pcap) and run all
   four display filters against it. Read
   [`samples/README.md`](samples/README.md) first — it states exactly which parts of that
   file are real and which are reconstructed, and your annotation must repeat that
   distinction.
2. **Replace the missing evidence** with two things you *can* capture:
   - `curl -v --trace-ascii trace.txt https://<site>/` — a real byte-level trace of the
     bytes your machine actually sent and received
   - the DevTools HAR from task 6, with the timing breakdown expanded
3. **Say so, in one sentence, in your `README.md`.** Name the blocker. "Managed device; no
   admin rights to install Npcap" is a complete and acceptable answer.

**Do not** submit the fallback capture as though it were yours. That is the fabrication rule,
and it is the one thing in this course that is not a grade conversation.

---

## 7. Rubric

| # | Artifact | Points |
| --- | --- | ---: |
| 1 | Network config, read and converted to CIDR | 10 |
| 2 | Socket and port map, with the bind-address distinction | 10 |
| 3 | Three failure shapes, reproduced, with what each rules out | 10 |
| 4 | Packet capture, four filters, four annotations | 20 |
| 5 | `curl -v` trace and timing breakdown | 10 |
| 6 | HAR, waterfall, and slowest-request analysis | 10 |
| 7 | Two injected-failure diagnoses | 12 |
| 8 | Domain or assigned-subdomain proof of control | 8 |
| 9 | One rejected AI claim, with the artifact that rejects it | 10 |
| — | **Evidence standard: AI-use log + redaction attestation** | **included in evidence marks above; no additional blanket deduction** |
| | **Total** | **100** |

Score missing evidence items once within the 40% evidence share, not both in a
task row and again as a fixed penalty. Independently demonstrated domain credit
is retained. The syllabus's explicit safety/integrity rules remain separate.

**How task 4's 20 points split:** capture file present and correctly filtered (4) · four
stages annotated at all (8) · each annotation states what the evidence **does not** prove (4)
· each states how you would check independently (4).

**Hand-drawn sequence diagram (required, folded into task 4's annotation marks):** draw the
URL-to-pixel chain **by hand** and photograph or export it.

**Scope, so you do not have to guess:** all **twelve** links from the Block C diagram —
parse URL, caches, DNS, TCP, TLS, HTTP, edge/CDN, origin, parse HTML, execute JS, render,
interact. Draw it as a **sequence** with these five actors as columns:

```
  your browser  |  your OS + NAT  |  resolver  |  edge/CDN  |  origin
```

**Show the translation explicitly**: the source address and port on the inside, and the pair
the far end reported, from task 4. If your machine has a public address or a global IPv6 path
and **no translation occurred**, draw that instead and label it *"no translation observed —
public address"*. Observing the absence correctly is worth the same as observing the presence.
Label at least three links with the week of this course that owns them.

**Not exported from a diagramming tool** — drawing it yourself, from memory, is how it stops
being a slide you saw and becomes a map you own. **Paper and a photo, a tablet and a stylus,
or a hand-typed structured outline are all equally acceptable**; use whichever works for you.
Legibility matters — if a photo is hard to read, transcribe the labels underneath it. We are
grading the structure, not the penmanship.

---

## 8. A worked example — the depth we expect

**This is the single most useful section of this handout.** Below is what one stage of task
4 looks like at full marks. [`samples/capture-walkthrough.md`](samples/capture-walkthrough.md)
does all four stages this way; read it before you start writing.

---

> ### Stage 1 — DNS
>
> **Display filter:** `dns` · **Matched:** packets 1–2
>
> ```text
> 1   10.0.20.252:54988 -> 1.1.1.1:53    Standard query    A example.com
> 2   1.1.1.1:53 -> 10.0.20.252:54988    Standard response A 104.20.23.154
>                                                          A 172.66.147.243
> ```
>
> From packet 2:
>
> ```text
> transaction id  0x7138    matches the query — this is how the stub resolver
>                           knows the answer belongs to its question
> flags           0x8180    QR=1, RD=1, RA=1, RCODE=0 (NOERROR)
> answers         2
> answer 1        type A  ttl 224  rdata 104.20.23.154
> ```
>
> **What this proves.** The name resolved, to **two** addresses, with **224 seconds** left on
> the TTL. That 224 is not the record's configured value — it is the remainder of a countdown
> already running at the resolver, so somebody else asked about 76 seconds ago (assuming a
> 300 s record). My capture reflects a resolver's memory, not the zone.
>
> **What it does not prove.** Nothing about whether either address is reachable, whether the
> service is up, or whether this is the answer anyone else would get. Two addresses came
> back; my client picked one, and that choice happens below the application.
>
> **How I would check independently.**
> ```bash
> dig +noall +answer example.com A            # ask again, watch the TTL count down
> dig @8.8.8.8 +noall +answer example.com A   # a second, independent resolver
> ```
>
> **What surprised me.** The query is UDP and it is 29 bytes. The single most consequential
> lookup in the whole page load travels in one unacknowledged, unencrypted datagram.

---

## 9. What good looks like vs. what will lose points

| Loses points | Earns points |
| --- | --- |
| "Packet 6 is the TLS ClientHello." | "Packet 6 carries `server_name: example.com` in cleartext, so the hostname is visible on-path even though the payload is not." |
| "The handshake completed successfully." | "The handshake proves a listener accepted the connection; it says nothing about service health — a wedged process still shakes hands." |
| A screenshot of the Wireshark window | The display filter, the packet numbers it matched, and the field values you read |
| "My gateway is 192.168.1.1 and so is my DNS." | "All three roles are the same box because a home router co-locates them; if the resolver failed, names would break and addresses would still route." |
| "AI told me to bind to 0.0.0.0 and it worked." | "The model suggested binding to `0.0.0.0`. My `ss -ltnp` output already showed `0.0.0.0:8080`, so the suggestion was already satisfied and could not have been the cause." |
| Silence about what an artifact cannot show | "Bodies are encrypted from packet 14 on, so I used `curl -v` for the HTTP layer — attached as `05-curl-trace.txt`." |
| A HAR with a live session cookie in it | A HAR with `[REDACTED:cookie]` in place, the field retained, and a specific attestation |

---

## 10. Time estimate

| Task | Estimate |
| --- | ---: |
| 1 · Network config | 25 min |
| 2 · Socket map | 20 min |
| 3 · Failure shapes | 20 min |
| 4 · Capture + four annotations | **90 min** |
| 5 · `curl -v` + timings | 25 min |
| 6 · HAR + waterfall | 35 min |
| 7 · Two failure diagnoses | 50 min |
| 8 · Domain or assigned-subdomain proof | 30 min |
| 9 · Challenged AI claim | 30 min |
| Assembling, sanitising, attestation | 25 min |
| **Total** | **≈ 5 h 50 m** |

**Read that number honestly.** 5 h 50 m assumes you have seen a subnet mask before. **If you
have no networking background at all, budget 9 hours and start early** — the CIDR arithmetic
in task 1 and the packet-byte reading in task 4 are new *skills*, not just new commands, and
new skills take longer than the person who wrote the estimate remembers.

The two tasks that most often overrun:

- **Task 4**, if Wireshark fights your machine or DNS-over-HTTPS hides your queries. Add
  60–90 minutes. **Switch to §6's alternative path the moment you have lost ten minutes to
  an installer** — it is worth full credit and it exists precisely so nobody loses an evening.
- **Task 7**, if you try to write the diagnosis before you have read all the evidence files.
  Read the whole bundle first, then write. It halves the time.

**Start on the day it is assigned.** Not because it is long, but because task 8 depends on a
registrar's verification email and task 4 may depend on an installer that needs a reboot —
neither of which respects your Sunday night.

Complete [foundations steps 1–3](../../docs/web-foundations.md) within this work
budget. Reuse lab captures and the full-credit fixture path instead of spending
another hour recapturing/polishing; no extra assessed artifact is required.
The estimate is not an instruction to add unlimited setup time.

---

## 11. Submission

> ### ⚠ This dossier describes your machine. Keep it private.
>
> It contains your network topology, your listening services, your registrar account, and a
> HAR of your browsing. Treat it as sensitive:
>
> - **Submit through D2L, or through a repository set to private and shared only with course
>   staff.** Do not publish it. Do not push it to a public profile.
> - **Do not paste raw artifacts into an AI assistant** for task 9. Sanitise first — replace
>   addresses, host names, and cookies — or describe the situation in prose and ask about the
>   concept. Whatever you paste into a third-party service, you have published.
> - Delete the domain-verification TXT record once your grade is posted.

A single repository, or a single `.zip` if you prefer, named:

```
csc436-hw1-<lastname>-<campusid>/
├── README.md                     <- see below; this is graded
├── 01-network-config.txt
├── 02-socket-map.txt
├── 03-failure-shapes.txt
├── 04-capture.pcapng             <- or 04-trace.txt on the no-capture path
├── 04-capture-annotated.md
├── 04-sequence-diagram.jpg       <- your hand-drawn chain, including NAT
├── 05-curl-trace.txt
├── 06-network.har
├── 06-waterfall.md
├── 07-failure-diagnoses.md
├── 08-domain-proof.md
└── 09-challenged-claim.md
```

> **Note the numbering.** The lab has you save files as you go under slightly different names
> — the lab's `05-capture.pcapng` is this list's `04-capture.pcapng`, because the homework
> numbers by *task* and the lab numbers by *step*. **Rename when you assemble the dossier.**
> The names above are the ones that are graded.

`README.md` must contain, in this order: your name and campus ID; your commit SHA or tag;
the platform and OS version you worked on; a one-line index of the artifacts; your **AI-use
log**; and your **redaction attestation**.

Submit the repository URL (or the zip) in D2L before class in Week 2.

---

## 12. The non-generatable component, stated plainly

A model can explain DHCP, TCP, NAT, and TLS better than this handout does. It cannot:

- **See your capture.** It has never met your resolver, your gateway, or your NAT pool. Every
  number in tasks 1 through 6 came from a machine no model has access to.
- **Hold your operating responsibility.** Task 8 requires your authorized domain
  or course-subdomain workflow, not a mandatory payment method.
- **Be wrong in a way you can prove.** Task 9 requires you to catch it — which means you have
  to understand the artifact better than the model does, at least once.

Label every number's source: your run, a supplied fixture, or a cited example.
Shared fixture bytes are expected to match; explanations and interpretation
must be your own. Similar output alone is not proof of misconduct.
