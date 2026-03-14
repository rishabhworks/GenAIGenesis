'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin, Briefcase, Award, Clock, ArrowRight, FileText, User } from 'lucide-react'
import { mockWorker } from '@/mock/carlos'
import type { Worker } from '@/types'

export default function ProfilePage() {
  const router = useRouter()
  const [worker, setWorker] = useState<Worker>(mockWorker)

  useEffect(() => {
    const stored = localStorage.getItem('wisehire_profile')
    if (stored) {
      const parsed = JSON.parse(stored)
      setWorker({
        name: parsed.name || mockWorker.name,
        trade: parsed.trade || mockWorker.trade,
        years_experience: parseInt(parsed.years_experience) || mockWorker.years_experience,
        certification: parsed.certification || mockWorker.certification,
        location: parsed.location || mockWorker.location,
        languages: mockWorker.languages,
        summary: mockWorker.summary,
      })
    }
  }, [])

  const initials = worker.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[#1E1E2E]">
        <span className="font-display text-xl font-bold">
          Wise<span className="text-orange-500">Hire</span>
        </span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/resume')}
            className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white transition-colors"
          >
            <FileText size={16} />
            View Resume
          </button>
          <button
            onClick={() => router.push('/jobs')}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Find Jobs
            <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-8 mb-6"
        >
          <div className="flex items-start gap-6">

            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
              <span className="font-display text-2xl font-bold text-orange-500">{initials}</span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold mb-1">{worker.name}</h1>
              <p className="text-orange-500 font-medium mb-3">{worker.trade}</p>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">{worker.summary}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-[#1E1E2E]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Clock size={14} className="text-orange-500" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{worker.years_experience} years</p>
                <p className="text-[#52525B] text-xs">Experience</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Award size={14} className="text-orange-500" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{worker.certification}</p>
                <p className="text-[#52525B] text-xs">Certification</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <MapPin size={14} className="text-orange-500" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{worker.location}</p>
                <p className="text-[#52525B] text-xs">Location</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <Briefcase size={14} className="text-orange-500" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">{worker.trade}</p>
                <p className="text-[#52525B] text-xs">Trade</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Languages */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-6 mb-6"
        >
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <User size={18} className="text-orange-500" />
            Languages
          </h2>
          <div className="flex flex-wrap gap-2">
            {worker.languages.map((lang, i) => (
              <span
                key={i}
                className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm px-3 py-1 rounded-full"
              >
                {lang}
              </span>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <button
            onClick={() => router.push('/resume')}
            className="bg-[#111118] border border-[#1E1E2E] hover:border-orange-500/40 text-white font-medium py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <FileText size={18} className="text-orange-500" />
            Generate Resume
          </button>
          <button
            onClick={() => router.push('/jobs')}
            className="bg-orange-500 hover:bg-orange-400 text-white font-medium py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            Find Matching Jobs
            <ArrowRight size={18} />
          </button>
        </motion.div>

      </div>
    </main>
  )
}