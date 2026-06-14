import { AppShell } from "@/components/meku/AppShell";
import { useNavigate } from "react-router-dom";
import { X, Image as ImageIcon, AtSign, Hash, Loader2 } from "lucide-react";
import { useState } from "react";
import { TopBar, IconButton } from "@/components/meku/TopBar";
import { useAuth } from "@/hooks/useAuth";
import { createPost } from "@/lib/social";
import { toast } from "sonner";

const Create = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

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

      <div className="px-4 pt-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full bg-transparent text-[26px] font-bold leading-[1.15] tracking-[-0.02em] text-foreground outline-none placeholder:text-muted-foreground/50"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={12}
          placeholder="What's on your mind?"
          className="mt-3 w-full resize-none bg-transparent text-[16px] leading-[1.55] text-foreground outline-none placeholder:text-muted-foreground/60"
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 hairline-t bg-background/90 backdrop-blur-xl" style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}>
        <div className="mx-auto flex h-[56px] max-w-[440px] items-center gap-1 px-3 text-muted-foreground">
          {[ImageIcon, Hash, AtSign].map((Icon, i) => (
            <button key={i} className="tap inline-flex h-[40px] w-[40px] items-center justify-center rounded-full" aria-label="Insert">
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.4} />
            </button>
          ))}
          <span className="ml-auto text-[12px] tabular-nums">{body.length}</span>
        </div>
      </div>
    </AppShell>
  );
};

export default Create;
