import React, { useState, useRef } from 'react';
import AppEffects from './AppEffects';
import './Onboarding.css';

const WORD_TO_NUM = {
  'zero':0,'one':1,'two':2,'three':3,'four':4,'five':5,'six':6,'seven':7,
  'eight':8,'nine':9,'ten':10,'eleven':11,'twelve':12,'thirteen':13,
  'fourteen':14,'fifteen':15,'sixteen':16,'seventeen':17,'eighteen':18,
  'nineteen':19,'twenty':20,'twenty-one':21,'twenty-two':22,'twenty-three':23,
  'twenty-four':24,'twenty-five':25,'twenty-six':26,'twenty-seven':27,
  'twenty-eight':28,'twenty-nine':29,'thirty':30,'thirty-five':35,
  'forty':40,'forty-five':45,'fifty':50,'fifty-five':55,'sixty':60,
  'sixty-five':65,'seventy':70,'seventy-five':75,'eighty':80,'ninety':90,
  'ninety-nine':99,'hundred':100,'one hundred':100,
  // compound numbers like "thirty five" -> 35
};

const parseNumber = (val) => {
  if (!val) return 0;
  const str = val.toString().toLowerCase().trim();
  // Try direct parse first
  const direct = parseFloat(str.replace(/[^0-9.]/g, ''));
  if (!isNaN(direct)) return direct;
  // Try word lookup
  if (WORD_TO_NUM[str] !== undefined) return WORD_TO_NUM[str];
  // Try splitting compound words like "thirty five"
  const words = str.split(/\s+/);
  let total = 0;
  for (const word of words) {
    if (WORD_TO_NUM[word] !== undefined) total += WORD_TO_NUM[word];
  }
  return total || 0;
};

const QUESTIONS = [
  { key: 'name',                    question: "What's your full name?",                          placeholder: "e.g. Carlos Rodriguez" },
  { key: 'trade',                   question: "What trade do you work in?",                      placeholder: "e.g. Electrician, Plumber, HVAC..." },
  { key: 'experience_years',        question: "How many years of experience do you have?",       placeholder: "e.g. 8" },
  { key: 'certifications',          question: "Do you have any certifications?",                 placeholder: "e.g. Red Seal, WHMIS, ESA..." },
  { key: 'specialties',             question: "What are your specialties?",                      placeholder: "e.g. Residential Wiring, Panel Upgrades..." },
  { key: 'location',                question: "Where are you located?",                          placeholder: "e.g. Mississauga, ON" },
  { key: 'availability',            question: "Are you available full-time or part-time?",       placeholder: "Full-time or Part-time" },
  { key: 'hourly_rate_expectation', question: "What's your expected hourly rate?",               placeholder: "e.g. 38" },
];

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);

  const current = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const progress = ((step) / QUESTIONS.length) * 100;

  // ——— RECORDING ———
  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        streamRef.current?.getTracks().forEach(t => t.stop());
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start(100);
      setRecording(true);
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setRecording(false);
      setProcessing(true);
    }
  };

  const transcribeAudio = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'answer.webm');

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/workers/transcribe`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) throw new Error('Transcription failed');

      const data = await res.json();
      setInputValue(data.transcript || '');
    } catch (err) {
      setError('Could not transcribe audio. Please type your answer instead.');
    } finally {
      setProcessing(false);
    }
  };

  // ——— NAVIGATION ———
  const handleNext = async () => {
    if (!inputValue.trim()) return;

    const updated = { ...answers, [current.key]: inputValue.trim() };
    setAnswers(updated);
    setInputValue('');
    setError(null);

    if (isLast) {
      await submitProfile(updated);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
      setInputValue(answers[QUESTIONS[step - 1].key] || '');
      setError(null);
    }
  };

  // ——— SUBMIT ———
  const submitProfile = async (data) => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name: data.name,
        trade: data.trade,
        experience_years: parseNumber(data.experience_years),
        certifications: data.certifications
          ? data.certifications.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        specialties: data.specialties
          ? data.specialties.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        location: data.location,
        availability: data.availability,
        hourly_rate_expectation: parseNumber(data.hourly_rate_expectation),
        voice_transcript: Object.entries(data)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', '),
      };

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'}/workers/manual-profile`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to create profile');
      }

      const worker = await res.json();
      localStorage.setItem('wiseworks_worker_id', worker.id);
      localStorage.setItem('wiseworks_worker', JSON.stringify(worker));
      onComplete(worker);

    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="onboarding-page">
      <AppEffects />
      <div className="onboarding-card">

        {/* Header */}
        <div className="onboarding-header">
          <h1>
            <span className="logo-wise">WISE</span>
            <span className="logo-works">WORKS</span>
          </h1>
          <p>Let's build your profile in under a minute</p>
        </div>

        {/* Progress */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <span className="step-counter">Step {step + 1} of {QUESTIONS.length}</span>

        {/* Question */}
        <div className="question-area">
          <label className="question-label">{current.question}</label>

          {/* Input row */}
          <div className="voice-input-row">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputValue.trim()) handleNext();
              }}
              placeholder={processing ? 'Transcribing...' : current.placeholder}
              className="onboarding-input"
              disabled={recording || processing || submitting}
              autoFocus
            />

            {/* Mic button */}
            <button
              className={`mic-btn ${recording ? 'mic-btn--active' : ''} ${processing ? 'mic-btn--processing' : ''}`}
              onClick={recording ? stopRecording : startRecording}
              disabled={processing || submitting}
              title={recording ? 'Stop recording' : 'Speak your answer'}
            >
              {processing ? (
                <span className="mic-spinner" />
              ) : recording ? (
                <span className="mic-icon">⏹</span>
              ) : (
                <span className="mic-icon">🎙</span>
              )}
            </button>
          </div>

          {recording && (
            <p className="voice-listening-hint">
              🔴 Listening... tap ⏹ when done
            </p>
          )}
        </div>

        {/* Error */}
        {error && <p className="onboarding-error">⚠ {error}</p>}

        {/* Actions */}
        <div className="onboarding-actions">
          {step > 0 && (
            <button className="btn-back" onClick={handleBack} disabled={submitting}>
              ← Back
            </button>
          )}
          <button
            className="btn-next"
            onClick={handleNext}
            disabled={!inputValue.trim() || recording || processing || submitting}
          >
            {submitting
              ? '⏳ Creating profile...'
              : isLast
              ? '🚀 Create My Profile'
              : 'Next →'}
          </button>
        </div>

      </div>
    </div>
  );
}