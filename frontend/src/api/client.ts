import axios, { AxiosError } from 'axios'

export interface ErrorResponse {
  message: string
  errorCode?: string
  timestamp?: string
  path?: string
}

// Get API base URL from environment variable, fallback to relative path for local dev
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

if (!import.meta.env.VITE_API_BASE_URL) {
  console.warn(
    '⚠️ VITE_API_BASE_URL is not set. API calls will use relative path /api. ' +
    'For production, set VITE_API_BASE_URL to your backend URL (e.g., https://smartcart-backend-zy2c.onrender.com/api)'
  )
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  // Check for both accessToken and token for backward compatibility
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Enhanced error handling with user-friendly messages
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<any>) => {
    // Log the full error for debugging - use console.dir for better object inspection
    console.group('🔴 Full API Error Details')
    console.log('Has Response:', !!error.response)
    console.log('Status:', error.response?.status)
    console.log('Status Text:', error.response?.statusText)
    console.log('Response Data:', error.response?.data)
    console.log('Response Data (JSON):', JSON.stringify(error.response?.data, null, 2))
    console.log('Error Message:', error.message)
    console.log('Error Stack:', error.stack)
    console.log('Full Error Object:', error)
    console.groupEnd()
    
    if (error.response) {
      // Backend returned an error response
      const errorResponse = error.response.data
      const status = error.response.status
      
      // Try multiple ways to extract the error message
      let message = 'An error occurred. Please try again.'
      
      if (errorResponse) {
        // Try different error response formats
        if (typeof errorResponse === 'object') {
          // Try ErrorResponse format
          message = errorResponse.message || 
                   errorResponse.error || 
                   errorResponse.errorMessage ||
                   errorResponse.msg ||
                   // Try nested error objects
                   (errorResponse.error?.message) ||
                   (errorResponse.error?.error) ||
                   // Try Spring Boot default error format
                   (errorResponse.detail) ||
                   (errorResponse.title) ||
                   message
          
          // If still default, try to stringify the whole object for debugging
          if (message === 'An error occurred. Please try again.' && Object.keys(errorResponse).length > 0) {
            console.warn('⚠️ Could not extract message from error response:', errorResponse)
            // Try to create a helpful message from the status code
            if (status === 500) {
              message = 'Server error. Please check backend logs or try again later.'
            } else if (status === 401) {
              message = 'Authentication failed. Please check your credentials.'
            } else if (status === 400) {
              message = 'Invalid request. Please check your input.'
            }
          }
        } else if (typeof errorResponse === 'string') {
          message = errorResponse
        }
      } else {
        // No data in response, use status-based message
        if (status === 500) {
          message = 'Server error. Please check backend logs or try again later.'
        } else if (status === 401) {
          message = 'Authentication failed. Please check your credentials.'
        } else if (status === 400) {
          message = 'Invalid request. Please check your input.'
        }
      }
      
      // Create a new error with user-friendly message
      const enhancedError = new Error(message)
      ;(enhancedError as any).errorCode = errorResponse?.errorCode
      ;(enhancedError as any).status = status
      ;(enhancedError as any).response = error.response // Keep original response for debugging
      
      return Promise.reject(enhancedError)
    } else if (error.request) {
      // Request was made but no response received
      console.error('❌ No response received from server')
      return Promise.reject(new Error('Unable to connect to the server. Please check your internet connection.'))
    } else {
      // Something else happened
      console.error('❌ Error setting up request:', error.message)
      return Promise.reject(new Error('An unexpected error occurred. Please try again.'))
    }
  }
)
