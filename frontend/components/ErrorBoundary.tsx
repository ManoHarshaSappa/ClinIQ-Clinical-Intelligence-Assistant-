"use client";

import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Patient navigation error caught:', error, errorInfo);

    // Clear any stale cache that might be causing issues
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('patient-cache');
        sessionStorage.clear();
      } catch (e) {
        console.warn('Cache clear failed:', e);
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6 text-center">
            <div className="text-blue-600 font-medium mb-2 text-sm md:text-base">
              Navigation Issue Detected
            </div>
            <div className="text-blue-700 text-xs md:text-sm mb-4">
              This can happen due to browser extensions or caching. Try refreshing the page.
            </div>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="bg-blue-600 text-white px-4 py-2.5 md:py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors touch-target"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}