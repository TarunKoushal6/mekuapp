import { AppShell } from "@/components/meku/AppShell";
import { TopBar, IconButton } from "@/components/meku/TopBar";
import { Logo } from "@/components/meku/Logo";
import { FeedCard } from "@/components/meku/FeedCard";
import { Avatar } from "@/components/meku/Avatar";
import { EmptyState } from "@/components/meku/EmptyState";
import { feedItems } from "@/data/feed";
import { Bell, Search, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";

const tabs = ["For you", "Following"] as const;

// Real data only — empty until the user follows people.
const stories: { name: string }[] = [];

const Home = () => {
  const [tab, setTab] = useState<(typeof tabs)[number]>("For you");
  return (
    <AppShell>
      <TopBar
        left={
          <div className="pl-2">
            <Logo size={40} wordmark={false} appIcon />
          </div>
        }
        right={
          <>
            <IconButton ariaLabel="Search">
              <Search className="h-[22px] w-[22px]" strokeWidth={1.8} />
            </IconButton>
            <Link to="/notifications" aria-label="Notifications" className="relative">
              <IconButton ariaLabel="Notifications">
                <Bell className="h-[22px] w-[22px]" strokeWidth={1.8} />
              </IconButton>
            </Link>
          </>
        }
      />

      {/* Stories row */}
      <div className="px-4 pb-3 pt-1">
        <ul className="flex gap-3 overflow-x-auto pb-1">
          <li className="flex w-[68px] shrink-0 flex-col items-center gap-1.5">
            <Link
              to="/create"
              aria-label="New post"
              className="tap inline-flex h-[60px] w-[60px] items-center justify-center rounded-full border border-border bg-surface text-foreground"
            >
              <Plus className="h-[22px] w-[22px]" strokeWidth={1.8} />
            </Link>
            <span className="t-caption text-foreground">New post</span>
          </li>
          {stories.map((s) => (
            <li key={s.name} className="flex w-[68px] shrink-0 flex-col items-center gap-1.5">
              <div className="rounded-full p-[2px] ring-[1.5px] ring-primary">
                <Avatar name={s.name} size="lg" className="h-[56px] w-[56px] border-[2px] border-background" />
              </div>
              <span className="t-caption truncate text-foreground">{s.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Segmented control */}
      <div className="px-4 pb-2">
        <div className="inline-flex w-full items-center gap-1 rounded-full bg-surface-2 p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "tap flex-1 rounded-full px-3 py-[10px] text-[14px] font-bold",
                tab === t ? "bg-foreground text-background" : "text-muted-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <section>
        {feedItems.length === 0 ? (
          <EmptyState
            pose="sitting"
            title="Your feed is quiet"
            description="Follow people or share your first post to bring it to life."
            action={
              <Link
                to="/create"
                className="tap inline-flex h-[44px] items-center gap-2 rounded-full bg-foreground px-5 text-[14px] font-semibold text-background"
              >
                <Plus className="h-[16px] w-[16px]" strokeWidth={2} />
                New post
              </Link>
            }
          />
        ) : (
          feedItems.map((item) => <FeedCard key={item.id} item={item} />)
        )}
      </section>
    </AppShell>
  );
};

export default Home;
