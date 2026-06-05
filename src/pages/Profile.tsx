import { AppShell } from "@/components/meku/AppShell";
import { Avatar } from "@/components/meku/Avatar";
import { Settings, Share, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/meku/EmptyState";
import { TopBar, IconButton } from "@/components/meku/TopBar";
import { cn } from "@/lib/utils";

const tabs = ["About", "Posts", "Media", "Saved", "Collections"] as const;
type Tab = (typeof tabs)[number];

const posts = [
  { title: "On making small things, slowly.", meta: "Essay · 6 min", time: "Today" },
  { title: "A field guide to noticing.", meta: "Journal · 4 min", time: "Mar 12" },
  { title: "What I learned from rearranging a studio.", meta: "Notes · 2 min", time: "Feb 28" },
  { title: "Letters to a younger designer.", meta: "Essay · 9 min", time: "Feb 14" },
];

const collections = [
  { title: "Slow Mornings", count: 24 },
  { title: "Studio Notes", count: 18 },
  { title: "Long Reads", count: 36 },
];

const Profile = () => {
  const [tab, setTab] = useState<Tab>("About");

  return (
    <AppShell>
      <TopBar
        right={
          <>
            <IconButton ariaLabel="Share">
              <Share className="h-[20px] w-[20px]" strokeWidth={1.4} />
            </IconButton>
            <IconButton ariaLabel="Settings">
              <Settings className="h-[20px] w-[20px]" strokeWidth={1.4} />
            </IconButton>
          </>
        }
      />

      {/* Portfolio identity — generous, calm */}
      <section className="px-3 pb-6 pt-2">
        <Avatar name="Noor Ellis" size="xl" />
        <h1 className="mt-6 font-serif text-[44px] leading-[1.02] tracking-[-0.025em] text-foreground">
          Noor Ellis
        </h1>
        <p className="mt-2 t-caption text-muted-foreground">noor · Brooklyn, NY</p>

        <p className="mt-5 max-w-prose t-lg text-foreground/85">
          Writing quietly about design, attention, and the small habits that shape a working life. Currently editing a slow book.
        </p>

        <div className="mt-6 flex gap-2">
          <button className="tap flex-1 rounded-full bg-foreground py-[10px] t-caption font-medium text-background">
            Follow
          </button>
          <button className="tap flex-1 rounded-full border border-border bg-background py-[10px] t-caption font-medium text-foreground">
            Message
          </button>
        </div>
      </section>

      {/* Tabs — quiet, single hairline */}
      <nav className="sticky top-[56px] z-20 hairline-b bg-background/85 backdrop-blur-xl">
        <ul className="-mx-3 flex gap-5 overflow-x-auto px-3">
          {tabs.map((t) => (
            <li key={t} className="shrink-0">
              <button
                onClick={() => setTab(t)}
                className={cn(
                  "tap relative py-3 t-caption",
                  tab === t ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {t}
                {tab === t && (
                  <span className="absolute inset-x-0 -bottom-px h-[1.5px] bg-foreground" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section className="px-3 pt-3">
        {tab === "About" && (
          <div className="fade-in py-4">
            <dl className="divide-y divide-border">
              {[
                ["Based in", "Brooklyn, NY"],
                ["Working on", "A slow book on attention"],
                ["Reading", "Pilgrim at Tinker Creek"],
                ["Available for", "Editing, slow correspondence"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between py-4">
                  <dt className="t-caption text-muted-foreground">{k}</dt>
                  <dd className="t-body text-foreground">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {tab === "Posts" && (
          <ul className="fade-in">
            {posts.map((p, i) => (
              <li key={p.title}>
                <button className="tap flex w-full items-baseline justify-between gap-4 py-4 text-left">
                  <div className="min-w-0">
                    <p className="font-serif text-[22px] leading-[1.15] tracking-[-0.015em] text-foreground">
                      {p.title}
                    </p>
                    <p className="mt-1 t-caption text-muted-foreground">{p.meta}</p>
                  </div>
                  <span className="shrink-0 t-caption text-muted-foreground">{p.time}</span>
                </button>
                {i < posts.length - 1 && <div className="hairline-b" />}
              </li>
            ))}
          </ul>
        )}

        {tab === "Media" && (
          <div className="fade-in grid grid-cols-3 gap-[2px] py-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square bg-surface-2" />
            ))}
          </div>
        )}

        {tab === "Saved" && (
          <EmptyState
            title="Nothing saved yet."
            description="Tap the bookmark icon on anything you'd like to keep."
          />
        )}

        {tab === "Collections" && (
          <ul className="fade-in">
            {collections.map((c, i) => (
              <li key={c.title}>
                <button className="tap flex w-full items-center justify-between py-4 text-left">
                  <div>
                    <p className="font-serif text-[22px] leading-[1.15] tracking-[-0.015em] text-foreground">
                      {c.title}
                    </p>
                    <p className="mt-1 t-caption text-muted-foreground">{c.count} pieces</p>
                  </div>
                  <ArrowUpRight className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.4} />
                </button>
                {i < collections.length - 1 && <div className="hairline-b" />}
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
};

export default Profile;
