import { apiClient as client } from './client'

export interface ShoppingListHistory {
  listId: string
  createdAt: number
  items: ShoppingListItem[]
  costByStore: Record<string, number>
  totalCost: number
  meals: string[]
  totalServings: number
  usesPantry: string[]
}

export interface ShoppingListItem {
  productId: string
  qty: number
  unit: string
  storeId: string
  price: number
}

export const shoppingListsApi = {
  async getAll(): Promise<ShoppingListHistory[]> {
    const response = await client.get('/shopping-lists')
    return response.data
  },

  async getById(listId: string): Promise<ShoppingListHistory> {
    const response = await client.get(`/shopping-lists/${listId}`)
    return response.data
  },

  async delete(listId: string): Promise<void> {
    await client.delete(`/shopping-lists/${listId}`)
  },
}

