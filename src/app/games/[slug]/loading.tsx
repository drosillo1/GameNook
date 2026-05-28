// src/app/games/[slug]/loading.tsx

function SkeletonPulse({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`animate-pulse rounded bg-white/[0.06] ${className ?? ''}`}
      style={style}
    />
  )
}

function HeroSkeleton() {
  return (
    <div className="grid md:grid-cols-[240px_1fr] bg-gn-card border border-white/[0.06] rounded-2xl overflow-hidden mb-8">

      {/* Portada 3:4 */}
      <div className="bg-gn-surface">
        <div className="aspect-[3/4] w-full animate-pulse bg-white/[0.05]" />
      </div>

      {/* Info panel */}
      <div className="p-8 flex flex-col gap-4">
        {/* Eyebrow + título */}
        <div className="space-y-2">
          <SkeletonPulse className="h-2.5 w-28" />
          <SkeletonPulse className="h-9 w-3/4" />
          <SkeletonPulse className="h-7 w-1/2" />
        </div>

        {/* Metadatos: fecha y plataformas */}
        <div className="flex gap-3">
          <SkeletonPulse className="h-4 w-24" />
          <SkeletonPulse className="h-4 w-36" />
        </div>

        {/* Géneros */}
        <div className="flex gap-2">
          <SkeletonPulse className="h-6 w-20 rounded" />
          <SkeletonPulse className="h-6 w-16 rounded" />
          <SkeletonPulse className="h-6 w-24 rounded" />
        </div>

        {/* Botón colección */}
        <SkeletonPulse className="h-9 w-44 rounded-lg" />

        {/* Descripción */}
        <div className="space-y-2">
          <SkeletonPulse className="h-3 w-full" />
          <SkeletonPulse className="h-3 w-full" />
          <SkeletonPulse className="h-3 w-5/6" />
          <SkeletonPulse className="h-3 w-4/6" />
        </div>

        {/* Score block */}
        <div className="mt-auto bg-gn-primary/5 border border-gn-primary/15 rounded-xl p-4 flex items-center gap-6">
          <div className="flex-shrink-0 space-y-1.5">
            <SkeletonPulse className="h-12 w-20" />
            <SkeletonPulse className="h-3.5 w-28" />
            <SkeletonPulse className="h-3 w-16" />
          </div>
          <div className="flex-1">
            <SkeletonPulse className="h-2 w-full rounded-full" />
          </div>
          {/* Distribución — oculta en móvil igual que el original */}
          <div className="hidden lg:block space-y-1 flex-shrink-0">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <SkeletonPulse className="h-2 w-5" />
                <SkeletonPulse className="h-1.5 w-16 rounded-full" />
                <SkeletonPulse className="h-2 w-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ReviewFormSkeleton() {
  return (
    <div className="bg-gn-card border border-white/[0.06] rounded-xl p-6 sticky top-20">
      <SkeletonPulse className="h-4 w-32 mb-5" />
      {/* Rating selector */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonPulse key={i} className="h-8 flex-1 rounded-md" />
        ))}
      </div>
      {/* Textarea */}
      <SkeletonPulse className="h-24 w-full rounded-lg mb-4" />
      {/* Botón */}
      <SkeletonPulse className="h-10 w-full rounded-lg" />
    </div>
  )
}

function ReviewCardSkeleton() {
  return (
    <div className="px-6 py-5">
      <div className="flex items-start gap-3">
        {/* image */}
        <SkeletonPulse className="h-8 w-8 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <SkeletonPulse className="h-3.5 w-24" />
            <SkeletonPulse className="h-5 w-10 rounded-md" />
          </div>
          <SkeletonPulse className="h-3 w-full" />
          <SkeletonPulse className="h-3 w-5/6" />
          <SkeletonPulse className="h-3 w-3/4" />
        </div>
      </div>
    </div>
  )
}

function IGDBSectionSkeleton() {
  return (
    <div className="bg-gn-card border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/[0.06] px-4 pt-4 gap-2">
        {[80, 100, 96, 88].map((w, i) => (
          <SkeletonPulse key={i} className="h-8 rounded-t-lg rounded-b-none mb-0" style={{ width: w }} />
        ))}
      </div>

      {/* Screenshots grid */}
      <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonPulse key={i} className="aspect-video w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export default function GameDetailLoading() {
  return (
    <div className="min-h-screen bg-gn-bg font-body">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Back link */}
        <SkeletonPulse className="h-3 w-28 mb-8" />

        {/* Hero */}
        <HeroSkeleton />

        {/* Grid formulario + reseñas */}
        <div className="grid lg:grid-cols-[1fr_2fr] gap-6 mb-8">
          <ReviewFormSkeleton />

          {/* Lista reseñas */}
          <div className="bg-gn-card border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <SkeletonPulse className="h-4 w-44" />
              <SkeletonPulse className="h-3 w-16" />
            </div>
            <div className="divide-y divide-white/[0.04]">
              {Array.from({ length: 3 }).map((_, i) => (
                <ReviewCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>

        {/* Sección IGDB */}
        <IGDBSectionSkeleton />

      </div>
    </div>
  )
}