import { AppShell } from "@/components/meku/AppShell";
import { Avatar } from "@/components/meku/Avatar";
import { ChevronLeft, Phone, Video } from "lucide-react";

import { IconSend } from "@/components/meku/MekuIcon";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, type Profile } from "@/lib/social";
import { fetchThread, sendMessage, markThreadRead, type DirectMessage } from "@/lib/dm";
import { toast } from "sonner";

import { MessageBubble } from "@/components/meku/MessageBubble";
import { EmptyState } from "@/components/meku/EmptyState";
import { ChatSkeleton } from "@/components/meku/Skeletons";

const Chat = () => {
  const navigate = useNavigate();
  const { id: otherId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [other, setOther] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<DirectMessage[] | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (otherId) getProfile(otherId).then(setOther).catch(() => {});
  }, [otherId]);

  useEffect(() => {
    if (!user || !otherId) return;
    let cancelled = false;
    fetchThread(user.id, otherId)
      .then((m) => { if (!cancelled) setMessages(m); })
      .catch((e) => toast.error(e.message ?? "Could not load messages"));
    markThreadRead(user.id, otherId).catch(() => {});
    return () => { cancelled = true; };
  }, [user?.id, otherId]);

  // Realtime: append new messages for this pair
  useEffect(() => {
    if (!user || !otherId) return;
    const channel = supabase
      .channel(`dm:${[user.id, otherId].sort().join(":")}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const m = payload.new as DirectMessage;
          const pair =
            (m.sender_id === user.id && m.recipient_id === otherId) ||
            (m.sender_id === otherId && m.recipient_id === user.id);
          if (!pair) return;
          setMessages((prev) => (prev?.find((x) => x.id === m.id) ? prev : [...(prev ?? []), m]));
          if (m.recipient_id === user.id) markThreadRead(user.id, otherId).catch(() => {});
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.id, otherId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages?.length]);

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !otherId || !draft.trim() || sending) return;
    setSending(true);
    const body = draft;
    setDraft("");
    try {
      const m = await sendMessage(user.id, otherId, body);
      if (m) setMessages((prev) => (prev?.find((x) => x.id === m.id) ? prev : [...(prev ?? []), m]));
    } catch (err: any) {
      setDraft(body);
      toast.error(err.message ?? "Could not send");
    } finally {
      setSending(false);
    }
  };

  const name = other?.display_name || other?.username || "User";
  const handle = other?.username;

  return (
    <AppShell hideNav>
      <header className="sticky top-0 z-30 flex h-[56px] items-center gap-2 bg-background/90 px-2 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={1.75} />
        </button>
        <Link to={handle ? `/u/${handle}` : "#"} className="flex flex-1 items-center gap-2.5">
          <Avatar name={name} src={other?.avatar_url ?? undefined} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold leading-tight text-foreground">{name}</p>
            {handle && <p className="truncate text-[12px] text-muted-foreground">@{handle}</p>}
          </div>
        </Link>
        <button aria-label="Call" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full text-primary">
          <Phone className="h-[20px] w-[20px]" strokeWidth={1.9} />
        </button>
        <button aria-label="Video" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full text-primary">
          <Video className="h-[20px] w-[20px]" strokeWidth={1.9} />
        </button>
      </header>


      <div ref={scrollRef} className="flex-1 space-y-1.5 overflow-y-auto px-3 pb-[96px] pt-4">
        {messages === null ? (
          <ChatSkeleton count={8} />
        ) : messages.length === 0 ? (
          <EmptyState
            pose="waving"
            title={`Say hi to ${name}`}
            description="This is the start of your conversation."
          />
        ) : (
          messages.map((m, i) => {
            const mine = m.sender_id === user?.id;
            const prev = messages[i - 1];
            const next = messages[i + 1];
            const t = new Date(m.created_at).getTime();
            const gapFromPrev = prev ? (t - new Date(prev.created_at).getTime()) / 60000 : Infinity;
            const gapToNext = next ? (new Date(next.created_at).getTime() - t) / 60000 : Infinity;
            const startsGroup = !prev || prev.sender_id !== m.sender_id || gapFromPrev > 5;
            const endsGroup = !next || next.sender_id !== m.sender_id || gapToNext > 5;
            const pos: "single" | "first" | "middle" | "last" =
              startsGroup && endsGroup ? "single" : startsGroup ? "first" : endsGroup ? "last" : "middle";
            const showTime = !prev || gapFromPrev > 30
              ? new Date(m.created_at).toLocaleString([], { hour: "numeric", minute: "2-digit", month: "short", day: "numeric" })
              : null;
            const onDelete = async () => {
              const { error } = await supabase.from("messages").delete().eq("id", m.id);
              if (error) return toast.error(error.message);
              setMessages((prev) => prev?.filter((x) => x.id !== m.id) ?? prev);
            };
            return (
              <MessageBubble
                key={m.id}
                body={m.body}
                mine={mine}
                pos={pos}
                showTime={showTime}
                onDelete={mine ? onDelete : undefined}
              />
            );
          })
        )}
      </div>



      <form
        onSubmit={onSend}
        className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[440px] bg-background/95 px-3 pb-4 pt-2 backdrop-blur-xl"
      >
        <div className="flex items-end gap-2">
          <div className="flex min-h-[44px] flex-1 items-center rounded-3xl border border-border bg-surface-2 px-4 py-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(e as any); } }}
              placeholder="Start a message"
              rows={1}
              className="max-h-[120px] w-full resize-none bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={!draft.trim() || sending}
            aria-label="Send"
            className="tap inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-40"
          >
            <IconSend size={18} />
          </button>
        </div>
      </form>
    </AppShell>
  );
};

export default Chat;
