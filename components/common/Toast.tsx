import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  action,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const enterTimer = setTimeout(() => setIsVisible(true), 10);

    // Auto-dismiss
    const dismissTimer = duration > 0
      ? setTimeout(() => handleClose(), duration)
      : null;

    return () => {
      clearTimeout(enterTimer);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose(id), 300); // Wait for exit animation
  };

  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle',
  };

  const colors = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-800',
      icon: 'text-green-500 dark:text-green-400',
      text: 'text-green-800 dark:text-green-200',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-500 dark:text-red-400',
      text: 'text-red-800 dark:text-red-200',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/30',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-500 dark:text-yellow-400',
      text: 'text-yellow-800 dark:text-yellow-200',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-500 dark:text-blue-400',
      text: 'text-blue-800 dark:text-blue-200',
    },
  };

  const colorScheme = colors[type];

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
      `}
    >
      <div
        className={`
          max-w-sm w-full ${colorScheme.bg} ${colorScheme.border} 
          border rounded-lg shadow-lg pointer-events-auto
          overflow-hidden
        `}
        role="alert"
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <i className={`${icons[type]} ${colorScheme.icon} text-xl`}></i>
            </div>
            <div className="ml-3 flex-1">
              {title && (
                <p className={`text-sm font-semibold ${colorScheme.text}`}>
                  {title}
                </p>
              )}
              <p className={`text-sm ${colorScheme.text} ${title ? 'mt-1' : ''}`}>
                {message}
              </p>
              {action && (
                <button
                  onClick={action.onClick}
                  className={`mt-2 text-sm font-medium ${colorScheme.icon} hover:underline`}
                >
                  {action.label}
                </button>
              )}
            </div>
            <button
              onClick={handleClose}
              className={`ml-4 flex-shrink-0 ${colorScheme.text} hover:opacity-75`}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
        {/* Progress bar for auto-dismiss */}
        {duration > 0 && (
          <div className="h-1 bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-full ${colorScheme.icon.replace('text-', 'bg-')} transition-all`}
              style={{
                animation: `shrink ${duration}ms linear`,
              }}
            />
          </div>
        )}
      </div>
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Toast Container
interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return createPortal(
    <div
      className="fixed bottom-0 right-0 z-50 p-4 space-y-4 pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>,
    document.body
  );
};

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const showToast = (toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id, onClose: removeToast }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showSuccess = (message: string, options?: Partial<ToastProps>) => {
    showToast({ type: 'success', message, ...options });
  };

  const showError = (message: string, options?: Partial<ToastProps>) => {
    showToast({ type: 'error', message, duration: 8000, ...options });
  };

  const showWarning = (message: string, options?: Partial<ToastProps>) => {
    showToast({ type: 'warning', message, ...options });
  };

  const showInfo = (message: string, options?: Partial<ToastProps>) => {
    showToast({ type: 'info', message, ...options });
  };

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    ToastContainer: () => <ToastContainer toasts={toasts} onClose={removeToast} />,
  };
}

export default Toast;