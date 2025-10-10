import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, FileText, HardHat, GraduationCap } from "lucide-react";
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
import type { Epi, Curso } from "@shared/schema";

interface WorkerDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: {
    id: string;
    nombreCompleto: string;
    categoria: string;
    dni: string;
    fechaNacimiento: string;
  };
}

export function WorkerDetailDialog({
  open,
  onOpenChange,
  worker,
}: WorkerDetailDialogProps) {
  const { data: epis = [] } = useQuery<Epi[]>({
    queryKey: ["/api/trabajadores", worker.id, "epis"],
    enabled: open,
  });

  const { data: cursos = [] } = useQuery<Curso[]>({
    queryKey: ["/api/trabajadores", worker.id, "cursos"],
    enabled: open,
  });

  // Ordenar EPIs por fecha (más recientes primero)
  const sortedEpis = [...epis].sort(
    (a, b) => new Date(b.fechaEntrega).getTime() - new Date(a.fechaEntrega).getTime()
  );

  // Ordenar cursos por fecha (más recientes primero)
  const sortedCursos = [...cursos].sort(
    (a, b) => new Date(b.fechaRealizacion).getTime() - new Date(a.fechaRealizacion).getTime()
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
                  </div>
                </div>
              </div>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
