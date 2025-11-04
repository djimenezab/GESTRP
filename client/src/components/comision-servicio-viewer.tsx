import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SignaturePad } from "@/components/signature-pad";
import { FileText, Download, Pen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Curso } from "@shared/schema";

interface ComisionServicioViewerProps {
  curso: Curso;
}

export function ComisionServicioViewer({ curso }: ComisionServicioViewerProps) {
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const pdfUrl = curso.comisionServicioFirmadoUrl || curso.comisionServicioUrl;
  const hasPdf = !!pdfUrl;
  const isSigned = !!curso.comisionServicioFirmadoUrl;

  const handleSubmitSignature = async () => {
    if (!signature) {
      toast({
        title: "Error",
        description: "Por favor, firma el documento antes de enviar",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiRequest("POST", `/api/cursos/${curso.id}/sign-comision`, {
        firmaDataUrl: signature,
      });

      queryClient.invalidateQueries({ queryKey: ["/api/cursos"] });
      
      toast({
        title: "Documento firmado",
        description: "La Comisión de Servicio ha sido firmada correctamente",
      });
      
      setIsSignDialogOpen(false);
      setSignature(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo firmar el documento",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasPdf) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay Comisión de Servicio disponible para este curso</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Comisión de Servicio
          </CardTitle>
          <CardDescription>
            {isSigned 
              ? "Este documento ya ha sido firmado"
              : "Revisa y firma el documento de Comisión de Servicio"
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-md overflow-hidden">
            <iframe
              src={pdfUrl}
              className="w-full h-[600px]"
              title="Comisión de Servicio"
              data-testid="iframe-comision-servicio"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => window.open(pdfUrl, '_blank')}
              data-testid="button-download-comision"
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
            
            {!isSigned && (
              <Button
                onClick={() => setIsSignDialogOpen(true)}
                data-testid="button-open-sign-dialog"
              >
                <Pen className="h-4 w-4 mr-2" />
                Firmar Documento
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Firmar Comisión de Servicio</DialogTitle>
            <DialogDescription>
              Dibuja tu firma en el recuadro. Esta firma se añadirá al documento PDF.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <SignaturePad onSignatureChange={setSignature} />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsSignDialogOpen(false);
                setSignature(null);
              }}
              data-testid="button-cancel-sign"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitSignature}
              disabled={!signature || isSubmitting}
              data-testid="button-submit-sign"
            >
              {isSubmitting ? "Firmando..." : "Firmar y Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
