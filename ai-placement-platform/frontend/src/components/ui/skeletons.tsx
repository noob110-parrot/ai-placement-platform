"use client";

/**
 * Skeleton loading components — used while data is fetching.
 */

import { clsx } from "clsx";

function Skeleton({ className }: { className?: string }) {
  return (
    <div className={clsx(
      "animate-pulse bg-surface-muted rounded-lg",
      className
    )} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass rounded-2xl p-5 space-y-3">
            <div className="flex justify-between">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <Skeleton className="w-12 h-4" />
            </div>
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>

      {/* Chart + activity */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 glass rounded-2xl p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div className="glass rounded-2xl p-6 space-y-3">
          <Skeleton className="h-6 w-32" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-2 h-2 rounded-full mt-2 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StudentTableSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3 bg-surface-muted border-b border-surface-border">
        <Skeleton className="h-4 w-full" />
      </div>
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-surface-border last:border-0">
          <Skeleton className="h-4 w-20" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-6 w-16 rounded-lg" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-6 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function JobCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-4">
        <Skeleton className="w-14 h-14 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-20 rounded-lg" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded-lg" />
      </div>
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="glass rounded-xl p-4 flex items-start gap-4">
          <Skeleton className="w-9 h-9 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="glass rounded-2xl p-5 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-12 h-4" />
      </div>
      <Skeleton className="h-9 w-20" />
      <Skeleton className="h-4 w-28" />
    </div>
  );
}
