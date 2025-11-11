import { useState, useEffect } from 'react'
import { dealsApi, type Deal } from '../api/deals'
import { FaTag, FaStore, FaDollarSign, FaCalendar, FaFilter, FaSearch } from 'react-icons/fa'
import { GridSkeleton } from '../components/LoadingSkeleton'
import DatePicker from '../components/DatePicker'
import { sampleDeals } from '../data/sampleDeals'

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [allDeals, setAllDeals] = useState<Deal[]>([]) // Store all deals for store mapping
  const [filteredDeals, setFilteredDeals] = useState<Deal[]>([]) // Deals after search filter
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterStore, setFilterStore] = useState<string>('')
  const [filterDate, setFilterDate] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [usingFallback, setUsingFallback] = useState<boolean>(false)
  const [dataSourceNote, setDataSourceNote] = useState<string>('')

  const normaliseDeals = (payload: unknown): Deal[] => {
    if (Array.isArray(payload)) {
      return payload as Deal[]
    }
    if (payload && typeof payload === 'object') {
      const maybeItems = (payload as Record<string, unknown>).items
      if (Array.isArray(maybeItems)) {
        return maybeItems as Deal[]
      }
    }
    return []
  }

  const filterByStoreAndDate = (dataset: Deal[]) => {
    return dataset.filter(deal => {
      const storeMatches = !filterStore || deal.storeName === filterStore
      const dateMatches = !filterDate || deal.date === filterDate
      return storeMatches && dateMatches
    })
  }

  const applySearchToDataset = (dataset: Deal[]) => {
    if (!searchQuery.trim()) {
      return dataset
    }
    const query = searchQuery.toLowerCase().trim()
    return dataset.filter(deal =>
      deal.productName.toLowerCase().includes(query) ||
      deal.productId.toLowerCase().includes(query) ||
      deal.sizeText.toLowerCase().includes(query)
    )
  }

  const activateFallback = (reason?: string) => {
    console.warn('Using sample deals fallback data.', reason)
    const filtered = filterByStoreAndDate(sampleDeals)
    const searched = applySearchToDataset(filtered)
    setUsingFallback(true)
    setDataSourceNote('Showing sample deals while we fetch live offers.')
    setError('')
    setAllDeals(sampleDeals)
    setDeals(filtered)
    setFilteredDeals(searched)
    setLoading(false)
  }

  // Load all deals once on mount to build store mapping
  useEffect(() => {
    const loadAllDeals = async () => {
      try {
        const response = await dealsApi.getAll()
        const data = normaliseDeals(response)
        if (data.length === 0) {
          activateFallback('API returned no deals.')
          return
        }
        setUsingFallback(false)
        setDataSourceNote('')
        setAllDeals(data)
        // Also set initial deals if no filter is set
        if (!filterStore && !filterDate) {
          setDeals(data)
          setFilteredDeals(applySearchToDataset(data))
        }
        setLoading(false)
      } catch (err) {
        console.error('Failed to load deals for mapping', err)
        activateFallback('Failed to load deals from API.')
      }
    }
    loadAllDeals()
  }, [])

  useEffect(() => {
    // Wait for allDeals to load before filtering (needed for store name -> ID mapping)
    if (allDeals.length === 0 && (filterStore || filterDate)) {
      return // Wait for allDeals to load first
    }
    loadDeals()
  }, [filterStore, filterDate, allDeals])

  // Apply search filter to deals
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredDeals(deals)
      return
    }
    
    const query = searchQuery.toLowerCase().trim()
    const filtered = deals.filter(deal => 
      deal.productName.toLowerCase().includes(query) ||
      deal.productId.toLowerCase().includes(query) ||
      deal.sizeText.toLowerCase().includes(query)
    )
    setFilteredDeals(filtered)
  }, [searchQuery, deals])

  const loadDeals = async () => {
    try {
      setLoading(true)
      setError('')

      if (usingFallback) {
        const filtered = filterByStoreAndDate(sampleDeals)
        const searched = applySearchToDataset(filtered)
        setDeals(filtered)
        setFilteredDeals(searched)
        setLoading(false)
        return
      }
      
      // Convert storeName to storeId if filterStore is set
      let storeId: string | undefined = undefined
      if (filterStore) {
        if (allDeals.length === 0) {
          // Load all deals first to build mapping
          const allData = normaliseDeals(await dealsApi.getAll())
          setAllDeals(allData)
          const storeMap = new Map<string, string>()
          allData.forEach(deal => {
            if (!storeMap.has(deal.storeName)) {
              storeMap.set(deal.storeName, deal.storeId)
            }
          })
          storeId = storeMap.get(filterStore)
        } else {
          // Find the storeId from storeName using existing allDeals
          const storeMap = new Map<string, string>()
          allDeals.forEach(deal => {
            if (!storeMap.has(deal.storeName)) {
              storeMap.set(deal.storeName, deal.storeId)
            }
          })
          storeId = storeMap.get(filterStore)
        }
        
        if (!storeId) {
          console.error(`Store ID not found for store name: ${filterStore}`)
          setError(`Store "${filterStore}" not found`)
          setDeals([])
          setLoading(false)
          return
        }
        
        console.log(`Filtering by store: ${filterStore} (ID: ${storeId})`)
      }
      
      const response = await dealsApi.getAll(storeId, filterDate || undefined)
      const data = normaliseDeals(response)
      if (data.length === 0) {
        activateFallback('API returned no deals for selected filters.')
        return
      }
      setUsingFallback(false)
      setDataSourceNote('')
      console.log(`Loaded ${data.length} deals for storeId: ${storeId || 'all'}`)
      setDeals(data)
      // Apply search filter if query exists, otherwise show all
      if (searchQuery.trim()) {
        const searched = applySearchToDataset(data)
        setFilteredDeals(searched)
      } else {
        setFilteredDeals(data)
      }
    } catch (err: any) {
      console.error('Failed to load deals', err)
      setError(err.message || 'Failed to load deals. Please try again.')
      if (!usingFallback) {
        activateFallback('Falling back due to loadDeals error.')
      }
    } finally {
      if (!usingFallback) {
        setLoading(false)
      }
    }
  }

  // Get unique stores for filtering (use allDeals for dropdown options)
  const uniqueStores = Array.from(new Set(allDeals.map(d => d.storeName))).sort()

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (dateStr.length === 8) {
      // YYYYMMDD format
      const year = dateStr.substring(0, 4)
      const month = dateStr.substring(4, 6)
      const day = dateStr.substring(6, 8)
      return `${month}/${day}/${year}`
    }
    return dateStr
  }

  // Calculate savings
  const calculateSavings = (deal: Deal) => {
    if (deal.promoPrice && deal.unitPrice) {
      return deal.unitPrice - deal.promoPrice
    }
    return 0
  }

  const savingsPercent = (deal: Deal) => {
    if (deal.promoPrice && deal.unitPrice) {
      return Math.round(((deal.unitPrice - deal.promoPrice) / deal.unitPrice) * 100)
    }
    return 0
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
          <FaTag className="mr-3 text-teal-600" />
          Current Deals
        </h2>
        <GridSkeleton count={6} />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
            <FaTag className="mr-3 text-teal-600" />
            Current Deals
          </h2>
          <p className="mt-2 text-gray-600">Browse available deals from local stores</p>
          {dataSourceNote && (
            <p className="mt-1 text-xs text-teal-600 font-medium">{dataSourceNote}</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-teal-100">
        <div className="flex items-center space-x-4 mb-4">
          <FaFilter className="text-teal-600" />
          <h3 className="text-lg font-semibold text-gray-700">Filters</h3>
        </div>
        <div className="space-y-4">
          {/* Search Bar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Products</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by product name..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  title="Clear search"
                >
                  <span className="text-xl">×</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Store and Date Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Store</label>
              <select
                value={filterStore}
                onChange={(e) => setFilterStore(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">All Stores</option>
                {uniqueStores.map(store => (
                  <option key={store} value={store}>{store}</option>
                ))}
              </select>
            </div>
            <div className="md:flex md:justify-end">
              <DatePicker
                value={filterDate}
                onChange={(date) => setFilterDate(date)}
                label="Date"
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          {error}
        </div>
      )}

      {filteredDeals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-teal-100">
          <FaTag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No deals found</h3>
          <p className="text-gray-500">
            {filterStore || filterDate 
              ? 'Try adjusting your filters or import some deals.'
              : 'No deals have been imported yet. Import deals to see them here.'}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {filteredDeals.length} deal{filteredDeals.length !== 1 ? 's' : ''}
              {searchQuery && (
                <span className="ml-2 font-semibold text-teal-700">
                  matching "{searchQuery}"
                </span>
              )}
              {filterStore && (
                <span className="ml-2 font-semibold text-teal-700">
                  at {filterStore}
                </span>
              )}
            </div>
            {filterStore && filteredDeals.length > 0 && (
              <div className="text-xs text-gray-500">
                Store: {filteredDeals[0]?.storeName || filterStore}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDeals.map((deal, idx) => {
              const savings = calculateSavings(deal)
              const percent = savingsPercent(deal)
              const hasPromo = deal.promoPrice && deal.promoPrice < deal.unitPrice

              return (
                <div
                  key={`${deal.storeId}-${deal.productId}-${idx}`}
                  className="bg-white rounded-xl shadow-lg p-6 border border-teal-100 hover:shadow-xl transition-shadow relative"
                >
                  {/* Store badge and discount badge aligned in top right */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    {hasPromo && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                        -{percent}%
                      </span>
                    )}
                    <span className="bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 text-white text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                      {deal.storeName}
                    </span>
                  </div>
                  
                  <div className="mb-3 pr-32">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{deal.productName}</h3>
                      <p className="text-sm text-gray-600">{deal.sizeText}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaStore className="w-4 h-4 mr-2 text-teal-600" />
                      <span className="font-medium">{deal.storeName}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendar className="w-4 h-4 mr-2 text-teal-600" />
                      <span>{formatDate(deal.date)}</span>
                      {deal.promoEnds && (
                        <span className="ml-2 text-xs text-gray-500">
                          (Expires: {new Date(deal.promoEnds).toLocaleDateString()})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        {hasPromo ? (
                          <>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg font-bold text-teal-600">
                                ${deal.promoPrice!.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                ${deal.unitPrice.toFixed(2)}
                              </span>
                            </div>
                            <div className="text-xs text-green-600 font-medium mt-1">
                              Save ${savings.toFixed(2)}
                            </div>
                          </>
                        ) : (
                          <div className="text-lg font-bold text-gray-900">
                            ${deal.unitPrice.toFixed(2)}
                          </div>
                        )}
                      </div>
                      <FaDollarSign className="w-6 h-6 text-teal-600" />
                    </div>
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

