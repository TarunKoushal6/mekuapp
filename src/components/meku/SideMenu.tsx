import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { Bookmark, Sparkles } from "lucide-react";
import { Avatar } from "./Avatar";
import { VerificationBadge } from "./VerificationBadge";
import {
  IconHome, IconWallet, IconCommunity, IconBell, IconProfile,
  IconSettings, IconExternal, IconLogout,
} from "./MekuIcon";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { getProfile, getFollowCounts, type Profile } from "@/lib/social";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const items = [
  { to: "/profile", label: "Profile", icon: IconProfile },
  { to: "/wallet", label: "Wallet", icon: IconWallet },
  { to: "/explore", label: "Friends", icon: IconCommunity },
  { to: "/bookmarks", label: "Bookmarks", icon: (p: any) => <Bookmark size={p.size ?? 20} strokeWidth={1.8} /> },
  { to: "/notifications", label: "Notifications", icon: IconBell },
  { to: "/home", label: "Home", icon: IconHome },
];

export const SideMenu = ({ open, onOpenChange }: Props) => {
  const { user, signOut } = useAuth();
  const [me, setMe] = useState<Profile | null>(null);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });

  useEffect(() => {
    if (!open || !user) return;
    getProfile(user.id).then(setMe).catch(() => {});
    getFollowCounts(user.id).then(setCounts).catch(() => {});
  }, [open, user?.id]);

  const name = me?.display_name || me?.username || "You";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[300px] max-w-[85vw] border-border bg-background p-0"
        style={{ boxShadow: "var(--shadow-3)" }}
      >
        <div className="flex h-full flex-col">
          {/* Profile card — one accent surface, hairline instead of shadow. */}
          <Link
            to="/profile"
            onClick={() => onOpenChange(false)}
            className="tap mx-3 mt-4 block rounded-[var(--r3)] border border-border bg-surface/60 px-4 py-3.5 transition-colors duration-[var(--d2)] hover:bg-surface"
          >
            <div className="flex items-center gap-3">
              <Avatar name={name} src={me?.avatar_url ?? undefined} size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="truncate text-[15px] font-bold tracking-[-0.01em] text-foreground">{name}</span>
                  <VerificationBadge
                    kind={(me?.verification_kind ?? (me?.verified ? "verified" : "none")) as any}
                    size={14}
                  />
                </div>
                {me?.username && <div className="truncate text-[12.5px] text-muted-foreground">@{me.username}</div>}
              </div>
            </div>
            <div className="mt-2.5 flex items-center gap-4 text-[12.5px]">
              <span><span className="num font-bold text-foreground">{counts.following}</span> <span className="text-muted-foreground">Following</span></span>
              <span><span className="num font-bold text-foreground">{counts.followers}</span> <span className="text-muted-foreground">Followers</span></span>
            </div>
          </Link>

          <nav className="mt-2 flex-1 overflow-y-auto px-2">
            <ul className="flex flex-col">
              {items.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={() => onOpenChange(false)}
                    className="tap flex items-center gap-3.5 rounded-[var(--r2)] px-3 py-2.5 text-[15px] font-semibold tracking-[-0.005em] text-foreground transition-colors duration-[var(--d2)] hover:bg-surface-2"
                  >
                    <Icon size={20} strokeWidth={1.8} />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mx-3 my-2 h-px bg-border" />

            {/* Premium section — rules for blue vs purple tick. */}
            <Link
              to="/premium"
              onClick={() => onOpenChange(false)}
              className="tap group relative mx-1 mb-1 block overflow-hidden rounded-[var(--r3)] border border-border p-3.5"
              style={{
                background:
                  "linear-gradient(135deg, hsl(212 100% 55% / 0.10), hsl(270 95% 60% / 0.14))",
              }}
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[radial-gradient(circle,hsl(270_95%_60%/0.25),transparent_70%)] blur-2xl" />
              <div className="relative flex items-center gap-2">
                <Sparkles size={15} className="text-primary" strokeWidth={2} />
                <p className="text-[13px] font-bold tracking-[-0.005em] text-foreground">MEKU Premium</p>
              </div>
              <div className="relative mt-2 space-y-1.5 text-[11.5px] leading-snug">
                <div className="flex items-start gap-1.5">
                  <VerificationBadge kind="verified" size={12} />
                  <span className="text-foreground/80"><span className="font-semibold">Blue</span> — reach 50% of MEKU.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <VerificationBadge kind="premium" size={12} />
                  <span className="text-foreground/80"><span className="font-semibold">Purple</span> — reach 100% of MEKU.</span>
                </div>
              </div>
              <p className="relative mt-2 text-[11px] font-semibold text-primary">See the rules →</p>
            </Link>

            <Link
              to="/settings"
              onClick={() => onOpenChange(false)}
              className="tap flex items-center gap-3.5 rounded-[var(--r2)] px-3 py-2 text-[14px] font-medium text-foreground transition-colors duration-[var(--d2)] hover:bg-surface-2"
            >
              <IconSettings size={18} strokeWidth={1.7} />
              <span>Settings and privacy</span>
            </Link>
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noreferrer"
              className="tap flex items-center justify-between rounded-[var(--r2)] px-3 py-2 text-[14px] font-medium text-muted-foreground transition-colors duration-[var(--d2)] hover:bg-surface-2"
            >
              <span>Get testnet USDC</span>
              <IconExternal size={14} />
            </a>
            {user && (
              <button
                onClick={async () => { await signOut(); onOpenChange(false); }}
                className="tap flex w-full items-center gap-3.5 rounded-[var(--r2)] px-3 py-2 text-left text-[14px] font-medium text-foreground transition-colors duration-[var(--d2)] hover:bg-surface-2"
              >
                <IconLogout size={18} strokeWidth={1.7} />
                <span>Log out</span>
              </button>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};
