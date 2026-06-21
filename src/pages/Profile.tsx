import { AppShell } from "@/components/meku/AppShell";
import { BadgeCheck } from "lucide-react";
import { IconBack, IconMore, IconSettings, IconCopy, IconExternal } from "@/components/meku/MekuIcon";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
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
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("Posts");
  const [profile, setProfile] = useState<ProfileT | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let p: ProfileT | null = null;
      if (handle) {
        const { data } = await supabase.from("profiles").select("*").eq("username", handle).maybeSingle();
        p = (data as ProfileT) ?? null;
      } else if (user) {
        p = await getProfile(user.id);
      }
      setProfile(p);
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
  }, [handle, user]);

  useEffect(() => { load(); }, [load]);

  const toggleFollow = async () => {
    if (!user || !profile || followBusy) { if (!user) navigate("/auth"); return; }
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

  return (
    <AppShell>
      <header className="sticky top-0 z-30 flex h-[56px] items-center justify-between bg-background/80 px-3 backdrop-blur-xl">
        <button onClick={() => navigate(-1)} aria-label="Back" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground">
          <IconBack size={22} />
        </button>
        <div className="flex items-center gap-1">
          {isMe && (
            <Link to="/settings" aria-label="Settings" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground">
              <IconSettings size={18} />
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button aria-label="More" className="tap inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground">
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
          <section className="px-5 pb-5 pt-2">
            <div className="relative inline-block">
              <span className="absolute -inset-[3px] rounded-full bg-gradient-to-br from-primary via-primary to-primary-glow" />
              <Avatar name={name} src={profile?.avatar_url ?? undefined} size="xl" className="relative h-[96px] w-[96px] ring-4 ring-background" />
            </div>

            <div className="mt-5 flex items-center gap-2">
              <h1 className="text-[26px] font-bold tracking-[-0.02em] text-foreground">{name}</h1>
              {profile?.verified && <BadgeCheck className="h-[18px] w-[18px] fill-primary text-background" strokeWidth={2.2} />}
            </div>
            <p className="mt-1 text-[14px] text-muted-foreground">@{profile?.username ?? "—"}</p>

            <p className="mt-4 text-[15px] leading-[1.5] text-foreground/85">
              {profile?.bio || (isMe ? "Add a bio to tell people what you're building." : "No bio yet.")}
            </p>

            <div className="mt-5 flex items-baseline gap-7">
              {[[stats.posts, "Posts"], [stats.followers, "Followers"], [stats.following, "Following"]].map(([n, l]) => (
                <div key={l as string}>
                  <p className="text-[20px] font-bold tabular-nums text-foreground">{n}</p>
                  <p className="text-[12px] text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2">
              {isMe ? (
                <Link to="/settings/profile" className="tap flex-1 rounded-full bg-foreground py-[11px] text-center text-[14px] font-bold text-background">
                  Edit profile
                </Link>
              ) : (
                <button
                  onClick={toggleFollow}
                  disabled={followBusy}
                  className={cn(
                    "tap flex-1 rounded-full py-[11px] text-[14px] font-bold disabled:opacity-60",
                    following
                      ? "border border-border bg-background text-foreground"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  {following ? "Following" : "Follow"}
                </button>
              )}
              <button className="tap rounded-full border border-border bg-background px-4 py-[11px] text-[14px] font-bold text-foreground">
                Share
              </button>
            </div>
          </section>

          <nav className="sticky top-[56px] z-20 hairline-b bg-background/90 backdrop-blur-xl">
            <ul className="flex gap-6 px-5">
              {tabs.map((t) => (
                <li key={t}>
                  <button
                    onClick={() => setTab(t)}
                    className={cn("tap relative py-3 text-[14px] font-bold", tab === t ? "text-foreground" : "text-muted-foreground")}
                  >
                    {t}
                    {tab === t && <span className="absolute inset-x-0 -bottom-px h-[2px] bg-foreground" />}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {tab === "Posts" && posts.length > 0 ? (
            posts.map((p) => <FeedCard key={p.id} post={p} onChanged={load} />)
          ) : (
            <EmptyState pose="sitting" title={`No ${tab.toLowerCase()} yet`} description="When there's something to show, it shows up here." />
          )}
        </div>
      )}
    </AppShell>
  );
};

export default Profile;
