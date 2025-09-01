'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Crown } from 'lucide-react'
import WalletBar from '@/components/WalletBar'
import OfferCard from '@/components/OfferCard'
import GlassCard from '@/components/GlassCard'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

type Offer = {
  id: string
  title: string
  description?: string
  reward: number
  is_premium?: boolean
}

export default function PremiumPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(true)
  const [hasApprovedTask, setHasApprovedTask] = useState(false)
  const [isBound, setIsBound] = useState(false)
  const [handle, setHandle] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      setChecking(true)
      setErrorMsg(null)
      setOffers([])

      // 1) must have tv_handle stored locally
      const localHandle = typeof window !== 'undefined' ? localStorage.getItem('tv_handle') : null
      if (!localHandle) {
        setErrorMsg('You must verify your Instagram handle first.')
        setChecking(false)
        setLoading(false)
        return
      }
      setHandle(localHandle)

      try {
        // ----- 2) count approved submissions (try user_handle first) -----
        let approvedCount = 0
        try {
          const { data: subsByHandle, error: subsErr } = await supabase
            .from('submissions')
            .select('id')
            .eq('user_handle', localHandle)
            .eq('status', 'approved')
          if (!subsErr && Array.isArray(subsByHandle)) approvedCount = subsByHandle.length
        } catch (e) {
          console.warn('submissions by user_handle failed:', e)
        }

        // fallback: if submissions use user_id, look up profile id and count
        if (approvedCount === 0) {
          try {
            const { data: profile, error: profileErr } = await supabase
              .from('profiles')
              .select('id')
              .eq('handle', localHandle)
              .maybeSingle()
            if (!profileErr && profile?.id) {
              const { data: subsById, error: subsErr2 } = await supabase
                .from('submissions')
                .select('id')
                .eq('user_id', profile.id)
                .eq('status', 'approved')
              if (!subsErr2 && Array.isArray(subsById)) approvedCount = subsById.length
            }
          } catch (e) {
            console.warn('submissions by user_id fallback failed:', e)
          }
        }

        setHasApprovedTask(approvedCount >= 1)

        // ----- 3) check account binding (primary lookup by user_handle) -----
        let bound = false

        try {
          const { data: bindRow, error: bindErr } = await supabase
            .from('account_binds')
            .select('id, status, step, created_at')
            .eq('user_handle', localHandle)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

          if (!bindErr && bindRow) {
            // Only treat as bound if:
            // - status === 'approved' OR
            // - status === 'approved1' AND step >= 2
            if (bindRow.status === 'approved') bound = true
            else if (bindRow.status === 'approved1' && Number(bindRow.step) >= 2) bound = true
          }
        } catch (e) {
          console.warn('account_binds lookup by handle failed:', e)
        }

        // fallback: maybe admin keyed binds by profile id instead — try that only if not yet bound
        if (!bound) {
          try {
            const { data: profile, error: profileErr } = await supabase
              .from('profiles')
              .select('id')
              .eq('handle', localHandle)
              .maybeSingle()

            if (!profileErr && profile?.id) {
              const { data: bindRow2, error: bindErr2 } = await supabase
                .from('account_binds')
                .select('id, status, step, created_at')
                .eq('user_id', profile.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

              if (!bindErr2 && bindRow2) {
                if (bindRow2.status === 'approved') bound = true
                else if (bindRow2.status === 'approved1' && Number(bindRow2.step) >= 2) bound = true
              }
            }
          } catch (e) {
            console.warn('account_binds lookup by profile id failed:', e)
          }
        }

        setIsBound(bound)

        // ----- 4) If both requirements met → fetch premium offers -----
        if (approvedCount >= 1 && bound) {
          const { data: offersData, error: offersErr } = await supabase
            .from('offers')
            .select('*')
            .eq('is_premium', true)
            .eq('active', true)
            .order('created_at', { ascending: false })

          if (offersErr) {
            console.error('offers fetch error', offersErr)
            setErrorMsg('Could not load premium offers.')
          } else {
            setOffers((offersData as Offer[]) ?? [])
          }
        }
      } catch (e) {
        console.error('premium init error', e)
        setErrorMsg('Something went wrong. Try again later.')
      } finally {
        setChecking(false)
        setLoading(false)
      }
    }

    init()
    // run once
  }, [])

  // UI helpers
  if (checking) {
    return (
      <div className="min-h-screen bg-tv flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full text-center">
          <div>Checking premium access… ⏳</div>
        </GlassCard>
      </div>
    )
  }

  // Not verified / no handle saved
  if (!handle) {
    return (
      <div className="min-h-screen bg-tv flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full text-center">
          <h3 className="text-xl font-semibold">Premium locked</h3>
          <p className="text-gray-300">You need a verified Instagram handle to access Premium offers.</p>
          <div className="mt-4 flex gap-2">
            <button onClick={() => router.push('/verify')} className="btn-primary w-full py-2 rounded-xl">Verify Handle</button>
          </div>
        </GlassCard>
      </div>
    )
  }

  // Handle present but missing requirements
  if (!hasApprovedTask || !isBound) {
    return (
      <div className="min-h-screen bg-tv p-4">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-400" /> Premium Offers ✨
            </h1>
            <div className="text-sm text-gray-300">Handle: <span className="text-white">{handle}</span></div>
          </div>

          <GlassCard>
            <div className="space-y-3 text-center">
              {!hasApprovedTask && (
                <>
                  <div className="font-semibold">Complete one approved task</div>
                  <div className="text-sm text-gray-300">To unlock Premium you must complete one task and have it approved by admin.</div>
                  <div className="mt-3">
                    <button onClick={() => router.push('/offerwall')} className="btn-primary px-6 py-2 rounded-xl">Go to Offers</button>
                  </div>
                </>
              )}

              {!isBound && (
                <>
                  <div className="font-semibold">Bind your account</div>
                  <div className="text-sm text-gray-300">Once you bind your Instagram account and admin approves it, Premium unlocks.</div>
                  <div className="mt-3">
                    <button onClick={() => router.push('/auth/bind')} className="btn-primary px-6 py-2 rounded-xl">Bind Account</button>
                  </div>
                </>
              )}

              <div className="text-xs text-gray-400 mt-3">If you already submitted a bind request, wait 1–2 hours for admin to review.</div>
            </div>
          </GlassCard>
        </div>

        {/* Bottom nav */}
        <div className="fixed left-0 right-0 bottom-0 bg-white/5 backdrop-blur p-3 border-t border-white/10">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <Link href="/home" className="text-sm">🏠 Home</Link>
            <Link href="/offerwall" className="text-sm">🎁 Offers</Link>
            <Link href="/premium" className="text-sm font-semibold">💸 Higher Pay</Link>
            <Link href="/withdrawals" className="text-sm">💰 Withdraw</Link>
          </div>
        </div>
      </div>
    )
  }

  // Finally: user is eligible — show premium offers (keep styling like Offerwall)
  return (
    <div className="min-h-screen bg-tv pb-24">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <WalletBar />

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400" /> Premium Offers ✨
          </h1>
          <div className="text-sm text-gray-300">Exclusive tasks — higher payouts</div>
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="text-gray-300">Loading offers…</div>
          ) : offers.length === 0 ? (
            <div className="text-gray-300">No premium offers available yet.</div>
          ) : (
            offers.map((o) => <OfferCard key={o.id} offer={o} />)
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="fixed left-0 right-0 bottom-0 bg-white/5 backdrop-blur p-3 border-t border-white/10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/home" className="text-sm">🏠 Home</Link>
          <Link href="/offerwall" className="text-sm">🎁 Offers</Link>
          <Link href="/premium" className="text-sm font-semibold">💸 Higher Pay</Link>
          <Link href="/withdrawals" className="text-sm">💰 Withdraw</Link>
        </div>
      </div>
    </div>
  )
}
