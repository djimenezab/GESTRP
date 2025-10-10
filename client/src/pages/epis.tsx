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
const mockEpisWithWorker = [
  {
    id: "1",
    tipoEquipo: "Casco de seguridad",
    fechaEntrega: "2024-01-15",
    observaciones: "Talla M",
    trabajador: "Juan Pérez García",
  },
  {
    id: "2",
    tipoEquipo: "Guantes anticorte",
    fechaEntrega: "2024-02-20",
    observaciones: "",
    trabajador: "María López Fernández",
  },
  {
    id: "3",
    tipoEquipo: "Botas de seguridad",
    fechaEntrega: "2024-03-10",
    observaciones: "Talla 42",
    trabajador: "Carlos Martínez Ruiz",
  },
  {
    id: "4",
    tipoEquipo: "Chaleco reflectante",
    fechaEntrega: "2024-03-25",
    observaciones: "Talla L",
    trabajador: "Ana Sánchez Torres",
  },
];

export default function Epis() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">EPIs Entregados</h1>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trabajador</TableHead>
              <TableHead>Tipo de Equipo</TableHead>
              <TableHead>Fecha de Entrega</TableHead>
              <TableHead>Observaciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockEpisWithWorker.map((epi) => (
              <TableRow key={epi.id} data-testid={`row-epi-${epi.id}`}>
                <TableCell className="font-medium" data-testid={`text-worker-${epi.id}`}>
                  {epi.trabajador}
                </TableCell>
                <TableCell>{epi.tipoEquipo}</TableCell>
                <TableCell>{format(new Date(epi.fechaEntrega), "dd/MM/yyyy", { locale: es })}</TableCell>
                <TableCell className="text-muted-foreground">{epi.observaciones || "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
