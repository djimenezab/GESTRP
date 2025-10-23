import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, timestamp, integer, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Categorías de trabajadores
export const CATEGORIAS = [
  "ENC. GRAL. O.P.",
  "ENCARGADO",
  "OPERADOR M.P.",
  "PEON ESP.",
  "OFICIAL",
  "VIGILANTE CRTAS.",
  "CONDUCTOR"
] as const;

// Niveles de gravedad de accidentes
export const GRAVEDAD_ACCIDENTE = ["LEVE", "MODERADO", "GRAVE"] as const;

// Tipos de accidentes
export const TIPO_ACCIDENTE = ["ACCIDENTE_SERVICIO", "ENFERMEDAD_PROFESIONAL"] as const;

// Tipos de acceso de usuarios
export const TIPOS_ACCESO = ["AdminGral", "Administrador", "Usuario"] as const;

// Catálogo de Zonas de Trabajo - para asignación a trabajadores y equipos
export const zonasTrabajo = pgTable("zonas_trabajo", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  zona: text("zona").notNull().unique(),
  fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
});

// Usuarios del sistema
export const usuarios = pgTable("usuarios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombreUsuario: text("nombre_usuario").notNull().unique(),
  email: text("email"),
  password: text("password").notNull(),
  tipoAcceso: text("tipo_acceso").notNull(),
  zonasIds: varchar("zonas_ids").array(),
  fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
});

// Trabajadores
export const trabajadores = pgTable("trabajadores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombreCompleto: text("nombre_completo").notNull(),
  categoria: text("categoria").notNull(),
  fechaNacimiento: date("fecha_nacimiento").notNull(),
  dni: varchar("dni", { length: 20 }).notNull().unique(),
  email: text("email"),
  zonaId: varchar("zona_id").references(() => zonasTrabajo.id),
  fichaEvaluacionRiesgosUrl: text("ficha_evaluacion_riesgos_url"),
});

// EPIs entregados
export const epis = pgTable("epis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  numeroCorrelativo: varchar("numero_correlativo").unique(),
  trabajadorId: varchar("trabajador_id").notNull().references(() => trabajadores.id, { onDelete: 'cascade' }),
  tipoEquipo: text("tipo_equipo").notNull(),
  marca: text("marca"),
  modelo: text("modelo"),
  fechaEntrega: date("fecha_entrega").notNull(),
  fechaCaducidad: date("fecha_caducidad"),
  observaciones: text("observaciones"),
});

// Documentos de EPIs (almacenados en Replit App Storage)
export const epiDocumentos = pgTable("epi_documentos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  epiId: varchar("epi_id").notNull().references(() => epis.id, { onDelete: 'cascade' }),
  nombreArchivo: text("nombre_archivo").notNull(),
  rutaArchivo: text("ruta_archivo").notNull(), // Path en object storage (/objects/...)
  tipoArchivo: text("tipo_archivo"), // MIME type
  tamanoBytes: integer("tamano_bytes"),
  fechaSubida: timestamp("fecha_subida").defaultNow().notNull(),
});

// Cursos realizados
export const cursos = pgTable("cursos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trabajadorId: varchar("trabajador_id").notNull().references(() => trabajadores.id, { onDelete: 'cascade' }),
  nombreCurso: text("nombre_curso").notNull(),
  fechaRealizacion: date("fecha_realizacion").notNull(),
  duracionHoras: integer("duracion_horas").notNull(),
  observaciones: text("observaciones"),
});

// Accidentes laborales
export const accidentes = pgTable("accidentes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trabajadorId: varchar("trabajador_id").notNull().references(() => trabajadores.id, { onDelete: 'cascade' }),
  centroTrabajo: text("centro_trabajo").notNull(),
  tipoAccidente: text("tipo_accidente").notNull(),
  lugarAccidente: text("lugar_accidente").notNull(),
  fecha: date("fecha").notNull(),
  horaAccidente: varchar("hora_accidente").notNull(),
  descripcion: text("descripcion").notNull(),
  gravedad: text("gravedad").notNull(),
  observaciones: text("observaciones"),
  trabajadorParteId: varchar("trabajador_parte_id").references(() => trabajadores.id),
});

