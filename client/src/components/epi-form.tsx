import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEpiSchema, type InsertEpi } from "@shared/schema";
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

interface EpiFormProps {
  onSubmit: (data: InsertEpi) => void;
  trabajadores: Array<{ id: string; nombreCompleto: string }>;
  initialData?: Partial<InsertEpi>;
  isLoading?: boolean;
}

export function EpiForm({ onSubmit, trabajadores, initialData, isLoading }: EpiFormProps) {
  const form = useForm<InsertEpi>({
    resolver: zodResolver(insertEpiSchema),
    defaultValues: {
      trabajadorId: initialData?.trabajadorId || "",
      tipoEquipo: initialData?.tipoEquipo || "",
      marca: initialData?.marca || "",
      modelo: initialData?.modelo || "",
      fechaEntrega: initialData?.fechaEntrega || "",
      fechaCaducidad: initialData?.fechaCaducidad || "",
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
                  <SelectTrigger data-testid="select-trabajador-epi">
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
          name="tipoEquipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Equipo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Casco, Guantes, Botas de seguridad"
                  {...field}
                  data-testid="input-tipo-equipo"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="marca"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: 3M, Honeywell"
                    {...field}
                    data-testid="input-marca-epi"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="modelo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: X5000, Pro-2024"
                    {...field}
                    data-testid="input-modelo-epi"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fechaEntrega"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Entrega</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    data-testid="input-fecha-entrega"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="fechaCaducidad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Caducidad (Opcional)</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    data-testid="input-fecha-caducidad"
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
                  data-testid="input-observaciones-epi"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit-epi">
          {isLoading ? "Guardando..." : "Registrar EPI"}
        </Button>
      </form>
    </Form>
  );
}
