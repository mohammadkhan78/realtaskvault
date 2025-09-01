'use client'

import { motion } from 'framer-motion'
import GlassCard from '@/components/GlassCard'
import Navbar from '@/components/Navbar'
import { IndianRupee, Users, Star, Instagram, TrendingUp } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import React from 'react'

const spark = [
  { x: 1, y: 200 }, { x: 2, y: 260 }, { x: 3, y: 240 },
  { x: 4, y: 320 }, { x: 5, y: 400 }, { x: 6, y: 380 }, { x: 7, y: 460 }
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-tv text-white">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Top stats */}
        <div className="flex flex-col gap-4">
          {/* Logo / Hero */}
          <div className="flex flex-col items-start gap-3">
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-5xl font-extrabold leading-tight"
            >
              Complete Instagram tasks. <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-emerald-300">Earn real cash</span>.
            </motion.h1>
            <p className="text-gray-300">Verify your Instagram handle, do simple tasks and withdraw to UPI or gift cards.</p>
          </div>

          {/* Stats pills */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center gap-2 bg-white/4 px-3 py-2 rounded-full">
              <Users className="w-4 h-4 text-emerald-300" />
              <div className="text-sm">
                <div className="text-xs text-gray-300">Users</div>
                <div className="font-semibold">12,540+</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/4 px-3 py-2 rounded-full">
              <IndianRupee className="w-4 h-4 text-yellow-300" />
              <div className="text-sm">
                <div className="text-xs text-gray-300">Paid</div>
                <div className="font-semibold">₹4,30,000+</div>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/4 px-3 py-2 rounded-full">
              <TrendingUp className="w-4 h-4 text-sky-300" />
              <div className="text-sm">
                <div className="text-xs text-gray-300">Active</div>
                <div className="font-semibold">120+</div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero + stats card */}
        <div className="mt-6 grid grid-cols-1 gap-4">
          <GlassCard>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-gray-400 text-sm">This week earnings</div>
                <div className="text-2xl md:text-3xl font-bold flex items-center gap-2"><IndianRupee className="w-6 h-6"/>4,620</div>
              </div>
              <div className="text-emerald-300 font-semibold">+18.4%</div>
            </div>

            <div className="mt-3 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spark}>
                  <Line type="monotone" dataKey="y" stroke="#facc15" strokeWidth={3} dot={false} isAnimationActive />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs text-gray-300">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-lg font-bold">28</div>
                <div>Offers done</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-lg font-bold">₹920</div>
                <div>Pending</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-lg font-bold">₹3,700</div>
                <div>Paid out</div>
              </div>
            </div>
          </GlassCard>

          {/* Requirements card */}
          <GlassCard className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Who can join</div>
              <div className="text-xs text-gray-400">Rules</div>
            </div>

            <ul className="space-y-2 text-sm text-gray-200">
              <li className="flex items-center gap-3">
                <span className="w-8 h-8 grid place-items-center rounded-full bg-pink-500/20">
                  {/* small instagram icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-pink-400">
                    <rect x="3" y="3" width="18" height="18" rx="4" stroke="#F472B6" strokeWidth="1.4"/>
                    <path d="M16 11.37a4 4 0 1 1-7.999.001A4 4 0 0 1 16 11.37z" stroke="#F472B6" strokeWidth="1.4"/>
                    <path d="M17.5 6.5h.01" stroke="#F472B6" strokeWidth="1.6" strokeLinecap="round"/>
                  </svg>
                </span>
                <div>
                  <div className="font-semibold">Instagram account (1k+ followers)</div>
                  <div className="text-xs text-gray-400">Verified handles only</div>
                </div>
              </li>

              <li className="flex items-center gap-3">
                <span className="w-8 h-8 grid place-items-center rounded-full bg-blue-500/10 text-blue-300">18+</span>
                <div>
                  <div className="font-semibold">Must be 18+</div>
                  <div className="text-xs text-gray-400">Adults only</div>
                </div>
              </li>

              <li className="flex items-center gap-3">
                <span className="w-8 h-8 grid place-items-center rounded-full bg-yellow-400/10 text-yellow-300">
                  <IndianRupee className="w-4 h-4"/>
                </span>
                <div>
                  <div className="font-semibold">Earn up to ₹200 daily</div>
                  <div className="text-xs text-gray-400">Monthly cap ₹6000</div>
                </div>
              </li>
            </ul>

            <div className="mt-3">
              <a href="/verify" className="block w-full text-center rounded-xl btn-primary px-4 py-3 font-semibold">🔑 Verify your Instagram Handle</a>
            </div>
          </GlassCard>
        </div>

        {/* Footer small */}
        <footer className="mt-8 text-center text-gray-400 text-sm">
          <div className="flex justify-center gap-4 mb-3">
            <a href="/about" className="hover:text-white">About</a>
            <a href="/support" className="hover:text-white">Support</a>
            <a href="/faq" className="hover:text-white">FAQ</a>
          </div>
          <div>© {new Date().getFullYear()} TaskVault</div>
        </footer>
      </main>
    </div>
  )
}
