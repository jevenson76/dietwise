import React from 'react';
import ShareButton from './ShareButton'; 
import { SharePayload } from '../../types'; 

interface AlertProps {
  message: string | React.ReactNode;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  className?: string;
  shareData?: SharePayload; 
}

const Alert: React.FC<AlertProps> = ({ message, type, onClose, className = '', shareData }) => {
  const baseClasses = "p-4 rounded-lg flex items-start shadow-lg text-sm border-l-4";
  const typeStyles = {
    success: {
      container: "bg-green-50 dark:bg-green-900/40 border-green-500 dark:border-green-400 text-green-800 dark:text-green-200",
      icon: "fas fa-check-circle text-green-500 dark:text-green-400",
      title: "Success!",
      role: "status"
    },
    error: {
      container: "bg-red-50 dark:bg-red-900/40 border-red-500 dark:border-red-400 text-red-800 dark:text-red-200",
      icon: "fas fa-times-circle text-red-500 dark:text-red-400",
      title: "Error",
      role: "alert"
    },
    warning: {
      container: "bg-orange-50 dark:bg-orange-900/40 border-orange-400 dark:border-orange-300 text-orange-800 dark:text-orange-200",
      icon: "fas fa-exclamation-triangle text-orange-400 dark:text-orange-300",
      title: "Warning",
      role: "alert"
    },
    info: {
      container: "bg-sky-50 dark:bg-sky-900/40 border-sky-400 dark:border-sky-300 text-sky-800 dark:text-sky-200",
      icon: "fas fa-info-circle text-sky-400 dark:text-sky-300",
      title: "Information",
      role: "status"
    },
  };

  const currentStyle = typeStyles[type];

  return (
    <div 
      className={`${baseClasses} ${currentStyle.container} ${className} my-4`} 
      role={currentStyle.role as "status" | "alert"}
      aria-live="polite" // Announces changes to screen readers
      aria-atomic="true" // Ensures the whole alert is read out
    >
      <div className="flex-shrink-0 mr-3 mt-0.5">
        <i className={`${currentStyle.icon} text-xl fa-fw`}></i>
      </div>
      <div className="flex-grow">
        <p className="font-semibold text-sm">{currentStyle.title}</p>
        <div className="text-sm mt-0.5">{message}</div>
        {shareData && (
          <div className="mt-2.5">
            <ShareButton 
              shareData={shareData} 
              buttonText="Share This"
              className="bg-sky-500 hover:bg-sky-600 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-medium py-1.5 px-3 rounded-md text-xs shadow focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-400 transition-all"
              iconClassName='fas fa-share-alt mr-1.5'
            />
          </div>
        )}
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className="ml-auto -mr-1 -mt-1 p-1.5 rounded-full text-current opacity-70 hover:opacity-100 hover:bg-current hover:bg-opacity-10 dark:hover:bg-opacity-20 transition-all" 
          aria-label="Close alert"
        >
          <i className="fas fa-times fa-fw"></i>
        </button>
      )}
    </div>
  );
};

export default Alert;