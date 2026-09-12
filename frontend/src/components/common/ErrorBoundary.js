import { Component } from 'react';
export default class ErrorBoundary extends Component {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  componentDidCatch(error) {
    console.error('InternTrack encountered an unexpected error:', error);
  }
  render() {
    if (this.state.error)
      return (
        <main className="container public-page">
          <div className="empty-state">
            <h1>Let’s try that again.</h1>
            <p>
              Something interrupted your workspace. Your saved demo data is still in this
              browser.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.assign('/')}
            >
              Return home
            </button>
          </div>
        </main>
      );
    return this.props.children;
  }
}
