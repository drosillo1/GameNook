// src/app/collection/loading.tsx

function SkeletonPulse({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded bg-white/[0.06] ${className ?? ''}`}
      style={style}
    />
  )
}

function CollectionCardSkeleton() {
  return (
    <div className="bg-gn-card border border-white/[0.06] rounded-xl overflow-hidden flex flex-col">
      {/* Portada */}
      <div className="aspect-[3/4] bg-gn-surface animate-pulse" />
      {/* Info */}
      <div className="p-3 space-y-2">
        <SkeletonPulse className="h-3 w-4/5" />
        <div className="flex gap-1">
          <SkeletonPulse className="h-4 w-12 rounded" />
          <SkeletonPulse className="h-4 w-16 rounded" />
        </div>
        <div className="pt-2 border-t border-white/[0.04]">
          <SkeletonPulse className="h-2.5 w-20" />
        </div>
      </div>
    </div>
  )
}

export default function CollectionLoading() {
  return (
    <div className="min-h-screen bg-gn-bg font-body">
      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8 space-y-2">
          <SkeletonPulse className="h-2.5 w-24" />
          <SkeletonPulse className="h-10 w-56" />
          <SkeletonPulse className="h-3.5 w-40" />
        </div>

        {/* Stats rápidas — 4 tarjetas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            'bg-green-500/5  border-green-500/15',
            'bg-purple-500/5 border-purple-500/15',
            'bg-blue-500/5   border-blue-500/15',
            'bg-red-500/5    border-red-500/15',
          ].map((colors, i) => (
            <div key={i} className={`${colors} border rounded-xl p-4 space-y-2`}>
              <SkeletonPulse className="h-8 w-10" />
              <SkeletonPulse className="h-2.5 w-20" />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[100, 112, 96, 104].map((w, i) => (
            <SkeletonPulse key={i} className="h-9 rounded-lg" style={{ width: w }} />
          ))}
        </div>

        {/* Grid de juegos */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <CollectionCardSkeleton key={i} />
          ))}
        </div>

      </div>
    </div>
  )
}