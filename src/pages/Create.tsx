import { AppShell } from "@/components/meku/AppShell";
import { useNavigate } from "react-router-dom";
import { X, Image as ImageIcon, AtSign, Hash } from "lucide-react";
import { useState } from "react";
import { TopBar, IconButton } from "@/components/meku/TopBar";

const Create = () => {
  const navigate = useNavigate();
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");

  const canPublish = body.trim().length > 0 || title.trim().length > 0;

  return (
    <AppShell hideNav>
      <TopBar
        left={
          <IconButton ariaLabel="Close" onClick={() => navigate(-1)}>
            <X className="h-[20px] w-[20px]" strokeWidth={1.4} />
          </IconButton>
        }
        title="New post"
        right={
          <button
            disabled={!canPublish}
            className="tap mr-2 rounded-full bg-foreground px-4 py-[8px] t-caption font-medium text-background disabled:opacity-30"
          >
            Publish
          </button>
        }
      />

      {/* Focus mode — title + body, nothing else competing */}
      <div className="px-3 pt-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full bg-transparent font-serif text-[36px] leading-[1.08] tracking-[-0.02em] text-foreground outline-none placeholder:text-muted-foreground/50"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={14}
          placeholder="Write something worth keeping…"
          className="mt-4 w-full resize-none bg-transparent t-lg text-foreground outline-none placeholder:text-muted-foreground/60"
        />
      </div>

      {/* Tool rail — pinned, hairline-bordered, almost invisible */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 hairline-t bg-background/85 backdrop-blur-xl"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
      >
        <div className="mx-auto flex h-[56px] max-w-[440px] items-center gap-1 px-3 text-muted-foreground">
          {[ImageIcon, Hash, AtSign].map((Icon, i) => (
            <button
              key={i}
              className="tap inline-flex h-[40px] w-[40px] items-center justify-center rounded-full"
              aria-label="Insert"
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.4} />
            </button>
          ))}
          <span className="ml-auto t-caption tabular-nums">{body.length}</span>
        </div>
      </div>
    </AppShell>
  );
};

export default Create;
