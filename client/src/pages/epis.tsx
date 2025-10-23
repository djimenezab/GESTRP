import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreVertical, Pencil, Trash2, FolderOpen, PenTool } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { EpiDocumentosDialog } from "@/components/epi-documentos-dialog";
import { type InsertEpi, type Epi, type Trabajador } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function Epis() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEpi, setSelectedEpi] = useState<Epi | null>(null);
  const [editingEpi, setEditingEpi] = useState<Epi | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isDocumentosDialogOpen, setIsDocumentosDialogOpen] = useState(false);
  const [selectedEpiForDocs, setSelectedEpiForDocs] = useState<Epi | null>(null);
  const [isFirmaDialogOpen, setIsFirmaDialogOpen] = useState(false);
  const [selectedEpiForFirma, setSelectedEpiForFirma] = useState<Epi | null>(null);
  const { toast } = useToast();

  const { data: epis = [], isLoading: episLoading } = useQuery<Epi[]>({
    queryKey: ["/api/epis"],
  });

  const { data: trabajadores = [] } = useQuery<Trabajador[]>({
    queryKey: ["/api/trabajadores"],
  });

  const { data: episFichasEv = [] } = useQuery<Array<{ id: string; nombreEpi: string }>>({
    queryKey: ["/api/epis-fichas-ev"],
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

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertEpi> }) => {
      return await apiRequest("PATCH", `/api/epis/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/epis"] });
      setIsEditDialogOpen(false);
      setEditingEpi(null);
      toast({
        title: "EPI actualizado",
        description: "El equipo de protección ha sido actualizado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el EPI",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/epis/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/epis"] });
      toast({
        title: "EPI eliminado",
        description: "El equipo de protección ha sido eliminado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el EPI",
        variant: "destructive",
      });
    },
  });

  const handleCreateEpi = (data: InsertEpi) => {
    createMutation.mutate(data);
  };

  const handleEditEpi = (data: InsertEpi) => {
    if (editingEpi) {
      updateMutation.mutate({ id: editingEpi.id, data });
    }
  };

  const handleOpenEditDialog = (epi: Epi, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEpi(epi);
    setIsEditDialogOpen(true);
  };

  const handleDeleteEpi = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("¿Estás seguro de que deseas eliminar este EPI?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleEpiClick = (epi: Epi) => {
    setSelectedEpi(epi);
    setIsDetailDialogOpen(true);
  };

  const handleOpenDocumentosDialog = (epi: Epi, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEpiForDocs(epi);
    setIsDocumentosDialogOpen(true);
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
        {user?.tipoAcceso !== "Usuario" && (
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
              <EpiForm onSubmit={handleCreateEpi} trabajadores={trabajadores} episFichasEv={episFichasEv} />
            </DialogContent>
          </Dialog>
        )}
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
              <TableHead>Código EPI</TableHead>
              <TableHead>Trabajador</TableHead>
              <TableHead>Tipo de Equipo</TableHead>
              <TableHead>Marca</TableHead>
              <TableHead>Modelo</TableHead>
              <TableHead>Fecha de Entrega</TableHead>
              <TableHead>Fecha de Caducidad</TableHead>
              <TableHead>Observaciones</TableHead>
              {user?.tipoAcceso === "Usuario" && <TableHead>Firma</TableHead>}
              <TableHead className="w-[50px]"></TableHead>
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
                <TableCell className="font-mono text-sm" data-testid={`text-correlativo-${epi.id}`}>
                  {epi.numeroCorrelativo || "-"}
                </TableCell>
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
                {user?.tipoAcceso === "Usuario" && (
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEpiForFirma(epi);
                        setIsFirmaDialogOpen(true);
                      }}
                      disabled={!!epi.firmaUrl}
                      data-testid={`button-firma-${epi.id}`}
                    >
                      <PenTool className="h-3 w-3 mr-1" />
                      {epi.firmaUrl ? "Firmado" : "Firma"}
                    </Button>
                  </TableCell>
                )}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        data-testid={`button-options-${epi.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={(e) => handleOpenDocumentosDialog(epi, e)}
                        data-testid={`button-documentos-${epi.id}`}
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        Ver Documentación
                      </DropdownMenuItem>
                      {user?.tipoAcceso !== "Usuario" && (
                        <>
                          <DropdownMenuItem 
                            onClick={(e) => handleOpenEditDialog(epi, e)}
                            data-testid={`button-edit-${epi.id}`}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => handleDeleteEpi(epi.id, e)}
                            className="text-destructive"
                            data-testid={`button-delete-${epi.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar EPI</DialogTitle>
          </DialogHeader>
          {editingEpi && (
            <EpiForm 
              onSubmit={handleEditEpi}
              trabajadores={trabajadores}
              episFichasEv={episFichasEv}
              initialData={{
                trabajadorId: editingEpi.trabajadorId,
                tipoEquipo: editingEpi.tipoEquipo,
                marca: editingEpi.marca || "",
                modelo: editingEpi.modelo || "",
                fechaEntrega: editingEpi.fechaEntrega,
                fechaCaducidad: editingEpi.fechaCaducidad || "",
                observaciones: editingEpi.observaciones || "",
              }}
            />
          )}
        </DialogContent>
      </Dialog>

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

      {selectedEpiForDocs && (
        <EpiDocumentosDialog
          open={isDocumentosDialogOpen}
          onOpenChange={setIsDocumentosDialogOpen}
          epiId={selectedEpiForDocs.id}
          numeroCorrelativo={selectedEpiForDocs.numeroCorrelativo}
        />
      )}
    </div>
  );
}
