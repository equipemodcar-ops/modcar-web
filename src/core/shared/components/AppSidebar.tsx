import { LayoutDashboard, Package, Users, Settings, FileText, Upload, LogOut, UserCog } from 'lucide-react';
import { NavLink } from 'react-router-dom';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/core/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const adminMenuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Produtos', url: '/admin/products', icon: Package },
  { title: 'Fornecedores', url: '/admin/partners', icon: Users },
  { title: 'Clientes', url: '/admin/customers', icon: UserCog },
  { title: 'Relatórios', url: '/admin/reports', icon: FileText },
  { title: 'Configurações', url: '/admin/settings', icon: Settings },
];

const partnerMenuItems = [
  { title: 'Dashboard', url: '/partner', icon: LayoutDashboard },
  { title: 'Meus Produtos', url: '/partner/products', icon: Package },
  { title: 'Configurações', url: '/partner/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, logout } = useAuth();

  const menuItems = user?.role === 'admin' ? adminMenuItems : partnerMenuItems;
  const isCollapsed = state === 'collapsed';

  return (
    <Sidebar className={isCollapsed ? 'w-14' : 'w-64'} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold">
              A
            </div>
            <div>
              <h2 className="font-bold text-sidebar-foreground">ModCar</h2>
              <p className="text-xs text-muted-foreground">
                {user?.role === 'admin' ? 'Administrador' : 'Fornecedor'}
              </p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground font-bold mx-auto">
            A
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                          : 'hover:bg-sidebar-accent/50'
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

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="space-y-2">
          {!isCollapsed && user && (
            <div className="px-2 py-2 rounded-lg bg-sidebar-accent/50">
              <p className="text-sm font-medium text-sidebar-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            {!isCollapsed && <span>Sair</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
