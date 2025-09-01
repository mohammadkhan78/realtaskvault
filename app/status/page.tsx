'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import GlassCard from '@/components/GlassCard'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function StatusPage() {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [handle, setHandle] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const h = localStorage.getItem('tv_handle')
    if (!h) {
      router.push('/verify')
      return
    }
    setHandle(h)
    let stopped = false

    const check = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('verifications')
        .select('status,created_at')
        .eq('handle', h)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error(error)
        setStatus('error')
        setLoading(false)
        return
      }

      const row = (data && data[0]) || null
      const s = row ? row.status : 'pending'
      setStatus(s)
      setLoading(false)

      if (s === 'approved') {
        // small delay so user sees approval
        setTimeout(() => router.push('/offerwall'), 600)
        return
      }
    }

    // initial check
    check()

    // poll every 8 seconds while not approved
    const id = setInterval(() => {
      if (!stopped) check()
    }, 8000)

    return () => {
      stopped = true
      clearInterval(id)
    }
  }, [router])

  const resubmit = () => {
    localStorage.removeItem('tv_handle')
    router.push('/verify')
  }

  return (
    <div className="min-h-screen bg-tv flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full text-center space-y-4">
        <h2 className="text-2xl font-bold">Verification status</h2>

        {loading && <p className="text-gray-300">Checking verification… ⏳</p>}

        {!loading && status === 'pending' && (
          <>
            <p className="text-gray-300">Your handle <strong className="text-white">{handle}</strong> is under review.</p>
            <p className="text-sm text-gray-400">Please check back in 1–2 hours.</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => router.push('/verify')} className="btn-primary flex-1 py-2 rounded-xl">Edit handle</button>
              <button onClick={resubmit} className="bg-white/6 border border-white/10 rounded-xl px-3 py-2">Remove</button>
            </div>
          </>
        )}

        {!loading && status === 'approved' && (
          <>
            <p className="text-emerald-300 font-semibold">Approved ✅</p>
            <p className="text-gray-300">Redirecting to the Offerwall…</p>
          </>
        )}

        {!loading && status === 'rejected' && (
          <>
            <p className="text-rose-300 font-semibold">Rejected ❌</p>
            <p className="text-gray-300">You can resubmit a different handle.</p>
            <div className="mt-4">
              <button onClick={resubmit} className="btn-primary w-full py-2 rounded-xl">Resubmit handle</button>
            </div>
          </>
        )}

        {!loading && status === 'error' && (
          <p className="text-rose-300">An error occurred while checking your status.</p>
        )}
      </GlassCard>
    </div>
  )
}
