import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import { GA_MEASUREMENT_ID } from '@/lib/analytics'

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
      <head>
        {/* Google Analytics 4 */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
      </head>
      <body className="font-sans">
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white">
          {children}
        </div>
      </body>
    </html>
  )
}