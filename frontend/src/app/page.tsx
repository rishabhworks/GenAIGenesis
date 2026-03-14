'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mic, ArrowRight, Shield, TrendingUp, Users } from 'lucide-react'

const stats = [
  { value: '300K+', label: 'Trades jobs unfilled in Canada' },
  { value: '8 sec', label: 'To build your profile' },
  { value: '100%', label: 'Free for workers' },
]

const features = [
  {
    icon: Mic,
    title: 'Just speak',
    desc: 'No resume. No forms. Tell us who you are in your own words.',
  },
  {
    icon: TrendingUp,
    title: 'Know your worth',
    desc: 'We flag every job that underpays you against real market rates.',
  },
  {
    icon: Shield,
    title: 'Built for you',
    desc: 'Not for recruiters. Not for HR. For the worker on the job site.',
  },
  {
    icon: Users,
    title: 'Any language',
    desc: 'Speak in English, Spanish, Punjabi — WiseHire understands.',
  },
]

export default function LandingPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-bg text-text-primary overflow-hidden">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-[#1E1E2E]">
        <span className="font-display text-xl font-bold tracking-tight">
          Wise<span className="text-accent">Hire</span>
        </span>
        <button
          onClick={() => router.push('/auth')}
          className="text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Sign in
        </button>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">

        {/* Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-accent opacity-10 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block text-xs font-medium tracking-widest uppercase text-accent border border-accent/30 bg-accent/10 px-4 py-1.5 rounded-full mb-6">
            Canada&apos;s Trades Career Agent
          </span>

          <h1 className="font-display text-5xl md:text-7xl font-800 leading-tight max-w-4xl mb-6">
            Your skills deserve<br />
            <span className="text-accent">a fair shot.</span>
          </h1>

          <p className="text-text-secondary text-lg md:text-xl max-w-xl mx-auto mb-10">
            Speak your experience. Get matched to jobs. Know if you&apos;re being underpaid.
            No resume required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/auth')}
              className="flex items-center gap-2 bg-accent hover:bg-orange-500 text-white font-medium px-8 py-4 rounded-xl transition-all duration-200 text-base"
            >
              <Mic size={18} />
              Get Started — It&apos;s Free
            </button>
            <button
              onClick={() => router.push('/auth')}
              className="flex items-center gap-2 border border-[#1E1E2E] hover:border-[#52525B] text-text-secondary hover:text-text-primary px-8 py-4 rounded-xl transition-all duration-200 text-base"
            >
              See how it works
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-[#1E1E2E] py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <p className="font-display text-4xl font-bold text-accent mb-1">{stat.value}</p>
              <p className="text-text-secondary text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-16">
            Built different.<br />
            <span className="text-text-secondary font-normal">Because the trades workforce deserves better.</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-8 hover:border-orange-500/40 transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                  <f.icon size={20} className="text-accent" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-4xl font-bold mb-4">
            Ready to find work<br />that pays what you&apos;re worth?
          </h2>
          <p className="text-text-secondary mb-8">Join thousands of trades workers taking control of their careers.</p>
          <button
            onClick={() => router.push('/auth')}
            className="inline-flex items-center gap-2 bg-accent hover:bg-orange-500 text-white font-medium px-10 py-4 rounded-xl transition-all duration-200 text-base"
          >
            <Mic size={18} />
            Start for Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E1E2E] px-8 py-6 flex items-center justify-between text-[#52525B] text-sm">
        <span className="font-display font-bold">Wise<span className="text-accent">Hire</span></span>
        <span>Built at GenAI Genesis 2026 🇨🇦</span>
      </footer>

    </main>
  )
}