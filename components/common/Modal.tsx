import React, { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | null;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  logo?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', logo }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Tab') {
          if (!modalRef.current) return;
          const focusableElements = Array.from(
            modalRef.current.querySelectorAll<HTMLElement>(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          ).filter(el => el.offsetParent !== null); // Filter out hidden elements

          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (event.shiftKey) { // Shift + Tab
            if (document.activeElement === firstElement) {
              lastElement.focus();
              event.preventDefault();
            }
          } else { // Tab
            if (document.activeElement === lastElement) {
              firstElement.focus();
              event.preventDefault();
            }
          }
        } else if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full m-4 h-[calc(100vh-2rem)]'
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`bg-bg-card rounded-xl shadow-2xl p-0 w-full ${sizeClasses[size]} flex flex-col max-h-[90vh] transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modal-appear`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1} 
      >
        {title && title.trim() !== '' && (
          <div className="flex justify-between items-center p-5 sm:p-6 border-b border-border-default bg-bg-card rounded-t-xl relative">
            <div className="flex items-center gap-3">
              {logo && (
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  {logo}
                </div>
              )}
              <h2 id="modal-title" className="text-xl font-semibold text-text-default">
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-red-500 dark:hover:bg-red-600 text-gray-600 dark:text-gray-300 hover:text-white text-lg p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm"
              aria-label="Close modal"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-grow p-5 sm:p-6 custom-scrollbar relative">
          {(!title || title.trim() === '') && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 bg-gray-200 dark:bg-gray-700 hover:bg-red-500 dark:hover:bg-red-600 text-gray-600 dark:text-gray-300 hover:text-white text-lg p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-red-400 shadow-sm z-10"
              aria-label="Close modal"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
          {children}
        </div>
      </div>
      <style>{`
        @keyframes modal-appear {
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-modal-appear {
          animation: modal-appear 0.3s forwards;
        }
      `}</style>
    </div>
  );
};

export default Modal;