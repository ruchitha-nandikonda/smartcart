import { apiClient as client } from './client'

export interface PresignResponse {
  uploadUrl: string
  s3Key: string
}

export interface ConfirmRequest {
  s3Key: string
}

export interface ReceiptLineItem {
  rawDesc: string
  qty: number | null
  price: number | null
  canonicalProductId: string | null
  confidence: number | null
}

export interface Receipt {
  receiptId: string
  storeName: string | null
  total: number | null
  purchasedAt: string | null
  status: string
  lineItems: ReceiptLineItem[]
  s3KeyOriginal: string
  createdAt: number
}

export const receiptsApi = {
  async getPresignedUrl(contentType: string = 'image/jpeg'): Promise<PresignResponse> {
    const response = await client.post(`/receipts/upload?contentType=${contentType}`, {})
    return response.data
  },

  async uploadToS3(presignedUrl: string, file: File): Promise<void> {
    // Check if it's a mock URL for local development
    if (presignedUrl.includes('/api/receipts/mock-upload/')) {
      // For local dev, we can skip the actual upload
      // The backend will handle it via confirm endpoint
      return Promise.resolve()
    }
    
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }
  },

  async confirmUpload(s3Key: string): Promise<Receipt> {
    const response = await client.post('/receipts/confirm', { s3Key })
    return response.data
  },

  async getAll(): Promise<Receipt[]> {
    const response = await client.get('/receipts')
    return response.data
  },

  async getById(receiptId: string): Promise<Receipt> {
    const response = await client.get(`/receipts/${receiptId}`)
    return response.data
  },

  async delete(receiptId: string): Promise<void> {
    await client.delete(`/receipts/${receiptId}`)
  },
}

