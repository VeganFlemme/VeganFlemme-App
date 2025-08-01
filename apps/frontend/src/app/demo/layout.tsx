import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'VeganFlemme Demo - Menu Generation & Nutrition API',
  description: 'Demonstration de la génération de menus vegan et de l\'analyse nutritionnelle',
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
}