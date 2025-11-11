import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaShoppingCart, FaReceipt, FaChartLine, FaTags, FaUtensils, FaArrowRight, FaStar, FaCheckCircle, FaBolt, FaMagic, FaCamera, FaSearch } from 'react-icons/fa'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export default function Introduction() {
  const navigate = useNavigate()
  const reduceMotion = usePrefersReducedMotion()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    if (reduceMotion) {
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
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

  // Custom Logo Components
  const ReceiptLogo = ({ className }: { className?: string }) => (
    <div className={className}>
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <defs>
          <linearGradient id="receiptGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>
        </defs>
        <rect x="20" y="15" width="80" height="90" rx="4" fill="url(#receiptGrad)" opacity="0.2" />
        <rect x="25" y="20" width="70" height="80" rx="2" fill="url(#receiptGrad)" />
        <line x1="35" y1="35" x2="85" y2="35" stroke="white" strokeWidth="2" />
        <line x1="35" y1="50" x2="75" y2="50" stroke="white" strokeWidth="2" opacity="0.8" />
        <line x1="35" y1="65" x2="80" y2="65" stroke="white" strokeWidth="2" opacity="0.6" />
        <circle cx="90" cy="30" r="8" fill="white" opacity="0.3" />
        <path d="M 88 30 L 90 32 L 92 30" stroke="url(#receiptGrad)" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  )

  const MealLogo = ({ className }: { className?: string }) => (
    <div className={className}>
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <defs>
          <linearGradient id="mealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="40" r="25" fill="url(#mealGrad)" opacity="0.2" />
        <path d="M 40 60 Q 60 50 80 60 Q 60 70 40 60" fill="url(#mealGrad)" />
        <rect x="55" y="60" width="10" height="35" rx="2" fill="url(#mealGrad)" />
        <rect x="50" y="90" width="20" height="8" rx="4" fill="url(#mealGrad)" />
        <circle cx="50" cy="45" r="4" fill="white" opacity="0.8" />
        <circle cx="70" cy="45" r="4" fill="white" opacity="0.8" />
      </svg>
    </div>
  )

  const OptimizationLogo = ({ className }: { className?: string }) => (
    <div className={className}>
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <defs>
          <linearGradient id="optGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <path d="M 30 90 L 60 30 L 90 90 Z" fill="url(#optGrad)" opacity="0.2" />
        <path d="M 35 85 L 60 35 L 85 85 Z" fill="url(#optGrad)" />
        <circle cx="45" cy="70" r="5" fill="white" />
        <circle cx="60" cy="55" r="5" fill="white" />
        <circle cx="75" cy="70" r="5" fill="white" />
        <line x1="45" y1="70" x2="60" y2="55" stroke="white" strokeWidth="2" />
        <line x1="60" y1="55" x2="75" y2="70" stroke="white" strokeWidth="2" />
        <circle cx="60" cy="30" r="8" fill="url(#optGrad)" />
        <circle cx="60" cy="30" r="4" fill="white" />
      </svg>
    </div>
  )

  const DealLogo = ({ className }: { className?: string }) => (
    <div className={className}>
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <defs>
          <linearGradient id="dealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <rect x="25" y="25" width="70" height="50" rx="8" fill="url(#dealGrad)" opacity="0.2" />
        <rect x="30" y="30" width="60" height="40" rx="6" fill="url(#dealGrad)" />
        <text x="60" y="55" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">%</text>
        <circle cx="40" cy="20" r="12" fill="url(#dealGrad)" />
        <text x="40" y="25" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">$</text>
        <path d="M 50 80 L 70 80 L 60 95 Z" fill="url(#dealGrad)" />
        <line x1="60" y1="95" x2="60" y2="110" stroke="url(#dealGrad)" strokeWidth="3" />
      </svg>
    </div>
  )

  const features = [
    {
      icon: <FaReceipt className="text-4xl" />,
      logo: <ReceiptLogo />,
      title: 'Smart Receipt Scanning',
      description: 'Upload receipts and automatically add items to your pantry',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      iconBg: 'bg-emerald-500/20',
      color: '#10b981'
    },
    {
      icon: <FaUtensils className="text-4xl" />,
      logo: <MealLogo />,
      title: 'Meal Planning',
      description: 'Plan meals and automatically generate shopping lists',
      gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
      iconBg: 'bg-cyan-500/20',
      color: '#06b6d4'
    },
    {
      icon: <FaChartLine className="text-4xl" />,
      logo: <OptimizationLogo />,
      title: 'Smart Optimization',
      description: 'Get optimized shopping lists based on deals and your pantry',
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      iconBg: 'bg-violet-500/20',
      color: '#8b5cf6'
    },
    {
      icon: <FaTags className="text-4xl" />,
      logo: <DealLogo />,
      title: 'Deal Tracking',
      description: 'Find the best deals across multiple stores',
      gradient: 'from-rose-500 via-pink-500 to-rose-500',
      iconBg: 'bg-rose-500/20',
      color: '#f43f5e'
    }
  ]

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
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-teal-300/40 rounded-full animate-float-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 4}s`,
                transform: `translateY(${scrollY * 0.1}px)`
              }}
            />
          ))}
        </div>
      )}

      {/* Animated Orbs */}
      {!reduceMotion && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full blur-3xl animate-orb-float"
              style={{
                width: `${200 + i * 100}px`,
                height: `${200 + i * 100}px`,
                background: `radial-gradient(circle, rgba(20, 184, 166, ${0.2 + i * 0.1}), transparent)`,
                left: `${20 + i * 30}%`,
                top: `${10 + i * 20}%`,
                animationDelay: `${i * 2}s`,
                animationDuration: `${15 + i * 5}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className={`text-center mb-20 transition-all duration-1000 ${reduceMotion ? 'opacity-100 translate-y-0' : isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Enhanced Logo Section */}
          <div className="flex justify-center mb-8">
            <div 
              className="relative group cursor-pointer"
              onClick={() => navigate('/login')}
            >
              {/* Multiple Glowing Rings */}
              <div className={`absolute inset-0 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 rounded-full blur-2xl opacity-40 group-hover:opacity-60 ${reduceMotion ? '' : 'animate-pulse-slow'}`} />
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 -inset-4" />
              
              {/* Main Logo Container */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-10 shadow-2xl transform hover:scale-110 hover:rotate-3 transition-all duration-500 border border-white/20 group-hover:border-teal-400/50">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Custom Shopping Cart Logo */}
                <div className="relative z-10">
                  <svg viewBox="0 0 120 120" className="w-24 h-24 mx-auto">
                    <defs>
                      <linearGradient id="cartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#14b8a6" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#14b8a6" />
                      </linearGradient>
                    </defs>
                    {/* Cart Body */}
                    <path d="M 30 40 L 30 90 L 90 90 L 90 40 Z" fill="url(#cartGrad)" opacity="0.2" />
                    <path d="M 35 45 L 35 85 L 85 85 L 85 45 Z" fill="url(#cartGrad)" />
                    {/* Cart Handle */}
                    <path d="M 35 45 Q 35 30 50 30 Q 65 30 65 45" stroke="url(#cartGrad)" strokeWidth="4" fill="none" />
                    {/* Cart Wheels */}
                    <circle cx="45" cy="90" r="6" fill="url(#cartGrad)" />
                    <circle cx="75" cy="90" r="6" fill="url(#cartGrad)" />
                    {/* Items in Cart */}
                    <circle cx="50" cy="60" r="5" fill="white" opacity="0.9" />
                    <circle cx="70" cy="60" r="5" fill="white" opacity="0.9" />
                    <rect x="55" y="70" width="10" height="8" rx="2" fill="white" opacity="0.8" />
                  </svg>
                </div>
                
                {/* Decorative Elements */}
                <div className={`absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 ${reduceMotion ? '' : 'animate-bounce'}`}>
                  <FaStar className="text-yellow-400 text-xl drop-shadow-lg" />
                </div>
                <div className="absolute -bottom-2 -left-2 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100">
                  <FaBolt className="text-cyan-400 text-lg" />
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className={`text-6xl md:text-8xl font-extrabold text-white mb-6 drop-shadow-2xl ${reduceMotion ? '' : 'animate-slideDown'}`}>
            Welcome to{' '}
            <span className="relative inline-block">
              <span className={`bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent ${reduceMotion ? '' : 'animate-gradient-text'}`}>
                SmartCart
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 rounded-full opacity-50" />
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-200 mb-10 max-w-3xl mx-auto leading-relaxed">
            Your intelligent grocery shopping companion. Plan meals, track your pantry, and save money with smart deal optimization.
          </p>

          {/* CTA Button with Ripple Effect */}
          <button
            onClick={(e) => {
              createRipple(e)
              navigate('/login')
            }}
            className="group relative bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 text-white px-12 py-5 rounded-2xl text-lg font-semibold shadow-2xl hover:shadow-teal-500/50 transform hover:scale-110 hover:-translate-y-2 active:scale-95 transition-all duration-300 overflow-hidden"
          >
            {/* Ripple Effects */}
            {ripples.map(ripple => (
              <span
                key={ripple.id}
                className={`absolute rounded-full bg-white/30 ${reduceMotion ? '' : 'animate-ripple'}`}
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
              Get Started
              <FaArrowRight className="ml-3 group-hover:translate-x-2 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-teal-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>

        {/* Features Section with Custom Logos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-24">
          {features.map((feature, index) => (
            <div
              key={index}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
              className={`group relative bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 transform transition-all duration-500 cursor-pointer overflow-hidden ${reduceMotion ? '' : 'animate-glow-pulse'} ${
                hoveredFeature === index 
                  ? 'scale-110 shadow-2xl shadow-teal-500/30 border-teal-400/50 z-20' 
                  : 'hover:scale-105 hover:border-white/20'
              }`}
            >
              {/* Animated Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <div className="relative z-10">
                {/* Custom Logo Container */}
                <div className="flex items-center justify-center mb-4">
                  <div className={`${feature.iconBg} rounded-2xl p-5 transform group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 relative w-24 h-24 flex items-center justify-center`}>
                    {/* Custom SVG Logo */}
                    <div className="w-full h-full transform group-hover:scale-110 transition-transform duration-300">
                      {feature.logo}
                    </div>
                    {/* Glow Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500`} />
                  </div>
                </div>
                
                {/* Icon Badge */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`bg-gradient-to-br ${feature.gradient} rounded-full p-2 shadow-lg`}>
                    {feature.icon}
                  </div>
                </div>
                
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-teal-200 transition-colors duration-300 flex items-center justify-center gap-2">
                  {feature.title}
                  {hoveredFeature === index && (
                    <FaCheckCircle className={`text-teal-300 ${reduceMotion ? '' : 'animate-scale-in'}`} />
                  )}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                  {feature.description}
                </p>
              </div>

              {/* Corner Accent */}
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500`} />
            </div>
          ))}
        </div>

        {/* How It Works Section */}
        <div className="mt-24 bg-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-500 relative overflow-hidden group">
          {/* Background Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white text-center mb-12 bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { num: '1', title: 'Sign Up', desc: 'Create your account and set up your preferences', icon: <FaShoppingCart /> },
                { num: '2', title: 'Add Your Pantry', desc: 'Scan receipts or manually add items to track what you have', icon: <FaCamera /> },
                { num: '3', title: 'Plan & Shop', desc: 'Plan meals and get optimized shopping lists with the best deals', icon: <FaSearch /> }
              ].map((step, index) => (
                <div 
                  key={index}
                  className="text-center transform hover:scale-110 transition-all duration-300 group/item"
                >
                  <div className="relative inline-block mb-4">
                    <div className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full w-20 h-20 flex items-center justify-center text-white shadow-xl group-hover/item:shadow-teal-500/50 group-hover/item:scale-110 transition-all duration-300 relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-cyan-400 rounded-full opacity-0 group-hover/item:opacity-50 blur-xl transition-opacity duration-300" />
                      <div className="relative z-10 flex items-center gap-2">
                        <span className="text-xl">{step.icon}</span>
                        <span className="text-2xl font-bold">{step.num}</span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover/item:text-teal-200 transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-slate-300 group-hover/item:text-slate-200 transition-colors duration-300">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="text-center mt-20">
          <button
            onClick={(e) => {
              createRipple(e)
              navigate('/login')
            }}
            className="group relative bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 text-white px-14 py-6 rounded-2xl text-xl font-bold shadow-2xl hover:shadow-teal-500/50 transform hover:scale-110 hover:-translate-y-2 active:scale-95 transition-all duration-300 overflow-hidden"
          >
            {/* Ripple Effects */}
            {ripples.map(ripple => (
              <span
                key={ripple.id}
                className={`absolute rounded-full bg-white/30 ${reduceMotion ? '' : 'animate-ripple'}`}
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
              <FaMagic className="mr-3 group-hover:rotate-180 transition-transform duration-500" />
              Start Shopping Smarter
              <FaArrowRight className="ml-3 group-hover:translate-x-2 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-teal-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-10 text-slate-300 relative z-10">
        <p className="text-lg">© 2024 SmartCart. Making grocery shopping smarter, one list at a time.</p>
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
        
        @keyframes gradient-text {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-text {
          background-size: 200% 200%;
          animation: gradient-text 3s ease infinite;
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
        
        @keyframes scale-in {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
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
        
        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(20, 184, 166, 0.3);
          }
          50% {
            box-shadow: 0 0 40px rgba(20, 184, 166, 0.6);
          }
        }
        .animate-glow-pulse {
          animation: glow-pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
