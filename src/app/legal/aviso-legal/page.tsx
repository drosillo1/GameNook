// src/app/legal/aviso-legal/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Aviso Legal',
  description: 'Aviso legal e información sobre el responsable del sitio GameNook.',
  robots: { index: false },   // las páginas legales no aportan SEO, mejor no indexarlas
}

export default function AvisoLegalPage() {
  return (
    <div className="min-h-screen bg-gn-bg font-body">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <p className="text-gn-primary text-xs font-semibold uppercase tracking-widest mb-2">
          // Legal
        </p>
        <h1
          className="font-display font-black text-4xl text-gn-text mb-2"
          style={{ fontFamily: 'Orbitron, monospace' }}
        >
          Aviso Legal
        </h1>
        <p className="text-gn-muted text-sm mb-12">
          Última actualización: junio de 2025
        </p>

        <div className="space-y-10 text-gn-muted text-sm leading-relaxed">

          <section>
            <h2 className="text-gn-text font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-gn-primary font-display text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>01</span>
              Datos identificativos del responsable
            </h2>
            <div className="bg-gn-card border border-white/[0.06] rounded-xl p-5 space-y-2">
              <p><span className="text-gn-text font-medium">Titular:</span> Daniel Rosillo Barnés</p>
              <p><span className="text-gn-text font-medium">Domicilio:</span> Murcia, España</p>
              <p><span className="text-gn-text font-medium">Correo electrónico:</span>{' '}
                <a href="mailto:danirosillo1@gmail.com"
                   className="text-gn-primary hover:underline">
                  danirosillo1@gmail.com
                </a>
              </p>
              <p><span className="text-gn-text font-medium">Sitio web:</span> gamenook.es</p>
            </div>
          </section>

          <section>
            <h2 className="text-gn-text font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-gn-primary font-display text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>02</span>
              Objeto y naturaleza del sitio
            </h2>
            <p>
              GameNook es un proyecto personal sin ánimo de lucro, desarrollado con fines de
              ocio y aprendizaje. El sitio permite a los usuarios descubrir videojuegos, escribir
              reseñas y gestionar una biblioteca personal. No se comercializan productos ni
              servicios de ningún tipo.
            </p>
          </section>

          <section>
            <h2 className="text-gn-text font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-gn-primary font-display text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>03</span>
              Propiedad intelectual
            </h2>
            <p>
              Los textos, diseño e interfaz de GameNook son creación propia. La información
              sobre videojuegos (títulos, portadas, descripciones, valoraciones) se obtiene a
              través de la API de IGDB, propiedad de Twitch Interactive, Inc., y se utiliza de
              acuerdo con sus{' '}
              <a href="https://api-docs.igdb.com/#terms-of-use"
                 target="_blank" rel="noopener noreferrer"
                 className="text-gn-primary hover:underline">
                términos de uso
              </a>.
              Las marcas y logotipos de los videojuegos pertenecen a sus respectivos titulares.
            </p>
          </section>

          <section>
            <h2 className="text-gn-text font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-gn-primary font-display text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>04</span>
              Responsabilidad sobre los contenidos
            </h2>
            <p>
              Las reseñas y opiniones publicadas en GameNook son responsabilidad exclusiva de
              los usuarios que las redactan. El titular del sitio no se hace responsable de
              dichos contenidos, si bien se reserva el derecho a eliminar aquellos que
              vulneren la legalidad vigente o los derechos de terceros.
            </p>
          </section>

          <section>
            <h2 className="text-gn-text font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-gn-primary font-display text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>05</span>
              Legislación aplicable
            </h2>
            <p>
              Este aviso legal se rige por la normativa española vigente, en particular por la
              Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de
              Comercio Electrónico (LSSI-CE), y por el Reglamento (UE) 2016/679 (RGPD).
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}