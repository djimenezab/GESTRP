import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Trash2, Download } from "lucide-react";
import { ObjectUploader } from "./ObjectUploader";
import type { CursoDocumento } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { UploadResult } from "@uppy/core";

interface CursoDocumentosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cursoId: string;
  nombreCurso: string;
}

export function CursoDocumentosDialog({ 
  open, 
  onOpenChange, 
  cursoId,
  nombreCurso 
}: CursoDocumentosDialogProps) {
  const { toast } = useToast();

  const { data: documentos = [], isLoading } = useQuery<CursoDocumento[]>({
    queryKey: ["/api/cursos", cursoId, "documentos"],
    queryFn: () => apiRequest("GET", `/api/cursos/${cursoId}/documentos`),
    enabled: open,
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentoId: string) => {
      return await apiRequest("DELETE", `/api/curso-documentos/${documentoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cursos", cursoId, "documentos"] });
      toast({
        title: "Documento eliminado",
        description: "El documento ha sido eliminado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento",
        variant: "destructive",
      });
    },
  });

  const handleGetUploadParameters = async () => {
    const response = await fetch("/api/objects/upload", {
      method: "POST",
    });
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    if (result.successful && result.successful.length > 0) {
      const uploadedFile = result.successful[0];
      
      try {
        await apiRequest("POST", "/api/curso-documentos", {
          cursoId,
          nombreArchivo: uploadedFile.name,
          rutaArchivo: uploadedFile.uploadURL,
          tipoArchivo: uploadedFile.type || null,
          tamanoBytes: uploadedFile.size || null,
        });

        queryClient.invalidateQueries({ queryKey: ["/api/cursos", cursoId, "documentos"] });
        
        toast({
          title: "Documento subido",
          description: "El documento ha sido subido correctamente",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "No se pudo registrar el documento",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async (documentoId: string, nombreArchivo: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar "${nombreArchivo}"?`)) {
      deleteMutation.mutate(documentoId);
    }
  };

  const handleDownload = (rutaArchivo: string, nombreArchivo: string) => {
    const link = document.createElement('a');
    link.href = rutaArchivo;
    link.download = nombreArchivo;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatBytes = (bytes: number | null): string => {
    if (!bytes) return "-";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Documentación del Curso</DialogTitle>
          <DialogDescription>
            {nombreCurso}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {documentos.length === 0 ? "No hay documentos" : `${documentos.length} documento(s)`}
            </p>
            <ObjectUploader
              maxNumberOfFiles={5}
              maxFileSize={10485760}
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={handleUploadComplete}
            >
              <Upload className="h-4 w-4 mr-2" />
              Subir Documento
            </ObjectUploader>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Cargando documentos...
            </div>
          ) : documentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No hay documentos subidos</p>
              <p className="text-xs mt-1">Usa el botón "Subir Documento" para añadir archivos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documentos.map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                  data-testid={`documento-${doc.id}`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" data-testid={`text-nombre-${doc.id}`}>
                        {doc.nombreArchivo}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(doc.tamanoBytes)} · {format(new Date(doc.fechaSubida), "dd/MM/yyyy HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(doc.rutaArchivo, doc.nombreArchivo)}
                      title="Descargar documento"
                      data-testid={`button-download-doc-${doc.id}`}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(doc.id, doc.nombreArchivo)}
                      className="text-destructive hover:text-destructive"
                      data-testid={`button-delete-doc-${doc.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
