import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Printer } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { EpiDeliveryDocument } from "./epi-delivery-document";

interface EpiDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  epi: {
    id: string;
    tipoEquipo: string;
    marca?: string;
    modelo?: string;
    fechaEntrega: string;
    fechaCaducidad?: string;
    observaciones?: string;
    trabajador: string;
    trabajadorDni?: string;
  };
}

export function EpiDetailDialog({ open, onOpenChange, epi }: EpiDetailDialogProps) {
  const [showDocument, setShowDocument] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  if (showDocument) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto print:shadow-none">
          <DialogHeader className="print:hidden">
            <DialogTitle>Documento de Entrega</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <EpiDeliveryDocument
              trabajadorNombre={epi.trabajador}
              trabajadorDni={epi.trabajadorDni || ""}
              fechaEntrega={epi.fechaEntrega}
              tipoEquipo={epi.tipoEquipo}
            />
            <div className="flex justify-end gap-2 print:hidden">
              <Button
                variant="outline"
                onClick={() => setShowDocument(false)}
                data-testid="button-volver"
              >
                Volver
              </Button>
              <Button onClick={handlePrint} data-testid="button-imprimir">
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-epi-detail">
        <DialogHeader>
          <DialogTitle>Detalle del EPI</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Equipo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Trabajador</p>
                  <p className="font-medium" data-testid="text-trabajador">{epi.trabajador}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Equipo</p>
                  <p className="font-medium" data-testid="text-tipo-equipo">{epi.tipoEquipo}</p>
                </div>
                {epi.marca && (
                  <div>
                    <p className="text-sm text-muted-foreground">Marca</p>
                    <p className="font-medium" data-testid="text-marca">{epi.marca}</p>
                  </div>
                )}
                {epi.modelo && (
                  <div>
                    <p className="text-sm text-muted-foreground">Modelo</p>
                    <p className="font-medium" data-testid="text-modelo">{epi.modelo}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Fecha de Entrega</p>
                  <p className="font-medium" data-testid="text-fecha-entrega">
                    {format(new Date(epi.fechaEntrega), "dd/MM/yyyy", { locale: es })}
                  </p>
                </div>
                {epi.fechaCaducidad && (
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Caducidad</p>
                    <p className="font-medium" data-testid="text-fecha-caducidad">
                      {format(new Date(epi.fechaCaducidad), "dd/MM/yyyy", { locale: es })}
                    </p>
                  </div>
                )}
              </div>
              {epi.observaciones && (
                <div>
                  <p className="text-sm text-muted-foreground">Observaciones</p>
                  <p className="font-medium" data-testid="text-observaciones">{epi.observaciones}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={() => setShowDocument(true)}
              data-testid="button-generar-documento"
            >
              <FileText className="mr-2 h-4 w-4" />
              Generar Documento de Entrega
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
