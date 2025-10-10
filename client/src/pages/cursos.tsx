import { Card } from "@/components/ui/card";
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

//todo: remove mock data
const mockCursosWithWorker = [
  {
    id: "1",
    nombreCurso: "PRL Básico",
    fechaRealizacion: "2024-01-10",
    duracionHoras: 20,
    trabajador: "Juan Pérez García",
  },
  {
    id: "2",
    nombreCurso: "Trabajos en Altura",
    fechaRealizacion: "2024-03-15",
    duracionHoras: 8,
    trabajador: "Juan Pérez García",
  },
  {
    id: "3",
    nombreCurso: "Primeros Auxilios",
    fechaRealizacion: "2024-02-20",
    duracionHoras: 12,
    trabajador: "María López Fernández",
  },
  {
    id: "4",
    nombreCurso: "Manejo de Maquinaria",
    fechaRealizacion: "2024-03-05",
    duracionHoras: 16,
    trabajador: "Carlos Martínez Ruiz",
  },
];

export default function Cursos() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Cursos Realizados</h1>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trabajador</TableHead>
              <TableHead>Nombre del Curso</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Duración (h)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockCursosWithWorker.map((curso) => (
              <TableRow key={curso.id} data-testid={`row-curso-${curso.id}`}>
                <TableCell className="font-medium" data-testid={`text-worker-${curso.id}`}>
                  {curso.trabajador}
                </TableCell>
                <TableCell>{curso.nombreCurso}</TableCell>
                <TableCell>{format(new Date(curso.fechaRealizacion), "dd/MM/yyyy", { locale: es })}</TableCell>
                <TableCell>{curso.duracionHoras}h</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
