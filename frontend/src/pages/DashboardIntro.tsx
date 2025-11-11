import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../store/store'
import {
  FaBolt,
  FaBoxOpen,
  FaUtensils,
  FaList,
  FaHeart,
  FaTag,
  FaLeaf,
  FaUser
} from 'react-icons/fa'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { pantryApi, type PantryItem } from '../api/pantry'
import { favoritesApi } from '../api/favorites'
import { shoppingListsApi, type ShoppingListHistory } from '../api/shoppingLists'
import { receiptsApi, type Receipt } from '../api/receipts'

type PulseCard = {
  label: string
  value: string
  status: string
  detail: string
  accent: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
}

type ActionCard = {
  label: string
  tagline: string
  description: string
  statLabel: string
  statValue: string
  icon: React.ComponentType<{ className?: string }>
  path: string
  color: string
  gradientText: string
}

type Season = 'winter' | 'spring' | 'summer' | 'autumn'

type SeasonalSpotlight = {
  id: string
  title: string
  description: string
  chips: string[]
  mealId: string
  cta: string
  seasons: Season[]
}

type HighlightMetric = {
  label: string
  value: number
  prefix?: string
  suffix?: string
  tone: string
  icon: React.ComponentType<{ className?: string }>
}

const initialPulseCards: PulseCard[] = [
  {
    label: 'Stock health',
    value: '--',
    status: 'Checking pantry…',
    detail: 'Add your first items to see insights',
    accent: 'from-emerald-100 via-emerald-50 to-white',
    icon: FaBoxOpen,
    iconColor: 'text-emerald-500'
  },
  {
    label: 'Meal momentum',
    value: '--',
    status: 'Loading plans…',
    detail: 'Meal planner is warming up',
    accent: 'from-purple-100 via-pink-50 to-white',
    icon: FaUtensils,
    iconColor: 'text-purple-500'
  },
  {
    label: 'Favourites ready',
    value: '--',
    status: 'Getting favourites…',
    detail: 'Save meals to reuse them faster',
    accent: 'from-rose-100 via-orange-50 to-white',
    icon: FaHeart,
    iconColor: 'text-rose-500'
  },
  {
    label: 'Savings watch',
    value: '--',
    status: 'Crunching receipts…',
    detail: 'Scan a receipt to unlock tips',
    accent: 'from-sky-100 via-cyan-50 to-white',
    icon: FaTag,
    iconColor: 'text-sky-500'
  }
]

const quickActions: ActionCard[] = [
  {
    label: 'View my pantry',
    tagline: 'See what’s stocked and what’s low',
    description: 'Review expiry alerts, replenish low items, and scan in new groceries with your camera.',
    statLabel: 'Items running low',
    statValue: '3 ingredients',
    icon: FaBoxOpen,
    path: '/pantry',
    color: 'from-emerald-200/70 via-teal-100/70 to-transparent',
    gradientText: 'from-emerald-600 to-teal-600'
  },
  {
    label: 'Start new grocery list',
    tagline: 'Turn meal plans into a ready checklist',
    description: 'Smart suggestions pull from your pantry and favourite meals, ensuring nothing gets missed.',
    statLabel: 'List progress',
    statValue: '72% ready',
    icon: FaList,
    path: '/list',
    color: 'from-orange-200/70 via-pink-100/70 to-transparent',
    gradientText: 'from-orange-600 to-pink-600'
  },
  {
    label: 'Check today’s deals',
    tagline: 'Catch price drops before you shop',
    description: 'Personalised offers based on what you actually buy, updated hourly from partner stores.',
    statLabel: 'New offers',
    statValue: '+5 fresh deals',
    icon: FaTag,
    path: '/deals',
    color: 'from-sky-200/70 via-cyan-100/70 to-transparent',
    gradientText: 'from-sky-600 to-cyan-600'
  },
  {
    label: 'Favourites at a glance',
    tagline: 'Jump back into your go-to meals',
    description: 'Reheat crowd-pleasers or remix them with pantry swaps in just a couple of taps.',
    statLabel: 'Top pick',
    statValue: 'Mango salsa tacos',
    icon: FaHeart,
    path: '/favorites',
    color: 'from-rose-200/70 via-red-100/70 to-transparent',
    gradientText: 'from-rose-600 to-red-600'
  }
]

