import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import {
  IconHome,
  IconSearch,
  IconWallet,
  IconMessages,
  IconExternal,
} from "./MekuIcon";

const items = [
  { to: "/home", label: "Home", icon: IconHome },
  { to: "/explore", label: "Search", icon: IconSearch },
  { to: "/wallet", label: "Wallet", icon: IconWallet },
  { to: "/browser", label: "Browser", icon: IconExternal },
  { to: "/inbox", label: "Chat", icon: IconMessages },
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
          {items.map(({ to, label, icon: Icon }) => {
            const active =
              pathname === to || (to !== "/home" && pathname.startsWith(to));
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
