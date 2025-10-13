import { format } from "date-fns";
import { es } from "date-fns/locale";
import logoPath from "@assets/logonuevoazul_1_1760345384948.png";

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
  const fechaFormateada = format(new Date(fechaEntrega), "dd/MM/yyyy", {
    locale: es,
  });

  return (
    <div
      className="space-y-3 p-8 bg-background print:bg-white print:pt-0 print:pb-2 print:px-12 print:space-y-2"
      data-testid="documento-entrega"
    >
      {/* Membrete con logo */}
      <div className="mb-3 print:mb-0.5">
        <img
          src={logoPath}
          alt="Castilla-La Mancha"
          className="h-20 w-auto print:h-20"
          data-testid="logo-membrete"
        />
      </div>

      {/* Título */}
      <h1 className="text-2xl font-bold text-center my-8 print:text-lg print:my-8">
        ENTREGA DE EQUIPOS DE PROTECCIÓN INDIVIDUAL
      </h1>

      {/* Datos del trabajador y fecha */}
      <div className="space-y-1 print:space-y-0.5">
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
          En cumplimiento del art. 17 de la Ley 31/1995 de 8 de noviembre, de
          Prevención de Riesgos Laborales, se hace entrega del siguiente equipo
          de protección individual:
        </p>

        <p className="text-center my-6 print:my-4 print:py-3">
          <strong className="text-lg print:text-base uppercase">
            {tipoEquipo}
          </strong>
        </p>

        <p>Asimismo, se le comunica la obligatoriedad de:</p>

        <div className="ml-6 space-y-1.5 print:space-y-0.5 print:ml-4">
          <p>
            <strong>a)</strong> Utilizar estos equipos durante la jornada de
            trabajo, en las áreas cuya obligatoriedad de uso se encuentra
            señalizada.
          </p>
          <p>
            <strong>b)</strong> Consultar cualquier duda sobre su correcta
            utilización, cuidando su perfecto estado y conservación.
          </p>
          <p>
            <strong>c)</strong> Solicitar un nuevo equipo en el caso de pérdida
            o deterioro del mismo.
          </p>
        </div>

        <p className="mt-3 print:mt-2">Atentamente,</p>

        <div className="mt-4 print:mt-3 print:mb-12">
          <p className="print:mb-16">
            <strong>Firmado:</strong> David Jiménez Minaya
          </p>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t-2 border-border my-6 print:my-3"></div>

      {/* Sección de reconocimiento del trabajador */}
      <div className="space-y-3 print:space-y-1.5">
        <p>
          D./Dª <strong>{trabajadorNombre}</strong> con D.N.I. nº{" "}
          <strong>{trabajadorDni}</strong> reconoce haber recibido el Equipo de
          Protección Individual anteriormente citado y haber sido informado de
          los trabajos y zonas en los que deberá utilizar dichos equipos, así
          como haber recibido las instrucciones para su correcto uso.
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
