# SAFA website English copy — Simplified Chinese handoff

Status: source copy for review. Fill in the blank after `=>` and keep the key unchanged.

Translation notes:

- Keep `SAFA`, `GitHub`, `macOS`, `Touch ID`, `Keychain`, `OpenSSH`, `TOON`, `MySQL`, `HTTP`, `Linux`, and `Windows` unchanged.
- Translate `Agent` as the product concept, not as a customer-service agent.
- `Skill`, `Runtime`, and `Broker` are architecture terms. Keep the English term when a short natural Chinese explanation would become less precise.
- Do not translate aliases, commands, status codes, URLs, or the install command listed in the final section.
- Prefer natural Chinese product copy over sentence-by-sentence literal translation.

## Shared navigation, footer, accessibility, and page metadata

```text
shared.nav.product = Product =>
shared.nav.security = Security =>
shared.nav.how = How it works =>
shared.nav.switch_language = Switch language to =>
shared.aria.primary_navigation = Primary navigation =>
shared.aria.home = SAFA home =>
shared.footer.tagline = Secure Access for Agents =>
shared.footer.license = MIT License · GitHub =>

meta.home.title = SAFA — Secure Access for Agents =>
meta.home.description = Let AI agents diagnose servers, services, and infrastructure without giving them passwords, private keys, or reusable credentials. =>
meta.home.social_description = Ask why production is down. SAFA finds the resource, checks topology, requests approval, and returns bounded evidence—without exposing credentials. =>
meta.how.title = How SAFA Works — Secure Access for Agents =>
meta.how.description = See how SAFA lets AI agents diagnose registered infrastructure without receiving reusable credentials. =>
meta.how.social_description = The Agent sees the task. SAFA handles credentials, topology, policy, authorization, and bounded evidence locally. =>
```

## Homepage

### Hero and entry points

```text
home.hero.eyebrow = Infrastructure diagnostics without secret sharing =>
home.hero.slogan = Let your AI agent diagnose servers—without giving it your credentials. =>
home.hero.body = Register a machine once on your Mac. Then ask naturally: “Why is production down?” SAFA finds the right resource, checks its topology, asks for your approval, and returns bounded evidence. =>
home.hero.github = View on GitHub =>
home.hero.demo = See a real diagnosis =>
home.hero.learn_how = How SAFA works =>
home.hero.install_label = Source preview =>
home.hero.copied = Copied =>
home.hero.copy_install = Copy install command =>
home.hero.mascot_alt = SAFA owl guardian =>
```

### Example questions

```text
home.prompts.eyebrow = Ask normally =>
home.prompts.title = No IP hunt. No password handoff. Just describe the problem. =>
home.prompts.body = SAFA gives the Agent safe aliases and verified relationships, so it can plan a useful diagnostic without making you translate your infrastructure into connection details. =>
home.prompts.api.question = Why is the production API returning 502? =>
home.prompts.api.result = Find the service, verify its host, and inspect bounded health evidence. =>
home.prompts.path.question = Can the crawler reach MySQL from this node? =>
home.prompts.path.result = Ask the Broker for a verified path instead of guessing from IPs. =>
home.prompts.impact.question = What breaks if the NAS goes down? =>
home.prompts.impact.result = Compute the affected services from the dependency graph. =>
```

### Interactive diagnosis demo

```text
home.demo.user = You =>
home.demo.title = Diagnose checkout-api =>
home.demo.online = Online =>
home.demo.conversation = Conversation =>
home.demo.session = Session · interactive demo =>
home.demo.user_prompt = Why is checkout-api returning 502? Diagnose only—don’t change anything. =>
home.demo.thinking = Working through SAFA… =>
home.demo.discovered = Discovered resource alias =>
home.demo.topology = Checked topology =>
home.demo.topology_detail = checkout-api · production =>
home.demo.health = Ran safe health check =>
home.demo.authorization = Authorization required =>
home.demo.authorization_body = A read-only action needs your approval. =>
home.demo.resource = Resource =>
home.demo.action = Action =>
home.demo.action_value = Read service logs from the last 10 minutes =>
home.demo.scope = Scope =>
home.demo.scope_value = One action · expires in 5 minutes =>
home.demo.sealed = Credentials stay on this Mac =>
home.demo.touch_id = Authorize with Touch ID =>
home.demo.waiting = Waiting for your authorization… =>
home.demo.granted = Authorization granted =>
home.demo.log_read = Executed log read =>
home.demo.log_read_detail = Last 10 minutes · read-only =>
home.demo.finding = Finding =>
home.demo.finding_value = Database connection pool exhausted. No changes made. =>
home.demo.message = Message SAFA Agent… =>
home.demo.policy = Policy active =>
home.demo.least_privilege = Least privilege =>
home.demo.replay = Replay demo =>
```

