import { useState, useEffect, useRef } from 'react'
import { pantryApi, type PantryItem, type CreatePantryItemRequest } from '../api/pantry'
import { FaPlus, FaEdit, FaTrash, FaBoxOpen, FaCalendarAlt, FaWeightHanging, FaExclamationTriangle, FaRobot, FaTh, FaList } from 'react-icons/fa'
import { getAllGroceryItems, getGroceryItemsByCategory } from '../data/groceryItems'
import AssistantModal from '../components/AssistantModal'
import VisualPantry from '../components/VisualPantry'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

// All items for fallback
const ALL_ITEMS = getAllGroceryItems()

export default function Pantry() {
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState<CreatePantryItemRequest>({
    name: '',
    quantity: 1,
    unit: 'unit',
    estExpiry: '',
    packSize: '',
    categories: [],
  })
  const [editingItem, setEditingItem] = useState<PantryItem | null>(null)
  const [error, setError] = useState('')
  const [itemSuggestions, setItemSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const [expiringItems, setExpiringItems] = useState<PantryItem[]>([])
  const [showAssistant, setShowAssistant] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'visual'>('list') // 'list' or 'visual'
  const reduceMotion = usePrefersReducedMotion()

  useEffect(() => {
    loadPantryItems()
    loadExpiringItems()
  }, [])

  useEffect(() => {
    // Close suggestions when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleItemNameChange = (value: string) => {
    setNewItem({ ...newItem, name: value })
    
    if (value.length > 0) {
      // Get items based on selected category
      let categoryItems: string[] = []
      if (selectedCategory) {
        categoryItems = getGroceryItemsByCategory(selectedCategory)
      } else {
        categoryItems = ALL_ITEMS
      }
      
      // Combine category items with items from pantry
      const existingItemNames = pantryItems.map(item => item.name)
      const allSuggestions = [...new Set([...categoryItems, ...existingItemNames])]
      
      // Filter suggestions based on input
      const filtered = allSuggestions
        .filter(item => item.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 8) // Limit to 8 suggestions
      
      setItemSuggestions(filtered)
      setShowSuggestions(filtered.length > 0)
    } else {
      setItemSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    // Reset suggestions when category changes
    if (newItem.name.length > 0) {
      handleItemNameChange(newItem.name)
    }
  }

  const selectSuggestion = (itemName: string) => {
    setNewItem({ ...newItem, name: itemName })
    setShowSuggestions(false)
    setItemSuggestions([])
  }

  const loadPantryItems = async () => {
    try {
      const items = await pantryApi.getAll()
      setPantryItems(items)
    } catch (error) {
      console.error('Failed to load pantry items', error)
      setError('Failed to load pantry items.')
    } finally {
      setLoading(false)
    }
  }

  const loadExpiringItems = async () => {
    try {
      const items = await pantryApi.getExpiring()
      setExpiringItems(items)
    } catch (err: any) {
      console.error('Failed to load expiring items', err)
    }
  }

  const handleAddOrUpdateItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (editingItem) {
        await pantryApi.update(editingItem.productId, newItem)
      } else {
        await pantryApi.create(newItem)
      }
      setShowAddForm(false)
      setNewItem({ name: '', quantity: 1, unit: 'unit', estExpiry: '', packSize: '', categories: [] })
      setEditingItem(null)
      setSelectedCategory('')
      loadPantryItems()
    } catch (error) {
      console.error('Failed to save pantry item', error)
      setError('Failed to save pantry item.')
    }
  }

  const handleDeleteItem = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await pantryApi.delete(productId)
        loadPantryItems()
      } catch (error) {
        console.error('Failed to delete pantry item', error)
        setError('Failed to delete pantry item.')
      }
    }
  }

  const startEdit = (item: PantryItem) => {
    setEditingItem(item)
    setSelectedCategory('') // Reset category filter when editing
    setNewItem({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      estExpiry: item.estExpiry ? item.estExpiry.split('T')[0] : '',
      packSize: item.packSize || '',
      categories: item.categories || [],
    })
    setShowAddForm(true)
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-700">Loading pantry...</div>
  }

  return (
    <div className="container mx-auto p-4">
      {/* Assistant Modal */}
      <AssistantModal isOpen={showAssistant} onClose={() => setShowAssistant(false)} />
      
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-6 mb-6 border border-teal-100 shadow-[0_25px_45px_rgba(15,118,110,0.15)]">
        <div className="absolute inset-0">
          <div className="absolute -top-16 -left-24 w-52 h-52 bg-emerald-200/30 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-20 right-0 w-64 h-64 bg-cyan-200/30 rounded-full blur-3xl animate-pulse-slower" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),transparent_45%)] pointer-events-none" />
        </div>
        <div className="relative flex justify-between items-center">
          <div>
            <div className="inline-flex items-center space-x-3 bg-white/70 backdrop-blur-md rounded-full px-5 py-2 border border-white/80 shadow-inner">
              <span className="text-xs uppercase tracking-wider text-emerald-600 font-semibold">Smart Pantry</span>
              <span className="text-emerald-500 text-xl">•</span>
              <span className="text-sm text-emerald-700 font-medium">Fresh | Organized | Waste-free</span>
            </div>
            <h2 className="mt-4 text-3xl md:text-4xl font-black text-emerald-900">
              Your Pantry
            </h2>
            <p className="mt-2 text-sm md:text-base text-emerald-700 max-w-xl">
              Track what’s stocked, what’s running low, and keep every ingredient ready for your next meal plan.
            </p>
          </div>
          <div className="hidden md:flex relative">
            <div className="w-40 h-40 rounded-2xl bg-white/70 backdrop-blur-sm border border-white shadow-xl flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-white to-cyan-100 opacity-70" />
              <div className="relative grid grid-cols-2 gap-3 p-4">
                {['🥑','🥖','🥚','🥕'].map((icon, idx) => (
                  <div key={idx} className="h-12 w-12 rounded-xl bg-white flex items-center justify-center text-xl shadow-[0_10px_20px_rgba(15,118,110,0.12)]">
                    {icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-3 right-4 hidden md:flex items-center space-x-2 text-xs text-emerald-600 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Pantry synced in real time</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <span className="text-sm text-emerald-600 font-semibold tracking-wide uppercase flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Pantry Overview
        </span>
        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-lg p-1 border border-teal-200/50">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                viewMode === 'list' 
                  ? 'bg-teal-100 text-teal-700 shadow-sm' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
              title="List View"
            >
              <FaList className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setViewMode('visual')}
              className={`px-3 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                viewMode === 'visual' 
                  ? 'bg-teal-100 text-teal-700 shadow-sm' 
                  : 'text-gray-700 hover:text-gray-900'
              }`}
              title="Visual View"
            >
              <FaTh className="h-4 w-4" />
              <span className="hidden sm:inline">Visual</span>
            </button>
          </div>
          
          {/* Assistant Button */}
          <button
            onClick={() => setShowAssistant(true)}
            className="button-interactive button-gradient bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 text-white font-bold py-2 px-4 rounded-lg shadow-md flex items-center transition-all duration-300"
            title="What can I cook tonight?"
          >
            <FaRobot className="mr-2" />
            <span className="hidden sm:inline">Hey SmartCart</span>
          </button>
          
          {/* Add Item Button */}
          <button
            onClick={() => {
              setShowAddForm(!showAddForm)
              setEditingItem(null)
              setSelectedCategory('')
              setNewItem({ name: '', quantity: 1, unit: 'unit', estExpiry: '', packSize: '', categories: [] })
            }}
            className="bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 hover:from-teal-600 hover:via-cyan-600 hover:to-teal-600 text-white font-bold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-150 ease-in-out"
          >
            <FaPlus className="mr-2" />
            {showAddForm ? 'Cancel' : 'Add Item'}
          </button>
        </div>
      </div>

      {expiringItems.length > 0 && (
        <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <FaExclamationTriangle className="w-5 h-5 text-yellow-600" />
            <h3 className="font-bold text-yellow-900">Expiring Items Alert</h3>
          </div>
          <p className="text-sm text-yellow-800 mb-2">
            {expiringItems.length} item(s) expiring soon or expired:
          </p>
          <div className="flex flex-wrap gap-2">
            {expiringItems.map((item) => (
              <span
                key={item.productId}
                className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
              >
                {item.name}
                {item.estExpiry && (
                  <span className="ml-2 text-xs">
                    ({new Date(item.estExpiry).toLocaleDateString()})
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 ${reduceMotion ? '' : 'animate-shake'}`}>
          {error}
        </div>
      )}

      {showAddForm && (
            <div className={`bg-white/80 backdrop-blur-sm shadow-lg rounded-xl p-6 mb-8 border border-teal-200/50 ${reduceMotion ? '' : 'animate-slideDown'}`}>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {editingItem ? 'Edit Pantry Item' : 'Add New Pantry Item'}
              </h3>
              <form onSubmit={handleAddOrUpdateItem} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-700">
                    Filter by Category (Optional)
                  </label>
                  <select
                    id="filterCategory"
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm bg-white"
                  >
                    <option value="">All Categories</option>
                    <option value="dairy">Dairy</option>
                    <option value="meat">Meat</option>
                    <option value="poultry">Poultry</option>
                    <option value="seafood">Seafood</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="grains">Grains</option>
                    <option value="bakery">Bakery</option>
                    <option value="beverages">Beverages</option>
                    <option value="snacks">Snacks</option>
                    <option value="frozen">Frozen</option>
                    <option value="canned">Canned</option>
                    <option value="condiments">Condiments</option>
                    <option value="spices">Spices</option>
                    <option value="health & wellness">Health & Wellness</option>
                    <option value="cleaning supplies">Cleaning Supplies</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Select a category to filter autocomplete suggestions</p>
                </div>
                <div className="relative md:col-span-2" ref={suggestionsRef}>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Item Name *
                  </label>
              <input
                type="text"
                id="name"
                value={newItem.name}
                onChange={(e) => handleItemNameChange(e.target.value)}
                onFocus={() => {
                  if (newItem.name.length > 0 && itemSuggestions.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder="Start typing item name..."
              />
              {showSuggestions && itemSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                  {itemSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => selectSuggestion(suggestion)}
                      className="px-4 py-2 hover:bg-teal-50 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                Quantity *
              </label>
              <input
                type="number"
                id="quantity"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                required
                min="0"
                step="0.1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                Unit *
              </label>
              <select
                id="unit"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              >
                <option value="unit">Unit</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="lb">Pounds (lb)</option>
                <option value="oz">Ounces (oz)</option>
                <option value="liters">Liters (L)</option>
                <option value="ml">Milliliters (ml)</option>
                <option value="pieces">Pieces</option>
                <option value="bottles">Bottles</option>
                <option value="cans">Cans</option>
                <option value="boxes">Boxes</option>
                <option value="bags">Bags</option>
                <option value="packages">Packages</option>
                <option value="containers">Containers</option>
              </select>
            </div>
            <div>
              <label htmlFor="estExpiry" className="block text-sm font-medium text-gray-700">
                Estimated Expiry Date
              </label>
              <input
                type="date"
                id="estExpiry"
                value={newItem.estExpiry}
                onChange={(e) => setNewItem({ ...newItem, estExpiry: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="packSize" className="block text-sm font-medium text-gray-700">
                Pack Size (e.g., 1kg, 6-pack)
              </label>
              <input
                type="text"
                id="packSize"
                value={newItem.packSize}
                onChange={(e) => setNewItem({ ...newItem, packSize: e.target.value })}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
              />
            </div>
            <div className="md:col-span-2 flex justify-end mt-4">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg shadow-md flex items-center transition duration-150 ease-in-out"
              >
                <FaPlus className="mr-2" />
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {pantryItems.length === 0 && !loading ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-lg">
          <FaBoxOpen className="mx-auto text-6xl text-gray-400 mb-4" />
          <p className="text-xl font-semibold">Your pantry is empty!</p>
          <p className="mt-2">Add some items to get started or upload a receipt.</p>
        </div>
      ) : viewMode === 'visual' ? (
        <VisualPantry
          items={pantryItems}
          onEdit={startEdit}
          onDelete={handleDeleteItem}
          onRefresh={loadPantryItems}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pantryItems.map((item) => (
            <div
              key={item.productId}
              className={`card-interactive bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 flex flex-col justify-between border border-teal-200/50 ${reduceMotion ? '' : 'animate-slideDown'}`}
            >
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.name}</h3>
                <p className="text-gray-600 flex items-center mb-1">
                  <FaBoxOpen className="mr-2 text-teal-500" />
                  Quantity: {item.quantity} {item.unit}
                </p>
                {item.estExpiry && (
                  <p className="text-gray-600 flex items-center mb-1">
                    <FaCalendarAlt className="mr-2 text-red-500" />
                    Expires: {new Date(item.estExpiry).toLocaleDateString()}
                  </p>
                )}
                {item.packSize && (
                  <p className="text-gray-600 flex items-center mb-1">
                    <FaWeightHanging className="mr-2 text-blue-500" />
                    Pack Size: {item.packSize}
                  </p>
                )}
                {item.categories && item.categories.length > 0 && (
                  <p className="text-gray-600 mt-1">
                    Categories:{' '}
                    {item.categories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-1"
                      >
                        {cat}
                      </span>
                    ))}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  Last Updated: {new Date(item.lastUpdated).toLocaleString()}
                </p>
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => startEdit(item)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out"
                >
                  <FaEdit className="mr-2" /> Edit
                </button>
                <button
                  onClick={() => handleDeleteItem(item.productId)}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out"
                >
                  <FaTrash className="mr-2" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
