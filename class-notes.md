# Week 1: Course Intro and the Network Underneath — class notes

These notes contain the student-visible teaching material and examples. Complete the exercises individually. Instructor delivery notes and answer keys are not included.

## Weekly session — Course Intro and the Network Underneath

Review, preparation, logistics, teaching, individual practice, and the end-of-class brief

## Short review

### Two laptops, one destination

> **Key idea**
>
> An illustrative classroom scenario: one simple goal, many cooperating systems.

#### Maya's Mac

- Joins the classroom Wi-Fi
- Enters `https://www.depaul.edu`
- Opens the home page and follows a link

#### Luis's Windows laptop

- Joins the same classroom Wi-Fi
- Enters the same web address
- Wants the same usable page

## Weekly logistics

### Where the course rules live

- **The syllabus is the rulebook.** Schedule, grading, deadlines, and policies live there, and we walk through it separately today
- **These slides never replace it.** If a slide and the syllabus ever disagree, the syllabus wins
- **Two companion documents:** the AI-use policy, and the evidence standard that defines what counts as proof in this course
- **Unresolved questions go to the discussion board,** so an answer is written down once for everybody

> **Tip**
>
> **Logistics questions: now**, before we start the journey. After this slide we are on the technical material.

**Sources**

- Course — [syllabus](../../docs/new_syllabus.md) · [AI use policy](../../docs/ai-use-policy.md) · [evidence standard](../../docs/evidence-standard.md)

## Block A — The whole journey

### The map we will keep coming back to

![Five stages: join a network, get settings, find the website, exchange a page, and use the page](../../assets/class-notes/week01-session-s4-1.svg)

*A fresh visit, grouped into five stages. Later slides unpack the jobs inside each stage.*

### Four words about where your request goes

| Word | What it means, in one sentence |
| --- | --- |
| Network | A set of connected devices that can send messages to each other. |
| The Internet | An enormous collection of networks that agreed to pass each other's messages. |
| IP address | The numeric address a device uses on a network, so replies can find their way back. |
| Gateway (router) | The device on your network that forwards traffic to destinations outside it. |

> **Key idea**
>
> These words name the route a request takes: your computer starts on one network, and its gateway sends it toward another.

### Four words about what your request asks for

