import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaStore, FaUsers, FaArrowRight } from 'react-icons/fa'

const STORES = ['Walmart', 'Target', 'Kroger', 'Safeway', 'Aldi']
const HOUSEHOLD_SIZES = ['1', '2', '3', '4', '5+']

export default function Onboarding() {
  const [step, setStep] = useState(1)
  const [selectedStores, setSelectedStores] = useState<string[]>([])
  const [householdSize, setHouseholdSize] = useState('')
  const navigate = useNavigate()

  const toggleStore = (store: string) => {
    setSelectedStores(prev => 
      prev.includes(store) 
        ? prev.filter(s => s !== store)
        : [...prev, store]
    )
  }

  const handleContinue = async () => {
    if (step === 1 && selectedStores.length > 0) {
      setStep(2)
    } else if (step === 2 && householdSize) {
      // Save preferences (could call API to save user preferences)
      // Mark onboarding as completed
      localStorage.setItem('onboardingCompleted', 'true')
      localStorage.setItem('preferredStores', JSON.stringify(selectedStores))
      localStorage.setItem('householdSize', householdSize)
      
      navigate('/pantry')
    }
  }
  
  const handleSkip = () => {
    localStorage.setItem('onboardingCompleted', 'true')
    navigate('/pantry')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to SmartCart!</h1>
          <p className="text-gray-600">Let's set up your account</p>
        </div>

        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaStore className="mr-2 text-teal-600" />
              Select Your Stores
            </h2>
            <p className="text-gray-600 mb-6">Which stores do you shop at most often?</p>
            <div className="space-y-2">
              {STORES.map(store => (
                <button
                  key={store}
                  onClick={() => toggleStore(store)}
                  className={`w-full p-4 rounded-lg border-2 transition-all ${
                    selectedStores.includes(store)
                      ? 'border-teal-600 bg-teal-50 text-teal-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {store}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaUsers className="mr-2 text-teal-600" />
              Household Size
            </h2>
            <p className="text-gray-600 mb-6">How many people are in your household?</p>
            <div className="grid grid-cols-3 gap-3">
              {HOUSEHOLD_SIZES.map(size => (
                <button
                  key={size}
                  onClick={() => setHouseholdSize(size)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    householdSize === size
                      ? 'border-teal-600 bg-teal-50 text-teal-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-2 text-gray-600 hover:text-gray-900"
            >
              Back
            </button>
          )}
          <button
            onClick={handleContinue}
            disabled={(step === 1 && selectedStores.length === 0) || (step === 2 && !householdSize)}
            className={`ml-auto px-6 py-2 rounded-lg flex items-center ${
              (step === 1 && selectedStores.length === 0) || (step === 2 && !householdSize)
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-500 hover:from-teal-600 hover:via-cyan-600 hover:to-teal-600'
            }`}
          >
            {step === 2 ? 'Finish' : 'Continue'}
            <FaArrowRight className="ml-2" />
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}

