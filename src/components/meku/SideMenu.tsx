import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { Logo } from "./Logo";
import {
  IconHome, IconWallet, IconCommunity, IconBell, IconProfile,
  IconSettings, IconExternal,
} from "./MekuIcon";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const items = [
  { to: "/home", label: "Home", icon: IconHome },
  { to: "/explore", label: "Friends", icon: IconCommunity },
  { to: "/wallet", label: "Wallet", icon: IconWallet },
  { to: "/bookmarks", label: "Bookmarks", icon: (p: any) => <Bookmark size={p.size ?? 18} strokeWidth={1.7} /> },
  { to: "/notifications", label: "Notifications", icon: IconBell },
  { to: "/profile", label: "Profile", icon: IconProfile },
  { to: "/settings", label: "Settings", icon: IconSettings },
];

export const SideMenu = ({ open, onOpenChange }: Props) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[300px] max-w-[85vw] border-border bg-background p-0">
        <SheetHeader className="px-5 pb-3 pt-5">
          <SheetTitle className="flex items-center">
            <Logo size={28} />
          </SheetTitle>
        </SheetHeader>
        <nav className="px-2">
          <ul className="flex flex-col">
            {items.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  onClick={() => onOpenChange(false)}
                  className="tap flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-medium text-foreground hover:bg-surface-2"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-foreground">
                    <Icon size={18} />
                  </span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="my-3 mx-3 h-px bg-border" />
          <a
            href="https://faucet.circle.com"
            target="_blank"
            rel="noreferrer"
            className="tap flex items-center justify-between rounded-2xl px-3 py-3 text-[14px] text-muted-foreground hover:bg-surface-2"
          >
            <span>Get testnet USDC</span>
            <IconExternal size={14} />
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  );
};
