// src/app/upcoming/loading.tsx
export default function UpcomingLoading() {
  return (
    <div className="min-h-screen bg-gn-bg font-body">
      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="h-4 w-32 bg-white/[0.04] rounded mb-8" />

        <div className="mb-10">
          <div className="h-3 w-40 bg-gn-primary/20 rounded mb-2" />
          <div className="h-10 w-72 bg-white/[0.06] rounded mb-2" />
          <div className="h-4 w-96 bg-white/[0.04] rounded" />
        </div>

        {/* Grupo simulado */}
        <div className="mb-10">
          <div className="h-5 w-48 bg-white/[0.06] rounded mb-5" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-gn-card border border-white/[0.06] rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-gn-surface" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-white/[0.06] rounded" />
                  <div className="h-3 w-1/2 bg-white/[0.04] rounded" />
                  <div className="h-3 w-2/3 bg-white/[0.04] rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="h-5 w-48 bg-white/[0.06] rounded mb-5" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-gn-card border border-white/[0.06] rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-gn-surface" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-white/[0.06] rounded" />
                  <div className="h-3 w-1/2 bg-white/[0.04] rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}