import React, { Component } from "react";

export class AppErrorBoundary extends Component {
  state = { failed: false, error: null };

  static getDerivedStateFromError(error) {
    return { failed: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("AppErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="app-recovery">
          <div className="panel">
            <p className="eyebrow">RECOVERY MODE</p>
            <h1>We could not load this view.</h1>
            <p>
              Your session is still safe. Return to the dashboard to retry
              without signing in again.
            </p>
            {this.state.error && (
              <details
                style={{
                  textAlign: "left",
                  margin: "1rem 0",
                  color: "#e53e3e",
                  fontSize: "0.85rem",
                  background: "#fff5f5",
                  padding: "0.75rem",
                  borderRadius: "6px",
                  border: "1px solid #feb2b2",
                }}
              >
                <summary style={{ cursor: "pointer", fontWeight: 600 }}>
                  Diagnostic Information
                </summary>
                <pre
                  style={{
                    whiteSpace: "pre-wrap",
                    marginTop: "0.5rem",
                    color: "#2d3748",
                    fontSize: "0.8rem",
                  }}
                >
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
            <button
              className="primary"
              onClick={() => {
                this.setState({ failed: false, error: null });
                window.location.assign("/");
              }}
            >
              Return home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default AppErrorBoundary;
