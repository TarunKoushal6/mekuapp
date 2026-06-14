import { AppShell } from "@/components/meku/AppShell";
import { ChevronLeft, MoreHorizontal, Settings, BadgeCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Mascot } from "@/components/meku/Mascot";
import { EmptyState } from "@/components/meku/EmptyState";

const tabs = ["Posts", "Replies", "Media", "Likes"] as const;
type Tab = (typeof tabs)[number];

const Profile = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Posts");

  // Real (zero) data until backend is wired.
  const stats = { posts: 0, followers: 0, following: 0 };
  const items: unknown[] = [];

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex h-[56px] items-center justify-between bg-background/80 px-3 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={1.6} />
        </button>
        <div className="flex items-center gap-1">
          <button aria-label="Settings" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
            <Settings className="h-[18px] w-[18px]" strokeWidth={1.6} />
          </button>
          <button aria-label="More" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
            <MoreHorizontal className="h-[20px] w-[20px]" strokeWidth={1.6} />
          </button>
        </div>
      </header>

      {/* Identity */}
      <section className="px-5 pb-5 pt-2">
        <div className="flex h-[96px] w-[96px] items-center justify-center rounded-full border border-border bg-surface-2 overflow-hidden">
          <Mascot size={84} pose="waving" />
        </div>

        <div className="mt-5 flex items-center gap-2">
          <h1 className="text-[26px] font-bold tracking-[-0.02em] text-foreground">Your name</h1>
          <BadgeCheck className="h-[18px] w-[18px] fill-primary text-background" strokeWidth={2.2} />
        </div>
        <p className="mt-1 text-[14px] text-muted-foreground">@yourhandle</p>

        <p className="mt-4 text-[15px] leading-[1.5] text-foreground/85">
          Add a bio to tell people what you're building.
        </p>

        {/* Stats — real zero values */}
        <div className="mt-5 flex items-baseline gap-7">
          {[
            [stats.posts, "Posts"],
            [stats.followers, "Followers"],
            [stats.following, "Following"],
          ].map(([n, l]) => (
            <div key={l as string}>
              <p className="text-[20px] font-bold tabular-nums text-foreground">{n}</p>
              <p className="t-caption text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-2">
          <button className="tap flex-1 rounded-full bg-foreground py-[11px] text-[14px] font-bold text-background">
            Edit profile
          </button>
          <button className="tap rounded-full border border-border bg-background px-4 py-[11px] text-[14px] font-bold text-foreground">
            Share
          </button>
        </div>
      </section>

      {/* Tabs */}
      <nav className="sticky top-[56px] z-20 hairline-b bg-background/90 backdrop-blur-xl">
        <ul className="flex gap-6 px-5">
          {tabs.map((t) => (
            <li key={t}>
              <button
                onClick={() => setTab(t)}
                className={cn(
                  "tap relative py-3 text-[14px] font-bold",
                  tab === t ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {t}
                {tab === t && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-foreground" />}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {items.length === 0 && (
        <EmptyState
          pose="sitting"
          title={`No ${tab.toLowerCase()} yet`}
          description="When you share something, it shows up here."
        />
      )}
    </AppShell>
  );
};

export default Profile;
