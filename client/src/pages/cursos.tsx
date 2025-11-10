import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreVertical, Pencil, Trash2, FileText } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CourseForm } from "@/components/course-form";
import { ComisionServicioViewer } from "@/components/comision-servicio-viewer";
import { type InsertCurso, type Curso, type Trabajador } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Cursos() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isComisionDialogOpen, setIsComisionDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCurso, setEditingCurso] = useState<Curso | null>(null);
  const [viewingComisionCurso, setViewingComisionCurso] = useState<Curso | null>(null);
  const { toast } = useToast();

  const { data: cursos = [], isLoading: cursosLoading } = useQuery<Curso[]>({
    queryKey: ["/api/cursos"],
  });

  const { data: trabajadores = [] } = useQuery<Trabajador[]>({
    queryKey: ["/api/trabajadores"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCurso) => {
      return await apiRequest("POST", "/api/cursos", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cursos"] });
      setIsDialogOpen(false);
      toast({
        title: "Curso registrado",
        description: "El curso ha sido registrado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo registrar el curso",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertCurso> }) => {
      return await apiRequest("PATCH", `/api/cursos/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cursos"] });
      setIsEditDialogOpen(false);
      setEditingCurso(null);
      toast({
        title: "Curso actualizado",
        description: "El curso ha sido actualizado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el curso",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/cursos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cursos"] });
      toast({
        title: "Curso eliminado",
        description: "El curso ha sido eliminado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el curso",
        variant: "destructive",
      });
    },
  });

  const handleCreateCurso = (data: InsertCurso) => {
    createMutation.mutate(data);
  };

  const handleEditCurso = (data: InsertCurso) => {
    if (editingCurso) {
      updateMutation.mutate({ id: editingCurso.id, data });
    }
  };

  const handleOpenEditDialog = (curso: Curso, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCurso(curso);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCurso = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro de que deseas eliminar este curso?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleOpenComisionDialog = (curso: Curso, e: React.MouseEvent) => {
    e.stopPropagation();
    setViewingComisionCurso(curso);
    setIsComisionDialogOpen(true);
  };

  // Combinar cursos con datos de trabajadores
  const cursosWithWorkers = cursos.map(curso => {
    const trabajador = trabajadores.find(t => t.id === curso.trabajadorId);
    return {
      ...curso,
      trabajador: trabajador?.nombreCompleto || "Desconocido",
    };
  });

  // Filtrar y ordenar cursos
  const filteredCursos = cursosWithWorkers
    .filter((curso) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        curso.trabajador.toLowerCase().includes(searchLower) ||
        curso.nombreCurso.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => new Date(b.fechaRealizacion).getTime() - new Date(a.fechaRealizacion).getTime());

  if (cursosLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Cargando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Cursos Realizados</h1>
        {user?.tipoAcceso !== "Usuario" && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-curso">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Curso
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Registrar Nuevo Curso</DialogTitle>
              </DialogHeader>
              <CourseForm onSubmit={handleCreateCurso} trabajadores={trabajadores} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por trabajador o curso..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
          data-testid="input-search-cursos"
        />
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {user?.tipoAcceso !== "Usuario" && <TableHead>Trabajador</TableHead>}
              <TableHead>Nombre del Curso</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Duración (h)</TableHead>
              <TableHead>Observaciones</TableHead>
              <TableHead className="w-[50px]">Comisión</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCursos.map((curso) => (
              <TableRow key={curso.id} data-testid={`row-curso-${curso.id}`}>
                {user?.tipoAcceso !== "Usuario" && (
                  <TableCell className="font-medium" data-testid={`text-worker-${curso.id}`}>
                    {curso.trabajador}
                  </TableCell>
                )}
                <TableCell data-testid={`text-nombre-curso-${curso.id}`}>{curso.nombreCurso}</TableCell>
                <TableCell>{format(new Date(curso.fechaRealizacion), "dd/MM/yyyy", { locale: es })}</TableCell>
                <TableCell>{curso.duracionHoras}h</TableCell>
                <TableCell className="text-muted-foreground">{curso.observaciones || "-"}</TableCell>
                <TableCell>
                  {user?.tipoAcceso === "Usuario" ? (
                    // Para usuarios: mostrar icono de documento directo si hay comisión
                    curso.comisionServicioUrl ? (
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => handleOpenComisionDialog(curso, e)}
                        data-testid={`button-view-comision-${curso.id}`}
                        title="Ver Comisión de Servicio"
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    ) : null
                  ) : (
                    // Para administradores: mantener menú desplegable
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          data-testid={`button-options-${curso.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {curso.comisionServicioUrl && (
                          <DropdownMenuItem 
                            onClick={(e) => handleOpenComisionDialog(curso, e)}
                            data-testid={`button-view-comision-${curso.id}`}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Ver Comisión de Servicio
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={(e) => handleOpenEditDialog(curso, e)}
                          data-testid={`button-edit-${curso.id}`}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => handleDeleteCurso(curso.id, e)}
                          className="text-destructive"
                          data-testid={`button-delete-${curso.id}`}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredCursos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No se encontraron cursos</p>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Curso</DialogTitle>
          </DialogHeader>
          {editingCurso && (
            <CourseForm 
              onSubmit={handleEditCurso}
              trabajadores={trabajadores}
              initialData={{
                trabajadorId: editingCurso.trabajadorId,
                nombreCurso: editingCurso.nombreCurso,
                fechaRealizacion: editingCurso.fechaRealizacion,
                duracionHoras: editingCurso.duracionHoras,
                observaciones: editingCurso.observaciones || "",
                comisionServicioUrl: editingCurso.comisionServicioUrl || "",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isComisionDialogOpen} onOpenChange={setIsComisionDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comisión de Servicio</DialogTitle>
          </DialogHeader>
          {viewingComisionCurso && (
            <ComisionServicioViewer curso={viewingComisionCurso} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
