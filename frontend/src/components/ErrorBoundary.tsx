import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React UI error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030305] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md p-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl">
            <h2 className="font-serif text-3xl text-white font-bold mb-4">CRYPTOSP UI Recovered</h2>
            <p className="text-sm text-neutral-400 mb-6 font-sans">
              The application encountered a transient interface state issue and gracefully recovered.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-neutral-200 transition-all text-sm"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
