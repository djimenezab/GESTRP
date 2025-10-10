import { format } from "date-fns";
import { es } from "date-fns/locale";

interface EpiDeliveryDocumentProps {
  trabajadorNombre: string;
  trabajadorDni: string;
  fechaEntrega: string;
  tipoEquipo: string;
}

export function EpiDeliveryDocument({
  trabajadorNombre,
  trabajadorDni,
  fechaEntrega,
  tipoEquipo,
}: EpiDeliveryDocumentProps) {
  const fechaFormateada = format(new Date(fechaEntrega), "dd/MM/yyyy", { locale: es });

  return (
    <div className="space-y-6 p-8 bg-background print:p-12" data-testid="documento-entrega">
      {/* Título */}
      <h1 className="text-2xl font-bold text-center mb-8">
        ENTREGA DE EQUIPOS DE PROTECCIÓN INDIVIDUAL
      </h1>

      {/* Datos del trabajador y fecha */}
      <div className="space-y-2">
        <p>
          <strong>D./Dª {trabajadorNombre}</strong>
        </p>
        <p>
          <strong>Fecha:</strong> {fechaFormateada}
        </p>
      </div>

      {/* Saludo */}
      <p className="mt-6">Muy señor/a nuestro/a:</p>

      {/* Cuerpo del documento */}
      <div className="space-y-4">
        <p>
          En cumplimiento del art. 17 de la Ley 31/1995 de 8 de noviembre, de Prevención de Riesgos 
          Laborales, se hace entrega del siguiente equipo de protección individual:
        </p>

        <p className="text-center my-6">
          <strong className="text-lg uppercase">{tipoEquipo}</strong>
        </p>

        <p>Asimismo, se le comunica la obligatoriedad de:</p>

        <div className="ml-6 space-y-2">
          <p>
            <strong>a)</strong> Utilizar estos equipos durante la jornada de trabajo, en las áreas 
            cuya obligatoriedad de uso se encuentra señalizada.
          </p>
          <p>
            <strong>b)</strong> Consultar cualquier duda sobre su correcta utilización, cuidando su 
            perfecto estado y conservación.
          </p>
          <p>
            <strong>c)</strong> Solicitar un nuevo equipo en el caso de pérdida o deterioro del mismo.
          </p>
        </div>

        <p className="mt-6">Atentamente,</p>

        <div className="mt-8">
          <p>
            <strong>Firmado:</strong> David Jiménez Minaya
          </p>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t-2 border-border my-8"></div>

      {/* Sección de reconocimiento del trabajador */}
      <div className="space-y-4">
        <p>
          D./Dª <strong>{trabajadorNombre}</strong> con D.N.I. nº <strong>{trabajadorDni}</strong> reconoce 
          haber recibido el Equipo de Protección Individual anteriormente citado y haber sido informado 
          de los trabajos y zonas en los que deberá utilizar dichos equipos, así como haber recibido las 
          instrucciones para su correcto uso.
        </p>

        <div className="mt-12">
          <p>
            <strong>Firmado:</strong> {trabajadorNombre}
          </p>
          <div className="border-b border-border w-64 mt-2"></div>
        </div>
      </div>
    </div>
  );
}
