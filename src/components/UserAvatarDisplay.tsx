// src/components/UserAvatarDisplay.tsx

import { getAvatarUrl } from '@/lib/avatars'

interface UserAvatarDisplayProps {
  avatar?: string | null
  image?:  string | null
  name?:   string | null
  email?:  string | null
  size?:   number
}

// Gradientes negro -> rojo, variando el ángulo/intensidad para diferenciar iniciales
// sin salirse de los dos colores principales de la identidad (gn-bg, gn-primary)
const GRADIENTS = [
  'linear-gradient(135deg, #07070f, #e63946)',
  'linear-gradient(135deg, #07070f, #b52d38)',
  'linear-gradient(160deg, #07070f, #e63946)',
  'linear-gradient(110deg, #07070f, #e63946)',
  'linear-gradient(135deg, #131323, #e63946)',
  'linear-gradient(160deg, #131323, #b52d38)',
  'linear-gradient(110deg, #07070f, #b52d38)',
  'linear-gradient(135deg, #0f0f1c, #e63946)',
]

export default function UserAvatarDisplay({ avatar, image, name, email, size = 40 }: UserAvatarDisplayProps) {
  // 1. Avatar elegido por el usuario → prioridad máxima
  if (avatar) {
    return (
      <img
        src={getAvatarUrl(avatar)}
        alt={name ?? 'Avatar'}
        style={{ width: size, height: size }}
        className="rounded-full object-cover flex-shrink-0"
      />
    )
  }

  // 2. Imagen de Google (u otro provider OAuth)
  if (image) {
    return (
      <img
        src={image}
        alt={name ?? 'Usuario'}
        style={{ width: size, height: size }}
        className="rounded-full object-cover flex-shrink-0"
      />
    )
  }

  // 3. Fallback: gradiente con inicial
  const initial = (name?.[0] ?? email?.[0] ?? '?').toUpperCase()
  const gradient = GRADIENTS[(initial.charCodeAt(0) ?? 0) % GRADIENTS.length]

  return (
    <div
      style={{
        width: size,
        height: size,
        background: gradient,
        fontSize: size * 0.42,
      }}
      className="rounded-full flex items-center justify-center text-white
                 font-display font-black flex-shrink-0"
    >
      {initial}
    </div>
  )
}