// src/lib/auth.ts
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
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
              data: { avatar: user.image, name: user.name || existingUser.name }
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
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}