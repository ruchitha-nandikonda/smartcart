import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from './store/store'
import Introduction from './pages/Introduction'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyOTP from './pages/VerifyOTP'
import Onboarding from './pages/Onboarding'
import Layout from './components/Layout'
import DashboardIntro from './pages/DashboardIntro'
import Pantry from './pages/Pantry'
import Plan from './pages/Plan'
import Favorites from './pages/Favorites'
import List from './pages/List'
import Receipts from './pages/Receipts'
import ShoppingListHistory from './pages/ShoppingListHistory'
import Deals from './pages/Deals'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = useSelector((state: RootState) => state.auth.token)
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  return (
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
  )
}

export default App
