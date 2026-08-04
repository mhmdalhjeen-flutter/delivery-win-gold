import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Trips from './pages/Trips';
import TripDetails from './pages/TripDetails';
import History from './pages/History';
import Chat from './pages/Chat';

function AppRoutes() {
  const { isAuth } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuth ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
      <Route path="/trips/:tripId" element={<ProtectedRoute><TripDetails /></ProtectedRoute>} />
      <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/chat/:userId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
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
