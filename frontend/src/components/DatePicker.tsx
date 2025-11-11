import { useState, useRef, useEffect } from 'react'
import { FaCalendar } from 'react-icons/fa'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  label?: string
}

export default function DatePicker({ value, onChange, label = 'Date' }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [displayMonth, setDisplayMonth] = useState(new Date().getMonth())
  const [displayYear, setDisplayYear] = useState(new Date().getFullYear())
  const datePickerRef = useRef<HTMLDivElement>(null)

  const today = new Date()
  const minDate = new Date(today)
  minDate.setDate(today.getDate() - 1)
  const maxDate = new Date(today)
  maxDate.setDate(today.getDate() + 3)
  const minYear = minDate.getFullYear()
  const minMonth = minDate.getMonth()
  const maxYear = maxDate.getFullYear()
  const maxMonth = maxDate.getMonth()

  // Parse value to date
  useEffect(() => {
    if (value && value.length === 8) {
      const year = parseInt(value.substring(0, 4))
      const month = parseInt(value.substring(4, 6)) - 1
      const day = parseInt(value.substring(6, 8))
      const date = new Date(year, month, day)
      if (!isNaN(date.getTime())) {
        if (date < minDate) {
          setSelectedDate(null)
          setDisplayMonth(minMonth)
          setDisplayYear(minYear)
        } else if (date > maxDate) {
          setSelectedDate(null)
          setDisplayMonth(maxMonth)
          setDisplayYear(maxYear)
        } else {
          setSelectedDate(date)
          setDisplayMonth(month)
          setDisplayYear(year)
        }
      }
    } else {
      setSelectedDate(null)
      setDisplayMonth(today.getMonth())
      setDisplayYear(today.getFullYear())
    }
  }, [value])

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return ''
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)
    return `${month}/${day}/${year}`
  }

  const formatDateForValue = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  }

  const handleDateSelect = (day: number) => {
    const date = new Date(displayYear, displayMonth, day)
    const dateStr = formatDateForValue(date)
    setSelectedDate(date)
    onChange(dateStr)
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange('')
    setSelectedDate(null)
    setIsOpen(false)
  }

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const isDateDisabled = (day: number): boolean => {
    const date = new Date(displayYear, displayMonth, day)
    return date < minDate || date > maxDate
  }

  const isDateSelected = (day: number): boolean => {
    if (!selectedDate) return false
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === displayMonth &&
      selectedDate.getFullYear() === displayYear
    )
  }

  const isToday = (day: number): boolean => {
    const today = new Date()
    return (
      today.getDate() === day &&
      today.getMonth() === displayMonth &&
      today.getFullYear() === displayYear
    )
  }

  const navigateMonth = (direction: number) => {
    let newMonth = displayMonth + direction
    let newYear = displayYear

    if (newMonth < 0) {
      newMonth = 11
      newYear--
    } else if (newMonth > 11) {
      newMonth = 0
      newYear++
    }

    if (newYear < minYear || (newYear === minYear && newMonth < minMonth)) {
      newYear = minYear
      newMonth = minMonth
    }

    if (newYear > maxYear || (newYear === maxYear && newMonth > maxMonth)) {
      newYear = maxYear
      newMonth = maxMonth
    }

    setDisplayMonth(newMonth)
    setDisplayYear(newYear)
  }

  const goToToday = () => {
    const today = new Date()
    setDisplayMonth(today.getMonth())
    setDisplayYear(today.getFullYear())
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const daysInMonth = getDaysInMonth(displayMonth, displayYear)
  const firstDay = getFirstDayOfMonth(displayMonth, displayYear)
  const days = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <div className="relative" ref={datePickerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:w-auto min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 flex items-center justify-between bg-white hover:bg-gray-50"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-500'}>
          {value ? formatDateForDisplay(value) : 'Select date'}
        </span>
        <FaCalendar className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-xl p-3 w-full min-w-[220px] max-w-[260px]">
          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              disabled={displayYear === minYear && displayMonth === minMonth}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-sm font-semibold text-gray-700">
              {monthNames[displayMonth]}
            </div>
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              disabled={displayYear === maxYear && displayMonth === maxMonth}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Today button */}
          <div className="mb-2">
            <button
              type="button"
              onClick={goToToday}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Go to Today
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-1 text-xs">
            {dayNames.map(day => (
              <div key={day} className="text-center font-semibold text-gray-600 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs">
            {days.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-7" />
              }

              const disabled = isDateDisabled(day)
              const selected = isDateSelected(day)
              const today = isToday(day)

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => !disabled && handleDateSelect(day)}
                  disabled={disabled}
                  className={`
                    h-6 w-6 rounded text-[11px] font-medium transition-colors
                    ${disabled 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : selected
                        ? 'bg-indigo-600 text-white'
                        : today
                          ? 'bg-indigo-100 text-indigo-700 font-semibold hover:bg-indigo-200'
                          : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-3 pt-3 border-t">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

