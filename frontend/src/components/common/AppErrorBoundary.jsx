import React, { Component } from "react";

export class AppErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
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
            <button
              className="primary"
              onClick={() => {
                this.setState({ failed: false });
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
