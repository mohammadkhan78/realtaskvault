'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { IndianRupee } from 'lucide-react'
import BottomNav from '@/components/BottomNav'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function WithdrawalsPage() {
  const [method, setMethod] = useState<'upi'|'amazon'|'flipkart'|'googleplay'>('upi')
  const [upi, setUpi] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState<number | ''>('')
  const [msg, setMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [balance, setBalance] = useState<number>(0)

  useEffect(() => {
    const load = async () => {
      const handle = typeof window !== 'undefined' ? localStorage.getItem('tv_handle') : null
      if (!handle) return
      const { data, error } = await supabase.from('profiles').select('balance').eq('handle', handle).maybeSingle()
      if (error) {
        console.error('load profile', error)
        return
      }
      if (data?.balance !== undefined) setBalance(Number(data.balance))
    }
    load()
  }, [])

  const minAmount = 10

  const submit = async () => {
    setMsg(null)
    const handle = typeof window !== 'undefined' ? localStorage.getItem('tv_handle') : null
    if (!handle) { setMsg('Please verify your Instagram handle first.'); return }
    const amt = Number(amount)
    if (!amt || amt < minAmount) { setMsg(`Minimum amount is ₹${minAmount}`); return }
    if (amt > balance) { setMsg('Amount exceeds wallet balance'); return }

    if (method === 'upi' && !upi) { setMsg('Enter UPI ID'); return }
    if ((method === 'amazon' || method === 'flipkart' || method === 'googleplay') && (!email || !phone)) {
      setMsg('Enter email and phone for gift card delivery'); return
    }

    setSubmitting(true)
    try {
      // 1) Insert withdrawal request into DB (table: withdrawals_handle)
      const insertObj: any = {
        user_handle: handle,
        method,
        amount: amt,
        status: 'pending',
        created_at: new Date().toISOString()
      }
      if (method === 'upi') insertObj.upi_id = upi
      else { insertObj.email = email; insertObj.phone = phone }

      const { error: insertErr } = await supabase.from('withdrawals_handle').insert(insertObj)

      if (insertErr) {
        console.error('withdraw insert error', insertErr)
        setMsg('Request failed. Try again.')
        setSubmitting(false)
        return
      }

      // 2) Deduct the amount from profiles.balance (simple read -> update)
      const { data: profileData, error: pErr } = await supabase
        .from('profiles')
        .select('balance')
        .eq('handle', handle)
        .maybeSingle()

      if (pErr) {
        console.error('profile read error', pErr)
        setMsg('Request placed but failed to update balance. Contact admin.')
        setSubmitting(false)
        return
      }

      const current = Number(profileData?.balance ?? 0)
      const newBalance = +(current - amt).toFixed(2)

      const { error: updErr } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('handle', handle)

      if (updErr) {
        console.error('profile update error', updErr)
        setMsg('Request placed but failed to update balance. Contact admin.')
      } else {
        // success
        setMsg(method === 'upi'
          ? 'UPI request received — UPI transfers are processed after 2 days.'
          : 'Gift-card request received — you will receive the code in 4–5 hours via email.'
        )
        setBalance(newBalance)
        setAmount(''); setUpi(''); setEmail(''); setPhone('')
      }
    } catch (e) {
      console.error(e)
      setMsg('Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-tv p-4 pb-28">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="card-glass p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-300">Wallet balance</div>
              <div className="text-2xl font-bold flex items-center gap-2"><IndianRupee className="w-6 h-6"/>₹{balance.toFixed(2)}</div>
            </div>
            <div className="text-sm text-gray-400">Available</div>
          </div>
        </div>

        <div className="card-glass p-4">
          <h2 className="text-xl font-semibold">Request withdrawal</h2>
          <div className="mt-3 grid gap-3">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              <button onClick={()=>setMethod('upi')} className={`px-3 py-2 rounded-xl ${method==='upi' ? 'bg-white text-slate-900' : 'bg-white/5 text-gray-300'}`}>UPI</button>
              <button onClick={()=>setMethod('amazon')} className={`px-3 py-2 rounded-xl ${method==='amazon' ? 'bg-white text-slate-900' : 'bg-white/5 text-gray-300'}`}>🛍️ Amazon</button>
              <button onClick={()=>setMethod('flipkart')} className={`px-3 py-2 rounded-xl ${method==='flipkart' ? 'bg-white text-slate-900' : 'bg-white/5 text-gray-300'}`}>🧺 Flipkart</button>
              <button onClick={()=>setMethod('googleplay')} className={`px-3 py-2 rounded-xl ${method==='googleplay' ? 'bg-white text-slate-900' : 'bg-white/5 text-gray-300'}`}>▶️ Google Play</button>
            </div>

            <input
              value={amount}
              onChange={(e)=>setAmount(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Amount (₹)"
              className="w-full bg-transparent outline-none p-3 border border-white/10 rounded-xl placeholder-gray-400"
              type="number"
              min={minAmount}
            />

            {method === 'upi' ? (
              <div>
                <input value={upi} onChange={e=>setUpi(e.target.value)} placeholder="Your UPI ID (example@bank)" className="w-full bg-transparent outline-none p-3 border border-white/10 rounded-xl placeholder-gray-400" />
                <div className="text-xs text-gray-400 mt-2">⚠️ UPI transfers are processed after 2 days.</div>
              </div>
            ) : (
              <div className="grid gap-2">
                <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email for gift card" className="w-full bg-transparent outline-none p-3 border border-white/10 rounded-xl placeholder-gray-400" />
                <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Mobile number" className="w-full bg-transparent outline-none p-3 border border-white/10 rounded-xl placeholder-gray-400" />
                <div className="text-xs text-gray-400">✅ Gift codes will be emailed in 4–5 hours. If email was wrong, submit again.</div>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={submit} disabled={submitting} className="btn-primary flex-1 py-2 rounded-xl font-semibold">
                {submitting ? 'Requesting…' : 'Request Withdrawal'}
              </button>
            </div>

            {msg && <div className="text-sm text-gray-300">{msg}</div>}
          </div>
        </div>
      </div>

      <div className="fixed left-0 right-0 bottom-0">
        <BottomNav />
      </div>
    </div>
  )
}
