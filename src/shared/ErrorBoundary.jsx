import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div dir="rtl" className="error-boundary">
          <div className="error-boundary__card">
            <h1>حدث خطأ غير متوقع</h1>
            <p>
              {this.props.fallbackMessage || 'تعذّر عرض الصفحة. يمكنك إعادة المحاولة أو تحديث التطبيق.'}
            </p>
            <div className="error-boundary__actions">
              <button type="button" className="btn-primary" onClick={this.handleRetry}>
                إعادة المحاولة
              </button>
              <button type="button" className="btn-secondary" onClick={this.handleReload}>
                تحديث الصفحة
              </button>
              {this.props.homePath ? (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => window.location.assign(this.props.homePath)}
                >
                  {this.props.homeLabel || 'العودة للرئيسية'}
                </button>
              ) : null}
            </div>
            <details className="error-boundary__details">
              <summary>تفاصيل الخطأ</summary>
              <pre>{error?.message || String(error)}</pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
