import {
  LayoutDashboard,
  Users,
  HardHat,
  GraduationCap,
  AlertTriangle,
  Settings,
  Wrench,
  FileText,
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
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import logoImage from "@assets/generated_images/Blue_mandatory_safety_sign_EPIs_99bbccff.png";

const allMenuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    roles: ["AdminGral", "Administrador", "Usuario"],
  },
  {
    title: "Trabajadores",
    url: "/trabajadores",
    icon: Users,
    roles: ["AdminGral", "Administrador", "Usuario"],
  },
  {
    title: "EPIs",
    url: "/epis",
    icon: HardHat,
    roles: ["AdminGral", "Administrador", "Usuario"],
  },
  {
    title: "Cursos",
    url: "/cursos",
    icon: GraduationCap,
    roles: ["AdminGral", "Administrador", "Usuario"],
  },
  {
    title: "Accidentes",
    url: "/accidentes",
    icon: AlertTriangle,
    roles: ["AdminGral", "Administrador", "Usuario"],
  },
  {
    title: "Equipos",
    url: "/equipos",
    icon: Wrench,
    roles: ["AdminGral", "Administrador", "Usuario"],
  },
  {
    title: "Documentación",
    url: "/documentacion",
    icon: FileText,
    roles: ["AdminGral", "Administrador", "Usuario"],
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const menuItems = allMenuItems.filter(
    (item) => user && item.roles.includes(user.tipoAcceso)
  );

  const showConfiguracion = user?.tipoAcceso === "AdminGral";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <img 
            src={logoImage} 
            alt="Logo Prevención" 
            className="w-12 h-12 object-contain flex-shrink-0"
          />
          <div>
            <h2 className="text-lg font-semibold">Gestión R.P.</h2>
            <p className="text-sm text-muted-foreground">Carreteras</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Gestión</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                // Cambiar "Trabajadores" por "Mis datos" cuando el usuario es tipo "Usuario"
                const displayTitle = item.title === "Trabajadores" && user?.tipoAcceso === "Usuario" 
                  ? "Mis datos" 
                  : item.title;
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location === item.url}
                      data-testid={`link-${displayTitle.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <a href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{displayTitle}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {showConfiguracion && (
          <SidebarGroup>
            <SidebarGroupLabel>Sistema</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={location === "/configuracion"}
                    data-testid="link-configuracion"
                  >
                    <a href="/configuracion">
                      <Settings className="h-4 w-4" />
                      <span>Configuración</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="text-xs text-muted-foreground text-center">
          Versión 1.61 -NOV 2025-
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
