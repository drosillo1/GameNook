// src/components/Toaster.tsx
'use client'

import { useEffect, useState } from 'react'
import { toastStore, Toast } from '@/lib/toast'
import { CheckIcon, XIcon, InfoIcon, AlertTriangleIcon } from 'lucide-react'

const CONFIG: Record<Toast['type'], {
  icon:   React.ReactNode
  color:  string
  border: string
  bg:     string
}> = {
  success: {
    icon:   <CheckIcon className="w-4 h-4" />,
    color:  'text-green-400',
    border: 'border-green-500/30',
    bg:     'bg-green-500/10',
  },
  error: {
    icon:   <XIcon className="w-4 h-4" />,
    color:  'text-red-400',
    border: 'border-red-500/30',
    bg:     'bg-red-500/10',
  },
  info: {
    icon:   <InfoIcon className="w-4 h-4" />,
    color:  'text-blue-400',
    border: 'border-blue-500/30',
    bg:     'bg-blue-500/10',
  },
  warning: {
    icon:   <AlertTriangleIcon className="w-4 h-4" />,
    color:  'text-yellow-400',
    border: 'border-yellow-500/30',
    bg:     'bg-yellow-500/10',
  },
}

export default function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    return toastStore.subscribe(setToasts)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => {
        const cfg = CONFIG[toast.type]
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border
                        backdrop-blur-xl shadow-xl pointer-events-auto
                        animate-in slide-in-from-right-4 duration-300
                        ${cfg.bg} ${cfg.border}`}
          >
            <span className={cfg.color}>{cfg.icon}</span>
            <p className="text-gn-text text-sm font-semibold max-w-[260px]">
              {toast.message}
            </p>
            <button
              onClick={() => toastStore.remove(toast.id)}
              className="text-gn-muted hover:text-gn-text transition-colors ml-1"
            >
              <XIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}