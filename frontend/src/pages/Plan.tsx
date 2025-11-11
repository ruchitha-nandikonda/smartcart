import { useState, useEffect } from 'react'
import { optimizeApi } from '../api/optimize'
import { favoritesApi, type MealFavorite } from '../api/favorites'
import { useNavigate, useLocation } from 'react-router-dom'
import { FaUtensils, FaShoppingCart, FaCheckCircle, FaSpinner, FaSearch, FaHeart } from 'react-icons/fa'
import { getMealImage, hasBadImage } from '../data/mealImages'
import { GridSkeleton } from '../components/LoadingSkeleton'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export default function Plan() {
  const reduceMotion = usePrefersReducedMotion()
  const [meals, setMeals] = useState<string[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [filteredMeals, setFilteredMeals] = useState<string[]>([])
  const [selectedMeals, setSelectedMeals] = useState<Map<string, number>>(new Map()) // mealId -> servings
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [optimizing, setOptimizing] = useState(false)
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState<MealFavorite[]>([])
  const [favoritingMeals, setFavoritingMeals] = useState<Set<string>>(new Set())
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const navState = (location.state as { preselectedMeal?: string; preselectedMeals?: Record<string, number> }) || {}
    const { preselectedMeal, preselectedMeals } = navState

    loadMeals(undefined, preselectedMeal)
    loadFavorites()
    
    // Handle preselected meals from navigation state
    if (preselectedMeal) {
      setSelectedMeals(new Map([[preselectedMeal, 1]]))
    } else if (preselectedMeals) {
      setSelectedMeals(new Map(Object.entries(preselectedMeals)))
    }

    if (preselectedMeal || preselectedMeals) {
      navigate(location.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadFavorites = async () => {
    try {
      const data = await favoritesApi.getAll()
      setFavorites(data)
    } catch (err: any) {
      console.error('Failed to load favorites', err)
      // Don't show error for favorites, just fail silently
    }
  }

  const isMealFavorited = (mealId: string): boolean => {
    return favorites.some(fav => 
      Object.keys(fav.mealServings).length === 1 && 
      Object.keys(fav.mealServings)[0] === mealId
    )
  }

  const getMealFavoriteId = (mealId: string): string | null => {
    const favorite = favorites.find(fav => 
      Object.keys(fav.mealServings).length === 1 && 
      Object.keys(fav.mealServings)[0] === mealId
    )
    return favorite ? favorite.favoriteId : null
  }

  const handleToggleFavorite = async (mealId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    
    const favoriteId = getMealFavoriteId(mealId)
    
    if (favoriteId) {
      // Remove from favorites
      setFavoritingMeals(prev => new Set(prev).add(mealId))
      try {
        await favoritesApi.delete(favoriteId)
        await loadFavorites() // Reload favorites
      } catch (err: any) {
        console.error('Failed to remove favorite', err)
        alert('Failed to remove favorite. Please try again.')
      } finally {
        setFavoritingMeals(prev => {
          const newSet = new Set(prev)
          newSet.delete(mealId)
          return newSet
        })
      }
    } else {
      // Add to favorites
      setFavoritingMeals(prev => new Set(prev).add(mealId))
      try {
        await favoritesApi.create(mealId, { [mealId]: 1 })
        await loadFavorites() // Reload favorites
        setError('') // Clear any errors
      } catch (err: any) {
        console.error('Failed to add favorite', err)
        alert(`Failed to add favorite: ${err.response?.data?.message || err.message || 'Unknown error'}`)
      } finally {
        setFavoritingMeals(prev => {
          const newSet = new Set(prev)
          newSet.delete(mealId)
          return newSet
        })
      }
    }
  }

  const loadMeals = async (category?: string, ensureMeal?: string) => {
    try {
      setError('') // Clear any previous errors
      const [mealList, categoryList] = await Promise.all([
        optimizeApi.getAllMeals(category),
        optimizeApi.getAllCategories()
      ])
      // Filter out meals with bad/mismatched images
      let validMeals = mealList.filter(meal => !hasBadImage(meal))
      if (ensureMeal && !validMeals.includes(ensureMeal)) {
        validMeals = [ensureMeal, ...validMeals]
      }
      setMeals(validMeals)
      setFilteredMeals(validMeals)
      setCategories(categoryList)
    } catch (err: any) {
      console.error('Failed to load meals', err)
      setError(err.message || 'Unable to load meals right now. Please try again later.')
      setMeals([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMeals(meals)
    } else {
      const filtered = meals.filter(meal =>
        meal.toLowerCase().includes(searchQuery.toLowerCase()) && !hasBadImage(meal)
      )
      setFilteredMeals(filtered)
    }
  }, [searchQuery, meals])

  const handleCategoryChange = async (category: string) => {
    setSelectedCategory(category)
    setSearchQuery('') // Clear search when changing category
    setLoading(true)
    await loadMeals(category || undefined)
  }

  const toggleMeal = (mealId: string) => {
    const newSelected = new Map(selectedMeals)
    if (newSelected.has(mealId)) {
      newSelected.delete(mealId)
    } else {
      newSelected.set(mealId, 1) // Default to 1 serving
    }
    setSelectedMeals(newSelected)
  }

  const updateServings = (mealId: string, servings: number) => {
    const newSelected = new Map(selectedMeals)
    if (servings > 0) {
      newSelected.set(mealId, servings)
    } else {
      newSelected.delete(mealId)
    }
    setSelectedMeals(newSelected)
  }

  const handleGenerateList = async () => {
    if (selectedMeals.size === 0) {
      setError('Please select at least one meal')
      return
    }

    setOptimizing(true)
    setError('')

    try {
      // Convert Map to object for API
      const mealServings: Record<string, number> = {}
      selectedMeals.forEach((servings, mealId) => {
        mealServings[mealId] = servings
      })
      
      const response = await optimizeApi.optimize({ mealServings })
      
      // Store the shopping list in localStorage for the List page
      // Include meal names for display
      const mealNames = Array.from(selectedMeals.keys())
      const mealServingsRecord: Record<string, number> = {}
      selectedMeals.forEach((servings, mealId) => {
        mealServingsRecord[mealId] = servings
      })

      const sanitizedNotes = response.notes?.filter(note => !note.toLowerCase().includes('default prices')) ?? []

      const shoppingListWithMeals = {
        ...response,
        notes: sanitizedNotes,
        meals: mealNames,
        mealServings: mealServingsRecord,
        generatedAt: new Date().toISOString()
      }
      localStorage.setItem('shoppingList', JSON.stringify(shoppingListWithMeals))
      
      // Navigate to the shopping list page
      navigate('/list')
        } catch (err: any) {
          console.error('Failed to generate shopping list', err)
          setError(err.message || 'Failed to generate shopping list. Please try again.')
        } finally {
      setOptimizing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
              <FaUtensils className="mr-3 text-teal-600" />
              Meal Planning
            </h2>
            <p className="mt-2 text-gray-700">Select meals to generate your optimized shopping list</p>
          </div>
        </div>
        <GridSkeleton count={6} />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
            <FaUtensils className="mr-3 text-teal-600" />
            Meal Planning
          </h2>
          <p className="mt-2 text-gray-600">Select meals to generate your optimized shopping list</p>
        </div>
      </div>

            {error && (
        <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 ${reduceMotion ? '' : 'animate-shake'}`}>
          {error}
        </div>
      )}

      {/* Shopping List Generation Section - Moved to Top */}
      <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border-2 border-teal-200/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 flex items-center">
              <FaShoppingCart className="mr-2 text-teal-600" />
              Generate Shopping List
            </h3>
            <p className="text-sm text-gray-700">
              {selectedMeals.size === 0
                ? 'Select one or more meals below to continue'
                : `You've selected ${selectedMeals.size} meal(s) for ${Array.from(selectedMeals.values()).reduce((sum, s) => sum + s, 0)} total servings.`}
            </p>
          </div>
          <div className="relative group">
            <button
              onClick={handleGenerateList}
              disabled={selectedMeals.size === 0 || optimizing}
              className={`button-interactive button-gradient flex items-center px-6 py-3 rounded-lg font-bold text-white shadow-md transition-all duration-300 ${
                selectedMeals.size === 0 || optimizing
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500'
              }`}
            >
              {optimizing ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Optimizing...
                </>
              ) : (
                <>
                  <FaShoppingCart className="mr-2" />
                  Generate Shopping List
                </>
              )}
            </button>
            {selectedMeals.size === 0 && !optimizing && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Select one or more meals below to continue
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
        </div>
        {selectedMeals.size > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-2">Selected Meals:</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {Array.from(selectedMeals.entries()).map(([mealId, servings]) => (
                <div
                  key={mealId}
                  className="flex items-center justify-between bg-teal-50 p-3 rounded-lg border border-teal-200"
                >
                  <span className="font-medium text-gray-900 flex-1">{mealId}</span>
                  <div className="flex items-center gap-3">
                    <label className="text-sm text-gray-700 flex items-center gap-2">
                      <span>Servings:</span>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={servings}
                        onChange={(e) => {
                          const newServings = parseInt(e.target.value) || 1
                          updateServings(mealId, newServings)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      />
                    </label>
                    <button
                      onClick={() => toggleMeal(mealId)}
                      className="text-red-600 hover:text-red-800 font-bold text-lg px-2"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search meals by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg bg-white"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {(searchQuery || selectedCategory) && (
          <p className="text-sm text-gray-700">
            Found {filteredMeals.length} meal(s)
            {searchQuery && ` matching "${searchQuery}"`}
            {selectedCategory && ` in ${selectedCategory}`}
          </p>
        )}
      </div>

      {filteredMeals.length === 0 && meals.length > 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-teal-200/50">
          <FaSearch className="text-gray-400 text-6xl mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-900">No meals found</p>
            <p className="mt-2 text-gray-600">Try a different search term.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
            >
            Clear search
          </button>
        </div>
      ) : meals.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-12 text-center border border-teal-200/50">
          <FaUtensils className="text-gray-400 text-6xl mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-900">No meals available</p>
            <p className="mt-2 text-gray-600">Please check back later.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {filteredMeals.map(mealId => {
              const isSelected = selectedMeals.has(mealId)
              const servings = selectedMeals.get(mealId) || 1
              return (
                <div
                  key={mealId}
                  className={`card-interactive bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-teal-200/50 ${
                    isSelected
                      ? 'ring-2 ring-teal-500 bg-teal-50'
                      : ''
                  }`}
                >
                  <div className="relative h-48 overflow-hidden group/image">
                    <img
                      src={getMealImage(mealId)}
                      alt={mealId}
                      className="w-full h-full object-cover transition-all duration-500 group-hover/image:scale-125 group-hover/image:brightness-110"
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement
                        target.src = getMealImage('default')
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={(e) => handleToggleFavorite(mealId, e)}
                        disabled={favoritingMeals.has(mealId)}
                        className={`bg-white rounded-full p-2 shadow-md hover:scale-125 hover:rotate-12 transition-all duration-300 disabled:opacity-50 hover:shadow-lg ${
                          isMealFavorited(mealId) ? 'bg-pink-100 hover:bg-pink-200' : 'bg-white/90 hover:bg-white'
                        }`}
                        title={isMealFavorited(mealId) ? 'Remove from favorites' : 'Add to favorites'}
                      >
                        {favoritingMeals.has(mealId) ? (
                          <FaSpinner className={`text-pink-600 text-lg ${reduceMotion ? '' : 'animate-spin'}`} />
                        ) : (
                          <FaHeart className={`text-lg transition-all duration-300 ${isMealFavorited(mealId) ? 'text-pink-600 fill-pink-600 hover:scale-110' : 'text-gray-400 hover:text-pink-500'}`} />
                        )}
                      </button>
                      <div 
                        onClick={() => !isSelected && toggleMeal(mealId)}
                        className={`bg-white rounded-full p-2 shadow-md cursor-pointer hover:scale-125 hover:rotate-12 transition-all duration-300 hover:shadow-lg ${isSelected ? `bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 ${reduceMotion ? '' : 'animate-pulse-slow'}` : 'bg-white/90 hover:bg-teal-50'}`}
                      >
                        <FaCheckCircle className={`text-xl transition-all duration-300 ${isSelected ? 'text-white opacity-100 scale-110' : 'text-gray-400 opacity-50 hover:text-teal-500'}`} />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 group/content">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover/content:text-teal-600 transition-colors duration-300">{mealId}</h3>
                    {isSelected && (
                      <div className="mt-2 flex items-center gap-2">
                        <label className="text-sm text-gray-700 flex items-center gap-2 flex-1">
                          <span>For</span>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={servings}
                            onChange={(e) => {
                              const newServings = parseInt(e.target.value) || 1
                              updateServings(mealId, newServings)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          <span>people</span>
                        </label>
                      </div>
                    )}
                    {!isSelected && (
                      <button
                        onClick={() => toggleMeal(mealId)}
                        className="button-interactive button-gradient w-full mt-2 py-2 px-4 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 text-white rounded-lg hover:from-teal-600 hover:via-cyan-600 hover:to-teal-600 transition-all duration-300 text-sm font-medium shadow-md"
                      >
                        Select Meal
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

