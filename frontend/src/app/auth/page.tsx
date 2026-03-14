'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mic, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  const handleSubmit = async () => {
    setLoading(true)
    await new Promise(res => setTimeout(res, 1200))
    setLoading(false)
    router.push('/intake')
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] flex flex-col relative overflow-hidden">

      {/* ── Animated background orbs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Primary orange orb */}
        <div
          className="absolute w-[640px] h-[640px] rounded-full animate-auth-orb"
          style={{
            top: '10%',
            left: '50%',
            background: 'radial-gradient(ellipse, rgba(249,115,22,0.09) 0%, transparent 70%)',
            filter: 'blur(48px)',
            transform: 'translateX(-50%)',
          }}
        />
        {/* Secondary purple-tinted orb */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full animate-auth-orb2"
          style={{
            bottom: '15%',
            left: '30%',
            background: 'radial-gradient(ellipse, rgba(139,92,246,0.06) 0%, transparent 70%)',
            filter: 'blur(60px)',
            transform: 'translate(-30%, 0)',
          }}
        />
        {/* Right accent */}
        <div
          className="absolute w-[300px] h-[300px] rounded-full"
          style={{
            top: '40%',
            right: '-5%',
            background: 'radial-gradient(ellipse, rgba(249,115,22,0.05) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        {/* Grain overlay */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.025,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '180px',
          }}
        />
      </div>

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6 relative z-10">
        <button
          onClick={() => router.push('/')}
          className="font-display text-xl font-bold tracking-tight text-white"
        >
          Wise<span className="text-[#F97316]">Hire</span>
        </button>
      </nav>

      {/* Auth card */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Card container with subtle glass border */}
          <div className="bg-[#111118]/80 backdrop-blur-sm border border-[#1E1E2E] rounded-2xl p-8 shadow-[0_0_60px_rgba(249,115,22,0.04)]">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center mx-auto mb-4">
                <Mic size={24} className="text-[#F97316]" />
              </div>
              <h1 className="font-display text-3xl font-bold text-white mb-2">
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-[#A1A1AA] text-sm">
                {mode === 'signup'
                  ? "Your voice is your resume. Let's get started."
                  : 'Sign in to access your WiseHire profile.'}
              </p>
            </div>

            {/* Toggle */}
            <div className="flex bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl p-1 mb-6">
              <button
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === 'signup'
                    ? 'bg-[#F97316] text-white shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                Sign up
              </button>
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-[#F97316] text-white shadow-sm'
                    : 'text-[#A1A1AA] hover:text-white'
                }`}
              >
                Log in
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">

              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm text-[#A1A1AA] mb-1.5">Full name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525B]" />
                    <input
                      type="text"
                      placeholder="Carlos Mendez"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl px-4 py-3 pl-10 text-white placeholder-[#52525B] text-sm focus:outline-none focus:border-[#F97316]/50 transition-colors"
                    />
                  </div>
                </motion.div>
              )}

              <div>
                <label className="block text-sm text-[#A1A1AA] mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525B]" />
                  <input
                    type="email"
                    placeholder="carlos@email.com"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl px-4 py-3 pl-10 text-white placeholder-[#52525B] text-sm focus:outline-none focus:border-[#F97316]/50 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#A1A1AA] mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525B]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="w-full bg-[#0A0A0F] border border-[#1E1E2E] rounded-xl px-4 py-3 pl-10 pr-12 text-white placeholder-[#52525B] text-sm focus:outline-none focus:border-[#F97316]/50 transition-colors"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#52525B] hover:text-[#A1A1AA] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-[#F97316] hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm mt-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'signup' ? 'Create account' : 'Sign in'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>

            <p className="text-center text-[#52525B] text-xs mt-6">
              By continuing you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
