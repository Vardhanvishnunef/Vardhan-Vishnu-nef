
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '2rem', fontFamily: 'monospace', backgroundColor: '#fef2f2', color: '#991b1b', height: '100vh', overflow: 'auto' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Something went wrong</h1>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>See error details</summary>
                        <div style={{ padding: '1rem', backgroundColor: '#fff', border: '1px solid #f87171', borderRadius: '0.5rem' }}>
                            <p style={{ fontWeight: 'bold' }}>{this.state.error && this.state.error.toString()}</p>
                            <br />
                            <p>Stack Trace:</p>
                            <p>{this.state.errorInfo && this.state.errorInfo.componentStack}</p>
                        </div>
                    </details>
                    <button
                        onClick={() => window.location.reload()}
                        style={{ marginTop: '2rem', padding: '0.5rem 1rem', backgroundColor: '#991b1b', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
