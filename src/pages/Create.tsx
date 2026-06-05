import { AppShell } from "@/components/meku/AppShell";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, Hash, AtSign, Globe } from "lucide-react";
import { useState } from "react";

const Create = () => {
  const navigate = useNavigate();
  const [body, setBody] = useState("");
  const [title, setTitle] = useState("");

  return (
    <AppShell>
      <header className="flex items-center justify-between px-5 pt-6 pb-4">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="meku-tap inline-flex h-10 w-10 items-center justify-center rounded-full border hairline bg-surface"
        >
          <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </button>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">New post</p>
        <button
          disabled={!body && !title}
          className="meku-tap rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background disabled:opacity-40"
        >
          Publish
        </button>
      </header>

      <div className="px-5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A title, if you'd like one"
          className="w-full bg-transparent font-serif-display text-3xl leading-tight tracking-tightish text-foreground outline-none placeholder:text-muted-foreground/60"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          placeholder="Write something worth keeping…"
          className="mt-4 w-full resize-none bg-transparent text-[16px] leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/70"
        />
      </div>

      <div className="mt-6 border-t hairline px-5 py-4">
        <div className="flex items-center gap-1 text-muted-foreground">
          {[ImageIcon, Hash, AtSign, Globe].map((Icon, i) => (
            <button
              key={i}
              className="meku-tap inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary"
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </button>
          ))}
          <span className="ml-auto text-xs text-muted-foreground">
            {body.length} chars
          </span>
        </div>
      </div>

      <div className="px-5 pt-6">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Visibility</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {["Public", "Friends", "Private"].map((v, i) => (
            <button
              key={v}
              className={
                "meku-tap rounded-xl border px-3 py-3 text-xs " +
                (i === 0
                  ? "border-foreground bg-foreground text-background"
                  : "hairline bg-surface text-foreground")
              }
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  );
};

export default Create;
