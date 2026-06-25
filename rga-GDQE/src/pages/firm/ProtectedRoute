

import { Navigate } from 'react-router-dom';
import { getFirmSession } from '../../services/firmAuthService';

export function FirmProtectedRoute({ children }) {
  const session = getFirmSession();
  if (!session) return <Navigate to="/firm/login" replace />;
  return children;
}


