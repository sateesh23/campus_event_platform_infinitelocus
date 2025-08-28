import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="container">
          <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
            <h2 style={{ color: '#dc3545', marginBottom: '16px' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </button>
            
            {process.env.NODE_ENV === 'development' && (
              <details style={{ marginTop: '20px', textAlign: 'left' }}>
                <summary style={{ cursor: 'pointer', color: '#666' }}>
                  Error Details (Development)
                </summary>
                <pre style={{ 
                  marginTop: '10px', 
                  padding: '10px', 
                  backgroundColor: '#f8f9fa', 
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px'
                }}>
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
