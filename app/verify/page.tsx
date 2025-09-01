'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import GlassCard from '@/components/GlassCard'
import { useRouter } from 'next/navigation'
import { Instagram } from 'lucide-react'   // 👈 added import

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function VerifyPage() {
  const [handle, setHandle] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const router = useRouter()

  const submit = async () => {
    const sanitized = handle.trim().replace(/^@/, '')
    if (!sanitized) {
      setMsg('⚠️ Enter your Instagram handle (without @).')
      return
    }

    setLoading(true)
    setMsg(null)

    // check if handle already exists
    const { data: existing, error: fetchError } = await supabase
      .from('verifications')
      .select('id, status')
      .eq('handle', sanitized)
      .maybeSingle()

    if (fetchError) {
      console.error(fetchError)
      setMsg('❌ Could not check — try again.')
      setLoading(false)
      return
    }

    if (!existing) {
      const { error } = await supabase.from('verifications').insert({
        handle: sanitized,
        status: 'pending',
      })

      if (error) {
        console.error(error)
        setMsg('❌ Could not submit — try again.')
        setLoading(false)
        return
      }
    }

    try {
      localStorage.setItem('tv_handle', sanitized)
    } catch (e) {}

    setMsg('⏳ Verification submitted. Check status page — redirecting...')
    setLoading(false)
    router.push('/status')
  }

  return (
    <div className="min-h-screen bg-tv flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full space-y-4">
        <h2 className="text-2xl font-bold">Verify your Instagram</h2>
        <p className="text-sm text-gray-300">
          Enter your Instagram handle to request verification. Our team will review it within 1–2 hours.
        </p>

        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
          <Instagram className="w-5 h-5 text-pink-400" /> {/* 👈 Instagram logo */}
          <input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder="your_handle (without @)"
            className="bg-transparent flex-1 outline-none text-white placeholder-gray-400"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={submit}
            disabled={loading}
            className="btn-primary w-full py-2 rounded-xl font-semibold"
          >
            {loading ? 'Submitting...' : 'Verify Handle'}
          </button>
        </div>

        {msg && <div className="text-sm text-gray-300">{msg}</div>}

        <div className="text-xs text-gray-400">
          <div>✅ Must be 18+</div>
          <div>💸 You can earn up to ₹200/day</div>
        </div>
      </GlassCard>
    </div>
  )
}

