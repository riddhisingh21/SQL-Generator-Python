import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { createUserStorage } from '../services/storage'

function SchemaManager() {
  const { user } = useUser()
  const [schemas, setSchemas] = useState([])
  const [schemaName, setSchemaName] = useState('')
  const [schemaContent, setSchemaContent] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [currentSchemaId, setCurrentSchemaId] = useState(null)
  const [userStorage, setUserStorage] = useState(null)

  useEffect(() => {
    if (user?.id) {
      const storage = createUserStorage(user.id)
      setUserStorage(storage)

      // Load saved schemas from user-specific storage
      const savedSchemas = storage.getSchemas()
      setSchemas(savedSchemas)
    }
  }, [user?.id])

  const saveSchema = () => {
    if (!schemaName.trim() || !schemaContent.trim() || !userStorage) return

    const newSchemas = [...schemas]

    if (editMode && currentSchemaId !== null) {
      const index = newSchemas.findIndex(s => s.id === currentSchemaId)
      if (index !== -1) {
        newSchemas[index] = {
          ...newSchemas[index],
          name: schemaName,
          content: schemaContent,
          updatedAt: new Date().toISOString()
        }
      }
    } else {
      newSchemas.push({
        id: Date.now(),
        name: schemaName,
        content: schemaContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }

    setSchemas(newSchemas)
    userStorage.setSchemas(newSchemas)
    resetForm()
  }

  const editSchema = (schema) => {
    setSchemaName(schema.name)
    setSchemaContent(schema.content)
    setEditMode(true)
    setCurrentSchemaId(schema.id)
  }

  const deleteSchema = (id) => {
    if (!userStorage) return

    const newSchemas = schemas.filter(schema => schema.id !== id)
    setSchemas(newSchemas)
    userStorage.setSchemas(newSchemas)

    if (currentSchemaId === id) {
      resetForm()
    }
  }

  const resetForm = () => {
    setSchemaName('')
    setSchemaContent('')
    setEditMode(false)
    setCurrentSchemaId(null)
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Schema Manager</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Schema Name
        </label>
        <input
          type="text"
          value={schemaName}
          onChange={(e) => setSchemaName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
          placeholder="e.g., E-commerce Database"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Schema Content
        </label>
        <textarea
          value={schemaContent}
          onChange={(e) => setSchemaContent(e.target.value)}
          className="w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
          rows="5"
          placeholder="Paste your CREATE TABLE statements here..."
        />
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={saveSchema}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {editMode ? 'Update Schema' : 'Save Schema'}
        </button>
        
        {editMode && (
          <button
            onClick={resetForm}
            className="bg-gray-600 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        )}
      </div>
      
      {schemas.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium text-white mb-2">Saved Schemas</h3>
          <ul className="divide-y divide-gray-700">
            {schemas.map(schema => (
              <li key={schema.id} className="py-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-200 font-medium">{schema.name}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => editSchema(schema)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSchema(schema.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default SchemaManager