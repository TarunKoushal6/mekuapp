import { AppShell } from "@/components/meku/AppShell";
import { TopBar, IconButton } from "@/components/meku/TopBar";
import { EmptyState } from "@/components/meku/EmptyState";
import { IconBack, IconBell } from "@/components/meku/MekuIcon";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { fetchNotifications, markAllRead, type NotificationWithActor } from "@/lib/notifications";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/meku/Avatar";
import { Heart, MessageCircle, Repeat2, AtSign, Coins, UserPlus, Loader2 } from "lucide-react";
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

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<NotificationWithActor[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const rows = await fetchNotifications(user.id);
    setItems(rows);
    setLoading(false);
    markAllRead(user.id).catch(() => {});
  };

  useEffect(() => { load(); }, [user?.id]);

  // Realtime — append new rows as they arrive.
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

  const openTarget = (n: NotificationWithActor) => {
    if (n.post_id) navigate(`/p/${n.post_id}`);
    else if (n.actor?.username) navigate(`/u/${n.actor.username}`);
  };

  return (
    <AppShell>
      <TopBar
        left={<IconButton ariaLabel="Back" onClick={() => navigate(-1)}><IconBack size={22} /></IconButton>}
        title={<span className="text-[15px] font-bold">Notifications</span>}
        right={<IconButton ariaLabel="Notifications"><IconBell size={20} /></IconButton>}
      />

      <section className="px-4 pb-2 pt-4">
        <h1 className="t-h2 text-foreground">Activity</h1>
      </section>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState pose="caughtup" title="You're all caught up" description="New replies, follows and mentions will appear here." />
      ) : (
        <ul className="divide-y divide-border px-2">
          {items.map((n) => {
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
                  className="tap flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-surface/40"
                >
                  <div className="relative">
                    <Avatar name={name} src={n.actor?.avatar_url ?? undefined} size="md" />
                    <span className={`absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-background ${tint}`}>
                      <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] text-foreground"><span className="font-semibold">{name}</span> {verb}</p>
                    <p className="text-[12px] text-muted-foreground">{timeAgo(n.created_at)}</p>
                  </div>
                  {!n.read_at && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
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
