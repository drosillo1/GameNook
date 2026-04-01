// src/lib/auth.ts
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { createTransport } from "nodemailer"

// ── Email HTML template ────────────────────────────────────────
function getMagicLinkEmail(url: string, host: string) {
  const escapedHost = host.replace(/\./g, "&#8203;.")

  return {
    text: `Inicia sesión en GameNook\n\nHaz click en este enlace para entrar:\n${url}\n\nSi no solicitaste esto, ignora este email.`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#07070f;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#07070f;padding:40px 20px">
    <tr>
      <td align="center">
        <table width="480" cellpadding="0" cellspacing="0"
               style="background:#131323;border:1px solid rgba(255,255,255,0.06);
                      border-radius:16px;overflow:hidden;max-width:480px;width:100%">

          <!-- Header -->
          <tr>
            <td style="background:#0f0f1c;padding:28px 32px;
                       border-bottom:1px solid rgba(255,255,255,0.06)">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#e63946;border-radius:8px;
                             width:32px;height:32px;text-align:center;
                             vertical-align:middle;font-size:16px">
                    🎮
                  </td>
                  <td style="padding-left:10px">
                    <span style="font-size:18px;font-weight:900;color:#f1f0f8;
                                 letter-spacing:0.05em">
                      Game<span style="color:#e63946">Nook</span>
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px">
              <p style="margin:0 0 8px;font-size:11px;font-weight:600;
                        text-transform:uppercase;letter-spacing:0.15em;color:#e63946">
                // Acceso a la plataforma
              </p>
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:900;
                          color:#f1f0f8;line-height:1.2">
                Tu enlace de acceso
              </h1>
              <p style="margin:0 0 28px;font-size:14px;color:#8b8b9e;line-height:1.7">
                Haz click en el botón para iniciar sesión en
                <strong style="color:#f1f0f8">${escapedHost}</strong>.
                El enlace expira en <strong style="color:#f1f0f8">24 horas</strong>
                y solo puede usarse una vez.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <a href="${url}"
                       style="display:inline-block;background:#e63946;color:#ffffff;
                              text-decoration:none;font-size:14px;font-weight:700;
                              text-transform:uppercase;letter-spacing:0.1em;
                              padding:14px 36px;border-radius:8px;
                              box-shadow:0 4px 20px rgba(230,57,70,0.35)">
                      ▶ Entrar a GameNook
                    </a>
                  </td>
                </tr>
              </table>

              <!-- URL fallback -->
              <p style="margin:28px 0 0;font-size:12px;color:#8b8b9e;line-height:1.6">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:6px 0 0;font-size:11px;word-break:break-all;
                        color:#3a3a52">
                ${url}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06)">
              <p style="margin:0;font-size:11px;color:#3a3a52;line-height:1.6">
                Si no solicitaste este email, puedes ignorarlo con seguridad.
                Nadie ha accedido a tu cuenta.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }
}

// ── Auth options ───────────────────────────────────────────────
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    EmailProvider({
      from: process.env.AUTH_EMAIL_FROM!,
      // Usamos Resend via SMTP
      server: {
        host:   'smtp.resend.com',
        port:   465,
        secure: true,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY!,
        },
      },
      // Email personalizado con nuestro template
      async sendVerificationRequest({ identifier: email, url, provider }) {
        const { host } = new URL(url)
        const transport = createTransport(provider.server)
        const { text, html } = getMagicLinkEmail(url, host)

        await transport.sendMail({
          to:      email,
          from:    provider.from,
          subject: `Accede a GameNook — ${host}`,
          text,
          html,
        })
      },
    }),
  ],
  pages: {
    signIn:     '/auth/signin',
    verifyRequest: '/auth/verify-request',
    error:      '/auth/error',
  },
  session: {
    strategy: "database",
  },
  callbacks: {
    async session({ session, user }) {
      if (session?.user && user) {
        session.user.id   = user.id
        session.user.role = (user as any).role ?? 'USER'
        session.user.image = (user as any).avatar || session.user.image
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          if (!user.email) return false
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          })
          if (existingUser && user.image && existingUser.avatar !== user.image) {
            await prisma.user.update({
              where: { email: user.email },
              data:  { avatar: user.image, name: user.name || existingUser.name }
            })
          }
          return true
        } catch (error) {
          console.error("Error in signIn callback:", error)
          return false
        }
      }
      return true
    },
  },
  debug:  process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}