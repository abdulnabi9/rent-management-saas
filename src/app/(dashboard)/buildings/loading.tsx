export default function BuildingsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-7 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 h-48">
             <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
             <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
             <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
             <div className="flex gap-2">
               <div className="h-8 bg-gray-200 rounded w-16"></div>
               <div className="h-8 bg-gray-200 rounded w-16"></div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
