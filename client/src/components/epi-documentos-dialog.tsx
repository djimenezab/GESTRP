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
import type { EpiDocumento } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { UploadResult } from "@uppy/core";

interface EpiDocumentosDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  epiId: string;
  numeroCorrelativo: string | null;
}

export function EpiDocumentosDialog({ 
  open, 
  onOpenChange, 
  epiId,
  numeroCorrelativo 
}: EpiDocumentosDialogProps) {
  const { toast } = useToast();

  const { data: documentos = [], isLoading } = useQuery<EpiDocumento[]>({
    queryKey: ["/api/epis", epiId, "documentos"],
    enabled: open,
  });

  const deleteMutation = useMutation({
    mutationFn: async (documentoId: string) => {
      return await apiRequest("DELETE", `/api/epi-documentos/${documentoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/epis", epiId, "documentos"] });
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
        await apiRequest("POST", "/api/epi-documentos", {
          epiId,
          nombreArchivo: uploadedFile.name,
          rutaArchivo: uploadedFile.uploadURL,
          tipoArchivo: uploadedFile.type || "application/octet-stream",
          tamanoBytes: uploadedFile.size,
        });

        queryClient.invalidateQueries({ queryKey: ["/api/epis", epiId, "documentos"] });
        
        toast({
          title: "Documento subido",
          description: `El archivo "${uploadedFile.name}" se subió correctamente`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo registrar el documento",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = (documentoId: string, nombreArchivo: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar "${nombreArchivo}"?`)) {
      deleteMutation.mutate(documentoId);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Tamaño desconocido";
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) {
      return `${mb.toFixed(2)} MB`;
    }
    const kb = bytes / 1024;
    return `${kb.toFixed(2)} KB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Documentación Digitalizada {numeroCorrelativo && `- ${numeroCorrelativo}`}
          </DialogTitle>
          <DialogDescription>
            Gestiona los documentos digitalizados asociados a esta entrega de EPI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-end">
            <ObjectUploader
              maxNumberOfFiles={5}
              maxFileSize={20971520} // 20MB
              onGetUploadParameters={handleGetUploadParameters}
              onComplete={handleUploadComplete}
              buttonClassName="gap-2"
            >
              <Upload className="h-4 w-4" />
              Subir Documentos
            </ObjectUploader>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Cargando documentos...</p>
            </div>
          ) : documentos.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-md">
              <FileText className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No hay documentos adjuntos</p>
              <p className="text-sm text-muted-foreground mt-1">
                Sube archivos PDF, imágenes o documentos relacionados con este EPI
              </p>
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
                      <p className="font-medium truncate" data-testid={`text-nombre-${doc.id}`}>
                        {doc.nombreArchivo}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(doc.tamanoBytes)} • {" "}
                        {format(new Date(doc.fechaSubida), "dd/MM/yyyy HH:mm", { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                      data-testid={`button-download-${doc.id}`}
                    >
                      <a href={doc.rutaArchivo} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
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
