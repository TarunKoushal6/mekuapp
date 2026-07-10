import { AppShell } from "@/components/meku/AppShell";
import { EmptyState } from "@/components/meku/EmptyState";
import { IconCompose, IconSearch, IconSettings } from "@/components/meku/MekuIcon";
import { Avatar } from "@/components/meku/Avatar";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getProfile, type Profile } from "@/lib/social";

const Inbox = () => {
  const { user } = useAuth();
  const [me, setMe] = useState<Profile | null>(null);
  const threads: { id: string; name: string; preview: string; time: string; unread?: boolean }[] = [];

  useEffect(() => {
    if (!user) return;
    getProfile(user.id).then(setMe).catch(() => {});
  }, [user?.id]);

  return (
    <AppShell>
      <header className="sticky top-0 z-30 grid h-[52px] grid-cols-[1fr_auto_1fr] items-center bg-background/85 px-4 backdrop-blur-xl">
        <button aria-label="Open menu" className="tap inline-flex items-center justify-self-start rounded-full">
          <Avatar name={me?.display_name || "You"} src={me?.avatar_url ?? undefined} size="sm" />
        </button>
        <div className="text-[17px] font-bold tracking-[-0.01em]">Messages</div>
        <Link to="/settings" aria-label="Settings" className="tap inline-flex h-10 w-10 items-center justify-center justify-self-end rounded-full">
          <IconSettings size={20} />
        </Link>
      </header>

      <section className="px-4 pb-3 pt-3">
        <label className="flex h-11 items-center gap-2.5 rounded-full border border-border bg-surface/60 px-4">
          <IconSearch size={18} className="text-muted-foreground" />
          <input
            type="search"
            placeholder="Search Direct Messages"
            className="w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </label>
      </section>

      {threads.length === 0 ? (
        <EmptyState
          pose="caughtup"
          title="No messages yet"
          description="Start a conversation with someone you follow."
          action={
            <Link
              to="/explore"
              className="tap inline-flex h-[44px] items-center rounded-full bg-primary px-5 text-[14px] font-bold text-primary-foreground"
            >
              Find people
            </Link>
          }
        />
      ) : (
        <ul>
          {threads.map((t) => (
            <li key={t.id} className="hairline-b">
              <Link
                to={`/inbox/${t.id}`}
                className="tap flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface/40"
              >
                <Avatar name={t.name} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[15px] font-bold text-foreground">{t.name}</span>
                    <span className="shrink-0 text-[12.5px] text-muted-foreground tabular-nums">{t.time}</span>
                  </div>
                  <p className="mt-0.5 truncate text-[14px] text-muted-foreground">{t.preview}</p>
                </div>
                {t.unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        to="/inbox/new"
        aria-label="New message"
        className="fixed bottom-[104px] right-4 z-30 inline-flex h-14 w-14 items-center justify-center rounded-full gradient-purple text-primary-foreground shadow-purple"
      >
        <IconCompose size={22} />
      </Link>
    </AppShell>
  );
};

export default Inbox;
