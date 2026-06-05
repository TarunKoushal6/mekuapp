import { AppShell } from "@/components/meku/AppShell";
import { Avatar } from "@/components/meku/Avatar";
import { Settings, Share } from "lucide-react";
import { useState } from "react";
import { FeedCard } from "@/components/meku/FeedCard";
import { feedItems } from "@/data/feed";
import { EmptyState } from "@/components/meku/EmptyState";
import { cn } from "@/lib/utils";

const tabs = ["Posts", "Media", "Saved"] as const;
type Tab = (typeof tabs)[number];

const Profile = () => {
  const [tab, setTab] = useState<Tab>("Posts");

  return (
    <AppShell>
      <header className="flex items-center justify-between px-5 pt-6 pb-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Profile</p>
        <div className="flex items-center gap-2">
          {[Share, Settings].map((Icon, i) => (
            <button
              key={i}
              className="meku-tap inline-flex h-10 w-10 items-center justify-center rounded-full border hairline bg-surface"
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </button>
          ))}
        </div>
      </header>

      <section className="px-5 pt-6">
        <Avatar name="Noor Ellis" size="xl" />
        <h1 className="mt-5 font-serif-display text-[40px] leading-[1.05] tracking-tightish text-foreground">
          Noor Ellis
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">@noor · Brooklyn, NY</p>
        <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-foreground/85">
          Writing quietly about design, attention, and the small habits that shape a working life.
          Currently editing a slow book.
        </p>

        <div className="mt-6 flex items-center gap-6 text-sm">
          <div>
            <p className="font-semibold tracking-tight text-foreground">128</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <div className="h-8 w-px bg-hairline" />
          <div>
            <p className="font-semibold tracking-tight text-foreground">4,210</p>
            <p className="text-xs text-muted-foreground">Readers</p>
          </div>
          <div className="h-8 w-px bg-hairline" />
          <div>
            <p className="font-semibold tracking-tight text-foreground">312</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button className="meku-tap flex-1 rounded-full bg-foreground py-2.5 text-sm font-medium text-background">
            Follow
          </button>
          <button className="meku-tap flex-1 rounded-full border hairline bg-surface py-2.5 text-sm font-medium">
            Message
          </button>
        </div>
      </section>

      <nav className="mt-8 border-b hairline">
        <ul className="flex px-5">
          {tabs.map((t) => (
            <li key={t} className="flex-1">
              <button
                onClick={() => setTab(t)}
                className={cn(
                  "meku-tap relative w-full py-3 text-sm",
                  tab === t ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {t}
                {tab === t && (
                  <span className="absolute inset-x-0 -bottom-px mx-auto h-px w-8 bg-foreground" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section>
        {tab === "Posts" &&
          feedItems.slice(0, 3).map((item, i) => (
            <FeedCard key={item.id} item={item} variant={i === 0 ? "editorial" : "default"} />
          ))}
        {tab === "Media" && (
          <div className="grid grid-cols-3 gap-px bg-hairline">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square bg-surface-muted" />
            ))}
          </div>
        )}
        {tab === "Saved" && (
          <EmptyState
            title="Nothing saved yet."
            description="Tap the bookmark icon on anything you'd like to keep."
          />
        )}
      </section>
    </AppShell>
  );
};

export default Profile;
