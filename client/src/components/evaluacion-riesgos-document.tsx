import { format } from "date-fns";
import { es } from "date-fns/locale";

interface EvaluacionRiesgosDocumentProps {
  worker: {
    nombreCompleto: string;
    dni: string;
    categoria: string;
    fechaEntregaEvaluacion: string;
  };
}

export function EvaluacionRiesgosDocument({ worker }: EvaluacionRiesgosDocumentProps) {
  return (
    <div className="print-only bg-white text-black p-12 max-w-4xl mx-auto">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-only, .print-only * {
            visibility: visible;
          }
          .print-only {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page {
            margin: 2cm;
          }
        }
        @media screen {
          .print-only {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }
        }
      `}</style>

      <div className="space-y-8">
        {/* Título */}
        <div className="text-center border-b-2 border-black pb-4">
          <h1 className="text-2xl font-bold uppercase">
            ACREDITACIÓN DE RECEPCIÓN DE EVALUACIÓN DE RIESGOS LABORALES
          </h1>
        </div>

        {/* Datos del trabajador */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">Nombre y Apellidos:</span>
              <p className="border-b border-black mt-1">{worker.nombreCompleto}</p>
            </div>
            <div>
              <span className="font-semibold">DNI:</span>
              <p className="border-b border-black mt-1">{worker.dni}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-semibold">Categoría Profesional:</span>
              <p className="border-b border-black mt-1">{worker.categoria}</p>
            </div>
            <div>
              <span className="font-semibold">Fecha de Entrega:</span>
              <p className="border-b border-black mt-1">
                {format(new Date(worker.fechaEntregaEvaluacion), "dd/MM/yyyy", { locale: es })}
              </p>
            </div>
          </div>
        </div>

        {/* Texto legal */}
        <div className="space-y-4 text-justify leading-relaxed">
          <p>
            De conformidad con lo establecido en el artículo 18 de la{" "}
            <strong>Ley 31/1995, de 8 de noviembre, de Prevención de Riesgos Laborales</strong>,
            el trabajador/a arriba identificado/a declara haber recibido en la fecha indicada la
            documentación correspondiente a la <strong>Evaluación de Riesgos Laborales</strong> de
            su puesto de trabajo.
          </p>

          <div className="bg-gray-100 p-4 rounded border border-gray-300">
            <p className="font-semibold mb-2">El trabajador/a reconoce:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                Haber recibido información detallada sobre los riesgos existentes en su puesto de
                trabajo y las medidas preventivas a adoptar.
              </li>
              <li>
                Haber sido informado/a sobre las medidas de emergencia y evacuación aplicables al
                centro de trabajo.
              </li>
              <li>
                Conocer las obligaciones en materia de prevención de riesgos laborales y el deber
                de colaborar con la empresa en el cumplimiento de las mismas.
              </li>
            </ul>
          </div>

          <p className="text-sm text-gray-600 italic">
            El trabajador/a se compromete a utilizar correctamente los equipos de protección
            individual y colectiva puestos a su disposición, así como a informar de inmediato
            sobre cualquier situación que entrañe un riesgo para la seguridad y salud de los
            trabajadores.
          </p>
        </div>

        {/* Firma */}
        <div className="mt-16 pt-8 border-t border-gray-300">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-center mb-16">LA EMPRESA</p>
              <div className="border-b border-black"></div>
              <p className="text-center text-sm mt-2">Firma y sello</p>
            </div>
            <div>
              <p className="text-center mb-16">EL/LA TRABAJADOR/A</p>
              <div className="border-b border-black"></div>
              <p className="text-center text-sm mt-2">Firma</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
