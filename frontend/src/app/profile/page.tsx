'use client'

import { useState } from 'react'
import { ArrowLeft, User, Save, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    activity: 'moderate',
    goal: 'maintain',
    allergies: [] as string[],
    dislikes: [] as string[],
  })

  const handleSave = () => {
    // TODO: Implement profile save
    console.log('Saving profile:', profile)
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
            <User className="h-16 w-16 text-primary-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mon Profil
            </h1>
            <p className="text-gray-600">
              Personnalisez votre profil pour des recommandations optimales
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Personal Info */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                Informations personnelles
              </h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Votre nom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="votre@email.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Âge
                  </label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genre
                  </label>
                  <select
                    value={profile.gender}
                    onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Choisir</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taille (cm)
                  </label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) => setProfile(prev => ({ ...prev, height: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="170"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Poids (kg)
                  </label>
                  <input
                    type="number"
                    value={profile.weight}
                    onChange={(e) => setProfile(prev => ({ ...prev, weight: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="70"
                  />
                </div>
              </div>
            </div>

            {/* Objectives & Preferences */}
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
                Objectifs & Préférences
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau d'activité
                </label>
                <select
                  value={profile.activity}
                  onChange={(e) => setProfile(prev => ({ ...prev, activity: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="sedentary">Sédentaire</option>
                  <option value="light">Activité légère</option>
                  <option value="moderate">Activité modérée</option>
                  <option value="intense">Activité intense</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objectif
                </label>
                <select
                  value={profile.goal}
                  onChange={(e) => setProfile(prev => ({ ...prev, goal: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="lose">Perte de poids</option>
                  <option value="maintain">Maintien</option>
                  <option value="gain">Prise de masse</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies alimentaires
                </label>
                <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-lg min-h-[100px]">
                  {['Gluten', 'Soja', 'Noix', 'Graines', 'Légumineuses'].map((allergy) => (
                    <button
                      key={allergy}
                      onClick={() => {
                        const newAllergies = profile.allergies.includes(allergy)
                          ? profile.allergies.filter(a => a !== allergy)
                          : [...profile.allergies, allergy]
                        setProfile(prev => ({ ...prev, allergies: newAllergies }))
                      }}
                      className={`px-3 py-1 rounded-full text-sm border ${
                        profile.allergies.includes(allergy)
                          ? 'bg-red-100 border-red-300 text-red-700'
                          : 'bg-gray-100 border-gray-300 text-gray-600 hover:border-red-300'
                      }`}
                    >
                      {allergy}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                  <div className="text-sm text-yellow-700">
                    <p className="font-medium">Calcul IMC et TDEE automatique</p>
                    <p className="mt-1">
                      Vos besoins nutritionnels seront calculés selon les RNP ANSES 
                      en fonction de vos données personnelles.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center pt-8 border-t mt-8">
            <button
              onClick={handleSave}
              className="brand-gradient text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity inline-flex items-center"
            >
              <Save className="h-5 w-5 mr-2" />
              Sauvegarder le profil
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}