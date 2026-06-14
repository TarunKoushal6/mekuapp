// Custom MEKU stroke icons matching the reference iconography sheet.
// All icons share the same look: 24x24, 1.5 stroke, rounded caps.
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
