import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Car, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../lib/apiUrl';

export default function DriverRegister() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState('password');
  const [registrationPassword, setRegistrationPassword] = useState('');
  const [registrationToken, setRegistrationToken] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verifyPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/auth/delivery/driver/verify-password`, {
        registrationPassword,
      });
      setRegistrationToken(data.registrationToken);
      setCompanyName(data.companyName || '');
      setStep('register');
    } catch (err) {
      setError(err.response?.data?.message || 'كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  const register = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/auth/delivery/driver/register`, {
        registrationToken,
        name,
        phone,
        password,
        confirmPassword,
      });
      login(data);
      navigate('/driver', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'تعذّر إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page login-page--driver">
      <div className="login-card">
        <div className="login-card__icon"><Car size={32} /></div>
        <h1>تسجيل سائق</h1>
        <p>
          {step === 'password'
            ? 'أدخل كلمة مرور تسجيل السائقين من شركتك'
            : `التسجيل في ${companyName || 'شركة التوصيل'}`}
        </p>

        {step === 'password' ? (
          <form onSubmit={verifyPassword} className="login-form">
            <label>
              <span>كلمة مرور التسجيل</span>
              <input
                value={registrationPassword}
                onChange={(e) => setRegistrationPassword(e.target.value)}
                required
                autoFocus
                placeholder="مثل كلمة مرور الواي فاي"
              />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn-primary btn-primary--block" disabled={loading}>
              {loading ? <Loader2 size={18} className="spin" /> : null}
              متابعة
            </button>
          </form>
        ) : (
          <form onSubmit={register} className="login-form">
            <label>
              <span>الاسم الكامل</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              <span>رقم الهاتف</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} required dir="ltr" inputMode="tel" />
            </label>
            <label>
              <span>كلمة المرور</span>
              <div className="login-password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
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
              />
            </label>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn-primary btn-primary--block" disabled={loading}>
              {loading ? <Loader2 size={18} className="spin" /> : null}
              إنشاء حساب سائق
            </button>
            <button type="button" className="btn-ghost btn-primary--block" onClick={() => setStep('password')}>
              رجوع
            </button>
          </form>
        )}

        <button type="button" className="login-mode-switch" onClick={() => navigate('/login')}>
          العودة لتسجيل الدخول
        </button>
      </div>
    </div>
  );
}
