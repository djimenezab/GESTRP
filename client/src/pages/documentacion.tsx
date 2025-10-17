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
import { Plus, Download, Upload, Trash2, Edit, FileText } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function Documentacion() {
  const { toast } = useToast();
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [editingFicha, setEditingFicha] = useState<FichaSeguridadProducto | null>(null);
  const [deletingFichaId, setDeletingFichaId] = useState<string | null>(null);
  const [uploadingFichaId, setUploadingFichaId] = useState<string | null>(null);

  const { data: fichas = [], isLoading } = useQuery<FichaSeguridadProducto[]>({
    queryKey: ['/api/fichas-seguridad-productos'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertFichaSeguridadProducto) => {
      return await apiRequest('/api/fichas-seguridad-productos', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fichas-seguridad-productos'] });
      setOpenCreateDialog(false);
      toast({ title: "Ficha creada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear ficha", variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<InsertFichaSeguridadProducto> }) => {
      return await apiRequest(`/api/fichas-seguridad-productos/${id}`, 'PATCH', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fichas-seguridad-productos'] });
      setEditingFicha(null);
      toast({ title: "Ficha actualizada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al actualizar ficha", variant: "destructive" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/fichas-seguridad-productos/${id}`, 'DELETE');
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

  const uploadMutation = useMutation({
    mutationFn: async ({ id, fileName, fileData }: { id: string, fileName: string, fileData: string }) => {
      return await apiRequest(`/api/fichas-seguridad-productos/${id}/upload`, 'POST', { fileName, fileData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fichas-seguridad-productos'] });
      setUploadingFichaId(null);
      toast({ title: "Archivo subido exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al subir archivo", variant: "destructive" });
    }
  });

  const form = useForm<InsertFichaSeguridadProducto>({
    resolver: zodResolver(insertFichaSeguridadProductoSchema),
    defaultValues: {
      nombre: "",
      marca: "",
      modelo: "",
    }
  });

  const editForm = useForm<InsertFichaSeguridadProducto>({
    resolver: zodResolver(insertFichaSeguridadProductoSchema),
    defaultValues: {
      nombre: "",
      marca: "",
      modelo: "",
    }
  });

  const handleCreateFicha = (data: InsertFichaSeguridadProducto) => {
    createMutation.mutate(data);
  };

  const handleUpdateFicha = (data: InsertFichaSeguridadProducto) => {
    if (editingFicha) {
      updateMutation.mutate({ id: editingFicha.id, data });
    }
  };

  const handleFileUpload = async (fichaId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({ title: "Solo se permiten archivos PDF", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result?.toString().split(',')[1];
      if (base64Data) {
        uploadMutation.mutate({ id: fichaId, fileName: file.name, fileData: base64Data });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async (ficha: FichaSeguridadProducto) => {
    if (!ficha.archivoUrl) return;
    
    try {
      const response = await fetch(`/api/fichas-seguridad-productos/${ficha.id}/download`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = ficha.nombreArchivo || 'ficha-seguridad.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({ title: "Error al descargar archivo", variant: "destructive" });
    }
  };

  const openEditDialog = (ficha: FichaSeguridadProducto) => {
    setEditingFicha(ficha);
    editForm.reset({
      nombre: ficha.nombre,
      marca: ficha.marca,
      modelo: ficha.modelo,
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
                            <span className="truncate">{ficha.nombreArchivo}</span>
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
                          
                          {ficha.archivoUrl ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(ficha)}
                              data-testid={`button-descargar-${ficha.id}`}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Descargar
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setUploadingFichaId(ficha.id)}
                              data-testid={`button-subir-${ficha.id}`}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Subir PDF
                            </Button>
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

                        {uploadingFichaId === ficha.id && (
                          <div className="mt-3">
                            <Input
                              type="file"
                              accept=".pdf"
                              onChange={(e) => handleFileUpload(ficha.id, e)}
                              data-testid={`input-archivo-${ficha.id}`}
                            />
                          </div>
                        )}
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
