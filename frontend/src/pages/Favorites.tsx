import { useState, useEffect } from 'react'
import { favoritesApi, type MealFavorite } from '../api/favorites'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaHeart, FaTrash, FaUtensils, FaSpinner, FaPlusCircle } from 'react-icons/fa'
import { getMealImage } from '../data/mealImages'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export default function Favorites() {
  const [favorites, setFavorites] = useState<MealFavorite[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<Set<string>>(new Set())
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    loadFavorites()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]) // Reload when navigating to this page

  const loadFavorites = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await favoritesApi.getAll()
      setFavorites(data)
    } catch (err: any) {
      console.error('Failed to load favorites', err)
      setError(err.response?.data?.message || 'Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (favoriteId: string) => {
    setDeleting(prev => new Set(prev).add(favoriteId))
    try {
      await favoritesApi.delete(favoriteId)
      setFavorites(prev => prev.filter(fav => fav.favoriteId !== favoriteId))
    } catch (err: any) {
      console.error('Failed to delete favorite', err)
      setError('Failed to delete favorite. Please try again.')
    } finally {
      setDeleting(prev => {
        const newSet = new Set(prev)
        newSet.delete(favoriteId)
        return newSet
      })
    }
  }

  const handleUseFavorite = async (favorite: MealFavorite) => {
    try {
      await favoritesApi.useFavorite(favorite.favoriteId)
      // Navigate to plan page with favorite meals pre-selected
      navigate('/plan', { state: { preselectedMeals: favorite.mealServings } })
    } catch (err: any) {
      console.error('Failed to use favorite', err)
      alert('Failed to load favorite. Please try again.')
    }
  }

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Never'
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className={`h-8 w-8 text-teal-600 ${reduceMotion ? '' : 'animate-spin'}`} />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
            <FaHeart className="text-pink-600 mr-3" />
            My Favorites
          </h2>
          <p className="text-gray-700 mt-1">Your saved meal combinations</p>
        </div>
        <button
          onClick={() => navigate('/plan')}
          className="button-interactive button-gradient flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 text-white rounded-lg shadow-md transition-all duration-300"
        >
          <FaPlusCircle />
          <span>Add More Meals</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 mb-6">
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-teal-200/50">
          <FaHeart className="mx-auto text-6xl text-gray-400 mb-4" />
          <p className="text-xl font-semibold text-gray-900 mb-2">No favorites yet!</p>
          <p className="text-gray-600 mb-4">
            Save meals from the Assistant or Plan page to see them here.
          </p>
          <button
            onClick={() => navigate('/plan')}
            className="button-interactive button-gradient px-4 py-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 text-white rounded-lg shadow-md transition-all duration-300"
          >
            Browse Meals
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => {
            const mealIds = Object.keys(favorite.mealServings)
            const isDeleting = deleting.has(favorite.favoriteId)
            
            return (
              <div
                key={favorite.favoriteId}
                className="card-interactive bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-teal-200/50"
              >
                {/* Favorite Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">
                      {favorite.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Last used: {formatDate(favorite.lastUsed)}
                    </p>
                  </div>
                        <button
                          onClick={() => handleDelete(favorite.favoriteId)}
                          disabled={isDeleting}
                          className="text-red-500 hover:text-red-700 transition-all duration-300 disabled:opacity-50 hover:scale-110 hover:rotate-12"
                          title="Delete favorite"
                        >
                    {isDeleting ? (
                      <FaSpinner className={`h-4 w-4 ${reduceMotion ? '' : 'animate-spin'}`} />
                    ) : (
                      <FaTrash className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Meal List */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Meals ({mealIds.length}):
                  </p>
                  <div className="space-y-2">
                    {mealIds.map((mealId) => {
                      const servings = favorite.mealServings[mealId]
                      return (
                        <div
                          key={mealId}
                          className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg hover:bg-teal-50 transition-all duration-300 hover:scale-105 hover:shadow-md"
                        >
                          <img
                            src={getMealImage(mealId)}
                            alt={mealId}
                            className="w-12 h-12 object-cover rounded transition-transform duration-300 hover:scale-110 hover:rotate-3"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = 'https://via.placeholder.com/100?text=Meal'
                            }}
                          />
                          <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{mealId}</p>
                                  <p className="text-xs text-gray-600">
                              {servings} {servings === 1 ? 'serving' : 'servings'}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={() => handleUseFavorite(favorite)}
                  className="button-interactive button-gradient w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 text-white rounded-lg shadow-md transition-all duration-300"
                >
                  <FaUtensils />
                  <span>Use This Favorite</span>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}



