'use client'

import { useState } from 'react'
import { Leaf, ChefHat, ShoppingCart, TrendingUp, ArrowRight, CheckCircle, Clock, Users } from 'lucide-react'
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
  return (
    <main className="min-h-screen">
      {/* Hero Section - Journey-focused */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Votre transition <span className="text-primary-500">vegan</span> en 5 étapes simples
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            De la création de votre profil nutritionnel à votre premier panier, 
            nous vous accompagnons à chaque étape de votre transition.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/onboarding" 
              className="brand-gradient text-white px-8 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity inline-flex items-center"
            >
              Commencer mon parcours
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              href="#journey" 
              className="border-2 border-primary-500 text-primary-500 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-50 transition-colors"
            >
              Découvrir le parcours
            </Link>
          </div>
        </div>
      </section>

      {/* Journey Steps Section */}
      <section id="journey" className="py-20 bg-neutral-50 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Votre parcours en 5 étapes
          </h2>
          
          <div className="space-y-8">
            {/* Step 1: Onboarding */}
            <div className="flex flex-col md:flex-row items-center bg-white rounded-xl shadow-lg p-8">
              <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                <div className="bg-primary-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
                  1
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Créer votre profil nutritionnel
                </h3>
                <p className="text-gray-600 mb-4">
                  5 minutes pour définir vos besoins : âge, poids, objectifs, allergies. 
                  Calcul automatique de votre IMC et besoins selon les RNP ANSES.
                </p>
                <div className="flex items-center justify-center md:justify-start text-sm text-primary-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>5 minutes</span>
                </div>
              </div>
            </div>

            {/* Step 2: Menu Generation */}
            <div className="flex flex-col md:flex-row-reverse items-center bg-white rounded-xl shadow-lg p-8">
              <div className="flex-shrink-0 mb-6 md:mb-0 md:ml-8">
                <div className="bg-green-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
                  2
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Générer votre premier menu
                </h3>
                <p className="text-gray-600 mb-4">
                  Menu complet 7 jours, 100% personnalisé selon votre profil. 
                  Équilibre nutritionnel garanti et recettes adaptées à vos goûts.
                </p>
                <div className="flex items-center justify-center md:justify-start text-sm text-green-600">
                  <ChefHat className="h-4 w-4 mr-1" />
                  <span>1 minute de génération</span>
                </div>
              </div>
            </div>

            {/* Step 3: Daily Usage */}
            <div className="flex flex-col md:flex-row items-center bg-white rounded-xl shadow-lg p-8">
              <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                <div className="bg-blue-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
                  3
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Explorer et personnaliser
                </h3>
                <p className="text-gray-600 mb-4">
                  Consultez vos repas, accédez aux recettes détaillées, 
                  utilisez la fonction "swap" pour remplacer un aliment.
                </p>
                <div className="flex items-center justify-center md:justify-start text-sm text-blue-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  <span>Usage quotidien</span>
                </div>
              </div>
            </div>

            {/* Step 4: Shopping List */}
            <div className="flex flex-col md:flex-row-reverse items-center bg-white rounded-xl shadow-lg p-8">
              <div className="flex-shrink-0 mb-6 md:mb-0 md:ml-8">
                <div className="bg-purple-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
                  4
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Créer votre liste de courses
                </h3>
                <p className="text-gray-600 mb-4">
                  Génération automatique de tous les ingrédients nécessaires, 
                  quantités optimisées et prix estimés.
                </p>
                <div className="flex items-center justify-center md:justify-start text-sm text-purple-600">
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  <span>Automatique depuis le menu</span>
                </div>
              </div>
            </div>

            {/* Step 5: Purchase */}
            <div className="flex flex-col md:flex-row items-center bg-white rounded-xl shadow-lg p-8">
              <div className="flex-shrink-0 mb-6 md:mb-0 md:mr-8">
                <div className="bg-orange-500 text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold">
                  5
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                  Commander chez nos partenaires
                </h3>
                <p className="text-gray-600 mb-4">
                  Transformation de votre liste en panier pré-rempli 
                  chez Greenweez, Amazon et autres partenaires bio.
                </p>
                <div className="flex items-center justify-center md:justify-start text-sm text-orange-600">
                  <Leaf className="h-4 w-4 mr-1" />
                  <span>Produits bio et locaux</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/onboarding"
              className="brand-gradient text-white px-12 py-4 rounded-lg font-semibold text-xl hover:opacity-90 transition-opacity inline-flex items-center"
            >
              Démarrer maintenant
              <ArrowRight className="ml-2 h-6 w-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
            Pourquoi choisir VeganFlemme ?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <ChefHat className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Personnalisation Extrême</h3>
              <p className="text-gray-600">Menus 100% conformes aux RNP ANSES, adaptés à votre profil unique</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <TrendingUp className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Simplicité Radicale</h3>
              <p className="text-gray-600">5 étapes seulement, de votre profil à votre panier livré</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <Leaf className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Flexibilité & Plaisir</h3>
              <p className="text-gray-600">Fonction "swap" intelligente pour remplacer selon vos envies</p>
            </div>
            <div className="text-center p-6 bg-white rounded-xl shadow-sm">
              <ShoppingCart className="h-12 w-12 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Service Gratuit</h3>
              <p className="text-gray-600">Monétisation transparente via partenaires, gratuit pour vous</p>
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
              Bon retour, {state.profile?.name?.split(' ')[0]} !
            </h1>
            <p className="text-primary-100 mb-4">
              Continuons votre parcours vers une alimentation végane équilibrée
            </p>
            
            {/* Progress Bar */}
            <div className="bg-white/20 rounded-full h-3 mb-2">
              <div 
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${state.completionPercentage}%` }}
              />
            </div>
            <div className="text-sm text-primary-100">
              {state.steps.filter(s => s.completed).length} / {state.steps.length} étapes terminées
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Journey Progress */}
            <div className="lg:col-span-2">
              <JourneyProgress showTitle={false} />
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              {/* Next Action */}
              {(() => {
                const nextStep = actions.getNextRequiredStep()
                if (nextStep) {
                  return (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                      <h3 className="font-semibold text-amber-800 mb-2">Prochaine étape</h3>
                      <p className="text-amber-700 mb-4">{nextStep.description}</p>
                      <Link 
                        href={nextStep.id === 'menu' ? '/generate-menu' : '/dashboard'}
                        className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors inline-flex items-center"
                      >
                        {nextStep.title}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </div>
                  )
                }
                return null
              })()}

              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Vos statistiques</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">IMC</span>
                    <span className="font-semibold">{state.profile?.bmi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Besoins énergétiques</span>
                    <span className="font-semibold">{state.profile?.tdee} kcal/j</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Menus générés</span>
                    <span className="font-semibold">{state.hasGeneratedMenu ? '1+' : '0'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
                <div className="space-y-3">
                  <Link 
                    href="/generate-menu"
                    className="block w-full bg-primary-500 text-white px-4 py-3 rounded-lg hover:bg-primary-600 transition-colors text-center"
                  >
                    Nouveau menu
                  </Link>
                  <Link 
                    href="/shopping-assistant"
                    className="block w-full border border-primary-500 text-primary-500 px-4 py-3 rounded-lg hover:bg-primary-50 transition-colors text-center"
                  >
                    Liste de courses
                  </Link>
                  <Link 
                    href="/profile"
                    className="block w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-center"
                  >
                    Modifier profil
                  </Link>
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