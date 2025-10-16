import "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: string;
    nombreUsuario?: string;
    tipoAcceso?: string;
    zonaId?: string | null;
  }
}
