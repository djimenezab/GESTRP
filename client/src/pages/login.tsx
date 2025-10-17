import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const loginSchema = z.object({
  nombreUsuario: z.string().min(1, "Usuario es requerido"),
  password: z.string().min(1, "Contraseña es requerida"),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Contraseña actual es requerida"),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;
type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [tempUser, setTempUser] = useState<{ nombreUsuario: string; password: string } | null>(null);

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      nombreUsuario: "",
      password: "",
    },
  });

  const changePasswordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  });

  const handleLogin = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      const response: any = await apiRequest("POST", "/api/auth/login", data);
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido, ${response.nombreUsuario}`,
      });
      onLoginSuccess(response);
      // Redirigir a la página inicial según el tipo de usuario
      if (response.tipoAcceso === "AdminGral" || response.tipoAcceso === "Administrador") {
        window.location.href = "/";
      } else {
        window.location.href = "/trabajadores";
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Credenciales inválidas",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (data: ChangePasswordForm) => {
    if (!tempUser) return;

    try {
      setIsLoading(true);
      
      // First login with current credentials
      await apiRequest("POST", "/api/auth/login", {
        nombreUsuario: tempUser.nombreUsuario,
        password: data.currentPassword,
      });

      // Then change the password
      await apiRequest("POST", "/api/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña ha sido cambiada correctamente",
      });

      setIsChangePasswordOpen(false);
      setTempUser(null);
      changePasswordForm.reset();
      
      // Login again with new password
      const response = await apiRequest("POST", "/api/auth/login", {
        nombreUsuario: tempUser.nombreUsuario,
        password: data.newPassword,
      });
      onLoginSuccess(response);
      // Redirigir a la página inicial según el tipo de usuario
      if (response.tipoAcceso === "AdminGral" || response.tipoAcceso === "Administrador") {
        window.location.href = "/";
      } else {
        window.location.href = "/trabajadores";
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Error al cambiar la contraseña",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openChangePasswordDialog = () => {
    const formValues = loginForm.getValues();
    if (!formValues.nombreUsuario) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa tu nombre de usuario primero",
      });
      return;
    }
    setTempUser(formValues);
    setIsChangePasswordOpen(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Gestión de Recursos de Prevención de Riesgos Laborales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="nombreUsuario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usuario</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ingresa tu usuario"
                        data-testid="input-login-usuario"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Ingresa tu contraseña"
                        data-testid="input-login-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                  data-testid="button-login"
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={openChangePasswordDialog}
                  disabled={isLoading}
                  className="flex-1"
                  data-testid="button-open-change-password"
                >
                  Cambiar Contraseña
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="absolute bottom-4 right-4 text-sm text-muted-foreground">
        Desarrollado por David Jiménez, Ver. 1.0 -OCT 2025-
      </footer>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Contraseña</DialogTitle>
            <DialogDescription>
              Ingresa tu contraseña actual y la nueva contraseña
            </DialogDescription>
          </DialogHeader>
          <Form {...changePasswordForm}>
            <form onSubmit={changePasswordForm.handleSubmit(handleChangePassword)} className="space-y-4">
              <FormField
                control={changePasswordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña Actual</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Contraseña actual"
                        data-testid="input-current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={changePasswordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Nueva contraseña (mínimo 6 caracteres)"
                        data-testid="input-new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsChangePasswordOpen(false);
                    setTempUser(null);
                    changePasswordForm.reset();
                  }}
                  data-testid="button-cancel-change-password"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  data-testid="button-submit-change-password"
                >
                  {isLoading ? "Guardando..." : "Cambiar Contraseña"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
