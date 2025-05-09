'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { User, Key, ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSignUp, setIsSignUp] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        console.error('Sign up error:', error)
        throw error
      }

      if (data?.user) {
        setMessage('Registration successful! Please check your email to confirm your account.')
        setTimeout(() => {
          router.push('/auth?message=check-email')
        }, 2000)
      }
    } catch (error: any) {
      setMessage(error.message || 'An error occurred during registration')
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data?.session) {
        setMessage('Login successful! Redirecting...')
        
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          window.location.replace('/dashboard')
        } else {
          throw new Error('Session not established')
        }
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setMessage(error.message || 'An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background/0 blur-3xl -z-10" />
      
      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-white mb-2">
            Welcome to BKM Poker
          </h2>
          <p className="text-xl text-gray-400">
            {isSignUp ? 'Create your account to get started' : 'Sign in to your account'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={isSignUp ? handleSignUp : handleSignIn}>
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={24} strokeWidth={1.5} className="text-gray-400 z-20" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full pl-10 pr-3 py-3 text-white border border-gray-600 rounded-lg bg-gray-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Key size={24} strokeWidth={1.5} className="text-gray-400 z-20" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="block w-full pl-10 pr-12 py-3 text-white border border-gray-600 rounded-lg bg-gray-800/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
              >
                {showPassword ? (
                  <EyeOff size={20} strokeWidth={1.5} className="z-20" />
                ) : (
                  <Eye size={20} strokeWidth={1.5} className="z-20" />
                )}
              </button>
            </div>
          </div>

          {message && (
            <div className={`p-4 text-sm text-center rounded-lg backdrop-blur-sm transition-all duration-200 ${
              message.includes('successful') ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="flex flex-col space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="relative w-full px-4 py-3 text-white bg-primary/20 rounded-lg overflow-hidden group hover:bg-primary/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
                {!loading && <ArrowRight size={18} strokeWidth={1.5} />}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setMessage('')
              }}
              className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Don\'t have an account? Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 