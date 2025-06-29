import React, { Component, ErrorInfo, ReactNode } from 'react';
import Alert from './Alert'; // Reusing Alert for consistent styling
import ErrorMessage from './ErrorMessage';
import { trackEvent } from '@services/analyticsService';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV !== 'production') {
      if (process.env.NODE_ENV !== 'production') {
      console.error("Uncaught error:", error, errorInfo);
      }
    }
    this.setState({ error, errorInfo });
    // Log the error to analytics
    trackEvent('react_error_boundary_triggered', { 
      message: error.message, 
      componentStack: errorInfo.componentStack?.substring(0, 500) // Limit stack trace length
    });
  }

  private handleReload = () => {
    window.location.reload();
  }

  private handleGoHome = () => {
    window.location.href = '/';
  }

  private handleReportIssue = () => {
    const subject = encodeURIComponent('Error Report - DietWise');
    const body = encodeURIComponent(`I encountered an error:\n\nError: ${this.state.error?.message || 'Unknown error'}\n\nSteps to reproduce:\n1. \n2. \n\nExpected behavior:\n\n\nActual behavior:\n\n`);
    window.location.href = `mailto:support@dietwise.app?subject=${subject}&body=${body}`;
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-bg-default p-4">
          <div className="max-w-lg w-full">
            <ErrorMessage
              title="Application Error"
              message="We encountered an unexpected problem. Don't worry - your data is safe, and we're working on fixing this."
              details={process.env.NODE_ENV === 'development' ? this.state.error?.message : undefined}
              suggestions={[
                'Try refreshing the page to resolve temporary issues',
                'Go back to the home page and try again',
                'Clear your browser cache if the problem persists',
                'Report this issue if it continues happening',
              ]}
              actions={[
                {
                  label: 'Reload Page',
                  action: this.handleReload,
                  icon: 'fas fa-sync-alt',
                },
                {
                  label: 'Go to Home',
                  action: this.handleGoHome,
                  icon: 'fas fa-home',
                  variant: 'secondary',
                },
                {
                  label: 'Report Issue',
                  action: this.handleReportIssue,
                  icon: 'fas fa-bug',
                  variant: 'secondary',
                },
              ]}
              errorCode={process.env.NODE_ENV === 'development' ? 'REACT_ERROR_BOUNDARY' : undefined}
            />
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Component Stack:
                </h4>
                <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-40 custom-scrollbar">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;