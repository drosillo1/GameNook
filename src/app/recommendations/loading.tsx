// src/app/recommendations/loading.tsx
export default function Loading() {
  return (
    <div className="min-h-screen bg-gn-bg font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">

        <div className="mb-8">
          <div className="h-3 w-32 bg-white/[0.06] rounded mb-3 animate-pulse" />
          <div className="h-9 w-64 bg-white/[0.08] rounded mb-3 animate-pulse" />
          <div className="h-4 w-full max-w-lg bg-white/[0.04] rounded animate-pulse" />
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-7 w-20 bg-white/[0.05] rounded-md animate-pulse" />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-3/4 bg-white/[0.04] rounded mb-2 animate-pulse" />
              <div className="bg-gn-card border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="aspect-[3/4] bg-white/[0.04] animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-4/5 bg-white/[0.06] rounded animate-pulse" />
                  <div className="h-2.5 w-1/2 bg-white/[0.04] rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}