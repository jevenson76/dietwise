import React, { useEffect, useRef, useState } from 'react';
import { useResponsive } from '../../hooks/useResponsive';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  mobileDrawer?: boolean; // Use drawer style on mobile
  showHandle?: boolean; // Show drag handle for mobile
}

const MobileModal: React.FC<MobileModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  mobileDrawer = true,
  showHandle = true
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const { isMobile } = useResponsive();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [touchStart, setTouchStart] = useState(0);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      return () => {
        document.body.style.overflow = '';
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!showHandle || !mobileDrawer) return;
    setIsDragging(true);
    setTouchStart(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStart;
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // If dragged more than 100px down, close the modal
    if (dragOffset > 100) {
      onClose();
    }
    setDragOffset(0);
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full'
  };

  // Mobile drawer style
  if (isMobile && mobileDrawer) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          ref={modalRef}
          className="fixed bottom-0 left-0 right-0 bg-bg-card rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col transform transition-transform duration-300"
          style={{
            transform: `translateY(${dragOffset}px)`,
            transition: isDragging ? 'none' : 'transform 0.3s ease-out'
          }}
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Drag Handle */}
          {showHandle && (
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
          )}
          
          {/* Header */}
          <div className="flex justify-between items-center px-4 pb-3 border-b border-border-default">
            <h2 id="modal-title" className="text-lg font-semibold text-text-default">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 -mr-2"
              aria-label="Close modal"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>
          
          {/* Content */}
          <div className="overflow-y-auto flex-grow px-4 py-4 overscroll-contain">
            {children}
          </div>
        </div>
      </div>
    );
  }

  // Desktop/tablet modal style
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`bg-bg-card rounded-xl shadow-2xl w-full ${sizeClasses[size]} flex flex-col max-h-[90vh] transform transition-all duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-border-default">
          <h2 id="modal-title" className="text-xl font-semibold text-text-default">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 -mr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Close modal"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="overflow-y-auto flex-grow p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default MobileModal;