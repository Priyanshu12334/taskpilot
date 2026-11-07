import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loader from './components/Loader';
import { useAuth } from './context/AuthContext';
import { isApprovalPending } from './utils/roleUtils';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/Settings'));
const Chat = lazy(() => import('./pages/Chat'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AccessRestricted = lazy(() => import('./pages/AccessRestricted'));
const PendingApproval = lazy(() => import('./pages/PendingApproval'));
const AccountBlocked = lazy(() => import('./pages/AccountBlocked'));
const ContactUs = lazy(() => import('./pages/ContactUs'));

// Protects routes for authenticated users only
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader message="Authenticating..." />;
  if (!user) return <Navigate to="/login" replace />;

  // Redirect blocked users to the blocked page
  if (user.status === 'blocked') return <Navigate to="/blocked" replace />;
  
  // Safe role check to prevent component crashes on initial render
  if (!user.role) return <Loader message="Syncing role permissions..." />;
  
  return children;
};

// Protects routes for Admin role only
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader message="Authenticating..." />;
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role?.toLowerCase() === 'admin') return children;
  return <Navigate to="/dashboard" replace />;
};

// Protects Chat route — requires Admin OR member/chat permission
const ChatRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader message="Verifying Access..." />;
  if (!user) return <Navigate to="/login" replace />;
  
  const role = user?.role?.toLowerCase();
  if (role === 'admin' || (role === 'member' && user?.canAccessChat)) return children;
  
  // simpleUser and others get restricted page
  return <AccessRestricted />;
};

const TasksRoute = () => {
  const { user } = useAuth();
  return isApprovalPending(user) ? <PendingApproval /> : <Dashboard />;
};

function App() {
  const { user } = useAuth();

  return (
    <Suspense fallback={<Loader message="Loading page..." />}>
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      
      {/* Legacy/Deprecated routes - redirect to dashboard */}
      <Route path="/pending" element={<Navigate to="/dashboard" replace />} />
      <Route path="/rejected" element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/tasks" element={<PrivateRoute><TasksRoute /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/chat" element={<ChatRoute><Chat /></ChatRoute>} />
      <Route path="/contact" element={<PrivateRoute><ContactUs /></PrivateRoute>} />

      {/* Admin-only route */}
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />

      <Route path="/blocked" element={user?.status === 'blocked' ? <AccountBlocked /> : <Navigate to="/" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}

export default App;

