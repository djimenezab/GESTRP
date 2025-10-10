import { useState } from "react";
import { WorkerCard } from "@/components/worker-card";
import { WorkerDetailDialog } from "@/components/worker-detail-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { WorkerForm } from "@/components/worker-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIAS, type InsertTrabajador } from "@shared/schema";

//todo: remove mock data
const mockWorkers = [
  {
    id: "1",
    nombreCompleto: "Juan Pérez García",
    categoria: "OFICIAL",
    dni: "12345678A",
    fechaNacimiento: "1985-03-15",
  },
  {
    id: "2",
    nombreCompleto: "María López Fernández",
    categoria: "ENCARGADO",
    dni: "87654321B",
    fechaNacimiento: "1990-07-22",
  },
  {
    id: "3",
    nombreCompleto: "Carlos Martínez Ruiz",
    categoria: "OPERADOR M.P.",
    dni: "11223344C",
    fechaNacimiento: "1988-11-30",
  },
  {
    id: "4",
    nombreCompleto: "Ana Sánchez Torres",
    categoria: "PEON ESP.",
    dni: "55667788D",
    fechaNacimiento: "1992-05-18",
  },
  {
    id: "5",
    nombreCompleto: "Pedro González Vega",
    categoria: "ENC. GRAL. O.P.",
    dni: "99887766E",
    fechaNacimiento: "1983-09-12",
  },
  {
    id: "6",
    nombreCompleto: "Laura Jiménez Morales",
    categoria: "VIGILANTE CRTAS.",
    dni: "44332211F",
    fechaNacimiento: "1995-02-28",
  },
];

//todo: remove mock data
const mockEpisByWorker: Record<string, Array<{ id: string; tipoEquipo: string; fechaEntrega: string; observaciones?: string }>> = {
  "1": [
    { id: "1", tipoEquipo: "Casco de seguridad", fechaEntrega: "2024-01-15", observaciones: "Talla M" },
    { id: "2", tipoEquipo: "Guantes anticorte", fechaEntrega: "2024-02-20", observaciones: "" },
    { id: "3", tipoEquipo: "Botas de seguridad", fechaEntrega: "2024-03-10", observaciones: "Talla 42" },
  ],
  "2": [
    { id: "4", tipoEquipo: "Chaleco reflectante", fechaEntrega: "2024-03-25", observaciones: "Talla L" },
    { id: "5", tipoEquipo: "Gafas de protección", fechaEntrega: "2024-01-10", observaciones: "" },
  ],
  "3": [
    { id: "6", tipoEquipo: "Arnés de seguridad", fechaEntrega: "2024-02-15", observaciones: "Para trabajos en altura" },
  ],
  "4": [
    { id: "7", tipoEquipo: "Protectores auditivos", fechaEntrega: "2024-03-01", observaciones: "" },
  ],
  "5": [],
  "6": [
    { id: "8", tipoEquipo: "Chaleco reflectante", fechaEntrega: "2024-02-28", observaciones: "Talla M" },
  ],
};

//todo: remove mock data
const mockCursosByWorker: Record<string, Array<{ id: string; nombreCurso: string; fechaRealizacion: string; duracionHoras: number }>> = {
  "1": [
    { id: "1", nombreCurso: "PRL Básico", fechaRealizacion: "2024-01-10", duracionHoras: 20 },
    { id: "2", nombreCurso: "Trabajos en Altura", fechaRealizacion: "2024-03-15", duracionHoras: 8 },
  ],
  "2": [
    { id: "3", nombreCurso: "Primeros Auxilios", fechaRealizacion: "2024-02-20", duracionHoras: 12 },
    { id: "4", nombreCurso: "Gestión de Equipos", fechaRealizacion: "2024-03-05", duracionHoras: 16 },
  ],
  "3": [
    { id: "5", nombreCurso: "Manejo de Maquinaria", fechaRealizacion: "2024-03-05", duracionHoras: 16 },
  ],
  "4": [
    { id: "6", nombreCurso: "PRL Básico", fechaRealizacion: "2024-01-20", duracionHoras: 20 },
  ],
  "5": [
    { id: "7", nombreCurso: "PRL Básico", fechaRealizacion: "2024-01-15", duracionHoras: 20 },
    { id: "8", nombreCurso: "Liderazgo", fechaRealizacion: "2024-02-10", duracionHoras: 24 },
  ],
  "6": [],
};

export default function Trabajadores() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<typeof mockWorkers[0] | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  //todo: remove mock functionality
  const handleCreateWorker = (data: InsertTrabajador) => {
    console.log("Crear trabajador:", data);
    setIsCreateDialogOpen(false);
  };

  //todo: remove mock functionality
  const handleWorkerClick = (worker: typeof mockWorkers[0]) => {
    setSelectedWorker(worker);
    setIsDetailDialogOpen(true);
  };

  //todo: remove mock functionality
  const filteredWorkers = mockWorkers.filter((worker) => {
    const matchesSearch =
      worker.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.dni.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoriaFilter === "all" || worker.categoria === categoriaFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Trabajadores</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-worker">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Trabajador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Trabajador</DialogTitle>
            </DialogHeader>
            <WorkerForm onSubmit={handleCreateWorker} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-workers"
          />
        </div>
        <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-filter-category">
            <SelectValue placeholder="Filtrar por categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {CATEGORIAS.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredWorkers.map((worker) => (
          <WorkerCard
            key={worker.id}
            {...worker}
            onEdit={() => console.log("Editar", worker.id)}
            onDelete={() => console.log("Eliminar", worker.id)}
            onClick={() => handleWorkerClick(worker)}
          />
        ))}
      </div>

      {filteredWorkers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron trabajadores</p>
        </div>
      )}

      {/* Diálogo de detalle del trabajador */}
      {selectedWorker && (
        <WorkerDetailDialog
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          worker={selectedWorker}
          epis={mockEpisByWorker[selectedWorker.id] || []}
          cursos={mockCursosByWorker[selectedWorker.id] || []}
        />
      )}
    </div>
  );
}
