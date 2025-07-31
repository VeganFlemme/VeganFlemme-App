'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, TrendingUp, Leaf, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'

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

export default function TestDashboardPage() {
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load nutrition data
  useEffect(() => {
    const loadNutritionData = async () => {
      try {
        const response = await apiClient.getDailyTracking('demo_user')
        console.log('Nutrition API response:', response)
        if (response.success && response.data) {
          setNutritionData(response.data)
        } else {
          setError('Failed to load nutrition data')
        }
      } catch (error) {
        console.error('Failed to load nutrition data:', error)
        setError('Error loading data')
      } finally {
        setIsLoading(false)
      }
    }

    loadNutritionData()
  }, [])

  // Prepare nutrition display data
  const nutritionMetrics = nutritionData ? [
    { 
      name: 'Calories', 
      current: nutritionData.dailyTotals.calories, 
      target: nutritionData.targets.calories, 
      unit: 'kcal'
    },
    { 
      name: 'Protéines', 
      current: nutritionData.dailyTotals.protein, 
      target: nutritionData.targets.protein, 
      unit: 'g'
    },
    { 
      name: 'Fer', 
      current: nutritionData.dailyTotals.iron, 
      target: nutritionData.targets.iron, 
      unit: 'mg'
    },
    { 
      name: 'B12', 
      current: nutritionData.dailyTotals.b12, 
      target: nutritionData.targets.b12, 
      unit: 'μg'
    },
    { 
      name: 'Oméga-3', 
      current: nutritionData.dailyTotals.omega3, 
      target: nutritionData.targets.omega3, 
      unit: 'g'
    },
    { 
      name: 'Fibres', 
      current: nutritionData.dailyTotals.fiber, 
      target: nutritionData.targets.fiber, 
      unit: 'g'
    }
  ] : []

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

        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-green-500 rounded-2xl text-white p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Dashboard Test - Nutrition API
          </h1>
          <p className="text-primary-100 mb-4">
            Testeur d'intégration des APIs nutritionnelles
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Nutrition Overview with Real Data */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
                    <TrendingUp className="h-6 w-6 text-primary-500 mr-3" />
                    Jauges Nutritionnelles
                  </h2>
                  <p className="text-gray-600">
                    {isLoading ? 'Chargement...' : 'Données temps réel via API nutritionnelle'}
                  </p>
                </div>
                {!isLoading && nutritionData && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500">RNP Global</div>
                    <div className="text-lg font-semibold text-primary-600">
                      {Math.round((nutritionData.dailyTotals.calories / nutritionData.targets.calories) * 100)}%
                    </div>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="text-center">
                      <div className="w-24 h-24 mx-auto mb-3 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              ) : (
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
                      </div>
                    )
                  })}
                </div>
              )}

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

            {/* Impact Environmental */}
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
                  Basé sur {nutritionData.dailyTotals.calories} kcal consommées
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* API Status */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Status API</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Connexion</span>
                  <span className={`font-semibold ${!error ? 'text-green-600' : 'text-red-600'}`}>
                    {!error ? 'OK' : 'Erreur'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Données</span>
                  <span className={`font-semibold ${nutritionData ? 'text-green-600' : 'text-gray-500'}`}>
                    {nutritionData ? 'Chargées' : 'En attente'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Loading</span>
                  <span className="font-semibold">{isLoading ? 'Oui' : 'Non'}</span>
                </div>
              </div>
            </div>

            {/* Alerts */}
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
                    {nutritionData.dailyTotals.b12 < nutritionData.targets.b12 * 0.8 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="font-medium text-red-800">B12 insuffisante</div>
                        <div className="text-sm text-red-700">
                          {nutritionData.dailyTotals.b12.toFixed(1)}μg / {nutritionData.targets.b12}μg
                        </div>
                      </div>
                    )}
                    
                    {nutritionData.dailyTotals.omega3 < nutritionData.targets.omega3 * 0.8 && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="font-medium text-amber-800">Déficit Oméga-3</div>
                        <div className="text-sm text-amber-700">
                          {nutritionData.dailyTotals.omega3.toFixed(1)}g / {nutritionData.targets.omega3}g
                        </div>
                      </div>
                    )}
                    
                    {nutritionData.dailyTotals.iron < nutritionData.targets.iron * 0.8 && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <div className="font-medium text-orange-800">Fer faible</div>
                        <div className="text-sm text-orange-700">
                          {nutritionData.dailyTotals.iron.toFixed(1)}mg / {nutritionData.targets.iron}mg
                        </div>
                      </div>
                    )}
                    
                    {nutritionData.dailyTotals.protein >= nutritionData.targets.protein * 0.8 && 
                     nutritionData.dailyTotals.b12 >= nutritionData.targets.b12 * 0.8 && 
                     nutritionData.dailyTotals.omega3 >= nutritionData.targets.omega3 * 0.8 && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="font-medium text-green-800">Excellent équilibre !</div>
                        <div className="text-sm text-green-700">
                          Tous vos apports nutritionnels sont optimaux
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="font-medium text-gray-800">Pas de données</div>
                    <div className="text-sm text-gray-700">Erreur de chargement API</div>
                  </div>
                )}
              </div>
            </div>

            {/* Debug Info */}
            <div className="bg-gray-100 rounded-xl p-4">
              <h4 className="font-semibold mb-2">Debug Info</h4>
              <div className="text-xs space-y-1">
                <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
                <div>Error: {error || 'None'}</div>
                <div>Data: {nutritionData ? 'Available' : 'Not loaded'}</div>
                <div>Calories: {nutritionData?.dailyTotals?.calories || 0}</div>
                <div>Protein: {nutritionData?.dailyTotals?.protein || 0}g</div>
                <div>B12: {nutritionData?.dailyTotals?.b12 || 0}μg</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}