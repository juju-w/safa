import { useEffect, useState } from "react";

// Live GitHub stats for the repo card / navigation badge.
// Public endpoints only (no token), cached for 6h in localStorage to stay
// well under the unauthenticated rate limit (60 req/h per IP).

const REPO = "juju-w/safa";
const CACHE_KEY = "safa-gh-stats-v1";
const CACHE_TTL = 6 * 60 * 60 * 1000;

export interface GitHubStats {
  stars: number | null;
  delta30: number | null;
  fetchedAt: number;
}

const EMPTY: GitHubStats = { stars: null, delta30: null, fetchedAt: 0 };

export function useGitHubStats(): GitHubStats {
  const [stats, setStats] = useState<GitHubStats>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const cachedRaw = localStorage.getItem(CACHE_KEY);
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw) as GitHubStats;
          if (Date.now() - cached.fetchedAt < CACHE_TTL) {
            if (!cancelled) setStats(cached);
            return;
          }
        }
        const [repoRes, starRes] = await Promise.all([
          fetch(`https://api.github.com/repos/${REPO}`),
          fetch(`https://api.github.com/repos/${REPO}/stargazers`, {
            headers: { Accept: "application/vnd.github.star+json" },
          }),
        ]);
        const repo = await repoRes.json();
        let delta30: number | null = null;
        if (starRes.ok) {
          const stargazers = await starRes.json();
          if (Array.isArray(stargazers)) {
            const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
            delta30 = stargazers.filter((s: { starred_at?: string }) =>
              s?.starred_at && new Date(s.starred_at).getTime() >= cutoff
            ).length;
          }
        }
        const next: GitHubStats = {
          stars: typeof repo.stargazers_count === "number" ? repo.stargazers_count : null,
          delta30,
          fetchedAt: Date.now(),
        };
        if (!cancelled) setStats(next);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      } catch {
        if (!cancelled) setStats(EMPTY);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  return stats;
}
