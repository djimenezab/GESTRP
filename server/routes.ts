import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertTrabajadorSchema,
  insertEpiSchema,
  insertCursoSchema,
  insertAccidenteSchema,
  insertEpiDocumentoSchema,
  insertEpiFichaEvSchema,
  trabajadores,
  CATEGORIAS
} from "@shared/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Trabajadores routes
  app.get("/api/trabajadores", async (req, res) => {
    try {
      const trabajadores = await storage.getTrabajadores();
      res.json(trabajadores);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener trabajadores" });
    }
  });

  app.get("/api/trabajadores/:id", async (req, res) => {
    try {
      const trabajador = await storage.getTrabajador(req.params.id);
      if (!trabajador) {
        return res.status(404).json({ error: "Trabajador no encontrado" });
      }
      res.json(trabajador);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener trabajador" });
    }
  });

  app.post("/api/trabajadores", async (req, res) => {
    try {
      const data = insertTrabajadorSchema.parse(req.body);
      const trabajador = await storage.createTrabajador(data);
      res.status(201).json(trabajador);
    } catch (error) {
      res.status(400).json({ error: "Datos inválidos" });
    }
  });

  app.patch("/api/trabajadores/:id", async (req, res) => {
    try {
      // For partial updates, we need to validate without the refine constraint
      // since we might not have all fields. We'll validate individual fields that are present.
      const baseSchema = createInsertSchema(trabajadores).omit({ id: true }).extend({
        categoria: z.enum(CATEGORIAS).optional(),
        dni: z.string().min(1, "DNI es requerido").optional(),
        nombreCompleto: z.string().min(1, "Nombre completo es requerido").optional(),
        fechaNacimiento: z.string().min(1, "Fecha de nacimiento es requerida").optional(),
        recibeEvaluacionRiesgos: z.boolean().optional(),
        fechaEntregaEvaluacion: z.preprocess(
          val => (val === "" || val === null) ? undefined : val, 
          z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha debe tener formato YYYY-MM-DD")
            .refine(val => !Number.isNaN(Date.parse(val)), "Fecha inválida")
            .optional()
        ).optional(),
      }).partial();
      
      const data = baseSchema.parse(req.body);
      
      // Load existing worker to validate final state
      const existing = await storage.getTrabajador(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Trabajador no encontrado" });
      }
      
      // Special case: when explicitly setting flag to true, require contemporaneous date in payload
      if (data.recibeEvaluacionRiesgos === true && data.fechaEntregaEvaluacion === undefined) {
        return res.status(400).json({ 
          error: "Debe proporcionar la fecha de entrega al marcar que recibe evaluación de riesgos" 
        });
      }
      
      // Apply auto-clear: when flag is explicitly set to false, clear the date
      if (data.recibeEvaluacionRiesgos === false) {
        (data as any).fechaEntregaEvaluacion = null;
      }
      
      // Calculate final state AFTER mutations (treat null as absence/undefined)
      const finalFlag = data.recibeEvaluacionRiesgos !== undefined 
        ? data.recibeEvaluacionRiesgos 
        : existing.recibeEvaluacionRiesgos;
      const finalDate = (data.fechaEntregaEvaluacion !== undefined && data.fechaEntregaEvaluacion !== null)
        ? data.fechaEntregaEvaluacion 
        : existing.fechaEntregaEvaluacion;
      
      // Validate final state invariant (bidirectional)
      if (finalFlag && !finalDate) {
        return res.status(400).json({ 
          error: "La fecha de entrega es requerida cuando se marca que recibe evaluación de riesgos" 
        });
      }
      if (!finalFlag && finalDate) {
        // If final flag is false but date exists, clear it
        (data as any).fechaEntregaEvaluacion = null;
      }
      
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
      const epis = await storage.getEpis();
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
      const cursos = await storage.getCursos();
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

  // Accidentes routes
  app.get("/api/accidentes", async (req, res) => {
    try {
      const accidentes = await storage.getAccidentes();
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
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
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

  const httpServer = createServer(app);

  return httpServer;
}
