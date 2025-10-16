import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Dashboard from "@/pages/dashboard";
import Trabajadores from "@/pages/trabajadores";
import WorkerDetail from "@/pages/worker-detail";
import Epis from "@/pages/epis";
import Cursos from "@/pages/cursos";
import Accidentes from "@/pages/accidentes";
import Equipos from "@/pages/equipos";
import Configuracion from "@/pages/configuracion";
import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/trabajadores" component={Trabajadores} />
      <Route path="/trabajador/:id" component={WorkerDetail} />
      <Route path="/epis" component={Epis} />
      <Route path="/cursos" component={Cursos} />
      <Route path="/accidentes" component={Accidentes} />
      <Route path="/equipos" component={Equipos} />
      {user?.tipoAcceso === "AdminGral" && (
        <Route path="/configuracion" component={Configuracion} />
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function AppContent() {
  const { user, loading, login, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={login} />;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <TooltipProvider>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <header className="flex items-center justify-between p-4 border-b gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="flex items-center gap-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Usuario:</span>{" "}
                  <span className="font-medium" data-testid="text-username">{user.nombreUsuario}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </Button>
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              <Router />
            </main>
          </div>
        </div>
      </SidebarProvider>
      <Toaster />
    </TooltipProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
