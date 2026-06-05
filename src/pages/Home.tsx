import { AppShell } from "@/components/meku/AppShell";
import { TopBar, IconButton } from "@/components/meku/TopBar";
import { FeedCard } from "@/components/meku/FeedCard";
import { Logo } from "@/components/meku/Logo";
import { feedItems } from "@/data/feed";
import { Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";

const filters = ["For you", "Following", "Essays", "Photography", "Notes"];

const Home = () => {
  return (
    <AppShell>
      <TopBar
        left={
          <div className="pl-3">
            <Logo size={22} />
          </div>
        }
        right={
          <>
            <IconButton ariaLabel="Search">
              <Search className="h-[20px] w-[20px]" strokeWidth={1.4} />
            </IconButton>
            <Link to="/notifications" aria-label="Notifications" className="relative">
              <IconButton ariaLabel="Notifications">
                <Bell className="h-[20px] w-[20px]" strokeWidth={1.4} />
              </IconButton>
              <span className="pointer-events-none absolute right-[10px] top-[10px] h-[6px] w-[6px] rounded-full bg-primary" />
            </Link>
          </>
        }
      />

      {/* Editorial header — the room before the content */}
      <section className="px-3 pb-3 pt-6">
        <p className="t-eyebrow text-muted-foreground">Friday, June 5</p>
        <h1 className="mt-3 font-serif text-[44px] leading-[1.02] tracking-[-0.025em] text-foreground">
          Today, <span className="font-serif-italic">quietly.</span>
        </h1>
      </section>

      {/* Filters — single hairline row, no pills overdose */}
      <div className="hairline-b px-3">
        <div className="-mx-3 flex gap-5 overflow-x-auto px-3 pb-3 pt-1">
          {filters.map((f, i) => (
            <button
              key={f}
              className={
                "tap shrink-0 t-caption " +
                (i === 0
                  ? "text-foreground"
                  : "text-muted-foreground")
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <section>
        {feedItems.map((item, i) => (
          <FeedCard key={item.id} item={item} variant={item.title && i % 2 === 0 ? "editorial" : "default"} />
        ))}
      </section>
    </AppShell>
  );
};

export default Home;
