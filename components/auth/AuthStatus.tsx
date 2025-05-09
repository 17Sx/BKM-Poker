'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthStatus() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  if (loading) {
    return <div className="text-white">Chargement...</div>
  }

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <>
          <div className="text-white">
            Connecté en tant que : <span className="font-bold">{user.email}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500/20 rounded-md hover:bg-red-500/30 transition-colors"
          >
            Se déconnecter
          </button>
        </>
      ) : (
        <div className="text-white">
          Non connecté
        </div>
      )}
    </div>
  )
} 