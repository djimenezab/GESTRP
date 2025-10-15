import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  insertEpiFichaEvSchema, 
  type InsertEpiFichaEv, 
  type EpiFichaEv,
  insertZonaTrabajoSchema,
  type InsertZonaTrabajo,
  type ZonaTrabajo,
  insertUsuarioSchema,
  type InsertUsuario,
  type UsuarioSinPassword,
  TIPOS_ACCESO
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Configuracion() {
  // EPIS Fichas EV state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFicha, setEditingFicha] = useState<EpiFichaEv | null>(null);
  
  // Zonas de Trabajo state
  const [isZonaDialogOpen, setIsZonaDialogOpen] = useState(false);
  const [isEditZonaDialogOpen, setIsEditZonaDialogOpen] = useState(false);
  const [searchZonaTerm, setSearchZonaTerm] = useState("");
  const [editingZona, setEditingZona] = useState<ZonaTrabajo | null>(null);
  
  // Usuarios state
  const [isUsuarioDialogOpen, setIsUsuarioDialogOpen] = useState(false);
  const [isEditUsuarioDialogOpen, setIsEditUsuarioDialogOpen] = useState(false);
  const [searchUsuarioTerm, setSearchUsuarioTerm] = useState("");
  const [editingUsuario, setEditingUsuario] = useState<UsuarioSinPassword | null>(null);
  
  const { toast } = useToast();

  // EPIS Fichas EV queries
  const { data: fichas = [], isLoading } = useQuery<EpiFichaEv[]>({
    queryKey: ["/api/epis-fichas-ev"],
  });

  // Zonas de Trabajo queries
  const { data: zonas = [], isLoading: isLoadingZonas } = useQuery<ZonaTrabajo[]>({
    queryKey: ["/api/zonas-trabajo"],
  });

  // Usuarios queries
  const { data: usuarios = [], isLoading: isLoadingUsuarios } = useQuery<UsuarioSinPassword[]>({
    queryKey: ["/api/usuarios"],
  });

  // EPIS Fichas EV forms
  const createForm = useForm<InsertEpiFichaEv>({
    resolver: zodResolver(insertEpiFichaEvSchema),
    defaultValues: {
      nombreEpi: "",
    },
  });

  const editForm = useForm<InsertEpiFichaEv>({
    resolver: zodResolver(insertEpiFichaEvSchema),
    defaultValues: {
      nombreEpi: "",
    },
  });

  // Zonas de Trabajo forms
  const createZonaForm = useForm<InsertZonaTrabajo>({
    resolver: zodResolver(insertZonaTrabajoSchema),
    defaultValues: {
      zona: "",
    },
  });

  const editZonaForm = useForm<InsertZonaTrabajo>({
    resolver: zodResolver(insertZonaTrabajoSchema),
    defaultValues: {
      zona: "",
    },
  });

  // Usuarios forms
  const createUsuarioForm = useForm<InsertUsuario>({
    resolver: zodResolver(insertUsuarioSchema),
    defaultValues: {
      nombreUsuario: "",
      password: "",
      tipoAcceso: "Usuario",
    },
  });

  const editUsuarioForm = useForm<InsertUsuario>({
    resolver: zodResolver(insertUsuarioSchema),
    defaultValues: {
      nombreUsuario: "",
      password: "",
      tipoAcceso: "Usuario",
    },
  });

  // EPIS Fichas EV mutations
  const createMutation = useMutation({
    mutationFn: async (data: InsertEpiFichaEv) => {
      return await apiRequest("POST", "/api/epis-fichas-ev", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/epis-fichas-ev"] });
      setIsDialogOpen(false);
      createForm.reset();
      toast({
        title: "EPI creado",
        description: "La ficha de EPI ha sido creada correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la ficha de EPI",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertEpiFichaEv> }) => {
      return await apiRequest("PATCH", `/api/epis-fichas-ev/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/epis-fichas-ev"] });
      setIsEditDialogOpen(false);
      setEditingFicha(null);
      editForm.reset();
      toast({
        title: "EPI actualizado",
        description: "La ficha de EPI ha sido actualizada correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la ficha de EPI",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/epis-fichas-ev/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/epis-fichas-ev"] });
      toast({
        title: "EPI eliminado",
        description: "La ficha de EPI ha sido eliminada correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la ficha de EPI",
        variant: "destructive",
      });
    },
  });

  // Zonas de Trabajo mutations
  const createZonaMutation = useMutation({
    mutationFn: async (data: InsertZonaTrabajo) => {
      return await apiRequest("POST", "/api/zonas-trabajo", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zonas-trabajo"] });
      setIsZonaDialogOpen(false);
      createZonaForm.reset();
      toast({
        title: "Zona creada",
        description: "La zona de trabajo ha sido creada correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la zona de trabajo",
        variant: "destructive",
      });
    },
  });

  const updateZonaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertZonaTrabajo> }) => {
      return await apiRequest("PATCH", `/api/zonas-trabajo/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zonas-trabajo"] });
      setIsEditZonaDialogOpen(false);
      setEditingZona(null);
      editZonaForm.reset();
      toast({
        title: "Zona actualizada",
        description: "La zona de trabajo ha sido actualizada correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la zona de trabajo",
        variant: "destructive",
      });
    },
  });

  const deleteZonaMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/zonas-trabajo/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/zonas-trabajo"] });
      toast({
        title: "Zona eliminada",
        description: "La zona de trabajo ha sido eliminada correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la zona de trabajo",
        variant: "destructive",
      });
    },
  });

  // Usuarios mutations
  const createUsuarioMutation = useMutation({
    mutationFn: async (data: InsertUsuario) => {
      return await apiRequest("POST", "/api/usuarios", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/usuarios"] });
      setIsUsuarioDialogOpen(false);
      createUsuarioForm.reset();
      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el usuario",
        variant: "destructive",
      });
    },
  });

  const updateUsuarioMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertUsuario> }) => {
      return await apiRequest("PATCH", `/api/usuarios/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/usuarios"] });
      setIsEditUsuarioDialogOpen(false);
      setEditingUsuario(null);
      editUsuarioForm.reset();
      toast({
        title: "Usuario actualizado",
        description: "El usuario ha sido actualizado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    },
  });

  const deleteUsuarioMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/usuarios/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/usuarios"] });
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado correctamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    },
  });

  // EPIS Fichas EV handlers
  const handleCreate = (data: InsertEpiFichaEv) => {
    createMutation.mutate(data);
  };

  const handleOpenEditDialog = (ficha: EpiFichaEv) => {
    setEditingFicha(ficha);
    editForm.reset({
      nombreEpi: ficha.nombreEpi,
    });
    setIsEditDialogOpen(true);
  };

  const handleEdit = (data: InsertEpiFichaEv) => {
    if (editingFicha) {
      updateMutation.mutate({ id: editingFicha.id, data });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta ficha de EPI?")) {
      deleteMutation.mutate(id);
    }
  };

  // Zonas de Trabajo handlers
  const handleCreateZona = (data: InsertZonaTrabajo) => {
    createZonaMutation.mutate(data);
  };

  const handleOpenEditZonaDialog = (zona: ZonaTrabajo) => {
    setEditingZona(zona);
    editZonaForm.reset({
      zona: zona.zona,
    });
    setIsEditZonaDialogOpen(true);
  };

  const handleEditZona = (data: InsertZonaTrabajo) => {
    if (editingZona) {
      updateZonaMutation.mutate({ id: editingZona.id, data });
    }
  };

  const handleDeleteZona = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta zona de trabajo?")) {
      deleteZonaMutation.mutate(id);
    }
  };

  // Usuarios handlers
  const handleCreateUsuario = (data: InsertUsuario) => {
    createUsuarioMutation.mutate(data);
  };

  const handleEditUsuario = (data: InsertUsuario) => {
    if (editingUsuario) {
      updateUsuarioMutation.mutate({ id: editingUsuario.id, data });
    }
  };

  const handleOpenEditUsuarioDialog = (usuario: UsuarioSinPassword) => {
    setEditingUsuario(usuario);
    editUsuarioForm.reset({
      nombreUsuario: usuario.nombreUsuario,
      password: "",
      tipoAcceso: usuario.tipoAcceso as typeof TIPOS_ACCESO[number],
    });
    setIsEditUsuarioDialogOpen(true);
  };

  const handleDeleteUsuario = (id: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      deleteUsuarioMutation.mutate(id);
    }
  };

  const filteredFichas = fichas.filter((ficha) => {
    const searchLower = searchTerm.toLowerCase();
    return ficha.nombreEpi.toLowerCase().includes(searchLower);
  });

  const filteredZonas = zonas.filter((zona) => {
    const searchLower = searchZonaTerm.toLowerCase();
    return zona.zona.toLowerCase().includes(searchLower);
  });

  const filteredUsuarios = usuarios.filter((usuario) => {
    const searchLower = searchUsuarioTerm.toLowerCase();
    return usuario.nombreUsuario.toLowerCase().includes(searchLower) ||
           usuario.tipoAcceso.toLowerCase().includes(searchLower);
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-1">Gestión de catálogos y parámetros del sistema</p>
        </div>
      </div>

      {/* EPIS Fichas EV Section */}
      <Card>
        <Accordion type="single" collapsible className="border-0">
          <AccordionItem value="epis-fichas" className="border-0">
            <CardHeader className="pb-0">
              <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-trigger-epis">
                <div className="text-left">
                  <CardTitle>EPIS Fichas EV</CardTitle>
                  <CardDescription className="mt-1.5">
                    Catálogo de nombres de EPIs para usar en otros módulos
                  </CardDescription>
                </div>
              </AccordionTrigger>
            </CardHeader>
            <AccordionContent>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="relative max-w-sm flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar EPI..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-epi-ficha"
                      />
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button data-testid="button-add-epi-ficha">
                          <Plus className="h-4 w-4 mr-2" />
                          Nuevo EPI
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Crear Ficha de EPI</DialogTitle>
                          <DialogDescription>
                            Agrega un nuevo nombre de EPI al catálogo
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...createForm}>
                          <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                            <FormField
                              control={createForm.control}
                              name="nombreEpi"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nombre del EPI</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Ej: Casco de seguridad"
                                      data-testid="input-nombre-epi"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                data-testid="button-cancel-epi-ficha"
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="submit"
                                disabled={createMutation.isPending}
                                data-testid="button-submit-epi-ficha"
                              >
                                {createMutation.isPending ? "Guardando..." : "Guardar"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Table */}
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-muted-foreground">Cargando fichas...</p>
                    </div>
                  ) : filteredFichas.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {searchTerm ? "No se encontraron resultados" : "No hay fichas de EPIs registradas"}
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre del EPI</TableHead>
                          <TableHead className="w-[100px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredFichas.map((ficha) => (
                          <TableRow key={ficha.id} data-testid={`row-epi-ficha-${ficha.id}`}>
                            <TableCell className="font-medium">{ficha.nombreEpi}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEditDialog(ficha)}
                                  data-testid={`button-edit-epi-ficha-${ficha.id}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(ficha.id)}
                                  data-testid={`button-delete-epi-ficha-${ficha.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Zonas de Trabajo Section */}
      <Card>
        <Accordion type="single" collapsible className="border-0">
          <AccordionItem value="zonas-trabajo" className="border-0">
            <CardHeader className="pb-0">
              <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-trigger-zonas">
                <div className="text-left">
                  <CardTitle>Zonas de Trabajo</CardTitle>
                  <CardDescription className="mt-1.5">
                    Catálogo de zonas de trabajo para asignar a trabajadores y equipos
                  </CardDescription>
                </div>
              </AccordionTrigger>
            </CardHeader>
            <AccordionContent>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="relative max-w-sm flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar zona..."
                        value={searchZonaTerm}
                        onChange={(e) => setSearchZonaTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-zona"
                      />
                    </div>
                    <Dialog open={isZonaDialogOpen} onOpenChange={setIsZonaDialogOpen}>
                      <DialogTrigger asChild>
                        <Button data-testid="button-add-zona">
                          <Plus className="h-4 w-4 mr-2" />
                          Nueva Zona
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Crear Zona de Trabajo</DialogTitle>
                          <DialogDescription>
                            Agrega una nueva zona de trabajo al catálogo
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...createZonaForm}>
                          <form onSubmit={createZonaForm.handleSubmit(handleCreateZona)} className="space-y-4">
                            <FormField
                              control={createZonaForm.control}
                              name="zona"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Zona</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Ej: Almacén principal"
                                      data-testid="input-zona"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsZonaDialogOpen(false)}
                                data-testid="button-cancel-zona"
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="submit"
                                disabled={createZonaMutation.isPending}
                                data-testid="button-submit-zona"
                              >
                                {createZonaMutation.isPending ? "Guardando..." : "Guardar"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Table */}
                  {isLoadingZonas ? (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-muted-foreground">Cargando zonas...</p>
                    </div>
                  ) : filteredZonas.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {searchZonaTerm ? "No se encontraron resultados" : "No hay zonas de trabajo registradas"}
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Zona</TableHead>
                          <TableHead className="w-[100px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredZonas.map((zona) => (
                          <TableRow key={zona.id} data-testid={`row-zona-${zona.id}`}>
                            <TableCell className="font-medium">{zona.zona}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEditZonaDialog(zona)}
                                  data-testid={`button-edit-zona-${zona.id}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteZona(zona.id)}
                                  data-testid={`button-delete-zona-${zona.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Usuarios Section */}
      <Card>
        <Accordion type="single" collapsible className="border-0">
          <AccordionItem value="usuarios" className="border-0">
            <CardHeader className="pb-0">
              <AccordionTrigger className="hover:no-underline py-4" data-testid="accordion-trigger-usuarios">
                <div className="text-left">
                  <CardTitle>Usuarios</CardTitle>
                  <CardDescription className="mt-1.5">
                    Gestión de usuarios del sistema
                  </CardDescription>
                </div>
              </AccordionTrigger>
            </CardHeader>
            <AccordionContent>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="relative max-w-sm flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar usuario..."
                        value={searchUsuarioTerm}
                        onChange={(e) => setSearchUsuarioTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-usuario"
                      />
                    </div>
                    <Dialog open={isUsuarioDialogOpen} onOpenChange={setIsUsuarioDialogOpen}>
                      <DialogTrigger asChild>
                        <Button data-testid="button-add-usuario">
                          <Plus className="h-4 w-4 mr-2" />
                          Nuevo Usuario
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Crear Usuario</DialogTitle>
                          <DialogDescription>
                            Agrega un nuevo usuario al sistema
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...createUsuarioForm}>
                          <form onSubmit={createUsuarioForm.handleSubmit(handleCreateUsuario)} className="space-y-4">
                            <FormField
                              control={createUsuarioForm.control}
                              name="nombreUsuario"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Nombre de Usuario</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Ej: juan.perez"
                                      data-testid="input-nombre-usuario"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={createUsuarioForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contraseña</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="password"
                                      placeholder="Mínimo 6 caracteres"
                                      data-testid="input-password"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={createUsuarioForm.control}
                              name="tipoAcceso"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tipo de Acceso</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-tipo-acceso">
                                        <SelectValue placeholder="Seleccionar tipo" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {TIPOS_ACCESO.map((tipo) => (
                                        <SelectItem key={tipo} value={tipo}>
                                          {tipo}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsUsuarioDialogOpen(false)}
                                data-testid="button-cancel-usuario"
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="submit"
                                disabled={createUsuarioMutation.isPending}
                                data-testid="button-submit-usuario"
                              >
                                {createUsuarioMutation.isPending ? "Guardando..." : "Guardar"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Table */}
                  {isLoadingUsuarios ? (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-muted-foreground">Cargando usuarios...</p>
                    </div>
                  ) : filteredUsuarios.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        {searchUsuarioTerm ? "No se encontraron resultados" : "No hay usuarios registrados"}
                      </p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre de Usuario</TableHead>
                          <TableHead>Tipo de Acceso</TableHead>
                          <TableHead className="w-[100px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsuarios.map((usuario) => (
                          <TableRow key={usuario.id} data-testid={`row-usuario-${usuario.id}`}>
                            <TableCell className="font-medium">{usuario.nombreUsuario}</TableCell>
                            <TableCell>{usuario.tipoAcceso}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenEditUsuarioDialog(usuario)}
                                  data-testid={`button-edit-usuario-${usuario.id}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteUsuario(usuario.id)}
                                  data-testid={`button-delete-usuario-${usuario.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ficha de EPI</DialogTitle>
            <DialogDescription>
              Modifica el nombre del EPI
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEdit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="nombreEpi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del EPI</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Casco de seguridad"
                        data-testid="input-edit-nombre-epi"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingFicha(null);
                    editForm.reset();
                  }}
                  data-testid="button-cancel-edit-epi-ficha"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending}
                  data-testid="button-submit-edit-epi-ficha"
                >
                  {updateMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Zona Dialog */}
      <Dialog open={isEditZonaDialogOpen} onOpenChange={setIsEditZonaDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Zona de Trabajo</DialogTitle>
            <DialogDescription>
              Modifica el nombre de la zona
            </DialogDescription>
          </DialogHeader>
          <Form {...editZonaForm}>
            <form onSubmit={editZonaForm.handleSubmit(handleEditZona)} className="space-y-4">
              <FormField
                control={editZonaForm.control}
                name="zona"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Almacén principal"
                        data-testid="input-edit-zona"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditZonaDialogOpen(false);
                    setEditingZona(null);
                    editZonaForm.reset();
                  }}
                  data-testid="button-cancel-edit-zona"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateZonaMutation.isPending}
                  data-testid="button-submit-edit-zona"
                >
                  {updateZonaMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Usuario Dialog */}
      <Dialog open={isEditUsuarioDialogOpen} onOpenChange={setIsEditUsuarioDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario
            </DialogDescription>
          </DialogHeader>
          <Form {...editUsuarioForm}>
            <form onSubmit={editUsuarioForm.handleSubmit(handleEditUsuario)} className="space-y-4">
              <FormField
                control={editUsuarioForm.control}
                name="nombreUsuario"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de Usuario</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: juan.perez"
                        data-testid="input-edit-nombre-usuario"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUsuarioForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña (dejar en blanco para no cambiar)</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Nueva contraseña"
                        data-testid="input-edit-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editUsuarioForm.control}
                name="tipoAcceso"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Acceso</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-edit-tipo-acceso">
                          <SelectValue placeholder="Seleccionar tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TIPOS_ACCESO.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditUsuarioDialogOpen(false);
                    setEditingUsuario(null);
                    editUsuarioForm.reset();
                  }}
                  data-testid="button-cancel-edit-usuario"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={updateUsuarioMutation.isPending}
                  data-testid="button-submit-edit-usuario"
                >
                  {updateUsuarioMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
