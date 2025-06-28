// User-friendly error message mappings
export const ErrorMessages = {
  // Network Errors
  'ERR_NETWORK': {
    title: 'Connection Problem',
    message: 'Unable to connect to our servers. Please check your internet connection.',
    suggestions: ['Check your Wi-Fi or mobile data', 'Try refreshing the page', 'Disable VPN if you\'re using one'],
  },
  'ERR_TIMEOUT': {
    title: 'Request Timed Out',
    message: 'The server took too long to respond. This might be due to a slow connection.',
    suggestions: ['Try again with a stronger connection', 'Reduce the amount of data you\'re requesting'],
  },

  // Authentication Errors
  'ERR_UNAUTHORIZED': {
    title: 'Authentication Required',
    message: 'Please log in to continue.',
    suggestions: ['Log in with your credentials', 'Create an account if you\'re new'],
  },
  'ERR_INVALID_CREDENTIALS': {
    title: 'Invalid Login',
    message: 'The email or password you entered is incorrect.',
    suggestions: ['Double-check your email address', 'Make sure Caps Lock is off', 'Use "Forgot Password" if needed'],
  },
  'ERR_SESSION_EXPIRED': {
    title: 'Session Expired',
    message: 'You\'ve been logged out due to inactivity.',
    suggestions: ['Log in again to continue', 'Enable "Remember Me" to stay logged in longer'],
  },

  // Validation Errors
  'ERR_INVALID_EMAIL': {
    title: 'Invalid Email',
    message: 'Please enter a valid email address.',
    suggestions: ['Check for typos', 'Ensure it includes @ and domain', 'Remove any extra spaces'],
  },
  'ERR_WEAK_PASSWORD': {
    title: 'Password Too Weak',
    message: 'Your password needs to be stronger for security.',
    suggestions: ['Use at least 8 characters', 'Include numbers and symbols', 'Mix uppercase and lowercase letters'],
  },
  'ERR_REQUIRED_FIELD': {
    title: 'Missing Information',
    message: 'Please fill in all required fields.',
    suggestions: ['Look for fields marked with *', 'Check if any fields are highlighted in red'],
  },

  // Food/Nutrition Errors
  'ERR_FOOD_NOT_FOUND': {
    title: 'Food Not Found',
    message: 'We couldn\'t find nutritional information for this item.',
    suggestions: ['Try a different search term', 'Check the spelling', 'Add it manually with custom values'],
  },
  'ERR_INVALID_BARCODE': {
    title: 'Barcode Not Recognized',
    message: 'This barcode isn\'t in our database.',
    suggestions: ['Try scanning again with better lighting', 'Enter the food manually', 'Take a photo of the nutrition label'],
  },
  'ERR_INVALID_CALORIES': {
    title: 'Invalid Calorie Value',
    message: 'Calories must be a positive number.',
    suggestions: ['Enter a number greater than 0', 'Check the nutrition label', 'Use standard serving sizes'],
  },

  // API/Service Errors
  'ERR_API_KEY_MISSING': {
    title: 'Service Configuration Error',
    message: 'The AI features are not properly configured.',
    suggestions: ['Contact support for assistance', 'Try again later', 'Use manual entry as an alternative'],
  },
  'ERR_RATE_LIMIT': {
    title: 'Too Many Requests',
    message: 'You\'ve made too many requests. Please wait a moment.',
    suggestions: ['Wait a few minutes before trying again', 'Upgrade to Premium for higher limits'],
  },
  'ERR_SERVICE_UNAVAILABLE': {
    title: 'Service Temporarily Down',
    message: 'This feature is temporarily unavailable.',
    suggestions: ['Try again in a few minutes', 'Check our status page for updates', 'Use alternative features'],
  },

  // Data Errors
  'ERR_SAVE_FAILED': {
    title: 'Couldn\'t Save Your Changes',
    message: 'There was a problem saving your data.',
    suggestions: ['Check your internet connection', 'Try saving again', 'Copy your data as backup'],
  },
  'ERR_LOAD_FAILED': {
    title: 'Couldn\'t Load Data',
    message: 'We\'re having trouble loading your information.',
    suggestions: ['Refresh the page', 'Check your connection', 'Clear your browser cache'],
  },
  'ERR_SYNC_FAILED': {
    title: 'Sync Failed',
    message: 'Your changes couldn\'t be synced to the cloud.',
    suggestions: ['Changes are saved locally', 'They\'ll sync when connection improves', 'Force sync from settings'],
  },

  // Premium/Limits
  'ERR_PREMIUM_REQUIRED': {
    title: 'Premium Feature',
    message: 'This feature is available for Premium members.',
    suggestions: ['Upgrade to unlock all features', 'Try our free features', 'Start a free trial'],
  },
  'ERR_LIMIT_REACHED': {
    title: 'Daily Limit Reached',
    message: 'You\'ve used all your free requests for today.',
    suggestions: ['Wait until tomorrow for more', 'Upgrade for unlimited access', 'Use manual entry instead'],
  },

  // File/Upload Errors
  'ERR_FILE_TOO_LARGE': {
    title: 'File Too Large',
    message: 'The file exceeds our size limit.',
    suggestions: ['Reduce image quality', 'Crop to important parts', 'Maximum size is 5MB'],
  },
  'ERR_INVALID_FILE_TYPE': {
    title: 'Invalid File Type',
    message: 'This file type is not supported.',
    suggestions: ['Use JPEG, PNG, or WebP images', 'Convert your file to a supported format'],
  },

  // Generic Fallback
  'ERR_UNKNOWN': {
    title: 'Unexpected Error',
    message: 'Something went wrong. We\'re working on fixing it.',
    suggestions: ['Try again', 'Refresh the page', 'Contact support if it persists'],
  },
};

