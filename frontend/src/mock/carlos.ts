export const mockWorker = {
  name: "Carlos Mendez",
  trade: "Electrician",
  years_experience: 8,
  certification: "Red Seal",
  location: "Mississauga, ON",
  languages: ["English", "Spanish"],
  summary: "Experienced Red Seal electrician specializing in residential wiring, panel upgrades, and code compliance across the Greater Toronto Area."
}

export const mockJobs = [
  {
    id: "1",
    job_title: "Residential Electrician",
    company: "BrightWire Co.",
    location: "Mississauga, ON",
    posted_wage: 28,
    market_median: 38,
    underpaid: true,
    gap_percent: 26,
    fit_score: 94,
    posted_date: "2026-03-13"
  },
  {
    id: "2",
    job_title: "Senior Electrician",
    company: "PowerCore Electric",
    location: "Brampton, ON",
    posted_wage: 40,
    market_median: 38,
    underpaid: false,
    gap_percent: 0,
    fit_score: 88,
    posted_date: "2026-03-12"
  },
  {
    id: "3",
    job_title: "Electrical Technician",
    company: "VoltEdge Solutions",
    location: "Toronto, ON",
    posted_wage: 32,
    market_median: 38,
    underpaid: true,
    gap_percent: 16,
    fit_score: 79,
    posted_date: "2026-03-11"
  }
]

export const mockResume = {
  name: "Carlos Mendez",
  contact: {
    email: "carlos.mendez@email.com",
    phone: "647-555-0192",
    location: "Mississauga, ON"
  },
  summary: "Red Seal certified electrician with 8 years of residential and commercial experience in the GTA.",
  experience: [
    {
      title: "Lead Electrician",
      company: "SparkRight Electric",
      duration: "2019 – Present",
      bullets: [
        "Led wiring installations for 200+ residential units across Mississauga",
        "Managed code compliance inspections with 100% pass rate",
        "Supervised a team of 3 junior electricians"
      ]
    },
    {
      title: "Electrician Apprentice",
      company: "GTA Power Services",
      duration: "2016 – 2019",
      bullets: [
        "Completed Red Seal certification under licensed master electrician",
        "Assisted in panel upgrades and circuit installations"
      ]
    }
  ],
  certifications: ["Red Seal Certificate — Electrician", "ESA Electrical Safety Authority", "WHMIS 2015"],
  skills: ["Residential Wiring", "Panel Upgrades", "Code Compliance", "Blueprint Reading", "Team Leadership"]
}