import { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const EASE = [0.23, 1, 0.32, 1] as const;

export const PostCardSkeleton = () => (
  <article className="px-4 py-4 hairline-b">
    <div className="flex gap-3">
      <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-3.5 w-[92%]" />
        <Skeleton className="h-3.5 w-[70%]" />
        <div className="flex items-center gap-6 pt-2">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-8" />
        </div>
      </div>
    </div>
  </article>
);

export const PostListSkeleton = ({ count = 4 }: { count?: number }) => (
  <div>
    {Array.from({ length: count }).map((_, i) => (
      <PostCardSkeleton key={i} />
    ))}
  </div>
);

export const ProfileHeaderSkeleton = () => (
  <section className="px-4 pb-4 pt-2">
    <Skeleton className="h-[150px] w-full rounded-none" />
    <div className="-mt-[64px] flex items-end justify-between">
      <Skeleton className="h-[128px] w-[128px] rounded-full ring-4 ring-background" />
      <Skeleton className="mb-1 h-9 w-24 rounded-full" />
    </div>
    <Skeleton className="mt-3 h-6 w-40" />
    <Skeleton className="mt-2 h-3.5 w-24" />
    <Skeleton className="mt-3 h-3.5 w-[85%]" />
    <Skeleton className="mt-1 h-3.5 w-[55%]" />
    <div className="mt-4 flex gap-5">
      <Skeleton className="h-3.5 w-20" />
      <Skeleton className="h-3.5 w-20" />
    </div>
  </section>
);

/**
 * Blur-masked crossfade between skeleton and loaded content.
 * Wrap sites that toggle between the two so the seam disappears.
 */
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
