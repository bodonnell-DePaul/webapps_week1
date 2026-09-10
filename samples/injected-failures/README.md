# Instructor-injected failures — Week 1

**CSC 436 — HW1, task 7.** Two failures. Diagnose each from the evidence you are given.

---

## What these are

Each folder contains an **evidence bundle**: the artifacts an operator would actually have
in front of them, and nothing else. No source code, no access to the machine, no ability to
run a new command. You get what the on-call engineer got at 02:00.

That constraint is the assignment. Anyone can diagnose a system they can poke at. The skill
being tested is reading evidence that is already fixed.

| Folder | Symptom the reporter used | What it actually tests |
| --- | --- | --- |
| [`failure-01-refused-from-lan/`](failure-01-refused-from-lan) | "It works for me, it doesn't work for my partner" | Listening address vs. port; refused means *something answered* |
| [`failure-02-timeout-from-outside/`](failure-02-timeout-from-outside) | "The health check just hangs" | Drop vs. reject; ruling a cause **out** with evidence |

They are deliberately **not** the same failure twice. The correct answer to the first is the
wrong answer to the second, and the evidence in the second bundle rules it out explicitly.
If you find yourself writing the same diagnosis for both, re-read the socket table.

---

## Honesty note — read this, it is part of the lesson

These are **constructed teaching scenarios**, and this file says so on purpose.

- The **fault behaviour is real.** Every exit code, error string, timing, and socket-table
  line was produced by reproducing the fault on a real machine and copying the result. The
  reproduction commands are below; run them yourself.
- The **deployment identity is fictional.** Host names, public addresses, and the security
  group belong to a made-up CampusPulse deployment, kept consistent across the bundle.
  Public addresses use [RFC 5737](https://www.rfc-editor.org/rfc/rfc5737.html) documentation
  ranges (`198.51.100.0/24`, `203.0.113.0/24`) so nothing points at a real host.

Disclosing the boundary between what is captured and what is constructed is exactly what
part 8 of the [evidence standard](../../../../docs/evidence-standard.md) asks of you. We are
modelling it before we grade it.

---

## What you submit, per failure

A short written diagnosis — target **200–350 words each** — containing all five of:

1. **The observation.** Quote the specific line(s) of evidence you are reasoning from. Not
   "the curl failed" — the exit code and the message.
2. **The mechanism.** What happened on the wire, in packets. Say SYN, RST, drop, FIN.
3. **The root cause**, stated as a single falsifiable sentence.
4. **A cause you ruled OUT, and the specific evidence that ruled it out.** This is worth as
   much as the right answer. A diagnosis that only argues *for* one cause is a guess that
   happened to land.
5. **The one command** you would run to confirm — and what output would prove you wrong.

> **A wrong diagnosis with correct reasoning from the evidence earns most of the credit.
> A right diagnosis with no reasoning earns very little.** We are grading the method.

---

## Reproducing the fault behaviour yourself

Encouraged, and it is the fastest way to understand the difference:

```bash
# Failure 1 — refused. Bind to loopback, then knock on the LAN address.
node ../campuspulse-stub.mjs 127.0.0.1 8471
curl -sS --max-time 6 http://127.0.0.1:8471/healthz     # 200
curl -sS --max-time 6 http://<your-lan-ip>:8471/healthz # exit 7, refused

# Failure 2 — silent drop. A black-holed address behaves exactly like a DENY rule.
curl -sS --max-time 8 http://192.0.2.1/healthz          # exit 28, timed out
```

Run both. The difference between "answered no" and "said nothing" is the whole unit.

---
