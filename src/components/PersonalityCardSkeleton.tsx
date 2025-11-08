/**
 * Skeleton Loader for Personality Cards
 * Displays loading state while personality data is being fetched
 */

export function PersonalityCardSkeleton() {
  return (
    <div className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6 overflow-hidden">
      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-gray-700/20 to-transparent"></div>
      
      <div className="relative space-y-4">
        {/* Avatar Placeholder */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-gray-800/80 rounded-full animate-pulse"></div>
        </div>

        {/* Name Placeholder */}
        <div className="space-y-2">
          <div className="h-6 bg-gray-800/80 rounded-md w-3/4 mx-auto animate-pulse"></div>
          <div className="h-4 bg-gray-800/60 rounded-md w-1/2 mx-auto animate-pulse delay-75"></div>
        </div>

        {/* Description Placeholder */}
        <div className="space-y-2 pt-2">
          <div className="h-3 bg-gray-800/60 rounded-md w-full animate-pulse delay-100"></div>
          <div className="h-3 bg-gray-800/60 rounded-md w-5/6 animate-pulse delay-150"></div>
          <div className="h-3 bg-gray-800/60 rounded-md w-4/6 animate-pulse delay-200"></div>
        </div>

        {/* Value Tags Placeholder */}
        <div className="flex flex-wrap gap-2 pt-2">
          <div className="h-6 bg-gray-800/60 rounded-full w-20 animate-pulse delay-100"></div>
          <div className="h-6 bg-gray-800/60 rounded-full w-24 animate-pulse delay-150"></div>
          <div className="h-6 bg-gray-800/60 rounded-full w-16 animate-pulse delay-200"></div>
          <div className="h-6 bg-gray-800/60 rounded-full w-20 animate-pulse delay-75"></div>
        </div>

        {/* Button Placeholder */}
        <div className="pt-4">
          <div className="h-10 bg-gray-800/80 rounded-lg w-full animate-pulse delay-100"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Grid container with multiple skeleton cards
 * Shows while personality data is loading
 */
export function PersonalityGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PersonalityCardSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );
}
