import React, { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { MessageSquare, History, Settings, User, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { showAuthToast } from "@/lib/toast-notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

/**
 * AppShell
 * Shared application layout that renders the left sidebar across main routes
 * and the page content via React Router's <Outlet />. On mobile, the sidebar
 * is off-canvas with a visible toggle button.
 */
export default function AppShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Check user authentication status
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleConversationsClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔍 AppShell: Checking authentication for Conversations access...');
    console.log('🔍 Event triggered, checking session...');
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      console.log('📊 Session check result:', { 
        hasSession: !!session, 
        sessionUser: session?.user?.email || 'none',
        error: error?.message || 'none'
      });
      
      // Check if user is authenticated (NOT guest mode)
      if (!session || !session.user) {
        console.log('❌ AppShell: NO AUTHENTICATION - User is in guest mode or not logged in');
        console.log('🚫 BLOCKING navigation to conversations');
        console.log('Toast triggered!');
        
        // Show the toast
        showAuthToast();
        
        // Wait and redirect to auth
        setTimeout(() => {
          console.log('🔄 Redirecting to /auth page...');
          navigate('/auth');
        }, 2000);
        
        return; // STOP HERE - do not navigate
      }
      
      console.log('✅ AppShell: User IS authenticated - allowing navigation');
      navigate('/conversations');
      
    } catch (err) {
      console.error('❌ Error checking session:', err);
      showAuthToast();
      setTimeout(() => navigate('/auth'), 2000);
    }
  };

  return (
    <SidebarProvider>
      {/* Sidebar + rail */}
      <Sidebar className="bg-sidebar text-sidebar-foreground border-r border-border" collapsible="offcanvas">
        <SidebarHeader className="px-3 py-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-1">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-1.5 rounded-lg">
                <MessageSquare className="size-4 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Persona
              </span>
            </div>
            
            {/* Desktop collapse/expand button */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex h-7 w-7 hover:bg-accent transition-colors"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? (
                <ChevronRight className="size-4" />
              ) : (
                <ChevronLeft className="size-4" />
              )}
            </Button>
          </div>
        </SidebarHeader>

        <SidebarContent className="py-2">
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent className="mt-2">
              <SidebarMenu>
                {/* Chatboard Link */}
                <SidebarMenuItem>
                  <NavLink to="/chatboard">
                    {({ isActive }) => (
                      <SidebarMenuButton
                        className={cn(
                          "w-full transition-all duration-200",
                          "hover:bg-gray-800 hover:text-white",
                          "group relative",
                          isActive && "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-l-4 border-orange-500"
                        )}
                      >
                        <MessageSquare className={cn("size-4 transition-colors", isActive && "text-orange-500")} />
                        <span className={cn("transition-colors", isActive && "font-semibold")}>
                          Chatboard
                        </span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>

                {/* Conversations Link */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={handleConversationsClick}
                    className={cn(
                      "w-full transition-all duration-200",
                      "hover:bg-gray-800 hover:text-white",
                      "group relative",
                      location.pathname === '/conversations' && "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-l-4 border-orange-500"
                    )}
                  >
                    <History className={cn("size-4 transition-colors", location.pathname === '/conversations' && "text-orange-500")} />
                    <span className={cn("transition-colors", location.pathname === '/conversations' && "font-semibold")}>
                      Conversations
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="mt-auto border-t border-border">
          {/* User Profile Section (when logged in) */}
          {user && (
            <div className="px-3 py-3 space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border-2 border-orange-500/20">
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                  <AvatarFallback className="bg-orange-500/10 text-orange-500 font-semibold">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-accent transition-colors"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Version */}
          <div className="px-3 py-2 border-t border-border">
            <p className="text-xs text-gray-400 font-medium">Version 1.0</p>
          </div>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* Content area */}
      <SidebarInset>
        {/* Mobile toggle button (visible on small screens) */}
        <div className="fixed top-2 left-2 z-40 md:hidden">
          <SidebarTrigger aria-label="Toggle Sidebar" />
        </div>

        {/* Routed page content */}
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
