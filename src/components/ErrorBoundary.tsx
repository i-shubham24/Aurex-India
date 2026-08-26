import { Component, type ReactNode } from "react";

/**
 * Catches render errors so a transient failure shows a recoverable message
 * instead of a blank white screen.
 */
export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-6 text-center">
          <p className="font-serif text-5xl font-semibold text-copper">Oops</p>
          <h1 className="mt-3 text-xl font-semibold text-ink">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-ink/60">
            {this.state.error.message}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-copper mt-6"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
