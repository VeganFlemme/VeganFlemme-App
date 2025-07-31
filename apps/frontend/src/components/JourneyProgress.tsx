'use client'

import { CheckCircle, Circle, ArrowRight } from 'lucide-react'
import { useUserJourney } from '@/hooks/useUserJourney'

interface JourneyProgressProps {
  showTitle?: boolean
  compact?: boolean
}

export default function JourneyProgress({ showTitle = true, compact = false }: JourneyProgressProps) {
  const { state } = useUserJourney()

  if (compact) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Votre progression</h3>
          <span className="text-sm font-medium text-primary-600">
            {state.completionPercentage}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${state.completionPercentage}%` }}
          />
        </div>
        
        <div className="mt-2 text-xs text-gray-600">
          {state.steps.filter(s => s.completed).length} / {state.steps.length} étapes terminées
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {showTitle && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Votre parcours VeganFlemme
          </h2>
          <p className="text-gray-600">
            Suivez votre progression vers une transition végane réussie
          </p>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progression</span>
              <span className="text-sm font-medium text-primary-600">
                {state.completionPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${state.completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {state.steps.map((step, index) => {
          const isCompleted = step.completed
          const isCurrent = !isCompleted && state.steps.slice(0, index).every(s => s.completed)
          const isLocked = !isCompleted && !isCurrent && step.required
          
          return (
            <div key={step.id} className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                {isCompleted ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : isCurrent ? (
                  <Circle className="h-6 w-6 text-primary-500 animate-pulse" />
                ) : (
                  <Circle className="h-6 w-6 text-gray-300" />
                )}
              </div>
              
              <div className={`flex-1 ${isLocked ? 'opacity-50' : ''}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${
                    isCompleted ? 'text-green-700' : 
                    isCurrent ? 'text-primary-700' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </h3>
                  
                  {step.required && (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                      Requis
                    </span>
                  )}
                </div>
                
                <p className={`text-sm mt-1 ${
                  isCompleted ? 'text-green-600' : 
                  isCurrent ? 'text-primary-600' : 'text-gray-400'
                }`}>
                  {step.description}
                </p>
                
                {isCurrent && (
                  <div className="mt-2 flex items-center text-primary-600 text-sm font-medium">
                    <span>Étape suivante</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {state.completionPercentage === 100 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <h4 className="font-semibold text-green-800">Félicitations !</h4>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Vous avez terminé votre parcours d'initiation VeganFlemme. 
            Continuez à utiliser l'app pour maintenir une alimentation équilibrée !
          </p>
        </div>
      )}
    </div>
  )
}