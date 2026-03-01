import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * Catches runtime errors (e.g. Firestore internal assertion) and shows a recovery UI
 * instead of a white screen. Known issue: Firestore SDK race on listener cleanup.
 */
class ErrorBoundaryClass extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          onRetry={this.handleRetry}
          message={this.props.message}
        />
      );
    }
    return this.props.children;
  }
}

function ErrorFallback({ onRetry, message }) {
  const { t } = useLanguage();
  const msg = message || t('errorBoundary.message');
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
        <p className="text-gray-700 mb-4">{msg}</p>
        <button
          type="button"
          onClick={onRetry}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          {t('errorBoundary.refresh')}
        </button>
      </div>
    </div>
  );
}

export default function ErrorBoundary({ children, message }) {
  return (
    <ErrorBoundaryClass message={message}>
      {children}
    </ErrorBoundaryClass>
  );
}
