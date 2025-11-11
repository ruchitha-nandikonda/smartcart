import { FaSpinner } from 'react-icons/fa'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({ size = 'md', text, fullScreen = false }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <FaSpinner className={`animate-spin text-indigo-600 ${sizeClasses[size]} mb-2`} />
      {text && <p className="text-gray-600 text-sm mt-2">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

