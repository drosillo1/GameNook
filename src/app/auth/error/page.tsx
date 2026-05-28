// src/app/auth/error/page.tsx
import { Suspense } from 'react'
import AuthErrorClient from './AuthErrorClient'

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gn-bg flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gn-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AuthErrorClient />
    </Suspense>
  )
}