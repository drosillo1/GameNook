// src/app/legal/privacidad/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Cómo GameNook trata tus datos personales.',
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
          Última actualización: octubre de 2026
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


              <div className="bg-gn-card border border-white/[0.06] rounded-xl p-5">
                <p className="text-gn-text font-medium mb-2">Analítica de uso</p>
                <p>
                  Utilizamos Vercel Analytics y Vercel Speed Insights para medir el tráfico y
                  el rendimiento del sitio. Estas herramientas recogen datos agregados y
                  anónimos —páginas visitadas, tipo de dispositivo, país y tiempos de carga—
                  sin usar cookies de seguimiento ni crear perfiles individuales.
                </p>
                <p className="mt-2">
                  <span className="text-gn-text font-medium">Base legal:</span> interés
                  legítimo en mantener y mejorar el servicio (art. 6.1.f RGPD).
                </p>
              </div>
            </div>
          </section>

          {/* Añadido oct 2026: los perfiles son contenido público e indexable, y
              el usuario tiene derecho a saberlo ANTES de registrarse. */}
          <section>
            <h2 className="text-gn-text font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-gn-primary font-display text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>03</span>
              Qué información tuya es pública
            </h2>
            <div className="bg-gn-card border border-white/[0.06] rounded-xl p-5 space-y-3">
              <p>
                GameNook es una plataforma de reseñas, así que parte de tu actividad es
                visible para cualquiera, incluidas personas sin cuenta:
              </p>
              <ul className="space-y-1.5 list-disc list-inside marker:text-gn-primary">
                <li>Tu nombre de usuario, tu nombre visible y tu avatar.</li>
                <li>Las reseñas que publicas y la puntuación que das a cada juego.</li>
                <li>Tu perfil público, accesible en <span className="text-gn-text">gamenook.es/profile/tu-usuario</span>.</li>
              </ul>
              <p>
                Tu perfil público <span className="text-gn-text font-medium">puede ser
                indexado por buscadores</span> como Google y aparecer en sus resultados.
              </p>
              <p>
                <span className="text-gn-text font-medium">Nunca es público:</span> tu
                dirección de correo electrónico, tu colección personal de juegos ni los
                juegos que sigues.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-gn-text font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-gn-primary font-display text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>04</span>
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
                    ['Supabase',        'Base de datos (usuarios, reseñas, colecciones)', 'UE (Frankfurt)'],
                    ['Vercel',          'Alojamiento y procesamiento del sitio',          'UE (Frankfurt) · empresa en EE. UU. (SCCs)'],
                    ['Vercel Analytics','Analítica de tráfico y rendimiento',             'EE. UU. (SCCs)'],
                    ['Google',          'Autenticación OAuth',                            'EE. UU. (SCCs)'],
                    ['Resend',          'Envío de magic links por email',                 'EE. UU. (SCCs)'],
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
              Desde agosto de 2026 el procesamiento del sitio se ejecuta en servidores
              de la Unión Europea (Frankfurt), junto a la base de datos.
            </p>
          </section>

          <section>
            <h2 className="text-gn-text font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-gn-primary font-display text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>05</span>
              Cuánto tiempo conservamos tus datos
            </h2>
            <p className="mb-4">
              Conservamos tus datos mientras mantengas una cuenta activa en GameNook. Si
              solicitas la eliminación de tu cuenta, borraremos tus datos personales en un
              plazo máximo de 30 días, salvo que la ley exija conservarlos durante más tiempo.
            </p>
            <div className="bg-gn-card border border-white/[0.06] rounded-xl p-5 space-y-2">
              <p className="text-gn-text font-medium">Qué ocurre al eliminar tu cuenta</p>
              <p>
                Se eliminan tu nombre, tu correo electrónico, tu avatar, tu colección de
                juegos, los juegos que sigues y tus datos de acceso.
              </p>
              <p>
                <span className="text-gn-text font-medium">Tus reseñas se conservan de forma
                anónima</span>, desvinculadas de tu identidad y mostradas como «Cuenta
                eliminada». El motivo es que forman parte del historial de valoraciones de la
                comunidad, que otras personas han leído y votado. Una vez anonimizadas no
                contienen ningún dato que permita identificarte.
              </p>
              <p>
                Si prefieres que tus reseñas se eliminen por completo, puedes borrarlas una a
                una antes de eliminar la cuenta, o pedírnoslo por correo.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-gn-text font-semibold text-base mb-3 flex items-center gap-2">
              <span className="text-gn-primary font-display text-xs" style={{ fontFamily: 'Orbitron, monospace' }}>06</span>
              Tus derechos
            </h2>
            <p className="mb-4">
              Como usuario, tienes derecho a acceder a tus datos, rectificarlos, suprimirlos,
              limitar u oponerte a su tratamiento y solicitar su portabilidad. Para ejercer
              cualquiera de ellos, escríbenos a{' '}
              <a href="mailto:danirosillo1@gmail.com"
                 className="text-gn-primary hover:underline">
                danirosillo1@gmail.com
              </a>{' '}
              indicando qué derecho quieres ejercer. Responderemos en el plazo máximo de un mes.
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