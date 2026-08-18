import { GithubLogo, Globe, Star } from "@phosphor-icons/react";
import React, { useEffect, useMemo, useState } from "react";
import { useGitHubStats } from "./githubStats";
import { GITHUB_URL, type Language, siteHref } from "./site";

const navigation = {
  en: { product: "Product", security: "Security", how: "How it works", docs: "Docs", live: "Live demo", switchLanguage: "Switch language to" },
  zh: { product: "产品", security: "安全机制", how: "工作原理", docs: "文档", live: "真实演示", switchLanguage: "切换语言：" },
} as const;

export function useLanguage() {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language]);

  return { language, setLanguage };
}

export function SiteNav({ language, onLanguageChange }: { language: Language; onLanguageChange: (language: Language) => void }) {
  const t = navigation[language];
  const languageLabel = useMemo(() => (language === "en" ? "中文" : "EN"), [language]);
  const { stars } = useGitHubStats();

  return (
    <header className="site-nav" aria-label="Primary navigation">
      <a className="brand" href={siteHref()} aria-label="SAFA home">
        <img src={siteHref("assets/safa-icon-64.png")} alt="" />
        <span>SAFA</span>
      </a>
      <nav className="nav-links">
        <a href={siteHref()}>{t.product}</a>
        <a href={siteHref("#security")}>{t.security}</a>
        <a href={siteHref("how-it-works/")}>{t.how}</a>
        <a className="nav-docs" href={siteHref("docs/")}>{t.docs}</a>
        <a className="nav-live" href={siteHref("live-demo/")}>{t.live}</a>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub</a>
      </nav>
      <div className="nav-right">
        <a className="star-badge" href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="SAFA on GitHub">
          <Star weight="fill" aria-hidden="true" />
          <span>{stars === null ? "–" : stars}</span>
        </a>
        <button
          className="language-switch"
          type="button"
          onClick={() => onLanguageChange(language === "en" ? "zh" : "en")}
          aria-label={`${t.switchLanguage} ${languageLabel}`}
        >
          <Globe aria-hidden="true" />
          <span>{language === "en" ? "EN" : "中文"}</span>
          <span className="language-divider" aria-hidden="true">/</span>
          <span className="language-muted">{languageLabel}</span>
        </button>
      </div>
    </header>
  );
}

export function SiteFooter({ language }: { language: Language }) {
  const { stars, delta30 } = useGitHubStats();
  return (
    <footer>
      <div className="brand"><img src={siteHref("assets/safa-icon-64.png")} alt="" /><span>SAFA</span></div>
      <p>{language === "en" ? "Secure Access for Agents" : "面向智能体的安全访问层"}</p>
      <div className="footer-meta">
        <a href={GITHUB_URL}><GithubLogo weight="fill" aria-hidden="true" /> MIT License · GitHub</a>
        {stars !== null ? (
          <span className="star-stats" aria-label="GitHub stars">
            <Star weight="fill" aria-hidden="true" />
            {stars}
            {delta30 !== null && delta30 > 0 ? (
              <em>+{delta30} {language === "en" ? "last 30 days" : "近 30 天"}</em>
            ) : null}
          </span>
        ) : null}
      </div>
    </footer>
  );
}