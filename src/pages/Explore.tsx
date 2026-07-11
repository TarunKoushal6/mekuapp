import { AppShell } from "@/components/meku/AppShell";
import { TopBar } from "@/components/meku/TopBar";
import { Logo } from "@/components/meku/Logo";
import { EmptyState } from "@/components/meku/EmptyState";
import { IconSearch } from "@/components/meku/MekuIcon";
import { Avatar } from "@/components/meku/Avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/social";
import { Link } from "react-router-dom";

const Explore = () => {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = q.trim();
    if (!term) { setResults([]); return; }
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

  return (
    <AppShell>
      <TopBar left={<div className="pl-3"><Logo size={20} /></div>} />

      <section className="px-4 pb-4 pt-4">
        <h1 className="t-h2 text-foreground">Explore</h1>
      </section>

      <div className="px-4">
        <label className="flex h-[48px] items-center gap-3 rounded-full bg-surface-2 px-4">
          <IconSearch size={18} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search people by name or handle"
            className="flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      {q.trim().length === 0 ? (
        <EmptyState
          pose="searching"
          title="Find your people"
          description="Search by name or handle."
        />
      ) : loading ? (
        <ul className="mt-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="h-12 w-12 rounded-full bg-surface-2 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-32 rounded bg-surface-2 animate-pulse" />
                <div className="h-3 w-20 rounded bg-surface-2 animate-pulse" />
              </div>
            </li>
          ))}
        </ul>
      ) : results.length === 0 ? (
        <EmptyState
          pose="thinking"
          title={`No results for "${q}"`}
          description="Try a different name or handle."
        />
      ) : (
        <ul className="mt-2">
          {results.map((p) => (
            <li key={p.id} className="hairline-b">
              <Link
                to={p.username ? `/u/${p.username}` : "#"}
                className="tap flex items-center gap-3 px-4 py-3 hover:bg-surface/40"
              >
                <Avatar name={p.display_name || p.username || "User"} src={p.avatar_url ?? undefined} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-foreground">
                    {p.display_name || p.username || "User"}
                  </p>
                  {p.username && <p className="truncate text-[13px] text-muted-foreground">@{p.username}</p>}
                  {p.bio && <p className="mt-0.5 truncate text-[13px] text-foreground/80">{p.bio}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
};

export default Explore;
