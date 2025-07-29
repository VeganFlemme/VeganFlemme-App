/**
 * API client for VeganFlemme Engine
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export interface MenuPreferences {
  people: number
  budget: string
  cookingTime: string
  dietaryRestrictions?: string[]
  nutritionalGoals?: Record<string, any>
}

export interface GeneratedMenu {
  id: string
  generatedAt: string
  parameters: MenuPreferences
  meals: Array<{
    id: string
    name: string
    type: string
    cookingTime: number
    difficulty: string
    servings: number
    nutrition: Record<string, number>
    ecoScore: string
    ingredients: Array<{
      name: string
      quantity: number
      unit: string
      organic: boolean
    }>
  }>
  nutritionSummary: {
    dailyCalories: number
    rnpCoverage: Record<string, number>
  }
  shoppingList: {
    totalCost: number
    items: Array<{
      name: string
      quantity: number
      price: number
      store: string
    }>
  }
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      return {
        success: false,
        data: null as T,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async generateMenu(preferences: MenuPreferences): Promise<ApiResponse<GeneratedMenu>> {
    return this.request<GeneratedMenu>('/menu/generate', {
      method: 'POST',
      body: JSON.stringify(preferences),
    })
  }

  async getRecipe(id: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/menu/recipes/${id}`)
  }

  async swapIngredient(data: {
    ingredient: string
    reason?: string
    nutritionalTarget?: Record<string, any>
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/menu/swap-ingredient', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getHealthStatus(): Promise<ApiResponse<any>> {
    return this.request<any>('/health')
  }

  async getDailyTracking(profileId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/nutrition/daily-tracking/${profileId}`)
  }

  async getWeeklyEvolution(profileId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/nutrition/weekly-evolution/${profileId}`)
  }

  async getRNPData(): Promise<ApiResponse<any>> {
    return this.request<any>('/nutrition/rnp-anses')
  }
}

export const apiClient = new ApiClient()