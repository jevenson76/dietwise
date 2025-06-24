import React, { Component, ErrorInfo, ReactNode } from 'react';
import Alert from './Alert'; // Reusing Alert for consistent styling

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
    console.error("Uncaught error:", error, errorInfo);
    }
    this.setState({ error, errorInfo });
    // You could also log the error to an error reporting service here
    // trackEvent('react_error_boundary_triggered', { 
    //   message: error.message, 
    //   componentStack: errorInfo.componentStack 
    // });
  }

  private handleReload = () => {
    window.location.reload();
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-bg-default p-4 text-text-default">
            <div className="bg-bg-card p-8 rounded-xl shadow-2xl max-w-lg w-full text-center">
                <i className="fas fa-bug text-5xl text-red-500 dark:text-red-400 mb-6"></i>
                <h1 className="text-2xl font-bold text-text-default mb-3">Oops! Something went wrong.</h1>
                <p className="text-text-alt mb-6">
                    We're sorry for the inconvenience. Our team has been notified of this issue. 
                    Please try reloading the page.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                    <div className="my-4 text-left text-xs bg-slate-100 dark:bg-slate-700 p-3 rounded overflow-auto max-h-40 custom-scrollbar">
                        <p className="font-semibold">Error: {this.state.error.message}</p>
                        {this.state.errorInfo && <pre className="whitespace-pre-wrap mt-1">{this.state.errorInfo.componentStack}</pre>}
                    </div>
                )}
                <button
                    onClick={this.handleReload}
                    className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all"
                >
                    <i className="fas fa-sync-alt mr-2"></i>Reload Page
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;