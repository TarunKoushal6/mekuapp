import mascot from "@/assets/meku-mascot.png";
import { cn } from "@/lib/utils";

interface MascotProps {
  size?: number;
  className?: string;
}

export const Mascot = ({ size = 120, className }: MascotProps) => (
  <img
    src={mascot}
    alt="MEKU mascot"
    width={size}
    height={size}
    className={cn("select-none", className)}
    draggable={false}
  />
);
