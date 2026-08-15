export default function LoginRateLimitBanner({
  isRateLimited,
  formattedRemaining,
  showRetryReady = false,
}) {
  if (isRateLimited) {
    return (
      <div className="login-rate-limit" role="status" aria-live="polite">
        <p className="login-rate-limit__title">محاولات تسجيل دخول كثيرة</p>
        <p className="login-rate-limit__text">
          لأمان حسابك، يرجى الانتظار قبل إعادة المحاولة.
        </p>
        <p className="login-rate-limit__label">يمكنك المحاولة مرة أخرى بعد:</p>
        <p
          className="login-rate-limit__timer"
          aria-label={`الوقت المتبقي ${formattedRemaining}`}
        >
          {formattedRemaining}
        </p>
      </div>
    );
  }

  if (showRetryReady) {
    return (
      <p className="login-rate-limit-ready" role="status">
        يمكنك المحاولة الآن
      </p>
    );
  }

  return null;
}
