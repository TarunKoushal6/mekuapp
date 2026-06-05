import { AppShell } from "@/components/meku/AppShell";
import { ScreenHeader } from "@/components/meku/ScreenHeader";
import { Avatar } from "@/components/meku/Avatar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const groups = [
  {
    label: "Today",
    items: [
      { name: "Mira Okafor", action: "liked your essay", target: "On making small things, slowly.", time: "8m" },
      { name: "Sōta Lin", action: "started following you", time: "1h" },
      { name: "Aïcha Devereaux", action: "replied to your note", target: "Three small practices.", time: "3h" },
    ],
  },
  {
    label: "This week",
    items: [
      { name: "Idris Vahn", action: "saved your post", target: "A field guide to noticing.", time: "Tue" },
      { name: "Lina Park", action: "mentioned you in a note", time: "Mon" },
    ],
  },
];

const Notifications = () => {
  const navigate = useNavigate();
  return (
    <AppShell>
      <header className="flex items-center gap-3 px-5 pt-6">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="meku-tap inline-flex h-10 w-10 items-center justify-center rounded-full border hairline bg-surface"
        >
          <ArrowLeft className="h-[18px] w-[18px]" strokeWidth={1.5} />
        </button>
      </header>
      <ScreenHeader
        title={<span className="font-serif-display italic">Notifications</span>}
        subtitle="A gentle digest of what's new."
        className="pt-4"
      />

      {groups.map((g) => (
        <section key={g.label} className="mt-2">
          <h2 className="px-5 pb-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {g.label}
          </h2>
          <ul className="divide-y hairline border-y hairline">
            {g.items.map((it, i) => (
              <li key={i} className="flex items-start gap-3 px-5 py-4">
                <Avatar name={it.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">{it.name}</span>{" "}
                    <span className="text-muted-foreground">{it.action}</span>
                    {it.target && (
                      <>
                        {" "}
                        <span className="font-serif-display italic">{it.target}</span>
                      </>
                    )}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                    {it.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </AppShell>
  );
};

export default Notifications;
