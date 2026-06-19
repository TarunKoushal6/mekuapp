import { supabase } from "@/integrations/supabase/client";

export type NotificationKind = "like" | "repost" | "comment" | "mention" | "tip" | "follow";

export interface NotificationRow {
  id: string;
  user_id: string;
  actor_id: string | null;
  kind: NotificationKind;
  post_id: string | null;
  comment_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationWithActor extends NotificationRow {
  actor: { username: string | null; display_name: string | null; avatar_url: string | null } | null;
}

/** Insert one notification. Silently ignores self-actions and dup errors. */
export async function notifyOne(args: {
  userId: string;            // recipient
  actorId: string;           // who did it
  kind: NotificationKind;
  postId?: string | null;
  commentId?: string | null;
}) {
  if (!args.userId || !args.actorId || args.userId === args.actorId) return;
  try {
    await supabase.from("notifications").insert({
      user_id: args.userId,
      actor_id: args.actorId,
      kind: args.kind,
      post_id: args.postId ?? null,
      comment_id: args.commentId ?? null,
    });
  } catch {
    /* best-effort */
  }
}

/** Extract @handles from free text. Returns lowercased unique handles. */
export function extractMentions(text: string): string[] {
  const re = /@([A-Za-z0-9_]{1,32})/g;
  const out = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.add(m[1].toLowerCase());
  return [...out];
}

/** Resolve handles → user ids, then notify each as a mention. */
export async function notifyMentions(args: {
  actorId: string;
  text: string;
  postId?: string | null;
  commentId?: string | null;
}) {
  const handles = extractMentions(args.text);
  if (handles.length === 0) return;
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username")
    .in("username", handles);
  await Promise.all(
    (profiles ?? []).map((p: any) =>
      notifyOne({
        userId: p.id,
        actorId: args.actorId,
        kind: "mention",
        postId: args.postId,
        commentId: args.commentId,
      }),
    ),
  );
}

export async function fetchNotifications(userId: string, limit = 50): Promise<NotificationWithActor[]> {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  const rows = (data ?? []) as NotificationRow[];
  if (rows.length === 0) return [];
  const actorIds = Array.from(new Set(rows.map((r) => r.actor_id).filter(Boolean))) as string[];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", actorIds);
  const pm = new Map((profiles ?? []).map((p: any) => [p.id, p]));
  return rows.map((r) => ({ ...r, actor: r.actor_id ? pm.get(r.actor_id) ?? null : null }));
}

export async function markAllRead(userId: string) {
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("read_at", null);
}

export async function unreadCount(userId: string): Promise<number> {
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);
  return count ?? 0;
}
