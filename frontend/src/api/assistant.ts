import { apiClient } from './client'

export interface MealSuggestion {
  mealId: string
  name: string
  description: string
  score: number
  reason: string
  pantryMatchCount: number
  dealMatchCount: number
  missingCount: number
}

export const assistantApi = {
  async suggestMeals(): Promise<MealSuggestion[]> {
    // Add timestamp query parameter to prevent caching and ensure fresh results
    const timestamp = Date.now()
    const response = await apiClient.get<MealSuggestion[]>(`/assistant/suggest-meals?t=${timestamp}`)
    return response.data
  },
}

