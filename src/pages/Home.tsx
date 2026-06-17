import { AppShell } from "@/components/meku/AppShell";
import { FeedCard } from "@/components/meku/FeedCard";
import { EmptyState } from "@/components/meku/EmptyState";
import { Loader2, Menu } from "lucide-react";
import { IconBell, IconPlus } from "@/components/meku/MekuIcon";
import { Logo } from "@/components/meku/Logo";
import { SideMenu } from "@/components/meku/SideMenu";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { fetchPosts, type Post } from "@/lib/social";
import { supabase } from "@/integrations/supabase/client";

const tabs = ["For You", "Following"] as const;
type Tab = (typeof tabs)[number];

const Home = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("For You");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

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
      <header className="sticky top-0 z-30 flex items-center justify-between bg-background/85 px-4 pb-2 pt-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Menu"
            className="tap inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground"
          >
            <Menu className="h-[24px] w-[24px]" strokeWidth={2} />
          </button>
          <Logo size={28} />
        </div>
        <Link to="/notifications" aria-label="Notifications" className="tap relative inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground">
          <IconBell size={20} />
          <span className="absolute right-2 top-2 h-[7px] w-[7px] rounded-full bg-primary" />
        </Link>
      </header>

      <SideMenu open={menuOpen} onOpenChange={setMenuOpen} />

      {/* Tabs — X.com-style */}
      <nav className="sticky top-[52px] z-20 bg-background/85 backdrop-blur-xl hairline-b">
        <div className="flex items-center gap-8 px-5">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn("tap relative py-3 text-[14px] font-semibold", tab === t ? "text-foreground" : "text-muted-foreground")}
            >
              {t}
              {tab === t && <span className="absolute inset-x-0 -bottom-px h-[3px] rounded-full bg-primary" />}
            </button>
          ))}
        </div>
      </nav>

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

export default Home;
