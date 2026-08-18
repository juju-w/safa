import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle,
  Clipboard,
  Copy,
  Database,
  DotsThree,
  Fingerprint,
  GithubLogo,
  Globe,
  List,
  LockKey,
  MagnifyingGlass,
  Play,
  ShieldCheck,
  TerminalWindow,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";

type Language = "en" | "zh";

const INSTALL_COMMAND = "npx skills add juju-w/safa --skill safa";
const GITHUB_URL = "https://github.com/juju-w/safa";

const copy = {
  en: {
    navProduct: "Product",
    navSecurity: "Security",
    navHow: "How it works",
    heroEyebrow: "Secure Access for Agents",
    heroSlogan: "Give agents access, not credentials.",
    heroBody: "A native security boundary for AI agents—policy-controlled, user-authorized, and built for real infrastructure work.",
    github: "View on GitHub",
    seeDemo: "See the demo",
    install: "Install",
    copied: "Copied",
    copyInstall: "Copy install command",
    switchLanguage: "Switch language to",
    mascotAlt: "SAFA owl guardian",
    userLabel: "You",
    demoTitle: "Diagnose checkout-api",
    online: "Online",
    conversation: "Conversation",
    session: "Session · interactive demo",
    userPrompt: "Why is checkout-api returning 502? Diagnose only—don’t change anything.",
    thinking: "Working through SAFA…",
    discovered: "Discovered resource alias",
    topology: "Checked topology",
    topologyDetail: "checkout-api · production",
    health: "Ran safe health check",
    authorization: "Authorization required",
    authorizationBody: "A read-only action needs your approval.",
    resource: "Resource",
    action: "Action",
    actionValue: "Read service logs from the last 10 minutes",
    scope: "Scope",
    scopeValue: "One action · expires in 5 minutes",
    sealed: "Credentials remain sealed",
    touchId: "Authorize with Touch ID",
    waiting: "Waiting for your authorization…",
    granted: "Authorization granted",
    logRead: "Executed log read",
    logReadDetail: "Last 10 minutes · read-only",
    finding: "Finding",
    findingValue: "Database connection pool exhausted. No changes made.",
    message: "Message SAFA Agent…",
    policy: "Policy active",
    leastPrivilege: "Least privilege",
    replay: "Replay demo",
    trustEyebrow: "Security boundary",
    trustTitle: "Trust built for agent workflows",
    trustBody: "The agent gets evidence. SAFA keeps credentials, policy, and user authorization on your Mac.",
    requestTitle: "Agent request",
    requestBody: "The agent asks for one resource or action through a safe logical alias.",
    policyTitle: "SAFA policy & user authorization",
    policyBody: "SAFA evaluates the exact action and asks you when user presence is required.",
    resourceTitle: "Registered resource",
    resourceBody: "Only the approved, scoped action reaches the selected resource.",
    credentials: "Reusable credentials never enter the conversation.",
    openTitle: "Open by design. Built for builders.",
    openBody: "Review the code, shape the policy, and help make agent access safer.",
    footer: "Secure Access for Agents",
  },
  zh: {
    navProduct: "产品",
    navSecurity: "安全机制",
    navHow: "工作原理",
    heroEyebrow: "智能体安全访问",
    heroSlogan: "让智能体能访问系统，但永远看不到凭证。",
    heroBody: "SAFA 在智能体和你的服务器、数据库之间建立一道本机安全边界：每次访问都受策略限制，并由你本人授权。",
    github: "在 GitHub 查看源码",
    seeDemo: "查看演示",
    install: "安装",
    copied: "已复制",
    copyInstall: "复制安装命令",
    switchLanguage: "切换语言：",
    mascotAlt: "SAFA 守护猫头鹰",
    userLabel: "你",
    demoTitle: "排查 checkout-api 故障",
    online: "运行中",
    conversation: "对话",
    session: "交互演示",
    userPrompt: "checkout-api 为什么一直返回 502？只排查原因，不要修改任何配置。",
    thinking: "正在排查…",
    discovered: "定位到目标资源",
    topology: "确认服务拓扑",
    topologyDetail: "checkout-api · 生产环境",
    health: "完成只读健康检查",
    authorization: "需要你的授权",
    authorizationBody: "继续读取日志前，请确认这次只读操作。",
    resource: "目标资源",
    action: "即将执行",
    actionValue: "读取最近 10 分钟的服务日志",
    scope: "授权范围",
    scopeValue: "仅限本次操作 · 5 分钟内有效",
    sealed: "凭证不会暴露给智能体",
    touchId: "使用 Touch ID 授权",
    waiting: "等待授权…",
    granted: "已获得授权",
    logRead: "已读取服务日志",
    logReadDetail: "最近 10 分钟 · 只读",
    finding: "排查结果",
    findingValue: "数据库连接池已耗尽；全程未修改任何配置。",
    message: "向 SAFA Agent 提问…",
    policy: "安全策略已生效",
    leastPrivilege: "默认最小权限",
    replay: "重新播放",
    trustEyebrow: "安全边界",
    trustTitle: "每一次访问，都经过明确授权",
    trustBody: "智能体拿到的是一次性访问能力；凭证、策略和授权过程始终留在你的 Mac 上。",
    requestTitle: "智能体提出请求",
    requestBody: "智能体只描述要访问的资源和要执行的操作，不接触真实凭证。",
    policyTitle: "SAFA 校验策略并请求授权",
    policyBody: "SAFA 核对操作范围；需要本人确认时，再通过 Touch ID 授权。",
    resourceTitle: "执行限定操作",
    resourceBody: "只有经过授权的操作才能到达目标资源，权限用完即失效。",
    credentials: "可复用凭证不会进入对话，也不会交给智能体。",
    openTitle: "开源、可审计，也欢迎一起完善。",
    openBody: "查看源码、审阅安全边界，或参与 SAFA 的开发。",
    footer: "面向智能体的安全访问层",
  },
} as const;

