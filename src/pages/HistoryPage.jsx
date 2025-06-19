import QueryHistory from '../components/QueryHistory'

function HistoryPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Query History
        </h1>
        <p className="text-gray-300">
          View and manage your previously generated SQL queries
        </p>
      </div>
      
      <QueryHistory />
    </div>
  )
}

export default HistoryPage
