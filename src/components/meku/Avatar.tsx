import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
};

const palette = [
  "bg-[hsl(40_30%_88%)] text-[hsl(220_12%_18%)]",
  "bg-[hsl(220_14%_92%)] text-[hsl(220_12%_18%)]",
  "bg-[hsl(20_30%_90%)] text-[hsl(20_30%_28%)]",
  "bg-[hsl(160_18%_88%)] text-[hsl(160_18%_22%)]",
  "bg-[hsl(250_40%_92%)] text-[hsl(250_40%_30%)]",
];

export const Avatar = ({ name, src, size = "md", className }: AvatarProps) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const swatch = palette[name.charCodeAt(0) % palette.length];
  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium",
        sizeMap[size],
        !src && swatch,
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="tracking-tight">{initials}</span>
      )}
    </div>
  );
};