const SEASONAL_SPOTLIGHTS: SeasonalSpotlight[] = [
  {
    id: 'autumn-harvest-bowl',
    title: 'Autumn Harvest Bowl',
    description: 'Roasted squash, quinoa, and maple glaze ready in 20 minutes. Built entirely from pantry staples and this week’s deals.',
    chips: ['Squash', 'Quinoa', 'Chickpeas', 'Maple glaze'],
    mealId: 'Autumn Harvest Bowl',
    cta: 'Open in meal planner',
    seasons: ['autumn']
  },
  {
    id: 'winter-citrus-roast',
    title: 'Winter Citrus Roast Chicken',
    description: 'Bright citrus and root veg keep the kitchen cozy without heavy prep.',
    chips: ['Chicken', 'Cara cara orange', 'Parsnip', 'Rosemary'],
    mealId: 'Winter Citrus Roast Chicken',
    cta: 'Plan this dinner',
    seasons: ['winter']
  },
  {
    id: 'spring-herb-pasta',
    title: 'Spring Herb Pasta',
    description: 'Lemon, peas, and basil brighten a quick skillet pasta for midweek dinners.',
    chips: ['Lemon zest', 'Peas', 'Basil', 'Parmesan'],
    mealId: 'Spring Herb Pasta',
    cta: 'Schedule for tonight',
    seasons: ['spring']
  },
  {
    id: 'summer-berry-salad',
    title: 'Summer Berry Grain Salad',
    description: 'Chilled farro, berries, and feta with mint vinaigrette—perfect for hot evenings.',
    chips: ['Farro', 'Blueberries', 'Feta', 'Mint'],
    mealId: 'Summer Berry Grain Salad',
    cta: 'Add to next plan',
    seasons: ['summer']
  }
]

const getSeason = (date: Date): Season => {
  const month = date.getMonth()
  if (month === 11 || month <= 1) return 'winter'
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  return 'autumn'
}

const selectSpotlightForDate = (date: Date): SeasonalSpotlight => {
  const season = getSeason(date)
  const seasonalPool = SEASONAL_SPOTLIGHTS.filter(spot => spot.seasons.includes(season))
  const pool = seasonalPool.length > 0 ? seasonalPool : SEASONAL_SPOTLIGHTS
  const rotationBucket = Math.floor(date.getTime() / (1000 * 60 * 60 * 24 * 3)) // rotate every ~3 days
  return pool[rotationBucket % pool.length]
}

const tips = [
  'Scan your latest receipt to update your pantry automatically.',
  'Switch to Smart Mode to auto-optimise your next grocery list.',
  'Set weekly reminders so nothing expires unnoticed.',
  'Pin your favourite meals for faster planning next time.'
]

const heroIcons = [
  { Icon: FaUtensils, className: 'top-16 right-16 text-sky-500/60' },
  { Icon: FaTag, className: '-bottom-6 left-24 text-emerald-400/60' },
  { Icon: FaHeart, className: 'bottom-10 right-10 text-rose-400/60' }
]

const heroSparkles = [
  { top: '18%', left: '22%', delay: '0s' },
  { top: '12%', left: '62%', delay: '0.6s' },
  { top: '32%', left: '48%', delay: '1.2s' },
  { top: '58%', left: '18%', delay: '1.8s' },
  { top: '68%', left: '66%', delay: '2.4s' },
  { top: '40%', left: '82%', delay: '3s' }
]

const promiseText = 'We help you plan your groceries, save money, and waste less, all in one place.'

