import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAccidenteSchema, GRAVEDAD_ACCIDENTE, type InsertAccidente } from "@shared/schema";
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

interface AccidentFormProps {
  trabajadorId: string;
  onSubmit: (data: InsertAccidente) => void;
  initialData?: Partial<InsertAccidente>;
  isLoading?: boolean;
}

export function AccidentForm({ trabajadorId, onSubmit, initialData, isLoading }: AccidentFormProps) {
  const form = useForm<InsertAccidente>({
    resolver: zodResolver(insertAccidenteSchema),
    defaultValues: {
      trabajadorId,
      fecha: initialData?.fecha || "",
      descripcion: initialData?.descripcion || "",
      gravedad: initialData?.gravedad || undefined,
      observaciones: initialData?.observaciones || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fecha"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha del Accidente</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    data-testid="input-fecha-accidente"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gravedad"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gravedad</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-gravedad">
                      <SelectValue placeholder="Selecciona gravedad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GRAVEDAD_ACCIDENTE.map((grav) => (
                      <SelectItem key={grav} value={grav} data-testid={`option-gravedad-${grav}`}>
                        {grav}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción del Accidente</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe el accidente ocurrido..."
                  {...field}
                  data-testid="input-descripcion-accidente"
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
                  data-testid="input-observaciones-accidente"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit-accidente">
          {isLoading ? "Guardando..." : "Registrar Accidente"}
        </Button>
      </form>
    </Form>
  );
}
