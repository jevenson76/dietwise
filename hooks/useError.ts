import { useState, useCallback } from 'react';
import { getUserFriendlyError, createContextualError } from '../utils/errorMessages';
import { trackEvent } from '../services/analyticsService';

interface UseErrorOptions {
  context?: string;
  autoHideDelay?: number;
  trackErrors?: boolean;
}

interface ErrorState {
  message: string;
  title?: string;
  suggestions?: string[];
  errorCode?: string;
  details?: string;
  isVisible: boolean;
}

export function useError(options: UseErrorOptions = {}) {
  const { context = 'general', autoHideDelay, trackErrors = true } = options;
  const [error, setError] = useState<ErrorState | null>(null);

  const showError = useCallback(
    (errorOrMessage: Error | string | unknown, contextualInfo?: { item?: string; action?: string }) => {
      let errorState: ErrorState;

      if (typeof errorOrMessage === 'string') {
        // Simple string message
        errorState = {
          message: errorOrMessage,
          isVisible: true,
        };
      } else if (context !== 'general') {
        // Use contextual error
        const contextualError = createContextualError(context, errorOrMessage, contextualInfo);
        errorState = {
          ...contextualError,
          isVisible: true,
        };
      } else {
        // Use generic error handling
        const friendlyError = getUserFriendlyError(errorOrMessage);
        errorState = {
          ...friendlyError,
          isVisible: true,
        };
      }

      setError(errorState);

      // Track error if enabled
      if (trackErrors && errorState.errorCode) {
        trackEvent('error_shown', {
          errorCode: errorState.errorCode,
          context,
          message: errorState.message.substring(0, 100), // Limit message length
        });
      }

      // Auto-hide if delay is set
      if (autoHideDelay && autoHideDelay > 0) {
        setTimeout(() => {
          setError((prev) => (prev ? { ...prev, isVisible: false } : null));
        }, autoHideDelay);
      }
    },
    [context, autoHideDelay, trackErrors]
  );

  const hideError = useCallback(() => {
    setError((prev) => (prev ? { ...prev, isVisible: false } : null));
    setTimeout(() => setError(null), 300); // Allow for fade animation
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error: error?.isVisible ? error : null,
    showError,
    hideError,
    clearError,
    isError: Boolean(error?.isVisible),
  };
}

// Hook for form validation errors
interface ValidationError {
  field: string;
  message: string;
  suggestion?: string;
}

export function useValidationErrors() {
  const [errors, setErrors] = useState<Record<string, ValidationError>>({});

  const setFieldError = useCallback((field: string, error: ValidationError | null) => {
    setErrors((prev) => {
      if (error === null) {
        const { [field]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [field]: error };
    });
  }, []);

  const setMultipleErrors = useCallback((newErrors: Record<string, ValidationError>) => {
    setErrors(newErrors);
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldError(field, null);
  }, [setFieldError]);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    setFieldError,
    setMultipleErrors,
    clearFieldError,
    clearAllErrors,
    hasErrors,
    getFieldError: (field: string) => errors[field] || null,
  };
}