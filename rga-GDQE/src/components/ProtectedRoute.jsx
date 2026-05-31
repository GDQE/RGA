import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingPage } from '../components/UI';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingPage text="جارٍ التحقق من الصلاحيات..." />;
  if (!user) return <Navigate to="/admin/login" replace />;
  return children;
}
