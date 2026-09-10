# Week 1 — Pre-class prep

**CSC 436 — Web Application Systems: From URL to Operable Product**
**Time budget: ~60 minutes** · Due **before** the Week 1 session · Readiness check in D2L

New to terminals or web pages? Begin with [getting started](../../docs/getting-started.md).
The ungraded diagnostic and supported foundations practice are staged separately;
they are not extra reading hidden in this prep estimate.

> **Class assumes this is done.** The ten-minute opening includes a short baseline
> review, a focused prep recap, and course logistics. Bring unresolved questions;
> the overview comes first and the detailed networking work follows in Block B.

---

## Why this prep, specifically

Week 1 is the highest-attrition session in this course for students with no networking
background — and that is almost always a **confidence** problem rather than an ability one.
The seven resources below exist to make sure the words *subnet*, *gateway*, *NAT*, and
*datagram* are already familiar when you hear them in a lecture hall, so that the session can
spend its time on the parts that actually take practice.

If you already know this material, the readiness check will take you four minutes. Take it
anyway — question 5 is not a definition question.

---

## Core assignment (~49 min) — seven focused resources

| # | Resource | Publisher | Type | Time |
| --- | --- | --- | --- | ---: |
| 1 | [Network Stacks and the Internet](https://www.youtube.com/watch?v=PG9oKZdFb7w) | Computerphile (Richard Mortier) | Video | 11 min |
| 2 | [What is the OSI Model?](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/) | Cloudflare Learning Center | Article | 7 min |
| 3 | [What is an IP Address?](https://www.cloudflare.com/learning/network-layer/what-is-an-ip-address/) | Cloudflare Learning Center | Article | 5 min |
| 4 | [What is a Subnet?](https://www.cloudflare.com/learning/network-layer/what-is-a-subnet/) | Cloudflare Learning Center | Article | 6 min |
| 5 | [NAT and return traffic](reference.md#nat-and-return-traffic) | Course public networking walkthrough | Worked explanation | 5 min |
| 6 | [RFC 2131 (DHCP)](https://www.rfc-editor.org/rfc/rfc2131.html) — **§1–2 only** | IETF / R. Droms | Spec, skim | 6 min |
| 7 | [Transport Layer and UDP Explained](https://www.youtube.com/watch?v=ihvbhwGblQg) | Computerphile (Richard Clegg) | Video | 9 min |

**If a Cloudflare page is inaccessible:** use the
[course-written networking basics](reference.md#networking-basics-for-the-prep)
instead of items 2–4. Item 5 already uses the public course walkthrough because
the former NAT page was confirmed to return 404 in a browser. This is an
equivalent full-credit reading path **within** the same time budget, not
additional resources. An automated HTTP 403 does not
by itself mean the original page is broken; no sign-in, subscription or security
setting change is required to complete prep.

**Use the remaining ~11 minutes for the policy overview and readiness check:**

- [The authoritative syllabus](../../docs/new_syllabus.md) — read *Individual Work and AI Use* and *Safe Use of Course Systems*
- [The AI-use policy](../../docs/ai-use-policy.md) — you will be asked to apply it in Week 1

---

## How to read each one

Do not read passively. Each item below has **one question to hold in your head** while you
read it, and that question is what the readiness check is drawn from.

### 1. Network Stacks and the Internet *(11 min, video)*

> **Hold this question:** why is the stack built in layers at all, rather than as one
> protocol that does everything?

The answer — that each layer can be replaced without rewriting the others — is why we can
run HTTP/3 over QUIC over UDP without changing a single application. Week 1 Block C shows
you that substitution happening.

### 2. What is the OSI Model? *(7 min)*

> **Hold this question:** which layer does an IP address belong to, and which layer does a
> MAC address belong to?

You will use exactly that distinction in Block B. **You do not need to memorise all seven
layers**, and nobody will ask you to recite them. You need layers 2, 3, 4 and 7, and you
need to know that the OSI model is a teaching tool while TCP/IP is what actually runs.

### 3. What is an IP Address? *(5 min)*

> **Hold this question:** what makes an address *private*, and what does that prevent?

### 4. What is a Subnet? *(6 min)* — **the most important one**

> **Hold this question:** given an address and a mask, how do you decide whether another
> address is on the same subnet?

If you read only one item, read this one, and **practise the arithmetic until it is boring.**
Convert these four to CIDR before class:

```text
255.255.255.0    -> /?      255.255.128.0  -> /?
255.255.255.192  -> /?      255.240.0.0    -> /?
```

<details>
<summary>Check yourself</summary>

`/24`, `/17`, `/26`, `/12`. Count the ones in binary: 255 is eight ones, 128 is `1000 0000`
(one), 192 is `1100 0000` (two), 240 is `1111 0000` (four).
</details>

### 5. What is NAT? *(5 min)*

> **Hold this question:** if your laptop's address is private, how does a reply from a web
> server ever find its way back to you?

Use the course-written explanation linked in item 5. Keep the jobs separate:
**DHCP configures the host; NAT/NAPT translates address/port mappings.**
They may run on the same router, but neither is a synonym for the other.

### 6. RFC 2131 §1–2 *(6 min, skim)*

**Sections 1 and 2 only.** Do not read the whole RFC — it is 45 pages and the rest is not
assigned.

> **Hold this question:** DHCP is the first spec you will read in this course. What does the
> *register* of a specification feel like compared to a tutorial?

That is a real learning objective. By Week 8 you will be reading OAuth and OIDC specs to
settle arguments, and getting used to the tone now is worth six minutes.

### 7. Transport Layer and UDP Explained *(9 min, video)*

> **Hold this question:** name one thing TCP does for you that UDP does not, and one
> situation where you would not want it done.

---

## Optional enrichment — not assigned, not tested

Only if the core felt easy:

- [RFC 1918 — private address allocation](https://www.rfc-editor.org/rfc/rfc1918.html) — short and readable, and it is where `10.`, `172.16.`, and `192.168.` were decided
- [RFC 9293 — TCP](https://www.rfc-editor.org/rfc/rfc9293.html) — §3.5, connection establishment, is four pages and is the definitive account of the handshake
- [Julia Evans — networking zines and posters](https://wizardzines.com/) — illustrated, excellent if diagrams work better for you than prose

---

## Bring to class

- [ ] A laptop you can run `curl` and a terminal on
- [ ] **Wireshark installed and confirmed working** — [wireshark.org/download.html](https://www.wireshark.org/download.html). Open it before class and check that your network interface appears in the list. If it does not, that is fine, and there is a full-credit alternative path in the lab — but find out **now**, not at minute 20 of the lab.
- [ ] Choose a Week 2 DNS path using [the supported dig setup](../../docs/getting-started.md#6-dig-without-an-obsolete-windows-installer):
      existing WSL/Linux, the course shell, or supplied trace analysis with native
      DNS observations. No current ISC Windows BIND installer is required.
- [ ] Node.js **24 LTS** installed (for helper scripts and the first web app)

---

## Readiness check — 5 questions

In D2L. Auto-graded, **two attempts**, counts toward participation. Do it after the reading
and before class; it takes about five minutes.

Questions 1–4 check the reading. **Question 5 does not have a lookup-able answer** — it is
there to surface what you actually believe, and it is the one the session opens on. Answer it
honestly rather than correctly.

---

<a id="instructor-only"></a>
