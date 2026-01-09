import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthChange, getCurrentUser } from '@/lib/firebase';
import { showAuthToast } from '@/lib/toast-notifications';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected Route Wrapper
 * Checks Firebase authentication before allowing access to protected pages
 * Shows toast notification if user is not authenticated
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  console.log('🛡️ ProtectedRoute COMPONENT RENDERING');
  
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('🛡️ ProtectedRoute useEffect TRIGGERED');
    
    // Check current auth state
    const user = getCurrentUser();
    if (user) {
      console.log('✅ ProtectedRoute: User already authenticated:', user.email);
      setIsAuthenticated(true);
      setIsChecking(false);
      return;
    }

    // Listen for auth changes
    const unsubscribe = onAuthChange((user) => {
      console.log('📊 ProtectedRoute - Auth State Changed:', {
        hasUser: !!user,
        userEmail: user?.email || 'none',
      });

      if (user) {
        console.log('✅ ProtectedRoute: USER IS AUTHENTICATED');
        setIsAuthenticated(true);
      } else {
        console.log('❌ ProtectedRoute: NOT AUTHENTICATED - showing toast');
        showAuthToast();
        setIsAuthenticated(false);
      }
      setIsChecking(false);
    });

    return () => unsubscribe();
  }, []);

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to auth page (toast already shown)
  if (!isAuthenticated) {
    console.log('🔄 ProtectedRoute: Redirecting to /auth');
    return <Navigate to="/auth" replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}
