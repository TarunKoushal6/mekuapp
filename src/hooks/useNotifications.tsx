import { useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { NotificationRow } from "@/lib/notifications";

const KIND_TEXT: Record<string, (actor: string) => string> = {
  like: (a) => `${a} liked your post`,
  repost: (a) => `${a} reposted your post`,
  comment: (a) => `${a} replied to your post`,
  mention: (a) => `${a} mentioned you`,
  tip: (a) => `${a} tipped you`,
  follow: (a) => `${a} followed you`,
};

/**
 * Global realtime listener. Mount once near the app root.
 * Shows a toast whenever a new notification row arrives for the signed-in user.
 */
export const NotificationsListener = () => {
  const { user } = useAuth();
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    seen.current = new Set();

    const channel = supabase
      .channel(`notif:${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        async (payload) => {
          const row = payload.new as NotificationRow;
          if (seen.current.has(row.id)) return;
          seen.current.add(row.id);

          let actorName = "Someone";
          if (row.actor_id) {
            const { data } = await supabase
              .from("profiles")
              .select("display_name, username")
              .eq("id", row.actor_id)
              .maybeSingle();
            actorName = data?.display_name || data?.username || "Someone";
          }
          const msg = (KIND_TEXT[row.kind] ?? ((a: string) => `${a} interacted with your post`))(actorName);
          toast(msg, {
            action: row.post_id
              ? { label: "Open", onClick: () => (window.location.href = `/p/${row.post_id}`) }
              : undefined,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return null;
};
