'use client'

import { useState } from 'react'
import { ArrowLeft, Utensils, Clock, Leaf, Loader2, CheckCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { apiClient, type MenuPreferences, type GeneratedMenu } from '@/lib/api'
import { trackMenuGeneration } from '@/lib/analytics'
import { useUserJourney } from '@/hooks/useUserJourney'

export default function GenerateMenuPage() {
  const { actions, state } = useUserJourney()
  const [preferences, setPreferences] = useState<MenuPreferences>({
    people: 1, // Default to 1 person, hidden from UI
    budget: 'medium',
    cookingTime: 'medium',
    dietaryRestrictions: state.profile?.allergies || [],
  })
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedMenu, setGeneratedMenu] = useState<GeneratedMenu | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCustomization, setShowCustomization] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    
    // Track menu generation with analytics
    trackMenuGeneration(preferences)
    
    try {
      const response = await apiClient.generateMenu(preferences)
      
      if (response.success && response.data) {
        setGeneratedMenu(response.data)
        // Mark the menu generation step as complete
        actions.setHasGeneratedMenu(true)
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
                  Votre menu vegan parfait !
                </h1>
                <p className="text-gray-600">
                  Félicitations ! Voici votre plan alimentaire vegan parfaitement équilibré
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
            <Sparkles className="h-16 w-16 text-primary-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Votre menu vegan parfait
            </h1>
            <p className="text-gray-600">
              Le meilleur plan alimentaire vegan, conçu pour tout le monde
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Main CTA */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-green-50 to-primary-50 border border-primary-200 rounded-xl p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center justify-center">
                <Leaf className="h-6 w-6 text-primary-500 mr-2" />
                Menu universel VeganFlemme
              </h2>
              <p className="text-gray-700 mb-4">
                Notre menu par défaut est parfait pour tous : équilibré nutritionnellement selon les RNP ANSES, 
                délicieux, et conçu pour satisfaire tous les goûts. Aucune personnalisation nécessaire !
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-green-600 mb-4">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>100% équilibré</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Pour tous les goûts</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Zéro effort</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="brand-gradient text-white px-12 py-4 rounded-lg font-semibold text-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center mb-4"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-6 w-6 mr-2 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Sparkles className="h-6 w-6 mr-2" />
                  Générer mon menu vegan !
                </>
              )}
            </button>
            
            <p className="text-sm text-gray-500 mb-6">
              Génération conforme aux recommandations ANSES - Parfait pour débuter !
            </p>

            {/* Optional customization toggle */}
            <button
              onClick={() => setShowCustomization(!showCustomization)}
              className="text-primary-500 hover:text-primary-600 text-sm font-medium underline"
            >
              {showCustomization ? 'Masquer les options' : 'Personnaliser mon menu (optionnel)'}
            </button>
          </div>

          {/* Optional customization section */}
          {showCustomization && (
            <div className="border-t border-gray-200 pt-6 space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Ces options sont entièrement optionnelles !</strong> Notre menu par défaut 
                  est déjà parfait. Personnalisez seulement si vous avez des besoins spécifiques.
                </p>
              </div>

              {/* Budget */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-3">
                  Budget par semaine (optionnel)
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
                  Temps de cuisine (optionnel)
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
            </div>
          )}
        </div>
      </div>
    </main>
  )
}