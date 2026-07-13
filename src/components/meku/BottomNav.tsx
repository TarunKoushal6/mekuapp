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
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/92 backdrop-blur-xl"
      style={{ paddingBottom: "max(env(safe-area-inset-bottom), 4px)" }}
    >
      <ul className="mx-auto flex h-[56px] max-w-[440px] items-center justify-between px-2">
        {items.map(({ to, label, icon: Icon }) => {
          const active =
            pathname === to || (to !== "/home" && pathname.startsWith(to));
          return (
            <li key={to} className="flex flex-1 justify-center">
              <NavLink
                to={to}
                aria-label={label}
                onClick={() => haptic("selection")}
                className="tap relative inline-flex h-11 w-11 items-center justify-center rounded-full outline-none"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {({ isActive }) => {
                  const isOn = isActive || active;
                  return (
                    <motion.span
                      className="relative inline-flex h-11 w-11 items-center justify-center"
                      animate={
                        reduce
                          ? undefined
                          : { scale: isOn ? 1.08 : 1, y: isOn ? -1 : 0 }
                      }
                      transition={{
                        type: "spring",
                        stiffness: 520,
                        damping: 28,
                        mass: 0.6,
                      }}
                    >
                      <Icon
                        size={24}
                        strokeWidth={isOn ? 2.4 : 1.75}
                        className={cn(
                          "transition-colors duration-200",
                          isOn ? "text-primary" : "text-muted-foreground",
                        )}
                        {...(isOn ? { fill: "currentColor" } : {})}
                      />
                    </motion.span>
                  );
                }}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