### Security summary and closing call to action

```text
home.security.eyebrow = Security boundary =>
home.security.title = The Agent gets the answer. Your Mac keeps the credentials. =>
home.security.body = SAFA turns a natural-language request into one policy-checked operation. The password or private key never becomes model input, tool output, or chat history. =>
home.security.request_title = Agent names the task =>
home.security.request_body = It asks for a logical resource and a bounded action—not an IP, username, or key. =>
home.security.policy_title = SAFA resolves and authorizes =>
home.security.policy_body = The native Runtime finds the protected route and credential, enforces policy, and asks for user presence when needed. =>
home.security.resource_title = Only the action runs =>
home.security.resource_body = The target receives the approved operation; the Agent receives bounded, sanitized evidence. =>
home.security.credentials = Passwords, private keys, tokens, and vault keys never enter the Agent-visible channel. =>
home.cta.title = Open source, security boundary included. =>
home.cta.body = Review the Skill, public contract, topology model, and native Runtime architecture. =>
```

## How it works page

### Introduction and system map

```text
how.intro.eyebrow = How SAFA works =>
how.intro.title = From natural-language intent to bounded evidence. =>
how.intro.body = SAFA is a local security boundary for infrastructure work. Your Agent can discover a registered resource, reason over its topology, and request one bounded operation without receiving the password, private key, token, or protected route behind it. =>
how.intro.back = Back to product =>
how.intro.github = Inspect the architecture =>
how.map.aria = Agent and native security boundary =>
how.map.agent = Agent =>
how.map.agent_detail = intent + safe aliases =>
how.map.skill = Skill =>
how.map.skill_detail = context + plan =>
how.map.runtime = SAFA Runtime =>
how.map.runtime_detail = policy + authorization =>
how.map.resource = Resource =>
how.map.resource_detail = one bounded action =>
```

### Request lifecycle

```text
how.flow.title = One request, five boundaries =>
how.flow.body = Each layer has one job. The Skill plans; the native Runtime owns credentials, policy, authorization, and the connection. =>
how.flow.1.title = You describe the problem =>
how.flow.1.body = “Why is api.production returning 502?” No IP or password is needed. =>
how.flow.2.title = The Skill discovers context =>
how.flow.2.body = It finds the registered alias and asks the topology surface for placement, path, or impact. =>
how.flow.3.title = Policy narrows the action =>
how.flow.3.body = The Runtime binds the request to one resource, command, scope, and expiry. =>
how.flow.4.title = Your Mac authorizes =>
how.flow.4.body = When user presence is required, macOS shows the exact action before Touch ID approval. =>
how.flow.5.title = Evidence comes back =>
how.flow.5.body = The Runtime executes, bounds, redacts, and labels remote output as untrusted evidence. =>
```

### Credential boundary

```text
how.credentials.eyebrow = Credential isolation =>
how.credentials.title = Credentials never cross into the Agent-visible channel. =>
how.credentials.body = Open source does not mean open secrets. The code is public; your Keychain records, vault keys, host routes, and authorization decisions are local runtime state. =>
how.credentials.agent_zone = Agent-visible =>
how.credentials.agent.1 = Natural-language intent =>
how.credentials.agent.2 = Safe resource aliases =>
how.credentials.agent.3 = Bounded topology answers =>
how.credentials.agent.4 = Sanitized evidence and status =>
how.credentials.native_zone = Native macOS boundary =>
how.credentials.native.1 = Protected routes and accounts =>
how.credentials.native.2 = Keychain credential handles =>
how.credentials.native.3 = Policy and process identity =>
how.credentials.native.4 = Touch ID / user presence =>
how.credentials.never_title = The Agent never receives =>
how.credentials.never.1 = Passwords or sudo passwords =>
how.credentials.never.2 = Private keys or recovery secrets =>
how.credentials.never.3 = Tokens, cookies, or vault keys =>
how.credentials.never.4 = A reusable unrestricted session =>
how.credentials.rail_aria = Credential flow =>
how.credentials.rail = Mac → Keychain → Runtime → Resource =>
how.credentials.rail_note = credential handle stays inside this rail =>
```

