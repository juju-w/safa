import React, { type ReactNode, useEffect, useRef, useState } from "react";
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
  List,
  LockKey,
  MagnifyingGlass,
  Network,
  Play,
  ShareNetwork,
  ShieldCheck,
  TerminalWindow,
  WarningCircle,
} from "@phosphor-icons/react";
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import { SiteFooter, SiteNav, useLanguage } from "./SiteChrome";
import { GITHUB_URL, homeCopy, INSTALL_COMMAND, siteHref } from "./site";

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
  const { language, setLanguage } = useLanguage();
  const [copied, setCopied] = useState(false);
  const t = homeCopy[language];
  const reducedMotion = useReducedMotion();
  const demoRef = useRef<HTMLDivElement>(null);
  const demoInView = useInView(demoRef, { once: true, amount: 0.2 });
  const { phase, authorize, replay } = useDemoSequence(demoInView, reducedMotion);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, reducedMotion ? 0 : 90]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0.45]);

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

      <SiteNav language={language} onLanguageChange={setLanguage} />

      <section className="hero" aria-labelledby="hero-title">
        <motion.img className="hero-backdrop" src={siteHref("assets/hero-aurora.webp")} alt="" style={{ y: heroY, opacity: heroOpacity }} />
        <div className="hero-shade" aria-hidden="true" />
        <div className="hero-content">
          <p className="eyebrow">{t.heroEyebrow}</p>
          <h1 id="hero-title">SAFA</h1>
          <p className="hero-acronym">{t.heroAcronym}</p>
          <p className="hero-slogan">{t.heroSlogan}</p>
          <p className="hero-body">{t.heroBody}</p>
          <div className="hero-actions">
            <a className="button button-primary" href={siteHref("live-demo/")}>
              <Play weight="fill" aria-hidden="true" /> {t.seeDemo}
            </a>
            <a className="button button-secondary" href={siteHref("how-it-works/")}>
              <ShieldCheck weight="fill" aria-hidden="true" /> {t.learnHow}
            </a>
            <a className="button button-secondary" href={siteHref("why-safa/")}>
              <ArrowRight weight="bold" aria-hidden="true" /> {t.whySafa}
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
        <img className="hero-mascot" src={siteHref("assets/safa-mascot.webp")} alt={t.mascotAlt} />
      </section>

      <section className="prompt-section" aria-labelledby="prompt-heading">
        <div className="section-heading centered">
          <p className="eyebrow">{t.promptEyebrow}</p>
          <h2 id="prompt-heading">{t.promptTitle}</h2>
          <p>{t.promptBody}</p>
        </div>
        <div className="prompt-grid">
          {t.promptItems.map((item, index) => {
            const Icon = [WarningCircle, Network, ShareNetwork][index];
            return (
              <article key={item.prompt}>
                <span><Icon weight="duotone" aria-hidden="true" /></span>
                <blockquote>“{item.prompt}”</blockquote>
                <p>{item.result}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="articles-section" aria-labelledby="articles-heading">
        <div className="section-heading centered">
          <p className="eyebrow">{t.articlesEyebrow}</p>
          <h2 id="articles-heading">{t.articlesTitle}</h2>
          <a className="docs-link" href={siteHref("docs/")}><ArrowRight weight="bold" aria-hidden="true" /> {t.allDocs}</a>
        </div>
        <div className="articles-grid">
          {t.articles.map((article) => (
            <a className="article-card" key={article.url} href={siteHref(article.url)}>
              <span className="article-meta">{article.date}</span>
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
              <span className="article-link"><ArrowRight aria-hidden="true" /> {t.readArticle ?? "Read"}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="demo-section" id="diagnosis-demo" ref={demoRef} aria-labelledby="demo-heading">
        <div className="section-heading">
          <p className="eyebrow">{t.navHow}</p>
          <h2 id="demo-heading">{t.demoTitle}</h2>
          <div className="heading-actions">
            <a className="live-session-link" href={siteHref("live-demo/")}>
              <TerminalWindow weight="fill" aria-hidden="true" />
              <span><strong>{t.liveSessionTitle}</strong><small>{t.liveSessionBody}</small></span>
              <ArrowRight aria-hidden="true" />
            </a>
            <button className="replay-button" type="button" onClick={replay}><Play weight="fill" aria-hidden="true" /> {t.replay}</button>
          </div>
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
          <article className="trust-center"><span><ShieldCheck weight="duotone" /></span><h3>{t.policyTitle}</h3><p>{t.policyBody}</p><img src={siteHref("assets/safa-mascot.webp")} alt="" /></article>
          <ArrowRight className="flow-arrow" aria-hidden="true" />
          <article><span><Database /></span><h3>{t.resourceTitle}</h3><p>{t.resourceBody}</p></article>
        </div>
        <p className="credential-note"><LockKey weight="fill" /> {t.credentials}</p>
      </section>

      <section className="final-cta">
        <div><GithubLogo weight="fill" aria-hidden="true" /><span><strong>{t.openTitle}</strong><small>{t.openBody}</small></span></div>
        <a className="button button-primary" href={GITHUB_URL} target="_blank" rel="noreferrer">{t.github} <ArrowRight aria-hidden="true" /></a>
      </section>

      <SiteFooter language={language} />
    </main>
  );
}