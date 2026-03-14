'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Briefcase, TrendingUp, TrendingDown, ArrowLeft, AlertTriangle, CheckCircle, Star } from 'lucide-react'
import { mockJobs, mockWorker } from '@/mock/carlos'
import type { Job } from '@/types'

export default function JobsPage() {
  const router = useRouter()
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [filter, setFilter] = useState<'all' | 'fair' | 'underpaid'>('all')

  const filtered = mockJobs.filter(job => {
    if (filter === 'fair') return !job.underpaid
    if (filter === 'underpaid') return job.underpaid
    return true
  })

  const underpaidCount = mockJobs.filter(j => j.underpaid).length

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[#1E1E2E]">
        <span className="font-display text-xl font-bold">
          Wise<span className="text-orange-500">Hire</span>
        </span>
        <button
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 text-sm text-[#A1A1AA] hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Profile
        </button>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold mb-1">
            Jobs for {mockWorker.name}
          </h1>
          <p className="text-[#A1A1AA] text-sm">
            {mockWorker.trade} · {mockWorker.certification} · {mockWorker.location}
          </p>
        </motion.div>

        {/* Pay Alert Banner */}
        {underpaidCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 mb-6 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-red-400 mb-1">
                Pay Alert — {underpaidCount} job{underpaidCount > 1 ? 's' : ''} below market rate
              </h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                Based on regional data for <span className="text-white font-medium">{mockWorker.trade}s in {mockWorker.location}</span>,
                the market median wage is <span className="text-white font-medium">$38/hr</span>.
                {underpaidCount} posting{underpaidCount > 1 ? 's are' : ' is'} offering significantly less.
                We&apos;ve flagged them below.
              </p>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'fair', 'underpaid'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                filter === f
                  ? 'bg-orange-500 text-white'
                  : 'bg-[#111118] border border-[#1E1E2E] text-[#A1A1AA] hover:text-white'
              }`}
            >
              {f === 'all' ? `All (${mockJobs.length})` : f === 'fair' ? `Fair Pay (${mockJobs.filter(j => !j.underpaid).length})` : `Underpaid (${underpaidCount})`}
            </button>
          ))}
        </div>

        {/* Job Cards */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((job, i) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedJob(job)}
                className={`bg-[#111118] border rounded-2xl p-6 cursor-pointer transition-all duration-200 hover:scale-[1.01] ${
                  job.underpaid
                    ? 'border-red-500/20 hover:border-red-500/40'
                    : 'border-[#1E1E2E] hover:border-orange-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">

                    {/* Top row */}
                    <div className="flex items-center gap-2 mb-1">
                      {job.underpaid ? (
                        <span className="flex items-center gap-1 text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
                          <AlertTriangle size={10} />
                          Underpaid
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                          <CheckCircle size={10} />
                          Fair Pay
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                        <Star size={10} />
                        {job.fit_score}% match
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-white mb-0.5">
                      {job.job_title}
                    </h3>
                    <p className="text-[#A1A1AA] text-sm mb-3">{job.company}</p>

                    <div className="flex items-center gap-4 text-sm text-[#52525B]">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase size={13} />
                        {mockWorker.trade}
                      </span>
                    </div>
                  </div>

                  {/* Wage */}
                  <div className="text-right flex-shrink-0">
                    <p className={`font-display text-2xl font-bold ${job.underpaid ? 'text-red-400' : 'text-green-400'}`}>
                      ${job.posted_wage}/hr
                    </p>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      {job.underpaid ? (
                        <TrendingDown size={13} className="text-red-400" />
                      ) : (
                        <TrendingUp size={13} className="text-green-400" />
                      )}
                      <p className="text-[#52525B] text-xs">
                        Market: ${job.market_median}/hr
                      </p>
                    </div>
                    {job.underpaid && (
                      <p className="text-red-400 text-xs mt-0.5">
                        -{job.gap_percent}% below market
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Job Detail Modal */}
        <AnimatePresence>
          {selectedJob && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedJob(null)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                onClick={e => e.stopPropagation()}
                className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-8 w-full max-w-lg"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="font-display text-2xl font-bold mb-1">{selectedJob.job_title}</h2>
                    <p className="text-orange-500 font-medium">{selectedJob.company}</p>
                  </div>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="text-[#52525B] hover:text-white transition-colors text-xl leading-none"
                  >
                    ✕
                  </button>
                </div>

                {/* Pay comparison */}
                <div className="bg-[#0A0A0F] rounded-xl p-5 mb-6">
                  <p className="text-[#52525B] text-xs uppercase tracking-widest mb-3">Pay Analysis</p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#A1A1AA] text-sm">Posted wage</span>
                    <span className={`font-display text-xl font-bold ${selectedJob.underpaid ? 'text-red-400' : 'text-green-400'}`}>
                      ${selectedJob.posted_wage}/hr
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#A1A1AA] text-sm">Market median ({mockWorker.location})</span>
                    <span className="font-display text-xl font-bold text-white">
                      ${selectedJob.market_median}/hr
                    </span>
                  </div>
                  {selectedJob.underpaid ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-2">
                      <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-red-400 text-sm">
                        This job pays <strong>${selectedJob.market_median - selectedJob.posted_wage}/hr less</strong> than
                        fair market rate for a {mockWorker.certification} {mockWorker.trade} in {mockWorker.location}.
                        Consider negotiating or looking elsewhere.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-start gap-2">
                      <CheckCircle size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-green-400 text-sm">
                        This job pays at or above market rate. Good opportunity for a {mockWorker.certification} {mockWorker.trade}.
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="flex-1 border border-[#1E1E2E] hover:border-[#52525B] text-[#A1A1AA] hover:text-white py-3 rounded-xl text-sm transition-all"
                  >
                    Back to jobs
                  </button>
                  <button className="flex-1 bg-orange-500 hover:bg-orange-400 text-white font-medium py-3 rounded-xl text-sm transition-all">
                    Apply now
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  )
}