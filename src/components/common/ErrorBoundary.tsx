import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

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
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 text-center shadow-2xl">
            <div className="w-14 h-14 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/30">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-white mb-2">
              Si è verificato un errore
            </h2>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              L'applicazione ha rilevato un problema imprevisto durante la visualizzazione. Clicca sul pulsante in basso per ricaricare la schermata.
            </p>
            {this.state.error && (
              <pre className="text-[10px] text-red-300 bg-slate-950/70 p-3 rounded-xl overflow-x-auto text-left mb-4 max-h-32 font-mono">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Ricarica Applicazione</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
