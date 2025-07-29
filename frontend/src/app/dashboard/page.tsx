'use client'

import { ArrowLeft, TrendingUp, Activity, Leaf, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  // Mock data - in real app this would come from API
  const nutritionData = {
    calories: { current: 1850, target: 2000, unit: 'kcal' },
    protein: { current: 85, target: 100, unit: 'g' },
    iron: { current: 12, target: 15, unit: 'mg' },
    b12: { current: 2.1, target: 2.4, unit: 'μg' },
    omega3: { current: 1.8, target: 2.5, unit: 'g' },
  }

  const getPercentage = (current: number, target: number) => (current / target) * 100
  const getColorClass = (percentage: number) => {
    if (percentage < 80) return 'text-red-500'
    if (percentage > 120) return 'text-orange-500'
    return 'text-green-500'
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Link href="/" className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Nutritionnel
          </h1>
          <p className="text-gray-600">
            Suivi temps réel de vos apports selon les RNP ANSES
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Nutrition Gauges */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary-500" />
                Jauges Nutritionnelles
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {Object.entries(nutritionData).map(([key, data]) => {
                  const percentage = getPercentage(data.current, data.target)
                  const colorClass = getColorClass(percentage)
                  
                  return (
                    <div key={key} className="text-center">
                      <div className="relative w-32 h-32 mx-auto mb-3">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="8"
                          />
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            fill="none"
                            stroke={percentage < 80 ? '#ef4444' : percentage > 120 ? '#f97316' : '#20c997'}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${Math.min(percentage, 100) * 3.14} 314`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${colorClass}`}>
                              {Math.round(percentage)}%
                            </div>
                          </div>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 capitalize">{key}</h3>
                      <p className="text-sm text-gray-600">
                        {data.current} / {data.target} {data.unit}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Weekly Evolution */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-primary-500" />
                Évolution sur 7 jours
              </h2>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Graphique d'évolution (à implémenter avec Recharts)</p>
              </div>
            </div>

            {/* Environmental Impact */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Leaf className="h-5 w-5 mr-2 text-primary-500" />
                Impact Environnemental
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">2.3 kg</div>
                  <div className="text-sm text-gray-600">CO2 évité aujourd'hui</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">420 L</div>
                  <div className="text-sm text-gray-600">Eau économisée</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">A+</div>
                  <div className="text-sm text-gray-600">Eco-Score moyen</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Alerts */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                Alertes
              </h2>
              <div className="space-y-3">
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="text-sm font-medium text-orange-800">Déficit en Oméga-3</div>
                  <div className="text-xs text-orange-600 mt-1">
                    Ajoutez des graines de lin ou noix
                  </div>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="text-sm font-medium text-yellow-800">B12 à surveiller</div>
                  <div className="text-xs text-yellow-600 mt-1">
                    Pensez à votre supplément quotidien
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Actions rapides
              </h2>
              <div className="space-y-3">
                <Link href="/generate-menu" className="block w-full bg-primary-500 text-white text-center py-3 rounded-lg hover:bg-primary-600 transition-colors">
                  Nouveau menu
                </Link>
                <button className="w-full border border-primary-500 text-primary-500 py-3 rounded-lg hover:bg-primary-50 transition-colors">
                  Ajouter repas
                </button>
                <button className="w-full border border-gray-300 text-gray-600 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  Exporter données
                </button>
              </div>
            </div>

            {/* This Week Summary */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Résumé semaine
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Menus générés</span>
                  <span className="font-semibold">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Paniers créés</span>
                  <span className="font-semibold">2</span>
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