import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router';
import { Loader2 } from 'lucide-react';
import { authService } from '../services/auth.service';

export default function ProtectedRouteLayout() {
  const [status, setStatus] = useState<'checking' | 'allowed' | 'denied'>('checking');

  useEffect(() => {
    let active = true;

    const verifyAccess = async () => {
      const authenticated = await authService.ensureAuthenticated();
      const user = authService.getCurrentUser();

      if (!active) {
        return;
      }

      setStatus(authenticated && user ? 'allowed' : 'denied');
    };

    void verifyAccess();

    return () => {
      active = false;
    };
  }, []);

  if (status === 'checking') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'denied') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
