import { AppShell } from "@/components/meku/AppShell";
import { TopBar, IconButton } from "@/components/meku/TopBar";
import { FeedCard } from "@/components/meku/FeedCard";
import { Logo } from "@/components/meku/Logo";
import { Avatar } from "@/components/meku/Avatar";
import { feedItems } from "@/data/feed";
import { Bell, Search, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = ["For you", "Following"] as const;

const stories = [
  { name: "0xalex" },
  { name: "hermes" },
  { name: "dara" },
  { name: "0xnik" },
  { name: "mira" },
  { name: "kai" },
];

const Home = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]>("For you");
  return (
    <AppShell>
      <TopBar
        left={
          <div className="pl-1">
            {/* Purple mark only — no wordmark */}
            <Logo size={30} wordmark={false} appIcon />
          </div>
        }
        right={
          <>
            <IconButton ariaLabel="Search">
              <Search className="h-[20px] w-[20px]" strokeWidth={1.8} />
            </IconButton>
            <Link to="/notifications" aria-label="Notifications" className="relative">
              <IconButton ariaLabel="Notifications">
                <Bell className="h-[20px] w-[20px]" strokeWidth={1.8} />
              </IconButton>
              <span className="pointer-events-none absolute right-[10px] top-[10px] h-[6px] w-[6px] rounded-full bg-primary" />
            </Link>
          </>
        }
      />

      {/* Stories row */}
      <div className="px-4 pb-3 pt-1">
        <ul className="flex gap-3 overflow-x-auto pb-1">
          <li className="flex w-[64px] shrink-0 flex-col items-center gap-1.5">
            <button
              aria-label="New post"
              className="tap inline-flex h-[60px] w-[60px] items-center justify-center rounded-full border border-border bg-surface text-foreground"
            >
              <Plus className="h-[20px] w-[20px]" strokeWidth={1.8} />
            </button>
            <span className="t-caption text-foreground">New post</span>
          </li>
          {stories.map((s) => (
            <li key={s.name} className="flex w-[64px] shrink-0 flex-col items-center gap-1.5">
              <div className="rounded-full p-[2px] ring-[1.5px] ring-primary">
                <Avatar name={s.name} size="lg" className="h-[56px] w-[56px] border-[2px] border-background" />
              </div>
              <span className="t-caption truncate text-foreground">{s.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Segmented control — two tabs, pill */}
      <div className="px-4 pb-2">
        <div className="inline-flex w-full items-center gap-1 rounded-full bg-surface-2 p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "tap flex-1 rounded-full px-3 py-[9px] text-[14px] font-semibold",
                tab === t ? "bg-foreground text-background" : "text-muted-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <section>
        {feedItems.map((item) => (
          <FeedCard key={item.id} item={item} />
        ))}
      </section>
    </AppShell>
  );
};

export default Home;
