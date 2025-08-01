'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, TrendingUp, Leaf, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useUserJourney } from '@/hooks/useUserJourney'
import { apiClient } from '@/lib/api'
import JourneyProgress from '@/components/JourneyProgress'

interface NutritionData {
  dailyTotals: {
    calories: number
    protein: number
    iron: number
    calcium: number
    b12: number
    omega3: number
    fiber: number
  }
  targets: {
    calories: number
    protein: number
    iron: number
    calcium: number
    b12: number
    omega3: number
    fiber: number
  }
  weeklyAverage?: {
    rnpCoverage: {
      protein: number
      iron: number
      calcium: number
      b12: number
      omega3: number
    }
  }
}

export default function DashboardPage() {
  const { state, actions } = useUserJourney()
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load nutrition data
  useEffect(() => {
    const loadNutritionData = async () => {
      try {
        const response = await apiClient.getDailyTracking('demo_user')
        if (response.success && response.data) {
          setNutritionData(response.data)
        }
      } catch (error) {
        console.error('Failed to load nutrition data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNutritionData()
  }, [])

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

  // Prepare nutrition display data
  const nutritionMetrics = nutritionData ? [
    { 
      name: 'Calories', 
      current: nutritionData.dailyTotals.calories, 
      target: nutritionData.targets.calories, 
      unit: 'kcal', 
      color: 'green' 
    },
    { 
      name: 'Protéines', 
      current: nutritionData.dailyTotals.protein, 
      target: nutritionData.targets.protein, 
      unit: 'g', 
      color: 'blue' 
    },
    { 
      name: 'Fer', 
      current: nutritionData.dailyTotals.iron, 
      target: nutritionData.targets.iron, 
      unit: 'mg', 
      color: 'red' 
    },
    { 
      name: 'B12', 
      current: nutritionData.dailyTotals.b12, 
      target: nutritionData.targets.b12, 
      unit: 'μg', 
      color: 'purple' 
    },
    { 
      name: 'Oméga-3', 
      current: nutritionData.dailyTotals.omega3, 
      target: nutritionData.targets.omega3, 
      unit: 'g', 
      color: 'orange' 
    },
    { 
      name: 'Fibres', 
      current: nutritionData.dailyTotals.fiber, 
      target: nutritionData.targets.fiber, 
      unit: 'g', 
      color: 'emerald' 
    }
  ] : [
    { name: 'Calories', current: 0, target: 2000, unit: 'kcal', color: 'green' },
    { name: 'Protéines', current: 0, target: 100, unit: 'g', color: 'blue' },
    { name: 'Fer', current: 0, target: 15, unit: 'mg', color: 'red' },
    { name: 'B12', current: 0, target: 2.4, unit: 'μg', color: 'purple' },
    { name: 'Oméga-3', current: 0, target: 2.5, unit: 'g', color: 'orange' },
    { name: 'Fibres', current: 0, target: 30, unit: 'g', color: 'emerald' }
  ]

  // Calculate environmental impact based on nutrition data
  const carbonSaved = nutritionData ? Math.round((nutritionData.dailyTotals.calories / 2000) * 2.3) : 2.3
  const waterSaved = nutritionData ? Math.round((nutritionData.dailyTotals.calories / 2000) * 420) : 420

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

            {/* Nutrition Overview with Real Data */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                    <TrendingUp className="h-6 w-6 text-primary-500 mr-3" />
                    Jauges Nutritionnelles
                  </h2>
                  <p className="text-gray-600">
                    {isLoading ? 'Chargement...' : 'Suivi temps réel de vos apports selon les RNP ANSES'}
                  </p>
                </div>
                {!isLoading && nutritionData && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Données du jour</div>
                    <div className="text-lg font-semibold text-primary-600">
                      {Math.round((nutritionData.dailyTotals.calories / nutritionData.targets.calories) * 100)}% RNP
                    </div>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nutritionMetrics.map((nutrient) => {
                  const percentage = Math.round((nutrient.current / nutrient.target) * 100)
                  const isLow = percentage < 80
                  const isOptimal = percentage >= 80 && percentage <= 120
                  
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
                            stroke={isLow ? "#ef4444" : isOptimal ? "#10b981" : "#f59e0b"}
                            strokeWidth="8"
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray={`${Math.min(percentage, 100) * 2.51} 251`}
                            className="transition-all duration-300"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-lg font-bold ${
                            isLow ? 'text-red-600' : 
                            isOptimal ? 'text-green-600' : 
                            'text-yellow-600'
                          }`}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 capitalize">{nutrient.name}</h3>
                      <p className="text-sm text-gray-600">
                        {nutrient.current} / {nutrient.target} {nutrient.unit}
                      </p>
                      {isLoading && (
                        <div className="mt-1 animate-pulse bg-gray-200 h-2 rounded"></div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Weekly Evolution Insight */}
              {nutritionData?.weeklyAverage && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Évolution hebdomadaire</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    {Object.entries(nutritionData.weeklyAverage.rnpCoverage).map(([nutrient, coverage]) => (
                      <div key={nutrient} className="text-center">
                        <div className="font-medium text-blue-800 capitalize">
                          {nutrient}
                        </div>
                        <div className={`text-sm ${
                          coverage >= 80 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {coverage}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Impact Environmental with Real Calculations */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Leaf className="h-6 w-6 text-green-500 mr-3" />
                Impact Environnemental
              </h2>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600 mb-1">{carbonSaved} kg</div>
                  <div className="text-sm text-green-700">CO2 évité aujourd'hui</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{waterSaved} L</div>
                  <div className="text-sm text-blue-700">Eau économisée</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600 mb-1">A+</div>
                  <div className="text-sm text-purple-700">Eco-Score moyen</div>
                </div>
              </div>

              {nutritionData && (
                <div className="mt-4 text-center text-sm text-gray-600">
                  Basé sur {nutritionData.dailyTotals.calories} kcal consommées aujourd'hui
                </div>
              )}
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

            {/* Alertes based on real nutrition data */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                Alertes nutritionnelles
              </h3>
              
              <div className="space-y-3">
                {isLoading ? (
                  <div className="animate-pulse space-y-2">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                ) : nutritionData ? (
                  <>
                    {/* Generate alerts based on real data */}
                    {nutritionData.dailyTotals.b12 < nutritionData.targets.b12 * 0.8 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="font-medium text-red-800">B12 insuffisante</div>
                        <div className="text-sm text-red-700">
                          {nutritionData.dailyTotals.b12.toFixed(1)}μg sur {nutritionData.targets.b12}μg requis - Pensez à votre supplément
                        </div>
                      </div>
                    )}
                    
                    {nutritionData.dailyTotals.omega3 < nutritionData.targets.omega3 * 0.8 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="font-medium text-amber-800">Déficit en Oméga-3</div>
                        <div className="text-sm text-amber-700">
                          {nutritionData.dailyTotals.omega3.toFixed(1)}g sur {nutritionData.targets.omega3}g - Ajoutez graines de lin ou noix
                        </div>
                      </div>
                    )}
                    
                    {nutritionData.dailyTotals.iron < nutritionData.targets.iron * 0.8 && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="font-medium text-orange-800">Fer à surveiller</div>
                        <div className="text-sm text-orange-700">
                          {nutritionData.dailyTotals.iron.toFixed(1)}mg sur {nutritionData.targets.iron}mg - Associez avec vitamine C
                        </div>
                      </div>
                    )}
                    
                    {nutritionData.dailyTotals.protein >= nutritionData.targets.protein * 0.8 && 
                     nutritionData.dailyTotals.b12 >= nutritionData.targets.b12 * 0.8 && 
                     nutritionData.dailyTotals.omega3 >= nutritionData.targets.omega3 * 0.8 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="font-medium text-green-800">Excellent équilibre !</div>
                        <div className="text-sm text-green-700">
                          Tous vos apports nutritionnels sont dans les objectifs RNP
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="font-medium text-gray-800">Données indisponibles</div>
                    <div className="text-sm text-gray-700">Générez un menu pour voir vos alertes personnalisées</div>
                  </div>
                )}
              </div>
            </div>

            {/* Résumé avec données réelles */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Résumé d'aujourd'hui</h3>
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
                  <span className="text-gray-600">Calories consommées</span>
                  <span className="font-semibold text-blue-600">
                    {nutritionData ? `${nutritionData.dailyTotals.calories} kcal` : '0 kcal'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CO2 évité</span>
                  <span className="font-semibold text-green-600">{carbonSaved} kg</span>
                </div>
                {nutritionData && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Équilibre RNP global</div>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min(100, Math.round(
                              (nutritionData.dailyTotals.calories / nutritionData.targets.calories + 
                               nutritionData.dailyTotals.protein / nutritionData.targets.protein + 
                               nutritionData.dailyTotals.iron / nutritionData.targets.iron) / 3 * 100
                            ))}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(
                          (nutritionData.dailyTotals.calories / nutritionData.targets.calories + 
                           nutritionData.dailyTotals.protein / nutritionData.targets.protein + 
                           nutritionData.dailyTotals.iron / nutritionData.targets.iron) / 3 * 100
                        )}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}