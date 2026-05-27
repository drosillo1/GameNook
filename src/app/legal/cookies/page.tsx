// src/app/legal/cookies/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Cookies',
  description: 'Información sobre las cookies que utiliza GameNook.',
  robots: { index: false },
}

export default function CookiesPage() {
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
          Política de Cookies
        </h1>
        <p className="text-gn-muted text-sm mb-12">
          Última actualización: junio de 2025
        </p>

        <div className="space-y-10 text-gn-muted text-sm leading-relaxed">

          <section>
            <h2 className="text-gn-text font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-gn-primary font-display text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>01</span>
              Qué es una cookie
            </h2>
            <p>
              Una cookie es un pequeño fichero de texto que un sitio web almacena en tu
              navegador cuando lo visitas. Permite que el sitio recuerde información entre
              visitas, como si has iniciado sesión.
            </p>
          </section>

          <section>
            <h2 className="text-gn-text font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-gn-primary font-display text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>02</span>
              Cookies que utiliza GameNook
            </h2>
            <p className="mb-4">
              GameNook utiliza <strong className="text-gn-text">únicamente cookies técnicas y
              estrictamente necesarias</strong> para el funcionamiento del servicio. No
              utilizamos cookies de publicidad ni de seguimiento de terceros.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left text-gn-text py-2 pr-4 font-semibold">Cookie</th>
                    <th className="text-left text-gn-text py-2 pr-4 font-semibold">Finalidad</th>
                    <th className="text-left text-gn-text py-2 pr-4 font-semibold">Tipo</th>
                    <th className="text-left text-gn-text py-2 font-semibold">Duración</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[
                    ['next-auth.session-token', 'Mantiene tu sesión iniciada', 'Técnica / necesaria', '30 días'],
                    ['next-auth.csrf-token',    'Protección contra ataques CSRF', 'Técnica / necesaria', 'Sesión'],
                    ['next-auth.callback-url',  'Redirige correctamente tras el login', 'Técnica / necesaria', 'Sesión'],
                    ['gn-cookie-consent',       'Recuerda que has aceptado esta política', 'Técnica / necesaria', '1 año'],
                  ].map(([name, purpose, type, duration]) => (
                    <tr key={name}>
                      <td className="py-2.5 pr-4 font-mono text-gn-primary text-[11px]">{name}</td>
                      <td className="py-2.5 pr-4">{purpose}</td>
                      <td className="py-2.5 pr-4 text-gn-subtle">{type}</td>
                      <td className="py-2.5 text-gn-subtle">{duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-gn-text font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-gn-primary font-display text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>03</span>
              ¿Necesito tu consentimiento?
            </h2>
            <p>
              Las cookies técnicas y estrictamente necesarias están exentas del requisito de
              consentimiento según el art. 22.2 de la LSSI y las directrices de la AEPD.
              Aun así, te informamos de su existencia y te mostramos este aviso para que
              puedas tomar decisiones informadas.
            </p>
          </section>

          <section>
            <h2 className="text-gn-text font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-gn-primary font-display text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>04</span>
              Cómo desactivar las cookies
            </h2>
            <p className="mb-3">
              Puedes configurar tu navegador para bloquear o eliminar cookies. Ten en cuenta
              que si bloqueas las cookies técnicas, no podrás iniciar sesión en GameNook.
            </p>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { name: 'Chrome',  url: 'https://support.google.com/chrome/answer/95647' },
                { name: 'Firefox', url: 'https://support.mozilla.org/es/kb/cookies-informacion-que-los-sitios-web-guardan-en-' },
                { name: 'Safari',  url: 'https://support.apple.com/es-es/guide/safari/sfri11471/mac' },
                { name: 'Edge',    url: 'https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies-168dab11-0753-043d-7c16-ede5947fc64d' },
              ].map(b => (
                <a
                  key={b.name}
                  href={b.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gn-card border border-white/[0.06]
                             hover:border-gn-primary/30 text-gn-muted hover:text-gn-primary
                             rounded-lg transition-colors"
                >
                  {b.name}
                </a>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-gn-text font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-gn-primary font-display text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>05</span>
              Contacto
            </h2>
            <p>
              Si tienes dudas sobre el uso de cookies en GameNook, puedes escribirnos a{' '}
              <a href="mailto:danirosillo1@gmail.com"
                 className="text-gn-primary hover:underline">
                danirosillo1@gmail.com
              </a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}