function useDemoSequence(active: boolean, reducedMotion: boolean | null) {
  const [phase, setPhase] = useState(0);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!active) return;
    if (reducedMotion) {
      setPhase(4);
      return;
    }
    const timers = [
      window.setTimeout(() => setPhase(1), 350),
      window.setTimeout(() => setPhase(2), 800),
      window.setTimeout(() => setPhase(3), 1250),
      window.setTimeout(() => setPhase(4), 1750),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [active, reducedMotion]);

  useEffect(() => {
    if (!authorized) return;
    const timers = [
      window.setTimeout(() => setPhase(5), reducedMotion ? 0 : 250),
      window.setTimeout(() => setPhase(6), reducedMotion ? 0 : 650),
      window.setTimeout(() => setPhase(7), reducedMotion ? 0 : 1050),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [authorized, reducedMotion]);

  const authorize = () => setAuthorized(true);
  const replay = () => {
    setAuthorized(false);
    setPhase(0);
    window.setTimeout(() => setPhase(reducedMotion ? 4 : 1), 80);
    if (!reducedMotion) {
      window.setTimeout(() => setPhase(2), 500);
      window.setTimeout(() => setPhase(3), 950);
      window.setTimeout(() => setPhase(4), 1400);
    }
  };

  return { phase, authorize, replay };
}

function ToolRow({ icon, label, detail, visible }: { icon: ReactNode; label: string; detail: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div className="tool-row" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <span className="tool-icon">{icon}</span>
          <span>{label}</span>
          <code>{detail}</code>
          <CheckCircle weight="fill" className="row-check" aria-hidden="true" />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function Prototype() {
  const [language, setLanguage] = useState<Language>("en");
  const [copied, setCopied] = useState(false);
  const t = copy[language];
  const reducedMotion = useReducedMotion();
  const demoRef = useRef<HTMLDivElement>(null);
  const demoInView = useInView(demoRef, { once: true, amount: 0.2 });
  const { phase, authorize, replay } = useDemoSequence(demoInView, reducedMotion);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, reducedMotion ? 0 : 90]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0.45]);
  const assetBase = import.meta.env.BASE_URL;

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  const languageLabel = useMemo(() => (language === "en" ? "中文" : "EN"), [language]);

  async function copyInstallCommand() {
    try {
      if (window.navigator?.clipboard) {
        await window.navigator.clipboard.writeText(INSTALL_COMMAND);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = INSTALL_COMMAND;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        const copiedWithFallback = document.execCommand("copy");
        textArea.remove();
        if (!copiedWithFallback) throw new Error("Copy is unavailable");
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="site-shell" id="product">
      <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />

      <header className="site-nav" aria-label="Primary navigation">
        <a className="brand" href="#product" aria-label="SAFA home">
          <img src={`${assetBase}assets/safa-icon-64.png`} alt="" />
          <span>SAFA</span>
        </a>
        <nav className="nav-links">
          <a href="#product">{t.navProduct}</a>
          <a href="#security">{t.navSecurity}</a>
          <a href="#how-it-works">{t.navHow}</a>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
        </nav>
        <button className="language-switch" type="button" onClick={() => setLanguage(language === "en" ? "zh" : "en")} aria-label={`${t.switchLanguage} ${languageLabel}`}>
          <Globe aria-hidden="true" />
          <span>{language === "en" ? "EN" : "中文"}</span>
          <span className="language-divider" aria-hidden="true">/</span>
          <span className="language-muted">{languageLabel}</span>
        </button>
      </header>

      <section className="hero" aria-labelledby="hero-title">
        <motion.img className="hero-backdrop" src={`${assetBase}assets/hero-aurora.webp`} alt="" style={{ y: heroY, opacity: heroOpacity }} />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">{t.heroEyebrow}</p>
          <h1 id="hero-title">SAFA</h1>
          <p className="hero-slogan">{t.heroSlogan}</p>
          <p className="hero-body">{t.heroBody}</p>
          <div className="hero-actions">
            <a className="button button-primary" href={GITHUB_URL} target="_blank" rel="noreferrer">
              <GithubLogo weight="fill" aria-hidden="true" /> {t.github}
            </a>
            <a className="button button-secondary" href="#how-it-works">
              <Play weight="fill" aria-hidden="true" /> {t.seeDemo}
            </a>
          </div>
          <div className="install-command" aria-label={`${t.install}: ${INSTALL_COMMAND}`}>
            <span>{t.install}</span>
            <code>{INSTALL_COMMAND}</code>
            <button type="button" onClick={copyInstallCommand} aria-label={copied ? t.copied : t.copyInstall}>
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
            </button>
            <AnimatePresence>{copied ? <motion.em initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>{t.copied}</motion.em> : null}</AnimatePresence>
          </div>
        </div>
        <img className="hero-mascot" src={`${assetBase}assets/safa-mascot.webp`} alt={t.mascotAlt} />
      </section>

      <section className="demo-section" id="how-it-works" ref={demoRef} aria-labelledby="demo-heading">
        <div className="section-heading">
          <p className="eyebrow">{t.navHow}</p>
          <h2 id="demo-heading">{t.demoTitle}</h2>
          <button className="replay-button" type="button" onClick={replay}><Play weight="fill" aria-hidden="true" /> {t.replay}</button>
        </div>

        <motion.div className="agent-window">
          <aside className="agent-sidebar">
            <div className="agent-product"><ShieldCheck weight="fill" /> <span>SAFA Agent</span></div>
            <p>{t.conversation}</p>
            <div className="conversation-item"><span className="status-dot" /> <strong>{t.demoTitle}</strong><small>{t.session}</small></div>
            <div className="policy-badge"><ShieldCheck weight="fill" /><div><strong>{t.policy}</strong><small>{t.leastPrivilege}</small></div></div>
          </aside>

          <div className="agent-main">
            <div className="agent-toolbar">
              <div><span className="status-dot" /><strong>{t.demoTitle}</strong><small>{t.online}</small></div>
              <div className="toolbar-icons" aria-hidden="true"><MagnifyingGlass /><List /><DotsThree /></div>
            </div>
            <div className="message-stack" aria-live="polite">
              <div className="message user-message"><span>{t.userLabel}</span><p>{t.userPrompt}</p></div>
              <div className="message agent-message">
                <div className="message-author"><ShieldCheck weight="fill" /><span>SAFA Agent</span><small>{phase < 4 ? t.thinking : ""}</small></div>
                <div className="tool-list">
                  <ToolRow visible={phase >= 1} icon={<ShieldCheck />} label={t.discovered} detail="api.production" />
                  <ToolRow visible={phase >= 2} icon={<Database />} label={t.topology} detail={t.topologyDetail} />
                  <ToolRow visible={phase >= 3} icon={<TerminalWindow />} label={t.health} detail="200 OK" />
                </div>

                <AnimatePresence>
                  {phase >= 4 ? (
                    <motion.div className="approval-card" initial={{ opacity: 0, scale: 0.985, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
                      <div className="approval-heading"><div><LockKey weight="fill" /><span><strong>{t.authorization}</strong><small>{t.authorizationBody}</small></span></div><em><ShieldCheck /> {t.sealed}</em></div>
                      <div className="approval-grid">
                        <dl><div><dt>{t.resource}</dt><dd><code>api.production</code></dd></div><div><dt>{t.action}</dt><dd>{t.actionValue}</dd></div><div><dt>{t.scope}</dt><dd>{t.scopeValue}</dd></div></dl>
                        <button type="button" className="touch-id-button" onClick={authorize} disabled={phase >= 5}>
                          {phase >= 5 ? <CheckCircle weight="fill" /> : <Fingerprint weight="duotone" />}
                          <span>{phase >= 5 ? t.granted : t.touchId}</span>
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {phase === 4 ? <div className="waiting-row"><span />{t.waiting}</div> : null}
                <ToolRow visible={phase >= 5} icon={<ShieldCheck />} label={t.granted} detail="Touch ID" />
                <ToolRow visible={phase >= 6} icon={<Clipboard />} label={t.logRead} detail={t.logReadDetail} />
                <AnimatePresence>{phase >= 7 ? <motion.div className="finding-row" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><CheckCircle weight="fill" /><div><strong>{t.finding}</strong><p>{t.findingValue}</p></div></motion.div> : null}</AnimatePresence>
              </div>
            </div>
            <div className="message-input"><span>{t.message}</span><ArrowRight aria-hidden="true" /></div>
          </div>
        </motion.div>
      </section>

      <section className="trust-section" id="security" aria-labelledby="trust-title">
        <div className="section-heading centered">
          <p className="eyebrow">{t.trustEyebrow}</p>
          <h2 id="trust-title">{t.trustTitle}</h2>
          <p>{t.trustBody}</p>
        </div>
        <div className="trust-flow">
          <article><span><TerminalWindow /></span><h3>{t.requestTitle}</h3><p>{t.requestBody}</p></article>
          <ArrowRight className="flow-arrow" aria-hidden="true" />
          <article className="trust-center"><span><ShieldCheck weight="duotone" /></span><h3>{t.policyTitle}</h3><p>{t.policyBody}</p><img src={`${assetBase}assets/safa-mascot.webp`} alt="" /></article>
          <ArrowRight className="flow-arrow" aria-hidden="true" />
          <article><span><Database /></span><h3>{t.resourceTitle}</h3><p>{t.resourceBody}</p></article>
        </div>
        <p className="credential-note"><LockKey weight="fill" /> {t.credentials}</p>
      </section>

      <section className="final-cta">
        <div><GithubLogo weight="fill" aria-hidden="true" /><span><strong>{t.openTitle}</strong><small>{t.openBody}</small></span></div>
        <a className="button button-primary" href={GITHUB_URL} target="_blank" rel="noreferrer">{t.github} <ArrowRight aria-hidden="true" /></a>
      </section>

      <footer><div className="brand"><img src={`${assetBase}assets/safa-icon-64.png`} alt="" /><span>SAFA</span></div><p>{t.footer}</p><a href={GITHUB_URL}>MIT License · GitHub</a></footer>
    </main>
  );
}
