import { apiClient as client } from './client'

export interface MealFavorite {
  favoriteId: string
  name: string
  mealServings: Record<string, number>
  createdAt: number
  lastUsed: number | null
}

export interface CreateFavoriteRequest {
  name: string
  mealServings: Record<string, number>
}

export const favoritesApi = {
  async getAll(): Promise<MealFavorite[]> {
    const response = await client.get('/favorites')
    return response.data
  },

  async getById(favoriteId: string): Promise<MealFavorite> {
    const response = await client.get(`/favorites/${favoriteId}`)
    return response.data
  },

  async create(name: string, mealServings: Record<string, number>): Promise<MealFavorite> {
    const response = await client.post('/favorites', { name, mealServings })
    return response.data
  },

  async useFavorite(favoriteId: string): Promise<void> {
    await client.post(`/favorites/${favoriteId}/use`, {})
  },

  async delete(favoriteId: string): Promise<void> {
    await client.delete(`/favorites/${favoriteId}`)
  },
}

