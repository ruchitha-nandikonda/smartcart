import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../store/store'
import { FaUser, FaEnvelope, FaEdit, FaTimes, FaBoxOpen, FaHeart, FaList, FaReceipt, FaChartLine } from 'react-icons/fa'
import { favoritesApi } from '../api/favorites'
import { pantryApi } from '../api/pantry'
import { shoppingListsApi } from '../api/shoppingLists'
import { receiptsApi } from '../api/receipts'

export default function Profile() {
  const { email } = useSelector((state: RootState) => state.auth)
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState(() => localStorage.getItem('customerFirstName') || '')
  const [lastName, setLastName] = useState(() => localStorage.getItem('customerLastName') || '')
  const [draftFirst, setDraftFirst] = useState(firstName)
  const [draftLast, setDraftLast] = useState(lastName)
  const preferredName = firstName || (email ? email.split('@')[0] : 'User')
  const [stats, setStats] = useState({
    pantryItems: 0,
    favorites: 0,
    shoppingLists: 0,
    receipts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      const [pantryItems, favorites, lists, receipts] = await Promise.all([
        pantryApi.getAll().catch(() => []),
        favoritesApi.getAll().catch(() => []),
        shoppingListsApi.getAll().catch(() => []),
        receiptsApi.getAll().catch(() => []),
      ])
      
      setStats({
        pantryItems: pantryItems.length || 0,
        favorites: favorites.length || 0,
        shoppingLists: lists.length || 0,
        receipts: receipts.length || 0,
      })
    } catch (error) {
      console.error('Failed to load stats', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (email: string | null) => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    if (firstName) return firstName.charAt(0).toUpperCase()
    if (!email) return 'U'
    return email.charAt(0).toUpperCase()
  }

  const handleCancelEdit = () => {
    setDraftFirst(firstName)
    setDraftLast(lastName)
    setIsEditing(false)
  }

  const handleSaveProfile = () => {
    const trimmedFirst = draftFirst.trim()
    const trimmedLast = draftLast.trim()
    if (!trimmedFirst || !trimmedLast) {
      return
    }
    localStorage.setItem('customerFirstName', trimmedFirst)
    localStorage.setItem('customerLastName', trimmedLast)
    setFirstName(trimmedFirst)
    setLastName(trimmedLast)
    setIsEditing(false)
  }

  const statCards = [
    {
      icon: <FaBoxOpen className="text-3xl" />,
      label: 'Pantry Items',
      value: stats.pantryItems,
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-teal-100',
    },
    {
      icon: <FaHeart className="text-3xl" />,
      label: 'Favorites',
      value: stats.favorites,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-100',
    },
    {
      icon: <FaList className="text-3xl" />,
      label: 'Shopping Lists',
      value: stats.shoppingLists,
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-blue-100',
    },
    {
      icon: <FaReceipt className="text-3xl" />,
      label: 'Receipts',
      value: stats.receipts,
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-100',
    },
  ]

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
          <FaUser className="mr-3 text-teal-600" />
          Profile
        </h2>
        <p className="mt-2 text-gray-700">View your profile information and statistics</p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="card-interactive bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-teal-200/50">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 via-cyan-500 to-teal-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {getInitials(email)}
                </div>
                <button className="absolute bottom-0 right-0 bg-teal-600 text-white rounded-full p-2 shadow-md hover:bg-teal-700 transition-all duration-300 hover:scale-110" onClick={() => setIsEditing(true)}>
                  <FaEdit className="text-sm" />
                </button>
              </div>
              <div>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
                        First name
                        <input
                          type="text"
                          value={draftFirst}
                          onChange={(e) => setDraftFirst(e.target.value)}
                          className="rounded-lg border-2 border-teal-500 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter first name"
                          maxLength={40}
                          required
                        />
                      </label>
                      <label className="flex flex-col gap-1 text-sm font-medium text-gray-600">
                        Last name
                        <input
                          type="text"
                          value={draftLast}
                          onChange={(e) => setDraftLast(e.target.value)}
                          className="rounded-lg border-2 border-teal-500 px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter last name"
                          maxLength={40}
                          required
                        />
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        className="px-4 py-1 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-4 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {firstName || lastName ? `${firstName} ${lastName}`.trim() : preferredName}
                    </h3>
                    <p className="text-gray-600">{email}</p>
                  </>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="button-interactive button-gradient flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 text-white rounded-lg shadow-md transition-all duration-300"
            >
              {isEditing ? (
                <>
                  <FaTimes className="text-sm" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <FaEdit className="text-sm" />
                  <span>Edit Profile</span>
                </>
              )}
            </button>
          </div>

          {/* User Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="bg-teal-100 p-3 rounded-lg">
                <FaEnvelope className="text-teal-600 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{email || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FaChartLine className="mr-2 text-teal-600" />
            Your Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => (
              <div
                key={index}
                className="card-interactive bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-teal-200/50"
              >
                <div className={`w-16 h-16 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4 shadow-md`}>
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {loading ? '...' : stat.value}
                </p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

