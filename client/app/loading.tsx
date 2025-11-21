export default function Loading() {
  return (
    <div className="flex h-screen">
      {/* Sidebar skeleton */}
      <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4 space-y-4 animate-pulse">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        ))}
      </aside>

      {/* Main content skeleton */}
      <main className="flex-1 p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          {/* Header skeleton */}
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>

          {/* Table Header */}
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>

          {/* Table Rows */}
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}