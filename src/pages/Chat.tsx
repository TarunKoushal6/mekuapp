import { AppShell } from "@/components/meku/AppShell";
import { Avatar } from "@/components/meku/Avatar";
import { ChevronLeft, MoreHorizontal } from "lucide-react";
import { IconSend } from "@/components/meku/MekuIcon";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { getProfile, type Profile } from "@/lib/social";
import { fetchThread, sendMessage, markThreadRead, type DirectMessage } from "@/lib/dm";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
        <button aria-label="More" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <MoreHorizontal className="h-[20px] w-[20px]" />
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-1.5 overflow-y-auto px-3 pb-[96px] pt-4">
        {messages === null ? (
          <div className="animate-fade-in space-y-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={cn("flex", i % 2 ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "h-8 animate-pulse rounded-2xl bg-surface-2",
                    i % 2 ? "w-40" : "w-52",
                  )}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="mt-16 flex flex-col items-center px-8 text-center">
            <Avatar name={name} src={other?.avatar_url ?? undefined} size="xl" />
            <p className="mt-4 text-[17px] font-bold text-foreground">{name}</p>
            {handle && <p className="text-[13px] text-muted-foreground">@{handle}</p>}
            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
              This is the start of your conversation. Say hi 👋
            </p>
          </div>
        ) : (
          messages.map((m, i) => {
            const mine = m.sender_id === user?.id;
            const prev = messages[i - 1];
            const grouped = prev && prev.sender_id === m.sender_id;
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[78%] whitespace-pre-wrap break-words px-3.5 py-2 text-[15px] leading-[1.35]",
                    mine ? "bg-primary text-primary-foreground" : "bg-surface-2 text-foreground",
                    mine
                      ? grouped ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-br-md"
                      : grouped ? "rounded-2xl rounded-bl-md" : "rounded-2xl rounded-bl-md",
                  )}
                >
                  {m.body}
                </div>
              </div>
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
