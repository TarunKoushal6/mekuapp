import { cn } from "@/lib/utils";
import thinking from "@/assets/meku_mascot_thinking.png.asset.json";
import searching from "@/assets/meku_mascot_searching.png.asset.json";
import sitting from "@/assets/meku_mascot_sitting.png.asset.json";
import caughtup from "@/assets/meku_mascot_caughtup.png.asset.json";
import waving from "@/assets/meku_mascot_waving.png.asset.json";
import happy from "@/assets/meku_mascot_happy.png.asset.json";

export type MascotPose =
  | "thinking"
  | "searching"
  | "sitting"
  | "caughtup"
  | "waving"
  | "happy";

interface MascotProps {
  size?: number;
  className?: string;
  pose?: MascotPose;
  alt?: string;
}

const sources: Record<MascotPose, string> = {
  thinking: thinking.url,
  searching: searching.url,
  sitting: sitting.url,
  caughtup: caughtup.url,
  waving: waving.url,
  happy: happy.url,
};

/**
 * MEKU mascot — official brand illustration. Use only in onboarding,
 * empty, loading, success, and welcome states. Never in main feed or nav.
 */
export const Mascot = ({ size = 120, className, pose = "thinking", alt = "" }: MascotProps) => (
  <img
    src={sources[pose]}
    alt={alt}
    width={size}
    height={size}
    className={cn("block select-none object-contain", className)}
    style={{ height: size, width: "auto" }}
    draggable={false}
  />
);
