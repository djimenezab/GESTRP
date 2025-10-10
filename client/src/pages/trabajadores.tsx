import { useState } from "react";
import { WorkerCard } from "@/components/worker-card";
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

export default function Trabajadores() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  //todo: remove mock functionality
  const handleCreateWorker = (data: InsertTrabajador) => {
    console.log("Crear trabajador:", data);
    setIsDialogOpen(false);
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
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            onClick={() => console.log("Ver detalles", worker.id)}
          />
        ))}
      </div>

      {filteredWorkers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron trabajadores</p>
        </div>
      )}
    </div>
  );
}
