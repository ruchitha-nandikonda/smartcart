import { useState, useEffect, useCallback } from 'react'
import { FaRobot, FaUtensils, FaCheck, FaTimes, FaSpinner, FaHeart, FaShoppingCart, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { assistantApi, type MealSuggestion } from '../api/assistant'
import { favoritesApi } from '../api/favorites'
import { useNavigate } from 'react-router-dom'

interface AssistantModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AssistantModal({ isOpen, onClose }: AssistantModalProps) {
  const [suggestions, setSuggestions] = useState<MealSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set())
  const [addingToFavorites, setAddingToFavorites] = useState<Set<string>>(new Set())
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set())
  const navigate = useNavigate()

  const fetchSuggestions = useCallback(async () => {
    console.log('🔄 Fetching new meal suggestions...', new Date().toISOString())
    setLoading(true)
    setError(null)
    setSuggestions([])
    try {
      const results = await assistantApi.suggestMeals()
      console.log('✅ Received suggestions:', results.length, results.map(r => r.name))
      setSuggestions(results)
    } catch (err: any) {
      console.error('❌ Error fetching suggestions:', err)
      setError(err.response?.data?.message || 'Failed to get meal suggestions')
    } finally {
      setLoading(false)
    }
  }, [])

  const toggleExpanded = (mealId: string) => {
    setExpandedMeals(prev => {
      const newSet = new Set(prev)
      if (newSet.has(mealId)) {
        newSet.delete(mealId)
      } else {
        newSet.add(mealId)
      }
      return newSet
    })
  }

  const handleAddToFavorites = async (mealId: string, mealName: string) => {
    setAddingToFavorites(prev => new Set(prev).add(mealId))
    try {
      await favoritesApi.create(mealName, { [mealId]: 1 })
      alert(`✅ Added "${mealName}" to favorites!`)
    } catch (err: any) {
      console.error('Error adding to favorites:', err)
      alert('Failed to add to favorites. Please try again.')
    } finally {
      setAddingToFavorites(prev => {
        const newSet = new Set(prev)
        newSet.delete(mealId)
        return newSet
      })
    }
  }

  const handleAddToShoppingList = async (mealId: string) => {
    setAddingToCart(prev => new Set(prev).add(mealId))
    try {
      // Navigate to plan page with meal pre-selected
      navigate('/plan', { state: { preselectedMeal: mealId } })
      onClose()
    } catch (err: any) {
      console.error('Error adding to shopping list:', err)
      alert('Failed to add to shopping list. Please try again.')
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev)
        newSet.delete(mealId)
        return newSet
      })
    }
  }

  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      fetchSuggestions()
    }
  }, [isOpen, suggestions.length, fetchSuggestions])
  
  useEffect(() => {
    if (!isOpen) {
      setSuggestions([])
      setError(null)
      setExpandedMeals(new Set())
    }
  }, [isOpen])

  const formatScore = (score: number) => {
    // Ensure score is positive and capped at 100
    const normalizedScore = Math.max(0, Math.min(100, score))
    return Math.round(normalizedScore)
  }

  const getScoreColor = (score: number) => {
    const normalizedScore = Math.max(0, Math.min(100, score))
    if (normalizedScore >= 70) return 'text-green-600'
    if (normalizedScore >= 40) return 'text-yellow-600'
    return 'text-orange-600'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-lg sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaRobot className="h-6 w-6" />
              <div>
                <h2 className="text-2xl font-bold">SmartCart Assistant</h2>
                <p className="text-indigo-100 text-sm">What can I cook tonight?</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FaSpinner className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
              <p className="text-gray-600">Analyzing your pantry and deals...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-4">
              {suggestions.map((suggestion, idx) => {
                const isExpanded = expandedMeals.has(suggestion.mealId)
                const isAddingToFav = addingToFavorites.has(suggestion.mealId)
                const isAddingToCart = addingToCart.has(suggestion.mealId)
                
                return (
                  <div
                    key={suggestion.mealId}
                    className="border-2 rounded-lg p-5 transition-all hover:shadow-lg"
                    style={{
                      borderColor: idx === 0 ? '#4f46e5' : '#e5e7eb',
                      backgroundColor: idx === 0 ? '#eef2ff' : 'white'
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2 flex-1">
                        {idx === 0 && (
                          <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
                            TOP PICK
                          </span>
                        )}
                        <FaUtensils className="text-indigo-600" />
                        <h3 className="text-xl font-semibold text-gray-900">
                          {suggestion.name}
                        </h3>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm text-gray-500">Match Score</div>
                        <div className={`text-lg font-bold ${getScoreColor(suggestion.score)}`}>
                          {formatScore(suggestion.score)}%
                        </div>
                      </div>
                    </div>

                    {suggestion.description && (
                      <p className="text-gray-600 mb-3">{suggestion.description}</p>
                    )}

                    <div className="bg-gray-50 rounded-lg p-3 mb-3 border">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {suggestion.reason}
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <FaCheck className="text-green-600" />
                        <span>{suggestion.pantryMatchCount} in pantry</span>
                      </div>
                      {suggestion.dealMatchCount > 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-600">💰</span>
                          <span>{suggestion.dealMatchCount} on sale</span>
                        </div>
                      )}
                      {suggestion.missingCount > 0 && (
                        <div className="flex items-center space-x-1">
                          <FaTimes className="text-red-600" />
                          <span>{suggestion.missingCount} to buy</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center space-x-2 mb-3">
                      <button
                        onClick={() => handleAddToFavorites(suggestion.mealId, suggestion.name)}
                        disabled={isAddingToFav}
                        className="flex items-center space-x-2 px-3 py-2 bg-pink-50 text-pink-700 rounded-lg hover:bg-pink-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {isAddingToFav ? (
                          <FaSpinner className="h-4 w-4 animate-spin" />
                        ) : (
                          <FaHeart className="h-4 w-4" />
                        )}
                        <span>Favorite</span>
                      </button>
                      <button
                        onClick={() => handleAddToShoppingList(suggestion.mealId)}
                        disabled={isAddingToCart}
                        className="flex items-center space-x-2 px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {isAddingToCart ? (
                          <FaSpinner className="h-4 w-4 animate-spin" />
                        ) : (
                          <FaShoppingCart className="h-4 w-4" />
                        )}
                        <span>Add to List</span>
                      </button>
                      {suggestion.missingCount > 0 && (
                        <button
                          onClick={() => toggleExpanded(suggestion.mealId)}
                          className="flex items-center space-x-1 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                        >
                          {isExpanded ? (
                            <>
                              <FaChevronUp className="h-3 w-3" />
                              <span>Hide Ingredients</span>
                            </>
                          ) : (
                            <>
                              <FaChevronDown className="h-3 w-3" />
                              <span>Show Ingredients</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Expanded Ingredients List */}
                    {isExpanded && suggestion.missingCount > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Missing Ingredients:</p>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            // Extract missing ingredients from reason string
                            const needToBuyMatch = suggestion.reason.match(/Need to buy:\s*(.+?)(?:\s*•|$)/);
                            if (needToBuyMatch && needToBuyMatch[1]) {
                              return needToBuyMatch[1]
                                .split(',')
                                .map((item: string) => item.trim())
                                .filter(Boolean)
                                .map((item: string, i: number) => (
                                  <span
                                    key={i}
                                    className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-medium"
                                  >
                                    {item}
                                  </span>
                                ));
                            }
                            return <span className="text-gray-500 text-xs">Unable to parse ingredients</span>;
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              <FaRobot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">No meal suggestions available</p>
              <p className="text-sm">Try adding some items to your pantry or check back later for deals!</p>
            </div>
          )}

          {/* Refresh button */}
          <div className="mt-6 text-center">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('🔘 Button clicked - fetching new suggestions')
                fetchSuggestions()
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              disabled={loading}
              type="button"
            >
              {loading && <FaSpinner className="h-4 w-4 animate-spin" />}
              {loading ? 'Loading...' : 'Get New Suggestions'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

