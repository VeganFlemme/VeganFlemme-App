'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Loader2, BarChart3 } from 'lucide-react'
import { apiClient } from '@/lib/api'

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
}

export default function DemoPage() {
  const [dailyMeals, setDailyMeals] = useState<DailyMeal[]>([])
  const [nutritionData, setNutritionData] = useState<NutritionData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoadingNutrition, setIsLoadingNutrition] = useState(false)
  const [selectedDay, setSelectedDay] = useState(0)
  const [generatedMenu, setGeneratedMenu] = useState<any>(null)

  // Load both menu and nutrition data
  useEffect(() => {
    generateMenu()
    loadNutritionData()
  }, [])

  const generateMenu = async () => {
    setIsGenerating(true)
    
    try {
      const response = await apiClient.generateMenu({
        people: 1,
        budget: 'medium',
        cookingTime: 'medium',
        dietaryRestrictions: [],
        daysCount: 7,
        userId: 'demo_user'
      })

      if (response.success && response.data) {
        setGeneratedMenu(response.data)
        
        if (response.data.days && response.data.days.length > 0) {
          const firstDay = response.data.days[0]
          const convertedMeals: DailyMeal[] = []
          
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
      }
    } catch (error) {
      console.error('Menu generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const loadNutritionData = async () => {
    setIsLoadingNutrition(true)
    try {
      const response = await apiClient.getDailyTracking('demo_user')
      if (response.success && response.data) {
        setNutritionData(response.data)
      }
    } catch (error) {
      console.error('Failed to load nutrition data:', error)
    } finally {
      setIsLoadingNutrition(false)
    }
  }

  const totalNutrition = dailyMeals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">🌱 VeganFlemme Demo</h1>
            <p className="text-xl text-green-100 mb-8">
              Génération de menus vegan personnalisés avec analyse nutritionnelle RNP ANSES
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={generateMenu}
                disabled={isGenerating}
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50 inline-flex items-center"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2" />
                    Nouveau Menu
                  </>
                )}
              </button>
              <button
                onClick={loadNutritionData}
                disabled={isLoadingNutrition}
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-600 disabled:opacity-50 inline-flex items-center"
              >
                {isLoadingNutrition ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Nutrition
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Menu Personnalisé</h2>
                {generatedMenu && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Score d'optimisation</div>
                    <div className="text-2xl font-bold text-green-600">
                      {generatedMenu.optimizationScore}%
                    </div>
                  </div>
                )}
              </div>

              {dailyMeals.length === 0 && !isGenerating ? (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">Aucun menu généré</div>
                  <button
                    onClick={generateMenu}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                  >
                    Générer un menu
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {dailyMeals.map((meal) => (
                    <div key={meal.id} className="border border-gray-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                            {meal.time}
                          </span>
                          <span className="text-gray-500 text-sm uppercase tracking-wide">
                            {meal.type}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">{meal.calories} kcal</div>
                          <div className="text-sm text-gray-500">{meal.protein}g protéines</div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-gray-900 mb-3">{meal.name}</h3>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                        <span>⏱️ {meal.cookingTime} min</span>
                        <span>🍽️ {meal.carbs}g glucides</span>
                        <span>🥑 {meal.fat}g lipides</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {meal.ingredients.map((ingredient, idx) => (
                          <span key={idx} className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm">
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Nutrition Panel */}
          <div className="space-y-6">
            {/* Daily Totals */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Journalier</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Calories</span>
                  <span className="font-semibold">{totalNutrition.calories} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Protéines</span>
                  <span className="font-semibold">{totalNutrition.protein}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Glucides</span>
                  <span className="font-semibold">{totalNutrition.carbs}g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Lipides</span>
                  <span className="font-semibold">{totalNutrition.fat}g</span>
                </div>
              </div>
            </div>

            {/* Nutrition Analysis */}
            {nutritionData && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analyse RNP ANSES</h3>
                <div className="space-y-4">
                  {[
                    { name: 'Calories', current: nutritionData.dailyTotals.calories, target: nutritionData.targets.calories, unit: 'kcal' },
                    { name: 'Protéines', current: nutritionData.dailyTotals.protein, target: nutritionData.targets.protein, unit: 'g' },
                    { name: 'Fer', current: nutritionData.dailyTotals.iron, target: nutritionData.targets.iron, unit: 'mg' },
                    { name: 'B12', current: nutritionData.dailyTotals.b12, target: nutritionData.targets.b12, unit: 'μg' },
                    { name: 'Oméga-3', current: nutritionData.dailyTotals.omega3, target: nutritionData.targets.omega3, unit: 'g' }
                  ].map((nutrient) => {
                    const percentage = Math.round((nutrient.current / nutrient.target) * 100)
                    return (
                      <div key={nutrient.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">{nutrient.name}</span>
                          <span className="font-semibold">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              percentage < 80 ? 'bg-red-500' : 
                              percentage <= 120 ? 'bg-green-500' : 
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {nutrient.current} / {nutrient.target} {nutrient.unit}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Environmental Impact */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Environnemental</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {nutritionData ? Math.round((nutritionData.dailyTotals.calories / 2000) * 2.3) : 2.3} kg
                  </div>
                  <div className="text-sm text-green-700">CO2 évité</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">A+</div>
                  <div className="text-sm text-blue-700">Eco-Score</div>
                </div>
              </div>
            </div>

            {/* API Status */}
            <div className="bg-gray-100 rounded-xl p-4">
              <h4 className="font-semibold mb-2">Status API</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Menu API</span>
                  <span className={generatedMenu ? 'text-green-600' : 'text-gray-500'}>
                    {generatedMenu ? '✅ OK' : '⏳ Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Nutrition API</span>
                  <span className={nutritionData ? 'text-green-600' : 'text-gray-500'}>
                    {nutritionData ? '✅ OK' : '⏳ Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Meals Count</span>
                  <span>{dailyMeals.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}