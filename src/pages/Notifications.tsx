import { AppShell } from "@/components/meku/AppShell";
import { EmptyState } from "@/components/meku/EmptyState";
import { IconBack, IconSettings } from "@/components/meku/MekuIcon";
import { Logo } from "@/components/meku/Logo";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { fetchNotifications, markAllRead, type NotificationWithActor } from "@/lib/notifications";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/meku/Avatar";
import { Heart, MessageCircle, Repeat2, AtSign, Coins, UserPlus } from "lucide-react";
import { timeAgo } from "@/lib/social";

const ICON = {
  like: Heart,
  comment: MessageCircle,
  repost: Repeat2,
  mention: AtSign,
  tip: Coins,
  follow: UserPlus,
} as const;

const TINT: Record<string, string> = {
  like: "text-[#ff5b89]",
  repost: "text-emerald-500",
  comment: "text-primary",
  mention: "text-primary",
  tip: "text-amber-500",
  follow: "text-primary",
};

const TABS = ["All", "Mentions"] as const;
type Tab = (typeof TABS)[number];

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationWithActor[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("All");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const rows = await fetchNotifications(user.id);
    setItems(rows);
    setLoading(false);
    markAllRead(user.id)
      .then(() => setItems((current) => current.map((n) => n.read_at ? n : { ...n, read_at: new Date().toISOString() })))
      .catch(() => {});
  };

  useEffect(() => { load(); }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notif-page:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const filtered = useMemo(
    () => tab === "Mentions" ? items.filter((n) => n.kind === "mention") : items,
    [items, tab],
  );

  const openTarget = (n: NotificationWithActor) => {
    if (n.post_id) navigate(`/p/${n.post_id}`);
    else if (n.actor?.username) navigate(`/u/${n.actor.username}`);
  };

  return (
    <AppShell>
      <header className="sticky top-0 z-30 grid h-[52px] grid-cols-[1fr_auto_1fr] items-center bg-background/85 px-4 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground">
          <IconBack size={22} />
        </button>
        <div className="text-[17px] font-bold tracking-[-0.01em]">Notifications</div>
        <div className="flex items-center justify-end">
          <Link to="/settings" aria-label="Settings" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
            <IconSettings size={20} />
          </Link>
        </div>
      </header>

      <nav className="sticky top-[52px] z-20 bg-background/85 backdrop-blur-xl hairline-b">
        <div className="grid grid-cols-2">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "tap relative py-3.5 text-[14px] font-semibold",
                tab === t ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <span className="relative inline-block">
                {t}
                {tab === t && <span className="absolute -bottom-[13px] left-0 right-0 h-[3px] rounded-full bg-primary" />}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {loading ? (
        <EmptyState pose="searching" title="Loading notifications" description="Fetching the latest activity for you." />
      ) : filtered.length === 0 ? (
        <EmptyState pose="caughtup" title="You're all caught up" description="New replies, follows and mentions will appear here." />
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((n) => {
            const Icon = ICON[n.kind as keyof typeof ICON] ?? Heart;
            const tint = TINT[n.kind] ?? "text-foreground";
            const name = n.actor?.display_name || n.actor?.username || "Someone";
            const verb = n.kind === "like" ? "liked your post"
              : n.kind === "repost" ? "reposted your post"
              : n.kind === "comment" ? "replied to your post"
              : n.kind === "mention" ? "mentioned you"
              : n.kind === "tip" ? "tipped you"
              : n.kind === "follow" ? "followed you"
              : "interacted";
            return (
              <li key={n.id}>
                <button
                  onClick={() => openTarget(n)}
                  className="tap flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface/40"
                >
                  <div className={cn("mt-0.5 shrink-0", tint)}>
                    <Icon className="h-[26px] w-[26px]" strokeWidth={2} fill={n.kind === "like" ? "currentColor" : "none"} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Avatar name={name} src={n.actor?.avatar_url ?? undefined} size="xs" />
                    <p className="mt-2 text-[15px] leading-[1.35] text-foreground">
                      <span className="font-bold">{name}</span> {verb}
                    </p>
                  </div>
                  <span className="shrink-0 pt-0.5 text-[12.5px] text-muted-foreground tabular-nums">{timeAgo(n.created_at)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
};

export default Notifications;
