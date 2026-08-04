import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../lib/apiUrl';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, {
        identifier,
        password,
        appType: 'delivery',
      });
      login(data);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'تعذّر تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__icon"><Building2 size={32} /></div>
        <h1>بوابة شركة التوصيل</h1>
        <p>سجّل دخول شركتك لإدارة طلبات التوصيل</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            <span>الهاتف أو البريد</span>
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoComplete="username"
              dir="ltr"
            />
          </label>
          <label>
            <span>كلمة المرور</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn-primary btn-primary--block" disabled={loading}>
            {loading ? <Loader2 size={18} className="spin" /> : null}
            دخول
          </button>
        </form>
      </div>
    </div>
  );
}
