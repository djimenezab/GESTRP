import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMantenimientoEquipoSchema, type InsertMantenimientoEquipo, type MantenimientoEquipo, type Trabajador } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Pen, Trash2, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignaturePad } from "@/components/signature-pad";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

interface MaintenanceDialogProps {
  equipoId: string;
  equipoNombre: string;
  equipoZonaId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaintenanceDialog({ equipoId, equipoNombre, equipoZonaId, open, onOpenChange }: MaintenanceDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [signature, setSignature] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("historial");
  const [editingMantenimiento, setEditingMantenimiento] = useState<MantenimientoEquipo | null>(null);
  const [deletingMantenimiento, setDeletingMantenimiento] = useState<MantenimientoEquipo | null>(null);

  const form = useForm<InsertMantenimientoEquipo>({
    resolver: zodResolver(insertMantenimientoEquipoSchema),
    defaultValues: {
      equipoId,
      fecha: format(new Date(), "yyyy-MM-dd"),
      actuacionRealizada: "",
      personaRealiza: "",
      observaciones: "",
      firmaUrl: "",
    },
  });

  // Query para obtener el nombre del usuario actual
  const { data: currentUserData } = useQuery<{ nombreCompleto: string }>({
    queryKey: ["/api/current-user-name"],
    enabled: open && user?.tipoAcceso === "Usuario",
  });

  // Query para obtener mantenimientos
  const { data: mantenimientos = [], isLoading } = useQuery<MantenimientoEquipo[]>({
    queryKey: ["/api/equipos", equipoId, "mantenimientos"],
    enabled: open,
  });

  // Query para obtener trabajadores de la zona del equipo (solo para administradores)
  const { data: trabajadores = [] } = useQuery<Trabajador[]>({
    queryKey: ["/api/zonas", equipoZonaId, "trabajadores"],
    enabled: open && !!equipoZonaId && user?.tipoAcceso !== "Usuario",
  });

  // Si el usuario es tipo "Usuario", auto-rellenar su nombre
  useEffect(() => {
    if (user?.tipoAcceso === "Usuario" && currentUserData?.nombreCompleto) {
      form.setValue("personaRealiza", currentUserData.nombreCompleto);
    }
  }, [user, currentUserData, form, activeTab]);

  // Mutation para crear mantenimiento
  const createMantenimientoMutation = useMutation({
    mutationFn: async (data: InsertMantenimientoEquipo & { signatureData?: string }) => {
      let firmaUrl = "";

      // Si hay firma, subirla al object storage
      if (data.signatureData) {
        // Subir la firma como multipart a través del servidor (evita bloqueos corporativos)
        const blob = await fetch(data.signatureData).then(r => r.blob());
        const formData = new FormData();
        formData.append('file', blob, 'firma.png');

        const uploadRes = await fetch('/api/objects/upload-file', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Error al subir la firma');
        }

        const { objectPath } = await uploadRes.json();
        firmaUrl = objectPath;
      }

      return apiRequest('POST', `/api/equipos/${equipoId}/mantenimientos`, { ...data, firmaUrl, signatureData: undefined });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipos", equipoId, "mantenimientos"] });
      const resetData = {
        equipoId,
        fecha: format(new Date(), "yyyy-MM-dd"),
        actuacionRealizada: "",
        personaRealiza: user?.tipoAcceso === "Usuario" && currentUserData?.nombreCompleto ? currentUserData.nombreCompleto : "",
        observaciones: "",
        firmaUrl: "",
      };
      form.reset(resetData);
      setSignature(null);
      setActiveTab("historial");
      toast({
        title: "Registro creado",
        description: "El registro de mantenimiento se ha guardado correctamente",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo crear el registro",
      });
    },
  });

  // Mutation para eliminar mantenimiento
  const deleteMantenimientoMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/mantenimientos/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipos", equipoId, "mantenimientos"] });
      setDeletingMantenimiento(null);
      toast({
        title: "Registro eliminado",
        description: "El registro de mantenimiento se ha eliminado correctamente",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar el registro",
      });
    },
  });

  const onSubmit = (data: InsertMantenimientoEquipo) => {
    if (!signature) {
      toast({
        variant: "destructive",
        title: "Firma requerida",
        description: "Debe proporcionar una firma para guardar el registro",
      });
      return;
    }

    createMantenimientoMutation.mutate({
      ...data,
      signatureData: signature,
    });
  };

  const handleDelete = () => {
    if (deletingMantenimiento) {
      deleteMantenimientoMutation.mutate(deletingMantenimiento.id);
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="title-cuaderno-mantenimiento">
            Cuaderno de mantenimiento
          </DialogTitle>
          <DialogDescription>
            {equipoNombre}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="historial" data-testid="tab-historial">
              <FileText className="h-4 w-4 mr-2" />
              Historial
            </TabsTrigger>
            <TabsTrigger value="nuevo" data-testid="tab-nuevo">
              <Pen className="h-4 w-4 mr-2" />
              Nuevo Registro
            </TabsTrigger>
          </TabsList>

          <TabsContent value="historial" className="space-y-4">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Cargando historial...</p>
            ) : mantenimientos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground" data-testid="text-no-mantenimientos">
                  No hay registros de mantenimiento
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {mantenimientos.map((mantenimiento) => (
                  <Card key={mantenimiento.id}>
                    <CardHeader>
                      <CardTitle className="text-sm flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{format(new Date(mantenimiento.fecha), "dd/MM/yyyy", { locale: es })}</span>
                          <Badge variant="outline">{mantenimiento.personaRealiza}</Badge>
                        </div>
                        {user?.tipoAcceso !== "Usuario" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-6 w-6"
                                data-testid={`button-menu-${mantenimiento.id}`}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setDeletingMantenimiento(mantenimiento)}
                                className="text-destructive"
                                data-testid={`button-delete-${mantenimiento.id}`}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">Actuación realizada:</p>
                        <p className="text-sm text-muted-foreground">{mantenimiento.actuacionRealizada}</p>
                      </div>
                      {mantenimiento.observaciones && (
                        <div>
                          <p className="text-sm font-medium">Observaciones:</p>
                          <p className="text-sm text-muted-foreground">{mantenimiento.observaciones}</p>
                        </div>
                      )}
                      {mantenimiento.firmaUrl && (
                        <div>
                          <p className="text-sm font-medium mb-2">Firma:</p>
                          <img 
                            src={mantenimiento.firmaUrl} 
                            alt="Firma" 
                            className="border rounded-md max-h-24"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="nuevo">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fecha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-maintenance-fecha" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="actuacionRealizada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actuación realizada</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Describa la actuación realizada..."
                          data-testid="textarea-actuacion"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {user?.tipoAcceso === "Usuario" ? (
                  <FormField
                    control={form.control}
                    name="personaRealiza"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Persona que realiza</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            readOnly
                            className="bg-muted"
                            data-testid="input-persona-readonly"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="personaRealiza"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Persona que realiza</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-persona">
                              <SelectValue placeholder="Seleccionar trabajador" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {trabajadores.map((trabajador) => (
                              <SelectItem 
                                key={trabajador.id} 
                                value={trabajador.nombreCompleto}
                                data-testid={`option-trabajador-${trabajador.id}`}
                              >
                                {trabajador.nombreCompleto}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="observaciones"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observaciones (opcional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value || ""}
                          placeholder="Observaciones adicionales..."
                          data-testid="textarea-observaciones"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <SignaturePad onSignatureChange={setSignature} />

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    data-testid="button-cancelar"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={createMantenimientoMutation.isPending}
                    data-testid="button-guardar-mantenimiento"
                  >
                    {createMantenimientoMutation.isPending ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingMantenimiento} onOpenChange={() => setDeletingMantenimiento(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro de mantenimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro de mantenimiento será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
