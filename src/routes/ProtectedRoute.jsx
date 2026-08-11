import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BillingPaymentRejectedGate from '../components/BillingPaymentRejectedGate';

export function CompanyProtectedRoute({ children }) {
  const { isAuth, user } = useAuth();
  if (!isAuth) return <Navigate to="/login" replace />;
  if (user?.role === 'delivery_driver') return <Navigate to="/driver" replace />;
  return <BillingPaymentRejectedGate>{children}</BillingPaymentRejectedGate>;
}

export function DriverProtectedRoute({ children }) {
  const { isAuth, user } = useAuth();
  if (!isAuth) return <Navigate to="/login" replace />;
  if (user?.role !== 'delivery_driver') return <Navigate to="/" replace />;
  return children;
}

export default CompanyProtectedRoute;
