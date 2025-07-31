'use client'

import { useState } from 'react'
import { ArrowRight, ArrowLeft, CheckCircle, Leaf, Target, AlertTriangle } from 'lucide-react'
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
    name: 'Utilisateur VeganFlemme', // Default name for lazy users
    email: '', // Optional
    age: 30, // Default age
    gender: 'other', // Default to inclusive option
    height: 170, // Default height
    weight: 70, // Default weight
    activity: 'moderate',
    goal: 'maintain',
    allergies: [],
    dislikes: []
  })

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }))
  }

  // Simplified validation - only basic info needed
  const canProceedStep1 = true // Skip to preferences immediately 
  const canProceedStep2 = true // All optional now
  const canProceedStep3 = true // Allergies always optional

  const completeOnboarding = () => {
    const completeProfile: UserProfile = {
      name: profile.name!,
      email: profile.email || 'user@veganflemme.com', // Optional email with default
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
    router.push('/generate-menu') // Go directly to menu generation
  }

  if (currentStep === 1) {
    return (
      <OnboardingStep
        step={1}
        totalSteps={2}
        title="Bienvenue dans votre transition vegan !"
        subtitle="L'outil ultime pour devenir vegan sans effort"
        onNext={() => setCurrentStep(2)}
        nextDisabled={!canProceedStep1}
        nextLabel="Générer mon premier menu"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-center mb-6">
            <Leaf className="h-16 w-16 text-primary-500" />
          </div>

          <div className="text-center bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-green-800 mb-3">
              VeganFlemme - Pour les plus flemmes !
            </h3>
            <p className="text-green-700 mb-4">
              Nous savons que vous voulez devenir vegan sans vous prendre la tête. 
              Pas besoin de remplir 50 formulaires ! Cliquez sur "Générer mon premier menu" 
              et découvrez immédiatement le meilleur plan alimentaire vegan adapté à tous.
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-green-600">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>0 effort</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>100% équilibré</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>Pour tout le monde</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-700 text-sm">
              <strong>Optionnel :</strong> Vous pourrez personnaliser vos préférences plus tard 
              depuis le tableau de bord. Pour l'instant, profitez de notre menu universel 
              conçu pour satisfaire tous les goûts et besoins nutritionnels !
            </p>
          </div>
        </div>
      </OnboardingStep>
    )
  }

  if (currentStep === 2) {
    return (
      <OnboardingStep
        step={2}
        totalSteps={2}
        title="Personnalisez votre menu (optionnel)"
        subtitle="Ajoutez vos restrictions alimentaires si vous en avez"
        onNext={completeOnboarding}
        onBack={() => setCurrentStep(1)}
        nextLabel="Générer mon menu vegan !"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-center mb-6">
            <AlertTriangle className="h-16 w-16 text-amber-500" />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>Cette étape est entièrement optionnelle !</strong> Vous pouvez cliquer directement sur 
              "Générer mon menu vegan" pour obtenir notre menu universel parfait pour tous.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Allergies ou intolérances alimentaires
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
              Cliquez pour sélectionner vos allergies (optionnel)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Goûts alimentaires
            </label>
            <div className="flex flex-wrap gap-2 p-4 border border-gray-300 rounded-lg min-h-[60px]">
              {['Épicé', 'Sucré', 'Méditerranéen', 'Asiatique', 'Cru/Raw', 'Comfort Food'].map((taste) => (
                <button
                  key={taste}
                  onClick={() => {
                    const currentDislikes = profile.dislikes || []
                    const newDislikes = currentDislikes.includes(taste)
                      ? currentDislikes.filter(d => d !== taste)
                      : [...currentDislikes, taste]
                    updateProfile({ dislikes: newDislikes })
                  }}
                  className={`px-3 py-2 rounded-full text-sm border transition-colors ${
                    (profile.dislikes || []).includes(taste)
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : 'bg-gray-100 border-gray-300 text-gray-600 hover:border-green-300'
                  }`}
                >
                  {taste}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Sélectionnez vos préférences gustatives (optionnel)
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
              <div>
                <h4 className="font-semibold text-green-800 mb-1">Prêt à découvrir votre menu !</h4>
                <p className="text-green-700 text-sm">
                  Nous allons générer votre premier menu vegan parfaitement équilibré, 
                  que vous ayez personnalisé ou non. La transition vegan n'a jamais été aussi simple !
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