export default function ExpensesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="h-7 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32"></div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 overflow-hidden">
         <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
         {[...Array(5)].map((_, i) => (
           <div key={i} className="flex justify-between items-center py-4 border-t border-gray-100">
             <div className="h-4 bg-gray-200 rounded w-1/4"></div>
             <div className="h-4 bg-gray-200 rounded w-1/5"></div>
             <div className="h-4 bg-gray-200 rounded w-1/6"></div>
             <div className="h-8 bg-gray-200 rounded w-8"></div>
           </div>
         ))}
      </div>
    </div>
  );
}
