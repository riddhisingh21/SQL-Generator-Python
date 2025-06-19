import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { generateSQL } from '../services/api'
import { createUserStorage } from '../services/storage'

function SQLGenerator() {
  const { user } = useUser()
  const [query, setQuery] = useState('')
  const [schema, setSchema] = useState('')
  const [sqlDialect, setSqlDialect] = useState('mysql')
  const [generatedSQL, setGeneratedSQL] = useState('')
  const [explanation, setExplanation] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [savedSchemas, setSavedSchemas] = useState([])
  const [userStorage, setUserStorage] = useState(null)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    if (user?.id) {
      const storage = createUserStorage(user.id)
      setUserStorage(storage)

      // Load saved schemas from user-specific storage
      const schemas = storage.getSchemas()
      setSavedSchemas(schemas)
    }
  }, [user?.id])

  const handleSchemaSelect = (e) => {
    const selectedSchema = savedSchemas.find(s => s.name === e.target.value)
    if (selectedSchema) {
      setSchema(selectedSchema.content)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await generateSQL(query, schema, sqlDialect)
      setGeneratedSQL(result.sql)
      setExplanation(result.explanation)

      // Save to user-specific history
      if (userStorage) {
        const newEntry = {
          id: Date.now(),
          query,
          sql: result.sql,
          explanation: result.explanation,
          timestamp: new Date().toISOString(),
          dialect: sqlDialect
        }
        userStorage.addToQueryHistory(newEntry)
      }
    } catch (err) {
      setError(err.message || 'Failed to generate SQL')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyToClipboard = async (text) => {
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

      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
      setError('Failed to copy to clipboard')
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Generate SQL</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Natural Language Query
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
            rows="3"
            placeholder="Describe what you want to query from your database..."
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Database Schema (optional)
          </label>
          <div className="flex mb-2">
            <select
              onChange={handleSchemaSelect}
              className="px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white mr-2"
            >
              <option value="">Select a saved schema</option>
              {savedSchemas.map(schema => (
                <option key={schema.name} value={schema.name}>{schema.name}</option>
              ))}
            </select>
          </div>
          <textarea
            value={schema}
            onChange={(e) => setSchema(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
            rows="5"
            placeholder="Paste your database schema here (CREATE TABLE statements)..."
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            SQL Dialect
          </label>
          <select
            value={sqlDialect}
            onChange={(e) => setSqlDialect(e.target.value)}
            className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
          >
            <option value="mysql">MySQL</option>
            <option value="postgresql">PostgreSQL</option>
            <option value="sqlite">SQLite</option>
            <option value="mssql">SQL Server</option>
            <option value="oracle">Oracle</option>
          </select>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate SQL'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-3 bg-red-900 text-red-200 rounded-md">
          {error}
        </div>
      )}

      {generatedSQL && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-white mb-2">Generated SQL</h3>
          <div className="bg-gray-700 p-4 rounded-md overflow-x-auto">
            <pre className="text-sm text-gray-200">{generatedSQL}</pre>
          </div>

          <button
            onClick={() => handleCopyToClipboard(generatedSQL)}
            className="mt-2 text-sm text-blue-400 hover:text-blue-300"
          >
            {copySuccess ? '✅ Copied!' : '📋 Copy to clipboard'}
          </button>

          {explanation && (
            <>
              <h3 className="text-lg font-medium text-white mt-4 mb-2">Explanation</h3>
              <div className="bg-gray-700 p-4 rounded-md">
                <p className="text-sm text-gray-200">{explanation}</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default SQLGenerator