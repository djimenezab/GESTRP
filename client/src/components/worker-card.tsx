import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, FileText, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkerCardProps {
  id: string;
  nombreCompleto: string;
  categoria: string;
  dni: string;
  fechaNacimiento: string;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}

export function WorkerCard({
  id,
  nombreCompleto,
  categoria,
  dni,
  fechaNacimiento,
  onEdit,
  onDelete,
  onClick,
}: WorkerCardProps) {
  return (
    <Card className="hover-elevate cursor-pointer" onClick={onClick} data-testid={`card-worker-${id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold" data-testid={`text-worker-name-${id}`}>{nombreCompleto}</h3>
            <Badge variant="secondary" className="mt-1" data-testid={`badge-category-${id}`}>
              {categoria}
            </Badge>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" data-testid={`button-worker-menu-${id}`}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              data-testid={`button-edit-worker-${id}`}
            >
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="text-destructive"
              data-testid={`button-delete-worker-${id}`}
            >
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span data-testid={`text-dni-${id}`}>{dni}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span data-testid={`text-birth-${id}`}>
            {format(new Date(fechaNacimiento), "dd/MM/yyyy", { locale: es })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
