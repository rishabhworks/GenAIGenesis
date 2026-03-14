import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'WiseHire — Your Career, Your Voice',
  description: 'AI-powered career agent for skilled trades workers in Canada.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {/* Decorative animated gradient line — top of every page */}
        <div className="fixed top-0 left-0 right-0 h-[2px] z-[100] animate-gradient-flow" />
        {children}
      </body>
    </html>
  )
}
