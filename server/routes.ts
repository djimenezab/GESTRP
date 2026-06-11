import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth } from "./middleware";
import { 
  insertTrabajadorSchema,
  insertEpiSchema,
  insertCursoSchema,
  insertAccidenteSchema,
  insertEpiDocumentoSchema,
  insertCursoDocumentoSchema,
  insertAccidenteDocumentoSchema,
  insertEpiFichaEvSchema,
  insertZonaTrabajoSchema,
  insertUsuarioSchema,
  insertEquipoSchema,
  insertMantenimientoEquipoSchema,
  insertFichaSeguridadProductoSchema,
  insertProductoQuimicoSchema,
  insertInformeAceptacionMaquinariaSchema,
  insertDocumentoExpedienteSchema,
  trabajadores,
  CATEGORIAS,
  type InsertEpi
} from "@shared/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import bcrypt from "bcrypt";

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply authentication middleware to all /api routes except /api/auth/*
  app.use("/api", (req, res, next) => {
    if (req.path.startsWith("/auth")) {
      return next();
    }
    requireAuth(req, res, next);
  });

  // Trabajadores routes
  app.get("/api/trabajadores", async (req, res) => {
    try {
      const tipoAcceso = req.session.tipoAcceso;
      const zonasIds = req.session.zonasIds;
      const trabajadorId = req.session.trabajadorId;
      let trabajadores: any[] = [];
      
      if (tipoAcceso === "AdminGral") {
        trabajadores = await storage.getTrabajadores();
      } else if (tipoAcceso === "Administrador" && zonasIds) {
        trabajadores = await storage.getTrabajadoresByZonas(zonasIds);
      } else if (tipoAcceso === "Usuario" && trabajadorId) {
        // Usuario solo ve su propia ficha
        const trabajador = await storage.getTrabajador(trabajadorId);
        trabajadores = trabajador ? [trabajador] : [];
      }
      
      res.json(trabajadores);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener trabajadores" });
    }
  });

  app.get("/api/zonas/:zonaId/trabajadores", async (req, res) => {
    try {
      const trabajadores = await storage.getTrabajadoresByZona(req.params.zonaId);
      res.json(trabajadores);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener trabajadores de la zona" });
    }
  });

  app.get("/api/trabajadores/:id", async (req, res) => {
    try {
      const trabajador = await storage.getTrabajador(req.params.id);
      if (!trabajador) {
        return res.status(404).json({ error: "Trabajador no encontrado" });
      }
      
      // Validar acceso para Usuario: solo puede ver su propia ficha
      if (req.session.tipoAcceso === "Usuario" && req.session.trabajadorId !== req.params.id) {
        return res.status(403).json({ error: "No tiene permisos para ver este trabajador" });
      }
      
      // Validar acceso para Administrador: solo puede ver trabajadores de sus zonas
      if (req.session.tipoAcceso === "Administrador" && req.session.zonasIds) {
        if (!trabajador.zonaId || !req.session.zonasIds.includes(trabajador.zonaId)) {
          return res.status(403).json({ error: "No tiene permisos para ver este trabajador" });
        }
      }
      
      res.json(trabajador);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener trabajador" });
    }
  });

  app.post("/api/trabajadores", async (req, res) => {
    try {
      // Bloquear creación para usuarios tipo Usuario
      if (req.session.tipoAcceso === "Usuario") {
        return res.status(403).json({ error: "No tiene permisos para crear trabajadores" });
      }
      
      const data = insertTrabajadorSchema.parse(req.body);
      const trabajador = await storage.createTrabajador(data);
      res.status(201).json(trabajador);
    } catch (error) {
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.patch("/api/trabajadores/:id", async (req, res) => {
    try {
      const baseSchema = createInsertSchema(trabajadores).omit({ id: true }).extend({
        categoria: z.enum(CATEGORIAS).optional(),
        dni: z.string().min(1, "DNI es requerido").optional(),
        nombreCompleto: z.string().min(1, "Nombre completo es requerido").optional(),
        fechaNacimiento: z.string().min(1, "Fecha de nacimiento es requerida").optional(),
        fechaIncorporacion: z.preprocess(val => val === "" ? undefined : val, z.string().optional()).optional(),
        email: z.preprocess(val => val === "" ? undefined : val, z.string().email("Email inválido").optional()).optional(),
        zonaId: z.preprocess(val => val === "" ? undefined : val, z.string().optional()).optional(),
        fichaEvaluacionRiesgosUrl: z.preprocess(val => val === "" ? undefined : val, z.string().optional()).optional(),
      }).partial();
      
      const data = baseSchema.parse(req.body);
      
      const trabajador = await storage.updateTrabajador(req.params.id, data);
      if (!trabajador) {
        return res.status(404).json({ error: "Trabajador no encontrado" });
      }
      res.json(trabajador);
    } catch (error) {
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.delete("/api/trabajadores/:id", async (req, res) => {
    try {
      await storage.deleteTrabajador(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar trabajador" });
    }
  });

  // EPIs routes
  app.get("/api/epis", async (req, res) => {
    try {
      const tipoAcceso = req.session.tipoAcceso;
      const zonasIds = req.session.zonasIds;
      const trabajadorId = req.session.trabajadorId;
      let epis: any[] = [];
      
      if (tipoAcceso === "AdminGral") {
        epis = await storage.getEpis();
      } else if (tipoAcceso === "Administrador" && zonasIds) {
        epis = await storage.getEpisByZonas(zonasIds);
      } else if (tipoAcceso === "Usuario" && trabajadorId) {
        // Usuario solo ve sus propios EPIs
        epis = await storage.getEpisByTrabajador(trabajadorId);
      }
      
      res.json(epis);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener EPIs" });
    }
  });

  app.get("/api/epis/:id", async (req, res) => {
    try {
      const epi = await storage.getEpi(req.params.id);
      if (!epi) {
        return res.status(404).json({ error: "EPI no encontrado" });
      }
      
      // Validar acceso para Usuario: solo puede ver sus propios EPIs
      if (req.session.tipoAcceso === "Usuario" && req.session.trabajadorId !== epi.trabajadorId) {
        return res.status(403).json({ error: "No tiene permisos para ver este EPI" });
      }
      
      // Validar acceso para Administrador: solo puede ver EPIs de trabajadores de sus zonas
      if (req.session.tipoAcceso === "Administrador" && req.session.zonasIds) {
        const trabajador = await storage.getTrabajador(epi.trabajadorId);
        if (!trabajador || !trabajador.zonaId || !req.session.zonasIds.includes(trabajador.zonaId)) {
          return res.status(403).json({ error: "No tiene permisos para ver este EPI" });
        }
      }
      
      res.json(epi);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener EPI" });
    }
  });

  app.get("/api/trabajadores/:id/epis", async (req, res) => {
    try {
      const epis = await storage.getEpisByTrabajador(req.params.id);
      res.json(epis);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener EPIs del trabajador" });
    }
  });

  app.post("/api/epis", async (req, res) => {
    try {
      // Bloquear creación para usuarios tipo Usuario
      if (req.session.tipoAcceso === "Usuario") {
        return res.status(403).json({ error: "No tiene permisos para crear EPIs" });
      }
      
      const data = insertEpiSchema.parse(req.body);
      const epi = await storage.createEpi(data);
      res.status(201).json(epi);
    } catch (error) {
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.patch("/api/epis/:id", async (req, res) => {
    try {
      const partialSchema = insertEpiSchema.partial();
      const data = partialSchema.parse(req.body);
      const epi = await storage.updateEpi(req.params.id, data);
      if (!epi) {
        return res.status(404).json({ error: "EPI no encontrado" });
      }
      res.json(epi);
    } catch (error) {
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.patch("/api/epis/:id/firma", async (req, res) => {
    try {
      const { firmaUrl } = req.body;
      
      // Construir objeto de actualización condicionalmente
      let updateData: Partial<InsertEpi>;
      
      // Si firmaUrl está vacío, se borra la firma (null)
      // Si tiene valor, se normaliza antes de guardar
      if (firmaUrl && firmaUrl.trim() !== "") {
        // Normalizar la URL de la firma antes de guardarla
        // Esto convierte la URL firmada temporal a una ruta persistente (/objects/...)
        const objectStorageService = new ObjectStorageService();
        const firmaNormalizada = objectStorageService.normalizeObjectEntityPath(firmaUrl);
        updateData = { firmaUrl: firmaNormalizada };
      } else {
        // Para borrar la firma, usamos null con un cast explícito
        updateData = { firmaUrl: null as any };
      }
      
      const epi = await storage.updateEpi(req.params.id, updateData);
      
      if (!epi) {
        return res.status(404).json({ error: "EPI no encontrado" });
      }
      
      res.json(epi);
    } catch (error) {
      console.error("Error updating EPI firma:", error);
      res.status(400).json({ error: "Error al actualizar firma" });
    }
  });

  app.delete("/api/epis/:id", async (req, res) => {
    try {
      await storage.deleteEpi(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar EPI" });
    }
  });

  // Cursos routes
  app.get("/api/cursos", async (req, res) => {
    try {
      const tipoAcceso = req.session.tipoAcceso;
      const zonasIds = req.session.zonasIds;
      const trabajadorId = req.session.trabajadorId;
      let cursos: any[] = [];
      
      if (tipoAcceso === "AdminGral") {
        cursos = await storage.getCursos();
      } else if (tipoAcceso === "Administrador" && zonasIds) {
        cursos = await storage.getCursosByZonas(zonasIds);
      } else if (tipoAcceso === "Usuario" && trabajadorId) {
        // Usuario solo ve sus propios cursos
        cursos = await storage.getCursosByTrabajador(trabajadorId);
      }
      
      res.json(cursos);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener cursos" });
    }
  });

  app.get("/api/cursos/:id", async (req, res) => {
    try {
      const curso = await storage.getCurso(req.params.id);
      if (!curso) {
        return res.status(404).json({ error: "Curso no encontrado" });
      }
      
      // Validar acceso para Usuario: solo puede ver sus propios cursos
      if (req.session.tipoAcceso === "Usuario" && req.session.trabajadorId !== curso.trabajadorId) {
        return res.status(403).json({ error: "No tiene permisos para ver este curso" });
      }
      
      // Validar acceso para Administrador: solo puede ver cursos de trabajadores de sus zonas
      if (req.session.tipoAcceso === "Administrador" && req.session.zonasIds) {
        const trabajador = await storage.getTrabajador(curso.trabajadorId);
        if (!trabajador || !trabajador.zonaId || !req.session.zonasIds.includes(trabajador.zonaId)) {
          return res.status(403).json({ error: "No tiene permisos para ver este curso" });
        }
      }
      
      res.json(curso);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener curso" });
    }
  });

  app.get("/api/trabajadores/:id/cursos", async (req, res) => {
    try {
      const cursos = await storage.getCursosByTrabajador(req.params.id);
      res.json(cursos);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener cursos del trabajador" });
    }
  });

  app.post("/api/cursos", async (req, res) => {
    try {
      // Bloquear creación para usuarios tipo Usuario
      if (req.session.tipoAcceso === "Usuario") {
        return res.status(403).json({ error: "No tiene permisos para crear cursos" });
      }
      
      const data = insertCursoSchema.parse(req.body);
      const curso = await storage.createCurso(data);
      res.status(201).json(curso);
    } catch (error) {
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.patch("/api/cursos/:id", async (req, res) => {
    try {
      const partialSchema = insertCursoSchema.partial();
      const data = partialSchema.parse(req.body);
      const curso = await storage.updateCurso(req.params.id, data);
      if (!curso) {
        return res.status(404).json({ error: "Curso no encontrado" });
      }
      res.json(curso);
    } catch (error) {
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.delete("/api/cursos/:id", async (req, res) => {
    try {
      await storage.deleteCurso(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar curso" });
    }
  });

  // Endpoint para firmar Comisión de Servicio
  app.post("/api/cursos/:id/sign-comision", async (req, res) => {
    try {
      const { firmaDataUrl } = req.body;
      
      if (!firmaDataUrl) {
        return res.status(400).json({ error: "Se requiere la firma" });
      }

      const curso = await storage.getCurso(req.params.id);
      if (!curso) {
        return res.status(404).json({ error: "Curso no encontrado" });
      }

      // Verificar autorización: solo el trabajador del curso o administradores pueden firmar
      const tipoAcceso = req.session.tipoAcceso;
      const trabajadorId = req.session.trabajadorId;
      
      if (tipoAcceso === "Usuario") {
        // Usuario solo puede firmar sus propios cursos
        if (trabajadorId !== curso.trabajadorId) {
          return res.status(403).json({ error: "No tiene permisos para firmar este curso" });
        }
      } else if (tipoAcceso === "Administrador") {
        // Administrador solo puede firmar cursos de trabajadores de sus zonas
        const trabajador = await storage.getTrabajador(curso.trabajadorId);
        if (!trabajador) {
          return res.status(404).json({ error: "Trabajador no encontrado" });
        }
        
        const zonasIds = req.session.zonasIds;
        if (!zonasIds || !trabajador.zonaId || !zonasIds.includes(trabajador.zonaId)) {
          return res.status(403).json({ error: "No tiene permisos para firmar cursos de esta zona" });
        }
      }
      // AdminGral puede firmar cualquier curso

      if (!curso.comisionServicioUrl) {
        return res.status(400).json({ error: "Este curso no tiene Comisión de Servicio" });
      }

      if (curso.comisionServicioFirmadoUrl) {
        return res.status(400).json({ error: "La Comisión de Servicio ya está firmada" });
      }

      const { signPdfWithSignature } = await import("./pdfProcessor");
      const objectStorageService = new ObjectStorageService();

      const result = await signPdfWithSignature(
        curso.comisionServicioUrl,
        firmaDataUrl,
        objectStorageService
      );

      await storage.updateCurso(req.params.id, {
        comisionServicioFirmadoUrl: result.signedPdfPath,
        firmaUrl: result.signaturePath,
      });

      res.json({ 
        success: true, 
        comisionServicioFirmadoUrl: result.signedPdfPath,
        firmaUrl: result.signaturePath 
      });
    } catch (error) {
      console.error("Error signing Comisión de Servicio:", error);
      res.status(500).json({ error: "Error al firmar el documento" });
    }
  });

  // Eliminar Comisión de Servicio (solo Administrador y AdminGral)
  app.delete("/api/cursos/:id/comision", async (req, res) => {
    try {
      const curso = await storage.getCurso(req.params.id);
      if (!curso) {
        return res.status(404).json({ error: "Curso no encontrado" });
      }

      const tipoAcceso = req.session.tipoAcceso;

      // Solo Administrador y AdminGral pueden eliminar la comisión
      if (tipoAcceso === "Usuario") {
        return res.status(403).json({ error: "No tiene permisos para eliminar la Comisión de Servicio" });
      }

      // Validar acceso para Administrador: solo puede eliminar comisiones de cursos de trabajadores de sus zonas
      if (tipoAcceso === "Administrador" && req.session.zonasIds) {
        const trabajador = await storage.getTrabajador(curso.trabajadorId);
        if (!trabajador || !trabajador.zonaId || !req.session.zonasIds.includes(trabajador.zonaId)) {
          return res.status(403).json({ error: "No tiene permisos para modificar cursos de esta zona" });
        }
      }

      // Resetear los campos de comisión de servicio usando SQL directo
      await storage.resetComisionServicio(req.params.id);

      res.json({ success: true, message: "Comisión de Servicio eliminada correctamente" });
    } catch (error) {
      console.error("Error deleting Comisión de Servicio:", error);
      res.status(500).json({ error: "Error al eliminar la Comisión de Servicio" });
    }
  });

  // Accidentes routes
  app.get("/api/accidentes", async (req, res) => {
    try {
      const tipoAcceso = req.session.tipoAcceso;
      const zonasIds = req.session.zonasIds;
      const trabajadorId = req.session.trabajadorId;
      let accidentes: any[] = [];
      
      if (tipoAcceso === "AdminGral") {
        accidentes = await storage.getAccidentes();
      } else if (tipoAcceso === "Administrador" && zonasIds) {
        accidentes = await storage.getAccidentesByZonas(zonasIds);
      } else if (tipoAcceso === "Usuario" && trabajadorId) {
        // Usuario solo ve sus propios accidentes
        accidentes = await storage.getAccidentesByTrabajador(trabajadorId);
      }
      
      res.json(accidentes);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener accidentes" });
    }
  });

  app.get("/api/accidentes/:id", async (req, res) => {
    try {
      const accidente = await storage.getAccidente(req.params.id);
      if (!accidente) {
        return res.status(404).json({ error: "Accidente no encontrado" });
      }
      
      // Validar acceso para Usuario: solo puede ver sus propios accidentes
      if (req.session.tipoAcceso === "Usuario" && req.session.trabajadorId !== accidente.trabajadorId) {
        return res.status(403).json({ error: "No tiene permisos para ver este accidente" });
      }
      
      // Validar acceso para Administrador: solo puede ver accidentes de trabajadores de sus zonas
      if (req.session.tipoAcceso === "Administrador" && req.session.zonasIds) {
        const trabajador = await storage.getTrabajador(accidente.trabajadorId);
        if (!trabajador || !trabajador.zonaId || !req.session.zonasIds.includes(trabajador.zonaId)) {
          return res.status(403).json({ error: "No tiene permisos para ver este accidente" });
        }
      }
      
      res.json(accidente);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener accidente" });
    }
  });

  app.get("/api/trabajadores/:id/accidentes", async (req, res) => {
    try {
      const accidentes = await storage.getAccidentesByTrabajador(req.params.id);
      res.json(accidentes);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener accidentes del trabajador" });
    }
  });

  app.post("/api/accidentes", async (req, res) => {
    try {
      // Bloquear creación para usuarios tipo Usuario
      if (req.session.tipoAcceso === "Usuario") {
        return res.status(403).json({ error: "No tiene permisos para crear accidentes" });
      }
      
      const data = insertAccidenteSchema.parse(req.body);
      const accidente = await storage.createAccidente(data);
      res.status(201).json(accidente);
    } catch (error) {
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.patch("/api/accidentes/:id", async (req, res) => {
    try {
      const partialSchema = insertAccidenteSchema.partial();
      const data = partialSchema.parse(req.body);
      const accidente = await storage.updateAccidente(req.params.id, data);
      if (!accidente) {
        return res.status(404).json({ error: "Accidente no encontrado" });
      }
      res.json(accidente);
    } catch (error) {
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.delete("/api/accidentes/:id", async (req, res) => {
    try {
      await storage.deleteAccidente(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar accidente" });
    }
  });

  // Accidente Documentos routes
  app.get("/api/accidente-documentos/:accidenteId", async (req, res) => {
    try {
      // Validar acceso al accidente
      const accidente = await storage.getAccidente(req.params.accidenteId);
      if (!accidente) {
        return res.status(404).json({ error: "Accidente no encontrado" });
      }
      
      // Validar acceso para Usuario: solo puede ver documentos de sus propios accidentes
      if (req.session.tipoAcceso === "Usuario" && req.session.trabajadorId !== accidente.trabajadorId) {
        return res.status(403).json({ error: "No tiene permisos para ver estos documentos" });
      }
      
      // Validar acceso para Administrador: solo puede ver documentos de accidentes de trabajadores de sus zonas
      if (req.session.tipoAcceso === "Administrador" && req.session.zonasIds) {
        const trabajador = await storage.getTrabajador(accidente.trabajadorId);
        if (!trabajador || !trabajador.zonaId || !req.session.zonasIds.includes(trabajador.zonaId)) {
          return res.status(403).json({ error: "No tiene permisos para ver estos documentos" });
        }
      }
      
      const documentos = await storage.getAccidenteDocumentos(req.params.accidenteId);
      res.json(documentos);
    } catch (error) {
      console.error("Error getting accidente documents:", error);
      res.status(500).json({ error: "Error al obtener documentos" });
    }
  });

  app.post("/api/accidente-documentos", async (req, res) => {
    try {
      const data = insertAccidenteDocumentoSchema.parse(req.body);
      
      // Validar acceso al accidente
      const accidente = await storage.getAccidente(data.accidenteId);
      if (!accidente) {
        return res.status(404).json({ error: "Accidente no encontrado" });
      }
      
      // Bloquear creación para usuarios tipo Usuario
      if (req.session.tipoAcceso === "Usuario") {
        return res.status(403).json({ error: "No tiene permisos para subir documentos" });
      }
      
      // Validar acceso para Administrador: solo puede añadir documentos a accidentes de trabajadores de sus zonas
      if (req.session.tipoAcceso === "Administrador" && req.session.zonasIds) {
        const trabajador = await storage.getTrabajador(accidente.trabajadorId);
        if (!trabajador || !trabajador.zonaId || !req.session.zonasIds.includes(trabajador.zonaId)) {
          return res.status(403).json({ error: "No tiene permisos para añadir documentos a este accidente" });
        }
      }
      
      const objectStorageService = new ObjectStorageService();
      
      // Normalizar la ruta del archivo si viene como URL completa
      const rutaNormalizada = objectStorageService.normalizeObjectEntityPath(data.rutaArchivo);
      
      const documento = await storage.createAccidenteDocumento({
        ...data,
        rutaArchivo: rutaNormalizada
      });
      
      res.status(201).json(documento);
    } catch (error) {
      console.error("Error creating accidente document:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Datos inválidos", details: error.errors });
      }
      res.status(500).json({ error: "Error al crear documento" });
    }
  });

  app.delete("/api/accidente-documentos/:id", async (req, res) => {
    try {
      // Bloquear eliminación para usuarios tipo Usuario
      if (req.session.tipoAcceso === "Usuario") {
        return res.status(403).json({ error: "No tiene permisos para eliminar documentos" });
      }
      
      await storage.deleteAccidenteDocumento(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting accidente document:", error);
      res.status(500).json({ error: "Error al eliminar documento" });
    }
  });

  // Object Storage routes (Reference: blueprint:javascript_object_storage)
  // Sirve objetos/documentos almacenados (público para simplificar acceso)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Obtiene URL de subida para un nuevo documento
  app.post("/api/objects/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const { uploadURL, objectPath } = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL, objectPath });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Error al obtener URL de subida" });
    }
  });

  // EPI Documentos routes
  // Crea un registro de documento después de subirlo al object storage
  app.post("/api/epi-documentos", async (req, res) => {
    try {
      const data = insertEpiDocumentoSchema.parse(req.body);
      const objectStorageService = new ObjectStorageService();
      
      // Normalizar la ruta del archivo si viene como URL completa
      const rutaNormalizada = objectStorageService.normalizeObjectEntityPath(data.rutaArchivo);
      
      const documento = await storage.createEpiDocumento({
        ...data,
        rutaArchivo: rutaNormalizada
      });
      
      res.status(201).json(documento);
    } catch (error) {
      console.error("Error creating EPI document:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  // Obtiene todos los documentos de un EPI
  app.get("/api/epis/:epiId/documentos", async (req, res) => {
    try {
      const documentos = await storage.getEpiDocumentos(req.params.epiId);
      res.json(documentos);
    } catch (error) {
      console.error("Error getting EPI documents:", error);
      res.status(500).json({ error: "Error al obtener documentos" });
    }
  });

  // Elimina un documento
  app.delete("/api/epi-documentos/:id", async (req, res) => {
    try {
      await storage.deleteEpiDocumento(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting EPI document:", error);
      res.status(500).json({ error: "Error al eliminar documento" });
    }
  });

  // Curso Documentos routes
  // Crea un registro de documento de curso después de subirlo al object storage
  app.post("/api/curso-documentos", async (req, res) => {
    try {
      const data = insertCursoDocumentoSchema.parse(req.body);
      const objectStorageService = new ObjectStorageService();
      
      // Normalizar la ruta del archivo si viene como URL completa
      const rutaNormalizada = objectStorageService.normalizeObjectEntityPath(data.rutaArchivo);
      
      const documento = await storage.createCursoDocumento({
        ...data,
        rutaArchivo: rutaNormalizada
      });
      
      res.status(201).json(documento);
    } catch (error) {
      console.error("Error creating curso document:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  // Obtiene todos los documentos de un curso
  app.get("/api/cursos/:cursoId/documentos", async (req, res) => {
    try {
      const documentos = await storage.getCursoDocumentos(req.params.cursoId);
      res.json(documentos);
    } catch (error) {
      console.error("Error getting curso documents:", error);
      res.status(500).json({ error: "Error al obtener documentos" });
    }
  });

  // Elimina un documento de curso
  app.delete("/api/curso-documentos/:id", async (req, res) => {
    try {
      await storage.deleteCursoDocumento(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting curso document:", error);
      res.status(500).json({ error: "Error al eliminar documento" });
    }
  });

  // EPIs Fichas EV (Catálogo) routes
  app.get("/api/epis-fichas-ev", async (req, res) => {
    try {
      const fichas = await storage.getEpisFichasEv();
      res.json(fichas);
    } catch (error) {
      console.error("Error getting EPIs fichas EV:", error);
      res.status(500).json({ error: "Error al obtener fichas de EPIs" });
    }
  });

  app.get("/api/epis-fichas-ev/:id", async (req, res) => {
    try {
      const ficha = await storage.getEpiFichaEv(req.params.id);
      if (!ficha) {
        return res.status(404).json({ error: "Ficha de EPI no encontrada" });
      }
      res.json(ficha);
    } catch (error) {
      console.error("Error getting EPI ficha EV:", error);
      res.status(500).json({ error: "Error al obtener ficha de EPI" });
    }
  });

  app.post("/api/epis-fichas-ev", async (req, res) => {
    try {
      const data = insertEpiFichaEvSchema.parse(req.body);
      const ficha = await storage.createEpiFichaEv(data);
      res.status(201).json(ficha);
    } catch (error) {
      console.error("Error creating EPI ficha EV:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.patch("/api/epis-fichas-ev/:id", async (req, res) => {
    try {
      const data = insertEpiFichaEvSchema.partial().parse(req.body);
      const ficha = await storage.updateEpiFichaEv(req.params.id, data);
      if (!ficha) {
        return res.status(404).json({ error: "Ficha de EPI no encontrada" });
      }
      res.json(ficha);
    } catch (error) {
      console.error("Error updating EPI ficha EV:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.delete("/api/epis-fichas-ev/:id", async (req, res) => {
    try {
      await storage.deleteEpiFichaEv(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting EPI ficha EV:", error);
      res.status(500).json({ error: "Error al eliminar ficha de EPI" });
    }
  });

  // Zonas de Trabajo (Catálogo) routes
  app.get("/api/zonas-trabajo", async (req, res) => {
    try {
      const zonas = await storage.getZonasTrabajo();
      res.json(zonas);
    } catch (error) {
      console.error("Error getting zonas de trabajo:", error);
      res.status(500).json({ error: "Error al obtener zonas de trabajo" });
    }
  });

  app.get("/api/zonas-trabajo/:id", async (req, res) => {
    try {
      const zona = await storage.getZonaTrabajo(req.params.id);
      if (!zona) {
        return res.status(404).json({ error: "Zona de trabajo no encontrada" });
      }
      res.json(zona);
    } catch (error) {
      console.error("Error getting zona de trabajo:", error);
      res.status(500).json({ error: "Error al obtener zona de trabajo" });
    }
  });

  app.post("/api/zonas-trabajo", async (req, res) => {
    try {
      const data = insertZonaTrabajoSchema.parse(req.body);
      const zona = await storage.createZonaTrabajo(data);
      res.status(201).json(zona);
    } catch (error) {
      console.error("Error creating zona de trabajo:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.patch("/api/zonas-trabajo/:id", async (req, res) => {
    try {
      const data = insertZonaTrabajoSchema.partial().parse(req.body);
      const zona = await storage.updateZonaTrabajo(req.params.id, data);
      if (!zona) {
        return res.status(404).json({ error: "Zona de trabajo no encontrada" });
      }
      res.json(zona);
    } catch (error) {
      console.error("Error updating zona de trabajo:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.delete("/api/zonas-trabajo/:id", async (req, res) => {
    try {
      await storage.deleteZonaTrabajo(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting zona de trabajo:", error);
      res.status(500).json({ error: "Error al eliminar zona de trabajo" });
    }
  });

  // Usuarios routes
  app.get("/api/usuarios", async (req, res) => {
    try {
      const usuarios = await storage.getUsuarios();
      // Remove password from response
      const usuariosSinPassword = usuarios.map(({ password, ...usuario }) => usuario);
      res.json(usuariosSinPassword);
    } catch (error) {
      console.error("Error getting usuarios:", error);
      res.status(500).json({ error: "Error al obtener usuarios" });
    }
  });

  app.get("/api/usuarios/:id", async (req, res) => {
    try {
      const usuario = await storage.getUsuario(req.params.id);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      // Remove password from response
      const { password, ...usuarioSinPassword } = usuario;
      res.json(usuarioSinPassword);
    } catch (error) {
      console.error("Error getting usuario:", error);
      res.status(500).json({ error: "Error al obtener usuario" });
    }
  });

  app.post("/api/usuarios", async (req, res) => {
    try {
      const data = insertUsuarioSchema.parse(req.body);
      // Hash password before storing
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const usuario = await storage.createUsuario({
        ...data,
        password: hashedPassword,
      });
      // Remove password from response
      const { password, ...usuarioSinPassword } = usuario;
      res.status(201).json(usuarioSinPassword);
    } catch (error) {
      console.error("Error creating usuario:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.patch("/api/usuarios/:id", async (req, res) => {
    try {
      const data = insertUsuarioSchema.partial().parse(req.body);
      // Hash password if it's being updated
      let updateData = { ...data };
      if (data.password && data.password.trim() !== "") {
        updateData.password = await bcrypt.hash(data.password, 10);
      } else {
        // Remove password from update if it's empty (don't update it)
        delete updateData.password;
      }
      const usuario = await storage.updateUsuario(req.params.id, updateData);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      // Remove password from response
      const { password, ...usuarioSinPassword } = usuario;
      res.json(usuarioSinPassword);
    } catch (error) {
      console.error("Error updating usuario:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.delete("/api/usuarios/:id", async (req, res) => {
    try {
      await storage.deleteUsuario(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting usuario:", error);
      res.status(500).json({ error: "Error al eliminar usuario" });
    }
  });

  // Equipos routes
  app.get("/api/equipos", async (req, res) => {
    try {
      const tipoAcceso = req.session.tipoAcceso;
      const zonasIds = req.session.zonasIds;
      const trabajadorId = req.session.trabajadorId;
      let equipos: any[] = [];
      
      if (tipoAcceso === "AdminGral") {
        equipos = await storage.getEquipos();
      } else if (tipoAcceso === "Administrador" && zonasIds) {
        equipos = await storage.getEquiposByZonas(zonasIds);
      } else if (tipoAcceso === "Usuario" && trabajadorId) {
        // Usuario ve equipos de su zona
        const trabajador = await storage.getTrabajador(trabajadorId);
        if (trabajador && trabajador.zonaId) {
          equipos = await storage.getEquiposByZonas([trabajador.zonaId]);
        }
      }
      
      res.json(equipos);
    } catch (error) {
      console.error("Error getting equipos:", error);
      res.status(500).json({ error: "Error al obtener equipos" });
    }
  });

  app.get("/api/equipos/:id", async (req, res) => {
    try {
      const equipo = await storage.getEquipo(req.params.id);
      if (!equipo) {
        return res.status(404).json({ error: "Equipo no encontrado" });
      }
      
      // Validar acceso para Usuario: solo puede ver equipos de su zona
      if (req.session.tipoAcceso === "Usuario" && req.session.trabajadorId) {
        const trabajador = await storage.getTrabajador(req.session.trabajadorId);
        if (!trabajador || trabajador.zonaId !== equipo.zonaId) {
          return res.status(403).json({ error: "No tiene permisos para ver este equipo" });
        }
      }
      
      // Validar acceso para Administrador: solo puede ver equipos de sus zonas
      if (req.session.tipoAcceso === "Administrador" && req.session.zonasIds) {
        if (!equipo.zonaId || !req.session.zonasIds.includes(equipo.zonaId)) {
          return res.status(403).json({ error: "No tiene permisos para ver este equipo" });
        }
      }
      
      res.json(equipo);
    } catch (error) {
      console.error("Error getting equipo:", error);
      res.status(500).json({ error: "Error al obtener equipo" });
    }
  });

  app.post("/api/equipos", async (req, res) => {
    try {
      // Bloquear creación para usuarios tipo Usuario
      if (req.session.tipoAcceso === "Usuario") {
        return res.status(403).json({ error: "No tiene permisos para crear equipos" });
      }
      
      const data = insertEquipoSchema.parse(req.body);
      const equipo = await storage.createEquipo(data);
      res.status(201).json(equipo);
    } catch (error) {
      console.error("Error creating equipo:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.patch("/api/equipos/:id", async (req, res) => {
    try {
      const data = insertEquipoSchema.partial().parse(req.body);
      const equipo = await storage.updateEquipo(req.params.id, data);
      if (!equipo) {
        return res.status(404).json({ error: "Equipo no encontrado" });
      }
      res.json(equipo);
    } catch (error) {
      console.error("Error updating equipo:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.delete("/api/equipos/:id", async (req, res) => {
    try {
      await storage.deleteEquipo(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting equipo:", error);
      res.status(500).json({ error: "Error al eliminar equipo" });
    }
  });

  // Equipos EPIs Obligatorios routes
  app.get("/api/equipos/:equipoId/epis-obligatorios", async (req, res) => {
    try {
      const epis = await storage.getEquipoEpisObligatorios(req.params.equipoId);
      res.json(epis);
    } catch (error) {
      console.error("Error getting equipo EPIs obligatorios:", error);
      res.status(500).json({ error: "Error al obtener EPIs obligatorios del equipo" });
    }
  });

  app.post("/api/equipos/:equipoId/epis-obligatorios", async (req, res) => {
    try {
      const { epiIds } = req.body;
      if (!Array.isArray(epiIds)) {
        return res.status(400).json({ error: "epiIds debe ser un array" });
      }
      await storage.setEquipoEpisObligatorios(req.params.equipoId, epiIds);
      res.status(200).json({ message: "EPIs obligatorios actualizados" });
    } catch (error) {
      console.error("Error setting equipo EPIs obligatorios:", error);
      res.status(400).json({ error: "Error al actualizar EPIs obligatorios" });
    }
  });

  // Mantenimientos de Equipos routes
  app.get("/api/equipos/:equipoId/mantenimientos", async (req, res) => {
    try {
      const mantenimientos = await storage.getMantenimientosEquipo(req.params.equipoId);
      res.json(mantenimientos);
    } catch (error) {
      console.error("Error getting mantenimientos:", error);
      res.status(500).json({ error: "Error al obtener mantenimientos" });
    }
  });

  app.post("/api/equipos/:equipoId/mantenimientos", async (req, res) => {
    try {
      const data = insertMantenimientoEquipoSchema.parse({
        ...req.body,
        equipoId: req.params.equipoId
      });
      
      // Normalizar la URL de la firma si existe
      let firmaNormalizada = data.firmaUrl;
      if (data.firmaUrl) {
        const objectStorageService = new ObjectStorageService();
        firmaNormalizada = objectStorageService.normalizeObjectEntityPath(data.firmaUrl);
      }
      
      const mantenimiento = await storage.createMantenimientoEquipo({
        ...data,
        firmaUrl: firmaNormalizada
      });
      res.status(201).json(mantenimiento);
    } catch (error) {
      console.error("Error creating mantenimiento:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.delete("/api/mantenimientos/:id", async (req, res) => {
    try {
      await storage.deleteMantenimientoEquipo(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting mantenimiento:", error);
      res.status(500).json({ error: "Error al eliminar mantenimiento" });
    }
  });

  // Fichas de Seguridad de Productos routes
  app.get("/api/fichas-seguridad-productos", async (req, res) => {
    try {
      const fichas = await storage.getFichasSeguridadProductos();
      res.json(fichas);
    } catch (error) {
      console.error("Error getting fichas seguridad productos:", error);
      res.status(500).json({ error: "Error al obtener fichas de seguridad" });
    }
  });

  app.get("/api/fichas-seguridad-productos/:id", async (req, res) => {
    try {
      const ficha = await storage.getFichaSeguridadProducto(req.params.id);
      if (!ficha) {
        return res.status(404).json({ error: "Ficha de seguridad no encontrada" });
      }
      res.json(ficha);
    } catch (error) {
      console.error("Error getting ficha seguridad producto:", error);
      res.status(500).json({ error: "Error al obtener ficha de seguridad" });
    }
  });

  app.post("/api/fichas-seguridad-productos", async (req, res) => {
    try {
      const data = insertFichaSeguridadProductoSchema.parse(req.body);
      const ficha = await storage.createFichaSeguridadProducto(data);
      res.status(201).json(ficha);
    } catch (error) {
      console.error("Error creating ficha seguridad producto:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.patch("/api/fichas-seguridad-productos/:id", async (req, res) => {
    try {
      const baseSchema = insertFichaSeguridadProductoSchema.partial();
      const data = baseSchema.parse(req.body);
      
      const ficha = await storage.updateFichaSeguridadProducto(req.params.id, data);
      if (!ficha) {
        return res.status(404).json({ error: "Ficha de seguridad no encontrada" });
      }
      res.json(ficha);
    } catch (error) {
      console.error("Error updating ficha seguridad producto:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.delete("/api/fichas-seguridad-productos/:id", async (req, res) => {
    try {
      await storage.deleteFichaSeguridadProducto(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting ficha seguridad producto:", error);
      res.status(500).json({ error: "Error al eliminar ficha de seguridad" });
    }
  });

  // Productos Químicos routes
  app.get("/api/productos-quimicos", async (req, res) => {
    try {
      const tipoAcceso = req.session.tipoAcceso;
      const zonasIds = req.session.zonasIds;
      let productos: any[] = [];
      
      if (tipoAcceso === "AdminGral") {
        productos = await storage.getProductosQuimicos();
      } else if (tipoAcceso === "Administrador" && zonasIds) {
        productos = await storage.getProductosQuimicosByZonas(zonasIds);
      } else if (tipoAcceso === "Usuario" && zonasIds) {
        productos = await storage.getProductosQuimicosByZonas(zonasIds);
      }
      
      res.json(productos);
    } catch (error) {
      console.error("Error getting productos quimicos:", error);
      res.status(500).json({ error: "Error al obtener productos químicos" });
    }
  });

  app.get("/api/productos-quimicos/:id", async (req, res) => {
    try {
      const producto = await storage.getProductoQuimico(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: "Producto químico no encontrado" });
      }
      
      // Validar acceso por zonas para Administrador y Usuario
      if ((req.session.tipoAcceso === "Administrador" || req.session.tipoAcceso === "Usuario") && req.session.zonasIds) {
        if (!producto.zonaId || !req.session.zonasIds.includes(producto.zonaId)) {
          return res.status(403).json({ error: "No tiene permisos para ver este producto químico" });
        }
      }
      
      res.json(producto);
    } catch (error) {
      console.error("Error getting producto quimico:", error);
      res.status(500).json({ error: "Error al obtener producto químico" });
    }
  });

  app.post("/api/productos-quimicos", async (req, res) => {
    try {
      const data = insertProductoQuimicoSchema.parse(req.body);
      
      // Validar acceso por zonas para Administrador y Usuario
      if ((req.session.tipoAcceso === "Administrador" || req.session.tipoAcceso === "Usuario") && req.session.zonasIds) {
        if (!data.zonaId || !req.session.zonasIds.includes(data.zonaId)) {
          return res.status(403).json({ error: "No tiene permisos para crear un producto químico en esta zona" });
        }
      }
      
      const producto = await storage.createProductoQuimico(data);
      res.status(201).json(producto);
    } catch (error) {
      console.error("Error creating producto quimico:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.patch("/api/productos-quimicos/:id", async (req, res) => {
    try {
      const baseSchema = insertProductoQuimicoSchema.partial();
      const data = baseSchema.parse(req.body);
      
      // Obtener producto existente para validar acceso
      const productoExistente = await storage.getProductoQuimico(req.params.id);
      if (!productoExistente) {
        return res.status(404).json({ error: "Producto químico no encontrado" });
      }
      
      // Validar acceso por zonas para Administrador y Usuario
      if ((req.session.tipoAcceso === "Administrador" || req.session.tipoAcceso === "Usuario") && req.session.zonasIds) {
        if (!productoExistente.zonaId || !req.session.zonasIds.includes(productoExistente.zonaId)) {
          return res.status(403).json({ error: "No tiene permisos para modificar este producto químico" });
        }
        // Validar que no se cambie a una zona no permitida
        if (data.zonaId && !req.session.zonasIds.includes(data.zonaId)) {
          return res.status(403).json({ error: "No tiene permisos para mover este producto a otra zona" });
        }
      }
      
      const producto = await storage.updateProductoQuimico(req.params.id, data);
      res.json(producto);
    } catch (error) {
      console.error("Error updating producto quimico:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.delete("/api/productos-quimicos/:id", async (req, res) => {
    try {
      // Obtener producto para validar acceso
      const producto = await storage.getProductoQuimico(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: "Producto químico no encontrado" });
      }
      
      // Validar acceso por zonas para Administrador y Usuario
      if ((req.session.tipoAcceso === "Administrador" || req.session.tipoAcceso === "Usuario") && req.session.zonasIds) {
        if (!producto.zonaId || !req.session.zonasIds.includes(producto.zonaId)) {
          return res.status(403).json({ error: "No tiene permisos para eliminar este producto químico" });
        }
      }
      
      await storage.deleteProductoQuimico(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting producto quimico:", error);
      res.status(500).json({ error: "Error al eliminar producto químico" });
    }
  });

  // Informes de Aceptación de Maquinaria routes
  app.get("/api/informes-aceptacion-maquinaria", async (req, res) => {
    try {
      const informes = await storage.getInformesAceptacionMaquinaria();
      res.json(informes);
    } catch (error) {
      console.error("Error getting informes aceptacion:", error);
      res.status(500).json({ error: "Error al obtener informes" });
    }
  });

  app.get("/api/informes-aceptacion-maquinaria/:id", async (req, res) => {
    try {
      const informe = await storage.getInformeAceptacionMaquinaria(req.params.id);
      if (!informe) {
        return res.status(404).json({ error: "Informe no encontrado" });
      }
      res.json(informe);
    } catch (error) {
      console.error("Error getting informe aceptacion:", error);
      res.status(500).json({ error: "Error al obtener informe" });
    }
  });

  app.post("/api/informes-aceptacion-maquinaria", async (req, res) => {
    try {
      const data = insertInformeAceptacionMaquinariaSchema.parse(req.body);
      const informe = await storage.createInformeAceptacionMaquinaria(data);
      res.status(201).json(informe);
    } catch (error) {
      console.error("Error creating informe aceptacion:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.delete("/api/informes-aceptacion-maquinaria/:id", async (req, res) => {
    try {
      await storage.deleteInformeAceptacionMaquinaria(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting informe aceptacion:", error);
      res.status(500).json({ error: "Error al eliminar informe" });
    }
  });

  // Documentos del Expediente Digitalizado routes
  app.get("/api/trabajadores/:trabajadorId/documentos-expediente", async (req, res) => {
    try {
      const documentos = await storage.getDocumentosExpediente(req.params.trabajadorId);
      res.json(documentos);
    } catch (error) {
      console.error("Error getting documentos expediente:", error);
      res.status(500).json({ error: "Error al obtener documentos" });
    }
  });

  app.get("/api/documentos-expediente/:id", async (req, res) => {
    try {
      const documento = await storage.getDocumentoExpediente(req.params.id);
      if (!documento) {
        return res.status(404).json({ error: "Documento no encontrado" });
      }
      res.json(documento);
    } catch (error) {
      console.error("Error getting documento expediente:", error);
      res.status(500).json({ error: "Error al obtener documento" });
    }
  });

  app.post("/api/documentos-expediente", async (req, res) => {
    try {
      const data = insertDocumentoExpedienteSchema.parse(req.body);
      const objectStorageService = new ObjectStorageService();
      
      // Normalizar la ruta del archivo si viene como URL completa
      const rutaNormalizada = objectStorageService.normalizeObjectEntityPath(data.archivoUrl);
      
      const documento = await storage.createDocumentoExpediente({
        ...data,
        archivoUrl: rutaNormalizada
      });
      
      res.status(201).json(documento);
    } catch (error) {
      console.error("Error creating documento expediente:", error);
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.delete("/api/documentos-expediente/:id", async (req, res) => {
    try {
      await storage.deleteDocumentoExpediente(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting documento expediente:", error);
      res.status(500).json({ error: "Error al eliminar documento" });
    }
  });

  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { nombreUsuario, password } = req.body;
      
      if (!nombreUsuario || !password) {
        return res.status(400).json({ error: "Usuario y contraseña son requeridos" });
      }

      const usuario = await storage.getUsuarioByNombre(nombreUsuario);
      if (!usuario) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      const validPassword = await bcrypt.compare(password, usuario.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      // Store user info in session
      req.session.userId = usuario.id;
      req.session.nombreUsuario = usuario.nombreUsuario;
      req.session.tipoAcceso = usuario.tipoAcceso;
      req.session.zonasIds = usuario.zonasIds || [];

      // Para usuarios tipo "Usuario", buscar su trabajador asociado por email
      if (usuario.tipoAcceso === "Usuario") {
        const trabajador = await storage.getTrabajadorByEmail(usuario.nombreUsuario);
        if (trabajador) {
          req.session.trabajadorId = trabajador.id;
        }
      }

      res.json({
        id: usuario.id,
        nombreUsuario: usuario.nombreUsuario,
        email: usuario.email,
        tipoAcceso: usuario.tipoAcceso,
        zonasIds: usuario.zonasIds,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Error al iniciar sesión" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Error al cerrar sesión" });
      }
      res.json({ message: "Sesión cerrada" });
    });
  });

  app.get("/api/auth/session", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "No hay sesión activa" });
    }

    try {
      const usuario = await storage.getUsuario(req.session.userId);
      if (!usuario) {
        req.session.destroy(() => {});
        return res.status(401).json({ error: "Usuario no encontrado" });
      }

      // Para usuarios tipo "Usuario", buscar su trabajador asociado si no está en sesión
      if (usuario.tipoAcceso === "Usuario" && !req.session.trabajadorId) {
        const trabajador = await storage.getTrabajadorByEmail(usuario.nombreUsuario);
        if (trabajador) {
          req.session.trabajadorId = trabajador.id;
        }
      }

      res.json({
        id: usuario.id,
        nombreUsuario: usuario.nombreUsuario,
        email: usuario.email,
        tipoAcceso: usuario.tipoAcceso,
        zonasIds: usuario.zonasIds,
        trabajadorId: req.session.trabajadorId,
      });
    } catch (error) {
      console.error("Session check error:", error);
      res.status(500).json({ error: "Error al verificar sesión" });
    }
  });

  app.post("/api/auth/change-password", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "No hay sesión activa" });
    }

    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Contraseña actual y nueva son requeridas" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: "La nueva contraseña debe tener al menos 6 caracteres" });
      }

      const usuario = await storage.getUsuario(req.session.userId);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      const validPassword = await bcrypt.compare(currentPassword, usuario.password);
      if (!validPassword) {
        return res.status(401).json({ error: "Contraseña actual incorrecta" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUsuario(req.session.userId, { password: hashedPassword });

      res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ error: "Error al cambiar la contraseña" });
    }
  });

  // Dashboard para usuarios tipo Usuario
  app.get("/api/dashboard/usuario", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "No autorizado" });
    }

    try {
      const usuario = await storage.getUsuario(req.session.userId);
      
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // Buscar trabajador asociado por email
      let trabajador = null;
      if (usuario.email) {
        trabajador = await storage.getTrabajadorByEmail(usuario.email);
      }
      
      // Si no se encuentra por email, intentar por nombreUsuario
      if (!trabajador && usuario.nombreUsuario) {
        trabajador = await storage.getTrabajadorByEmail(usuario.nombreUsuario);
      }

      if (!trabajador) {
        return res.status(404).json({ error: "No se encontró trabajador asociado" });
      }

      const dashboardData = await storage.getDashboardData(trabajador.id);
      res.json(dashboardData);
    } catch (error) {
      console.error("Error getting dashboard data:", error);
      res.status(500).json({ error: "Error al obtener datos del dashboard" });
    }
  });

  // Obtener el último accidente global (para administradores)
  app.get("/api/dashboard/ultimo-accidente", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "No autorizado" });
    }

    try {
      const usuario = await storage.getUsuario(req.session.userId);
      
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // Solo administradores pueden ver esta información
      if (usuario.tipoAcceso === "Usuario") {
        return res.status(403).json({ error: "No autorizado" });
      }

      const ultimoAccidente = await storage.getUltimoAccidenteGlobal();
      res.json({ ultimoAccidente });
    } catch (error) {
      console.error("Error getting ultimo accidente:", error);
      res.status(500).json({ error: "Error al obtener datos" });
    }
  });

  // Obtener nombre del usuario actual (para documentos firmados por administradores)
  app.get("/api/current-user-name", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "No autorizado" });
    }

    try {
      const usuario = await storage.getUsuario(req.session.userId);
      
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // Si el usuario tiene email, intentar buscar en trabajadores
      if (usuario.email) {
        const trabajador = await storage.getTrabajadorByEmail(usuario.email);
        
        if (trabajador) {
          return res.json({ nombreCompleto: trabajador.nombreCompleto });
        }
      }

      // Si el usuario no tiene email o no se encuentra en trabajadores,
      // también intentar buscar por nombreUsuario (que puede ser el email)
      if (usuario.nombreUsuario) {
        const trabajador = await storage.getTrabajadorByEmail(usuario.nombreUsuario);
        
        if (trabajador) {
          return res.json({ nombreCompleto: trabajador.nombreCompleto });
        }
      }

      // Como último recurso, usar nombreUsuario del usuario
      return res.json({ nombreCompleto: usuario.nombreUsuario || null });
    } catch (error) {
      console.error("Error getting current user name:", error);
      res.status(500).json({ error: "Error al obtener nombre del usuario" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
