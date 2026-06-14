import { AppShell } from "@/components/meku/AppShell";
import { FeedCard } from "@/components/meku/FeedCard";
import { EmptyState } from "@/components/meku/EmptyState";
import { Bell, Plus, Loader2, ArrowUp, ArrowDown, ArrowLeftRight, Clock, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { fetchPosts, type Post } from "@/lib/social";
import { supabase } from "@/integrations/supabase/client";

const tabs = ["For You", "Following", "Arc Moments"] as const;
type Tab = (typeof tabs)[number];

const Home = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("For You");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);

  const load = useCallback(async () => {
    try { setPosts(await fetchPosts(user?.id)); } finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const ch = supabase.channel("home-posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  return (
    <AppShell>
      {/* Top header */}
      <header className="flex items-center justify-between px-5 pb-2 pt-4">
        <p className="text-foreground" style={{ fontWeight: 500, fontSize: 18, letterSpacing: "0.38em" }}>M E K U</p>
        <Link to="/notifications" aria-label="Notifications" className="tap relative inline-flex h-10 w-10 items-center justify-center rounded-full">
          <Bell className="h-[20px] w-[20px]" strokeWidth={1.7} />
          <span className="absolute right-2 top-2 h-[7px] w-[7px] rounded-full bg-primary" />
        </Link>
      </header>

      {/* Stories row */}
      <div className="px-5 pt-3">
        <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
          <StoryItem add label="Your Story" />
          {/* Empty until we have followers */}
        </div>
      </div>

      {/* Balance card */}
      <div className="px-5 pt-4">
        <div className="relative overflow-hidden rounded-[24px] p-5 gradient-card shadow-purple">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] text-white/70">My Balance</p>
              <p className="mt-1 text-white">
                <span style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em" }}>
                  {balanceVisible ? "0" : "••••"}
                </span>
                <span className="ml-2 text-[14px] font-semibold text-white/80">ARC</span>
              </p>
            </div>
            <button onClick={() => setBalanceVisible((v) => !v)} aria-label="Toggle balance" className="tap text-white/80">
              <Eye className="h-[18px] w-[18px]" strokeWidth={1.7} />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-2">
            <QuickAction to="/onchain" icon={ArrowUp} label="Send" />
            <QuickAction to="/onchain" icon={ArrowDown} label="Receive" />
            <QuickAction to="/onchain" icon={ArrowLeftRight} label="Swap" />
            <QuickAction to="/wallet" icon={Clock} label="History" />
          </div>

          {/* decorative wave */}
          <svg viewBox="0 0 400 200" className="pointer-events-none absolute -bottom-6 -right-10 h-[160px] w-[260px] opacity-30" aria-hidden>
            <path d="M0 120 Q 100 40 200 120 T 400 120" stroke="white" strokeWidth="1.2" fill="none" />
            <path d="M0 140 Q 100 60 200 140 T 400 140" stroke="white" strokeWidth="1" fill="none" opacity="0.6" />
          </svg>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-5 px-5">
        <div className="flex items-center gap-6 hairline-b">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn("tap relative py-3 text-[14px] font-semibold", tab === t ? "text-foreground" : "text-muted-foreground")}
            >
              {t}
              {tab === t && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </div>

      <section className="pb-6">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : posts.length === 0 ? (
          <EmptyState
            pose="sitting"
            title="Your feed is quiet"
            description="Share your first post to bring it to life."
            action={
              <Link to="/create" className="tap inline-flex h-[44px] items-center gap-2 rounded-full gradient-purple px-5 text-[14px] font-semibold text-primary-foreground">
                <Plus className="h-[16px] w-[16px]" strokeWidth={2.2} />
                New post
              </Link>
            }
          />
        ) : (
          posts.map((p) => <FeedCard key={p.id} post={p} onChanged={load} />)
        )}
      </section>
    </AppShell>
  );
};

const StoryItem = ({ add, label }: { add?: boolean; label: string }) => (
  <div className="flex w-[68px] shrink-0 flex-col items-center gap-1.5">
    <button className={cn("tap relative h-[60px] w-[60px] rounded-full p-[2px]", add ? "bg-border" : "gradient-purple")}>
      <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-2">
        {add && <Plus className="h-[20px] w-[20px] text-foreground" strokeWidth={2} />}
      </div>
    </button>
    <span className="truncate text-[11px] text-muted-foreground">{label}</span>
  </div>
);

const QuickAction = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <Link to={to} className="tap flex flex-col items-center gap-1.5 text-white">
    <span className="inline-flex h-[44px] w-[44px] items-center justify-center rounded-full bg-white/15 backdrop-blur">
      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
    </span>
    <span className="text-[11px] font-medium">{label}</span>
  </Link>
);

export default Home;
