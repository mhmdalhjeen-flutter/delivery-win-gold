import React from 'react';

export default function QueryErrorState({ message = 'تعذّر تحميل البيانات', onRetry }) {
  return (
    <div className="query-error-state">
      <p className="query-error-state__message">{message}</p>
      {onRetry ? (
        <button type="button" className="btn-secondary" onClick={onRetry}>
          إعادة المحاولة
        </button>
      ) : null}
    </div>
  );
}
