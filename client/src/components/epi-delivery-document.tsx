import { format } from "date-fns";
import { es } from "date-fns/locale";
import logoPath from "@assets/logonuevoazul_1_1760345384948.png";

interface EpiDeliveryDocumentProps {
  trabajadorNombre: string;
  trabajadorDni: string;
  fechaEntrega: string;
  tipoEquipo: string;
  nombreAdministrador?: string;
  firmaUrl?: string;
}

export function EpiDeliveryDocument({
  trabajadorNombre,
  trabajadorDni,
  fechaEntrega,
  tipoEquipo,
  nombreAdministrador,
  firmaUrl,
}: EpiDeliveryDocumentProps) {
  const fechaFormateada = format(new Date(fechaEntrega), "dd/MM/yyyy", {
    locale: es,
  });

  return (
    <div
      className="p-8 bg-background print:bg-white print:p-0 print:h-full print:flex"
      data-testid="documento-entrega"
    >
      {/* Contenedor con borde A4 */}
      <div className="border-2 border-black min-h-[600px] print:min-h-0 print:flex-1 print:flex print:flex-col">
        {/* Header dividido: Logo y Título */}
        <div className="grid grid-cols-[auto_1fr] border-b-2 border-black">
          {/* Logo - Cuadro izquierdo */}
          <div className="border-r-2 border-black p-4 flex items-center justify-center print:p-3">
            <img
              src={logoPath}
              alt="Castilla-La Mancha"
              className="h-20 w-auto print:h-16"
              data-testid="logo-membrete"
            />
          </div>

          {/* Título - Cuadro derecho */}
          <div className="p-4 flex items-center justify-center print:p-3">
            <h1 className="text-xl font-bold text-center print:text-base">
              ENTREGA DE EQUIPOS DE PROTECCIÓN INDIVIDUAL
            </h1>
          </div>
        </div>

        {/* Contenido del documento */}
        <div className="p-8 space-y-3 print:p-6 print:space-y-2">
          {/* Datos del trabajador y fecha */}
          <div className="space-y-2 print:space-y-1">
            <p>
              <strong>D./Dª {trabajadorNombre}</strong>
            </p>
            <p>
              <strong>Fecha:</strong> {fechaFormateada}
            </p>
          </div>

          {/* Saludo */}
          <p className="mt-3 print:mt-2">Muy señor/a nuestro/a:</p>

          {/* Cuerpo del documento */}
          <div className="space-y-3 print:space-y-2">
            <p>
              En cumplimiento del art. 17 de la Ley 31/1995 de 8 de noviembre, de
              Prevención de Riesgos Laborales, se hace entrega del siguiente equipo
              de protección individual:
            </p>

            <p className="text-center my-6 print:my-3 print:py-2">
              <strong className="text-lg print:text-base uppercase">
                {tipoEquipo}
              </strong>
            </p>

            <p>Asimismo, se le comunica la obligatoriedad de:</p>

            <div className="ml-6 space-y-1.5 print:space-y-1 print:ml-4">
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

            <div className="mt-4 print:mt-2 mb-8 print:mb-6">
              <p>
                <strong>Firmado:</strong> {nombreAdministrador || "Administrador"}
              </p>
            </div>
          </div>

          {/* Sección de reconocimiento del trabajador */}
          <div className="space-y-3 print:space-y-2 mt-8 print:mt-6">
            <p>
              D./Dª <strong>{trabajadorNombre}</strong> con D.N.I. nº{" "}
              <strong>{trabajadorDni}</strong> reconoce haber recibido el Equipo de
              Protección Individual anteriormente citado y haber sido informado de
              los trabajos y zonas en los que deberá utilizar dichos equipos, así
              como haber recibido las instrucciones para su correcto uso.
            </p>

            <div className="mt-6 print:mt-4">
              <p>
                <strong>Firmado:</strong> {trabajadorNombre}
              </p>
              {firmaUrl ? (
                <div className="mt-4 print:mt-3">
                  <img 
                    src={firmaUrl} 
                    alt="Firma digital del trabajador" 
                    className="h-20 print:h-16 border-b border-black"
                    data-testid="img-firma-documento"
                  />
                </div>
              ) : (
                <div className="border-b border-black w-64 mt-4 print:mt-3"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
