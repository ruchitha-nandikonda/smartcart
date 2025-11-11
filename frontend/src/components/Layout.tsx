import { useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { clearAuth } from '../store/authSlice'
import { authApi } from '../api/auth'
import type { IconType } from 'react-icons'
import {
  FaShoppingCart,
  FaHome,
  FaBoxOpen,
  FaUtensils,
  FaList,
  FaReceipt,
  FaHistory,
  FaTag,
  FaHeart,
  FaUser,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa'

export default function Layout({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    authApi.logout()
    dispatch(clearAuth())
    navigate('/login', { replace: true })
  }

  type NavItem = {
    path: string
    label: string
    icon: IconType
    description?: string
  }

  const primaryNav: NavItem[] = [
    { path: '/dashboard-intro', label: 'Overview', icon: FaHome, description: 'See highlights and quick actions' },
    { path: '/pantry', label: 'Pantry', icon: FaBoxOpen, description: 'Track what’s in stock' },
    { path: '/plan', label: 'Meal Plan', icon: FaUtensils, description: 'Plan upcoming meals' },
    { path: '/list', label: 'Shopping List', icon: FaList, description: 'Build smart grocery lists' },
    { path: '/favorites', label: 'Favorites', icon: FaHeart, description: 'Quick access to saved meals' },
    { path: '/deals', label: 'Deals', icon: FaTag, description: 'Find current offers' }
  ]

  const secondaryNav: NavItem[] = [
    { path: '/history', label: 'History', icon: FaHistory },
    { path: '/receipts', label: 'Receipts', icon: FaReceipt }
  ]

  const accountNav: NavItem[] = [
    { path: '/profile', label: 'Profile', icon: FaUser },
    { path: '/settings', label: 'Settings', icon: FaCog }
  ]

  const renderNavSection = (items: NavItem[], variant: 'primary' | 'secondary' | 'account') =>
    items.map((item) => {
      const Icon = item.icon
      const isActive = location.pathname.startsWith(item.path)
      return (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`layout-nav-button w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 relative overflow-hidden group ${
            isActive
              ? 'layout-nav-button--active bg-gradient-to-r from-teal-500/15 via-cyan-500/15 to-teal-500/15 border border-teal-300/40 text-teal-700 shadow-md shadow-teal-200/40'
              : 'text-slate-600 hover:text-teal-700 hover:bg-white/60 border border-transparent'
          } ${variant === 'secondary' ? 'text-sm' : 'text-base font-medium'}`}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-teal-300/0 via-cyan-300/20 to-teal-300/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
          <Icon className="relative z-10 text-xl group-hover:scale-110 transition-transform duration-300" />
          <div className="flex flex-col items-start relative z-10 text-left">
            <span>{item.label}</span>
            {'description' in item && item.description && (
              <span className="text-xs text-slate-500 font-normal leading-4">
                {item.description}
              </span>
            )}
          </div>
        </button>
      )
    })

  return (
    <div className="layout-shell min-h-screen bg-gradient-to-br from-slate-100 via-teal-50 to-cyan-50 relative overflow-hidden">
      <div className="layout-shell__wash absolute inset-0 bg-gradient-to-br from-teal-200/20 via-cyan-200/20 to-blue-200/20 animate-gradient-shift" />
      <div className="layout-shell__grid absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:40px_40px] opacity-20" />
      <div className="layout-shell__particles absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-teal-300/20 rounded-full animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        <aside className="layout-sidebar lg:w-72 w-full bg-white/70 backdrop-blur-xl border-b lg:border-b-0 lg:border-r border-white/60 shadow-xl flex flex-col">
          <div className="px-6 pt-6 pb-4 border-b border-white/60">
            <button
              onClick={() => navigate('/pantry')}
              className="flex items-center gap-3 group"
            >
              <div className="p-3 bg-gradient-to-br from-teal-500/80 to-cyan-500/80 rounded-2xl shadow-lg shadow-teal-200/50 group-hover:scale-105 transition-transform duration-300">
                <FaShoppingCart className="text-white text-2xl group-hover:rotate-6 transition-transform duration-300" />
              </div>
              <div className="text-left">
                <p className="text-xs uppercase tracking-wider text-slate-500">Dashboard</p>
                <h1 className="text-2xl font-extrabold bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
                  SmartCart
                </h1>
              </div>
            </button>
          </div>

          <div className="px-4 py-6 space-y-5 overflow-y-auto">
            <div>
              <p className="px-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">
                Main
              </p>
              <div className="space-y-3">
                {renderNavSection(primaryNav, 'primary')}
              </div>
            </div>

            <div>
              <p className="px-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 mb-3">
                Insights
              </p>
              <div className="space-y-3">
                {renderNavSection(secondaryNav, 'secondary')}
              </div>
            </div>
          </div>

          <div className="px-4 pt-3 pb-5 border-t border-white/60 space-y-2">
            <div className="space-y-3">
              {renderNavSection(accountNav, 'account')}
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-600 hover:text-red-600 hover:bg-red-50 border border-transparent transition-all duration-300"
            >
              <FaSignOutAlt className="text-lg" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </aside>

        <main className="layout-main flex-1 px-4 sm:px-6 lg:px-10 py-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
