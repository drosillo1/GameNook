// src/app/games/loading.tsx

function SkeletonPulse({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded bg-white/[0.06] ${className ?? ''}`}
      style={style}
    />
  )
}

function GameCardSkeleton() {
  return (
    <div className="bg-gn-card border border-white/[0.06] rounded-xl overflow-hidden flex flex-col">
      {/* Portada 3:4 */}
      <div className="aspect-[3/4] bg-gn-surface animate-pulse relative">
        {/* Badge rating */}
        <div className="absolute top-2 right-2 w-12 h-5 rounded-md bg-white/[0.08] animate-pulse" />
      </div>

      <div className="p-3 flex flex-col flex-1 gap-2">
        {/* Título */}
        <SkeletonPulse className="h-3 w-4/5" />

        {/* Géneros */}
        <div className="flex gap-1">
          <SkeletonPulse className="h-4 w-14 rounded" />
          <SkeletonPulse className="h-4 w-10 rounded" />
        </div>

        {/* Reseñas */}
        <div className="mt-auto pt-2 border-t border-white/[0.04]">
          <SkeletonPulse className="h-2.5 w-16" />
        </div>
      </div>
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <aside className="bg-gn-card border border-white/[0.06] rounded-xl p-5 sticky top-20 h-fit">

      {/* Ordenar por */}
      <div className="mb-5 pb-5 border-b border-white/[0.06]">
        <SkeletonPulse className="h-2.5 w-24 mb-3" />
        <SkeletonPulse className="h-9 w-full rounded-lg" />
      </div>

      {/* Rating mínimo */}
      <div className="mb-5 pb-5 border-b border-white/[0.06]">
        <SkeletonPulse className="h-2.5 w-28 mb-3" />
        <SkeletonPulse className="h-6 w-32 rounded-lg mb-3" />
        <SkeletonPulse className="h-2 w-full rounded-full" />
      </div>

      {/* Géneros */}
      <div className="mb-5 pb-5 border-b border-white/[0.06]">
        <SkeletonPulse className="h-2.5 w-16 mb-3" />
        <div className="flex flex-wrap gap-1.5">
          {[60, 48, 72, 54, 64, 40, 56, 68, 44, 52].map((w, i) => (
            <SkeletonPulse key={i} className="h-6 rounded-md" style={{ width: w }} />
          ))}
        </div>
      </div>

      {/* Año */}
      <div>
        <SkeletonPulse className="h-2.5 w-12 mb-3" />
        <div className="flex flex-wrap gap-1.5">
          {[56, 52, 48, 60].map((w, i) => (
            <SkeletonPulse key={i} className="h-6 rounded-md" style={{ width: w }} />
          ))}
        </div>
      </div>
    </aside>
  )
}

export default function GamesLoading() {
  return (
    <div className="min-h-screen bg-gn-bg font-body">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-end justify-between gap-4 flex-wrap mb-8">
          <div className="space-y-2">
            <SkeletonPulse className="h-3 w-20" />
            <SkeletonPulse className="h-10 w-72 md:w-96" />
          </div>
          <SkeletonPulse className="h-10 w-36 rounded-lg" />
        </div>

        {/* Layout sidebar + grid */}
        <div className="flex gap-6 items-start">

          {/* Sidebar — solo visible en lg+ */}
          <div className="hidden lg:block w-52 flex-shrink-0">
            <SidebarSkeleton />
          </div>

          {/* Contenido principal */}
          <div className="flex-1 min-w-0">
            {/* Barra de búsqueda + contador */}
            <div className="flex items-center gap-3 mb-4">
              <SkeletonPulse className="h-10 flex-1 rounded-xl" />
              <SkeletonPulse className="h-4 w-24 flex-shrink-0" />
            </div>

            {/* Grid de cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <GameCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}