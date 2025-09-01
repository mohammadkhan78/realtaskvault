'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import WalletBar from '@/components/WalletBar'
import OfferCard from '@/components/OfferCard'
import GlassCard from '@/components/GlassCard'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Offer = {
  id: string
  title: string
  description?: string
  reward: number
  active: boolean
  created_at: string
  is_premium?: boolean
}

type Submission = {
  id: string
  offer_id: string
  status: 'pending' | 'approved' | 'rejected'
  proof_url: string
  user_handle: string
  created_at: string
}

export default function OfferwallPage() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [approvedCount, setApprovedCount] = useState(0)
  const [isBound, setIsBound] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const [checking, setChecking] = useState(true)
  const [handle, setHandle] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)

  const router = useRouter()

  // read handle & verify access
  useEffect(() => {
    const h = typeof window !== 'undefined' ? localStorage.getItem('tv_handle') : null
    if (!h) {
      setHandle(null)
      setVerified(false)
      setChecking(false)
      return
    }
    setHandle(h)

    const checkVerification = async () => {
      try {
        const { data, error } = await supabase
          .from('verifications')
          .select('status')
          .eq('handle', h)
          .order('created_at', { ascending: false })
          .limit(1)

        if (error) {
          console.error(error)
          setVerified(false)
        } else {
          const row = (data && (data as any)[0]) || null
          setVerified(row?.status === 'approved')
        }
      } catch (e) {
        console.error(e)
        setVerified(false)
      } finally {
        setChecking(false)
      }
    }

    checkVerification()
  }, [])

  // load offers + submissions after verified
  useEffect(() => {
    const load = async () => {
      if (!verified || !handle) return
      setLoading(true)
      try {
        // Load offers (active only)
        const { data: offersData, error: offersError } = await supabase
          .from('offers')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: false })

        if (offersError) console.error('offers load error', offersError)
        setOffers((offersData as Offer[] | null) ?? [])

        // Load submissions for this verified handle (handle-based)
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('submissions')
          .select('*')
          .eq('user_handle', handle)

        if (submissionsError) console.error('submissions load error', submissionsError)
        setSubmissions((submissionsData as Submission[] | null) ?? [])

        // Approved count
        const approved = (submissionsData ?? []).filter((s: any) => s.status === 'approved')
        setApprovedCount(approved.length)

        // isBound mirrors verified status
        setIsBound(true)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [verified, handle])

  // Apply filter based on submissions
  const filteredOffers = offers.filter(o => {
    if (filter === 'all') return true
    const sub = submissions.find(s => String(s.offer_id) === String(o.id))
    return sub?.status === filter
  })

  // only non-premium for main offerwall (null/undefined treated as false)
  const normalOffers = filteredOffers.filter(o => !o.is_premium)
  const premiumOffers = filteredOffers.filter(o => o.is_premium)

  if (checking) {
    return (
      <div className="min-h-screen bg-tv flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full text-center">
          <p className="text-gray-300">Checking your verification… ⏳</p>
        </GlassCard>
      </div>
    )
  }

  if (!handle || !verified) {
    return (
      <div className="min-h-screen bg-tv flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full text-center">
          <h3 className="text-xl font-semibold">Offerwall locked</h3>
          <p className="text-gray-300">You need an approved Instagram handle to access offers.</p>
          <div className="mt-4">
            <button onClick={() => router.push('/verify')} className="btn-primary w-full py-2 rounded-xl">
              Verify your handle
            </button>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-tv pb-24">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <WalletBar />

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Offerwall</h2>
          <div className="text-sm text-gray-300">Handle: <span className="text-white">{handle}</span></div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {(['all','pending','approved','rejected'] as const).map(k => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1 rounded-full text-xs ${filter === k ? 'bg-white text-slate-900' : 'bg-white/5 text-gray-300'}`}
            >
              {k.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {loading ? (
            <div className="text-gray-300">Loading offers…</div>
          ) : normalOffers.length > 0 ? (
            normalOffers.map(o => <OfferCard key={o.id} offer={o} />)
          ) : (
            <div className="text-gray-400 text-sm">No offers available right now.</div>
          )}
        </div>

        {premiumOffers.length > 0 && (
          <div className="mt-4">
            {approvedCount >= 1 && isBound ? (
              <Link href="/premium" className="block btn-primary text-center py-3 rounded-xl font-semibold">
                Open Premium Offers
              </Link>
            ) : (
              <div className="card-glass p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">Premium offers locked</div>
                  <div className="text-xs text-gray-300">Complete 1 approved task & verify your Instagram to unlock</div>
                </div>
                <Link href="/premium" className="bg-white/6 px-3 py-2 rounded-xl flex items-center gap-2">Unlock</Link>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="fixed left-0 right-0 bottom-0 bg-white/5 backdrop-blur p-3 border-t border-white/10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/home" className="text-sm">🏠 Home</Link>
          <Link href="/offerwall" className="text-sm font-semibold">🎁 Offers</Link>
          <Link href="/premium" className="text-sm">💸 Higher Pay</Link>
          <Link href="/withdrawals" className="text-sm">💰 Withdraw</Link>
        </div>
      </div>
    </div>
  )
}
