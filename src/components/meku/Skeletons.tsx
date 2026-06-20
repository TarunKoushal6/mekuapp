import { Skeleton } from "@/components/ui/skeleton";

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
  <div className="animate-fade-in">
    {Array.from({ length: count }).map((_, i) => (
      <PostCardSkeleton key={i} />
    ))}
  </div>
);

export const ProfileHeaderSkeleton = () => (
  <section className="animate-fade-in px-5 pb-5 pt-2">
    <Skeleton className="h-[96px] w-[96px] rounded-full" />
    <Skeleton className="mt-5 h-7 w-44" />
    <Skeleton className="mt-2 h-4 w-28" />
    <Skeleton className="mt-4 h-4 w-[90%]" />
    <Skeleton className="mt-1 h-4 w-[60%]" />
    <div className="mt-5 flex gap-7">
      <Skeleton className="h-10 w-12" />
      <Skeleton className="h-10 w-16" />
      <Skeleton className="h-10 w-16" />
    </div>
    <Skeleton className="mt-5 h-11 w-full rounded-full" />
  </section>
);
