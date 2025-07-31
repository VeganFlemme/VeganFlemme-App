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
            <Link href="/dashboard" className="border-2 border-primary-500 text-primary-500 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors">
              Voir mon dashboard
            </Link>
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

      {/* Tools Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Vos outils pour une transition réussie
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Recipe Explorer</h3>
                <p className="text-gray-600 mb-4">Découvrez des milliers de recettes véganes délicieuses</p>
                <Link
                  href="/recipe-explorer"
                  className="inline-block bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all"
                >
                  Explorer
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-9 4h10m-5 6v-4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Planificateur de Repas</h3>
                <p className="text-gray-600 mb-4">Organisez vos repas de la semaine facilement</p>
                <Link
                  href="/meal-planner"
                  className="inline-block bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all"
                >
                  Planifier
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Assistant Shopping</h3>
                <p className="text-gray-600 mb-4">Créez vos listes de courses avec des produits véganes</p>
                <Link
                  href="/shopping-assistant"
                  className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Commencer
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Planificateur de Transition</h3>
                <p className="text-gray-600 mb-4">Suivez votre progression vers un mode de vie végan</p>
                <Link
                  href="/transition-planner"
                  className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
                >
                  Débuter
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="bg-gradient-to-r from-teal-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Dashboard Nutrition</h3>
                <p className="text-gray-600 mb-4">Suivez vos apports nutritionnels en temps réel</p>
                <Link
                  href="/dashboard"
                  className="inline-block bg-gradient-to-r from-teal-500 to-cyan-500 text-white px-6 py-2 rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all"
                >
                  Analyser
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="text-center">
                <div className="bg-gradient-to-r from-primary-500 to-green-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Générateur de Menus</h3>
                <p className="text-gray-600 mb-4">IA avancée pour des menus équilibrés et optimisés</p>
                <Link
                  href="/generate-menu"
                  className="inline-block bg-gradient-to-r from-primary-500 to-green-500 text-white px-6 py-2 rounded-lg hover:from-primary-600 hover:to-green-600 transition-all"
                >
                  Générer
                </Link>
              </div>
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