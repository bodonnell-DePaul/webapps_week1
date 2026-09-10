# CSC 436: Web Application Systems - From URL to Operable Product

**Meeting Time:** Thursday, 5:45 PM - 9:00 PM

**Location:** LEWIS 1510, Loop Campus

**Course Webpage:** [D2L Portal](https://d2l.depaul.edu)

**Prerequisites:** CSC 447 and CSC 435

**Term:** Autumn 2026. D2L is the system of record for dated deadlines,
announcements, submissions and approved accommodations. Policy changes are
announced explicitly; an unannounced difference in a handout does not override
this syllabus.

---

## Instructor Information

- **Name:** Brian O'Donnell
- **Email:** bodonne3@depaul.edu
- **Office Location:** Discord or Teams
- **Office Hours:** Monday, 12:00-1:00 PM and Tuesday, 1:30-2:30 PM on Discord

Use D2L for the current private Discord/Teams access links and any announced
schedule changes.

---

## Course Description

This course is about how web applications work after code is written. Students
learn how a browser reaches an application, how the application is deployed, how
users are authenticated, how data is stored, and how to tell whether the system is
working correctly.

Students will build and operate one application across the quarter. The focus is
not on memorizing one framework or producing advanced visual design. The focus is
on understanding the pieces of a web system, making responsible technical
decisions, testing those decisions with evidence, and explaining the results in
plain language.

**No previous web-application, HTML/CSS/JavaScript, networking, DNS, TLS, or
cloud experience is assumed.** The programming prerequisites above remain in
place. The [getting-started guide](getting-started.md) and
[guided web foundations](web-foundations.md) introduce the browser, terminal,
Git, HTML, CSS, JavaScript, requests, forms, APIs and a first working application
before students are expected to review a generated React/TypeScript application.

Generative AI tools may help create code, but they do not make the code correct,
secure, deployed, observable, or explainable. Students may use generated code
where allowed, but they must verify it, revise it, document what they used, and
explain how they know the system works.

### Terms Used in This Course

The course materials introduce technical vocabulary gradually. These short
definitions are included so the syllabus does not assume prior web experience.

| Term | Meaning |
| --- | --- |
| Web application | Software that users access through a browser or web API. |
| Browser | The program, such as Chrome, Edge, Firefox or Safari, that requests and displays web pages. |
| HTML | The markup language that gives a page its structure. |
| CSS | The language used to control page appearance and layout. |
| JavaScript | The programming language that runs in the browser and often on servers. |
| React | A JavaScript library commonly used to build interactive browser interfaces. |
| TypeScript | JavaScript with added type checking to catch more mistakes before code runs. |
| HTTP | The request-and-response protocol browsers and web servers use to exchange pages and data. |
| API | A defined way for one program to request data or actions from another program. |
| DNS | The system that translates a name such as `example.com` into the network address of a server. |
| TLS | The security technology behind HTTPS. It encrypts traffic and helps prove the server is the one the browser meant to reach. |
| Domain | A human-readable internet name, such as `example.com`. |
| Container | A packaged way to run an application with its needed files and settings. Docker is a common container tool. |
| Deployment | Putting an application somewhere users or testers can reach it. |
| CDN | A content delivery network: servers near users that can deliver cached files quickly. |
| Authentication | Proving who a user is. |
| Authorization | Deciding what an authenticated user is allowed to do. |
| OAuth / OIDC | Common standards used by applications to sign users in and authorize access without sharing passwords with the application. |
| MCP | Model Context Protocol: a way for AI assistants to use external tools or data sources through defined interfaces. |
| Observability | Collecting logs, metrics and traces so you can understand what a system is doing. |
| SLO | A service-level objective: a measurable reliability goal, such as how often a service should respond successfully. |
| CI/CD | Continuous integration and continuous delivery: automated checks and release steps that run when code changes. |
| IaC | Infrastructure as code: defining servers, databases, DNS or cloud resources in files instead of only clicking through a website. |

### Course Format

Class meetings combine short review, lecture, demonstrations, supported
individual practice, and time to connect the week's ideas to the term project.
The scheduled 5:45-9:00 PM meeting is 195 minutes; class plans include time for
setup, questions, troubleshooting and recovery.

Students should expect preparation before class and individual work after class.
The amount and type of work will vary by week. Detailed readings, exercises,
deliverables and due dates are posted in D2L and the weekly materials rather than
fixed in this syllabus.

Before Week 1, students complete an ungraded diagnostic and tooling checklist.
The diagnostic directs support; it is not an entrance exam. Foundational practice
is staged through the early weeks of the course.

### Individual Work and AI Use

**Every part of the course is solo work.** Assignments, labs, checkpoints, exams,
demonstrations, incident exercises, and the final project are completed
individually. There are no teams, paired activities, shared submissions, or
divisions of responsibility among classmates.

Each student owns their repository, application, deployment, evidence and
explanations. When an exercise needs multiple roles or clients, that student
operates separate test accounts or processes, or uses instructor-provided
artifacts. Instructor-led debriefs follow individual work.

Code generation is expected, disclosed, and unpenalized when allowed by the
assignment. You must verify generated work, explain the evidence yourself, keep
an AI-use log, and challenge one consequential AI claim per submission when the
assignment requires it. Fabricated evidence, undisclosed assistance, and
generative AI use on exams are not permitted. You remain responsible for the
security, correctness, and licensing of everything submitted.

A non-AI path is available: critique an instructor-supplied AI-generated artifact
under the same requirements, with no grade difference. No paid AI subscription is
required. Detector scores or an impression that writing "sounds like AI" are not
proof of misconduct. See the full [AI-use policy](ai-use-policy.md).

---

## Grading Breakdown

| Component | Weight |
| --- | --- |
| Applied assignments | 35% |
| Midterm exam | 20% |
| Final-project milestone checks | 10% |
| Final release, dossier, demonstration and individual oral defense | 30% |
| Readiness checks, in-class checkoffs and exit tickets | 5% |

Applied assignments ask students to connect course concepts to their own running
systems and to support claims with evidence. Milestone checks measure steady
progress on the term project. Detailed assignment instructions, rubrics,
deadlines and any week-specific adjustments are posted in D2L and the weekly
materials.

Participation consists of readiness checks and in-class checkoffs or exit
tickets. The final component consists of the individual project artifact and an
individual oral defense. There is no shared score.

Code volume, framework sophistication, and visual polish are not grading
categories unless a specific assignment rubric says otherwise.

### Grade Scale

| A | A- | B+ | B | B- | C+ | C | C- | D | F |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 93+ | 90-92.9 | 87-89.9 | 83-86.9 | 80-82.9 | 77-79.9 | 73-76.9 | 70-72.9 | 60-69.9 | Below 60 |

Final percentages are rounded once to one decimal place at the end of the
quarter. There is no curve or extra credit.

### Submissions, Gates, and Recovery

- **Late work:** A 10% deduction per 24 hours, up to 72 hours; nothing is
  accepted afterward without an approved extension. Each student has two
  no-questions-asked 48-hour extensions, requested in D2L before the deadline.
  These cannot be used for milestone checks, the midterm or the final.
- **Regrades:** Request a regrade in D2L within seven days, citing the rubric
  row. The entire artifact is re-evaluated.
- **Milestones:** A milestone measures timely operational readiness; an
  assignment measures evidence and explanation. A single defect is not penalized
  twice. A milestone may be re-cleared once within one week for partial credit.
- **Recovery:** If an earlier failure blocks later work, request the course's
  known-good baseline. Its use is recorded, not penalized.
- **Provider failures:** Report documented outages, removed features, or changed
  terms. An approved substitute will be named without a penalty for the
  provider's failure. Monitoring and avoiding your own quota exhaustion remain
  your responsibility.

### Evidence Standard

Most applied work requires evidence, not just a screenshot or a statement that
"it works." Evidence may include commits or release tags, reproduction commands,
configuration exports, sanitized logs, network captures, query results,
deployment links, diagrams, or short written interpretations. The exact evidence
required depends on the assignment and will be stated in the assignment
instructions.

**Screenshots alone are never sufficient unless an assignment explicitly says
otherwise.** Use the [evidence standard and checklist](evidence-standard.md).

### Midterm Exam

The midterm is individual, in class, and focused on material covered before the
exam date. The final exam schedule and any exam-specific instructions are posted
in D2L.

### Final Project: CampusPulse

Each student independently develops a synthetic campus service-status and
incident tracker. It is not an official University service and must not use real
institutional or personal data. Alternative projects require instructor approval
against the same learning goals.

The final project asks students to demonstrate a working web application,
authentication and authorization, persistent data, deployment, basic operational
monitoring, safe handling of secrets, and a clear explanation of design choices.
Some versions of the project may also include real-time updates, AI-tool
integration through MCP, or other extensions introduced in the weekly materials.

Exposed credentials, fabricated evidence, a non-reproducible deployment, or a
publicly reachable system that is supposed to require authorization can forfeit
credit in affected rubric categories. These problems may also require
remediation before final credit is awarded. Suspected fabrication is referred to
the University academic-integrity process.

---

## Tentative Course Schedule

This schedule lists the course arc at a high level. Specific readings,
activities, assignments, milestone details and due dates are posted in D2L and
the weekly materials.

| Week | Topics |
| --- | --- |
| 1 | Course introduction; how a browser reaches a web page; basic networking vocabulary; development environment setup. |
| 2 | Domain names, DNS, HTTP requests and responses, and how to inspect browser/server communication. |
| 3 | Reading generated code; TypeScript, React and container basics; packaging an application so it runs consistently. |
| 4 | Deployment, HTTPS/TLS, trust, cost controls, and the first public or course-accessible release. |
| 5 | Delivery performance, caching, accessibility, basic monitoring, and user-visible reliability. |
| 6 | Midterm exam and an introduction to data modeling. |
| 7 | Real-time communication, tool-style application interfaces, and MCP concepts. |
| 8 | User sign-in, tokens, sessions, OAuth/OIDC, and authorization for web and tool-based access. |
| 9 | Threat modeling, application controls, secure configuration, and common misuse patterns. |
| 10 | Data at larger scale, query performance, migrations, incident response, and operational review. |
| Finals | Final release, evidence dossier, demonstration and individual oral defense. See D2L for the schedule. |

---

## Software Requirements

- A Windows, macOS, or Linux laptop capable of running Docker, Wireshark, and a
  modern browser with developer tools. Administrator rights may be needed for the
  required capture driver and Docker installation.
- 16 GB RAM is recommended; 8 GB is workable.
- Git and a [GitHub](https://github.com) account for your repository and
  automated checks.
- **Node.js 24 LTS** for the tested course tooling and JavaScript/TypeScript
  examples, using the versions named in the weekly setup instructions.
- A domain or course-managed subdomain. A domain normally costs about $10-15 per
  year; a course-managed subdomain can be requested privately through D2L with
  no explanation or grade difference.
- Free or low-cost DNS/CDN, hosting, database, identity and telemetry services as
  specified in the weekly materials.

Course materials provide Windows and native macOS examples. Equivalent captures
and fallbacks are available when operating-system, VPN, network or hardware
limitations prevent a particular exercise.

The [deployment runbook](deployment-runbook.md) connects local development to
staging, production, custom DNS, certificate renewal, recovery and teardown.
Students should configure required billing alerts before starting cloud-hosted
work and should never share client secrets, tokens, passwords or private keys.

### Safe Use of Course Systems

Capture, security and load exercises are limited to your own systems or
explicitly designated course staging fixtures, within the stated concurrency,
duration and technique limits. Do not target classmates' projects, University
infrastructure or third-party services beyond ordinary documented use. Do not
capture another device's traffic or run security/load exercises against
production.

Credential attacks, social engineering, malware, persistence, and
denial-of-service are prohibited. Provider terms also apply. Unauthorized testing
can be an academic-integrity violation and unlawful.

Use synthetic data, redact credentials, and tear down or de-list public
deployments at the quarter's end. TLS protects the connection between a browser
and server; it does not decide who is allowed to use the application. Live
credentials in a submission result in a zero for that artifact and a required
resubmission with rotation evidence.

---

## Communication Guidelines

- Use the **D2L discussion board** for course questions and announcements.
- Read the error, inspect the evidence, and form a hypothesis before requesting
  help.
- For technical help, include:
  - A sanitized capture, header dump, query plan, log excerpt, screenshot or
    other relevant artifact.
  - Reproduction steps, your hypothesis, and what you already tried.
  - Relevant context from the week's [materials](course-map.md).
- Bring the actual evidence to office hours, not only "it doesn't work."
- Use email or the course's private D2L channel for accommodations, hardship,
  extensions, or individual project support. Hardship requests require no
  explanation.
- Report inaccessible materials to the instructor. Course materials and student
  submissions follow the [accessibility standard](accessibility.md).
- Arrange midterm accommodations early, before Week 5 when possible. Letters and
  arrangements are not disclosed to classmates.
- Notify the instructor of religious-observance conflicts in the first two
  weeks.
- In a campus closure, check D2L and University email for continuity
  arrangements.

The instructor is a **mandated reporter** for disclosures of sexual or
relationship violence and must share them with the University's Title IX
Coordinator. Confidential resources are listed in D2L. CampusPulse does not
involve human-subjects research; do not collect data from human subjects for it.

---

## Learning Outcomes

Students will:

- Build and explain a small accessible web application.
- Trace how a browser request becomes a rendered page.
- Use domains, DNS, HTTPS and deployment tools responsibly.
- Read, test and revise generated code and configuration.
- Package and run an application in a repeatable environment.
- Design basic data models and explain their tradeoffs.
- Add authentication and authorization appropriate to an application's users.
- Recognize common security risks and verify mitigations.
- Use logs, metrics, traces or other evidence to diagnose system behavior.
- Respond to an incident, explain what happened, and identify practical
  improvements.
- Defend technical decisions orally and in writing.

---

## Course Policies

### Syllabus Changes

Any changes will be announced in class, posted on D2L, and emailed.

### Diversity and Inclusion

This course values diverse perspectives and encourages open dialogue. Students
are welcome to express their identities and experiences. Contact the instructor
if the classroom environment does not meet these expectations.

### Online Course Evaluations

Please complete the anonymous course evaluations; time is provided in class.
There is no grade incentive or penalty for completing an evaluation.
More info: [Teaching Commons](https://resources.depaul.edu/teaching-commons/teaching/Pages/online-teaching-evaluations.aspx)

### Academic Integrity

This course follows DePaul's [Academic Integrity Policy and process](https://offices.depaul.edu/academic-affairs/faculty-resources/academic-integrity/Pages/default.aspx).

Violations include:

- Sharing unreleased exam questions, assessment keys, or another student's work.
- Unauthorized assistance.
- Plagiarism.

Sanctions apply to both providers and users of unauthorized content. Publishing
your own required application is permitted within the synthetic-data,
secret-handling and repository-visibility rules. Do not republish restricted
instructor resources or private assessments.

### Academic Policies

Students must manage enrollment and withdrawal per the
[University Academic Calendar](https://academics.depaul.edu/calendar/Pages/default.aspx).

More info: [Graduate academic policies](https://catalog.depaul.edu/student-handbooks/graduate/graduate-academic-policies/).
College and program-specific requirements also apply.

### Incomplete Grades

An incomplete requires instructor permission, satisfactory work already
completed, and unusual or unforeseeable circumstances preventing completion.
Request it before the term ends and follow any additional college approval and
written completion requirements; it is not an automatic extension.
Policy: [Graduate grading policies](https://catalog.depaul.edu/student-handbooks/graduate/graduate-academic-policies/grades/)

### Preferred Name and Pronouns

Students may request alternate names or pronouns.

Guidance: [University Registrar preferred-name page](https://offices.depaul.edu/university-registrar/Pages/preferred-name.aspx),
including its link to the current Preferred Name and Gender Policy.

### Students with Disabilities

Register with DePaul's Center for Students with Disabilities (CSD):

- Loop Campus: (312) 362-8002
- Lincoln Park: (773) 325-1677
- Email: csd@depaul.edu

More info: [CSD Services](https://offices.depaul.edu/student-affairs/about/departments/Pages/csd.aspx)
