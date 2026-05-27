// src/app/legal/privacidad/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Cómo GameNook trata tus datos personales.',
  robots: { index: false },
}

export default function PrivacidadPage() {
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
          Política de Privacidad
        </h1>
        <p className="text-gn-muted text-sm mb-12">
          Última actualización: junio de 2025
        </p>

        <div className="space-y-10 text-gn-muted text-sm leading-relaxed">

          <section>
            <h2 className="text-gn-text font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-gn-primary font-display text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>01</span>
              Responsable del tratamiento
            </h2>
            <div className="bg-gn-card border border-white/[0.06] rounded-xl p-5 space-y-2">
              <p><span className="text-gn-text font-medium">Identidad:</span> Daniel Rosillo Barnés</p>
              <p><span className="text-gn-text font-medium">Contacto:</span>{' '}
                <a href="mailto:danirosillo1@gmail.com"
                   className="text-gn-primary hover:underline">
                  danirosillo1@gmail.com
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-gn-text font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-gn-primary font-display text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>02</span>
              Qué datos recogemos y por qué
            </h2>
            <div className="space-y-4">
              <div className="bg-gn-card border border-white/[0.06] rounded-xl p-5">
                <p className="text-gn-text font-medium mb-2">Registro con Google OAuth</p>
                <p>
                  Cuando inicias sesión con Google, recibimos tu nombre, dirección de correo
                  electrónico e imagen de perfil. Estos datos se almacenan para identificarte
                  en la plataforma y asociar tus reseñas y colección a tu cuenta.
                </p>
                <p className="mt-2">
                  <span className="text-gn-text font-medium">Base legal:</span> ejecución de
                  la relación contractual (art. 6.1.b RGPD).
                </p>
              </div>

              <div className="bg-gn-card border border-white/[0.06] rounded-xl p-5">
                <p className="text-gn-text font-medium mb-2">Magic Link (acceso por email)</p>
                <p>
                  Si eliges acceder mediante enlace mágico, introducirás tu email. Lo usamos
                  exclusivamente para enviarte el enlace de acceso a través de Resend.
                  No lo compartimos con terceros ni lo usamos para comunicaciones comerciales.
                </p>
                <p className="mt-2">
                  <span className="text-gn-text font-medium">Base legal:</span> ejecución de
                  la relación contractual (art. 6.1.b RGPD).
                </p>
              </div>

              <div className="bg-gn-card border border-white/[0.06] rounded-xl p-5">
                <p className="text-gn-text font-medium mb-2">Contenido generado por el usuario</p>
                <p>
                  Las reseñas que publicas y los juegos que añades a tu colección se almacenan
                  en nuestra base de datos para que el servicio funcione correctamente.
                </p>
                <p className="mt-2">
                  <span className="text-gn-text font-medium">Base legal:</span> ejecución de
                  la relación contractual (art. 6.1.b RGPD).
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-gn-text font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-gn-primary font-display text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>03</span>
              Proveedores de servicio (encargados del tratamiento)
            </h2>
            <p className="mb-4">
              Para prestar el servicio trabajamos con los siguientes proveedores, con quienes
              compartimos únicamente los datos estrictamente necesarios:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08]">
                    <th className="text-left text-gn-text py-2 pr-4 font-semibold">Proveedor</th>
                    <th className="text-left text-gn-text py-2 pr-4 font-semibold">Finalidad</th>
                    <th className="text-left text-gn-text py-2 font-semibold">Ubicación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {[
                    ['Supabase',  'Base de datos (almacenamiento de usuarios, reseñas, colecciones)', 'UE (Frankfurt)'],
                    ['Google',    'Autenticación OAuth', 'EE. UU. (SCCs)'],
                    ['Resend',    'Envío de magic links por email', 'EE. UU. (SCCs)'],
                    ['Vercel',    'Alojamiento web', 'EE. UU. (SCCs)'],
                  ].map(([provider, purpose, location]) => (
                    <tr key={provider}>
                      <td className="py-2.5 pr-4 text-gn-text font-medium">{provider}</td>
                      <td className="py-2.5 pr-4">{purpose}</td>
                      <td className="py-2.5 text-gn-subtle">{location}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-gn-subtle">
              SCCs = Cláusulas Contractuales Estándar de la Comisión Europea,
              garantía válida para transferencias internacionales según el RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-gn-text font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-gn-primary font-display text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>04</span>
              Cuánto tiempo conservamos tus datos
            </h2>
            <p>
              Conservamos tus datos mientras mantengas una cuenta activa en GameNook. Si
              solicitas la eliminación de tu cuenta, borraremos tus datos personales en un
              plazo máximo de 30 días, salvo que la ley exija conservarlos durante más tiempo.
              Las reseñas publicadas podrán anonimizarse en lugar de eliminarse para mantener
              la coherencia del historial de la comunidad.
            </p>
          </section>

          <section>
            <h2 className="text-gn-text font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-gn-primary font-display text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>05</span>
              Tus derechos
            </h2>
            <p className="mb-4">
              Como usuario, tienes derecho a acceder, rectificar, suprimir, oponerte al
              tratamiento y solicitar la portabilidad de tus datos. Para ejercerlos,
              escríbenos a{' '}
              <a href="mailto:danirosillo1@gmail.com"
                 className="text-gn-primary hover:underline">
                danirosillo1@gmail.com
              </a>.
            </p>
            <p>
              También puedes presentar una reclamación ante la Agencia Española de Protección
              de Datos (
              <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer"
                 className="text-gn-primary hover:underline">
                aepd.es
              </a>
              ) si consideras que el tratamiento de tus datos no es conforme al RGPD.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}