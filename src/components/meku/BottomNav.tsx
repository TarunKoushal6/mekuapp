import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
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
      className="fixed inset-x-0 bottom-0 z-40"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 6px)" }}
    >
      <div className="mx-auto max-w-[440px] px-3 pt-1.5">
        <ul className="glass-floating flex h-[62px] items-center justify-between rounded-[22px] px-2 shadow-[0_10px_40px_-14px_hsl(252_95%_40%/0.28)]">
          {items.map(({ to, label, icon: Icon, primary }) => {
            const active =
              pathname === to || (to !== "/home" && pathname.startsWith(to));
            if (primary) {
              return (
                <li key={to} className="flex flex-1 justify-center">
                  <NavLink
                    to={to}
                    aria-label={label}
                    onClick={() => haptic("medium")}
                    className="spring-press relative -mt-5 inline-flex h-[52px] w-[52px] items-center justify-center rounded-[18px] gradient-purple text-primary-foreground shadow-purple ring-4 ring-background"
                  >
                    <Icon size={22} strokeWidth={2} />
                  </NavLink>
                </li>
              );
            }
            return (
              <li key={to} className="flex flex-1 justify-center">
                <NavLink
                  to={to}
                  aria-label={label}
                  onClick={() => haptic("selection")}
                  className={cn(
                    "spring-press relative inline-flex h-[44px] w-[44px] items-center justify-center rounded-full",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon size={22} strokeWidth={active ? 2.2 : 1.7} />
                  {active && (
                    <span className="pointer-events-none absolute -bottom-0.5 h-1 w-1 rounded-full bg-primary animate-scale-in" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
