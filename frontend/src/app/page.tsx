'use client'

import { useState } from 'react'
import { Leaf, ChefHat, ShoppingCart, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [email, setEmail] = useState('')

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter signup
    setEmail('')
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-primary-500" />
            <span className="text-2xl font-bold text-gray-900">VeganFlemme</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/generate-menu" className="text-gray-600 hover:text-primary-500">Générer Menu</Link>
            <Link href="/profile" className="text-gray-600 hover:text-primary-500">Profil</Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-primary-500">Dashboard</Link>
          </nav>
          <button className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors">
            Commencer
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Votre transition <span className="text-primary-500">vegan</span> simplifiée
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Générez des menus 100% vegan avec suivi nutritionnel ANSES, 
            jauges écologiques et création de panier intelligent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/generate-menu" className="brand-gradient text-white px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity inline-flex items-center">
              Générer mon premier menu
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button className="border-2 border-primary-500 text-primary-500 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors">
              Voir la démo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-neutral-50 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Pourquoi choisir VeganFlemme ?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <ChefHat className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Menus Personnalisés</h3>
              <p className="text-gray-600">100% conformes aux RNP ANSES, adaptés à votre profil et vos goûts</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <TrendingUp className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Suivi Nutritionnel</h3>
              <p className="text-gray-600">Jauges temps réel pour macro/micro-nutriments et alertes préventives</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <Leaf className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Impact Écologique</h3>
              <p className="text-gray-600">Empreinte carbone et eau calculée pour chaque repas</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <ShoppingCart className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Panier Intelligent</h3>
              <p className="text-gray-600">Génération automatique avec liens affiliés Greenweez &amp; partenaires</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Restez informé de nos nouveautés
          </h2>
          <p className="text-gray-600 mb-8">
            Recevez nos derniers conseils nutrition et nos nouvelles fonctionnalités
          </p>
          <form onSubmit={handleNewsletterSignup} className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre adresse email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <button
              type="submit"
              className="bg-primary-500 text-white px-8 py-3 rounded-lg hover:bg-primary-600 transition-colors font-semibold"
            >
              S&apos;inscrire
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Leaf className="h-6 w-6 text-primary-500" />
              <span className="text-xl font-bold">VeganFlemme</span>
            </div>
            <div className="text-sm text-gray-400 text-center md:text-right">
              <p>&copy; 2024 VeganFlemme. Tous droits réservés.</p>
              <p className="mt-1">Conformité RGPD • Mentions légales • CGU</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}