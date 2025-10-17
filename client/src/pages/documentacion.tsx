import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFichaSeguridadProductoSchema, type FichaSeguridadProducto, type InsertFichaSeguridadProducto } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, FileText, Eye, Download } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ObjectUploader } from "@/components/ObjectUploader";

export default function Documentacion() {
  const { toast } = useToast();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [editingFicha, setEditingFicha] = useState<FichaSeguridadProducto | null>(null);
  const [deletingFichaId, setDeletingFichaId] = useState<string | null>(null);

  const { data: fichas = [], isLoading } = useQuery<FichaSeguridadProducto[]>({
    queryKey: ['/api/fichas-seguridad-productos'],
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
              <div className="flex justify-end">
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
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {fichas.map((ficha) => (
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
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(ficha)}
                            data-testid={`button-editar-${ficha.id}`}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                          
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
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeletingFichaId(ficha.id)}
                            data-testid={`button-eliminar-${ficha.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
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
    </div>
  );
}
