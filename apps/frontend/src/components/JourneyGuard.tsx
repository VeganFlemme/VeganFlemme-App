'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUserJourney } from '@/hooks/useUserJourney'

interface JourneyGuardProps {
  children: React.ReactNode
}

export default function JourneyGuard({ children }: JourneyGuardProps) {
  const { state, actions } = useUserJourney()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't redirect on homepage or onboarding
    if (pathname === '/' || pathname === '/onboarding') {
      return
    }

    // If no profile or incomplete profile, redirect to onboarding
    if (!state.profile || !state.profile.isComplete) {
      if (pathname !== '/onboarding') {
        router.push('/onboarding')
      }
      return
    }

    // Smart redirects based on journey state
    const nextStep = actions.getNextRequiredStep()
    
    if (nextStep) {
      switch (nextStep.id) {
        case 'menu':
          if (pathname !== '/generate-menu' && pathname !== '/dashboard') {
            // Allow dashboard access but suggest menu generation
            return
          }
          break
          
        default:
          // Allow normal navigation for other steps
          break
      }
    }
  }, [state.profile, pathname, router, actions])

  return <>{children}</>
}