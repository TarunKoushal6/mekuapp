import { NavLink, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import {
  IconHome,
  IconSearch,
  IconWallet,
  IconMessages,
  IconCompass,
} from "./MekuIcon";

const items = [
  { to: "/home", label: "Home", icon: IconHome },
  { to: "/explore", label: "Search", icon: IconSearch },
  { to: "/wallet", label: "Wallet", icon: IconWallet },
  { to: "/browser", label: "Browser", icon: IconCompass },
  { to: "/inbox", label: "Chat", icon: IconMessages },
];

export const BottomNav = () => {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();

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
                    "relative inline-flex h-[44px] w-[44px] items-center justify-center rounded-full outline-none",
                    "transition-colors duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  {({ isActive }) => {
                    const isOn = isActive || active;
                    return (
                      <motion.span
                        className="relative inline-flex items-center justify-center"
                        whileTap={reduce ? undefined : { scale: 0.88 }}
                        transition={{ type: "spring", stiffness: 500, damping: 28, mass: 0.6 }}
                      >
                        <Icon size={22} strokeWidth={isOn ? 2.2 : 1.7} />
                        {isOn && (
                          <motion.span
                            layoutId="bottomnav-dot"
                            className="pointer-events-none absolute -bottom-1.5 h-1 w-1 rounded-full bg-primary"
                            transition={
                              reduce
                                ? { duration: 0.15 }
                                : { type: "spring", stiffness: 520, damping: 34, mass: 0.7 }
                            }
                          />
                        )}
                      </motion.span>
                    );
                  }}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
