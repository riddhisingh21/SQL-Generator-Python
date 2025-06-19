import SchemaManager from '../components/SchemaManager'

function SchemaPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Schema Manager
        </h1>
        <p className="text-gray-300">
          Save and manage your database schemas for better SQL generation
        </p>
      </div>
      
      <SchemaManager />
    </div>
  )
}

export default SchemaPage
