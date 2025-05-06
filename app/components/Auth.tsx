'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

type AuthMode = 'login' | 'register' | 'reset'

export function Auth() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'register') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })
        if (error) throw error
        router.push('/verify')
      } else if (mode === 'login') {
        console.log('Attempting sign in...')
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })
        if (error) {
          console.error('Sign in error:', error)
          throw error
        }
        console.log('Sign in successful:', data)
        router.refresh()
        router.push('/')
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        })
        if (error) throw error
        setResetSent(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">
          {mode === 'login' ? 'Sign in to your account' : 
           mode === 'register' ? 'Create your account' : 
           'Reset your password'}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        {error && (
          <div className="mb-4 p-4 text-sm text-red-800 rounded-lg bg-red-50">
            {error}
          </div>
        )}

        {resetSent && mode === 'reset' && (
          <div className="mb-4 p-4 text-sm text-green-800 rounded-lg bg-green-50">
            Check your email for password reset instructions
          </div>
        )}

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>

        {mode !== 'reset' && (
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
        )}

        {mode === 'register' && (
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          >
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Sign Up' : 'Reset Password'}
          </button>
          
          {mode === 'login' && (
            <button
              type="button"
              onClick={() => setMode('reset')}
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            >
              Forgot Password?
            </button>
          )}
        </div>
      </form>

      <div className="text-center">
        {mode === 'login' ? (
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <button
              onClick={() => setMode('register')}
              className="text-blue-500 hover:text-blue-800 font-bold"
            >
              Sign Up
            </button>
          </p>
        ) : mode === 'register' ? (
          <p className="text-gray-600 text-sm">
            Already have an account?{' '}
            <button
              onClick={() => setMode('login')}
              className="text-blue-500 hover:text-blue-800 font-bold"
            >
              Sign In
            </button>
          </p>
        ) : (
          <button
            onClick={() => setMode('login')}
            className="text-blue-500 hover:text-blue-800 font-bold text-sm"
          >
            Back to Sign In
          </button>
        )}
      </div>
    </div>
  )
} 