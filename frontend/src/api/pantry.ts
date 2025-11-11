import { apiClient } from './client'

export interface PantryItem {
  productId: string
  name: string
  quantity: number
  unit: string
  lastUpdated: string
  estExpiry?: string
  source: string
  packSize?: string
  categories?: string[]
}

export interface CreatePantryItemRequest {
  name: string
  quantity: number
  unit: string
  estExpiry?: string
  packSize?: string
  categories?: string[]
}

export const pantryApi = {
  getAll: async (): Promise<PantryItem[]> => {
    const response = await apiClient.get<PantryItem[]>('/pantry')
    return response.data
  },
  
  create: async (data: CreatePantryItemRequest): Promise<PantryItem> => {
    const response = await apiClient.post<PantryItem>('/pantry', data)
    return response.data
  },
  
  update: async (productId: string, data: CreatePantryItemRequest): Promise<PantryItem> => {
    const response = await apiClient.put<PantryItem>(`/pantry/${productId}`, data)
    return response.data
  },
  
  delete: async (productId: string): Promise<void> => {
    await apiClient.delete(`/pantry/${productId}`)
  },

  getExpiring: async (): Promise<PantryItem[]> => {
    const response = await apiClient.get<PantryItem[]>('/pantry/expiring')
    return response.data
  },
}

