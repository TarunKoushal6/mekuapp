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
  lg: "h-14 w-14",
  xl: "h-20 w-20",
};

export const Avatar = ({ name, src, size = "md", className }: AvatarProps) => {
  const url = src && src.trim() !== "" ? src : defaultAvatar.url;
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
        className="no-save h-full w-full object-cover"
      />
    </div>
  );
};
