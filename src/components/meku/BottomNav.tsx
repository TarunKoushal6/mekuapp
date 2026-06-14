import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  IconHome,
  IconCommunity,
  IconPlus,
  IconWallet,
  IconProfile,
} from "./MekuIcon";

const items = [
  { to: "/home", label: "Home", icon: IconHome },
  { to: "/explore", label: "Friends", icon: IconCommunity },
  { to: "/create", label: "Create", icon: IconPlus, primary: true },
  { to: "/wallet", label: "Wallet", icon: IconWallet },
  { to: "/profile", label: "Profile", icon: IconProfile },
];

export const BottomNav = () => {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 bg-background/80 backdrop-blur-xl"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 8px)" }}
    >
      <div className="mx-auto max-w-[440px] px-4 pt-2">
        <ul className="flex h-[64px] items-center justify-between rounded-[24px] border border-border bg-surface/70 px-3">
          {items.map(({ to, label, icon: Icon, primary }) => {
            const active = pathname === to || (to !== "/home" && pathname.startsWith(to));
            if (primary) {
              return (
                <li key={to} className="flex flex-1 justify-center">
                  <NavLink
                    to={to}
                    aria-label={label}
                    className="tap inline-flex h-[44px] w-[44px] items-center justify-center rounded-[14px] gradient-purple text-primary-foreground shadow-purple"
                  >
                    <Icon size={22} />
                  </NavLink>
                </li>
              );
            }
            return (
              <li key={to} className="flex flex-1 justify-center">
                <NavLink
                  to={to}
                  aria-label={label}
                  className={cn(
                    "tap inline-flex h-[40px] w-[40px] items-center justify-center rounded-full",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon size={22} />
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
