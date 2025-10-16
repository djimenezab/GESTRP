import { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "No autenticado" });
  }
  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.session.userId || !req.session.tipoAcceso) {
      return res.status(401).json({ error: "No autenticado" });
    }

    if (!roles.includes(req.session.tipoAcceso)) {
      return res.status(403).json({ error: "No autorizado" });
    }

    next();
  };
}
