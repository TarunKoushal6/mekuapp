// MEKU custom stroke icons — refined to match the official iconography sheet.
// 24x24 grid, 1.6 stroke, round caps/joins. Single visual language.
import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number };

const wrap = (children: React.ReactNode) =>
  (({ size = 22, strokeWidth = 1.6, ...rest }: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  )) as (p: IconProps) => JSX.Element;

// ── Brand / Action icons ────────────────────────────────────────────────────

// Paper plane (Send) — clean tilted plane, single closed silhouette.
export const IconSend = wrap(
  <>
    <path d="M21.4 2.6 2.9 9.7a.5.5 0 0 0 0 .94l7.1 2.66 2.66 7.1a.5.5 0 0 0 .94 0L21.4 2.6Z" />
    <path d="M10 14 21.4 2.6" />
  </>,
);

// Swap — two arrows curving past each other.
export const IconSwap = wrap(
  <>
    <path d="M4 8h14" />
    <path d="m15 5 3 3-3 3" />
    <path d="M20 16H6" />
    <path d="m9 13-3 3 3 3" />
  </>,
);

// Bridge — symmetrical suspension arch.
export const IconBridge = wrap(
  <>
    <path d="M3 17h18" />
    <path d="M5 17V9" />
    <path d="M19 17V9" />
    <path d="M5 9c3.5 5 10.5 5 14 0" />
  </>,
);

// Reply — speech bubble with tail.
export const IconReply = wrap(
  <>
    <path d="M20 12.5c0 3.6-3.6 6.5-8 6.5a9 9 0 0 1-2.6-.4L4 20l1.3-3.6A6 6 0 0 1 4 12.5C4 8.9 7.6 6 12 6s8 2.9 8 6.5Z" />
  </>,
);

// ── Wallet domain ──────────────────────────────────────────────────────────

export const IconAssets = wrap(
  <>
    <path d="M12 2.8 3.4 7.5v9L12 21.2l8.6-4.7v-9L12 2.8Z" />
    <path d="M3.4 7.5 12 12.2l8.6-4.7" />
    <path d="M12 12.2v9" />
  </>,
);

export const IconWallet = wrap(
  <>
    <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h11A2.5 2.5 0 0 1 19 8.5V9H5.5A2.5 2.5 0 0 1 3 6.5v2Z" />
    <rect x="3" y="8.5" width="18" height="11" rx="2.5" />
    <circle cx="16.5" cy="14" r="1.1" fill="currentColor" stroke="none" />
  </>,
);

export const IconDroplet = wrap(
  <>
    <path d="M12 2.5c-3.4 4-6 7.4-6 10.8a6 6 0 1 0 12 0c0-3.4-2.6-6.8-6-10.8Z" />
  </>,
);

// ── Navigation icons ───────────────────────────────────────────────────────

export const IconHome = wrap(
  <>
    <path d="M3.5 11.5 12 4l8.5 7.5" />
    <path d="M5 10.5V20h4v-5h6v5h4v-9.5" />
  </>,
);

export const IconExplore = wrap(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5.4-5.4 2 2-5.4 5.4-2Z" />
  </>,
);

export const IconBell = wrap(
  <>
    <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.4 1.9a.5.5 0 0 1-.4.8H5a.5.5 0 0 1-.4-.8L6 16.5Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </>,
);

export const IconCommunity = wrap(
  <>
    <circle cx="9" cy="9.5" r="3" />
    <circle cx="17" cy="10.5" r="2.3" />
    <path d="M3 19.5c.7-3 3.2-5 6-5s5.3 2 6 5" />
    <path d="M15 19c.4-2.2 1.9-3.7 4-3.7" />
  </>,
);

export const IconActivity = wrap(
  <>
    <path d="M13 3 5.5 14h5.7l-1 7 8-11h-5.7l.5-7Z" />
  </>,
);

export const IconPlus = wrap(<><path d="M12 5v14M5 12h14" /></>);

export const IconProfile = wrap(
  <>
    <circle cx="12" cy="8.5" r="3.7" />
    <path d="M4.5 20c1.5-3.7 4.4-5.6 7.5-5.6S18 16.3 19.5 20" />
  </>,
);

export const IconSearch = wrap(
  <>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </>,
);

export const IconCompose = wrap(
  <>
    <path d="M4 20h4l10-10-4-4L4 16Z" />
    <path d="m14 6 4 4" />
  </>,
);

// Settings — proper Apple-style cog: 8 rounded teeth + inner circle.
export const IconSettings = wrap(
  <>
    <path d="M12 2.6 13.5 5l2.7-.4 1 2.6 2.5 1.1-.4 2.7 1.7 2.2-1.7 2.2.4 2.7-2.5 1.1-1 2.6-2.7-.4L12 21.4 10.5 19l-2.7.4-1-2.6L4.3 15.7l.4-2.7L3 10.8l1.7-2.2-.4-2.7 2.5-1.1 1-2.6L10.5 5 12 2.6Z" />
    <circle cx="12" cy="12" r="3" />
  </>,
);

export const IconMore = wrap(
  <>
    <circle cx="5" cy="12" r="1.2" />
    <circle cx="12" cy="12" r="1.2" />
    <circle cx="19" cy="12" r="1.2" />
  </>,
);

export const IconBack = wrap(<><path d="M15 5l-7 7 7 7" /></>);

export const IconHeart = wrap(
  <>
    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
  </>,
);

export const IconRequest = wrap(
  <>
    <path d="M21 12 3 20l3.5-8L3 4l18 8Z" />
    <path d="M6.5 12h14" />
  </>,
);

export const IconCopy = wrap(
  <>
    <rect x="9" y="9" width="11" height="11" rx="2.4" />
    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
  </>,
);

export const IconExternal = wrap(
  <>
    <path d="M14 5h5v5" />
    <path d="M19 5 10 14" />
    <path d="M19 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
  </>,
);

export const IconRefresh = wrap(
  <>
    <path d="M20 12a8 8 0 1 1-2.34-5.66" />
    <path d="M20 4v5h-5" />
  </>,
);

export const IconCamera = wrap(
  <>
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13.5" r="3.6" />
  </>,
);

export const IconRotate = wrap(
  <>
    <path d="M4 12a8 8 0 1 1 2.5 5.8" />
    <path d="M3 19v-4h4" />
  </>,
);

export const IconCheck = wrap(<><path d="m5 12 4 4 10-10" /></>);
