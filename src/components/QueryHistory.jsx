import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { createUserStorage } from '../services/storage'

function QueryHistory() {
  const { user } = useUser()
  const [history, setHistory] = useState([])
  const [selectedQuery, setSelectedQuery] = useState(null)
  const [userStorage, setUserStorage] = useState(null)
  const [copySuccess, setCopySuccess] = useState(null)

  useEffect(() => {
    if (user?.id) {
      const storage = createUserStorage(user.id)
      setUserStorage(storage)

      // Load query history from user-specific storage
      const savedHistory = storage.getQueryHistory()
      setHistory(savedHistory)
    }
  }, [user?.id])

  const clearHistory = () => {
    if (!userStorage) return

    userStorage.setQueryHistory([])
    setHistory([])
    setSelectedQuery(null)
  }

  const deleteQuery = (id) => {
    if (!userStorage) return

    const newHistory = history.filter(item => item.id !== id)
    setHistory(newHistory)
    userStorage.setQueryHistory(newHistory)

    if (selectedQuery && selectedQuery.id === id) {
      setSelectedQuery(null)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const handleCopyToClipboard = async (text, itemId) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }

      setCopySuccess(itemId)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Query History</h2>
        {history.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-sm text-red-400 hover:text-red-300"
          >
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-gray-400">No queries yet</p>
      ) : (
        <div>
          <ul className="divide-y divide-gray-700 max-h-96 overflow-y-auto">
            {history.map(item => (
              <li key={item.id} className="py-3">
                <div 
                  onClick={() => setSelectedQuery(selectedQuery?.id === item.id ? null : item)}
                  className="cursor-pointer"
                >
                  <p className="text-sm font-medium text-gray-200 truncate">
                    {item.query}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(item.timestamp)} • {item.dialect.toUpperCase()}
                  </p>
                </div>

                {selectedQuery?.id === item.id && (
                  <div className="mt-2 space-y-2">
                    <div className="bg-gray-700 p-3 rounded-md">
                      <h4 className="text-xs font-medium text-gray-400 mb-1">SQL</h4>
                      <pre className="text-xs text-gray-200 whitespace-pre-wrap">{item.sql}</pre>
                    </div>

                    {item.explanation && (
                      <div className="bg-gray-700 p-3 rounded-md">
                        <h4 className="text-xs font-medium text-gray-400 mb-1">Explanation</h4>
                        <p className="text-xs text-gray-200">{item.explanation}</p>
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleCopyToClipboard(item.sql, item.id)}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        {copySuccess === item.id ? '✅ Copied!' : '📋 Copy SQL'}
                      </button>
                      <button
                        onClick={() => deleteQuery(item.id)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default QueryHistory