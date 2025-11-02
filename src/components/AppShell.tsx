import React from "react";
import { Outlet, NavLink } from "react-router-dom";
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

/**
 * AppShell
 * Shared application layout that renders the left sidebar across main routes
 * and the page content via React Router's <Outlet />. On mobile, the sidebar
 * is off-canvas with a visible toggle button.
 */
export default function AppShell() {
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
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/conversations"
                      className={({ isActive }) => cn("flex items-center gap-2", isActive && "data-[active=true]")}
                    >
                      <History className="size-4" />
                      <span>Conversations</span>
                    </NavLink>
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
