'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, RefreshCw, Clock, DollarSign, Activity, AlertTriangle, ChefHat, BarChart3, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { apiClient, type MenuPreferences, type GeneratedMenu } from '@/lib/api'
import { trackMenuGeneration } from '@/lib/analytics'
import { useUserJourney } from '@/hooks/useUserJourney'

interface DailyMeal {
  id: string
  name: string
  type: string
  time: string
  cookingTime: number
  calories: number
  protein: number
  carbs: number
  fat: number
  ingredients: string[]
}

export default function GenerateMenuPage() {
  const { actions, state } = useUserJourney()
  const [preferences, setPreferences] = useState<MenuPreferences>({
    people: 1,
    budget: 'medium',
    cookingTime: 'medium',
    dietaryRestrictions: state.profile?.allergies || [],
  })
  
  const [generatedMenu, setGeneratedMenu] = useState<GeneratedMenu | null>(null)
  const [dailyMeals, setDailyMeals] = useState<DailyMeal[]>([])
  const [isSwapping, setIsSwapping] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState(0)

  // Generate initial menu on load
  useEffect(() => {
    generateMenu()
  }, [])

  const generateMenu = async () => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await apiClient.generateMenu({
        ...preferences,
        daysCount: 7,
        userId: state.profile?.id || 'demo_user'
      })

      if (response.success && response.data) {
        setGeneratedMenu(response.data)
        // Convert first day's meals to display format
        if (response.data.days && response.data.days.length > 0) {
          const firstDay = response.data.days[0]
          const convertedMeals: DailyMeal[] = []
          
          // Process each meal type in the day
          const mealTimes = [
            { key: 'breakfast', time: '8h00', type: 'breakfast' },
            { key: 'lunch', time: '12h30', type: 'lunch' },
            { key: 'dinner', time: '19h30', type: 'dinner' }
          ]
          
          mealTimes.forEach((mealTime, index) => {
            const meal = firstDay[mealTime.key as keyof typeof firstDay]
            if (meal && typeof meal === 'object') {
              convertedMeals.push({
                id: `${selectedDay}-${index}`,
                name: (meal as any).name || `Repas ${mealTime.type}`,
                type: mealTime.type,
                time: mealTime.time,
                cookingTime: (meal as any).cookingTime || 20,
                calories: Math.round((meal as any).nutrition?.calories || 0),
                protein: Math.round((meal as any).nutrition?.protein || 0),
                carbs: Math.round((meal as any).nutrition?.carbs || 0),
                fat: Math.round((meal as any).nutrition?.fat || 0),
                ingredients: ((meal as any).ingredients?.map((ing: any) => {
                  if (typeof ing === 'string') return ing;
                  if (ing && ing.name) return ing.name;
                  if (ing && ing.foodId) return ing.foodId;
                  return 'Ingrédient';
                }) || []).slice(0, 5)
              })
            }
          })
          
          setDailyMeals(convertedMeals)
        }
        actions.setHasGeneratedMenu(true)
        
        // Track the generation
        trackMenuGeneration({
          userId: state.profile?.id || 'demo_user',
          preferences,
          success: true
        })
      } else {
        throw new Error(response.error || 'Failed to generate menu')
      }
    } catch (err) {
      console.error('Menu generation failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate menu')
      trackMenuGeneration({
        userId: state.profile?.id || 'demo_user',
        preferences,
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const swapMeal = async (mealId: string) => {
    if (!generatedMenu) return
    
    setIsSwapping(mealId)
    
    try {
      const currentMeal = dailyMeals.find(m => m.id === mealId)
      if (!currentMeal) return

      const response = await apiClient.swapIngredient({
        ingredient: currentMeal.name,
        nutritionalTarget: {
          calories: currentMeal.calories,
          protein: currentMeal.protein
        },
        recipeType: currentMeal.type,
        budget: preferences.budget,
        cookingTime: preferences.cookingTime,
        userRestrictions: {
          allergens: preferences.dietaryRestrictions || [],
          intolerances: [],
          preferences: ['vegan'],
          excludedIngredients: []
        }
      })

      if (response.success && response.data?.alternatives?.length > 0) {
        const alternative = response.data.alternatives[0]
        setDailyMeals(prev => prev.map(meal => 
          meal.id === mealId 
            ? { 
                ...meal, 
                name: alternative.name || alternative.ingredient,
                calories: Math.round(alternative.nutrition?.calories || meal.calories),
                protein: Math.round(alternative.nutrition?.protein || meal.protein)
              }
            : meal
        ))
      }
    } catch (err) {
      console.error('Meal swap failed:', err)
    } finally {
      setIsSwapping(null)
    }
  }

  const generateNewDay = () => {
    if (generatedMenu && generatedMenu.days && generatedMenu.days.length > 1) {
      const nextDay = (selectedDay + 1) % generatedMenu.days.length
      setSelectedDay(nextDay)
      
      const dayData = generatedMenu.days[nextDay]
      const convertedMeals: DailyMeal[] = []
      
      // Process each meal type in the day
      const mealTimes = [
        { key: 'breakfast', time: '8h00', type: 'breakfast' },
        { key: 'lunch', time: '12h30', type: 'lunch' },
        { key: 'dinner', time: '19h30', type: 'dinner' }
      ]
      
      mealTimes.forEach((mealTime, index) => {
        const meal = dayData[mealTime.key as keyof typeof dayData]
        if (meal && typeof meal === 'object') {
          convertedMeals.push({
            id: `${nextDay}-${index}`,
            name: (meal as any).name || `Repas ${mealTime.type}`,
            type: mealTime.type,
            time: mealTime.time,
            cookingTime: (meal as any).cookingTime || 20,
            calories: Math.round((meal as any).nutrition?.calories || 0),
            protein: Math.round((meal as any).nutrition?.protein || 0),
            carbs: Math.round((meal as any).nutrition?.carbs || 0),
            fat: Math.round((meal as any).nutrition?.fat || 0),
            ingredients: ((meal as any).ingredients?.map((ing: any) => {
              if (typeof ing === 'string') return ing;
              if (ing && ing.name) return ing.name;
              if (ing && ing.foodId) return ing.foodId;
              return 'Ingrédient';
            }) || []).slice(0, 5)
          })
        }
      })
      
      setDailyMeals(convertedMeals)
    } else {
      // Regenerate menu if no more days available
      generateMenu()
    }
  }

  const totalNutrition = dailyMeals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-800">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
          <div className="flex items-center space-x-4">
            {generatedMenu && generatedMenu.days && generatedMenu.days.length > 1 && (
              <span className="text-sm text-gray-500">
                Jour {selectedDay + 1} sur {generatedMenu.days.length}
              </span>
            )}
            <button
              onClick={generateNewDay}
              disabled={isGenerating}
              className="inline-flex items-center bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Nouveau jour
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
            <div>
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={generateMenu}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen">
        {/* Left Sidebar - Optional Customization */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Options</h2>
          <p className="text-sm text-gray-600 mb-6">Personnalisez votre menu</p>

          {/* People Count */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Personnes</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPreferences(prev => ({ ...prev, people: Math.max(1, prev.people - 1) }))}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-primary-500"
              >
                -
              </button>
              <span className="w-8 text-center">{preferences.people}</span>
              <button
                onClick={() => setPreferences(prev => ({ ...prev, people: prev.people + 1 }))}
                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-primary-500"
              >
                +
              </button>
            </div>
          </div>

          {/* Apply Preferences Button */}
          <div className="mb-6">
            <button
              onClick={generateMenu}
              disabled={isGenerating}
              className="w-full bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50 font-medium"
            >
              {isGenerating ? 'Génération...' : 'Régénérer menu'}
            </button>
          </div>

          {/* Allergies */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Allergies
            </h3>
            <div className="space-y-2">
              {['Gluten', 'Soja', 'Noix', 'Graines'].map((allergy) => (
                <label key={allergy} className="flex items-center">
                  <input type="checkbox" className="rounded text-primary-500 mr-2" />
                  <span className="text-sm">{allergy}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cooking Time */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Temps de cuisson
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'quick', label: 'Express', time: '<15min' },
                { value: 'medium', label: 'Classique', time: '15-30min' },
                { value: 'long', label: 'Gourmet', time: '>30min' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setPreferences(prev => ({ ...prev, cookingTime: option.value }))
                    // Auto-regenerate menu with new preference
                    setTimeout(() => generateMenu(), 100)
                  }}
                  disabled={isGenerating}
                  className={`p-2 text-xs rounded border text-center disabled:opacity-50 ${
                    preferences.cookingTime === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-gray-500">{option.time}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Budget
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'low', label: 'Éco', price: '<50€' },
                { value: 'medium', label: 'Modéré', price: '50-80€' },
                { value: 'high', label: 'Confort', price: '>80€' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setPreferences(prev => ({ ...prev, budget: option.value }))
                    // Auto-regenerate menu with new preference
                    setTimeout(() => generateMenu(), 100)
                  }}
                  disabled={isGenerating}
                  className={`p-2 text-xs rounded border text-center disabled:opacity-50 ${
                    preferences.budget === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-gray-500">{option.price}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Weight Goal */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              <Activity className="h-4 w-4 mr-2" />
              Objectif poids
            </h3>
            <div className="space-y-2">
              {['Maintenir', 'Perdre', 'Prendre'].map((goal) => (
                <label key={goal} className="flex items-center">
                  <input type="radio" name="weight-goal" className="text-primary-500 mr-2" />
                  <span className="text-sm">{goal}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Restrictions */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Restrictions</h3>
            <div className="space-y-2">
              {['Sans sucre', 'Faible sel', 'Cru seulement'].map((restriction) => (
                <label key={restriction} className="flex items-center">
                  <input type="checkbox" className="rounded text-primary-500 mr-2" />
                  <span className="text-sm">{restriction}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Daily Meal Plan */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Plan alimentaire d'aujourd'hui</h1>
            <p className="text-gray-600 mb-8">Équilibré et aléatoire</p>

            <div className="space-y-4">
              {dailyMeals.map((meal) => (
                <div key={meal.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {meal.time}
                        </span>
                        <span className="text-sm text-gray-500 ml-2 capitalize">
                          {meal.type}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{meal.name}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span>{meal.calories} kcal</span>
                        <span>{meal.protein}g protéines</span>
                        <span>{meal.cookingTime} min</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {meal.ingredients.map((ingredient, idx) => (
                          <span key={idx} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded">
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => swapMeal(meal.id)}
                      disabled={isSwapping === meal.id}
                      className="ml-4 p-2 text-gray-400 hover:text-primary-500 disabled:animate-spin"
                    >
                      <RefreshCw className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Nutrition Dashboard */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Infos nutritionnelles
          </h2>

          {/* Daily Totals */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Total du jour</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Calories</span>
                <span className="text-sm font-semibold">{totalNutrition.calories} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Protéines</span>
                <span className="text-sm font-semibold">{totalNutrition.protein}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Glucides</span>
                <span className="text-sm font-semibold">{totalNutrition.carbs}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Lipides</span>
                <span className="text-sm font-semibold">{totalNutrition.fat}g</span>
              </div>
            </div>
          </div>

          {/* RNP Coverage */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Couverture RNP</h3>
            <div className="space-y-3">
              {generatedMenu?.analysis?.rnpCoverage ? 
                Object.entries(generatedMenu.analysis.rnpCoverage).slice(0, 5).map(([nutrient, coverage]) => (
                  <div key={nutrient}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 capitalize">{nutrient.replace('vitamin', 'Vit. ')}</span>
                      <span className="font-semibold">{Math.round(coverage as number)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${(coverage as number) >= 80 ? 'bg-green-500' : (coverage as number) >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(coverage as number, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )) : [
                { nutrient: 'Protéines', coverage: 95 },
                { nutrient: 'Fer', coverage: 88 },
                { nutrient: 'B12', coverage: 100 },
                { nutrient: 'Calcium', coverage: 92 },
                { nutrient: 'Zinc', coverage: 85 }
              ].map((item) => (
                <div key={item.nutrient}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.nutrient}</span>
                    <span className="font-semibold">{item.coverage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min(item.coverage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Eco Score */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Impact environnemental</h3>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {generatedMenu?.analysis?.sustainability?.ecoRating || 'A'}
              </div>
              <div className="text-xs text-green-700">
                {generatedMenu?.analysis?.sustainability?.carbonFootprint 
                  ? `${generatedMenu.analysis.sustainability.carbonFootprint}kg CO2`
                  : 'Très faible impact carbone'
                }
              </div>
            </div>
          </div>

          {/* Cost */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Coût estimé</h3>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {generatedMenu?.analysis?.totalCost 
                  ? `${generatedMenu.analysis.totalCost.toFixed(2)}€`
                  : '12,50€'
                }
              </div>
              <div className="text-xs text-blue-700">Pour aujourd'hui</div>
            </div>
          </div>

          {/* Optimization Score */}
          {generatedMenu?.optimizationScore && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Score d'optimisation</h3>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {generatedMenu.optimizationScore}%
                </div>
                <div className="text-xs text-purple-700">
                  {generatedMenu.optimizationScore >= 80 ? 'Excellent équilibre' :
                   generatedMenu.optimizationScore >= 60 ? 'Bon équilibre' : 
                   'Peut être amélioré'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}