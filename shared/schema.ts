import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, timestamp, integer, boolean } from "drizzle-orm/pg-core";
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

// Trabajadores
export const trabajadores = pgTable("trabajadores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombreCompleto: text("nombre_completo").notNull(),
  categoria: text("categoria").notNull(),
  fechaNacimiento: date("fecha_nacimiento").notNull(),
  dni: varchar("dni", { length: 20 }).notNull().unique(),
  recibeEvaluacionRiesgos: boolean("recibe_evaluacion_riesgos").default(false).notNull(),
  fechaEntregaEvaluacion: date("fecha_entrega_evaluacion"),
});

// EPIs entregados
export const epis = pgTable("epis", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trabajadorId: varchar("trabajador_id").notNull().references(() => trabajadores.id, { onDelete: 'cascade' }),
  tipoEquipo: text("tipo_equipo").notNull(),
  marca: text("marca"),
  modelo: text("modelo"),
  fechaEntrega: date("fecha_entrega").notNull(),
  fechaCaducidad: date("fecha_caducidad"),
  observaciones: text("observaciones"),
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

// Insert schemas
export const insertTrabajadorSchema = createInsertSchema(trabajadores).omit({ id: true }).extend({
  categoria: z.enum(CATEGORIAS),
  dni: z.string().min(1, "DNI es requerido"),
  nombreCompleto: z.string().min(1, "Nombre completo es requerido"),
  fechaNacimiento: z.string().min(1, "Fecha de nacimiento es requerida"),
  recibeEvaluacionRiesgos: z.boolean().default(false),
  fechaEntregaEvaluacion: z.preprocess(
    val => (val === "" || val === null) ? undefined : val, 
    z.string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha debe tener formato YYYY-MM-DD")
      .refine(val => !Number.isNaN(Date.parse(val)), "Fecha inválida")
      .optional()
  ),
}).refine(
  data => !data.recibeEvaluacionRiesgos || (data.recibeEvaluacionRiesgos && data.fechaEntregaEvaluacion),
  {
    message: "La fecha de entrega es requerida cuando se marca que recibe evaluación de riesgos",
    path: ["fechaEntregaEvaluacion"],
  }
);

export const insertEpiSchema = createInsertSchema(epis).omit({ id: true }).extend({
  tipoEquipo: z.string().min(1, "Tipo de equipo es requerido"),
  fechaEntrega: z.string().min(1, "Fecha de entrega es requerida"),
  marca: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
  modelo: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
  fechaCaducidad: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
  observaciones: z.preprocess(val => val === "" ? undefined : val, z.string().optional()),
});

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

// Types
export type InsertTrabajador = z.infer<typeof insertTrabajadorSchema>;
export type Trabajador = typeof trabajadores.$inferSelect;

export type InsertEpi = z.infer<typeof insertEpiSchema>;
export type Epi = typeof epis.$inferSelect;

export type InsertCurso = z.infer<typeof insertCursoSchema>;
export type Curso = typeof cursos.$inferSelect;

export type InsertAccidente = z.infer<typeof insertAccidenteSchema>;
export type Accidente = typeof accidentes.$inferSelect;
