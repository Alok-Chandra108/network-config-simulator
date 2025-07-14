// client/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom'; // Import Outlet for nested routes
import { useAuth } from './contexts/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import HomePage from './pages/HomePage';
import DeviceDetailPage from './pages/DeviceDetailPage';
import AddDevicePage from './pages/AddDevicePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import AdminDashboardPage from './pages/AdminDashboardPage';


import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LoadingSpinner from './components/common/LoadingSpinner';

// PrivateRoute Component: Protects routes that require authentication AND specific roles
const PrivateRoute = ({ allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />; // Show spinner during initial authentication check
  }

  // If user is not authenticated, redirect to the login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles are specified, check if the user has at least one of them
  if (allowedRoles && allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some(role => user?.roles?.includes(role)); // Check if user has ANY of the allowed roles
    if (!hasRequiredRole) {
      // If authenticated but doesn't have the required role, redirect to unauthorized page
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If authenticated and has required roles (or no roles were specified for this route), render the children
  return <Outlet />; // Use Outlet for nested routes pattern
};

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />

          {/* Protected Routes - Now using nested routes with PrivateRoute */}
          {/* Example: All users (admin, user, viewer) can see HomePage and DeviceDetailPage */}
          <Route element={<PrivateRoute allowedRoles={['admin', 'user', 'viewer']} />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/device/:id" element={<DeviceDetailPage />} />
          </Route>

          {/* Example: Only Admin and regular Users can add devices */}
          <Route element={<PrivateRoute allowedRoles={['admin', 'user']} />}>
            <Route path="/device/add" element={<AddDevicePage />} />
          </Route>

          {/* Example: Admin-only route */}
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          </Route>

        </Routes>
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}

export default App;