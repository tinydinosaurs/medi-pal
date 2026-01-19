export default function DocumentsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-4xl">
          📄
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Coming Soon</h2>
        <p className="mt-2 text-slate-600">
          Document upload and AI analysis will be available in a future update.
        </p>
      </div>
    </div>
  );
}
