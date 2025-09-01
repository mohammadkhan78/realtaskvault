'use client'

import React, { useState } from 'react'
import GlassCard from '@/components/GlassCard'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HomeTab() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function submitTicket() {
    setMsg(null)
    const handle =
      typeof window !== 'undefined'
        ? localStorage.getItem('tv_handle')
        : null

    if (!handle) {
      setMsg('Please verify your Instagram handle first.')
      return
    }
    if (!email || !message) {
      setMsg('Enter email and message')
      return
    }

    setSending(true)
    try {
      // ✅ get logged-in user properly
      const { data: authData } = await supabase.auth.getUser()
      const userId = authData?.user?.id ?? null

      if (userId) {
        const { error } = await supabase.from('support_tickets').insert({
          user_id: userId,
          subject: `From in-app: ${email}`,
          message,
          created_at: new Date().toISOString(),
        })
        if (error) throw error
      } else {
        // fallback: no supabase auth user, use handle instead
        const { error } = await supabase.from('support_requests').insert({
          user_handle: handle,
          email,
          message,
          created_at: new Date().toISOString(),
        })
        if (error) throw error
      }

      setMsg('✅ Sent — admin will reply to the email you provided.')
      setEmail('')
      setMessage('')
    } catch (e) {
      console.error(e)
      setMsg('❌ Could not send. Try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-tv p-4 flex flex-col">
      <div className="flex-1 max-w-3xl mx-auto space-y-6">
        <GlassCard>
          <h2 className="text-2xl font-bold">Is TaskVault legit?</h2>
          <p className="text-sm text-gray-300 mt-2">
            Yes — payouts are processed by admin after verification. We require
            a verified Instagram handle (1k+ followers) and admin approval for
            each task.
          </p>

          <div className="mt-4 grid gap-2 text-sm text-gray-300">
            <div>👥 Verified community: thousands of users</div>
            <div>💸 Real payouts — UPI & gift cards</div>
            <div>
              🔒 Secure: no password collection unless user opts in for premium
              bind
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold">Frequently asked questions</h3>
          <details className="mt-2 open:bg-white/6 p-3 rounded-lg">
            <summary className="cursor-pointer">How fast are payouts?</summary>
            <div className="mt-2 text-sm text-gray-300">
              UPI transfers are processed after 2 days. Gift cards within 4–5
              hours.
            </div>
          </details>
          <details className="mt-2 open:bg-white/6 p-3 rounded-lg">
            <summary className="cursor-pointer">What if my offer is pending?</summary>
            <div className="mt-2 text-sm text-gray-300">
              Admin verifies screenshots and approves or rejects within 1–2
              hours.
            </div>
          </details>
        </GlassCard>

        <GlassCard>
          <h3 className="font-semibold">Need help? Write to admin</h3>
          <p className="text-xs text-gray-400">
            Describe your issue and give an email — admin will contact you.
          </p>

          <div className="mt-3 space-y-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-transparent outline-none p-3 border border-white/10 rounded-xl placeholder-gray-400"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your issue..."
              className="w-full bg-transparent outline-none p-3 border border-white/10 rounded-xl placeholder-gray-400 h-28"
            />
            <div className="flex gap-2">
              <button
                onClick={submitTicket}
                disabled={sending}
                className="btn-primary flex-1 py-2 rounded-xl font-semibold"
              >
                {sending ? 'Sending…' : 'Send to admin 📩'}
              </button>
              <button
                onClick={() => router.push('/support')}
                className="bg-white/6 px-4 py-2 rounded-xl"
              >
                Open support page
              </button>
            </div>
            {msg && (
              <div className="text-sm text-gray-300 mt-2">{msg}</div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* ✅ Always fixed bottom nav */}
      <BottomNav />
    </div>
  )
}
