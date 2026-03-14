import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TradePass — Your Career, Your Voice',
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
        {children}
      </body>
    </html>
  )
}