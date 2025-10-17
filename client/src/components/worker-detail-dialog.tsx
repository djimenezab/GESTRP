import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "@/components/ObjectUploader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, FileText, HardHat, GraduationCap, CheckCircle2, XCircle, Eye, Download, AlertTriangle, Mail, MapPin, Upload, Trash2, FolderOpen } from "lucide-react";
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
import type { Epi, Curso, Accidente, ZonaTrabajo, DocumentoExpediente, InsertDocumentoExpediente } from "@shared/schema";

interface WorkerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: {
    id: string;
    nombreCompleto: string;
    categoria: string;
    dni: string;
    fechaNacimiento: string;
    email?: string | null;
    zonaId?: string | null;
    fichaEvaluacionRiesgosUrl?: string | null;
  };
}

export function WorkerDetailDialog({
  open,
  onOpenChange,
  worker,
}: WorkerDetailDialogProps) {
  const { toast } = useToast();

  const { data: zona } = useQuery<ZonaTrabajo>({
    queryKey: ["/api/zonas-trabajo", worker.zonaId],
    enabled: open && !!worker.zonaId,
  });

  const { data: epis = [] } = useQuery<Epi[]>({
    queryKey: ["/api/trabajadores", worker.id, "epis"],
    enabled: open,
  });

  const { data: cursos = [] } = useQuery<Curso[]>({
    queryKey: ["/api/trabajadores", worker.id, "cursos"],
    enabled: open,
  });

  const { data: accidentes = [] } = useQuery<Accidente[]>({
    queryKey: ["/api/trabajadores", worker.id, "accidentes"],
    enabled: open,
  });

  const { data: documentosExpediente = [], isLoading: isLoadingDocumentos } = useQuery<DocumentoExpediente[]>({
    queryKey: [`/api/trabajadores/${worker.id}/documentos-expediente`],
    enabled: open,
  });

  const createDocumentoMutation = useMutation({
    mutationFn: async (data: InsertDocumentoExpediente) => {
      return apiRequest("POST", "/api/documentos-expediente", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trabajadores/${worker.id}/documentos-expediente`] });
      toast({
        title: "Documento subido",
        description: "El documento ha sido agregado al expediente correctamente.",
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

  const deleteDocumentoMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/documentos-expediente/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/trabajadores/${worker.id}/documentos-expediente`] });
      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado del expediente.",
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

  // Ordenar EPIs por fecha (más recientes primero)
  const sortedEpis = [...epis].sort(
    (a, b) => new Date(b.fechaEntrega).getTime() - new Date(a.fechaEntrega).getTime()
  );

  // Ordenar cursos por fecha (más recientes primero)
  const sortedCursos = [...cursos].sort(
    (a, b) => new Date(b.fechaRealizacion).getTime() - new Date(a.fechaRealizacion).getTime()
  );

  // Ordenar accidentes por fecha (más recientes primero)
  const sortedAccidentes = [...accidentes].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle del Trabajador</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Datos del trabajador */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold" data-testid="text-worker-name-dialog">
                      {worker.nombreCompleto}
                    </h3>
                    <Badge variant="secondary" className="mt-1" data-testid="badge-category-dialog">
                      {worker.categoria}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span data-testid="text-dni-dialog">DNI: {worker.dni}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span data-testid="text-birth-dialog">
                        Nacimiento: {format(new Date(worker.fechaNacimiento), "dd/MM/yyyy", { locale: es })}
                      </span>
                    </div>
                    {worker.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span data-testid="text-email-dialog">{worker.email}</span>
                      </div>
                    )}
                    {zona && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span data-testid="text-zona-dialog">Zona: {zona.zona}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ficha de Evaluación de Riesgos Laborales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Ficha de Evaluación de Riesgos Laborales
              </CardTitle>
            </CardHeader>
            <CardContent>
              {worker.fichaEvaluacionRiesgosUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Ficha de evaluación disponible</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(worker.fichaEvaluacionRiesgosUrl!, '_blank')}
                      data-testid="button-view-ficha-evaluacion"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Documento
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (worker.fichaEvaluacionRiesgosUrl) {
                          const link = document.createElement('a');
                          link.href = worker.fichaEvaluacionRiesgosUrl;
                          link.download = `ficha_evaluacion_${worker.dni}`;
                          link.click();
                        }
                      }}
                      data-testid="button-download-ficha-evaluacion"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <XCircle className="h-5 w-5" />
                  <span>No hay ficha de evaluación disponible</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* EPIs entregados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardHat className="h-5 w-5" />
                EPIs Entregados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedEpis.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo de Equipo</TableHead>
                      <TableHead>Fecha de Entrega</TableHead>
                      <TableHead>Observaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedEpis.map((epi) => (
                      <TableRow key={epi.id} data-testid={`row-epi-dialog-${epi.id}`}>
                        <TableCell className="font-medium">{epi.tipoEquipo}</TableCell>
                        <TableCell>{format(new Date(epi.fechaEntrega), "dd/MM/yyyy", { locale: es })}</TableCell>
                        <TableCell className="text-muted-foreground">{epi.observaciones || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay EPIs registrados para este trabajador
                </p>
              )}
            </CardContent>
          </Card>

          {/* Cursos realizados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Cursos Realizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedCursos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre del Curso</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Duración (h)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedCursos.map((curso) => (
                      <TableRow key={curso.id} data-testid={`row-curso-dialog-${curso.id}`}>
                        <TableCell className="font-medium">{curso.nombreCurso}</TableCell>
                        <TableCell>{format(new Date(curso.fechaRealizacion), "dd/MM/yyyy", { locale: es })}</TableCell>
                        <TableCell>{curso.duracionHoras}h</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay cursos registrados para este trabajador
                </p>
              )}
            </CardContent>
          </Card>

          {/* Accidentes laborales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Accidentes Laborales
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sortedAccidentes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Gravedad</TableHead>
                      <TableHead>Descripción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedAccidentes.map((accidente) => (
                      <TableRow key={accidente.id} data-testid={`row-accidente-dialog-${accidente.id}`}>
                        <TableCell className="font-medium">
                          {format(new Date(accidente.fecha), "dd/MM/yyyy", { locale: es })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={accidente.tipoAccidente === "ACCIDENTE_SERVICIO" ? "default" : "secondary"}>
                            {accidente.tipoAccidente === "ACCIDENTE_SERVICIO" ? "Accidente en servicio" : "Enfermedad profesional"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              accidente.gravedad === "GRAVE" ? "destructive" : 
                              accidente.gravedad === "MODERADO" ? "default" : 
                              "secondary"
                            }
                          >
                            {accidente.gravedad}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate">
                          {accidente.descripcion}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay accidentes registrados para este trabajador
                </p>
              )}
            </CardContent>
          </Card>

          {/* Expediente Digitalizado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Expediente Digitalizado
                </div>
                <ObjectUploader
                  maxNumberOfFiles={1}
                  maxFileSize={10485760}
                  onGetUploadParameters={async () => {
                    const response = await fetch('/api/objects/upload', {
                      method: 'POST',
                      credentials: 'include',
                    });
                    const data = await response.json();
                    return {
                      method: 'PUT' as const,
                      url: data.uploadURL,
                    };
                  }}
                  onComplete={(result) => {
                    if (result.successful && result.successful.length > 0) {
                      const uploadedFile = result.successful[0];
                      createDocumentoMutation.mutate({
                        trabajadorId: worker.id,
                        nombreDocumento: uploadedFile.name || 'Documento',
                        archivoUrl: uploadedFile.uploadURL || '',
                        tipoArchivo: uploadedFile.type || undefined,
                        tamanoBytes: uploadedFile.size || undefined,
                      });
                    }
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Documento
                </ObjectUploader>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingDocumentos ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Cargando documentos...
                </p>
              ) : documentosExpediente.length > 0 ? (
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
                      <TableRow key={documento.id} data-testid={`row-documento-dialog-${documento.id}`}>
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
                              data-testid={`button-download-documento-dialog-${documento.id}`}
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
                              data-testid={`button-delete-documento-dialog-${documento.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No hay documentos en el expediente
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sube documentos para comenzar a digitalizar el expediente
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
