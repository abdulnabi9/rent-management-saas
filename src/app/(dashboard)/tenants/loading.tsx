export default function TenantsLoading() {
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
             <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 rounded-full bg-gray-200"></div>
               <div>
                 <div className="h-5 bg-gray-200 rounded w-24 mb-1"></div>
                 <div className="h-4 bg-gray-200 rounded w-32"></div>
               </div>
             </div>
             <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
             <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
