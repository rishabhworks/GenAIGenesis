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
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleSubmit = async () => {
    setLoading(true)
    // Simulate API call — swap for real auth later
    await new Promise(res => setTimeout(res, 1200))
    setLoading(false)
    router.push('/intake')
  }

  return (
    <main className="min-h-screen bg-[#0A0A0F] flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6">
        <button
          onClick={() => router.push('/')}
          className="font-display text-xl font-bold tracking-tight text-white"
        >
          Wise<span className="text-orange-500">Hire</span>
        </button>
      </nav>

      {/* Auth Card */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-4">
              <Mic size={24} className="text-orange-500" />
            </div>
            <h1 className="font-display text-3xl font-bold text-white mb-2">
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-[#A1A1AA] text-sm">
              {mode === 'signup'
                ? 'Your voice is your resume. Let\'s get started.'
                : 'Sign in to access your WiseHire profile.'}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex bg-[#111118] border border-[#1E1E2E] rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === 'signup'
                  ? 'bg-orange-500 text-white'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Sign up
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-orange-500 text-white'
                  : 'text-[#A1A1AA] hover:text-white'
              }`}
            >
              Log in
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">

            {/* Name — signup only */}
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
                    className="w-full bg-[#111118] border border-[#1E1E2E] rounded-xl px-4 py-3 pl-10 text-white placeholder-[#52525B] text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                  />
                </div>
              </motion.div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525B]" />
                <input
                  type="email"
                  placeholder="carlos@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-[#111118] border border-[#1E1E2E] rounded-xl px-4 py-3 pl-10 text-white placeholder-[#52525B] text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-[#A1A1AA] mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525B]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-[#111118] border border-[#1E1E2E] rounded-xl px-4 py-3 pl-10 pr-12 text-white placeholder-[#52525B] text-sm focus:outline-none focus:border-orange-500/50 transition-colors"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#52525B] hover:text-[#A1A1AA] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm mt-2"
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

          {/* Footer note */}
          <p className="text-center text-[#52525B] text-xs mt-6">
            By continuing you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </main>
  )
}