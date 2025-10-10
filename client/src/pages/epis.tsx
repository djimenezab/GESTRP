import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
import { type InsertEpi } from "@shared/schema";

//todo: remove mock data
const mockWorkers = [
  { id: "1", nombreCompleto: "Juan Pérez García" },
  { id: "2", nombreCompleto: "María López Fernández" },
  { id: "3", nombreCompleto: "Carlos Martínez Ruiz" },
  { id: "4", nombreCompleto: "Ana Sánchez Torres" },
  { id: "5", nombreCompleto: "Pedro González Vega" },
  { id: "6", nombreCompleto: "Laura Jiménez Morales" },
];

//todo: remove mock data
const initialMockEpis = [
  {
    id: "1",
    tipoEquipo: "Casco de seguridad",
    marca: "3M",
    modelo: "H-700",
    fechaEntrega: "2024-01-15",
    fechaCaducidad: "2029-01-15",
    observaciones: "Talla M",
    trabajadorId: "1",
    trabajador: "Juan Pérez García",
  },
  {
    id: "2",
    tipoEquipo: "Guantes anticorte",
    marca: "Ansell",
    modelo: "HyFlex 11-801",
    fechaEntrega: "2024-02-20",
    fechaCaducidad: "",
    observaciones: "",
    trabajadorId: "2",
    trabajador: "María López Fernández",
  },
  {
    id: "3",
    tipoEquipo: "Botas de seguridad",
    marca: "Puma Safety",
    modelo: "Conquest",
    fechaEntrega: "2024-03-10",
    fechaCaducidad: "2026-03-10",
    observaciones: "Talla 42",
    trabajadorId: "3",
    trabajador: "Carlos Martínez Ruiz",
  },
  {
    id: "4",
    tipoEquipo: "Chaleco reflectante",
    marca: "Portwest",
    modelo: "C470",
    fechaEntrega: "2024-03-25",
    fechaCaducidad: "",
    observaciones: "Talla L",
    trabajadorId: "4",
    trabajador: "Ana Sánchez Torres",
  },
];

export default function Epis() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [epis, setEpis] = useState(initialMockEpis);

  //todo: remove mock functionality
  const handleCreateEpi = (data: InsertEpi) => {
    console.log("Crear EPI:", data);
    
    // Find worker name
    const trabajador = mockWorkers.find(w => w.id === data.trabajadorId);
    
    // Create new EPI with mock ID
    const newEpi = {
      id: String(Date.now()),
      tipoEquipo: data.tipoEquipo,
      marca: data.marca || "",
      modelo: data.modelo || "",
      fechaEntrega: data.fechaEntrega,
      fechaCaducidad: data.fechaCaducidad || "",
      observaciones: data.observaciones || "",
      trabajadorId: data.trabajadorId,
      trabajador: trabajador?.nombreCompleto || "",
    };
    
    // Add to state
    setEpis([...epis, newEpi]);
    setIsDialogOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">EPIs Entregados</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-epi">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Entrega EPI
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Nueva Entrega de EPI</DialogTitle>
            </DialogHeader>
            <EpiForm onSubmit={handleCreateEpi} trabajadores={mockWorkers} />
          </DialogContent>
        </Dialog>
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
            {epis.map((epi) => (
              <TableRow key={epi.id} data-testid={`row-epi-${epi.id}`}>
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
    </div>
  );
}
