export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-xl font-semibold text-gray-700 brand-font">
          Loading MindFlow...
        </div>
      </div>
    </div>
  )
}