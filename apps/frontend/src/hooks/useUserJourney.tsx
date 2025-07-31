'use client'

import { useState, useEffect, createContext, useContext } from 'react'

export interface UserProfile {
  id?: string
  name: string
  email: string
  age: number
  gender: 'male' | 'female' | 'other'
  height: number // cm
  weight: number // kg
  activity: 'sedentary' | 'light' | 'moderate' | 'intense'
  goal: 'lose' | 'maintain' | 'gain'
  allergies: string[]
  dislikes: string[]
  bmi?: number
  tdee?: number
  isComplete: boolean
}

export interface JourneyStep {
  id: string
  title: string
  description: string
  completed: boolean
  required: boolean
}

export interface UserJourneyState {
  profile: UserProfile | null
  currentStep: number
  steps: JourneyStep[]
  hasGeneratedMenu: boolean
  hasCreatedShoppingList: boolean
  completionPercentage: number
}

const defaultSteps: JourneyStep[] = [
  {
    id: 'profile',
    title: 'Créer mon profil',
    description: 'Personnalisez vos besoins nutritionnels',
    completed: false,
    required: true
  },
  {
    id: 'menu',
    title: 'Générer mon premier menu',
    description: 'Menu personnalisé selon vos besoins',
    completed: false,
    required: true
  },
  {
    id: 'explore',
    title: 'Explorer mes repas',
    description: 'Découvrir les recettes et fonctions swap',
    completed: false,
    required: false
  },
  {
    id: 'shopping',
    title: 'Créer ma liste de courses',
    description: 'Générer automatiquement depuis le menu',
    completed: false,
    required: false  
  },
  {
    id: 'purchase',
    title: 'Faire mes achats',
    description: 'Commander via nos partenaires',
    completed: false,
    required: false
  }
]

const UserJourneyContext = createContext<{
  state: UserJourneyState
  actions: {
    setProfile: (profile: UserProfile) => void
    markStepComplete: (stepId: string) => void
    setHasGeneratedMenu: (value: boolean) => void
    setHasCreatedShoppingList: (value: boolean) => void
    getNextRequiredStep: () => JourneyStep | null
    calculateBMI: (height: number, weight: number) => number
    calculateTDEE: (profile: Partial<UserProfile>) => number
  }
} | null>(null)

export function UserJourneyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UserJourneyState>({
    profile: null,
    currentStep: 0,
    steps: defaultSteps,
    hasGeneratedMenu: false,
    hasCreatedShoppingList: false,
    completionPercentage: 0
  })

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('veganflemme-journey')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setState(prevState => ({
          ...prevState,
          ...parsed,
          steps: defaultSteps.map(step => ({
            ...step,
            completed: parsed.steps?.find((s: any) => s.id === step.id)?.completed || false
          }))
        }))
      } catch (error) {
        console.warn('Failed to load user journey from localStorage')
      }
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('veganflemme-journey', JSON.stringify(state))
    
    // Update completion percentage
    const completedSteps = state.steps.filter(step => step.completed).length
    const percentage = Math.round((completedSteps / state.steps.length) * 100)
    
    if (percentage !== state.completionPercentage) {
      setState(prev => ({ ...prev, completionPercentage: percentage }))
    }
  }, [state])

  const calculateBMI = (height: number, weight: number): number => {
    const heightInM = height / 100
    return Math.round((weight / (heightInM * heightInM)) * 10) / 10
  }

  const calculateTDEE = (profile: Partial<UserProfile>): number => {
    if (!profile.weight || !profile.height || !profile.age || !profile.gender || !profile.activity) {
      return 0
    }

    // Mifflin-St Jeor Equation
    let bmr: number
    if (profile.gender === 'male') {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5
    } else {
      bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161
    }

    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      intense: 1.725
    }

    return Math.round(bmr * activityMultipliers[profile.activity])
  }

  const setProfile = (profile: UserProfile) => {
    const bmi = calculateBMI(profile.height, profile.weight)
    const tdee = calculateTDEE(profile)
    
    const completeProfile = {
      ...profile,
      bmi,
      tdee,
      isComplete: !!(profile.name && profile.email && profile.age && profile.gender && 
                     profile.height && profile.weight && profile.activity && profile.goal)
    }

    setState(prev => {
      const updatedSteps = prev.steps.map(step => 
        step.id === 'profile' 
          ? { ...step, completed: completeProfile.isComplete }
          : step
      )
      
      return {
        ...prev,
        profile: completeProfile,
        steps: updatedSteps,
        currentStep: completeProfile.isComplete ? 1 : 0
      }
    })
  }

  const markStepComplete = (stepId: string) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === stepId ? { ...step, completed: true } : step
      )
    }))
  }

  const setHasGeneratedMenu = (value: boolean) => {
    setState(prev => ({
      ...prev,
      hasGeneratedMenu: value
    }))
    
    if (value) {
      markStepComplete('menu')
    }
  }

  const setHasCreatedShoppingList = (value: boolean) => {
    setState(prev => ({
      ...prev,
      hasCreatedShoppingList: value
    }))
    
    if (value) {
      markStepComplete('shopping')
    }
  }

  const getNextRequiredStep = (): JourneyStep | null => {
    return state.steps.find(step => step.required && !step.completed) || null
  }

  const actions = {
    setProfile,
    markStepComplete,
    setHasGeneratedMenu,
    setHasCreatedShoppingList,
    getNextRequiredStep,
    calculateBMI,
    calculateTDEE
  }

  return (
    <UserJourneyContext.Provider value={{ state, actions }}>
      {children}
    </UserJourneyContext.Provider>
  )
}

export function useUserJourney() {
  const context = useContext(UserJourneyContext)
  if (!context) {
    throw new Error('useUserJourney must be used within UserJourneyProvider')
  }
  return context
}