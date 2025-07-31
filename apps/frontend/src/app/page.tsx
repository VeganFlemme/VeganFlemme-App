'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Clock, DollarSign, Activity, AlertTriangle, BarChart3, ShoppingCart } from 'lucide-react'
import { useUserJourney } from '@/hooks/useUserJourney'

// Type definition for menu preferences
type MenuPreferences = {
  people: number
  budget: string
  cookingTime: string
  dietaryRestrictions: string[]
}

// Mock meal data for immediate display (replace with API call later)
const mockDailyMeals = [
  {
    id: '1',
    name: 'Porridge aux fruits rouges et graines',
    type: 'breakfast',
    time: '8h00',
    cookingTime: 10,
    calories: 420,
    protein: 15,
    carbs: 65,
    fat: 12,
    ingredients: ['Flocons d\'avoine', 'Fruits rouges', 'Graines de chia', 'Lait d\'amande']
  },
  {
    id: '2', 
    name: 'Salade de quinoa aux légumes grillés',
    type: 'lunch',
    time: '12h30',
    cookingTime: 25,
    calories: 520,
    protein: 18,
    carbs: 70,
    fat: 16,
    ingredients: ['Quinoa', 'Courgettes', 'Poivrons', 'Pois chiches', 'Huile d\'olive']
  },
  {
    id: '3',
    name: 'Houmous de betterave et légumes croquants',
    type: 'snack', 
    time: '16h00',
    cookingTime: 5,
    calories: 180,
    protein: 8,
    carbs: 22,
    fat: 7,
    ingredients: ['Betterave cuite', 'Haricots blancs', 'Tahini', 'Carottes', 'Concombre']
  },
  {
    id: '4',
    name: 'Curry de lentilles aux épinards et riz complet',
    type: 'dinner',
    time: '19h30', 
    cookingTime: 30,
    calories: 580,
    protein: 22,
    carbs: 85,
    fat: 14,
    ingredients: ['Lentilles corail', 'Épinards frais', 'Riz complet', 'Lait de coco', 'Épices curry']
  }
]

export default function HomePage() {
  const { actions, state } = useUserJourney()
  const [preferences, setPreferences] = useState<MenuPreferences>({
    people: 1,
    budget: 'medium',
    cookingTime: 'medium',
    dietaryRestrictions: state.profile?.allergies || [],
  })
  
  const [dailyMeals, setDailyMeals] = useState(mockDailyMeals)
  const [isSwapping, setIsSwapping] = useState<string | null>(null)

  // Initialize with meal plan on load
  useEffect(() => {
    actions.setHasGeneratedMenu(true)
  }, [])

  const swapMeal = async (mealId: string) => {
    setIsSwapping(mealId)
    
    // Simulate API call for meal swap
    setTimeout(() => {
      const alternatives = {
        '1': { name: 'Smoothie bowl aux superfruits', calories: 380, protein: 12 },
        '2': { name: 'Buddha bowl aux légumineuses', calories: 580, protein: 22 },
        '3': { name: 'Energy balls aux dattes et noix', calories: 200, protein: 6 },
        '4': { name: 'Risotto de quinoa aux champignons', calories: 620, protein: 20 }
      }
      
      const newMeal = alternatives[mealId as keyof typeof alternatives]
      if (newMeal) {
        setDailyMeals(prev => prev.map(meal => 
          meal.id === mealId 
            ? { ...meal, name: newMeal.name, calories: newMeal.calories, protein: newMeal.protein }
            : meal
        ))
      }
      setIsSwapping(null)
    }, 1000)
  }

  const generateNewDay = () => {
    // Simulate generating a new random day
    const newMeals = [...mockDailyMeals].map(meal => ({
      ...meal,
      id: Math.random().toString()
    }))
    setDailyMeals(newMeals)
  }

  const generateShoppingList = () => {
    // TODO: Implement shopping list generation with affiliate links
    const allIngredients = dailyMeals.flatMap(meal => meal.ingredients)
    alert(`Liste de courses générée !\n\nIngrédients nécessaires:\n${allIngredients.join('\n')}\n\n(Redirection vers partenaire affilié à venir...)`)
  }

  const totalNutrition = dailyMeals.reduce((acc, meal) => ({
    calories: acc.calories + meal.calories,
    protein: acc.protein + meal.protein,
    carbs: acc.carbs + meal.carbs,
    fat: acc.fat + meal.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 })

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header with generation button */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">VeganFlemme - Plan alimentaire du jour</h1>
          <button
            onClick={generateNewDay}
            className="inline-flex items-center bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Nouveau jour aléatoire
          </button>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Left Sidebar - Optional Customization */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personnalisation</h2>
          <p className="text-sm text-gray-600 mb-6">Optionnel - à choisir ou non</p>

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
                  onClick={() => setPreferences(prev => ({ ...prev, cookingTime: option.value }))}
                  className={`p-2 text-xs rounded border text-center ${
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
                  onClick={() => setPreferences(prev => ({ ...prev, budget: option.value }))}
                  className={`p-2 text-xs rounded border text-center ${
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Menu aléatoire d'aujourd'hui</h2>
            <p className="text-gray-600 mb-8">Équilibré automatiquement - aucun effort requis</p>

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
                      title="Échanger ce repas"
                    >
                      <RefreshCw className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Shopping List Generation Button */}
            <div className="mt-8 text-center">
              <button
                onClick={generateShoppingList}
                className="inline-flex items-center bg-green-600 text-white px-8 py-4 rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
              >
                <ShoppingCart className="h-6 w-6 mr-3" />
                Générer liste de courses chez partenaire
              </button>
              <p className="text-sm text-gray-500 mt-2">
                Commande automatique avec tous les ingrédients nécessaires
              </p>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Nutrition Dashboard */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Dashboard nutritionnel
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
              {[
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
              <div className="text-2xl font-bold text-green-600 mb-1">A</div>
              <div className="text-xs text-green-700">Très faible impact carbone</div>
            </div>
          </div>

          {/* Cost */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Coût estimé</h3>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-1">12,50€</div>
              <div className="text-xs text-blue-700">Pour aujourd'hui</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

