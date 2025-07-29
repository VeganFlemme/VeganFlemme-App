'use client'

import { useState } from 'react'
import { ArrowLeft, Utensils, Clock, Users } from 'lucide-react'
import Link from 'next/link'

export default function GenerateMenuPage() {
  const [preferences, setPreferences] = useState({
    people: 2,
    budget: 'medium',
    cookingTime: 'medium',
    dietaryRestrictions: [] as string[],
    dislikes: [] as string[],
  })

  const handleGenerate = () => {
    // TODO: Implement menu generation logic
    console.log('Generating menu with preferences:', preferences)
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/" className="inline-flex items-center text-primary-500 hover:text-primary-600 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à l'accueil
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
                className="brand-gradient text-white px-12 py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
              >
                Générer mon menu vegan
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