// Catálogo de EPIs (Fichas EV) - para selección en otros módulos
export const episFichasEv = pgTable("epis_fichas_ev", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombreEpi: text("nombre_epi").notNull().unique(),
  fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
});

// Equipos
export const equipos = pgTable("equipos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombre: text("nombre").notNull(),
  marca: text("marca").notNull(),
  modelo: text("modelo").notNull(),
  numeroSerie: text("numero_serie").notNull(),
  fechaAdquisicion: date("fecha_adquisicion").notNull(),
  zonaId: varchar("zona_id").references(() => zonasTrabajo.id),
  fichaEvaluacionUrl: text("ficha_evaluacion_url"),
  manualUrl: text("manual_url"),
  imagenUrl: text("imagen_url"),
  fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
});

// Registros de mantenimiento de equipos
export const mantenimientosEquipos = pgTable("mantenimientos_equipos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  equipoId: varchar("equipo_id").notNull().references(() => equipos.id, { onDelete: 'cascade' }),
  fecha: date("fecha").notNull(),
  actuacionRealizada: text("actuacion_realizada").notNull(),
  personaRealiza: text("persona_realiza").notNull(),
  observaciones: text("observaciones"),
  firmaUrl: text("firma_url"),
  fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
});

// Relación many-to-many: Equipos <-> EPIs Obligatorios
export const equiposEpisObligatorios = pgTable("equipos_epis_obligatorios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  equipoId: varchar("equipo_id").notNull().references(() => equipos.id, { onDelete: 'cascade' }),
  epiFichaEvId: varchar("epi_ficha_ev_id").notNull().references(() => episFichasEv.id, { onDelete: 'cascade' }),
});

// Fichas de seguridad de productos (Documentación)
export const fichasSeguridadProductos = pgTable("fichas_seguridad_productos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombre: text("nombre").notNull(),
  marca: text("marca").notNull(),
  modelo: text("modelo").notNull(),
  archivoUrl: text("archivo_url"),
  nombreArchivo: text("nombre_archivo"),
  fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
});

// Productos químicos (Documentación)
export const productosQuimicos = pgTable("productos_quimicos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  zonaId: varchar("zona_id").notNull().references(() => zonasTrabajo.id),
  nombre: text("nombre").notNull(),
  ubicacionAlmacen: text("ubicacion_almacen"),
  cantidad: text("cantidad").notNull(),
  nombreComercial: text("nombre_comercial"),
});

// Insert schemas
export const insertTrabajadorSchema = createInsertSchema(trabajadores).omit({ id: true }).extend({
  categoria: z.enum(CATEGORIAS),
  dni: z.string().min(1, "DNI es requerido"),
  nombreCompleto: z.string().min(1, "Nombre completo es requerido"),
  fechaNacimiento: z.string().min(1, "Fecha de nacimiento es requerida"),
  email: z.preprocess(val => val === "" ? undefined : val, z.string().email("Email inválido").optional()),
  zonaId: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
  fichaEvaluacionRiesgosUrl: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
});

export const insertEpiSchema = createInsertSchema(epis).omit({ id: true, numeroCorrelativo: true }).extend({
  tipoEquipo: z.string().min(1, "Tipo de equipo es requerido"),
  fechaEntrega: z.string().min(1, "Fecha de entrega es requerida"),
  marca: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
  modelo: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
  fechaCaducidad: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
  observaciones: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
});

export const insertEpiDocumentoSchema = createInsertSchema(epiDocumentos).omit({ id: true, fechaSubida: true });

export const insertCursoSchema = createInsertSchema(cursos).omit({ id: true }).extend({
  nombreCurso: z.string().min(1, "Nombre del curso es requerido"),
  fechaRealizacion: z.string().min(1, "Fecha de realización es requerida"),
  duracionHoras: z.number().min(1, "Duración debe ser al menos 1 hora"),
  observaciones: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
});

