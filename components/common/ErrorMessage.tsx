import React from 'react';

export interface ErrorAction {
  label: string;
  action: () => void;
  icon?: string;
  variant?: 'primary' | 'secondary';
}

interface ErrorMessageProps {
  title?: string;
  message: string;
  details?: string;
  actions?: ErrorAction[];
  suggestions?: string[];
  errorCode?: string;
  onClose?: () => void;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Something went wrong',
  message,
  details,
  actions = [],
  suggestions = [],
  errorCode,
  onClose,
  className = '',
  showIcon = true,
  compact = false,
}) => {
  if (compact) {
    return (
      <div className={`flex items-center p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg ${className}`}>
        {showIcon && (
          <i className="fas fa-exclamation-circle text-red-500 dark:text-red-400 mr-2"></i>
        )}
        <span className="text-sm text-red-700 dark:text-red-300 flex-1">{message}</span>
        {actions.length > 0 && (
          <button
            onClick={actions[0].action}
            className="ml-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
          >
            {actions[0].label}
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg shadow-lg overflow-hidden ${className}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Header */}
      <div className="bg-red-50 dark:bg-red-900/30 px-4 py-3 border-b border-red-200 dark:border-red-800">
        <div className="flex items-start">
          {showIcon && (
            <div className="flex-shrink-0">
              <i className="fas fa-exclamation-triangle text-red-500 dark:text-red-400 text-xl"></i>
            </div>
          )}
          <div className="ml-3 flex-1">
            <h3 className="text-base font-semibold text-red-800 dark:text-red-200">
              {title}
            </h3>
            {errorCode && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
                Error Code: {errorCode}
              </p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-auto -mr-1 -mt-1 p-1.5 rounded-full text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-800 transition-colors"
              aria-label="Dismiss error"
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
        
        {details && (
          <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
              {details}
            </p>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Try these solutions:
            </h4>
            <ul className="space-y-1">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="flex items-start text-sm text-gray-600 dark:text-gray-400"
                >
                  <i className="fas fa-check-circle text-teal-500 mr-2 mt-0.5"></i>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {actions.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  action.variant === 'secondary'
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    : 'bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600'
                }`}
              >
                {action.icon && <i className={`${action.icon} mr-2`}></i>}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Predefined error templates
export const ErrorTemplates = {
  network: (retry?: () => void) => ({
    title: 'Connection Problem',
    message: "We're having trouble connecting to our servers.",
    suggestions: [
      'Check your internet connection',
      'Try refreshing the page',
      'Check if you\'re behind a firewall or VPN',
    ],
    actions: retry
      ? [
          { label: 'Retry', action: retry, icon: 'fas fa-redo' },
          { label: 'Refresh Page', action: () => window.location.reload(), variant: 'secondary' as const },
        ]
      : [],
  }),

  auth: () => ({
    title: 'Authentication Required',
    message: 'You need to be logged in to access this feature.',
    suggestions: [
      'Log in with your existing account',
      'Create a new account if you don\'t have one',
    ],
    actions: [
      { label: 'Log In', action: () => window.location.href = '/login', icon: 'fas fa-sign-in-alt' },
      { label: 'Sign Up', action: () => window.location.href = '/register', variant: 'secondary' as const },
    ],
  }),

  validation: (field: string, requirement: string) => ({
    title: 'Invalid Input',
    message: `The ${field} you entered doesn't meet our requirements.`,
    details: requirement,
    suggestions: [
      `Check the ${field} format`,
      'Remove any special characters if not allowed',
      'Ensure you\'re within the character limit',
    ],
  }),

  api: (operation: string, retry?: () => void) => ({
    title: 'Service Temporarily Unavailable',
    message: `We couldn't complete your ${operation} request right now.`,
    suggestions: [
      'Wait a moment and try again',
      'Check if you have a stable internet connection',
      'Contact support if the problem persists',
    ],
    actions: retry
      ? [{ label: 'Try Again', action: retry, icon: 'fas fa-redo' }]
      : [],
  }),

  permission: (resource: string) => ({
    title: 'Access Denied',
    message: `You don't have permission to access ${resource}.`,
    suggestions: [
      'Check if you\'re logged into the correct account',
      'Verify your subscription status',
      'Contact support if you believe this is an error',
    ],
    actions: [
      { label: 'Go to Dashboard', action: () => window.location.href = '/', icon: 'fas fa-home' },
    ],
  }),

  notFound: (item: string) => ({
    title: `${item} Not Found`,
    message: `We couldn't find the ${item.toLowerCase()} you're looking for.`,
    suggestions: [
      'Double-check the URL or link',
      'Try searching for it instead',
      'It may have been moved or deleted',
    ],
    actions: [
      { label: 'Go Home', action: () => window.location.href = '/', icon: 'fas fa-home' },
    ],
  }),

  quota: (limit: string, upgrade?: () => void) => ({
    title: 'Limit Reached',
    message: `You've reached your ${limit} limit for this period.`,
    suggestions: [
      'Wait until your limit resets',
      'Upgrade to Premium for unlimited access',
      'Remove some existing items to make space',
    ],
    actions: upgrade
      ? [
          { label: 'Upgrade Now', action: upgrade, icon: 'fas fa-crown' },
          { label: 'Learn More', action: () => window.location.href = '/pricing', variant: 'secondary' as const },
        ]
      : [],
  }),

  offline: () => ({
    title: 'You\'re Offline',
    message: 'Some features may be limited without an internet connection.',
    suggestions: [
      'Check your internet connection',
      'Your changes will sync when you\'re back online',
      'Core features are still available offline',
    ],
  }),
};

export default ErrorMessage;