import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setAuth } from '../store/authSlice'
import { authApi } from '../api/auth'
import { FaKey, FaArrowLeft, FaCheckCircle, FaEnvelope } from 'react-icons/fa'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export default function VerifyOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [resending, setResending] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const reduceMotion = usePrefersReducedMotion()
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  // Get email from location state (passed from registration)
  const email = location.state?.email || ''

  useEffect(() => {
    if (!email) {
      navigate('/login')
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

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await authApi.verifyOTP(email, otpString)
      
      // Store auth tokens
      dispatch(setAuth({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        userId: response.userId,
        email: response.email
      }))
      
      setSuccess(true)
      
      // Redirect to onboarding after a short delay
      setTimeout(() => {
        navigate('/onboarding')
      }, 2000)
    } catch (err: any) {
      let errorMessage = 'Invalid verification code'
      
      if (err.response?.data) {
        const data = err.response.data
        errorMessage = data.message || data.error || data.errorMessage || errorMessage
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      // Clear OTP on error
      setOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResending(true)
    setError('')
    
    try {
      await authApi.resendOTP(email)
      setError('')
      // Clear OTP fields and focus first input
      setOtp(['', '', '', '', '', ''])
      document.getElementById('otp-0')?.focus()
    } catch (err: any) {
      let errorMessage = 'Failed to resend code'
      
      if (err.response?.data) {
        const data = err.response.data
        errorMessage = data.message || data.error || data.errorMessage || errorMessage
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
    } finally {
      setResending(false)
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
              <div className={`absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 rounded-full blur-xl opacity-40 ${reduceMotion ? '' : 'animate-pulse-slow'}`} />
              
              {/* Icon Container */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <FaKey className="w-16 h-16 mx-auto relative z-10 text-teal-400" />
              </div>
            </div>
            
            <h2 className="text-center text-4xl font-extrabold text-white mb-2">
              Verify Your <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Email</span>
            </h2>
            <p className="mt-2 text-center text-sm text-slate-200">
              We've sent a 6-digit code to
            </p>
            <p className="text-center text-sm font-semibold text-teal-300 mt-1">
              {email}
            </p>
            <p className="mt-2 text-center text-xs text-amber-200/90 font-semibold tracking-wide uppercase">
              Didn’t get the email? Please check your spam or junk folder.
            </p>
          </div>

          {success ? (
            <div className="space-y-6">
              <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-6 py-4 rounded-xl backdrop-blur-sm text-center">
                <FaCheckCircle className="text-4xl mx-auto mb-3" />
                <p className="font-semibold mb-2">Email verified successfully!</p>
                <p className="text-sm">Redirecting to onboarding...</p>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleVerify} autoComplete="off">
              {error && (
                <div className={`bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl relative backdrop-blur-sm ${reduceMotion ? '' : 'animate-shake'}`}>
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-200 text-center">
                  Enter verification code
                </label>
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      name={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      pattern="[0-9]*"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-14 text-center text-2xl font-bold bg-white/10 border-2 border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-300/50 transition-all duration-300 backdrop-blur-sm"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || otp.join('').length !== 6}
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
                        Verifying...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="mr-2 h-5 w-5" />
                        Verify Email
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>
              </div>

              <div className="text-center space-y-3">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resending}
                  className="text-sm text-teal-400 hover:text-teal-300 transition-colors duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
                >
                  {resending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaEnvelope className="mr-2" />
                      Resend Code
                    </>
                  )}
                </button>
                <div>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-sm text-slate-300 hover:text-white transition-colors duration-150 ease-in-out flex items-center justify-center mx-auto"
                  >
                    <FaArrowLeft className="mr-2" />
                    Back to Login
                  </button>
                </div>
              </div>
            </form>
          )}
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

