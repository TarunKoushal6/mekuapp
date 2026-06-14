import { AppShell } from "@/components/meku/AppShell";
import { TopBar, IconButton } from "@/components/meku/TopBar";
import { Logo } from "@/components/meku/Logo";
import { FeedCard } from "@/components/meku/FeedCard";
import { EmptyState } from "@/components/meku/EmptyState";
import { Bell, Search, Plus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { fetchPosts, type Post } from "@/lib/social";
import { supabase } from "@/integrations/supabase/client";

const tabs = ["For you", "Following"] as const;

const Home = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<(typeof tabs)[number]>("For you");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await fetchPosts(user?.id);
      setPosts(data);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const ch = supabase
      .channel("home-posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  return (
    <AppShell>
      <TopBar
        left={<div className="pl-2"><Logo size={40} wordmark={false} appIcon /></div>}
        right={
          <>
            <IconButton ariaLabel="Search"><Search className="h-[22px] w-[22px]" strokeWidth={1.8} /></IconButton>
            <Link to="/notifications" aria-label="Notifications">
              <IconButton ariaLabel="Notifications"><Bell className="h-[22px] w-[22px]" strokeWidth={1.8} /></IconButton>
            </Link>
          </>
        }
      />

      <div className="px-4 pb-2 pt-2">
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
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : posts.length === 0 ? (
          <EmptyState
            pose="sitting"
            title="Your feed is quiet"
            description="Share your first post to bring it to life."
            action={
              <Link to="/create" className="tap inline-flex h-[44px] items-center gap-2 rounded-full bg-foreground px-5 text-[14px] font-semibold text-background">
                <Plus className="h-[16px] w-[16px]" strokeWidth={2} />
                New post
              </Link>
            }
          />
        ) : (
          posts.map((p) => <FeedCard key={p.id} post={p} onChanged={load} />)
        )}
      </section>

      <Link
        to="/create"
        aria-label="New post"
        className="fixed bottom-[90px] right-5 z-30 inline-flex h-[56px] w-[56px] items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_-6px_hsl(var(--primary)/0.6)]"
      >
        <Plus className="h-[24px] w-[24px]" strokeWidth={2} />
      </Link>
    </AppShell>
  );
};

export default Home;
