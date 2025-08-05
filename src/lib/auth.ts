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
        session.user.id = user.id;
        // Asegurar que la imagen se incluya en la sesión
        session.user.image = (user as any).avatar || session.user.image;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Verificar que el email existe
          if (!user.email) {
            console.error("No email provided by Google")
            return false;
          }

          // Buscar si el usuario ya existe
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          });

          // Si el usuario existe, actualizar su avatar si es necesario
          if (existingUser && user.image && existingUser.avatar !== user.image) {
            await prisma.user.update({
              where: { email: user.email },
              data: { 
                avatar: user.image,
                name: user.name || existingUser.name
              }
            });
          }
          
          return true;
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return false;
        }
      }
      return true;
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}