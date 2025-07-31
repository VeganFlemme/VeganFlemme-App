'use client'

import { useState } from 'react'
import { ArrowRight, ArrowLeft, CheckCircle, User, Target, AlertTriangle } from 'lucide-react'
import { useUserJourney, UserProfile } from '@/hooks/useUserJourney'
import { useRouter } from 'next/navigation'

interface OnboardingStepProps {
  step: number
  totalSteps: number
  title: string
  subtitle: string
  children: React.ReactNode
  onNext: () => void
  onBack?: () => void
  nextLabel?: string
  nextDisabled?: boolean
}

function OnboardingStep({ 
  step, 
  totalSteps, 
  title, 
  subtitle, 
  children, 
  onNext, 
  onBack, 
  nextLabel = "Continuer",
  nextDisabled = false 
}: OnboardingStepProps) {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">
            Étape {step} sur {totalSteps}
          </span>
          <span className="text-sm font-medium text-primary-600">
            {Math.round((step / totalSteps) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>
        <p className="text-gray-600 text-lg">{subtitle}</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        {children}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          disabled={!onBack}
          className={`inline-flex items-center px-6 py-3 border border-gray-300 rounded-lg font-medium transition-colors ${
            onBack 
              ? 'text-gray-700 bg-white hover:bg-gray-50' 
              : 'text-gray-400 bg-gray-100 cursor-not-allowed'
          }`}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </button>

        <button
          onClick={onNext}
          disabled={nextDisabled}
          className={`inline-flex items-center px-8 py-3 rounded-lg font-semibold transition-colors ${
            nextDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
        >
          {nextLabel}
          <ArrowRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  )
}

export default function OnboardingFlow() {
  const { actions } = useUserJourney()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    email: '',
    age: 0,
    gender: undefined,
    height: 0,
    weight: 0,
    activity: 'moderate',
    goal: 'maintain',
    allergies: [],
    dislikes: []
  })

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }))
  }

  const canProceedStep1 = profile.name && profile.email && profile.age && profile.gender
  const canProceedStep2 = profile.height && profile.weight && profile.activity && profile.goal
  const canProceedStep3 = true // Allergies are optional

  const completeOnboarding = () => {
    const completeProfile: UserProfile = {
      name: profile.name!,
      email: profile.email!,
      age: profile.age!,
      gender: profile.gender!,
      height: profile.height!,
      weight: profile.weight!,
      activity: profile.activity!,
      goal: profile.goal!,
      allergies: profile.allergies || [],
      dislikes: profile.dislikes || [],
      isComplete: true
    }

    actions.setProfile(completeProfile)
    router.push('/dashboard')
  }

  if (currentStep === 1) {
    return (
      <OnboardingStep
        step={1}
        totalSteps={3}
        title="Faisons connaissance !"
        subtitle="Quelques informations pour personnaliser votre expérience"
        onNext={() => setCurrentStep(2)}
        nextDisabled={!canProceedStep1}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-center mb-6">
            <User className="h-16 w-16 text-primary-500" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom et nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={profile.name || ''}
                onChange={(e) => updateProfile({ name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Marie Dupont"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => updateProfile({ email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="marie@exemple.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Âge <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={profile.age || ''}
                onChange={(e) => updateProfile({ age: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="30"
                min="16"
                max="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Genre <span className="text-red-500">*</span>
              </label>
              <select
                value={profile.gender || ''}
                onChange={(e) => updateProfile({ gender: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Choisir</option>
                <option value="female">Femme</option>
                <option value="male">Homme</option>
                <option value="other">Autre</option>
              </select>
            </div>
          </div>
        </div>
      </OnboardingStep>
    )
  }

  if (currentStep === 2) {
    const bmi = profile.height && profile.weight ? 
      actions.calculateBMI(profile.height, profile.weight) : 0
    const tdee = canProceedStep2 ? actions.calculateTDEE(profile) : 0

    return (
      <OnboardingStep
        step={2}
        totalSteps={3}
        title="Votre profil physique"
        subtitle="Pour calculer vos besoins nutritionnels selon les RNP ANSES"
        onNext={() => setCurrentStep(3)}
        onBack={() => setCurrentStep(1)}
        nextDisabled={!canProceedStep2}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-center mb-6">
            <Target className="h-16 w-16 text-primary-500" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taille (cm) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={profile.height || ''}
                onChange={(e) => updateProfile({ height: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="170"
                min="120"
                max="220"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poids (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={profile.weight || ''}
                onChange={(e) => updateProfile({ weight: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="70"
                min="35"
                max="200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau d'activité <span className="text-red-500">*</span>
              </label>
              <select
                value={profile.activity || 'moderate'}
                onChange={(e) => updateProfile({ activity: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="sedentary">Sédentaire (bureau, peu d'exercice)</option>
                <option value="light">Activité légère (exercice 1-3x/semaine)</option>
                <option value="moderate">Activité modérée (exercice 3-5x/semaine)</option>
                <option value="intense">Activité intense (exercice 6-7x/semaine)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objectif <span className="text-red-500">*</span>
              </label>
              <select
                value={profile.goal || 'maintain'}
                onChange={(e) => updateProfile({ goal: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="lose">Perte de poids</option>
                <option value="maintain">Maintien du poids</option>
                <option value="gain">Prise de poids/masse</option>
              </select>
            </div>
          </div>

          {bmi > 0 && (
            <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <h4 className="font-semibold text-primary-800 mb-2">Vos indicateurs calculés</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-primary-700">IMC: </span>
                  <span className="font-semibold">{bmi}</span>
                </div>
                <div>
                  <span className="text-primary-700">Besoin énergétique: </span>
                  <span className="font-semibold">{tdee} kcal/jour</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </OnboardingStep>
    )
  }

  if (currentStep === 3) {
    return (
      <OnboardingStep
        step={3}
        totalSteps={3}
        title="Restrictions alimentaires"
        subtitle="Pour adapter parfaitement vos menus (étape optionnelle)"
        onNext={completeOnboarding}
        onBack={() => setCurrentStep(2)}
        nextLabel="Terminer mon profil"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-center mb-6">
            <AlertTriangle className="h-16 w-16 text-amber-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Allergies alimentaires
            </label>
            <div className="flex flex-wrap gap-2 p-4 border border-gray-300 rounded-lg min-h-[60px]">
              {['Gluten', 'Soja', 'Noix', 'Graines', 'Légumineuses', 'Fruits à coque'].map((allergy) => (
                <button
                  key={allergy}
                  onClick={() => {
                    const currentAllergies = profile.allergies || []
                    const newAllergies = currentAllergies.includes(allergy)
                      ? currentAllergies.filter(a => a !== allergy)
                      : [...currentAllergies, allergy]
                    updateProfile({ allergies: newAllergies })
                  }}
                  className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                    (profile.allergies || []).includes(allergy)
                      ? 'bg-red-100 border-red-300 text-red-700'
                      : 'bg-gray-100 border-gray-300 text-gray-600 hover:border-red-300'
                  }`}
                >
                  {allergy}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Sélectionnez vos allergies pour éviter ces ingrédients dans vos menus
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
              <div>
                <h4 className="font-semibold text-green-800 mb-1">Prêt à commencer !</h4>
                <p className="text-green-700 text-sm">
                  Votre profil sera utilisé pour générer des menus 100% personnalisés 
                  conformes aux recommandations nutritionnelles ANSES.
                </p>
              </div>
            </div>
          </div>
        </div>
      </OnboardingStep>
    )
  }

  return null
}