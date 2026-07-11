import { supabase } from "@/integrations/supabase/client";

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

const table = () => (supabase as any).from("messages");

export async function fetchThread(me: string, other: string): Promise<DirectMessage[]> {
  const { data, error } = await table()
    .select("*")
    .or(
      `and(sender_id.eq.${me},recipient_id.eq.${other}),and(sender_id.eq.${other},recipient_id.eq.${me})`,
    )
    .order("created_at", { ascending: true })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as DirectMessage[];
}

export async function sendMessage(sender: string, recipient: string, body: string) {
  const trimmed = body.trim();
  if (!trimmed) return null;
  const { data, error } = await table()
    .insert({ sender_id: sender, recipient_id: recipient, body: trimmed })
    .select("*")
    .single();
  if (error) throw error;
  return data as DirectMessage;
}

export async function markThreadRead(me: string, other: string) {
  await table()
    .update({ read_at: new Date().toISOString() })
    .is("read_at", null)
    .eq("recipient_id", me)
    .eq("sender_id", other);
}

export interface DmThread {
  otherId: string;
  last: DirectMessage;
  unread: number;
}

export async function fetchThreads(me: string): Promise<DmThread[]> {
  const { data, error } = await table()
    .select("*")
    .or(`sender_id.eq.${me},recipient_id.eq.${me}`)
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  const rows = (data ?? []) as DirectMessage[];
  const map = new Map<string, DmThread>();
  for (const m of rows) {
    const other = m.sender_id === me ? m.recipient_id : m.sender_id;
    const existing = map.get(other);
    const isUnread = m.recipient_id === me && !m.read_at;
    if (!existing) {
      map.set(other, { otherId: other, last: m, unread: isUnread ? 1 : 0 });
    } else if (isUnread) {
      existing.unread += 1;
    }
  }
  return Array.from(map.values());
}
