import React, { useState, useEffect, useRef, ReactNode } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
  threshold?: number;
  disabled?: boolean;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
  threshold = 80,
  disabled = false
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        setCanPull(true);
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canPull || isRefreshing) return;

      currentY.current = e.touches[0].clientY;
      const distance = currentY.current - startY.current;

      if (distance > 0 && container.scrollTop === 0) {
        e.preventDefault();
        setPullDistance(Math.min(distance * 0.5, threshold + 20));
      }
    };

    const handleTouchEnd = async () => {
      if (!canPull || isRefreshing) return;

      if (pullDistance > threshold) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          if (process.env.NODE_ENV !== 'production') {
          console.error('Refresh failed:', error);
          }
        } finally {
          setIsRefreshing(false);
        }
      }

      setPullDistance(0);
      setCanPull(false);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [canPull, pullDistance, threshold, onRefresh, isRefreshing, disabled]);

  const refreshProgress = Math.min(pullDistance / threshold, 1);
  const shouldShowRefresh = pullDistance > 10;

  return (
    <div ref={containerRef} className="relative overflow-auto h-full">
      {/* Pull to refresh indicator */}
      {shouldShowRefresh && (
        <div 
          className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 bg-gradient-to-b from-teal-50 to-transparent dark:from-teal-900/20 transition-all duration-200"
          style={{ 
            height: `${pullDistance}px`,
            transform: `translateY(-${Math.max(0, pullDistance - 60)}px)`
          }}
        >
          <div className="flex flex-col items-center space-y-2 text-teal-600 dark:text-teal-400">
            {isRefreshing ? (
              <>
                <i className="fas fa-spinner fa-spin text-xl"></i>
                <span className="text-xs font-medium">Refreshing...</span>
              </>
            ) : pullDistance > threshold ? (
              <>
                <i className="fas fa-arrow-up text-xl"></i>
                <span className="text-xs font-medium">Release to refresh</span>
              </>
            ) : (
              <>
                <div 
                  className="w-6 h-6 border-2 border-teal-200 dark:border-teal-700 rounded-full relative"
                >
                  <div
                    className="absolute inset-0 border-2 border-teal-500 rounded-full transition-all duration-200"
                    style={{
                      clipPath: `polygon(0 ${100 - refreshProgress * 100}%, 100% ${100 - refreshProgress * 100}%, 100% 100%, 0% 100%)`
                    }}
                  />
                </div>
                <span className="text-xs font-medium">Pull to refresh</span>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Content */}
      <div 
        className="transition-transform duration-200"
        style={{ 
          transform: `translateY(${isRefreshing ? '60px' : shouldShowRefresh ? `${Math.min(pullDistance, 60)}px` : '0px'})` 
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;