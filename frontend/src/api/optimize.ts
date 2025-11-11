import { apiClient } from './client'

export interface OptimizeRequest {
  mealServings: Record<string, number> // mealId -> servings
}

export interface ShoppingItem {
  productId: string
  qty: number
  unit: string
  storeId: string
  price: number
  originalPrice?: number | null
  savings?: number | null
  hasDeal?: boolean | null
}

export interface OptimizeResponse {
  list: ShoppingItem[]
  usesPantry: string[]
  costByStore: Record<string, number>
  notes: string[]
}

export const optimizeApi = {
  getAllMeals: async (category?: string): Promise<string[]> => {
    const params = category ? { category } : {}
    const response = await apiClient.get('/optimize/meals', { params })
    return response.data
  },

  getAllCategories: async (): Promise<string[]> => {
    const response = await apiClient.get('/optimize/categories')
    return response.data
  },

  optimize: async (request: OptimizeRequest): Promise<OptimizeResponse> => {
    const response = await apiClient.post('/optimize', request)
    return response.data
  },
}

