import { AppShell } from "@/components/meku/AppShell";
import { TopBar, IconButton } from "@/components/meku/TopBar";
import { Avatar } from "@/components/meku/Avatar";
import { Logo } from "@/components/meku/Logo";
import { SquarePen } from "lucide-react";

const threads = [
  { name: "Mira Okafor", preview: "Loved your last note — would you ever publish a longer version?", time: "8m", unread: true },
  { name: "Sōta Lin", preview: "Sending over the sketches tonight. Tell me what feels off.", time: "1h", unread: true },
  { name: "Aïcha Devereaux", preview: "Coffee Thursday? I'm in the neighborhood until late.", time: "Yesterday" },
  { name: "Idris Vahn", preview: "Thanks again for the feedback on the chair piece.", time: "Mon" },
  { name: "Lina Park", preview: "Bookmarked. Will read on the train tomorrow morning.", time: "Sun" },
];

const Inbox = () => {
  return (
    <AppShell>
      <TopBar
        left={<div className="pl-3"><Logo size={22} /></div>}
        right={
          <IconButton ariaLabel="New message">
            <SquarePen className="h-[20px] w-[20px]" strokeWidth={1.4} />
          </IconButton>
        }
      />

      <section className="px-3 pb-5 pt-6">
        <p className="t-eyebrow text-muted-foreground">Messages</p>
        <h1 className="mt-3 font-serif text-[44px] leading-[1.02] tracking-[-0.025em] text-foreground">
          Inbox
        </h1>
      </section>

      <ul className="px-3">
        {threads.map((t, i) => (
          <li key={t.name}>
            <button className="tap flex w-full items-start gap-3 py-4 text-left">
              <div className="relative">
                <Avatar name={t.name} size="lg" />
                {t.unread && (
                  <span className="absolute -right-0.5 -top-0.5 h-[10px] w-[10px] rounded-full border-2 border-background bg-primary" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate t-body font-medium text-foreground">{t.name}</p>
                  <span className="shrink-0 t-caption text-muted-foreground">{t.time}</span>
                </div>
                <p className="mt-1 line-clamp-2 t-caption text-muted-foreground">{t.preview}</p>
              </div>
            </button>
            {i < threads.length - 1 && <div className="ml-[68px] hairline-b" />}
          </li>
        ))}
      </ul>
    </AppShell>
  );
};

export default Inbox;
