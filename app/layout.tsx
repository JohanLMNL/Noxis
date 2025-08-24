import type { Metadata } from 'next'
import { Exo_2 } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/Toaster'
import { PWAInstaller } from '@/components/PWAInstaller'

const exo2 = Exo_2({ subsets: ['latin'] })

export const metadata = {
  title: 'Noxis',
  description: 'Application de productivité personnelle',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
}

export const viewport = {
  themeColor: '#7c3aed',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={exo2.className}>
        {children}
        <Toaster />
        <PWAInstaller />
      </body>
    </html>
  )
}
