import { useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Download, Trash2 } from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { AccidenteDocumento } from "@shared/schema";

interface AccidenteDocumentosDialogProps {
  accidenteId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccidenteDocumentosDialog({
  accidenteId,
  open,
  onOpenChange,
}: AccidenteDocumentosDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: documentos = [], isLoading } = useQuery<AccidenteDocumento[]>({
    queryKey: ["/api/accidente-documentos", accidenteId],
    queryFn: () => apiRequest("GET", `/api/accidente-documentos/${accidenteId}`),
    enabled: open,
  });

  const createDocumentoMutation = useMutation({
    mutationFn: async (data: {
      accidenteId: string;
      nombreArchivo: string;
      rutaArchivo: string;
      tipoArchivo?: string;
      tamanoBytes?: number;
    }) => {
      return await apiRequest("POST", "/api/accidente-documentos", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accidente-documentos", accidenteId] });
      toast({
        title: "Documento subido",
        description: "El documento se ha subido correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo subir el documento",
        variant: "destructive",
      });
    },
  });

  const deleteDocumentoMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/accidente-documentos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accidente-documentos", accidenteId] });
      toast({
        title: "Documento eliminado",
        description: "El documento se ha eliminado correctamente",
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

  // Map de fileId → objectPath para que multiple archivos funcionen correctamente
  const objectPathsRef = useRef<Map<string, string>>(new Map());

  const handleGetUploadParameters = async (file: any) => {
    const response = await fetch("/api/objects/upload", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await response.json();
    objectPathsRef.current.set(file.id, data.objectPath);
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleUploadComplete = (result: any) => {
    if (result.successful && result.successful.length > 0) {
      result.successful.forEach((file: any) => {
        const objectPath = objectPathsRef.current.get(file.id) ?? "";
        objectPathsRef.current.delete(file.id);
        createDocumentoMutation.mutate({
          accidenteId: accidenteId,
          nombreArchivo: file.name || "Documento",
          rutaArchivo: objectPath,
          tipoArchivo: file.type || undefined,
          tamanoBytes: file.size || undefined,
        });
      });
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Desconocido";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  const handleView = (rutaArchivo: string) => {
    window.open(rutaArchivo, '_blank');
  };

  const handleDelete = (documentoId: string, nombreArchivo: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar "${nombreArchivo}"?`)) {
      deleteDocumentoMutation.mutate(documentoId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Documentación del Accidente</DialogTitle>
          <DialogDescription>
            Gestiona los documentos relacionados con este accidente
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
                Sube archivos PDF, imágenes o documentos relacionados con este accidente
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
                  <div 
                    className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
                    onClick={() => handleView(doc.rutaArchivo)}
                  >
                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate" data-testid={`text-nombre-${doc.id}`}>
                        {doc.nombreArchivo}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(doc.tamanoBytes)} •{" "}
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
                    {user?.tipoAcceso !== "Usuario" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(doc.id, doc.nombreArchivo)}
                        disabled={deleteDocumentoMutation.isPending}
                        data-testid={`button-delete-${doc.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
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
