import { useState, useEffect } from 'react'
import { shoppingListsApi, type ShoppingListHistory } from '../api/shoppingLists'
import { FaHistory, FaTrash, FaDollarSign, FaStore, FaCalendar, FaUtensils, FaSpinner } from 'react-icons/fa'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export default function ShoppingListHistory() {
  const [lists, setLists] = useState<ShoppingListHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    loadLists()
  }, [])

  const loadLists = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await shoppingListsApi.getAll()
      setLists(data)
    } catch (err: any) {
      console.error('Failed to load shopping lists', err)
      setError(err.message || 'Failed to load shopping lists. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (listId: string) => {
    if (!window.confirm('Are you sure you want to delete this shopping list?')) {
      return
    }
    try {
      await shoppingListsApi.delete(listId)
      await loadLists()
    } catch (err: any) {
      console.error('Failed to delete shopping list', err)
      setError('Failed to delete shopping list.')
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className={`${reduceMotion ? '' : 'animate-spin'} text-teal-600 text-4xl`} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center space-x-2">
            <FaHistory className="w-8 h-8 text-teal-600" />
            <span>Shopping List History</span>
          </h2>
          <p className="text-gray-500 mt-1">View your past shopping lists</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {lists.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-teal-100">
          <FaHistory className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No shopping lists yet</h3>
          <p className="text-gray-500">Generate a shopping list from the Meal Plan page to see it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <div key={list.listId} className="bg-white rounded-xl shadow-lg p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <FaCalendar className="w-4 h-4" />
                  <span>{formatDate(list.createdAt)}</span>
                </div>
                <button
                  onClick={() => handleDelete(list.listId)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>

              {list.meals && list.meals.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <FaUtensils className="w-4 h-4" />
                    <span className="font-semibold">Meals ({list.meals.length})</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {list.meals.map((meal, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium"
                      >
                        {meal}
                      </span>
                    ))}
                  </div>
                  {list.totalServings > 0 && (
                    <p className="text-xs text-gray-500 mt-1">Total servings: {list.totalServings}</p>
                  )}
                </div>
              )}

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700 flex items-center">
                    <FaDollarSign className="w-4 h-4 mr-1 text-teal-600" />
                    Total Cost:
                  </span>
                  <span className="text-2xl font-bold text-teal-600">
                    ${list.totalCost.toFixed(2)}
                  </span>
                </div>
                {Object.keys(list.costByStore).length > 1 && (
                  <div className="mt-2 space-y-1">
                    {Object.entries(list.costByStore).map(([store, cost]) => (
                      <div key={store} className="flex items-center justify-between text-xs text-gray-600">
                        <span className="flex items-center">
                          <FaStore className="w-3 h-3 mr-1" />
                          {store}
                        </span>
                        <span className="font-semibold">${cost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Items: {list.items.length}</span>
                </div>
                {list.usesPantry && list.usesPantry.length > 0 && (
                  <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                    Used {list.usesPantry.length} item(s) from pantry
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

