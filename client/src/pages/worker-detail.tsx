import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Calendar, FileText, Plus, Pencil } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EpiForm } from "@/components/epi-form";
import { CourseForm } from "@/components/course-form";
import { AccidentForm } from "@/components/accident-form";
import type { InsertEpi, InsertCurso, InsertAccidente } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

//todo: remove mock data
const mockWorker = {
  id: "1",
  nombreCompleto: "Juan Pérez García",
  categoria: "OFICIAL",
  dni: "12345678A",
  fechaNacimiento: "1985-03-15",
};

const mockEpis = [
  { id: "1", tipoEquipo: "Casco de seguridad", fechaEntrega: "2024-01-15", observaciones: "Talla M" },
  { id: "2", tipoEquipo: "Guantes anticorte", fechaEntrega: "2024-02-20", observaciones: "" },
  { id: "3", tipoEquipo: "Botas de seguridad", fechaEntrega: "2024-03-10", observaciones: "Talla 42" },
];

const mockCursos = [
  { id: "1", nombreCurso: "PRL Básico", fechaRealizacion: "2024-01-10", duracionHoras: 20 },
  { id: "2", nombreCurso: "Trabajos en Altura", fechaRealizacion: "2024-03-15", duracionHoras: 8 },
];

const mockAccidentes = [
  { id: "1", fecha: "2024-02-05", descripcion: "Corte leve en mano derecha", gravedad: "LEVE" },
];

const gravedadColors = {
  LEVE: "bg-chart-2 text-white",
  MODERADO: "bg-chart-3 text-white",
  GRAVE: "bg-destructive text-destructive-foreground",
};

export default function WorkerDetail() {
  const [activeTab, setActiveTab] = useState("epis");
  const [isEpiDialogOpen, setIsEpiDialogOpen] = useState(false);
  const [isCursoDialogOpen, setIsCursoDialogOpen] = useState(false);
  const [isAccidenteDialogOpen, setIsAccidenteDialogOpen] = useState(false);

  //todo: remove mock functionality
  const handleCreateEpi = (data: InsertEpi) => {
    console.log("Crear EPI:", data);
    setIsEpiDialogOpen(false);
  };

  //todo: remove mock functionality
  const handleCreateCurso = (data: InsertCurso) => {
    console.log("Crear curso:", data);
    setIsCursoDialogOpen(false);
  };

  //todo: remove mock functionality
  const handleCreateAccidente = (data: InsertAccidente) => {
    console.log("Crear accidente:", data);
    setIsAccidenteDialogOpen(false);
  };

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
                  {mockWorker.nombreCompleto}
                </h2>
                <Badge variant="secondary" className="mt-2" data-testid="badge-category">
                  {mockWorker.categoria}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span data-testid="text-dni">DNI: {mockWorker.dni}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span data-testid="text-birth">
                    Nacimiento: {format(new Date(mockWorker.fechaNacimiento), "dd/MM/yyyy", { locale: es })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="epis" data-testid="tab-epis">EPIs Entregados</TabsTrigger>
          <TabsTrigger value="cursos" data-testid="tab-cursos">Cursos</TabsTrigger>
          <TabsTrigger value="accidentes" data-testid="tab-accidentes">Accidentes</TabsTrigger>
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
                <EpiForm trabajadorId={mockWorker.id} onSubmit={handleCreateEpi} />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Equipo</TableHead>
                  <TableHead>Fecha de Entrega</TableHead>
                  <TableHead>Observaciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockEpis.map((epi) => (
                  <TableRow key={epi.id} data-testid={`row-epi-${epi.id}`}>
                    <TableCell className="font-medium">{epi.tipoEquipo}</TableCell>
                    <TableCell>{format(new Date(epi.fechaEntrega), "dd/MM/yyyy", { locale: es })}</TableCell>
                    <TableCell className="text-muted-foreground">{epi.observaciones || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                <CourseForm trabajadorId={mockWorker.id} onSubmit={handleCreateCurso} />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre del Curso</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Duración (h)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCursos.map((curso) => (
                  <TableRow key={curso.id} data-testid={`row-curso-${curso.id}`}>
                    <TableCell className="font-medium">{curso.nombreCurso}</TableCell>
                    <TableCell>{format(new Date(curso.fechaRealizacion), "dd/MM/yyyy", { locale: es })}</TableCell>
                    <TableCell>{curso.duracionHoras}h</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
                <AccidentForm trabajadorId={mockWorker.id} onSubmit={handleCreateAccidente} />
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Gravedad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAccidentes.map((accidente) => (
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
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
