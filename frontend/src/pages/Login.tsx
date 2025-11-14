import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setAuth } from '../store/authSlice'
import { authApi } from '../api/auth'
import { FaUserPlus, FaSignInAlt } from 'react-icons/fa'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const REMEMBER_ME_EMAIL_KEY = 'smartcart_remembered_email'
const REMEMBER_ME_ENABLED_KEY = 'smartcart_remember_me'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const reduceMotion = usePrefersReducedMotion()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    if (reduceMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [reduceMotion])

  const createRipple = (e: React.MouseEvent<HTMLElement>) => {
    if (reduceMotion) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const newRipple = { x, y, id: Date.now() }
    setRipples(prev => [...prev, newRipple])
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id))
    }, 600)
  }

  // Load saved email on component mount
  useEffect(() => {
    const savedRememberMe = localStorage.getItem(REMEMBER_ME_ENABLED_KEY) === 'true'
    if (savedRememberMe) {
      const savedEmail = localStorage.getItem(REMEMBER_ME_EMAIL_KEY)
      if (savedEmail) {
        setEmail(savedEmail)
        setRememberMe(true)
      }
    }

    const storedFirst = localStorage.getItem('customerFirstName')
    const storedLast = localStorage.getItem('customerLastName')
    if (storedFirst) setFirstName(storedFirst)
    if (storedLast) setLastName(storedLast)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        const response = await authApi.login({ email, password })

        // Save email if "Remember Me" is checked
        if (rememberMe) {
          localStorage.setItem(REMEMBER_ME_EMAIL_KEY, email)
          localStorage.setItem(REMEMBER_ME_ENABLED_KEY, 'true')
        } else {
          // Clear saved email if "Remember Me" is unchecked
          localStorage.removeItem(REMEMBER_ME_EMAIL_KEY)
          localStorage.removeItem(REMEMBER_ME_ENABLED_KEY)
        }

        dispatch(setAuth({ 
          accessToken: response.accessToken, 
          refreshToken: response.refreshToken,
          userId: response.userId, 
          email: response.email 
        }))
        
        navigate('/dashboard-intro')
      } else {
        const trimmedFirst = firstName.trim()
        const trimmedLast = lastName.trim()
        if (!trimmedFirst || !trimmedLast) {
          setError('Please enter your first and last name to continue')
          setLoading(false)
          return
        }
        localStorage.setItem('customerFirstName', trimmedFirst)
        localStorage.setItem('customerLastName', trimmedLast)
        // Registration - send OTP
        await authApi.register({ email, password })
        
        // Navigate to OTP verification page with email only
        navigate('/verify-otp', { state: { email } })
      }
    } catch (err: any) {
      // Handle error response - try multiple extraction methods
      let errorMessage = isLogin ? 'Authentication failed' : 'Registration failed'
      
      if (err.response?.data) {
        const data = err.response.data
        errorMessage = data.message || data.error || data.errorMessage || errorMessage
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      console.group('🔴 Login Error Details')
      console.log('Error Message:', errorMessage)
      console.log('Full Error:', err)
      console.log('Error Response:', err.response)
      console.log('Error Response Data:', err.response?.data)
      console.log('Error Response Data (JSON):', JSON.stringify(err.response?.data, null, 2))
      console.groupEnd()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-700 via-teal-700 to-cyan-700 relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br from-teal-600/40 via-cyan-600/40 to-blue-600/40 ${reduceMotion ? '' : 'animate-gradient-shift'}`} />
      
      {/* Subtle Mouse Follow Effect */}
      {!reduceMotion && (
        <div
          className="fixed w-[500px] h-[500px] bg-gradient-to-r from-teal-300/15 to-cyan-300/15 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ease-out z-0"
          style={{
            left: `${mousePosition.x - 250}px`,
            top: `${mousePosition.y - 250}px`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}

      {/* Animated Grid Pattern */}
      <div className={`absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] opacity-50 ${reduceMotion ? '' : 'animate-pulse-slow'}`} />

      {/* Floating Particles */}
      {!reduceMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-teal-300/40 rounded-full animate-float-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Animated Orbs */}
      {!reduceMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full blur-3xl animate-orb-float"
              style={{
                width: `${150 + i * 100}px`,
                height: `${150 + i * 100}px`,
                background: `radial-gradient(circle, rgba(20, 184, 166, ${0.15 + i * 0.1}), transparent)`,
                left: `${30 + i * 40}%`,
                top: `${20 + i * 30}%`,
                animationDelay: `${i * 2}s`,
                animationDuration: `${12 + i * 3}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className={`max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-4 items-center ${reduceMotion ? '' : 'animate-slideDown'}`}>
          {/* Logo Section */}
          <div className="flex flex-col items-center">
            <div className="relative group mb-8">
              {/* Glowing Ring */}
              <div className={`absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 rounded-full blur-xl opacity-40 ${reduceMotion ? '' : 'animate-pulse-slow'}`} />
              
              {/* Logo Container */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Custom Shopping Cart Logo */}
                <svg viewBox="0 0 120 120" className="w-16 h-16 mx-auto relative z-10">
                  <defs>
                    <linearGradient id="loginCartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#14b8a6" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#14b8a6" />
                    </linearGradient>
                  </defs>
                  {/* Cart Body */}
                  <path d="M 30 40 L 30 90 L 90 90 L 90 40 Z" fill="url(#loginCartGrad)" opacity="0.2" />
                  <path d="M 35 45 L 35 85 L 85 85 L 85 45 Z" fill="url(#loginCartGrad)" />
                  {/* Cart Handle */}
                  <path d="M 35 45 Q 35 30 50 30 Q 65 30 65 45" stroke="url(#loginCartGrad)" strokeWidth="4" fill="none" />
                  {/* Cart Wheels */}
                  <circle cx="45" cy="90" r="6" fill="url(#loginCartGrad)" />
                  <circle cx="75" cy="90" r="6" fill="url(#loginCartGrad)" />
                  {/* Items in Cart */}
                  <circle cx="50" cy="60" r="5" fill="white" opacity="0.9" />
                  <circle cx="70" cy="60" r="5" fill="white" opacity="0.9" />
                  <rect x="55" y="70" width="10" height="8" rx="2" fill="white" opacity="0.8" />
                </svg>
              </div>
            </div>
            
            <h2 className="text-center text-4xl font-extrabold text-white mb-2">
              {isLogin ? (
                <>
                  Welcome <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Back!</span>
                </>
              ) : (
                <>
                  Join <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">SmartCart</span>
                </>
              )}
            </h2>
            <p className="mt-2 text-center text-sm text-slate-200">
              {isLogin ? 'Sign in to manage your groceries' : 'Create an account to get started'}
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className={`bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl relative backdrop-blur-sm ${reduceMotion ? '' : 'animate-shake'}`}>
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              {!isLogin && (
      <>
        <p className="text-sm text-slate-200">
          Tell us your first and last name so we can personalize your dashboard.
        </p>
        <p className="mt-2 text-xs text-amber-200/90 font-semibold tracking-wide uppercase">
          Didn’t get the verification email? Please check your spam or junk folder.
        </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <label htmlFor="signup-first-name" className="text-xs uppercase tracking-wide text-slate-200/80">
                        First name
                      </label>
                      <input
                        id="signup-first-name"
                        type="text"
                        required
                        autoComplete="given-name"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-300/50 transition-all duration-300 backdrop-blur-sm"
                        placeholder="e.g., Alex"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="signup-last-name" className="text-xs uppercase tracking-wide text-slate-200/80">
                        Last name
                      </label>
                      <input
                        id="signup-last-name"
                        type="text"
                        required
                        autoComplete="family-name"
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-300/50 transition-all duration-300 backdrop-blur-sm"
                        placeholder="e.g., Morgan"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
              <div>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-300/50 transition-all duration-300 backdrop-blur-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-300/50 transition-all duration-300 backdrop-blur-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-teal-500 focus:ring-teal-500 border-white/20 rounded bg-white/5"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-200 cursor-pointer hover:text-white transition-colors">
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-teal-400 hover:text-teal-300 transition-colors duration-150 ease-in-out"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                onClick={createRipple}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 hover:from-teal-400 hover:via-cyan-400 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 ease-in-out shadow-lg hover:shadow-teal-500/50 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              >
                {/* Ripple Effects */}
                {ripples.map(ripple => (
                  <span
                    key={ripple.id}
                    className="absolute rounded-full bg-white/30 animate-ripple"
                    style={{
                      left: ripple.x,
                      top: ripple.y,
                      width: '20px',
                      height: '20px',
                      transform: 'translate(-50%, -50%)'
                    }}
                  />
                ))}
                <span className="absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </>
                  ) : isLogin ? (
                    <>
                      <FaSignInAlt className="mr-2 h-5 w-5" />
                      Sign In
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="mr-2 h-5 w-5" />
                      Sign Up
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-teal-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                  setLoading(false)
                }}
                className="font-medium text-teal-400 hover:text-teal-300 transition-colors duration-150 ease-in-out"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes float-particle {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-30px) translateX(20px);
            opacity: 0.4;
          }
        }
        .animate-float-particle {
          animation: float-particle linear infinite;
        }
        
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 15s ease infinite;
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.6;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(20);
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 0.6s ease-out;
        }
        
        @keyframes orb-float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }
        .animate-orb-float {
          animation: orb-float linear infinite;
        }
      `}</style>
    </div>
  )
}