export const insertAccidenteSchema = createInsertSchema(accidentes).omit({ id: true }).extend({
  centroTrabajo: z.string().min(1, "Centro de trabajo es requerido"),
  tipoAccidente: z.enum(TIPO_ACCIDENTE),
  lugarAccidente: z.string().min(1, "Lugar del accidente es requerido"),
  fecha: z.string().min(1, "Fecha es requerida"),
  horaAccidente: z.string().min(1, "Hora del accidente es requerida"),
  descripcion: z.string().min(1, "Descripción es requerida"),
  gravedad: z.enum(GRAVEDAD_ACCIDENTE),
  observaciones: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
  trabajadorParteId: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
});

export const insertEpiFichaEvSchema = createInsertSchema(episFichasEv).omit({ id: true, fechaCreacion: true }).extend({
  nombreEpi: z.string().min(1, "Nombre del EPI es requerido"),
});

export const insertZonaTrabajoSchema = createInsertSchema(zonasTrabajo).omit({ id: true, fechaCreacion: true }).extend({
  zona: z.string().min(1, "Nombre de la zona es requerido"),
});

export const insertUsuarioSchema = createInsertSchema(usuarios).omit({ id: true, fechaCreacion: true }).extend({
  nombreUsuario: z.string().min(3, "Nombre de usuario debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  tipoAcceso: z.enum(TIPOS_ACCESO),
  zonasIds: z.array(z.string()).optional(),
});

export const insertEquipoSchema = createInsertSchema(equipos).omit({ id: true, fechaCreacion: true }).extend({
  nombre: z.string().min(1, "Nombre del equipo es requerido"),
  marca: z.string().min(1, "Marca es requerida"),
  modelo: z.string().min(1, "Modelo es requerido"),
  numeroSerie: z.string().min(1, "Número de serie es requerido"),
  fechaAdquisicion: z.string().min(1, "Fecha de adquisición es requerida"),
  zonaId: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
  fichaEvaluacionUrl: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
  manualUrl: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
  imagenUrl: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
});

export const insertEquipoEpiObligatorioSchema = createInsertSchema(equiposEpisObligatorios).omit({ id: true });

export const insertMantenimientoEquipoSchema = createInsertSchema(mantenimientosEquipos).omit({ id: true, fechaCreacion: true }).extend({
  equipoId: z.string().min(1, "Equipo es requerido"),
  fecha: z.string().min(1, "Fecha es requerida"),
  actuacionRealizada: z.string().min(1, "Actuación realizada es requerida"),
  personaRealiza: z.string().min(1, "Persona que realiza es requerida"),
  observaciones: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
  firmaUrl: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
});

export const insertFichaSeguridadProductoSchema = createInsertSchema(fichasSeguridadProductos).omit({ id: true, fechaCreacion: true }).extend({
  nombre: z.string().min(1, "Nombre del producto es requerido"),
  marca: z.string().min(1, "Marca es requerida"),
  modelo: z.string().min(1, "Modelo es requerido"),
  archivoUrl: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
  nombreArchivo: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
});

export const insertProductoQuimicoSchema = createInsertSchema(productosQuimicos).omit({ id: true }).extend({
  zonaId: z.string().min(1, "Zona de trabajo es requerida"),
  nombre: z.string().min(1, "Nombre es requerido"),
  ubicacionAlmacen: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
  cantidad: z.string().min(1, "Cantidad es requerida"),
  nombreComercial: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
});

// Informes de Aceptación de Uso de Maquinaria
export const informesAceptacionMaquinaria = pgTable("informes_aceptacion_maquinaria", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trabajadorId: varchar("trabajador_id").notNull().references(() => trabajadores.id, { onDelete: 'cascade' }),
  equipoId: varchar("equipo_id").notNull().references(() => equipos.id, { onDelete: 'cascade' }),
  fechaAceptacion: date("fecha_aceptacion").notNull(),
  observaciones: text("observaciones"),
  fechaCreacion: timestamp("fecha_creacion").defaultNow().notNull(),
});

