import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppNavbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboard from './pages/CitizenDashboard';
import ServiceSelection from './pages/ServiceSelection';
import DigitalToken from './pages/DigitalToken';
import LiveQueueTracking from './pages/LiveQueueTracking';
import NotificationSettings from './pages/NotificationSettings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQueueManagement from './pages/admin/AdminQueueManagement';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <AppNavbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/queue/:officeId" element={<LiveQueueTracking />} />

              {/* Citizen Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<CitizenDashboard />} />
                <Route path="/book" element={<ServiceSelection />} />
                <Route path="/token/:id" element={<DigitalToken />} />
                <Route path="/settings/notifications" element={<NotificationSettings />} />
              </Route>

              {/* Admin Protected Routes */}
              <Route element={<ProtectedRoute adminOnly={true} />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/queue/:officeId" element={<AdminQueueManagement />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="py-3 bg-dark text-white text-center small opacity-75 mt-auto">
            <div className="container">
              TN Smart Queue © {new Date().getFullYear()} — Predictive Crowd Management & Resource Allocation
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
