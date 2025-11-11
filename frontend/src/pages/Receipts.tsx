import { useState, useRef, useEffect } from 'react'
import { receiptsApi, type Receipt } from '../api/receipts'
import { FaReceipt, FaUpload, FaTrash, FaCheckCircle, FaClock, FaExclamationCircle, FaSpinner } from 'react-icons/fa'
import { GridSkeleton } from '../components/LoadingSkeleton'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

export default function Receipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const reduceMotion = usePrefersReducedMotion()

  const loadReceipts = async () => {
    try {
      const data = await receiptsApi.getAll()
      setReceipts(data)
    } catch (err: any) {
      console.error('Failed to load receipts', err)
      setError(err.message || 'Failed to load receipts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReceipts()
  }, [])

  const handleFileSelect = async (file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      setError('Please upload a JPEG or PNG image')
      return
    }

    setUploading(true)
    setError('')

    try {
      // Step 1: Get pre-signed URL
      const { uploadUrl, s3Key } = await receiptsApi.getPresignedUrl(file.type)

      // Step 2: Upload to S3
      await receiptsApi.uploadToS3(uploadUrl, file)

      // Step 3: Confirm upload and trigger processing
      await receiptsApi.confirmUpload(s3Key)

      // Reload receipts
      await loadReceipts()

      alert('Receipt uploaded successfully! Processing in progress...')
    } catch (err: any) {
      console.error('Failed to upload receipt', err)
      setError(err.message || 'Failed to upload receipt. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDelete = async (receiptId: string) => {
    if (!window.confirm('Are you sure you want to delete this receipt?')) {
      return
    }

    try {
      await receiptsApi.delete(receiptId)
      await loadReceipts()
    } catch (err: any) {
      console.error('Failed to delete receipt', err)
      setError(err.response?.data?.message || 'Failed to delete receipt.')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <FaCheckCircle className="text-green-500" />
      case 'processing':
        return <FaSpinner className={`text-blue-500 ${reduceMotion ? '' : 'animate-spin'}`} />
      case 'failed':
        return <FaExclamationCircle className="text-red-500" />
      default:
        return <FaClock className="text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processed':
        return 'Processed'
      case 'processing':
        return 'Processing...'
      case 'failed':
        return 'Failed'
      case 'uploaded':
        return 'Uploaded'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 flex items-center">
          <FaReceipt className="mr-3 text-teal-600" />
          Receipts
        </h2>
        <GridSkeleton count={6} />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-gray-900">Receipts</h2>
      </div>

      {error && (
        <div className={`bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 ${reduceMotion ? '' : 'animate-shake'}`}>
          {error}
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 mb-8 text-center transition-colors ${
          dragActive
            ? 'border-teal-500 bg-teal-50'
            : 'border-gray-300 hover:border-teal-400 bg-gray-50'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileSelect(e.target.files[0])
            }
          }}
          className="hidden"
          disabled={uploading}
        />
        
        {uploading ? (
          <>
            <FaSpinner className={`mx-auto text-4xl text-teal-600 mb-4 ${reduceMotion ? '' : 'animate-spin'}`} />
            <p className="text-lg font-semibold text-gray-700">Uploading receipt...</p>
          </>
        ) : (
          <>
            <FaUpload className="mx-auto text-4xl text-teal-600 mb-4" />
            <p className="text-lg font-semibold text-gray-700 mb-2">
              Drop receipt image here or click to upload
            </p>
            <p className="text-sm text-gray-500">
              Supports JPEG and PNG images
            </p>
          </>
        )}
      </div>

      {/* Receipts List */}
      {receipts.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-lg">
          <FaReceipt className="mx-auto text-6xl text-gray-400 mb-4" />
          <p className="text-xl font-semibold">No receipts yet!</p>
          <p className="mt-2">Upload a receipt to automatically update your pantry.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {receipts.map((receipt) => (
            <div
              key={receipt.receiptId}
              className={`bg-white rounded-xl shadow-lg p-6 ${reduceMotion ? '' : 'animate-slideDown'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    {getStatusIcon(receipt.status)}
                    <h3 className="text-xl font-semibold text-gray-900">
                      {receipt.storeName || 'Unknown Store'}
                    </h3>
                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                      {getStatusText(receipt.status)}
                    </span>
                  </div>
                  {receipt.total && (
                    <p className="text-lg font-bold text-teal-600">
                      ${receipt.total.toFixed(2)}
                    </p>
                  )}
                  {receipt.purchasedAt && (
                    <p className="text-sm text-gray-500">
                      {new Date(receipt.purchasedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(receipt.receiptId)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <FaTrash />
                </button>
              </div>

              {/* Line Items */}
              {receipt.lineItems && receipt.lineItems.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <h4 className="font-semibold text-gray-700 mb-2">Items ({receipt.lineItems.length})</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {receipt.lineItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded"
                      >
                        <div className="flex-1">
                          <span className="font-medium">{item.rawDesc}</span>
                          {item.canonicalProductId && (
                            <span className="ml-2 text-xs text-green-600">
                              ✓ Matched: {item.canonicalProductId}
                            </span>
                          )}
                          {!item.canonicalProductId && (
                            <span className="ml-2 text-xs text-yellow-600">
                              ⚠ Needs confirmation
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          {item.qty && <span className="text-gray-600">Qty: {item.qty}</span>}
                          {item.price && (
                            <span className="ml-3 font-semibold text-gray-900">
                              ${item.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

