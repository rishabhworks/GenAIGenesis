'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin, Briefcase, Award, Clock, ArrowRight, FileText, User } from 'lucide-react'
import { mockWorker } from '@/mock/carlos'
import type { Worker } from '@/types'

/* ─── Shimmer skeleton ─── */

function Shimmer({ className }: { className: string }) {
  return <div className={`animate-shimmer rounded-xl ${className}`} />
}

function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Header card skeleton */}
      <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-8 mb-6">
        <div className="flex items-start gap-6">
          <Shimmer className="w-20 h-20 rounded-2xl flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <Shimmer className="h-7 w-44" />
            <Shimmer className="h-4 w-28" />
            <Shimmer className="h-4 w-full" />
            <Shimmer className="h-4 w-3/4" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-[#1E1E2E]">
          {Array.from({ length: 4 }).map((_, i) => (
            <Shimmer key={i} className="h-12" />
          ))}
        </div>
      </div>
      {/* Languages card skeleton */}
      <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-6 mb-6">
        <Shimmer className="h-6 w-32 mb-4" />
        <div className="flex gap-2">
          <Shimmer className="h-8 w-24 rounded-full" />
          <Shimmer className="h-8 w-20 rounded-full" />
          <Shimmer className="h-8 w-28 rounded-full" />
        </div>
      </div>
      {/* CTA skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Shimmer className="h-14" />
        <Shimmer className="h-14" />
      </div>
    </div>
  )
}

/* ─── Page ─── */

export default function ProfilePage() {
  const router = useRouter()
  const [worker, setWorker] = useState<Worker>(mockWorker)
  const [loading, setLoading] = useState(true)

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
    const t = setTimeout(() => setLoading(false), 650)
    return () => clearTimeout(t)
  }, [])

  const initials = worker.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0A0A0F] text-white">
        <nav className="flex items-center justify-between px-8 py-6 border-b border-[#1E1E2E]">
          <span className="font-display text-xl font-bold">
            Wise<span className="text-[#F97316]">Hire</span>
          </span>
          <div className="flex items-center gap-4">
            <Shimmer className="h-8 w-28" />
            <Shimmer className="h-8 w-28" />
          </div>
        </nav>
        <ProfileSkeleton />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[#1E1E2E]">
        <span className="font-display text-xl font-bold">
          Wise<span className="text-[#F97316]">Hire</span>
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
            className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Find Jobs
            <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Profile header card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-8 mb-6 hover:border-[#F97316]/20 transition-colors duration-300"
        >
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center flex-shrink-0">
              <span className="font-display text-2xl font-bold text-[#F97316]">{initials}</span>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="font-display text-2xl font-bold mb-1">{worker.name}</h1>
              <p className="text-[#F97316] font-medium mb-3">{worker.trade}</p>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">{worker.summary}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-[#1E1E2E]">
            {[
              { icon: Clock, label: 'Experience', value: `${worker.years_experience} years` },
              { icon: Award, label: 'Certification', value: worker.certification },
              { icon: MapPin, label: 'Location', value: worker.location },
              { icon: Briefcase, label: 'Trade', value: worker.trade },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#F97316]/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={14} className="text-[#F97316]" />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{value}</p>
                  <p className="text-[#52525B] text-xs">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Languages */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-6 mb-6"
        >
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <User size={18} className="text-[#F97316]" />
            Languages
          </h2>
          <div className="flex flex-wrap gap-2">
            {worker.languages.map((lang, i) => (
              <span
                key={i}
                className="bg-[#F97316]/10 border border-[#F97316]/20 text-orange-400 text-sm px-3 py-1 rounded-full"
              >
                {lang}
              </span>
            ))}
          </div>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <button
            onClick={() => router.push('/resume')}
            className="bg-[#111118] border border-[#1E1E2E] hover:border-[#F97316]/40 text-white font-medium py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <FileText size={18} className="text-[#F97316]" />
            Generate Resume
          </button>
          <button
            onClick={() => router.push('/jobs')}
            className="bg-[#F97316] hover:bg-orange-400 text-white font-medium py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            Find Matching Jobs
            <ArrowRight size={18} />
          </button>
        </motion.div>

      </div>
    </main>
  )
}