export const insertInformeAceptacionMaquinariaSchema = createInsertSchema(informesAceptacionMaquinaria).omit({ id: true, fechaCreacion: true }).extend({
  trabajadorId: z.string().min(1, "Trabajador es requerido"),
  equipoId: z.string().min(1, "Equipo es requerido"),
  fechaAceptacion: z.string().min(1, "Fecha de aceptación es requerida"),
  observaciones: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
});

// Documentos del expediente digitalizado del trabajador
export const documentosExpediente = pgTable("documentos_expediente", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trabajadorId: varchar("trabajador_id").notNull().references(() => trabajadores.id, { onDelete: 'cascade' }),
  nombreDocumento: text("nombre_documento").notNull(),
  archivoUrl: text("archivo_url").notNull(),
  tipoArchivo: text("tipo_archivo"),
  tamanoBytes: integer("tamano_bytes"),
  descripcion: text("descripcion"),
  fechaSubida: timestamp("fecha_subida").defaultNow().notNull(),
});

export const insertDocumentoExpedienteSchema = createInsertSchema(documentosExpediente).omit({ id: true, fechaSubida: true }).extend({
  trabajadorId: z.string().min(1, "Trabajador es requerido"),
  nombreDocumento: z.string().min(1, "Nombre del documento es requerido"),
  archivoUrl: z.string().min(1, "Archivo es requerido"),
  tipoArchivo: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
  tamanoBytes: z.preprocess(val => val === "" ? undefined : val, z.number().optional()),
  descripcion: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
});

// Types
export type InsertTrabajador = z.infer<typeof insertTrabajadorSchema>;
export type Trabajador = typeof trabajadores.$inferSelect;

export type InsertEpi = z.infer<typeof insertEpiSchema>;
export type Epi = typeof epis.$inferSelect;

export type InsertEpiDocumento = z.infer<typeof insertEpiDocumentoSchema>;
export type EpiDocumento = typeof epiDocumentos.$inferSelect;

export type InsertCurso = z.infer<typeof insertCursoSchema>;
export type Curso = typeof cursos.$inferSelect;

export type InsertAccidente = z.infer<typeof insertAccidenteSchema>;
export type Accidente = typeof accidentes.$inferSelect;

export type InsertEpiFichaEv = z.infer<typeof insertEpiFichaEvSchema>;
export type EpiFichaEv = typeof episFichasEv.$inferSelect;

export type InsertZonaTrabajo = z.infer<typeof insertZonaTrabajoSchema>;
export type ZonaTrabajo = typeof zonasTrabajo.$inferSelect;

export type InsertUsuario = z.infer<typeof insertUsuarioSchema>;
export type Usuario = typeof usuarios.$inferSelect;
export type UsuarioSinPassword = Omit<Usuario, 'password'>;

export type InsertEquipo = z.infer<typeof insertEquipoSchema>;
export type Equipo = typeof equipos.$inferSelect;

export type InsertEquipoEpiObligatorio = z.infer<typeof insertEquipoEpiObligatorioSchema>;
export type EquipoEpiObligatorio = typeof equiposEpisObligatorios.$inferSelect;

export type InsertMantenimientoEquipo = z.infer<typeof insertMantenimientoEquipoSchema>;
export type MantenimientoEquipo = typeof mantenimientosEquipos.$inferSelect;

export type InsertFichaSeguridadProducto = z.infer<typeof insertFichaSeguridadProductoSchema>;
export type FichaSeguridadProducto = typeof fichasSeguridadProductos.$inferSelect;

export type InsertProductoQuimico = z.infer<typeof insertProductoQuimicoSchema>;
export type ProductoQuimico = typeof productosQuimicos.$inferSelect;

export type InsertInformeAceptacionMaquinaria = z.infer<typeof insertInformeAceptacionMaquinariaSchema>;
export type InformeAceptacionMaquinaria = typeof informesAceptacionMaquinaria.$inferSelect;

export type InsertDocumentoExpediente = z.infer<typeof insertDocumentoExpedienteSchema>;
export type DocumentoExpediente = typeof documentosExpediente.$inferSelect;
