// src/components/DeleteAccountSection.tsx
'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { AlertTriangleIcon } from 'lucide-react'
import { toast } from '@/lib/toast'
import { deleteAccount } from '@/actions/account'


export default function DeleteAccountSection({ username }: { username?: string | null }) {
  const [isOpen,      setIsOpen]      = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting,  setIsDeleting]  = useState(false)


  const confirmWord = username ?? 'ELIMINAR'
  const canDelete   = confirmText === confirmWord && !isDeleting

  const handleDelete = async () => {
    if (!canDelete) return
    setIsDeleting(true)

    try {
      const result = await deleteAccount()

      if (!result.ok) {
        toast.error(result.error)
        setIsDeleting(false)
        return
      }

      await signOut({ callbackUrl: '/' })
    } catch {
      toast.error('No se ha podido eliminar la cuenta. Inténtalo de nuevo.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="mt-8 bg-gn-card border border-red-500/20 rounded-2xl p-6 sm:p-8">
      <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-1
                    flex items-center gap-1.5">
        <AlertTriangleIcon className="w-3.5 h-3.5" />
        // Zona de peligro
      </p>
      <h2 className="font-display font-black text-xl text-gn-text mb-2">
        Eliminar cuenta
      </h2>
      <p className="text-gn-muted text-sm leading-relaxed mb-5">
        Se eliminarán tu nombre, tu correo, tu avatar, tu colección y los juegos que
        sigues. <span className="text-gn-text font-medium">Tus reseñas se conservarán de
        forma anónima</span>, desvinculadas de tu identidad y mostradas como «Cuenta
        eliminada», porque forman parte del historial de la comunidad. Esta acción no se
        puede deshacer.
      </p>

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="px-4 py-2.5 rounded-lg border border-red-500/30 text-red-400
                     text-xs font-bold uppercase tracking-wider
                     hover:bg-red-500/10 hover:border-red-500/50 transition-all"
        >
          Eliminar mi cuenta
        </button>
      ) : (
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 space-y-4">
          <p className="text-gn-text text-sm">
            Para confirmar, escribe{' '}
            <span className="font-mono font-bold text-red-400 select-all">{confirmWord}</span>
            {' '}en el campo de abajo.
          </p>

          <input
            type="text"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder={confirmWord}
            autoComplete="off"
            disabled={isDeleting}
            aria-label={`Escribe ${confirmWord} para confirmar la eliminación`}
            className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg
                       px-3.5 py-2.5 text-gn-text text-sm placeholder-gn-subtle font-mono
                       focus:outline-none focus:border-red-500/40
                       focus:ring-1 focus:ring-red-500/20 transition-all
                       disabled:opacity-50"
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={!canDelete}
              className="px-4 py-2.5 rounded-lg bg-red-500/90 hover:bg-red-500 text-white
                         text-xs font-bold uppercase tracking-wider transition-all
                         disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isDeleting ? '⏳ Eliminando...' : 'Eliminar definitivamente'}
            </button>
            <button
              type="button"
              onClick={() => { setIsOpen(false); setConfirmText('') }}
              disabled={isDeleting}
              className="px-4 py-2.5 rounded-lg border border-white/[0.06] text-gn-muted
                         text-xs font-bold uppercase tracking-wider
                         hover:text-gn-text hover:border-white/15 transition-all
                         disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}