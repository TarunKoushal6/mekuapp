// Bookmark — pixel-faithful port of Uiverse.io / Galahhad.
// Gold fill on check, scaleY squash + radial burst.
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";

interface Props {
  checked: boolean;
  onChange: (e: React.MouseEvent) => void;
  size?: number;
  className?: string;
  "aria-label"?: string;
}

export const BookmarkSave = ({ checked, onChange, size = 20, className, ...rest }: Props) => {
  return (
    <label
      className={cn("ui-bookmark", className)}
      style={{ ["--icon-size" as string]: `${size}px` }}
      onClick={(e) => e.stopPropagation()}
      aria-label={rest["aria-label"] ?? "Save"}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => {}}
        onClick={(e) => {
          if (!checked) haptic("light");
          onChange(e as unknown as React.MouseEvent);
        }}
      />

      <div className="bookmark">
        <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" style={{ width: size }}>
          <path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
        </svg>
      </div>
    </label>
  );
};
