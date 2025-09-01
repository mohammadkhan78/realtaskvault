'use client'

import Link from 'next/link'
import { Users, Star } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="w-full card-glass border-0 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-400 to-emerald-400 grid place-items-center font-black text-slate-900">
            TV
          </div>
          <div className="font-semibold tracking-wide">Task<span className="text-yellow-400">Vault</span></div>
        </div>

        <nav className="hidden md:flex items-center gap-4 text-sm text-gray-300">
          <Link href="/offerwall" className="hover:text-white">Offers</Link>
          <Link href="/withdrawals" className="hover:text-white">Withdraw</Link>
          <Link href="/support" className="hover:text-white">Support</Link>
        </nav>

        <div className="flex items-center gap-2">
          <button className="rounded-xl px-3 py-1.5 bg-white/10 border border-white/10">Log in</button>
          <button className="rounded-xl px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-emerald-400 text-slate-900 font-semibold">Sign up</button>
        </div>
      </div>
    </header>
  )
}

