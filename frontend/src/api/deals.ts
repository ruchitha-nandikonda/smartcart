import { apiClient } from './client'

export interface Deal {
  storeIdDate: string
  productId: string
  storeId: string
  date: string
  storeName: string
  productName: string
  sizeText: string
  unitPrice: number
  promoPrice: number | null
  promoEnds: string | null
  sourceUrl: string | null
}

export const dealsApi = {
  getAll: async (storeId?: string, date?: string): Promise<Deal[]> => {
    const params = new URLSearchParams()
    if (storeId) params.append('storeId', storeId)
    if (date) params.append('date', date)
    
    const queryString = params.toString()
    const url = queryString ? `/deals?${queryString}` : '/deals'
    
    const response = await apiClient.get<Deal[]>(url)
    return response.data
  }
}

