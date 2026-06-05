import { AppShell } from "@/components/meku/AppShell";
import { TopBar, IconButton } from "@/components/meku/TopBar";
import { FeedCard } from "@/components/meku/FeedCard";
import { Logo } from "@/components/meku/Logo";
import { feedItems } from "@/data/feed";
import { Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = ["For you", "Following", "Popular"] as const;

const Home = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]>("For you");
  return (
    <AppShell>
      <TopBar
        left={
          <div className="pl-1">
            <Logo size={26} />
          </div>
        }
        right={
          <>
            <IconButton ariaLabel="Search">
              <Search className="h-[20px] w-[20px]" strokeWidth={1.6} />
            </IconButton>
            <Link to="/notifications" aria-label="Notifications" className="relative">
              <IconButton ariaLabel="Notifications">
                <Bell className="h-[20px] w-[20px]" strokeWidth={1.6} />
              </IconButton>
              <span className="pointer-events-none absolute right-[10px] top-[10px] h-[6px] w-[6px] rounded-full bg-primary" />
            </Link>
          </>
        }
      />

      {/* Segmented control — pill, dark active */}
      <div className="px-4 pb-3 pt-2">
        <div className="inline-flex w-full items-center gap-1 rounded-full border border-border bg-surface p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "tap flex-1 rounded-full px-3 py-[8px] text-[13px] font-medium",
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