| Word | What it means, in one sentence |
| --- | --- |
| Domain name | The human-friendly name of a site, such as `www.depaul.edu`. |
| Client and server | The client asks for something (your browser); the server answers (the website's computer). |
| HTTP / HTTPS | The rules browsers and servers use to ask for and return pages. HTTPS is the private version. |
| Resource | Any single item a page is made of: the page text, an image, a font, a stylesheet. |

> **Key idea**
>
> None of these words describe *how* anything works yet. They are labels for the parts, so the story below has names to use.

### 1. Join a local network

> **Key idea**
>
> "Connected to Wi-Fi" means a local connection exists. It does not prove the website works.

#### On the computer

- Choose Wi-Fi, or connect a network cable
- The network adapter establishes a local connection
- Supply a password or sign-in if required

#### On the local network

- An access point or switch connects the device
- Network policy decides what access is permitted
- Some networks require an additional sign-in page

### 2. The computer gets its bearings

**A local connection still needs usable network settings.**

| Information | The question it answers |
| --- | --- |
| This device's address | Where should replies go? |
| Local destinations | Which neighbors can I reach directly? |
| Default gateway | Who helps me reach other networks? |
| Name-lookup service | Who helps find the website's address? |

> **Key idea**
>
> "Settings" here means four answers your computer needs before it can talk to anything: who it is, who is nearby, who forwards its traffic outward, and who translates names into addresses.

### 3. Tell the browser where you want to go

![Browser address bar showing https://www.depaul.edu, with labels for a private web visit, the site name, and the home page](../../assets/class-notes/week01-session-s9-1.svg)

> **Key idea**
>
> That whole line is a **URL** — a web address. It names the rules to use (`https`), the site to talk to (`www.depaul.edu`), and optionally which page (nothing here, so: the home page).

*The browser interprets the address before asking for the page.*

### 4. Find an address for the name

> **Key idea**
>
> The name-lookup service is called **DNS**, the Domain Name System: a directory that turns a name people can remember into an address machines can use. Looking up the address is not the same job as downloading the page.

#### The computer asks

- The human-friendly name is `www.depaul.edu`
- Communication needs a network destination
- The browser or operating system may already know a usable answer

#### A lookup service helps

- If needed, it finds an address for the name
- There may be more than one usable address
- Answers can change while the familiar name stays the same

### 5. Get from the laptop to the way out

![A laptop sends traffic through a local access point or switch to a gateway, which connects to the wider Internet](../../assets/class-notes/week01-session-s11-1.svg)

*For a remote website, the computer hands outgoing traffic to a local gateway.*

### 6. Networks carry the conversation

**One visit crosses several networks, not a direct wire.**

| Part of the path | Its job |
| --- | --- |
| Local network | Carry traffic to the way out |
| Gateway | Cross the network boundary and route replies |
| Internet routers | Forward toward the destination |
| Website's network | Deliver traffic to the web service |

**Sources**

- MDN — [How does the Internet work?](https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Web_mechanics/How_does_the_Internet_work)

### 7–8. Start a conversation, then ask

> **Key idea**
>
> Being able to talk to the site and asking for a particular page are different steps. **HTTPS** means the conversation is scrambled in transit, so people between you and the site can see that you are talking to it, but not what you sent.

#### Get ready to talk

- The browser reaches a service for the website
- For this HTTPS visit, it prepares a private conversation with the intended site
- A previously established conversation may be reusable

#### Ask for the page

- The browser requests the site's home page
- It can include context such as a language preference or a previous visit
- The service decides how to answer

### 9. The website's front door decides

![A website front door receives a page request and may return a saved copy or ask the application to produce a response](../../assets/class-notes/week01-session-s14-1.svg)

*An illustrative website architecture, not a verified diagram of DePaul's current deployment.*

### 10. The application may need information

> **Key idea**
>
> The browser normally talks to the web service, not directly to the service's private database.

#### A ready-made page

- Content may already exist as a file
- The service can return it without assembling new information
- Not every visit requires a database query

#### A page assembled for a request

- The application may read stored content or another service
- It may check what the visitor is allowed to see
- It creates a response for the browser

### 11. A response makes the return trip

**A delivered response is not yet a usable page.**

| Participant | Next job |
| --- | --- |
| Web service | Send content, a new location, or a problem |
| Return-path networks | Carry the response back |
| Local network and computer | Deliver to the right device and application |
| Browser | Decide what to do with the response |

### 12. Request the other pieces

> **Key idea**
>
> The first response is not necessarily the whole page. One visit can involve many requests. A **saved copy** — a cache — is a local copy kept from an earlier visit so the same item does not have to be fetched twice.

#### The page can ask for more

- Images and fonts
- Appearance rules and application code
- Fresh information needed by the page

#### Earlier jobs can happen again

- Another resource may be on another service
- Some resources can be reused from saved copies
- Several requests can be in progress together

### 13. The browser makes the page

![Page structure, appearance, images, and behavior feed into the browser to produce the visible usable page](../../assets/class-notes/week01-session-s18-1.svg)

> **Key idea**
>
> These four jobs have names you will use for ten weeks: **HTML** is the structure, **CSS** is the appearance, images are the media, and **JavaScript** is the behavior. The browser combines them into the page you see.

*The browser turns received resources into a page. Work can overlap as resources arrive.*

### 14. Visible is not always ready to use

> **Key idea**
>
> Our destination is a usable experience, not just a successful connection.

#### Something is on the screen

- Text and a logo may already be visible
- Some work may still be in progress
- Appearance alone does not prove every feature works

#### The visitor can do the job

- Links and controls respond
- Needed information is available
- An action may start another request-and-response cycle

### Three milestones, not one checkbox

| What the student observes | What it establishes | What it does not establish |
| --- | --- | --- |
| Wi-Fi says connected | A local connection | Access to every Internet destination |
| Another website opens | At least one usable path and service | DePaul's site is available |
| DePaul's home page appears | Enough work completed to display it | Every link and feature is usable |

### Mac or Windows: the same jobs

> **Key idea**
>
> Later examples include Windows PowerShell and macOS Terminal (zsh or bash). Follow your OS, not both.

#### What stays the same

- Join and configure a network connection
- Find and communicate with the site
- Receive resources, display a page, and respond to the user

#### What can look different

- Settings screens and permission prompts
- Terminal commands and diagnostic output
- Browser menus and developer tools

### From 'I can visit a website' to 'I can explain and operate what makes a web application work.'

> From 'I can visit a website' to 'I can explain and operate what makes a web application work.'

— The course destination

### Tell the story without the tools

1. Draw the journey from joining Wi-Fi to using DePaul's home page. Include the computer, local network, Internet, and website.
2. Mark one job before the page request and one job after the first response arrives.
3. Why can "Wi-Fi connected" be true while the page is not usable?

## Block B — On the network

### Getting on the network

How a machine acquires an identity, finds its neighbours, and reaches everything else — and why none of it is visible from your source code

Block A mapped the whole visit. Now we zoom into its first stages: joining and using the local network. Before your application communicates, the computer needs an identity, a local map, a way out, and help finding names.

### Fictional CampusPulse case: reachable from here, invisible from there

#### Maya's laptop

- DHCP assigns `10.24.18.73/20`
- The gateway is `10.24.16.1`; DNS is `10.20.0.53`
- CampusPulse answers at `localhost:8080`

#### Luis's laptop

- `curl` to `10.24.18.73:8080` gets **connection refused**
- The listener table reveals `127.0.0.1:8080`, not the Wi-Fi address
- One bind setting, not the React code, decides who can connect

### Four questions, answered before your code exists

- **Who am I?** — an address this machine is allowed to use
- **Who is nearby?** — which addresses it can reach without help
- **How do I get out?** — where to send everything else
- **Who answers names?** — which server turns text into an address

> **Key idea**
>
> Your application answers none of these. It inherits all four answers, from a
> server it never authenticated to, over a protocol it never chose.

### Four words about joining a local network

| Term | Plain meaning |
| --- | --- |
| DHCP | The protocol a network uses to hand a newly joined device its address and settings. |
| Lease | The time-limited grant of that address. It expires, is renewed, and can change. |
| MAC address | A hardware address burned into a network adapter. Used only within one local network. |
| ARP | The "who has this address?" question a device shouts locally to find a neighbour's MAC address. |

> **Key idea**
>
> DHCP gives a new device its starting information. ARP then helps it find another device on the same local network.

### Four words about choosing the next hop

| Term | Plain meaning |
| --- | --- |
| Subnet mask | The rule that says which addresses count as local neighbours and which do not. |
| CIDR (`/20`) | A shorthand for that same rule: how many leading bits of the address identify the network. |
| On-link | A destination you can reach directly, without asking the gateway to forward it. |
| Gateway | The device you hand traffic to when the destination is not on-link. |

> **Key idea**
>
> Every mechanism in the next fifteen minutes is one of these eight words in action. You are not expected to know them yet.

### What your machine will tell you

```console title="Windows ipconfig /all - captured and sanitized"
   Physical Address. . . . . : 00-0D-3A-XX-XX-XX     # layer 2 identity
   DHCP Enabled. . . . . . . : Yes                   # <- negotiated
   IPv4 Address. . . . . . . : 10.0.20.252           # 1. who am I
   Subnet Mask . . . . . . . : 255.255.128.0         # 2. who is nearby
   Default Gateway . . . . . : 10.0.0.1              # 3. how do I get out
   DHCP Server . . . . . . . : 168.63.129.16         # who told me all this
   DNS Servers . . . . . . . : 10.0.254.4            # 4. who answers names
```

> **Key idea**
>
> Gateway, DHCP server, resolver: **three different jobs**. A home router may do
> all three, but they need not share an address.

**Sources**

- Course — [full annotated capture](samples/network-config.txt)
- Microsoft — [what 168.63.129.16 is](https://learn.microsoft.com/en-us/azure/virtual-network/what-is-ip-address-168-63-129-16)

### Windows: inspect the active connection

```powershell title="Windows PowerShell - any directory; read-only"
ipconfig /all
Get-NetIPConfiguration
```

> **Key idea**
>
> Find the active adapter's address, prefix or mask, gateway, and DNS servers. Do not copy the sample's addresses.

**Sources**

- Microsoft — [Get-NetIPConfiguration](https://learn.microsoft.com/powershell/module/nettcpip/get-netipconfiguration)

### macOS: find the interface and address

```bash title="macOS Terminal - Bash/zsh; any directory; read-only"
networksetup -listallhardwareports
printf 'Device for active Wi-Fi/Ethernet (from list): '
read -r iface
ipconfig getifaddr "$iface"
ipconfig getpacket "$iface"
ifconfig "$iface"
```

> **Key idea**
>
> Do not assume Wi-Fi is en0. Match the hardware port to its Device entry.

### macOS lease fields: the same questions

**These fields describe the last IPv4 DHCP response, not every current policy.**

| Field in getpacket | Same question as the Windows capture |
| --- | --- |
| `yiaddr` | Which IPv4 address was supplied? |
| `subnet_mask` | Which destinations are local? |
| `router` | Which gateway was supplied? |
| `domain_name_server` | Which name servers were supplied? |

### macOS: find the gateway and resolvers

```bash title="macOS Terminal - Bash/zsh; any directory; read-only"
route -n get default
scutil --dns
```

> **Key idea**
>
> Read gateway and interface in the route; read nameserver and scope in the resolver configuration.

### How the address arrives: DISCOVER, OFFER, REQUEST, ACK

![A four-message DHCP exchange between client and server: DISCOVER broadcast from 0.0.0.0, OFFER from the server, REQUEST broadcast identifying the chosen server, and ACK confirming the lease](../../assets/class-notes/week01-session-s34-1.svg)

*DHCP DORA — four messages, two of them broadcast, before the machine has an address to be addressed by*

**Sources**

- IETF — [RFC 2131 §3.1, DHCP client-server interaction](https://www.rfc-editor.org/rfc/rfc2131.html)

### The lease is not just an address

- **Address + mask** — identity, and the definition of "nearby"
- **Default gateway** — the way out
- **DNS servers** — who resolves names, which is a *trust* decision made for you
- **Lease duration** — this is a rental, and it expires
- **NTP, domain, search suffix, routes** — options nobody reads until one breaks

> **Caution**
>
> A lease that never expires is not normal. On the capture above it ran to the year
> 2162 — a platform artifact of a cloud VM. A home router hands out 12 or 24 hours.

### ARP: the frame needs a different address

#### The problem

The packet is addressed to `10.0.19.7`. The **frame** needs a MAC.

So the host broadcasts *"who has 10.0.19.7?"* and caches the reply.

#### The reality on a cloud network

Real `arp -a`: `10.0.0.1`, `10.0.0.63`, `10.0.1.52`, `10.0.7.77` — **all four
map to the same MAC.** No shared wire; the fabric answers for everything.

> **Note**
>
> IPv6 replaces ARP with **NDP**. Same job.

**Sources**

- IETF — [RFC 826, Address Resolution Protocol](https://www.rfc-editor.org/rfc/rfc826.html) · [RFC 4861, Neighbor Discovery](https://www.rfc-editor.org/rfc/rfc4861.html)

### Which addresses can exist in public

| CIDR | Where it works | You will meet it |
| --- | --- | --- |
| `10.0.0.0/8` | private only | cloud VNets, campus |
| `172.16.0.0/12` | private only | Docker, WSL |
| `192.168.0.0/16` | private only | home routers |
| `127.0.0.0/8` | **this machine only** | the whole problem |
| `169.254.0.0/16` | link-local | DHCP failed; cloud metadata |
| `fe80::/10` | link-local IPv6 | every IPv6 interface |

**Sources**

- IETF — [RFC 1918, private address allocation](https://www.rfc-editor.org/rfc/rfc1918.html) · [RFC 3927, IPv4 link-local](https://www.rfc-editor.org/rfc/rfc3927.html)

### CIDR: how many bits are the network?

```text title="255.255.128.0 is /17 — worked from the real capture"
255.255.128.0 = 11111111 11111111 1000 0000 00000000
                |--- 17 network ---|---- 15 host ----|

  2^15 = 32,768 addresses    10.0.0.0 -> 10.0.127.255

  10.0.19.7   in the /17     -> on-link, ARP for it
  10.0.200.4  NOT in the /17 -> hand it to the gateway
  8.8.8.8     nowhere near   -> hand it to the gateway
```

> **Key idea**
>
> The mask is the **if-statement** your machine runs on every outbound packet:
> *on-link, or hand it to the gateway?*

### The route table is that if-statement

```console title="Windows route print -4 - trimmed; most specific prefix wins"
Destination          Gateway        Meaning
0.0.0.0/0            10.0.0.1       default route
10.0.0.0/17          On-link        local campus subnet
127.0.0.0/8          On-link        loopback
169.254.169.254/32   10.0.0.1       one pinned host

to 10.0.19.7  -> /17 -> ARP for it directly
to 8.8.8.8    -> /0  -> frame to gateway; IP stays 8.8.8.8
to 127.0.0.1  -> /8  -> never leaves the kernel
```

**Sources**

- Course — [annotated route table](samples/network-config.txt)

### Windows: routes and nearby addresses

```powershell title="Windows PowerShell - any directory; inspection only"
route print -4
arp -a
Get-NetNeighbor -AddressFamily IPv6
```

> **Key idea**
>
> Routes choose the next hop. Neighbor entries map nearby network addresses to link addresses.

**Sources**

- Microsoft — [Get-NetNeighbor](https://learn.microsoft.com/powershell/module/nettcpip/get-netneighbor)

### macOS: routes and nearby addresses

```bash title="macOS Terminal - Bash/zsh; any directory; inspection only"
netstat -rn -f inet
route -n get default
arp -a
ndp -an
```

> **Key idea**
>
> Compare Destination, Gateway, and Netif; use ARP for IPv4 neighbors and NDP for IPv6.

### Four words about reaching the Internet

| Term | Plain meaning |
| --- | --- |
| Private address | An address usable only inside one network. Many networks reuse the same private ranges. |
| Public address | A globally unique address that the rest of the Internet can route to. |
| NAT | Rewriting private addresses into one shared public address on the way out, and back on the way in. |
| Port | A number that says which program on a machine a message is for. |

> **Key idea**
>
> A home or campus network can use private addresses inside, then use NAT to share one public address when it talks to the Internet.

### Four words about a program's connection

| Term | Plain meaning |
| --- | --- |
| Socket | One end of a conversation: an address plus a port. |
| Listening socket | A program waiting for connections on a port. |
| Connected socket | An established conversation between two specific address-and-port pairs. |
| Bind address | The address a program agrees to accept connections on. `127.0.0.1` means "this machine only". |

> **Key idea**
>
> `127.0.0.1` (also called `localhost`, or loopback) never leaves your machine. `0.0.0.0` means "accept on every address I have".

### NAT: the address you have is not the address you are

![Three private machines behind a NAT router that rewrites their source address and port to a single public address before packets reach a server on the internet](../../assets/class-notes/week01-session-s44-1.svg)

*One public address, many private machines, and a translation table only you can open*

### The same request, from both ends

| | this host believes | the server received |
| --- | --- | --- |
| address | `10.0.20.252` | `203.0.113.181` |
| port | `49302` | `55346` |

> **Failure to avoid**
>
> Address **and** port were rewritten in flight — and a second run seconds later left
> from `203.0.113.183`. The egress is a **pool**, not a box.

**Sources**

- Course — [the full NAT capture](samples/path-and-nat.txt)
- IETF — [RFC 3022, Traditional NAT and NAPT](https://www.rfc-editor.org/rfc/rfc3022.html)

### Ports and sockets: two tuples, and the difference matters

- A **listening** socket is *(address, port)* — two values, e.g. `0.0.0.0:8471`
- A **connected** socket is *(local addr, local port, remote addr, remote port)* — four
- The four-tuple is why one server port serves thousands of clients unambiguously
- The client never chose its port; the kernel took one from the **ephemeral range**
- `TIME_WAIT` is that four-tuple being held after close, not a leak

> **Key idea**
>
> A socket is an **address and a port**. If you got the address wrong, the port was
> never the problem.

### One listener, many conversations

```console title="netstat -ano, captured during a live request"
  Proto  Local Address          Foreign Address        State
  TCP    0.0.0.0:8471           0.0.0.0:0              LISTENING   25224
  TCP    10.0.20.252:62681      10.0.20.252:8471       TIME_WAIT   0
  TCP    10.0.20.252:62684      10.0.20.252:8471       TIME_WAIT   0
  TCP    127.0.0.1:62630        127.0.0.1:8471         TIME_WAIT   0

  row 1   TWO values:  (0.0.0.0, 8471)         <- the listener
  rows 2+ FOUR values: (local, 62681, remote, 8471)
          server side identical; the CLIENT ports differ
```

**Sources**

- Course — [full socket capture](samples/sockets-and-ports.txt)

### One machine, one port, two answers

```console title="only the bind address changes"
# bound to 127.0.0.1
TCP  127.0.0.1:8471  LISTENING
curl 127.0.0.1:8471    -> campuspulse ok
curl 10.0.20.252:8471  -> Connection refused (same box)
# rebound to 0.0.0.0 — no code changed
TCP  0.0.0.0:8471    LISTENING
curl 127.0.0.1:8471    -> campuspulse ok
curl 10.0.20.252:8471  -> campuspulse ok
```

**Sources**

- Course — [the full transcript](samples/sockets-and-ports.txt)

### Break it live, in ninety seconds

#### Steps

1. Open A and B at the repo root; choose your OS steps; Node 18+
2. Run the loopback-only server and the two requests on the next slides
3. Stop it, bind all interfaces, and repeat without changing the URL

#### Expected observations

- Loopback: JSON; LAN request fails
- Wildcard: JSON on both if allowed

#### Fallback

Open the socket capture on the cleanup slide.

**Sources**

- Course — [the stub server](samples/campuspulse-stub.mjs)

### Windows A: bind only to loopback

```powershell title="Windows PowerShell - repository root; keep Terminal A running"
node --version
node .\weeks\week01\samples\campuspulse-stub.mjs 127.0.0.1 8471
```

> **Note**
>
> Expect: campuspulse listening on 127.0.0.1:8471.

**Sources**

- Course — [stub arguments and response fields](samples/campuspulse-stub.mjs)

### macOS A: bind only to loopback

```bash title="macOS Terminal - Bash/zsh; repository root; Node 18+"
node --version
node ./weeks/week01/samples/campuspulse-stub.mjs 127.0.0.1 8471
```

> **Key idea**
>
> Expect "campuspulse listening on 127.0.0.1:8471". Keep this terminal running.

### Windows B: ask two different addresses

```powershell title="Windows PowerShell - Terminal B; choose YOUR active LAN IPv4"
ipconfig
$lan = Read-Host 'Active LAN IPv4, not 127.0.0.1'
Get-NetTCPConnection -State Listen -LocalPort 8471 |
  Select-Object LocalAddress, LocalPort, OwningProcess
curl.exe --noproxy '*' -sS --max-time 3 http://127.0.0.1:8471/healthz
curl.exe --noproxy '*' -sS --max-time 3 "http://${lan}:8471/healthz"
$LASTEXITCODE
```

**Sources**

- Microsoft — [`Get-NetTCPConnection`](https://learn.microsoft.com/powershell/module/nettcpip/get-nettcpconnection)
- Course — [socket evidence](samples/sockets-and-ports.txt)

### macOS B: ask two different addresses

```bash title="macOS Terminal - Bash/zsh; Terminal B; active LAN IPv4 required"
networksetup -listallhardwareports
printf 'Active LAN Device from list: '; read -r iface
lan=$(ipconfig getifaddr "$iface")
printf 'LAN IPv4: %s\n' "$lan"
# If blank, stop here and use the offline comparison.
lsof -nP -iTCP:8471 -sTCP:LISTEN
curl --noproxy '*' -sS --max-time 3 http://127.0.0.1:8471/healthz
curl --noproxy '*' -sS --max-time 3 "http://${lan}:8471/healthz"
printf 'exit=%s\n' "$?"
```

### Windows A: change just the listener

```powershell title="Windows PowerShell - after Ctrl+C in A; repository root"
node .\weeks\week01\samples\campuspulse-stub.mjs 0.0.0.0 8471
```

> **Note**
>
> Now repeat the socket query and both curl requests from the previous slide, unchanged.

> **Caution**
>
> Use a trusted lab network. This exposes the synthetic stub on every IPv4 interface.

**Sources**

- Course — [stub server](samples/campuspulse-stub.mjs)

### macOS A: change just the listener

```bash title="macOS Terminal - Bash/zsh; after Ctrl+C in A; repository root"
node ./weeks/week01/samples/campuspulse-stub.mjs 0.0.0.0 8471
```

> **Note**
>
> In B, repeat `lsof` and both `curl` requests. Expect a wildcard listener and, if policy permits, two JSON replies.

> **Caution**
>
> Use a trusted lab network. The synthetic stub now listens on every IPv4 interface.

### What changed for Maya and Luis?

| Observation | Mechanism | Safe conclusion |
| --- | --- | --- |
| `boundTo` changes | The listener accepts more destination addresses | The bind configuration changed |
| `servedOn` differs | Each request chose an interface address | Same process, two local paths |
| `peer` port differs | Each client connection gets a source port | A request is not just a URL |
| Luis still cannot connect | Another boundary may block ingress | Check policy before changing code |

**Sources**

- Course — [response fields](samples/campuspulse-stub.mjs)

### Windows: stop the stub, keep the evidence

```powershell title="Windows PowerShell - Terminal B; repository root; offline"
Get-Content .\weeks\week01\samples\sockets-and-ports.txt
```

> **Key idea**
>
> Press Ctrl+C in Terminal A to stop the all-interface listener.

### macOS: stop the stub, keep the evidence

```bash title="macOS Terminal - Bash/zsh; Terminal B; repository root; offline"
cat ./weeks/week01/samples/sockets-and-ports.txt
```

> **Key idea**
>
> Ctrl+C in Terminal A stops the server. The saved Windows/Linux output is reference evidence, not today's Mac output.

### Why "it works on localhost" means nothing

- `127.0.0.0/8` is matched in the route table and **handed back to the kernel**
- It does not cross the physical LAN, its router, or its NAT
- A successful loopback request tests the app and a local path, not remote ingress
- A private address needs an explicit external path; NAPT may also rewrite its port
- Every one of those is a thing a reviewer, a friend testing your app, and your users are on the other side of

> **Failure to avoid**
>
> "It works on my machine" is not a lie. It is a true statement about a code path
> that shares almost nothing with the one your users take.

### A service works for Priya, but not for Dev. Three artifacts. Diagnose it.

```text
A)  Priya runs:  netstat -ano | findstr :8080
    TCP    127.0.0.1:8080    0.0.0.0:0    LISTENING    9134

B)  Dev runs:    curl --max-time 5 http://192.168.1.47:8080/healthz
    curl: (7) Failed to connect ... Connection refused

C)  Dev runs:    curl --max-time 5 http://192.168.1.47:3000/  ->  200 OK
```

**1.** What is the cause? **2.** Which artifact rules out a completely broken path?
**3.** Priya says "let's just use port 80." What happens?

**Sources**

- Course — [supplied failure prompt and artifacts](samples/injected-failures/failure-01-refused-from-lan/README.md)

## Block C — The URL chain

### Transport and the URL chain

TCP, UDP, and QUIC — then every link between pressing Enter and seeing a pixel, which is the map the rest of this course is drawn on

Block B got you an address. This block is about what happens after you have one — and then about the twelve steps between pressing Enter and seeing a pixel, which is the map for the next nine weeks.

### Fictional CampusPulse case: the spinner does not tell you which link failed

#### What Maya sees

- She taps **Report outage** on the train
- The spinner runs for two seconds, then the page says "Try again"
- Her first diagnosis: "the server is down"

#### What the evidence says

- DNS **18 ms**; TCP **24 ms**; TLS **51 ms**
- HTTP returns **200** with JSON in **140 ms**
- The browser console shows a JavaScript exception after the bytes arrive

### Four words about starting a connection

| Term | Plain meaning |
| --- | --- |
| Protocol | An agreed set of rules two machines follow so each one understands the other. |
| TCP | The protocol that gives you an ordered, reliable stream of bytes between two programs. |
| Handshake | The short exchange that sets up a connection before any useful data is sent. |
| Round trip (RTT) | The time for a message to reach the other side and its reply to come back. |

> **Key idea**
>
> Before a browser can ask for a page, its connection follows a protocol and usually completes a handshake. RTT measures the wait for one exchange.

### Four words about keeping a connection safe

| Term | Plain meaning |
| --- | --- |
| Sequence number | A counter on each byte, so the receiver can reorder and detect what is missing. |
| Retransmission | Sending data again because it was not acknowledged in time. |
| TLS | The layer that encrypts an HTTPS conversation and proves you reached the real site. |
| Reset (RST) | An abrupt "stop, this connection is over" from the other end. |

> **Key idea**
>
> TCP uses sequence numbers and retransmissions to keep data reliable. TLS makes that data private. A reset ends the conversation abruptly.

### TCP: nobody speaks until both sides have agreed to

![A TCP three-way handshake: client sends SYN with its initial sequence number, server replies SYN-ACK with its own, client sends ACK, and only then does the first request travel](../../assets/class-notes/week01-session-s65-1.svg)

*Three packets and one round trip before either side may send a single useful byte*

**Sources**

- IETF — [RFC 9293, Transmission Control Protocol](https://www.rfc-editor.org/rfc/rfc9293.html)

### What TCP gives you, and what it charges

- **Ordering** — segments carry sequence numbers, so the receiver reassembles the stream
- **Retransmission** — an unacknowledged segment is sent again, with exponential backoff
- **Flow control** — the receiver advertises a window, so a fast sender cannot drown a slow one
- **Congestion control** — the sender backs off when the *network* is the bottleneck
- **The bill:** one round trip of setup, per-connection state on both ends, and head-of-line blocking

> **Key idea**
>
> TCP turns an unreliable packet network into a reliable byte stream. Everything on
> this list is the price of that sentence.

### Sequencing and retransmission: how silence is handled

![A TCP data transfer where segments with sequence numbers 1, 1461 and 2921 are sent, the middle one is lost, the receiver acknowledges only up to 1461 twice, and the sender retransmits with a doubling timeout](../../assets/class-notes/week01-session-s67-1.svg)

*A lost segment is detected by a gap, not by an error — and the retry interval doubles*

### Ending a connection: politely, or not

#### FIN — the orderly close

Four packets. Either side may stop sending and keep **receiving**, so the close
is half-duplex first.

`TIME_WAIT` then holds the four-tuple for 2 × MSL.

#### RST — the abort

One packet. No agreement, unread data discarded.

**A FIN is an agreement. A RST is a decision.**

> **Caution**
>
> Many `TIME_WAIT` sockets are normal; exhaustion needs evidence of failed new connections.

**Sources**

- IETF — [RFC 9293 §3.6, closing a connection](https://www.rfc-editor.org/rfc/rfc9293.html)

### Four symptoms: read the failure, not just the code

```console title="same tool, four different layers"
127.0.0.1:9        -> (7) refused: RST, host answered no
192.0.2.1          -> (28) timeout: silence, no answer
127.0.0.1:8472     -> (56) reset: request sent, then abort
example.com:443    -> (52) empty reply: orderly FIN
```

> **Key idea**
>
> In plain words: **refused** means something answered and said no. **Timeout** means nothing answered at all. **Reset** means a conversation had started and was cut off. **Empty reply** means the connection closed politely without sending an answer.

**Sources**

- Course — [the full transcripts and a decision table](samples/refused-vs-timeout.txt)

### macOS A: reproduce a local reset

```bash title="macOS Terminal - Bash/zsh; repository root; Node 18+"
node ./weeks/week01/samples/abort-server.mjs 8472
```

> **Key idea**
>
> The loopback-only fixture accepts a connection, reads request bytes, then resets it. Keep A running.

### Reproduce a local reset

```powershell title="Windows PowerShell - Terminal A; repository root; Node 18+"
node .\weeks\week01\samples\abort-server.mjs 8472
```

**Sources**

- Course — [local reset fixture](samples/abort-server.mjs)

### macOS B: find the last completed phase

```bash title="macOS Terminal - Bash/zsh; same machine as Terminal A"
curl --noproxy '*' -v --max-time 5 http://127.0.0.1:8472/
printf 'exit=%s\n' "$?"
# Ctrl+C in A; repeat these two commands to compare.
```

> **Key idea**
>
> While A runs: connected, request sent, then a receive failure. After stopping A: connection fails earlier.

### Terminal B: locate the last successful phase

```powershell title="Windows PowerShell - same machine as Terminal A"
curl.exe --noproxy '*' -v --max-time 5 http://127.0.0.1:8472/
$LASTEXITCODE
# Now Ctrl+C in Terminal A; repeat both lines to compare.
```

**Sources**

- curl — [exit codes and verbose diagnostics](https://curl.se/docs/manpage.html)
- Course — [reset fixture](samples/abort-server.mjs)

### Same spinner; a different next action

| Last evidence | What happened | Next diagnostic |
| --- | --- | --- |
| No `Connected` line | The connection did not establish | Inspect listener, destination, route |
| `Connected`, then outgoing GET | The server accepted the connection | Inspect reset/crash/proxy evidence |
| An HTTP status and headers | Transport carried an HTTP response | Read status, body, and app logs |
| A timeout after connecting | A later phase took too long | Locate the stalled phase; do not blame DNS |

**Sources**

- Course — [failure decision table](samples/refused-vs-timeout.txt)

### macOS: the same offline comparison

```bash title="macOS Terminal - Bash/zsh; repository root; offline"
cat ./weeks/week01/samples/refused-vs-timeout.txt
```

> **Key idea**
>
> Ctrl+C in A stops the fixture. The archived output explains the phases; Mac error wording may differ.

### Fallback and cleanup: no firewall experiment

```powershell title="Windows PowerShell - repository root; archived evidence"
Get-Content .\weeks\week01\samples\refused-vs-timeout.txt
```

> **Key idea**
>
> Stop Terminal A with Ctrl+C. Do not create a DROP rule to force a timeout.

### UDP: no handshake, no memory

> **Key idea**
>
> **UDP** sends single messages, called datagrams, with no setup and no memory of what came before. It is not "broken TCP" — it is TCP with every guarantee removed, so the application can choose which ones it actually wants.

#### What it does not do

- No connection, so no setup round trip
- No ordering, no retransmission
- No flow or congestion control
- An 8-byte header, versus TCP's 20

#### When that is the right trade

- **DNS** — 29 bytes; a retry beats a handshake
- **DHCP** — you have no address yet
- **Audio and video** — late is worse than lost
- **QUIC** — rebuilds reliability on top

**Sources**

- IETF — [RFC 768, User Datagram Protocol](https://www.rfc-editor.org/rfc/rfc768.html)

### QUIC: the handshake, rebuilt on UDP

- Runs over **UDP**, then rebuilds ordering, retransmission, and congestion control above it
- Merges the transport and TLS handshakes — **1 RTT** to a new server; **0 RTT** on a *resumed*
- Streams are independent, so one lost packet no longer stalls the *others*
- A connection ID lets a connection **survive** a network change, when both ends support it
- **HTTP/3 is HTTP over QUIC**, and it is already a large share of real traffic

> **Key idea**
>
> **QUIC** is a newer transport that does TCP's job and TLS's job at the same time, carried inside UDP. **RTT** is a round trip; "1 RTT" means one there-and-back before real data flows. **HTTP/3** is simply HTTP delivered over QUIC.

**Sources**

- IETF — [RFC 9000, QUIC transport](https://www.rfc-editor.org/rfc/rfc9000.html) · [RFC 9114, HTTP/3](https://www.rfc-editor.org/rfc/rfc9114.html)

### From URL to pixel

### The chain

![The URL to pixel chain in twelve steps across two rows: parse the URL, check caches, resolve DNS, open TCP, TLS handshake, send the HTTP request, edge or CDN, origin server, parse HTML, execute JavaScript, render, and interact. Each step is labelled with the week of the course that covers it.](../../assets/class-notes/week01-session-s80-1.svg)

> **Key idea**
>
> Three of these names are new: an **edge/CDN** is a server placed near the user that can answer with a stored copy; the **origin** is the machine that actually owns the content; **render** is the browser turning HTML and CSS into pixels on screen.

*Twelve links. Every remaining week of this course attaches to one of them.*

### The first six links, timed

```console title="Archived Windows curl run - cumulative seconds"
$ curl -sS -o NUL -w "dns=%{time_namelookup} tcp=%{time_connect}
    tls=%{time_appconnect} ttfb=%{time_starttransfer}
    total=%{time_total}\n" https://www.depaul.edu/

dns=0.010978  tcp=0.013690  tls=0.246471  ttfb=0.622437  total=0.647152

  link 3   DNS              11 ms    cached; a cold lookup is 20-120 ms
  link 4   TCP handshake   + 3 ms    one round trip, close by
  link 5   TLS handshake + 233 ms    the most expensive thing here
  links 6-8  request, edge, origin, first byte      + 376 ms
  the remaining 238 KB of body                      +  25 ms
```

> **Key idea**
>
> Four numbers localise a slow page to a link — no profiler, no dashboard, and it
> runs anywhere `curl` runs.

**Sources**

- [curl manual — `--write-out` variables](https://curl.se/docs/manpage.html)

### Windows: measure those same phases

```powershell title="Windows PowerShell - any directory; internet required"
$fmt = 'dns=%{time_namelookup} tcp=%{time_connect} '
$fmt += 'tls=%{time_appconnect} ttfb=%{time_starttransfer} '
$fmt += 'total=%{time_total}\n'
curl.exe -sS -o NUL --max-time 15 -w $fmt https://www.depaul.edu/
```

> **Key idea**
>
> These are cumulative seconds, not five independent durations. Your values need not match the archived capture.

### macOS: measure those same phases

```bash title="macOS Terminal - Bash/zsh; any directory; internet required"
fmt='dns=%{time_namelookup} tcp=%{time_connect} '
fmt="${fmt}tls=%{time_appconnect} ttfb=%{time_starttransfer} "
fmt="${fmt}total=%{time_total}\n"
curl -sS -o /dev/null --max-time 15 -w "$fmt" https://www.depaul.edu/
```

> **Key idea**
>
> Same fields and interpretation; /dev/null replaces Windows NUL. Keep the format variable quoted.

**Sources**

- curl — [write-out variables](https://curl.se/docs/manpage.html)

### Four filters, four links, four artifacts

| Link | Wireshark display filter | What you should find |
| --- | --- | --- |
| 3 · DNS | `dns` | one query, one response, 2 answers, a TTL |
| 4 · TCP | `tcp.flags.syn == 1` | exactly two packets: SYN, then SYN+ACK |
| 5 · TLS | `tls.handshake.type == 1` | your hostname, **in cleartext** |
| 6 · HTTP | `http.request` | the `Host:` header — and **nothing** over HTTPS |

**Sources**

- Wireshark — [display filter reference](https://www.wireshark.org/docs/wsug_html_chunked/ChWorkDisplayFilterSection.html)
- Course — [a fully worked annotated capture](samples/capture-walkthrough.md)

### One link failed. Everything looked down.

#### 4 October 2021

A routine backbone maintenance
command was issued to **assess**
capacity.

The audit tool had a bug.

Every Facebook data centre fell
off the internet.

#### What actually broke for users

The DNS servers were healthy, but
their health check could not reach
the data centres.

They withdrew their BGP routes.

> **Failure to avoid**
>
> **Link 3 failed; every other link became unreachable.**

**Sources**

- Meta Engineering — [More details about the October 4 outage](https://engineering.fb.com/2021/10/05/networking-traffic/outage-details/) (primary postmortem)

### Links 9 to 12: the bytes arrived, and nothing is on screen yet

- **Parse** — HTML becomes a DOM; a blocking `<script>` in `<head>` stops the parser dead
- **Execute** — JavaScript runs, and with client-side rendering *nothing* is visible until it finishes
- **Render** — style, layout, paint, composite; this is where a11y and Core Web Vitals live
- **Interact** — the page looks ready but the handlers are not attached yet, so clicks are dropped

> **Caution**
>
> "Fast" is not one number. A page can reach first paint in 400 ms and be unusable
> for three seconds. Users report the second one.

**Sources**

- MDN — [Navigation and resource timings](https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Navigation_and_resource_timings)

### Four users, four reports. Which link broke, and what evidence settles it?

1. "Server not found." Their colleague at the next desk loads it fine.
2. Padlock warning on a phone; fine on both laptops in the room.
3. Page loads instantly but shows yesterday's incident list.
4. Page paints in 300 ms; buttons do nothing for four seconds.

**Sources**

- Course — [the URL chain and which week owns each link](../../docs/course-map.md)

## Individual practice

### Guided lab: capture your own traffic, then break your own port

- **Now, 35 minutes:** find your machine's network settings, then capture a real page load
- **In the capture:** point at the DNS query, the TCP handshake, the TLS ClientHello, and the first HTTP request
- **Then break it on purpose:** stop your own listening port and diagnose refused vs. timed out vs. reset from symptoms alone
- **Evidence, not a screenshot:** every step has a saved fallback capture for a restricted machine or VPN

> **Key idea**
>
> Full instructions and fallbacks: [`lab.md`](lab.md).

## Homework brief

### HW1: the Packet-to-Pixel Evidence Dossier

- **Purpose:** prove you can watch one page load happen and read the evidence, not guess at it
- **Deliverables:** network config, an annotated packet capture, a HAR export, and a `curl -v` trace
- **Plus:** a socket/port map, a hand-drawn sequence diagram, two diagnosed failures, and proof of domain purchase
- **Task 9, the non-generatable one:** reject one AI claim about your own evidence, and show what disproves it
- **Buy your domain this week.** Registrar verification and propagation are a third party's clock, not yours
- **100 points · individual · full handout and rubric:** [`homework.md`](homework.md) — **due at the start of Week 2 class**

> **Tip**
>
> The domain hardship path is private, needs no explanation, and carries no grade difference. Ask, and it is done.

**Sources**

- Course — [HW1 handout](homework.md) · [evidence standard](../../docs/evidence-standard.md)

## Closing logistics

### Before you go

- **Exit ticket:** one sentence — what surprised you about today's journey, or where it still feels fuzzy
- **Bring to Week 2:** your purchased domain and registrar login
- **Before Week 2 class:** complete the [Week 2 prep](../week02/prep.md) — five items, about 44 minutes, plus its readiness check
- **Any logistics question we didn't reach:** the discussion board, not a hallway guess
- **Next week:** the name you just bought becomes an address — resolution, in depth
