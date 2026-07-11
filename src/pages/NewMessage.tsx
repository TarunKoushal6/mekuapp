import { AppShell } from "@/components/meku/AppShell";
import { Avatar } from "@/components/meku/Avatar";
import { IconSearch } from "@/components/meku/MekuIcon";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { Profile } from "@/lib/social";

const NewMessage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const term = q.trim();
    if (!term) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      const like = `%${term}%`;
      let query = supabase
        .from("profiles")
        .select("*")
        .or(`username.ilike.${like},display_name.ilike.${like}`)
        .limit(30);
      if (user?.id) query = query.neq("id", user.id);
      const { data } = await query;
      setResults((data ?? []) as Profile[]);
      setLoading(false);
    }, 220);
    return () => clearTimeout(t);
  }, [q, user?.id]);

  return (
    <AppShell hideNav>
      <header className="sticky top-0 z-30 flex h-[56px] items-center gap-2 bg-background/90 px-2 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={1.75} />
        </button>
        <div className="text-[17px] font-bold">New message</div>
      </header>

      <div className="px-4 pb-3 pt-2">
        <label className="flex h-11 items-center gap-2.5 rounded-full border border-border bg-surface/60 px-4">
          <IconSearch size={18} className="text-muted-foreground" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search people"
            className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </label>
      </div>

      {loading ? (
        <ul>
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="h-12 w-12 rounded-full bg-surface-2 animate-pulse" />
              <div className="h-3.5 w-40 rounded bg-surface-2 animate-pulse" />
            </li>
          ))}
        </ul>
      ) : q.trim() && results.length === 0 ? (
        <p className="mt-10 px-6 text-center text-[14px] text-muted-foreground">
          No people found for "{q}".
        </p>
      ) : (
        <ul>
          {results.map((p) => (
            <li key={p.id} className="hairline-b">
              <button
                onClick={() => navigate(`/inbox/${p.id}`)}
                className="tap flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface/40"
              >
                <Avatar name={p.display_name || p.username || "User"} src={p.avatar_url ?? undefined} size="lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-bold text-foreground">
                    {p.display_name || p.username || "User"}
                  </p>
                  {p.username && <p className="truncate text-[13px] text-muted-foreground">@{p.username}</p>}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
};

export default NewMessage;
