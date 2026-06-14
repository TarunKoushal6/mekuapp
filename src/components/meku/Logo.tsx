import { cn } from "@/lib/utils";
import mMark from "@/assets/meku_m.png.asset.json";
import wordmark from "@/assets/meku_wordmark.png.asset.json";

interface LogoProps {
  /** Height in px. Wordmark or mark height depending on `wordmark`. */
  size?: number;
  className?: string;
  /** Show the wordmark lockup ("MEKU"). Default true. */
  wordmark?: boolean;
  /** Show the purple M mark (alias for !wordmark). */
  appIcon?: boolean;
}

/**
 * MEKU brand — official locked assets.
 * - wordmark = full "MEKU" text in brand font
 * - mark     = purple gradient M
 */
export const Logo = ({
  size = 28,
  className,
  wordmark: showWordmark = true,
  appIcon,
}: LogoProps) => {
  const useMark = appIcon === true || showWordmark === false;
  if (useMark) {
    return (
      <img
        src={mMark.url}
        alt="MEKU"
        height={size}
        className={cn("block select-none", className)}
        style={{ height: size, width: size }}
        draggable={false}
      />
    );
  }
  return (
    <img
      src={wordmark.url}
      alt="MEKU"
      height={size}
      className={cn("wordmark-img block select-none", className)}
      style={{ height: size, width: "auto" }}
      draggable={false}
    />
  );
};
