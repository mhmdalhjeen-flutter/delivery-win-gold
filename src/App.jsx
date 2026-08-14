import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { CompanyProtectedRoute, DriverProtectedRoute } from './routes/ProtectedRoute';
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
import AssignedOrders from './pages/AssignedOrders';
import Notifications from './pages/Notifications';
import DriverRegister from './pages/DriverRegister';
import DriverHome from './pages/driver/DriverHome';
import DriverDeliveryDetail from './pages/driver/DriverDeliveryDetail';
import DriverHistory from './pages/driver/DriverHistory';
import DriverRegistrationPassword from './pages/DriverRegistrationPassword';
import DeliveryProofs from './pages/DeliveryProofs';
import PendingHandovers from './pages/PendingHandovers';
import CompanyBilling from './pages/CompanyBilling';

function AppRoutes() {
  const { isAuth, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuth ? <Navigate to={user?.role === 'delivery_driver' ? '/driver' : '/'} replace /> : <Login />}
      />
      <Route path="/register-driver" element={isAuth ? <Navigate to="/driver" replace /> : <DriverRegister />} />

      <Route path="/driver" element={<DriverProtectedRoute><DriverHome /></DriverProtectedRoute>} />
      <Route path="/driver/history" element={<DriverProtectedRoute><DriverHistory /></DriverProtectedRoute>} />
      <Route path="/driver/delivery/:assignmentId" element={<DriverProtectedRoute><DriverDeliveryDetail /></DriverProtectedRoute>} />
      <Route path="/driver/chat/:userId" element={<DriverProtectedRoute><Chat /></DriverProtectedRoute>} />

      <Route path="/" element={<CompanyProtectedRoute><Dashboard /></CompanyProtectedRoute>} />
      <Route path="/requests" element={<CompanyProtectedRoute><Requests /></CompanyProtectedRoute>} />
      <Route path="/requests/:requestId" element={<CompanyProtectedRoute><RequestDetails /></CompanyProtectedRoute>} />
      <Route path="/chat/:userId" element={<CompanyProtectedRoute><Chat /></CompanyProtectedRoute>} />
      <Route path="/chats" element={<CompanyProtectedRoute><Chats /></CompanyProtectedRoute>} />
      <Route path="/settings" element={<CompanyProtectedRoute><Settings /></CompanyProtectedRoute>} />
      <Route path="/pending-handovers" element={<CompanyProtectedRoute><PendingHandovers /></CompanyProtectedRoute>} />
      <Route path="/settings/billing" element={<CompanyProtectedRoute><CompanyBilling /></CompanyProtectedRoute>} />
      <Route path="/settings/company" element={<CompanyProtectedRoute><CompanyInfo /></CompanyProtectedRoute>} />
      <Route path="/settings/pricing" element={<CompanyProtectedRoute><Pricing /></CompanyProtectedRoute>} />
      <Route path="/settings/payment" element={<CompanyProtectedRoute><PaymentSettings /></CompanyProtectedRoute>} />
      <Route path="/settings/payment-methods" element={<Navigate to="/settings/payment" replace />} />
      <Route path="/settings/payment-accounts" element={<Navigate to="/settings/payment" replace />} />
      <Route path="/settings/regions" element={<CompanyProtectedRoute><Regions /></CompanyProtectedRoute>} />
      <Route path="/settings/drivers" element={<CompanyProtectedRoute><Drivers /></CompanyProtectedRoute>} />
      <Route path="/settings/driver-password" element={<CompanyProtectedRoute><DriverRegistrationPassword /></CompanyProtectedRoute>} />
      <Route path="/settings/chats" element={<Navigate to="/chats" replace />} />
      <Route path="/proofs" element={<CompanyProtectedRoute><DeliveryProofs /></CompanyProtectedRoute>} />
      <Route path="/assigned-orders" element={<CompanyProtectedRoute><AssignedOrders /></CompanyProtectedRoute>} />
      <Route path="/sent-orders" element={<CompanyProtectedRoute><SentOrders /></CompanyProtectedRoute>} />
      <Route path="/notifications" element={<CompanyProtectedRoute><Notifications /></CompanyProtectedRoute>} />

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
