import { db } from "./db";
import { 
  trabajadores, 
  epis, 
  cursos, 
  accidentes,
  epiDocumentos,
  type Trabajador,
  type InsertTrabajador,
  type Epi,
  type InsertEpi,
  type Curso,
  type InsertCurso,
  type Accidente,
  type InsertAccidente,
  type EpiDocumento,
  type InsertEpiDocumento
} from "@shared/schema";
import { eq, desc, or, ilike } from "drizzle-orm";

export interface IStorage {
  // Trabajadores
  getTrabajadores(): Promise<Trabajador[]>;
  getTrabajador(id: string): Promise<Trabajador | undefined>;
  createTrabajador(data: InsertTrabajador): Promise<Trabajador>;
  updateTrabajador(id: string, data: Partial<InsertTrabajador>): Promise<Trabajador | undefined>;
  deleteTrabajador(id: string): Promise<void>;

  // EPIs
  getEpis(): Promise<Epi[]>;
  getEpi(id: string): Promise<Epi | undefined>;
  getEpisByTrabajador(trabajadorId: string): Promise<Epi[]>;
  createEpi(data: InsertEpi): Promise<Epi>;
  updateEpi(id: string, data: Partial<InsertEpi>): Promise<Epi | undefined>;
  deleteEpi(id: string): Promise<void>;

  // Cursos
  getCursos(): Promise<Curso[]>;
  getCurso(id: string): Promise<Curso | undefined>;
  getCursosByTrabajador(trabajadorId: string): Promise<Curso[]>;
  createCurso(data: InsertCurso): Promise<Curso>;
  updateCurso(id: string, data: Partial<InsertCurso>): Promise<Curso | undefined>;
  deleteCurso(id: string): Promise<void>;

  // Accidentes
  getAccidentes(): Promise<Accidente[]>;
  getAccidente(id: string): Promise<Accidente | undefined>;
  getAccidentesByTrabajador(trabajadorId: string): Promise<Accidente[]>;
  createAccidente(data: InsertAccidente): Promise<Accidente>;
  updateAccidente(id: string, data: Partial<InsertAccidente>): Promise<Accidente | undefined>;
  deleteAccidente(id: string): Promise<void>;

  // EPI Documentos
  getEpiDocumentos(epiId: string): Promise<EpiDocumento[]>;
  createEpiDocumento(data: InsertEpiDocumento): Promise<EpiDocumento>;
  deleteEpiDocumento(id: string): Promise<void>;
}

export class DbStorage implements IStorage {
  // Trabajadores
  async getTrabajadores(): Promise<Trabajador[]> {
    return await db.select().from(trabajadores);
  }

  async getTrabajador(id: string): Promise<Trabajador | undefined> {
    const result = await db.select().from(trabajadores).where(eq(trabajadores.id, id));
    return result[0];
  }

  async createTrabajador(data: InsertTrabajador): Promise<Trabajador> {
    const result = await db.insert(trabajadores).values(data).returning();
    return result[0];
  }

  async updateTrabajador(id: string, data: Partial<InsertTrabajador>): Promise<Trabajador | undefined> {
    const result = await db.update(trabajadores).set(data).where(eq(trabajadores.id, id)).returning();
    return result[0];
  }

  async deleteTrabajador(id: string): Promise<void> {
    await db.delete(trabajadores).where(eq(trabajadores.id, id));
  }

  // EPIs
  async getEpis(): Promise<Epi[]> {
    return await db.select().from(epis).orderBy(desc(epis.fechaEntrega));
  }

  async getEpi(id: string): Promise<Epi | undefined> {
    const result = await db.select().from(epis).where(eq(epis.id, id));
    return result[0];
  }

  async getEpisByTrabajador(trabajadorId: string): Promise<Epi[]> {
    return await db.select().from(epis).where(eq(epis.trabajadorId, trabajadorId)).orderBy(desc(epis.fechaEntrega));
  }

  async createEpi(data: InsertEpi): Promise<Epi> {
    const result = await db.insert(epis).values(data).returning();
    return result[0];
  }

  async updateEpi(id: string, data: Partial<InsertEpi>): Promise<Epi | undefined> {
    const result = await db.update(epis).set(data).where(eq(epis.id, id)).returning();
    return result[0];
  }

  async deleteEpi(id: string): Promise<void> {
    await db.delete(epis).where(eq(epis.id, id));
  }

  // Cursos
  async getCursos(): Promise<Curso[]> {
    return await db.select().from(cursos).orderBy(desc(cursos.fechaRealizacion));
  }

  async getCurso(id: string): Promise<Curso | undefined> {
    const result = await db.select().from(cursos).where(eq(cursos.id, id));
    return result[0];
  }

  async getCursosByTrabajador(trabajadorId: string): Promise<Curso[]> {
    return await db.select().from(cursos).where(eq(cursos.trabajadorId, trabajadorId)).orderBy(desc(cursos.fechaRealizacion));
  }

  async createCurso(data: InsertCurso): Promise<Curso> {
    const result = await db.insert(cursos).values(data).returning();
    return result[0];
  }

  async updateCurso(id: string, data: Partial<InsertCurso>): Promise<Curso | undefined> {
    const result = await db.update(cursos).set(data).where(eq(cursos.id, id)).returning();
    return result[0];
  }

  async deleteCurso(id: string): Promise<void> {
    await db.delete(cursos).where(eq(cursos.id, id));
  }

  // Accidentes
  async getAccidentes(): Promise<Accidente[]> {
    return await db.select().from(accidentes).orderBy(desc(accidentes.fecha));
  }

  async getAccidente(id: string): Promise<Accidente | undefined> {
    const result = await db.select().from(accidentes).where(eq(accidentes.id, id));
    return result[0];
  }

  async getAccidentesByTrabajador(trabajadorId: string): Promise<Accidente[]> {
    return await db.select().from(accidentes).where(eq(accidentes.trabajadorId, trabajadorId)).orderBy(desc(accidentes.fecha));
  }

  async createAccidente(data: InsertAccidente): Promise<Accidente> {
    const result = await db.insert(accidentes).values(data).returning();
    return result[0];
  }

  async updateAccidente(id: string, data: Partial<InsertAccidente>): Promise<Accidente | undefined> {
    const result = await db.update(accidentes).set(data).where(eq(accidentes.id, id)).returning();
    return result[0];
  }

  async deleteAccidente(id: string): Promise<void> {
    await db.delete(accidentes).where(eq(accidentes.id, id));
  }

  // EPI Documentos
  async getEpiDocumentos(epiId: string): Promise<EpiDocumento[]> {
    return await db.select().from(epiDocumentos).where(eq(epiDocumentos.epiId, epiId)).orderBy(desc(epiDocumentos.fechaSubida));
  }

  async createEpiDocumento(data: InsertEpiDocumento): Promise<EpiDocumento> {
    const result = await db.insert(epiDocumentos).values(data).returning();
    return result[0];
  }

  async deleteEpiDocumento(id: string): Promise<void> {
    await db.delete(epiDocumentos).where(eq(epiDocumentos.id, id));
  }
}

export const storage = new DbStorage();
