import { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const EASE = [0.23, 1, 0.32, 1] as const;

/* ─────────── Feed / Posts ─────────── */

export const PostCardSkeleton = () => (
  <article className="px-4 py-4 hairline-b">
    <div className="flex gap-3">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="ml-auto h-3 w-10" />
        </div>
        <Skeleton className="h-3.5 w-[94%]" />
        <Skeleton className="h-3.5 w-[78%]" />
        <Skeleton className="h-3.5 w-[42%]" />
        <div className="flex items-center gap-8 pt-2.5">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </div>
  </article>
);

export const PostListSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="shimmer-stagger">
    {Array.from({ length: count }).map((_, i) => (
      <PostCardSkeleton key={i} />
    ))}
  </div>
);

/* ─────────── Composer / Create ─────────── */

/** Content-shaped placeholder for the New Post composer while it hydrates or publishes. */
export const ComposerSkeleton = () => (
  <div className="shimmer-stagger px-4 pt-6">
    {/* Author row */}
    <div className="mb-5 flex items-center gap-3">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
    {/* Title */}
    <Skeleton className="h-7 w-[70%] rounded-md" />
    {/* Body lines */}
    <div className="mt-4 space-y-2.5">
      <Skeleton className="h-4 w-[96%]" />
      <Skeleton className="h-4 w-[88%]" />
      <Skeleton className="h-4 w-[92%]" />
      <Skeleton className="h-4 w-[60%]" />
    </div>
    {/* Media placeholder */}
    <MediaPlaceholderSkeleton className="mt-5" />
  </div>
);

/** Rounded 5:4 media placeholder used for image uploads / previews. */
export const MediaPlaceholderSkeleton = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "relative aspect-[5/4] w-full overflow-hidden rounded-[16px] border border-border bg-surface-2",
      className,
    )}
  >
    <Skeleton className="absolute inset-0 rounded-none" />
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2 opacity-70">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  </div>
);

/** Bottom toolbar skeleton (image / hashtag / mention chips). */
export const ComposerToolbarSkeleton = () => (
  <div className="mx-auto flex h-[56px] max-w-[440px] items-center gap-2 px-3">
    <Skeleton className="h-9 w-9 rounded-full" />
    <Skeleton className="h-9 w-9 rounded-full" />
    <Skeleton className="h-9 w-9 rounded-full" />
    <Skeleton className="ml-auto h-3 w-6" />
  </div>
);

/* ─────────── Profile ─────────── */

export const ProfileHeaderSkeleton = () => (
  <section className="pb-4">
    <Skeleton className="h-[150px] w-full rounded-none" />
    <div className="px-4">
      <div className="-mt-[64px] flex items-end justify-between">
        <Skeleton className="h-[128px] w-[128px] rounded-full ring-4 ring-background" />
        <Skeleton className="mb-1 h-9 w-28 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-[22px] w-44" />
      <Skeleton className="mt-2 h-3.5 w-28" />
      <Skeleton className="mt-3 h-3.5 w-[88%]" />
      <Skeleton className="mt-1.5 h-3.5 w-[55%]" />
      <div className="mt-4 flex gap-5">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-3.5 w-20" />
      </div>
      <div className="mt-4 flex gap-6 border-b border-border pb-3">
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-14" />
        <Skeleton className="h-4 w-14" />
      </div>
    </div>
  </section>
);

/* ─────────── User row (search, follow lists) ─────────── */

export const UserRowSkeleton = ({ compact = false }: { compact?: boolean }) => (
  <li className="flex items-center gap-3 px-4 py-3 hairline-b">
    <Skeleton className={cn("shrink-0 rounded-full", compact ? "h-10 w-10" : "h-12 w-12")} />
    <div className="min-w-0 flex-1 space-y-2">
      <Skeleton className="h-3.5 w-36" />
      <Skeleton className="h-3 w-24" />
    </div>
    <Skeleton className="h-8 w-20 shrink-0 rounded-full" />
  </li>
);

export const UserListSkeleton = ({ count = 6, compact = false }: { count?: number; compact?: boolean }) => (
  <ul className="shimmer-stagger">
    {Array.from({ length: count }).map((_, i) => (
      <UserRowSkeleton key={i} compact={compact} />
    ))}
  </ul>
);

/* ─────────── Notifications ─────────── */

export const NotificationRowSkeleton = () => (
  <li className="flex items-start gap-3 px-4 py-3.5 hairline-b">
    <Skeleton className="mt-0.5 h-[26px] w-[26px] shrink-0 rounded-full" />
    <div className="min-w-0 flex-1 space-y-2">
      <Skeleton className="h-6 w-6 rounded-full" />
      <Skeleton className="h-3.5 w-[70%]" />
      <Skeleton className="h-3.5 w-[45%]" />
    </div>
    <Skeleton className="h-3 w-8 shrink-0" />
  </li>
);

export const NotificationListSkeleton = ({ count = 6 }: { count?: number }) => (
  <ul className="shimmer-stagger">
    {Array.from({ length: count }).map((_, i) => (
      <NotificationRowSkeleton key={i} />
    ))}
  </ul>
);

/* ─────────── Inbox (DM threads) ─────────── */

export const InboxRowSkeleton = () => (
  <li className="flex items-start gap-3 px-4 py-3.5 hairline-b">
    <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
    <div className="min-w-0 flex-1 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-10" />
      </div>
      <Skeleton className="h-3.5 w-[85%]" />
    </div>
  </li>
);

export const InboxListSkeleton = ({ count = 6 }: { count?: number }) => (
  <ul className="shimmer-stagger">
    {Array.from({ length: count }).map((_, i) => (
      <InboxRowSkeleton key={i} />
    ))}
  </ul>
);

/* ─────────── Chat bubbles ─────────── */

const CHAT_WIDTHS = ["55%", "72%", "40%", "62%", "48%", "78%"] as const;

export const ChatSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="space-y-2 px-3 pt-4">
    {Array.from({ length: count }).map((_, i) => {
      const mine = i % 3 !== 0;
      return (
        <div key={i} className={cn("flex", mine ? "justify-end" : "justify-start")}>
          <Skeleton
            className={cn(
              "h-9 rounded-2xl",
              mine ? "rounded-br-md" : "rounded-bl-md",
            )}
            style={{ width: CHAT_WIDTHS[i % CHAT_WIDTHS.length] }}
          />
        </div>
      );
    })}
  </div>
);

/* ─────────── Blur-masked crossfade ─────────── */

export const SkeletonCrossfade = ({
  loading,
  skeleton,
  children,
}: {
  loading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
}) => {
  const reduce = useReducedMotion();

  const variants = reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.14 },
      }
    : {
        initial: { opacity: 0, filter: "blur(4px)" },
        animate: { opacity: 1, filter: "blur(0px)" },
        exit: { opacity: 0, filter: "blur(4px)" },
        transition: { duration: 0.22, ease: EASE },
      };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {loading ? (
        <motion.div key="skeleton" {...variants}>
          {skeleton}
        </motion.div>
      ) : (
        <motion.div key="content" {...variants}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
