// src/app/robots.ts

import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXTAUTH_URL ?? 'https://gamenook.es'

  return {
    rules: [
      {
        // La regla sin userAgent específico aplica a todos los crawlers
        // (Googlebot, Bingbot, etc.)
        userAgent: '*',

        allow: [
          '/',          // home
          '/games',     // catálogo
          '/games/',    // todas las fichas de juego
        ],

        disallow: [
          '/api/',        // rutas de API — no tienen sentido indexadas
          '/admin',       // panel de moderación — privado
          '/collection',  // biblioteca personal — requiere sesión, no indexable
          '/profile',     // perfil de usuario — privado
          '/auth/',       // páginas de login — no aportan SEO
        ],
      },
    ],

    // Le dice a todos los crawlers dónde está el sitemap.
    // Sin esta línea, Google puede tardar semanas en encontrarlo
    // aunque lo hayas enviado en Search Console.
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}