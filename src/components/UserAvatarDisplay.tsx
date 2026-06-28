// src/components/UserAvatarDisplay.tsx

interface UserAvatarDisplayProps {
  image?: string | null
  name?:  string | null
  email?: string | null
  size?:  number
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

export default function UserAvatarDisplay({ image, name, email, size = 40 }: UserAvatarDisplayProps) {
  const initial = (name?.[0] ?? email?.[0] ?? '?').toUpperCase()
  const gradient = GRADIENTS[(initial.charCodeAt(0) ?? 0) % GRADIENTS.length]

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