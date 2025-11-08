import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
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
import { MessageSquare, History, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { showAuthToast } from "@/lib/toast-notifications";

/**
 * AppShell
 * Shared application layout that renders the left sidebar across main routes
 * and the page content via React Router's <Outlet />. On mobile, the sidebar
 * is off-canvas with a visible toggle button.
 */
export default function AppShell() {
  const navigate = useNavigate();

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
      <Sidebar className="bg-sidebar text-sidebar-foreground" collapsible="offcanvas">
        <SidebarHeader className="px-3 py-2">
          <div className="flex items-center gap-2 px-1">
            <MessageSquare className="size-5 text-primary" />
            <span className="font-semibold">Persona</span>
          </div>
        </SidebarHeader>

        <SidebarSeparator />

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/chatboard"
                      className={({ isActive }) => cn("flex items-center gap-2", isActive && "data-[active=true]")}
                    >
                      <MessageCircle className="size-4" />
                      <span>Chatboard</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={handleConversationsClick}>
                    <History className="size-4" />
                    <span>Conversations</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="mt-auto">
          <div className="text-xs text-muted-foreground px-2 py-1">v1.0</div>
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
