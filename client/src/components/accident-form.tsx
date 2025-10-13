import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAccidenteSchema, GRAVEDAD_ACCIDENTE, TIPO_ACCIDENTE, type InsertAccidente, type Trabajador } from "@shared/schema";
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
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

interface AccidentFormProps {
  onSubmit: (data: InsertAccidente) => void;
  initialData?: Partial<InsertAccidente>;
  isLoading?: boolean;
}

export function AccidentForm({ onSubmit, initialData, isLoading }: AccidentFormProps) {
  const [selectedTrabajadorId, setSelectedTrabajadorId] = useState<string>(initialData?.trabajadorId || "");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("");

  // Fetch all workers
  const { data: trabajadores = [] } = useQuery<Trabajador[]>({
    queryKey: ['/api/trabajadores'],
  });

  // Filter workers for "parte" selection (only Encargado or Enc. gral. o.p.)
  const trabajadoresParte = trabajadores.filter(t => 
    t.categoria === "ENCARGADO" || t.categoria === "ENC. GRAL. O.P."
  );

  const form = useForm<InsertAccidente>({
    resolver: zodResolver(insertAccidenteSchema),
    defaultValues: {
      trabajadorId: initialData?.trabajadorId || "",
      centroTrabajo: initialData?.centroTrabajo || "",
      tipoAccidente: initialData?.tipoAccidente || undefined,
      lugarAccidente: initialData?.lugarAccidente || "",
      fecha: initialData?.fecha || "",
      horaAccidente: initialData?.horaAccidente || "",
      descripcion: initialData?.descripcion || "",
      gravedad: initialData?.gravedad || undefined,
      observaciones: initialData?.observaciones || "",
      trabajadorParteId: initialData?.trabajadorParteId || "",
    },
  });

  // Update category when worker is selected
  useEffect(() => {
    if (selectedTrabajadorId) {
      const trabajador = trabajadores.find(t => t.id === selectedTrabajadorId);
      if (trabajador) {
        setSelectedCategoria(trabajador.categoria);
      }
    }
  }, [selectedTrabajadorId, trabajadores]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="trabajadorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Trabajador Accidentado</FormLabel>
                <Select 
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedTrabajadorId(value);
                  }} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger data-testid="select-trabajador">
                      <SelectValue placeholder="Selecciona trabajador" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {trabajadores.map((trabajador) => (
                      <SelectItem 
                        key={trabajador.id} 
                        value={trabajador.id}
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

          <FormItem>
            <FormLabel>Categoría</FormLabel>
            <Input 
              value={selectedCategoria} 
              disabled 
              placeholder="Selecciona un trabajador"
              data-testid="input-categoria-readonly"
            />
          </FormItem>
        </div>

        <FormField
          control={form.control}
          name="centroTrabajo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Centro de Trabajo</FormLabel>
              <FormControl>
                <Input
                  placeholder="Ej: Obra Calle Mayor"
                  {...field}
                  data-testid="input-centro-trabajo"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tipoAccidente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Accidente</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-tipo-accidente">
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACCIDENTE_SERVICIO" data-testid="option-tipo-accidente-servicio">
                      1. Accidente en acto de servicio
                    </SelectItem>
                    <SelectItem value="ENFERMEDAD_PROFESIONAL" data-testid="option-tipo-enfermedad">
                      2. Enfermedad profesional
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lugarAccidente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lugar del Accidente</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ej: Planta 2, zona de carga"
                    {...field}
                    data-testid="input-lugar-accidente"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            name="horaAccidente"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hora del Accidente</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...field}
                    data-testid="input-hora-accidente"
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
              <FormLabel>Descripción del Accidente o Enfermedad</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe el accidente o enfermedad ocurrido..."
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

        <FormField
          control={form.control}
          name="trabajadorParteId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Persona que Hace el Parte de Accidente (Opcional)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger data-testid="select-trabajador-parte">
                    <SelectValue placeholder="Selecciona encargado" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {trabajadoresParte.map((trabajador) => (
                    <SelectItem 
                      key={trabajador.id} 
                      value={trabajador.id}
                      data-testid={`option-trabajador-parte-${trabajador.id}`}
                    >
                      {trabajador.nombreCompleto} - {trabajador.categoria}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
