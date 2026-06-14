// MEKU custom stroke icons — single visual language.
// Hand-tuned to match the MEKU iconography sheet (24x24 grid, 1.7 stroke).
import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const wrap = (children: React.ReactNode) =>
  (({ size = 22, ...rest }: IconProps) => (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  )) as (p: IconProps) => JSX.Element;

// Paper plane — clean two-fold silhouette
export const IconSend = wrap(
  <>
    <path d="M21 3 3 10.5l7.5 2.5L13 21l8-18z" />
    <path d="M10.5 13 21 3" />
  </>,
);

// Swap — two horizontal arrows in opposite directions
export const IconSwap = wrap(
  <>
    <path d="M4 8h14" />
    <path d="m15 5 3 3-3 3" />
    <path d="M20 16H6" />
    <path d="m9 13-3 3 3 3" />
  </>,
);

// Bridge — arch with horizon line
export const IconBridge = wrap(
  <>
    <path d="M4 14h16" />
    <path d="M6 14C6 9 9 6 12 6s6 3 6 8" />
  </>,
);

// Reply — rounded speech bubble with tail
export const IconReply = wrap(
  <>
    <path d="M5 5h12a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-5l-4 3v-3H7a3 3 0 0 1-3-3V8a3 3 0 0 1 1-3z" />
  </>,
);

// Assets — isometric cube
export const IconAssets = wrap(
  <>
    <path d="M12 3 3.5 7.5v9L12 21l8.5-4.5v-9L12 3z" />
    <path d="M3.5 7.5 12 12l8.5-4.5" />
    <path d="M12 12v9" />
  </>,
);

// Wallet — billfold with side flap
export const IconWallet = wrap(
  <>
    <rect x="3" y="6" width="18" height="13" rx="2.5" />
    <path d="M3 10h13a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H3" />
    <circle cx="15" cy="12.5" r="0.9" fill="currentColor" stroke="none" />
  </>,
);

// Explore — circle with 4-point compass star
export const IconExplore = wrap(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 5l1.6 5.4L19 12l-5.4 1.6L12 19l-1.6-5.4L5 12l5.4-1.6z" />
  </>,
);

// Bell
export const IconBell = wrap(
  <>
    <path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </>,
);

// Community — two figures
export const IconCommunity = wrap(
  <>
    <circle cx="9" cy="9" r="3" />
    <circle cx="16.5" cy="10.5" r="2.3" />
    <path d="M3.5 19c.8-3 3.2-5 5.5-5s4.7 2 5.5 5" />
    <path d="M14 19c.4-2 2-3.5 4-3.5s3.4 1.5 3.8 3.5" />
  </>,
);

// Activity — lightning bolt
export const IconActivity = wrap(
  <>
    <path d="M13 3 5 14h6l-1 7 8-11h-6z" />
  </>,
);

export const IconHome = wrap(
  <>
    <path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />
  </>,
);

export const IconPlus = wrap(<><path d="M12 5v14M5 12h14" /></>);

export const IconProfile = wrap(
  <>
    <circle cx="12" cy="8.5" r="3.6" />
    <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" />
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
    <path d="M4 20h4l10-10-4-4L4 16z" />
    <path d="m14 6 4 4" />
  </>,
);

export const IconSettings = wrap(
  <>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 13.5a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V20a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H4a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.6-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H10a1.7 1.7 0 0 0 1-1.6V4a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V10a1.7 1.7 0 0 0 1.6 1H20a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.6 1z" />
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
    <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
  </>,
);

export const IconRequest = wrap(
  <>
    <path d="M21 12 3 20l8-8L3 4z" />
    <path d="M11 12h10" />
  </>,
);

export const IconCopy = wrap(
  <>
    <rect x="9" y="9" width="11" height="11" rx="2" />
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

export const IconDroplet = wrap(
  <>
    <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
  </>,
);
