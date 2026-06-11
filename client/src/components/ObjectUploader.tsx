// Reference: blueprint:javascript_object_storage - File upload component
import { useState } from "react";
import type { ReactNode } from "react";
import Uppy from "@uppy/core";
import { DashboardModal } from "@uppy/react";
import AwsS3 from "@uppy/aws-s3";
import type { UploadResult } from "@uppy/core";
import { Button } from "@/components/ui/button";

// Importar estilos CSS de Uppy v4
import "@uppy/core/dist/style.min.css";
import "@uppy/dashboard/dist/style.min.css";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: (file: any) => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (
    result: UploadResult<Record<string, unknown>, Record<string, unknown>>
  ) => void;
  buttonClassName?: string;
  children: ReactNode;
}

/**
 * Componente de subida de archivos que se renderiza como un botón y proporciona
 * una interfaz modal para la gestión de archivos.
 * 
 * Características:
 * - Se renderiza como un botón personalizable que abre un modal de subida
 * - Proporciona una interfaz modal para:
 *   - Selección de archivos
 *   - Vista previa de archivos
 *   - Seguimiento del progreso de subida
 *   - Visualización del estado de subida
 * 
 * El componente usa Uppy internamente para manejar toda la funcionalidad de subida.
 * 
 * @param props - Propiedades del componente
 * @param props.maxNumberOfFiles - Número máximo de archivos permitidos (por defecto: 1)
 * @param props.maxFileSize - Tamaño máximo de archivo en bytes (por defecto: 10MB)
 * @param props.onGetUploadParameters - Función para obtener parámetros de subida (método y URL)
 * @param props.onComplete - Callback cuando la subida se completa
 * @param props.buttonClassName - Clase CSS opcional para el botón
 * @param props.children - Contenido a renderizar dentro del botón
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB por defecto
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  children,
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles,
        maxFileSize,
      },
      autoProceed: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: false,
        getUploadParameters: onGetUploadParameters,
      })
      .on("complete", (result) => {
        onComplete?.(result);
      })
  );

  return (
    <div>
      <Button type="button" onClick={() => setShowModal(true)} className={buttonClassName} data-testid="button-upload-document">
        {children}
      </Button>

      <DashboardModal
        uppy={uppy}
        open={showModal}
        onRequestClose={() => setShowModal(false)}
        proudlyDisplayPoweredByUppy={false}
      />
    </div>
  );
}
