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
import { onAuthChange, getCurrentUser } from "@/lib/firebase";
import { showAuthToast } from "@/lib/toast-notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

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
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  const handleConversationsClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔍 AppShell: Checking authentication for Conversations access...');
    
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      console.log('❌ AppShell: NOT AUTHENTICATED - blocking navigation');
      showAuthToast();
      setTimeout(() => navigate('/auth'), 2000);
      return;
    }
    
    console.log('✅ AppShell: User authenticated - allowing navigation');
    navigate('/conversations');
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
                          isActive && "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-l-[6px] border-orange-500 shadow-[inset_6px_0_0_0_rgba(249,115,22,0.3)]"
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
                      location.pathname === '/conversations' && "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 border-l-[6px] border-orange-500 shadow-[inset_6px_0_0_0_rgba(249,115,22,0.3)]"
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
          {/* User Profile Section - Always visible */}
          <div className="px-3 py-3 space-y-3">
            {user ? (
              // Logged in state
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border-2 border-orange-500/20">
                  <AvatarImage src={user.photoURL || undefined} alt={user.email || 'User'} />
                  <AvatarFallback className="bg-orange-500/10 text-orange-500 font-semibold">
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.displayName || user.email?.split('@')[0] || 'User'}
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
            ) : (
              // Not logged in state
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3 border-orange-500/20 hover:bg-orange-500/10 hover:border-orange-500/40 transition-all duration-200"
                onClick={() => navigate('/auth')}
              >
                <Avatar className="h-9 w-9 border-2 border-orange-500/20">
                  <AvatarFallback className="bg-orange-500/10 text-orange-500 font-semibold">
                    <User className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-foreground">Guest User</p>
                  <p className="text-xs text-muted-foreground">Sign in to save chats</p>
                </div>
              </Button>
            )}
          </div>

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
        <div className="min-h-screen flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
