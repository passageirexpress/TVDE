import React, { useEffect } from 'react';
import { 
  Routes, 
  Route, 
  BrowserRouter,
  Navigate
} from 'react-router-dom';
import { FileText, BarChart3, PieChart, Download } from 'lucide-react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Drivers from './pages/Drivers';
import Vehicles from './pages/Vehicles';
import Finance from './pages/Finance';
import Users from './pages/Users';
import Reports from './pages/Reports';
import DriverPanel from './pages/DriverPanel';
import Profile from './pages/Profile';
import Expenses from './pages/Expenses';
import Rentals from './pages/Rentals';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import { useAuthStore } from './store/useAuthStore';
import { useDataStore } from './store/useDataStore';
import { checkDocumentExpirations, checkRentalExpirations } from './services/notificationService';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const user = useAuthStore(state => state.user);
  const loading = useAuthStore(state => state.loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
        <div className="w-8 h-8 border-4 border-sidebar border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const HomeRedirect = () => {
  const user = useAuthStore(state => state.user);
  if (user?.role === 'driver') {
    return <Navigate to="/driver-panel" replace />;
  }
  return <Dashboard />;
};

export default function App() {
  const setUser = useAuthStore(state => state.setUser);
  const setLoading = useAuthStore(state => state.setLoading);
  const { drivers, vehicles, rentals, addNotification, notifications } = useDataStore();

  useEffect(() => {
    // Simulate checking session
    setTimeout(() => {
      setLoading(false);
      // Check for document expirations
      checkDocumentExpirations(drivers, vehicles, addNotification, notifications);
      checkRentalExpirations(rentals, vehicles, drivers, addNotification, notifications);
    }, 500);
  }, [drivers, vehicles, rentals, addNotification, notifications]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<HomeRedirect />} />
          <Route path="drivers" element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'finance']}>
              <Drivers />
            </ProtectedRoute>
          } />
          <Route path="vehicles" element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'finance']}>
              <Vehicles />
            </ProtectedRoute>
          } />
          <Route path="finance" element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'finance']}>
              <Finance />
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Users />
            </ProtectedRoute>
          } />
          <Route path="reports" element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'finance']}>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="driver-panel" element={
            <ProtectedRoute allowedRoles={['driver']}>
              <DriverPanel />
            </ProtectedRoute>
          } />
          <Route path="profile" element={<Profile />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="rentals" element={<Rentals />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Settings />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