const formatRelativeTime = (input?: number | string | null): string => {
  if (input === undefined || input === null) return '—'
  const date = typeof input === 'string' ? new Date(input) : new Date(input)
  if (Number.isNaN(date.getTime())) return '—'

  const diffMs = Date.now() - date.getTime()
  const minutes = Math.round(diffMs / (1000 * 60))
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min${minutes === 1 ? '' : 's'} ago`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  const weeks = Math.round(days / 7)
  if (weeks < 4) return `${weeks} wk${weeks === 1 ? '' : 's'} ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const buildPulseCards = (
  pantryItems: PantryItem[],
  expiringItems: PantryItem[],
  favouritesCount: number,
  shoppingLists: ShoppingListHistory[],
  receipts: Receipt[]
): PulseCard[] => {
  const totalPantry = pantryItems.length
  const lowItems = pantryItems.filter(item => (item.quantity ?? 0) <= 1).length
  const expiringSoonSet = new Set(expiringItems.map(item => item.productId))
  const expiringSoon = expiringSoonSet.size
  const atRisk = Math.min(totalPantry, lowItems + expiringSoon)
  const healthyPercent = totalPantry === 0 ? 0 : Math.max(0, Math.min(100, Math.round(((totalPantry - atRisk) / totalPantry) * 100)))
  const stockStatus = totalPantry === 0
    ? 'Pantry is empty'
    : healthyPercent >= 75
      ? 'Looking solid'
      : healthyPercent >= 50
        ? 'Needs a quick top-up'
        : 'Time to restock'
  const stockDetail = totalPantry === 0
    ? 'Add pantry staples to see trends'
    : `${lowItems} low • ${expiringSoon} expiring soon`

  const totalMealsPlanned = shoppingLists.reduce((sum, list) => sum + (list.meals?.length ?? 0), 0)
  const totalServings = shoppingLists.reduce((sum, list) => sum + (list.totalServings ?? 0), 0)
  const latestList = shoppingLists.slice().sort((a, b) => b.createdAt - a.createdAt)[0]
  const mealStatus = totalMealsPlanned > 0 ? 'Meal plans queued' : 'No meal plan yet'
  const mealDetail = totalMealsPlanned > 0
    ? `${totalMealsPlanned} meals • ${totalServings} servings`
    : 'Build a plan to auto-fill your list'
  const mealCaption = latestList ? `Last plan ${formatRelativeTime(latestList.createdAt)}` : mealDetail

  const favouritesStatus = favouritesCount > 0 ? 'Crowd pleasers ready' : 'Save your go-tos'
  const favouritesDetail = favouritesCount > 0 ? `${favouritesCount} in favourites` : 'Tap the heart on meals you love'

  const receiptCount = receipts.length
  const latestReceipt = receipts.slice().sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))[0]
  const savingsStatus = receiptCount > 0 ? 'Receipts scanned' : 'Keep your savings sharp'
  const savingsDetail = receiptCount > 0 ? `Last scan ${formatRelativeTime(latestReceipt?.createdAt)}` : 'Scan a receipt to sync pantry'

  return [
    {
      label: 'Stock health',
      value: `${healthyPercent}%`,
      status: stockStatus,
      detail: stockDetail,
      accent: 'from-emerald-100 via-emerald-50 to-white',
      icon: FaBoxOpen,
      iconColor: 'text-emerald-500'
    },
    {
      label: 'Meal momentum',
      value: totalMealsPlanned.toString(),
      status: mealStatus,
      detail: mealCaption,
      accent: 'from-purple-100 via-pink-50 to-white',
      icon: FaUtensils,
      iconColor: 'text-purple-500'
    },
    {
      label: 'Favourites ready',
      value: favouritesCount.toString(),
      status: favouritesStatus,
      detail: favouritesDetail,
      accent: 'from-rose-100 via-orange-50 to-white',
      icon: FaHeart,
      iconColor: 'text-rose-500'
    },
    {
      label: 'Savings watch',
      value: receiptCount.toString(),
      status: savingsStatus,
      detail: savingsDetail,
      accent: 'from-sky-100 via-cyan-50 to-white',
      icon: FaTag,
      iconColor: 'text-sky-500'
    }
  ]
}

