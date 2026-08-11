import { Component, type ReactNode, type ErrorInfo } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

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
    console.error('BOXER//OS Uncaught Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-dvh bg-[#0b0d10] text-[#f0f2f5] flex items-center justify-center p-4">
          <div className="glass-card max-w-md w-full p-6 text-center space-y-4 border border-border-default">
            <div className="w-12 h-12 rounded-2xl bg-accent-red/15 text-accent-red flex items-center justify-center mx-auto glow-red">
              <AlertTriangle size={24} />
            </div>

            <h2 className="text-lg font-bold">BOXER<span className="text-accent-red">//</span>OS Recovery Mode</h2>

            <p className="text-xs text-text-secondary">
              The application encountered a startup issue. Tap below to reload or reset local cache.
            </p>

            {this.state.error && (
              <pre className="text-[0.625rem] bg-bg-secondary p-3 rounded-lg text-accent-gold text-left overflow-x-auto font-mono">
                {this.state.error.message}
              </pre>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => window.location.reload()}
                className="btn btn-primary flex-1 text-xs"
              >
                <RefreshCw size={14} /> Reload App
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="btn btn-secondary text-xs"
              >
                Reset Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
