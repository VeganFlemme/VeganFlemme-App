'use client'

import { useState } from 'react'
import { Leaf, ChefHat, ShoppingCart, TrendingUp, ArrowRight, CheckCircle, Clock, Users, Sparkles, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { useUserJourney } from '@/hooks/useUserJourney'
import JourneyProgress from '@/components/JourneyProgress'

export default function HomePage() {
  const [email, setEmail] = useState('')
  const { state, actions } = useUserJourney()

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter signup
    setEmail('')
  }

  // Show different content based on user journey state
  if (state.profile?.isComplete) {
    return <DashboardView />
  }

  return <WelcomeView />
}

function WelcomeView() {
  const [email, setEmail] = useState('')

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement newsletter signup
    setEmail('')
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section - Journey-focused */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Devenez <span className="text-primary-500">vegan</span> sans effort
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Plan alimentaire quotidien aléatoirement généré, parfaitement équilibré. 
            Personnalisations optionnelles disponibles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/generate-menu" 
              className="brand-gradient text-white px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity inline-flex items-center"
            >
              Voir mon plan alimentaire
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="#journey" 
              className="border-2 border-primary-500 text-primary-500 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors"
            >
              Comment ça marche ?
            </Link>
          </div>
        </div>
      </section>

      {/* Journey Steps Section */}
      <section id="journey" className="py-20 bg-neutral-50 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Votre plan alimentaire épuré
          </h2>
          
          <div className="space-y-8">
            {/* Step 1: Immediate Display */}
            <div className="flex flex-col md:flex-row items-center bg-white rounded-xl shadow-lg p-8">
              <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                <div className="bg-primary-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
                  1
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Plan alimentaire directement affiché
                </h3>
                <p className="text-gray-600 mb-4">
                  Menu quotidien aléatoire mais équilibré visible immédiatement. 
                  Options de swap intelligents sur chaque repas.
                </p>
                <div className="flex items-center justify-center md:justify-start text-sm text-primary-600">
                  <Sparkles className="h-4 w-4 mr-1" />
                  <span>Direct - Zéro attente</span>
                </div>
              </div>
            </div>

            {/* Step 2: Optional customization */}
            <div className="flex flex-col md:flex-row-reverse items-center bg-white rounded-xl shadow-lg p-8">
              <div className="flex-shrink-0 mb-6 md:mb-0 md:ml-8">
                <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
                  2
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Personnalisations à gauche (optionnel)
                </h3>
                <p className="text-gray-600 mb-4">
                  Allergies, temps de cuisson, budget, objectifs poids, restrictions. 
                  Toutes options à choisir ou non.
                </p>
                <div className="flex items-center justify-center md:justify-start text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>100% optionnel</span>
                </div>
              </div>
            </div>

            {/* Step 3: Nutrition info */}
            <div className="flex flex-col md:flex-row items-center bg-white rounded-xl shadow-lg p-8">
              <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                <div className="bg-purple-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
                  3
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Dashboard nutritionnel à droite
                </h3>
                <p className="text-gray-600 mb-4">
                  Infos nutritionnelles complètes, couverture RNP, impact environnemental 
                  et coût estimé.
                </p>
                <div className="flex items-center justify-center md:justify-start text-sm text-purple-600">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  <span>Dashboard complet</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/generate-menu"
              className="brand-gradient text-white px-12 py-4 rounded-lg font-semibold text-xl hover:opacity-90 transition-opacity inline-flex items-center"
            >
              Voir mon plan alimentaire
              <ArrowRight className="ml-2 h-6 w-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Pourquoi cette approche épurée ?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <Sparkles className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Page épurée</h3>
              <p className="text-gray-600">Plan alimentaire directement visible, sans formulaires</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <Leaf className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Swaps intelligents</h3>
              <p className="text-gray-600">Chaque repas peut être échangé pour plus de variété</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <CheckCircle className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Options à droite</h3>
              <p className="text-gray-600">Personnalisations disponibles si besoin, mais optionnelles</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <BarChart3 className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Dashboard nutritionnel</h3>
              <p className="text-gray-600">Toutes les infos nutritionnelles à portée de vue</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <NewsletterSection email={email} setEmail={setEmail} onSubmit={handleNewsletterSignup} />

      {/* Footer */}
      <Footer />
    </main>
  )
}

function DashboardView() {
  const { state, actions } = useUserJourney()
  
  return (
    <main className="min-h-screen">
      {/* Welcome Back Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-gradient-to-r from-primary-500 to-green-500 rounded-2xl text-white p-8 mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Salut {state.profile?.name === 'Utilisateur VeganFlemme' ? 'vegan flemme' : state.profile?.name?.split(' ')[0]} !
            </h1>
            <p className="text-primary-100 mb-4">
              Votre transition vegan se déroule parfaitement. Voici vos outils pour rester sur la bonne voie !
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Quick Menu Generation */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Sparkles className="h-6 w-6 text-primary-500 mr-2" />
                  Génération de menu
                </h2>
                <p className="text-gray-600 mb-4">
                  Générez instantanément votre prochain menu vegan parfait !
                </p>
                <Link 
                  href="/generate-menu"
                  className="brand-gradient text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity inline-flex items-center font-semibold"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Mon plan alimentaire
                </Link>
              </div>

              {/* Shopping and Tools */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Vos outils</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Link 
                    href="/shopping-assistant"
                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors text-center"
                  >
                    <ShoppingCart className="h-8 w-8 text-primary-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900 mb-1">Liste de courses</h3>
                    <p className="text-sm text-gray-600">Générer automatiquement</p>
                  </Link>
                  <Link 
                    href="/recipe-explorer"
                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors text-center"
                  >
                    <ChefHat className="h-8 w-8 text-primary-500 mx-auto mb-2" />
                    <h3 className="font-semibold text-gray-900 mb-1">Explorer recettes</h3>
                    <p className="text-sm text-gray-600">Découvrir de nouveaux plats</p>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Personalization (Optional) */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="h-5 w-5 text-amber-500 mr-2" />
                  Personnalisation (optionnel)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Envie d'ajuster vos menus ? Ces options sont entièrement facultatives !
                </p>
                <div className="space-y-3">
                  <Link 
                    href="/profile"
                    className="block w-full text-left bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <div className="font-medium">Objectifs personnels</div>
                    <div className="text-xs text-amber-600">Poids, activité, préférences</div>
                  </Link>
                  <button className="block w-full text-left bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors">
                    <div className="font-medium">Allergies & restrictions</div>
                    <div className="text-xs text-blue-600">Personnaliser vos menus</div>
                  </button>
                </div>
              </div>

              {/* Progress Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Votre progression</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Menus générés</span>
                    <span className="font-semibold">{state.hasGeneratedMenu ? '1+' : '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transition vegan</span>
                    <span className="font-semibold text-green-600">En cours ✨</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Facilité d'usage</span>
                    <span className="font-semibold text-primary-600">Flemme mode ON</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

function NewsletterSection({ email, setEmail, onSubmit }: { 
  email: string, 
  setEmail: (email: string) => void, 
  onSubmit: (e: React.FormEvent) => void 
}) {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Restez informé de nos nouveautés
        </h2>
        <p className="text-gray-600 mb-8">
          Recevez nos derniers conseils nutrition et nos nouvelles fonctionnalités
        </p>
        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-4">
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
  )
}

function Footer() {
  return (
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
  )
}