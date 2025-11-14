import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { lazy, Suspense } from 'react'
import type { RootState } from './store/store'
import Layout from './components/Layout'

// Lazy load pages for better performance
const Introduction = lazy(() => import('./pages/Introduction'))
const Login = lazy(() => import('./pages/Login'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'))
const Onboarding = lazy(() => import('./pages/Onboarding'))
const DashboardIntro = lazy(() => import('./pages/DashboardIntro'))
const Pantry = lazy(() => import('./pages/Pantry'))
const Plan = lazy(() => import('./pages/Plan'))
const Favorites = lazy(() => import('./pages/Favorites'))
const List = lazy(() => import('./pages/List'))
const Receipts = lazy(() => import('./pages/Receipts'))
const ShoppingListHistory = lazy(() => import('./pages/ShoppingListHistory'))
const Deals = lazy(() => import('./pages/Deals'))
const Profile = lazy(() => import('./pages/Profile'))
const Settings = lazy(() => import('./pages/Settings'))

// Simple loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mb-4"></div>
      <p className="text-teal-700 font-medium">Loading...</p>
    </div>
  </div>
)

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useSelector((state: RootState) => state.auth.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
      <Route path="/" element={<Introduction />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route
        path="/dashboard-intro"
        element={
          <PrivateRoute>
            <Layout>
              <DashboardIntro />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/pantry"
        element={
          <PrivateRoute>
            <Layout>
              <Pantry />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/plan"
        element={
          <PrivateRoute>
            <Layout>
              <Plan />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <PrivateRoute>
            <Layout>
              <Favorites />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/list"
        element={
          <PrivateRoute>
            <Layout>
              <List />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/receipts"
        element={
          <PrivateRoute>
            <Layout>
              <Receipts />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/history"
        element={
          <PrivateRoute>
            <Layout>
              <ShoppingListHistory />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/deals"
        element={
          <PrivateRoute>
            <Layout>
              <Deals />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Layout>
              <Profile />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <Layout>
              <Settings />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
