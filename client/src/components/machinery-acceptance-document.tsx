import { format } from "date-fns";
import { es } from "date-fns/locale";
import logoPath from "@assets/logonuevoazul_1_1760345384948.png";

interface MachineryAcceptanceDocumentProps {
  trabajadorNombre: string;
  trabajadorDni: string;
  equipoNombre: string;
  equipoMarca: string;
  equipoModelo: string;
  equipoNumeroSerie: string;
  fechaAceptacion: string;
  observaciones?: string;
  nombreAdministrador?: string;
}

export function MachineryAcceptanceDocument({
  trabajadorNombre,
  trabajadorDni,
  equipoNombre,
  equipoMarca,
  equipoModelo,
  equipoNumeroSerie,
  fechaAceptacion,
  observaciones,
  nombreAdministrador,
}: MachineryAcceptanceDocumentProps) {
  const fechaFormateada = format(new Date(fechaAceptacion), "dd/MM/yyyy", {
    locale: es,
  });

  return (
    <div
      className="space-y-3 p-8 bg-background print:bg-white print:pt-0 print:pb-2 print:px-12 print:space-y-2"
      data-testid="documento-aceptacion-maquinaria"
    >
      {/* Membrete con logo */}
      <div className="mb-3 print:mb-6">
        <img
          src={logoPath}
          alt="Castilla-La Mancha"
          className="h-16 w-auto print:h-20"
          data-testid="logo-membrete"
        />
      </div>

      {/* Título */}
      <h1 className="text-2xl font-bold text-center my-8 print:text-lg print:my-16">
        DOCUMENTO DE ACEPTACIÓN DE USO DE MAQUINARIA/EQUIPO
      </h1>

      {/* Separar párrafo */}
      <div className="print:h-10"></div>

      {/* Datos del trabajador y fecha */}
      <div className="space-y-2 print:space-y-0.5">
        <p>
          <strong>D./Dª {trabajadorNombre}</strong>
        </p>
        <p>
          <strong>Fecha:</strong> {fechaFormateada}
        </p>
      </div>

      {/* Saludo */}
      <p className="mt-3 print:mt-1.5">Muy señor/a nuestro/a:</p>

      {/* Cuerpo del documento */}
      <div className="space-y-3 print:space-y-1.5">
        <p>
          Por medio del presente documento, se comunica la autorización para el uso del siguiente equipo/maquinaria:
        </p>

        <div className="my-6 print:my-4 print:py-3 space-y-2 print:space-y-1">
          <p className="text-center">
            <strong className="text-lg print:text-base uppercase">
              {equipoNombre}
            </strong>
          </p>
          <div className="text-center space-y-1 print:space-y-0.5">
            <p><strong>Marca:</strong> {equipoMarca}</p>
            <p><strong>Modelo:</strong> {equipoModelo}</p>
            <p><strong>Número de Serie:</strong> {equipoNumeroSerie}</p>
          </div>
        </div>

        <p>
          En cumplimiento de la Ley 31/1995 de 8 de noviembre, de Prevención de Riesgos Laborales, 
          y tras haber recibido la formación e información necesaria sobre los riesgos asociados 
          al uso de este equipo, se le autoriza para su utilización.
        </p>

        <p>Se hace constar la obligatoriedad de:</p>

        <div className="ml-6 space-y-1.5 print:space-y-0.5 print:ml-4">
          <p>
            <strong>a)</strong> Utilizar el equipo únicamente para las operaciones para las que ha sido diseñado 
            y para las que ha recibido formación específica.
          </p>
          <p>
            <strong>b)</strong> Seguir estrictamente las instrucciones de uso y las medidas de seguridad establecidas 
            en el manual del equipo.
          </p>
          <p>
            <strong>c)</strong> Utilizar los Equipos de Protección Individual (EPIs) obligatorios durante el manejo 
            del equipo.
          </p>
          <p>
            <strong>d)</strong> Comunicar inmediatamente cualquier anomalía, avería o situación de peligro 
            que se detecte en el equipo.
          </p>
          <p>
            <strong>e)</strong> No realizar modificaciones ni reparaciones del equipo sin autorización expresa.
          </p>
        </div>

        {observaciones && (
          <div className="mt-4 print:mt-2 p-3 print:p-2 border rounded-md">
            <p><strong>Observaciones:</strong></p>
            <p className="mt-1">{observaciones}</p>
          </div>
        )}

        <p className="mt-3 print:mt-2">Atentamente,</p>

        <div className="mt-4 print:mt-3 print:mb-12">
          <p className="print:mb-16">
            <strong>Firmado:</strong> {nombreAdministrador || "Administrador"}
          </p>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t-2 border-border my-6 print:my-3"></div>

      {/* Sección de aceptación del trabajador */}
      <div className="space-y-3 print:space-y-1.5">
        <p>
          D./Dª <strong>{trabajadorNombre}</strong> con D.N.I. nº{" "}
          <strong>{trabajadorDni}</strong> declara haber recibido la formación e información 
          necesaria para el uso seguro del equipo/maquinaria anteriormente descrito, 
          así como conocer los riesgos asociados a su utilización y las medidas preventivas a adoptar.
        </p>

        <p className="mt-2">
          Asimismo, se compromete a utilizar el equipo de forma responsable, siguiendo las 
          instrucciones recibidas y utilizando los EPIs correspondientes.
        </p>

        <div className="mt-8 print:mt-5">
          <p>
            <strong>Firmado:</strong> {trabajadorNombre}
          </p>
          <div className="border-b border-border w-64 mt-2 print:mt-3"></div>
        </div>
      </div>
    </div>
  );
}
