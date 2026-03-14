'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mic, ArrowRight, Shield, TrendingUp, Users } from 'lucide-react'

/* ─── Particle canvas ─── */

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const count = 72
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.38,
      vy: (Math.random() - 0.5) * 0.38,
      r: Math.random() * 1.6 + 0.4,
      orange: Math.random() > 0.62,
      opacity: Math.random() * 0.45 + 0.12,
    }))

    const MAX_DIST = 115
    let animId: number

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.22
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(249,115,22,${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      // Dots
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.orange ? '#F97316' : '#ffffff'
        ctx.globalAlpha = p.opacity
        ctx.fill()
        ctx.globalAlpha = 1
      }

      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  )
}

/* ─── Count-up ─── */

function useCountUp(target: number, active: boolean, duration = 1600) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    const start = performance.now()
    let raf: number
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(Math.round(eased * target))
      if (p < 1) raf = requestAnimationFrame(tick)
      else setValue(target)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, target, duration])
  return value
}

/* ─── Stat counter card ─── */

function StatCounter({
  target,
  format,
  label,
  delay,
  active,
}: {
  target: number
  format: (n: number) => string
  label: string
  delay: number
  active: boolean
}) {
  const count = useCountUp(target, active, 1600)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6 }}
    >
      <p className="font-display text-4xl font-bold text-[#F97316] mb-1">
        {format(count)}
      </p>
      <p className="text-[#A1A1AA] text-sm">{label}</p>
    </motion.div>
  )
}

/* ─── Scroll reveal wrapper ─── */

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { rootMargin: '-80px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={visible ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}

/* ─── Page data ─── */

const stats = [
  {
    target: 300000,
    format: (n: number) => (n >= 300000 ? '300K+' : n >= 1000 ? `${Math.floor(n / 1000)}K` : `${n}`),
    label: 'Trades jobs unfilled in Canada',
  },
  {
    target: 8,
    format: (n: number) => `${n} sec`,
    label: 'To build your profile',
  },
  {
    target: 100,
    format: (n: number) => `${n}%`,
    label: 'Free for workers',
  },
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

/* ─── Page ─── */

export default function LandingPage() {
  const router = useRouter()

  // Stats section visibility
  const statsRef = useRef<HTMLElement>(null)
  const [statsVisible, setStatsVisible] = useState(false)
  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true) },
      { rootMargin: '-60px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <main className="min-h-screen bg-[#0A0A0F] text-[#F4F4F5] overflow-hidden">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-6 border-b border-[#1E1E2E]">
        <span className="font-display text-xl font-bold tracking-tight">
          Wise<span className="text-[#F97316]">Hire</span>
        </span>
        <button
          onClick={() => router.push('/auth')}
          className="text-sm text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors"
        >
          Sign in
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 min-h-[85vh]">

        {/* Neural-net particle canvas */}
        <ParticleCanvas />

        {/* Grain texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.028,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '180px',
          }}
        />

        {/* Orange glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[320px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse, rgba(249,115,22,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-4xl mx-auto"
        >
          <span className="inline-block text-xs font-medium tracking-widest uppercase text-[#F97316] border border-[#F97316]/30 bg-[#F97316]/10 px-4 py-1.5 rounded-full mb-6">
            Canada&apos;s Trades Career Agent
          </span>

          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.1] mb-6">
            Your skills deserve<br />
            <span className="text-[#F97316]">a fair shot.</span>
          </h1>

          <p className="text-[#A1A1AA] text-lg md:text-xl max-w-xl mx-auto mb-10">
            Speak your experience. Get matched to jobs. Know if you&apos;re being underpaid.
            No resume required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/auth')}
              className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-400 text-white font-medium px-8 py-4 rounded-xl text-base animate-cta-glow transition-colors duration-200"
            >
              <Mic size={18} />
              Get Started — It&apos;s Free
            </button>
            <button
              onClick={() => router.push('/auth')}
              className="flex items-center gap-2 border border-[#1E1E2E] hover:border-[#52525B] text-[#A1A1AA] hover:text-[#F4F4F5] px-8 py-4 rounded-xl transition-all duration-200 text-base"
            >
              See how it works
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <section
        ref={statsRef}
        className="border-y border-[#1E1E2E] py-14 px-6"
      >
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((s, i) => (
            <StatCounter
              key={i}
              target={s.target}
              format={s.format}
              label={s.label}
              delay={0.1 * i}
              active={statsVisible}
            />
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Built different.<br />
              <span className="text-[#A1A1AA] font-normal">Because the trades workforce deserves better.</span>
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <Reveal key={i} delay={0.08 * i}>
                <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-8 h-full card-hover-glow group cursor-default">
                  <div className="w-11 h-11 rounded-xl bg-[#F97316]/10 flex items-center justify-center mb-5 group-hover:bg-[#F97316]/20 transition-colors duration-300">
                    <f.icon size={20} className="text-[#F97316]" />
                  </div>
                  <h3 className="font-display text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-16 px-6 border-y border-[#1E1E2E]">
        <div className="max-w-4xl mx-auto">
          <Reveal className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-3">Three steps. That&apos;s it.</h2>
            <p className="text-[#A1A1AA]">No paperwork. No uploads. No waiting.</p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Speak', desc: 'Answer 5 quick questions out loud. Takes under 60 seconds.' },
              { step: '02', title: 'Match', desc: 'We scan hundreds of real job postings and rank them for your skills.' },
              { step: '03', title: 'Know your rate', desc: 'Every listing shows whether it pays fairly — no guessing.' },
            ].map((item, i) => (
              <Reveal key={i} delay={0.1 * i}>
                <div className="flex flex-col items-start">
                  <span className="font-display text-5xl font-bold text-[#1E1E2E] mb-3 leading-none">{item.step}</span>
                  <h3 className="font-display text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-28 px-6 text-center">
        <Reveal className="max-w-2xl mx-auto">
          <h2 className="font-display text-4xl font-bold mb-4">
            Ready to find work<br />that pays what you&apos;re worth?
          </h2>
          <p className="text-[#A1A1AA] mb-8">
            Join thousands of trades workers taking control of their careers.
          </p>
          <button
            onClick={() => router.push('/auth')}
            className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-orange-400 text-white font-medium px-10 py-4 rounded-xl text-base animate-cta-glow transition-colors duration-200"
          >
            <Mic size={18} />
            Start for Free
          </button>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E1E2E] px-8 py-6 flex items-center justify-between text-[#52525B] text-sm">
        <span className="font-display font-bold text-[#52525B]">
          Wise<span className="text-[#F97316]">Hire</span>
        </span>
        <span>Built at GenAI Genesis 2026 🇨🇦</span>
      </footer>

    </main>
  )
}
