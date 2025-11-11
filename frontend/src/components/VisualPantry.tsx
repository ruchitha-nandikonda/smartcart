import { type PantryItem } from '../api/pantry'
import { FaImage, FaEdit, FaTrash } from 'react-icons/fa'

interface VisualPantryProps {
  items: PantryItem[]
  onEdit: (item: PantryItem) => void
  onDelete: (productId: string) => void
  onRefresh?: () => void
}

const CATEGORY_ICONS: Record<string, string> = {
  dairy: '🥛',
  produce: '🥬',
  meat: '🍖',
  poultry: '🍗',
  seafood: '🐟',
  grains: '🌾',
  beverages: '🥤',
  snacks: '🍪',
  condiments: '🧂',
  frozen: '🧊',
  bakery: '🍞',
  canned: '🥫',
  spices: '🌶️',
  oils: '🫒',
  sauces: '🍅',
  desserts: '🍰',
  breakfast: '🥐',
  pasta: '🍝',
  rice: '🍚',
  beans: '🫘',
  nuts: '🥜',
  herbs: '🌿',
  vegetables: '🥕',
  fruits: '🍎',
  cheese: '🧀',
  deli: '🥓',
}

const CATEGORY_COLORS: Record<string, { bg: string; border: string; iconBg: string }> = {
  dairy: { bg: 'bg-gradient-to-br from-blue-50 to-cyan-50', border: 'border-blue-200', iconBg: 'bg-blue-100' },
  produce: { bg: 'bg-gradient-to-br from-green-50 to-emerald-50', border: 'border-green-200', iconBg: 'bg-green-100' },
  vegetables: { bg: 'bg-gradient-to-br from-green-50 to-lime-50', border: 'border-green-200', iconBg: 'bg-green-100' },
  fruits: { bg: 'bg-gradient-to-br from-pink-50 to-rose-50', border: 'border-pink-200', iconBg: 'bg-pink-100' },
  meat: { bg: 'bg-gradient-to-br from-red-50 to-rose-50', border: 'border-red-200', iconBg: 'bg-red-100' },
  poultry: { bg: 'bg-gradient-to-br from-orange-50 to-amber-50', border: 'border-orange-200', iconBg: 'bg-orange-100' },
  seafood: { bg: 'bg-gradient-to-br from-cyan-50 to-teal-50', border: 'border-cyan-200', iconBg: 'bg-cyan-100' },
  grains: { bg: 'bg-gradient-to-br from-yellow-50 to-amber-50', border: 'border-yellow-200', iconBg: 'bg-yellow-100' },
  beverages: { bg: 'bg-gradient-to-br from-purple-50 to-pink-50', border: 'border-purple-200', iconBg: 'bg-purple-100' },
  snacks: { bg: 'bg-gradient-to-br from-pink-50 to-rose-50', border: 'border-pink-200', iconBg: 'bg-pink-100' },
  condiments: { bg: 'bg-gradient-to-br from-amber-50 to-yellow-50', border: 'border-amber-200', iconBg: 'bg-amber-100' },
  frozen: { bg: 'bg-gradient-to-br from-indigo-50 to-blue-50', border: 'border-indigo-200', iconBg: 'bg-indigo-100' },
  bakery: { bg: 'bg-gradient-to-br from-amber-50 to-orange-50', border: 'border-amber-200', iconBg: 'bg-amber-100' },
  canned: { bg: 'bg-gradient-to-br from-gray-50 to-slate-50', border: 'border-gray-200', iconBg: 'bg-gray-100' },
  spices: { bg: 'bg-gradient-to-br from-red-50 to-orange-50', border: 'border-red-300', iconBg: 'bg-red-100' },
  oils: { bg: 'bg-gradient-to-br from-yellow-50 to-green-50', border: 'border-yellow-200', iconBg: 'bg-yellow-100' },
  sauces: { bg: 'bg-gradient-to-br from-red-50 to-pink-50', border: 'border-red-200', iconBg: 'bg-red-100' },
  desserts: { bg: 'bg-gradient-to-br from-pink-50 to-purple-50', border: 'border-pink-200', iconBg: 'bg-pink-100' },
  breakfast: { bg: 'bg-gradient-to-br from-yellow-50 to-orange-50', border: 'border-yellow-200', iconBg: 'bg-yellow-100' },
  pasta: { bg: 'bg-gradient-to-br from-amber-50 to-yellow-50', border: 'border-amber-200', iconBg: 'bg-amber-100' },
  rice: { bg: 'bg-gradient-to-br from-white to-gray-50', border: 'border-gray-200', iconBg: 'bg-gray-100' },
  beans: { bg: 'bg-gradient-to-br from-brown-50 to-amber-50', border: 'border-amber-200', iconBg: 'bg-amber-100' },
  nuts: { bg: 'bg-gradient-to-br from-amber-50 to-brown-50', border: 'border-amber-200', iconBg: 'bg-amber-100' },
  herbs: { bg: 'bg-gradient-to-br from-green-50 to-emerald-50', border: 'border-green-200', iconBg: 'bg-green-100' },
  cheese: { bg: 'bg-gradient-to-br from-yellow-50 to-amber-50', border: 'border-yellow-200', iconBg: 'bg-yellow-100' },
  deli: { bg: 'bg-gradient-to-br from-red-50 to-pink-50', border: 'border-red-200', iconBg: 'bg-red-100' },
}

