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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface WorkerFormProps {
  onSubmit: (data: InsertTrabajador) => void;
  initialData?: Partial<InsertTrabajador>;
  isLoading?: boolean;
}

export function WorkerForm({ onSubmit, initialData, isLoading }: WorkerFormProps) {
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
      recibeEvaluacionRiesgos: initialData?.recibeEvaluacionRiesgos || false,
      fechaEntregaEvaluacion: initialData?.fechaEntregaEvaluacion || "",
    },
  });

  const recibeEvaluacion = form.watch("recibeEvaluacionRiesgos");

  const handleSwitchChange = (checked: boolean) => {
    form.setValue("recibeEvaluacionRiesgos", checked);
    if (!checked) {
      form.setValue("fechaEntregaEvaluacion", "");
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
          <h3 className="text-lg font-semibold">Evaluación de Riesgos Laborales</h3>
          
          <FormField
            control={form.control}
            name="recibeEvaluacionRiesgos"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Recibe Copia de Evaluación de Riesgos
                  </FormLabel>
                  <FormDescription>
                    ¿El trabajador ha recibido copia de la evaluación de riesgos?
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={handleSwitchChange}
                    data-testid="switch-recibe-evaluacion"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {recibeEvaluacion && (
            <FormField
              control={form.control}
              name="fechaEntregaEvaluacion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Entrega</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      data-testid="input-fecha-entrega-evaluacion"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit-worker">
          {isLoading ? "Guardando..." : initialData ? "Actualizar Trabajador" : "Crear Trabajador"}
        </Button>
      </form>
    </Form>
  );
}
