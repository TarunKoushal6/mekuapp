import { AppShell } from "@/components/meku/AppShell";
import { FeedCard } from "@/components/meku/FeedCard";
import { EmptyState } from "@/components/meku/EmptyState";
import { IconSettings, IconPlus } from "@/components/meku/MekuIcon";
import { Logo } from "@/components/meku/Logo";
import { Avatar } from "@/components/meku/Avatar";
import { SideMenu } from "@/components/meku/SideMenu";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadNotifications } from "@/hooks/useNotifications";
import { fetchPosts, fetchPost, getProfile, type Post, type Profile } from "@/lib/social";
import { supabase } from "@/integrations/supabase/client";
import { PostListSkeleton } from "@/components/meku/Skeletons";

const tabs = ["For You", "Following"] as const;
type Tab = (typeof tabs)[number];

const Home = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("For You");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [me, setMe] = useState<Profile | null>(null);
  const { hasUnread } = useUnreadNotifications();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await fetchPosts(user?.id, { followingOnly: tab === "Following" }));
    } finally { setLoading(false); }
  }, [user?.id, tab]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!user) { setMe(null); return; }
    getProfile(user.id).then(setMe).catch(() => {});
  }, [user?.id]);
  useEffect(() => {
    const ch = supabase.channel("home-posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, async (payload) => {
        const row: any = payload.new;
        if (!row?.id) return;
        // Skip if already present (our own optimistic insert or duplicate event)
        setPosts((prev) => (prev.some((p) => p.id === row.id) ? prev : prev));
        try {
          const full = await fetchPost(row.id, user?.id);
          if (!full) return;
          if (tab === "Following") {
            // Only prepend if authored by someone we follow (or ourselves)
            if (full.user_id !== user?.id) {
              const { data: f } = await supabase
                .from("follows")
                .select("followee_id")
                .eq("follower_id", user?.id ?? "")
                .eq("followee_id", full.user_id)
                .maybeSingle();
              if (!f) return;
            }
          }
          setPosts((prev) => (prev.some((p) => p.id === full.id) ? prev : [full, ...prev]));
        } catch { /* ignore realtime errors */ }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [tab, user?.id]);

  return (
    <AppShell>
      <header className="sticky top-0 z-30 grid h-[52px] grid-cols-[1fr_auto_1fr] items-center bg-background/85 px-4 backdrop-blur-xl">
        <div className="flex items-center">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="tap relative inline-flex items-center justify-center rounded-full"
          >
            <Avatar name={me?.display_name || me?.username || "You"} src={me?.avatar_url ?? undefined} size="sm" />
            {hasUnread && <span className="absolute -right-0.5 -top-0.5 h-[9px] w-[9px] rounded-full bg-primary ring-2 ring-background" />}
          </button>
        </div>
        <div className="flex items-center justify-center">
          <Logo size={22} wordmark={false} />
        </div>
        <div className="flex items-center justify-end">
          <Link to="/settings" aria-label="Settings" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground">
            <IconSettings size={20} />
          </Link>
        </div>
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
          <PostListSkeleton count={5} />
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
          <div className="animate-fade-in">{posts.map((p) => <FeedCard key={p.id} post={p} onChanged={load} />)}</div>
        )}
      </section>
    </AppShell>
  );
};

export default Home;
