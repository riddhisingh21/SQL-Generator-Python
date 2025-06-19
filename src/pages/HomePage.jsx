import SQLGenerator from '../components/SQLGenerator'

function HomePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          AI-Powered SQL Generator
        </h1>
        <p className="text-gray-300">
          Transform natural language into optimized SQL queries using Google's Gemini AI
        </p>
      </div>
      
      <SQLGenerator />
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-2xl mb-2">🧠</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            AI-Powered
          </h3>
          <p className="text-gray-300 text-sm">
            Uses Google's Gemini AI to understand complex natural language queries
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-2xl mb-2">🗄️</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Schema-Aware
          </h3>
          <p className="text-gray-300 text-sm">
            Provide your database schema for accurate table and column references
          </p>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <div className="text-2xl mb-2">⚡</div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Multi-Dialect
          </h3>
          <p className="text-gray-300 text-sm">
            Supports MySQL, PostgreSQL, SQLite, SQL Server, and Oracle
          </p>
        </div>
      </div>
    </div>
  )
}

export default HomePage
