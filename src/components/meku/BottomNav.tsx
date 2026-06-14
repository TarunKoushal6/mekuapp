import { NavLink, useLocation } from "react-router-dom";
import { Home, Globe, Plus, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Globe },
  { to: "/create", label: "Create", icon: Plus, primary: true },
  { to: "/inbox", label: "Messages", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: User },
];

/**
 * Bottom nav — quiet hairline, dark squared FAB in the center.
 * Matches MEKU bottom-navigation spec.
 */
export const BottomNav = () => {
  const { pathname } = useLocation();
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 hairline-t bg-background/90 backdrop-blur-xl"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 6px)" }}
    >
      <ul className="mx-auto flex h-[60px] max-w-[440px] items-center justify-between px-5">
        {items.map(({ to, label, icon: Icon, primary }) => {
          const active = pathname === to;
          if (primary) {
            return (
              <li key={to} className="flex flex-1 justify-center">
                <NavLink
                  to={to}
                  aria-label={label}
                  className="tap inline-flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-foreground text-background"
                >
                  <Icon className="h-[20px] w-[20px]" strokeWidth={2} />
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
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2 : 1.6} />
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
