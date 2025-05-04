import React from 'react';

/**
 * HolidayCardSkeleton Component
 * 
 * Displays a placeholder skeleton mimicking the layout of a HolidayCard
 * while holiday data is loading.
 */
export default function HolidayCardSkeleton({ isDarkMode }) {
  const bgColor = isDarkMode ? 'bg-gray-800' : 'bg-gray-200';
  const pulseClass = 'animate-pulse';

  return (
    <div className={`rounded-xl overflow-hidden border ${isDarkMode ? 'bg-gray-900/50 border-gray-800/50' : 'bg-white/50 border-gray-200/50'} shadow-md animate-shimmer`}>
      {/* Header */}
      <div className={`h-40 ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-300/50'}`}></div>

      {/* Body Skeleton */}
      <div className="p-4 sm:p-5 space-y-3">
        {/* Title Skeleton */}
        <div className={`h-5 w-3/4 rounded ${bgColor} ${pulseClass}`}></div>
        
        {/* Destination Skeleton */}
        <div className="flex items-center space-x-2">
          <div className={`h-4 w-4 rounded-full ${bgColor} ${pulseClass}`}></div>
          <div className={`h-4 w-1/2 rounded ${bgColor} ${pulseClass}`}></div>
        </div>

        {/* Dates Skeleton */}
        <div className="flex items-center space-x-2">
          <div className={`h-4 w-4 rounded-full ${bgColor} ${pulseClass}`}></div>
          <div className={`h-4 w-2/3 rounded ${bgColor} ${pulseClass}`}></div>
        </div>
        
        {/* Budget Info Skeleton */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between">
            <div className={`h-4 w-1/3 rounded ${bgColor} ${pulseClass}`}></div>
            <div className={`h-4 w-1/4 rounded ${bgColor} ${pulseClass}`}></div>
          </div>
          <div className={`h-2 w-full rounded-full ${bgColor} ${pulseClass}`}></div>
          <div className="flex justify-between">
            <div className={`h-3 w-1/4 rounded ${bgColor} ${pulseClass}`}></div>
            <div className={`h-3 w-1/5 rounded ${bgColor} ${pulseClass}`}></div>
          </div>
        </div>
        
        {/* Footer Skeleton */}
        <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50 flex justify-end">
           <div className="flex gap-2">
              <div className={`h-7 w-7 rounded-full ${bgColor} ${pulseClass}`}></div>
              <div className={`h-7 w-7 rounded-full ${bgColor} ${pulseClass}`}></div>
              <div className={`h-7 w-7 rounded-full ${bgColor} ${pulseClass}`}></div>
           </div>
        </div>
      </div>
    </div>
  );
} 