### Topology

```text
how.topology.eyebrow = Topology that an Agent can actually use =>
how.topology.title = Ask a question. Let the Broker compute the graph answer. =>
how.topology.body = Infrastructure is not a tree or a screenshot. SAFA stores typed, directed relationships and gives the Agent a small, task-specific projection. Exact path and impact calculations stay deterministic inside the Broker. =>
how.topology.placement.question = Where does this service run? =>
how.topology.placement.result = A bounded neighborhood with typed relationships =>
how.topology.path.question = Can the crawler reach MySQL? =>
how.topology.path.result = confirmed, not-found, or indeterminate =>
how.topology.impact.question = What fails if the NAS is down? =>
how.topology.impact.result = A computed affected set and supporting edges =>
how.topology.graph_title = Directed typed multigraph =>
how.topology.graph_note = desired claims ≠ observed facts · verified paths expire · large graphs become bounded task projections =>
```

### Security model

```text
how.security.eyebrow = Security model =>
how.security.title = Useful guardrails, with honest limits. =>
how.security.1.title = No credential return path =>
how.security.1.body = The Agent-facing contract has no command for showing or exporting a stored secret. =>
how.security.2.title = Remote output is untrusted =>
how.security.2.body = Logs, banners, files, and command output are evidence—not instructions or authorization. =>
how.security.3.title = Verification fails closed =>
how.security.3.body = A signature, runtime, host identity, or policy failure does not fall back to raw SSH. =>
how.security.4.title = Scope stays explicit =>
how.security.4.body = The current preview supports bounded, non-sudo argument execution—not an unrestricted shell. =>
how.security.preview_note = Current status: macOS source preview. The Runtime is not yet shipped as a signed public package, and planned capabilities are not support promises. =>
```

### Roadmap and closing note

```text
how.roadmap.eyebrow = Roadmap =>
how.roadmap.title = Build the narrow path first. Expand only after it stays safe. =>
how.roadmap.now = Available in the preview =>
how.roadmap.now.1 = Encrypted resource directory and safe aliases =>
how.roadmap.now.2 = OpenSSH import and verified host inventory =>
how.roadmap.now.3 = Topology show, path, impact, link, and unlink =>
how.roadmap.now.4 = Bounded non-sudo SSH diagnostics =>
how.roadmap.now.5 = Agent-only TOON v2 contract =>
how.roadmap.next = Next release gates =>
how.roadmap.next.1 = Signed and notarized macOS Runtime =>
how.roadmap.next.2 = Verified resolver manifest and rollback path =>
how.roadmap.next.3 = End-to-end conformance and hostile-output tests =>
how.roadmap.next.4 = Clear Preview installation and recovery flow =>
how.roadmap.later = Later, after review =>
how.roadmap.later.1 = Controlled mutation, sudo, and expiring grants =>
how.roadmap.later.2 = Native database, object-store, cache, and HTTP adapters =>
how.roadmap.later.3 = Origin-bound browser sessions without credential export =>
how.roadmap.later.4 = Independent Linux and Windows native Runtimes =>
how.end.title = The goal is simple: ask the Agent about your systems, not how to log in to them. =>
how.end.body = SAFA is still a preview. The architecture, Skill, topology contract, and security boundaries are open for review now. =>
```

## Technical literals — do not translate

```text
SAFA
SAFA Agent
GitHub
MIT License
npx skills add juju-w/safa --skill safa
api.production
checkout-api
200 OK
Touch ID
safa topology show service.api
safa topology path host.crawler service.mysql
safa topology impact storage.reports
```
