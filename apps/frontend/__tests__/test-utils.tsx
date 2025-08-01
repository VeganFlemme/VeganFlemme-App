import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { UserJourneyProvider } from '../src/hooks/useUserJourney'

// Custom render function that includes providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <UserJourneyProvider>
        {children}
      </UserJourneyProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...options })
}

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }