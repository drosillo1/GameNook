import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GameNook',
    short_name: 'GameNook',
    description: 'Tu catálogo personal de videojuegos',
    start_url: '/',
    display: 'standalone',
    background_color: '#07070f',
    theme_color: '#07070f',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}