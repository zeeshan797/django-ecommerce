import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-slate-200/70', className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 p-4 space-y-4 shadow-xs">
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/4 rounded-md" />
        <Skeleton className="h-4 w-3/4 rounded-md" />
      </div>
      <div className="pt-2 flex items-center justify-between">
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-8 w-16 rounded-xl" />
      </div>
    </div>
  );
}
