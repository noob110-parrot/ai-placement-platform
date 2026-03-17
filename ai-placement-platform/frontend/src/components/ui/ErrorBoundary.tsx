"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props  { children: ReactNode; fallback?: ReactNode; }
interface State  { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex flex-col items-center justify-center min-h-64 text-center p-8">
          <div className="w-14 h-14 rounded-2xl bg-red-400/10 flex items-center justify-center mb-4">
            <AlertTriangle size={26} className="text-red-400" />
          </div>
          <h3 className="text-white font-semibold mb-2">Something went wrong</h3>
          <p className="text-text-muted text-sm mb-2 max-w-sm">
            {this.state.error?.message || "An unexpected error occurred."}
          </p>
          <p className="text-text-muted text-xs mb-5 font-mono max-w-sm truncate opacity-60">
            {this.state.error?.stack?.split("\n")[1]}
          </p>
          <button
            onClick={this.reset}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium rounded-xl transition-colors">
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* Lightweight page-level 404 / not-found helper */
export function NotFound({ title = "Page Not Found", message = "The page you're looking for doesn't exist." }: {
  title?: string; message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-surface-DEFAULT">
      <p className="text-8xl font-extrabold text-gradient mb-4">404</p>
      <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
      <p className="text-text-muted mb-8">{message}</p>
      <a href="/dashboard" className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-colors">
        Back to Dashboard
      </a>
    </div>
  );
}
