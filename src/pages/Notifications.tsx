import { AppShell } from "@/components/meku/AppShell";
import { TopBar, IconButton } from "@/components/meku/TopBar";
import { Avatar } from "@/components/meku/Avatar";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const groups = [
  {
    label: "Today",
    items: [
      { name: "Mira Okafor", action: "replied to your essay", target: "On making small things, slowly.", time: "8m" },
      { name: "Sōta Lin", action: "saved your post", target: "A field guide to noticing.", time: "1h" },
    ],
  },
  {
    label: "This week",
    items: [
      { name: "Aïcha Devereaux", action: "started following you", target: "", time: "Mon" },
      { name: "Idris Vahn", action: "mentioned you in", target: "Studio Notes", time: "Sun" },
    ],
  },
];

const Notifications = () => {
  const navigate = useNavigate();
  return (
    <AppShell>
      <TopBar
        left={
          <IconButton ariaLabel="Back" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={1.4} />
          </IconButton>
        }
        title="Notifications"
      />

      <section className="px-3 pb-5 pt-6">
        <h1 className="font-serif text-[44px] leading-[1.02] tracking-[-0.025em] text-foreground">
          Activity
        </h1>
      </section>

      {groups.map((g) => (
        <section key={g.label} className="mb-6 px-3">
          <p className="t-eyebrow mb-2 text-muted-foreground">{g.label}</p>
          <ul>
            {g.items.map((n, i) => (
              <li key={i}>
                <div className="flex items-start gap-3 py-4">
                  <Avatar name={n.name} size="md" />
                  <div className="min-w-0 flex-1">
                    <p className="t-body text-foreground">
                      <span className="font-medium">{n.name}</span>{" "}
                      <span className="text-muted-foreground">{n.action}</span>
                      {n.target && <span className="font-serif-italic"> {n.target}</span>}
                    </p>
                    <p className="mt-1 t-caption text-muted-foreground">{n.time}</p>
                  </div>
                </div>
                {i < g.items.length - 1 && <div className="ml-[52px] hairline-b" />}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </AppShell>
  );
};

export default Notifications;
