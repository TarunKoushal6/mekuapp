import { AppShell } from "@/components/meku/AppShell";
import { VerificationBadge } from "@/components/meku/VerificationBadge";
import { IconBack, IconMore, IconSettings, IconCopy, IconExternal } from "@/components/meku/MekuIcon";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/meku/Avatar";
import { EmptyState } from "@/components/meku/EmptyState";
import { FeedCard } from "@/components/meku/FeedCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchPosts, getProfile, type Post, type Profile as ProfileT,
  getFollowCounts, isFollowing, followUser, unfollowUser,
} from "@/lib/social";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { PostListSkeleton, ProfileHeaderSkeleton } from "@/components/meku/Skeletons";

const tabs = ["Posts", "Replies", "Media", "Likes"] as const;
type Tab = (typeof tabs)[number];

const Profile = () => {
  const navigate = useNavigate();
  const { handle } = useParams();
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("Posts");
  const [profile, setProfile] = useState<ProfileT | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [likedLoaded, setLikedLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 120);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const load = useCallback(async () => {
    if (authLoading) return;
    setLoading(true);
    try {
      let p: ProfileT | null = null;
      if (handle) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .ilike("username", handle)
          .limit(1)
          .maybeSingle();
        p = (data as ProfileT) ?? null;
      } else if (user) {
        p = await getProfile(user.id);
      }
      setProfile(p);
      setLikedLoaded(false);
      setLikedPosts([]);
      if (p) {
        const [all, c, follows] = await Promise.all([
          fetchPosts(user?.id, { authorId: p.id }),
          getFollowCounts(p.id),
          user && user.id !== p.id ? isFollowing(user.id, p.id) : Promise.resolve(false),
        ]);
        setPosts(all);
        setCounts(c);
        setFollowing(follows);
      }
    } finally { setLoading(false); }
  }, [authLoading, handle, user]);

  useEffect(() => { load(); }, [load]);

  // Lazy-load liked posts when the Likes tab opens.
  useEffect(() => {
    if (tab !== "Likes" || !profile || likedLoaded) return;
    (async () => {
      const { data: likes } = await supabase
        .from("post_likes")
        .select("post_id, created_at")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(50);
      const ids = (likes ?? []).map((l: any) => l.post_id);
      if (ids.length === 0) { setLikedLoaded(true); return; }
      const { data: rows } = await supabase
        .from("posts")
        .select("id, user_id, title, body, image_url, created_at")
        .in("id", ids);
      const orderIndex = new Map(ids.map((id, i) => [id, i]));
      const sorted = (rows ?? []).slice().sort(
        (a: any, b: any) => (orderIndex.get(a.id)! - orderIndex.get(b.id)!),
      );
      // enrich with author + counts using the same helper
      const userIds = Array.from(new Set(sorted.map((r: any) => r.user_id)));
      const { data: profiles } = await supabase.from("profiles").select("*").in("id", userIds);
      const pMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
      setLikedPosts(sorted.map((p: any) => ({
        ...p, author: pMap.get(p.user_id) ?? null,
        like_count: 0, comment_count: 0, liked_by_me: true,
      })));
      setLikedLoaded(true);
    })();
  }, [tab, profile, likedLoaded]);

  const toggleFollow = async () => {
    if (!user || !profile || followBusy) { if (!user) navigate("/auth"); return; }
    if (user.id === profile.id) return;
    setFollowBusy(true);
    const next = !following;
    setFollowing(next);
    setCounts((c) => ({ ...c, followers: c.followers + (next ? 1 : -1) }));
    try {
      if (next) await followUser(user.id, profile.id);
      else await unfollowUser(user.id, profile.id);
    } catch (e: any) {
      setFollowing(!next);
      setCounts((c) => ({ ...c, followers: c.followers + (next ? -1 : 1) }));
      toast.error(e?.message ?? "Could not update follow");
    } finally { setFollowBusy(false); }
  };

  const isMe = !!user && !!profile && user.id === profile.id;
  const name = profile?.display_name || profile?.username || "Profile";
  const stats = { posts: posts.length, followers: counts.followers, following: counts.following };

  const visible = useMemo<Post[]>(() => {
    if (tab === "Posts") return posts;
    if (tab === "Media") return posts.filter((p) => !!p.image_url);
    if (tab === "Replies") return []; // replies live under comments; empty until dedicated view
    if (tab === "Likes") return likedPosts;
    return posts;
  }, [tab, posts, likedPosts]);

  return (
    <AppShell>
      <header
        className={cn(
          "sticky top-0 z-30 flex h-[52px] items-center justify-between px-3 transition-colors",
          scrolled ? "bg-background/85 backdrop-blur-xl hairline-b" : "bg-transparent",
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/50 text-foreground backdrop-blur">
            <IconBack size={20} />
          </button>
          <div
            className={cn(
              "min-w-0 transition-all duration-200",
              scrolled ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-1",
            )}
          >
            <div className="flex items-center gap-1 truncate text-[16px] font-bold tracking-[-0.01em] text-foreground">
              <span className="truncate">{name}</span>
              <VerificationBadge kind={(profile?.verification_kind ?? (profile?.verified ? "verified" : "none")) as any} size={14} />
            </div>
            <div className="text-[12px] leading-none text-muted-foreground tabular-nums">{stats.posts} posts</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isMe && (
            <Link to="/settings" aria-label="Settings" className="tap inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/50 text-foreground backdrop-blur">
              <IconSettings size={18} />
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label="More" className="tap inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/50 text-foreground backdrop-blur">
                <IconMore size={20} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-2xl">
              <DropdownMenuItem
                onClick={async () => {
                  const url = `${window.location.origin}/u/${profile?.username ?? ""}`;
                  await navigator.clipboard.writeText(url);
                  toast.success("Profile link copied");
                }}
              >
                <IconCopy size={16} className="mr-2" /> Copy profile link
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const url = `${window.location.origin}/u/${profile?.username ?? ""}`;
                  if (navigator.share) navigator.share({ url, title: name }).catch(() => {});
                  else window.open(url, "_blank");
                }}
              >
                <IconExternal size={16} className="mr-2" /> Share profile
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>


      {loading ? (
        <>
          <ProfileHeaderSkeleton />
          <PostListSkeleton count={3} />
        </>
      ) : (
        <div className="meku-page-in">
          {/* Banner — indigo gradient stand-in until banners exist */}
          <div className="-mt-[52px] h-[120px] w-full gradient-purple" />

          <section className="px-4 pb-4">
            <div className="-mt-[34px] flex items-end justify-between">
              <Avatar
                name={name}
                src={profile?.avatar_url ?? undefined}
                size="xl"
                className="h-[68px] w-[68px] ring-4 ring-background"
              />
              <div className="mb-1">
                {isMe ? (
                  <Link to="/settings/profile" className="tap inline-flex h-[36px] items-center rounded-full border border-border bg-transparent px-4 text-[14px] font-bold text-foreground">
                    Edit profile
                  </Link>
                ) : (
                  <button
                    onClick={toggleFollow}
                    disabled={followBusy || !profile}
                    className={cn(
                      "tap inline-flex h-[36px] items-center rounded-full px-5 text-[14px] font-bold disabled:opacity-60",
                      following
                        ? "border border-border bg-transparent text-foreground"
                        : "bg-foreground text-background",
                    )}
                  >
                    {following ? "Following" : "Follow"}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 flex items-center gap-1.5">
              <h1 className="text-[22px] font-bold tracking-[-0.02em] text-foreground">{name}</h1>
              <VerificationBadge kind={(profile?.verification_kind ?? (profile?.verified ? "verified" : "none")) as any} size={18} />
            </div>
            <p className="text-[14px] text-muted-foreground">@{profile?.username ?? "—"}</p>

            <p className="mt-3 whitespace-pre-wrap text-[15px] leading-[1.4] text-foreground/95">
              {profile?.bio || (isMe ? "Add a bio to tell people what you're building." : "")}
            </p>

            <div className="mt-3 flex items-center gap-5 text-[14px]">
              <span><span className="font-bold text-foreground tabular-nums">{stats.following}</span> <span className="text-muted-foreground">Following</span></span>
              <span><span className="font-bold text-foreground tabular-nums">{stats.followers}</span> <span className="text-muted-foreground">Followers</span></span>
            </div>
          </section>

          <nav className="sticky top-[52px] z-20 hairline-b bg-background/85 backdrop-blur-xl">
            <ul className="grid grid-cols-4">
              {tabs.map((t) => (
                <li key={t} className="flex justify-center">
                  <button
                    onClick={() => setTab(t)}
                    className={cn("tap relative py-3.5 text-[14px] font-semibold", tab === t ? "text-foreground" : "text-muted-foreground")}
                  >
                    <span className="relative inline-block">
                      {t}
                      {tab === t && <span className="absolute -bottom-[13px] left-0 right-0 h-[3px] rounded-full bg-primary" />}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>


          {visible.length > 0 ? (
            visible.map((p) => <FeedCard key={p.id} post={p} onChanged={load} />)
          ) : (
            <EmptyState
              pose="sitting"
              title={
                tab === "Replies" ? "No replies yet"
                : tab === "Media" ? "No media yet"
                : tab === "Likes" ? "No likes yet"
                : "No posts yet"
              }
              description={
                tab === "Media" ? "Posts with photos show up here."
                : tab === "Likes" ? "Tap the heart on any post to save it here."
                : "When there's something to show, it shows up here."
              }
            />
          )}
        </div>
      )}
    </AppShell>
  );
};

export default Profile;
