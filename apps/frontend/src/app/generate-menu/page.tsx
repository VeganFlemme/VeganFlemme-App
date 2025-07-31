'use client'

import { useState } from 'react'
import { ArrowLeft, Utensils, Clock, Users, Loader2, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { apiClient, type MenuPreferences, type GeneratedMenu } from '@/lib/api'
import { trackMenuGeneration } from '@/lib/analytics'

export default function GenerateMenuPage() {
  const [preferences, setPreferences] = useState<MenuPreferences>({
    people: 2,
    budget: 'medium',
    cookingTime: 'medium',
    dietaryRestrictions: [],
  })
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMenu, setGeneratedMenu] = useState<GeneratedMenu | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    
    // Track menu generation with analytics
    trackMenuGeneration(preferences)
    
    try {
      const response = await apiClient.generateMenu(preferences)
      
      if (response.success && response.data) {
        setGeneratedMenu(response.data)
      } else {
        setError(response.error || 'Failed to generate menu')
      }
    } catch (err) {
      setError('Une erreur est survenue lors de la génération du menu')
    } finally {
      setIsGenerating(false)
    }
  }

  if (generatedMenu) {
    return (
      <main className="min-h-screen bg-neutral-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Link href="/" className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l&apos;accueil
          </Link>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                  Menu généré avec succès !
                </h1>
                <p className="text-gray-600">
                  Voici votre menu personnalisé pour {preferences.people} personne(s)
                </p>
              </div>
              <button 
                onClick={() => setGeneratedMenu(null)}
                className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Nouveau menu
              </button>
            </div>

            {/* Nutrition Summary */}
            <div className="mb-8 p-6 bg-green-50 rounded-xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Résumé nutritionnel</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{generatedMenu.nutritionSummary.dailyCalories}</div>
                  <div className="text-sm text-gray-600">Calories/jour</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(Object.values(generatedMenu.nutritionSummary.rnpCoverage).reduce((a, b) => a + b, 0) / Object.keys(generatedMenu.nutritionSummary.rnpCoverage).length)}%
                  </div>
                  <div className="text-sm text-gray-600">Couverture RNP moyenne</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{generatedMenu.shoppingList.totalCost}€</div>
                  <div className="text-sm text-gray-600">Coût semaine</div>
                </div>
              </div>
            </div>

            {/* Meals */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Vos repas</h2>
              {generatedMenu.meals.map((meal) => (
                <div key={meal.id} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{meal.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span className="capitalize">{meal.type}</span>
                        <span>{meal.cookingTime} min</span>
                        <span className="capitalize">{meal.difficulty}</span>
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                          Eco-Score {meal.ecoScore}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{meal.nutrition.calories} kcal</div>
                      <div className="text-sm text-gray-600">par portion</div>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Ingrédients</h4>
                      <ul className="space-y-1 text-sm">
                        {meal.ingredients.map((ingredient, idx) => (
                          <li key={idx} className="flex justify-between">
                            <span>{ingredient.name}</span>
                            <span className="text-gray-600">
                              {ingredient.quantity} {ingredient.unit}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Nutrition</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>Protéines</span>
                          <span>{meal.nutrition.protein}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fibres</span>
                          <span>{meal.nutrition.fiber}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Fer</span>
                          <span>{meal.nutrition.iron}mg</span>
                        </div>
                        <div className="flex justify-between">
                          <span>B12</span>
                          <span>{meal.nutrition.b12}μg</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Shopping List */}
            <div className="mt-8 p-6 bg-blue-50 rounded-xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Liste de courses</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {generatedMenu.shoppingList.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-gray-600 ml-2">x{item.quantity}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{item.price.toFixed(2)}€</div>
                      <div className="text-xs text-gray-600">{item.store}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total</span>
                  <span>{generatedMenu.shoppingList.totalCost.toFixed(2)}€</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/" className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l&apos;accueil
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <Utensils className="h-16 w-16 text-primary-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Générer votre menu vegan
            </h1>
            <p className="text-gray-600">
              Personnalisez vos préférences pour un menu 100% adapté à vos besoins
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-8">
            {/* Number of people */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                <Users className="h-5 w-5 inline mr-2" />
                Nombre de personnes
              </label>
              <div className="flex gap-3">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => setPreferences(prev => ({ ...prev, people: num }))}
                    className={`w-12 h-12 rounded-lg border-2 font-semibold transition-colors ${
                      preferences.people === num
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : 'border-gray-200 text-gray-600 hover:border-primary-300'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                Budget par semaine
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'low', label: 'Économique', price: '< 50€' },
                  { value: 'medium', label: 'Modéré', price: '50-80€' },
                  { value: 'high', label: 'Confort', price: '> 80€' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPreferences(prev => ({ ...prev, budget: option.value }))}
                    className={`p-4 rounded-lg border-2 text-center transition-colors ${
                      preferences.budget === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.price}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cooking time */}
            <div>
              <label className="block text-lg font-semibold text-gray-900 mb-3">
                <Clock className="h-5 w-5 inline mr-2" />
                Temps de cuisine
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'quick', label: 'Express', time: '< 15 min' },
                  { value: 'medium', label: 'Classique', time: '15-30 min' },
                  { value: 'long', label: 'Gourmet', time: '> 30 min' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPreferences(prev => ({ ...prev, cookingTime: option.value }))}
                    className={`p-4 rounded-lg border-2 text-center transition-colors ${
                      preferences.cookingTime === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.time}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            <div className="text-center pt-6">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="brand-gradient text-white px-12 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  'Générer mon menu vegan'
                )}
              </button>
              <p className="text-sm text-gray-500 mt-3">
                Génération conforme aux recommandations ANSES
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}