import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTrabajadorSchema, CATEGORIAS, type InsertTrabajador, type ZonaTrabajo } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { ObjectUploader } from "@/components/ObjectUploader";
import { FileText, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WorkerFormProps {
  onSubmit: (data: InsertTrabajador) => void;
  initialData?: Partial<InsertTrabajador>;
  isLoading?: boolean;
}

export function WorkerForm({ onSubmit, initialData, isLoading }: WorkerFormProps) {
  const { toast } = useToast();
  const { data: zonas = [] } = useQuery<ZonaTrabajo[]>({
    queryKey: ['/api/zonas-trabajo'],
  });

  const form = useForm<InsertTrabajador>({
    resolver: zodResolver(insertTrabajadorSchema),
    defaultValues: {
      nombreCompleto: initialData?.nombreCompleto || "",
      categoria: initialData?.categoria || undefined,
      dni: initialData?.dni || "",
      email: initialData?.email || "",
      zonaId: initialData?.zonaId || "",
      fechaNacimiento: initialData?.fechaNacimiento || "",
      fichaEvaluacionRiesgosUrl: initialData?.fichaEvaluacionRiesgosUrl || "",
    },
  });

  const handleFileUpload = async () => {
    const response = await fetch("/api/objects/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) {
      throw new Error("Error al obtener URL de subida");
    }
    
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (result: any) => {
    if (result.successful && result.successful.length > 0) {
      const file = result.successful[0];
      const uploadUrl = file.uploadURL || file.response?.uploadURL;
      if (uploadUrl) {
        const urlParts = new URL(uploadUrl).pathname.split('/');
        const uploadsIndex = urlParts.indexOf('uploads');
        if (uploadsIndex >= 0 && urlParts[uploadsIndex + 1]) {
          const objectId = urlParts[uploadsIndex + 1];
          const objectPath = `/objects/uploads/${objectId}`;
          form.setValue("fichaEvaluacionRiesgosUrl", objectPath, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
          toast({
            title: "Archivo subido",
            description: "La ficha de evaluación ha sido subida correctamente",
          });
        }
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nombreCompleto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre y Apellidos</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Juan Pérez García"
                  {...field}
                  data-testid="input-nombre-completo"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-categoria">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIAS.map((cat) => (
                    <SelectItem key={cat} value={cat} data-testid={`option-categoria-${cat}`}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="zonaId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zona de Trabajo (opcional)</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-zona">
                    <SelectValue placeholder="Sin zona asignada" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {zonas.map((zona) => (
                    <SelectItem key={zona.id} value={zona.id} data-testid={`option-zona-${zona.id}`}>
                      {zona.zona}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="dni"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DNI</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: 12345678A"
                    {...field}
                    data-testid="input-dni"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fechaNacimiento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Nacimiento</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    data-testid="input-fecha-nacimiento"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  {...field}
                  data-testid="input-email"
                />
              </FormControl>
              <FormDescription>
                El email será utilizado para acceso al sistema en el futuro
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t pt-6 space-y-4">
          <h3 className="text-lg font-semibold">Ficha de Evaluación de Riesgos Laborales</h3>
          
          <FormField
            control={form.control}
            name="fichaEvaluacionRiesgosUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Documento de Evaluación (opcional)</FormLabel>
                <FormControl>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <ObjectUploader
                        maxNumberOfFiles={1}
                        maxFileSize={10485760}
                        onGetUploadParameters={handleFileUpload}
                        onComplete={handleUploadComplete}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Subir Ficha de Evaluación
                      </ObjectUploader>
                      {field.value && (
                        <>
                          <Button
                            type="button"
                            variant="outline"
                            size="default"
                            onClick={() => field.value && window.open(field.value, '_blank')}
                            data-testid="button-view-ficha-form"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Ver
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="default"
                            onClick={() => {
                              if (field.value) {
                                const link = document.createElement('a');
                                link.href = field.value;
                                link.download = 'ficha_evaluacion';
                                link.click();
                              }
                            }}
                            data-testid="button-download-ficha-form"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </Button>
                        </>
                      )}
                    </div>
                    {field.value && <p className="text-sm text-muted-foreground">Archivo subido</p>}
                  </div>
                </FormControl>
                <FormDescription>
                  Subir la ficha de evaluación de riesgos laborales del trabajador
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit-worker">
          {isLoading ? "Guardando..." : initialData ? "Actualizar Trabajador" : "Crear Trabajador"}
        </Button>
      </form>
    </Form>
  );
}
