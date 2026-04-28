import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import api from './services/api';
import Login from './pages/Login';
import Register from './pages/Register';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Chat from './pages/Chat';
import AdminUsers from './pages/AdminUsers';
import AccessRestricted from './pages/AccessRestricted';
import PendingApproval from './pages/PendingApproval';
import RejectedUser from './pages/RejectedUser';
import AccountBlocked from './pages/AccountBlocked';
import ContactUs from './pages/ContactUs';
import { useAuth } from './context/AuthContext';
import Loader from './components/Loader';

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

function App() {
  const { user, loading } = useAuth();

  if (loading) return <Loader message="Loading App..." />;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      
      {/* Legacy/Deprecated routes - redirect to dashboard */}
      <Route path="/pending" element={<Navigate to="/dashboard" replace />} />
      <Route path="/rejected" element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/chat" element={<ChatRoute><Chat /></ChatRoute>} />
      <Route path="/contact" element={<PrivateRoute><ContactUs /></PrivateRoute>} />

      {/* Admin-only route */}
      <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />

      <Route path="/blocked" element={user?.status === 'blocked' ? <AccountBlocked /> : <Navigate to="/" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

