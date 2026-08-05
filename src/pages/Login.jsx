import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../lib/apiUrl';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [mode, setMode] = useState('activate');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
  }, [mode]);

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
      login(data);
      navigate('/', { replace: true });
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
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        identifier: phone,
        password,
        appType: 'delivery',
      });
      login(data);
      navigate('/', { replace: true });
    } catch (err) {
      if (err.response?.data?.code === 'PORTAL_NOT_ACTIVATED') {
        setError('الحساب لم يُفعّل بعد — استخدم شاشة التفعيل');
      } else {
        setError(err.response?.data?.message || 'تعذّر تسجيل الدخول');
      }
    } finally {
      setLoading(false);
    }
  };

  const isActivate = mode === 'activate';

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__icon"><Building2 size={32} /></div>
        <h1>بوابة شركة التوصيل</h1>
        <p>{isActivate ? 'فعّل حساب شركتك لأول مرة' : 'سجّل دخول شركتك'}</p>

        <form onSubmit={isActivate ? handleActivate : handleLogin} className="login-form">
          <label>
            <span>رقم الهاتف</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
              dir="ltr"
              inputMode="tel"
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
                  <button type="button" className="login-password-field__toggle" onClick={() => setShowPassword((v) => !v)} aria-label="إظهار كلمة المرور">
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
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="login-password-field__toggle" onClick={() => setShowPassword((v) => !v)} aria-label="إظهار كلمة المرور">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
          )}

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn-primary btn-primary--block" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : null}
            {isActivate ? 'تفعيل الحساب' : 'دخول'}
          </button>
        </form>

        <button
          type="button"
          className="login-mode-switch"
          onClick={() => setMode(isActivate ? 'login' : 'activate')}
        >
          {isActivate ? 'لدي حساب — تسجيل الدخول' : 'أول مرة؟ فعّل حسابك'}
        </button>
      </div>
    </div>
  );
}
