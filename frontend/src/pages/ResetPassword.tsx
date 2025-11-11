import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authApi } from '../api/auth'
import { FaArrowLeft, FaCheckCircle, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export default function ResetPassword() {
  const reduceMotion = usePrefersReducedMotion()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const navigate = useNavigate()
  const location = useLocation()

  const email = location.state?.email || ''

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password')
    }
  }, [email, navigate])

  useEffect(() => {
    if (reduceMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [reduceMotion])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit
    
    const newOtp = [...otp]
    newOtp[index] = value.replace(/[^0-9]/g, '') // Only allow numbers
    
    setOtp(newOtp)
    setError('')

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6)
    const newOtp = [...otp]
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pastedData[i] || ''
    }
    setOtp(newOtp)
    if (pastedData.length === 6) {
      document.getElementById('otp-5')?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setError('')
    setLoading(true)

    try {
      await authApi.resetPassword(email, otpString, newPassword)
      setSuccess(true)
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/login', { state: { message: 'Password reset successful! Please login with your new password.' } })
      }, 2000)
    } catch (err: any) {
      let errorMessage = 'Failed to reset password'
      
      if (err.response?.data) {
        const data = err.response.data
        errorMessage = data.message || data.error || data.errorMessage || errorMessage
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
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
        <div className={`max-w-md w-full bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-8 border border-white/10 ${reduceMotion ? '' : 'animate-slideDown'}`}>
          {/* Header */}
          <div className="flex flex-col items-center">
            <div className="relative group mb-4">
              {/* Glowing Ring */}
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 rounded-full blur-xl opacity-40 animate-pulse-slow" />
              
              {/* Icon Container */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <FaLock className="w-16 h-16 mx-auto relative z-10 text-teal-400" />
              </div>
            </div>
            
            <h2 className="text-center text-4xl font-extrabold text-white mb-2">
              Reset Your <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Password</span>
            </h2>
            <p className="mt-2 text-center text-sm text-slate-200">
              Enter the code sent to
            </p>
            <p className="text-center text-sm font-semibold text-teal-300 mt-1">
              {email}
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-6 py-4 rounded-xl backdrop-blur-sm text-center">
                <FaCheckCircle className="text-4xl mx-auto mb-3" />
                <p className="font-semibold mb-2">Password reset successful!</p>
                <p className="text-sm">Redirecting to login...</p>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl relative animate-shake backdrop-blur-sm">
                  <p className="font-semibold mb-1">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-3">
                  Enter verification code
                </label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-14 text-center text-2xl font-bold bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-300/50 transition-all duration-300 backdrop-blur-sm"
                      autoComplete="off"
                    />
                  ))}
                </div>
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-200 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-300/50 transition-all duration-300 backdrop-blur-sm"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-teal-400 transition-colors"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-300/50 transition-all duration-300 backdrop-blur-sm"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-teal-400 transition-colors"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 hover:from-teal-400 hover:via-cyan-400 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 ease-in-out shadow-lg hover:shadow-teal-500/50 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center">
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Resetting...
                      </>
                    ) : (
                      <>
                        <FaLock className="mr-2 h-5 w-5" />
                        Reset Password
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="font-medium text-teal-400 hover:text-teal-300 transition-colors duration-150 ease-in-out flex items-center justify-center"
                >
                  <FaArrowLeft className="mr-2" />
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

