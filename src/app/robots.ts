// src/app/robots.ts

import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',

        allow: '/',

        disallow: [
          '/api/',        // rutas de API — no tienen sentido indexadas
          '/admin',       // panel de moderación — privado
          '/auth/',       // páginas de login — no aportan SEO
          '/onboarding',  // flujo de alta — requiere sesión
          '/collection',  // biblioteca personal — requiere sesión


          '/profile$',
          '/profile/edit',
        ],
      },
    ],

    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}