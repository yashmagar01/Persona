import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { showAuthToast } from '@/lib/toast-notifications';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protected Route Wrapper
 * Checks authentication before allowing access to protected pages
 * Shows toast notification if user is not authenticated
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  console.log('🛡️ ProtectedRoute COMPONENT RENDERING');
  
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('🛡️ ProtectedRoute useEffect TRIGGERED');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('🔒🔒🔒 ProtectedRoute MOUNTED - STARTING AUTH CHECK 🔒🔒🔒');
    console.log('🔍 ProtectedRoute: Performing authentication check...');
    
    try {
      // Get the current user (more reliable than session for checking actual auth)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      // Also get session for additional info
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('📊 ProtectedRoute - Full Auth State:', {
        hasUser: !!user,
        userEmail: user?.email || 'none',
        userId: user?.id || 'none',
        userRole: user?.role || 'none',
        hasSession: !!session,
        sessionExpires: session?.expires_at || 'none',
        userError: userError?.message || 'none',
        sessionError: sessionError?.message || 'none',
        isAnonymous: user?.is_anonymous || false,
      });

      // STRICT CHECK: User must be authenticated with a verified email
      const isRealUser = user && 
                        user.email && 
                        user.email !== null && 
                        !user.is_anonymous &&
                        user.id;

      console.log('🎯 Authentication Decision:', {
        isRealUser,
        reason: !user ? 'No user object' : 
                !user.email ? 'No email' :
                user.is_anonymous ? 'Anonymous user' :
                !user.id ? 'No user ID' :
                'Valid authenticated user'
      });

      if (!isRealUser) {
        console.log('❌❌❌ ProtectedRoute: AUTHENTICATION FAILED ❌❌❌');
        console.log('🚫 This is a GUEST USER or UNAUTHENTICATED - BLOCKING ACCESS');
        console.log('Toast triggered!');
        
        // Show the auth toast FIRST
        showAuthToast();
        
        // Add a small delay to allow toast to render before redirecting
        setTimeout(() => {
          console.log('⏱️ Delay complete, now setting auth state');
          setIsAuthenticated(false);
          setIsChecking(false);
        }, 100); // 100ms delay - enough for toast to mount
      } else {
        console.log('✅✅✅ ProtectedRoute: USER IS AUTHENTICATED ✅✅✅');
        console.log('✅ Granting access to protected route');
        setIsAuthenticated(true);
        setIsChecking(false);
      }
    } catch (err) {
      console.error('❌ ProtectedRoute: Error during auth check:', err);
      console.log('Toast triggered!');
      showAuthToast();
      
      // Add delay here too
      setTimeout(() => {
        setIsAuthenticated(false);
        setIsChecking(false);
      }, 100);
    }
  };

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
