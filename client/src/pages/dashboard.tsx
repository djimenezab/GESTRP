import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { StatsCard } from "@/components/stats-card";
import { WorkerCard } from "@/components/worker-card";
import { WorkerDetailDialog } from "@/components/worker-detail-dialog";
import { Users, HardHat, GraduationCap, AlertTriangle, Plus, Search, AlertCircle, CheckCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkerForm } from "@/components/worker-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useLocation } from "wouter";
import type { InsertTrabajador, Trabajador, Epi, Curso, Accidente } from "@shared/schema";

interface DashboardData {
  episEntregados: number;
  cursosRealizados: number;
  accidentes: number;
  firmasPendientes: number;
  episPendientes: Array<{ id: string; tipoEquipo: string; fechaEntrega: string }>;
  cursosPendientes: Array<{ id: string; nombreCurso: string; fechaRealizacion: string }>;
  episRecientes: Epi[];
  cursosRecientes: Curso[];
  accidentesRecientes: Accidente[];
}

function DashboardUsuario() {
  const [, navigate] = useLocation();
  
  const { data: dashboardData, isLoading } = useQuery<DashboardData>({
    queryKey: ["/api/dashboard/usuario"],
  });

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Cargando datos...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudieron cargar los datos del dashboard. Asegúrate de tener un perfil de trabajador asociado.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasPendingSignatures = dashboardData.firmasPendientes > 0;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Dashboard</h1>
        <p className="text-muted-foreground">Vista general de tu actividad en prevención de riesgos</p>
      </div>

      {/* Alerta de firmas pendientes */}
      {hasPendingSignatures && (
        <Alert variant="default" className="border-amber-500 bg-amber-50 dark:bg-amber-950/20" data-testid="alert-firmas-pendientes">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          <AlertTitle className="text-amber-900 dark:text-amber-100 font-semibold">
            ¡Atención! Tienes {dashboardData.firmasPendientes} {dashboardData.firmasPendientes === 1 ? "firma pendiente" : "firmas pendientes"}
          </AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-200 mt-2 space-y-2">
            <p>Por favor, firma los siguientes documentos:</p>
            {dashboardData.episPendientes.length > 0 && (
              <div>
                <p className="font-medium">EPIs sin firmar ({dashboardData.episPendientes.length}):</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {dashboardData.episPendientes.slice(0, 3).map((epi) => (
                    <li key={epi.id}>
                      {epi.tipoEquipo} - {format(new Date(epi.fechaEntrega), "dd/MM/yyyy", { locale: es })}
                    </li>
                  ))}
                  {dashboardData.episPendientes.length > 3 && (
                    <li className="text-sm">... y {dashboardData.episPendientes.length - 3} más</li>
                  )}
                </ul>
              </div>
            )}
            {dashboardData.cursosPendientes.length > 0 && (
              <div>
                <p className="font-medium">Cursos sin firmar ({dashboardData.cursosPendientes.length}):</p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  {dashboardData.cursosPendientes.slice(0, 3).map((curso) => (
                    <li key={curso.id}>
                      {curso.nombreCurso} - {format(new Date(curso.fechaRealizacion), "dd/MM/yyyy", { locale: es })}
                    </li>
                  ))}
                  {dashboardData.cursosPendientes.length > 3 && (
                    <li className="text-sm">... y {dashboardData.cursosPendientes.length - 3} más</li>
                  )}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="card-epis-entregados" className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">EPIs Entregados</CardTitle>
            <HardHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-epis-count">{dashboardData.episEntregados}</div>
            <p className="text-xs text-muted-foreground">Equipos de protección recibidos</p>
          </CardContent>
        </Card>

        <Card data-testid="card-cursos-realizados" className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos Realizados</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-cursos-count">{dashboardData.cursosRealizados}</div>
            <p className="text-xs text-muted-foreground">Formaciones completadas</p>
          </CardContent>
        </Card>

        <Card data-testid="card-accidentes" className="hover-elevate">
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accidentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-accidentes-count">{dashboardData.accidentes}</div>
            <p className="text-xs text-muted-foreground">Incidentes registrados</p>
          </CardContent>
        </Card>

        <Card 
          data-testid="card-firmas-pendientes" 
          className={`hover-elevate ${hasPendingSignatures ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20" : "border-green-500 bg-green-50 dark:bg-green-950/20"}`}
        >
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {hasPendingSignatures ? "Firmas Pendientes" : "Firmas al Día"}
            </CardTitle>
            {hasPendingSignatures ? (
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${hasPendingSignatures ? "text-amber-600 dark:text-amber-500" : "text-green-600 dark:text-green-500"}`} data-testid="text-firmas-count">
              {dashboardData.firmasPendientes}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasPendingSignatures ? "Documentos por firmar" : "Todo firmado correctamente"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* EPIs recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardHat className="h-5 w-5" />
              EPIs Recientes
            </CardTitle>
            <CardDescription>Últimos equipos entregados</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.episRecientes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No hay EPIs registrados</p>
            ) : (
              <div className="space-y-3">
                {dashboardData.episRecientes.map((epi) => (
                  <div key={epi.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{epi.tipoEquipo}</p>
                      {epi.marca && <p className="text-xs text-muted-foreground">{epi.marca} {epi.modelo}</p>}
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(epi.fechaEntrega), "dd/MM/yyyy", { locale: es })}
                      </p>
                    </div>
                    {!epi.firmaUrl && (
                      <span className="text-xs text-amber-600 dark:text-amber-500 font-medium whitespace-nowrap">
                        Sin firmar
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {dashboardData.episEntregados > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => navigate("/epis")}
                data-testid="button-ver-todos-epis"
              >
                Ver todos mis EPIs
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Cursos recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Cursos Recientes
            </CardTitle>
            <CardDescription>Últimas formaciones realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.cursosRecientes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No hay cursos registrados</p>
            ) : (
              <div className="space-y-3">
                {dashboardData.cursosRecientes.map((curso) => (
                  <div key={curso.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{curso.nombreCurso}</p>
                      <p className="text-xs text-muted-foreground">{curso.duracionHoras}h</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(curso.fechaRealizacion), "dd/MM/yyyy", { locale: es })}
                      </p>
                    </div>
                    {!curso.firmaUrl && !curso.comisionServicioFirmadoUrl && (
                      <span className="text-xs text-amber-600 dark:text-amber-500 font-medium whitespace-nowrap">
                        Sin firmar
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {dashboardData.cursosRealizados > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => navigate("/cursos")}
                data-testid="button-ver-todos-cursos"
              >
                Ver todos mis cursos
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Accidentes recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Accidentes
            </CardTitle>
            <CardDescription>Incidentes registrados</CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardData.accidentesRecientes.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Sin accidentes registrados</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData.accidentesRecientes.map((accidente) => (
                  <div key={accidente.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{accidente.tipoAccidente}</p>
                      <p className="text-xs text-muted-foreground">{accidente.centroTrabajo}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(accidente.fecha), "dd/MM/yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {dashboardData.accidentes > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mt-4"
                onClick={() => navigate("/accidentes")}
                data-testid="button-ver-todos-accidentes"
              >
                Ver todos los accidentes
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardAdministrador() {
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
        <Alert variant="default" className="border-amber-500 bg-amber-50 dark:bg-amber-950/20" data-testid="alert-epis-sin-firma">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
          <AlertTitle className="text-amber-900 dark:text-amber-100 font-semibold">Atención: Firmas Pendientes</AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-200">
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

export default function Dashboard() {
  const { user } = useAuth();

  // Si es Usuario, mostrar dashboard personalizado
  if (user?.tipoAcceso === "Usuario") {
    return <DashboardUsuario />;
  }

  // Si es Administrador o AdminGral, mostrar dashboard de administración
  return <DashboardAdministrador />;
}