export default function DashboardIntro() {
  const navigate = useNavigate()
  const userEmail = useSelector((state: RootState) => state.auth.email)
  const [tipIndex, setTipIndex] = useState(0)
  const [activeAction, setActiveAction] = useState<ActionCard>(quickActions[0])
  const [highlightStats, setHighlightStats] = useState<HighlightMetric[]>([
    { label: 'Pantry items tracked', value: 0, tone: 'text-emerald-600', icon: FaBoxOpen },
    { label: 'Meals favourited', value: 0, tone: 'text-teal-600', icon: FaHeart },
    { label: 'Shopping lists created', value: 0, tone: 'text-sky-600', icon: FaList }
  ])
  const [statValues, setStatValues] = useState<number[]>([0, 0, 0])
  const [ctaPulse, setCtaPulse] = useState(false)
  const [sceneArmed, setSceneArmed] = useState(false)
  const reduceMotion = usePrefersReducedMotion()
  const seasonalSpotlight = useMemo(() => selectSpotlightForDate(new Date()), [])
  const [pulseCards, setPulseCards] = useState<PulseCard[]>(initialPulseCards)
  const [firstName, setFirstName] = useState<string | null>(null)
  const [showNamePrompt, setShowNamePrompt] = useState(false)
  const [pendingFirst, setPendingFirst] = useState('')
  const [pendingLast, setPendingLast] = useState('')
  const promiseLetters = useMemo(() => promiseText.split(''), [])
  const ActiveIcon = activeAction.icon

  const userName = useMemo(() => {
    if (firstName) return firstName
    if (!userEmail) return 'SmartCart shopper'
    return userEmail.split('@')[0]
  }, [firstName, userEmail])

  useEffect(() => {
    const storedFirst = localStorage.getItem('customerFirstName')
    const storedLast = localStorage.getItem('customerLastName')
    if (storedFirst) setFirstName(storedFirst)
    if (!storedFirst || !storedLast) {
      setPendingFirst(storedFirst || '')
      setPendingLast(storedLast || '')
      setShowNamePrompt(true)
    }
  }, [])

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const [pantryItems, favorites, shoppingLists, expiringItems, receipts] = await Promise.all([
          pantryApi.getAll().catch(() => []),
          favoritesApi.getAll().catch(() => []),
          shoppingListsApi.getAll().catch(() => []),
          pantryApi.getExpiring().catch(() => []),
          receiptsApi.getAll().catch(() => [])
        ])

        const newHighlights: HighlightMetric[] = [
          {
            label: 'Pantry items tracked',
            value: pantryItems.length,
            tone: 'text-emerald-600',
            icon: FaBoxOpen
          },
          {
            label: 'Meals favourited',
            value: favorites.length,
            tone: 'text-teal-600',
            icon: FaHeart
          },
          {
            label: 'Shopping lists created',
            value: shoppingLists.length,
            tone: 'text-sky-600',
            icon: FaList
          }
        ]
        setHighlightStats(newHighlights)

        const pulse = buildPulseCards(pantryItems, expiringItems, favorites.length, shoppingLists, receipts)
        setPulseCards(pulse)
      } catch (error) {
        console.error('Failed to load dashboard insights', error)
      }
    }

    loadInsights()
  }, [])

  useEffect(() => {
    setSceneArmed(true)

    if (reduceMotion) {
      setStatValues(highlightStats.map((stat) => stat.value))
      return
    }

    const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))
    const duration = 800
    let frameId: number
    let start: number | null = null

    const animateStats = (timestamp: number) => {
      if (!start) start = timestamp
      const elapsed = timestamp - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = easeOutExpo(progress)
      setStatValues(highlightStats.map((stat) => stat.value * eased))
      if (progress < 1) {
        frameId = requestAnimationFrame(animateStats)
      }
    }

    frameId = requestAnimationFrame(animateStats)
    return () => cancelAnimationFrame(frameId)
  }, [highlightStats, reduceMotion])

  useEffect(() => {
    if (reduceMotion) return
    const on = setTimeout(() => setCtaPulse(true), 1600)
    const off = setTimeout(() => setCtaPulse(false), 2000)
    return () => {
      clearTimeout(on)
      clearTimeout(off)
    }
  }, [reduceMotion])

  const handleNameSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmedFirst = pendingFirst.trim()
    const trimmedLast = pendingLast.trim()
    if (!trimmedFirst || !trimmedLast) return
    localStorage.setItem('customerFirstName', trimmedFirst)
    localStorage.setItem('customerLastName', trimmedLast)
    setFirstName(trimmedFirst)
    setShowNamePrompt(false)
  }

  return (
    <div className={`relative min-h-full overflow-hidden ${!reduceMotion && sceneArmed ? 'motion-scene' : ''}`}>
      <div className={`absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-sky-100 ${!reduceMotion && sceneArmed ? 'scene-background' : ''}`} />
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute h-44 w-44 rounded-full bg-emerald-200/25 blur-3xl animate-float"
            style={{
              left: `${12 + i * 26}%`,
              top: `${18 + (i % 2) * 22}%`,
              animationDelay: `${i * 1.2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-12 px-4 py-12 sm:px-6 lg:px-0">
        <header className={`relative overflow-hidden rounded-[32px] border border-emerald-100 bg-white/85 p-8 shadow-xl backdrop-blur sm:p-10 ${reduceMotion ? '' : 'hero-container hero-ambient ripple-hover'}`}>
          <div className="absolute -right-20 -top-36 h-72 w-72 rounded-full bg-emerald-100 blur-3xl" />
          <div className="absolute -bottom-36 left-6 h-72 w-72 rounded-full bg-cyan-100 blur-3xl" />
          {heroIcons.map(({ Icon, className }, index) => (
            <span
              key={index}
              className={`absolute ${className} flex h-14 w-14 items-center justify-center rounded-2xl bg-white/80 shadow-md backdrop-blur ${reduceMotion ? '' : 'animate-float-slow'}`}
            >
              <Icon className="text-2xl" />
            </span>
          ))}
          {!reduceMotion && (
            <div className="hero-sparkles">
              {heroSparkles.map((sparkle, index) => (
                <span
                  key={`sparkle-${index}`}
                  style={{ top: sparkle.top, left: sparkle.left, animationDelay: sparkle.delay }}
                />
              ))}
            </div>
          )}
          <div className="relative flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl space-y-6">
              <span className={`inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-emerald-600 ${reduceMotion ? '' : 'logo-mark'}`}>
                <FaBolt className="text-emerald-500" />
                Welcome back
              </span>
              <h1 className={`text-4xl font-bold leading-tight text-teal-900 sm:text-5xl ${reduceMotion ? '' : 'hero-headline'}`}>
                Hey {userName}, ready to shop smarter today?
              </h1>
              <p className={`text-base text-slate-600 sm:text-lg ${reduceMotion ? '' : 'hero-promise'}`}>
                {promiseLetters.map((char, index) => (
                  <span
                    key={`${char}-${index}`}
                    style={!reduceMotion ? { animationDelay: `${0.04 * index}s` } : undefined}
                  >
                    {char === ' ' ? '\u00a0' : char}
                  </span>
                ))}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/plan')}
                  className={`button-interactive primary-cta rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 text-sm font-semibold text-white shadow-lg ${!reduceMotion && ctaPulse ? 'primary-cta--pulse' : ''}`}
                >
                  Start planning
                </button>
                <button
                  onClick={() => navigate('/pantry')}
                  className="rounded-full border border-emerald-200 bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  View pantry
                </button>
              </div>
            </div>
            <div className="grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {highlightStats.map((stat, index) => {
                const prefix = stat.prefix ?? ''
                const suffix = stat.suffix ?? ''
                const displayValue = reduceMotion ? stat.value : Math.round(statValues[index] ?? 0)
                const badgeVisible = stat.value > 0 && displayValue >= stat.value
                const Icon = stat.icon
                return (
                  <div
                    key={stat.label}
                    className="opacity-0 animate-fade-up rounded-2xl border border-emerald-100 bg-white/90 p-4 shadow-sm"
                    style={{ animationDelay: `${0.15 * index}s` }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      {stat.label}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <p className={`text-2xl font-bold ${stat.tone}`}>
                        {prefix}
                        {displayValue}
                        {suffix}
                      </p>
                      <div className="rounded-2xl bg-emerald-50 p-3 text-xl text-emerald-500">
                        {Icon ? <Icon /> : null}
                      </div>
                    </div>
                    <span className={`stat-badge ${badgeVisible ? 'stat-badge--show' : ''}`} style={reduceMotion ? { opacity: 1 } : undefined}>
                      <FaBolt className="text-emerald-500" />
                      Updated just now
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </header>

        <section className={`relative overflow-hidden rounded-[24px] border border-emerald-100 bg-white/95 p-6 shadow-lg sm:grid sm:grid-cols-[minmax(0,1fr)_220px] sm:items-center sm:gap-8 ${reduceMotion ? '' : 'border-shimmer tilt-hover'}`}>
          <div className="flex flex-col gap-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-600">
              <FaLeaf className="text-emerald-500" />
              Seasonal inspiration
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-emerald-900">{seasonalSpotlight.title}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {seasonalSpotlight.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {seasonalSpotlight.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-emerald-200/70 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-600"
                >
                  {chip}
                </span>
              ))}
            </div>
            <button
              onClick={() => navigate('/plan', { state: { preselectedMeal: seasonalSpotlight.mealId } })}
              className="button-interactive mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
            >
              {seasonalSpotlight.cta}
            </button>
          </div>
          {!reduceMotion && (
            <div className="seasonal-card" aria-hidden>
              <div className="seasonal-card__gradient" />
              <div className="seasonal-card__ring seasonal-card__ring--outer" />
              <div className="seasonal-card__ring seasonal-card__ring--inner" />
              <span className="seasonal-card__spark seasonal-card__spark--top" />
              <span className="seasonal-card__spark seasonal-card__spark--bottom" />
              <span className="seasonal-card__leaf seasonal-card__leaf--left" />
              <span className="seasonal-card__leaf seasonal-card__leaf--right" />
            </div>
          )}
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-emerald-900">Jump back into SmartCart</h2>
            <p className="text-sm text-slate-500">Tap a card to dive straight in</p>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 lg:flex-1">
              {quickActions.map((action, index) => {
                const Icon = action.icon
                const isActive = activeAction.label === action.label
                return (
                  <button
                    key={action.label}
                    onClick={() => {
                      setActiveAction(action)
                      navigate(action.path)
                    }}
                    onMouseEnter={() => setActiveAction(action)}
                    onFocus={() => setActiveAction(action)}
                    className={`quick-action-card group relative overflow-hidden rounded-3xl border border-emerald-100 bg-white p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg opacity-0 animate-fade-up ${
                      isActive ? 'ring-2 ring-emerald-300' : ''
                    } ${reduceMotion ? '' : 'glow-hover'}`}
                    style={{ animationDelay: `${0.12 * index}s` }}
                  >
                    <div
                      className={`absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-gradient-to-br ${action.color}`}
                    />
                    <div className="relative z-10 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="rounded-2xl bg-emerald-50 p-3 text-xl text-emerald-600">
                          <Icon />
                        </div>
                        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-emerald-500">
                          Open
                        </span>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">Preview</p>
                        <h4
                          className={`text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r ${action.gradientText}`}
                        >
                          {action.label}
                        </h4>
                        <p className="mt-2 text-sm text-slate-600">{action.tagline}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg opacity-0 animate-fade-right lg:w-72" style={{ animationDelay: '0.25s' }}>
              <div className="flex items-center justify-between">
                <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-600">
                  <ActiveIcon className="text-xl" />
                </div>
                <span className="text-[11px] uppercase tracking-[0.3em] text-emerald-500">Spotlight</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-emerald-900">{activeAction.label}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{activeAction.description}</p>
              <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm text-emerald-700">
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">{activeAction.statLabel}</p>
                <p className="mt-1 text-base font-semibold">{activeAction.statValue}</p>
              </div>
              <button
                onClick={() => navigate(activeAction.path)}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 transition-transform duration-300 hover:translate-x-1"
              >
                Jump to {activeAction.label.split(' ')[0]} →
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
          <div className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-lg sm:p-8">
            <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-500">Pantry pulse</p>
            <h3 className="mt-3 text-2xl font-semibold text-emerald-900">Here’s what we’re watching</h3>
            <div className="mt-6 space-y-4">
              {pulseCards.map((pulse, index) => {
                const Icon = pulse.icon
                return (
                  <div
                    key={pulse.label}
                    className={`flex items-center justify-between rounded-2xl border border-emerald-100/70 bg-gradient-to-r ${pulse.accent} px-4 py-4 opacity-0 animate-fade-up`}
                    style={{ animationDelay: `${0.14 * index}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                        <Icon className={`text-lg ${pulse.iconColor}`} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-emerald-900">{pulse.label}</p>
                        <p className="text-xs text-emerald-700">
                          {pulse.status} • {pulse.detail}
                        </p>
                      </div>
                    </div>
                    <span className="text-base font-semibold text-emerald-700">{pulse.value}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-white p-6 shadow-lg sm:p-8">
            <div className="absolute -top-20 right-0 h-40 w-40 rounded-full bg-emerald-100 blur-3xl" />
            <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-500">Smart tip</p>
            <h3 className="mt-3 text-2xl font-semibold text-emerald-900">Quick win</h3>
            <p className="mt-4 min-h-[72px] text-base text-slate-600 transition-opacity duration-500">
              {tips[tipIndex]}
            </p>
            <div className="mt-6 flex gap-2">
              {tips.map((_, index) => (
                <button
                  key={index}
                  aria-label={`Show tip ${index + 1}`}
                  onClick={() => setTipIndex(index)}
                  className={`h-2 w-8 rounded-full transition-all duration-300 ${
                    tipIndex === index ? 'bg-emerald-500' : 'bg-emerald-100 hover:bg-emerald-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      {showNamePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <FaUser />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Let’s personalise things</h2>
                <p className="text-sm text-slate-500">Share your name so we can greet you properly.</p>
              </div>
            </div>
            <form onSubmit={handleNameSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  First name
                  <input
                    value={pendingFirst}
                    onChange={(e) => setPendingFirst(e.target.value)}
                    className="rounded-lg border border-emerald-200 px-3 py-2 text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="e.g. Ruchitha"
                    required
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  Last name
                  <input
                    value={pendingLast}
                    onChange={(e) => setPendingLast(e.target.value)}
                    className="rounded-lg border border-emerald-200 px-3 py-2 text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    placeholder="e.g. Surender"
                    required
                  />
                </label>
              </div>
              <button
                type="submit"
                className="button-interactive w-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 py-2.5 text-sm font-semibold text-white shadow-lg"
              >
                Save and continue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

