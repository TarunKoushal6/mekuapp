import { AppShell } from "@/components/meku/AppShell";
import { FeedCard } from "@/components/meku/FeedCard";
import { EmptyState } from "@/components/meku/EmptyState";
import { Loader2 } from "lucide-react";
import { IconBell, IconPlus } from "@/components/meku/MekuIcon";
import { Logo } from "@/components/meku/Logo";
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
      <header className="flex items-center justify-between px-5 pb-2 pt-4">
        <Logo size={24} />
        <Link to="/notifications" aria-label="Notifications" className="tap relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground">
          <IconBell size={20} />
          <span className="absolute right-2 top-2 h-[7px] w-[7px] rounded-full bg-primary" />
        </Link>
      </header>

      {/* Stories row */}
      <div className="px-5 pt-3">
        <div className="flex gap-3 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
          <StoryItem add label="Your Story" />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-3 px-5">
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
                <IconPlus size={16} />
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
      <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-2 text-foreground">
        {add && <IconPlus size={20} />}
      </div>
    </button>
    <span className="truncate text-[11px] text-muted-foreground">{label}</span>
  </div>
);

export default Home;
