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

interface CourseFormProps {
  onSubmit: (data: InsertCurso) => void;
  trabajadores: Array<{ id: string; nombreCompleto: string }>;
  initialData?: Partial<InsertCurso>;
  isLoading?: boolean;
}

export function CourseForm({ onSubmit, trabajadores, initialData, isLoading }: CourseFormProps) {
  const form = useForm<InsertCurso>({
    resolver: zodResolver(insertCursoSchema),
    defaultValues: {
      trabajadorId: initialData?.trabajadorId || "",
      nombreCurso: initialData?.nombreCurso || "",
      fechaRealizacion: initialData?.fechaRealizacion || "",
      duracionHoras: initialData?.duracionHoras || 0,
      observaciones: initialData?.observaciones || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="trabajadorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trabajador</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit-curso">
          {isLoading ? "Guardando..." : "Registrar Curso"}
        </Button>
      </form>
    </Form>
  );
}
