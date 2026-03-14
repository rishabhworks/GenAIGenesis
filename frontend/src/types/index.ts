export type Worker = {
  name: string
  trade: string
  years_experience: number
  certification: string
  location: string
  languages: string[]
  summary: string
}

export type Job = {
  id: string
  job_title: string
  company: string
  location: string
  posted_wage: number
  market_median: number
  underpaid: boolean
  gap_percent: number
  fit_score: number
  posted_date: string
}

export type ResumeExperience = {
  title: string
  company: string
  duration: string
  bullets: string[]
}

export type Resume = {
  name: string
  contact: {
    email: string
    phone: string
    location: string
  }
  summary: string
  experience: ResumeExperience[]
  certifications: string[]
  skills: string[]
}

export type IntakeAnswer = {
  question: string
  answer: string
}