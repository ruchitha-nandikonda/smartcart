import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { FaCog, FaShieldAlt, FaBell, FaEnvelope, FaKey, FaDownload, FaExclamationTriangle } from 'react-icons/fa'
import { authApi } from '../api/auth'
import { clearAuth } from '../store/authSlice'
import type { RootState } from '../store/store'
import { pantryApi } from '../api/pantry'
import { favoritesApi } from '../api/favorites'
import { shoppingListsApi } from '../api/shoppingLists'
import { receiptsApi } from '../api/receipts'

const STORAGE_KEYS = {
  emailNotifications: 'settings.emailNotifications',
  expiringItems: 'settings.expiringItems',
  newDeals: 'settings.newDeals',
  theme: 'settings.theme',
}

export default function Settings() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { email } = useSelector((state: RootState) => state.auth)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [expiringItems, setExpiringItems] = useState(true)
  const [newDeals, setNewDeals] = useState(true)
  const [theme, setTheme] = useState<'Light' | 'Dark' | 'Auto'>('Light')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [statusIsError, setStatusIsError] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [preferencesLoaded, setPreferencesLoaded] = useState(false)

  const notify = (message: string, isError = false) => {
    setStatusMessage(message)
    setStatusIsError(isError)
  }

  useEffect(() => {
    const storedEmailNotifications = localStorage.getItem(STORAGE_KEYS.emailNotifications)
    if (storedEmailNotifications !== null) {
      setEmailNotifications(storedEmailNotifications === 'true')
    }
    const storedExpiringItems = localStorage.getItem(STORAGE_KEYS.expiringItems)
    if (storedExpiringItems !== null) {
      setExpiringItems(storedExpiringItems === 'true')
    }
    const storedNewDeals = localStorage.getItem(STORAGE_KEYS.newDeals)
    if (storedNewDeals !== null) {
      setNewDeals(storedNewDeals === 'true')
    }
    const storedTheme = localStorage.getItem(STORAGE_KEYS.theme)
    if (storedTheme === 'Dark' || storedTheme === 'Auto' || storedTheme === 'Light') {
      setTheme(storedTheme)
    }
    setPreferencesLoaded(true)
  }, [])

  useEffect(() => {
    if (!preferencesLoaded) return
    if (theme === 'Auto') {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem(STORAGE_KEYS.theme, 'Auto')
      notify('Theme set to Auto (system)', false)
      return
    }
    document.documentElement.setAttribute('data-theme', theme.toLowerCase())
    localStorage.setItem(STORAGE_KEYS.theme, theme)
    notify(`Theme set to ${theme}`, false)
  }, [theme, preferencesLoaded])

  useEffect(() => {
    if (!statusMessage) return
    const timer = setTimeout(() => setStatusMessage(''), 3200)
    return () => clearTimeout(timer)
  }, [statusMessage])

  const persistBoolean = (key: string, value: boolean, setter: (val: boolean) => void, label: string) => {
    setter(value)
    if (!preferencesLoaded) return
    localStorage.setItem(key, value ? 'true' : 'false')
    notify(`${label} ${value ? 'enabled' : 'disabled'}`)
  }

  const handleExportData = async () => {
    try {
      setExporting(true)
      const [pantryItems, favorites, shoppingLists, receipts] = await Promise.all([
        pantryApi.getAll().catch(() => []),
        favoritesApi.getAll().catch(() => []),
        shoppingListsApi.getAll().catch(() => []),
        receiptsApi.getAll().catch(() => [])
      ])

      const exportPayload = {
        exportedAt: new Date().toISOString(),
        account: email,
        preferences: {
          emailNotifications,
          expiringItems,
          newDeals,
          theme,
        },
        pantry: pantryItems,
        favourites: favorites,
        shoppingLists,
        receipts,
      }

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `smartcart-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      notify('Export ready – check your downloads')
    } catch (error) {
      console.error('Failed to export data', error)
      notify('Failed to export data. Please try again.', true)
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone. All your data will be permanently deleted.')
    if (!confirmed) {
      return
    }
    
    setIsDeleting(true)
    setDeleteError('')
    
    try {
      await authApi.deleteAccount()
      // Logout and redirect to login
      dispatch(clearAuth())
      navigate('/login', { state: { message: 'Your account has been successfully deleted.' } })
    } catch (error: any) {
      console.error('Error deleting account:', error)
      setDeleteError(error.response?.data?.message || error.message || 'Failed to delete account. Please try again.')
      setIsDeleting(false)
    }
  }

  const themeOptions = useMemo(() => ['Light', 'Dark', 'Auto'], [])

  return (
    <div className="container mx-auto p-4">
      {statusMessage && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 shadow-lg text-sm font-semibold ${statusIsError ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {statusMessage}
        </div>
      )}
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 flex items-center">
          <FaCog className="mr-3 text-teal-600" />
          Settings
        </h2>
        <p className="mt-2 text-gray-700">Manage your account preferences and security</p>
      </div>

      <div className="space-y-6">
        {/* Account Settings */}
        <div className="card-interactive bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-teal-200/50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FaCog className="mr-2 text-teal-600" />
            Account Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="bg-teal-100 p-3 rounded-lg">
                  <FaKey className="text-teal-600 text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Change Password</p>
                  <p className="text-sm text-gray-600">Update your account password for better security</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/reset-password', { state: { email } })}
                className="button-interactive px-4 py-2 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 text-white rounded-lg shadow-md transition-all duration-300 hover:from-teal-600 hover:via-cyan-600 hover:to-teal-600"
              >
                Change
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="bg-cyan-100 p-3 rounded-lg">
                  <FaEnvelope className="text-cyan-600 text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-600">Receive email updates about your account</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={emailNotifications}
                  onChange={(e) => persistBoolean(STORAGE_KEYS.emailNotifications, e.target.checked, setEmailNotifications, 'Email notifications')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="card-interactive bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-teal-200/50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FaShieldAlt className="mr-2 text-teal-600" />
            Privacy & Security
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FaDownload className="text-blue-600 text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Data Export</p>
                  <p className="text-sm text-gray-600">Download all your data in a portable format</p>
                </div>
              </div>
              <button 
                onClick={handleExportData}
                disabled={exporting}
                className={`button-interactive px-4 py-2 rounded-lg shadow-md transition-all duration-300 ${exporting ? 'bg-gray-400 text-white cursor-progress' : 'bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 text-white hover:from-teal-600 hover:via-cyan-600 hover:to-teal-600'}`}
              >
                {exporting ? 'Preparing…' : 'Export'}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200/70 hover:bg-red-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="bg-red-100/70 p-3 rounded-lg">
                  <FaExclamationTriangle className="text-red-600 text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Delete Account</p>
                  <p className="text-sm text-gray-600">Permanently delete your account and all data</p>
                  {deleteError && (
                    <p className="text-sm text-red-600 mt-1">{deleteError}</p>
                  )}
                </div>
              </div>
              <button 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className={`px-4 py-2 rounded-lg border border-red-500 text-red-600 transition-colors shadow-md ${
                  isDeleting 
                    ? 'opacity-50 cursor-not-allowed bg-white' 
                    : 'bg-white hover:bg-red-50'
                }`}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card-interactive bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-teal-200/50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FaBell className="mr-2 text-teal-600" />
            Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <FaExclamationTriangle className="text-orange-600 text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Expiring Items</p>
                  <p className="text-sm text-gray-600">Get notified about pantry items that are expiring soon</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={expiringItems}
                  onChange={(e) => persistBoolean(STORAGE_KEYS.expiringItems, e.target.checked, setExpiringItems, 'Expiring item alerts')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FaBell className="text-green-600 text-xl" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">New Deals</p>
                  <p className="text-sm text-gray-600">Receive notifications about new deals and discounts</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={newDeals}
                  onChange={(e) => persistBoolean(STORAGE_KEYS.newDeals, e.target.checked, setNewDeals, 'Deal notifications')}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* App Preferences */}
        <div className="card-interactive bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-teal-200/50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <FaCog className="mr-2 text-teal-600" />
            App Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">Theme</p>
                <p className="text-sm text-gray-600">Choose your preferred color theme</p>
              </div>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'Light' | 'Dark' | 'Auto')}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                {themeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}

