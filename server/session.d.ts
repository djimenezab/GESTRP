import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    nombreUsuario?: string;
    tipoAcceso?: string;
    zonasIds?: string[];
    trabajadorId?: string;
  }
}
