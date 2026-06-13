import { AppShell } from "@/components/meku/AppShell";
import { ChevronLeft, MoreHorizontal, UserPlus, BadgeCheck, Link2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Mascot } from "@/components/meku/Mascot";

const tabs = ["Posts", "Replies", "Media", "Likes", "Collections"] as const;
type Tab = (typeof tabs)[number];

const media = [
  "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1481253127861-534498168948?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1448630360428-65456885c650?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80",
];

const Profile = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("Posts");

  return (
    <AppShell>
      {/* Translucent top bar */}
      <header className="sticky top-0 z-30 flex h-[52px] items-center justify-between bg-background/70 px-3 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <ChevronLeft className="h-[22px] w-[22px]" strokeWidth={1.6} />
        </button>
        <button aria-label="More" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full">
          <MoreHorizontal className="h-[20px] w-[20px]" strokeWidth={1.6} />
        </button>
      </header>

      {/* Cover banner */}
      <div className="relative -mt-[52px]">
        <div className="h-[180px] w-full overflow-hidden bg-surface-2">
          <img
            src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=1400&q=80"
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
        {/* Avatar overlay — mascot ring */}
        <div className="absolute -bottom-10 left-4">
          <div className="flex h-[96px] w-[96px] items-center justify-center rounded-full border-[3px] border-background bg-surface overflow-hidden">
            <Mascot size={78} pose="waving" />
          </div>
        </div>
      </div>

      {/* Identity */}
      <section className="px-4 pb-4 pt-12">
        <div className="flex items-center gap-2">
          <h1 className="text-[24px] font-bold tracking-[-0.018em] text-foreground">Alex Builder</h1>
          <BadgeCheck className="h-[18px] w-[18px] fill-primary text-background" strokeWidth={2.2} />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <p className="t-caption text-muted-foreground">@alex_builder</p>
          <span className="rounded-full bg-primary/10 px-2 py-[2px] text-[11px] font-medium text-primary">
            Builder
          </span>
        </div>

        <p className="mt-4 text-[15px] leading-[1.5] text-foreground/85">
          Builder. Designer. Dreamer.<br />
          Shipping things onchain.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 t-caption text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-[6px] w-[6px] rounded-full bg-primary" />
            Onchain since '21
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Link2 className="h-[13px] w-[13px]" strokeWidth={1.6} />
            meku.xyz
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-[13px] w-[13px]" strokeWidth={1.6} />
            Joined Feb 2024
          </span>
        </div>

        {/* Stats */}
        <div className="mt-5 flex items-baseline gap-6">
          {[
            ["128", "Posts"],
            ["1.2K", "Followers"],
            ["320", "Following"],
          ].map(([n, l]) => (
            <div key={l}>
              <p className="text-[18px] font-bold tabular-nums text-foreground">{n}</p>
              <p className="t-caption text-muted-foreground">{l}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center gap-2">
          <button className="tap flex-1 rounded-full bg-foreground py-[10px] text-[14px] font-semibold text-background">
            Follow
          </button>
          <button className="tap flex-1 rounded-full border border-border bg-background py-[10px] text-[14px] font-semibold text-foreground">
            Message
          </button>
          <button
            aria-label="Add"
            className="tap inline-flex h-[40px] w-[40px] items-center justify-center rounded-full border border-border"
          >
            <UserPlus className="h-[16px] w-[16px]" strokeWidth={1.6} />
          </button>
        </div>
      </section>

      {/* Tabs */}
      <nav className="sticky top-[52px] z-20 hairline-b bg-background/90 backdrop-blur-xl">
        <ul className="flex gap-5 overflow-x-auto px-4">
          {tabs.map((t) => (
            <li key={t} className="shrink-0">
              <button
                onClick={() => setTab(t)}
                className={cn(
                  "tap relative py-3 text-[13px] font-medium",
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

      <section className="px-4 pt-3">
        {tab === "Media" ? (
          <div className="fade-in grid grid-cols-3 gap-[3px] pb-6">
            {media.map((src, i) => (
              <div key={i} className="aspect-square overflow-hidden bg-surface-2">
                <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <ul className="fade-in pb-6">
            {[
              { title: "Currently building a better way for onchain communities to collaborate.", time: "1d", img: media[0] },
              { title: "Building in public. Day 42 — shipping a new explorer.", time: "3d", img: media[2] },
              { title: "Design systems that scale with your product.", time: "1w" },
            ].map((p, i, arr) => (
              <li key={i}>
                <article className="py-4">
                  <p className="text-[15px] leading-[1.5] text-foreground">{p.title}</p>
                  {p.img && (
                    <div className="mt-3 overflow-hidden rounded-[12px] border border-border">
                      <img src={p.img} alt="" className="aspect-[5/3] w-full object-cover" loading="lazy" />
                    </div>
                  )}
                  <p className="mt-2 t-caption text-muted-foreground">{p.time}</p>
                </article>
                {i < arr.length - 1 && <div className="hairline-b" />}
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
};

export default Profile;
