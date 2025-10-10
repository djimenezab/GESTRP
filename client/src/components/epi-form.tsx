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

interface EpiFormProps {
  trabajadorId: string;
  onSubmit: (data: InsertEpi) => void;
  initialData?: Partial<InsertEpi>;
  isLoading?: boolean;
}

export function EpiForm({ trabajadorId, onSubmit, initialData, isLoading }: EpiFormProps) {
  const form = useForm<InsertEpi>({
    resolver: zodResolver(insertEpiSchema),
    defaultValues: {
      trabajadorId,
      tipoEquipo: initialData?.tipoEquipo || "",
      fechaEntrega: initialData?.fechaEntrega || "",
      observaciones: initialData?.observaciones || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
