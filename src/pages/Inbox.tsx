import { AppShell } from "@/components/meku/AppShell";
import { ScreenHeader } from "@/components/meku/ScreenHeader";
import { Avatar } from "@/components/meku/Avatar";

const threads = [
  { name: "Mira Okafor", handle: "mira", preview: "Loved your last note — would you ever publish a longer version?", time: "8m", unread: true },
  { name: "Sōta Lin", handle: "sota", preview: "Sending over the sketches tonight. Tell me what feels off.", time: "1h", unread: true },
  { name: "Aïcha Devereaux", handle: "aicha", preview: "Coffee Thursday? I'm in the neighborhood until late.", time: "Yesterday" },
  { name: "Idris Vahn", handle: "idris", preview: "Thanks again for the feedback on the chair piece.", time: "Mon" },
  { name: "Lina Park", handle: "lina", preview: "Bookmarked. Will read on the train tomorrow morning.", time: "Sun" },
];

const Inbox = () => {
  return (
    <AppShell>
      <ScreenHeader
        title={<span className="font-serif-display italic">Inbox</span>}
        subtitle="Conversations, kept quiet."
      />

      <div className="px-5">
        <div className="flex gap-2">
          {["All", "Unread", "Requests"].map((t, i) => (
            <button
              key={t}
              className={
                "meku-tap rounded-full border px-3.5 py-1.5 text-xs " +
                (i === 0
                  ? "bg-foreground text-background border-foreground"
                  : "hairline bg-surface text-muted-foreground")
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-4 divide-y hairline">
        {threads.map((t) => (
          <li key={t.handle} className="meku-tap flex items-start gap-3 px-5 py-4">
            <Avatar name={t.name} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="truncate text-sm font-medium text-foreground">{t.name}</p>
                <span className="shrink-0 text-[11px] uppercase tracking-wider text-muted-foreground">
                  {t.time}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{t.preview}</p>
            </div>
            {t.unread && <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
          </li>
        ))}
      </ul>
    </AppShell>
  );
};

export default Inbox;
