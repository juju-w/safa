import {
  ArrowRight,
  Browser,
  CheckCircle,
  Database,
  EyeSlash,
  Fingerprint,
  GithubLogo,
  Graph,
  Key,
  Laptop,
  LockKey,
  Network,
  Path,
  Robot,
  ShieldCheck,
  TerminalWindow,
  Vault,
  WarningCircle,
} from "@phosphor-icons/react";
import { motion, useReducedMotion, useScroll } from "motion/react";
import React, { useEffect } from "react";
import { SiteFooter, SiteNav, useLanguage } from "./SiteChrome";
import { GITHUB_URL, siteHref } from "./site";

const copy = {
  en: {
    eyebrow: "How SAFA works",
    title: "The Agent sees the task. SAFA handles the secret.",
    body: "SAFA is a local security boundary for infrastructure work. Your Agent can discover a registered resource, reason over its topology, and request one bounded operation without receiving the password, private key, token, or protected route behind it.",
    back: "Back to product",
    github: "Inspect the architecture",
    principleEyebrow: "The practical difference",
    principleTitle: "Stop turning an outage into a credential-sharing exercise.",
    without: "Without SAFA",
    withoutSteps: ["Agent asks which host to use", "You paste an IP, username, or key path", "Secrets and connection details enter chat history", "The Agent opens a broad, reusable session"],
    with: "With SAFA",
    withSteps: ["You ask why a named service is failing", "The Skill finds a safe resource alias", "The Runtime resolves the protected route locally", "Only the approved diagnostic runs"],
    flowEyebrow: "One request, five boundaries",
    flowTitle: "From natural-language intent to bounded evidence.",
    flowBody: "Each layer has one job. The Skill plans; the native Runtime owns credentials, policy, authorization, and the connection.",
    flow: [
      { title: "1. You describe the problem", body: "“Why is api.production returning 502?” No IP or password is needed." },
      { title: "2. The Skill discovers context", body: "It finds the registered alias and asks the topology surface for placement, path, or impact." },
      { title: "3. Policy narrows the action", body: "The Runtime binds the request to one resource, command, scope, and expiry." },
      { title: "4. Your Mac authorizes", body: "When user presence is required, macOS shows the exact action before Touch ID approval." },
      { title: "5. Evidence comes back", body: "The Runtime executes, bounds, redacts, and labels remote output as untrusted evidence." },
    ],
    boundaryEyebrow: "Credential isolation",
    boundaryTitle: "Credentials never cross into the Agent-visible channel.",
    boundaryBody: "Open source does not mean open secrets. The code is public; your Keychain records, vault keys, host routes, and authorization decisions are local runtime state.",
    agentZone: "Agent-visible",
    agentItems: ["Natural-language intent", "Safe resource aliases", "Bounded topology answers", "Sanitized evidence and status"],
    nativeZone: "Native macOS boundary",
    nativeItems: ["Protected routes and accounts", "Keychain credential handles", "Policy and process identity", "Touch ID / user presence"],
    neverTitle: "The Agent never receives",
    neverItems: ["Passwords or sudo passwords", "Private keys or recovery secrets", "Tokens, cookies, or vault keys", "A reusable unrestricted session"],
    topologyEyebrow: "Topology that an Agent can actually use",
    topologyTitle: "Ask a question. Let the Broker compute the graph answer.",
    topologyBody: "Infrastructure is not a tree or a screenshot. SAFA stores typed, directed relationships and gives the Agent a small, task-specific projection. Exact path and impact calculations stay deterministic inside the Broker.",
    topologyQuestions: [
      { question: "Where does this service run?", command: "topology show service.api", outcome: "A bounded neighborhood with typed relationships" },
      { question: "Can the crawler reach MySQL?", command: "topology path host.crawler service.mysql", outcome: "confirmed, not-found, or indeterminate" },
      { question: "What fails if the NAS is down?", command: "topology impact storage.reports", outcome: "A computed affected set and supporting edges" },
    ],
    securityEyebrow: "Security model",
    securityTitle: "Useful guardrails, with honest limits.",
    invariants: [
      { title: "No credential return path", body: "The Agent-facing contract has no command for showing or exporting a stored secret." },
      { title: "Remote output is untrusted", body: "Logs, banners, files, and command output are evidence—not instructions or authorization." },
      { title: "Verification fails closed", body: "A signature, runtime, host identity, or policy failure does not fall back to raw SSH." },
      { title: "Scope stays explicit", body: "The current preview supports bounded, non-sudo argument execution—not an unrestricted shell." },
    ],
    previewNote: "Current status: macOS source preview. The Runtime is not yet shipped as a signed public package, and planned capabilities are not support promises.",
    roadmapEyebrow: "Roadmap",
    roadmapTitle: "Build the narrow path first. Expand only after it stays safe.",
    now: "Available in the preview",
    nowItems: ["Encrypted resource directory and safe aliases", "OpenSSH import and verified host inventory", "Topology show, path, impact, link, and unlink", "Bounded non-sudo SSH diagnostics", "Agent-only TOON v2 contract"],
    next: "Next release gates",
    nextItems: ["Signed and notarized macOS Runtime", "Verified resolver manifest and rollback path", "End-to-end conformance and hostile-output tests", "Clear Preview installation and recovery flow"],
    later: "Later, after review",
    laterItems: ["Controlled mutation, sudo, and expiring grants", "Native database, object-store, cache, and HTTP adapters", "Origin-bound browser sessions without credential export", "Independent Linux and Windows native Runtimes"],
    finalTitle: "The goal is simple: ask the Agent about your systems, not how to log in to them.",
    finalBody: "SAFA is still a preview. The architecture, Skill, topology contract, and security boundaries are open for review now.",
  },
  zh: {
    eyebrow: "SAFA 如何工作",
    title: "智能体只看见任务，凭证由 SAFA 在本机处理。",
    body: "SAFA 是智能体与私有基础设施之间的一道本机安全边界。智能体可以发现已登记的资源、理解拓扑并申请一次有限操作，但不会拿到背后的密码、私钥、Token 或真实访问路径。",
    back: "返回产品页",
    github: "查看完整架构",
    principleEyebrow: "最直观的区别",
    principleTitle: "排查一次故障，不应该先变成一场凭证交接。",
    without: "没有 SAFA",
    withoutSteps: ["智能体先问应该登录哪台机器", "你把 IP、用户名或密钥路径贴进对话", "凭证和连接信息进入聊天记录", "智能体获得一个宽泛、可复用的会话"],
    with: "使用 SAFA",
    withSteps: ["你直接问某个服务为什么异常", "Skill 找到安全的资源别名", "Runtime 在本机解析受保护的访问路径", "最终只执行经过授权的排查操作"],
    flowEyebrow: "一次请求，经过五道边界",
    flowTitle: "从自然语言问题，到有限、可审计的证据。",
    flowBody: "每一层只负责一件事：Skill 负责规划；原生 Runtime 负责凭证、策略、授权和连接。",
    flow: [
      { title: "1. 你描述问题", body: "“api.production 为什么返回 502？”不需要先提供 IP 或密码。" },
      { title: "2. Skill 获取上下文", body: "它找到已登记的资源别名，再查询部署位置、访问路径或故障影响。" },
      { title: "3. 策略收窄操作", body: "Runtime 把请求绑定到一个资源、一个命令、明确范围和有效期。" },
      { title: "4. 由你的 Mac 授权", body: "需要本人确认时，macOS 会先展示完整操作，再通过 Touch ID 授权。" },
      { title: "5. 返回排查证据", body: "Runtime 执行操作，对输出限长、脱敏，并明确标记为不可信远端数据。" },
    ],
    boundaryEyebrow: "凭证隔离",
    boundaryTitle: "凭证不会进入智能体可见通道。",
    boundaryBody: "代码开源不等于秘密公开。公开的是实现；Keychain 记录、保险箱密钥、真实访问路径和授权结果仍然只存在于本机 Runtime 中。",
    agentZone: "智能体可见",
    agentItems: ["自然语言任务", "安全的资源别名", "有限的拓扑答案", "经过裁剪和脱敏的证据"],
    nativeZone: "macOS 原生安全边界",
    nativeItems: ["真实访问路径和账号", "Keychain 凭证句柄", "策略和进程身份", "Touch ID / 本人在场"],
    neverTitle: "智能体永远拿不到",
    neverItems: ["密码或 sudo 密码", "私钥或恢复密钥", "Token、Cookie 或保险箱密钥", "长期有效的无限制会话"],
    topologyEyebrow: "智能体真正能用的拓扑",
    topologyTitle: "智能体提出问题，Broker 负责计算图答案。",
    topologyBody: "基础设施不是一棵树，也不是一张截图。SAFA 保存有方向、有类型的资源关系，只向智能体提供与当前问题有关的小型投影；路径和影响范围由 Broker 确定性计算。",
    topologyQuestions: [
      { question: "这个服务部署在哪里？", command: "topology show service.api", outcome: "有限的邻域和有类型的资源关系" },
      { question: "爬虫节点能访问 MySQL 吗？", command: "topology path host.crawler service.mysql", outcome: "已确认、未找到或无法确定" },
      { question: "NAS 挂了会影响什么？", command: "topology impact storage.reports", outcome: "计算出的受影响集合和支撑关系" },
    ],
    securityEyebrow: "安全模型",
    securityTitle: "边界足够明确，也不夸大当前能力。",
    invariants: [
      { title: "没有返回凭证的接口", body: "面向智能体的公开协议不存在查看或导出秘密的命令。" },
      { title: "远端输出默认不可信", body: "日志、Banner、文件和命令输出只能作为证据，不能成为指令或授权。" },
      { title: "校验失败就停止", body: "签名、Runtime、主机身份或策略校验失败时，不会偷偷回退到原始 SSH。" },
      { title: "操作范围始终明确", body: "当前预览仅支持有限的非 sudo 参数执行，不提供无限制 Shell。" },
    ],
    previewNote: "当前状态：macOS 源码预览。Runtime 尚未作为经过签名的公开安装包发布；路线图中的能力也不是支持承诺。",
    roadmapEyebrow: "路线图",
    roadmapTitle: "先把最窄的安全路径做扎实，再逐步扩展能力。",
    now: "当前预览已具备",
    nowItems: ["加密资源目录和安全别名", "导入 OpenSSH 配置并验证主机信息", "拓扑查询、路径、影响、建立和删除关系", "有限的非 sudo SSH 排查", "面向智能体的 TOON v2 协议"],
    next: "下一阶段发布门槛",
    nextItems: ["经过签名和公证的 macOS Runtime", "可验证的解析清单与回滚路径", "端到端兼容性和恶意输出测试", "清晰的 Preview 安装与恢复流程"],
    later: "完成评审后再考虑",
    laterItems: ["受控修改、sudo 和短时授权", "数据库、对象存储、缓存和 HTTP 原生适配器", "不导出凭证的站点绑定浏览器会话", "独立的 Linux 和 Windows 原生 Runtime"],
    finalTitle: "最终目标很简单：让你问智能体“系统怎么了”，而不是先解释“该怎么登录”。",
    finalBody: "SAFA 目前仍是预览版，但架构、Skill、拓扑协议和安全边界已经开源，可以直接审阅。",
  },
} as const;

