
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/auth'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )
}
