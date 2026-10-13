export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#151B24] rounded-2xl overflow-hidden shadow-sm dark:shadow-none border border-transparent dark:border-white/10 animate-pulse transition-colors">
      <div className="h-44 bg-gray-200 dark:bg-white/5"></div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-3/4"></div>
        <div className="flex gap-2">
          <div className="h-3 bg-gray-200 dark:bg-white/5 rounded w-16"></div>
          <div className="h-3 bg-gray-200 dark:bg-white/5 rounded w-20"></div>
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 bg-gray-200 dark:bg-white/5 rounded w-20"></div>
          <div className="h-8 bg-gray-200 dark:bg-white/5 rounded-lg w-16"></div>
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FeaturedGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-20 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-200 dark:bg-white/5 rounded-2xl aspect-square"></div>
        <div className="space-y-4">
          <div className="h-3 bg-gray-200 dark:bg-white/5 rounded w-24"></div>
          <div className="h-8 bg-gray-200 dark:bg-white/5 rounded w-3/4"></div>
          <div className="h-10 bg-gray-200 dark:bg-white/5 rounded w-32"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-white/5 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-white/5 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-white/5 rounded w-2/3"></div>
          </div>
          <div className="bg-gray-200 dark:bg-white/5 rounded-2xl p-4 space-y-3">
            <div className="h-4 bg-gray-300 dark:bg-white/10 rounded w-32"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-300 dark:bg-white/10 rounded w-full"></div>
              <div className="h-3 bg-gray-300 dark:bg-white/10 rounded w-full"></div>
              <div className="h-3 bg-gray-300 dark:bg-white/10 rounded w-3/4"></div>
            </div>
          </div>
          <div className="h-12 bg-gray-200 dark:bg-white/5 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#151B24] rounded-2xl p-5 animate-pulse border border-transparent dark:border-white/10 transition-colors">
      <div className="w-10 h-10 bg-gray-200 dark:bg-white/5 rounded-xl mb-3"></div>
      <div className="h-4 bg-gray-200 dark:bg-white/5 rounded w-24 mb-2"></div>
      <div className="h-3 bg-gray-200 dark:bg-white/5 rounded w-16"></div>
    </div>
  );
}
