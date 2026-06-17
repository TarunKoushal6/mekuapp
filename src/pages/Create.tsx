import { AppShell } from "@/components/meku/AppShell";
import { useNavigate } from "react-router-dom";
import { X, Image as ImageIcon, AtSign, Hash, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { TopBar, IconButton } from "@/components/meku/TopBar";
import { useAuth } from "@/hooks/useAuth";
import { createPost } from "@/lib/social";
import { MentionAutocomplete } from "@/components/meku/MentionAutocomplete";
import { toast } from "sonner";

const Create = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [caret, setCaret] = useState(0);
  const [busy, setBusy] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const canPublish = body.trim().length > 0;

  const publish = async () => {
    if (!user) { navigate("/auth"); return; }
    if (!canPublish || busy) return;
    setBusy(true);
    try {
      await createPost(user.id, body.trim(), title.trim());
      toast.success("Posted");
      navigate("/home");
    } catch (e: any) {
      toast.error(e.message ?? "Could not post");
    } finally {
      setBusy(false);
    }
  };

  const insertAt = () => {
    const el = bodyRef.current;
    if (!el) return;
    const pos = el.selectionStart ?? body.length;
    const needsSpace = pos > 0 && !/\s$/.test(body.slice(0, pos));
    const insertion = `${needsSpace ? " " : ""}@`;
    const next = body.slice(0, pos) + insertion + body.slice(pos);
    setBody(next);
    const newCaret = pos + insertion.length;
    setCaret(newCaret);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(newCaret, newCaret); });
  };

  return (
    <AppShell hideNav>
      <TopBar
        left={<IconButton ariaLabel="Close" onClick={() => navigate(-1)}><X className="h-[20px] w-[20px]" strokeWidth={1.4} /></IconButton>}
        title="New post"
        right={
          <button
            disabled={!canPublish || busy}
            onClick={publish}
            className="tap mr-2 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-[8px] text-[13px] font-bold text-primary-foreground disabled:opacity-30"
          >
            {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Publish
          </button>
        }
      />

      <div className="relative px-4 pt-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full bg-transparent text-[26px] font-bold leading-[1.15] tracking-[-0.02em] text-foreground outline-none placeholder:text-muted-foreground/50"
        />
        <div className="relative mt-3">
          <textarea
            ref={bodyRef}
            value={body}
            onChange={(e) => { setBody(e.target.value); setCaret(e.target.selectionStart ?? e.target.value.length); }}
            onKeyUp={(e) => setCaret((e.target as HTMLTextAreaElement).selectionStart ?? 0)}
            onClick={(e) => setCaret((e.target as HTMLTextAreaElement).selectionStart ?? 0)}
            rows={12}
            placeholder="What's on your mind? Type @ to mention someone."
            className="w-full resize-none bg-transparent text-[16px] leading-[1.55] text-foreground outline-none placeholder:text-muted-foreground/60"
          />
          <MentionAutocomplete
            value={body}
            onChange={setBody}
            caret={caret}
            setCaret={setCaret}
            inputRef={bodyRef}
          />
        </div>
      </div>


      <div className="fixed inset-x-0 bottom-0 z-30 hairline-t bg-background/90 backdrop-blur-xl" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}>
        <div className="mx-auto flex h-[56px] max-w-[440px] items-center gap-1 px-3 text-muted-foreground">
          <button className="tap inline-flex h-[40px] w-[40px] items-center justify-center rounded-full" aria-label="Insert image">
            <ImageIcon className="h-[18px] w-[18px]" strokeWidth={1.4} />
          </button>
          <button className="tap inline-flex h-[40px] w-[40px] items-center justify-center rounded-full" aria-label="Insert hashtag">
            <Hash className="h-[18px] w-[18px]" strokeWidth={1.4} />
          </button>
          <button onClick={insertAt} className="tap inline-flex h-[40px] w-[40px] items-center justify-center rounded-full" aria-label="Mention user">
            <AtSign className="h-[18px] w-[18px]" strokeWidth={1.4} />
          </button>
          <span className="ml-auto text-[12px] tabular-nums">{body.length}</span>
        </div>
      </div>
    </AppShell>
  );
};

export default Create;
