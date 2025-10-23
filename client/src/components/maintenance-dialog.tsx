import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { insertMantenimientoEquipoSchema, type InsertMantenimientoEquipo, type MantenimientoEquipo } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Pen, Trash2, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MaintenanceDialogProps {
  equipoId: string;
  equipoNombre: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Componente de firma digital
function SignaturePad({ onSignatureChange }: { onSignatureChange: (signature: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set drawing styles
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setIsEmpty(false);
  };

  const stopDrawing = () => {
    if (isDrawing && !isEmpty) {
      const canvas = canvasRef.current;
      if (canvas) {
        const signature = canvas.toDataURL('image/png');
        onSignatureChange(signature);
      }
    }
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
    onSignatureChange(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Firma</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearSignature}
          disabled={isEmpty}
          data-testid="button-clear-signature"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Limpiar
        </Button>
      </div>
      <canvas
        ref={canvasRef}
        className="border rounded-md w-full h-32 bg-white cursor-crosshair touch-none"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        data-testid="canvas-signature"
      />
    </div>
  );
}

export function MaintenanceDialog({ equipoId, equipoNombre, open, onOpenChange }: MaintenanceDialogProps) {
  const { toast } = useToast();
  const [signature, setSignature] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("historial");

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

  // Query para obtener mantenimientos
  const { data: mantenimientos = [], isLoading } = useQuery<MantenimientoEquipo[]>({
    queryKey: ["/api/equipos", equipoId, "mantenimientos"],
    enabled: open,
  });

  // Mutation para crear mantenimiento
  const createMantenimientoMutation = useMutation({
    mutationFn: async (data: InsertMantenimientoEquipo & { signatureData?: string }) => {
      let firmaUrl = "";

      // Si hay firma, subirla al object storage
      if (data.signatureData) {
        // Paso 1: Obtener URL de subida firmada desde el servidor
        const uploadUrlRes = await fetch('/api/objects/upload', {
          method: 'POST',
          credentials: 'include',
        });

        if (!uploadUrlRes.ok) {
          throw new Error('Error al obtener URL de subida');
        }

        const { uploadURL } = await uploadUrlRes.json();

        // Paso 2: Subir la firma (imagen PNG) a la URL firmada de Google Cloud Storage
        const blob = await fetch(data.signatureData).then(r => r.blob());
        
        const uploadRes = await fetch(uploadURL, {
          method: 'PUT',
          body: blob,
          headers: {
            'Content-Type': 'image/png',
          },
        });

        if (!uploadRes.ok) {
          throw new Error('Error al subir la firma');
        }

        // Paso 3: Enviar la URL firmada al backend
        // El backend la normalizará a una ruta persistente (/objects/...) antes de guardarla
        // Esto garantiza que la firma permanezca accesible más allá de la expiración de la URL firmada
        firmaUrl = uploadURL;
      }

      return apiRequest('POST', `/api/equipos/${equipoId}/mantenimientos`, { ...data, firmaUrl, signatureData: undefined });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipos", equipoId, "mantenimientos"] });
      form.reset({
        equipoId,
        fecha: format(new Date(), "yyyy-MM-dd"),
        actuacionRealizada: "",
        personaRealiza: "",
        observaciones: "",
        firmaUrl: "",
      });
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

  return (
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
                        <span>{format(new Date(mantenimiento.fecha), "dd/MM/yyyy", { locale: es })}</span>
                        <Badge variant="outline">{mantenimiento.personaRealiza}</Badge>
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

                <FormField
                  control={form.control}
                  name="personaRealiza"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Persona que realiza</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Nombre completo"
                          data-testid="input-persona"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
  );
}
