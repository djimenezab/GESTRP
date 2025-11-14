import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCursoSchema, type InsertCurso } from "@shared/schema";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ObjectUploader } from "@/components/ObjectUploader";
import { FileText, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CourseFormProps {
  onSubmit: (data: InsertCurso) => void;
  trabajadores: Array<{ id: string; nombreCompleto: string }>;
  initialData?: Partial<InsertCurso>;
  isLoading?: boolean;
}

export function CourseForm({ onSubmit, trabajadores, initialData, isLoading }: CourseFormProps) {
  const { toast } = useToast();
  
  const form = useForm<InsertCurso>({
    resolver: zodResolver(insertCursoSchema),
    defaultValues: {
      trabajadorId: initialData?.trabajadorId || "",
      nombreCurso: initialData?.nombreCurso || "",
      fechaRealizacion: initialData?.fechaRealizacion || "",
      duracionHoras: initialData?.duracionHoras || 0,
      observaciones: initialData?.observaciones || "",
      comisionServicioUrl: initialData?.comisionServicioUrl || "",
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
          form.setValue("comisionServicioUrl", objectPath, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
          toast({
            title: "PDF subido",
            description: "La Comisión de Servicio ha sido subida correctamente",
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
          name="trabajadorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trabajador</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-trabajador-curso">
                    <SelectValue placeholder="Selecciona un trabajador" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {trabajadores.map((trabajador) => (
                    <SelectItem key={trabajador.id} value={trabajador.id}>
                      {trabajador.nombreCompleto}
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
          name="nombreCurso"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Curso</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Prevención de Riesgos Laborales Básico"
                  {...field}
                  data-testid="input-nombre-curso"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fechaRealizacion"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Realización</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    data-testid="input-fecha-curso"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duracionHoras"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración (horas)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    data-testid="input-duracion-horas"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="observaciones"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observaciones (Opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Añade observaciones adicionales..."
                  {...field}
                  data-testid="input-observaciones-curso"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="comisionServicioUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comisión de Servicio (PDF - Opcional)</FormLabel>
              <FormDescription>
                Sube el PDF de la Comisión de Servicio que el trabajador deberá firmar
              </FormDescription>
              <div className="space-y-2">
                {field.value ? (
                  <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="flex-1 text-sm">PDF Comisión de Servicio subido</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        form.setValue("comisionServicioUrl", "", { shouldDirty: true });
                      }}
                      data-testid="button-remove-pdf"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={20971520}
                    onGetUploadParameters={handleFileUpload}
                    onComplete={handleUploadComplete}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Subir PDF
                  </ObjectUploader>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit-curso">
          {isLoading ? "Guardando..." : "Registrar Curso"}
        </Button>
      </form>
    </Form>
  );
}
