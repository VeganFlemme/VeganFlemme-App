/**
 * Google Analytics 4 integration for VeganFlemme
 */

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export const isAnalyticsEnabled = () => {
  return (
    typeof window !== 'undefined' &&
    GA_MEASUREMENT_ID &&
    process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'
  )
}

export const gtag = (...args: any[]) => {
  if (isAnalyticsEnabled() && window.gtag) {
    window.gtag(...args)
  }
}

export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (isAnalyticsEnabled()) {
    gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

export const trackPageView = (url: string) => {
  if (isAnalyticsEnabled()) {
    gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// Custom events for VeganFlemme app
export const trackMenuGeneration = (preferences: any) => {
  trackEvent('generate_menu', 'menu', `${preferences.people}_people_${preferences.budget}_budget`)
}

export const trackIngredientSwap = (ingredient: string, reason?: string) => {
  trackEvent('swap_ingredient', 'menu', `${ingredient}_${reason}`)
}

export const trackRecipeView = (recipeId: string) => {
  trackEvent('view_recipe', 'menu', recipeId)
}

export const trackProfileUpdate = (section: string) => {
  trackEvent('update_profile', 'profile', section)
}