'use client'

import { ArrowLeft, TrendingUp, Leaf, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useUserJourney } from '@/hooks/useUserJourney'
import JourneyProgress from '@/components/JourneyProgress'

export default function DashboardPage() {
  const { state, actions } = useUserJourney()

  // If no profile, redirect will be handled by JourneyGuard
  if (!state.profile?.isComplete) {
    return (
      <main className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre profil...</p>
        </div>
      </main>
    )
  }

  const nextStep = actions.getNextRequiredStep()

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/" className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l&apos;accueil
        </Link>

        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary-500 to-green-500 rounded-2xl text-white p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Bonjour {state.profile.name?.split(' ')[0]} !
          </h1>
          <p className="text-primary-100 mb-4">
            Tableau de bord personnalisé pour votre transition végane
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{state.profile.bmi}</div>
              <div className="text-sm text-primary-100">IMC</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{state.profile.tdee}</div>
              <div className="text-sm text-primary-100">kcal/jour</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{state.completionPercentage}%</div>
              <div className="text-sm text-primary-100">Progression</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold">{state.hasGeneratedMenu ? '1+' : '0'}</div>
              <div className="text-sm text-primary-100">Menus</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Next Action Card */}
            {nextStep && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start">
                  <AlertTriangle className="h-6 w-6 text-amber-600 mt-1 mr-3" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-800 mb-2">Prochaine étape recommandée</h3>
                    <p className="text-amber-700 mb-4">{nextStep.description}</p>
                    <Link 
                      href={nextStep.id === 'menu' ? '/generate-menu' : '/dashboard'}
                      className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors inline-flex items-center font-medium"
                    >
                      {nextStep.title}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Journey Progress */}
            <JourneyProgress />

            {/* Nutrition Overview (Mock Data) */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                    <TrendingUp className="h-6 w-6 text-primary-500 mr-3" />
                    Jauges Nutritionnelles
                  </h2>
                  <p className="text-gray-600">Suivi temps réel de vos apports selon les RNP ANSES</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Calories', current: 1850, target: 2000, unit: 'kcal', color: 'green' },
                  { name: 'Protéines', current: 85, target: 100, unit: 'g', color: 'blue' },
                  { name: 'Fer', current: 12, target: 15, unit: 'mg', color: 'red' },
                  { name: 'B12', current: 2.1, target: 2.4, unit: 'μg', color: 'purple' },
                  { name: 'Oméga-3', current: 1.8, target: 2.5, unit: 'g', color: 'orange' },
                  { name: 'Fibres', current: 28, target: 30, unit: 'g', color: 'emerald' }
                ].map((nutrient) => {
                  const percentage = Math.round((nutrient.current / nutrient.target) * 100)
                  const isLow = percentage < 80
                  
                  return (
                    <div key={nutrient.name} className="text-center">
                      <div className="relative w-24 h-24 mx-auto mb-3">
                        <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            stroke={isLow ? "#ef4444" : "#10b981"}
                            strokeWidth="8"
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={`${percentage * 2.51} 251`}
                            className="transition-all duration-300"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-lg font-bold ${isLow ? 'text-red-600' : 'text-green-600'}`}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 capitalize">{nutrient.name}</h3>
                      <p className="text-sm text-gray-600">
                        {nutrient.current} / {nutrient.target} {nutrient.unit}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Impact Environmental */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Leaf className="h-6 w-6 text-green-500 mr-3" />
                Impact Environnemental
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600 mb-1">2.3 kg</div>
                  <div className="text-sm text-green-700">CO2 évité aujourd'hui</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600 mb-1">420 L</div>
                  <div className="text-sm text-blue-700">Eau économisée</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600 mb-1">A+</div>
                  <div className="text-sm text-purple-700">Eco-Score moyen</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <Link 
                  href="/generate-menu"
                  className="block w-full bg-primary-500 text-white px-4 py-3 rounded-lg hover:bg-primary-600 transition-colors text-center font-medium"
                >
                  Nouveau menu
                </Link>
                <Link 
                  href="/shopping-assistant"
                  className="block w-full border border-primary-500 text-primary-500 px-4 py-3 rounded-lg hover:bg-primary-50 transition-colors text-center font-medium"
                >
                  Liste de courses
                </Link>
                <Link 
                  href="/profile"
                  className="block w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
                >
                  Modifier profil
                </Link>
              </div>
            </div>

            {/* Alertes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                Alertes
              </h3>
              
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="font-medium text-amber-800">Déficit en Oméga-3</div>
                  <div className="text-sm text-amber-700">Ajoutez des graines de lin ou noix</div>
                </div>
                
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-blue-800">B12 à surveiller</div>
                  <div className="text-sm text-blue-700">Pensez à votre supplément quotidien</div>
                </div>
              </div>
            </div>

            {/* Résumé semaine */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Résumé semaine</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Menus générés</span>
                  <span className="font-semibold">{state.hasGeneratedMenu ? '1+' : '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paniers créés</span>
                  <span className="font-semibold">{state.hasCreatedShoppingList ? '1+' : '0'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CO2 évité</span>
                  <span className="font-semibold text-green-600">16.1 kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}