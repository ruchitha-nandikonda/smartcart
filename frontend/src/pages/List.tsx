import { useState, useEffect } from 'react';
import { FaList, FaShoppingCart, FaBoxOpen, FaDollarSign, FaStore, FaCheckCircle, FaInfoCircle, FaTag, FaTrash, FaHistory, FaUtensils } from 'react-icons/fa';
import { shoppingListsApi, type ShoppingListHistory } from '../api/shoppingLists';
import { pantryApi, type PantryItem } from '../api/pantry';

interface ShoppingItem {
  productId: string;
  qty: number;
  unit: string;
  storeId: string;
  price: number;
  originalPrice?: number | null;
  savings?: number | null;
  hasDeal?: boolean | null;
}

interface ShoppingList {
  list: ShoppingItem[];
  usesPantry: string[];
  costByStore: Record<string, number>;
  notes: string[];
  meals?: string[]; // Optional meal names for current list
  mealServings?: Record<string, number>;
  generatedAt?: string;
}

const filterDefaultPriceNotes = (notes?: string[]): string[] =>
  (notes ?? []).filter(note => !note.toLowerCase().includes('default prices'));

export default function List() {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [singleStore, setSingleStore] = useState(false);
  const [historyLists, setHistoryLists] = useState<ShoppingListHistory[]>([]);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [staleMatches, setStaleMatches] = useState<string[]>([]);

  useEffect(() => {
    // Load current list from localStorage
    const stored = localStorage.getItem('shoppingList');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setList({ ...parsed, notes: filterDefaultPriceNotes(parsed.notes) });
        // Debug: log meals to verify they're stored
        if (parsed.meals) {
          console.log('Current list meals:', parsed.meals);
        }
      } catch (err) {
        console.error('Failed to parse shopping list from localStorage', err);
      }
    }
    
    // Load shopping list history
    loadHistory();
    loadPantry();
  }, []);

  const loadHistory = async () => {
    try {
      const lists = await shoppingListsApi.getAll();
      setHistoryLists(lists);
    } catch (err) {
      console.error('Failed to load shopping list history', err);
    }
  };

  const loadPantry = async () => {
    try {
      const items = await pantryApi.getAll();
      setPantryItems(items);
    } catch (err) {
      console.error('Failed to load pantry items', err);
    }
  };

  const normalizeName = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  useEffect(() => {
    if (!list) {
      setStaleMatches([]);
      return;
    }

    if (pantryItems.length === 0) {
      setStaleMatches([]);
      return;
    }

    const pantryNames = pantryItems.map(item => normalizeName(item.name));

    const existingPantryMatches = new Set(
      (list.usesPantry || []).map(entry => {
        const cleaned = entry.split('(')[0].trim();
        return normalizeName(cleaned);
      })
    );

    const newlyCovered = new Set<string>();

    list.list.forEach(item => {
      const productNormalized = normalizeName(item.productId);
      if (existingPantryMatches.has(productNormalized)) {
        return;
      }

      const matched = pantryNames.some(pantryName =>
        pantryName.includes(productNormalized) || productNormalized.includes(pantryName)
      );

      if (matched) {
        newlyCovered.add(item.productId);
      }
    });

    setStaleMatches(Array.from(newlyCovered));
  }, [list, pantryItems]);

  const convertHistoryToDisplay = (history: ShoppingListHistory): ShoppingList => {
    // Convert history format to display format
    const items: ShoppingItem[] = history.items.map(item => ({
      productId: item.productId,
      qty: item.qty,
      unit: item.unit,
      storeId: item.storeId,
      price: item.price,
      originalPrice: null,
      savings: null,
      hasDeal: false
    }));

    return {
      list: items,
      usesPantry: history.usesPantry || [],
      costByStore: history.costByStore || {},
      notes: filterDefaultPriceNotes([]), // History doesn't store notes, but we could add them
      meals: history.meals || []
    };
  };

  const handleSelectList = async (listId: string | null) => {
    if (listId === null) {
      // Show current list from localStorage
      const stored = localStorage.getItem('shoppingList');
      if (stored) {
        const parsed = JSON.parse(stored);
        setList({ ...parsed, notes: filterDefaultPriceNotes(parsed.notes) });
      }
      setSelectedListId(null);
    } else {
      // Load selected list from history
      try {
        const historyList = await shoppingListsApi.getById(listId);
        const displayList = convertHistoryToDisplay(historyList);
        setList({ ...displayList, notes: filterDefaultPriceNotes(displayList.notes) });
        setSelectedListId(listId);
      } catch (err) {
        console.error('Failed to load shopping list', err);
        alert('Failed to load shopping list');
      }
    }
  };

  const handleClearList = () => {
    if (window.confirm('Are you sure you want to clear this shopping list? This will remove all items from your current list.')) {
      localStorage.removeItem('shoppingList');
      setList(null);
    }
  };

  if (!list) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-teal-100">
        <FaShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No shopping list available</h3>
        <p className="text-gray-500">Plan your meals first to generate a shopping list</p>
      </div>
    );
  }

  const totalCost = Object.values(list.costByStore).reduce((sum, cost) => sum + cost, 0);
  const selectedStore = singleStore && Object.keys(list.costByStore)[0];

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center space-x-2">
            <FaList className="w-8 h-8 text-teal-600" />
            <span>Shopping List</span>
          </h2>
          <p className="text-gray-500 mt-1">Your optimized grocery list</p>
        </div>
        <div className="flex items-center space-x-3">
          {historyLists.length > 0 && (
            <div className="relative">
              <select
                value={selectedListId || ''}
                onChange={(e) => handleSelectList(e.target.value || null)}
                className="bg-white px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-teal-300 cursor-pointer transition-all appearance-none pr-8 text-sm font-medium text-gray-700 min-w-[300px] max-w-[500px]"
                title={list.meals && list.meals.length > 0 ? `Current List - ${list.meals.join(', ')}` : 'Current List'}
              >
                <option value="">
                  {list.meals && list.meals.length > 0 
                    ? `✓ Current List - ${list.meals.join(', ')}`
                    : '✓ Current List'}
                </option>
                {historyLists.map((h) => (
                  <option key={h.listId} value={h.listId}>
                    {formatDate(h.createdAt)} - {h.meals && h.meals.length > 0 ? h.meals.join(', ') : `${h.meals.length} meal${h.meals.length !== 1 ? 's' : ''}`} - ${h.totalCost.toFixed(2)}
                  </option>
                ))}
              </select>
              <FaHistory className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          )}
          <button
            onClick={handleClearList}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-md"
            title="Clear shopping list"
          >
            <FaTrash className="w-4 h-4" />
            <span>Clear List</span>
          </button>
          <label className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-teal-300 cursor-pointer transition-all">
            <input
              type="checkbox"
              checked={singleStore}
              onChange={(e) => setSingleStore(e.target.checked)}
              className="w-5 h-5 text-teal-600 rounded"
            />
            <span className="font-medium text-gray-700">Single Store Only</span>
          </label>
        </div>
      </div>

      {/* Show meal names for current list */}
      {!selectedListId && list.meals && list.meals.length > 0 && (
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <FaUtensils className="w-5 h-5 text-teal-600" />
            <div className="flex-1">
              <p className="font-semibold text-teal-900 mb-1">Meals for This Shopping List</p>
              <div className="flex flex-wrap gap-2">
                {list.meals.map((meal, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium"
                  >
                    {meal}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show meal names for past list */}
      {selectedListId && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FaHistory className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900">Viewing Past Shopping List</p>
              <p className="text-sm text-blue-700">
                {historyLists.find(h => h.listId === selectedListId)?.meals.join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSelectList(null)}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Show Current List →
          </button>
        </div>
      )}

      {staleMatches.length > 0 && !selectedListId && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <FaInfoCircle className="w-5 h-5 text-yellow-600 mt-1" />
            <div>
              <p className="font-semibold text-yellow-900">Already in your pantry</p>
              <p className="text-sm text-yellow-800">
                You already have {staleMatches.join(', ')} on hand. We’ll keep that in mind when optimizing your shopping list.
              </p>
            </div>
          </div>
        </div>
      )}

      {list.usesPantry.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-3">
            <FaBoxOpen className="w-6 h-6 text-green-600" />
            <h3 className="font-bold text-green-900 text-lg">Using from Pantry</h3>
          </div>
          <p className="text-sm text-green-700 mb-3">These items are already in your pantry - no need to buy!</p>
          <div className="flex flex-wrap gap-2">
            {list.usesPantry.map((productId) => (
              <span
                key={productId}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700"
              >
                <FaCheckCircle className="w-4 h-4 mr-1" />
                {productId}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-teal-100 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <FaShoppingCart className="w-5 h-5" />
            <span>Items to Buy</span>
          </h3>
        </div>
        
        {list.list.filter((item) => !singleStore || item.storeId === selectedStore).length === 0 ? (
          <div className="p-12 text-center">
            <FaCheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-gray-500">All items are in your pantry!</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {list.list
              .filter((item) => !singleStore || item.storeId === selectedStore)
              .map((item, idx) => (
                <li key={idx} className="px-6 py-4 hover:bg-teal-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 flex items-center justify-center text-white font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-gray-800">{item.productId}</p>
                          {item.hasDeal && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <FaTag className="w-3 h-3 mr-1" />
                              Deal
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span className="flex items-center space-x-1">
                            <FaBoxOpen className="w-4 h-4" />
                            <span>{item.qty} {item.unit}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <FaStore className="w-4 h-4" />
                            <span>{item.storeId}</span>
                          </span>
                        </div>
                        {item.hasDeal && item.savings && item.savings > 0 && (
                          <div className="mt-1 text-xs text-green-600 font-medium">
                            💰 Save ${item.savings.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {item.hasDeal && item.originalPrice ? (
                        <div>
                          <p className="text-xl font-bold text-teal-600">${item.price.toFixed(2)}</p>
                          <p className="text-sm text-gray-400 line-through">${item.originalPrice.toFixed(2)}</p>
                        </div>
                      ) : (
                        <p className="text-xl font-bold text-gray-800">${item.price.toFixed(2)}</p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
          </ul>
        )}
        
        <div className="bg-gradient-to-r from-gray-50 to-cyan-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-gray-700 flex items-center space-x-2">
              <FaDollarSign className="w-5 h-5 text-teal-600" />
              <span>Total Cost:</span>
            </span>
            <span className="text-3xl font-bold bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
              ${totalCost.toFixed(2)}
            </span>
          </div>
          {!singleStore && Object.keys(list.costByStore).length > 1 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-600 mb-2">Breakdown by Store:</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(list.costByStore).map(([store, cost]) => (
                  <div key={store} className="bg-white p-3 rounded-lg border border-teal-100">
                    <p className="text-xs text-gray-500">{store}</p>
                    <p className="text-sm font-bold text-teal-600">${cost.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`border-2 rounded-xl p-6 ${
        list.notes.length > 0 
          ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200' 
          : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
      }`}>
        <div className="flex items-center space-x-2 mb-3">
          <FaInfoCircle className={`w-6 h-6 ${
            list.notes.length > 0 ? 'text-yellow-600' : 'text-green-600'
          }`} />
          <h3 className={`font-bold text-lg ${
            list.notes.length > 0 ? 'text-yellow-900' : 'text-green-900'
          }`}>Notes</h3>
        </div>
        {list.notes.length > 0 ? (
          <ul className="space-y-2">
            {list.notes.map((note, idx) => {
              const isWarning = note.includes("No deal found") || note.includes("default price");
              const isSuccess = note.includes("promotional deals") || note.includes("Using") || note.includes("🎉") || note.includes("💰") || note.includes("📍") || note.includes("📊");
              const isInfo = note.includes("Cost breakdown") || note.includes("Average price") || note.includes("Found prices");
              const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(note);
              
              return (
                <li key={idx} className={`text-sm flex items-start space-x-2 ${
                  isWarning ? 'text-yellow-800 font-medium' : 
                  isSuccess ? 'text-green-700 font-medium' : 
                  isInfo ? 'text-blue-700' : 
                  'text-gray-700'
                }`}>
                  <span className={`flex-shrink-0 ${
                    isWarning ? 'text-yellow-600' : 
                    isSuccess ? 'text-green-600' : 
                    isInfo ? 'text-blue-500' : 
                    'text-gray-500'
                  }`}>
                    {hasEmoji ? '' : (isSuccess ? '✓' : isWarning ? '⚠' : isInfo ? 'ℹ' : '•')}
                  </span>
                  <span className="flex-1">{note}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-600 flex items-center space-x-2">
            <FaInfoCircle className="w-4 h-4" />
            <span>No additional notes for this shopping list.</span>
          </p>
        )}
      </div>
    </div>
  );
}