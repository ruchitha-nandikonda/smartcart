import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export default function ForgotPassword() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const reduceMotion = usePrefersReducedMotion()
  const navigate = useNavigate()

  useEffect(() => {
    if (reduceMotion) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [reduceMotion])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmed = username.trim()
    if (!trimmed) {
      setError('Please enter your username')
      return
    }
    navigate('/reset-password', { state: { username: trimmed } })
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
                <FaEnvelope className="w-16 h-16 mx-auto relative z-10 text-teal-400" />
              </div>
            </div>
            
            <h2 className="text-center text-4xl font-extrabold text-white mb-2">
              Forgot <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">Password?</span>
            </h2>
            <p className="mt-2 text-center text-sm text-slate-200">
              Enter your username. On the next screen you can choose a new password.
            </p>
          </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className={`bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl relative backdrop-blur-sm ${reduceMotion ? '' : 'animate-shake'}`}>
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-200 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  required
                  autoComplete="username"
                  minLength={3}
                  maxLength={64}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-300/50 transition-all duration-300 backdrop-blur-sm"
                  placeholder="Your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 hover:from-teal-400 hover:via-cyan-400 hover:to-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 ease-in-out shadow-lg hover:shadow-teal-500/50 transform hover:scale-105 active:scale-95 overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10 flex items-center">
                    <>
                      <FaEnvelope className="mr-2 h-5 w-5" />
                      Continue
                    </>
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

