import { db } from "./db";
import { 
  trabajadores, 
  epis, 
  cursos, 
  accidentes,
  epiDocumentos,
  episFichasEv,
  zonasTrabajo,
  usuarios,
  equipos,
  equiposEpisObligatorios,
  type Trabajador,
  type InsertTrabajador,
  type Epi,
  type InsertEpi,
  type Curso,
  type InsertCurso,
  type Accidente,
  type InsertAccidente,
  type EpiDocumento,
  type InsertEpiDocumento,
  type EpiFichaEv,
  type InsertEpiFichaEv,
  type ZonaTrabajo,
  type InsertZonaTrabajo,
  type Usuario,
  type InsertUsuario,
  type Equipo,
  type InsertEquipo,
  type EquipoEpiObligatorio,
  type InsertEquipoEpiObligatorio
} from "@shared/schema";
import { eq, desc, or, ilike, asc } from "drizzle-orm";

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

  // EPIs Fichas EV (Catálogo)
  getEpisFichasEv(): Promise<EpiFichaEv[]>;
  getEpiFichaEv(id: string): Promise<EpiFichaEv | undefined>;
  createEpiFichaEv(data: InsertEpiFichaEv): Promise<EpiFichaEv>;
  updateEpiFichaEv(id: string, data: Partial<InsertEpiFichaEv>): Promise<EpiFichaEv | undefined>;
  deleteEpiFichaEv(id: string): Promise<void>;

  // Zonas de Trabajo (Catálogo)
  getZonasTrabajo(): Promise<ZonaTrabajo[]>;
  getZonaTrabajo(id: string): Promise<ZonaTrabajo | undefined>;
  createZonaTrabajo(data: InsertZonaTrabajo): Promise<ZonaTrabajo>;
  updateZonaTrabajo(id: string, data: Partial<InsertZonaTrabajo>): Promise<ZonaTrabajo | undefined>;
  deleteZonaTrabajo(id: string): Promise<void>;

  // Usuarios
  getUsuarios(): Promise<Usuario[]>;
  getUsuario(id: string): Promise<Usuario | undefined>;
  createUsuario(data: InsertUsuario): Promise<Usuario>;
  updateUsuario(id: string, data: Partial<InsertUsuario>): Promise<Usuario | undefined>;
  deleteUsuario(id: string): Promise<void>;

  // Equipos
  getEquipos(): Promise<Equipo[]>;
  getEquipo(id: string): Promise<Equipo | undefined>;
  createEquipo(data: InsertEquipo): Promise<Equipo>;
  updateEquipo(id: string, data: Partial<InsertEquipo>): Promise<Equipo | undefined>;
  deleteEquipo(id: string): Promise<void>;

  // Equipos EPIs Obligatorios (relación many-to-many)
  getEquipoEpisObligatorios(equipoId: string): Promise<EpiFichaEv[]>;
  addEquipoEpiObligatorio(data: InsertEquipoEpiObligatorio): Promise<EquipoEpiObligatorio>;
  removeEquipoEpiObligatorio(equipoId: string, epiFichaEvId: string): Promise<void>;
  setEquipoEpisObligatorios(equipoId: string, epiIds: string[]): Promise<void>;
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
    // Generar número correlativo automático
    const currentYear = new Date().getFullYear();
    const prefix = `EPI${currentYear}_`;
    
    // Buscar el último número correlativo del año actual
    const lastEpi = await db
      .select()
      .from(epis)
      .where(ilike(epis.numeroCorrelativo, `${prefix}%`))
      .orderBy(desc(epis.numeroCorrelativo))
      .limit(1);
    
    let nextNumber = 1;
    if (lastEpi.length > 0 && lastEpi[0].numeroCorrelativo) {
      const lastNumber = parseInt(lastEpi[0].numeroCorrelativo.split('_')[1]);
      nextNumber = lastNumber + 1;
    }
    
    const numeroCorrelativo = `${prefix}${String(nextNumber).padStart(3, '0')}`;
    
    const result = await db.insert(epis).values({
      ...data,
      numeroCorrelativo
    }).returning();
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

  // EPIs Fichas EV (Catálogo)
  async getEpisFichasEv(): Promise<EpiFichaEv[]> {
    return await db.select().from(episFichasEv).orderBy(episFichasEv.nombreEpi);
  }

  async getEpiFichaEv(id: string): Promise<EpiFichaEv | undefined> {
    const result = await db.select().from(episFichasEv).where(eq(episFichasEv.id, id));
    return result[0];
  }

  async createEpiFichaEv(data: InsertEpiFichaEv): Promise<EpiFichaEv> {
    const result = await db.insert(episFichasEv).values(data).returning();
    return result[0];
  }

  async updateEpiFichaEv(id: string, data: Partial<InsertEpiFichaEv>): Promise<EpiFichaEv | undefined> {
    const result = await db.update(episFichasEv).set(data).where(eq(episFichasEv.id, id)).returning();
    return result[0];
  }

  async deleteEpiFichaEv(id: string): Promise<void> {
    await db.delete(episFichasEv).where(eq(episFichasEv.id, id));
  }

  // Zonas de Trabajo (Catálogo)
  async getZonasTrabajo(): Promise<ZonaTrabajo[]> {
    return await db.select().from(zonasTrabajo).orderBy(zonasTrabajo.zona);
  }

  async getZonaTrabajo(id: string): Promise<ZonaTrabajo | undefined> {
    const result = await db.select().from(zonasTrabajo).where(eq(zonasTrabajo.id, id));
    return result[0];
  }

  async createZonaTrabajo(data: InsertZonaTrabajo): Promise<ZonaTrabajo> {
    const result = await db.insert(zonasTrabajo).values(data).returning();
    return result[0];
  }

  async updateZonaTrabajo(id: string, data: Partial<InsertZonaTrabajo>): Promise<ZonaTrabajo | undefined> {
    const result = await db.update(zonasTrabajo).set(data).where(eq(zonasTrabajo.id, id)).returning();
    return result[0];
  }

  async deleteZonaTrabajo(id: string): Promise<void> {
    await db.delete(zonasTrabajo).where(eq(zonasTrabajo.id, id));
  }

  // Usuarios
  async getUsuarios(): Promise<Usuario[]> {
    return await db.select().from(usuarios).orderBy(usuarios.nombreUsuario);
  }

  async getUsuario(id: string): Promise<Usuario | undefined> {
    const result = await db.select().from(usuarios).where(eq(usuarios.id, id));
    return result[0];
  }

  async createUsuario(data: InsertUsuario): Promise<Usuario> {
    const result = await db.insert(usuarios).values(data).returning();
    return result[0];
  }

  async updateUsuario(id: string, data: Partial<InsertUsuario>): Promise<Usuario | undefined> {
    const result = await db.update(usuarios).set(data).where(eq(usuarios.id, id)).returning();
    return result[0];
  }

  async deleteUsuario(id: string): Promise<void> {
    await db.delete(usuarios).where(eq(usuarios.id, id));
  }

  // Equipos
  async getEquipos(): Promise<Equipo[]> {
    return await db.select().from(equipos).orderBy(desc(equipos.fechaCreacion));
  }

  async getEquipo(id: string): Promise<Equipo | undefined> {
    const result = await db.select().from(equipos).where(eq(equipos.id, id));
    return result[0];
  }

  async createEquipo(data: InsertEquipo): Promise<Equipo> {
    const result = await db.insert(equipos).values(data).returning();
    return result[0];
  }

  async updateEquipo(id: string, data: Partial<InsertEquipo>): Promise<Equipo | undefined> {
    const result = await db.update(equipos).set(data).where(eq(equipos.id, id)).returning();
    return result[0];
  }

  async deleteEquipo(id: string): Promise<void> {
    await db.delete(equipos).where(eq(equipos.id, id));
  }

  // Equipos EPIs Obligatorios (relación many-to-many)
  async getEquipoEpisObligatorios(equipoId: string): Promise<EpiFichaEv[]> {
    const result = await db
      .select({ 
        id: episFichasEv.id,
        nombreEpi: episFichasEv.nombreEpi,
        fechaCreacion: episFichasEv.fechaCreacion
      })
      .from(equiposEpisObligatorios)
      .innerJoin(episFichasEv, eq(equiposEpisObligatorios.epiFichaEvId, episFichasEv.id))
      .where(eq(equiposEpisObligatorios.equipoId, equipoId))
      .orderBy(asc(episFichasEv.nombreEpi));
    
    return result;
  }

  async addEquipoEpiObligatorio(data: InsertEquipoEpiObligatorio): Promise<EquipoEpiObligatorio> {
    const result = await db.insert(equiposEpisObligatorios).values(data).returning();
    return result[0];
  }

  async removeEquipoEpiObligatorio(equipoId: string, epiFichaEvId: string): Promise<void> {
    await db.delete(equiposEpisObligatorios)
      .where(
        eq(equiposEpisObligatorios.equipoId, equipoId) && 
        eq(equiposEpisObligatorios.epiFichaEvId, epiFichaEvId)
      );
  }

  async setEquipoEpisObligatorios(equipoId: string, epiIds: string[]): Promise<void> {
    // Eliminar todos los EPIs obligatorios actuales del equipo
    await db.delete(equiposEpisObligatorios).where(eq(equiposEpisObligatorios.equipoId, equipoId));
    
    // Insertar los nuevos EPIs obligatorios
    if (epiIds.length > 0) {
      await db.insert(equiposEpisObligatorios).values(
        epiIds.map(epiId => ({ equipoId, epiFichaEvId: epiId }))
      );
    }
  }
}

export const storage = new DbStorage();
