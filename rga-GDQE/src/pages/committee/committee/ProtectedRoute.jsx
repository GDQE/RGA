import { Navigate } from 'react-router-dom';
import { getCommitteeSession } from '../../services/committeeAuthService';

export function CommitteeProtectedRoute({ children }) {
  const session = getCommitteeSession();
  if (!session) return <Navigate to="/committee/login" replace />;
  return children;
}

