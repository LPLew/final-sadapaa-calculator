
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
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service or console
    console.error("Uncaught error in React component tree:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      const isDevelopment = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development';
      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px',
          color: '#333', 
          backgroundColor: '#ffe0e0', 
          border: '1px solid #d9534f',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <h1 style={{ color: '#d9534f', fontSize: '1.5em' }}>Oops! Something went wrong.</h1>
          <p style={{ marginTop: '10px' }}>The calculator encountered an unexpected issue. Please try refreshing the page.</p>
          {isDevelopment && this.state.error && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '15px', textAlign: 'left', backgroundColor: '#f9f9f9', padding: '10px', borderRadius: '4px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Error Details (Development Mode)</summary>
              <p style={{marginTop: '5px'}}><strong>Message:</strong> {this.state.error.toString()}</p>
              {this.state.errorInfo && this.state.errorInfo.componentStack && (
                <>
                  <p style={{marginTop: '5px'}}><strong>Component Stack:</strong></p>
                  <pre style={{ 
                    fontSize: '0.8em', 
                    color: '#555', 
                    maxHeight: '200px', 
                    overflowY: 'auto', 
                    border: '1px solid #eee',
                    padding: '5px'
                  }}>{this.state.errorInfo.componentStack}</pre>
                </>
              )}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
