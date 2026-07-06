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
        <SheetHeader className="px-5 pb-4 pt-6">
          <SheetTitle className="flex items-center">
            <Logo size={26} />
          </SheetTitle>
        </SheetHeader>
        <nav className="px-3">
          <ul className="flex flex-col gap-0.5">
            {items.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  onClick={() => onOpenChange(false)}
                  className="tap group flex items-center gap-4 rounded-xl px-3 py-2.5 text-[17px] font-semibold tracking-[-0.01em] text-foreground hover:bg-surface-2"
                >
                  <Icon size={22} strokeWidth={1.7} />
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="my-4 mx-3 h-px bg-border" />
          <a
            href="https://faucet.circle.com"
            target="_blank"
            rel="noreferrer"
            className="tap flex items-center justify-between rounded-xl px-3 py-2.5 text-[14px] font-medium text-muted-foreground hover:bg-surface-2"
          >
            <span>Get testnet USDC</span>
            <IconExternal size={14} />
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  );
};
