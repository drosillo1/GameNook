// scripts/optimize-logo.mjs

import sharp from 'sharp'

const SRC = 'public/logo.png'

const targets = [
  // Cabecera: se muestra a 32px (movil) / 40px (sm). 128 cubre DPR 3.
  { out: 'public/logo-header.webp', size: 128, format: 'webp' },
  // Fallback PNG por si algun sitio no puede usar webp.
  { out: 'public/logo-header.png',  size: 128, format: 'png'  },
  // Manifest PWA: se mantienen los tamanos estandar, pero recomprimidos.
  { out: 'public/logo-192.png',     size: 192, format: 'png'  },
  { out: 'public/logo-512.png',     size: 512, format: 'png'  },
]

const original = await sharp(SRC).metadata()
console.log(`Original: ${original.width}x${original.height}`)

for (const t of targets) {
  const pipeline = sharp(SRC).resize(t.size, t.size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })

  if (t.format === 'webp') pipeline.webp({ quality: 90 })
  // compressionLevel 9 + palette reducen mucho un logo plano sin perder nitidez.
  if (t.format === 'png')  pipeline.png({ compressionLevel: 9, palette: true })

  const info = await pipeline.toFile(t.out)
  console.log(`  ${t.out.padEnd(28)} ${(info.size / 1024).toFixed(1).padStart(7)} KiB`)
}