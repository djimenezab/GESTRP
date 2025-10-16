import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { CATEGORIAS, type InsertTrabajador, type Trabajador } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Trabajadores() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Trabajador | null>(null);
  const [editingWorker, setEditingWorker] = useState<Trabajador | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: trabajadores = [], isLoading } = useQuery<Trabajador[]>({
    queryKey: ["/api/trabajadores"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertTrabajador) => {
      return await apiRequest("POST", "/api/trabajadores", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trabajadores"] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Trabajador creado",
        description: "El trabajador ha sido añadido correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el trabajador",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/trabajadores/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trabajadores"] });
      toast({
        title: "Trabajador eliminado",
        description: "El trabajador ha sido eliminado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el trabajador",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertTrabajador> }) => {
      return await apiRequest("PATCH", `/api/trabajadores/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trabajadores"] });
      setIsEditDialogOpen(false);
      setEditingWorker(null);
      toast({
        title: "Trabajador actualizado",
        description: "Los datos del trabajador han sido actualizados correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el trabajador",
        variant: "destructive",
      });
    },
  });

  const handleCreateWorker = (data: InsertTrabajador) => {
    createMutation.mutate(data);
  };

  const handleEditWorker = (data: InsertTrabajador) => {
    if (editingWorker) {
      updateMutation.mutate({ id: editingWorker.id, data });
    }
  };

  const handleOpenEditDialog = (worker: Trabajador) => {
    setEditingWorker(worker);
    setIsEditDialogOpen(true);
  };

  const handleWorkerClick = (worker: Trabajador) => {
    setSelectedWorker(worker);
    setIsDetailDialogOpen(true);
  };

  const handleDeleteWorker = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este trabajador?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredWorkers = trabajadores.filter((worker) => {
    const matchesSearch =
      worker.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.dni.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoriaFilter === "all" || worker.categoria === categoriaFilter;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando trabajadores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Trabajadores</h1>
        {user?.tipoAcceso !== "Usuario" && (
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
        )}
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
            onEdit={() => handleOpenEditDialog(worker)}
            onDelete={() => handleDeleteWorker(worker.id)}
            onClick={() => handleWorkerClick(worker)}
          />
        ))}
      </div>

      {filteredWorkers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron trabajadores</p>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Trabajador</DialogTitle>
          </DialogHeader>
          {editingWorker && (
            <WorkerForm 
              onSubmit={handleEditWorker}
              initialData={{
                nombreCompleto: editingWorker.nombreCompleto,
                dni: editingWorker.dni,
                categoria: editingWorker.categoria as typeof CATEGORIAS[number],
                fechaNacimiento: editingWorker.fechaNacimiento,
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {selectedWorker && (
        <WorkerDetailDialog
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          worker={selectedWorker}
        />
      )}
    </div>
  );
}
