/**
 * Skeleton Loader for Personality Cards
 * Displays loading state while personality data is being fetched
 * 
 * Features:
 * - Circular avatar placeholder (96x96px)
 * - 2-line name and era placeholders
 * - 3-line description placeholders
 * - 4 pill-shaped value tag placeholders
 * - Button placeholder at bottom
 * - Dual animation: pulse + shimmer effect
 */

interface PersonalityCardSkeletonProps {
  index?: number;
}

export function PersonalityCardSkeleton({ index = 0 }: PersonalityCardSkeletonProps) {
  return (
    <div 
      className="relative bg-gray-900/50 backdrop-blur-sm border border-gray-800/50 rounded-xl p-6 overflow-hidden hover:border-gray-700/50 transition-colors duration-300"
      style={{ 
        animationDelay: `${index * 100}ms`,
        animation: 'fadeIn 0.5s ease-out forwards',
        opacity: 0
      }}
    >
      {/* Enhanced Shimmer Effect - sweeps across card */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/30 to-transparent"
        style={{
          animation: 'shimmer 2s infinite',
          transform: 'translateX(-100%)'
        }}
      ></div>
      
      <div className="relative space-y-4">
        {/* Avatar Placeholder - Circular 96x96px */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-800/90 to-gray-800/70 rounded-full animate-pulse shadow-lg"></div>
        </div>

        {/* Name & Era Placeholders - 2 lines */}
        <div className="space-y-2">
          {/* Display Name */}
          <div className="h-6 bg-gradient-to-r from-gray-800/80 to-gray-800/60 rounded-md w-3/4 mx-auto animate-pulse"></div>
          {/* Era */}
          <div className="h-4 bg-gradient-to-r from-gray-800/60 to-gray-800/40 rounded-md w-1/2 mx-auto animate-pulse delay-75"></div>
        </div>

        {/* Description Placeholder - 3 lines of progressively shorter text */}
        <div className="space-y-2 pt-2">
          <div className="h-3 bg-gradient-to-r from-gray-800/60 to-gray-800/50 rounded w-full animate-pulse delay-100"></div>
          <div className="h-3 bg-gradient-to-r from-gray-800/60 to-gray-800/50 rounded w-11/12 animate-pulse delay-150"></div>
          <div className="h-3 bg-gradient-to-r from-gray-800/60 to-gray-800/50 rounded w-3/4 animate-pulse delay-200"></div>
        </div>

        {/* Value Tags Placeholder - 4 pill-shaped badges */}
        <div className="flex flex-wrap gap-2 pt-3">
          <div className="h-6 bg-gradient-to-r from-gray-800/60 to-gray-800/50 rounded-full w-20 animate-pulse delay-100 px-3"></div>
          <div className="h-6 bg-gradient-to-r from-gray-800/60 to-gray-800/50 rounded-full w-24 animate-pulse delay-150 px-3"></div>
          <div className="h-6 bg-gradient-to-r from-gray-800/60 to-gray-800/50 rounded-full w-16 animate-pulse delay-200 px-3"></div>
          <div className="h-6 bg-gradient-to-r from-gray-800/60 to-gray-800/50 rounded-full w-20 animate-pulse delay-75 px-3"></div>
        </div>

        {/* Button Placeholder - Full width at bottom */}
        <div className="pt-4">
          <div className="h-10 bg-gradient-to-r from-gray-800/80 to-gray-800/60 rounded-lg w-full animate-pulse delay-100 shadow-md"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Grid container with multiple skeleton cards
 * Shows while personality data is loading
 * 
 * Features:
 * - 3-column responsive grid (1 col mobile, 2 tablet, 3 desktop)
 * - Staggered card appearance (100ms delay between each)
 * - Default 6 cards to match typical personality count
 * - Matches actual card grid spacing (gap-6)
 */
export function PersonalityGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <PersonalityCardSkeleton key={`skeleton-${index}`} index={index} />
      ))}
    </div>
  );
}
