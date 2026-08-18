import {
  ArrowRight,
  Check,
  CheckCircle,
  Clipboard,
  Copy,
  EyeSlash,
  Fingerprint,
  GithubLogo,
  LockKey,
  MagnifyingGlass,
  ShieldCheck,
  TerminalWindow,
  WarningCircle,
} from "@phosphor-icons/react";
import { motion, useReducedMotion, useScroll } from "motion/react";
import React, { useEffect, useRef, useState } from "react";
import { SiteFooter, SiteNav, useLanguage } from "./SiteChrome";
import { GITHUB_URL, siteHref } from "./site";
import { liveDemoCopy, liveDemoSteps, type Step } from "./liveDemo";

const kindLabel = {
  en: { check: "Check", finding: "Finding", boundary: "Boundary" },
  zh: { check: "检查", finding: "发现", boundary: "边界" },
} as const;

function CopyButton({ text, label, copiedLabel }: { text: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      if (window.navigator?.clipboard) {
        await window.navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        textArea.remove();
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button className="ld-copy" type="button" onClick={copy} aria-label={label}>
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      <span>{copied ? copiedLabel : label}</span>
    </button>
  );
}

function StepCard({ step, index, lang }: { step: Step; index: number; lang: "en" | "zh" }) {
  const t = liveDemoCopy[lang];
  const KindIcon = step.kind === "check" ? ShieldCheck : step.kind === "finding" ? MagnifyingGlass : LockKey;
  const emphasisClass = step.emphasis === "swap" ? " emphasis-swap" : step.emphasis === "deny" ? " emphasis-deny" : step.emphasis === "note" ? " emphasis-note" : "";
  return (
    <article className={`ld-step ld-step-${step.kind}${emphasisClass}`} id={`step-${step.id}`}>
      <header className="ld-step-head">
        <span className="ld-step-index">{String(index + 1).padStart(2, "0")}</span>
        <span className={`ld-kind-badge ld-kind-${step.kind}`}><KindIcon weight="fill" aria-hidden="true" />{kindLabel[lang][step.kind]}</span>
        <h3>{step.title[lang]}</h3>
      </header>
      <div className="ld-thinking">
        <strong><TerminalWindow aria-hidden="true" />{t.thinkingLabel}</strong>
        <p>{step.thinking[lang]}</p>
      </div>
      <div className="ld-command">
        <span>{t.commandLabel}</span>
        <pre><code>{step.command}</code></pre>
        <CopyButton text={step.command} label={t.copyCommand} copiedLabel={t.copied} />
      </div>
      <div className="ld-output">
        <span>{t.outputLabel}</span>
        <pre><code>{step.output}</code></pre>
      </div>
      {step.reading ? (
        <div className="ld-reading">
          <strong>{t.readingLabel}</strong>
          <p>{step.reading[lang]}</p>
        </div>
      ) : null}
    </article>
  );
}

export function LiveDemo() {
  const { language, setLanguage } = useLanguage();
  const t = liveDemoCopy[language];
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    document.title = language === "en"
      ? "SAFA Live Demo — A Real Diagnosis, Replayed"
      : "SAFA 真实演示 — 一次真实排查的完整回放";
  }, [language]);

  const boundarySteps = liveDemoSteps.filter((s) => s.kind === "boundary");
  const mainSteps = liveDemoSteps.filter((s) => s.kind !== "boundary");

  return (
    <main className="site-shell ld-page">
      <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      <SiteNav language={language} onLanguageChange={setLanguage} />

      <section className="ld-hero" aria-labelledby="ld-title">
        <motion.img className="hero-backdrop" src={siteHref("assets/hero-aurora.webp")} alt="" initial={reducedMotion ? false : { opacity: 0, scale: 1.04 }} animate={{ opacity: 0.42, scale: 1 }} transition={{ duration: 0.9 }} />
        <div className="hero-shade" aria-hidden="true" />
        <div className="ld-hero-content">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 id="ld-title">{t.title}</h1>
          <p className="ld-hero-body">{t.body}</p>
          <div className="ld-meta">
            <span><span className="status-dot" />{t.metaRuntime}</span>
            <span>{t.metaDate}</span>
            <span className="ld-meta-sanitized"><EyeSlash aria-hidden="true" />{t.metaSanitized}</span>
          </div>
          <div className="hero-actions">
            <a className="button button-primary" href="#ld-steps"><TerminalWindow weight="fill" aria-hidden="true" />{t.stepsLabel}</a>
            <a className="button button-secondary" href={GITHUB_URL} target="_blank" rel="noreferrer"><GithubLogo weight="fill" aria-hidden="true" />{t.github}</a>
          </div>
          <a className="back-link" href={siteHref("how-it-works/")}><ArrowRight aria-hidden="true" />{t.back}</a>
        </div>
      </section>

      <nav className="ld-toc" aria-label={t.stepsLabel}>
        {liveDemoSteps.map((s, i) => (
          <a key={s.id} href={`#step-${s.id}`}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <small>{s.title[language]}</small>
          </a>
        ))}
      </nav>

      <section className="ld-section" id="ld-steps" aria-labelledby="ld-steps-title">
        <div className="section-heading">
          <p className="eyebrow">{t.stepsLabel}</p>
          <h2 id="ld-steps-title">{t.title}</h2>
        </div>
        <div className="ld-steps">
          {mainSteps.map((step, index) => (<StepCard key={step.id} step={step} index={index} lang={language} />))}
        </div>
      </section>

      <section className="ld-section ld-boundary" aria-labelledby="ld-boundary-title">
        <div className="section-heading">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 id="ld-boundary-title">{t.boundaryTitle}</h2>
          <p>{t.boundaryBody}</p>
        </div>
        <div className="ld-steps">
          {boundarySteps.map((step, index) => (<StepCard key={step.id} step={step} index={mainSteps.length + index} lang={language} />))}
        </div>
      </section>

      <section className="ld-section ld-auth" aria-labelledby="ld-auth-title">
        <div className="section-heading">
          <p className="eyebrow">{t.authorizedFlow.eyebrow}</p>
          <h2 id="ld-auth-title">{t.authorizedFlow.title}</h2>
          <p>{t.authorizedFlow.body}</p>
        </div>
        <div className="ld-auth-status"><WarningCircle weight="fill" aria-hidden="true" />{t.authorizedFlow.status}</div>
        <div className="ld-auth-steps">
          {t.authorizedFlow.steps.map((step, index) => {
            const Icon = [TerminalWindow, ShieldCheck, Fingerprint, CheckCircle][index] ?? CheckCircle;
            return (
              <article key={step.title}>
                <span className="ld-auth-num">{String(index + 1).padStart(2, "0")}</span>
                <Icon weight="duotone" aria-hidden="true" />
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="ld-section ld-conclusion" aria-labelledby="ld-conclusion-title">
        <div className="section-heading centered">
          <p className="eyebrow">{t.findingTitle}</p>
          <h2 id="ld-conclusion-title">{t.conclusionTitle}</h2>
          <p className="ld-finding-body">{t.findingBody}</p>
        </div>
        <p className="ld-conclusion-body">{t.conclusionBody}</p>
        <ul className="ld-conclusion-points">
          {t.conclusionPoints.map((point) => (<li key={point}><CheckCircle weight="fill" aria-hidden="true" />{point}</li>))}
        </ul>
        <div className="ld-next">
          <strong>{t.nextTitle}</strong>
          <p>{t.nextBody}</p>
        </div>
      </section>

      <section className="final-cta ld-final">
        <div><ShieldCheck weight="fill" aria-hidden="true" /><span><strong>{t.finalLine}</strong><small>{t.replayHint}</small></span></div>
        <a className="button button-primary" href={siteHref("how-it-works/")}><Clipboard weight="fill" aria-hidden="true" />{t.back} <ArrowRight aria-hidden="true" /></a>
      </section>

      <SiteFooter language={language} />
    </main>
  );
}