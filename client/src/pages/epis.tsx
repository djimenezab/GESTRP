import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EpiForm } from "@/components/epi-form";
import { EpiDetailDialog } from "@/components/epi-detail-dialog";
import { type InsertEpi, type Epi, type Trabajador } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Epis() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEpi, setSelectedEpi] = useState<Epi | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: epis = [], isLoading: episLoading } = useQuery<Epi[]>({
    queryKey: ["/api/epis"],
  });

  const { data: trabajadores = [] } = useQuery<Trabajador[]>({
    queryKey: ["/api/trabajadores"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertEpi) => {
      return await apiRequest("POST", "/api/epis", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/epis"] });
      setIsDialogOpen(false);
      toast({
        title: "EPI registrado",
        description: "El equipo de protección ha sido registrado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo registrar el EPI",
        variant: "destructive",
      });
    },
  });

  const handleCreateEpi = (data: InsertEpi) => {
    createMutation.mutate(data);
  };

  const handleEpiClick = (epi: Epi) => {
    setSelectedEpi(epi);
    setIsDetailDialogOpen(true);
  };

  // Combinar EPIs con datos de trabajadores
  const episWithWorkers = epis.map(epi => {
    const trabajador = trabajadores.find(t => t.id === epi.trabajadorId);
    return {
      ...epi,
      trabajador: trabajador?.nombreCompleto || "Desconocido",
      trabajadorDni: trabajador?.dni || ""
    };
  });

  const filteredEpis = episWithWorkers
    .filter((epi) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        epi.trabajador.toLowerCase().includes(searchLower) ||
        epi.tipoEquipo.toLowerCase().includes(searchLower) ||
        (epi.marca && epi.marca.toLowerCase().includes(searchLower)) ||
        (epi.modelo && epi.modelo.toLowerCase().includes(searchLower))
      );
    })
    .sort((a, b) => new Date(b.fechaEntrega).getTime() - new Date(a.fechaEntrega).getTime());

  if (episLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando EPIs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">EPIs</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-epi">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Entrega EPI
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Entrega de EPI</DialogTitle>
            </DialogHeader>
            <EpiForm onSubmit={handleCreateEpi} trabajadores={trabajadores} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por trabajador, equipo, marca o modelo..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
          data-testid="input-search-epis"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trabajador</TableHead>
              <TableHead>Tipo de Equipo</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Fecha de Entrega</TableHead>
              <TableHead>Fecha de Caducidad</TableHead>
              <TableHead>Observaciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEpis.map((epi) => (
              <TableRow 
                key={epi.id} 
                data-testid={`row-epi-${epi.id}`}
                className="cursor-pointer hover-elevate"
                onClick={() => handleEpiClick(epi)}
              >
                <TableCell className="font-medium" data-testid={`text-worker-${epi.id}`}>
                  {epi.trabajador}
                </TableCell>
                <TableCell data-testid={`text-tipo-equipo-${epi.id}`}>{epi.tipoEquipo}</TableCell>
                <TableCell className="text-muted-foreground">{epi.marca || "-"}</TableCell>
                <TableCell className="text-muted-foreground">{epi.modelo || "-"}</TableCell>
                <TableCell>{format(new Date(epi.fechaEntrega), "dd/MM/yyyy", { locale: es })}</TableCell>
                <TableCell className="text-muted-foreground">
                  {epi.fechaCaducidad ? format(new Date(epi.fechaCaducidad), "dd/MM/yyyy", { locale: es }) : "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">{epi.observaciones || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredEpis.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron EPIs</p>
        </div>
      )}

      {selectedEpi && (
        <EpiDetailDialog
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          epi={{
            id: selectedEpi.id,
            tipoEquipo: selectedEpi.tipoEquipo,
            marca: selectedEpi.marca || undefined,
            modelo: selectedEpi.modelo || undefined,
            fechaEntrega: selectedEpi.fechaEntrega,
            fechaCaducidad: selectedEpi.fechaCaducidad || undefined,
            observaciones: selectedEpi.observaciones || undefined,
            trabajador: episWithWorkers.find(e => e.id === selectedEpi.id)?.trabajador || "Desconocido",
            trabajadorDni: episWithWorkers.find(e => e.id === selectedEpi.id)?.trabajadorDni || ""
          }}
        />
      )}
    </div>
  );
}
