'use client'

import React from 'react'
import clsx from 'clsx'

type Props = {
  children: React.ReactNode
  className?: string
}

export default function GlassCard({ children, className }: Props) {
  return (
    <div
      className={clsx(
        'backdrop-blur-lg bg-white/6 border border-white/10 rounded-2xl p-4 shadow-sm transition duration-200 hover:scale-105 hover:shadow-lg',
        className
      )}
    >
      {children}
    </div>
  )
}
