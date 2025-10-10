import { sql } from "drizzle-orm";
import { pgTable, text, varchar, date, timestamp, integer } from "drizzle-orm/pg-core";
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

// Trabajadores
export const trabajadores = pgTable("trabajadores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nombreCompleto: text("nombre_completo").notNull(),
  categoria: text("categoria").notNull(),
  fechaNacimiento: date("fecha_nacimiento").notNull(),
  dni: varchar("dni", { length: 20 }).notNull().unique(),
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
  fecha: date("fecha").notNull(),
  descripcion: text("descripcion").notNull(),
  gravedad: text("gravedad").notNull(),
  observaciones: text("observaciones"),
});

// Insert schemas
export const insertTrabajadorSchema = createInsertSchema(trabajadores).omit({ id: true }).extend({
  categoria: z.enum(CATEGORIAS),
  dni: z.string().min(1, "DNI es requerido"),
  nombreCompleto: z.string().min(1, "Nombre completo es requerido"),
  fechaNacimiento: z.string().min(1, "Fecha de nacimiento es requerida"),
});

export const insertEpiSchema = createInsertSchema(epis).omit({ id: true }).extend({
  tipoEquipo: z.string().min(1, "Tipo de equipo es requerido"),
  fechaEntrega: z.string().min(1, "Fecha de entrega es requerida"),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  fechaCaducidad: z.string().optional(),
  observaciones: z.string().optional(),
});

export const insertCursoSchema = createInsertSchema(cursos).omit({ id: true }).extend({
  nombreCurso: z.string().min(1, "Nombre del curso es requerido"),
  fechaRealizacion: z.string().min(1, "Fecha de realización es requerida"),
  duracionHoras: z.number().min(1, "Duración debe ser al menos 1 hora"),
});

export const insertAccidenteSchema = createInsertSchema(accidentes).omit({ id: true }).extend({
  fecha: z.string().min(1, "Fecha es requerida"),
  descripcion: z.string().min(1, "Descripción es requerida"),
  gravedad: z.enum(GRAVEDAD_ACCIDENTE),
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
