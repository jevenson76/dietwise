import React from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string | React.ReactNode;
  onClose?: () => void;
  className?: string;
  shareData?: {
    title: string;
    text: string;
    url: string;
  };
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose, className = '', shareData }) => {
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'fas fa-check-circle';
      case 'error':
        return 'fas fa-exclamation-circle';
      case 'warning':
        return 'fas fa-exclamation-triangle';
      case 'info':
        return 'fas fa-info-circle';
    }
  };

  return (
    <div className={`border rounded-lg p-4 flex items-start ${getAlertStyles()} ${className}`}>
      <i className={`${getIcon()} mr-3 mt-0.5`}></i>
      <div className="flex-1">
        <div>{message}</div>
        {shareData && navigator.share && (
          <button
            onClick={() => navigator.share(shareData)}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Share
          </button>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-3 hover:opacity-70"
        >
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default Alert;