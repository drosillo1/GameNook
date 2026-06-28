// src/app/profile/page.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export default async function ProfileRedirectPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/auth/signin')

  const user = await prisma.user.findUnique({
    where:  { id: session.user.id },
    select: { username: true },
  })


  if (!user?.username) redirect('/onboarding')

  redirect(`/profile/${user.username}`)
}