# Failure 02 — "The health check just hangs"

**CSC 436 — HW1 task 7, failure 2 of 2.** Diagnose from the evidence in `evidence/`.

> **The answer to failure 01 is not the answer to this one, and the evidence in this bundle
> rules it out explicitly.** If you are about to write "it's bound to localhost", find the
> file that says otherwise first.

---

## The report you received

> **From:** the grading harness, 03:12
>
> `GET https://status.campuspulse-demo.example/healthz` — **no response, request abandoned
> after 30s.** Third consecutive nightly failure. Team notified.

> **From:** Marcus, 08:40
>
> I don't understand this at all. I SSH'd into the VM and ran the health check *on the box*
> and it's a clean 200. The container's up, `docker ps` looks fine, the logs show it serving
> requests. Nothing has been deployed since Tuesday, and it was fine through Wednesday night.
>
> The weird part: it doesn't say refused, it doesn't say anything. `curl` just sits there
> until I get bored. I left it running for four minutes once.
>
> I did notice a warning in the container log about a deprecated config key. Could that be
> it? I asked an assistant and it told me to bind to `0.0.0.0` — but we already do, I
> checked. It also suggested disabling TLS verification, which I did not do.

---

## What you have

| File | What it is |
| --- | --- |
| [`evidence/01-curl-from-outside.txt`](evidence/01-curl-from-outside.txt) | The grader's `curl`, from the public internet |
| [`evidence/02-curl-on-the-box.txt`](evidence/02-curl-on-the-box.txt) | The same check run **on the VM itself**, three ways |
| [`evidence/03-listening-sockets.txt`](evidence/03-listening-sockets.txt) | `ss -ltnp` on the VM |
| [`evidence/04-container-log.txt`](evidence/04-container-log.txt) | The last 40 lines of the container log |
| [`evidence/05-security-group.json`](evidence/05-security-group.json) | Exported inbound firewall rules for the VM, with change history |
| [`evidence/06-dns.txt`](evidence/06-dns.txt) | Resolution for `status.campuspulse-demo.example` from two resolvers |

---

## Answer these, in the format the [bundle README](../README.md) specifies

1. What is the root cause? One falsifiable sentence.
2. **Prove it is not failure 01.** Quote the line that rules out a loopback bind.
3. The request *times out* rather than being refused. Explain, in packets, why the cause you
   named produces silence instead of a rejection — and what a rejection would have implied
   instead.
4. Marcus offers three candidate explanations: the deprecated-config warning, DNS, and the
   assistant's `0.0.0.0` advice. Rule out each with a named file.
5. It worked Tuesday night and nothing was deployed. **Something changed anyway.** What, and
   where in `evidence/` is it?
6. What is the fix, and what is the *first* thing you check afterwards to prove it worked?

---

## The habit this one builds

Failure 01 taught you to read the listening socket. This one is the case where the listening
socket is **perfect** and the service is still unreachable — so the evidence has to take you
somewhere else.

The discriminator is the *shape* of the failure:

- **refused** — a packet arrived, something answered "no" (RST). The host is reachable.
- **timed out with 0 bytes** — nothing answered at all. Something is discarding packets
  silently, or they never arrived.

A firewall that **rejects** produces the first. A firewall that **drops** produces the
second. Nearly every cloud security group drops. Learn what that looks like once and you
will recognise it for the rest of your career.
