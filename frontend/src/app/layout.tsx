import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VeganFlemme - Votre transition vegan simplifiée',
  description: 'Web-app qui simplifie la transition vegan avec génération de menus 100% vegan et RNP ANSES, jauges nutritionnelles/écolo, swap intelligent d\'ingrédients.',
  keywords: 'vegan, nutrition, ANSES, RNP, menus, recettes, transition végétale',
  authors: [{ name: 'VeganFlemme' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#20c997',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
          {children}
        </div>
      </body>
    </html>
  )
}