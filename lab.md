# Lab — Capture your own traffic, then break your own port

**CSC 436 — Week 1 · 35 minutes**

> **Protect this lab.** If a lecture block runs long, let it end unfinished. The learning
> objective for Week 1 lives here, not in the slides.

---

## What you will have at the end

1. Your machine's own answer to *"where am I on the network?"* — read, not guessed
2. A packet capture in which you can point at the DNS query, the TCP handshake, the TLS
   ClientHello, and an HTTP request
3. A service you broke **on purpose**, diagnosed from its symptoms alone

Steps 1, 3, 4 and 6 are HW1 artifacts. **Save everything as you go** — you are doing a third
of your homework right now, and re-running it later on a different network is not the same.

---

## Before you start (2 min)

| | |
| --- | --- |
| **Everyone** | A terminal, a browser with DevTools, and Node.js |
| **Wireshark** | Installed and able to see your interface. If not — **skip to [step 5-ALT](#step-5-alt--if-you-cannot-capture-5-min)**. It is worth full credit and it takes less time. |
| **Working directory** | Start at the course content root (student release; `instructor` for authors), containing `weeks`, `docs`, and `samples` |

Make a folder for your output now, so nothing is lost to a closed terminal:

```bash
mkdir hw1-evidence
```

**Keep this terminal at the content root** so the sample paths work. Save output
under `hw1-evidence` (prefix output filenames with that folder), or move your
saved evidence there at the end. Use `curl.exe` in PowerShell, not its legacy
`curl` alias; replace `/dev/null` with `NUL`.

---

## Step 1 — Where am I? (4 min)

<table>
<tr><th>Windows (PowerShell)</th><th>macOS</th><th>Linux</th></tr>
<tr><td>

```powershell
ipconfig /all      > 01-config.txt
route print -4    >> 01-config.txt
arp -a            >> 01-config.txt
```

</td><td>

```bash
ifconfig            > 01-config.txt
netstat -rn -f inet >> 01-config.txt
arp -a             >> 01-config.txt
```

</td><td>

```bash
ip addr      > 01-config.txt
ip route    >> 01-config.txt
ip neigh    >> 01-config.txt
```

</td></tr>
</table>

**Expected:** an IPv4 address, a subnet mask (or `/prefix`), a default gateway, and one or
more DNS servers.

**Now answer these out loud to yourself — two minutes, no typing:**

1. What is your mask in CIDR? Convert it in your head. `255.255.255.0` → `/24`.
   `255.255.128.0` → count the ones: `/17`.
2. Are your gateway, DHCP server, and DNS resolver the **same address**? On a home network
   they usually are — one box doing three jobs. Name the three jobs.
3. Is your address in `10.`, `172.16–31.`, or `192.168.`? Then it is **private**, and nothing
   on the internet can address a packet to it.

> **Reference:** [`samples/network-config.txt`](samples/network-config.txt) is the same
> output, fully annotated, from a machine where the three roles are three different servers.

---

## Step 2 — What is listening, and on which address? (4 min)

<table>
<tr><th>Windows</th><th>macOS</th><th>Linux</th></tr>
<tr><td>

```powershell
netstat -ano > 02-sockets.txt
Get-NetTCPConnection -State Listen |
  Format-Table LocalAddress,LocalPort,
    OwningProcess
```

</td><td>

```bash
lsof -nP -iTCP -sTCP:LISTEN > 02-sockets.txt
netstat -an | grep LISTEN
```

</td><td>

```bash
ss -ltnp > 02-sockets.txt
ss -tn state established
```

</td></tr>
</table>

**Read the local address column, not the port.** Find one listener on `127.0.0.1` and one on
`0.0.0.0` (shown as `*` or `[::]` on some platforms).

> **Ask yourself now, because it is step 6's answer:** what is the difference between those
> two, for a client on another machine?

---

## Step 3 — Is the far end reachable? Three ways to ask (4 min)

```bash
# 1. ICMP — the classic, and the most misleading
ping www.depaul.edu                  # add -n 4 on Windows, -c 4 elsewhere

# 2. The path, hop by hop
tracert -d -h 15 www.depaul.edu      # Windows
traceroute -n -m 15 www.depaul.edu   # macOS / Linux

# 3. The port you actually care about
curl -sS -o /dev/null -w "%{http_code} in %{time_total}s\n" https://www.depaul.edu/
```

*(Windows: `-o NUL` instead of `-o /dev/null`.)*

**Expected — and this is the point of the step:** on many campus, corporate, and cloud
networks, **1 and 2 will fail while 3 succeeds.** Rows of `* * *` in traceroute and 100%
packet loss in ping, and a clean `200` from `curl`.

If that happens to you, write down the one sentence this lab exists to teach:

> **ICMP being blocked is evidence about ICMP. It is not evidence about my service.**

If ping *does* work, note the round-trip time — you will compare it against your TCP
handshake in step 5.

**Save:** `03-reachability.txt`

> **Reference:** [`samples/path-and-nat.txt`](samples/path-and-nat.txt) has this exact
> contrast captured, plus hard evidence of NAT rewriting both the source address and the
> source port.

---

## Step 4 — What the far end actually sees (2 min)

```bash
curl -sS -v https://www.depaul.edu/ -o /dev/null 2> 04-curl.txt   # -o NUL on Windows
curl -sS https://ifconfig.me/all
```

In `04-curl.txt`, find the line that reads roughly:

```text
* Established connection to www.depaul.edu (64.239.109.65 port 443)
  from 10.0.20.252 port 49302
```

Compare the public address reported by the echo service with your private address.
This is evidence consistent with NAT or a proxy. **Do not compare the two source
ports as proof of rewriting:** these requests go to different destinations and
use different connections. NAPT may preserve a port. To prove a rewrite, correlate
the **same flow** at both ends or use the explicitly labeled supplied fixture.
Public IPv6 may have no NAT at all. Redact the public address before submission.

---

## Step 5 — Capture a real page load (10 min)

> ### ⚠ Read this first — it will save you twenty minutes
>
> **Modern browsers may send DNS over HTTPS (DoH).** Chrome and Edge ship "Secure DNS" in
> automatic mode, Firefox enables DoH by default in some regions. When DoH is active, your
> DNS query is encrypted inside a TLS connection to a resolver — so Wireshark's `dns` filter
> matches **nothing**, and it looks like your capture is broken.
>
> Two ways to avoid it. Pick one:
>
> - Try `curl` to simplify the capture, but it does **not guarantee UDP/53**:
>   answers may be cached, configured DoH/DoT may apply, or DNS may use TCP.
> - Do not change managed browser/network security settings. If DNS is not visible,
>   record the absence and use the supplied DNS exchange for that annotation.
>   A missing DNS packet alone does not identify the cause.

1. **Open Wireshark** and pick the interface with traffic on it (the one with a moving
   sparkline).
2. **Set a capture filter first** — this keeps the file small and your classmates' traffic
   out of it:
   ```text
   host example.com or port 53
   ```
3. Start the capture.
4. Generate the traffic. **The `curl` route is the reliable one:**
   ```bash
   curl -sS https://example.com/ -o /dev/null     # -o NUL on Windows
   curl -sS http://example.com/  -o /dev/null     # cleartext, for the HTTP filter
   ```
   If you would rather use a browser, load `https://example.com/` in a **private/incognito**
   window with Secure DNS disabled per the warning above.
5. Stop the capture. **File → Save As →** `05-capture.pcapng`.
6. Now run these four display filters in turn. For each, note the packet numbers.

| # | Display filter | You are looking for |
| --- | --- | --- |
| 1 | `dns` | the query and the response. **Read the TTL.** |
| 2 | `tcp.flags.syn == 1` | SYN and SYN+ACK per successful TCP connection; retries/multiple connections add packets |
| 3 | `tls.handshake.type == 1` | ClientHello; SNI is normally visible unless ECH protects the inner name |
| 4 | `http.request` | matches the **cleartext** request only — zero matches for the HTTPS one |

**Filter 4 matching nothing on the HTTPS connection is the lesson, not a failure.**
HTTP application data is encrypted; some TLS handshake metadata is still visible.
The second `curl` in step 5 is the plaintext request
that makes `http.request` match, so you can read the HTTP layer in the clear exactly once.

**Then, for each of the four, write one sentence answering: *what does this prove, and what
does it not prove?*** That framing is the whole HW1 annotation standard, and
[`samples/capture-walkthrough.md`](samples/capture-walkthrough.md) shows it done in full for
these exact four stages.

---

### Step 5-ALT — if you cannot capture (5 min)

**Use this the moment Wireshark costs you more than five minutes.** It is worth full credit
in HW1 and it is not a lesser path.

```bash
# 1. Open the provided capture — it contains all four stages
#    weeks/week01/samples/week01-fallback-capture.pcap
```

Run the same four display filters against it. All four match, including `http.request`.

**Read [`samples/README.md`](samples/README.md) first.** It states exactly which parts of
that file are real captured bytes (the DNS exchange, the TLS ClientHello, the certificate,
the HTTP request and response) and which are reconstructed (the Ethernet, IP, and TCP
framing). Repeating that distinction in your write-up is part of the answer.

Then capture what you *can* — a real byte-level trace from your own machine:

```bash
curl -sS -v --trace-ascii 05-trace.txt https://example.com/ -o /dev/null
```

Open `05-trace.txt`. Those are the actual bytes your machine sent and received. Find the TLS
records at the top and the HTTP request below them.

---

## Step 6 — Break your own listening port (7 min)

**This is the part you will remember.**

### 6a. Start the service, bound to loopback

```bash
node weeks/week01/samples/campuspulse-stub.mjs 127.0.0.1 8471
```

It prints `campuspulse listening on 127.0.0.1:8471`. **It is telling the truth, and the
truth is not what you need to know.**

### 6b. In a second terminal, look at the socket

```powershell
netstat -ano | findstr :8471          # Windows
```
```bash
ss -ltnp | grep 8471                  # Linux
lsof -nP -iTCP:8471 -sTCP:LISTEN      # macOS
```

Note the **local address**: `127.0.0.1`, not `0.0.0.0`.

### 6c. Knock on three doors — all on your own machine

```bash
curl -sS --max-time 6 http://127.0.0.1:8471/healthz        # expect 200
curl -sS --max-time 6 http://localhost:8471/healthz        # expect 200
curl -sS --max-time 6 -v http://<YOUR-LAN-IP>:8471/healthz # expect REFUSED
```

Use the IPv4 address from step 1 for `<YOUR-LAN-IP>`.

**Expected:**

```text
curl: (7) Failed to connect to 192.168.1.47 port 8471: Connection refused
```

That request originated on the server machine. The loopback-only socket is a
specific explanation, but host firewall/active-reject policy can still affect a
local-to-LAN-address request. Correlate the listener with the error; do not
infer "no firewall" from the test's location.

### 6d. Diagnose from the symptom, before you fix it

Answer these before touching anything:

1. It said **refused**, not *timed out*. What does that tell you about whether the packet
   arrived?
2. Which of these has it ruled out? *(a)* the host is down *(b)* DNS *(c)* a firewall
   dropping packets *(d)* the process is not listening on that address
3. What single command would confirm your hypothesis?

<details>
<summary><strong>Check yourself</strong> — open only after you have answered</summary>

1. A refusal is an active rejection, consistent with no matching listener or an
   active-reject rule. The listener table makes the bind defect concrete here.
2. A literal IP bypasses DNS. A pure silent drop would not itself explain an
   immediate refusal; rejection does not prove which device sent it or rule
   out every firewall policy.
3. The socket table from 6b. The local address column says `127.0.0.1`.

</details>

### 6e. Fix it, and prove the fix

Stop the server. Restart it bound to every interface:

```bash
node weeks/week01/samples/campuspulse-stub.mjs 0.0.0.0 8471
```

Re-run **the socket check first**, then the three curls:

```powershell
netstat -ano | findstr :8471     # local address is now 0.0.0.0
```
```bash
curl -sS --max-time 6 http://127.0.0.1:8471/healthz          # 200
curl -sS --max-time 6 http://<YOUR-LAN-IP>:8471/healthz      # 200
```

**The socket table is the proof.** A successful request tells you the symptom moved; the
changed local address tells you *why*. Graders in this course want the second one.

### 6f. Now see the other failure shape

```bash
curl -sS --max-time 8 -v http://192.0.2.1/     # documentation address, not a guaranteed black hole
```

Some networks time out (exit 28); others actively reject this destination.
Record the actual error text and whether TCP established. `time_connect` or
exit 7 alone does not discriminate refusal from every other connect failure.
Use `samples/refused-vs-timeout.txt` if your network cannot produce both shapes.

**Save 6b through 6f as `06-break-and-fix.txt`.** Two of the three failure shapes in HW1 task
3 are now done.

---

## Step 7 — Wrap (2 min)

Stop the stub server (`Ctrl+C`). Confirm the port is released:

```powershell
netstat -ano | findstr :8471     # expect no output
```

You should now have: `01-config.txt`, `02-sockets.txt`, `03-reachability.txt`, `04-curl.txt`,
`05-capture.pcapng` (or `05-trace.txt`), and `06-break-and-fix.txt`.

**Before you close the laptop, write one sentence** at the top of `06-break-and-fix.txt`:
*the difference between "refused" and "timed out", and what each one rules out.* That
sentence is the exit ticket and it is the most reusable thing in this session.

---

## Troubleshooting

### Wireshark shows no interfaces, or an empty list

| Platform | Cause | Fix |
| --- | --- | --- |
| Windows | Npcap not installed or not running | Re-run the Wireshark installer, **tick Npcap**, reboot. Then `sc query npcap`. |
| macOS | `/dev/bpf*` not readable by you | Run the `Install ChmodBPF` package that ships in the Wireshark `.dmg`, then log out and back in |
| Linux | Not in the `wireshark` group | `sudo dpkg-reconfigure wireshark-common` → yes, then `sudo usermod -aG wireshark $USER`, then **log out and back in** |
| Any | Corporate MDM blocks packet capture | **Not fixable in 35 minutes.** Go to [step 5-ALT](#step-5-alt--if-you-cannot-capture-5-min). |

> **Do not run Wireshark's GUI as root or Administrator.** It is a large parser exposed to
> hostile input; the whole point of the helper installs above is to avoid that.

### The capture is empty, or shows only your own machine talking to itself

- You picked the wrong interface. Choose the one with a moving sparkline on the start screen.
- **You are on a VPN.** Capture on the VPN's virtual adapter (`utun`, `tun0`, `TAP-Windows`)
  rather than the physical one, or disconnect briefly if policy allows.
- Your capture filter is too narrow, or has a typo. Capture filters use **BPF** syntax
  (`host example.com`), display filters use **Wireshark** syntax (`ip.addr == …`). They are
  not interchangeable and a typo in a capture filter silently gives you nothing.

### `tls.handshake.type == 1` matches nothing

- Your Wireshark predates the `ssl` → `tls` rename. Try `ssl.handshake.type == 1`, then
  upgrade.
- You reused an already-open connection or captured the wrong interface.
  Session resumption still sends a ClientHello on a new TLS connection.
- You captured after the page had already started loading. Start the capture *first*.

### `dns` matches nothing, but the page loaded fine

Possible causes include an OS/browser cache, encrypted DNS, the wrong interface,
or the capture starting after resolution. `curl` does not guarantee a plain DNS
query. Use the supplied exchange if needed and label it; do not weaken managed
network settings to force a packet.

Two rarer causes worth knowing:

- **The answer was cached**, by the OS or browser, so no query was sent.
  Waiting or using the provided fixture is sufficient; a global cache flush is not required.
- **Your resolver is reached over TCP/853 (DoT)** — some managed and mobile configurations
  do this. Same effect, same fix.

### `curl` is not recognised (older Windows)

`curl.exe` ships with Windows 10 1803 and later. On older builds, use PowerShell's
`Invoke-WebRequest`, or install curl from [curl.se/windows](https://curl.se/windows/).

> **Watch out:** in PowerShell, `curl` is an *alias for `Invoke-WebRequest`*, which does not
> accept `-v` or `-w`. **Always type `curl.exe`** in PowerShell to get the real thing.

### Port 8471 is already in use (`EADDRINUSE`)

Something else owns it. **Find the owner before you change the port** — that habit is worth
more than the fix:

```powershell
netstat -ano | findstr :8471        # then: Get-Process -Id <PID>
```
```bash
ss -ltnp | grep 8471                       # Linux
lsof -nP -iTCP:8471 -sTCP:LISTEN           # macOS
```

Then pass a different port: `node campuspulse-stub.mjs 127.0.0.1 8479`.

### `curl http://<LAN-IP>:8471/` times out instead of being refused

That is a **different failure**, and finding it is a good outcome. A host firewall is
dropping the packet before the kernel can reject it. On Windows, Defender Firewall prompts
for new listeners; if you dismissed the prompt, the rule may be Block. Either way: **note it,
because you have just produced the second failure shape yourself**, and it is exactly
injected failure 02 in miniature.

---
