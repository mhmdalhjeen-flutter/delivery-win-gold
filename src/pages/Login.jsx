import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, Car, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../lib/apiUrl';
import { useLoginRateLimitCooldown } from '../hooks/useLoginRateLimitCooldown';
import LoginRateLimitBanner from '../components/LoginRateLimitBanner';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [portal, setPortal] = useState('company');
  const [mode, setMode] = useState('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const loginInFlight = useRef(false);
  const {
    isRateLimited,
    formattedRemaining,
    showRetryReady,
    startFromError,
    dismissRetryReady,
  } = useLoginRateLimitCooldown();
  const busy = loading || isRateLimited;

  useEffect(() => {
    setError('');
  }, [mode, portal]);

  const afterLogin = (data) => {
    login(data);
    if (data.user?.role === 'delivery_driver') {
      navigate('/driver', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleActivate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/auth/delivery/activate`, {
        phone,
        password,
        confirmPassword,
      });
      afterLogin(data);
    } catch (err) {
      if (err.response?.data?.code === 'ALREADY_ACTIVATED') {
        setError('الحساب مفعّل مسبقاً — استخدم «لدي حساب»');
      } else {
        setError(err.response?.data?.message || 'تعذّر تفعيل الحساب');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (isRateLimited || loginInFlight.current) return;

    dismissRetryReady();
    loginInFlight.current = true;
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        identifier: phone,
        password,
        appType: 'delivery',
      });
      afterLogin(data);
    } catch (err) {
      if (err.response?.status === 429) {
        startFromError(err);
        return;
      }
      if (err.response?.data?.code === 'PORTAL_NOT_ACTIVATED') {
        setError('الحساب لم يُفعّل بعد — استخدم شاشة التفعيل');
      } else {
        setError(err.response?.data?.message || 'تعذّر تسجيل الدخول');
      }
    } finally {
      loginInFlight.current = false;
      setLoading(false);
    }
  };

  const isCompany = portal === 'company';
  const isActivate = mode === 'activate';

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__icon">
          {isCompany ? <Building2 size={32} /> : <Car size={32} />}
        </div>
        <h1>{isCompany ? 'بوابة شركة التوصيل' : 'تطبيق السائق'}</h1>
        <p>
          {isCompany
            ? (isActivate ? 'فعّل حساب شركتك لأول مرة' : 'سجّل دخول شركتك')
            : 'سجّل دخولك لعرض التوصيلات المعيّنة لك'}
        </p>

        <div className="login-portal-tabs">
          <button
            type="button"
            className={`filter-chip${isCompany ? ' filter-chip--active' : ''}`}
            onClick={() => setPortal('company')}
          >
            شركة التوصيل
          </button>
          <button
            type="button"
            className={`filter-chip${!isCompany ? ' filter-chip--active' : ''}`}
            onClick={() => setPortal('driver')}
          >
            سائق
          </button>
        </div>

        {isCompany ? (
          <form onSubmit={isActivate ? handleActivate : handleLogin} className="login-form">
            <LoginRateLimitBanner
              isRateLimited={isRateLimited}
              formattedRemaining={formattedRemaining}
              showRetryReady={showRetryReady && !isActivate}
            />

            <label>
              <span>رقم الهاتف</span>
              <input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  dismissRetryReady();
                }}
                required
                autoComplete="tel"
                dir="ltr"
                inputMode="tel"
                disabled={!isActivate && busy}
              />
            </label>

            {isActivate && (
              <>
                <label>
                  <span>كلمة المرور الجديدة</span>
                  <div className="login-password-field">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                    <button type="button" className="login-password-field__toggle" onClick={() => setShowPassword((v) => !v)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>
                <label>
                  <span>تأكيد كلمة المرور</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                  />
                </label>
              </>
            )}

            {!isActivate && (
              <label>
                <span>كلمة المرور</span>
                <div className="login-password-field">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      dismissRetryReady();
                    }}
                    required
                    autoComplete="current-password"
                    disabled={busy}
                  />
                  <button type="button" className="login-password-field__toggle" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </label>
            )}

            {error && !isRateLimited && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="btn-primary btn-primary--block"
              disabled={isActivate ? loading : busy}
            >
              {loading ? <Loader2 size={18} className="spin" /> : null}
              {isActivate
                ? 'تفعيل الحساب'
                : isRateLimited
                  ? `انتظر ${formattedRemaining}`
                  : 'دخول'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="login-form">
            <LoginRateLimitBanner
              isRateLimited={isRateLimited}
              formattedRemaining={formattedRemaining}
              showRetryReady={showRetryReady}
            />

            <label>
              <span>رقم الهاتف</span>
              <input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  dismissRetryReady();
                }}
                required
                dir="ltr"
                inputMode="tel"
                disabled={busy}
              />
            </label>
            <label>
              <span>كلمة المرور</span>
              <div className="login-password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    dismissRetryReady();
                  }}
                  required
                  autoComplete="current-password"
                  disabled={busy}
                />
                <button type="button" className="login-password-field__toggle" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
            {error && !isRateLimited && <p className="form-error">{error}</p>}
            <button type="submit" className="btn-primary btn-primary--block" disabled={busy}>
              {loading ? <Loader2 size={18} className="spin" /> : null}
              {isRateLimited ? `انتظر ${formattedRemaining}` : 'دخول'}
            </button>
            <Link to="/register-driver" className="btn-secondary btn-primary--block login-register-link">
              تسجيل سائق جديد
            </Link>
          </form>
        )}

        {isCompany && (
          <button
            type="button"
            className="login-mode-switch"
            onClick={() => setMode(isActivate ? 'login' : 'activate')}
          >
            {isActivate ? 'لدي حساب — تسجيل الدخول' : 'أول مرة؟ فعّل حسابك'}
          </button>
        )}
      </div>
    </div>
  );
}
