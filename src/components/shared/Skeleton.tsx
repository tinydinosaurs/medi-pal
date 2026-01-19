export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
      <div className="mb-3 h-6 w-40 rounded bg-slate-200" />
      <div className="space-y-3">
        <div className="h-12 rounded bg-slate-100" />
        <div className="h-12 rounded bg-slate-100" />
        <div className="h-12 rounded bg-slate-100" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
}
