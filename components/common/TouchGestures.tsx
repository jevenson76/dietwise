import React, { useRef, useState, useCallback } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface TouchGesturesProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onDoubleTap?: () => void;
  swipeThreshold?: number;
  className?: string;
}

const TouchGestures: React.FC<TouchGesturesProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPinch,
  onDoubleTap,
  swipeThreshold = 50,
  className = ''
}) => {
  const { isTouchDevice } = useResponsive();
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTapRef = useRef<number>(0);
  const [initialDistance, setInitialDistance] = useState<number | null>(null);

  const getDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isTouchDevice) return;

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };
    } else if (e.touches.length === 2 && onPinch) {
      const distance = getDistance(e.touches[0], e.touches[1]);
      setInitialDistance(distance);
    }
  }, [isTouchDevice, onPinch, getDistance]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isTouchDevice) return;

    if (e.touches.length === 2 && onPinch && initialDistance) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialDistance;
      onPinch(scale);
    }
  }, [isTouchDevice, onPinch, initialDistance, getDistance]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isTouchDevice || !touchStartRef.current) return;

    if (e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const touchEnd = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      };

      const deltaX = touchEnd.x - touchStartRef.current.x;
      const deltaY = touchEnd.y - touchStartRef.current.y;
      const deltaTime = touchEnd.time - touchStartRef.current.time;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      // Check for double tap
      if (onDoubleTap && deltaTime < 300 && absX < 10 && absY < 10) {
        if (touchEnd.time - lastTapRef.current < 300) {
          onDoubleTap();
        }
        lastTapRef.current = touchEnd.time;
      }

      // Check for swipe gestures
      if (Math.max(absX, absY) > swipeThreshold && deltaTime < 1000) {
        if (absX > absY) {
          // Horizontal swipe
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight();
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft();
          }
        } else {
          // Vertical swipe
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown();
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp();
          }
        }
      }
    }

    touchStartRef.current = null;
    setInitialDistance(null);
  }, [
    isTouchDevice,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onDoubleTap,
    swipeThreshold
  ]);

  if (!isTouchDevice) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      className={className}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ touchAction: 'manipulation' }}
    >
      {children}
    </div>
  );
};

export default TouchGestures;