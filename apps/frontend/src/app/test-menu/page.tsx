'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react'
import Link from 'next/link'
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

export default function TestMenuPage() {
  const [dailyMeals, setDailyMeals] = useState<DailyMeal[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDay, setSelectedDay] = useState(0)
  const [generatedMenu, setGeneratedMenu] = useState<any>(null)

  // Generate initial menu on load
  useEffect(() => {
    generateMenu()
  }, [])

  const generateMenu = async () => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await apiClient.generateMenu({
        people: 1,
        budget: 'medium',
        cookingTime: 'medium',
        dietaryRestrictions: [],
        daysCount: 7,
        userId: 'demo_user'
      })

      console.log('API Response:', response)

      if (response.success && response.data) {
        setGeneratedMenu(response.data)
        // Convert first day's meals to display format
        if (response.data.days && response.data.days.length > 0) {
          const firstDay = response.data.days[0]
          const convertedMeals: DailyMeal[] = []
          
          console.log('First day data:', firstDay)
          
          // Process each meal type in the day
          const mealTimes = [
            { key: 'breakfast', time: '8h00', type: 'breakfast' },
            { key: 'lunch', time: '12h30', type: 'lunch' },
            { key: 'dinner', time: '19h30', type: 'dinner' }
          ]
          
          mealTimes.forEach((mealTime, index) => {
            const meal = firstDay[mealTime.key as keyof typeof firstDay]
            console.log(`${mealTime.key} meal:`, meal)
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
                ingredients: ((meal as any).ingredients?.map((ing: any) => ing.name || ing) || []).slice(0, 5)
              })
            }
          })
          
          console.log('Converted meals:', convertedMeals)
          setDailyMeals(convertedMeals)
        }
      } else {
        throw new Error(response.error || 'Failed to generate menu')
      }
    } catch (err) {
      console.error('Menu generation failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate menu')
    } finally {
      setIsGenerating(false)
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
          <button
            onClick={generateMenu}
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
                Nouveau menu
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
          <div className="flex items-center">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Test Menu Generation</h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Meals */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Repas du jour</h2>
            {dailyMeals.length === 0 && !isGenerating && (
              <p className="text-gray-500">Aucun repas généré</p>
            )}
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
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Nutrition Info */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Info Nutritionnelles</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
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

            {/* Debug Info */}
            <div className="mt-6 bg-gray-100 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Debug Info</h3>
              <div className="text-xs space-y-1">
                <div>Selected Day: {selectedDay}</div>
                <div>Total Days: {generatedMenu?.days?.length || 0}</div>
                <div>Meals Count: {dailyMeals.length}</div>
                <div>Loading: {isGenerating ? 'Yes' : 'No'}</div>
                <div>Error: {error || 'None'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}