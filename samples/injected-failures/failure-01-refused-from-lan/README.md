# Failure 01 — "It works for me, it doesn't work for my partner"

**CSC 436 — HW1 task 7, failure 1 of 2.** Diagnose from the evidence in `evidence/`.
Do not read the other failure's material first; they are meant to be separated.

---

## The report you received

> **From:** Priya, 21:14
>
> Hey — I've got CampusPulse running on my laptop for the demo tomorrow. `/healthz` returns
> 200 for me all day. Dev is on the same Wi-Fi in the same room and gets **nothing**. She
> says "connection refused."
>
> I restarted the app twice. I turned the Windows firewall off completely and it changed
> nothing. I checked the port about ten times, it is definitely 8471 in the config and
> definitely 8471 in her URL. I even pinged my laptop from her machine and *that* didn't
> work either, so maybe the campus Wi-Fi is blocking us from seeing each other?
>
> Can we just move it to port 80? I read that 8471 might be blocked.

---

## What you have

| File | What it is |
| --- | --- |
| [`evidence/01-app-startup.log`](evidence/01-app-startup.log) | The application's own startup output on Priya's laptop |
| [`evidence/02-listening-sockets.txt`](evidence/02-listening-sockets.txt) | `netstat -ano` and `Get-NetTCPConnection`, run on Priya's laptop |
| [`evidence/03-curl-from-priya.txt`](evidence/03-curl-from-priya.txt) | `curl -v` run **on Priya's laptop**, against three different addresses |
| [`evidence/04-curl-from-dev.txt`](evidence/04-curl-from-dev.txt) | `curl -v` run **on Dev's laptop**, plus a `ping` |
| [`evidence/05-ipconfig-priya.txt`](evidence/05-ipconfig-priya.txt) | Priya's `ipconfig` — the addresses her machine actually holds |

You may not run anything against Priya's laptop. It is 21:14 and she has gone to bed.

---

## Answer these, in the format the [bundle README](../README.md) specifies

1. What is the root cause? One falsifiable sentence.
2. Priya offers three hypotheses — port 8471 is blocked, the Wi-Fi has client isolation, and
   the firewall. **Each one is refuted by something in `evidence/`.** Name the file and the
   line that refutes each.
3. `ping` from Dev to Priya's laptop also failed. Does that support Priya's Wi-Fi theory?
   Answer with reference to a specific piece of evidence.
4. What is the fix, and how would you *prove* it worked — using evidence, not a browser?
5. Priya's last suggestion is to move to port 80. If she did that and changed nothing else,
   what would Dev see? Explain in terms of the socket, not the app.

> **Question 3 is the one most students get wrong.** Read it twice.

---

## The trap, stated openly

There is one line in `evidence/` that settles this in about four seconds, and it is not in
the file you will look at first. Most people open the curl transcripts, see "refused", and
start reasoning about firewalls. The socket table already told you the answer.

The habit this failure is trying to build: **when a connection fails, look at the listening
socket before you look at anything else.**
