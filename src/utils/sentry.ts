import * as Sentry from '@sentry/react';

export function initSentry() {
  // Only initialize in production
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      integrations: [
        Sentry.browserTracingIntegration(),
        Sentry.replayIntegration({
          // Capture replays on errors only in production to save quota
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      // Performance monitoring
      tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
      // Session replays
      replaysSessionSampleRate: 0.01, // 1% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
      
      beforeSend(event) {
        // Filter out non-critical errors
        if (event.exception?.values?.[0]?.type === 'ChunkLoadError') {
          return null; // Don't send chunk load errors (common in SPAs)
        }
        
        // Don't send network errors that are user-related
        if (event.exception?.values?.[0]?.value?.includes('NetworkError')) {
          return null;
        }
        
        return event;
      },
      
      // Set user context
      initialScope: {
        tags: {
          component: 'dietwise-app',
        },
      },
    });
  }
}

export const captureException = (error: Error, context?: Record<string, any>) => {
  if (import.meta.env.PROD) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('additional_info', context);
      }
      Sentry.captureException(error);
    });
  } else {
    // In development, just log to console
    console.error('Error captured:', error, context);
  }
};

export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
  if (import.meta.env.PROD) {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[${level.toUpperCase()}]`, message);
  }
};

// React Error Boundary using Sentry
export const SentryErrorBoundary = Sentry.withErrorBoundary;