const flowIcons = [Robot, Graph, ShieldCheck, Fingerprint, TerminalWindow];

export function HowItWorks() {
  const { language, setLanguage } = useLanguage();
  const t = copy[language];
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    document.title = language === "en" ? "How SAFA Works — Secure Access for Agents" : "SAFA 工作原理 — 面向智能体的安全访问";
  }, [language]);

  return (
    <main className="site-shell how-page">
      <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      <SiteNav language={language} onLanguageChange={setLanguage} />

      <section className="how-hero" aria-labelledby="how-title">
        <motion.img
          className="hero-backdrop"
          src={siteHref("assets/hero-aurora.webp")}
          alt=""
          initial={reducedMotion ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 0.48, scale: 1 }}
          transition={{ duration: 0.9 }}
        />
        <div className="hero-shade" aria-hidden="true" />
        <div className="how-hero-content">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 id="how-title">{t.title}</h1>
          <p>{t.body}</p>
          <div className="hero-actions">
            <a className="button button-primary" href="#request-flow"><Path weight="bold" aria-hidden="true" /> {t.eyebrow}</a>
            <a className="button button-secondary" href={GITHUB_URL} target="_blank" rel="noreferrer"><GithubLogo weight="fill" aria-hidden="true" /> {t.github}</a>
          </div>
          <a className="back-link" href={siteHref()}><ArrowRight aria-hidden="true" /> {t.back}</a>
        </div>
        <div className="how-hero-visual" aria-label="Agent and native security boundary">
          <div><Robot weight="duotone" /><span>Agent</span><small>intent + evidence</small></div>
          <ArrowRight aria-hidden="true" />
          <div className="boundary-node"><ShieldCheck weight="duotone" /><span>SAFA Runtime</span><small>policy + authorization</small></div>
          <ArrowRight aria-hidden="true" />
          <div><TerminalWindow weight="duotone" /><span>Resource</span><small>bounded action</small></div>
        </div>
      </section>

      <section className="how-section principle-section" aria-labelledby="principle-title">
        <div className="section-heading centered">
          <p className="eyebrow">{t.principleEyebrow}</p>
          <h2 id="principle-title">{t.principleTitle}</h2>
        </div>
        <div className="comparison-grid">
          <article className="comparison-risk">
            <span className="comparison-label"><WarningCircle weight="fill" /> {t.without}</span>
            <ol>{t.withoutSteps.map((item) => <li key={item}>{item}</li>)}</ol>
          </article>
          <article className="comparison-safe">
            <span className="comparison-label"><ShieldCheck weight="fill" /> {t.with}</span>
            <ol>{t.withSteps.map((item) => <li key={item}>{item}</li>)}</ol>
          </article>
        </div>
      </section>

      <section className="how-section" id="request-flow" aria-labelledby="flow-title">
        <div className="section-heading">
          <p className="eyebrow">{t.flowEyebrow}</p>
          <h2 id="flow-title">{t.flowTitle}</h2>
          <p>{t.flowBody}</p>
        </div>
        <div className="request-flow">
          {t.flow.map((step, index) => {
            const Icon = flowIcons[index];
            return (
              <motion.article key={step.title} initial={reducedMotion ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ delay: index * 0.06 }}>
                <span><Icon weight="duotone" aria-hidden="true" /></span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="how-section boundary-section" id="credentials" aria-labelledby="boundary-title">
        <div className="section-heading centered">
          <p className="eyebrow">{t.boundaryEyebrow}</p>
          <h2 id="boundary-title">{t.boundaryTitle}</h2>
          <p>{t.boundaryBody}</p>
        </div>
        <div className="boundary-layout">
          <article>
            <span className="zone-icon"><Robot weight="duotone" /></span>
            <h3>{t.agentZone}</h3>
            <ul>{t.agentItems.map((item) => <li key={item}><CheckCircle weight="fill" />{item}</li>)}</ul>
          </article>
          <article className="native-boundary">
            <span className="zone-icon"><Vault weight="duotone" /></span>
            <h3>{t.nativeZone}</h3>
            <ul>{t.nativeItems.map((item) => <li key={item}><LockKey weight="fill" />{item}</li>)}</ul>
          </article>
          <article className="never-zone">
            <span className="zone-icon"><EyeSlash weight="duotone" /></span>
            <h3>{t.neverTitle}</h3>
            <ul>{t.neverItems.map((item) => <li key={item}><EyeSlash weight="fill" />{item}</li>)}</ul>
          </article>
        </div>
        <div className="credential-rail" aria-label="Credential flow">
          <span><Laptop /> Mac</span><ArrowRight /><span><Vault /> Keychain</span><ArrowRight /><span><ShieldCheck /> Runtime</span><ArrowRight /><span><Database /> Resource</span>
          <strong><Key /> credential handle stays inside this rail</strong>
        </div>
      </section>

      <section className="how-section topology-section" id="topology" aria-labelledby="topology-title">
        <div className="section-heading">
          <p className="eyebrow">{t.topologyEyebrow}</p>
          <h2 id="topology-title">{t.topologyTitle}</h2>
          <p>{t.topologyBody}</p>
        </div>
        <div className="topology-grid">
          {t.topologyQuestions.map((item, index) => (
            <article key={item.command}>
              <span>{index === 0 ? <Graph /> : index === 1 ? <Network /> : <Path />}</span>
              <h3>{item.question}</h3>
              <code>safa {item.command}</code>
              <p>{item.outcome}</p>
            </article>
          ))}
        </div>
        <div className="topology-note"><Graph weight="duotone" /><p><strong>Directed typed multigraph</strong><span>desired claims ≠ observed facts · verified paths expire · large graphs become bounded task projections</span></p></div>
      </section>

      <section className="how-section security-detail" id="security-model" aria-labelledby="security-title">
        <div className="section-heading centered">
          <p className="eyebrow">{t.securityEyebrow}</p>
          <h2 id="security-title">{t.securityTitle}</h2>
        </div>
        <div className="invariant-grid">
          {t.invariants.map((item, index) => {
            const Icon = [Key, WarningCircle, ShieldCheck, TerminalWindow][index];
            return <article key={item.title}><Icon weight="duotone" /><h3>{item.title}</h3><p>{item.body}</p></article>;
          })}
        </div>
        <p className="preview-note"><WarningCircle weight="fill" />{t.previewNote}</p>
      </section>

      <section className="how-section roadmap-section" id="roadmap" aria-labelledby="roadmap-title">
        <div className="section-heading centered">
          <p className="eyebrow">{t.roadmapEyebrow}</p>
          <h2 id="roadmap-title">{t.roadmapTitle}</h2>
        </div>
        <div className="roadmap-grid">
          {[
            { title: t.now, items: t.nowItems, icon: CheckCircle, className: "roadmap-now" },
            { title: t.next, items: t.nextItems, icon: ShieldCheck, className: "roadmap-next" },
            { title: t.later, items: t.laterItems, icon: Browser, className: "roadmap-later" },
          ].map(({ title, items, icon: Icon, className }) => (
            <article className={className} key={title}><Icon weight="duotone" /><h3>{title}</h3><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></article>
          ))}
        </div>
      </section>

      <section className="final-cta how-final-cta">
        <div><ShieldCheck weight="fill" aria-hidden="true" /><span><strong>{t.finalTitle}</strong><small>{t.finalBody}</small></span></div>
        <a className="button button-primary" href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub <ArrowRight aria-hidden="true" /></a>
      </section>

      <SiteFooter language={language} />
    </main>
  );
}
