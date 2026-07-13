import { AppShell } from "@/components/meku/AppShell";
import { EmptyState } from "@/components/meku/EmptyState";
import { IconSearch } from "@/components/meku/MekuIcon";
import { Avatar } from "@/components/meku/Avatar";
import { VerificationBadge } from "@/components/meku/VerificationBadge";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { type Profile } from "@/lib/social";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const RECENT_KEY = "meku.search.recent.v1";

const readRecent = (): string[] => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
};
const writeRecent = (items: string[]) => {
  try { localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, 8))); } catch {}
};

interface Trend { tag: string; count: number }
const HASHTAG_RE = /#([A-Za-z0-9_]{2,32})/g;

const Explore = () => {
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const [results, setResults] = useState<Profile[]>([]);
  const [suggested, setSuggested] = useState<Profile[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>(() => readRecent());
  const inputRef = useRef<HTMLInputElement>(null);

  // Suggested people (top ~10 profiles).
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      setSuggested((data ?? []) as Profile[]);
    })();
  }, []);

  // Real trending hashtags — extracted from recent posts (last 7 days).
  useEffect(() => {
    (async () => {
      const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
      const { data } = await supabase
        .from("posts")
        .select("title,body")
        .gte("created_at", since)
        .limit(500);
      const counts = new Map<string, { display: string; count: number }>();
      (data ?? []).forEach((p: any) => {
        const text = `${p.title ?? ""} ${p.body ?? ""}`;
        const matches = text.matchAll(HASHTAG_RE);
        for (const m of matches) {
          const key = m[1].toLowerCase();
          const cur = counts.get(key);
          if (cur) cur.count += 1;
          else counts.set(key, { display: `#${m[1]}`, count: 1 });
        }
      });
      const top = Array.from(counts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 6)
        .map((t) => ({ tag: t.display, count: t.count }));
      setTrends(top);
    })();
  }, []);

  // Debounced search.
  useEffect(() => {
    const term = q.trim();
    if (!term) { setResults([]); setLoading(false); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const like = `%${term}%`;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.${like},display_name.ilike.${like}`)
        .limit(30);
      setResults((data ?? []) as Profile[]);
      setLoading(false);
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  const commitRecent = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recent.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 8);
    setRecent(next);
    writeRecent(next);
  };
  const clearRecent = () => { setRecent([]); writeRecent([]); };
  const removeRecent = (r: string) => {
    const next = recent.filter((x) => x !== r);
    setRecent(next); writeRecent(next);
  };

  const showResults = q.trim().length > 0;
  const showRecents = !showResults && recent.length > 0;
  const showDiscover = !showResults;

  const orderedSuggested = useMemo(() => suggested.slice(0, 6), [suggested]);

  return (
    <AppShell>
      {/* Sticky search header */}
      <header className="sticky top-0 z-30 bg-background/85 px-4 pt-3 pb-3 backdrop-blur-xl">
        <form
          onSubmit={(e) => { e.preventDefault(); commitRecent(q); inputRef.current?.blur(); }}
          className={cn(
            "flex h-[42px] items-center gap-2 rounded-full border bg-surface-2 px-4 transition-colors",
            focused ? "border-primary" : "border-transparent",
          )}
        >
          <IconSearch size={18} className={cn(focused ? "text-primary" : "text-muted-foreground")} />
          <input
            ref={inputRef}
            value={q}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search MEKU"
            className="flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          {q && (
            <button
              type="button"
              onClick={() => { setQ(""); inputRef.current?.focus(); }}
              className="tap inline-flex h-6 w-6 items-center justify-center rounded-full bg-foreground/80 text-background"
              aria-label="Clear"
            >
              <X size={14} strokeWidth={3} />
            </button>
          )}
        </form>
      </header>

      {/* Live search results */}
      {showResults && (
        loading ? (
          <UserListSkeleton count={6} />
        ) : results.length === 0 ? (
          <EmptyState pose="thinking" title={`No results for "${q}"`} description="Try a different name or handle." />
        ) : (
          <ul>
            {results.map((p) => (
              <li key={p.id} className="hairline-b">
                <Link
                  to={p.username ? `/u/${p.username}` : "#"}
                  onClick={() => commitRecent(q)}
                  className="tap flex items-center gap-3 px-4 py-3 hover:bg-surface/40"
                >
                  <Avatar name={p.display_name || p.username || "User"} src={p.avatar_url ?? undefined} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 truncate">
                      <span className="truncate text-[15px] font-bold text-foreground">{p.display_name || p.username || "User"}</span>
                      <VerificationBadge kind={(p.verification_kind ?? (p.verified ? "verified" : "none")) as any} size={14} />
                    </div>
                    {p.username && <p className="truncate text-[13px] text-muted-foreground">@{p.username}</p>}
                    {p.bio && <p className="mt-0.5 truncate text-[13px] text-foreground/80">{p.bio}</p>}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )
      )}

      {/* Recents */}
      {showRecents && (
        <section className="pt-2">
          <div className="flex items-center justify-between px-4 pb-1">
            <h2 className="text-[15px] font-bold tracking-[-0.01em] text-foreground">Recent searches</h2>
            <button onClick={clearRecent} className="tap text-[13px] font-semibold text-primary">Clear all</button>
          </div>
          <ul>
            {recent.map((r) => (
              <li key={r} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface/40">
                <button
                  onClick={() => { setQ(r); inputRef.current?.focus(); }}
                  className="tap flex flex-1 items-center gap-3 text-left"
                >
                  <IconSearch size={16} className="text-muted-foreground" />
                  <span className="truncate text-[15px] text-foreground">{r}</span>
                </button>
                <button
                  onClick={() => removeRecent(r)}
                  aria-label={`Remove ${r}`}
                  className="tap inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-surface-2"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Discover — trends + suggested */}
      {showDiscover && (
        <>
          {trends.length > 0 ? (
            <section className="pt-3">
              <h2 className="px-4 pb-1 text-[18px] font-bold tracking-[-0.01em] text-foreground">Trends for you</h2>
              <ul>
                {trends.map((t) => (
                  <li key={t.tag} className="hairline-b">
                    <button
                      onClick={() => { setQ(t.tag); commitRecent(t.tag); inputRef.current?.focus(); }}
                      className="tap flex w-full flex-col items-start gap-0.5 px-4 py-3 text-left hover:bg-surface/40"
                    >
                      <span className="text-[12px] text-muted-foreground">Trending on MEKU</span>
                      <span className="text-[15px] font-bold tracking-[-0.01em] text-foreground">{t.tag}</span>
                      <span className="text-[12px] text-muted-foreground tabular-nums">{t.count} {t.count === 1 ? "post" : "posts"}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : (
            recent.length === 0 && (
              <EmptyState
                pose="searching"
                title="Search MEKU"
                description="Find people, posts, and trending hashtags across the network."
              />
            )
          )}
        </>
      )}
    </AppShell>
  );
};

export default Explore;
