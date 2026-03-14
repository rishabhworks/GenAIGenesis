'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, ArrowRight, Check } from 'lucide-react'

/* ─── Waveform visualizer ─── */
// Tries Web Audio API first; falls back to a sine-wave simulation
// so it doesn't conflict with SpeechRecognition's mic grab.

function WaveformVisualizer({ active }: { active: boolean }) {
  const [bars, setBars] = useState<number[]>(Array(28).fill(0.05))
  const animRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    if (!active) {
      if (animRef.current) cancelAnimationFrame(animRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {})
      streamRef.current = null
      audioCtxRef.current = null
      setBars(Array(28).fill(0.05))
      return
    }

    function runSimulated() {
      let t = 0
      const tick = () => {
        if (!mountedRef.current) return
        t += 0.07
        setBars(
          Array.from({ length: 28 }, (_, i) => {
            const v =
              Math.sin(t + i * 0.45) * 0.28 +
              Math.sin(t * 1.7 + i * 0.3) * 0.18 +
              Math.random() * 0.12 +
              0.18
            return Math.max(0.05, Math.min(1, v))
          })
        )
        animRef.current = requestAnimationFrame(tick)
      }
      tick()
    }

    // Try real audio; fall back on any error (permission denied / mic in use)
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then(stream => {
          if (!mountedRef.current) {
            stream.getTracks().forEach(t => t.stop())
            return
          }
          streamRef.current = stream
          const audioCtx = new AudioContext()
          audioCtxRef.current = audioCtx
          const analyser = audioCtx.createAnalyser()
          analyser.fftSize = 64
          analyser.smoothingTimeConstant = 0.78
          audioCtx.createMediaStreamSource(stream).connect(analyser)
          const data = new Uint8Array(analyser.frequencyBinCount)
          const BAR = 28

          const tick = () => {
            if (!mountedRef.current) return
            analyser.getByteFrequencyData(data)
            setBars(
              Array.from({ length: BAR }, (_, i) => {
                const idx = Math.floor((i / BAR) * data.length)
                return Math.max(0.05, data[idx] / 255)
              })
            )
            animRef.current = requestAnimationFrame(tick)
          }
          tick()
        })
        .catch(() => runSimulated())
    } else {
      runSimulated()
    }

    return () => {
      mountedRef.current = false
      if (animRef.current) cancelAnimationFrame(animRef.current)
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {})
    }
  }, [active])

  return (
    <div className="flex items-end justify-center gap-[3px] h-10 my-3">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full"
          style={{
            height: `${Math.max(4, h * 100)}%`,
            backgroundColor: active ? '#F97316' : '#1E1E2E',
            opacity: active ? 0.45 + h * 0.55 : 0.25,
            transition: 'height 60ms ease, background-color 300ms, opacity 60ms ease',
          }}
        />
      ))}
    </div>
  )
}

/* ─── Questions ─── */

const questions = [
  { id: 1, question: "What's your name?", placeholder: "Say your full name...", field: 'name' },
  { id: 2, question: 'What trade do you work in?', placeholder: 'e.g. Electrician, Plumber, Carpenter...', field: 'trade' },
  { id: 3, question: 'How many years of experience do you have?', placeholder: 'e.g. 8 years...', field: 'years_experience' },
  { id: 4, question: 'Do you have any certifications?', placeholder: 'e.g. Red Seal, WHMIS, ESA...', field: 'certification' },
  { id: 5, question: 'Where are you located?', placeholder: 'e.g. Mississauga, ON...', field: 'location' },
]

/* ─── Page ─── */

