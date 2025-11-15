import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const accessToken = localStorage.getItem('access');
  return accessToken ? children : <Navigate to="/login" />;
}