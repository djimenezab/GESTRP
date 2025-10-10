import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTrabajadorSchema, CATEGORIAS, type InsertTrabajador } from "@shared/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkerFormProps {
  onSubmit: (data: InsertTrabajador) => void;
  initialData?: Partial<InsertTrabajador>;
  isLoading?: boolean;
}

export function WorkerForm({ onSubmit, initialData, isLoading }: WorkerFormProps) {
  const form = useForm<InsertTrabajador>({
    resolver: zodResolver(insertTrabajadorSchema),
    defaultValues: {
      nombreCompleto: initialData?.nombreCompleto || "",
      categoria: initialData?.categoria || undefined,
      dni: initialData?.dni || "",
      fechaNacimiento: initialData?.fechaNacimiento || "",
    },
  });

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

        <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit-worker">
          {isLoading ? "Guardando..." : initialData ? "Actualizar Trabajador" : "Crear Trabajador"}
        </Button>
      </form>
    </Form>
  );
}