const DEFAULT_COLOR = { bg: 'bg-gradient-to-br from-gray-50 to-slate-50', border: 'border-gray-200', iconBg: 'bg-gray-100' }
const DEFAULT_ICON = '📦'

export default function VisualPantry({ items, onEdit, onDelete }: VisualPantryProps) {

  // Smart category detection from item name
  const detectCategoryFromName = (name: string): string | null => {
    const nameLower = name.toLowerCase()
    
    // IMPORTANT: Check meat/deli items FIRST before vegetables
    // because "pepperoni" contains "pepper" which would match vegetables
    
    // Deli/Meat detection (BEFORE vegetables to catch pepperoni, salami, etc.)
    if (nameLower.includes('pepperoni') || nameLower.includes('salami') || nameLower.includes('prosciutto') ||
        nameLower.includes('ham') || nameLower.includes('bologna') || nameLower.includes('pastrami') ||
        nameLower.includes('mortadella') || nameLower.includes('capicola')) {
      return 'deli'
    }
    
    // Meat detection (BEFORE vegetables)
    if (nameLower.includes('beef') || nameLower.includes('steak') || nameLower.includes('pork') ||
        nameLower.includes('sausage') || nameLower.includes('bacon') || nameLower.includes('rib') ||
        nameLower.includes('roast') || nameLower.includes('ground beef') || nameLower.includes('hamburger') ||
        nameLower.includes('meatball') || nameLower.includes('chorizo') || nameLower.includes('bratwurst')) {
      return 'meat'
    }
    
    // Poultry detection (BEFORE vegetables)
    if (nameLower.includes('chicken') || nameLower.includes('turkey') || nameLower.includes('duck')) {
      return 'poultry'
    }
    
    // Seafood detection (BEFORE vegetables)
    if (nameLower.includes('fish') || nameLower.includes('salmon') || nameLower.includes('tuna') ||
        nameLower.includes('shrimp') || nameLower.includes('crab') || nameLower.includes('lobster') ||
        nameLower.includes('tilapia') || nameLower.includes('cod') || nameLower.includes('sardine')) {
      return 'seafood'
    }
    
    // Cheese detection (before dairy to catch specific cheeses)
    if (nameLower.includes('cheese') && !nameLower.includes('cream cheese')) {
      return 'cheese'
    }
    
    // Dairy detection
    if (nameLower.includes('milk') || nameLower.includes('yogurt') || 
        nameLower.includes('butter') || nameLower.includes('cream') || nameLower.includes('sour cream') ||
        nameLower.includes('cream cheese') || nameLower.includes('cottage cheese')) {
      return 'dairy'
    }
    
    // Eggs detection
    if (nameLower.includes('egg')) {
      return 'dairy' // Eggs are often categorized with dairy
    }
    
    // Vegetables detection (AFTER meat to avoid false matches)
    // Exclude "pepperoni" and "pepper" that's part of meat items
    if ((nameLower.includes('broccoli') || nameLower.includes('carrot') || nameLower.includes('lettuce') ||
        nameLower.includes('tomato') || nameLower.includes('onion') ||
        nameLower.includes('celery') || nameLower.includes('cucumber') || nameLower.includes('zucchini') ||
        nameLower.includes('mushroom') || nameLower.includes('asparagus') || nameLower.includes('corn') ||
        nameLower.includes('potato') || nameLower.includes('spinach') || nameLower.includes('kale') ||
        nameLower.includes('cabbage') || nameLower.includes('cauliflower') || nameLower.includes('peas') ||
        nameLower.includes('green bean') || nameLower.includes('garlic')) &&
        !nameLower.includes('pepperoni') && !nameLower.includes('salami')) {
      return 'vegetables'
    }
    
    // Bell pepper detection (separate check to avoid meat conflicts)
    if (nameLower.includes('bell pepper') || nameLower.includes('pepper') && 
        !nameLower.includes('pepperoni') && !nameLower.includes('black pepper') && 
        !nameLower.includes('red pepper') && !nameLower.includes('cayenne pepper')) {
      return 'vegetables'
    }
    
    // Fruits detection
    if (nameLower.includes('apple') || nameLower.includes('banana') || nameLower.includes('orange') ||
        nameLower.includes('berry') || nameLower.includes('grape') || nameLower.includes('lemon') ||
        nameLower.includes('lime') || nameLower.includes('strawberry') || nameLower.includes('blueberry') ||
        nameLower.includes('mango') || nameLower.includes('pineapple') || nameLower.includes('peach') ||
        nameLower.includes('pear') || nameLower.includes('cherry') || nameLower.includes('plum')) {
      return 'fruits'
    }
    
    // Produce (general fallback for fresh items)
    if (nameLower.includes('produce') || nameLower.includes('fresh')) {
      return 'produce'
    }
    
    // Bakery detection
    if (nameLower.includes('bread') || nameLower.includes('bun') || nameLower.includes('roll') ||
        nameLower.includes('biscuit') || nameLower.includes('bagel') || nameLower.includes('muffin') ||
        nameLower.includes('croissant') || nameLower.includes('donut') || nameLower.includes('doughnut') ||
        nameLower.includes('pastry') || nameLower.includes('cake') || nameLower.includes('pie')) {
      return 'bakery'
    }
    
    // Breakfast detection
    if (nameLower.includes('cereal') || nameLower.includes('oatmeal') || nameLower.includes('pancake') ||
        nameLower.includes('waffle') || nameLower.includes('syrup') || nameLower.includes('toast')) {
      return 'breakfast'
    }
    
    // Pasta detection
    if (nameLower.includes('pasta') || nameLower.includes('spaghetti') || nameLower.includes('penne') ||
        nameLower.includes('macaroni') || nameLower.includes('lasagna') || nameLower.includes('ravioli') ||
        nameLower.includes('fettuccine') || nameLower.includes('linguine')) {
      return 'pasta'
    }
    
    // Rice detection
    if (nameLower.includes('rice') && !nameLower.includes('crispy rice')) {
      return 'rice'
    }
    
    // Beans detection
    if (nameLower.includes('bean') && !nameLower.includes('green bean') && !nameLower.includes('jelly bean')) {
      return 'beans'
    }
    
    // Grains detection
    if (nameLower.includes('flour') || nameLower.includes('oat') || nameLower.includes('quinoa') ||
        nameLower.includes('barley') || nameLower.includes('wheat') || nameLower.includes('cereal') ||
        nameLower.includes('grain')) {
      return 'grains'
    }
    
    // Nuts detection
    if (nameLower.includes('almond') || nameLower.includes('peanut') || nameLower.includes('walnut') ||
        nameLower.includes('cashew') || nameLower.includes('pecan') || nameLower.includes('hazelnut') ||
        nameLower.includes('pistachio') || (nameLower.includes('nut') && !nameLower.includes('donut'))) {
      return 'nuts'
    }
    
    // Beverages detection
    if (nameLower.includes('juice') || nameLower.includes('soda') || nameLower.includes('water') ||
        nameLower.includes('coffee') || nameLower.includes('tea') || nameLower.includes('beer') ||
        nameLower.includes('wine') || nameLower.includes('drink') || nameLower.includes('lemonade')) {
      return 'beverages'
    }
    
    // Snacks detection
    if (nameLower.includes('chip') || nameLower.includes('cracker') || nameLower.includes('cookie') ||
        nameLower.includes('pretzel') || nameLower.includes('popcorn') || nameLower.includes('candy') ||
        nameLower.includes('chocolate') || nameLower.includes('gum')) {
      return 'snacks'
    }
    
    // Desserts detection
    if (nameLower.includes('ice cream') || nameLower.includes('pudding') || nameLower.includes('gelato') ||
        nameLower.includes('sorbet') || nameLower.includes('mousse') || nameLower.includes('tiramisu')) {
      return 'desserts'
    }
    
    // Condiments detection
    if (nameLower.includes('ketchup') || nameLower.includes('mustard') || nameLower.includes('mayonnaise') ||
        nameLower.includes('mayo') || nameLower.includes('relish') || nameLower.includes('pickle')) {
      return 'condiments'
    }
    
    // Sauces detection
    if (nameLower.includes('sauce') || nameLower.includes('marinara') || nameLower.includes('pesto') ||
        nameLower.includes('salsa') || nameLower.includes('gravy') || nameLower.includes('dressing')) {
      return 'sauces'
    }
    
    // Spices detection
    if (nameLower.includes('pepper') || nameLower.includes('salt') || nameLower.includes('cumin') ||
        nameLower.includes('paprika') || nameLower.includes('cinnamon') || nameLower.includes('oregano') ||
        nameLower.includes('basil') || nameLower.includes('thyme') || nameLower.includes('rosemary') ||
        nameLower.includes('spice') || nameLower.includes('seasoning')) {
      return 'spices'
    }
    
    // Herbs detection
    if (nameLower.includes('herb') || nameLower.includes('parsley') || nameLower.includes('cilantro') ||
        nameLower.includes('dill') || nameLower.includes('mint') || nameLower.includes('sage')) {
      return 'herbs'
    }
    
    // Oils detection
    if (nameLower.includes('oil') || nameLower.includes('olive oil') || nameLower.includes('vegetable oil') ||
        nameLower.includes('canola') || nameLower.includes('coconut oil') || nameLower.includes('avocado oil')) {
      return 'oils'
    }
    
    // Frozen detection
    if (nameLower.includes('frozen') || nameLower.includes('ice')) {
      return 'frozen'
    }
    
    // Canned detection
    if (nameLower.includes('canned') || nameLower.includes('can ')) {
      return 'canned'
    }
    
    return null
  }

  const getCategoryIcon = (categories: string[] | undefined, itemName?: string): string => {
    let category: string | null = null
    
    if (categories && categories.length > 0) {
      category = categories[0].toLowerCase()
    } else if (itemName) {
      // Try to detect category from name
      category = detectCategoryFromName(itemName)
    }
    
    if (category) {
      return CATEGORY_ICONS[category] || DEFAULT_ICON
    }
    return DEFAULT_ICON
  }

  const getCategoryColor = (categories: string[] | undefined, itemName?: string) => {
    let category: string | null = null
    
    if (categories && categories.length > 0) {
      category = categories[0].toLowerCase()
    } else if (itemName) {
      // Try to detect category from name
      category = detectCategoryFromName(itemName)
    }
    
    if (category) {
      return CATEGORY_COLORS[category] || DEFAULT_COLOR
    }
    // Enhanced default color - more vibrant
    return { 
      bg: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50', 
      border: 'border-indigo-200', 
      iconBg: 'bg-gradient-to-br from-indigo-100 to-purple-100' 
    }
  }

  const getQuantityRatio = (item: PantryItem): number => {
    // Assume a reasonable max quantity based on unit
    const unit = item.unit?.toLowerCase() || 'piece'
    let maxQuantity = 10

    if (unit.includes('lb') || unit.includes('kg')) {
      maxQuantity = 5
    } else if (unit.includes('oz') || unit.includes('ml')) {
      maxQuantity = 32
    } else if (unit.includes('gallon') || unit.includes('liter')) {
      maxQuantity = 2
    }

    return Math.min(item.quantity / maxQuantity, 1.0)
  }

  const getSizeClass = (ratio: number): string => {
    if (ratio > 0.7) return 'w-24 h-24 text-6xl'
    if (ratio > 0.4) return 'w-20 h-20 text-5xl'
    if (ratio > 0.2) return 'w-16 h-16 text-4xl'
    return 'w-12 h-12 text-3xl'
  }

  const getProgressColor = (ratio: number): string => {
    if (ratio > 0.5) return 'bg-green-500'
    if (ratio > 0.25) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FaImage className="mx-auto h-16 w-16 text-gray-300 mb-4" />
        <p>No items in your pantry yet.</p>
        <p className="text-sm mt-2">Add items to see them here!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 p-6">
      {items.map((item) => {
        const ratio = getQuantityRatio(item)
        const itemName = item.name || item.productId || ''
        const icon = getCategoryIcon(item.categories, itemName)
        const colors = getCategoryColor(item.categories, itemName)
        const sizeClass = getSizeClass(ratio)
        const isLowStock = ratio < 0.25
        const isExpiringSoon = item.estExpiry && new Date(item.estExpiry) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

        return (
          <div
            key={item.productId}
            className={`relative ${colors.bg} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-5 border-2 ${colors.border} hover:scale-105 transform group`}
          >
            {/* Low stock indicator - Enhanced */}
            {isLowStock && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md animate-pulse">
                LOW
              </div>
            )}

            {/* Expiring soon indicator */}
            {isExpiringSoon && !isLowStock && (
              <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                ⚠️ Soon
              </div>
            )}

            {/* Icon with beautiful background */}
            <div className="flex flex-col items-center justify-center mb-4">
              <div
                className={`${colors.iconBg} rounded-2xl p-4 mb-3 shadow-inner transition-all duration-300 group-hover:shadow-lg`}
                style={{
                  transform: `scale(${0.7 + ratio * 0.3})`,
                  opacity: ratio > 0.2 ? 1 : 0.6,
                }}
              >
                <div className={`${sizeClass} flex items-center justify-center`}>
                  <span className="text-6xl filter drop-shadow-lg">{icon}</span>
                </div>
              </div>

              {/* Enhanced quantity indicator */}
              <div className="w-full bg-white/60 rounded-full h-3 mt-2 overflow-hidden shadow-inner">
                <div
                  className={`h-full transition-all duration-500 rounded-full shadow-sm ${getProgressColor(ratio)}`}
                  style={{ width: `${Math.max(ratio * 100, 5)}%` }}
                />
              </div>
              <p className="text-xs font-semibold text-gray-600 mt-2">
                {Math.round(ratio * 100)}% remaining
              </p>
            </div>

            {/* Item info - Enhanced */}
            <div className="text-center mb-4">
              <h3 className="font-bold text-base text-gray-900 truncate mb-1 group-hover:text-indigo-700 transition-colors">
                {item.name || item.productId}
              </h3>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <span className="font-semibold text-gray-700">{item.quantity}</span>
                <span className="text-gray-500">{item.unit || 'units'}</span>
              </div>
            </div>

            {/* Action buttons - Enhanced */}
            <div className="flex justify-center space-x-3 mt-4 pt-4 border-t-2 border-white/50">
              <button
                onClick={() => onEdit(item)}
                className="p-2.5 bg-white/80 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                title="Edit"
              >
                <FaEdit className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(item.productId)}
                className="p-2.5 bg-white/80 hover:bg-red-100 text-red-600 rounded-xl transition-all duration-200 hover:scale-110 shadow-sm hover:shadow-md"
                title="Delete"
              >
                <FaTrash className="h-4 w-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

