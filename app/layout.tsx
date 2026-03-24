import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Vote4Cake',
  description: 'Vote for your favorite cake',
}

type RootLayoutProps = {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
