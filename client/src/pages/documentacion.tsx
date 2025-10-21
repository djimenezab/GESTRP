import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  insertFichaSeguridadProductoSchema, 
  insertProductoQuimicoSchema,
  insertInformeAceptacionMaquinariaSchema,
  type FichaSeguridadProducto, 
  type InsertFichaSeguridadProducto,
  type ProductoQuimico,
  type InsertProductoQuimico,
  type Trabajador,
  type Equipo,
  type ZonaTrabajo,
  type InsertInformeAceptacionMaquinaria,
  type EpiFichaEv
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, FileText, Eye, Download, Search, FileSignature, ClipboardList, Flask } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useAuth } from "@/contexts/AuthContext";
import { MachineryAcceptanceDocument } from "@/components/machinery-acceptance-document";

export default function Documentacion() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [editingFicha, setEditingFicha] = useState<FichaSeguridadProducto | null>(null);
  const [deletingFichaId, setDeletingFichaId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermProductosQuimicos, setSearchTermProductosQuimicos] = useState("");
  const [openCreateProductoQuimicoDialog, setOpenCreateProductoQuimicoDialog] = useState(false);
  const [editingProductoQuimico, setEditingProductoQuimico] = useState<ProductoQuimico | null>(null);
  const [deletingProductoQuimicoId, setDeletingProductoQuimicoId] = useState<string | null>(null);
  const [openMachineryAcceptanceDialog, setOpenMachineryAcceptanceDialog] = useState(false);
  const [showMachineryDocument, setShowMachineryDocument] = useState(false);
  const [selectedTrabajador, setSelectedTrabajador] = useState<Trabajador | null>(null);
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null);
  const [machineryFormData, setMachineryFormData] = useState<any>(null);
  const [equipoEpisObligatorios, setEquipoEpisObligatorios] = useState<EpiFichaEv[]>([]);

  const { data: fichas = [], isLoading } = useQuery<FichaSeguridadProducto[]>({
    queryKey: ['/api/fichas-seguridad-productos'],
  });

  // Query para productos químicos (filtrados por zona del usuario)
  const { data: productosQuimicos = [], isLoading: isLoadingProductosQuimicos } = useQuery<ProductoQuimico[]>({
    queryKey: ['/api/productos-quimicos'],
  });

  // Query para zonas de trabajo
  const { data: zonasTrabajoData = [] } = useQuery<ZonaTrabajo[]>({
    queryKey: ['/api/zonas-trabajo'],
  });

  // Query para trabajadores (filtrados por zona del admin)
  const { data: trabajadores = [] } = useQuery<Trabajador[]>({
    queryKey: ['/api/trabajadores'],
    enabled: openMachineryAcceptanceDialog,
  });

  // Query para equipos (filtrados por zona del admin)
  const { data: equipos = [] } = useQuery<Equipo[]>({
    queryKey: ['/api/equipos'],
    enabled: openMachineryAcceptanceDialog,
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertFichaSeguridadProducto) => {
      return await apiRequest('POST', '/api/fichas-seguridad-productos', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fichas-seguridad-productos'] });
      setOpenCreateDialog(false);
      form.reset();
      toast({ title: "Ficha creada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear ficha", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<InsertFichaSeguridadProducto> }) => {
      return await apiRequest('PATCH', `/api/fichas-seguridad-productos/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fichas-seguridad-productos'] });
      setEditingFicha(null);
      editForm.reset();
      toast({ title: "Ficha actualizada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al actualizar ficha", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/fichas-seguridad-productos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fichas-seguridad-productos'] });
      setDeletingFichaId(null);
      toast({ title: "Ficha eliminada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar ficha", variant: "destructive" });
    }
  });

  // Mutaciones para productos químicos
  const createProductoQuimicoMutation = useMutation({
    mutationFn: async (data: InsertProductoQuimico) => {
      return await apiRequest('POST', '/api/productos-quimicos', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/productos-quimicos'] });
      setOpenCreateProductoQuimicoDialog(false);
      productoQuimicoForm.reset();
      toast({ title: "Producto químico creado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear producto químico", variant: "destructive" });
    }
  });

  const updateProductoQuimicoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<InsertProductoQuimico> }) => {
      return await apiRequest('PATCH', `/api/productos-quimicos/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/productos-quimicos'] });
      setEditingProductoQuimico(null);
      editProductoQuimicoForm.reset();
      toast({ title: "Producto químico actualizado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al actualizar producto químico", variant: "destructive" });
    }
  });

  const deleteProductoQuimicoMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest('DELETE', `/api/productos-quimicos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/productos-quimicos'] });
      setDeletingProductoQuimicoId(null);
      toast({ title: "Producto químico eliminado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar producto químico", variant: "destructive" });
    }
  });

  const createMachineryMutation = useMutation({
    mutationFn: async (data: InsertInformeAceptacionMaquinaria) => {
      return await apiRequest('POST', '/api/informes-aceptacion-maquinaria', data);
    },
    onSuccess: () => {
      toast({ title: "Informe generado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al generar informe", variant: "destructive" });
    }
  });

  const form = useForm<InsertFichaSeguridadProducto>({
    resolver: zodResolver(insertFichaSeguridadProductoSchema),
    defaultValues: {
      nombre: "",
      marca: "",
      modelo: "",
      archivoUrl: "",
    }
  });

  const editForm = useForm<InsertFichaSeguridadProducto>({
    resolver: zodResolver(insertFichaSeguridadProductoSchema),
    defaultValues: {
      nombre: "",
      marca: "",
      modelo: "",
      archivoUrl: "",
    }
  });

  const machineryForm = useForm<InsertInformeAceptacionMaquinaria>({
    resolver: zodResolver(insertInformeAceptacionMaquinariaSchema),
    defaultValues: {
      trabajadorId: "",
      equipoId: "",
      fechaAceptacion: new Date().toISOString().split('T')[0],
      observaciones: "",
    }
  });

  const productoQuimicoForm = useForm<InsertProductoQuimico>({
    resolver: zodResolver(insertProductoQuimicoSchema),
    defaultValues: {
      zonaId: "",
      nombre: "",
      ubicacionAlmacen: "",
      cantidad: "",
      nombreComercial: "",
    }
  });

  const editProductoQuimicoForm = useForm<InsertProductoQuimico>({
    resolver: zodResolver(insertProductoQuimicoSchema),
    defaultValues: {
      zonaId: "",
      nombre: "",
      ubicacionAlmacen: "",
      cantidad: "",
      nombreComercial: "",
    }
  });

  const handleFileUpload = (formInstance: any) => {
    return async () => {
      const response = await fetch("/api/objects/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        throw new Error("Error al obtener URL de subida");
      }
      
      const data = await response.json();
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    };
  };

  const handleUploadComplete = (formInstance: any) => {
    return (result: any) => {
      if (result.successful && result.successful.length > 0) {
        const file = result.successful[0];
        const uploadUrl = file.uploadURL || file.response?.uploadURL;
        if (uploadUrl) {
          const urlParts = new URL(uploadUrl).pathname.split('/');
          const uploadsIndex = urlParts.indexOf('uploads');
          if (uploadsIndex >= 0 && urlParts[uploadsIndex + 1]) {
            const objectId = urlParts[uploadsIndex + 1];
            const objectPath = `/objects/uploads/${objectId}`;
            formInstance.setValue("archivoUrl", objectPath, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
            toast({
              title: "Archivo subido",
              description: "El archivo ha sido subido correctamente",
            });
          }
        }
      }
    };
  };

  const handleCreateFicha = (data: InsertFichaSeguridadProducto) => {
    createMutation.mutate(data);
  };

  const handleUpdateFicha = (data: InsertFichaSeguridadProducto) => {
    if (editingFicha) {
      updateMutation.mutate({ id: editingFicha.id, data });
    }
  };

  const openEditDialog = (ficha: FichaSeguridadProducto) => {
    setEditingFicha(ficha);
    editForm.reset({
      nombre: ficha.nombre,
      marca: ficha.marca,
      modelo: ficha.modelo,
      archivoUrl: ficha.archivoUrl || "",
    });
  };

  const handleGenerateMachineryDocument = async (data: InsertInformeAceptacionMaquinaria) => {
    const trabajador = trabajadores.find(t => t.id === data.trabajadorId);
    const equipo = equipos.find(e => e.id === data.equipoId);
    
    if (!trabajador || !equipo) {
      toast({ title: "Error: Datos incompletos", variant: "destructive" });
      return;
    }

    // Obtener EPIs obligatorios del equipo
    try {
      const episObligatorios = await apiRequest('GET', `/api/equipos/${data.equipoId}/epis-obligatorios`) as EpiFichaEv[];
      setEquipoEpisObligatorios(episObligatorios || []);
    } catch (error) {
      console.error("Error obteniendo EPIs obligatorios:", error);
      setEquipoEpisObligatorios([]);
    }

    setSelectedTrabajador(trabajador);
    setSelectedEquipo(equipo);
    setMachineryFormData(data);
    setShowMachineryDocument(true);
    
    // Guardar en base de datos
    createMachineryMutation.mutate(data);
  };

  const handleCreateProductoQuimico = (data: InsertProductoQuimico) => {
    createProductoQuimicoMutation.mutate(data);
  };

  const handleUpdateProductoQuimico = (data: InsertProductoQuimico) => {
    if (editingProductoQuimico) {
      updateProductoQuimicoMutation.mutate({ id: editingProductoQuimico.id, data });
    }
  };

  const openEditProductoQuimicoDialog = (producto: ProductoQuimico) => {
    setEditingProductoQuimico(producto);
    editProductoQuimicoForm.reset({
      zonaId: producto.zonaId,
      nombre: producto.nombre,
      ubicacionAlmacen: producto.ubicacionAlmacen,
      cantidad: producto.cantidad,
      nombreComercial: producto.nombreComercial || "",
    });
  };

  const filteredFichas = fichas.filter(ficha =>
    ficha.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ficha.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ficha.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProductosQuimicos = productosQuimicos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchTermProductosQuimicos.toLowerCase()) ||
    (producto.nombreComercial && producto.nombreComercial.toLowerCase().includes(searchTermProductosQuimicos.toLowerCase())) ||
    producto.ubicacionAlmacen.toLowerCase().includes(searchTermProductosQuimicos.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Documentación</h1>
          <p className="text-muted-foreground mt-1">Gestión de documentación técnica y de seguridad</p>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="fichas-seguridad" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span className="text-lg font-semibold">Fichas de seguridad de productos</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-4 mt-4">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, marca o modelo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-fichas"
                  />
                </div>
                {user?.tipoAcceso !== "Usuario" && (
                  <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-crear-ficha">
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Ficha
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Ficha de Seguridad</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleCreateFicha)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="nombre"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre del Producto</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-nombre" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="marca"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Marca</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-marca" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="modelo"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Modelo</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-modelo" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="archivoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ficha de Seguridad (PDF)</FormLabel>
                              <FormControl>
                                <div className="space-y-2">
                                  <input type="hidden" {...field} value={field.value || ""} />
                                  <div className="flex gap-2">
                                    <ObjectUploader
                                      maxNumberOfFiles={1}
                                      maxFileSize={10485760}
                                      onGetUploadParameters={handleFileUpload(form)}
                                      onComplete={handleUploadComplete(form)}
                                    >
                                      <FileText className="h-4 w-4 mr-2" />
                                      {field.value ? "Cambiar Ficha" : "Subir Ficha"}
                                    </ObjectUploader>
                                    {field.value && (
                                      <>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="default"
                                          onClick={() => field.value && window.open(field.value, '_blank')}
                                          data-testid="button-view-ficha-create"
                                        >
                                          <Eye className="h-4 w-4 mr-2" />
                                          Ver
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          size="default"
                                          onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = field.value || '';
                                            link.download = 'ficha-seguridad.pdf';
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                          }}
                                          data-testid="button-download-ficha-create"
                                        >
                                          <Download className="h-4 w-4 mr-2" />
                                          Descargar
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                  {field.value && (
                                    <p className="text-sm text-muted-foreground">
                                      ✓ Archivo cargado
                                    </p>
                                  )}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit" disabled={createMutation.isPending} data-testid="button-guardar-ficha">
                            {createMutation.isPending ? "Guardando..." : "Guardar"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                )}
              </div>

              {fichas.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No hay fichas de seguridad registradas.
                      <br />
                      Crea una para comenzar.
                    </p>
                  </CardContent>
                </Card>
              ) : filteredFichas.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No se encontraron fichas que coincidan con "{searchTerm}".
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredFichas.map((ficha) => (
                    <Card key={ficha.id} data-testid={`card-ficha-${ficha.id}`}>
                      <CardHeader>
                        <CardTitle className="text-lg">{ficha.nombre}</CardTitle>
                        <CardDescription>
                          {ficha.marca} - {ficha.modelo}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {ficha.archivoUrl && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FileText className="h-4 w-4" />
                            <span>Ficha disponible</span>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2">
                          {user?.tipoAcceso !== "Usuario" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(ficha)}
                              data-testid={`button-editar-${ficha.id}`}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          )}
                          
                          {ficha.archivoUrl && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(ficha.archivoUrl || '', '_blank')}
                                data-testid={`button-ver-${ficha.id}`}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = ficha.archivoUrl || '';
                                  link.download = `${ficha.nombre}.pdf`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                data-testid={`button-descargar-${ficha.id}`}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                              </Button>
                            </>
                          )}
                          
                          {user?.tipoAcceso !== "Usuario" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeletingFichaId(ficha.id)}
                              data-testid={`button-eliminar-${ficha.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Productos Químicos */}
        <AccordionItem value="productos-quimicos" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2">
              <Flask className="h-5 w-5" />
              <span className="text-lg font-semibold">Productos químicos</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <div className="space-y-4 mt-4">
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, nombre comercial o ubicación..."
                    value={searchTermProductosQuimicos}
                    onChange={(e) => setSearchTermProductosQuimicos(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-productos-quimicos"
                  />
                </div>
                <Dialog open={openCreateProductoQuimicoDialog} onOpenChange={setOpenCreateProductoQuimicoDialog}>
                  <DialogTrigger asChild>
                    <Button data-testid="button-crear-producto-quimico">
                      <Plus className="h-4 w-4 mr-2" />
                      Añadir Producto
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Añadir Producto Químico</DialogTitle>
                    </DialogHeader>
                    <Form {...productoQuimicoForm}>
                      <form onSubmit={productoQuimicoForm.handleSubmit(handleCreateProductoQuimico)} className="space-y-4">
                        <FormField
                          control={productoQuimicoForm.control}
                          name="zonaId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Zona de Trabajo</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-zona-create">
                                    <SelectValue placeholder="Seleccionar zona" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {zonasTrabajoData.map((zona) => (
                                    <SelectItem key={zona.id} value={zona.id}>
                                      {zona.nombre}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={productoQuimicoForm.control}
                          name="nombre"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-nombre-producto" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={productoQuimicoForm.control}
                          name="ubicacionAlmacen"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ubicación Almacén</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-ubicacion" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={productoQuimicoForm.control}
                          name="cantidad"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cantidad</FormLabel>
                              <FormControl>
                                <Input {...field} data-testid="input-cantidad" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={productoQuimicoForm.control}
                          name="nombreComercial"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nombre Comercial (opcional)</FormLabel>
                              <FormControl>
                                <Input {...field} value={field.value || ""} data-testid="input-nombre-comercial" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit" disabled={createProductoQuimicoMutation.isPending} data-testid="button-guardar-producto">
                            {createProductoQuimicoMutation.isPending ? "Guardando..." : "Guardar"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>

              {productosQuimicos.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Flask className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No hay productos químicos registrados.
                      <br />
                      Añade uno para comenzar.
                    </p>
                  </CardContent>
                </Card>
              ) : filteredProductosQuimicos.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Search className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No se encontraron productos que coincidan con "{searchTermProductosQuimicos}".
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProductosQuimicos.map((producto) => {
                    const zona = zonasTrabajoData.find(z => z.id === producto.zonaId);
                    return (
                      <Card key={producto.id} data-testid={`card-producto-${producto.id}`}>
                        <CardHeader>
                          <CardTitle className="text-lg">{producto.nombre}</CardTitle>
                          <CardDescription>
                            {zona?.nombre || "Sin zona"}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2 text-sm">
                            {producto.nombreComercial && (
                              <div className="flex items-start gap-2">
                                <span className="text-muted-foreground font-medium min-w-[100px]">Nombre comercial:</span>
                                <span>{producto.nombreComercial}</span>
                              </div>
                            )}
                            <div className="flex items-start gap-2">
                              <span className="text-muted-foreground font-medium min-w-[100px]">Ubicación:</span>
                              <span>{producto.ubicacionAlmacen}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <span className="text-muted-foreground font-medium min-w-[100px]">Cantidad:</span>
                              <span>{producto.cantidad}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditProductoQuimicoDialog(producto)}
                              data-testid={`button-editar-producto-${producto.id}`}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeletingProductoQuimicoId(producto.id)}
                              data-testid={`button-eliminar-producto-${producto.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Generador de Informes - No visible para Usuario */}
        {user?.tipoAcceso !== "Usuario" && (
          <AccordionItem value="generador-informes" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-5 w-5" />
                <span className="text-lg font-semibold">Generador de informes</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="hover-elevate" data-testid="card-informe-aceptacion">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileSignature className="h-5 w-5" />
                        Aceptación uso maquinaria
                      </CardTitle>
                      <CardDescription>
                        Generar documento de aceptación de uso de maquinaria/equipo
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => setOpenMachineryAcceptanceDialog(true)}
                        className="w-full"
                        data-testid="button-generar-aceptacion-maquinaria"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Generar Informe
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      <Dialog open={!!editingFicha} onOpenChange={(open) => !open && setEditingFicha(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Ficha de Seguridad</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleUpdateFicha)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Producto</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-nombre" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-marca" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="modelo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-modelo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="archivoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ficha de Seguridad (PDF)</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <input type="hidden" {...field} value={field.value || ""} />
                        <div className="flex gap-2">
                          <ObjectUploader
                            maxNumberOfFiles={1}
                            maxFileSize={10485760}
                            onGetUploadParameters={handleFileUpload(editForm)}
                            onComplete={handleUploadComplete(editForm)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            {field.value ? "Cambiar Ficha" : "Subir Ficha"}
                          </ObjectUploader>
                          {field.value && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="default"
                                onClick={() => field.value && window.open(field.value, '_blank')}
                                data-testid="button-view-ficha-edit"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Ver
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="default"
                                onClick={() => {
                                  const link = document.createElement('a');
                                  link.href = field.value || '';
                                  link.download = 'ficha-seguridad.pdf';
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                }}
                                data-testid="button-download-ficha-edit"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Descargar
                              </Button>
                            </>
                          )}
                        </div>
                        {field.value && (
                          <p className="text-sm text-muted-foreground">
                            ✓ Archivo cargado
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending} data-testid="button-guardar-edit">
                  {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingFichaId} onOpenChange={(open) => !open && setDeletingFichaId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente la ficha de seguridad y el archivo asociado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancelar-eliminar">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingFichaId && deleteMutation.mutate(deletingFichaId)}
              data-testid="button-confirmar-eliminar"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de edición de producto químico */}
      <Dialog open={!!editingProductoQuimico} onOpenChange={(open) => !open && setEditingProductoQuimico(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Producto Químico</DialogTitle>
          </DialogHeader>
          <Form {...editProductoQuimicoForm}>
            <form onSubmit={editProductoQuimicoForm.handleSubmit(handleUpdateProductoQuimico)} className="space-y-4">
              <FormField
                control={editProductoQuimicoForm.control}
                name="zonaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zona de Trabajo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-zona-edit">
                          <SelectValue placeholder="Seleccionar zona" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {zonasTrabajoData.map((zona) => (
                          <SelectItem key={zona.id} value={zona.id}>
                            {zona.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editProductoQuimicoForm.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-nombre-producto" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editProductoQuimicoForm.control}
                name="ubicacionAlmacen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ubicación Almacén</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-ubicacion" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editProductoQuimicoForm.control}
                name="cantidad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-edit-cantidad" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editProductoQuimicoForm.control}
                name="nombreComercial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Comercial (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} data-testid="input-edit-nombre-comercial" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateProductoQuimicoMutation.isPending} data-testid="button-guardar-edit-producto">
                  {updateProductoQuimicoMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* AlertDialog de eliminación de producto químico */}
      <AlertDialog open={!!deletingProductoQuimicoId} onOpenChange={(open) => !open && setDeletingProductoQuimicoId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el producto químico del registro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancelar-eliminar-producto">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingProductoQuimicoId && deleteProductoQuimicoMutation.mutate(deletingProductoQuimicoId)}
              data-testid="button-confirmar-eliminar-producto"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo para generar informe de aceptación de maquinaria */}
      <Dialog open={openMachineryAcceptanceDialog && !showMachineryDocument} onOpenChange={setOpenMachineryAcceptanceDialog}>
        <DialogContent className="max-w-2xl" data-testid="dialog-machinery-acceptance">
          <DialogHeader>
            <DialogTitle>Generar Informe de Aceptación de Uso de Maquinaria</DialogTitle>
          </DialogHeader>
          <Form {...machineryForm}>
            <form onSubmit={machineryForm.handleSubmit(handleGenerateMachineryDocument)} className="space-y-4">
              <FormField
                control={machineryForm.control}
                name="trabajadorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trabajador</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-trabajador">
                          <SelectValue placeholder="Seleccionar trabajador" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {trabajadores.map((trabajador) => (
                          <SelectItem key={trabajador.id} value={trabajador.id}>
                            {trabajador.nombreCompleto} - {trabajador.dni}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={machineryForm.control}
                name="equipoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Equipo/Maquinaria</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-equipo">
                          <SelectValue placeholder="Seleccionar equipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {equipos.map((equipo) => (
                          <SelectItem key={equipo.id} value={equipo.id}>
                            {equipo.nombre} - {equipo.marca} {equipo.modelo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={machineryForm.control}
                name="fechaAceptacion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Aceptación</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-fecha-aceptacion" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={machineryForm.control}
                name="observaciones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observaciones (opcional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        value={field.value || ""}
                        placeholder="Añadir observaciones relevantes sobre el uso del equipo..."
                        data-testid="textarea-observaciones"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={createMachineryMutation.isPending}
                  data-testid="button-generar-documento-maquinaria"
                >
                  {createMachineryMutation.isPending ? "Generando..." : "Generar Documento"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo para mostrar el documento generado */}
      {showMachineryDocument && selectedTrabajador && selectedEquipo && machineryFormData && (
        <Dialog open={showMachineryDocument} onOpenChange={setShowMachineryDocument}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-documento-generado">
            <DialogHeader className="print:hidden">
              <DialogTitle>Documento de Aceptación de Uso de Maquinaria</DialogTitle>
            </DialogHeader>
            <MachineryAcceptanceDocument
              trabajadorNombre={selectedTrabajador.nombreCompleto}
              trabajadorDni={selectedTrabajador.dni}
              equipoNombre={selectedEquipo.nombre}
              equipoMarca={selectedEquipo.marca}
              equipoModelo={selectedEquipo.modelo}
              equipoNumeroSerie={selectedEquipo.numeroSerie}
              fechaAceptacion={machineryFormData.fechaAceptacion}
              observaciones={machineryFormData.observaciones}
              nombreAdministrador={user?.email ? undefined : "Administrador"}
              equipoEpis={equipoEpisObligatorios}
            />
            <DialogFooter className="print:hidden">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMachineryDocument(false);
                  setOpenMachineryAcceptanceDialog(false);
                  machineryForm.reset();
                }}
                data-testid="button-volver"
              >
                Volver
              </Button>
              <Button
                onClick={() => window.print()}
                data-testid="button-imprimir"
              >
                Imprimir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
