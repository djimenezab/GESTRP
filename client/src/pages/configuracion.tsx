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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEpiFichaEvSchema, type InsertEpiFichaEv, type EpiFichaEv } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Configuracion() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFicha, setEditingFicha] = useState<EpiFichaEv | null>(null);
  const { toast } = useToast();

  const { data: fichas = [], isLoading } = useQuery<EpiFichaEv[]>({
    queryKey: ["/api/epis-fichas-ev"],
  });

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

  const filteredFichas = fichas.filter((ficha) => {
    const searchLower = searchTerm.toLowerCase();
    return ficha.nombreEpi.toLowerCase().includes(searchLower);
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
    </div>
  );
}
