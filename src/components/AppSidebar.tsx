import { NavLink } from "react-router-dom";
import { Home, Users, Scissors, Package, Receipt, History, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { state } = useSidebar();
  const { isOwner } = useAuth();
  const isCollapsed = state === "collapsed";

  const ownerItems = [
    { title: "Dashboard", url: "/", icon: Home },
    { title: "Pemotong", url: "/barbers", icon: Users },
    { title: "Jasa", url: "/services", icon: Scissors },
    { title: "Produk", url: "/products", icon: Package },
    { title: "Transaksi", url: "/transactions", icon: Receipt },
    { title: "Riwayat", url: "/history", icon: History },
    { title: "Laporan Gaji", url: "/reports", icon: DollarSign },
  ];

  const cashierItems = [
    { title: "Transaksi", url: "/transactions", icon: Receipt },
    { title: "Riwayat Saya", url: "/history", icon: History },
  ];

  const items = isOwner ? ownerItems : cashierItems;

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
