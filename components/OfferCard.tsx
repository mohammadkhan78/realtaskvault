'use client'

import React, { useRef, useState } from 'react'
import GlassCard from './GlassCard'
import { IndianRupee } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Offer = {
  id: string
  title: string
  description?: string
  reward: number
  is_premium?: boolean
}

export default function OfferCard({ offer }: { offer: Offer }) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const handleFilePick = () => fileRef.current?.click()

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setUploading(true)
    setMsg(null)

    const handle = typeof window !== 'undefined' ? localStorage.getItem('tv_handle') ?? null : null
    if (!handle) {
      setMsg('Please verify your Instagram handle first.')
      setUploading(false)
      return
    }

    const filePath = `proofs/${handle}/${Date.now()}_${f.name}`

    try {
      const { error: uploadError } = await supabase.storage.from('proofs').upload(filePath, f, {
        cacheControl: '3600',
        upsert: false,
      })

      if (uploadError) {
        console.error('upload error', uploadError)
        setMsg('Upload failed. Try again.')
        setUploading(false)
        return
      }

      const publicUrl = supabase.storage.from('proofs').getPublicUrl(filePath).data.publicUrl

      const { error: insertError } = await supabase.from('submissions').insert({
        user_handle: handle,
        offer_id: offer.id,
        proof_url: publicUrl,
        status: 'pending',
        created_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error('insert error', insertError)
        setMsg('Submission failed. Try again.')
      } else {
        setMsg('Submitted — awaiting admin approval.')
      }
    } catch (e) {
      console.error(e)
      setMsg('Something went wrong.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <GlassCard className="flex flex-col justify-between">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-gray-300">{offer.is_premium ? 'Premium' : 'Offer'}</div>
          <div className="font-semibold text-white">{offer.title}</div>
          {offer.description && <div className="text-xs text-gray-400 mt-1">{offer.description}</div>}
        </div>

        <div className="text-right">
          <div className="flex items-center gap-1 justify-end text-yellow-300 font-bold">
            <IndianRupee className="w-4 h-4" /> {offer.reward}
          </div>
          <div className="text-xs text-gray-400 mt-1">est. time</div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button onClick={handleFilePick} className="flex-1 bg-gradient-to-r from-yellow-400 to-emerald-400 text-slate-900 rounded-xl px-4 py-2 font-semibold transition hover:scale-[1.02]">
          {uploading ? 'Uploading...' : '📸 Submit Proof'}
        </button>

        <button onClick={() => setMsg('Open details (coming soon).')} className="bg-white/6 border border-white/10 rounded-xl px-3 py-2 text-sm">
          Details
        </button>
      </div>

      {msg && <div className="text-xs text-gray-300 mt-2">{msg}</div>}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
    </GlassCard>
  )
}
