import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Search, MoreVertical, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AccidentForm } from "@/components/accident-form";
import type { Accidente, Trabajador, InsertAccidente } from "@shared/schema";

const gravedadColors = {
  LEVE: "bg-chart-2 text-white",
  MODERADO: "bg-chart-3 text-white",
  GRAVE: "bg-destructive text-destructive-foreground",
};

const tipoAccidenteLabels = {
  ACCIDENTE_SERVICIO: "Accidente en acto de servicio",
  ENFERMEDAD_PROFESIONAL: "Enfermedad profesional",
};

export default function Accidentes() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAccidente, setEditingAccidente] = useState<Accidente | null>(null);
  const { toast } = useToast();

  // Fetch accidents
  const { data: accidentes = [], isLoading: accidentesLoading } = useQuery<Accidente[]>({
    queryKey: ['/api/accidentes'],
  });

  // Fetch workers for filtering
  const { data: trabajadores = [] } = useQuery<Trabajador[]>({
    queryKey: ['/api/trabajadores'],
  });

  // Create accident mutation
  const createAccidenteMutation = useMutation({
    mutationFn: async (data: InsertAccidente) => {
      return await apiRequest("POST", "/api/accidentes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accidentes'] });
      setDialogOpen(false);
      toast({
        title: "Accidente registrado",
        description: "El accidente ha sido registrado exitosamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo registrar el accidente.",
      });
    },
  });

  // Update accident mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertAccidente> }) => {
      return await apiRequest("PATCH", `/api/accidentes/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accidentes'] });
      setEditDialogOpen(false);
      setEditingAccidente(null);
      toast({
        title: "Accidente actualizado",
        description: "El accidente ha sido actualizado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar el accidente.",
      });
    },
  });

  // Delete accident mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/accidentes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/accidentes'] });
      toast({
        title: "Accidente eliminado",
        description: "El accidente ha sido eliminado correctamente.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo eliminar el accidente.",
      });
    },
  });

  const handleOpenEditDialog = (accidente: Accidente, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAccidente(accidente);
    setEditDialogOpen(true);
  };

  const handleDeleteAccidente = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro de que deseas eliminar este accidente?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditAccidente = (data: InsertAccidente) => {
    if (editingAccidente) {
      updateMutation.mutate({ id: editingAccidente.id, data });
    }
  };

  // Create a map of trabajador IDs to names
  const trabajadorMap = new Map(trabajadores.map(t => [t.id, t.nombreCompleto]));

  // Filter accidents by search term (worker name)
  const filteredAccidentes = accidentes.filter(accidente => {
    const trabajadorNombre = trabajadorMap.get(accidente.trabajadorId) || "";
    return trabajadorNombre.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sort by date descending (most recent first)
  const sortedAccidentes = [...filteredAccidentes].sort((a, b) => 
    new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  if (accidentesLoading) {
    return (
      <div className="p-6">
        <div className="text-muted-foreground">Cargando accidentes...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Accidentes Laborales</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-nuevo-accidente">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Accidente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Accidente</DialogTitle>
            </DialogHeader>
            <AccidentForm
              onSubmit={(data) => createAccidenteMutation.mutate(data)}
              isLoading={createAccidenteMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por trabajador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search-accidentes"
          />
        </div>
      </div>

      <Card>
        {sortedAccidentes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchTerm ? "No se encontraron accidentes" : "No hay accidentes registrados"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trabajador</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Lugar</TableHead>
                <TableHead>Gravedad</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAccidentes.map((accidente) => (
                <TableRow key={accidente.id} data-testid={`row-accidente-${accidente.id}`}>
                  <TableCell className="font-medium" data-testid={`text-worker-${accidente.id}`}>
                    {trabajadorMap.get(accidente.trabajadorId) || "Desconocido"}
                  </TableCell>
                  <TableCell data-testid={`text-tipo-${accidente.id}`}>
                    {tipoAccidenteLabels[accidente.tipoAccidente as keyof typeof tipoAccidenteLabels]}
                  </TableCell>
                  <TableCell>{format(new Date(accidente.fecha), "dd/MM/yyyy", { locale: es })}</TableCell>
                  <TableCell>{accidente.horaAccidente}</TableCell>
                  <TableCell>{accidente.lugarAccidente}</TableCell>
                  <TableCell>
                    <Badge className={gravedadColors[accidente.gravedad as keyof typeof gravedadColors]}>
                      {accidente.gravedad}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          data-testid={`button-options-${accidente.id}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={(e) => handleOpenEditDialog(accidente, e)}
                          data-testid={`button-edit-${accidente.id}`}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleDeleteAccidente(accidente.id, e)}
                          className="text-destructive"
                          data-testid={`button-delete-${accidente.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Accidente</DialogTitle>
          </DialogHeader>
          {editingAccidente && (
            <AccidentForm
              onSubmit={handleEditAccidente}
              initialData={{
                ...editingAccidente,
                tipoAccidente: editingAccidente.tipoAccidente as "ACCIDENTE_SERVICIO" | "ENFERMEDAD_PROFESIONAL",
                gravedad: editingAccidente.gravedad as "LEVE" | "MODERADO" | "GRAVE",
                observaciones: editingAccidente.observaciones || "",
                trabajadorParteId: editingAccidente.trabajadorParteId || ""
              }}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
