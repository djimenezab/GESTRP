import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
const mockAccidentesWithWorker = [
  {
    id: "1",
    fecha: "2024-02-05",
    descripcion: "Corte leve en mano derecha",
    gravedad: "LEVE",
    trabajador: "Juan Pérez García",
  },
  {
    id: "2",
    fecha: "2024-01-22",
    descripcion: "Caída desde escalera, esguince de tobillo",
    gravedad: "MODERADO",
    trabajador: "Carlos Martínez Ruiz",
  },
  {
    id: "3",
    fecha: "2024-03-10",
    descripcion: "Contacto con químico, irritación ocular",
    gravedad: "LEVE",
    trabajador: "Ana Sánchez Torres",
  },
];

const gravedadColors = {
  LEVE: "bg-chart-2 text-white",
  MODERADO: "bg-chart-3 text-white",
  GRAVE: "bg-destructive text-destructive-foreground",
};

export default function Accidentes() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Accidentes Laborales</h1>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Trabajador</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Gravedad</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAccidentesWithWorker.map((accidente) => (
              <TableRow key={accidente.id} data-testid={`row-accidente-${accidente.id}`}>
                <TableCell className="font-medium" data-testid={`text-worker-${accidente.id}`}>
                  {accidente.trabajador}
                </TableCell>
                <TableCell>{format(new Date(accidente.fecha), "dd/MM/yyyy", { locale: es })}</TableCell>
                <TableCell>{accidente.descripcion}</TableCell>
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
    </div>
  );
}
