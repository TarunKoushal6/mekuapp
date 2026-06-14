import { AppShell } from "@/components/meku/AppShell";
import { Avatar } from "@/components/meku/Avatar";
import { ChevronLeft, Phone, MoreHorizontal, Paperclip, Plus } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useState } from "react";

const Chat = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [draft, setDraft] = useState("");
  const messages: { id: string; me: boolean; text: string; time: string }[] = [];

  return (
    <AppShell hideNav>
      <header className="sticky top-0 z-30 flex h-[60px] items-center gap-2 bg-background/90 px-3 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={1.6} />
        </button>
        <Avatar name={id || "?"} size="sm" />
        <div className="flex-1">
          <p className="text-[14px] font-bold leading-tight text-foreground">{id}</p>
          <p className="text-[11px] text-muted-foreground">offline</p>
        </div>
        <button aria-label="Call" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <Phone className="h-[18px] w-[18px]" strokeWidth={1.6} />
        </button>
        <button aria-label="More" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <MoreHorizontal className="h-[18px] w-[18px]" strokeWidth={1.6} />
        </button>
      </header>

      <section className="flex min-h-[calc(100vh-160px)] flex-col gap-3 px-4 py-6">
        {messages.length === 0 && (
          <p className="m-auto text-center text-[13px] text-muted-foreground">
            No messages yet — say hello.
          </p>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[440px] bg-background/95 px-3 pb-4 pt-2 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <Link
            to="/onchain"
            aria-label="Onchain"
            className="tap inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Plus className="h-[20px] w-[20px]" strokeWidth={2} />
          </Link>
          <div className="flex h-[44px] flex-1 items-center gap-2 rounded-full bg-surface-2 px-4">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Message..."
              className="flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button aria-label="Attach" className="tap text-muted-foreground">
              <Paperclip className="h-[18px] w-[18px]" strokeWidth={1.6} />
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default Chat;
