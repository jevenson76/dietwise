import React from 'react';

interface EmptyStateProps {
  icon: string;
  iconColor?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  tips?: string[];
  className?: string;
  logo?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  iconColor = 'text-gray-400 dark:text-gray-500',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  tips,
  className = '',
  logo,
}) => {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      {/* Logo */}
      {logo && (
        <div className="mb-4">
          {logo}
        </div>
      )}

      {/* Icon */}
      <div className="mb-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800">
          <i className={`${icon} text-3xl ${iconColor}`}></i>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">
        {description}
      </p>

      {/* Action Buttons */}
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              {actionLabel}
            </button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="px-6 py-2.5 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-medium"
            >
              {secondaryActionLabel}
            </button>
          )}
        </div>
      )}

      {/* Tips */}
      {tips && tips.length > 0 && (
        <div className="mt-8 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 max-w-md mx-auto">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
            <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
            Quick Tips
          </h4>
          <ul className="text-left space-y-1">
            {tips.map((tip, index) => (
              <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                <span className="text-teal-500 mr-2">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EmptyState;