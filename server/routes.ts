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
  insertEpiFichaEvSchema,
  insertZonaTrabajoSchema,
  insertUsuarioSchema,
  insertEquipoSchema,
  insertFichaSeguridadProductoSchema,
  trabajadores,
  CATEGORIAS
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

  // Upload/Download archivo de ficha de seguridad
  app.post("/api/fichas-seguridad-productos/:id/upload", async (req, res) => {
    try {
      const objectStorage = new ObjectStorageService();
      const { fileName, fileData } = req.body;
      
      if (!fileName || !fileData) {
        return res.status(400).json({ error: "Nombre de archivo y datos son requeridos" });
      }
      
      // Upload file to object storage
      const buffer = Buffer.from(fileData, 'base64');
      const filePath = `/fichas-seguridad/${req.params.id}/${fileName}`;
      await objectStorage.uploadFile(filePath, buffer, 'application/pdf');
      
      // Update ficha with file URL
      const fileUrl = `/objects${filePath}`;
      await storage.updateFichaSeguridadProducto(req.params.id, {
        archivoUrl: fileUrl,
        nombreArchivo: fileName
      });
      
      res.json({ url: fileUrl, fileName });
    } catch (error) {
      console.error("Error uploading ficha archivo:", error);
      res.status(500).json({ error: "Error al subir archivo" });
    }
  });

  app.get("/api/fichas-seguridad-productos/:id/download", async (req, res) => {
    try {
      const ficha = await storage.getFichaSeguridadProducto(req.params.id);
      if (!ficha || !ficha.archivoUrl) {
        return res.status(404).json({ error: "Archivo no encontrado" });
      }
      
      const objectStorage = new ObjectStorageService();
      const filePath = ficha.archivoUrl.replace('/objects', '');
      const fileBuffer = await objectStorage.downloadFile(filePath);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${ficha.nombreArchivo}"`);
      res.send(fileBuffer);
    } catch (error) {
      if (error instanceof ObjectNotFoundError) {
        return res.status(404).json({ error: "Archivo no encontrado" });
      }
      console.error("Error downloading ficha archivo:", error);
      res.status(500).json({ error: "Error al descargar archivo" });
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

  const httpServer = createServer(app);

  return httpServer;
}
