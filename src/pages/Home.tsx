import { AppShell } from "@/components/meku/AppShell";
import { ScreenHeader } from "@/components/meku/ScreenHeader";
import { FeedCard } from "@/components/meku/FeedCard";
import { feedItems } from "@/data/feed";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <AppShell>
      <ScreenHeader
        eyebrow="Friday, June 5"
        title={<span><span className="font-serif-display italic">Today</span> on Meku</span>}
        right={
          <Link
            to="/notifications"
            aria-label="Notifications"
            className="meku-tap relative inline-flex h-10 w-10 items-center justify-center rounded-full border hairline bg-surface"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.5} />
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
          </Link>
        }
      />

      <div className="px-5 pb-2">
        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 [&::-webkit-scrollbar]:hidden">
          {["For you", "Following", "Essays", "Photography", "Notes", "Studio"].map((t, i) => (
            <button
              key={t}
              className={
                "meku-tap whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs " +
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

      <section>
        {feedItems.map((item, i) => (
          <FeedCard key={item.id} item={item} variant={i % 2 === 0 ? "editorial" : "default"} />
        ))}
      </section>
    </AppShell>
  );
};

export default Home;
