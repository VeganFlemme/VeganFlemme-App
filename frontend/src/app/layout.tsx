import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VeganFlemme - Votre transition vegan simplifiée',
  description: 'Web-app qui simplifie la transition vegan avec génération de menus 100% vegan et RNP ANSES, jauges nutritionnelles/écolo, swap intelligent d\'ingrédients.',
  keywords: 'vegan, nutrition, ANSES, RNP, menus, recettes, transition végétale',
  authors: [{ name: 'VeganFlemme' }],
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#20c997',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="font-sans">
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
          {children}
        </div>
      </body>
    </html>
  )
}