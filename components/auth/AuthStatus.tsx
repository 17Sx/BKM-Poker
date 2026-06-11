'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

interface AuthUser {
  email: string
}

export default function AuthStatus() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await authClient.getSession()
        setUser(data?.user ? { email: data.user.email } : null)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()
  }, [])

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      router.push('/auth')
      router.refresh()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return <div className="text-white">Loading...</div>
  }

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <div className="text-white">
            Signed in as: <span className="font-bold">{user.email}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500/20 rounded-md hover:bg-red-500/30 transition-colors"
          >
            Sign Out
          </button>
        </>
      ) : (
        <div className="text-white">
          Not signed in
        </div>
      )}
    </div>
  )
}
