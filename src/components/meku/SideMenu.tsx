import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
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
  { to: "/bookmarks", label: "Bookmarks", icon: (p: any) => <Bookmark size={p.size ?? 26} strokeWidth={1.8} /> },
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
      <SheetContent side="left" className="w-[320px] max-w-[85vw] border-border bg-background p-0">
        <div className="flex h-full flex-col">
          <div className="px-5 pb-4 pt-6">
            <Link to="/profile" onClick={() => onOpenChange(false)} className="block">
              <Avatar name={name} src={me?.avatar_url ?? undefined} size="lg" />
              <div className="mt-3 flex items-center gap-1.5">
                <span className="truncate text-[19px] font-bold tracking-[-0.01em] text-foreground">{name}</span>
                <VerificationBadge
                  kind={(me?.verification_kind ?? (me?.verified ? "verified" : "none")) as any}
                  size={18}
                />
              </div>
              {me?.username && <div className="text-[14px] text-muted-foreground">@{me.username}</div>}
              <div className="mt-3 flex items-center gap-5 text-[14px]">
                <span><span className="font-bold text-foreground">{counts.following}</span> <span className="text-muted-foreground">Following</span></span>
                <span><span className="font-bold text-foreground">{counts.followers}</span> <span className="text-muted-foreground">Followers</span></span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 overflow-y-auto px-1">
            <ul className="flex flex-col">
              {items.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={() => onOpenChange(false)}
                    className="tap flex items-center gap-5 rounded-xl px-4 py-3 text-[19px] font-bold tracking-[-0.01em] text-foreground hover:bg-surface-2"
                  >
                    <Icon size={26} strokeWidth={1.8} />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mx-4 my-3 h-px bg-border" />

            <Link
              to="/settings"
              onClick={() => onOpenChange(false)}
              className="tap flex items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-medium text-foreground hover:bg-surface-2"
            >
              <IconSettings size={20} strokeWidth={1.7} />
              <span>Settings and privacy</span>
            </Link>
            <a
              href="https://faucet.circle.com"
              target="_blank"
              rel="noreferrer"
              className="tap flex items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium text-muted-foreground hover:bg-surface-2"
            >
              <span>Get testnet USDC</span>
              <IconExternal size={16} />
            </a>
            {user && (
              <button
                onClick={async () => { await signOut(); onOpenChange(false); }}
                className="tap flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-[15px] font-medium text-foreground hover:bg-surface-2"
              >
                <IconLogout size={20} strokeWidth={1.7} />
                <span>Log out</span>
              </button>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};