export default function IntakePage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [listening, setListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [done, setDone] = useState(false)

  // Web Speech API
  useEffect(() => {
    if (!listening) return

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser. Use Chrome.')
      setListening(false)
      return
    }

    const rec = new SpeechRecognition()
    rec.continuous = false
    rec.interimResults = true
    rec.lang = 'en-US'

    rec.onresult = (event: any) => {
      const result = event.results[event.results.length - 1]
      setTranscript(result[0].transcript)
    }
    rec.onend = () => setListening(false)
    rec.start()

    return () => rec.abort()
  }, [listening])

  const handleNext = () => {
    if (!transcript.trim()) return
    const field = questions[current].field
    const updated = { ...answers, [field]: transcript }
    setAnswers(updated)
    setTranscript('')

    if (current + 1 < questions.length) {
      setCurrent(current + 1)
    } else {
      setDone(true)
      localStorage.setItem('wisehire_profile', JSON.stringify(updated))
      setTimeout(() => router.push('/profile'), 1800)
    }
  }

  const progress = (current / questions.length) * 100

  return (
    <main className="min-h-screen bg-[#0A0A0F] flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6">
        <span className="font-display text-xl font-bold text-white">
          Wise<span className="text-[#F97316]">Hire</span>
        </span>
        <span className="text-[#52525B] text-sm">
          {current + 1} of {questions.length}
        </span>
      </nav>

      {/* Progress bar */}
      <div className="w-full h-0.5 bg-[#1E1E2E]">
        <motion.div
          className="h-full bg-[#F97316]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg">

          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
              >
                <p className="text-[#52525B] text-sm mb-3 tracking-wide uppercase font-medium">
                  Question {current + 1}
                </p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-10">
                  {questions[current].question}
                </h2>

                {/* Mic button */}
                <div className="flex flex-col items-center mb-8">
                  <motion.button
                    onClick={() => setListening(!listening)}
                    whileTap={{ scale: 0.93 }}
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                      listening
                        ? 'bg-[#F97316] shadow-[0_0_40px_rgba(249,115,22,0.4)]'
                        : 'bg-[#111118] border-2 border-[#1E1E2E] hover:border-[#F97316]/50'
                    }`}
                  >
                    {/* Pulse rings */}
                    {listening && (
                      <>
                        <motion.div
                          className="absolute inset-0 rounded-full bg-[#F97316]/20"
                          animate={{ scale: [1, 1.45, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full bg-[#F97316]/10"
                          animate={{ scale: [1, 1.8, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.25 }}
                        />
                      </>
                    )}
                    {listening
                      ? <MicOff size={32} className="text-white relative z-10" />
                      : <Mic size={32} className="text-[#F97316] relative z-10" />
                    }
                  </motion.button>

                  {/* Waveform — shown only when listening */}
                  <div className="w-full max-w-xs mt-2">
                    <WaveformVisualizer active={listening} />
                  </div>

                  <p className="text-[#52525B] text-sm">
                    {listening ? 'Listening... tap to stop' : 'Tap to speak'}
                  </p>
                </div>

                {/* Transcript display */}
                <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-5 mb-6 min-h-[80px] flex items-center transition-all duration-200">
                  {transcript ? (
                    <p className="text-white text-lg">{transcript}</p>
                  ) : (
                    <p className="text-[#52525B] text-sm">{questions[current].placeholder}</p>
                  )}
                </div>

                {/* Next */}
                <button
                  onClick={handleNext}
                  disabled={!transcript.trim()}
                  className="w-full bg-[#F97316] hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {current + 1 === questions.length ? 'Build my profile' : 'Next question'}
                  <ArrowRight size={18} />
                </button>

                <button
                  onClick={() => {
                    setTranscript(
                      questions[current].placeholder.replace('e.g. ', '').replace('...', '')
                    )
                  }}
                  className="w-full text-center text-[#52525B] hover:text-[#A1A1AA] text-sm mt-4 transition-colors"
                >
                  Use example answer
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
                  <Check size={36} className="text-green-500" />
                </div>
                <h2 className="font-display text-3xl font-bold text-white mb-3">
                  Profile built!
                </h2>
                <p className="text-[#A1A1AA]">Building your WiseHire profile...</p>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </main>
  )
}
