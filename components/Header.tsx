'use client'

import Link from 'next/link'
import Button from './ui/button'
import Nav from './ui/Nav'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
      setUserEmail(user?.email || null)
    }

    checkUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session?.user)
      setUserEmail(session?.user?.email || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <header className="fixed top-5 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-white text-xl font-bold opacity-80 hover:opacity-10 transition-all duration-200">
            BKM
          </Link>

          <div className={`absolute left-1/2 transform -translate-x-1/2 transition-all duration-300 ${isScrolled ? 'scale-90' : 'scale-100'}`}>
            <Nav 
              items={[
                {
                  label: "Home",
                  href: "/"
                },
                {
                  label: "Dashboard",
                  href: "/dashboard"
                },
                {
                  label: "History",
                  href: "/history"
                },
                {
                  label: "About",
                  href: "/about"
                }
              ]} 
            />
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  {userEmail}
                </span>
                <Button 
                  onClick={handleSignOut}
                  className='max-h-8' 
                  variant="secondary"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/auth">
                  <Button className='max-h-8' variant="secondary">Login</Button>
                </Link>
                <Link href="/auth?signup=true">
                  <Button className='max-h-8' variant="outline">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
