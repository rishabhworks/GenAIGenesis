'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, ArrowRight, Check } from 'lucide-react'

const questions = [
  {
    id: 1,
    question: "What's your name?",
    placeholder: "Say your full name...",
    field: "name",
  },
  {
    id: 2,
    question: "What trade do you work in?",
    placeholder: "e.g. Electrician, Plumber, Carpenter...",
    field: "trade",
  },
  {
    id: 3,
    question: "How many years of experience do you have?",
    placeholder: "e.g. 8 years...",
    field: "years_experience",
  },
  {
    id: 4,
    question: "Do you have any certifications?",
    placeholder: "e.g. Red Seal, WHMIS, ESA...",
    field: "certification",
  },
  {
    id: 5,
    question: "Where are you located?",
    placeholder: "e.g. Mississauga, ON...",
    field: "location",
  },
]

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
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser. Use Chrome.')
      setListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1]
      setTranscript(result[0].transcript)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognition.start()

    return () => {
      recognition.abort()
    }
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
      // Store answers for profile page
      localStorage.setItem('wisehire_profile', JSON.stringify(updated))
      setTimeout(() => router.push('/profile'), 1800)
    }
  }

  const progress = ((current) / questions.length) * 100

  return (
    <main className="min-h-screen bg-[#0A0A0F] flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6">
        <span className="font-display text-xl font-bold text-white">
          Wise<span className="text-orange-500">Hire</span>
        </span>
        <span className="text-[#52525B] text-sm">
          {current + 1} of {questions.length}
        </span>
      </nav>

      {/* Progress bar */}
      <div className="w-full h-0.5 bg-[#1E1E2E]">
        <motion.div
          className="h-full bg-orange-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Main */}
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
                {/* Question */}
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
                    whileTap={{ scale: 0.95 }}
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                      listening
                        ? 'bg-orange-500 shadow-lg shadow-orange-500/30'
                        : 'bg-[#111118] border-2 border-[#1E1E2E] hover:border-orange-500/50'
                    }`}
                  >
                    {/* Pulse ring when listening */}
                    {listening && (
                      <>
                        <motion.div
                          className="absolute inset-0 rounded-full bg-orange-500/20"
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute inset-0 rounded-full bg-orange-500/10"
                          animate={{ scale: [1, 1.7, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                        />
                      </>
                    )}
                    {listening
                      ? <MicOff size={32} className="text-white relative z-10" />
                      : <Mic size={32} className="text-orange-500 relative z-10" />
                    }
                  </motion.button>

                  <p className="text-[#52525B] text-sm mt-4">
                    {listening ? 'Listening... tap to stop' : 'Tap to speak'}
                  </p>
                </div>

                {/* Transcript display */}
                <div className="bg-[#111118] border border-[#1E1E2E] rounded-2xl p-5 mb-6 min-h-[80px] flex items-center">
                  {transcript ? (
                    <p className="text-white text-lg">{transcript}</p>
                  ) : (
                    <p className="text-[#52525B] text-sm">{questions[current].placeholder}</p>
                  )}
                </div>

                {/* Next button */}
                <button
                  onClick={handleNext}
                  disabled={!transcript.trim()}
                  className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {current + 1 === questions.length ? 'Build my profile' : 'Next question'}
                  <ArrowRight size={18} />
                </button>

                {/* Skip */}
                <button
                  onClick={() => {
                    setTranscript(questions[current].placeholder.replace('e.g. ', '').replace('...', ''))
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