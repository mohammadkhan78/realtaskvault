'use client'

import React, { useEffect, useState } from 'react'
import { IndianRupee } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function WalletBar({ className = '' }: { className?: string }) {
  const [balance, setBalance] = useState<number | null>(null)
  const [completedCount, setCompletedCount] = useState<number>(0)
  const [pendingCount, setPendingCount] = useState<number>(0)

  useEffect(() => {
    const load = async () => {
      try {
        const handle = typeof window !== 'undefined' ? localStorage.getItem('tv_handle') : null
        if (!handle) return

        const { data: profile } = await supabase.from('profiles').select('balance').eq('handle', handle).maybeSingle()
        if (profile?.balance !== undefined) setBalance(Number(profile.balance))

        const { data: approved } = await supabase.from('submissions').select('id', { count: 'exact' }).eq('status', 'approved').eq('user_handle', handle)
        const { data: pending } = await supabase.from('submissions').select('id', { count: 'exact' }).eq('status', 'pending').eq('user_handle', handle)

        setCompletedCount((approved as any)?.length ?? 0)
        setPendingCount((pending as any)?.length ?? 0)
      } catch (e) {
        console.error('WalletBar load error', e)
      }
    }
    load()
  }, [])

  return (
    <div className={`w-full card-glass px-4 py-3 ${className}`}>
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg p-2 bg-white/5 grid place-items-center">
            <IndianRupee className="w-5 h-5 text-yellow-300" />
          </div>
          <div>
            <div className="text-xs text-gray-300">Wallet balance</div>
            <div className="font-semibold text-lg">{balance !== null ? <>₹{balance.toFixed(2)}</> : '₹0.00'}</div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-sm text-gray-300">
          <div className="bg-white/5 px-3 py-1 rounded-full text-xs">✅ Completed: <span className="font-semibold text-white">{completedCount}</span></div>
          <div className="bg-white/5 px-3 py-1 rounded-full text-xs">⏳ Pending: <span className="font-semibold text-white">{pendingCount}</span></div>
        </div>
      </div>
    </div>
  )
}
