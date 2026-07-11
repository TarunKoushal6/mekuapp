import { AppShell } from "@/components/meku/AppShell";
import { FeedCard } from "@/components/meku/FeedCard";
import { EmptyState } from "@/components/meku/EmptyState";
import { IconPlus } from "@/components/meku/MekuIcon";
import { Bell } from "lucide-react";
import { Logo } from "@/components/meku/Logo";
import { Avatar } from "@/components/meku/Avatar";
import { SideMenu } from "@/components/meku/SideMenu";
import { Link } from "react-router-dom";
import { useEffect, useState, useCallback, useRef, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadNotifications } from "@/hooks/useNotifications";
import { fetchPosts, fetchPost, getProfile, type Post, type Profile } from "@/lib/social";
import { supabase } from "@/integrations/supabase/client";
import { PostListSkeleton, PostCardSkeleton } from "@/components/meku/Skeletons";
import { haptic } from "@/lib/haptics";

const tabs = ["For You", "Following"] as const;
type Tab = (typeof tabs)[number];

const PAGE_SIZE = 15;

const Home = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("For You");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [me, setMe] = useState<Profile | null>(null);
  const { hasUnread } = useUnreadNotifications();

  // Animated tab indicator
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const el = tabRefs.current[tab];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [tab]);

  // Pull-to-refresh
  const [ptrDist, setPtrDist] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const PTR_THRESHOLD = 72;

  // Sentinel for infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setReachedEnd(false);
    try {
      const rows = await fetchPosts(user?.id, {
        followingOnly: tab === "Following",
        limit: PAGE_SIZE,
      });
      setPosts(rows);
      if (rows.length < PAGE_SIZE) setReachedEnd(true);
    } finally { setLoading(false); }
  }, [user?.id, tab]);

  const loadMore = useCallback(async () => {
    if (loadingMore || reachedEnd || loading || posts.length === 0) return;
    setLoadingMore(true);
    try {
      const cursor = posts[posts.length - 1].created_at;
      const rows = await fetchPosts(user?.id, {
        followingOnly: tab === "Following",
        limit: PAGE_SIZE,
        before: cursor,
      });
      if (rows.length === 0) { setReachedEnd(true); return; }
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        return [...prev, ...rows.filter((r) => !seen.has(r.id))];
      });
      if (rows.length < PAGE_SIZE) setReachedEnd(true);
    } finally { setLoadingMore(false); }
  }, [loadingMore, reachedEnd, loading, posts, tab, user?.id]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!user) { setMe(null); return; }
    getProfile(user.id).then(setMe).catch(() => {});
  }, [user?.id]);

  // Infinite-scroll observer
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) loadMore();
    }, { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore]);

  // Pull-to-refresh handlers
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      if (window.scrollY <= 0 && !refreshing) startY.current = e.touches[0].clientY;
      else startY.current = null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (startY.current == null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 0) {
        setPtrDist(Math.min(dy * 0.5, 96));
      }
    };
    const onTouchEnd = async () => {
      if (startY.current == null) return;
      const dist = ptrDist;
      startY.current = null;
      if (dist >= PTR_THRESHOLD) {
        haptic("medium");
        setRefreshing(true);
        setPtrDist(56);
        try { await load(); } finally {
          setRefreshing(false);
          setPtrDist(0);
        }
      } else {
        setPtrDist(0);
      }
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [ptrDist, refreshing, load]);

  useEffect(() => {
    const ch = supabase.channel("home-posts")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "posts" }, async (payload) => {
        const row: any = payload.new;
        if (!row?.id) return;
        setPosts((prev) => (prev.some((p) => p.id === row.id) ? prev : prev));
        try {
          const full = await fetchPost(row.id, user?.id);
          if (!full) return;
          if (tab === "Following") {
            if (full.user_id !== user?.id) {
              const { data: f } = await supabase
                .from("follows").select("followee_id")
                .eq("follower_id", user?.id ?? "")
                .eq("followee_id", full.user_id)
                .maybeSingle();
              if (!f) return;
            }
          }
          setPosts((prev) => (prev.some((p) => p.id === full.id) ? prev : [full, ...prev]));
        } catch { /* ignore */ }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [tab, user?.id]);

  const ptrProgress = Math.min(ptrDist / PTR_THRESHOLD, 1);

  return (
    <AppShell>
      {/* Pull-to-refresh indicator */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-40 flex justify-center"
        style={{
          transform: `translateY(${ptrDist - 24}px)`,
          transition: startY.current == null ? "transform 220ms cubic-bezier(0.32,0.72,0,1)" : "none",
          opacity: ptrDist > 4 ? 1 : 0,
        }}
      >
        <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 shadow-sm ring-1 ring-border">
          <div
            className={cn("h-3 w-3 rounded-full border-[1.5px] border-primary border-t-transparent", refreshing && "animate-spin")}
            style={{ transform: refreshing ? undefined : `rotate(${ptrProgress * 360}deg)` }}
          />
        </div>
      </div>

      <header className="sticky top-0 z-30 grid h-[52px] grid-cols-[1fr_auto_1fr] items-center bg-background/85 px-4 backdrop-blur-xl">
        <div className="flex items-center">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="tap relative inline-flex items-center justify-center rounded-full"
          >
            <Avatar name={me?.display_name || me?.username || "You"} src={me?.avatar_url ?? undefined} size="xs" />
            {hasUnread && <span className="absolute -right-0.5 -top-0.5 h-[8px] w-[8px] rounded-full bg-primary ring-2 ring-background" />}
          </button>
        </div>
        <div className="flex items-center justify-center">
          <Logo size={32} wordmark />
        </div>
        <div className="flex items-center justify-end">
          <Link to="/notifications" aria-label="Notifications" className="tap relative inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground">
            <Bell size={20} strokeWidth={1.75} />
            {hasUnread && <span className="absolute right-1.5 top-1.5 h-[8px] w-[8px] rounded-full bg-primary ring-2 ring-background" />}
          </Link>
        </div>
      </header>

      <SideMenu open={menuOpen} onOpenChange={setMenuOpen} />

      {/* Sticky, horizontally scrollable tabs w/ animated indicator */}
      <nav className="sticky top-[52px] z-20 bg-background/85 backdrop-blur-xl hairline-b">
        <div className="relative flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="relative flex min-w-full items-center">
            {tabs.map((t) => (
              <button
                key={t}
                ref={(el) => (tabRefs.current[t] = el)}
                onClick={() => { haptic("light"); setTab(t); }}
                className={cn(
                  "tap relative flex-1 whitespace-nowrap px-6 py-3.5 text-[15px] font-semibold transition-colors",
                  tab === t ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {t}
              </button>
            ))}
            <span
              aria-hidden
              className="pointer-events-none absolute -bottom-px h-[3px] rounded-full bg-primary"
              style={{
                left: indicator.left,
                width: indicator.width,
                transform: `translateX(0)`,
                transition: "left 260ms cubic-bezier(0.32,0.72,0,1), width 260ms cubic-bezier(0.32,0.72,0,1)",
              }}
            />
          </div>
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
          <div className="animate-fade-in">
            {posts.map((p) => <FeedCard key={p.id} post={p} onChanged={load} />)}
            {/* Sentinel + footer */}
            <div ref={sentinelRef} />
            {loadingMore && <PostCardSkeleton />}
            {reachedEnd && posts.length > 0 && (
              <div className="py-8 text-center text-[13px] text-muted-foreground">You're all caught up</div>
            )}
          </div>
        )}
      </section>
    </AppShell>
  );
};

export default Home;
