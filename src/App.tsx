import React, { useEffect } from 'react';
import { 
  Routes, 
  Route, 
  BrowserRouter,
  Navigate
} from 'react-router-dom';
import { FileText, BarChart3, PieChart, Download } from 'lucide-react';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Performance from './pages/Performance';
import Fleet from './pages/Fleet';
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
import Subscription from './pages/Subscription';
import MasterSubscriptions from './pages/MasterSubscriptions';
import MasterSettings from './pages/MasterSettings';
import Contracts from './pages/Contracts';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Companies from './pages/Companies';
import Maintenance from './pages/Maintenance';
import Claims from './pages/Claims';
import Chat from './pages/Chat';
import Affiliates from './pages/Affiliates';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
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

  if (allowedRoles && user.role !== 'master' && !allowedRoles.includes(user.role)) {
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
  const user = useAuthStore(state => state.user);
  const setUser = useAuthStore(state => state.setUser);
  const setLoading = useAuthStore(state => state.setLoading);
  const initializeAuth = useAuthStore(state => state.initialize);
  const { drivers, vehicles, rentals, addNotification, notifications, rehydrateData } = useDataStore();

  useEffect(() => {
    initializeAuth();
    rehydrateData();
  }, [initializeAuth, rehydrateData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      // Check for document expirations
      checkDocumentExpirations(drivers, vehicles, addNotification, notifications);
      checkRentalExpirations(rentals, vehicles, drivers, addNotification, notifications);
    }, 500);
    return () => clearTimeout(timer);
  }, [drivers, vehicles, rentals, addNotification, notifications, setLoading]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<HomeRedirect />} />
          <Route path="performance" element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'finance']}>
              <Performance />
            </ProtectedRoute>
          } />
          <Route path="fleet" element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'finance']}>
              <Fleet />
            </ProtectedRoute>
          } />
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
          <Route path="maintenance" element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'finance']}>
              <Maintenance />
            </ProtectedRoute>
          } />
          <Route path="contracts" element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'finance']}>
              <Contracts />
            </ProtectedRoute>
          } />
          <Route path="claims" element={<Claims />} />
          <Route path="chat" element={<Chat />} />
          <Route path="affiliates" element={
            <ProtectedRoute allowedRoles={['master']}>
              <Affiliates />
            </ProtectedRoute>
          } />
          <Route path="finance" element={
            <ProtectedRoute allowedRoles={['admin', 'manager', 'finance']}>
              <Finance />
            </ProtectedRoute>
          } />
          <Route path="companies" element={
            <ProtectedRoute allowedRoles={['master']}>
              <Companies />
            </ProtectedRoute>
          } />
          <Route path="users" element={
            <ProtectedRoute allowedRoles={['admin', 'master']}>
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
          <Route path="subscription" element={user?.role === 'master' ? <MasterSubscriptions /> : <Subscription />} />
          <Route path="settings" element={
            <ProtectedRoute allowedRoles={['admin', 'master']}>
              {user?.role === 'master' ? <MasterSettings /> : <Settings />}
            </ProtectedRoute>
          } />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

