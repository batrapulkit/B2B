import { Link, useLocation } from "wouter";
import {
  Home,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Settings,
  Plane,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  { title: "AI Travel Planner", url: "/planner", icon: MessageSquare },
  { title: "Itineraries", url: "/itineraries", icon: Plane },
  { title: "CRM & Clients", url: "/clients", icon: Users },
  { title: "Invoices", url: "/invoices", icon: FileText },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  return (
    <Sidebar className="w-[260px] flex flex-col bg-white text-sidebar-foreground h-screen">
      {/* Header */}
      <SidebarHeader className="px-5 py-5 border-b border-gray-200 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-pink-600 rounded-xl flex items-center justify-center">
          <Plane className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold">Triponic</h1>
          <p className="text-xs text-gray-500">Enterprise Platform</p>
        </div>
      </SidebarHeader>

      {/* Menu */}
      <SidebarContent className="flex-1 overflow-y-auto no-scrollbar px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wide text-gray-500 mb-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  location === item.url ||
                  (item.url !== "/dashboard" && location.startsWith(item.url));

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <div
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium cursor-pointer transition
                            ${
                              isActive
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.imageUrl || ""} />
            <AvatarFallback className="bg-indigo-600 text-white font-semibold">
              {user?.firstName?.[0] || "U"}
              {user?.lastName?.[0] || ""}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.fullName || user?.email || "User"}
            </p>
            <Badge
              variant="secondary"
              className="text-xs bg-indigo-50 text-indigo-700"
            >
              Agent
            </Badge>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
