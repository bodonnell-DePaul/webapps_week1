# Week 1 public reference — trace a request without overclaiming

Use this as a lookup while completing the lab/HW1, not an additional prep
assignment. [Getting started](../../docs/getting-started.md) teaches terminals,
Git and domain access; [web foundations](../../docs/web-foundations.md) teaches
the first page, CSS and DOM. Generated class notes contain visible slides only.

## Vocabulary to keep separate

- **Browser/client:** asks for resources and renders/interacts with them.
- **Server:** a process listening at an address and port; not necessarily a
  physical machine. A container is another environment in which it can run.
- **IP address:** a network-layer address. **Port:** identifies a transport
  endpoint on that address. **DNS:** maps names to records, not URLs to pages.
- **Subnet/prefix:** helps decide whether a destination is on-link or needs a
  router. **Gateway:** a next-hop router, not necessarily your DNS/DHCP server.
- **Loopback:** this machine's local path, not another device's address.
  `0.0.0.0` is a wildcard listener address, not the address you give a browser.
- **NAT/NAPT:** translation of addresses and possibly ports. Ports can be
  preserved; compare the same connection at both ends before claiming a rewrite.

## Networking basics for the prep

The Internet stack separates responsibilities so a change at one layer need not
rewrite every other layer. The OSI model is a teaching vocabulary, not a list of
seven separate programs installed on a laptop:

| Layer/job | Example | What to recognize |
| --- | --- | --- |
| Link, often called layer 2 | Ethernet/Wi-Fi frames and MAC addresses | Delivery on one link |
| Network, layer 3 | IP addressing and routing | Delivery across routed networks |
| Transport, layer 4 | TCP/UDP ports | Conversations between processes |
| Application, layer 7 | HTTP | Meaning of a request/response |

A router forwards an IP packet in a new link-layer frame. The final IP
destination normally stays the same while TTL/hop-limit changes; NAT is a
separate mechanism that may translate addresses.

An IPv4 address has 32 bits, written as four decimal octets. A `/26` prefix
means 26 network bits and 6 host bits: 64 total addresses. For example,
`192.168.40.20/26` belongs to `192.168.40.0` through `192.168.40.63`.
In an ordinary subnet the first/last are network/broadcast, leaving 62 host
addresses. `192.168.40.70` is outside that prefix. `/31` point-to-point links
and `/32` host routes are special cases, not applications of the subtract-two rule.
The `/26` mask is `255.255.255.192`; 192 is binary `11000000`.

RFC 1918 private ranges are `10.0.0.0/8`, `172.16.0.0/12` (second octet
16–31) and `192.168.0.0/16`. They can be routed inside private networks but
are not globally unique public Internet destinations. An address outside these
ranges is not automatically a usable public address: other special ranges exist.

For a fresh DHCP lease, a client typically discovers servers, receives offers,
broadcasts its selecting REQUEST so other servers know which offer it chose,
and receives an acknowledgement. The lease can include address, mask, gateway,
DNS resolver and expiry. Renewing an existing lease need not repeat all four
steps. One physical router can perform gateway, DNS-forwarding and DHCP roles.

### NAT and return traffic

**DHCP configuration and NAT translation are different jobs.** DHCP can assign
the host's address, mask, gateway and DNS settings; a host can also be configured
statically. NAT does not assign that local host configuration. A home router
often runs both services, which can make short descriptions blur the distinction.

At a NAT gateway, an outbound private address may be translated to a public
address. NAPT also tracks ports so replies can be mapped to the initiating
internal connection. The gateway can preserve a source port or choose another.
That mapping is not application authorization and does not replace a firewall.
IPv6 deployments commonly route without address translation.

For example, a gateway could keep this mapping for one TCP connection:

| Inside endpoint | Translated endpoint | Remote endpoint |
| --- | --- | --- |
| `10.1.2.3:50210` | `203.0.113.7:60042` | `192.0.2.5:443` |

These are illustrative documentation values, **not test targets or a captured
connection**. The server replies to `203.0.113.7:60042`; the gateway's mapping
directs that reply back to `10.1.2.3:50210`. Another internal client gets a
distinct applicable mapping so the gateway can distinguish the conversations.
A port-forwarding rule is an explicit inbound configuration, not something a
private address acquires merely because an app runs there.

Before continuing, explain which state the reply relies on and why the same
private address can be used in many unrelated homes without identifying one
public destination.

**Reference, not additional required prep:** [RFC 3022, section 2 — Overview of
traditional NAT](https://www.rfc-editor.org/rfc/rfc3022.html#section-2) distinguishes
Basic NAT (address translation) from NAPT (also translating transport identifiers).
This informational RFC provides terminology; use the course walkthrough above
for the assigned five-minute reading.

### TCP and UDP

TCP supplies a reliable, ordered byte stream with loss recovery; UDP sends
datagrams without providing those guarantees itself. An application can choose
to add reliability or tolerate loss. QUIC builds a reliable encrypted transport
over UDP—it does not make raw UDP inherently reliable.

## What an observation establishes

| Observation | Supports | Does not establish |
| --- | --- | --- |
| Wi-Fi connected | Local attachment | Internet access or a healthy website |
| DNS answer | That resolver's answer at that moment | Every user's answer |
| TCP handshake | A transport connection was accepted | A functional API |
| Immediate refusal | An active rejection | Which device rejected it, or absence of firewall policy |
| Timeout | The requested operation did not finish in the deadline | A unique cause, or that no bytes ever moved |
| Successful TLS validation | This client's chain/name/time/trust checks passed | Correct application authorization or trustworthy business content |
| Painted page | Some rendering completed | Every script/API request completed or controls work |

Inspect curl's error **text**, connection progress and timings together.
Exit 7 is not exclusively refusal; `time_connect` alone is not a
refusal-versus-timeout discriminator. Record environmental differences honestly.

## Capture and privacy checklist

1. Capture only your own authorized traffic, with a narrow filter and short
   duration. Keep unrelated applications out of the capture.
2. DNS may be cached or encrypted even when using curl. No visible DNS packet
   does not prove the lookup failed.
3. TLS encrypts HTTP content; some handshake metadata remains visible. A new
   resumed TLS connection still sends ClientHello. Reusing an existing
   connection may avoid a new handshake entirely.
4. Use the supplied fallback for unavailable stages and label which bytes were
   captured versus reconstructed. It earns full credit with the required analysis.
5. Sanitize HARs, cookies, authorization values, host/device identifiers and
   public addresses before submission or sharing with an assistant.

Each annotation should distinguish **observation → hypothesis → confirming or
falsifying check**. Do not turn a plausible explanation into a proven cause.
The [HW1 supplied review draft](../../docs/non-ai-review-artifacts.md#hw1---capture-interpretation-draft)
provides the no-personal-AI route; your interpretation and evidence remain yours.
