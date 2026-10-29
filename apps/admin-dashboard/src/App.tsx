import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { Facilities } from './pages/Facilities';
import { ForecastAnalytics } from './pages/ForecastAnalytics';
import { Reservations } from './pages/Reservations';
import { Incidents } from './pages/Incidents';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Overview />} />
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/forecasts" element={<ForecastAnalytics />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/incidents" element={<Incidents />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};