// Helper function to get user-friendly error message
export function getUserFriendlyError(errorCode: string | Error | unknown): {
  title: string;
  message: string;
  suggestions: string[];
  errorCode?: string;
} {
  // Handle Error objects
  if (errorCode instanceof Error) {
    // Check for network errors
    if (errorCode.message.includes('network') || errorCode.message.includes('fetch')) {
      return { ...ErrorMessages.ERR_NETWORK, errorCode: 'ERR_NETWORK' };
    }
    
    // Check for specific error patterns
    if (errorCode.message.includes('401') || errorCode.message.includes('unauthorized')) {
      return { ...ErrorMessages.ERR_UNAUTHORIZED, errorCode: 'ERR_UNAUTHORIZED' };
    }
    
    if (errorCode.message.includes('404') || errorCode.message.includes('not found')) {
      return { ...ErrorMessages.ERR_FOOD_NOT_FOUND, errorCode: 'ERR_FOOD_NOT_FOUND' };
    }
    
    if (errorCode.message.includes('timeout')) {
      return { ...ErrorMessages.ERR_TIMEOUT, errorCode: 'ERR_TIMEOUT' };
    }
    
    // Generic error with original message
    return {
      title: 'Error Occurred',
      message: errorCode.message,
      suggestions: ['Try again', 'Contact support if the problem persists'],
      errorCode: 'ERR_UNKNOWN',
    };
  }

  // Handle string error codes
  if (typeof errorCode === 'string') {
    const upperCode = errorCode.toUpperCase().replace(/[^A-Z_]/g, '_');
    if (upperCode in ErrorMessages) {
      return { ...ErrorMessages[upperCode as keyof typeof ErrorMessages], errorCode: upperCode };
    }
  }

  // Fallback for unknown errors
  return { ...ErrorMessages.ERR_UNKNOWN, errorCode: 'ERR_UNKNOWN' };
}

// Helper to create context-specific error messages
export function createContextualError(
  operation: string,
  error: unknown,
  context?: { item?: string; action?: string }
): {
  title: string;
  message: string;
  suggestions: string[];
  details?: string;
} {
  const baseError = getUserFriendlyError(error);
  
  // Customize based on operation
  switch (operation) {
    case 'food-search':
      return {
        ...baseError,
        message: `We couldn't search for ${context?.item || 'that food'}. ${baseError.message}`,
      };
    
    case 'barcode-scan':
      return {
        ...baseError,
        message: `Unable to scan the barcode. ${baseError.message}`,
        suggestions: [
          'Ensure good lighting on the barcode',
          'Hold your device steady',
          'Try entering the barcode manually',
          ...baseError.suggestions,
        ],
      };
    
    case 'meal-generation':
      return {
        ...baseError,
        message: `Couldn't generate meal suggestions. ${baseError.message}`,
        suggestions: [
          'Try with different preferences',
          'Check your internet connection',
          ...baseError.suggestions,
        ],
      };
    
    case 'save-profile':
      return {
        ...baseError,
        message: `Your profile changes couldn't be saved. ${baseError.message}`,
        suggestions: [
          'Check that all fields are filled correctly',
          'Ensure you have a stable connection',
          ...baseError.suggestions,
        ],
      };
    
    default:
      return baseError;
  }
}

// Validation error helpers
export const ValidationErrors = {
  email: (email: string) => ({
    field: 'email',
    message: !email ? 'Email is required' : 'Please enter a valid email address',
    suggestion: 'Example: user@example.com',
  }),
  
  password: (password: string) => ({
    field: 'password',
    message: !password
      ? 'Password is required'
      : password.length < 8
      ? 'Password must be at least 8 characters'
      : 'Password must include letters, numbers, and symbols',
    suggestion: 'Use a mix of uppercase, lowercase, numbers, and symbols',
  }),
  
  calories: (value: number | string) => ({
    field: 'calories',
    message: !value
      ? 'Calories are required'
      : isNaN(Number(value))
      ? 'Calories must be a number'
      : Number(value) <= 0
      ? 'Calories must be greater than 0'
      : 'Invalid calorie value',
    suggestion: 'Enter a positive number (e.g., 250)',
  }),
  
  weight: (value: number | string) => ({
    field: 'weight',
    message: !value
      ? 'Weight is required'
      : isNaN(Number(value))
      ? 'Weight must be a number'
      : Number(value) <= 0
      ? 'Weight must be greater than 0'
      : Number(value) > 1000
      ? 'Please enter a realistic weight'
      : 'Invalid weight value',
    suggestion: 'Enter your weight in pounds (e.g., 150)',
  }),
  
  targetDate: (date: string, startDate?: string) => ({
    field: 'targetDate',
    message: !date
      ? 'Target date is required'
      : new Date(date) < new Date()
      ? 'Target date must be in the future'
      : startDate && new Date(date) < new Date(startDate)
      ? 'Target date must be after start date'
      : 'Invalid date',
    suggestion: 'Select a future date for your goal',
  }),
};