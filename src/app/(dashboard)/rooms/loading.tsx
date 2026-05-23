export default function RoomsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-7 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>

      {/* Filters skeleton */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 h-16">
         <div className="h-10 bg-gray-200 rounded w-full md:w-1/3"></div>
         <div className="hidden md:block h-10 bg-gray-200 rounded w-32"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 h-40">
             <div className="flex justify-between items-center mb-4">
               <div className="h-5 bg-gray-200 rounded w-1/3"></div>
               <div className="h-5 bg-gray-200 rounded w-16"></div>
             </div>
             <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
             <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
