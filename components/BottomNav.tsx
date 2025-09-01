'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

export default function BottomNav() {
  const path = usePathname() || '/'

  const item = (href: string, label: string, emoji: string) => {
    const active = path === href
    return (
      <Link href={href} className={`${active ? 'font-semibold text-white' : 'text-gray-300'} text-sm flex flex-col items-center gap-1`}>
        <span aria-hidden>{emoji}</span>
        <span className="text-[11px]">{label}</span>
      </Link>
    )
  }

  return (
    <nav className="fixed left-0 right-0 bottom-0 bg-white/5 backdrop-blur p-3 border-t border-white/10">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        {item('/home', 'Home', '🏠')}
        {item('/offerwall', 'Offers', '🎁')}
        {item('/premium', 'Higher Pay', '💸')}
        {item('/withdrawals', 'Withdraw', '💰')}
      </div>
    </nav>
  )
}

