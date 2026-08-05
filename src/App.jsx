import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Requests from './pages/Requests';
import RequestDetails from './pages/RequestDetails';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import CompanyInfo from './pages/CompanyInfo';
import Pricing from './pages/Pricing';
import PaymentSettings from './pages/PaymentSettings';
import Regions from './pages/Regions';
import Drivers from './pages/Drivers';
import Chats from './pages/Chats';
import SentOrders from './pages/SentOrders';
import Notifications from './pages/Notifications';

function AppRoutes() {
  const { isAuth } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuth ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/requests" element={<ProtectedRoute><Requests /></ProtectedRoute>} />
      <Route path="/requests/:requestId" element={<ProtectedRoute><RequestDetails /></ProtectedRoute>} />
      <Route path="/chat/:userId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/chats" element={<ProtectedRoute><Chats /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/settings/company" element={<ProtectedRoute><CompanyInfo /></ProtectedRoute>} />
      <Route path="/settings/pricing" element={<ProtectedRoute><Pricing /></ProtectedRoute>} />
      <Route path="/settings/payment" element={<ProtectedRoute><PaymentSettings /></ProtectedRoute>} />
      <Route path="/settings/payment-methods" element={<Navigate to="/settings/payment" replace />} />
      <Route path="/settings/payment-accounts" element={<Navigate to="/settings/payment" replace />} />
      <Route path="/settings/regions" element={<ProtectedRoute><Regions /></ProtectedRoute>} />
      <Route path="/settings/drivers" element={<ProtectedRoute><Drivers /></ProtectedRoute>} />
      <Route path="/settings/chats" element={<Navigate to="/chats" replace />} />
      <Route path="/sent-orders" element={<ProtectedRoute><SentOrders /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/trips" element={<Navigate to="/requests" replace />} />
      <Route path="/trips/:tripId" element={<Navigate to="/requests" replace />} />
      <Route path="/history" element={<Navigate to="/requests?status=delivered" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
