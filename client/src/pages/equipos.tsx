import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Search, FileText, File, Image as ImageIcon, AlertCircle, Eye, Download, Wrench } from "lucide-react";
import { z } from "zod";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEquipoSchema, type InsertEquipo, type Equipo, type EpiFichaEv, type ZonaTrabajo } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "@/components/ObjectUploader";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { MaintenanceDialog } from "@/components/maintenance-dialog";

export default function Equipos() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEpisDialogOpen, setIsEpisDialogOpen] = useState(false);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingEquipo, setEditingEquipo] = useState<Equipo | null>(null);
  const [deletingEquipo, setDeletingEquipo] = useState<Equipo | null>(null);
  const [viewingEquipo, setViewingEquipo] = useState<Equipo | null>(null);
  const [maintenanceEquipo, setMaintenanceEquipo] = useState<Equipo | null>(null);
  const { toast } = useToast();

  const { data: equipos = [], isLoading } = useQuery<Equipo[]>({
    queryKey: ["/api/equipos"],
  });

  const { data: fichasEpis = [] } = useQuery<EpiFichaEv[]>({
    queryKey: ["/api/epis-fichas-ev"],
  });

  const { data: zonasTrabajo = [] } = useQuery<ZonaTrabajo[]>({
    queryKey: ["/api/zonas-trabajo"],
  });

  const { data: episObligatoriosSeleccionados = [] } = useQuery<EpiFichaEv[]>({
    queryKey: ["/api/equipos", editingEquipo?.id, "epis-obligatorios"],
    enabled: !!editingEquipo?.id,
  });

  const { data: episObligatoriosVisualizacion = [] } = useQuery<EpiFichaEv[]>({
    queryKey: ["/api/equipos", viewingEquipo?.id, "epis-obligatorios"],
    enabled: !!viewingEquipo?.id,
  });

  // Actualizar formulario de edición cuando se cargan los EPIs obligatorios
  useEffect(() => {
    if (episObligatoriosSeleccionados.length > 0 && editingEquipo) {
      editForm.setValue("episObligatorios", episObligatoriosSeleccionados.map(e => e.id));
    }
  }, [episObligatoriosSeleccionados, editingEquipo]);

  const createForm = useForm<InsertEquipo & { episObligatorios: string[] }>({
    resolver: zodResolver(insertEquipoSchema.extend({
      episObligatorios: z.array(z.string()).optional(),
    })),
    defaultValues: {
      nombre: "",
      marca: "",
      modelo: "",
      numeroSerie: "",
      fechaAdquisicion: "",
      zonaId: "",
      fichaEvaluacionUrl: "",
      manualUrl: "",
      imagenUrl: "",
      episObligatorios: [],
    },
  });

  const editForm = useForm<InsertEquipo & { episObligatorios: string[] }>({
    resolver: zodResolver(insertEquipoSchema.extend({
      episObligatorios: z.array(z.string()).optional(),
    })),
    defaultValues: {
      nombre: "",
      marca: "",
      modelo: "",
      numeroSerie: "",
      fechaAdquisicion: "",
      zonaId: "",
      fichaEvaluacionUrl: "",
      manualUrl: "",
      imagenUrl: "",
      episObligatorios: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertEquipo & { episObligatorios: string[] }) => {
      const { episObligatorios, ...equipoData } = data;
      const response = await fetch("/api/equipos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(equipoData),
      });
      
      if (!response.ok) throw new Error("Error al crear equipo");
      const equipo = await response.json();
      
      if (episObligatorios.length > 0) {
        await apiRequest("POST", `/api/equipos/${equipo.id}/epis-obligatorios`, { epiIds: episObligatorios });
      }
      
      return equipo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipos"] });
      setIsDialogOpen(false);
      createForm.reset();
      toast({
        title: "Equipo creado",
        description: "El equipo ha sido creado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el equipo",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertEquipo & { episObligatorios: string[] }) => {
      if (!editingEquipo) return;
      const { episObligatorios, ...equipoData } = data;
      const equipo = await apiRequest("PATCH", `/api/equipos/${editingEquipo.id}`, equipoData);
      
      await apiRequest("POST", `/api/equipos/${editingEquipo.id}/epis-obligatorios`, { epiIds: episObligatorios });
      
      return equipo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipos"] });
      queryClient.invalidateQueries({ queryKey: ["/api/equipos", editingEquipo?.id, "epis-obligatorios"] });
      setIsEditDialogOpen(false);
      setEditingEquipo(null);
      editForm.reset();
      toast({
        title: "Equipo actualizado",
        description: "El equipo ha sido actualizado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el equipo",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/equipos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/equipos"] });
      setIsDeleteDialogOpen(false);
      setDeletingEquipo(null);
      toast({
        title: "Equipo eliminado",
        description: "El equipo ha sido eliminado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el equipo",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (equipo: Equipo) => {
    setEditingEquipo(equipo);
    editForm.reset({
      nombre: equipo.nombre,
      marca: equipo.marca,
      modelo: equipo.modelo,
      numeroSerie: equipo.numeroSerie,
      fechaAdquisicion: equipo.fechaAdquisicion,
      zonaId: equipo.zonaId || "",
      fichaEvaluacionUrl: equipo.fichaEvaluacionUrl || "",
      manualUrl: equipo.manualUrl || "",
      imagenUrl: equipo.imagenUrl || "",
      episObligatorios: [],
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (equipo: Equipo) => {
    setDeletingEquipo(equipo);
    setIsDeleteDialogOpen(true);
  };

  const handleViewEpis = (equipo: Equipo) => {
    setViewingEquipo(equipo);
    setIsEpisDialogOpen(true);
  };

  const filteredEquipos = equipos.filter(equipo =>
    equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipo.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    equipo.numeroSerie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = (form: any, fieldName: string) => {
    return async () => {
      const response = await fetch("/api/objects/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        throw new Error("Error al obtener URL de subida");
      }
      
      const data = await response.json();
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    };
  };

  const handleUploadComplete = (form: any, fieldName: string) => {
    return (result: any) => {
      if (result.successful && result.successful.length > 0) {
        const file = result.successful[0];
        // Extract the object ID from the upload URL (format: https://.../bucket/uploads/UUID)
        const uploadUrl = file.uploadURL || file.response?.uploadURL;
        if (uploadUrl) {
          const urlParts = new URL(uploadUrl).pathname.split('/');
          const uploadsIndex = urlParts.indexOf('uploads');
          if (uploadsIndex >= 0 && urlParts[uploadsIndex + 1]) {
            const objectId = urlParts[uploadsIndex + 1];
            const objectPath = `/objects/uploads/${objectId}`;
            form.setValue(fieldName, objectPath, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
            toast({
              title: "Archivo subido",
              description: "El archivo ha sido subido correctamente",
            });
          }
        }
      }
    };
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="text-page-title">Equipos</h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Gestión de equipos y maquinaria
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle>Listado de Equipos</CardTitle>
            <CardDescription>Gestiona los equipos y su información</CardDescription>
          </div>
          {user?.tipoAcceso !== "Usuario" && (
            <Button onClick={() => setIsDialogOpen(true)} data-testid="button-add-equipo">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Equipo
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, marca, modelo o nº serie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-equipo"
            />
          </div>

          {isLoading ? (
            <p className="text-center text-muted-foreground">Cargando equipos...</p>
          ) : filteredEquipos.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground" data-testid="text-no-equipos">
                {searchTerm ? "No se encontraron equipos" : "No hay equipos registrados"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Nº Serie</TableHead>
                  <TableHead>Fecha Adquisición</TableHead>
                  {user?.tipoAcceso !== "Usuario" && <TableHead>Zona</TableHead>}
                  <TableHead>Documentos</TableHead>
                  <TableHead>Mantenimiento</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipos.map((equipo) => {
                  const zona = zonasTrabajo.find(z => z.id === equipo.zonaId);
                  const isUsuario = user?.tipoAcceso === "Usuario";
                  return (
                    <TableRow 
                      key={equipo.id} 
                      data-testid={`row-equipo-${equipo.id}`}
                      onClick={isUsuario ? () => handleViewEpis(equipo) : () => handleEdit(equipo)}
                      className="cursor-pointer hover-elevate"
                    >
                      <TableCell className="font-medium" data-testid={`text-nombre-${equipo.id}`}>
                        {equipo.nombre}
                      </TableCell>
                      <TableCell data-testid={`text-marca-${equipo.id}`}>
                        {equipo.marca}
                      </TableCell>
                      <TableCell data-testid={`text-modelo-${equipo.id}`}>{equipo.modelo}</TableCell>
                      <TableCell data-testid={`text-numero-serie-${equipo.id}`}>{equipo.numeroSerie}</TableCell>
                      <TableCell data-testid={`text-fecha-${equipo.id}`}>
                        {format(new Date(equipo.fechaAdquisicion), "dd/MM/yyyy", { locale: es })}
                      </TableCell>
                      {user?.tipoAcceso !== "Usuario" && (
                        <TableCell data-testid={`text-zona-${equipo.id}`}>
                          {zona?.zona || "-"}
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex gap-1">
                          {equipo.imagenUrl && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge 
                                  variant="outline" 
                                  className="cursor-pointer hover-elevate"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(equipo.imagenUrl!, '_blank');
                                  }}
                                  data-testid={`button-view-imagen-${equipo.id}`}
                                >
                                  <ImageIcon className="h-3 w-3" />
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Imagen</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {equipo.fichaEvaluacionUrl && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge 
                                  variant="outline" 
                                  className="cursor-pointer hover-elevate"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(equipo.fichaEvaluacionUrl!, '_blank');
                                  }}
                                  data-testid={`button-view-ficha-${equipo.id}`}
                                >
                                  <FileText className="h-3 w-3" />
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Ficha Ev.</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {equipo.manualUrl && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge 
                                  variant="outline" 
                                  className="cursor-pointer hover-elevate"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(equipo.manualUrl!, '_blank');
                                  }}
                                  data-testid={`button-view-manual-${equipo.id}`}
                                >
                                  <File className="h-3 w-3" />
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Manual</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMaintenanceEquipo(equipo);
                            setIsMaintenanceDialogOpen(true);
                          }}
                          data-testid={`button-mantenimiento-${equipo.id}`}
                        >
                          <Wrench className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        {!isUsuario && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(equipo);
                            }}
                            data-testid={`button-delete-equipo-${equipo.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Equipo</DialogTitle>
            <DialogDescription>
              Agrega un nuevo equipo al registro
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
              <FormField
                control={createForm.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Equipo *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-nombre" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-marca" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="modelo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-modelo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="numeroSerie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº Serie *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-numero-serie" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="fechaAdquisicion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Adquisición *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-fecha-adquisicion" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="zonaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger data-testid="select-zona">
                          <SelectValue placeholder="Ninguna (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {zonasTrabajo.map((zona) => (
                          <SelectItem 
                            key={zona.id} 
                            value={zona.id}
                            data-testid={`select-option-${zona.id}`}
                          >
                            {zona.zona}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="imagenUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagen del Equipo</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={handleFileUpload(createForm, "imagenUrl")}
                            onComplete={handleUploadComplete(createForm, "imagenUrl")}
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Subir Imagen
                          </ObjectUploader>
                          {field.value && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="default"
                                onClick={() => field.value && window.open(field.value, '_blank')}
                                data-testid="button-view-imagen-create"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="default"
                                onClick={() => {
                                  if (field.value) {
                                    const link = document.createElement('a');
                                    link.href = field.value;
                                    link.download = 'imagen_equipo';
                                    link.click();
                                  }
                                }}
                                data-testid="button-download-imagen-create"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                              </Button>
                            </>
                          )}
                        </div>
                        {field.value && <p className="text-sm text-muted-foreground">Archivo subido</p>}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="fichaEvaluacionUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ficha de Evaluación</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <input type="hidden" {...field} value={field.value || ""} />
                        <div className="flex gap-2">
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={handleFileUpload(createForm, "fichaEvaluacionUrl")}
                            onComplete={handleUploadComplete(createForm, "fichaEvaluacionUrl")}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Subir Ficha
                          </ObjectUploader>
                          {field.value && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="default"
                                onClick={() => field.value && window.open(field.value, '_blank')}
                                data-testid="button-view-ficha-create"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="default"
                                onClick={() => {
                                  if (field.value) {
                                    const link = document.createElement('a');
                                    link.href = field.value;
                                    link.download = 'ficha_evaluacion';
                                    link.click();
                                  }
                                }}
                                data-testid="button-download-ficha-create"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                              </Button>
                            </>
                          )}
                        </div>
                        {field.value && <p className="text-sm text-muted-foreground">Archivo subido</p>}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="manualUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manual</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={handleFileUpload(createForm, "manualUrl")}
                            onComplete={handleUploadComplete(createForm, "manualUrl")}
                          >
                            <File className="h-4 w-4 mr-2" />
                            Subir Manual
                          </ObjectUploader>
                          {field.value && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="default"
                                onClick={() => field.value && window.open(field.value, '_blank')}
                                data-testid="button-view-manual-create"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="default"
                                onClick={() => {
                                  if (field.value) {
                                    const link = document.createElement('a');
                                    link.href = field.value;
                                    link.download = 'manual_equipo';
                                    link.click();
                                  }
                                }}
                                data-testid="button-download-manual-create"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                              </Button>
                            </>
                          )}
                        </div>
                        {field.value && <p className="text-sm text-muted-foreground">Archivo subido</p>}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={createForm.control}
                name="episObligatorios"
                render={() => (
                  <FormItem>
                    <FormLabel>EPIs Obligatorios</FormLabel>
                    <FormControl>
                      <div className="border rounded-md p-4 max-h-40 overflow-y-auto">
                        {fichasEpis.map((epi) => (
                          <FormField
                            key={epi.id}
                            control={createForm.control}
                            name="episObligatorios"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(epi.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...(field.value || []), epi.id])
                                        : field.onChange(
                                            field.value?.filter((value) => value !== epi.id)
                                          );
                                    }}
                                    data-testid={`checkbox-epi-${epi.id}`}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  {epi.nombreEpi}
                                </FormLabel>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  data-testid="button-cancel-equipo"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-equipo">
                  {createMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Equipo</DialogTitle>
            <DialogDescription>
              Modifica la información del equipo
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
              <FormField
                control={editForm.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Equipo *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-nombre" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-marca" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="modelo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-modelo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="numeroSerie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nº Serie *</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-numero-serie" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="fechaAdquisicion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Adquisición *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-edit-fecha-adquisicion" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="zonaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-zona">
                          <SelectValue placeholder="Ninguna (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {zonasTrabajo.map((zona) => (
                          <SelectItem 
                            key={zona.id} 
                            value={zona.id}
                            data-testid={`select-edit-option-${zona.id}`}
                          >
                            {zona.zona}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="imagenUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagen del Equipo</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={handleFileUpload(editForm, "imagenUrl")}
                            onComplete={handleUploadComplete(editForm, "imagenUrl")}
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            {field.value ? "Cambiar Imagen" : "Subir Imagen"}
                          </ObjectUploader>
                          {field.value && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="default"
                                onClick={() => field.value && window.open(field.value, '_blank')}
                                data-testid="button-view-imagen"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="default"
                                onClick={() => {
                                  if (field.value) {
                                    const link = document.createElement('a');
                                    link.href = field.value;
                                    link.download = 'imagen_equipo';
                                    link.click();
                                  }
                                }}
                                data-testid="button-download-imagen"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                              </Button>
                            </>
                          )}
                        </div>
                        {field.value && <p className="text-sm text-muted-foreground">Archivo disponible</p>}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="fichaEvaluacionUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ficha de Evaluación</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={handleFileUpload(editForm, "fichaEvaluacionUrl")}
                            onComplete={handleUploadComplete(editForm, "fichaEvaluacionUrl")}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            {field.value ? "Cambiar Ficha" : "Subir Ficha"}
                          </ObjectUploader>
                          {field.value && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="default"
                                onClick={() => field.value && window.open(field.value, '_blank')}
                                data-testid="button-view-ficha"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="default"
                                onClick={() => {
                                  if (field.value) {
                                    const link = document.createElement('a');
                                    link.href = field.value;
                                    link.download = 'ficha_evaluacion';
                                    link.click();
                                  }
                                }}
                                data-testid="button-download-ficha"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                              </Button>
                            </>
                          )}
                        </div>
                        {field.value && <p className="text-sm text-muted-foreground">Archivo disponible</p>}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="manualUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manual</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={handleFileUpload(editForm, "manualUrl")}
                            onComplete={handleUploadComplete(editForm, "manualUrl")}
                          >
                            <File className="h-4 w-4 mr-2" />
                            {field.value ? "Cambiar Manual" : "Subir Manual"}
                          </ObjectUploader>
                          {field.value && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="default"
                                onClick={() => field.value && window.open(field.value, '_blank')}
                                data-testid="button-view-manual"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="default"
                                onClick={() => {
                                  if (field.value) {
                                    const link = document.createElement('a');
                                    link.href = field.value;
                                    link.download = 'manual_equipo';
                                    link.click();
                                  }
                                }}
                                data-testid="button-download-manual"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                              </Button>
                            </>
                          )}
                        </div>
                        {field.value && <p className="text-sm text-muted-foreground">Archivo disponible</p>}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="episObligatorios"
                render={() => (
                  <FormItem>
                    <FormLabel>EPIs Obligatorios</FormLabel>
                    <FormControl>
                      <div className="border rounded-md p-4 max-h-40 overflow-y-auto">
                        {fichasEpis.map((epi) => (
                          <FormField
                            key={epi.id}
                            control={editForm.control}
                            name="episObligatorios"
                            render={({ field }) => {
                              const isSelected = field.value?.includes(epi.id) || 
                                episObligatoriosSeleccionados.some(e => e.id === epi.id);
                              
                              return (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), epi.id])
                                          : field.onChange(
                                              field.value?.filter((value) => value !== epi.id)
                                            );
                                      }}
                                      data-testid={`checkbox-edit-epi-${epi.id}`}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {epi.nombreEpi}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  data-testid="button-cancel-edit-equipo"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMutation.isPending} data-testid="button-submit-edit-equipo">
                  {updateMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* EPIs Dialog for Usuario */}
      <Dialog open={isEpisDialogOpen} onOpenChange={setIsEpisDialogOpen}>
        <DialogContent data-testid="dialog-epis-equipo">
          <DialogHeader>
            <DialogTitle>EPIs Obligatorios</DialogTitle>
            <DialogDescription>
              Equipo: {viewingEquipo?.marca} {viewingEquipo?.modelo}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {episObligatoriosVisualizacion.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground" data-testid="text-no-epis-obligatorios">
                  No hay EPIs obligatorios registrados para este equipo
                </p>
              </div>
            ) : (
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                <ul className="space-y-2">
                  {episObligatoriosVisualizacion.map((epi) => (
                    <li 
                      key={epi.id} 
                      className="flex items-center space-x-2"
                      data-testid={`text-epi-obligatorio-${epi.id}`}
                    >
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span>{epi.nombreEpi}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={() => setIsEpisDialogOpen(false)}
              data-testid="button-close-epis-dialog"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar equipo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el equipo{" "}
              <strong>{deletingEquipo?.marca} {deletingEquipo?.modelo}</strong> y todos sus datos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-equipo">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingEquipo && deleteMutation.mutate(deletingEquipo.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-equipo"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Maintenance Dialog */}
      {maintenanceEquipo && (
        <MaintenanceDialog
          equipoId={maintenanceEquipo.id}
          equipoNombre={`${maintenanceEquipo.nombre} - ${maintenanceEquipo.marca} ${maintenanceEquipo.modelo}`}
          equipoZonaId={maintenanceEquipo.zonaId || ""}
          open={isMaintenanceDialogOpen}
          onOpenChange={setIsMaintenanceDialogOpen}
        />
      )}
    </div>
  );
}
