import { cn } from "@/lib/utils";
import logoFull from "@/assets/meku_logo_full.png.asset.json";
import appIcon from "@/assets/meku_app_icon.png.asset.json";

interface LogoProps {
  /** Height in px of the logo lockup. */
  size?: number;
  className?: string;
  /** Show the full mark + wordmark stack. Default true. */
  wordmark?: boolean;
  /** Use the colored app-icon variant (dark gradient tile with purple M). */
  appIcon?: boolean;
}

/**
 * MEKU brand logo — official locked asset. Do not redraw.
 */
export const Logo = ({
  size = 28,
  className,
  wordmark = true,
  appIcon: useAppIcon = false,
}: LogoProps) => {
  if (useAppIcon) {
    return (
      <img
        src={appIcon.url}
        alt="MEKU"
        height={size}
        className={cn("block select-none", className)}
        style={{ height: size, width: "auto" }}
        draggable={false}
      />
    );
  }

  if (wordmark) {
    return (
      <img
        src={logoFull.url}
        alt="MEKU"
        height={size}
        className={cn("block select-none", className)}
        style={{ height: size, width: "auto" }}
        draggable={false}
      />
    );
  }

  // Mark-only: crop the top portion of the lockup via aspect-ratio + object-position.
  return (
    <div
      className={cn("inline-block overflow-hidden", className)}
      style={{ height: size, width: size, aspectRatio: "1 / 1" }}
      aria-label="MEKU"
    >
      <img
        src={logoFull.url}
        alt="MEKU"
        className="block select-none object-cover object-top"
        style={{ height: size * 1.55, width: size * 1.55, marginLeft: -size * 0.275 }}
        draggable={false}
      />
    </div>
  );
};
