// Custom MEKU stroke icons — single visual language across the app.
// 24x24 grid, 1.6 stroke, rounded caps/joins.
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
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {children}
    </svg>
  )) as (p: IconProps) => JSX.Element;

export const IconSend = wrap(
  <>
    <path d="M3 12 21 4 13 21l-2-9z" />
    <path d="M11 12l8-4" />
  </>,
);

export const IconSwap = wrap(
  <>
    <path d="M5 8h12l-3-3" />
    <path d="M19 16H7l3 3" />
  </>,
);

export const IconBridge = wrap(
  <>
    <path d="M3 15c4-6 14-6 18 0" />
    <path d="M3 15v3M21 15v3M9 17v-3M15 17v-3" />
  </>,
);

export const IconReply = wrap(
  <>
    <path d="M4 5h16v11H8l-4 4z" />
  </>,
);

export const IconAssets = wrap(
  <>
    <path d="M12 3l8 4-8 4-8-4 8-4z" />
    <path d="M4 11l8 4 8-4M4 15l8 4 8-4" />
  </>,
);

export const IconWallet = wrap(
  <>
    <rect x="3" y="6" width="18" height="13" rx="2.5" />
    <path d="M16 12h2.5" />
    <path d="M3 9h12" />
  </>,
);

export const IconExplore = wrap(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M3.5 9h17M3.5 15h17M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
  </>,
);

export const IconBell = wrap(
  <>
    <path d="M6 9a6 6 0 1112 0v4l1.5 3H4.5L6 13z" />
    <path d="M10 19a2 2 0 004 0" />
  </>,
);

export const IconCommunity = wrap(
  <>
    <circle cx="9" cy="9" r="3" />
    <circle cx="16" cy="11" r="2.5" />
    <path d="M3 19c1-3 4-5 6-5s5 2 6 5" />
    <path d="M14 19c.6-2 2.2-3.5 4-3.5s3.4 1.5 4 3.5" />
  </>,
);

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

export const IconPlus = wrap(
  <>
    <path d="M12 5v14M5 12h14" />
  </>,
);

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

export const IconBack = wrap(
  <>
    <path d="M15 5l-7 7 7 7" />
  </>,
);

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
