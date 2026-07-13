import { AppShell } from "@/components/meku/AppShell";
import { EmptyState } from "@/components/meku/EmptyState";
import { InboxListSkeleton } from "@/components/meku/Skeletons";
import { IconCompose, IconSearch, IconSettings } from "@/components/meku/MekuIcon";
import { Avatar } from "@/components/meku/Avatar";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getProfile, timeAgo, type Profile } from "@/lib/social";
import { fetchThreads, type DmThread } from "@/lib/dm";
import { supabase } from "@/integrations/supabase/client";

interface ThreadRow extends DmThread {
  other: Profile | null;
}

const Inbox = () => {
  const { user } = useAuth();
  const [me, setMe] = useState<Profile | null>(null);
  const [threads, setThreads] = useState<ThreadRow[] | null>(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then(setMe).catch(() => {});
  }, [user?.id]);

  const load = async () => {
    if (!user) return;
    const list = await fetchThreads(user.id);
    const rows = await Promise.all(
      list.map(async (t) => ({ ...t, other: await getProfile(t.otherId).catch(() => null) })),
    );
    rows.sort((a, b) => (a.last.created_at < b.last.created_at ? 1 : -1));
    setThreads(rows);
  };

  useEffect(() => { load(); }, [user?.id]);

  // Realtime: refresh threads on any new/updated message involving me
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`inbox:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        (payload) => {
          const row = (payload.new ?? payload.old) as any;
          if (row?.sender_id === user.id || row?.recipient_id === user.id) load();
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const loading = threads === null;
  const filtered = !threads
    ? []
    : q
    ? threads.filter((t) => {
        const s = (t.other?.display_name || "") + " " + (t.other?.username || "") + " " + t.last.body;
        return s.toLowerCase().includes(q.toLowerCase());
      })
    : threads;

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex h-[52px] items-center justify-between bg-background/85 px-4 backdrop-blur-xl">
        <div className="text-[22px] font-bold tracking-[-0.02em]">Chat</div>
        <Link
          to="/inbox/new"
          aria-label="New message"
          className="tap inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <IconCompose size={18} />
        </Link>
      </header>

      <section className="px-4 pb-3 pt-2">
        <label className="flex h-11 items-center gap-2.5 rounded-full bg-surface-2 px-4">
          <IconSearch size={18} className="text-muted-foreground" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search conversations"
            className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </label>
      </section>

      {loading ? (
        <InboxListSkeleton count={7} />
      ) : filtered.length === 0 ? (
        <EmptyState
          pose="caughtup"
          title={q ? "No matches" : "Welcome to your inbox!"}
          description={
            q
              ? "Try a different name or handle."
              : "Drop a line, share posts and more with private conversations between you and others on Meku."
          }
          action={
            !q && (
              <Link
                to="/explore"
                className="tap inline-flex h-[44px] items-center rounded-full bg-primary px-5 text-[14px] font-bold text-primary-foreground"
              >
                Write a message
              </Link>
            )
          }
        />
      ) : (
        <ul>
          {filtered.map((t) => {
            const name = t.other?.display_name || t.other?.username || "User";
            const isMine = t.last.sender_id === me?.id;
            return (
              <li key={t.otherId}>
                <Link
                  to={`/inbox/${t.otherId}`}
                  className="tap flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface/40"
                >
                  <Avatar name={name} src={t.other?.avatar_url ?? undefined} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[15px] font-semibold text-foreground">{name}</span>
                      <span className="shrink-0 text-[12.5px] text-muted-foreground tabular-nums">{timeAgo(t.last.created_at)}</span>
                    </div>
                    <p className={`mt-0.5 truncate text-[13.5px] ${t.unread > 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                      {isMine ? "You: " : ""}{t.last.body}
                    </p>
                  </div>
                  {t.unread > 0 && (
                    <span className="ml-1 inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground tabular-nums">
                      {t.unread > 99 ? "99+" : t.unread}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}

    </AppShell>
  );
};

export default Inbox;
