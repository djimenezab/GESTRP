import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StatsCard } from "@/components/stats-card";
import { WorkerCard } from "@/components/worker-card";
import { WorkerDetailDialog } from "@/components/worker-detail-dialog";
import { Users, HardHat, GraduationCap, AlertTriangle, Plus, Search, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { WorkerForm } from "@/components/worker-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertTrabajador, Trabajador, Epi, Curso, Accidente } from "@shared/schema";

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Trabajador | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: trabajadores = [], isLoading } = useQuery<Trabajador[]>({
    queryKey: ["/api/trabajadores"],
  });

  const { data: epis = [] } = useQuery<Epi[]>({
    queryKey: ["/api/epis"],
  });

  const { data: cursos = [] } = useQuery<Curso[]>({
    queryKey: ["/api/cursos"],
  });

  const { data: accidentes = [] } = useQuery<Accidente[]>({
    queryKey: ["/api/accidentes"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertTrabajador) => {
      return await apiRequest("POST", "/api/trabajadores", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/trabajadores"] });
      setIsDialogOpen(false);
      toast({
        title: "Trabajador creado",
        description: "El trabajador ha sido añadido correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el trabajador",
        variant: "destructive",
      });
    },
  });

  const handleCreateWorker = (data: InsertTrabajador) => {
    createMutation.mutate(data);
  };

  const handleWorkerClick = (worker: Trabajador) => {
    setSelectedWorker(worker);
    setIsDetailDialogOpen(true);
  };

  const filteredWorkers = trabajadores.filter((worker) =>
    worker.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.dni.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular EPIs sin firma digital
  const episSinFirma = epis.filter((epi) => !epi.firmaUrl || epi.firmaUrl.trim() === "").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-worker">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Trabajador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Trabajador</DialogTitle>
            </DialogHeader>
            <WorkerForm onSubmit={handleCreateWorker} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Trabajadores"
          value={trabajadores.length}
          icon={Users}
          description="Personal activo"
        />
        <StatsCard
          title="EPIs Entregados"
          value={epis.length}
          icon={HardHat}
          description="Total registrados"
        />
        <StatsCard
          title="Cursos Realizados"
          value={cursos.length}
          icon={GraduationCap}
          description="Total registrados"
        />
        <StatsCard
          title="Accidentes"
          value={accidentes.length}
          icon={AlertTriangle}
          description="Total registrados"
        />
      </div>

      {/* Alerta de EPIs sin firma digital */}
      {episSinFirma > 0 && (
        <Alert variant="default" data-testid="alert-epis-sin-firma">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atención: Firmas Pendientes</AlertTitle>
          <AlertDescription>
            Hay <strong>{episSinFirma}</strong> {episSinFirma === 1 ? "documento de entrega de EPI pendiente" : "documentos de entrega de EPIs pendientes"} de firma digital. Recuerda solicitar las firmas correspondientes.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-workers"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((worker) => (
            <WorkerCard
              key={worker.id}
              {...worker}
              onClick={() => handleWorkerClick(worker)}
            />
          ))}
        </div>

        {filteredWorkers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron trabajadores</p>
          </div>
        )}
      </div>

      {selectedWorker && (
        <WorkerDetailDialog
          open={isDetailDialogOpen}
          onOpenChange={setIsDetailDialogOpen}
          worker={selectedWorker}
        />
      )}
    </div>
  );
}
