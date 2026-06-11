import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Calendar, FileText, Plus, Pencil, Upload, Download, Trash2, FolderOpen } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EpiForm } from "@/components/epi-form";
import { CourseForm } from "@/components/course-form";
import { AccidentForm } from "@/components/accident-form";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { InsertEpi, InsertCurso, InsertAccidente, DocumentoExpediente, Trabajador, Epi, Curso, Accidente } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useRoute } from "wouter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const gravedadColors = {
  LEVE: "bg-chart-2 text-white",
  MODERADO: "bg-chart-3 text-white",
  GRAVE: "bg-destructive text-destructive-foreground",
};

export default function WorkerDetail() {
  const [, params] = useRoute("/trabajadores/:id");
  const trabajadorId = params?.id || "";
  
  const [activeTab, setActiveTab] = useState("epis");
  const [isEpiDialogOpen, setIsEpiDialogOpen] = useState(false);
  const [isCursoDialogOpen, setIsCursoDialogOpen] = useState(false);
  const [isAccidenteDialogOpen, setIsAccidenteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Query para obtener trabajador
  const { data: trabajador, isLoading: isLoadingTrabajador } = useQuery<Trabajador>({
    queryKey: [`/api/trabajadores/${trabajadorId}`],
  });

  // Query para obtener EPIs del trabajador
  const { data: epis = [], isLoading: isLoadingEpis } = useQuery<Epi[]>({
    queryKey: [`/api/trabajadores/${trabajadorId}/epis`],
    enabled: activeTab === 'epis',
  });

  // Query para obtener cursos del trabajador
  const { data: cursos = [], isLoading: isLoadingCursos } = useQuery<Curso[]>({
    queryKey: [`/api/trabajadores/${trabajadorId}/cursos`],
    enabled: activeTab === 'cursos',
  });

  // Query para obtener accidentes del trabajador
  const { data: accidentes = [], isLoading: isLoadingAccidentes } = useQuery<Accidente[]>({
    queryKey: [`/api/trabajadores/${trabajadorId}/accidentes`],
    enabled: activeTab === 'accidentes',
  });

  // Query para obtener documentos del expediente
  const { data: documentosExpediente = [], isLoading: isLoadingDocumentos } = useQuery<DocumentoExpediente[]>({
    queryKey: [`/api/trabajadores/${trabajadorId}/documentos-expediente`],
    enabled: activeTab === 'expediente',
  });

  // Query para obtener fichas de EPIs (para el selector en el formulario)
  const { data: episFichasEv = [] } = useQuery<Array<{ id: string; nombreEpi: string }>>({
    queryKey: ['/api/epis-fichas-ev'],
    enabled: isEpiDialogOpen,
  });

  // Mutation para crear documento
  const createDocumentoMutation = useMutation({
    mutationFn: async (data: { trabajadorId: string; nombreDocumento: string; archivoUrl: string; tipoArchivo?: string; tamanoBytes?: number; descripcion?: string }) => {
      return await apiRequest("POST", "/api/documentos-expediente", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trabajadores/${trabajadorId}/documentos-expediente`] });
      toast({
        title: "Documento subido",
        description: "El documento se ha agregado al expediente correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo subir el documento.",
        variant: "destructive",
      });
    },
  });

  // Mutation para eliminar documento
  const deleteDocumentoMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/documentos-expediente/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trabajadores/${trabajadorId}/documentos-expediente`] });
      toast({
        title: "Documento eliminado",
        description: "El documento se ha eliminado del expediente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento.",
        variant: "destructive",
      });
    },
  });

  const handleCreateEpi = async (data: InsertEpi) => {
    try {
      await apiRequest("POST", "/api/epis", data);
      queryClient.invalidateQueries({ queryKey: [`/api/trabajadores/${trabajadorId}/epis`] });
      setIsEpiDialogOpen(false);
      toast({
        title: "EPI registrado",
        description: "El equipo de protección ha sido registrado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el EPI.",
        variant: "destructive",
      });
    }
  };

  const handleCreateCurso = async (data: InsertCurso) => {
    try {
      await apiRequest("POST", "/api/cursos", data);
      queryClient.invalidateQueries({ queryKey: [`/api/trabajadores/${trabajadorId}/cursos`] });
      setIsCursoDialogOpen(false);
      toast({
        title: "Curso registrado",
        description: "El curso ha sido registrado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el curso.",
        variant: "destructive",
      });
    }
  };

  const handleCreateAccidente = async (data: InsertAccidente) => {
    try {
      await apiRequest("POST", "/api/accidentes", data);
      queryClient.invalidateQueries({ queryKey: [`/api/trabajadores/${trabajadorId}/accidentes`] });
      setIsAccidenteDialogOpen(false);
      toast({
        title: "Accidente registrado",
        description: "El accidente ha sido registrado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo registrar el accidente.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingTrabajador || !trabajador) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando trabajador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Detalle del Trabajador</h1>
        <Button variant="outline" data-testid="button-edit-worker">
          <Pencil className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="text-2xl font-bold" data-testid="text-worker-name">
                  {trabajador.nombreCompleto}
                </h2>
                <Badge variant="secondary" className="mt-2" data-testid="badge-category">
                  {trabajador.categoria}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span data-testid="text-dni">DNI: {trabajador.dni}</span>
                </div>
                {trabajador.fechaNacimiento && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span data-testid="text-birth">
                      Nacimiento: {format(new Date(trabajador.fechaNacimiento), "dd/MM/yyyy", { locale: es })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="epis" data-testid="tab-epis">EPIs</TabsTrigger>
          <TabsTrigger value="cursos" data-testid="tab-cursos">Cursos</TabsTrigger>
          <TabsTrigger value="accidentes" data-testid="tab-accidentes">Accidentes</TabsTrigger>
          <TabsTrigger value="expediente" data-testid="button-tab-expediente">📄 Expediente</TabsTrigger>
        </TabsList>

        <TabsContent value="epis" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isEpiDialogOpen} onOpenChange={setIsEpiDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-epi">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar EPI
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo EPI</DialogTitle>
                </DialogHeader>
                <EpiForm 
                  trabajadores={[{ id: trabajadorId, nombreCompleto: trabajador.nombreCompleto }]}
                  episFichasEv={episFichasEv}
                  initialData={{ trabajadorId }}
                  onSubmit={handleCreateEpi} 
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            {isLoadingEpis ? (
              <div className="p-8 text-center text-muted-foreground">Cargando EPIs...</div>
            ) : epis.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No hay EPIs registrados</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de Equipo</TableHead>
                    <TableHead>Fecha de Entrega</TableHead>
                    <TableHead>Observaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {epis.map((epi) => (
                    <TableRow key={epi.id} data-testid={`row-epi-${epi.id}`}>
                      <TableCell className="font-medium">{epi.tipoEquipo}</TableCell>
                      <TableCell>{format(new Date(epi.fechaEntrega), "dd/MM/yyyy", { locale: es })}</TableCell>
                      <TableCell className="text-muted-foreground">{epi.observaciones || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="cursos" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isCursoDialogOpen} onOpenChange={setIsCursoDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-curso">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Curso
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Curso</DialogTitle>
                </DialogHeader>
                <CourseForm 
                  trabajadores={[{ id: trabajadorId, nombreCompleto: trabajador.nombreCompleto }]}
                  initialData={{ trabajadorId }}
                  onSubmit={handleCreateCurso} 
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            {isLoadingCursos ? (
              <div className="p-8 text-center text-muted-foreground">Cargando cursos...</div>
            ) : cursos.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No hay cursos registrados</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre del Curso</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Duración (h)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cursos.map((curso) => (
                    <TableRow key={curso.id} data-testid={`row-curso-${curso.id}`}>
                      <TableCell className="font-medium">{curso.nombreCurso}</TableCell>
                      <TableCell>{format(new Date(curso.fechaRealizacion), "dd/MM/yyyy", { locale: es })}</TableCell>
                      <TableCell>{curso.duracionHoras}h</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="accidentes" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isAccidenteDialogOpen} onOpenChange={setIsAccidenteDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-accidente">
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Accidente
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Registrar Nuevo Accidente</DialogTitle>
                </DialogHeader>
                <AccidentForm 
                  initialData={{ trabajadorId }}
                  onSubmit={handleCreateAccidente} 
                />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            {isLoadingAccidentes ? (
              <div className="p-8 text-center text-muted-foreground">Cargando accidentes...</div>
            ) : accidentes.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No hay accidentes registrados</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Gravedad</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accidentes.map((accidente) => (
                    <TableRow key={accidente.id} data-testid={`row-accidente-${accidente.id}`}>
                      <TableCell>{format(new Date(accidente.fecha), "dd/MM/yyyy", { locale: es })}</TableCell>
                      <TableCell className="font-medium">{accidente.descripcion}</TableCell>
                      <TableCell>
                        <Badge className={gravedadColors[accidente.gravedad as keyof typeof gravedadColors]}>
                          {accidente.gravedad}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="expediente" className="space-y-4">
          <div className="flex justify-end">
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={10485760}
              onComplete={(result) => {
                if (result.successful && result.successful.length > 0) {
                  const uploadedFile = result.successful[0];
                  const objectPath = (uploadedFile.response?.body as any)?.objectPath ?? "";
                  createDocumentoMutation.mutate({
                    trabajadorId: trabajadorId,
                    nombreDocumento: uploadedFile.name || 'Documento',
                    archivoUrl: objectPath,
                    tipoArchivo: uploadedFile.type || undefined,
                    tamanoBytes: uploadedFile.size || undefined,
                  });
                }
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Documento
            </ObjectUploader>
          </div>

          <Card>
            {isLoadingDocumentos ? (
              <div className="p-8 text-center text-muted-foreground">
                Cargando documentos...
              </div>
            ) : documentosExpediente.length === 0 ? (
              <div className="p-8 text-center">
                <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No hay documentos en el expediente
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Sube documentos para comenzar a digitalizar el expediente del trabajador
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre del Documento</TableHead>
                    <TableHead>Fecha de Subida</TableHead>
                    <TableHead>Tamaño</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentosExpediente.map((documento) => (
                    <TableRow key={documento.id} data-testid={`row-documento-${documento.id}`}>
                      <TableCell className="font-medium">{documento.nombreDocumento}</TableCell>
                      <TableCell>
                        {format(new Date(documento.fechaSubida), "dd/MM/yyyy HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell>
                        {documento.tamanoBytes 
                          ? `${(documento.tamanoBytes / 1024 / 1024).toFixed(2)} MB`
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => window.open(documento.archivoUrl, '_blank')}
                            data-testid={`button-download-documento-${documento.id}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm('¿Está seguro de que desea eliminar este documento?')) {
                                deleteDocumentoMutation.mutate(documento.id);
                              }
                            }}
                            data-testid={`button-delete-documento-${documento.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
