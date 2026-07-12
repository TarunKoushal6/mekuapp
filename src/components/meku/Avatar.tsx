import { useState } from "react";
import { cn } from "@/lib/utils";
import defaultAvatar from "@/assets/default_avatar.png.asset.json";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: "h-6 w-6",
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-11 w-11",
  xl: "h-12 w-12",
};

export const Avatar = ({ name, src, size = "md", className }: AvatarProps) => {
  const [errored, setErrored] = useState(false);
  const usingDefault = errored || !src || src.trim() === "";
  const url = usingDefault ? defaultAvatar.url : src!;
  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2",
        sizeMap[size],
        className,
      )}
    >
      <img
        src={url}
        alt={name}
        draggable={false}
        onContextMenu={(e) => e.preventDefault()}
        onError={() => setErrored(true)}
        // For the brand mascot avatar we zoom in slightly and lock to the upper
        // third so the face stays centered in every size.
        style={
          usingDefault
            ? { objectPosition: "50% 22%", transform: "scale(1.18)" }
            : undefined
        }
        className="no-save h-full w-full object-cover"
      />
    </div>
  );
};
